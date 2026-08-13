<?php

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isDemographic = Category::where('name', $this->input('category'))->value('is_demographic')
            || ($this->input('category') === 'Demographic Profile');

        return [
            'category' => ['required', 'string'],
            'subcategory' => $isDemographic ? ['nullable', 'string'] : ['required', 'string'],
            'language' => ['required', 'string'],
            'stem' => ['required', 'string'],
            'options' => $isDemographic ? ['required', 'array', 'min:2'] : ['required', 'array', 'min:4', 'max:5'],
            'correct_option' => $isDemographic ? ['nullable', 'integer'] : ['required', 'integer'],
            'explanation' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:active,draft'],
        ];
    }
}
