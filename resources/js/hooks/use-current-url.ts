import type { InertiaLinkProps } from '@inertiajs/react';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useSyncExternalStore } from 'react';
import { toUrl } from '@/lib/utils';

// Global optimistic URL store so all navigation elements react instantly on click
let optimisticUrl: string | null = null;
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

function getSnapshot(): string | null {
    return optimisticUrl;
}

export function setOptimisticUrl(url: string | null) {
    if (optimisticUrl !== url) {
        optimisticUrl = url;
        listeners.forEach((listener) => listener());
    }
}

// Automatically sync with Inertia visit lifecycle
if (typeof window !== 'undefined') {
    const handleNavigationStart = (event: any) => {
        const visit = event?.detail?.visit;
        if (
            !visit ||
            visit.prefetch ||
            visit.headers?.['Purpose'] === 'prefetch' ||
            visit.headers?.['X-Inertia-Prefetch']
        ) {
            return;
        }

        const method = visit.method
            ? String(visit.method).toLowerCase()
            : 'get';
        if (method === 'get') {
            let target = '';
            if (typeof visit.url === 'string') {
                target = visit.url;
            } else if (visit.url instanceof URL) {
                target = visit.url.pathname + visit.url.search;
            } else if (visit.url?.pathname) {
                target = visit.url.pathname;
            }

            if (target) {
                setOptimisticUrl(target);
            }
        }
    };

    const handleNavigationError = (event?: any) => {
        const visit = event?.detail?.visit;
        if (visit?.prefetch) {
            return;
        }
        setOptimisticUrl(null);
    };

    const handleNavigationFinish = (event?: any) => {
        const visit = event?.detail?.visit;
        if (visit?.prefetch) {
            return;
        }
        // Fallback: clear optimistic state after React has committed the new page
        setTimeout(() => {
            setOptimisticUrl(null);
        }, 100);
    };

    router.on('before', handleNavigationStart);
    router.on('start', handleNavigationStart);
    router.on('finish', handleNavigationFinish);
    router.on('error', handleNavigationError);
    router.on('cancel', handleNavigationError);
}

export type IsCurrentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href'] | { url: string }>,
    currentUrl?: string,
    startsWith?: boolean,
) => boolean;

export type IsCurrentOrParentUrlFn = (
    urlToCheck: NonNullable<InertiaLinkProps['href'] | { url: string }>,
    currentUrl?: string,
) => boolean;

export type WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
    urlToCheck: NonNullable<InertiaLinkProps['href'] | { url: string }>,
    ifTrue: TIfTrue,
    ifFalse?: TIfFalse,
) => TIfTrue | TIfFalse;

export type UseCurrentUrlReturn = {
    currentUrl: string;
    isCurrentUrl: IsCurrentUrlFn;
    isCurrentOrParentUrl: IsCurrentOrParentUrlFn;
    whenCurrentUrl: WhenCurrentUrlFn;
    setOptimisticUrl: (url: string | null) => void;
};

export function useCurrentUrl(): UseCurrentUrlReturn {
    const page = usePage();
    const activeOptimistic = useSyncExternalStore(
        subscribe,
        getSnapshot,
        () => null,
    );

    const actualUrlPath = new URL(
        page.url,
        typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost',
    ).pathname;

    useEffect(() => {
        if (activeOptimistic) {
            const cleanOptimistic =
                (activeOptimistic.startsWith('http')
                    ? new URL(activeOptimistic).pathname
                    : activeOptimistic.split('?')[0]
                )
                    .replace(/\/$/, '')
                    .trim() || '/';

            const cleanActual = actualUrlPath.replace(/\/$/, '').trim() || '/';

            if (
                cleanActual === cleanOptimistic ||
                cleanActual.startsWith(cleanOptimistic + '/')
            ) {
                setOptimisticUrl(null);
            }
        }
    }, [actualUrlPath, activeOptimistic]);

    const currentUrlPath = activeOptimistic
        ? activeOptimistic.startsWith('http')
            ? new URL(activeOptimistic).pathname
            : activeOptimistic.split('?')[0]
        : actualUrlPath;

    const isCurrentUrl: IsCurrentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href'] | { url: string }>,
        currentUrl?: string,
        startsWith: boolean = false,
    ) => {
        const urlToCompare = currentUrl ?? currentUrlPath;
        const urlString = toUrl(urlToCheck);

        const comparePath = (path: string): boolean =>
            startsWith ? urlToCompare.startsWith(path) : path === urlToCompare;

        if (!urlString.startsWith('http')) {
            const cleanUrl = urlString.split('?')[0];
            return comparePath(cleanUrl);
        }

        try {
            const absoluteUrl = new URL(urlString);

            return comparePath(absoluteUrl.pathname);
        } catch {
            return false;
        }
    };

    const isCurrentOrParentUrl: IsCurrentOrParentUrlFn = (
        urlToCheck: NonNullable<InertiaLinkProps['href'] | { url: string }>,
        currentUrl?: string,
    ) => {
        return isCurrentUrl(urlToCheck, currentUrl, true);
    };

    const whenCurrentUrl: WhenCurrentUrlFn = <TIfTrue, TIfFalse = null>(
        urlToCheck: NonNullable<InertiaLinkProps['href'] | { url: string }>,
        ifTrue: TIfTrue,
        ifFalse: TIfFalse = null as TIfFalse,
    ): TIfTrue | TIfFalse => {
        return isCurrentUrl(urlToCheck) ? ifTrue : ifFalse;
    };

    return {
        currentUrl: currentUrlPath,
        isCurrentUrl,
        isCurrentOrParentUrl,
        whenCurrentUrl,
        setOptimisticUrl,
    };
}
