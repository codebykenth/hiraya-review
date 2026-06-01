<?php

use App\Models\User;
use App\Models\ExamAttempt;
use App\Models\UserAiAnalysis;
use App\Jobs\GenerateUserAnalysisJob;
use Illuminate\Support\Facades\Bus;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('dashboard status is no_data if user has no exam attempts', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
    
    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('aiAnalysis', fn (Assert $page) => $page
            ->where('status', 'no_data')
            ->where('data', null)
        )
    );
});

test('dashboard dispatches GenerateUserAnalysisJob if user has exam attempts but no analysis', function () {
    Bus::fake();

    $user = User::factory()->create();
    $this->actingAs($user);

    $attempt = ExamAttempt::create([
        'user_id' => $user->id,
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

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    Bus::assertDispatched(GenerateUserAnalysisJob::class);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('aiAnalysis', fn (Assert $page) => $page
            ->where('status', 'generating')
            ->where('data', null)
        )
    );
});

test('dashboard serves cached analysis if generated today', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $attempt = ExamAttempt::create([
        'user_id' => $user->id,
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

    $analysisData = [
        'pass_probability' => 85,
        'verdict' => 'Looking strong!',
        'trend' => 'improving',
        'strengths' => ['Verbal Ability'],
        'critical_weaknesses' => [],
        'priority_action' => 'Keep practicing.',
        'recommended_modules' => ['Grammar'],
        'encouragement' => 'You can do this!',
    ];

    UserAiAnalysis::create([
        'user_id' => $user->id,
        'last_exam_attempt_id' => $attempt->id,
        'analysis_json' => $analysisData,
    ]);

    $response = $this->get(route('dashboard'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('dashboard')
        ->has('aiAnalysis', fn (Assert $page) => $page
            ->where('status', 'ready')
            ->where('data', $analysisData)
        )
    );
});
