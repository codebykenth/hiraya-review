import { Head, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    LayoutGrid,
    CheckCircle2,
    X,
    HelpCircle,
    AlertCircle,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Clock,
} from 'lucide-react';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ReportIssueModal } from '@/components/domain/report-issue-modal';
import {
    renderFormattedText,
    extractPropositions,
} from '@/lib/exam-formatters';
import QuestionPalettePanel from './question-palette-panel';

interface Question {
    id: number;
    stem: string;
    options: string[];
    correct_option: number;
    explanation: string;
    category: string;
    subcategory: string;
    originalOptionIndices?: number[];
    isDemographic?: boolean;
    language?: string;
}

interface ReviewExamViewProps {
    details: any;
    activeQuestions: Question[];
    currentIdx: number;
    setCurrentIdx: (idx: number) => void;
    answers: Record<number, number>;
    questionTimes?: Record<number, number>;
    results?: any;
    flagged: Record<number, boolean>;
    setFlagged: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
    reviewCategoryFilter: string;
    setReviewCategoryFilter: (cat: string) => void;
    reviewSubcategoryFilter: string;
    setReviewSubcategoryFilter: (subcat: string) => void;
    reviewStatusFilter: 'all' | 'correct' | 'incorrect' | 'flagged';
    setReviewStatusFilter: (
        status: 'all' | 'correct' | 'incorrect' | 'flagged',
    ) => void;
    reviewSubcategories: string[];
    isMobilePaletteOpen: boolean;
    setIsMobilePaletteOpen: (val: boolean) => void;
    setReviewScreenActive: (val: boolean) => void;
}

