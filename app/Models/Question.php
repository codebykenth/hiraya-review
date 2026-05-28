<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['subcategory_id', 'language', 'stem', 'options', 'correct_option', 'explanation', 'created_by', 'status'])]
class Question extends Model
{
    protected function casts(): array
    {
        return [
            'subcategory_id' => 'integer',
            'options' => 'array',
            'correct_option' => 'integer',
            'created_by' => 'integer',
        ];
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
