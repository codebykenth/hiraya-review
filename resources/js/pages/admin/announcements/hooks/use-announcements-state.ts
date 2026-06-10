import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    store as storeAnnouncement,
    update as updateAnnouncement,
    destroy as destroyAnnouncement,
} from '@/routes/admin/announcements';

interface Announcement {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    is_active: boolean;
    expires_at: string | null;
    created_at: string;
}

export function useAnnouncementsState() {
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] =
        useState<Announcement | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        id: number | null;
    }>({ isOpen: false, id: null });

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            title: '',
            message: '',
            type: 'info' as 'info' | 'warning' | 'success',
            is_active: true,
            expires_at: '',
        });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(storeAnnouncement.url(), {
            onSuccess: () => {
                setIsSheetOpen(false);
                reset();
                clearErrors();
            },
        });
    };

    const openEditModal = (announcement: Announcement) => {
        setEditingAnnouncement(announcement);
        const expiresAt = announcement.expires_at
            ? new Date(announcement.expires_at)
            : null;
        let formattedDate = '';

        if (expiresAt) {
            const year = expiresAt.getFullYear();
            const month = String(expiresAt.getMonth() + 1).padStart(2, '0');
            const day = String(expiresAt.getDate()).padStart(2, '0');
            const hours = String(expiresAt.getHours()).padStart(2, '0');
            const minutes = String(expiresAt.getMinutes()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        setData({
            title: announcement.title,
            message: announcement.message,
            type: announcement.type,
            is_active: announcement.is_active,
            expires_at: formattedDate,
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingAnnouncement) {
            return;
        }

        put(updateAnnouncement.url(editingAnnouncement.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setEditingAnnouncement(null);
                reset();
                clearErrors();
            },
        });
    };

    const confirmDelete = (id: number) => {
        setDeleteModal({ isOpen: true, id });
    };

    const handleDelete = () => {
        if (!deleteModal.id) {
            return;
        }

        router.delete(destroyAnnouncement.url(deleteModal.id), {
            onSuccess: () => {
                setDeleteModal({ isOpen: false, id: null });
            },
        });
    };

    const toggleStatus = (
        id: number,
        currentStatus: boolean,
        announcement: Announcement,
    ) => {
        router.put(
            updateAnnouncement.url(id),
            {
                ...announcement,
                is_active: !currentStatus,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsSheetOpen(true);
    };

    const closeCreateModal = () => {
        reset();
        clearErrors();
        setIsSheetOpen(false);
    };

    const closeEditModal = () => {
        reset();
        clearErrors();
        setIsEditModalOpen(false);
        setEditingAnnouncement(null);
    };

    return {
        isSheetOpen,
        setIsSheetOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        editingAnnouncement,
        deleteModal,
        setDeleteModal,
        data,
        setData,
        processing,
        errors,
        handleCreate,
        openEditModal,
        openCreateModal,
        handleUpdate,
        confirmDelete,
        handleDelete,
        toggleStatus,
        closeCreateModal,
        closeEditModal,
    };
}
