import { Link } from '@inertiajs/react';
import { ChevronLeft, Save } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';

interface CurationEditShellProps {
    title: string;
    description: string;
    backUrl: string;
    backLabel: string;
    headerTitle: string;
    headerIcon: React.ComponentType<any>;
    statusLabel?: string;
    statusValue?: boolean;
    onStatusToggle?: () => void;
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
    children,
}: CurationEditShellProps) {
    return (
        <PageContainer className="bg-slate-50/30 dark:bg-slate-900/20">
            {/* Back Link */}
            <Link
                href={backUrl}
                className="group flex w-fit items-center gap-1 text-xs font-black text-foreground transition transition-all duration-300 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:text-blue-400"
            >
                <ChevronLeft className="size-4" />
                {backLabel}
            </Link>

            <PageHeader
                title={title}
                description={description}
                className="mt-2.5 mb-6"
            />

            <div className="max-w-4xl">
                <form
                    onSubmit={onSaveSubmit}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:gap-6 sm:p-6"
                >
                    <div className="flex items-center justify-between border-b border-border pb-3.5">
                        <span className="flex items-center gap-1.5 text-xs font-black text-foreground uppercase">
                            <HeaderIcon className="size-4.5 animate-pulse text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400" />
                            {headerTitle}
                        </span>

                        {onStatusToggle && (
                            <div className="flex items-center gap-2">
                                {statusLabel && (
                                    <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                                        {statusLabel}:
                                    </span>
                                )}
                                <button
                                    type="button"
                                    onClick={onStatusToggle}
                                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[10px] font-extrabold uppercase transition ${
                                        statusValue
                                            ? 'border-emerald-150 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400'
                                            : 'border-border bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {statusValue ? 'Active' : 'Draft'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-5 text-xs font-bold text-foreground">
                        {children}
                    </div>

                    <div className="mt-4 flex items-center justify-end border-t border-border pt-4">
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
