import { Head, Link, usePage, router } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    ChevronLeft,
    LogIn,
    Trophy,
    RotateCcw,
    Zap,
    Target,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Clock,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
    formatDuration,
    calculateWeightedPercentage,
} from '@/lib/exam-formatters';
import { makeBackOnClick, resolveOriginFromUrl } from '@/lib/smart-back';
import type {
    SimulationDetails,
    SavedAttempt,
    ExamResults,
    AiAnalysisResult,
    ReviewStatusFilter,
    Question,
} from '../types';

interface ScorecardViewProps {
    details: SimulationDetails;
    activeQuestions?: Question[];
    setCurrentIdx?: (idx: number) => void;
    answers?: Record<number, number>;
    isDrillSession: boolean;
    drillCategoryName: string | null;
    savedAttempt?: SavedAttempt | null;
    results: ExamResults | null;
    isTimed: boolean;
    getActiveTimeLimitSecs: () => number;
    submittedByTimer: boolean;
    setReviewScreenActive: (val: boolean) => void;
    setReviewCategoryFilter?: (cat: string) => void;
    setReviewStatusFilter?: (status: ReviewStatusFilter) => void;
    handleBeginExam: () => void;
    aiAnalysis?: AiAnalysisResult;
}

export function ScorecardView({
    details,
    activeQuestions,
    setCurrentIdx,
    answers,
    isDrillSession,
    drillCategoryName,
    savedAttempt,
    results,
    isTimed,
    getActiveTimeLimitSecs,
    submittedByTimer,
    setReviewScreenActive,
    setReviewCategoryFilter,
    setReviewStatusFilter,
    handleBeginExam,
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

    const isDrill = isDrillSession || savedAttempt?.cat_scores?.metadata?.category_name != null;
    const isActuallyTimed = isTimed && (savedAttempt ? savedAttempt.cat_scores?.metadata?.is_timed !== false : true);

    const activeTimeLimitSecs = useMemo(() => {
        if (!isActuallyTimed) {
return 0;
}

        if (isDrill) {
            const qCount = results?.total || activeQuestions?.length || 10;

            return qCount * 60;
        }

        return getActiveTimeLimitSecs();
    }, [isActuallyTimed, isDrill, results?.total, activeQuestions?.length, getActiveTimeLimitSecs]);

    const elapsedSecs = results?.elapsedSecs ?? 0;
    const remainingSecs = isActuallyTimed && activeTimeLimitSecs > 0
        ? Math.max(0, activeTimeLimitSecs - elapsedSecs)
        : 0;

    const elapsedText = formatDuration(elapsedSecs);
    const underLimitText = !isActuallyTimed
        ? 'Self-paced (Untimed)'
        : remainingSecs > 0
        ? `${formatDuration(remainingSecs, false)} under limit`
        : 'Used full time limit';

    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const handleReviewAll = () => {
        if (setReviewStatusFilter) {
            setReviewStatusFilter('all');
        }

        if (setReviewCategoryFilter) {
            setReviewCategoryFilter('All Categories');
        }

        if (setCurrentIdx && activeQuestions && activeQuestions.length > 0) {
            const firstScoredIdx = activeQuestions.findIndex(
                (q) => !q.isDemographic && q.category !== 'Demographic Profile',
            );
            setCurrentIdx(firstScoredIdx !== -1 ? firstScoredIdx : 0);
        }

        setReviewScreenActive(true);
    };

    const handleReviewMistakes = () => {
        if (setReviewStatusFilter) {
            setReviewStatusFilter('incorrect');
        }

        if (setReviewCategoryFilter) {
            setReviewCategoryFilter('All Categories');
        }

        if (setCurrentIdx && activeQuestions && answers) {
            const firstMistakeIdx = activeQuestions.findIndex((q, idx) => {
                const isDemographic =
                    q.category === 'Demographic Profile' || q.isDemographic;

                if (isDemographic) {
return false;
}

                const chosen = answers[idx];

                return (
                    chosen !== undefined &&
                    chosen !== null &&
                    Number(chosen) !== Number(q.correct_option)
                );
            });

            if (firstMistakeIdx !== -1) {
                setCurrentIdx(firstMistakeIdx);
            }
        }

        setReviewScreenActive(true);
    };

    const handleCategoryClick = (catName: string) => {
        if (setReviewCategoryFilter) {
            setReviewCategoryFilter(catName);
        }

        if (setReviewStatusFilter) {
            setReviewStatusFilter('all');
        }

        if (setCurrentIdx && activeQuestions && activeQuestions.length > 0) {
            const firstCatIdx = activeQuestions.findIndex(
                (q) => q.category === catName,
            );

            if (firstCatIdx !== -1) {
                setCurrentIdx(firstCatIdx);
            }
        }

        setReviewScreenActive(true);
    };

    // Calculate weak categories (< 80%)
    const weakCategories = Object.entries(results?.categoryScoreMap || {})
        .map(([cat, val]: [string, any]) => ({
            name: cat,
            correct: val.correct,
            total: val.total,
            percentage: val.total > 0 ? (val.correct / val.total) * 100 : 0,
        }))
        .filter((c) => c.percentage < 80);

    const wrongQuestionIds = useMemo(() => {
        if (!activeQuestions || !answers) {
return [];
}

        return activeQuestions
            .filter((q, idx) => {
                if (q.category === 'Demographic Profile' || q.isDemographic) {
return false;
}

                const chosen = answers[idx];

                return (
                    chosen !== undefined &&
                    chosen !== null &&
                    Number(chosen) !== Number(q.correct_option)
                );
            })
            .map((q) => q.id);
    }, [activeQuestions, answers]);

    const handleLaunchWeakAreaDrill = () => {
        if (wrongQuestionIds.length > 0) {
            const params = new URLSearchParams();
            params.set('drill', 'true');
            params.set('category_name', 'Mistakes & Weak Areas Drill');
            params.set('custom_question_ids', JSON.stringify(wrongQuestionIds));
            params.set('is_timed', 'true');
            params.set('question_count', 'all');
            router.visit(`/exams?${params.toString()}`);

            return;
        }

        if (weakCategories.length > 0) {
            const weakest = weakCategories[0];
            const params = new URLSearchParams();
            params.set('drill', 'true');
            params.set('category_name', weakest.name);
            params.set('is_timed', 'true');
            params.set('question_count', '15');
            router.visit(`/exams?${params.toString()}`);

            return;
        }

        router.visit('/drills');
    };

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
                const origin = resolveOriginFromUrl(
                    typeof window !== 'undefined' ? window.location.href : undefined,
                );
                const originTitle = origin ? origin.title : (savedAttempt ? 'History' : null);
                const originHref = origin ? origin.href : '/history';

                if (originTitle) {
                    return (
                        <Link
                            href={originHref}
                            onClick={makeBackOnClick({
                                onFallback: () => router.visit(originHref),
                            })}
                            className="group mb-4 flex w-fit cursor-pointer items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground focus:outline-none"
                        >
                            <ChevronLeft className="size-4" /> Back to {originTitle}
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
                        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
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
                                        to save past attempts and take more mock exams.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                }

                return null;
            })()}

            {/* Header Title Section */}
            <div className="mb-6 flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Award className="size-3" /> Performance Scorecard
                    </span>
                    <h1 className="mt-1 font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                        {isDrillSession ? 'Drill Results' : 'Mock Exam Results'}
                    </h1>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground sm:text-sm">
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
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleReviewAll}
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                    >
                        <BookOpen className="size-3.5" /> Review Answers
                    </button>
                </div>
            </div>

            {submittedByTimer && (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                    Time expired — your exam was submitted automatically and your graded scorecard is shown below.
                </div>
            )}

            {results &&
                (() => {
                    const exactPercentage =
                        calculateWeightedPercentage(results);
                    const formattedPercentage = (
                        Math.round(exactPercentage * 100) / 100
                    ).toFixed(2);
                    const strokeDashoffsetExact =
                        circumference - (exactPercentage / 100) * circumference;
                    const isPassed = exactPercentage >= 80;

                    return (
                        <div className="flex flex-col gap-6">
                            {/* Primary Score Overview Card */}
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6 md:p-8">
                                {/* Top Section: Circle & Categories */}
                                <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                                    {/* Circle Percentage Gauge */}
                                    <div className="flex w-full shrink-0 flex-col items-center sm:w-64 lg:w-72">
                                        <div className="relative flex flex-col items-center justify-center">
                                            <div className="relative flex size-36 items-center justify-center sm:size-48">
                                                <svg
                                                    className="size-full -rotate-90"
                                                    viewBox="0 0 100 100"
                                                >
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r={radius}
                                                        className="fill-none stroke-muted"
                                                        strokeWidth="7"
                                                    />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r={radius}
                                                        className={`fill-none transition-all duration-700 ${isPassed ? 'stroke-emerald-600 dark:stroke-emerald-500' : 'stroke-rose-600 dark:stroke-rose-500'}`}
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
                                                        className={`text-3xl leading-none font-black tracking-tight sm:text-4xl ${isPassed ? 'text-foreground' : 'text-rose-600 dark:text-rose-400'}`}
                                                    >
                                                        {formattedPercentage}%
                                                    </span>
                                                    <span className="mt-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                        Passing: 80%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex flex-col items-center gap-1">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black tracking-wider uppercase ${isPassed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}
                                                >
                                                    {isPassed ? 'PASSED' : 'FAILED'}
                                                </span>
                                                <p className="text-center text-xs font-medium text-muted-foreground">
                                                    Official Civil Service Target
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Category Breakdown List */}
                                    <div className="flex w-full flex-1 flex-col">
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-xs font-black tracking-wider text-muted-foreground uppercase">
                                                Category Breakdown
                                            </span>
                                            <span className="text-[11px] font-semibold text-muted-foreground">
                                                Click any category to review
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2.5 sm:gap-3">
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
                                                    const isCatPassed = catExactPct >= 80;

                                                    return (
                                                        <div
                                                            key={cat}
                                                            onClick={() => handleCategoryClick(cat)}
                                                            title={`Click to review questions for "${cat}"`}
                                                            className="group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-3 transition-all duration-200 hover:border-blue-500/50 hover:bg-muted/40"
                                                        >
                                                            <div className="mb-1.5 flex items-center justify-between">
                                                                <span className="truncate pr-2 text-xs font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                                    {cat}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span
                                                                        className={`rounded-md px-1.5 py-0.5 text-[11px] font-black ${isCatPassed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'}`}
                                                                    >
                                                                        {catFormattedPct}%
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-blue-600 opacity-0 transition group-hover:opacity-100 dark:text-blue-400">
                                                                        Review →
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-700 ${isCatPassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                                        style={{
                                                                            width: `${catExactPct}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="w-10 text-right text-[11px] font-bold text-muted-foreground">
                                                                    {val.correct}/{val.total}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 4 Key Stat Metric Boxes */}
                                <div className="mt-6 grid w-full grid-cols-2 gap-3 border-t border-border pt-6 sm:grid-cols-4">
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-4 text-center">
                                        <span className="text-[11px] font-black tracking-wider text-muted-foreground uppercase">
                                            Correct
                                        </span>
                                        <p className="mt-1 text-2xl font-black text-emerald-600 sm:text-3xl dark:text-emerald-400">
                                            {results.correctCount}
                                        </p>
                                        <span className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                                            of {results.total} questions
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-4 text-center">
                                        <span className="text-[11px] font-black tracking-wider text-muted-foreground uppercase">
                                            Incorrect
                                        </span>
                                        <p className="mt-1 text-2xl font-black text-rose-600 sm:text-3xl dark:text-rose-400">
                                            {results.wrongCount}
                                        </p>
                                        <span className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                                            mistakes to review
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-4 text-center">
                                        <span className="text-[11px] font-black tracking-wider text-muted-foreground uppercase">
                                            Skipped
                                        </span>
                                        <p className="mt-1 text-2xl font-black text-muted-foreground sm:text-3xl">
                                            {results.skippedCount}
                                        </p>
                                        <span className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                                            unanswered
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-4 text-center">
                                        <span className="text-[11px] font-black tracking-wider text-muted-foreground uppercase">
                                            Time Spent
                                        </span>
                                        <p className="mt-1 text-2xl font-black text-blue-600 sm:text-3xl dark:text-blue-400">
                                            {elapsedText}
                                        </p>
                                        <span className="mt-0.5 w-full truncate px-1 text-[11px] font-bold text-muted-foreground">
                                            {underLimitText}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* POST-EXAM ACTION HUB */}
                            <div className="rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                        <Zap className="size-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-base font-black text-foreground">
                                            Recommended Next Steps
                                        </h3>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            Turn your test results into immediate score improvements.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {/* Action 1: Deep Dive Mistakes */}
                                    <div
                                        onClick={results.wrongCount > 0 ? handleReviewMistakes : handleReviewAll}
                                        className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:border-blue-500 hover:shadow-md"
                                    >
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                                                    <BookOpen className="size-4" />
                                                </span>
                                                {results.wrongCount > 0 ? (
                                                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                                        {results.wrongCount} Mistakes
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                        100% Correct
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {results.wrongCount > 0
                                                    ? 'Analyze Your Mistakes'
                                                    : 'Review Answer Explanations'}
                                            </h4>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                {results.wrongCount > 0
                                                    ? 'Jump directly into failed questions with step-by-step rationales.'
                                                    : 'Read through complete answer explanations and concept keys.'}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                            <span>Open Mistake Review</span>
                                            <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>

                                    {/* Action 2: Practice Weak Areas */}
                                    <div
                                        onClick={handleLaunchWeakAreaDrill}
                                        className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:border-blue-500 hover:shadow-md"
                                    >
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                                                    <Target className="size-4" />
                                                </span>
                                                {wrongQuestionIds.length > 0 ? (
                                                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                                        {wrongQuestionIds.length} Mistake Drill Qs
                                                    </span>
                                                ) : weakCategories.length > 0 ? (
                                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                                        {weakCategories.length} Weak Area{weakCategories.length > 1 ? 's' : ''}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {wrongQuestionIds.length > 0 ? 'Drill Mistake Questions' : 'Practice Weak Areas'}
                                            </h4>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                {wrongQuestionIds.length > 0
                                                    ? `Instantly launch a focused drill with the ${wrongQuestionIds.length} questions you missed.`
                                                    : weakCategories.length > 0
                                                    ? `Launch a targeted practice session on ${weakCategories.map((w) => w.name).join(', ')}.`
                                                    : 'Launch targeted practice drills to sharpen your speed.'}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                            <span>{wrongQuestionIds.length > 0 ? 'Start Mistake Drill' : 'Launch Weak Area Drill'}</span>
                                            <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>

                                    {/* Action 3: Retake or Start New Exam */}
                                    <div
                                        onClick={handleBeginExam}
                                        className="group relative flex cursor-pointer flex-col justify-between rounded-xl border border-border bg-background p-4 transition-all duration-200 hover:border-blue-500 hover:shadow-md"
                                    >
                                        <div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                                    <RotateCcw className="size-4" />
                                                </span>
                                                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black text-muted-foreground">
                                                    Fresh Pool
                                                </span>
                                            </div>
                                            <h4 className="font-heading text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                Retake Simulation
                                            </h4>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                Start a fresh exam attempt with newly shuffled, prioritized questions.
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                                            <span>Start New Attempt</span>
                                            <ArrowRight className="ml-1 size-3.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Guest account conversion card */}
                            {isGuest && (
                                <div className="overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-background to-blue-50/30 p-6 text-center shadow-lg dark:border-blue-950/40 dark:from-slate-900 dark:to-slate-950">
                                    <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-blue-500">
                                        <Trophy className="size-6 animate-pulse" />
                                    </div>
                                    <h3 className="font-heading text-lg font-black tracking-tight text-foreground sm:text-xl">
                                        Don't Lose Your Mock Exam Score!
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                        Register a free account now to permanently save this attempt to your history, track your category mastery over time, and unlock AI diagnostic analysis.
                                    </p>
                                    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                                        <Link
                                            href="/register"
                                            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 sm:w-auto"
                                        >
                                            <LogIn className="size-4 transition-transform group-hover:translate-x-0.5" />
                                            Register Free Account & Save Score
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Watermark Footer */}
                            <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
                                <div className="flex items-center gap-2">
                                    <img
                                        src="/images/hiraya_logo_cropped.png"
                                        alt="Hiraya Review Logo"
                                        className="size-5 shrink-0 object-contain dark:brightness-110"
                                    />
                                    <span className="font-heading text-xs font-black tracking-widest text-foreground uppercase">
                                        Hiraya Review
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                    hirayareview.com • Civil Service Exam Simulator
                                </span>
                            </div>
                        </div>
                    );
                })()}

            {/* Guest Completion Modal */}
            {showGuestPrompt && (
                <div className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in">
                    <div
                        className="relative flex max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl animate-in flex-col overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl duration-200 zoom-in-95 sm:w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4 flex flex-col items-center text-center">
                            <div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Trophy className="size-8" />
                            </div>
                            <h3 className="font-heading text-xl font-black tracking-tight text-foreground">
                                Mock Exam Completed!
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                Great job on finishing the exam! Your score and category breakdown are ready.
                            </p>
                            <p className="mt-3 text-xs font-bold text-amber-600 dark:text-amber-400">
                                ⚠️ Create a free account to save this attempt permanently in your progress history and review your mistake rationales anytime.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-col gap-2.5">
                            <Link
                                href="/register"
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none active:scale-95"
                            >
                                <LogIn className="size-4" />
                                Create a Free Account
                            </Link>
                            <button
                                type="button"
                                onClick={dismissGuestPrompt}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-bold text-foreground transition hover:bg-muted active:scale-95"
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
