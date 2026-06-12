<?php

use App\Models\User;
use Illuminate\Auth\Events\Login;

test('guest can access the exams page', function () {
    $response = $this->get(route('exams.index', ['free_attempt' => '1']));

    $response->assertOk();
});

test('guest can POST to exams/attempts', function () {
    $response = $this->postJson(route('exams.attempts.store'), [
        'category_id' => null,
        'question_ids' => [1, 2, 3],
        'answers' => [1 => 0, 2 => 2, 3 => 1],
        'cat_scores' => [
            'categoryScoreMap' => [],
            'metadata' => [
                'track' => 'Professional',
                'category_name' => 'Professional Level Reviewer',
                'correct_count' => 2,
                'total_questions' => 3,
                'skipped_count' => 0,
                'duration_secs' => 180,
                'is_timed' => true,
            ],
        ],
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);
});

test('authenticated user can POST to exams/attempts', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson(route('exams.attempts.store'), [
        'category_id' => null,
        'question_ids' => [1, 2, 3],
        'answers' => [1 => 0, 2 => 2, 3 => 1],
        'cat_scores' => [
            'categoryScoreMap' => [],
            'metadata' => [
                'track' => 'Professional',
                'category_name' => 'Professional Level Reviewer',
                'correct_count' => 2,
                'total_questions' => 3,
                'skipped_count' => 0,
                'duration_secs' => 180,
                'is_timed' => true,
            ],
        ],
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);
});

test('guest attempt is claimed by user upon registration or login', function () {
    $response = $this->postJson(route('exams.attempts.store'), [
        'category_id' => null,
        'question_ids' => [1, 2, 3],
        'answers' => [1 => 0, 2 => 2, 3 => 1],
        'cat_scores' => [
            'categoryScoreMap' => [],
            'metadata' => [
                'track' => 'Professional',
                'category_name' => 'Professional Level Reviewer',
                'correct_count' => 2,
                'total_questions' => 3,
                'skipped_count' => 0,
                'duration_secs' => 180,
                'is_timed' => true,
            ],
        ],
    ]);

    $response->assertOk();
    $attemptId = $response->json('attempt_id');
    expect($attemptId)->not->toBeNull();

    $this->assertDatabaseHas('exam_attempts', [
        'id' => $attemptId,
        'user_id' => null,
    ]);

    $user = User::factory()->create();
    event(new Login('web', $user, false));

    $this->assertDatabaseHas('exam_attempts', [
        'id' => $attemptId,
        'user_id' => $user->id,
    ]);
});
