<?php

use App\Models\Flashcard;
use App\Models\FlashcardDeck;
use App\Models\Question;
use App\Models\User;
use App\Models\UserFlashcardProgress;

test('authenticated user can view flashcards page with decks', function () {
    $user = User::factory()->create();
    $systemDeck = FlashcardDeck::factory()->system()->create(['title' => 'System Deck']);
    $userDeck = FlashcardDeck::factory()->create(['user_id' => $user->id, 'title' => 'User Deck']);

    $response = $this->actingAs($user)->get(route('flashcards.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('user/flashcards/index')
        ->has('decks', 2)
    );
});

test('authenticated user can create a personal deck', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('flashcards.storeDeck'), [
        'title' => 'My Biology Deck',
        'category' => 'General Science',
        'description' => 'Notes on cell biology',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('flashcard_decks', [
        'user_id' => $user->id,
        'title' => 'My Biology Deck',
        'is_system' => false,
    ]);
});

test('authenticated user can update their personal deck', function () {
    $user = User::factory()->create();
    $deck = FlashcardDeck::factory()->create(['user_id' => $user->id, 'title' => 'Old Title']);

    $response = $this->actingAs($user)->put(route('flashcards.updateDeck', $deck), [
        'title' => 'Updated Title',
        'category' => 'Updated Category',
        'description' => 'Updated Description',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('flashcard_decks', [
        'id' => $deck->id,
        'title' => 'Updated Title',
    ]);
});

test('user cannot update another users deck or a system deck', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $deck = FlashcardDeck::factory()->create(['user_id' => $otherUser->id]);
    $systemDeck = FlashcardDeck::factory()->system()->create();

    $this->actingAs($user)->put(route('flashcards.updateDeck', $deck), ['title' => 'Hacked'])->assertForbidden();
    $this->actingAs($user)->put(route('flashcards.updateDeck', $systemDeck), ['title' => 'Hacked'])->assertForbidden();
});

test('authenticated user can clone a system deck into a personal deck with all cards', function () {
    $user = User::factory()->create();
    $systemDeck = FlashcardDeck::factory()->system()->create(['title' => 'Vocabulary 101']);
    Flashcard::factory()->count(3)->create(['deck_id' => $systemDeck->id]);

    $response = $this->actingAs($user)->post(route('flashcards.cloneDeck', $systemDeck));

    $response->assertRedirect();
    $this->assertDatabaseHas('flashcard_decks', [
        'user_id' => $user->id,
        'title' => 'Vocabulary 101 (Copy)',
        'is_system' => false,
    ]);

    $clonedDeck = FlashcardDeck::where('user_id', $user->id)->where('title', 'Vocabulary 101 (Copy)')->first();
    expect($clonedDeck->flashcards()->count())->toBe(3);
});

test('authenticated user can reset progress on a deck', function () {
    $user = User::factory()->create();
    $deck = FlashcardDeck::factory()->create(['user_id' => $user->id]);
    $card = Flashcard::factory()->create(['deck_id' => $deck->id]);

    UserFlashcardProgress::create([
        'user_id' => $user->id,
        'flashcard_id' => $card->id,
        'ease_factor' => 2.5,
        'interval_days' => 5,
        'repetitions' => 2,
        'next_review_at' => now()->addDays(5),
    ]);

    $this->assertDatabaseHas('user_flashcard_progress', [
        'user_id' => $user->id,
        'flashcard_id' => $card->id,
    ]);

    $response = $this->actingAs($user)->post(route('flashcards.resetProgress', $deck));

    $response->assertRedirect();
    $this->assertDatabaseMissing('user_flashcard_progress', [
        'user_id' => $user->id,
        'flashcard_id' => $card->id,
    ]);
});

test('user can add, update, and delete cards in their personal deck', function () {
    $user = User::factory()->create();
    $deck = FlashcardDeck::factory()->create(['user_id' => $user->id]);

    // Store card
    $storeResponse = $this->actingAs($user)->postJson(route('flashcards.storeCard', $deck), [
        'front_content' => 'What is Photosynthesis?',
        'back_content' => 'Process used by plants to synthesize food',
        'explanation' => 'Requires sunlight, water, and CO2',
    ]);
    $storeResponse->assertOk();
    $cardId = $storeResponse->json('card.id');

    // Update card
    $updateResponse = $this->actingAs($user)->putJson(route('flashcards.updateCard', $cardId), [
        'front_content' => 'What is Photosynthesis? (Updated)',
        'back_content' => 'Process used by plants to synthesize nutrients',
        'explanation' => 'Requires sunlight, water, and CO2',
    ]);
    $updateResponse->assertOk();
    $this->assertDatabaseHas('flashcards', [
        'id' => $cardId,
        'front_content' => 'What is Photosynthesis? (Updated)',
    ]);

    // Delete card
    $deleteResponse = $this->actingAs($user)->deleteJson(route('flashcards.destroyCard', $cardId));
    $deleteResponse->assertOk();
    $this->assertDatabaseMissing('flashcards', ['id' => $cardId]);
});

test('user cannot add, edit, or delete cards on system decks', function () {
    $user = User::factory()->create();
    $systemDeck = FlashcardDeck::factory()->system()->create();
    $systemCard = Flashcard::factory()->create(['deck_id' => $systemDeck->id]);

    $this->actingAs($user)->postJson(route('flashcards.storeCard', $systemDeck), [
        'front_content' => 'Test',
        'back_content' => 'Test',
    ])->assertForbidden();

    $this->actingAs($user)->putJson(route('flashcards.updateCard', $systemCard), [
        'front_content' => 'Test',
        'back_content' => 'Test',
    ])->assertForbidden();

    $this->actingAs($user)->deleteJson(route('flashcards.destroyCard', $systemCard))->assertForbidden();
});

test('user can convert question to flashcard with specific deck or new deck', function () {
    $user = User::factory()->create();
    $question = Question::factory()->create([
        'stem' => 'What is the capital of the Philippines?',
        'options' => ['Cebu', 'Manila', 'Davao'],
        'correct_option' => 1,
        'explanation' => 'Manila is the capital city.',
    ]);
    $deck = FlashcardDeck::factory()->create(['user_id' => $user->id, 'title' => 'Geography']);

    // Save to existing deck
    $response1 = $this->actingAs($user)->postJson(route('flashcards.convertFromQuestion'), [
        'question_id' => $question->id,
        'deck_id' => $deck->id,
    ]);
    $response1->assertOk();
    $this->assertDatabaseHas('flashcards', [
        'deck_id' => $deck->id,
        'front_content' => 'What is the capital of the Philippines?',
        'back_content' => 'Correct Answer: Manila',
    ]);

    // Save to new deck on the fly
    $response2 = $this->actingAs($user)->postJson(route('flashcards.convertFromQuestion'), [
        'question_id' => $question->id,
        'new_deck_title' => 'Quick Exam Notes',
    ]);
    $response2->assertOk();
    $newDeck = FlashcardDeck::where('user_id', $user->id)->where('title', 'Quick Exam Notes')->first();
    expect($newDeck)->not->toBeNull();
    $this->assertDatabaseHas('flashcards', [
        'deck_id' => $newDeck->id,
        'front_content' => 'What is the capital of the Philippines?',
    ]);
});

test('listUserDecks returns accessible decks', function () {
    $user = User::factory()->create();
    FlashcardDeck::factory()->system()->create(['title' => 'System Deck 1']);
    FlashcardDeck::factory()->create(['user_id' => $user->id, 'title' => 'My Deck 1']);

    $response = $this->actingAs($user)->getJson(route('flashcards.list'));

    $response->assertOk();
    expect(count($response->json('decks')))->toBe(2);
});

test('showDeck filters due cards when mode is due', function () {
    $user = User::factory()->create();
    $deck = FlashcardDeck::factory()->create(['user_id' => $user->id]);
    $dueCard = Flashcard::factory()->create(['deck_id' => $deck->id, 'front_content' => 'Due Card']);
    $futureCard = Flashcard::factory()->create(['deck_id' => $deck->id, 'front_content' => 'Future Card']);

    // Progress for futureCard scheduled 7 days ahead
    UserFlashcardProgress::create([
        'user_id' => $user->id,
        'flashcard_id' => $futureCard->id,
        'ease_factor' => 2.5,
        'interval_days' => 7,
        'repetitions' => 1,
        'next_review_at' => now()->addDays(7),
    ]);

    // Mode = due should only return dueCard (which has no progress yet)
    $dueResponse = $this->actingAs($user)->getJson(route('flashcards.showDeck', $deck).'?mode=due');
    $dueResponse->assertOk();
    expect($dueResponse->json('cards'))->toHaveCount(1)
        ->and($dueResponse->json('cards.0.id'))->toBe($dueCard->id)
        ->and($dueResponse->json('due_cards_count'))->toBe(1)
        ->and($dueResponse->json('total_cards_count'))->toBe(2);

    // Mode = all should return all 2 cards
    $allResponse = $this->actingAs($user)->getJson(route('flashcards.showDeck', $deck).'?mode=all');
    $allResponse->assertOk();
    expect($allResponse->json('cards'))->toHaveCount(2);
});

test('user can submit SM-2 rating for a flashcard', function () {
    $user = User::factory()->create();
    $deck = FlashcardDeck::factory()->create(['user_id' => $user->id]);
    $card = Flashcard::factory()->create(['deck_id' => $deck->id]);

    $response = $this->actingAs($user)->postJson(route('flashcards.submitRating', $card), [
        'rating' => 4, // Easy
    ]);

    $response->assertOk();
    $this->assertDatabaseHas('user_flashcard_progress', [
        'user_id' => $user->id,
        'flashcard_id' => $card->id,
        'repetitions' => 1,
        'interval_days' => 1,
    ]);
});
