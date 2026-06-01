<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExamDateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $examDateId = $this->route('examDate')?->id;

        return [
            'date' => ['required', 'date', 'unique:exam_dates,date,'.$examDateId],
            'description' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
