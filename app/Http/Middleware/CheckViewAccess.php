<?php

namespace App\Http\Middleware;

use App\Models\RolePermission;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CheckViewAccess
{
    /**
     * Map of route prefixes/patterns to view management names.
     */
    protected array $routeMap = [
        'dashboard.*' => 'dashboard',
        'guide' => 'reviewer-guide',
        'study-schedules.*' => 'study-plan',
        'learn.*' => 'learn',
        'drills.*' => 'practice-drills',
        'exams.*' => 'mock-exams',
        'history.*' => 'history',
        'analytics.*' => 'analytics',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        // If not logged in, we let standard auth middleware handle it
        if (! $user) {
            return $next($request);
        }

        // Fetch permissions from cache (same as HandleInertiaRequests)
        $permissions = Cache::remember('role_permissions', 3600, function () {
            return RolePermission::all()->groupBy('role')->map(function ($permissions) {
                return $permissions->pluck('is_visible', 'view_name')->map(fn ($v) => (bool) $v)->toArray();
            })->toArray();
        });

        $userRole = $user->role ?? 'user';
        $rolePermissions = $permissions[$userRole] ?? [];

        // Check if the current route matches any of the managed views
        foreach ($this->routeMap as $pattern => $viewName) {
            if ($request->routeIs($pattern)) {
                // If the permission exists and is explicitly false (0), abort with 404
                if (isset($rolePermissions[$viewName]) && $rolePermissions[$viewName] == false) {
                    abort(404);
                }
                break;
            }
        }

        return $next($request);
    }
}
