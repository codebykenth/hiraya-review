<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamDateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date', 'unique:exam_dates,date'],
            'description' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
