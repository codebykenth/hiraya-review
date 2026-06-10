<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeedbackRequest;
use App\Http\Requests\Admin\UpdateFeedbackStatusRequest;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function index(): Response
    {
        $feedbacks = Feedback::with(['user', 'flaggable'])
            ->latest()
            ->paginate(15);

        // Add the correct field names to the flaggable data
        $feedbacks->getCollection()->transform(function ($feedback) {
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
        NewFeedbackSubmitted($feedback);

        return back()->with('success', 'Feedback submitted successfully.');
    }

    public function updateStatus(UpdateFeedbackStatusRequest $request, Feedback $feedback): RedirectResponse
    {
        $feedback->update($request->validated());
        Cache::forget('pending_feedback_count');

        return back()->with('success', 'Feedback status updated.');
    }

    public function destroy(Feedback $feedback): RedirectResponse
    {
        $feedback->delete();
        Cache::forget('pending_feedback_count');

        return back()->with('success', 'Feedback deleted.');
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:feedbacks,id',
            'status' => 'required|in:pending,resolved,dismissed',
        ]);

        Feedback::whereIn('id', $validated['ids'])->update([
            'status' => $validated['status'],
        ]);
        Cache::forget('pending_feedback_count');

        return back()->with('success', 'Feedback status updated.');
    }

    public function bulkDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:feedbacks,id',
        ]);

        Feedback::whereIn('id', $validated['ids'])->delete();
        Cache::forget('pending_feedback_count');

        return back()->with('success', 'Feedback deleted.');
    }
}
