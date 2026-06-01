<?php

use App\Models\StudySchedule;
use App\Models\User;

it('generates study suggestions based on weak exam areas', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson('/study-suggestions');

    expect($response->status())->toBe(200);
    expect($response->json())->toHaveKeys(['suggestions', 'weak_areas']);
    // days_until_exam is included when there are suggestions
});

it('applies study suggestions to calendar', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $suggestions = [
        [
            'study_date' => '2026-08-01',
            'study_time' => '09:00',
            'title' => 'Study Math Chapter 5',
            'description' => 'Focus on algebra basics',
        ],
        [
            'study_date' => '2026-08-02',
            'study_time' => '14:00',
            'title' => 'Study Science Concepts',
            'description' => 'Review physics fundamentals',
        ],
    ];

    $response = $this->postJson('/study-suggestions/apply', [
        'suggestions' => $suggestions,
    ]);

    expect($response->status())->toBe(201);
    expect($response->json('count'))->toBe(2);

    $this->assertDatabaseCount('study_schedules', 2);

    // Check that records exist (use partial matching due to datetime casting)
    expect(StudySchedule::where('user_id', $user->id)->count())->toBe(2);
    expect(StudySchedule::where('title', 'Study Math Chapter 5')->first())->not->toBeNull();
    expect(StudySchedule::where('title', 'Study Science Concepts')->first())->not->toBeNull();
});

it('validates suggestion fields on apply', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->postJson('/study-suggestions/apply', [
        'suggestions' => [
            [
                'study_date' => 'invalid-date',
                'study_time' => 'invalid-time',
                'title' => 'Test',
            ],
        ],
    ]);

    expect($response->status())->toBe(422);
});

it('requires authentication for suggestion endpoints', function () {
    $response = $this->getJson('/study-suggestions');
    expect($response->status())->toBe(401); // Unauthenticated

    $response = $this->postJson('/study-suggestions/apply', [
        'suggestions' => [],
    ]);
    expect($response->status())->toBe(401); // Unauthenticated
});
