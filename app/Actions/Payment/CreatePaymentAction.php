<?php

declare(strict_types=1);

namespace App\Actions\Payment;

use App\DTOs\Payment\CreatePaymentData;
use App\Models\Payment;
use App\Repositories\PaymentRepositoryInterface;
use App\Services\Payment\XenditService;
use Illuminate\Support\Str;

class CreatePaymentAction
{
    public function __construct(
        protected PaymentRepositoryInterface $paymentRepository,
        protected XenditService $xenditService,
    ) {}

    public function execute(CreatePaymentData $data): Payment
    {
        $referenceId = sprintf(
            'HIRAYA-PAY-%s-%s',
            date('Ymd'),
            strtoupper(Str::random(8))
        );

        /** @var Payment $payment */
        $payment = $this->paymentRepository->create([
            'user_id' => $data->userId,
            'reference_id' => $referenceId,
            'status' => 'pending',
            'amount' => $data->amount,
            'currency' => $data->currency,
            'plan_code' => $data->planCode,
            'metadata' => [
                'plan_name' => $data->planName,
                'created_environment' => app()->environment(),
            ],
        ]);

        $successUrl = route('billing.success', ['ref' => $referenceId]);
        $failureUrl = route('billing.failed', ['ref' => $referenceId]);

        $invoice = $this->xenditService->createInvoice($payment, $successUrl, $failureUrl);

        $this->paymentRepository->update($payment->id, [
            'xendit_id' => $invoice['id'] ?? null,
            'checkout_url' => $invoice['invoice_url'] ?? null,
            'metadata' => array_merge((array) ($payment->metadata ?? []), [
                'xendit_invoice' => $invoice,
            ]),
        ]);

        $payment->refresh();

        return $payment;
    }
}
