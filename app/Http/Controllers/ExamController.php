<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Category;
use App\Models\TrackConfig;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ExamController extends Controller
{
    private function formatAttemptCategoryScores(array $catScores): array
    {
        $scoreMap = $catScores['categoryScoreMap'] ?? $catScores ?? [];
        $meta = $catScores['metadata'] ?? [];
        $isDrill = ($meta['track'] ?? null) === 'Drill';
        $selectedSubcategories = collect($meta['selected_subcategories'] ?? [])
            ->filter()
            ->map(fn ($name) => strtolower((string) $name))
            ->values();
        $formatted = [];

        foreach ($scoreMap as $catName => $scoreData) {
            if ($catName === 'metadata' || !is_array($scoreData)) {
                continue;
            }

            if ($isDrill && isset($scoreData['subcats']) && is_array($scoreData['subcats'])) {
                foreach ($scoreData['subcats'] as $subcatName => $subcatScore) {
                    if (!is_array($subcatScore)) {
                        continue;
                    }

                    if ($selectedSubcategories->isNotEmpty()) {
                        $normalizedSubcatName = strtolower((string) $subcatName);
                        $matchesSelection = $selectedSubcategories->contains(function ($selectedName) use ($normalizedSubcatName) {
                            return str_contains($normalizedSubcatName, $selectedName) || str_contains($selectedName, $normalizedSubcatName);
                        });

                        if (!$matchesSelection) {
                            continue;
                        }
                    }

                    $correct = (int) ($subcatScore['correct'] ?? 0);
                    $total = (int) ($subcatScore['total'] ?? 0);

                    if ($total <= 0) {
                        continue;
                    }

                    $formatted[] = [
                        'name' => (string) $subcatName,
                        'correct' => $correct,
                        'total' => $total,
                        'percentage' => round(($correct / $total) * 100),
                    ];
                }

                continue;
            }

            $correct = (int) ($scoreData['correct'] ?? 0);
            $total = (int) ($scoreData['total'] ?? 0);

            if ($total <= 0) {
                continue;
            }

            $formatted[] = [
                'name' => str_replace(' Ability', '', str_replace(' Information', '', $catName)),
                'correct' => $correct,
                'total' => $total,
                'percentage' => round(($correct / $total) * 100),
            ];
        }

        return $formatted;
    }

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
                        'language' => $q->language,
                    ];
                })->toArray();
        });

        $questions = collect($activeQuestionsPool);
        $savedAttempt = null;
        $retakeSource = null;

        if ($request->has('attempt_id')) {
            $attempt = \App\Models\ExamAttempt::where('user_id', auth()->id())
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
            $attempt = \App\Models\ExamAttempt::where('user_id', auth()->id())
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
            return Category::with(['subcategory' => function($query) {
                $query->orderBy('sort_order');
            }])->orderBy('sort_order')->get()->toArray();
        });

        $tracks = TrackConfig::all();

        $seenQuestionIdsByTrack = $this->seenQuestionIdsByTrack(auth()->id());

        return Inertia::render('exams/index', [
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
    public function storeAttempt(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'nullable|integer',
            'question_ids' => 'required|array',
            'answers' => 'required|array',
            'cat_scores' => 'required|array',
        ]);

        $attempt = \App\Models\ExamAttempt::create([
            'user_id' => auth()->id(),
            'category_id' => $validated['category_id'],
            'question_ids' => $validated['question_ids'],
            'answers' => $validated['answers'],
            'cat_scores' => $validated['cat_scores'],
        ]);

        return response()->json([
            'success' => true,
            'attempt_id' => $attempt->id
        ]);
    }

    /**
     * Display a listing of past attempts for user.
     */
    public function history(Request $request)
    {
        $search = $request->input('search');
        $track = $request->input('track');
        $dateFilter = $request->input('date');

        $query = \App\Models\ExamAttempt::where('user_id', auth()->id())
            ->with('category');

        if ($dateFilter === '7') {
            $query->where('created_at', '>=', now()->subDays(7));
        } elseif ($dateFilter === '30') {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        $attempts = $query->latest()->get()->map(function ($attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $trackName = $meta['track'] ?? 'Drill';
            if ($attempt->category_id !== null && !$trackName) {
                $trackName = 'Drill';
            }

            $categoryName = 'Full Mock Exam';
            if ($attempt->category) {
                $categoryName = $attempt->category->name;
            } elseif (isset($meta['category_name'])) {
                $categoryName = $meta['category_name'];
            }

            $correct = $meta['correct_count'] ?? 0;
            $total = $meta['total_questions'] ?? count($attempt->question_ids);
            $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;
            $durationSecs = (int) ($meta['duration_secs'] ?? 0);
            $durationText = $this->formatDurationText($durationSecs);

            $status = 'Completed';
            if ($trackName !== 'Drill') {
                $status = $percentage >= 80 ? 'Pass' : 'Fail';
            }

            return [
                'id' => $attempt->id,
                'category_id' => $attempt->category_id,
                'date' => $attempt->created_at?->format('M d, Y') ?? '',
                'time' => $attempt->created_at?->format('h:i A') ?? '',
                'track' => $trackName,
                'category' => $categoryName,
                'score' => $percentage,
                'correct' => $correct,
                'total' => $total,
                'category_scores' => $this->formatAttemptCategoryScores($attempt->cat_scores ?? []),
                'status' => $status,
                'duration' => $durationText,
                'created_at' => $attempt->created_at?->toIso8601String(),
                'selected_subcategories' => $meta['selected_subcategories'] ?? null,
                'language' => $meta['language'] ?? 'English',
                'question_count' => $meta['question_count'] ?? $total,
                'is_timed' => $meta['is_timed'] ?? true,
            ];
        });

        if ($track && $track !== 'All Tracks') {
            $attempts = $attempts->filter(function ($item) use ($track) {
                return strtolower($item['track']) === strtolower($track);
            });
        }

        if ($search) {
            $attempts = $attempts->filter(function ($item) use ($search) {
                return str_contains(strtolower($item['category']), strtolower($search)) ||
                       str_contains(strtolower($item['track']), strtolower($search)) ||
                       str_contains(strtolower((string)$item['id']), strtolower($search));
            });
        }

        $page = (int) $request->input('page', 1);
        $perPage = 4;
        $totalItems = $attempts->count();
        
        $paginatedAttempts = $attempts->slice(($page - 1) * $perPage, $perPage)->values()->toArray();

        return Inertia::render('history/index', [
            'attempts' => $paginatedAttempts,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $totalItems,
                'last_page' => max(1, ceil($totalItems / $perPage)),
            ],
            'filters' => [
                'search' => $search ?? '',
                'track' => $track ?? 'All Tracks',
                'date' => $dateFilter ?? '30',
            ]
        ]);
    }

    /**
     * Render the user dashboard with real performance metrics.
     */
    public function dashboard()
    {
        $userId = auth()->id();
        $attempts = \App\Models\ExamAttempt::where('user_id', $userId)
            ->latest()
            ->get();

        $totalExams = $attempts->count();
        
        $avgScore = 0;
        $strongestArea = 'Not Started';
        $weakestArea = 'Not Started';
        $passingRate = 0;
        $totalQuestionsSolved = 0;
        $totalDurationSecs = 0;
        $avgDurationText = '0 mins';
        
        $categoryTotals = [
            'Verbal Ability' => ['correct' => 0, 'total' => 0],
            'Clerical Ability' => ['correct' => 0, 'total' => 0],
            'General Information' => ['correct' => 0, 'total' => 0],
            'Numerical Ability' => ['correct' => 0, 'total' => 0],
            'Analytical Ability' => ['correct' => 0, 'total' => 0],
        ];

        if ($totalExams > 0) {
            $totalScoreSum = 0;
            $passCount = 0;
            
            foreach ($attempts as $attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $correct = $meta['correct_count'] ?? 0;
                $total = $meta['total_questions'] ?? count($attempt->question_ids);
                $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;
                $totalScoreSum += $percentage;

                if ($percentage >= 80) {
                    $passCount++;
                }

                $totalDurationSecs += (int) ($meta['duration_secs'] ?? 0);
                $totalQuestionsSolved += $total;

                $scoreMap = $attempt->cat_scores['categoryScoreMap'] ?? $attempt->cat_scores ?? [];
                foreach ($scoreMap as $catName => $scoreData) {
                    $normalizedCat = $catName;
                    if (str_contains($catName, 'Verbal')) $normalizedCat = 'Verbal Ability';
                    if (str_contains($catName, 'Clerical')) $normalizedCat = 'Clerical Ability';
                    if (str_contains($catName, 'General')) $normalizedCat = 'General Information';
                    if (str_contains($catName, 'Numerical')) $normalizedCat = 'Numerical Ability';
                    if (str_contains($catName, 'Analytical')) $normalizedCat = 'Analytical Ability';

                    if (isset($categoryTotals[$normalizedCat])) {
                        $categoryTotals[$normalizedCat]['correct'] += $scoreData['correct'] ?? 0;
                        $categoryTotals[$normalizedCat]['total'] += $scoreData['total'] ?? 0;
                    }
                }
            }

            $avgScore = round($totalScoreSum / $totalExams);
            $passingRate = round(($passCount / $totalExams) * 100);

            // Calculate total practice duration text
            $hours = floor($totalDurationSecs / 3600);
            $minutes = floor(($totalDurationSecs % 3600) / 60);
            $totalDurationText = $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes} mins";

            $avgDurationSecs = $totalExams > 0 ? (int) round($totalDurationSecs / $totalExams) : 0;
            $avgHours = floor($avgDurationSecs / 3600);
            $avgMinutes = floor(($avgDurationSecs % 3600) / 60);
            $avgSeconds = $avgDurationSecs % 60;
            if ($avgHours > 0) {
                $avgDurationText = "{$avgHours}h {$avgMinutes}m";
            } elseif ($avgMinutes > 0) {
                $avgDurationText = "{$avgMinutes}m {$avgSeconds}s";
            } else {
                $avgDurationText = "{$avgSeconds}s";
            }

            $lastAttempts = $attempts->take(6)->reverse();
            $chartData = [];
            $attemptIdx = 1;
            foreach ($lastAttempts as $attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $correct = $meta['correct_count'] ?? 0;
                $total = $meta['total_questions'] ?? count($attempt->question_ids);
                $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;
                $track = $meta['track'] ?? 'Drill';
                $date = $attempt->created_at?->format('M d') ?? 'Just now';

                $chartData[] = [
                    'score' => $percentage,
                    'label' => 'Run ' . $attemptIdx++,
                    'date' => $date,
                    'track' => $track === 'Drill' ? 'Custom Drill' : $track . ' Exam',
                    'detail' => "{$correct}/{$total} Correct",
                    'categoryScores' => $this->formatAttemptCategoryScores($attempt->cat_scores ?? []),
                ];
            }
            while (count($chartData) < 2) {
                array_unshift($chartData, [
                    'score' => 0,
                    'label' => 'Run ' . (count($chartData) + 1),
                    'date' => '-',
                    'track' => 'No Data',
                    'detail' => '0/0 Correct',
                    'categoryScores' => [],
                ]);
            }
        } else {
            $passingRate = 0;
            $totalDurationText = '0 mins';
            $avgDurationText = '0 mins';
            $totalQuestionsSolved = 0;
            $chartData = [
                ['score' => 40, 'label' => 'Run 1', 'date' => 'May 20', 'track' => 'Sample Exam', 'detail' => '20/50 Correct', 'categoryScores' => []],
                ['score' => 52, 'label' => 'Run 2', 'date' => 'May 21', 'track' => 'Sample Drill', 'detail' => '26/50 Correct', 'categoryScores' => []],
                ['score' => 45, 'label' => 'Run 3', 'date' => 'May 22', 'track' => 'Sample Exam', 'detail' => '22/50 Correct', 'categoryScores' => []],
                ['score' => 68, 'label' => 'Run 4', 'date' => 'May 23', 'track' => 'Sample Drill', 'detail' => '34/50 Correct', 'categoryScores' => []],
                ['score' => 60, 'label' => 'Run 5', 'date' => 'May 24', 'track' => 'Sample Exam', 'detail' => '30/50 Correct', 'categoryScores' => []],
                ['score' => 85, 'label' => 'Run 6', 'date' => 'May 25', 'track' => 'Sample Drill', 'detail' => '42/50 Correct', 'categoryScores' => []],
            ];
        }

        $formattedCategories = [];
        $categoryPercentages = [];
        foreach ($categoryTotals as $catName => $data) {
            $pct = $data['total'] > 0 ? round(($data['correct'] / $data['total']) * 100) : 0;
            $categoryPercentages[$catName] = $pct;

            $color = 'bg-blue-600 dark:bg-blue-500';
            if ($catName === 'Verbal Ability') $color = 'bg-emerald-600 dark:bg-emerald-500';
            if ($catName === 'General Information') $color = 'bg-emerald-850 dark:bg-emerald-700';
            if ($catName === 'Numerical Ability') $color = 'bg-rose-600 dark:bg-rose-500';
            if ($catName === 'Analytical Ability') $color = 'bg-amber-600 dark:bg-amber-500';

            $formattedCategories[] = [
                'name' => str_replace(' Ability', '', str_replace(' Information', '', $catName)),
                'percentage' => $pct,
                'color' => $color,
                'correct' => $data['correct'],
                'total' => $data['total'],
            ];
        }

        $activeCategoryPercentages = array_filter($categoryPercentages, fn($val) => $val > 0);
        if (count($activeCategoryPercentages) > 0) {
            arsort($activeCategoryPercentages);
            $strongestArea = array_key_first($activeCategoryPercentages);
            
            asort($activeCategoryPercentages);
            $weakestArea = array_key_first($activeCategoryPercentages);
        } else {
            if ($totalExams > 0) {
                $strongestArea = 'Mixed';
                $weakestArea = 'Mixed';
            }
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'avgScore' => $avgScore,
                'totalExams' => $totalExams,
                'strongestArea' => str_replace(' Ability', '', str_replace(' Information', '', $strongestArea)),
                'weakestArea' => str_replace(' Ability', '', str_replace(' Information', '', $weakestArea)),
                'chartData' => $chartData,
                'categories' => $formattedCategories,
                'passingRate' => $passingRate,
                'totalDuration' => $totalDurationText,
                'avgDuration' => $avgDurationText,
                'totalQuestionsSolved' => $totalQuestionsSolved,
            ]
        ]);
    }

    /**
     * Collect question IDs the user has already faced, grouped by exam track.
     *
     * @return array{Professional: int[], Subprofessional: int[], Drill: int[]}
     */
    private function formatDurationText(int $seconds): string
    {
        $seconds = max(0, $seconds);

        if ($seconds < 60) {
            return $seconds . 's';
        }

        $hours = intdiv($seconds, 3600);
        $minutes = intdiv($seconds % 3600, 60);

        if ($hours > 0) {
            return $hours . 'h ' . $minutes . 'm';
        }

        return $minutes . 'm';
    }

    private function seenQuestionIdsByTrack(int $userId): array
    {
        $byTrack = [
            'Professional' => [],
            'Subprofessional' => [],
            'Drill' => [],
        ];

        $attempts = \App\Models\ExamAttempt::where('user_id', $userId)->get();

        foreach ($attempts as $attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $track = $meta['track'] ?? ($attempt->category_id !== null ? 'Drill' : 'Professional');
            if (! isset($byTrack[$track])) {
                $track = 'Professional';
            }
            $byTrack[$track] = array_merge($byTrack[$track], $attempt->question_ids ?? []);
        }

        foreach ($byTrack as $track => $ids) {
            $byTrack[$track] = array_values(array_unique($ids));
        }

        return $byTrack;
    }

    public function drills(Request $request)
    {
        $queryQuestions = Question::where('status', 'active')
            ->with(['subcategory.category']);

        $questions = $queryQuestions->get()
            ->map(function ($q) {
                return [
                    'id' => $q->id,
                    'stem' => $q->stem,
                    'options' => $q->options ?? [],
                    'correct_option' => $q->correct_option,
                    'explanation' => $q->explanation ?? '',
                    'category' => $q->subcategory?->category?->name ?? 'General Information',
                    'subcategory' => $q->subcategory?->name ?? '',
                    'language' => $q->language ?? 'English',
                ];
            });

        $categories = Category::with('subcategory')->get();

        return Inertia::render('drills/index', [
            'questions' => $questions,
            'categories' => $categories,
        ]);
    }

    /**
     * Delete an exam attempt record.
     */
    public function destroyAttempt(\App\Models\ExamAttempt $attempt)
    {
        if ($attempt->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $attempt->delete();

        return redirect()->back()->with('success', 'Attempt record deleted successfully!');
    }
}
