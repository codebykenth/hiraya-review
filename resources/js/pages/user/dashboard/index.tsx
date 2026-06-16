import { Link, usePage } from '@inertiajs/react';
import { Play } from 'lucide-react';
import { useEffect } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import AiReadinessCard from '@/pages/user/dashboard/components/ai-readiness-card';
import { ExamCountdown } from '@/pages/user/dashboard/components/exam-countdown';
import { index as examsIndex } from '@/routes/exams';
import type { Auth } from '@/types';
import type { DashboardProps } from './types';

export default function Dashboard({ stats, aiAnalysis }: DashboardProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';

    useEffect(() => {
        const pendingExam = localStorage.getItem('pending_free_exam');

        if (pendingExam) {
            window.location.href = '/exams';
        }
    }, []);

    return (
        <PageContainer className="gap-4">
            {/* Greeting Header & Main Action Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <PageHeader
                    title={
                        <>
                            Welcome back,{' '}
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                                {firstName}
                            </span>
                        </>
                    }
                    description="Let's continue your preparation for the Civil Service Exam."
                />
                <div className="flex w-full flex-col gap-2 sm:w-auto">
                    <Link
                        href={
                            examsIndex({
                                query: { start: 'professional' },
                            }).url
                        }
                        className="group flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition transition-all duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                    >
                        <Play className="size-3.5 fill-current" />
                        Start Professional Exam
                    </Link>
                    <Link
                        href={
                            examsIndex({
                                query: { start: 'subprofessional' },
                            }).url
                        }
                        className="group dark:hover:bg-slate-850 flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition transition-all duration-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                    >
                        Start Subprofessional Exam
                    </Link>
                </div>
            </div>

            {/* Exam Countdown Card */}
            {stats?.examDate && stats?.examDateRaw && (
                <ExamCountdown
                    examDate={stats.examDate}
                    examDateRaw={stats.examDateRaw}
                    motivationText={aiAnalysis?.data?.encouragement}
                />
            )}

            {/* AI Analysis Readiness Card */}
            <div>
                <AiReadinessCard
                    aiAnalysis={aiAnalysis}
                    analysisMode={auth?.user?.analysis_mode}
                />
            </div>
        </PageContainer>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ],
};
