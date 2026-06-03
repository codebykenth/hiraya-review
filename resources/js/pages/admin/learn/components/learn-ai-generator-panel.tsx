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
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import { drafts as adminLearnDrafts } from '@/routes/admin/learn';
import type { Category, Subcategory } from '../types';

const aiModelOptions = [
    {
        value: 'gemini-3.5-flash',
        label: 'Google Gemini 3.5 Flash (Best for CSE & SVGs)',
    },
    {
        value: 'llama-3.3-70b-versatile',
        label: 'Groq LLaMA 3.3 70B (High Reasoning)',
    },
    { value: 'gemini-2.5-flash', label: 'Google Gemini 2.5 Flash' },
    { value: 'mixtral-8x7b-32768', label: 'Groq Mixtral 8x7B' },
    { value: 'gemma2-9b-it', label: 'Groq Gemma 2 9B' },
    { value: 'llama-3.1-8b-instant', label: 'Groq LLaMA 3.1 8B (Fast)' },
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

                        <div className="flex w-full flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Primary AI Model
                                </label>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button
                                            type="button"
                                            className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-bold tracking-wider text-blue-500 uppercase underline transition-colors hover:text-blue-700"
                                        >
                                            <HelpCircle className="size-3" />
                                            Which model to use?
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-xl">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Best Model Recommendations
                                            </DialogTitle>
                                            <DialogDescription>
                                                Select the best model depending
                                                on the category or subcategory
                                                you are generating.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="mt-4 space-y-4 text-xs leading-relaxed font-semibold">
                                            <div className="max-h-[400px] overflow-hidden overflow-y-auto rounded-xl border border-border">
                                                <table className="w-full border-collapse text-left">
                                                    <thead className="sticky top-0 z-10 border-b border-border bg-muted font-bold">
                                                        <tr>
                                                            <th className="text-slate-705 dark:text-slate-350 p-3">
                                                                Category
                                                            </th>
                                                            <th className="text-slate-705 dark:text-slate-350 p-3">
                                                                Subcategory
                                                            </th>
                                                            <th className="text-slate-705 dark:text-slate-350 p-3">
                                                                Best Model
                                                            </th>
                                                            <th className="text-slate-705 dark:text-slate-350 p-3">
                                                                Why?
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border text-foreground">
                                                        {/* Analytical Ability */}
                                                        <tr className="bg-blue-500/5">
                                                            <td
                                                                className="p-3 font-bold"
                                                                rowSpan={4}
                                                            >
                                                                Analytical
                                                                Ability
                                                            </td>
                                                            <td className="p-3 font-bold">
                                                                Symbolic logic /
                                                                abstract
                                                                reasoning
                                                            </td>
                                                            <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                                                                Google Gemini
                                                                3.5 Flash
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Mandates raw,
                                                                visual-spatial
                                                                SVG rendering.
                                                                Groq models lack
                                                                vision
                                                                coordinate
                                                                mapping and will
                                                                output broken
                                                                shapes.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-blue-500/5">
                                                            <td className="p-3 font-bold">
                                                                Data
                                                                interpretation
                                                            </td>
                                                            <td className="p-3 font-bold text-blue-600 dark:text-blue-400">
                                                                Google Gemini
                                                                3.5 Flash
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Requires
                                                                rendering
                                                                coordinate axes,
                                                                lines, pie
                                                                slices, or bar
                                                                charts via SVG
                                                                code.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-blue-500/5">
                                                            <td className="p-3 font-bold">
                                                                Word analogy
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Superb semantic
                                                                understanding of
                                                                word
                                                                relationship
                                                                pairs.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-blue-500/5">
                                                            <td className="p-3 font-bold">
                                                                Identifying
                                                                assumptions &
                                                                conclusions
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Excellent
                                                                deductive logic
                                                                capabilities for
                                                                detecting
                                                                unstated
                                                                premises and
                                                                drawing valid
                                                                inferences.
                                                            </td>
                                                        </tr>
                                                        {/* Numerical Ability */}
                                                        <tr className="bg-amber-500/5">
                                                            <td
                                                                className="p-3 font-bold"
                                                                rowSpan={3}
                                                            >
                                                                Numerical
                                                                Ability
                                                            </td>
                                                            <td className="p-3 font-bold">
                                                                Basic operations
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Best at
                                                                step-by-step
                                                                arithmetic
                                                                breakdowns and
                                                                formatting math
                                                                formulas.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-amber-500/5">
                                                            <td className="p-3 font-bold">
                                                                Number sequence
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Accurately
                                                                identifies
                                                                mathematical
                                                                patterns (+3,
                                                                x2, fibonacci)
                                                                and explains
                                                                them clearly.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-amber-500/5">
                                                            <td className="p-3 font-bold">
                                                                Word problems
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Superb at
                                                                interpreting
                                                                word-based math
                                                                scenarios (work
                                                                rates, age
                                                                problems) and
                                                                generating
                                                                logical
                                                                equations.
                                                            </td>
                                                        </tr>
                                                        {/* General Information */}
                                                        <tr className="bg-emerald-500/5">
                                                            <td
                                                                className="p-3 font-bold"
                                                                rowSpan={4}
                                                            >
                                                                General
                                                                Information
                                                            </td>
                                                            <td className="p-3 font-bold">
                                                                Philippine
                                                                Constitution
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Outstanding
                                                                recall of
                                                                historical legal
                                                                texts and
                                                                specific
                                                                Articles/Sections
                                                                of the 1987
                                                                Constitution.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-emerald-500/5">
                                                            <td className="p-3 font-bold">
                                                                Code of Conduct
                                                                (R.A. 6713)
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Accurately
                                                                interprets
                                                                ethical
                                                                scenarios,
                                                                norms, duties,
                                                                and prohibitions
                                                                for public
                                                                officials.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-emerald-500/5">
                                                            <td className="p-3 font-bold">
                                                                Peace and Human
                                                                Rights
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Strong
                                                                understanding of
                                                                international
                                                                treaties, human
                                                                rights
                                                                principles, and
                                                                peace concepts.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-emerald-500/5">
                                                            <td className="p-3 font-bold">
                                                                Environment
                                                                Management
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                High recall of
                                                                global
                                                                environment
                                                                protection
                                                                agreements and
                                                                national
                                                                environmental
                                                                acts.
                                                            </td>
                                                        </tr>
                                                        {/* Verbal Ability */}
                                                        <tr className="bg-purple-500/5">
                                                            <td
                                                                className="p-3 font-bold"
                                                                rowSpan={6}
                                                            >
                                                                Verbal Ability
                                                            </td>
                                                            <td className="p-3 font-bold">
                                                                Word meaning
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Exceptional
                                                                contextual
                                                                vocabulary
                                                                mapping and
                                                                distractor
                                                                choices
                                                                generation.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-purple-500/5">
                                                            <td className="p-3 font-bold">
                                                                Sentence
                                                                completion
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Excellent
                                                                understanding of
                                                                logical flow,
                                                                tenses, and
                                                                context clues.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-purple-500/5">
                                                            <td className="p-3 font-bold">
                                                                Error
                                                                recognition
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Strong grammar
                                                                parser. Easily
                                                                finds
                                                                subject-verb
                                                                disagreements or
                                                                incorrect
                                                                modifiers.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-purple-500/5">
                                                            <td className="p-3 font-bold">
                                                                Sentence
                                                                structure
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Deep syntactic
                                                                logic to
                                                                evaluate
                                                                phrasing
                                                                alternatives and
                                                                structure
                                                                errors.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-purple-500/5">
                                                            <td className="p-3 font-bold">
                                                                Paragraph
                                                                organization
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Highly skilled
                                                                at determining
                                                                structural
                                                                chronology and
                                                                cohesive logical
                                                                flow in
                                                                sentences.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-purple-500/5">
                                                            <td className="p-3 font-bold">
                                                                Reading
                                                                comprehension
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Can synthesize
                                                                longer essays,
                                                                evaluate central
                                                                themes, and
                                                                design accurate
                                                                comprehension
                                                                questions.
                                                            </td>
                                                        </tr>
                                                        {/* Clerical Ability */}
                                                        <tr className="bg-rose-500/5">
                                                            <td
                                                                className="p-3 font-bold"
                                                                rowSpan={2}
                                                            >
                                                                Clerical Ability
                                                            </td>
                                                            <td className="p-3 font-bold">
                                                                Filing
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Excellent
                                                                alphabetical
                                                                logic, indexing
                                                                compliance, and
                                                                filing rule
                                                                accuracy.
                                                            </td>
                                                        </tr>
                                                        <tr className="bg-rose-500/5">
                                                            <td className="p-3 font-bold">
                                                                Spelling
                                                            </td>
                                                            <td className="p-3 font-bold text-purple-600 dark:text-purple-400">
                                                                Groq LLaMA 3.3
                                                                70B
                                                            </td>
                                                            <td className="p-3 text-muted-foreground">
                                                                Best at
                                                                identifying
                                                                commonly
                                                                misspelled words
                                                                and creating
                                                                spelling
                                                                options.
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <SelectField
                                value={aiPrimaryModel}
                                disabled={isGenerating}
                                onValueChange={setAiPrimaryModel}
                                options={aiModelOptions}
                            />
                        </div>

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
