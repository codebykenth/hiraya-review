import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    Edit2,
    Trash2,
    FileQuestion,
    ChevronRight,
    Check,
    X,
    LayoutGrid,
    List,
    FileImage,
    ListChecks,
    Save,
    Edit3,
    HelpCircle,
} from 'lucide-react';
import { useState, useEffect, lazy, Suspense } from 'react';
import { getCategoryStyles } from '@/components/domain/curation-index-shell';
import { PageContainer } from '@/components/layout/page-container';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';

const QuickEditModal = lazy(() =>
    import('./components/quick-edit-modal').then((module) => ({
        default: module.QuickEditModal,
    }))
);
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { renderFormattedText, extractPropositions } from '@/lib/exam-formatters';
import {
    index as questionsIndex,
    create as questionsCreate,
    edit as questionsEdit,
    update as questionsUpdate,
    destroy as questionsDestroy,
    show as questionsShow,
} from '@/routes/questions';
import type { QuestionItem, QuestionsIndexProps } from './types';

export default function QuestionsIndex({
    questions = [],
    pagination = { current_page: 1, per_page: 10, total: 0, last_page: 1 },
    filters = {},
    categories = [],
}: QuestionsIndexProps) {
    const [filterSearch, setFilterSearch] = useState(filters.search || '');
    const [filterStatus, setFilterStatus] = useState<string>(filters.status || 'all');
    const [filterCategory, setFilterCategory] = useState<string>(filters.category || 'all');
    const [filterSubcategory, setFilterSubcategory] = useState<string>(filters.subcategory || 'all');
    const [filterLanguage, setFilterLanguage] = useState<string>(filters.language || 'all');
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
    const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(
        null,
    );
    const [editModalQuestion, setEditModalQuestion] = useState<QuestionItem | null>(null);

    const getCleanStemText = (stem: string) => {
        if (!stem) {
            return '';
        }

        let text = stem.replace(/<svg[\s\S]*?<\/svg>/gi, '').trim();
        text = text.replace(/<[^>]+>/g, '').trim();
        text = text.replace(/#+\s*/g, '').replace(/\s+/g, ' ');

        return text || 'Visual Question (Chart/Diagram)';
    };

    const hasSvgContent = (stem: string) => {
        return /<svg[\s\S]*?<\/svg>/i.test(stem || '');
    };

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
        language?: string;
        page?: number;
        per_page?: number;
    }) => {
        router.get(
            questionsIndex().url,
            {
                search: params.search !== undefined ? params.search : filterSearch,
                status: params.status !== undefined ? params.status : filterStatus,
                category: params.category !== undefined ? params.category : filterCategory,
                subcategory: params.subcategory !== undefined ? params.subcategory : filterSubcategory,
                language: params.language !== undefined ? params.language : filterLanguage,
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
            router.delete(questionsDestroy(deleteModal.id).url, {
                preserveScroll: true,
            });
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        const newSelected = new Set(selectedIds);

        if (checked) {
            questions.forEach((q) => newSelected.add(q.id));
        } else {
            questions.forEach((q) => newSelected.delete(q.id));
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
    const selectedQuestions = questions.filter((q) => selectedIds.has(q.id));
    const allSelectedAreDraft =
        selectedQuestions.length > 0 &&
        selectedQuestions.every((q) => q.status === 'DRAFT');
    const allSelectedAreActive =
        selectedQuestions.length > 0 &&
        selectedQuestions.every((q) => q.status === 'ACTIVE');
    const showSetActive = !allSelectedAreActive;
    const showSetInactive = !allSelectedAreDraft;

    const confirmBulkAction = () => {
        if (!bulkActionModal.action || selectedIds.size === 0) {
            return;
        }

        const ids = Array.from(selectedIds);

        if (bulkActionModal.action === 'delete') {
            router.post(
                '/questions/bulk-delete',
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
                '/questions/bulk-update-status',
                {
                    ids,
                    status:
                        bulkActionModal.action === 'setActive'
                            ? 'active'
                            : 'draft',
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
            <Head title="Question Management" />

            <PageContainer>
                {/* Header */}
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-foreground">
                            Question Management
                        </h1>
                        <p className="text-base leading-relaxed text-muted-foreground">
                            Overview of all CSE practice questions in the
                            database
                        </p>
                    </div>
                    <Link
                        href={questionsCreate().url}
                        className="group inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition transition-all duration-300 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                    >
                        <ChevronRight className="size-4 transition-transform group-hover:scale-110" />
                        Create New Question
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
                            placeholder="Search questions (stem, ID, topic)..."
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

                        {/* Language Filter (Only for Verbal Ability and Word Analogy) */}
                        {(filterCategory === 'Verbal Ability' ||
                            filterSubcategory === 'Word analogy') && (
                            <div className="relative w-32">
                                <select
                                    value={filterLanguage}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFilterLanguage(val);
                                        updateFilters({ language: val, page: 1 });
                                    }}
                                    className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                                >
                                    <option
                                        value="all"
                                        className="dark:bg-slate-950"
                                    >
                                        All Languages
                                    </option>
                                    <option
                                        value="English"
                                        className="dark:bg-slate-950"
                                    >
                                        English
                                    </option>
                                    <option
                                        value="Tagalog"
                                        className="dark:bg-slate-950"
                                    >
                                        Tagalog
                                    </option>
                                </select>
                                <ChevronRight className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 -rotate-90 text-muted-foreground" />
                            </div>
                        )}

                        <div className="ml-auto flex items-center gap-2">
                            {/* View Mode Toggle */}
                            <div className="flex items-center rounded-lg border border-border bg-background p-1">
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
                                    <span className="hidden sm:inline">
                                        Table
                                    </span>
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
                                    <span className="hidden sm:inline">
                                        Cards
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Action Toolbar */}
                {selectedIds.size > 0 && (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-xs dark:border-blue-900/30 dark:bg-blue-950/30">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-blue-900 dark:text-blue-300">
                                {selectedIds.size} question
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
                            <Link
                                href={`/admin/questions/bulk-edit?ids=${Array.from(selectedIds).join(',')}`}
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    icon={Edit2}
                                    className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/40"
                                >
                                    Bulk Edit
                                </Button>
                            </Link>
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

                {/* 2.5 ACTIONS LEGEND */}
                {questions.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-border bg-card p-3 text-[10px] font-extrabold tracking-wider uppercase">
                        <span className="text-muted-foreground">Legend:</span>
                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/50 dark:bg-slate-950/30">
                            <span className="flex size-5.5 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                <Eye className="size-3" />
                            </span>
                            <span className="text-slate-700 dark:text-slate-300">
                                Full Details
                            </span>
                        </div>
                        <div className="dark:bg-blue-950/30/50 flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 dark:border-blue-900/20 dark:bg-blue-950/10">
                            <span className="border-blue-250 flex size-5.5 items-center justify-center rounded-md border bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                                <Edit2 className="size-3" />
                            </span>
                            <span className="text-blue-800 dark:text-blue-300">
                                Edit Question
                            </span>
                        </div>
                        <div className="dark:bg-rose-950/30/50 flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-2 py-1 dark:border-rose-900/20 dark:bg-rose-950/10">
                            <span className="border-rose-250 flex size-5.5 items-center justify-center rounded-md border bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                                <Trash2 className="size-3" />
                            </span>
                            <span className="text-rose-800 dark:text-rose-300">
                                Delete Question
                            </span>
                        </div>
                    </div>
                )}

                {/* Question Cards Grid */}
                {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <FileQuestion className="size-6" />
                        </div>
                        <h3 className="font-bold text-foreground">
                            No Questions Found
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            No questions match your search or filter parameters.
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
                                        questions.length > 0 &&
                                        questions.every((q) =>
                                            selectedIds.has(q.id),
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
                                                        questions.length > 0 &&
                                                        questions.every((q) =>
                                                            selectedIds.has(
                                                                q.id,
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
                                                Question Stem & Answer Choices
                                            </th>
                                            <th className="w-36 px-4 py-3 font-bold">
                                                Category
                                            </th>
                                            <th className="w-40 px-4 py-3 font-bold">
                                                Subcategory
                                            </th>
                                            <th className="w-20 px-4 py-3 font-bold">
                                                Language
                                            </th>
                                            <th className="w-24 px-4 py-3 font-bold">
                                                Status
                                            </th>
                                            <th className="w-32 px-4 py-3 text-right font-bold">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {questions.map((q) => (
                                            <tr
                                                key={q.id}
                                                className={`transition hover:bg-muted/40 ${
                                                    selectedIds.has(q.id)
                                                        ? 'bg-blue-50/50 dark:bg-blue-950/20'
                                                        : ''
                                                }`}
                                            >
                                                <td className="w-12 px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(
                                                            q.id,
                                                        )}
                                                        onChange={(e) =>
                                                            handleSelectOne(
                                                                q.id,
                                                                e.target
                                                                    .checked,
                                                            )
                                                        }
                                                        className="size-4 cursor-pointer accent-blue-600"
                                                    />
                                                </td>
                                                <td className="w-16 px-4 py-3 font-bold text-muted-foreground">
                                                    #{q.id}
                                                </td>
                                                <td className="min-w-[400px] px-4 py-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <div className="line-clamp-2 font-bold text-foreground">
                                                            {getCleanStemText(
                                                                q.stem,
                                                            )}
                                                        </div>
                                                        {hasSvgContent(
                                                            q.stem,
                                                        ) && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setPreviewQuestion(
                                                                        q,
                                                                    )
                                                                }
                                                                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                                                title="Quick preview diagram"
                                                            >
                                                                <FileImage className="size-3" />
                                                                <span>
                                                                    Diagram
                                                                </span>
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
                                                        {q.options &&
                                                        q.options.length > 0 ? (
                                                            (() => {
                                                                const choicesStr =
                                                                    q.options
                                                                        .map(
                                                                            (
                                                                                opt,
                                                                                i,
                                                                            ) => {
                                                                                const cleanText =
                                                                                    opt.option_text
                                                                                        ? opt.option_text
                                                                                              .replace(
                                                                                                  /<[^>]+>/g,
                                                                                                  '',
                                                                                              )
                                                                                              .trim()
                                                                                        : '';

                                                                                return `${String.fromCharCode(65 + i)}) ${cleanText}`;
                                                                            },
                                                                        )
                                                                        .join(
                                                                            ' • ',
                                                                        );

                                                                return choicesStr.length >
                                                                    90
                                                                    ? choicesStr.slice(
                                                                          0,
                                                                          90,
                                                                      ) + '...'
                                                                    : choicesStr;
                                                            })()
                                                        ) : (
                                                            <span className="italic text-muted-foreground">
                                                                No choices
                                                                defined
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="w-36 px-4 py-3">
                                                    <span
                                                        className={`inline-flex max-w-[130px] truncate rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(q.category)}`}
                                                    >
                                                        {q.category}
                                                    </span>
                                                </td>
                                                <td className="w-40 px-4 py-3">
                                                    <span className="inline-block max-w-[140px] truncate rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-300">
                                                        {q.subcategory}
                                                    </span>
                                                </td>
                                                <td className="w-20 px-4 py-3">
                                                    <span className="inline-block rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
                                                        {(q as any).language ||
                                                            'English'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                                            q.status ===
                                                            'ACTIVE'
                                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                                : 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400'
                                                        }`}
                                                    >
                                                        {q.status}
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
                                                                        href={`${questionsShow(q.id).url}?page=${currentPage}`}
                                                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-blue-600 dark:text-blue-400"
                                                                    >
                                                                        <Eye className="size-4" />
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Full details
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setEditModalQuestion(
                                                                                q,
                                                                            )
                                                                        }
                                                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-amber-600 dark:hover:text-amber-400"
                                                                    >
                                                                        <Edit3 className="size-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Quick Edit
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={`${questionsEdit(q.id).url}?page=${currentPage}`}
                                                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-blue-600 dark:text-blue-400"
                                                                    >
                                                                        <Edit2 className="size-4" />
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Edit
                                                                    question
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
                                                                                q.id,
                                                                            )
                                                                        }
                                                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-red-600"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Delete
                                                                    question
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
                                {questions.map((q) => (
                                    <div
                                        key={q.id}
                                        className={`group relative rounded-2xl border border-border bg-card p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                                            selectedIds.has(q.id)
                                                ? 'ring-2 ring-blue-500 ring-offset-2'
                                                : ''
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(q.id)}
                                                onChange={(e) =>
                                                    handleSelectOne(
                                                        q.id,
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
                                                    className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(q.category)}`}
                                                >
                                                    {q.category}
                                                </span>
                                                <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:bg-blue-950/40 dark:text-blue-300">
                                                    {q.subcategory}
                                                </span>
                                            </div>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                                    q.status === 'ACTIVE'
                                                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                        : 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400'
                                                }`}
                                            >
                                                {q.status}
                                            </span>
                                        </div>

                                        {/* Question ID & Language */}
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="text-xs font-bold text-muted-foreground">
                                                #{q.id}
                                            </span>
                                            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-foreground">
                                                {(q as any).language ||
                                                    'English'}
                                            </span>
                                        </div>

                                        {/* Question Stem */}
                                        <div className="mb-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <div className="line-clamp-3 text-sm leading-relaxed font-bold text-foreground">
                                                    {getCleanStemText(q.stem)}
                                                </div>
                                                {hasSvgContent(q.stem) && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewQuestion(
                                                                q,
                                                            )
                                                        }
                                                        className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
                                                        title="Quick preview diagram"
                                                    >
                                                        <FileImage className="size-3" />
                                                        <span>Diagram</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Choices count */}
                                        <div className="mb-4 text-xs font-semibold text-muted-foreground">
                                            {q.options?.length || 0} answer
                                            choices
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-1.5 border-t border-border pt-3">
                                            <TooltipProvider
                                                delayDuration={150}
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`${questionsShow(q.id).url}?page=${currentPage}`}
                                                            className="group/btn cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Full details
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setEditModalQuestion(
                                                                    q,
                                                                )
                                                            }
                                                            className="group/btn cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-amber-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:hover:text-amber-400"
                                                        >
                                                            <Edit3 className="size-4" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Quick Edit
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Link
                                                            href={`${questionsEdit(q.id).url}?page=${currentPage}`}
                                                            className="group/btn cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </Link>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Edit question
                                                    </TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                promptDelete(
                                                                    q.id,
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-all duration-300 hover:bg-muted hover:text-red-600 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Delete question
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
                title="Delete Question?"
                message="Are you sure you want to delete this question? This action cannot be undone and will permanently remove it from all database records."
                confirmLabel="Delete Question"
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
                        ? `Delete ${selectedIds.size} Question${selectedIds.size !== 1 ? 's' : ''}?`
                        : bulkActionModal.action === 'setActive'
                          ? `Set ${selectedIds.size} Question${selectedIds.size !== 1 ? 's' : ''} to Active?`
                          : `Set ${selectedIds.size} Question${selectedIds.size !== 1 ? 's' : ''} to Inactive?`
                }
                message={
                    bulkActionModal.action === 'delete'
                        ? `Are you sure you want to delete ${selectedIds.size} question${selectedIds.size !== 1 ? 's' : ''}? This action cannot be undone and will permanently remove ${selectedIds.size > 1 ? 'them' : 'it'} from all database records.`
                        : bulkActionModal.action === 'setActive'
                          ? `Are you sure you want to set ${selectedIds.size} question${selectedIds.size !== 1 ? 's' : ''} to Active?`
                          : `Are you sure you want to set ${selectedIds.size} question${selectedIds.size !== 1 ? 's' : ''} to Inactive?`
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

            {/* Quick Preview Modal */}
            <Dialog
                open={!!previewQuestion}
                onOpenChange={(open) => !open && setPreviewQuestion(null)}
            >
                <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
                    {previewQuestion && (
                        <>
                            <DialogHeader>
                                <div className="flex flex-wrap items-center gap-2">
                                    <DialogTitle className="text-base font-bold text-foreground">
                                        Question #{previewQuestion.id} Preview
                                    </DialogTitle>
                                    <span
                                        className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(previewQuestion.category)}`}
                                    >
                                        {previewQuestion.category}
                                    </span>
                                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-300">
                                        {previewQuestion.subcategory}
                                    </span>
                                </div>
                            </DialogHeader>

                            <div className="flex flex-col gap-4 py-2">
                                <div className="mb-4">
                                    <div className="text-sm leading-relaxed font-semibold text-foreground">
                                        {renderFormattedText(
                                            previewQuestion.stem,
                                            true,
                                        )}
                                    </div>
                                </div>

                                {previewQuestion.options &&
                                    previewQuestion.options.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">
                                                Answer Options
                                            </span>
                                            <div className="flex flex-col gap-3.5">
                                                {previewQuestion.options.map(
                                                    (opt: any, idx: number) => {
                                                        const text =
                                                            typeof opt ===
                                                            'string'
                                                                ? opt
                                                                : opt.option_text;
                                                        const isCorrect =
                                                            typeof opt ===
                                                            'object'
                                                                ? opt.is_correct
                                                                : previewQuestion.correct_option ===
                                                                  idx;
                                                        const label = String.fromCharCode(65 + idx);

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`shadow-3xs relative flex items-center justify-between gap-4 rounded-xl border p-4 transition-all ${
                                                                    isCorrect
                                                                        ? 'border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/30'
                                                                        : 'border-border bg-card'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <span
                                                                        className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${
                                                                            isCorrect
                                                                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                                                                : 'border-border bg-background text-muted-foreground'
                                                                        }`}
                                                                    >
                                                                        {label}
                                                                    </span>
                                                                    <p
                                                                        className={`text-sm font-bold transition md:text-base ${
                                                                            isCorrect
                                                                                ? 'text-emerald-900 dark:text-emerald-200'
                                                                                : 'text-foreground'
                                                                        }`}
                                                                    >
                                                                        {renderFormattedText(
                                                                            text,
                                                                            false,
                                                                            undefined,
                                                                            true
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                {isCorrect && (
                                                                    <span className="ml-auto rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                                                                        Correct
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {previewQuestion.explanation && (
                                    <div className="shadow-3xs mt-2 overflow-hidden rounded-2xl border border-border bg-card text-sm leading-relaxed text-muted-foreground transition-all">
                                        <div className="flex w-full items-center gap-2 p-4 font-bold text-foreground sm:p-5">
                                            <HelpCircle className="size-4 text-blue-600 dark:text-blue-400" />
                                            <span>Explanation &amp; Rationale</span>
                                        </div>
                                        <div className="border-t border-border/60 bg-muted/30 p-5">
                                            {(() => {
                                                const propositions = extractPropositions(previewQuestion.stem);
                                                const letterMap: Record<string, string> = {};
                                                propositions.forEach((prop, idx) => {
                                                    letterMap[prop.letter] = String.fromCharCode(65 + idx);
                                                });

                                                return (
                                                    <>
                                                        {propositions.length > 0 && (
                                                            <div className="shadow-3xs mb-4 rounded-xl border border-border bg-background p-4">
                                                                <span className="mb-2 block font-heading text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                                                    Proposition Key:
                                                                </span>
                                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                                    {propositions.map((prop, idx) => (
                                                                        <div key={idx} className="flex items-center gap-2 text-xs">
                                                                            <span className="inline-flex size-5 items-center justify-center rounded border border-blue-100/60 bg-blue-50 font-mono text-[10px] font-black text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-400">
                                                                                {String.fromCharCode(65 + idx)}
                                                                            </span>
                                                                            <span className="font-medium text-foreground">
                                                                                {prop.phrase}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {renderFormattedText(previewQuestion.explanation, false, letterMap)}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreviewQuestion(null)}
                                >
                                    Close
                                </Button>
                                <Link
                                    href={`${questionsEdit(previewQuestion.id).url}?page=${currentPage}`}
                                >
                                    <Button size="sm">
                                        <Edit2 className="mr-1.5 size-3.5" />
                                        Edit Question
                                    </Button>
                                </Link>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Suspense fallback={null}>
                {editModalQuestion && (
                    <QuickEditModal
                        isOpen={!!editModalQuestion}
                        question={editModalQuestion}
                        categories={categories}
                        onClose={() => setEditModalQuestion(null)}
                        onSaveSuccess={() => {
                            setEditModalQuestion(null);
                        }}
                    />
                )}
            </Suspense>
        </>
    );
}

QuestionsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex(),
        },
    ],
};
