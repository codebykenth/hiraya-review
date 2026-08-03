import { Head, Link, usePage } from '@inertiajs/react';
import { Award, BookOpen, ChevronLeft, LogIn, Trophy } from 'lucide-react';
import { useState } from 'react';
import { formatDuration } from '@/lib/exam-formatters';
import AiReadinessCard from '@/pages/user/dashboard/components/ai-readiness-card';

interface ScorecardViewProps {
    details: any;
    isDrillSession: boolean;
    drillCategoryName: string | null;
    savedAttempt: any;
    results: any;
    isTimed: boolean;
    getActiveTimeLimitSecs: () => number;
    submittedByTimer: boolean;
    setReviewScreenActive: (val: boolean) => void;
    handleBeginExam: () => void;
    aiAnalysis?: any;
}

export function ScorecardView({
    details,
    isDrillSession,
    drillCategoryName,
    savedAttempt,
    results,
    isTimed,
    getActiveTimeLimitSecs,
    submittedByTimer,
    setReviewScreenActive,
    aiAnalysis,
}: ScorecardViewProps) {
    const { auth } = usePage<{ auth: any }>().props;
    const isGuest = !auth?.user;
    const GUEST_PROMPT_KEY = 'guest_prompt_dismissed';
    const [showGuestPrompt, setShowGuestPrompt] = useState(
        () => isGuest && sessionStorage.getItem(GUEST_PROMPT_KEY) !== '1',
    );

    const dismissGuestPrompt = () => {
        sessionStorage.setItem(GUEST_PROMPT_KEY, '1');
        setShowGuestPrompt(false);
    };

    const elapsedSecs = results?.elapsedSecs ?? 0;
    const remainingSecs = isTimed
        ? Math.max(0, getActiveTimeLimitSecs() - elapsedSecs)
        : 0;
    const elapsedText = formatDuration(elapsedSecs);
    const underLimitText =
        remainingSecs > 0
            ? `${formatDuration(remainingSecs, false)} under limit`
            : 'Used full time limit';

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="animate-in duration-200 fade-in">
            <Head
                title={
                    isDrillSession
                        ? `Scorecard: ${drillCategoryName || savedAttempt?.cat_scores?.metadata?.category_name || 'Practice Drill'}`
                        : `Scorecard: ${details.title}`
                }
            />

            {(() => {
                const params = new URLSearchParams(
                    typeof window !== 'undefined' ? window.location.search : '',
                );
                const fromHistory = params.get('from') === 'history';

                if (savedAttempt && fromHistory) {
                    return (
                        <Link
                            href="/history"
                            className="group mb-4 flex w-fit cursor-pointer items-center gap-1 text-xs font-black text-slate-800 transition transition-all duration-300 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400 dark:text-white dark:hover:text-blue-400"
                        >
                            <ChevronLeft className="size-4" /> Back to History
                        </Link>
                    );
                }

                return null;
            })()}

            {(() => {
                const params = new URLSearchParams(
                    typeof window !== 'undefined' ? window.location.search : '',
                );
                const limitReached = params.get('limit') === '1';

                if (limitReached) {
                    return (
                        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-blue-100 p-1 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                    <svg
                                        className="size-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xs font-black text-blue-800 dark:text-blue-300">
                                        Free Guest Attempt Limit Reached
                                    </h4>
                                    <p className="mt-1 text-xs leading-relaxed text-blue-700 dark:text-blue-400">
                                        You are limited to 1 free guest mock
                                        exam attempt. Please{' '}
                                        <Link
                                            href="/register"
                                            className="font-bold underline hover:text-blue-800 dark:hover:text-blue-200"
                                        >
                                            register a free account
                                        </Link>{' '}
                                        or{' '}
                                        <Link
                                            href="/login"
                                            className="font-bold underline hover:text-blue-800 dark:hover:text-blue-200"
                                        >
                                            sign in
                                        </Link>{' '}
                                        to take more mock exams.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                }

                return null;
            })()}

            <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/30 dark:bg-blue-950/40 dark:text-blue-400">
                        <Award className="size-3" /> Review Panel
                    </span>
                    <h1 className="mt-1 font-heading text-xl font-black tracking-tight text-slate-900 sm:text-3xl sm:text-4xl md:text-3xl dark:text-white">
                        {isDrillSession ? 'Drill Results' : 'Exam Results'}
                    </h1>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                        Completed on{' '}
                        {(() => {
                            const dateObj = savedAttempt?.created_at
                                ? new Date(savedAttempt.created_at)
                                : new Date();
                            const formattedDate = dateObj.toLocaleDateString(
                                'en-US',
                                {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                },
                            );
                            const formattedTime = dateObj.toLocaleTimeString(
                                'en-US',
                                {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true,
                                },
                            );

                            return `${formattedDate} at ${formattedTime}`;
                        })()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setReviewScreenActive(true)}
                        className="shadow-sm flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-blue-700 active:scale-95 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-500"
                    >
                        <BookOpen className="size-3.5" /> View Review
                    </button>
                </div>
            </div>

            {submittedByTimer && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:border-amber-900/50 dark:bg-amber-950/20 dark:bg-amber-950/30 dark:text-amber-300">
                    Time expired — your exam was submitted automatically and
                    your scorecard is shown below.
                </div>
            )}

            {results &&
                (() => {
                    const exactPercentage =
                        results.total > 0
                            ? (results.correctCount / results.total) * 100
                            : 0;
                    const formattedPercentage = (
                        Math.trunc(exactPercentage * 100) / 100
                    ).toFixed(2);
                    const strokeDashoffsetExact =
                        circumference - (exactPercentage / 100) * circumference;

                    return (
                        <div className="mt-4 flex flex-col gap-4">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5 md:p-6 dark:border-slate-800 dark:bg-slate-900">
                                {/* Top Section: Circle & Categories */}
                                <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                                    {/* Circle Percentage */}
                                    <div className="flex w-full shrink-0 flex-col items-center sm:w-64 lg:w-72">
                                        <div className="relative flex flex-col items-center justify-center">
                                            <div className="relative flex size-32 items-center justify-center sm:size-48">
                                                <svg
                                                    className="size-full -rotate-90"
                                                    viewBox="0 0 100 100"
                                                >
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r={radius}
                                                        className="fill-none stroke-slate-200 dark:stroke-slate-800"
                                                        strokeWidth="7"
                                                    />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r={radius}
                                                        className={`fill-none transition-all duration-500 ${exactPercentage >= 80 ? 'stroke-emerald-600 dark:stroke-emerald-500' : 'stroke-rose-600 dark:stroke-rose-500'}`}
                                                        strokeWidth="7"
                                                        strokeDasharray={
                                                            circumference
                                                        }
                                                        strokeDashoffset={
                                                            strokeDashoffsetExact
                                                        }
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span
                                                        className={`text-2xl leading-none font-black tracking-tight sm:text-4xl ${exactPercentage >= 80 ? 'text-slate-800 dark:text-white' : 'text-rose-600 dark:text-rose-400'}`}
                                                    >
                                                        {formattedPercentage}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-col items-center gap-1 sm:mt-4 sm:gap-1.5">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase sm:px-3 sm:py-1 sm:text-xs ${exactPercentage >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}
                                                >
                                                    {exactPercentage >= 80
                                                        ? 'PASSED'
                                                        : 'FAILED'}
                                                </span>
                                                <p className="mt-0.5 text-center text-xs leading-relaxed leading-tight font-semibold text-slate-500 sm:mt-1 sm:text-sm dark:text-slate-400">
                                                    Final Grade
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Breakdown */}
                                    <div className="flex w-full flex-1 flex-col">
                                        <div className="flex flex-col gap-2 sm:gap-3">
                                            {Object.entries(
                                                results.categoryScoreMap || {},
                                            ).map(
                                                ([cat, val]: [string, any]) => {
                                                    const catExactPct =
                                                        val.total > 0
                                                            ? (val.correct /
                                                                  val.total) *
                                                              100
                                                            : 0;
                                                    const catFormattedPct = (
                                                        Math.trunc(
                                                            catExactPct * 100,
                                                        ) / 100
                                                    ).toFixed(2);

                                                    return (
                                                        <div
                                                            key={cat}
                                                            className="rounded-xl border border-border bg-card p-2.5 transition-all duration-300 hover:shadow-sm sm:p-3.5"
                                                        >
                                                            <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                                                                <span className="truncate pr-2 text-[10px] font-black tracking-wider text-foreground uppercase sm:text-sm">
                                                                    {cat}
                                                                </span>
                                                                <span
                                                                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:text-xs ${catExactPct >= 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'}`}
                                                                >
                                                                    {
                                                                        catFormattedPct
                                                                    }
                                                                    %
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                                <div className="h-1 flex-1 rounded-full bg-muted sm:h-1.5">
                                                                    <div
                                                                        className={`h-1 rounded-full transition-all duration-1000 sm:h-1.5 ${catExactPct >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                        style={{
                                                                            width: `${catExactPct}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="w-8 text-right text-[10px] font-bold text-muted-foreground sm:w-10 sm:text-xs">
                                                                    {
                                                                        val.correct
                                                                    }
                                                                    /{val.total}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Section: 4 Stat Boxes */}
                                <div className="mt-4 grid w-full grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4 dark:border-slate-800">
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-slate-950/40">
                                        <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                                            Correct
                                        </span>
                                        <p className="mt-1.5 text-2xl font-black text-emerald-600 sm:text-3xl dark:text-emerald-400">
                                            {results.correctCount}
                                        </p>
                                        <span className="mt-1 text-xs font-bold text-slate-400">
                                            of {results.total}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-slate-950/40">
                                        <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                                            Incorrect
                                        </span>
                                        <p className="mt-1.5 text-2xl font-black text-rose-600 sm:text-3xl dark:text-rose-400">
                                            {results.wrongCount}
                                        </p>
                                        <span className="mt-1 text-xs font-bold text-slate-400">
                                            of {results.total}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-slate-950/40">
                                        <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                                            Skipped
                                        </span>
                                        <p className="mt-1.5 text-2xl font-black text-slate-500 sm:text-3xl">
                                            {results.skippedCount}
                                        </p>
                                        <span className="mt-1 text-xs font-bold text-slate-400">
                                            unanswered
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center dark:border-slate-800 dark:bg-slate-950/40">
                                        <span className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
                                            Time
                                        </span>
                                        <p className="mt-1.5 text-2xl font-black text-blue-600 sm:text-3xl dark:text-blue-400">
                                            {elapsedText}
                                        </p>
                                        <span className="mt-1 w-full truncate px-1 text-xs font-bold text-slate-400">
                                            {underLimitText}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src="/images/hiraya_logo_cropped.png"
                                            alt="Hiraya Review Logo"
                                            className="size-5 shrink-0 object-contain dark:brightness-110"
                                        />
                                        <span className="font-heading text-xs font-black tracking-widest text-slate-700 uppercase dark:text-slate-300">
                                            Hiraya Review
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400/90 dark:text-slate-500">
                                        hirayareview.com • Civil Service Exam
                                        Simulator
                                    </span>
                                </div>
                            </div>

                            {/* AI / Deterministic Readiness Report Card */}
                            {!isGuest && aiAnalysis && (
                                <div className="mt-4">
                                    <AiReadinessCard
                                        aiAnalysis={aiAnalysis}
                                        analysisMode={auth?.user?.analysis_mode}
                                        attemptId={savedAttempt?.id}
                                    />
                                </div>
                            )}

                            {isGuest && (
                                <div className="mt-6 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/30 p-6 text-center shadow-lg dark:border-blue-950/40 dark:from-slate-900 dark:to-slate-950">
                                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500">
                                        <Trophy className="size-6 animate-pulse" />
                                    </div>
                                    <h3 className="font-heading text-lg font-black tracking-tight text-slate-900 sm:text-xl dark:text-white">
                                        Don't Lose Your Mock Exam Score!
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                        Register a free account now to instantly
                                        save this attempt to your progress
                                        history, view item-by-item analytics,
                                        and access AI-powered diagnostic
                                        reviews.
                                    </p>
                                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Link
                                            href="/register"
                                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/35 focus:outline-none active:scale-95 sm:w-auto"
                                        >
                                            <LogIn className="size-4 transition-transform group-hover:translate-x-0.5" />
                                            Register Free Account & Save
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

            {showGuestPrompt && (
                <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in">
                    <div
                        className="relative flex flex-col w-[calc(100vw-2rem)] sm:w-full max-w-2xl max-h-[85dvh] overflow-y-auto animate-in rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-200 zoom-in-95 dark:border-slate-800 dark:bg-slate-950"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex flex-col items-center text-center">
                            <div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Trophy className="size-8" />
                            </div>
                            <h3 className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                Mock Exam Completed!
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                Great job on finishing the exam! Your score is
                                shown behind this window.
                            </p>
                            <p className="mt-3 text-xs leading-relaxed font-semibold text-amber-600 dark:text-amber-400">
                                ⚠️ To save this attempt permanently in your
                                history, access detailed performance analytics,
                                and use our AI Diagnostic features, please
                                create an account.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-col gap-2.5">
                            <Link
                                href="/register"
                                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition transition-all duration-300 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                            >
                                <LogIn className="size-4" />
                                Create a Free Account
                            </Link>
                            <button
                                type="button"
                                onClick={dismissGuestPrompt}
                                className="group flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition transition-all duration-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                View Scorecard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
