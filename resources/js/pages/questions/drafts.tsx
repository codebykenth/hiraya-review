import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Check,
    X,
    Edit3,
    ListChecks
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { index as questionsIndex, store as questionsStore, create as questionsCreate, destroy as questionsDestroy } from '@/routes/questions';
import { DraftsReviewShell, CategoryItem } from '@/components/drafts-review-shell';

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

        const renderRichParagraph = (paraText: string, defaultClass: string = "text-muted-foreground leading-relaxed text-sm font-normal") => {
            if (!paraText) return null;

            // Strict 1-liner comment: Regex to match standard math expressions, logic arrow chains, negation states, parenthesized variables, and single letter variables
            const mathPattern = /(\b\d+(?:\.\d+)?%|\b\d+\/\d+\b|\[[^\]]+\]|\bProject\s+[A-Z]\b|\bQ[1-4]\b|(?:\b\d+(?:,\d{3})*(?:\.\d+)?\s*[\+\-\*\/=]\s*)+\d+(?:,\d{3})*(?:\.\d+)?%?|[~¬]?\s*\b[A-Z]\b\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b(?:\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b)*|[~¬]\s*\b[A-Z]\b|\(\s*[~¬]?\s*\b[A-Z]\b\s*\)|'\s*[~¬]?\s*\b[A-Z]\b\s*'|"\s*[~¬]?\s*\b[A-Z]\b\s*"|\b[B-H|J-N|P-Z]\b)/g;
            const boldParts = paraText.split(/(\*\*[^*]+\*\*)/g);

            const renderSingleVariable = (v: string) => {
                const cleaned = v.trim();
                const isNegated = cleaned.startsWith('~') || cleaned.startsWith('¬');
                const letter = cleaned.replace(/[~¬]\s*/, '');

                if (isNegated) {
                    return (
                        <span className="inline-flex items-center text-xs font-bold text-red-750 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-md font-mono select-all shadow-3xs dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-405">
                            <span className="text-[10px] text-red-400 mr-0.5 font-bold">¬</span>
                            {letter}
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md font-mono select-all shadow-3xs dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
                        {letter}
                    </span>
                );
            };

            const renderTokenContent = (token: string) => {
                // If it is a logic chain
                if (token.includes('->') || token.includes('=>')) {
                    const variables = token.split(/\s*(?:->|=>)\s*/);
                    return (
                        <span className="inline-flex items-center gap-1 mx-1 my-0.5 bg-muted border border-border px-2 py-1 rounded-xl shadow-3xs hover:bg-muted/50 transition">
                            {variables.map((v, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1">
                                    {idx > 0 && <span className="text-muted-foreground font-bold text-xs select-none">➔</span>}
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
                        <span className="text-muted-foreground font-semibold select-all">
                            ( {renderSingleVariable(inner)} )
                        </span>
                    );
                }

                // If it is in single quotes
                if (token.startsWith("'") && token.endsWith("'")) {
                    const inner = token.slice(1, -1);
                    return (
                        <span className="text-muted-foreground font-semibold select-all">
                            '{renderSingleVariable(inner)}'
                        </span>
                    );
                }

                // If it is in double quotes
                if (token.startsWith('"') && token.endsWith('"')) {
                    const inner = token.slice(1, -1);
                    return (
                        <span className="text-muted-foreground font-semibold select-all">
                            "{renderSingleVariable(inner)}"
                        </span>
                    );
                }

                // If it matches standard math expression but not logic letters
                if (!/^[~¬]?[A-Z]$/.test(token.trim())) {
                    return (
                        <code className="mx-0.5 px-1.5 py-0.5 rounded-md bg-blue-50/80 text-blue-700 font-mono text-xs font-bold border border-blue-100/60 shadow-3xs select-all dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
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
                        <p key={idx} className="text-foreground leading-relaxed text-sm font-normal">
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
                            <p key={idx} className="text-foreground font-medium leading-relaxed text-sm">
                                {renderRichParagraph(line, "text-foreground font-medium text-sm leading-relaxed")}
                            </p>
                        ))}
                    </div>
                )}
                <div className="flex flex-col gap-3.5 pl-3 border-l-2 border-blue-500/20 my-4 bg-muted/20 py-2.5 pr-2.5 rounded-r-xl">
                    {listItems.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start">
                            <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 font-mono mt-0.5 shadow-3xs dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
                                {item.marker}
                            </span>
                            <span className="text-sm font-normal text-muted-foreground leading-relaxed">
                                {renderRichParagraph(item.text, "text-sm font-normal text-muted-foreground leading-relaxed")}
                            </span>
                        </div>
                    ))}
                </div>
                {outroLines.length > 0 && (
                    <div className="flex flex-col gap-2.5 border-t border-border pt-3.5 mt-2">
                        {outroLines.map((line, idx) => (
                            <p key={idx} className="text-foreground font-semibold leading-relaxed text-sm">
                                {renderRichParagraph(line, "text-foreground font-semibold text-sm leading-relaxed")}
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
                        return <p key={index} className="text-foreground whitespace-pre-wrap">{part}</p>;
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
                        <div key={index} className="my-5 overflow-hidden rounded-xl border border-border bg-muted/10 shadow-2xs">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-sm text-foreground">
                                    <thead>
                                        <tr className="border-b border-border bg-muted font-bold text-foreground">
                                            {headers.map((header, hIdx) => (
                                                <th key={hIdx} className="px-4 py-3.5 font-bold tracking-tight">
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((row, rIdx) => (
                                            <tr
                                                key={rIdx}
                                                className="transition duration-150 hover:bg-muted/40 odd:bg-card"
                                            >
                                                {row.map((cell, cIdx) => (
                                                    <td key={cIdx} className="px-4 py-3 font-semibold text-muted-foreground">
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

    // Sync local state when Inertia refreshes initialDrafts from backend
    useEffect(() => {
        setDraftQuestions(initialDrafts);
    }, [initialDrafts]);

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

            <DraftsReviewShell<DraftQuestion>
                title="Drafts Review Center"
                subtitle="Review, edit, and approve draft exam items generated by AI or written manually."
                backUrl={questionsIndex().url}
                backLabel="Back to Question Management"
                items={draftQuestions}
                categories={categories}
                searchPlaceholder="Search drafts (stem, category, subcategory)..."
                searchMatcher={(q, search) =>
                    q.stem.toLowerCase().includes(search.toLowerCase()) ||
                    q.category.toLowerCase().includes(search.toLowerCase()) ||
                    q.subcategory.toLowerCase().includes(search.toLowerCase())
                }
                commitLabel="Commit Approved"
                onCommit={handleCommitApproved}
                onToggleAll={handleToggleAllDrafts}
                emptyStateTitle="No Drafts Pending Review"
                emptyStateDescription="There are currently no draft questions in the review queue. Select options in the AI Generator or manual form to add more."
                emptyStateActionUrl={questionsCreate().url}
                emptyStateActionLabel="Generate or Create Questions"
                emptyStateActionIcon={ListChecks}
                renderItem={(q) => (
                    <div
                        key={q.id}
                        className={`rounded-2xl border transition duration-205 bg-card p-6 shadow-xs ${q.approved
                                ? 'border-emerald-250 ring-1 ring-emerald-500/10 shadow-emerald-50/10 dark:border-emerald-800'
                                : 'border-border hover:border-slate-350 dark:hover:border-slate-700'
                            }`}
                    >
                        {/* Card Header metadata */}
                        <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-muted border border-border px-3 py-0.5 text-xs font-semibold text-foreground">
                                    {q.category}
                                </span>
                                <span className="rounded-full bg-blue-50 border border-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:border-blue-900/30 dark:text-blue-300">
                                    {q.subcategory}
                                </span>
                                {q.approved ? (
                                    <span className="rounded-full bg-emerald-555/10 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/30 dark:text-emerald-300">
                                        Approved
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-amber-50 border border-amber-100 px-3 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/30 dark:text-amber-300">
                                        Pending Review
                                    </span>
                                )}
                            </div>

                            {/* Card Actions toolbar */}
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => toggleApproveDraft(q.id)}
                                    className={`p-1.5 rounded-lg border transition cursor-pointer ${q.approved
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-400'
                                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                    title={q.approved ? "Approved (Click to Unapprove)" : "Mark Approved"}
                                >
                                    <Check className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleEditDraft(q.id)}
                                    className={`p-1.5 rounded-lg border transition cursor-pointer ${q.isEditing
                                            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-400'
                                            : 'bg-card border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                    title="Edit Draft Inline"
                                >
                                    <Edit3 className="size-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteDraft(q.id)}
                                    className="p-1.5 rounded-lg border bg-card border-border text-muted-foreground hover:text-red-600 hover:border-red-200 dark:hover:border-red-900/50 transition cursor-pointer"
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
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Stem</label>
                                    <textarea
                                        value={q.stem}
                                        onChange={(e) => handleUpdateDraftStem(q.id, e.target.value)}
                                        className="w-full rounded-xl border border-border p-3 text-sm font-medium focus:border-blue-500 focus:outline-none text-foreground bg-background"
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
                                                <span className="text-xs font-bold text-muted-foreground uppercase">{String.fromCharCode(65 + optIdx)}</span>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => handleUpdateDraftOption(q.id, optIdx, e.target.value)}
                                                    className="w-full rounded-lg border border-border px-3 py-1.5 text-xs font-semibold focus:border-blue-500 focus:outline-none text-foreground bg-background"
                                                />
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleUpdateDraftCorrectOption(q.id, optIdx)}
                                                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${isCorrect
                                                        ? 'bg-emerald-50/70 border-emerald-250 text-emerald-950 dark:text-emerald-400 dark:bg-emerald-950/20 dark:border-emerald-900/40 font-bold'
                                                        : 'bg-muted border-border hover:border-slate-200 text-foreground font-semibold'
                                                    }`}
                                            >
                                                <div className="flex gap-2.5 items-center">
                                                    <span className={`inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isCorrect
                                                            ? 'bg-emerald-600 text-white dark:bg-emerald-400'
                                                            : 'bg-muted text-muted-foreground'
                                                        }`}>
                                                        {String.fromCharCode(65 + optIdx)}
                                                    </span>
                                                    <span className="text-sm leading-tight">{opt}</span>
                                                </div>
                                                {isCorrect && <Check className="size-4 text-emerald-400 shrink-0" />}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Explanation and rationale */}
                        <div className="bg-muted border border-border rounded-xl p-3.5 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            <span className="font-bold text-foreground block mb-1">Explanation & Rationale:</span>
                            {q.isEditing ? (
                                <textarea
                                    value={q.explanation}
                                    onChange={(e) => setDraftQuestions(prev => prev.map(item => item.id === q.id ? { ...item, explanation: e.target.value } : item))}
                                    className="w-full rounded-lg border border-border p-2 text-xs font-medium focus:border-blue-500 focus:outline-none text-foreground bg-background"
                                    rows={2}
                                />
                            ) : (
                                renderFormattedText(q.explanation)
                            )}
                        </div>
                    </div>
                )}
            />
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
