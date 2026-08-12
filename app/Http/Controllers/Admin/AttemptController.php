<?php

namespace App\Http\Controllers\Admin;

use App\Models\ExamAttempt;
use App\Models\User;
use App\Services\ExamAttemptFormatter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
        $query = ExamAttempt::with(['user', 'category'])->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('type')) {
            if ($request->type === 'mock') {
                $query->whereNull('category_id');
            } elseif ($request->type === 'drill') {
                $query->whereNotNull('category_id');
            }
        }

        $attempts = $query->paginate(10)
            ->withQueryString()
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
                    'full_date' => $attempt->created_at?->format('M j, Y g:i A') ?? 'Unknown',
                ];
            });

        $users = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('admin/attempts/index', [
            'attempts' => $attempts,
            'filters' => $request->only(['user_id', 'type']),
            'users' => $users,
        ]);
    }
}
