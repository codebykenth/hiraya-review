<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkDeleteStudyScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids' => ['nullable', 'array'],
            'ids.*' => ['integer'],
            'scope' => ['nullable', 'string', 'in:overdue,completed,date,all'],
            'date' => ['nullable', 'date'],
        ];
    }
}
