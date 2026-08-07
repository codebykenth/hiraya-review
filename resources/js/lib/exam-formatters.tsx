import DOMPurify from 'dompurify';
import { ZoomIn } from 'lucide-react';
import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { parseLatexString } from '@/lib/latex-parser';

// Configure DOMPurify to allow SVG tags and attributes (browser-only)
if (typeof window !== 'undefined') {
    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
        if (data.attrName === 'href' || data.attrName === 'xlink:href') {
            if (data.attrValue?.toLowerCase().startsWith('javascript:')) {
                data.keepAttr = false;
            }
        }
    });
}

const svgConfig = {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: [
        'svg',
        'path',
        'rect',
        'circle',
        'ellipse',
        'line',
        'polyline',
        'polygon',
        'text',
        'tspan',
        'g',
        'defs',
        'linearGradient',
        'radialGradient',
        'stop',
        'clipPath',
        'mask',
        'pattern',
        'use',
        'image',
        'foreignObject',
    ],
    ADD_ATTR: [
        'viewBox',
        'width',
        'height',
        'x',
        'y',
        'cx',
        'cy',
        'r',
        'rx',
        'ry',
        'd',
        'fill',
        'stroke',
        'stroke-width',
        'stroke-linecap',
        'stroke-linejoin',
        'stroke-dasharray',
        'opacity',
        'transform',
        'transform-origin',
        'points',
        'x1',
        'y1',
        'x2',
        'y2',
        'text-anchor',
        'font-family',
        'font-size',
        'font-weight',
        'font-style',
        'letter-spacing',
        'dominant-baseline',
        'alignment-baseline',
        'baseline-shift',
        'dx',
        'dy',
        'rotate',
        'scale',
        'translate',
        'skewX',
        'skewY',
        'fill-opacity',
        'stroke-opacity',
        'stroke-miterlimit',
        'clip-path',
        'mask',
        'filter',
        'href',
        'xlink:href',
        'id',
        'class',
        'style',
        'preserveAspectRatio',
        'patternTransform',
        'patternUnits',
        'gradientTransform',
        'gradientUnits',
        'spreadMethod',
        'offset',
        'stop-color',
        'stop-opacity',
    ],
    FORBID_TAGS: [
        'script',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'style',
        'link',
        'meta',
        'set',
        'animate',
        'animateMotion',
        'animateTransform',
    ],
    FORBID_ATTR: [
        'onload',
        'onerror',
        'onclick',
        'onmouseover',
        'onmouseout',
        'onfocus',
        'onblur',
        'onkeydown',
        'onkeyup',
        'onkeypress',
        'onsubmit',
        'onreset',
        'onchange',
        'onselect',
    ],
};

const sanitizeSvg = (svg: string): string => {
    return DOMPurify.sanitize(svg, svgConfig);
};

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

export const calculateWeightedPercentage = (
    results: any,
    isSubprofessional: boolean = false,
): number => {
    const catMap = results.categoryScoreMap || {};
    
    // Check if we have multiple categories typical of a full mock exam
    const hasWeights = Object.keys(catMap).some((cat) =>
        [
            'Verbal Ability',
            'Analytical Ability',
            'Numerical Ability',
            'Clerical Ability',
            'General Information',
        ].includes(cat),
    );

    if (hasWeights) {
        const getWeight = (catName: string) => {
            if (catName === 'Verbal Ability') return 0.30;
            if (catName === 'Numerical Ability') return 0.30;
            if (catName === 'General Information') return 0.05;
            
            // Professional uses Analytical, Subprofessional uses Clerical
            if (catName === 'Analytical Ability') return 0.35;
            if (catName === 'Clerical Ability') return 0.35;
            
            return 0; 
        };

        let totalWeight = 0;
        let weightedScore = 0;

        Object.entries(catMap).forEach(([cat, val]: [string, any]) => {
            const weight = getWeight(cat);
            if (weight > 0) {
                const catScore =
                    val.total > 0 ? (val.correct / val.total) * 100 : 0;
                weightedScore += catScore * weight;
                totalWeight += weight;
            }
        });

        // Normalize the score based on available weights. If it's a full mock exam, totalWeight should be ~1.0
        if (totalWeight > 0) {
            return weightedScore / totalWeight;
        }
    }

    // Fallback to standard unweighted average if not a full mock exam track or weights are missing
    return results.total > 0
        ? (results.correctCount / results.total) * 100
        : 0;
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

    return parseLatexString(text, formatMathInlineBase);
};

