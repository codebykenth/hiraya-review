import { Head } from '@inertiajs/react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service" />
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-950/20">
                <SiteHeader activeNav="" />
                
                <main className="flex-1 py-12 px-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                    Terms of Service
                                </h1>
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <Card className="p-8 md:p-10 space-y-8 leading-relaxed">
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">1. Acceptance of Terms</h2>
                                <p className="text-sm text-muted-foreground">
                                    By accessing or using our Civil Service Exam Reviewer portal, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, you must not access or use the platform.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">2. Description of Service</h2>
                                <p className="text-sm text-muted-foreground">
                                    Our platform provides practice exams, category-specific drills, AI-assisted question generation, and score analytics tailored for the Philippine Civil Service Exam (Professional and Sub-Professional levels). We provide both free base resources and customizable exam simulators.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">3. Unofficial Study Aid Disclaimer</h2>
                                <p className="text-sm text-muted-foreground font-semibold text-foreground text-rose-650 dark:text-rose-400">
                                    This platform is an independent study resource. We are not officially connected to, endorsed by, or affiliated with the Civil Service Commission (CSC) of the Philippines. We do not guarantee passing scores on actual CSC examinations; all material is intended for practice and education only.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">4. Account Rules & Google/Facebook Logins</h2>
                                <p className="text-sm text-muted-foreground">
                                    When registering, you may create a native profile or sign in using a Google or Facebook account. You agree that:
                                </p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                    <li>You will provide accurate, current, and complete registration info.</li>
                                    <li>You are responsible for keeping your login credentials secure.</li>
                                    <li>We reserve the right to suspend accounts that show signs of automated bot abuse, scraping, or commercial resale.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">5. Fair Use & Prohibited Acts</h2>
                                <p className="text-sm text-muted-foreground">
                                    Our question bank and study materials are protected by intellectual property guidelines. You are prohibited from using web-scrapers, spiders, or automated scripts to download or clone our practice sets for commercial use. Standard manual study and personal mock testing are fully permitted.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">6. Modifications and Termination of Service</h2>
                                <p className="text-sm text-muted-foreground">
                                    We reserve the right to modify, suspend, discontinue, or completely close this project and terminate the service (or any portion thereof) at any time, for any reason, with or without prior notice, and without any form of liability to you. As a free educational platform, you agree that we have no obligation to maintain, host, or guarantee continuous availability of the platform or your historical practice metrics.
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
