import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageContainer } from '@/components/page-container';
import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { index as examsIndex } from '@/routes/exams';
import {
    Award,
    ClipboardList,
    List,
    CheckCircle2,
    Clock,
    Timer,
    ArrowRight,
    X,
    LayoutGrid,
    Sparkles,
    AlertCircle,
    Flag,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    HelpCircle,
    RotateCcw,
    ChevronDown,
    Brain,
    Calculator,
    Users
} from 'lucide-react';

interface Question {
    id: number;
    stem: string;
    options: string[];
    correct_option: number;
    explanation: string;
    category: string;
    subcategory: string;
    originalOptionIndices?: number[];
    isDemographic?: boolean;
    language?: string;
}

interface CategoryItem {
    id: number;
    name: string;
    subcategory?: { id: number; name: string }[];
}

interface TrackConfigItem {
    id: number;
    track: string;
    category_id: number;
    item_count: number;
    time_limit_secs: number;
}

const extractPropositions = (stem: string) => {
    const regex = /\(\s*([A-Z])\s*\)/g;
    const matches: { letter: string; phrase: string }[] = [];
    let match;

    while ((match = regex.exec(stem)) !== null) {
        const letter = match[1];
        const index = match.index;
        const beforeText = stem.substring(Math.max(0, index - 80), index).trim();
        const parts = beforeText.split(/(?:\.|\bif\b|\bthen\b|\bthat\b|\band\b|,)\s*/i);
        let phrase = parts[parts.length - 1].trim();

        phrase = phrase.replace(/^(?:a|an|the|they|he|she|it|to)\s+/i, '');
        if (phrase) {
            phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);
            if (!matches.some(m => m.letter === letter)) {
                matches.push({ letter, phrase });
            }
        }
    }
    return matches;
};

