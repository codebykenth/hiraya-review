import { Search } from 'lucide-react';
import React from 'react';
import { Input } from '@/components/ui/input';
import type { Category } from '../types';

interface SearchFilterRowProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    selectedCategory: string;
    setSelectedCategory: (cat: string) => void;
    categories: Category[];
}

export function SearchFilterRow({
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
}: SearchFilterRowProps) {
    return (
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full shrink-0 lg:w-96">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by topic, lesson name, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-extrabold transition ${
                        selectedCategory === 'all'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-50 text-muted-foreground hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
                    }`}
                >
                    All Categories
                </button>
                {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.name;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-extrabold transition ${
                                isSelected
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-50 text-muted-foreground hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
                            }`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
