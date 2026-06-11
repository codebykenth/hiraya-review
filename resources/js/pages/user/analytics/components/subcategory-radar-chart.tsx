import { Target } from 'lucide-react';
import React, { useMemo } from 'react';
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

interface SubcategoryBreakdownChartProps {
    categories: AnalyticsCategory[];
}

function getBarColor(percentage: number): string {
    if (percentage >= 80) {
        return 'hsl(160, 84%, 39%)';
    } // emerald

    if (percentage >= 60) {
        return 'hsl(221, 83%, 53%)';
    } // blue

    if (percentage >= 40) {
        return 'hsl(38, 92%, 50%)';
    } // amber

    return 'hsl(0, 72%, 51%)'; // rose
}

export function SubcategoryRadarChart({
    categories,
}: SubcategoryBreakdownChartProps) {
    const data = useMemo(() => {
        const allSubs: {
            name: string;
            percentage: number;
            correct: number;
            total: number;
        }[] = [];

        categories.forEach((cat) => {
            if (cat.subcategories) {
                cat.subcategories.forEach((sub) => {
                    if (sub.total > 0) {
                        allSubs.push({
                            name:
                                sub.name.length > 20
                                    ? sub.name.substring(0, 20) + '…'
                                    : sub.name,
                            percentage: sub.percentage,
                            correct: sub.correct,
                            total: sub.total,
                        });
                    }
                });
            }
        });

        // Sort ascending (weakest first) and take top 8
        return allSubs.sort((a, b) => a.percentage - b.percentage).slice(0, 8);
    }, [categories]);

    const config = {
        percentage: {
            label: 'Accuracy',
            color: 'var(--primary)',
        },
    };

    if (data.length === 0) {
        return (
            <Card className="flex min-h-[300px] items-center justify-center border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-sm font-semibold text-muted-foreground">
                    Complete more exams to see subcategory insights.
                </p>
            </Card>
        );
    }

    return (
        <Card className="border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-4 flex items-center gap-2">
                <Target className="size-4.5 text-indigo-500" />
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Weakest Subcategories
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Focus areas ranked by lowest accuracy
                    </p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ChartContainer config={config} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={data}
                            margin={{ top: 0, right: 40, left: 10, bottom: 0 }}
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
                                width={130}
                                tick={{
                                    fontSize: 10,
                                    fill: 'var(--foreground)',
                                    fontWeight: 600,
                                }}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
                                content={
                                    <ChartTooltipContent
                                        hideLabel
                                        formatter={(value, _name, item) => {
                                            const payload = item?.payload;

                                            return `${value}% (${payload?.correct ?? 0}/${payload?.total ?? 0})`;
                                        }}
                                    />
                                }
                            />
                            <Bar
                                dataKey="percentage"
                                radius={[0, 6, 6, 0]}
                                barSize={20}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={getBarColor(entry.percentage)}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            {/* Color legend */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-3">
                {[
                    { label: '80%+', color: 'hsl(160, 84%, 39%)' },
                    { label: '60–79%', color: 'hsl(221, 83%, 53%)' },
                    { label: '40–59%', color: 'hsl(38, 92%, 50%)' },
                    { label: '<40%', color: 'hsl(0, 72%, 51%)' },
                ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                        <div
                            className="size-2 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[10px] font-bold text-muted-foreground">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
