import { router } from '@inertiajs/react';
import { useState } from 'react';
import {
    updateStatus as updateFeedbackStatus,
    destroy as destroyFeedback,
} from '@/routes/admin/feedbacks';
import type { Feedback } from '../types';

export function useFeedbacksState() {
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
        null,
    );
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        id: number | null;
        currentStatus?: string;
    }>({ isOpen: false, id: null });
    const [bulkDeleteModal, setBulkDeleteModal] = useState<{
        isOpen: boolean;
        ids: number[];
    }>({ isOpen: false, ids: [] });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filters, setFilters] = useState({
        status: 'all',
        contentType: 'all',
        search: '',
    });

    const handleStatusChange = (id: number, status: string) => {
        router.put(
            updateFeedbackStatus.url(id),
            { status },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Dispatch event to refresh count from server
                    window.dispatchEvent(
                        new CustomEvent('feedback_count_refresh'),
                    );
                },
            },
        );
    };

    const handleBulkStatusChange = (status: string) => {
        if (selectedIds.length === 0) {
            return;
        }

        router.put(
            '/admin/feedbacks/bulk-update',
            { ids: selectedIds, status },
            {
                onSuccess: () => {
                    setSelectedIds([]);
                    // Dispatch event to refresh count from server
                    window.dispatchEvent(
                        new CustomEvent('feedback_count_refresh'),
                    );
                },
                preserveScroll: true,
            },
        );
    };

    const confirmBulkDelete = () => {
        if (selectedIds.length === 0) {
            return;
        }

        setBulkDeleteModal({ isOpen: true, ids: selectedIds });
    };

    const handleBulkDelete = () => {
        if (bulkDeleteModal.ids.length === 0) {
            return;
        }

        router.delete('/admin/feedbacks/bulk-delete', {
            data: { ids: bulkDeleteModal.ids },
            onSuccess: () => {
                setBulkDeleteModal({ isOpen: false, ids: [] });
                setSelectedIds([]);
                // Dispatch event to refresh count from server
                window.dispatchEvent(new CustomEvent('feedback_count_refresh'));
            },
            preserveScroll: true,
        });
    };

    const toggleSelection = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((selectedId) => selectedId !== id)
                : [...prev, id],
        );
    };

    const toggleSelectAll = (allIds: number[]) => {
        setSelectedIds((prev) =>
            prev.length === allIds.length && allIds.length > 0 ? [] : allIds,
        );
    };

    const confirmDelete = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const handleDelete = () => {
        if (!deleteModal.id) {
            return;
        }

        router.delete(destroyFeedback.url(deleteModal.id), {
            onSuccess: () => {
                setDeleteModal({ isOpen: false, id: null });
                setIsViewModalOpen(false);
                // Dispatch event to refresh count from server
                window.dispatchEvent(new CustomEvent('feedback_count_refresh'));
            },
            preserveScroll: true,
        });
    };

    const openViewModal = (feedback: Feedback) => {
        setSelectedFeedback(feedback);
        setIsViewModalOpen(true);
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            contentType: 'all',
            search: '',
        });
    };

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.contentType !== 'all' ||
        filters.search !== '';

    return {
        selectedFeedback,
        setSelectedFeedback,
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
        toggleSelection,
        toggleSelectAll,
        openViewModal,
        clearFilters,
        hasActiveFilters,
    };
}
