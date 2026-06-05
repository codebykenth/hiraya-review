import React from 'react';

interface ExamCountdownProps {
    nextExam: {
        date: string;
        description: string;
        days_remaining: number;
    } | null;
}

export function ExamCountdown({ nextExam }: ExamCountdownProps) {
    if (!nextExam) {
        return null;
    }

    const parseScheduleDate = (dateStr: string) => {
        if (!dateStr) {
            return new Date();
        }

        const baseDate = dateStr.includes('T')
            ? dateStr.split('T')[0]
            : dateStr;

        return new Date(baseDate + 'T00:00:00');
    };

    const getExamCountdownColor = (days: number) => {
        if (days <= 14) {
            return 'text-red-600 dark:text-red-400 font-extrabold animate-pulse';
        }

        if (days <= 30) {
            return 'text-amber-600 dark:text-amber-400 dark:text-amber-400 font-bold';
        }

        return 'text-blue-600 dark:text-blue-400 dark:text-blue-400 font-bold';
    };

    const getExamBadgeStyles = (days: number) => {
        if (days <= 14) {
            return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-100 dark:border-red-900/30';
        }

        if (days <= 30) {
            return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-100 dark:border-amber-900/30';
        }

        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-100 dark:border-blue-900/30';
    };

    return (
        <div className="flex shrink-0 flex-col rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm sm:items-end dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Target Exam:
                </span>
                <span
                    className={`rounded border px-2 py-0.5 text-xs font-bold ${getExamBadgeStyles(nextExam.days_remaining)}`}
                >
                    {parseScheduleDate(nextExam.date).toLocaleDateString(
                        'en-US',
                        {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                        },
                    )}
                </span>
            </div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {nextExam.days_remaining > 0 ? (
                    <>
                        <span
                            className={getExamCountdownColor(
                                nextExam.days_remaining,
                            )}
                        >
                            {nextExam.days_remaining}
                        </span>{' '}
                        days remaining
                    </>
                ) : nextExam.days_remaining === 0 ? (
                    <span className="animate-pulse font-bold text-red-600">
                        Exam is today!
                    </span>
                ) : (
                    <span className="font-semibold text-slate-500">
                        Exam completed
                    </span>
                )}
            </div>
        </div>
    );
}
