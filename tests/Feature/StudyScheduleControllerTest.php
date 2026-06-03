<?php

use App\Models\StudySchedule;
use App\Models\User;

test('authenticated user can view study schedules for a month', function () {
    $user = User::factory()->create();
    $date = now()->format('Y-m-d');

    StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $date,
        'title' => 'Math Chapter 5',
        'description' => 'Solve practice problems',
    ]);

    $response = $this->actingAs($user)->get('/study-schedules/data?year='.now()->year.'&month='.now()->month);

    $response->assertStatus(200);
    $response->assertJsonStructure(['schedules']);
});

test('user can create a study schedule', function () {
    $user = User::factory()->create();
    $date = now()->format('Y-m-d');

    $response = $this->actingAs($user)->post('/study-schedules', [
        'study_date' => $date,
        'title' => 'Physics Study',
        'description' => 'Chapter 3: Thermodynamics',
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure(['id', 'user_id', 'study_date', 'title', 'description']);

    $this->assertDatabaseHas('study_schedules', [
        'user_id' => $user->id,
        'title' => 'Physics Study',
    ]);
});

test('user can only see their own study schedules', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $date = now()->format('Y-m-d');

    StudySchedule::create([
        'user_id' => $user1->id,
        'study_date' => $date,
        'title' => 'Chemistry',
    ]);

    $response = $this->actingAs($user2)->get('/study-schedules/data?year='.now()->year.'&month='.now()->month);

    $response->assertStatus(200);
    $schedules = $response->json('schedules');
    $this->assertEmpty($schedules);
});

test('user can delete their own study schedule', function () {
    $user = User::factory()->create();
    $date = now()->format('Y-m-d');

    $schedule = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $date,
        'title' => 'Biology Study',
    ]);

    $response = $this->actingAs($user)->delete("/study-schedules/{$schedule->id}");

    $response->assertStatus(204);
    $this->assertDatabaseMissing('study_schedules', ['id' => $schedule->id]);
});

test('user cannot delete another users study schedule', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $date = now()->format('Y-m-d');

    $schedule = StudySchedule::create([
        'user_id' => $user1->id,
        'study_date' => $date,
        'title' => 'English Study',
    ]);

    $response = $this->actingAs($user2)->delete("/study-schedules/{$schedule->id}");

    $response->assertStatus(403);
    $this->assertDatabaseHas('study_schedules', ['id' => $schedule->id]);
});

test('study schedule requires title', function () {
    $user = User::factory()->create();
    $date = now()->format('Y-m-d');

    $response = $this->actingAs($user)->postJson('/study-schedules', [
        'study_date' => $date,
        'title' => '',
    ]);

    $response->assertStatus(422);
});

test('study schedule requires valid date', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/study-schedules', [
        'study_date' => 'invalid-date',
        'title' => 'Math',
    ]);

    $response->assertStatus(422);
});

test('unauthenticated user cannot view calendar page', function () {
    $response = $this->get('/study-schedules');

    $response->assertRedirect('/login');
});

test('unauthenticated user cannot create study schedule', function () {
    $date = now()->format('Y-m-d');

    $response = $this->post('/study-schedules', [
        'study_date' => $date,
        'title' => 'Math Study',
    ]);

    $response->assertRedirect('/login');
});

test('creating duplicate study schedule returns existing schedule and does not duplicate', function () {
    $user = User::factory()->create();
    $date = now()->format('Y-m-d');

    $s1 = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $date,
        'title' => 'Duplicate Study',
        'description' => 'First one',
    ]);

    $response = $this->actingAs($user)->post('/study-schedules', [
        'study_date' => $date,
        'title' => 'Duplicate Study',
        'description' => 'Second one',
    ]);

    $response->assertStatus(200);
    $response->assertJsonPath('id', $s1->id);

    $this->assertEquals(1, StudySchedule::where('user_id', $user->id)->count());
});

test('user can update study schedule is_done status', function () {
    $user = User::factory()->create();
    $date = now()->format('Y-m-d');

    $schedule = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $date,
        'title' => 'Biology Study',
        'is_done' => false,
    ]);

    $response = $this->actingAs($user)->putJson("/study-schedules/{$schedule->id}", [
        'study_date' => $date,
        'title' => 'Biology Study',
        'is_done' => true,
    ]);

    $response->assertStatus(200);
    $this->assertTrue((bool) $response->json('is_done'));
    $this->assertDatabaseHas('study_schedules', [
        'id' => $schedule->id,
        'is_done' => true,
    ]);
});

test('index returns past uncompleted study schedules', function () {
    $user = User::factory()->create();
    $yesterday = now()->subDay()->format('Y-m-d');

    $schedule = StudySchedule::create([
        'user_id' => $user->id,
        'study_date' => $yesterday,
        'title' => 'Yesterday Uncompleted Task',
        'is_done' => false,
    ]);

    $response = $this->actingAs($user)->get('/study-schedules/data?year='.now()->year.'&month='.now()->month);

    $response->assertStatus(200);
    $response->assertJsonStructure(['pastPending']);
    $response->assertJsonCount(1, 'pastPending');
    $this->assertEquals('Yesterday Uncompleted Task', $response->json('pastPending.0.title'));
});
