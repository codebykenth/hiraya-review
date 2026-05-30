import { createInertiaApp } from '@inertiajs/react';
import { SupportWidget } from '@/components/support-widget';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Hiraya Review';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const page = (pages[`./pages/${name}.tsx`] as any).default;

        if (
            page.layout &&
            typeof page.layout === 'object' &&
            !Array.isArray(page.layout)
        ) {
            const metadata = page.layout;

            if (name.startsWith('settings/')) {
                page.layout = (pageComponent: React.ReactNode) => (
                    <AppLayout breadcrumbs={metadata.breadcrumbs}>
                        <SettingsLayout>{pageComponent}</SettingsLayout>
                    </AppLayout>
                );
            } else if (name.startsWith('auth/')) {
                page.layout = (pageComponent: React.ReactNode) => (
                    <AuthLayout
                        title={metadata.title}
                        description={metadata.description}
                    >
                        {pageComponent}
                    </AuthLayout>
                );
            } else {
                page.layout = (pageComponent: React.ReactNode) => (
                    <AppLayout breadcrumbs={metadata.breadcrumbs}>
                        {pageComponent}
                    </AppLayout>
                );
            }
        }

        return page;
    },
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
            case name === 'dev-docs':
            case name === 'guide':
            case name.startsWith('legal/'):
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
                <SupportWidget />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
