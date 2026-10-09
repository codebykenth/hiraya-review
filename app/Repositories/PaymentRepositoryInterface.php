<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PaymentRepositoryInterface extends BaseRepositoryInterface
{
    public function findByReference(string $referenceId): ?Payment;

    public function findByXenditId(string $xenditId): ?Payment;

    public function getRecentUserPayments(int $userId, int $limit = 10): Collection;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateAdminPayments(array $filters, int $perPage = 15): LengthAwarePaginator;

    /**
     * @return array{total_revenue: float, paid_count: int, pending_count: int, unique_customers: int}
     */
    public function getPaymentStats(): array;
}
