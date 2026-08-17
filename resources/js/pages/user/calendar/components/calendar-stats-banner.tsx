import {
    Flame,
    Target,
    CheckCircle2,
    Calendar,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { CalendarDay, StudySchedule } from '../types';

interface CalendarStatsBannerProps {
    weeks: CalendarDay[][];
    pastPending: StudySchedule[];
    todayStr: string;
    nextExam: {
        date: string;
        description: string;
        days_remaining: number;
    } | null;
}

export function CalendarStatsBanner({
    weeks,
    pastPending,
    todayStr,
    nextExam,
}: CalendarStatsBannerProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Calculate current week stats
    const weekStats = useMemo(() => {
        // Find the week that contains today
        const currentWeek =
            weeks.find((week) => week.some((day) => day.date === todayStr)) ||
            weeks[0] ||
            [];

        let totalWeekTasks = 0;
        let completedWeekTasks = 0;

        currentWeek.forEach((day) => {
            day.schedules.forEach((s) => {
                totalWeekTasks++;

                if (s.is_done) {
                    completedWeekTasks++;
                }
            });
        });

        const percent =
            totalWeekTasks > 0
                ? Math.round((completedWeekTasks / totalWeekTasks) * 100)
                : 0;

        return {
            total: totalWeekTasks,
            completed: completedWeekTasks,
            percent,
        };
    }, [weeks, todayStr]);

    // Calculate completion streak
    const streakDays = useMemo(() => {
        const allDays = weeks.flat();
        let streak = 0;

        // Traverse backwards from today
        const todayIndex = allDays.findIndex((d) => d.date === todayStr);

        if (todayIndex === -1) {
            return 0;
        }

        for (let i = todayIndex; i >= 0; i--) {
            const day = allDays[i];
            const hasCompleted = day.schedules.some((s) => s.is_done);

            if (hasCompleted) {
                streak++;
            } else if (i !== todayIndex && day.schedules.length > 0) {
                // If past day had tasks but none completed, streak ends
                break;
            }
        }

        return streak;
    }, [weeks, todayStr]);

    const totalOverdueCount = pastPending.length;

    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-2xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 overflow-hidden transition-all">
            {/* Header / Summary Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 sm:px-5">
                <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="size-3.5" />
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                        Study Momentum & Goals
                    </span>
                    <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-indigo-200 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300 ml-1"
                    >
                        {weekStats.percent}% Weekly Pace
                    </Badge>
                </div>

                <button
                    type="button"
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <span>{isCollapsed ? 'Show Details' : 'Minimize'}</span>
                    {isCollapsed ? (
                        <ChevronDown className="size-3.5" />
                    ) : (
                        <ChevronUp className="size-3.5" />
                    )}
                </button>
            </div>

            {/* Collapsible Bento Metrics */}
            {!isCollapsed && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-100 p-4 sm:p-5 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40">
                    {/* Card 1: Weekly Progress */}
                    <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <Target className="size-3.5 text-blue-600 dark:text-blue-400" />
                                <span>This Week&apos;s Goal</span>
                            </div>
                            <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                                {weekStats.completed} / {weekStats.total} Done
                            </span>
                        </div>

                        <div className="mt-3">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                                    style={{ width: `${Math.min(weekStats.percent, 100)}%` }}
                                />
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                                <span>{weekStats.percent}% completed</span>
                                <span>{Math.max(0, weekStats.total - weekStats.completed)} remaining</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Habit Streak */}
                    <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <Flame className="size-3.5 text-amber-500" />
                                <span>Study Habit Streak</span>
                            </div>
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                Active
                            </span>
                        </div>

                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {streakDays}
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                consecutive day{streakDays === 1 ? '' : 's'}
                            </span>
                        </div>

                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                            {streakDays > 0
                                ? 'Great consistency! Keep the daily rhythm going.'
                                : "Complete today's session to build momentum."}
                        </p>
                    </div>

                    {/* Card 3: Milestone & Overdue */}
                    <div className="rounded-xl border border-slate-200/70 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Exam Milestone</span>
                            </div>
                            {totalOverdueCount > 0 ? (
                                <Badge
                                    variant="outline"
                                    className="border-rose-200 bg-rose-50 text-[10px] font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                                >
                                    {totalOverdueCount} Overdue
                                </Badge>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="size-3" />
                                    All Caught Up
                                </span>
                            )}
                        </div>

                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {nextExam ? nextExam.days_remaining : 0}
                            </span>
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                days until exam
                            </span>
                        </div>

                        <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {nextExam ? nextExam.description : 'Civil Service Exam'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
