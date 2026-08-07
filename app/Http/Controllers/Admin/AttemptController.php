<?php

namespace App\Http\Controllers\Admin;

use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use App\Services\ExamAttemptFormatter;

class AttemptController
{
    public function __construct(
        protected ExamAttemptFormatter $formatter
    ) {}

    /**
     * Display a paginated list of all exam attempts.
     */
    public function index(Request $request): Response
    {
        $attempts = ExamAttempt::with(['user', 'category'])
            ->latest()
            ->paginate(10)
            ->through(function ($attempt) {
                $meta = $attempt->cat_scores['metadata'] ?? [];

                $correct = $meta['correct_count'] ?? 0;
                $total = $meta['total_questions'] ?? count($attempt->question_ids ?? []);
                
                $percentage = round($this->formatter->calculateWeightedPercentage($attempt->cat_scores ?? []), 2);

                $trackName = $meta['track'] ?? null;
                $categoryName = 'Full Mock Exam';

                if ($attempt->category) {
                    $categoryName = $attempt->category->name;
                } elseif ($trackName) {
                    $categoryName = $trackName . ' Level Reviewer';
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
                    'full_date' => $attempt->created_at?->format('M j, Y g:i A') ?? 'Unknown',
                ];
            });

        return Inertia::render('admin/attempts/index', [
            'attempts' => $attempts,
        ]);
    }
}
