import { HelpCircle } from 'lucide-react';
import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface PageHeaderProps {
    title: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
    descriptionClassName?: string;
    tooltip?: React.ReactNode;
}

export function PageHeader({
    title,
    description,
    className = '',
    descriptionClassName = 'mt-2 text-sm text-muted-foreground',
    tooltip,
}: PageHeaderProps) {
    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {title}
                </h1>
                {tooltip && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    aria-label="Header information tooltip"
                                    className="text-muted-foreground hover:text-foreground transition-colors cursor-help inline-flex items-center justify-center rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <HelpCircle className="size-5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            {description && (
                <p className={descriptionClassName}>{description}</p>
            )}
        </div>
    );
}
