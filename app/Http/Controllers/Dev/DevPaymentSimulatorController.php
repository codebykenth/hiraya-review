<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dev;

use App\Actions\Payment\HandlePaymentWebhookAction;
use App\DTOs\Payment\XenditWebhookData;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DevPaymentSimulatorController extends Controller
{
    public function __construct(
        protected HandlePaymentWebhookAction $handlePaymentWebhookAction,
    ) {}

    public function simulate(Payment $payment, Request $request): RedirectResponse
    {
        abort_if(app()->isProduction(), 404);

        $status = $request->input('status', 'paid');
        $channel = $request->input('channel', 'GCASH');

        $dto = new XenditWebhookData(
            xenditId: $payment->xendit_id ?? 'sim_'.bin2hex(random_bytes(6)),
            referenceId: $payment->reference_id,
            status: $status === 'paid' ? 'paid' : 'failed',
            paymentMethod: $channel,
            amount: (float) $payment->amount,
            paidAt: now()->toIso8601String(),
            rawPayload: [
                'simulated_by' => 'DevPaymentSimulator',
                'timestamp' => now()->toIso8601String(),
            ],
        );

        $this->handlePaymentWebhookAction->execute($dto);

        return back()->with('success', "Dev Simulation: Payment {$payment->reference_id} was marked as {$status} and processed!");
    }
}
