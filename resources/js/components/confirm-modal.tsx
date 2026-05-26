import React from 'react';
import { X, ShieldAlert } from 'lucide-react';
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
    onConfirm
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getButtonConfig = () => {
        switch (variant) {
            case 'danger':
                return {
                    iconColor: 'text-rose-650 dark:text-rose-500',
                    buttonVariant: 'destructive' as const,
                    buttonClass: ''
                };
            case 'info':
                return {
                    iconColor: 'text-blue-650 dark:text-blue-500',
                    buttonVariant: 'default' as const,
                    buttonClass: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-3xs border-none'
                };
            default: // success
                return {
                    iconColor: 'text-emerald-650 dark:text-emerald-500',
                    buttonVariant: 'default' as const,
                    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-3xs border-none'
                };
        }
    };

    const config = getButtonConfig();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div 
                className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950 animate-in zoom-in-95 duration-205"
                role="dialog"
                aria-modal="true"
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition focus:outline-none cursor-pointer"
                    aria-label="Close dialog"
                >
                    <X className="size-4.5" />
                </button>

                {/* Content */}
                <div className="flex flex-col gap-1 pr-6">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className={`size-5 ${config.iconColor}`} />
                        <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                    
                    <div className="mt-2.5 text-xs leading-relaxed text-slate-555 dark:text-slate-450 whitespace-pre-line">
                        {message}
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="h-9 px-4.5 font-bold text-xs cursor-pointer focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900"
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
                        className={`h-9 px-4.5 font-bold text-xs cursor-pointer focus:outline-none ${config.buttonClass}`}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
