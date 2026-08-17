<?php

namespace App\Services;

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\UserAiAnalysis;
use Illuminate\Support\Facades\Cache;

class AiAnalysisOrchestrator
{
    public function __construct(
        protected DeterministicAnalysisService $deterministicService
    ) {}

    /**
     * Resolve analysis status and data payload for the user.
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
        $useAi = $userMode === 'ai' && config('services.ai.analysis_enabled') && $latestMockAttemptId;

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
        $analysisData = $analysis->analysis_json;
        if ($latestAttemptId !== $latestMockAttemptId) {
            $freshDrillAnalysis = $this->deterministicService->generate($userId, $latestAttemptId);
            $analysisData['subject_breakdowns'] = $freshDrillAnalysis['subject_breakdowns'] ?? $analysisData['subject_breakdowns'];
            $analysisData['critical_weaknesses'] = $freshDrillAnalysis['critical_weaknesses'] ?? $analysisData['critical_weaknesses'];
            $analysisData['top_strengths'] = $freshDrillAnalysis['top_strengths'] ?? $analysisData['top_strengths'];
            $analysisData['readiness_index'] = $freshDrillAnalysis['readiness_index'] ?? $analysisData['readiness_index'];
        }

        return [
            'status' => 'ready',
            'data' => $analysisData,
        ];
    }
}
