import { Head } from '@inertiajs/react';
import { CurationCreateShell } from '@/components/curation-create-shell';
import {
    create as adminLearnCreate,
    drafts as adminLearnDrafts,
    index as adminLearnIndex,
} from '@/routes/admin/learn';
import { LearnAIGeneratorPanel } from './components/learn-ai-generator-panel';
import { LearnManualEntryForm } from './components/learn-manual-entry-form';
import { useLearnCreateState } from './hooks/use-learn-create-state';
import type { AdminLearnCreateProps } from './types';

export default function AdminLearnCreate(props: AdminLearnCreateProps) {
    const {
        activeTab,
        setActiveTab,
        aiTopic,
        setAiTopic,
        aiPrompt,
        setAiPrompt,
        aiPrimaryModel,
        setAiPrimaryModel,
        isGenerating,
        generationError,
        successMsg,
        manualForm,
        selectedCategoryName,
        selectedSubcategoryName,
        activeSubcategories,
        handleCategoryChange,
        handleSubcategoryChange,
        triggerAIGeneration,
        handleCancelAIGeneration,
        handleManualSubmit,
    } = useLearnCreateState(props);

    const aiContent = (
        <LearnAIGeneratorPanel
            categories={props.categories}
            activeSubcategories={activeSubcategories}
            selectedCategoryName={selectedCategoryName}
            selectedSubcategoryName={selectedSubcategoryName}
            handleCategoryChange={handleCategoryChange}
            handleSubcategoryChange={handleSubcategoryChange}
            aiTopic={aiTopic}
            setAiTopic={setAiTopic}
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            aiPrimaryModel={aiPrimaryModel}
            setAiPrimaryModel={setAiPrimaryModel}
            isGenerating={isGenerating}
            generationError={generationError}
            successMsg={successMsg}
            triggerAIGeneration={triggerAIGeneration}
            handleCancelAIGeneration={handleCancelAIGeneration}
        />
    );

    const manualContent = (
        <LearnManualEntryForm
            data={manualForm.data}
            setData={manualForm.setData}
            errors={manualForm.errors}
            processing={manualForm.processing}
            reset={manualForm.reset}
            categories={props.categories}
            activeSubcategories={activeSubcategories}
            selectedCategoryName={selectedCategoryName}
            selectedSubcategoryName={selectedSubcategoryName}
            handleCategoryChange={handleCategoryChange}
            handleSubcategoryChange={handleSubcategoryChange}
            handleManualSubmit={handleManualSubmit}
        />
    );

    return (
        <>
            <Head title="Create Study Module" />
            <CurationCreateShell
                title={
                    activeTab === 'ai'
                        ? 'AI Lesson Generator'
                        : 'Manual Lesson Editor'
                }
                description={
                    activeTab === 'ai'
                        ? 'Specify syllabus topics and let Gemini write a comprehensive, premium-formatted review tutorial.'
                        : 'Draft detailed review content manually, customize estimated time reading, and index categories.'
                }
                backUrl={
                    successMsg ? adminLearnDrafts().url : adminLearnIndex().url
                }
                backLabel={
                    successMsg
                        ? 'Back to Drafts Review'
                        : 'Back to Curator Dashboard'
                }
                activeTab={activeTab}
                onTabChange={setActiveTab}
                aiContent={aiContent}
                manualContent={manualContent}
            />
        </>
    );
}

AdminLearnCreate.layout = {
    breadcrumbs: [
        {
            title: 'Module Management',
            href: adminLearnIndex().url,
        },
        {
            title: 'Create Module',
            href: adminLearnCreate().url,
        },
    ],
};
