<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\StudySchedule;
use App\Models\UserAiAnalysis;
use App\Services\Ai\AiGatewayService;
use Illuminate\Support\Facades\Cache;

class AiAnalysisOrchestrator
{
    public function __construct(
        protected DeterministicAnalysisService $deterministicService,
        protected AiGatewayService $aiGateway
    ) {}

    /**
     * Resolve analysis status and data payload for the user (standard fallback).
     *
     * @return array{status: string, data: mixed}
     */
    public function resolveAnalysis(int $userId): array
    {
        $analysis = UserAiAnalysis::where('user_id', $userId)->first();
        $latestAttemptId = ExamAttempt::where('user_id', $userId)->latest()->value('id');
        $latestMockAttemptId = ExamAttempt::where('user_id', $userId)->whereNull('category_id')->latest()->value('id');

        if (! $latestAttemptId) {
            return ['status' => 'no_data', 'data' => null];
        }

        $userMode = Cache::get("user-analysis-mode-{$userId}", 'ai');
        $useAi = $userMode === 'ai' && $this->aiGateway->isAiConfigured() && $latestMockAttemptId;

        // If user is in instant mode or only has drills, immediately generate reactive analysis for the latest attempt
        if (! $useAi) {
            return [
                'status' => 'ready',
                'data' => $this->deterministicService->generate($userId, $latestAttemptId),
            ];
        }

        $targetAttemptId = $latestMockAttemptId;
        $cacheKey = "ai-analysis-generating-{$userId}";
        $failKey = "ai-analysis-failed-{$userId}";

        if (! $analysis) {
            if (! Cache::has($cacheKey) && ! Cache::has($failKey)) {
                Cache::put($cacheKey, true, 60);
                GenerateUserAnalysisJob::dispatchAfterResponse($userId, $targetAttemptId);
            }

            return [
                'status' => 'ready',
                'data' => $this->deterministicService->generate($userId, $latestAttemptId),
            ];
        }

        if ($analysis->last_exam_attempt_id !== $targetAttemptId) {
            $isCooldownActive = $analysis->updated_at && $analysis->updated_at->gt(now()->subHours(24));
            if ($isCooldownActive) {
                $analysisData = is_array($analysis->analysis_json) ? $analysis->analysis_json : [];
                if ($latestAttemptId !== $latestMockAttemptId) {
                    $freshDrillAnalysis = $this->deterministicService->generate($userId, $latestAttemptId);
                    $analysisData['subject_breakdowns'] = $freshDrillAnalysis['subject_breakdowns'] ?? ($analysisData['subject_breakdowns'] ?? []);
                    $analysisData['critical_weaknesses'] = $freshDrillAnalysis['critical_weaknesses'] ?? ($analysisData['critical_weaknesses'] ?? []);
                    $analysisData['top_strengths'] = $freshDrillAnalysis['top_strengths'] ?? ($analysisData['top_strengths'] ?? []);
                    $analysisData['readiness_index'] = $freshDrillAnalysis['readiness_index'] ?? ($analysisData['readiness_index'] ?? 0);
                }

                return [
                    'status' => 'ready',
                    'data' => $analysisData,
                ];
            }

            if (! Cache::has($failKey)) {
                if (! Cache::has($cacheKey)) {
                    Cache::put($cacheKey, true, 60);
                    GenerateUserAnalysisJob::dispatchAfterResponse($userId, $targetAttemptId);
                }

                return [
                    'status' => 'ready',
                    'data' => $this->deterministicService->generate($userId, $latestAttemptId),
                ];
            }

            return ['status' => 'failed', 'data' => null];
        }

        // Merge latest drill evaluations so existing analysis stays dynamically refreshed
        $analysisData = is_array($analysis->analysis_json) ? $analysis->analysis_json : [];
        if ($latestAttemptId !== $latestMockAttemptId) {
            $freshDrillAnalysis = $this->deterministicService->generate($userId, $latestAttemptId);
            $analysisData['subject_breakdowns'] = $freshDrillAnalysis['subject_breakdowns'] ?? ($analysisData['subject_breakdowns'] ?? []);
            $analysisData['critical_weaknesses'] = $freshDrillAnalysis['critical_weaknesses'] ?? ($analysisData['critical_weaknesses'] ?? []);
            $analysisData['top_strengths'] = $freshDrillAnalysis['top_strengths'] ?? ($analysisData['top_strengths'] ?? []);
            $analysisData['readiness_index'] = $freshDrillAnalysis['readiness_index'] ?? ($analysisData['readiness_index'] ?? 0);
        }

        return [
            'status' => 'ready',
            'data' => $analysisData,
        ];
    }

