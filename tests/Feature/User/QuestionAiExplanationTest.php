<?php

use App\Models\DocumentEmbedding;
use App\Models\LearnModule;
use App\Models\Question;
use App\Models\QuestionAiExplanation;
use App\Models\Subcategory;
use App\Models\User;
use App\Services\Ai\AiGatewayService;

test('unauthenticated users cannot request ai explanation', function () {
    $subcategory = Subcategory::factory()->create();
    $question = Question::factory()->create([
        'subcategory_id' => $subcategory->id,
        'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
        'correct_option' => 1,
    ]);

    $response = $this->postJson(route('exams.questions.aiExplain', $question), [
        'selected_option' => 0,
    ]);

    $response->assertNotFound();
});

test('validates selected_option parameter', function () {
    $user = User::factory()->create();
    $subcategory = Subcategory::factory()->create();
    $question = Question::factory()->create([
        'subcategory_id' => $subcategory->id,
        'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
        'correct_option' => 1,
    ]);

    $response = $this->actingAs($user)->postJson(route('exams.questions.aiExplain', $question), []);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['selected_option']);
});

test('returns cached explanation if already generated', function () {
    $user = User::factory()->create();
    $subcategory = Subcategory::factory()->create();
    $question = Question::factory()->create([
        'subcategory_id' => $subcategory->id,
        'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
        'correct_option' => 1,
    ]);

    QuestionAiExplanation::create([
        'question_id' => $question->id,
        'selected_option' => 0,
        'explanation' => 'Pre-cached cognitive explanation.',
    ]);

    $response = $this->actingAs($user)->postJson(route('exams.questions.aiExplain', $question), [
        'selected_option' => 0,
    ]);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'data' => [
            'explanation' => 'Pre-cached cognitive explanation.',
            'cached' => true,
            'source' => 'cache',
        ],
    ]);
});

test('generates and persists explanation when not cached', function () {
    $user = User::factory()->create();
    $subcategory = Subcategory::factory()->create();
    $question = Question::factory()->create([
        'subcategory_id' => $subcategory->id,
        'stem' => 'What is the highest law of the land in the Philippines?',
        'options' => ['Civil Code', '1987 Constitution', 'Revised Penal Code', 'Labor Code'],
        'correct_option' => 1,
        'explanation' => 'The 1987 Constitution is the supreme law of the land.',
    ]);

    $this->mock(AiGatewayService::class, function ($mock) {
        $mock->shouldReceive('isAiConfigured')->andReturn(true);
        $mock->shouldReceive('createEmbedding')->andReturn([0.1, 0.2, 0.3]);
        $mock->shouldReceive('runGemini')->andReturn([
            'success' => true,
            'text' => 'Option B is correct because the 1987 Constitution serves as the fundamental and supreme law of the Republic of the Philippines.',
        ]);
    });

    $response = $this->actingAs($user)->postJson(route('exams.questions.aiExplain', $question), [
        'selected_option' => 0,
    ]);

    $response->assertOk();
    $response->assertJson([
        'success' => true,
        'data' => [
            'explanation' => 'Option B is correct because the 1987 Constitution serves as the fundamental and supreme law of the Republic of the Philippines.',
            'cached' => false,
            'source' => 'rag_gemini',
        ],
    ]);

    expect(QuestionAiExplanation::where('question_id', $question->id)->where('selected_option', 0)->exists())->toBeTrue();
});

test('rag:index command indexes published learn modules', function () {
    $subcategory = Subcategory::factory()->create();
    $module = LearnModule::factory()->create([
        'subcategory_id' => $subcategory->id,
        'title' => 'Constitutional Law Summary',
        'content' => 'Article II Section 1 states that the Philippines is a democratic and republican State. Sovereignty resides in the people and all government authority emanates from them.',
        'is_published' => true,
    ]);

    $this->mock(AiGatewayService::class, function ($mock) {
        $mock->shouldReceive('createEmbedding')->andReturn([0.1, 0.2, 0.3]);
    });

    $this->artisan('rag:index')
        ->assertSuccessful();

    expect(DocumentEmbedding::where('sourceable_id', $module->id)->exists())->toBeTrue();
});
