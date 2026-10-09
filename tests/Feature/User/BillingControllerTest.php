<?php

declare(strict_types=1);

use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

test('guests cannot visit billing page', function () {
    $response = $this->get(route('billing.index'));
    $response->assertStatus(404);
});

test('authenticated user can view billing page with plans', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('billing.index'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('user/billing/index')
        ->has('plans')
        ->has('subscription')
        ->has('recent_payments')
        ->has('sandbox')
    );
});

test('initiating checkout creates a pending payment and redirects to xendit invoice', function () {
    $user = User::factory()->create(['email' => 'student@example.com', 'name' => 'Juan Dela Cruz']);

    config()->set('xendit.secret_key', 'xnd_development_test_key_123');

    Http::fake([
        'https://api.xendit.co/v2/invoices' => Http::response([
            'id' => 'inv_test_123456',
            'external_id' => 'HIRAYA-PAY-mock',
            'status' => 'PENDING',
            'invoice_url' => 'https://checkout-staging.xendit.co/v2/mock_invoice_url',
            'amount' => 299.00,
        ], 200),
    ]);

    $response = $this->actingAs($user)->post(route('billing.checkout'), [
        'plan_code' => 'pro_pass',
    ]);

    $response->assertRedirect('https://checkout-staging.xendit.co/v2/mock_invoice_url');

    $this->assertDatabaseHas('payments', [
        'user_id' => $user->id,
        'plan_code' => 'pro_pass',
        'status' => 'pending',
        'xendit_id' => 'inv_test_123456',
    ]);
});

test('checkout validates invalid plan codes', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('billing.checkout'), [
        'plan_code' => 'invalid_plan_code',
    ]);

    $response->assertSessionHasErrors(['plan_code']);
});

test('user can sync pending payment status directly from xendit', function () {
    $user = User::factory()->create();
    config()->set('xendit.secret_key', 'xnd_development_test_key_123');

    $payment = Payment::create([
        'user_id' => $user->id,
        'reference_id' => 'HIRAYA-SYNC-TEST',
        'xendit_id' => 'inv_sync_999',
        'status' => 'pending',
        'amount' => 299.00,
        'currency' => 'PHP',
        'plan_code' => 'pro_pass',
    ]);

    Http::fake([
        'https://api.xendit.co/v2/invoices/inv_sync_999' => Http::response([
            'id' => 'inv_sync_999',
            'external_id' => 'HIRAYA-SYNC-TEST',
            'status' => 'PAID',
            'payment_method' => 'GCASH',
            'paid_amount' => 299.00,
            'paid_at' => now()->toIso8601String(),
        ], 200),
    ]);

    $response = $this->actingAs($user)->post(route('billing.sync', $payment));
    $response->assertRedirect();

    $payment->refresh();
    $user->refresh();

    expect($payment->status)->toBe('paid');
    expect($payment->payment_method)->toBe('GCASH');
    expect($user->is_premium)->toBeTrue();
});
