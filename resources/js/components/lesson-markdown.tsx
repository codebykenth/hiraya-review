import { BookOpen, CheckCircle2, HelpCircle, Lightbulb } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

export interface LessonMarkdownProps {
    content: string;
}

const cleanText = (value: string): string =>
    value
        .replaceAll('\\"', '"')
        .replaceAll('\\“', '"')
        .replaceAll('\\”', '"')
        .replaceAll('\\dots', '...')
        .replaceAll('\\ldots', '...')
        .replaceAll('\\times', 'x')
        .replaceAll('\\cdot', '*')
        .replaceAll('\\div', '/')
        .replaceAll('\\pm', '+/-')
        .replaceAll('\\leq', '<=')
        .replaceAll('\\geq', '>=')
        .replaceAll('\\le', '<=')
        .replaceAll('\\ge', '>=')
        .replaceAll('\\neq', '!=')
        .replaceAll('\\approx', 'approx.')
        .replaceAll('\\pi', 'pi')
        .replaceAll('\\infty', 'infinity')
        .replaceAll('\\deg', ' degrees')
        .replaceAll('\\alpha', 'alpha')
        .replaceAll('\\beta', 'beta')
        .replaceAll('\\theta', 'theta')
        .replaceAll('\\*', '*')
        .replaceAll('\\_', '_')
        .replaceAll('\\`', '`')
        .replaceAll('💡', '')
        .replaceAll('🧠', '')
        .replaceAll('🚀', '')
        .replaceAll('📝', '')
        .replaceAll('🎯', '')
        .replaceAll('⏱️', '')
        .replaceAll('ðŸ’¡', '')
        .replaceAll('ðŸ§ ', '')
        .replaceAll('ðŸš€', '')
        .replaceAll('ðŸ“', '')
        .replaceAll('ðŸŽ¯', '')
        .replaceAll('â±ï¸', '')
        .replaceAll('Â±', '+/-')
        .replaceAll('Ã—', 'x')
        .replaceAll('Â·', '*')
        .replaceAll('Ã·', '/')
        .replaceAll('â‰¤', '<=')
        .replaceAll('â‰¥', '>=')
        .replaceAll('â‰ ', '!=')
        .replaceAll('â‰ˆ', 'approx.')
        .replaceAll('Ï€', 'pi')
        .replaceAll('âˆž', 'infinity')
        .replaceAll('Â°', ' degrees')
        .replace(/\s{2,}/g, ' ')
        .trim();

