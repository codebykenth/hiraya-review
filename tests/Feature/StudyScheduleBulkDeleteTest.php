<?php

use App\Models\StudySchedule;
use App\Models\User;

test('authenticated user can bulk delete specific study schedules by ids', function () {
    $user = User::factory()->create();

    $task1 = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => now()->toDateString(),
        'title' => 'Task 1',
    ]);

    $task2 = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => now()->toDateString(),
        'title' => 'Task 2',
    ]);

    $task3 = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => now()->toDateString(),
        'title' => 'Task 3',
    ]);

    $response = $this->actingAs($user)->postJson('/study-schedules/bulk-delete', [
        'ids' => [$task1->id, $task2->id],
    ]);

    $response->assertOk();
    $response->assertJson(['count' => 2]);

    $this->assertDatabaseMissing('study_schedules', ['id' => $task1->id]);
    $this->assertDatabaseMissing('study_schedules', ['id' => $task2->id]);
    $this->assertDatabaseHas('study_schedules', ['id' => $task3->id]);
});

test('user cannot bulk delete other users study schedules', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    $task1 = StudySchedule::create([
        'user_id' => $user1->id,
        'study_date' => now()->toDateString(),
        'title' => 'User 1 Task',
    ]);

    $response = $this->actingAs($user2)->postJson('/study-schedules/bulk-delete', [
        'ids' => [$task1->id],
    ]);

    $response->assertOk();
    $response->assertJson(['count' => 0]);

    $this->assertDatabaseHas('study_schedules', ['id' => $task1->id]);
});

test('user can bulk delete overdue tasks via scope', function () {
    $user = User::factory()->create();

    $overdueTask = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => now()->subDays(2)->toDateString(),
        'title' => 'Overdue Task',
        'is_done' => false,
    ]);

    $todayTask = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => now()->toDateString(),
        'title' => 'Today Task',
        'is_done' => false,
    ]);

    $response = $this->actingAs($user)->postJson('/study-schedules/bulk-delete', [
        'scope' => 'overdue',
    ]);

    $response->assertOk();
    $response->assertJson(['count' => 1]);

    $this->assertDatabaseMissing('study_schedules', ['id' => $overdueTask->id]);
    $this->assertDatabaseHas('study_schedules', ['id' => $todayTask->id]);
});

test('user can bulk delete completed tasks via scope', function () {
    $user = User::factory()->create();

    $doneTask = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => now()->toDateString(),
        'title' => 'Done Task',
        'is_done' => true,
    ]);

    $pendingTask = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => now()->toDateString(),
        'title' => 'Pending Task',
        'is_done' => false,
    ]);

    $response = $this->actingAs($user)->postJson('/study-schedules/bulk-delete', [
        'scope' => 'completed',
    ]);

    $response->assertOk();
    $response->assertJson(['count' => 1]);

    $this->assertDatabaseMissing('study_schedules', ['id' => $doneTask->id]);
    $this->assertDatabaseHas('study_schedules', ['id' => $pendingTask->id]);
});
