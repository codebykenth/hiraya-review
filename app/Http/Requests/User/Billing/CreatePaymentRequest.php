<?php

declare(strict_types=1);

namespace App\Http\Requests\User\Billing;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $allowedPlans = array_keys(config('pricing.plans', []));

        return [
            'plan_code' => ['required', 'string', Rule::in($allowedPlans)],
        ];
    }
}
