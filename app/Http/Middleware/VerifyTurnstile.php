<?php

namespace App\Http\Middleware;

use App\Services\TurnstileService;
use Closure;
use Illuminate\Http\Request;

class VerifyTurnstile
{
    protected TurnstileService $turnstileService;

    public function __construct(TurnstileService $turnstileService)
    {
        $this->turnstileService = $turnstileService;
    }

    public function handle(Request $request, Closure $next)
    {
        // Skip verification if Turnstile is not configured
        if (! $this->turnstileService->isConfigured()) {
            return $next($request);
        }

        // Verify Turnstile token for form submissions
        if ($request->isMethod('POST') && in_array($request->route()?->getName(), ['login', 'login.store', 'register', 'register.store', 'password.email'])) {
            $token = $request->input('cf_turnstile_response');
            if (empty($token) || ! $this->turnstileService->verify($token)) {
                return back()->withErrors([
                    'turnstile' => 'CAPTCHA verification failed. Please try again.',
                ])->withInput();
            }
        }

        return $next($request);
    }
}
