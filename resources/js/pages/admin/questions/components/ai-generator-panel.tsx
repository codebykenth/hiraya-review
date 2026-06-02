import { Link } from '@inertiajs/react';
import {
    Sparkles,
    Sparkle,
    Cpu,
    BookOpen,
    HelpCircle,
    CheckCircle2,
    AlertCircle,
    RotateCcw,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select';
import { drafts as questionsDrafts } from '@/routes/questions';

interface AIGeneratorPanelProps {
    aiCategory: string;
    setAiCategory: (val: string) => void;
    aiSubcategory: string;
    setAiSubcategory: (val: string) => void;
    aiCount: number;
    setAiCount: (val: number) => void;
    aiLanguage: string;
    setAiLanguage: (val: string) => void;
    aiPrimaryModel: string;
    setAiPrimaryModel: (val: string) => void;
    aiPrompt: string;
    setAiPrompt: (val: string) => void;
    isGenerating: boolean;
    errorMsg: string | null;
    successMsg: string | null;
    cseCategoriesTree: Record<string, string[]>;
    handleGenerateAI: () => void;
    handleCancelAIGeneration: () => void;
}

export function AIGeneratorPanel({
    aiCategory,
    setAiCategory,
    aiSubcategory,
    setAiSubcategory,
    aiCount,
    setAiCount,
    aiLanguage,
    setAiLanguage,
    aiPrimaryModel,
    setAiPrimaryModel,
    aiPrompt,
    setAiPrompt,
    isGenerating,
    errorMsg,
    successMsg,
    cseCategoriesTree,
    handleGenerateAI,
    handleCancelAIGeneration,
}: AIGeneratorPanelProps) {
    return (
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

                        {/* Model Select */}
                        <SelectField
                            label="Primary AI Model"
                            value={aiPrimaryModel}
                            disabled={isGenerating}
                            onValueChange={setAiPrimaryModel}
                            options={[
                                {
                                    value: 'llama-3.3-70b-versatile',
                                    label: 'Groq LLaMA 3.3 70B (Versatile)',
                                },
                                {
                                    value: 'openai/gpt-oss-120b',
                                    label: 'Groq GPT-OSS 120B',
                                },
                                {
                                    value: 'gemini-2.0-pro-exp',
                                    label: 'Google Gemini 2.0 Pro (Exp)',
                                },
                                {
                                    value: 'gemini-1.5-pro',
                                    label: 'Google Gemini 1.5 Pro',
                                },
                                {
                                    value: 'gemini-3.5-flash',
                                    label: 'Google Gemini 3.5 Flash',
                                },
                                {
                                    value: 'gemini-2.0-flash-thinking-exp',
                                    label: 'Google Gemini 2.0 Flash Thinking',
                                },
                                {
                                    value: 'gemini-2.0-flash',
                                    label: 'Google Gemini 2.0 Flash',
                                },
                                {
                                    value: 'qwen/qwen3-32b',
                                    label: 'Groq Qwen 3 32B',
                                },
                                {
                                    value: 'openai/gpt-oss-20b',
                                    label: 'Groq GPT-OSS 20B',
                                },
                                {
                                    value: 'meta-llama/llama-4-scout-17b-16e-instruct',
                                    label: 'Groq LLaMA 4 Scout 17B',
                                },
                                {
                                    value: 'gemini-1.5-flash',
                                    label: 'Google Gemini 1.5 Flash',
                                },
                                {
                                    value: 'gemini-1.5-flash-8b',
                                    label: 'Google Gemini 1.5 Flash 8B',
                                },
                                {
                                    value: 'llama-3.1-8b-instant',
                                    label: 'Groq LLaMA 3.1 8B (Instant)',
                                },
                                {
                                    value: 'allam-2-7b',
                                    label: 'Groq Allam 2 7B',
                                },
                                {
                                    value: 'canopylabs/orpheus-v1-english',
                                    label: 'Groq Orpheus v1 English',
                                },
                                {
                                    value: 'groq/compound',
                                    label: 'Groq Compound',
                                },
                                {
                                    value: 'groq/compound-mini',
                                    label: 'Groq Compound Mini',
                                },
                            ]}
                        />

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
                        AI Question Synthesizer
                    </h2>

                    <div className="space-y-4 text-xs leading-relaxed font-semibold text-slate-300">
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
}
