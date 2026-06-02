import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardProps {
    label: string;
    value: number | string;
    suffix?: string;
    icon: LucideIcon;
    iconBgColor: string;
    iconTextColor: string;
    footer?: {
        highlight: string;
        highlightColor: string;
        secondary?: string;
        secondaryColor?: string;
    };
}

export function StatsCard({
    label,
    value,
    suffix,
    icon: Icon,
    iconBgColor,
    iconTextColor,
    footer,
}: StatsCardProps) {
    return (
        <Card className="p-5 shadow-xs">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                    {label}
                </span>
                <div
                    className={`flex size-8 items-center justify-center rounded-lg ${iconBgColor} ${iconTextColor}`}
                >
                    <Icon className="size-4" />
                </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {value}
                </span>
                {suffix && (
                    <span className="text-[10px] font-bold text-slate-400">
                        {suffix}
                    </span>
                )}
            </div>
            {footer && (
                <div className="mt-2.5 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    <span className={footer.highlightColor}>
                        {footer.highlight}
                    </span>
                    {footer.secondary && (
                        <>
                            <span className="text-slate-300 dark:text-slate-700">
                                •
                            </span>
                            <span className={footer.secondaryColor}>
                                {footer.secondary}
                            </span>
                        </>
                    )}
                </div>
            )}
        </Card>
    );
}
