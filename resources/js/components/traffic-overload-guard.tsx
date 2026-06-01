import { router } from '@inertiajs/react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export function TrafficOverloadGuard() {
    const [isOpen, setIsOpen] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [errorType, setErrorType] = useState<'overload' | 'rate_limit'>(
        'overload',
    );

    useEffect(() => {
        // 1. Intercept Inertia requests exception states
        const unregisterHttpException = router.on('httpException', (event) => {
            const status = event.detail.response.status;

            if (status === 429) {
                setErrorType('rate_limit');
                setIsOpen(true);
            } else if (status === 503 || status === 504 || status === 502) {
                setErrorType('overload');
                setIsOpen(true);
            }
        });

        // 2. Intercept global fetch requests with active self-healing retries
        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            let retries = 0;
            const maxRetries = 3;
            let delay = 1000; // start with 1 second delay

            const executeWithRetry = async (): Promise<Response> => {
                try {
                    const response = await originalFetch(...args);

                    const isFailureStatus =
                        response.status === 429 ||
                        response.status === 502 ||
                        response.status === 503 ||
                        response.status === 504;

                    if (isFailureStatus) {
                        if (retries < maxRetries) {
                            retries++;
                            setIsRetrying(true);
                            // Wait with exponential backoff delay
                            await new Promise((resolve) =>
                                setTimeout(resolve, delay),
                            );
                            delay *= 2;

                            return executeWithRetry();
                        } else {
                            setIsRetrying(false);

                            if (response.status === 429) {
                                setErrorType('rate_limit');
                            } else {
                                setErrorType('overload');
                            }

                            setIsOpen(true);
                        }
                    } else {
                        // Request succeeded on a retry
                        setIsRetrying(false);
                    }

                    return response;
                } catch (error) {
                    if (retries < maxRetries) {
                        retries++;
                        setIsRetrying(true);
                        await new Promise((resolve) =>
                            setTimeout(resolve, delay),
                        );
                        delay *= 2;

                        return executeWithRetry();
                    } else {
                        setIsRetrying(false);
                        setErrorType('overload');
                        setIsOpen(true);

                        throw error;
                    }
                }
            };

            return executeWithRetry();
        };

        return () => {
            unregisterHttpException();
            window.fetch = originalFetch;
        };
    }, []);

    if (!isOpen && !isRetrying) {
        return null;
    }

    return (
        <>
            {/* Background Retrying Toast Notification */}
            {isRetrying && !isOpen && (
                <div className="fixed right-4 bottom-4 z-[9999] flex animate-bounce items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 shadow-lg backdrop-blur transition-all dark:border-amber-900/50 dark:bg-amber-950/95">
                    <RefreshCw className="size-4 animate-spin text-amber-600 dark:text-amber-400" />
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-amber-900 dark:text-amber-300">
                            Connection unstable
                        </span>
                        <span className="dark:text-amber-405 mt-0.5 text-[10px] leading-none text-amber-700">
                            Retrying request in background...
                        </span>
                    </div>
                </div>
            )}

            {/* Final Overload Warning Modal (shown only after all retries fail) */}
            {isOpen && (
                <div className="animate-fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg animate-in overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl transition-all duration-200 zoom-in-95 fade-in dark:border-slate-800 dark:bg-slate-900">
                        {/* Decorative Background */}
                        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl" />

                        <div className="flex flex-col items-center p-2 text-center">
                            <div className="mb-5 flex size-16 animate-bounce items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400">
                                <AlertCircle className="size-8" />
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                {errorType === 'rate_limit'
                                    ? 'Too Many Requests'
                                    : 'Server Under Heavy Load'}
                            </h3>

                            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                {errorType === 'rate_limit'
                                    ? 'You have made too many requests in a short period. Our security rate-limiter is currently pacing your access.'
                                    : 'Our servers are currently experiencing extremely high traffic from civil service review students.'}
                            </p>

                            <p className="mt-2 border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                To protect database stability and ensure active
                                study tools work correctly, access is
                                temporarily queued. Please wait a few moments
                                and try your action again!
                            </p>

                            <div className="mt-6 flex w-full gap-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 cursor-pointer rounded-xl bg-slate-100 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        window.location.reload();
                                    }}
                                    className="flex-1 cursor-pointer rounded-xl bg-blue-600 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                                >
                                    Reload Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
