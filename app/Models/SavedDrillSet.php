<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SavedDrillSet extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'color',
    ];

    /**
     * Get the user that owns the saved drill set.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the questions associated with this saved drill set.
     */
    public function questions(): BelongsToMany
    {
        return $this->belongsToMany(Question::class, 'saved_drill_items', 'saved_drill_set_id', 'question_id')
            ->withTimestamps();
    }
}