export const formatMarkdownInline = (text: string): React.ReactNode[] => {
    if (typeof text !== 'string') {
        return [text];
    }

    const boldItalicPattern = /(\*\*(?:[^*]|\*[^*])+\*\*|\*(?:[^*])+\*)/g;
    const parts = text.split(boldItalicPattern);

    return parts.map((part, idx) => {
        if (idx % 2 === 1) {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong
                        key={idx}
                        className="font-extrabold text-slate-950 dark:text-white"
                    >
                        {part.slice(2, -2)}
                    </strong>
                );
            }

            if (part.startsWith('*') && part.endsWith('*')) {
                return (
                    <em
                        key={idx}
                        className="text-slate-900 italic dark:text-slate-100"
                    >
                        {part.slice(1, -1)}
                    </em>
                );
            }
        }

        return part;
    });
};

export const formatMathInlineBase = (text: string) => {
    if (typeof text !== 'string') {
        return text;
    }

    // Convert (-3)3 to (-3)^3
    const processedText = text.replace(/\)(\d+)\b/g, ')^$1');

    // Split by fraction (e.g. 1/2, 4.8 / 0.6, 18 / (-2)), superscript (e.g. ^2, ^-3, ^n), or sqrt(...)
    const parts = processedText.split(
        /(\b\d+(?:,\d+)*(?:\.\d+)?\s*\/\s*(?:-?\d+(?:,\d+)*(?:\.\d+)?|\(\s*-?\d+(?:,\d+)*(?:\.\d+)?\s*\))|\^[-a-zA-Z0-9]+|\bsqrt\([^)]+\))/gi,
    );

    if (parts.length === 1) {
        return parseLatexString(text);
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

                    if (part.toLowerCase().startsWith('sqrt(')) {
                        const inner = part.substring(5, part.length - 1);

                        return (
                            <span
                                key={idx}
                                className="mx-0.5 inline-flex items-center whitespace-nowrap"
                            >
                                <span className="mr-[1px] font-serif text-[1.1em] leading-none">
                                    √
                                </span>
                                <span className="border-t border-slate-700 pt-[1px] leading-tight dark:border-slate-300">
                                    {inner}
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
    isOption: boolean = false,
) => {
    if (!text) {
        return null;
    }

    if (isOption) {
        text = text
            .replace(/^\[\d+\]\s*(?=.+)/, '')
            .replace(/^\d+\.\s+(?=.+)/, '');
    }

    // Strip bracket numbers in Error Recognition stems (e.g. "[1] has went]" -> "[has went]")
    // Restrict to digits 1-9 or letters A-D to prevent eating valid dates like "[2024] [across all]"
    text = text.replace(/\[([1-9]|[A-D])\]\s*([^\]]+)\]/gi, '[$2]');

    // Clean up literal escaped quotes that might leak from JSON/AI payloads,
    // which breaks the browser's HTML parser in dangerouslySetInnerHTML
    text = text.replace(/\\"/g, '"').replace(/\\'/g, "'");

    // Clean up HTML tags and arrow entities that AI models sometimes output
    // to group SVGs. We normalize them so our parser can group them properly.
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<div[^>]*>/gi, '').replace(/<\/div>/gi, '');
    text = text.replace(/<span[^>]*>(?:&rarr;|→)<\/span>/gi, ' → ');
    text = text.replace(/&rarr;/gi, ' → ');
    text = text.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');

    // Strict 1-liner comment: Dynamically strip parenthesized logical variable markers if requested
    const processedText = stripLogicSymbols
        ? text.replace(/\s*\(\s*[~¬]?\s*[A-Z]\s*\)/g, '')
        : text;

    // Extract SVGs before table parsing to avoid conflicts
    const svgRegex = /(<svg[\s\S]*?<\/svg>)/g;
    const svgParts = processedText.split(svgRegex);

    const tableRegex = /((?:^|\n)\|[^\n]+\|[^\n]*(?:\n\|[^\n]+\|[^\n]*)+)/g;

    const formatNumberedLists = (inputText: string) => {
        if (!inputText) {
            return null;
        }

        // Normalize inline steps (e.g. "Step 2:"), list items (e.g. "1."), and mental math shortcuts by inserting a newline before them
        const normalizedText = inputText
            .replace(/(?<!^)\s*\b(Step\s+\d+)\s*[:.-]/gi, '\n$1:')
            .replace(
                /(?<!^)\s*(🧠\s*)?\b(Mental Math Shortcut|Fast Track|Shortcut)\s*:/gi,
                '\n$2:',
            );
        const lines = normalizedText.split(/\n/);
        const listRegex = /^\s*(\(\d+\)|\d+\.)\s+(.+)$/;

        interface ParsedBlock {
            type: 'text' | 'step' | 'shortcut' | 'list';
            stepNum?: string;
            title?: string;
            content: string[];
            listItems?: { marker: string; text: string }[];
        }

        const blocks: ParsedBlock[] = [];
        let currentBlock: ParsedBlock | null = null;

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed) {
                continue;
            }

            const stepMatch = trimmed.match(
                /^\s*Step\s+(\d+)\s*[:.-]\s*(.*)$/i,
            );
            const shortcutMatch = trimmed.match(
                /^\s*(🧠\s*)?(Mental Math Shortcut|Fast Track|Shortcut)\s*:\s*(.*)$/i,
            );
            const listMatch = trimmed.match(listRegex);

            if (shortcutMatch) {
                currentBlock = {
                    type: 'shortcut',
                    title: shortcutMatch[2],
                    content: shortcutMatch[3].trim()
                        ? [shortcutMatch[3].trim()]
                        : [],
                };
                blocks.push(currentBlock);
            } else if (stepMatch) {
                currentBlock = {
                    type: 'step',
                    stepNum: stepMatch[1],
                    content: stepMatch[2].trim() ? [stepMatch[2].trim()] : [],
                };
                blocks.push(currentBlock);
            } else if (
                listMatch &&
                (!currentBlock ||
                    (currentBlock.type !== 'shortcut' &&
                        currentBlock.type !== 'step'))
            ) {
                if (
                    currentBlock &&
                    currentBlock.type === 'list' &&
                    currentBlock.listItems
                ) {
                    currentBlock.listItems.push({
                        marker: listMatch[1],
                        text: listMatch[2],
                    });
                } else {
                    currentBlock = {
                        type: 'list',
                        content: [],
                        listItems: [
                            { marker: listMatch[1], text: listMatch[2] },
                        ],
                    };
                    blocks.push(currentBlock);
                }
            } else {
                if (
                    currentBlock &&
                    (currentBlock.type === 'shortcut' ||
                        currentBlock.type === 'step')
                ) {
                    currentBlock.content.push(trimmed);
                } else if (currentBlock && currentBlock.type === 'text') {
                    currentBlock.content.push(trimmed);
                } else {
                    currentBlock = {
                        type: 'text',
                        content: [trimmed],
                    };
                    blocks.push(currentBlock);
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

            // Strict 1-liner comment: Regex to match standard math expressions, logic arrow chains, negation states, parenthesized variables, and specific tokens.
            const mathPattern =
                /(\b\d+(?:\.\d+)?%|\[[^\]]+\]|\bProject\s+[A-Z]\b|\bQ[1-4]\b|[~¬]?\s*\b[A-Z]\b\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b(?:\s*(?:->|=>)\s*[~¬]?\s*\b[A-Z]\b)*|[~¬]\s*\b[A-Z]\b|\(\s*[~¬]?\s*\b[A-Z]\b\s*\)|'\s*\b[A-Z]\b\s*'|"\s*\b[A-Z]\b\s*")/g;

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
                        <span className="shadow-3xs inline-flex items-center rounded-md border border-red-100 bg-red-50 px-1.5 py-0.5 font-mono text-xs font-bold text-red-600 select-all dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                            <span className="mr-0.5 text-[10px] font-bold text-red-400 dark:text-red-500">
                                ¬
                            </span>
                            {letter}
                        </span>
                    );
                }

                return (
                    <span className="shadow-3xs inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-700 select-all dark:bg-blue-950/30">
                        {letter}
                    </span>
                );
            };

            const renderTokenContent = (token: string) => {
                // If it is a logic chain
                if (token.includes('->') || token.includes('=>')) {
                    const variables = token.split(/\s*(?:->|=>)\s*/);

                    return (
                        <span className="shadow-3xs mx-1 my-0.5 inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50 px-2 py-1 transition hover:bg-slate-100/50 dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:bg-slate-900/80">
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
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatMathInlineBase(token)}
                    </span>
                );
            };

            const renderRichParagraphContent = (content: string) => {
                const markdownParts = formatMarkdownInline(content);

                return (
                    <>
                        {markdownParts.map((part, partIdx) => {
                            if (typeof part !== 'string') {
                                return part;
                            }

                            return (
                                <React.Fragment key={partIdx}>
                                    {parseLatexString(
                                        part,
                                        (plainStr: string) => {
                                            const mathParts =
                                                plainStr.split(mathPattern);

                                            return (
                                                <>
                                                    {mathParts.map(
                                                        (mPart, mIdx) => {
                                                            if (
                                                                mPart.match(
                                                                    mathPattern,
                                                                )
                                                            ) {
                                                                return (
                                                                    <React.Fragment
                                                                        key={
                                                                            mIdx
                                                                        }
                                                                    >
                                                                        {renderTokenContent(
                                                                            mPart,
                                                                        )}
                                                                    </React.Fragment>
                                                                );
                                                            }

                                                            return (
                                                                <span
                                                                    key={mIdx}
                                                                >
                                                                    {formatMathInlineBase(
                                                                        mPart,
                                                                    )}
                                                                </span>
                                                            );
                                                        },
                                                    )}
                                                </>
                                            );
                                        },
                                    )}
                                </React.Fragment>
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
                    <div className="shadow-3xs dark:bg-blue-950/30/20 my-3.5 flex items-start gap-3 rounded-r-xl border-l-3 border-blue-500 bg-blue-50 p-3.5 dark:bg-blue-950/10">
                        <span className="shadow-3xs mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 font-mono text-xs font-black text-white select-none">
                            {stepNum}
                        </span>
                        <div className="flex-1">
                            <strong className="mb-1 block text-sm font-black text-slate-950 dark:text-white">
                                STEP {stepNum}
                            </strong>
                            <div className="text-[15px] leading-relaxed font-medium text-slate-900 dark:text-slate-100">
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
                    <div className="shadow-3xs dark:bg-rose-950/30/40 my-4 flex items-start gap-3 rounded-r-xl border-l-4 border-rose-500 bg-rose-50 p-4 dark:border-rose-500/80 dark:bg-rose-950/20">
                        <span className="shadow-3xs mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[12px] text-white select-none">
                            🧠
                        </span>
                        <div className="flex-1">
                            <strong className="mb-1.5 block font-heading text-[13px] font-black tracking-widest text-rose-900 uppercase dark:text-rose-300">
                                {title}
                            </strong>
                            <div className="text-[14px] leading-loose font-bold text-slate-800 dark:text-slate-200">
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
                {blocks.map((block, bIdx) => {
                    if (block.type === 'text') {
                        return (
                            <div key={bIdx} className="flex flex-col gap-2">
                                {block.content.map((line, lIdx) => (
                                    <React.Fragment key={lIdx}>
                                        {renderRichParagraph(
                                            line,
                                            'text-[16px] font-medium text-slate-950 dark:text-slate-50 leading-relaxed tracking-wide',
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        );
                    }

                    if (block.type === 'list' && block.listItems) {
                        return (
                            <div
                                key={bIdx}
                                className="my-2 flex flex-col gap-2.5 pl-1"
                            >
                                {block.listItems.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/40 p-3 transition hover:border-slate-200 dark:border-slate-900/60 dark:bg-slate-900/10"
                                    >
                                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-950/30 dark:bg-blue-950/40 dark:text-blue-400">
                                            {item.marker.replace('.', '')}
                                        </span>
                                        <div className="mt-0.5 flex-1">
                                            {renderRichParagraph(
                                                item.text,
                                                'text-[15px] font-medium leading-relaxed tracking-wide text-slate-900 dark:text-slate-100',
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    }

                    if (block.type === 'step') {
                        return (
                            <div
                                key={bIdx}
                                className="shadow-3xs dark:bg-blue-950/30/20 my-3.5 flex items-start gap-3 rounded-r-xl border-l-3 border-blue-500 bg-blue-50 p-3.5 dark:bg-blue-950/10"
                            >
                                <span className="shadow-3xs mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 font-mono text-xs font-black text-white select-none">
                                    {block.stepNum}
                                </span>
                                <div className="flex-1">
                                    <strong className="mb-1 block text-sm font-black text-slate-950 dark:text-white">
                                        STEP {block.stepNum}
                                    </strong>
                                    <div className="flex flex-col gap-2">
                                        {block.content.map((line, lIdx) => (
                                            <React.Fragment key={lIdx}>
                                                {renderRichParagraph(
                                                    line,
                                                    'text-[15px] leading-relaxed font-medium text-slate-900 dark:text-slate-100',
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    if (block.type === 'shortcut') {
                        return (
                            <div
                                key={bIdx}
                                className="shadow-3xs dark:bg-rose-950/30/40 my-4 flex items-start gap-3 rounded-r-xl border-l-4 border-rose-500 bg-rose-50 p-4 dark:border-rose-500/80 dark:bg-rose-950/20"
                            >
                                <span className="shadow-3xs mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[12px] text-white select-none">
                                    🧠
                                </span>
                                <div className="flex-1">
                                    <strong className="mb-1.5 block font-heading text-[13px] font-black tracking-widest text-rose-900 uppercase dark:text-rose-300">
                                        {block.title}
                                    </strong>
                                    <div className="flex flex-col gap-2">
                                        {block.content.map((line, lIdx) => (
                                            <React.Fragment key={lIdx}>
                                                {renderRichParagraph(
                                                    line,
                                                    'text-[14px] leading-loose font-bold text-slate-800 dark:text-slate-200',
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return null;
                })}
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
                                        className="dark:text-slate-300 px-4 py-3 leading-relaxed font-semibold text-slate-700"
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

    const svgCount = (processedText.match(/<svg[\s\S]*?<\/svg>/gi) || [])
        .length;

    if (!isOption && svgCount > 1) {
        const rawParts = processedText.split(/(<svg[\s\S]*?<\/svg>)/gi);
        const labelRegex =
            /(?:\r?\n|^)\s*(\*\*(?:Frame|Step|Shape|Figure|Box|Sequence|Frame\s+\d+|Step\s+\d+|Shape\s+\d+|Figure\s+\d+|Box\s+\d+)\s*\d*(?::)?\*\*|(?:[Ff]rame|[Ss]tep|[Ss]hape|[Ff]igure|[Bb]ox|[Ss]equence)\s*\d+(?::)?)\s*$/;

        interface TempBlock {
            type: 'text' | 'svg';
            content: string;
            label?: string;
        }

        const tempBlocks: TempBlock[] = [];

        for (let idx = 0; idx < rawParts.length; idx++) {
            const part = rawParts[idx];

            if (part === undefined) {
                continue;
            }

            if (idx % 2 === 0) {
                if (part !== '') {
                    tempBlocks.push({ type: 'text', content: part });
                }
            } else {
                let label: string | undefined = undefined;

                if (
                    tempBlocks.length > 0 &&
                    tempBlocks[tempBlocks.length - 1].type === 'text'
                ) {
                    const prevBlock = tempBlocks[tempBlocks.length - 1];
                    const match = prevBlock.content.match(labelRegex);

                    if (match) {
                        label = match[1].trim();
                        prevBlock.content = prevBlock.content
                            .substring(0, match.index ?? 0)
                            .trimEnd();
                    }
                }

                tempBlocks.push({ type: 'svg', content: part, label });
            }
        }

        interface SvgFrame {
            label: string | null;
            svg: string;
        }

        interface GroupedBlock {
            type: 'text' | 'sequence' | 'svg';
            content: string;
            label?: string;
            frames?: SvgFrame[];
        }

        const groupedBlocks: GroupedBlock[] = [];
        let currentSequence: SvgFrame[] = [];

        for (let idx = 0; idx < tempBlocks.length; idx++) {
            const block = tempBlocks[idx];

            if (block.type === 'svg') {
                currentSequence.push({
                    label: block.label || null,
                    svg: block.content,
                });
            } else {
                const trimmed = block.content.trim();
                const isSequenceSeparator =
                    trimmed === '' ||
                    trimmed === '→' ||
                    trimmed === '->' ||
                    trimmed === '=>';

                if (isSequenceSeparator) {
                    continue;
                } else {
                    if (currentSequence.length > 0) {
                        if (currentSequence.length === 1) {
                            groupedBlocks.push({
                                type: 'svg',
                                content: currentSequence[0].svg,
                                label: currentSequence[0].label || undefined,
                            });
                        } else {
                            groupedBlocks.push({
                                type: 'sequence',
                                content: '',
                                frames: [...currentSequence],
                            });
                        }

                        currentSequence = [];
                    }

                    groupedBlocks.push({
                        type: 'text',
                        content: block.content,
                    });
                }
            }
        }

        if (currentSequence.length > 0) {
            if (currentSequence.length === 1) {
                groupedBlocks.push({
                    type: 'svg',
                    content: currentSequence[0].svg,
                    label: currentSequence[0].label || undefined,
                });
            } else {
                groupedBlocks.push({
                    type: 'sequence',
                    content: '',
                    frames: [...currentSequence],
                });
            }
        }

        return (
            <div className="flex flex-col gap-1.5">
                {groupedBlocks.map((block, blockIdx) => {
                    if (block.type === 'sequence' && block.frames) {
                        return (
                            <div
                                key={`seq-${blockIdx}`}
                                className="my-6 flex flex-row flex-wrap items-center justify-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/10"
                            >
                                {block.frames.map((frame, fIdx) => {
                                    const cleanLabel = frame.label
                                        ? frame.label
                                              .replace(/\*\*|:/g, '')
                                              .trim()
                                        : '';

                                    return (
                                        <React.Fragment
                                            key={`seq-frag-${fIdx}`}
                                        >
                                            {fIdx > 0 && (
                                                <span className="self-center text-xl font-black tracking-tight text-slate-400 select-none dark:text-slate-600">
                                                    ➔
                                                </span>
                                            )}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition-all hover:scale-[1.02] active:scale-95 dark:border-slate-800 dark:bg-slate-900">
                                                        {cleanLabel && (
                                                            <div className="mb-2 text-center text-xs font-extrabold text-slate-800 dark:text-slate-200">
                                                                {cleanLabel}
                                                            </div>
                                                        )}
                                                        <div
                                                            className="flex size-24 items-center justify-center"
                                                            dangerouslySetInnerHTML={{
                                                                __html: sanitizeSvg(
                                                                    frame.svg.replace(
                                                                        /^\s*<svg/i,
                                                                        `<svg width="100%" height="100%" class="w-full h-full object-contain"`,
                                                                    ),
                                                                ),
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100 dark:group-hover:bg-white/10">
                                                            <div className="rounded-full bg-white/90 p-1.5 text-slate-700 shadow-xs backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300">
                                                                <ZoomIn className="size-3.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl">
                                                    <div
                                                        className="flex w-full justify-start md:justify-center overflow-auto rounded-2xl bg-white p-6 sm:p-8 lg:p-10 dark:bg-slate-900"
                                                        dangerouslySetInnerHTML={{
                                                            __html: sanitizeSvg(
                                                                frame.svg.replace(
                                                                    /^\s*<svg/i,
                                                                    `<svg width="100%" height="100%" style="overflow: visible; margin: 2.5rem;" class="w-full min-w-[700px] h-auto max-h-[80vh] object-contain"`,
                                                                ),
                                                            ),
                                                        }}
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        );
                    }

                    if (block.type === 'svg') {
                        const scaledSvg = block.content.replace(
                            /^\s*<svg/i,
                            `<svg width="100%" height="100%" class="h-48 w-full object-contain"`,
                        );
                        const cleanLabel = block.label
                            ? block.label.replace(/\*\*|:/g, '').trim()
                            : '';

                        return (
                            <Dialog key={`svg-block-${blockIdx}`}>
                                <DialogTrigger asChild>
                                    <div className="group relative mx-auto my-4 flex w-full max-w-2xl cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:scale-[1.02] active:scale-95 dark:border-slate-800 dark:bg-slate-900">
                                        {cleanLabel && (
                                            <div className="mb-2 text-center text-sm font-extrabold text-slate-800 dark:text-slate-200">
                                                {cleanLabel}
                                            </div>
                                        )}
                                        <div
                                            className="flex w-full items-center justify-center"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeSvg(scaledSvg),
                                            }}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100 dark:group-hover:bg-white/10">
                                            <div className="rounded-full bg-white/90 p-1.5 text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300">
                                                <ZoomIn className="size-4" />
                                            </div>
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl">
                                    <div
                                        className="flex w-full justify-start md:justify-center overflow-auto rounded-2xl bg-white p-6 sm:p-8 lg:p-10 dark:bg-slate-900"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeSvg(
                                                block.content.replace(
                                                    /^\s*<svg/i,
                                                    `<svg width="100%" height="100%" style="overflow: visible; margin: 2.5rem;" class="w-full min-w-[700px] h-auto max-h-[80vh] object-contain"`,
                                                ),
                                            ),
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        );
                    }

                    const parts = block.content.split(tableRegex);

                    return (
                        <React.Fragment key={`text-block-${blockIdx}`}>
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
                        </React.Fragment>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-1.5">
            {svgParts.map((svgPart, svgIndex) => {
                if (svgPart.trim().match(/^<svg/i)) {
                    // Pre-process the SVG string to inject a class for responsive sizing
                    // We also ensure it doesn't exceed 100% width or fixed pixel heights that break layout
                    const scaledSvg = svgPart.replace(
                        /^\s*<svg/i,
                        `<svg width="100%" height="100%" class="${isOption ? 'h-20 w-full object-contain' : 'h-48 w-full object-contain'}"`,
                    );

                    if (isOption) {
                        return (
                            <Dialog key={`svg-${svgIndex}`}>
                                <DialogTrigger asChild>
                                    <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="group relative my-1 flex w-full cursor-pointer justify-center overflow-hidden rounded-lg bg-white p-2 transition-all hover:scale-[1.02] active:scale-95 dark:bg-slate-900"
                                    >
                                        <div
                                            className="flex w-full items-center justify-center"
                                            dangerouslySetInnerHTML={{
                                                __html: sanitizeSvg(scaledSvg),
                                            }}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100 dark:group-hover:bg-white/10">
                                            <div className="rounded-full bg-white/90 p-1.5 text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300">
                                                <ZoomIn className="size-3" />
                                            </div>
                                        </div>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl">
                                    <div
                                        className="flex w-full justify-start md:justify-center overflow-auto rounded-2xl bg-white p-6 sm:p-8 lg:p-10 dark:bg-slate-900"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeSvg(
                                                svgPart.replace(
                                                    /^\s*<svg/i,
                                                    `<svg width="100%" height="100%" style="overflow: visible; margin: 2.5rem;" class="w-full min-w-[700px] h-auto max-h-[80vh] object-contain"`,
                                                ),
                                            ),
                                        }}
                                    />
                                </DialogContent>
                            </Dialog>
                        );
                    }

                    return (
                        <Dialog key={`svg-${svgIndex}`}>
                            <DialogTrigger asChild>
                                <div className="group relative mx-auto my-4 flex w-full max-w-2xl cursor-pointer justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:scale-[1.02] active:scale-95 dark:border-slate-800 dark:bg-slate-900">
                                    <div
                                        className="flex w-full items-center justify-center"
                                        dangerouslySetInnerHTML={{
                                            __html: sanitizeSvg(scaledSvg),
                                        }}
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/5 group-hover:opacity-100 dark:group-hover:bg-white/10">
                                        <div className="rounded-full bg-white/90 p-1.5 text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300">
                                            <ZoomIn className="size-4" />
                                        </div>
                                    </div>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl">
                                <div
                                    className="flex w-full justify-start md:justify-center overflow-auto rounded-2xl bg-white p-6 sm:p-8 lg:p-10 dark:bg-slate-900"
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeSvg(
                                            svgPart.replace(
                                                /^\s*<svg/i,
                                                `<svg width="100%" height="100%" style="overflow: visible; margin: 2.5rem;" class="w-full min-w-[700px] h-auto max-h-[80vh] object-contain"`,
                                            ),
                                        ),
                                    }}
                                />
                            </DialogContent>
                        </Dialog>
                    );
                }

                const parts = svgPart.split(tableRegex);

                return (
                    <React.Fragment key={`text-${svgIndex}`}>
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
                    </React.Fragment>
                );
            })}
        </div>
    );
};
