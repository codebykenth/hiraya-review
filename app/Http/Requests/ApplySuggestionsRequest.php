<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplySuggestionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'suggestions' => ['required', 'array'],
            'suggestions.*.study_date' => ['required', 'date'],
            'suggestions.*.study_time' => ['nullable', 'string'],
            'suggestions.*.title' => ['required', 'string', 'max:255'],
            'suggestions.*.description' => ['nullable', 'string'],
            'suggestions.*.module_links' => ['nullable', 'array'],
            'suggestions.*.module_links.*.title' => ['required_with:suggestions.*.module_links', 'string'],
            'suggestions.*.module_links.*.url' => ['required_with:suggestions.*.module_links', 'string'],
        ];
    }
}
