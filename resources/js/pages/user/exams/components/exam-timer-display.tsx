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
            <div className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 text-xs font-semibold text-muted-foreground">
                <Clock className="size-3.5 text-muted-foreground" />
                <span>Untimed Practice</span>
            </div>
        );
    }

    const isCritical = timeLeft <= 300; // < 5 mins
    const isWarning = !isCritical && timeLeft <= EXAM_CONSTANTS.TIMER_RED_ZONE_SECS; // < 10 mins

    return (
        <div
            className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-black tracking-tight transition-all duration-300 ${
                isCritical
                    ? 'animate-pulse border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300'
                    : isWarning
                      ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
            aria-live="polite"
            title={
                isCritical
                    ? 'Critical: Less than 5 minutes remaining!'
                    : isWarning
                      ? 'Warning: Less than 10 minutes remaining.'
                      : 'Time remaining in simulation'
            }
        >
            <Timer
                className={`size-4 shrink-0 ${
                    isCritical
                        ? 'text-rose-600 dark:text-rose-400'
                        : isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                }`}
            />
            <span className="font-mono">{formatTime(timeLeft)}</span>
        </div>
    );
});
