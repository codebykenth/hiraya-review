<?php

declare(strict_types=1);

namespace App\Http\Controllers\User;

use App\Actions\Payment\CreatePaymentAction;
use App\Actions\Payment\HandlePaymentWebhookAction;
use App\DTOs\Payment\CreatePaymentData;
use App\DTOs\Payment\XenditWebhookData;
use App\Http\Controllers\Controller;
use App\Http\Requests\User\Billing\CreatePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Repositories\PaymentRepositoryInterface;
use App\Services\Payment\XenditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class BillingController extends Controller
{
    public function __construct(
        protected PaymentRepositoryInterface $paymentRepository,
        protected CreatePaymentAction $createPaymentAction,
        protected XenditService $xenditService,
        protected HandlePaymentWebhookAction $handlePaymentWebhookAction,
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $plans = config('pricing.plans', []);
        $recentPayments = $this->paymentRepository->getRecentUserPayments($user->id, 10);

        // Proactively synchronize any pending payments directly with Xendit
        $didSync = false;
        foreach ($recentPayments as $payment) {
            if ($payment->isPending() && $payment->xendit_id) {
                $invoice = $this->xenditService->getInvoice($payment->xendit_id);
                if ($invoice) {
                    $dto = XenditWebhookData::fromPayload($invoice);
                    if ($dto->isPaid()) {
                        $this->handlePaymentWebhookAction->execute($dto);
                        $didSync = true;
                    }
                }
            }
        }

        if ($didSync) {
            $user->refresh();
            $recentPayments = $this->paymentRepository->getRecentUserPayments($user->id, 10);
        }

        return Inertia::render('user/billing/index', [
            'plans' => array_values($plans),
            'subscription' => [
                'is_premium' => $user->isPremium(),
                'premium_until' => $user->premium_until?->toIso8601String(),
            ],
            'recent_payments' => PaymentResource::collection($recentPayments),
            'sandbox' => [
                'is_active' => (bool) config('xendit.is_sandbox', true),
                'is_configured' => ! empty(config('xendit.secret_key')),
            ],
        ]);
    }

    public function checkout(CreatePaymentRequest $request): SymfonyResponse|RedirectResponse
    {
        $planCode = (string) $request->validated('plan_code');
        $plan = config("pricing.plans.{$planCode}");

        if (! $plan) {
            return back()->with('error', 'The requested plan could not be found.');
        }

        $dto = CreatePaymentData::fromPlanAndUser($plan, $request->user());
        $payment = $this->createPaymentAction->execute($dto);

        if (! empty($payment->checkout_url)) {
            // For external Xendit checkout redirection in Inertia
            return Inertia::location($payment->checkout_url);
        }

        return redirect()->route('billing.index')->with('info', 'Checkout initialized in development mode.');
    }

    public function success(Request $request): RedirectResponse
    {
        $ref = $request->query('ref');
        if ($ref) {
            $payment = $this->paymentRepository->findByReference((string) $ref);
            if ($payment && ! $payment->isPaid() && $payment->xendit_id) {
                $invoice = $this->xenditService->getInvoice($payment->xendit_id);
                if ($invoice) {
                    $dto = XenditWebhookData::fromPayload($invoice);
                    $this->handlePaymentWebhookAction->execute($dto);
                }
            }
        }

        return redirect()->route('billing.index')->with('success', 'Payment successful! Your premium access has been unlocked.');
    }

    public function failed(Request $request): RedirectResponse
    {
        return redirect()->route('billing.index')->with('error', 'Payment was not completed or was cancelled.');
    }

    public function sync(Payment $payment, Request $request): RedirectResponse
    {
        if ($payment->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            abort(403);
        }

        if (! $payment->xendit_id) {
            return back()->with('error', 'No Xendit invoice ID recorded for this payment.');
        }

        $invoice = $this->xenditService->getInvoice($payment->xendit_id);
        if (! $invoice) {
            return back()->with('error', 'Could not retrieve payment status from Xendit API.');
        }

        $dto = XenditWebhookData::fromPayload($invoice);
        $this->handlePaymentWebhookAction->execute($dto);

        if ($dto->isPaid()) {
            return back()->with('success', "Payment {$payment->reference_id} verified as PAID! Access unlocked.");
        }

        return back()->with('info', "Current status from Xendit: {$dto->status}");
    }
}
