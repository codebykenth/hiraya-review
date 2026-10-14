import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
    return (
        <PageContainer className="animate-pulse gap-5 sm:gap-6">
            {/* Integrated Hero Banner Skeleton */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 shadow-xs sm:p-7 dark:border-slate-800/80 dark:bg-slate-900/50">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-44 rounded-full" />
                        <Skeleton className="h-8 w-64 rounded-md" />
                        <Skeleton className="h-4 w-80 max-w-full rounded-md sm:w-96" />
                    </div>
                    <Skeleton className="h-11 w-44 shrink-0 rounded-xl" />
                </div>
                {/* 4 Stat Metric Pills */}
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex h-16 flex-col justify-center gap-1.5 rounded-xl border border-slate-200/70 bg-white/70 p-3 dark:border-slate-800/70 dark:bg-slate-900/70"
                        >
                            <Skeleton className="h-3 w-16 rounded-md" />
                            <Skeleton className="h-5 w-24 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Bento Grid: 4 Core Cards */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
                {/* Card 1: AI Readiness & Coaching */}
                <div className="flex h-80 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-40 rounded-md" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="my-auto flex items-center justify-center gap-6">
                        <Skeleton className="size-28 rounded-full" />
                        <div className="flex flex-1 flex-col gap-3">
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-3/4 rounded-md" />
                            <Skeleton className="h-4 w-5/6 rounded-md" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>

                {/* Card 2: Daily Study Streak & Goal Progress */}
                <div className="flex h-80 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-44 rounded-md" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <div className="my-auto flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-14 rounded-2xl" />
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-7 w-24 rounded-md" />
                                <Skeleton className="h-4 w-36 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-full rounded-full" />
                        <div className="flex justify-between gap-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="size-8 rounded-full"
                                />
                            ))}
                        </div>
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>

                {/* Card 3: Smart Contextual Study Launchers */}
                <div className="flex h-80 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-48 rounded-md" />
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                    <div className="my-auto flex flex-col gap-3">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                            <Skeleton className="h-4 w-28 rounded-md" />
                            <Skeleton className="mt-2 h-5 w-56 rounded-md" />
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-800/30">
                            <Skeleton className="h-4 w-32 rounded-md" />
                            <Skeleton className="mt-2 h-5 w-48 rounded-md" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Skeleton className="h-10 rounded-xl" />
                        <Skeleton className="h-10 rounded-xl" />
                    </div>
                </div>

                {/* Card 4: Today's Tasks & Recent Exam Runs */}
                <div className="flex h-80 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800/80 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-36 rounded-md" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="my-auto flex flex-col gap-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800/60"
                            >
                                <Skeleton className="size-6 shrink-0 rounded-full" />
                                <div className="flex flex-1 flex-col gap-1.5">
                                    <Skeleton className="h-4 w-40 rounded-md" />
                                    <Skeleton className="h-3 w-24 rounded-md" />
                                </div>
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                        ))}
                    </div>
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
            </div>
        </PageContainer>
    );
}

