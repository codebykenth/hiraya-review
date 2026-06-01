<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLearnModuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        if ($this->has('modules') && is_array($this->input('modules'))) {
            return [
                'modules' => ['required', 'array'],
                'modules.*.id' => ['nullable', 'integer'],
                'modules.*.category' => ['required', 'string'],
                'modules.*.subcategory' => ['required', 'string'],
                'modules.*.title' => ['required', 'string'],
                'modules.*.topic' => ['required', 'string'],
                'modules.*.summary' => ['required', 'string'],
                'modules.*.content' => ['required', 'string'],
                'modules.*.estimated_minutes' => ['required', 'integer'],
            ];
        }

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
