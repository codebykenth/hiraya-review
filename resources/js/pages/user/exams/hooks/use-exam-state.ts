import { router, setLayoutProps, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fallbackDemographicQuestions } from '@/data/fallback-demographics';
import { formatDuration } from '@/lib/exam-formatters';
import type { Auth } from '@/types';
import type { Question, ExamResults, ExamIndexProps } from '../types';

const shuffleOptionsForQuestion = (q: Question): Question => {
    const indices = q.options.map((_, i) => i);

    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const shuffledOptions = indices.map((i) => q.options[i]);
    const newCorrect = indices.indexOf(q.correct_option);

    return {
        ...q,
        options: shuffledOptions,
        correct_option: newCorrect,
        originalOptionIndices: indices,
    };
};

export function useExamState({
    questions = [],
    savedAttempt,
    seenQuestionIdsByTrack = {
        Professional: [],
        Subprofessional: [],
        Drill: [],
    },
}: ExamIndexProps) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const fallbackQuestions: Question[] = questions;
    const demographicQuestions: Question[] = useMemo(
        () =>
            questions.filter(
                (q) =>
                    q.category === 'Demographic Profile' ||
                    q.category.toLowerCase().includes('demographic') ||
                    q.isDemographic,
            ),
        [questions],
    );

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setTimeout(() => setMounted(true), 0);
    }, []);

    // Synchronously parse active session to avoid any layout flash on reload
    const restoredSession = (() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);

            if (params.get('attempt_id') || savedAttempt) {
                return null;
            }

            const savedSessionStr = localStorage.getItem('active_exam_session');

            if (savedSessionStr) {
                try {
                    const session = JSON.parse(savedSessionStr);

                    if (
                        session &&
                        session.questionIds &&
                        session.questionIds.length > 0
                    ) {
                        const isDrillUrl = params.get('drill') === 'true';

                        if (isDrillUrl && params.has('category_id')) {
                            localStorage.removeItem('active_exam_session');

                            return null;
                        }

                        if (
                            !isDrillUrl &&
                            session.drillCategoryId !== null &&
                            session.drillCategoryId !== undefined
                        ) {
                            return null;
                        }

                        if (isDrillUrl && session.drillCategoryId === null) {
                            return null;
                        }

                        return session;
                    }
                } catch {
                    return null;
                }
            }
        }

        return null;
    })();

    const getRestoredQuestions = (sessionQuestionIds: number[]) => {
        let loadedQuestions = [...questions];

        if (questions.length === 0) {
            loadedQuestions = [...fallbackQuestions];
        }

        return sessionQuestionIds
            .map((id: number) => {
                return (
                    loadedQuestions.find((q) => q.id === id) ||
                    demographicQuestions.find((q) => q.id === id) ||
                    fallbackQuestions.find((q) => q.id === id)
                );
            })
            .filter(Boolean) as Question[];
    };

    const [selectedExamId, setSelectedExamId] = useState<number | null>(() => {
        if (restoredSession) {
            return restoredSession.selectedExamId;
        }

        return 1;
    });
    const [drillCategoryId, setDrillCategoryId] = useState<number | null>(
        () => {
            if (restoredSession) {
                return restoredSession.drillCategoryId;
            }

            return null;
        },
    );
    const [drillCategoryName, setDrillCategoryName] = useState<string | null>(
        () => {
            if (restoredSession) {
                return restoredSession.drillCategoryName;
            }

            return null;
        },
    );
    const [drillSubcategories, setDrillSubcategories] = useState<string[]>(
        () => {
            if (restoredSession) {
                return restoredSession.drillSubcategories || [];
            }

            return [];
        },
    );
    const [drillLanguage, setDrillLanguage] = useState<string>(() => {
        if (restoredSession) {
            return restoredSession.drillLanguage || 'English';
        }

        return 'English';
    });
    const [drillQuestionCount, setDrillQuestionCount] = useState<
        number | 'all'
    >(() => {
        if (restoredSession) {
            return restoredSession.drillQuestionCount || 30;
        }

        return 30;
    });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'success' | 'danger';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'success',
        onConfirm: () => {},
    });

    const [isExamActive, setIsExamActive] = useState(() => {
        return restoredSession !== null;
    });

    // Notify global layout widgets (like SupportWidget) when the user is actively taking an exam
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
    const [activeQuestions, setActiveQuestions] = useState<Question[]>(() => {
        if (restoredSession) {
            const pool = getRestoredQuestions(restoredSession.questionIds);

            return pool.map(shuffleOptionsForQuestion);
        }

        return [];
    });
    const [currentIdx, setCurrentIdx] = useState(() => {
        if (restoredSession) {
            return restoredSession.currentIdx;
        }

        return 0;
    });
    const [answers, setAnswers] = useState<Record<number, number>>(() => {
        if (restoredSession) {
            return restoredSession.answers || {};
        }

        return {};
    });
    const [flagged, setFlagged] = useState<Record<number, boolean>>(() => {
        if (restoredSession) {
            return restoredSession.flagged || {};
        }

        return {};
    });
    const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
    const [isFreeAttempt, setIsFreeAttempt] = useState(() => {
        if (restoredSession) {
            return restoredSession.isFreeAttempt || false;
        }

        return false;
    });
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLockedModal, setShowLockedModal] = useState(false);
    const [isExamSubmitted, setIsExamSubmitted] = useState(false);
    const [reviewScreenActive, setReviewScreenActive] = useState(false);
    const [reviewStatusFilter, setReviewStatusFilter] = useState<
        'all' | 'correct' | 'incorrect'
    >('all');
    const [reviewCategoryFilter, setReviewCategoryFilter] =
        useState('All Categories');
    const [reviewSubcategoryFilter, setReviewSubcategoryFilter] =
        useState('All Subcategories');

    const reviewSubcategories = useMemo(() => {
        if (!activeQuestions) {
            return [];
        }

        const filtered =
            reviewCategoryFilter !== 'All Categories'
                ? activeQuestions.filter(
                      (q) => q.category === reviewCategoryFilter,
                  )
                : activeQuestions;

        const subcats = Array.from(
            new Set(filtered.map((q) => q.subcategory || 'General Concepts')),
        );

        return ['All Subcategories', ...subcats];
    }, [activeQuestions, reviewCategoryFilter]);

    const [isRestored] = useState(true);
    const [selectedPaletteCategory, setSelectedPaletteCategory] =
        useState('All Categories');

    const [timeLeft, setTimeLeft] = useState<number>(() => {
        if (restoredSession) {
            return restoredSession.timeLeft;
        }

        return 11400;
    });
    const [sessionTimeLimitSecs, setSessionTimeLimitSecs] = useState<number>(
        () => {
            if (restoredSession) {
                return restoredSession.sessionTimeLimitSecs;
            }

            return 11400;
        },
    );
    const timeLeftRef = useRef(timeLeft);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isTimed, setIsTimed] = useState<boolean>(() => {
        if (restoredSession) {
            return restoredSession.isTimed !== false;
        }

        return true;
    });

    const activeQuestionsRef = useRef<Question[]>(activeQuestions);
    const answersRef = useRef<Record<number, number>>(answers);
    const sessionTimeLimitSecsRef = useRef<number>(sessionTimeLimitSecs);

    const isTimedRef = useRef<boolean>(isTimed);
    const selectedExamIdRef = useRef<number | null>(selectedExamId);
    const drillCategoryNameRef = useRef<string | null>(drillCategoryName);
    const drillCategoryIdRef = useRef<number | null>(drillCategoryId);
    const savedAttemptRef = useRef<any>(savedAttempt);
    const drillSubcategoriesRef = useRef<string[]>(drillSubcategories);
    const drillLanguageRef = useRef<string>(drillLanguage);
    const drillQuestionCountRef = useRef<number | 'all'>(drillQuestionCount);
    const isFreeAttemptRef = useRef<boolean>(false);

    const getSimulationDetails = useCallback(
        (examId: number | null) => {
            if (examId === 1) {
                return {
                    title: 'Professional Level Reviewer',
                    totalItems: 170,
                    scoredItems: 150,
                    timeLimit: '3h 10m',
                    timeLimitSecs: 11400,
                    targetPace: '1.1 min/item',
                    allowedCategories: [
                        'Verbal Ability',
                        'Analytical Ability',
                        'Numerical Ability',
                        'General Information',
                    ],
                };
            }

            if (examId === 2) {
                return {
                    title: 'Sub-Professional Level Reviewer',
                    totalItems: 165,
                    scoredItems: 145,
                    timeLimit: '2h 40m',
                    timeLimitSecs: 9600,
                    targetPace: '1.0 min/item',
                    allowedCategories: [
                        'Verbal Ability',
                        'Clerical Ability',
                        'Numerical Ability',
                        'General Information',
                    ],
                };
            }

            return {
                title:
                    drillCategoryName ||
                    savedAttempt?.cat_scores?.metadata?.category_name ||
                    'Practice Drill',
                totalItems: activeQuestions.length || 30,
                scoredItems: activeQuestions.length || 30,
                timeLimit: formatDuration(sessionTimeLimitSecs || 0),
                timeLimitSecs: sessionTimeLimitSecs || 0,
                targetPace: '1.0 min/item',
                allowedCategories: Array.from(
                    new Set(
                        activeQuestions
                            .filter(
                                (q) =>
                                    q.category !== 'Demographic Profile' &&
                                    !q.category
                                        .toLowerCase()
                                        .includes('demographic') &&
                                    !q.isDemographic,
                            )
                            .map((q) => q.category),
                    ),
                ).sort((a, b) => {
                    const order = [
                        'Verbal Ability',
                        'Analytical Ability',
                        'Clerical Ability',
                        'Numerical Ability',
                        'General Information',
                    ];
                    const idxA = order.indexOf(a);
                    const idxB = order.indexOf(b);

                    if (idxA !== -1 && idxB !== -1) {
                        return idxA - idxB;
                    }

                    if (idxA !== -1) {
                        return -1;
                    }

                    if (idxB !== -1) {
                        return 1;
                    }

                    return a.localeCompare(b);
                }),
            };
        },
        [
            drillCategoryName,
            savedAttempt,
            activeQuestions,
            sessionTimeLimitSecs,
        ],
    );

    const details = getSimulationDetails(selectedExamId);
    const detailsTitle = details.title;
    const detailsTimeLimitSecs = details.timeLimitSecs;
    const isDrillSession =
        selectedExamId === null ||
        selectedExamId > 2 ||
        savedAttempt?.cat_scores?.metadata?.track === 'Drill' ||
        drillCategoryName !== null;
    const detailsTitleRef = useRef<string>(detailsTitle);
    const detailsTimeLimitSecsRef = useRef<number>(detailsTimeLimitSecs);

    useEffect(() => {
        activeQuestionsRef.current = activeQuestions;
        answersRef.current = answers;
        sessionTimeLimitSecsRef.current = sessionTimeLimitSecs;
        detailsTitleRef.current = detailsTitle;
        detailsTimeLimitSecsRef.current = detailsTimeLimitSecs;
        isTimedRef.current = isTimed;
        selectedExamIdRef.current = selectedExamId;
        drillCategoryNameRef.current = drillCategoryName;
        drillCategoryIdRef.current = drillCategoryId;
        savedAttemptRef.current = savedAttempt;
        drillSubcategoriesRef.current = drillSubcategories;
        drillLanguageRef.current = drillLanguage;
        drillQuestionCountRef.current = drillQuestionCount;
        isFreeAttemptRef.current = isFreeAttempt;
    }, [
        activeQuestions,
        answers,
        sessionTimeLimitSecs,
        detailsTitle,
        detailsTimeLimitSecs,
        isTimed,
        selectedExamId,
        drillCategoryName,
        drillCategoryId,
        savedAttempt,
        drillSubcategories,
        drillLanguage,
        drillQuestionCount,
        isFreeAttempt,
    ]);

    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    // Auto-save active exam session to localStorage in real-time
    useEffect(() => {
        if (!isRestored) {
            return;
        }

        if (isExamActive && activeQuestions.length > 0) {
            const state = {
                selectedExamId,
                drillCategoryId,
                drillCategoryName,
                drillSubcategories,
                drillLanguage,
                drillQuestionCount,
                questionIds: activeQuestions.map((q) => q.id),
                answers,
                flagged,
                currentIdx,
                timeLeft,
                isTimed,
                sessionTimeLimitSecs,
                isFreeAttempt,
            };
            localStorage.setItem('active_exam_session', JSON.stringify(state));
        } else if (!isExamActive && !isExamSubmitted) {
            localStorage.removeItem('active_exam_session');
        }
    }, [
        isRestored,
        isExamActive,
        activeQuestions,
        selectedExamId,
        drillCategoryId,
        drillCategoryName,
        drillSubcategories,
        drillLanguage,
        drillQuestionCount,
        answers,
        flagged,
        currentIdx,
        timeLeft,
        isTimed,
        sessionTimeLimitSecs,
        isFreeAttempt,
        isExamSubmitted,
    ]);

    // Clear auto-save session on successful submission
    useEffect(() => {
        if (isExamSubmitted) {
            localStorage.removeItem('active_exam_session');
        }
    }, [isExamSubmitted]);

    // Ensure the active question is visible in the palette, reset to All Categories if out of bounds
    useEffect(() => {
        if (activeQuestions && activeQuestions[currentIdx]) {
            const currentCategory = activeQuestions[currentIdx].category;

            setTimeout(() => {
                setSelectedPaletteCategory((prevFilter) => {
                    if (
                        prevFilter !== 'All Categories' &&
                        prevFilter !== currentCategory
                    ) {
                        return 'All Categories';
                    }

                    return prevFilter;
                });
            }, 0);
        }
    }, [currentIdx, activeQuestions]);

    // Sync currentIdx with review filters dynamically
    useEffect(() => {
        if (
            !reviewScreenActive ||
            !activeQuestions ||
            activeQuestions.length === 0
        ) {
            return;
        }

        const isMatch = (q: Question, idx: number) => {
            if (
                reviewCategoryFilter !== 'All Categories' &&
                q.category !== reviewCategoryFilter
            ) {
                return false;
            }

            if (
                reviewSubcategoryFilter !== 'All Subcategories' &&
                (q.subcategory || 'General Concepts') !==
                    reviewSubcategoryFilter
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

            if (reviewStatusFilter === 'correct') {
                if (isDemographic || !isCorrect) {
                    return false;
                }
            }

            if (reviewStatusFilter === 'incorrect') {
                if (isDemographic || isCorrect) {
                    return false;
                }
            }

            return true;
        };

        if (
            activeQuestions[currentIdx] &&
            isMatch(activeQuestions[currentIdx], currentIdx)
        ) {
            return;
        }

        const firstMatchIdx = activeQuestions.findIndex(isMatch);

        if (firstMatchIdx !== -1) {
            setTimeout(() => {
                setCurrentIdx(firstMatchIdx);
            }, 0);
        }
    }, [
        reviewCategoryFilter,
        reviewSubcategoryFilter,
        reviewStatusFilter,
        reviewScreenActive,
        activeQuestions,
        currentIdx,
        answers,
    ]);

    const [submittedByTimer, setSubmittedByTimer] = useState(false);
    const [lastStoredAttemptId, setLastStoredAttemptId] = useState<
        number | null
    >(null);

    const [results, setResults] = useState<ExamResults | null>(null);

    // Auto-hydrate saved attempt when loaded via deep link
    useEffect(() => {
        if (savedAttempt) {
            let loadedQuestions = [...questions];
            const allAvailablePools = [
                ...fallbackQuestions,
                ...demographicQuestions,
                ...fallbackDemographicQuestions,
            ];

            if (
                savedAttempt.question_ids &&
                savedAttempt.question_ids.length > 0
            ) {
                const missingIds = savedAttempt.question_ids.filter(
                    (id: number) => !loadedQuestions.some((q) => q.id === id),
                );
                missingIds.forEach((id: number) => {
                    const fallbackQ = allAvailablePools.find(
                        (q) => q.id === id,
                    );

                    if (fallbackQ) {
                        loadedQuestions.push(fallbackQ);
                    }
                });

                loadedQuestions = savedAttempt.question_ids
                    .map((id: number) => {
                        return (
                            loadedQuestions.find((q) => q.id === id) ||
                            allAvailablePools.find((q) => q.id === id)
                        );
                    })
                    .filter(Boolean) as Question[];
            }

            const catScores = savedAttempt.cat_scores ?? {};
            const meta = catScores.metadata ?? {};
            const correctCount = meta.correct_count || 0;
            const total = meta.total_questions || loadedQuestions.length;
            const percentage =
                total > 0 ? Math.round((correctCount / total) * 100) : 0;
            const wrongCount = total - correctCount - (meta.skipped_count || 0);

            const isTimedSaved = meta.is_timed !== false;
            const isSubprofessional = meta.track === 'Subprofessional';
            const limitSecs = isTimedSaved
                ? isSubprofessional
                    ? 9000
                    : 11400
                : 0;
            const storedDuration = Number(
                meta.duration_secs ?? catScores.duration_secs ?? 0,
            );
            const elapsedSecs = isTimedSaved
                ? Math.min(limitSecs, Math.max(0, storedDuration))
                : storedDuration;

            const computedCatMap: Record<
                string,
                {
                    correct: number;
                    total: number;
                    subcats: Record<string, { correct: number; total: number }>;
                }
            > = {};

            loadedQuestions.forEach((q, idx) => {
                const chosen = savedAttempt.answers[idx];
                const isCorrect = chosen === q.correct_option;

                if (q.category === 'Demographic Profile' || q.isDemographic) {
                    return;
                }

                if (!computedCatMap[q.category]) {
                    computedCatMap[q.category] = {
                        correct: 0,
                        total: 0,
                        subcats: {},
                    };
                }

                computedCatMap[q.category].total += 1;

                const subcatName = q.subcategory || 'General Concepts';

                if (!computedCatMap[q.category].subcats[subcatName]) {
                    computedCatMap[q.category].subcats[subcatName] = {
                        correct: 0,
                        total: 0,
                    };
                }

                computedCatMap[q.category].subcats[subcatName].total += 1;

                if (chosen !== undefined && isCorrect) {
                    computedCatMap[q.category].correct += 1;
                    computedCatMap[q.category].subcats[subcatName].correct += 1;
                }
            });

            let finalCatMap =
                savedAttempt.cat_scores?.categoryScoreMap ||
                savedAttempt.cat_scores;
            const hasSubcats =
                finalCatMap &&
                Object.values(finalCatMap).some(
                    (c: any) => c.subcats && Object.keys(c.subcats).length > 0,
                );

            if (!hasSubcats || Object.keys(computedCatMap).length > 0) {
                finalCatMap = computedCatMap;
            }

            setTimeout(() => {
                setActiveQuestions(loadedQuestions);
                setAnswers(savedAttempt.answers);
                setIsTimed(isTimedSaved);

                if (meta.track === 'Drill') {
                    setSelectedExamId(null as any);
                    setDrillCategoryId(savedAttempt.category_id);
                    setDrillCategoryName(
                        meta.category_name || 'Practice Drill',
                    );
                    setDrillSubcategories(meta.selected_subcategories || []);
                    setDrillLanguage(meta.language || 'English');
                    setDrillQuestionCount(
                        meta.question_count || loadedQuestions.length,
                    );
                } else {
                    setSelectedExamId(isSubprofessional ? 2 : 1);
                }

                setSessionTimeLimitSecs(isTimedSaved ? limitSecs : 0);
                setTimeLeft(
                    isTimedSaved
                        ? Math.max(0, limitSecs - elapsedSecs)
                        : elapsedSecs,
                );

                setResults({
                    score: correctCount,
                    total,
                    percentage,
                    correctCount,
                    wrongCount,
                    skippedCount: meta.skipped_count || 0,
                    categoryScoreMap: finalCatMap,
                    elapsedSecs,
                });

                setIsExamSubmitted(true);
                setIsExamActive(false);

                const params = new URLSearchParams(window.location.search);

                if (params.get('review') === 'true') {
                    setReviewScreenActive(true);
                }
            }, 0);
        }
    }, [savedAttempt, questions, fallbackQuestions, demographicQuestions]);

    // Dynamically update layout breadcrumbs at the top header
    useEffect(() => {
        if (isExamSubmitted && results) {
            const parentTitle = isDrillSession ? 'Practice' : 'Exams';
            const parentHref = isDrillSession ? '/drills' : '/exams';
            const attemptTitle = isDrillSession
                ? `Drill: ${drillCategoryName || savedAttempt?.cat_scores?.metadata?.category_name || 'Practice Drill'}`
                : `Exam Attempt #${savedAttempt?.id || lastStoredAttemptId || 104}`;

            if (savedAttempt) {
                if (reviewScreenActive) {
                    setTimeout(() => {
                        setLayoutProps({
                            breadcrumbs: [
                                { title: 'History', href: '/history' },
                                {
                                    title: attemptTitle,
                                    href: `/exams?attempt_id=${savedAttempt.id}`,
                                },
                                { title: 'Answer Review', href: '#' },
                            ],
                        });
                    }, 0);
                } else {
                    setTimeout(() => {
                        setLayoutProps({
                            breadcrumbs: [
                                { title: 'History', href: '/history' },
                                { title: attemptTitle, href: '#' },
                            ],
                        });
                    }, 0);
                }
            } else {
                if (reviewScreenActive) {
                    setTimeout(() => {
                        setLayoutProps({
                            breadcrumbs: [
                                { title: parentTitle, href: parentHref },
                                { title: 'History', href: '/history' },
                                {
                                    title: attemptTitle,
                                    href: `/exams?attempt_id=${lastStoredAttemptId || 104}`,
                                },
                                { title: 'Answer Review', href: '#' },
                            ],
                        });
                    }, 0);
                } else {
                    setTimeout(() => {
                        setLayoutProps({
                            breadcrumbs: [
                                { title: parentTitle, href: parentHref },
                                { title: 'History', href: '/history' },
                                { title: attemptTitle, href: '#' },
                            ],
                        });
                    }, 0);
                }
            }
        } else {
            setTimeout(() => {
                setLayoutProps({
                    breadcrumbs: [{ title: 'Exams', href: '/exams' }],
                });
            }, 0);
        }
    }, [
        isExamSubmitted,
        results,
        reviewScreenActive,
        savedAttempt,
        isDrillSession,
        drillCategoryName,
        lastStoredAttemptId,
    ]);

    const getActiveTimeLimitSecs = () =>
        isTimed ? sessionTimeLimitSecs || details.timeLimitSecs : 0;

    const getTrackNameForExam = (examId: number | null) =>
        examId === 2 ? 'Subprofessional' : 'Professional';

    const getSeenIdsForExam = useCallback(
        (examId: number | null) => {
            const track = getTrackNameForExam(examId);
            const fromServer =
                seenQuestionIdsByTrack[
                    track as keyof typeof seenQuestionIdsByTrack
                ] ?? [];
            const fromCurrentSession =
                selectedExamId === examId && activeQuestions.length > 0
                    ? activeQuestions.map((q) => q.id)
                    : [];

            return [...new Set([...fromServer, ...fromCurrentSession])];
        },
        [seenQuestionIdsByTrack, selectedExamId, activeQuestions],
    );

    const buildFreshExamPool = useCallback(
        (examId: number | null) => {
            const sourcePool =
                questions.length > 0 ? questions : fallbackQuestions;

            const verbalPool = sourcePool.filter(
                (q) => q.category === 'Verbal Ability',
            );
            const analyticalPool = sourcePool.filter(
                (q) => q.category === 'Analytical Ability',
            );
            const numericalPool = sourcePool.filter(
                (q) => q.category === 'Numerical Ability',
            );
            const clericalPool = sourcePool.filter(
                (q) => q.category === 'Clerical Ability',
            );
            const generalPool = sourcePool.filter(
                (q) => q.category === 'General Information',
            );

            const seenSet = new Set(getSeenIdsForExam(examId));

            // Helper: pick N items from a flat pool, prioritizing unseen
            const pickFlat = (
                pool: Question[],
                count: number,
                catName: string,
            ): Question[] => {
                const unseen = pool.filter((q) => !seenSet.has(q.id));
                const seen = pool.filter((q) => seenSet.has(q.id));
                let picked = [...unseen].sort(() => Math.random() - 0.5);

                if (picked.length < count) {
                    picked = [
                        ...picked,
                        ...[...seen]
                            .sort(() => Math.random() - 0.5)
                            .slice(0, count - picked.length),
                    ];
                }

                if (picked.length < count) {
                    const fbPool = fallbackQuestions.filter(
                        (q) =>
                            q.category === catName &&
                            !picked.some((p) => p.id === q.id),
                    );
                    picked = [
                        ...picked,
                        ...[...fbPool]
                            .sort(() => Math.random() - 0.5)
                            .slice(0, count - picked.length),
                    ];
                }

                while (picked.length < count && picked.length > 0) {
                    picked.push(
                        picked[Math.floor(Math.random() * picked.length)],
                    );
                }

                return picked.slice(0, count);
            };

            // Balanced picker: distributes evenly across subcategories
            // For Verbal, splits each subcategory ~50/50 English/Filipino
            const pickBalanced = (
                pool: Question[],
                targetCount: number,
                catName: string,
                splitLanguage = false,
            ): Question[] => {
                // Group by subcategory
                const groups: Record<string, Question[]> = {};
                pool.forEach((q) => {
                    const key = q.subcategory || 'General';

                    if (!groups[key]) {
                        groups[key] = [];
                    }

                    groups[key].push(q);
                });

                const subcatNames = Object.keys(groups);

                if (subcatNames.length === 0) {
                    return pickFlat(pool, targetCount, catName);
                }

                // Divide quota evenly, distribute remainder round-robin
                const baseQuota = Math.floor(targetCount / subcatNames.length);
                let remainder = targetCount % subcatNames.length;
                const picked: Question[] = [];

                for (const subName of subcatNames) {
                    const quota = baseQuota + (remainder > 0 ? 1 : 0);

                    if (remainder > 0) {
                        remainder--;
                    }

                    const subPool = groups[subName];

                    if (splitLanguage) {
                        // Split ~50/50 English vs Filipino within this subcategory
                        const engPool = subPool.filter((q) => {
                            const lang = (q.language || '').toLowerCase();

                            return lang === 'english' || lang === '';
                        });
                        const filPool = subPool.filter((q) => {
                            const lang = (q.language || '').toLowerCase();

                            return (
                                lang.includes('filipino') ||
                                lang.includes('tagalog')
                            );
                        });

                        const filQuota =
                            filPool.length > 0
                                ? Math.min(
                                      Math.floor(quota / 2),
                                      filPool.length,
                                  )
                                : 0;
                        const engQuota = quota - filQuota;

                        picked.push(
                            ...pickFlat(engPool, engQuota, catName),
                            ...pickFlat(filPool, filQuota, catName),
                        );
                    } else {
                        picked.push(...pickFlat(subPool, quota, catName));
                    }
                }

                return picked.slice(0, targetCount);
            };

            const scoredPool: Question[] = [];

            if (examId === 1) {
                // Professional Level: 150 scored items
                // Verbal: balanced across subcategories, ~50/50 English/Filipino
                scoredPool.push(
                    ...pickBalanced(verbalPool, 45, 'Verbal Ability', true),
                );
                scoredPool.push(
                    ...pickBalanced(analyticalPool, 52, 'Analytical Ability'),
                );
                scoredPool.push(
                    ...pickBalanced(numericalPool, 45, 'Numerical Ability'),
                );
                scoredPool.push(
                    ...pickBalanced(generalPool, 8, 'General Information'),
                );
            } else {
                // Subprofessional Level: 145 scored items
                scoredPool.push(
                    ...pickBalanced(verbalPool, 45, 'Verbal Ability', true),
                );
                scoredPool.push(
                    ...pickBalanced(clericalPool, 47, 'Clerical Ability'),
                );
                scoredPool.push(
                    ...pickBalanced(numericalPool, 45, 'Numerical Ability'),
                );
                scoredPool.push(
                    ...pickBalanced(generalPool, 8, 'General Information'),
                );
            }

            let finalDemographics = [...demographicQuestions];

            if (finalDemographics.length < 20) {
                const needed = 20 - finalDemographics.length;
                const shuffledFallbacks = [
                    ...fallbackDemographicQuestions,
                ].sort(() => Math.random() - 0.5);
                finalDemographics = [
                    ...finalDemographics,
                    ...shuffledFallbacks.slice(0, needed),
                ];
            } else if (finalDemographics.length > 20) {
                finalDemographics = finalDemographics
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 20);
            }

            finalDemographics.sort(() => Math.random() - 0.5);

            const finalPool = [...finalDemographics, ...scoredPool];

            return finalPool.map(shuffleOptionsForQuestion);
        },
        [questions, fallbackQuestions, demographicQuestions, getSeenIdsForExam],
    );

    const beginExamSession = useCallback(
        (examPool: Question[], examId: number | null) => {
            const specs = getSimulationDetails(examId);
            const isDrill = examId === null || examId > 2;

            setSelectedExamId(examId);
            setIsTimed(true);
            setActiveQuestions(examPool);
            setCurrentIdx(0);
            setAnswers({});
            setFlagged({});
            setSelectedPaletteCategory('All Categories');

            const limitSecs = isDrill
                ? examPool.length * 60
                : specs.timeLimitSecs;
            setSessionTimeLimitSecs(limitSecs);
            setTimeLeft(limitSecs);
            timeLeftRef.current = limitSecs;

            setIsExamActive(true);
            setIsExamSubmitted(false);
            setReviewScreenActive(false);
            setResults(null);
            setSubmittedByTimer(false);
        },
        [getSimulationDetails],
    );

    const handleBeginExam = () => {
        beginExamSession(buildFreshExamPool(selectedExamId), selectedExamId);
    };

    // Auto-start exam session when passed from dashboard/drill deep links
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const startType = params.get('start');
        const isDrillStart = params.get('drill') === 'true';

        if (startType && !savedAttempt) {
            const examId = startType === 'subprofessional' ? 2 : 1;
            const isFree = params.get('free_attempt') === '1';
            const url = new URL(window.location.href);
            url.searchParams.delete('start');
            url.searchParams.delete('free_attempt');
            window.history.replaceState({}, '', url.toString());

            setTimeout(() => {
                if (isFree) {
                    setIsFreeAttempt(true);
                }

                setSelectedExamId(examId);
                beginExamSession(buildFreshExamPool(examId), examId);
            }, 0);
        } else if (isDrillStart && !savedAttempt) {
            const catName =
                params.get('category_name') || 'General Information';
            const catId = params.get('category_id')
                ? Number(params.get('category_id'))
                : null;
            const qCountParam = params.get('question_count') || '30';
            const lang = params.get('language') || 'English';
            const subcatsStr = params.get('subcategories');
            const isTimedParam = params.get('timed') !== 'false';
            let subcats: string[] = [];

            if (subcatsStr) {
                try {
                    subcats = JSON.parse(subcatsStr);
                } catch {
                    /* ignore */
                }
            }

            const url = new URL(window.location.href);
            url.searchParams.delete('drill');
            url.searchParams.delete('category_id');
            url.searchParams.delete('category_name');
            url.searchParams.delete('question_count');
            url.searchParams.delete('language');
            url.searchParams.delete('subcategories');
            url.searchParams.delete('timed');
            window.history.replaceState({}, '', url.toString());

            const sourcePool =
                questions.length > 0 ? questions : fallbackQuestions;

            let pool = sourcePool.filter((q) => {
                const catMatch =
                    q.category.toLowerCase().includes(catName.toLowerCase()) ||
                    catName.toLowerCase().includes(q.category.toLowerCase());
                const subcatMatch =
                    subcats.length === 0 ||
                    subcats.some(
                        (subName) =>
                            q.subcategory
                                .toLowerCase()
                                .includes(subName.toLowerCase()) ||
                            subName
                                .toLowerCase()
                                .includes(q.subcategory.toLowerCase()),
                    );

                let langMatch = true;

                if (lang === 'English') {
                    langMatch = q.language === 'English' || !q.language;
                } else if (lang === 'Filipino') {
                    langMatch = q.language === 'Filipino';
                }

                return catMatch && subcatMatch && langMatch;
            });

            if (pool.length === 0) {
                pool = sourcePool.filter(
                    (q) =>
                        q.category
                            .toLowerCase()
                            .includes(catName.toLowerCase()) ||
                        catName
                            .toLowerCase()
                            .includes(q.category.toLowerCase()),
                );
            }

            if (pool.length === 0) {
                pool = sourcePool.slice(0, 30);
            }

            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            const countLimit =
                qCountParam === 'all' ? shuffled.length : Number(qCountParam);
            const finalPool = shuffled
                .slice(0, Math.min(countLimit, shuffled.length))
                .map(shuffleOptionsForQuestion);

            const limitSecs = isTimedParam ? finalPool.length * 60 : 0;

            setTimeout(() => {
                setDrillCategoryId(catId);
                setDrillCategoryName(`${catName} Practice`);
                setDrillSubcategories(subcats);
                setDrillLanguage(lang);
                setDrillQuestionCount(
                    qCountParam === 'all' ? 'all' : Number(qCountParam),
                );

                setSelectedExamId(null as any);
                setIsTimed(isTimedParam);
                setActiveQuestions(finalPool);
                setCurrentIdx(0);
                setAnswers({});
                setFlagged({});
                setSelectedPaletteCategory('All Categories');
                setSessionTimeLimitSecs(limitSecs);
                setTimeLeft(isTimedParam ? limitSecs : 0);
                timeLeftRef.current = isTimedParam ? limitSecs : 0;
                setIsExamActive(true);
                setIsExamSubmitted(false);
                setReviewScreenActive(false);
                setResults(null);
                setSubmittedByTimer(false);

                setLayoutProps({
                    breadcrumbs: [
                        { title: 'Practice', href: '/drills' },
                        { title: `${catName} Active Practice`, href: '#' },
                    ],
                });
            }, 0);
        }
    }, [
        questions,
        savedAttempt,
        fallbackQuestions,
        beginExamSession,
        buildFreshExamPool,
    ]);

    // Restore guest free exam session after registration
    useEffect(() => {
        if (!auth?.user) {
            return;
        }

        if (questions.length === 0) {
            return;
        }

        if (isExamActive || isExamSubmitted) {
            return;
        }

        const savedState = localStorage.getItem('pending_free_exam');

        if (!savedState) {
            return;
        }

        try {
            const state = JSON.parse(savedState);
            localStorage.removeItem('pending_free_exam');

            const sourcePool = [...questions, ...demographicQuestions];
            const pool: Question[] = state.questionIds
                .map((id: number) =>
                    sourcePool.find((q: Question) => q.id === id),
                )
                .filter((q: Question | undefined): q is Question => Boolean(q))
                .map(shuffleOptionsForQuestion);

            if (pool.length === 0) {
                return;
            }

            setTimeout(() => {
                setSelectedExamId(state.selectedExamId);
                setIsTimed(state.isTimed);
                setActiveQuestions(pool);
                setCurrentIdx(state.currentIdx);
                setAnswers(state.answers || {});
                setFlagged({});
                setSelectedPaletteCategory('All Categories');
                setSessionTimeLimitSecs(state.sessionTimeLimitSecs);
                setTimeLeft(state.timeLeft);
                timeLeftRef.current = state.timeLeft;
                setIsFreeAttempt(false);
                setIsExamActive(true);
                setIsExamSubmitted(false);
                setReviewScreenActive(false);
                setResults(null);
                setSubmittedByTimer(false);
            }, 0);
        } catch {
            localStorage.removeItem('pending_free_exam');
        }
    }, [
        auth?.user,
        questions,
        demographicQuestions,
        isExamActive,
        isExamSubmitted,
    ]);

    const handleSubmitExamRef = useRef<(auto?: boolean) => void>(() => {});

    // Live countdown timer
    useEffect(() => {
        if (isExamActive && !isExamSubmitted) {
            timerRef.current = setInterval(() => {
                if (isTimed) {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current!);
                            timeLeftRef.current = 0;

                            if (isFreeAttemptRef.current) {
                                setShowRegisterModal(true);
                            } else {
                                handleSubmitExamRef.current(true);
                            }

                            return 0;
                        }

                        const next = prev - 1;
                        timeLeftRef.current = next;

                        return next;
                    });
                } else {
                    setTimeLeft((prev) => {
                        const next = prev + 1;
                        timeLeftRef.current = next;

                        return next;
                    });
                }
            }, 1000);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isExamActive, isExamSubmitted, isTimed]);

    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;

        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const toggleFlag = (qIndex: number) => {
        setFlagged((prev) => ({
            ...prev,
            [qIndex]: !prev[qIndex],
        }));
    };

    const handleSelectOption = (optionIndex: number) => {
        setAnswers((prev) => ({
            ...prev,
            [currentIdx]: optionIndex,
        }));
    };

    const handleQuestionNavigate = (targetIdx: number) => {
        if (!isFreeAttempt) {
            setCurrentIdx(targetIdx);

            return;
        }

        if (targetIdx <= currentIdx) {
            setCurrentIdx(targetIdx);

            return;
        }

        if (targetIdx >= 20) {
            setShowLockedModal(true);

            return;
        }

        setCurrentIdx(targetIdx);
    };

    const handleCategoryChange = (category: string) => {
        if (
            isFreeAttempt &&
            category !== 'All Categories' &&
            category !== 'Demographic Profile'
        ) {
            setShowLockedModal(true);

            return;
        }

        setSelectedPaletteCategory(category);

        if (category !== 'All Categories') {
            const firstIdx = activeQuestions.findIndex(
                (q) => q.category === category,
            );

            if (firstIdx !== -1) {
                handleQuestionNavigate(firstIdx);
            }
        }
    };

    const handleRegisterFromFreeExam = () => {
        const state = {
            selectedExamId,
            questionIds: activeQuestions.map((q) => q.id),
            answers,
            currentIdx,
            timeLeft: timeLeftRef.current,
            isTimed,
            sessionTimeLimitSecs,
        };
        localStorage.setItem('pending_free_exam', JSON.stringify(state));
        setShowRegisterModal(false);
        router.visit('/register');
    };

    const handleCancelFreeExam = () => {
        setShowRegisterModal(false);
        setIsExamActive(false);
        setIsFreeAttempt(false);
        router.visit('/');
    };

    const executeSubmit = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        const activeQs = activeQuestionsRef.current;
        const ans = answersRef.current;
        const sessionSecs = sessionTimeLimitSecsRef.current;
        const detailsTitleLocal = detailsTitleRef.current || '';
        const detailsTimeLimitLocal = detailsTimeLimitSecsRef.current || 0;
        const isTimedLocal = isTimedRef.current;

        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let skippedCount = 0;
        const catMap: Record<
            string,
            {
                correct: number;
                total: number;
                subcats: Record<string, { correct: number; total: number }>;
            }
        > = {};

        activeQs.forEach((q, idx) => {
            const chosen = ans[idx];
            const isCorrect = chosen === q.correct_option;

            if (q.category === 'Demographic Profile' || q.isDemographic) {
                return;
            }

            if (!catMap[q.category]) {
                catMap[q.category] = { correct: 0, total: 0, subcats: {} };
            }

            catMap[q.category].total += 1;

            const subcatName = q.subcategory || 'General Concepts';

            if (!catMap[q.category].subcats[subcatName]) {
                catMap[q.category].subcats[subcatName] = {
                    correct: 0,
                    total: 0,
                };
            }

            catMap[q.category].subcats[subcatName].total += 1;

            if (chosen === undefined) {
                skippedCount++;
            } else if (isCorrect) {
                correctCount++;
                score++;
                catMap[q.category].correct += 1;
                catMap[q.category].subcats[subcatName].correct += 1;
            } else {
                wrongCount++;
            }
        });

        const scoredItemsCount =
            activeQs.filter(
                (q) =>
                    !(q.category === 'Demographic Profile' || q.isDemographic),
            ).length || 1;
        const percentage = Math.round((score / scoredItemsCount) * 100);
        const limitSecs = sessionSecs || detailsTimeLimitLocal;
        const elapsedSecs = isTimedLocal
            ? Math.min(limitSecs, Math.max(0, limitSecs - timeLeftRef.current))
            : timeLeftRef.current;

        setResults({
            score,
            total: scoredItemsCount,
            percentage,
            correctCount,
            wrongCount,
            skippedCount,
            categoryScoreMap: catMap,
            elapsedSecs,
        });

        setIsExamSubmitted(true);
        setIsExamActive(false);

        const durationSecs = elapsedSecs;
        const isDrillSessionLocal =
            selectedExamIdRef.current === null ||
            drillCategoryNameRef.current !== null;
        const trackName = isDrillSessionLocal
            ? 'Drill'
            : detailsTitleLocal.includes('Sub-Professional')
              ? 'Subprofessional'
              : 'Professional';
        const finalCategoryId = isDrillSessionLocal
            ? drillCategoryIdRef.current ||
              savedAttemptRef.current?.category_id ||
              null
            : null;
        const finalCategoryName = isDrillSessionLocal
            ? drillCategoryNameRef.current ||
              savedAttemptRef.current?.cat_scores?.metadata?.category_name ||
              'Practice Drill'
            : detailsTitleLocal;

        const originalAnswers: Record<number, number> = {};
        Object.entries(ans).forEach(([key, chosenIndex]) => {
            const idx = Number(key);
            const q = activeQs[idx];

            if (chosenIndex !== undefined && q && q.originalOptionIndices) {
                originalAnswers[idx] = q.originalOptionIndices[chosenIndex];
            } else {
                originalAnswers[idx] = chosenIndex;
            }
        });

        const payload = {
            category_id: finalCategoryId,
            question_ids: activeQs.map((q) => q.id),
            answers: originalAnswers,
            cat_scores: {
                categoryScoreMap: catMap,
                metadata: {
                    track: trackName,
                    category_name: finalCategoryName,
                    correct_count: correctCount,
                    total_questions: scoredItemsCount,
                    skipped_count: skippedCount,
                    duration_secs: durationSecs,
                    is_timed: isTimedLocal,
                    selected_subcategories: isDrillSessionLocal
                        ? drillSubcategoriesRef.current.length > 0
                            ? drillSubcategoriesRef.current
                            : undefined
                        : undefined,
                    language: isDrillSessionLocal
                        ? drillLanguageRef.current
                        : undefined,
                    question_count: isDrillSessionLocal
                        ? drillQuestionCountRef.current === 'all'
                            ? 'all'
                            : drillQuestionCountRef.current
                        : undefined,
                },
            },
        };

        if (isFreeAttemptRef.current) {
            return;
        }

        fetch('/exams/attempts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN':
                    (
                        document.querySelector(
                            'meta[name="csrf-token"]',
                        ) as HTMLMetaElement
                    )?.content || '',
            },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.attempt_id) {
                    setLastStoredAttemptId(data.attempt_id);
                }
            })
            .catch(() => {
                setErrorMessage(
                    'Failed to connect to server. Your progress may not have been saved.',
                );
            });
    }, []);

    const handleSubmitExam = useCallback(
        (auto = false) => {
            if (auto) {
                setSubmittedByTimer(true);
            }

            if (!auto) {
                const totalQuestions = activeQuestions.length;
                const answeredCount = Object.keys(answers).filter(
                    (key) => answers[Number(key)] !== undefined,
                ).length;
                const unansweredCount = totalQuestions - answeredCount;

                let confirmMsg =
                    'Are you sure you want to finish and submit your exam?';
                let title = 'Submit Exam?';

                if (
                    totalQuestions > 0 &&
                    answeredCount / totalQuestions < 0.5
                ) {
                    confirmMsg = `⚠️ DUMMY ATTEMPT WARNING: You have only answered ${answeredCount} out of ${totalQuestions} questions (less than half). \n\nBecause so few questions are answered, this will be considered a "Dummy Attempt" and IT WILL NOT BE SAVED to your permanent history or dashboard metrics.\n\nAre you sure you want to end the session now and view the scorecard?`;
                    title = 'Submit Dummy Attempt?';
                } else if (unansweredCount > 0) {
                    confirmMsg = `⚠️ WARNING: You have ${unansweredCount} unanswered questions out of ${totalQuestions} total questions. Unanswered questions will be marked as incorrect.\n\nAre you absolutely sure you want to submit the exam now?`;
                    title = 'Submit with Unanswered Items?';
                } else {
                    confirmMsg =
                        'All questions have been answered! Are you ready to submit your exam and view your scorecard?';
                    title = 'Ready to Submit?';
                }

                setConfirmModal({
                    isOpen: true,
                    title,
                    message: confirmMsg,
                    confirmLabel: 'Yes, Submit',
                    variant: unansweredCount > 0 ? 'danger' : 'success',
                    onConfirm: () => {
                        executeSubmit();
                    },
                });

                return;
            }

            executeSubmit();
        },
        [activeQuestions, answers, executeSubmit],
    );

    useEffect(() => {
        handleSubmitExamRef.current = handleSubmitExam;
    }, [handleSubmitExam]);

    const handleExitExam = () => {
        if (isFreeAttempt && !isExamSubmitted) {
            setConfirmModal({
                isOpen: true,
                title: 'Exit Free Mock Exam?',
                message:
                    'Your progress will be lost. Are you sure you want to exit?',
                confirmLabel: 'Yes, Exit',
                variant: 'danger',
                onConfirm: () => {
                    localStorage.removeItem('active_exam_session');
                    setIsExamActive(false);
                    setIsFreeAttempt(false);
                    router.visit('/');
                },
            });

            return;
        }

        if (savedAttempt && isExamSubmitted) {
            if (isDrillSession) {
                router.get('/drills');
            } else {
                router.get('/history');
            }

            return;
        }

        if (!isExamSubmitted) {
            setConfirmModal({
                isOpen: true,
                title: 'Exit Active Session?',
                message:
                    'Are you sure you want to exit? Your active progress on this attempt will be permanently lost.',
                confirmLabel: 'Yes, Exit',
                variant: 'danger',
                onConfirm: () => {
                    localStorage.removeItem('active_exam_session');

                    if (isDrillSession) {
                        router.get('/drills');

                        return;
                    }

                    setIsExamActive(false);
                    setIsExamSubmitted(false);
                    setResults(null);
                },
            });

            return;
        }

        if (isDrillSession) {
            router.get('/drills');

            return;
        }

        setIsExamActive(false);
        setIsExamSubmitted(false);
        setResults(null);
    };

    return {
        // Hydration states
        mounted,
        isExamActive,
        isExamSubmitted,
        reviewScreenActive,
        setReviewScreenActive,
        selectedExamId,
        setSelectedExamId,
        drillCategoryId,
        drillCategoryName,
        drillSubcategories,
        drillLanguage,
        drillQuestionCount,
        activeQuestions,
        currentIdx,
        setCurrentIdx,
        answers,
        flagged,
        setFlagged,
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
        lastStoredAttemptId,

        // Handlers
        formatTime,
        toggleFlag,
        handleSelectOption,
        handleQuestionNavigate,
        handleCategoryChange,
        handleRegisterFromFreeExam,
        handleCancelFreeExam,
        handleBeginExam,
        handleSubmitExam,
        handleExitExam,
        getActiveTimeLimitSecs,
    };
}
