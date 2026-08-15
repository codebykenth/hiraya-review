<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'flashcard_id', 'ease_factor', 'interval_days', 'repetitions', 'next_review_at'])]
class UserFlashcardProgress extends Model
{
    use HasFactory;

    protected $table = 'user_flashcard_progress';

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'flashcard_id' => 'integer',
            'ease_factor' => 'float',
            'interval_days' => 'integer',
            'repetitions' => 'integer',
            'next_review_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function flashcard(): BelongsTo
    {
        return $this->belongsTo(Flashcard::class);
    }
}
