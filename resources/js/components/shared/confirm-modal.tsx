import { ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'success' | 'info';
    verificationText?: string;
    onClose: () => void;
    onConfirm: () => void;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'success',
    verificationText,
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    const [verifyInput, setVerifyInput] = useState('');

    const handleClose = () => {
        setVerifyInput('');
        onClose();
    };
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
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className={`size-5 ${config.iconColor}`} />
                        <DialogTitle>{title}</DialogTitle>
                    </div>
                    <DialogDescription className="mt-2.5 text-left whitespace-pre-line text-slate-600 dark:text-slate-400">
                        {message}
                    </DialogDescription>

                    {verificationText && (
                        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-left">
                            <label className="text-sm font-semibold text-foreground">
                                To confirm, type{' '}
                                <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs font-bold text-foreground select-all">
                                    {verificationText}
                                </span>{' '}
                                below:
                            </label>
                            <Input
                                type="text"
                                value={verifyInput}
                                onChange={(e) => setVerifyInput(e.target.value)}
                                placeholder={verificationText}
                                className="font-mono text-sm"
                                autoComplete="off"
                                autoCorrect="off"
                            />
                        </div>
                    )}
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-2">
                    <Button variant="outline" size="sm" onClick={handleClose}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        size="sm"
                        disabled={
                            verificationText
                                ? verifyInput !== verificationText
                                : false
                        }
                        onClick={() => {
                            handleClose();
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
