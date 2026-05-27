import { useState } from 'react';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import { Search, BookOpen, Clock, Tag, ArrowRight } from 'lucide-react';

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
            <PageContainer>
                
                {/* Header Banner */}
                <PageHeader
                    title="CSE Study Hub"
                    description="Dive deep into core subjects, learn mental shortcuts, and master exam theories with our dedicated curated study guides."
                />

                {/* Search and Category Filter Row */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-5 shadow-2xs">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by topic, lesson name, or syllabus keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-border bg-slate-50/35 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-slate-900/50 text-foreground"
                        />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`rounded-lg px-4 py-2 text-xs font-extrabold transition cursor-pointer ${
                                selectedCategory === 'all'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-50 text-muted-foreground hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
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
                                            : 'bg-slate-50 text-muted-foreground hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
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
                                text: 'text-muted-foreground',
                                border: 'border-border',
                                glow: '',
                            };

                            return (
                                <Link
                                    key={mod.id}
                                    href={`/learn/${mod.slug}`}
                                    className="block group"
                                >
                                    <Card className="flex flex-col justify-between overflow-hidden p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md h-full">
                                        <div>
                                        {/* Badges row */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase border ${colors.bg} ${colors.text} ${colors.border}`}>
                                                {mod.category}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-muted-foreground dark:bg-slate-900">
                                                {mod.subcategory}
                                            </span>
                                        </div>

                                        <h3 className="mt-5 font-heading text-lg font-bold text-foreground leading-snug group-hover:text-blue-600 transition dark:group-hover:text-blue-400">
                                            {mod.title}
                                        </h3>
                                        
                                        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                            <Tag className="size-3" />
                                            <span>Topic: {mod.topic}</span>
                                        </div>

                                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                                            {mod.summary}
                                        </p>
                                    </div>

                                    {/* Action Footing */}
                                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Clock className="size-3.5" />
                                            <span>{mod.estimated_minutes} min read</span>
                                        </div>
                                        
                                        <span className="flex items-center gap-1 text-xs font-black text-blue-600 group-hover:gap-2 transition-all dark:text-blue-450">
                                            Start Lesson
                                            <ArrowRight className="size-3.5" />
                                        </span>
                                    </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State / Coming Soon State */
                    searchQuery === '' ? (
                        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card/70 p-12 text-center shadow-sm transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-900/50">
                            <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-muted-foreground mb-5 ring-8">
                                <BookOpen className="size-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 uppercase mb-3.5">
                                <span className="size-1.5 rounded-full bg-amber-500" />
                                Coming Soon
                            </span>
                            <h3 className="font-heading text-lg font-bold text-foreground">
                                No Learning Modules  Available
                            </h3>
                            <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                                We are currently designing bite-sized conceptual lessons, strategy guides, and detailed category rationales.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
                            <BookOpen className="size-12 text-muted-foreground" />
                            <h3 className="mt-4 text-sm font-black text-foreground">No learning modules match your search</h3>
                            <p className="mt-1 max-w-2xl text-center text-xs text-muted-foreground leading-normal">
                                Try checking other categories or adjust your keyword search. Admins will curate more review topics shortly!
                            </p>
                        </div>
                    )
                )}
            </PageContainer>
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
