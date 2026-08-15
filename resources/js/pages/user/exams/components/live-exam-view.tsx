import { Head, usePage } from '@inertiajs/react';
import {
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
    Keyboard,
    Zap,
    TrendingUp,
    Maximize2,
    Minimize2,
    Edit3,
    EyeOff,
    Strikethrough,
    MinusCircle,
    BookOpen,
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { ReportIssueModal } from '@/components/domain/report-issue-modal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

import { renderFormattedText } from '@/lib/exam-formatters';
import { useContentShield } from '../hooks/use-content-shield';
import type { Question, SimulationDetails, LiveStatusFilter } from '../types';
import { isDemographicQuestion } from '../utils/exam-utils';
import { ExamTimerDisplay } from './exam-timer-display';
import QuestionPalettePanel from './question-palette-panel';

interface LiveExamViewProps {
    details: SimulationDetails;
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
    questionTimes?: Record<number, number>;
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
    questionTimes = {},
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
    const [liveStatusFilter, setLiveStatusFilter] = useState<
        'all' | 'unanswered' | 'answered' | 'flagged'
    >('all');
    const [autoAdvance, setAutoAdvance] = useState(false);
    const [showKeyboardModal, setShowKeyboardModal] = useState(false);
    const timeOnQuestion = questionTimes[currentIdx] || 0;

    // Advanced UI/UX feature states
    const [eliminatedOptions, setEliminatedOptions] = useState<
        Record<number, Record<number, boolean>>
    >({});
    const [scratchpadNotes, setScratchpadNotes] = useState<string>(() => {
        return localStorage.getItem('exam_scratchpad_notes') || '';
    });
    const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);

    const {
        isShielded,
        isResumeLocked,
        dismissShield,
        styleBlock,
        contentRef,
        wrapperProps,
    } = useContentShield({
        contentLabel: 'Exam',
        onCopyAttempt: (msg) => toast.error(msg),
    });

    // Auto-save scratchpad notes
    const handleScratchpadChange = (val: string) => {
        setScratchpadNotes(val);
        localStorage.setItem('exam_scratchpad_notes', val);
    };

    // Fullscreen toggle handler
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }

            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);

        return () =>
            document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // Toggle option strike-through (elimination)
    const toggleElimination = (
        e: React.MouseEvent,
        questionIdx: number,
        optionIdx: number,
    ) => {
        e.stopPropagation();
        const isCurrentlyEliminated =
            eliminatedOptions[questionIdx]?.[optionIdx];
        const willBeEliminated = !isCurrentlyEliminated;

        // If eliminating an option that is currently selected as answer, deselect it first
        if (willBeEliminated && answers[questionIdx] === optionIdx) {
            handleSelectOption(optionIdx);
        }

        setEliminatedOptions((prev) => {
            const qElim = prev[questionIdx] || {};

            return {
                ...prev,
                [questionIdx]: {
                    ...qElim,
                    [optionIdx]: willBeEliminated,
                },
            };
        });
    };

    const { user_reports_map = {} } = usePage<{
        user_reports_map?: Record<string, 'pending' | 'resolved' | 'dismissed'>;
    }>().props;

    const [localReportsMap, setLocalReportsMap] =
        useState<Record<string, 'pending' | 'resolved' | 'dismissed'>>(
            user_reports_map,
        );

    useEffect(() => {
        const handleReportSubmitted = (
            e: CustomEvent<{ flaggable_id: number }>,
        ) => {
            if (e.detail && e.detail.flaggable_id) {
                setLocalReportsMap((prev) => ({
                    ...prev,
                    [`App\\Models\\Question:${e.detail.flaggable_id}`]:
                        'pending',
                }));
            }
        };

        window.addEventListener(
            'report-submitted',
            handleReportSubmitted as EventListener,
        );

        return () => {
            window.removeEventListener(
                'report-submitted',
                handleReportSubmitted as EventListener,
            );
        };
    }, []);

    const reportStatus = activeQuestion
        ? localReportsMap[`App\\Models\\Question:${activeQuestion.id}`]
        : undefined;
    const isReported = reportStatus === 'pending';

    // Live statistics & pacing calculations
    const stats = useMemo(() => {
        let answered = 0;
        let unanswered = 0;
        let flaggedCount = 0;

        (activeQuestions || []).forEach((q, idx) => {
            if (flagged && flagged[idx]) {
                flaggedCount++;
            }

            const isDemographic =
                q.category === 'Demographic Profile' ||
                q.category?.toLowerCase().includes('demographic') ||
                q.isDemographic;

            if (isDemographic) {
                return;
            }

            const chosen = answers ? answers[idx] : undefined;

            if (chosen !== undefined && chosen !== null) {
                answered++;
            } else {
                unanswered++;
            }
        });

        const totalGraded = answered + unanswered;
        const progressPct =
            totalGraded > 0 ? Math.round((answered / totalGraded) * 100) : 0;

        // Target Pace: seconds available per remaining unanswered question
        const targetPace =
            unanswered > 0 ? Math.round(timeLeft / unanswered) : 0;

        let paceStatus: 'good' | 'warn' | 'behind' = 'good';

        if (targetPace < 20) {
            paceStatus = 'behind';
        } else if (targetPace < 40) {
            paceStatus = 'warn';
        }

        return {
            answered,
            unanswered,
            flagged: flaggedCount,
            totalGraded,
            progressPct,
            targetPace,
            paceStatus,
        };
    }, [activeQuestions, answers, flagged, timeLeft]);

    // Format current question time
    const formatQuestionTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;

        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const onOptionClick = (optIdx: number) => {
        const isCurrentlySelected = answers[currentIdx] === optIdx;
        handleSelectOption(optIdx);

        if (
            !isCurrentlySelected &&
            autoAdvance &&
            currentIdx < activeQuestions.length - 1
        ) {
            setTimeout(() => {
                handleQuestionNavigate(currentIdx + 1);
            }, 250);
        }
    };

    // Navigation-only Keyboard Listener (security keys handled by useContentShield)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                ['INPUT', 'TEXTAREA', 'SELECT'].includes(
                    (e.target as HTMLElement)?.tagName,
                )
            ) {
                return;
            }

            if (e.key === 'ArrowRight' || e.key === ']' || e.key === 'n') {
                if (currentIdx < activeQuestions.length - 1) {
                    handleQuestionNavigate(currentIdx + 1);
                }
            } else if (
                e.key === 'ArrowLeft' ||
                e.key === '[' ||
                e.key === 'p'
            ) {
                if (currentIdx > 0) {
                    handleQuestionNavigate(currentIdx - 1);
                }
            } else if (e.key === 'f' || e.key === 'F') {
                toggleFlag(currentIdx);
            } else if (e.key === '?' || e.key === '/') {
                e.preventDefault();
                setShowKeyboardModal((prev) => !prev);
            } else if (
                [
                    '1',
                    '2',
                    '3',
                    '4',
                    '5',
                    'a',
                    'b',
                    'c',
                    'd',
                    'e',
                    'A',
                    'B',
                    'C',
                    'D',
                    'E',
                ].includes(e.key)
            ) {
                const optionMap: Record<string, number> = {
                    '1': 0,
                    a: 0,
                    A: 0,
                    '2': 1,
                    b: 1,
                    B: 1,
                    '3': 2,
                    c: 2,
                    C: 2,
                    '4': 3,
                    d: 3,
                    D: 3,
                    '5': 4,
                    e: 4,
                    E: 4,
                };
                const optIdx = optionMap[e.key];

                if (
                    optIdx !== undefined &&
                    activeQuestion?.options?.[optIdx] !== undefined
                ) {
                    if (e.altKey) {
                        e.preventDefault();
                        const isCurrentlyEliminated = eliminatedOptions[currentIdx]?.[optIdx];
                        const willBeEliminated = !isCurrentlyEliminated;

                        if (willBeEliminated && answers[currentIdx] === optIdx) {
                            handleSelectOption(optIdx);
                        }

                        setEliminatedOptions((prev) => ({
                            ...prev,
                            [currentIdx]: {
                                ...(prev[currentIdx] || {}),
                                [optIdx]: willBeEliminated,
                            },
                        }));
                    } else if (!eliminatedOptions[currentIdx]?.[optIdx]) {
                        handleSelectOption(optIdx);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });

        return () =>
            window.removeEventListener('keydown', handleKeyDown, {
                capture: true,
            });
    }, [
        currentIdx,
        activeQuestions,
        activeQuestion,
        autoAdvance,
        eliminatedOptions,
        handleQuestionNavigate,
        handleSelectOption,
        toggleFlag,
    ]);

    return (
        <>
            <Head title={`Live Simulation: ${details.title}`} />
            <style>{styleBlock}</style>
            {isShielded && (
                <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-card p-6 text-center opacity-100 select-none">
                    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border/80 bg-background p-8 shadow-2xl">
                        <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                            <Lock className="size-7" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-heading text-lg font-bold text-foreground">
                                Content Shield Active
                            </h3>
                            <p className="text-xs leading-relaxed font-semibold text-muted-foreground">
                                Exam content was hidden because window focus was
                                lost or external screen tools were detected.
                            </p>
                            {isResumeLocked && (
                                <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                    Content stays locked while the exam window
                                    is not focused. Click back into this window,
                                    then resume.
                                </p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={dismissShield}
                            disabled={isResumeLocked}
                            className={`mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition focus:outline-none ${
                                isResumeLocked
                                    ? 'cursor-not-allowed bg-slate-400 opacity-60'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isResumeLocked
                                ? 'Window Not Focused — Click to Focus'
                                : 'Resume Examination'}
                        </button>
                    </div>
                </div>
            )}
            <div
                ref={contentRef}
                {...wrapperProps}
                className={`fixed inset-0 z-50 flex flex-col bg-background transition-none select-none ${
                    isShielded
                        ? 'pointer-events-none invisible opacity-0'
                        : 'opacity-100'
                }`}
            >
                {/* TOP NAVBAR HEADER: RESPONSIVE MULTI-ROW MICRO-LAYOUT */}
                <div className="shadow-3xs flex w-full flex-col justify-center gap-2 border-b border-border bg-card px-3 py-3 sm:px-5 lg:h-[84px]">
                    {/* ROW 1: Exit, Title, Tools & Timer */}
                    <div className="flex w-full items-center justify-between gap-1.5 text-sm font-bold">
                        {/* Left: Exit & Exam Title */}
                        <div className="flex min-w-0 items-center gap-1.5">
                            <button
                                onClick={handleExitExam}
                                title="Exit Exam"
                                className="group flex h-8 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground focus-visible:outline-none"
                            >
                                <ChevronLeft className="size-4" />
                                <span className="hidden sm:inline">
                                    Exit Exam
                                </span>
                            </button>

                            <div className="h-4 w-px shrink-0 bg-border" />

                            <span className="shrink-0 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-blue-600 uppercase dark:bg-blue-950/30 dark:text-blue-400">
                                <span className="md:hidden">Live</span>
                                <span className="hidden md:inline">
                                    Live Simulation
                                </span>
                            </span>

                            <span className="truncate font-heading text-sm font-bold text-foreground">
                                {details.title}
                            </span>
                        </div>

                        {/* Right: Compact tool icons + Timer + Palette */}
                        <div className="flex shrink-0 items-center gap-1.5 text-xs">
                            {/* Pace Engine */}
                            {isTimed && stats.unanswered > 0 && (
                                <div
                                    title={`Target pace: ~${stats.targetPace}s per question`}
                                    className={`inline-flex h-8 items-center gap-1 rounded-md border px-2 font-bold ${
                                        stats.paceStatus === 'behind'
                                            ? 'animate-pulse border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'
                                            : stats.paceStatus === 'warn'
                                              ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400'
                                              : 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                                    }`}
                                >
                                    <TrendingUp className="size-4 shrink-0" />
                                    <span className="whitespace-nowrap">
                                        ~{stats.targetPace}s/q
                                    </span>
                                    <span className="hidden whitespace-nowrap md:inline">
                                        {stats.paceStatus === 'behind'
                                            ? '• Speed Up'
                                            : stats.paceStatus === 'warn'
                                              ? '• Moderate'
                                              : '• On Track'}
                                    </span>
                                </div>
                            )}

                            {/* Auto-Next */}
                            <button
                                onClick={() => {
                                    const nextState = !autoAdvance;
                                    setAutoAdvance(nextState);

                                    if (nextState) {
                                        toast.success('Auto-Next Enabled', {
                                            description:
                                                'Question will automatically advance after selecting an answer.',
                                            duration: 2500,
                                        });
                                    } else {
                                        toast.info('Auto-Next Disabled', {
                                            duration: 2000,
                                        });
                                    }
                                }}
                                title={`Auto-Advance after answering (${autoAdvance ? 'ON' : 'OFF'})`}
                                className={`flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition ${
                                    autoAdvance
                                        ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400'
                                        : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                            >
                                <Zap
                                    className={`size-3.5 shrink-0 ${autoAdvance ? 'fill-blue-600 text-blue-600 dark:text-blue-400' : ''}`}
                                />
                                <span className="hidden whitespace-nowrap sm:inline">
                                    Auto-Next
                                </span>
                            </button>

                            {/* Scratchpad Notes */}
                            <button
                                onClick={() => setIsScratchpadOpen(true)}
                                title="Scratchpad / Notes"
                                className={`relative flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition ${
                                    scratchpadNotes.trim().length > 0
                                        ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-400'
                                        : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
                                }`}
                            >
                                <Edit3 className="size-3.5 shrink-0" />
                                <span className="hidden whitespace-nowrap md:inline">
                                    Notes
                                </span>
                                {scratchpadNotes.trim().length > 0 && (
                                    <span className="absolute -top-1 -right-1 size-2 rounded-full bg-amber-500 ring-2 ring-background" />
                                )}
                            </button>

                            {/* Keyboard Shortcuts — hidden on mobile */}
                            <button
                                onClick={() => setShowKeyboardModal(true)}
                                title="Keyboard Shortcuts (?)"
                                className="hidden size-8 h-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground sm:flex"
                            >
                                <Keyboard className="size-4 shrink-0" />
                            </button>

                            {/* Fullscreen Toggle — hidden on mobile */}
                            <button
                                onClick={toggleFullscreen}
                                title={
                                    isFullscreen
                                        ? 'Exit Fullscreen'
                                        : 'Focus Mode (Fullscreen)'
                                }
                                className="hidden size-8 h-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:bg-accent hover:text-foreground sm:flex"
                            >
                                {isFullscreen ? (
                                    <Minimize2 className="size-4 shrink-0" />
                                ) : (
                                    <Maximize2 className="size-4 shrink-0" />
                                )}
                            </button>

                            {/* Divider before timer */}
                            <div className="mx-0.5 h-4 w-px shrink-0 bg-border/60" />

                            {/* Timer */}
                            <ExamTimerDisplay
                                isTimed={isTimed}
                                timeLeft={timeLeft}
                                formatTime={formatTime}
                            />

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
                                className={`shadow-3xs flex h-8 cursor-pointer items-center justify-center rounded-lg px-2.5 transition focus:outline-none ${
                                    isPaletteCollapsed
                                        ? 'border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-400'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                <LayoutGrid className="size-4 shrink-0" />
                                <span className="ml-1.5 hidden text-xs font-bold whitespace-nowrap sm:inline">
                                    Palette
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* ROW 2: Category Pill, Question Counter & Answered Progress */}
                    {activeQuestion && (
                        <div className="flex w-full items-center justify-between gap-1.5 text-xs font-medium text-muted-foreground">
                            <div className="flex min-w-0 items-center gap-1.5">
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-blue-100/40 bg-blue-50/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400">
                                    <BookOpen className="size-3" />
                                    <span className="max-w-[120px] truncate sm:max-w-none">
                                        {activeQuestion.category}
                                    </span>
                                </span>

                                <span className="text-muted-foreground/30">
                                    •
                                </span>

                                <span className="whitespace-nowrap">
                                    Question{' '}
                                    <strong className="font-extrabold text-foreground">
                                        {currentIdx + 1}
                                    </strong>{' '}
                                    of {activeQuestions.length}
                                </span>
                            </div>

                            <span className="shrink-0 whitespace-nowrap text-muted-foreground">
                                <span className="hidden sm:inline">
                                    Answered{' '}
                                </span>
                                <strong className="font-extrabold text-foreground">
                                    {stats.answered}/{stats.totalGraded}
                                </strong>{' '}
                                <span className="xs:inline hidden">
                                    ({stats.progressPct}%)
                                </span>
                            </span>
                        </div>
                    )}
                </div>

                {/* HORIZONTAL COMPLETION PROGRESS BAR */}
                <div
                    title={`Exam Completion: ${stats.progressPct}% (${stats.answered} of ${stats.totalGraded} answered)`}
                    aria-label={`Exam Completion Progress: ${stats.progressPct}%`}
                    className="relative h-1.5 w-full overflow-hidden bg-muted/60"
                >
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
                        style={{ width: `${stats.progressPct}%` }}
                    />
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
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black tracking-wider text-blue-600 uppercase dark:text-blue-400">
                                                    Multiple Choice
                                                </span>
                                                <span className="rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                                    Time on question:{' '}
                                                    {formatQuestionTime(
                                                        timeOnQuestion,
                                                    )}
                                                </span>
                                            </div>
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
                                                            : 'text-amber-600 hover:bg-amber-50 dark:text-amber-500 dark:hover:bg-amber-950/20'
                                                    }`}
                                                >
                                                    <AlertCircle
                                                        className={`size-3.5 ${
                                                            isReported
                                                                ? 'fill-muted-foreground/20 text-muted-foreground'
                                                                : ''
                                                        }`}
                                                    />
                                                    {isReported
                                                        ? 'Reported'
                                                        : 'Report Issue'}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        toggleFlag(currentIdx)
                                                    }
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition focus:outline-none ${
                                                        flagged[currentIdx]
                                                            ? 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400'
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
                                                const isEliminated =
                                                    !!eliminatedOptions[
                                                        currentIdx
                                                    ]?.[idx];

                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() =>
                                                            !isEliminated &&
                                                            onOptionClick(idx)
                                                        }
                                                        className={`shadow-3xs group relative flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                                                            isEliminated
                                                                ? 'border-dashed border-border/70 bg-muted/25 opacity-45'
                                                                : isSelected
                                                                  ? 'border-blue-600 bg-blue-50/90 shadow-sm dark:border-blue-500 dark:bg-blue-950/40'
                                                                  : 'border-border bg-card hover:border-blue-500/40 hover:bg-accent/40'
                                                        }`}
                                                    >
                                                        <div className="flex min-w-0 flex-1 items-center gap-4">
                                                            <span
                                                                className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${
                                                                    isEliminated
                                                                        ? 'border-border bg-muted/60 text-muted-foreground line-through'
                                                                        : isSelected
                                                                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                                                                          : 'border-border bg-background text-muted-foreground group-hover:border-border/80 group-hover:text-foreground'
                                                                }`}
                                                            >
                                                                {label}
                                                            </span>
                                                            <p
                                                                className={`text-sm font-bold transition md:text-base ${
                                                                    isEliminated
                                                                        ? 'text-muted-foreground line-through'
                                                                        : isSelected
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

                                                        {/* Option Strikethrough Elimination Toggle */}
                                                        <button
                                                            type="button"
                                                            onClick={(e) =>
                                                                toggleElimination(
                                                                    e,
                                                                    currentIdx,
                                                                    idx,
                                                                    )
                                                            }
                                                            title={
                                                                isEliminated
                                                                    ? 'Restore choice'
                                                                    : 'Strike out choice (Eliminate)'
                                                            }
                                                            className={`inline-flex shrink-0 items-center gap-1 rounded-lg p-2 text-xs font-bold transition ${
                                                                isEliminated
                                                                    ? 'bg-rose-100/80 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-400'
                                                                    : 'text-muted-foreground opacity-30 hover:bg-muted hover:text-foreground hover:opacity-100'
                                                            }`}
                                                        >
                                                            <Strikethrough className="size-4" />
                                                            {isEliminated && (
                                                                <span className="hidden text-[10px] sm:inline">
                                                                    Struck
                                                                </span>
                                                            )}
                                                        </button>
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
                        liveStatusFilter={liveStatusFilter}
                        onLiveStatusChange={setLiveStatusFilter}
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
                        liveStatusFilter={liveStatusFilter}
                        onLiveStatusChange={setLiveStatusFilter}
                        isMobile={true}
                        onCloseMobile={() => setIsMobilePaletteOpen(false)}
                    />
                )}
                {customConfirmModal}

                {/* Keyboard Shortcuts Reference Dialog Modal */}
                <Dialog
                    open={showKeyboardModal}
                    onOpenChange={setShowKeyboardModal}
                >
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold">
                                <Keyboard className="size-5 text-blue-600 dark:text-blue-400" />
                                Keyboard Shortcuts
                            </DialogTitle>
                            <DialogDescription>
                                Speed up your test-taking with these hotkeys.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-2 space-y-3">
                            <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-semibold">
                                <span className="text-muted-foreground">
                                    Select Option
                                </span>
                                <div className="flex items-center gap-1">
                                    <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                        1 - 5
                                    </kbd>
                                    <span className="text-muted-foreground">
                                        or
                                    </span>
                                    <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                        A - E
                                    </kbd>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-semibold">
                                <span className="text-muted-foreground">
                                    Next Question
                                </span>
                                <div className="flex items-center gap-1">
                                    <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                        →
                                    </kbd>
                                    <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                        ]
                                    </kbd>
                                    <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                        N
                                    </kbd>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-semibold">
                                <span className="text-muted-foreground">
                                    Previous Question
                                </span>
                                <div className="flex items-center gap-1">
                                    <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                        ←
                                    </kbd>
                                    <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                        [
                                    </kbd>
                                    <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                        P
                                    </kbd>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-b border-border pb-2 text-xs font-semibold">
                                <span className="text-muted-foreground">
                                    Toggle Flag for Review
                                </span>
                                <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                    F
                                </kbd>
                            </div>

                            <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-muted-foreground">
                                    Open Shortcuts Cheatsheet
                                </span>
                                <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono text-[11px] font-bold text-foreground">
                                    ?
                                </kbd>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Scratchpad Notes Dialog Modal */}
                <Dialog
                    open={isScratchpadOpen}
                    onOpenChange={setIsScratchpadOpen}
                >
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 font-heading text-lg font-bold">
                                <Edit3 className="size-5 text-amber-500" />
                                Exam Scratchpad & Rough Notes
                            </DialogTitle>
                            <DialogDescription>
                                Write down formulas, rough calculations, or
                                reasoning notes. Your notes auto-save locally.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-2 space-y-3">
                            <textarea
                                value={scratchpadNotes}
                                onChange={(e) =>
                                    handleScratchpadChange(e.target.value)
                                }
                                placeholder="Type your rough calculations or notes here..."
                                rows={8}
                                className="w-full resize-y rounded-xl border border-border bg-muted/30 p-3 font-mono text-xs font-medium text-foreground transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{scratchpadNotes.length} characters</span>
                                <button
                                    type="button"
                                    onClick={() => handleScratchpadChange('')}
                                    className="font-bold text-rose-600 transition hover:underline dark:text-rose-400"
                                >
                                    Clear Notes
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Guest Free Attempt: Locked Question Modal */}
                {showLockedModal && (
                    <div
                        className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in"
                        onClick={() => setShowLockedModal(false)}
                    >
                        <div
                            className="relative flex max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl animate-in flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl duration-200 zoom-in-95 sm:w-full sm:p-6 dark:border-slate-800 dark:bg-slate-950"
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
                            className="relative flex max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl animate-in flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl duration-200 zoom-in-95 sm:w-full sm:p-6 dark:border-slate-800 dark:bg-slate-950"
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

                {isReportModalOpen && activeQuestion && (
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
