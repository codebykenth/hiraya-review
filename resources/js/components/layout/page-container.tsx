import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function PageContainer({
    children,
    className,
    ...props
}: PageContainerProps) {
    return (
        <div
            className={cn(
                'flex h-full flex-1 flex-col gap-3 sm:gap-6 overflow-y-auto rounded-xl p-4 sm:p-6',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}
