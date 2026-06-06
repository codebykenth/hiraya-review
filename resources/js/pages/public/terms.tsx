import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import SiteFooter from '@/components/layout/site-footer';
import SiteHeader from '@/components/layout/site-header';
import { Card } from '@/components/ui/card';
import DOMPurify from 'dompurify';

interface LegalContent {
    id?: number;
    type: string;
    content: string;
    updated_at?: string;
}

interface TermsProps {
    terms: LegalContent | null;
}

export default function Terms({ terms }: TermsProps) {
    return (
        <>
            <Head title="Terms of Service" />
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-950/20">
                <SiteHeader activeNav="" />

                <main className="flex-1 px-4 py-12 sm:px-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-4xl sm:text-5xl md:text-4xl">
                                    Terms of Service
                                </h1>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                    {terms?.updated_at
                                        ? `Last Updated: ${new Date(
                                            terms.updated_at
                                        ).toLocaleDateString()}`
                                        : 'Last Updated: June 6, 2026'}
                                </p>
                            </div>
                        </div>

                        <Card className="p-4 leading-relaxed sm:p-6 md:p-10 lg:p-8">
                            {terms?.content ? (
                                <div
                                    className="prose prose-slate dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(terms.content),
                                    }}
                                />
                            ) : (
                                <div className="space-y-8">
                                    <section className="space-y-3">
                                        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                            1. Acceptance of Terms
                                        </h2>
                                        <p className="text-base leading-relaxed text-muted-foreground">
                                            By accessing or using the Hiraya
                                            Review portal, you agree to comply
                                            with and be bound by these Terms of
                                            Service. If you do not agree with
                                            any part of these terms, you must
                                            not access or use the platform.
                                        </p>
                                    </section>

                                    <section className="space-y-3">
                                        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                            2. Description of Service
                                        </h2>
                                        <p className="text-base leading-relaxed text-muted-foreground">
                                            Hiraya Review provides practice exams,
                                            category-specific drills, AI-assisted
                                            question generation, and score
                                            analytics tailored for the Philippine
                                            Civil Service Exam (Professional and
                                            Sub-Professional levels). Hiraya
                                            Review provides both free base
                                            resources and customizable exam
                                            simulators.
                                        </p>
                                    </section>

                                    <section className="space-y-3">
                                        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                            3. Unofficial Study Aid Disclaimer
                                        </h2>
                                        <p className="text-rose-650 text-base leading-relaxed font-semibold text-foreground text-muted-foreground dark:text-rose-400">
                                            This platform is an independent study
                                            resource. Hiraya Review is not
                                            officially connected to, endorsed by,
                                            or affiliated with the Civil Service
                                            Commission (CSC) of the Philippines.
                                            Hiraya Review does not guarantee
                                            passing scores on actual CSC
                                            examinations; all material is intended
                                            for practice and education only.
                                        </p>
                                    </section>

                                    <section className="space-y-3">
                                        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                            4. Account Rules & Google Login
                                        </h2>
                                        <p className="text-base leading-relaxed text-muted-foreground">
                                            When registering, you may create a
                                            native profile or sign in using a
                                            Google account. You agree that:
                                        </p>
                                        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                            <li>
                                                You will provide accurate,
                                                current, and complete registration
                                                info.
                                            </li>
                                            <li>
                                                You are responsible for keeping
                                                your login credentials secure.
                                            </li>
                                            <li>
                                                Hiraya Review reserves the right
                                                to suspend accounts that show
                                                signs of automated bot abuse,
                                                scraping, or commercial resale.
                                            </li>
                                        </ul>
                                    </section>

                                    <section className="space-y-3">
                                        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                            5. Fair Use & Prohibited Acts
                                        </h2>
                                        <p className="text-base leading-relaxed text-muted-foreground">
                                            Hiraya Review's question bank and
                                            study materials are protected by
                                            intellectual property guidelines. You
                                            are prohibited from using
                                            web-scrapers, spiders, or automated
                                            scripts to download or clone Hiraya
                                            Review's practice sets for commercial
                                            use. Standard manual study and
                                            personal mock testing are fully
                                            permitted.
                                        </p>
                                    </section>

                                    <section className="space-y-3">
                                        <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                            6. Modifications and Termination of
                                            Service
                                        </h2>
                                        <p className="text-base leading-relaxed text-muted-foreground">
                                            Hiraya Review reserves the right to
                                            modify, suspend, discontinue, or
                                            completely close this project and
                                            terminate the service (or any portion
                                            thereof) at any time, for any reason,
                                            with or without prior notice, and
                                            without any form of liability to you.
                                            As a free educational platform, you
                                            agree that Hiraya Review has no
                                            obligation to maintain, host, or
                                            guarantee continuous availability of
                                            the platform or your historical
                                            practice metrics.
                                        </p>
                                    </section>
                                </div>
                            )}
                        </Card>
                    </div>
                </main>

                <SiteFooter />
            </div>
        </>
    );
}
