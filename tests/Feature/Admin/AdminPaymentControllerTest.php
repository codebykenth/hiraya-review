<?php

declare(strict_types=1);

use App\Models\Payment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('regular users cannot view admin payments list', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($user)->get(route('admin.payments.index'));
    $response->assertStatus(404);
});

test('administrators can view payments with stats and filters', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $student = User::factory()->create(['role' => 'user', 'name' => 'Alice Doe']);

    Payment::create([
        'user_id' => $student->id,
        'reference_id' => 'HIRAYA-PAY-ADM-01',
        'status' => 'paid',
        'amount' => 499.00,
        'currency' => 'PHP',
        'plan_code' => 'lifetime_access',
        'payment_method' => 'GCASH',
        'paid_at' => now(),
    ]);

    $response = $this->actingAs($admin)->get(route('admin.payments.index'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/payments/index')
        ->has('payments.data', 1)
        ->has('stats')
        ->where('stats.paid_count', 1)
        ->where('stats.total_revenue', 499)
        ->has('filters')
    );
});

test('administrators can filter payments by search term', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $studentA = User::factory()->create(['role' => 'user', 'name' => 'Bob Marley']);
    $studentB = User::factory()->create(['role' => 'user', 'name' => 'Charlie Brown']);

    Payment::create([
        'user_id' => $studentA->id,
        'reference_id' => 'HIRAYA-REF-BOB',
        'status' => 'paid',
        'amount' => 299.00,
        'currency' => 'PHP',
        'plan_code' => 'pro_pass',
    ]);

    Payment::create([
        'user_id' => $studentB->id,
        'reference_id' => 'HIRAYA-REF-CHARLIE',
        'status' => 'pending',
        'amount' => 499.00,
        'currency' => 'PHP',
        'plan_code' => 'lifetime_access',
    ]);

    $response = $this->actingAs($admin)->get(route('admin.payments.index', ['search' => 'CHARLIE']));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('admin/payments/index')
        ->has('payments.data', 1)
        ->where('payments.data.0.reference_id', 'HIRAYA-REF-CHARLIE')
    );
});
