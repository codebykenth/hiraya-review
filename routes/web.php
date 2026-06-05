<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExamDateController;
use App\Http\Controllers\Admin\LearnController as AdminLearnController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\SyllabusController;
use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Settings\AcceptTermsController;
use App\Http\Controllers\SitemapController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\User\AnalyticsController;
use App\Http\Controllers\User\DashboardController as UserDashboardController;
use App\Http\Controllers\User\DrillController;
use App\Http\Controllers\User\ExamController;
use App\Http\Controllers\User\ExamHistoryController;
use App\Http\Controllers\User\LearnController as UserLearnController;
use App\Http\Controllers\User\StudyScheduleController;
use App\Http\Controllers\User\StudySuggestionController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ============================================================================
// PUBLIC ROUTES
// ============================================================================
Route::middleware('throttle:global-views')->group(function () {
    // Static Pages
    Route::inertia('/', 'public/welcome')->name('home');
    Route::inertia('about', 'public/about')->name('about');
    Route::inertia('privacy', 'public/privacy')->name('privacy');
    Route::inertia('terms', 'public/terms')->name('terms');
    Route::inertia('support', 'public/support')->name('support');
    Route::inertia('guide', 'guide')->name('guide');
    Route::inertia('account-inactive', 'account-inactive', [
        'adminEmail' => env('MAIL_FROM_ADDRESS', env('DEV_EMAIL')),
    ])->name('account-inactive');

    // Publicly accessible Exams & Learn Modules
    Route::get('exams', [ExamController::class, 'index'])->name('exams.index');

    Route::controller(UserLearnController::class)->prefix('learn')->name('learn.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('{slug}', 'show')->name('show');
    });

    // Utilities
    Route::get('sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
    Route::get('ping', fn () => response()->json(['status' => 'alive', 'timestamp' => now()->toIso8601String()]));
    Route::get('clear-cache-temp-route', function () {
        Artisan::call('cache:clear');
        Artisan::call('optimize:clear');
        return response()->json(['status' => 'success', 'message' => 'Caches cleared!']);
    });
});

Route::post('support', [SupportController::class, 'store'])->name('support.store');

// OAuth Login
Route::middleware('throttle:10,1')->controller(AuthController::class)->prefix('auth')->group(function () {
    Route::get('{provider}', 'redirectToProvider');
    Route::get('{provider}/callback', 'handleProviderCallback');
});

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================
Route::post('accept-terms', [AcceptTermsController::class, 'store'])
    ->middleware(['auth', 'throttle:global-mutations'])
    ->name('accept-terms');

Route::inertia('dev-docs', 'dev-docs')
    ->name('dev-docs')
    ->middleware(['auth', 'verified', 'can:access-dev-docs']);

