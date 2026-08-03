import { router } from '@inertiajs/react';
import type React from 'react';
import { useState } from 'react';
import { index as historyIndex } from '@/routes/history';
import type { HistoryPageProps } from '../types';

export function useHistoryState({ attempts = [], filters }: HistoryPageProps) {
    const [searchVal, setSearchVal] = useState(filters.search || '');
    const [selectedTrack, setSelectedTrack] = useState(
        filters.track || 'All Tracks',
    );
    const [selectedDate, setSelectedDate] = useState(filters.date || 'all');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'success',
        onConfirm: () => {},
    });

    const handleDeleteAttempt = (id: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Attempt Record?',
            message:
                'Are you sure you want to delete this attempt record? This action cannot be undone and will permanently remove it from your history metrics.',
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/exams/attempts/${id}`, {
                    preserveScroll: true,
                });
            },
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(attempts.map((att) => att.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((i) => i !== id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Delete Selected Attempts?',
            message: `Are you sure you want to delete ${selectedIds.length} attempt records? This action cannot be undone.`,
            confirmLabel: 'Delete All',
            variant: 'danger',
            onConfirm: () => {
                router.post(
                    '/exams/attempts/bulk-delete',
                    { ids: selectedIds },
                    {
                        preserveScroll: true,
                        onSuccess: () => setSelectedIds([]),
                    },
                );
            },
        });
    };

    const updateFilters = (
        newSearch: string,
        newTrack: string,
        newDate: string,
    ) => {
        router.get(
            historyIndex().url,
            {
                search: newSearch,
                track: newTrack,
                date: newDate,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
                onSuccess: () => setSelectedIds([]),
            },
        );
    };

    const handleTrackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedTrack(val);
        updateFilters(searchVal, val, selectedDate);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedDate(val);
        updateFilters(searchVal, selectedTrack, val);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters(searchVal, selectedTrack, selectedDate);
    };

    return {
        searchVal,
        setSearchVal,
        selectedTrack,
        setSelectedTrack,
        selectedDate,
        setSelectedDate,
        selectedIds,
        setSelectedIds,
        confirmModal,
        setConfirmModal,
        handleDeleteAttempt,
        handleSelectAll,
        handleSelectOne,
        handleBulkDelete,
        handleTrackChange,
        handleDateChange,
        handleSearchSubmit,
    };
}
