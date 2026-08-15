<?php

namespace App\Http\Requests\User\SavedDrillSets;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSavedDrillSetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'color' => ['nullable', 'string', 'in:blue,emerald,rose,amber,indigo,purple'],
            'question_ids' => ['nullable', 'array'],
            'question_ids.*' => ['integer', 'exists:questions,id'],
        ];
    }
}
