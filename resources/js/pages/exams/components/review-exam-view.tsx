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
            <div className="mx-auto flex h-full w-full flex-1 animate-in flex-col gap-6 overflow-y-auto bg-background p-6 duration-250 fade-in">
                {/* Back Link to Scorecard */}
                <button
                    onClick={() => setReviewScreenActive(false)}
                    className="flex w-fit cursor-pointer items-center gap-1 text-xs font-black text-foreground transition hover:text-blue-600 focus:outline-none"
                >
                    <ChevronLeft className="size-4" />
                    Back to Scorecard
                </button>

                {/* 1. Header Navigation Bar */}
                <div className="flex flex-col gap-4 rounded-xl border-b border-border bg-card p-5 shadow-xs md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-emerald-600 uppercase dark:bg-emerald-950/20 dark:text-emerald-400">
                                Exam Answer Review
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                                {details.title}
                            </span>
                        </div>
                        <h2 className="mt-1 font-heading text-lg font-bold text-foreground">
                            Review Explanation
                        </h2>
                    </div>
                </div>

                {/* 2. Main Question + Side Navigation Split */}
                <div className="relative flex w-full flex-col pb-10 lg:flex-row">
                    {/* Left Question Body Column */}
                    <div className="z-10 w-full min-w-0 flex-1 lg:pr-6">
                        <div className="flex h-full flex-col rounded-xl border border-border bg-card shadow-xs">
                            <div className="flex-1 p-6 pr-5">
                                {currentQuestion ? (
                                    <>
                                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                    Question {currentIdx + 1} of{' '}
                                                    {activeQuestions.length}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        setIsMobilePaletteOpen(
                                                            true,
                                                        )
                                                    }
                                                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-[10px] font-bold text-foreground shadow-sm transition hover:bg-muted focus:outline-none lg:hidden"
                                                >
                                                    <LayoutGrid className="size-3" />
                                                    Palette
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setFlagged((prev) => ({
                                                        ...prev,
                                                        [currentIdx]:
                                                            !prev[currentIdx],
                                                    }));
                                                }}
                                                className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                                                    flagged[currentIdx]
                                                        ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400'
                                                        : 'border-border text-muted-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <Flag
                                                    className={`size-3.5 ${
                                                        flagged[currentIdx]
                                                            ? 'fill-current'
                                                            : ''
                                                    }`}
                                                />
                                                {flagged[currentIdx]
                                                    ? 'Flagged for Review'
                                                    : 'Flag for Review'}
                                            </button>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-blue-50/50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                                    {currentQuestion.category}
                                                </span>
                                                <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-extrabold text-muted-foreground">
                                                    {currentQuestion.subcategory ||
                                                        'General Concepts'}
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                {renderFormattedText(
                                                    currentQuestion.stem,
                                                    true,
                                                )}
                                            </div>

                                            {/* Options */}
                                            <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
                                                {currentQuestion.options.map(
                                                    (opt, idx) => {
                                                        const letter =
                                                            String.fromCharCode(
                                                                65 + idx,
                                                            );
                                                        const isChosen =
                                                            chosenOption !==
                                                                undefined &&
                                                            chosenOption !==
                                                                null &&
                                                            Number(
                                                                chosenOption,
                                                            ) === idx;
                                                        const isCorrectOption =
                                                            idx ===
                                                            currentQuestion.correct_option;
                                                        const isDemographic =
                                                            currentQuestion.isDemographic ||
                                                            currentQuestion.category ===
                                                                'Demographic Profile';

                                                        let optionStyle =
                                                            'border-border bg-background hover:bg-muted text-foreground';
                                                        let badgeStyle =
                                                            'bg-muted text-muted-foreground';

                                                        if (isDemographic) {
                                                            if (isChosen) {
                                                                optionStyle =
                                                                    'bg-blue-50/70 border-blue-200 text-blue-950 font-bold dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-300';
                                                                badgeStyle =
                                                                    'bg-blue-600 text-white';
                                                            }
                                                        } else if (
                                                            isCorrectOption
                                                        ) {
                                                            optionStyle =
                                                                'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300';
                                                            badgeStyle =
                                                                'bg-emerald-600 text-white';
                                                        } else if (isChosen) {
                                                            optionStyle =
                                                                'bg-rose-50/70 border-rose-250 text-rose-950 font-bold dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300';
                                                            badgeStyle =
                                                                'bg-rose-600 text-white';
                                                        } else {
                                                            optionStyle =
                                                                'border-border bg-background hover:bg-muted text-foreground/60 opacity-60';
                                                            badgeStyle =
                                                                'bg-muted text-muted-foreground/60';
                                                        }

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className="relative flex items-center"
                                                            >
                                                                <div
                                                                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${optionStyle}`}
                                                                >
                                                                    <div className="flex items-center gap-2.5">
                                                                        <span
                                                                            className={`inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${badgeStyle}`}
                                                                        >
                                                                            {
                                                                                letter
                                                                            }
                                                                        </span>
                                                                        <span className="text-sm leading-tight">
                                                                            {
                                                                                opt
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {!isDemographic &&
                                                                        isCorrectOption && (
                                                                            <div className="flex shrink-0 items-center gap-1.5">
                                                                                {isChosen && (
                                                                                    <span className="hidden text-[9px] font-black tracking-wider text-emerald-700 uppercase sm:inline-block dark:text-emerald-400">
                                                                                        Your
                                                                                        Answer
                                                                                    </span>
                                                                                )}
                                                                                <CheckCircle2 className="dark:text-emerald-450 size-4 text-emerald-600" />
                                                                            </div>
                                                                        )}
                                                                    {!isDemographic &&
                                                                        isChosen &&
                                                                        !isCorrectOption && (
                                                                            <div className="flex shrink-0 items-center gap-1.5">
                                                                                <span className="hidden text-[9px] font-black tracking-wider text-rose-700 uppercase sm:inline-block dark:text-rose-400">
                                                                                    Your
                                                                                    Answer
                                                                                </span>
                                                                                <X className="text-rose-650 dark:text-rose-450 size-4" />
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>

                                            {(() => {
                                                const propositions =
                                                    extractPropositions(
                                                        currentQuestion.stem,
                                                    );
                                                const letterMap: Record<
                                                    string,
                                                    string
                                                > = {};

                                                propositions.forEach(
                                                    (prop, idx) => {
                                                        const newLetter =
                                                            String.fromCharCode(
                                                                65 + idx,
                                                            );
                                                        letterMap[prop.letter] =
                                                            newLetter;
                                                    },
                                                );

                                                return (
                                                    <>
                                                        {currentQuestion.explanation && (
                                                            <div className="mt-6 rounded-xl border border-border bg-muted/60 p-4.5 text-xs leading-relaxed text-muted-foreground">
                                                                <span className="mb-2 block font-bold text-foreground">
                                                                    Explanation
                                                                    &amp;
                                                                    Rationale:
                                                                </span>

                                                                {propositions.length >
                                                                    0 && (
                                                                    <div className="shadow-3xs mb-4 rounded-xl border border-border bg-background p-3">
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

                                        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                                            <button
                                                onClick={() => {
                                                    const prevIdx = (() => {
                                                        for (
                                                            let i =
                                                                currentIdx - 1;
                                                            i >= 0;
                                                            i--
                                                        ) {
                                                            const q =
                                                                activeQuestions[
                                                                    i
                                                                ];
                                                            const isDemographic =
                                                                q.category ===
                                                                    'Demographic Profile' ||
                                                                q.isDemographic;
                                                            const chosen =
                                                                answers[i];
                                                            const isCorrect =
                                                                chosen !==
                                                                    undefined &&
                                                                chosen !==
                                                                    null &&
                                                                Number(
                                                                    chosen,
                                                                ) ===
                                                                    Number(
                                                                        q.correct_option,
                                                                    );

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
                                                                (isDemographic ||
                                                                    !isCorrect)
                                                            ) {
                                                                continue;
                                                            }

                                                            if (
                                                                reviewStatusFilter ===
                                                                    'incorrect' &&
                                                                (isDemographic ||
                                                                    isCorrect)
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
                                                    for (
                                                        let i = currentIdx - 1;
                                                        i >= 0;
                                                        i--
                                                    ) {
                                                        const q =
                                                            activeQuestions[i];
                                                        const isDemographic =
                                                            q.category ===
                                                                'Demographic Profile' ||
                                                            q.isDemographic;
                                                        const chosen =
                                                            answers[i];
                                                        const isCorrect =
                                                            chosen !==
                                                                undefined &&
                                                            chosen !== null &&
                                                            Number(chosen) ===
                                                                Number(
                                                                    q.correct_option,
                                                                );

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
                                                            (isDemographic ||
                                                                !isCorrect)
                                                        ) {
                                                            continue;
                                                        }

                                                        if (
                                                            reviewStatusFilter ===
                                                                'incorrect' &&
                                                            (isDemographic ||
                                                                isCorrect)
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
                                                            let i =
                                                                currentIdx + 1;
                                                            i <
                                                            activeQuestions.length;
                                                            i++
                                                        ) {
                                                            const q =
                                                                activeQuestions[
                                                                    i
                                                                ];
                                                            const isDemographic =
                                                                q.category ===
                                                                    'Demographic Profile' ||
                                                                q.isDemographic;
                                                            const chosen =
                                                                answers[i];
                                                            const isCorrect =
                                                                chosen !==
                                                                    undefined &&
                                                                chosen !==
                                                                    null &&
                                                                Number(
                                                                    chosen,
                                                                ) ===
                                                                    Number(
                                                                        q.correct_option,
                                                                    );

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
                                                                (isDemographic ||
                                                                    !isCorrect)
                                                            ) {
                                                                continue;
                                                            }

                                                            if (
                                                                reviewStatusFilter ===
                                                                    'incorrect' &&
                                                                (isDemographic ||
                                                                    isCorrect)
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
                                                        i <
                                                        activeQuestions.length;
                                                        i++
                                                    ) {
                                                        const q =
                                                            activeQuestions[i];
                                                        const isDemographic =
                                                            q.category ===
                                                                'Demographic Profile' ||
                                                            q.isDemographic;
                                                        const chosen =
                                                            answers[i];
                                                        const isCorrect =
                                                            chosen !==
                                                                undefined &&
                                                            chosen !== null &&
                                                            Number(chosen) ===
                                                                Number(
                                                                    q.correct_option,
                                                                );

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
                                                            (isDemographic ||
                                                                !isCorrect)
                                                        ) {
                                                            continue;
                                                        }

                                                        if (
                                                            reviewStatusFilter ===
                                                                'incorrect' &&
                                                            (isDemographic ||
                                                                isCorrect)
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
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <HelpCircle className="mb-3 size-12 text-muted-foreground" />
                                        <h3 className="text-base font-bold text-foreground">
                                            No questions match filters
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Try switching to a different
                                            category or status pill.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Question Palette */}
                    <div className="hidden shrink-0 lg:block">
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
                </div>

                {/* Mobile Question Palette Drawer for Review Screen */}
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
