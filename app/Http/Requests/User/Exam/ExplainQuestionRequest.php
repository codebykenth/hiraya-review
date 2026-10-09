<?php

declare(strict_types=1);

namespace App\Http\Requests\User\Exam;

use Illuminate\Foundation\Http\FormRequest;

class ExplainQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'selected_option' => ['required', 'integer', 'min:0', 'max:5'],
        ];
    }

    public function selectedOption(): int
    {
        return (int) $this->validated('selected_option');
    }
}
