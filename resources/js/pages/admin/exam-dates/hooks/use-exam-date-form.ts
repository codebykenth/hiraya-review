import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { ExamDate, ExamDateFormData } from '../types';

export function useExamDateForm() {
    const [editingId, setEditingId] = useState<number | null>(null);
    const { data, setData, post, put, reset, clearErrors, errors, processing } =
        useForm<ExamDateFormData>({
            date: '',
            description: '',
            is_active: true,
        });

    const formatDateForInput = (dateString: string): string => {
        const d = new Date(dateString);

        return !isNaN(d.getTime())
            ? d.getFullYear() +
                  '-' +
                  String(d.getMonth() + 1).padStart(2, '0') +
                  '-' +
                  String(d.getDate()).padStart(2, '0')
            : dateString;
    };

    const handleEdit = (examDate: ExamDate) => {
        setEditingId(examDate.id);
        setData({
            date: formatDateForInput(examDate.date),
            description: examDate.description,
            is_active: examDate.is_active,
        });
        clearErrors();
    };

    const handleCancel = () => {
        setEditingId(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/admin/exam-dates/${editingId}`, {
                onSuccess: () => handleCancel(),
            });
        } else {
            post('/admin/exam-dates', {
                onSuccess: () => reset(),
            });
        }
    };

    const handleDateChange = (newDate: string) => {
        const d = new Date(newDate);
        let newDesc = data.description;

        if (!isNaN(d.getTime())) {
            const month = d.toLocaleString('en-US', {
                month: 'long',
                timeZone: 'UTC',
            });
            const year = d.getUTCFullYear();
            newDesc = `${month} ${year} Exam`;
        }

        setData({
            ...data,
            date: newDate,
            description: newDesc,
        });
    };

    return {
        editingId,
        data,
        errors,
        processing,
        setData,
        handleEdit,
        handleCancel,
        handleSubmit,
        handleDateChange,
    };
}
