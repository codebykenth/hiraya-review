<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminExamDateController;
use App\Http\Controllers\AdminLearnController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\LearnController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\Settings\AcceptTermsController;
use App\Http\Controllers\StudyScheduleController;
use App\Http\Controllers\StudySuggestionController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public page views — rate limited to prevent scraping & DDoS floods
Route::middleware('throttle:global-views')->group(function () {
    Route::inertia('/', 'welcome')->name('home');
    Route::inertia('about', 'about')->name('about');
    Route::inertia('privacy', 'legal/privacy')->name('privacy');
    Route::inertia('terms', 'legal/terms')->name('terms');
    Route::inertia('support', 'legal/support')->name('support');
    Route::inertia('guide', 'guide')->name('guide');
    Route::get('exams', [ExamController::class, 'index'])->name('exams.index');

    // Publicly accessible Learn Module routes (for advanced long-tail SEO crawl)
    Route::get('learn', [LearnController::class, 'index'])->name('learn.index');
    Route::get('learn/{slug}', [LearnController::class, 'show'])->name('learn.show');

    // Dynamic XML Sitemap for Google Search Console
    Route::get('sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

    Route::get('ping', fn () => response()->json([
        'status' => 'alive',
        'timestamp' => now()->toIso8601String(),
    ]));

    // Temporary route to clear persistent cache in Render environments
    Route::get('clear-cache-temp-route', function () {
        \Illuminate\Support\Facades\Artisan::call('cache:clear');
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        return response()->json([
            'status' => 'success',
            'message' => 'All caches cleared successfully!',
        ]);
    });
});

Route::post('support', [SupportController::class, 'store'])
    ->name('support.store')
    ->middleware('throttle:support-submission');

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
        Route::get('dashboard', [ExamController::class, 'dashboard'])->name('dashboard');
        Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('drills', [ExamController::class, 'drills'])->name('drills.index');
        Route::get('history', [ExamController::class, 'history'])->name('history.index');
        Route::get('questions/drafts', [QuestionController::class, 'drafts'])->name('questions.drafts');

        // Admin Syllabus Management
        Route::get('admin/syllabus', [\App\Http\Controllers\AdminSyllabusController::class, 'index'])->name('admin.syllabus.index');

        // Admin Learn Module Views
        Route::get('admin/learn', [AdminLearnController::class, 'index'])->name('admin.learn.index');
        Route::get('admin/learn/drafts', [AdminLearnController::class, 'drafts'])->name('admin.learn.drafts');
        Route::get('admin/learn/create', [AdminLearnController::class, 'create'])->name('admin.learn.create');
        Route::get('admin/learn/{id}/edit', [AdminLearnController::class, 'edit'])->name('admin.learn.edit');

        // Admin User Management Views
        Route::get('admin/users', [AdminUserController::class, 'index'])->name('admin.users.index');

        // Admin Exam Dates Views
        Route::get('admin/exam-dates', [AdminExamDateController::class, 'index'])->name('admin.exam-dates.index');

        // Question Resource Views
        Route::get('questions', [QuestionController::class, 'index'])->name('questions.index');
        Route::get('questions/create', [QuestionController::class, 'create'])->name('questions.create');
        Route::get('questions/{question}', [QuestionController::class, 'show'])->name('questions.show');
        Route::get('questions/{question}/edit', [QuestionController::class, 'edit'])->name('questions.edit');
    });

    // Mutation / Write Endpoints (Rate limited to 30 requests/minute to prevent SQL injection flood & form spam DDoS)
    Route::middleware('throttle:global-mutations')->group(function () {
        Route::post('exams/attempts', [ExamController::class, 'storeAttempt'])->name('exams.attempts.store');
        Route::delete('exams/attempts/{attempt}', [ExamController::class, 'destroyAttempt'])->name('exams.attempts.destroy');

        // Admin Learn Module Mutations
        Route::post('admin/learn', [AdminLearnController::class, 'store'])->name('admin.learn.store');
        Route::put('admin/learn/{id}', [AdminLearnController::class, 'update'])->name('admin.learn.update');
        Route::delete('admin/learn/{id}', [AdminLearnController::class, 'destroy'])->name('admin.learn.destroy');

        // Admin User Management Mutations
        Route::put('admin/users/{id}', [AdminUserController::class, 'update'])->name('admin.users.update');
        Route::delete('admin/users/{id}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
        Route::post('admin/users/{id}/restore', [AdminUserController::class, 'restore'])->name('admin.users.restore');
        Route::delete('admin/users/{id}/force-delete', [AdminUserController::class, 'forceDelete'])->name('admin.users.force-delete');

        // Admin Exam Dates Mutations
        Route::post('admin/exam-dates', [AdminExamDateController::class, 'store'])->name('admin.exam-dates.store');
        Route::put('admin/exam-dates/{examDate}', [AdminExamDateController::class, 'update'])->name('admin.exam-dates.update');
        Route::delete('admin/exam-dates/{examDate}', [AdminExamDateController::class, 'destroy'])->name('admin.exam-dates.destroy');

        // Dynamic Scope Management Routes
        Route::post('questions/categories', [QuestionController::class, 'storeCategory'])->name('questions.categories.store');
        Route::put('questions/categories/{category}', [QuestionController::class, 'updateCategory'])->name('questions.categories.update');
        Route::delete('questions/categories/{category}', [QuestionController::class, 'destroyCategory'])->name('questions.categories.destroy');
        Route::post('questions/subcategories', [QuestionController::class, 'storeSubcategory'])->name('questions.subcategories.store');
        Route::put('questions/subcategories/{subcategory}', [QuestionController::class, 'updateSubcategory'])->name('questions.subcategories.update');
        Route::delete('questions/subcategories/{subcategory}', [QuestionController::class, 'destroySubcategory'])->name('questions.subcategories.destroy');

        // Question Resource Mutations
        Route::post('questions', [QuestionController::class, 'store'])->name('questions.store');
        Route::put('questions/{question}', [QuestionController::class, 'update'])->name('questions.update');
        Route::delete('questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    });

    // Study Schedule Routes
    Route::middleware('throttle:global-views')->group(function () {
        Route::get('calendar', fn () => Inertia::render('calendar'))->name('calendar.index');
        Route::get('study-schedules', [StudyScheduleController::class, 'index'])->name('study-schedules.index');
        Route::get('study-schedules/subcategories', [StudyScheduleController::class, 'getSubcategories'])->name('study-schedules.subcategories');
        Route::get('study-suggestions', [StudySuggestionController::class, 'getSuggestions'])->name('study-suggestions.get');
    });

    Route::middleware('throttle:global-mutations')->group(function () {
        Route::post('study-schedules', [StudyScheduleController::class, 'store'])->name('study-schedules.store');
        Route::delete('study-schedules/reset', [StudyScheduleController::class, 'destroyAll'])->name('study-schedules.destroyAll');
        Route::put('study-schedules/{studySchedule}', [StudyScheduleController::class, 'update'])->name('study-schedules.update');
        Route::delete('study-schedules/{studySchedule}', [StudyScheduleController::class, 'destroy'])->name('study-schedules.destroy');
        Route::post('study-suggestions/apply', [StudySuggestionController::class, 'applySuggestions'])->name('study-suggestions.apply');
    });

    // Heavy AI Generation Service Endpoint (Strictly rate limited to 5 requests/minute to protect third-party API quota)
    Route::post('questions/generate', [QuestionController::class, 'generate'])->name('questions.generate')->middleware('throttle:ai-generation');
    Route::post('admin/learn/generate', [AdminLearnController::class, 'generate'])->name('admin.learn.generate')->middleware('throttle:ai-generation');
});

require __DIR__.'/settings.php';

Route::fallback(function () {
    return \Inertia\Inertia::render('error', [
        'status' => 404,
    ])
    ->toResponse(request())
    ->setStatusCode(404);
})->middleware('web');
