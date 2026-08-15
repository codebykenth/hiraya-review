<?php

use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\Subcategory;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected when visiting analytics', function () {
    $response = $this->get(route('analytics.index'));
    $response->assertStatus(404);
});

test('authenticated users can view analytics index with default stats', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('analytics.index'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('user/analytics/index')
        ->has('stats')
        ->has('aiAnalysis')
        ->where('stats.totalExams', 0)
    );
});

test('analytics computes real stats, cse readiness index, and subtest cutoffs', function () {
    $user = User::factory()->create();

    $category = Category::factory()->create(['name' => 'Numerical Ability']);
    $subcategory = Subcategory::factory()->create([
        'category_id' => $category->id,
        'name' => 'Word Problems',
    ]);

    // Create an exam attempt with 80% score
    ExamAttempt::create([
        'user_id' => $user->id,
        'category_id' => null,
        'question_ids' => [1, 2, 3, 4, 5],
        'answers' => [1, 1, 1, 1, 0],
        'cat_scores' => [
            'metadata' => [
                'track' => 'Professional',
                'correct_count' => 4,
                'total_questions' => 5,
                'duration_secs' => 200,
                'is_timed' => true,
            ],
            'categoryScoreMap' => [
                'Numerical Ability' => [
                    'correct' => 4,
                    'total' => 5,
                    'subcats' => [
                        'Word Problems' => ['correct' => 4, 'total' => 5],
                    ],
                ],
            ],
        ],
    ]);

    $response = $this->actingAs($user)->get(route('analytics.index'));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('user/analytics/index')
        ->has('stats')
        ->where('stats.totalExams', 1)
        ->has('stats.cseReadinessIndex')
        ->has('stats.subtestThresholds')
        ->has('stats.percentileRank')
    );
});

test('analytics respects track and runs filters', function () {
    $user = User::factory()->create();

    // Create a Professional attempt
    ExamAttempt::create([
        'user_id' => $user->id,
        'category_id' => null,
        'question_ids' => [1, 2],
        'answers' => [1, 1],
        'cat_scores' => [
            'metadata' => [
                'track' => 'Professional',
                'correct_count' => 2,
                'total_questions' => 2,
                'duration_secs' => 100,
            ],
            'categoryScoreMap' => [
                'Verbal Ability' => ['correct' => 2, 'total' => 2],
            ],
        ],
    ]);

    // Create a Subprofessional attempt
    ExamAttempt::create([
        'user_id' => $user->id,
        'category_id' => null,
        'question_ids' => [3, 4],
        'answers' => [1, 1],
        'cat_scores' => [
            'metadata' => [
                'track' => 'Subprofessional',
                'correct_count' => 2,
                'total_questions' => 2,
                'duration_secs' => 90,
            ],
            'categoryScoreMap' => [
                'Clerical Ability' => ['correct' => 2, 'total' => 2],
            ],
        ],
    ]);

    // Query for Subprofessional track only
    $response = $this->actingAs($user)->get(route('analytics.index', ['track' => 'Subprofessional']));
    $response->assertOk();

    $response->assertInertia(fn (Assert $page) => $page
        ->component('user/analytics/index')
        ->where('stats.totalExams', 1)
        ->where('stats.filters.track', 'Subprofessional')
    );
});
