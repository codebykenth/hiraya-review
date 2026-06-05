<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'role',
        'view_name',
        'is_visible',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
    ];
}
