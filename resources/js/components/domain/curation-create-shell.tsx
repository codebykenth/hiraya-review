import { Link } from '@inertiajs/react';
import { ChevronLeft, Sparkles, PenLine } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';

interface CurationCreateShellProps {
    title: string;
    description: string;
    backUrl: string;
    backLabel: string;
    activeTab: 'ai' | 'manual';
    onTabChange: (tab: 'ai' | 'manual') => void;
    aiContent: React.ReactNode;
    manualContent: React.ReactNode;
}

export function CurationCreateShell({
    title,
    description,
    backUrl,
    backLabel,
    activeTab,
    onTabChange,
    aiContent,
    manualContent,
}: CurationCreateShellProps) {
    return (
        <PageContainer className="bg-slate-50/30 dark:bg-slate-900/20">
            {/* Back Link */}
            <Link
                href={backUrl}
                className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 flex w-fit cursor-pointer items-center gap-1 text-xs font-black text-foreground transition hover:text-blue-600 focus:outline-none dark:text-blue-400"
            >
                <ChevronLeft className="size-4" />
                {backLabel}
            </Link>

            {/* Header Section */}
            <div className="mt-2.5 mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <PageHeader title={title} description={description} />

                {/* Tab Switcher */}
                <div className="flex shrink-0 items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-950">
                    <button
                        type="button"
                        onClick={() => onTabChange('ai')}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-black tracking-wider uppercase transition ${
                            activeTab === 'ai'
                                ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white'
                                : 'dark:text-slate-450 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <Sparkles className="size-4 animate-pulse text-blue-600 dark:text-blue-400" />
                        AI Generator
                    </button>
                    <button
                        type="button"
                        onClick={() => onTabChange('manual')}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-xs font-black tracking-wider uppercase transition ${
                            activeTab === 'manual'
                                ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white'
                                : 'dark:text-slate-450 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                    >
                        <PenLine className="size-4 text-emerald-600 dark:text-emerald-400" />
                        Manual Entry
                    </button>
                </div>
            </div>

            {/* Dynamic Content */}
            {activeTab === 'ai' ? aiContent : manualContent}
        </PageContainer>
    );
}
