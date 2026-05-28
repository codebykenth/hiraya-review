<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AcceptTermsController extends Controller
{
    /**
     * Accept terms and conditions.
     */
    public function store(): RedirectResponse
    {
        $user = Auth::user();

        if (! $user) {
            return redirect()->route('login');
        }

        $user->update(['terms_accepted_at' => now()]);

        return redirect()->intended(route('dashboard'));
    }
}
