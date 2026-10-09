import { CheckCircle2, Clock, ExternalLink, Hash, User, XCircle } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
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
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-xs gap-1">
                        <CheckCircle2 className="size-3" />
                        Settled & Paid
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 text-xs gap-1">
                        <Clock className="size-3" />
                        Pending Payment
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
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between gap-2">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                            <Hash className="size-4 text-primary" />
                            Payment Transaction Detail
                        </DialogTitle>
                        {getStatusBadge(payment.status)}
                    </div>
                    <DialogDescription className="text-xs font-mono">
                        {payment.reference_id}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 text-xs">
                    {/* Customer Info */}
                    <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                            <User className="size-3.5" /> Customer Information
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-muted-foreground text-[11px]">Name:</span>
                                <p className="font-medium text-foreground">{payment.user?.name ?? 'Unknown'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-[11px]">Email:</span>
                                <p className="font-medium text-foreground truncate">{payment.user?.email ?? 'Unknown'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg border p-2.5 space-y-1">
                            <span className="text-muted-foreground text-[11px]">Plan Ordered:</span>
                            <p className="font-bold text-foreground">{payment.plan_name}</p>
                            <span className="text-[10px] text-muted-foreground font-mono">Code: {payment.plan_code}</span>
                        </div>
                        <div className="rounded-lg border p-2.5 space-y-1">
                            <span className="text-muted-foreground text-[11px]">Amount:</span>
                            <p className="font-extrabold text-foreground text-sm">
                                ₱{payment.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })} {payment.currency}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                                Channel: {payment.payment_method ?? 'Not reported'}
                            </span>
                        </div>
                    </div>

                    {/* Settlement Breakdown (-Fees/VAT) */}
                    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                                Real Settlement (-Fees/VAT)
                            </span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                Net: ₱{payment.net_amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-[11px]">
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Gross Volume</span>
                                <span className="font-semibold text-foreground">₱{payment.amount.toFixed(2)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px]">Xendit Fee</span>
                                <span className="font-medium text-amber-600 dark:text-amber-400">-₱{payment.fee_amount.toFixed(2)}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground block text-[10px]">VAT (12%)</span>
                                <span className="font-medium text-amber-600 dark:text-amber-400">-₱{payment.vat_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Identifiers and Timestamps */}
                    <div className="space-y-1.5 border-t pt-3">
                        <div className="flex justify-between py-1 text-[11px]">
                            <span className="text-muted-foreground">Xendit Invoice ID:</span>
                            <span className="font-mono text-foreground">{payment.xendit_id ?? 'None'}</span>
                        </div>
                        <div className="flex justify-between py-1 text-[11px]">
                            <span className="text-muted-foreground">Created Date:</span>
                            <span className="text-foreground">
                                {payment.created_at ? new Date(payment.created_at).toLocaleString('en-PH') : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between py-1 text-[11px]">
                            <span className="text-muted-foreground">Settled At:</span>
                            <span className="text-foreground font-medium">
                                {payment.paid_at ? new Date(payment.paid_at).toLocaleString('en-PH') : 'Not settled yet'}
                            </span>
                        </div>
                    </div>

                    {/* Raw Metadata Preview if present */}
                    {Object.keys(payment.metadata ?? {}).length > 0 && (
                        <div className="space-y-1">
                            <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                                Gateway Metadata
                            </span>
                            <pre className="max-h-28 overflow-y-auto rounded bg-slate-950 p-2 text-[10px] font-mono text-slate-300">
                                {JSON.stringify(payment.metadata, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between pt-2 border-t">
                    {payment.checkout_url && payment.status === 'pending' ? (
                        <a
                            href={payment.checkout_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                            Open Xendit Checkout <ExternalLink className="size-3" />
                        </a>
                    ) : <span />}

                    <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
