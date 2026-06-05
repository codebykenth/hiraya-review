<?php

namespace App\Http\Middleware;

use App\Services\TurnstileService;
use Illuminate\Http\Request;
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
                    $request->user()->only(['id', 'name', 'email', 'email_verified_at', 'role', 'created_at', 'updated_at']),
                    ['two_factor_enabled' => ! is_null($request->user()->two_factor_secret)]
                ) : null,
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
        ];
    }
}
