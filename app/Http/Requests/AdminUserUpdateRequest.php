<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminUserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'string', 'in:admin,user'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
