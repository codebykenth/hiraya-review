import { cn } from '@/lib/utils';

interface SectionProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
}

export default function Section({ children, id, className }: SectionProps) {
    return (
        <section
            className={cn(
                'container mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32',
                className,
            )}
            id={id}
        >
            {children}
        </section>
    );
}
