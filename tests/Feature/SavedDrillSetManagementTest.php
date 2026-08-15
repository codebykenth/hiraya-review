<?php

use App\Models\Question;
use App\Models\SavedDrillSet;
use App\Models\User;

test('authenticated user can list, create, update, delete, and bookmark questions in saved drill sets', function () {
    $user = User::factory()->create();
    $question = Question::factory()->create();

    // 1. Create a saved drill set
    $response = $this->actingAs($user)->postJson(route('drills.saved-sets.store'), [
        'name' => 'Math Word Problems',
        'description' => 'Target fraction and percentage word problems.',
        'color' => 'blue',
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('saved_drill_sets', [
        'user_id' => $user->id,
        'name' => 'Math Word Problems',
    ]);

    $set = SavedDrillSet::where('user_id', $user->id)->first();

    // 2. Add question to set
    $addResponse = $this->actingAs($user)->postJson(route('drills.saved-sets.addQuestion'), [
        'question_id' => $question->id,
        'saved_drill_set_id' => $set->id,
    ]);

    $addResponse->assertOk();
    $this->assertDatabaseHas('saved_drill_items', [
        'saved_drill_set_id' => $set->id,
        'question_id' => $question->id,
    ]);

    // 3. Get set questions
    $getQuestionsResponse = $this->actingAs($user)->getJson(route('drills.saved-sets.getSetQuestions', $set));
    $getQuestionsResponse->assertOk()
        ->assertJsonPath('set.name', 'Math Word Problems')
        ->assertJsonCount(1, 'questions');

    // 4. Update set details
    $updateResponse = $this->actingAs($user)->putJson(route('drills.saved-sets.update', $set), [
        'name' => 'Updated Math Word Problems',
        'description' => 'Updated description',
        'color' => 'emerald',
    ]);

    $updateResponse->assertOk();
    $this->assertDatabaseHas('saved_drill_sets', [
        'id' => $set->id,
        'name' => 'Updated Math Word Problems',
        'color' => 'emerald',
    ]);

    // 5. Remove question
    $removeResponse = $this->actingAs($user)->deleteJson(route('drills.saved-sets.removeQuestion', [$set, $question]));
    $removeResponse->assertOk();
    $this->assertDatabaseMissing('saved_drill_items', [
        'saved_drill_set_id' => $set->id,
        'question_id' => $question->id,
    ]);

    // 6. Delete set
    $deleteResponse = $this->actingAs($user)->deleteJson(route('drills.saved-sets.destroy', $set));
    $deleteResponse->assertOk();
    $this->assertDatabaseMissing('saved_drill_sets', [
        'id' => $set->id,
    ]);
});

test('user can directly create a saved drill set with attached question ids', function () {
    $user = User::factory()->create();
    $questions = Question::factory()->count(3)->create();

    $response = $this->actingAs($user)->postJson(route('drills.saved-sets.store'), [
        'name' => 'Batch Created Set',
        'description' => 'Directly created from custom drill selection',
        'color' => 'indigo',
        'question_ids' => $questions->pluck('id')->all(),
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('saved_drill_sets', [
        'user_id' => $user->id,
        'name' => 'Batch Created Set',
    ]);

    $set = SavedDrillSet::where('user_id', $user->id)->first();
    expect($set->questions()->count())->toBe(3);
});
