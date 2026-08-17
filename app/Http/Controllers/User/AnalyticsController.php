<?php

namespace App\Http\Controllers\User;

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\StudySchedule;
use App\Models\UserAiAnalysis;
use App\Services\AiAnalysisOrchestrator;
use App\Services\AnalyticsService;
use App\Services\DeterministicAnalysisService;
use App\Services\ExamAttemptFormatter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController
{
    public function __construct(
        protected AnalyticsService $analyticsService,
        protected AiAnalysisOrchestrator $aiOrchestrator,
        protected ExamAttemptFormatter $formatter,
        protected DeterministicAnalysisService $deterministicService
    ) {}

    /**
     * Render the user analytics page with real performance metrics.
     */
    public function index(Request $request): Response
    {
        $userId = auth()->id();
        $trackFilter = $request->query('track', 'Professional');
        $runsFilter = $request->query('runs', 'all');

        $metrics = $this->analyticsService->getAnalyticsMetrics($userId, $trackFilter, $runsFilter);
        $aiAnalysis = $this->aiOrchestrator->resolveAnalysis($userId);

        // Compute global percentile rank against all system attempts
        $totalSystemAttempts = ExamAttempt::count();
        $percentileRank = 50;
        if ($totalSystemAttempts > 5 && $metrics['avgScore'] > 0) {
            $lowerCount = ExamAttempt::all()->filter(function ($att) use ($metrics) {
                $pct = $this->formatter->calculateWeightedPercentage($att->cat_scores ?? []);

                return $pct < $metrics['avgScore'];
            })->count();

            $percentileRank = (int) round(($lowerCount / $totalSystemAttempts) * 100);
        }

        $isIncompleteSyllabus = ($metrics['mockExamCount'] === 0 && $metrics['coveredCategoriesCount'] < 3);

        return Inertia::render('user/analytics/index', [
            'stats' => [
                'filters' => [
                    'track' => $trackFilter,
                    'runs' => $runsFilter,
                ],
                'avgScore' => $metrics['avgScore'],
                'totalExams' => $metrics['totalExams'],
                'strongestArea' => str_replace(' Ability', '', str_replace(' Information', '', $metrics['strongestArea'])),
                'weakestArea' => str_replace(' Ability', '', str_replace(' Information', '', $metrics['weakestArea'])),
                'chartData' => $metrics['chartData'],
                'categories' => $metrics['categories'],
                'passingRate' => $metrics['passingRate'],
                'totalDuration' => $metrics['totalDurationText'],
                'avgDuration' => $metrics['avgDurationText'],
                'totalQuestionsSolved' => $metrics['totalQuestionsSolved'],
                'daysUntilExam' => $metrics['daysUntilExam'],
                'examDate' => $metrics['examDate'],
                'examDateRaw' => $metrics['examDateRaw'],
                'pacingTrend' => $metrics['pacingTrend'],
                'attemptBreakdowns' => $metrics['attemptBreakdowns'],
                'cseReadinessIndex' => $metrics['cseReadinessIndex'],
                'subtestThresholds' => $metrics['subtestThresholds'],
                'hasSubtestRisk' => $metrics['hasSubtestRisk'],
                'percentileRank' => $percentileRank,
                'isIncompleteSyllabus' => $isIncompleteSyllabus,
                'coveredCategoriesCount' => $metrics['coveredCategoriesCount'],
                'mockExamCount' => $metrics['mockExamCount'],
            ],
            'aiAnalysis' => $aiAnalysis,
        ]);
    }

    /**
     * Render the predictive AI Diagnostic Report page.
     */
    public function aiAnalysisReport(Request $request): Response|RedirectResponse
    {
        $userId = auth()->id();

        if ($request->has('attempt_id')) {
            $attemptId = (int) $request->query('attempt_id');
            $attempt = ExamAttempt::where('user_id', $userId)->find($attemptId);
            if ($attempt) {
                $data = $this->deterministicService->generate($userId, $attemptId, true);

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
                    'status' => 'ready',
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
                    $analysis = UserAiAnalysis::updateOrCreate(
                        ['user_id' => $userId],
                        [
                            'last_exam_attempt_id' => $latestAttemptId,
                            'analysis_json' => $this->deterministicService->generate($userId, $latestAttemptId),
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
                        $analysis = UserAiAnalysis::updateOrCreate(
                            ['user_id' => $userId],
                            [
                                'last_exam_attempt_id' => $latestAttemptId,
                                'analysis_json' => $this->deterministicService->generate($userId, $latestAttemptId),
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

        $lastUpdated = $analysis?->updated_at ? $analysis->updated_at->diffForHumans() : null;

        return Inertia::render('user/dashboard/ai-analysis', [
            'status' => $status,
            'data' => $data,
            'isLocal' => app()->environment('local'),
            'existingSchedules' => $existingSchedules,
            'lastUpdated' => $lastUpdated,
        ]);
    }
}
