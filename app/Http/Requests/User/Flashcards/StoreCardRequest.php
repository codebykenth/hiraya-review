<?php

namespace App\Http\Requests\User\Flashcards;

use Illuminate\Foundation\Http\FormRequest;

class StoreCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        $deck = $this->route('deck');

        return auth()->check() && $deck && ! $deck->is_system && $deck->user_id === auth()->id();
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
