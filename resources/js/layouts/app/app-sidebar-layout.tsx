import { usePage } from '@inertiajs/react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { AnnouncementsBanner } from '@/components/domain/announcements-banner';
import { AppContent } from '@/components/layout/app-content';
import { AppShell } from '@/components/layout/app-shell';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppSidebarHeader } from '@/components/layout/app-sidebar-header';
import SiteFooter from '@/components/layout/site-footer';
import SiteHeader from '@/components/layout/site-header';
import { CookieConsentBanner } from '@/components/shared/cookie-consent-banner';
import TermsAcceptanceGuard from '@/components/shared/terms-acceptance-guard';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { auth, pusher, pending_feedback_count } = usePage().props as any;
    const { url } = usePage();
    const [isWaitingForAi, setIsWaitingForAi] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('waiting_for_ai') === 'true';
        }

        return false;
    });
    const [feedbackCount, setFeedbackCount] = useState(
        pending_feedback_count || 0,
    );
    const isAdmin = auth.user?.role === 'admin';
    const prevPendingCountRef = useRef(pending_feedback_count);

    // Reset feedback count when page props change (after Inertia requests)
    useEffect(() => {
        if (prevPendingCountRef.current !== pending_feedback_count) {
            setFeedbackCount(pending_feedback_count || 0);
            prevPendingCountRef.current = pending_feedback_count;
        }
    }, [pending_feedback_count]);

    useEffect(() => {
        // Listen for same-tab triggers
        const handleAiStart = () => setIsWaitingForAi(true);
        window.addEventListener('ai_generation_started', handleAiStart);

        return () =>
            window.removeEventListener('ai_generation_started', handleAiStart);
    }, []);

    // Listen for new feedback submissions (admin only)
    useEffect(() => {
        if (!auth.user || !isAdmin || !pusher?.key) {
            return;
        }

        (window as any).Pusher = Pusher;
        const echo = new Echo({
            broadcaster: 'pusher',
            key: pusher.key,
            cluster: pusher.cluster ?? 'ap1',
            wsHost: pusher.host
                ? pusher.host
                : `ws-${pusher.cluster}.pusher.com`,
            wsPort: pusher.port ?? 80,
            wssPort: pusher.port ?? 443,
            forceTLS: (pusher.scheme ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        echo.channel('admin-notifications').listen(
            'NewFeedbackSubmitted',
            (e: any) => {
                toast.success('New feedback submitted', {
                    duration: 8000,
                    description:
                        'A user has reported content that needs review.',
                    action: {
                        label: 'View',
                        onClick: () => {
                            window.location.href = '/admin/feedbacks';
                        },
                    },
                });

                // Update feedback count
                setFeedbackCount((prev: number) => prev + 1);

                // Dispatch event for sidebar to update
                window.dispatchEvent(
                    new CustomEvent('new_feedback_submitted', { detail: e }),
                );
            },
        );

        return () => {
            echo.disconnect();
        };
    }, [
        auth.user,
        isAdmin,
        pusher?.cluster,
        pusher?.host,
        pusher?.key,
        pusher?.port,
        pusher?.scheme,
    ]);

    // Listen for feedback status changes to update count
    useEffect(() => {
        const handleStatusChanged = (e: CustomEvent) => {
            const { currentStatus, newStatus } = e.detail;

            if (currentStatus === 'pending' && newStatus !== 'pending') {
                // Changed from pending to resolved/dismissed - decrement
                setFeedbackCount((prev: number) => Math.max(0, prev - 1));
            } else if (currentStatus !== 'pending' && newStatus === 'pending') {
                // Changed from resolved/dismissed to pending - increment
                setFeedbackCount((prev: number) => prev + 1);
            }
        };

        const handleCountRefresh = () => {
            // Reload page to get fresh count from server
            window.location.reload();
        };

        window.addEventListener(
            'feedback_status_changed',
            handleStatusChanged as EventListener,
        );
        window.addEventListener(
            'feedback_count_refresh',
            handleCountRefresh as EventListener,
        );

        return () => {
            window.removeEventListener(
                'feedback_status_changed',
                handleStatusChanged as EventListener,
            );
            window.removeEventListener(
                'feedback_count_refresh',
                handleCountRefresh as EventListener,
            );
        };
    }, []);

    useEffect(() => {
        if (!auth.user || !isWaitingForAi || !pusher?.key) {
            return;
        }

        // Only instantiate and connect when actually waiting for AI
        (window as any).Pusher = Pusher;
        const echo = new Echo({
            broadcaster: 'pusher',
            key: pusher.key,
            cluster: pusher.cluster ?? 'ap1',
            wsHost: pusher.host
                ? pusher.host
                : `ws-${pusher.cluster}.pusher.com`,
            wsPort: pusher.port ?? 80,
            wssPort: pusher.port ?? 443,
            forceTLS: (pusher.scheme ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        echo.private(`App.Models.User.${auth.user.id}`)
            .listen('AiGenerationCompleted', (e: any) => {
                toast.success(e.message, {
                    duration: 8000,
                    action: {
                        label: 'View Drafts',
                        onClick: () => {
                            window.location.href =
                                e.type === 'module'
                                    ? '/admin/learn/drafts'
                                    : '/admin/questions/drafts';
                        },
                    },
                });

                // Disconnect and clean up once received
                localStorage.removeItem('waiting_for_ai');
                setIsWaitingForAi(false);
                echo.disconnect();

                // Notify forms that AI is done so they can update their loading state
                window.dispatchEvent(new Event('ai_generation_completed'));
            })
            .listen('AiGenerationFailed', (e: any) => {
                toast.error(e.message, {
                    duration: 8000,
                });

                // Disconnect and clean up on error
                localStorage.removeItem('waiting_for_ai');
                setIsWaitingForAi(false);
                echo.disconnect();

                // Dispatch failure event
                window.dispatchEvent(new Event('ai_generation_failed'));
            });

        return () => {
            echo.disconnect();
        };
    }, [
        auth.user,
        isWaitingForAi,
        pusher?.cluster,
        pusher?.host,
        pusher?.key,
        pusher?.port,
        pusher?.scheme,
    ]);

    if (!auth.user) {
        const activeNav = url.startsWith('/learn')
            ? 'learn'
            : url.startsWith('/guide')
              ? 'guide'
              : '';

        return (
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-950/20">
                <SiteHeader activeNav={activeNav} />
                <main className="flex-1 px-4 py-12 sm:px-6">{children}</main>
                <SiteFooter />
                <CookieConsentBanner />
            </div>
        );
    }

    return (
        <TermsAcceptanceGuard>
            <AppShell variant="sidebar">
                <AppSidebar feedbackCount={feedbackCount} />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    <AnnouncementsBanner />
                    {children}
                </AppContent>
            </AppShell>
            <CookieConsentBanner />
        </TermsAcceptanceGuard>
    );
}
