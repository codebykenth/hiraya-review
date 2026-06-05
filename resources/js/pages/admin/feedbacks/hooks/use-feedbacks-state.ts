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
    }>({ isOpen: false, id: null });
    const [filters, setFilters] = useState({
        status: 'all',
        contentType: 'all',
        search: '',
    });

    const handleStatusChange = (id: number, status: string) => {
        router.put(
            updateFeedbackStatus.url(id),
            { status },
            { preserveScroll: true },
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
            },
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
        filters,
        setFilters,
        handleStatusChange,
        confirmDelete,
        handleDelete,
        openViewModal,
        clearFilters,
        hasActiveFilters,
    };
}
