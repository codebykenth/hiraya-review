<?php

use App\Http\Controllers\ExamController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\AdminDashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::inertia('dev-docs', 'dev-docs')
    ->name('dev-docs')
    ->middleware(['auth', 'verified', 'can:access-dev-docs']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('exams', [ExamController::class, 'index'])->name('exams.index');
    Route::get('questions/drafts', [QuestionController::class, 'drafts'])->name('questions.drafts');
    Route::post('questions/generate', [QuestionController::class, 'generate'])->name('questions.generate');
    
    // Dynamic Scope Management Routes
    Route::post('questions/categories', [QuestionController::class, 'storeCategory'])->name('questions.categories.store');
    Route::delete('questions/categories/{category}', [QuestionController::class, 'destroyCategory'])->name('questions.categories.destroy');
    Route::post('questions/subcategories', [QuestionController::class, 'storeSubcategory'])->name('questions.subcategories.store');
    Route::delete('questions/subcategories/{subcategory}', [QuestionController::class, 'destroySubcategory'])->name('questions.subcategories.destroy');
    
    Route::resource('questions', QuestionController::class);
});

require __DIR__.'/settings.php';
