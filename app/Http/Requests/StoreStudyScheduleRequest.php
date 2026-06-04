<?php

namespace App\Http\Requests;

use App\Rules\NoEmojis;
use App\Rules\NoHtml;
use App\Rules\NoProfanity;
use App\Rules\NoUrls;
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
            'title' => ['required', 'string', 'max:255', new NoEmojis, new NoHtml, new NoUrls, new NoProfanity],
            'description' => ['nullable', 'string', new NoEmojis, new NoHtml, new NoProfanity],
            'subcategory_id' => ['nullable', 'exists:subcategories,id'],
            'is_done' => ['nullable', 'boolean'],
        ];
    }
}
