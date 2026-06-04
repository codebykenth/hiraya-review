import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';
import type { AnalyticsCategory } from '../types';

interface QuestionVolumeChartProps {
    categories: AnalyticsCategory[];
}

export function QuestionVolumeChart({ categories }: QuestionVolumeChartProps) {
    const data = categories.map((cat) => {
        const name = cat.name.replace(' Ability', '').replace(' Information', '');
        return {
            name,
            correct: cat.correct,
            incorrect: cat.total - cat.correct,
        };
    });

    const config = {
        correct: {
            label: 'Correct',
            color: 'var(--chart-2)', // emerald-ish
        },
        incorrect: {
            label: 'Incorrect',
            color: 'var(--chart-4)', // slate-ish or rose
        },
    };

    return (
        <Card className="p-5 border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-4 flex items-center gap-2">
                <BarChart2 className="size-4.5 text-blue-500" />
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Question Volume
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Total questions attempted per subject
                    </p>
                </div>
            </div>

            <div className="h-[250px] w-full">
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
                                angle={-20}
                                textAnchor="end"
                            />
                            <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tickMargin={10} 
                                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                            />
                            <ChartTooltip cursor={{ fill: 'var(--muted)', opacity: 0.2 }} content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:justify-center" />
                            <Bar dataKey="correct" stackId="a" fill="var(--color-correct)" radius={[0, 0, 4, 4]} maxBarSize={40} />
                            <Bar dataKey="incorrect" stackId="a" fill="var(--color-incorrect)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </Card>
    );
}
