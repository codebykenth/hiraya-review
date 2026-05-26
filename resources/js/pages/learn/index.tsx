import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Search, BookOpen, Clock, Tag, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface LearnModule {
    id: number;
    title: string;
    slug: string;
    topic: string;
    summary: string;
    estimated_minutes: number;
    category: string;
    subcategory: string;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    subcategory: { id: number; name: string; slug: string }[];
}

interface LearnIndexProps {
    modules: LearnModule[];
    categories: Category[];
}

// Map categories to color accents for premium UI visuals
const categoryColors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    'General Information': { bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-150 dark:border-teal-900/35', glow: 'shadow-teal-100/50' },
    'Verbal Ability': { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-150 dark:border-blue-900/35', glow: 'shadow-blue-100/50' },
    'Analytical Ability': { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-150 dark:border-emerald-900/35', glow: 'shadow-emerald-100/50' },
    'Numerical Ability': { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-150 dark:border-orange-900/35', glow: 'shadow-orange-100/50' },
    'Clerical Ability': { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-150 dark:border-indigo-900/35', glow: 'shadow-indigo-100/50' },
};

export default function LearnIndex({ modules, categories }: LearnIndexProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Strict 1-liner comment: Filter lessons based on active category and query keywords
    const filteredModules = modules.filter(mod => {
        const matchesQuery = 
            mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mod.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mod.summary.toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory;
        
        return matchesQuery && matchesCategory;
    });

    return (
        <>
            <Head title="Learning Tutorials" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl p-6 bg-slate-50/30 dark:bg-slate-900/20">
                
                {/* Header Banner */}
                <div>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                        CSE Study Hub
                    </h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Dive deep into core subjects, learn mental shortcuts, and master exam theories with our dedicated curated study guides.
                    </p>
                </div>

                {/* Search and Category Filter Row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-150 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-950">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by topic, lesson name, or syllabus keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/35 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`rounded-lg px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                                selectedCategory === 'all'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-50 text-slate-650 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
                            }`}
                        >
                            All Categories
                        </button>
                        {categories.map(cat => {
                            const isSelected = selectedCategory === cat.name;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`rounded-lg px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                                        isSelected
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-slate-50 text-slate-650 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-850'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Modules Grid */}
                {filteredModules.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredModules.map(mod => {
                            const colors = categoryColors[mod.category] || {
                                bg: 'bg-slate-50 dark:bg-slate-800/40',
                                text: 'text-slate-655 dark:text-slate-400',
                                border: 'border-slate-200 dark:border-slate-800',
                                glow: '',
                            };

                            return (
                                <Link
                                    key={mod.id}
                                    href={`/learn/${mod.slug}`}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-150 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950"
                                >
                                    <div>
                                        {/* Badges row */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                {mod.category}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                                                {mod.subcategory}
                                            </span>
                                        </div>

                                        <h3 className="mt-5 font-heading text-lg font-bold text-slate-850 leading-snug group-hover:text-blue-600 transition dark:text-white dark:group-hover:text-blue-400">
                                            {mod.title}
                                        </h3>
                                        
                                        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                                            <Tag className="size-3" />
                                            <span>Topic: {mod.topic}</span>
                                        </div>

                                        <p className="mt-3 text-xs leading-relaxed text-slate-500 line-clamp-3 dark:text-slate-400">
                                            {mod.summary}
                                        </p>
                                    </div>

                                    {/* Action Footing */}
                                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-900">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                            <Clock className="size-3.5" />
                                            <span>{mod.estimated_minutes} min read</span>
                                        </div>
                                        
                                        <span className="flex items-center gap-1 text-xs font-black text-blue-600 group-hover:gap-2 transition-all dark:text-blue-450">
                                            Start Lesson
                                            <ArrowRight className="size-3.5" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
                        <BookOpen className="size-12 text-slate-350 dark:text-slate-650" />
                        <h3 className="mt-4 text-sm font-black text-slate-800 dark:text-white">No learning modules found</h3>
                        <p className="mt-1 max-w-2xl text-center text-xs text-slate-400 leading-normal">
                            Try checking other categories or adjust your keyword search. Admins will curate more review topics shortly!
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

// Register layout configuration
LearnIndex.layout = {
    breadcrumbs: [
        {
            title: 'Learn',
            href: '/learn',
        },
    ],
};
