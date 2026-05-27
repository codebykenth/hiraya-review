import { Head, Link } from '@inertiajs/react';
import {
    BookMarked,
    Calendar,
    ChevronLeft,
    Clock,
    Lightbulb,
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import { getCategoryStyles } from '@/components/curation-index-shell';
import { LessonMarkdown } from '@/components/lesson-markdown';
import { PageContainer } from '@/components/page-container';
import { Card } from '@/components/ui/card';

interface LearnShowProps {
    module: {
        id: number;
        title: string;
        slug: string;
        topic: string;
        summary: string;
        content: string;
        estimated_minutes: number;
        is_published: boolean;
        category: string;
        subcategory: string;
        creator_name: string;
        updated_at: string;
    };
    recommended: {
        title: string;
        slug: string;
        estimated_minutes: number;
    }[];
}

export default function LearnShow({ module, recommended }: LearnShowProps) {
    const progressRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let frameId = 0;

        const handleScroll = () => {
            if (frameId) {
                return;
            }

            frameId = window.requestAnimationFrame(() => {
                const windScroll =
                    document.documentElement.scrollTop ||
                    document.body.scrollTop;
                const height =
                    (document.documentElement.scrollHeight ||
                        document.documentElement.clientHeight) -
                    document.documentElement.clientHeight;
                const scrolled = height > 0 ? (windScroll / height) * 100 : 0;

                if (progressRef.current) {
                    progressRef.current.style.transform = `scaleX(${Math.min(scrolled, 100) / 100})`;
                }

                frameId = 0;
            });
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);

            if (frameId) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, []);

    return (
        <>
            <Head title={module.title} />

            <div
                ref={progressRef}
                className="fixed top-0 left-0 z-50 h-1 w-full origin-left scale-x-0 bg-blue-600 transition-transform duration-100"
            />

            <PageContainer className="bg-slate-50/30 p-4 md:p-6 dark:bg-slate-900/20">
                <Link
                    href="/learn"
                    className="flex w-fit items-center gap-1 text-sm font-black text-foreground transition hover:text-blue-600 focus:outline-none dark:hover:text-blue-400"
                >
                    <ChevronLeft className="size-4" />
                    Back to Study Hub
                </Link>

                <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                    <div className="min-w-0">
                        <article className="animate-fade-in rounded-xl border border-border bg-card p-5 shadow-sm md:p-9">
                            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-5">
                                <span
                                    className={`rounded-full border px-3 py-0.5 text-xs font-extrabold uppercase ${getCategoryStyles(module.category)}`}
                                >
                                    {module.category}
                                </span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted-foreground dark:bg-slate-900">
                                    {module.subcategory}
                                </span>
                                <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                    <Clock className="size-4" />
                                    {module.estimated_minutes} min read
                                </span>
                            </div>

                            <h1 className="mt-6 font-heading text-3xl leading-tight font-black text-foreground md:text-4xl">
                                {module.title}
                            </h1>

                            <p className="mt-4 border-l-4 border-blue-600 pl-5 text-base leading-8 font-semibold text-muted-foreground italic">
                                {module.summary}
                            </p>

                            <div className="mt-6 flex items-center gap-4 text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-4" />
                                    <span>Updated {module.updated_at}</span>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-border pt-7 text-foreground">
                                <LessonMarkdown content={module.content} />
                            </div>
                        </article>
                    </div>

                    <aside className="flex min-w-0 flex-col gap-6">
                        <Card className="p-5 shadow-xs">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <BookMarked className="size-4 text-blue-600" />
                                <span className="text-sm font-black text-foreground uppercase">
                                    Syllabus Overview
                                </span>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 text-sm font-bold text-muted-foreground">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs tracking-wide uppercase">
                                        Category
                                    </span>
                                    <span className="text-foreground">
                                        {module.category}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs tracking-wide uppercase">
                                        Subcategory
                                    </span>
                                    <span className="text-foreground">
                                        {module.subcategory}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs tracking-wide uppercase">
                                        Focus Topic
                                    </span>
                                    <span className="text-foreground">
                                        {module.topic}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
                                <span className="flex items-center gap-2 text-xs font-black tracking-wide text-muted-foreground uppercase">
                                    <Lightbulb className="size-4 text-amber-500" />
                                    Learning Goal
                                </span>
                                <span className="mt-2 block text-sm leading-7 font-semibold text-muted-foreground">
                                    Read the lesson, answer the Check Your
                                    Understanding questions, then continue with
                                    Custom Practice Drills for this subcategory.
                                </span>
                            </div>
                        </Card>

                        {recommended.length > 0 && (
                            <Card className="p-5 shadow-xs">
                                <span className="mb-4 block border-b border-border pb-3 text-sm font-black text-foreground uppercase">
                                    Related Modules
                                </span>
                                <div className="flex flex-col gap-3.5">
                                    {recommended.map((rec, ri) => (
                                        <Link
                                            key={ri}
                                            href={`/learn/${rec.slug}`}
                                            className="group block border-b border-border/40 pb-3 last:border-0 last:pb-0"
                                        >
                                            <h4 className="line-clamp-2 text-sm font-black text-foreground transition group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {rec.title}
                                            </h4>
                                            <span className="mt-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase">
                                                <Clock className="size-3.5" />
                                                {rec.estimated_minutes} min read
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </aside>
                </div>
            </PageContainer>
        </>
    );
}

LearnShow.layout = {
    breadcrumbs: [
        {
            title: 'Learn',
            href: '/learn',
        },
        {
            title: 'Study Tutorial',
            href: '',
        },
    ],
};
