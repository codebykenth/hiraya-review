<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudyScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'study_date' => ['required', 'date', 'after_or_equal:today'],
            'study_time' => ['nullable', 'date_format:H:i'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subcategory_id' => ['nullable', 'exists:subcategories,id'],
            'is_done' => ['nullable', 'boolean'],
        ];
    }
}
