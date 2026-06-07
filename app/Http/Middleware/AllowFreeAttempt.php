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
            return $next($request);
        }

        // Otherwise require authentication
        if (! Auth::check()) {
            abort(404);
        }

        return $next($request);
    }
}
