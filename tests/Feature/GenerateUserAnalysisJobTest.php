<?php

use App\Jobs\GenerateUserAnalysisJob;
use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\Question;
use App\Models\Subcategory;
use App\Models\User;
use App\Models\UserAiAnalysis;
use Illuminate\Support\Facades\Http;

test('GenerateUserAnalysisJob calculates subtopic stats and maps subcategory IDs correctly', function () {
    // 1. Setup User and Categories
    $user = User::factory()->create();

    $category = Category::create([
        'name' => 'Numerical Ability',
        'slug' => 'numerical-ability',
    ]);

    $subcategory1 = Subcategory::create([
        'category_id' => $category->id,
        'name' => 'Fractions',
        'slug' => 'fractions',
    ]);

    $subcategory2 = Subcategory::create([
        'category_id' => $category->id,
        'name' => 'Decimals',
        'slug' => 'decimals',
    ]);

    // 2. Setup Questions
    $q1 = Question::create([
        'subcategory_id' => $subcategory1->id,
        'stem' => 'What is 1/2 + 1/4?',
        'options' => ['A' => '3/4', 'B' => '1/2', 'C' => '1/4', 'D' => '1'],
        'correct_option' => 0,
        'created_by' => $user->id,
        'explanation' => 'Some explanation',
        'status' => 'active',
    ]);

    $q2 = Question::create([
        'subcategory_id' => $subcategory2->id,
        'stem' => 'What is 0.5 + 0.25?',
        'options' => ['A' => '0.75', 'B' => '0.5', 'C' => '0.25', 'D' => '1'],
        'correct_option' => 0,
        'created_by' => $user->id,
        'explanation' => 'Some explanation',
        'status' => 'active',
    ]);

    // 3. Setup Exam Attempt with Answers
    // q1 is correct (0), q2 is incorrect (1)
    $attempt = ExamAttempt::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'question_ids' => [$q1->id, $q2->id],
        'answers' => [$q1->id => 0, $q2->id => 1],
        'cat_scores' => [
            'categoryScoreMap' => [
                'Numerical Ability' => ['correct' => 1, 'total' => 2],
            ],
            'metadata' => [
                'track' => 'Drill',
                'category_name' => 'Numerical Ability',
                'correct_count' => 1,
                'total_questions' => 2,
                'duration_secs' => 120,
            ],
        ],
    ]);

    // 4. Mock AI Response
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'pass_probability' => 75,
                            'verdict' => 'Great performance on fractions, needs improvement in decimals!',
                            'trend' => 'stable',
                            'strengths' => ['Numerical Ability'],
                            'critical_weaknesses' => ['Decimals'],
                            'priority_action' => 'Review decimal addition.',
                            'recommended_modules' => ['Decimals'],
                            'encouragement' => 'Keep pushing forward!',
                            'predictive_metrics' => [
                                'estimated_exam_score' => '70% - 80%',
                                'days_to_readiness' => '10 days',
                                'completion_pace' => 'Steady pace.',
                                'mock_pass_confidence' => 'moderate',
                            ],
                            'subject_mastery' => [
                                [
                                    'subject' => 'Numerical Ability',
                                    'rating' => 'Satisfactory',
                                    'color' => 'amber',
                                    'insight' => 'Scored 50% on decimal and fraction drills.',
                                ],
                            ],
                            'timeline_prediction' => [
                                'current_stage' => 'Practice Stage',
                                'milestone_prediction' => 'Master decimals in 7 days.',
                                'potential_score_improvement' => '+15%',
                            ],
                            'remediation_matrix' => [
                                [
                                    'subtopic' => 'Decimals',
                                    'difficulty_level' => 'Medium',
                                    'reason_for_struggle' => 'Incorrect option chosen.',
                                    'coaching_tip' => 'Draw visual decimal grids.',
                                ],
                            ],
                            'personalized_7_day_plan' => [
                                [
                                    'day' => 'Day 1',
                                    'focus_topic' => 'Decimals',
                                    'activity' => 'Review decimal addition',
                                    'subcategory_id' => $subcategory2->id,
                                ],
                            ],
                        ]),
                    ],
                ],
            ],
        ], 200),
    ]);

    // Set temporary environment keys so model attempts do not skip
    config([
        'services.groq.key' => 'fake-groq-key',
        'services.ai.analysis_enabled' => true,
    ]);

    // 5. Dispatch and run the job synchronously
    $job = new GenerateUserAnalysisJob($user->id, $attempt->id);
    $job->handle();

    // 6. Assert cached analysis row exists
    $this->assertDatabaseHas('user_ai_analyses', [
        'user_id' => $user->id,
        'last_exam_attempt_id' => $attempt->id,
    ]);

    $cached = UserAiAnalysis::where('user_id', $user->id)->first();
    $analysis = $cached->analysis_json;

    expect($analysis['pass_probability'])->toBe(75);
    expect($analysis['verdict'])->toContain('fractions');
    expect($analysis['personalized_7_day_plan'][0]['subcategory_id'])->toBe($subcategory2->id);
});

