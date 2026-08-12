import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import type { Question } from '../types';

interface PrintableExamProps {
    questions: Question[];
    title: string;
    onComplete?: () => void;
}

/** Max height (px) a single column of questions may occupy before wrapping to the next
 *  column/page. Kept below the A4 content height so every page is the same size. */
const COLUMN_MAX_HEIGHT = 1050;

/** Real vertical spacing between questions inside a column:
 *  .booklet-col flex gap (8px) + .q-item margin-bottom (6px). */
const COLUMN_GAP = 14;

/** Number of columns used in the answer key grid. */
const ANSWER_KEY_COLUMNS = 6;

interface AdaptivePage {
    columns: Question[][];
    startIndex: number;
}

/**
 * Greedily packs questions into columns (max 2 per page) so each column stays under
 * COLUMN_MAX_HEIGHT. Returns pages with their column layout and the global starting
 * index of each page.
 */
function computeAdaptivePages(
    questions: Question[],
    heights: number[],
): AdaptivePage[] {
    const pages: AdaptivePage[] = [];
    let pageCols: Question[][] = [];
    let col: Question[] = [];
    let colHeight = 0;
    let startIndex = 0;

    const closeCol = () => {
        if (col.length === 0) {
            return;
        }

        pageCols.push(col);
        col = [];
        colHeight = 0;

        if (pageCols.length === 2) {
            let count = 0;

            for (const c of pageCols) {
                count += c.length;
            }

            pages.push({ columns: pageCols, startIndex });
            startIndex += count;
            pageCols = [];
        }
    };

    for (let i = 0; i < questions.length; i++) {
        const h = heights[i] || 0;

        if (col.length > 0 && colHeight + h + COLUMN_GAP > COLUMN_MAX_HEIGHT) {
            closeCol();
        }

        col.push(questions[i]);
        colHeight += h + (col.length > 1 ? COLUMN_GAP : 0);
    }

    closeCol();

    if (pageCols.length > 0) {
        pages.push({ columns: pageCols, startIndex });
    }

    return pages;
}

/**
 * Generates a data URI for the watermark SVG text pattern.
 * Tiles across all pages via body background-image.
 */
