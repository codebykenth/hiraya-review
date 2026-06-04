import { Link, usePage } from '@inertiajs/react';
import {
    Play,
    BookOpen,
    Target,
    ClipboardList,
    TrendingUp,
    ChevronRight,
} from 'lucide-react';
import { useEffect } from 'react';
import { ExamCountdown } from '@/pages/user/dashboard/components/exam-countdown';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { index as drillsIndex } from '@/routes/drills';
import { index as examsIndex } from '@/routes/exams';
import { index as learnIndex } from '@/routes/learn';
import { index as analyticsIndex } from '@/routes/analytics';
import type { DashboardProps } from '../types';

export function UserDashboardPage({ stats, aiAnalysis }: DashboardProps) {
    const { auth } = usePage().props as any;
    const firstName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'User';

    useEffect(() => {
        const pendingExam = localStorage.getItem('pending_free_exam');
        if (pendingExam) {
            window.location.href = '/exams';
        }
    }, []);

    return (
        <PageContainer>
            {/* Greeting Header & Main Action Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PageHeader
                    title={
                        <>
                            Welcome back,
                            <br />
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                                {firstName}
                            </span>
                        </>
                    }
                    description="Let's continue your preparation for the Civil Service Exam."
                />
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={
                            examsIndex({
                                query: { start: 'professional' },
                            }).url
                        }
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
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
                        className="flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100/50 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
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

            {/* Simple Monitor cards pointing to core modules */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Learn Card */}
                <Card className="flex flex-col justify-between p-6 transition hover:shadow-md dark:bg-slate-900/60">
                    <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                            <BookOpen className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Study Scope
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Access learning modules, review guides, and core materials.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={learnIndex()}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        Learn Modules <ChevronRight className="size-3.5" />
                    </Link>
                </Card>

                {/* Practice Drills Card */}
                <Card className="flex flex-col justify-between p-6 transition hover:shadow-md dark:bg-slate-900/60">
                    <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            <Target className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Practice Drills
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Sharpen your skills with quick subtopic practice drills.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={drillsIndex()}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        Start Drill <ChevronRight className="size-3.5" />
                    </Link>
                </Card>

                {/* Mock Exams Card */}
                <Card className="flex flex-col justify-between p-6 transition hover:shadow-md dark:bg-slate-900/60">
                    <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                            <ClipboardList className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                Mock Exams
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Simulate the real exam environment with full-length runs.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={examsIndex()}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                    >
                        View Exams <ChevronRight className="size-3.5" />
                    </Link>
                </Card>

                {/* Analytics Card */}
                <Card className="flex flex-col justify-between p-6 transition hover:shadow-md dark:bg-slate-900/60">
                    <div className="flex items-start gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                            <TrendingUp className="size-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                AI & Analytics
                            </h4>
                            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                Track passing probability, score trends, and study plans.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={analyticsIndex()}
                        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                        View Analytics <ChevronRight className="size-3.5" />
                    </Link>
                </Card>
            </div>
        </PageContainer>
    );
}
