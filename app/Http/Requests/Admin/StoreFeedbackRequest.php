<?php

namespace App\Http\Requests\Admin;

use App\Models\Feedback;
use Illuminate\Foundation\Http\FormRequest;

class StoreFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'flaggable_id' => ['required', 'integer'],
            'flaggable_type' => ['required', 'string'],
            'reason' => [
                'required',
                'string',
                'max:255',
                function ($attribute, $value, $fail) {
                    $exists = Feedback::where('user_id', $this->user()?->id)
                        ->where('flaggable_type', $this->input('flaggable_type'))
                        ->where('flaggable_id', $this->input('flaggable_id'))
                        ->where('status', 'pending')
                        ->exists();

                    if ($exists) {
                        $fail('You currently have an active pending report under review for this item.');
                    }
                },
            ],
            'details' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
