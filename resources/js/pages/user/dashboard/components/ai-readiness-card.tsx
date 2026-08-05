import { Link, router, usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import {
    Brain,
    Sparkles,
    Loader2,
    TrendingUp,
    TrendingDown,
    BookOpen,
    Zap,
    ChevronRight,
    Minus,
    Settings,
} from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip';
import type { Auth } from '@/types';

interface AiReadinessCardProps {
    aiAnalysis?: {
        status: 'no_data' | 'generating' | 'ready' | 'failed';
        data: {
            pass_probability: number;
            verdict: string;
            trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
            strengths: string[];
            critical_weaknesses: string[];
            priority_action: string;
            recommended_modules: string[];
            encouragement: string;
        } | null;
    };
    analysisMode?: 'ai' | 'instant';
    attemptId?: number;
}

export default function AiReadinessCard({
    aiAnalysis,
    analysisMode = 'instant',
    attemptId,
}: AiReadinessCardProps) {
    const { auth, pusher } = usePage<{ auth: Auth; pusher?: any }>().props;
    const initialStatus = aiAnalysis?.status || 'no_data';
    const [localStatus, setLocalStatus] = useState<
        'no_data' | 'generating' | 'ready' | 'failed'
    >(initialStatus);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const data = aiAnalysis?.data;

    const [progress, setProgress] = useState(15);

    const [prevInitialStatus, setPrevInitialStatus] = useState(initialStatus);

    if (initialStatus !== prevInitialStatus) {
        setPrevInitialStatus(initialStatus);
        setLocalStatus(initialStatus);
    }

    useEffect(() => {
        if (localStatus !== 'generating') {
            setProgress(15);
            return;
        }

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 92) return 92;
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

        channel.listen('.ai-analysis-failed', (e: any) => {
            setLocalStatus('failed');
            setErrorMessage(
                e?.message ||
                    'AI coach is currently busy. Please try again later.',
            );
        });

        return () => {
            channel.stopListening('.ai-analysis-ready');
            channel.stopListening('.ai-analysis-failed');
            echo.disconnect();
        };
    }, [localStatus, auth?.user?.id, pusher]);

    // Container style sharing across all states to guarantee consistent glassmorphism
    const containerClasses =
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 sm:p-6 text-slate-900 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/80 dark:to-indigo-950/20 dark:text-white dark:shadow-xl backdrop-blur-md';

    if (localStatus === 'failed') {
        return (
            <div className={containerClasses}>
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-rose-500/5 blur-3xl dark:bg-rose-500/10" />

                <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
                    <div className="flex flex-col items-center gap-4 md:flex-row">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:border-rose-900/50 dark:bg-rose-500/10 dark:bg-rose-950/30 dark:text-rose-400">
                            <Brain className="size-6" />
                        </div>
                        <div>
                            <h3 className="flex items-center justify-center gap-2 text-xl font-black tracking-tight text-slate-900 md:justify-start dark:text-white">
                                {analysisMode === 'ai'
                                    ? 'AI Readiness Report'
                                    : 'Readiness Report'}
                                <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:border-rose-500/20 dark:border-rose-900/50 dark:bg-rose-500/10 dark:bg-rose-950/30 dark:text-rose-400">
                                    Failed
                                </span>
                            </h3>
                            <p className="dark:text-slate-450 mt-1 text-base leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                                {errorMessage ||
                                    'Report generation failed. Please try again later.'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <Link
                            href="/exams"
                            className="group inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-extrabold text-white transition transition-all duration-300 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                        >
                            Take Exam &rarr;
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (localStatus === 'no_data') {
        return (
            <div className={containerClasses}>
                {/* Background decorative glows */}
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />

                <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
                    <div className="flex flex-col items-center gap-4 md:flex-row">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:border-blue-900/50 dark:bg-blue-500/10 dark:bg-blue-950/30 dark:text-blue-400">
                            <Brain className="size-6 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="flex items-center justify-center gap-2 text-xl font-black tracking-tight text-slate-900 md:justify-start dark:text-white">
                                {analysisMode === 'ai'
                                    ? 'AI Readiness Report'
                                    : 'Readiness Report'}
                                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:border-blue-500/20 dark:border-blue-900/50 dark:bg-blue-500/10 dark:bg-rose-950/30 dark:text-blue-400">
                                    Locked
                                </span>
                            </h3>
                            <p className="dark:text-slate-450 mt-1 text-base leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                                Complete your first exam to unlock your{' '}
                                {analysisMode === 'ai'
                                    ? 'AI Readiness Report'
                                    : 'Readiness Report'}
                                .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (localStatus === 'generating') {
        const radius = 28;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset =
            circumference - (progress / 100) * circumference;

        return (
            <div className={containerClasses}>
                {/* Background decorative glows */}
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />

                <div className="flex flex-col items-center justify-center gap-4 py-4 text-center sm:py-6">
                    <div className="relative flex size-18 items-center justify-center">
                        <svg
                            className="absolute inset-0 size-full -rotate-90"
                            viewBox="0 0 72 72"
                        >
                            <circle
                                cx="36"
                                cy="36"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="5"
                                fill="transparent"
                                className="text-blue-100 dark:text-blue-950/50"
                            />
                            <circle
                                cx="36"
                                cy="36"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="5"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="text-blue-600 transition-all duration-300 ease-out dark:text-blue-400"
                            />
                        </svg>
                        <span className="text-xs font-black tracking-tight text-blue-600 dark:text-blue-400">
                            {progress}%
                        </span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            {analysisMode === 'ai'
                                ? 'Analyzing Performance via AI...'
                                : 'Analyzing Performance...'}
                        </h3>
                        <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400">
                            {analysisMode === 'ai'
                                ? 'Our AI is evaluating your answers, calculating scores, and crafting your readiness report...'
                                : 'Our algorithms are evaluating your answers and calculating your readiness report...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (localStatus === 'ready' && data) {
        const prob = data.pass_probability;
        const radius = 40;
        const strokeWidth = 8;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (prob / 100) * circumference;

        // Dynamic visual attributes based on pass probability thresholds
        let strokeColor = 'stroke-emerald-600 dark:stroke-emerald-500';
        let textColor =
            'text-emerald-600 dark:text-emerald-400 dark:text-emerald-400';

        if (prob < 80) {
            strokeColor = 'stroke-rose-600 dark:stroke-rose-500';
            textColor = 'text-rose-600 dark:text-rose-400 dark:text-rose-400';
        }

        // Dynamic visual attributes based on user performance trends
        let TrendIcon = Minus;
        let trendLabel = 'Stable';
        let trendColor =
            'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-405 dark:border-slate-500/25';

        if (data.trend === 'improving') {
            TrendIcon = TrendingUp;
            trendLabel = 'Improving';
            trendColor =
                'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 border-emerald-200 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25';
        } else if (data.trend === 'declining') {
            TrendIcon = TrendingDown;
            trendLabel = 'Declining';
            trendColor =
                'bg-rose-50 dark:bg-rose-950/30 text-rose-700 border-rose-200 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25';
        } else if (data.trend === 'insufficient_data') {
            TrendIcon = Minus;
            trendLabel = 'Insufficient Data';
            trendColor =
                'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/25';
        }

        return (
            <div className={containerClasses}>
                {/* Background decorative glows */}
                <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
                <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl dark:bg-indigo-500/10" />

                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:border-blue-900/50 dark:bg-blue-500/10 dark:bg-blue-950/30 dark:text-blue-400">
                            <Brain className="size-5" />
                        </div>
                        <div>
                            <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">
                                {analysisMode === 'ai'
                                    ? 'AI Readiness Report'
                                    : 'Readiness Report'}
                                <Link
                                    href="/settings/preferences"
                                    title="Change analysis mode preference"
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider uppercase transition-all duration-200 hover:scale-105 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                        analysisMode === 'ai'
                                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    }`}
                                >
                                    {analysisMode === 'ai' ? (
                                        <>
                                            <Sparkles className="size-2.5" /> AI
                                            Powered
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="size-2.5" />{' '}
                                            Instant
                                        </>
                                    )}
                                </Link>
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                Smart coaching insights tailored to your exam
                                history
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Trend Badge */}
                        <div
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${trendColor}`}
                        >
                            <TrendIcon className="size-3.5 transition-transform group-hover:scale-110" />
                            {trendLabel}
                        </div>

                        {/* Preferences Cog Link */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/settings/preferences"
                                    title="Change analysis mode preference"
                                    className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-ring dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                >
                                    <Settings className="size-4" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                Change analysis mode preference
                            </TooltipContent>
                        </Tooltip>

                        {/* Full Report Link */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={
                                        attemptId
                                            ? `/analytics/ai-analysis?attempt_id=${attemptId}`
                                            : '/analytics/ai-analysis'
                                    }
                                    className="group inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-extrabold text-white transition transition-all duration-300 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                >
                                    Full Report &rarr;
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                View comprehensive diagnostic report
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="grid grid-cols-1 items-center gap-3 sm:gap-6 md:grid-cols-12">
                    {/* Prob Meter: 3 cols */}
                    <div className="flex flex-col items-center justify-center text-center md:col-span-3">
                        <div className="relative flex size-28 items-center justify-center">
                            {/* SVG Meter */}
                            <svg
                                className="absolute inset-0 size-full -rotate-90"
                                viewBox="0 0 112 112"
                            >
                                {/* Track */}
                                <circle
                                    cx="56"
                                    cy="56"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    className="text-slate-200/50 dark:text-slate-800/40"
                                />
                                {/* Value */}
                                <circle
                                    cx="56"
                                    cy="56"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    className={`${strokeColor} transition-all duration-500`}
                                />
                            </svg>
                            <div className="flex flex-col items-center justify-center">
                                <span
                                    className={`text-3xl font-black ${textColor}`}
                                >
                                    {prob}%
                                </span>
                            </div>
                        </div>
                        <span className="mt-2 text-[10px] font-black tracking-widest text-slate-500 uppercase dark:text-slate-400">
                            Passing Probability
                        </span>
                    </div>

                    {/* Verdict: 9 cols */}
                    <div className="flex flex-col gap-4 md:col-span-9">
                        <div>
                            <p className="text-base leading-relaxed font-bold text-slate-800 dark:text-slate-100">
                                {data.verdict}
                            </p>
                        </div>

                        {/* Strengths & Focus Areas */}
                        <div className="flex flex-col flex-wrap gap-x-6 gap-y-3 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    Strongest Areas:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.strengths &&
                                    data.strengths.length > 0 ? (
                                        data.strengths.map((strength) => {
                                            const cleanStrength = strength
                                                .replace(/\s*Ability\s*/g, '')
                                                .replace(
                                                    /\s*Information\s*/g,
                                                    '',
                                                );

                                            return (
                                                <span
                                                    key={strength}
                                                    className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:bg-emerald-950/30 dark:text-emerald-400"
                                                >
                                                    {cleanStrength}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 italic dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                                            No major strengths yet — keep
                                            reviewing!
                                        </span>
                                    )}
                                </div>
                            </div>

                            {data.critical_weaknesses &&
                                data.critical_weaknesses.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                            Focus Areas:
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {data.critical_weaknesses.map(
                                                (weakness) => {
                                                    const cleanWeakness =
                                                        weakness
                                                            .replace(
                                                                /\s*Ability\s*/g,
                                                                '',
                                                            )
                                                            .replace(
                                                                /\s*Information\s*/g,
                                                                '',
                                                            );

                                                    return (
                                                        <span
                                                            key={weakness}
                                                            className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-500/20 dark:border-rose-900/50 dark:bg-rose-500/10 dark:bg-rose-950/30 dark:text-rose-400"
                                                        >
                                                            {cleanWeakness}
                                                        </span>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>

                {/* Priority Action (Amber Box) */}
                <div className="dark:bg-amber-950/30/40 mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:border-amber-900/50 dark:bg-amber-500/5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-100 text-amber-600 dark:border-amber-500/20 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400">
                        <Zap className="size-4.5 fill-current" />
                    </div>
                    <div>
                        <span className="text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400">
                            Priority Action Item
                        </span>
                        <p className="mt-0.5 text-base leading-relaxed font-semibold text-slate-800 dark:text-slate-200">
                            {data.priority_action}
                        </p>
                    </div>
                </div>

                {/* Footer Modules & Encouragement */}
                <div className="mt-6 flex flex-col gap-4 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/60">
                    {/* Recommended modules */}
                    {data.recommended_modules &&
                        data.recommended_modules.length > 0 && (
                            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                                    <BookOpen className="size-3.5" />
                                    Study Today:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {data.recommended_modules.map((module) => (
                                        <Link
                                            key={module}
                                            href={`/learn?search=${encodeURIComponent(module)}`}
                                            className="group inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 transition transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                                        >
                                            {module}
                                            <ChevronRight className="size-3" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            </div>
        );
    }

    return null;
}
