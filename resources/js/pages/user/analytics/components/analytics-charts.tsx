import React from 'react';
import { BarChart as ReBarChart, Bar, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart2, BookOpen, ChevronRight, Award, TrendingUp } from 'lucide-react';
import type { AnalyticsCategory } from '../types';

interface AnalyticsChartsProps {
    categories: AnalyticsCategory[];
}

export function AnalyticsCharts({ categories }: AnalyticsChartsProps) {
    const totalPercentageSum = categories.reduce((sum, cat) => sum + (cat.percentage || 0), 0);
    const avgPercentage = categories.length > 0
        ? Math.round(totalPercentageSum / categories.length)
        : 0;

    const getColorHex = (tailwindBgClass?: string) => {
        if (!tailwindBgClass) return '#3b82f6';
        if (tailwindBgClass.includes('emerald')) return '#10b981';
        if (tailwindBgClass.includes('blue')) return '#3b82f6';
        if (tailwindBgClass.includes('indigo')) return '#6366f1';
        if (tailwindBgClass.includes('rose')) return '#f43f5e';
        if (tailwindBgClass.includes('amber')) return '#f59e0b';
        return '#64748b';
    };

    const getDotColorClass = (tailwindBgClass?: string) => {
        if (!tailwindBgClass) return 'bg-blue-500';
        if (tailwindBgClass.includes('emerald')) return 'bg-emerald-500';
        if (tailwindBgClass.includes('blue')) return 'bg-blue-500';
        if (tailwindBgClass.includes('indigo')) return 'bg-indigo-500';
        if (tailwindBgClass.includes('rose')) return 'bg-rose-500';
        if (tailwindBgClass.includes('amber')) return 'bg-amber-500';
        return 'bg-slate-500';
    };

    let cumulativePercent = 0;
    const segments = categories.map((cat, idx) => {
        const share = totalPercentageSum > 0 ? (cat.percentage || 0) / totalPercentageSum : 0;
        const startPercent = cumulativePercent;
        cumulativePercent += share;

        const chartColor = `var(--chart-${(idx % 5) + 1})`;

        return {
            name: cat.name.replace(' Ability', '').replace(' Information', ''),
            share,
            percentage: cat.percentage,
            sharePercentage: Math.round(share * 100),
            correct: cat.correct,
            total: cat.total,
            startPercent,
            colorHex: chartColor,
            dotClass: getDotColorClass(cat.color),
        };
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Solved Question Distribution (Pie Chart) */}
                <Card className="p-5 border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="mb-4 flex items-center gap-2">
                        <BarChart2 className="size-4.5 text-blue-500" />
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            Mastery Share Distribution
                        </h3>
                    </div>

                    <div className="flex flex-col items-center gap-6 sm:justify-center">
                        {/* Shadcn Bar Chart */}
                        <div className="relative w-full">
                            <ChartContainer
                                config={segments.reduce((acc, seg) => {
                                    acc[seg.name] = { label: seg.name, color: seg.colorHex };
                                    return acc;
                                }, { percentage: { label: 'Mastery Share' } } as Record<string, { label: string; color?: string }>)}
                                className="mx-auto min-h-[250px] w-full pb-0"
                            >
                                <ReBarChart accessibilityLayer data={segments} margin={{ bottom: 20, left: -20, right: 10 }}>
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tick={{ fontSize: 11 }}
                                        angle={-20}
                                        textAnchor="end"
                                    />
                                    <YAxis 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent hideLabel />}
                                    />
                                    <Bar dataKey="percentage" radius={8}>
                                        {segments.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.colorHex} />
                                        ))}
                                    </Bar>
                                </ReBarChart>
                            </ChartContainer>
                        </div>
                    </div>
                </Card>

               
            </div>

           
        </div>
    );
}
