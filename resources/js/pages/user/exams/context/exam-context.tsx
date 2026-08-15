import React, { createContext, useContext } from 'react';
import type { Question, SimulationDetails } from '../types';

interface ExamSessionContextType {
    activeQuestions: Question[];
    currentIdx: number;
    answers: Record<number, number>;
    flagged: Record<number, boolean>;
    scratchpads: Record<number, string>;
    isTimed: boolean;
    timeLeft: number;
    details: SimulationDetails;
    formatTime: (secs: number) => string;
    setCurrentIdx: (idx: number) => void;
    toggleFlag: (idx: number) => void;
    handleSelectOption: (optionIdx: number) => void;
    setScratchpads: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}

const ExamSessionContext = createContext<ExamSessionContextType | null>(null);

export function ExamSessionProvider({
    value,
    children,
}: {
    value: ExamSessionContextType;
    children: React.ReactNode;
}) {
    return <ExamSessionContext.Provider value={value}>{children}</ExamSessionContext.Provider>;
}

export function useExamSession(): ExamSessionContextType {
    const ctx = useContext(ExamSessionContext);

    if (!ctx) {
        throw new Error('useExamSession must be used within an ExamSessionProvider');
    }

    return ctx;
}
