import { Database } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { CategoryStat, Metrics } from '../types';

interface DashboardSyllabusPanelProps {
    categories: CategoryStat[];
    metrics: Metrics;
}

export function DashboardSyllabusPanel({
    categories,
    metrics,
}: DashboardSyllabusPanelProps) {
    return (
        <Card className="flex flex-col p-4 sm:p-6 shadow-xs">
            <div className="mb-5">
                <h2 className="text-md font-bold text-slate-900 dark:text-white">
                    Syllabus Scope Dispersal
                </h2>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    Distribution density of active review questions.
                </p>
            </div>

            {categories.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                    <Database className="text-slate-350 mb-2.5 size-8 dark:text-slate-700" />
                    <span className="text-slate-650 text-xs font-bold dark:text-slate-400">
                        Syllabus unseeded
                    </span>
                </div>
            ) : (
                <div className="flex flex-1 flex-col justify-center gap-4">
                    {categories.map((cat) => {
                        const total = metrics.total_questions || 1;
                        const pct = Math.round(
                            (cat.question_count / total) * 100,
                        );

                        return (
                            <div key={cat.id} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span className="text-slate-600 dark:text-slate-400">
                                        {cat.name}
                                    </span>
                                    <span className="text-slate-900 dark:text-white">
                                        {cat.question_count} Qs ({pct}%)
                                    </span>
                                </div>
                                <div className="h-1.5 w-full rounded-full border border-slate-100/50 bg-slate-50 dark:border-slate-900 dark:bg-slate-900">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                        style={{
                                            width: `${Math.max(3, pct)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
