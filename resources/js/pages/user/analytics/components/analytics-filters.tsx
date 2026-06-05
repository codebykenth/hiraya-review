import { ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

interface AnalyticsFiltersProps {
    currentTrack: string;
    currentRuns: string;
    updateFilter: (key: 'track' | 'runs', value: string) => void;
}

export function AnalyticsFilters({
    currentTrack,
    currentRuns,
    updateFilter,
}: AnalyticsFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isRunsOpen, setIsRunsOpen] = useState(false);

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Track Filter Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {currentTrack === 'All' ? 'All Tracks' : currentTrack}
                    <ChevronDown className="size-3.5" />
                </button>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-slate-800 dark:bg-slate-900">
                            {[
                                'All',
                                'Professional',
                                'Subprofessional',
                                'Drill',
                            ].map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => {
                                        updateFilter('track', opt);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition ${
                                        currentTrack === opt
                                            ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/30 dark:bg-blue-950/50 dark:text-blue-400'
                                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {opt === 'All' ? 'All Tracks' : opt}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Runs Filter Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsRunsOpen(!isRunsOpen)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    {currentRuns === 'all'
                        ? 'All Runs'
                        : `Last ${currentRuns} Runs`}
                    <ChevronDown className="size-3.5" />
                </button>
                {isRunsOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsRunsOpen(false)}
                        />
                        <div className="absolute right-0 z-20 mt-2 w-36 origin-top-right rounded-lg border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-slate-800 dark:bg-slate-900">
                            {[
                                { value: '6', label: 'Last 6 Runs' },
                                { value: '12', label: 'Last 12 Runs' },
                                { value: 'all', label: 'All Runs' },
                            ].map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        updateFilter('runs', opt.value);
                                        setIsRunsOpen(false);
                                    }}
                                    className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs transition ${
                                        currentRuns === opt.value
                                            ? 'bg-blue-50 font-bold text-blue-600 dark:bg-blue-950/30 dark:bg-blue-950/50 dark:text-blue-400'
                                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
