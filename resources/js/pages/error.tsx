import { Head, Link, usePage } from '@inertiajs/react';
import {
    Home,
    ArrowLeft,
    AlertCircle,
    ShieldAlert,
    WifiOff,
    FileQuestion,
} from 'lucide-react';
import React from 'react';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import AppLayout from '@/layouts/app-layout';

interface ErrorPageProps {
    status: number;
}

export default function ErrorPage({ status }: ErrorPageProps) {
    const { auth } = usePage<any>().props;

    const title =
        {
            503: '503: Service Unavailable',
            500: '500: Server Error',
            404: '404: Page Not Found',
            403: '403: Forbidden',
        }[status] || 'Error';

    const description =
        {
            503: 'Sorry, Hiraya Review is undergoing maintenance. Please check back soon.',
            500: 'Whoops, something went wrong on the server.',
            404: 'Sorry, the page you are looking for could not be found.',
            403: 'Sorry, you are forbidden from accessing this page.',
        }[status] || 'An unexpected error has occurred.';

    const icon = {
        503: (
            <WifiOff className="mx-auto size-24 text-slate-400 dark:text-slate-600" />
        ),
        500: (
            <AlertCircle className="mx-auto size-24 text-red-500/80 dark:text-red-500/50" />
        ),
        404: (
            <FileQuestion className="mx-auto size-24 text-blue-500/80 dark:text-blue-500/50" />
        ),
        403: (
            <ShieldAlert className="mx-auto size-24 text-orange-500/80 dark:text-orange-500/50" />
        ),
    }[status] || <AlertCircle className="mx-auto size-24 text-slate-400" />;

    const content = (
        <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-2xl text-center">
                <div className="mb-8">{icon}</div>

                <h1 className="font-heading text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                    {title}
                </h1>

                <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
                    {description}
                </p>

                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-transparent px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/50"
                    >
                        <ArrowLeft className="size-4" />
                        Go Back
                    </button>

                    {auth?.user && (
                        <Link
                            href="/dashboard"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
                        >
                            <Home className="size-4" />
                            Back to Home
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );

    if (auth?.user) {
        return (
            <AppLayout>
                <Head title={title} />
                {content}
            </AppLayout>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0a0a0a]">
            <SiteHeader />
            <Head title={title} />
            <main className="flex-1">{content}</main>
            <SiteFooter />
        </div>
    );
}

// Do not apply the authenticated layout for 404s/errors if they occur outside auth
// But you can customize this if you want it to always be wrapped in the shell
ErrorPage.layout = undefined;
