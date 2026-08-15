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
