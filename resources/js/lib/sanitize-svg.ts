/**
 * Sanitizes an SVG string to prevent XSS attacks.
 * Strips scripts, event handlers, javascript: URIs, and foreignObject elements
 * while preserving valid SVG rendering markup.
 *
 * Zero external dependencies — works in both browser and SSR.
 */
export function sanitizeSvg(svgString: string): string {
    if (!svgString) {
        return '';
    }

    let sanitized = svgString;

    // Remove <script> tags and their contents
    sanitized = sanitized.replace(/<script[\s>][\s\S]*?<\/script\s*>/gi, '');
    sanitized = sanitized.replace(/<script[\s/][^>]*>/gi, '');

    // Remove <foreignObject> tags (can embed arbitrary HTML)
    sanitized = sanitized.replace(
        /<foreignObject[\s>][\s\S]*?<\/foreignObject\s*>/gi,
        '',
    );

    // Remove <iframe>, <embed>, <object>, <applet> tags
    sanitized = sanitized.replace(
        /<(iframe|embed|object|applet)[\s>][\s\S]*?<\/\1\s*>/gi,
        '',
    );
    sanitized = sanitized.replace(
        /<(iframe|embed|object|applet)[\s/][^>]*>/gi,
        '',
    );

    // Remove all on* event handler attributes (onclick, onload, onerror, etc.)
    sanitized = sanitized.replace(
        /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi,
        '',
    );

    // Remove javascript:, vbscript:, and data: URIs from href/xlink:href/src attributes
    sanitized = sanitized.replace(
        /(href|xlink:href|src)\s*=\s*(?:"[^"]*(?:javascript|vbscript|data)\s*:[^"]*"|'[^']*(?:javascript|vbscript|data)\s*:[^']*')/gi,
        '',
    );

    // Remove <set> and <animate*> tags that can trigger JS via attributeName="href" + to="javascript:..."
    sanitized = sanitized.replace(
        /<(set|animate[a-z]*)\s[^>]*(?:javascript|vbscript)[^>]*\/?>/gi,
        '',
    );

    return sanitized;
}
