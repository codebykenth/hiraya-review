import { Head } from '@inertiajs/react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from './components/empty-state';
import { FeedbackFilters } from './components/feedback-filters';
import { FeedbackItem } from './components/feedback-item';
import { FeedbackViewModal } from './components/feedback-view-modal';
import { useFeedbacksState } from './hooks/use-feedbacks-state';
import type { FeedbacksProps } from './types';

export default function FeedbacksIndex({ feedbacks }: FeedbacksProps) {
    const {
        selectedFeedback,
        isViewModalOpen,
        setIsViewModalOpen,
        deleteModal,
        setDeleteModal,
        filters,
        setFilters,
        handleStatusChange,
        confirmDelete,
        handleDelete,
        openViewModal,
        clearFilters,
        hasActiveFilters,
    } = useFeedbacksState();

    const filteredFeedbacks = feedbacks.data.filter((feedback) => {
        const matchesStatus =
            filters.status === 'all' || feedback.status === filters.status;
        const matchesContentType =
            filters.contentType === 'all' ||
            (filters.contentType === 'Question' &&
                feedback.flaggable_type.includes('Question')) ||
            (filters.contentType === 'Module' &&
                feedback.flaggable_type.includes('LearnModule'));
        const matchesSearch =
            filters.search === '' ||
            feedback.user.name
                .toLowerCase()
                .includes(filters.search.toLowerCase()) ||
            feedback.reason
                .toLowerCase()
                .includes(filters.search.toLowerCase());

        return matchesStatus && matchesContentType && matchesSearch;
    });

    return (
        <>
            <Head title="Feedback & Flagged Content" />

            <PageContainer>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <PageHeader
                        title="Flagged Content Hub"
                        description="Review and resolve user-reported issues on questions and learning modules."
                    />
                </div>

                <Card className="mt-6">
                    <CardHeader className="border-b border-border bg-muted/40 pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <CardTitle className="text-lg">
                                Recent Reports
                            </CardTitle>
                            <FeedbackFilters
                                filters={filters}
                                onFiltersChange={setFilters}
                                onClearFilters={clearFilters}
                                hasActiveFilters={hasActiveFilters}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredFeedbacks.length === 0 ? (
                            <EmptyState
                                hasActiveFilters={hasActiveFilters}
                                onClearFilters={clearFilters}
                            />
                        ) : (
                            <div className="divide-y divide-border">
                                {filteredFeedbacks.map((feedback) => (
                                    <FeedbackItem
                                        key={feedback.id}
                                        feedback={feedback}
                                        onStatusChange={handleStatusChange}
                                        onView={openViewModal}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </PageContainer>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <FeedbackViewModal
                    feedback={selectedFeedback}
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    onStatusChange={handleStatusChange}
                    onDelete={confirmDelete}
                />
            </Dialog>

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Report"
                message="Are you sure you want to delete this feedback report? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                onClose={() => setDeleteModal({ isOpen: false, id: null })}
                onConfirm={handleDelete}
            />
        </>
    );
}
