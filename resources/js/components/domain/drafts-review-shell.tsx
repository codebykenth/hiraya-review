import { Link } from '@inertiajs/react';
import {
    Check,
    X,
    Edit3,
    FileText,
    CheckCircle2,
    ChevronDown,
    ListChecks,
    Inbox,
    ChevronLeft,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { generatePaginationLinks } from '@/lib/utils';

export interface BaseDraftItem {
    id: number;
    approved: boolean;
    category: string;
    subcategory: string;
}

export interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    is_demographic: boolean;
    sort_order: number;
    subcategory?: {
        id: number;
        category_id: number;
        name: string;
        slug: string;
        language: string;
        sort_order: number;
    }[];
}

interface DraftsReviewShellProps<T extends BaseDraftItem> {
    title: string;
    subtitle: string;
    backUrl: string;
    backLabel: string;
    items: T[];
    categories: CategoryItem[];
    searchPlaceholder: string;
    searchMatcher: (item: T, query: string) => boolean;
    commitLabel: string;
    onCommit: () => void;
    onToggleAll: () => void;
    onBulkDeletePending?: () => void;
    emptyStateTitle: string;
    emptyStateDescription: string;
    emptyStateActionUrl: string;
    emptyStateActionLabel: string;
    emptyStateActionIcon?: React.ComponentType<any>;
    renderItem: (item: T) => React.ReactNode;
}

