import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ExplanationPreviewProps {
    text: string;
}

export function ExplanationPreview({ text }: ExplanationPreviewProps) {
    if (!text) {
        return null;
    }

    const parseInlineBold = (lineText: string) => {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(lineText)) !== null) {
            if (match.index > lastIndex) {
                parts.push(lineText.substring(lastIndex, match.index));
            }
            parts.push(
                <strong key={match.index} className="font-black text-foreground">
                    {match[1]}
                </strong>
            );
            lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < lineText.length) {
            parts.push(lineText.substring(lastIndex));
        }

        return parts.length > 0 ? parts : lineText;
    };

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
            return;
        }

        // Handle Mental Math Shortcuts
        if (trimmed.toLowerCase().includes('mental math shortcut:') || trimmed.toLowerCase().includes('mental math shortcut')) {
            const content = trimmed.substring(trimmed.toLowerCase().indexOf('shortcut') + 8).replace(/^s*:/, '').trim();
            elements.push(
                <div key={`shortcut-${idx}`} className="my-4 rounded-xl border border-amber-200 bg-amber-50/15 p-4 dark:border-amber-900/30 dark:bg-amber-950/10">
                    <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wide block mb-1">🧠 Mental Math Shortcut</span>
                    <p className="text-xs leading-relaxed text-foreground font-semibold">{content}</p>
                </div>
            );
            return;
        }

        // Handle deductive reasoning logic chains
        if (trimmed.includes('->') && !trimmed.startsWith('|')) {
            const nodes = trimmed.split('->').map(n => n.trim());
            elements.push(
                <div key={`chain-${idx}`} className="my-4 flex flex-wrap items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/10 p-3.5 dark:border-blue-900/20 dark:bg-blue-950/10">
                    {nodes.map((node, nIdx) => (
                        <React.Fragment key={nIdx}>
                            <span className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-black text-white shadow-3xs">
                                {node}
                            </span>
                            {nIdx < nodes.length - 1 && (
                                <ArrowRight className="size-4 text-blue-400 dark:text-blue-600 shrink-0" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            );
            return;
        }

        // Handle bullet lists
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const textVal = trimmed.substring(1).trim();
            elements.push(
                <ul key={`ul-${idx}`} className="list-disc pl-5 my-1.5 text-xs leading-relaxed text-muted-foreground">
                    <li className="font-semibold">{parseInlineBold(textVal)}</li>
                </ul>
            );
            return;
        }

        // Default paragraph
        elements.push(
            <p key={`p-${idx}`} className="text-xs leading-relaxed text-muted-foreground my-2 font-semibold">
                {parseInlineBold(trimmed)}
            </p>
        );
    });

    return <div className="space-y-1">{elements}</div>;
}
