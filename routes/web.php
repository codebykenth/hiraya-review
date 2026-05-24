<?php

use App\Http\Controllers\ExamController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::inertia('dev-docs', 'dev-docs')
    ->name('dev-docs')
    ->middleware(['auth', 'verified', 'can:access-dev-docs']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('exams', [ExamController::class, 'index'])->name('exams.index');
});

require __DIR__.'/settings.php';
