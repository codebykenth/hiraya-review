import { useEffect, useRef } from 'react';

interface TurnstileProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    theme?: 'light' | 'dark' | 'auto';
    size?: 'normal' | 'compact';
}

declare global {
    interface Window {
        turnstile: {
            render: (
                container: string | HTMLElement,
                options: {
                    sitekey: string;
                    callback: (token: string) => void;
                    'error-callback'?: () => void;
                    'expired-callback'?: () => void;
                    theme?: 'light' | 'dark' | 'auto';
                    size?: 'normal' | 'compact';
                },
            ) => string;
            reset: (widgetId?: string) => void;
            remove: (widgetId: string) => void; // Added missing remove method
        };
    }
}

export default function TurnstileWidget({
    siteKey,
    onVerify,
    onError,
    onExpire,
    theme = 'auto',
    size = 'normal',
}: TurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Store callbacks in a ref so they don't trigger useEffect re-runs
    const callbacks = useRef({ onVerify, onError, onExpire });
    useEffect(() => {
        callbacks.current = { onVerify, onError, onExpire };
    }, [onVerify, onError, onExpire]);

    useEffect(() => {
        const renderWidget = () => {
            // Prevent double-rendering
            if (
                !window.turnstile ||
                !containerRef.current ||
                widgetIdRef.current
            ) {
return;
}

            widgetIdRef.current = window.turnstile.render(
                containerRef.current,
                {
                    sitekey: siteKey,
                    // Pull from the ref to ensure we always use the latest functions without re-rendering
                    callback: (token: string) =>
                        callbacks.current.onVerify(token),
                    'error-callback': () => callbacks.current.onError?.(),
                    'expired-callback': () => callbacks.current.onExpire?.(),
                    theme,
                    size,
                },
            );
        };

        // Singleton script injection check
        const scriptId = 'cloudflare-turnstile-script';
        let script = document.getElementById(
            scriptId,
        ) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src =
                'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        // If turnstile is already loaded, render immediately.
        // Otherwise, wait for script onload.
        if (window.turnstile) {
            renderWidget();
        } else {
            script.addEventListener('load', renderWidget);
        }

        return () => {
            // Cleanup event listener if unmounted before load
            if (script) {
script.removeEventListener('load', renderWidget);
}

            // Properly remove the widget instance
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [siteKey, theme, size]); // Callbacks removed from dependency array!

    return <div ref={containerRef} className="my-4" />;
}
