import { Link } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    Cpu,
    HelpCircle,
    RotateCcw,
    Sparkle,
    Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import { drafts as adminLearnDrafts } from '@/routes/admin/learn';
import type { Category, Subcategory } from '../types';

const aiModelOptions = [
    {
        value: 'llama-3.3-70b-versatile',
        label: 'Groq LLaMA 3.3 70B (Versatile)',
    },
    { value: 'openai/gpt-oss-120b', label: 'Groq GPT-OSS 120B' },
    { value: 'gemini-2.0-pro-exp', label: 'Google Gemini 2.0 Pro (Exp)' },
    { value: 'gemini-1.5-pro', label: 'Google Gemini 1.5 Pro' },
    { value: 'gemini-3.5-flash', label: 'Google Gemini 3.5 Flash' },
    {
        value: 'gemini-2.0-flash-thinking-exp',
        label: 'Google Gemini 2.0 Flash Thinking',
    },
    { value: 'gemini-2.0-flash', label: 'Google Gemini 2.0 Flash' },
    { value: 'qwen/qwen3-32b', label: 'Groq Qwen 3 32B' },
    { value: 'openai/gpt-oss-20b', label: 'Groq GPT-OSS 20B' },
    {
        value: 'meta-llama/llama-4-scout-17b-16e-instruct',
        label: 'Groq LLaMA 4 Scout 17B',
    },
    { value: 'gemini-1.5-flash', label: 'Google Gemini 1.5 Flash' },
    { value: 'gemini-1.5-flash-8b', label: 'Google Gemini 1.5 Flash 8B' },
    { value: 'llama-3.1-8b-instant', label: 'Groq LLaMA 3.1 8B (Instant)' },
    { value: 'allam-2-7b', label: 'Groq Allam 2 7B' },
    {
        value: 'canopylabs/orpheus-v1-english',
        label: 'Groq Orpheus v1 English',
    },
    { value: 'groq/compound', label: 'Groq Compound' },
    { value: 'groq/compound-mini', label: 'Groq Compound Mini' },
];

interface LearnAIGeneratorPanelProps {
    categories: Category[];
    activeSubcategories: Subcategory[];
    selectedCategoryName: string;
    selectedSubcategoryName: string;
    handleCategoryChange: (catName: string) => void;
    handleSubcategoryChange: (subName: string) => void;
    aiTopic: string;
    setAiTopic: (val: string) => void;
    aiPrompt: string;
    setAiPrompt: (val: string) => void;
    aiPrimaryModel: string;
    setAiPrimaryModel: (val: string) => void;
    isGenerating: boolean;
    generationError: string | null;
    successMsg: string | null;
    triggerAIGeneration: () => void;
    handleCancelAIGeneration: () => void;
}

export function LearnAIGeneratorPanel({
    categories,
    activeSubcategories,
    selectedCategoryName,
    selectedSubcategoryName,
    handleCategoryChange,
    handleSubcategoryChange,
    aiTopic,
    setAiTopic,
    aiPrompt,
    setAiPrompt,
    aiPrimaryModel,
    setAiPrimaryModel,
    isGenerating,
    generationError,
    successMsg,
    triggerAIGeneration,
    handleCancelAIGeneration,
}: LearnAIGeneratorPanelProps) {
    return (
        <div className="grid max-w-7xl grid-cols-1 items-start gap-6 lg:grid-cols-12">
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

                        <SelectField
                            label="Primary AI Model"
                            value={aiPrimaryModel}
                            disabled={isGenerating}
                            onValueChange={setAiPrimaryModel}
                            options={aiModelOptions}
                        />

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
                                        to the database as a draft.
                                    </span>
                                    <Link
                                        href={adminLearnDrafts().url}
                                        className="mt-1 inline-flex items-center gap-1 font-extrabold text-emerald-700 underline transition hover:text-emerald-900"
                                    >
                                        Review Drafts &rarr;
                                    </Link>
                                </div>
                            </div>
                        )}

                        {generationError && (
                            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800">
                                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                                <span>{generationError}</span>
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

            <div className="flex flex-col gap-6 lg:col-span-5">
                <div className="border-slate-250 relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-950 to-slate-900 p-6 text-white shadow-md">
                    <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-blue-600/10 blur-2xl" />
                    <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-emerald-600/5 blur-3xl" />

                    <h2 className="mb-4 inline-flex w-full items-center gap-2 border-b border-white/10 pb-4.5 text-base font-extrabold tracking-tight">
                        <Cpu className="size-4.5 text-blue-400" />
                        AI Lesson Writer
                    </h2>

                    <div className="space-y-4 text-xs leading-relaxed font-semibold text-slate-300">
                        <div className="flex gap-3.5">
                            <BookOpen className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                            <div>
                                <h4 className="mb-1 font-bold text-slate-200">
                                    Standardized CSC Curriculum
                                </h4>
                                <p className="text-slate-400">
                                    Generated lessons conform fully to
                                    Philippine Civil Service syllabus standards.
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
                                    Gemini outputs Markdown tables, code blocks,
                                    numbered formulas, and clear headers for
                                    readability.
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
                                    Every AI generation ends with realistic
                                    multiple-choice quick checks and
                                    explanations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
