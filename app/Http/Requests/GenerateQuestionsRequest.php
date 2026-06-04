<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateQuestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => ['required', 'string'],
            'subcategory' => ['required', 'string'],
            'count' => ['required', 'integer', 'min:1', 'max:20'],
            'language' => ['required', 'string'],
            'prompt' => ['nullable', 'string'],
            'primary_model' => ['nullable', 'string'],
            'symbolic_variety' => ['nullable', 'string'],
            'data_variety' => ['nullable', 'string'],
        ];
    }
}
