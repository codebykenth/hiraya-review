import { Link } from '@inertiajs/react';
import { Sparkles, ArrowRight, Brain, CheckCircle2, Clock } from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import { aiAnalysis as aiAnalysisRoute } from '@/routes/analytics';

interface AiDiagnosticBannerProps {
    aiAnalysis?: {
        status: 'no_data' | 'generating' | 'ready' | 'failed' | 'no_exam_date';
        data: any | null;
    };
}

export function AiDiagnosticBanner({ aiAnalysis }: AiDiagnosticBannerProps) {
    const status = aiAnalysis?.status || 'no_data';
    const data = aiAnalysis?.data;

    const encouragement = data?.encouragement;
    const topWeakness = data?.critical_weaknesses?.[0]?.name;

    return (
        <Card className="relative overflow-hidden border border-indigo-200/80 bg-gradient-to-r from-indigo-50/70 via-blue-50/50 to-purple-50/40 p-4 shadow-2xs dark:border-indigo-950/80 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-sm">
                        <Sparkles className="size-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white sm:text-base">
                                AI Diagnostic Report & Personalized Strategy
                            </h4>
                            {status === 'ready' && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300">
                                    <CheckCircle2 className="size-2.5" />
                                    Diagnostic Ready
                                </span>
                            )}
                            {status === 'generating' && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                    <Clock className="size-2.5" />
                                    Generating Insights...
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                            {encouragement
                                ? encouragement
                                : topWeakness
                                  ? `AI diagnosed your primary target area: ${topWeakness}. Access predictive question modeling and adaptive schedules.`
                                  : 'Access full cognitive gap diagnosis, predictive pass probability, and multi-week study calendars tailored to your exam target.'}
                        </p>
                    </div>
                </div>

                <div className="shrink-0">
                    <Link
                        href={aiAnalysisRoute({ query: { from: '/analytics' } })}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-xs font-bold text-indigo-700 shadow-2xs transition hover:bg-indigo-50 active:scale-95 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800"
                    >
                        <span>Open AI Diagnostic</span>
                        <ArrowRight className="size-3.5" />
                    </Link>
                </div>
            </div>
        </Card>
    );
}
