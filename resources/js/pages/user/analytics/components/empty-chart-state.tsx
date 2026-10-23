import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface EmptyChartStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: React.ComponentProps<typeof Link>['href'];
    actionIcon?: LucideIcon;
    className?: string;
}

export function EmptyChartState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    actionIcon: ActionIcon,
    className,
}: EmptyChartStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-white/40 p-6 text-center dark:border-slate-800 dark:bg-slate-900/30',
                className,
            )}
        >
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 shadow-2xs dark:bg-slate-800 dark:text-slate-400">
                <Icon className="size-5.5" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                {title}
            </h4>
            <p className="mt-1 max-w-xs text-xs leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                {description}
            </p>
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className={cn(
                        buttonVariants({ variant: 'default', size: 'sm' }),
                        'mt-3.5 h-8 gap-1.5 rounded-lg px-3 text-xs font-bold shadow-2xs',
                    )}
                >
                    {ActionIcon && <ActionIcon className="size-3.5" />}
                    <span>{actionLabel}</span>
                </Link>
            )}
        </div>
    );
}
