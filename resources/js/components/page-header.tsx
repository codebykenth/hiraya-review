import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    className?: string;
    descriptionClassName?: string;
}

export function PageHeader({
    title,
    description,
    className = '',
    descriptionClassName = 'mt-2 text-sm text-muted-foreground'
}: PageHeaderProps) {
    return (
        <div className={className}>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {title}
            </h1>
            {description && (
                <p className={descriptionClassName}>
                    {description}
                </p>
            )}
        </div>
    );
}
