import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseExamTimerProps {
    isExamActive: boolean;
    isExamSubmitted: boolean;
    isTimed: boolean;
    sessionTimeLimitSecs: number;
    currentIdx: number;
    onTimerExpired: () => void;
}

export function useExamTimer({
    isExamActive,
    isExamSubmitted,
    isTimed,
    sessionTimeLimitSecs,
    currentIdx,
    onTimerExpired,
}: UseExamTimerProps) {
    const [timeLeft, setTimeLeft] = useState(sessionTimeLimitSecs);
    const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
    const timeLeftRef = useRef(sessionTimeLimitSecs);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const warned10MinRef = useRef(false);
    const warned1MinRef = useRef(false);
    const currentIdxRef = useRef(currentIdx);

    currentIdxRef.current = currentIdx;

    const resetTimer = useCallback((newLimitSecs: number) => {
        setTimeLeft(newLimitSecs);
        timeLeftRef.current = newLimitSecs;
        warned10MinRef.current = false;
        warned1MinRef.current = false;
    }, []);

    // Live countdown timer & per-question time tracking
    useEffect(() => {
        if (isExamActive && !isExamSubmitted) {
            timerRef.current = setInterval(() => {
                // Increment active question time
                const activeIdx = currentIdxRef.current;
                setQuestionTimes((prev) => ({
                    ...prev,
                    [activeIdx]: (prev[activeIdx] || 0) + 1,
                }));

                if (isTimed) {
                    setTimeLeft((prev) => {
                        if (prev <= 1) {
                            if (timerRef.current) {
clearInterval(timerRef.current);
}

                            timeLeftRef.current = 0;
                            onTimerExpired();

                            return 0;
                        }

                        const next = prev - 1;
                        timeLeftRef.current = next;

                        // Timer warnings
                        if (next === 600 && !warned10MinRef.current) {
                            warned10MinRef.current = true;
                            toast.warning('10 minutes remaining in this session.', {
                                id: 'timer-warning-10m',
                            });
                        } else if (next === 60 && !warned1MinRef.current) {
                            warned1MinRef.current = true;
                            toast.error('1 minute remaining! Your exam will auto-submit soon.', {
                                id: 'timer-warning-1m',
                                duration: 10000,
                            });
                        }

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
    }, [isExamActive, isExamSubmitted, isTimed, onTimerExpired]);

    const formatTime = useCallback((secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;

        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, []);

    return {
        timeLeft,
        setTimeLeft,
        questionTimes,
        setQuestionTimes,
        formatTime,
        resetTimer,
        timeLeftRef,
    };
}
