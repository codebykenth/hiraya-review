import { Link } from '@inertiajs/react';
import {
    Flame,
    CheckCircle2,
    Brain,
    Target,
    ChevronRight,
    ArrowRight,
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

export function DailyGoalStreakCard({ dailyGoal }: DailyGoalStreakCardProps) {
    const streak = dailyGoal?.streak ?? 0;
    const questionsToday = dailyGoal?.questionsToday ?? 0;
    const goalTarget = dailyGoal?.goalTarget ?? 20;

    const progressPct = Math.min(
        100,
        Math.round((questionsToday / goalTarget) * 100),
    );
    const isGoalMet = questionsToday >= goalTarget;

    return (
        <Card className="relative flex h-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70 dark:hover:border-slate-700 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                        <Flame className="size-5 fill-current text-amber-500 dark:text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                            Daily Habit & Goal
                        </h2>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Build momentum toward exam day
                        </p>
                    </div>
                </div>

                <Badge
                    variant="outline"
                    className={`gap-1.5 px-2.5 py-1 text-xs font-bold ${
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

            {/* Body */}
            <div className="my-4 space-y-4">
                {/* Questions Solved Progress */}
                <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/60 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="size-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Questions Solved Today
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-black text-slate-900 dark:text-white">
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

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        {isGoalMet ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="size-3.5" /> Daily
                                goal achieved! Great work.
                            </span>
                        ) : (
                            <span>
                                {goalTarget - questionsToday} more questions to
                                hit today&apos;s target
                            </span>
                        )}
                        <span className="font-bold">{progressPct}%</span>
                    </div>
                </div>

                {/* Custom Drill / Saved Sets Banner */}
                <div className="flex items-center justify-between rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                            <Target className="size-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Targeted Practice Drills
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Build speed with instant question rationales
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/drills?tab=custom"
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                    >
                        <span>Build</span>
                        <ChevronRight className="size-3" />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
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
