import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Sparkles,
    BookOpen,
    Clock,
    HelpCircle,
    PenLine,
    Cpu,
    Sparkle,
    CheckCircle2,
    RotateCcw,
    Save,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { CurationCreateShell } from '@/components/curation-create-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import {
    index as adminLearnIndex,
    create as adminLearnCreate,
    store as adminLearnStore,
    generate as adminLearnGenerate,
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

export default function AdminLearnCreate({
    categories,
    initialTopic = '',
}: AdminLearnCreateProps) {
    const queryParams =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : null;
    const initialTab = queryParams?.get('type') === 'manual' ? 'manual' : 'ai';
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(initialTab);
    const [selectedCategoryName, setSelectedCategoryName] = useState(
        categories[0]?.name || '',
    );
    const [selectedSubcategoryName, setSelectedSubcategoryName] = useState(
        categories[0]?.subcategory[0]?.name || '',
    );

    // AI Generation States
    const [aiTopic, setAiTopic] = useState(initialTopic);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const generateAbortRef = useRef<AbortController | null>(null);

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
        const cat = categories.find((c) => c.name === catName);

        if (cat) {
            setData((prev) => ({
                ...prev,
                category_id: cat.id,
                subcategory_id: cat.subcategory[0]?.id || '',
            }));
            setSelectedSubcategoryName(cat.subcategory[0]?.name || '');
        }
    };

    const handleSubcategoryChange = (subName: string) => {
        setSelectedSubcategoryName(subName);
        const cat = categories.find((c) => c.name === selectedCategoryName);

        if (cat) {
            const sub = cat.subcategory.find((s) => s.name === subName);

            if (sub) {
                setData('subcategory_id', sub.id);
            }
        }
    };

    const getFallbackTopic = (
        category: string,
        subcategory: string,
    ): string => {
        const cat = category.toLowerCase().trim();
        const sub = subcategory.toLowerCase().trim();

        if (
            cat.includes('numerical') ||
            sub.includes('basic operations') ||
            sub.includes('sequence') ||
            sub.includes('problems')
        ) {
            if (sub.includes('sequence')) {
                return 'Number Series and Pattern Recognition';
            }

            if (sub.includes('problems')) {
                return 'Algebraic Word Problems, Rate, and Work Computations';
            }

            return 'Order of Operations (PEMDAS) and Fraction Arithmetic';
        }

        if (
            cat.includes('verbal') ||
            sub.includes('word meaning') ||
            sub.includes('completion') ||
            sub.includes('recognition')
        ) {
            if (sub.includes('error')) {
                return 'Subject-Verb Agreement and Grammar Error Recognition';
            }

            if (sub.includes('structure')) {
                return 'Sentence Structure and Correct Modifiers';
            }

            return 'Contextual Synonyms and High-frequency Vocabulary Words';
        }

        if (
            cat.includes('analytical') ||
            sub.includes('analogy') ||
            sub.includes('logic') ||
            sub.includes('conclusions')
        ) {
            if (sub.includes('analogy')) {
                return 'Single and Double Word Analogy Relationships';
            }

            if (sub.includes('logic') || sub.includes('reasoning')) {
                return 'Propositional Logic, Venn Diagrams, and Abstract Reasoning';
            }

            return 'Drawing Valid Conclusions and Identifying Logical Assumptions';
        }

        if (
            cat.includes('clerical') ||
            sub.includes('filing') ||
            sub.includes('spelling')
        ) {
            if (sub.includes('filing')) {
                return 'Alphabetical Filing and Indexing Rules';
            }

            return 'Commonly Confused Words and Civil Service Spelling Rules';
        }

        if (
            cat.includes('general') ||
            sub.includes('constitution') ||
            sub.includes('conduct') ||
            sub.includes('peace')
        ) {
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
        generateAbortRef.current?.abort();
        const abortController = new AbortController();
        generateAbortRef.current = abortController;

        setIsGenerating(true);
        setGenerationError(null);
        setSuccessMsg(null);

        const targetTopic =
            aiTopic.trim() ||
            getFallbackTopic(selectedCategoryName, selectedSubcategoryName);

        try {
            const response = await fetch(adminLearnGenerate().url, {
                method: 'POST',
                signal: abortController.signal,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
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

                throw new Error(
                    errData.error || `HTTP error! status: ${response.status}`,
                );
            }

            const genData = await response.json();

            if (genData.success) {
                // Signal the layout to open the Pusher connection while waiting
                localStorage.setItem('waiting_for_ai', 'true');
                window.dispatchEvent(new Event('ai_generation_started'));

                // Keep `isGenerating` true. The Pusher event will reset it.
            }
        } catch (err: any) {
            setIsGenerating(false);

            if (err?.name === 'AbortError') {
                setGenerationError('Generation canceled.');
            } else {
                const errMsg =
                    err.message ||
                    'A network error occurred during generation. Please verify your internet connection and try again.';
                setGenerationError(errMsg);
            }
        }
    };

    const handleCancelAIGeneration = () => {
        generateAbortRef.current?.abort();
        generateAbortRef.current = null;
        setIsGenerating(false);
        setGenerationError('Generation canceled.');
    };

    useEffect(() => {
        const handleAiComplete = () => {
            setIsGenerating(false);
            setSuccessMsg(
                `Learning module generated successfully! It has been committed to database as a Draft.`,
            );
        };

        const handleAiFailed = () => {
            setIsGenerating(false);
        };

        window.addEventListener('ai_generation_completed', handleAiComplete);
        window.addEventListener('ai_generation_failed', handleAiFailed);

        return () => {
            generateAbortRef.current?.abort();
            window.removeEventListener(
                'ai_generation_completed',
                handleAiComplete,
            );
            window.removeEventListener('ai_generation_failed', handleAiFailed);
        };
    }, []);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(adminLearnStore().url, {
            onSuccess: () => {
                reset();
            },
        });
    };

    const activeSubcategories =
        categories.find((c) => c.name === selectedCategoryName)?.subcategory ||
        [];

    const aiContent = (
        <div className="grid max-w-7xl grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Config Panel (7/12 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-7">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-44 w-44 rounded-full bg-blue-500/5 blur-3xl" />

                    <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                        <h2 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
                            <Sparkles className="size-4.5 animate-pulse text-blue-600" />
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
                            options={categories.map((c) => ({
                                value: c.name,
                                label: c.name,
                            }))}
                        />

                        {/* Subcategory Selection */}
                        <SelectField
                            label="Subcategory"
                            value={selectedSubcategoryName}
                            disabled={isGenerating}
                            onValueChange={handleSubcategoryChange}
                            options={activeSubcategories.map((s) => ({
                                value: s.name,
                                label: s.name,
                            }))}
                        />

                        {/* Focus Topic keywords */}
                        <div className="text-slate-750 flex flex-col gap-1.5 text-xs font-bold dark:text-slate-400">
                            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Lesson Focus Topic
                            </label>
                            <Input
                                type="text"
                                disabled={isGenerating}
                                placeholder="e.g. Master the spelling of confusing scientific terms"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                            />
                        </div>

                        {/* Directives */}
                        <div className="text-slate-750 flex flex-col gap-1.5 text-xs font-bold dark:text-slate-400">
                            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                AI Prompt Directives (Optional)
                            </label>
                            <textarea
                                disabled={isGenerating}
                                placeholder="e.g. Focus on spelling tricks, add tabular lists comparing spelling variants..."
                                value={aiPrompt}
                                rows={4}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                className="w-full rounded-xl border border-border p-4 text-sm font-medium text-foreground transition duration-150 placeholder:text-muted-foreground focus:border-blue-500 focus:bg-background focus:outline-none disabled:opacity-55"
                            />
                        </div>

                        {/* Messages & Actions */}
                        {successMsg && (
                            <div className="border-emerald-250 shadow-3xs flex items-start gap-3 rounded-xl border border-l-4 border-l-emerald-500 bg-emerald-50/40 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                                <CheckCircle2 className="text-emerald-650 mt-0.5 size-4.5 shrink-0" />
                                <div className="flex flex-1 flex-col gap-1.5">
                                    <span className="font-extrabold text-emerald-950">
                                        Study Module Generated!
                                    </span>
                                    <span className="leading-relaxed font-semibold text-muted-foreground">
                                        Your learning module has been
                                        successfully synthesized and committed
                                        to the database as a draft. You can
                                        publish, edit, or curate it from the
                                        Syllabus Drafts Reviewer.
                                    </span>
                                    <Link
                                        href="/admin/learn/drafts"
                                        className="mt-1 inline-flex items-center gap-1 font-extrabold text-emerald-700 underline transition hover:text-emerald-900"
                                    >
                                        Review Drafts &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}

                        {generationError && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
                                <span>⚠️ {generationError}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            {isGenerating ? (
                                <div className="shadow-3xs flex flex-col gap-3.5 rounded-xl border border-border bg-muted p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="border-blue-650 size-5.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
                                        <span className="text-sm font-bold text-foreground">
                                            Synthesizing Detailed Lesson with
                                            Gemini...
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-5/6 rounded-sm bg-border" />
                                        <div className="h-3 w-3/4 rounded-sm bg-border" />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        fullWidth
                                        icon={RotateCcw}
                                        onClick={handleCancelAIGeneration}
                                    >
                                        Cancel Generation
                                    </Button>
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
                            <span className="mt-2.5 block text-center text-[10px] leading-normal font-semibold text-slate-400">
                                Generates rich concepts, bulleted principles,
                                mnemonics shortcuts, tabbed realistic examples,
                                and interactive quick-checks.
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Informational Column (5/12 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-5">
                <div className="border-slate-250 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-950 to-slate-900 p-6 text-white shadow-md">
                    <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-blue-600/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-600/5 blur-3xl" />

                    <h2 className="mb-4 inline-flex w-full items-center gap-2 border-b border-white/10 pb-4.5 text-base font-extrabold tracking-tight">
                        <Cpu className="size-4.5 text-blue-400" />
                        Gemini Lesson Writer
                    </h2>

                    <div className="text-slate-305 space-y-4 text-xs leading-relaxed font-semibold">
                        <div className="flex gap-3.5">
                            <BookOpen className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                            <div>
                                <h4 className="mb-1 font-bold text-slate-200">
                                    Standardized CSC Curriculum
                                </h4>
                                <p className="text-slate-400">
                                    Generated lessons conform fully to
                                    Philippine Civil Service syllabus standards,
                                    assuring highly precise and useful reviewer
                                    content.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3.5">
                            <Sparkles className="mt-0.5 size-4 shrink-0 text-purple-400" />
                            <div>
                                <h4 className="mb-1 font-bold text-slate-200">
                                    Interactive Markdown Structures
                                </h4>
                                <p className="text-slate-400">
                                    Gemini outputs rich Markdown tables, code
                                    blocks, numbered formulas, and clear headers
                                    for optimized learner readability.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3.5">
                            <HelpCircle className="mt-0.5 size-4 shrink-0 text-blue-400" />
                            <div>
                                <h4 className="mb-1 font-bold text-slate-200">
                                    Self-Assessment Integrations
                                </h4>
                                <p className="text-slate-400">
                                    Every AI generation automatically ends with
                                    3 realistic multiple-choice quick checks,
                                    visible answers, and explanations to test
                                    student retention instantly.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const manualContent = (
        <form
            onSubmit={handleManualSubmit}
            className="grid max-w-7xl grid-cols-1 items-start gap-6 lg:grid-cols-12"
        >
            {/* Left column: Core editor inputs (8/12 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-8">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <h2 className="mb-4 inline-flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-foreground">
                        <PenLine className="size-4.5 text-emerald-600" />
                        Manual Lesson Curator
                    </h2>

                    <div className="text-slate-750 space-y-4 text-xs font-bold dark:text-slate-400">
                        {/* Title */}
                        <div>
                            <label className="mb-1 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Lesson Title
                            </label>
                            <Input
                                type="text"
                                placeholder="e.g. Indexing & Filing Rules for Clerical Puzzles"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                required
                            />
                            {errors.title && (
                                <span className="mt-1 block text-[10px] font-medium text-red-600">
                                    {errors.title}
                                </span>
                            )}
                        </div>

                        {/* Row: Topic & Est Minutes */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Focus Topic
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g. Filing"
                                    value={data.topic}
                                    onChange={(e) =>
                                        setData('topic', e.target.value)
                                    }
                                    required
                                />
                                {errors.topic && (
                                    <span className="mt-1 block text-[10px] font-medium text-red-600">
                                        {errors.topic}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Estimated Minutes Read
                                </label>
                                <div className="relative">
                                    <Clock className="text-slate-455 absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2" />
                                    <Input
                                        type="number"
                                        min={1}
                                        max={120}
                                        value={data.estimated_minutes}
                                        onChange={(e) =>
                                            setData(
                                                'estimated_minutes',
                                                parseInt(e.target.value, 10) ||
                                                    5,
                                            )
                                        }
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {errors.estimated_minutes && (
                                    <span className="mt-1 block text-[10px] font-medium text-red-600">
                                        {errors.estimated_minutes}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="mb-1 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Short Preview Summary
                            </label>
                            <textarea
                                placeholder="Provide a concise 1-2 sentence overview of the lesson, visible on the study syllabus list..."
                                value={data.summary}
                                rows={2}
                                onChange={(e) =>
                                    setData('summary', e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                required
                            />
                            {errors.summary && (
                                <span className="mt-1 block text-[10px] font-medium text-red-600">
                                    {errors.summary}
                                </span>
                            )}
                        </div>

                        {/* Markdown Content */}
                        <div>
                            <label className="mb-1 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Lesson Content (Markdown syntax supported)
                            </label>
                            <textarea
                                placeholder="Write detailed lesson summaries, structured lists, mental shortcuts, mathematical tables, or assessment self-checks using Markdown format..."
                                value={data.content}
                                rows={14}
                                onChange={(e) =>
                                    setData('content', e.target.value)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/20 p-3 font-mono text-xs leading-relaxed font-semibold focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                required
                            />
                            {errors.content && (
                                <span className="mt-1 block text-[10px] font-medium text-red-600">
                                    {errors.content}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right column: metadata parameters & save triggers (4/12 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-4">
                {/* Metadata options */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <h2 className="mb-4 border-b border-slate-100 pb-3 text-base font-bold">
                        Categorization
                    </h2>
                    <div className="space-y-4">
                        {/* Category Select */}
                        <SelectField
                            label="Category"
                            value={selectedCategoryName}
                            onValueChange={handleCategoryChange}
                            options={categories.map((c) => ({
                                value: c.name,
                                label: c.name,
                            }))}
                        />

                        {/* Subcategory Select */}
                        <SelectField
                            label="Subcategory"
                            value={selectedSubcategoryName}
                            onValueChange={handleSubcategoryChange}
                            options={activeSubcategories.map((s) => ({
                                value: s.name,
                                label: s.name,
                            }))}
                        />

                        {/* Publish Status Options Toggle */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Initial Status
                            </label>
                            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted p-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData('is_published', true)
                                    }
                                    className={`cursor-pointer rounded-lg py-2 text-xs font-black tracking-wider uppercase transition ${
                                        data.is_published
                                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                                            : 'dark:text-slate-450 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Published
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData('is_published', false)
                                    }
                                    className={`cursor-pointer rounded-lg py-2 text-xs font-black tracking-wider uppercase transition ${
                                        !data.is_published
                                            ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-950 dark:text-white'
                                            : 'dark:text-slate-450 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
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
                title={
                    activeTab === 'ai'
                        ? 'AI Lesson Generator'
                        : 'Manual Lesson Editor'
                }
                description={
                    activeTab === 'ai'
                        ? 'Specify syllabus topics and let Gemini write a comprehensive, premium-formatted review tutorial.'
                        : 'Draft detailed review content manually, customize estimated time reading, and index categories.'
                }
                backUrl={
                    successMsg ? '/admin/learn/drafts' : adminLearnIndex().url
                }
                backLabel={
                    successMsg
                        ? 'Back to Drafts Review'
                        : 'Back to Curator Dashboard'
                }
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
