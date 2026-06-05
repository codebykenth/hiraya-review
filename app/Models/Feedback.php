<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['user_id', 'flaggable_id', 'flaggable_type', 'reason', 'details', 'status'])]
class Feedback extends Model
{
    use HasFactory;

    protected $table = 'feedbacks';

    /**
     * Get the parent flaggable model (Question or LearnModule).
     */
    public function flaggable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who submitted the feedback.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
