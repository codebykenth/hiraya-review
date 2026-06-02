import { Search, ChevronDown, Calendar } from 'lucide-react';
import React from 'react';
import { Input } from '@/components/ui/input';

interface FiltersCardProps {
    searchVal: string;
    setSearchVal: (val: string) => void;
    selectedTrack: string;
    selectedDate: string;
    handleTrackChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleDateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
}

export function FiltersCard({
    searchVal,
    setSearchVal,
    selectedTrack,
    selectedDate,
    handleTrackChange,
    handleDateChange,
    handleSearchSubmit,
}: FiltersCardProps) {
    return (
        <div className="shadow-3xs rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search bar form */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="relative max-w-2xl flex-1"
                >
                    <Input
                        type="text"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        placeholder="Search exams by name or ID..."
                        className="pl-9"
                    />
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </form>

                {/* Select Filters Row */}
                <div className="flex w-full items-center gap-3 sm:w-auto">
                    {/* Track Select */}
                    <div className="relative flex-1 shrink-0 sm:flex-initial">
                        <select
                            value={selectedTrack}
                            onChange={handleTrackChange}
                            className="w-full appearance-none rounded-lg border border-border bg-white py-2 pr-10 pl-4 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none sm:w-auto dark:bg-slate-900"
                        >
                            <option value="All Tracks">All Tracks</option>
                            <option value="Professional">Professional</option>
                            <option value="Subprofessional">
                                Subprofessional
                            </option>
                            <option value="Drill">Drill</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    {/* Date Select */}
                    <div className="relative flex-1 shrink-0 sm:flex-initial">
                        <select
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full appearance-none rounded-lg border border-border bg-white py-2 pr-10 pl-9 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none sm:w-auto dark:bg-slate-900"
                        >
                            <option value="30">Last 30 Days</option>
                            <option value="7">Last 7 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <Calendar className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </div>
    );
}
