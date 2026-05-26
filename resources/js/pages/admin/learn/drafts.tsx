import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    index as adminLearnIndex,
    drafts as adminLearnDrafts,
    store as adminLearnStore,
    destroy as adminLearnDestroy
} from '@/routes/admin/learn';
import {
    Check,
    X,
    Edit3,
    FileText,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Save,
    RotateCcw,
    ListChecks,
    ArrowLeft,
    Inbox,
    ChevronLeft,
    Sparkles,
    Eye,
    BookOpen,
    HelpCircle
} from 'lucide-react';
import { LessonMarkdown } from '@/components/lesson-markdown';

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

interface DraftModule {
    id: number;
    title: string;
    slug: string;
    topic: string;
    summary: string;
    content: string;
    estimated_minutes: number;
    category: string;
    subcategory: string;
    approved: boolean;
    isEditing?: boolean;
}

interface DraftsProps {
    initialDrafts?: DraftModule[];
    categories?: CategoryItem[];
}

export default function DraftsLearnList({ initialDrafts = [], categories = [] }: DraftsProps) {
    const [draftModules, setDraftModules] = useState<DraftModule[]>(initialDrafts);
    const [previewMode, setPreviewMode] = useState<Record<number, 'preview' | 'raw'>>({});


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

    // Sync local state when Inertia refreshes initialDrafts from backend
    useEffect(() => {
        setDraftModules(initialDrafts);
    }, [initialDrafts]);

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
    const filteredDrafts = draftModules.filter(m => {
        const matchesSearch =
            m.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
            m.topic.toLowerCase().includes(filterSearch.toLowerCase()) ||
            m.category.toLowerCase().includes(filterSearch.toLowerCase()) ||
            m.subcategory.toLowerCase().includes(filterSearch.toLowerCase());

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'approved' && m.approved) ||
            (filterStatus === 'pending' && !m.approved);

        const matchesCategory =
            filterCategory === 'all' ||
            m.category === filterCategory;

        const matchesSubcategory =
            filterSubcategory === 'all' ||
            m.subcategory === filterSubcategory;

        return matchesSearch && matchesStatus && matchesCategory && matchesSubcategory;
    });

    const totalPages = Math.ceil(filteredDrafts.length / pageSize);
    const paginatedDrafts = filteredDrafts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Actions
    const toggleApproveDraft = (id: number) => {
        setDraftModules(prev => prev.map(m => m.id === id ? { ...m, approved: !m.approved } : m));
    };

    const handleToggleAllDrafts = () => {
        const allApproved = draftModules.every(m => m.approved);
        setDraftModules(prev => prev.map(m => ({ ...m, approved: !allApproved })));
    };

    const deleteDraft = async (id: number) => {
        setDraftModules(prev => prev.filter(m => m.id !== id));

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            await fetch(adminLearnDestroy(id).url, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });
        } catch (err) {
            console.error('Failed to permanently delete draft:', err);
        }
    };

    const toggleEditDraft = (id: number) => {
        setDraftModules(prev => prev.map(m => m.id === id ? { ...m, isEditing: !m.isEditing } : m));
    };

    const handleUpdateDraftField = (id: number, field: keyof DraftModule, val: any) => {
        setDraftModules(prev => prev.map(m => m.id === id ? { ...m, [field]: val } : m));
    };

    const handleCommitApproved = () => {
        const approvedModules = draftModules.filter(m => m.approved);
        if (approvedModules.length === 0) return;

        const modulesToSave = approvedModules.map(({ isEditing, approved, ...rest }) => rest);

        router.post(adminLearnStore().url, {
            modules: modulesToSave,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Learn Drafts Review" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/30 p-6">

                {/* 1. TOP HEADER */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link
                            href={adminLearnIndex().url}
                            className="flex w-fit items-center gap-1 text-xs font-black text-slate-855 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition cursor-pointer focus:outline-none"
                        >
                            <ChevronLeft className="size-4" />
                            Back to Learn Management
                        </Link>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            Syllabus Drafts Reviewer
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Verify, polish, and publish draft learning modules generated by AI or written manually.
                        </p>
                    </div>

                    {/* BULK ACTIONS HEADER DECK */}
                    {draftModules.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleToggleAllDrafts}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-250 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-3xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 cursor-pointer"
                            >
                                <ListChecks className="size-4 text-blue-650" />
                                {draftModules.every(m => m.approved) ? 'Unapprove All' : 'Approve All'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCommitApproved}
                                disabled={draftModules.filter(m => m.approved).length === 0}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4.5 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50 cursor-pointer"
                            >
                                <CheckCircle2 className="size-4" />
                                Publish Approved ({draftModules.filter(m => m.approved).length})
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. DRAFT SEARCH & FILTER CONTROLS */}
                {draftModules.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-3xs dark:border-slate-850 dark:bg-slate-950">
                        <div className="flex flex-1 min-w-[260px] items-center gap-2">
                            <input
                                type="text"
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                placeholder="Search draft titles, syllabus focus topics, subcategories..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Category Filter */}
                            <div className="relative min-w-[130px]">
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-250 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <option value="all">All Categories</option>
                                    {Object.keys(cseCategoriesTree).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Subcategory Filter */}
                            <div className="relative min-w-[145px]">
                                <select
                                    value={filterSubcategory}
                                    onChange={(e) => setFilterSubcategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-250 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <option value="all">All Subcategories</option>
                                    {filterCategory !== 'all' && cseCategoriesTree[filterCategory]?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                    {filterCategory === 'all' && Object.values(cseCategoriesTree).flat().map((sub, idx) => (
                                        <option key={idx} value={sub}>{sub}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Status Filter */}
                            <div className="relative w-28">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="w-full rounded-lg border border-slate-250 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="approved">Approved Only</option>
                                    <option value="pending">Pending Only</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            <span className="text-xs text-slate-450 font-bold shrink-0 pl-1 dark:text-slate-400">
                                {filteredDrafts.length} found
                            </span>
                        </div>
                    </div>
                )}

                {/* 2.5 DRAFT ACTIONS LEGEND */}
                {draftModules.length > 0 && (
                    <div className="flex flex-wrap items-center justify-end gap-3 text-[10px] font-extrabold uppercase tracking-wider bg-slate-50/50 border border-slate-200/60 p-3 rounded-xl dark:bg-slate-950/20 dark:border-slate-850">
                        <span className="text-slate-400/80">Legend:</span>
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
                <div className="flex flex-col gap-6">
                    {draftModules.length === 0 ? (
                        /* COMPLETELY EMPTY SYSTEM-WIDE DRAFTS STATE */
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center dark:border-slate-850 dark:bg-slate-950">
                            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
                                <Inbox className="size-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Syllabus Drafts Pending</h3>
                            <p className="mt-1.5 text-sm text-slate-500 max-w-2xl dark:text-slate-400">
                                There are currently no draft modules waiting in the curation pipeline. Launch the AI Lesson Generator or create one manually to populate this review center.
                            </p>
                            <Link
                                href="/admin/learn/create"
                                className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Sparkles className="size-4" />
                                Generate Syllabus Modules
                            </Link>
                        </div>
                    ) : filteredDrafts.length === 0 ? (
                        /* FILTER EMPTY STATE */
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-850 dark:bg-slate-950">
                            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-450 dark:bg-slate-900">
                                <FileText className="size-6" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">No Matching Drafts</h3>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                No syllabus drafts match your active filters.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setFilterSearch(''); setFilterStatus('all'); setFilterCategory('all'); setFilterSubcategory('all'); }}
                                className="mt-4 rounded-lg bg-blue-650 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        /* LIST OF DRAFTS WITH PAGINATION */
                        <div className="flex flex-col gap-6">
                            {paginatedDrafts.map((m) => (
                                <div
                                    key={m.id}
                                    className={`rounded-2xl border transition duration-200 bg-white p-6 shadow-xs dark:bg-slate-950 ${m.approved
                                        ? 'border-emerald-250 ring-1 ring-emerald-500/10 shadow-emerald-50/10 dark:border-emerald-900/40'
                                        : 'border-slate-200 hover:border-slate-350 dark:border-slate-800'
                                        }`}
                                >
                                    {/* Card Header metadata */}
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-900">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                                                {m.category}
                                            </span>
                                            <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
                                                {m.subcategory}
                                            </span>
                                            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-750 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                                                ⏱️ {m.estimated_minutes} mins
                                            </span>
                                            {m.approved ? (
                                                <span className="rounded-full bg-emerald-550/10 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-amber-50 border border-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-450">
                                                    Pending Review
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Actions toolbar */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => toggleApproveDraft(m.id)}
                                                className={`p-1.5 rounded-lg border transition cursor-pointer ${m.approved
                                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
                                                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white'
                                                    }`}
                                                title={m.approved ? "Approved (Click to Unapprove)" : "Mark Approved"}
                                            >
                                                <Check className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleEditDraft(m.id)}
                                                className={`p-1.5 rounded-lg border transition cursor-pointer ${m.isEditing
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400'
                                                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white'
                                                    }`}
                                                title="Edit Lesson Content Inline"
                                            >
                                                <Edit3 className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteDraft(m.id)}
                                                className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-450 hover:text-red-650 hover:border-red-200 transition cursor-pointer dark:border-slate-800 dark:bg-slate-900 dark:hover:text-red-500"
                                                title="Delete Draft Module"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Title and Summary Block */}
                                    <div className="mb-4 space-y-4">
                                        {m.isEditing ? (
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Lesson Title</label>
                                                    <input
                                                        type="text"
                                                        value={m.title}
                                                        onChange={(e) => handleUpdateDraftField(m.id, 'title', e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Focus Topic</label>
                                                    <input
                                                        type="text"
                                                        value={m.topic}
                                                        onChange={(e) => handleUpdateDraftField(m.id, 'topic', e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Preview Summary</label>
                                                    <input
                                                        type="text"
                                                        value={m.summary}
                                                        onChange={(e) => handleUpdateDraftField(m.id, 'summary', e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1.5 sm:col-span-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase">Markdown Content</label>
                                                    <textarea
                                                        value={m.content}
                                                        onChange={(e) => handleUpdateDraftField(m.id, 'content', e.target.value)}
                                                        className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold focus:border-blue-500 focus:outline-none font-mono dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                                        rows={12}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div>
                                                    <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{m.title}</h2>
                                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">Focus: {m.topic}</p>
                                                </div>
                                                <blockquote className="border-l-3 border-slate-200 pl-3.5 py-1 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-900/30 pr-2 rounded-r-lg">
                                                    {m.summary}
                                                </blockquote>

                                                <div className="border border-slate-100 rounded-2xl bg-slate-50/20 p-5 mt-4 dark:border-slate-900/60 dark:bg-slate-900/10">
                                                    {/* Toggle Mode Tabs */}
                                                    <div className="flex items-center justify-between gap-1.5 mb-4 border-b border-slate-100 pb-2.5 dark:border-slate-900">
                                                        <div className="flex items-center gap-1.5">
                                                            <FileText className="size-4 text-slate-400" />
                                                            <span className="text-[10px] font-black tracking-wider uppercase text-slate-450 dark:text-slate-400">Lesson Material Preview</span>
                                                        </div>
                                                        
                                                        <div className="inline-flex rounded-lg bg-slate-100/80 p-0.5 dark:bg-slate-900">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewMode(prev => ({ ...prev, [m.id]: 'preview' }))}
                                                                className={`rounded-md px-2 py-1 text-[9.5px] font-extrabold uppercase transition cursor-pointer ${
                                                                    (previewMode[m.id] || 'preview') === 'preview'
                                                                        ? 'bg-white text-blue-600 shadow-3xs dark:bg-slate-800 dark:text-white'
                                                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-350'
                                                                }`}
                                                            >
                                                                Visual Format
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewMode(prev => ({ ...prev, [m.id]: 'raw' }))}
                                                                className={`rounded-md px-2 py-1 text-[9.5px] font-extrabold uppercase transition cursor-pointer ${
                                                                    previewMode[m.id] === 'raw'
                                                                        ? 'bg-white text-blue-600 shadow-3xs dark:bg-slate-800 dark:text-white'
                                                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-355'
                                                                }`}
                                                            >
                                                                Raw Source
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {(previewMode[m.id] || 'preview') === 'preview' ? (
                                                        <div className="text-xs leading-relaxed text-slate-650 dark:text-slate-355 max-h-[450px] overflow-y-auto pr-2">
                                                            <LessonMarkdown content={m.content} />
                                                        </div>
                                                    ) : (
                                                        <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-650 max-h-[300px] overflow-y-auto pr-2 select-all dark:text-slate-350 bg-slate-50/50 p-3 rounded-lg border border-slate-100 dark:bg-slate-900/20 dark:border-slate-850">
                                                            {m.content}
                                                        </pre>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Table Footer actions & navigation */}
                {filteredDrafts.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/20 px-6 py-4 dark:border-slate-900/65 dark:bg-slate-900/10 gap-3 rounded-xl">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            Showing <strong className="text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</strong> to <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredDrafts.length)}</strong> of <strong className="text-slate-900 dark:text-white">{filteredDrafts.length}</strong> results
                        </span>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-3xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 cursor-pointer focus:outline-none"
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
                                                : 'border border-slate-200 bg-white text-slate-750 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
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
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-750 shadow-3xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 cursor-pointer focus:outline-none"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </>
    );
}

// Register layout configuration
DraftsLearnList.layout = {
    breadcrumbs: [
        {
            title: 'Learn Management',
            href: adminLearnIndex().url,
        },
        {
            title: 'Learn Drafts Review',
            href: adminLearnDrafts().url,
        },
    ],
};
