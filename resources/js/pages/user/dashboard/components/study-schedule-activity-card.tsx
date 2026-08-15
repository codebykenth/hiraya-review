import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Circle,
    ChevronRight,
    Clock,
    Award,
    Plus,
    CalendarDays,
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { index as historyIndex } from '@/routes/history';
import { index as calendarIndex } from '@/routes/study-schedules/index';
import type { TodayTaskItem, RecentAttemptItem } from '../types';

interface StudyScheduleActivityCardProps {
    todayTasks?: TodayTaskItem[];
    overdueTasksCount?: number;
    recentAttempts?: RecentAttemptItem[];
}

export function StudyScheduleActivityCard({
    todayTasks = [],
    overdueTasksCount = 0,
    recentAttempts = [],
}: StudyScheduleActivityCardProps) {
    const [tasks, setTasks] = useState(todayTasks);

    const toggleTask = async (taskId: number, currentStatus: boolean) => {
        // Optimistic UI update
        const newStatus = !currentStatus;
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, is_done: newStatus } : t)),
        );

        try {
            const csrfToken =
                (
                    document.querySelector(
                        'meta[name="csrf-token"]',
                    ) as HTMLMetaElement
                )?.content || '';

            const res = await fetch(`/study-schedules/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    is_done: newStatus,
                }),
            });

            if (!res.ok) {
                // Revert on error
                setTasks(todayTasks);
            }
        } catch {
            setTasks(todayTasks);
        }
    };

    return (
        <Card className="relative flex min-h-[460px] h-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700 sm:p-6">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
                        <CalendarDays className="size-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Today&apos;s Plan & Recent Runs
                        </h2>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Scheduled tasks and latest attempt scores
                        </p>
                    </div>
                </div>
            </div>

            {/* Split Body (Scrollable) */}
            <div className="my-3.5 flex-1 min-h-0 space-y-4 overflow-y-auto pr-1.5">
                {/* Overdue Alert Banner if any */}
                {overdueTasksCount > 0 && (
                    <div className="flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/70 px-3 py-2 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                            <span className="font-bold text-amber-900 dark:text-amber-300">
                                {overdueTasksCount} overdue {overdueTasksCount === 1 ? 'task' : 'tasks'}
                            </span>
                        </div>
                        <Link
                            href={calendarIndex()}
                            className="font-extrabold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            Resolve &rarr;
                        </Link>
                    </div>
                )}

                {/* Top Section: Today's Tasks */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Today&apos;s Study Tasks
                        </span>
                        <Link
                            href={calendarIndex()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                            <span>Study Planner</span>
                            <ChevronRight className="size-3" />
                        </Link>
                    </div>

                    {tasks.length > 0 ? (
                        <div className="space-y-2">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`flex items-start justify-between gap-3 rounded-xl border p-2.5 transition-colors ${
                                        task.is_done
                                            ? 'border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                                            : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/60 dark:border-slate-800/60 dark:bg-slate-950/40 dark:hover:bg-slate-800/40'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleTask(task.id, task.is_done)
                                            }
                                            className="mt-0.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400"
                                            aria-label={
                                                task.is_done
                                                    ? 'Mark as incomplete'
                                                    : 'Mark as complete'
                                            }
                                        >
                                            {task.is_done ? (
                                                <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <Circle className="size-4.5 text-slate-400" />
                                            )}
                                        </button>
                                        <div>
                                            <p
                                                className={`text-xs font-bold leading-tight ${
                                                    task.is_done
                                                        ? 'text-slate-500 line-through dark:text-slate-400'
                                                        : 'text-slate-900 dark:text-white'
                                                }`}
                                            >
                                                {task.title}
                                            </p>
                                            {task.subcategory_name && (
                                                <span className="mt-0.5 inline-block text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                                    {task.subcategory_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {task.study_time && (
                                        <div className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                            <Clock className="size-3" />
                                            <span>{task.study_time}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-950/20">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                No study tasks scheduled for today.
                            </span>
                            <Link
                                href={calendarIndex()}
                                className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                            >
                                <Plus className="size-3.5" />
                                <span>Schedule</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Bottom Section: Recent Attempts */}
                <div className="border-t border-slate-100 pt-3 dark:border-slate-800/80">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Recent Exam Runs
                        </span>
                        <Link
                            href={historyIndex()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                            <span>Full History</span>
                            <ChevronRight className="size-3" />
                        </Link>
                    </div>

                    {recentAttempts.length > 0 ? (
                        <div className="space-y-2">
                            {recentAttempts.map((attempt) => (
                                <Link
                                    key={attempt.id}
                                    href={historyIndex()}
                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition-colors hover:bg-slate-100/70 dark:border-slate-800/60 dark:bg-slate-950/40 dark:hover:bg-slate-800/40"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className={`flex size-7 items-center justify-center rounded-lg ${
                                                attempt.passed
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400'
                                                    : 'bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400'
                                            }`}
                                        >
                                            <Award className="size-3.5" />
                                        </div>
                                        <div>
                                            <p className="line-clamp-1 text-xs font-bold text-slate-900 dark:text-white">
                                                {attempt.title}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                                                <span>
                                                    {attempt.total_questions} Qs
                                                </span>
                                                <span>·</span>
                                                <span>
                                                    {attempt.created_at_human}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="outline"
                                        className={`font-black text-xs ${
                                            attempt.passed
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'
                                        }`}
                                    >
                                        {attempt.score_percentage}%
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            No past exam attempts yet. Complete a drill or mock
                            exam to see your score summary here.
                        </p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                <Link
                    href={historyIndex()}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                >
                    <span>Review Past Question Mistakes</span>
                    <ChevronRight className="size-3.5" />
                </Link>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    Auto-saved
                </span>
            </div>
        </Card>
    );
}
