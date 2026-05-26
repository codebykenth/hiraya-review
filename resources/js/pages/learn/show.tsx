import { Head, Link } from '@inertiajs/react';
import { BookMarked, Calendar, ChevronLeft, Clock, Lightbulb } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { LessonMarkdown } from '@/components/lesson-markdown';

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
                const windScroll = document.documentElement.scrollTop || document.body.scrollTop;
                const height = (document.documentElement.scrollHeight || document.documentElement.clientHeight) - document.documentElement.clientHeight;
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

            <div ref={progressRef} className="fixed left-0 top-0 z-50 h-1 w-full origin-left scale-x-0 bg-blue-600 transition-transform duration-100" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto rounded-xl bg-slate-50/60 p-4 dark:bg-slate-900/20 md:p-6">
                <Link
                    href="/learn"
                    className="flex w-fit items-center gap-1 text-sm font-black text-slate-800 transition hover:text-blue-600 focus:outline-none dark:text-white dark:hover:text-blue-400"
                >
                    <ChevronLeft className="size-4" />
                    Back to Study Hub
                </Link>

                <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                    <div className="min-w-0">
                        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-9">
                            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-5 dark:border-slate-900">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                                    {module.category}
                                </span>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                    {module.subcategory}
                                </span>
                                <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                                    <Clock className="size-4" />
                                    {module.estimated_minutes} min read
                                </span>
                            </div>

                            <h1 className="mt-6 font-heading text-3xl font-black leading-tight text-slate-950 dark:text-white md:text-4xl">
                                {module.title}
                            </h1>

                            <p className="mt-4 border-l-4 border-blue-600 pl-5 text-base font-semibold italic leading-8 text-slate-600 dark:text-slate-300">
                                {module.summary}
                            </p>

                            <div className="mt-6 flex items-center gap-4 text-xs font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="size-4" />
                                    <span>Updated {module.updated_at}</span>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-slate-100 pt-7 text-slate-800 dark:border-slate-900 dark:text-slate-200">
                                <LessonMarkdown content={module.content} />
                            </div>
                        </article>
                    </div>

                    <aside className="flex min-w-0 flex-col gap-6">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-950">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-900">
                                <BookMarked className="size-4 text-blue-600" />
                                <span className="text-sm font-black uppercase text-slate-850 dark:text-white">Syllabus Overview</span>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs uppercase tracking-wide">Category</span>
                                    <span className="text-slate-800 dark:text-white">{module.category}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs uppercase tracking-wide">Subcategory</span>
                                    <span className="text-slate-800 dark:text-white">{module.subcategory}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs uppercase tracking-wide">Focus Topic</span>
                                    <span className="text-slate-800 dark:text-white">{module.topic}</span>
                                </div>
                            </div>

                            <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
                                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    <Lightbulb className="size-4 text-amber-500" />
                                    Learning Goal
                                </span>
                                <span className="mt-2 block text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">
                                    Read the lesson, answer the Check Your Understanding questions, then continue with Custom Practice Drills for this subcategory.
                                </span>
                            </div>
                        </div>

                        {recommended.length > 0 && (
                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-950">
                                <span className="mb-4 block border-b border-slate-100 pb-3 text-sm font-black uppercase text-slate-850 dark:border-slate-900 dark:text-white">
                                    Related Modules
                                </span>
                                <div className="flex flex-col gap-3.5">
                                    {recommended.map((rec, ri) => (
                                        <Link
                                            key={ri}
                                            href={`/learn/${rec.slug}`}
                                            className="group block border-b border-slate-50 pb-3 last:border-0 last:pb-0 dark:border-slate-900"
                                        >
                                            <h4 className="line-clamp-2 text-sm font-black text-slate-750 transition group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400">
                                                {rec.title}
                                            </h4>
                                            <span className="mt-1 flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
                                                <Clock className="size-3.5" />
                                                {rec.estimated_minutes} min read
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
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
