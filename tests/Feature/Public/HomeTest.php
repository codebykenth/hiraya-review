<?php

use App\Models\User;

test('returns a successful response for guests', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
});

test('redirects authenticated users to user dashboard', function () {
    $user = User::factory()->create([
        'role' => 'user',
    ]);

    $response = $this->actingAs($user)->get(route('home'));

    $response->assertRedirect(route('dashboard.index'));
});

test('redirects authenticated admins to admin dashboard', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $response = $this->actingAs($admin)->get(route('home'));

    $response->assertRedirect(route('admin.dashboard'));
});
