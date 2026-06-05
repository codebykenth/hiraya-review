<?php

namespace App\Http\Middleware;

use Closure;
use ErrorException;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance as BaseMiddleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CheckMaintenanceMode extends BaseMiddleware
{
    /**
     * The URIs that should be reachable while maintenance mode is enabled.
     *
     * @var array<int, string>
     */
    protected $except = [
        '/login',
        '/logout',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  Request  $request
     * @return mixed
     *
     * @throws HttpException
     */
    public function handle($request, Closure $next)
    {
        // Check if the application is in maintenance mode
        if ($this->app->maintenanceMode()->active()) {

            // 1. Allow if user is already authenticated as an Admin
            if ($request->user() && $request->user()->role === 'admin') {
                return $next($request);
            }

            // 2. Allow if they are accessing standard bypass routes
            if ($this->inExceptArray($request)) {
                return $next($request);
            }

            // Get maintenance mode data safely
            try {
                $data = $this->app->maintenanceMode()->data();
            } catch (ErrorException $exception) {
                if (! $this->app->maintenanceMode()->active()) {
                    return $next($request);
                }
                throw $exception;
            }

            // 3. Fallback to Laravel's native bypass token logic
            if (isset($data['secret']) && $request->path() === $data['secret']) {
                return $this->bypassResponse($data['secret']);
            }

            if ($this->hasValidBypassCookie($request, $data)) {
                return $next($request);
            }

            // Block the request with the 503 Maintenance Exception (using Symfony's HttpException like base Laravel)
            throw new HttpException(
                $data['status'] ?? 503,
                'Service Unavailable',
                null,
                $this->getHeaders($data)
            );
        }

        return $next($request);
    }
}
