import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(
    url: NonNullable<InertiaLinkProps['href'] | { url: string }>,
): string {
    if (typeof url === 'string') {
        return url;
    }

    if (
        typeof url === 'object' &&
        url !== null &&
        'url' in url &&
        typeof (url as any).url === 'string'
    ) {
        return (url as any).url;
    }

    return url.toString();
}

export function generatePaginationLinks(
    currentPage: number,
    totalPages: number,
): (number | string)[] {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (currentPage <= 4) {
            pages.push(1, 2, 3, 4, 5, '...', totalPages);
        } else if (currentPage >= totalPages - 3) {
            pages.push(
                1,
                '...',
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            );
        } else {
            pages.push(
                1,
                '...',
                currentPage - 1,
                currentPage,
                currentPage + 1,
                '...',
                totalPages,
            );
        }
    }

    return pages;
}
