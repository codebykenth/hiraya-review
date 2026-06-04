import {
    Award,
    Target,
    FileText,
    Clock,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import React from 'react';
import type { AnalyticsStats } from '../types';

interface MetricsGridProps {
    activeStats: AnalyticsStats;
}

export function MetricsGrid({ activeStats }: MetricsGridProps) {
    const cardClass =
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50/80 p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/80 dark:to-indigo-950/20 backdrop-blur-md';

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {/* AVG SCORE */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        Avg Score
                    </span>
                    <Award className="size-4.5 text-blue-500" />
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.avgScore}%
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200/30 bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <TrendingUp className="size-2.5" />
                        Live
                    </span>
                </div>
            </div>

            {/* PASSING RATE */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        Passing Rate
                    </span>
                    <Target className="size-4.5 text-emerald-500" />
                </div>
                <div className="mt-2.5 flex items-baseline gap-1.5">
                    <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.passingRate}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">
                        Target 80%
                    </span>
                </div>
            </div>

            {/* TOTAL RUNS */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        Total runs
                    </span>
                    <FileText className="size-4.5 text-indigo-500" />
                </div>
                <div className="mt-2.5">
                    <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.totalExams}
                    </span>
                    <p className="text-[9px] font-bold text-slate-400">
                        Practice attempts
                    </p>
                </div>
            </div>

            {/* QUESTIONS SOLVED */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        Avg Time
                    </span>
                    <Clock className="size-4.5 text-purple-500" />
                </div>
                <div className="mt-2.5">
                    <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.avgDuration}
                    </span>
                    <p className="text-[9px] font-bold text-slate-400">
                        Per attempt
                    </p>
                </div>
            </div>

            {/* STRONGEST AREA */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        Strongest
                    </span>
                    <TrendingUp className="size-4.5 text-emerald-500" />
                </div>
                <div className="mt-2.5">
                    <span className="line-clamp-1 font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.strongestArea}
                    </span>
                </div>
            </div>

            {/* WEAKEST AREA */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        Focus Area
                    </span>
                    <TrendingDown className="size-4.5 text-rose-500" />
                </div>
                <div className="mt-2.5">
                    <span className="line-clamp-1 font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.weakestArea}
                    </span>
                </div>
            </div>
        </div>
    );
}
