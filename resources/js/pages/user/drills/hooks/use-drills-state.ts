import { setLayoutProps, router, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Brain,
    Calculator,
    ClipboardList,
    Globe,
} from 'lucide-react';
import type React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { resolveOriginFromUrl, setSessionOrigin, setBackAnchor } from '@/lib/smart-back';
import type { Category, DrillsProps } from '../types';

export const categoryMeta: Record<
    string,
    { icon: React.ComponentType<any>; bgColor: string; description: string }
> = {
    'Verbal Ability': {
        icon: BookOpen,
        bgColor: 'bg-blue-600',
        description:
            'Test your vocabulary, reading comprehension, and error recognition through text-based scenarios.',
    },
    'Analytical Ability': {
        icon: Brain,
        bgColor: 'bg-emerald-600',
        description:
            'Solve logical reasoning problems, identify logical assumptions, and interpret data trends.',
    },
    'Clerical Ability': {
        icon: ClipboardList,
        bgColor: 'bg-indigo-600',
        description:
            'Practice alphabetical filing, information checking, and spelling rules.',
    },
    'Numerical Ability': {
        icon: Calculator,
        bgColor: 'bg-green-600',
        description:
            'Solve math word problems, basic arithmetic operations, and number sequences.',
    },
    'General Information': {
        icon: Globe,
        bgColor: 'bg-cyan-600',
        description:
            'Review the Philippine Constitution, RA 6713, peace concepts, and environmental protection laws.',
    },
};

export const generateQuestionOptions = (totalCount: number): number[] => {
    if (totalCount <= 0) {
        return [];
    }

    if (totalCount <= 5) {
        return Array.from({ length: totalCount }, (_, i) => i + 1);
    }

    const options: number[] = [];

    for (let i = 1; i <= 5; i++) {
        options.push(Math.round((totalCount / 5) * i));
    }

    return Array.from(new Set(options)).sort((a, b) => a - b);
};

