<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->has('questions') && is_array($this->input('questions'))) {
            return [
                'questions' => ['required', 'array'],
                'questions.*.id' => ['nullable', 'integer'],
                'questions.*.category' => ['required', 'string'],
                'questions.*.subcategory' => ['required', 'string'],
                'questions.*.stem' => ['required', 'string'],
                'questions.*.options' => ['required', 'array'],
                'questions.*.correct_option' => ['required', 'integer'],
                'questions.*.explanation' => ['nullable', 'string'],
            ];
        }

        $isDemographic = Category::where('name', $this->input('category'))->value('is_demographic')
            || ($this->input('category') === 'Demographic Profile');

        return [
            'stem' => ['required', 'string'],
            'category' => ['required', 'string'],
            'subcategory' => $isDemographic ? ['nullable', 'string'] : ['required', 'string'],
            'language' => ['required', 'string'],
            'options' => $isDemographic ? ['required', 'array', 'min:2'] : ['required', 'array', 'min:4', 'max:5'],
            'correct_option' => $isDemographic ? ['nullable', 'integer'] : ['required', 'integer', 'min:0', 'max:4'],
            'explanation' => ['nullable', 'string'],
            'status' => ['required', 'in:active,draft'],
        ];
    }
}
