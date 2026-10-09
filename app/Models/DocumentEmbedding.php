<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['subcategory_id', 'sourceable_type', 'sourceable_id', 'chunk_content', 'metadata', 'embedding'])]
class DocumentEmbedding extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'subcategory_id' => 'integer',
            'metadata' => 'array',
            'embedding' => 'array',
        ];
    }

    public function sourceable(): MorphTo
    {
        return $this->morphTo();
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }
}
