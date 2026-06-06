import { Head } from '@inertiajs/react';
import { Shield } from 'lucide-react';
import SiteFooter from '@/components/layout/site-footer';
import SiteHeader from '@/components/layout/site-header';
import { Card } from '@/components/ui/card';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy" />
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-950/20">
                <SiteHeader activeNav="" />

                <main className="flex-1 px-4 py-12 sm:px-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-4xl sm:text-5xl md:text-4xl">
                                    Privacy Policy
                                </h1>
                                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                    Last Updated: May 29, 2026
                                </p>
                            </div>
                        </div>

                        <Card className="space-y-8 p-4 leading-relaxed sm:p-6 md:p-10 lg:p-8">
                            <section className="space-y-3">
                                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                    1. Introduction
                                </h2>
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    Welcome to the Hiraya Review portal. Hiraya
                                    Review values your privacy and is committed
                                    to protecting your personal data. This
                                    Privacy Policy outlines how Hiraya Review
                                    collects, uses, and safeguards your
                                    information when you use the platform for
                                    your CSE preparation.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                    2. Information Hiraya Review Collects
                                </h2>
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    To provide mock exams, custom study logs,
                                    and AI analytics, Hiraya Review collects:
                                </p>
                                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                                    <li>
                                        <strong>Account Credentials:</strong>{' '}
                                        Email addresses and passwords when you
                                        create a native account.
                                    </li>
                                    <li>
                                        <strong>Social Sign-In Data:</strong>{' '}
                                        Hiraya Review offers third-party
                                        authentication via Google. When you use
                                        Google to sign in, Hiraya Review
                                        receives and securely store basic
                                        profile details (such as your name and
                                        email address) to personalize your
                                        account and metrics dashboard. Hiraya
                                        Review will never post or publish to
                                        your social feed.
                                    </li>
                                    <li>
                                        <strong>Practice Data:</strong> Your
                                        test attempts, chosen tracks
                                        (Professional vs. Subprofessional),
                                        scores, categories performance, and
                                        time-per-question metrics used to
                                        generate your custom dashboard
                                        analytics.
                                    </li>
                                    <li>
                                        <strong>Log & Session Info:</strong>{' '}
                                        Minimal browser metadata to ensure
                                        system stability, rate-limiting, and
                                        security against unauthorized access.
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                    3. How Hiraya Review Uses Your Information
                                </h2>
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    Hiraya Review uses the gathered information
                                    to:
                                </p>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                    <li>
                                        Authenticate your identity and customize
                                        your preparation dashboard.
                                    </li>
                                    <li>
                                        Calculate your historical scores and
                                        performance percentages across exam
                                        disciplines.
                                    </li>
                                    <li>
                                        Train and optimize your custom AI drill
                                        generators on the sections you struggle
                                        with most.
                                    </li>
                                    <li>
                                        Protect the database from scraping and
                                        DDoS attacks.
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                    4. Data Sharing & Security
                                </h2>
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    Hiraya Review does not sell, rent, or trade
                                    your personal data with third parties. Your
                                    account records and score history are fully
                                    confidential. Hiraya Review utilizes
                                    standard SSL/TLS encryption and strict
                                    Laravel Sanctum sessions to guarantee that
                                    your profile remains secure.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                                    5. Your Choices & Rights
                                </h2>
                                <p className="text-base leading-relaxed text-muted-foreground">
                                    You have full control over your data. At any
                                    time, you can edit your profile settings or
                                    choose to permanently clear your historical
                                    attempt logs. If you wish to fully delete
                                    your account, you can go to profile settings
                                    and delete your account.
                                </p>
                            </section>
                        </Card>
                    </div>
                </main>

                <SiteFooter />
            </div>
        </>
    );
}
