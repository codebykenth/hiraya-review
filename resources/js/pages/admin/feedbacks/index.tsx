import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    Trash2,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
} from 'lucide-react';
import { AdminTable } from '@/components/domain/admin-table';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FeedbackFilters } from './components/feedback-filters';
import { FeedbackViewModal } from './components/feedback-view-modal';
import { getFeedbacksTableColumns } from './components/feedbacks-table-columns';
import { useFeedbacksState } from './hooks/use-feedbacks-state';
import type { FeedbacksProps } from './types';

export default function FeedbacksIndex({ feedbacks }: FeedbacksProps) {
    const {
        selectedFeedback,
        isViewModalOpen,
        setIsViewModalOpen,
        deleteModal,
        setDeleteModal,
        bulkDeleteModal,
        setBulkDeleteModal,
        selectedIds,
        setSelectedIds,
        filters,
        setFilters,
        handleStatusChange,
        handleBulkStatusChange,
        confirmDelete,
        handleDelete,
        confirmBulkDelete,
        handleBulkDelete,
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

    const columns = getFeedbacksTableColumns({
        onStatusChange: handleStatusChange,
        onView: openViewModal,
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

                <FeedbackFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                />

                <AdminTable
                    data={filteredFeedbacks}
                    columns={columns}
                    title="Recent Reports"
                    legend={[
                        { icon: Clock, label: 'Pending', variant: 'amber' },
                        {
                            icon: CheckCircle2,
                            label: 'Resolved',
                            variant: 'emerald',
                        },
                        { icon: XCircle, label: 'Dismissed', variant: 'slate' },
                        { icon: Eye, label: 'View Details', variant: 'blue' },
                        { icon: Trash2, label: 'Delete', variant: 'rose' },
                    ]}
                    selectedIds={selectedIds}
                    getItemId={(f) => f.id}
                    onSelectAll={(checked, allIds) => {
                        if (checked) {
                            setSelectedIds(allIds);
                        } else {
                            setSelectedIds([]);
                        }
                    }}
                    onSelectOne={(id, checked) => {
                        if (checked) {
                            setSelectedIds((prev) => [...prev, id]);
                        } else {
                            setSelectedIds((prev) =>
                                prev.filter((selectedId) => selectedId !== id),
                            );
                        }
                    }}
                    bulkActionRender={(selectedIds) => (
                        <div className="flex items-center justify-between border-b border-border bg-blue-50/50 px-4 py-2 dark:bg-blue-950/10">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                {selectedIds.length} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <Select onValueChange={handleBulkStatusChange}>
                                    <SelectTrigger className="h-7 w-32 text-[10px]">
                                        <SelectValue placeholder="Update Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="resolved">
                                            Mark Resolved
                                        </SelectItem>
                                        <SelectItem value="dismissed">
                                            Mark Dismissed
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Mark Pending
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-7 text-[10px]"
                                    onClick={confirmBulkDelete}
                                >
                                    <Trash2 className="mr-1.5 size-3" />
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    )}
                    emptyState={{
                        icon: AlertTriangle,
                        title: 'No Reports Found',
                        description: hasActiveFilters
                            ? "We couldn't find any reports matching your active filters."
                            : 'No user reports have been submitted yet.',
                    }}
                />
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

            <ConfirmModal
                isOpen={bulkDeleteModal.isOpen}
                title="Delete Selected Reports"
                message={`Are you sure you want to delete ${bulkDeleteModal.ids.length} feedback report(s)? This action cannot be undone.`}
                confirmLabel="Delete All"
                variant="danger"
                onClose={() => setBulkDeleteModal({ isOpen: false, ids: [] })}
                onConfirm={handleBulkDelete}
            />
        </>
    );
}
