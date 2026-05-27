<?php

namespace App\Http\Controllers;

use App\Http\Requests\SupportRequest;
use App\Mail\SupportSubmittedMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SupportController extends Controller
{
    /**
     * Handle the incoming contact support request.
     */
    public function store(SupportRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Log::info('Support submission logged', [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'message_length' => strlen($validated['message']),
        ]);

        // Send support email to platform administrator/owner
        Mail::to(env('DEV_EMAIL'))
            ->send(new SupportSubmittedMail($validated));

        return back()->with([
            'success' => 'Thank you for reaching out, ' . $validated['name'] . '! We have received your message and will reply within 24 hours.'
        ]);
    }
}
