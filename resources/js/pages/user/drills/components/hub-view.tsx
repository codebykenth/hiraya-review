import { Brain, Zap, Clock, Lightbulb, FileText } from 'lucide-react';
import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { HowItWorksModal } from '@/components/shared/how-it-works-modal';
import { Card } from '@/components/ui/card';
import { categoryMeta } from '../hooks/use-drills-state';
import type { Category, Question } from '../types';

interface HubViewProps {
    categories: Category[];
    questions: Question[];
    handleCategoryClick: (catName: string) => void;
}

export function HubView({
    categories,
    questions,
    handleCategoryClick,
}: HubViewProps) {
    const activeCategories = categories.filter(
        (c) => c.name.toLowerCase() !== 'demographic',
    );

    return (
        <div className="flex flex-col gap-3 sm:gap-6">
            <div className="mb-2 flex items-start gap-3">
                <PageHeader
                    title="Practice Drill Hub"
                    description="Select a category below to focus your practice. Each drill module is designed to target specific cognitive areas required for civil service examinations."
                    tooltip="Short, highly focused exercise sessions with instant answers to build subtopic muscle memory."
                />
                <div className="mt-1">
                    <HowItWorksModal
                        title="How Practice Drills Work"
                        tips={[
                            {
                                icon: <Zap className="size-4" />,
                                title: 'Micro-learning',
                                text: 'Drills are short, focused sessions designed for rapid repetition on specific subcategories to build your muscle memory.',
                            },
                            {
                                icon: <Clock className="size-4" />,
                                title: 'Practice Modes',
                                text: 'Choose Timed mode to build your speed for the actual exam, or Untimed mode for deep comprehension and reading.',
                            },
                            {
                                icon: <Lightbulb className="size-4" />,
                                title: 'Instant Feedback',
                                text: 'Unlike full mock exams, drills provide immediate explanations after every single question so you learn right away.',
                            },
                        ]}
                    />
                </div>
            </div>

            {activeCategories.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {activeCategories.map((cat) => {
                        const meta = categoryMeta[cat.name] || {
                            icon: Brain,
                            bgColor: 'bg-slate-600',
                            description:
                                'Master your skills in this civil service exam practice module.',
                        };
                        const CardIcon = meta.icon;
                        const actualCount = questions.filter(
                            (q) =>
                                q.category
                                    .toLowerCase()
                                    .includes(cat.name.toLowerCase()) ||
                                cat.name
                                    .toLowerCase()
                                    .includes(q.category.toLowerCase()),
                        ).length;

                        return (
                            <Card
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.name)}
                                className="group relative flex cursor-pointer flex-col justify-between overflow-hidden p-4 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                            >
                                <div>
                                    <div className="flex items-start justify-between">
                                        <div
                                            className={`rounded-xl ${meta.bgColor} p-3 text-white shadow-xs`}
                                        >
                                            <CardIcon className="transition-transform group-hover:scale-110 size-6" />
                                        </div>
                                        <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-muted-foreground dark:bg-slate-800">
                                            <FileText className="size-3" />{' '}
                                            {actualCount} Qs
                                        </span>
                                    </div>

                                    <h3 className="mt-5 font-heading text-2xl font-black tracking-tight text-foreground transition group-hover:text-blue-600 sm:text-3xl dark:text-blue-400 dark:group-hover:text-blue-400">
                                        {cat.name}
                                    </h3>
                                    <p className="mt-2 text-base leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                                        {meta.description}
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-1.5">
                                    {cat.subcategory.map((sub) => (
                                        <span
                                            key={sub.id}
                                            className="rounded-lg border border-border bg-slate-50/50 px-2 py-0.5 text-xs font-semibold text-muted-foreground dark:bg-slate-900/40"
                                        >
                                            {sub.name}
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 text-center shadow-sm">
                    <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-xl bg-slate-100 text-muted-foreground ring-8 dark:bg-slate-900">
                        <Brain className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-[10px] font-extrabold tracking-wider text-amber-700 uppercase dark:bg-amber-950/30 dark:bg-amber-950/40 dark:text-amber-400">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        Coming Soon
                    </span>
                    <h3 className="font-heading text-xl font-black tracking-tight text-foreground">
                        No Practice Drills Available
                    </h3>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Practice drill modules are coming soon! Hiraya Review is
                        currently compiling comprehensive exam question banks.
                    </p>
                </div>
            )}
        </div>
    );
}
