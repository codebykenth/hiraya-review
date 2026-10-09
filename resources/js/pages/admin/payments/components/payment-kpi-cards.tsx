import { Banknote, CheckCircle2, Landmark, Receipt } from 'lucide-react';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { PaymentStats } from '../types';

interface PaymentKpiCardsProps {
    stats: PaymentStats;
}

export function PaymentKpiCards({ stats }: PaymentKpiCardsProps) {
    const cards = [
        {
            title: 'Real Cash Balance',
            value: `₱${(stats.real_balance ?? stats.total_net_revenue).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            description: stats.real_balance != null ? 'Live Xendit Cash Account' : 'Net available balance',
            badge: stats.real_balance != null ? 'Live Xendit' : 'Calculated Net',
            icon: Landmark,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
        },
        {
            title: 'Net Revenue (-Fees/VAT)',
            value: `₱${stats.total_net_revenue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            description: `Gross ₱${stats.total_revenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })} − ₱${stats.total_deductions.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            icon: Banknote,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
        },
        {
            title: 'Xendit Fees & VAT',
            value: `₱${stats.total_deductions.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            description: `Fee: ₱${stats.total_fees.toLocaleString('en-PH', { minimumFractionDigits: 2 })} • VAT: ₱${stats.total_vat.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
            icon: Receipt,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
        },
        {
            title: 'Paid Orders',
            value: stats.paid_count.toLocaleString(),
            description: `${stats.unique_customers} unique paying students`,
            icon: CheckCircle2,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c, i) => (
                <Card key={i} className="border-border/60 bg-card/60 shadow-sm">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    {c.title}
                                </span>
                                {c.badge && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                        {c.badge}
                                    </span>
                                )}
                            </div>
                            <div className="text-2xl font-black tracking-tight text-foreground">
                                {c.value}
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                {c.description}
                            </span>
                        </div>
                        <div className={`p-2.5 rounded-xl ${c.bg} ${c.color} shrink-0`}>
                            <c.icon className="size-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
