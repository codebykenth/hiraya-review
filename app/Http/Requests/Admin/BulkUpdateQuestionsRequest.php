<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateQuestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        return [
            'questions' => ['required', 'array'],
            'questions.*.id' => ['required', 'integer', 'exists:questions,id'],
            'questions.*.category' => ['required', 'string'],
            'questions.*.subcategory' => ['required', 'string'],
            'questions.*.language' => ['required', 'string'],
            'questions.*.stem' => ['required', 'string'],
            'questions.*.options' => ['required', 'array', 'min:2'],
            'questions.*.correct_option' => ['required', 'integer'],
            'questions.*.explanation' => ['nullable', 'string'],
            'questions.*.status' => ['required', 'string'],
        ];
    }
}
