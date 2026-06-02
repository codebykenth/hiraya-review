import { useForm } from '@inertiajs/react';
import type React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import {
    store as questionsStore,
    generate as questionsGenerate,
} from '@/routes/questions';
import type { CreateProps } from '../types';

export function useQuestionCreateState({
    type = 'ai',
    categories = [],
}: CreateProps) {
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(
        type === 'manual' ? 'manual' : 'ai',
    );

    const cseCategoriesTree = useMemo(() => {
        const tree: Record<string, string[]> = {};

        if (categories && categories.length > 0) {
            categories.forEach((cat) => {
                tree[cat.name] = (cat.subcategory || []).map((sub) => sub.name);
            });
        } else {
            tree['General Information'] = [
                'Philippine Constitution',
                'Code of Conduct and Ethical Standards (R.A. 6713)',
                'Peace and Human Rights Issues and Concepts',
                'Environment Management and Protection',
            ];
            tree['Verbal Ability'] = [
                'Word meaning',
                'Sentence completion',
                'Error recognition',
                'Sentence structure',
                'Paragraph organization',
                'Reading comprehension',
            ];
            tree['Analytical Ability'] = [
                'Word analogy',
                'Symbolic logic / abstract reasoning',
                'Identifying assumptions and drawing conclusions',
                'Data interpretation',
            ];
            tree['Numerical Ability'] = [
                'Basic operations',
                'Number sequence',
                'Word problems',
            ];
            tree['Clerical Ability'] = ['Filing', 'Spelling'];
        }

        return tree;
    }, [categories]);

    const defaultCategory =
        Object.keys(cseCategoriesTree)[0] || 'Analytical Ability';
    const defaultSubcategory =
        cseCategoriesTree[defaultCategory]?.[0] || 'Word analogy';

    // AI Generator State
    const [aiCategory, setAiCategory] = useState<string>(defaultCategory);
    const [aiSubcategory, setAiSubcategory] =
        useState<string>(defaultSubcategory);
    const [aiCount, setAiCount] = useState<number>(3);
    const [aiLanguage, setAiLanguage] = useState<string>('English');
    const [aiPrimaryModel, setAiPrimaryModel] = useState<string>(
        'llama-3.3-70b-versatile',
    );
    const [aiPrompt, setAiPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const generateAbortRef = useRef<AbortController | null>(null);

    // Sync subcategories for AI view
    useEffect(() => {
        const validSubs = cseCategoriesTree[aiCategory] || [];

        // Only reset if the current subcategory does not belong to the selected category
        if (aiSubcategory && !validSubs.includes(aiSubcategory)) {
            const timer = setTimeout(() => {
                setAiSubcategory(validSubs[0] || '');
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [aiCategory, cseCategoriesTree, aiSubcategory]);

    const manualForm = useForm({
        stem: '',
        category: defaultCategory,
        subcategory: defaultSubcategory,
        language: 'English',
        options: ['', '', '', '', ''],
        correct_option: 0,
        explanation: '',
        status: 'active' as 'active' | 'draft',
    });

    const { data, setData, post, reset, transform } = manualForm;

    // Sync subcategories for Manual view
    useEffect(() => {
        const validSubs = cseCategoriesTree[data.category] || [];

        // Only reset if the current subcategory does not belong to the selected category
        if (data.subcategory && !validSubs.includes(data.subcategory)) {
            const timer = setTimeout(() => {
                setData('subcategory', validSubs[0] || '');
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [data.category, cseCategoriesTree, data.subcategory, setData]);

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...data.options];
        newOptions[idx] = val;
        setData('options', newOptions);
    };

    const isDemographic = useMemo(() => {
        const cat = categories.find((c) => c.name === data.category);

        return cat?.is_demographic || data.category === 'Demographic Profile';
    }, [data.category, categories]);

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.stem.trim()) {
            return;
        }

        if (!isDemographic && data.options.some((opt) => !opt.trim())) {
            return;
        }

        if (
            isDemographic &&
            data.options.filter((opt) => opt.trim()).length < 2
        ) {
            return;
        }

        post(questionsStore().url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    transform((data) => ({
        ...data,
        options: isDemographic
            ? data.options.filter((opt) => opt.trim() !== '')
            : data.options,
    }));

    const handleGenerateAI = async () => {
        generateAbortRef.current?.abort();
        const abortController = new AbortController();
        generateAbortRef.current = abortController;

        setIsGenerating(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content') || '';
            const response = await fetch(questionsGenerate().url, {
                method: 'POST',
                signal: abortController.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    category: aiCategory,
                    subcategory: aiSubcategory,
                    count: aiCount,
                    language: aiLanguage,
                    prompt: aiPrompt,
                    primary_model: aiPrimaryModel,
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(
                    resData.error ||
                        'Failed to generate questions. Please try again.',
                );
            }

            localStorage.setItem('waiting_for_ai', 'true');
            window.dispatchEvent(new Event('ai_generation_started'));
        } catch (err: any) {
            setIsGenerating(false);

            if (err?.name === 'AbortError') {
                setErrorMsg('Generation canceled.');
            } else {
                setErrorMsg(
                    err.message ||
                        'An error occurred while generating questions.',
                );
            }
        }
    };

    const handleCancelAIGeneration = () => {
        generateAbortRef.current?.abort();
        generateAbortRef.current = null;
        setIsGenerating(false);
        setErrorMsg('Generation canceled.');
    };

    useEffect(() => {
        const handleAiComplete = () => {
            setIsGenerating(false);
            setSuccessMsg(
                'Questions generated successfully! They are saved as drafts and ready for review.',
            );
        };

        const handleAiFailed = () => {
            setIsGenerating(false);
        };

        window.addEventListener('ai_generation_completed', handleAiComplete);
        window.addEventListener('ai_generation_failed', handleAiFailed);

        return () => {
            generateAbortRef.current?.abort();
            window.removeEventListener(
                'ai_generation_completed',
                handleAiComplete,
            );
            window.removeEventListener('ai_generation_failed', handleAiFailed);
        };
    }, []);

    return {
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
    };
}
