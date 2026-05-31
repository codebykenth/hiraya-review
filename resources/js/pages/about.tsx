import { Head, Link } from '@inertiajs/react';
import {
    Target,
    Users,
    Sparkles,
    BookOpen,
    ArrowRight,
    ShieldCheck,
    Heart,
} from 'lucide-react';
import React from 'react';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { Button } from '@/components/ui/button';

export default function About() {
    const values = [
        {
            title: 'Excellence in Education',
            description:
                'Hiraya Review believes in providing the highest quality review materials tailored strictly to the Philippine Civil Service Commission scope.',
            icon: <Target className="size-6 text-blue-600" />,
            bg: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            title: 'Radical Accessibility',
            description:
                'Education should not be a luxury. Hiraya Review provides powerful, AI-driven study tools completely free to help every Filipino succeed.',
            icon: <Heart className="size-6 text-rose-600" />,
            bg: 'bg-rose-100 dark:bg-rose-900/30',
        },
        {
            title: 'Continuous Innovation',
            description:
                'By leveraging modern technology, Hiraya Review adapts the learning engine to target your specific weaknesses dynamically.',
            icon: <Sparkles className="size-6 text-amber-600" />,
            bg: 'bg-amber-100 dark:bg-amber-900/30',
        },
        {
            title: 'Data Privacy',
            description:
                'Hiraya Review respects your data. The platform runs securely without selling your information to third-party brokers.',
            icon: <ShieldCheck className="size-6 text-emerald-600" />,
            bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0a0a0a]">
            <Head title="About - Hiraya Review" />
            <SiteHeader activeNav="home" />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative overflow-hidden border-b border-slate-200 bg-white py-20 lg:py-32 dark:border-slate-800 dark:bg-black">
                    <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20" />
                    <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <h1 className="mb-6 font-heading text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
                                Empowering Filipinos to Serve the Nation
                            </h1>
                            <p className="mb-8 text-lg leading-relaxed text-slate-600 sm:text-xl dark:text-slate-400">
                                Hiraya Review was built with a single vision: to
                                democratize access to high-quality Civil Service
                                Exam preparation for every aspiring public
                                servant in the Philippines.
                            </p>
                        </div>
                    </div>
                </section>

                {/* The Story Section */}
                <section className="py-20 lg:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 lg:flex-row lg:gap-20">
                            <div className="flex-1 space-y-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                                <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    My Story
                                </h2>
                                <p>
                                    Preparing for the Civil Service Examination
                                    has historically been an expensive and
                                    challenging endeavor. Many review centers
                                    charge exorbitant fees, leaving countless
                                    capable individuals without the resources
                                    they need to succeed.
                                </p>
                                <p>
                                    I created{' '}
                                    <strong className="text-slate-900 dark:text-white">
                                        Hiraya Review
                                    </strong>{' '}
                                    to break down these barriers. By combining
                                    modern web technologies, artificial
                                    intelligence, and carefully curated content,
                                    I've developed an intelligent platform that
                                    acts as your personal tutor.
                                </p>
                                <p>
                                    Whether you're aiming for the Professional
                                    or Subprofessional level, the system adapts
                                    to your unique learning pace, identifying
                                    weak areas and generating highly focused
                                    study schedules to maximize your chances of
                                    passing.
                                </p>
                            </div>
                            <div className="relative w-full flex-1">
                                <div className="absolute inset-0 -m-4 rotate-3 transform rounded-3xl bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-900/20" />
                                <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <Users className="mb-6 size-16 text-blue-600 dark:text-blue-500" />
                                        <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                                            Built For You
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            I personally built this platform to
                                            use as my own reviewer for the
                                            upcoming Civil Service Exam, and I
                                            decided to share it freely to help
                                            others succeed as well.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Core Values */}
                <section className="border-t border-slate-200 bg-white py-20 lg:py-24 dark:border-slate-800 dark:bg-[#0a0a0a]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-16 text-center">
                            <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Core Values
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                The principles that guide everything at Hiraya
                                Review.
                            </p>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {values.map((val, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
                                >
                                    <div
                                        className={`mb-6 inline-flex rounded-xl p-3 ${val.bg}`}
                                    >
                                        {val.icon}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                                        {val.title}
                                    </h3>
                                    <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                                        {val.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 lg:py-32">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-4xl rounded-3xl bg-blue-600 px-6 py-16 text-center text-white shadow-xl sm:px-12 lg:px-16">
                            <h2 className="mb-6 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                                Ready to Start Your Journey?
                            </h2>
                            <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100 sm:text-xl">
                                Join thousands of aspiring civil servants
                                preparing with the smartest review platform in
                                the Philippines.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="h-14 rounded-full bg-white px-8 text-lg font-bold text-blue-600 hover:bg-slate-50"
                                    asChild
                                >
                                    <Link href="/register">
                                        Create Free Account
                                        <ArrowRight className="ml-2 size-5" />
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-14 rounded-full border-blue-400 bg-transparent px-8 text-lg font-semibold text-white hover:bg-blue-700 hover:text-white"
                                    asChild
                                >
                                    <Link href="/guide">
                                        <BookOpen className="mr-2 size-5" />
                                        Read the Guide
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <SiteFooter />
        </div>
    );
}

// Ensure the page doesn't get wrapped in the dashboard AppLayout
About.layout = undefined;
