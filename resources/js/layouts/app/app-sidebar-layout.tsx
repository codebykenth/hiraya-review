import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import TermsAcceptanceGuard from '@/components/terms-acceptance-guard';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { auth } = usePage().props;

    if (!auth.user) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <main className="flex-1">{children}</main>
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
