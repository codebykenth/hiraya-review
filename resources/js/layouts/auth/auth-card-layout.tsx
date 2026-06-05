import type { PropsWithChildren } from 'react';
import AppLogoIcon from '@/components/layout/app-logo-icon';
import SiteFooter from '@/components/layout/site-footer';
import SiteHeader from '@/components/layout/site-header';
import BrandName from '@/components/shared/brand-name';

export default function AuthCardLayout({
    children,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="flex min-h-svh flex-col bg-gradient-to-tr from-slate-50 via-blue-50/50 to-slate-100 dark:from-slate-950 dark:via-blue-950/10 dark:to-slate-900">
            <SiteHeader />

            {/* Main content area */}
            <main className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden p-6 md:p-10">
                {/* Ambient glows */}
                <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
                <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500/5 blur-[120px]" />

                {/* Card */}
                <div className="relative z-10 w-full max-w-4xl">
                    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                        {/* Gradient top border */}
                        <div className="absolute top-0 right-0 left-0 h-[4.5px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-emerald-500" />

                        {/* Card Header */}
                        <div className="flex flex-col items-center gap-3 px-10 pt-10 pb-0 text-center">
                            {/* School icon */}
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 p-1 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:border-slate-800/50 dark:bg-slate-900 dark:bg-slate-950/50">
                                <AppLogoIcon className="transition-transform group-hover:scale-110 size-10 object-contain" />
                            </div>

                            <span className="font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                                <BrandName />
                            </span>

                            {description && (
                                <p className="mt-0.5 text-base leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                                    {description}
                                </p>
                            )}
                        </div>

                        {/* Card Content */}
                        <div className="px-10 pt-8 pb-10">{children}</div>
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
