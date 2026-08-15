import type React from 'react';
import { useState } from 'react';

export interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    variant: 'danger' | 'warning' | 'success' | 'info';
    verificationText?: string;
    isLoading?: boolean;
    hideCancel?: boolean;
    onConfirm: () => void | Promise<void>;
}

const defaultState: ConfirmModalState = {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    variant: 'success',
    isLoading: false,
    hideCancel: false,
    onConfirm: () => {},
};

export function useConfirmModal() {
    const [modal, setModal] = useState<ConfirmModalState>(defaultState);

    const open = (
        title: string,
        message: string | React.ReactNode,
        confirmLabel = 'Confirm',
        onConfirm: () => void | Promise<void> = () => {},
        variant: 'danger' | 'warning' | 'success' | 'info' = 'success',
        options?: {
            cancelLabel?: string;
            verificationText?: string;
            hideCancel?: boolean;
        }
    ) => {
        setModal({
            isOpen: true,
            title,
            message,
            confirmLabel,
            cancelLabel: options?.cancelLabel ?? 'Cancel',
            variant,
            verificationText: options?.verificationText,
            hideCancel: options?.hideCancel ?? false,
            isLoading: false,
            onConfirm,
        });
    };

    const close = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    const confirm = async () => {
        setModal((prev) => ({ ...prev, isLoading: true }));

        try {
            await modal.onConfirm();
        } finally {
            close();
        }
    };

    return {
        modal,
        open,
        close,
        confirm,
        setModal,
    };
}
