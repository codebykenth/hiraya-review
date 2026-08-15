import { Link, router } from '@inertiajs/react';
import { BookOpen, Trash2, Clock, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip';
import { generatePaginationLinks } from '@/lib/utils';
import type { Attempt, Pagination } from '../types';
import { TrackBadge, StatusBadge, ScoreProgress } from './attempt-components';
import { AttemptExpandableRow } from './attempt-expandable-row';

interface AttemptsTableProps {
    attempts: Attempt[];
    pagination: Pagination;
    selectedIds: number[];
    expandedIds: number[];
    toggleExpandRow: (id: number) => void;
    handleSelectAll: (checked: boolean) => void;
    handleSelectOne: (id: number, checked: boolean) => void;
    handleBulkDelete: () => void;
    handleDeleteAttempt: (id: number) => void;
    searchVal: string;
    selectedTrack: string;
    selectedDate: string;
}

export function AttemptsTable({
    attempts,
    pagination,
    selectedIds,
    expandedIds,
    toggleExpandRow,
    handleSelectAll,
    handleSelectOne,
    handleBulkDelete,
    handleDeleteAttempt,
    searchVal,
    selectedTrack,
    selectedDate,
}: AttemptsTableProps) {
    const fromItem = pagination.total === 0 ? 0 : (pagination.current_page - 1) * pagination.per_page + 1;
    const toItem = Math.min(pagination.total, pagination.current_page * pagination.per_page);

    return (
        <Card className="flex min-h-[420px] flex-col justify-between gap-0 overflow-hidden p-0 shadow-2xs">
            {/* Card Header with Counter and Legend */}
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-extrabold text-foreground">
                        Attempt Records
                    </span>
                    {pagination.total > 0 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-muted-foreground dark:bg-slate-800">
                            {pagination.total} total
                        </span>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-extrabold tracking-wider uppercase">
                    <span className="text-muted-foreground/80">Legend:</span>
                    <div className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 dark:border-blue-900/20 dark:bg-blue-950/10">
                        <span className="flex size-5 items-center justify-center rounded-md border border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                            <BookOpen className="size-3" />
                        </span>
                        <span className="text-blue-800 dark:text-blue-300">
                            Review
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/40">
                        <span className="flex size-5 items-center justify-center rounded-md border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <ChevronDown className="size-3" />
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                            Breakdown
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 dark:border-rose-900/20 dark:bg-rose-950/10">
                        <span className="flex size-5 items-center justify-center rounded-md border border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                            <Trash2 className="size-3" />
                        </span>
                        <span className="text-rose-800 dark:text-rose-300">
                            Delete
                        </span>
                    </div>
                </div>
            </div>

            {/* Multi-selection banner */}
            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between border-b border-border bg-blue-50/60 px-4 py-2 sm:px-6 dark:bg-blue-950/20">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                        {selectedIds.length} attempt{selectedIds.length > 1 ? 's' : ''} selected
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs font-bold"
                        onClick={handleBulkDelete}
                    >
                        <Trash2 className="mr-1.5 size-3.5" />
                        Delete Selected
                    </Button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-border bg-slate-50/60 text-[10px] font-black tracking-wider text-muted-foreground uppercase dark:bg-slate-900/40">
                            <th className="w-10 px-4 py-3 sm:px-5">
                                <Checkbox
                                    checked={
                                        attempts.length > 0 &&
                                        selectedIds.length === attempts.length
                                    }
                                    onCheckedChange={(checked) =>
                                        handleSelectAll(!!checked)
                                    }
                                    aria-label="Select all"
                                />
                            </th>
                            <th className="w-16 px-4 py-3 sm:px-5">ID</th>
                            <th className="px-4 py-3 sm:px-5">Date & Time</th>
                            <th className="px-4 py-3 sm:px-5">Track</th>
                            <th className="px-4 py-3 sm:px-5">Category</th>
                            <th className="px-4 py-3 sm:px-5">Score</th>
                            <th className="px-4 py-3 sm:px-5">Status</th>
                            <th className="px-4 py-3 sm:px-5">Duration</th>
                            <th className="px-4 py-3 pr-6 text-right sm:px-5">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-slate-900/80">
                        {attempts.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={9}
                                    className="px-4 py-16 text-center sm:px-6"
                                >
                                    <div className="mx-auto flex max-w-md flex-col items-center justify-center">
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                                            <Clock className="size-6" />
                                        </div>
                                        <h3 className="text-sm font-black text-foreground">
                                            No attempt records found
                                        </h3>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            We couldn't find any completed tests or drills matching your current filters. Start a new test to begin tracking your performance!
                                        </p>
                                        <Button asChild className="mt-4 bg-blue-600 text-xs font-bold text-white hover:bg-blue-700">
                                            <Link href="/exams">
                                                Start New Test
                                            </Link>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            attempts.map((att) => {
                                const isExpanded = expandedIds.includes(att.id);
                                const isSelected = selectedIds.includes(att.id);

                                return (
                                    <React.Fragment key={att.id}>
                                        <tr
                                            className={`transition-colors hover:bg-slate-50/40 dark:hover:bg-slate-900/20 ${isSelected ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
                                        >
                                            {/* CHECKBOX */}
                                            <td className="px-4 py-3.5 sm:px-5">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(
                                                            att.id,
                                                            !!checked,
                                                        )
                                                    }
                                                    aria-label={`Select attempt ${att.id}`}
                                                />
                                            </td>

                                            {/* ID */}
                                            <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs font-bold text-muted-foreground sm:px-5">
                                                #{att.id}
                                            </td>

                                            {/* DATE & TIME */}
                                            <td className="px-4 py-3.5 whitespace-nowrap sm:px-5">
                                                <div className="text-xs font-black text-foreground">
                                                    {att.date}
                                                </div>
                                                <div className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                                                    {att.time}
                                                </div>
                                            </td>

                                            {/* TRACK */}
                                            <td className="px-4 py-3.5 whitespace-nowrap sm:px-5">
                                                <TrackBadge track={att.track} />
                                            </td>

                                            {/* CATEGORY */}
                                            <td className="px-4 py-3.5 sm:px-5">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpandRow(att.id)}
                                                    className="block max-w-[240px] text-left text-xs font-bold text-foreground hover:text-blue-600 hover:underline dark:hover:text-blue-400"
                                                    title={att.category}
                                                >
                                                    {att.category}
                                                </button>
                                            </td>

                                            {/* SCORE */}
                                            <td className="px-4 py-3.5 sm:px-5">
                                                <ScoreProgress
                                                    score={att.score}
                                                    status={att.status}
                                                    detail={`${att.correct}/${att.total}`}
                                                />
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-4 py-3.5 whitespace-nowrap sm:px-5">
                                                <StatusBadge status={att.status} />
                                            </td>

                                            {/* DURATION */}
                                            <td className="px-4 py-3.5 whitespace-nowrap sm:px-5">
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    {att.duration}
                                                </span>
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-4 py-3.5 pr-6 text-right whitespace-nowrap sm:px-5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Review Answers */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Link
                                                                href={`/exams?attempt_id=${att.id}&from=history`}
                                                                className="flex size-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/40"
                                                            >
                                                                <BookOpen className="size-3.5" />
                                                                <span className="sr-only">Review Answers</span>
                                                            </Link>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <span>Review Answers</span>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {/* Toggle Breakdown */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleExpandRow(att.id)}
                                                                className={`flex size-7 items-center justify-center rounded-lg border transition ${
                                                                    isExpanded
                                                                        ? 'border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                                                                        : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                                                                }`}
                                                            >
                                                                {isExpanded ? (
                                                                    <ChevronDown className="size-3.5" />
                                                                ) : (
                                                                    <ChevronRight className="size-3.5" />
                                                                )}
                                                                <span className="sr-only">
                                                                    {isExpanded ? 'Hide Breakdown' : 'View Breakdown'}
                                                                </span>
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <span>{isExpanded ? 'Hide Breakdown' : 'View Breakdown'}</span>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    {/* Delete Attempt */}
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteAttempt(att.id)}
                                                                className="flex size-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 hover:text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                                <span className="sr-only">Delete Attempt</span>
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="top">
                                                            <span>Delete</span>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expandable Breakdown sub-row */}
                                        {isExpanded && (
                                            <AttemptExpandableRow attempt={att} />
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls Footer */}
            {pagination.total > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-slate-50/40 px-4 py-3 sm:flex-row sm:px-6 dark:bg-slate-900/30">
                    <span className="text-xs font-bold text-muted-foreground">
                        Showing {fromItem} to {toItem} of {pagination.total} records
                    </span>

                    {pagination.last_page > 1 && (
                        <div className="flex items-center gap-1">
                            {generatePaginationLinks(
                                pagination.current_page,
                                pagination.last_page,
                            ).map((page, index) => {
                                if (page === '...') {
                                    return (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="px-2 text-xs font-bold text-muted-foreground"
                                        >
                                            ...
                                        </span>
                                    );
                                }

                                const pageNum = Number(page);
                                const isActive = pageNum === pagination.current_page;

                                return (
                                    <Button
                                        key={pageNum}
                                        size="sm"
                                        variant={isActive ? 'default' : 'outline'}
                                        className={`size-8 p-0 text-xs font-bold ${
                                            isActive
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : ''
                                        }`}
                                        onClick={() => {
                                            router.get(
                                                window.location.pathname,
                                                {
                                                    search: searchVal,
                                                    track: selectedTrack,
                                                    date: selectedDate,
                                                    per_page: pagination.per_page,
                                                    page: pageNum,
                                                },
                                                {
                                                    preserveState: true,
                                                    replace: true,
                                                },
                                            );
                                        }}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
