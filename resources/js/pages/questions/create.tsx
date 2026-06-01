import { Head } from '@inertiajs/react';
import React from 'react';
import { CurationCreateShell } from '@/components/curation-create-shell';
import { index as questionsIndex } from '@/routes/questions';
import { AIGeneratorPanel } from './components/ai-generator-panel';
import { ManualEntryForm } from './components/manual-entry-form';
import { useQuestionCreateState } from './hooks/use-question-create-state';
import type { CreateProps } from './types';

export default function CreateQuestion(props: CreateProps) {
    const {
        activeTab,
        setActiveTab,
        cseCategoriesTree,
        aiCategory,
        setAiCategory,
        aiSubcategory,
        setAiSubcategory,
        aiCount,
        setAiCount,
        aiLanguage,
        setAiLanguage,
        aiPrimaryModel,
        setAiPrimaryModel,
        aiPrompt,
        setAiPrompt,
        isGenerating,
        errorMsg,
        successMsg,
        manualForm,
        isDemographic,
        handleOptionChange,
        handleManualSubmit,
        handleGenerateAI,
        handleCancelAIGeneration,
    } = useQuestionCreateState(props);

    const aiContent = (
        <AIGeneratorPanel
            aiCategory={aiCategory}
            setAiCategory={setAiCategory}
            aiSubcategory={aiSubcategory}
            setAiSubcategory={setAiSubcategory}
            aiCount={aiCount}
            setAiCount={setAiCount}
            aiLanguage={aiLanguage}
            setAiLanguage={setAiLanguage}
            aiPrimaryModel={aiPrimaryModel}
            setAiPrimaryModel={setAiPrimaryModel}
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            isGenerating={isGenerating}
            errorMsg={errorMsg}
            successMsg={successMsg}
            cseCategoriesTree={cseCategoriesTree}
            handleGenerateAI={handleGenerateAI}
            handleCancelAIGeneration={handleCancelAIGeneration}
        />
    );

    const manualContent = (
        <ManualEntryForm
            data={manualForm.data}
            setData={manualForm.setData}
            errors={manualForm.errors}
            processing={manualForm.processing}
            reset={manualForm.reset}
            handleOptionChange={handleOptionChange}
            isDemographic={isDemographic}
            handleManualSubmit={handleManualSubmit}
            cseCategoriesTree={cseCategoriesTree}
        />
    );

    return (
        <>
            <Head title="Create Question" />
            <CurationCreateShell
                title={
                    activeTab === 'ai'
                        ? 'AI Question Generator'
                        : 'Manual Question Entry'
                }
                description={
                    activeTab === 'ai'
                        ? 'Configure parameters to generate new exam questions.'
                        : 'Create high-quality exam items with structured metadata and clear rationales.'
                }
                backUrl={questionsIndex().url}
                backLabel="Back to Question Management"
                activeTab={activeTab}
                onTabChange={setActiveTab}
                aiContent={aiContent}
                manualContent={manualContent}
            />
        </>
    );
}

CreateQuestion.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex().url,
        },
        {
            title: 'Create Question',
        },
    ],
};
