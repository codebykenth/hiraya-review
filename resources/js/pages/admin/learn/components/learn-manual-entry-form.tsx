import { router } from '@inertiajs/react';
import { PenLine, RotateCcw, Save } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/ui/select';
import { index as adminLearnIndex } from '@/routes/admin/learn';
import type { Category, Subcategory } from '../types';
import { LearnModuleFields } from './learn-module-fields';

interface LearnManualEntryFormProps {
    data: any;
    setData: any;
    errors: Record<string, string>;
    processing: boolean;
    reset: () => void;
    categories: Category[];
    activeSubcategories: Subcategory[];
    selectedCategoryName: string;
    selectedSubcategoryName: string;
    handleCategoryChange: (catName: string) => void;
    handleSubcategoryChange: (subName: string) => void;
    handleManualSubmit: (e: React.FormEvent) => void;
}

export function LearnManualEntryForm({
    data,
    setData,
    errors,
    processing,
    reset,
    categories,
    activeSubcategories,
    selectedCategoryName,
    selectedSubcategoryName,
    handleCategoryChange,
    handleSubcategoryChange,
    handleManualSubmit,
}: LearnManualEntryFormProps) {
    return (
        <form
            onSubmit={handleManualSubmit}
            className="grid max-w-7xl grid-cols-1 items-start gap-3 sm:gap-6 lg:grid-cols-12"
        >
            <div className="flex flex-col gap-3 sm:gap-6 lg:col-span-8">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
                    <h2 className="mb-4 inline-flex items-center gap-2 border-b border-border pb-3 text-base font-bold text-foreground">
                        <PenLine className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                        Manual Lesson Curator
                    </h2>

                    <div className="text-slate-750 space-y-4 text-xs font-bold dark:text-slate-400">
                        <LearnModuleFields
                            data={data}
                            setData={setData}
                            errors={errors}
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:gap-6 lg:col-span-4">
                <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
                    <h2 className="mb-4 border-b border-slate-100 pb-3 text-base font-bold">
                        Categorization
                    </h2>
                    <div className="space-y-4">
                        <SelectField
                            label="Category"
                            value={selectedCategoryName}
                            onValueChange={handleCategoryChange}
                            options={categories.map((c) => ({
                                value: c.name,
                                label: c.name,
                            }))}
                        />

                        <SelectField
                            label="Subcategory"
                            value={selectedSubcategoryName}
                            onValueChange={handleSubcategoryChange}
                            options={activeSubcategories.map((s) => ({
                                value: s.name,
                                label: s.name,
                            }))}
                        />

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
                            router.visit(adminLearnIndex().url);
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </form>
    );
}
