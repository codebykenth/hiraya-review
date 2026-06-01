import React from 'react';

export const formatDuration = (totalSecs: number, showLabel = true): string => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);

    if (h > 0 && m > 0) {
        return showLabel ? `${h}h ${m}m` : `${h}h ${m}m`;
    }

    if (h > 0) {
        return `${h}h`;
    }

    return `${m}m`;
};

export const extractPropositions = (stem: string) => {
    const regex = /\(\s*([A-Z])\s*\)/g;
    const matches: { letter: string; phrase: string }[] = [];
    let match;

    while ((match = regex.exec(stem)) !== null) {
        const letter = match[1];
        const index = match.index;
        const beforeText = stem
            .substring(Math.max(0, index - 80), index)
            .trim();
        const parts = beforeText.split(
            /(?:\.|\bif\b|\bthen\b|\bthat\b|\band\b|,)\s*/i,
        );
        let phrase = parts[parts.length - 1].trim();

        phrase = phrase.replace(/^(?:a|an|the|they|he|she|it|to)\s+/i, '');

        if (phrase) {
            phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1);

            if (!matches.some((m) => m.letter === letter)) {
                matches.push({ letter, phrase });
            }
        }
    }

    return matches;
};

export const formatMathInline = (text: string) => {
    if (typeof text !== 'string') {
        return text;
    }

    // Split by fraction (e.g. 1/2 or 1 / 2) or superscript (e.g. ^2, ^-3, ^n)
    const parts = text.split(/(\b\d+\s*\/\s*\d+\b|\^[-a-zA-Z0-9]+)/);

    if (parts.length === 1) {
        return text;
    }

    return (
        <>
            {parts.map((part, idx) => {
                if (idx % 2 === 1) {
                    if (part.startsWith('^')) {
                        return (
                            <sup key={idx} className="font-semibold">
                                {part.substring(1)}
                            </sup>
                        );
                    }

                    if (part.includes('/')) {
                        const [num, den] = part.split('/').map((s) => s.trim());

                        return (
                            <span
                                key={idx}
                                className="mx-1 inline-flex flex-col text-center align-middle leading-none"
                            >
                                <span className="block border-b border-slate-500 px-0.5 pb-[2px] text-[0.8em] font-bold dark:border-slate-400">
                                    {num}
                                </span>
                                <span className="block px-0.5 pt-[2px] text-[0.8em] font-bold">
                                    {den}
                                </span>
                            </span>
                        );
                    }
                }

                return <React.Fragment key={idx}>{part}</React.Fragment>;
            })}
        </>
    );
};

