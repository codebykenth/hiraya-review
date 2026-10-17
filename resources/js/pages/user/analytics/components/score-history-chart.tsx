import { Play, TrendingUp } from 'lucide-react';
import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { index as examsIndex } from '@/routes/exams';
import type { ChartDataPoint } from '../types';
import { EmptyChartState } from './empty-chart-state';

interface ScoreHistoryChartProps {
    chartData: ChartDataPoint[];
    isDemoMode?: boolean;
}

export function ScoreHistoryChart({
    chartData,
}: ScoreHistoryChartProps) {
    const config = {
        score: {
            label: 'Overall Score',
            color: 'var(--primary)',
        },
    };

    const hasData = chartData && chartData.length > 0;

    return (
        <Card className="relative w-full overflow-hidden border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="size-5 text-primary" />
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                            Performance Trajectory
                        </h3>
                        <p className="text-sm leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
                            Your overall score progression across recent
                            attempts.
                        </p>
                    </div>
                </div>
            </div>

            {!hasData ? (
                <EmptyChartState
                    icon={TrendingUp}
                    title="No exam attempts yet"
                    description="Complete a full mock exam or diagnostic drill to start tracking your score progression over time."
                    actionLabel="Take Mock Exam"
                    actionHref={examsIndex()}
                    actionIcon={Play}
                    className="h-[280px] w-full"
                />
            ) : (
                <div className="h-[280px] w-full">
                <ChartContainer config={config} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 0,
                                bottom: 0,
                            }}
                        >
                            <defs>
                                <linearGradient
                                    id="fillScore"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-score)"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-score)"
                                        stopOpacity={0.0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="var(--border)"
                                opacity={0.5}
                            />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                tick={{
                                    fontSize: 11,
                                    fill: 'var(--muted-foreground)',
                                }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={42}
                                tick={{
                                    fontSize: 11,
                                    fill: 'var(--muted-foreground)',
                                }}
                                tickFormatter={(value) => `${value}%`}
                                domain={[0, 100]}
                            />
                            <ChartTooltip
                                cursor={{
                                    stroke: 'var(--border)',
                                    strokeWidth: 2,
                                    strokeDasharray: '4 4',
                                }}
                                content={
                                    <ChartTooltipContent indicator="line" />
                                }
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="var(--color-score)"
                                strokeWidth={3}
                                fill="url(#fillScore)"
                                activeDot={{
                                    r: 6,
                                    fill: 'var(--color-score)',
                                    stroke: 'var(--background)',
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
            )}
        </Card>
    );
}
