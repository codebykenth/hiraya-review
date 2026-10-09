import { Link } from '@inertiajs/react';
import { ArrowUpRight, Banknote, Landmark, Receipt } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { FinancialMetrics } from '../types';

interface DashboardFinanceBannerProps {
    financials?: FinancialMetrics;
}

export function DashboardFinanceBanner({ financials }: DashboardFinanceBannerProps) {
    if (!financials) {
        return null;
    }

    const realBalance = financials.real_balance ?? financials.total_net_revenue;
    const isLive = financials.real_balance !== null;

    return (
        <Card className="overflow-hidden border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 shadow-xs">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Primary Balance Section */}
                    <div className="flex flex-wrap items-start sm:items-center gap-4 sm:gap-6">
                        <div className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Landmark className="size-5 sm:size-6" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Real Available Balance
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {isLive ? 'Live Xendit Cash' : 'Settled Net'}
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                                    ₱{realBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-xs font-semibold text-muted-foreground">
                                    PHP
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                Net available cash after gateway transaction fees & 12% VAT.
                            </p>
                        </div>
                    </div>

                    {/* Breakdown & CTA Section */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 border-t border-border/50 pt-3 lg:border-t-0 lg:pt-0">
                        {/* Net Revenue */}
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                <Banknote className="size-3.5 text-blue-500" />
                                <span>Net Revenue</span>
                            </div>
                            <div className="text-sm font-bold text-foreground">
                                ₱{financials.total_net_revenue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Gross: ₱{financials.total_gross_revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        {/* Deductions (Fees + VAT) */}
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                <Receipt className="size-3.5 text-amber-500" />
                                <span>Total Fees & VAT</span>
                            </div>
                            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                -₱{financials.total_deductions.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                Fee: ₱{financials.total_fees.toFixed(2)} • VAT: ₱{financials.total_vat.toFixed(2)}
                            </div>
                        </div>

                        {/* Link to full payments management */}
                        <Link
                            href="/admin/payments"
                            className="group ml-auto flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:scale-95 shadow-xs"
                        >
                            <span>Payments & Ledger</span>
                            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
