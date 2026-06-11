import { Award } from 'lucide-react';
import React from 'react';
import {
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { AnalyticsCategory } from '../types';

interface SubjectMasteryChartProps {
    categories: AnalyticsCategory[];
}

const RING_COLORS = [
    'hsl(221, 83%, 53%)', // blue-600
    'hsl(160, 84%, 39%)', // emerald-600
    'hsl(24, 95%, 53%)', // orange-500
    'hsl(239, 84%, 67%)', // indigo-500
    'hsl(173, 80%, 40%)', // teal-600
];

export function SubjectMasteryChart({ categories }: SubjectMasteryChartProps) {
    const data = categories.map((cat, idx) => ({
        name: cat.name.replace(' Ability', '').replace(' Information', ''),
        percentage: cat.percentage,
        fill: RING_COLORS[idx % RING_COLORS.length],
    }));

    const config = data.reduce(
        (acc, item) => {
            acc[item.name] = { label: item.name, color: item.fill };

            return acc;
        },
        {} as Record<string, { label: string; color: string }>,
    );

    return (
        <Card className="border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-4 flex items-center gap-2">
                <Award className="size-4.5 text-emerald-500" />
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Subject Mastery
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Accuracy percentage by category
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-[220px] w-full max-w-[220px] shrink-0">
                    <ChartContainer config={config} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="20%"
                                outerRadius="100%"
                                barSize={14}
                                data={data}
                                startAngle={90}
                                endAngle={-270}
                            >
                                <PolarAngleAxis
                                    type="number"
                                    domain={[0, 100]}
                                    angleAxisId={0}
                                    tick={false}
                                />
                                <RadialBar
                                    background={{
                                        fill: 'var(--muted)',
                                        opacity: 0.3,
                                    }}
                                    dataKey="percentage"
                                    cornerRadius={8}
                                    angleAxisId={0}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            nameKey="name"
                                            formatter={(value) => `${value}%`}
                                        />
                                    }
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-1 flex-col gap-2">
                    {data.map((item) => (
                        <div
                            key={item.name}
                            className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-white/60 px-3 py-2 dark:bg-slate-900/40"
                        >
                            <div className="flex items-center gap-2">
                                <div
                                    className="size-2.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    {item.name}
                                </span>
                            </div>
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                {item.percentage}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}
