<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShiftStudyScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mode' => ['required', 'string', 'in:start_today,shift_by_days'],
            'days' => ['nullable', 'integer', 'min:1', 'max:90'],
            'from_date' => ['nullable', 'date'],
        ];
    }
}
