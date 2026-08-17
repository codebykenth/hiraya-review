import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-5 sm:gap-6 animate-pulse">
            {/* Hero skeleton */}
            <div className="h-44 w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-8 w-64 rounded-md" />
                    <Skeleton className="h-4 w-96 rounded-md" />
                </div>
            </div>

            {/* Bento Grid skeleton */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
                <div className="h-64 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-6 w-40 rounded-md" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </div>
                <div className="h-64 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4">
                        <Skeleton className="h-6 w-40 rounded-md" />
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs dark:border-slate-900 dark:bg-slate-950 animate-pulse">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-900 dark:bg-slate-900/20">
                <Skeleton className="h-6 w-48 rounded-md" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-900">
                {Array.from({ length: rows }).map((_, r) => (
                    <div key={r} className="flex items-center gap-4 px-6 py-4">
                        {Array.from({ length: cols }).map((_, c) => (
                            <Skeleton
                                key={c}
                                className={`h-4 rounded-md ${c === 0 ? 'w-1/3' : 'flex-1'}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AnalyticsSkeleton() {
    return (
        <div className="flex flex-col gap-5 sm:gap-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-7 w-48 rounded-md" />
                    <Skeleton className="h-4 w-72 rounded-md" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-xl" />
                    <Skeleton className="h-9 w-32 rounded-xl" />
                </div>
            </div>

            <div className="h-40 w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-full w-full rounded-xl" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-28 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
                    >
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="mt-3 h-8 w-16 rounded-md" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ExamExamSkeleton() {
    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 sm:p-6 animate-pulse">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
            <div className="h-64 w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-6 w-3/4 mb-4 rounded-md" />
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function LearnModuleSkeleton() {
    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto p-4 sm:p-6 animate-pulse">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-10 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <Skeleton className="h-32 w-full my-4 rounded-xl" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-4/5 rounded-md" />
            </div>
        </div>
    );
}

export function CalendarSkeleton() {
    return (
        <div className="flex flex-col gap-6 animate-pulse">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-56 rounded-md" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-28 rounded-xl" />
                    <Skeleton className="h-9 w-28 rounded-xl" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-80 md:col-span-2 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <Skeleton className="h-full w-full rounded-xl" />
                </div>
                <div className="h-80 rounded-2xl border border-slate-100 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <Skeleton className="h-6 w-36 mb-4 rounded-md" />
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
