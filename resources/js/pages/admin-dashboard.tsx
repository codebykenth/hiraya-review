import { Head, Link, usePage } from '@inertiajs/react';
import {
    Shield,
    FileQuestion,
    ListChecks,
    Users,
    Database,
    Layers,
    TrendingUp,
    Activity,
} from 'lucide-react';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import {
    index as questionsIndex,
    drafts as questionsDrafts,
} from '@/routes/questions';

// Strongly typed dashboard props
interface Metrics {
    total_questions: number;
    active_questions: number;
    draft_questions: number;
    total_categories: number;
    total_subcategories: number;
    total_examinees: number;
    total_attempts: number;
    track_configs: number;
}

interface RecentAttempt {
    id: number;
    user: {
        name: string;
        email: string;
    };
    category: string;
    percentage: number;
    created_at: string;
}

interface CategoryStat {
    id: number;
    name: string;
    question_count: number;
}

interface TrackItem {
    id: number;
    track: string;
    category: string;
    item_count: number;
    time_limit: string;
}

interface AdminDashboardProps {
    metrics: Metrics;
    recentAttempts: RecentAttempt[];
    categoriesStats: CategoryStat[];
    tracks: TrackItem[];
}

export default function AdminDashboard({
    metrics,
    recentAttempts = [],
    categoriesStats = [],
}: AdminDashboardProps) {
    const { auth } = usePage().props;
    const adminName = auth?.user?.name ? auth.user.name.split(' ')[0] : 'Admin';

    return (
        <>
            <Head title="Admin Dashboard" />
            <PageContainer>
                {/* 1. WELCOME & BANNER */}
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

                {/* 2. STATS ANALYTICS GRID */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* STAT CARD 1: QUESTION BANK */}
                    <Card className="p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                                Question Bank
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                <Database className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {metrics.total_questions}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                                total records
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {metrics.active_questions} Verified
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">
                                •
                            </span>
                            <span className="text-blue-600 dark:text-blue-400">
                                {metrics.draft_questions} Drafts
                            </span>
                        </div>
                    </Card>

                    {/* STAT CARD 2: EXAMS COMPLETED */}
                    <Card className="p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                                Total Attempts
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                                <Activity className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {metrics.total_attempts}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                                exams taken
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-slate-500">
                            <TrendingUp className="size-3 text-emerald-600" />
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                Dynamic monitoring active
                            </span>
                        </div>
                    </Card>

                    {/* STAT CARD 3: TOTAL EXAMINEES */}
                    <Card className="p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                                Total Examinees
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <Users className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {metrics.total_examinees}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                                registered users
                            </span>
                        </div>
                        <div className="mt-2.5 text-[10px] font-bold text-slate-500">
                            Examinees preparing for exam
                        </div>
                    </Card>

                    {/* STAT CARD 4: BLUEPRINT SCOPES */}
                    <Card className="p-5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                                Blueprint Scopes
                            </span>
                            <div className="flex size-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400">
                                <Layers className="size-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {metrics.total_categories}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                                exam domains
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                            <span>
                                {metrics.total_subcategories} subcategories
                                configured
                            </span>
                        </div>
                    </Card>
                </div>

                {/* 3. SPLIT PANE ANALYSIS: ATTEMPTS & SYLLABUS DISPERSAL */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Recent Examinee Attempts */}
                    <Card className="p-6 shadow-xs lg:col-span-2">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-md font-bold text-slate-900 dark:text-white">
                                    Recent Exam Attempts
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Real-time grades & completion status for
                                    standard test takers.
                                </p>
                            </div>
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-50 text-[11px] font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                                {recentAttempts.length}
                            </span>
                        </div>

                        {recentAttempts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Activity className="text-slate-350 dark:text-slate-750 mb-3 size-8 animate-pulse" />
                                <h3 className="text-xs font-bold">
                                    No exam attempts logged yet
                                </h3>
                                <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                    Taker activity results will render
                                    dynamically here when examinees complete
                                    exams.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-900">
                                {recentAttempts.map((attempt) => (
                                    <div
                                        key={attempt.id}
                                        className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900">
                                                <Users className="size-4 text-slate-600 dark:text-slate-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {attempt.user.name}
                                                </h4>
                                                <p className="mt-0.5 text-[10px] text-slate-500">
                                                    {attempt.user.email} •{' '}
                                                    {attempt.created_at}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <span className="block text-[10px] font-extrabold text-slate-500">
                                                    {attempt.category}
                                                </span>
                                            </div>
                                            <span
                                                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-black ${
                                                    attempt.percentage >= 80
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                                        : attempt.percentage >=
                                                            70
                                                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                                                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
                                                }`}
                                            >
                                                {attempt.percentage}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Right Column: Syllabus Dispersal */}
                    <Card className="flex flex-col p-6 shadow-xs">
                        <div className="mb-5">
                            <h2 className="text-md font-bold text-slate-900 dark:text-white">
                                Syllabus Scope Dispersal
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                Distribution density of active review questions.
                            </p>
                        </div>

                        {categoriesStats.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
                                <Database className="text-slate-350 mb-2.5 size-8 dark:text-slate-700" />
                                <span className="text-slate-650 text-xs font-bold dark:text-slate-400">
                                    Syllabus unseeded
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-1 flex-col justify-center gap-4">
                                {categoriesStats.map((cat) => {
                                    const total = metrics.total_questions || 1;
                                    const pct = Math.round(
                                        (cat.question_count / total) * 100,
                                    );

                                    return (
                                        <div
                                            key={cat.id}
                                            className="flex flex-col gap-1.5"
                                        >
                                            <div className="flex items-center justify-between text-[11px] font-bold">
                                                <span className="text-slate-600 dark:text-slate-400">
                                                    {cat.name}
                                                </span>
                                                <span className="text-slate-900 dark:text-white">
                                                    {cat.question_count} Qs (
                                                    {pct}%)
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full border border-slate-100/50 bg-slate-50 dark:border-slate-900 dark:bg-slate-900">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                                    style={{
                                                        width: `${Math.max(3, pct)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </div>
            </PageContainer>
        </>
    );
}

// Global layout configuration for breadcrumbs binding
AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin Dashboard',
            href: '/admin/dashboard',
        },
    ],
};
