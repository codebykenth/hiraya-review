import { BarChart2 } from 'lucide-react';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { Card } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { AnalyticsCategory } from '../types';

interface QuestionVolumeChartProps {
    categories: AnalyticsCategory[];
}

const DONUT_COLORS = [
    'hsl(221, 83%, 53%)', // blue-600
    'hsl(160, 84%, 39%)', // emerald-600
    'hsl(24, 95%, 53%)', // orange-500
    'hsl(239, 84%, 67%)', // indigo-500
    'hsl(173, 80%, 40%)', // teal-600
];

export function QuestionVolumeChart({ categories }: QuestionVolumeChartProps) {
    const data = categories.map((cat, idx) => ({
        name: cat.name.replace(' Ability', '').replace(' Information', ''),
        value: cat.total,
        correct: cat.correct,
        fill: DONUT_COLORS[idx % DONUT_COLORS.length],
    }));

    const totalQuestions = data.reduce((sum, d) => sum + d.value, 0);

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
                <BarChart2 className="size-4.5 text-blue-500" />
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Study Effort
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Where you spend your practice time
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="h-[220px] w-full max-w-[220px] shrink-0">
                    <ChartContainer config={config} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    strokeWidth={3}
                                    stroke="var(--background)"
                                    paddingAngle={3}
                                >
                                    {data.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                        />
                                    ))}
                                    <Label
                                        content={({ viewBox }) => {
                                            if (
                                                viewBox &&
                                                'cx' in viewBox &&
                                                'cy' in viewBox
                                            ) {
                                                return (
                                                    <text
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                    >
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={
                                                                (viewBox.cy ||
                                                                    0) - 6
                                                            }
                                                            className="fill-foreground text-2xl font-black"
                                                        >
                                                            {totalQuestions}
                                                        </tspan>
                                                        <tspan
                                                            x={viewBox.cx}
                                                            y={
                                                                (viewBox.cy ||
                                                                    0) + 14
                                                            }
                                                            className="fill-muted-foreground text-[10px] font-semibold"
                                                        >
                                                            Questions
                                                        </tspan>
                                                    </text>
                                                );
                                            }
                                        }}
                                    />
                                </Pie>
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            nameKey="name"
                                            formatter={(value, name) => {
                                                const item = data.find(
                                                    (d) => d.name === name,
                                                );
                                                const pct =
                                                    totalQuestions > 0
                                                        ? Math.round(
                                                              ((value as number) /
                                                                  totalQuestions) *
                                                                  100,
                                                          )
                                                        : 0;

                                                return `${value} questions (${pct}%) · ${item?.correct ?? 0} correct`;
                                            }}
                                        />
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-1 flex-col gap-2">
                    {data.map((item) => {
                        const pct =
                            totalQuestions > 0
                                ? Math.round(
                                      (item.value / totalQuestions) * 100,
                                  )
                                : 0;

                        return (
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
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-slate-400">
                                        {item.value}q
                                    </span>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {pct}%
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
