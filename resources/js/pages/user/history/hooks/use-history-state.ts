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
    const [perPage, setPerPage] = useState<number>(filters.per_page || 10);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

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

    const toggleExpandRow = (id: number) => {
        setExpandedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

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
                    onSuccess: () => {
                        setSelectedIds((prev) => prev.filter((i) => i !== id));
                        setExpandedIds((prev) => prev.filter((i) => i !== id));
                    },
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
                        onSuccess: () => {
                            setSelectedIds([]);
                            setExpandedIds([]);
                        },
                    },
                );
            },
        });
    };

    const updateFilters = (
        newSearch: string,
        newTrack: string,
        newDate: string,
        newPerPage: number,
    ) => {
        router.get(
            historyIndex().url,
            {
                search: newSearch,
                track: newTrack,
                date: newDate,
                per_page: newPerPage,
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
        updateFilters(searchVal, val, selectedDate, perPage);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedDate(val);
        updateFilters(searchVal, selectedTrack, val, perPage);
    };

    const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = parseInt(e.target.value, 10);
        setPerPage(val);
        updateFilters(searchVal, selectedTrack, selectedDate, val);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters(searchVal, selectedTrack, selectedDate, perPage);
    };

    return {
        searchVal,
        setSearchVal,
        selectedTrack,
        setSelectedTrack,
        selectedDate,
        setSelectedDate,
        perPage,
        setPerPage,
        selectedIds,
        setSelectedIds,
        expandedIds,
        toggleExpandRow,
        confirmModal,
        setConfirmModal,
        handleDeleteAttempt,
        handleSelectAll,
        handleSelectOne,
        handleBulkDelete,
        handleTrackChange,
        handleDateChange,
        handlePerPageChange,
        handleSearchSubmit,
    };
}
