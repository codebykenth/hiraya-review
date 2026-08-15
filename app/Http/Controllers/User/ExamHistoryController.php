<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\BulkDestroyAttemptsRequest;
use App\Models\ExamAttempt;
use App\Services\ExamAttemptFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ExamHistoryController
{
    public function __construct(
        protected ExamAttemptFormatter $formatter
    ) {}

    /**
     * Display a listing of past attempts for user.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $track = $request->input('track');
        $dateFilter = $request->input('date');
        $perPage = min(50, max(5, (int) $request->input('per_page', 10)));

        $userId = auth()->id();

        // 1. Fetch all user attempts for stats calculation
        $allUserAttempts = ExamAttempt::where('user_id', $userId)
            ->with('category:id,name')
            ->latest()
            ->get();

        $stats = $this->calculateHistoryStats($allUserAttempts);

        // 2. Filter attempts according to query parameters
        $filteredAttempts = $allUserAttempts;

        if ($dateFilter === '7') {
            $filteredAttempts = $filteredAttempts->filter(fn ($a) => $a->created_at >= now()->subDays(7));
        } elseif ($dateFilter === '30') {
            $filteredAttempts = $filteredAttempts->filter(fn ($a) => $a->created_at >= now()->subDays(30));
        }

        $formattedAttempts = $filteredAttempts->map(function ($attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $trackName = $meta['track'] ?? 'Drill';
            if ($attempt->category_id !== null && ! $trackName) {
                $trackName = 'Drill';
            }

            $categoryName = 'Full Mock Exam';
            if ($attempt->category) {
                $categoryName = $attempt->category->name;
            } elseif (isset($meta['category_name'])) {
                $categoryName = $meta['category_name'];
            }

            $correct = $meta['correct_count'] ?? 0;
            $total = $meta['total_questions'] ?? count($attempt->question_ids ?? []);
            $percentage = round($this->formatter->calculateWeightedPercentage($attempt->cat_scores ?? []), 2);
            $durationSecs = (int) ($meta['duration_secs'] ?? 0);
            $durationText = $this->formatter->formatDurationText($durationSecs);

            $status = 'Completed';
            if ($trackName !== 'Drill') {
                $status = $percentage >= 80 ? 'Pass' : 'Fail';
            }

            $avgTimePerQuestion = $total > 0 && $durationSecs > 0
                ? round($durationSecs / $total, 1)
                : 0;

            return [
                'id' => $attempt->id,
                'category_id' => $attempt->category_id,
                'date' => $attempt->created_at?->format('M d, Y') ?? '',
                'time' => $attempt->created_at?->format('h:i A') ?? '',
                'track' => $trackName,
                'category' => $categoryName,
                'score' => $percentage,
                'correct' => $correct,
                'wrong' => max(0, $total - $correct),
                'total' => $total,
                'category_scores' => $this->formatter->formatAttemptCategoryScores($attempt->cat_scores ?? []),
                'status' => $status,
                'duration' => $durationText,
                'duration_secs' => $durationSecs,
                'avg_time_per_q' => $avgTimePerQuestion,
                'created_at' => $attempt->created_at?->toIso8601String(),
                'selected_subcategories' => $meta['selected_subcategories'] ?? null,
                'language' => $meta['language'] ?? 'English',
                'question_count' => $meta['question_count'] ?? $total,
                'is_timed' => $meta['is_timed'] ?? true,
            ];
        });

        if ($track && $track !== 'All Tracks') {
            $formattedAttempts = $formattedAttempts->filter(function ($item) use ($track) {
                return strtolower($item['track']) === strtolower($track);
            });
        }

        if ($search) {
            $searchLower = strtolower($search);
            $formattedAttempts = $formattedAttempts->filter(function ($item) use ($searchLower) {
                return str_contains(strtolower($item['category']), $searchLower) ||
                       str_contains(strtolower($item['track']), $searchLower) ||
                       str_contains(strtolower((string) $item['id']), $searchLower);
            });
        }

        $page = (int) $request->input('page', 1);
        $totalItems = $formattedAttempts->count();
        $lastPage = max(1, (int) ceil($totalItems / $perPage));

        // Auto-redirect if page is out of bounds
        if ($page > $lastPage && $totalItems > 0) {
            return redirect()->route('history.index', array_merge($request->query(), ['page' => $lastPage]));
        }

        $paginatedAttempts = $formattedAttempts->slice(($page - 1) * $perPage, $perPage)->values()->toArray();

        return Inertia::render('user/history/index', [
            'attempts' => $paginatedAttempts,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $totalItems,
                'last_page' => $lastPage,
            ],
            'filters' => [
                'search' => $search ?? '',
                'track' => $track ?? 'All Tracks',
                'date' => $dateFilter ?? 'all',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Calculate global performance stats for the user history.
     */
    protected function calculateHistoryStats($attempts): array
    {
        $totalAttempts = $attempts->count();
        if ($totalAttempts === 0) {
            return [
                'total_attempts' => 0,
                'total_exams' => 0,
                'total_drills' => 0,
                'avg_score' => 0,
                'pass_rate' => 0,
                'total_duration' => '0m',
                'streak' => 0,
                'trend' => 0,
            ];
        }

        $totalDurationSecs = 0;
        $examDurationSecs = 0;
        $drillDurationSecs = 0;
        $totalScores = 0;
        $examScoresSum = 0;
        $drillScoresSum = 0;
        $mockExamCount = 0;
        $passedMockCount = 0;
        $drillCount = 0;
        $scoresList = [];

        foreach ($attempts as $attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $trackName = $meta['track'] ?? 'Drill';
            if ($attempt->category_id !== null && ! $trackName) {
                $trackName = 'Drill';
            }

            $percentage = $this->formatter->calculateWeightedPercentage($attempt->cat_scores ?? []);
            $totalScores += $percentage;
            $scoresList[] = [
                'score' => $percentage,
                'track' => $trackName,
                'created_at' => $attempt->created_at,
            ];

            $durationSecs = (int) ($meta['duration_secs'] ?? 0);
            $totalDurationSecs += $durationSecs;

            if ($trackName !== 'Drill') {
                $mockExamCount++;
                $examScoresSum += $percentage;
                $examDurationSecs += $durationSecs;
                if ($percentage >= 80) {
                    $passedMockCount++;
                }
            } else {
                $drillCount++;
                $drillScoresSum += $percentage;
                $drillDurationSecs += $durationSecs;
            }
        }

        $avgScore = round($totalScores / $totalAttempts, 1);
        $examAvgScore = $mockExamCount > 0 ? round($examScoresSum / $mockExamCount, 1) : 0;
        $drillAvgScore = $drillCount > 0 ? round($drillScoresSum / $drillCount, 1) : 0;
        $passRate = $mockExamCount > 0 ? round(($passedMockCount / $mockExamCount) * 100, 1) : 0;

        // Calculate recent pass/completion streak and trend (last 5 vs previous 5)
        $streak = 0;
        foreach ($scoresList as $item) {
            if ($item['track'] !== 'Drill') {
                if ($item['score'] >= 80) {
                    $streak++;
                } else {
                    break;
                }
            } else {
                if ($item['score'] >= 75) {
                    $streak++;
                } else {
                    break;
                }
            }
        }

        // Recent 5 vs next 5 trend
        $recent5 = array_slice($scoresList, 0, 5);
        $prev5 = array_slice($scoresList, 5, 5);
        $recentAvg = count($recent5) > 0 ? array_sum(array_column($recent5, 'score')) / count($recent5) : 0;
        $prevAvg = count($prev5) > 0 ? array_sum(array_column($prev5, 'score')) / count($prev5) : $recentAvg;
        $trend = round($recentAvg - $prevAvg, 1);

        return [
            'total_attempts' => $totalAttempts,
            'total_exams' => $mockExamCount,
            'total_drills' => $drillCount,
            'avg_score' => $avgScore,
            'exam_avg_score' => $examAvgScore,
            'drill_avg_score' => $drillAvgScore,
            'pass_rate' => $passRate,
            'total_duration' => $this->formatter->formatDurationText($totalDurationSecs),
            'exam_duration' => $this->formatter->formatDurationText($examDurationSecs),
            'drill_duration' => $this->formatter->formatDurationText($drillDurationSecs),
            'streak' => $streak,
            'trend' => $trend,
        ];
    }

    /**
     * Delete an exam attempt record.
     */
    public function destroy(ExamAttempt $attempt)
    {
        Gate::allowIf(fn ($user) => $user->id === $attempt->user_id);

        $attempt->delete();

        return redirect()->back()->with('success', 'Attempt record deleted successfully!');
    }

    /**
     * Delete multiple exam attempt records.
     */
    public function bulkDestroy(BulkDestroyAttemptsRequest $request)
    {
        $validated = $request->validated();

        ExamAttempt::whereIn('id', $validated['ids'])
            ->where('user_id', auth()->id())
            ->delete();

        return redirect()->back()->with('success', 'Selected attempt records deleted successfully!');
    }
}
