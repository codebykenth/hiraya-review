import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, FlaskConical, Play, Sparkles, Terminal } from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PaymentItem, SandboxConfig } from '../types';

interface DevSandboxBannerProps {
    sandbox: SandboxConfig;
    pendingPayments: PaymentItem[];
}

export function DevSandboxBanner({ sandbox, pendingPayments }: DevSandboxBannerProps) {
    const [simulatingId, setSimulatingId] = useState<number | null>(null);

    const handleSimulate = (paymentId: number, status: 'paid' | 'failed') => {
        setSimulatingId(paymentId);
        router.post(
            `/dev/payments/${paymentId}/simulate`,
            { status, channel: 'GCASH_TEST' },
            {
                preserveScroll: true,
                onFinish: () => setSimulatingId(null),
            }
        );
    };

    return (
        <Card className="border-amber-500/30 bg-amber-500/5 text-card-foreground shadow-sm">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
                            <FlaskConical className="size-5" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                                    Xendit Development Sandbox Mode Active
                                </h3>
                                <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs">
                                    Dev Only
                                </Badge>
                                {!sandbox.is_configured && (
                                    <Badge variant="destructive" className="text-xs">
                                        Mock Mode (No Secret Key)
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Payments in this environment run through Xendit's simulated test flow. No actual charges are made.
                                You can test using simulated GCash, Maya, or test card numbers.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-background/80 px-2.5 py-1 rounded border border-border">
                            <Terminal className="size-3 text-muted-foreground" />
                            GCash / Maya Simulation Enabled
                        </span>
                    </div>
                </div>

                {/* Quick Simulation Trigger for local dev */}
                {pendingPayments.length > 0 && (
                    <div className="mt-4 border-t border-amber-500/20 pt-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                                <AlertCircle className="size-3.5 text-amber-500" />
                                {pendingPayments.length} pending dev payment(s) awaiting webhook:
                            </span>

                            <div className="flex flex-wrap items-center gap-2">
                                {pendingPayments.map((p) => (
                                    <div key={p.id} className="flex items-center gap-1.5 bg-background/90 px-2 py-1 rounded-md border text-xs">
                                        <span className="font-mono text-[11px] text-muted-foreground">{p.reference_id}</span>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-6 text-[11px] px-2 gap-1"
                                            disabled={simulatingId === p.id}
                                            onClick={() => handleSimulate(p.id, 'paid')}
                                        >
                                            <Play className="size-2.5 text-emerald-500" />
                                            Simulate Paid
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
