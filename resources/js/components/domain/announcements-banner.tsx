import { usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const DISMISSED_ANNOUNCEMENTS_KEY = 'dismissed_announcements';

export function AnnouncementsBanner() {
    const { global_announcements } = usePage().props as any;
    const [dismissed, setDismissed] = useState<number[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }

        try {
            const stored = localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY);

            if (!stored) {
                return [];
            }

            const dismissedData = JSON.parse(stored);
            const today = new Date().toDateString();

            // Filter out dismissals from previous days (keep only today's dismissals)
            const validDismissals = dismissedData.filter(
                (item: { id: number; date: string }) => {
                    return item.date === today;
                },
            );

            // Update localStorage with only today's dismissals
            if (validDismissals.length !== dismissedData.length) {
                localStorage.setItem(
                    DISMISSED_ANNOUNCEMENTS_KEY,
                    JSON.stringify(validDismissals),
                );
            }

            return validDismissals.map((item: { id: number }) => item.id);
        } catch {
            return [];
        }
    });

    // Sync dismissed state to localStorage
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(
                DISMISSED_ANNOUNCEMENTS_KEY,
                JSON.stringify(
                    dismissed.map((id) => ({
                        id,
                        date: new Date().toDateString(),
                    })),
                ),
            );
        } catch {
            // Ignore localStorage errors
        }
    }, [dismissed]);

    if (
        !global_announcements ||
        !Array.isArray(global_announcements) ||
        global_announcements.length === 0
    ) {
        return null;
    }

    const visibleAnnouncements = global_announcements.filter(
        (a: any) => !dismissed.includes(a.id),
    );

    if (visibleAnnouncements.length === 0) {
        return null;
    }

    const getColors = (type: string) => {
        switch (type) {
            case 'warning':
                return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400';
            case 'success':
                return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400';
            default:
                return 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertCircle className="size-5 shrink-0" />;
            case 'success':
                return <CheckCircle2 className="size-5 shrink-0" />;
            default:
                return <Info className="size-5 shrink-0" />;
        }
    };

    return (
        <div className="flex flex-col gap-2 p-4 pb-0 sm:px-6">
            {visibleAnnouncements.map((announcement: any) => (
                <div
                    key={announcement.id}
                    className={`relative flex items-start gap-3 rounded-lg border p-3.5 pr-10 shadow-xs sm:items-center ${getColors(announcement.type)}`}
                >
                    {getIcon(announcement.type)}
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                        <span className="font-semibold">
                            {announcement.title}:
                        </span>
                        <span className="text-sm opacity-90">
                            {announcement.message}
                        </span>
                    </div>
                    <button
                        onClick={() =>
                            setDismissed([...dismissed, announcement.id])
                        }
                        className="absolute top-3.5 right-3 rounded-md p-0.5 opacity-70 transition-opacity hover:bg-black/5 hover:opacity-100 sm:top-auto"
                        aria-label="Dismiss"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
