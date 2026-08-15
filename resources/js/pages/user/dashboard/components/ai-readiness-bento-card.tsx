import { Link, router, usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import {
    Brain,
    Sparkles,
    TrendingUp,
    TrendingDown,
    Minus,
    Zap,
    ChevronRight,
    Loader2,
    AlertCircle,
    Target,
} from 'lucide-react';
import Pusher from 'pusher-js';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { index as examsIndex } from '@/routes/exams';
import type { Auth } from '@/types';
import type { AiAnalysisData } from '../types';

interface AiReadinessBentoCardProps {
    aiAnalysis?: {
        status: 'no_data' | 'generating' | 'ready' | 'failed' | 'no_exam_date';
        data: AiAnalysisData | null;
    };
}

export function AiReadinessBentoCard({
    aiAnalysis,
}: AiReadinessBentoCardProps) {
    const { auth, pusher } = usePage<{ auth: Auth; pusher?: any }>().props;
    const initialStatus = aiAnalysis?.status || 'no_data';
    const [localStatus, setLocalStatus] = useState(initialStatus);
    const [prevInitialStatus, setPrevInitialStatus] = useState(initialStatus);
    const [progress, setProgress] = useState(25);
    const data = aiAnalysis?.data;

    if (initialStatus !== prevInitialStatus) {
        setPrevInitialStatus(initialStatus);
        setLocalStatus(initialStatus);
    }

    useEffect(() => {
        if (localStatus !== 'generating') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProgress(25);

            return;
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 92) {
                    return 92;
                }

                const step = Math.floor(Math.random() * 8) + 4;

                return Math.min(prev + step, 92);
            });
        }, 400);

        return () => clearInterval(interval);
    }, [localStatus]);

    useEffect(() => {
        if (localStatus !== 'generating' || !auth?.user?.id || !pusher?.key) {
            return;
        }

        (window as any).Pusher = Pusher;
        const echo = new Echo({
            broadcaster: 'pusher',
            key: pusher.key,
            cluster: pusher.cluster ?? 'ap1',
            wsHost: pusher.host
                ? pusher.host
                : `ws-${pusher.cluster}.pusher.com`,
            wsPort: pusher.port ?? 80,
            wssPort: pusher.port ?? 443,
            forceTLS: (pusher.scheme ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        const channel = echo.private(`App.Models.User.${auth.user.id}`);

        channel.listen('.ai-analysis-ready', () => {
            setProgress(100);
            router.reload({ only: ['aiAnalysis'] });
        });

        channel.listen('.ai-analysis-failed', () => {
            setLocalStatus('failed');
        });

        return () => {
            channel.stopListening('.ai-analysis-ready');
            channel.stopListening('.ai-analysis-failed');
            echo.leave(`App.Models.User.${auth.user.id}`);
        };
    }, [localStatus, auth?.user?.id, pusher]);

    const prob = Math.round(data?.pass_probability ?? 0);
    const primaryWeakness = data?.critical_weaknesses?.[0];

    const getScoreColor = (score: number) => {
        if (score >= 80) {
            return {
                text: 'text-emerald-600 dark:text-emerald-400',
                stroke: 'stroke-emerald-500',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60',
            };
        }

        if (score >= 60) {
            return {
                text: 'text-amber-600 dark:text-amber-400',
                stroke: 'stroke-amber-500',
                badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60',
            };
        }

        return {
            text: 'text-rose-600 dark:text-rose-400',
            stroke: 'stroke-rose-500',
            badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60',
        };
    };

    const colors = getScoreColor(prob);

    // SVG Circular Gauge calculation
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (prob / 100) * circumference;

    return (
        <Card className="relative flex h-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                        <Brain className="size-4.5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            AI Readiness Predictor
                        </h2>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Based on real CSE exam weighted algorithm
                        </p>
                    </div>
                </div>

                {localStatus === 'ready' && data?.trend && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {data.trend === 'improving' && (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="size-3.5" /> Improving
                            </span>
                        )}
                        {data.trend === 'declining' && (
                            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                                <TrendingDown className="size-3.5" /> Declining
                            </span>
                        )}
                        {data.trend === 'stable' && (
                            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                <Minus className="size-3.5" /> Stable
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="my-4">
                {localStatus === 'ready' && data && (
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Circular Progress Gauge */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex size-24 shrink-0 items-center justify-center">
                                <svg
                                    className="size-full -rotate-90"
                                    viewBox="0 0 96 96"
                                >
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r={radius}
                                        className="stroke-slate-100 dark:stroke-slate-800"
                                        strokeWidth="8"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r={radius}
                                        className={`${colors.stroke} transition-all duration-1000 ease-out`}
                                        strokeWidth="8"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center text-center">
                                    <span
                                        className={`text-2xl font-black tracking-tight ${colors.text}`}
                                    >
                                        {prob}%
                                    </span>
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                        Pass Chance
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <span
                                    className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-extrabold ${colors.badge}`}
                                >
                                    {data.verdict || 'Ready for Testing'}
                                </span>
                                <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                                    {data.priority_action ||
                                        'Focus on targeted practice drills to raise your score.'}
                                </p>
                            </div>
                        </div>

                        {/* Top Weakness / Quick Fix Pill */}
                        {primaryWeakness && (
                            <div className="flex flex-col gap-1.5 rounded-xl border border-rose-200/80 bg-rose-50/50 p-3 sm:max-w-[200px] dark:border-rose-900/40 dark:bg-rose-950/20">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                                    <Target className="size-3.5 shrink-0" />
                                    <span>Priority Focus</span>
                                </div>
                                <p className="line-clamp-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    {primaryWeakness}
                                </p>
                                <Link
                                    href="/drills/smart-weakness"
                                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                                >
                                    <Zap className="size-3 fill-current" />
                                    <span>Fix in Drill</span>
                                    <ChevronRight className="size-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {localStatus === 'generating' && (
                    <div className="space-y-3 rounded-xl border border-blue-200/60 bg-blue-50/40 p-4 text-center dark:border-blue-900/40 dark:bg-blue-950/20">
                        <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                            <Loader2 className="size-4 animate-spin" />
                            <span>AI Coach is computing readiness...</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Analyzing past attempts across all CSE syllabus
                            subtopics
                        </p>
                    </div>
                )}

                {localStatus === 'no_data' && (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                        <Sparkles className="size-6 text-indigo-500 dark:text-indigo-400" />
                        <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                No Mock Exam Data Yet
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                Complete at least 1 mock exam to unlock your AI
                                passing probability and personalized coaching.
                            </p>
                        </div>
                        <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs font-bold"
                        >
                            <Link
                                href={
                                    examsIndex({
                                        query: { start: 'professional' },
                                    }).url
                                }
                            >
                                <Zap className="size-3.5 text-indigo-500" />
                                Take First Mock Exam
                            </Link>
                        </Button>
                    </div>
                )}

                {localStatus === 'no_exam_date' && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200/60 bg-amber-50/40 p-3.5 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>
                            No upcoming Civil Service Exam date is active. AI
                            timeline readiness will activate once an exam date
                            is set.
                        </span>
                    </div>
                )}

                {localStatus === 'failed' && (
                    <div className="flex items-center justify-between rounded-xl border border-rose-200/60 bg-rose-50/40 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="size-4 shrink-0" />
                            <span>AI Coach unavailable right now.</span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-bold"
                            onClick={() => router.reload()}
                        >
                            Retry
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                <Link
                    href="/analytics/ai-analysis"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    <span>View In-Depth AI Analysis</span>
                    <ChevronRight className="size-3.5" />
                </Link>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    Updated live
                </span>
            </div>
        </Card>
    );
}
