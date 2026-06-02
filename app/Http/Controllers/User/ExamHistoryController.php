<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\BulkDestroyAttemptsRequest;
use App\Models\ExamAttempt;
use App\Services\ExamAttemptFormatter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamHistoryController
{
    public function __construct(
        protected ExamAttemptFormatter $formatter
    ) {}

    /**
     * Display a listing of past attempts for user.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $track = $request->input('track');
        $dateFilter = $request->input('date');

        $query = ExamAttempt::where('user_id', auth()->id())
            ->with('category');

        if ($dateFilter === '7') {
            $query->where('created_at', '>=', now()->subDays(7));
        } elseif ($dateFilter === '30') {
            $query->where('created_at', '>=', now()->subDays(30));
        }

        $attempts = $query->latest()->get()->map(function ($attempt) {
            $meta = $attempt->cat_scores['metadata'] ?? [];
            $trackName = $meta['track'] ?? 'Drill';
            if ($attempt->category_id !== null && ! $trackName) {
                $trackName = 'Drill';
            }

            $categoryName = 'Full Mock Exam';
            if ($attempt->category) {
                $categoryName = $attempt->category->name;
            } elseif (isset($meta['category_name'])) {
                $categoryName = $meta['category_name'];
            }

            $correct = $meta['correct_count'] ?? 0;
            $total = $meta['total_questions'] ?? count($attempt->question_ids);
            $percentage = $total > 0 ? round(($correct / $total) * 100) : 0;
            $durationSecs = (int) ($meta['duration_secs'] ?? 0);
            $durationText = $this->formatter->formatDurationText($durationSecs);

            $status = 'Completed';
            if ($trackName !== 'Drill') {
                $status = $percentage >= 80 ? 'Pass' : 'Fail';
            }

            return [
                'id' => $attempt->id,
                'category_id' => $attempt->category_id,
                'date' => $attempt->created_at?->format('M d, Y') ?? '',
                'time' => $attempt->created_at?->format('h:i A') ?? '',
                'track' => $trackName,
                'category' => $categoryName,
                'score' => $percentage,
                'correct' => $correct,
                'total' => $total,
                'category_scores' => $this->formatter->formatAttemptCategoryScores($attempt->cat_scores ?? []),
                'status' => $status,
                'duration' => $durationText,
                'created_at' => $attempt->created_at?->toIso8601String(),
                'selected_subcategories' => $meta['selected_subcategories'] ?? null,
                'language' => $meta['language'] ?? 'English',
                'question_count' => $meta['question_count'] ?? $total,
                'is_timed' => $meta['is_timed'] ?? true,
            ];
        });

        if ($track && $track !== 'All Tracks') {
            $attempts = $attempts->filter(function ($item) use ($track) {
                return strtolower($item['track']) === strtolower($track);
            });
        }

        if ($search) {
            $attempts = $attempts->filter(function ($item) use ($search) {
                return str_contains(strtolower($item['category']), strtolower($search)) ||
                       str_contains(strtolower($item['track']), strtolower($search)) ||
                       str_contains(strtolower((string) $item['id']), strtolower($search));
            });
        }

        $page = (int) $request->input('page', 1);
        $perPage = 4;
        $totalItems = $attempts->count();
        $lastPage = max(1, ceil($totalItems / $perPage));

        // Auto-redirect if page is out of bounds (e.g. after deleting the last items on a page)
        if ($page > $lastPage && $totalItems > 0) {
            return redirect()->route('history.index', array_merge($request->query(), ['page' => $lastPage]));
        }

        $paginatedAttempts = $attempts->slice(($page - 1) * $perPage, $perPage)->values()->toArray();

        return Inertia::render('user/history/index', [
            'attempts' => $paginatedAttempts,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $totalItems,
                'last_page' => max(1, ceil($totalItems / $perPage)),
            ],
            'filters' => [
                'search' => $search ?? '',
                'track' => $track ?? 'All Tracks',
                'date' => $dateFilter ?? '30',
            ],
        ]);
    }

    /**
     * Delete an exam attempt record.
     */
    public function destroy(ExamAttempt $attempt)
    {
        if ($attempt->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $attempt->delete();

        return redirect()->back()->with('success', 'Attempt record deleted successfully!');
    }

    /**
     * Delete multiple exam attempt records.
     */
    public function bulkDestroy(BulkDestroyAttemptsRequest $request)
    {
        $validated = $request->validated();

        ExamAttempt::whereIn('id', $validated['ids'])
            ->where('user_id', auth()->id())
            ->delete();

        return redirect()->back()->with('success', 'Selected attempt records deleted successfully!');
    }
}
