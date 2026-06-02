import { Head } from '@inertiajs/react';
import React from 'react';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { ModulesGrid } from './components/modules-grid';
import { SearchFilterRow } from './components/search-filter-row';
import { useLearnState } from './hooks/use-learn-state';
import type { LearnIndexProps } from './types';

export default function LearnIndex(props: LearnIndexProps) {
    const { categories = [] } = props;

    const {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        filteredModules,
        groupedModules,
    } = useLearnState(props);

    return (
        <>
            <Head>
                <title>
                    Civil Service Study Hub & Syllabus Guides | Hiraya Review
                </title>
                <meta
                    name="description"
                    content="Access free, high-yield study modules and review guides covering Numerical, Verbal, Analytical, and Clerical topics for the Civil Service Exam."
                />
                <meta
                    property="og:title"
                    content="Civil Service Study Hub & Syllabus Guides | Hiraya Review"
                />
                <meta
                    property="og:description"
                    content="Access free, high-yield study modules and review guides covering Numerical, Verbal, Analytical, and Clerical topics for the Civil Service Exam."
                />
            </Head>
            <PageContainer>
                {/* Header Banner */}
                <PageHeader
                    title="Study Hub"
                    description="Dive deep into core subjects, learn mental shortcuts, and master exam theories with our dedicated curated study guides."
                />

                {/* Search and Category Filter Row */}
                <SearchFilterRow
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                />

                {/* Modules Grid */}
                <ModulesGrid
                    filteredModules={filteredModules}
                    groupedModules={groupedModules}
                    categories={categories}
                    searchQuery={searchQuery}
                />
            </PageContainer>
        </>
    );
}

// Register layout configuration
LearnIndex.layout = {
    breadcrumbs: [
        {
            title: 'Learn',
            href: '/learn',
        },
    ],
};
