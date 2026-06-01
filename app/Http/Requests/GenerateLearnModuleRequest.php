<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GenerateLearnModuleRequest extends FormRequest
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
            'topic' => ['required', 'string', 'max:255'],
            'prompt' => ['nullable', 'string'],
            'primary_model' => ['nullable', 'string'],
        ];
    }
}
