<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'slug', 'is_demographic', 'sort_order'])]
class Category extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_demographic' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function subcategory()
    {
        return $this->hasMany(Subcategory::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
