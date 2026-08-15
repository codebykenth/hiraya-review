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
    pagination = { current_page: 1, per_page: 10, total: 0, last_page: 1 },
    filters = {},
    categories = [],
}: AdminLearnIndexProps & {
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
    filters?: {
        search?: string;
        status?: string;
        category?: string;
        subcategory?: string;
        per_page?: number;
    };
}) {
    const [filterSearch, setFilterSearch] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'all');
    const [filterCategory, setFilterCategory] = useState<string>(filters.category || 'all');
    const [filterSubcategory, setFilterSubcategory] = useState<string>(filters.subcategory || 'all');
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const currentPage = pagination.current_page;
    const totalPages = pagination.last_page;
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

    const updateFilters = (params: {
        search?: string;
        status?: string;
        category?: string;
        subcategory?: string;
        page?: number;
        per_page?: number;
    }) => {
        router.get(
            adminLearnIndex().url,
            {
                search: params.search !== undefined ? params.search : filterSearch,
                status: params.status !== undefined ? params.status : filterStatus,
                category: params.category !== undefined ? params.category : filterCategory,
                subcategory: params.subcategory !== undefined ? params.subcategory : filterSubcategory,
                per_page: params.per_page !== undefined ? params.per_page : perPage,
                page: params.page !== undefined ? params.page : 1,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: () => setSelectedIds(new Set()),
            },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: filterSearch, page: 1 });
    };

    const handlePageChange = (page: number) => {
        updateFilters({ page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            modules.forEach((mod) => newSelected.add(mod.id));
        } else {
            modules.forEach((mod) => newSelected.delete(mod.id));
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
                    <form onSubmit={handleSearchSubmit} className="flex min-w-[260px] flex-1 items-center gap-2">
                        <input
                            type="text"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                            onBlur={() => updateFilters({ search: filterSearch, page: 1 })}
                            placeholder="Search modules (title, summary, topic)..."
                            className="w-full rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Category Filter */}
                        <div className="relative min-w-[120px]">
                            <select
                                value={filterCategory}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setFilterCategory(val);
                                    setFilterSubcategory('all');
                                    updateFilters({ category: val, subcategory: 'all', page: 1 });
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
                                    const val = e.target.value;
                                    setFilterSubcategory(val);
                                    let newCat = filterCategory;

                                    if (val !== 'all') {
                                        const parentCat = Object.keys(
                                            cseCategoriesTree,
                                        ).find((cat) =>
                                            cseCategoriesTree[cat].includes(
                                                val,
                                            ),
                                        );

                                        if (parentCat) {
                                            newCat = parentCat;
                                            setFilterCategory(parentCat);
                                        }
                                    }

                                    updateFilters({ subcategory: val, category: newCat, page: 1 });
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
                                    const val = e.target.value;
                                    setFilterStatus(val);
                                    updateFilters({ status: val, page: 1 });
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

                        {/* Per-Page Selector */}
                        <div className="relative w-20">
                            <select
                                value={perPage}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setPerPage(val);
                                    updateFilters({ per_page: val, page: 1 });
                                }}
                                className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-6 pl-2 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                            >
                                <option value={10}>10 / pg</option>
                                <option value={15}>15 / pg</option>
                                <option value={25}>25 / pg</option>
                                <option value={50}>50 / pg</option>
                            </select>
                            <ChevronRight className="pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2 -rotate-90 text-muted-foreground" />
                        </div>

                        <span className="shrink-0 pl-1 text-xs font-bold text-muted-foreground">
                            {pagination.total} found
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
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <FileText className="size-6" />
                        </div>
                        <h3 className="font-bold text-foreground">
                            No Modules Found
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            No modules match your search or filter parameters.
                        </p>
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="mt-4"
                            onClick={() => {
                                setFilterSearch('');
                                setFilterStatus('all');
                                setFilterCategory('all');
                                setFilterSubcategory('all');
                                updateFilters({
                                    search: '',
                                    status: 'all',
                                    category: 'all',
                                    subcategory: 'all',
                                    page: 1,
                                });
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
                                        modules.length > 0 &&
                                        modules.every((mod) =>
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
                                                        modules.length > 0 &&
                                                        modules.every((mod) =>
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
                                        {modules.map((mod) => (
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
                                {modules.map((mod) => (
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
                        {pagination.total > 0 && (
                            <div className="flex flex-col items-center justify-between gap-3 rounded-b-xl border-t border-border bg-muted px-4 py-4 sm:flex-row sm:px-6">
                                <span className="text-xs font-bold text-muted-foreground">
                                    Showing{' '}
                                    <strong className="text-foreground">
                                        {(pagination.current_page - 1) * pagination.per_page + 1}
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
                                    <button
                                        type="button"
                                        disabled={pagination.current_page === 1}
                                        onClick={() =>
                                            handlePageChange(
                                                Math.max(1, pagination.current_page - 1),
                                            )
                                        }
                                        className="cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Previous
                                    </button>

                                    {Array.from(
                                        { length: pagination.last_page },
                                        (_, i) => i + 1,
                                    ).map((pageNum) => {
                                        if (
                                            pagination.last_page > 7 &&
                                            Math.abs(pageNum - pagination.current_page) >
                                                2 &&
                                            pageNum !== 1 &&
                                            pageNum !== pagination.last_page
                                        ) {
                                            if (
                                                pageNum === pagination.current_page - 3 ||
                                                pageNum === pagination.current_page + 3
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
                                            pageNum === pagination.current_page;

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
                                        disabled={pagination.current_page === pagination.last_page}
                                        onClick={() =>
                                            handlePageChange(
                                                Math.min(
                                                    pagination.last_page,
                                                    pagination.current_page + 1,
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
