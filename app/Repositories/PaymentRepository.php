<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Payment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PaymentRepository extends BaseRepository implements PaymentRepositoryInterface
{
    public function __construct(Payment $model)
    {
        parent::__construct($model);
    }

    public function findByReference(string $referenceId): ?Payment
    {
        /** @var Payment|null */
        return $this->model->newQuery()
            ->with(['user'])
            ->where('reference_id', $referenceId)
            ->first();
    }

    public function findByXenditId(string $xenditId): ?Payment
    {
        /** @var Payment|null */
        return $this->model->newQuery()
            ->with(['user'])
            ->where('xendit_id', $xenditId)
            ->first();
    }

    public function getRecentUserPayments(int $userId, int $limit = 10): Collection
    {
        return $this->model->newQuery()
            ->where('user_id', $userId)
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateAdminPayments(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['user'])
            ->orderBy('id', 'desc');

        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('reference_id', 'like', "%{$search}%")
                    ->orWhere('xendit_id', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', strtolower((string) $filters['status']));
        }

        if (! empty($filters['plan']) && $filters['plan'] !== 'all') {
            $query->where('plan_code', (string) $filters['plan']);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function getPaymentStats(): array
    {
        $paidQuery = $this->model->newQuery()->where('status', 'paid');

        $totalRevenue = (float) (clone $paidQuery)->sum('amount');
        $totalFees = (float) (clone $paidQuery)->sum('fee_amount');
        $totalVat = (float) (clone $paidQuery)->sum('vat_amount');
        $totalNetRevenue = (float) (clone $paidQuery)->sum('net_amount');

        // Fallback calculation if historical rows did not yet have net_amount populated
        if ($totalNetRevenue <= 0 && $totalRevenue > 0) {
            $totalNetRevenue = $totalRevenue - ($totalFees + $totalVat);
        }

        $paidCount = (clone $paidQuery)->count();

        $pendingCount = $this->model->newQuery()
            ->where('status', 'pending')
            ->count();

        $uniqueCustomers = (clone $paidQuery)
            ->distinct('user_id')
            ->count('user_id');

        return [
            'total_revenue' => round($totalRevenue, 2),
            'total_fees' => round($totalFees, 2),
            'total_vat' => round($totalVat, 2),
            'total_deductions' => round($totalFees + $totalVat, 2),
            'total_net_revenue' => round($totalNetRevenue, 2),
            'paid_count' => $paidCount,
            'pending_count' => $pendingCount,
            'unique_customers' => $uniqueCustomers,
        ];
    }
}
