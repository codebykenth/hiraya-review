import { Link } from '@inertiajs/react';
import { Cookie, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('hiraya_cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('hiraya_cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-border/80 bg-card/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 sm:bottom-6 sm:left-auto sm:right-24 sm:max-w-2xl sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Cookie className="size-5" />
                    </div>
                    <div className="text-xs leading-relaxed text-muted-foreground">
                        <p className="font-semibold text-foreground">
                            Cookie & Privacy Transparency
                        </p>
                        <p className="mt-0.5">
                            We use strictly essential cookies to keep you logged in and save your theme preferences. We do not track or sell your data.{' '}
                            <Link
                                href="/privacy"
                                className="font-semibold text-primary underline underline-offset-2 hover:text-primary/90"
                            >
                                Read Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <Button
                        size="sm"
                        onClick={handleAccept}
                        className="h-8 rounded-lg text-xs font-bold shadow-2xs"
                    >
                        Accept
                    </Button>
                    <button
                        onClick={handleAccept}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Dismiss cookie banner"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
