interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
}

export default function SectionHeader({
    title,
    subtitle,
    align = 'center',
    className = '',
}: SectionHeaderProps) {
    const alignmentClasses = {
        left: 'text-left items-start',
        center: 'text-center items-center',
        right: 'text-right items-end',
    };

    return (
        <div
            className={`mb-16 flex w-full flex-col gap-3 ${alignmentClasses[align]} ${className}`}
        >
            <h2 className="font-heading text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {title}
            </h2>
            {subtitle && (
                <p className="w-full max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
