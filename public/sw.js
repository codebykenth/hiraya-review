const CACHE_NAME = 'hiraya-review-v1';
const STATIC_CACHE_NAME = 'hiraya-review-static-v1';
const STATIC_CACHE_LIMIT = 100;

const PRECACHE_ASSETS = [
    '/',
    '/manifest.json',
    '/images/hiraya_logo_cropped.png',
    '/images/hiraya_logo.png',
    '/favicon.ico',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
];

// Routes that must NEVER be served from cache (authenticated / sensitive)
const AUTH_ROUTES = [
    '/dashboard',
    '/settings',
    '/analytics',
    '/history',
    '/drills',
    '/study-schedules',
    '/study-suggestions',
    '/admin',
    '/api',
    '/sanctum',
    '/livewire',
    '/_debugbar',
    '/login',
    '/register',
    '/logout',
    '/auth',
    '/broadcasting',
];

// ---------------------------------------------------------------------------
// Install — pre-cache shell assets
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) =>
            Promise.allSettled(
                PRECACHE_ASSETS.map((url) =>
                    cache.add(url).catch((err) => {
                        console.warn(`[SW] pre-cache miss: ${url}`, err);
                    }),
                ),
            ),
        ),
    );
    self.skipWaiting();
});

// ---------------------------------------------------------------------------
// Activate — purge old caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
    const KEEP = new Set([CACHE_NAME, STATIC_CACHE_NAME]);
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => !KEEP.has(k)).map((k) => caches.delete(k)),
            ),
        ),
    );
    self.clients.claim();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isAuthRoute(pathname) {
    return AUTH_ROUTES.some((r) => pathname.startsWith(r));
}

async function trimCache(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        await cache.delete(keys[0]);
        return trimCache(cacheName, maxItems);
    }
}

// ---------------------------------------------------------------------------
// Fetch — strategy router
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
    // Only handle GET
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip cross-origin requests (CDNs, analytics, ads, etc.)
    if (url.origin !== self.location.origin) return;

    // Skip Vite dev server requests
    if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/@fs') || url.pathname.startsWith('/resources/')) return;

    // Skip auth / admin / API routes entirely — always go to network
    if (isAuthRoute(url.pathname)) return;

    // ---- Cache-First: content-hashed build assets only (/build/assets/) ----
    if (url.pathname.startsWith('/build/assets/')) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request, { credentials: 'same-origin' }).then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const clone = response.clone();
                        caches.open(STATIC_CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone);
                            trimCache(STATIC_CACHE_NAME, STATIC_CACHE_LIMIT);
                        });
                    }
                    return response;
                });
            }),
        );
        return;
    }

    // ---- Stale-While-Revalidate: images, fonts, favicon, manifest ----
    const isStaticAsset =
        url.pathname.startsWith('/images/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.endsWith('.woff2') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.svg') ||
        url.pathname === '/manifest.json';

    if (isStaticAsset) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                const networkFetch = fetch(event.request, { credentials: 'same-origin' })
                    .then((response) => {
                        if (response && response.status === 200 && response.type === 'basic') {
                            const clone = response.clone();
                            caches.open(STATIC_CACHE_NAME).then((cache) => {
                                cache.put(event.request, clone);
                                trimCache(STATIC_CACHE_NAME, STATIC_CACHE_LIMIT);
                            });
                        }
                        return response;
                    })
                    .catch(() => cached);
                return cached || networkFetch;
            }),
        );
        return;
    }

    // ---- Network-First: public pages (/, /about, /learn, /exams, etc.) ----
    const isHTMLRequest = event.request.headers.get('accept')?.includes('text/html');

    if (isHTMLRequest) {
        event.respondWith(
            fetch(event.request, { credentials: 'same-origin' })
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(event.request).then((cached) => cached || caches.match('/')),
                ),
        );
        return;
    }

    // Everything else — network only, no caching
});
