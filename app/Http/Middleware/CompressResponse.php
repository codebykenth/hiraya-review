<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Compresses responses using gzip/deflate when the client supports it.
 * Cloudflare also compresses at the edge, but this ensures origin
 * responses are compressed for faster transfer to CF's edge servers.
 */
class CompressResponse
{
    /**
     * Content types eligible for compression.
     *
     * @var array<string>
     */
    private const COMPRESSIBLE_TYPES = [
        'text/html',
        'text/css',
        'text/javascript',
        'application/javascript',
        'application/json',
        'application/xml',
        'text/xml',
        'image/svg+xml',
        'text/plain',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Skip if already encoded or no acceptable encoding
        if ($response->headers->has('Content-Encoding')) {
            return $response;
        }

        $acceptEncoding = $request->headers->get('Accept-Encoding', '');
        $contentType = $response->headers->get('Content-Type', '');

        // Only compress eligible content types
        if (! $this->isCompressible($contentType)) {
            return $response;
        }

        $content = $response->getContent();

        // Skip small payloads (< 1KB) — compression overhead not worth it
        if ($content === false || strlen($content) < 1024) {
            return $response;
        }

        if (str_contains($acceptEncoding, 'gzip') && function_exists('gzencode')) {
            $compressed = gzencode($content, 6);
            if ($compressed !== false) {
                $response->setContent($compressed);
                $response->headers->set('Content-Encoding', 'gzip');
                $response->headers->set('Vary', 'Accept-Encoding');
                $response->headers->remove('Content-Length');
            }
        }

        return $response;
    }

    private function isCompressible(string $contentType): bool
    {
        foreach (self::COMPRESSIBLE_TYPES as $type) {
            if (str_starts_with($contentType, $type)) {
                return true;
            }
        }

        return false;
    }
}
