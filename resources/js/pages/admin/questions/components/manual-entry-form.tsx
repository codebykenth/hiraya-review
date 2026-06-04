import { router } from '@inertiajs/react';
import { FileText, CheckCircle2, Save, RotateCcw } from 'lucide-react';
import React from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select';
import { index as questionsIndex } from '@/routes/questions';

interface ManualEntryFormProps {
    data: {
        stem: string;
        category: string;
        subcategory: string;
        language: string;
        options: string[];
        correct_option: number;
        explanation: string;
        status: 'active' | 'draft';
    };
    setData: any;
    errors: Record<string, string>;
    processing: boolean;
    reset: () => void;
    handleOptionChange: (idx: number, val: string) => void;
    isDemographic: boolean;
    handleManualSubmit: (e: React.FormEvent) => void;
    cseCategoriesTree: Record<string, string[]>;
}

export function ManualEntryForm({
    data,
    setData,
    errors,
    processing,
    reset,
    handleOptionChange,
    isDemographic,
    handleManualSubmit,
    cseCategoriesTree,
}: ManualEntryFormProps) {
    return (
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
                        <InputError
                            message={errors.stem}
                            className="mt-1 text-xs font-semibold"
                        />
                    </div>
                </div>

                {/* Answer Options Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                        <h2 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
                            <CheckCircle2 className="size-4.5 text-emerald-600" />
                            Answer Options
                        </h2>
                        {!isDemographic && (
                            <span className="bg-blue-550/10 inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-700 uppercase">
                                Mark 1 Correct Answer
                            </span>
                        )}
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
                                {!isDemographic && (
                                    <label className="flex cursor-pointer items-center">
                                        <input
                                            type="radio"
                                            name="correct_option"
                                            checked={
                                                data.correct_option === idx
                                            }
                                            onChange={() =>
                                                setData('correct_option', idx)
                                            }
                                            className="size-5 cursor-pointer accent-emerald-600"
                                        />
                                    </label>
                                )}

                                <span
                                    className={`inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                        !isDemographic &&
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
                                    required={!isDemographic || idx < 2}
                                />
                            </div>
                        ))}
                    </div>
                    <InputError
                        message={errors.options}
                        className="mt-2 text-xs font-semibold"
                    />
                    <InputError
                        message={errors.correct_option}
                        className="mt-2 text-xs font-semibold"
                    />
                </div>

                {/* Explanation Card */}
                {!isDemographic && (
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
                            <InputError
                                message={errors.explanation}
                                className="mt-1 text-xs font-semibold"
                            />
                        </div>
                    </div>
                )}
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
                        <div className="flex flex-col gap-1">
                            <SelectField
                                label="Subcategory"
                                value={data.subcategory}
                                onValueChange={(val) =>
                                    setData('subcategory', val)
                                }
                                options={cseCategoriesTree[data.category] || []}
                            />
                            <InputError
                                message={errors.subcategory}
                                className="mt-1 text-[10px] font-semibold"
                            />
                        </div>

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
}
