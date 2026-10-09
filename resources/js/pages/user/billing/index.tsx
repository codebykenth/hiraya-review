import { Head } from '@inertiajs/react';
import { Award, CheckCircle, Crown, ShieldCheck, Sparkles } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DevSandboxBanner } from './components/dev-sandbox-banner';
import { PaymentHistoryTable } from './components/payment-history-table';
import { PricingCards } from './components/pricing-cards';
import type { BillingPageProps } from './types';

export default function BillingPage({ plans, subscription, recent_payments, sandbox }: BillingPageProps) {
    const pendingPayments = recent_payments.data.filter((p) => p.status === 'pending');

    return (
        <>
            <Head title="Billing & Plans" />

            <PageContainer>
                {/* 1. HEADER SECTION */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <PageHeader
                        title="Plans & Upgrades"
                        description="Level up your Civil Service Examination prep with full question access, AI diagnostics, and unlimited test kit exports."
                    />

                    {subscription.is_premium && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <Crown className="size-4 shrink-0" />
                            <div className="text-xs">
                                <span className="font-semibold">Pro Reviewer Active</span>
                                {subscription.premium_until && (
                                    <span className="block text-[11px] text-muted-foreground">
                                        Valid until {new Date(subscription.premium_until).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. DEV SANDBOX BANNER */}
                {sandbox.is_active && (
                    <div className="mb-8">
                        <DevSandboxBanner
                            sandbox={sandbox}
                            pendingPayments={pendingPayments}
                        />
                    </div>
                )}

                {/* 3. PRICING CARDS */}
                <div className="mb-10">
                    <PricingCards
                        plans={plans}
                        subscription={subscription}
                    />
                </div>

                {/* 4. TRUST & GUARANTEE BANNER */}
                <div className="mb-10 grid gap-4 sm:grid-cols-3 max-w-5xl mx-auto">
                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className="rounded-md bg-primary/10 p-2 text-primary shrink-0">
                                <ShieldCheck className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-semibold text-foreground">Secure Payments</h4>
                                <p className="text-[11px] text-muted-foreground leading-normal">
                                    Processed through Xendit with 256-bit encryption for GCash, Maya, and Cards.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className="rounded-md bg-emerald-500/10 p-2 text-emerald-500 shrink-0">
                                <CheckCircle className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-semibold text-foreground">Instant Activation</h4>
                                <p className="text-[11px] text-muted-foreground leading-normal">
                                    Your account entitlements unlock automatically the second payment is verified.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/60">
                        <CardContent className="p-4 flex items-start gap-3">
                            <div className="rounded-md bg-amber-500/10 p-2 text-amber-500 shrink-0">
                                <Award className="size-4" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-semibold text-foreground">Aligned with CSC Specs</h4>
                                <p className="text-[11px] text-muted-foreground leading-normal">
                                    Every question and drill strictly follows official Civil Service Commission guidelines.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 5. PAYMENT HISTORY */}
                <div className="max-w-5xl mx-auto">
                    <PaymentHistoryTable payments={recent_payments.data} />
                </div>
            </PageContainer>
        </>
    );
}

BillingPage.layout = {
    breadcrumbs: [
        {
            title: 'Billing & Plans',
            href: '/billing',
        },
    ],
};
