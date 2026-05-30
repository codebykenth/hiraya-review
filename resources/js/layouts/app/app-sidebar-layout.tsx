import { usePage } from '@inertiajs/react';
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
