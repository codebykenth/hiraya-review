import { Head, Link, router } from '@inertiajs/react';
import { Activity, ArrowLeft, Database, Users } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { index as attemptsIndex } from '@/routes/admin/attempts';

interface Attempt {
    id: number;
    user: {
        name: string;
        email: string;
    };
    category: string;
    percentage: number;
    created_at: string;
    full_date: string;
}

interface AdminAttemptsProps {
    attempts: {
        data: Attempt[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        user_id?: string;
        type?: string;
    };
    users: {
        id: number;
        name: string;
        email: string;
    }[];
}

export default function AdminAttempts({
    attempts,
    filters,
    users,
}: AdminAttemptsProps) {
    const handleFilterChange = (key: string, value: string) => {
        const queryParams = new URLSearchParams(window.location.search);

        if (value) {
            queryParams.set(key, value);
        } else {
            queryParams.delete(key);
        }

        // Reset to page 1 when filtering
        queryParams.delete('page');

        router.get(
            `/admin/attempts?${queryParams.toString()}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="All Exam Attempts" />
            <PageContainer>
                {/* Header & Back Action */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                <Database className="size-3" />
                                Database Records
                            </span>
                        </div>
                        <PageHeader
                            title="All Exam Attempts"
                            description="A comprehensive history of all standard examinee test sessions."
                        />
                    </div>
                    <Link
                        href="/admin/dashboard"
                        className="group flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back to Dashboard
                    </Link>
                </div>

                {/* List Container */}
                <Card className="mt-6 flex flex-col p-0 shadow-xs">
                    <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 className="text-md font-bold text-slate-900 dark:text-white">
                                Complete Attempt History
                            </h2>
                            <p className="mt-0.5 text-sm text-slate-500">
                                Total Records Found: {attempts.total}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <select
                                className="block w-full rounded-md border-0 py-1.5 pr-10 pl-3 text-slate-900 ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                                value={filters?.user_id || ''}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'user_id',
                                        e.target.value,
                                    )
                                }
                            >
                                <option value="">All Users</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.email})
                                    </option>
                                ))}
                            </select>

                            <select
                                className="block w-full rounded-md border-0 py-1.5 pr-10 pl-3 text-slate-900 ring-1 ring-slate-300 ring-inset focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-slate-900 dark:text-white dark:ring-slate-700"
                                value={filters?.type || ''}
                                onChange={(e) =>
                                    handleFilterChange('type', e.target.value)
                                }
                            >
                                <option value="">All Types</option>
                                <option value="mock">Mock Exams</option>
                                <option value="drill">Drills</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-1 p-4 sm:p-6">
                        {attempts.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Activity className="text-slate-350 dark:text-slate-750 mb-3 size-8 animate-pulse" />
                                <h3 className="text-xs font-bold">
                                    No exam attempts logged yet
                                </h3>
                                <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                    Taker activity results will render
                                    dynamically here when examinees complete
                                    exams.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-900">
                                {attempts.data.map((attempt) => (
                                    <div
                                        key={attempt.id}
                                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
                                                <Users className="size-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {attempt.user.name}
                                                </h4>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {attempt.user.email} •{' '}
                                                    {attempt.full_date} (
                                                    {attempt.created_at})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-4">
                                            <div className="hidden text-right sm:block">
                                                <span className="block max-w-[200px] truncate text-xs font-extrabold text-slate-500">
                                                    {attempt.category}
                                                </span>
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-sm font-black ${
                                                    attempt.percentage >= 80
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                        : attempt.percentage >=
                                                            70
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

                    {attempts.last_page > 1 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-4 sm:flex-row sm:px-6">
                            <span className="text-xs font-bold text-muted-foreground">
                                Showing{' '}
                                <strong className="text-foreground">
                                    {attempts.data.length > 0
                                        ? (attempts.current_page - 1) * 10 + 1
                                        : 0}
                                </strong>{' '}
                                to{' '}
                                <strong className="text-foreground">
                                    {Math.min(
                                        attempts.current_page * 10,
                                        attempts.total,
                                    )}
                                </strong>{' '}
                                of{' '}
                                <strong className="text-foreground">
                                    {attempts.total}
                                </strong>{' '}
                                results
                            </span>

                            <div className="flex items-center gap-1.5">
                                {attempts.links.map((link, idx) => {
                                    if (link.url === null) {
                                        return (
                                            <button
                                                key={idx}
                                                disabled
                                                className="shadow-3xs rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground opacity-40 dark:bg-slate-900"
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    }

                                    // Extract query parameters from Laravel's paginator URL and use Wayfinder to generate a clean, relative path
                                    let queryParams = {};

                                    if (link.url) {
                                        try {
                                            const parsedUrl = new URL(link.url);
                                            queryParams = Object.fromEntries(
                                                parsedUrl.searchParams.entries(),
                                            );
                                        } catch {
                                            // Fallback if URL parsing fails
                                        }
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={
                                                attemptsIndex({
                                                    query: queryParams,
                                                }).url
                                            }
                                            preserveScroll
                                            className={`shadow-3xs rounded-lg px-3 py-1.5 text-xs font-bold transition focus:outline-none ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-border bg-white text-muted-foreground hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-white'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            </PageContainer>
        </>
    );
}

AdminAttempts.layout = {
    breadcrumbs: [
        {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'All Attempts',
            href: '/admin/attempts',
        },
    ],
};
