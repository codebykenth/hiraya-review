<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalContent extends Model
{
    protected $fillable = [
        'type',
        'content',
    ];

    protected $casts = [
        'updated_at' => 'datetime',
    ];
}
