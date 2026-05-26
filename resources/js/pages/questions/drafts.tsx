import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Check,
    X,
    Edit3,
    FileText,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Save,
    RotateCcw,
    ListChecks,
    ArrowLeft,
    Inbox,
    ChevronLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { index as questionsIndex, store as questionsStore, create as questionsCreate, destroy as questionsDestroy, drafts as questionsDrafts } from '@/routes/questions';

// Dynamic Subcategory Lists mapped to the main CSE Categories
const CSE_CATEGORIES: Record<string, string[]> = {
    'General Information': [
        'Philippine Constitution',
        'Code of Conduct and Ethical Standards (R.A. 6713)',
        'Peace and Human Rights Issues and Concepts',
        'Environment Management and Protection'
    ],
    'Verbal Ability': [
        'Word meaning',
        'Sentence completion',
        'Error recognition',
        'Sentence structure',
        'Paragraph organization',
        'Reading comprehension'
    ],
    'Analytical Ability': [
        'Word analogy',
        'Symbolic logic / abstract reasoning',
        'Identifying assumptions and drawing conclusions',
        'Data interpretation'
    ],
    'Numerical Ability': [
        'Basic operations',
        'Number sequence',
        'Word problems'
    ],
    'Clerical Ability': [
        'Filing',
        'Spelling'
    ]
};

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    is_demographic: boolean;
    sort_order: number;
    subcategory?: SubcategoryItem[];
}

interface SubcategoryItem {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    language: string;
    sort_order: number;
}

interface DraftQuestion {
    id: number;
    stem: string;
    category: string;
    subcategory: string;
    options: string[];
    correct_option: number;
    explanation: string;
    approved: boolean;
    isEditing?: boolean;
}

interface DraftsProps {
    initialDrafts?: DraftQuestion[];
    categories?: CategoryItem[];
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

