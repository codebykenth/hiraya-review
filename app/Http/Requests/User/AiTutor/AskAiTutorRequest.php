<?php

declare(strict_types=1);

namespace App\Http\Requests\User\AiTutor;

use Illuminate\Foundation\Http\FormRequest;

class AskAiTutorRequest extends FormRequest
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
            'question' => ['required', 'string', 'min:3', 'max:1000'],
            'subcategory_id' => ['nullable', 'integer', 'exists:subcategories,id'],
            'history' => ['nullable', 'array', 'max:10'],
            'history.*.role' => ['required', 'string', 'in:user,assistant'],
            'history.*.content' => ['required', 'string', 'max:5000'],
        ];
    }

    public function question(): string
    {
        return (string) $this->validated('question');
    }

    public function subcategoryId(): ?int
    {
        $id = $this->validated('subcategory_id');

        return $id !== null ? (int) $id : null;
    }

    /**
     * @return array<int, array{role: string, content: string}>
     */
    public function history(): array
    {
        return (array) $this->validated('history', []);
    }
}
