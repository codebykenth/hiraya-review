<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Auth\Middleware\RequirePassword;
use Symfony\Component\HttpFoundation\Response;

class ConfirmPasswordForNonSocialUsers
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $redirectToRoute = null): Response
    {
        $user = $request->user();

        // If the user is logged in via a social provider and has no password, bypass password confirmation
        if ($user && ($user->provider || is_null($user->password))) {
            return $next($request);
        }

        // Otherwise, run the standard password confirmation middleware logic
        return app(RequirePassword::class)->handle($request, $next, $redirectToRoute);
    }
}
