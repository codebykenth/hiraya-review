import { Head } from '@inertiajs/react';
import React from 'react';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
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
                <PageHeader
                    title="History"
                    description="Review your past performance, analyze detailed score breakdowns, and identify specific areas for improvement across all your exam tracks."
                    descriptionClassName="text-sm text-muted-foreground max-w-3xl leading-relaxed"
                    className="flex flex-col gap-1"
                />

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
