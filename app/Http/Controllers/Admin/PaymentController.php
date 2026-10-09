<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Payment\AdminPaymentIndexRequest;
use App\Http\Resources\AdminPaymentResource;
use App\Repositories\PaymentRepositoryInterface;
use App\Services\Payment\XenditService;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentRepositoryInterface $paymentRepository,
        protected XenditService $xenditService,
    ) {}

    public function index(AdminPaymentIndexRequest $request): Response
    {
        $filters = [
            'search' => $request->validated('search', ''),
            'status' => $request->validated('status', 'all'),
            'plan' => $request->validated('plan', 'all'),
        ];

        $perPage = (int) $request->validated('per_page', 15);
        $paginator = $this->paymentRepository->paginateAdminPayments($filters, $perPage);
        $stats = $this->paymentRepository->getPaymentStats();
        $stats['real_balance'] = $this->xenditService->getBalance('CASH');

        return $this->render('admin/payments/index', [
            'payments' => AdminPaymentResource::collection($paginator),
            'stats' => $stats,
            'filters' => $filters,
            'plans' => array_values(config('pricing.plans', [])),
        ]);
    }
}
