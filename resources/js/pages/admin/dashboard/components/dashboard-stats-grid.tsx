import { Database, Activity, Users, Layers, TrendingUp } from 'lucide-react';
import type { Metrics } from '../types';
import { StatsCard } from './stats-card';

interface DashboardStatsGridProps {
    metrics: Metrics;
}

export function DashboardStatsGrid({ metrics }: DashboardStatsGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Question Bank Card */}
            <StatsCard
                label="Question Bank"
                value={metrics.total_questions}
                suffix="total records"
                icon={Database}
                iconBgColor="bg-blue-50 dark:bg-blue-950/50"
                iconTextColor="text-blue-600 dark:text-blue-400"
                footer={{
                    highlight: `${metrics.active_questions} Verified`,
                    highlightColor: 'text-emerald-600 dark:text-emerald-400',
                    secondary: `${metrics.draft_questions} Drafts`,
                    secondaryColor: 'text-blue-600 dark:text-blue-400',
                }}
            />

            {/* Total Attempts Card */}
            <StatsCard
                label="Total Attempts"
                value={metrics.total_attempts}
                suffix="exams taken"
                icon={Activity}
                iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
                iconTextColor="text-emerald-600 dark:text-emerald-400"
                footer={{
                    highlight: (
                        <div className="flex items-center gap-1">
                            <TrendingUp className="size-3 text-emerald-600" />
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                Dynamic monitoring active
                            </span>
                        </div>
                    ) as any,
                    highlightColor: '',
                }}
            />

            {/* Total Examinees Card */}
            <StatsCard
                label="Total Examinees"
                value={metrics.total_examinees}
                suffix="registered users"
                icon={Users}
                iconBgColor="bg-indigo-50 dark:bg-indigo-950/50"
                iconTextColor="text-indigo-600 dark:text-indigo-400"
                footer={{
                    highlight: 'Examinees preparing for exam',
                    highlightColor: 'text-slate-500',
                }}
            />

            {/* Blueprint Scopes Card */}
            <StatsCard
                label="Blueprint Scopes"
                value={metrics.total_categories}
                suffix="exam domains"
                icon={Layers}
                iconBgColor="bg-pink-50 dark:bg-pink-950/50"
                iconTextColor="text-pink-600 dark:text-pink-400"
                footer={{
                    highlight: `${metrics.total_subcategories} subcategories configured`,
                    highlightColor: 'text-slate-500',
                }}
            />
        </div>
    );
}