const renderFormattedText = (text: string, stripLogicSymbols: boolean = false, letterMap?: Record<string, string>) => {
    if (!text) return null;

    // Strict 1-liner comment: Dynamically strip parenthesized logical variable markers if requested
    const processedText = stripLogicSymbols ? text.replace(/\s*\(\s*[~¬]?\s*[A-Z]\s*\)/g, '') : text;

    // Strict 1-liner comment: Pre-format continuous single-line numbered lists to newlines
    const cleanedText = processedText.replace(/(?:\s+|:|^)(\d+\.)\s+/g, '\n$1 ');

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

        const renderRichParagraph = (paraText: string, defaultClass: string = "text-slate-655 leading-relaxed text-base font-medium") => {
            if (!paraText) return null;

            // Strict 1-liner comment: Regex to match standard math expressions, logic arrow chains, negation states, parenthesized variables, and single letter variables
            const mathPattern = /(\b\d+(?:\.\d+)?%|\b\d+\/\d+\b|\[[^\]]+\]|\bProject\s+[A-Z]\b|\bQ[1-4]\b|(?:\b\d+(?:,\d{3})*(?:\.\d+)?\s*[+\-*/=]\s*)+\d+(?:,\d{3})*(?:\.\d+)?%?|[~¬]?\s*\b[A-Z]\b\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b(?:\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b)*|[~¬]\s*\b[A-Z]\b|\(\s*[~¬]?\s*\b[A-Z]\b\s*\)|'\s*\b[A-Z]\b\s*'|"\s*\b[A-Z]\b\s*"|\b[B-H|J-N|P-Z]\b)/g;

            const renderSingleVariable = (v: string) => {
                const cleaned = v.trim();
                const isNegated = cleaned.startsWith('~') || cleaned.startsWith('¬');
                let letter = cleaned.replace(/[~¬]\s*/, '');

                // Strict 1-liner comment: Translate custom variable key to standard A/B/C/D
                if (letterMap && letterMap[letter]) {
                    letter = letterMap[letter];
                }

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

                // If it is a regular bold token or other matched token
                if (token.startsWith('**') && token.endsWith('**')) {
                    return <strong className="font-extrabold text-slate-900 dark:text-white">{token.slice(2, -2)}</strong>;
                }

                // If it matches brackets or generic variable
                if (token.startsWith('[') && token.endsWith(']')) {
                    return <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-650 dark:text-indigo-400 font-semibold">{token}</span>;
                }

                return <span>{token}</span>;
            };

            // Strict 1-liner comment: Render inner paragraph tokens for bold text and logical math symbols
            const renderRichParagraphContent = (inputText: string) => {
                const boldParts = inputText.split(/(\*\*[^*]+\*\*)/g);
                return boldParts.map((bPart, bIdx) => {
                    if (bPart.startsWith('**') && bPart.endsWith('**')) {
                        return <strong key={bIdx} className="font-black text-slate-850 dark:text-white">{bPart.slice(2, -2)}</strong>;
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
                });
            };

            // Strict 1-liner comment: Match step-by-step indicators to render styled step block cards
            const stepMatch = paraText.match(/^\s*Step\s+(\d+)\s*:\s*(.+)$/i);
            if (stepMatch) {
                const stepNum = stepMatch[1];
                const stepContent = stepMatch[2];
                return (
                    <div className="flex gap-3 items-start border-l-3 border-blue-500 bg-blue-50/15 dark:bg-blue-950/10 p-3.5 rounded-r-xl my-2.5 shadow-3xs">
                        <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white font-mono shadow-3xs select-none mt-0.5">
                            {stepNum}
                        </span>
                        <div className="flex-1">
                            <strong className="text-slate-850 dark:text-white font-extrabold text-xs block mb-1">
                                STEP {stepNum}
                            </strong>
                            <div className="text-slate-650 dark:text-slate-350 leading-relaxed font-semibold text-xs">
                                {renderRichParagraphContent(stepContent)}
                            </div>
                        </div>
                    </div>
                );
            }

            // Strict 1-liner comment: Match mental math shortcut triggers to render stylized tips cards
            const shortcutMatch = paraText.match(/^\s*(🧠\s*)?(Mental Math Shortcut|Fast Track|Shortcut)\s*:\s*(.+)$/i);
            if (shortcutMatch) {
                const title = shortcutMatch[2];
                const shortcutContent = shortcutMatch[3];
                return (
                    <div className="flex gap-3 items-start border-l-3 border-amber-500 bg-amber-50/15 dark:bg-amber-950/10 p-3.5 rounded-r-xl my-3 shadow-3xs">
                        <span className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-3xs select-none text-[11px] mt-0.5">
                            🧠
                        </span>
                        <div className="flex-1">
                            <strong className="text-amber-850 dark:text-amber-300 font-extrabold text-xs block mb-1 tracking-wider uppercase font-heading">
                                {title}
                            </strong>
                            <div className="text-slate-655 dark:text-slate-350 leading-relaxed font-bold text-xs">
                                {renderRichParagraphContent(shortcutContent)}
                            </div>
                        </div>
                    </div>
                );
            }

            return (
                <p className={defaultClass}>
                    {renderRichParagraphContent(paraText)}
                </p>
            );
        };

        return (
            <div className="flex flex-col gap-3.5">
                {introLines.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {introLines.map((line, idx) => (
                            <React.Fragment key={idx}>
                                {renderRichParagraph(line, "text-[18px] font-extrabold text-slate-850 dark:text-slate-100 leading-relaxed")}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {listItems.length > 0 && (
                    <div className="flex flex-col gap-2.5 my-2 pl-1">
                        {listItems.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/40 p-3 hover:border-slate-200 transition dark:border-slate-900/60 dark:bg-slate-900/10">
                                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                    {item.marker.replace('.', '')}
                                </span>
                                <div className="flex-1 mt-0.5">
                                    {renderRichParagraph(item.text, "text-base font-semibold leading-relaxed text-slate-700 dark:text-slate-300")}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {outroLines.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {outroLines.map((line, idx) => (
                            <React.Fragment key={idx}>
                                {renderRichParagraph(line, "text-[18px] font-extrabold text-slate-850 dark:text-slate-100 leading-relaxed")}
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
            <div className="my-4 overflow-x-auto rounded-xl border border-slate-150 shadow-3xs dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-150 dark:bg-slate-900/30 dark:border-slate-800">
                            {headers.map((h, i) => (
                                <th key={i} className="px-4 py-3 font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
                        {dataRows.map((row, ri) => (
                            <tr key={ri} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
                                {row.map((cell, ci) => (
                                    <td key={ci} className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-350 leading-relaxed">{cell}</td>
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

interface ExamIndexProps {
    questions: Question[];
    categories: CategoryItem[];
    tracks: TrackConfigItem[];
    exams: { id: number; title: string; questions: number }[];
    savedAttempt?: {
        id: number;
        category_id: number | null;
        question_ids?: number[];
        answers: Record<number, number>;
        cat_scores: any;
        created_at: string;
    } | null;
    retakeSource?: {
        attempt_id: number;
        question_ids: number[];
        track: string;
        mode: 'same' | 'fresh';
    } | null;
    seenQuestionIdsByTrack?: {
        Professional: number[];
        Subprofessional: number[];
        Drill: number[];
    };
}

/** Formats seconds for display; matches history table rules (seconds if under 1m). */
function formatDuration(secs: number, includeSecs = true): string {
    const clamped = Math.max(0, Math.floor(secs));
    if (clamped === 0) return '0s';

    const h = Math.floor(clamped / 3600);
    const m = Math.floor((clamped % 3600) / 60);
    const s = clamped % 60;

    if (!includeSecs) {
        if (clamped < 60) return `${clamped}s`;
        const parts: string[] = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        return parts.join(' ') || '0s';
    }

    const parts: string[] = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    return parts.join(' ') || '0s';
}

function shuffleOptionsForQuestion(q: Question): Question {
    const originalOptions = [...q.options];
    const originalCorrectText = originalOptions[q.correct_option];
    const optionsWithIndex = originalOptions.map((opt, idx) => ({ opt, idx }));
    const shuffledOptionsWithIndex = [...optionsWithIndex].sort(() => Math.random() - 0.5);
    const shuffledOptions = shuffledOptionsWithIndex.map(o => o.opt);
    const originalIndices = shuffledOptionsWithIndex.map(o => o.idx);
    const newCorrectIdx = shuffledOptions.indexOf(originalCorrectText);

    return {
        ...q,
        options: shuffledOptions,
        correct_option: newCorrectIdx >= 0 ? newCorrectIdx : q.correct_option,
        originalOptionIndices: originalIndices,
    };
}

// 20 Official Demographic Profile Questions (Unscored)
const demographicQuestions: Question[] = [
    {
        id: 9001,
        stem: "What is your gender?",
        options: ["Male", "Female"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9002,
        stem: "What is your current civil status?",
        options: ["Single", "Married", "Widowed", "Separated/Divorced"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9003,
        stem: "Which age group do you belong to?",
        options: ["Below 18 years old", "18 to 24 years old", "25 to 34 years old", "35 to 44 years old", "45 years old and above"],
        correct_option: 1,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9004,
        stem: "What is your highest educational attainment?",
        options: ["High School Graduate", "College Undergraduate", "College Graduate (Bachelor's Degree)", "With Master's Units / Master's Degree", "With Doctorate Units / Doctorate Degree"],
        correct_option: 2,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Educational Attainment",
        isDemographic: true
    },
    {
        id: 9005,
        stem: "What type of school did you graduate from / are you currently attending?",
        options: ["Public / Government School", "Private Sectarian School", "Private Non-Sectarian School"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Educational Attainment",
        isDemographic: true
    },
    {
        id: 9006,
        stem: "What is your current employment status?",
        options: ["Unemployed", "Self-employed / Business Owner", "Employed in the Government sector", "Employed in the Private sector"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Employment Status",
        isDemographic: true
    },
    {
        id: 9007,
        stem: "If currently working in the government, what is your status of appointment?",
        options: ["Not Applicable (Not in government)", "Permanent", "Temporary", "Coterminous", "Contract of Service / Job Order / Casual"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Employment Status",
        isDemographic: true
    },
    {
        id: 9008,
        stem: "How long have you been serving in the government sector?",
        options: ["Not Applicable / Less than 1 year", "1 to 4 years", "5 to 9 years", "10 to 14 years", "15 years and above"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Employment Status",
        isDemographic: true
    },
    {
        id: 9009,
        stem: "What is your primary reason for taking the Civil Service Examination?",
        options: ["To obtain eligibility for permanent government appointment", "For promotion or career advancement", "To enter public service for the first time", "Personal challenge / satisfaction"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Exam Purpose",
        isDemographic: true
    },
    {
        id: 9010,
        stem: "How many times have you taken this particular level of examination (excluding this attempt)?",
        options: ["First time", "1 time", "2 times", "3 times", "4 or more times"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Exam History",
        isDemographic: true
    },
    {
        id: 9011,
        stem: "How did you prepare for this examination?",
        options: ["Self-review using books, apps, and online resources", "Attended a formal review program / review center", "Group study with friends/colleagues", "No formal preparation"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Preparation",
        isDemographic: true
    },
    {
        id: 9012,
        stem: "Which regional area do you currently reside in?",
        options: ["National Capital Region (NCR)", "Luzon (Regions I - V, CAR)", "Visayas (Regions VI - VIII)", "Mindanao (Regions IX - XIII, BARMM)"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9013,
        stem: "What is your primary language or dialect spoken at home?",
        options: ["English", "Tagalog / Filipino", "Cebuano / Bisaya", "Ilocano", "Hiligaynon / Ilonggo", "Other regional languages"],
        correct_option: 1,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9014,
        stem: "Are you a member of any indigenous cultural community or ethnic group?",
        options: ["Yes", "No"],
        correct_option: 1,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9015,
        stem: "How do you rate your overall familiarity with computer systems and online exams?",
        options: ["Highly familiar and comfortable", "Moderately comfortable", "Slightly comfortable", "Not familiar / uncomfortable"],
        correct_option: 0,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9016,
        stem: "What is your father's primary field of occupation?",
        options: ["Government Employee", "Private Employee", "Self-employed / Business Owner", "Farmer / Fisherman / Manual Laborer", "Unemployed / Retired / Deceased"],
        correct_option: 2,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Family Background",
        isDemographic: true
    },
    {
        id: 9017,
        stem: "What is your mother's primary field of occupation?",
        options: ["Government Employee", "Private Employee", "Self-employed / Business Owner", "Homemaker / Housewife", "Unemployed / Retired / Deceased"],
        correct_option: 3,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Family Background",
        isDemographic: true
    },
    {
        id: 9018,
        stem: "Do you have any physical challenges or require special assistance during the exam?",
        options: ["Yes, visual challenge", "Yes, hearing challenge", "Yes, mobility challenge", "No challenge / does not require assistance"],
        correct_option: 3,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9019,
        stem: "What is your current monthly family income range?",
        options: ["Below ₱15,000", "₱15,000 to ₱30,000", "₱30,001 to ₱60,000", "₱60,001 to ₱100,000", "Above ₱100,000"],
        correct_option: 1,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Personal Information",
        isDemographic: true
    },
    {
        id: 9020,
        stem: "How did you find out about this review platform?",
        options: ["Search engine (Google, etc.)", "Social media (Facebook, TikTok, etc.)", "Recommendation from a friend/colleague", "School or government announcement"],
        correct_option: 1,
        explanation: "Demographic Profile question.",
        category: "Demographic Profile",
        subcategory: "Preparation",
        isDemographic: true
    }
];

// Highly comprehensive premium fallback questions to self-heal empty databases
const fallbackQuestions: Question[] = [
    {
        id: 101,
        stem: "Under the strict scrutiny standard of review applied in Equal Protection Clause jurisprudence, a government classification must be narrowly tailored to achieve a compelling governmental interest. Which of the following classifications is universally subject to strict scrutiny by the Supreme Court?",
        options: [
            "Classifications based on age, specifically mandatory retirement ages for public employees.",
            "Classifications based on race, national origin, or alienage (when applied by state governments).",
            "Classifications based on gender or illegitimacy, recognizing historical disadvantages.",
            "Classifications based on wealth or economic status, concerning access to fundamental rights."
        ],
        correct_option: 1,
        explanation: "Classifications based on race, national origin, or alienage are suspect classifications under equal protection principles and are subject to strict scrutiny (requiring a compelling state interest and narrow tailoring).",
        category: "General Information",
        subcategory: "Philippine Constitution"
    },
    {
        id: 102,
        stem: "Which of the following describes the proper spelling and administrative usage according to CSC filing protocols?",
        options: [
            "Liaison officer assigned to the sub-professional division.",
            "Liason officer assigned to the sub-professsional division.",
            "Liasion officer assigned to the subprofessional division.",
            "Layason officer assigned to the subproffessional division."
        ],
        correct_option: 0,
        explanation: "The correct spelling is 'Liaison' and 'sub-professional' / 'subprofessional'. Liaison implies a close communication connection between departments.",
        category: "Clerical Ability",
        subcategory: "Spelling"
    },
    {
        id: 103,
        stem: "If the first term of an arithmetic progression is 4, and the 12th term is 48, what is the common difference of the sequence?",
        options: [
            "3.5",
            "4.0",
            "4.5",
            "5.0"
        ],
        correct_option: 1,
        explanation: "Using the arithmetic progression formula: An = A1 + (n - 1)d. Here, 48 = 4 + 11d => 44 = 11d => d = 4.",
        category: "Numerical Ability",
        subcategory: "Number sequence"
    },
    {
        id: 104,
        stem: "Identify the correct word relationship: ATTORNEY is to COURT as TEACHER is to _______.",
        options: [
            "PUPIL",
            "CLASSROOM",
            "BLACKBOARD",
            "CHALK"
        ],
        correct_option: 1,
        explanation: "This is a worker-to-workplace analogy. An attorney works in a court; a teacher works in a classroom.",
        category: "Analytical Ability",
        subcategory: "Word analogy"
    },
    {
        id: 105,
        stem: "Which of the following sentences exhibits the most grammatically correct use of punctuation?",
        options: [
            "The committee, having reviewed the proposal decided to approve it immediately.",
            "The committee, having reviewed the proposal, decided to approve it immediately.",
            "The committee having reviewed the proposal, decided to approve it immediately.",
            "The committee having reviewed the proposal decided to approve it immediately."
        ],
        correct_option: 1,
        explanation: "The non-restrictive participial phrase 'having reviewed the proposal' should be completely set off by commas on both sides.",
        category: "Verbal Ability",
        subcategory: "Sentence structure"
    },
    {
        id: 106,
        stem: "Under Republic Act 6713, public officials and employees shall perform their duties with the highest degree of professionalism, intelligence, and skill. This code of conduct is officially known as:",
        options: [
            "The Civil Service Anti-Red Tape Act",
            "The Ombudsman Accountability Charter",
            "Code of Conduct and Ethical Standards for Public Officials and Employees",
            "Public Officers Administrative Liability Act"
        ],
        correct_option: 2,
        explanation: "Republic Act No. 6713 is the Code of Conduct and Ethical Standards for Public Officials and Employees, governing transparency, accountability, and professional ethics.",
        category: "General Information",
        subcategory: "Code of Conduct and Ethical Standards (R.A. 6713)"
    },
    {
        id: 107,
        stem: "A government vehicle travels at 60 km/h for 2.5 hours and then at 80 km/h for 1.5 hours. What is the average speed of the vehicle for the entire journey?",
        options: [
            "65.5 km/h",
            "67.5 km/h",
            "70.0 km/h",
            "72.0 km/h"
        ],
        correct_option: 1,
        explanation: "Total distance = (60 * 2.5) + (80 * 1.5) = 150 + 120 = 270 km. Total time = 2.5 + 1.5 = 4 hours. Average speed = 270 / 4 = 67.5 km/h.",
        category: "Numerical Ability",
        subcategory: "Word problems"
    },
    {
        id: 108,
        stem: "If all examinees are civil service aspirants, and some aspirants are reviewees, which of the following statements must logically follow?",
        options: [
            "All civil service aspirants are examinees.",
            "Some examinees are reviewees.",
            "No reviewees are examinees.",
            "All reviewees are civil service aspirants."
        ],
        correct_option: 1,
        explanation: "Since all examinees are aspirants and some aspirants are reviewees, it logically follows that some examinees who overlap with the aspirants are reviewees.",
        category: "Analytical Ability",
        subcategory: "Symbolic logic / abstract reasoning"
    }
];

export default function ExamIndex({
    questions = [],
    categories = [],
    savedAttempt,
    retakeSource,
    seenQuestionIdsByTrack = { Professional: [], Subprofessional: [], Drill: [] },
}: ExamIndexProps) {
    const [selectedExamId, setSelectedExamId] = useState<number | null>(1);
    const [drillCategoryId, setDrillCategoryId] = useState<number | null>(null);
    const [drillCategoryName, setDrillCategoryName] = useState<string | null>(null);
    const [drillSubcategories, setDrillSubcategories] = useState<string[]>([]);
    const [drillLanguage, setDrillLanguage] = useState<string>('English');
    const [drillQuestionCount, setDrillQuestionCount] = useState<number | 'all'>(30);

    // Custom confirm modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'success',
        onConfirm: () => { },
    });

    // Core state variables managing the active exam simulation
    const [isExamActive, setIsExamActive] = useState(false);
    const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [flagged, setFlagged] = useState<Record<number, boolean>>({});
    const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

    // Filter of the sidebar question grid/palette
    const [selectedPaletteCategory, setSelectedPaletteCategory] = useState('All Categories');

    // Live countdown timer variables
    const [timeLeft, setTimeLeft] = useState<number>(11400); // 3h 10m default
    const [sessionTimeLimitSecs, setSessionTimeLimitSecs] = useState<number>(11400);
    const timeLeftRef = useRef(timeLeft);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isTimed, setIsTimed] = useState<boolean>(true);

    // Dynamic metrics configured to update the simulation parameters instantly
    const getSimulationDetails = useCallback((examId: number | null) => {
        if (examId === 1) {
            return {
                title: 'Professional Level Reviewer',
                totalItems: 170,
                scoredItems: 150,
                timeLimit: '3h 10m',
                timeLimitSecs: 11400,
                targetPace: '1.1 min/item',
                allowedCategories: ['General Information', 'Verbal Ability', 'Analytical Ability', 'Numerical Ability']
            };
        }
        if (examId === 2) {
            return {
                title: 'Sub-Professional Level Reviewer',
                totalItems: 165,
                scoredItems: 145,
                timeLimit: '2h 40m',
                timeLimitSecs: 9600,
                targetPace: '1.0 min/item',
                allowedCategories: ['General Information', 'Verbal Ability', 'Clerical Ability', 'Numerical Ability']
            };
        }
        // Custom Practice Drill specs
        return {
            title: drillCategoryName || savedAttempt?.cat_scores?.metadata?.category_name || 'Practice Drill',
            totalItems: activeQuestions.length || 30,
            scoredItems: activeQuestions.length || 30,
            timeLimit: formatDuration(sessionTimeLimitSecs || 0),
            timeLimitSecs: sessionTimeLimitSecs || 0,
            targetPace: '1.0 min/item',
            allowedCategories: categories.map(c => c.name)
        };
    }, [drillCategoryName, savedAttempt, activeQuestions, sessionTimeLimitSecs, categories]);

    const details = getSimulationDetails(selectedExamId);
    const isDrillSession = selectedExamId === null || selectedExamId > 2 || savedAttempt?.cat_scores?.metadata?.track === 'Drill' || drillCategoryName !== null;

    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    // Result review states
    const [isExamSubmitted, setIsExamSubmitted] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [reviewScreenActive, setReviewScreenActive] = useState(false);
    const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
    const [reviewCategoryFilter] = useState('All Categories');

    // Sync currentIdx with review filters dynamically
    useEffect(() => {
        if (!reviewScreenActive || !activeQuestions || activeQuestions.length === 0) return;
        const isCurrentIdxMatch = activeQuestions[currentIdx] && (() => {
            const q = activeQuestions[currentIdx];
            if (reviewCategoryFilter !== 'All Categories' && q.category !== reviewCategoryFilter) return false;
            const chosen = answers[currentIdx];
            const isCorrect = chosen === q.correct_option;
            if (reviewStatusFilter === 'correct' && !isCorrect) return false;
            if (reviewStatusFilter === 'incorrect' && isCorrect) return false;
            return true;
        })();

        if (!isCurrentIdxMatch) {
            // Find first match
            const firstMatchIdx = activeQuestions.findIndex((q, idx) => {
                if (reviewCategoryFilter !== 'All Categories' && q.category !== reviewCategoryFilter) return false;
                const chosen = answers[idx];
                const isCorrect = chosen === q.correct_option;
                if (reviewStatusFilter === 'correct' && !isCorrect) return false;
                if (reviewStatusFilter === 'incorrect' && isCorrect) return false;
                return true;
            });
            if (firstMatchIdx !== -1) {
                setTimeout(() => {
                    setCurrentIdx(firstMatchIdx);
                }, 0);
            }
        }
    }, [reviewCategoryFilter, reviewStatusFilter, reviewScreenActive, activeQuestions, currentIdx, answers]);

    const [showRetakeModal, setShowRetakeModal] = useState(false);
    const [submittedByTimer, setSubmittedByTimer] = useState(false);
    const [lastStoredAttemptId, setLastStoredAttemptId] = useState<number | null>(null);
    const [pendingRetake, setPendingRetake] = useState<{
        attemptId: number;
        questionIds: number[];
        examId: number | null;
    } | null>(null);

    const [results, setResults] = useState<{
        score: number;
        total: number;
        percentage: number;
        correctCount: number;
        wrongCount: number;
        skippedCount: number;
        categoryScoreMap: Record<string, {
            correct: number;
            total: number;
            subcats: Record<string, { correct: number; total: number }>
        }>;
        elapsedSecs: number;
    } | null>(null);

    // Auto-hydrate saved attempt when loaded via deep link
    useEffect(() => {
        if (savedAttempt) {
            // Reconstruct questions pool if some are missing from database (e.g. fallback questions)
            let loadedQuestions = [...questions];
            if (savedAttempt.question_ids && savedAttempt.question_ids.length > 0) {
                const missingIds = savedAttempt.question_ids.filter((id: number) => !loadedQuestions.some(q => q.id === id));
                missingIds.forEach((id: number) => {
                    const fallbackQ = fallbackQuestions.find(q => q.id === id);
                    if (fallbackQ) {
                        loadedQuestions.push(fallbackQ);
                    }
                });

                // Re-sort loadedQuestions to match savedAttempt.question_ids order exactly
                loadedQuestions = savedAttempt.question_ids.map((id: number) => {
                    return loadedQuestions.find(q => q.id === id) || fallbackQuestions.find(q => q.id === id);
                }).filter(Boolean) as Question[];
            }

            const catScores = savedAttempt.cat_scores ?? {};
            const meta = catScores.metadata ?? {};
            const correctCount = meta.correct_count || 0;
            const total = meta.total_questions || loadedQuestions.length;
            const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            const wrongCount = total - correctCount - (meta.skipped_count || 0);

            const isTimedSaved = meta.is_timed !== false;
            const isSubprofessional = meta.track === 'Subprofessional';
            const limitSecs = isTimedSaved ? (isSubprofessional ? 9000 : 11400) : 0;
            const storedDuration = Number(meta.duration_secs ?? catScores.duration_secs ?? 0);
            const elapsedSecs = isTimedSaved ? Math.min(limitSecs, Math.max(0, storedDuration)) : storedDuration;

            // Reconstruct a precise categoryScoreMap directly from loadedQuestions and savedAttempt.answers
            // to ensure subcategory breakdowns are ALWAYS fully populated and accurate, even for legacy or drill attempts!
            const computedCatMap: Record<string, {
                correct: number;
                total: number;
                subcats: Record<string, { correct: number; total: number }>
            }> = {};

            loadedQuestions.forEach((q, idx) => {
                const chosen = savedAttempt.answers[idx];
                const isCorrect = chosen === q.correct_option;

                // Exclude demographic questions from score calculation
                if (q.category === 'Demographic Profile' || q.isDemographic) {
                    return;
                }

                if (!computedCatMap[q.category]) {
                    computedCatMap[q.category] = { correct: 0, total: 0, subcats: {} };
                }
                computedCatMap[q.category].total += 1;

                const subcatName = q.subcategory || 'General Concepts';
                if (!computedCatMap[q.category].subcats[subcatName]) {
                    computedCatMap[q.category].subcats[subcatName] = { correct: 0, total: 0 };
                }
                computedCatMap[q.category].subcats[subcatName].total += 1;

                if (chosen !== undefined && isCorrect) {
                    computedCatMap[q.category].correct += 1;
                    computedCatMap[q.category].subcats[subcatName].correct += 1;
                }
            });

            // Use the computed map if the saved one lacks subcategory info
            let finalCatMap = savedAttempt.cat_scores?.categoryScoreMap || savedAttempt.cat_scores;
            const hasSubcats = finalCatMap && Object.values(finalCatMap).some((c: any) => c.subcats && Object.keys(c.subcats).length > 0);
            if (!hasSubcats || Object.keys(computedCatMap).length > 0) {
                finalCatMap = computedCatMap;
            }

            setTimeout(() => {
                setActiveQuestions(loadedQuestions);
                setAnswers(savedAttempt.answers);
                setIsTimed(isTimedSaved);
                if (meta.track === 'Drill') {
                    setSelectedExamId(null as any);
                    setDrillCategoryId(savedAttempt.category_id);
                    setDrillCategoryName(meta.category_name || 'Practice Drill');
                    setDrillSubcategories(meta.selected_subcategories || []);
                    setDrillLanguage(meta.language || 'English');
                    setDrillQuestionCount(meta.question_count || loadedQuestions.length);
                } else {
                    setSelectedExamId(isSubprofessional ? 2 : 1);
                }
                setSessionTimeLimitSecs(isTimedSaved ? limitSecs : 0);
                setTimeLeft(isTimedSaved ? Math.max(0, limitSecs - elapsedSecs) : elapsedSecs);

                setResults({
                    score: correctCount,
                    total,
                    percentage,
                    correctCount,
                    wrongCount,
                    skippedCount: meta.skipped_count || 0,
                    categoryScoreMap: finalCatMap,
                    elapsedSecs,
                });

                setIsExamSubmitted(true);
                setIsExamActive(false);

                // Activate review immediately if review=true is set in search query params
                const params = new URLSearchParams(window.location.search);
                if (params.get('review') === 'true') {
                    setReviewScreenActive(true);
                }
            }, 0);
        }
    }, [savedAttempt, questions]);

    // Dynamically update layout breadcrumbs at the top header
    useEffect(() => {
        if (isExamSubmitted && results) {
            const parentTitle = isDrillSession ? 'Practice' : 'Exams';
            const parentHref = isDrillSession ? '/drills' : '/exams';
            const attemptTitle = isDrillSession
                ? `Drill: ${drillCategoryName || savedAttempt?.cat_scores?.metadata?.category_name || 'Practice Drill'}`
                : `Exam Attempt #${savedAttempt?.id || lastStoredAttemptId || 104}`;

            if (savedAttempt) {
                if (reviewScreenActive) {
                    setTimeout(() => {
                        setLayoutProps({
                            breadcrumbs: [
                                { title: 'History', href: '/history' },
                                { title: attemptTitle, href: `/exams?attempt_id=${savedAttempt.id}` },
                                { title: 'Answer Review', href: '#' }
                            ]
                        });
                    }, 0);
                } else {
                    setTimeout(() => {
                        setLayoutProps({
                            breadcrumbs: [
                                { title: 'History', href: '/history' },
                                { title: attemptTitle, href: '#' }
                            ]
                        });
                    }, 0);
                }
            } else {
                if (reviewScreenActive) {
                    setTimeout(() => {
                        setLayoutProps({
                            breadcrumbs: [
                                { title: parentTitle, href: parentHref },
                                { title: 'History', href: '/history' },
                                { title: attemptTitle, href: `/exams?attempt_id=${lastStoredAttemptId || 104}` },
                                { title: 'Answer Review', href: '#' }
                            ]
                        });
                    }, 0);
                } else {
                    setTimeout(() => {
                        setLayoutProps({
                            breadcrumbs: [
                                { title: parentTitle, href: parentHref },
                                { title: 'History', href: '/history' },
                                { title: attemptTitle, href: '#' }
                            ]
                        });
                    }, 0);
                }
            }
        } else {
            setTimeout(() => {
                setLayoutProps({
                    breadcrumbs: [
                        { title: 'Exams', href: '/exams' }
                    ]
                });
            }, 0);
        }
    }, [isExamSubmitted, results, reviewScreenActive, savedAttempt, isDrillSession, drillCategoryName, lastStoredAttemptId]);



    const getActiveTimeLimitSecs = () =>
        isTimed ? (sessionTimeLimitSecs || details.timeLimitSecs) : 0;

    const getTrackNameForExam = (examId: number | null) =>
        examId === 2 ? 'Subprofessional' : 'Professional';

    const getSeenIdsForExam = useCallback((examId: number | null) => {
        const track = getTrackNameForExam(examId);
        const fromServer = seenQuestionIdsByTrack[track as keyof typeof seenQuestionIdsByTrack] ?? [];
        const fromCurrentSession =
            selectedExamId === examId && activeQuestions.length > 0
                ? activeQuestions.map(q => q.id)
                : [];
        return [...new Set([...fromServer, ...fromCurrentSession])];
    }, [seenQuestionIdsByTrack, selectedExamId, activeQuestions]);

    const buildFreshExamPool = useCallback((examId: number | null) => {
        // 1. Gather all source questions
        let sourcePool = questions.length > 0 ? questions : fallbackQuestions;

        // Separate categories
        const verbalPool = sourcePool.filter(q => q.category === 'Verbal Ability');
        const analyticalPool = sourcePool.filter(q => q.category === 'Analytical Ability');
        const numericalPool = sourcePool.filter(q => q.category === 'Numerical Ability');
        const clericalPool = sourcePool.filter(q => q.category === 'Clerical Ability');
        const generalPool = sourcePool.filter(q => q.category === 'General Information');

        const seenSet = new Set(getSeenIdsForExam(examId));

        const pickFromCategory = (pool: Question[], targetCount: number, catName: string) => {
            // Priority 1: Unseen questions in this category
            const unseen = pool.filter(q => !seenSet.has(q.id));
            const seen = pool.filter(q => seenSet.has(q.id));

            let picked = [...unseen].sort(() => Math.random() - 0.5);
            if (picked.length < targetCount) {
                const shuffledSeen = [...seen].sort(() => Math.random() - 0.5);
                picked = [...picked, ...shuffledSeen.slice(0, targetCount - picked.length)];
            }

            // Fallback: if we still don't have enough, pull from fallbackQuestions for this category
            if (picked.length < targetCount) {
                const fbPool = fallbackQuestions.filter(q => q.category === catName && !picked.some(p => p.id === q.id));
                picked = [...picked, ...[...fbPool].sort(() => Math.random() - 0.5).slice(0, targetCount - picked.length)];
            }

            // Absolute fallback: duplicate questions if still short
            while (picked.length < targetCount && picked.length > 0) {
                picked.push(picked[Math.floor(Math.random() * picked.length)]);
            }

            return picked.slice(0, targetCount);
        };

        let scoredPool: Question[] = [];
        if (examId === 1) {
            // Professional: 150 scored items
            const verbal = pickFromCategory(verbalPool, 45, 'Verbal Ability');
            const analytical = pickFromCategory(analyticalPool, 52, 'Analytical Ability');
            const numerical = pickFromCategory(numericalPool, 45, 'Numerical Ability');
            const general = pickFromCategory(generalPool, 8, 'General Information');

            // Group by category, but keep category blocks in a randomized order, and shuffle questions within each category block
            const categoriesToPool = [verbal, analytical, numerical, general].filter(c => c.length > 0).sort(() => Math.random() - 0.5);
            categoriesToPool.forEach(catPool => {
                scoredPool.push(...catPool);
            });
        } else {
            // Subprofessional: 145 scored items
            const verbal = pickFromCategory(verbalPool, 45, 'Verbal Ability');
            const clerical = pickFromCategory(clericalPool, 47, 'Clerical Ability');
            const numerical = pickFromCategory(numericalPool, 45, 'Numerical Ability');
            const general = pickFromCategory(generalPool, 8, 'General Information');

            // Group by category, but keep category blocks in a randomized order, and shuffle questions within each category block
            const categoriesToPool = [verbal, clerical, numerical, general].filter(c => c.length > 0).sort(() => Math.random() - 0.5);
            categoriesToPool.forEach(catPool => {
                scoredPool.push(...catPool);
            });
        }

        // Shuffled 20 demographic questions
        const shuffledDemographics = [...demographicQuestions].sort(() => Math.random() - 0.5);

        // DEMOGRAPHICS MUST BE PUT AT THE START ALWAYS!
        const finalPool = [...shuffledDemographics, ...scoredPool];

        return finalPool.map(shuffleOptionsForQuestion);
    }, [questions, getSeenIdsForExam]);

    const buildSameExamPool = useCallback((questionIds: number[]) => {
        let sourcePool = [...questions, ...demographicQuestions];
        if (questions.length === 0) {
            sourcePool = [...fallbackQuestions, ...demographicQuestions];
        }
        const missingIds = questionIds.filter(id => !sourcePool.some(q => q.id === id));
        missingIds.forEach(id => {
            const fallbackQ = [...fallbackQuestions, ...demographicQuestions].find(q => q.id === id);
            if (fallbackQ) sourcePool = [...sourcePool, fallbackQ];
        });
        return questionIds
            .map(id => sourcePool.find(q => q.id === id) || [...fallbackQuestions, ...demographicQuestions].find(q => q.id === id))
            .filter((q): q is Question => Boolean(q))
            .map(shuffleOptionsForQuestion);
    }, [questions]);

    const beginExamSession = useCallback((examPool: Question[], examId: number | null) => {
        const specs = getSimulationDetails(examId);
        const isDrill = examId === null || examId > 2;

        setSelectedExamId(examId);
        setIsTimed(true); // Regular exams are always timed
        setActiveQuestions(examPool);
        setCurrentIdx(0);
        setAnswers({});
        setFlagged({});
        setSelectedPaletteCategory('All Categories');

        const limitSecs = isDrill ? (examPool.length * 60) : specs.timeLimitSecs;
        setSessionTimeLimitSecs(limitSecs);
        setTimeLeft(limitSecs);
        timeLeftRef.current = limitSecs;

        setIsExamActive(true);
        setIsExamSubmitted(false);
        setReviewScreenActive(false);
        setResults(null);
        setSubmittedByTimer(false);
        setShowRetakeModal(false);
    }, [getSimulationDetails]);

    const getRetakeContext = () => {
        if (pendingRetake) return pendingRetake;
        if (savedAttempt?.question_ids?.length) {
            const meta = savedAttempt.cat_scores?.metadata || {};
            const examId = meta.track === 'Subprofessional' ? 2 : 1;
            return {
                attemptId: savedAttempt.id,
                questionIds: savedAttempt.question_ids,
                examId,
            };
        }
        if (lastStoredAttemptId && activeQuestions.length > 0) {
            return {
                attemptId: lastStoredAttemptId,
                questionIds: activeQuestions.map(q => q.id),
                examId: selectedExamId,
            };
        }
        return null;
    };

    const handleRetakeSame = () => {
        const ctx = getRetakeContext();
        if (!ctx || ctx.questionIds.length === 0) return;
        const originalIsTimed = savedAttempt
            ? (savedAttempt.cat_scores?.metadata?.is_timed !== false)
            : isTimed;
        beginExamSession(buildSameExamPool(ctx.questionIds), ctx.examId);
        setIsTimed(originalIsTimed);
        if (!originalIsTimed) {
            setSessionTimeLimitSecs(0);
            setTimeLeft(0);
            timeLeftRef.current = 0;
        }
    };

    const handleRetakeFresh = () => {
        const ctx = getRetakeContext();
        if (!ctx) return;
        const originalIsTimed = savedAttempt
            ? (savedAttempt.cat_scores?.metadata?.is_timed !== false)
            : isTimed;

        let finalPool = [];
        if (ctx.examId === null || ctx.examId > 2) {
            // For custom drills, select fresh randomized questions from the same category config
            const catName = drillCategoryName?.replace(' Practice', '') || savedAttempt?.cat_scores?.metadata?.category_name || 'General Information';
            let sourcePool = questions.length > 0 ? questions : fallbackQuestions;
            let pool = sourcePool.filter(q => {
                const catMatch = q.category.toLowerCase().includes(catName.toLowerCase()) ||
                    catName.toLowerCase().includes(q.category.toLowerCase());
                const subcatMatch = drillSubcategories.length === 0 || drillSubcategories.some(subName => q.subcategory.toLowerCase().includes(subName.toLowerCase()) || subName.toLowerCase().includes(q.subcategory.toLowerCase()));

                let langMatch = true;
                if (drillLanguage === 'English') langMatch = q.language === 'English' || !q.language;
                else if (drillLanguage === 'Filipino') langMatch = q.language === 'Filipino';

                return catMatch && subcatMatch && langMatch;
            });
            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            const countLimit = drillQuestionCount === 'all' ? shuffled.length : Number(drillQuestionCount || 30);
            finalPool = shuffled.slice(0, Math.min(countLimit, shuffled.length)).map(shuffleOptionsForQuestion);
        } else {
            finalPool = buildFreshExamPool(ctx.examId);
        }

        beginExamSession(finalPool, ctx.examId);
        setIsTimed(originalIsTimed);
        if (!originalIsTimed) {
            setSessionTimeLimitSecs(0);
            setTimeLeft(0);
            timeLeftRef.current = 0;
        }
    };

    // Initialize the active exam session and randomize dynamic questions set
    const handleBeginExam = () => {
        beginExamSession(buildFreshExamPool(selectedExamId), selectedExamId);
    };

    // Auto-start exam session when passed from dashboard/drill deep links
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const startType = params.get('start');
        const isDrillStart = params.get('drill') === 'true';

        if (startType && !savedAttempt) {
            const examId = startType === 'subprofessional' ? 2 : 1;
            const url = new URL(window.location.href);
            url.searchParams.delete('start');
            window.history.replaceState({}, '', url.toString());

            setTimeout(() => {
                setSelectedExamId(examId);
                beginExamSession(buildFreshExamPool(examId), examId);
            }, 0);
        } else if (isDrillStart && !savedAttempt) {
            const catName = params.get('category_name') || 'General Information';
            const catId = params.get('category_id') ? Number(params.get('category_id')) : null;
            const qCountParam = params.get('question_count') || '30';
            const lang = params.get('language') || 'English';
            const subcatsStr = params.get('subcategories');
            const isTimedParam = params.get('timed') !== 'false';
            let subcats: string[] = [];
            if (subcatsStr) {
                try {
                    subcats = JSON.parse(subcatsStr);
                } catch {
                    /* ignore parsing errors */
                }
            }

            // Clean query params from URL
            const url = new URL(window.location.href);
            url.searchParams.delete('drill');
            url.searchParams.delete('category_id');
            url.searchParams.delete('category_name');
            url.searchParams.delete('question_count');
            url.searchParams.delete('language');
            url.searchParams.delete('subcategories');
            url.searchParams.delete('timed');
            window.history.replaceState({}, '', url.toString());

            // Build Drill Pool
            let sourcePool = questions.length > 0 ? questions : fallbackQuestions;

            let pool = sourcePool.filter(q => {
                const catMatch = q.category.toLowerCase().includes(catName.toLowerCase()) ||
                    catName.toLowerCase().includes(q.category.toLowerCase());
                const subcatMatch = subcats.length === 0 || subcats.some(subName => q.subcategory.toLowerCase().includes(subName.toLowerCase()) || subName.toLowerCase().includes(q.subcategory.toLowerCase()));

                let langMatch = true;
                if (lang === 'English') langMatch = q.language === 'English' || !q.language;
                else if (lang === 'Filipino') langMatch = q.language === 'Filipino';

                return catMatch && subcatMatch && langMatch;
            });

            if (pool.length === 0) {
                pool = sourcePool.filter(q => q.category.toLowerCase().includes(catName.toLowerCase()) ||
                    catName.toLowerCase().includes(q.category.toLowerCase()));
            }

            if (pool.length === 0) {
                pool = sourcePool.slice(0, 30);
            }

            const shuffled = [...pool].sort(() => Math.random() - 0.5);
            const countLimit = qCountParam === 'all' ? shuffled.length : Number(qCountParam);
            const finalPool = shuffled.slice(0, Math.min(countLimit, shuffled.length)).map(shuffleOptionsForQuestion);

            const limitSecs = isTimedParam ? finalPool.length * 60 : 0;

            setTimeout(() => {
                setDrillCategoryId(catId);
                setDrillCategoryName(`${catName} Practice`);
                setDrillSubcategories(subcats);
                setDrillLanguage(lang);
                setDrillQuestionCount(qCountParam === 'all' ? 'all' : Number(qCountParam));

                // Trigger drill session
                setSelectedExamId(null as any);
                setIsTimed(isTimedParam);
                setActiveQuestions(finalPool);
                setCurrentIdx(0);
                setAnswers({});
                setFlagged({});
                setSelectedPaletteCategory('All Categories');
                setSessionTimeLimitSecs(limitSecs);
                setTimeLeft(isTimedParam ? limitSecs : 0);
                timeLeftRef.current = isTimedParam ? limitSecs : 0;
                setIsExamActive(true);
                setIsExamSubmitted(false);
                setReviewScreenActive(false);
                setResults(null);
                setSubmittedByTimer(false);
                setShowRetakeModal(false);

                setLayoutProps({
                    breadcrumbs: [
                        { title: 'Practice', href: '/drills' },
                        { title: `${catName} Active Practice`, href: '#' }
                    ]
                });
            }, 0);
        }
    }, [questions, savedAttempt, beginExamSession, buildFreshExamPool]);

    // Auto-start retake when choice was made on the history page
    useEffect(() => {
        if (!retakeSource?.mode || savedAttempt) return;

        const isDrill = retakeSource.track === 'Drill';
        const examId = isDrill ? null : (retakeSource.track === 'Subprofessional' ? 2 : 1);

        setTimeout(() => {
            setPendingRetake({
                attemptId: retakeSource.attempt_id,
                questionIds: retakeSource.question_ids,
                examId,
            });

            if (retakeSource.mode === 'same') {
                beginExamSession(buildSameExamPool(retakeSource.question_ids), examId);
            } else {
                if (isDrill) {
                    // Strict 1-liner comment: Resolve original category from retake pool to draw a fresh randomized sample
                    const oldQuestions = retakeSource.question_ids.map(id => questions.find(q => q.id === id) || fallbackQuestions.find(q => q.id === id)).filter((q): q is Question => Boolean(q));
                    const catName = oldQuestions[0]?.category || 'General Information';
                    let sourcePool = questions.length > 0 ? questions : fallbackQuestions;
                    let pool = sourcePool.filter(q => q.category === catName);
                    const shuffled = [...pool].sort(() => Math.random() - 0.5);
                    const countLimit = retakeSource.question_ids.length;
                    const freshPool = shuffled.slice(0, countLimit).map(shuffleOptionsForQuestion);
                    beginExamSession(freshPool, null);
                } else {
                    beginExamSession(buildFreshExamPool(examId), examId);
                }
            }
        }, 0);

        const url = new URL(window.location.href);
        url.searchParams.delete('retake_same');
        url.searchParams.delete('retake_fresh');
        window.history.replaceState({}, '', url.toString());
    }, [retakeSource, savedAttempt, questions, beginExamSession, buildSameExamPool, buildFreshExamPool]);

    const handleSubmitExamRef = useRef<(auto?: boolean) => void>(() => { });

    // Live countdown interval handler — auto-submits and shows scorecard when time runs out
    useEffect(() => {
        if (isExamActive && !isExamSubmitted) {
            timerRef.current = setInterval(() => {
                if (isTimed) {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            clearInterval(timerRef.current!);
                            timeLeftRef.current = 0;
                            handleSubmitExamRef.current(true);
                            return 0;
                        }
                        const next = prev - 1;
                        timeLeftRef.current = next;
                        return next;
                    });
                } else {
                    setTimeLeft(prev => {
                        const next = prev + 1;
                        timeLeftRef.current = next;
                        return next;
                    });
                }
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isExamActive, isExamSubmitted, isTimed]);

    // Format remaining seconds into HH:MM:SS string
    const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Toggle Review flags
    const toggleFlag = (qIndex: number) => {
        setFlagged(prev => ({
            ...prev,
            [qIndex]: !prev[qIndex]
        }));
    };

    // Handle Option Selection
    const handleSelectOption = (optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [currentIdx]: optionIndex
        }));
    };


    const executeSubmit = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let skippedCount = 0;
        const catMap: Record<string, {
            correct: number;
            total: number;
            subcats: Record<string, { correct: number; total: number }>
        }> = {};

        activeQuestions.forEach((q, idx) => {
            const chosen = answers[idx];
            const isCorrect = chosen === q.correct_option;

            // Exclude demographic questions from score calculation
            if (q.category === 'Demographic Profile' || q.isDemographic) {
                return;
            }

            if (!catMap[q.category]) {
                catMap[q.category] = { correct: 0, total: 0, subcats: {} };
            }
            catMap[q.category].total += 1;

            const subcatName = q.subcategory || 'General Concepts';
            if (!catMap[q.category].subcats[subcatName]) {
                catMap[q.category].subcats[subcatName] = { correct: 0, total: 0 };
            }
            catMap[q.category].subcats[subcatName].total += 1;

            if (chosen === undefined) {
                skippedCount++;
            } else if (isCorrect) {
                correctCount++;
                score++;
                catMap[q.category].correct += 1;
                catMap[q.category].subcats[subcatName].correct += 1;
            } else {
                wrongCount++;
            }
        });

        const scoredItemsCount = activeQuestions.filter(q => !(q.category === 'Demographic Profile' || q.isDemographic)).length || 1;
        const percentage = Math.round((score / scoredItemsCount) * 100);
        const limitSecs = sessionTimeLimitSecs || details.timeLimitSecs;
        const elapsedSecs = isTimed
            ? Math.min(limitSecs, Math.max(0, limitSecs - timeLeftRef.current))
            : timeLeftRef.current;

        setResults({
            score,
            total: scoredItemsCount,
            percentage,
            correctCount,
            wrongCount,
            skippedCount,
            categoryScoreMap: catMap,
            elapsedSecs,
        });

        setIsExamSubmitted(true);
        setIsExamActive(false);

        // Persist attempt in DB in background
        const durationSecs = elapsedSecs;
        const isDrillSession = selectedExamId === null || drillCategoryName !== null;
        const trackName = isDrillSession ? 'Drill' : (details.title.includes('Sub-Professional') ? 'Subprofessional' : 'Professional');
        const finalCategoryId = isDrillSession ? (drillCategoryId || savedAttempt?.category_id || null) : null;
        const finalCategoryName = isDrillSession ? (drillCategoryName || savedAttempt?.cat_scores?.metadata?.category_name || 'Practice Drill') : details.title;

        // Map the answers array back to original unshuffled options indices for backend DB persistence
        const originalAnswers: Record<number, number> = {};
        Object.entries(answers).forEach(([key, chosenIndex]) => {
            const idx = Number(key);
            const q = activeQuestions[idx];
            if (chosenIndex !== undefined && q && q.originalOptionIndices) {
                originalAnswers[idx] = q.originalOptionIndices[chosenIndex];
            } else {
                originalAnswers[idx] = chosenIndex;
            }
        });

        const payload = {
            category_id: finalCategoryId,
            question_ids: activeQuestions.map(q => q.id),
            answers: originalAnswers,
            cat_scores: {
                categoryScoreMap: catMap,
                metadata: {
                    track: trackName,
                    category_name: finalCategoryName,
                    correct_count: correctCount,
                    total_questions: scoredItemsCount,
                    skipped_count: skippedCount,
                    duration_secs: durationSecs,
                    is_timed: isTimed,
                    selected_subcategories: isDrillSession ? (drillSubcategories.length > 0 ? drillSubcategories : undefined) : undefined,
                    language: isDrillSession ? drillLanguage : undefined,
                    question_count: isDrillSession ? (drillQuestionCount === 'all' ? 'all' : drillQuestionCount) : undefined,
                }
            }
        };

        fetch('/exams/attempts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
            },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                if (data.attempt_id) {
                    setLastStoredAttemptId(data.attempt_id);
                }
            })
            .catch(err => {
                console.error('Failed to persist attempt:', err);
            });

    }, [
        activeQuestions,
        answers,
        sessionTimeLimitSecs,
        details,
        isTimed,
        selectedExamId,
        drillCategoryName,
        drillCategoryId,
        savedAttempt,
        drillSubcategories,
        drillLanguage,
        drillQuestionCount,
        setResults,
        setIsExamSubmitted,
        setIsExamActive,
        setLastStoredAttemptId
    ]);

    // Submit Exam & calculate grade breakdown
    const handleSubmitExam = useCallback((auto = false) => {
        if (auto) {
            setSubmittedByTimer(true);
        }

        if (!auto) {
            const totalQuestions = activeQuestions.length;
            const answeredCount = Object.keys(answers).filter(key => answers[Number(key)] !== undefined).length;
            const unansweredCount = totalQuestions - answeredCount;

            let confirmMsg = 'Are you sure you want to finish and submit your exam?';
            let title = 'Submit Exam?';
            if (unansweredCount > 0) {
                confirmMsg = `⚠️ WARNING: You have ${unansweredCount} unanswered questions out of ${totalQuestions} total questions. Unanswered questions will be marked as incorrect.\n\nAre you absolutely sure you want to submit the exam now?`;
                title = 'Submit with Unanswered Items?';
            } else {
                confirmMsg = 'All questions have been answered! Are you ready to submit your exam and view your scorecard?';
                title = 'Ready to Submit?';
            }

            setConfirmModal({
                isOpen: true,
                title,
                message: confirmMsg,
                confirmLabel: 'Yes, Submit',
                variant: unansweredCount > 0 ? 'danger' : 'success',
                onConfirm: () => {
                    executeSubmit();
                }
            });
            return;
        }

        executeSubmit();
    }, [activeQuestions, answers, executeSubmit]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        handleSubmitExamRef.current = handleSubmitExam;
    }, [handleSubmitExam]);

    // Exit back to config
    const handleExitExam = () => {
        if (savedAttempt && isExamSubmitted) {
            if (isDrillSession) {
                router.get('/drills');
            } else {
                router.get('/history');
            }
            return;
        }
        if (!isExamSubmitted) {
            setConfirmModal({
                isOpen: true,
                title: 'Exit Active Session?',
                message: 'Are you sure you want to exit? Your active progress on this attempt will be permanently lost.',
                confirmLabel: 'Yes, Exit',
                variant: 'danger',
                onConfirm: () => {
                    if (isDrillSession) {
                        router.get('/drills');
                        return;
                    }

                    setIsExamActive(false);
                    setIsExamSubmitted(false);
                    setResults(null);
                    setShowRetakeModal(false);
                }
            });
            return;
        }

        if (isDrillSession) {
            router.get('/drills');
            return;
        }

        setIsExamActive(false);
        setIsExamSubmitted(false);
        setResults(null);
        setShowRetakeModal(false);
    };

    const retakeModal = showRetakeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    {isDrillSession ? 'Retake Drill' : 'Retake Exam'}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Choose whether to practice the same questions again or generate a new randomized set.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={handleRetakeSame}
                        className="cursor-pointer flex w-full flex-col items-start rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                    >
                        <span className="text-xs font-black text-slate-900 dark:text-white">Same question set</span>
                        <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Repeat the exact questions from this attempt (questions and choices reshuffled).
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={handleRetakeFresh}
                        className="cursor-pointer flex w-full flex-col items-start rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-3 text-left transition hover:border-blue-400 hover:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20"
                    >
                        <span className="text-xs font-black text-blue-700 dark:text-blue-400">Fresh question set</span>
                        <span className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Unused questions first for this track; reuses earlier ones only when the bank runs out.
                        </span>
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => setShowRetakeModal(false)}
                    className="mt-4 w-full rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400"
                >
                    Cancel
                </button>
            </div>
        </div>
    );

    const customConfirmModal = confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950 animate-in zoom-in-95 duration-205"
                role="dialog"
                aria-modal="true"
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                    className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-900 dark:hover:text-slate-200 transition focus:outline-none"
                    aria-label="Close dialog"
                >
                    <X className="size-4.5" />
                </button>

                <div className="flex flex-col gap-1 pr-6">
                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                        {confirmModal.title}
                    </h3>
                    <p className="mt-2.5 text-xs leading-relaxed text-slate-550 dark:text-slate-450 whitespace-pre-line">
                        {confirmModal.message}
                    </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4.5 py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900 transition focus:outline-none"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setConfirmModal(prev => ({ ...prev, isOpen: false }));
                            confirmModal.onConfirm();
                        }}
                        className={`cursor-pointer rounded-lg px-4.5 py-2 text-xs font-bold text-white shadow-3xs transition focus:outline-none ${confirmModal.variant === 'danger'
                            ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                            : confirmModal.variant === 'success'
                                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                            }`}
                    >
                        {confirmModal.confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    // Filter active questions mapped in sidebar palette
    const getPaletteQuestions = () => {
        return activeQuestions.map((q, idx) => ({ ...q, originalIndex: idx })).filter(item => {
            return selectedPaletteCategory === 'All Categories' || item.category === selectedPaletteCategory;
        });
    };

    // Render the Live active exam simulator view
    if (isExamActive) {
        const activeQuestion = activeQuestions[currentIdx];
        const paletteItems = getPaletteQuestions();

        return (
            <>
                <Head title={`Live Simulation: ${details.title}`} />
                <div className="fixed inset-0 z-50 flex flex-col bg-background animate-in fade-in duration-200">

                    {/* TOP NAVBAR HEADER */}
                    <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-3xs">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExitExam}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition"
                                title="Exit Exam"
                            >
                                <X className="size-5" />
                            </button>
                            <div className="h-6 w-px bg-border hidden md:block" />
                            <span className="font-heading text-md font-bold text-foreground hidden md:flex items-center gap-1.5">
                                <Award className="size-4.5 text-blue-600" />
                                {details.title}
                            </span>
                        </div>

                        {activeQuestion && (
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100/30 hidden sm:inline-flex">
                                    <BookOpen className="size-3" />
                                    {activeQuestion.category}
                                </span>
                                <span className="text-xs font-semibold text-muted-foreground">
                                    <span className="sm:hidden font-black">Q: {currentIdx + 1}/{activeQuestions.length}</span>
                                    <span className="hidden sm:inline">
                                        Question <strong className="text-foreground">{currentIdx + 1}</strong> of {activeQuestions.length}
                                    </span>
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            {/* Toggle Palette button on mobile */}
                            <button
                                onClick={() => setIsMobilePaletteOpen(true)}
                                className="flex items-center justify-center rounded-lg border border-border bg-card p-2 text-foreground shadow-3xs hover:bg-accent md:hidden focus:outline-none"
                                title="Open Question Palette"
                            >
                                <LayoutGrid className="size-4" />
                            </button>

                            {isTimed ? (
                                <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-black shadow-3xs ${timeLeft < 600
                                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 animate-pulse'
                                    : 'bg-background border-border text-foreground'
                                    }`}>
                                    <Clock className="size-4" />
                                    {formatTime(timeLeft)}
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-black shadow-3xs bg-background border-border text-foreground">
                                    <Timer className="size-4 text-emerald-500 animate-pulse" />
                                    <span>{formatTime(timeLeft)}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground border-l border-border pl-1.5 ml-0.5">Untimed</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* MAIN TWO-COLUMN SPLIT PANEL LAYOUT */}
                    <div className="flex flex-1 overflow-hidden">

                        {/* LEFT COLUMN: ACTIVE QUESTION CARD & OPTION SELECTORS */}
                        <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-10 justify-between bg-background">
                            <div className="mx-auto w-full max-w-3xl">

                                {activeQuestion ? (
                                    <div className="flex flex-col gap-6 animate-in fade-in duration-150">

                                        {/* Question stem container */}
                                        <div className="relative rounded-2xl border border-border bg-card p-6 shadow-3xs">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-[10px] font-black tracking-wider text-blue-600 dark:text-blue-400 uppercase">
                                                    Multiple Choice
                                                </span>
                                                <button
                                                    onClick={() => toggleFlag(currentIdx)}
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition focus:outline-none ${flagged[currentIdx]
                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50'
                                                        : 'text-muted-foreground hover:bg-muted'
                                                        }`}
                                                >
                                                    <Flag className={`size-3.5 ${flagged[currentIdx] ? 'fill-rose-600 text-rose-600' : ''}`} />
                                                    {flagged[currentIdx] ? 'Flagged for Review' : 'Flag for Review'}
                                                </button>
                                            </div>
                                            <div className="text-sm font-semibold leading-relaxed text-foreground">
                                                {renderFormattedText(activeQuestion.stem, true)}
                                            </div>
                                        </div>

                                        {/* Options Grid selector stack */}
                                        <div className="flex flex-col gap-3.5">
                                            {activeQuestion.options.map((opt, idx) => {
                                                const label = String.fromCharCode(65 + idx); // A, B, C, D
                                                const isSelected = answers[currentIdx] === idx;

                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleSelectOption(idx)}
                                                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 shadow-3xs transition-all ${isSelected
                                                            ? 'border-blue-600 bg-blue-50/15 dark:border-blue-500 dark:bg-blue-950/20'
                                                            : 'border-border bg-card hover:bg-muted'
                                                            }`}
                                                    >
                                                        <span className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${isSelected
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'border-border bg-background text-muted-foreground'
                                                            }`}>
                                                            {label}
                                                        </span>
                                                        <p className={`text-sm md:text-base font-bold transition ${isSelected
                                                            ? 'text-blue-900 dark:text-blue-200'
                                                            : 'text-foreground'
                                                            }`}>
                                                            {opt}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                        <AlertCircle className="size-10 mb-3 animate-pulse" />
                                        <span className="text-sm font-semibold">Generating questions slice...</span>
                                    </div>
                                )}

                            </div>

                            {/* CORE CONTROL BUTTONS (PREV, NEXT, SUBMIT) */}
                            <div className="mx-auto w-full max-w-3xl border-t border-border pt-6 mt-8 flex items-center justify-between gap-4">
                                <button
                                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                                    disabled={currentIdx === 0}
                                    className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground shadow-3xs hover:bg-muted transition focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="size-4" />
                                    Previous Question
                                </button>

                                {currentIdx < activeQuestions.length - 1 ? (
                                    <button
                                        onClick={() => setCurrentIdx(prev => Math.min(activeQuestions.length - 1, prev + 1))}
                                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-3xs hover:bg-blue-700 transition focus:outline-none"
                                    >
                                        Next Question
                                        <ChevronRight className="size-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSubmitExam(false)}
                                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition focus:outline-none"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Submit Exam
                                    </button>
                                )}
                            </div>

                        </div>

                        {/* RIGHT COLUMN: QUESTION PALETTE GRID */}
                        <div className="hidden w-80 shrink-0 flex-col border-l border-border bg-card md:flex">

                            {/* Palette filter category switches */}
                            <div className="border-b border-border p-4">
                                <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase block mb-2">
                                    Switch Categories
                                </span>
                                <div className="relative">
                                    <select
                                        value={selectedPaletteCategory}
                                        onChange={(e) => setSelectedPaletteCategory(e.target.value)}
                                        className="w-full rounded-lg border border-border bg-background pl-2.5 pr-8 py-2 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none appearance-none"
                                    >
                                        <option value="All Categories">All Categories</option>
                                        {activeQuestions.some(q => q.category === 'Demographic Profile' || q.isDemographic) && (
                                            <option value="Demographic Profile">Demographic Profile</option>
                                        )}
                                        {details.allowedCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none rotate-90" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <div className="size-2.5 rounded bg-blue-600" />
                                    <span>Answered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="size-2.5 rounded border border-border bg-background" />
                                    <span>Unanswered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="size-2.5 rounded border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20" />
                                    <span>Flagged</span>
                                </div>
                            </div>

                            {/* Number selection buttons grid container */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground uppercase block mb-3">
                                    Question Palette
                                </span>

                                {paletteItems.length === 0 ? (
                                    <div className="py-6 text-center text-muted-foreground">
                                        <span className="text-xs">No questions loaded for this filter</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-5 gap-2">
                                        {paletteItems.map((item) => {
                                            const origIdx = item.originalIndex;
                                            const isAnswered = answers[origIdx] !== undefined;
                                            const isFlagged = flagged[origIdx] === true;
                                            const isActive = currentIdx === origIdx;

                                            return (
                                                <button
                                                    key={origIdx}
                                                    onClick={() => setCurrentIdx(origIdx)}
                                                    className={`relative flex size-10 items-center justify-center rounded-lg border text-xs font-bold transition focus:outline-none ${isActive
                                                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:text-blue-400 bg-card ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-background font-black'
                                                        : isAnswered
                                                            ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                                                            : isFlagged
                                                                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-955/20 dark:border-rose-900/40 dark:text-rose-400 font-extrabold'
                                                                : 'border-border bg-background text-foreground hover:bg-muted'
                                                        }`}
                                                >
                                                    {origIdx + 1}
                                                    {isFlagged && (
                                                        <div className="absolute top-0.5 right-0.5 size-2 rounded-full bg-rose-500 border border-white dark:border-slate-950 shadow-xs" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-border p-4">
                                <button
                                    onClick={() => handleSubmitExam(false)}
                                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition focus:outline-none"
                                >
                                    <CheckCircle2 className="size-4" />
                                    Submit Exam
                                </button>
                            </div>

                        </div>

                    </div>

                    {/* Mobile Question Palette Drawer */}
                    {isMobilePaletteOpen && (
                        <div
                            className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs md:hidden"
                            onClick={() => setIsMobilePaletteOpen(false)}
                        >
                            <div
                                className="w-72 bg-card flex flex-col h-full shadow-2xl border-l border-border"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Drawer Header */}
                                <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
                                    <span className="font-heading text-sm font-bold text-foreground">
                                        Question Palette
                                    </span>
                                    <button
                                        onClick={() => setIsMobilePaletteOpen(false)}
                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted transition"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>

                                {/* Category switcher */}
                                <div className="border-b border-border p-4">
                                    <span className="text-[10px] font-extrabold tracking-wider text-muted-foreground block mb-2 uppercase">
                                        Switch Categories
                                    </span>
                                    <div className="relative">
                                        <select
                                            value={selectedPaletteCategory}
                                            onChange={(e) => setSelectedPaletteCategory(e.target.value)}
                                            className="w-full rounded-lg border border-border bg-background pl-2.5 pr-8 py-2 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none appearance-none"
                                        >
                                            <option value="All Categories">All Categories</option>
                                            {activeQuestions.some(q => q.category === 'Demographic Profile' || q.isDemographic) && (
                                                <option value="Demographic Profile">Demographic Profile</option>
                                            )}
                                            {details.allowedCategories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none rotate-90" />
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="grid grid-cols-3 gap-2 px-4 py-3 bg-muted/40 border-b border-border text-[10px] font-bold text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <div className="size-2.5 rounded bg-blue-600" />
                                        <span>Answered</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="size-2.5 rounded border border-border bg-background" />
                                        <span>Unanswered</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="size-2.5 rounded border border-rose-200 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20" />
                                        <span>Flagged</span>
                                    </div>
                                </div>

                                {/* Palette buttons */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {paletteItems.map((item) => {
                                            const origIdx = item.originalIndex;
                                            const isAnswered = answers[origIdx] !== undefined;
                                            const isFlagged = flagged[origIdx] === true;
                                            const isActive = currentIdx === origIdx;

                                            return (
                                                <button
                                                    key={origIdx}
                                                    onClick={() => {
                                                        setCurrentIdx(origIdx);
                                                        setIsMobilePaletteOpen(false);
                                                    }}
                                                    className={`relative flex size-10 items-center justify-center rounded-lg border text-xs font-bold transition focus:outline-none ${isActive
                                                        ? 'border-blue-600 bg-blue-50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-600 ring-offset-1 dark:ring-offset-background font-black'
                                                        : isAnswered
                                                            ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                                                            : isFlagged
                                                                ? 'border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-905/20 dark:border-rose-900/40 dark:text-rose-400'
                                                                : 'border-border bg-background text-foreground hover:bg-muted'
                                                        }`}
                                                >
                                                    {origIdx + 1}
                                                    {isFlagged && (
                                                        <div className="absolute top-0.5 right-0.5 size-2 rounded-full bg-rose-500 border border-white dark:border-slate-950 shadow-xs" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Sidebar Quick Submit trigger */}
                                <div className="border-t border-border p-4 bg-muted/20">
                                    <button
                                        onClick={() => {
                                            setIsMobilePaletteOpen(false);
                                            handleSubmitExam(false);
                                        }}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition focus:outline-none"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Submit Exam
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {customConfirmModal}
                </div>
            </>
        );
    }

    // Render the Post-Exam review scorecard view
    if (isExamSubmitted && results) {
        if (reviewScreenActive) {
            const currentQuestion = activeQuestions[currentIdx];
            const chosenOption = answers[currentIdx];

            return (
                <>
                    <Head title={`Answer Review: ${details.title}`} />
                    <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-6 overflow-hidden p-6 animate-in fade-in duration-250 bg-background">
                        {/* Back Link to Scorecard */}
                        <button
                            onClick={() => setReviewScreenActive(false)}
                            className="flex w-fit items-center gap-1 text-xs font-black text-foreground hover:text-blue-600 transition cursor-pointer focus:outline-none"
                        >
                            <ChevronLeft className="size-4" />
                            Back to Scorecard
                        </button>

                        {/* 1. Header Navigation Bar */}
                        <div className="flex flex-col gap-4 border-b border-border bg-card p-5 rounded-xl md:flex-row md:items-center md:justify-between shadow-xs">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="rounded-md px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                                        Exam Answer Review
                                    </span>
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {details.title}
                                    </span>
                                </div>
                                <h2 className="mt-1 font-heading text-lg font-bold text-foreground">
                                    Review Explanation
                                </h2>
                            </div>

                            {/* Filters exactly matching screen design mockups */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Tab-like pills with exact metrics */}
                                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
                                    <button
                                        onClick={() => {
                                            setReviewStatusFilter('all');
                                        }}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${reviewStatusFilter === 'all'
                                            ? 'bg-background text-foreground shadow-3xs'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        All ({results.total})
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReviewStatusFilter('correct');
                                        }}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${reviewStatusFilter === 'correct'
                                            ? 'bg-background text-emerald-600 shadow-3xs'
                                            : 'text-muted-foreground hover:text-emerald-600'
                                            }`}
                                    >
                                        <CheckCircle2 className="size-3 text-emerald-600" />
                                        Correct ({results.correctCount})
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReviewStatusFilter('incorrect');
                                        }}
                                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${reviewStatusFilter === 'incorrect'
                                            ? 'bg-background text-rose-600 shadow-3xs'
                                            : 'text-muted-foreground hover:text-rose-600'
                                            }`}
                                    >
                                        <X className="size-3 text-rose-600" />
                                        Incorrect ({results.wrongCount + results.skippedCount})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Main Question + Side Navigation Split */}
                        <div className="flex flex-1 gap-6 overflow-hidden">
                            {/* Left Question Body Column */}
                            <div className="flex flex-1 flex-col overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xs">
                                {currentQuestion ? (
                                    <>
                                        <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                                            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                Question {currentIdx + 1} of {activeQuestions.length}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setFlagged(prev => ({
                                                        ...prev,
                                                        [currentIdx]: !prev[currentIdx]
                                                    }));
                                                }}
                                                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${flagged[currentIdx]
                                                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400'
                                                    : 'text-muted-foreground border-border hover:bg-muted'
                                                    }`}
                                            >
                                                <Flag className={`size-3.5 ${flagged[currentIdx] ? 'fill-current' : ''}`} />
                                                {flagged[currentIdx] ? 'Flagged for Review' : 'Flag for Review'}
                                            </button>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="rounded-md bg-blue-50/50 px-2 py-0.5 text-[9px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                                                    {currentQuestion.category}
                                                </span>
                                                <span className="rounded-md bg-muted px-2 py-0.5 text-[9px] font-extrabold text-muted-foreground">
                                                    {currentQuestion.subcategory || 'General Concepts'}
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                {renderFormattedText(currentQuestion.stem, true)}
                                            </div>

                                            {/* Options */}
                                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {currentQuestion.options.map((opt, idx) => {
                                                    const letter = String.fromCharCode(65 + idx);
                                                    const isChosen = chosenOption === idx;
                                                    const isCorrectOption = idx === currentQuestion.correct_option;
                                                    const isDemographic = currentQuestion.isDemographic || currentQuestion.category === 'Demographic Profile';

                                                    let optionStyle = 'border-border bg-background hover:bg-muted text-foreground';
                                                    let badgeStyle = 'bg-muted text-muted-foreground';

                                                    if (isDemographic) {
                                                        if (isChosen) {
                                                            optionStyle = 'bg-blue-50/70 border-blue-200 text-blue-950 font-bold dark:bg-blue-950/20 dark:border-blue-900 dark:text-blue-300';
                                                            badgeStyle = 'bg-blue-600 text-white';
                                                        }
                                                    } else if (isCorrectOption) {
                                                        optionStyle = 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-bold dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-300';
                                                        badgeStyle = 'bg-emerald-600 text-white';
                                                    } else if (isChosen) {
                                                        optionStyle = 'bg-rose-50/70 border-rose-250 text-rose-950 font-bold dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300';
                                                        badgeStyle = 'bg-rose-600 text-white';
                                                    } else {
                                                        optionStyle = 'border-border bg-background hover:bg-muted text-foreground/60 opacity-60';
                                                        badgeStyle = 'bg-muted text-muted-foreground/60';
                                                    }

                                                    return (
                                                        <div key={idx} className="relative flex items-center">
                                                            <div className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${optionStyle}`}>
                                                                <div className="flex gap-2.5 items-center">
                                                                    <span className={`inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${badgeStyle}`}>
                                                                        {letter}
                                                                    </span>
                                                                    <span className="text-sm leading-tight">{opt}</span>
                                                                </div>
                                                                {!isDemographic && isCorrectOption && <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-450 shrink-0" />}
                                                                {!isDemographic && isChosen && !isCorrectOption && <X className="size-4 text-rose-650 dark:text-rose-450 shrink-0" />}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {(() => {
                                                const propositions = extractPropositions(currentQuestion.stem);
                                                const letterMap: Record<string, string> = {};

                                                propositions.forEach((prop, idx) => {
                                                    const newLetter = String.fromCharCode(65 + idx);
                                                    letterMap[prop.letter] = newLetter;
                                                });

                                                return (
                                                    <>
                                                        {currentQuestion.explanation && (
                                                            <div className="mt-6 bg-muted/60 border border-border rounded-xl p-4.5 text-xs leading-relaxed text-muted-foreground">
                                                                <span className="font-bold text-foreground block mb-2">
                                                                    Explanation &amp; Rationale:
                                                                </span>

                                                                {propositions.length > 0 && (
                                                                    <div className="mb-4 bg-background border border-border rounded-xl p-3 shadow-3xs">
                                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-2 font-heading">
                                                                            Proposition Key:
                                                                        </span>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                            {propositions.map((prop, idx) => {
                                                                                const newLetter = String.fromCharCode(65 + idx);
                                                                                return (
                                                                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                                                                        <span className="inline-flex size-5 items-center justify-center rounded bg-blue-50 dark:bg-blue-950/40 text-[10px] font-black text-blue-700 dark:text-blue-400 border border-blue-100/60 dark:border-blue-900/40 font-mono">
                                                                                            {newLetter}
                                                                                        </span>
                                                                                        <span className="text-foreground font-medium">
                                                                                            {prop.phrase}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {renderFormattedText(currentQuestion.explanation, false, letterMap)}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>

                                        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                                            {/* existing prev/back/next buttons */}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center">
                                        <HelpCircle className="size-12 text-muted-foreground mb-3" />
                                        <h3 className="text-base font-bold text-foreground">No questions match filters</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Try switching to a different category or status pill.</p>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Question Palette */}
                            <div className="hidden w-80 shrink-0 flex-col border-l border-border bg-card md:flex rounded-xl shadow-xs overflow-hidden">
                                {/* existing right column content */}
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        // Render premium Scorecard view!
        return (
            <>
                <Head title={isDrillSession
                    ? `Scorecard: ${drillCategoryName || savedAttempt?.cat_scores?.metadata?.category_name || 'Practice Drill'}`
                    : `Scorecard: ${details.title}`}
                />
                <PageContainer className="animate-in fade-in duration-200">

                    {/* Back to History Link */}
                    {savedAttempt && (
                        <Link
                            href="/history"
                            className="flex w-fit items-center gap-1 text-xs font-black text-slate-850 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 transition cursor-pointer focus:outline-none"
                        >
                            <ChevronLeft className="size-4" />
                            Back to History
                        </Link>
                    )}

                    {/* Header */}
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-5">
                        <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                <Award className="size-3" />
                                Review Panel
                            </span>
                            <h1 className="font-heading mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
                                {isDrillSession ? 'Drill Results' : 'Exam Results'}
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {(() => {
                                    if (savedAttempt && savedAttempt.created_at) {
                                        try {
                                            return `Completed on ${new Date(savedAttempt.created_at).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}`;
                                        } catch {
                                            /* ignore invalid date string format */
                                        }
                                    }
                                    return `Completed on ${new Date().toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}`;
                                })()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setReviewScreenActive(true);
                                }}
                                className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold shadow-3xs transition hover:bg-slate-55/60 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 focus:outline-none"
                            >
                                <BookOpen className="size-3.5" />
                                View Review
                            </button>
                            <button
                                onClick={() => setShowRetakeModal(true)}
                                className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-750 focus:outline-none"
                            >
                                <RotateCcw className="size-3.5" />
                                {isDrillSession ? 'Retake Drill' : 'Retake Exam'}
                            </button>
                        </div>
                    </div>

                    {submittedByTimer && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                            Time expired — your exam was submitted automatically and your scorecard is shown below.
                        </div>
                    )}

                    {retakeModal}

                    {/* Stats overview cards grid */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-850 dark:bg-slate-950 text-center">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Final Grade</span>
                            <p className="mt-2 text-3xl font-black text-blue-600 dark:text-blue-400">{results.percentage}%</p>
                            <span className={`inline-flex rounded-full mt-2 px-2.5 py-0.5 text-[10px] font-extrabold ${results.percentage >= 80
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450'
                                }`}>
                                {results.percentage >= 80 ? 'PASSED (CSC Standard)' : 'FAILED'}
                            </span>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-850 dark:bg-slate-950 text-center">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Correct Answers</span>
                            <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">{results.correctCount}</p>
                            <span className="text-[10px] font-bold text-slate-400 block mt-2">of {results.total} questions</span>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-850 dark:bg-slate-950 text-center">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Incorrect answers</span>
                            <p className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">{results.wrongCount}</p>
                            <span className="text-[10px] font-bold text-slate-400 block mt-2">of {results.total} questions</span>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-850 dark:bg-slate-950 text-center">
                            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Skipped / Blank</span>
                            <p className="mt-2 text-3xl font-black text-slate-500">{results.skippedCount}</p>
                            <span className="text-[10px] font-bold text-slate-400 block mt-2">unanswered items</span>
                        </div>
                    </div>

                    {/* Executive Radial Gauge + Elapsed stats + AI advice widgets grid */}
                    {(() => {
                        const elapsedSecs = results.elapsedSecs ?? 0;
                        const remainingSecs = isTimed ? Math.max(0, getActiveTimeLimitSecs() - elapsedSecs) : 0;
                        const elapsedText = formatDuration(elapsedSecs);
                        const underLimitText =
                            remainingSecs > 0
                                ? `${formatDuration(remainingSecs, false)} under limit`
                                : 'Used full time limit';

                        let percentile = '22nd';
                        let topText = 'Top 78% of test takers';
                        const pct = results.percentage;
                        if (pct >= 95) { percentile = '99th'; topText = 'Top 1% of test takers'; }
                        else if (pct >= 90) { percentile = '95th'; topText = 'Top 5% of test takers'; }
                        else if (pct >= 85) { percentile = '91st'; topText = 'Top 9% of test takers'; }
                        else if (pct >= 80) { percentile = '88th'; topText = 'Top 12% of test takers'; }
                        else if (pct >= 75) { percentile = '80th'; topText = 'Top 20% of test takers'; }
                        else if (pct >= 70) { percentile = '73rd'; topText = 'Top 27% of test takers'; }
                        else if (pct >= 60) { percentile = '58th'; topText = 'Top 42% of test takers'; }
                        else if (pct >= 50) { percentile = '41st'; topText = 'Top 59% of test takers'; }

                        let aiAnalysisText = '';
                        if (results.correctCount === 0) {
                            aiAnalysisText = "You did not answer any questions correctly on this attempt. We recommend reviewing the foundational concepts across all categories, starting with General Information and Verbal Ability, to build up your core competencies.";
                        } else {
                            if (isDrillSession) {
                                // Analyze subcategory performance for category drills
                                let strongestSubcat = '';
                                let strongestSubcatPct = -1;
                                let weakestSubcat = '';
                                let weakestSubcatPct = 101;
                                let targetCategoryName = drillCategoryName || 'Practice Drill';

                                Object.entries(results.categoryScoreMap).forEach(([cat, val]) => {
                                    targetCategoryName = cat;
                                    Object.entries(val.subcats).forEach(([sub, subVal]) => {
                                        const subPct = subVal.total > 0 ? (subVal.correct / subVal.total) * 100 : 0;
                                        if (subPct > strongestSubcatPct) {
                                            strongestSubcatPct = subPct;
                                            strongestSubcat = sub;
                                        }
                                        if (subPct < weakestSubcatPct) {
                                            weakestSubcatPct = subPct;
                                            weakestSubcat = sub;
                                        }
                                    });
                                });

                                if (!strongestSubcat) strongestSubcat = 'fundamental questions';
                                if (!weakestSubcat) weakestSubcat = 'specific target modules';

                                if (strongestSubcat === weakestSubcat) {
                                    if (results.percentage >= 80) {
                                        aiAnalysisText = `You completed a focused drill in ${targetCategoryName}. Your accuracy was consistent and strong across your targeted subcategories. Keep practicing to maintain this level!`;
                                    } else {
                                        aiAnalysisText = `You completed a focused drill in ${targetCategoryName}. We recommend spending more time reviewing the core concepts of "${strongestSubcat}" to raise your overall accuracy.`;
                                    }
                                } else {
                                    aiAnalysisText = `In this ${targetCategoryName} practice drill, you showed strong proficiency in ${strongestSubcat} topics. To maximize your performance in this category, we recommend focusing review efforts on ${weakestSubcat}.`;
                                }
                            } else {
                                // Analyze category performance for full mock exams
                                let strongestCategory = '';
                                let strongestPct = -1;
                                let weakestCategory = '';
                                let weakestPct = 101;
                                let weakestSubcat = 'fundamental concepts';

                                Object.entries(results.categoryScoreMap).forEach(([cat, val]) => {
                                    const catPct = val.total > 0 ? (val.correct / val.total) * 100 : 0;
                                    if (catPct > strongestPct) {
                                        strongestPct = catPct;
                                        strongestCategory = cat;
                                    }
                                    if (catPct < weakestPct) {
                                        weakestPct = catPct;
                                        weakestCategory = cat;
                                        const subEntries = Object.entries(val.subcats);
                                        if (subEntries.length > 0) {
                                            const sortedSubs = [...subEntries].sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));
                                            weakestSubcat = sortedSubs[0][0];
                                        }
                                    }
                                });

                                if (!strongestCategory) strongestCategory = 'Verbal Ability';
                                if (!weakestCategory) weakestCategory = 'Numerical Ability';

                                aiAnalysisText = `Your strongest area was ${strongestCategory}. To improve your overall score, focus review efforts on ${weakestCategory}, specifically ${weakestSubcat} modules.`;
                            }
                        }

                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDashoffset = circumference - (results.percentage / 100) * circumference;

                        return (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-2">

                                {/* Radial progress circle display */}
                                <div className="md:col-span-1 rounded-xl border border-slate-200 bg-white p-6 shadow-3xs dark:border-slate-800 dark:bg-slate-950 flex flex-col items-center justify-center text-center relative min-h-[260px]">
                                    <div className="relative size-36 flex items-center justify-center">
                                        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r={radius}
                                                className="stroke-slate-100 dark:stroke-slate-900 fill-none"
                                                strokeWidth="7"
                                            />
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r={radius}
                                                className="stroke-emerald-600 dark:stroke-emerald-500 fill-none transition-all duration-500"
                                                strokeWidth="7"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-black text-slate-850 dark:text-white leading-none">
                                                {results.percentage}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex flex-col items-center gap-1.5">
                                        <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wider uppercase ${results.percentage >= 80
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
                                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-450'
                                            }`}>
                                            {results.percentage >= 80 ? 'PASS' : 'FAIL'}
                                        </span>
                                        <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 mt-1">
                                            {results.correctCount} / {results.total} Correct
                                        </p>
                                    </div>
                                </div>

                                {/* Dynamic Elapsed, Percentile and advice widgets */}
                                <div className="md:col-span-2 flex flex-col gap-6">

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                                        {/* Card 1: Time Elapsed */}
                                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs dark:border-slate-800 dark:bg-slate-950">
                                            <div className="flex items-center gap-2 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                                <Clock className="size-3.5 text-blue-650" />
                                                <span>Time Elapsed</span>
                                            </div>
                                            <p className="mt-3 text-3xl font-black text-slate-850 dark:text-white">
                                                {elapsedText}
                                            </p>
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-650 dark:text-emerald-450 mt-1.5">
                                                ↘ {underLimitText}
                                            </span>
                                        </div>

                                        {/* Card 2: Percentile */}
                                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs dark:border-slate-800 dark:bg-slate-950">
                                            <div className="flex items-center gap-2 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                                                <Users className="size-3.5 text-blue-650" />
                                                <span>Percentile</span>
                                            </div>
                                            <p className="mt-3 text-3xl font-black text-slate-850 dark:text-white">
                                                {percentile}
                                            </p>
                                            <span className="text-[10px] font-bold text-slate-500 block mt-1.5">
                                                {topText}
                                            </span>
                                        </div>

                                    </div>

                                    {/* Bottom: Performance Insights AI analysis */}
                                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-3xs dark:border-slate-800 dark:bg-slate-950 flex-1 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-[10px] font-black tracking-wider text-slate-400 uppercase mb-2">
                                            <Sparkles className="size-3.5 text-amber-500" />
                                            <span>Performance Insights</span>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-850 leading-relaxed">
                                            {aiAnalysisText}
                                        </p>
                                    </div>

                                </div>

                            </div>
                        );
                    })()}

                    {/* Subcategory Accordion Category Breakdown (Full Width) */}
                    <div className="flex flex-col gap-4 mt-2">
                        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
                            Category Breakdown
                        </h2>

                        <div className="flex flex-col gap-4">
                            {Object.entries(results.categoryScoreMap).map(([cat, val]) => {
                                const pct = Math.round((val.correct / val.total) * 100);
                                const isExpanded = expandedCategory === cat;

                                // Select appropriate icon matching the topic blueprint
                                let IconComponent = BookOpen;
                                if (cat.toLowerCase().includes('verbal')) IconComponent = BookOpen;
                                else if (cat.toLowerCase().includes('numerical') || cat.toLowerCase().includes('quant') || cat.toLowerCase().includes('math')) IconComponent = Calculator;
                                else if (cat.toLowerCase().includes('analytical') || cat.toLowerCase().includes('abstract') || cat.toLowerCase().includes('reason')) IconComponent = Brain;
                                else if (cat.toLowerCase().includes('clerical')) IconComponent = ClipboardList;
                                else IconComponent = Award;

                                // Grade range indicators
                                const barColor = pct >= 80 ? 'bg-emerald-700' : pct >= 70 ? 'bg-blue-600 animate-pulse' : 'bg-rose-600';
                                const percentColor = pct >= 80 ? 'text-emerald-700 dark:text-emerald-450' : pct >= 70 ? 'text-blue-655 dark:text-blue-450' : 'text-rose-650 dark:text-rose-450';

                                return (
                                    <div
                                        key={cat}
                                        className="rounded-xl border border-slate-200 bg-white shadow-3xs dark:border-slate-800 dark:bg-slate-950 transition overflow-hidden"
                                    >
                                        {/* Accordion trigger panel button */}
                                        <button
                                            onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                                            className="w-full flex items-center justify-between p-5 text-left transition hover:bg-slate-50/50 dark:hover:bg-slate-900/30 focus:outline-none"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex size-11 items-center justify-center rounded-lg bg-blue-50 text-blue-650 dark:bg-blue-950/40 dark:text-blue-450">
                                                    <IconComponent className="size-5.5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-md font-bold text-slate-900 dark:text-white leading-tight">
                                                        {cat}
                                                    </h3>
                                                    <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                                                        {val.correct} / {val.total} Correct
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={`text-md font-extrabold ${percentColor}`}>
                                                    {pct}%
                                                </span>
                                                <ChevronDown className={`size-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-650' : ''
                                                    }`} />
                                            </div>
                                        </button>

                                        {/* Dynamic full-width colored progress bar */}
                                        <div className="px-5 pb-5">
                                            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-900/50">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                                    style={{ width: `${Math.max(3, pct)}%` }}
                                                />
                                            </div>

                                            {/* Subcategories grid visible under expanded categories */}
                                            {isExpanded && (
                                                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-900 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3.5">
                                                        {Object.entries(val.subcats).map(([subName, subVal]) => {
                                                            const subPct = subVal.total > 0 ? Math.round((subVal.correct / subVal.total) * 100) : 0;
                                                            const scoreColor = subPct >= 80
                                                                ? 'text-emerald-600 font-black dark:text-emerald-450'
                                                                : subPct >= 70
                                                                    ? 'text-blue-655 font-black dark:text-blue-450'
                                                                    : 'text-rose-650 font-black dark:text-rose-400';

                                                            return (
                                                                <div key={subName} className="flex items-center justify-between text-xs py-1 border-b border-slate-50/50 dark:border-slate-900/20">
                                                                    <span className="text-slate-600 font-semibold dark:text-slate-400">
                                                                        {subName}
                                                                    </span>
                                                                    <span className={`shrink-0 ml-4 ${scoreColor}`}>
                                                                        {subVal.correct}/{subVal.total}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {customConfirmModal}
                </PageContainer>
            </>
        );
    }

    // Default configuration screen (landing page setup)
    return (
        <>
            <Head title="Exam Setup" />

            <PageContainer>
                {/* Header Information Section */}
                <div className="flex flex-col gap-1">
                    <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                        Exam Setup
                    </h1>
                    <p className="text-sm text-slate-500 md:text-base dark:text-slate-400">
                        Select your target certification level to configure the
                        simulation parameters.
                    </p>
                </div>

                {/* Primary Column Grid Layout */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Panel: Level Selectors */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {/* Professional Level Card */}
                        <div
                            onClick={() => setSelectedExamId(1)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-5 shadow-sm transition hover:shadow-md ${selectedExamId === 1
                                ? 'border-blue-600 bg-blue-50/10 dark:border-blue-500 dark:bg-blue-950/10'
                                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <Award className="size-6 fill-current text-white" />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                        Professional Level
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 md:text-sm dark:text-slate-400">
                                        Comprehensive assessment for supervisory
                                        and advanced technical positions.
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 pl-4">
                                <div
                                    className={`flex size-5 items-center justify-center rounded-full border ${selectedExamId === 1
                                        ? 'border-blue-600 dark:border-blue-500'
                                        : 'border-slate-300 dark:border-slate-600'
                                        }`}
                                >
                                    {selectedExamId === 1 && (
                                        <div className="size-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Subprofessional Level Card */}
                        <div
                            onClick={() => setSelectedExamId(2)}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-5 shadow-sm transition hover:shadow-md ${selectedExamId === 2
                                ? 'border-blue-600 bg-blue-50/10 dark:border-blue-500 dark:bg-blue-950/10'
                                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                    <ClipboardList className="size-6" />
                                </div>
                                <div>
                                    <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                                        Subprofessional Level
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 md:text-sm dark:text-slate-400">
                                        Standardized assessment for clerical,
                                        routine, and manual service positions.
                                    </p>
                                </div>
                            </div>
                            <div className="shrink-0 pl-4">
                                <div
                                    className={`flex size-5 items-center justify-center rounded-full border ${selectedExamId === 2
                                        ? 'border-blue-600 dark:border-blue-500'
                                        : 'border-slate-300 dark:border-slate-600'
                                        }`}
                                >
                                    {selectedExamId === 2 && (
                                        <div className="size-2.5 rounded-full bg-blue-600 dark:bg-blue-500" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Simulation Overview */}
                    <div className="flex min-h-[380px] flex-col justify-between rounded-xl border border-blue-100/50 bg-blue-50/30 p-6 shadow-sm dark:border-blue-950/20 dark:bg-blue-950/10">
                        <div>
                            <h2 className="mb-4 border-b border-blue-100/40 pb-2 font-heading text-lg font-bold tracking-tight text-slate-900 dark:border-blue-950/20 dark:text-white">
                                Simulation Overview
                            </h2>

                            {/* Simulation Specs List */}
                            <div className="mt-2 flex flex-col gap-4.5">
                                {/* Total Items */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <List className="size-4 text-slate-400 dark:text-slate-500" />
                                        <span>Total Items</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {details.totalItems}
                                    </span>
                                </div>

                                {/* Scored Items */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <CheckCircle2 className="size-4 text-slate-400 dark:text-slate-500" />
                                        <span>Scored Items</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {details.scoredItems}
                                    </span>
                                </div>

                                {/* Time Limit */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Clock className="size-4 text-slate-400 dark:text-slate-500" />
                                        <span>Time Limit</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {details.timeLimit}
                                    </span>
                                </div>

                                {/* Target Pace */}
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Timer className="size-4 text-slate-400 dark:text-slate-500" />
                                        <span>Target Pace</span>
                                    </div>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {details.targetPace}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Actions and Stable Connection Alert */}
                        <div className="mt-6 flex flex-col gap-4">
                            {/* Technical check callout to avoid data losses */}
                            <div className="rounded-lg border border-slate-200 bg-white/70 p-3.5 text-center text-[11px] leading-relaxed font-medium text-slate-600 shadow-2xs dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                                Ensure you have a stable connection. The timer
                                will begin immediately upon confirmation.
                            </div>

                            {/* Action CTA Button */}
                            <button
                                onClick={handleBeginExam}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-xs font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                            >
                                Begin Exam
                                <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </PageContainer>
            {customConfirmModal}
        </>
    );
}

// Set global shell layouts for navigation links tracking
ExamIndex.layout = {
    breadcrumbs: [
        {
            title: 'Exams',
            href: examsIndex(),
        },
    ],
};
