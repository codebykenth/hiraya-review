<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Payment
 */
class PaymentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $plan = config("pricing.plans.{$this->plan_code}") ?? [];

        return [
            'id' => $this->id,
            'reference_id' => $this->reference_id,
            'status' => $this->status,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'plan_code' => $this->plan_code,
            'plan_name' => $plan['name'] ?? ucfirst(str_replace('_', ' ', $this->plan_code)),
            'payment_method' => $this->payment_method,
            'checkout_url' => $this->checkout_url,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
