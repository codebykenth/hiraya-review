import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import TermsAcceptanceGuard from '@/components/terms-acceptance-guard';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [isWaitingForAi, setIsWaitingForAi] = useState(false);

    useEffect(() => {
        // Check initial state
        setIsWaitingForAi(localStorage.getItem('waiting_for_ai') === 'true');

        // Listen for same-tab triggers
        const handleAiStart = () => setIsWaitingForAi(true);
        window.addEventListener('ai_generation_started', handleAiStart);
        
        return () => window.removeEventListener('ai_generation_started', handleAiStart);
    }, []);

    useEffect(() => {
        if (!auth.user || !isWaitingForAi) return;

        // Only instantiate and connect when actually waiting for AI
        (window as any).Pusher = Pusher;
        const echo = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'ap1',
            wsHost: import.meta.env.VITE_PUSHER_HOST ? import.meta.env.VITE_PUSHER_HOST : `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
            wsPort: import.meta.env.VITE_PUSHER_PORT ?? 80,
            wssPort: import.meta.env.VITE_PUSHER_PORT ?? 443,
            forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        echo.private(`App.Models.User.${auth.user.id}`)
            .listen('AiGenerationCompleted', (e: any) => {
                toast.success(e.message, {
                    duration: 8000,
                    action: {
                        label: 'View Drafts',
                        onClick: () => {
                            window.location.href = e.type === 'module' 
                                ? '/admin/learn/drafts' 
                                : '/admin/questions/drafts';
                        }
                    }
                });
                
                // Disconnect and clean up once received
                localStorage.removeItem('waiting_for_ai');
                setIsWaitingForAi(false);
                echo.disconnect();
            });

        return () => {
            echo.disconnect();
        };
    }, [auth.user, isWaitingForAi]);

    if (!auth.user) {
        const activeNav = url.startsWith('/learn')
            ? 'learn'
            : url.startsWith('/guide')
              ? 'guide'
              : '';

        return (
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-950/20">
                <SiteHeader activeNav={activeNav} />
                <main className="flex-1 px-6 py-12">{children}</main>
                <SiteFooter />
            </div>
        );
    }

    return (
        <TermsAcceptanceGuard>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar" className="overflow-x-hidden">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
        </TermsAcceptanceGuard>
    );
}
