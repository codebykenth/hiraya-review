<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CheckUserActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // After the request is processed, check if user is inactive
        // Only show the inactive page for GET requests (not API calls or form submissions)
        if (
            $request->user()
            && ! $request->user()->is_active
            && $request->isMethod('get')
            && $response->status() === 200
        ) {
            $adminEmail = env("DEV_EMAIL");

            // Render account-inactive page with 403 status
            return Inertia::render('account-inactive', [
                'adminEmail' => $adminEmail,
            ])
                ->toResponse($request)
                ->setStatusCode(403);
        }

        return $response;
    }
}
