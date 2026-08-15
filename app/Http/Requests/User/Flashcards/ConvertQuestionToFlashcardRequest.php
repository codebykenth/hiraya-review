<?php

namespace App\Http\Requests\User\Flashcards;

use App\Models\FlashcardDeck;
use Illuminate\Foundation\Http\FormRequest;

class ConvertQuestionToFlashcardRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! auth()->check()) {
            return false;
        }

        if ($this->filled('deck_id')) {
            $deck = FlashcardDeck::find($this->input('deck_id'));
            if (! $deck || $deck->is_system || $deck->user_id !== auth()->id()) {
                return false;
            }
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            'deck_id' => ['nullable', 'integer', 'exists:flashcard_decks,id'],
            'new_deck_title' => ['nullable', 'string', 'max:255'],
            'front_content' => ['nullable', 'string'],
            'back_content' => ['nullable', 'string'],
            'explanation' => ['nullable', 'string'],
        ];
    }
}
