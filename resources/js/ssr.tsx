import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { renderToString } from 'react-dom/server';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';

const appName = import.meta.env.VITE_APP_NAME || 'Hiraya Review';

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
            const targetPath = `./pages/${name}.tsx`.toLowerCase();
            const actualPath = Object.keys(pages).find(
                (key) => key.toLowerCase() === targetPath,
            );

            if (!actualPath) {
                throw new Error(`Page component not found: ${name}`);
            }

            const OriginalComponent = (pages[actualPath] as any).default;

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
                name === 'about' ||
                name === 'guide' ||
                name === 'error' ||
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

            return WrappedComponent;
        },
        setup: ({ App, props }) => {
            return (
                <TooltipProvider delayDuration={0}>
                    <App {...props} />
                </TooltipProvider>
            );
        },
    }),
);
