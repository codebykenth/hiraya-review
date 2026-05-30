import { Head, Link, usePage } from '@inertiajs/react';
import {
    Compass,
    BookOpen,
    ClipboardList,
    History,
    Target,
    ArrowRight,
    HelpCircle,
    Award,
    Clock,
    CheckCircle2,
    Lightbulb,
    Info,
} from 'lucide-react';
import { useState } from 'react';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Guide() {
    const { auth } = usePage<PageProps>().props;
    const isLoggedIn = !!auth.user;
    const [activeTab, setActiveTab] = useState<'flow' | 'structure' | 'tips'>(
        'flow',
    );

    const studySteps = [
        {
            phase: 'Phase 1',
            title: 'Diagnostic Benchmark',
            icon: ClipboardList,
            color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30',
            description:
                'Begin by taking a full-length simulated Mock Exam to establish your baseline score. The actual exam requires an 80% passing rate.',
            actionLabel: 'Take Mock Exam',
            actionUrl: '/exams',
            tips: [
                'Choose Professional (170 questions, 3h 10m) or Subprofessional (165 questions, 2h 40m).',
                'Take it in a quiet environment without calculators or search aids to mimic real test conditions.',
            ],
        },
        {
            phase: 'Phase 2',
            title: 'Conceptual Study Hub',
            icon: BookOpen,
            color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30',
            description:
                'Navigate to the Study Hub (Learn Section) to read concise, high-yield syllabus modules generated from core civil service subjects.',
            actionLabel: 'Explore Study Hub',
            actionUrl: '/learn',
            tips: [
                'Focus on topics highlighted as focus areas in your dashboard.',
                'Use the interactive summaries to lock in key concepts and terms.',
            ],
        },
        {
            phase: 'Phase 3',
            title: 'Focused Practice Drills',
            icon: Target,
            color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30',
            description:
                'Strengthen weaker subject subcategories with Practice Drills. Create custom sets with active immediate explanations.',
            actionLabel: 'Launch Practice Drill',
            actionUrl: '/drills',
            tips: [
                'Target specific mathematical, verbal, or analytical subcategories.',
                'Read the instant visual explanations immediately after answering each question.',
            ],
        },
        {
            phase: 'Phase 4',
            title: 'Mistake Curation & Analytics',
            icon: History,
            color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30',
            description:
                'Track your scoring mastery, passing ratios, and average speed. Review every single incorrect response in Attempt History.',
            actionLabel: 'Review Attempt History',
            actionUrl: '/history',
            tips: [
                'Review failed attempts once a week to verify you understand the correct logic.',
                'Re-run drills on subcategories where your score is below 80%.',
            ],
        },
    ];

    const examStructure = {
        professional: {
            title: 'Professional Exam Level',
            items: 170,
            time: '3 hours and 10 minutes',
            scope: [
                {
                    name: 'Numerical Ability',
                    detail: 'Basic Operations, Word Problems, Data Interpretation',
                },
                {
                    name: 'Analytical Ability',
                    detail: 'Word Association, Identifying Assumptions, Logical Reasoning',
                },
                {
                    name: 'Verbal Ability',
                    detail: 'Vocabulary, Grammar, Sentence Completion, Reading Comprehension',
                },
                {
                    name: 'General Information',
                    detail: 'Philippine Constitution, Code of Conduct, Peace & Human Rights',
                },
            ],
        },
        subprofessional: {
            title: 'Subprofessional Exam Level',
            items: 165,
            time: '2 hours and 40 minutes',
            scope: [
                {
                    name: 'Numerical Ability',
                    detail: 'Basic Operations, Word Problems',
                },
                {
                    name: 'Clerical Ability',
                    detail: 'Filing, Spelling, General Clerical Procedures',
                },
                {
                    name: 'Verbal Ability',
                    detail: 'Vocabulary, Grammar, Sentence Completion, Reading Comprehension',
                },
                {
                    name: 'General Information',
                    detail: 'Philippine Constitution, Code of Conduct, Peace & Human Rights',
                },
            ],
        },
    };

    const generalTips = [
        {
            title: 'Maintain the 80% Benchmark',
            description:
                'Both Professional and Subprofessional examinations require a minimum rating of 80.00% to pass. Standardize your drills and mock exam benchmarks at 80% accuracy.',
            icon: Award,
            color: 'border-l-emerald-500 text-emerald-600',
        },
        {
            title: 'Master Time Management',
            description:
                'You have roughly 67 seconds per question on the Professional exam, and 58 seconds on the Subprofessional exam. Train your pace under the timer inside the Mock Exam mode.',
            icon: Clock,
            color: 'border-l-blue-500 text-blue-600',
        },
        {
            title: 'Analyze Explanations',
            description:
                'Getting questions wrong is part of study optimization. Make it a habit to hover or click on explanations to see the mathematical formula or grammatical rule applied.',
            icon: Lightbulb,
            color: 'border-l-indigo-500 text-indigo-600',
        },
    ];

    const content = (
        <div className="mx-auto max-w-6xl space-y-8">
            {/* Header section */}
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Compass className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Civil Service Exam Reviewer Guide
                    </h1>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        Learn how to streamline your preparation process,
                        navigate exam structures, and maximize your passing
                        odds.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab('flow')}
                    className={`border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                        activeTab === 'flow'
                            ? 'border-primary font-bold text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Reviewer Study Flow
                </button>
                <button
                    onClick={() => setActiveTab('structure')}
                    className={`border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                        activeTab === 'structure'
                            ? 'border-primary font-bold text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    CSE Exam Structure
                </button>
                <button
                    onClick={() => setActiveTab('tips')}
                    className={`border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
                        activeTab === 'tips'
                            ? 'border-primary font-bold text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Smart Study Tips
                </button>
            </div>

            {/* Tab: Reviewer Study Flow */}
            {activeTab === 'flow' && (
                <div className="space-y-6">
                    <div className="flex items-start gap-3.5 rounded-xl border border-blue-100 bg-blue-50/20 p-5 dark:border-blue-900/30 dark:bg-blue-950/10">
                        <Info className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                Recommended Study Pathway
                            </h3>
                            <p className="mt-1 text-xs leading-relaxed text-blue-700/95 dark:text-blue-400/90">
                                Studies show that taking a diagnostic test first
                                helps identify exact focus subcategories, which
                                prevents wasting time reviewing areas you have
                                already mastered. Follow the four-phase system
                                below to maximize your efficiency.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {studySteps.map((step, idx) => (
                            <Card
                                key={idx}
                                className="hover:border-slate-350 overflow-hidden border border-border bg-card transition duration-200 dark:hover:border-slate-700"
                            >
                                <div className="space-y-4 p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black tracking-wider text-slate-600 uppercase dark:bg-slate-900 dark:text-slate-400">
                                            {step.phase}
                                        </span>
                                        <div
                                            className={`rounded-lg p-2 ${step.color}`}
                                        >
                                            <step.icon className="size-5" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-lg font-black text-foreground">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                            {step.description}
                                        </p>
                                    </div>

                                    <div className="border-t border-border pt-4">
                                        <h4 className="mb-2 text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                            Pro study tips:
                                        </h4>
                                        <ul className="space-y-1.5">
                                            {step.tips.map((tip, tIdx) => (
                                                <li
                                                    key={tIdx}
                                                    className="flex items-start gap-2 text-xs font-semibold text-foreground"
                                                >
                                                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {isLoggedIn && (
                                        <div className="flex justify-end pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                                className="cursor-pointer gap-1.5 text-xs font-semibold"
                                            >
                                                <Link href={step.actionUrl}>
                                                    {step.actionLabel}
                                                    <ArrowRight className="size-3" />
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab: CSE Exam Structure */}
            {activeTab === 'structure' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Professional Section */}
                        <Card className="space-y-6 border border-border bg-card p-6">
                            <div className="space-y-1.5 border-b border-border pb-4">
                                <h3 className="flex items-center gap-2 font-heading text-xl font-extrabold text-foreground">
                                    <Award className="size-5 text-blue-600 dark:text-blue-400" />
                                    {examStructure.professional.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Qualifies eligibility for both first-level
                                    (clerical) and second-level
                                    (technical/scientific) government positions.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-900/50 dark:bg-slate-900/20">
                                    <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                                        Number of Items
                                    </span>
                                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                                        {examStructure.professional.items} items
                                    </span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-900/50 dark:bg-slate-900/20">
                                    <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                                        Time Limit
                                    </span>
                                    <span className="text-lg font-black text-slate-800 dark:text-white">
                                        {examStructure.professional.time}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                    Subjects Coverage & Scope:
                                </h4>
                                <div className="divide-y divide-border rounded-xl border border-border">
                                    {examStructure.professional.scope.map(
                                        (scope, idx) => (
                                            <div
                                                key={idx}
                                                className="space-y-1 p-3.5 transition hover:bg-slate-50/30 dark:hover:bg-slate-900/10"
                                            >
                                                <span className="block text-sm font-bold text-foreground">
                                                    {scope.name}
                                                </span>
                                                <span className="block text-xs leading-relaxed text-muted-foreground">
                                                    {scope.detail}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Subprofessional Section */}
                        <Card className="space-y-6 border border-border bg-card p-6">
                            <div className="space-y-1.5 border-b border-border pb-4">
                                <h3 className="flex items-center gap-2 font-heading text-xl font-extrabold text-foreground">
                                    <Award className="size-5 text-indigo-600 dark:text-indigo-400" />
                                    {examStructure.subprofessional.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Qualifies eligibility exclusively for
                                    first-level government positions (clerical,
                                    custodial, trade services).
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-900/50 dark:bg-slate-900/20">
                                    <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                                        Number of Items
                                    </span>
                                    <span className="text-2xl font-black text-slate-800 dark:text-white">
                                        {examStructure.subprofessional.items}{' '}
                                        items
                                    </span>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-900/50 dark:bg-slate-900/20">
                                    <span className="block text-[10px] font-bold text-muted-foreground uppercase">
                                        Time Limit
                                    </span>
                                    <span className="text-lg font-black text-slate-800 dark:text-white">
                                        {examStructure.subprofessional.time}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                                    Subjects Coverage & Scope:
                                </h4>
                                <div className="divide-y divide-border rounded-xl border border-border">
                                    {examStructure.subprofessional.scope.map(
                                        (scope, idx) => (
                                            <div
                                                key={idx}
                                                className="space-y-1 p-3.5 transition hover:bg-slate-50/30 dark:hover:bg-slate-900/10"
                                            >
                                                <span className="block text-sm font-bold text-foreground">
                                                    {scope.name}
                                                </span>
                                                <span className="block text-xs leading-relaxed text-muted-foreground">
                                                    {scope.detail}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Tab: Smart Study Tips */}
            {activeTab === 'tips' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {generalTips.map((tip, idx) => (
                            <Card
                                key={idx}
                                className={`border border-l-4 border-border bg-card p-6 ${tip.color} space-y-4`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-slate-100 p-2 dark:bg-slate-900">
                                        <tip.icon className="size-5 shrink-0" />
                                    </div>
                                    <h3 className="font-heading text-base leading-tight font-black text-foreground">
                                        {tip.title}
                                    </h3>
                                </div>
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {tip.description}
                                </p>
                            </Card>
                        ))}
                    </div>

                    <Card className="space-y-4 border border-border bg-card p-6">
                        <h3 className="flex items-center gap-2 font-heading text-lg font-black text-foreground">
                            <HelpCircle className="size-5 text-primary" />
                            Frequently Asked Reviewer Questions
                        </h3>
                        <div className="space-y-4 divide-y divide-border">
                            <div className="space-y-1.5 pt-2">
                                <span className="block text-xs font-bold text-foreground">
                                    How reliable is the AI Lesson Generator and
                                    Mock Questions?
                                </span>
                                <span className="block text-xs leading-relaxed text-muted-foreground">
                                    All dynamic lessons and test questions are
                                    fully vetted by a dual-stage filtering
                                    system in the reviewer curation pipeline.
                                    They conform strictly to the Philippine
                                    Civil Service Commission (CSC) scope
                                    guidelines.
                                </span>
                            </div>
                            <div className="space-y-1.5 pt-4">
                                <span className="block text-xs font-bold text-foreground">
                                    Can I practice with specific subcategories
                                    only?
                                </span>
                                <span className="block text-xs leading-relaxed text-muted-foreground">
                                    Yes! Under "Practice Drill", you can check
                                    and uncheck any individual category or
                                    fine-grained subcategory (such as "Filing"
                                    under Clerical Ability, or "Philippine
                                    Constitution" under General Information) to
                                    curate specialized practice sessions.
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );

    if (isLoggedIn) {
        return (
            <AppLayout
                breadcrumbs={[{ title: 'Reviewer Guide', href: '/guide' }]}
            >
                <Head>
                    <title>
                        Ultimate CSE Preparation Guide | Hiraya Review
                    </title>
                    <meta
                        name="description"
                        content="Discover the best study strategies, time-management tips, and subject coverage breakdowns for the Professional and Subprofessional Civil Service Examinations."
                    />
                    <meta
                        property="og:title"
                        content="Ultimate CSE Preparation Guide | Hiraya Review"
                    />
                    <meta
                        property="og:description"
                        content="Discover the best study strategies, time-management tips, and subject coverage breakdowns for the Professional and Subprofessional Civil Service Examinations."
                    />
                </Head>
                <div className="min-h-screen bg-slate-50/30 px-6 py-6 dark:bg-slate-950/20">
                    {content}
                </div>
            </AppLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Ultimate CSE Preparation Guide | Hiraya Review</title>
                <meta
                    name="description"
                    content="Discover the best study strategies, time-management tips, and subject coverage breakdowns for the Professional and Subprofessional Civil Service Examinations."
                />
                <meta
                    property="og:title"
                    content="Ultimate CSE Preparation Guide | Hiraya Review"
                />
                <meta
                    property="og:description"
                    content="Discover the best study strategies, time-management tips, and subject coverage breakdowns for the Professional and Subprofessional Civil Service Examinations."
                />
            </Head>
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-950/20">
                <SiteHeader activeNav="guide" />
                <main className="flex-1 px-6 py-12">{content}</main>
                <SiteFooter />
            </div>
        </>
    );
}
