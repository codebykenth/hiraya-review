<?php

use App\Mail\SupportSubmittedMail;
use Illuminate\Support\Facades\Mail;

test('guests and users can visit the support page', function () {
    $response = $this->get(route('support'));
    $response->assertOk();
});

test('support submission sends an email and redirects back with success message', function () {
    Mail::fake();

    $response = $this->post(route('support.store'), [
        'name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'message' => 'Hello! I would like to report a bug in one of the verbal ability questions.',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    Mail::assertSent(SupportSubmittedMail::class, function ($mail) {
        return $mail->data['name'] === 'Juan Dela Cruz' &&
               $mail->data['email'] === 'juan@example.com' &&
               $mail->data['message'] === 'Hello! I would like to report a bug in one of the verbal ability questions.';
    });
});

test('support submission validation rules are enforced', function () {
    Mail::fake();

    // 1. Missing fields
    $response = $this->post(route('support.store'), []);
    $response->assertSessionHasErrors(['name', 'email', 'message']);

    // 2. Invalid email format
    $response = $this->post(route('support.store'), [
        'name' => 'Juan Dela Cruz',
        'email' => 'not-an-email',
        'message' => 'This is a message that is long enough.',
    ]);
    $response->assertSessionHasErrors(['email']);

    // 3. Message too short
    $response = $this->post(route('support.store'), [
        'name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'message' => 'Short',
    ]);
    $response->assertSessionHasErrors(['message']);

    Mail::assertNothingSent();
});

test('rate limit is active in production environment and returns Inertia errors', function () {
    app()->detectEnvironment(fn () => 'production');
    Mail::fake();

    // First request should succeed
    $response = $this->post(route('support.store'), [
        'name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'message' => 'Hello! I would like to report a bug in one of the verbal ability questions.',
    ]);
    $response->assertRedirect();

    // Second request should be rate limited and return validation error in the session
    $response = $this->post(route('support.store'), [
        'name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'message' => 'Hello! I would like to report a bug in one of the verbal ability questions.',
    ], [
        'X-Inertia' => 'true',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors(['rate_limit']);
});
