import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.ComponentProps<'div'> {
    value?: number | null;
    max?: number;
}

function Progress({
    className,
    value = 0,
    max = 100,
    ...props
}: ProgressProps) {
    const percentage = Math.min(100, Math.max(0, ((value ?? 0) / max) * 100));

    return (
        <div
            data-slot="progress"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={value ?? 0}
            className={cn(
                'relative h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800',
                className,
            )}
            {...props}
        >
            <div
                data-slot="progress-indicator"
                className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-out"
                style={{ transform: `translateX(-${100 - percentage}%)` }}
            />
        </div>
    );
}

export { Progress };
