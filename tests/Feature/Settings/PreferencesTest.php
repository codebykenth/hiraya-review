<?php

use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Support\Facades\Cache;

test('guests cannot access preferences page', function () {
    $response = $this->get(route('preferences.edit'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can render preferences page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('preferences.edit'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/preferences')
        ->has('analysisMode')
        ->has('aiAvailable')
    );
});

test('authenticated users can update analysis mode preferences', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('preferences.update'), [
        'analysis_mode' => 'ai',
    ]);

    $response->assertRedirect(route('preferences.edit'));
    expect(Cache::get("user-analysis-mode-{$user->id}"))->toBe('ai');
});

test('authenticated users can view specific attempt analysis report', function () {
    $user = User::factory()->create();
    $attempt = ExamAttempt::create([
        'user_id' => $user->id,
        'category_id' => null,
        'question_ids' => [1, 2, 3],
        'answers' => [1 => 0, 2 => 2, 3 => 1],
        'cat_scores' => [
            'categoryScoreMap' => [],
            'metadata' => [
                'track' => 'Professional',
                'category_name' => 'Verbal Ability',
                'correct_count' => 2,
                'total_questions' => 3,
                'skipped_count' => 0,
                'duration_secs' => 120,
                'is_timed' => true,
            ],
        ],
    ]);

    $response = $this->actingAs($user)->get("/analytics/ai-analysis?attempt_id={$attempt->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('user/dashboard/ai-analysis')
        ->where('status', 'ready')
        ->has('data')
        ->where('attempt_id', $attempt->id)
    );
});
