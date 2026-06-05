import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface FeatureGridProps {
    reversed?: boolean;

    // Card One (2-column/left card by default)
    cardOneIcon?: ReactNode;
    cardOneTitle: string;
    cardOneDescription: string;
    cardOneFooter?: ReactNode;
    cardOneBgPattern?: boolean;

    // Card Two (1-column/right card by default)
    cardTwoIcon?: ReactNode;
    cardTwoTitle: string;
    cardTwoDescription: string;
    cardTwoFooter?: ReactNode;
}

export default function FeatureGrid({
    reversed = false,
    cardOneIcon,
    cardOneTitle,
    cardOneDescription,
    cardOneFooter,
    cardOneBgPattern = false,
    cardTwoIcon,
    cardTwoTitle,
    cardTwoDescription,
    cardTwoFooter,
}: FeatureGridProps) {
    return (
        <div className="grid w-full grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3">
            {/* Card One (2-span column layout) */}
            <div
                className={`md:col-span-2 ${reversed ? 'md:order-2' : 'md:order-1'}`}
            >
                <Card className="relative flex h-full w-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/70 p-4 sm:p-6 lg:p-8 py-4 sm:py-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:border-slate-800 dark:bg-slate-950/50">
                    {/* Premium soft ambient blue gradient on the right side */}
                    {cardOneBgPattern && (
                        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 rounded-r-xl bg-gradient-to-l from-blue-500/5 via-blue-500/2 to-transparent blur-xl" />
                    )}

                    <div className="relative z-10 flex w-full flex-col gap-4">
                        {cardOneIcon && (
                            <div className="w-fit">{cardOneIcon}</div>
                        )}
                        <div className="flex flex-col gap-2 text-left">
                            <h3 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                {cardOneTitle}
                            </h3>
                            <p className="max-w-2xl text-[14px] leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                                {cardOneDescription}
                            </p>
                        </div>

                        {cardOneFooter && (
                            <div className="mt-2 flex items-center">
                                {cardOneFooter}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Card Two (1-span column layout) */}
            <div
                className={`md:col-span-1 ${reversed ? 'md:order-1' : 'md:order-2'}`}
            >
                <Card className="relative flex h-full w-full flex-col justify-between overflow-hidden border border-slate-200/80 bg-white/70 p-4 sm:p-6 lg:p-8 py-4 sm:py-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:border-slate-800 dark:bg-slate-950/50">
                    <div className="flex flex-col gap-4 text-left">
                        {cardTwoIcon && (
                            <div className="w-fit">{cardTwoIcon}</div>
                        )}
                        <div className="flex flex-col gap-2">
                            <h3 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                {cardTwoTitle}
                            </h3>
                            <p className="text-[14px] leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                                {cardTwoDescription}
                            </p>
                        </div>
                    </div>

                    {cardTwoFooter && (
                        <div className="mt-6 flex items-center">
                            {cardTwoFooter}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
