import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Sparkles,
    BrainCircuit,
    BarChart3,
    Dumbbell,
    FileQuestion,
    ChevronDown,
} from 'lucide-react';
import Section from '@/components/section';
import FeatureGrid from '@/components/feature-grid';
import SectionHeader from '@/components/section-header';
import { Card } from '@/components/ui/card';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { register } from '@/routes';

export default function Welcome() {
    const [activeNav, setActiveNav] = useState('home');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    // Track visible section on scroll to update navigation state
    useEffect(() => {
        const sections = ['home', 'features', 'path', 'faq'];

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -40% 0px', // Wider, more natural detection band
            threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveNav(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach((id) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        // Ensure "home" is active when at the top of the page
        const handleScroll = () => {
            if (window.scrollY < 100) {
                setActiveNav('home');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Trigger immediately on mount

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const faqs = [
        {
            question:
                'What is the difference between the Professional and Sub-Professional exams?',
            answer: 'The Professional level exam is for technical, scientific, or executive positions and includes abstract reasoning and leadership. The Sub-Professional level exam is for clerical, administrative, or custodial positions and focuses on clerical operations and English/Filipino usage.',
        },
        {
            question: 'How realistic are the mock exams on this platform?',
            answer: 'Our mock exams are designed to match the actual Civil Service Commission (CSC) exams in timing, number of items, question distribution, and distraction-free interface to build real exam-day stamina.',
        },
        {
            question:
                'Is the question bank updated for the 2026 exam syllabus?',
            answer: 'Yes! We continuously update our question database to align with the latest CSC announcements, coverage patterns, and historical question profiles.',
        },
        {
            question: 'Can I use the platform for free?',
            answer: 'Absolutely. We offer free access to our foundation study tracks and basic question pools.',
        },
    ];

    return (
        <>
            <Head title="Welcome" />

            <div className="">
                <SiteHeader activeNav={activeNav} onNavClick={setActiveNav} />
                <main className="">
                    {/* Hero Section */}
                    <Section id="home" className="py-2 md:py-8 lg:py-10">
                        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="flex flex-col items-start gap-6">
                                <Badge className="rounded-full border border-primary bg-primary/15 px-4 py-1.5 text-primary-foreground transition-colors hover:bg-primary/30">
                                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                                    <span className="font-bold text-primary">
                                        Your way to pass the Civil Service Exam
                                    </span>
                                </Badge>

                                <h1 className="text-4xl leading-tight font-bold text-foreground md:text-5xl lg:text-6xl">
                                    Master the Civil Service Exam with{' '}
                                    <span className="text-primary">
                                        Confidence
                                    </span>
                                </h1>
                                <p className="text-lg leading-relaxed text-muted-foreground">
                                    Accelerate your preparation with our
                                    advanced, AI-powered question bank, highly
                                    realistic timed mock exams, and deeply
                                    personalized analytics. Stop guessing, start
                                    mastering.
                                </p>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <Button size="lg" asChild>
                                        <Link
                                            href={register()}
                                            className="flex items-center gap-2 font-bold"
                                        >
                                            Get Started Free
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <Link
                                            href={'#features'}
                                            className="font-bold"
                                        >
                                            Learn More
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                            {/* Right Column */}
                            <div className="relative flex items-center justify-center p-4">
                                {/* Decorative background glow */}
                                <div className="pointer-events-none absolute top-1/2 left-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]"></div>

                                <img
                                    src="/images/hero_image.png"
                                    alt="Academic Precision Platform"
                                    className="relative transform rounded-2xl object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-out hover:-translate-y-2"
                                />
                            </div>
                        </div>
                    </Section>
                    <div className="container mx-auto border-y border-gray-400 px-6 py-10">
                        <div className="flex flex-col items-center justify-evenly gap-10 md:flex-row md:gap-0">
                            <div className="flex flex-1 flex-col items-center">
                                <p className="text-2xl font-bold text-primary">
                                    500+
                                </p>
                                <p className="text-xs text-muted-foreground uppercase">
                                    Questions
                                </p>
                            </div>
                            <div className="hidden h-12 w-[1px] bg-slate-300/60 md:block dark:bg-slate-800" />
                            <div className="flex flex-1 flex-col items-center">
                                <p className="text-2xl font-bold text-primary">
                                    2
                                </p>
                                <p className="text-xs text-muted-foreground uppercase">
                                    Study Tracks
                                </p>
                            </div>
                            <div className="hidden h-12 w-[1px] bg-slate-300/60 md:block dark:bg-slate-800" />
                            <div className="flex flex-1 flex-col items-center">
                                <p className="text-2xl font-bold text-primary">
                                    6
                                </p>
                                <p className="text-xs text-muted-foreground uppercase">
                                    Categories
                                </p>
                            </div>
                            <div className="hidden h-12 w-[1px] bg-slate-300/60 md:block dark:bg-slate-800" />
                            <div className="flex flex-1 flex-col items-center">
                                <p className="text-2xl font-bold text-primary">
                                    Free
                                </p>
                                <p className="text-xs text-muted-foreground uppercase">
                                    Forever Base Access
                                </p>
                            </div>
                        </div>
                    </div>
                    <Section id="features">
                        <SectionHeader
                            title="Tools Built for Success"
                            subtitle="Everything you need to prepare, practice, and perfect your knowledge before exam day."
                            align="center"
                            className="mb-10"
                        />

                        <div className="mt-6 flex w-full flex-col gap-6">
                            {/* Row 1: Mock Exams & AI Questions */}
                            <FeatureGrid
                                reversed={false}
                                cardOneBgPattern={true}
                                cardOneIcon={
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
                                        <FileQuestion className="h-6 w-6" />
                                    </div>
                                }
                                cardOneTitle="Realistic Mock Exams"
                                cardOneDescription="Experience the exact timing, format, and pressure of the actual civil service exam. Build stamina and confidence in our distraction-free testing interface."
                                cardTwoIcon={
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        <BrainCircuit className="h-6 w-6" />
                                    </div>
                                }
                                cardTwoTitle="AI-Generated Questions"
                                cardTwoDescription="Dynamic question pools that adapt to your skill level, ensuring you never run out of fresh practice material."
                            />

                            {/* Row 2: Analytics & Category Drills (Reversed) */}
                            <FeatureGrid
                                reversed={true}
                                cardOneIcon={
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Dumbbell className="h-6 w-6" />
                                    </div>
                                }
                                cardOneTitle="Targeted Category Drills"
                                cardOneDescription="Struggling with quantitative logic? Focus your efforts with specific drill sets designed to turn weak points into strengths."
                                cardOneFooter={
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            'Logic',
                                            'Ethics',
                                            'Math',
                                            'Reading',
                                        ].map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full border border-blue-100/50 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                }
                                cardTwoIcon={
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        <BarChart3 className="h-6 w-6" />
                                    </div>
                                }
                                cardTwoTitle="Deep Score Analytics"
                                cardTwoDescription="Pinpoint your weaknesses with granular reports detailing performance by category, time-spent, and historical trends."
                            />
                        </div>
                    </Section>

                    <Section
                        id="path"
                        className="border-t border-b border-slate-100 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-900/10"
                    >
                        <SectionHeader
                            title="Your Path to Passing"
                            subtitle="A simple, effective process designed for optimal learning retention."
                            align="center"
                        />

                        <div className="relative w-full">
                            {/* Horizontal connecting line behind cards - z-0 puts it behind cards but in front of section background */}
                            <div className="absolute top-[170px] right-[16%] left-[16%] z-0 hidden h-[2.5px] bg-primary md:block " />

                            <div className="relative z-10 grid w-full grid-cols-1 gap-8 md:grid-cols-3">
                                {/* Step 1 */}
                                <Card className="relative flex flex-col items-center overflow-hidden rounded-xl border border-l-[4px] border-slate-200/80 border-l-primary bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md bg-card">
                                    <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white shadow-md">
                                        1
                                    </div>
                                    <h3 className="mt-6 font-heading text-xl font-bold text-slate-900 dark:text-white">
                                        Choose Track
                                    </h3>
                                    <p className="mt-3 max-w-[260px] text-[14px] leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                                        Select Professional or Sub-Professional
                                        level to tailor your question bank.
                                    </p>
                                </Card>

                                {/* Step 2 */}
                                <Card className="relative flex flex-col items-center overflow-hidden rounded-xl border border-l-[4px] border-slate-200/80 border-l-primary bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md bg-card">
                                    <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-white text-lg font-bold text-primary shadow-sm dark:bg-slate-950">
                                        2
                                    </div>
                                    <h3 className="mt-6 font-heading text-xl font-bold text-slate-900 dark:text-white">
                                        Take Exam
                                    </h3>
                                    <p className="mt-3 max-w-[260px] text-[14px] leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                                        Complete timed mocks or casual drills in
                                        a realistic test environment.
                                    </p>
                                </Card>

                                {/* Step 3 */}
                                <Card className="relative flex flex-col items-center overflow-hidden rounded-xl border border-l-[4px] border-slate-200/80 border-l-primary bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md bg-card">
                                    <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-white text-lg font-bold text-primary shadow-sm dark:bg-slate-950">
                                        3
                                    </div>
                                    <h3 className="mt-6 font-heading text-xl font-bold text-slate-900 dark:text-white">
                                        Review & Improve
                                    </h3>
                                    <p className="mt-3 max-w-[260px] text-[14px] leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                                        Analyze your results, read detailed
                                        explanations, and focus on weak areas.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </Section>

                    <Section
                        id="faq"
                        className="border-b border-slate-100 dark:border-slate-800/50"
                    >
                        <SectionHeader
                            title="Frequently Asked Questions"
                            subtitle="Find answers to common questions about our platform and the Civil Service Exam."
                            align="center"
                        />

                        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                            {faqs.map((faq, index) => {
                                const isOpen = openFaqIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className="dark:border-slate-850 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 dark:bg-slate-950/40"
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenFaqIndex(
                                                    isOpen ? null : index,
                                                )
                                            }
                                            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-bold text-slate-900 transition-colors hover:text-primary dark:text-white"
                                        >
                                            <span className="text-base font-bold tracking-tight md:text-[17px]">
                                                {faq.question}
                                            </span>
                                            <ChevronDown
                                                className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                                                    isOpen
                                                        ? 'rotate-180 text-primary'
                                                        : ''
                                                }`}
                                            />
                                        </button>
                                        <div
                                            className={`transition-all duration-300 ease-in-out ${
                                                isOpen
                                                    ? 'dark:border-slate-850 max-h-[250px] border-t border-slate-100'
                                                    : 'max-h-0'
                                            } overflow-hidden`}
                                        >
                                            <div className="px-6 py-5 text-sm leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Section>
                </main>

                <SiteFooter />
            </div>
        </>
    );
}
