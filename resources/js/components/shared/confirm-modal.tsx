import { AlertTriangle, CheckCircle2, Info, Loader2, ShieldAlert } from 'lucide-react';
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
    variant?: 'danger' | 'warning' | 'info' | 'success';
    verificationText?: string;
    isLoading?: boolean;
    hideCancel?: boolean;
    customIcon?: React.ReactNode;
    children?: React.ReactNode;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'success',
    verificationText,
    isLoading = false,
    hideCancel = false,
    customIcon,
    children,
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    const [verifyInput, setVerifyInput] = useState('');

    const handleClose = () => {
        if (isLoading) {
            return;
        }

        setVerifyInput('');
        onClose();
    };

    const getVariantConfig = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: <ShieldAlert className="size-5 text-rose-650 dark:text-rose-500" />,
                    buttonVariant: 'destructive' as const,
                    buttonClass: '',
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />,
                    buttonVariant: 'default' as const,
                    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white font-semibold',
                };
            case 'info':
                return {
                    icon: <Info className="size-5 text-blue-650 dark:text-blue-500" />,
                    buttonVariant: 'default' as const,
                    buttonClass: '',
                };
            default: // success
                return {
                    icon: <CheckCircle2 className="size-5 text-emerald-650 dark:text-emerald-500" />,
                    buttonVariant: 'default' as const,
                    buttonClass: '',
                };
        }
    };

    const config = getVariantConfig();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        {customIcon ?? config.icon}
                        <DialogTitle className="text-base font-bold text-foreground">{title}</DialogTitle>
                    </div>
                    {message && (
                        <DialogDescription className="mt-2.5 text-left whitespace-pre-line text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                            {message}
                        </DialogDescription>
                    )}

                    {children && <div className="mt-3">{children}</div>}

                    {verificationText && (
                        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-left">
                            <label className="text-xs sm:text-sm font-semibold text-foreground">
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
                                className="font-mono text-xs sm:text-sm"
                                autoComplete="off"
                                autoCorrect="off"
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </DialogHeader>

                <DialogFooter className="mt-4 gap-2 sm:gap-2">
                    {!hideCancel && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="text-xs"
                        >
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        variant={config.buttonVariant}
                        className={config.buttonClass ? `${config.buttonClass} text-xs gap-1.5` : 'text-xs gap-1.5'}
                        size="sm"
                        disabled={
                            isLoading ||
                            (verificationText ? verifyInput !== verificationText : false)
                        }
                        onClick={async () => {
                            await onConfirm();
                        }}
                    >
                        {isLoading && <Loader2 className="size-3.5 animate-spin" />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
