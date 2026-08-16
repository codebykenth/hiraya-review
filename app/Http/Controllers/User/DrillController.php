<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\User\StoreCustomDrillQuestionRequest;
use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\SavedDrillSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DrillController
{
    /**
     * Render the dynamic diagnostic drills interface.
     */
    public function index(Request $request)
    {
        $questions = Cache::rememberForever('questions.active', function () {
            return Question::where('status', 'active')
                ->with(['subcategory.category'])
                ->get()
                ->map(function ($q) {
                    return [
                        'id' => $q->id,
                        'stem' => $q->stem,
                        'options' => $q->options ?? [],
                        'correct_option' => $q->correct_option,
                        'explanation' => $q->explanation ?? '',
                        'category' => $q->subcategory?->category?->name ?? 'General Information',
                        'subcategory' => $q->subcategory?->name ?? '',
                        'language' => (str_contains(strtolower($q->language ?? ''), 'tagalog') || str_contains(strtolower($q->language ?? ''), 'filipino')) ? 'Filipino' : 'English',
                        'isDemographic' => $q->subcategory?->category?->is_demographic ?? false,
                    ];
                })->toArray();
        });

        $categories = Cache::rememberForever('categories.tree', function () {
            return Category::with(['subcategory' => function ($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });

        $userId = auth()->id();
        $savedDrillSets = [];
        $wrongQuestionIds = [];
        $seenQuestionIds = [];

        if ($userId) {
            $savedDrillSets = SavedDrillSet::where('user_id', $userId)
                ->withCount('questions')
                ->with(['questions.subcategory.category'])
                ->orderBy('id', 'desc')
                ->get()
                ->map(function ($set) {
                    return [
                        'id' => $set->id,
                        'name' => $set->name,
                        'description' => $set->description,
                        'color' => $set->color,
                        'questions_count' => $set->questions_count,
                        'sample_categories' => $set->questions->map(fn ($q) => $q->subcategory?->category?->name)->filter()->unique()->values()->all(),
                        'created_at' => $set->created_at?->toIso8601String(),
                    ];
                })
                ->toArray();

            $attempts = ExamAttempt::where('user_id', $userId)->get();
            $questionsKeyed = collect($questions)->keyBy('id');

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
                        if ($chosen !== null && (int) $chosen !== (int) $qData['correct_option']) {
                            $wrongIds[] = $qId;
                        }
                    }
                }

                $wrongQuestionIds = array_merge($wrongQuestionIds, $wrongIds);
            }

            $seenQuestionIds = array_values(array_unique($seenQuestionIds));
            $wrongQuestionIds = array_values(array_unique($wrongQuestionIds));
        }

        return Inertia::render('user/drills/index', [
            'questions' => $questions,
            'categories' => $categories,
            'savedDrillSets' => $savedDrillSets,
            'wrongQuestionIds' => $wrongQuestionIds,
            'seenQuestionIds' => $seenQuestionIds,
        ]);
    }

    /**
     * Get weak subcategory questions for Smart Weakness Drill.
     */
    public function smartWeakness(Request $request)
    {
        $userId = auth()->id();
        $attempts = ExamAttempt::where('user_id', $userId)->get();

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
                $weakSubcatNames[] = $subName;
            }
        }

        $query = Question::where('status', 'active')->with(['subcategory.category']);

        if (! empty($weakSubcatNames)) {
            $query->whereHas('subcategory', function ($q) use ($weakSubcatNames) {
                $q->whereIn('name', $weakSubcatNames);
            });
        }

        $questions = $query->inRandomOrder()->limit(20)->get()->map(function ($q) {
            return [
                'id' => $q->id,
                'stem' => $q->stem,
                'options' => $q->options ?? [],
                'correct_option' => $q->correct_option,
                'explanation' => $q->explanation ?? '',
                'category' => $q->subcategory?->category?->name ?? 'General Information',
                'subcategory' => $q->subcategory?->name ?? '',
                'language' => (str_contains(strtolower($q->language ?? ''), 'tagalog') || str_contains(strtolower($q->language ?? ''), 'filipino')) ? 'Filipino' : 'English',
                'isDemographic' => $q->subcategory?->category?->is_demographic ?? false,
            ];
        });

        return response()->json([
            'weak_subcategories' => $weakSubcatNames,
            'questions' => $questions,
        ]);
    }

    /**
     * Store a custom user-created question for practice drills.
     */
    public function storeCustomQuestion(StoreCustomDrillQuestionRequest $request)
    {
        $validated = $request->validated();

        $question = Question::create([
            'subcategory_id' => $validated['subcategory_id'],
            'language' => $validated['language'] ?? 'English',
            'stem' => $validated['stem'],
            'options' => $validated['options'],
            'correct_option' => (int) $validated['correct_option'],
            'explanation' => $validated['explanation'] ?? '',
            'created_by' => auth()->id(),
            'status' => 'active',
        ]);

        Cache::forget('questions.active');

        $question->load('subcategory.category');

        return response()->json([
            'message' => 'Question created successfully.',
            'question' => [
                'id' => $question->id,
                'stem' => $question->stem,
                'options' => $question->options ?? [],
                'correct_option' => $question->correct_option,
                'explanation' => $question->explanation ?? '',
                'category' => $question->subcategory?->category?->name ?? 'General Information',
                'subcategory' => $question->subcategory?->name ?? '',
                'language' => (str_contains(strtolower($question->language ?? ''), 'tagalog') || str_contains(strtolower($question->language ?? ''), 'filipino')) ? 'Filipino' : 'English',
                'isDemographic' => $question->subcategory?->category?->is_demographic ?? false,
                'isCustom' => true,
            ],
        ], 201);
    }
}
