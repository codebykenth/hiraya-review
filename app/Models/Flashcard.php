<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['deck_id', 'front_content', 'back_content', 'explanation'])]
class Flashcard extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'deck_id' => 'integer',
        ];
    }

    public function deck(): BelongsTo
    {
        return $this->belongsTo(FlashcardDeck::class, 'deck_id');
    }

    public function userProgress(): HasMany
    {
        return $this->hasMany(UserFlashcardProgress::class, 'flashcard_id');
    }
}
