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
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
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
    details,
    activeQuestions,
    currentIdx,
    setCurrentIdx,
    answers,
    flagged,
    setFlagged,
    reviewCategoryFilter,
    setReviewCategoryFilter,
    reviewSubcategoryFilter,
    setReviewSubcategoryFilter,
    reviewStatusFilter,
    setReviewStatusFilter,
    reviewSubcategories,
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
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);
    const [showPerformanceCard, setShowPerformanceCard] = useState(false);
    const { user_reported_ids = [] } = usePage<{
        user_reported_ids?: number[];
    }>().props;
    const isReported = currentQuestion
        ? user_reported_ids.includes(currentQuestion.id)
        : false;

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

    return (
        <>
            <Head title={`Answer Review: ${details.title}`} />
            <div className="fixed inset-0 z-50 flex animate-in flex-col bg-background duration-200 fade-in">
                {/* TOP NAVBAR HEADER */}
                <div className="shadow-3xs flex h-16 shrink-0 flex-wrap items-center justify-between border-b border-border bg-card px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setReviewScreenActive(false)}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg text-xs font-black text-muted-foreground transition hover:text-blue-600 focus:outline-none dark:text-blue-400"
                        >
                            <ChevronLeft className="size-4" />
                            <span className="hidden sm:inline-block">
                                Back to Scorecard
                            </span>
                        </button>
                        <div className="h-4 w-px bg-border" />
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-600 uppercase dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                            Exam Answer Review
                        </span>
                        <span className="hidden text-sm font-bold text-foreground lg:block">
                            {details.title}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] font-bold">
                        {stats.allTopics.length > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setShowPerformanceCard(!showPerformanceCard)
                                }
                                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold transition ${
                                    showPerformanceCard
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                <BarChart3 className="size-3.5" />
                                <span>Topic Performance</span>
                                {stats.weakTopics.length > 0 && (
                                    <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[10px] font-black text-amber-600 dark:text-amber-400">
                                        {stats.weakTopics.length}
                                    </span>
                                )}
                                <ChevronDown
                                    className={`size-3.5 transition-transform duration-200 ${
                                        showPerformanceCard ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
                            <span>
                                Correct:{' '}
                                <strong className="font-extrabold">
                                    {stats.correct}
                                </strong>
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                            <X className="size-3 text-rose-600 dark:text-rose-400" />
                            <span>
                                Incorrect:{' '}
                                <strong className="font-extrabold">
                                    {stats.incorrect}
                                </strong>
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                            <HelpCircle className="size-3 text-slate-500 dark:text-slate-400" />
                            <span>
                                Skipped:{' '}
                                <strong className="font-extrabold">
                                    {stats.skipped}
                                </strong>
                            </span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
                            <Flag className="size-3 text-amber-600 dark:text-amber-400" />
                            <span>
                                Flagged:{' '}
                                <strong className="font-extrabold">
                                    {stats.flagged}
                                </strong>
                            </span>
                        </span>
                    </div>
                </div>

                {/* MAIN TWO-COLUMN SPLIT PANEL LAYOUT */}
                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT COLUMN: ACTIVE QUESTION CARD & OPTION SELECTORS */}
                    <div className="flex flex-1 flex-col justify-between overflow-y-auto bg-background p-4 sm:p-6 md:p-10">
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
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="dark:bg-blue-950/30/50 rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                                    {currentQuestion.category}
                                                </span>
                                                <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-extrabold text-muted-foreground">
                                                    {currentQuestion.subcategory ||
                                                        'General Concepts'}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setIsMobilePaletteOpen(
                                                            true,
                                                        )
                                                    }
                                                    className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none lg:hidden"
                                                >
                                                    <LayoutGrid className="size-3" />
                                                    Palette
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-3">
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
                                                    <div className="shadow-3xs mt-2 rounded-2xl border border-border bg-muted/60 p-5 text-sm leading-relaxed text-muted-foreground">
                                                        <span className="mb-2 block font-bold text-foreground">
                                                            Explanation &amp;
                                                            Rationale:
                                                        </span>

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
                                                                                    <span className="inline-flex size-5 items-center justify-center rounded border border-blue-100/60 bg-blue-50 font-mono text-[10px] font-black text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:bg-blue-950/40 dark:text-blue-400">
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
                        <div className="mx-auto mt-8 flex w-full max-w-3xl items-center justify-between gap-4 border-t border-border pt-6">
                            <button
                                onClick={() => {
                                    const prevIdx = (() => {
                                        for (
                                            let i = currentIdx - 1;
                                            i >= 0;
                                            i--
                                        ) {
                                            const q = activeQuestions[i];
                                            const isDemographic =
                                                q.category ===
                                                    'Demographic Profile' ||
                                                q.isDemographic;
                                            const chosen = answers[i];
                                            const isCorrect =
                                                chosen !== undefined &&
                                                chosen !== null &&
                                                Number(chosen) ===
                                                    Number(q.correct_option);

                                            if (
                                                reviewCategoryFilter !==
                                                    'All Categories' &&
                                                q.category !==
                                                    reviewCategoryFilter
                                            ) {
                                                continue;
                                            }

                                            if (
                                                reviewSubcategoryFilter !==
                                                    'All Subcategories' &&
                                                (q.subcategory ||
                                                    'General Concepts') !==
                                                    reviewSubcategoryFilter
                                            ) {
                                                continue;
                                            }

                                            if (
                                                reviewStatusFilter ===
                                                    'correct' &&
                                                (isDemographic || !isCorrect)
                                            ) {
                                                continue;
                                            }

                                            if (
                                                reviewStatusFilter ===
                                                    'incorrect' &&
                                                (isDemographic || isCorrect)
                                            ) {
                                                continue;
                                            }

                                            if (
                                                reviewStatusFilter ===
                                                    'flagged' &&
                                                !flagged[i]
                                            ) {
                                                continue;
                                            }

                                            return i;
                                        }

                                        return -1;
                                    })();

                                    if (prevIdx !== -1) {
                                        setCurrentIdx(prevIdx);
                                    }
                                }}
                                disabled={(() => {
                                    for (let i = currentIdx - 1; i >= 0; i--) {
                                        const q = activeQuestions[i];
                                        const isDemographic =
                                            q.category ===
                                                'Demographic Profile' ||
                                            q.isDemographic;
                                        const chosen = answers[i];
                                        const isCorrect =
                                            chosen !== undefined &&
                                            chosen !== null &&
                                            Number(chosen) ===
                                                Number(q.correct_option);

                                        if (
                                            reviewCategoryFilter !==
                                                'All Categories' &&
                                            q.category !== reviewCategoryFilter
                                        ) {
                                            continue;
                                        }

                                        if (
                                            reviewSubcategoryFilter !==
                                                'All Subcategories' &&
                                            (q.subcategory ||
                                                'General Concepts') !==
                                                reviewSubcategoryFilter
                                        ) {
                                            continue;
                                        }

                                        if (
                                            reviewStatusFilter === 'correct' &&
                                            (isDemographic || !isCorrect)
                                        ) {
                                            continue;
                                        }

                                        if (
                                            reviewStatusFilter ===
                                                'incorrect' &&
                                            (isDemographic || isCorrect)
                                        ) {
                                            continue;
                                        }

                                        if (
                                            reviewStatusFilter ===
                                                'flagged' &&
                                            !flagged[i]
                                        ) {
                                            continue;
                                        }

                                        return false;
                                    }

                                    return true;
                                })()}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft className="size-4" />
                                Previous
                            </button>

                            <button
                                onClick={() => {
                                    const nextIdx = (() => {
                                        for (
                                            let i = currentIdx + 1;
                                            i < activeQuestions.length;
                                            i++
                                        ) {
                                            const q = activeQuestions[i];
                                            const isDemographic =
                                                q.category ===
                                                    'Demographic Profile' ||
                                                q.isDemographic;
                                            const chosen = answers[i];
                                            const isCorrect =
                                                chosen !== undefined &&
                                                chosen !== null &&
                                                Number(chosen) ===
                                                    Number(q.correct_option);

                                            if (
                                                reviewCategoryFilter !==
                                                    'All Categories' &&
                                                q.category !==
                                                    reviewCategoryFilter
                                            ) {
                                                continue;
                                            }

                                            if (
                                                reviewSubcategoryFilter !==
                                                    'All Subcategories' &&
                                                (q.subcategory ||
                                                    'General Concepts') !==
                                                    reviewSubcategoryFilter
                                            ) {
                                                continue;
                                            }

                                            if (
                                                reviewStatusFilter ===
                                                    'correct' &&
                                                (isDemographic || !isCorrect)
                                            ) {
                                                continue;
                                            }

                                            if (
                                                reviewStatusFilter ===
                                                    'incorrect' &&
                                                (isDemographic || isCorrect)
                                            ) {
                                                continue;
                                            }

                                            if (
                                                reviewStatusFilter ===
                                                    'flagged' &&
                                                !flagged[i]
                                            ) {
                                                continue;
                                            }

                                            return i;
                                        }

                                        return -1;
                                    })();

                                    if (nextIdx !== -1) {
                                        setCurrentIdx(nextIdx);
                                    }
                                }}
                                disabled={(() => {
                                    for (
                                        let i = currentIdx + 1;
                                        i < activeQuestions.length;
                                        i++
                                    ) {
                                        const q = activeQuestions[i];
                                        const isDemographic =
                                            q.category ===
                                                'Demographic Profile' ||
                                            q.isDemographic;
                                        const chosen = answers[i];
                                        const isCorrect =
                                            chosen !== undefined &&
                                            chosen !== null &&
                                            Number(chosen) ===
                                                Number(q.correct_option);

                                        if (
                                            reviewCategoryFilter !==
                                                'All Categories' &&
                                            q.category !== reviewCategoryFilter
                                        ) {
                                            continue;
                                        }

                                        if (
                                            reviewSubcategoryFilter !==
                                                'All Subcategories' &&
                                            (q.subcategory ||
                                                'General Concepts') !==
                                                reviewSubcategoryFilter
                                        ) {
                                            continue;
                                        }

                                        if (
                                            reviewStatusFilter === 'correct' &&
                                            (isDemographic || !isCorrect)
                                        ) {
                                            continue;
                                        }

                                        if (
                                            reviewStatusFilter ===
                                                'incorrect' &&
                                            (isDemographic || isCorrect)
                                        ) {
                                            continue;
                                        }

                                        if (
                                            reviewStatusFilter ===
                                                'flagged' &&
                                            !flagged[i]
                                        ) {
                                            continue;
                                        }

                                        return false;
                                    }

                                    return true;
                                })()}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
