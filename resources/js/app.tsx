import { createInertiaApp, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { GlobalPdfExporter } from '@/components/shared/global-pdf-exporter';
import { SupportWidget } from '@/components/shared/support-widget';
import { TrafficOverloadGuard } from '@/components/shared/traffic-overload-guard';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { initSmartBackTracking, getOriginTitle } from '@/lib/smart-back';
import type { Auth } from './types/auth';
// Echo initialization moved to specific components to save connections

const appName = import.meta.env.VITE_APP_NAME || 'Hiraya Review';

const componentCache = new Map<string, any>();

// Global error handlers for Inertia requests
router.on('error', (errors) => {
    // Form validation errors
    if (Object.keys(errors).length > 0) {
        toast.error('Validation Error', {
            description:
                'Please check the form inputs for errors before proceeding.',
        });
    }
});

router.on('networkError', () => {
    // e.g. server down or no internet
    toast.error('Network Error', {
        description:
            'Unable to communicate with the server. Please check your connection.',
    });
});

router.on('httpException', (event) => {
    const status = event.detail.response.status;

    // 503 is handled via the full-page Error component
    // 429 is handled via TrafficOverloadGuard
    if (status === 503 || status === 429) {
        return;
    }

    // Non-200, non-validation responses (403, 500, etc)
    toast.error(`Unexpected Error (${status})`, {
        description:
            'The server returned an error while processing your request.',
    });
});

const PageLayoutWrapper = ({
    name,
    metadata,
    page,
}: {
    name: string;
    metadata: any;
    page: any;
}) => {
    const { auth } = usePage<{ auth: Auth }>().props;
    const userAnalysisMode = auth?.user?.analysis_mode ?? 'instant';
    const pageBreadcrumbs = (metadata.breadcrumbs || []).map((b: any) => {
        if (
            userAnalysisMode === 'instant' &&
            b.title === 'AI Diagnostic Report'
        ) {
            return { ...b, title: 'Diagnostic Report' };
        }

        return b;
    });

    const urlParams =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : null;
    const hasAttemptId = urlParams?.has('attempt_id');
    const fromParam = urlParams?.get('from') || urlParams?.get('return_to');

    if (
        name === 'user/dashboard/ai-analysis' &&
        hasAttemptId &&
        pageBreadcrumbs.length > 0
    ) {
        pageBreadcrumbs[0] = { title: 'History', href: '/history' };
    } else if (fromParam && pageBreadcrumbs.length > 1) {
        const originTitle = getOriginTitle(fromParam);
        const originHref = fromParam.startsWith('/') ? fromParam : `/${fromParam}`;
        pageBreadcrumbs[0] = { title: originTitle, href: originHref };
    }

    return <AppLayout breadcrumbs={pageBreadcrumbs}>{page}</AppLayout>;
};

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        if (componentCache.has(name)) {
            return componentCache.get(name);
        }

        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });

        // Find the matching page case-insensitively to prevent Windows/Linux case mismatch issues
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
            name.startsWith('public/');

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
                pageLayout = (page: any) => {
                    return (
                        <PageLayoutWrapper
                            name={name}
                            metadata={metadata}
                            page={page}
                        />
                    );
                };
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
                <TrafficOverloadGuard />
                <GlobalPdfExporter />
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
// This will set light / dark mode on load...
initializeTheme();
// Track previous in-app location so "back" returns to where the user came from
initSmartBackTracking();

// Register PWA Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // SW registration failed silently — HTTPS required in production
        });
    });
}
