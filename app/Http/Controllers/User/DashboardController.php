<?php

namespace App\Http\Controllers\User;

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\UserAiAnalysis;
use App\Services\DeterministicAnalysisService;
use App\Services\ExamAttemptFormatter;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class DashboardController
{
    public function __construct(
        protected ExamAttemptFormatter $formatter
    ) {}

    /**
     * Render the simplified user dashboard.
     */
    public function index(Request $request)
    {
        $userId = auth()->id();

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

        // Fetch user attempts and determine AI Predictor stats
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

        return Inertia::render('user/dashboard/index', [
            'stats' => [
                'daysUntilExam' => $daysUntilExam,
                'examDate' => $examDate,
                'examDateRaw' => $examDateRaw,
            ],
            'aiAnalysis' => [
                'status' => $analysisStatus,
                'data' => $analysisData,
            ],
        ]);
    }
}
