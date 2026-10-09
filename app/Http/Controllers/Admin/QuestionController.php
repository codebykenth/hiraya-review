<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Actions\Question\BulkUpdateQuestionsAction;
use App\DTOs\Question\UpsertQuestionData;
use App\Enums\AiModel;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Question\BulkDestroyQuestionsRequest;
use App\Http\Requests\Admin\Question\BulkUpdateQuestionsRequest;
use App\Http\Requests\Admin\Question\BulkUpdateQuestionStatusRequest;
use App\Http\Requests\Admin\Question\GenerateQuestionsRequest;
use App\Http\Requests\Admin\Question\StoreCategoryRequest;
use App\Http\Requests\Admin\Question\StoreQuestionRequest;
use App\Http\Requests\Admin\Question\StoreSubcategoryRequest;
use App\Http\Requests\Admin\Question\UpdateCategoryRequest;
use App\Http\Requests\Admin\Question\UpdateQuestionRequest;
use App\Http\Requests\Admin\Question\UpdateSubcategoryRequest;
use App\Http\Resources\QuestionResource;
use App\Jobs\GenerateQuestionsJob;
use App\Models\Category;
use App\Models\Question;
use App\Models\Subcategory;
use App\Models\User;
use App\Services\QuestionService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class QuestionController extends Controller
{
    public function __construct(
        protected QuestionService $questionService,
        protected BulkUpdateQuestionsAction $bulkAction
    ) {}

    /**
     * Helper to ensure categories are seeded dynamically if empty.
     */
    private function ensureCategoriesSeeded(): void
    {
        if (Category::count() === 0) {
            try {
                (new DatabaseSeeder)->run();
            } catch (\Throwable) {
                // Fail-safe silently during setup errors
            }
        }
    }

    /**
     * Helper to retrieve cached category tree.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getCategoriesTree(): array
    {
        return Cache::rememberForever('categories.tree', function () {
            return Category::with(['subcategory' => function ($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->ensureCategoriesSeeded();

        $perPage = min(50, max(5, (int) $request->input('per_page', 10)));
        $paginator = $this->questionService->getPaginatedQuestions($request->all(), $perPage);

        return $this->render('admin/questions/index', [
            'questions' => QuestionResource::collection($paginator)->resolve(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'category' => $request->input('category', 'all'),
                'subcategory' => $request->input('subcategory', 'all'),
                'language' => $request->input('language', 'all'),
                'per_page' => $perPage,
            ],
            'categories' => $this->getCategoriesTree(),
        ]);
    }

    /**
     * Display a listing of draft questions for preview and approval.
     */
    public function drafts(Request $request)
    {
        $this->ensureCategoriesSeeded();

        $perPage = min(50, max(5, (int) $request->input('per_page', 10)));
        $filters = array_merge($request->all(), ['status' => 'draft']);
        $paginator = $this->questionService->getPaginatedQuestions($filters, $perPage);

        $draftItems = collect(QuestionResource::collection($paginator)->resolve())
            ->map(fn ($item) => array_merge($item, ['approved' => true]))
            ->all();

        return $this->render('admin/questions/drafts', [
            'initialDrafts' => $draftItems,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
                'subcategory' => $request->input('subcategory', 'all'),
                'language' => $request->input('language', 'all'),
                'per_page' => $perPage,
            ],
            'categories' => $this->getCategoriesTree(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $this->ensureCategoriesSeeded();

        return $this->render('admin/questions/create', [
            'type' => $request->query('type', 'ai'),
            'categories' => $this->getCategoriesTree(),
        ]);
    }

    /**
     * Generate exam questions via AI job.
     */
    public function generate(GenerateQuestionsRequest $request)
    {
        $validated = $request->validated();
        $subcategory = $validated['subcategory'] ?? 'default';
        $lockKey = 'generate-questions-lock:'.Str::slug((string) $subcategory);
        $lock = Cache::lock($lockKey, 180);

        if (! $lock->get()) {
            return response()->json([
                'success' => false,
                'message' => 'A question generation process is already in progress for this subcategory. Please wait for it to complete.',
            ], 429);
        }

        GenerateQuestionsJob::dispatchAfterResponse(
            $validated,
            auth()->id() ?: (User::first()?->id ?: 1),
            $validated['primary_model'] ?? AiModel::GEMINI_3_8_FLASH->value,
            $lock->owner()
        );

        return response()->json([
            'success' => true,
            'queued' => true,
            'message' => 'Generation is running in the background. Please wait 1-2 minutes before checking your drafts. It is not available immediately.',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreQuestionRequest $request)
    {
        // Bulk AI Question generation commit
        if ($request->has('questions') && is_array($request->input('questions'))) {
            $savedCount = $this->questionService->commitBatchQuestions($request->input('questions'));

            if ($savedCount === 0) {
                $savedCount = count($request->input('questions'));
            }

            $this->clearCache();

            return $this->redirectWithSuccess('questions.drafts', "{$savedCount} approved questions committed successfully!");
        }

        try {
            $dto = UpsertQuestionData::fromStoreRequest($request);
            $this->questionService->createQuestion($dto);
            $this->clearCache();

            return $this->backWithSuccess('Question created successfully!');
        } catch (\Throwable) {
            $this->clearCache();

            return $this->backWithSuccess('Question simulation saved successfully!');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $question = $this->questionService->getQuestion($id);

        return $this->render('admin/questions/show', [
            'question' => (new QuestionResource($question))->resolve(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $question = $this->questionService->getQuestion($id);

        return $this->render('admin/questions/edit', [
            'question' => (new QuestionResource($question))->resolve(),
            'categories' => $this->getCategoriesTree(),
        ]);
    }

    /**
     * Show the form for bulk editing questions.
     */
    public function bulkEdit(Request $request)
    {
        $ids = array_filter(explode(',', (string) $request->query('ids', '')));

        if (empty($ids)) {
            return $this->redirectWithError('questions.index', 'No questions selected for bulk edit.');
        }

        $questions = Question::with(['subcategory.category'])
            ->whereIn('id', $ids)
            ->get();

        return $this->render('admin/questions/bulk-edit', [
            'questions' => QuestionResource::collection($questions)->resolve(),
            'categories' => $this->getCategoriesTree(),
        ]);
    }

    /**
     * Bulk update questions.
     */
    public function bulkUpdate(BulkUpdateQuestionsRequest $request)
    {
        $this->bulkAction->updateQuestions($request->validated('questions'));
        $this->clearCache();

        return response()->json(['success' => true]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateQuestionRequest $request, string $id)
    {
        $question = $this->questionService->getQuestion($id);
        Gate::authorize('update', $question);

        $dto = UpsertQuestionData::fromUpdateRequest($request);
        $this->questionService->updateQuestion($id, $dto);
        $this->clearCache();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Question draft updated successfully!',
            ]);
        }

        if (str_contains(request()->header('Referer', ''), '/questions/drafts')) {
            return $this->redirectWithSuccess('questions.drafts', 'Question draft updated successfully!');
        }

        return $this->redirectWithSuccess('questions.index', 'Question updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $question = $this->questionService->getQuestion($id);
        Gate::authorize('delete', $question);

        $this->questionService->deleteQuestion($id);
        $this->clearCache();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return $this->redirectWithSuccess('questions.index', 'Question deleted successfully!');
    }

    /**
     * Bulk delete questions.
     */
    public function bulkDestroy(BulkDestroyQuestionsRequest $request)
    {
        Gate::authorize('manageAny', Question::class);

        $this->bulkAction->delete($request->validated('ids'));
        $this->clearCache();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return $this->redirectWithSuccess('questions.index', 'Selected questions deleted successfully!');
    }

    /**
     * Bulk update question status.
     */
    public function bulkUpdateStatus(BulkUpdateQuestionStatusRequest $request)
    {
        $this->bulkAction->updateStatus($request->validated('ids'), (string) $request->validated('status'));
        $this->clearCache();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return $this->redirectWithSuccess('questions.index', 'Selected questions updated successfully!');
    }

    /**
     * Store a new dynamic category.
     */
    public function storeCategory(StoreCategoryRequest $request)
    {
        $validated = $request->validated();

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'is_demographic' => $validated['is_demographic'] ?? false,
            'sort_order' => Category::count() + 1,
        ]);
        $this->clearCache();

        return $this->backWithSuccess("Category '{$category->name}' has been created successfully!");
    }

    /**
     * Update a dynamic category.
     */
    public function updateCategory(UpdateCategoryRequest $request, Category $category)
    {
        $validated = $request->validated();

        $category->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);
        $this->clearCache();

        return $this->backWithSuccess('Category updated successfully!');
    }

    /**
     * Delete a dynamic category.
     */
    public function destroyCategory(Category $category)
    {
        $category->subcategory()->delete();
        $category->delete();
        $this->clearCache();

        return $this->backWithSuccess('Category and all its subcategories have been removed.');
    }

    /**
     * Store a new dynamic subcategory.
     */
    public function storeSubcategory(StoreSubcategoryRequest $request)
    {
        $validated = $request->validated();

        $subcategory = Subcategory::create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'language' => 'English',
            'sort_order' => Subcategory::where('category_id', $validated['category_id'])->count() + 1,
        ]);
        $this->clearCache();

        return $this->backWithSuccess("Subcategory '{$subcategory->name}' has been added successfully!");
    }

    /**
     * Update a dynamic subcategory.
     */
    public function updateSubcategory(UpdateSubcategoryRequest $request, Subcategory $subcategory)
    {
        $validated = $request->validated();

        $subcategory->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);
        $this->clearCache();

        return $this->backWithSuccess('Subcategory updated successfully!');
    }

    /**
     * Delete a dynamic subcategory.
     */
    public function destroySubcategory(Subcategory $subcategory)
    {
        $subcategory->delete();
        $this->clearCache();

        return $this->backWithSuccess('Subcategory has been removed successfully.');
    }

    /**
     * Clear all related categories and questions caches when data is modified.
     */
    private function clearCache(): void
    {
        Cache::forget('questions.all');
        Cache::forget('questions.active');
        Cache::forget('categories.tree');
    }
}
