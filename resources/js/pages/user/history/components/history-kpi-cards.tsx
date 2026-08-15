import { Trophy, Clock, Flame, BookCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import type { HistoryStats } from '../types';

interface HistoryKpiCardsProps {
    stats: HistoryStats;
}

export function HistoryKpiCards({ stats }: HistoryKpiCardsProps) {
    const {
        total_attempts = 0,
        total_exams = 0,
        total_drills = 0,
        avg_score = 0,
        pass_rate = 0,
        total_duration = '0m',
        streak = 0,
        trend = 0,
    } = stats || {};

    const isTrendPositive = trend > 0;
    const isTrendNegative = trend < 0;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Total Completed */}
            <Card className="flex flex-col justify-between border-border bg-card p-4 transition-all duration-200 hover:border-blue-500/30 hover:shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                        Completed Runs
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <BookCheck className="size-4" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black tracking-tight text-foreground">
                        {total_attempts}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <span className="text-blue-600 dark:text-blue-400">{total_exams} exams</span>
                        <span>•</span>
                        <span>{total_drills} drills</span>
                    </div>
                </div>
            </Card>

            {/* 2. Average Score & Pass Rate */}
            <Card className="flex flex-col justify-between border-border bg-card p-4 transition-all duration-200 hover:border-emerald-500/30 hover:shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                        Average Score
                    </span>
                    <div className="flex items-center gap-1.5">
                        <div className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            {pass_rate}% Pass Rate
                        </div>
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <Trophy className="size-4" />
                        </div>
                    </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tracking-tight text-foreground">
                            {avg_score}%
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <span className="text-emerald-700 dark:text-emerald-400">{stats?.exam_avg_score ?? 0}% exams</span>
                        <span>•</span>
                        <span>{stats?.drill_avg_score ?? 0}% drills</span>
                    </div>
                </div>
            </Card>

            {/* 3. Total Study Time */}
            <Card className="flex flex-col justify-between border-border bg-card p-4 transition-all duration-200 hover:border-amber-500/30 hover:shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                        Total Time Spent
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
                        <Clock className="size-4" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-2xl font-black tracking-tight text-foreground">
                        {total_duration}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                        <span className="text-amber-600 dark:text-amber-400">{stats?.exam_duration || '0m'} exams</span>
                        <span>•</span>
                        <span>{stats?.drill_duration || '0m'} drills</span>
                    </div>
                </div>
            </Card>

            {/* 4. Recent Trend & Streak */}
            <Card className="flex flex-col justify-between border-border bg-card p-4 transition-all duration-200 hover:border-rose-500/30 hover:shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                        Performance Streak
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                        <Flame className="size-4" />
                    </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black tracking-tight text-foreground">
                            {streak}
                        </span>
                        <span className="text-xs font-bold text-muted-foreground">
                            {streak === 1 ? 'run streak' : 'run streak'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                        {isTrendPositive ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="size-3.5" />
                                +{trend}%
                            </span>
                        ) : isTrendNegative ? (
                            <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                                <TrendingDown className="size-3.5" />
                                {trend}%
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                                <Minus className="size-3.5" />
                                0.0%
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
