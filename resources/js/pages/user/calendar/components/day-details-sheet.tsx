import {
    Plus,
    Calendar,
    Clock,
    CheckCircle2,
    Circle,
    Edit3,
    Trash2,
    Sparkles,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { categoryNames } from '../hooks/use-calendar-state';
import type { StudySchedule } from '../types';

interface DayDetailsSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    dateStr: string;
    schedules: StudySchedule[];
    subcategories: Array<{ id: number; name: string; category_id: number }>;
    onAddNew: (dateStr: string) => void;
    onToggleDone: (task: StudySchedule, dateStr: string) => Promise<void>;
    onSelectTask: (task: StudySchedule) => void;
    onEditTask: (task: StudySchedule, dateStr: string) => void;
    onDeleteTask: (taskId: number, dateStr: string) => Promise<void>;
}

export function DayDetailsSheet({
    isOpen,
    onOpenChange,
    dateStr,
    schedules,
    subcategories,
    onAddNew,
    onToggleDone,
    onSelectTask,
    onEditTask,
    onDeleteTask,
}: DayDetailsSheetProps) {
    const formattedDate = React.useMemo(() => {
        if (!dateStr) {
            return '';
        }

        try {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    }, [dateStr]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[88dvh] flex-col gap-0 overflow-hidden p-0">
                {/* Header */}
                <DialogHeader className="border-b border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800/80 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                            <Calendar className="size-4" />
                            <span>Day Inspector</span>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => {
                                onAddNew(dateStr);
                                onOpenChange(false);
                            }}
                            className="h-8 gap-1.5 bg-blue-600 text-xs font-bold text-white shadow-2xs hover:bg-blue-700"
                        >
                            <Plus className="size-3.5" />
                            <span>Add Task</span>
                        </Button>
                    </div>

                    <DialogTitle className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                        {formattedDate}
                    </DialogTitle>

                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        {schedules.length} session
                        {schedules.length === 1 ? '' : 's'} scheduled for
                        this date
                    </DialogDescription>
                </DialogHeader>

                {/* Task List */}
                <div className="flex-1 space-y-3 overflow-y-auto p-6">
                    {schedules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                                <Calendar className="size-5" />
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                No Tasks Scheduled
                            </h4>
                            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400">
                                You have nothing planned for this date yet.
                                Create a session or apply a study template.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    onAddNew(dateStr);
                                    onOpenChange(false);
                                }}
                                className="mt-4 h-8 gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                            >
                                <Plus className="size-3.5" />
                                <span>Schedule Session</span>
                            </Button>
                        </div>
                    ) : (
                        schedules.map((task) => {
                            const subcat = task.subcategory_id
                                ? subcategories.find(
                                      (s) => s.id === task.subcategory_id,
                                  )
                                : null;
                            const catName = subcat?.category_id
                                ? categoryNames[subcat.category_id] ||
                                  'General'
                                : 'General';

                            return (
                                <div
                                    key={task.id}
                                    className={`rounded-2xl border p-4 transition-all duration-200 hover:shadow-md ${
                                        task.is_done
                                            ? 'border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                                            : 'border-slate-200/80 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        {/* Completion Checkbox & Title */}
                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onToggleDone(
                                                        task,
                                                        dateStr,
                                                    )
                                                }
                                                className="mt-0.5 shrink-0 transition-transform active:scale-90"
                                                aria-label={
                                                    task.is_done
                                                        ? 'Mark incomplete'
                                                        : 'Mark complete'
                                                }
                                            >
                                                {task.is_done ? (
                                                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <Circle className="size-5 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400" />
                                                )}
                                            </button>

                                            <div className="min-w-0 flex-1">
                                                <h4
                                                    className={`truncate text-xs font-bold ${
                                                        task.is_done
                                                            ? 'text-slate-400 line-through dark:text-slate-500'
                                                            : 'text-slate-900 dark:text-white'
                                                    }`}
                                                >
                                                    {task.title}
                                                </h4>

                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="border-blue-200 bg-blue-50 text-[10px] font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                                                    >
                                                        {catName}
                                                    </Badge>
                                                    {task.study_time && (
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                            <Clock className="size-3" />
                                                            {task.study_time.slice(
                                                                0,
                                                                5,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions Bar */}
                                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                onSelectTask(task);
                                                onOpenChange(false);
                                            }}
                                            className="h-7 gap-1 px-2 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                                        >
                                            <Sparkles className="size-3" />
                                            <span>
                                                Study & Practice Drill
                                            </span>
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    onEditTask(
                                                        task,
                                                        dateStr,
                                                    );
                                                    onOpenChange(false);
                                                }}
                                                className="size-7 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                                title="Edit"
                                            >
                                                <Edit3 className="size-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    onDeleteTask(
                                                        task.id,
                                                        dateStr,
                                                    )
                                                }
                                                className="size-7 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                                                title="Delete"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-8.5 bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
