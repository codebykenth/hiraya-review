import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, 
    BookOpen, 
    Plus, 
    Trash2, 
    Edit2, 
    Eye, 
    Sparkles, 
    CheckCircle2, 
    AlertTriangle, 
    FileText, 
    Database, 
    ChevronLeft, 
    ChevronRight, 
    X, 
    ChevronDown,
    RotateCcw,
    PenLine,
    PlusCircle
} from 'lucide-react';
import { 
    index as adminLearnIndex,
    create as adminLearnCreate,
    edit as adminLearnEdit,
    destroy as adminLearnDestroy
} from '@/routes/admin/learn';
import { show as learnShow } from '@/routes/learn';
import { ConfirmModal } from '@/components/confirm-modal';
import { ScopeSettingsModal } from '@/components/scope-settings-modal';
import { AdminTable, TableColumn } from '@/components/admin-table';

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

interface SubcategoryItem {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    language: string;
    sort_order: number;
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    is_demographic: boolean;
    sort_order: number;
    subcategory?: SubcategoryItem[];
}

interface AdminLearnIndexProps {
    modules: LearnModule[];
    categories?: CategoryItem[];
}

export default function AdminLearnIndex({ modules = [], categories = [] }: AdminLearnIndexProps) {
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

    const handleDelete = (id: number, title: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Study Module?',
            message: `Are you sure you want to permanently delete the learning module "${title}"? This action cannot be undone.`,
            confirmLabel: 'Delete Module',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/admin/learn/${id}`);
            }
        });
    };

    const filteredModules = modules.filter((mod) => {
        const matchesSearch = 
            mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mod.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mod.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mod.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(mod.id).includes(searchTerm);

        const matchesCategory = 
            selectedCategory === 'All Categories' || 
            mod.category === selectedCategory;

        const matchesSubcategory = 
            selectedSubcategory === 'All Subcategories' || 
            mod.subcategory === selectedSubcategory;

        const matchesStatus = 
            selectedStatus === 'All Statuses' || 
            (selectedStatus === 'ACTIVE' && mod.is_published) || 
            (selectedStatus === 'DRAFT' && !mod.is_published);

        return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
    });

    const totalPages = Math.ceil(filteredModules.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedModules = filteredModules.slice(startIndex, startIndex + pageSize);

    // Helper to render appropriate styling for categories
    const getCategoryStyles = (category: string) => {
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
    };

    const columns: TableColumn<LearnModule>[] = [
        {
            header: 'Module ID',
            render: (mod) => <span className="font-bold text-slate-550">#{mod.id}</span>
        },
        {
            header: 'Lesson Details',
            render: (mod) => (
                <>
                    <span className="block text-xs font-black text-slate-855 dark:text-white leading-snug line-clamp-1">{mod.title}</span>
                    <span className="mt-1 block text-[10px] font-bold text-slate-400 line-clamp-1 leading-relaxed">
                        {mod.summary || 'CSE Syllabus Study Module'}
                    </span>
                </>
            )
        },
        {
            header: 'Category',
            render: (mod) => (
                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${getCategoryStyles(mod.category)}`}>
                    {mod.category}
                </span>
            )
        },
        {
            header: 'Subcategory',
            render: (mod) => (
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 capitalize">
                    {mod.subcategory}
                </span>
            )
        },
        {
            header: 'Status',
            render: (mod) => mod.is_published ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 border border-emerald-100 uppercase">
                    Active
                </span>
            ) : (
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 border border-blue-100 uppercase">
                    Draft
                </span>
            )
        },
        {
            header: 'Actions',
            className: 'w-28 text-right',
            render: (mod) => (
                <div className="flex items-center justify-end gap-1.5">
                    <Link
                        href={learnShow(mod.slug).url}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-white transition"
                        title="Student Preview"
                    >
                        <Eye className="size-4" />
                    </Link>
                    <Link
                        href={adminLearnEdit(mod.id).url}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-blue-600 dark:hover:bg-slate-900 transition"
                        title="Edit details"
                    >
                        <Edit2 className="size-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(mod.id, mod.title)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-red-655 dark:hover:bg-slate-900 transition cursor-pointer"
                        title="Delete module"
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <Head title="Learn Curation" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/30 p-6">

                {/* 2. CREATION ACTIONS CARDS */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* AI Lesson Generator Card */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-indigo-50 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        {/* Sparkles background graphics */}
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Sparkles className="size-32 text-indigo-300 dark:text-indigo-900" />
                        </div>
                        <div className="flex gap-4 items-start z-10">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400">
                                <Sparkles className="size-7" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-slate-950 dark:text-white">AI Lesson Generator</h3>
                                <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                                    Instantly create rich, syllabus-aligned study modules and interactive quick-checks using Gemini AI.
                                </p>
                                <Link
                                    href={adminLearnCreate({ query: { type: 'ai' } }).url}
                                    className="mt-2 w-fit rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none cursor-pointer"
                                >
                                    Launch Generator
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Manual Lesson Entry Card */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-emerald-50 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        {/* Graphical background lines */}
                        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                            <FileText className="size-32 text-emerald-300 dark:text-emerald-900" />
                        </div>
                        <div className="flex gap-4 items-start z-10">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-650 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <PenLine className="size-7" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Manual Lesson Entry</h3>
                                <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                                    Precision-craft detailed tutorials, study guides, and review materials manually with standard Markdown support.
                                </p>
                                <Link
                                    href={adminLearnCreate({ query: { type: 'manual' } }).url}
                                    className="mt-2 w-fit rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-800 focus:outline-none cursor-pointer"
                                >
                                    New Module
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Syllabus Scope Card */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-blue-50 bg-white p-6 shadow-xs transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                        {/* Graphical background lines */}
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Database className="size-32 text-blue-300 dark:text-blue-900" />
                        </div>
                        <div className="flex gap-4 items-start z-10">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400">
                                <Database className="size-7" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Syllabus Scope Settings</h3>
                                <p className="text-sm text-slate-500 leading-relaxed dark:text-slate-400">
                                    Configure exam categories & subcategories dynamically to instantly update AI prompting and filtering schemas.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (categories && categories.length > 0) {
                                            setSelectedScopeCategory(categories[0].id);
                                        }
                                        setIsScopeModalOpen(true);
                                    }}
                                    className="mt-2 w-fit rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none cursor-pointer"
                                >
                                    Manage Scope
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. FILTERS PANEL */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-slate-150 bg-white p-4 shadow-3xs dark:border-slate-850 dark:bg-slate-950">
                    <div className="flex flex-1 items-center gap-2 w-full md:max-w-2xl">
                        <div className="relative w-full">
                            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search modules (title, summary, topic)..."
                                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-855 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <option value="All Categories">All Categories</option>
                                    {Object.keys(cseCategoriesTree).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Subcategory Filter */}
                            <div className="relative min-w-0 md:min-w-[155px]">
                                <select
                                    value={selectedSubcategory}
                                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <option value="All Subcategories">All Subcategories</option>
                                    {selectedCategory !== 'All Categories' && cseCategoriesTree[selectedCategory]?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                    {selectedCategory === 'All Categories' && Object.values(cseCategoriesTree).flat().map((sub, idx) => (
                                        <option key={idx} value={sub}>{sub}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Status Filter */}
                            <div className="relative col-span-2 sm:col-span-1 min-w-0 md:min-w-[120px]">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <option value="All Statuses">All Statuses</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="DRAFT">DRAFT</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        <span className="text-xs font-bold text-slate-550 shrink-0 pl-1 text-right md:text-left block mt-1 md:mt-0 dark:text-slate-400">
                            {filteredModules.length === 0 
                                ? 'No matches' 
                                : `${filteredModules.length} module${filteredModules.length === 1 ? '' : 's'}`}
                        </span>
                    </div>
                </div>

                {/* 4. MAIN DATATABLE */}
                <AdminTable
                    data={paginatedModules}
                    columns={columns}
                    title="CSE Learning Modules"
                    legend={[
                        { icon: Eye, label: 'Student Preview', variant: 'slate' },
                        { icon: Edit2, label: 'Edit Module', variant: 'blue' },
                        { icon: Trash2, label: 'Delete Module', variant: 'rose' }
                    ]}
                    emptyState={{
                        icon: FileText,
                        title: 'No Modules Found',
                        description: "We couldn't find any learning modules matching your active filters. Clear filters or launch the AI Generator to create fresh ones.",
                        action: (
                            <Link
                                href={adminLearnCreate({ query: { type: 'ai' } }).url}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-3xs transition hover:bg-blue-700 inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="size-3.5" />
                                Launch AI Generator
                            </Link>
                        )
                    }}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    totalItems={filteredModules.length}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Premium Dynamic Syllabus Scope Modal */}
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

            {/* Custom confirmation dialog modal matching global visual standard */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
            />
        </>
    );
}

// Register layout configuration with standard layout and breadcrumbs
AdminLearnIndex.layout = {
    breadcrumbs: [
        {
            title: 'Learn Management',
            href: adminLearnIndex().url,
        },
    ],
};
