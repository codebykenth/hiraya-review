<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\StoreExamAttemptRequest;
use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\TrackConfig;
use App\Services\ExamAttemptFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ExamController
{
    public function __construct(
        protected ExamAttemptFormatter $formatter
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // 1. Fetch verified active questions from cached pool (fast in-memory processing)
        $activeQuestionsPool = Cache::rememberForever('questions.active', function () {
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

        $questions = collect($activeQuestionsPool);
        $savedAttempt = null;
        $retakeSource = null;

        if ($request->has('attempt_id')) {
            $attempt = ExamAttempt::where('user_id', auth()->id())
                ->with('category')
                ->find($request->attempt_id);

            if ($attempt) {
                // In-memory filter of cached pool
                $questions = $questions->whereIn('id', $attempt->question_ids);

                $savedAttempt = [
                    'id' => $attempt->id,
                    'category_id' => $attempt->category_id,
                    'question_ids' => $attempt->question_ids,
                    'answers' => $attempt->answers,
                    'cat_scores' => $attempt->cat_scores,
                    'created_at' => $attempt->created_at?->toIso8601String(),
                ];
            }
        } elseif ($request->filled('retake_same') || $request->filled('retake_fresh')) {
            $attemptId = $request->input('retake_same') ?? $request->input('retake_fresh');
            $attempt = ExamAttempt::where('user_id', auth()->id())
                ->find($attemptId);

            if ($attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $retakeSource = [
                    'attempt_id' => $attempt->id,
                    'question_ids' => $attempt->question_ids,
                    'track' => $meta['track'] ?? 'Professional',
                    'mode' => $request->has('retake_same') ? 'same' : 'fresh',
                ];
            }
        }

        // Eagerly sort by attempt questions order if loaded via deep-link
        if ($savedAttempt && isset($attempt)) {
            $questions = $questions->sortBy(function ($q) use ($attempt) {
                return array_search($q['id'], $attempt->question_ids);
            })->values();
        } else {
            $questions = $questions->values();
        }

        // 2. Fetch categories and tracks configurations
        $categories = Cache::rememberForever('categories.tree', function () {
            return Category::with(['subcategory' => function ($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });

        $tracks = TrackConfig::all();

        $seenQuestionIdsByTrack = $this->formatter->seenQuestionIdsByTrack(auth()->id());

        return Inertia::render('user/exams/index', [
            'questions' => $questions,
            'categories' => $categories,
            'tracks' => $tracks,
            'savedAttempt' => $savedAttempt,
            'retakeSource' => $retakeSource,
            'seenQuestionIdsByTrack' => $seenQuestionIdsByTrack,
            'exams' => [
                ['id' => 1, 'title' => 'Professional Level Reviewer', 'questions' => 170],
                ['id' => 2, 'title' => 'Sub-Professional Level Reviewer', 'questions' => 150],
            ],
        ]);
    }

    /**
     * Store a newly created exam attempt.
     */
    public function storeAttempt(StoreExamAttemptRequest $request)
    {
        $validated = $request->validated();

        $answers = $validated['answers'];
        $answeredCount = count(array_filter($answers, function ($answer) {
            return $answer !== null && $answer !== '';
        }));

        $totalQuestions = count($validated['question_ids']);
        $completionRate = $totalQuestions > 0 ? ($answeredCount / $totalQuestions) * 100 : 0;

        // Ignore empty or dummy attempts (less than 50% answered)
        if ($completionRate < 50) {
            return response()->json([
                'success' => true,
                'attempt_id' => null,
                'message' => 'Dummy attempt ignored.',
            ]);
        }

        $attempt = ExamAttempt::create([
            'user_id' => auth()->id(),
            'category_id' => $validated['category_id'],
            'question_ids' => $validated['question_ids'],
            'answers' => $validated['answers'],
            'cat_scores' => $validated['cat_scores'],
        ]);

        return response()->json([
            'success' => true,
            'attempt_id' => $attempt->id,
        ]);
    }
}
