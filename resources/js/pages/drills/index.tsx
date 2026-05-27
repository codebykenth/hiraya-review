import React, { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Head, Link, setLayoutProps, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { index as drillsIndex } from '@/routes/drills';
import {
    BookOpen,
    Brain,
    Calculator,
    ClipboardList,
    Globe,
    CheckCircle2,
    Clock,
    Timer,
    ChevronLeft,
    ChevronRight,
    X,
    LayoutGrid,
    RotateCcw,
    Play,
    AlertCircle,
    Flag,
    Check,
    Hourglass,
    Award
} from 'lucide-react';

interface Question {
    id: number;
    stem: string;
    options: string[];
    correct_option: number;
    explanation: string;
    category: string;
    subcategory: string;
    language: string;
    originalOptionIndices?: number[];
}

interface Subcategory {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
    subcategory: Subcategory[];
}

const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Strict 1-liner comment: Pre-format continuous single-line numbered lists to newlines
    const cleanedText = text.replace(/(?:\s+|:|^)(\d+\.)\s+/g, '\n$1 ');

    const tableRegex = /((?:^|\n)\|[^\n]+\|[^\n]*(?:\n\|[^\n]+\|[^\n]*)+)/g;
    const parts = cleanedText.split(tableRegex);

    const formatNumberedLists = (inputText: string) => {
        if (!inputText) return null;

        const lines = inputText.split(/\n/);
        const listRegex = /^\s*(\(\d+\)|\d+\.)\s+(.+)$/;
        
        const listItems: { marker: string; text: string }[] = [];
        let introLines: string[] = [];
        let outroLines: string[] = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            const match = trimmed.match(listRegex);
            if (match) {
                listItems.push({ marker: match[1], text: match[2] });
            } else {
                if (listItems.length === 0) {
                    introLines.push(line);
                } else {
                    outroLines.push(line);
                }
            }
        }

        const renderRichParagraph = (paraText: string, defaultClass: string = "text-muted-foreground leading-relaxed text-base font-medium") => {
            if (!paraText) return null;

            // Strict 1-liner comment: Regex to match standard math expressions, logic arrow chains, negation states, parenthesized variables, and single letter variables
            const mathPattern = /(\b\d+(?:\.\d+)?%|\b\d+\/\d+\b|\[[^\]]+\]|\bProject\s+[A-Z]\b|\bQ[1-4]\b|(?:\b\d+(?:,\d{3})*(?:\.\d+)?\s*[\+\-\*\/=]\s*)+\d+(?:,\d{3})*(?:\.\d+)?%?|[~¬]?\s*\b[A-Z]\b\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b(?:\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b)*|[~¬]\s*\b[A-Z]\b|\(\s*[~¬]?\s*\b[A-Z]\b\s*\)|'\s*\b[A-Z]\b\s*'|"\s*\b[A-Z]\b\s*"|\b[B-H|J-N|P-Z]\b)/g;
            const boldParts = paraText.split(/(\*\*[^*]+\*\*)/g);
            
            const renderSingleVariable = (v: string) => {
                const cleaned = v.trim();
                const isNegated = cleaned.startsWith('~') || cleaned.startsWith('¬');
                const letter = cleaned.replace(/[~¬]\s*/, '');
                
                if (isNegated) {
                    return (
                        <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md font-mono select-all shadow-3xs">
                            <span className="text-[10px] text-red-400 mr-0.5 font-bold">¬</span>
                            {letter}
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md font-mono select-all shadow-3xs">
                        {letter}
                    </span>
                );
            };

            const renderTokenContent = (token: string) => {
                // If it is a logic chain
                if (token.includes('->') || token.includes('=>')) {
                    const variables = token.split(/\s*(?:->|=>)\s*/);
                    return (
                        <span className="inline-flex items-center gap-1 mx-1 my-0.5 bg-slate-50 dark:bg-slate-900 border border-border px-2 py-1 rounded-xl shadow-3xs hover:bg-slate-100/55 dark:hover:bg-slate-800 transition">
                            {variables.map((v, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1">
                                    {idx > 0 && <span className="text-muted-foreground font-bold text-xs select-none">➔</span>}
                                    {renderSingleVariable(v)}
                                </span>
                            ))}
                        </span>
                    );
                }
                
                // If it is a regular bold token or other matched token
                if (token.startsWith('**') && token.endsWith('**')) {
                    return <strong className="font-extrabold text-foreground">{token.slice(2, -2)}</strong>;
                }

                // If it matches brackets or generic variable
                if (token.startsWith('[') && token.endsWith(']')) {
                    return <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-semibold">{token}</span>;
                }

                return <span>{token}</span>;
            };

            return (
                <p className={defaultClass}>
                    {boldParts.map((bPart, bIdx) => {
                        if (bPart.startsWith('**') && bPart.endsWith('**')) {
                            return <strong key={bIdx} className="font-black text-foreground">{bPart.slice(2, -2)}</strong>;
                        }
                        
                        const mathParts = bPart.split(mathPattern);
                        return (
                            <React.Fragment key={bIdx}>
                                {mathParts.map((mPart, mIdx) => {
                                    if (mPart.match(mathPattern)) {
                                        return <React.Fragment key={mIdx}>{renderTokenContent(mPart)}</React.Fragment>;
                                    }
                                    return <span key={mIdx}>{mPart}</span>;
                                })}
                            </React.Fragment>
                        );
                    })}
                </p>
            );
        };

        return (
            <div className="flex flex-col gap-3.5">
                {introLines.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {introLines.map((line, idx) => (
                            <React.Fragment key={idx}>
                                {renderRichParagraph(line, "text-[18px] font-extrabold text-foreground leading-relaxed")}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {listItems.length > 0 && (
                    <div className="flex flex-col gap-2.5 my-2 pl-1">
                        {listItems.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 rounded-lg border border-border bg-slate-50/40 p-3 hover:border-blue-300 transition dark:bg-slate-900/10">
                                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                    {item.marker.replace('.', '')}
                                </span>
                                <div className="flex-1 mt-0.5">
                                    {renderRichParagraph(item.text, "text-base font-semibold leading-relaxed text-foreground")}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {outroLines.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {outroLines.map((line, idx) => (
                            <React.Fragment key={idx}>
                                {renderRichParagraph(line, "text-[18px] font-extrabold text-foreground leading-relaxed")}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderTable = (tableText: string) => {
        const rows = tableText.trim().split('\n');
        if (rows.length === 0) return null;

        const parseRow = (rowText: string) => {
            return rowText.split('|').slice(1, -1).map(cell => cell.trim());
        };

        const headers = parseRow(rows[0]);
        const dataRows = rows.slice(2).map(parseRow);

        return (
            <div className="my-4 overflow-x-auto rounded-xl border border-border shadow-3xs">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-border dark:bg-slate-900/30">
                            {headers.map((h, i) => (
                                <th key={i} className="px-4 py-3 font-extrabold uppercase tracking-wider text-muted-foreground">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
                        {dataRows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-4 py-3 font-semibold text-foreground leading-relaxed">{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-1.5">
            {parts.map((part, index) => {
                if (part.match(tableRegex)) {
                    return <React.Fragment key={index}>{renderTable(part)}</React.Fragment>;
                }
                return <React.Fragment key={index}>{formatNumberedLists(part)}</React.Fragment>;
            })}
        </div>
    );
};

// Strict 1-liner comment: Generate exactly 5 nicely-rounded intervals up to total pool size
const generateQuestionOptions = (totalCount: number): number[] => {
    if (totalCount <= 0) return [];
    if (totalCount <= 5) {
        return Array.from({ length: totalCount }, (_, i) => i + 1);
    }
    const options: number[] = [];
    for (let i = 1; i <= 5; i++) {
        options.push(Math.round((totalCount / 5) * i));
    }
    return Array.from(new Set(options)).sort((a, b) => a - b);
};

interface DrillsProps {
    questions: Question[];
    categories: Category[];
}

const categoryMeta: Record<string, { icon: React.ComponentType<any>; bgColor: string; description: string }> = {
    'Verbal Ability': { 
        icon: BookOpen, 
        bgColor: 'bg-blue-600', 
        description: 'Test your vocabulary, reading comprehension, and error recognition through text-based scenarios.' 
    },
    'Analytical Ability': { 
        icon: Brain, 
        bgColor: 'bg-emerald-600', 
        description: 'Solve logical reasoning problems, identify logical assumptions, and interpret data trends.' 
    },
    'Clerical Ability': { 
        icon: ClipboardList, 
        bgColor: 'bg-indigo-600', 
        description: 'Practice alphabetical filing, information checking, and spelling rules.' 
    },
    'Numerical Ability': { 
        icon: Calculator, 
        bgColor: 'bg-green-600', 
        description: 'Solve math word problems, basic arithmetic operations, and number sequences.' 
    },
    'General Information': { 
        icon: Globe, 
        bgColor: 'bg-cyan-600', 
        description: 'Review the Philippine Constitution, RA 6713, peace concepts, and environmental protection laws.' 
    }
};

export default function Drills({ questions = [], categories = [] }: DrillsProps) {
    // ----------------------------------------------------
    // State Variables
    // ----------------------------------------------------
    const [viewState, setViewState] = useState<'hub' | 'config'>('hub');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedSubcats, setSelectedSubcats] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState<number | 'all'>(30);
    const [language, setLanguage] = useState<'English' | 'Filipino' | 'Both'>('English');
    const [isTimed, setIsTimed] = useState<boolean>(true);
    const [isRetakeConfig, setIsRetakeConfig] = useState<boolean>(false);



    // Dynamically update layout breadcrumbs at the top header
    useEffect(() => {
        if (viewState === 'config') {
            setLayoutProps({
                breadcrumbs: [
                    { title: 'Drills', href: '/drills' },
                    { title: `${selectedCategory?.name || 'Category'} Setup`, href: '#' }
                ]
            });
        } else {
            setLayoutProps({
                breadcrumbs: [
                    { title: 'Drills', href: '/drills' }
                ]
            });
        }
    }, [viewState, selectedCategory]);

    // Strict 1-liner comment: Safely cap selected question count if category filters reduce available pool
    useEffect(() => {
        if (viewState === 'config' && selectedCategory) {
            const currentFilteredCount = questions.filter(q => {
                const catMatch = q.category.toLowerCase().includes(selectedCategory.name.toLowerCase()) || 
                                 selectedCategory.name.toLowerCase().includes(q.category.toLowerCase());
                const subcatMatch = selectedSubcats.length === 0 || selectedSubcats.some(subName => q.subcategory.toLowerCase().includes(subName.toLowerCase()) || subName.toLowerCase().includes(q.subcategory.toLowerCase()));
                
                let langMatch = true;
                if (language === 'English') langMatch = q.language === 'English';
                else if (language === 'Filipino') langMatch = q.language === 'Filipino';

                return catMatch && subcatMatch && langMatch;
            }).length;

            if (questionCount !== 'all' && questionCount > currentFilteredCount) {
                setQuestionCount(currentFilteredCount || 1);
            }
        }
    }, [selectedSubcats, language, selectedCategory, viewState, questions]);

    // Strict 1-liner comment: Pre-select category, subcategories, language, and question count on retake
    useEffect(() => {
        if (categories && categories.length > 0) {
            const params = new URLSearchParams(window.location.search);
            const catParam = params.get('category');
            const totalParam = params.get('total');
            const langParam = params.get('language');
            const subcatsParam = params.get('subcategories');
            const timedParam = params.get('timed');
            
            if (catParam) {
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                
                let parsedSubcats: string[] | null = null;
                if (subcatsParam) {
                    try {
                        parsedSubcats = JSON.parse(decodeURIComponent(subcatsParam));
                    } catch (e) {
                        // ignore malformed strings
                    }
                }
                
                handleCategoryClick(catParam, totalParam, langParam, parsedSubcats, timedParam);
                
                // Only lock settings if actual historical configurations were supplied in URL
                const hasRetakeParams = !!(totalParam || langParam || subcatsParam || timedParam);
                setIsRetakeConfig(hasRetakeParams);
            }
        }
    }, [categories]);

    // ----------------------------------------------------
    // Configuration Actions
    // ----------------------------------------------------
    const handleCategoryClick = (
        catName: string, 
        totalParam?: string | null,
        langParam?: string | null,
        subcatsParam?: string[] | null,
        timedParam?: string | null
    ) => {
        // Map hub selection to database model categories
        const dbCategory = categories.find((c: Category) => c.name.toLowerCase().includes(catName.toLowerCase()) || catName.toLowerCase().includes(c.name.toLowerCase()));
        
        // Form fallback category structure if not initialized in database
        const finalCategory = dbCategory || {
            id: 999,
            name: catName,
            subcategory: []
        };

        // Determine question count based on total parameter or fallback to 30
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

        // Determine language selection or fallback to English
        let targetLanguage: 'English' | 'Filipino' | 'Both' = 'English';
        if (langParam) {
            if (langParam === 'English' || langParam === 'Filipino' || langParam === 'Both') {
                targetLanguage = langParam as 'English' | 'Filipino' | 'Both';
            }
        }

        // Determine selected subcategories or default to all
        const targetSubcats = subcatsParam && Array.isArray(subcatsParam)
            ? subcatsParam
            : finalCategory.subcategory.map(s => s.name);

        // Determine timed status or default to true
        const targetTimed = timedParam !== 'false';

        setSelectedCategory(finalCategory);
        setSelectedSubcats(targetSubcats);
        setQuestionCount(targetCount);
        setLanguage(targetLanguage);
        setIsTimed(targetTimed);
        setViewState('config');
    };

    const toggleSubcat = (subcatName: string) => {
        if (isRetakeConfig) return;
        setSelectedSubcats(prev =>
            prev.includes(subcatName)
                ? prev.filter(s => s !== subcatName)
                : [...prev, subcatName]
        );
    };

    // ----------------------------------------------------
    // Drill Execution
    // ----------------------------------------------------
    const startDrill = () => {
        if (!selectedCategory) return;

        const queryParams = new URLSearchParams({
            drill: 'true',
            category_id: String(selectedCategory.id),
            category_name: selectedCategory.name,
            question_count: String(questionCount),
            language: language,
            timed: String(isTimed),
        });
        
        if (selectedSubcats.length > 0) {
            queryParams.append('subcategories', JSON.stringify(selectedSubcats));
        }

        router.visit(`/exams?${queryParams.toString()}`);
    };


    // Hub View (1st Image)
    const renderHub = () => {
        return (
            <div className="flex flex-col gap-6">
                <PageHeader
                    title="Practice Drill Hub"
                    description="Select a category below to focus your practice. Each drill module is designed to target specific cognitive areas required for civil service examinations."
                />

                {categories.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map(cat => {
                            const meta = categoryMeta[cat.name] || {
                                icon: Brain,
                                bgColor: 'bg-slate-600',
                                description: 'Master your skills in this civil service exam practice module.'
                            };
                            const CardIcon = meta.icon;
                            const actualCount = questions.filter(q => 
                                q.category.toLowerCase().includes(cat.name.toLowerCase()) || 
                                cat.name.toLowerCase().includes(q.category.toLowerCase())
                            ).length;

                            return (
                                <Card 
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="group relative flex flex-col justify-between overflow-hidden p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                                >
                                    <div>
                                        <div className="flex items-start justify-between">
                                            <div className={`rounded-xl ${meta.bgColor} p-3 text-white shadow-xs`}>
                                                <CardIcon className="size-6" />
                                            </div>
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-muted-foreground dark:bg-slate-800">
                                                📝 {actualCount} Qs
                                            </span>
                                        </div>

                                        <h3 className="mt-5 font-heading text-xl font-bold text-foreground transition group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            {cat.name}
                                        </h3>
                                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                            {meta.description}
                                        </p>
                                    </div>

                                    <div className="mt-6 flex flex-wrap gap-1.5">
                                        {cat.subcategory.map(sub => (
                                            <span 
                                                key={sub.id}
                                                className="rounded-lg border border-border bg-slate-50/50 px-2 py-0.5 text-xs font-semibold text-muted-foreground dark:bg-slate-900/40"
                                            >
                                                {sub.name}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card py-20 text-center shadow-sm">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-muted-foreground mb-5 ring-8">
                            <Brain className="size-6 text-blue-650" />
                        </div>
                        <h3 className="font-heading text-lg font-bold text-foreground">No Practice Drills Available</h3>
                        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                            Practice drill modules are coming soon! We are currently compiling comprehensive exam question banks.
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // Configuration View (2nd Image)
    const renderConfig = () => {
        if (!selectedCategory) return null;

        const meta = categoryMeta[selectedCategory.name] || {
            icon: Brain,
            bgColor: 'bg-slate-600',
            description: 'Master your skills in this practice module.'
        };
        const CategoryIcon = meta.icon;
        
        // Calculate dynamic matching questions in this configuration
        const filteredQCount = questions.filter(q => {
            const catMatch = q.category.toLowerCase().includes(selectedCategory.name.toLowerCase()) || 
                             selectedCategory.name.toLowerCase().includes(q.category.toLowerCase());
            const subcatMatch = selectedSubcats.length === 0 || selectedSubcats.some(subName => q.subcategory.toLowerCase().includes(subName.toLowerCase()) || subName.toLowerCase().includes(q.subcategory.toLowerCase()));
            
            let langMatch = true;
            if (language === 'English') langMatch = q.language === 'English';
            else if (language === 'Filipino') langMatch = q.language === 'Filipino';

            return catMatch && subcatMatch && langMatch;
        }).length;

        return (
            <div className="flex flex-col gap-6">
                {/* Back Link */}
                <button
                    onClick={() => {
                        setViewState('hub');
                        setIsRetakeConfig(false);
                    }}
                    className="flex w-fit items-center gap-1 text-xs font-black text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer focus:outline-none"
                >
                    <ChevronLeft className="size-4" />
                    Back to Drill Hub
                </button>

                {/* Retake Mode Status Banner */}
                {isRetakeConfig && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-955/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold text-amber-800 dark:text-amber-350 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🔄</span>
                            <span><strong>Retake Mode Active:</strong> Settings have been locked to match your historical attempt.</span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setIsRetakeConfig(false)}
                            className="rounded-lg bg-amber-100 hover:bg-amber-200 px-3 py-1.5 font-bold text-amber-900 dark:bg-amber-955 dark:hover:bg-amber-900 dark:text-amber-300 transition shrink-0 cursor-pointer focus:outline-none"
                        >
                            Unlock & Customize Settings
                        </button>
                    </div>
                )}

                {/* Header Title Banner */}
                <div className="flex items-center gap-4">
                    <div className={`rounded-xl ${meta.bgColor} p-3 text-white shadow-xs`}>
                        <CategoryIcon className="size-6" />
                    </div>
                    <PageHeader
                        title={`${selectedCategory.name} Practice`}
                        description="Configure your drill session parameters below."
                    />
                </div>

                {/* Config Split Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    
                    {/* Left Params Pane */}
                    <div className="flex flex-col gap-5 lg:col-span-2">
                        
                        {/* 1. Subcategory Selector */}
                        <Card className="p-5 shadow-2xs">
                            <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase block mb-3">
                                🌲 Select Subcategories
                            </span>
                            <div className="flex flex-wrap gap-2.5">
                                {selectedCategory.subcategory.map(sub => {
                                    const isSelected = selectedSubcats.includes(sub.name);
                                    return (
                                        <button
                                            key={sub.name}
                                            disabled={isRetakeConfig}
                                            onClick={() => toggleSubcat(sub.name)}
                                            className={`flex items-center gap-1 rounded-full px-4.5 py-2 text-xs font-bold transition focus:outline-none ${
                                                isRetakeConfig ? 'opacity-60 pointer-events-none select-none' : ''
                                            } ${
                                                isSelected
                                                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                                                    : 'bg-white text-muted-foreground border border-border hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/50'
                                            }`}
                                        >
                                            {sub.name}
                                            {isSelected && <Check className="size-3" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* 2. Question Count Selector */}
                        <Card className="p-5 shadow-2xs">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase">
                                    🔢 Question Count
                                </span>
                                <span className="rounded-md bg-blue-50/50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                    Total Questions: {questionCount === 'all' ? filteredQCount : questionCount}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {generateQuestionOptions(filteredQCount).map(count => {
                                    const isSelected = questionCount === count;
                                    return (
                                        <button
                                            key={count}
                                            type="button"
                                            disabled={isRetakeConfig}
                                            onClick={() => setQuestionCount(count)}
                                            className={`rounded-lg px-4 py-2 text-xs font-bold transition focus:outline-none border cursor-pointer ${
                                                isRetakeConfig ? 'opacity-60 pointer-events-none select-none' : ''
                                            } ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                    : 'bg-slate-50/50 text-muted-foreground border-border hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {count}
                                        </button>
                                    );
                                })}

                                <button
                                    type="button"
                                    disabled={isRetakeConfig}
                                    onClick={() => setQuestionCount('all')}
                                    className={`rounded-lg px-4 py-2 text-xs font-bold transition focus:outline-none border cursor-pointer ${
                                        isRetakeConfig ? 'opacity-60 pointer-events-none select-none' : ''
                                    } ${
                                        questionCount === 'all'
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                            : 'bg-slate-50/50 text-muted-foreground border-border hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    All
                                </button>

                                {/* Custom number input */}
                                <div className={`flex items-center gap-2 rounded-lg border border-border bg-slate-50/20 px-3 py-1 text-xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition dark:bg-slate-900/30 ${
                                    isRetakeConfig ? 'opacity-60 pointer-events-none select-none' : ''
                                }`}>
                                    <span className="text-muted-foreground font-bold shrink-0">Custom:</span>
                                    <input
                                        type="number"
                                        min={1}
                                        disabled={isRetakeConfig}
                                        max={filteredQCount}
                                        value={typeof questionCount === 'number' && !generateQuestionOptions(filteredQCount).includes(questionCount) ? questionCount : ''}
                                        placeholder={`1-${filteredQCount}`}
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? '' : Math.min(filteredQCount, Math.max(1, parseInt(e.target.value, 10)));
                                            if (typeof val === 'number' && !isNaN(val)) {
                                                setQuestionCount(val);
                                            }
                                        }}
                                        className="w-14 bg-transparent font-bold text-foreground focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* 3. Language Selector */}
                        <Card className="p-5 shadow-2xs">
                            <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase block mb-3.5">
                                🌐 Language
                            </span>
                            <div className="flex flex-wrap gap-6">
                                {['English', 'Filipino', 'Both'].map(lang => {
                                    const isSelected = language === lang;
                                    return (
                                        <label key={lang} className={`flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground ${
                                            isRetakeConfig ? 'opacity-60 pointer-events-none select-none' : ''
                                        }`}>
                                            <input 
                                                type="radio" 
                                                name="drill-lang" 
                                                disabled={isRetakeConfig}
                                                checked={isSelected}
                                                onChange={() => setLanguage(lang as 'English' | 'Filipino' | 'Both')}
                                                className="size-4 text-blue-600 border-border focus:ring-blue-500 dark:bg-slate-900 dark:border-slate-800"
                                            />
                                            {lang === 'Both' ? 'Both (Mixed)' : lang}
                                        </label>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* 4. Practice Mode Selector */}
                        <Card className="p-5 shadow-2xs">
                            <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase block mb-3.5">
                                ⏱️ Practice Mode
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    disabled={isRetakeConfig}
                                    onClick={() => setIsTimed(true)}
                                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                                        isRetakeConfig ? 'opacity-60 pointer-events-none select-none' : ''
                                    } ${
                                        isTimed
                                            ? 'border-blue-600 bg-blue-50/10 dark:border-blue-500 dark:bg-blue-950/10'
                                            : 'border-border bg-card hover:bg-slate-50/50 dark:hover:bg-slate-900/40'
                                    }`}
                                >
                                    <div className={`rounded-lg p-2 ${isTimed ? 'bg-blue-600 text-white' : 'bg-slate-100 text-muted-foreground dark:bg-slate-900'}`}>
                                        <Timer className="size-4" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-foreground">Timed Practice</span>
                                        <span className="mt-1 block text-[10px] text-muted-foreground leading-normal">
                                            Simulates exam pressure with a strict countdown timer (1 min per item) and auto-submits when time expires.
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    disabled={isRetakeConfig}
                                    onClick={() => setIsTimed(false)}
                                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                                        isRetakeConfig ? 'opacity-60 pointer-events-none select-none' : ''
                                    } ${
                                        !isTimed
                                            ? 'border-emerald-600 bg-emerald-50/10 dark:border-emerald-500 dark:bg-emerald-950/10'
                                            : 'border-border bg-card hover:bg-slate-50/50 dark:hover:bg-slate-900/40'
                                    }`}
                                >
                                    <div className={`rounded-lg p-2 ${!isTimed ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-muted-foreground dark:bg-slate-900'}`}>
                                        <Hourglass className="size-4" />
                                    </div>
                                    <div>
                                        <span className="block text-xs font-black text-foreground">Untimed Practice</span>
                                        <span className="mt-1 block text-[10px] text-muted-foreground leading-normal">
                                            Stress-free learning. Work at your own pace with a stopwatch tracker to monitor your overall time.
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </Card>

                    </div>

                    {/* Right Summary Pane (Drill Summary Card) */}
                    <div>
                        <Card className="p-6 flex flex-col justify-between h-fit">
                            <div>
                                <div className="flex items-center justify-between border-b border-border pb-4">
                                    <span className="font-heading text-base font-bold text-foreground">
                                        Drill Summary
                                    </span>
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                </div>

                                <div className="mt-5 flex flex-col gap-4 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Category:</span>
                                        <span className="font-bold text-foreground">{selectedCategory.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Questions:</span>
                                        <span className="font-bold text-foreground">
                                            {questionCount === 'all' ? filteredQCount : questionCount}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Language:</span>
                                        <span className="font-bold text-foreground">{language}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Format:</span>
                                        <span className={`rounded-md px-2 py-0.5 font-bold text-[10px] uppercase ${
                                            isTimed 
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' 
                                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                        }`}>
                                            {isTimed ? 'Timed Practice' : 'Untimed Practice'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={startDrill}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition focus:outline-none"
                                >
                                    Start Drill
                                    <ChevronRight className="size-4" />
                                </button>
                                <span className="mt-3 block text-center text-[10px] text-muted-foreground">
                                    Session progress will be saved automatically.
                                </span>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Practice Drills" />
            <PageContainer className="bg-slate-50/30 dark:bg-slate-900/20">
                {viewState === 'hub' && renderHub()}
                {viewState === 'config' && renderConfig()}
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
