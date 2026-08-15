import { Timer, Clock } from 'lucide-react';
import React from 'react';
import { EXAM_CONSTANTS } from '../utils/exam-utils';

interface ExamTimerDisplayProps {
    isTimed: boolean;
    timeLeft: number;
    formatTime: (secs: number) => string;
}

export const ExamTimerDisplay = React.memo(function ExamTimerDisplay({
    isTimed,
    timeLeft,
    formatTime,
}: ExamTimerDisplayProps) {
    if (!isTimed) {
        return (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Clock className="size-3.5 text-slate-500" />
                <span>Untimed Practice</span>
            </div>
        );
    }

    const isRedZone = timeLeft <= EXAM_CONSTANTS.TIMER_RED_ZONE_SECS;

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                isRedZone
                    ? 'animate-pulse bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
            aria-live="polite"
        >
            <Timer className={`size-4 ${isRedZone ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
            <span>{formatTime(timeLeft)}</span>
        </div>
    );
});
