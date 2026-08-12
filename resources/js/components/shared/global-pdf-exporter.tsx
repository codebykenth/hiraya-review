import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PrintableExam } from '@/pages/user/exams/components/printable-exam';
import type { Question } from '@/pages/user/exams/types';

export interface PdfExportPayload {
    questions: Question[];
    title: string;
    exportToken: string;
}

export function triggerPdfExport(payload: PdfExportPayload) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new CustomEvent('hiraya:export-pdf', { detail: payload }),
        );
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

        window.addEventListener('hiraya:export-pdf', handleExport);

        return () =>
            window.removeEventListener('hiraya:export-pdf', handleExport);
    }, []);

    if (!payload) {
        return null;
    }

    return (
        <PrintableExam
            questions={payload.questions}
            title={payload.title}
            onComplete={() => {
                setPayload(null);

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(
                        new CustomEvent('hiraya:export-pdf-done'),
                    );
                }
            }}
        />
    );
}
