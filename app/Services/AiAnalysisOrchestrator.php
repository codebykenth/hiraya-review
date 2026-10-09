<?php

declare(strict_types=1);

namespace App\Services;

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\StudySchedule;
use App\Models\UserAiAnalysis;
use App\Services\Ai\AiGatewayService;
use Carbon\Carbon;
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
                'data' => $this->applyExamRollover($this->deterministicService->generate($userId, $latestAttemptId)),
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
                'data' => $this->applyExamRollover($this->deterministicService->generate($userId, $latestAttemptId)),
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
                    'data' => $this->applyExamRollover($analysisData, $analysis),
                ];
            }

            if (! Cache::has($failKey)) {
                if (! Cache::has($cacheKey)) {
                    Cache::put($cacheKey, true, 60);
                    GenerateUserAnalysisJob::dispatchAfterResponse($userId, $targetAttemptId);
                }

                return [
                    'status' => 'ready',
                    'data' => $this->applyExamRollover($this->deterministicService->generate($userId, $latestAttemptId)),
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
            'data' => $this->applyExamRollover($analysisData, $analysis),
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

            return ['status' => 'ready', 'data' => $this->applyExamRollover($data)];
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
                return ['status' => 'ready', 'data' => $this->applyExamRollover(is_array($analysis->analysis_json) ? $analysis->analysis_json : [], $analysis)];
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

        return ['status' => 'ready', 'data' => $this->applyExamRollover(is_array($analysis->analysis_json) ? $analysis->analysis_json : [], $analysis)];
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

    /**
     * Automatically roll over stale analysis data to the upcoming exam target.
     *
     * @param  array<string, mixed>|null  $data
     * @return array<string, mixed>|null
     */
    protected function applyExamRollover(?array $data, ?UserAiAnalysis $analysis = null): ?array
    {
        if (! $data) {
            return null;
        }

        $targetExam = ExamDate::getNextActiveOrEstimated();
        $nextExamDateStr = $targetExam['date_string'];
        $nextExamDescription = $targetExam['description'];

        $isPastCycle = false;

        // Check if the stored analysis was created prior to a now-past exam date
        if ($analysis && $analysis->created_at) {
            $pastExamExists = ExamDate::where('date', '<=', now())
                ->where('date', '>=', $analysis->created_at->subDays(7))
                ->exists();
            if ($pastExamExists) {
                $isPastCycle = true;
            }
        }

        // Sanitize any expired absolute dates from text fields (e.g. "before August 9, 2026")
        $textFields = ['verdict', 'priority_action', 'encouragement'];
        foreach ($textFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = $this->sanitizePastDateReferences($data[$field], $nextExamDateStr, $isPastCycle);
            }
        }

        if (isset($data['predictive_metrics']) && is_array($data['predictive_metrics'])) {
            foreach ($data['predictive_metrics'] as $key => $val) {
                if (is_string($val)) {
                    $data['predictive_metrics'][$key] = $this->sanitizePastDateReferences($val, $nextExamDateStr, $isPastCycle);
                }
            }
        }

        $data['is_past_cycle'] = $isPastCycle;
        $data['target_exam_date'] = $nextExamDateStr;
        $data['target_exam_description'] = $nextExamDescription;
        $data['days_until_target_exam'] = $targetExam['days_until'];

        if ($analysis && $isPastCycle && is_array($analysis->analysis_json)) {
            $analysis->update(['analysis_json' => $data]);
        }

        return $data;
    }

    /**
     * Replace past dates in text with the active upcoming exam date.
     */
    protected function sanitizePastDateReferences(string $text, string $nextExamDateStr, bool &$isPastCycle): string
    {
        return (string) preg_replace_callback(
            '/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}\b/i',
            function (array $matches) use ($nextExamDateStr, &$isPastCycle): string {
                try {
                    $date = Carbon::parse($matches[0]);
                    if ($date->isPast()) {
                        $isPastCycle = true;

                        return $nextExamDateStr;
                    }
                } catch (\Throwable) {
                    // Ignore unparseable strings
                }

                return $matches[0];
            },
            $text
        );
    }
}
