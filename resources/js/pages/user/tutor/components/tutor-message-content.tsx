import {
    Zap,
    FileText,
    Pin,
    Lightbulb,
    AlertTriangle,
    ListOrdered,
} from 'lucide-react';
import React from 'react';

interface TutorMessageContentProps {
    content: string;
}

interface ParsedListItem {
    main: string;
    subItems: string[];
    isStep: boolean;
    stepNum?: string;
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&rarr;/gi, '→')
        .replace(/&larr;/gi, '←')
        .replace(/&uarr;/gi, '↑')
        .replace(/&darr;/gi, '↓')
        .replace(/&harr;/gi, '↔')
        .replace(/&times;/gi, '×')
        .replace(/&plusmn;/gi, '±')
        .replace(/&le;/gi, '≤')
        .replace(/&ge;/gi, '≥')
        .replace(/&ne;/gi, '≠')
        .replace(/&deg;/gi, '°')
        .replace(/&bull;/gi, '•')
        .replace(/&hellip;/gi, '…')
        .replace(/&radic;/gi, '√')
        .replace(/&sim;/gi, '~')
        .replace(/&asymp;/gi, '≈')
        .replace(/&divide;/gi, '÷')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&amp;/gi, '&')
        .replace(/&#(\d+);/g, (_, dec) => {
            const code = parseInt(dec, 10);

            return code ? String.fromCharCode(code) : '';
        })
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
            const code = parseInt(hex, 16);

            return code ? String.fromCharCode(code) : '';
        });
}

function cleanLatexFormula(latex: string): string {
    return latex
        .replace(/^\$\$|\$\$$/g, '')
        .replace(/^\$|\$$/g, '')
        .replace(/\\text\{([^}]+)\}/g, '$1')
        .replace(/\\mathrm\{([^}]+)\}/g, '$1')
        .replace(/\\mathbf\{([^}]+)\}/g, '$1')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)')
        .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
        .replace(/\\sqrt/g, '√')
        .replace(/\\times/g, '×')
        .replace(/\\cdot/g, '·')
        .replace(/\\pm/g, '±')
        .replace(/\\leq/g, '≤')
        .replace(/\\geq/g, '≥')
        .replace(/\\neq/g, '≠')
        .replace(/\\approx/g, '≈')
        .replace(/\\div/g, '÷')
        .replace(/\\%/g, '%')
        .replace(/\\left\|/g, '|')
        .replace(/\\right\|/g, '|')
        .replace(/\\left\(/g, '(')
        .replace(/\\right\)/g, ')')
        .replace(/\\left\[/g, '[')
        .replace(/\\right\]/g, ']')
        .trim();
}

function renderInline(text: string): React.ReactNode {
    const decoded = decodeHtmlEntities(text);

    // Code (`...`), inline math ($...$), bold (**...**), or strict letter-bounded italic (*...*)
    const parts = decoded.split(
        /(`[^`]+`|\$[^$\n]+\$|\*\*[^*]+\*\*|\*(?=[a-zA-Z])[^*\n`]+(?<=[a-zA-Z0-9.,!?])\*)/g,
    );

    return parts.map((part, idx) => {
        if (!part) {
            return null;
        }

        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
            const codeText = part.slice(1, -1);
            // Math expressions or numerical formulas
            const isMathExpr = /[\d+\-*/=^()√]|sqrt|pi/i.test(codeText);

            return (
                <code
                    key={idx}
                    className={`mx-0.5 inline-block rounded-md align-baseline font-mono select-all ${
                        isMathExpr
                            ? 'border border-indigo-200/90 bg-indigo-50/90 px-2 py-0.5 text-sm font-bold tracking-normal text-indigo-700 shadow-2xs sm:text-base dark:border-indigo-800/70 dark:bg-indigo-950/70 dark:text-indigo-300'
                            : 'border border-border/80 bg-muted/80 px-1.5 py-0.5 text-xs font-semibold text-foreground sm:text-sm'
                    }`}
                >
                    {codeText}
                </code>
            );
        }

        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
            const mathText = cleanLatexFormula(part.slice(1, -1));

            return (
                <code
                    key={idx}
                    className="mx-0.5 inline-block rounded-md border border-indigo-200/90 bg-indigo-50/90 px-2 py-0.5 align-baseline font-mono text-sm font-bold tracking-normal text-indigo-700 shadow-2xs select-all sm:text-base dark:border-indigo-800/70 dark:bg-indigo-950/70 dark:text-indigo-300"
                >
                    {mathText}
                </code>
            );
        }

        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
            return (
                <strong key={idx} className="font-bold text-foreground">
                    {renderInline(part.slice(2, -2))}
                </strong>
            );
        }

        if (
            part.startsWith('*') &&
            part.endsWith('*') &&
            part.length >= 2 &&
            !part.startsWith('**')
        ) {
            return (
                <em key={idx} className="text-foreground/90 italic">
                    {renderInline(part.slice(1, -1))}
                </em>
            );
        }

        return part;
    });
}

