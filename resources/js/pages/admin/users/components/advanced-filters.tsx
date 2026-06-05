import { Filter, X, Calendar, Gauge, Clock } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdvancedFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    currentFilters: FilterState;
}

export interface FilterState {
    status: 'all' | 'active' | 'inactive';
    termsAcceptance: 'all' | 'accepted' | 'pending';
    role: 'all' | 'admin' | 'student';
    registrationDateFrom?: string;
    registrationDateTo?: string;
    lastLoginFrom?: string;
    lastLoginTo?: string;
    attemptsMin?: number;
    attemptsMax?: number;
}

export function AdvancedFilters({
    isOpen,
    onClose,
    onApply,
    currentFilters,
}: AdvancedFiltersProps) {
    const [filters, setFilters] = useState<FilterState>(currentFilters);

    const handleStatusChange = (status: FilterState['status']) => {
        setFilters((prev) => ({ ...prev, status }));
    };

    const handleTermsAcceptanceChange = (
        termsAcceptance: FilterState['termsAcceptance'],
    ) => {
        setFilters((prev) => ({ ...prev, termsAcceptance }));
    };

    const handleRoleChange = (role: FilterState['role']) => {
        setFilters((prev) => ({ ...prev, role }));
    };

    const handleRegistrationDateFromChange = (value: string) => {
        setFilters((prev) => ({ ...prev, registrationDateFrom: value }));
    };

    const handleRegistrationDateToChange = (value: string) => {
        setFilters((prev) => ({ ...prev, registrationDateTo: value }));
    };

    const handleLastLoginFromChange = (value: string) => {
        setFilters((prev) => ({ ...prev, lastLoginFrom: value }));
    };

    const handleLastLoginToChange = (value: string) => {
        setFilters((prev) => ({ ...prev, lastLoginTo: value }));
    };

    const handleAttemptsMinChange = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            attemptsMin: value ? parseInt(value, 10) : undefined,
        }));
    };

    const handleAttemptsMaxChange = (value: string) => {
        setFilters((prev) => ({
            ...prev,
            attemptsMax: value ? parseInt(value, 10) : undefined,
        }));
    };

    const handleReset = () => {
        const resetFilters: FilterState = {
            status: 'all',
            termsAcceptance: 'all',
            role: 'all',
        };
        setFilters(resetFilters);
        onApply(resetFilters);
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.termsAcceptance !== 'all' ||
        filters.role !== 'all' ||
        filters.registrationDateFrom ||
        filters.registrationDateTo ||
        filters.lastLoginFrom ||
        filters.lastLoginTo ||
        filters.attemptsMin ||
        filters.attemptsMax;

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-99 flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in"
            onClick={onClose}
        >
            <div
                className="relative flex max-h-[90vh] w-full max-w-3xl animate-in flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl duration-205 zoom-in-95 dark:border-slate-800 dark:bg-slate-950"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6 dark:border-slate-900 dark:bg-slate-900/10">
                    <div className="flex items-center gap-2">
                        <Filter className="size-5 text-slate-600 dark:text-slate-400" />
                        <h3 className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            Advanced Filters
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="group cursor-pointer rounded-lg p-1.5 text-slate-400 transition transition-all duration-300 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                        aria-label="Close dialog"
                    >
                        <X className="size-4.5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-6 overflow-y-auto p-4 pr-5 sm:p-6">
                    {/* Account Status Filter */}
                    <div>
                        <label className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-300">
                            Account Status
                        </label>
                        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {(
                                [
                                    { value: 'all', label: 'All' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ] as const
                            ).map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleStatusChange(value)}
                                    className={`rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
                                        filters.status === value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Terms Acceptance Filter */}
                    <div>
                        <label className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-300">
                            Terms Acceptance
                        </label>
                        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {(
                                [
                                    { value: 'all', label: 'All' },
                                    { value: 'accepted', label: 'Accepted' },
                                    { value: 'pending', label: 'Pending' },
                                ] as const
                            ).map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() =>
                                        handleTermsAcceptanceChange(value)
                                    }
                                    className={`rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
                                        filters.termsAcceptance === value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                        <label className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-300">
                            User Role
                        </label>
                        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {(
                                [
                                    { value: 'all', label: 'All Roles' },
                                    { value: 'admin', label: 'Administrator' },
                                    { value: 'student', label: 'Student' },
                                ] as const
                            ).map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleRoleChange(value)}
                                    className={`rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
                                        filters.role === value
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400'
                                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-700'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Registration Date Range Filter */}
                    <div>
                        <label className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-300">
                            <div className="mb-2.5 flex items-center gap-1.5">
                                <Calendar className="size-4" />
                                Registration Date Range
                            </div>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    From
                                </label>
                                <Input
                                    type="date"
                                    value={filters.registrationDateFrom || ''}
                                    onChange={(e) =>
                                        handleRegistrationDateFromChange(
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    To
                                </label>
                                <Input
                                    type="date"
                                    value={filters.registrationDateTo || ''}
                                    onChange={(e) =>
                                        handleRegistrationDateToChange(
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1.5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Last Login Date Range Filter */}
                    <div>
                        <label className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-300">
                            <div className="mb-2.5 flex items-center gap-1.5">
                                <Clock className="size-4" />
                                Last Login Date Range
                            </div>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    From
                                </label>
                                <Input
                                    type="date"
                                    value={filters.lastLoginFrom || ''}
                                    onChange={(e) =>
                                        handleLastLoginFromChange(
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    To
                                </label>
                                <Input
                                    type="date"
                                    value={filters.lastLoginTo || ''}
                                    onChange={(e) =>
                                        handleLastLoginToChange(e.target.value)
                                    }
                                    className="mt-1.5"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Attempts Count Range Filter */}
                    <div>
                        <label className="text-xs font-bold tracking-wide text-slate-700 uppercase dark:text-slate-300">
                            <div className="mb-2.5 flex items-center gap-1.5">
                                <Gauge className="size-4" />
                                Mock Attempts Range
                            </div>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    Minimum
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={filters.attemptsMin || ''}
                                    onChange={(e) =>
                                        handleAttemptsMinChange(e.target.value)
                                    }
                                    placeholder="0"
                                    className="mt-1.5"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                    Maximum
                                </label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={filters.attemptsMax || ''}
                                    onChange={(e) =>
                                        handleAttemptsMaxChange(e.target.value)
                                    }
                                    placeholder="No limit"
                                    className="mt-1.5"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex shrink-0 justify-between gap-3 border-t border-slate-100 bg-slate-50/50 p-4 sm:p-6 dark:border-slate-900 dark:bg-slate-900/10">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={!hasActiveFilters}
                        className="dark:text-slate-350 h-9 cursor-pointer px-4.5 text-xs font-bold focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                    >
                        Reset Filters
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="dark:text-slate-350 h-9 cursor-pointer px-4.5 text-xs font-bold focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleApply}
                            className="h-9 cursor-pointer px-4.5 text-xs font-bold focus:outline-none"
                        >
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
