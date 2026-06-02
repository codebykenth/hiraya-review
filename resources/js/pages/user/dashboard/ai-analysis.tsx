import { Head, Link, router, usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import {
    Brain,
    Sparkles,
    Loader2,
    ArrowLeft,
    Zap,
    Calendar,
    Target,
    Activity,
    BookOpen,
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronRight,
} from 'lucide-react';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/page-container';
import { Card } from '@/components/ui/card';

interface SubjectMasteryItem {
    subject: string;
    rating: string;
    color: 'rose' | 'amber' | 'emerald' | 'sky';
    insight: string;
}

interface RemediationItem {
    subtopic: string;
    difficulty_level: 'Hard' | 'Medium' | 'Easy';
    reason_for_struggle: string;
    coaching_tip: string;
}

interface StudyDay {
    day: string;
    focus_topic: string;
    activity: string;
    subcategory_id?: number | null;
}

interface ExistingSchedule {
    study_date: string;
    title: string;
    subcategory_id?: number | null;
}

interface AiAnalysisProps {
    status: 'no_data' | 'generating' | 'ready';
    isLocal?: boolean;
    existingSchedules?: ExistingSchedule[];
    data: {
        pass_probability: number;
        verdict: string;
        trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
        strengths: string[];
        critical_weaknesses: string[];
        priority_action: string;
        recommended_modules: string[];
        encouragement: string;
        predictive_metrics?: {
            estimated_exam_score: string;
            days_to_readiness: string;
            completion_pace: string;
            mock_pass_confidence: 'high' | 'moderate' | 'low';
        };
        subject_mastery?: SubjectMasteryItem[];
        timeline_prediction?: {
            current_stage: string;
            milestone_prediction: string;
            potential_score_improvement: string;
        };
        remediation_matrix?: RemediationItem[];
        personalized_7_day_plan?: StudyDay[];
        long_term_roadmap?: Array<{
            phase: string;
            focus: string;
            milestone: string;
        }>;
    } | null;
}

export default function AiAnalysisReport({
    status,
    data,
    isLocal,
    existingSchedules = [],
}: AiAnalysisProps) {
    const { auth, pusher } = usePage().props as any;
    const [localStatus, setLocalStatus] = useState<
        'no_data' | 'generating' | 'ready' | 'failed'
    >(status);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isOverloadModalOpen, setIsOverloadModalOpen] = useState(false);

    useEffect(() => {
        if (localStatus === 'failed') {
            setTimeout(() => {
                setIsOverloadModalOpen(true);
            }, 0);
        }
    }, [localStatus]);

    const [scheduledDays, setScheduledDays] = useState<Record<string, boolean>>(
        {},
    );
    const [schedulingDays, setSchedulingDays] = useState<
        Record<string, boolean>
    >({});

    const handleScheduleDay = async (dayPlan: StudyDay, index: number) => {
        setSchedulingDays((prev) => ({ ...prev, [dayPlan.day]: true }));
        const today = new Date();
        today.setDate(today.getDate() + index);
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const studyDateStr = `${yyyy}-${mm}-${dd}`;

        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';

        try {
            const response = await fetch('/study-schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    study_date: studyDateStr,
                    title: `Study: ${dayPlan.focus_topic}`,
                    description: dayPlan.activity,
                    subcategory_id: dayPlan.subcategory_id || null,
                }),
            });

            if (response.ok) {
                setScheduledDays((prev) => ({ ...prev, [dayPlan.day]: true }));
            }
        } catch (error) {
            console.error('Failed to schedule study day:', error);
        } finally {
            setSchedulingDays((prev) => ({ ...prev, [dayPlan.day]: false }));
        }
    };

    useEffect(() => {
        setTimeout(() => {
            setLocalStatus(status);
        }, 0);
    }, [status]);

    useEffect(() => {
        if (data?.personalized_7_day_plan && existingSchedules.length > 0) {
            const initialScheduled: Record<string, boolean> = {};
            data.personalized_7_day_plan.forEach((dayPlan, index) => {
                const today = new Date();
                today.setDate(today.getDate() + index);
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const studyDateStr = `${yyyy}-${mm}-${dd}`;

                const exists = existingSchedules.some(
                    (s) =>
                        s.study_date === studyDateStr &&
                        s.title === `Study: ${dayPlan.focus_topic}`,
                );

                if (exists) {
                    initialScheduled[dayPlan.day] = true;
                }
            });
            setTimeout(() => {
                setScheduledDays((prev) => ({ ...prev, ...initialScheduled }));
            }, 0);
        }
    }, [data, existingSchedules]);

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

        channel.listen('ai-analysis-ready', () => {
            router.reload({ only: ['data', 'status'] });
        });

        channel.listen('ai-analysis-failed', (e: any) => {
            setLocalStatus('failed');
            setErrorMessage(
                e.message ||
                    'All AI models are currently busy or rate-limited. Please try again.',
            );
        });

        return () => {
            channel.stopListening('ai-analysis-ready');
            channel.stopListening('ai-analysis-failed');
            echo.disconnect();
        };
    }, [localStatus, auth?.user?.id, pusher]);

    return (
        <>
            <Head>
                <title>
                    AI Readiness Diagnostic & Prediction Report | Hiraya Review
                </title>
                <meta
                    name="description"
                    content="Get deep predictive coaching insights, timeline readiness milestones, subtopic gaps, and your personalized 7-day study plan."
                />
            </Head>

            <PageContainer>
                {/* Back to Dashboard Link */}
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <ArrowLeft className="size-4" />
                        Back to Dashboard
                    </Link>
                </div>

                {/* Main Content States */}
                {localStatus === 'no_data' && (
                    <Card className="flex min-h-[400px] flex-col items-center justify-center border-2 border-dashed p-12 text-center">
                        <div className="border-blue-150 mb-5 flex size-16 items-center justify-center rounded-2xl border bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400">
                            <Brain className="size-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            AI Diagnostic Report Locked
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                            We need at least one exam attempt to analyze your
                            scores, identify weak areas, and generate your
                            predictive analysis.
                        </p>
                        <Link
                            href="/exams"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                        >
                            Take an Exam Now
                            <ChevronRight className="size-4" />
                        </Link>
                    </Card>
                )}

                {localStatus === 'generating' && (
                    <Card className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
                        <div className="relative mb-6 flex items-center justify-center">
                            <div className="absolute size-24 animate-ping rounded-full border-2 border-blue-500/20" />
                            <div className="border-blue-150 flex size-20 items-center justify-center rounded-full border bg-blue-50 text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400">
                                <Loader2 className="size-10 animate-spin" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Creating Your Predictive AI Diagnostic
                        </h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Hiraya AI is evaluating your historical exam
                            responses, calculating subtopic performance, and
                            scheduling your personalized study pathway. This
                            will auto-refresh as soon as it's completed.
                        </p>
                    </Card>
                )}

                {localStatus === 'failed' && (
                    <Card className="flex min-h-[400px] flex-col items-center justify-center border-rose-200/60 bg-rose-50/10 p-12 text-center dark:border-rose-900/30 dark:bg-rose-950/5">
                        <div className="border-rose-150 mb-5 flex size-16 items-center justify-center rounded-2xl border bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400">
                            <AlertCircle className="size-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            AI Diagnostic Report Failed
                        </h3>
                        <p className="text-slate-550 mt-2 max-w-2xl text-sm dark:text-slate-400">
                            {errorMessage ||
                                'Our AI systems are currently highly loaded or rate-limited across all fallbacks. Please try again.'}
                        </p>
                        <button
                            onClick={() => {
                                setLocalStatus('generating');
                                setErrorMessage(null);
                                router.visit('/dashboard/ai-analysis?retry=1', {
                                    replace: true,
                                    preserveScroll: true,
                                });
                            }}
                            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                        >
                            <Activity className="size-4 animate-pulse" />
                            Retry Diagnostic Generation
                        </button>
                    </Card>
                )}

                {localStatus === 'ready' && data && (
                    <div className="space-y-8">
                        {/* Header Banner */}
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 p-6 sm:p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950">
                            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />

                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-100 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                                        <Brain className="size-8 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                                                AI Diagnostic & Predictions
                                            </h1>
                                            <span className="border-indigo-150 inline-flex items-center gap-1 rounded-full border bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-indigo-700 uppercase dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                <Sparkles className="size-3" />
                                                Active Coach
                                            </span>
                                        </div>
                                        <p className="mt-1.5 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                                            Comprehensive predictive report
                                            analyzing accuracy, confidence
                                            intervals, remediation pathways, and
                                            study calendars.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex shrink-0 flex-col items-end gap-2">
                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                        Last Updated Today
                                    </span>
                                    {isLocal && (
                                        <button
                                            onClick={() => {
                                                setLocalStatus('generating');
                                                setErrorMessage(null);
                                                router.visit(
                                                    '/dashboard/ai-analysis?retry=1',
                                                    {
                                                        replace: true,
                                                        preserveScroll: true,
                                                    },
                                                );
                                            }}
                                            className="text-emerald-650 dark:bg-emerald-550/10 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-600/10 px-2.5 py-1 text-[10px] font-black uppercase transition hover:bg-emerald-600/20 dark:text-emerald-400"
                                        >
                                            <Sparkles className="size-3" />
                                            Generate Again
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Predictive Grid */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                            {/* Score Gages / Primary metrics: 4 cols */}
                            <div className="space-y-6 lg:col-span-4">
                                <Card className="flex h-full flex-col items-center justify-between bg-gradient-to-br from-white to-slate-50/50 p-6 text-center dark:from-slate-950 dark:to-slate-900/60">
                                    <span className="text-xs font-black tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                        Pass Probability
                                    </span>

                                    <div className="relative my-6 flex size-40 items-center justify-center">
                                        <svg
                                            className="absolute inset-0 size-full -rotate-90"
                                            viewBox="0 0 160 160"
                                        >
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="68"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="transparent"
                                                className="text-slate-100 dark:text-slate-800/60"
                                            />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="68"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={
                                                    2 * Math.PI * 68
                                                }
                                                strokeDashoffset={
                                                    2 * Math.PI * 68 -
                                                    (data.pass_probability /
                                                        100) *
                                                        (2 * Math.PI * 68)
                                                }
                                                strokeLinecap="round"
                                                className={`transition-all duration-500 ${
                                                    data.pass_probability >= 70
                                                        ? 'text-emerald-500'
                                                        : data.pass_probability >=
                                                            50
                                                          ? 'text-amber-500'
                                                          : 'text-rose-500'
                                                }`}
                                            />
                                        </svg>
                                        <div className="flex flex-col items-center justify-center">
                                            <span
                                                className={`text-4xl font-black ${
                                                    data.pass_probability >= 70
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : data.pass_probability >=
                                                            50
                                                          ? 'text-amber-600 dark:text-amber-400'
                                                          : 'text-rose-600 dark:text-rose-400'
                                                }`}
                                            >
                                                {data.pass_probability}%
                                            </span>
                                            <span className="mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                                Predictive Rate
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full border-t border-slate-100 pt-4 dark:border-slate-800/80">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-slate-400">
                                                Confidence Level
                                            </span>
                                            <span
                                                className={`font-bold capitalize ${
                                                    data.predictive_metrics
                                                        ?.mock_pass_confidence ===
                                                    'high'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : data
                                                                .predictive_metrics
                                                                ?.mock_pass_confidence ===
                                                            'moderate'
                                                          ? 'text-amber-600 dark:text-amber-400'
                                                          : 'text-rose-600 dark:text-rose-400'
                                                }`}
                                            >
                                                {data.predictive_metrics
                                                    ?.mock_pass_confidence ||
                                                    'moderate'}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Detailed predictive metrics: 8 cols */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-8">
                                {/* Estimated Exam Score */}
                                <Card className="flex flex-col justify-between p-6 transition hover:shadow-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                                            <Target className="size-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                                Estimated Exam Score
                                            </span>
                                            <h4 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
                                                {data.predictive_metrics
                                                    ?.estimated_exam_score ||
                                                    '70% - 75% Projected'}
                                            </h4>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                        Calculated based on your subtopic
                                        weights and simulated exam durations.
                                        Philippine CSE passing threshold is 80%.
                                    </p>
                                </Card>

                                {/* Days to Readiness */}
                                <Card className="flex flex-col justify-between p-6 transition hover:shadow-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                            <Clock className="size-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                                Days to Readiness
                                            </span>
                                            <h4 className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white">
                                                {data.predictive_metrics
                                                    ?.days_to_readiness ||
                                                    '18 Days to Mastery'}
                                            </h4>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                        Estimated number of daily study cycles
                                        and category drills needed to reliably
                                        hit over 80% accuracy.
                                    </p>
                                </Card>

                                {/* Completion Pace */}
                                <Card className="flex flex-col justify-between p-6 transition hover:shadow-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                            <Activity className="size-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                                Completion Pace
                                            </span>
                                            <h4 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                                                {data.predictive_metrics
                                                    ?.completion_pace ||
                                                    'Pace is currently balanced.'}
                                            </h4>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                        Analyzes the relationship between
                                        correct solutions and response times per
                                        category to catch careless patterns.
                                    </p>
                                </Card>

                                {/* Timeline / Milestone */}
                                <Card className="flex flex-col justify-between p-6 transition hover:shadow-md">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                            <Zap className="size-5" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                                Current Phase
                                            </span>
                                            <h4 className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                                                {data.timeline_prediction
                                                    ?.current_stage ||
                                                    'Foundation Phase'}
                                            </h4>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                        Milestone:{' '}
                                        {data.timeline_prediction
                                            ?.milestone_prediction ||
                                            'Study regularly to predict upcoming milestones.'}
                                    </p>
                                </Card>
                            </div>
                        </div>

                        {/* Honesty Coach Banner */}
                        <div className="border-blue-150 flex items-start gap-4 rounded-2xl border bg-blue-50/30 p-5 dark:border-slate-800 dark:bg-slate-900/40">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Sparkles
                                    className="size-5 animate-spin"
                                    style={{ animationDuration: '6s' }}
                                />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                    AI Coach Diagnostic Verdict
                                </h4>
                                <p className="mt-1 text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                                    {data.verdict}
                                </p>
                            </div>
                        </div>

                        {/* Subject Mastery Ratings */}
                        {data.subject_mastery &&
                            data.subject_mastery.length > 0 && (
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                                        <Target className="size-5 text-indigo-600 dark:text-indigo-400" />
                                        Detailed Subject Mastery
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {data.subject_mastery.map((item) => {
                                            let dotColor = 'bg-slate-400';
                                            let ratingClass =
                                                'bg-slate-100 text-slate-700 border-slate-200';

                                            if (item.color === 'rose') {
                                                dotColor = 'bg-rose-500';
                                                ratingClass =
                                                    'bg-rose-50 text-rose-700 border-rose-250 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40';
                                            } else if (item.color === 'amber') {
                                                dotColor = 'bg-amber-500';
                                                ratingClass =
                                                    'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40';
                                            } else if (
                                                item.color === 'emerald'
                                            ) {
                                                dotColor = 'bg-emerald-500';
                                                ratingClass =
                                                    'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40';
                                            } else if (item.color === 'sky') {
                                                dotColor = 'bg-sky-500';
                                                ratingClass =
                                                    'bg-sky-50 text-sky-700 border-sky-250 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40';
                                            }

                                            return (
                                                <Card
                                                    key={item.subject}
                                                    className="flex flex-col justify-between gap-4 p-5 transition hover:shadow-md"
                                                >
                                                    <div>
                                                        <div className="dark:border-slate-850 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                            <span className="text-slate-850 flex items-center gap-2 text-sm font-bold dark:text-slate-200">
                                                                <span
                                                                    className={`size-2.5 rounded-full ${dotColor}`}
                                                                />
                                                                {item.subject}
                                                            </span>
                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${ratingClass}`}
                                                            >
                                                                {item.rating}
                                                            </span>
                                                        </div>
                                                        <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                                            {item.insight}
                                                        </p>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* Remediation Matrix Table */}
                        {data.remediation_matrix &&
                            data.remediation_matrix.length > 0 && (
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                                        <AlertCircle className="text-rose-555 size-5" />
                                        Subtopic Remediation Pathway
                                    </h3>
                                    <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-slate-200/80 bg-slate-50/80 font-extrabold text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                                                        <th className="w-1/4 p-4">
                                                            Subtopic
                                                        </th>
                                                        <th className="w-1/6 p-4">
                                                            Difficulty
                                                        </th>
                                                        <th className="w-1/3 p-4">
                                                            Reason for Struggle
                                                        </th>
                                                        <th className="p-4">
                                                            Coaching Tip
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-slate-150 dark:divide-slate-850 divide-y">
                                                    {data.remediation_matrix.map(
                                                        (row) => (
                                                            <tr
                                                                key={
                                                                    row.subtopic
                                                                }
                                                                className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20"
                                                            >
                                                                <td className="p-4 font-bold text-slate-900 dark:text-white">
                                                                    {
                                                                        row.subtopic
                                                                    }
                                                                </td>
                                                                <td className="p-4">
                                                                    <span
                                                                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${
                                                                            row.difficulty_level ===
                                                                            'Hard'
                                                                                ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400'
                                                                                : row.difficulty_level ===
                                                                                    'Medium'
                                                                                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400'
                                                                                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400'
                                                                        }`}
                                                                    >
                                                                        {
                                                                            row.difficulty_level
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="p-4 leading-normal font-medium text-slate-600 dark:text-slate-400">
                                                                    {
                                                                        row.reason_for_struggle
                                                                    }
                                                                </td>
                                                                <td className="p-4 leading-relaxed font-semibold text-slate-700 dark:text-slate-300">
                                                                    {
                                                                        row.coaching_tip
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>
                            )}

                        {/* Dynamic Personalized Calendar */}
                        {data.personalized_7_day_plan &&
                            data.personalized_7_day_plan.length > 0 && (
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                                        <Calendar className="size-5 text-emerald-600 dark:text-emerald-400" />
                                        Your Personalized{' '}
                                        {data.personalized_7_day_plan.length}
                                        -Day Action Plan
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                                        {data.personalized_7_day_plan.map(
                                            (dayPlan, index) => (
                                                <Card
                                                    key={dayPlan.day}
                                                    className="flex flex-col justify-between gap-3 p-4 transition duration-300 hover:border-blue-400 dark:hover:border-blue-700"
                                                >
                                                    <div>
                                                        <div className="dark:border-slate-850 mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                                                            <span className="text-xs font-black text-indigo-600 uppercase dark:text-indigo-400">
                                                                {dayPlan.day}
                                                            </span>
                                                            <BookOpen className="size-3.5 text-slate-400" />
                                                        </div>
                                                        <span className="text-slate-850 block text-xs leading-tight font-bold dark:text-slate-200">
                                                            {
                                                                dayPlan.focus_topic
                                                            }
                                                        </span>
                                                        <p className="mt-2 text-[11px] leading-relaxed text-slate-500 italic dark:text-slate-400">
                                                            {dayPlan.activity}
                                                        </p>
                                                    </div>

                                                    <div className="dark:border-slate-850 mt-2 border-t border-slate-100/80 pt-2">
                                                        {scheduledDays[
                                                            dayPlan.day
                                                        ] ? (
                                                            <span className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700 uppercase dark:bg-emerald-500/10 dark:text-emerald-400">
                                                                <CheckCircle2 className="size-3" />
                                                                Scheduled
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleScheduleDay(
                                                                        dayPlan,
                                                                        index,
                                                                    )
                                                                }
                                                                disabled={
                                                                    schedulingDays[
                                                                        dayPlan
                                                                            .day
                                                                    ]
                                                                }
                                                                className="inline-flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-700 uppercase transition hover:bg-indigo-100 disabled:opacity-50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20"
                                                            >
                                                                {schedulingDays[
                                                                    dayPlan.day
                                                                ] ? (
                                                                    <Loader2 className="size-3 animate-spin" />
                                                                ) : (
                                                                    <Calendar className="size-3" />
                                                                )}
                                                                Schedule
                                                            </button>
                                                        )}
                                                    </div>
                                                </Card>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Phased Strategic Roadmap */}
                        {data.long_term_roadmap &&
                            data.long_term_roadmap.length > 0 && (
                                <div className="mt-8 border-t border-slate-200/80 pt-8 dark:border-slate-800">
                                    <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                                        <Sparkles className="size-5 animate-pulse text-amber-500" />
                                        Long-Term Phased Study Roadmap (Day 15+)
                                    </h3>
                                    <div className="relative ml-4 space-y-6 border-l-2 border-slate-200 pl-6 dark:border-slate-800">
                                        {data.long_term_roadmap.map(
                                            (phaseItem) => (
                                                <div
                                                    key={phaseItem.phase}
                                                    className="relative"
                                                >
                                                    {/* Glowing timeline dot */}
                                                    <div className="absolute top-1.5 -left-[31px] flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-4 ring-white dark:ring-slate-900">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                                    </div>
                                                    <div>
                                                        <span className="border-amber-250 inline-flex items-center rounded-full border bg-amber-50 px-2.5 py-0.5 text-xs font-black tracking-wider text-amber-800 uppercase dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
                                                            {phaseItem.phase}
                                                        </span>
                                                        <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                                                            Focus Area:{' '}
                                                            {phaseItem.focus}
                                                        </h4>
                                                        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                                                            Milestone Target:{' '}
                                                            {
                                                                phaseItem.milestone
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Encouragement Footer */}
                        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row dark:border-slate-800">
                            <p className="text-xs text-slate-500 italic dark:text-slate-400">
                                "{data.encouragement}"
                            </p>
                            {/* <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-250 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                            >
                                Back to Dashboard
                            </Link> */}
                        </div>
                    </div>
                )}
            </PageContainer>

            {/* System Under Heavy Load Modal */}
            {isOverloadModalOpen && (
                <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl animate-in overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl transition-all duration-200 zoom-in-95 fade-in dark:border-slate-800 dark:bg-slate-900">
                        {/* Decorative Background */}
                        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl" />

                        <div className="flex flex-col items-center p-2 text-center">
                            <div className="mb-5 flex size-16 animate-bounce items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400">
                                <AlertCircle className="size-8" />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                AI Coach Under Heavy Load
                            </h3>

                            <p className="text-slate-650 mt-3 text-sm leading-relaxed dark:text-slate-400">
                                Our AI coaching system is currently experiencing
                                extremely high traffic from other civil service
                                review students.
                            </p>

                            <p className="mt-2 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                To ensure highly accurate predictions and
                                prevent system failures, generation requests are
                                queued. Your analysis is currently delayed or
                                has been successfully queued in the background.
                            </p>

                            <p className="text-indigo-650 mt-3 text-xs font-bold dark:text-indigo-400">
                                💡 Tip: You can close this, continue practicing
                                drills, and check back in a few minutes!
                            </p>

                            <div className="mt-6 flex w-full gap-3">
                                <button
                                    onClick={() =>
                                        setIsOverloadModalOpen(false)
                                    }
                                    className="flex-1 cursor-pointer rounded-xl bg-slate-100 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Continue Studying
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOverloadModalOpen(false);
                                        setLocalStatus('generating');
                                        setErrorMessage(null);
                                        router.visit(
                                            '/dashboard/ai-analysis?retry=1',
                                            {
                                                replace: true,
                                                preserveScroll: true,
                                            },
                                        );
                                    }}
                                    className="flex-1 cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                                >
                                    Retry Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

AiAnalysisReport.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'AI Diagnostic Report',
            href: '/dashboard/ai-analysis',
        },
    ],
};
