<?php

namespace App\Http\Requests\User\Flashcards;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        $card = $this->route('card');

        return auth()->check() && $card && $card->deck && ! $card->deck->is_system && $card->deck->user_id === auth()->id();
    }

    public function rules(): array
    {
        return [
            'front_content' => ['required', 'string'],
            'back_content' => ['required', 'string'],
            'explanation' => ['nullable', 'string'],
        ];
    }
}
