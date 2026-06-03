import { ArrowRight } from 'lucide-react';
import React from 'react';
import { parseLatexString } from '@/lib/latex-parser';

interface ExplanationPreviewProps {
    text: string;
}

export function ExplanationPreview({ text }: ExplanationPreviewProps) {
    if (!text) {
        return null;
    }

    const parseInlineBold = (lineText: string) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(lineText)) !== null) {
            if (match.index > lastIndex) {
                parts.push(
                    parseLatexString(
                        lineText.substring(lastIndex, match.index),
                    ),
                );
            }

            parts.push(
                <strong
                    key={match.index}
                    className="font-black text-foreground"
                >
                    {parseLatexString(match[1])}
                </strong>,
            );
            lastIndex = boldRegex.lastIndex;
        }

        if (lastIndex < lineText.length) {
            parts.push(parseLatexString(lineText.substring(lastIndex)));
        }

        return parts.length > 0 ? parts : parseLatexString(lineText);
    };

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
            return;
        }

        // Handle Mental Math Shortcuts
        if (
            trimmed.toLowerCase().includes('mental math shortcut:') ||
            trimmed.toLowerCase().includes('mental math shortcut')
        ) {
            const content = trimmed
                .substring(trimmed.toLowerCase().indexOf('shortcut') + 8)
                .replace(/^s*:/, '')
                .trim();
            elements.push(
                <div
                    key={`shortcut-${idx}`}
                    className="my-4 rounded-xl border border-rose-200 bg-rose-50/40 p-4 dark:border-rose-900/40 dark:bg-rose-950/20"
                >
                    <span className="mb-1 block text-[11px] font-black tracking-wider text-rose-800 uppercase dark:text-rose-300">
                        🧠 Mental Math Shortcut
                    </span>
                    <p className="text-sm leading-relaxed font-bold text-foreground">
                        {parseInlineBold(content)}
                    </p>
                </div>,
            );

            return;
        }

        // Handle deductive reasoning logic chains
        if (trimmed.includes('->') && !trimmed.startsWith('|')) {
            const nodes = trimmed.split('->').map((n) => n.trim());
            elements.push(
                <div
                    key={`chain-${idx}`}
                    className="my-4 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/10 p-3.5 dark:border-blue-900/20 dark:bg-blue-950/10"
                >
                    {nodes.map((node, nIdx) => (
                        <React.Fragment key={nIdx}>
                            <span className="shadow-3xs inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white">
                                {parseLatexString(node)}
                            </span>
                            {nIdx < nodes.length - 1 && (
                                <ArrowRight className="size-4 shrink-0 text-blue-400 dark:text-blue-600" />
                            )}
                        </React.Fragment>
                    ))}
                </div>,
            );

            return;
        }

        // Handle bullet lists
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const textVal = trimmed.substring(1).trim();
            elements.push(
                <ul
                    key={`ul-${idx}`}
                    className="my-1.5 list-disc pl-5 text-xs leading-relaxed text-muted-foreground"
                >
                    <li className="font-semibold">
                        {parseInlineBold(textVal)}
                    </li>
                </ul>,
            );

            return;
        }

        // Default paragraph
        elements.push(
            <p
                key={`p-${idx}`}
                className="my-2 text-xs leading-relaxed font-semibold text-muted-foreground"
            >
                {parseInlineBold(trimmed)}
            </p>,
        );
    });

    return <div className="space-y-1">{elements}</div>;
}
