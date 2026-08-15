import { Search, ChevronDown, Calendar, SlidersHorizontal } from 'lucide-react';
import React from 'react';
import { Input } from '@/components/ui/input';

interface FiltersCardProps {
    searchVal: string;
    setSearchVal: (val: string) => void;
    selectedTrack: string;
    selectedDate: string;
    perPage: number;
    handleTrackChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleDateChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handlePerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    handleSearchSubmit: (e: React.FormEvent) => void;
}

export function FiltersCard({
    searchVal,
    setSearchVal,
    selectedTrack,
    selectedDate,
    perPage,
    handleTrackChange,
    handleDateChange,
    handlePerPageChange,
    handleSearchSubmit,
}: FiltersCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                {/* Search bar form */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="relative flex-1"
                >
                    <Input
                        type="text"
                        value={searchVal}
                        onChange={(e) => setSearchVal(e.target.value)}
                        placeholder="Search exam category, track, or attempt ID..."
                        className="pl-9 text-xs"
                    />
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                </form>

                {/* Select Filters Row */}
                <div className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
                    {/* Track Select */}
                    <div className="relative flex-1 sm:w-40 sm:flex-initial">
                        <select
                            value={selectedTrack}
                            onChange={handleTrackChange}
                            aria-label="Filter by track"
                            className="w-full appearance-none rounded-lg border border-border bg-background py-2 pr-8 pl-3 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                        >
                            <option value="All Tracks">All Tracks</option>
                            <option value="Professional">Professional</option>
                            <option value="Subprofessional">Subprofessional</option>
                            <option value="Drill">Drill</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    {/* Date Select */}
                    <div className="relative flex-1 sm:w-40 sm:flex-initial">
                        <select
                            value={selectedDate}
                            onChange={handleDateChange}
                            aria-label="Filter by date"
                            className="w-full appearance-none rounded-lg border border-border bg-background py-2 pr-8 pl-8 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                        >
                            <option value="all">All Time</option>
                            <option value="30">Last 30 Days</option>
                            <option value="7">Last 7 Days</option>
                        </select>
                        <Calendar className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>

                    {/* Per Page Select */}
                    <div className="relative flex-1 sm:w-28 sm:flex-initial">
                        <select
                            value={perPage}
                            onChange={handlePerPageChange}
                            aria-label="Items per page"
                            className="w-full appearance-none rounded-lg border border-border bg-background py-2 pr-8 pl-8 text-xs font-bold text-foreground transition focus:border-blue-500 focus:outline-none"
                        >
                            <option value="10">10 / page</option>
                            <option value="15">15 / page</option>
                            <option value="25">25 / page</option>
                        </select>
                        <SlidersHorizontal className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    </div>
                </div>
            </div>
        </div>
    );
}
