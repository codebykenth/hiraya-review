<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'study_date', 'study_time', 'title', 'description', 'subcategory_id', 'is_done'])]
class StudySchedule extends Model
{
    protected function casts(): array
    {
        return [
            'study_date' => 'date',
            'study_time' => 'datetime:H:i',
            'is_done' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }
}
