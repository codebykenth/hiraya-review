import { Lock } from 'lucide-react';
import React from 'react';

interface ContentShieldOverlayProps {
    isShielded: boolean;
    isResumeLocked: boolean;
    dismissShield: () => void;
    resumeButtonText?: string;
    descriptionText?: string;
}

export function ContentShieldOverlay({
    isShielded,
    isResumeLocked,
    dismissShield,
    resumeButtonText = 'Resume Practice Builder',
    descriptionText = 'Exam content was hidden because window focus was lost or external screen tools were detected.',
}: ContentShieldOverlayProps) {
    if (!isShielded) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-card p-6 text-center opacity-100 select-none">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border/80 bg-background p-8 shadow-2xl">
                <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <Lock className="size-7" />
                </div>
                <div className="space-y-2">
                    <h3 className="font-heading text-lg font-bold text-foreground">
                        Content Shield Active
                    </h3>
                    <p className="text-xs leading-relaxed font-semibold text-muted-foreground">
                        {descriptionText}
                    </p>
                    {isResumeLocked && (
                        <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            Content stays locked while the exam window is not focused. Click back into this window, then resume.
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={dismissShield}
                    disabled={isResumeLocked}
                    className={`mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition focus:outline-none ${
                        isResumeLocked
                            ? 'cursor-not-allowed bg-slate-400 opacity-60'
                            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                    }`}
                >
                    {isResumeLocked
                        ? 'Window Not Focused — Click to Focus'
                        : resumeButtonText}
                </button>
            </div>
        </div>
    );
}
