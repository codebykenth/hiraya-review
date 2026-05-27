import { Link } from '@inertiajs/react';
import { ChevronLeft, Sparkles, PenLine } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';

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
    manualContent
}: CurationCreateShellProps) {
    return (
        <PageContainer className="bg-slate-50/30 dark:bg-slate-900/20">
            {/* Back Link */}
            <Link
                href={backUrl}
                className="flex w-fit items-center gap-1 text-xs font-black text-foreground hover:text-blue-600 transition cursor-pointer focus:outline-none"
            >
                <ChevronLeft className="size-4" />
                {backLabel}
            </Link>

            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mt-2.5 mb-6">
                <PageHeader title={title} description={description} />

                {/* Tab Switcher */}
                <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 shrink-0">
                    <button
                        type="button"
                        onClick={() => onTabChange('ai')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'ai'
                            ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
                            }`}
                    >
                        <Sparkles className="size-4 text-blue-600 animate-pulse" />
                        AI Generator
                    </button>
                    <button
                        type="button"
                        onClick={() => onTabChange('manual')}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${activeTab === 'manual'
                            ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-450 dark:hover:text-slate-200'
                            }`}
                    >
                        <PenLine className="size-4 text-emerald-600" />
                        Manual Entry
                    </button>
                </div>
            </div>

            {/* Dynamic Content */}
            {activeTab === 'ai' ? aiContent : manualContent}
        </PageContainer>
    );
}
