import { Clock } from 'lucide-react';
import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
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

    return (
        <Card className="p-5 border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-4 flex items-center gap-2">
                <Clock className="size-4.5 text-amber-500" />
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Pacing vs Accuracy
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Average time spent per question alongside score
                    </p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ChartContainer config={config} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10} 
                                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} 
                            />
                            <YAxis 
                                yAxisId="left"
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10} 
                                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                tickFormatter={(val) => `${val}s`}
                            />
                            <YAxis 
                                yAxisId="right"
                                orientation="right"
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10} 
                                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                                tickFormatter={(val) => `${val}%`}
                                domain={[0, 100]}
                            />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                            <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:justify-center" />
                            
                            {/* Bar for Time, Line for Accuracy */}
                            <Bar yAxisId="left" dataKey="secondsPerQuestion" fill="var(--color-secondsPerQuestion)" radius={[4, 4, 0, 0]} maxBarSize={30} opacity={0.8} />
                            <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke="var(--color-accuracy)" strokeWidth={3} dot={{ r: 4, fill: 'var(--color-accuracy)' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </Card>
    );
}
