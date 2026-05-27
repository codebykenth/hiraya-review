import { Link } from '@inertiajs/react';
import { ChevronLeft, Save } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';

interface CurationEditShellProps {
    title: string;
    description: string;
    backUrl: string;
    backLabel: string;
    headerTitle: string;
    headerIcon: React.ComponentType<any>;
    statusLabel: string;
    statusValue: boolean;
    onStatusToggle: () => void;
    onSaveSubmit: (e: React.FormEvent) => void;
    isSaving: boolean;
    children: React.ReactNode;
}

export function CurationEditShell({
    title,
    description,
    backUrl,
    backLabel,
    headerTitle,
    headerIcon: HeaderIcon,
    statusLabel,
    statusValue,
    onStatusToggle,
    onSaveSubmit,
    isSaving,
    children
}: CurationEditShellProps) {
    return (
        <PageContainer className="bg-slate-50/30 dark:bg-slate-900/20">
            {/* Back Link */}
            <Link
                href={backUrl}
                className="flex w-fit items-center gap-1 text-xs font-black text-foreground hover:text-blue-600 transition focus:outline-none"
            >
                <ChevronLeft className="size-4" />
                {backLabel}
            </Link>

            <PageHeader title={title} description={description} className="mt-2.5 mb-6" />

            <div className="max-w-4xl">
                <form onSubmit={onSaveSubmit} className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm">

                    <div className="flex items-center justify-between border-b border-border pb-3.5">
                        <span className="text-xs font-black text-foreground uppercase flex items-center gap-1.5">
                            <HeaderIcon className="size-4.5 text-blue-600 animate-pulse" />
                            {headerTitle}
                        </span>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">{statusLabel}:</span>
                            <button
                                type="button"
                                onClick={onStatusToggle}
                                className={`rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase transition cursor-pointer border ${statusValue
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                    : 'bg-muted text-muted-foreground border-border'
                                    }`}
                            >
                                {statusValue ? 'Active' : 'Draft'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 text-xs font-bold text-foreground">
                        {children}
                    </div>

                    <div className="mt-4 border-t border-border pt-4 flex items-center justify-end">
                        <Button
                            type="submit"
                            variant="default"
                            size="default"
                            loading={isSaving}
                            icon={Save}
                        >
                            Save Updates
                        </Button>
                    </div>
                </form>
            </div>
        </PageContainer>
    );
}
