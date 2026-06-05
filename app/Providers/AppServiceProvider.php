<?php

namespace App\Providers;

use App\Models\Category;
use App\Models\ExamDate;
use App\Models\LearnModule;
use App\Models\Question;
use App\Models\Subcategory;
use App\Models\User;
use App\Observers\CategoryObserver;
use App\Observers\ExamDateObserver;
use App\Observers\LearnModuleObserver;
use App\Observers\QuestionObserver;
use App\Observers\SubcategoryObserver;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Login;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Observers for Cache Invalidation
        Question::observe(QuestionObserver::class);
        Category::observe(CategoryObserver::class);
        Subcategory::observe(SubcategoryObserver::class);
        LearnModule::observe(LearnModuleObserver::class);
        ExamDate::observe(ExamDateObserver::class);

        $this->configureDefaults();
        if (app()->environment(['development', 'production'])) {
            URL::forceScheme('https');
        }

        Event::listen(function (Login $event) {
            if ($event->user instanceof User) {
                $event->user->forceFill(['last_login_at' => now()])->save();
            }
        });

        RateLimiter::for('ai-generation', function (Request $request) {
            if (! app()->isProduction()) {
                return Limit::none();
            }

            return Limit::perMinute(5)->by($request->user()?->id ?: $request->ip())->response(function (Request $request, array $headers) {
                return response()->json([
                    'error' => 'You are generating questions too quickly. Please wait a moment and try again.',
                ], 429, $headers);
            });
        });

        RateLimiter::for('global-views', function (Request $request) {
            if (! app()->isProduction()) {
                return Limit::none();
            }

            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('global-mutations', function (Request $request) {
            if (! app()->isProduction()) {
                return Limit::none();
            }

            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('support-submission', function (Request $request) {
            if (! app()->isProduction() && ! config('services.support.test_rate_limit')) {
                return Limit::none();
            }

            return Limit::perDay(1)->by($request->ip())->response(function (Request $request, array $headers) {
                if ($request->header('X-Inertia')) {
                    return back()->withErrors([
                        'rate_limit' => 'You have already submitted a support request today. To prevent spam, submissions are limited to one per day.',
                    ]);
                }

                return response()->json([
                    'error' => 'You have already submitted a support request today. To prevent spam, submissions are limited to one per day.',
                ], 429, $headers);
            });
        });

        Gate::define('access-dev-docs', function (User $user) {
            return in_array($user->email, [
                env('DEV_EMAIL'),
            ]);
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Model::shouldBeStrict(! app()->isProduction());

        Password::defaults(
            fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
