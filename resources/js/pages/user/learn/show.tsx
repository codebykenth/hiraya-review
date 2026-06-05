import { Head, Link, usePage, router } from '@inertiajs/react';
import Echo from 'laravel-echo';
import {
    BookMarked,
    Calendar,
    ChevronLeft,
    Clock,
    Lightbulb,
    CheckCircle2,
} from 'lucide-react';
import Pusher from 'pusher-js';
import React from 'react';
import { toast } from 'sonner';
import { getCategoryStyles } from '@/components/domain/curation-index-shell';
import { LessonMarkdown } from '@/components/domain/lesson-markdown';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useScrollProgress } from './hooks/use-scroll-progress';
import type { LearnShowProps } from './types';

export default function LearnShow({ module, recommended }: LearnShowProps) {
    const progressRef = useScrollProgress();
    const { auth, pusher } = usePage<{ auth: { user: any }; pusher?: any }>()
        .props;
    const isLoggedIn = !!auth.user;

    React.useEffect(() => {
        if (!pusher?.key) {
            return;
        }

        (window as any).Pusher = Pusher;
        const echo = new Echo({
            broadcaster: 'pusher',
            key: pusher.key,
            cluster: pusher.cluster ?? 'ap1',
            wsHost: pusher.host
                ? pusher.host
                : `ws-${pusher.cluster}.pusher.com`,
            wsPort: pusher.port ?? 80,
            wssPort: pusher.port ?? 443,
            forceTLS: (pusher.scheme ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        echo.channel('learn-modules').listen(
            'LearnModulePublished',
            (e: any) => {
                toast.success(`New study module available: ${e.module.title}`, {
                    duration: 10000,
                    action: {
                        label: 'Go to module',
                        onClick: () => {
                            router.visit(`/learn/${e.module.slug}`);
                        },
                    },
                });
            },
        );

        return () => {
            echo.disconnect();
        };
    }, [pusher]);

    return (
        <>
            <Head>
                <title>{`${module.title} | Hiraya Review`}</title>
                <meta name="description" content={module.summary} />
                <meta
                    property="og:title"
                    content={`${module.title} | Hiraya Review`}
                />
                <meta property="og:description" content={module.summary} />
                <meta property="og:type" content="article" />
            </Head>

            <div
                ref={progressRef}
                className="fixed top-0 left-0 z-50 h-1 w-full origin-left scale-x-0 bg-blue-600 transition-transform duration-100"
            />

            <PageContainer className="bg-slate-50/30 p-4 md:p-6 dark:bg-slate-900/20">
                <Link
                    href="/learn"
                    className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 flex w-fit items-center gap-1 text-sm font-black text-foreground transition hover:text-blue-600 focus:outline-none dark:text-blue-400 dark:hover:text-blue-400"
                >
                    <ChevronLeft className="size-4" />
                    Back to Study Hub
                </Link>

                <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                    <div className="min-w-0">
                        <article className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 animate-fade-in rounded-xl border border-border bg-card p-5 shadow-sm md:p-9">
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

                            {module.is_completed && (
                                <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-green-200/40 bg-green-50/50 px-4 py-3 text-sm font-semibold text-green-800 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400">
                                    <CheckCircle2 className="size-5 shrink-0 fill-green-600/10 text-green-600 dark:text-green-400" />
                                    <span>
                                        Lesson Completed â€” Well done! Keep
                                        going with your study schedule.
                                    </span>
                                </div>
                            )}

                            <p className="mt-4 border-l-4 border-blue-600 pl-5 text-base leading-8 font-semibold text-muted-foreground italic">
                                {module.summary}
                            </p>

                            <div className="mt-6 flex items-center gap-4 text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-4" />
                                    <span>Updated {module.updated_at}</span>
                                </div>
                            </div>

                            <div className="relative mt-8 border-t border-border pt-7 text-foreground">
                                {isLoggedIn ? (
                                    <>
                                        <LessonMarkdown
                                            content={module.content}
                                        />
                                        <div className="mt-8 flex justify-end border-t border-border pt-6">
                                            <Button
                                                onClick={() =>
                                                    router.post(
                                                        `/learn/${module.slug}/complete`,
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                                variant={
                                                    module.is_completed
                                                        ? 'outline'
                                                        : 'success'
                                                }
                                                className="flex items-center gap-2 font-bold"
                                            >
                                                <CheckCircle2
                                                    className={`size-4 ${module.is_completed ? 'fill-green-600/10 text-green-600 dark:text-green-400' : ''}`}
                                                />
                                                {module.is_completed
                                                    ? 'Completed'
                                                    : 'Mark as Complete'}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="pointer-events-none relative max-h-[320px] overflow-hidden select-none">
                                        <LessonMarkdown
                                            content={module.content}
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80" />
                                    </div>
                                )}

                                {!isLoggedIn && (
                                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center justify-center bg-gradient-to-t from-white/95 via-white/90 to-transparent p-6 pt-32 text-center dark:from-slate-950/95 dark:via-slate-950/90">
                                        <div className="max-w-2xl rounded-2xl border border-primary/20 bg-background/80 p-8 shadow-xl backdrop-blur-md">
                                            <h3 className="font-heading text-xl font-black text-foreground">
                                                Unlock Full Lesson for Free
                                            </h3>
                                            <p className="mt-3 text-base leading-relaxed font-semibold text-muted-foreground">
                                                Create a free account to read
                                                this full lesson, unlock
                                                realistic mock exams, and build
                                                your smart study schedule.
                                            </p>
                                            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                                <Button
                                                    asChild
                                                    className="font-bold"
                                                >
                                                    <Link href="/register">
                                                        Create Free Account
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                    className="font-bold"
                                                >
                                                    <Link href="/login">
                                                        Log In
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </article>
                    </div>

                    <aside className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 flex min-w-0 flex-col gap-6">
                        <Card className="p-5 shadow-xs">
                            <div className="flex items-center gap-2 border-b border-border pb-3">
                                <BookMarked className="size-4 text-blue-600 dark:text-blue-400" />
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
                                            className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 group block border-b border-border/40 pb-3 last:border-0 last:pb-0"
                                        >
                                            <h4 className="line-clamp-2 text-sm font-black text-foreground transition group-hover:text-blue-600 dark:text-blue-400 dark:group-hover:text-blue-400">
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
