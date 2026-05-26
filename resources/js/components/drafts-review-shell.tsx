import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/page-container';
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
    ChevronLeft
} from 'lucide-react';
import { Button } from './ui/button';

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
    emptyStateTitle,
    emptyStateDescription,
    emptyStateActionUrl,
    emptyStateActionLabel,
    emptyStateActionIcon: EmptyStateActionIcon = ListChecks,
    renderItem
}: DraftsReviewShellProps<T>) {
    // Build categories tree dynamically with robust static CSC fallback
    const cseCategoriesTree: Record<string, string[]> = {};
    if (categories && categories.length > 0) {
        categories.forEach(cat => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(sub => sub.name);
        });
    } else {
        cseCategoriesTree['General Information'] = [
            'Philippine Constitution',
            'Code of Conduct and Ethical Standards (R.A. 6713)',
            'Peace and Human Rights Issues and Concepts',
            'Environment Management and Protection'
        ];
        cseCategoriesTree['Verbal Ability'] = [
            'Word meaning',
            'Sentence completion',
            'Error recognition',
            'Sentence structure',
            'Paragraph organization',
            'Reading comprehension'
        ];
        cseCategoriesTree['Analytical Ability'] = [
            'Word analogy',
            'Symbolic logic / abstract reasoning',
            'Identifying assumptions and drawing conclusions',
            'Data interpretation'
        ];
        cseCategoriesTree['Numerical Ability'] = [
            'Basic operations',
            'Number sequence',
            'Word problems'
        ];
        cseCategoriesTree['Clerical Ability'] = [
            'Filing',
            'Spelling'
        ];
    }

    // Filtering & Pagination States
    const [filterSearch, setFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterSubcategory, setFilterSubcategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterSearch, filterStatus, filterCategory, filterSubcategory]);

    // Reset subcategory filter when category filter changes
    useEffect(() => {
        setFilterSubcategory('all');
    }, [filterCategory]);

    // Apply filters
    const filteredDrafts = items.filter(item => {
        const matchesSearch = searchMatcher(item, filterSearch);

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'approved' && item.approved) ||
            (filterStatus === 'pending' && !item.approved);

        const matchesCategory =
            filterCategory === 'all' ||
            item.category === filterCategory;

        const matchesSubcategory =
            filterSubcategory === 'all' ||
            item.subcategory === filterSubcategory;

        return matchesSearch && matchesStatus && matchesCategory && matchesSubcategory;
    });

    const totalPages = Math.ceil(filteredDrafts.length / pageSize);
    const paginatedDrafts = filteredDrafts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const approvedCount = items.filter(item => item.approved).length;

    return (
        <PageContainer>
            {/* 1. TOP HEADER */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Link
                        href={backUrl}
                        className="flex w-fit items-center gap-1 text-xs font-black text-foreground hover:text-blue-600 transition cursor-pointer focus:outline-none"
                    >
                        <ChevronLeft className="size-4" />
                        {backLabel}
                    </Link>
                    <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground">
                        {title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                </div>

                {/* BULK ACTIONS HEADER DECK */}
                {items.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            icon={ListChecks}
                            onClick={onToggleAll}
                        >
                            {items.every(item => item.approved) ? 'Unapprove All' : 'Approve All'}
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
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-3xs mt-6">
                    <div className="flex flex-1 min-w-[260px] items-center gap-2">
                        <input
                            type="text"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none transition bg-muted"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Category Filter */}
                        <div className="relative min-w-[120px]">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background pl-2.5 pr-8 py-1.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="all" className="dark:bg-slate-950">All Categories</option>
                                {Object.keys(cseCategoriesTree).map(cat => (
                                    <option key={cat} value={cat} className="dark:bg-slate-950">{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-550 pointer-events-none" />
                        </div>

                        {/* Subcategory Filter */}
                        <div className="relative min-w-[130px]">
                            <select
                                value={filterSubcategory}
                                onChange={(e) => setFilterSubcategory(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background pl-2.5 pr-8 py-1.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="all" className="dark:bg-slate-950">All Subcategories</option>
                                {filterCategory !== 'all' && cseCategoriesTree[filterCategory]?.map(sub => (
                                    <option key={sub} value={sub} className="dark:bg-slate-950">{sub}</option>
                                ))}
                                {filterCategory === 'all' && Object.values(cseCategoriesTree).flat().map((sub, idx) => (
                                    <option key={idx} value={sub} className="dark:bg-slate-950">{sub}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-550 pointer-events-none" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative w-28">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                                className="w-full rounded-lg border border-border bg-background pl-2.5 pr-8 py-1.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="all" className="dark:bg-slate-950">All Statuses</option>
                                <option value="approved" className="dark:bg-slate-950">Approved Only</option>
                                <option value="pending" className="dark:bg-slate-950">Pending Only</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-550 pointer-events-none" />
                        </div>

                        <span className="text-xs text-muted-foreground font-bold shrink-0 pl-1">
                            {filteredDrafts.length} found
                        </span>
                    </div>
                </div>
            )}

            {/* 2.5 DRAFT ACTIONS LEGEND */}
            {items.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-3 text-[10px] font-extrabold uppercase tracking-wider bg-card border border-border p-3 rounded-xl mt-4">
                    <span className="text-muted-foreground">Legend:</span>
                    <div className="flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                        <span className="flex size-5.5 items-center justify-center rounded-md border border-emerald-250 bg-emerald-100 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <Check className="size-3" />
                        </span>
                        <span className="text-emerald-800 dark:text-emerald-300">Approve / Unapprove Draft</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/10 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/20">
                        <span className="flex size-5.5 items-center justify-center rounded-md border border-blue-250 bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                            <Edit3 className="size-3" />
                        </span>
                        <span className="text-blue-800 dark:text-blue-300">Edit Inline</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-rose-50/50 dark:bg-rose-950/10 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-900/20">
                        <span className="flex size-5.5 items-center justify-center rounded-md border border-rose-250 bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                            <X className="size-3" />
                        </span>
                        <span className="text-rose-800 dark:text-rose-300">Delete Draft</span>
                    </div>
                </div>
            )}

            {/* 3. DRAFT STREAM WORKSPACE */}
            <div className="flex flex-col gap-6 mt-6">
                {items.length === 0 ? (
                    /* COMPLETELY EMPTY SYSTEM-WIDE DRAFTS STATE */
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-16 text-center">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Inbox className="size-8" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{emptyStateTitle}</h3>
                        <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
                            {emptyStateDescription}
                        </p>
                        <Link
                            href={emptyStateActionUrl}
                            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-md inline-flex items-center gap-1.5 cursor-pointer"
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
                        <h3 className="font-bold text-foreground">No Matching Drafts</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            No drafts match your active filters.
                        </p>
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => { setFilterSearch(''); setFilterStatus('all'); setFilterCategory('all'); setFilterSubcategory('all'); }}
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
                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border bg-muted px-6 py-4 gap-3 rounded-b-xl mt-4">
                                <span className="text-xs font-bold text-muted-foreground">
                                    Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}</strong> to <strong className="text-foreground">{Math.min(currentPage * pageSize, filteredDrafts.length)}</strong> of <strong className="text-foreground">{filteredDrafts.length}</strong> results
                                </span>

                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-3xs transition hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
                                        >
                                            Previous
                                        </button>

                                        {Array.from({ length: totalPages }).map((_, idx) => {
                                            const pageNum = idx + 1;
                                            const isActive = pageNum === currentPage;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    type="button"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`size-8 rounded-lg text-xs font-black shadow-3xs transition focus:outline-none cursor-pointer ${isActive
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
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-3xs transition hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
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
