import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Sparkles,
    FileText,
    AlertCircle,
    Save,
    RotateCcw,
    Sparkle,
    Cpu,
    BookOpen,
    HelpCircle,
    CheckCircle2,
} from 'lucide-react';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CurationCreateShell } from '@/components/curation-create-shell';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select';
import {
    index as questionsIndex,
    store as questionsStore,
    drafts as questionsDrafts,
    generate as questionsGenerate,
} from '@/routes/questions';

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

interface CreateProps {
    type?: 'ai' | 'manual';
    categories?: CategoryItem[];
}

export default function CreateQuestion({
    type = 'ai',
    categories = [],
}: CreateProps) {
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(
        type === 'manual' ? 'manual' : 'ai',
    );

    // Wrap cseCategoriesTree in useMemo so its reference doesn't change on every render
    const cseCategoriesTree = useMemo(() => {
        const tree: Record<string, string[]> = {};

        if (categories && categories.length > 0) {
            categories.forEach((cat) => {
                tree[cat.name] = (cat.subcategory || []).map((sub) => sub.name);
            });
        } else {
            tree['General Information'] = [
                'Philippine Constitution',
                'Code of Conduct and Ethical Standards (R.A. 6713)',
                'Peace and Human Rights Issues and Concepts',
                'Environment Management and Protection',
            ];
            tree['Verbal Ability'] = [
                'Word meaning',
                'Sentence completion',
                'Error recognition',
                'Sentence structure',
                'Paragraph organization',
                'Reading comprehension',
            ];
            tree['Analytical Ability'] = [
                'Word analogy',
                'Symbolic logic / abstract reasoning',
                'Identifying assumptions and drawing conclusions',
                'Data interpretation',
            ];
            tree['Numerical Ability'] = [
                'Basic operations',
                'Number sequence',
                'Word problems',
            ];
            tree['Clerical Ability'] = ['Filing', 'Spelling'];
        }

        return tree;
    }, [categories]); // Recalculate only if categories prop changes

    const defaultCategory =
        Object.keys(cseCategoriesTree)[0] || 'Analytical Ability';
    const defaultSubcategory =
        cseCategoriesTree[defaultCategory]?.[0] || 'Word analogy';

    // AI Generator State
    const [aiCategory, setAiCategory] = useState<string>(defaultCategory);
    const [aiSubcategory, setAiSubcategory] =
        useState<string>(defaultSubcategory);
    const [aiCount, setAiCount] = useState<number>(3);
    const [aiLanguage, setAiLanguage] = useState<string>('English');
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const generateAbortRef = useRef<AbortController | null>(null);

    // Sync subcategories for AI view
    useEffect(() => {
        if (cseCategoriesTree[aiCategory]) {
            const firstSub = cseCategoriesTree[aiCategory][0];

            if (aiSubcategory !== firstSub) {
                const timer = setTimeout(() => {
                    setAiSubcategory(firstSub);
                }, 0);

                return () => clearTimeout(timer);
            }
        }
    }, [aiCategory, aiSubcategory, cseCategoriesTree]);

    // Manual Entry Form
    const { data, setData, post, processing, errors, reset } = useForm({
        stem: '',
        category: defaultCategory,
        subcategory: defaultSubcategory,
        language: 'English',
        options: ['', '', '', '', ''],
        correct_option: 0,
        explanation: '',
        status: 'active' as 'active' | 'draft',
    });

    // Sync subcategories for Manual view
    useEffect(() => {
        if (cseCategoriesTree[data.category]) {
            const firstSub = cseCategoriesTree[data.category][0];

            if (data.subcategory !== firstSub) {
                const timer = setTimeout(() => {
                    setData('subcategory', firstSub);
                }, 0);

                return () => clearTimeout(timer);
            }
        }
    }, [data.category, data.subcategory, cseCategoriesTree, setData]);

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...data.options];
        newOptions[idx] = val;
        setData('options', newOptions);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.stem.trim()) {
            return;
        }

        if (data.options.some((opt) => !opt.trim())) {
            return;
        }

        post(questionsStore().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleGenerateAI = async () => {
        generateAbortRef.current?.abort();
        const abortController = new AbortController();
        generateAbortRef.current = abortController;

        setIsGenerating(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '';
            const response = await fetch(questionsGenerate().url, {
                method: 'POST',
                signal: abortController.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    category: aiCategory,
                    subcategory: aiSubcategory,
                    count: aiCount,
                    language: aiLanguage,
                    prompt: aiPrompt,
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(
                    resData.error ||
                        'Failed to generate questions. Please try again.',
                );
            }

            setSuccessMsg(
                resData.message || 'Questions generated successfully! They are saved as drafts and ready for review.',
            );
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                setErrorMsg('Generation canceled.');
            } else {
                setErrorMsg(
                    err.message ||
                        'An error occurred while generating questions.',
                );
            }
        } finally {
            setIsGenerating(false);
            generateAbortRef.current = null;
        }
    };

    const handleCancelAIGeneration = () => {
        generateAbortRef.current?.abort();
        generateAbortRef.current = null;
        setIsGenerating(false);
        setErrorMsg('Generation canceled.');
    };

    useEffect(() => {
        return () => {
            generateAbortRef.current?.abort();
        };
    }, []);

    const aiContent = (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Config panel (7/12 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-7">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-44 w-44 rounded-full bg-blue-500/5 blur-3xl" />

                    <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                        <h2 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
                            <Sparkles className="size-4 animate-pulse text-blue-600" />
                            Configuration Options
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* Category Select */}
                        <SelectField
                            label="Category"
                            value={aiCategory}
                            disabled={isGenerating}
                            onValueChange={setAiCategory}
                            options={Object.keys(cseCategoriesTree)}
                        />

                        {/* Subcategory Select */}
                        <SelectField
                            label="Subcategory"
                            value={aiSubcategory}
                            disabled={isGenerating}
                            onValueChange={setAiSubcategory}
                            options={cseCategoriesTree[aiCategory] || []}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            {/* Count Select */}
                            <SelectField
                                label="Count"
                                value={aiCount}
                                disabled={isGenerating}
                                onValueChange={(val) => setAiCount(Number(val))}
                                options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                    (c) => ({
                                        value: c,
                                        label: `${c} Question${c > 1 ? 's' : ''}`,
                                    }),
                                )}
                            />

                            {/* Language Select */}
                            <SelectField
                                label="Language"
                                value={aiLanguage}
                                disabled={isGenerating}
                                onValueChange={setAiLanguage}
                                options={['English', 'Tagalog']}
                            />
                        </div>

                        {/* Additional Prompting Context */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Additional AI Context (Optional)
                                </label>
                                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                                    Max 250 Chars
                                </span>
                            </div>
                            <textarea
                                value={aiPrompt}
                                disabled={isGenerating}
                                onChange={(e) =>
                                    setAiPrompt(e.target.value.slice(0, 250))
                                }
                                placeholder="E.g., Focus on recent Republic Acts, make options highly tricky, or emphasize logical fallacies..."
                                rows={4}
                                className="w-full rounded-xl border border-border p-4 text-sm font-medium text-foreground transition duration-150 placeholder:text-muted-foreground focus:border-blue-500 focus:bg-background focus:outline-none disabled:opacity-55"
                            />
                        </div>

                        {successMsg && (
                            <div className="border-emerald-250 shadow-3xs flex items-start gap-3 rounded-xl border border-l-4 border-l-emerald-500 bg-emerald-50/40 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                                <CheckCircle2 className="text-emerald-650 mt-0.5 size-4.5 shrink-0" />
                                <div className="flex flex-1 flex-col gap-1.5">
                                    <span className="font-extrabold text-emerald-950">
                                        Questions Generated!
                                    </span>
                                    <span className="leading-relaxed font-semibold text-muted-foreground">
                                        Your questions have been successfully
                                        created and stored as drafts. You can
                                        review and publish them on the Drafts
                                        Review page.
                                    </span>
                                    <Link
                                        href={questionsDrafts().url}
                                        className="mt-1 inline-flex items-center gap-1 font-extrabold text-emerald-700 underline transition hover:text-emerald-900"
                                    >
                                        Go to Drafts Review &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}

                        {errorMsg && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
                                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <div className="pt-2">
                            {isGenerating ? (
                                <div className="shadow-3xs flex flex-col gap-3.5 rounded-xl border border-border bg-muted p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="border-blue-650 size-5.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
                                        <span className="text-sm font-bold text-foreground">
                                            Synthesizing CSE questions via
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
                                    onClick={handleGenerateAI}
                                >
                                    Generate Questions
                                </Button>
                            )}
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
                        Gemini Question Synthesizer
                    </h2>

                    <div className="text-slate-305 space-y-4 text-xs leading-relaxed font-semibold">
                        <div className="flex gap-3.5">
                            <BookOpen className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                            <div>
                                <h4 className="mb-1 font-bold text-slate-200">
                                    Standardized Exam Blueprint
                                </h4>
                                <p className="text-slate-400">
                                    Questions are synthesized directly against
                                    civil service exam guidelines, mapping to
                                    key cognitive difficulty standards (Recall,
                                    Application, Analysis).
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3.5">
                            <Sparkles className="mt-0.5 size-4 shrink-0 text-purple-400" />
                            <div>
                                <h4 className="mb-1 font-bold text-slate-200">
                                    Contextual Prompting
                                </h4>
                                <p className="text-slate-400">
                                    Use the Additional Context block to hone in
                                    on specific review modules—e.g. Philippine
                                    Constitutional amendments, fractions, or
                                    paragraph ordering puzzles.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3.5">
                            <HelpCircle className="mt-0.5 size-4 shrink-0 text-blue-400" />
                            <div>
                                <h4 className="mb-1 font-bold text-slate-200">
                                    Interactive Review Queue
                                </h4>
                                <p className="font-medium text-slate-400">
                                    Once questions are generated, they flow
                                    straight into the{' '}
                                    <strong>Drafts Review Center</strong>,
                                    allowing you to edit and batch-approve them
                                    in a unified dashboard.
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
            className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
        >
            {/* CONTENT EDITORS (8/12 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-8">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <h2 className="mb-4 inline-flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-foreground">
                        <FileText className="size-4.5 text-emerald-600" />
                        Question Content
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label
                                htmlFor="stem"
                                className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                            >
                                Question Stem (Rich Text)
                            </label>
                            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
                                <button
                                    type="button"
                                    className="rounded px-2 py-0.5 text-xs font-black text-muted-foreground transition select-none hover:bg-card"
                                >
                                    B
                                </button>
                                <button
                                    type="button"
                                    className="rounded px-2 py-0.5 text-xs text-muted-foreground italic transition select-none hover:bg-card"
                                >
                                    I
                                </button>
                                <button
                                    type="button"
                                    className="rounded px-2 py-0.5 font-mono text-xs text-muted-foreground transition select-none hover:bg-card"
                                >
                                    List
                                </button>
                                <button
                                    type="button"
                                    className="rounded px-2 py-0.5 text-xs text-muted-foreground transition select-none hover:bg-card"
                                >
                                    Link
                                </button>
                            </div>
                        </div>

                        <textarea
                            id="stem"
                            value={data.stem}
                            onChange={(e) => setData('stem', e.target.value)}
                            rows={6}
                            placeholder="Enter the main question text, scenario, or analytical passage here..."
                            className={`w-full rounded-xl border p-4 text-sm font-medium text-foreground transition placeholder:text-muted-foreground focus:bg-background focus:outline-none ${
                                errors.stem
                                    ? 'border-red-500 focus:border-red-500'
                                    : 'border-border focus:border-blue-500'
                            }`}
                            required
                        />
                        {errors.stem && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                                <AlertCircle className="size-3.5" />
                                {errors.stem}
                            </p>
                        )}
                    </div>
                </div>

                {/* Answer Options Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                        <h2 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
                            <CheckCircle2 className="size-4.5 text-emerald-600" />
                            Answer Options
                        </h2>
                        <span className="bg-blue-550/10 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                            Mark 1 Correct Answer
                        </span>
                    </div>

                    <div className="space-y-4">
                        {data.options.map((option, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-4 rounded-xl border p-3.5 transition duration-200 ${
                                    data.correct_option === idx
                                        ? 'border-emerald-250 bg-emerald-50/20'
                                        : 'border-border'
                                }`}
                            >
                                <label className="flex cursor-pointer items-center">
                                    <input
                                        type="radio"
                                        name="correct_option"
                                        checked={data.correct_option === idx}
                                        onChange={() =>
                                            setData('correct_option', idx)
                                        }
                                        className="size-5 cursor-pointer accent-emerald-600"
                                    />
                                </label>

                                <span
                                    className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                        data.correct_option === idx
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {String.fromCharCode(65 + idx)}
                                </span>

                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) =>
                                        handleOptionChange(idx, e.target.value)
                                    }
                                    placeholder={`Enter option ${String.fromCharCode(65 + idx)} content`}
                                    className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
                                    required
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Explanation Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <h2 className="mb-4 border-b border-border pb-3 text-base font-bold text-foreground">
                        Explanation & Rationale
                    </h2>

                    <div className="space-y-2">
                        <label
                            htmlFor="explanation"
                            className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
                        >
                            Provide the reasoning behind the correct answer
                        </label>
                        <textarea
                            id="explanation"
                            value={data.explanation}
                            onChange={(e) =>
                                setData('explanation', e.target.value)
                            }
                            rows={4}
                            placeholder="Why is this the correct answer? Provide logic constraints, solution steps, or constitutional references..."
                            className={`w-full rounded-xl border p-4 text-sm font-medium text-foreground transition placeholder:text-muted-foreground focus:bg-background focus:outline-none ${
                                errors.explanation
                                    ? 'border-red-500'
                                    : 'border-slate-200 focus:border-blue-500'
                            }`}
                            required
                        />
                        {errors.explanation && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                                <AlertCircle className="size-3.5" />
                                {errors.explanation}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* METADATA, ATTACHMENT & SUBMISSIONS (4/12 cols) */}
            <div className="flex flex-col gap-6 lg:col-span-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <h2 className="mb-4 border-b border-slate-100 pb-3 text-base font-bold">
                        Metadata
                    </h2>

                    <div className="space-y-4">
                        {/* Category Select */}
                        <SelectField
                            label="Category"
                            value={data.category}
                            onValueChange={(val) => setData('category', val)}
                            options={Object.keys(cseCategoriesTree)}
                        />

                        {/* Subcategory Select */}
                        <SelectField
                            label="Subcategory"
                            value={data.subcategory}
                            onValueChange={(val) => setData('subcategory', val)}
                            options={cseCategoriesTree[data.category] || []}
                        />

                        {/* Language Select */}
                        <SelectField
                            label="Language"
                            value={data.language}
                            onValueChange={(val) => setData('language', val)}
                            options={['English', 'Tagalog']}
                        />

                        {/* Status Toggles */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Default Status
                            </label>
                            <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted p-1">
                                <button
                                    type="button"
                                    onClick={() => setData('status', 'active')}
                                    className={`cursor-pointer rounded-lg py-2 text-xs font-bold transition ${
                                        data.status === 'active'
                                            ? 'bg-card text-foreground shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    Active / Live
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('status', 'draft')}
                                    className={`cursor-pointer rounded-lg py-2 text-xs font-bold transition ${
                                        data.status === 'draft'
                                            ? 'bg-white text-slate-900 shadow-xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Draft
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submission Actions */}
                <div className="flex flex-col gap-3">
                    <Button
                        type="submit"
                        variant="success"
                        size="lg"
                        fullWidth
                        loading={processing}
                        icon={Save}
                    >
                        Save Question
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        fullWidth
                        icon={RotateCcw}
                        onClick={() => {
                            reset();
                            router.visit(questionsIndex().url);
                        }}
                    >
                        Cancel Entry
                    </Button>
                </div>
            </div>
        </form>
    );

    return (
        <>
            <Head title="Create Question" />
            <CurationCreateShell
                title={
                    activeTab === 'ai'
                        ? 'AI Question Generator'
                        : 'Manual Question Entry'
                }
                description={
                    activeTab === 'ai'
                        ? 'Configure parameters to generate new exam questions.'
                        : 'Create high-quality exam items with structured metadata and clear rationales.'
                }
                backUrl={questionsIndex().url}
                backLabel="Back to Question Management"
                activeTab={activeTab}
                onTabChange={setActiveTab}
                aiContent={aiContent}
                manualContent={manualContent}
            />
        </>
    );
}

CreateQuestion.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex().url,
        },
        {
            title: 'Create Question',
        },
    ],
};
