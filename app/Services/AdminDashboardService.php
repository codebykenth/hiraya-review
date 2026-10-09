<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\Subcategory;
use App\Models\TrackConfig;
use App\Models\User;
use App\Repositories\PaymentRepositoryInterface;
use App\Services\Payment\XenditService;

class AdminDashboardService
{
    public function __construct(
        protected CategoryService $categoryService,
        protected ExamAttemptFormatter $formatter,
        protected PaymentRepositoryInterface $paymentRepository,
        protected XenditService $xenditService,
    ) {}

    /**
     * @return array{
     *     metrics: array<string, int>,
     *     financials: array<string, mixed>,
     *     categoriesStats: array<int, array{id: int, name: string, question_count: int}>,
     *     recentAttempts: array<int, mixed>,
     *     tracks: array<int, mixed>
     * }
     */
    public function getOverview(): array
    {
        $paymentStats = $this->paymentRepository->getPaymentStats();

        return [
            'metrics' => $this->getMetrics(),
            'financials' => [
                'real_balance' => $this->xenditService->getBalance('CASH'),
                'total_net_revenue' => $paymentStats['total_net_revenue'],
                'total_gross_revenue' => $paymentStats['total_revenue'],
                'total_fees' => $paymentStats['total_fees'],
                'total_vat' => $paymentStats['total_vat'],
                'total_deductions' => $paymentStats['total_deductions'],
                'paid_count' => $paymentStats['paid_count'],
            ],
            'categoriesStats' => $this->categoryService->getCategoryDistributionStats(),
            'recentAttempts' => $this->getRecentAttempts(),
            'tracks' => $this->getTrackConfigs(),
        ];
    }

    /**
     * @return array<string, int>
     */
    private function getMetrics(): array
    {
        $nonAdminScope = fn ($query) => $query->whereHas('user', fn ($q) => $q->where('role', '!=', 'admin'))
            ->orWhereNull('user_id');

        return [
            'total_questions' => Question::count(),
            'active_questions' => Question::where('status', 'active')->count(),
            'draft_questions' => Question::where('status', 'draft')->count(),
            'total_categories' => $this->categoryService->count(),
            'total_subcategories' => Subcategory::count(),
            'total_examinees' => User::where('role', '!=', 'admin')->count(),
            'total_attempts' => ExamAttempt::where($nonAdminScope)->count(),
            'guest_attempts' => ExamAttempt::whereNull('user_id')->count(),
            'track_configs' => TrackConfig::count(),
            'total_mock_exams' => ExamAttempt::where($nonAdminScope)->whereNull('category_id')->count(),
            'total_drills' => ExamAttempt::where($nonAdminScope)->whereNotNull('category_id')->count(),
        ];
    }

    /**
     * @return array<int, mixed>
     */
    private function getRecentAttempts(): array
    {
        $nonAdminScope = fn ($query) => $query->whereHas('user', fn ($q) => $q->where('role', '!=', 'admin'))
            ->orWhereNull('user_id');

        return ExamAttempt::where($nonAdminScope)
            ->with(['user', 'category'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];

                $correct = $meta['correct_count'] ?? 0;
                $total = $meta['total_questions'] ?? count($attempt->question_ids ?? []);

                $percentage = round($this->formatter->calculateWeightedPercentage($attempt->cat_scores ?? []), 2);

                $trackName = $meta['track'] ?? null;
                $categoryName = 'Full Mock Exam';

                if ($attempt->category) {
                    $categoryName = $attempt->category->name;
                } elseif ($trackName) {
                    $categoryName = $trackName.' Level Reviewer';
                } elseif (isset($meta['category_name'])) {
                    $categoryName = $meta['category_name'];
                }

                return [
                    'id' => $attempt->id,
                    'user' => [
                        'name' => $attempt->user?->name ?? 'Guest User',
                        'email' => $attempt->user?->email ?? 'Guest',
                    ],
                    'category' => $categoryName,
                    'percentage' => $percentage,
                    'created_at' => $attempt->created_at?->diffForHumans() ?? 'Just now',
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, mixed>
     */
    private function getTrackConfigs(): array
    {
        return TrackConfig::with('category')
            ->get()
            ->map(function ($track) {
                return [
                    'id' => $track->id,
                    'track' => $track->track,
                    'category' => $track->category?->name ?? 'All Scope',
                    'item_count' => $track->item_count,
                    'time_limit' => $track->time_limit_secs ? round($track->time_limit_secs / 60).' mins' : 'No limit',
                ];
            })
            ->values()
            ->all();
    }
}
