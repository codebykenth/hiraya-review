import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { Question, ExamResults, CategoryScore } from '../types';
import { isDemographicQuestion, apiPost } from '../utils/exam-utils';

interface UseExamSubmissionProps {
    activeQuestions: Question[];
    answers: Record<number, number>;
    flagged?: Record<number, boolean>;
    questionTimes: Record<number, number>;
    answerChanges: Record<number, number>;
    selectedExamId: number | null;
    isTimed: boolean;
    sessionTimeLimitSecs: number;
    timeLeft: number;
    drillCategoryId: number | null;
    drillCategoryName: string | null;
    drillSubcategories: string[];
    drillLanguage: string;
    drillQuestionCount: number | 'all';
    isFreeAttempt: boolean;
    setShowRegisterModal: (val: boolean) => void;
    setIsExamSubmitted: (val: boolean) => void;
    setIsExamActive: (val: boolean) => void;
    setResults: (val: ExamResults | null) => void;
    setSubmittedByTimer: (val: boolean) => void;
}

export function useExamSubmission({
    activeQuestions,
    answers,
    flagged = {},
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
}: UseExamSubmissionProps) {
    const [lastStoredAttemptId, setLastStoredAttemptId] = useState<number | null>(null);

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

    const executeSubmit = useCallback(
        (autoByTimer = false) => {
            if (isFreeAttempt) {
                setShowRegisterModal(true);

                return;
            }

            let correctCount = 0;
            let wrongCount = 0;
            let skippedCount = 0;
            const catMap: Record<string, CategoryScore> = {};

            const wrongQuestionIds: number[] = [];
            activeQuestions.forEach((q, idx) => {
                const isDemographic = isDemographicQuestion(q);

                if (isDemographic) {
                    return;
                }

                const catName = q.category || 'General Information';
                const subcatName = q.subcategory || 'General Concepts';

                if (!catMap[catName]) {
                    catMap[catName] = { correct: 0, total: 0, subcats: {} };
                }

                if (!catMap[catName].subcats[subcatName]) {
                    catMap[catName].subcats[subcatName] = { correct: 0, total: 0 };
                }

                catMap[catName].total += 1;
                catMap[catName].subcats[subcatName].total += 1;

                const chosen = answers[idx];

                if (chosen === undefined || chosen === null) {
                    skippedCount += 1;
                } else if (Number(chosen) === Number(q.correct_option)) {
                    correctCount += 1;
                    catMap[catName].correct += 1;
                    catMap[catName].subcats[subcatName].correct += 1;
                } else {
                    wrongCount += 1;
                    wrongQuestionIds.push(q.id);
                }
            });

            const totalScoredQuestions = correctCount + wrongCount + skippedCount;
            const scorePercentage =
                totalScoredQuestions > 0 ? Math.round((correctCount / totalScoredQuestions) * 100) : 0;
            const elapsedSecs = isTimed ? Math.max(0, sessionTimeLimitSecs - timeLeft) : timeLeft;

            const computedResults: ExamResults = {
                score: scorePercentage,
                total: totalScoredQuestions,
                percentage: scorePercentage,
                correctCount,
                wrongCount,
                skippedCount,
                categoryScoreMap: catMap,
                elapsedSecs,
            };

            setResults(computedResults);
            setIsExamSubmitted(true);
            setIsExamActive(false);
            setSubmittedByTimer(autoByTimer);

            // Save active session cleanup
            if (typeof window !== 'undefined') {
                localStorage.removeItem('active_exam_session');
            }

            // Post attempt payload with full cat_scores structure
            const payload = {
                category_id: drillCategoryId ?? selectedExamId,
                question_ids: activeQuestions.map((q) => q.id),
                answers,
                cat_scores: {
                    categoryScoreMap: catMap,
                    metadata: {
                        track: selectedExamId === 1 ? 'Professional' : selectedExamId === 2 ? 'Subprofessional' : 'Drill',
                        category_name: drillCategoryName || 'Civil Service Examination',
                        score: scorePercentage,
                        total_questions: totalScoredQuestions,
                        correct_count: correctCount,
                        wrong_count: wrongCount,
                        skipped_count: skippedCount,
                        wrong_question_ids: wrongQuestionIds,
                        duration_secs: elapsedSecs,
                        is_timed: isTimed,
                        question_times: questionTimes,
                        answer_changes: answerChanges,
                        selected_subcategories: drillSubcategories,
                        language: drillLanguage,
                        question_count: drillQuestionCount,
                    },
                },
            };

            apiPost('/exams/attempts', payload)
                .then((data: any) => {
                    if (data?.attempt_id) {
                        setLastStoredAttemptId(data.attempt_id);
                    }
                })
                .catch(() => {
                    toast.error('Session finished locally, but server sync failed. Progress saved.');
                });
        },
        [
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
        ],
    );

    const handleSubmitExam = useCallback(
        (autoByTimer = false) => {
            if (autoByTimer) {
                executeSubmit(true);

                return;
            }

            let scoredTotal = 0;
            let answeredCount = 0;
            let flaggedCount = 0;

            activeQuestions.forEach((q, idx) => {
                if (isDemographicQuestion(q)) {
                    return;
                }

                scoredTotal++;

                if (answers[idx] !== undefined && answers[idx] !== null) {
                    answeredCount++;
                }

                if (flagged[idx]) {
                    flaggedCount++;
                }
            });

            const unansweredCount = Math.max(0, scoredTotal - answeredCount);

            const title = unansweredCount > 0 ? 'Submit Exam with Unanswered Questions?' : 'Submit Examination?';
            
            let message = `You have answered ${answeredCount} of ${scoredTotal} graded questions.`;

            if (unansweredCount > 0) {
                message += ` ⚠️ ${unansweredCount} question${unansweredCount > 1 ? 's are' : ' is'} left unanswered.`;
            }

            if (flaggedCount > 0) {
                message += ` You also have ${flaggedCount} item${flaggedCount > 1 ? 's' : ''} flagged for review.`;
            }

            message += ' Once submitted, your exam will be finalized and graded immediately.';

            setConfirmModal({
                isOpen: true,
                title,
                message,
                confirmLabel: unansweredCount > 0 ? 'Submit Anyway' : 'Submit Exam',
                variant: unansweredCount > 0 ? 'danger' : 'success',
                onConfirm: () => executeSubmit(false),
            });
        },
        [activeQuestions, answers, flagged, executeSubmit],
    );

    return {
        executeSubmit,
        handleSubmitExam,
        confirmModal,
        setConfirmModal,
        lastStoredAttemptId,
    };
}
