import { createInertiaApp } from '@inertiajs/react';
import { SupportWidget } from '@/components/support-widget';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
// Echo initialization moved to specific components to save connections

const appName = import.meta.env.VITE_APP_NAME || 'Hiraya Review';

const componentCache = new Map<string, any>();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        if (componentCache.has(name)) {
            return componentCache.get(name);
        }

        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const OriginalComponent = (pages[`./pages/${name}.tsx`] as any).default;

        const WrappedComponent: any = (props: any) => (
            <OriginalComponent {...props} />
        );

        let metadata: any = {};

        if (
            OriginalComponent.layout &&
            typeof OriginalComponent.layout === 'object' &&
            !Array.isArray(OriginalComponent.layout)
        ) {
            metadata = OriginalComponent.layout;
        }

        const needsNoLayout =
            name === 'welcome' ||
            name === 'dev-docs' ||
            name === 'guide' ||
            name.startsWith('legal/');

        let pageLayout: any = undefined;

        if (!needsNoLayout) {
            if (name.startsWith('settings/')) {
                pageLayout = (page: any) => (
                    <AppLayout breadcrumbs={metadata.breadcrumbs}>
                        <SettingsLayout>{page}</SettingsLayout>
                    </AppLayout>
                );
            } else if (name.startsWith('auth/')) {
                pageLayout = (page: any) => (
                    <AuthLayout
                        title={metadata.title}
                        description={metadata.description}
                    >
                        {page}
                    </AuthLayout>
                );
            } else {
                pageLayout = (page: any) => (
                    <AppLayout breadcrumbs={metadata.breadcrumbs}>
                        {page}
                    </AppLayout>
                );
            }
        }

        WrappedComponent.layout = pageLayout;

        componentCache.set(name, WrappedComponent);

        return WrappedComponent;
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
