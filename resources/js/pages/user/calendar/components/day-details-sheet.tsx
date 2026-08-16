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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
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
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col justify-between overflow-y-auto"
            >
                <div>
                    {/* Header */}
                    <SheetHeader className="p-6 border-b border-slate-200/80 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                <Calendar className="size-4" />
                                <span>Day Inspector</span>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => {
                                    onAddNew(dateStr);
                                    onOpenChange(false);
                                }}
                                className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs"
                            >
                                <Plus className="size-3.5" />
                                <span>Add Task</span>
                            </Button>
                        </div>

                        <SheetTitle className="text-lg font-black text-slate-900 dark:text-white mt-2">
                            {formattedDate}
                        </SheetTitle>

                        <SheetDescription className="text-xs text-slate-500 dark:text-slate-400">
                            {schedules.length} session{schedules.length === 1 ? '' : 's'} scheduled for this date
                        </SheetDescription>
                    </SheetHeader>

                    {/* Task List */}
                    <div className="p-6 space-y-3">
                        {schedules.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                                    <Calendar className="size-5" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    No Tasks Scheduled
                                </h4>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                                    You have nothing planned for this date yet. Create a session or apply a study template.
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
                                    ? subcategories.find((s) => s.id === task.subcategory_id)
                                    : null;
                                const catName = subcat?.category_id
                                    ? categoryNames[subcat.category_id] || 'General'
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
                                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleDone(task, dateStr)}
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

                                                <div className="flex-1 min-w-0">
                                                    <h4
                                                        className={`text-xs font-bold truncate ${
                                                            task.is_done
                                                                ? 'line-through text-slate-400 dark:text-slate-500'
                                                                : 'text-slate-900 dark:text-white'
                                                        }`}
                                                    >
                                                        {task.title}
                                                    </h4>

                                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] font-bold border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                                                        >
                                                            {catName}
                                                        </Badge>
                                                        {task.study_time && (
                                                            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                                <Clock className="size-3" />
                                                                {task.study_time.slice(0, 5)}
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
                                                className="h-7 gap-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 px-2"
                                            >
                                                <Sparkles className="size-3" />
                                                <span>Study & Practice Drill</span>
                                            </Button>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        onEditTask(task, dateStr);
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
                                                    onClick={() => onDeleteTask(task.id, dateStr)}
                                                    className="size-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-end">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-8.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                        Close
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
