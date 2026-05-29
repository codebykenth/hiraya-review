import { Link } from '@inertiajs/react';
import {
    ShieldAlert,
    Heart,
    ExternalLink,
    Scale,
    ShieldCheck,
    Mail
} from 'lucide-react';
import React from 'react';

import AppLogo from './app-logo';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border bg-card text-card-foreground">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                {/* Top Section */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">

                    {/* Branding */}
                    <div className="lg:col-span-4 flex flex-col gap-3">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-base font-black tracking-tight text-foreground transition hover:opacity-90"
                        >
                            <AppLogo />
                        </Link>

                        <p className="max-w-2xl text-xs font-medium leading-relaxed text-muted-foreground">
                            An interactive reviewer platform designed to help Filipino examinees
                            strengthen core competencies for Professional and Sub-Professional
                            Civil Service Examination preparation.
                        </p>

                        
                    </div>

                    {/* Legal Disclaimer */}
                    <div className="lg:col-span-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-3xs dark:bg-amber-950/10">
                        <div className="flex gap-3">

                            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-500" />

                            <div className="flex flex-col gap-2">

                                <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                                    Legal Disclaimer & Educational Use Only
                                </span>

                                <p className="text-xs font-medium leading-relaxed text-amber-950/80 dark:text-slate-300">
                                    Hiraya Review is an independent educational learning platform
                                    created solely for examination preparation and reviewer practice simulation.
                                    <strong>
                                        {' '}
                                        This platform is NOT affiliated with, authorized, endorsed by,
                                        or officially connected to the Civil Service Commission (CSC)
                                    </strong>{' '}
                                    or any government agency in the Philippines.
                                </p>

                                <p className="text-xs font-medium leading-relaxed text-amber-950/80 dark:text-slate-300">
                                    All mock examinations, reviewer materials, explanations,
                                    and practice content are independently created for educational purposes only.
                                    Some questions and learning modules may be AI-assisted or AI-generated.
                                </p>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="my-8 h-px w-full bg-border" />

                {/* Bottom Section */}
                <div className="flex flex-col items-center justify-between gap-5 text-xs font-semibold text-muted-foreground md:flex-row">

                    {/* Copyright */}
                    <div className="order-3 text-center md:order-1 md:text-left">
                        © {currentYear} Hiraya Review
                    </div>

                    {/* Footer Navigation */}
                    <div className="order-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:order-2">

                        <a
                            href="/terms"
                            className="inline-flex items-center gap-1.5 underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-foreground"
                        >
                            <Scale className="size-3.5" />
                            Terms of Service
                        </a>

                        <a
                            href="/privacy"
                            className="inline-flex items-center gap-1.5 underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-foreground"
                        >
                            <ShieldCheck className="size-3.5" />
                            Privacy Policy
                        </a>

                        <a
                            href="/support"
                            className="inline-flex items-center gap-1.5 underline decoration-border underline-offset-4 transition hover:text-foreground hover:decoration-foreground"
                        >
                            <Mail className="size-3.5" />
                            Contact Support
                        </a>
                    </div>

                    {/* Creator Credit */}
                    <div className="order-2 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1.5 text-center text-foreground transition hover:bg-muted/80 md:order-3">

                        <span>Made with</span>

                        <Heart className="size-3.5 fill-rose-500 text-rose-500 animate-pulse" />

                        <span>by</span>

                        <a
                            href="https://kenthalexisosila.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-bold underline transition hover:text-blue-600"
                        >
                            Kenth Alexis Osila
                            <ExternalLink className="size-2.5" />
                        </a>

                        <span>
                            to support Filipino examinees in their review journey.
                        </span>

                    </div>
                </div>
            </div>
        </footer>
    );
}