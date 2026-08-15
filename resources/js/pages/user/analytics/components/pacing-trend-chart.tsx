import { Clock, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import type { PacingTrend } from '../types';

interface PacingTrendChartProps {
    data: PacingTrend[];
}

export function PacingTrendChart({ data }: PacingTrendChartProps) {
    const config = {
        secondsPerQuestion: {
            label: 'Seconds / Question',
            color: 'var(--chart-3)', // emerald
        },
        accuracy: {
            label: 'Accuracy %',
            color: 'var(--chart-1)', // blue
        },
    };

    const latestPacing = useMemo(() => {
        if (!data || data.length === 0) {
            return null;
        }

        const validItems = data.filter((d) => d.secondsPerQuestion > 0);
        if (validItems.length === 0) {
            return null;
        }

        const sumPacing = validItems.reduce(
            (acc, d) => acc + d.secondsPerQuestion,
            0,
        );
        const avgPacing = Math.round(sumPacing / validItems.length);
        const latest = validItems[validItems.length - 1];

        return {
            avg: avgPacing,
            latest: latest.secondsPerQuestion,
        };
    }, [data]);

    const pacingAssessment = useMemo(() => {
        if (!latestPacing) {
            return {
                label: 'Benchmark: 54s/item',
                color: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
                icon: <Clock className="size-3 text-slate-500" />,
                tip: 'CSE Professional gives 170 items in 3h 10m (~54s per question including shading).',
            };
        }

        const sec = latestPacing.avg;
        if (sec <= 38) {
            return {
                label: 'Rushing Risk (<38s/item)',
                color: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                icon: <Zap className="size-3 text-amber-600" />,
                tip: 'You are answering very quickly. Double-check for tricky wording in word problems and reading comprehension.',
            };
        }
        if (sec <= 56) {
            return {
                label: 'Optimal CSE Pace (45-55s)',
                color: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                icon: <CheckCircle2 className="size-3 text-emerald-600" />,
                tip: 'Excellent pacing! You are comfortably inside the official CSE time limit of ~54s per question.',
            };
        }

        return {
            label: 'Time Crunch Risk (>56s/item)',
            color: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
            icon: <AlertCircle className="size-3 text-rose-600" />,
            tip: 'Average speed exceeds the 54s target. Practice skipping and flagging hard math/logic problems to avoid leaving unanswered items.',
        };
    }, [latestPacing]);

    return (
        <Card className="flex flex-col justify-between border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Clock className="size-4.5 text-amber-500" />
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Pacing vs Accuracy
                            </h3>
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Average time per question with official ~54s
                                target
                            </p>
                        </div>
                    </div>

                    <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${pacingAssessment.color}`}
                    >
                        {pacingAssessment.icon}
                        {pacingAssessment.label}
                    </span>
                </div>

                <div className="h-[210px] w-full">
                    <ChartContainer config={config} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={data}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
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
                                    tickMargin={10}
                                    tick={{
                                        fontSize: 10,
                                        fill: 'var(--muted-foreground)',
                                    }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    domain={[0, 'auto']}
                                    tick={{
                                        fontSize: 10,
                                        fill: 'var(--muted-foreground)',
                                    }}
                                    tickFormatter={(val) => `${val}s`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tick={{
                                        fontSize: 10,
                                        fill: 'var(--muted-foreground)',
                                    }}
                                    tickFormatter={(val) => `${val}%`}
                                    domain={[0, 100]}
                                />
                                <ReferenceLine
                                    yAxisId="left"
                                    y={54}
                                    stroke="hsl(var(--destructive))"
                                    strokeDasharray="3 3"
                                    label={{
                                        value: '54s Target',
                                        position: 'insideTopRight',
                                        fill: 'hsl(var(--destructive))',
                                        fontSize: 10,
                                        fontWeight: 700,
                                    }}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent indicator="line" />
                                    }
                                />
                                <ChartLegend
                                    content={<ChartLegendContent />}
                                    className="-translate-y-2 flex-wrap gap-2 text-xs [&>*]:justify-center"
                                />

                                {/* Bar for Time, Line for Accuracy */}
                                <Bar
                                    yAxisId="left"
                                    dataKey="secondsPerQuestion"
                                    fill="var(--color-secondsPerQuestion)"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={28}
                                    opacity={0.85}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="var(--color-accuracy)"
                                    strokeWidth={3}
                                    dot={{
                                        r: 3.5,
                                        fill: 'var(--color-accuracy)',
                                    }}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>

            {/* Pacing Tip Footer */}
            <div className="mt-3 border-t border-border pt-2.5">
                <p className="text-[11px] font-medium text-muted-foreground">
                    💡 <span className="font-bold">Strategy:</span>{' '}
                    {pacingAssessment.tip}
                </p>
            </div>
        </Card>
    );
}

