<?php

use App\Http\Middleware\AllowFreeAttempt;
use App\Http\Middleware\AuthOrFail;
use App\Http\Middleware\CheckMaintenanceMode;
use App\Http\Middleware\CheckUserActive;
use App\Http\Middleware\CheckViewAccess;
use App\Http\Middleware\CompressResponse;
use App\Http\Middleware\ConfirmPasswordForNonSocialUsers;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetCacheHeaders;
use App\Http\Middleware\TransactionMiddleware;
use App\Http\Middleware\VerifyTurnstile;
use App\Models\RolePermission;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'password.confirm' => ConfirmPasswordForNonSocialUsers::class,
            'admin' => EnsureUserIsAdmin::class,
            'turnstile.verify' => VerifyTurnstile::class,
            'view.access' => CheckViewAccess::class,
            'free.attempt' => AllowFreeAttempt::class,
            'auth.or.fail' => AuthOrFail::class,
        ]);

        $middleware->remove(PreventRequestsDuringMaintenance::class);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            CheckUserActive::class,
            CheckMaintenanceMode::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
            VerifyCsrfToken::class,
            SetCacheHeaders::class,
            CompressResponse::class,
            TransactionMiddleware::class,
            CheckViewAccess::class,
        ]);

        $middleware->api(append: [
            'cors',
            SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            $status = $response->getStatusCode();
            if (in_array($status, [500, 503, 404, 403])) {
                Inertia::setRootView('app');

                return Inertia::render('error', [
                    'status' => $status,
                    'auth' => [
                        'user' => $request->user(),
                        'permissions' => Cache::remember('role_permissions', 3600, function () {
                            return RolePermission::all()->groupBy('role')->map(function ($permissions) {
                                return $permissions->pluck('is_visible', 'view_name')->map(fn ($v) => (bool) $v)->toArray();
                            })->toArray();
                        }),
                    ],
                ])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }

            return $response;
        });
    })->create();
