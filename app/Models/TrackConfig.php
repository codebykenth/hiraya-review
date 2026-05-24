<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

#[Fillable(['track', 'category_id', 'item_count', 'time_limit_secs'])]
class TrackConfig extends Model
{
    protected function casts(): array
    {
        return [
            'category_id' => 'integer',
            'item_count' => 'integer',
            'time_limit_secs' => 'integer',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
