import {
    CheckCircle2,
    Clock,
    ExternalLink,
    Hash,
    User,
    XCircle,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { AdminPaymentItem } from '../types';

interface PaymentDetailModalProps {
    payment: AdminPaymentItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PaymentDetailModal({
    payment,
    isOpen,
    onClose,
}: PaymentDetailModalProps) {
    if (!payment) {
        return null;
    }

    const getStatusBadge = (status: AdminPaymentItem['status']) => {
        switch (status) {
            case 'paid':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/40 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400"
                    >
                        <CheckCircle2 className="size-3" />
                        Settled & Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-amber-500/40 bg-amber-500/5 text-xs text-amber-600 dark:text-amber-400"
                    >
                        <Clock className="size-3" />
                        Pending Payment
                    </Badge>
                );
            case 'failed':
            case 'expired':
                return (
                    <Badge
                        variant="outline"
                        className="gap-1 border-destructive/40 bg-destructive/5 text-xs text-destructive"
                    >
                        <XCircle className="size-3" />
                        {status === 'expired' ? 'Expired' : 'Failed'}
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-2">
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <Hash className="size-4 text-primary" />
                            Payment Transaction Detail
                        </DialogTitle>
                        {getStatusBadge(payment.status)}
                    </div>
                    <DialogDescription className="font-mono text-xs">
                        {payment.reference_id}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 text-xs">
                    {/* Customer Info */}
                    <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                            <User className="size-3.5" /> Customer Information
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[11px] text-muted-foreground">
                                    Name:
                                </span>
                                <p className="font-medium text-foreground">
                                    {payment.user?.name ?? 'Unknown'}
                                </p>
                            </div>
                            <div>
                                <span className="text-[11px] text-muted-foreground">
                                    Email:
                                </span>
                                <p className="truncate font-medium text-foreground">
                                    {payment.user?.email ?? 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 rounded-lg border p-2.5">
                            <span className="text-[11px] text-muted-foreground">
                                Plan Ordered:
                            </span>
                            <p className="font-bold text-foreground">
                                {payment.plan_name}
                            </p>
                            <span className="font-mono text-[10px] text-muted-foreground">
                                Code: {payment.plan_code}
                            </span>
                        </div>
                        <div className="space-y-1 rounded-lg border p-2.5">
                            <span className="text-[11px] text-muted-foreground">
                                Amount:
                            </span>
                            <p className="text-sm font-extrabold text-foreground">
                                ₱
                                {payment.amount.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                })}{' '}
                                {payment.currency}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                                Channel:{' '}
                                {payment.payment_method ?? 'Not reported'}
                            </span>
                        </div>
                    </div>

                    {/* Settlement Breakdown (-Fees/VAT) */}
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                                Real Settlement (-Fees/VAT)
                            </span>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                Net: ₱
                                {payment.net_amount.toLocaleString('en-PH', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-1 text-[11px]">
                            <div>
                                <span className="block text-[10px] text-muted-foreground">
                                    Gross Volume
                                </span>
                                <span className="font-semibold text-foreground">
                                    ₱{payment.amount.toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-muted-foreground">
                                    Xendit Fee
                                </span>
                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                    -₱{payment.fee_amount.toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="block text-[10px] text-muted-foreground">
                                    VAT (12%)
                                </span>
                                <span className="font-medium text-amber-600 dark:text-amber-400">
                                    -₱{payment.vat_amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Identifiers and Timestamps */}
                    <div className="space-y-1.5 border-t pt-3">
                        <div className="flex justify-between py-1 text-[11px]">
                            <span className="text-muted-foreground">
                                Xendit Invoice ID:
                            </span>
                            <span className="font-mono text-foreground">
                                {payment.xendit_id ?? 'None'}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 text-[11px]">
                            <span className="text-muted-foreground">
                                Created Date:
                            </span>
                            <span className="text-foreground">
                                {payment.created_at
                                    ? new Date(
                                          payment.created_at,
                                      ).toLocaleString('en-PH')
                                    : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 text-[11px]">
                            <span className="text-muted-foreground">
                                Settled At:
                            </span>
                            <span className="font-medium text-foreground">
                                {payment.paid_at
                                    ? new Date(payment.paid_at).toLocaleString(
                                          'en-PH',
                                      )
                                    : 'Not settled yet'}
                            </span>
                        </div>
                    </div>

                    {/* Raw Metadata Preview if present */}
                    {Object.keys(payment.metadata ?? {}).length > 0 && (
                        <div className="space-y-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                Gateway Metadata
                            </span>
                            <pre className="max-h-28 overflow-y-auto rounded bg-slate-950 p-2 font-mono text-[10px] text-slate-300">
                                {JSON.stringify(payment.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between border-t pt-2 sm:justify-between">
                    {payment.checkout_url && payment.status === 'pending' ? (
                        <a
                            href={payment.checkout_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                            Open Xendit Checkout{' '}
                            <ExternalLink className="size-3" />
                        </a>
                    ) : (
                        <span />
                    )}

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                        className="text-xs"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
