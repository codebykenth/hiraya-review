import { Head } from '@inertiajs/react';
import { BarChart, TrendingUp, Target, Printer } from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { HowItWorksModal } from '@/components/shared/how-it-works-modal';
import { Button } from '@/components/ui/button';
import { AiDiagnosticBanner } from './components/ai-diagnostic-banner';
import { AnalyticsFilters } from './components/analytics-filters';
import { CseReadinessCard } from './components/cse-readiness-card';
import { MetricsGrid } from './components/metrics-grid';
import { PacingTrendChart } from './components/pacing-trend-chart';
import { QuestionVolumeChart } from './components/question-volume-chart';
import { ScoreHistoryChart } from './components/score-history-chart';
import { SubcategoryRadarChart } from './components/subcategory-radar-chart';
import { SubjectBreakdownAccordion } from './components/subject-breakdown-accordion';
import { SubjectMasteryChart } from './components/subject-mastery-chart';
import { useAnalyticsState } from './hooks/use-analytics-state';
import type { AnalyticsProps } from './types';

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
            {/* Header section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between print:hidden">
                <PageHeader
                    title="Performance Analytics"
                    description={`Hi ${firstName}, track your learning path, mock exam results, and subject mastery.`}
                />
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="h-9 gap-1.5 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <Printer className="size-3.5 text-slate-500" />
                        <span>Print Report</span>
                    </Button>
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
                    <AnalyticsFilters
                        currentTrack={currentTrack}
                        currentRuns={currentRuns}
                        updateFilter={updateFilter}
                    />
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
                {/* Row 1: Score History (Full Width) */}
                <ScoreHistoryChart
                    chartData={filteredChartData}
                    isDemoMode={isDemoMode}
                />

                {/* Row 2: Subject Mastery (Radial) + Question Volume (Donut) */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <SubjectMasteryChart categories={categories} />
                    <QuestionVolumeChart categories={categories} />
                </div>

                {/* Row 3: Weakest Subcategories (with inline drills) + Pacing Trend (with 54s benchmark) */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <SubcategoryRadarChart categories={categories} />
                    <PacingTrendChart data={activeStats.pacingTrend || []} />
                </div>

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

