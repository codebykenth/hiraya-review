<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApplyTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template_id' => [
                'required',
                'string',
                'in:60_day_deep_mastery,30_day_comprehensive,14_day_crash_course,7_day_final_cram,verbal_mastery,math_mastery,analytical_mastery,gen_info_fast_track,clerical_mastery',
            ],
            'start_date' => ['required', 'date'],
            'preferred_time' => ['nullable', 'string', 'date_format:H:i'],
            'replace_existing' => ['nullable', 'boolean'],
        ];
    }
}
