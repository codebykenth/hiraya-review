<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'last_exam_attempt_id', 'analysis_json'])]
class UserAiAnalysis extends Model
{
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'last_exam_attempt_id' => 'integer',
            'analysis_json' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function examAttempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'last_exam_attempt_id');
    }
}