function isSubContentLine(
    rawLine: string,
    content: string,
    lastItem: ParsedListItem | null,
): boolean {
    if (!lastItem) {
        return false;
    }

    // Explicitly indented in markdown (2+ spaces or a tab)
    if (/^\s{2,}|\t/.test(rawLine)) {
        return true;
    }

    // If previous item was a Step (e.g. Step 1: Parentheses)
    if (lastItem.isStep) {
        // A new step is NOT sub-content
        if (/^(\*{0,2})Step\s+\d+/i.test(content)) {
            return false;
        }

        // Sub-step calculations, expressions, or intermediate details
        if (
            /^(Inside|Expression|Evaluate|Multiply|Divide|Calculate|Subtract|Add|Substitute|Simplify|Result|Where|Note|Reason|Why|Formula|Because|Then|Next|Step\s*becomes|Solving|Check|Therefore)/i.test(
                content,
            )
        ) {
            return true;
        }

        if (/^[`\d+\-*/=^()√]/.test(content)) {
            return true;
        }

        // Action labels like "Multiply first:", "Divide next:", etc.
        if (/^[A-Za-z\s]+:\s*.+/i.test(content)) {
            return true;
        }
    }

    return false;
}

export function TutorMessageContent({ content }: TutorMessageContentProps) {
    if (!content) {
        return null;
    }

    const cleanContent = content.replace(/CITATIONS:\s*(.+)$/im, '').trim();

    if (!cleanContent) {
        return null;
    }

    const lines = cleanContent.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: {
        type: 'bullet' | 'number';
        items: ParsedListItem[];
    } | null = null;
    let currentQuote: string[] | null = null;
    let currentTable: string[] | null = null;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let inLatexBlock = false;
    let latexBlockLines: string[] = [];

    const flushCodeBlock = () => {
        if (!inCodeBlock && codeBlockLines.length === 0) {
            return;
        }

        const rawCode = codeBlockLines.join('\n');
        const trimmedCode = rawCode.replace(/^\n+|\n+$/g, '');

        elements.push(
            <div
                key={`code-${elements.length}`}
                className="my-3.5 overflow-x-auto rounded-xl border border-indigo-200/60 bg-slate-900 p-4 font-mono text-xs text-emerald-300 shadow-2xs sm:text-sm dark:border-indigo-900/60 dark:bg-slate-950"
            >
                <pre className="font-mono leading-relaxed whitespace-pre select-all">
                    {decodeHtmlEntities(trimmedCode)}
                </pre>
            </div>,
        );

        inCodeBlock = false;
        codeBlockLines = [];
    };

    const flushLatexBlock = () => {
        if (!inLatexBlock && latexBlockLines.length === 0) {
            return;
        }

        const formulaText = latexBlockLines.join(' ');
        const cleaned = cleanLatexFormula(formulaText);

        elements.push(
            <div
                key={`formula-${elements.length}`}
                className="my-3.5 flex items-center justify-center rounded-xl border border-indigo-200/90 bg-indigo-50/80 p-3.5 text-center font-mono text-sm font-bold text-indigo-900 shadow-2xs select-all sm:p-4 sm:text-base dark:border-indigo-800/70 dark:bg-indigo-950/60 dark:text-indigo-200"
            >
                <span>{cleaned}</span>
            </div>,
        );

        inLatexBlock = false;
        latexBlockLines = [];
    };

    const flushQuote = () => {
        if (!currentQuote || currentQuote.length === 0) {
            currentQuote = null;

            return;
        }

        const fullText = currentQuote.join(' ');
        const isTip = /shortcut|tip|trick|fast track|key idea/i.test(fullText);
        const isTrap = /trap|warning|caution|mistake|common error|avoid/i.test(
            fullText,
        );

        elements.push(
            <div
                key={`quote-${elements.length}`}
                className={`my-3.5 flex items-start gap-3 rounded-xl border-l-4 p-3.5 text-sm shadow-2xs sm:p-4 sm:text-[15px] ${
                    isTrap
                        ? 'border-rose-500 bg-rose-50/70 text-rose-950 dark:border-rose-400 dark:bg-rose-950/30 dark:text-rose-100'
                        : isTip
                          ? 'border-amber-500 bg-amber-50/70 text-amber-950 dark:border-amber-400 dark:bg-amber-950/30 dark:text-amber-100'
                          : 'border-indigo-500 bg-indigo-50/70 text-foreground dark:border-indigo-400 dark:bg-indigo-950/30'
                }`}
            >
                <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg ${
                        isTrap
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : isTip
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    }`}
                >
                    {isTrap ? (
                        <AlertTriangle className="size-3.5" />
                    ) : isTip ? (
                        <Zap className="size-3.5" />
                    ) : (
                        <Lightbulb className="size-3.5" />
                    )}
                </span>
                <div className="flex-1 space-y-1.5 leading-relaxed font-medium">
                    {currentQuote.map((qLine, qIdx) => (
                        <p key={qIdx}>{renderInline(qLine)}</p>
                    ))}
                </div>
            </div>,
        );

        currentQuote = null;
    };

    const flushTable = () => {
        if (!currentTable || currentTable.length < 2) {
            currentTable = null;

            return;
        }

        const rawRows = currentTable.map((row) =>
            row
                .split('|')
                .slice(1, -1)
                .map((cell) => cell.trim()),
        );

        // Filter out markdown separator line (|---|---|)
        const validRows = rawRows.filter(
            (row) => !row.every((cell) => /^[-: ]+$/.test(cell)),
        );

        if (validRows.length >= 1) {
            const headerRow = validRows[0];
            const dataRows = validRows.slice(1);

            elements.push(
                <div
                    key={`table-${elements.length}`}
                    className="my-3.5 overflow-x-auto rounded-xl border border-border/80 bg-card shadow-2xs"
                >
                    <table className="w-full text-left text-sm sm:text-[14px]">
                        <thead className="border-b border-border/80 bg-muted/60 font-semibold text-foreground">
                            <tr>
                                {headerRow.map((cell, cIdx) => (
                                    <th key={cIdx} className="px-3.5 py-2.5">
                                        {renderInline(cell)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-foreground/90">
                            {dataRows.map((row, rIdx) => (
                                <tr
                                    key={rIdx}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    {row.map((cell, cIdx) => (
                                        <td
                                            key={cIdx}
                                            className="px-3.5 py-2.5 leading-relaxed"
                                        >
                                            {renderInline(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>,
            );
        }

        currentTable = null;
    };

    const flushList = () => {
        if (!currentList || currentList.items.length === 0) {
            currentList = null;

            return;
        }

        const isNumbered = currentList.type === 'number';

        elements.push(
            <ul
                key={`list-${elements.length}`}
                className="my-3 space-y-3 pl-0.5"
            >
                {currentList.items.map((item, i) => (
                    <li
                        key={i}
                        className="space-y-1.5 text-sm leading-relaxed text-foreground sm:text-[15px]"
                    >
                        <div className="flex items-start gap-2.5">
                            {item.isStep ? (
                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-bold text-white shadow-2xs select-none">
                                    {item.stepNum || i + 1}
                                </span>
                            ) : isNumbered ? (
                                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-indigo-100 font-mono text-xs font-bold text-indigo-700 shadow-2xs select-none dark:bg-indigo-950 dark:text-indigo-300">
                                    {item.stepNum || i + 1}
                                </span>
                            ) : (
                                <span className="mt-2 size-2 shrink-0 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                            )}
                            <div
                                className={`flex-1 ${
                                    item.isStep
                                        ? 'text-[15px] font-bold text-foreground sm:text-base'
                                        : 'text-foreground'
                                }`}
                            >
                                {renderInline(item.main)}
                            </div>
                        </div>

                        {/* Sub-items without bullets, indented under the primary step/item */}
                        {item.subItems.length > 0 && (
                            <div className="ml-7 space-y-1.5 border-l-2 border-indigo-200/70 pl-3.5 text-sm text-foreground/85 sm:ml-8.5 sm:pl-4 sm:text-[14px] dark:border-indigo-900/60">
                                {item.subItems.map((sub, sIdx) => (
                                    <div key={sIdx} className="leading-relaxed">
                                        {renderInline(sub)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>,
        );

        currentList = null;
    };

    const flushAll = () => {
        flushQuote();
        flushTable();
        flushList();
        flushCodeBlock();
        flushLatexBlock();
    };

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const trimmed = rawLine.trim();

        // 1. Inside fenced code block
        if (inCodeBlock) {
            if (trimmed.startsWith('```')) {
                flushCodeBlock();
                continue;
            }

            codeBlockLines.push(rawLine);
            continue;
        }

        // 2. Starting fenced code block
        if (trimmed.startsWith('```')) {
            flushAll();
            inCodeBlock = true;
            codeBlockLines = [];
            continue;
        }

        // 3. Inside multi-line LaTeX block
        if (inLatexBlock) {
            if (trimmed.endsWith('$$')) {
                const remainder = trimmed.slice(0, -2).trim();

                if (remainder) {
                    latexBlockLines.push(remainder);
                }

                flushLatexBlock();
                continue;
            }

            latexBlockLines.push(trimmed);
            continue;
        }

        // 4. Single-line LaTeX formula ($$...$$)
        if (
            trimmed.startsWith('$$') &&
            trimmed.endsWith('$$') &&
            trimmed.length > 4
        ) {
            flushAll();
            const clean = cleanLatexFormula(trimmed);
            elements.push(
                <div
                    key={`formula-${elements.length}`}
                    className="my-3.5 flex items-center justify-center rounded-xl border border-indigo-200/90 bg-indigo-50/80 p-3.5 text-center font-mono text-sm font-bold text-indigo-900 shadow-2xs select-all sm:p-4 sm:text-base dark:border-indigo-800/70 dark:bg-indigo-950/60 dark:text-indigo-200"
                >
                    <span>{clean}</span>
                </div>,
            );
            continue;
        }

        // 5. Starting multi-line LaTeX block
        if (
            trimmed === '$$' ||
            (trimmed.startsWith('$$') && !trimmed.endsWith('$$'))
        ) {
            flushAll();
            inLatexBlock = true;
            const remainder = trimmed.slice(2).trim();
            latexBlockLines = remainder ? [remainder] : [];
            continue;
        }

        if (!trimmed) {
            flushAll();
            continue;
        }

        // Horizontal line: --- or *** or ___ or longer sequences (e.g. -----------)
        if (/^(?:-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed)) {
            flushAll();
            elements.push(
                <hr
                    key={`hr-${elements.length}`}
                    className="my-4 border-t border-border/70 dark:border-border/60"
                />,
            );
            continue;
        }

        // Headings: ## or ###
        const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);

        if (headingMatch) {
            flushAll();
            const title = headingMatch[2];
            const isShortcutOrTrap = /shortcut|trap|tip/i.test(title);
            const isExample = /example|practice|solution|drill/i.test(title);
            const isProcedure = /procedure|step|guide|how to/i.test(title);

            elements.push(
                <div
                    key={`head-${elements.length}`}
                    className={`mt-5 mb-2.5 flex items-center gap-2.5 font-heading text-base font-bold sm:text-lg ${
                        isShortcutOrTrap
                            ? 'text-amber-600 dark:text-amber-400'
                            : isExample
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-foreground'
                    }`}
                >
                    <span
                        className={`flex size-6.5 shrink-0 items-center justify-center rounded-lg text-xs ${
                            isShortcutOrTrap
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : isExample
                                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                  : isProcedure
                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                    : 'bg-muted text-foreground'
                        }`}
                    >
                        {isShortcutOrTrap ? (
                            <Zap className="size-3.5" />
                        ) : isExample ? (
                            <FileText className="size-3.5" />
                        ) : isProcedure ? (
                            <ListOrdered className="size-3.5" />
                        ) : (
                            <Pin className="size-3.5" />
                        )}
                    </span>
                    <span>{renderInline(title)}</span>
                </div>,
            );
            continue;
        }

        // Blockquotes: lines starting with >
        const quoteMatch = trimmed.match(/^>\s?(.*)$/);

        if (quoteMatch) {
            flushList();
            flushTable();

            if (!currentQuote) {
                currentQuote = [];
            }

            currentQuote.push(quoteMatch[1]);
            continue;
        }

        // Markdown tables: lines with pipes |
        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            flushList();
            flushQuote();

            if (!currentTable) {
                currentTable = [];
            }

            currentTable.push(trimmed);
            continue;
        }

        // If we were inside quote or table, flush them now
        flushQuote();
        flushTable();

        // Bullet lists: - or * or •
        const bulletMatch = rawLine.match(/^(\s*)[-*•]\s+(.*)$/);

        if (bulletMatch) {
            const content = bulletMatch[2].trim();

            if (!currentList || currentList.type !== 'bullet') {
                flushList();
                currentList = { type: 'bullet', items: [] };
            }

            const lastItem =
                currentList.items.length > 0
                    ? currentList.items[currentList.items.length - 1]
                    : null;

            if (lastItem && isSubContentLine(rawLine, content, lastItem)) {
                lastItem.subItems.push(content);
            } else {
                const stepMatch = content.match(
                    /^(\*{0,2})Step\s+(\d+)[:.-]?\s*(\*{0,2})\s*(.*)$/i,
                );
                currentList.items.push({
                    main: content,
                    subItems: [],
                    isStep: Boolean(stepMatch),
                    stepNum: stepMatch ? stepMatch[2] : undefined,
                });
            }

            continue;
        }

        // Numbered lists: 1. or 1)
        const numberMatch = rawLine.match(/^(\s*)(\d+)[.)]\s+(.*)$/);

        if (numberMatch) {
            const num = numberMatch[2];
            const content = numberMatch[3].trim();

            if (!currentList || currentList.type !== 'number') {
                flushList();
                currentList = { type: 'number', items: [] };
            }

            const lastItem =
                currentList.items.length > 0
                    ? currentList.items[currentList.items.length - 1]
                    : null;

            if (lastItem && isSubContentLine(rawLine, content, lastItem)) {
                lastItem.subItems.push(content);
            } else {
                const stepMatch = content.match(
                    /^(\*{0,2})Step\s+(\d+)[:.-]?\s*(\*{0,2})\s*(.*)$/i,
                );
                currentList.items.push({
                    main: content,
                    subItems: [],
                    isStep: Boolean(stepMatch),
                    stepNum: stepMatch ? stepMatch[2] : num,
                });
            }

            continue;
        }

        // Check if unbulleted line is an indented sub-content for an active list
        if (currentList && currentList.items.length > 0) {
            const lastItem = currentList.items[currentList.items.length - 1];

            if (isSubContentLine(rawLine, trimmed, lastItem)) {
                lastItem.subItems.push(trimmed);
                continue;
            }
        }

        // Regular paragraph text
        flushList();
        elements.push(
            <p
                key={`p-${elements.length}`}
                className="my-2 text-sm leading-relaxed font-medium text-foreground/90 sm:text-[15px]"
            >
                {renderInline(trimmed)}
            </p>,
        );
    }

    flushAll();

    return <div className="space-y-1">{elements}</div>;
}
