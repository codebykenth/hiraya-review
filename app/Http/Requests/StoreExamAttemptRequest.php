<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'integer'],
            'question_ids' => ['required', 'array'],
            'answers' => ['required', 'array'],
            'cat_scores' => ['required', 'array'],
        ];
    }
}
