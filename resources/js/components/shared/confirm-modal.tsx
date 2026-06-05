import { ShieldAlert } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'success' | 'info';
    onClose: () => void;
    onConfirm: () => void;
}

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'success',
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    const getButtonConfig = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconColor: 'text-rose-650 dark:text-rose-500',
                    buttonVariant: 'destructive' as const,
                };
            case 'info':
                return {
                    iconColor: 'text-blue-650 dark:text-blue-500',
                    buttonVariant: 'default' as const,
                };
            default: // success
                return {
                    iconColor: 'text-emerald-650 dark:text-emerald-500',
                    buttonVariant: 'default' as const,
                };
        }
    };

    const config = getButtonConfig();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className={`size-5 ${config.iconColor}`} />
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="mt-2.5 text-left whitespace-pre-line">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-2">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        size="sm"
                        onClick={() => {
                            onClose();
                            onConfirm();
                        }}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
