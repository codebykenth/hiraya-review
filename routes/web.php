<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExamDateController;
use App\Http\Controllers\Admin\LearnController as AdminLearnController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\SyllabusController;
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

// Public page views — rate limited to prevent scraping & DDoS floods
Route::middleware('throttle:global-views')->group(function () {
    Route::inertia('/', 'public/welcome')->name('home');
    Route::inertia('about', 'public/about')->name('about');
    Route::inertia('privacy', 'public/privacy')->name('privacy');
    Route::inertia('terms', 'public/terms')->name('terms');
    Route::inertia('support', 'public/support')->name('support');
    Route::inertia('guide', 'guide')->name('guide');
    Route::inertia('account-inactive', 'account-inactive', [
        'adminEmail' => env('MAIL_FROM_ADDRESS', 'support@hirayareview.com'),
    ])->name('account-inactive');
    Route::get('exams', [ExamController::class, 'index'])->name('exams.index');

    // Publicly accessible Learn Module routes (for advanced long-tail SEO crawl)
    Route::get('learn', [UserLearnController::class, 'index'])->name('learn.index');
    Route::get('learn/{slug}', [UserLearnController::class, 'show'])->name('learn.show');

    // Dynamic XML Sitemap for Google Search Console
    Route::get('sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

    Route::get('ping', fn () => response()->json([
        'status' => 'alive',
        'timestamp' => now()->toIso8601String(),
    ]));

    // Temporary route to clear persistent cache in Render environments
    Route::get('clear-cache-temp-route', function () {
        Artisan::call('cache:clear');
        Artisan::call('optimize:clear');

        return response()->json([
            'status' => 'success',
            'message' => 'All caches cleared successfully!',
        ]);
    });
});

Route::post('support', [SupportController::class, 'store'])
    ->name('support.store');

// OAuth social login — rate limited to prevent redirect flooding against providers
Route::middleware('throttle:10,1')->group(function () {
    Route::get('/auth/{provider}', [AuthController::class, 'redirectToProvider']);
    Route::get('/auth/{provider}/callback', [AuthController::class, 'handleProviderCallback']);
});

// Accept terms after login
Route::post('accept-terms', [AcceptTermsController::class, 'store'])
    ->middleware(['auth', 'throttle:global-mutations'])
    ->name('accept-terms');

Route::inertia('dev-docs', 'dev-docs')
    ->name('dev-docs')
    ->middleware(['auth', 'verified', 'can:access-dev-docs']);

Route::middleware(['auth', 'verified'])->group(function () {
    // View / Read Endpoints (Rate limited to 120 requests/minute to block scrapers & view flood DDoS)
    Route::middleware('throttle:global-views')->group(function () {
        Route::get('dashboard', [UserDashboardController::class, 'index'])->name('dashboard.index');
        Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('analytics/ai-analysis', [AnalyticsController::class, 'aiAnalysisReport'])->name('analytics.ai-analysis');
        Route::get('drills', [DrillController::class, 'index'])->name('drills.index');
        Route::get('history', [ExamHistoryController::class, 'index'])->name('history.index');
    });

    // Mutation / Write Endpoints (Rate limited to 30 requests/minute to prevent SQL injection flood & form spam DDoS)
    Route::middleware('throttle:global-mutations')->group(function () {
        Route::post('exams/attempts', [ExamController::class, 'storeAttempt'])->name('exams.attempts.store');
        Route::post('exams/attempts/bulk-delete', [ExamHistoryController::class, 'bulkDestroy'])->name('exams.attempts.bulkDestroy');
        Route::delete('exams/attempts/{attempt}', [ExamHistoryController::class, 'destroy'])->name('exams.attempts.destroy');
        Route::post('learn/{slug}/complete', [UserLearnController::class, 'toggleComplete'])->name('learn.complete');
    });

    // Study Schedule Routes
    Route::middleware('throttle:global-views')->group(function () {
        Route::get('study-schedules', [StudyScheduleController::class, 'index'])->name('study-schedules.index');
        Route::get('study-schedules/data', [StudyScheduleController::class, 'data'])->name('study-schedules.data');
        Route::get('study-schedules/subcategories', [StudyScheduleController::class, 'getSubcategories'])->name('study-schedules.subcategories');
        Route::get('study-suggestions', [StudySuggestionController::class, 'getSuggestions'])->name('study-suggestions.get');
    });

    Route::middleware('throttle:global-mutations')->group(function () {
        Route::post('study-schedules', [StudyScheduleController::class, 'store'])->name('study-schedules.store');
        Route::delete('study-schedules/reset', [StudyScheduleController::class, 'destroyAll'])->name('study-schedules.destroyAll');
        Route::put('study-schedules/bulk-time', [StudyScheduleController::class, 'bulkUpdateTime'])->name('study-schedules.bulkUpdateTime');
        Route::put('study-schedules/{studySchedule}', [StudyScheduleController::class, 'update'])->name('study-schedules.update');
        Route::delete('study-schedules/{studySchedule}', [StudyScheduleController::class, 'destroy'])->name('study-schedules.destroy');
        Route::post('study-suggestions/apply', [StudySuggestionController::class, 'applySuggestions'])->name('study-suggestions.apply');
    });

    // Administrative Section Protected Area (DRY security)
    Route::middleware('admin')->group(function () {
        Route::middleware('throttle:global-views')->group(function () {
            Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
            Route::get('admin/syllabus', [SyllabusController::class, 'index'])->name('admin.syllabus.index');
            Route::get('admin/learn', [AdminLearnController::class, 'index'])->name('admin.learn.index');
            Route::get('admin/learn/drafts', [AdminLearnController::class, 'drafts'])->name('admin.learn.drafts');
            Route::get('admin/learn/create', [AdminLearnController::class, 'create'])->name('admin.learn.create');
            Route::get('admin/learn/{id}/edit', [AdminLearnController::class, 'edit'])->name('admin.learn.edit');
            Route::get('admin/users', [UserController::class, 'index'])->name('admin.users.index');
            Route::get('admin/exam-dates', [ExamDateController::class, 'index'])->name('admin.exam-dates.index');

            // Question Resource Views
            Route::get('admin/questions', [QuestionController::class, 'index'])->name('questions.index');
            Route::get('admin/questions/create', [QuestionController::class, 'create'])->name('questions.create');
            Route::get('admin/questions/drafts', [QuestionController::class, 'drafts'])->name('questions.drafts');
            Route::get('admin/questions/{question}', [QuestionController::class, 'show'])->name('questions.show');
            Route::get('admin/questions/{question}/edit', [QuestionController::class, 'edit'])->name('questions.edit');
        });

        Route::middleware('throttle:global-mutations')->group(function () {
            Route::post('admin/learn', [AdminLearnController::class, 'store'])->name('admin.learn.store');
            Route::post('admin/learn/bulk-delete', [AdminLearnController::class, 'bulkDestroy'])->name('admin.learn.bulkDestroy');
            Route::put('admin/learn/{id}', [AdminLearnController::class, 'update'])->name('admin.learn.update');
            Route::delete('admin/learn/{id}', [AdminLearnController::class, 'destroy'])->name('admin.learn.destroy');

            Route::put('admin/users/{id}', [UserController::class, 'update'])->name('admin.users.update');
            Route::delete('admin/users/{id}', [UserController::class, 'destroy'])->name('admin.users.destroy');
            Route::post('admin/users/{id}/restore', [UserController::class, 'restore'])->name('admin.users.restore');
            Route::delete('admin/users/{id}/force-delete', [UserController::class, 'forceDelete'])->name('admin.users.force-delete');

            Route::post('admin/exam-dates', [ExamDateController::class, 'store'])->name('admin.exam-dates.store');
            Route::put('admin/exam-dates/{examDate}', [ExamDateController::class, 'update'])->name('admin.exam-dates.update');
            Route::delete('admin/exam-dates/{examDate}', [ExamDateController::class, 'destroy'])->name('admin.exam-dates.destroy');

            // Dynamic Scope Management Routes
            Route::post('questions/categories', [QuestionController::class, 'storeCategory'])->name('questions.categories.store');
            Route::put('questions/categories/{category}', [QuestionController::class, 'updateCategory'])->name('questions.categories.update');
            Route::delete('questions/categories/{category}', [QuestionController::class, 'destroyCategory'])->name('questions.categories.destroy');
            Route::post('questions/subcategories', [QuestionController::class, 'storeSubcategory'])->name('questions.subcategories.store');
            Route::put('questions/subcategories/{subcategory}', [QuestionController::class, 'updateSubcategory'])->name('questions.subcategories.update');
            Route::delete('questions/subcategories/{subcategory}', [QuestionController::class, 'destroySubcategory'])->name('questions.subcategories.destroy');

            // Question Resource Mutations
            Route::post('questions', [QuestionController::class, 'store'])->name('questions.store');
            Route::post('questions/bulk-delete', [QuestionController::class, 'bulkDestroy'])->name('questions.bulkDestroy');
            Route::put('questions/{question}', [QuestionController::class, 'update'])->name('questions.update');
            Route::delete('questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
        });

        Route::post('admin/learn/generate', [AdminLearnController::class, 'generate'])->name('admin.learn.generate')->middleware('throttle:ai-generation');
        Route::post('questions/generate', [QuestionController::class, 'generate'])->name('questions.generate')->middleware('throttle:ai-generation');
    });
});

require __DIR__.'/settings.php';

Route::fallback(function () {
    return Inertia::render('error', [
        'status' => 404,
    ])
        ->toResponse(request())
        ->setStatusCode(404);
})->middleware('web');
