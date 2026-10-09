<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ExamAttempt;
use App\Models\QuestionAiExplanation;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ExamAttempt
 */
class ExamScorecardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $explanations = QuestionAiExplanation::whereIn('question_id', $this->question_ids ?? [])
            ->get()
            ->filter(fn ($exp) => ($this->answers[$exp->question_id] ?? -1) == $exp->selected_option)
            ->keyBy(fn ($exp) => "{$exp->question_id}-{$exp->selected_option}")
            ->map(fn ($exp) => [
                'explanation' => $exp->explanation,
                'source' => 'cache',
            ]);

        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'question_ids' => $this->question_ids,
            'answers' => $this->answers,
            'cat_scores' => $this->cat_scores,
            'ai_explanations' => $explanations,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
