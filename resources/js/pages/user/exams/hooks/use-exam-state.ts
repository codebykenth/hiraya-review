import { router, setLayoutProps, usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { triggerPdfExport } from '@/components/shared/global-pdf-exporter';
import type { Auth } from '@/types';
import type { Question, ExamResults, ExamIndexProps, SimulationDetails } from '../types';
import { isDemographicQuestion, EXAM_CONSTANTS, apiPost } from '../utils/exam-utils';
import { useExamHydration } from './use-exam-hydration';
import { useExamPersistence } from './use-exam-persistence';
import { useExamPoolBuilder } from './use-exam-pool-builder';
import { useExamSubmission } from './use-exam-submission';
import { useExamTimer } from './use-exam-timer';

export function useExamState(props: ExamIndexProps) {
    const { questions = [], savedAttempt, seenQuestionIdsByTrack, wrongQuestionIdsByTrack } = props;
    const { auth } = usePage<{ auth: Auth }>().props;

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [selectedExamId, setSelectedExamId] = useState<number | null>(1);
    const [drillCategoryId, setDrillCategoryId] = useState<number | null>(null);
    const [drillCategoryName, setDrillCategoryName] = useState<string | null>(null);
    const [drillSubcategories, setDrillSubcategories] = useState<string[]>([]);
    const [drillLanguage, setDrillLanguage] = useState<string>('English');
    const [drillQuestionCount, setDrillQuestionCount] = useState<number | 'all'>(30);

    const [isExamActive, setIsExamActive] = useState(false);
    const [isExamSubmitted, setIsExamSubmitted] = useState(false);
    const [reviewScreenActive, setReviewScreenActive] = useState(false);
    const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [answerChanges, setAnswerChanges] = useState<Record<number, number>>({});
    const [flagged, setFlagged] = useState<Record<number, boolean>>({});
    const [scratchpads, setScratchpads] = useState<Record<number, string>>({});

    const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
    const [isFreeAttempt, setIsFreeAttempt] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLockedModal, setShowLockedModal] = useState(false);

    const [isTimed, setIsTimed] = useState(true);
    const [sessionTimeLimitSecs, setSessionTimeLimitSecs] = useState<number>(
        EXAM_CONSTANTS.PROFESSIONAL_TIME_LIMIT_SECS,
    );
    const [submittedByTimer, setSubmittedByTimer] = useState(false);
    const [results, setResults] = useState<ExamResults | null>(null);

    const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'correct' | 'incorrect' | 'flagged'>('all');
    const [reviewCategoryFilter, setReviewCategoryFilter] = useState('All Categories');
    const [reviewSubcategoryFilter, setReviewSubcategoryFilter] = useState('All Subcategories');
    const [selectedPaletteCategory, setSelectedPaletteCategory] = useState('All Categories');

    const [printPool, setPrintPool] = useState<Question[] | null>(null);
    const [isPrinting, setIsPrinting] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.sessionStorage.getItem('isPdfExporting') === 'true';
        }

        return false;
    });

    const isDrillSession = selectedExamId === null || selectedExamId > 2;

    const details: SimulationDetails = useMemo(() => {
        if (selectedExamId === 2) {
            return {
                title: 'Subprofessional Level (CSC-PPT)',
                totalItems: EXAM_CONSTANTS.SUBPROFESSIONAL_TOTAL_ITEMS,
                scoredItems: EXAM_CONSTANTS.SUBPROFESSIONAL_SCORED_ITEMS,
                timeLimit: '2 Hours 40 Mins',
                timeLimitSecs: EXAM_CONSTANTS.SUBPROFESSIONAL_TIME_LIMIT_SECS,
                targetPace: '58 sec / item',
                allowedCategories: [
                    'Demographic Profile',
                    'Verbal Ability',
                    'Clerical Ability',
                    'Numerical Ability',
                    'General Information',
                ],
            };
        }

        return {
            title: 'Professional Level (CSC-PPT)',
            totalItems: EXAM_CONSTANTS.PROFESSIONAL_TOTAL_ITEMS,
            scoredItems: EXAM_CONSTANTS.PROFESSIONAL_SCORED_ITEMS,
            timeLimit: '3 Hours 10 Mins',
            timeLimitSecs: EXAM_CONSTANTS.PROFESSIONAL_TIME_LIMIT_SECS,
            targetPace: '67 sec / item',
            allowedCategories: [
                'Demographic Profile',
                'Verbal Ability',
                'Analytical Ability',
                'Numerical Ability',
                'General Information',
            ],
        };
    }, [selectedExamId]);

    // Sub-hook 1: Pool Builder
    const { buildFreshExamPool } = useExamPoolBuilder({
        questions,
        seenQuestionIdsByTrack,
        wrongQuestionIdsByTrack,
        selectedExamId,
        activeQuestions,
    });

    // Submission handler forwarding
    const onTimerExpiredCallback = useCallback(() => {
        if (isFreeAttempt) {
            setShowRegisterModal(true);
        } else {
            // Auto submit trigger
            submitHandlerRef.current?.(true);
        }
    }, [isFreeAttempt]);

    // Sub-hook 2: Timer
    const {
        timeLeft,
        setTimeLeft,
        questionTimes,
        setQuestionTimes,
        formatTime,
        resetTimer,
    } = useExamTimer({
        isExamActive,
        isExamSubmitted,
        isTimed,
        sessionTimeLimitSecs,
        currentIdx,
        onTimerExpired: onTimerExpiredCallback,
    });

    // Sub-hook 3: Submission
    const {
        executeSubmit,
        handleSubmitExam,
        confirmModal,
        setConfirmModal,
        lastStoredAttemptId,
    } = useExamSubmission({
        activeQuestions,
        answers,
        questionTimes,
        answerChanges,
        selectedExamId,
        isTimed,
        sessionTimeLimitSecs,
        timeLeft,
        drillCategoryId,
        drillCategoryName,
        drillSubcategories,
        drillLanguage,
        drillQuestionCount,
        isFreeAttempt,
        setShowRegisterModal,
        setIsExamSubmitted,
        setIsExamActive,
        setResults,
        setSubmittedByTimer,
    });

    const submitHandlerRef = { current: handleSubmitExam };
    submitHandlerRef.current = handleSubmitExam;

    const beginExamSession = useCallback(
        (examPool: Question[], examId: number | null) => {
            const isDrill = examId === null || examId > 2;
            const limitSecs = isDrill
                ? examPool.length * 60
                : examId === 2
                  ? EXAM_CONSTANTS.SUBPROFESSIONAL_TIME_LIMIT_SECS
                  : EXAM_CONSTANTS.PROFESSIONAL_TIME_LIMIT_SECS;

            setSelectedExamId(examId);
            setIsTimed(true);
            setActiveQuestions(examPool);
            setCurrentIdx(0);
            setAnswers({});
            setQuestionTimes({});
            setAnswerChanges({});
            setFlagged({});
            setSelectedPaletteCategory('All Categories');

            setSessionTimeLimitSecs(limitSecs);
            resetTimer(limitSecs);

            setIsExamActive(true);
            setIsExamSubmitted(false);
            setReviewScreenActive(false);
            setResults(null);
            setSubmittedByTimer(false);
        },
        [resetTimer],
    );

    // Sub-hook 4: Hydration & Deep Links
    useExamHydration({
        questions,
        savedAttempt,
        auth,
        isExamActive,
        isExamSubmitted,
        selectedExamId,
        setSelectedExamId,
        setActiveQuestions,
        setCurrentIdx,
        setAnswers,
        setQuestionTimes,
        setAnswerChanges,
        setFlagged,
        setIsExamActive,
        setIsExamSubmitted,
        setReviewScreenActive,
        setResults,
        setSessionTimeLimitSecs,
        setTimeLeft,
        setIsFreeAttempt,
        setSubmittedByTimer,
        setDrillCategoryId,
        setDrillCategoryName,
        setDrillSubcategories,
        setDrillLanguage,
        setDrillQuestionCount,
        setIsTimed,
        buildFreshExamPool,
        beginExamSession,
    });

    // Sub-hook 5: Session Persistence (Crash Recovery)
    useExamPersistence({
        isExamActive,
        isExamSubmitted,
        selectedExamId,
        activeQuestions,
        currentIdx,
        answers,
        questionTimes,
        answerChanges,
        flagged,
        scratchpads,
        sessionTimeLimitSecs,
        timeLeft,
        isTimed,
        onRestoreSession: useCallback((restoredData) => {
            setSelectedExamId(restoredData.selectedExamId);
            setActiveQuestions(restoredData.activeQuestions);
            setCurrentIdx(restoredData.currentIdx);
            setAnswers(restoredData.answers || {});
            setQuestionTimes(restoredData.questionTimes || {});
            setAnswerChanges(restoredData.answerChanges || {});
            setFlagged(restoredData.flagged || {});
            setScratchpads(restoredData.scratchpads || {});
            setSessionTimeLimitSecs(restoredData.sessionTimeLimitSecs);
            setTimeLeft(restoredData.timeLeft);
            setIsTimed(restoredData.isTimed);
            setIsExamActive(true);
            setIsExamSubmitted(false);
            toast.info('Restored your previous active exam session.');
        }, [setTimeLeft]),
    });

    // Event listeners
    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent('live-exam-status', {
                detail: { active: isExamActive },
            }),
        );

        return () => {
            window.dispatchEvent(
                new CustomEvent('live-exam-status', {
                    detail: { active: false },
                }),
            );
        };
    }, [isExamActive]);

    // Prevent unload warning
    useEffect(() => {
        if (!isExamActive || isExamSubmitted) {
return;
}

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = 'Active exam session in progress. Progress will be lost if you leave.';

            return e.returnValue;
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isExamActive, isExamSubmitted]);

    const reviewSubcategories = useMemo(() => {
        if (!activeQuestions) {
return [];
}

        let filtered = activeQuestions.filter((q) => !isDemographicQuestion(q));

        if (reviewCategoryFilter !== 'All Categories') {
            filtered = filtered.filter((q) => q.category === reviewCategoryFilter);
        }

        const subcats = Array.from(new Set(filtered.map((q) => q.subcategory || 'General Concepts')));

        return ['All Subcategories', ...subcats];
    }, [activeQuestions, reviewCategoryFilter]);

    const handleBeginExam = useCallback(() => {
        beginExamSession(buildFreshExamPool(selectedExamId), selectedExamId);
    }, [beginExamSession, buildFreshExamPool, selectedExamId]);

    const handleSelectOption = useCallback((optionIndex: number) => {
        setAnswers((prev) => {
            const previousAnswer = prev[currentIdx];

            if (previousAnswer === optionIndex) {
                const nextAnswers = { ...prev };
                delete nextAnswers[currentIdx];

                return nextAnswers;
            }

            if (previousAnswer !== undefined && previousAnswer !== null) {
                setAnswerChanges((changes) => ({
                    ...changes,
                    [currentIdx]: (changes[currentIdx] || 0) + 1,
                }));
            }

            return {
                ...prev,
                [currentIdx]: optionIndex,
            };
        });
    }, [currentIdx]);

    const toggleFlag = useCallback((qIndex: number) => {
        setFlagged((prev) => ({
            ...prev,
            [qIndex]: !prev[qIndex],
        }));
    }, []);

    const handleQuestionNavigate = useCallback((targetIdx: number) => {
        setCurrentIdx(targetIdx);
    }, []);

    const handleCategoryChange = useCallback(
        (category: string) => {
            setSelectedPaletteCategory(category);

            if (category !== 'All Categories') {
                const firstIdx = activeQuestions.findIndex((q) => q.category === category);

                if (firstIdx !== -1) {
                    handleQuestionNavigate(firstIdx);
                }
            }
        },
        [activeQuestions, handleQuestionNavigate],
    );

    const handleRegisterFromFreeExam = useCallback(() => {
        const state = {
            selectedExamId,
            questionIds: activeQuestions.map((q) => q.id),
            activeQuestions,
            answers,
            currentIdx,
            timeLeft,
            isTimed,
            sessionTimeLimitSecs,
        };
        localStorage.setItem('pending_free_exam', JSON.stringify(state));
        setShowRegisterModal(false);
        router.visit('/register');
    }, [selectedExamId, activeQuestions, answers, currentIdx, timeLeft, isTimed, sessionTimeLimitSecs]);

    const handleCancelFreeExam = useCallback(() => {
        setShowRegisterModal(false);
        router.visit('/');
    }, []);

    const handleExitExam = useCallback(() => {
        setConfirmModal({
            isOpen: true,
            title: 'Exit Exam Session?',
            message: 'Are you sure you want to exit? Your current progress will be lost.',
            confirmLabel: 'Exit Session',
            variant: 'danger',
            onConfirm: () => {
                setIsExamActive(false);
                setIsExamSubmitted(false);
                setReviewScreenActive(false);

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('active_exam_session_v1');
                }

                if (isDrillSession) {
                    router.visit('/drills');
                } else {
                    router.visit('/exams');
                }
            },
        });
    }, [isDrillSession, setConfirmModal]);

    const handlePrintExam = useCallback(async () => {
        const pool = buildFreshExamPool(selectedExamId);

        if (!pool || pool.length === 0) {
            toast.error('Unable to generate exam pool for export. Please try again.');
            setIsPrinting(false);

            if (typeof window !== 'undefined') {
                window.sessionStorage.removeItem('isPdfExporting');
            }

            return;
        }

        toast.loading('Verifying export limits...', { id: 'pdf-export-toast' });
        setIsPrinting(true);

        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('isPdfExporting', 'true');
        }

        try {
            const data: any = await apiPost('/exams/export-pdf-check', {});

            if (!data.success) {
                toast.error(data.message || 'PDF export rate limit reached.', {
                    id: 'pdf-export-toast',
                    duration: 6000,
                });
                setIsPrinting(false);

                if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem('isPdfExporting');
                }

                return;
            }

            toast.loading('Preparing PDF Examination Booklet...', { id: 'pdf-export-toast' });
            triggerPdfExport({
                questions: pool,
                title: details.title || 'Civil Service Examination',
                exportToken: data.export_token,
            });
        } catch {
            toast.error('Failed to verify export limits. Please try again.', { id: 'pdf-export-toast' });
            setIsPrinting(false);

            if (typeof window !== 'undefined') {
                window.sessionStorage.removeItem('isPdfExporting');
            }
        }
    }, [buildFreshExamPool, details.title, selectedExamId]);

    const getActiveTimeLimitSecs = useCallback(
        () => (isTimed ? sessionTimeLimitSecs || details.timeLimitSecs : 0),
        [isTimed, sessionTimeLimitSecs, details.timeLimitSecs],
    );

    return {
        mounted,
        isExamActive,
        isExamSubmitted,
        reviewScreenActive,
        setReviewScreenActive,
        selectedExamId,
        setSelectedExamId,
        activeQuestions,
        currentIdx,
        setCurrentIdx,
        answers,
        questionTimes,
        answerChanges,
        flagged,
        setFlagged,
        scratchpads,
        setScratchpads,
        isMobilePaletteOpen,
        setIsMobilePaletteOpen,
        isFreeAttempt,
        showRegisterModal,
        setShowRegisterModal,
        showLockedModal,
        setShowLockedModal,
        timeLeft,
        isTimed,
        submittedByTimer,
        results,
        details,
        isDrillSession,
        drillCategoryName,
        reviewCategoryFilter,
        setReviewCategoryFilter,
        reviewSubcategoryFilter,
        setReviewSubcategoryFilter,
        reviewStatusFilter,
        setReviewStatusFilter,
        reviewSubcategories,
        selectedPaletteCategory,
        confirmModal,
        setConfirmModal,
        errorMessage,
        setErrorMessage,
        printPool,
        setPrintPool,
        isPrinting,
        setIsPrinting,

        // Handlers
        formatTime,
        toggleFlag,
        handleSelectOption,
        handleQuestionNavigate,
        handleCategoryChange,
        handleRegisterFromFreeExam,
        handleCancelFreeExam,
        handleBeginExam,
        handlePrintExam,
        handleSubmitExam,
        handleExitExam,
        getActiveTimeLimitSecs,
    };
}
