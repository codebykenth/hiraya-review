import { createInertiaApp } from '@inertiajs/react';
import { SupportWidget } from '@/components/support-widget';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Hiraya Review';

const pageMetadataMap = new Map<string, any>();

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
            pageMetadataMap.set(name, page.layout);
        }

        return page;
    },
    layout: (name) => {
        const metadata = pageMetadataMap.get(name);
        const breadcrumbs = metadata?.breadcrumbs || [];

        switch (true) {
            case name === 'welcome':
            case name === 'dev-docs':
            case name === 'guide':
            case name.startsWith('legal/'):
                return null;
            case name.startsWith('auth/'):
                return (props: any) => (
                    <AuthLayout
                        title={metadata?.title}
                        description={metadata?.description}
                    >
                        {props.children}
                    </AuthLayout>
                );
            case name.startsWith('settings/'):
                return (props: any) => (
                    <AppLayout breadcrumbs={breadcrumbs}>
                        <SettingsLayout>{props.children}</SettingsLayout>
                    </AppLayout>
                );
            default:
                return (props: any) => (
                    <AppLayout breadcrumbs={breadcrumbs}>
                        {props.children}
                    </AppLayout>
                );
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
