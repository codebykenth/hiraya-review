<?php

use App\Models\Category;
use App\Models\ExamAttempt;
use App\Models\User;

test('admin can view user management page with statistics and attempt counts', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
        'is_active' => true,
    ]);

    $student = User::factory()->create([
        'role' => 'user',
        'is_active' => true,
    ]);

    $category = Category::create([
        'name' => 'Numerical Ability',
        'slug' => 'numerical-ability',
    ]);

    ExamAttempt::create([
        'user_id' => $student->id,
        'category_id' => null, // mock exam
        'question_ids' => [1, 2, 3],
        'answers' => [1 => 'A'],
        'cat_scores' => ['General Information' => ['correct' => 1, 'total' => 1]],
    ]);

    ExamAttempt::create([
        'user_id' => $student->id,
        'category_id' => $category->id, // drill
        'question_ids' => [4, 5],
        'answers' => [4 => 'B'],
        'cat_scores' => ['Numerical' => ['correct' => 1, 'total' => 1]],
    ]);

    $response = $this->actingAs($admin)->get(route('admin.users.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users')
        ->has('stats')
        ->where('stats.total_users', 2)
        ->where('stats.total_admins', 1)
        ->where('stats.total_students', 1)
        ->where('stats.total_attempts', 2)
    );
});

test('non-admin cannot access user management page', function () {
    $student = User::factory()->create([
        'role' => 'user',
    ]);

    $response = $this->actingAs($student)->get(route('admin.users.index'));

    $response->assertNotFound();
});

test('admin can update user role and active status', function () {
    $admin = User::factory()->create([
        'role' => 'admin',
    ]);

    $student = User::factory()->create([
        'role' => 'user',
        'is_active' => true,
    ]);

    $response = $this->actingAs($admin)->put(route('admin.users.update', $student->id), [
        'role' => 'admin',
        'is_active' => false,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $student->id,
        'role' => 'admin',
        'is_active' => false,
    ]);
});
