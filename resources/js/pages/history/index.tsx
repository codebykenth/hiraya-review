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
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { TrackBadge, StatusBadge, ScoreProgress } from '@/components/attempt-components';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
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

export default function HistoryPage({ attempts = [], pagination, filters }: HistoryPageProps) {
    const [searchVal, setSearchVal] = useState(filters.search || '');
    const [selectedTrack, setSelectedTrack] = useState(filters.track || 'All Tracks');
    const [selectedDate, setSelectedDate] = useState(filters.date || '30');
    const [retakeTarget, setRetakeTarget] = useState<Attempt | null>(null);

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
        onConfirm: () => { },
    });

    // Strict 1-liner comment: Open same/fresh choice modal for all exam and drill retakes from history
    const handleRetakeClick = (att: Attempt) => {
        setRetakeTarget(att);
    };

    // Strict 1-liner comment: Safely prompt and dispatch DELETE request to remove user attempt record
    const handleDeleteAttempt = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Attempt Record?',
            message: 'Are you sure you want to delete this attempt record? This action cannot be undone and will permanently remove it from your history metrics.',
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/exams/attempts/${id}`, {
                    preserveScroll: true
                });
            }
        });
    };

    // Handle instant filter update via Inertia router
    const updateFilters = (newSearch: string, newTrack: string, newDate: string) => {
        router.get(
            historyIndex().url,
            {
                search: newSearch,
                track: newTrack,
                date: newDate,
                page: 1 // Reset pagination to page 1 on filter
            },
            {
                preserveState: true,
                replace: true
            }
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
            <Head title="Attempt History" />

            <PageContainer>

                {/* 1. HEADER SECTION */}
                <PageHeader
                    title="Attempt History"
                    description="Review your past performance, analyze detailed score breakdowns, and identify specific areas for improvement across all your exam tracks."
                    descriptionClassName="text-sm text-muted-foreground max-w-3xl leading-relaxed"
                    className="flex flex-col gap-1"
                />

                {/* 2. FILTERS CONTAINER CARD */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-3xs">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                        {/* Search bar form */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-2xl">
                            <Input
                                type="text"
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                placeholder="Search exams by name or ID..."
                                className="pl-9"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        </form>

                        {/* Select Filters Row */}
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Track Select */}
                            <div className="relative flex-1 sm:flex-initial shrink-0">
                                <select
                                    value={selectedTrack}
                                    onChange={handleTrackChange}
                                    className="appearance-none w-full sm:w-auto rounded-lg border border-border bg-white pl-4 pr-10 py-2 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none dark:bg-slate-900"
                                >
                                    <option value="All Tracks">All Tracks</option>
                                    <option value="Professional">Professional</option>
                                    <option value="Subprofessional">Subprofessional</option>
                                    <option value="Drill">Drill</option>
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                            </div>

                            {/* Date Select */}
                            <div className="relative flex-1 sm:flex-initial shrink-0">
                                <select
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="appearance-none w-full sm:w-auto rounded-lg border border-border bg-white pl-9 pr-10 py-2 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none dark:bg-slate-900"
                                >
                                    <option value="30">Last 30 Days</option>
                                    <option value="7">Last 7 Days</option>
                                    <option value="all">All Time</option>
                                </select>
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. ATTEMPTS TABLE CONTAINER CARD */}
                <Card className="overflow-hidden flex flex-col justify-between min-h-[420px] p-0 gap-0">

                    {/* Card Header with Legend */}
                    <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-heading text-sm font-extrabold text-foreground">
                            Attempt Records
                        </span>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-extrabold uppercase tracking-wider">
                            <span className="text-muted-foreground/80">Legend:</span>
                            <div className="flex items-center gap-1.5 bg-amber-50/50 dark:bg-amber-950/10 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                <span className="flex size-5.5 items-center justify-center rounded-md border border-amber-250 bg-amber-100 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
                                    <RotateCcw className="size-3" />
                                </span>
                                <span className="text-amber-800 dark:text-amber-300">Retake Test</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/10 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                <span className="flex size-5.5 items-center justify-center rounded-md border border-blue-250 bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                                    <BookOpen className="size-3" />
                                </span>
                                <span className="text-blue-800 dark:text-blue-300">Review Answers</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-rose-50/50 dark:bg-rose-950/10 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-900/20">
                                <span className="flex size-5.5 items-center justify-center rounded-md border border-rose-250 bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                                    <Trash2 className="size-3" />
                                </span>
                                <span className="text-rose-800 dark:text-rose-300">Delete</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/30 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Track</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Score & Categories</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Duration</th>
                                    <th className="px-6 py-4 text-right pr-8">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border dark:divide-slate-900/80">
                                {attempts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center max-w-2xl mx-auto">
                                                <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400 mb-4">
                                                    <Clock className="size-6.5" />
                                                </div>
                                                <h3 className="text-sm font-black text-foreground">No attempts found</h3>
                                                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                                                    We couldn't find any completed tests or practice drills matching your current filters. Spin up a new exam simulation to start tracking!
                                                </p>
                                                <Link
                                                    href="/exams"
                                                    className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                                                >
                                                    Start New Test
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    attempts.map((att) => {
                                        return (
                                            <tr key={att.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition">

                                                {/* DATE & TIME */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <div className="text-xs font-black text-foreground leading-normal">
                                                        {att.date}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-muted-foreground mt-0.5 leading-none">
                                                        {att.time}
                                                    </div>
                                                </td>

                                                {/* TRACK */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <TrackBadge track={att.track} />
                                                </td>

                                                {/* CATEGORY */}
                                                <td className="px-6 py-4.5">
                                                    <span
                                                        className="text-xs font-extrabold text-foreground block max-w-[280px] whitespace-normal break-words leading-relaxed"
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
                                                        categoryScores={att.category_scores}
                                                    />
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <StatusBadge status={att.status} />
                                                </td>

                                                {/* DURATION */}
                                                <td className="px-6 py-4.5 whitespace-nowrap">
                                                    <span className="text-xs font-bold text-muted-foreground">
                                                        {att.duration}
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}
                                                <td className="px-6 py-4.5 whitespace-nowrap text-right pr-8">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRetakeClick(att)}
                                                                    className="flex size-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400 dark:hover:bg-amber-900/30 dark:hover:text-amber-305 shadow-2xs cursor-pointer focus:outline-none"
                                                                >
                                                                    <RotateCcw className="size-3.5" />
                                                                    <span className="sr-only">Retake Test</span>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className='max-w-2xl'>
                                                                <span>Retake Attempt</span>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={`/exams?attempt_id=${att.id}`}
                                                                    className="flex size-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 transition dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-305 shadow-2xs cursor-pointer focus:outline-none"
                                                                >
                                                                    <BookOpen className="size-3.5" />
                                                                    <span className="sr-only">Review Answers</span>
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className='max-w-2xl'>
                                                                <span>Review Answers</span>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteAttempt(att.id)}
                                                                    className="flex size-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 transition dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-305 shadow-2xs cursor-pointer focus:outline-none"
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                    <span className="sr-only">Delete</span>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className='max-w-2xl'>
                                                                <span>Delete</span>
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
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border  px-6 py-4 gap-3">
                            <span className="text-xs font-bold text-muted-foreground">
                                Showing <strong className="text-foreground">{(pagination.current_page - 1) * pagination.per_page + 1}</strong> to <strong className="text-foreground">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</strong> of <strong className="text-foreground">{pagination.total}</strong> results
                            </span>

                            <div className="flex items-center gap-1.5">
                                {/* Previous button */}
                                <button
                                    disabled={pagination.current_page === 1}
                                    onClick={() => router.get('/history', {
                                        search: searchVal,
                                        track: selectedTrack,
                                        date: selectedDate,
                                        page: pagination.current_page - 1
                                    }, { preserveState: true })}
                                    className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-3xs transition hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-900"
                                >
                                    Previous
                                </button>

                                {/* Page Numbers list */}
                                {Array.from({ length: pagination.last_page }).map((_, idx) => {
                                    const pageNum = idx + 1;
                                    const isActive = pageNum === pagination.current_page;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => router.get('/history', {
                                                search: searchVal,
                                                track: selectedTrack,
                                                date: selectedDate,
                                                page: pageNum
                                            }, { preserveState: true })}
                                            className={`size-8 rounded-lg text-xs font-black shadow-3xs transition focus:outline-none ${isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-border bg-white text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-white dark:bg-slate-900'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                {/* Next button */}
                                <button
                                    disabled={pagination.current_page === pagination.last_page}
                                    onClick={() => router.get('/history', {
                                        search: searchVal,
                                        track: selectedTrack,
                                        date: selectedDate,
                                        page: pagination.current_page + 1
                                    }, { preserveState: true })}
                                    className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-3xs transition hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-900"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </Card>

            </PageContainer>

            {/* Retake Options Modal */}
            {retakeTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity duration-300">
                    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="font-heading text-lg font-black text-foreground">
                                    Retake Exam Options
                                </h3>
                                <p className="text-xs font-bold text-muted-foreground mt-1">
                                    Choose how you want to retake your {retakeTarget.track} attempt.
                                </p>
                            </div>
                            <button
                                onClick={() => setRetakeTarget(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition"
                            >
                                <XCircle className="size-5" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    router.visit(`/exams?retake_same=${retakeTarget.id}`);
                                    setRetakeTarget(null);
                                }}
                                className="flex flex-col gap-1.5 rounded-xl border border-blue-100 bg-blue-50/20 p-4 text-left hover:bg-blue-50/50 hover:border-blue-300 dark:border-blue-900/30 dark:bg-blue-950/10 dark:hover:bg-blue-950/20 transition"
                            >
                                <span className="text-sm font-extrabold text-blue-700 dark:text-blue-400">
                                    🔄 Retake Same Questions
                                </span>
                                <span className="text-xs font-medium text-muted-foreground leading-normal">
                                    Test your memory and mastery by answering the exact same set of {retakeTarget.total} questions.
                                </span>
                            </button>

                            <button
                                onClick={() => {
                                    router.visit(`/exams?retake_fresh=${retakeTarget.id}`);
                                    setRetakeTarget(null);
                                }}
                                className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 text-left hover:bg-slate-50 hover:border-blue-300 transition"
                            >
                                <span className="text-sm font-extrabold text-foreground">
                                    ✨ Retake Fresh Questions
                                </span>
                                <span className="text-xs font-medium text-muted-foreground leading-normal">
                                    Generate a brand-new, randomized set of questions for the {retakeTarget.track} track.
                                </span>
                            </button>
                        </div>

                        <div className="mt-5 flex justify-end">
                            <button
                                onClick={() => setRetakeTarget(null)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-900 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Custom confirmation dialog modal matching global visual standard */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div
                        className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl animate-in zoom-in-95 duration-205"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                            className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition focus:outline-none"
                            aria-label="Close dialog"
                        >
                            <X className="size-4.5" />
                        </button>

                        <div className="flex flex-col gap-1 pr-6">
                            <h3 className="font-heading text-lg font-bold text-foreground">
                                {confirmModal.title}
                            </h3>
                            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                                {confirmModal.message}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="cursor-pointer rounded-lg border border-border bg-white px-4.5 py-2 text-xs font-bold text-muted-foreground hover:bg-slate-50 dark:bg-slate-900 transition focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    confirmModal.onConfirm();
                                }}
                                className={`cursor-pointer rounded-lg px-4.5 py-2 text-xs font-bold text-white shadow-3xs transition focus:outline-none ${confirmModal.variant === 'danger'
                                        ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                                        : confirmModal.variant === 'success'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                    }`}
                            >
                                {confirmModal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
