import { Head } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    LayoutGrid,
    CheckCircle2,
    X,
    HelpCircle,
} from 'lucide-react';
import React from 'react';
import QuestionPalettePanel from '@/components/question-palette-panel';
import {
    renderFormattedText,
    extractPropositions,
} from '@/lib/exam-formatters';

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
    reviewStatusFilter: 'all' | 'correct' | 'incorrect';
    setReviewStatusFilter: (status: 'all' | 'correct' | 'incorrect') => void;
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
    const currentQuestion = activeQuestions[currentIdx];
    const chosenOption = answers[currentIdx];

    return (
        <>
            <Head title={`Answer Review: ${details.title}`} />
            <div className="fixed inset-0 z-50 flex animate-in flex-col bg-background duration-200 fade-in">
                {/* TOP NAVBAR HEADER */}
                <div className="shadow-3xs flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setReviewScreenActive(false)}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg text-xs font-black text-muted-foreground transition hover:text-blue-600 focus:outline-none"
                        >
                            <ChevronLeft className="size-4" />
                            <span className="hidden sm:inline-block">
                                Back to Scorecard
                            </span>
                        </button>
                        <div className="h-4 w-px bg-border" />
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-600 uppercase dark:bg-emerald-950/20 dark:text-emerald-400">
                            Exam Answer Review
                        </span>
                        <span className="hidden text-sm font-bold text-foreground md:block">
                            {details.title}
                        </span>
                    </div>
                </div>

                {/* MAIN TWO-COLUMN SPLIT PANEL LAYOUT */}
                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT COLUMN: ACTIVE QUESTION CARD & OPTION SELECTORS */}
                    <div className="flex flex-1 flex-col justify-between overflow-y-auto bg-background p-6 md:p-10">
                        <div className="mx-auto w-full max-w-3xl">
                            {currentQuestion ? (
                                <div className="flex animate-in flex-col gap-6 duration-150 fade-in">
                                    {/* Question stem container */}
                                    <div className="shadow-3xs relative rounded-2xl border border-border bg-card p-6">
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-blue-50/50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
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
                                                <button
                                                    onClick={() =>
                                                        setFlagged((prev) => ({
                                                            ...prev,
                                                            [currentIdx]:
                                                                !prev[
                                                                    currentIdx
                                                                ],
                                                        }))
                                                    }
                                                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition focus:outline-none ${
                                                        flagged[currentIdx]
                                                            ? 'border border-rose-200/50 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                                            : 'text-muted-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    <Flag
                                                        className={`size-3.5 ${flagged[currentIdx] ? 'fill-rose-600 text-rose-600' : ''}`}
                                                    />
                                                    {flagged[currentIdx]
                                                        ? 'Flagged for Review'
                                                        : 'Flag for Review'}
                                                </button>
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
                                                            <p className="text-sm font-bold transition md:text-base">
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
                                                                        <CheckCircle2 className="dark:text-emerald-450 size-5 text-emerald-600" />
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
                                    <p className="mt-1 text-xs text-muted-foreground">
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
            </div>
        </>
    );
}
