import { Link } from '@inertiajs/react';
import BrandName from '@/components/brand-name';

// Renders the standard visitor footer shared across the home, login, and registration pages
export default function SiteFooter() {
    return (
        <footer className="border-t border-slate-200 bg-primary/20 px-6 py-12 dark:border-slate-800 dark:bg-slate-950/20">
            <div className="container mx-auto flex max-w-7xl flex-col gap-8">
                <div className="flex w-full flex-col gap-2 text-left">
                    <h3 className="font-heading text-2xl font-extrabold tracking-tight text-primary">
                        <BrandName />
                    </h3>
                    <p className="text-sm leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                        Empowering candidates to succeed in public service
                        examinations through advanced preparation tools.
                    </p>
                </div>

                <div className="flex w-full flex-col items-start justify-between gap-6 border-t border-slate-200/60 pt-6 text-left md:flex-row md:items-center dark:border-slate-800/60">
                    <p className="text-xs font-normal text-slate-500 dark:text-slate-400">
                        &copy; {new Date().getFullYear()} <BrandName />. All
                        rights reserved.
                    </p>

                    <div className="flex flex-wrap gap-x-8 gap-y-3">
                        <Link
                            href="/privacy"
                            className="text-xs font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-xs font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400"
                        >
                            Terms of Service
                        </Link>
                        <Link
                            href="/support"
                            className="text-xs font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>

                {/* Legal / Non-Affiliation Disclaimer */}
                <div className="border-t border-slate-200/40 pt-6 dark:border-slate-800/40">
                    <p className="text-left text-[11px] leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                        <span className="mr-1.5 font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Disclaimer:
                        </span>
                        This platform is an independent, unofficial study
                        reviewer and preparation portal. It is not affiliated,
                        associated, authorized, endorsed by, or in any way
                        officially connected with the Civil Service Commission
                        (CSC) of the Philippines, or any government agency or
                        department. All brand names, logos, or exam designations
                        referenced herein are trademarks or registered
                        trademarks of their respective holders, and their use
                        does not imply any affiliation with or endorsement by
                        them.
                    </p>
                </div>
            </div>
        </footer>
    );
}
