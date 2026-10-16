import DOMPurify from 'dompurify';
import { Shapes, ZoomIn } from 'lucide-react';
import React, { useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

// Configure DOMPurify to allow SVG tags and attributes safely
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

export const sanitizeSvg = (svg: string): string => {
    return DOMPurify.sanitize(svg, svgConfig);
};

interface SvgDiagramViewerProps {
    svgContent: string;
    title?: string;
    className?: string;
}

export function SvgDiagramViewer({
    svgContent,
    title = 'Visual Diagram',
    className = '',
}: SvgDiagramViewerProps) {
    const sanitizedSvg = useMemo(() => {
        let clean = svgContent.trim();

        // Ensure the SVG has responsive class and viewBox properties
        if (!/viewBox=/i.test(clean)) {
            // If missing viewBox, infer from width/height if available
            const wMatch = clean.match(/width=["'](\d+)["']/i);
            const hMatch = clean.match(/height=["'](\d+)["']/i);
            if (wMatch && hMatch) {
                clean = clean.replace(
                    /^<svg/i,
                    `<svg viewBox="0 0 ${wMatch[1]} ${hMatch[1]}"`,
                );
            }
        }

        // Enforce responsive sizing and preserve aspect ratio
        clean = clean.replace(
            /^<svg/i,
            '<svg width="100%" height="auto" class="w-full h-auto max-h-[340px] sm:max-h-[400px] object-contain transition-transform duration-200" preserveAspectRatio="xMidYMid meet"',
        );

        return sanitizeSvg(clean);
    }, [svgContent]);

    const modalSvg = useMemo(() => {
        let clean = svgContent.trim();
        clean = clean.replace(
            /^<svg/i,
            '<svg width="100%" height="auto" class="w-full h-auto max-h-[80vh] object-contain" preserveAspectRatio="xMidYMid meet"',
        );

        return sanitizeSvg(clean);
    }, [svgContent]);

    return (
        <div
            className={`my-4 overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-b from-indigo-50/50 via-card to-purple-50/30 p-3.5 shadow-2xs transition-all hover:border-indigo-300 sm:p-5 dark:border-indigo-900/50 dark:from-slate-900/90 dark:via-slate-950 dark:to-indigo-950/30 ${className}`}
        >
            <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-indigo-100/70 pb-2 sm:mb-3 dark:border-indigo-900/40">
                <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
                        <Shapes className="size-3.5" />
                    </span>
                    <span className="font-heading text-xs font-bold tracking-wide text-foreground">
                        {title}
                    </span>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-2xs backdrop-blur-xs transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
                        >
                            <ZoomIn className="size-3.5" />
                            <span className="hidden sm:inline">Inspect / Zoom</span>
                            <span className="sm:hidden">Zoom</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl border border-border bg-card p-4 sm:p-6 sm:rounded-2xl">
                        <DialogHeader className="mb-3">
                            <DialogTitle className="flex items-center gap-2 font-heading text-base font-bold text-foreground">
                                <Shapes className="size-4 text-indigo-600 dark:text-indigo-400" />
                                {title}
                            </DialogTitle>
                        </DialogHeader>
                        <div
                            className="flex max-h-[80vh] w-full items-center justify-center overflow-auto rounded-xl bg-background/50 p-2 sm:p-4 [&_text]:font-sans [&_text]:select-none dark:[&_text[fill='#000']]:fill-slate-100 dark:[&_text[fill='#000000']]:fill-slate-100 dark:[&_text[fill='#1e293b']]:fill-slate-200 dark:[&_text[fill='#0f172a']]:fill-slate-100 dark:[&_text[fill='#334155']]:fill-slate-200 dark:[&_line[stroke='#000']]:stroke-slate-400 dark:[&_line[stroke='#000000']]:stroke-slate-400"
                            dangerouslySetInnerHTML={{ __html: modalSvg }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div
                className="group relative flex w-full items-center justify-center overflow-x-auto rounded-xl bg-background/60 p-2 select-none sm:p-4 [&_text]:font-sans dark:[&_text[fill='#000']]:fill-slate-100 dark:[&_text[fill='#000000']]:fill-slate-100 dark:[&_text[fill='#1e293b']]:fill-slate-200 dark:[&_text[fill='#0f172a']]:fill-slate-100 dark:[&_text[fill='#334155']]:fill-slate-200 dark:[&_line[stroke='#000']]:stroke-slate-400 dark:[&_line[stroke='#000000']]:stroke-slate-400"
                dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
            />
        </div>
    );
}
