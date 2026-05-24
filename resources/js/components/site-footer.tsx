import BrandName from '@/components/brand-name';

// Renders the standard visitor footer shared across the home, login, and registration pages
export default function SiteFooter() {
    return (
        <footer className="border-t border-slate-200 bg-primary/20 px-6 py-16 dark:border-slate-800 dark:bg-slate-950/20">
            <div className="container mx-auto flex max-w-7xl flex-col gap-10">
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
                        &copy; 2026 <BrandName />. All rights reserved.
                    </p>

                    <div className="flex flex-wrap gap-x-8 gap-y-3">
                        {[
                            'Privacy Policy',
                            'Terms of Service',
                            'Help Center',
                            'Contact Support',
                        ].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-400"
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
