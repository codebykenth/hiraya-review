<?php

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\Subcategory;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class AnalyticsService
{
    public function __construct(
        protected ExamAttemptFormatter $formatter
    ) {}

    /**
     * Compute full statistical metrics and breakdowns for a user's analytics view.
     */
    public function getAnalyticsMetrics(int $userId, string $trackFilter = 'Professional', string $runsFilter = 'all'): array
    {
        $allAttempts = ExamAttempt::where('user_id', $userId)->latest()->get();

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
        $mockExamCount = 0;
        $totalQuestionsSolved = 0;
        $totalDurationSecs = 0;
        $avgDurationText = '0 mins';
        $totalDurationText = '0 mins';
        $subcategoryTotals = [];

        $categoryTotals = [
            'Verbal Ability' => ['correct' => 0, 'total' => 0],
            'Clerical Ability' => ['correct' => 0, 'total' => 0],
            'General Information' => ['correct' => 0, 'total' => 0],
            'Numerical Ability' => ['correct' => 0, 'total' => 0],
            'Analytical Ability' => ['correct' => 0, 'total' => 0],
        ];

        $chartData = [];
        $attemptBreakdowns = [];
        $pacingTrend = [];
        $formattedCategories = [];

        if ($totalExams > 0) {
            $totalScoreSum = 0;
            $passCount = 0;

            foreach ($attempts as $attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $total = $meta['total_questions'] ?? count($attempt->question_ids);
                $percentage = round($this->formatter->calculateWeightedPercentage($attempt->cat_scores ?? []), 2);
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

            $avgScore = (int) round($totalScoreSum / $totalExams);
            $passingRate = $mockExamCount > 0 ? (int) round(($passCount / $mockExamCount) * 100) : 0;

            $hours = floor($totalDurationSecs / 3600);
            $minutes = floor(($totalDurationSecs % 3600) / 60);
            $totalDurationText = $hours > 0 ? "{$hours}h {$minutes}m" : "{$minutes} mins";

            $avgDurationSecs = (int) round($totalDurationSecs / $totalExams);
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

            $lastAttempts = $attempts->reverse();
            $attemptIdx = 1;
            foreach ($lastAttempts as $attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $total = $meta['total_questions'] ?? count($attempt->question_ids);
                $percentage = round($this->formatter->calculateWeightedPercentage($attempt->cat_scores ?? []), 2);
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

            $subcategoriesMap = Subcategory::all()->keyBy('name');
            foreach ($categoryTotals as $catName => $totals) {
                $correct = $totals['correct'];
                $total = $totals['total'];
                $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;

                $subcatsData = [];
                if (isset($subcategoryTotals[$catName])) {
                    foreach ($subcategoryTotals[$catName] as $subName => $subTotals) {
                        $subCorrect = $subTotals['correct'];
                        $subTotal = $subTotals['total'];
                        if ($subTotal > 0) {
                            $subModel = $subcategoriesMap->get($subName);
                            $subcatsData[] = [
                                'id' => $subModel?->id,
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

            $bestPct = -1;
            $worstPct = 101;
            foreach ($formattedCategories as $cat) {
                if ($cat['total'] > 0) {
                    if ($cat['percentage'] > $bestPct) {
                        $bestPct = $cat['percentage'];
                        $strongestArea = $cat['name'].' ('.$cat['percentage'].'%)';
                    }
                    if ($cat['percentage'] < $worstPct) {
                        $worstPct = $cat['percentage'];
                        $weakestArea = $cat['name'].' ('.$cat['percentage'].'%)';
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

        $subtestThresholds = [];
        $hasSubtestRisk = false;
        $coveredCategoriesCount = 0;
        foreach ($categoryTotals as $catName => $totals) {
            if ($totals['total'] > 0) {
                $coveredCategoriesCount++;
                $pct = round(($totals['correct'] / $totals['total']) * 100);
                $subtestThresholds[] = [
                    'category' => $catName,
                    'score' => $pct,
                    'passed' => $pct >= 70,
                ];
                if ($pct < 70) {
                    $hasSubtestRisk = true;
                }
            }
        }

        $isIncompleteSyllabus = ($mockExamCount === 0 && $coveredCategoriesCount < 3);

        $cseReadinessIndex = $avgScore;
        if ($isIncompleteSyllabus && $cseReadinessIndex > 65) {
            $cseReadinessIndex = 65;
        } elseif ($hasSubtestRisk && $cseReadinessIndex > 75) {
            $cseReadinessIndex = 75;
        }

        return [
            'totalExams' => $totalExams,
            'mockExamCount' => $mockExamCount,
            'avgScore' => $avgScore,
            'strongestArea' => $strongestArea,
            'weakestArea' => $weakestArea,
            'passingRate' => $passingRate,
            'totalQuestionsSolved' => $totalQuestionsSolved,
            'totalDurationText' => $totalDurationText,
            'avgDurationText' => $avgDurationText,
            'chartData' => $chartData,
            'attemptBreakdowns' => $attemptBreakdowns,
            'pacingTrend' => $pacingTrend,
            'categories' => $formattedCategories,
            'examDate' => $examDate,
            'examDateRaw' => $examDateRaw,
            'daysUntilExam' => $daysUntilExam,
            'cseReadinessIndex' => $cseReadinessIndex,
            'subtestThresholds' => $subtestThresholds,
            'hasSubtestRisk' => $hasSubtestRisk,
            'coveredCategoriesCount' => $coveredCategoriesCount,
        ];
    }
}
