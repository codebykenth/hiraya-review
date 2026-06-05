<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeedbackRequest;
use App\Http\Requests\Admin\UpdateFeedbackStatusRequest;
use App\Models\Feedback;
use Illuminate\Http\RedirectResponse;
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

        return Inertia::render('admin/feedbacks/index', [
            'feedbacks' => $feedbacks,
        ]);
    }

    public function store(StoreFeedbackRequest $request): RedirectResponse
    {
        $request->user()->feedbacks()->create($request->validated());

        return back()->with('success', 'Feedback submitted successfully.');
    }

    public function updateStatus(UpdateFeedbackStatusRequest $request, Feedback $feedback): RedirectResponse
    {
        $feedback->update($request->validated());

        return back()->with('success', 'Feedback status updated.');
    }

    public function destroy(Feedback $feedback): RedirectResponse
    {
        $feedback->delete();

        return back()->with('success', 'Feedback deleted.');
    }
}
