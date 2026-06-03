<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * Sets aggressive cache headers for static assets and sensible defaults
 * for dynamic pages. Works in tandem with Cloudflare CDN edge caching.
 */
class SetCacheHeaders
{
    /**
     * File extensions considered immutable (Vite hashed assets).
     *
     * @var array<string>
     */
    private const IMMUTABLE_EXTENSIONS = [
        'js', 'css', 'woff', 'woff2', 'ttf', 'eot', 'otf',
    ];

    /**
     * File extensions for static media assets.
     *
     * @var array<string>
     */
    private const MEDIA_EXTENSIONS = [
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'ico',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Skip for non-GET/HEAD methods
        if (! $request->isMethodCacheable()) {
            return $response;
        }

        $path = $request->getPathInfo();

        // Vite build assets (hashed filenames = immutable)
        if (str_starts_with($path, '/build/')) {
            return $this->applyImmutableHeaders($response);
        }

        // Static media files in /images/
        if (str_starts_with($path, '/images/')) {
            return $this->applyStaticHeaders($response, 2592000); // 30 days
        }

        // Font files
        if (str_starts_with($path, '/fonts/') || $this->hasExtension($path, self::IMMUTABLE_EXTENSIONS)) {
            return $this->applyImmutableHeaders($response);
        }

        // Favicon and other root-level static files
        if (in_array($path, ['/favicon.ico', '/favicon.svg', '/apple-touch-icon.png', '/robots.txt', '/ads.txt'])) {
            return $this->applyStaticHeaders($response, 86400); // 1 day
        }

        // Other static assets by extension
        if ($this->hasExtension($path, self::MEDIA_EXTENSIONS)) {
            return $this->applyStaticHeaders($response, 2592000); // 30 days
        }

        // Dynamic Inertia pages: private, no CDN cache, short browser cache
        if (! $response instanceof BinaryFileResponse) {
            $response->headers->set('Cache-Control', 'no-cache, private');
        }

        return $response;
    }

    /**
     * Immutable assets (Vite hashed) — cache forever at both CDN and browser.
     */
    private function applyImmutableHeaders(Response $response): Response
    {
        $response->headers->set(
            'Cache-Control',
            'public, max-age=31536000, immutable'
        );

        // Cloudflare-specific: cache at edge for 1 year
        $response->headers->set('CDN-Cache-Control', 'public, max-age=31536000');

        return $response;
    }

    /**
     * Static assets — long cache with revalidation.
     */
    private function applyStaticHeaders(Response $response, int $maxAge): Response
    {
        $response->headers->set(
            'Cache-Control',
            "public, max-age={$maxAge}, s-maxage={$maxAge}"
        );

        $response->headers->set('CDN-Cache-Control', "public, max-age={$maxAge}");

        return $response;
    }

    /**
     * Check if a path ends with one of the given extensions.
     */
    private function hasExtension(string $path, array $extensions): bool
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return in_array($extension, $extensions);
    }
}
