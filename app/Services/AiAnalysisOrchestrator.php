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
        $latestMockAttemptId = ExamAttempt::where('user_id', $userId)->whereNull('category_id')->latest()->value('id');
        $latestAttemptId = $latestMockAttemptId ?: ExamAttempt::where('user_id', $userId)->latest()->value('id');

        if (! $latestAttemptId) {
            return ['status' => 'no_data', 'data' => null];
        }

        $userMode = Cache::get("user-analysis-mode-{$userId}", 'ai');
        $useAi = $userMode === 'ai' && config('services.ai.analysis_enabled') && $latestMockAttemptId;

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

            return ['status' => 'generating', 'data' => null];
        }

        if ($analysis->last_exam_attempt_id !== $targetAttemptId) {
            if (! Cache::has($failKey)) {
                if (! Cache::has($cacheKey)) {
                    Cache::put($cacheKey, true, 60);
                    GenerateUserAnalysisJob::dispatchAfterResponse($userId, $targetAttemptId);
                }

                return ['status' => 'generating', 'data' => null];
            }

            return ['status' => 'failed', 'data' => null];
        }

        return [
            'status' => 'ready',
            'data' => $analysis->analysis_json,
        ];
    }
}
