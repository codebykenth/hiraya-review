import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Sparkles,
    BrainCircuit,
    Dumbbell,
    FileQuestion,
    ChevronDown,
    BookOpen,
    History,
    Target,
    Award,
    ClipboardList,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ReviewerGuideTabs } from '@/components/domain/reviewer-guide-tabs';
import { PageHeader } from '@/components/layout/page-header';
import Section from '@/components/layout/section';
import SectionHeader from '@/components/layout/section-header';
import SiteFooter from '@/components/layout/site-footer';
import SiteHeader from '@/components/layout/site-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { register } from '@/routes';
import type { Auth } from '@/types';
import FeatureGrid from './components/feature-grid';

export default function Welcome() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [isFreeExamModalOpen, setIsFreeExamModalOpen] = useState(false);
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);

    const handleFreeExamStart = (track: 'professional' | 'subprofessional') => {
        setIsFreeExamModalOpen(false);

        if (auth?.user) {
            router.visit(`/exams?start=${track}`);
        } else {
            router.visit(`/exams?start=${track}&free_attempt=1`);
        }
    };
    const [activeNav, setActiveNav] = useState('home');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    // Track visible section on scroll to update navigation state
    useEffect(() => {
        const sections = ['home', 'features', 'path', 'guide', 'faq'];

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
            answer: 'Our mock exams are designed to simulate the general format, timing, and structure commonly used in Civil Service Commission (CSC) examinations, with a distraction-free interface  to build real exam-day stamina.',
        },
        {
            question: `Is the question bank updated for the ${new Date().getFullYear()} exam syllabus?`,
            answer: 'Yes! Hiraya Review continuously updates its question database to align with the latest CSC announcements, coverage patterns, and historical question profiles.',
        },
        {
            question: 'Can I use the platform for free?',
            answer: 'Absolutely. Hiraya Review offers free access to its foundation study tracks and basic question pools.',
        },
    ];

    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Hiraya Review',
        alternateName: 'Civil Service Exam Reviewer',
        url: 'https://hirayareview.com',
        description:
            'Ace the Philippine Civil Service Exam with confidence. Real mock tests, custom study plans, high-yield lessons, and targeted drills.',
        potentialAction: {
            '@type': 'SearchAction',
            target: 'https://hirayareview.com/learn?search={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
    };

    const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: `Civil Service Exam Reviewer ${new Date().getFullYear()}`,
        description:
            'Ace the Philippine Civil Service Exam (Professional & Subprofessional levels) with interactive mock tests, smart study plans, and targeted drills.',
        provider: {
            '@type': 'EducationalOrganization',
            name: 'Hiraya Review',
            sameAs: 'https://hirayareview.com',
        },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    return (
        <>
            <Head>
                <title>{`Civil Service Exam Reviewer ${new Date().getFullYear()}`}</title>
                <meta
                    name="description"
                    content="Ace the Philippine Civil Service Exam with confidence. Hiraya Review offers realistic Professional & Subprofessional mock exams, smart study plans, high-yield learning modules, and targeted drills. Free forever base access!"
                />
                <meta
                    property="og:title"
                    content={`Civil Service Exam Reviewer ${new Date().getFullYear()} | Hiraya Review`}
                />
                <meta
                    property="og:description"
                    content="Ace the Philippine Civil Service Exam with confidence. Real mock tests, custom study plans, high-yield lessons, and targeted drills. Pass the CSE on your first attempt!"
                />
                <script type="application/ld+json">
                    {JSON.stringify(websiteSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(courseSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            </Head>

            <div className="">
                <SiteHeader activeNav={activeNav} onNavClick={setActiveNav} />
                <main className="">
                    {/* Hero Section */}
                    <Section id="home" className="py-2 md:py-8 lg:py-10">
                        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="flex flex-col items-start gap-3 sm:gap-6">
                                <Badge className="inline-flex h-auto max-w-full items-start rounded-2xl border border-primary bg-primary/15 px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/30 sm:items-center sm:rounded-full sm:py-1.5">
                                    <Sparkles className="mt-0.5 mr-2 h-4 w-4 shrink-0 text-primary sm:mt-0" />
                                    <span className="text-left font-bold whitespace-normal text-primary sm:text-center">
                                        Turning dreams into exam success through
                                        disciplined review.
                                    </span>
                                </Badge>

                                <h1 className="text-2xl leading-tight font-bold text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
                                    Master the Civil Service Exam with{' '}
                                    <span className="text-primary">
                                        Confidence
                                    </span>
                                </h1>
                                <p className="text-lg leading-relaxed text-muted-foreground">
                                    Accelerate your preparation with an
                                    AI-assisted question bank, realistic timed
                                    mock exams, and performance analytics
                                    designed to support structured Civil Service
                                    Exam review.
                                </p>

                                <div className="flex flex-wrap gap-4 pt-2">
                                    <Button size="lg" asChild>
                                        <Link
                                            href={register()}
                                            className="group flex items-center gap-2 font-bold transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                        >
                                            Get Started Free
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        onClick={() =>
                                            setIsFreeExamModalOpen(true)
                                        }
                                        className="flex items-center gap-2 font-bold"
                                    >
                                        <FileQuestion className="h-5 w-5" />
                                        Try Mock Test
                                    </Button>
                                    <Button variant="outline" size="lg" asChild>
                                        <Link
                                            href={'#features'}
                                            className="group font-bold transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                                        >
                                            Learn More
                                        </Link>
                                    </Button>
                                </div>

                                {/* Free Exam Level Selection Modal */}
                                <Dialog
                                    open={isFreeExamModalOpen}
                                    onOpenChange={setIsFreeExamModalOpen}
                                >
                                    <DialogContent className="sm:max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Choose Your Exam Level
                                            </DialogTitle>
                                            <DialogDescription>
                                                Try a free mock exam. Experience
                                                the full simulator and view your
                                                scorecard upon completion.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-3 py-4">
                                            <button
                                                onClick={() =>
                                                    handleFreeExamStart(
                                                        'professional',
                                                    )
                                                }
                                                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary hover:bg-primary/5"
                                            >
                                                <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Award className="size-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">
                                                        Professional Level
                                                    </p>
                                                    <p className="text-base leading-relaxed text-muted-foreground">
                                                        170 questions &bull; 3
                                                        hrs 10 mins
                                                    </p>
                                                </div>
                                                <ArrowRight className="ml-auto size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleFreeExamStart(
                                                        'subprofessional',
                                                    )
                                                }
                                                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary hover:bg-primary/5"
                                            >
                                                <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <ClipboardList className="size-6" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">
                                                        Subprofessional Level
                                                    </p>
                                                    <p className="text-base leading-relaxed text-muted-foreground">
                                                        165 questions &bull; 2
                                                        hrs 40 mins
                                                    </p>
                                                </div>
                                                <ArrowRight className="ml-auto size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                                            </button>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="ghost"
                                                onClick={() =>
                                                    setIsFreeExamModalOpen(
                                                        false,
                                                    )
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
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
                    <div className="container mx-auto border-y border-gray-400 px-4 py-10 sm:px-6">
                        <div className="flex flex-col items-center justify-evenly gap-5 sm:gap-10 md:flex-row md:gap-0">
                            <div className="flex flex-1 flex-col items-center">
                                <p className="text-2xl font-black text-primary sm:text-4xl">
                                    500+
                                </p>
                                <p className="mt-1 text-sm leading-relaxed font-bold tracking-wider text-muted-foreground uppercase">
                                    Questions
                                </p>
                            </div>
                            <div className="hidden h-12 w-full max-w-[1px] bg-slate-300/60 md:block dark:bg-slate-800" />
                            <div className="flex flex-1 flex-col items-center">
                                <p className="text-2xl font-black text-primary sm:text-4xl">
                                    2
                                </p>
                                <p className="mt-1 text-sm leading-relaxed font-bold tracking-wider text-muted-foreground uppercase">
                                    Study Tracks
                                </p>
                            </div>
                            <div className="hidden h-12 w-full max-w-[1px] bg-slate-300/60 md:block dark:bg-slate-800" />
                            <div className="flex flex-1 flex-col items-center">
                                <p className="text-2xl font-black text-primary sm:text-4xl">
                                    6
                                </p>
                                <p className="mt-1 text-sm leading-relaxed font-bold tracking-wider text-muted-foreground uppercase">
                                    Categories
                                </p>
                            </div>
                            <div className="hidden h-12 w-full max-w-[1px] bg-slate-300/60 md:block dark:bg-slate-800" />
                            <div className="flex flex-1 flex-col items-center">
                                <p className="text-2xl font-black text-primary sm:text-4xl">
                                    Free
                                </p>
                                <p className="mt-1 text-sm leading-relaxed font-bold tracking-wider text-muted-foreground uppercase">
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

                        <div className="mt-6 flex w-full flex-col gap-3 sm:gap-6">
                            {/* Row 1: Mock Exams & Learn */}
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
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:bg-indigo-950/40 dark:text-indigo-400">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                }
                                cardTwoTitle="Conceptual Study Hub (Learn)"
                                cardTwoDescription="Access concise, high-yield syllabus modules generated from core civil service subjects to lock in key concepts and terms."
                            />

                            {/* Row 2: Category Drills & Analytics (History) */}
                            <FeatureGrid
                                reversed={true}
                                cardOneIcon={
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:bg-blue-950/40 dark:text-blue-400">
                                        <Dumbbell className="h-6 w-6" />
                                    </div>
                                }
                                cardOneTitle="Targeted Practice Drills"
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
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:bg-amber-950/40 dark:text-amber-400">
                                        <History className="h-6 w-6" />
                                    </div>
                                }
                                cardTwoTitle="Attempt History & Analytics"
                                cardTwoDescription="Pinpoint your weaknesses with granular reports detailing performance by category, time-spent, and review every single incorrect response."
                            />

                            {/* Row 3: Study Plan & AI Questions */}
                            <FeatureGrid
                                reversed={false}
                                cardOneIcon={
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                                        <Target className="h-6 w-6" />
                                    </div>
                                }
                                cardOneTitle="Smart Study Plan"
                                cardOneDescription="Generate a dynamic, customizable study schedule that maps out your topics day by day, preventing burnout and ensuring you cover the entire syllabus before exam day."
                                cardTwoIcon={
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:bg-emerald-950/40 dark:text-emerald-400">
                                        <BrainCircuit className="h-6 w-6" />
                                    </div>
                                }
                                cardTwoTitle="AI-Generated Questions"
                                cardTwoDescription="Dynamic question pools that provide varied practice sets to help reinforce learning and skill development."
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
                            <div className="absolute top-[170px] right-[16%] left-[16%] z-0 hidden h-[2.5px] bg-primary md:block" />

                            <div className="relative z-10 grid w-full grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3">
                                {/* Step 1 */}
                                <Card
                                    onMouseEnter={() => setHoveredStep(1)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                    className={`relative flex flex-col items-center overflow-hidden rounded-xl border border-l-4 border-slate-200/80 bg-card p-4 text-center shadow-sm transition-all duration-300 sm:p-6 lg:p-8 ${
                                        hoveredStep === 1
                                            ? 'border-l-primary'
                                            : 'border-l-primary'
                                    } hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5`}
                                >
                                    <div
                                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full text-xl font-black tracking-tight shadow-md transition-colors duration-300 ${
                                            hoveredStep === null ||
                                            hoveredStep === 1
                                                ? 'bg-primary text-white'
                                                : 'border-2 border-primary bg-card text-primary'
                                        }`}
                                    >
                                        1
                                    </div>
                                    <h3 className="mt-6 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                        Choose Track
                                    </h3>
                                    <p className="mt-3 max-w-65 text-[14px] leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                                        Select Professional or Sub-Professional
                                        level to tailor your question bank.
                                    </p>
                                </Card>

                                {/* Step 2 */}
                                <Card
                                    onMouseEnter={() => setHoveredStep(2)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                    className={`relative flex flex-col items-center overflow-hidden rounded-xl border border-l-4 border-slate-200/80 bg-card p-4 text-center shadow-sm transition-all duration-300 sm:p-6 lg:p-8 ${
                                        hoveredStep === 2
                                            ? 'border-l-primary'
                                            : 'border-l-primary'
                                    } hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5`}
                                >
                                    <div
                                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full text-xl font-black tracking-tight shadow-sm transition-colors duration-300 ${
                                            hoveredStep === 2
                                                ? 'bg-primary text-white'
                                                : 'border-2 border-primary bg-card text-primary'
                                        }`}
                                    >
                                        2
                                    </div>
                                    <h3 className="mt-6 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                                        Take Exam
                                    </h3>
                                    <p className="mt-3 max-w-65 text-[14px] leading-relaxed font-normal text-slate-600 dark:text-slate-400">
                                        Complete timed mocks or casual drills in
                                        a realistic test environment.
                                    </p>
                                </Card>

                                {/* Step 3 */}
                                <Card
                                    onMouseEnter={() => setHoveredStep(3)}
                                    onMouseLeave={() => setHoveredStep(null)}
                                    className={`relative flex flex-col items-center overflow-hidden rounded-xl border border-l-4 border-slate-200/80 bg-card p-4 text-center shadow-sm transition-all duration-300 sm:p-6 lg:p-8 ${
                                        hoveredStep === 3
                                            ? 'border-l-primary'
                                            : 'border-l-primary'
                                    } hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5`}
                                >
                                    <div
                                        className={`z-10 flex h-12 w-12 items-center justify-center rounded-full text-xl font-black tracking-tight shadow-sm transition-colors duration-300 ${
                                            hoveredStep === 3
                                                ? 'bg-primary text-white'
                                                : 'border-2 border-primary bg-card text-primary'
                                        }`}
                                    >
                                        3
                                    </div>
                                    <h3 className="mt-6 font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
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

                    <Section id="guide" className="mx-auto max-w-6xl space-y-8">
                        <div className="flex items-start gap-4 border-b border-border pb-6 md:items-center">
                            <PageHeader
                                title="Civil Service Exam Reviewer Guide"
                                description="Learn how to streamline your preparation process, navigate exam structures, and maximize your passing odds."
                                className="flex-1"
                            />
                        </div>
                        <ReviewerGuideTabs showActions={!!auth?.user} />
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
                                        className="overflow-hidden rounded-2xl border border-slate-200/50 bg-white/70 shadow-sm backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:border-slate-800/50 dark:bg-slate-900/40 dark:bg-slate-950/50"
                                    >
                                        <button
                                            onClick={() =>
                                                setOpenFaqIndex(
                                                    isOpen ? null : index,
                                                )
                                            }
                                            className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left font-bold text-slate-900 transition-colors hover:text-primary sm:px-6 dark:text-white"
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
                                                    ? 'max-h-[250px] border-t border-slate-100 dark:border-slate-800'
                                                    : 'max-h-0'
                                            } overflow-hidden`}
                                        >
                                            <div className="px-4 py-5 text-sm leading-relaxed font-normal text-slate-600 sm:px-6 dark:text-slate-400">
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
