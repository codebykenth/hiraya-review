<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Redirect the user to the provider authentication page.
     */
    public function redirectToProvider(string $provider): RedirectResponse
    {
        if (! in_array($provider, ['google', 'facebook'])) {
            abort(404, 'Authentication provider not supported.');
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from the provider and log them in.
     */
    public function handleProviderCallback(string $provider): RedirectResponse
    {
        if (! in_array($provider, ['google', 'facebook'])) {
            abort(404, 'Authentication provider not supported.');
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Social login failed. Please try again.',
            ]);
        }

        if (! $socialUser->getEmail()) {
            return redirect()->route('login')->withErrors([
                'email' => 'Could not retrieve email from '.ucfirst($provider).'.',
            ]);
        }

        // Check if user accepted terms during social login
        $termsAccepted = request()->query('terms_accepted') === '1';

        // Look for user by provider details
        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (! $user) {
            // Look for user by email address
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                // Connect existing user to provider
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                ]);
            } else {
                // Create new user
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'email' => $socialUser->getEmail(),
                    'password' => Hash::make(Str::random(24)),
                    'role' => 'user',
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'terms_accepted_at' => $termsAccepted ? now() : null,
                ]);

                $user->email_verified_at = now();
                $user->save();
            }
        }

        Auth::login($user, true);

        request()->session()->regenerate();

        if (session()->has('url.intended')) {
            return redirect()->intended();
        }

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('dashboard.index');
    }
}
