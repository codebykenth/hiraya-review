<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckUserActive
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() && ! $request->user()->is_active) {
            $allowedRoutes = ['account-inactive', 'logout'];

            if (! $request->routeIs($allowedRoutes)) {
                return redirect()->route('account-inactive');
            }
        }

        return $next($request);
    }
}
