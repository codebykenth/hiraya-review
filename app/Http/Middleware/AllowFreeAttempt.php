<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AllowFreeAttempt
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow access if free_attempt parameter is present
        if ($request->has('free_attempt') && $request->query('free_attempt') == '1') {
            $request->session()->put('is_free_attempt_active', true);

            return $next($request);
        }

        // Allow access if there is an active free attempt session flag
        if ($request->session()->get('is_free_attempt_active') === true) {
            return $next($request);
        }

        // Allow access if there is a pending guest attempt in session (for viewing the scorecard)
        if ($request->session()->has('pending_guest_attempt_id')) {
            return $next($request);
        }

        // Otherwise require authentication
        if (! Auth::check()) {
            abort(404);
        }

        return $next($request);
    }
}
