import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { HowItWorksModal } from '@/components/how-it-works-modal';
import { AnalyticsFilters } from './components/analytics-filters';
import { useAnalyticsState } from './hooks/use-analytics-state';
import { AnalyticsProps } from './types';
import { MetricsGrid } from './components/metrics-grid';
import { ScoreHistoryChart } from './components/score-history-chart';
import { SubjectMasteryChart } from './components/subject-mastery-chart';
import { QuestionVolumeChart } from './components/question-volume-chart';
import { SubcategoryRadarChart } from './components/subcategory-radar-chart';
import { PacingTrendChart } from './components/pacing-trend-chart';
import { AttemptBreakdownChart } from './components/attempt-breakdown-chart';

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

    return (
        <PageContainer>
            {/* Header section with layout matching Dashboard */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <PageHeader
                    title="Performance Analytics"
                    description={`Hi ${firstName}, track your learning path, mock exam results, and subject mastery.`}
                />
                <div className="flex flex-wrap items-center gap-2">
                    <HowItWorksModal
                        title="How Analytics Works"
                        tips={[
                            {
                                icon: 'ðŸ“Š',
                                title: 'Performance Stats',
                                text: 'Track your average score, passing rate, and total practice runs across professional or subprofessional categories.',
                            },
                            {
                                icon: 'ðŸ“ˆ',
                                title: 'Score Trends',
                                text: 'Interactive chart illustrating your performance improvements across historical attempts.',
                            },
                            {
                                icon: 'ðŸŽ¯',
                                title: 'Diagnostic Gaps',
                                text: 'Detailed subtopic analysis pointing out your exact strengths and target focus areas.',
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

            {/* Performance Metrics Card Grid Layout */}
            <MetricsGrid activeStats={activeStats} />
            <div className="flex flex-col gap-6 mt-6">
            {/* Score Trends & Category breakdown container layout */}
                {/* Row 1: Score History (Full Width) */}
                <ScoreHistoryChart
                    chartData={filteredChartData}
                    isDemoMode={isDemoMode}
                />

                {/* Row 2: Subject Mastery + Question Volume */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <SubjectMasteryChart categories={categories} />
                    <QuestionVolumeChart categories={categories} />
                </div>

                {/* Row 3: Radar + Pacing Trend */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <SubcategoryRadarChart categories={categories} />
                    <PacingTrendChart data={activeStats.pacingTrend || []} />
                </div>

                {/* Row 4: Attempt Breakdown (Full Width) */}
                <AttemptBreakdownChart data={activeStats.attemptBreakdowns || []} />
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
