<?php

declare(strict_types=1);

use App\Models\Payment;
use App\Models\User;

beforeEach(function () {
    config()->set('xendit.webhook_token', 'test_callback_secret_token_123');
});

test('webhook rejects invalid x-callback-token', function () {
    $response = $this->postJson(route('webhooks.xendit'), [
        'id' => 'inv_test_123',
        'status' => 'PAID',
    ], [
        'x-callback-token' => 'invalid_token',
    ]);

    $response->assertStatus(401);
});

test('webhook fulfills user entitlement upon receiving paid event', function () {
    $user = User::factory()->create([
        'is_premium' => false,
        'premium_until' => null,
    ]);

    $payment = Payment::create([
        'user_id' => $user->id,
        'reference_id' => 'HIRAYA-PAY-2026-TEST1234',
        'xendit_id' => 'inv_test_123456',
        'status' => 'pending',
        'amount' => 299.00,
        'currency' => 'PHP',
        'plan_code' => 'pro_pass',
    ]);

    $payload = [
        'id' => 'inv_test_123456',
        'external_id' => 'HIRAYA-PAY-2026-TEST1234',
        'status' => 'PAID',
        'payment_method' => 'GCASH',
        'paid_amount' => 299.00,
        'paid_at' => now()->toIso8601String(),
    ];

    $response = $this->postJson(route('webhooks.xendit'), $payload, [
        'x-callback-token' => 'test_callback_secret_token_123',
    ]);

    $response->assertOk()
        ->assertJson(['status' => 'success']);

    $payment->refresh();
    $user->refresh();

    expect($payment->status)->toBe('paid');
    expect($payment->payment_method)->toBe('GCASH');
    expect($user->is_premium)->toBeTrue();
    expect($user->premium_until)->not->toBeNull();
});

test('webhook handles lifetime plan entitlement without expiration', function () {
    $user = User::factory()->create([
        'is_premium' => false,
    ]);

    $payment = Payment::create([
        'user_id' => $user->id,
        'reference_id' => 'HIRAYA-PAY-2026-LIFETIME',
        'xendit_id' => 'inv_lifetime_999',
        'status' => 'pending',
        'amount' => 499.00,
        'currency' => 'PHP',
        'plan_code' => 'lifetime_access',
    ]);

    $payload = [
        'id' => 'inv_lifetime_999',
        'external_id' => 'HIRAYA-PAY-2026-LIFETIME',
        'status' => 'PAID',
        'payment_method' => 'PAYMAYA',
        'paid_amount' => 499.00,
    ];

    $response = $this->postJson(route('webhooks.xendit'), $payload, [
        'x-callback-token' => 'test_callback_secret_token_123',
    ]);

    $response->assertOk();

    $user->refresh();
    expect($user->is_premium)->toBeTrue();
    expect($user->premium_until)->toBeNull(); // null = lifetime
});

test('webhook is idempotent on duplicate delivery', function () {
    $user = User::factory()->create(['is_premium' => true]);

    $payment = Payment::create([
        'user_id' => $user->id,
        'reference_id' => 'HIRAYA-PAY-2026-DUP',
        'xendit_id' => 'inv_dup_123',
        'status' => 'paid',
        'amount' => 299.00,
        'currency' => 'PHP',
        'plan_code' => 'pro_pass',
    ]);

    $payload = [
        'id' => 'inv_dup_123',
        'external_id' => 'HIRAYA-PAY-2026-DUP',
        'status' => 'PAID',
    ];

    $response = $this->postJson(route('webhooks.xendit'), $payload, [
        'x-callback-token' => 'test_callback_secret_token_123',
    ]);

    $response->assertOk();
});

test('dev payment simulator updates payment and activates user in non-production', function () {
    $user = User::factory()->create(['is_premium' => false]);

    $payment = Payment::create([
        'user_id' => $user->id,
        'reference_id' => 'HIRAYA-PAY-DEV-SIMULATE',
        'status' => 'pending',
        'amount' => 499.00,
        'currency' => 'PHP',
        'plan_code' => 'lifetime_access',
    ]);

    $response = $this->actingAs($user)->post(route('dev.payments.simulate', $payment), [
        'status' => 'paid',
        'channel' => 'GCASH_TEST',
    ]);

    $response->assertRedirect();

    $payment->refresh();
    $user->refresh();

    expect($payment->status)->toBe('paid');
    expect($user->is_premium)->toBeTrue();
});

test('webhook returns ok with ignored status for unknown or test reference', function () {
    $payload = [
        'id' => '579c8d61f23fa4ca35e52da4',
        'external_id' => 'invoice_123124123',
        'status' => 'PAID',
    ];

    $response = $this->postJson(route('webhooks.xendit'), $payload, [
        'x-callback-token' => 'test_callback_secret_token_123',
    ]);

    $response->assertOk()
        ->assertJson([
            'status' => 'ignored',
            'message' => 'Payment reference not found or unprocessable',
        ]);
});