export function DraftsReviewShell<T extends BaseDraftItem>({
    title,
    subtitle,
    backUrl,
    backLabel,
    items,
    categories,
    searchPlaceholder,
    searchMatcher,
    commitLabel,
    onCommit,
    onToggleAll,
    onBulkDeletePending,
    emptyStateTitle,
    emptyStateDescription,
    emptyStateActionUrl,
    emptyStateActionLabel,
    emptyStateActionIcon: EmptyStateActionIcon = ListChecks,
    renderItem,
}: DraftsReviewShellProps<T>) {
    // Build categories tree dynamically with robust static CSC fallback
    const cseCategoriesTree: Record<string, string[]> = {};

    if (categories && categories.length > 0) {
        categories.forEach((cat) => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(
                (sub) => sub.name,
            );
        });
    } else {
        cseCategoriesTree['General Information'] = [
            'Philippine Constitution',
            'Code of Conduct and Ethical Standards (R.A. 6713)',
            'Peace and Human Rights Issues and Concepts',
            'Environment Management and Protection',
        ];
        cseCategoriesTree['Verbal Ability'] = [
            'Word meaning',
            'Sentence completion',
            'Error recognition',
            'Sentence structure',
            'Paragraph organization',
            'Reading comprehension',
        ];
        cseCategoriesTree['Analytical Ability'] = [
            'Word analogy',
            'Symbolic logic / abstract reasoning',
            'Identifying assumptions and drawing conclusions',
            'Data interpretation',
        ];
        cseCategoriesTree['Numerical Ability'] = [
            'Basic operations',
            'Number sequence',
            'Word problems',
        ];
        cseCategoriesTree['Clerical Ability'] = ['Filing', 'Spelling'];
    }

    // Filtering & Pagination States
    const [filterSearch, setFilterSearch] = useState('');
    const [debouncedFilterSearch, setDebouncedFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<
        'all' | 'approved' | 'pending'
    >('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterSubcategory, setFilterSubcategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;
    const tableRef = React.useRef<HTMLDivElement>(null);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setTimeout(() => {
            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }, 50);
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilterSearch(filterSearch);
        }, 300);

        return () => clearTimeout(handler);
    }, [filterSearch]);

    const filteredDrafts = items.filter((item) => {
        const matchesSearch = searchMatcher(item, debouncedFilterSearch);

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'approved' && item.approved) ||
            (filterStatus === 'pending' && !item.approved);

        const matchesCategory =
            filterCategory === 'all' || item.category === filterCategory;

        const matchesSubcategory =
            filterSubcategory === 'all' ||
            item.subcategory === filterSubcategory;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory &&
            matchesSubcategory
        );
    });

    const totalPages = Math.ceil(filteredDrafts.length / pageSize);
    const paginatedDrafts = filteredDrafts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const approvedCount = items.filter((item) => item.approved).length;

    return (
        <PageContainer>
            {/* 1. TOP HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Link
                        href={backUrl}
                        className="flex w-fit cursor-pointer items-center gap-1 text-xs font-black text-foreground transition hover:text-blue-600 focus:outline-none"
                    >
                        <ChevronLeft className="size-4" />
                        {backLabel}
                    </Link>
                    <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                        {title}
                    </h1>
                    <p className="text-base leading-relaxed text-muted-foreground">
                        {subtitle}
                    </p>
                </div>

                {/* BULK ACTIONS HEADER DECK */}
                {items.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        {onBulkDeletePending && (
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={items.length - approvedCount === 0}
                                icon={X}
                                onClick={onBulkDeletePending}
                            >
                                Delete Unapproved (
                                {items.length - approvedCount})
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            icon={ListChecks}
                            onClick={onToggleAll}
                        >
                            {items.every((item) => item.approved)
                                ? 'Unapprove All'
                                : 'Approve All'}
                        </Button>
                        <Button
                            type="button"
                            variant="success"
                            size="sm"
                            disabled={approvedCount === 0}
                            icon={CheckCircle2}
                            onClick={onCommit}
                        >
                            {commitLabel} ({approvedCount})
                        </Button>
                    </div>
                )}
            </div>

            {/* 2. DRAFT SEARCH & FILTER CONTROLS */}
            {items.length > 0 && (
                <div className="shadow-3xs mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="flex min-w-[260px] flex-1 items-center gap-2">
                        <input
                            type="text"
                            value={filterSearch}
                            onChange={(e) => {
                                setFilterSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Category Filter */}
                        <div className="relative min-w-[120px]">
                            <select
                                value={filterCategory}
                                onChange={(e) => {
                                    setFilterCategory(e.target.value);
                                    setFilterSubcategory('all');
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                            >
                                <option
                                    value="all"
                                    className="dark:bg-slate-950"
                                >
                                    All Categories
                                </option>
                                {Object.keys(cseCategoriesTree).map((cat) => (
                                    <option
                                        key={cat}
                                        value={cat}
                                        className="dark:bg-slate-950"
                                    >
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="text-slate-550 pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
                        </div>

                        {/* Subcategory Filter */}
                        <div className="relative min-w-[130px]">
                            <select
                                value={filterSubcategory}
                                onChange={(e) => {
                                    setFilterSubcategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                            >
                                <option
                                    value="all"
                                    className="dark:bg-slate-950"
                                >
                                    All Subcategories
                                </option>
                                {filterCategory !== 'all' &&
                                    cseCategoriesTree[filterCategory]?.map(
                                        (sub) => (
                                            <option
                                                key={sub}
                                                value={sub}
                                                className="dark:bg-slate-950"
                                            >
                                                {sub}
                                            </option>
                                        ),
                                    )}
                                {filterCategory === 'all' &&
                                    Object.values(cseCategoriesTree)
                                        .flat()
                                        .map((sub, idx) => (
                                            <option
                                                key={idx}
                                                value={sub}
                                                className="dark:bg-slate-950"
                                            >
                                                {sub}
                                            </option>
                                        ))}
                            </select>
                            <ChevronDown className="text-slate-550 pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative w-28">
                            <select
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value as any);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                            >
                                <option
                                    value="all"
                                    className="dark:bg-slate-950"
                                >
                                    All Statuses
                                </option>
                                <option
                                    value="approved"
                                    className="dark:bg-slate-950"
                                >
                                    Approved Only
                                </option>
                                <option
                                    value="pending"
                                    className="dark:bg-slate-950"
                                >
                                    Pending Only
                                </option>
                            </select>
                            <ChevronDown className="text-slate-550 pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
                        </div>

                        <span className="shrink-0 pl-1 text-xs font-bold text-muted-foreground">
                            {filteredDrafts.length} found
                        </span>
                    </div>
                </div>
            )}

            {/* 2.5 DRAFT ACTIONS LEGEND */}
            {items.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-border bg-card p-3 text-[10px] font-extrabold tracking-wider uppercase">
                    <span className="text-muted-foreground">Legend:</span>
                    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2 py-1 dark:border-emerald-900/20 dark:bg-emerald-950/10">
                        <span className="border-emerald-250 flex size-5.5 items-center justify-center rounded-md border bg-emerald-100 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <Check className="size-3" />
                        </span>
                        <span className="text-emerald-800 dark:text-emerald-300">
                            Approve / Unapprove Draft
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/50 px-2 py-1 dark:border-blue-900/20 dark:bg-blue-950/10">
                        <span className="border-blue-250 flex size-5.5 items-center justify-center rounded-md border bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                            <Edit3 className="size-3" />
                        </span>
                        <span className="text-blue-800 dark:text-blue-300">
                            Edit Inline
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50/50 px-2 py-1 dark:border-rose-900/20 dark:bg-rose-950/10">
                        <span className="border-rose-250 flex size-5.5 items-center justify-center rounded-md border bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                            <X className="size-3" />
                        </span>
                        <span className="text-rose-800 dark:text-rose-300">
                            Delete Draft
                        </span>
                    </div>
                </div>
            )}

            {/* 3. DRAFT STREAM WORKSPACE */}
            <div
                ref={tableRef}
                className="mt-6 flex scroll-m-24 flex-col gap-6"
            >
                {items.length === 0 ? (
                    /* COMPLETELY EMPTY SYSTEM-WIDE DRAFTS STATE */
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-16 text-center">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Inbox className="size-8" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-foreground">
                            {emptyStateTitle}
                        </h3>
                        <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                            {emptyStateDescription}
                        </p>
                        <Link
                            href={emptyStateActionUrl}
                            className="mt-6 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
                        >
                            <EmptyStateActionIcon className="size-4" />
                            {emptyStateActionLabel}
                        </Link>
                    </div>
                ) : filteredDrafts.length === 0 ? (
                    /* FILTER EMPTY STATE */
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <FileText className="size-6" />
                        </div>
                        <h3 className="font-bold text-foreground">
                            No Matching Drafts
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            No drafts match your active filters.
                        </p>
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => {
                                setFilterSearch('');
                                setFilterStatus('all');
                                setFilterCategory('all');
                                setFilterSubcategory('all');
                            }}
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    /* LIST OF DRAFTS WITH PAGINATION */
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-6">
                            {paginatedDrafts.map((item) => renderItem(item))}
                        </div>

                        {/* Pagination bar */}
                        {filteredDrafts.length > 0 && (
                            <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-b-xl border-t border-border bg-muted px-6 py-4 sm:flex-row">
                                <span className="text-xs font-bold text-muted-foreground">
                                    Showing{' '}
                                    <strong className="text-foreground">
                                        {(currentPage - 1) * pageSize + 1}
                                    </strong>{' '}
                                    to{' '}
                                    <strong className="text-foreground">
                                        {Math.min(
                                            currentPage * pageSize,
                                            filteredDrafts.length,
                                        )}
                                    </strong>{' '}
                                    of{' '}
                                    <strong className="text-foreground">
                                        {filteredDrafts.length}
                                    </strong>{' '}
                                    results
                                </span>

                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() =>
                                                handlePageChange(
                                                    Math.max(
                                                        1,
                                                        currentPage - 1,
                                                    ),
                                                )
                                            }
                                            className="shadow-3xs cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        {generatePaginationLinks(
                                            currentPage,
                                            totalPages,
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
                                                pageNum === currentPage;

                                            return (
                                                <button
                                                    key={pageNum}
                                                    type="button"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pageNum,
                                                        )
                                                    }
                                                    className={`shadow-3xs size-8 cursor-pointer rounded-lg text-xs font-black transition focus:outline-none ${
                                                        isActive
                                                            ? 'bg-blue-600 text-white'
                                                            : 'border border-border bg-card text-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            type="button"
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    Math.min(
                                                        totalPages,
                                                        currentPage + 1,
                                                    ),
                                                )
                                            }
                                            className="shadow-3xs cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </PageContainer>
    );
}
