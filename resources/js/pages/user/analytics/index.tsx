import { Head } from '@inertiajs/react';
import { BarChart, TrendingUp, Target, Printer } from 'lucide-react';
import React, { lazy, Suspense } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { HowItWorksModal } from '@/components/shared/how-it-works-modal';
import { Button } from '@/components/ui/button';
import { AiDiagnosticBanner } from './components/ai-diagnostic-banner';
import { AnalyticsFilters } from './components/analytics-filters';
import { CseReadinessCard } from './components/cse-readiness-card';
import { MetricsGrid } from './components/metrics-grid';
import { SubjectBreakdownAccordion } from './components/subject-breakdown-accordion';
import { useAnalyticsState } from './hooks/use-analytics-state';
import type { AnalyticsProps } from './types';

const ScoreHistoryChart = lazy(() =>
    import('./components/score-history-chart').then((m) => ({
        default: m.ScoreHistoryChart,
    })),
);
const SubjectMasteryChart = lazy(() =>
    import('./components/subject-mastery-chart').then((m) => ({
        default: m.SubjectMasteryChart,
    })),
);
const QuestionVolumeChart = lazy(() =>
    import('./components/question-volume-chart').then((m) => ({
        default: m.QuestionVolumeChart,
    })),
);
const SubcategoryRadarChart = lazy(() =>
    import('./components/subcategory-radar-chart').then((m) => ({
        default: m.SubcategoryRadarChart,
    })),
);
const PacingTrendChart = lazy(() =>
    import('./components/pacing-trend-chart').then((m) => ({
        default: m.PacingTrendChart,
    })),
);

export default function AnalyticsIndex({ stats, aiAnalysis }: AnalyticsProps) {
    const {
        firstName,
        currentTrack,
        currentRuns,
        updateFilter,
        activeStats,
        isDemoMode,
        filteredChartData,
        categories,
    } = useAnalyticsState({ stats, aiAnalysis });

    const handlePrint = () => {
        window.print();
    };

    return (
        <PageContainer className="gap-5 sm:gap-6">
            <Head title="Performance Analytics" />
            {/* Header section (Screen Only) */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between print:hidden">
                <div className="flex items-start gap-3">
                    <PageHeader
                        title="Performance Analytics"
                        description={`Hi ${firstName}, track your learning path, mock exam results, and subject mastery.`}
                    />
                    <div className="mt-1 print:hidden">
                        <HowItWorksModal
                            title="How Analytics Works"
                            tips={[
                                {
                                    icon: <BarChart className="size-4" />,
                                    title: 'CSC Readiness Index',
                                    text: 'Monitors your 80% General Weighted Average requirement alongside the strict 70% subtest cutoff rule.',
                                },
                                {
                                    icon: <TrendingUp className="size-4" />,
                                    title: 'Score & Pacing Trends',
                                    text: 'Tracks score improvements and average seconds per question against the official ~54s CSE time target.',
                                },
                                {
                                    icon: <Target className="size-4" />,
                                    title: 'Diagnostic Gaps & Drills',
                                    text: 'Identifies specific subcategory weaknesses with one-click direct remediation drill launchers.',
                                },
                            ]}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                    <AnalyticsFilters
                        currentTrack={currentTrack}
                        currentRuns={currentRuns}
                        updateFilter={updateFilter}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        title="Download or Print PDF Analytics Report"
                        className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <Printer className="size-3.5 text-slate-500" />
                        <span>Print / Save PDF</span>
                    </Button>
                </div>
            </div>

            {/* Printable Report Header (Visible Only on Print / Saved PDF) */}
            <div className="hidden border-b-2 border-slate-900 pb-3 print:block">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-heading text-lg font-black tracking-tight text-blue-600">
                                Hiraya Review
                            </span>
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-black tracking-wider text-slate-700 uppercase">
                                Official CSE Diagnostic Report
                            </span>
                        </div>
                        <h1 className="mt-1 font-heading text-xl font-black text-slate-900">
                            Performance Analytics
                        </h1>
                        <p className="mt-0.5 text-[11px] text-slate-600">
                            Candidate:{' '}
                            <strong className="text-slate-900">
                                {firstName}
                            </strong>{' '}
                            · Exam Track:{' '}
                            <strong className="text-slate-900 capitalize">
                                {currentTrack}
                            </strong>{' '}
                            · Generated:{' '}
                            {new Date().toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500">
                        <p className="font-bold text-slate-800">
                            Civil Service Commission (CSC)
                        </p>
                        <p>
                            Passing Threshold: 80% GWA with 70% Subtest Cutoff
                        </p>
                    </div>
                </div>
            </div>

            {/* CSE Passing Readiness & Subtest Threshold Card (Prominent Bento) */}
            <CseReadinessCard stats={activeStats} isDemoMode={isDemoMode} />

            {/* Performance KPI Metrics Grid */}
            <MetricsGrid activeStats={activeStats} />

            {/* AI Diagnostic Report Banner */}
            <AiDiagnosticBanner aiAnalysis={aiAnalysis} />

            {/* Charts Section */}
            <div className="flex flex-col gap-4 sm:gap-6">
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <div className="h-72 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
                            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                                <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
                                <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/50" />
                            </div>
                        </div>
                    }
                >
                    {/* Row 1: Score History (Full Width) */}
                    <ScoreHistoryChart
                        chartData={filteredChartData}
                        isDemoMode={isDemoMode}
                    />

                    {/* Row 2: Subject Mastery (Radial) + Question Volume (Donut) */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 print:grid-cols-2">
                        <SubjectMasteryChart categories={categories} />
                        <QuestionVolumeChart categories={categories} />
                    </div>

                    {/* Row 3: Weakest Subcategories (with inline drills) + Pacing Trend (with 54s benchmark) */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 print:grid-cols-2">
                        <SubcategoryRadarChart categories={categories} />
                        <PacingTrendChart
                            data={activeStats.pacingTrend || []}
                        />
                    </div>
                </Suspense>

                {/* Row 4: Detailed Subject & Subcategory Breakdown Accordion */}
                <SubjectBreakdownAccordion categories={categories} />
            </div>
        </PageContainer>
    );
}

AnalyticsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Analytics',
            href: '/analytics',
        },
    ],
};
