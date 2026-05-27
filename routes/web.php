<?php

use App\Http\Controllers\ExamController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\SupportController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::inertia('privacy', 'legal/privacy')->name('privacy');
Route::inertia('terms', 'legal/terms')->name('terms');
Route::inertia('support', 'legal/support')->name('support');

Route::post('support', [SupportController::class, 'store'])
    ->name('support.store')
    ->middleware('throttle:support-submission');

Route::get('ping', fn () => response()->json([
    'status' => 'alive',
    'timestamp' => now()->toIso8601String(),
]));

Route::inertia('dev-docs', 'dev-docs')
    ->name('dev-docs')
    ->middleware(['auth', 'verified', 'can:access-dev-docs']);

Route::middleware(['auth', 'verified'])->group(function () {
    // View / Read Endpoints (Rate limited to 120 requests/minute to block scrapers & view flood DDoS)
    Route::middleware('throttle:global-views')->group(function () {
        Route::get('dashboard', [ExamController::class, 'dashboard'])->name('dashboard');
        Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
        Route::get('exams', [ExamController::class, 'index'])->name('exams.index');
        Route::get('drills', [ExamController::class, 'drills'])->name('drills.index');
        Route::get('history', [ExamController::class, 'history'])->name('history.index');
        Route::get('questions/drafts', [QuestionController::class, 'drafts'])->name('questions.drafts');
        // Learn Module Views
        Route::get('learn', [App\Http\Controllers\LearnController::class, 'index'])->name('learn.index');
        Route::get('learn/{slug}', [App\Http\Controllers\LearnController::class, 'show'])->name('learn.show');
        
        // Admin Learn Module Views
        Route::get('admin/learn', [App\Http\Controllers\AdminLearnController::class, 'index'])->name('admin.learn.index');
        Route::get('admin/learn/drafts', [App\Http\Controllers\AdminLearnController::class, 'drafts'])->name('admin.learn.drafts');
        Route::get('admin/learn/create', [App\Http\Controllers\AdminLearnController::class, 'create'])->name('admin.learn.create');
        Route::get('admin/learn/{id}/edit', [App\Http\Controllers\AdminLearnController::class, 'edit'])->name('admin.learn.edit');
        
        // Admin User Management Views
        Route::get('admin/users', [App\Http\Controllers\AdminUserController::class, 'index'])->name('admin.users.index');
        
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
        Route::post('admin/learn', [App\Http\Controllers\AdminLearnController::class, 'store'])->name('admin.learn.store');
        Route::put('admin/learn/{id}', [App\Http\Controllers\AdminLearnController::class, 'update'])->name('admin.learn.update');
        Route::delete('admin/learn/{id}', [App\Http\Controllers\AdminLearnController::class, 'destroy'])->name('admin.learn.destroy');
        
        // Admin User Management Mutations
        Route::put('admin/users/{id}', [App\Http\Controllers\AdminUserController::class, 'update'])->name('admin.users.update');
        Route::delete('admin/users/{id}', [App\Http\Controllers\AdminUserController::class, 'destroy'])->name('admin.users.destroy');
        
        // Dynamic Scope Management Routes
        Route::post('questions/categories', [QuestionController::class, 'storeCategory'])->name('questions.categories.store');
        Route::delete('questions/categories/{category}', [QuestionController::class, 'destroyCategory'])->name('questions.categories.destroy');
        Route::post('questions/subcategories', [QuestionController::class, 'storeSubcategory'])->name('questions.subcategories.store');
        Route::delete('questions/subcategories/{subcategory}', [QuestionController::class, 'destroySubcategory'])->name('questions.subcategories.destroy');

        // Question Resource Mutations
        Route::post('questions', [QuestionController::class, 'store'])->name('questions.store');
        Route::put('questions/{question}', [QuestionController::class, 'update'])->name('questions.update');
        Route::delete('questions/{question}', [QuestionController::class, 'destroy'])->name('questions.destroy');
    });

    // Heavy AI Generation Service Endpoint (Strictly rate limited to 5 requests/minute to protect third-party API quota)
    Route::post('questions/generate', [QuestionController::class, 'generate'])->name('questions.generate')->middleware('throttle:ai-generation');
    Route::post('admin/learn/generate', [App\Http\Controllers\AdminLearnController::class, 'generate'])->name('admin.learn.generate')->middleware('throttle:ai-generation');
});

require __DIR__.'/settings.php';
