import { useEffect, useCallback } from 'react';
import type { Question } from '../types';

const PERSISTENCE_KEY = 'active_exam_session_v1';

export interface ActiveSessionData {
    selectedExamId: number | null;
    activeQuestions: Question[];
    currentIdx: number;
    answers: Record<number, number>;
    questionTimes: Record<number, number>;
    answerChanges: Record<number, number>;
    flagged: Record<number, boolean>;
    scratchpads?: Record<number, string>;
    sessionTimeLimitSecs: number;
    timeLeft: number;
    isTimed: boolean;
    timestamp: number;
}

interface UseExamPersistenceProps {
    isExamActive: boolean;
    isExamSubmitted: boolean;
    selectedExamId: number | null;
    activeQuestions: Question[];
    currentIdx: number;
    answers: Record<number, number>;
    questionTimes: Record<number, number>;
    answerChanges: Record<number, number>;
    flagged: Record<number, boolean>;
    scratchpads?: Record<number, string>;
    sessionTimeLimitSecs: number;
    timeLeft: number;
    isTimed: boolean;
    onRestoreSession: (data: ActiveSessionData) => void;
}

export function useExamPersistence({
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
    onRestoreSession,
}: UseExamPersistenceProps) {
    const saveSession = useCallback(() => {
        if (!isExamActive || isExamSubmitted || activeQuestions.length === 0) {
            return;
        }

        const sessionData: ActiveSessionData = {
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
            timestamp: Date.now(),
        };

        try {
            localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(sessionData));
        } catch {
            /* storage limit error safeguard */
        }
    }, [
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
    ]);

    const clearSession = useCallback(() => {
        try {
            localStorage.removeItem(PERSISTENCE_KEY);
        } catch {
            /* storage safeguard */
        }
    }, []);

    // Check for crash recovery on initial mount
    useEffect(() => {
        try {
            const rawData = localStorage.getItem(PERSISTENCE_KEY);

            if (!rawData) {
return;
}

            const data: ActiveSessionData = JSON.parse(rawData);
            // Expire sessions older than 12 hours
            const maxAgeMs = 12 * 60 * 60 * 1000;

            if (Date.now() - data.timestamp > maxAgeMs) {
                clearSession();

                return;
            }

            if (data.activeQuestions && data.activeQuestions.length > 0) {
                onRestoreSession(data);
            }
        } catch {
            clearSession();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-save on answer change or interval
    useEffect(() => {
        if (isExamActive && !isExamSubmitted) {
            saveSession();
        }
    }, [answers, currentIdx, flagged, isExamActive, isExamSubmitted, saveSession]);

    // Interval save every 30s
    useEffect(() => {
        if (!isExamActive || isExamSubmitted) {
return;
}

        const interval = setInterval(() => {
            saveSession();
        }, 30000);

        return () => clearInterval(interval);
    }, [isExamActive, isExamSubmitted, saveSession]);

    return {
        saveSession,
        clearSession,
    };
}
