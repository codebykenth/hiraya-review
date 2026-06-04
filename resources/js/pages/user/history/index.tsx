import { Head } from '@inertiajs/react';
import { Search, Calendar, Trash2 } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { HowItWorksModal } from '@/components/shared/how-it-works-modal';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AttemptsTable } from './components/attempts-table';
import { FiltersCard } from './components/filters-card';
import { useHistoryState } from './hooks/use-history-state';
import type { HistoryPageProps } from './types';

export default function HistoryPage(props: HistoryPageProps) {
    const { attempts = [], pagination } = props;

    const {
        searchVal,
        setSearchVal,
        selectedTrack,
        selectedDate,
        selectedIds,
        confirmModal,
        setConfirmModal,
        handleDeleteAttempt,
        handleSelectAll,
        handleSelectOne,
        handleBulkDelete,
        handleTrackChange,
        handleDateChange,
        handleSearchSubmit,
    } = useHistoryState(props);

    return (
        <TooltipProvider>
            <Head title="History" />

            <PageContainer>
                {/* 1. HEADER SECTION */}
                <div className="mb-8 flex items-start gap-3">
                    <PageHeader
                        title="History"
                        description="Review your past performance, analyze detailed score breakdowns, and identify specific areas for improvement across all your exam tracks."
                        tooltip="A log of all your previous exam attempts, subcategory performance reports, and historical stats."
                    />
                    <div className="mt-1">
                        <HowItWorksModal
                            title="How History Works"
                            tips={[
                                {
                                    icon: <Search className="size-4" />,
                                    title: 'Detailed Breakdowns',
                                    text: 'Click on any past attempt to see a comprehensive breakdown of your score across different subject categories.',
                                },
                                {
                                    icon: <Calendar className="size-4" />,
                                    title: 'Filter by Date & Track',
                                    text: 'Use the filters to quickly find specific exam runs or see how you performed during a specific time period.',
                                },
                                {
                                    icon: <Trash2 className="size-4" />,
                                    title: 'Manage Records',
                                    text: 'You can delete old or irrelevant attempt records to keep your AI Readiness Score focused on your most recent performance.',
                                },
                            ]}
                        />
                    </div>
                </div>

                {/* 2. FILTERS CONTAINER */}
                <FiltersCard
                    searchVal={searchVal}
                    setSearchVal={setSearchVal}
                    selectedTrack={selectedTrack}
                    selectedDate={selectedDate}
                    handleTrackChange={handleTrackChange}
                    handleDateChange={handleDateChange}
                    handleSearchSubmit={handleSearchSubmit}
                />

                {/* 3. ATTEMPTS TABLE */}
                <AttemptsTable
                    attempts={attempts}
                    pagination={pagination}
                    selectedIds={selectedIds}
                    handleSelectAll={handleSelectAll}
                    handleSelectOne={handleSelectOne}
                    handleBulkDelete={handleBulkDelete}
                    handleDeleteAttempt={handleDeleteAttempt}
                    searchVal={searchVal}
                    selectedTrack={selectedTrack}
                    selectedDate={selectedDate}
                />
            </PageContainer>

            {/* Unified confirmation modal component */}
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
