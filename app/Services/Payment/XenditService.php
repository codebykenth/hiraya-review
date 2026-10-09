<?php

declare(strict_types=1);

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class XenditService
{
    protected string $secretKey;

    protected string $webhookToken;

    protected string $baseUrl;

    protected int $invoiceDuration;

    protected bool $isSandbox;

    public function __construct()
    {
        $this->secretKey = (string) config('xendit.secret_key');
        $this->webhookToken = (string) config('xendit.webhook_token');
        $this->baseUrl = rtrim((string) config('xendit.base_url', 'https://api.xendit.co'), '/');
        $this->invoiceDuration = (int) config('xendit.invoice_duration_seconds', 86400);
        $this->isSandbox = (bool) config('xendit.is_sandbox', true);
    }

    /**
     * Create hosted invoice with Xendit API.
     *
     * @return array<string, mixed>
     */
    public function createInvoice(Payment $payment, string $successRedirectUrl, string $failureRedirectUrl): array
    {
        // Mock fallback for local dev when Xendit test secret key is not configured yet
        if (empty($this->secretKey) && app()->environment('local', 'testing')) {
            Log::info('XenditService: Dev mode mock invoice created without API key', [
                'reference_id' => $payment->reference_id,
            ]);

            return [
                'id' => 'mock_inv_'.bin2hex(random_bytes(8)),
                'external_id' => $payment->reference_id,
                'status' => 'PENDING',
                'invoice_url' => route('billing.index', ['dev_mock_checkout' => $payment->reference_id]),
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
            ];
        }

        if (empty($this->secretKey)) {
            throw new RuntimeException('Xendit Secret Key is not configured in environment.');
        }

        $payload = [
            'external_id' => $payment->reference_id,
            'amount' => (float) $payment->amount,
            'payer_email' => $payment->user->email,
            'description' => 'Hiraya Review - '.str_replace('_', ' ', strtoupper($payment->plan_code)),
            'invoice_duration' => $this->invoiceDuration,
            'currency' => $payment->currency,
            'success_redirect_url' => $successRedirectUrl,
            'failure_redirect_url' => $failureRedirectUrl,
            'customer' => [
                'given_names' => $payment->user->name,
                'email' => $payment->user->email,
            ],
            'items' => [
                [
                    'name' => 'Hiraya Review '.str_replace('_', ' ', strtoupper($payment->plan_code)),
                    'quantity' => 1,
                    'price' => (float) $payment->amount,
                    'category' => 'Educational Digital Reviewer',
                ],
            ],
        ];

        /** @var Response $response */
        $response = Http::withBasicAuth($this->secretKey, '')
            ->timeout(15)
            ->acceptJson()
            ->post("{$this->baseUrl}/v2/invoices", $payload);

        if ($response->failed()) {
            Log::error('Xendit Invoice creation failed', [
                'reference_id' => $payment->reference_id,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);

            throw new RuntimeException('Failed to initiate Xendit checkout: '.($response->json('message') ?? 'Unknown error'));
        }

        return (array) $response->json();
    }

    /**
     * Retrieve invoice details directly from Xendit.
     *
     * @return array<string, mixed>|null
     */
    public function getInvoice(string $invoiceId): ?array
    {
        if (empty($this->secretKey)) {
            return null;
        }

        /** @var Response $response */
        $response = Http::withBasicAuth($this->secretKey, '')
            ->timeout(10)
            ->acceptJson()
            ->get("{$this->baseUrl}/v2/invoices/{$invoiceId}");

        if ($response->failed()) {
            Log::warning('Xendit getInvoice failed', [
                'invoice_id' => $invoiceId,
                'status' => $response->status(),
            ]);

            return null;
        }

        return (array) $response->json();
    }

    /**
     * Create unified Payment Request (v3).
     *
     * @param  array<string, mixed>  $channelProperties
     * @return array<string, mixed>
     */
    public function createPaymentRequest(
        Payment $payment,
        string $channelCode,
        array $channelProperties = []
    ): array {
        if (empty($this->secretKey)) {
            throw new RuntimeException('Xendit Secret Key is not configured in environment.');
        }

        $payload = [
            'reference_id' => $payment->reference_id,
            'type' => 'PAY',
            'country' => 'PH',
            'currency' => $payment->currency,
            'request_amount' => (float) $payment->amount,
            'channel_code' => $channelCode,
            'channel_properties' => $channelProperties,
        ];

        /** @var Response $response */
        $response = Http::withBasicAuth($this->secretKey, '')
            ->timeout(15)
            ->acceptJson()
            ->post("{$this->baseUrl}/v3/payment_requests", $payload);

        if ($response->failed()) {
            throw new RuntimeException('Failed to initiate Xendit Payment Request: '.($response->json('message') ?? 'Unknown error'));
        }

        return (array) $response->json();
    }

    /**
     * Verify incoming webhook token from x-callback-token header.
     */
    public function verifyWebhookToken(?string $token): bool
    {
        if (empty($this->webhookToken)) {
            // In local/testing development, allow callback if token isn't yet set
            return app()->environment('local', 'testing');
        }

        if (empty($token)) {
            return false;
        }

        return hash_equals($this->webhookToken, $token);
    }

    /**
     * Retrieve live cash balance from Xendit.
     */
    public function getBalance(string $accountType = 'CASH'): ?float
    {
        if (empty($this->secretKey)) {
            return null;
        }

        return Cache::remember('xendit_real_balance_'.$accountType, 60, function () use ($accountType) {
            try {
                $response = Http::withBasicAuth($this->secretKey, '')
                    ->timeout(8)
                    ->acceptJson()
                    ->get("{$this->baseUrl}/balance", [
                        'account_type' => $accountType,
                    ]);

                if ($response->successful()) {
                    return (float) ($response->json('balance') ?? 0);
                }

                Log::warning('XenditService: Failed to retrieve balance', [
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
            } catch (Throwable $e) {
                Log::warning('XenditService: Balance request exception: '.$e->getMessage());
            }

            return null;
        });
    }

    /**
     * Retrieve transaction details (including fee and VAT breakdown) for a reference ID.
     *
     * @return array<string, mixed>|null
     */
    public function getTransactionByReference(string $referenceId): ?array
    {
        if (empty($this->secretKey)) {
            return null;
        }

        try {
            $response = Http::withBasicAuth($this->secretKey, '')
                ->timeout(8)
                ->acceptJson()
                ->get("{$this->baseUrl}/transactions", [
                    'reference_id' => $referenceId,
                ]);

            if ($response->successful()) {
                $data = (array) ($response->json('data') ?? []);
                if (! empty($data)) {
                    return (array) $data[0];
                }
            }
        } catch (Throwable $e) {
            Log::warning('XenditService: getTransactionByReference exception: '.$e->getMessage());
        }

        return null;
    }

    /**
     * Fetch exact fee and VAT breakdown from Xendit transaction API or compute standard rates.
     *
     * @return array{fee_amount: float, vat_amount: float, net_amount: float, is_estimated: bool}
     */
    public function fetchOrCalculateFees(Payment $payment): array
    {
        $txn = $this->getTransactionByReference($payment->reference_id);

        if ($txn && isset($txn['fee'])) {
            $feeAmount = (float) ($txn['fee']['xendit_fee'] ?? 0);
            $vatAmount = (float) ($txn['fee']['value_added_tax'] ?? 0);
            $netAmount = isset($txn['net_amount'])
                ? (float) $txn['net_amount']
                : round((float) $payment->amount - ($feeAmount + $vatAmount), 2);

            return [
                'fee_amount' => $feeAmount,
                'vat_amount' => $vatAmount,
                'net_amount' => $netAmount,
                'is_estimated' => false,
            ];
        }

        // Standard Philippine Xendit fee rates fallback
        $channel = strtoupper((string) ($payment->payment_method ?? ''));
        $rate = match (true) {
            str_contains($channel, 'MAYA') => 0.018,
            str_contains($channel, 'GCASH') => 0.023,
            str_contains($channel, 'GRAB') => 0.020,
            str_contains($channel, 'CARD') => 0.035,
            default => 0.020,
        };

        $gross = (float) $payment->amount;
        $fee = round($gross * $rate, 2);
        $vat = round($fee * 0.12, 2);
        $net = round($gross - ($fee + $vat), 2);

        return [
            'fee_amount' => $fee,
            'vat_amount' => $vat,
            'net_amount' => $net,
            'is_estimated' => true,
        ];
    }
}
