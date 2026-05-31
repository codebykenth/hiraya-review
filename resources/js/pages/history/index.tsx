import { Head, router, Link } from '@inertiajs/react';
import {
    Search,
    ChevronDown,
    Calendar,
    Clock,
    XCircle,
    RotateCcw,
    BookOpen,
    Trash2,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import {
    TrackBadge,
    StatusBadge,
    ScoreProgress,
} from '@/components/attempt-components';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { ConfirmModal } from '@/components/confirm-modal';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from '@/components/ui/tooltip';
import { generatePaginationLinks } from '@/lib/utils';
import { index as historyIndex } from '@/routes/history';

interface Attempt {
    id: number;
    category_id: number | null;
    date: string;
    time: string;
    track: string;
    category: string;
    score: number;
    correct: number;
    total: number;
    category_scores?: CategoryScore[];
    status: string;
    duration: string;
    created_at: string;
    // Strict 1-liner comment: Optional configuration properties from historical drill attempts
    selected_subcategories?: string[];
    language?: 'English' | 'Filipino' | 'Both';
    question_count?: number | 'all';
    is_timed?: boolean;
}

interface CategoryScore {
    name: string;
    correct: number;
    total: number;
    percentage: number;
}

interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

interface Filters {
    search: string;
    track: string;
    date: string;
}

interface HistoryPageProps {
    attempts: Attempt[];
    pagination: Pagination;
    filters: Filters;
}

export default function HistoryPage({
    attempts = [],
    pagination,
    filters,
}: HistoryPageProps) {
    const [searchVal, setSearchVal] = useState(filters.search || '');
    const [selectedTrack, setSelectedTrack] = useState(
        filters.track || 'All Tracks',
    );
    const [selectedDate, setSelectedDate] = useState(filters.date || '30');

    // Custom confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'success',
        onConfirm: () => {},
    });

    // Strict 1-liner comment: Safely prompt and dispatch DELETE request to remove user attempt record
    const handleDeleteAttempt = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Attempt Record?',
            message:
                'Are you sure you want to delete this attempt record? This action cannot be undone and will permanently remove it from your history metrics.',
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/exams/attempts/${id}`, {
                    preserveScroll: true,
                });
            },
        });
    };

    // Handle instant filter update via Inertia router
    const updateFilters = (
        newSearch: string,
        newTrack: string,
        newDate: string,
    ) => {
        router.get(
            historyIndex().url,
            {
                search: newSearch,
                track: newTrack,
                date: newDate,
                page: 1, // Reset pagination to page 1 on filter
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    // Auto-update filter triggers when changed
    const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedTrack(val);
        updateFilters(searchVal, val, selectedDate);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedDate(val);
        updateFilters(searchVal, selectedTrack, val);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters(searchVal, selectedTrack, selectedDate);
    };

    return (
        <TooltipProvider>
            <Head title="History" />

            <PageContainer>
                {/* 1. HEADER SECTION */}
                <PageHeader
                    title="History"
                    description="Review your past performance, analyze detailed score breakdowns, and identify specific areas for improvement across all your exam tracks."
                    descriptionClassName="text-sm text-muted-foreground max-w-3xl leading-relaxed"
                    className="flex flex-col gap-1"
                />

                {/* 2. FILTERS CONTAINER CARD */}
                <div className="shadow-3xs rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search bar form */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative max-w-2xl flex-1"
                        >
                            <Input
                                type="text"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                placeholder="Search exams by name or ID..."
                                className="pl-9"
                            />
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        </form>

                        {/* Select Filters Row */}
                        <div className="flex w-full items-center gap-3 sm:w-auto">
                            {/* Track Select */}
                            <div className="relative flex-1 shrink-0 sm:flex-initial">
                                <select
                                    value={selectedTrack}
                                    onChange={handleTrackChange}
                                    className="w-full appearance-none rounded-lg border border-border bg-white py-2 pr-10 pl-4 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none sm:w-auto dark:bg-slate-900"
                                >
                                    <option value="All Tracks">
                                        All Tracks
                                    </option>
                                    <option value="Professional">
                                        Professional
                                    </option>
                                    <option value="Subprofessional">
                                        Subprofessional
                                    </option>
                                    <option value="Drill">Drill</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            </div>

                            {/* Date Select */}
                            <div className="relative flex-1 shrink-0 sm:flex-initial">
                                <select
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="w-full appearance-none rounded-lg border border-border bg-white py-2 pr-10 pl-9 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none sm:w-auto dark:bg-slate-900"
                                >
                                    <option value="30">Last 30 Days</option>
                                    <option value="7">Last 7 Days</option>
                                    <option value="all">All Time</option>
                                </select>
                                <Calendar className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                                <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. ATTEMPTS TABLE CONTAINER CARD */}
                <Card className="flex min-h-[420px] flex-col justify-between gap-0 overflow-hidden p-0">
                    {/* Card Header with Legend */}
                    <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-heading text-sm font-extrabold text-foreground">
                            Attempt Records
                        </span>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-extrabold tracking-wider uppercase">
                            <span className="text-muted-foreground/80">
                                Legend:
                            </span>

                            <div className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/50 px-2 py-1 dark:border-blue-900/20 dark:bg-blue-950/10">
                                <span className="border-blue-250 flex size-5.5 items-center justify-center rounded-md border bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                                    <BookOpen className="size-3" />
                                </span>
                                <span className="text-blue-800 dark:text-blue-300">
                                    Review Answers
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50/50 px-2 py-1 dark:border-rose-900/20 dark:bg-rose-950/10">
                                <span className="border-rose-250 flex size-5.5 items-center justify-center rounded-md border bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                                    <Trash2 className="size-3" />
                                </span>
                                <span className="text-rose-800 dark:text-rose-300">
                                    Delete
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-border bg-slate-50/50 text-[10px] font-black tracking-wider text-muted-foreground uppercase dark:bg-slate-900/30">
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Track</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">
                                        Score & Categories
                                    </th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4 pr-8 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-slate-900/80">
                                {attempts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-20 text-center"
                                        >
                                            <div className="mx-auto flex max-w-2xl flex-col items-center justify-center">
                                                <div className="text-blue-650 mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400">
                                                    <Clock className="size-6.5" />
                                                </div>
                                                <h3 className="text-sm font-black text-foreground">
                                                    No attempts found
                                                </h3>
                                                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                                    We couldn't find any
                                                    completed tests or practice
                                                    drills matching your current
                                                    filters. Spin up a new exam
                                                    simulation to start
                                                    tracking!
                                                </p>
                                                <Link
                                                    href="/exams"
                                                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
                                                >
                                                    Start New Test
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    attempts.map((att) => {
                                        return (
                                            <tr
                                                key={att.id}
                                                className="transition hover:bg-slate-50/20 dark:hover:bg-slate-900/10"
                                            >
                                                {/* DATE & TIME */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <div className="text-xs leading-normal font-black text-foreground">
                                                        {att.date}
                                                    </div>
                                                    <div className="mt-0.5 text-[10px] leading-none font-bold text-muted-foreground">
                                                        {att.time}
                                                    </div>
                                                </td>

                                                {/* TRACK */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <TrackBadge
                                                        track={att.track}
                                                    />
                                                </td>

                                                {/* CATEGORY */}
                                                <td className="px-6 py-4.5">
                                                    <span
                                                        className="block max-w-[280px] text-xs leading-relaxed font-extrabold break-words whitespace-normal text-foreground"
                                                        title={att.category}
                                                    >
                                                        {att.category}
                                                    </span>
                                                </td>

                                                {/* SCORE */}
                                                <td className="px-6 py-4.5">
                                                    <ScoreProgress
                                                        score={att.score}
                                                        status={att.status}
                                                        categoryScores={
                                                            att.category_scores
                                                        }
                                                    />
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <StatusBadge
                                                        status={att.status}
                                                    />
                                                </td>

                                                {/* DURATION */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <span className="text-xs font-bold text-muted-foreground">
                                                        {att.duration}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="px-6 py-4.5 pr-8 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2">

                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={`/exams?attempt_id=${att.id}`}
                                                                    className="dark:hover:text-blue-305 flex size-8 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 shadow-2xs transition hover:bg-blue-100 hover:text-blue-800 focus:outline-none dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                                >
                                                                    <BookOpen className="size-3.5" />
                                                                    <span className="sr-only">
                                                                        Review
                                                                        Answers
                                                                    </span>
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="top"
                                                                className="max-w-2xl"
                                                            >
                                                                <span>
                                                                    Review
                                                                    Answers
                                                                </span>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteAttempt(
                                                                            att.id,
                                                                        )
                                                                    }
                                                                    className="dark:hover:text-red-305 flex size-8 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 shadow-2xs transition hover:bg-red-100 hover:text-red-800 focus:outline-none dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    <span className="sr-only">
                                                                        Delete
                                                                    </span>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="top"
                                                                className="max-w-2xl"
                                                            >
                                                                <span>
                                                                    Delete
                                                                </span>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 4. FOOTER PAGINATION CONTROL */}
                    {attempts.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-6 py-4 sm:flex-row">
                            <span className="text-xs font-bold text-muted-foreground">
                                Showing{' '}
                                <strong className="text-foreground">
                                    {(pagination.current_page - 1) *
                                        pagination.per_page +
                                        1}
                                </strong>{' '}
                                to{' '}
                                <strong className="text-foreground">
                                    {Math.min(
                                        pagination.current_page *
                                            pagination.per_page,
                                        pagination.total,
                                    )}
                                </strong>{' '}
                                of{' '}
                                <strong className="text-foreground">
                                    {pagination.total}
                                </strong>{' '}
                                results
                            </span>

                            <div className="flex items-center gap-1.5">
                                {/* Previous button */}
                                <button
                                    disabled={pagination.current_page === 1}
                                    onClick={() =>
                                        router.get(
                                            '/history',
                                            {
                                                search: searchVal,
                                                track: selectedTrack,
                                                date: selectedDate,
                                                page:
                                                    pagination.current_page - 1,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                    className="shadow-3xs rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    Previous
                                </button>

                                {/* Page Numbers list */}
                                {generatePaginationLinks(
                                    pagination.current_page,
                                    pagination.last_page,
                                ).map((item, idx) => {
                                    if (item === '...') {
                                        return (
                                            <span
                                                key={`ellipsis-${idx}`}
                                                className="px-1 text-muted-foreground"
                                            >
                                                ...
                                            </span>
                                        );
                                    }

                                    const pageNum = item as number;
                                    const isActive =
                                        pageNum === pagination.current_page;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() =>
                                                router.get(
                                                    '/history',
                                                    {
                                                        search: searchVal,
                                                        track: selectedTrack,
                                                        date: selectedDate,
                                                        page: pageNum,
                                                    },
                                                    { preserveState: true },
                                                )
                                            }
                                            className={`shadow-3xs size-8 cursor-pointer rounded-lg text-xs font-black transition focus:outline-none ${
                                                isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-border bg-white text-muted-foreground hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-white'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {/* Next button */}
                                <button
                                    disabled={
                                        pagination.current_page ===
                                        pagination.last_page
                                    }
                                    onClick={() =>
                                        router.get(
                                            '/history',
                                            {
                                                search: searchVal,
                                                track: selectedTrack,
                                                date: selectedDate,
                                                page:
                                                    pagination.current_page + 1,
                                            },
                                            { preserveState: true },
                                        )
                                    }
                                    className="shadow-3xs rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </PageContainer>


            {/* Unified confirmation modal component */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
            />
        </TooltipProvider>
    );
}

// Preserve navigation breadcrumb tracking config logic
HistoryPage.layout = {
    breadcrumbs: [
        {
            title: 'History',
            href: '/history',
        },
    ],
};
