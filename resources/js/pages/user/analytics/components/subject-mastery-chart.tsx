import { Award } from 'lucide-react';
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Cell,
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

export function SubjectMasteryChart({ categories }: SubjectMasteryChartProps) {
    const segments = categories.map((cat, idx) => ({
        name: cat.name.replace(' Ability', '').replace(' Information', ''),
        percentage: cat.percentage,
        colorHex: `var(--chart-${(idx % 5) + 1})`,
    }));

    const config = segments.reduce(
        (acc, seg) => {
            acc[seg.name] = { label: seg.name, color: seg.colorHex };

            return acc;
        },
        { percentage: { label: 'Accuracy' } } as Record<
            string,
            { label: string; color?: string }
        >,
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

            <div className="h-[250px] w-full">
                <ChartContainer config={config} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={segments}
                            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                horizontal={false}
                                stroke="var(--border)"
                                opacity={0.5}
                            />
                            <XAxis
                                type="number"
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{
                                    fontSize: 11,
                                    fill: 'var(--muted-foreground)',
                                }}
                                tickFormatter={(val) => `${val}%`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                tick={{
                                    fontSize: 11,
                                    fill: 'var(--foreground)',
                                    fontWeight: 600,
                                }}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="percentage"
                                radius={[0, 4, 4, 0]}
                                barSize={24}
                            >
                                {segments.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.colorHex}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </Card>
    );
}
