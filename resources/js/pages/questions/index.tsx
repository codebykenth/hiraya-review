import { Head, Link, router } from '@inertiajs/react';
import { 
    Search, 
    Bell, 
    HelpCircle, 
    Sparkles, 
    FileText, 
    Target, 
    ChevronLeft, 
    ChevronRight, 
    MoreVertical, 
    Download, 
    Database, 
    ArrowRight,
    PenLine,
    FileQuestion,
    Plus,
    Trash2,
    X,
    ChevronDown
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { index as questionsIndex, create as questionsCreate } from '@/routes/questions';

// Custom interface for question row items
interface QuestionItem {
    id: number;
    stem: string;
    category: string;
    subcategory: string;
    status: 'ACTIVE' | 'DRAFT';
}

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    is_demographic: boolean;
    sort_order: number;
    subcategory?: SubcategoryItem[];
}

interface SubcategoryItem {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    language: string;
    sort_order: number;
}

interface QuestionsIndexProps {
    questions?: QuestionItem[];
    categories?: CategoryItem[];
}

export default function QuestionsIndex({ questions = [], categories = [] }: QuestionsIndexProps) {
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

    const filteredQuestions = questions.filter((q) => {
        const matchesSearch = 
            q.stem.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(q.id).includes(searchTerm);

        const matchesCategory = 
            selectedCategory === 'All Categories' || 
            q.category === selectedCategory;

        const matchesSubcategory = 
            selectedSubcategory === 'All Subcategories' || 
            q.subcategory === selectedSubcategory;

        const matchesStatus = 
            selectedStatus === 'All Statuses' || 
            q.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
    });

    const totalPages = Math.ceil(filteredQuestions.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + pageSize);

    // Helper to render appropriate styling for categories
    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Analytical Ability':
                return 'bg-indigo-50 text-indigo-650 border-indigo-100';
            case 'Numerical Ability':
                return 'bg-emerald-50 text-emerald-650 border-emerald-100';
            case 'Verbal Ability':
                return 'bg-blue-50 text-blue-650 border-blue-100';
            case 'Clerical Ability':
                return 'bg-amber-50 text-amber-650 border-amber-100';
            case 'General Information':
                return 'bg-rose-50 text-rose-650 border-rose-100';
            default:
                return 'bg-slate-50 text-slate-650 border-slate-100';
        }
    };

    return (
        <>
            <Head title="Question Management" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/30 p-6">
                
                {/* 1. TOP HEADER SECTION */}
                {/* <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search questions, IDs, or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pr-4 pl-10 text-sm placeholder-slate-400 shadow-xs outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-6 md:justify-end">
                        <div className="flex items-center gap-3">
                            <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition focus:outline-none">
                                <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500" />
                                <Bell className="size-5" />
                            </button>
                            <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100 transition focus:outline-none">
                                <HelpCircle className="size-5" />
                            </button>
                        </div>
                        
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
                            Question Management
                        </h1>
                    </div>
                </div> */}

                {/* 2. CREATION ACTIONS CARDS */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* AI Generator Card */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-indigo-50 bg-white p-6 shadow-xs transition hover:shadow-md">
                        {/* Sparkles background graphics */}
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <Sparkles className="size-32 text-indigo-300" />
                        </div>
                        <div className="flex gap-4 items-start z-10">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                <Sparkles className="size-7" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-slate-950">AI Question Generator</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Instantly create high-quality civil service questions from source documents or topics using our tuned LLM.
                                </p>
                                 <Link
                                    href={questionsCreate({ query: { type: 'ai' } }).url}
                                    className="mt-2 w-fit rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none"
                                >
                                    Launch Generator
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Manual Entry Card */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-emerald-50 bg-white p-6 shadow-xs transition hover:shadow-md">
                        {/* Graphical background lines */}
                        <div className="absolute right-0 bottom-0 opacity-5">
                            <FileText className="size-32 text-emerald-300" />
                        </div>
                        <div className="flex gap-4 items-start z-10">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <PenLine className="size-7" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-slate-950">Manual Question Entry</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Precision-craft questions with custom distractors, detailed explanations, and specific syllabus mapping.
                                </p>
                                <Link
                                    href={questionsCreate({ query: { type: 'manual' } }).url}
                                    className="mt-2 w-fit rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-800 focus:outline-none"
                                >
                                    New Question
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Syllabus Scope Card */}
                    <div className="relative flex overflow-hidden rounded-2xl border border-blue-50 bg-white p-6 shadow-xs transition hover:shadow-md">
                        {/* Graphical background lines */}
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <Database className="size-32 text-blue-300" />
                        </div>
                        <div className="flex gap-4 items-start z-10">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                <Database className="size-7" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-lg font-bold text-slate-950">Syllabus Scope Settings</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">
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
                                    className="mt-2 w-fit rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none"
                                >
                                    Manage Scope
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. FILTERS & PAGINATION PANEL */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-slate-150 bg-white p-4 shadow-3xs">
                    <div className="flex flex-1 items-center gap-2 w-full md:max-w-md">
                        <div className="relative w-full">
                            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search questions (stem, ID, topic)..."
                                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs font-semibold text-slate-855 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition bg-slate-50/50"
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
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none"
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
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none"
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
                                    className="w-full rounded-lg border border-slate-200 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none"
                                >
                                    <option value="All Statuses">All Statuses</option>
                                    <option value="ACTIVE">ACTIVE</option>
                                    <option value="DRAFT">DRAFT</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>

                        <span className="text-xs font-bold text-slate-550 shrink-0 pl-1 text-right md:text-left block mt-1 md:mt-0">
                            {filteredQuestions.length === 0 
                                ? 'No matches' 
                                : `${filteredQuestions.length} question${filteredQuestions.length === 1 ? '' : 's'}`}
                        </span>
                    </div>
                </div>

                {/* 4. MAIN DATATABLE */}
                <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                    <th className="px-6 py-4">Question ID</th>
                                    <th className="px-6 py-4">Question Stem</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Subcategory</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredQuestions.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-100 shadow-3xs">
                                                    <FileQuestion className="size-6 text-slate-400" />
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-800">No Questions Found</h3>
                                                <p className="mt-1 text-xs text-slate-550 max-w-2xl leading-relaxed">
                                                    We couldn't find any questions matching your active filters. Clear filters or launch the AI Generator to create fresh ones.
                                                </p>
                                                <Link
                                                    href={questionsCreate({ query: { type: 'ai' } }).url}
                                                    className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-3xs transition hover:bg-blue-700 inline-flex items-center gap-1.5"
                                                >
                                                    <Sparkles className="size-3.5" />
                                                    Launch AI Generator
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedQuestions.map((q) => (
                                        <tr key={q.id} className="hover:bg-slate-50/40 transition">
                                            {/* ID Link */}
                                            <td className="px-6 py-4 font-semibold text-blue-600 hover:underline cursor-pointer">
                                                {q.id}
                                            </td>
                                            {/* Stem content */}
                                            <td className="px-6 py-4 max-w-[280px] truncate text-slate-700">
                                                {q.stem}
                                            </td>
                                            {/* Category badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getCategoryStyles(q.category)}`}>
                                                    {q.category}
                                                </span>
                                            </td>
                                            {/* Subcategory */}
                                            <td className="px-6 py-4 text-slate-600 capitalize">
                                                {q.subcategory}
                                            </td>
                                            {/* Status badge */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                                    q.status === 'ACTIVE' 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                    {q.status}
                                                </span>
                                            </td>
                                            {/* Action options */}
                                            <td className="px-6 py-4 text-right">
                                                <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                                                    <MoreVertical className="size-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer actions & navigation */}
                    {filteredQuestions.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/20 px-6 py-4 dark:border-slate-900/60 dark:bg-slate-900/10 gap-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                Showing <strong className="text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</strong> to <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredQuestions.length)}</strong> of <strong className="text-slate-900 dark:text-white">{filteredQuestions.length}</strong> results
                            </span>
                            
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1.5">
                                    {/* Previous button */}
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-3xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850 cursor-pointer focus:outline-none"
                                    >
                                        Previous
                                    </button>

                                    {/* Page Numbers list */}
                                    {Array.from({ length: totalPages }).map((_, idx) => {
                                        const pageNum = idx + 1;
                                        const isActive = pageNum === currentPage;
                                        return (
                                            <button
                                                key={pageNum}
                                                type="button"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`size-8 rounded-lg text-xs font-black shadow-3xs transition focus:outline-none cursor-pointer ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white'
                                                        : 'border border-slate-200 bg-white text-slate-750 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}

                                    {/* Next button */}
                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-3xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850 cursor-pointer focus:outline-none"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                
            </div>

            {/* Premium Dynamic Syllabus Scope Modal */}
            {isScopeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                    <div className="relative flex flex-col w-full max-w-4xl h-[600px] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Database className="size-5 text-blue-600" />
                                    Dynamic Syllabus Scope Settings
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">Customize your exam blueprint and automatically tune the Gemini AI review questions writer.</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsScopeModalOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Body (Two Column Split Layout) */}
                        <div className="flex flex-1 overflow-hidden">
                            {/* Left Column: Categories List */}
                            <div className="w-1/2 border-r border-slate-100 flex flex-col p-6 overflow-y-auto">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">Categories</h3>
                                
                                <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                                    <input 
                                        type="text" 
                                        placeholder="Add new category..."
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition"
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 shadow-3xs"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </form>

                                <div className="space-y-2 flex-1">
                                    {categories.map(cat => (
                                        <div 
                                            key={cat.id} 
                                            onClick={() => setSelectedScopeCategory(cat.id)}
                                            className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition select-none ${
                                                selectedScopeCategory === cat.id 
                                                    ? 'border-blue-200 bg-blue-50/50 text-blue-900 shadow-3xs' 
                                                    : 'border-slate-150 bg-white text-slate-700 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="text-sm font-semibold truncate pr-2">
                                                {cat.name}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                                    {(cat.subcategory || []).length} subs
                                                </span>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCategory(cat.id);
                                                    }}
                                                    className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-650 transition"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Subcategories list for Selected Category */}
                            <div className="w-1/2 flex flex-col p-6 overflow-y-auto bg-slate-50/20">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">
                                    Subcategories of "{categories.find(c => c.id === selectedScopeCategory)?.name || 'Select a Category'}"
                                </h3>

                                {selectedScopeCategory ? (
                                    <>
                                        <form onSubmit={handleAddSubcategory} className="flex gap-2 mb-4">
                                            <input 
                                                type="text" 
                                                placeholder="Add new subcategory..."
                                                value={newSubcategoryName}
                                                onChange={(e) => setNewSubcategoryName(e.target.value)}
                                                className="flex-1 rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition"
                                                required
                                            />
                                            <button 
                                                type="submit" 
                                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 shadow-3xs"
                                            >
                                                <Plus className="size-4" />
                                            </button>
                                        </form>

                                        <div className="space-y-2 flex-1">
                                            {((categories.find(c => c.id === selectedScopeCategory)?.subcategory) || []).map(sub => (
                                                <div 
                                                    key={sub.id} 
                                                    className="flex items-center justify-between rounded-xl border border-slate-150 bg-white p-3 text-slate-700 shadow-3xs"
                                                >
                                                    <span className="text-sm font-medium truncate pr-2">
                                                        {sub.name}
                                                    </span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleDeleteSubcategory(sub.id)}
                                                        className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-650 transition shrink-0"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {((categories.find(c => c.id === selectedScopeCategory)?.subcategory) || []).length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
                                                    <Database className="size-8 opacity-40 mb-2" />
                                                    <span className="text-xs font-semibold">No Subcategories Added Yet</span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center flex-1 text-slate-400 text-center">
                                        <Database className="size-10 opacity-30 mb-2.5" />
                                        <span className="text-sm font-semibold">Select a category on the left to manage its subcategories</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Custom confirmation dialog modal matching global visual standard */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
                    <div 
                        className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950 animate-in zoom-in-95 duration-205"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                            className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition focus:outline-none"
                            aria-label="Close dialog"
                        >
                            <X className="size-4.5" />
                        </button>

                        <div className="flex flex-col gap-1 pr-6">
                            <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                {confirmModal.title}
                            </h3>
                            <p className="mt-2.5 text-xs leading-relaxed text-slate-555 dark:text-slate-450 whitespace-pre-line">
                                {confirmModal.message}
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4.5 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-355 dark:hover:bg-slate-900 transition focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                    confirmModal.onConfirm();
                                }}
                                className={`cursor-pointer rounded-lg px-4.5 py-2 text-xs font-bold text-white shadow-3xs transition focus:outline-none ${
                                    confirmModal.variant === 'danger'
                                        ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                                        : confirmModal.variant === 'success'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                }`}
                            >
                                {confirmModal.confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
