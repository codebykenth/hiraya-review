<?php

use App\Models\User;

test('guest can access the exams page', function () {
    $response = $this->get(route('exams.index'));

    $response->assertOk();
});

test('guest cannot POST to exams/attempts', function () {
    $response = $this->postJson(route('exams.attempts.store'), [
        'question_ids' => [1, 2, 3],
        'answers' => [1 => 0, 2 => 2],
        'cat_scores' => ['metadata' => ['is_timed' => true]],
    ]);

    $response->assertStatus(401);
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
