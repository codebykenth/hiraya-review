import {
    BookOpen,
    CheckCircle2,
    HelpCircle,
    Lightbulb,
    ZoomIn,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { formatMathInline } from '@/lib/exam-formatters';
import { parseLaTeXToJSX } from '@/lib/latex-parser';

function ZoomableSvg({
    svgContent,
    isOption = false,
}: {
    svgContent: string;
    isOption?: boolean;
}) {
    const scaledSvg = svgContent.replace(
        /^<svg/,
        `<svg class="${isOption ? 'max-h-32 w-auto h-auto object-contain' : 'max-h-64 w-auto h-auto object-contain'}"`,
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div
                    className={`group relative cursor-pointer overflow-hidden transition-all hover:scale-[1.02] active:scale-95 ${
                        isOption
                            ? 'my-1 flex w-full justify-center'
                            : 'mx-auto my-4 flex w-full max-w-2xl justify-center rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                >
                    <div
                        className="flex w-full items-center justify-center"
                        dangerouslySetInnerHTML={{
                            __html: scaledSvg,
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100 dark:group-hover:bg-white/10">
                        <div className="rounded-full bg-white/90 p-1.5 text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300">
                            <ZoomIn className="size-4" />
                        </div>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
                <div
                    className="flex w-full justify-center rounded-2xl bg-white p-8 dark:bg-slate-900"
                    dangerouslySetInnerHTML={{
                        __html: svgContent.replace(
                            /^<svg/,
                            `<svg class="w-full h-auto max-h-[80vh] object-contain"`,
                        ),
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}

function RevealableAnswer({
    answerContent,
    explanationContent,
}: {
    answerContent: React.ReactNode;
    explanationContent: React.ReactNode;
}) {
    const [isRevealed, setIsRevealed] = useState(false);

    if (!isRevealed) {
        return (
            <div className="mt-4 ml-0 md:ml-8">
                <button
                    onClick={() => setIsRevealed(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                    <HelpCircle className="size-4" />
                    Reveal Answer & Explanation
                </button>
            </div>
        );
    }

    return (
        <div className="mt-3 ml-0 animate-in duration-200 zoom-in-95 fade-in md:ml-8">
            <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-base leading-7 font-bold text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
                <CheckCircle2 className="mt-1 size-5 shrink-0" />
                <span>{answerContent}</span>
            </div>
            {explanationContent && (
                <div className="mt-2">{explanationContent}</div>
            )}
        </div>
    );
}

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
        .replace(/\\leq\b/g, '<=')
        .replace(/\\geq\b/g, '>=')
        .replace(/\\le\b/g, '<=')
        .replace(/\\ge\b/g, '>=')
        .replace(/\\neq\b/g, '!=')
        .replace(/\\approx\b/g, 'approx.')
        .replace(/\\pi\b/g, 'pi')
        .replace(/\\infty\b/g, 'infinity')
        .replace(/\\deg\b/g, ' degrees')
        .replace(/\\alpha\b/g, 'alpha')
        .replace(/\\beta\b/g, 'beta')
        .replace(/\\theta\b/g, 'theta')
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
        .replaceAll('°', ' degrees')
        .replaceAll(' * ', ' × ')
        .replace(/\s{2,}/g, ' ')
        .trim();

export function LessonMarkdown({ content = '' }: LessonMarkdownProps) {
    const parseInline = useCallback((text: string): React.ReactNode => {
        const normalized = cleanText(text);

        if (!normalized) {
            return null;
        }

        const result: React.ReactNode[] = [];
        let i = 0;

        const parseFormatting = (
            str: string,
            keyPrefix: string,
        ): React.ReactNode[] => {
            if (!str) {
                return [];
            }

            // Match **bold** OR *italic* with word boundaries to prevent matching math 2*3*4
            const formatRegex =
                /(\*\*([^*]+?)\*\*)|(^|\W)\*([^\s*](?:[^*]*?[^\s*])?)\*(?=\W|$)/g;
            const parts: React.ReactNode[] = [];
            let lastIdx = 0;
            let match;

            while ((match = formatRegex.exec(str)) !== null) {
                if (match.index > lastIdx) {
                    parts.push(
                        formatMathInline(str.substring(lastIdx, match.index)),
                    );
                }

                if (match[1]) {
                    // Bold match
                    parts.push(
                        <strong
                            key={`${keyPrefix}-bold-${match.index}`}
                            className="font-extrabold text-slate-950 dark:text-white"
                        >
                            {formatMathInline(match[2].trim())}
                        </strong>,
                    );
                } else if (match[4]) {
                    // Italic match
                    // Push the leading boundary character (match[3]) as normal text
                    if (match[3]) {
                        parts.push(formatMathInline(match[3]));
                    }

                    parts.push(
                        <em
                            key={`${keyPrefix}-italic-${match.index}`}
                            className="text-slate-900 italic dark:text-slate-100"
                        >
                            {formatMathInline(match[4].trim())}
                        </em>,
                    );
                }

                lastIdx = formatRegex.lastIndex;
            }

            if (lastIdx < str.length) {
                parts.push(formatMathInline(str.substring(lastIdx)));
            }

            return parts.length > 0 ? parts : [formatMathInline(str)];
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
                            {parseLaTeXToJSX(
                                normalized.substring(i + 2, endIdx),
                            )}
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
                            {parseLaTeXToJSX(
                                normalized.substring(i + 1, endIdx),
                            )}
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
            const nextMathIdx =
                nextDollar === -1 ? normalized.length : nextDollar;
            result.push(
                ...parseFormatting(
                    normalized.substring(i, nextMathIdx),
                    `plain-${i}`,
                ),
            );
            i = nextMathIdx > i ? nextMathIdx : i + 1;
        }

        return result.length > 0 ? <>{result}</> : normalized;
    }, []);

    const parseLineContent = useCallback(
        (text: string): React.ReactNode => {
            const normalized = cleanText(text);

            if (
                normalized.startsWith('**') &&
                normalized.endsWith('**') &&
                normalized.length > 4
            ) {
                return (
                    <strong className="font-extrabold text-slate-950 dark:text-white">
                        {parseInline(
                            normalized.substring(2, normalized.length - 2),
                        )}
                    </strong>
                );
            }

            return parseInline(normalized);
        },
        [parseInline],
    );

    const elements = useMemo(() => {
        const svgMap = new Map<string, string>();
        let svgCounter = 0;

        const normalizedContent = content
            .replace(/\r\n/g, '\n')
            .replace(/\\r\\n/g, '\n')
            .replace(/\\n/g, '\n')
            .replace(/(<svg[\s\S]*?<\/svg>)/gi, (match) => {
                const marker = `___SVG_MARKER_${svgCounter}___`;
                svgMap.set(marker, match);
                svgCounter++;

                return `\n${marker}\n`;
            });

        const lines = normalizedContent.split('\n');
        const rendered: React.ReactNode[] = [];
        let tableHeaders: string[] = [];
        let tableRows: string[][] = [];

        let inLadderBlock = false;
        let ladderLines: string[] = [];

        const flushLadder = (key: string) => {
            if (ladderLines.length === 0) {
                return;
            }

            rendered.push(
                <div
                    key={`ladder-${key}`}
                    className="my-8 flex flex-col font-mono text-xl font-black tracking-widest text-slate-800 dark:text-slate-200"
                >
                    {ladderLines.map((line, i) => {
                        const parts = line.split('|');
                        const divisor = parts[0]?.trim();
                        const numbers = parts[1]?.trim();
                        const isLast = i === ladderLines.length - 1;

                        return (
                            <div key={i} className="flex items-center">
                                <div className="w-12 shrink-0 text-right text-blue-600 dark:text-blue-400">
                                    {divisor}
                                </div>
                                <div
                                    className={`ml-3 px-4 py-2 ${!isLast ? 'border-b-2 border-l-2 border-slate-800 dark:border-slate-200' : 'border-l-2 border-transparent'}`}
                                >
                                    {numbers}
                                </div>
                            </div>
                        );
                    })}
                </div>,
            );
            ladderLines = [];
        };

        const flushTable = (key: string) => {
            if (tableHeaders.length === 0) {
                return;
            }

            const headers = tableHeaders;
            const rows = tableRows;
            tableHeaders = [];
            tableRows = [];

            rendered.push(
                <div
                    key={`table-${key}`}
                    className="my-7 overflow-x-auto rounded-lg border border-slate-200 shadow-sm dark:border-slate-800"
                >
                    <table className="w-full min-w-[36rem] text-left text-sm leading-relaxed">
                        <thead className="bg-slate-100 text-xs font-extrabold text-slate-700 uppercase dark:bg-slate-900 dark:text-slate-200">
                            <tr>
                                {headers.map((header, i) => (
                                    <th
                                        key={i}
                                        className="border-b border-slate-200 px-5 py-3 dark:border-slate-800"
                                    >
                                        {parseLineContent(header)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-slate-700 dark:divide-slate-800 dark:bg-slate-950 dark:text-slate-300">
                            {rows.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-900/70"
                                >
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="px-5 py-3 align-top"
                                        >
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

        for (let idx = 0; idx < lines.length; idx++) {
            const rawLine = lines[idx];
            const trimmed = cleanText(rawLine.trim());

            if (/^```\s*ladder/i.test(trimmed)) {
                inLadderBlock = true;
                flushTable(String(idx));
                continue;
            }

            if (inLadderBlock && /^```/i.test(trimmed)) {
                inLadderBlock = false;
                flushLadder(String(idx));
                continue;
            }

            if (inLadderBlock) {
                if (trimmed) {
                    ladderLines.push(rawLine.trim());
                }

                continue;
            }

            if (!trimmed.startsWith('|')) {
                flushTable(String(idx));
            }

            if (trimmed.startsWith('___SVG_MARKER_')) {
                const svgContent = svgMap.get(trimmed);

                if (svgContent) {
                    rendered.push(
                        <ZoomableSvg
                            key={`svg-block-${idx}`}
                            svgContent={svgContent}
                        />,
                    );
                }

                continue;
            }

            let lastNonEmptyLine = '';

            for (let j = idx - 1; j >= 0; j--) {
                if (lines[j].trim() !== '') {
                    lastNonEmptyLine = lines[j];
                    break;
                }
            }

            const isPrevMath =
                /^[0-9+\-x/*=.,\s]+$/.test(lastNonEmptyLine) &&
                lastNonEmptyLine.trim().length < 40 &&
                /[0-9]/.test(lastNonEmptyLine);

            if (
                /^\s*_{2,30}\s*$/.test(rawLine) ||
                (isPrevMath && /^\s*[-*]{3,30}\s*$/.test(rawLine))
            ) {
                rendered.push(
                    <p
                        key={`hr-${idx}`}
                        className="my-0 font-mono text-lg leading-8 tracking-widest whitespace-pre text-slate-700 dark:text-slate-300"
                    >
                        {rawLine.replace(/[-*]/g, '_')}
                    </p>,
                );

                continue;
            }

            if (/^[-*]{3,30}$/.test(trimmed)) {
                rendered.push(
                    <hr
                        key={`hr-${idx}`}
                        className="my-8 border-t border-slate-200 dark:border-slate-800"
                    />,
                );

                continue;
            }

            if (trimmed.startsWith('|')) {
                const cells = trimmed
                    .split('|')
                    .map((cell) => cleanText(cell))
                    .filter(
                        (cell, cellIndex, arr) =>
                            cellIndex > 0 && cellIndex < arr.length - 1,
                    );

                if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) {
                    continue;
                }

                if (tableHeaders.length === 0) {
                    tableHeaders = cells;
                } else {
                    tableRows.push(cells);
                }

                continue;
            }

            const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);

            if (headerMatch) {
                const level = headerMatch[1].length;
                const headerText = headerMatch[2];

                if (level === 1) {
                    rendered.push(
                        <h1
                            key={`h1-${idx}`}
                            className="mt-8 mb-5 text-2xl leading-tight font-black text-slate-950 dark:text-white"
                        >
                            {parseLineContent(headerText)}
                        </h1>,
                    );
                } else if (level === 2) {
                    const isCheckSection =
                        /check your understanding|quick[- ]?check|self[- ]?assessment/i.test(
                            headerText,
                        );
                    rendered.push(
                        <h2
                            key={`h2-${idx}`}
                            className={`mt-8 mb-4 flex items-center gap-2 border-b pb-3 text-xl leading-tight font-black dark:border-slate-800 dark:text-white ${
                                isCheckSection
                                    ? 'border-blue-200 text-blue-800 dark:text-blue-300'
                                    : 'border-slate-200 text-slate-950'
                            }`}
                        >
                            {isCheckSection ? (
                                <HelpCircle className="size-6 shrink-0" />
                            ) : null}
                            {parseLineContent(headerText)}
                        </h2>,
                    );
                } else if (level === 3) {
                    rendered.push(
                        <h3
                            key={`h3-${idx}`}
                            className="mt-7 mb-3 flex items-center gap-2 text-lg leading-snug font-extrabold text-slate-900 dark:text-white"
                        >
                            <BookOpen className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
                            {parseLineContent(headerText)}
                        </h3>,
                    );
                } else {
                    rendered.push(
                        <h4
                            key={`h4-${idx}`}
                            className="mt-6 mb-2 text-base font-extrabold tracking-wide text-slate-800 uppercase dark:text-slate-200"
                        >
                            {parseLineContent(headerText)}
                        </h4>,
                    );
                }

                continue;
            }

            if (
                /^(Mental Shortcut|Strategy Tip|Core Concept):/i.test(trimmed)
            ) {
                const label = trimmed.substring(0, trimmed.indexOf(':'));
                const body = trimmed.substring(trimmed.indexOf(':') + 1).trim();

                rendered.push(
                    <div
                        key={`callout-${idx}`}
                        className="my-7 rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20"
                    >
                        <span className="mb-2 flex items-center gap-2 text-sm font-black tracking-wide text-amber-800 uppercase dark:text-amber-300">
                            <Lightbulb className="size-4" />
                            {label}
                        </span>
                        <div className="text-base leading-8 text-slate-800 dark:text-slate-200">
                            {parseLineContent(body)}
                        </div>
                    </div>,
                );

                continue;
            }

            if (/^(Q\d+[:.)]|Question\s+\d*[:.)]?)/i.test(trimmed)) {
                rendered.push(
                    <div
                        key={`q-${idx}`}
                        className="mt-7 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-950/20"
                    >
                        <div className="flex items-start gap-3 text-base leading-7 font-extrabold text-slate-950 dark:text-white">
                            <HelpCircle className="mt-1 size-5 shrink-0 text-blue-700 dark:text-blue-300" />
                            <span>{parseLineContent(trimmed)}</span>
                        </div>
                    </div>,
                );

                continue;
            }

            if (/^[A-E][).]\s+/.test(trimmed)) {
                rendered.push(
                    <div
                        key={`opt-${idx}`}
                        className="mt-2 ml-0 flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-base leading-7 font-semibold text-slate-700 md:ml-8 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {trimmed.charAt(0)}
                        </span>
                        <span>{parseLineContent(trimmed.substring(2))}</span>
                    </div>,
                );

                continue;
            }

            if (/^Answer:/i.test(trimmed)) {
                const answerNodes: React.ReactNode[] = [
                    <span key={`ans-text-${idx}`}>
                        {parseLineContent(trimmed)}
                    </span>,
                ];
                const explanationNodes: React.ReactNode[] = [];
                let currentTarget = answerNodes;
                let blockEndIdx = idx;

                for (let j = idx + 1; j < lines.length; j++) {
                    const nextTrimmed = cleanText(lines[j].trim());

                    if (nextTrimmed === '') {
continue;
}

                    // Stop if we hit a new Question, a Header, Divider, or new block
                    if (
                        /^(Q\d+[:.)]|Question\s+\d*[:.)]?)/i.test(
                            nextTrimmed,
                        ) ||
                        /^#/.test(nextTrimmed) ||
                        /^[-*]{3,30}$/.test(nextTrimmed) ||
                        /^\s*_{2,30}\s*$/.test(nextTrimmed) ||
                        /^(Mental Shortcut|Strategy Tip|Core Concept):/i.test(
                            nextTrimmed,
                        ) ||
                        /^Answer:/i.test(nextTrimmed)
                    ) {
                        break;
                    }

                    if (/^Explanation:/i.test(nextTrimmed)) {
                        currentTarget = explanationNodes;
                        currentTarget.push(
                            <div
                                key={`explanation-${j}`}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base leading-8 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                            >
                                {parseLineContent(nextTrimmed)}
                            </div>,
                        );
                    } else if (nextTrimmed.startsWith('___SVG_MARKER_')) {
                        const svgContent = svgMap.get(nextTrimmed);

                        if (svgContent) {
                            currentTarget.push(
                                <ZoomableSvg
                                    key={`svg-block-${j}`}
                                    svgContent={svgContent}
                                />,
                            );
                        }
                    } else if (/^[-*]\s+/.test(nextTrimmed)) {
                        currentTarget.push(
                            <div
                                key={`ul-${j}`}
                                className="mt-2 flex gap-3 pl-1 text-base leading-8 text-slate-700 dark:text-slate-300"
                            >
                                <span className="mt-3 size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                                <span>
                                    {parseLineContent(
                                        nextTrimmed.substring(1).trim(),
                                    )}
                                </span>
                            </div>,
                        );
                    } else {
                        // Standard paragraph
                        currentTarget.push(
                            <div
                                key={`text-${j}`}
                                className="mt-2 px-4 text-base leading-8 text-slate-700 dark:text-slate-300"
                            >
                                {parseLineContent(nextTrimmed)}
                            </div>,
                        );
                    }

                    blockEndIdx = j;
                }

                rendered.push(
                    <RevealableAnswer
                        key={`answer-block-${idx}`}
                        answerContent={
                            <div className="flex flex-col gap-2">
                                {answerNodes}
                            </div>
                        }
                        explanationContent={
                            explanationNodes.length > 0 ? (
                                <div className="mt-2 flex flex-col gap-2">
                                    {explanationNodes}
                                </div>
                            ) : null
                        }
                    />,
                );

                idx = blockEndIdx;
                continue;
            }

            if (/^Explanation:/i.test(trimmed)) {
                const explanationNodes: React.ReactNode[] = [
                    <div
                        key={`explanation-${idx}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-base leading-8 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                    >
                        {parseLineContent(trimmed)}
                    </div>,
                ];
                let blockEndIdx = idx;

                for (let j = idx + 1; j < lines.length; j++) {
                    const nextTrimmed = cleanText(lines[j].trim());

                    if (nextTrimmed === '') {
continue;
}

                    if (
                        /^(Q\d+[:.)]|Question\s+\d*[:.)]?)/i.test(
                            nextTrimmed,
                        ) ||
                        /^#/.test(nextTrimmed) ||
                        /^[-*]{3,30}$/.test(nextTrimmed) ||
                        /^\s*_{2,30}\s*$/.test(nextTrimmed) ||
                        /^(Mental Shortcut|Strategy Tip|Core Concept):/i.test(
                            nextTrimmed,
                        ) ||
                        /^Answer:/i.test(nextTrimmed) ||
                        /^Explanation:/i.test(nextTrimmed)
                    ) {
                        break;
                    }

                    if (nextTrimmed.startsWith('___SVG_MARKER_')) {
                        const svgContent = svgMap.get(nextTrimmed);

                        if (svgContent) {
                            explanationNodes.push(
                                <ZoomableSvg
                                    key={`svg-block-${j}`}
                                    svgContent={svgContent}
                                />,
                            );
                        }
                    } else if (/^[-*]\s+/.test(nextTrimmed)) {
                        explanationNodes.push(
                            <div
                                key={`ul-${j}`}
                                className="mt-2 flex gap-3 pl-1 text-base leading-8 text-slate-700 dark:text-slate-300"
                            >
                                <span className="mt-3 size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                                <span>
                                    {parseLineContent(
                                        nextTrimmed.substring(1).trim(),
                                    )}
                                </span>
                            </div>,
                        );
                    } else {
                        explanationNodes.push(
                            <div
                                key={`text-${j}`}
                                className="mt-2 px-4 text-base leading-8 text-slate-700 dark:text-slate-300"
                            >
                                {parseLineContent(nextTrimmed)}
                            </div>,
                        );
                    }

                    blockEndIdx = j;
                }

                rendered.push(
                    <RevealableAnswer
                        key={`explanation-standalone-${idx}`}
                        answerContent="See Explanation"
                        explanationContent={
                            <div className="mt-2 flex flex-col gap-2">
                                {explanationNodes}
                            </div>
                        }
                    />,
                );

                idx = blockEndIdx;
                continue;
            }

            if (/^[-*]\s+/.test(trimmed)) {
                rendered.push(
                    <div
                        key={`ul-${idx}`}
                        className="my-2 flex gap-3 pl-1 text-base leading-8 text-slate-700 dark:text-slate-300"
                    >
                        <span className="mt-3 size-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" />
                        <span>
                            {parseLineContent(trimmed.substring(1).trim())}
                        </span>
                    </div>,
                );

                continue;
            }

            if (/^\d+\.\s+/.test(trimmed)) {
                const numberEnd = trimmed.indexOf('.');
                rendered.push(
                    <div
                        key={`ol-${idx}`}
                        className="my-2 flex gap-3 pl-1 text-base leading-8 text-slate-700 dark:text-slate-300"
                    >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {trimmed.substring(0, numberEnd)}
                        </span>
                        <span>
                            {parseLineContent(
                                trimmed.substring(numberEnd + 1).trim(),
                            )}
                        </span>
                    </div>,
                );

                continue;
            }

            if (trimmed === '') {
                rendered.push(<div key={`empty-${idx}`} className="h-3" />);

                continue;
            }

            const isMathLine =
                /^[0-9+\-x/*=.,\s]+$/.test(rawLine) &&
                rawLine.trim().length < 40 &&
                /[0-9]/.test(rawLine);

            rendered.push(
                <p
                    key={`p-${idx}`}
                    className={`${
                        isMathLine
                            ? 'my-0 font-mono text-lg tracking-widest whitespace-pre'
                            : 'my-4 text-base'
                    } leading-8 text-slate-700 dark:text-slate-300`}
                >
                    {isMathLine ? rawLine : parseLineContent(trimmed)}
                </p>,
            );
        }

        flushTable('end');
        flushLadder('end');

        return rendered;
    }, [content, parseLineContent]);

    return <div className="space-y-1">{elements}</div>;
}
