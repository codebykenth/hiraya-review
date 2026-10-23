import { router, usePage } from '@inertiajs/react';
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
    TutorSkeleton,
    AiDiagnosticSkeleton,
    GuideSkeleton,
    BillingSkeleton,
    SettingsSkeleton,
} from '@/components/shared/page-skeletons';

function getSkeletonForUrl(pathname: string) {
    const clean = pathname.split('?')[0].replace(/\/$/, '') || '/';

    if (clean === '/dashboard' || clean === '/') {
        return <DashboardSkeleton />;
    }

    if (clean.startsWith('/admin/dashboard') || clean === '/admin') {
        return <AdminDashboardSkeleton />;
    }

    if (
        clean.startsWith('/analytics/ai-analysis') ||
        clean.startsWith('/ai-analysis')
    ) {
        return <AiDiagnosticSkeleton />;
    }

    if (clean.startsWith('/analytics')) {
        return <AnalyticsSkeleton />;
    }

    if (clean.startsWith('/guide')) {
        return <GuideSkeleton />;
    }

    if (clean.startsWith('/billing')) {
        return <BillingSkeleton />;
    }

    if (clean.startsWith('/settings')) {
        return <SettingsSkeleton />;
    }

    if (
        clean.startsWith('/history') ||
        clean.startsWith('/admin/users') ||
        clean.startsWith('/admin/feedbacks') ||
        clean.startsWith('/admin/payments') ||
        clean.startsWith('/admin/announcements') ||
        clean.startsWith('/admin/audit-logs') ||
        clean.startsWith('/admin/questions') ||
        clean.startsWith('/admin/legal-content') ||
        clean.startsWith('/admin/settings') ||
        clean.startsWith('/admin/syllabus') ||
        clean.startsWith('/admin/exam-dates') ||
        clean.startsWith('/admin/attempts') ||
        clean.startsWith('/admin/view-management') ||
        clean.startsWith('/admin/system')
    ) {
        return <TableSkeleton rows={8} cols={5} />;
    }

    if (clean.startsWith('/exams')) {
        return <ExamSetupSkeleton />;
    }

    if (clean.startsWith('/drills')) {
        return <DrillsHubSkeleton />;
    }

    if (clean.startsWith('/learn')) {
        return <LearnIndexSkeleton />;
    }

    if (clean.startsWith('/calendar') || clean.startsWith('/study-schedules')) {
        return <CalendarSkeleton />;
    }

    if (clean.startsWith('/tutor')) {
        return <TutorSkeleton />;
    }

    return <DashboardSkeleton />;
}

export function NavSkeletonBoundary({
    children,
}: {
    children: React.ReactNode;
}) {
    const page = usePage();
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
    const [startPath, setStartPath] = useState<string | null>(null);

    const currentPath =
        (page.url ? page.url.split('?')[0].replace(/\/$/, '') : '') || '/';

    // Automatically dismiss the skeleton when the destination URL matches the
    // mounted page or when the mounted page has navigated away from the start.
    const isNavigating =
        navigatingTo !== null &&
        navigatingTo !== currentPath &&
        !currentPath.startsWith(navigatingTo) &&
        (startPath === null || currentPath === startPath);

    useEffect(() => {
        let safetyTimer: ReturnType<typeof setTimeout> | null = null;

        const clearNavigation = () => {
            if (safetyTimer) {
                clearTimeout(safetyTimer);
                safetyTimer = null;
            }

            setNavigatingTo(null);
            setStartPath(null);
        };

        const handleNavigationStart = (event: any) => {
            const visit = event?.detail?.visit;

            if (!visit) {
                return;
            }

            // Never show navigation skeleton on background prefetch (mount, hover, or background fetch)
            if (
                visit.prefetch ||
                visit.headers?.['Purpose'] === 'prefetch' ||
                visit.headers?.['X-Inertia-Prefetch'] ||
                visit.headers?.['Sec-Purpose'] === 'prefetch'
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
                    setStartPath(cleanCurrent);
                    setNavigatingTo(cleanTarget);

                    // Safety timeout: Never leave skeleton stuck for more than 6 seconds
                    if (safetyTimer) {
                        clearTimeout(safetyTimer);
                    }

                    safetyTimer = setTimeout(() => {
                        clearNavigation();
                    }, 6000);
                }
            }
        };

        const handleNavigationEnd = (event?: any) => {
            const visit = event?.detail?.visit;

            // Ignore background prefetch finishes so they don't dismiss the skeleton prematurely
            if (visit?.prefetch) {
                return;
            }

            // Fallback: clear skeleton only after React has had a chance to render the new page
            setTimeout(() => {
                clearNavigation();
            }, 100);
        };

        const removeBefore = router.on('before', handleNavigationStart);
        const removeStart = router.on('start', handleNavigationStart);
        const removeFinish = router.on('finish', handleNavigationEnd);
        const removeError = router.on('error', clearNavigation);
        const removeCancel = router.on('cancel', clearNavigation);

        return () => {
            if (safetyTimer) {
                clearTimeout(safetyTimer);
            }

            removeBefore();
            removeStart();
            removeFinish();
            removeError();
            removeCancel();
        };
    }, []);

    if (isNavigating) {
        return (
            <div className="relative animate-in duration-150 fade-in">
                {getSkeletonForUrl(navigatingTo)}
            </div>
        );
    }

    return <>{children}</>;
}
