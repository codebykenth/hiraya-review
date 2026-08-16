<?php

use App\Models\StudySchedule;
use App\Models\User;

test('authenticated user can fetch study plan templates', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/study-suggestions/templates');

    $response->assertOk();
    $response->assertJsonStructure([
        'templates' => [
            '*' => [
                'id',
                'title',
                'subtitle',
                'duration_days',
                'badge',
                'description',
                'topics',
            ],
        ],
    ]);
});

test('authenticated user can apply 14-day crash course template', function () {
    $user = User::factory()->create();
    $startDate = now()->format('Y-m-d');

    $response = $this->actingAs($user)->postJson('/study-suggestions/templates/apply', [
        'template_id' => '14_day_crash_course',
        'start_date' => $startDate,
        'preferred_time' => '20:00',
    ]);

    $response->assertStatus(201);
    $response->assertJson(['count' => 14]);

    $this->assertDatabaseCount('study_schedules', 14);
    $this->assertDatabaseHas('study_schedules', [
        'user_id' => $user->id,
        'title' => 'Verbal: Grammar & Correct Usage',
    ]);
});

test('authenticated user can apply 30-day comprehensive template with replace option', function () {
    $user = User::factory()->create();
    $startDate = now()->format('Y-m-d');

    // Create an existing schedule
    StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $startDate,
        'title' => 'Old Schedule Item',
    ]);

    $response = $this->actingAs($user)->postJson('/study-suggestions/templates/apply', [
        'template_id' => '30_day_comprehensive',
        'start_date' => $startDate,
        'preferred_time' => '18:30',
        'replace_existing' => true,
    ]);

    $response->assertStatus(201);
    $this->assertDatabaseMissing('study_schedules', ['title' => 'Old Schedule Item']);
    $this->assertDatabaseCount('study_schedules', 30);
});

test('authenticated user can apply 60-day deep mastery template', function () {
    $user = User::factory()->create();
    $startDate = now()->format('Y-m-d');

    $response = $this->actingAs($user)->postJson('/study-suggestions/templates/apply', [
        'template_id' => '60_day_deep_mastery',
        'start_date' => $startDate,
        'preferred_time' => '19:00',
    ]);

    $response->assertStatus(201);
    $response->assertJson(['count' => 60]);
    $this->assertDatabaseCount('study_schedules', 60);
});

test('authenticated user can apply category-specific templates', function () {
    $user = User::factory()->create();
    $startDate = now()->format('Y-m-d');

    $response = $this->actingAs($user)->postJson('/study-suggestions/templates/apply', [
        'template_id' => 'clerical_mastery',
        'start_date' => $startDate,
        'preferred_time' => '19:00',
    ]);

    $response->assertStatus(201);
    $response->assertJson(['count' => 7]);
    $this->assertDatabaseCount('study_schedules', 7);
});
