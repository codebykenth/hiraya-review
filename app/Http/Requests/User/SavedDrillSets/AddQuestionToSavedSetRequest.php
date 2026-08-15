<?php

namespace App\Http\Requests\User\SavedDrillSets;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AddQuestionToSavedSetRequest extends FormRequest
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
            'question_id' => ['required', 'integer', 'exists:questions,id'],
            'saved_drill_set_id' => ['nullable', 'integer', 'exists:saved_drill_sets,id'],
            'new_set_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
