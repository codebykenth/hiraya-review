<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

#[Fillable(['category_id', 'subcategory_id', 'title', 'slug', 'topic', 'summary', 'content', 'estimated_minutes', 'is_published', 'created_by', 'completed_by_user_ids'])]
class LearnModule extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('sitemap_xml');
        });

        static::deleted(function () {
            Cache::forget('sitemap_xml');
        });
    }



    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'completed_by_user_ids' => 'array',
            'is_published' => 'boolean',
        ];
    }

    /**
     * Determine if this module is completed by a user.
     */
    public function isCompletedBy(int $userId): bool
    {
        $userIds = $this->completed_by_user_ids ?? [];

        return in_array($userId, $userIds);
    }

    /**
     * Get the category that this learning module belongs to.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the subcategory that this learning module belongs to.
     */
    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * Get the user who created this learning module.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
