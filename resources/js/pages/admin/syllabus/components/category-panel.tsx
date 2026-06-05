import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import React from 'react';
import type { SyllabusFormState } from '../hooks/use-syllabus-form';
import type { CategoryItem } from '../types';

interface CategoryPanelProps {
    categories: CategoryItem[];
    selectedCategoryId: number | null;
    formState: SyllabusFormState;
    onSelectCategory: (id: number) => void;
    onFormChange: <K extends keyof SyllabusFormState>(
        key: K,
        value: SyllabusFormState[K],
    ) => void;
    onSubmitCategory: (e: React.FormEvent) => void;
    onSubmitEdit: (e: React.FormEvent, catId: number) => void;
    onStartEdit: (catId: number, name: string) => void;
    onCancelEdit: () => void;
    onDelete: (catId: number) => void;
}

export function CategoryPanel({
    categories,
    selectedCategoryId,
    formState,
    onSelectCategory,
    onFormChange,
    onSubmitCategory,
    onSubmitEdit,
    onStartEdit,
    onCancelEdit,
    onDelete,
}: CategoryPanelProps) {
    return (
        <div className="flex w-1/2 flex-col overflow-y-auto border-r border-border p-6">
            <h3 className="mb-3.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Categories
            </h3>

            <form
                onSubmit={onSubmitCategory}
                className="mb-4 flex flex-col gap-2"
            >
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add new category..."
                        value={formState.newCategoryName}
                        onChange={(e) =>
                            onFormChange('newCategoryName', e.target.value)
                        }
                        className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground transition focus:border-blue-500 focus:outline-none"
                        required
                    />
                    <button
                        type="submit"
                        className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 shadow-3xs inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800"
                    >
                        <Plus className="size-4" />
                    </button>
                </div>
                <label className="flex cursor-pointer items-center gap-2 self-start px-1 py-1 select-none">
                    <input
                        type="checkbox"
                        checked={formState.newCategoryIsDemographic}
                        onChange={(e) =>
                            onFormChange(
                                'newCategoryIsDemographic',
                                e.target.checked,
                            )
                        }
                        className="size-4 cursor-pointer rounded border-border text-blue-600 focus:ring-blue-500 dark:text-blue-400"
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                        Is demographic?
                    </span>
                </label>
            </form>

            <div className="flex-1 space-y-2">
                {categories.map((cat) => (
                    <div
                        key={cat.id}
                        onClick={() => {
                            if (formState.editingCategory !== cat.id) {
                                onSelectCategory(cat.id);
                            }
                        }}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition select-none ${
                            selectedCategoryId === cat.id &&
                            formState.editingCategory !== cat.id
                                ? 'shadow-3xs dark:bg-blue-950/30/50 border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/40 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-200'
                                : 'border-border bg-card text-foreground hover:bg-muted/50'
                        }`}
                    >
                        {formState.editingCategory === cat.id ? (
                            <form
                                onSubmit={(e) => onSubmitEdit(e, cat.id)}
                                className="flex flex-1 items-center gap-2 pr-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="text"
                                    autoFocus
                                    value={formState.editCategoryName}
                                    onChange={(e) =>
                                        onFormChange(
                                            'editCategoryName',
                                            e.target.value,
                                        )
                                    }
                                    className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-semibold text-foreground focus:border-blue-500 focus:outline-none"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 cursor-pointer rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                                >
                                    <Check className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onCancelEdit()}
                                    className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                                >
                                    <X className="size-4" />
                                </button>
                            </form>
                        ) : (
                            <>
                                <span className="truncate pr-2 text-sm font-semibold">
                                    {cat.name}
                                </span>
                                <div className="flex shrink-0 items-center gap-1.5">
                                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                                        {(cat.subcategory || []).length} subs
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartEdit(cat.id, cat.name);
                                        }}
                                        className="cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-blue-50 hover:text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                                    >
                                        <Edit2 className="size-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(cat.id);
                                        }}
                                        className="cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