export function AdminDashboardSkeleton() {
    return (
        <PageContainer className="animate-pulse gap-5 sm:gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-36 rounded-full" />
                    <Skeleton className="h-8 w-64 rounded-md" />
                    <Skeleton className="h-4 w-96 max-w-full rounded-md" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-32 rounded-lg" />
                    <Skeleton className="h-9 w-32 rounded-lg" />
                </div>
            </div>

            {/* Finance Banner */}
            <div className="h-28 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800/80 dark:bg-slate-900/50">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-32 rounded-md" />
                        <Skeleton className="h-7 w-48 rounded-md" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900"
                    >
                        <Skeleton className="h-4 w-24 rounded-md" />
                        <Skeleton className="mt-3 h-8 w-28 rounded-md" />
                    </div>
                ))}
            </div>

            {/* Split Pane: Attempts & Syllabus */}
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
                <div className="h-80 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-2 dark:border-slate-800/80 dark:bg-slate-900">
                    <Skeleton className="mb-4 h-6 w-48 rounded-md" />
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-12 w-full rounded-xl"
                            />
                        ))}
                    </div>
                </div>
                <div className="h-80 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                    <Skeleton className="mb-4 h-6 w-36 rounded-md" />
                    <div className="flex flex-col gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-3 w-24 rounded-md" />
                                    <Skeleton className="h-3 w-10 rounded-md" />
                                </div>
                                <Skeleton className="h-2.5 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export function AnalyticsSkeleton() {
    return (
        <PageContainer className="animate-pulse gap-5 sm:gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-7 w-56 rounded-md" />
                    <Skeleton className="h-4 w-72 rounded-md" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-xl" />
                    <Skeleton className="h-9 w-32 rounded-xl" />
                </div>
            </div>

            {/* CSE Readiness Bento Card */}
            <div className="h-44 w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex h-full flex-col justify-between sm:flex-row sm:items-center">
                    <div className="flex items-center gap-6">
                        <Skeleton className="size-24 shrink-0 rounded-full" />
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-6 w-44 rounded-md" />
                            <Skeleton className="h-4 w-64 rounded-md" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-12 w-28 rounded-xl" />
                        <Skeleton className="h-12 w-28 rounded-xl" />
                    </div>
                </div>
            </div>

            {/* Performance KPI Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-24 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900"
                    >
                        <Skeleton className="h-3 w-20 rounded-md" />
                        <Skeleton className="mt-3 h-7 w-24 rounded-md" />
                    </div>
                ))}
            </div>

            {/* AI Diagnostic Banner */}
            <div className="h-24 w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800/80 dark:bg-slate-900/50">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="mt-2.5 h-4 w-full rounded-md" />
            </div>

            {/* Charts Section */}
            <div className="flex flex-col gap-5 sm:gap-6">
                {/* Row 1: Score History */}
                <div className="h-72 w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                    <Skeleton className="mb-4 h-5 w-44 rounded-md" />
                    <Skeleton className="h-52 w-full rounded-xl" />
                </div>

                {/* Row 2: 2-Column Bento */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <Skeleton className="mb-4 h-5 w-40 rounded-md" />
                        <Skeleton className="h-44 w-full rounded-xl" />
                    </div>
                    <div className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <Skeleton className="mb-4 h-5 w-40 rounded-md" />
                        <Skeleton className="h-44 w-full rounded-xl" />
                    </div>
                </div>

                {/* Row 3: 2-Column Bento */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <Skeleton className="mb-4 h-5 w-48 rounded-md" />
                        <Skeleton className="h-44 w-full rounded-xl" />
                    </div>
                    <div className="h-64 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <Skeleton className="mb-4 h-5 w-48 rounded-md" />
                        <Skeleton className="h-44 w-full rounded-xl" />
                    </div>
                </div>

                {/* Row 4: Subject Breakdown Accordion */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                    <Skeleton className="mb-4 h-6 w-52 rounded-md" />
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-14 w-full rounded-xl"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export function ExamSetupSkeleton() {
    return (
        <PageContainer className="animate-pulse gap-5 sm:gap-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-44 rounded-md" />
                    <Skeleton className="h-4 w-80 rounded-md" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                {/* Left Panel: Level Selectors (Col-Span 2) */}
                <div className="flex flex-col gap-4 lg:col-span-2">
                    {/* Professional Level Card */}
                    <div className="flex items-center justify-between rounded-xl border-2 border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-12 shrink-0 rounded-lg" />
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-6 w-44 rounded-md" />
                                <Skeleton className="h-4 w-72 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="size-5 rounded-full" />
                    </div>

                    {/* Subprofessional Level Card */}
                    <div className="flex items-center justify-between rounded-xl border-2 border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-12 shrink-0 rounded-lg" />
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-6 w-48 rounded-md" />
                                <Skeleton className="h-4 w-72 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="size-5 rounded-full" />
                    </div>

                    {/* Topic Breakdown Card */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <Skeleton className="mb-4 h-5 w-44 rounded-md" />
                        <div className="flex flex-col gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-1"
                                >
                                    <Skeleton className="h-4 w-40 rounded-md" />
                                    <Skeleton className="h-4 w-16 rounded-md" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Simulation Parameters (Col-Span 1) */}
                <div className="flex flex-col gap-4 lg:col-span-1">
                    <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                        <Skeleton className="h-6 w-48 rounded-md" />
                        <div className="my-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-28 rounded-md" />
                                <Skeleton className="h-4 w-20 rounded-md" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-28 rounded-md" />
                                <Skeleton className="h-4 w-20 rounded-md" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-28 rounded-md" />
                                <Skeleton className="h-4 w-20 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

export function DrillsHubSkeleton() {
    return (
        <PageContainer className="animate-pulse gap-5 sm:gap-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-52 rounded-md" />
                    <Skeleton className="h-4 w-96 max-w-full rounded-md" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            {/* Tab Bar */}
            <Skeleton className="h-10 w-72 rounded-xl" />

            {/* Category Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex h-56 flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900"
                    >
                        <div className="flex items-start justify-between">
                            <Skeleton className="size-10 rounded-lg" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-6 w-36 rounded-md" />
                            <Skeleton className="h-4 w-48 rounded-md" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        </PageContainer>
    );
}

export function LearnIndexSkeleton() {
    return (
        <PageContainer className="animate-pulse gap-5 sm:gap-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-40 rounded-md" />
                    <Skeleton className="h-4 w-96 max-w-full rounded-md" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            {/* Overall Progress Card */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-44 rounded-md" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                <Skeleton className="mt-3 h-3 w-full rounded-full" />
            </div>

            {/* Search & Filter Row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-10 w-72 rounded-xl" />
                <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-24 rounded-full" />
                    ))}
                </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex h-52 flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900"
                    >
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-4 w-16 rounded-md" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-5 w-44 rounded-md" />
                            <Skeleton className="h-3.5 w-full rounded-md" />
                            <Skeleton className="h-3.5 w-3/4 rounded-md" />
                        </div>
                        <Skeleton className="h-8 w-28 rounded-lg" />
                    </div>
                ))}
            </div>
        </PageContainer>
    );
}

export function CalendarSkeleton() {
    return (
        <PageContainer className="animate-pulse gap-5 sm:gap-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-8 w-44 rounded-md" />
                    <Skeleton className="h-4 w-80 max-w-full rounded-md" />
                </div>
                <Skeleton className="h-9 w-36 rounded-xl" />
            </div>

            {/* Stats Banner */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-20 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800/80 dark:bg-slate-900"
                    >
                        <Skeleton className="h-3 w-16 rounded-md" />
                        <Skeleton className="mt-2 h-6 w-20 rounded-md" />
                    </div>
                ))}
            </div>

            {/* Calendar Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Skeleton className="h-9 w-44 rounded-xl" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-36 rounded-xl" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                </div>
            </div>

            {/* Month Grid Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-6 dark:border-slate-800/80 dark:bg-slate-900">
                {/* 7 Days Header */}
                <div className="grid grid-cols-7 gap-2 pb-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex justify-center">
                            <Skeleton className="h-4 w-12 rounded-md" />
                        </div>
                    ))}
                </div>
                {/* 5 Weeks of Cells */}
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-24 rounded-lg border border-slate-100 p-2 dark:border-slate-800/60"
                        >
                            <Skeleton className="h-3 w-4 rounded-md" />
                            {i % 3 === 0 && (
                                <Skeleton className="mt-2 h-4 w-full rounded-md" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </PageContainer>
    );
}

export function TableSkeleton({
    rows = 8,
    cols = 5,
}: {
    rows?: number;
    cols?: number;
}) {
    return (
        <PageContainer className="animate-pulse gap-5 sm:gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-7 w-48 rounded-md" />
                    <Skeleton className="h-4 w-72 rounded-md" />
                </div>
                <Skeleton className="h-9 w-36 rounded-xl" />
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                <Skeleton className="h-9 w-64 rounded-xl" />
                <Skeleton className="h-9 w-36 rounded-xl" />
                <Skeleton className="h-9 w-36 rounded-xl" />
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
                <div className="flex items-center gap-4 border-b border-slate-200/80 bg-slate-50/60 px-6 py-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
                    {Array.from({ length: cols }).map((_, c) => (
                        <Skeleton
                            key={c}
                            className={`h-4 rounded-md ${c === 0 ? 'w-24' : 'flex-1'}`}
                        />
                    ))}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {Array.from({ length: rows }).map((_, r) => (
                        <div
                            key={r}
                            className="flex items-center gap-4 px-6 py-4"
                        >
                            {Array.from({ length: cols }).map((_, c) => (
                                <Skeleton
                                    key={c}
                                    className={`h-4 rounded-md ${c === 0 ? 'w-28' : 'flex-1'}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
                {/* Pagination Footer */}
                <div className="flex items-center justify-between border-t border-slate-200/80 px-6 py-3 dark:border-slate-800/80">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-lg" />
                        <Skeleton className="h-8 w-20 rounded-lg" />
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
