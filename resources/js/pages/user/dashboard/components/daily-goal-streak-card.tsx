import { Link } from '@inertiajs/react';
import {
    Flame,
    CheckCircle2,
    Target,
    ChevronRight,
    ArrowRight,
    Bookmark,
    SlidersHorizontal,
    Sparkles,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { index as drillsIndex } from '@/routes/drills';
import type { DailyGoalStats } from '../types';

interface DailyGoalStreakCardProps {
    dailyGoal?: DailyGoalStats;
}

const DAYS_OF_WEEK = [
    { label: 'M', name: 'Mon' },
    { label: 'T', name: 'Tue' },
    { label: 'W', name: 'Wed' },
    { label: 'T', name: 'Thu' },
    { label: 'F', name: 'Fri' },
    { label: 'S', name: 'Sat' },
    { label: 'S', name: 'Sun' },
];

export function DailyGoalStreakCard({ dailyGoal }: DailyGoalStreakCardProps) {
    const streak = dailyGoal?.streak ?? 0;
    const questionsToday = dailyGoal?.questionsToday ?? 0;
    const goalTarget = dailyGoal?.goalTarget ?? 20;

    const progressPct = Math.min(
        100,
        Math.round((questionsToday / goalTarget) * 100),
    );
    const isGoalMet = questionsToday >= goalTarget;

    // Determine current day of week index (0 = Monday, 6 = Sunday)
    const todayDayIndex = (new Date().getDay() + 6) % 7;

    return (
        <Card className="relative flex flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/90 p-5 shadow-2xs backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                        <Flame className="size-4 fill-current text-amber-500 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Daily Habit & Goal
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Build momentum toward exam day
                        </p>
                    </div>
                </div>

                <Badge
                    variant="outline"
                    className={`gap-1.5 px-2.5 py-0.5 text-[11px] font-bold ${
                        streak > 0
                            ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                    }`}
                >
                    <Flame
                        className={`size-3.5 ${streak > 0 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`}
                    />
                    <span>
                        {streak > 0 ? `${streak} Day Streak` : 'Start Streak'}
                    </span>
                </Badge>
            </div>

            {/* Content Body - naturally fills vertical space without gaps */}
            <div className="my-4 flex flex-1 flex-col justify-between gap-3">
                {/* Weekly Habit Consistency Tracker */}
                <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-2.5 dark:border-slate-800/60 dark:bg-slate-950/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Sparkles className="size-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">Weekly Habit:</span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {DAYS_OF_WEEK.map((day, idx) => {
                            const isToday = idx === todayDayIndex;
                            const isCompleted =
                                streak > 0 &&
                                idx <= todayDayIndex &&
                                todayDayIndex - idx < streak;

                            return (
                                <div
                                    key={idx}
                                    className={`flex size-7 items-center justify-center rounded-lg text-xs font-black transition-all ${
                                        isCompleted
                                            ? 'bg-amber-500 text-white shadow-2xs'
                                            : isToday
                                            ? 'border border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 ring-1 ring-amber-400/40'
                                            : 'bg-muted/70 text-muted-foreground'
                                    }`}
                                    title={`${day.name}: ${
                                        isCompleted
                                            ? 'Goal Completed'
                                            : isToday
                                            ? 'Today'
                                            : 'Upcoming'
                                    }`}
                                >
                                    {day.label}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Questions Solved Progress Card */}
                <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:p-4 dark:border-slate-800/60 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="size-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 sm:text-sm">
                                Questions Solved Today
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-black text-slate-900 dark:text-white sm:text-sm">
                            <span>{questionsToday}</span>
                            <span className="text-slate-400 dark:text-slate-500">
                                / {goalTarget}
                            </span>
                        </div>
                    </div>

                    <Progress
                        value={progressPct}
                        className={`h-2.5 ${isGoalMet ? '[&>div]:bg-emerald-500' : '[&>div]:bg-blue-600'}`}
                    />

                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {isGoalMet ? (
                            <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3.5" /> Daily target met! Great work.
                            </span>
                        ) : (
                            <span>
                                {goalTarget - questionsToday} more questions to reach goal
                            </span>
                        )}
                        <span className="font-bold text-slate-700 dark:text-slate-300">{progressPct}%</span>
                    </div>
                </div>

                {/* Quick Practice Study Jumpers (Custom Builder & Saved Sets) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Link
                        href="/drills?tab=custom"
                        className="group flex items-center justify-between rounded-xl border border-violet-200/70 bg-violet-50/40 p-3 transition-all hover:border-violet-300 hover:bg-violet-50/70 dark:border-violet-900/40 dark:bg-violet-950/20 dark:hover:border-violet-800"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
                                <SlidersHorizontal className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                    Custom Builder
                                </p>
                                <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                                    Curate & test topics
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="size-4 text-violet-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </Link>

                    <Link
                        href="/drills?tab=saved"
                        className="group flex items-center justify-between rounded-xl border border-blue-200/70 bg-blue-50/40 p-3 transition-all hover:border-blue-300 hover:bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20 dark:hover:border-blue-800"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                                <Bookmark className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                                    Saved Sets
                                </p>
                                <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                                    Bookmarked playlists
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="size-4 text-blue-500 transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                <Link
                    href={drillsIndex({ query: { from: '/dashboard' } })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    <span>Practice Quick Drill</span>
                    <ArrowRight className="size-3.5" />
                </Link>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    Resets daily at 12:00 AM
                </span>
            </div>
        </Card>
    );
}
