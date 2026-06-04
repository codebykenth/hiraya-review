import { Head } from '@inertiajs/react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { index as drillsIndex } from '@/routes/drills';
import { ConfigView } from './components/config-view';
import { HubView } from './components/hub-view';
import { useDrillsState } from './hooks/use-drills-state';
import type { DrillsProps } from './types';

export default function Drills(props: DrillsProps) {
    const { questions = [], categories = [] } = props;

    const {
        viewState,
        setViewState,
        selectedCategory,
        selectedSubcats,
        questionCount,
        setQuestionCount,
        language,
        setLanguage,
        isTimed,
        setIsTimed,
        isRetakeConfig,
        setIsRetakeConfig,
        filteredQCount,
        hasFilipinoQuestions,
        handleCategoryClick,
        toggleSubcat,
        startDrill,
    } = useDrillsState(props);

    return (
        <>
            <Head title="Practice Drills" />
            <PageContainer className="bg-slate-50/30 dark:bg-slate-900/20">
                {viewState === 'hub' && (
                    <HubView
                        categories={categories}
                        questions={questions}
                        handleCategoryClick={handleCategoryClick}
                    />
                )}
                {viewState === 'config' && selectedCategory && (
                    <ConfigView
                        selectedCategory={selectedCategory}
                        selectedSubcats={selectedSubcats}
                        questionCount={questionCount}
                        language={language}
                        isTimed={isTimed}
                        isRetakeConfig={isRetakeConfig}
                        filteredQCount={filteredQCount}
                        hasFilipinoQuestions={hasFilipinoQuestions}
                        setViewState={setViewState}
                        setIsRetakeConfig={setIsRetakeConfig}
                        toggleSubcat={toggleSubcat}
                        setQuestionCount={setQuestionCount}
                        setLanguage={setLanguage}
                        setIsTimed={setIsTimed}
                        startDrill={startDrill}
                    />
                )}
            </PageContainer>
        </>
    );
}

Drills.layout = {
    breadcrumbs: [
        {
            title: 'Practice Drills',
            href: drillsIndex().url,
        },
    ],
};
