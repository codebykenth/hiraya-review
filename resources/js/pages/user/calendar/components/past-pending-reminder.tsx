import { Lightbulb } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import type { StudySchedule } from '../types';

interface PastPendingReminderProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    pastPending: StudySchedule[];
    toggleScheduleDone: (
        schedule: StudySchedule,
        date: string,
    ) => Promise<void>;
    handleRescheduleToToday: (schedule: StudySchedule) => Promise<void>;
    setPastPending: React.Dispatch<React.SetStateAction<StudySchedule[]>>;
}

export function PastPendingReminder({
    isOpen,
    onOpenChange,
    pastPending,
    toggleScheduleDone,
    handleRescheduleToToday,
    setPastPending,
}: PastPendingReminderProps) {
    const parseScheduleDate = (dateStr: string) => {
        if (!dateStr) {
            return new Date();
        }

        const baseDate = dateStr.includes('T')
            ? dateStr.split('T')[0]
            : dateStr;

        return new Date(baseDate + 'T00:00:00');
    };

    return (
        <Dialog
            open={isOpen && pastPending.length > 0}
            onOpenChange={onOpenChange}
        >
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Lightbulb className="h-5 w-5 animate-bounce" />
                        Uncompleted Study Tasks
                    </DialogTitle>
                    <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                        You have some scheduled study sessions from previous
                        days that were not marked as done. Would you like to
                        update them?
                    </p>
                </DialogHeader>

                <div className="max-h-60 space-y-3 overflow-y-auto py-4 pr-1">
                    {pastPending.map((task) => (
                        <div
                            key={task.id}
                            className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="text-sm leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
                                        {parseScheduleDate(
                                            task.study_date,
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                        {task.study_time &&
                                            ` at ${task.study_time.substring(0, 5)}`}
                                    </p>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                        {task.title}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-1 flex gap-2">
                                <Button
                                    size="sm"
                                    className="h-8 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white dark:hover:bg-emerald-700"
                                    onClick={async () => {
                                        await toggleScheduleDone(
                                            task,
                                            task.study_date,
                                        );
                                        setPastPending((prev) =>
                                            prev.filter(
                                                (t) => t.id !== task.id,
                                            ),
                                        );
                                    }}
                                >
                                    Mark Done
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 bg-blue-600 text-white hover:bg-blue-700"
                                    onClick={async () => {
                                        await handleRescheduleToToday(task);
                                        setPastPending((prev) =>
                                            prev.filter(
                                                (t) => t.id !== task.id,
                                            ),
                                        );
                                    }}
                                >
                                    Reschedule to Today
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Dismiss
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
