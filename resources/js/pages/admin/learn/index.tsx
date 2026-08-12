import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    Edit2,
    Trash2,
    FileText,
    ChevronRight,
    Check,
    X,
    LayoutGrid,
    List,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getCategoryStyles } from '@/components/domain/curation-index-shell';
import type { CategoryItem } from '@/components/domain/drafts-review-shell';
import { PageContainer } from '@/components/layout/page-container';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    index as adminLearnIndex,
    create as adminLearnCreate,
    edit as adminLearnEdit,
} from '@/routes/admin/learn';
import { show as learnShow } from '@/routes/learn';

interface LearnModule {
    id: number;
    title: string;
    slug: string;
    topic: string;
    summary: string;
    estimated_minutes: number;
    is_published: boolean;
    category: string;
    subcategory: string;
    updated_at: string;
}

interface AdminLearnIndexProps {
    modules: LearnModule[];
    categories?: CategoryItem[];
}

export default function AdminLearnIndex({
    modules = [],
    categories = [],
}: AdminLearnIndexProps) {
    const [filterSearch, setFilterSearch] = useState('');
    const [debouncedFilterSearch, setDebouncedFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<
        'all' | 'ACTIVE' | 'DRAFT'
    >('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterSubcategory, setFilterSubcategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(() => {
        const params = new URLSearchParams(
            typeof window !== 'undefined' ? window.location.search : '',
        );
        const p = params.get('page');

        return p ? Number(p) : 1;
    });
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        id: number | null;
    }>({ isOpen: false, id: null });
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [bulkActionModal, setBulkActionModal] = useState<{
        isOpen: boolean;
        action: 'setActive' | 'setInactive' | 'delete' | null;
    }>({ isOpen: false, action: null });
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const pageSize = 10;

    // Build categories tree
    const cseCategoriesTree: Record<string, string[]> = {};

    if (categories && categories.length > 0) {
        categories.forEach((cat) => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(
                (sub) => sub.name,
            );
        });
    } else {
        // Fallback categories
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

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilterSearch(filterSearch);
        }, 300);

        return () => clearTimeout(handler);
    }, [filterSearch]);

    const filteredModules = modules
        .filter((mod) => {
            const matchesSearch =
                mod.title
                    .toLowerCase()
                    .includes(debouncedFilterSearch.toLowerCase()) ||
                mod.topic
                    .toLowerCase()
                    .includes(debouncedFilterSearch.toLowerCase()) ||
                mod.category
                    .toLowerCase()
                    .includes(debouncedFilterSearch.toLowerCase()) ||
                mod.subcategory
                    .toLowerCase()
                    .includes(debouncedFilterSearch.toLowerCase()) ||
                String(mod.id).includes(debouncedFilterSearch);

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'ACTIVE' && mod.is_published) ||
                (filterStatus === 'DRAFT' && !mod.is_published);

            const matchesCategory =
                filterCategory === 'all' || mod.category === filterCategory;

            const matchesSubcategory =
                filterSubcategory === 'all' ||
                mod.subcategory === filterSubcategory;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory &&
                matchesSubcategory
            );
        })
        .sort((a, b) => {
            // Sort by Category
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }

            // Then by Subcategory
            if (a.subcategory !== b.subcategory) {
                return a.subcategory.localeCompare(b.subcategory);
            }

            // Then by Status (Active first)
            if (a.is_published !== b.is_published) {
                return a.is_published ? -1 : 1;
            }

            // Then by updated_at timestamp (latest to oldest)
            return (
                new Date(b.updated_at).getTime() -
                new Date(a.updated_at).getTime()
            );
        });

    const totalPages = Math.ceil(filteredModules.length / pageSize);
    const paginatedModules = filteredModules.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));
        window.history.replaceState({}, '', url.toString());
    };

    const promptDelete = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const confirmDelete = () => {
        if (deleteModal.id !== null) {
            router.delete(`/admin/learn/${deleteModal.id}`, {
                preserveScroll: true,
            });
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        const newSelected = new Set(selectedIds);

        if (checked) {
            paginatedModules.forEach((mod) => newSelected.add(mod.id));
        } else {
            paginatedModules.forEach((mod) => newSelected.delete(mod.id));
        }

        setSelectedIds(newSelected);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        const newSelected = new Set(selectedIds);

        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }

        setSelectedIds(newSelected);
    };

    const handleBulkAction = (
        action: 'setActive' | 'setInactive' | 'delete',
    ) => {
        if (selectedIds.size === 0) {
            return;
        }

        setBulkActionModal({ isOpen: true, action });
    };

    // Determine which bulk action buttons to show based on selection
    const selectedModules = modules.filter((mod) => selectedIds.has(mod.id));
    const allSelectedAreDraft =
        selectedModules.length > 0 &&
        selectedModules.every((mod) => !mod.is_published);
    const allSelectedAreActive =
        selectedModules.length > 0 &&
        selectedModules.every((mod) => mod.is_published);
    const showSetActive = !allSelectedAreActive;
    const showSetInactive = !allSelectedAreDraft;

    const confirmBulkAction = () => {
        if (!bulkActionModal.action || selectedIds.size === 0) {
            return;
        }

        const ids = Array.from(selectedIds);

        if (bulkActionModal.action === 'delete') {
            router.post(
                '/admin/learn/bulk-delete',
                { ids },
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setSelectedIds(new Set());
                        setBulkActionModal({ isOpen: false, action: null });
                    },
                },
            );
        } else {
            router.post(
                '/admin/learn/bulk-update-status',
                {
                    ids,
                    is_published: bulkActionModal.action === 'setActive',
                },
                {
                    preserveScroll: true,
                    onFinish: () => {
                        setSelectedIds(new Set());
                        setBulkActionModal({ isOpen: false, action: null });
                    },
                },
            );
        }
    };

    return (
        <>
            <Head title="Module Management" />

            <PageContainer>
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            Module Management
                        </h1>
                        <p className="text-base leading-relaxed text-muted-foreground">
                            Overview of all CSE learning modules in the database
                        </p>
                    </div>
                    <Link
                        href={adminLearnCreate().url}
                        className="group inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition transition-all duration-300 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                    >
                        <ChevronRight className="size-4 transition-transform group-hover:scale-110" />
                        Create New Module
                    </Link>
                </div>

                {/* Search & Filters */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
                    <div className="flex min-w-[260px] flex-1 items-center gap-2">
                        <input
                            type="text"
                            value={filterSearch}
                            onChange={(e) => {
                                setFilterSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search modules (title, summary, topic)..."
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
                            <ChevronRight className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 -rotate-90 text-muted-foreground" />
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
                            <ChevronRight className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 -rotate-90 text-muted-foreground" />
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
                                    value="ACTIVE"
                                    className="dark:bg-slate-950"
                                >
                                    Active Only
                                </option>
                                <option
                                    value="DRAFT"
                                    className="dark:bg-slate-950"
                                >
                                    Draft Only
                                </option>
                            </select>
                            <ChevronRight className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 -rotate-90 text-muted-foreground" />
                        </div>

                        <span className="shrink-0 pl-1 text-xs font-bold text-muted-foreground">
                            {filteredModules.length} found
                        </span>

                        {/* View Mode Toggle */}
                        <div className="ml-auto flex items-center rounded-lg border border-border bg-background p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                                    viewMode === 'table'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Table List View"
                            >
                                <List className="size-3.5" />
                                <span className="hidden sm:inline">Table</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                                    viewMode === 'grid'
                                        ? 'bg-blue-600 text-white shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Grid Card View"
                            >
                                <LayoutGrid className="size-3.5" />
                                <span className="hidden sm:inline">Cards</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bulk Action Toolbar */}
                {selectedIds.size > 0 && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-xs dark:border-blue-900/30 dark:bg-blue-950/30">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-900 dark:text-blue-300">
                                {selectedIds.size} module
                                {selectedIds.size !== 1 ? 's' : ''} selected
                            </span>
                            <button
                                type="button"
                                onClick={() => setSelectedIds(new Set())}
                                className="text-xs font-semibold text-blue-700 underline transition hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                                Clear selection
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {showSetActive && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    icon={Check}
                                    onClick={() =>
                                        handleBulkAction('setActive')
                                    }
                                    className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                                >
                                    Set Active
                                </Button>
                            )}
                            {showSetInactive && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    icon={X}
                                    onClick={() =>
                                        handleBulkAction('setInactive')
                                    }
                                    className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-400 dark:hover:bg-amber-950/40"
                                >
                                    Set Inactive
                                </Button>
                            )}
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                icon={Trash2}
                                onClick={() => handleBulkAction('delete')}
                            >
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                )}

                {/* Module Cards Grid */}
                {modules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-16 text-center">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <FileText className="size-8" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-foreground">
                            No Modules Found
                        </h3>
                        <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                            We couldn't find any learning modules in the
                            database. Start by creating your first module using
                            the AI Generator or Manual Entry.
                        </p>
                        <Link
                            href={adminLearnCreate().url}
                            className="group mt-6 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition transition-all duration-300 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                        >
                            <ChevronRight className="size-4 transition-transform group-hover:scale-110" />
                            Create Module
                        </Link>
                    </div>
                ) : filteredModules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <FileText className="size-6" />
                        </div>
                        <h3 className="font-bold text-foreground">
                            No Matching Modules
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            No modules match your active filters.
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
                    <div className="flex flex-col gap-6">
                        {/* Select All Header (Grid View) */}
                        {viewMode === 'grid' && (
                            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={
                                        paginatedModules.length > 0 &&
                                        paginatedModules.every((mod) =>
                                            selectedIds.has(mod.id),
                                        )
                                    }
                                    onChange={(e) =>
                                        handleSelectAll(e.target.checked)
                                    }
                                    className="size-4 cursor-pointer accent-blue-600"
                                />
                                <span className="text-xs font-bold text-muted-foreground">
                                    Select all on this page
                                </span>
                            </div>
                        )}

                        {viewMode === 'table' ? (
                            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
                                <table className="w-full border-collapse text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/60 text-muted-foreground">
                                            <th className="w-12 px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        paginatedModules.length >
                                                            0 &&
                                                        paginatedModules.every(
                                                            (mod) =>
                                                                selectedIds.has(
                                                                    mod.id,
                                                                ),
                                                        )
                                                    }
                                                    onChange={(e) =>
                                                        handleSelectAll(
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="size-4 cursor-pointer accent-blue-600"
                                                />
                                            </th>
                                            <th className="w-16 px-4 py-3 font-bold">
                                                ID
                                            </th>
                                            <th className="min-w-[400px] px-4 py-3 font-bold">
                                                Module Title & Summary
                                            </th>
                                            <th className="w-36 px-4 py-3 font-bold">
                                                Category
                                            </th>
                                            <th className="w-40 px-4 py-3 font-bold">
                                                Subcategory
                                            </th>
                                            <th className="w-24 px-4 py-3 font-bold">
                                                Read Time
                                            </th>
                                            <th className="w-28 px-4 py-3 font-bold">
                                                Status
                                            </th>
                                            <th className="w-32 px-4 py-3 text-right font-bold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {paginatedModules.map((mod) => (
                                            <tr
                                                key={mod.id}
                                                className={`transition hover:bg-muted/40 ${
                                                    selectedIds.has(mod.id)
                                                        ? 'bg-blue-50/50 dark:bg-blue-950/20'
                                                        : ''
                                                }`}
                                            >
                                                <td className="w-12 px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(
                                                            mod.id,
                                                        )}
                                                        onChange={(e) =>
                                                            handleSelectOne(
                                                                mod.id,
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="size-4 cursor-pointer accent-blue-600"
                                                    />
                                                </td>
                                                <td className="w-16 px-4 py-3 font-bold text-muted-foreground">
                                                    #{mod.id}
                                                </td>
                                                <td className="min-w-[400px] px-4 py-3">
                                                    <div className="line-clamp-1 font-bold text-foreground">
                                                        {mod.title}
                                                    </div>
                                                    <div className="line-clamp-1 text-[11px] text-muted-foreground">
                                                        {mod.summary ||
                                                            'CSE Syllabus Study Module'}
                                                    </div>
                                                </td>
                                                <td className="w-36 px-4 py-3">
                                                    <span
                                                        className={`inline-flex max-w-[130px] truncate rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(mod.category)}`}
                                                    >
                                                        {mod.category}
                                                    </span>
                                                </td>
                                                <td className="w-40 px-4 py-3">
                                                    <span className="inline-block max-w-[140px] truncate rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-300">
                                                        {mod.subcategory}
                                                    </span>
                                                </td>
                                                <td className="w-24 px-4 py-3 font-semibold text-muted-foreground">
                                                    {mod.estimated_minutes
                                                        ? `${mod.estimated_minutes} min`
                                                        : '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                                            mod.is_published
                                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                                : 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400'
                                                        }`}
                                                    >
                                                        {mod.is_published
                                                            ? 'Active'
                                                            : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <TooltipProvider
                                                            delayDuration={150}
                                                        >
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`${learnShow(mod.slug).url}?page=${currentPage}`}
                                                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-blue-600 dark:text-blue-400"
                                                                    >
                                                                        <Eye className="size-4" />
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Student
                                                                    Preview
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`${adminLearnEdit(mod.id).url}?page=${currentPage}`}
                                                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-blue-600 dark:text-blue-400"
                                                                    >
                                                                        <Edit2 className="size-4" />
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Edit details
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            promptDelete(
                                                                                mod.id,
                                                                            )
                                                                        }
                                                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Delete
                                                                    module
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {paginatedModules.map((mod) => (
                                    <div
                                        key={mod.id}
                                        className={`group relative rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                                            selectedIds.has(mod.id)
                                                ? 'ring-2 ring-blue-500 ring-offset-2'
                                                : ''
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(
                                                    mod.id,
                                                )}
                                                onChange={(e) =>
                                                    handleSelectOne(
                                                        mod.id,
                                                        e.target.checked,
                                                    )
                                                }
                                                className="size-4 cursor-pointer accent-blue-600"
                                            />
                                        </div>

                                        {/* Card Header */}
                                        <div className="mb-4 flex items-start justify-between gap-2 pr-8">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span
                                                    className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(mod.category)}`}
                                                >
                                                    {mod.category}
                                                </span>
                                                <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:bg-blue-950/40 dark:text-blue-300">
                                                    {mod.subcategory}
                                                </span>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                                    mod.is_published
                                                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                        : 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400'
                                                }`}
                                            >
                                                {mod.is_published
                                                    ? 'Active'
                                                    : 'Draft'}
                                            </span>
                                        </div>

                                        {/* Module ID */}
                                        <div className="mb-3">
                                            <span className="text-xs font-bold text-muted-foreground">
                                                #{mod.id}
                                            </span>
                                        </div>

                                        {/* Module Title */}
                                        <div className="mb-2 line-clamp-2 text-sm leading-relaxed font-bold text-foreground">
                                            {mod.title}
                                        </div>

                                        {/* Module Summary */}
                                        <div className="mb-4 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                                            {mod.summary ||
                                                'CSE Syllabus Study Module'}
                                        </div>

                                        {/* Estimated Time */}
                                        {mod.estimated_minutes && (
                                            <div className="mb-4 text-[10px] font-semibold text-muted-foreground">
                                                {mod.estimated_minutes} min read
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-1.5 border-t border-border pt-3">
                                            <TooltipProvider
                                                delayDuration={150}
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`${learnShow(mod.slug).url}?page=${currentPage}`}
                                                            className="group/btn cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Student Preview
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`${adminLearnEdit(mod.id).url}?page=${currentPage}`}
                                                            className="group/btn cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Edit details
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                promptDelete(
                                                                    mod.id,
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-red-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Delete module
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredModules.length > pageSize && (
                            <div className="flex flex-col items-center justify-between gap-3 rounded-b-xl border-t border-border bg-muted px-4 py-4 sm:flex-row sm:px-6">
                                <span className="text-xs font-bold text-muted-foreground">
                                    Showing{' '}
                                    <strong className="text-foreground">
                                        {(currentPage - 1) * pageSize + 1}
                                    </strong>{' '}
                                    to{' '}
                                    <strong className="text-foreground">
                                        {Math.min(
                                            currentPage * pageSize,
                                            filteredModules.length,
                                        )}
                                    </strong>{' '}
                                    of{' '}
                                    <strong className="text-foreground">
                                        {filteredModules.length}
                                    </strong>{' '}
                                    results
                                </span>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            handlePageChange(
                                                Math.max(1, currentPage - 1),
                                            )
                                        }
                                        className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((pageNum) => {
                                        if (
                                            totalPages > 7 &&
                                            Math.abs(pageNum - currentPage) >
                                                2 &&
                                            pageNum !== 1 &&
                                            pageNum !== totalPages
                                        ) {
                                            if (
                                                pageNum === currentPage - 3 ||
                                                pageNum === currentPage + 3
                                            ) {
                                                return (
                                                    <span
                                                        key={pageNum}
                                                        className="px-1 text-muted-foreground"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }

                                            return null;
                                        }

                                        const isActive =
                                            pageNum === currentPage;

                                        return (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() =>
                                                    handlePageChange(pageNum)
                                                }
                                                className={`size-8 cursor-pointer rounded-lg text-xs font-black transition focus:outline-none ${
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
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            handlePageChange(
                                                Math.min(
                                                    totalPages,
                                                    currentPage + 1,
                                                ),
                                            )
                                        }
                                        className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </PageContainer>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={confirmDelete}
                title="Delete Study Module?"
                message="Are you sure you want to permanently delete this learning module? This action cannot be undone."
                confirmLabel="Delete Module"
                variant="danger"
            />

            <ConfirmModal
                isOpen={bulkActionModal.isOpen}
                onClose={() =>
                    setBulkActionModal({ isOpen: false, action: null })
                }
                onConfirm={confirmBulkAction}
                title={
                    bulkActionModal.action === 'delete'
                        ? `Delete ${selectedIds.size} Module${selectedIds.size !== 1 ? 's' : ''}?`
                        : bulkActionModal.action === 'setActive'
                          ? `Set ${selectedIds.size} Module${selectedIds.size !== 1 ? 's' : ''} to Active?`
                          : `Set ${selectedIds.size} Module${selectedIds.size !== 1 ? 's' : ''} to Inactive?`
                }
                message={
                    bulkActionModal.action === 'delete'
                        ? `Are you sure you want to delete ${selectedIds.size} module${selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone and will permanently remove ${selectedIds.size > 1 ? 'them' : 'it'} from all database records.`
                        : bulkActionModal.action === 'setActive'
                          ? `Are you sure you want to set ${selectedIds.size} module${selectedIds.size !== 1 ? 's' : ''} to Active?`
                          : `Are you sure you want to set ${selectedIds.size} module${selectedIds.size !== 1 ? 's' : ''} to Inactive?`
                }
                confirmLabel={
                    bulkActionModal.action === 'delete'
                        ? 'Delete Selected'
                        : bulkActionModal.action === 'setActive'
                          ? 'Set Active'
                          : 'Set Inactive'
                }
                variant={
                    bulkActionModal.action === 'delete' ? 'danger' : 'success'
                }
            />
        </>
    );
}

AdminLearnIndex.layout = {
    breadcrumbs: [
        {
            title: 'Module Management',
            href: adminLearnIndex().url,
        },
    ],
};
