<?php

use App\Models\Category;
use App\Models\Question;
use App\Models\SavedDrillSet;
use App\Models\Subcategory;
use App\Models\User;

test('authenticated user can visit drills index with saved sets and questions without error', function () {
    $user = User::factory()->create();

    $category = Category::create([
        'name' => 'Numerical Ability',
        'slug' => 'numerical-ability',
    ]);

    $subcategory = Subcategory::create([
        'category_id' => $category->id,
        'name' => 'Word Problems',
        'slug' => 'word-problems',
        'language' => 'English',
    ]);

    $question = Question::factory()->create([
        'subcategory_id' => $subcategory->id,
    ]);

    $set = SavedDrillSet::create([
        'user_id' => $user->id,
        'name' => 'My Word Problems',
        'color' => 'blue',
    ]);

    $set->questions()->attach($question->id);

    $response = $this->actingAs($user)->get(route('drills.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('user/drills/index')
        ->has('questions')
        ->has('categories')
        ->has('savedDrillSets', 1)
        ->has('wrongQuestionIds')
        ->has('seenQuestionIds')
    );
});

test('authenticated user can store a custom drill question', function () {
    $user = User::factory()->create();

    $category = Category::create([
        'name' => 'Analytical Ability',
        'slug' => 'analytical-ability',
    ]);

    $subcategory = Subcategory::create([
        'category_id' => $category->id,
        'name' => 'Logic & Reasoning',
        'slug' => 'logic-reasoning',
        'language' => 'English',
    ]);

    $response = $this->actingAs($user)->postJson(route('drills.custom-questions.store'), [
        'subcategory_id' => $subcategory->id,
        'language' => 'English',
        'stem' => 'What comes next in the sequence: 2, 4, 8, 16, ?',
        'options' => ['24', '30', '32', '64'],
        'correct_option' => 2,
        'explanation' => 'Each number doubles the previous number.',
    ]);

    $response->assertCreated();
    $response->assertJsonPath('message', 'Question created successfully.');
    $response->assertJsonPath('question.stem', 'What comes next in the sequence: 2, 4, 8, 16, ?');
    $response->assertJsonPath('question.category', 'Analytical Ability');
    $response->assertJsonPath('question.subcategory', 'Logic & Reasoning');
    $response->assertJsonPath('question.isCustom', true);

    $this->assertDatabaseHas('questions', [
        'stem' => 'What comes next in the sequence: 2, 4, 8, 16, ?',
        'created_by' => $user->id,
        'status' => 'active',
    ]);
});

test('custom drill question requires valid subcategory and options', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('drills.custom-questions.store'), [
        'subcategory_id' => 999999,
        'stem' => '',
        'options' => ['One choice only'],
        'correct_option' => 0,
    ]);

    $response->assertUnprocessable();
    $response->assertJsonValidationErrors(['subcategory_id', 'stem', 'options']);
});
