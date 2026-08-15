<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamAttemptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('cat_scores') && ($this->has('score') || $this->has('categoryScoreMap'))) {
            $this->merge([
                'cat_scores' => [
                    'categoryScoreMap' => $this->input('categoryScoreMap', []),
                    'metadata' => [
                        'track' => $this->input('track', 'Drill'),
                        'category_name' => $this->input('category_name', 'Practice Drill'),
                        'score' => $this->input('score', 0),
                        'total_questions' => $this->input('total_questions', count($this->input('question_ids', []))),
                        'correct_count' => $this->input('correct_count', 0),
                        'wrong_count' => $this->input('wrong_count', 0),
                        'skipped_count' => $this->input('skipped_count', 0),
                        'wrong_question_ids' => $this->input('wrong_question_ids', []),
                        'duration_secs' => $this->input('duration_secs', 0),
                        'is_timed' => $this->boolean('is_timed', true),
                        'question_times' => $this->input('question_times', []),
                        'answer_changes' => $this->input('answer_changes', []),
                        'selected_subcategories' => $this->input('selected_subcategories', []),
                        'language' => $this->input('language', 'English'),
                        'question_count' => $this->input('question_count', 30),
                    ],
                ],
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'category_id' => ['nullable', 'integer'],
            'question_ids' => ['required', 'array'],
            'answers' => ['required', 'array'],
            'cat_scores' => ['required', 'array'],
        ];
    }
}
