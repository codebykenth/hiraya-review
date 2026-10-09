import { Head, router } from '@inertiajs/react';
import {
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    Eye,
    Receipt,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { AdminTable  } from '@/components/domain/admin-table';
import type {TableColumn} from '@/components/domain/admin-table';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaymentDetailModal } from './components/payment-detail-modal';
import { PaymentFilters } from './components/payment-filters';
import { PaymentKpiCards } from './components/payment-kpi-cards';
import type { AdminPaymentItem, AdminPaymentsPageProps, PaymentFilters as FiltersType } from './types';

export default function PaymentsIndex({
    payments,
    stats,
    filters: initialFilters,
    plans,
}: AdminPaymentsPageProps) {
    const [selectedPayment, setSelectedPayment] = useState<AdminPaymentItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [filters, setFilters] = useState<FiltersType>(initialFilters);

    const handleFilterChange = (key: keyof FiltersType, value: string) => {
        const next = { ...filters, [key]: value };
        setFilters(next);

        router.get(
            '/admin/payments',
            {
                search: next.search || undefined,
                status: next.status !== 'all' ? next.status : undefined,
                plan: next.plan !== 'all' ? next.plan : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleReset = () => {
        const resetFilters = { search: '', status: 'all', plan: 'all' };
        setFilters(resetFilters);
        router.get('/admin/payments', {}, { preserveState: true, preserveScroll: true });
    };

    const handlePageChange = (page: number) => {
        router.get(
            '/admin/payments',
            {
                search: filters.search || undefined,
                status: filters.status !== 'all' ? filters.status : undefined,
                plan: filters.plan !== 'all' ? filters.plan : undefined,
                page,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const getStatusBadge = (status: AdminPaymentItem['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[11px] gap-1">
                        <CheckCircle2 className="size-3" />
                        Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 text-[11px] gap-1">
                        <Clock className="size-3" />
                        Pending
                    </Badge>
                );
            case 'failed':
            case 'expired':
                return (
                    <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/5 text-[11px] gap-1">
                        <XCircle className="size-3" />
                        {status === 'expired' ? 'Expired' : 'Failed'}
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const columns: TableColumn<AdminPaymentItem>[] = [
        {
            header: 'Reference / Invoice',
            render: (item) => (
                <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-foreground">
                        {item.reference_id}
                    </span>
                    {item.xendit_id && (
                        <span className="block font-mono text-[10px] text-muted-foreground">
                            {item.xendit_id}
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Customer',
            render: (item) => (
                <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-foreground">
                        {item.user?.name ?? 'Anonymous'}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                        {item.user?.email ?? 'No email'}
                    </span>
                </div>
            ),
        },
        {
            header: 'Plan',
            render: (item) => (
                <Badge variant="secondary" className="text-[11px] font-medium">
                    {item.plan_name}
                </Badge>
            ),
        },
        {
            header: 'Amount / Net',
            render: (item) => (
                <div className="space-y-0.5">
                    <div className="font-semibold text-xs text-foreground">
                        ₱{item.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    {item.status === 'paid' && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Net: ₱{item.net_amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            {item.fee_amount > 0 && (
                                <span className="text-muted-foreground ml-1">
                                    (-₱{(item.fee_amount + item.vat_amount).toFixed(2)})
                                </span>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        {
            header: 'Method',
            render: (item) => (
                <span className="font-mono text-[11px] text-muted-foreground uppercase">
                    {item.payment_method ?? '—'}
                </span>
            ),
        },
        {
            header: 'Status',
            render: (item) => getStatusBadge(item.status),
        },
        {
            header: 'Date',
            render: (item) => (
                <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    }) : '—'}
                </span>
            ),
        },
        {
            header: 'Action',
            className: 'text-right',
            render: (item) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 px-2"
                    onClick={() => {
                        setSelectedPayment(item);
                        setIsDetailOpen(true);
                    }}
                >
                    <Eye className="size-3.5 text-muted-foreground" />
                    <span>View</span>
                </Button>
            ),
        },
    ];

    return (
        <>
            <Head title="Payments Management" />

            <PageContainer className="gap-6">
                <PageHeader
                    title="User Payments & Subscriptions"
                    description="Monitor incoming transactions, payment channels, and verified student memberships."
                />

                {/* 1. KPI Cards */}
                <PaymentKpiCards stats={stats} />

                {/* 2. Filters & Search */}
                <PaymentFilters
                    filters={filters}
                    plans={plans}
                    onFilterChange={handleFilterChange}
                    onReset={handleReset}
                />

                {/* 3. Table */}
                <AdminTable
                    data={payments.data}
                    columns={columns}
                    totalItems={payments.meta?.total ?? payments.data.length}
                    currentPage={payments.meta?.current_page ?? 1}
                    pageSize={payments.meta?.per_page ?? 15}
                    onPageChange={handlePageChange}
                    emptyState={{
                        icon: Receipt,
                        title: 'No Payments Found',
                        description: 'No transactions match the selected filters or search keywords.',
                    }}
                />

                {/* 4. Detail Modal */}
                <PaymentDetailModal
                    payment={selectedPayment}
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                />
            </PageContainer>
        </>
    );
}

PaymentsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: '/admin/dashboard',
        },
        {
            title: 'Payments',
            href: '/admin/payments',
        },
    ],
};
