import { Database, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import React from 'react';
import type { SyllabusFormState } from '../hooks/use-syllabus-form';
import type { CategoryItem } from '../types';

interface SubcategoryPanelProps {
    activeCategory: CategoryItem | undefined;
    selectedCategoryId: number | null;
    formState: SyllabusFormState;
    onFormChange: <K extends keyof SyllabusFormState>(
        key: K,
        value: SyllabusFormState[K],
    ) => void;
    onSubmitSubcategory: (e: React.FormEvent) => void;
    onSubmitEdit: (e: React.FormEvent, subId: number) => void;
    onStartEdit: (subId: number, name: string) => void;
    onCancelEdit: () => void;
    onDelete: (subId: number) => void;
}

export function SubcategoryPanel({
    activeCategory,
    selectedCategoryId,
    formState,
    onFormChange,
    onSubmitSubcategory,
    onSubmitEdit,
    onStartEdit,
    onCancelEdit,
    onDelete,
}: SubcategoryPanelProps) {
    return (
        <div className="flex w-1/2 flex-col overflow-y-auto bg-muted/20 p-6">
            <h3 className="mb-3.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Subcategories of "{activeCategory?.name || 'Select a Category'}"
            </h3>

            {selectedCategoryId ? (
                <>
                    <form
                        onSubmit={onSubmitSubcategory}
                        className="mb-4 flex gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Add new subcategory..."
                            value={formState.newSubcategoryName}
                            onChange={(e) =>
                                onFormChange(
                                    'newSubcategoryName',
                                    e.target.value,
                                )
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
                    </form>

                    <div className="flex-1 space-y-2">
                        {(activeCategory?.subcategory || []).map((sub) => (
                            <div
                                key={sub.id}
                                className="shadow-3xs flex items-center justify-between rounded-xl border border-border bg-card p-3 text-foreground"
                            >
                                {formState.editingSubcategory === sub.id ? (
                                    <form
                                        onSubmit={(e) =>
                                            onSubmitEdit(e, sub.id)
                                        }
                                        className="flex flex-1 items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            autoFocus
                                            value={
                                                formState.editSubcategoryName
                                            }
                                            onChange={(e) =>
                                                onFormChange(
                                                    'editSubcategoryName',
                                                    e.target.value,
                                                )
                                            }
                                            className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-medium text-foreground focus:border-blue-500 focus:outline-none"
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
                                        <span className="truncate pr-2 text-sm font-medium">
                                            {sub.name}
                                        </span>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onStartEdit(
                                                        sub.id,
                                                        sub.name,
                                                    );
                                                }}
                                                className="cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-blue-50 hover:text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                                            >
                                                <Edit2 className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(sub.id)}
                                                className="shrink-0 cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {(activeCategory?.subcategory || []).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                <Database className="mb-2 size-8 opacity-40" />
                                <span className="text-xs font-semibold">
                                    No Subcategories Added Yet
                                </span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
                    <Database className="mb-2.5 size-10 opacity-30" />
                    <span className="text-sm font-semibold">
                        Select a category on the left to manage its
                        subcategories
                    </span>
                </div>
            )}
        </div>
    );
}
