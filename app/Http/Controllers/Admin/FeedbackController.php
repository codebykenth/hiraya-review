<?php

namespace App\Http\Controllers\Admin;

use App\Events\NewFeedbackSubmitted;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkDestroyFeedbackRequest;
use App\Http\Requests\Admin\BulkUpdateFeedbackRequest;
use App\Http\Requests\Admin\StoreFeedbackRequest;
use App\Http\Requests\Admin\UpdateFeedbackStatusRequest;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(): Response
    {
        $feedbacks = Feedback::with(['user', 'flaggable'])
            ->latest()
            ->paginate(15);

        // Calculate total report count per target item across all users
        $counts = Feedback::selectRaw('flaggable_type, flaggable_id, count(*) as aggregate_count')
            ->groupBy('flaggable_type', 'flaggable_id')
            ->get()
            ->keyBy(fn ($item) => $item->flaggable_type.'_'.$item->flaggable_id);

        // Add the correct field names and total report count to the flaggable data
        $feedbacks->getCollection()->transform(function ($feedback) use ($counts) {
            $groupKey = $feedback->flaggable_type.'_'.$feedback->flaggable_id;
            $feedback->total_reports_count = $counts[$groupKey]->aggregate_count ?? 1;

            if ($feedback->flaggable_type === 'App\Models\Question' && $feedback->flaggable) {
                $feedback->flaggable->question_text = $feedback->flaggable->stem ?? null;
                $feedback->flaggable->options = $feedback->flaggable->options ?? [];
            } elseif ($feedback->flaggable_type === 'App\Models\LearnModule' && $feedback->flaggable) {
                $feedback->flaggable->question_text = $feedback->flaggable->title ?? null;
            }

            return $feedback;
        });

        $pendingCount = Feedback::where('status', 'pending')->count();

        return Inertia::render('admin/feedbacks/index', [
            'feedbacks' => $feedbacks,
            'pending_count' => $pendingCount,
        ]);
    }

    public function store(StoreFeedbackRequest $request): RedirectResponse
    {
        $feedback = $request->user()->feedbacks()->create($request->validated());

        // Broadcast new feedback event for real-time admin notifications
        NewFeedbackSubmitted::dispatch($feedback);

        return back()->with('success', 'Feedback submitted successfully.');
    }

    public function updateStatus(UpdateFeedbackStatusRequest $request, Feedback $feedback): RedirectResponse
    {
        Gate::authorize('update', $feedback);

        $newStatus = $request->validated('status');
        $feedback->update(['status' => $newStatus]);

        // Auto-update all pending reports for the exact same target item
        Feedback::where('flaggable_type', $feedback->flaggable_type)
            ->where('flaggable_id', $feedback->flaggable_id)
            ->where('status', 'pending')
            ->update(['status' => $newStatus]);

        Cache::forget('pending_feedback_count');

        return back()->with('success', 'Feedback status updated for this item and all related reports.');
    }

    public function destroy(Feedback $feedback): RedirectResponse
    {
        Gate::authorize('delete', $feedback);

        $feedback->delete();
        Cache::forget('pending_feedback_count');

        return back()->with('success', 'Feedback deleted.');
    }

    public function bulkUpdate(BulkUpdateFeedbackRequest $request): RedirectResponse
    {
        Gate::authorize('manageAny', Feedback::class);

        $ids = $request->validated('ids');
        $newStatus = $request->validated('status');

        $targets = Feedback::whereIn('id', $ids)
            ->get(['flaggable_type', 'flaggable_id']);

        Feedback::whereIn('id', $ids)->update(['status' => $newStatus]);

        foreach ($targets as $target) {
            Feedback::where('flaggable_type', $target->flaggable_type)
                ->where('flaggable_id', $target->flaggable_id)
                ->where('status', 'pending')
                ->update(['status' => $newStatus]);
        }

        Cache::forget('pending_feedback_count');

        return back()->with('success', 'Feedback status updated.');
    }

    public function bulkDestroy(BulkDestroyFeedbackRequest $request): RedirectResponse
    {
        Gate::authorize('manageAny', Feedback::class);

        Feedback::whereIn('id', $request->validated('ids'))->delete();
        Cache::forget('pending_feedback_count');

        return back()->with('success', 'Feedback deleted.');
    }
}
