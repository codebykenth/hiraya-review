import { Link } from '@inertiajs/react';
import { Target, Zap, Play } from 'lucide-react';
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
import { index as drillsIndex } from '@/routes/drills';
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
    const rawSubs = useMemo(() => {
        const allSubs: {
            id?: number;
            categoryName: string;
            name: string;
            fullName: string;
            percentage: number;
            correct: number;
            total: number;
        }[] = [];

        categories.forEach((cat) => {
            if (cat.subcategories) {
                cat.subcategories.forEach((sub) => {
                    if (sub.total > 0) {
                        allSubs.push({
                            id: sub.id,
                            categoryName: cat.name,
                            fullName: sub.name,
                            name:
                                sub.name.length > 18
                                    ? sub.name.substring(0, 18) + '…'
                                    : sub.name,
                            percentage: sub.percentage,
                            correct: sub.correct,
                            total: sub.total,
                        });
                    }
                });
            }
        });

        // Sort ascending (weakest first) and take top 6
        return allSubs.sort((a, b) => a.percentage - b.percentage).slice(0, 6);
    }, [categories]);

    const config = {
        percentage: {
            label: 'Accuracy',
            color: 'var(--primary)',
        },
    };

    if (rawSubs.length === 0) {
        return (
            <Card className="flex min-h-[300px] items-center justify-center border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
                <p className="text-sm font-semibold text-muted-foreground">
                    Complete more exams to see subcategory insights.
                </p>
            </Card>
        );
    }

    const topWeakest = rawSubs[0];

    return (
        <Card className="flex flex-col justify-between border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="size-4.5 text-rose-500" />
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Weakest Subcategories
                            </h3>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Focus areas ranked by lowest accuracy
                            </p>
                        </div>
                    </div>

                    {topWeakest && (
                        <Link
                            href={drillsIndex({
                                query: {
                                    category: topWeakest.categoryName,
                                    subcategories: JSON.stringify([
                                        topWeakest.fullName,
                                    ]),
                                    from: '/analytics',
                                },
                            })}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                        >
                            <Zap className="size-3 fill-current" />
                            Drill #1 Weakness
                        </Link>
                    )}
                </div>

                <div className="h-[210px] w-full">
                    <ChartContainer config={config} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={rawSubs}
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
                                    tickMargin={8}
                                    tick={{
                                        fontSize: 10,
                                        fill: 'var(--muted-foreground)',
                                    }}
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={120}
                                    tick={{
                                        fontSize: 10,
                                        fill: 'var(--foreground)',
                                        fontWeight: 600,
                                    }}
                                />
                                <ChartTooltip
                                    cursor={{
                                        fill: 'var(--muted)',
                                        opacity: 0.2,
                                    }}
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
                                    barSize={18}
                                >
                                    {rawSubs.map((entry, index) => (
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
            </div>

            {/* Quick Drill Action Row */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-rose-500" /> &lt;40%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-amber-500" /> 40–59%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-blue-500" /> 60–79%
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-emerald-500" /> 80%+
                    </span>
                </div>

                <Link
                    href={drillsIndex({
                        query: {
                            category: topWeakest?.categoryName || 'Verbal Ability',
                            subcategories: JSON.stringify(
                                rawSubs.map((s) => s.fullName),
                            ),
                            from: '/analytics',
                        },
                    })}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:underline"
                >
                    Practice weak areas setup <Play className="size-3 fill-current" />
                </Link>
            </div>
        </Card>
    );
}

