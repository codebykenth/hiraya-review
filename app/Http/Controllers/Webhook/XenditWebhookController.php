<?php

declare(strict_types=1);

namespace App\Http\Controllers\Webhook;

use App\Actions\Payment\HandlePaymentWebhookAction;
use App\DTOs\Payment\XenditWebhookData;
use App\Http\Controllers\Controller;
use App\Services\Payment\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class XenditWebhookController extends Controller
{
    public function __construct(
        protected XenditService $xenditService,
        protected HandlePaymentWebhookAction $handlePaymentWebhookAction,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $callbackToken = $request->header('x-callback-token');

        if (! $this->xenditService->verifyWebhookToken($callbackToken)) {
            Log::warning('XenditWebhookController: Invalid x-callback-token received', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json(['message' => 'Unauthorized: Invalid callback token'], 401);
        }

        $payload = $request->all();
        $dto = XenditWebhookData::fromPayload($payload);

        $success = $this->handlePaymentWebhookAction->execute($dto);

        if (! $success) {
            return response()->json([
                'status' => 'ignored',
                'message' => 'Payment reference not found or unprocessable',
            ], 200);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Webhook handled successfully',
        ]);
    }
}
