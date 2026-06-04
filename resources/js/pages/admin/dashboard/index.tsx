import { Head, Link, usePage } from '@inertiajs/react';
import { Shield, FileQuestion, ListChecks } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import {
    index as questionsIndex,
    drafts as questionsDrafts,
} from '@/routes/questions';
import type { Auth } from '@/types';
import { DashboardAttemptsPanel } from './components/dashboard-attempts-panel';
import { DashboardStatsGrid } from './components/dashboard-stats-grid';
import { DashboardSyllabusPanel } from './components/dashboard-syllabus-panel';
import type { AdminDashboardProps } from './types';

export default function AdminDashboard({
    metrics,
    recentAttempts = [],
    categoriesStats = [],
}: AdminDashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const adminName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'Admin';

    return (
        <>
            <Head title="Admin Dashboard" />
            <PageContainer>
                {/* Welcome & Banner */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                <Shield className="size-3" />
                                System Administrator
                            </span>
                        </div>
                        <PageHeader
                            title={
                                <>
                                    Welcome back,{' '}
                                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                                        {adminName}
                                    </span>
                                </>
                            }
                            description={
                                <>
                                    Monitor examinee results, verify generated
                                    test parameters, and audit the dynamic
                                    syllabus blueprint models.
                                </>
                            }
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href={questionsIndex()}
                            className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none"
                        >
                            <FileQuestion className="size-3.5" />
                            Manage Questions
                        </Link>
                        <Link
                            href={questionsDrafts()}
                            className="dark:text-slate-350 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                        >
                            <ListChecks className="size-3.5" />
                            Review Drafts
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <DashboardStatsGrid metrics={metrics} />

                {/* Split Pane: Attempts & Syllabus Dispersal */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <DashboardAttemptsPanel attempts={recentAttempts} />
                    <DashboardSyllabusPanel
                        categories={categoriesStats}
                        metrics={metrics}
                    />
                </div>
            </PageContainer>
        </>
    );
}

// Register layout configuration with standard layout and breadcrumbs
AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
        },
    ],
};
