import { Head, usePage, Link } from '@inertiajs/react';
import { Search, Calendar, Trash2 } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { HowItWorksModal } from '@/components/shared/how-it-works-modal';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Auth } from '@/types';
import { AttemptsTable } from './components/attempts-table';
import { FiltersCard } from './components/filters-card';
import { useHistoryState } from './hooks/use-history-state';
import type { HistoryPageProps } from './types';

export default function HistoryPage(props: HistoryPageProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const isAiMode = auth?.user?.analysis_mode === 'ai';
    const { attempts = [], pagination } = props;

    const {
        searchVal,
        setSearchVal,
        selectedTrack,
        selectedDate,
        perPage,
        selectedIds,
        expandedIds,
        toggleExpandRow,
        confirmModal,
        setConfirmModal,
        handleDeleteAttempt,
        handleSelectAll,
        handleSelectOne,
        handleBulkDelete,
        handleTrackChange,
        handleDateChange,
        handlePerPageChange,
        handleSearchSubmit,
    } = useHistoryState(props);

    return (
        <TooltipProvider>
            <Head title="History" />

            <PageContainer>
                {/* 1. HEADER SECTION */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                        <PageHeader
                            title="Attempt History"
                            description="Review past attempt logs, inspect section breakdowns, and retake drills or mock exams."
                            tooltip="A chronological log of all your completed exam and drill attempts."
                        />
                        <div className="mt-1">
                            <HowItWorksModal
                                title="How History Works"
                                tips={[
                                    {
                                        icon: <Search className="size-4" />,
                                        title: 'Detailed Breakdowns',
                                        text: 'Expand any attempt record to see a section-by-section percentage breakdown, timing metrics, and subcategories.',
                                    },
                                    {
                                        icon: <Calendar className="size-4" />,
                                        title: 'Filter by Date, Track & Limit',
                                        text: 'Use the top filter bar to drill down into specific exam runs or customize how many records appear per page.',
                                    },
                                    {
                                        icon: <Trash2 className="size-4" />,
                                        title: 'Manage Records',
                                        text: `Delete obsolete attempt records anytime to keep your ${isAiMode ? 'AI Readiness Score' : 'Readiness Score'} accurate and up-to-date.`,
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <Link
                        href="/analytics"
                        prefetch="hover"
                        cacheFor="30s"
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold text-muted-foreground shadow-2xs transition hover:bg-accent hover:text-foreground"
                    >
                        <span>View Full Analytics</span>
                        <span aria-hidden="true">&rarr;</span>
                    </Link>
                </div>

                {/* 2. FILTERS CONTAINER */}
                <div className="mb-6">
                    <FiltersCard
                        searchVal={searchVal}
                        setSearchVal={setSearchVal}
                        selectedTrack={selectedTrack}
                        selectedDate={selectedDate}
                        perPage={perPage}
                        handleTrackChange={handleTrackChange}
                        handleDateChange={handleDateChange}
                        handlePerPageChange={handlePerPageChange}
                        handleSearchSubmit={handleSearchSubmit}
                    />
                </div>

                {/* 4. ATTEMPTS TABLE */}
                <AttemptsTable
                    attempts={attempts}
                    pagination={pagination}
                    selectedIds={selectedIds}
                    expandedIds={expandedIds}
                    toggleExpandRow={toggleExpandRow}
                    handleSelectAll={handleSelectAll}
                    handleSelectOne={handleSelectOne}
                    handleBulkDelete={handleBulkDelete}
                    handleDeleteAttempt={handleDeleteAttempt}
                    searchVal={searchVal}
                    selectedTrack={selectedTrack}
                    selectedDate={selectedDate}
                />
            </PageContainer>

            {/* Unified confirmation modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onClose={() =>
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                onConfirm={confirmModal.onConfirm}
            />
        </TooltipProvider>
    );
}

HistoryPage.layout = {
    breadcrumbs: [
        {
            title: 'History',
            href: '/history',
        },
    ],
};
