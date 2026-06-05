import { Link, router } from '@inertiajs/react';
import { BookOpen, Trash2, Clock } from 'lucide-react';
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

interface AttemptsTableProps {
    attempts: Attempt[];
    pagination: Pagination;
    selectedIds: number[];
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
    handleSelectAll,
    handleSelectOne,
    handleBulkDelete,
    handleDeleteAttempt,
    searchVal,
    selectedTrack,
    selectedDate,
}: AttemptsTableProps) {
    return (
        <Card className="flex min-h-[420px] flex-col justify-between gap-0 overflow-hidden p-0">
            {/* Card Header with Legend */}
            <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-heading text-sm font-extrabold text-foreground">
                    Attempt Records
                </span>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-[10px] font-extrabold tracking-wider uppercase">
                    <span className="text-muted-foreground/80">Legend:</span>

                    <div className="dark:bg-blue-950/30/55 flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 dark:border-blue-900/20 dark:bg-blue-950/10">
                        <span className="border-blue-250 flex size-5.5 items-center justify-center rounded-md border bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                            <BookOpen className="size-3" />
                        </span>
                        <span className="text-blue-800 dark:text-blue-300">
                            Review Answers
                        </span>
                    </div>
                    <div className="dark:bg-rose-950/30/55 flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 dark:border-rose-900/20 dark:bg-rose-950/10">
                        <span className="border-rose-250 flex size-5.5 items-center justify-center rounded-md border bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                            <Trash2 className="size-3" />
                        </span>
                        <span className="text-rose-800 dark:text-rose-300">
                            Delete
                        </span>
                    </div>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between border-b border-border bg-blue-50/50 px-4 sm:px-6 py-2 dark:bg-blue-950/10">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                        {selectedIds.length} selected
                    </span>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-[10px]"
                        onClick={handleBulkDelete}
                    >
                        <Trash2 className="mr-1.5 size-3" />
                        Delete Selected
                    </Button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-border bg-slate-50/50 text-[10px] font-black tracking-wider text-muted-foreground uppercase dark:bg-slate-900/30">
                            <th className="w-12 px-4 sm:px-6 py-4">
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
                            <th className="px-4 sm:px-6 py-4">Date & Time</th>
                            <th className="px-4 sm:px-6 py-4">Track</th>
                            <th className="px-4 sm:px-6 py-4">Category</th>
                            <th className="px-4 sm:px-6 py-4">Score & Categories</th>
                            <th className="px-4 sm:px-6 py-4">Status</th>
                            <th className="px-4 sm:px-6 py-4">Duration</th>
                            <th className="px-4 sm:px-6 py-4 pr-8 text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border dark:divide-slate-900/80">
                        {attempts.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 sm:px-6 py-20 text-center"
                                >
                                    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center">
                                        <div className="text-blue-650 mb-4 flex size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400">
                                            <Clock className="size-6.5" />
                                        </div>
                                        <h3 className="text-sm font-black text-foreground">
                                            No attempts found
                                        </h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                            We couldn't find any completed tests
                                            or practice drills matching your
                                            current filters. Spin up a new exam
                                            simulation to start tracking!
                                        </p>
                                        <Link
                                            href="/exams"
                                            className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 mt-5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
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
                                        className={`transition hover:bg-slate-50/20 dark:hover:bg-slate-900/10 ${selectedIds.includes(att.id) ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
                                    >
                                        {/* CHECKBOX */}
                                        <td className="px-4 sm:px-6 py-4.5">
                                            <Checkbox
                                                checked={selectedIds.includes(
                                                    att.id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleSelectOne(
                                                        att.id,
                                                        !!checked,
                                                    )
                                                }
                                                aria-label={`Select attempt ${att.id}`}
                                            />
                                        </td>

                                        {/* DATE & TIME */}
                                        <td className="px-4 sm:px-6 py-4.5 whitespace-nowrap">
                                            <div className="text-xs leading-normal font-black text-foreground">
                                                {att.date}
                                            </div>
                                            <div className="mt-0.5 text-[10px] leading-none font-bold text-muted-foreground">
                                                {att.time}
                                            </div>
                                        </td>

                                        {/* TRACK */}
                                        <td className="px-4 sm:px-6 py-4.5 whitespace-nowrap">
                                            <TrackBadge track={att.track} />
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="px-4 sm:px-6 py-4.5">
                                            <span
                                                className="block max-w-[280px] text-xs leading-relaxed font-extrabold break-words whitespace-normal text-foreground"
                                                title={att.category}
                                            >
                                                {att.category}
                                            </span>
                                        </td>

                                        {/* SCORE */}
                                        <td className="px-4 sm:px-6 py-4.5">
                                            <ScoreProgress
                                                score={att.score}
                                                status={att.status}
                                                categoryScores={
                                                    att.category_scores
                                                }
                                            />
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-4 sm:px-6 py-4.5 whitespace-nowrap">
                                            <StatusBadge status={att.status} />
                                        </td>

                                        {/* DURATION */}
                                        <td className="px-4 sm:px-6 py-4.5 whitespace-nowrap">
                                            <span className="text-xs font-bold text-muted-foreground">
                                                {att.duration}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-4 sm:px-6 py-4.5 pr-8 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`/exams?attempt_id=${att.id}`}
                                                            className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 flex size-8 cursor-pointer items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 shadow-2xs transition hover:bg-blue-100 hover:text-blue-800 focus:outline-none dark:border-blue-900/30 dark:border-blue-900/50 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
                                                        >
                                                            <BookOpen className="size-3.5" />
                                                            <span className="sr-only">
                                                                Review Answers
                                                            </span>
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side="top"
                                                        className="max-w-2xl"
                                                    >
                                                        <span>
                                                            Review Answers
                                                        </span>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteAttempt(
                                                                    att.id,
                                                                )
                                                            }
                                                            className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 shadow-2xs transition hover:bg-red-100 hover:text-red-800 focus:outline-none dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
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
            {pagination.total > 0 && (
                <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 sm:px-6 py-4 sm:flex-row">
                    <span className="text-xs font-bold text-muted-foreground">
                        Showing{' '}
                        <strong className="text-foreground">
                            {attempts.length > 0
                                ? (pagination.current_page - 1) *
                                      pagination.per_page +
                                  1
                                : 0}
                        </strong>{' '}
                        to{' '}
                        <strong className="text-foreground">
                            {Math.min(
                                pagination.current_page * pagination.per_page,
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
                                        page: pagination.current_page - 1,
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
                                pagination.current_page === pagination.last_page
                            }
                            onClick={() =>
                                router.get(
                                    '/history',
                                    {
                                        search: searchVal,
                                        track: selectedTrack,
                                        date: selectedDate,
                                        page: pagination.current_page + 1,
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
    );
}
