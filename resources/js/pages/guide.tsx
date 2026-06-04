import { Head, usePage } from '@inertiajs/react';
import { ReviewerGuideTabs } from '@/components/reviewer-guide-tabs';
import { PageHeader } from '@/components/layout/page-header';
import SiteFooter from '@/components/layout/site-footer';
import SiteHeader from '@/components/layout/site-header';
import AppLayout from '@/layouts/app-layout';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

export default function Guide() {
    const { auth } = usePage<PageProps>().props;
    const isLoggedIn = !!auth.user;
    const content = (
        <div className="mx-auto max-w-6xl space-y-8">
            {/* Header section */}
            <div className="flex items-start gap-4 border-b border-border pb-6 md:items-center">
                <PageHeader
                    title="Civil Service Exam Reviewer Guide"
                    description="Learn how to streamline your preparation process, navigate exam structures, and maximize your passing odds."
                    className="flex-1"
                />
            </div>

            <ReviewerGuideTabs showActions={isLoggedIn} />
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
                <div className="min-h-screen bg-slate-50/30 px-6 py-6 dark:bg-slate-900/20">
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
            <div className="flex min-h-screen flex-col bg-slate-50/30 dark:bg-slate-900/20">
                <SiteHeader activeNav="guide" />
                <main className="flex-1 px-6 py-12">{content}</main>
                <SiteFooter />
            </div>
        </>
    );
}
