import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import {
    DashboardSkeleton,
    TableSkeleton,
    AnalyticsSkeleton,
    ExamExamSkeleton,
    LearnModuleSkeleton,
    CalendarSkeleton,
} from '@/components/shared/page-skeletons';

function getSkeletonForUrl(pathname: string) {
    if (pathname === '/dashboard' || pathname === '/') {
        return <DashboardSkeleton />;
    }

    if (
        pathname.startsWith('/history') ||
        pathname.startsWith('/admin/users') ||
        pathname.startsWith('/admin/feedbacks') ||
        pathname.startsWith('/admin/payments')
    ) {
        return <TableSkeleton rows={8} cols={5} />;
    }

    if (pathname.startsWith('/analytics')) {
        return <AnalyticsSkeleton />;
    }

    if (pathname.startsWith('/exams') || pathname.startsWith('/drills')) {
        return <ExamExamSkeleton />;
    }

    if (pathname.startsWith('/learn')) {
        return <LearnModuleSkeleton />;
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
            const visit = event.detail.visit;

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
