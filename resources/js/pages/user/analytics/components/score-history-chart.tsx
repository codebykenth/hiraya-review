import { TrendingUp } from 'lucide-react';
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
import type { ChartDataPoint } from '../types';

interface ScoreHistoryChartProps {
    chartData: ChartDataPoint[];
    isDemoMode: boolean;
}

export function ScoreHistoryChart({
    chartData,
    isDemoMode,
}: ScoreHistoryChartProps) {
    const config = {
        score: {
            label: 'Overall Score',
            color: 'var(--primary)',
        },
    };

    return (
        <Card className="relative mb-6 w-full overflow-hidden border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            {isDemoMode && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px] dark:bg-slate-950/60">
                    <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 text-center shadow-lg dark:border-slate-700 dark:bg-slate-800/90">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white">
                            Sample Data Displayed
                        </h4>
                        <p className="mt-1 text-base leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
                            Complete an exam to see your real performance.
                        </p>
                    </div>
                </div>
            )}

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

            <div className="h-[280px] w-full">
                <ChartContainer config={config} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
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
                                tickMargin={12}
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
        </Card>
    );
}
