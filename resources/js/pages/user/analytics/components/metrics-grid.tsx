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
        'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-2xs transition hover:shadow-md hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900/70 sm:p-5 backdrop-blur-xs';

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {/* AVG SCORE */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        Avg Score
                    </span>
                    <Award className="size-4 text-blue-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.avgScore}%
                    </span>
                    <span className="inline-flex items-center gap-0.5 rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
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
                    <Target className="size-4 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
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
                    <FileText className="size-4 text-indigo-500" />
                </div>
                <div className="mt-2">
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
                    <Clock className="size-4 text-purple-500" />
                </div>
                <div className="mt-2">
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
                    <TrendingUp className="size-4 text-emerald-500" />
                </div>
                <div className="mt-2">
                    <span className="line-clamp-1 font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.strongestArea}
                    </span>
                    <p className="text-[9px] font-bold text-slate-400">
                        Highest accuracy
                    </p>
                </div>
            </div>

            {/* WEAKEST AREA */}
            <div className={cardClass}>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        Focus Area
                    </span>
                    <TrendingDown className="size-4 text-rose-500" />
                </div>
                <div className="mt-2">
                    <span className="line-clamp-1 font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {activeStats.weakestArea}
                    </span>
                    <p className="text-[9px] font-bold text-slate-400">
                        Target remediation
                    </p>
                </div>
            </div>
        </div>
    );
}

