<?php

use App\Models\User;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\post;

test('guest cannot check pdf export limit', function () {
    post(route('exams.exportPdfCheck'))
        ->assertStatus(404);
});

test('user without permission cannot export pdf', function () {
    $user = clone User::factory()->create(['can_download_pdf' => false]);

    actingAs($user)
        ->post(route('exams.exportPdfCheck'))
        ->assertStatus(403)
        ->assertJson([
            'success' => false,
            'message' => 'Your account is not authorized to download PDF examination booklets.',
        ]);
});

test('user with permission can export pdf', function () {
    $user = clone User::factory()->create(['can_download_pdf' => true]);

    actingAs($user)
        ->post(route('exams.exportPdfCheck'))
        ->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'PDF export authorized.',
        ])
        ->assertJsonStructure(['export_token']);
});

test('admin can always export pdf regardless of permission flag', function () {
    $admin = clone User::factory()->create([
        'role' => 'admin',
        'can_download_pdf' => false,
    ]);

    actingAs($admin)
        ->post(route('exams.exportPdfCheck'))
        ->assertStatus(200)
        ->assertJson([
            'success' => true,
        ]);
});

test('pdf download tracking increments counter', function () {
    $user = clone User::factory()->create([
        'pdf_downloads_count' => 0,
    ]);

    actingAs($user)
        ->post(route('exams.trackPdfDownload'))
        ->assertStatus(200)
        ->assertJson(['success' => true]);

    expect($user->fresh()->pdf_downloads_count)->toBe(1);
});
