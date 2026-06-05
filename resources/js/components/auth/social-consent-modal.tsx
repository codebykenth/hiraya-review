import React, { useState } from 'react';
import ConsentCheckbox from '@/components/auth/consent-checkbox';
import { Button } from '@/components/ui/button';

export type SocialProvider = 'google' | 'facebook';

export default function SocialConsentModal({
    provider,
    onClose,
}: {
    provider: SocialProvider;
    onClose: () => void;
}) {
    const [accepted, setAccepted] = useState(false);
    const providerLabel = provider === 'google' ? 'Google' : 'Facebook';
    const redirectUrl =
        provider === 'google' ? '/auth/google' : '/auth/facebook';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="consent-modal-title"
                className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:p-6 dark:border-slate-800 dark:bg-slate-950"
            >
                <h2
                    id="consent-modal-title"
                    className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100"
                >
                    Continue with {providerLabel}
                </h2>
                <p className="mb-5 text-base leading-relaxed text-slate-500 dark:text-slate-400">
                    Before proceeding, please review and accept our policies.
                </p>

                <ConsentCheckbox
                    id="social-consent"
                    checked={accepted}
                    onCheckedChange={(v) => setAccepted(!!v)}
                />

                <div className="mt-6 flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-xl"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={!accepted}
                        className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-600"
                        onClick={() => {
                            window.location.href = redirectUrl;
                        }}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
}
