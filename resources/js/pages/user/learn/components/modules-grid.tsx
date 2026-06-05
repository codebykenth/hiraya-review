import { Link } from '@inertiajs/react';
import { BookOpen, Clock, Tag, ArrowRight, CheckCircle2 } from 'lucide-react';
import React from 'react';
import { Card } from '@/components/ui/card';
import { categoryColors } from '../hooks/use-learn-state';
import type { LearnModule } from '../types';

interface ModulesGridProps {
    filteredModules: LearnModule[];
    groupedModules: [string, LearnModule[]][];
    categories: any[];
    searchQuery: string;
}

export function ModulesGrid({
    filteredModules,
    groupedModules,
    searchQuery,
}: ModulesGridProps) {
    if (filteredModules.length > 0) {
        return (
            <div className="flex flex-col gap-12">
                {groupedModules.map(([categoryName, groupMods]) => {
                    const colors = categoryColors[categoryName] || {
                        bg: 'bg-slate-50 dark:bg-slate-800/40',
                        text: 'text-muted-foreground',
                        border: 'border-border',
                        glow: '',
                    };

                    return (
                        <section
                            key={categoryName}
                            className="flex flex-col gap-5"
                        >
                            <h2 className="flex items-center gap-3 border-b border-border pb-3 font-heading text-xl font-black text-foreground">
                                <span
                                    className={`size-3 rounded-full border ${colors.bg} ${colors.border}`}
                                />
                                {categoryName}
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {groupMods.map((mod) => (
                                    <Link
                                        key={mod.id}
                                        href={`/learn/${mod.slug}`}
                                        className="group block"
                                    >
                                        <Card className="flex h-full flex-col justify-between overflow-hidden p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl hover:-translate-y-1 hover:shadow-primary/5">
                                            <div>
                                                {/* Badges row */}
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={`rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${colors.bg} ${colors.text} ${colors.border}`}
                                                    >
                                                        {mod.category}
                                                    </span>
                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-muted-foreground dark:bg-slate-900">
                                                        {mod.subcategory}
                                                    </span>
                                                    {mod.is_completed && (
                                                        <span className="ml-auto flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-black text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                                            <CheckCircle2 className="size-3" />
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="mt-5 font-heading text-lg leading-snug font-bold text-foreground transition group-hover:text-blue-600 dark:text-blue-400 dark:group-hover:text-blue-400">
                                                    {mod.title}
                                                </h3>

                                                <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                                                    <Tag className="size-3" />
                                                    <span>
                                                        Topic: {mod.topic}
                                                    </span>
                                                </div>

                                                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                    {mod.summary}
                                                </p>
                                            </div>

                                            {/* Action Footing */}
                                            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="size-3.5" />
                                                    <span>
                                                        {mod.estimated_minutes}{' '}
                                                        min read
                                                    </span>
                                                </div>

                                                {!mod.is_completed && (
                                                    <span className="flex items-center gap-1 text-xs font-black text-blue-600 transition-all group-hover:gap-2 dark:text-blue-400">
                                                        Start Lesson
                                                        <ArrowRight className="size-3.5" />
                                                    </span>
                                                )}
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        );
    }

    if (searchQuery === '') {
        return (
            <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card/70 p-12 text-center shadow-sm transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-900/50">
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-xl bg-slate-100 text-muted-foreground ring-8 dark:bg-slate-900">
                    <BookOpen className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-700 uppercase dark:bg-amber-950/30 dark:bg-amber-950/40 dark:text-amber-400">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Coming Soon
                </span>
                <h3 className="font-heading text-xl font-black tracking-tight text-foreground">
                    No Learning Modules Available
                </h3>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Hiraya Review is currently designing bite-sized conceptual
                    lessons, strategy guides, and detailed category rationales.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16">
            <BookOpen className="size-12 text-muted-foreground" />
            <h3 className="mt-4 text-sm font-black text-foreground">
                No learning modules match your search
            </h3>
            <p className="mt-1 max-w-2xl text-center text-sm leading-normal leading-relaxed text-muted-foreground">
                Try checking other categories or adjust your keyword search.
                Admins will curate more review topics shortly!
            </p>
        </div>
    );
}
