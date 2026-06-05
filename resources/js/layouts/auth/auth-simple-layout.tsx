import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/layout/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-background p-4 sm:gap-6 sm:p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-4 sm:gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="group flex flex-col items-center gap-2 font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                        >
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] transition-transform group-hover:scale-110 dark:text-white" />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-base leading-relaxed text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
