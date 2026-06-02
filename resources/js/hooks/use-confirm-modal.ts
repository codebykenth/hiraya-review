import { useState } from 'react';

export interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'success' | 'info';
    onConfirm: () => void;
}

const defaultState: ConfirmModalState = {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    variant: 'success',
    onConfirm: () => {},
};

export function useConfirmModal() {
    const [modal, setModal] = useState<ConfirmModalState>(defaultState);

    const open = (
        title: string,
        message: string,
        confirmLabel: string,
        onConfirm: () => void,
        variant: 'danger' | 'success' | 'info' = 'success',
    ) => {
        setModal({
            isOpen: true,
            title,
            message,
            confirmLabel,
            variant,
            onConfirm,
        });
    };

    const close = () => {
        setModal((prev) => ({ ...prev, isOpen: false }));
    };

    const confirm = async () => {
        await modal.onConfirm();
        close();
    };

    return {
        modal,
        open,
        close,
        confirm,
    };
}