export function ReviewExamView({
    details = {},
    activeQuestions = [],
    currentIdx = 0,
    setCurrentIdx,
    answers = {},
    questionTimes,
    results,
    flagged = {},
    setFlagged,
    reviewCategoryFilter,
    setReviewCategoryFilter,
    reviewSubcategoryFilter,
    setReviewSubcategoryFilter,
    reviewStatusFilter,
    setReviewStatusFilter,
    reviewSubcategories = [],
    isMobilePaletteOpen,
    setIsMobilePaletteOpen,
    setReviewScreenActive,
}: ReviewExamViewProps) {
    const isCurrentMatch = (q: Question | undefined, idx: number) => {
        if (!q) return false;
        if (
            reviewCategoryFilter !== 'All Categories' &&
            q.category !== reviewCategoryFilter
        ) {
            return false;
        }
        if (
            reviewSubcategoryFilter !== 'All Subcategories' &&
            (q.subcategory || 'General Concepts') !== reviewSubcategoryFilter
        ) {
            return false;
        }
        const chosen = answers[idx];
        const isCorrect =
            chosen !== undefined &&
            chosen !== null &&
            Number(chosen) === Number(q.correct_option);
        const isDemographic =
            q.category === 'Demographic Profile' || q.isDemographic;

        if (reviewStatusFilter === 'correct' && (isDemographic || !isCorrect)) {
            return false;
        }
        if (
            reviewStatusFilter === 'incorrect' &&
            (isDemographic || isCorrect)
        ) {
            return false;
        }
        if (reviewStatusFilter === 'flagged' && !flagged[idx]) {
            return false;
        }
        return true;
    };

    const rawQuestion = activeQuestions[currentIdx];
    const currentQuestion = isCurrentMatch(rawQuestion, currentIdx)
        ? rawQuestion
        : undefined;
    const chosenOption = answers[currentIdx];

    const timeSpentSecs = questionTimes?.[currentIdx];
    const avgSecs =
        results?.elapsedSecs && activeQuestions.length > 0
            ? Math.round(results.elapsedSecs / activeQuestions.length)
            : undefined;
    const displaySecs = timeSpentSecs ?? avgSecs;

    const formattedTimeSpent = useMemo(() => {
        if (displaySecs === undefined || displaySecs === null || displaySecs <= 0)
            return null;
        const m = Math.floor(displaySecs / 60);
        const s = displaySecs % 60;
        if (m === 0) return `${s}s`;
        return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    }, [displaySecs]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
    const [showPerformanceCard, setShowPerformanceCard] = useState(false);
    const [isExplanationOpen, setIsExplanationOpen] = useState(true);

    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    const { user_reported_ids = [] } = usePage<{
        user_reported_ids?: number[];
    }>().props;
    const isReported = currentQuestion
        ? user_reported_ids.includes(currentQuestion.id)
        : false;

    const getNextMatchingIndex = useCallback(
        (fromIdx: number, direction: 'next' | 'prev') => {
            const step = direction === 'next' ? 1 : -1;
            let i = fromIdx + step;
            while (i >= 0 && i < activeQuestions.length) {
                const q = activeQuestions[i];
                const isDemographic =
                    q.category === 'Demographic Profile' || q.isDemographic;
                const chosen = answers[i];
                const isCorrect =
                    chosen !== undefined &&
                    chosen !== null &&
                    Number(chosen) === Number(q.correct_option);

                let matches = true;
                if (
                    reviewCategoryFilter !== 'All Categories' &&
                    q.category !== reviewCategoryFilter
                ) {
                    matches = false;
                }
                if (
                    reviewSubcategoryFilter !== 'All Subcategories' &&
                    (q.subcategory || 'General Concepts') !==
                        reviewSubcategoryFilter
                ) {
                    matches = false;
                }
                if (
                    reviewStatusFilter === 'correct' &&
                    (isDemographic || !isCorrect)
                ) {
                    matches = false;
                }
                if (
                    reviewStatusFilter === 'incorrect' &&
                    (isDemographic || isCorrect)
                ) {
                    matches = false;
                }
                if (reviewStatusFilter === 'flagged' && !flagged[i]) {
                    matches = false;
                }

                if (matches) return i;
                i += step;
            }
            return -1;
        },
        [
            activeQuestions,
            answers,
            flagged,
            reviewCategoryFilter,
            reviewSubcategoryFilter,
            reviewStatusFilter,
        ],
    );

    const handleNavigateNext = useCallback(() => {
        const nextIdx = getNextMatchingIndex(currentIdx, 'next');
        if (nextIdx !== -1) setCurrentIdx(nextIdx);
    }, [currentIdx, getNextMatchingIndex, setCurrentIdx]);

    const handleNavigatePrev = useCallback(() => {
        const prevIdx = getNextMatchingIndex(currentIdx, 'prev');
        if (prevIdx !== -1) setCurrentIdx(prevIdx);
    }, [currentIdx, getNextMatchingIndex, setCurrentIdx]);

    const handleJumpToNextIncorrect = useCallback(() => {
        for (let offset = 1; offset <= activeQuestions.length; offset++) {
            const idx = (currentIdx + offset) % activeQuestions.length;
            const q = activeQuestions[idx];
            const isDemographic =
                q.category === 'Demographic Profile' || q.isDemographic;
            if (isDemographic) continue;

            const chosen = answers[idx];
            const isCorrect =
                chosen !== undefined &&
                chosen !== null &&
                Number(chosen) === Number(q.correct_option);

            if (!isCorrect) {
                if (
                    reviewCategoryFilter !== 'All Categories' ||
                    reviewSubcategoryFilter !== 'All Subcategories' ||
                    reviewStatusFilter === 'correct' ||
                    reviewStatusFilter === 'flagged'
                ) {
                    setReviewCategoryFilter('All Categories');
                    setReviewSubcategoryFilter('All Subcategories');
                    setReviewStatusFilter('all');
                }

                setCurrentIdx(idx);
                break;
            }
        }
    }, [
        currentIdx,
        activeQuestions,
        answers,
        setCurrentIdx,
        reviewCategoryFilter,
        reviewSubcategoryFilter,
        reviewStatusFilter,
        setReviewCategoryFilter,
        setReviewSubcategoryFilter,
        setReviewStatusFilter,
    ]);

    // Touch Swipe Handlers for Mobile
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current) return;
        const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
        const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
        touchStartRef.current = null;

        if (Math.abs(diffX) > 50 && Math.abs(diffY) < 50) {
            if (diffX < 0) {
                handleNavigateNext();
            } else {
                handleNavigatePrev();
            }
        }
    };

    // Keyboard Shortcuts Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement)?.isContentEditable
            ) {
                return;
            }

            if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') {
                handleNavigatePrev();
            } else if (
                e.key === 'ArrowRight' ||
                e.key === 'n' ||
                e.key === 'N'
            ) {
                handleNavigateNext();
            } else if (e.key === 'f' || e.key === 'F') {
                if (currentQuestion) {
                    setFlagged((prev) => ({
                        ...prev,
                        [currentIdx]: !prev[currentIdx],
                    }));
                }
            } else if (e.key === 'e' || e.key === 'E') {
                setIsExplanationOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        handleNavigateNext,
        handleNavigatePrev,
        currentIdx,
        currentQuestion,
        setFlagged,
    ]);

    // Dispatch event to hide the Support Widget when Review mode is active
    useEffect(() => {
        const event = new CustomEvent('review-exam-status', { detail: { active: true } });
        window.dispatchEvent(event);

        return () => {
            const endEvent = new CustomEvent('review-exam-status', { detail: { active: false } });
            window.dispatchEvent(endEvent);
        };
    }, []);

    const handleTopicClick = (topicName: string) => {
        if (reviewSubcategories && reviewSubcategories.includes(topicName)) {
            setReviewSubcategoryFilter(topicName);
        } else if (
            details.allowedCategories &&
            details.allowedCategories.includes(topicName)
        ) {
            setReviewCategoryFilter(topicName);
            setReviewSubcategoryFilter('All Subcategories');
        }
    };

    const stats = useMemo(() => {
        let correct = 0;
        let incorrect = 0;
        let skipped = 0;
        let flaggedCount = 0;
        const topicStats: Record<string, { total: number; correct: number }> =
            {};

        (activeQuestions || []).forEach((q, idx) => {
            if (flagged && flagged[idx]) flaggedCount++;
            const isDemographic =
                q.category === 'Demographic Profile' ||
                q.category?.toLowerCase().includes('demographic') ||
                q.isDemographic;
            if (isDemographic) return;

            const topic = q.subcategory || q.category || 'General';
            if (!topicStats[topic]) {
                topicStats[topic] = { total: 0, correct: 0 };
            }
            topicStats[topic].total++;

            const chosen = answers ? answers[idx] : undefined;
            if (chosen === undefined || chosen === null) {
                skipped++;
            } else if (Number(chosen) === Number(q.correct_option)) {
                correct++;
                topicStats[topic].correct++;
            } else {
                incorrect++;
            }
        });

        const allTopics = Object.entries(topicStats)
            .map(([topic, data]) => ({
                topic,
                accuracy: Math.round((data.correct / data.total) * 100),
                total: data.total,
                correct: data.correct,
            }))
            .sort((a, b) => a.accuracy - b.accuracy);

        const weakTopics = allTopics.filter((t) => t.accuracy < 70);

        return {
            correct,
            incorrect,
            skipped,
            flagged: flaggedCount,
            allTopics,
            weakTopics,
        };
    }, [activeQuestions, answers, flagged]);

    const scorePills = (
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs font-bold">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                    <span className="hidden md:inline">Correct: </span>
                    <strong className="font-extrabold">{stats.correct}</strong>
                </span>
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                <X className="size-3.5 text-rose-600 dark:text-rose-400" />
                <span>
                    <span className="hidden md:inline">Incorrect: </span>
                    <strong className="font-extrabold">{stats.incorrect}</strong>
                </span>
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <HelpCircle className="size-3.5 text-slate-500 dark:text-slate-400" />
                <span>
                    <span className="hidden md:inline">Skipped: </span>
                    <strong className="font-extrabold">{stats.skipped}</strong>
                </span>
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
                <Flag className="size-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                    <span className="hidden md:inline">Flagged: </span>
                    <strong className="font-extrabold">{stats.flagged}</strong>
                </span>
            </span>
        </div>
    );

    return (
        <>
            <Head title={`Answer Review: ${details.title}`} />
            <div className="fixed inset-0 z-50 flex animate-in flex-col bg-background duration-200 fade-in">
                {/* TOP NAVBAR HEADER: RESPONSIVE MULTI-ROW MICRO-LAYOUT */}
                <div className="shadow-3xs flex w-full flex-col justify-center gap-2 border-b border-border bg-card px-3 py-3 sm:px-5 lg:h-[84px]">
                    {/* ROW 1: Back, Title, Topic Performance & Palette */}
                    <div className="flex w-full items-center justify-between gap-1.5 text-sm font-bold">
                        {/* Left: Back & Exam Title */}
                        <div className="flex min-w-0 items-center gap-1.5">
                            <button
                                onClick={() => setReviewScreenActive(false)}
                                title="Back to Scorecard"
                                className="group flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none"
                            >
                                <ChevronLeft className="size-4" />
                                <span className="hidden sm:inline">
                                    Back to Scorecard
                                </span>
                            </button>

                            <div className="h-4 w-px shrink-0 bg-border" />

                            <span className="shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-600 uppercase dark:bg-emerald-950/30 dark:text-emerald-400">
                                <span className="md:hidden">Review</span>
                                <span className="hidden md:inline">Exam Answer Review</span>
                            </span>

                            <span className="truncate font-heading text-sm font-bold text-foreground">
                                {details.title}
                            </span>
                        </div>

                        {/* Right: Topic Performance & Palette Toggle */}
                        <div className="flex shrink-0 items-center gap-1.5 text-xs">
                            {stats.allTopics.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPerformanceCard(
                                            !showPerformanceCard,
                                        )
                                    }
                                    className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-bold transition ${
                                        showPerformanceCard
                                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                            : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                     <BarChart3 className="size-4 shrink-0" />
                                     <span className="hidden xl:inline">
                                         Topic Performance Breakdown
                                     </span>
                                     <span className="hidden md:inline xl:hidden">
                                         Topic Breakdown
                                     </span>
                                     <span className="inline md:hidden">
                                         Topics
                                     </span>
                                    {stats.weakTopics.length > 0 && (
                                        <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                                            {stats.weakTopics.length}
                                        </span>
                                    )}
                                    <ChevronDown
                                        className={`size-3.5 transition-transform duration-200 ${
                                            showPerformanceCard
                                                ? 'rotate-180'
                                                : ''
                                        }`}
                                    />
                                </button>
                            )}

                            {/* Score Pills (Large Screens) */}
                            <div className="hidden lg:flex">
                                {scorePills}
                            </div>

                            {/* Question Palette Toggle Button */}
                            <button
                                onClick={() => {
                                    if (window.innerWidth >= 1024) {
                                        setIsPaletteCollapsed((prev) => !prev);
                                    } else {
                                        setIsMobilePaletteOpen(true);
                                    }
                                }}
                                title={
                                    isPaletteCollapsed
                                        ? 'Expand Question Palette'
                                        : 'Question Palette'
                                }
                                className={`shadow-3xs flex h-8 cursor-pointer items-center justify-center rounded-md transition focus:outline-none ${
                                    isPaletteCollapsed
                                        ? 'border border-blue-300 bg-blue-50 px-2.5 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400'
                                        : 'size-8 bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                <LayoutGrid className="size-4 shrink-0" />
                                {isPaletteCollapsed && (
                                    <span className="hidden whitespace-nowrap text-xs font-bold lg:inline ml-1.5">
                                        Show Palette
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ROW 2: Score Breakdown Pills (Small Screens) */}
                    <div className="flex w-full items-center justify-between gap-1.5 lg:hidden">
                        {scorePills}
                    </div>
                </div>

                {/* HORIZONTAL REVIEW PROGRESS BAR */}
                <div className="relative h-1.5 w-full overflow-hidden bg-muted/60">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                        style={{
                            width: `${((currentIdx + 1) / (activeQuestions.length || 1)) * 100}%`,
                        }}
                    />
                </div>

                {/* MAIN TWO-COLUMN SPLIT PANEL LAYOUT */}
                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT COLUMN: ACTIVE QUESTION CARD & OPTION SELECTORS */}
                    <div
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                        className="flex flex-1 flex-col justify-between overflow-y-auto bg-background p-4 sm:p-6 md:p-10"
                    >
                        <div className="mx-auto w-full max-w-3xl">
                            {currentQuestion ? (
                                <div className="flex animate-in flex-col gap-3 duration-150 fade-in sm:gap-6">
                                    {/* Visual Topic Performance Breakdown Card */}
                                    {showPerformanceCard && stats.allTopics.length > 0 && (
                                        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-3xs transition-all animate-in fade-in duration-200">
                                            {/* Card Header */}
                                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                        <BarChart3 className="size-4" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-heading text-sm font-bold text-foreground">
                                                            Topic Performance Breakdown
                                                        </h3>
                                                        <p className="text-[11px] font-semibold text-muted-foreground">
                                                            {stats.weakTopics.length > 0
                                                                ? `${stats.weakTopics.length} topic${stats.weakTopics.length > 1 ? 's' : ''} need attention (<70% accuracy)`
                                                                : 'Great job! All topics above 70% accuracy.'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setIsBreakdownExpanded(
                                                                !isBreakdownExpanded,
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                    >
                                                        <span>
                                                            {isBreakdownExpanded
                                                                ? 'Show Top Weaknesses'
                                                                : `View All Topics (${stats.allTopics.length})`}
                                                        </span>
                                                        {isBreakdownExpanded ? (
                                                            <ChevronUp className="size-3.5" />
                                                        ) : (
                                                            <ChevronDown className="size-3.5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPerformanceCard(false)
                                                        }
                                                        className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                                                        title="Close Topic Performance"
                                                    >
                                                        <X className="size-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Visual Progress Bars Grid */}
                                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                {(isBreakdownExpanded
                                                    ? stats.allTopics
                                                    : stats.weakTopics.length > 0
                                                      ? stats.weakTopics.slice(0, 6)
                                                      : stats.allTopics.slice(0, 6)
                                                ).map((t, idx) => {
                                                    const isWeak = t.accuracy < 70;
                                                    const isCritical = t.accuracy < 50;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() =>
                                                                handleTopicClick(
                                                                    t.topic,
                                                                )
                                                            }
                                                            title={`Click to filter review questions for "${t.topic}"`}
                                                            className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border p-3 transition-all hover:border-blue-500/50 hover:shadow-2xs ${
                                                                isCritical
                                                                    ? 'border-rose-200/80 bg-rose-50/40 hover:bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20 dark:hover:bg-rose-950/40'
                                                                    : isWeak
                                                                      ? 'border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 dark:hover:bg-amber-950/40'
                                                                      : 'border-emerald-200/80 bg-emerald-50/30 hover:bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40'
                                                            }`}
                                                        >
                                                            <div>
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <span className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                                        {t.topic}
                                                                    </span>
                                                                    <span
                                                                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black ${
                                                                            isCritical
                                                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                                                                : isWeak
                                                                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                                                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                                        }`}
                                                                    >
                                                                        {t.accuracy}%
                                                                    </span>
                                                                </div>

                                                                {/* Visual Progress Bar */}
                                                                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted/80">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                                            isCritical
                                                                                ? 'bg-rose-500'
                                                                                : isWeak
                                                                                  ? 'bg-amber-500'
                                                                                  : 'bg-emerald-500'
                                                                        }`}
                                                                        style={{
                                                                            width: `${t.accuracy}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                                                                <span>
                                                                    {t.correct} of {t.total} correct
                                                                </span>
                                                                <span className="opacity-0 transition group-hover:opacity-100 text-blue-600 dark:text-blue-400">
                                                                    Filter →
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Question stem container */}
                                    <div className="shadow-3xs relative rounded-2xl border border-border bg-card p-4 sm:p-6">
                                        <div className="-mx-4 -mt-4 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-t-2xl border-b border-border/60 bg-muted/30 px-4 py-3 sm:-mx-6 sm:-mt-6 sm:px-6">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                                                    {currentQuestion.category}
                                                </span>
                                                <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-extrabold text-muted-foreground">
                                                    {currentQuestion.subcategory ||
                                                        'General Concepts'}
                                                </span>
                                                {(() => {
                                                    const isDemographic =
                                                        currentQuestion.category === 'Demographic Profile' ||
                                                        currentQuestion.isDemographic;
                                                    if (isDemographic) return null;

                                                    if (chosenOption === undefined || chosenOption === null) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] font-black text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                                                <HelpCircle className="size-3 text-slate-500" /> Skipped
                                                            </span>
                                                        );
                                                    }

                                                    const isCorrect =
                                                        Number(chosenOption) === Number(currentQuestion.correct_option);
                                                    if (isCorrect) {
                                                        return (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                                <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" /> Correct
                                                            </span>
                                                        );
                                                    }
                                                    return (
                                                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                                                            <X className="size-3 text-rose-600 dark:text-rose-400" /> Incorrect
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {formattedTimeSpent && (
                                                    <span
                                                        title={
                                                            timeSpentSecs !== undefined
                                                                ? 'Time spent on this question'
                                                                : 'Average time per question'
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300"
                                                    >
                                                        <Clock className="size-3 text-blue-600 dark:text-blue-400" />
                                                        <span>{formattedTimeSpent}</span>
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                                    Question {currentIdx + 1} of{' '}
                                                    {activeQuestions.length}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        disabled={isReported}
                                                        onClick={() =>
                                                            !isReported &&
                                                            setIsReportModalOpen(
                                                                true,
                                                            )
                                                        }
                                                        title={
                                                            isReported
                                                                ? 'You have already reported an issue for this question.'
                                                                : undefined
                                                        }
                                                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition focus:outline-none ${
                                                            isReported
                                                                ? 'cursor-not-allowed text-muted-foreground opacity-60'
                                                                : 'cursor-pointer text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-950/20'
                                                        }`}
                                                    >
                                                        <Flag
                                                            className={`size-3.5 ${
                                                                isReported
                                                                    ? 'fill-muted-foreground text-muted-foreground'
                                                                    : ''
                                                            }`}
                                                        />
                                                        {isReported
                                                            ? 'Reported'
                                                            : 'Report Issue'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm leading-relaxed font-semibold text-foreground">
                                            {renderFormattedText(
                                                currentQuestion.stem,
                                                true,
                                            )}
                                        </div>
                                    </div>

                                    {/* Options Grid */}
                                    <div className="flex flex-col gap-3.5">
                                        {currentQuestion.options.map(
                                            (opt, idx) => {
                                                const letter =
                                                    String.fromCharCode(
                                                        65 + idx,
                                                    );
                                                const isChosen =
                                                    chosenOption !==
                                                        undefined &&
                                                    chosenOption !== null &&
                                                    Number(chosenOption) ===
                                                        idx;
                                                const isCorrectOption =
                                                    idx ===
                                                    currentQuestion.correct_option;
                                                const isDemographic =
                                                    currentQuestion.isDemographic ||
                                                    currentQuestion.category ===
                                                        'Demographic Profile';

                                                let optionStyle =
                                                    'border-border bg-card hover:bg-muted text-foreground';
                                                let badgeStyle =
                                                    'border-border bg-background text-muted-foreground';

                                                if (isDemographic) {
                                                    if (isChosen) {
                                                        optionStyle =
                                                            'bg-blue-50/15 border-blue-600 text-blue-950 font-bold dark:bg-blue-950/20 dark:border-blue-500 dark:text-blue-200';
                                                        badgeStyle =
                                                            'border-blue-600 bg-blue-600 text-white';
                                                    }
                                                } else if (isCorrectOption) {
                                                    optionStyle =
                                                        'bg-emerald-50/20 border-emerald-500 text-emerald-950 font-bold dark:bg-emerald-950/20 dark:border-emerald-500 dark:text-emerald-300';
                                                    badgeStyle =
                                                        'border-emerald-600 bg-emerald-600 text-white';
                                                } else if (isChosen) {
                                                    optionStyle =
                                                        'bg-rose-50/20 border-rose-500 text-rose-950 font-bold dark:bg-rose-950/20 dark:border-rose-500 dark:text-rose-300';
                                                    badgeStyle =
                                                        'border-rose-600 bg-rose-600 text-white';
                                                } else {
                                                    optionStyle =
                                                        'border-border bg-card hover:bg-muted text-foreground/60 opacity-80';
                                                    badgeStyle =
                                                        'border-border bg-background text-muted-foreground/60';
                                                }

                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`shadow-3xs flex items-center gap-4 rounded-xl border p-4 transition-all ${optionStyle}`}
                                                    >
                                                        <span
                                                            className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${badgeStyle}`}
                                                        >
                                                            {letter}
                                                        </span>
                                                        <div className="flex flex-1 items-center justify-between">
                                                            <p className="text-base leading-relaxed font-bold transition md:text-base">
                                                                {renderFormattedText(
                                                                    opt,
                                                                    false,
                                                                    undefined,
                                                                    true,
                                                                )}
                                                            </p>
                                                            {!isDemographic &&
                                                                isCorrectOption && (
                                                                    <div className="flex shrink-0 items-center gap-1.5 pl-3">
                                                                        {isChosen && (
                                                                            <span className="hidden text-[9px] font-black tracking-wider text-emerald-700 uppercase sm:inline-block dark:text-emerald-400">
                                                                                Your
                                                                                Answer
                                                                            </span>
                                                                        )}
                                                                        <CheckCircle2 className="dark:text-emerald-450 size-5 text-emerald-600 dark:text-emerald-400" />
                                                                    </div>
                                                                )}
                                                            {!isDemographic &&
                                                                isChosen &&
                                                                !isCorrectOption && (
                                                                    <div className="flex shrink-0 items-center gap-1.5 pl-3">
                                                                        <span className="hidden text-[9px] font-black tracking-wider text-rose-700 uppercase sm:inline-block dark:text-rose-400">
                                                                            Your
                                                                            Answer
                                                                        </span>
                                                                        <X className="text-rose-650 dark:text-rose-450 size-5" />
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>

                                    {/* Explanation Block */}
                                    {(() => {
                                        const propositions =
                                            extractPropositions(
                                                currentQuestion.stem,
                                            );
                                        const letterMap: Record<
                                            string,
                                            string
                                        > = {};

                                        propositions.forEach((prop, idx) => {
                                            const newLetter =
                                                String.fromCharCode(65 + idx);
                                            letterMap[prop.letter] = newLetter;
                                        });

                                        return (
                                            <>
                                                {currentQuestion.explanation && (
                                                    <div className="shadow-3xs mt-2 overflow-hidden rounded-2xl border border-border bg-card text-sm leading-relaxed text-muted-foreground transition-all">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setIsExplanationOpen(
                                                                    !isExplanationOpen,
                                                                )
                                                            }
                                                            className="flex w-full items-center justify-between p-4 font-bold text-foreground transition hover:bg-muted/50 sm:p-5"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <HelpCircle className="size-4 text-blue-600 dark:text-blue-400" />
                                                                <span>
                                                                    Explanation &amp;
                                                                    Rationale
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-normal text-muted-foreground">
                                                                    {isExplanationOpen
                                                                        ? 'Hide'
                                                                        : 'Show'}
                                                                </span>
                                                                {isExplanationOpen ? (
                                                                    <ChevronUp className="size-4 text-muted-foreground" />
                                                                ) : (
                                                                    <ChevronDown className="size-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        </button>

                                                        {isExplanationOpen && (
                                                            <div className="border-t border-border/60 bg-muted/30 p-5">
                                                                {propositions.length >
                                                                    0 && (
                                                                    <div className="shadow-3xs mb-4 rounded-xl border border-border bg-background p-4">
                                                                        <span className="mb-2 block font-heading text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                                                            Proposition
                                                                            Key:
                                                                        </span>
                                                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                            {propositions.map(
                                                                                (
                                                                                    prop,
                                                                                    idx,
                                                                                ) => {
                                                                                    const newLetter =
                                                                                        String.fromCharCode(
                                                                                            65 +
                                                                                                idx,
                                                                                        );

                                                                                    return (
                                                                                        <div
                                                                                            key={
                                                                                                idx
                                                                                            }
                                                                                            className="flex items-center gap-2 text-xs"
                                                                                        >
                                                                                            <span className="inline-flex size-5 items-center justify-center rounded border border-blue-100/60 bg-blue-50 font-mono text-[10px] font-black text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400">
                                                                                                {
                                                                                                    newLetter
                                                                                                }
                                                                                            </span>
                                                                                            <span className="font-medium text-foreground">
                                                                                                {
                                                                                                    prop.phrase
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    );
                                                                                },
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {renderFormattedText(
                                                                    currentQuestion.explanation,
                                                                    false,
                                                                    letterMap,
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <HelpCircle className="mb-3 size-12 text-muted-foreground" />
                                    <h3 className="text-base font-bold text-foreground">
                                        No questions match filters
                                    </h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                        Try switching to a different category or
                                        status pill.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* CORE CONTROL BUTTONS */}
                        <div className="mx-auto mt-8 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                            <button
                                type="button"
                                onClick={handleNavigatePrev}
                                disabled={
                                    getNextMatchingIndex(currentIdx, 'prev') ===
                                    -1
                                }
                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </button>

                            {stats.incorrect > 0 && (
                                <button
                                    type="button"
                                    onClick={handleJumpToNextIncorrect}
                                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-extrabold text-rose-700 shadow-2xs transition hover:bg-rose-100 hover:shadow-xs dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                >
                                    <span>Next Incorrect</span>
                                    <ChevronRight className="size-4 text-rose-600 dark:text-rose-400" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={handleNavigateNext}
                                disabled={
                                    getNextMatchingIndex(currentIdx, 'next') ===
                                    -1
                                }
                                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next Question
                                <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: QUESTION PALETTE GRID */}
                    <QuestionPalettePanel
                        mode="review"
                        questions={activeQuestions}
                        currentIdx={currentIdx}
                        answers={answers}
                        flagged={flagged}
                        onNavigate={setCurrentIdx}
                        selectedCategory={reviewCategoryFilter}
                        onCategoryChange={(cat) => {
                            setReviewCategoryFilter(cat);
                            setReviewSubcategoryFilter('All Subcategories');
                        }}
                        allowedCategories={details.allowedCategories}
                        reviewStatusFilter={reviewStatusFilter}
                        reviewSubcategoryFilter={reviewSubcategoryFilter}
                        onReviewStatusChange={(status) =>
                            setReviewStatusFilter(status)
                        }
                        onReviewSubcategoryChange={(subcat) =>
                            setReviewSubcategoryFilter(subcat)
                        }
                        reviewSubcategories={reviewSubcategories}
                        isMobile={false}
                        isCollapsed={isPaletteCollapsed}
                        onToggleCollapse={() =>
                            setIsPaletteCollapsed((prev) => !prev)
                        }
                    />
                </div>

                {/* Mobile Question Palette Drawer */}
                {isMobilePaletteOpen && (
                    <QuestionPalettePanel
                        mode="review"
                        questions={activeQuestions}
                        currentIdx={currentIdx}
                        answers={answers}
                        flagged={flagged}
                        onNavigate={setCurrentIdx}
                        selectedCategory={reviewCategoryFilter}
                        onCategoryChange={(cat) => {
                            setReviewCategoryFilter(cat);
                            setReviewSubcategoryFilter('All Subcategories');
                        }}
                        allowedCategories={details.allowedCategories}
                        reviewStatusFilter={reviewStatusFilter}
                        reviewSubcategoryFilter={reviewSubcategoryFilter}
                        onReviewStatusChange={(status) =>
                            setReviewStatusFilter(status)
                        }
                        onReviewSubcategoryChange={(subcat) =>
                            setReviewSubcategoryFilter(subcat)
                        }
                        reviewSubcategories={reviewSubcategories}
                        isMobile={true}
                        onCloseMobile={() => setIsMobilePaletteOpen(false)}
                    />
                )}

                {isReportModalOpen && currentQuestion && (
                    <ReportIssueModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        flaggableId={currentQuestion.id}
                        flaggableType="App\Models\Question"
                    />
                )}
            </div>
        </>
    );
}
