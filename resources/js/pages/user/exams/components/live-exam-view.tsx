import { Head } from '@inertiajs/react';
import {
    Award,
    BookOpen,
    X,
    LayoutGrid,
    Clock,
    Timer,
    AlertCircle,
    Flag,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Lock,
    LogIn,
} from 'lucide-react';
import React, { useState } from 'react';
import { ReportIssueModal } from '@/components/domain/report-issue-modal';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { renderFormattedText } from '@/lib/exam-formatters';
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

interface LiveExamViewProps {
    details: any;
    activeQuestions: Question[];
    currentIdx: number;
    isTimed: boolean;
    timeLeft: number;
    formatTime: (secs: number) => string;
    handleExitExam: () => void;
    setIsMobilePaletteOpen: (val: boolean) => void;
    toggleFlag: (idx: number) => void;
    flagged: Record<number, boolean>;
    answers: Record<number, number>;
    handleSelectOption: (idx: number) => void;
    handleQuestionNavigate: (idx: number) => void;
    isFreeAttempt: boolean;
    setShowRegisterModal: (val: boolean) => void;
    handleSubmitExam: (isTimeout: boolean) => void;
    selectedPaletteCategory: string;
    handleCategoryChange: (cat: string) => void;
    isMobilePaletteOpen: boolean;
    showLockedModal: boolean;
    setShowLockedModal: (val: boolean) => void;
    handleRegisterFromFreeExam: () => void;
    showRegisterModal: boolean;
    handleCancelFreeExam: () => void;
    customConfirmModal: React.ReactNode;
}

