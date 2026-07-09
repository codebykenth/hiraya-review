<?php

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\ExamAttempt;
use App\Models\User;
use App\Models\UserAiAnalysis;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard.index'));
    $response->assertStatus(404);
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard.index'));

    $response->assertStatus(200);
});

test('dashboard status is no_data if user has no exam attempts', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('dashboard.index'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('user/dashboard/index')
        ->has('aiAnalysis', fn (Assert $page) => $page
            ->where('status', 'no_data')
            ->where('data', null)
        )
    );
});

test('dashboard dispatches GenerateUserAnalysisJob if user has exam attempts but no analysis', function () {
    config(['services.ai.analysis_enabled' => true]);
    Bus::fake();

    $user = User::factory()->create();
    Cache::put("user-analysis-mode-{$user->id}", 'ai');
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

    $response = $this->get(route('dashboard.index'));
    $response->assertOk();

    Bus::assertDispatched(GenerateUserAnalysisJob::class);

    $response->assertInertia(fn (Assert $page) => $page
        ->component('user/dashboard/index')
        ->has('aiAnalysis', fn (Assert $page) => $page
            ->where('status', 'generating')
            ->where('data', null)
        )
    );
});

test('dashboard serves cached analysis if generated today', function () {
    config(['services.ai.analysis_enabled' => true]);
    $user = User::factory()->create();
    Cache::put("user-analysis-mode-{$user->id}", 'ai');
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

    $response = $this->get(route('dashboard.index'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('user/dashboard/index')
        ->has('aiAnalysis', fn (Assert $page) => $page
            ->where('status', 'ready')
            ->where('data', $analysisData)
        )
    );
});
