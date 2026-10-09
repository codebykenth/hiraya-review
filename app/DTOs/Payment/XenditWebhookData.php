<?php

declare(strict_types=1);

namespace App\DTOs\Payment;

readonly class XenditWebhookData
{
    public function __construct(
        public string $xenditId,
        public string $referenceId,
        public string $status,
        public ?string $paymentMethod = null,
        public ?float $amount = null,
        public ?string $paidAt = null,
        public array $rawPayload = [],
    ) {}

    /**
     * Parse webhook payload from either Xendit Invoice or Payment Request event.
     *
     * @param  array<string, mixed>  $payload
     */
    public static function fromPayload(array $payload): self
    {
        // Support Payment Request structure (event with 'data' envelope)
        if (isset($payload['data']) && is_array($payload['data'])) {
            $data = $payload['data'];
            $status = strtolower((string) ($data['status'] ?? ''));
            $mappedStatus = match ($status) {
                'succeeded', 'paid', 'completed' => 'paid',
                'failed' => 'failed',
                'expired' => 'expired',
                default => 'pending',
            };

            return new self(
                xenditId: (string) ($data['id'] ?? ''),
                referenceId: (string) ($data['reference_id'] ?? ''),
                status: $mappedStatus,
                paymentMethod: (string) ($data['payment_method']['type'] ?? $data['channel_code'] ?? 'UNKNOWN'),
                amount: isset($data['request_amount']) ? (float) $data['request_amount'] : null,
                paidAt: isset($data['updated']) ? (string) $data['updated'] : now()->toIso8601String(),
                rawPayload: $payload,
            );
        }

        // Standard Invoice structure
        $status = strtolower((string) ($payload['status'] ?? ''));
        $mappedStatus = match ($status) {
            'paid', 'completed', 'settled' => 'paid',
            'expired' => 'expired',
            'failed' => 'failed',
            default => 'pending',
        };

        return new self(
            xenditId: (string) ($payload['id'] ?? ''),
            referenceId: (string) ($payload['external_id'] ?? ''),
            status: $mappedStatus,
            paymentMethod: isset($payload['payment_method']) ? (string) $payload['payment_method'] : (isset($payload['payment_channel']) ? (string) $payload['payment_channel'] : null),
            amount: isset($payload['amount']) ? (float) $payload['amount'] : (isset($payload['paid_amount']) ? (float) $payload['paid_amount'] : null),
            paidAt: isset($payload['paid_at']) ? (string) $payload['paid_at'] : null,
            rawPayload: $payload,
        );
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }
}