export const renderFormattedText = (
    text: string,
    stripLogicSymbols: boolean = false,
    letterMap?: Record<string, string>,
) => {
    if (!text) {
        return null;
    }

    // Strict 1-liner comment: Dynamically strip parenthesized logical variable markers if requested
    const processedText = stripLogicSymbols
        ? text.replace(/\s*\(\s*[~¬]?\s*[A-Z]\s*\)/g, '')
        : text;

    // Strict 1-liner comment: Pre-format continuous single-line numbered lists to newlines
    const cleanedText = processedText.replace(
        /(?:\s+|:|^)(\d+\.)\s+/g,
        '\n$1 ',
    );

    const tableRegex = /((?:^|\n)\|[^\n]+\|[^\n]*(?:\n\|[^\n]+\|[^\n]*)+)/g;
    const parts = cleanedText.split(tableRegex);

    const formatNumberedLists = (inputText: string) => {
        if (!inputText) {
            return null;
        }

        const lines = inputText.split(/\n/);
        const listRegex = /^\s*(\(\d+\)|\d+\.)\s+(.+)$/;

        const listItems: { marker: string; text: string }[] = [];
        const introLines: string[] = [];
        const outroLines: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed) {
                continue;
            }

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

        const renderRichParagraph = (
            paraText: string,
            defaultClass: string = 'text-slate-600 dark:text-slate-300 leading-relaxed text-base font-medium',
        ) => {
            if (!paraText) {
                return null;
            }

            // Strict 1-liner comment: Regex to match standard math expressions, logic arrow chains, negation states, parenthesized variables, and single letter variables
            const mathPattern =
                /(\b\d+(?:\.\d+)?%|\b\d+\/\d+\b|\[[^\]]+\]|\bProject\s+[A-Z]\b|\bQ[1-4]\b|(?:\b\d+(?:,\d{3})*(?:\.\d+)?\s*[+\-*/=]\s*)+\d+(?:,\d{3})*(?:\.\d+)?%?|[~¬]?\s*\b[A-Z]\b\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b(?:\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b)*|[~¬]\s*\b[A-Z]\b|\(\s*[~¬]?\s*\b[A-Z]\b\s*\)|'\s*\b[A-Z]\b\s*'|"\s*\b[A-Z]\b\s*"|\b[B-H|J-N|P-Z]\b)/g;

            const renderSingleVariable = (v: string) => {
                const cleaned = v.trim();
                const isNegated =
                    cleaned.startsWith('~') || cleaned.startsWith('¬');
                let letter = cleaned.replace(/[~¬]\s*/, '');

                // Strict 1-liner comment: Translate custom variable key to standard A/B/C/D
                if (letterMap && letterMap[letter]) {
                    letter = letterMap[letter];
                }

                if (isNegated) {
                    return (
                        <span className="shadow-3xs inline-flex items-center rounded-md border border-red-100 bg-red-50 px-1.5 py-0.5 font-mono text-xs font-bold text-red-600 select-all">
                            <span className="mr-0.5 text-[10px] font-bold text-red-400">
                                ¬
                            </span>
                            {letter}
                        </span>
                    );
                }

                return (
                    <span className="shadow-3xs inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-700 select-all">
                        {letter}
                    </span>
                );
            };

            const renderTokenContent = (token: string) => {
                // If it is a logic chain
                if (token.includes('->') || token.includes('=>')) {
                    const variables = token.split(/\s*(?:->|=>)\s*/);

                    return (
                        <span className="shadow-3xs mx-1 my-0.5 inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50 px-2 py-1 transition hover:bg-slate-100/50">
                            {variables.map((v, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1"
                                >
                                    {idx > 0 && (
                                        <span className="text-xs font-bold text-slate-400 select-none">
                                            ➔
                                        </span>
                                    )}
                                    {renderSingleVariable(v)}
                                </span>
                            ))}
                        </span>
                    );
                }

                // If it's a standalone variable or negation
                if (
                    token.match(/^[~¬]?\s*\b[A-Z]\b$/) ||
                    token.match(/^\(\s*[~¬]?\s*\b[A-Z]\b\s*\)$/)
                ) {
                    return renderSingleVariable(token.replace(/[()]/g, ''));
                }

                return (
                    <span className="font-semibold text-slate-800">
                        {formatMathInline(token)}
                    </span>
                );
            };

            const renderRichParagraphContent = (content: string) => {
                const mathParts = content.split(mathPattern);

                return (
                    <>
                        {mathParts.map((mPart, mIdx) => {
                            if (mPart.match(mathPattern)) {
                                return (
                                    <React.Fragment key={mIdx}>
                                        {renderTokenContent(mPart)}
                                    </React.Fragment>
                                );
                            }

                            return (
                                <span key={mIdx}>
                                    {formatMathInline(mPart)}
                                </span>
                            );
                        })}
                    </>
                );
            };

            // Strict 1-liner comment: Match step-by-step indicators to render styled step block cards
            const stepMatch = paraText.match(/^\s*Step\s+(\d+)\s*:\s*(.+)$/i);

            if (stepMatch) {
                const stepNum = stepMatch[1];
                const stepContent = stepMatch[2];

                return (
                    <div className="shadow-3xs my-2.5 flex items-start gap-3 rounded-r-xl border-l-3 border-blue-500 bg-blue-50/15 p-3.5 dark:bg-blue-950/10">
                        <span className="shadow-3xs mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-blue-600 font-mono text-[10px] font-black text-white select-none">
                            {stepNum}
                        </span>
                        <div className="flex-1">
                            <strong className="text-slate-850 mb-1 block text-xs font-extrabold dark:text-white">
                                STEP {stepNum}
                            </strong>
                            <div className="text-slate-650 dark:text-slate-350 text-xs leading-relaxed font-semibold">
                                {renderRichParagraphContent(stepContent)}
                            </div>
                        </div>
                    </div>
                );
            }

            // Strict 1-liner comment: Match mental math shortcut triggers to render stylized tips cards
            const shortcutMatch = paraText.match(
                /^\s*(🧠\s*)?(Mental Math Shortcut|Fast Track|Shortcut)\s*:\s*(.+)$/i,
            );

            if (shortcutMatch) {
                const title = shortcutMatch[2];
                const shortcutContent = shortcutMatch[3];

                return (
                    <div className="shadow-3xs my-3 flex items-start gap-3 rounded-r-xl border-l-3 border-amber-500 bg-amber-50/15 p-3.5 dark:bg-amber-950/10">
                        <span className="shadow-3xs mt-0.5 flex size-5.5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] text-white select-none">
                            🧠
                        </span>
                        <div className="flex-1">
                            <strong className="text-amber-850 mb-1 block font-heading text-xs font-extrabold tracking-wider uppercase dark:text-amber-300">
                                {title}
                            </strong>
                            <div className="dark:text-slate-350 text-xs leading-relaxed font-bold text-slate-600">
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
                                {renderRichParagraph(
                                    line,
                                    'text-[18px] font-extrabold text-slate-850 dark:text-slate-100 leading-relaxed',
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {listItems.length > 0 && (
                    <div className="my-2 flex flex-col gap-2.5 pl-1">
                        {listItems.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/40 p-3 transition hover:border-slate-200 dark:border-slate-900/60 dark:bg-slate-900/10"
                            >
                                <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                    {item.marker.replace('.', '')}
                                </span>
                                <div className="mt-0.5 flex-1">
                                    {renderRichParagraph(
                                        item.text,
                                        'text-base font-semibold leading-relaxed text-slate-700 dark:text-slate-300',
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {outroLines.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {outroLines.map((line, idx) => (
                            <React.Fragment key={idx}>
                                {renderRichParagraph(
                                    line,
                                    'text-[18px] font-extrabold text-slate-850 dark:text-slate-100 leading-relaxed',
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderTable = (tableText: string) => {
        const rows = tableText.trim().split('\n');

        if (rows.length === 0) {
            return null;
        }

        const parseRow = (rowText: string) => {
            return rowText
                .split('|')
                .slice(1, -1)
                .map((cell) => cell.trim());
        };

        const headers = parseRow(rows[0]);
        const dataRows = rows.slice(2).map(parseRow);

        return (
            <div className="border-slate-150 shadow-3xs my-4 overflow-x-auto rounded-xl border dark:border-slate-800">
                <table className="w-full border-collapse text-left text-xs">
                    <thead>
                        <tr className="border-slate-150 border-b bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/30">
                            {headers.map((h, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-3 font-extrabold tracking-wider text-slate-500 uppercase dark:text-slate-400"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50">
                        {dataRows.map((row, ri) => (
                            <tr
                                key={ri}
                                className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10"
                            >
                                {row.map((cell, ci) => (
                                    <td
                                        key={ci}
                                        className="dark:text-slate-350 px-4 py-3 leading-relaxed font-semibold text-slate-700"
                                    >
                                        {formatMathInline(cell)}
                                    </td>
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
                    return (
                        <React.Fragment key={index}>
                            {renderTable(part)}
                        </React.Fragment>
                    );
                }

                return (
                    <React.Fragment key={index}>
                        {formatNumberedLists(part)}
                    </React.Fragment>
                );
            })}
        </div>
    );
};
