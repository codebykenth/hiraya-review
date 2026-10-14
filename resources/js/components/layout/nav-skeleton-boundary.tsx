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
        const removeStart = router.on('start', (event) => {
            const visit = event.detail.visit as any;

            // Never show navigation skeleton on prefetch (hover, mount, or background)
            if (
                visit.prefetch ||
                visit.headers?.['Purpose'] === 'prefetch' ||
                visit.headers?.['X-Inertia-Prefetch']
            ) {
                return;
            }

            // Only trigger for full page GET navigation visits, ignoring background pollings or partial mutations
            if (
                visit.method === 'get' &&
                !visit.preserveState &&
                !visit.only?.length
            ) {
                setNavigatingTo(visit.url.pathname);
            }
        });

        const removeFinish = router.on('finish', () => {
            setNavigatingTo(null);
        });

        return () => {
            removeStart();
            removeFinish();
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
