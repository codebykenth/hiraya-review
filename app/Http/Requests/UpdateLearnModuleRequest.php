<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLearnModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'subcategory_id' => ['nullable', 'exists:subcategories,id'],
            'title' => ['required', 'string', 'max:255'],
            'topic' => ['required', 'string', 'max:255'],
            'summary' => ['required', 'string'],
            'content' => ['required', 'string'],
            'estimated_minutes' => ['required', 'integer', 'min:1', 'max:120'],
            'is_published' => ['required', 'boolean'],
        ];
    }
}
