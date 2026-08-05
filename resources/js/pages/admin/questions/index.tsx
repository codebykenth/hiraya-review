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
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getCategoryStyles } from '@/components/domain/curation-index-shell';
import type { CategoryItem, QuestionItem, QuestionOption, QuestionsIndexProps } from './types';
import { PageContainer } from '@/components/layout/page-container';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { renderFormattedText } from '@/lib/exam-formatters';
import {
    index as questionsIndex,
    create as questionsCreate,
    edit as questionsEdit,
    destroy as questionsDestroy,
    show as questionsShow,
} from '@/routes/questions';


export default function QuestionsIndex({
    questions = [],
    categories = [],
}: QuestionsIndexProps) {
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
    const [previewQuestion, setPreviewQuestion] = useState<QuestionItem | null>(null);
    const pageSize = 10;

    const getCleanStemText = (stem: string) => {
        if (!stem) return '';
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

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilterSearch(filterSearch);
        }, 300);

        return () => clearTimeout(handler);
    }, [filterSearch]);

    const filteredQuestions = questions
        .filter((q) => {
            const matchesSearch =
                q.stem
                    .toLowerCase()
                    .includes(debouncedFilterSearch.toLowerCase()) ||
                q.category
                    .toLowerCase()
                    .includes(debouncedFilterSearch.toLowerCase()) ||
                q.subcategory
                    .toLowerCase()
                    .includes(debouncedFilterSearch.toLowerCase()) ||
                String(q.id).includes(debouncedFilterSearch);

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'ACTIVE' && q.status === 'ACTIVE') ||
                (filterStatus === 'DRAFT' && q.status === 'DRAFT');

            const matchesCategory =
                filterCategory === 'all' || q.category === filterCategory;

            const matchesSubcategory =
                filterSubcategory === 'all' ||
                q.subcategory === filterSubcategory;

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
            if (a.status !== b.status) {
                return a.status === 'ACTIVE' ? -1 : 1;
            }

            // Then by updated_at timestamp (latest to oldest)
            const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            return timeB - timeA;
        });

    const totalPages = Math.ceil(filteredQuestions.length / pageSize);
    const paginatedQuestions = filteredQuestions.slice(
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
            router.delete(questionsDestroy(deleteModal.id).url, {
                preserveScroll: true,
            });
            setDeleteModal({ isOpen: false, id: null });
        }
    };

    const handleSelectAll = (checked: boolean) => {
        const newSelected = new Set(selectedIds);

        if (checked) {
            paginatedQuestions.forEach((q) => newSelected.add(q.id));
        } else {
            paginatedQuestions.forEach((q) => newSelected.delete(q.id));
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
                    <div className="flex min-w-[260px] flex-1 items-center gap-2">
                        <input
                            type="text"
                            value={filterSearch}
                            onChange={(e) => {
                                setFilterSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search questions (stem, ID, topic)..."
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
                            {filteredQuestions.length} found
                        </span>

                        {/* View Mode Toggle */}
                        <div className="ml-auto flex items-center rounded-lg border border-border bg-background p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
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
                                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
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

                {/* Question Cards Grid */}
                {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-16 text-center">
                        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <FileQuestion className="size-8" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-foreground">
                            No Questions Found
                        </h3>
                        <p className="mt-1.5 max-w-2xl text-base leading-relaxed text-muted-foreground">
                            We couldn't find any questions in the database.
                            Start by creating your first question using the AI
                            Generator or Manual Entry.
                        </p>
                        <Link
                            href={questionsCreate().url}
                            className="group mt-6 inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition transition-all duration-300 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                        >
                            <ChevronRight className="size-4 transition-transform group-hover:scale-110" />
                            Create Question
                        </Link>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <FileQuestion className="size-6" />
                        </div>
                        <h3 className="font-bold text-foreground">
                            No Matching Questions
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            No questions match your active filters.
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
                                        paginatedQuestions.length > 0 &&
                                        paginatedQuestions.every((q) =>
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
                                                        paginatedQuestions.length >
                                                            0 &&
                                                        paginatedQuestions.every(
                                                            (q) =>
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
                                                Question Stem
                                            </th>
                                            <th className="w-36 px-4 py-3 font-bold">
                                                Category
                                            </th>
                                            <th className="w-40 px-4 py-3 font-bold">
                                                Subcategory
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
                                        {paginatedQuestions.map((q) => (
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
                                                    <div className="flex items-center gap-2">
                                                        <div className="line-clamp-1 font-bold text-foreground">
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
                                                    {/* Sub-line under main question stem (Options & Answer) */}
                                                    <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                                                        {q.options && q.options.length > 0 ? (
                                                            (() => {
                                                                const choicesStr = q.options.map((opt, i) => {
                                                                    const rawText = typeof opt === 'string' ? opt : (opt.option_text || '');
                                                                    const cleanText = rawText ? String(rawText).replace(/<[^>]+>/g, '').trim() : '';
                                                                    return `${String.fromCharCode(65 + i)}) ${cleanText}`;
                                                                }).join(' • ');
                                                                return choicesStr;
                                                            })()
                                                        ) : (
                                                            <span className="text-red-400 italic">No options found for this question (Possible cache issue)</span>
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
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                                                            q.status ===
                                                            'ACTIVE'
                                                                ? 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                                : 'border-blue-100 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400'
                                                        }`}
                                                    >
                                                        {q.status === 'ACTIVE'
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
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setPreviewQuestion(
                                                                                q,
                                                                            )
                                                                        }
                                                                        className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-blue-600 dark:text-blue-400"
                                                                    >
                                                                        <FileImage className="size-4" />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Quick preview
                                                                </TooltipContent>
                                                            </Tooltip>
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
                            {paginatedQuestions.map((q) => (
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
                                            {q.status === 'ACTIVE'
                                                ? 'Active'
                                                : 'Draft'}
                                        </span>
                                    </div>

                                    {/* Question ID */}
                                    <div className="mb-3">
                                        <span className="text-xs font-bold text-muted-foreground">
                                            #{q.id}
                                        </span>
                                    </div>

                                    {/* Question Stem */}
                                    <div className="mb-4 line-clamp-3 text-sm leading-relaxed font-medium text-foreground">
                                        {renderFormattedText(q.stem)}
                                    </div>

                                    {/* Options Preview */}
                                    {q.options && q.options.length > 0 && (
                                        <div className="mb-4 space-y-1.5">
                                            <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                Options
                                            </div>
                                            <div className="space-y-1">
                                                {q.options
                                                    .slice(0, 2)
                                                    .map((opt, idx) => {
                                                        const rawText = typeof opt === 'string' ? opt : opt.option_text;
                                                        const text = rawText ? String(rawText).replace(/<[^>]+>/g, '').trim() : '';
                                                        const isCorrect =
                                                            typeof opt ===
                                                            'object'
                                                                ? opt.is_correct
                                                                : q.correct_option ===
                                                                  idx;

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] leading-tight ${
                                                                    isCorrect
                                                                        ? 'bg-emerald-50 font-semibold text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
                                                                        : 'bg-muted text-muted-foreground'
                                                                }`}
                                                            >
                                                                <span className="font-bold">
                                                                    {String.fromCharCode(
                                                                        65 +
                                                                            idx,
                                                                    )}
                                                                    .
                                                                </span>
                                                                <span className="line-clamp-1">
                                                                    {text}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                {q.options.length > 2 && (
                                                    <div className="text-[10px] text-muted-foreground">
                                                        +{q.options.length - 2}{' '}
                                                        more options
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-1.5 border-t border-border pt-3">
                                        <TooltipProvider delayDuration={150}>
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
                                                    View details
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
                                                            promptDelete(q.id)
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
                        {filteredQuestions.length > pageSize && (
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
                                            filteredQuestions.length,
                                        )}
                                    </strong>{' '}
                                    of{' '}
                                    <strong className="text-foreground">
                                        {filteredQuestions.length}
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
                <DialogContent className="max-w-3xl overflow-y-auto max-h-[85vh]">
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
                                <div className="rounded-xl border border-border bg-card p-4">
                                    <div className="text-sm font-medium leading-relaxed text-foreground">
                                        {renderFormattedText(
                                            previewQuestion.stem,
                                        )}
                                    </div>
                                </div>

                                {previewQuestion.options &&
                                    previewQuestion.options.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">
                                                Answer Options
                                            </span>
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {previewQuestion.options.map(
                                                    (
                                                        opt: QuestionOption,
                                                        idx: number,
                                                    ) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-start gap-2 rounded-lg border p-3 text-xs ${
                                                                opt.is_correct
                                                                    ? 'border-emerald-300 bg-emerald-50/50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                                                                    : 'border-border bg-background text-foreground'
                                                            }`}
                                                        >
                                                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-black">
                                                                {String.fromCharCode(
                                                                    65 + idx,
                                                                )}
                                                            </span>
                                                            <span className="font-medium">
                                                                {opt.option_text}
                                                            </span>
                                                            {opt.is_correct && (
                                                                <span className="ml-auto rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                                                                    Correct
                                                                </span>
                                                            )}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {previewQuestion.explanation && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-300">
                                        <span className="font-bold">
                                            Explanation:{' '}
                                        </span>
                                        {previewQuestion.explanation}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