    /**
     * Resolve strict state-machine analysis status & data (for Dashboard & Report page).
     *
     * @return array{status: string, data: mixed}
     */
    public function resolveStrictStatusAndData(int $userId, bool $persistDeterministic = false): array
    {
        $analysis = UserAiAnalysis::where('user_id', $userId)->first();
        $latestMockAttemptId = ExamAttempt::where('user_id', $userId)->whereNull('category_id')->latest()->value('id');
        $latestAttemptId = $latestMockAttemptId ?: ExamAttempt::where('user_id', $userId)->latest()->value('id');

        if (! $latestAttemptId) {
            return ['status' => 'no_data', 'data' => null];
        }

        $userMode = Cache::get("user-analysis-mode-{$userId}", 'ai');
        $useAi = $userMode === 'ai' && $this->aiGateway->isAiConfigured() && $latestMockAttemptId;

        $targetAttemptId = $useAi ? $latestMockAttemptId : $latestAttemptId;
        $cacheKey = "ai-analysis-generating-{$userId}";
        $failKey = "ai-analysis-failed-{$userId}";

        if (! $useAi) {
            $data = $this->deterministicService->generate($userId, $latestAttemptId);
            if ($persistDeterministic) {
                UserAiAnalysis::updateOrCreate(
                    ['user_id' => $userId],
                    [
                        'last_exam_attempt_id' => $latestAttemptId,
                        'analysis_json' => $data,
                    ]
                );
            }

            return ['status' => 'ready', 'data' => $data];
        }

        if (! $analysis) {
            if (! Cache::has($cacheKey) && ! Cache::has($failKey)) {
                Cache::put($cacheKey, true, 60);
                GenerateUserAnalysisJob::dispatchAfterResponse($userId, $targetAttemptId);
            }

            return ['status' => 'generating', 'data' => null];
        }

        if ($analysis->last_exam_attempt_id !== $targetAttemptId) {
            $isCooldownActive = $analysis->updated_at && $analysis->updated_at->gt(now()->subHours(24));
            if ($isCooldownActive) {
                return ['status' => 'ready', 'data' => $analysis->analysis_json];
            }

            if (! Cache::has($failKey)) {
                if (! Cache::has($cacheKey)) {
                    Cache::put($cacheKey, true, 60);
                    GenerateUserAnalysisJob::dispatchAfterResponse($userId, $targetAttemptId);
                }

                return ['status' => 'generating', 'data' => null];
            }

            return ['status' => 'failed', 'data' => null];
        }

        return ['status' => 'ready', 'data' => $analysis->analysis_json];
    }

    /**
     * Resolve full view payload for the predictive AI Diagnostic Report page.
     *
     * @return array<string, mixed>
     */
    public function resolveReportPageData(int $userId, ?int $attemptId = null): array
    {
        $existingSchedules = StudySchedule::where('user_id', $userId)
            ->where('study_date', '>=', now()->startOfDay())
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'study_date' => $s->study_date->format('Y-m-d'),
                'title' => $s->title,
                'subcategory_id' => $s->subcategory_id,
            ]);

        if ($attemptId !== null) {
            $attempt = ExamAttempt::where('user_id', $userId)->find($attemptId);
            if ($attempt) {
                return [
                    'status' => 'ready',
                    'data' => $this->deterministicService->generate($userId, $attemptId, true),
                    'isLocal' => app()->environment('local'),
                    'existingSchedules' => $existingSchedules,
                    'attempt_id' => $attemptId,
                ];
            }
        }

        $result = $this->resolveStrictStatusAndData($userId, true);
        $analysis = UserAiAnalysis::where('user_id', $userId)->first();
        $lastUpdated = $analysis?->updated_at ? $analysis->updated_at->diffForHumans() : null;

        return [
            'status' => $result['status'],
            'data' => $result['data'],
            'isLocal' => app()->environment('local'),
            'existingSchedules' => $existingSchedules,
            'lastUpdated' => $lastUpdated,
        ];
    }

    public function deleteAnalysis(int $userId): void
    {
        UserAiAnalysis::where('user_id', $userId)->delete();
        Cache::forget("ai-analysis-generating-{$userId}");
        Cache::forget("ai-analysis-failed-{$userId}");
    }

    public function retryAnalysis(int $userId): void
    {
        $cacheKey = "ai-analysis-generating-{$userId}";
        $failKey = "ai-analysis-failed-{$userId}";

        Cache::forget($cacheKey);
        Cache::forget($failKey);

        $latestMockAttemptId = ExamAttempt::where('user_id', $userId)->whereNull('category_id')->latest()->value('id');
        $latestAttemptId = $latestMockAttemptId ?: ExamAttempt::where('user_id', $userId)->latest()->value('id');

        if ($latestAttemptId && ! Cache::has($cacheKey)) {
            Cache::put($cacheKey, true, 60);
            GenerateUserAnalysisJob::dispatchAfterResponse($userId, $latestAttemptId);
        }
    }
}