export function LiveExamView({
    details,
    activeQuestions,
    currentIdx,
    isTimed,
    timeLeft,
    formatTime,
    handleExitExam,
    setIsMobilePaletteOpen,
    toggleFlag,
    flagged,
    answers,
    handleSelectOption,
    handleQuestionNavigate,
    isFreeAttempt,
    setShowRegisterModal,
    handleSubmitExam,
    selectedPaletteCategory,
    handleCategoryChange,
    isMobilePaletteOpen,
    showLockedModal,
    setShowLockedModal,
    handleRegisterFromFreeExam,
    showRegisterModal,
    handleCancelFreeExam,
    customConfirmModal,
}: LiveExamViewProps) {
    const activeQuestion = activeQuestions[currentIdx];
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    return (
        <>
            <Head title={`Live Simulation: ${details.title}`} />
            <div className="fixed inset-0 z-50 flex animate-in flex-col bg-background duration-200 fade-in">
                {/* TOP NAVBAR HEADER */}
                <div className="shadow-3xs flex h-16 items-center justify-between border-b border-border bg-card px-3 sm:px-6">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <TooltipProvider delayDuration={150}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleExitExam}
                                        className="group rounded-lg p-1.5 text-muted-foreground transition transition-all duration-300 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Exit Exam</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="hidden h-6 w-px bg-border md:block" />
                        <span className="text-md hidden items-center gap-1.5 font-heading font-bold text-foreground md:flex">
                            <Award className="size-4.5 text-blue-600 dark:text-blue-400" />
                            {details.title}
                        </span>
                    </div>

                    {activeQuestion && (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="dark:bg-blue-950/30/80 hidden inline-flex items-center gap-1 rounded-full border border-blue-100/30 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 sm:inline-flex dark:bg-blue-950/40 dark:text-blue-400">
                                <BookOpen className="size-3" />
                                {activeQuestion.category}
                            </span>
                            <span className="text-xs font-semibold text-muted-foreground">
                                <span className="font-black sm:hidden">
                                    Q: {currentIdx + 1}/{activeQuestions.length}
                                </span>
                                <span className="hidden sm:inline">
                                    Question{' '}
                                    <strong className="text-foreground">
                                        {currentIdx + 1}
                                    </strong>{' '}
                                    of {activeQuestions.length}
                                </span>
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        {isTimed ? (
                            <div
                                className={`shadow-3xs flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-sm font-black sm:px-3 ${
                                    timeLeft < 600
                                        ? 'animate-pulse border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:border-rose-900/50 dark:bg-rose-950/20 dark:bg-rose-950/30 dark:text-rose-400'
                                        : 'border-border bg-background text-foreground'
                                }`}
                            >
                                <Clock className="size-4" />
                                {formatTime(timeLeft)}
                            </div>
                        ) : (
                            <div className="shadow-3xs flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-black text-foreground sm:px-3">
                                <Timer className="size-4 text-emerald-500" />
                                <span className="text-xs font-bold text-muted-foreground">
                                    Untimed
                                </span>
                            </div>
                        )}

                        <TooltipProvider delayDuration={150}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() =>
                                            setIsMobilePaletteOpen(true)
                                        }
                                        className="shadow-3xs flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 p-2 text-white transition hover:bg-blue-700 focus:outline-none lg:hidden"
                                    >
                                        <LayoutGrid className="size-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Open Question Palette
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* MAIN TWO-COLUMN SPLIT PANEL LAYOUT */}
                <div className="flex flex-1 overflow-hidden">
                    {/* LEFT COLUMN: ACTIVE QUESTION CARD & OPTION SELECTORS */}
                    <div className="flex flex-1 flex-col justify-between overflow-y-auto bg-background p-4 sm:p-6 md:p-10">
                        <div className="mx-auto w-full max-w-3xl">
                            {activeQuestion ? (
                                <div className="flex animate-in flex-col gap-3 duration-150 fade-in sm:gap-6">
                                    {/* Question stem container */}
                                    <div className="shadow-3xs relative rounded-2xl border border-border bg-card p-4 sm:p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <span className="text-[10px] font-black tracking-wider text-blue-600 uppercase dark:text-blue-400">
                                                Multiple Choice
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        setIsReportModalOpen(
                                                            true,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-amber-600 transition hover:bg-amber-50 focus:outline-none dark:text-amber-500 dark:hover:bg-amber-950/20"
                                                >
                                                    <Flag className="size-3.5" />
                                                    Report Issue
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        toggleFlag(currentIdx)
                                                    }
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition focus:outline-none ${
                                                        flagged[currentIdx]
                                                            ? 'dark:border-rose-900/50/50 border border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                                            : 'text-muted-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    <Flag
                                                        className={`size-3.5 ${
                                                            flagged[currentIdx]
                                                                ? 'fill-rose-600 text-rose-600 dark:text-rose-400'
                                                                : ''
                                                        }`}
                                                    />
                                                    {flagged[currentIdx]
                                                        ? 'Flagged for Review'
                                                        : 'Flag for Review'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-sm leading-relaxed font-semibold text-foreground">
                                            {renderFormattedText(
                                                activeQuestion.stem,
                                                true,
                                            )}
                                        </div>
                                    </div>

                                    {/* Options Grid selector stack */}
                                    <div className="flex flex-col gap-3.5">
                                        {activeQuestion.options.map(
                                            (opt, idx) => {
                                                const label =
                                                    String.fromCharCode(
                                                        65 + idx,
                                                    );
                                                const isSelected =
                                                    answers[currentIdx] === idx;

                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() =>
                                                            handleSelectOption(
                                                                idx,
                                                            )
                                                        }
                                                        className={`shadow-3xs flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${
                                                            isSelected
                                                                ? 'dark:bg-blue-950/30/15 border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/20'
                                                                : 'border-border bg-card hover:bg-muted'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${
                                                                isSelected
                                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                                    : 'border-border bg-background text-muted-foreground'
                                                            }`}
                                                        >
                                                            {label}
                                                        </span>
                                                        <p
                                                            className={`text-sm font-bold transition md:text-base ${
                                                                isSelected
                                                                    ? 'text-blue-900 dark:text-blue-200'
                                                                    : 'text-foreground'
                                                            }`}
                                                        >
                                                            {renderFormattedText(
                                                                opt,
                                                                false,
                                                                undefined,
                                                                true,
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                    <AlertCircle className="mb-3 size-10 animate-pulse" />
                                    <span className="text-sm font-semibold">
                                        Generating questions slice...
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* CORE CONTROL BUTTONS (PREV, NEXT, SUBMIT) */}
                        <div className="mx-auto mt-8 flex w-full max-w-3xl items-center justify-between gap-4 border-t border-border pt-6">
                            <button
                                onClick={() =>
                                    handleQuestionNavigate(
                                        Math.max(0, currentIdx - 1),
                                    )
                                }
                                disabled={currentIdx === 0}
                                className="shadow-3xs flex items-center gap-1.5 rounded-lg border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft className="size-4" />
                                Previous Question
                            </button>

                            {currentIdx < activeQuestions.length - 1 ? (
                                <button
                                    onClick={() =>
                                        handleQuestionNavigate(currentIdx + 1)
                                    }
                                    className="shadow-3xs flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 focus:outline-none"
                                >
                                    Next Question
                                    <ChevronRight className="size-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleSubmitExam(false)}
                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 focus:outline-none sm:px-6"
                                >
                                    <CheckCircle2 className="size-4" />
                                    Submit Exam
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: QUESTION PALETTE GRID */}
                    <QuestionPalettePanel
                        mode="exam"
                        questions={activeQuestions}
                        currentIdx={currentIdx}
                        answers={answers}
                        flagged={flagged}
                        onNavigate={handleQuestionNavigate}
                        selectedCategory={selectedPaletteCategory}
                        onCategoryChange={handleCategoryChange}
                        allowedCategories={details.allowedCategories}
                        isFreeAttempt={isFreeAttempt}
                        onSubmitExam={() => handleSubmitExam(false)}
                        isMobile={false}
                    />
                </div>

                {/* Mobile Question Palette Drawer */}
                {isMobilePaletteOpen && (
                    <QuestionPalettePanel
                        mode="exam"
                        questions={activeQuestions}
                        currentIdx={currentIdx}
                        answers={answers}
                        flagged={flagged}
                        onNavigate={handleQuestionNavigate}
                        selectedCategory={selectedPaletteCategory}
                        onCategoryChange={handleCategoryChange}
                        allowedCategories={details.allowedCategories}
                        isFreeAttempt={isFreeAttempt}
                        onSubmitExam={() => handleSubmitExam(false)}
                        isMobile={true}
                        onCloseMobile={() => setIsMobilePaletteOpen(false)}
                    />
                )}
                {customConfirmModal}

                {/* Guest Free Attempt: Locked Question Modal */}
                {showLockedModal && (
                    <div
                        className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in"
                        onClick={() => setShowLockedModal(false)}
                    >
                        <div
                            className="relative w-full max-w-2xl animate-in rounded-xl border border-slate-200 bg-white p-4 shadow-xl duration-200 zoom-in-95 sm:p-6 dark:border-slate-800 dark:bg-slate-950"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-1 flex items-center gap-2">
                                <Lock className="size-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Premium Feature Locked
                                </h3>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                Register a free account to unlock all questions,
                                track your progress, and access more premium
                                features of the mock exam.
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowLockedModal(false)}
                                    className="rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRegisterFromFreeExam}
                                    className="group rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition transition-all duration-300 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                >
                                    Register Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Guest Free Attempt: Register / Continue Modal */}
                {showRegisterModal && (
                    <div
                        className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in"
                        onClick={() => setShowRegisterModal(false)}
                    >
                        <div
                            className="relative w-full max-w-2xl animate-in rounded-xl border border-slate-200 bg-white p-4 shadow-xl duration-200 zoom-in-95 sm:p-6 dark:border-slate-800 dark:bg-slate-950"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-1 flex items-center gap-2">
                                <Lock className="size-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                    Free Preview Limit Reached
                                </h3>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                You've completed the first 20 questions of the
                                free mock exam preview. Register a free account
                                to unlock the full exam, submit your answers,
                                and view your detailed scorecard.
                            </p>
                            <p className="mt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                ✓ Your progress will be saved and restored after
                                registration.
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={handleCancelFreeExam}
                                    className="group rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition transition-all duration-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                                >
                                    Exit to Home
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRegisterFromFreeExam}
                                    className="group flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition transition-all duration-300 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                >
                                    <LogIn className="size-4" />
                                    Register Free Account
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeQuestion && (
                    <ReportIssueModal
                        isOpen={isReportModalOpen}
                        onClose={() => setIsReportModalOpen(false)}
                        flaggableId={activeQuestion.id}
                        flaggableType="App\Models\Question"
                    />
                )}
            </div>
        </>
    );
}
