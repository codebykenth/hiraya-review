import { router } from '@inertiajs/react';
import { ArrowUpRight, CheckCircle2, Clock, ExternalLink, RotateCw, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PaymentItem } from '../types';

interface PaymentHistoryTableProps {
    payments: PaymentItem[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
    const [syncingId, setSyncingId] = useState<number | null>(null);

    const handleSync = (paymentId: number) => {
        setSyncingId(paymentId);
        router.post(
            `/billing/sync/${paymentId}`,
            {},
            {
                preserveScroll: true,
                onFinish: () => setSyncingId(null),
            }
        );
    };

    if (payments.length === 0) {
        return (
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Payment History</CardTitle>
                    <CardDescription className="text-xs">
                        Records of past transactions, receipts, and membership upgrades.
                    </CardDescription>
                </CardHeader>
                <CardContent className="py-8 text-center text-xs text-muted-foreground">
                    No transactions recorded yet. When you upgrade, your payment details will appear here.
                </CardContent>
            </Card>
        );
    }

    const getStatusBadge = (status: PaymentItem['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-xs gap-1">
                        <CheckCircle2 className="size-3" />
                        Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 text-xs gap-1">
                        <Clock className="size-3" />
                        Pending
                    </Badge>
                );
            case 'failed':
            case 'expired':
                return (
                    <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/5 text-xs gap-1">
                        <XCircle className="size-3" />
                        {status === 'expired' ? 'Expired' : 'Failed'}
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Card className="border-border/60 overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Payment History</CardTitle>
                <CardDescription className="text-xs">
                    Review past transaction receipts, references, and billing statuses.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 border-y border-border/60 text-muted-foreground font-medium">
                            <tr>
                                <th className="px-4 py-2.5">Reference</th>
                                <th className="px-4 py-2.5">Plan</th>
                                <th className="px-4 py-2.5">Amount</th>
                                <th className="px-4 py-2.5">Method</th>
                                <th className="px-4 py-2.5">Status</th>
                                <th className="px-4 py-2.5">Date</th>
                                <th className="px-4 py-2.5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                                        {p.reference_id}
                                    </td>
                                    <td className="px-4 py-3 text-foreground font-medium">
                                        {p.plan_name}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-foreground">
                                        ₱{p.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {p.payment_method ? (
                                            <span className="font-mono uppercase text-[11px] bg-muted px-1.5 py-0.5 rounded">
                                                {p.payment_method}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground/60">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getStatusBadge(p.status)}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-PH', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        }) : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {p.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-1.5 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                                                    disabled={syncingId === p.id}
                                                    onClick={() => handleSync(p.id)}
                                                    title="Query Xendit for latest status"
                                                >
                                                    <RotateCw className={`size-3 ${syncingId === p.id ? 'animate-spin' : ''}`} />
                                                    <span>Sync</span>
                                                </Button>
                                                {p.checkout_url && (
                                                    <a
                                                        href={p.checkout_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                                                    >
                                                        Pay <ExternalLink className="size-3" />
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground/40 text-[11px]">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
