<?php

declare(strict_types=1);

namespace App\DTOs\Payment;

use App\Models\User;

readonly class CreatePaymentData
{
    public function __construct(
        public int $userId,
        public string $planCode,
        public string $planName,
        public float $amount,
        public string $currency,
        public string $payerEmail,
        public string $payerName,
    ) {}

    public static function fromPlanAndUser(array $plan, User $user): self
    {
        return new self(
            userId: (int) $user->id,
            planCode: (string) $plan['code'],
            planName: (string) $plan['name'],
            amount: (float) $plan['price'],
            currency: (string) ($plan['currency'] ?? 'PHP'),
            payerEmail: (string) $user->email,
            payerName: (string) $user->name,
        );
    }
}
