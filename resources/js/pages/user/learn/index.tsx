import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { HowItWorksModal } from '@/components/how-it-works-modal';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { ModulesGrid } from './components/modules-grid';
import { SearchFilterRow } from './components/search-filter-row';
import { useLearnState } from './hooks/use-learn-state';
import type { LearnIndexProps } from './types';

const progressBarColors: Record<string, string> = {
    'General Information': 'bg-teal-600 dark:bg-teal-500',
    'Verbal Ability': 'bg-blue-600 dark:bg-blue-500',
    'Analytical Ability': 'bg-emerald-600 dark:bg-emerald-500',
    'Numerical Ability': 'bg-orange-600 dark:bg-orange-500',
    'Clerical Ability': 'bg-indigo-600 dark:bg-indigo-500',
};

export default function LearnIndex(props: LearnIndexProps) {
    const { modules = [], categories = [] } = props;
    const { auth } = usePage<{ auth: { user: any } }>().props;
    const isLoggedIn = !!auth?.user;

    const activeCategories = React.useMemo(() => {
        return categories.filter((c) => c.name.toLowerCase() !== 'demographic');
    }, [categories]);

    const completedCount = modules.filter((m) => m.is_completed).length;
    const totalCount = modules.length;
    const progressPercent =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const categoryStats = React.useMemo(() => {
        const stats: Record<string, { completed: number; total: number }> = {};
        modules.forEach((m) => {
            if (!stats[m.category]) {
                stats[m.category] = { completed: 0, total: 0 };
            }

            stats[m.category].total++;

            if (m.is_completed) {
                stats[m.category].completed++;
            }
        });

        return stats;
    }, [modules]);

    const {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filteredModules,
        groupedModules,
    } = useLearnState(props);

    return (
        <>
            <Head>
                <title>
                    Civil Service Study Hub & Syllabus Guides | Hiraya Review
                </title>
                <meta
                    name="description"
                    content="Access free, high-yield study modules and review guides covering Numerical, Verbal, Analytical, and Clerical topics for the Civil Service Exam."
                />
                <meta
                    property="og:title"
                    content="Civil Service Study Hub & Syllabus Guides | Hiraya Review"
                />
                <meta
                    property="og:description"
                    content="Access free, high-yield study modules and review guides covering Numerical, Verbal, Analytical, and Clerical topics for the Civil Service Exam."
                />
            </Head>
            <PageContainer>
                {/* Header Banner */}
                <div className="mb-8 flex items-start gap-3">
                    <PageHeader
                        title="Study Hub"
                        description="Dive deep into core subjects, learn mental shortcuts, and master exam theories with our dedicated curated study guides."
                        tooltip="Access comprehensive study modules, lessons, formulas, and progress metrics for each major civil service topic."
                    />
                    <div className="mt-1">
                        <HowItWorksModal
                            title="How the Study Hub Works"
                            tips={[
                                {
                                    icon: '📖',
                                    title: 'Review Lessons',
                                    text: 'Access high-yield lessons, key conceptual breakdowns, and core exam strategies designed to target specific Civil Service subjects.',
                                },
                                {
                                    icon: '✅',
                                    title: 'Track Progress',
                                    text: 'Click "Mark as Complete" inside any lesson to record your progress, update your overall progress bar, and display completed badges.',
                                },
                                {
                                    icon: '📊',
                                    title: 'Smart Filtering',
                                    text: 'Filter lessons by specific categories to view individual completion percentages, or search keywords to find specific topics.',
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* Overall Progress Card */}
                {isLoggedIn && totalCount > 0 && (
                    <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-2xs">
                        <div className="mb-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-heading text-sm font-bold text-foreground">
                                    Overall Study Progress
                                </span>
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
                                    {completedCount} / {totalCount} Completed
                                </span>
                            </div>
                            <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                                {progressPercent}%
                            </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {/* Category Progress Grid */}
                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-5">
                            {activeCategories.map((cat) => {
                                const stats = categoryStats[cat.name] || {
                                    completed: 0,
                                    total: 0,
                                };
                                const pct =
                                    stats.total > 0
                                        ? Math.round(
                                              (stats.completed / stats.total) *
                                                  100,
                                          )
                                        : 0;
                                const barColor =
                                    progressBarColors[cat.name] ||
                                    'bg-slate-500 dark:bg-slate-400';

                                return (
                                    <div
                                        key={cat.id}
                                        className="flex flex-col gap-1 rounded-lg border border-border/40 bg-slate-50/20 p-3 dark:bg-slate-900/10"
                                    >
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span
                                                className="truncate text-muted-foreground"
                                                title={cat.name}
                                            >
                                                {cat.name}
                                            </span>
                                            <span className="ml-1 shrink-0 font-extrabold text-foreground">
                                                {pct}%
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
                                            <div
                                                className={`${barColor} h-full rounded-full transition-all duration-500`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="mt-0.5 text-[9px] font-semibold text-muted-foreground/80">
                                            {stats.completed} of {stats.total}{' '}
                                            modules
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Search and Category Filter Row */}
                <SearchFilterRow
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={activeCategories}
                    categoryStats={isLoggedIn ? categoryStats : undefined}
                    overallProgressPercent={
                        isLoggedIn ? progressPercent : undefined
                    }
                />

                {/* Modules Grid */}
                <ModulesGrid
                    filteredModules={filteredModules}
                    groupedModules={groupedModules}
                    categories={activeCategories}
                    searchQuery={searchQuery}
                />
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
