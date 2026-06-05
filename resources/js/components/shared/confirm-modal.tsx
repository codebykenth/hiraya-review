import { X, ShieldAlert } from 'lucide-react';
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
    if (!isOpen) {
        return null;
    }

    const getButtonConfig = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconColor: 'text-rose-650 dark:text-rose-500',
                    buttonVariant: 'destructive' as const,
                    buttonClass: '',
                };
            case 'info':
                return {
                    iconColor: 'text-blue-650 dark:text-blue-500',
                    buttonVariant: 'default' as const,
                    buttonClass:
                        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-3xs border-none',
                };
            default: // success
                return {
                    iconColor: 'text-emerald-650 dark:text-emerald-500',
                    buttonVariant: 'default' as const,
                    buttonClass:
                        'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-3xs border-none',
                };
        }
    };

    const config = getButtonConfig();

    return (
        <div
            className="fixed inset-0 z-[100] flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl animate-in rounded-xl border border-slate-200 bg-white p-6 shadow-xl duration-205 zoom-in-95 dark:border-slate-800 dark:bg-slate-950"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none dark:hover:bg-slate-900 dark:hover:text-slate-200"
                    aria-label="Close dialog"
                >
                    <X className="size-4.5" />
                </button>

                {/* Content */}
                <div className="flex flex-col gap-1 pr-6">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className={`size-5 ${config.iconColor}`} />
                        <h3 className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            {title}
                        </h3>
                    </div>

                    <div className="text-slate-555 dark:text-slate-450 mt-2.5 text-xs leading-relaxed whitespace-pre-line">
                        {message}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="h-9 cursor-pointer px-4.5 text-xs font-bold focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={config.buttonVariant}
                        size="sm"
                        onClick={() => {
                            onClose();
                            onConfirm();
                        }}
                        className={`h-9 cursor-pointer px-4.5 text-xs font-bold focus:outline-none ${config.buttonClass}`}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
