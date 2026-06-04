<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupportRequest;
use App\Mail\SupportSubmittedMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class SupportController extends Controller
{
    /**
     * Handle the incoming contact support request.
     */
    public function store(SupportRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if (app()->isProduction() || config('services.support.test_rate_limit')) {
            $ip = $request->ip();
            if (RateLimiter::tooManyAttempts('support-submission:'.$ip, 1)) {
                return back()->withErrors([
                    'rate_limit' => 'You have already submitted a support request today. To prevent spam, submissions are limited to one per day.',
                ]);
            }
            RateLimiter::hit('support-submission:'.$ip, 86400); // 24 hours
        }

        Log::info('Support submission logged', [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message_length' => strlen($validated['message']),
        ]);

        // Send support email to platform administrator/owner
        Mail::to(env('DEV_EMAIL'))
            ->send(new SupportSubmittedMail($validated));

        return back()->with([
            'success' => 'Thank you for reaching out, '.$validated['name'].'! We have received your message and will reply within 24 hours.',
        ]);
    }
}
