import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Plus,
    Calendar as CalendarGridIcon,
    CalendarRange,
    List,
    Sparkles,
    Clock,
    Trash2,
    Filter,
    MoreVertical,
    RotateCw,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mainCategories } from '../hooks/use-calendar-state';
import { MonthYearPickerPopover } from './month-year-picker-popover';

interface CalendarToolbarProps {
    activeView: 'month' | 'week' | 'agenda';
    setActiveView: (view: 'month' | 'week' | 'agenda') => void;
    selectedCategory: 'all' | number;
    setSelectedCategory: (cat: 'all' | number) => void;
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    previousMonth: () => void;
    nextMonth: () => void;
    previousWeek: () => void;
    nextWeek: () => void;
    jumpToTodayWeek: () => void;
    weekRangeLabel: string;
    onOpenAddModal: () => void;
    onOpenTemplatesModal: () => void;
    onOpenBulkTimeModal: () => void;
    onOpenShiftModal: () => void;
    onResetAll: () => void;
    onSelectMonthYear?: (year: number, monthIndex: number) => void;
}

export function CalendarToolbar({
    activeView,
    setActiveView,
    selectedCategory,
    setSelectedCategory,
    currentDate,
    setCurrentDate,
    previousMonth,
    nextMonth,
    previousWeek,
    nextWeek,
    jumpToTodayWeek,
    weekRangeLabel,
    onOpenAddModal,
    onOpenTemplatesModal,
    onOpenBulkTimeModal,
    onOpenShiftModal,
    onResetAll,
    onSelectMonthYear,
}: CalendarToolbarProps) {
    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();

    const isCurrentMonth =
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();

    const handlePrevious = () => {
        if (activeView === 'week') {
            previousWeek();
        } else {
            previousMonth();
        }
    };

    const handleNext = () => {
        if (activeView === 'week') {
            nextWeek();
        } else {
            nextMonth();
        }
    };

    const handleToday = () => {
        if (activeView === 'week') {
            jumpToTodayWeek();
        } else {
            setCurrentDate(new Date());
        }
    };

    const handleSelectMonthYear = (year: number, monthIndex: number) => {
        const nextDate = new Date(year, monthIndex, 1);
        setCurrentDate(nextDate);

        if (onSelectMonthYear) {
            onSelectMonthYear(year, monthIndex);
        }
    };

    const selectedCategoryLabel =
        selectedCategory === 'all'
            ? 'All Subjects'
            : mainCategories.find((c) => c.id === selectedCategory)?.name ||
              'All Subjects';

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs backdrop-blur-xl sm:p-4 dark:border-slate-800/80 dark:bg-slate-900/80">
            <div className="flex flex-col items-stretch justify-between gap-4 xl:flex-row xl:items-center">
                {/* Left: View Switcher & Category Filter */}
                <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start">
                    {/* View Switcher Tabs */}
                    <div className="flex items-center rounded-xl border border-slate-200/60 bg-slate-100 p-1 dark:border-slate-700/60 dark:bg-slate-800/70">
                        <button
                            type="button"
                            onClick={() => setActiveView('month')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeView === 'month'
                                    ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-blue-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <CalendarGridIcon className="size-3.5" />
                            <span>Month</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveView('week')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeView === 'week'
                                    ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-blue-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <CalendarRange className="size-3.5" />
                            <span>Week</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveView('agenda')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                activeView === 'agenda'
                                    ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-900 dark:text-blue-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <List className="size-3.5" />
                            <span>Agenda</span>
                        </button>
                    </div>

                    {/* Category Filter Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1.5 border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            >
                                <Filter className="size-3.5 text-slate-400" />
                                <span className="max-w-30 truncate sm:max-w-none">
                                    {selectedCategoryLabel}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                            <DropdownMenuItem
                                onClick={() => setSelectedCategory('all')}
                                className={`cursor-pointer text-xs font-semibold ${
                                    selectedCategory === 'all'
                                        ? 'bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                        : ''
                                }`}
                            >
                                All Subjects
                            </DropdownMenuItem>
                            {mainCategories.map((cat) => (
                                <DropdownMenuItem
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`cursor-pointer text-xs font-semibold ${
                                        selectedCategory === cat.id
                                            ? 'bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                            : ''
                                    }`}
                                >
                                    {cat.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Center: Date Navigation */}
                <div className="flex w-full items-center justify-center gap-2 self-center sm:w-auto sm:self-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevious}
                        className="size-8 rounded-lg border-slate-200 dark:border-slate-800"
                        title={
                            activeView === 'week'
                                ? 'Previous Week'
                                : 'Previous Month'
                        }
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <div className="flex items-center gap-1.5 px-1 sm:gap-2">
                        <MonthYearPickerPopover
                            currentDate={currentDate}
                            onSelect={handleSelectMonthYear}
                        >
                            <button
                                type="button"
                                className="group flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm font-black text-slate-900 transition-all hover:bg-slate-100 sm:min-w-40 sm:justify-center sm:text-base dark:text-white dark:hover:bg-slate-800"
                                title="Click to choose Month and Year"
                                aria-label="Filter calendar by month and year"
                            >
                                <span className="text-center">
                                    {activeView === 'week'
                                        ? weekRangeLabel
                                        : `${currentMonthName} ${currentYear}`}
                                </span>
                                <ChevronDown className="size-3.5 text-slate-400 transition-transform duration-200 group-hover:text-slate-600 group-data-[state=open]:rotate-180 dark:text-slate-500 dark:group-hover:text-slate-300" />
                            </button>
                        </MonthYearPickerPopover>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToday}
                            disabled={isCurrentMonth && activeView !== 'week'}
                            className="h-7 px-2 text-[11px] font-bold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                        >
                            Today
                        </Button>
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNext}
                        className="size-8 rounded-lg border-slate-200 dark:border-slate-800"
                        title={
                            activeView === 'week' ? 'Next Week' : 'Next Month'
                        }
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                {/* Right: Primary Actions & Clean Dropdown */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                    {/* Ready-Made Study Templates Button */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onOpenTemplatesModal}
                        className="h-9 gap-1.5 border-indigo-200 bg-indigo-50/70 text-xs font-bold text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                    >
                        <Sparkles className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="hidden sm:inline">
                            Study Templates
                        </span>
                        <span className="sm:hidden">Templates</span>
                    </Button>

                    {/* Primary Add Session Button */}
                    <Button
                        size="sm"
                        onClick={onOpenAddModal}
                        className="h-9 gap-1.5 bg-blue-600 text-xs font-bold text-white shadow-2xs transition-all hover:bg-blue-700 active:scale-95"
                    >
                        <Plus className="size-3.5" />
                        <span>Add Task</span>
                    </Button>

                    {/* Actions Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="size-9 rounded-lg border-slate-200 dark:border-slate-800"
                                title="More calendar options"
                            >
                                <MoreVertical className="size-4 text-slate-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuItem
                                onClick={onOpenTemplatesModal}
                                className="cursor-pointer gap-2 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                            >
                                <Sparkles className="size-3.5" />
                                <span>Choose Study Template</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onOpenShiftModal}
                                className="cursor-pointer gap-2 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400"
                            >
                                <RotateCw className="size-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Shift / Auto Catch-Up</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onOpenBulkTimeModal}
                                className="cursor-pointer gap-2 py-2 text-xs font-semibold"
                            >
                                <Clock className="size-3.5 text-slate-500" />
                                <span>Bulk Update Time</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onResetAll}
                                className="cursor-pointer gap-2 py-2 text-xs font-semibold text-rose-600 focus:text-rose-600 dark:text-rose-400"
                            >
                                <Trash2 className="size-3.5" />
                                <span>Reset Entire Calendar</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
