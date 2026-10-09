import { router } from '@inertiajs/react';
import { Check, Crown, Loader2, Sparkles, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { PricingPlan, UserSubscriptionStatus } from '../types';

interface PricingCardsProps {
    plans: PricingPlan[];
    subscription: UserSubscriptionStatus;
}

export function PricingCards({ plans, subscription }: PricingCardsProps) {
    const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);

    const handleCheckout = (planCode: string) => {
        setSubmittingPlan(planCode);
        router.post(
            '/billing/checkout',
            { plan_code: planCode },
            {
                onError: () => setSubmittingPlan(null),
                onFinish: () => setSubmittingPlan(null),
            }
        );
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            {plans.map((plan) => {
                const isLifetime = plan.duration_days === null;
                const isSubmitting = submittingPlan === plan.code;

                return (
                    <Card
                        key={plan.code}
                        className={`relative flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg ${
                            plan.is_featured
                                ? 'border-primary/50 shadow-md shadow-primary/5 ring-1 ring-primary/20'
                                : 'border-border/80'
                        }`}
                    >
                        {plan.badge && (
                            <div className="absolute top-4 right-4">
                                <Badge
                                    variant={plan.is_featured ? 'default' : 'secondary'}
                                    className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
                                >
                                    {plan.badge}
                                </Badge>
                            </div>
                        )}

                        <div>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    {isLifetime ? (
                                        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                                            <Crown className="size-5" />
                                        </div>
                                    ) : (
                                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                            <Zap className="size-5" />
                                        </div>
                                    )}
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight">
                                            {plan.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {plan.billing_period}
                                        </CardDescription>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-extrabold tracking-tight text-foreground">
                                        ₱{plan.price.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {plan.currency}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground leading-normal">
                                    {plan.description}
                                </p>
                            </CardHeader>

                            <CardContent className="pt-2">
                                <div className="space-y-2.5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        What's included:
                                    </span>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90 leading-tight">
                                                <div className="mt-0.5 rounded-full bg-emerald-500/10 p-0.5 text-emerald-500 shrink-0">
                                                    <Check className="size-3 stroke-[2.5]" />
                                                </div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </div>

                        <CardFooter className="pt-4 border-t border-border/50">
                            {subscription.is_premium ? (
                                <Button
                                    variant="outline"
                                    className="w-full text-xs font-semibold gap-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10"
                                    onClick={() => handleCheckout(plan.code)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="size-3.5" />
                                    )}
                                    {isLifetime ? 'Upgrade to Lifetime' : 'Extend Pro Pass'}
                                </Button>
                            ) : (
                                <Button
                                    variant={plan.is_featured ? 'default' : 'secondary'}
                                    className="w-full text-xs font-semibold gap-2"
                                    onClick={() => handleCheckout(plan.code)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="size-3.5" />
                                    )}
                                    Get Started
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
