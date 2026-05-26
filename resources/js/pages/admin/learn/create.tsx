import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ChevronLeft, Save, Sparkles, BookOpen, Clock, Tag, HelpCircle, Eye, PenLine, Cpu, Sparkle, CheckCircle2, RotateCcw } from 'lucide-react';
import { 
    index as adminLearnIndex,
    create as adminLearnCreate,
    store as adminLearnStore,
    generate as adminLearnGenerate
} from '@/routes/admin/learn';

interface Subcategory {
    id: number;
    category_id: number;
    name: string;
    slug: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    subcategory: Subcategory[];
}

interface AdminLearnCreateProps {
    categories: Category[];
    initialTopic?: string;
}

export default function AdminLearnCreate({ categories, initialTopic = '' }: AdminLearnCreateProps) {
    const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialTab = queryParams?.get('type') === 'manual' ? 'manual' : 'ai';
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(initialTab);
    const [selectedCategoryName, setSelectedCategoryName] = useState(categories[0]?.name || '');
    const [selectedSubcategoryName, setSelectedSubcategoryName] = useState(categories[0]?.subcategory[0]?.name || '');
    
    // AI Generation States
    const [aiTopic, setAiTopic] = useState(initialTopic);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Main Manual Form Setup
    const { data, setData, post, processing, errors, reset } = useForm({
        category_id: categories[0]?.id || '',
        subcategory_id: categories[0]?.subcategory[0]?.id || '',
        title: '',
        topic: initialTopic || '',
        summary: '',
        content: '',
        estimated_minutes: 8,
        is_published: false,
    });

    // Handle Category change to update subcategory options and IDs
    const handleCategoryChange = (catName: string) => {
        setSelectedCategoryName(catName);
        const cat = categories.find(c => c.name === catName);
        if (cat) {
            setData(prev => ({
                ...prev,
                category_id: cat.id,
                subcategory_id: cat.subcategory[0]?.id || '',
            }));
            setSelectedSubcategoryName(cat.subcategory[0]?.name || '');
        }
    };

    const handleSubcategoryChange = (subName: string) => {
        setSelectedSubcategoryName(subName);
        const cat = categories.find(c => c.name === selectedCategoryName);
        if (cat) {
            const sub = cat.subcategory.find(s => s.name === subName);
            if (sub) {
                setData('subcategory_id', sub.id);
            }
        }
    };

    const getFallbackTopic = (category: string, subcategory: string): string => {
        const cat = category.toLowerCase().trim();
        const sub = subcategory.toLowerCase().trim();

        if (cat.includes('numerical') || sub.includes('basic operations') || sub.includes('sequence') || sub.includes('problems')) {
            if (sub.includes('sequence')) return 'Number Series and Pattern Recognition';
            if (sub.includes('problems')) return 'Algebraic Word Problems, Rate, and Work Computations';
            return 'Order of Operations (PEMDAS) and Fraction Arithmetic';
        }
        if (cat.includes('verbal') || sub.includes('word meaning') || sub.includes('completion') || sub.includes('recognition')) {
            if (sub.includes('error')) return 'Subject-Verb Agreement and Grammar Error Recognition';
            if (sub.includes('structure')) return 'Sentence Structure and Correct Modifiers';
            return 'Contextual Synonyms and High-frequency Vocabulary Words';
        }
        if (cat.includes('analytical') || sub.includes('analogy') || sub.includes('logic') || sub.includes('conclusions')) {
            if (sub.includes('analogy')) return 'Single and Double Word Analogy Relationships';
            if (sub.includes('logic') || sub.includes('reasoning')) return 'Propositional Logic, Venn Diagrams, and Abstract Reasoning';
            return 'Drawing Valid Conclusions and Identifying Logical Assumptions';
        }
        if (cat.includes('clerical') || sub.includes('filing') || sub.includes('spelling')) {
            if (sub.includes('filing')) return 'Alphabetical Filing and Indexing Rules';
            return 'Commonly Confused Words and Civil Service Spelling Rules';
        }
        if (cat.includes('general') || sub.includes('constitution') || sub.includes('conduct') || sub.includes('peace')) {
            if (sub.includes('constitution')) return 'The Philippine Constitution: Article III Bill of Rights';
            if (sub.includes('conduct') || sub.includes('6713')) return 'Republic Act 6713: Code of Conduct and Ethical Standards for Public Officials';
            return 'Environmental Protection and Human Rights Issues';
        }
        return 'Civil Service Exam Core Review Syllabus Lesson';
    };

    // Strict 1-liner comment: Connects with backend Gemini endpoint to generate and save draft lesson module
    const triggerAIGeneration = async () => {
        setIsGenerating(true);
        setGenerationError(null);
        setSuccessMsg(null);

        const targetTopic = aiTopic.trim() || getFallbackTopic(selectedCategoryName, selectedSubcategoryName);

        try {
            const response = await fetch(adminLearnGenerate().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({
                    category: selectedCategoryName,
                    subcategory: selectedSubcategoryName,
                    topic: targetTopic,
                    prompt: aiPrompt,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `HTTP error! status: ${response.status}`);
            }

            const genData = await response.json();
            
            if (genData.success) {
                setSuccessMsg(`Learning module generated successfully for "${targetTopic}"! It has been committed to database as a Draft.`);
            }

        } catch (err: any) {
            console.error(err);
            const errMsg = err.message || 'A network error occurred during generation. Please verify your internet connection and try again.';
            setGenerationError(errMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(adminLearnStore().url, {
            onSuccess: () => {
                reset();
            }
        });
    };

    // Subcategory choices matching currently selected Category name
    const activeSubcategories = categories.find(c => c.name === selectedCategoryName)?.subcategory || [];

    return (
        <>
            <Head title="Create Study Module" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6 bg-slate-50/30 dark:bg-slate-900/20">
                
                {/* Back Link */}
                <Link
                    href={adminLearnIndex().url}
                    className="flex w-fit items-center gap-1 text-xs font-black text-slate-855 hover:text-blue-655 dark:text-white dark:hover:text-blue-400 transition focus:outline-none"
                >
                    <ChevronLeft className="size-4" />
                    Back to Curator Dashboard
                </Link>

                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                            {activeTab === 'ai' ? 'AI Lesson Generator' : 'Manual Lesson Editor'}
                        </h1>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {activeTab === 'ai' 
                                ? 'Specify syllabus topics and let Gemini write a comprehensive, premium-formatted review tutorial.'
                                : 'Draft detailed review content manually, customize estimated time reading, and index categories.'}
                        </p>
                    </div>

                    {/* Segment Switched Tab switcher */}
                    <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setActiveTab('ai')}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                                activeTab === 'ai' 
                                    ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white' 
                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
                             }`}
                        >
                            <Sparkles className="size-4 text-blue-600 animate-pulse" />
                            AI Generator
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('manual')}
                            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                                activeTab === 'manual' 
                                    ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white' 
                                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
                            }`}
                        >
                            <PenLine className="size-4 text-emerald-600" />
                            Manual Entry
                        </button>
                    </div>
                </div>

                {/* Workspace Content */}
                {activeTab === 'ai' ? (
                    /* TAB A: AI GENERATOR FLOW */
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start max-w-7xl">
                        
                        {/* Config Panel (7/12 cols) */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="rounded-2xl border border-slate-250 bg-white p-6 shadow-xs relative overflow-hidden dark:border-slate-800 dark:bg-slate-950">
                                
                                {/* Geometric Background Glow */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

                                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-slate-850">
                                    <h2 className="inline-flex items-center gap-2 text-sm font-black text-slate-855 dark:text-white uppercase tracking-wider">
                                        <Sparkles className="size-4.5 text-blue-600 animate-pulse" />
                                        Syllabus Options
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    {/* Category Selection */}
                                    <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Target Category</label>
                                        <select
                                            value={selectedCategoryName}
                                            disabled={isGenerating}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white disabled:opacity-50"
                                        >
                                            {categories.map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Subcategory Selection */}
                                    <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Target Subcategory</label>
                                        <select
                                            value={selectedSubcategoryName}
                                            disabled={isGenerating}
                                            onChange={(e) => handleSubcategoryChange(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white disabled:opacity-50"
                                        >
                                            {activeSubcategories.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Focus Topic keywords */}
                                    <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Lesson Focus Topic</label>
                                        <input
                                            type="text"
                                            disabled={isGenerating}
                                            placeholder="e.g. Master the spelling of confusing scientific terms"
                                            value={aiTopic}
                                            onChange={(e) => setAiTopic(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white disabled:opacity-50"
                                        />
                                    </div>

                                    {/* Directives */}
                                    <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">AI Prompt Directives (Optional)</label>
                                        <textarea
                                            disabled={isGenerating}
                                            placeholder="e.g. Focus on spelling tricks, add tabular lists comparing spelling variants..."
                                            value={aiPrompt}
                                            rows={4}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white disabled:opacity-50"
                                        />
                                    </div>

                                    {/* Messages & Actions */}
                                    {successMsg && (
                                        <div className="rounded-xl border border-emerald-250 bg-emerald-50/40 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-3 shadow-3xs border-l-4 border-l-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                                            <CheckCircle2 className="size-4.5 text-emerald-650 shrink-0 mt-0.5" />
                                            <div className="flex flex-col gap-1.5 flex-1">
                                                <span className="font-extrabold text-emerald-950 dark:text-emerald-400">Study Module Generated!</span>
                                                <span className="text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                                                    Your learning module has been successfully synthesized and committed to the database as a draft. You can publish, edit, or curate it from the Curator Dashboard.
                                                </span>
                                                <Link
                                                    href="/admin/learn"
                                                    className="inline-flex items-center gap-1 mt-1 text-emerald-700 hover:text-emerald-950 dark:text-emerald-400 dark:hover:text-emerald-200 font-extrabold underline transition"
                                                >
                                                    Go to Curator Panel &rarr;
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {generationError && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-start gap-2.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
                                            <span>⚠️ {generationError}</span>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        {isGenerating ? (
                                            <div className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 p-5 flex flex-col gap-3.5 animate-pulse shadow-3xs">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-5.5 rounded-full border-2 border-blue-650 border-t-transparent animate-spin shrink-0" />
                                                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Synthesizing Detailed Lesson with Gemini...</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-5/6" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-3/4" />
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={triggerAIGeneration}
                                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition focus:outline-none cursor-pointer uppercase tracking-wider"
                                            >
                                                <Sparkle className="size-4.5" />
                                                Generate Lesson Module
                                            </button>
                                        )}
                                        <span className="mt-2.5 block text-center text-[10px] text-slate-400 leading-normal font-semibold">
                                            Generates rich concepts, bulleted principles, mnemonics shortcuts, tabbed realistic examples, and interactive quick-checks.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informational Column (5/12 cols) */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div className="rounded-2xl border border-slate-250 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-md relative overflow-hidden dark:border-slate-850">
                                
                                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
                                
                                <h2 className="text-xs font-black tracking-widest text-slate-200 uppercase inline-flex items-center gap-2 border-b border-white/10 pb-4.5 mb-4 w-full">
                                    <Cpu className="size-4.5 text-blue-400 animate-pulse" />
                                    Gemini Lesson Writer
                                </h2>

                                <div className="space-y-5 text-xs font-semibold text-slate-300 leading-relaxed">
                                    <div className="flex gap-3.5">
                                        <BookOpen className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-slate-100 font-bold mb-1">Standardized CSC Curriculum</h4>
                                            <p className="text-slate-400">Generated lessons conform fully to Philippine Civil Service syllabus standards, assuring highly precise and useful reviewer content.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3.5">
                                        <Sparkles className="size-4 text-purple-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-slate-100 font-bold mb-1">Interactive Markdown Structures</h4>
                                            <p className="text-slate-400">Gemini outputs rich Markdown tables, code blocks, numbered formulas, and clear headers for optimized learner readability.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3.5">
                                        <HelpCircle className="size-4 text-blue-400 shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-slate-100 font-bold mb-1">Self-Assessment Integrations</h4>
                                            <p className="text-slate-400">Every AI generation automatically ends with 3 realistic multiple-choice quick checks, visible answers, and explanations to test student retention instantly.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                ) : (
                    /* TAB B: MANUAL ENTRY FLOW */
                    <form onSubmit={handleManualSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start max-w-7xl">
                        
                        {/* Left column: Core editor inputs (8/12 cols) */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
                                
                                <h2 className="text-sm font-black text-slate-855 dark:text-white uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 inline-flex items-center gap-1.5 dark:border-slate-850">
                                    <PenLine className="size-4 text-emerald-600" />
                                    Manual Lesson Curator
                                </h2>

                                <div className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-400">
                                    
                                    {/* Title */}
                                    <div>
                                        <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">Lesson Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Indexing & Filing Rules for Clerical Puzzles"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                            required
                                        />
                                        {errors.title && <span className="mt-1 block text-[10px] text-red-655 font-medium">{errors.title}</span>}
                                    </div>

                                    {/* Row: Topic & Est Minutes */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">Focus Topic</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Filing"
                                                value={data.topic}
                                                onChange={e => setData('topic', e.target.value)}
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                                required
                                            />
                                            {errors.topic && <span className="mt-1 block text-[10px] text-red-655 font-medium">{errors.topic}</span>}
                                        </div>
                                        
                                        <div>
                                            <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">Estimated Minutes Read</label>
                                            <div className="relative">
                                                <Clock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={120}
                                                    value={data.estimated_minutes}
                                                    onChange={e => setData('estimated_minutes', parseInt(e.target.value, 10) || 5)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/20 py-3 pl-10 pr-4 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                                    required
                                                />
                                            </div>
                                            {errors.estimated_minutes && <span className="mt-1 block text-[10px] text-red-655 font-medium">{errors.estimated_minutes}</span>}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div>
                                        <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">Short Preview Summary</label>
                                        <textarea
                                            placeholder="Provide a concise 1-2 sentence overview of the lesson, visible on the study syllabus list..."
                                            value={data.summary}
                                            rows={2}
                                            onChange={e => setData('summary', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                            required
                                        />
                                        {errors.summary && <span className="mt-1 block text-[10px] text-red-655 font-medium">{errors.summary}</span>}
                                    </div>

                                    {/* Markdown Content */}
                                    <div>
                                        <label className="block mb-1 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest">Lesson Content (Markdown syntax supported)</label>
                                        <textarea
                                            placeholder="Write detailed lesson summaries, structured lists, mental shortcuts, mathematical tables, or assessment self-checks using Markdown format..."
                                            value={data.content}
                                            rows={14}
                                            onChange={e => setData('content', e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold font-mono leading-relaxed focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                            required
                                        />
                                        {errors.content && <span className="mt-1 block text-[10px] text-red-655 font-medium">{errors.content}</span>}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Right column: metadata parameters & save triggers (4/12 cols) */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            
                            {/* Metadata options */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-950">
                                <h2 className="text-sm font-black text-slate-855 dark:text-white uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 dark:border-slate-850">
                                    Categorization
                                </h2>

                                <div className="space-y-4">
                                    {/* Target Category Select */}
                                    <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Target Category</label>
                                        <select
                                            value={selectedCategoryName}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                        >
                                            {categories.map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Target Subcategory Select */}
                                    <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Target Subcategory</label>
                                        <select
                                            value={selectedSubcategoryName}
                                            onChange={(e) => handleSubcategoryChange(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-2.5 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                        >
                                            {activeSubcategories.map(s => (
                                                <option key={s.id} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Publish Status Options Toggle */}
                                    <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Initial Status</label>
                                        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={() => setData('is_published', true)}
                                                className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
                                                    data.is_published
                                                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                Published
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('is_published', false)}
                                                className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${
                                                    !data.is_published
                                                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
                                                }`}
                                            >
                                                Draft
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions panel */}
                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-800 transition duration-200 disabled:opacity-50 uppercase tracking-widest cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Saving Module...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="size-4.5" />
                                            Save Learning Module
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        reset();
                                        router.visit('/admin/learn');
                                    }}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-955 transition duration-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white uppercase tracking-widest cursor-pointer"
                                >
                                    <RotateCcw className="size-4" />
                                    Cancel
                                </button>
                            </div>

                        </div>

                    </form>
                )}

            </div>
        </>
    );
}

// Register breadcrumbs configuration
AdminLearnCreate.layout = {
    breadcrumbs: [
        {
            title: 'Learn Management',
            href: adminLearnIndex().url,
        },
        {
            title: 'Create Module',
            href: adminLearnCreate().url,
        },
    ],
};
