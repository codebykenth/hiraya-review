import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import {
    DashboardSkeleton,
    AdminDashboardSkeleton,
    TableSkeleton,
    AnalyticsSkeleton,
    ExamSetupSkeleton,
    DrillsHubSkeleton,
    LearnIndexSkeleton,
    CalendarSkeleton,
} from '@/components/shared/page-skeletons';

function getSkeletonForUrl(pathname: string) {
    if (pathname === '/dashboard' || pathname === '/') {
        return <DashboardSkeleton />;
    }

    if (pathname.startsWith('/admin/dashboard') || pathname === '/admin') {
        return <AdminDashboardSkeleton />;
    }

    if (
        pathname.startsWith('/history') ||
        pathname.startsWith('/admin/users') ||
        pathname.startsWith('/admin/feedbacks') ||
        pathname.startsWith('/admin/payments') ||
        pathname.startsWith('/admin/announcements') ||
        pathname.startsWith('/admin/audit-logs') ||
        pathname.startsWith('/admin/questions') ||
        pathname.startsWith('/admin/legal-content') ||
        pathname.startsWith('/admin/settings')
    ) {
        return <TableSkeleton rows={8} cols={5} />;
    }

    if (pathname.startsWith('/analytics')) {
        return <AnalyticsSkeleton />;
    }

    if (pathname.startsWith('/exams')) {
        return <ExamSetupSkeleton />;
    }

    if (pathname.startsWith('/drills')) {
        return <DrillsHubSkeleton />;
    }

    if (pathname.startsWith('/learn')) {
        return <LearnIndexSkeleton />;
    }

    if (
        pathname.startsWith('/calendar') ||
        pathname.startsWith('/study-schedules')
    ) {
        return <CalendarSkeleton />;
    }

    return <DashboardSkeleton />;
}

export function NavSkeletonBoundary({
    children,
}: {
    children: React.ReactNode;
}) {
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

    useEffect(() => {
        const handleNavigationStart = (event: any) => {
            const visit = event?.detail?.visit as any;
            if (!visit) {
                return;
            }

            // Never show navigation skeleton on background prefetch (mount, hover, or background fetch)
            if (
                visit.prefetch ||
                visit.headers?.['Purpose'] === 'prefetch' ||
                visit.headers?.['X-Inertia-Prefetch']
            ) {
                return;
            }

            // Only trigger for full page GET navigation visits to a different page
            const method = visit.method
                ? String(visit.method).toLowerCase()
                : 'get';

            if (
                method === 'get' &&
                !visit.preserveState &&
                !visit.only?.length
            ) {
                let targetPath = '';
                if (visit.url) {
                    if (typeof visit.url === 'string') {
                        try {
                            targetPath = new URL(
                                visit.url,
                                window.location.origin,
                            ).pathname;
                        } catch {
                            targetPath = visit.url;
                        }
                    } else if (
                        visit.url instanceof URL ||
                        typeof visit.url.pathname === 'string'
                    ) {
                        targetPath = visit.url.pathname;
                    }
                }

                const cleanTarget = targetPath
                    ? targetPath.split('?')[0].replace(/\/$/, '') || '/'
                    : null;
                const cleanCurrent =
                    window.location.pathname.replace(/\/$/, '') || '/';

                if (cleanTarget && cleanTarget !== cleanCurrent) {
                    setNavigatingTo(cleanTarget);
                }
            }
        };

        const handleNavigationEnd = (event?: any) => {
            const visit = event?.detail?.visit;
            // Ignore background prefetch finishes so they don't dismiss the skeleton prematurely
            if (visit?.prefetch) {
                return;
            }

            setNavigatingTo(null);
        };

        const removeBefore = router.on('before', handleNavigationStart);
        const removeStart = router.on('start', handleNavigationStart);
        const removeNavigate = router.on('navigate', () => setNavigatingTo(null));
        const removeFinish = router.on('finish', handleNavigationEnd);
        const removeError = router.on('error', () => setNavigatingTo(null));
        const removeCancel = router.on('cancel', () => setNavigatingTo(null));

        return () => {
            removeBefore();
            removeStart();
            removeNavigate();
            removeFinish();
            removeError();
            removeCancel();
        };
    }, []);

    if (navigatingTo) {
        return (
            <div className="relative animate-in duration-150 fade-in">
                {getSkeletonForUrl(navigatingTo)}
            </div>
        );
    }

    return <>{children}</>;
}
