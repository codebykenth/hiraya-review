import { X, Database, Plus, Trash2 } from 'lucide-react';
import React from 'react';

export interface CategoryItem {
    id: number;
    name: string;
    subcategory?: Array<{
        id: number;
        name: string;
    }>;
}

export interface ScopeSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: CategoryItem[];
    selectedScopeCategory: number | null;
    setSelectedScopeCategory: (id: number | null) => void;
    newCategoryName: string;
    setNewCategoryName: (name: string) => void;
    newSubcategoryName: string;
    setNewSubcategoryName: (name: string) => void;
    handleAddCategory: (e: React.FormEvent) => void;
    handleDeleteCategory: (id: number) => void;
    handleAddSubcategory: (e: React.FormEvent) => void;
    handleDeleteSubcategory: (id: number) => void;
}

export function ScopeSettingsModal({
    isOpen,
    onClose,
    categories = [],
    selectedScopeCategory,
    setSelectedScopeCategory,
    newCategoryName,
    setNewCategoryName,
    newSubcategoryName,
    setNewSubcategoryName,
    handleAddCategory,
    handleDeleteCategory,
    handleAddSubcategory,
    handleDeleteSubcategory,
}: ScopeSettingsModalProps) {
    if (!isOpen) {
        return null;
    }

    const activeCategory = categories.find(
        (c) => c.id === selectedScopeCategory,
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="relative flex h-[600px] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl duration-200 zoom-in-95 fade-in dark:border-slate-800 dark:bg-slate-900">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4.5 dark:border-slate-900 dark:bg-slate-900/35">
                    <div>
                        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            <Database className="size-5 text-blue-600 dark:text-blue-500" />
                            Dynamic Syllabus Scope Settings
                        </h2>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Customize your exam blueprint and automatically tune
                            the Gemini AI review questions writer.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="dark:hover:text-slate-250 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-900"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Modal Body (Two Column Split Layout) */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Column: Categories List */}
                    <div className="flex w-1/2 flex-col overflow-y-auto border-r border-slate-100 p-6 dark:border-slate-900">
                        <h3 className="mb-3.5 text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Categories
                        </h3>

                        <form
                            onSubmit={handleAddCategory}
                            className="mb-4 flex gap-2"
                        >
                            <input
                                type="text"
                                placeholder="Add new category..."
                                value={newCategoryName}
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                className="border-slate-250 flex-1 rounded-xl border bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                required
                            />
                            <button
                                type="submit"
                                className="shadow-3xs inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800"
                            >
                                <Plus className="size-4" />
                            </button>
                        </form>

                        <div className="flex-1 space-y-2">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() =>
                                        setSelectedScopeCategory(cat.id)
                                    }
                                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition select-none ${
                                        selectedScopeCategory === cat.id
                                            ? 'shadow-3xs border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80'
                                    }`}
                                >
                                    <span className="truncate pr-2 text-sm font-semibold">
                                        {cat.name}
                                    </span>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <span className="dark:text-slate-450 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-900">
                                            {(cat.subcategory || []).length}{' '}
                                            subs
                                        </span>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCategory(cat.id);
                                            }}
                                            className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-900"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Subcategories list for Selected Category */}
                    <div className="flex w-1/2 flex-col overflow-y-auto bg-slate-50/20 p-6 dark:bg-slate-900/10">
                        <h3 className="mb-3.5 text-xs font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
                            Subcategories of "
                            {activeCategory?.name || 'Select a Category'}"
                        </h3>

                        {selectedScopeCategory ? (
                            <>
                                <form
                                    onSubmit={handleAddSubcategory}
                                    className="mb-4 flex gap-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="Add new subcategory..."
                                        value={newSubcategoryName}
                                        onChange={(e) =>
                                            setNewSubcategoryName(
                                                e.target.value,
                                            )
                                        }
                                        className="border-slate-250 flex-1 rounded-xl border bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="shadow-3xs inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </form>

                                <div className="flex-1 space-y-2">
                                    {(activeCategory?.subcategory || []).map(
                                        (sub) => (
                                            <div
                                                key={sub.id}
                                                className="shadow-3xs flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                            >
                                                <span className="truncate pr-2 text-sm font-medium">
                                                    {sub.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteSubcategory(
                                                            sub.id,
                                                        )
                                                    }
                                                    className="shrink-0 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-900"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        ),
                                    )}
                                    {(activeCategory?.subcategory || [])
                                        .length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500">
                                            <Database className="mb-2 size-8 opacity-40" />
                                            <span className="text-xs font-semibold">
                                                No Subcategories Added Yet
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500">
                                <Database className="mb-2.5 size-10 opacity-30" />
                                <span className="text-sm font-semibold">
                                    Select a category on the left to manage its
                                    subcategories
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
