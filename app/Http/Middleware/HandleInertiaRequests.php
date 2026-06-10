<?php

namespace App\Http\Middleware;

use App\Models\Announcement;
use App\Models\Feedback;
use App\Models\RolePermission;
use App\Services\TurnstileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user() ? array_merge(
                    $request->user()->only(['id', 'name', 'email', 'email_verified_at', 'role', 'created_at', 'updated_at', 'terms_accepted_at', 'is_active']),
                    ['two_factor_enabled' => ! is_null($request->user()->two_factor_secret)]
                ) : null,
                'permissions' => Cache::remember('role_permissions', 3600, function () {
                    return RolePermission::all()->groupBy('role')->map(function ($permissions) {
                        return $permissions->pluck('is_visible', 'view_name')->map(fn ($v) => (bool) $v)->toArray();
                    })->toArray();
                }),
            ],
            'pusher' => [
                'key' => config('broadcasting.connections.pusher.key'),
                'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                'host' => env('PUSHER_HOST'),
                'port' => config('broadcasting.connections.pusher.options.port'),
                'scheme' => config('broadcasting.connections.pusher.options.scheme'),
            ],
            'turnstile' => [
                'siteKey' => app(TurnstileService::class)->getSiteKey(),
                'enabled' => app(TurnstileService::class)->isConfigured(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'global_announcements' => Cache::remember('active_announcements', 300, function () {
                return Announcement::where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    })
                    ->get();
            }),
            'pending_feedback_count' => Cache::remember('pending_feedback_count', 60, function () {
                return Feedback::where('status', 'pending')->count();
            }),
        ];
    }
}