export function LessonMarkdown({ content = '' }: LessonMarkdownProps) {
    const findMatchingBrace = useCallback((str: string, startIndex: number): number => {
        let count = 0;

        for (let idx = startIndex; idx < str.length; idx++) {
            if (str[idx] === '{') {
                count++;
            }

            if (str[idx] === '}') {
                count--;

                if (count === 0) {
                    return idx;
                }
            }
        }

        return -1;
    }, []);

    const parseLaTeXToJSX = useCallback((latex: string): React.ReactNode => {
        const parseBlock = (str: string): React.ReactNode[] => {
            const result: React.ReactNode[] = [];
            let i = 0;

            while (i < str.length) {
                if (str.startsWith('\\text{', i)) {
                    const matchIndex = findMatchingBrace(str, i + 5);

                    if (matchIndex !== -1) {
                        result.push(
                            <span key={i} className="mx-1 font-sans font-medium">
                                {str.substring(i + 6, matchIndex)}
                            </span>,
                        );
                        i = matchIndex + 1;
                        continue;
                    }
                }

                if (str.startsWith('\\frac{', i)) {
                    const numStart = i + 5;
                    const numEnd = findMatchingBrace(str, numStart);

                    if (numEnd !== -1) {
                        let denomStart = numEnd + 1;

                        while (denomStart < str.length && str[denomStart] !== '{') {
                            denomStart++;
                        }

                        const denomEnd = denomStart < str.length ? findMatchingBrace(str, denomStart) : -1;

                        if (denomEnd !== -1) {
                            result.push(
                                <span key={i} className="mx-1 inline-flex flex-col align-middle leading-none text-center">
                                    <span className="block border-b border-slate-500 px-1 pb-0.5 text-[0.9em] dark:border-slate-500">
                                        {parseBlock(str.substring(numStart + 1, numEnd))}
                                    </span>
                                    <span className="block px-1 pt-0.5 text-[0.9em]">
                                        {parseBlock(str.substring(denomStart + 1, denomEnd))}
                                    </span>
                                </span>,
                            );
                            i = denomEnd + 1;
                            continue;
                        }
                    }
                }

                if (str[i] === '^' || str[i] === '_') {
                    const isSup = str[i] === '^';

                    if (str[i + 1] === '{') {
                        const braceEnd = findMatchingBrace(str, i + 1);

                        if (braceEnd !== -1) {
                            const content = parseBlock(str.substring(i + 2, braceEnd));
                            result.push(
                                isSup ? (
                                    <sup key={i} className="text-[0.75em] font-bold leading-none">
                                        {content}
                                    </sup>
                                ) : (
                                    <sub key={i} className="text-[0.75em] leading-none">
                                        {content}
                                    </sub>
                                ),
                            );
                            i = braceEnd + 1;
                            continue;
                        }
                    }

                    const char = str[i + 1] || '';
                    result.push(
                        isSup ? (
                            <sup key={i} className="text-[0.75em] font-bold leading-none">
                                {char}
                            </sup>
                        ) : (
                            <sub key={i} className="text-[0.75em] leading-none">
                                {char}
                            </sub>
                        ),
                    );
                    i += 2;
                    continue;
                }

                const commands = [
                    { cmd: '\\pm', symbol: ' +/- ' },
                    { cmd: '\\times', symbol: ' x ' },
                    { cmd: '\\cdot', symbol: ' * ' },
                    { cmd: '\\div', symbol: ' / ' },
                    { cmd: '\\dots', symbol: '...' },
                    { cmd: '\\ldots', symbol: '...' },
                    { cmd: '\\left(', symbol: '(' },
                    { cmd: '\\right)', symbol: ')' },
                    { cmd: '\\left[', symbol: '[' },
                    { cmd: '\\right]', symbol: ']' },
                    { cmd: '\\left\\{', symbol: '{' },
                    { cmd: '\\right\\}', symbol: '}' },
                    { cmd: '\\{', symbol: '{' },
                    { cmd: '\\}', symbol: '}' },
                    { cmd: '\\le', symbol: ' <= ' },
                    { cmd: '\\leq', symbol: ' <= ' },
                    { cmd: '\\ge', symbol: ' >= ' },
                    { cmd: '\\geq', symbol: ' >= ' },
                    { cmd: '\\neq', symbol: ' != ' },
                    { cmd: '\\approx', symbol: ' approx. ' },
                    { cmd: '\\pi', symbol: 'pi' },
                    { cmd: '\\infty', symbol: 'infinity' },
                    { cmd: '\\deg', symbol: ' degrees' },
                    { cmd: '\\alpha', symbol: 'alpha' },
                    { cmd: '\\beta', symbol: 'beta' },
                    { cmd: '\\theta', symbol: 'theta' },
                ];

                const command = commands.find((item) => str.startsWith(item.cmd, i));

                if (command) {
                    result.push(
                        <span key={i} className="mx-0.5">
                            {command.symbol}
                        </span>,
                    );
                    i += command.cmd.length;
                    continue;
                }

                if (str[i] === '\\' && i + 1 < str.length) {
                    result.push(str[i + 1]);
                    i += 2;
                    continue;
                }

                result.push(str[i]);
                i++;
            }

            return result;
        };

        return <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{parseBlock(latex)}</span>;
    }, [findMatchingBrace]);

    const parseInline = useCallback((text: string): React.ReactNode => {
        const normalized = cleanText(text);

        if (!normalized) {
            return null;
        }

        const result: React.ReactNode[] = [];
        let i = 0;

        const parseBoldOnly = (str: string, keyPrefix: string): React.ReactNode[] => {
            if (!str) {
                return [];
            }

            const boldRegex = /\*+([^*]+?)\*+/g;
            const parts: React.ReactNode[] = [];
            let lastIdx = 0;
            let match;

            while ((match = boldRegex.exec(str)) !== null) {
                if (match.index > lastIdx) {
                    parts.push(str.substring(lastIdx, match.index));
                }

                parts.push(
                    <strong key={`${keyPrefix}-bold-${match.index}`} className="font-extrabold text-slate-950 dark:text-white">
                        {match[1].trim()}
                    </strong>,
                );
                lastIdx = boldRegex.lastIndex;
            }

            if (lastIdx < str.length) {
                parts.push(str.substring(lastIdx));
            }

            return parts.length > 0 ? parts : [str];
        };

        while (i < normalized.length) {
            if (normalized.startsWith('$$', i)) {
                const endIdx = normalized.indexOf('$$', i + 2);

                if (endIdx !== -1) {
                    result.push(
                        <div
                            key={`display-math-${i}`}
                            className="my-5 flex items-center justify-center overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-base dark:border-slate-800 dark:bg-slate-900/70"
                        >
                            {parseLaTeXToJSX(normalized.substring(i + 2, endIdx))}
                        </div>,
                    );
                    i = endIdx + 2;
                    continue;
                }
            }

            if (normalized[i] === '$') {
                const endIdx = normalized.indexOf('$', i + 1);

                if (endIdx !== -1) {
                    result.push(
                        <span
                            key={`inline-math-${i}`}
                            className="mx-1 inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[0.95em] dark:border-blue-900/50 dark:bg-blue-950/30"
                        >
                            {parseLaTeXToJSX(normalized.substring(i + 1, endIdx))}
                        </span>,
                    );
                    i = endIdx + 1;
                    continue;
                }

                result.push('$');
                i++;
                continue;
            }

            const nextDollar = normalized.indexOf('$', i);
            const nextMathIdx = nextDollar === -1 ? normalized.length : nextDollar;
            result.push(...parseBoldOnly(normalized.substring(i, nextMathIdx), `plain-${i}`));
            i = nextMathIdx > i ? nextMathIdx : i + 1;
        }

        return result.length > 0 ? <>{result}</> : normalized;
    }, [parseLaTeXToJSX]);

    const parseLineContent = useCallback((text: string): React.ReactNode => {
        const normalized = cleanText(text);

        if (normalized.startsWith('**') && normalized.endsWith('**') && normalized.length > 4) {
            return (
                <strong className="font-extrabold text-slate-950 dark:text-white">
                    {parseInline(normalized.substring(2, normalized.length - 2))}
                </strong>
            );
        }

        return parseInline(normalized);
    }, [parseInline]);

    const elements = useMemo(() => {
        const normalizedContent = content
            .replace(/\r\n/g, '\n')
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\n');
        const lines = normalizedContent.split('\n');
        const rendered: React.ReactNode[] = [];
        let tableHeaders: string[] = [];
        let tableRows: string[][] = [];

        const flushTable = (key: string) => {
            if (tableHeaders.length === 0) {
                return;
            }

            const headers = tableHeaders;
            const rows = tableRows;
            tableHeaders = [];
            tableRows = [];

            rendered.push(
                <div key={`table-${key}`} className="my-7 overflow-x-auto rounded-lg border border-slate-200 shadow-sm dark:border-slate-800">
                    <table className="w-full min-w-[36rem] text-left text-sm leading-relaxed">
                        <thead className="bg-slate-100 text-xs font-extrabold uppercase text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            <tr>
                                {headers.map((header, i) => (
                                    <th key={i} className="border-b border-slate-200 px-5 py-3 dark:border-slate-800">
                                        {parseLineContent(header)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700 dark:divide-slate-800 dark:bg-slate-950 dark:text-slate-300">
                            {rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-5 py-3 align-top">
                                            {parseLineContent(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>,
            );
        };

        lines.forEach((rawLine, idx) => {
            const trimmed = cleanText(rawLine.trim());

            if (!trimmed.startsWith('|')) {
                flushTable(String(idx));
            }

            if (/^[-*_]{2,30}$/.test(trimmed)) {
                rendered.push(<hr key={`hr-${idx}`} className="my-8 border-t border-slate-200 dark:border-slate-800" />);

                return;
            }

            if (trimmed.startsWith('|')) {
                const cells = trimmed
                    .split('|')
                    .map((cell) => cleanText(cell))
                    .filter((cell, cellIndex, arr) => cellIndex > 0 && cellIndex < arr.length - 1);

                if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) {
                    return;
                }

                if (tableHeaders.length === 0) {
                    tableHeaders = cells;
                } else {
                    tableRows.push(cells);
                }

                return;
            }

            const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);

            if (headerMatch) {
                const level = headerMatch[1].length;
                const headerText = headerMatch[2];

                if (level === 1) {
                    rendered.push(
                        <h1 key={`h1-${idx}`} className="mb-5 mt-8 text-2xl font-black leading-tight text-slate-950 dark:text-white">
                            {parseLineContent(headerText)}
                        </h1>,
                    );
                } else if (level === 2) {
                    const isCheckSection = /check your understanding|quick[- ]?check|self[- ]?assessment/i.test(headerText);
                    rendered.push(
                        <h2
                            key={`h2-${idx}`}
                            className={`mb-4 mt-8 flex items-center gap-2 border-b pb-3 text-xl font-black leading-tight dark:border-slate-800 dark:text-white ${isCheckSection ? 'border-blue-200 text-blue-800 dark:text-blue-300' : 'border-slate-200 text-slate-950'
                                }`}
                        >
                            {isCheckSection ? <HelpCircle className="size-6 shrink-0" /> : null}
                            {parseLineContent(headerText)}
                        </h2>,
                    );
                } else if (level === 3) {
                    rendered.push(
                        <h3 key={`h3-${idx}`} className="mb-3 mt-7 flex items-center gap-2 text-lg font-extrabold leading-snug text-slate-900 dark:text-white">
                            <BookOpen className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                            {parseLineContent(headerText)}
                        </h3>,
                    );
                } else {
                    rendered.push(
                        <h4 key={`h4-${idx}`} className="mb-2 mt-6 text-base font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">
                            {parseLineContent(headerText)}
                        </h4>,
                    );
                }

                return;
            }

            if (/^(Mental Shortcut|Strategy Tip|Core Concept):/i.test(trimmed)) {
                const label = trimmed.substring(0, trimmed.indexOf(':'));
                const body = trimmed.substring(trimmed.indexOf(':') + 1).trim();

                rendered.push(
                    <div key={`callout-${idx}`} className="my-7 rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                        <span className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-amber-800 dark:text-amber-300">
                            <Lightbulb className="size-4" />
                            {label}
                        </span>
                        <div className="text-base leading-8 text-slate-800 dark:text-slate-200">{parseLineContent(body)}</div>
                    </div>,
                );

                return;
            }

            if (/^(Q\d+[:.)]|Question\s+\d*[:.)]?)/i.test(trimmed)) {
                rendered.push(
                    <div key={`q-${idx}`} className="mt-7 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                        <div className="flex items-start gap-3 text-base font-extrabold leading-7 text-slate-950 dark:text-white">
                            <HelpCircle className="mt-1 size-5 shrink-0 text-blue-700 dark:text-blue-300" />
                            <span>{parseLineContent(trimmed)}</span>
                        </div>
                    </div>,
                );

                return;
            }

            if (/^[A-E][).]\s+/.test(trimmed)) {
                rendered.push(
                    <div
                        key={`opt-${idx}`}
                        className="ml-0 mt-2 flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-base font-semibold leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 md:ml-8"
                    >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {trimmed.charAt(0)}
                        </span>
                        <span>{parseLineContent(trimmed.substring(2))}</span>
                    </div>,
                );

                return;
            }

            if (/^Answer:/i.test(trimmed)) {
                rendered.push(
                    <div
                        key={`answer-${idx}`}
                        className="ml-0 mt-3 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-bold leading-7 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200 md:ml-8"
                    >
                        <CheckCircle2 className="mt-1 size-5 shrink-0" />
                        <span>{parseLineContent(trimmed)}</span>
                    </div>,
                );

                return;
            }

            if (/^Explanation:/i.test(trimmed)) {
                rendered.push(
                    <div
                        key={`explanation-${idx}`}
                        className="ml-0 mt-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base leading-8 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 md:ml-8"
                    >
                        {parseLineContent(trimmed)}
                    </div>,
                );

                return;
            }

            if (/^[-*]\s+/.test(trimmed)) {
                rendered.push(
                    <div key={`ul-${idx}`} className="my-2 flex gap-3 pl-1 text-base leading-8 text-slate-700 dark:text-slate-300">
                        <span className="mt-3 size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span>{parseLineContent(trimmed.substring(1).trim())}</span>
                    </div>,
                );

                return;
            }

            if (/^\d+\.\s+/.test(trimmed)) {
                const numberEnd = trimmed.indexOf('.');
                rendered.push(
                    <div key={`ol-${idx}`} className="my-2 flex gap-3 pl-1 text-base leading-8 text-slate-700 dark:text-slate-300">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {trimmed.substring(0, numberEnd)}
                        </span>
                        <span>{parseLineContent(trimmed.substring(numberEnd + 1).trim())}</span>
                    </div>,
                );

                return;
            }

            if (trimmed === '') {
                rendered.push(<div key={`empty-${idx}`} className="h-3" />);

                return;
            }

            rendered.push(
                <p key={`p-${idx}`} className="my-4 text-base leading-8 text-slate-700 dark:text-slate-300">
                    {parseLineContent(trimmed)}
                </p>,
            );
        });

        flushTable('end');

        return rendered;
    }, [content, parseLineContent]);

    return <div className="space-y-1">{elements}</div>;
}