        const renderRichParagraph = (paraText: string, defaultClass: string = "text-slate-650 leading-relaxed text-sm font-normal") => {
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
                        <span className="inline-flex items-center text-xs font-bold text-red-655 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md font-mono select-all shadow-3xs">
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
                        <span className="inline-flex items-center gap-1 mx-1 my-0.5 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-xl shadow-3xs hover:bg-slate-100/50 transition">
                            {variables.map((v, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1">
                                    {idx > 0 && <span className="text-slate-400 font-bold text-xs select-none">➔</span>}
                                    {renderSingleVariable(v)}
                                </span>
                            ))}
                        </span>
                    );
                }

                // If it is parenthesized
                if (token.startsWith('(') && token.endsWith(')')) {
                    const inner = token.slice(1, -1);
                    return (
                        <span className="text-slate-450 font-semibold select-all">
                            ( {renderSingleVariable(inner)} )
                        </span>
                    );
                }

                // If it is in single quotes
                if (token.startsWith("'") && token.endsWith("'")) {
                    const inner = token.slice(1, -1);
                    return (
                        <span className="text-slate-450 font-semibold select-all">
                            '{renderSingleVariable(inner)}'
                        </span>
                    );
                }

                // If it is in double quotes
                if (token.startsWith('"') && token.endsWith('"')) {
                    const inner = token.slice(1, -1);
                    return (
                        <span className="text-slate-450 font-semibold select-all">
                            "{renderSingleVariable(inner)}"
                        </span>
                    );
                }

                // If it matches standard math expression but not logic letters
                if (!/^[~¬]?[A-Z]$/.test(token.trim())) {
                    return (
                        <code className="mx-0.5 px-1.5 py-0.5 rounded-md bg-blue-50/80 text-blue-700 font-mono text-xs font-bold border border-blue-100/60 shadow-3xs select-all">
                            {token}
                        </code>
                    );
                }

                // Default logic letter
                return renderSingleVariable(token);
            };

            return (
                <span className={defaultClass}>
                    {boldParts.map((boldPart, bIdx) => {
                        const isBold = boldPart.startsWith('**') && boldPart.endsWith('**');
                        const innerText = isBold ? boldPart.slice(2, -2) : boldPart;

                        const tokens = innerText.split(mathPattern);
                        return (
                            <span key={bIdx}>
                                {tokens.map((token, tIdx) => {
                                    const isMatch = mathPattern.test(token);
                                    mathPattern.lastIndex = 0;

                                    if (isMatch && token.trim()) {
                                        return (
                                            <span key={tIdx} className="select-none">
                                                {renderTokenContent(token)}
                                            </span>
                                        );
                                    }
                                    return <span key={tIdx}>{token}</span>;
                                })}
                            </span>
                        );
                    })}
                </span>
            );
        };

        if (listItems.length <= 1) {
            return (
                <div className="flex flex-col gap-2.5">
                    {lines.map((line, idx) => (
                        <p key={idx} className="text-slate-600 leading-relaxed text-sm font-normal">
                            {renderRichParagraph(line)}
                        </p>
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {introLines.length > 0 && (
                    <div className="flex flex-col gap-2.5">
                        {introLines.map((line, idx) => (
                            <p key={idx} className="text-slate-750 font-medium leading-relaxed text-sm">
                                {renderRichParagraph(line, "text-slate-750 font-medium text-sm leading-relaxed")}
                            </p>
                        ))}
                    </div>
                )}
                <div className="flex flex-col gap-3.5 pl-3 border-l-2 border-blue-500/20 my-4 bg-slate-50/20 py-2.5 pr-2.5 rounded-r-xl">
                    {listItems.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                            <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 font-mono mt-0.5 shadow-3xs">
                                {item.marker}
                            </span>
                            <span className="text-sm font-normal text-slate-650 leading-relaxed">
                                {renderRichParagraph(item.text, "text-sm font-normal text-slate-650 leading-relaxed")}
                            </span>
                        </div>
                    ))}
                </div>
                {outroLines.length > 0 && (
                    <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-3.5 mt-2">
                        {outroLines.map((line, idx) => (
                            <p key={idx} className="text-slate-750 font-semibold leading-relaxed text-sm">
                                {renderRichParagraph(line, "text-slate-750 font-semibold text-sm leading-relaxed")}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (parts.length <= 1) {
        return formatNumberedLists(text);
    }

    return (
        <div className="space-y-4">
            {parts.map((part, index) => {
                if (part.trim().startsWith('|')) {
                    const lines = part.trim().split('\n');
                    if (lines.length < 2) {
                        return <p key={index} className="text-slate-850 whitespace-pre-wrap">{part}</p>;
                    }

                    const headers = lines[0]
                        .split('|')
                        .map(cell => cell.trim())
                        .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1);

                    const rows = lines.slice(2).map(line => {
                        return line
                            .split('|')
                            .map(cell => cell.trim())
                            .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1);
                    }).filter(row => row.length > 0);

                    return (
                        <div key={index} className="my-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 shadow-2xs">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-sm text-slate-800">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-100/80 font-bold text-slate-900">
                                            {headers.map((header, hIdx) => (
                                                <th key={hIdx} className="px-4 py-3.5 font-bold tracking-tight">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-150">
                                        {rows.map((row, rIdx) => (
                                            <tr
                                                key={rIdx}
                                                className="transition duration-150 hover:bg-slate-100/30 odd:bg-white"
                                            >
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} className="px-4 py-3 font-semibold text-slate-750">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                }

                return <div key={index}>{formatNumberedLists(part)}</div>;
            })}
        </div>
    );
};

export default function DraftsQuestionList({ initialDrafts = [], categories = [] }: DraftsProps) {
    const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>(initialDrafts);

    // Build categories tree dynamically with robust static CSC fallback
    const cseCategoriesTree: Record<string, string[]> = {};
    if (categories && categories.length > 0) {
        categories.forEach(cat => {
            cseCategoriesTree[cat.name] = (cat.subcategory || []).map(sub => sub.name);
        });
    } else {
        cseCategoriesTree['General Information'] = [
            'Philippine Constitution',
            'Code of Conduct and Ethical Standards (R.A. 6713)',
            'Peace and Human Rights Issues and Concepts',
            'Environment Management and Protection'
        ];
        cseCategoriesTree['Verbal Ability'] = [
            'Word meaning',
            'Sentence completion',
            'Error recognition',
            'Sentence structure',
            'Paragraph organization',
            'Reading comprehension'
        ];
        cseCategoriesTree['Analytical Ability'] = [
            'Word analogy',
            'Symbolic logic / abstract reasoning',
            'Identifying assumptions and drawing conclusions',
            'Data interpretation'
        ];
        cseCategoriesTree['Numerical Ability'] = [
            'Basic operations',
            'Number sequence',
            'Word problems'
        ];
        cseCategoriesTree['Clerical Ability'] = [
            'Filing',
            'Spelling'
        ];
    }

    // Sync local state when Inertia refreshes initialDrafts from backend
    useEffect(() => {
        setDraftQuestions(initialDrafts);
    }, [initialDrafts]);

    // Filtering & Pagination States
    const [filterSearch, setFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterSubcategory, setFilterSubcategory] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterSearch, filterStatus, filterCategory, filterSubcategory]);

    // Reset subcategory filter when category filter changes
    useEffect(() => {
        setFilterSubcategory('all');
    }, [filterCategory]);

    // Apply filters
    const filteredDrafts = draftQuestions.filter(q => {
        const matchesSearch =
            q.stem.toLowerCase().includes(filterSearch.toLowerCase()) ||
            q.category.toLowerCase().includes(filterSearch.toLowerCase()) ||
            q.subcategory.toLowerCase().includes(filterSearch.toLowerCase());

        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'approved' && q.approved) ||
            (filterStatus === 'pending' && !q.approved);

        const matchesCategory =
            filterCategory === 'all' ||
            q.category === filterCategory;

        const matchesSubcategory =
            filterSubcategory === 'all' ||
            q.subcategory === filterSubcategory;

        return matchesSearch && matchesStatus && matchesCategory && matchesSubcategory;
    });

    const totalPages = Math.ceil(filteredDrafts.length / pageSize);
    const paginatedDrafts = filteredDrafts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Actions
    const toggleApproveDraft = (id: number) => {
        setDraftQuestions(prev => prev.map(q => q.id === id ? { ...q, approved: !q.approved } : q));
    };

    const handleToggleAllDrafts = () => {
        const allApproved = draftQuestions.every(q => q.approved);
        setDraftQuestions(prev => prev.map(q => ({ ...q, approved: !allApproved })));
    };

    const deleteDraft = async (id: number) => {
        setDraftQuestions(prev => prev.filter(q => q.id !== id));

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            await fetch(questionsDestroy(id).url, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
            });
        } catch (err) {
            console.error('Failed to permanently delete draft:', err);
        }
    };

    const toggleEditDraft = (id: number) => {
        setDraftQuestions(prev => prev.map(q => q.id === id ? { ...q, isEditing: !q.isEditing } : q));
    };

    const handleUpdateDraftStem = (id: number, val: string) => {
        setDraftQuestions(prev => prev.map(q => q.id === id ? { ...q, stem: val } : q));
    };

    const handleUpdateDraftOption = (id: number, optIdx: number, val: string) => {
        setDraftQuestions(prev => prev.map(q => {
            if (q.id === id) {
                const newOpts = [...q.options];
                newOpts[optIdx] = val;
                return { ...q, options: newOpts };
            }
            return q;
        }));
    };

    const handleUpdateDraftCorrectOption = (id: number, optIdx: number) => {
        setDraftQuestions(prev => prev.map(q => q.id === id ? { ...q, correct_option: optIdx } : q));
    };

    const handleCommitApproved = () => {
        const approvedQuestions = draftQuestions.filter(q => q.approved);
        if (approvedQuestions.length === 0) return;

        const questionsToSave = approvedQuestions.map(({ isEditing, approved, ...rest }) => rest);

        router.post(questionsStore().url, {
            questions: questionsToSave,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Drafts Review Center" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-y-auto bg-slate-50/30 p-6">

                {/* 1. TOP HEADER */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link
                            href={questionsIndex().url}
                            className="flex w-fit items-center gap-1 text-xs font-black text-slate-850 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition cursor-pointer focus:outline-none"
                        >
                            <ChevronLeft className="size-4" />
                            Back to Question Management
                        </Link>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                            Drafts Review Center
                        </h1>
                        <p className="text-sm text-slate-500">
                            Review, edit, and approve draft exam items generated by AI or written manually.
                        </p>
                    </div>

                    {/* BULK ACTIONS HEADER DECK */}
                    {draftQuestions.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleToggleAllDrafts}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-250 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-3xs transition hover:bg-slate-50"
                            >
                                <ListChecks className="size-4 text-blue-600" />
                                {draftQuestions.every(q => q.approved) ? 'Unapprove All' : 'Approve All'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCommitApproved}
                                disabled={draftQuestions.filter(q => q.approved).length === 0}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4.5 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50"
                            >
                                <CheckCircle2 className="size-4" />
                                Commit Approved ({draftQuestions.filter(q => q.approved).length})
                            </button>
                        </div>
                    )}
                </div>

                {/* 2. DRAFT SEARCH & FILTER CONTROLS */}
                {draftQuestions.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-3xs">
                        <div className="flex flex-1 min-w-[260px] items-center gap-2">
                            <input
                                type="text"
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                placeholder="Search drafts (stem, category, subcategory)..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Category Filter */}
                            <div className="relative min-w-[120px]">
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-250 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none"
                                >
                                    <option value="all">All Categories</option>
                                    {Object.keys(cseCategoriesTree).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Subcategory Filter */}
                            <div className="relative min-w-[130px]">
                                <select
                                    value={filterSubcategory}
                                    onChange={(e) => setFilterSubcategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-250 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none"
                                >
                                    <option value="all">All Subcategories</option>
                                    {filterCategory !== 'all' && cseCategoriesTree[filterCategory]?.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                    {filterCategory === 'all' && Object.values(cseCategoriesTree).flat().map((sub, idx) => (
                                        <option key={idx} value={sub}>{sub}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            {/* Status Filter */}
                            <div className="relative w-28">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="w-full rounded-lg border border-slate-250 bg-white pl-2.5 pr-8 py-1.5 text-xs font-bold text-slate-700 transition focus:border-blue-500 focus:outline-none appearance-none"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="approved">Approved Only</option>
                                    <option value="pending">Pending Only</option>
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                            </div>

                            <span className="text-xs text-slate-450 font-bold shrink-0 pl-1">
                                {filteredDrafts.length} found
                            </span>
                        </div>
                    </div>
                )}

                {/* 2.5 DRAFT ACTIONS LEGEND */}
                {draftQuestions.length > 0 && (
                    <div className="flex flex-wrap items-center justify-end  gap-3 text-[10px] font-extrabold uppercase tracking-wider bg-slate-50/50 border border-slate-200/60 p-3 rounded-xl dark:bg-slate-950/20 dark:border-slate-850">
                        <span className="text-slate-400/80">Legend:</span>
                        <div className="flex items-center gap-1.5 bg-emerald-50/50 dark:bg-emerald-950/10 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                            <span className="flex size-5.5 items-center justify-center rounded-md border border-emerald-250 bg-emerald-100 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400">
                                <Check className="size-3" />
                            </span>
                            <span className="text-emerald-800 dark:text-emerald-300">Approve / Unapprove Draft</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/10 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <span className="flex size-5.5 items-center justify-center rounded-md border border-blue-250 bg-blue-100 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
                                <Edit3 className="size-3" />
                            </span>
                            <span className="text-blue-800 dark:text-blue-300">Edit Inline</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-rose-50/50 dark:bg-rose-950/10 px-2 py-1 rounded-lg border border-rose-100 dark:border-rose-900/20">
                            <span className="flex size-5.5 items-center justify-center rounded-md border border-rose-250 bg-rose-100 text-rose-700 dark:border-rose-900/30 dark:bg-rose-950/20 dark:text-rose-400">
                                <X className="size-3" />
                            </span>
                            <span className="text-rose-800 dark:text-rose-300">Delete Draft</span>
                        </div>
                    </div>
                )}

                {/* 3. DRAFT STREAM WORKSPACE */}
                <div className="flex flex-col gap-6">
                    {draftQuestions.length === 0 ? (
                        /* COMPLETELY EMPTY SYSTEM-WIDE DRAFTS STATE */
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
                            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <Inbox className="size-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800">No Drafts Pending Review</h3>
                            <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">
                                There are currently no draft questions in the review queue. Select options in the AI Generator or manual form to add more.
                            </p>
                            <Link
                                href={questionsCreate().url}
                                className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-md inline-flex items-center gap-1.5"
                            >
                                <ListChecks className="size-4" />
                                Generate or Create Questions
                            </Link>
                        </div>
                    ) : filteredDrafts.length === 0 ? (
                        /* FILTER EMPTY STATE */
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center">
                            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-450">
                                <FileText className="size-6" />
                            </div>
                            <h3 className="font-bold text-slate-800">No Matching Drafts</h3>
                            <p className="mt-1 text-xs text-slate-500">
                                No drafts match your current search terms or status filters.
                            </p>
                            <button
                                type="button"
                                onClick={() => { setFilterSearch(''); setFilterStatus('all'); setFilterCategory('all'); setFilterSubcategory('all'); }}
                                className="mt-4 rounded-lg bg-blue-650 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        /* LIST OF DRAFTS WITH PAGINATION */
                        <div className="flex flex-col gap-6">
                            {paginatedDrafts.map((q) => (
                                <div
                                    key={q.id}
                                    className={`rounded-2xl border transition duration-200 bg-white p-6 shadow-xs ${q.approved
                                            ? 'border-emerald-250 ring-1 ring-emerald-500/10 shadow-emerald-50/10'
                                            : 'border-slate-200 hover:border-slate-350'
                                        }`}
                                >
                                    {/* Card Header metadata */}
                                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-700">
                                                {q.category}
                                            </span>
                                            <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700">
                                                {q.subcategory}
                                            </span>
                                            {q.approved ? (
                                                <span className="rounded-full bg-emerald-550/10 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700">
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-amber-50 border border-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700">
                                                    Pending Review
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Actions toolbar */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => toggleApproveDraft(q.id)}
                                                className={`p-1.5 rounded-lg border transition ${q.approved
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650'
                                                    }`}
                                                title={q.approved ? "Approved (Click to Unapprove)" : "Mark Approved"}
                                            >
                                                <Check className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => toggleEditDraft(q.id)}
                                                className={`p-1.5 rounded-lg border transition ${q.isEditing
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-650'
                                                    }`}
                                                title="Edit Draft Inline"
                                            >
                                                <Edit3 className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteDraft(q.id)}
                                                className="p-1.5 rounded-lg border bg-white border-slate-200 text-slate-450 hover:text-red-650 hover:border-red-200 transition"
                                                title="Delete Draft"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Question Stem block */}
                                    <div className="mb-4">
                                        {q.isEditing ? (
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-bold text-slate-400 uppercase">Stem</label>
                                                <textarea
                                                    value={q.stem}
                                                    onChange={(e) => handleUpdateDraftStem(q.id, e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium focus:border-blue-500 focus:outline-none"
                                                    rows={3}
                                                />
                                            </div>
                                        ) : (
                                            renderFormattedText(q.stem)
                                        )}
                                    </div>

                                    {/* Options grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                        {q.options.map((opt, optIdx) => {
                                            const isCorrect = q.correct_option === optIdx;
                                            return (
                                                <div key={optIdx} className="relative flex items-center">
                                                    {q.isEditing ? (
                                                        <div className="flex w-full items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`draft-${q.id}-correct`}
                                                                checked={isCorrect}
                                                                onChange={() => handleUpdateDraftCorrectOption(q.id, optIdx)}
                                                                className="size-4 accent-emerald-600 shrink-0 cursor-pointer"
                                                            />
                                                            <span className="text-xs font-bold text-slate-400 uppercase">{String.fromCharCode(65 + optIdx)}</span>
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => handleUpdateDraftOption(q.id, optIdx, e.target.value)}
                                                                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateDraftCorrectOption(q.id, optIdx)}
                                                            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${isCorrect
                                                                    ? 'bg-emerald-50/70 border-emerald-250 text-emerald-950 font-bold'
                                                                    : 'bg-slate-50/40 border-slate-100 hover:border-slate-200 text-slate-700 font-semibold'
                                                                }`}
                                                        >
                                                            <div className="flex gap-2.5 items-center">
                                                                <span className={`inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isCorrect
                                                                        ? 'bg-emerald-600 text-white'
                                                                        : 'bg-slate-200/60 text-slate-650'
                                                                    }`}>
                                                                    {String.fromCharCode(65 + optIdx)}
                                                                </span>
                                                                <span className="text-sm leading-tight">{opt}</span>
                                                            </div>
                                                            {isCorrect && <Check className="size-4 text-emerald-600 shrink-0" />}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation and rationale */}
                                    <div className="bg-slate-50/60 border border-slate-100/60 rounded-xl p-3.5 text-xs leading-relaxed text-slate-650 whitespace-pre-wrap">
                                        <span className="font-bold text-slate-800 block mb-1">Explanation & Rationale:</span>
                                        {q.isEditing ? (
                                            <textarea
                                                value={q.explanation}
                                                onChange={(e) => setDraftQuestions(prev => prev.map(item => item.id === q.id ? { ...item, explanation: e.target.value } : item))}
                                                className="w-full rounded-lg border border-slate-200 p-2 text-xs font-medium focus:border-blue-500 focus:outline-none"
                                                rows={2}
                                            />
                                        ) : (
                                            renderFormattedText(q.explanation)
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Pagination bar */}
                            {filteredDrafts.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/20 px-6 py-4 dark:border-slate-900/60 dark:bg-slate-900/10 gap-3 rounded-b-xl mt-4">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        Showing <strong className="text-slate-900 dark:text-white">{(currentPage - 1) * pageSize + 1}</strong> to <strong className="text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, filteredDrafts.length)}</strong> of <strong className="text-slate-900 dark:text-white">{filteredDrafts.length}</strong> results
                                    </span>

                                    {totalPages > 1 && (
                                        <div className="flex items-center gap-1.5">
                                            {/* Previous button */}
                                            <button
                                                type="button"
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-3xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850 cursor-pointer focus:outline-none"
                                            >
                                                Previous
                                            </button>

                                            {/* Page Numbers list */}
                                            {Array.from({ length: totalPages }).map((_, idx) => {
                                                const pageNum = idx + 1;
                                                const isActive = pageNum === currentPage;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        type="button"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`size-8 rounded-lg text-xs font-black shadow-3xs transition focus:outline-none cursor-pointer ${isActive
                                                                ? 'bg-blue-600 text-white'
                                                                : 'border border-slate-200 bg-white text-slate-750 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-850'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            {/* Next button */}
                                            <button
                                                type="button"
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-3xs transition hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-850 cursor-pointer focus:outline-none"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

DraftsQuestionList.layout = {
    breadcrumbs: [
        {
            title: 'Question Management',
            href: questionsIndex().url,
        },
        {
            title: 'Question Drafts Review',
        },
    ],
};
