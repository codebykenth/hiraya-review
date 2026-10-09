<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\ExamDate;
use App\Models\LearnModule;
use App\Models\Payment;
use App\Models\StudySchedule;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

class DashboardService
{
    public function __construct(
        protected ExamAttemptFormatter $formatter,
        protected AiAnalysisOrchestrator $aiOrchestrator,
    ) {}

    /**
     * Aggregate full command center data for user dashboard.
     *
     * @return array{
     *     stats: array{daysUntilExam: int|null, examDate: string|null, examDateRaw: string|null, examDescription: string|null},
     *     aiAnalysis: array{status: string, data: mixed},
     *     dailyGoal: array{streak: int, questionsToday: int, goalTarget: int},
     *     todayTasks: Collection<int, array<string, mixed>>,
     *     overdueTasksCount: int,
     *     recentAttempts: Collection<int, array<string, mixed>>,
     *     nextModule: array<string, mixed>|null
     * }
     */
    public function getDashboardData(int $userId): array
    {
        $aiAnalysis = $this->aiOrchestrator->resolveStrictStatusAndData($userId);

        return [
            'stats' => $this->getExamDateStats(),
            'aiAnalysis' => [
                'status' => $aiAnalysis['status'],
                'data' => $aiAnalysis['data'],
            ],
            'dailyGoal' => $this->getDailyGoalStats($userId),
            'todayTasks' => $this->getTodayTasks($userId),
            'overdueTasksCount' => $this->getOverdueTasksCount($userId),
            'recentAttempts' => $this->getRecentAttempts($userId),
            'nextModule' => $this->getNextModule($userId),
            'billing' => $this->getBillingSummary($userId),
        ];
    }

    /**
     * @return array{daysUntilExam: int|null, examDate: string|null, examDateRaw: string|null, examDescription: string|null}
     */
    protected function getExamDateStats(): array
    {
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

        return [
            'daysUntilExam' => $daysUntilExam,
            'examDate' => $examDate,
            'examDateRaw' => $examDateRaw,
            'examDescription' => $examDescription,
        ];
    }

    /**
     * @return array{streak: int, questionsToday: int, goalTarget: int}
     */
    protected function getDailyGoalStats(int $userId): array
    {
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

        $todayAttempts = ExamAttempt::where('user_id', $userId)
            ->whereDate('created_at', Carbon::today())
            ->get();

        $questionsToday = 0;
        foreach ($todayAttempts as $attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $questionsToday += (int) ($meta['total_questions'] ?? count($attempt->question_ids ?? []));
        }

        return [
            'streak' => $streak,
            'questionsToday' => $questionsToday,
            'goalTarget' => 20,
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function getTodayTasks(int $userId): Collection
    {
        return StudySchedule::where('user_id', $userId)
            ->whereDate('study_date', Carbon::today())
            ->with(['subcategory.category'])
            ->orderBy('study_time', 'asc')
            ->get()
            ->map(function (StudySchedule $task): array {
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
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    protected function getRecentAttempts(int $userId): Collection
    {
        return ExamAttempt::where('user_id', $userId)
            ->with('category')
            ->latest()
            ->take(3)
            ->get()
            ->map(function (ExamAttempt $attempt): array {
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
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function getNextModule(int $userId): ?array
    {
        $allModules = LearnModule::where('is_published', true)
            ->with(['category', 'subcategory'])
            ->orderBy('id')
            ->get();

        $nextModuleModel = $allModules->first(fn (LearnModule $m): bool => ! $m->isCompletedBy($userId));

        return $nextModuleModel ? [
            'id' => $nextModuleModel->id,
            'title' => $nextModuleModel->title,
            'slug' => $nextModuleModel->slug,
            'topic' => $nextModuleModel->topic,
            'category_name' => $nextModuleModel->category?->name,
            'estimated_minutes' => $nextModuleModel->estimated_minutes,
        ] : null;
    }

    protected function getOverdueTasksCount(int $userId): int
    {
        return StudySchedule::where('user_id', $userId)
            ->where('study_date', '<', Carbon::today())
            ->where('is_done', false)
            ->count();
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function getBillingSummary(int $userId): ?array
    {
        $user = User::find($userId);
        if (! $user) {
            return null;
        }

        $latestPayment = Payment::where('user_id', $userId)
            ->where('status', 'paid')
            ->orderBy('id', 'desc')
            ->first();

        if (! $user->isPremium() && ! $latestPayment) {
            return null;
        }

        $plan = $latestPayment ? config("pricing.plans.{$latestPayment->plan_code}") : null;

        return [
            'is_premium' => $user->isPremium(),
            'plan_name' => $plan['name'] ?? ($user->premium_until ? 'Pro Reviewer Pass' : 'Lifetime Reviewer Pass'),
            'plan_code' => $latestPayment?->plan_code ?? ($user->premium_until ? 'pro_pass' : 'lifetime_access'),
            'amount' => $latestPayment ? (float) $latestPayment->amount : null,
            'paid_at' => $latestPayment?->paid_at?->toIso8601String(),
            'reference_id' => $latestPayment?->reference_id,
            'payment_method' => $latestPayment?->payment_method,
            'premium_until' => $user->premium_until?->toIso8601String(),
            'is_lifetime' => $user->is_premium && $user->premium_until === null,
        ];
    }
}
