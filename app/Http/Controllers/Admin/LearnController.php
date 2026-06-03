<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\BulkDestroyLearnModulesRequest;
use App\Http\Requests\GenerateLearnModuleRequest;
use App\Http\Requests\StoreLearnModuleRequest;
use App\Http\Requests\UpdateLearnModuleRequest;
use App\Jobs\GenerateLearnModuleJob;
use App\Models\Category;
use App\Models\LearnModule;
use App\Models\Subcategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LearnController
{
    /**
     * Clear all related learning caches when content is modified.
     */
    private function clearCache(?LearnModule $module = null): void
    {
        Cache::forget('learn.modules.published');
        Cache::forget('categories.tree');
        if ($module) {
            Cache::forget("learn.module.show.{$module->slug}");
            Cache::forget("learn.module.recommended.{$module->id}");
        }
    }

    /**
     * List all learn modules for admin curation dashboard.
     */
    public function index(Request $request): Response
    {

        $modules = LearnModule::with(['category', 'subcategory'])
            ->latest()
            ->get()
            ->map(function ($mod) {
                return [
                    'id' => $mod->id,
                    'title' => $mod->title,
                    'slug' => $mod->slug,
                    'topic' => $mod->topic,
                    'summary' => $mod->summary,
                    'estimated_minutes' => $mod->estimated_minutes,
                    'is_published' => (bool) $mod->is_published,
                    'category' => $mod->category?->name ?? 'General Info',
                    'subcategory' => $mod->subcategory?->name ?? 'Core Concepts',
                    'updated_at' => $mod->updated_at->format('Y-m-d H:i'),
                ];
            });

        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

        return Inertia::render('admin/learn/index', [
            'modules' => $modules,
            'categories' => $categories,
        ]);
    }

    /**
     * Show the learning module creation panel.
     */
    public function create(Request $request): Response
    {

        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

        return Inertia::render('admin/learn/create', [
            'categories' => $categories,
            'initialTopic' => $request->query('topic', ''),
        ]);
    }

    /**
     * Store a manually created or generated learn module in the database.
     */
    public function store(StoreLearnModuleRequest $request): RedirectResponse
    {

        // Bulk AI Learn Module commit
        if ($request->has('modules') && is_array($request->input('modules'))) {
            $modulesData = $request->input('modules');
            $savedCount = 0;

            foreach ($modulesData as $mData) {
                try {
                    $category = Category::firstOrCreate(
                        ['slug' => Str::slug($mData['category'])],
                        ['name' => $mData['category']]
                    );

                    $subcategory = Subcategory::firstOrCreate(
                        [
                            'category_id' => $category->id,
                            'slug' => Str::slug($mData['subcategory']),
                        ],
                        [
                            'name' => $mData['subcategory'],
                            'language' => 'English',
                        ]
                    );

                    $dbModule = null;
                    if (isset($mData['id'])) {
                        $dbModule = LearnModule::find($mData['id']);
                    }

                    if ($dbModule) {
                        $dbModule->update([
                            'category_id' => $category->id,
                            'subcategory_id' => $subcategory->id,
                            'title' => $mData['title'],
                            'topic' => $mData['topic'],
                            'summary' => $mData['summary'],
                            'content' => $mData['content'],
                            'estimated_minutes' => (int) $mData['estimated_minutes'],
                            'is_published' => true,
                        ]);
                    } else {
                        $slug = Str::slug($mData['title']);
                        $originalSlug = $slug;
                        $count = 1;
                        while (LearnModule::where('slug', $slug)->exists()) {
                            $slug = $originalSlug.'-'.$count++;
                        }

                        LearnModule::create([
                            'category_id' => $category->id,
                            'subcategory_id' => $subcategory->id,
                            'title' => $mData['title'],
                            'slug' => $slug,
                            'topic' => $mData['topic'],
                            'summary' => $mData['summary'],
                            'content' => $mData['content'],
                            'estimated_minutes' => (int) $mData['estimated_minutes'],
                            'is_published' => true,
                            'created_by' => auth()->id(),
                        ]);
                    }
                    $savedCount++;
                } catch (\Exception $e) {
                    // Silent fail
                }
            }

            $this->clearCache();

            return redirect()->route('admin.learn.drafts')->with('success', "{$savedCount} approved learning modules published successfully!");
        }

        $validated = $request->validated();

        $slug = Str::slug($validated['title']);

        // Ensure slug uniqueness
        $originalSlug = $slug;
        $count = 1;
        while (LearnModule::where('slug', $slug)->exists()) {
            $slug = $originalSlug.'-'.$count++;
        }

        LearnModule::create([
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'title' => $validated['title'],
            'slug' => $slug,
            'topic' => $validated['topic'],
            'summary' => $validated['summary'],
            'content' => $validated['content'],
            'estimated_minutes' => (int) $validated['estimated_minutes'],
            'is_published' => (bool) $validated['is_published'],
            'created_by' => auth()->id(),
        ]);

        $this->clearCache();

        return back()->with('success', 'Learning module created successfully!');
    }

    /**
     * Show the edit panel for a learning module.
     */
    public function edit(string $id): Response
    {

        $module = LearnModule::findOrFail($id);
        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

        return Inertia::render('admin/learn/edit', [
            'module' => [
                'id' => $module->id,
                'category_id' => $module->category_id,
                'subcategory_id' => $module->subcategory_id,
                'title' => $module->title,
                'topic' => $module->topic,
                'summary' => $module->summary,
                'content' => $module->content,
                'estimated_minutes' => $module->estimated_minutes,
                'is_published' => (bool) $module->is_published,
            ],
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified learning module.
     */
    public function update(UpdateLearnModuleRequest $request, string $id): RedirectResponse
    {

        $module = LearnModule::findOrFail($id);

        $validated = $request->validated();

        // Keep or update slug if title changed
        if ($module->title !== $validated['title']) {
            $slug = Str::slug($validated['title']);
            $originalSlug = $slug;
            $count = 1;
            while (LearnModule::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug.'-'.$count++;
            }
            $module->slug = $slug;
        }

        $module->update([
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'title' => $validated['title'],
            'topic' => $validated['topic'],
            'summary' => $validated['summary'],
            'content' => $validated['content'],
            'estimated_minutes' => (int) $validated['estimated_minutes'],
            'is_published' => (bool) $validated['is_published'],
        ]);

        $this->clearCache($module);

        return redirect()->route('admin.learn.index')->with('success', 'Learning module updated successfully!');
    }

    /**
     * Remove the specified learning module.
     */
    public function destroy(string $id): RedirectResponse
    {

        $module = LearnModule::findOrFail($id);
        $module->delete();

        $this->clearCache($module);

        return redirect()->route('admin.learn.index')->with('success', 'Learning module deleted successfully!');
    }

    /**
     * Bulk delete learning modules.
     */
    public function bulkDestroy(BulkDestroyLearnModulesRequest $request): RedirectResponse
    {

        $validated = $request->validated();

        LearnModule::whereIn('id', $validated['ids'])->delete();

        $this->clearCache();

        return redirect()->route('admin.learn.index')->with('success', 'Selected learning modules deleted successfully!');
    }

    public function generate(GenerateLearnModuleRequest $request)
    {

        $validated = $request->validated();

        GenerateLearnModuleJob::dispatchAfterResponse($validated, auth()->id() ?: 1, $validated['primary_model'] ?? 'llama-3.3-70b-versatile');

        return response()->json([
            'success' => true,
            'queued' => true,
            'message' => 'Generation is running in the background. Please wait 1-2 minutes before checking your drafts. It is not available immediately.',
        ]);
    }

    /**
     * Display a listing of draft learning modules for review.
     */
    public function drafts(Request $request): Response
    {

        $drafts = LearnModule::with(['category', 'subcategory'])
            ->where('is_published', false)
            ->latest()
            ->get()
            ->map(function ($mod) {
                return [
                    'id' => $mod->id,
                    'title' => $mod->title,
                    'slug' => $mod->slug,
                    'topic' => $mod->topic,
                    'summary' => $mod->summary,
                    'content' => $mod->content,
                    'estimated_minutes' => $mod->estimated_minutes,
                    'category_id' => $mod->category_id,
                    'subcategory_id' => $mod->subcategory_id,
                    'category' => $mod->category?->name ?? 'General Info',
                    'subcategory' => $mod->subcategory?->name ?? 'Core Concepts',
                    'updated_at' => $mod->updated_at->format('Y-m-d H:i'),
                    'approved' => true,
                ];
            });

        $categories = Category::with('subcategory')->orderBy('sort_order')->get();

        return Inertia::render('admin/learn/drafts', [
            'initialDrafts' => $drafts,
            'categories' => $categories,
        ]);
    }
}