function buildWatermarkDataUri(logoBase64: string | null): string {
    const logoTag = logoBase64
        ? `<image href="${logoBase64}" x="220" y="58" width="60" height="65" style="filter: grayscale(100%);" />`
        : `<image href="/images/hiraya_logo_cropped.png" x="220" y="58" width="60" height="65" style="filter: grayscale(100%);" />`;

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="420" viewBox="0 0 500 420">
        <!-- OCR Honeypot / Poison Layer (Barely visible to humans, picked up by high-contrast OCR) -->
        <g opacity="0.015" font-family="monospace" font-size="10" fill="#000" font-weight="bold">
            <text x="10" y="30">HIRAYA REVIEW - DO NOT COPY - ILLEGAL REPRODUCTION</text>
            <text x="80" y="80">WARNING: UNAUTHORIZED OCR EXTRACTION</text>
            <text x="10" y="130">HIRAYA REVIEW - DO NOT COPY - ILLEGAL REPRODUCTION</text>
            <text x="80" y="180">WARNING: UNAUTHORIZED OCR EXTRACTION</text>
            <text x="10" y="230">HIRAYA REVIEW - DO NOT COPY - ILLEGAL REPRODUCTION</text>
            <text x="80" y="280">WARNING: UNAUTHORIZED OCR EXTRACTION</text>
            <text x="10" y="330">HIRAYA REVIEW - DO NOT COPY - ILLEGAL REPRODUCTION</text>
            <text x="80" y="380">WARNING: UNAUTHORIZED OCR EXTRACTION</text>
        </g>
        <g transform="rotate(-30, 250, 210)" opacity="0.04">
            ${logoTag}
            <text x="250" y="152" text-anchor="middle" font-family="sans-serif" font-size="30" font-weight="900" fill="#000" letter-spacing="3">HIRAYA REVIEW</text>
            <text x="250" y="176" text-anchor="middle" font-family="sans-serif" font-size="12" font-weight="700" fill="#000">Official Mock Examination</text>
            <rect x="175" y="188" width="150" height="22" rx="3" fill="none" stroke="#000" stroke-width="1.5"/>
            <text x="250" y="204" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="900" fill="#000" letter-spacing="2">NOT FOR SALE</text>
        </g>
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg.trim())}`;
}

/**
 * Print-safe DOMPurify config allowing SVGs + basic HTML layout tags.
 */
const PRINT_SANITIZE_CONFIG = {
    USE_PROFILES: { html: true, svg: true, svgFilters: true },
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
        'use',
        'image',
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
        'points',
        'x1',
        'y1',
        'x2',
        'y2',
        'text-anchor',
        'font-family',
        'font-size',
        'font-weight',
        'dominant-baseline',
        'style',
        'preserveAspectRatio',
        'fill-opacity',
        'stroke-opacity',
    ],
    FORBID_TAGS: [
        'script',
        'iframe',
        'object',
        'embed',
        'form',
        'input',
        'button',
        'link',
        'meta',
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
    ],
};

/** Converts markdown tables and formatting (**bold**, *italic*, newlines) into HTML tags */
function parseMarkdownToHtml(text: string): string {
    if (!text) {
        return '';
    }

    let result = text;

    // 1. Parse markdown tables (| col1 | col2 |)
    const lines = result.split(/\r?\n/);
    const processedLines: string[] = [];
    let inTable = false;
    let tableLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('|') && line.endsWith('|')) {
            inTable = true;
            tableLines.push(line);
        } else {
            if (inTable) {
                processedLines.push(buildHtmlTable(tableLines));
                tableLines = [];
                inTable = false;
            }

            processedLines.push(lines[i]);
        }
    }

    if (inTable) {
        processedLines.push(buildHtmlTable(tableLines));
    }

    result = processedLines.join('\n');

    // 2. Bold (**text**) & Italic (*text*)
    result = result
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 3. Normalize newlines (avoid double br inside tables or after block elements)
    result = result
        .replace(/\\r\\n/g, '<br/>')
        .replace(/\\n/g, '<br/>')
        .replace(/\r\n/g, '<br/>')
        .replace(/\n/g, '<br/>')
        .replace(/(<\/table>)\s*<br\s*\/?>/gi, '$1')
        .replace(/(<\/div>)\s*<br\s*\/?>/gi, '$1');

    return result;
}

function buildHtmlTable(lines: string[]): string {
    if (lines.length === 0) {
        return '';
    }

    const parseRow = (line: string) =>
        line
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());

    // Header row
    const headers = parseRow(lines[0]);
    let html = '<table class="print-table"><thead><tr>';
    headers.forEach((h) => {
        html += `<th>${h}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Data rows (skip line index 1 if it's the markdown divider |:---|)
    const startIdx = lines.length > 1 && lines[1].includes('---') ? 2 : 1;

    for (let i = startIdx; i < lines.length; i++) {
        const cells = parseRow(lines[i]);

        if (cells.length > 0) {
            html +=
                '<tr>' + cells.map((c) => `<td>${c}</td>`).join('') + '</tr>';
        }
    }

    html += '</tbody></table>';

    return html;
}

/** Unified PrintContent component for 100% consistent typography, table, and SVG rendering */
function PrintContent({ content }: { content: string }) {
    const sanitized = useMemo(() => {
        const html = parseMarkdownToHtml(content);

        return DOMPurify.sanitize(html, PRINT_SANITIZE_CONFIG);
    }, [content]);

    return (
        <div
            className="print-prose-html"
            dangerouslySetInnerHTML={{ __html: sanitized }}
        />
    );
}

