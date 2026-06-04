import { Link } from '@inertiajs/react';
import {
    Search,
    Sparkles,
    FileText,
    PenLine,
    ChevronDown,
    Trash2,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { TableColumn } from '@/components/admin-table';
import { AdminTable } from '@/components/admin-table';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageContainer } from '@/components/page-container';
import type { CategoryItem } from './drafts-review-shell';
import { Button } from './ui/button';

export function getCategoryStyles(category: string) {
    switch (category) {
        case 'Analytical Ability':
            return 'bg-indigo-50 text-indigo-650 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30';
        case 'Numerical Ability':
            return 'bg-emerald-50 text-emerald-650 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30';
        case 'Verbal Ability':
            return 'bg-blue-50 text-blue-650 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
        case 'Clerical Ability':
            return 'bg-amber-50 text-amber-650 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30';
        case 'General Information':
            return 'bg-rose-50 text-rose-650 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30';
        default:
            return 'bg-slate-50 text-slate-650 border-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800';
    }
}

export interface CurationIndexShellProps<T> {
    items: T[];
    categories: CategoryItem[];
    columns:
        | TableColumn<T>[]
        | ((confirmDelete: (item: T) => void) => TableColumn<T>[]);
    searchPlaceholder: string;
    searchMatcher: (item: T, query: string) => boolean;
    statusMatcher: (item: T, status: string) => boolean;
    // Action cards
    aiGenerator: {
        title: string;
        description: string;
        href: string;
    };
    manualEntry: {
        title: string;
        description: string;
        href: string;
    };
    // Table customization
    tableTitle: string;
    tableLegend: {
        icon: React.ComponentType<any>;
        label: string;
        variant: 'slate' | 'blue' | 'rose';
    }[];
    tableEmptyState: {
        icon: React.ComponentType<any>;
        title: string;
        description: string;
    };
    // Deletion
    onDeleteConfirm: (item: T) => void;
    getDeleteTitle: (item: T) => string;
    getDeleteMessage: (item: T) => string;
    deleteConfirmLabel: string;

    // Bulk Delete
    onBulkDeleteConfirm?: (ids: number[]) => void;
}

