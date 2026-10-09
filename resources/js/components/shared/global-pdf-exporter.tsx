import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PrintableExam } from '@/pages/user/exams/components/printable-exam';
import type { Question } from '@/pages/user/exams/types';

export interface PdfExportPayload {
    questions: Question[];
    title: string;
    exportToken: string;
}

let isGlobalExportActive = false;

export function isPdfExporting(): boolean {
    return isGlobalExportActive;
}

export function triggerPdfExport(payload: PdfExportPayload) {
    isGlobalExportActive = true;

    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('hiraya:export-pdf', { detail: payload }),
        );
    }
}

export function cancelPdfExport() {
    isGlobalExportActive = false;

    if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('isPdfExporting');
        window.dispatchEvent(new CustomEvent('hiraya:export-pdf-cancel'));
        window.dispatchEvent(new CustomEvent('hiraya:export-pdf-done'));
    }
}

export function GlobalPdfExporter() {
    const [payload, setPayload] = useState<PdfExportPayload | null>(null);
    const lastTokenRef = React.useRef<string | null>(null);

    useEffect(() => {
        const handleExport = (e: Event) => {
            const customEvent = e as CustomEvent<PdfExportPayload>;
            const detail = customEvent.detail;

            if (!detail || !detail.questions?.length || !detail.exportToken) {
                toast.error('Unauthorized PDF export attempt.');

                if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem('isPdfExporting');
                    window.dispatchEvent(
                        new CustomEvent('hiraya:export-pdf-done'),
                    );
                }

                return;
            }

            // Prevent duplicate handling of the same export session token
            if (lastTokenRef.current === detail.exportToken) {
                return;
            }

            lastTokenRef.current = detail.exportToken;

            setPayload(detail);
        };

        const handleCancel = () => {
            isGlobalExportActive = false;
            setPayload(null);
            lastTokenRef.current = null;
        };

        window.addEventListener('hiraya:export-pdf', handleExport);
        window.addEventListener('hiraya:export-pdf-cancel', handleCancel);

        return () => {
            window.removeEventListener('hiraya:export-pdf', handleExport);
            window.removeEventListener('hiraya:export-pdf-cancel', handleCancel);
        };
    }, []);

    if (!payload) {
        return null;
    }

    return (
        <PrintableExam
            questions={payload.questions}
            title={payload.title}
            onComplete={() => {
                isGlobalExportActive = false;
                setPayload(null);
                lastTokenRef.current = null;

                if (typeof window !== 'undefined') {
                    window.sessionStorage.removeItem('isPdfExporting');
                    window.dispatchEvent(
                        new CustomEvent('hiraya:export-pdf-done'),
                    );
                }
            }}
        />
    );
}
