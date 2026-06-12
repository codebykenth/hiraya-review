<?php

use App\Models\ExamAttempt;
use App\Models\User;

test('guests can store an exam attempt', function () {
    $response = $this->postJson(route('exams.attempts.store'), [
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

test('authenticated users can store a timed exam attempt', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson(route('exams.attempts.store'), [
        'category_id' => null,
        'question_ids' => [1, 2, 3],
        'answers' => [1 => 0, 2 => 2, 3 => 1],
        'cat_scores' => [
            'categoryScoreMap' => [],
            'metadata' => [
                'track' => 'Drill',
                'category_name' => 'Verbal Ability',
                'correct_count' => 2,
                'total_questions' => 3,
                'skipped_count' => 0,
                'duration_secs' => 120,
                'is_timed' => true,
            ],
        ],
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);

    $this->assertDatabaseHas('exam_attempts', [
        'user_id' => $user->id,
        'category_id' => null,
    ]);

    $attempt = ExamAttempt::latest()->first();
    expect($attempt->cat_scores['metadata']['is_timed'])->toBeTrue();
});

test('authenticated users can store an untimed exam attempt', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson(route('exams.attempts.store'), [
        'category_id' => null,
        'question_ids' => [1, 2, 3],
        'answers' => [1 => 0, 2 => 2, 3 => 1],
        'cat_scores' => [
            'categoryScoreMap' => [],
            'metadata' => [
                'track' => 'Drill',
                'category_name' => 'Verbal Ability',
                'correct_count' => 2,
                'total_questions' => 3,
                'skipped_count' => 0,
                'duration_secs' => 300,
                'is_timed' => false,
            ],
        ],
    ]);

    $response->assertOk();
    $response->assertJson(['success' => true]);

    $attempt = ExamAttempt::latest()->first();
    expect($attempt->cat_scores['metadata']['is_timed'])->toBeFalse();
});

test('authenticated users can access the drills list page', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('drills.index'));
    $response->assertOk();
});

test('authenticated users can access past attempts history', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('history.index'));
    $response->assertOk();
});