Route::middleware(['auth', 'verified'])->group(function () {
    
    // --- USER DASHBOARD & ANALYTICS ---
    Route::middleware('throttle:global-views')->group(function () {
        Route::get('dashboard', [UserDashboardController::class, 'index'])->name('dashboard.index');
        Route::get('drills', [DrillController::class, 'index'])->name('drills.index');
        
        Route::controller(AnalyticsController::class)->prefix('analytics')->name('analytics.')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('ai-analysis', 'aiAnalysisReport')->name('ai-analysis');
        });
    });

    // --- USER EXAMS & HISTORY ---
    Route::controller(ExamHistoryController::class)->group(function () {
        Route::get('history', 'index')->name('history.index')->middleware('throttle:global-views');
        Route::post('exams/attempts/bulk-delete', 'bulkDestroy')->name('exams.attempts.bulkDestroy')->middleware('throttle:global-mutations');
        Route::delete('exams/attempts/{attempt}', 'destroy')->name('exams.attempts.destroy')->middleware('throttle:global-mutations');
    });

    Route::controller(ExamController::class)->group(function () {
        Route::post('exams/attempts', 'storeAttempt')->name('exams.attempts.store')->middleware('throttle:global-mutations');
    });

    Route::post('learn/{slug}/complete', [UserLearnController::class, 'toggleComplete'])
        ->name('learn.complete')
        ->middleware('throttle:global-mutations');

    // --- STUDY SCHEDULES ---
    Route::controller(StudyScheduleController::class)->prefix('study-schedules')->name('study-schedules.')->group(function () {
        Route::middleware('throttle:global-views')->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('data', 'data')->name('data');
            Route::get('subcategories', 'getSubcategories')->name('subcategories');
        });
        Route::middleware('throttle:global-mutations')->group(function () {
            Route::post('/', 'store')->name('store');
            Route::delete('reset', 'destroyAll')->name('destroyAll');
            Route::put('bulk-time', 'bulkUpdateTime')->name('bulkUpdateTime');
            Route::put('{studySchedule}', 'update')->name('update');
            Route::delete('{studySchedule}', 'destroy')->name('destroy');
        });
    });

    // --- STUDY SUGGESTIONS ---
    Route::controller(StudySuggestionController::class)->prefix('study-suggestions')->name('study-suggestions.')->group(function () {
        Route::get('/', 'getSuggestions')->name('get')->middleware('throttle:global-views');
        Route::post('apply', 'applySuggestions')->name('apply')->middleware('throttle:global-mutations');
    });

    // ============================================================================
    // ADMINISTRATOR ROUTES
    // ============================================================================
    Route::middleware('admin')->group(function () {
        
        // --- ADMIN READ-ONLY VIEWS ---
        Route::middleware('throttle:global-views')->prefix('admin')->name('admin.')->group(function () {
            Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
            Route::get('syllabus', [SyllabusController::class, 'index'])->name('syllabus.index');
            
            Route::controller(UserController::class)->prefix('users')->name('users.')->group(function () {
                Route::get('/', 'index')->name('index');
            });
            
            Route::controller(ExamDateController::class)->prefix('exam-dates')->name('exam-dates.')->group(function () {
                Route::get('/', 'index')->name('index');
            });

            Route::controller(AdminLearnController::class)->prefix('learn')->name('learn.')->group(function () {
                Route::get('/', 'index')->name('index');
                Route::get('drafts', 'drafts')->name('drafts');
                Route::get('create', 'create')->name('create');
                Route::get('{id}/edit', 'edit')->name('edit');
            });

            Route::controller(SystemController::class)->prefix('system')->name('system.')->group(function () {
                Route::get('/', 'index')->name('index');
            });
        });

        // Question resource views (No admin prefix in paths or names originally)
        Route::middleware('throttle:global-views')->controller(QuestionController::class)->group(function () {
            Route::get('admin/questions', 'index')->name('questions.index');
            Route::get('admin/questions/create', 'create')->name('questions.create');
            Route::get('admin/questions/drafts', 'drafts')->name('questions.drafts');
            Route::get('admin/questions/{question}', 'show')->name('questions.show');
            Route::get('admin/questions/{question}/edit', 'edit')->name('questions.edit');
        });

        // --- ADMIN MUTATIONS ---
        Route::middleware('throttle:global-mutations')->group(function () {
            
            // Admin System Mutations
            Route::controller(SystemController::class)->prefix('admin/system')->name('admin.system.')->group(function () {
                Route::post('clear-cache', 'clearCache')->name('clear-cache');
                Route::post('optimize', 'optimize')->name('optimize');
                Route::post('run-migrations', 'runMigrations')->name('run-migrations');
                Route::post('rollback-migrations', 'rollbackMigrations')->name('rollback-migrations');
                Route::post('toggle-maintenance', 'toggleMaintenance')->name('toggle-maintenance');
            });

            // Admin Learn Mutations
            Route::controller(AdminLearnController::class)->prefix('admin/learn')->name('admin.learn.')->group(function () {
                Route::post('/', 'store')->name('store');
                Route::post('bulk-delete', 'bulkDestroy')->name('bulkDestroy');
                Route::put('{id}', 'update')->name('update');
                Route::delete('{id}', 'destroy')->name('destroy');
            });

            // Admin User Mutations
            Route::controller(UserController::class)->prefix('admin/users')->name('admin.users.')->group(function () {
                Route::put('{id}', 'update')->name('update');
                Route::delete('{id}', 'destroy')->name('destroy');
                Route::post('{id}/restore', 'restore')->name('restore');
                Route::delete('{id}/force-delete', 'forceDelete')->name('force-delete');
            });

            // Admin Exam Dates Mutations
            Route::controller(ExamDateController::class)->prefix('admin/exam-dates')->name('admin.exam-dates.')->group(function () {
                Route::post('/', 'store')->name('store');
                Route::put('{examDate}', 'update')->name('update');
                Route::delete('{examDate}', 'destroy')->name('destroy');
            });

            // Question Categories & Subcategories
            Route::controller(QuestionController::class)->group(function () {
                Route::post('questions/categories', 'storeCategory')->name('questions.categories.store');
                Route::put('questions/categories/{category}', 'updateCategory')->name('questions.categories.update');
                Route::delete('questions/categories/{category}', 'destroyCategory')->name('questions.categories.destroy');
                
                Route::post('questions/subcategories', 'storeSubcategory')->name('questions.subcategories.store');
                Route::put('questions/subcategories/{subcategory}', 'updateSubcategory')->name('questions.subcategories.update');
                Route::delete('questions/subcategories/{subcategory}', 'destroySubcategory')->name('questions.subcategories.destroy');

                // Question Resource Mutations
                Route::post('questions', 'store')->name('questions.store');
                Route::post('questions/bulk-delete', 'bulkDestroy')->name('questions.bulkDestroy');
                Route::put('questions/{question}', 'update')->name('questions.update');
                Route::delete('questions/{question}', 'destroy')->name('questions.destroy');
            });
        });

        // AI Generation Endpoints
        Route::middleware('throttle:ai-generation')->group(function () {
            Route::post('admin/learn/generate', [AdminLearnController::class, 'generate'])->name('admin.learn.generate');
            Route::post('questions/generate', [QuestionController::class, 'generate'])->name('questions.generate');
        });
    });
});

require __DIR__.'/settings.php';

Route::fallback(function () {
    return Inertia::render('error', ['status' => 404])
        ->toResponse(request())
        ->setStatusCode(404);
})->middleware('web');
