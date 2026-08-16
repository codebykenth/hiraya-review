<?php

use App\Models\StudySchedule;
use App\Models\User;
use Carbon\Carbon;

test('authenticated user can shift overdue schedule to start today', function () {
    $user = User::factory()->create();
    $threeDaysAgo = Carbon::today()->subDays(3)->toDateString();
    $twoDaysAgo = Carbon::today()->subDays(2)->toDateString();

    $s1 = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $threeDaysAgo,
        'title' => 'Task 1',
        'is_done' => false,
    ]);

    $s2 = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $twoDaysAgo,
        'title' => 'Task 2',
        'is_done' => false,
    ]);

    $response = $this->actingAs($user)->postJson('/study-schedules/shift', [
        'mode' => 'start_today',
    ]);

    $response->assertOk();
    $response->assertJson(['count' => 2]);

    expect($s1->fresh()->study_date->toDateString())->toBe(Carbon::today()->toDateString())
        ->and($s2->fresh()->study_date->toDateString())->toBe(Carbon::today()->addDay()->toDateString());
});

test('authenticated user can shift schedule by N days', function () {
    $user = User::factory()->create();
    $today = Carbon::today()->toDateString();

    $s1 = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $today,
        'title' => 'Future Task',
        'is_done' => false,
    ]);

    $response = $this->actingAs($user)->postJson('/study-schedules/shift', [
        'mode' => 'shift_by_days',
        'days' => 5,
    ]);

    $response->assertOk();
    $response->assertJson(['count' => 1]);

    expect($s1->fresh()->study_date->toDateString())->toBe(Carbon::today()->addDays(5)->toDateString());
});

test('shift only affects the authenticated user', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $otherSchedule = StudySchedule::create([
        'user_id' => $user2->id,
        'study_date' => Carbon::today()->subDays(5)->toDateString(),
        'title' => 'Other User Task',
        'is_done' => false,
    ]);

    $response = $this->actingAs($user1)->postJson('/study-schedules/shift', [
        'mode' => 'start_today',
    ]);

    $response->assertOk();
    $response->assertJson(['count' => 0]);

    // Ensure user 2's schedule was untouched
    expect($otherSchedule->fresh()->study_date->toDateString())->toBe(Carbon::today()->subDays(5)->toDateString());
});
