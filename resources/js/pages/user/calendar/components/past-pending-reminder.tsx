import {
    CalendarDays,
    CheckCheck,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react';
import React, { useState } from 'react';
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
    handleBulkRescheduleAllToToday: (ids?: number[]) => Promise<void>;
    handleBulkMarkAllDone: (ids?: number[]) => Promise<void>;
    handleDismissReminderWithSnooze: (snooze24h: boolean) => void;
    setPastPending: React.Dispatch<React.SetStateAction<StudySchedule[]>>;
}

export function PastPendingReminder({
    isOpen,
    pastPending,
    toggleScheduleDone,
    handleRescheduleToToday,
    handleBulkRescheduleAllToToday,
    handleBulkMarkAllDone,
    handleDismissReminderWithSnooze,
    setPastPending,
}: PastPendingReminderProps) {
    const [snooze24h, setSnooze24h] = useState(false);
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    const parseScheduleDate = (dateStr: string) => {
        if (!dateStr) {
            return new Date();
        }

        const baseDate = dateStr.includes('T')
            ? dateStr.split('T')[0]
            : dateStr;

        return new Date(baseDate + 'T00:00:00');
    };

    const handleBulkReschedule = async () => {
        setIsProcessingBulk(true);

        try {
            await handleBulkRescheduleAllToToday();
        } finally {
            setIsProcessingBulk(false);
        }
    };

    const handleBulkDone = async () => {
        setIsProcessingBulk(true);

        try {
            await handleBulkMarkAllDone();
        } finally {
            setIsProcessingBulk(false);
        }
    };

    return (
        <Dialog
            open={isOpen && pastPending.length > 0}
            onOpenChange={(open) => {
                if (!open) {
                    handleDismissReminderWithSnooze(snooze24h);
                }
            }}
        >
            <DialogContent className="border-amber-200/80 bg-white sm:max-w-2xl dark:border-amber-900/40 dark:bg-slate-900">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                            <AlertCircle className="size-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                                Uncompleted Study Tasks ({pastPending.length})
                            </DialogTitle>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                You have pending study sessions from previous
                                days. Choose an action or reschedule them.
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Bulk Quick Actions Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200/60 bg-amber-50/60 p-3 dark:border-amber-900/30 dark:bg-amber-950/20">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        Bulk Resolution:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessingBulk}
                            className="h-7 border-blue-200 bg-blue-50/70 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                            onClick={handleBulkReschedule}
                        >
                            <CalendarDays className="mr-1 size-3.5" />
                            Reschedule All to Today
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={isProcessingBulk}
                            className="h-7 border-emerald-200 bg-emerald-50/70 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                            onClick={handleBulkDone}
                        >
                            <CheckCheck className="mr-1 size-3.5" />
                            Mark All Done
                        </Button>
                    </div>
                </div>

                {/* Task Items List */}
                <div className="max-h-64 space-y-2.5 overflow-y-auto py-2 pr-1">
                    {pastPending.map((task) => (
                        <div
                            key={task.id}
                            className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                                            Overdue:{' '}
                                            {parseScheduleDate(
                                                task.study_date,
                                            ).toLocaleDateString('en-US', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                        {task.study_time && (
                                            <span className="flex items-center gap-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                <Clock className="size-3" />
                                                {task.study_time.substring(
                                                    0,
                                                    5,
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                                        {task.title}
                                    </p>
                                    {task.subcategory && (
                                        <span className="mt-1 inline-block rounded-md bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            {task.subcategory.name}
                                        </span>
                                    )}
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 border-emerald-300 bg-white text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700"
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
                                        <CheckCircle2 className="mr-1 size-3" />
                                        Done
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="h-7 bg-blue-600 px-2.5 text-xs font-bold text-white hover:bg-blue-700"
                                        onClick={async () => {
                                            await handleRescheduleToToday(task);
                                            setPastPending((prev) =>
                                                prev.filter(
                                                    (t) => t.id !== task.id,
                                                ),
                                            );
                                        }}
                                    >
                                        Move to Today
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer with Snooze Checkbox & Dismiss */}
                <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <input
                            type="checkbox"
                            checked={snooze24h}
                            onChange={(e) => setSnooze24h(e.target.checked)}
                            className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                        />
                        <span>Don&apos;t remind me again for 24 hours</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                handleDismissReminderWithSnooze(snooze24h)
                            }
                            className="w-full sm:w-auto"
                        >
                            Dismiss
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
