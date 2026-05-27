import React from 'react';
import { X, Database, Plus, Trash2 } from 'lucide-react';

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
    handleDeleteSubcategory
}: ScopeSettingsModalProps) {
    if (!isOpen) return null;

    const activeCategory = categories.find(c => c.id === selectedScopeCategory);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="relative flex flex-col w-full max-w-4xl h-[600px] rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-950">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/50 dark:border-slate-900 dark:bg-slate-900/35">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Database className="size-5 text-blue-600 dark:text-blue-500" />
                            Dynamic Syllabus Scope Settings
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize your exam blueprint and automatically tune the Gemini AI review questions writer.</p>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-900 dark:hover:text-slate-250 transition"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Modal Body (Two Column Split Layout) */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Column: Categories List */}
                    <div className="w-1/2 border-r border-slate-100 dark:border-slate-900 flex flex-col p-6 overflow-y-auto">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5">Categories</h3>
                        
                        <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                            <input 
                                type="text" 
                                placeholder="Add new category..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="flex-1 rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                required
                            />
                            <button 
                                type="submit" 
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800 shadow-3xs cursor-pointer shrink-0"
                            >
                                <Plus className="size-4" />
                            </button>
                        </form>

                        <div className="space-y-2 flex-1">
                            {categories.map(cat => (
                                <div 
                                    key={cat.id} 
                                    onClick={() => setSelectedScopeCategory(cat.id)}
                                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition select-none ${
                                        selectedScopeCategory === cat.id 
                                            ? 'border-blue-200 bg-blue-50/50 text-blue-900 shadow-3xs dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200' 
                                            : 'border-slate-150 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-850 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900'
                                    }`}
                                >
                                    <span className="text-sm font-semibold truncate pr-2">
                                        {cat.name}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-450">
                                            {(cat.subcategory || []).length} subs
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCategory(cat.id);
                                            }}
                                            className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-900 transition cursor-pointer"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Subcategories list for Selected Category */}
                    <div className="w-1/2 flex flex-col p-6 overflow-y-auto bg-slate-50/20 dark:bg-slate-900/10">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5">
                            Subcategories of "{activeCategory?.name || 'Select a Category'}"
                        </h3>

                        {selectedScopeCategory ? (
                            <>
                                <form onSubmit={handleAddSubcategory} className="flex gap-2 mb-4">
                                    <input 
                                        type="text" 
                                        placeholder="Add new subcategory..."
                                        value={newSubcategoryName}
                                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                                        className="flex-1 rounded-xl border border-slate-250 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                                        required
                                    />
                                    <button 
                                        type="submit" 
                                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800 shadow-3xs cursor-pointer shrink-0"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </form>

                                <div className="space-y-2 flex-1">
                                    {((activeCategory?.subcategory) || []).map(sub => (
                                        <div 
                                            key={sub.id} 
                                            className="flex items-center justify-between rounded-xl border border-slate-150 bg-white p-3 text-slate-700 shadow-3xs dark:border-slate-850 dark:bg-slate-950 dark:text-slate-300"
                                        >
                                            <span className="text-sm font-medium truncate pr-2">
                                                {sub.name}
                                            </span>
                                            <button 
                                                type="button"
                                                onClick={() => handleDeleteSubcategory(sub.id)}
                                                className="rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-900 transition shrink-0 cursor-pointer"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {((activeCategory?.subcategory) || []).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 text-center">
                                            <Database className="size-8 opacity-40 mb-2" />
                                            <span className="text-xs font-semibold">No Subcategories Added Yet</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 dark:text-slate-500 text-center">
                                <Database className="size-10 opacity-30 mb-2.5" />
                                <span className="text-sm font-semibold">Select a category on the left to manage its subcategories</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
