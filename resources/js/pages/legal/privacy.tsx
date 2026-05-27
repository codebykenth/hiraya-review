import { Head } from '@inertiajs/react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function Privacy() {
    return (
        <>
            <Head title="Privacy Policy" />
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-950/20">
                <SiteHeader activeNav="" />
                
                <main className="flex-1 py-12 px-6">
                    <div className="mx-auto max-w-4xl">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                                    Privacy Policy
                                </h1>
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                    Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <Card className="p-8 md:p-10 space-y-8 leading-relaxed">
                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">1. Introduction</h2>
                                <p className="text-sm text-muted-foreground">
                                    Welcome to our Civil Service Exam Reviewer portal. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our platform for your CSE preparation.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">2. Information We Collect</h2>
                                <p className="text-sm text-muted-foreground">
                                    To provide our mock exams, custom study logs, and AI analytics, we collect:
                                </p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                                    <li><strong>Account Credentials:</strong> Email addresses and passwords when you create a native account.</li>
                                    <li><strong>Social Sign-In Data:</strong> We offer third-party authentication via Google and Facebook. When you use Google or Facebook to sign in, we receive and securely store basic profile details (such as your name, email address, and profile picture) to personalize your account and metrics dashboard. We will never post or publish to your social feed.</li>
                                    <li><strong>Practice Data:</strong> Your test attempts, chosen tracks (Professional vs. Subprofessional), scores, categories performance, and time-per-question metrics used to generate your custom dashboard analytics.</li>
                                    <li><strong>Log & Session Info:</strong> Minimal browser metadata to ensure system stability, rate-limiting, and security against unauthorized access.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">3. How We Use Your Information</h2>
                                <p className="text-sm text-muted-foreground">
                                    We use the gathered information to:
                                </p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                    <li>Authenticate your identity and customize your preparation dashboard.</li>
                                    <li>Calculate your historical scores and performance percentages across exam disciplines.</li>
                                    <li>Train and optimize your custom AI drill generators on the sections you struggle with most.</li>
                                    <li>Protect our database from scraping and DDoS attacks.</li>
                                </ul>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">4. Data Sharing & Security</h2>
                                <p className="text-sm text-muted-foreground">
                                    We do not sell, rent, or trade your personal data with third parties. Your account records and score history are fully confidential. We utilize standard SSL/TLS encryption and strict Laravel Sanctum sessions to guarantee that your profile remains secure.
                                </p>
                            </section>

                            <section className="space-y-3">
                                <h2 className="text-xl font-bold text-foreground">5. Your Choices & Rights</h2>
                                <p className="text-sm text-muted-foreground">
                                    You have full control over your data. At any time, you can edit your profile settings or choose to permanently clear your historical attempt logs. If you wish to fully delete your account, you can go to profile settings and delete your account.
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
