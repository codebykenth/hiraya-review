<?php

namespace App\Http\Controllers\User;

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\LearnModule;
use App\Models\StudySchedule;
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
     * Render the comprehensive user dashboard command center.
     */
    public function index(Request $request)
    {
        $userId = auth()->id();

        $examDate = null;
        $examDateRaw = null;
        $examDescription = null;
        $daysUntilExam = null;
        if (Schema::hasTable('exam_dates')) {
            $examDateObj = ExamDate::where('is_active', true)
                ->where('date', '>', now())
                ->orderBy('date')
                ->first();
            if ($examDateObj) {
                $examDate = $examDateObj->date->format('F j, Y');
                $examDateRaw = $examDateObj->date->toDateString();
                $examDescription = $examDateObj->description;
                $daysUntilExam = (int) ceil(now()->diffInDays($examDateObj->date, false));
            }
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

        if (! $examDate) {
            $analysisStatus = 'no_exam_date';
        } elseif ($latestAttemptId) {
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

        // --- STREAK & DAILY STUDY METRICS ---
        $attemptDates = ExamAttempt::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(60))
            ->selectRaw('DATE(created_at) as activity_date')
            ->pluck('activity_date');

        $activeDates = $attemptDates->unique()->sortDesc()->values();

        $streak = 0;
        $todayStr = now()->toDateString();
        $yesterdayStr = now()->subDay()->toDateString();
        $startCheck = $activeDates->contains($todayStr) ? now() : ($activeDates->contains($yesterdayStr) ? now()->subDay() : null);

        if ($startCheck) {
            $cursor = $startCheck;
            while ($activeDates->contains($cursor->toDateString()) && $streak < 60) {
                $streak++;
                $cursor = $cursor->subDay();
            }
        }

        // Today's Questions Solved
        $todayAttempts = ExamAttempt::where('user_id', $userId)
            ->whereDate('created_at', Carbon::today())
            ->get();

        $questionsToday = 0;
        foreach ($todayAttempts as $attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $questionsToday += (int) ($meta['total_questions'] ?? count($attempt->question_ids ?? []));
        }

        // --- TODAY'S SCHEDULED TASKS ---
        $todayTasks = StudySchedule::where('user_id', $userId)
            ->whereDate('study_date', Carbon::today())
            ->with(['subcategory.category'])
            ->orderBy('study_time', 'asc')
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'description' => $task->description,
                    'study_time' => $task->study_time ? Carbon::parse($task->study_time)->format('h:i A') : null,
                    'is_done' => (bool) $task->is_done,
                    'subcategory_name' => $task->subcategory?->name,
                    'category_name' => $task->subcategory?->category?->name,
                ];
            });

        // --- RECENT ATTEMPTS (LAST 3) ---
        $recentAttempts = ExamAttempt::where('user_id', $userId)
            ->with('category')
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];
                $scorePercentage = (float) $this->formatter->calculateWeightedPercentage($attempt->cat_scores ?? []);
                $isTrackExam = empty($attempt->category_id);
                $trackName = $meta['track'] ?? ($isTrackExam ? 'Mock Exam' : 'Practice Drill');
                $totalQuestions = (int) ($meta['total_questions'] ?? count($attempt->question_ids ?? []));
                $timeTakenSeconds = (int) ($meta['time_taken_seconds'] ?? 0);

                return [
                    'id' => $attempt->id,
                    'title' => $attempt->category?->name ?? ($trackName.' - '.($meta['exam_type'] ?? 'General')),
                    'score_percentage' => round($scorePercentage, 1),
                    'passed' => $scorePercentage >= 80,
                    'is_mock' => $isTrackExam,
                    'total_questions' => $totalQuestions,
                    'duration_text' => $this->formatter->formatDurationText($timeTakenSeconds),
                    'created_at_human' => $attempt->created_at ? $attempt->created_at->diffForHumans() : 'Recently',
                ];
            });

        // --- NEXT RECOMMENDED / UNCOMPLETED LEARN MODULE ---
        $allModules = LearnModule::where('is_published', true)
            ->with(['category', 'subcategory'])
            ->orderBy('id')
            ->get();

        $nextModuleModel = $allModules->first(fn ($m) => ! $m->isCompletedBy($userId));
        $nextModule = $nextModuleModel ? [
            'id' => $nextModuleModel->id,
            'title' => $nextModuleModel->title,
            'slug' => $nextModuleModel->slug,
            'topic' => $nextModuleModel->topic,
            'category_name' => $nextModuleModel->category?->name,
            'estimated_minutes' => $nextModuleModel->estimated_minutes,
        ] : null;

        // --- OVERDUE TASKS COUNT ---
        $overdueTasksCount = StudySchedule::where('user_id', $userId)
            ->where('study_date', '<', Carbon::today())
            ->where('is_done', false)
            ->count();

        return Inertia::render('user/dashboard/index', [
            'stats' => [
                'daysUntilExam' => $daysUntilExam,
                'examDate' => $examDate,
                'examDateRaw' => $examDateRaw,
                'examDescription' => $examDescription,
            ],
            'aiAnalysis' => [
                'status' => $analysisStatus,
                'data' => $analysisData,
            ],
            'dailyGoal' => [
                'streak' => $streak,
                'questionsToday' => $questionsToday,
                'goalTarget' => 20,
            ],
            'todayTasks' => $todayTasks,
            'overdueTasksCount' => $overdueTasksCount,
            'recentAttempts' => $recentAttempts,
            'nextModule' => $nextModule,
        ]);
    }
}
