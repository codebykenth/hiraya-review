import { Head, Link, useForm, router } from '@inertiajs/react';
import { Sparkles, BookOpen, Clock, HelpCircle, PenLine, Cpu, Sparkle, CheckCircle2, RotateCcw, Save } from 'lucide-react';
import React, { useState } from 'react';
import { CurationCreateShell } from '@/components/curation-create-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
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
            if (sub.includes('sequence')) {
                return 'Number Series and Pattern Recognition';
            }

            if (sub.includes('problems')) {
                return 'Algebraic Word Problems, Rate, and Work Computations';
            }

            return 'Order of Operations (PEMDAS) and Fraction Arithmetic';
        }

        if (cat.includes('verbal') || sub.includes('word meaning') || sub.includes('completion') || sub.includes('recognition')) {
            if (sub.includes('error')) {
                return 'Subject-Verb Agreement and Grammar Error Recognition';
            }

            if (sub.includes('structure')) {
                return 'Sentence Structure and Correct Modifiers';
            }

            return 'Contextual Synonyms and High-frequency Vocabulary Words';
        }

        if (cat.includes('analytical') || sub.includes('analogy') || sub.includes('logic') || sub.includes('conclusions')) {
            if (sub.includes('analogy')) {
                return 'Single and Double Word Analogy Relationships';
            }

            if (sub.includes('logic') || sub.includes('reasoning')) {
                return 'Propositional Logic, Venn Diagrams, and Abstract Reasoning';
            }

            return 'Drawing Valid Conclusions and Identifying Logical Assumptions';
        }

        if (cat.includes('clerical') || sub.includes('filing') || sub.includes('spelling')) {
            if (sub.includes('filing')) {
                return 'Alphabetical Filing and Indexing Rules';
            }

            return 'Commonly Confused Words and Civil Service Spelling Rules';
        }

        if (cat.includes('general') || sub.includes('constitution') || sub.includes('conduct') || sub.includes('peace')) {
            if (sub.includes('constitution')) {
                return 'The Philippine Constitution: Article III Bill of Rights';
            }

            if (sub.includes('conduct') || sub.includes('6713')) {
                return 'Republic Act 6713: Code of Conduct and Ethical Standards for Public Officials';
            }

            return 'Environmental Protection and Human Rights Issues';
        }

        return 'Civil Service Exam Core Review Syllabus Lesson';
    };

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

    const activeSubcategories = categories.find(c => c.name === selectedCategoryName)?.subcategory || [];

    const aiContent = (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start max-w-7xl">
            {/* Config Panel (7/12 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

                    <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                        <h2 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
                            <Sparkles className="size-4.5 text-blue-600 animate-pulse" />
                            Syllabus Options
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* Category Selection */}
                        <SelectField
                            label="Category"
                            value={selectedCategoryName}
                            disabled={isGenerating}
                            onValueChange={handleCategoryChange}
                            options={categories.map(c => ({ value: c.name, label: c.name }))}
                        />

                        {/* Subcategory Selection */}
                        <SelectField
                            label="Subcategory"
                            value={selectedSubcategoryName}
                            disabled={isGenerating}
                            onValueChange={handleSubcategoryChange}
                            options={activeSubcategories.map(s => ({ value: s.name, label: s.name }))}
                        />

                        {/* Focus Topic keywords */}
                        <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lesson Focus Topic</label>
                            <Input
                                type="text"
                                disabled={isGenerating}
                                placeholder="e.g. Master the spelling of confusing scientific terms"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                            />
                        </div>

                        {/* Directives */}
                        <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-750 dark:text-slate-400">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Prompt Directives (Optional)</label>
                            <textarea
                                disabled={isGenerating}
                                placeholder="e.g. Focus on spelling tricks, add tabular lists comparing spelling variants..."
                                value={aiPrompt}
                                rows={4}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                className="w-full rounded-xl border border-border p-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:border-blue-500 transition duration-150 disabled:opacity-55"
                            />
                        </div>

                        {/* Messages & Actions */}
                        {successMsg && (
                            <div className="rounded-xl border border-emerald-250 bg-emerald-50/40 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-3 shadow-3xs border-l-4 border-l-emerald-500 dark:bg-emerald-950/20 dark:border-emerald-900/30">
                                <CheckCircle2 className="size-4.5 text-emerald-650 shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <span className="font-extrabold text-emerald-950">Study Module Generated!</span>
                                    <span className="text-muted-foreground leading-relaxed font-semibold">
                                        Your learning module has been successfully synthesized and committed to the database as a draft. You can publish, edit, or curate it from the Curator Dashboard.
                                    </span>
                                    <Link
                                        href="/admin/learn"
                                        className="inline-flex items-center gap-1 mt-1 text-emerald-700 hover:text-emerald-900 font-extrabold underline transition"
                                    >
                                        Go to Curator Panel &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}

                        {generationError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-start gap-2.5">
                                <span>⚠️ {generationError}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            {isGenerating ? (
                                <div className="rounded-xl border border-border bg-muted p-5 flex flex-col gap-3.5 animate-pulse shadow-3xs">
                                    <div className="flex items-center gap-3">
                                        <div className="size-5.5 rounded-full border-2 border-blue-650 border-t-transparent animate-spin shrink-0" />
                                        <span className="text-sm font-bold text-foreground">Synthesizing Detailed Lesson with Gemini...</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-border rounded-sm w-5/6" />
                                        <div className="h-3 bg-border rounded-sm w-3/4" />
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="default"
                                    size="lg"
                                    fullWidth
                                    icon={Sparkle}
                                    onClick={triggerAIGeneration}
                                >
                                    Generate Lesson Module
                                </Button>
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
                <div className="rounded-2xl border border-slate-250 bg-gradient-to-br from-blue-950 to-slate-900 p-6 text-white shadow-md relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-600/10 blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

                    <h2 className="text-base font-extrabold tracking-tight inline-flex items-center gap-2 border-b border-white/10 pb-4.5 mb-4 w-full">
                        <Cpu className="size-4.5 text-blue-400" />
                        Gemini Lesson Writer
                    </h2>

                    <div className="space-y-4 text-xs font-semibold text-slate-305 leading-relaxed">
                        <div className="flex gap-3.5">
                            <BookOpen className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-slate-200 font-bold mb-1">Standardized CSC Curriculum</h4>
                                <p className="text-slate-400">Generated lessons conform fully to Philippine Civil Service syllabus standards, assuring highly precise and useful reviewer content.</p>
                            </div>
                        </div>

                        <div className="flex gap-3.5">
                            <Sparkles className="size-4 text-purple-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-slate-200 font-bold mb-1">Interactive Markdown Structures</h4>
                                <p className="text-slate-400">Gemini outputs rich Markdown tables, code blocks, numbered formulas, and clear headers for optimized learner readability.</p>
                            </div>
                        </div>

                        <div className="flex gap-3.5">
                            <HelpCircle className="size-4 text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-slate-200 font-bold mb-1">Self-Assessment Integrations</h4>
                                <p className="text-slate-400">Every AI generation automatically ends with 3 realistic multiple-choice quick checks, visible answers, and explanations to test student retention instantly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const manualContent = (
        <form onSubmit={handleManualSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start max-w-7xl">
            {/* Left column: Core editor inputs (8/12 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <h2 className="text-base font-bold text-foreground border-b border-border pb-3 mb-4 inline-flex items-center gap-2">
                        <PenLine className="size-4.5 text-emerald-600" />
                        Manual Lesson Curator
                    </h2>

                    <div className="space-y-4 text-xs font-bold text-slate-750 dark:text-slate-400">
                        {/* Title */}
                        <div>
                            <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Lesson Title</label>
                            <Input
                                type="text"
                                placeholder="e.g. Indexing & Filing Rules for Clerical Puzzles"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                required
                            />
                            {errors.title && <span className="mt-1 block text-[10px] text-red-600 font-medium">{errors.title}</span>}
                        </div>

                        {/* Row: Topic & Est Minutes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Focus Topic</label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Filing"
                                    value={data.topic}
                                    onChange={e => setData('topic', e.target.value)}
                                    required
                                />
                                {errors.topic && <span className="mt-1 block text-[10px] text-red-600 font-medium">{errors.topic}</span>}
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Minutes Read</label>
                                <div className="relative">
                                    <Clock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-455 z-10" />
                                    <Input
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={data.estimated_minutes}
                                        onChange={e => setData('estimated_minutes', parseInt(e.target.value, 10) || 5)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {errors.estimated_minutes && <span className="mt-1 block text-[10px] text-red-600 font-medium">{errors.estimated_minutes}</span>}
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Short Preview Summary</label>
                            <textarea
                                placeholder="Provide a concise 1-2 sentence overview of the lesson, visible on the study syllabus list..."
                                value={data.summary}
                                rows={2}
                                onChange={e => setData('summary', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                required
                            />
                            {errors.summary && <span className="mt-1 block text-[10px] text-red-600 font-medium">{errors.summary}</span>}
                        </div>

                        {/* Markdown Content */}
                        <div>
                            <label className="block mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">Lesson Content (Markdown syntax supported)</label>
                            <textarea
                                placeholder="Write detailed lesson summaries, structured lists, mental shortcuts, mathematical tables, or assessment self-checks using Markdown format..."
                                value={data.content}
                                rows={14}
                                onChange={e => setData('content', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold font-mono leading-relaxed focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                required
                            />
                            {errors.content && <span className="mt-1 block text-[10px] text-red-600 font-medium">{errors.content}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right column: metadata parameters & save triggers (4/12 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                {/* Metadata options */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <h2 className="text-base font-bold border-b border-slate-100 pb-3 mb-4">
                        Categorization
                    </h2>
                    <div className="space-y-4">
                        {/* Category Select */}
                        <SelectField
                            label="Category"
                            value={selectedCategoryName}
                            onValueChange={handleCategoryChange}
                            options={categories.map(c => ({ value: c.name, label: c.name }))}
                        />

                        {/* Subcategory Select */}
                        <SelectField
                            label="Subcategory"
                            value={selectedSubcategoryName}
                            onValueChange={handleSubcategoryChange}
                            options={activeSubcategories.map(s => ({ value: s.name, label: s.name }))}
                        />

                        {/* Publish Status Options Toggle */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Initial Status</label>
                            <div className="grid grid-cols-2 gap-2 bg-muted rounded-xl p-1 border border-border">
                                <button
                                    type="button"
                                    onClick={() => setData('is_published', true)}
                                    className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${data.is_published
                                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
                                        }`}
                                >
                                    Published
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('is_published', false)}
                                    className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition cursor-pointer ${!data.is_published
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
                    <Button
                        type="submit"
                        variant="success"
                        size="lg"
                        fullWidth
                        loading={processing}
                        icon={Save}
                    >
                        Save Learning Module
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        fullWidth
                        icon={RotateCcw}
                        onClick={() => {
                            reset();
                            router.visit('/admin/learn');
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </form>
    );

    return (
        <>
            <Head title="Create Study Module" />
            <CurationCreateShell
                title={activeTab === 'ai' ? 'AI Lesson Generator' : 'Manual Lesson Editor'}
                description={
                    activeTab === 'ai'
                        ? 'Specify syllabus topics and let Gemini write a comprehensive, premium-formatted review tutorial.'
                        : 'Draft detailed review content manually, customize estimated time reading, and index categories.'
                }
                backUrl={adminLearnIndex().url}
                backLabel="Back to Curator Dashboard"
                activeTab={activeTab}
                onTabChange={setActiveTab}
                aiContent={aiContent}
                manualContent={manualContent}
            />
        </>
    );
}

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
