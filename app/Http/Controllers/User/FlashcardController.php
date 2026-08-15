<?php

namespace App\Http\Controllers\User;

use App\Http\Requests\User\Flashcards\ConvertQuestionToFlashcardRequest;
use App\Http\Requests\User\Flashcards\StoreCardRequest;
use App\Http\Requests\User\Flashcards\StoreDeckRequest;
use App\Http\Requests\User\Flashcards\UpdateCardRequest;
use App\Http\Requests\User\Flashcards\UpdateDeckRequest;
use App\Models\Flashcard;
use App\Models\FlashcardDeck;
use App\Models\Question;
use App\Models\UserFlashcardProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FlashcardController
{
    /**
     * Display user flashcard decks and review queues.
     */
    public function index(Request $request): Response
    {
        $userId = auth()->id();

        // Fetch system decks + user personal decks
        $decks = FlashcardDeck::where('is_system', true)
            ->orWhere('user_id', $userId)
            ->withCount('flashcards')
            ->orderBy('is_system', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($deck) use ($userId) {
                $cardsCount = $deck->flashcards_count;
                $cardIds = $deck->flashcards()->pluck('id');

                // Due cards calculation (next_review_at <= now OR no progress recorded)
                $dueCount = UserFlashcardProgress::where('user_id', $userId)
                    ->whereIn('flashcard_id', $cardIds)
                    ->where('next_review_at', '<=', now())
                    ->count();

                $reviewedCount = UserFlashcardProgress::where('user_id', $userId)
                    ->whereIn('flashcard_id', $cardIds)
                    ->count();

                $unreviewedCount = max(0, $cardsCount - $reviewedCount);

                return [
                    'id' => $deck->id,
                    'title' => $deck->title,
                    'category' => $deck->category,
                    'description' => $deck->description,
                    'is_system' => $deck->is_system,
                    'total_cards' => $cardsCount,
                    'due_cards' => $dueCount + $unreviewedCount,
                    'is_owner' => ! $deck->is_system && $deck->user_id === $userId,
                ];
            });

        return Inertia::render('user/flashcards/index', [
            'decks' => $decks,
        ]);
    }

    /**
     * List user's decks for quick-picker dropdowns (e.g. from exam review).
     */
    public function listUserDecks(Request $request): JsonResponse
    {
        $userId = auth()->id();

        $decks = FlashcardDeck::where('user_id', $userId)
            ->orWhere('is_system', true)
            ->select(['id', 'title', 'category', 'is_system', 'user_id'])
            ->orderBy('is_system', 'desc')
            ->orderBy('title', 'asc')
            ->get()
            ->map(fn ($deck) => [
                'id' => $deck->id,
                'title' => $deck->title,
                'category' => $deck->category,
                'is_system' => (bool) $deck->is_system,
                'is_owner' => ! $deck->is_system && $deck->user_id === $userId,
            ]);

        return response()->json(['decks' => $decks]);
    }

    /**
     * Get flashcards for a specific deck session or card manager.
     */
    public function showDeck(Request $request, FlashcardDeck $deck): JsonResponse
    {
        $userId = auth()->id();

        // Security check for personal decks
        if (! $deck->is_system && $deck->user_id !== $userId) {
            abort(403);
        }

        $mode = $request->query('mode', 'all'); // 'due' or 'all'

        $allFlashcards = $deck->flashcards()->orderBy('id', 'asc')->get();
        $cardIds = $allFlashcards->pluck('id');

        $progressMap = UserFlashcardProgress::where('user_id', $userId)
            ->whereIn('flashcard_id', $cardIds)
            ->get()
            ->keyBy('flashcard_id');

        $now = now();
        $dueCards = [];
        $allCards = [];
        $nextUpcomingDueDate = null;

        foreach ($allFlashcards as $card) {
            $progress = $progressMap->get($card->id);
            $isDue = ! $progress || ($progress->next_review_at && $progress->next_review_at <= $now);

            $cardData = [
                'id' => $card->id,
                'front_content' => $card->front_content,
                'back_content' => $card->back_content,
                'explanation' => $card->explanation,
                'ease_factor' => $progress?->ease_factor ?? 2.5,
                'interval_days' => $progress?->interval_days ?? 0,
                'repetitions' => $progress?->repetitions ?? 0,
                'next_review_at' => $progress?->next_review_at?->toIso8601String(),
                'is_due' => $isDue,
            ];

            $allCards[] = $cardData;
            if ($isDue) {
                $dueCards[] = $cardData;
            } elseif ($progress?->next_review_at) {
                if ($nextUpcomingDueDate === null || $progress->next_review_at < $nextUpcomingDueDate) {
                    $nextUpcomingDueDate = $progress->next_review_at;
                }
            }
        }

        $cardsToReturn = ($mode === 'due') ? $dueCards : $allCards;

        return response()->json([
            'deck' => [
                'id' => $deck->id,
                'title' => $deck->title,
                'category' => $deck->category,
                'description' => $deck->description,
                'is_system' => $deck->is_system,
                'is_owner' => ! $deck->is_system && $deck->user_id === $userId,
                'total_cards' => count($allCards),
                'due_cards' => count($dueCards),
                'next_due_date' => $nextUpcomingDueDate?->toIso8601String(),
            ],
            'mode' => $mode,
            'total_cards_count' => count($allCards),
            'due_cards_count' => count($dueCards),
            'next_due_date' => $nextUpcomingDueDate?->toIso8601String(),
            'cards' => $cardsToReturn,
        ]);
    }

    /**
     * Submit SM-2 Spaced Repetition rating for a card.
     */
    public function submitRating(Request $request, Flashcard $card): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:4', // 1=Again, 2=Hard, 3=Good, 4=Easy
        ]);

        $userId = auth()->id();
        $rating = (int) $request->input('rating');

        $progress = UserFlashcardProgress::firstOrCreate(
            ['user_id' => $userId, 'flashcard_id' => $card->id],
            ['ease_factor' => 2.5, 'interval_days' => 0, 'repetitions' => 0, 'next_review_at' => now()]
        );

        $ease = $progress->ease_factor;
        $reps = $progress->repetitions;
        $interval = $progress->interval_days;

        if ($rating < 3) {
            // Failed recall (Again / Hard)
            $reps = 0;
            $interval = 1;
        } else {
            // Successful recall (Good / Easy)
            if ($reps === 0) {
                $interval = 1;
            } elseif ($reps === 1) {
                $interval = 6;
            } else {
                $interval = (int) round($interval * $ease);
            }
            $reps++;
        }

        // Adjust Ease Factor (SM-2 Formula)
        $ease = $ease + (0.1 - (5 - $rating) * (0.08 + (5 - $rating) * 0.02));
        if ($ease < 1.3) {
            $ease = 1.3;
        }

        $nextReview = now()->addDays($interval);

        $progress->update([
            'ease_factor' => round($ease, 2),
            'interval_days' => $interval,
            'repetitions' => $reps,
            'next_review_at' => $nextReview,
        ]);

        return response()->json([
            'status' => 'success',
            'progress' => $progress,
        ]);
    }

    /**
     * Store a new personal flashcard deck.
     */
    public function storeDeck(StoreDeckRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        FlashcardDeck::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'category' => $validated['category'] ?? 'General Information',
            'description' => $validated['description'] ?? '',
            'is_system' => false,
        ]);

        return redirect()->back()->with('success', 'Deck created successfully.');
    }

    /**
     * Update an existing personal flashcard deck.
     */
    public function updateDeck(UpdateDeckRequest $request, FlashcardDeck $deck): RedirectResponse
    {
        $validated = $request->validated();

        $deck->update([
            'title' => $validated['title'],
            'category' => $validated['category'] ?? $deck->category,
            'description' => $validated['description'] ?? $deck->description,
        ]);

        return redirect()->back()->with('success', 'Deck updated successfully.');
    }

    /**
     * Store a custom card in a personal deck.
     */
    public function storeCard(StoreCardRequest $request, FlashcardDeck $deck): JsonResponse
    {
        $validated = $request->validated();

        $card = Flashcard::create([
            'deck_id' => $deck->id,
            'front_content' => $validated['front_content'],
            'back_content' => $validated['back_content'],
            'explanation' => $validated['explanation'] ?? '',
        ]);

        return response()->json(['status' => 'success', 'card' => $card]);
    }

    /**
     * Update a flashcard in a personal deck.
     */
    public function updateCard(UpdateCardRequest $request, Flashcard $card): JsonResponse
    {
        $validated = $request->validated();

        $card->update([
            'front_content' => $validated['front_content'],
            'back_content' => $validated['back_content'],
            'explanation' => $validated['explanation'] ?? '',
        ]);

        return response()->json(['status' => 'success', 'card' => $card]);
    }

    /**
     * Delete a flashcard from a personal deck.
     */
    public function destroyCard(Flashcard $card): JsonResponse
    {
        if ($card->deck->is_system || $card->deck->user_id !== auth()->id()) {
            abort(403, 'Cannot delete cards from system decks or decks you do not own.');
        }

        DB::transaction(function () use ($card) {
            $card->userProgress()->delete();
            $card->delete();
        });

        return response()->json(['status' => 'success', 'message' => 'Card deleted successfully.']);
    }

    /**
     * Clone a deck (system or existing personal) into a new personal deck for the user.
     */
    public function cloneDeck(FlashcardDeck $deck): RedirectResponse
    {
        $userId = auth()->id();

        // Must be system deck or owned by user
        if (! $deck->is_system && $deck->user_id !== $userId) {
            abort(403);
        }

        DB::transaction(function () use ($deck, $userId) {
            $newDeck = FlashcardDeck::create([
                'user_id' => $userId,
                'title' => "{$deck->title} (Copy)",
                'category' => $deck->category,
                'description' => $deck->description,
                'is_system' => false,
            ]);

            $cards = $deck->flashcards()->get();
            foreach ($cards as $card) {
                Flashcard::create([
                    'deck_id' => $newDeck->id,
                    'front_content' => $card->front_content,
                    'back_content' => $card->back_content,
                    'explanation' => $card->explanation,
                ]);
            }
        });

        return redirect()->back()->with('success', 'Deck duplicated successfully.');
    }

    /**
     * Reset SM-2 spaced repetition progress for a deck for the authenticated user.
     */
    public function resetProgress(FlashcardDeck $deck): RedirectResponse
    {
        $userId = auth()->id();

        if (! $deck->is_system && $deck->user_id !== $userId) {
            abort(403);
        }

        $cardIds = $deck->flashcards()->pluck('id');

        UserFlashcardProgress::where('user_id', $userId)
            ->whereIn('flashcard_id', $cardIds)
            ->delete();

        return redirect()->back()->with('success', 'Deck progress has been reset.');
    }

    /**
     * Convert an exam question into a flashcard in a specific or default deck.
     */
    public function convertFromQuestion(ConvertQuestionToFlashcardRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id();

        $question = Question::with('subcategory.category')->findOrFail($validated['question_id']);

        // Determine destination deck
        if (! empty($validated['deck_id'])) {
            $deck = FlashcardDeck::where('id', $validated['deck_id'])
                ->where('user_id', $userId)
                ->where('is_system', false)
                ->firstOrFail();
        } elseif (! empty($validated['new_deck_title'])) {
            $deck = FlashcardDeck::create([
                'user_id' => $userId,
                'title' => trim($validated['new_deck_title']),
                'category' => $question->subcategory?->category?->name ?? 'Exam Review',
                'description' => 'Custom deck created from exam questions.',
                'is_system' => false,
            ]);
        } else {
            // Default "Missed Exam Items" deck
            $deck = FlashcardDeck::firstOrCreate(
                ['user_id' => $userId, 'title' => 'Missed Exam Items'],
                ['category' => 'Exam Review', 'description' => 'Automatically converted missed questions from past exam attempts.', 'is_system' => false]
            );
        }

        $options = $question->options ?? [];
        $correctIdx = $question->correct_option;
        $correctText = $options[$correctIdx] ?? 'N/A';

        $frontContent = ! empty($validated['front_content']) ? $validated['front_content'] : $question->stem;
        $backContent = ! empty($validated['back_content']) ? $validated['back_content'] : "Correct Answer: {$correctText}";
        $explanation = ! empty($validated['explanation']) ? $validated['explanation'] : ($question->explanation ?? '');

        $card = Flashcard::create([
            'deck_id' => $deck->id,
            'front_content' => $frontContent,
            'back_content' => $backContent,
            'explanation' => $explanation,
        ]);

        return response()->json([
            'status' => 'success',
            'card' => $card,
            'deck_id' => $deck->id,
            'deck_title' => $deck->title,
        ]);
    }

    /**
     * Delete a personal flashcard deck.
     */
    public function destroyDeck(FlashcardDeck $deck): RedirectResponse
    {
        if ($deck->is_system || $deck->user_id !== auth()->id()) {
            abort(403);
        }

        DB::transaction(function () use ($deck) {
            $cardIds = $deck->flashcards()->pluck('id');
            UserFlashcardProgress::whereIn('flashcard_id', $cardIds)->delete();
            $deck->flashcards()->delete();
            $deck->delete();
        });

        return redirect()->back()->with('success', 'Deck deleted successfully.');
    }
}
