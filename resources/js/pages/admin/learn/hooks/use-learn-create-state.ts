import { useForm } from '@inertiajs/react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
    generate as adminLearnGenerate,
    store as adminLearnStore,
} from '@/routes/admin/learn';
import type { AdminLearnCreateProps } from '../types';
import { useLearnCategorySelection } from './use-learn-category-selection';

const getFallbackTopic = (category: string, subcategory: string): string => {
    const cat = category.toLowerCase().trim();
    const sub = subcategory.toLowerCase().trim();

    if (
        cat.includes('numerical') ||
        sub.includes('basic operations') ||
        sub.includes('sequence') ||
        sub.includes('problems')
    ) {
        if (sub.includes('sequence')) {
            return 'Number Series and Pattern Recognition';
        }

        if (sub.includes('problems')) {
            return 'Algebraic Word Problems, Rate, and Work Computations';
        }

        return 'Order of Operations (PEMDAS) and Fraction Arithmetic';
    }

    if (
        cat.includes('verbal') ||
        sub.includes('word meaning') ||
        sub.includes('completion') ||
        sub.includes('recognition')
    ) {
        if (sub.includes('error')) {
            return 'Subject-Verb Agreement and Grammar Error Recognition';
        }

        if (sub.includes('structure')) {
            return 'Sentence Structure and Correct Modifiers';
        }

        return 'Contextual Synonyms and High-frequency Vocabulary Words';
    }

    if (
        cat.includes('analytical') ||
        sub.includes('analogy') ||
        sub.includes('logic') ||
        sub.includes('conclusions')
    ) {
        if (sub.includes('analogy')) {
            return 'Single and Double Word Analogy Relationships';
        }

        if (sub.includes('logic') || sub.includes('reasoning')) {
            return 'Propositional Logic, Venn Diagrams, and Abstract Reasoning';
        }

        return 'Drawing Valid Conclusions and Identifying Logical Assumptions';
    }

    if (
        cat.includes('clerical') ||
        sub.includes('filing') ||
        sub.includes('spelling')
    ) {
        if (sub.includes('filing')) {
            return 'Alphabetical Filing and Indexing Rules';
        }

        return 'Commonly Confused Words and Civil Service Spelling Rules';
    }

    if (
        cat.includes('general') ||
        sub.includes('constitution') ||
        sub.includes('conduct') ||
        sub.includes('peace')
    ) {
        if (sub.includes('constitution')) {
            return 'The Philippine Constitution: Article III Bill of Rights';
        }

        if (sub.includes('conduct') || sub.includes('6713')) {
            return 'Republic Act 6713: Code of Conduct and Ethical Standards for Public Officials';
        }

        return 'Environmental Protection and Human Rights Issues';
    }

    return 'Civil Service Exam Core Review Syllabus Lesson';
};

export function useLearnCreateState({
    categories,
    initialTopic = '',
}: AdminLearnCreateProps) {
    const queryParams =
        typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : null;
    const initialTab = queryParams?.get('type') === 'manual' ? 'manual' : 'ai';
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(initialTab);
    const [aiTopic, setAiTopic] = useState(initialTopic);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiPrimaryModel, setAiPrimaryModel] = useState('gemini-3.5-flash');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const generateAbortRef = useRef<AbortController | null>(null);

    const manualForm = useForm({
        category_id: categories[0]?.id || '',
        subcategory_id: categories[0]?.subcategory[0]?.id || '',
        title: '',
        topic: initialTopic || '',
        summary: '',
        content: '',
        estimated_minutes: 8,
        is_published: false,
    });

    const categorySelection = useLearnCategorySelection({
        categories,
        setData: manualForm.setData,
    });

    const triggerAIGeneration = async () => {
        generateAbortRef.current?.abort();
        const abortController = new AbortController();
        generateAbortRef.current = abortController;

        setIsGenerating(true);
        setGenerationError(null);
        setSuccessMsg(null);

        const targetTopic =
            aiTopic.trim() ||
            getFallbackTopic(
                categorySelection.selectedCategoryName,
                categorySelection.selectedSubcategoryName,
            );

        try {
            const response = await fetch(adminLearnGenerate().url, {
                method: 'POST',
                signal: abortController.signal,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({
                    category: categorySelection.selectedCategoryName,
                    subcategory: categorySelection.selectedSubcategoryName,
                    topic: targetTopic,
                    prompt: aiPrompt,
                    primary_model: aiPrimaryModel,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));

                throw new Error(
                    errData.error || `HTTP error! status: ${response.status}`,
                );
            }

            const genData = await response.json();

            if (genData.success) {
                localStorage.setItem('waiting_for_ai', 'true');
                window.dispatchEvent(new Event('ai_generation_started'));
            }
        } catch (err: any) {
            setIsGenerating(false);

            if (err?.name === 'AbortError') {
                setGenerationError('Generation canceled.');
            } else {
                setGenerationError(
                    err.message ||
                        'A network error occurred during generation. Please verify your internet connection and try again.',
                );
            }
        }
    };

    const handleCancelAIGeneration = () => {
        generateAbortRef.current?.abort();
        generateAbortRef.current = null;
        setIsGenerating(false);
        setGenerationError('Generation canceled.');
    };

    useEffect(() => {
        const handleAiComplete = () => {
            setIsGenerating(false);
            setSuccessMsg(
                'Learning module generated successfully! It has been committed to database as a Draft.',
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

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        manualForm.post(adminLearnStore().url, {
            onSuccess: () => {
                manualForm.reset('title', 'topic', 'summary', 'content');
            },
        });
    };

    return {
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
        ...categorySelection,
        triggerAIGeneration,
        handleCancelAIGeneration,
        handleManualSubmit,
    };
}