export function CurationIndexShell<T>({
    items = [],
    categories = [],
    columns,
    searchPlaceholder,
    searchMatcher,
    statusMatcher,
    aiGenerator,
    manualEntry,
    tableTitle,
    tableLegend,
    tableEmptyState,
    onDeleteConfirm,
    getDeleteTitle,
    getDeleteMessage,
    deleteConfirmLabel,
    onBulkDeleteConfirm,
}: CurationIndexShellProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSubcategory, setSelectedSubcategory] =
        useState('All Subcategories');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

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

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

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

    const [itemToDelete, setItemToDelete] = useState<T | null>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const handleSelectAll = (checked: boolean, allIds: number[]) => {
        if (checked) {
            setSelectedIds(allIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((i) => i !== id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0 || !onBulkDeleteConfirm) {
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Delete Selected Items?',
            message: `Are you sure you want to delete ${selectedIds.length} items? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            variant: 'danger',
            onConfirm: () => {
                onBulkDeleteConfirm(selectedIds);
                setSelectedIds([]);
            },
        });
    };

    const filteredItems = items.filter((item) => {
        const matchesSearch = searchMatcher(item, debouncedSearchTerm);

        const matchesCategory =
            selectedCategory === 'All Categories' ||
            (item as any).category === selectedCategory;

        const matchesSubcategory =
            selectedSubcategory === 'All Subcategories' ||
            (item as any).subcategory === selectedSubcategory;

        const matchesStatus =
            selectedStatus === 'All Statuses' ||
            statusMatcher(item, selectedStatus);

        return (
            matchesSearch &&
            matchesCategory &&
            matchesSubcategory &&
            matchesStatus
        );
    });

    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * pageSize,
        (currentPage - 1) * pageSize + pageSize,
    );

    const resolvedColumns =
        typeof columns === 'function'
            ? (columns as any)(setItemToDelete)
            : columns;

    return (
        <PageContainer>
            {/* 1. CREATION ACTIONS CARDS */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* AI Generator Card */}
                <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md">
                    <div className="pointer-events-none absolute right-0 bottom-0 opacity-10">
                        <Sparkles className="size-32 text-indigo-300 dark:text-indigo-900" />
                    </div>
                    <div className="z-10 flex items-start gap-4">
                        <div className="text-indigo-650 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 dark:text-indigo-400">
                            <Sparkles className="size-7" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-foreground">
                                {aiGenerator.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {aiGenerator.description}
                            </p>
                            <Link
                                href={aiGenerator.href}
                                className="mt-2 block"
                            >
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                >
                                    Launch Generator
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Manual Entry Card */}
                <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md">
                    <div className="pointer-events-none absolute right-0 bottom-0 opacity-5">
                        <FileText className="size-32 text-emerald-300 dark:text-emerald-900" />
                    </div>
                    <div className="z-10 flex items-start gap-4">
                        <div className="text-emerald-650 flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <PenLine className="size-7" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-foreground">
                                {manualEntry.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {manualEntry.description}
                            </p>
                            <Link
                                href={manualEntry.href}
                                className="mt-2 block"
                            >
                                <Button
                                    type="button"
                                    variant="success"
                                    size="sm"
                                >
                                    New Entry
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. FILTERS & SEARCH PANEL */}
            <div className="shadow-3xs mt-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex w-full flex-1 items-center gap-2 md:max-w-2xl">
                    <div className="relative w-full">
                        <Search className="text-slate-450 absolute top-1/2 left-3 size-3.5 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-lg border border-border bg-muted py-1.5 pr-3 pl-9 text-xs font-semibold text-foreground transition placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:gap-2.5">
                    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:flex md:w-auto md:items-center md:gap-2.5">
                        {/* Category Filter */}
                        <div className="relative min-w-0 md:min-w-[145px]">
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    setSelectedSubcategory('All Subcategories');
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                            >
                                <option
                                    value="All Categories"
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
                        <div className="relative min-w-0 md:min-w-[155px]">
                            <select
                                value={selectedSubcategory}
                                onChange={(e) => {
                                    setSelectedSubcategory(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                            >
                                <option
                                    value="All Subcategories"
                                    className="dark:bg-slate-950"
                                >
                                    All Subcategories
                                </option>
                                {selectedCategory !== 'All Categories' &&
                                    cseCategoriesTree[selectedCategory]?.map(
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
                                {selectedCategory === 'All Categories' &&
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
                        <div className="relative col-span-2 min-w-0 sm:col-span-1 md:min-w-[120px]">
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-2.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                            >
                                <option
                                    value="All Statuses"
                                    className="dark:bg-slate-950"
                                >
                                    All Statuses
                                </option>
                                <option
                                    value="ACTIVE"
                                    className="dark:bg-slate-950"
                                >
                                    ACTIVE
                                </option>
                                <option
                                    value="DRAFT"
                                    className="dark:bg-slate-950"
                                >
                                    DRAFT
                                </option>
                            </select>
                            <ChevronDown className="text-slate-550 pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2" />
                        </div>
                    </div>

                    <span className="mt-1 block shrink-0 pl-1 text-right text-xs font-bold text-muted-foreground md:mt-0 md:text-left">
                        {filteredItems.length === 0
                            ? 'No matches'
                            : `${filteredItems.length} found`}
                    </span>
                </div>
            </div>

            {/* 3. MAIN DATATABLE */}
            <div className="mt-6">
                <AdminTable
                    data={paginatedItems}
                    columns={resolvedColumns}
                    title={tableTitle}
                    legend={tableLegend}
                    getItemId={(item: any) => item.id}
                    selectedIds={selectedIds}
                    onSelectAll={
                        onBulkDeleteConfirm ? handleSelectAll : undefined
                    }
                    onSelectOne={
                        onBulkDeleteConfirm ? handleSelectOne : undefined
                    }
                    bulkActionRender={
                        onBulkDeleteConfirm
                            ? (selected) => (
                                  <div className="flex items-center justify-between border-b border-border bg-blue-50/50 px-6 py-2 dark:bg-blue-950/10">
                                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                          {selected.length} selected
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
                              )
                            : undefined
                    }
                    emptyState={{
                        icon: tableEmptyState.icon,
                        title: tableEmptyState.title,
                        description: tableEmptyState.description,
                        action: (
                            <Link href={aiGenerator.href}>
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    icon={Sparkles}
                                >
                                    Launch AI Generator
                                </Button>
                            </Link>
                        ),
                    }}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    totalItems={filteredItems.length}
                    onPageChange={setCurrentPage}
                />
            </div>
            <ConfirmModal
                isOpen={!!itemToDelete}
                title={itemToDelete ? getDeleteTitle(itemToDelete) : ''}
                message={itemToDelete ? getDeleteMessage(itemToDelete) : ''}
                confirmLabel={deleteConfirmLabel}
                variant="danger"
                onClose={() => setItemToDelete(null)}
                onConfirm={() => {
                    if (itemToDelete) {
                        onDeleteConfirm(itemToDelete);
                        setItemToDelete(null);
                    }
                }}
            />

            {/* Confirm modal for categories/subcategories deletion */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onClose={() =>
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                onConfirm={() => {
                    confirmModal.onConfirm();
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
            />
        </PageContainer>
    );
}
