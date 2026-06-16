<?php

use App\Http\Controllers\Settings\PreferencesController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Middleware\ConfirmPasswordForNonSocialUsers;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'throttle:global-views'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
});

Route::middleware(['auth', 'throttle:global-mutations'])->group(function () {
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified', 'throttle:global-views'])->group(function () {
    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(ConfirmPasswordForNonSocialUsers::class)
        ->name('security.edit');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
    Route::get('settings/preferences', [PreferencesController::class, 'edit'])->name('preferences.edit');
});

Route::middleware(['auth', 'verified', 'throttle:global-mutations'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::patch('settings/preferences', [PreferencesController::class, 'update'])->name('preferences.update');
});
