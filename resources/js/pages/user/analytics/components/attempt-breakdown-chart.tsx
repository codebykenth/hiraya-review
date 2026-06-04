import { Layers } from 'lucide-react';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { AttemptBreakdown } from '../types';

interface AttemptBreakdownChartProps {
    data: AttemptBreakdown[];
}

export function AttemptBreakdownChart({ data }: AttemptBreakdownChartProps) {
    const config = {
        Verbal: { label: 'Verbal', color: 'var(--chart-1)' },
        Clerical: { label: 'Clerical', color: 'var(--chart-2)' },
        General: { label: 'General Info', color: 'var(--chart-3)' },
        Numerical: { label: 'Numerical', color: 'var(--chart-4)' },
        Analytical: { label: 'Analytical', color: 'var(--chart-5)' },
    };

    return (
        <Card className="p-5 border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40 w-full mb-6">
            <div className="mb-4 flex items-center gap-2">
                <Layers className="size-5 text-indigo-500" />
                <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                        Run Composition
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Category score contribution per attempt
                    </p>
                </div>
            </div>

            <div className="h-[320px] w-full">
                <ChartContainer config={config} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis 
                                dataKey="name" 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10} 
                                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} 
                            />
                            <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10} 
                                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} className="flex-wrap gap-2 [&>*]:justify-center mt-2" />
                            
                            <Bar dataKey="Verbal" stackId="a" fill="var(--color-Verbal)" radius={[0, 0, 4, 4]} maxBarSize={40} />
                            <Bar dataKey="Clerical" stackId="a" fill="var(--color-Clerical)" maxBarSize={40} />
                            <Bar dataKey="General" stackId="a" fill="var(--color-General)" maxBarSize={40} />
                            <Bar dataKey="Numerical" stackId="a" fill="var(--color-Numerical)" maxBarSize={40} />
                            <Bar dataKey="Analytical" stackId="a" fill="var(--color-Analytical)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </Card>
    );
}
