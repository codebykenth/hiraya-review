import { Link } from '@inertiajs/react';
import {
    ChevronDown,
    BookOpen,
    Calculator,
    BrainCircuit,
    FolderCheck,
    Globe2,
    Play,
    CheckCircle2,
    AlertTriangle,
    Target,
} from 'lucide-react';
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { index as drillsIndex } from '@/routes/drills';
import type { AnalyticsCategory, SubcategoryAnalytics } from '../types';

interface SubjectBreakdownAccordionProps {
    categories: AnalyticsCategory[];
}

function getSubjectIcon(name: string) {
    if (name.includes('Verbal')) {
        return <BookOpen className="size-4.5 text-blue-500" />;
    }
    if (name.includes('Numerical')) {
        return <Calculator className="size-4.5 text-rose-500" />;
    }
    if (name.includes('Analytical')) {
        return <BrainCircuit className="size-4.5 text-amber-500" />;
    }
    if (name.includes('Clerical')) {
        return <FolderCheck className="size-4.5 text-emerald-500" />;
    }

    return <Globe2 className="size-4.5 text-indigo-500" />;
}

function getMasteryBadge(percentage: number) {
    if (percentage >= 80) {
        return {
            label: 'Mastered',
            className:
                'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
            icon: <CheckCircle2 className="size-3 text-emerald-600" />,
        };
    }
    if (percentage >= 65) {
        return {
            label: 'Proficient',
            className:
                'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
            icon: <CheckCircle2 className="size-3 text-blue-600" />,
        };
    }
    if (percentage >= 50) {
        return {
            label: 'Review Needed',
            className:
                'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800',
            icon: <Target className="size-3 text-amber-600" />,
        };
    }

    return {
        label: 'Critical Weakness',
        className:
            'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800',
        icon: <AlertTriangle className="size-3 text-rose-600" />,
    };
}

export function SubjectBreakdownAccordion({
    categories,
}: SubjectBreakdownAccordionProps) {
    const [expandedCategories, setExpandedCategories] = useState<
        Record<string, boolean>
    >({
        'Verbal Ability': true,
        'Numerical Ability': true,
    });

    const toggleCategory = (name: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    const expandAll = () => {
        const all: Record<string, boolean> = {};
        categories.forEach((c) => {
            all[c.name] = true;
        });
        setExpandedCategories(all);
    };

    const collapseAll = () => {
        setExpandedCategories({});
    };

    return (
        <Card className="border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">
                        Subject & Subtopic Diagnostics
                    </h3>
                    <p className="text-xs font-medium text-muted-foreground sm:text-sm">
                        Detailed accuracy, question volume, and direct practice
                        links for every subcategory.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={expandAll}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                        Expand All
                    </button>
                    <button
                        type="button"
                        onClick={collapseAll}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-2xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                        Collapse All
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {categories.map((category) => {
                    const isExpanded = !!expandedCategories[category.name];
                    const subcats = category.subcategories || [];
                    const mastery = getMasteryBadge(category.percentage);

                    return (
                        <div
                            key={category.name}
                            className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs transition dark:border-slate-800 dark:bg-slate-900/60"
                        >
                            {/* Subject Header */}
                            <button
                                type="button"
                                onClick={() => toggleCategory(category.name)}
                                className="flex w-full items-center justify-between p-4 text-left transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                        {getSubjectIcon(category.name)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white">
                                                {category.name}
                                            </h4>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${mastery.className}`}
                                            >
                                                {mastery.icon}
                                                {mastery.label}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {category.correct} of{' '}
                                            {category.total} questions correct ·{' '}
                                            {subcats.length} subtopics
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="hidden text-right sm:block">
                                        <span className="font-heading text-base font-black text-slate-900 dark:text-white">
                                            {category.percentage}%
                                        </span>
                                        <Progress
                                            value={category.percentage}
                                            className="mt-1 h-1.5 w-24"
                                        />
                                    </div>

                                    <ChevronDown
                                        className={`size-4 text-muted-foreground transition-transform duration-200 ${
                                            isExpanded ? 'rotate-180' : ''
                                        }`}
                                    />
                                </div>
                            </button>

                            {/* Expanded Subcategories Table */}
                            {isExpanded && (
                                <div className="border-t border-slate-100 bg-slate-50/40 px-4 py-3 dark:border-slate-800/80 dark:bg-slate-950/20">
                                    {subcats.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                            {subcats.map(
                                                (
                                                    sub: SubcategoryAnalytics,
                                                ) => {
                                                    const subMastery =
                                                        getMasteryBadge(
                                                            sub.percentage,
                                                        );

                                                    return (
                                                        <div
                                                            key={sub.name}
                                                            className="flex items-center justify-between rounded-lg border border-slate-200/70 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                                                        >
                                                            <div className="flex flex-col gap-1 overflow-hidden pr-2">
                                                                <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                                                                    {sub.name}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                                                        {
                                                                            sub.correct
                                                                        }
                                                                        /
                                                                        {
                                                                            sub.total
                                                                        }{' '}
                                                                        (
                                                                        {
                                                                            sub.percentage
                                                                        }
                                                                        %)
                                                                    </span>
                                                                    <span
                                                                        className={`inline-flex items-center rounded border px-1.5 py-0.2 text-[9px] font-bold ${subMastery.className}`}
                                                                    >
                                                                        {
                                                                            subMastery.label
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <Link
                                                                href={drillsIndex(
                                                                    {
                                                                        query: {
                                                                            category:
                                                                                category.name,
                                                                            subcategories:
                                                                                JSON.stringify(
                                                                                    [
                                                                                        sub.name,
                                                                                    ],
                                                                                ),
                                                                            from: '/analytics',
                                                                        },
                                                                    },
                                                                )}
                                                                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/40"
                                                            >
                                                                <Play className="size-3 fill-current" />
                                                                Drill
                                                            </Link>
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    ) : (
                                        <p className="py-2 text-center text-xs font-medium text-muted-foreground">
                                            Complete practice exams or subject
                                            drills to populate subtopic metrics.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
