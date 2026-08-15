const STORAGE_KEY = 'hiraya_previous_location';
const ANCHOR_KEY = 'hiraya_back_anchor';
const SESSION_ORIGIN_KEY = 'hiraya_exam_origin';

let initialized = false;

/**
 * Maps in-app URL paths or keywords to human-readable titles for breadcrumbs and back buttons.
 */
export function getOriginTitle(pathOrName: string): string {
    const clean = pathOrName.trim().toLowerCase().replace(/^\//, '');
    const base = clean.split('?')[0].split('/')[0];

    switch (base) {
        case 'analytics':
            return 'Analytics';
        case 'dashboard':
            return 'Dashboard';
        case 'calendar':
            return 'Study Planner';
        case 'history':
            return 'History';
        case 'learn':
            return 'Learn';
        case 'drills':
            return 'Practice Drills';
        case 'exams':
            return 'Mock Exams';
        case 'guide':
            return 'Reviewer Guide';
        case 'settings':
            return 'Settings';
        default:
            if (base) {
                return base.charAt(0).toUpperCase() + base.slice(1);
            }
            return 'Home';
    }
}

/**
 * Resolves the referring origin href and title from URL query params (?from=)
 * or previous in-app navigation history.
 */
export function resolveOriginFromUrl(currentUrl?: string): { href: string; title: string } | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const search = currentUrl && currentUrl.includes('?')
        ? currentUrl.split('?')[1]
        : window.location.search;

    const params = new URLSearchParams(search);
    const fromParam = params.get('from') || params.get('return_to') || params.get('origin');

    if (fromParam) {
        const href = fromParam.startsWith('/') ? fromParam : `/${fromParam}`;
        const title = getOriginTitle(fromParam);
        return { href, title };
    }

    const sessionOrigin = getSessionOrigin();
    if (sessionOrigin) {
        const href = sessionOrigin.startsWith('/') ? sessionOrigin : `/${sessionOrigin}`;
        const title = getOriginTitle(sessionOrigin);
        return { href, title };
    }

    const backLocation = getBackLocation();
    if (backLocation) {
        const currentPath = window.location.pathname;
        const backPath = backLocation.split('?')[0];

        // Only treat as origin if it was a distinct base page
        if (backPath !== currentPath && !backPath.includes('/login') && !backPath.includes('/register')) {
            return {
                href: backLocation,
                title: getOriginTitle(backLocation),
            };
        }
    }

    return null;
}

export function setSessionOrigin(origin: string | null): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (origin) {
        sessionStorage.setItem(SESSION_ORIGIN_KEY, origin);
    } else {
        sessionStorage.removeItem(SESSION_ORIGIN_KEY);
    }
}

export function getSessionOrigin(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return sessionStorage.getItem(SESSION_ORIGIN_KEY);
}

export function clearSessionOrigin(): void {
    if (typeof window === 'undefined') {
        return;
    }

    sessionStorage.removeItem(SESSION_ORIGIN_KEY);
}

/**
 * Tracks the last in-app URL so "back" navigation can return to where the
 * user actually came from (e.g. a drill opened from Analytics goes back to
 * Analytics) instead of only following a hard-coded parent href.
 *
 * Must be registered once on the client (see app.tsx). SSR is a no-op.
 */
export function initSmartBackTracking(): void {
    if (initialized || typeof window === 'undefined') {
        return;
    }

    initialized = true;

    const recordPrevious = (): void => {
        sessionStorage.setItem(
            STORAGE_KEY,
            window.location.pathname + window.location.search,
        );
    };

    document.addEventListener('inertia:start', recordPrevious);
    window.addEventListener('pageshow', recordPrevious);
}

export function getBackLocation(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const previous = sessionStorage.getItem(STORAGE_KEY);

    if (!previous) {
        return null;
    }

    const current = window.location.pathname + window.location.search;

    return previous === current ? null : previous;
}

/**
 * Attempts to go back to the previously visited in-app page.
 * Returns `true` if it navigated back (caller should stop its default
 * action), or `false` when there is no trusted previous location.
 */
export function tryGoBack(): boolean {
    const previous = getBackLocation();

    if (previous) {
        window.history.back();

        return true;
    }

    return false;
}

/**
 * When a page has an in-app sub-view (e.g. the drill hub → category config
 * transition that never changes the URL), "back" should land back on that
 * sub-view rather than the page the user was on before. Set an anchor href to
 * make any back control navigate to it instead of browser history.
 */
export function setBackAnchor(href: string | null): void {
    if (typeof window === 'undefined') {
        return;
    }

    if (href) {
        sessionStorage.setItem(ANCHOR_KEY, href);
    } else {
        sessionStorage.removeItem(ANCHOR_KEY);
    }
}

export function getBackAnchor(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return sessionStorage.getItem(ANCHOR_KEY);
}

export function consumeBackAnchor(): string | null {
    const href = getBackAnchor();

    sessionStorage.removeItem(ANCHOR_KEY);

    return href;
}

interface BackEvent {
    preventDefault: () => void;
}

/**
 * Handlers for any "back" control (breadcrumb crumb links or explicit back
 * buttons):
 *
 * - If a back-anchor is set (in-app sub-view landed on the same URL), land on
 *   it. Links keep their default `href` navigation; buttons invoke `onFallback`.
 * - Otherwise return to the previous in-app page via browser history.
 * - Otherwise fall back to the control's default behaviour (`onFallback` for
 *   buttons, the link's `href` for links).
 */
export function makeBackOnClick(options?: {
    onFallback?: () => void;
}): (event: BackEvent) => void {
    return (event: BackEvent) => {
        if (getBackAnchor()) {
            consumeBackAnchor();

            if (options?.onFallback) {
                event.preventDefault();
                options.onFallback();
            }

            return;
        }

        if (tryGoBack()) {
            event.preventDefault();

            return;
        }

        if (options?.onFallback) {
            event.preventDefault();
            options.onFallback();
        }
    };
}