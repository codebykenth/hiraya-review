<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\Drill\BookmarkQuestionData;
use App\DTOs\Drill\StoreCustomQuestionData;
use App\DTOs\Drill\UpsertSavedDrillSetData;
use App\Http\Resources\DrillQuestionResource;
use App\Http\Resources\SavedDrillSetResource;
use App\Models\Category;
use App\Models\Question;
use App\Models\SavedDrillSet;
use App\Repositories\ExamAttemptRepositoryInterface;
use App\Repositories\QuestionRepositoryInterface;
use App\Repositories\SavedDrillSetRepositoryInterface;
use Illuminate\Support\Facades\Cache;

class DrillService
{
    public function __construct(
        protected SavedDrillSetRepositoryInterface $savedDrillSetRepository,
        protected QuestionRepositoryInterface $questionRepository,
        protected ExamAttemptRepositoryInterface $attemptRepository,
    ) {}

    /**
     * @return array{
     *     questions: array<int, mixed>,
     *     categories: array<int, mixed>,
     *     savedDrillSets: array<int, mixed>,
     *     wrongQuestionIds: array<int, int>,
     *     seenQuestionIds: array<int, int>
     * }
     */
    public function getDrillsIndexData(?int $userId): array
    {
        $activePool = $this->questionRepository->getActivePool();
        $questions = Cache::rememberForever('questions.active.drill_resources', function () use ($activePool) {
            return DrillQuestionResource::collection($activePool)->resolve();
        });

        $categories = Cache::rememberForever('categories.tree', function () {
            return Category::with(['subcategory' => function ($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });

        $savedDrillSets = [];
        $wrongQuestionIds = [];
        $seenQuestionIds = [];

        if ($userId !== null) {
            $userSets = $this->savedDrillSetRepository->getUserSets($userId);
            $savedDrillSets = SavedDrillSetResource::collection($userSets)->resolve();

            $attempts = $this->attemptRepository->getUserAttempts($userId);
            $questionsKeyed = $activePool->keyBy('id');

            foreach ($attempts as $attempt) {
                $qIds = $attempt->question_ids ?? [];
                $seenQuestionIds = array_merge($seenQuestionIds, $qIds);

                $wrongIds = $attempt->cat_scores['metadata']['wrong_question_ids'] ?? [];

                // Fallback: if metadata didn't record wrong_question_ids directly, compute from answers
                if (empty($wrongIds) && ! empty($attempt->answers) && ! empty($attempt->question_ids)) {
                    foreach ($attempt->question_ids as $idx => $qId) {
                        $qData = $questionsKeyed->get($qId);
                        if (! $qData) {
                            continue;
                        }
                        $chosen = $attempt->answers[$idx] ?? null;
                        if ($chosen !== null && (int) $chosen !== (int) $qData->correct_option) {
                            $wrongIds[] = $qId;
                        }
                    }
                }

                $wrongQuestionIds = array_merge($wrongQuestionIds, $wrongIds);
            }

            $seenQuestionIds = array_values(array_unique(array_map('intval', $seenQuestionIds)));
            $wrongQuestionIds = array_values(array_unique(array_map('intval', $wrongQuestionIds)));
        }

        return [
            'questions' => $questions,
            'categories' => $categories,
            'savedDrillSets' => $savedDrillSets,
            'wrongQuestionIds' => $wrongQuestionIds,
            'seenQuestionIds' => $seenQuestionIds,
        ];
    }

    /**
     * @return array{
     *     weak_subcategories: array<int, string>,
     *     questions: array<int, mixed>
     * }
     */
    public function getSmartWeaknessQuestions(int $userId): array
    {
        $attempts = $this->attemptRepository->getUserAttempts($userId);

        $subcatStats = [];
        foreach ($attempts as $attempt) {
            $scoreMap = $attempt->cat_scores['categoryScoreMap'] ?? $attempt->cat_scores ?? [];
            foreach ($scoreMap as $scoreData) {
                $subcats = $scoreData['subcats'] ?? [];
                foreach ($subcats as $subName => $subScore) {
                    if (! is_array($subScore)) {
                        continue;
                    }
                    if (! isset($subcatStats[$subName])) {
                        $subcatStats[$subName] = ['correct' => 0, 'total' => 0];
                    }
                    $subcatStats[$subName]['correct'] += $subScore['correct'] ?? 0;
                    $subcatStats[$subName]['total'] += $subScore['total'] ?? 0;
                }
            }
        }

        // Filter subcategories with accuracy < 65%
        $weakSubcatNames = [];
        foreach ($subcatStats as $subName => $stats) {
            if ($stats['total'] > 0 && ($stats['correct'] / $stats['total']) < 0.65) {
                $weakSubcatNames[] = (string) $subName;
            }
        }

        $query = Question::where('status', 'active')->with(['subcategory.category']);

        if (! empty($weakSubcatNames)) {
            $query->whereHas('subcategory', function ($q) use ($weakSubcatNames) {
                $q->whereIn('name', $weakSubcatNames);
            });
        }

        $questions = $query->inRandomOrder()->limit(20)->get();

        return [
            'weak_subcategories' => $weakSubcatNames,
            'questions' => DrillQuestionResource::collection($questions)->resolve(),
        ];
    }

    public function createCustomQuestion(int $userId, StoreCustomQuestionData $dto): Question
    {
        /** @var Question $question */
        $question = $this->questionRepository->create($dto->toAttributes($userId));

        Cache::forget('questions.active');

        $question->load('subcategory.category');

        return $question;
    }

    public function createSavedSet(int $userId, UpsertSavedDrillSetData $dto): SavedDrillSet
    {
        return $this->savedDrillSetRepository->createWithQuestions(
            $userId,
            $dto->toAttributes(),
            $dto->questionIds
        );
    }

    public function updateSavedSet(SavedDrillSet $set, UpsertSavedDrillSetData $dto): bool
    {
        return $this->savedDrillSetRepository->updateSet($set, $dto->toAttributes());
    }

    public function deleteSavedSet(SavedDrillSet $set): bool
    {
        return $this->savedDrillSetRepository->deleteSet($set);
    }

    /**
     * @return array{
     *     status: string,
     *     set_id: int,
     *     set_name: string,
     *     question_id: int
     * }
     */
    public function bookmarkQuestion(int $userId, BookmarkQuestionData $dto): array
    {
        /** @var Question $question */
        $question = $this->questionRepository->findOrFail($dto->questionId);

        $set = $this->savedDrillSetRepository->findOrCreateBookmarkSet(
            $userId,
            $dto->savedDrillSetId,
            $dto->newSetName
        );

        $this->savedDrillSetRepository->attachQuestion($set, (int) $question->id);

        return [
            'status' => 'success',
            'set_id' => (int) $set->id,
            'set_name' => (string) $set->name,
            'question_id' => (int) $question->id,
        ];
    }

    public function removeQuestionFromSet(SavedDrillSet $set, int $questionId): int
    {
        return $this->savedDrillSetRepository->detachQuestion($set, $questionId);
    }

    /**
     * @return array{
     *     set: array{id: int, name: string, description: ?string, color: string, total_items: int},
     *     questions: array<int, mixed>
     * }
     */
    public function getSetQuestions(SavedDrillSet $set): array
    {
        $questions = $this->savedDrillSetRepository->getActiveQuestions($set);

        return [
            'set' => [
                'id' => (int) $set->id,
                'name' => (string) $set->name,
                'description' => $set->description,
                'color' => (string) ($set->color ?? 'blue'),
                'total_items' => $questions->count(),
            ],
            'questions' => DrillQuestionResource::collection($questions)->resolve(),
        ];
    }
}
