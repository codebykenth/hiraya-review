<?php

use App\Models\Category;
use App\Models\Question;
use App\Models\Subcategory;
use App\Models\User;

test('admin can view drafts page with pagination and all draft questions', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
        'is_active' => true,
    ]);

    $otherUser = User::factory()->create([
        'role' => 'user',
        'is_active' => true,
    ]);

    $category = Category::create([
        'name' => 'Analytical Ability',
        'slug' => 'analytical-ability',
    ]);

    $subcategory = Subcategory::create([
        'category_id' => $category->id,
        'name' => 'Word analogy',
        'slug' => 'word-analogy',
        'language' => 'English',
    ]);

    // Create 15 draft questions created by another user
    for ($i = 1; $i <= 15; $i++) {
        Question::create([
            'subcategory_id' => $subcategory->id,
            'stem' => "Draft Question stem #{$i}",
            'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
            'correct_option' => 0,
            'explanation' => "Explanation #{$i}",
            'language' => 'English',
            'status' => 'draft',
            'created_by' => $otherUser->id,
        ]);
    }

    $response = $this->actingAs($admin)->get(route('questions.drafts', ['per_page' => 10, 'page' => 1]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/questions/drafts')
        ->has('initialDrafts', 10)
        ->where('pagination.total', 15)
        ->where('pagination.last_page', 2)
        ->where('pagination.current_page', 1)
    );

    // Test page 2
    $responsePage2 = $this->actingAs($admin)->get(route('questions.drafts', ['per_page' => 10, 'page' => 2]));
    $responsePage2->assertOk();
    $responsePage2->assertInertia(fn ($page) => $page
        ->component('admin/questions/drafts')
        ->has('initialDrafts', 5)
        ->where('pagination.current_page', 2)
    );
});

test('admin can filter drafts by search, category, and subcategory', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
        'is_active' => true,
    ]);

    $category = Category::create([
        'name' => 'Verbal Ability',
        'slug' => 'verbal-ability',
    ]);

    $subcategory = Subcategory::create([
        'category_id' => $category->id,
        'name' => 'Word meaning',
        'slug' => 'word-meaning',
        'language' => 'English',
    ]);

    Question::create([
        'subcategory_id' => $subcategory->id,
        'stem' => 'Unique matching keyword in stem',
        'options' => ['A', 'B', 'C', 'D'],
        'correct_option' => 1,
        'explanation' => 'Exp',
        'language' => 'English',
        'status' => 'draft',
        'created_by' => $admin->id,
    ]);

    Question::create([
        'subcategory_id' => $subcategory->id,
        'stem' => 'Completely different question',
        'options' => ['A', 'B', 'C', 'D'],
        'correct_option' => 2,
        'explanation' => 'Exp',
        'language' => 'English',
        'status' => 'draft',
        'created_by' => $admin->id,
    ]);

    $response = $this->actingAs($admin)->get(route('questions.drafts', [
        'search' => 'Unique matching keyword',
        'category' => 'Verbal Ability',
    ]));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/questions/drafts')
        ->has('initialDrafts', 1)
        ->where('pagination.total', 1)
    );
});
