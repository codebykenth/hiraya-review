import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, CreditCard, Crown, Sparkles } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface UserBillingSummary {
    is_premium: boolean;
    plan_name: string;
    plan_code: string;
    amount: number | null;
    paid_at: string | null;
    reference_id: string | null;
    payment_method: string | null;
    premium_until: string | null;
    is_lifetime: boolean;
}

interface SubscriptionStatusCardProps {
    billing: UserBillingSummary;
}

export function SubscriptionStatusCard({ billing }: SubscriptionStatusCardProps) {
    const { xendit } = usePage<{ xendit?: { enabled: boolean; is_sandbox?: boolean } }>().props;

    if (!billing.is_premium) {
        return null;
    }

    return (
        <Card className="relative overflow-hidden border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-background to-background dark:border-emerald-500/30">
            <div className="absolute top-0 right-0 h-full w-48 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />

            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400 shrink-0">
                            {billing.is_lifetime ? (
                                <Crown className="size-5" />
                            ) : (
                                <Sparkles className="size-5" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-sm font-bold tracking-tight text-foreground">
                                    {billing.plan_name}
                                </h4>
                                <Badge
                                    variant="outline"
                                    className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[11px] font-semibold gap-1"
                                >
                                    <CheckCircle2 className="size-3" />
                                    Active & Verified
                                </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                {billing.is_lifetime ? (
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                        Lifetime access — No renewal required.
                                    </span>
                                ) : billing.premium_until ? (
                                    <span>
                                        Valid until{' '}
                                        <strong className="text-foreground">
                                            {new Date(billing.premium_until).toLocaleDateString('en-PH', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </strong>
                                    </span>
                                ) : null}

                                {billing.reference_id && (
                                    <span className="ml-2 font-mono text-[11px] text-muted-foreground/80">
                                        Ref: {billing.reference_id}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {!xendit?.is_sandbox && (
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5 border-emerald-500/30 hover:bg-emerald-500/10 text-foreground"
                                asChild
                            >
                                <Link href="/billing">
                                    <CreditCard className="size-3.5 text-emerald-500" />
                                    <span>Billing & Receipts</span>
                                    <ArrowRight className="size-3 text-muted-foreground" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