test('GenerateUserAnalysisJob falls back to deterministic generation when keys are missing', function () {
    $user = User::factory()->create();

    $category = Category::create([
        'name' => 'Numerical Ability',
        'slug' => 'numerical-ability',
    ]);

    $subcategory1 = Subcategory::create([
        'category_id' => $category->id,
        'name' => 'Fractions',
        'slug' => 'fractions',
    ]);

    $attempt = ExamAttempt::create([
        'user_id' => $user->id,
        'category_id' => null,
        'question_ids' => [1],
        'answers' => [1 => 0],
        'cat_scores' => [
            'categoryScoreMap' => [
                'Numerical Ability' => ['correct' => 1, 'total' => 1],
            ],
            'metadata' => [
                'track' => 'Professional',
                'category_name' => 'Numerical Ability',
                'correct_count' => 1,
                'total_questions' => 1,
                'duration_secs' => 60,
            ],
        ],
    ]);

    // Ensure API keys are null
    config(['services.groq.key' => null]);
    config(['services.gemini.key' => null]);

    $job = new GenerateUserAnalysisJob($user->id, $attempt->id);
    $job->handle();

    $this->assertDatabaseHas('user_ai_analyses', [
        'user_id' => $user->id,
        'last_exam_attempt_id' => $attempt->id,
    ]);

    $cached = UserAiAnalysis::where('user_id', $user->id)->first();
    $analysis = $cached->analysis_json;

    expect($analysis['pass_probability'])->toBeGreaterThan(0);
    expect($analysis['verdict'])->not->toBeEmpty();
});

test('GenerateUserAnalysisJob sets pass_probability to 0 when user has only completed drills', function () {
    $user = User::factory()->create();

    $category = Category::create([
        'name' => 'Verbal Ability',
        'slug' => 'verbal-ability',
    ]);

    $attempt = ExamAttempt::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'question_ids' => [1],
        'answers' => [1 => 0],
        'cat_scores' => [
            'categoryScoreMap' => [
                'Verbal Ability' => ['correct' => 1, 'total' => 1],
            ],
            'metadata' => [
                'track' => 'Drill',
                'category_name' => 'Verbal Ability',
                'correct_count' => 1,
                'total_questions' => 1,
                'duration_secs' => 60,
            ],
        ],
    ]);

    config(['services.groq.key' => null]);
    config(['services.gemini.key' => null]);

    $job = new GenerateUserAnalysisJob($user->id, $attempt->id);
    $job->handle();

    $cached = UserAiAnalysis::where('user_id', $user->id)->first();
    $analysis = $cached->analysis_json;

    expect($analysis['pass_probability'])->toBe(0);
    expect($analysis['verdict'])->not->toBeEmpty();
});
