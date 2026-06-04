import React from 'react';
import { Card } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';
import type { AnalyticsCategory } from '../types';

interface SubcategoryRadarChartProps {
    categories: AnalyticsCategory[];
}

export function SubcategoryRadarChart({ categories }: SubcategoryRadarChartProps) {
    // Flatten subcategories and take top 6 or all to form radar shape
    // Or we can just use the categories themselves if there are too many subcategories.
    // Let's use the categories since there are exactly 5, making a perfect pentagon radar chart!
    // The user's request: "Radar/Spider - Skill shape across all subcategories"
    // Wait, let's collect all subcategories. If there are 15+, it might look messy but radar handles it.
    
    let data: any[] = [];
    categories.forEach(cat => {
        if (cat.subcategories) {
            cat.subcategories.forEach(sub => {
                data.push({
                    subject: sub.name,
                    accuracy: sub.percentage,
                    fullMark: 100,
                });
            });
        }
    });

    // Limit to top 8 items if too many, or just show all if less than 15. Usually 15 is fine for Radar.
    if (data.length > 12) {
        // Just show top 12 by total questions to keep it readable, or keep all.
        // We'll keep all but slice long names.
    }

    const config = {
        accuracy: {
            label: 'Accuracy',
            color: 'var(--primary)',
        },
    };

    return (
        <Card className="p-5 border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-4 flex items-center gap-2">
                <Target className="size-4.5 text-indigo-500" />
                <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        Skill Shape
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        Accuracy mapped across subtopics
                    </p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ChartContainer config={config} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                            <PolarGrid stroke="var(--border)" opacity={0.5} />
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} 
                                tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} tickCount={5} />
                            <Radar
                                name="Accuracy"
                                dataKey="accuracy"
                                stroke="var(--color-accuracy)"
                                fill="var(--color-accuracy)"
                                fillOpacity={0.4}
                            />
                            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </Card>
    );
}
