import React from 'react';

/**
 * Find the index of the matching closing brace for the opening brace at startIndex.
 */
export const findMatchingBrace = (str: string, startIndex: number): number => {
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
};

/**
 * Parse a LaTeX string (without $ delimiters) into styled React elements.
 * Handles \frac{}{}, ^{}, _{}, and common LaTeX symbol commands.
 */
export const parseLaTeXToJSX = (latex: string): React.ReactNode => {
    const parseBlock = (str: string): React.ReactNode[] => {
        const result: React.ReactNode[] = [];
        let i = 0;

        while (i < str.length) {
            // \text{...}
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

            // \frac{numerator}{denominator}
            if (str.startsWith('\\frac{', i)) {
                const numStart = i + 5;
                const numEnd = findMatchingBrace(str, numStart);

                if (numEnd !== -1) {
                    let denomStart = numEnd + 1;

                    while (denomStart < str.length && str[denomStart] !== '{') {
                        denomStart++;
                    }

                    const denomEnd =
                        denomStart < str.length
                            ? findMatchingBrace(str, denomStart)
                            : -1;

                    if (denomEnd !== -1) {
                        result.push(
                            <span
                                key={i}
                                className="mx-1 inline-flex flex-col text-center align-middle leading-none"
                            >
                                <span className="block border-b border-slate-500 px-1 pb-0.5 text-[0.9em] dark:border-slate-500">
                                    {parseBlock(
                                        str.substring(numStart + 1, numEnd),
                                    )}
                                </span>
                                <span className="block px-1 pt-0.5 text-[0.9em]">
                                    {parseBlock(
                                        str.substring(denomStart + 1, denomEnd),
                                    )}
                                </span>
                            </span>,
                        );
                        i = denomEnd + 1;
                        continue;
                    }
                }
            }

            // Superscript ^ and subscript _
            if (str[i] === '^' || str[i] === '_') {
                const isSup = str[i] === '^';

                if (str[i + 1] === '{') {
                    const braceEnd = findMatchingBrace(str, i + 1);

                    if (braceEnd !== -1) {
                        const content = parseBlock(
                            str.substring(i + 2, braceEnd),
                        );
                        result.push(
                            isSup ? (
                                <sup
                                    key={i}
                                    className="text-[0.75em] leading-none font-bold"
                                >
                                    {content}
                                </sup>
                            ) : (
                                <sub
                                    key={i}
                                    className="text-[0.75em] leading-none"
                                >
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
                        <sup
                            key={i}
                            className="text-[0.75em] leading-none font-bold"
                        >
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

            // LaTeX symbol commands
            const commands = [
                { cmd: '\\pm', symbol: ' ± ' },
                { cmd: '\\times', symbol: ' × ' },
                { cmd: '\\cdot', symbol: ' · ' },
                { cmd: '\\div', symbol: ' ÷ ' },
                { cmd: '\\dots', symbol: '…' },
                { cmd: '\\ldots', symbol: '…' },
                { cmd: '\\left(', symbol: '(' },
                { cmd: '\\right)', symbol: ')' },
                { cmd: '\\left[', symbol: '[' },
                { cmd: '\\right]', symbol: ']' },
                { cmd: '\\left\\{', symbol: '{' },
                { cmd: '\\right\\}', symbol: '}' },
                { cmd: '\\{', symbol: '{' },
                { cmd: '\\}', symbol: '}' },
                { cmd: '\\le', symbol: ' ≤ ' },
                { cmd: '\\leq', symbol: ' ≤ ' },
                { cmd: '\\ge', symbol: ' ≥ ' },
                { cmd: '\\geq', symbol: ' ≥ ' },
                { cmd: '\\neq', symbol: ' ≠ ' },
                { cmd: '\\approx', symbol: ' ≈ ' },
                { cmd: '\\pi', symbol: 'π' },
                { cmd: '\\infty', symbol: '∞' },
                { cmd: '\\deg', symbol: '°' },
                { cmd: '\\alpha', symbol: 'α' },
                { cmd: '\\beta', symbol: 'β' },
                { cmd: '\\theta', symbol: 'θ' },
                { cmd: '\\sqrt', symbol: '√' },
                { cmd: '\\%', symbol: '%' },
            ];

            const command = commands.find((item) =>
                str.startsWith(item.cmd, i),
            );

            if (command) {
                result.push(
                    <span key={i} className="mx-0.5">
                        {command.symbol}
                    </span>,
                );
                i += command.cmd.length;
                continue;
            }

            // Check for inline fraction like 8/12
            const fracMatch = str.substring(i).match(/^(\d+)\s*\/\s*(\d+)/);

            if (fracMatch) {
                result.push(
                    <span
                        key={i}
                        className="mx-1 inline-flex flex-col text-center align-middle leading-none"
                    >
                        <span className="block border-b border-slate-500 px-0.5 pb-[2px] text-[0.8em] font-bold dark:border-slate-400">
                            {fracMatch[1]}
                        </span>
                        <span className="block px-0.5 pt-[2px] text-[0.8em] font-bold">
                            {fracMatch[2]}
                        </span>
                    </span>,
                );
                i += fracMatch[0].length;
                continue;
            }

            // Escaped character
            if (str[i] === '\\' && i + 1 < str.length) {
                result.push(str[i + 1]);
                i += 2;
                continue;
            }

            // Regular character
            result.push(str[i]);
            i++;
        }

        return result;
    };

    return (
        <span className="font-semibold text-inherit">{parseBlock(latex)}</span>
    );
};

/**
 * Parse a text string that may contain $...$ (inline math) and $$...$$ (display math).
 * Non-math text is returned as-is. Math portions are rendered via parseLaTeXToJSX.
 * Returns the original string if no $ delimiters are found.
 */
export const parseLatexString = (
    text: string,
    plainTextProcessor?: (text: string) => React.ReactNode,
): React.ReactNode => {
    if (typeof text !== 'string') {
        return text;
    }

    if (!text.includes('$')) {
        return plainTextProcessor ? plainTextProcessor(text) : text;
    }

    const result: React.ReactNode[] = [];
    let i = 0;

    while (i < text.length) {
        // Display math: $$...$$
        if (text.startsWith('$$', i)) {
            const endIdx = text.indexOf('$$', i + 2);

            if (endIdx !== -1) {
                result.push(
                    <span
                        key={`display-${i}`}
                        className="mx-1 inline-flex items-center rounded-md border border-blue-100 bg-blue-50/60 px-2 py-0.5 text-[0.95em] dark:border-blue-900/50 dark:bg-blue-950/30"
                    >
                        {parseLaTeXToJSX(text.substring(i + 2, endIdx))}
                    </span>,
                );
                i = endIdx + 2;
                continue;
            }
        }

        // Inline math: $...$
        if (text[i] === '$') {
            const endIdx = text.indexOf('$', i + 1);

            if (endIdx !== -1) {
                result.push(
                    <span
                        key={`inline-${i}`}
                        className="mx-0.5 inline-flex items-center rounded-md border border-blue-100/80 bg-blue-50/50 px-1.5 py-0.5 text-[0.95em] dark:border-blue-900/40 dark:bg-blue-950/20"
                    >
                        {parseLaTeXToJSX(text.substring(i + 1, endIdx))}
                    </span>,
                );
                i = endIdx + 1;
                continue;
            }

            result.push('$');
            i++;
            continue;
        }

        // Plain text until next $
        const nextDollar = text.indexOf('$', i);
        const plainEnd = nextDollar === -1 ? text.length : nextDollar;
        const plainText = text.substring(i, plainEnd);
        result.push(
            plainTextProcessor ? plainTextProcessor(plainText) : plainText,
        );
        i = plainEnd > i ? plainEnd : i + 1;
    }

    return result.length === 1 ? result[0] : <>{result}</>;
};
