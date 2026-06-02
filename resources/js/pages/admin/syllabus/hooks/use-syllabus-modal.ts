import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { ConfirmModalState } from '../types';

export function useSyllabusModal() {
    const [modal, setModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'danger',
        onConfirm: () => {},
    });

    const openDeleteCategory = (
        catId: number,
        selectedCategoryId: number | null,
    ) => {
        setModal({
            isOpen: true,
            title: 'Delete Category?',
            message:
                'Are you sure you want to delete this category? This action cannot be undone and will permanently delete all of its mapped subcategories!',
            confirmLabel: 'Delete Category',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/questions/categories/${catId}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (selectedCategoryId === catId) {
                            // Logic for selecting next category moved to component
                        }
                    },
                });
            },
        });
    };

    const openDeleteSubcategory = (subId: number) => {
        setModal({
            isOpen: true,
            title: 'Delete Subcategory?',
            message:
                'Are you sure you want to delete this subcategory? This action cannot be undone.',
            confirmLabel: 'Delete Subcategory',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/questions/subcategories/${subId}`, {
                    preserveScroll: true,
                });
            },
        });
    };

    const closeModal = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    const confirmAction = () => {
        modal.onConfirm();
        closeModal();
    };

    return {
        modal,
        openDeleteCategory,
        openDeleteSubcategory,
        closeModal,
        confirmAction,
    };
}
