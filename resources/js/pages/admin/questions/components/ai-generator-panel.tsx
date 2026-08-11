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
    aiSymbolicVariety: string;
    setAiSymbolicVariety: (val: string) => void;
    aiDataVariety: string;
    setAiDataVariety: (val: string) => void;
    aiAnalogyVariety: string;
    setAiAnalogyVariety: (val: string) => void;
    aiBasicOperationsVariety: string;
    setAiBasicOperationsVariety: (val: string) => void;
    aiWordProblemVariety: string;
    setAiWordProblemVariety: (val: string) => void;
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
    aiSymbolicVariety,
    setAiSymbolicVariety,
    aiDataVariety,
    setAiDataVariety,
    aiAnalogyVariety,
    setAiAnalogyVariety,
    aiBasicOperationsVariety,
    setAiBasicOperationsVariety,
    aiWordProblemVariety,
    setAiWordProblemVariety,
    isGenerating,
    errorMsg,
    successMsg,
    cseCategoriesTree,
    handleGenerateAI,
    handleCancelAIGeneration,
}: AIGeneratorPanelProps) {
    const [showCountDropdown, setShowCountDropdown] = React.useState(false);

    return (
        <div className="grid grid-cols-1 items-start gap-3 sm:gap-6">
            {/* Config panel */}
            <div className="flex flex-col gap-3 sm:gap-6">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-6">
                    <div className="pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 h-44 w-44 rounded-full bg-blue-500/5 blur-3xl" />

                    <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                        <h2 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
                            <Sparkles className="size-4 animate-pulse text-blue-600 dark:text-blue-400" />
                            Configuration Options
                        </h2>
                        
                        <Dialog>
                            <DialogTrigger asChild>
                                <button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50">
                                    <HelpCircle className="size-3" />
                                    How it works
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md border-blue-200 bg-gradient-to-br from-blue-50 to-slate-50 dark:border-blue-900/40 dark:from-slate-950 dark:to-slate-900">
                                <DialogHeader>
                                    <DialogTitle className="inline-flex items-center gap-2">
                                        <Cpu className="size-5 text-blue-500" />
                                        AI Question Generator
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-600 dark:text-slate-400">
                                        The AI generator uses advanced language models tailored specifically for the Philippine Civil Service Exam to create challenging and diverse questions.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-2">
                                    <div className="space-y-3 rounded-lg border border-slate-200 bg-white/50 p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900/50">
                                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <BookOpen className="size-3.5 text-indigo-500" />
                                            Supported Models
                                        </h4>
                                        <ul className="space-y-2 text-[13px]">
                                            <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                                                <div className="mt-0.5 rounded bg-indigo-100 p-0.5 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                    <Sparkle className="size-3" />
                                                </div>
                                                <span className="leading-snug"><strong className="font-semibold text-slate-800 dark:text-slate-200">Gemini 1.5 Flash:</strong> Fast and efficient model, perfect for standard questions like vocabulary, math, and general information.</span>
                                            </li>
                                            <li className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                                                <div className="mt-0.5 rounded bg-blue-100 p-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Sparkle className="size-3" />
                                                </div>
                                                <span className="leading-snug"><strong className="font-semibold text-slate-800 dark:text-slate-200">Gemini 1.5 Pro:</strong> Advanced reasoning model. Recommended for complex logical puzzles, data interpretation, and reading comprehension.</span>
                                            </li>
                                        </ul>
                                    </div>
                                    
                                    <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 shadow-xs dark:border-emerald-900/20 dark:bg-emerald-900/10">
                                        <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle2 className="size-3.5" />
                                            Best Practices
                                        </h4>
                                        <ul className="space-y-2 text-[13px] text-emerald-700/80 dark:text-emerald-400/80">
                                            <li className="flex items-start gap-1.5">
                                                <span className="mt-1 size-1 shrink-0 rounded-full bg-emerald-400" />
                                                <span className="leading-tight">Generated questions are saved as drafts first. Review them carefully before publishing.</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="mt-1 size-1 shrink-0 rounded-full bg-emerald-400" />
                                                <span className="leading-tight">Use the "Custom Prompt" field to steer the AI (e.g., "Make the word problems about agriculture").</span>
                                            </li>
                                            <li className="flex items-start gap-1.5">
                                                <span className="mt-1 size-1 shrink-0 rounded-full bg-emerald-400" />
                                                <span className="leading-tight">Batch generate up to 20 questions at a time for optimal quality and speed.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
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

                        {/* Word Analogy format select - dynamic */}
                        {aiSubcategory === 'Word analogy' && (
                            <SelectField
                                label="Analogy Relationship Variety"
                                value={aiAnalogyVariety}
                                disabled={isGenerating}
                                onValueChange={setAiAnalogyVariety}
                                options={[
                                    {
                                        value: 'all',
                                        label: 'Random / All Categories',
                                    },
                                    {
                                        value: 'function',
                                        label: 'Function (e.g., Tool : Action)',
                                    },
                                    {
                                        value: 'degree',
                                        label: 'Degree (e.g., Warm : Hot)',
                                    },
                                    {
                                        value: 'characteristics',
                                        label: 'Characteristics (e.g., Sugar : Sweet)',
                                    },
                                    {
                                        value: 'part_whole',
                                        label: 'Part of a Whole (e.g., Wheel : Car)',
                                    },
                                    {
                                        value: 'synonyms_antonyms',
                                        label: 'Synonyms / Antonyms',
                                    },
                                    {
                                        value: 'classification',
                                        label: 'Classification (e.g., Apple : Fruit)',
                                    },
                                ]}
                            />
                        )}

                        {/* Symbolic reasoning format select - dynamic */}
                        {aiSubcategory ===
                            'Symbolic logic / abstract reasoning' && (
                            <SelectField
                                label="Abstract Reasoning Format"
                                value={aiSymbolicVariety}
                                disabled={isGenerating}
                                onValueChange={setAiSymbolicVariety}
                                options={[
                                    {
                                        value: 'all',
                                        label: 'Random / Mixed Formats',
                                    },
                                    {
                                        value: 'format_a',
                                        label: 'Format A: Grid-based Logical Matrix (Visual)',
                                    },
                                    {
                                        value: 'format_b',
                                        label: 'Format B: Sequence Puzzle (Visual)',
                                    },
                                    {
                                        value: 'format_c',
                                        label: 'Format C: Visual Analogy (Visual)',
                                    },
                                    {
                                        value: 'format_d',
                                        label: 'Format D: Rotation/Reflection Grid (Visual)',
                                    },
                                    {
                                        value: 'format_e',
                                        label: 'Format E: Odd One Out / Classification (Visual)',
                                    },
                                    {
                                        value: 'format_f',
                                        label: 'Format F: Cube Folding / 3D Net (Visual)',
                                    },
                                    {
                                        value: 'format_g',
                                        label: 'Format G: Dot Placement / Intersection (Visual)',
                                    },
                                    {
                                        value: 'format_h',
                                        label: 'Format H: Mirror/Water Reflections (Visual)',
                                    },
                                    {
                                        value: 'format_i',
                                        label: 'Format I: Categorical Syllogism (Text-based)',
                                    },
                                    {
                                        value: 'format_j',
                                        label: 'Format J: Conditional Syllogism (Text-based)',
                                    },
                                    {
                                        value: 'format_k',
                                        label: 'Format K: Disjunctive Syllogism (Text-based)',
                                    },
                                    {
                                        value: 'format_l',
                                        label: 'Format L: Alphanumeric and Symbol Sequence (Text-based)',
                                    },
                                    {
                                        value: 'format_m',
                                        label: 'Format M: Coding and Decoding (Text-based)',
                                    },
                                ]}
                            />
                        )}

                        {/* Data interpretation format select - dynamic */}
                        {aiSubcategory === 'Data interpretation' && (
                            <SelectField
                                label="Data Interpretation Variety"
                                value={aiDataVariety}
                                disabled={isGenerating}
                                onValueChange={setAiDataVariety}
                                options={[
                                    {
                                        value: 'all',
                                        label: 'Random / All Formats',
                                    },
                                    {
                                        value: 'format_a',
                                        label: 'Format A: Bar Chart',
                                    },
                                    {
                                        value: 'format_b',
                                        label: 'Format B: Line Graph',
                                    },
                                    {
                                        value: 'format_c',
                                        label: 'Format C: Pie/Donut Chart',
                                    },
                                    {
                                        value: 'format_d',
                                        label: 'Format D: Formatted Table',
                                    },
                                    {
                                        value: 'format_e',
                                        label: 'Format E: Combined Table and Chart',
                                    },
                                ]}
                            />
                        )}

                        {/* Basic operations format select - dynamic */}
                        {aiSubcategory === 'Basic operations' && (
                            <SelectField
                                label="Basic Operations Variety"
                                value={aiBasicOperationsVariety}
                                disabled={isGenerating}
                                onValueChange={setAiBasicOperationsVariety}
                                options={[
                                    { value: 'all', label: 'Random / All Formats' },
                                    { value: 'mdas', label: 'MDAS/PEMDAS' },
                                    { value: 'fractions', label: 'Fractions' },
                                    { value: 'decimals', label: 'Decimals' },
                                    { value: 'percentages', label: 'Percentages' },
                                ]}
                            />
                        )}

                        {/* Word problems format select - dynamic */}
                        {aiSubcategory === 'Word problems' && (
                            <SelectField
                                label="Word Problem Variety"
                                value={aiWordProblemVariety}
                                disabled={isGenerating}
                                onValueChange={setAiWordProblemVariety}
                                options={[
                                    { value: 'all', label: 'Random / All Formats' },
                                    { value: 'age', label: 'Age Problems' },
                                    { value: 'work', label: 'Work/Time Problems' },
                                    { value: 'motion', label: 'Motion Problems (Distance-Rate-Time)' },
                                    { value: 'ratio', label: 'Ratio and Proportion' },
                                    { value: 'mixture', label: 'Mixture Problems' },
                                    { value: 'finance', label: 'Finance (Simple Interest, Discounts)' },
                                ]}
                            />
                        )}

                        <div
                            className={
                                aiCategory === 'Verbal Ability' || aiSubcategory === 'Word analogy'
                                    ? 'grid grid-cols-2 gap-4'
                                    : 'w-full'
                            }
                        >
                            {/* Count Single Input with Focus Dropdown */}
                            <div className="relative flex w-full flex-col gap-1.5">
                                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Count
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={aiCount || ''}
                                    disabled={isGenerating}
                                    onFocus={() => setShowCountDropdown(true)}
                                    onClick={() => setShowCountDropdown(true)}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setAiCount(isNaN(val) ? 0 : val);
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowCountDropdown(false), 200);
                                        let val = aiCount;

                                        if (isNaN(val) || val < 1) {
                                            val = 1;
                                        }

                                        if (val > 20) {
                                            val = 20;
                                        }

                                        setAiCount(val);
                                    }}
                                    placeholder="Enter count (1-20)"
                                />

                                {showCountDropdown && !isGenerating && (
                                    <div className="absolute top-full left-0 z-50 mt-1 flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card p-1 shadow-lg dark:bg-slate-950">
                                        <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                            Common Presets
                                        </div>
                                        {[1, 5, 10, 15, 20].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setAiCount(num);
                                                    setShowCountDropdown(false);
                                                }}
                                                className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-colors hover:bg-primary/10 hover:text-primary ${
                                                    aiCount === num
                                                        ? 'bg-primary/15 font-black text-primary'
                                                        : 'text-foreground'
                                                }`}
                                            >
                                                <span>{num} {num === 1 ? 'Question' : 'Questions'}</span>
                                                {aiCount === num && (
                                                    <span className="text-[10px] font-black uppercase text-primary">Selected</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Language Select */}
                            {(aiCategory === 'Verbal Ability' || aiSubcategory === 'Word analogy') && (
                                <SelectField
                                    label="Language"
                                    value={aiLanguage}
                                    disabled={isGenerating}
                                    onValueChange={setAiLanguage}
                                    options={['English', 'Tagalog']}
                                />
                            )}
                        </div>

                        {/* Model Select */}
                        <div className="flex w-full flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                    Primary AI Model
                                </label>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <button
                                            type="button"
                                            className="group inline-flex cursor-pointer items-center gap-1 text-[10px] font-bold tracking-wider text-blue-500 uppercase underline transition-all transition-colors duration-300 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
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
                                options={[
                                    {
                                        value: 'gemini-3.6-flash',
                                        label: 'Google Gemini 3.6 Flash (Latest)',
                                    },
                                    {
                                        value: 'gemini-3.5-flash',
                                        label: 'Google Gemini 3.5 Flash (Best for CSE & SVGs)',
                                    },
                                    {
                                        value: 'llama-3.3-70b-versatile',
                                        label: 'Groq LLaMA 3.3 70B (High Reasoning)',
                                    },
                                    {
                                        value: 'gemini-2.5-flash',
                                        label: 'Google Gemini 2.5 Flash',
                                    },
                                    {
                                        value: 'mixtral-8x7b-32768',
                                        label: 'Groq Mixtral 8x7B',
                                    },
                                    {
                                        value: 'gemma2-9b-it',
                                        label: 'Groq Gemma 2 9B',
                                    },
                                    {
                                        value: 'llama-3.1-8b-instant',
                                        label: 'Groq LLaMA 3.1 8B (Fast)',
                                    },
                                ]}
                            />
                        </div>

                        {/* Additional Prompting Context */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    Additional AI Context (Optional)
                                </label>
                            </div>
                            <textarea
                                value={aiPrompt}
                                disabled={isGenerating}
                                onChange={(e) =>
                                    setAiPrompt(e.target.value)
                                }
                                placeholder="E.g., Focus on recent Republic Acts, make options highly tricky, or emphasize logical fallacies..."
                                rows={4}
                                className="w-full rounded-xl border border-border p-4 text-sm font-medium text-foreground transition duration-150 placeholder:text-muted-foreground focus:border-blue-500 focus:bg-background focus:outline-none disabled:opacity-55"
                            />
                        </div>

                        {successMsg && (
                            <div className="border-emerald-250 shadow-3xs dark:bg-emerald-950/30/40 flex items-start gap-3 rounded-xl border border-l-4 border-l-emerald-500 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-950/20">
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
                                        className="group mt-1 inline-flex items-center gap-1 font-extrabold text-emerald-700 underline transition transition-all duration-300 hover:text-emerald-900 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
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
        </div>
    );
}
