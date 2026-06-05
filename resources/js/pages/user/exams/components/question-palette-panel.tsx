import { CheckCircle2, ChevronRight, Lock, X } from 'lucide-react';
import React, { useMemo } from 'react';

export interface QuestionPalettePanelProps {
    mode: 'exam' | 'review';
    questions: any[];
    currentIdx: number;
    answers: Record<number, any>;
    flagged: Record<number, boolean>;
    onNavigate: (idx: number) => void;

    selectedCategory: string;
    onCategoryChange: (cat: string) => void;
    allowedCategories: string[];

    isFreeAttempt?: boolean;
    onSubmitExam?: () => void;

    reviewStatusFilter?: 'all' | 'correct' | 'incorrect';
    reviewSubcategoryFilter?: string;
    onReviewStatusChange?: (status: 'all' | 'correct' | 'incorrect') => void;
    onReviewSubcategoryChange?: (subcat: string) => void;
    reviewSubcategories?: string[];

    isMobile?: boolean;
    onCloseMobile?: () => void;
}

export default function QuestionPalettePanel({
    mode,
    questions,
    currentIdx,
    answers,
    flagged,
    onNavigate,

    selectedCategory,
    onCategoryChange,
    allowedCategories,

    isFreeAttempt,
    onSubmitExam,

    reviewStatusFilter,
    reviewSubcategoryFilter,
    onReviewStatusChange,
    onReviewSubcategoryChange,
    reviewSubcategories,

    isMobile = false,
    onCloseMobile,
}: QuestionPalettePanelProps) {
    const demographicCategoryName = useMemo(() => {
        const cat = questions.find(
            (q) =>
                q.category === 'Demographic Profile' ||
                q.category.toLowerCase().includes('demographic') ||
                q.isDemographic,
        );

        return cat ? cat.category : 'Demographic Profile';
    }, [questions]);

    const hasDemographics = useMemo(() => {
        return questions.some(
            (q) =>
                q.category === 'Demographic Profile' ||
                q.category.toLowerCase().includes('demographic') ||
                q.isDemographic,
        );
    }, [questions]);

    const content = (
        <>
            {isMobile && (
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
                    <span className="font-heading text-sm font-bold text-foreground">
                        Question Palette
                    </span>
                    <button
                        onClick={onCloseMobile}
                        className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
                    >
                        <X className="size-5" />
                    </button>
                </div>
            )}

            <div className="shrink-0 space-y-3 border-b border-border bg-card p-4">
                <div>
                    <span className="mb-2 block text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                        Switch Categories
                    </span>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => onCategoryChange(e.target.value)}
                            className="w-full appearance-none rounded-lg border border-border bg-background py-2 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                        >
                            <option value="All Categories">
                                All Categories
                            </option>
                            {hasDemographics && (
                                <option value={demographicCategoryName}>
                                    {demographicCategoryName}
                                </option>
                            )}
                            {allowedCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <ChevronRight className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
                    </div>
                </div>

                {mode === 'review' &&
                    reviewSubcategories &&
                    reviewSubcategories.length > 1 &&
                    onReviewSubcategoryChange && (
                        <div>
                            <span className="mb-2 block text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                                Subcategories
                            </span>
                            <div className="relative">
                                <select
                                    value={reviewSubcategoryFilter}
                                    onChange={(e) =>
                                        onReviewSubcategoryChange(
                                            e.target.value,
                                        )
                                    }
                                    className="w-full appearance-none rounded-lg border border-border bg-background py-2 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                                >
                                    {reviewSubcategories.map((subcat) => (
                                        <option key={subcat} value={subcat}>
                                            {subcat}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
                            </div>
                        </div>
                    )}

                {mode === 'review' && onReviewStatusChange && (
                    <div>
                        <span className="mb-2 block text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                            Status Filter
                        </span>
                        <div className="flex rounded-lg bg-muted/50 p-1">
                            <button
                                onClick={() => onReviewStatusChange('all')}
                                className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${reviewStatusFilter === 'all' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => onReviewStatusChange('correct')}
                                className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${reviewStatusFilter === 'correct' ? 'bg-background text-emerald-600 shadow-xs dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Correct
                            </button>
                            <button
                                onClick={() =>
                                    onReviewStatusChange('incorrect')
                                }
                                className={`flex-1 rounded-md py-1.5 text-xs font-bold transition ${reviewStatusFilter === 'incorrect' ? 'bg-background text-rose-600 shadow-xs dark:text-rose-400' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Incorrect
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {mode === 'exam' && (
                <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[10px] font-bold text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="size-2.5 rounded bg-blue-600" />
                        <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="size-2.5 rounded border border-border bg-background" />
                        <span>Unanswered</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="size-2.5 rounded border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:border-rose-900/50 dark:bg-rose-950/20 dark:bg-rose-950/30" />
                        <span>Flagged</span>
                    </div>
                </div>
            )}

            {mode === 'review' && (
                <div className="grid shrink-0 grid-cols-3 gap-2 border-b border-border bg-muted/40 px-4 py-3 text-[10px] font-bold text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="size-2.5 rounded bg-emerald-500" />
                        <span>Correct</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="size-2.5 rounded bg-rose-500" />
                        <span>Incorrect</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="size-2.5 rounded bg-slate-300 dark:bg-slate-700" />
                        <span>Skipped</span>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto bg-card p-4">
                {!isMobile && (
                    <span className="mb-3 block text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                        Question Palette
                    </span>
                )}

                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => {
                        const isDemographic =
                            q.category === 'Demographic Profile' ||
                            q.category.toLowerCase().includes('demographic') ||
                            q.isDemographic;

                        let isFilteredOut = false;

                        if (selectedCategory !== 'All Categories') {
                            if (selectedCategory === demographicCategoryName) {
                                if (!isDemographic) {
                                    isFilteredOut = true;
                                }
                            } else if (q.category !== selectedCategory) {
                                isFilteredOut = true;
                            }
                        }

                        if (mode === 'review') {
                            if (
                                reviewSubcategoryFilter !==
                                    'All Subcategories' &&
                                (q.subcategory || 'General Concepts') !==
                                    reviewSubcategoryFilter
                            ) {
                                isFilteredOut = true;
                            }

                            const chosen = answers[idx];
                            const isCorrect =
                                chosen !== undefined &&
                                chosen !== null &&
                                Number(chosen) === Number(q.correct_option);

                            if (reviewStatusFilter === 'correct') {
                                if (isDemographic || !isCorrect) {
                                    isFilteredOut = true;
                                }
                            }

                            if (reviewStatusFilter === 'incorrect') {
                                if (isDemographic || isCorrect) {
                                    isFilteredOut = true;
                                }
                            }
                        }

                        if (mode === 'exam') {
                            const isAnswered = answers[idx] !== undefined;
                            const isFlagged = flagged[idx] === true;
                            const isActive = currentIdx === idx;

                            return (
                                <button
                                    key={`${q.id || 'q'}-${idx}`}
                                    onClick={() => {
                                        onNavigate(idx);

                                        if (isMobile && onCloseMobile) {
                                            onCloseMobile();
                                        }
                                    }}
                                    disabled={isFilteredOut}
                                    className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-lg border text-xs font-bold transition focus:outline-none ${
                                        isFilteredOut
                                            ? 'cursor-not-allowed border-border bg-background text-muted-foreground opacity-20 grayscale'
                                            : isActive
                                              ? 'border-blue-600 bg-blue-50 bg-card font-black text-blue-600 ring-2 ring-blue-600 ring-offset-1 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-offset-background'
                                              : isAnswered
                                                ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                                                : isFlagged
                                                  ? 'border-rose-300 bg-rose-50 font-extrabold text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:bg-rose-950/30 dark:text-rose-400'
                                                  : isFreeAttempt && idx >= 20
                                                    ? 'border-border bg-background text-muted-foreground/40 hover:bg-muted'
                                                    : 'border-border bg-background text-foreground hover:bg-muted'
                                    }`}
                                >
                                    {idx + 1}
                                    {isFlagged && (
                                        <div
                                            className={`absolute top-0.5 right-0.5 size-2 rounded-full border border-white shadow-xs dark:border-slate-950 ${isFilteredOut ? 'bg-slate-400' : 'bg-rose-500'}`}
                                        />
                                    )}
                                    {isFreeAttempt && idx >= 20 && (
                                        <Lock
                                            className={`absolute -top-1 -right-1 size-3 text-muted-foreground ${isFilteredOut ? 'opacity-50' : ''}`}
                                        />
                                    )}
                                </button>
                            );
                        }

                        // REVIEW MODE RENDERING
                        const chosen = answers[idx];
                        const isCorrect =
                            chosen !== undefined &&
                            chosen !== null &&
                            Number(chosen) === Number(q.correct_option);
                        const isSkipped =
                            answers[idx] === null || answers[idx] === undefined;

                        let bgColor = '';

                        if (isDemographic) {
                            bgColor = isSkipped
                                ? 'border border-border bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                : 'border border-blue-200 dark:border-blue-900/50 bg-blue-100 text-blue-700 dark:border-blue-900/50 dark:bg-blue-900/50 dark:text-blue-400';
                        } else {
                            bgColor = isSkipped
                                ? 'border border-border bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                : isCorrect
                                  ? 'border border-emerald-200 dark:border-emerald-900/50 bg-emerald-100 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/50 dark:text-emerald-400'
                                  : 'border border-rose-200 dark:border-rose-900/50 bg-rose-100 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/50 dark:text-rose-400';
                        }

                        if (currentIdx === idx) {
                            bgColor =
                                'border-blue-600 ring-2 ring-blue-500 bg-blue-600 text-white dark:bg-blue-600';
                        }

                        return (
                            <button
                                key={`${q.id || 'q'}-${idx}`}
                                onClick={() => {
                                    onNavigate(idx);

                                    if (isMobile && onCloseMobile) {
                                        onCloseMobile();
                                    }
                                }}
                                disabled={isFilteredOut}
                                className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-lg text-xs font-bold transition focus:outline-none ${bgColor} ${isFilteredOut ? 'cursor-not-allowed opacity-20 grayscale' : 'hover:opacity-80'}`}
                            >
                                {idx + 1}
                                {flagged[idx] && (
                                    <div
                                        className={`absolute top-0.5 right-0.5 size-2 rounded-full border border-white shadow-xs dark:border-slate-950 ${isFilteredOut ? 'bg-slate-400' : 'bg-rose-500'}`}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {!isMobile && mode === 'exam' && !isFreeAttempt && onSubmitExam && (
                <div className="shrink-0 border-t border-border bg-card p-4">
                    <button
                        onClick={onSubmitExam}
                        className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 focus:outline-none"
                    >
                        <CheckCircle2 className="size-4" />
                        Submit Exam
                    </button>
                </div>
            )}
        </>
    );

    if (isMobile) {
        return (
            <div
                className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-xs lg:hidden"
                onClick={onCloseMobile}
            >
                <div
                    className="flex h-full w-80 max-w-[85vw] flex-col border-l border-border bg-card shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="hidden w-80 shrink-0 flex-col border-l border-border bg-card lg:flex">
            {content}
        </div>
    );
}
