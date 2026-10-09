import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface MonthYearPickerPopoverProps {
    currentDate: Date;
    onSelect: (year: number, monthIndex: number) => void;
    children: React.ReactNode;
    align?: 'center' | 'start' | 'end';
}

const MONTHS = [
    { short: 'Jan', full: 'January' },
    { short: 'Feb', full: 'February' },
    { short: 'Mar', full: 'March' },
    { short: 'Apr', full: 'April' },
    { short: 'May', full: 'May' },
    { short: 'Jun', full: 'June' },
    { short: 'Jul', full: 'July' },
    { short: 'Aug', full: 'August' },
    { short: 'Sep', full: 'September' },
    { short: 'Oct', full: 'October' },
    { short: 'Nov', full: 'November' },
    { short: 'Dec', full: 'December' },
];

export function MonthYearPickerPopover({
    currentDate,
    onSelect,
    children,
    align = 'center',
}: MonthYearPickerPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'months' | 'years'>('months');
    const [pickerYear, setPickerYear] = useState<number>(() => currentDate.getFullYear());

    const realToday = useMemo(() => new Date(), []);
    const isCurrentRealYear = realToday.getFullYear() === pickerYear;

    // Reset picker view whenever opened
    const handleOpenChange = (open: boolean) => {
        if (open) {
            setPickerYear(currentDate.getFullYear());
            setViewMode('months');
        }

        setIsOpen(open);
    };

    // Calculate 12-year window for year grid
    const startYear = Math.floor(pickerYear / 12) * 12;
    const yearList = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => startYear + i);
    }, [startYear]);

    const handlePrevYear = () => {
        if (viewMode === 'years') {
            setPickerYear((prev) => prev - 12);
        } else {
            setPickerYear((prev) => prev - 1);
        }
    };

    const handleNextYear = () => {
        if (viewMode === 'years') {
            setPickerYear((prev) => prev + 12);
        } else {
            setPickerYear((prev) => prev + 1);
        }
    };

    const handleSelectMonth = (monthIndex: number) => {
        onSelect(pickerYear, monthIndex);
        setIsOpen(false);
    };

    const handleSelectYear = (year: number) => {
        setPickerYear(year);
        setViewMode('months');
    };

    const handleJumpToCurrentMonth = () => {
        onSelect(realToday.getFullYear(), realToday.getMonth());
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent
                align={align}
                sideOffset={8}
                className="w-72 p-3 shadow-xl sm:w-80"
            >
                {/* Header: Navigation & Mode Switch */}
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevYear}
                        className="size-7 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label={viewMode === 'years' ? 'Previous 12 years' : 'Previous year'}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <button
                        type="button"
                        onClick={() =>
                            setViewMode((prev) => (prev === 'months' ? 'years' : 'months'))
                        }
                        className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <span>
                            {viewMode === 'years'
                                ? `${startYear} – ${startYear + 11}`
                                : pickerYear}
                        </span>
                        <span className="text-[10px] text-blue-600 opacity-80 group-hover:underline dark:text-blue-400">
                            {viewMode === 'years' ? 'Months' : 'Change Year'}
                        </span>
                    </button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleNextYear}
                        className="size-7 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        aria-label={viewMode === 'years' ? 'Next 12 years' : 'Next year'}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                {/* View 1: Months Grid */}
                {viewMode === 'months' && (
                    <div className="grid grid-cols-3 gap-1.5">
                        {MONTHS.map((m, idx) => {
                            const isSelected =
                                pickerYear === currentDate.getFullYear() &&
                                idx === currentDate.getMonth();
                            const isThisMonth =
                                isCurrentRealYear && idx === realToday.getMonth();

                            return (
                                <button
                                    key={m.short}
                                    type="button"
                                    onClick={() => handleSelectMonth(idx)}
                                    className={cn(
                                        'relative flex flex-col items-center justify-center rounded-xl py-2 px-1 text-xs font-semibold transition-all active:scale-95',
                                        isSelected
                                            ? 'bg-blue-600 font-bold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600'
                                            : isThisMonth
                                              ? 'border border-blue-400/60 bg-blue-50/60 font-bold text-blue-700 hover:bg-blue-100/70 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-300'
                                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                                    )}
                                    title={m.full}
                                >
                                    <span>{m.short}</span>
                                    {isThisMonth && !isSelected && (
                                        <span className="text-[9px] font-normal text-blue-500 dark:text-blue-400">
                                            Current
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* View 2: Years Grid */}
                {viewMode === 'years' && (
                    <div className="grid grid-cols-3 gap-1.5">
                        {yearList.map((year) => {
                            const isSelected = year === currentDate.getFullYear();
                            const isThisYear = year === realToday.getFullYear();

                            return (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => handleSelectYear(year)}
                                    className={cn(
                                        'flex items-center justify-center rounded-xl py-2.5 text-xs font-semibold transition-all active:scale-95',
                                        isSelected
                                            ? 'bg-blue-600 font-bold text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600'
                                            : isThisYear
                                              ? 'border border-blue-400/60 bg-blue-50/60 font-bold text-blue-700 hover:bg-blue-100/70 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-300'
                                              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                                    )}
                                >
                                    {year}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Footer: Quick Actions */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {currentDate.toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>

                    <button
                        type="button"
                        onClick={handleJumpToCurrentMonth}
                        className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold text-blue-600 hover:bg-blue-50 hover:underline dark:text-blue-400 dark:hover:bg-blue-950/40"
                    >
                        <CalendarIcon className="size-3" />
                        <span>This Month</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
