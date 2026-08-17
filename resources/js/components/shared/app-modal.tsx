import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface AppModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
}

const sizeClasses: Record<NonNullable<AppModalProps['size']>, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
    full: 'sm:max-w-4xl',
};

export function AppModal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    className,
    size = 'md',
}: AppModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className={cn(sizeClasses[size], 'max-h-[90vh] overflow-y-auto', className)}>
                {(title || description) && (
                    <DialogHeader>
                        {title && <DialogTitle className="font-heading text-lg font-black">{title}</DialogTitle>}
                        {description && (
                            <DialogDescription className="text-xs text-muted-foreground">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                )}

                <div className="py-2">{children}</div>

                {footer && <DialogFooter>{footer}</DialogFooter>}
            </DialogContent>
        </Dialog>
    );
}
