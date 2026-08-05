<?php

namespace App\Http\Controllers\User;

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\StudySchedule;
use App\Models\UserAiAnalysis;
use App\Services\DeterministicAnalysisService;
use App\Services\ExamAttemptFormatter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class AnalyticsController
{
    public function __construct(
        protected ExamAttemptFormatter $formatter
    ) {}

    /**
     * Render the user analytics page with real performance metrics.
     */
    public function index(Request $request)
    {
        $userId = auth()->id();
        $trackFilter = $request->query('track', 'Professional');
        $runsFilter = $request->query('runs', 'all'); // Default to all runs

        // Fetch user attempts
        $query = ExamAttempt::where('user_id', $userId)->latest();
        $allAttempts = $query->get();

        $filteredAttempts = collect();
        foreach ($allAttempts as $attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $track = $meta['track'] ?? 'Drill';
            if ($attempt->category_id !== null && ! isset($meta['track'])) {
                $track = 'Drill';
            }

            if ($trackFilter === 'All' || $track === $trackFilter) {
                $filteredAttempts->push($attempt);
            }
        }

        if ($runsFilter !== 'all') {
            $filteredAttempts = $filteredAttempts->take((int) $runsFilter);
        }

        $attempts = $filteredAttempts;
        $totalExams = $attempts->count();

        $avgScore = 0;
        $strongestArea = 'Not Started';
        $weakestArea = 'Not Started';
        $passingRate = 0;
        $totalQuestionsSolved = 0;
        $totalDurationSecs = 0;
        $avgDurationText = '0 mins';
        $subcategoryTotals = [];

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
            $mockExamCount = 0;

            foreach ($attempts as $attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $correct = $meta['correct_count'] ?? 0;
                $total = $meta['total_questions'] ?? count($attempt->question_ids);
                $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;
                $totalScoreSum += $percentage;

                $track = $meta['track'] ?? 'Drill';
                if ($attempt->category_id !== null && ! isset($meta['track'])) {
                    $track = 'Drill';
                }

                if ($track !== 'Drill') {
                    $mockExamCount++;
                    if ($percentage >= 80) {
                        $passCount++;
                    }
                }

                $totalDurationSecs += (int) ($meta['duration_secs'] ?? 0);
                $totalQuestionsSolved += $total;

                $scoreMap = $attempt->cat_scores['categoryScoreMap'] ?? $attempt->cat_scores ?? [];
                foreach ($scoreMap as $catName => $scoreData) {
                    $normalizedCat = $catName;
                    if (str_contains($catName, 'Verbal')) {
                        $normalizedCat = 'Verbal Ability';
                    }
                    if (str_contains($catName, 'Clerical')) {
                        $normalizedCat = 'Clerical Ability';
                    }
                    if (str_contains($catName, 'General')) {
                        $normalizedCat = 'General Information';
                    }
                    if (str_contains($catName, 'Numerical')) {
                        $normalizedCat = 'Numerical Ability';
                    }
                    if (str_contains($catName, 'Analytical')) {
                        $normalizedCat = 'Analytical Ability';
                    }

                    if (isset($categoryTotals[$normalizedCat])) {
                        $categoryTotals[$normalizedCat]['correct'] += $scoreData['correct'] ?? 0;
                        $categoryTotals[$normalizedCat]['total'] += $scoreData['total'] ?? 0;

                        // Subcategory calculations
                        $subcats = $scoreData['subcats'] ?? [];
                        foreach ($subcats as $subName => $subScore) {
                            if (! is_array($subScore)) {
                                continue;
                            }
                            if (! isset($subcategoryTotals[$normalizedCat][$subName])) {
                                $subcategoryTotals[$normalizedCat][$subName] = ['correct' => 0, 'total' => 0];
                            }
                            $subcategoryTotals[$normalizedCat][$subName]['correct'] += $subScore['correct'] ?? 0;
                            $subcategoryTotals[$normalizedCat][$subName]['total'] += $subScore['total'] ?? 0;
                        }
                    }
                }
            }

            $avgScore = round($totalScoreSum / $totalExams);
            $passingRate = $mockExamCount > 0 ? round(($passCount / $mockExamCount) * 100) : 0;

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

            // Reverse back so oldest in the selected window is first in the chart
            $lastAttempts = $attempts->reverse();
            $chartData = [];
            $attemptBreakdowns = [];
            $pacingTrend = [];
            $attemptIdx = 1;
            foreach ($lastAttempts as $attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $correct = $meta['correct_count'] ?? 0;
                $total = $meta['total_questions'] ?? count($attempt->question_ids);
                $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;
                $durationSecs = (int) ($meta['duration_secs'] ?? 0);
                $avgTimePerQuestion = $total > 0 ? round($durationSecs / $total, 1) : 0;

                $runName = 'Run #'.$attemptIdx++;
                $dateStr = $attempt->created_at->format('M d');

                $chartData[] = [
                    'name' => $runName,
                    'score' => $percentage,
                    'is_timed' => $meta['is_timed'] ?? true,
                    'track' => $meta['track'] ?? 'Drill',
                    'date' => $dateStr,
                ];

                $pacingTrend[] = [
                    'name' => $runName,
                    'date' => $dateStr,
                    'secondsPerQuestion' => $avgTimePerQuestion,
                    'accuracy' => $percentage,
                ];

                $scoreMap = $attempt->cat_scores['categoryScoreMap'] ?? $attempt->cat_scores ?? [];
                $breakdown = ['name' => $runName, 'date' => $dateStr];
                foreach (['Verbal', 'Clerical', 'General', 'Numerical', 'Analytical'] as $short) {
                    $found = false;
                    foreach ($scoreMap as $catName => $scoreData) {
                        if (str_contains($catName, $short)) {
                            $t = $scoreData['total'] ?? 0;
                            $c = $scoreData['correct'] ?? 0;
                            $breakdown[$short] = $t > 0 ? round(($c / $t) * 100) : 0;
                            $found = true;
                            break;
                        }
                    }
                    if (! $found) {
                        $breakdown[$short] = 0;
                    }
                }
                $attemptBreakdowns[] = $breakdown;
            }

            // Calculate category breakdown
            $formattedCategories = [];
            foreach ($categoryTotals as $catName => $totals) {
                $correct = $totals['correct'];
                $total = $totals['total'];
                $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;

                // Build subcategories from real attempt data only
                $subcatsData = [];
                if (isset($subcategoryTotals[$catName])) {
                    foreach ($subcategoryTotals[$catName] as $subName => $subTotals) {
                        $subCorrect = $subTotals['correct'];
                        $subTotal = $subTotals['total'];
                        if ($subTotal > 0) {
                            $subcatsData[] = [
                                'name' => $subName,
                                'correct' => (int) $subCorrect,
                                'total' => (int) $subTotal,
                                'percentage' => (int) round(($subCorrect / $subTotal) * 100),
                            ];
                        }
                    }
                }

                $formattedCategories[] = [
                    'name' => $catName,
                    'correct' => $correct,
                    'total' => $total,
                    'percentage' => $percentage,
                    'subcategories' => $subcatsData,
                ];
            }

            // Determine strongest and weakest categories
            $bestPct = -1;
            $worstPct = 101;
            foreach ($formattedCategories as $cat) {
                if ($cat['total'] > 0) {
                    if ($cat['percentage'] > $bestPct) {
                        $bestPct = $cat['percentage'];
                        $strongestArea = $cat['name'];
                    }
                    if ($cat['percentage'] < $worstPct) {
                        $worstPct = $cat['percentage'];
                        $weakestArea = $cat['name'];
                    }
                }
            }
        } else {
            $chartData = [];
            $attemptBreakdowns = [];
            $pacingTrend = [];
            $formattedCategories = [];
            $demoData = [
                'Verbal Ability' => [
                    'percentage' => 74,
                    'correct' => 37,
                    'total' => 50,
                    'subcategories' => [
                        ['name' => 'Reading Comprehension', 'correct' => 12, 'total' => 15, 'percentage' => 80],
                        ['name' => 'Vocabulary', 'correct' => 10, 'total' => 12, 'percentage' => 83],
                        ['name' => 'Grammar & Usage', 'correct' => 8, 'total' => 13, 'percentage' => 61],
                        ['name' => 'Paragraph Organization', 'correct' => 7, 'total' => 10, 'percentage' => 70],
                    ],
                ],
                'Clerical Ability' => [
                    'percentage' => 85,
                    'correct' => 34,
                    'total' => 40,
                    'subcategories' => [
                        ['name' => 'Spelling', 'correct' => 13, 'total' => 15, 'percentage' => 86],
                        ['name' => 'Filing', 'correct' => 11, 'total' => 13, 'percentage' => 84],
                        ['name' => 'Clerical Operations', 'correct' => 10, 'total' => 12, 'percentage' => 83],
                    ],
                ],
                'General Information' => [
                    'percentage' => 64,
                    'correct' => 16,
                    'total' => 25,
                    'subcategories' => [
                        ['name' => 'Philippine Constitution', 'correct' => 7, 'total' => 10, 'percentage' => 70],
                        ['name' => 'Code of Conduct (RA 6713)', 'correct' => 6, 'total' => 10, 'percentage' => 60],
                        ['name' => 'Environmental Conservation', 'correct' => 3, 'total' => 5, 'percentage' => 60],
                    ],
                ],
                'Numerical Ability' => [
                    'percentage' => 52,
                    'correct' => 26,
                    'total' => 50,
                    'subcategories' => [
                        ['name' => 'Basic Operations', 'correct' => 12, 'total' => 18, 'percentage' => 66],
                        ['name' => 'Word Problems', 'correct' => 8, 'total' => 20, 'percentage' => 40],
                        ['name' => 'Data Interpretation', 'correct' => 6, 'total' => 12, 'percentage' => 50],
                    ],
                ],
                'Analytical Ability' => [
                    'percentage' => 68,
                    'correct' => 27,
                    'total' => 40,
                    'subcategories' => [
                        ['name' => 'Word Analogy', 'correct' => 11, 'total' => 15, 'percentage' => 73],
                        ['name' => 'Symbolic Logic', 'correct' => 9, 'total' => 15, 'percentage' => 60],
                        ['name' => 'Number Series', 'correct' => 7, 'total' => 10, 'percentage' => 70],
                    ],
                ],
            ];

            foreach ($demoData as $catName => $d) {
                $formattedCategories[] = [
                    'name' => $catName,
                    'correct' => $d['correct'],
                    'total' => $d['total'],
                    'percentage' => $d['percentage'],
                    'subcategories' => $d['subcategories'],
                ];
            }

            for ($i = 1; $i <= 6; $i++) {
                $pacingTrend[] = [
                    'name' => 'Run #'.$i,
                    'date' => 'May '.(19 + $i),
                    'secondsPerQuestion' => rand(40, 75),
                    'accuracy' => rand(50, 90),
                ];
                $attemptBreakdowns[] = [
                    'name' => 'Run #'.$i,
                    'date' => 'May '.(19 + $i),
                    'Verbal' => rand(50, 90),
                    'Clerical' => rand(60, 95),
                    'General' => rand(40, 80),
                    'Numerical' => rand(30, 70),
                    'Analytical' => rand(40, 85),
                ];
            }

            $totalDurationText = '0 mins';
        }

        // Handle AI Predictor stats on index
        $analysis = UserAiAnalysis::where('user_id', $userId)->first();
        $latestMockAttemptId = ExamAttempt::where('user_id', $userId)->whereNull('category_id')->latest()->value('id');
        $latestAttemptId = $latestMockAttemptId ?: ExamAttempt::where('user_id', $userId)->latest()->value('id');

        $analysisStatus = 'no_data';
        $analysisData = null;

        // Per-user analysis mode (default: ai). AI only if user chose it AND server enables it.
        $userMode = Cache::get("user-analysis-mode-{$userId}", 'ai');
        $useAi = $userMode === 'ai' && config('services.ai.analysis_enabled') && $latestMockAttemptId;

        if ($latestAttemptId) {
            $cacheKey = "ai-analysis-generating-{$userId}";
            $failKey = "ai-analysis-failed-{$userId}";

            if (! $useAi) {
                $deterministicService = new DeterministicAnalysisService;
                $analysisStatus = 'ready';
                $analysisData = $deterministicService->generate($userId, $latestAttemptId);
            } else {
                $targetAttemptId = $latestMockAttemptId;
                if (! $analysis) {
                    if (! Cache::has($cacheKey) && ! Cache::has($failKey)) {
                        Cache::put($cacheKey, true, 60);
                        GenerateUserAnalysisJob::dispatchAfterResponse($userId, $targetAttemptId);
                    }
                    $analysisStatus = 'generating';
                } else {
                    if ($analysis->last_exam_attempt_id !== $targetAttemptId) {
                        if (! Cache::has($failKey)) {
                            if (! Cache::has($cacheKey)) {
                                Cache::put($cacheKey, true, 60);
                                GenerateUserAnalysisJob::dispatchAfterResponse($userId, $targetAttemptId);
                            }
                            $analysisStatus = 'generating';
                        } else {
                            $analysisStatus = 'failed';
                        }
                    } else {
                        $analysisStatus = 'ready';
                        $analysisData = $analysis->analysis_json;
                    }
                }
            }
        }

        $examDate = null;
        $examDateRaw = null;
        $daysUntilExam = null;
        if (Schema::hasTable('exam_dates')) {
            $examDateObj = ExamDate::where('is_active', true)
                ->where('date', '>', now())
                ->orderBy('date')
                ->first();
            if ($examDateObj) {
                $examDate = $examDateObj->date->format('F j, Y');
                $examDateRaw = $examDateObj->date->toDateString();
                $daysUntilExam = (int) ceil(now()->diffInDays($examDateObj->date, false));
            }
        }

        if (! $examDate) {
            $defaultDate = Carbon::parse('2026-08-09');
            $examDate = $defaultDate->format('F j, Y');
            $examDateRaw = $defaultDate->toDateString();
            $daysUntilExam = (int) ceil(now()->diffInDays($defaultDate, false));
        }

        return Inertia::render('user/analytics/index', [
            'stats' => [
                'filters' => [
                    'track' => $trackFilter,
                    'runs' => $runsFilter,
                ],
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
                'daysUntilExam' => $daysUntilExam,
                'examDate' => $examDate,
                'examDateRaw' => $examDateRaw,
                'pacingTrend' => $pacingTrend,
                'attemptBreakdowns' => $attemptBreakdowns,
            ],
            'aiAnalysis' => [
                'status' => $analysisStatus, // 'no_data' | 'generating' | 'ready' | 'failed'
                'data' => $analysisData,
            ],
        ]);
    }

    /**
     * Render the highly comprehensive predictive AI Diagnostic Report page.
     */
    public function aiAnalysisReport(Request $request)
    {
        $userId = auth()->id();

        if ($request->has('attempt_id')) {
            $attemptId = (int) $request->query('attempt_id');
            $attempt = ExamAttempt::where('user_id', $userId)->find($attemptId);
            if ($attempt) {
                $deterministicService = new DeterministicAnalysisService;
                $data = $deterministicService->generate($userId, $attemptId, true);
                $status = 'ready';

                $existingSchedules = StudySchedule::where('user_id', $userId)
                    ->where('study_date', '>=', now()->startOfDay())
                    ->get()
                    ->map(fn ($s) => [
                        'id' => $s->id,
                        'study_date' => $s->study_date->format('Y-m-d'),
                        'title' => $s->title,
                        'subcategory_id' => $s->subcategory_id,
                    ]);

                return Inertia::render('user/dashboard/ai-analysis', [
                    'status' => $status,
                    'data' => $data,
                    'isLocal' => app()->environment('local'),
                    'existingSchedules' => $existingSchedules,
                    'attempt_id' => $attemptId,
                ]);
            }
        }

        $analysis = UserAiAnalysis::where('user_id', $userId)->first();
        $latestMockAttemptId = ExamAttempt::where('user_id', $userId)->whereNull('category_id')->latest()->value('id');
        $latestAttemptId = $latestMockAttemptId ?: ExamAttempt::where('user_id', $userId)->latest()->value('id');

        $status = 'no_data';
        $data = null;

        // Per-user analysis mode (default: ai). AI only if user chose it AND server enables it.
        $userMode = Cache::get("user-analysis-mode-{$userId}", 'ai');
        $useAi = $userMode === 'ai' && config('services.ai.analysis_enabled') && $latestMockAttemptId;

        if ($latestAttemptId) {
            $cacheKey = "ai-analysis-generating-{$userId}";
            $failKey = "ai-analysis-failed-{$userId}";

            $isAdminOrLocal = app()->environment('local') || $request->user()?->role === 'admin';

            if ($isAdminOrLocal && $request->has('delete')) {
                UserAiAnalysis::where('user_id', $userId)->delete();
                Cache::forget($cacheKey);
                Cache::forget($failKey);

                return redirect('/analytics/ai-analysis');
            }

            if ($isAdminOrLocal && $request->has('retry')) {
                Cache::forget($cacheKey);
                Cache::forget($failKey);

                if (! Cache::has($cacheKey)) {
                    Cache::put($cacheKey, true, 60);
                    GenerateUserAnalysisJob::dispatchAfterResponse($userId, $latestAttemptId);
                }

                return redirect('/analytics/ai-analysis');
            }

            if (! $analysis) {
                if (! $useAi) {
                    $deterministicService = new DeterministicAnalysisService;
                    $analysis = UserAiAnalysis::updateOrCreate(
                        ['user_id' => $userId],
                        [
                            'last_exam_attempt_id' => $latestAttemptId,
                            'analysis_json' => $deterministicService->generate($userId, $latestAttemptId),
                        ]
                    );
                    $status = 'ready';
                    $data = $analysis->analysis_json;
                } else {
                    if (! Cache::has($cacheKey)) {
                        Cache::put($cacheKey, true, 60);
                        GenerateUserAnalysisJob::dispatchAfterResponse($userId, $latestAttemptId);
                    }
                    $status = 'generating';
                }
            } else {
                if ($analysis->last_exam_attempt_id !== $latestAttemptId) {
                    if (! $useAi) {
                        $deterministicService = new DeterministicAnalysisService;
                        $analysis = UserAiAnalysis::updateOrCreate(
                            ['user_id' => $userId],
                            [
                                'last_exam_attempt_id' => $latestAttemptId,
                                'analysis_json' => $deterministicService->generate($userId, $latestAttemptId),
                            ]
                        );
                        $status = 'ready';
                        $data = $analysis->analysis_json;
                    } else {
                        if (! Cache::has($failKey)) {
                            if (! Cache::has($cacheKey)) {
                                Cache::put($cacheKey, true, 60);
                                GenerateUserAnalysisJob::dispatchAfterResponse($userId, $latestAttemptId);
                            }
                            $status = 'generating';
                        } else {
                            $status = 'failed';
                        }
                    }
                } else {
                    $status = 'ready';
                    $data = $analysis->analysis_json;
                }
            }
        }

        $existingSchedules = StudySchedule::where('user_id', $userId)
            ->where('study_date', '>=', now()->startOfDay())
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'study_date' => $s->study_date->format('Y-m-d'),
                'title' => $s->title,
                'subcategory_id' => $s->subcategory_id,
            ]);

        return Inertia::render('user/dashboard/ai-analysis', [
            'status' => $status,
            'data' => $data,
            'isLocal' => app()->environment('local'),
            'existingSchedules' => $existingSchedules,
        ]);
    }
}
