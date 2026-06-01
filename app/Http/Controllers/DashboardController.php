<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\UserAiAnalysis;
use App\Services\ExamAttemptFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected ExamAttemptFormatter $formatter
    ) {}

    /**
     * Render the user dashboard with real performance metrics.
     */
    public function index(Request $request)
    {
        $userId = auth()->id();
        $trackFilter = $request->query('track', 'Professional');
        $runsFilter = $request->query('runs', '6'); // Default to 6 runs

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
                    'label' => 'Run '.$attemptIdx++,
                    'date' => $date,
                    'track' => $track === 'Drill' ? 'Custom Drill' : $track.' Exam',
                    'detail' => "{$correct}/{$total} Correct",
                    'categoryScores' => $this->formatter->formatAttemptCategoryScores($attempt->cat_scores ?? []),
                ];
            }
            while (count($chartData) < 2) {
                array_unshift($chartData, [
                    'score' => 0,
                    'label' => 'Run '.(count($chartData) + 1),
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
            if ($catName === 'Verbal Ability') {
                $color = 'bg-emerald-600 dark:bg-emerald-500';
            }
            if ($catName === 'General Information') {
                $color = 'bg-emerald-850 dark:bg-emerald-700';
            }
            if ($catName === 'Numerical Ability') {
                $color = 'bg-rose-600 dark:bg-rose-500';
            }
            if ($catName === 'Analytical Ability') {
                $color = 'bg-amber-600 dark:bg-amber-500';
            }

            // Only show in diagnosticsummary the clerical if it is drill or subprof and for analytical show it only when prof or drill.
            if ($catName === 'Clerical Ability' && $trackFilter === 'Professional') {
                continue;
            }
            if ($catName === 'Analytical Ability' && $trackFilter === 'Subprofessional') {
                continue;
            }

            $formattedCategories[] = [
                'name' => str_replace(' Ability', '', str_replace(' Information', '', $catName)),
                'percentage' => $pct,
                'color' => $color,
                'correct' => $data['correct'],
                'total' => $data['total'],
            ];
        }

        $activeCategoryPercentages = array_filter($categoryPercentages, fn ($val) => $val > 0);
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

        $analysis = UserAiAnalysis::where('user_id', $userId)->first();
        $latestAttemptId = ExamAttempt::where('user_id', $userId)
            ->latest()->value('id');

        $analysisStatus = 'no_data';
        $analysisData = null;

        if ($latestAttemptId) {
            $generatedToday = $analysis && $analysis->updated_at->isToday();

            if (! $analysis || (! $generatedToday && $analysis->last_exam_attempt_id !== $latestAttemptId)) {
                // No analysis yet, OR: new exam exists AND not yet generated today
                $cacheKey = "ai-analysis-generating-{$userId}";
                if (! Cache::has($cacheKey)) {
                    Cache::put($cacheKey, true, 60);
                    GenerateUserAnalysisJob::dispatchAfterResponse($userId, $latestAttemptId);
                }
                $analysisStatus = 'generating';
            } else {
                // Serve cached: generated today already, or no new exam since last analysis
                $analysisStatus = 'ready';
                $analysisData = $analysis->analysis_json;
            }
        }

        if ($analysisStatus === 'ready' && $analysisData) {
            if (! empty($analysisData['strengths'])) {
                $strongestArea = $analysisData['strengths'][0];
            }
            if (! empty($analysisData['critical_weaknesses'])) {
                $weakestArea = $analysisData['critical_weaknesses'][0];
            }
        }

        return Inertia::render('dashboard/index', [
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
            ],
            'aiAnalysis' => [
                'status' => $analysisStatus, // 'no_data' | 'generating' | 'ready'
                'data' => $analysisData,
            ],
        ]);
    }
}
