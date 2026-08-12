import { Link } from '@inertiajs/react';
import { Activity, Users, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { RecentAttempt } from '../types';

interface DashboardAttemptsPanelProps {
    attempts: RecentAttempt[];
}

export function DashboardAttemptsPanel({
    attempts,
}: DashboardAttemptsPanelProps) {
    return (
        <Card className="flex flex-col p-4 shadow-xs sm:p-6 lg:col-span-2">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-md font-bold text-slate-900 dark:text-white">
                        Recent Exam Attempts
                    </h2>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                        Real-time grades & completion status for standard test
                        takers.
                    </p>
                </div>

                <Link
                    href="/admin/attempts"
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    View All Attempts
                    <ChevronRight className="size-3.5" />
                </Link>
            </div>

            <div className="flex-1">
                {attempts.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                        <Activity className="text-slate-350 dark:text-slate-750 mb-3 size-8 animate-pulse" />
                        <h3 className="text-xs font-bold">
                            No exam attempts logged yet
                        </h3>
                        <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                            Taker activity results will render dynamically here
                            when examinees complete exams.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-900">
                        {attempts.map((attempt) => (
                            <div
                                key={attempt.id}
                                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
                                        <Users className="size-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                            {attempt.user.name}
                                        </h4>
                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                            {attempt.user.email} •{' '}
                                            {attempt.created_at}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-3">
                                    <div className="hidden text-right sm:block">
                                        <span className="block max-w-[120px] truncate text-[10px] font-extrabold text-slate-500">
                                            {attempt.category}
                                        </span>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-black ${
                                            attempt.percentage >= 80
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                : attempt.percentage >= 70
                                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                        }`}
                                    >
                                        {attempt.percentage}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
