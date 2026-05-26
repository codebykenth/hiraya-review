import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/page-container';
import { Link, router } from '@inertiajs/react';
import {
    Search,
    Sparkles,
    FileText,
    Database,
    PenLine,
    ChevronDown,
    PlusCircle,
    Trash2
} from 'lucide-react';
import { CategoryItem } from './drafts-review-shell';
import { ConfirmModal } from '@/components/confirm-modal';
import { ScopeSettingsModal } from '@/components/scope-settings-modal';
import { AdminTable, TableColumn } from '@/components/admin-table';
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
            return 'bg-slate-50 text-slate-650 border-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-850';
    }
}

export interface CurationIndexShellProps<T> {
    items: T[];
    categories: CategoryItem[];
    columns: TableColumn<T>[] | ((confirmDelete: (item: T) => void) => TableColumn<T>[]);
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
    tableLegend: { icon: React.ComponentType<any>; label: string; variant: 'slate' | 'blue' | 'rose' }[];
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
    deleteConfirmLabel
}: CurationIndexShellProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [selectedSubcategory, setSelectedSubcategory] = useState('All Subcategories');
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');

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

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Reset subcategory and current page when filters change
    useEffect(() => {
        setSelectedSubcategory('All Subcategories');
        setCurrentPage(1);
    }, [selectedCategory]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSubcategory, selectedStatus]);

    // Dynamic Syllabus Scope modal state variables
    const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedScopeCategory, setSelectedScopeCategory] = useState<number | null>(
        categories && categories.length > 0 ? categories[0].id : null
    );
    const [newSubcategoryName, setNewSubcategoryName] = useState('');

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

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        router.post('/questions/categories', {
            name: newCategoryName
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewCategoryName('');
            }
        });
    };

    const handleDeleteCategory = (catId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Category?',
            message: 'Are you sure you want to delete this category? This action cannot be undone and will permanently delete all of its mapped subcategories!',
            confirmLabel: 'Delete Category',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/questions/categories/${catId}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (selectedScopeCategory === catId) {
                            setSelectedScopeCategory(categories.find(c => c.id !== catId)?.id || null);
                        }
                    }
                });
            }
        });
    };

    const handleAddSubcategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedScopeCategory || !newSubcategoryName.trim()) return;

        router.post('/questions/subcategories', {
            category_id: selectedScopeCategory,
            name: newSubcategoryName
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setNewSubcategoryName('');
            }
        });
    };

    const handleDeleteSubcategory = (subId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Subcategory?',
            message: 'Are you sure you want to delete this subcategory? This action cannot be undone.',
            confirmLabel: 'Delete Subcategory',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/questions/subcategories/${subId}`, {
                    preserveScroll: true
                });
            }
        });
    };

    const [itemToDelete, setItemToDelete] = useState<T | null>(null);

    const filteredItems = items.filter(item => {
        const matchesSearch = searchMatcher(item, searchTerm);

        const matchesCategory =
            selectedCategory === 'All Categories' ||
            (item as any).category === selectedCategory;

        const matchesSubcategory =
            selectedSubcategory === 'All Subcategories' ||
            (item as any).subcategory === selectedSubcategory;

        const matchesStatus =
            selectedStatus === 'All Statuses' ||
            statusMatcher(item, selectedStatus);

        return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
    });

    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * pageSize,
        (currentPage - 1) * pageSize + pageSize
    );

    const resolvedColumns = typeof columns === 'function' 
        ? (columns as any)(setItemToDelete) 
        : columns;

    return (
        <PageContainer>
            {/* 1. CREATION ACTIONS CARDS */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* AI Generator Card */}
                <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Sparkles className="size-32 text-indigo-300 dark:text-indigo-900" />
                    </div>
                    <div className="flex gap-4 items-start z-10">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400">
                            <Sparkles className="size-7" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-foreground">{aiGenerator.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {aiGenerator.description}
                            </p>
                            <Link href={aiGenerator.href} className="mt-2 block">
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
                    <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                        <FileText className="size-32 text-emerald-300 dark:text-emerald-900" />
                    </div>
                    <div className="flex gap-4 items-start z-10">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <PenLine className="size-7" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-foreground">{manualEntry.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {manualEntry.description}
                            </p>
                            <Link href={manualEntry.href} className="mt-2 block">
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

                {/* Syllabus Scope Card */}
                <div className="relative flex overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs transition hover:shadow-md">
                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                        <Database className="size-32 text-blue-300 dark:text-blue-900" />
                    </div>
                    <div className="flex gap-4 items-start z-10">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400">
                            <Database className="size-7" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold text-foreground">Syllabus Scope Settings</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Configure exam categories & subcategories dynamically to instantly update AI prompting and filtering schemas.
                            </p>
                            <div className="mt-2">
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                        if (categories && categories.length > 0) {
                                            setSelectedScopeCategory(categories[0].id);
                                        }
                                        setIsScopeModalOpen(true);
                                    }}
                                >
                                    Manage Scope
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. FILTERS & SEARCH PANEL */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-border bg-card p-4 shadow-3xs mt-6">
                <div className="flex flex-1 items-center gap-2 w-full md:max-w-2xl">
                    <div className="relative w-full">
                        <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-450" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-lg border border-border pl-9 pr-3 py-1.5 text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none transition bg-muted"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:w-auto md:gap-2.5">
                    <div className="grid grid-cols-2 gap-3 w-full sm:grid-cols-3 md:flex md:w-auto md:items-center md:gap-2.5">
                        {/* Category Filter */}
                        <div className="relative min-w-0 md:min-w-[145px]">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background pl-2.5 pr-8 py-1.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="All Categories" className="dark:bg-slate-950">All Categories</option>
                                {Object.keys(cseCategoriesTree).map(cat => (
                                    <option key={cat} value={cat} className="dark:bg-slate-950">{cat}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-550 pointer-events-none" />
                        </div>

                        {/* Subcategory Filter */}
                        <div className="relative min-w-0 md:min-w-[155px]">
                            <select
                                value={selectedSubcategory}
                                onChange={(e) => setSelectedSubcategory(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background pl-2.5 pr-8 py-1.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="All Subcategories" className="dark:bg-slate-950">All Subcategories</option>
                                {selectedCategory !== 'All Categories' && cseCategoriesTree[selectedCategory]?.map(sub => (
                                    <option key={sub} value={sub} className="dark:bg-slate-950">{sub}</option>
                                ))}
                                {selectedCategory === 'All Categories' && Object.values(cseCategoriesTree).flat().map((sub, idx) => (
                                    <option key={idx} value={sub} className="dark:bg-slate-950">{sub}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-550 pointer-events-none" />
                        </div>

                        {/* Status Filter */}
                        <div className="relative col-span-2 sm:col-span-1 min-w-0 md:min-w-[120px]">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full rounded-lg border border-border bg-background pl-2.5 pr-8 py-1.5 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none appearance-none"
                            >
                                <option value="All Statuses" className="dark:bg-slate-950">All Statuses</option>
                                <option value="ACTIVE" className="dark:bg-slate-950">ACTIVE</option>
                                <option value="DRAFT" className="dark:bg-slate-950">DRAFT</option>
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-550 pointer-events-none" />
                        </div>
                    </div>

                    <span className="text-xs font-bold text-muted-foreground shrink-0 pl-1 text-right md:text-left block mt-1 md:mt-0">
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
                        )
                    }}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    totalItems={filteredItems.length}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Scope settings modal managed entirely internally */}
            <ScopeSettingsModal
                isOpen={isScopeModalOpen}
                onClose={() => setIsScopeModalOpen(false)}
                categories={categories}
                selectedScopeCategory={selectedScopeCategory}
                setSelectedScopeCategory={setSelectedScopeCategory}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                newSubcategoryName={newSubcategoryName}
                setNewSubcategoryName={setNewSubcategoryName}
                handleAddCategory={handleAddCategory}
                handleDeleteCategory={handleDeleteCategory}
                handleAddSubcategory={handleAddSubcategory}
                handleDeleteSubcategory={handleDeleteSubcategory}
            />

            {/* Confirm modal for delete actions managed entirely internally */}
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
        </PageContainer>
    );
}
