import React from 'react';

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
}: PageHeaderProps) {
    return (
        <div className={className}>
            <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-foreground sm:text-5xl md:text-4xl">
                    {title}
                </h1>
                {/* Tooltip removed per request */}
            </div>
            {description && (
                <p className={descriptionClassName}>{description}</p>
            )}
        </div>
    );
}
