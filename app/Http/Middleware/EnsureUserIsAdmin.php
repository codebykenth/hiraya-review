<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! auth()->user() || auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized access to administration area.');
        }

        return $next($request);
    }
}
