<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\DTOs\Payment\XenditWebhookData;
use App\Repositories\PaymentRepositoryInterface;
use App\Repositories\UserRepositoryInterface;
use App\Services\Payment\XenditService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HandlePaymentWebhookAction
{
    public function __construct(
        protected PaymentRepositoryInterface $paymentRepository,
        protected UserRepositoryInterface $userRepository,
        protected XenditService $xenditService,
    ) {}

    public function execute(XenditWebhookData $data): bool
    {
        $payment = null;

        if (! empty($data->referenceId)) {
            $payment = $this->paymentRepository->findByReference($data->referenceId);
        }

        if (! $payment && ! empty($data->xenditId)) {
            $payment = $this->paymentRepository->findByXenditId($data->xenditId);
        }

        if (! $payment) {
            Log::warning('HandlePaymentWebhookAction: Payment not found for webhook event', [
                'reference_id' => $data->referenceId,
                'xendit_id' => $data->xenditId,
                'status' => $data->status,
            ]);

            return false;
        }

        // Idempotency check: if already paid, do not re-process
        if ($payment->isPaid() && $data->isPaid()) {
            Log::info('HandlePaymentWebhookAction: Payment already marked as paid (idempotent ignore)', [
                'payment_id' => $payment->id,
                'reference_id' => $payment->reference_id,
            ]);

            return true;
        }

        DB::transaction(function () use ($payment, $data) {
            if ($data->isPaid()) {
                $paidAt = $data->paidAt ? Carbon::parse($data->paidAt) : now();
                $feeData = $this->xenditService->fetchOrCalculateFees($payment);

                $this->paymentRepository->update($payment->id, [
                    'status' => 'paid',
                    'payment_method' => $data->paymentMethod ?? $payment->payment_method,
                    'fee_amount' => $feeData['fee_amount'],
                    'vat_amount' => $feeData['vat_amount'],
                    'net_amount' => $feeData['net_amount'],
                    'paid_at' => $paidAt,
                    'metadata' => array_merge((array) ($payment->metadata ?? []), [
                        'webhook_payload' => $data->rawPayload,
                        'fee_details' => $feeData,
                    ]),
                ]);

                // Fulfill user entitlement
                $user = $payment->user;
                if ($user) {
                    $plan = config("pricing.plans.{$payment->plan_code}");
                    $durationDays = $plan['duration_days'] ?? null;

                    $user->is_premium = true;

                    if ($durationDays !== null) {
                        // If user already has an active premium subscription, extend it
                        $baseDate = ($user->premium_until && $user->premium_until->isFuture())
                            ? $user->premium_until
                            : now();
                        $user->premium_until = $baseDate->copy()->addDays((int) $durationDays);
                    } else {
                        // Lifetime access
                        $user->premium_until = null;
                    }

                    // Enable full PDF download privileges
                    $user->can_download_pdf = true;
                    $user->save();

                    Log::info('HandlePaymentWebhookAction: User entitlement activated successfully', [
                        'user_id' => $user->id,
                        'plan_code' => $payment->plan_code,
                        'is_premium' => $user->is_premium,
                        'premium_until' => $user->premium_until?->toIso8601String(),
                    ]);
                }
            } else {
                $this->paymentRepository->update($payment->id, [
                    'status' => $data->status,
                    'metadata' => array_merge((array) ($payment->metadata ?? []), [
                        'webhook_payload' => $data->rawPayload,
                    ]),
                ]);
            }
        });

        return true;
    }
}