export function useDrillsState({
    questions = [],
    categories = [],
}: DrillsProps) {
    const { url } = usePage();
    const [viewState, setViewState] = useState<'hub' | 'config'>('hub');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [selectedSubcats, setSelectedSubcats] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState<number | 'all'>(30);
    const [language, setLanguage] = useState<'English' | 'Filipino' | 'Both'>(
        'English',
    );
    const [isTimed, setIsTimed] = useState<boolean>(true);
    const [isRetakeConfig, setIsRetakeConfig] = useState<boolean>(false);
    const [originInfo, setOriginInfo] = useState<{ href: string; title: string } | null>(() =>
        resolveOriginFromUrl(url),
    );

    // Keep origin resolved if URL changes or on mount
    useEffect(() => {
        const resolved = resolveOriginFromUrl(url);
        if (resolved) {
            setOriginInfo(resolved);
            setSessionOrigin(resolved.href);
        }
    }, [url]);

    // Dynamically update layout breadcrumbs at the top header
    useEffect(() => {
        if (viewState === 'config') {
            const originHref = originInfo ? originInfo.href : '/drills';
            const originTitle = originInfo ? originInfo.title : 'Drills';

            setTimeout(() => {
                setLayoutProps({
                    breadcrumbs: [
                        { title: originTitle, href: originHref },
                        {
                            title: `${selectedCategory?.name || 'Category'} Setup`,
                            href: '#',
                        },
                    ],
                });
            }, 0);
        } else {
            setTimeout(() => {
                setLayoutProps({
                    breadcrumbs: [{ title: 'Drills', href: '/drills' }],
                });
            }, 0);
        }
    }, [viewState, selectedCategory, originInfo]);

    const handleCategoryClick = useCallback(
        (
            catName: string,
            totalParam?: string | null,
            langParam?: string | null,
            subcatsParam?: string[] | null,
            timedParam?: string | null,
        ) => {
            const dbCategory = categories.find(
                (c: Category) =>
                    c.name.toLowerCase().includes(catName.toLowerCase()) ||
                    catName.toLowerCase().includes(c.name.toLowerCase()),
            );

            const finalCategory = dbCategory || {
                id: 999,
                name: catName,
                subcategory: [],
            };

            let targetCount: number | 'all' = 30;

            if (totalParam) {
                if (totalParam === 'all') {
                    targetCount = 'all';
                } else {
                    const parsed = parseInt(totalParam, 10);

                    if (!isNaN(parsed)) {
                        targetCount = parsed as number | 'all';
                    }
                }
            }

            let targetLanguage: 'English' | 'Filipino' | 'Both' = 'English';

            if (langParam) {
                if (
                    langParam === 'English' ||
                    langParam === 'Filipino' ||
                    langParam === 'Both'
                ) {
                    targetLanguage = langParam as
                        | 'English'
                        | 'Filipino'
                        | 'Both';
                }
            }

            const targetSubcats =
                subcatsParam && Array.isArray(subcatsParam)
                    ? subcatsParam
                    : finalCategory.subcategory.map((s) => s.name);

            const targetTimed = timedParam !== 'false';

            setSelectedCategory(finalCategory);
            setSelectedSubcats(targetSubcats);
            setQuestionCount(targetCount);
            setLanguage(targetLanguage);
            setIsTimed(targetTimed);
            setViewState('config');
            setBackAnchor('/drills');
        },
        [categories],
    );

    // Check if there are ANY filipino questions in this configuration
    const hasFilipinoQuestions = useMemo(() => {
        if (!selectedCategory) {
            return false;
        }

        return questions.some((q) => {
            const catMatch =
                q.category
                    .toLowerCase()
                    .includes(selectedCategory.name.toLowerCase()) ||
                selectedCategory.name
                    .toLowerCase()
                    .includes(q.category.toLowerCase());

            const subcatMatch =
                selectedSubcats.length === 0 ||
                selectedSubcats.some(
                    (subName) =>
                        q.subcategory
                            .toLowerCase()
                            .includes(subName.toLowerCase()) ||
                        subName
                            .toLowerCase()
                            .includes(q.subcategory.toLowerCase()),
                );

            const qLang = (q.language || '').toLowerCase();

            return (
                catMatch &&
                subcatMatch &&
                (qLang.includes('filipino') || qLang.includes('tagalog'))
            );
        });
    }, [questions, selectedCategory, selectedSubcats]);

    const effectiveLanguage =
        hasFilipinoQuestions || language === 'English' ? language : 'English';

    // Calculate dynamic matching questions in this configuration
    const filteredQCount = useMemo(() => {
        if (!selectedCategory) {
            return 0;
        }

        return questions.filter((q) => {
            const catMatch =
                q.category
                    .toLowerCase()
                    .includes(selectedCategory.name.toLowerCase()) ||
                selectedCategory.name
                    .toLowerCase()
                    .includes(q.category.toLowerCase());
            const subcatMatch =
                selectedSubcats.length === 0 ||
                selectedSubcats.some(
                    (subName) =>
                        q.subcategory
                            .toLowerCase()
                            .includes(subName.toLowerCase()) ||
                        subName
                            .toLowerCase()
                            .includes(q.subcategory.toLowerCase()),
                );

            let langMatch = true;

            const qLang = (q.language || '').toLowerCase();

            if (effectiveLanguage === 'English') {
                langMatch = qLang === 'english' || qLang === '';
            } else if (effectiveLanguage === 'Filipino') {
                langMatch =
                    qLang.includes('filipino') || qLang.includes('tagalog');
            }

            return catMatch && subcatMatch && langMatch;
        }).length;
    }, [questions, selectedCategory, selectedSubcats, effectiveLanguage]);

    // Safely cap selected question count if category filters reduce available pool
    useEffect(() => {
        if (viewState === 'config' && selectedCategory) {
            if (questionCount !== 'all' && questionCount > filteredQCount) {
                const timer = setTimeout(() => {
                    setQuestionCount(filteredQCount || 1);
                }, 0);

                return () => clearTimeout(timer);
            }
        }
    }, [
        selectedSubcats,
        language,
        selectedCategory,
        viewState,
        questionCount,
        filteredQCount,
    ]);

    // Pre-select category, subcategories, language, and question count on deep link or retake
    useEffect(() => {
        if (categories && categories.length > 0) {
            const searchStr = url.includes('?') ? url.split('?')[1] : (typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '');
            const params = new URLSearchParams(searchStr);
            let catParam = params.get('category') || params.get('cat');
            const totalParam = params.get('total') || params.get('count');
            const langParam = params.get('language') || params.get('lang');
            const subcatsParam = params.get('subcategories');
            const singleSubcatParam = params.get('subcategory') || params.get('subcat') || params.get('search');
            const timedParam = params.get('timed');

            let parsedSubcats: string[] | null = null;

            if (subcatsParam) {
                try {
                    const parsed = JSON.parse(decodeURIComponent(subcatsParam));
                    if (Array.isArray(parsed)) {
                        parsedSubcats = parsed;
                    }
                } catch {
                    parsedSubcats = subcatsParam.split(',').map((s) => s.trim());
                }
            } else if (singleSubcatParam) {
                parsedSubcats = [singleSubcatParam.trim()];
            }

            // If category is not explicitly passed but subcategory is, find the parent category
            if (!catParam && parsedSubcats && parsedSubcats.length > 0) {
                const targetSub = parsedSubcats[0].toLowerCase();
                const matchedCat = categories.find((c: Category) =>
                    c.subcategory?.some((s) =>
                        s.name.toLowerCase().includes(targetSub) ||
                        targetSub.includes(s.name.toLowerCase()),
                    ),
                );
                if (matchedCat) {
                    catParam = matchedCat.name;
                }
            }

            if (catParam) {
                if (typeof window !== 'undefined') {
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                }

                // Came from another page via a deep link (e.g. Analytics): back
                // should return to the source, not to the drill hub.
                setBackAnchor(null);

                const timer = setTimeout(() => {
                    handleCategoryClick(
                        catParam!,
                        totalParam,
                        langParam,
                        parsedSubcats,
                        timedParam,
                    );
                    const isExplicitRetake = params.get('retake') === 'true';
                    setIsRetakeConfig(isExplicitRetake);
                }, 0);

                return () => clearTimeout(timer);
            }
        }
    }, [categories, handleCategoryClick, url]);

    const toggleSubcat = (subcatName: string) => {
        if (isRetakeConfig) {
            return;
        }

        setSelectedSubcats((prev) =>
            prev.includes(subcatName)
                ? prev.filter((s) => s !== subcatName)
                : [...prev, subcatName],
        );
    };

    const startDrill = () => {
        if (!selectedCategory) {
            return;
        }

        const queryParams = new URLSearchParams({
            drill: 'true',
            category_id: String(selectedCategory.id),
            category_name: selectedCategory.name,
            question_count: String(questionCount),
            language: effectiveLanguage,
            timed: String(isTimed),
        });

        if (selectedSubcats.length > 0) {
            queryParams.append(
                'subcategories',
                JSON.stringify(selectedSubcats),
            );
        }

        if (originInfo) {
            queryParams.append('from', originInfo.href);
        }

        // Clear any existing exam session before starting a fresh drill
        if (typeof window !== 'undefined') {
            localStorage.removeItem('active_exam_session');
        }

        router.visit(`/exams?${queryParams.toString()}`);
    };

    return {
        viewState,
        setViewState,
        selectedCategory,
        setSelectedCategory,
        selectedSubcats,
        setSelectedSubcats,
        questionCount,
        setQuestionCount,
        language: effectiveLanguage,
        setLanguage,
        isTimed,
        setIsTimed,
        isRetakeConfig,
        setIsRetakeConfig,
        originInfo,
        filteredQCount,
        hasFilipinoQuestions,
        handleCategoryClick,
        toggleSubcat,
        startDrill,
    };
}