function renderQuestion(q: Question, index: number) {
    return (
        <div key={q.id} className="q-item avoid-break">
            <div className="q-layout">
                <div className="q-num">{index + 1}.</div>
                <div className="print-prose">
                    <PrintContent content={q.stem} />
                </div>
            </div>

            <div className="avoid-break" style={{ paddingLeft: '22px' }}>
                {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="opt-layout">
                        <div className="q-num">
                            {String.fromCharCode(65 + optIdx)}.
                        </div>
                        <div className="print-prose">
                            <PrintContent content={opt} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function PrintableExam({
    questions,
    title,
    onComplete,
}: PrintableExamProps) {
    const [mounted, setMounted] = useState(false);
    const [questionPages, setQuestionPages] = useState<AdaptivePage[]>([]);
    const [logoBase64, setLogoBase64] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            if (!active) {
                return;
            }

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');

            if (ctx) {
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                );
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const gray =
                        0.299 * data[i] +
                        0.587 * data[i + 1] +
                        0.114 * data[i + 2];
                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }

                ctx.putImageData(imageData, 0, 0);
                setLogoBase64(canvas.toDataURL('image/png'));
            }
        };
        img.src = '/images/hiraya_logo_cropped.png';

        return () => {
            active = false;
        };
    }, []);

    const watermarkDataUri = useMemo(
        () => buildWatermarkDataUri(logoBase64),
        [logoBase64],
    );

    // Answer Sheet & Answer Key are laid out column-major (top-to-down).
    // Chunk the questions into ANSWER_KEY_COLUMNS columns of equal height.
    const answerSheetColumns = useMemo(() => {
        if (questions.length === 0) {
            return [] as number[][];
        }

        const perColumn = Math.ceil(questions.length / ANSWER_KEY_COLUMNS);
        const columns: number[][] = [];

        for (let c = 0; c < ANSWER_KEY_COLUMNS; c++) {
            const column: number[] = [];

            for (
                let i = c * perColumn;
                i < Math.min((c + 1) * perColumn, questions.length);
                i++
            ) {
                column.push(i + 1);
            }

            if (column.length > 0) {
                columns.push(column);
            }
        }

        return columns;
    }, [questions]);

    const answerKeyColumns = useMemo(() => {
        if (questions.length === 0) {
            return [] as { num: number; answer: string }[][];
        }

        const perColumn = Math.ceil(questions.length / ANSWER_KEY_COLUMNS);
        const columns: { num: number; answer: string }[][] = [];

        for (let c = 0; c < ANSWER_KEY_COLUMNS; c++) {
            const column: { num: number; answer: string }[] = [];

            for (
                let i = c * perColumn;
                i < Math.min((c + 1) * perColumn, questions.length);
                i++
            ) {
                column.push({
                    num: i + 1,
                    answer: String.fromCharCode(
                        65 + questions[i].correct_option,
                    ),
                });
            }

            if (column.length > 0) {
                columns.push(column);
            }
        }

        return columns;
    }, [questions]);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);

        return () => {
            clearTimeout(timer);
            setMounted(false);
        };
    }, []);

    // Measure the real height of every question at its actual column width, then pack the
    // questions into fixed-height A4 pages so no page is ever smaller or larger than another.
    useEffect(() => {
        if (!mounted || questions.length === 0) {
            return;
        }

        let cancelled = false;

        const measureAndPack = () => {
            if (cancelled) {
                return;
            }

            const items = Array.from(
                document.querySelectorAll<HTMLElement>(
                    '.pdf-measure .measure-item',
                ),
            );
            const heights = items.map((el) => el.offsetHeight || 0);
            setQuestionPages(computeAdaptivePages(questions, heights));
        };

        const timer = window.setTimeout(measureAndPack, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [mounted, questions]);

    useEffect(() => {
        // Wait until mounted, questions exist, AND adaptive pages have been measured & rendered
        if (
            !mounted ||
            !questions ||
            questions.length === 0 ||
            questionPages.length === 0
        ) {
            return;
        }

        let cancelled = false;

        const generateUncopyablePdf = async () => {
            let originalTitle = document.title;

            try {
                if (cancelled) {
                    return;
                }

                const element = document.getElementById('printable-exam-root');

                if (!element) {
                    return;
                }

                const cleanTitle = (title || 'Professional_Level_Reviewer')
                    .replace(/[^a-zA-Z0-9_-]/g, '_')
                    .replace(/_+/g, '_');
                const filename = `Hiraya_Review_${cleanTitle}`;
                originalTitle = document.title;
                document.title = filename;

                const onCloneHandler = (clonedDoc: Document) => {
                    const root = clonedDoc.getElementById(
                        'printable-exam-root',
                    );

                    if (!root) {
                        return;
                    }

                    // The screen stylesheet hides this element with `!important`, so inline
                    // overrides on the live element are ignored. html2canvas renders from the
                    // cloned document, so force a visible A4-width layout there instead.
                    const force = (prop: string, value: string) =>
                        root.style.setProperty(prop, value, 'important');
                    force('position', 'absolute');
                    force('left', '0px');
                    force('top', '0px');
                    force('width', '794px');
                    force('height', 'auto');
                    force('opacity', '1');
                    force('background', '#ffffff');
                    force('z-index', '0');
                    force('pointer-events', 'auto');

                    // Prevent SVG border clipping in html2canvas capture
                    clonedDoc.querySelectorAll('svg').forEach((svg) => {
                        svg.style.setProperty(
                            'overflow',
                            'visible',
                            'important',
                        );
                        svg.style.setProperty(
                            'box-sizing',
                            'content-box',
                            'important',
                        );
                        svg.style.setProperty('padding', '3px', 'important');
                    });
                };

                const pages = Array.from(
                    element.querySelectorAll<HTMLElement>('.exam-page'),
                );

                if (pages.length === 0) {
                    return;
                }

                const pdf = new jsPDF('p', 'mm', 'a4');
                const PAGE_W = 210; // A4 width in mm
                const PAGE_H = 297; // A4 height in mm
                const MARGIN_MM = 6;
                const CONTENT_W = PAGE_W - MARGIN_MM * 2;
                const CONTENT_H = PAGE_H - MARGIN_MM * 2;

                let isFirstPdfPage = true;
                let pageIndex = 0;
                const totalPages = pages.length;

                for (const pageEl of pages) {
                    if (cancelled) {
                        return;
                    }

                    pageIndex++;
                    toast.loading(
                        `Generating PDF Examination Booklet... (Page ${pageIndex} of ${totalPages})`,
                        {
                            id: 'pdf-export-toast',
                            action: {
                                label: 'Cancel',
                                onClick: () => {
                                    cancelled = true;
                                    toast.dismiss('pdf-export-toast');
                                    toast.error('PDF Generation Cancelled.');
                                },
                            },
                        },
                    );

                    const capW = Math.max(
                        pageEl.scrollWidth || pageEl.offsetWidth || 794,
                        100,
                    );
                    const capH = Math.max(
                        pageEl.scrollHeight || pageEl.offsetHeight || 1047,
                        100,
                    );

                    let canvas;

                    try {
                        canvas = await html2canvas(pageEl, {
                            scale: 1.5,
                            useCORS: true,
                            logging: false,
                            backgroundColor: '#ffffff',
                            x: 0,
                            y: 0,
                            width: capW,
                            height: capH,
                            windowWidth: 794,
                            windowHeight: capH,
                            scrollX: 0,
                            scrollY: 0,
                            onclone: onCloneHandler,
                        });
                    } catch (scaleErr) {
                        console.warn(
                            'Retrying page capture with 1.0 scale fallback...',
                            scaleErr,
                        );
                        canvas = await html2canvas(pageEl, {
                            scale: 1.0,
                            useCORS: true,
                            logging: false,
                            backgroundColor: '#ffffff',
                            x: 0,
                            y: 0,
                            width: capW,
                            height: capH,
                            windowWidth: 794,
                            windowHeight: capH,
                            scrollX: 0,
                            scrollY: 0,
                            onclone: onCloneHandler,
                        });
                    }

                    if (cancelled) {
                        return;
                    }

                    const pageImgData = canvas.toDataURL('image/jpeg', 0.9);

                    if (!isFirstPdfPage) {
                        pdf.addPage();
                    }

                    isFirstPdfPage = false;

                    // Every page is rendered at the exact A4 content-area aspect ratio
                    // (794x1143px), so every image fills the content area identically.
                    // No fit/scaling is applied — pages always share the same size + margins.
                    const x = MARGIN_MM;
                    const y = MARGIN_MM;
                    pdf.addImage(
                        pageImgData,
                        'JPEG',
                        x,
                        y,
                        CONTENT_W,
                        CONTENT_H,
                    );

                    // Free up memory aggressively
                    canvas.width = 0;
                    canvas.height = 0;
                    canvas = null as unknown as HTMLCanvasElement;
                }

                if (cancelled) {
                    toast.dismiss('pdf-export-toast');

                    return;
                }

                pdf.save(`${filename}.pdf`);
                toast.success(
                    'PDF Examination Booklet generated and downloaded!',
                    {
                        id: 'pdf-export-toast',
                    },
                );
            } catch (err) {
                console.error('PDF export error:', err);
                toast.error(
                    'Unable to export PDF. Opening browser print fallback.',
                    {
                        id: 'pdf-export-toast',
                    },
                );
                window.print();
            } finally {
                if (originalTitle) {
                    document.title = originalTitle;
                }

                if (onComplete) {
                    onComplete();
                }
            }
        };

        const timer = setTimeout(generateUncopyablePdf, 500);

        return () => {
            cancelled = true;
            toast.dismiss('pdf-export-toast');
            clearTimeout(timer);
        };
    }, [mounted, questions, title, onComplete, questionPages]);

    if (!questions || questions.length === 0 || !mounted) {
        return null;
    }

    const content = (
        <div id="printable-exam-root" className="print-root">
            <style>
                {`
                /* Show only the printable exam — shared by print AND html2canvas screen capture */
                #printable-exam-root {
                    display: block !important;
                    position: relative;
                    z-index: 9999;
                    font-family: 'Georgia', 'Times New Roman', serif;
                    font-size: 12px;
                    line-height: 1.35;
                    color: #000 !important;
                    background: #ffffff !important;
                }

                /* Ensure all content sits above the watermark */
                .print-content-layer {
                    position: relative;
                    z-index: 1;
                }

                /* Force transparent backgrounds so watermark shows through */
                .print-content-layer,
                .print-content-layer * {
                    background-color: transparent !important;
                }

                /* One A4 page of the booklet. Rendered offscreen for the PDF and as a
                   real page when printed (page-break-after). */
                .exam-page {
                    position: relative;
                    box-sizing: border-box;
                    width: 100% !important;
                    min-height: 277mm;
                    padding: 20px 28px;
                    background: #ffffff url('${watermarkDataUri}') repeat !important;
                    background-size: 280px 280px !important;
                    page-break-after: always;
                    break-after: page;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                @media print {
                    @page { margin: 10mm; size: A4; }

                    /* Hidden measurement harness must never appear in printed output */
                    .pdf-measure { display: none !important; }

                    /* Reset body for print — watermark as body background tiles across ALL pages */
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color: black !important;
                        background: url('${watermarkDataUri}') repeat !important;
                        background-size: 280px 280px !important;
                    }

                    /* Hide the entire app shell — but NOT our portal root */
                    #app { display: none !important; }
                }

                /* Page breaks & avoid breaks */
                .avoid-break { page-break-inside: avoid; break-inside: avoid; }

                /* CSE Booklet 2-column layout */
                .booklet-two-columns {
                    display: grid !important;
                    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
                    gap: 16px !important;
                    align-items: start !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }

                .booklet-col {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 8px !important;
                    min-width: 0 !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }

                .q-item {
                    margin-bottom: 6px !important;
                    padding-bottom: 6px !important;
                    border-bottom: 1px dashed #e5e5e5 !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    box-sizing: border-box !important;
                    width: 100% !important;
                    min-width: 0 !important;
                }

                .q-item-wide {
                    width: 100% !important;
                    margin-bottom: 8px !important;
                    box-sizing: border-box !important;
                }

                .q-layout {
                    display: grid;
                    grid-template-columns: 24px minmax(0, 1fr);
                    column-gap: 4px;
                    align-items: start;
                    margin-bottom: 3px;
                }
                .opt-layout {
                    display: grid !important;
                    grid-template-columns: 20px minmax(0, 1fr) !important;
                    column-gap: 4px !important;
                    align-items: center !important;
                    margin-bottom: 4px !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .q-num {
                    text-align: right;
                    font-weight: bold;
                    padding-top: 1px;
                }

                /* Print HTML Renderer (PrintContent) styles */
                .print-prose-html {
                    font-family: 'Georgia', 'Times New Roman', serif !important;
                    font-size: 11px !important;
                    line-height: 1.35 !important;
                    color: #000 !important;
                    max-width: 100% !important;
                    overflow-wrap: break-word;
                    word-break: break-word;
                }
                .print-prose-html p,
                .print-prose-html div {
                    margin: 0 0 2px 0 !important;
                    padding: 0 !important;
                    color: #000 !important;
                    font-family: inherit !important;
                    font-size: 11px !important;
                    max-width: 100% !important;
                }

                /* Prevent SVG stroke clipping across stem diagrams & multiple-choice option graphics */
                svg {
                    overflow: visible !important;
                    box-sizing: content-box !important;
                }

                .q-layout .print-prose,
                .opt-layout .print-prose,
                .print-prose-html {
                    min-width: 0 !important;
                    overflow: visible !important;
                }

                /* Question Stem Images, Tables & SVGs (Charts, Diagrams, Maps) */
                .q-layout .print-prose-html svg,
                .q-layout .print-prose svg,
                .q-layout img,
                .q-item img,
                .q-item svg,
                .print-prose-html img,
                .print-prose-html svg,
                .print-prose-html table {
                    max-width: 100% !important;
                    max-height: 220px !important;
                    width: auto !important;
                    height: auto !important;
                    display: block !important;
                    margin: 6px auto !important;
                    clear: both !important;
                    object-fit: contain !important;
                    overflow: visible !important;
                    padding: 3px !important;
                    box-sizing: content-box !important;
                }

                /* Option Choice Images & SVGs (Arcs, Geometry, Options A-E) */
                .opt-layout .print-prose-html svg,
                .opt-layout .print-prose svg,
                .opt-layout img {
                    max-width: 140px !important;
                    max-height: 56px !important;
                    width: auto !important;
                    height: auto !important;
                    display: inline-block !important;
                    margin: 2px 0 !important;
                    vertical-align: middle !important;
                    clear: none !important;
                    object-fit: contain !important;
                    overflow: visible !important;
                    padding: 3px !important;
                    box-sizing: content-box !important;
                }

                /* Preserve flex layout rows for sequence diagrams (e.g., Step 1 -> Step 2 -> Step 3) */
                .print-prose-html div[style*="display: flex"],
                .print-prose-html div[style*="display:flex"] {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    gap: 8px !important;
                    margin: 6px 0 !important;
                }
                .print-prose-html strong, .print-prose-html b {
                    font-weight: 800 !important;
                    color: #000 !important;
                }
                .print-prose-html table,
                .print-table {
                    width: 100% !important;
                    max-width: 100% !important;
                    border-collapse: collapse !important;
                    font-size: 9.5px !important;
                    font-family: Arial, Helvetica, sans-serif !important;
                    margin: 4px 0 !important;
                }
                .print-prose-html th,
                .print-table th {
                    font-weight: 700 !important;
                    background-color: #f0f0f0 !important;
                    border: 1px solid #777 !important;
                    padding: 3px 5px !important;
                    text-align: left !important;
                    color: #000 !important;
                }
                .print-prose-html td,
                .print-table td {
                    border: 1px solid #888 !important;
                    padding: 3px 5px !important;
                    color: #000 !important;
                }

                /* Header & Instructions */
                .print-header {
                    text-align: center;
                    margin-bottom: 12px;
                    padding-bottom: 6px;
                    border-bottom: 2px solid #000;
                    font-family: Arial, Helvetica, sans-serif;
                }
                .print-header-logo {
                    width: 36px;
                    height: 36px;
                    display: inline-block !important;
                    vertical-align: middle;
                    margin-right: 6px;
                }
                .print-header h1 {
                    font-size: 16px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    margin: 0;
                    line-height: 1.2;
                    display: inline;
                    vertical-align: middle;
                }
                .print-header p {
                    font-size: 10px;
                    margin: 2px 0 0;
                    color: #444;
                }
                .print-not-for-sale {
                    display: inline-block;
                    margin-top: 3px;
                    padding: 1px 10px;
                    border: 1.5px solid #000;
                    font-size: 8px;
                    font-weight: 900;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    font-family: Arial, sans-serif;
                    color: #000;
                }

                .print-instructions {
                    margin-bottom: 14px;
                    padding: 8px 10px;
                    border: 1px solid #777;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 10px;
                    page-break-inside: avoid;
                    break-inside: avoid;
                    background: rgba(255, 255, 255, 0.85) !important;
                }
                .print-instructions h2 {
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0 0 4px;
                }
                .print-instructions ul {
                    margin: 0;
                    padding-left: 18px;
                }
                .print-instructions li {
                    margin-bottom: 2px;
                }

                /* Running footer pinned to the bottom of each exam page */
                .print-running-footer {
                    position: absolute;
                    bottom: 12px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    font-size: 8px;
                    font-family: Arial, sans-serif;
                    color: #777;
                    padding: 4px 0;
                    border-top: 1px solid #ccc;
                }

                /* ========================================================
                   ANSWER SHEET (reads top-to-down, column by column)
                   ======================================================== */
                .answer-sheet-grid {
                    display: flex !important;
                    gap: 6px 12px !important;
                    margin-top: 14px !important;
                }
                .answer-sheet-col {
                    display: flex !important;
                    flex-direction: column !important;
                    flex: 1 1 0 !important;
                    min-width: 0 !important;
                    padding-right: 6px !important;
                    border-right: 1px solid #e5e5e5 !important;
                }
                .answer-sheet-col:last-child {
                    border-right: none !important;
                    padding-right: 0 !important;
                }
                .answer-sheet-row {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    gap: 5px !important;
                    margin-bottom: 4px !important;
                    padding-bottom: 3px !important;
                    border-bottom: 1px dashed #e0e0e0 !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                .sheet-num {
                    font-weight: 700 !important;
                    width: 22px !important;
                    text-align: right !important;
                    font-size: 9.5px !important;
                    font-family: Arial, sans-serif !important;
                    color: #111 !important;
                    flex-shrink: 0 !important;
                }
                .sheet-bubbles {
                    display: flex !important;
                    gap: 2.5px !important;
                    align-items: center !important;
                }
                .bubble {
                    width: 14px !important;
                    height: 14px !important;
                    border-radius: 50% !important;
                    border: 1px solid #333 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 7px !important;
                    font-weight: bold !important;
                    color: #222 !important;
                    font-family: Arial, sans-serif !important;
                }

                /* ========================================================
                   ANSWER KEY (reads top-to-down, column by column)
                   ======================================================== */
                .answer-key-grid {
                    display: flex !important;
                    gap: 6px 14px !important;
                    margin-top: 14px !important;
                }
                .answer-key-col {
                    display: flex !important;
                    flex-direction: column !important;
                    flex: 1 1 0 !important;
                    min-width: 0 !important;
                    padding-right: 8px !important;
                    border-right: 1px solid #e0e0e0 !important;
                }
                .answer-key-col:last-child {
                    border-right: none !important;
                    padding-right: 0 !important;
                }
                .answer-key-row {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    gap: 8px !important;
                    border-bottom: 1px solid #e0e0e0 !important;
                    padding-bottom: 3px !important;
                    margin-bottom: 4px !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    font-size: 10.5px !important;
                    font-family: Arial, sans-serif !important;
                }
                .key-num {
                    font-weight: 700 !important;
                    width: 24px !important;
                    text-align: right !important;
                    color: #111 !important;
                    flex-shrink: 0 !important;
                }
                .key-ans {
                    font-weight: 700 !important;
                    color: #000 !important;
                }

                /* Hidden measurement harness: renders each question at real column width
                   so adaptive pagination can measure heights before building pages. */
                .pdf-measure {
                    position: absolute !important;
                    left: -9999px !important;
                    top: 0 !important;
                    width: 361px !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    z-index: -9999 !important;
                }
                .pdf-measure .measure-item {
                    margin-bottom: 0 !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }

                /* Prevent copy & text selection */
                #printable-exam-root, #printable-exam-root *, .print-content-layer, .print-content-layer * {
                    user-select: none !important;
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                }

                /* Screen: position offscreen so layout engine measures DOM height correctly */
                @media screen {
                    #printable-exam-root {
                        position: fixed !important;
                        left: -9999px !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: auto !important;
                        opacity: 0 !important;
                        pointer-events: none !important;
                        z-index: -9999 !important;
                    }

                    /* Pin every page to the exact A4 content-area aspect ratio
                       (794px x 1143px == 198mm x 285mm) so every captured page has
                       identical dimensions in the PDF — no page is ever smaller. */
                    .exam-page {
                        width: 794px !important;
                        height: 1143px !important;
                        min-height: 0 !important;
                        overflow: hidden !important;
                        padding: 20px 28px !important;
                    }
                }
                `}
            </style>

            <div
                className="print-content-layer"
                onCopy={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
            >
                {/* Page 1 — Cover: header + general instructions */}
                <div className="exam-page">
                    <div className="print-header">
                        <div>
                            <img
                                src="/images/hiraya_logo_cropped.png"
                                alt="Hiraya Review"
                                className="print-header-logo"
                            />
                            <h1>{title}</h1>
                        </div>
                        <p>Mock Examination Booklet &bull; Hiraya Review</p>
                        <div className="print-not-for-sale">NOT FOR SALE</div>
                    </div>

                    <div className="print-instructions">
                        <h2>General Directions</h2>
                        <ul>
                            <li>
                                <strong>
                                    DO NOT OPEN THIS TEST BOOKLET UNTIL
                                    INSTRUCTED TO DO SO.
                                </strong>
                            </li>
                            <li>
                                Use <strong>Black Ballpen</strong> only
                                (strictly no gel pens, friction/erasable pens,
                                or pencils) to fully shade the circle of your
                                chosen answer on the Answer Sheet.
                            </li>
                            <li>
                                Select the <strong>BEST</strong> answer for each
                                item. Only one answer is permitted per question.
                            </li>
                            <li>
                                Avoid stray marks on your Answer Sheet. Ensure
                                your shading is neat and fully contained.
                            </li>
                            <li>
                                Strictly{' '}
                                <strong>
                                    NO CALCULATORS, SMARTPHONES, OR UNAUTHORIZED
                                    MATERIALS
                                </strong>{' '}
                                allowed.
                            </li>
                            <li>
                                Manage your time efficiently. Do not dwell
                                unnecessarily on any single difficult question.
                            </li>
                        </ul>
                    </div>

                    <div className="print-running-footer">
                        Hiraya Review &bull; Mock Examination &bull; NOT FOR
                        SALE &bull; Unauthorized reproduction is strictly
                        prohibited
                    </div>
                </div>

                {/* Hidden measurement harness — measured at the real column width (361px) */}
                <div className="pdf-measure" aria-hidden="true">
                    {questions.map((q, i) => (
                        <div key={q.id} className="measure-item">
                            {renderQuestion(q, i)}
                        </div>
                    ))}
                </div>

                {/* Question pages — 2 columns, questions packed by measured height so every
                    page is the same fixed size (no page is ever smaller than another) */}
                {questionPages.map((page, pageIdx) => {
                    const cols = page.columns;
                    const colStart = page.startIndex;

                    return (
                        <div key={`qpage-${pageIdx}`} className="exam-page">
                            <div className="booklet-two-columns">
                                <div className="booklet-col">
                                    {(cols[0] || []).map((q, i) =>
                                        renderQuestion(q, colStart + i),
                                    )}
                                </div>
                                <div className="booklet-col">
                                    {(cols[1] || []).map((q, i) =>
                                        renderQuestion(
                                            q,
                                            colStart +
                                                (cols[0]?.length || 0) +
                                                i,
                                        ),
                                    )}
                                </div>
                            </div>

                            <div className="print-running-footer">
                                Hiraya Review &bull; Mock Examination &bull; NOT
                                FOR SALE &bull; Unauthorized reproduction is
                                strictly prohibited
                            </div>
                        </div>
                    );
                })}

                {/* Answer Sheet Page */}
                <div className="exam-page">
                    <div className="print-header">
                        <h1>Answer Sheet</h1>
                        <p>{title}</p>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '12px',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '10px',
                        }}
                    >
                        <div
                            style={{
                                flex: 1,
                                borderBottom: '1px solid #000',
                                paddingBottom: '2px',
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 700,
                                    textTransform: 'uppercase' as const,
                                }}
                            >
                                Name:
                            </span>
                        </div>
                        <div
                            style={{
                                width: '120px',
                                borderBottom: '1px solid #000',
                                paddingBottom: '2px',
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 700,
                                    textTransform: 'uppercase' as const,
                                }}
                            >
                                Date:
                            </span>
                        </div>
                        <div
                            style={{
                                width: '90px',
                                borderBottom: '1px solid #000',
                                paddingBottom: '2px',
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 700,
                                    textTransform: 'uppercase' as const,
                                }}
                            >
                                Score:
                            </span>
                        </div>
                    </div>

                    <div className="answer-sheet-grid">
                        {answerSheetColumns.map((column, colIdx) => (
                            <div
                                key={`sheetcol-${colIdx}`}
                                className="answer-sheet-col"
                            >
                                {column.map((itemNum) => (
                                    <div
                                        key={`sheet-${itemNum}`}
                                        className="answer-sheet-row"
                                    >
                                        <span className="sheet-num">
                                            {itemNum}.
                                        </span>
                                        <div className="sheet-bubbles">
                                            {[0, 1, 2, 3, 4].map((optIdx) => (
                                                <div
                                                    key={`bubble-${itemNum}-${optIdx}`}
                                                    className="bubble"
                                                >
                                                    {String.fromCharCode(
                                                        65 + optIdx,
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="print-running-footer">
                        Hiraya Review &bull; Mock Examination &bull; NOT FOR
                        SALE &bull; Unauthorized reproduction is strictly
                        prohibited
                    </div>
                </div>

                {/* Answer Key Page */}
                <div className="exam-page">
                    <div className="print-header">
                        <h1>Answer Key</h1>
                        <p
                            style={{
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Strictly for checking purposes only
                        </p>
                    </div>

                    {/* Answer Key reads top-to-down (column-major): fills each column down
                        before moving to the next column to the right. */}
                    <div className="answer-key-grid">
                        {answerKeyColumns.map((column, colIdx) => (
                            <div
                                key={`keycol-${colIdx}`}
                                className="answer-key-col"
                            >
                                {column.map((row) => (
                                    <div
                                        key={`key-${row.num}`}
                                        className="answer-key-row"
                                    >
                                        <span className="key-num">
                                            {row.num}.
                                        </span>
                                        <span className="key-ans">
                                            {row.answer}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div className="print-running-footer">
                        Hiraya Review &bull; Mock Examination &bull; NOT FOR
                        SALE &bull; Unauthorized reproduction is strictly
                        prohibited
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(content, document.body);
}
