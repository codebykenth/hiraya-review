import { Head, router } from '@inertiajs/react';
import { Target, SlidersHorizontal, Bookmark, Zap } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { index as drillsIndex } from '@/routes/drills';
import { ConfigView } from './components/config-view';
import { CustomBuilderView } from './components/custom-builder-view';
import { HubView } from './components/hub-view';
import { SavedSetsView } from './components/saved-sets-view';
import { useDrillsState } from './hooks/use-drills-state';
import type { DrillsProps, Question } from './types';

export default function Drills(props: DrillsProps) {
    const {
        questions = [],
        categories = [],
        savedDrillSets = [],
        wrongQuestionIds = [],
        seenQuestionIds = [],
    } = props;

    const [activeTab, setActiveTab] = useState<'categories' | 'custom' | 'saved'>('categories');

    // Parse ?tab= URL param if provided (e.g. from dashboard or deep links)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const tabParam = params.get('tab');
            if (tabParam === 'custom' || tabParam === 'saved' || tabParam === 'categories') {
                setActiveTab(tabParam);
            }
        }
    }, []);

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

    // Launch a custom multi-topic or filtered drill
    const handleLaunchCustomDrill = (
        customQuestions: Question[],
        timed: boolean,
        sessionTitle: string,
    ) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('active_exam_session');
        }

        const queryParams = new URLSearchParams({
            drill: 'true',
            category_name: sessionTitle,
            question_count: String(customQuestions.length),
            timed: String(timed),
            custom_question_ids: JSON.stringify(customQuestions.map((q) => q.id)),
        });

        router.visit(`/exams?${queryParams.toString()}`);
    };

    // Launch a saved drill set practice session
    const handleLaunchSavedSetDrill = async (setId: number) => {
        try {
            const res = await fetch(`/drills/saved-sets/${setId}/questions`, {
                headers: { Accept: 'application/json' },
            });
            const data = await res.json();
            const setQuestions = data.questions || [];

            if (setQuestions.length === 0) return;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('active_exam_session');
            }

            const queryParams = new URLSearchParams({
                drill: 'true',
                category_name: data.set?.name || 'Saved Practice Set',
                question_count: String(setQuestions.length),
                timed: 'false',
                custom_question_ids: JSON.stringify(setQuestions.map((q: Question) => q.id)),
            });

            router.visit(`/exams?${queryParams.toString()}`);
        } catch {
            // handle error
        }
    };

    return (
        <>
            <Head title="Practice Drills" />
            <PageContainer className="bg-slate-50/30 dark:bg-slate-900/20">
                {/* Hub Navigation Tabs (Visible when not in category config screen) */}
                {viewState === 'hub' && (
                    <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border/80 pb-3">
                        <button
                            type="button"
                            onClick={() => setActiveTab('categories')}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                activeTab === 'categories'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Target className="size-4" />
                            <span>Category Drills</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('custom')}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                activeTab === 'custom'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <SlidersHorizontal className="size-4" />
                            <span>Custom Builder</span>
                            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-black text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                                New
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('saved')}
                            className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                activeTab === 'saved'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                        >
                            <Bookmark className="size-4" />
                            <span>Saved Sets</span>
                            {savedDrillSets.length > 0 && (
                                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    {savedDrillSets.length}
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {/* Tab Content */}
                {viewState === 'hub' && activeTab === 'categories' && (
                    <HubView
                        categories={categories}
                        questions={questions}
                        handleCategoryClick={handleCategoryClick}
                    />
                )}

                {viewState === 'hub' && activeTab === 'custom' && (
                    <CustomBuilderView
                        categories={categories}
                        questions={questions}
                        wrongQuestionIds={wrongQuestionIds}
                        seenQuestionIds={seenQuestionIds}
                        onLaunchCustomDrill={handleLaunchCustomDrill}
                    />
                )}

                {viewState === 'hub' && activeTab === 'saved' && (
                    <SavedSetsView
                        savedDrillSets={savedDrillSets}
                        allQuestions={questions}
                        categories={categories}
                        onLaunchSavedSetDrill={handleLaunchSavedSetDrill}
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
