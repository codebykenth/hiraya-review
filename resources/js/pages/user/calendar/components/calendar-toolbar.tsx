import {
    ChevronLeft,
    ChevronRight,
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

    const selectedCategoryLabel =
        selectedCategory === 'all'
            ? 'All Subjects'
            : mainCategories.find((c) => c.id === selectedCategory)?.name ||
              'All Subjects';

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-2xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 sm:p-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Left: View Switcher & Category Filter */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher Tabs */}
                    <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60">
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
                                className="h-9 gap-1.5 border-slate-200 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                            >
                                <Filter className="size-3.5 text-slate-400" />
                                <span className="max-w-[120px] sm:max-w-none truncate">
                                    {selectedCategoryLabel}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                            <DropdownMenuItem
                                onClick={() => setSelectedCategory('all')}
                                className={`text-xs font-semibold cursor-pointer ${
                                    selectedCategory === 'all'
                                        ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50 dark:text-blue-300'
                                        : ''
                                }`}
                            >
                                All Subjects
                            </DropdownMenuItem>
                            {mainCategories.map((cat) => (
                                <DropdownMenuItem
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`text-xs font-semibold cursor-pointer ${
                                        selectedCategory === cat.id
                                            ? 'bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/50 dark:text-blue-300'
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
                <div className="flex items-center justify-between sm:justify-center gap-2 self-center sm:self-auto w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevious}
                        className="size-8 rounded-lg border-slate-200 dark:border-slate-800"
                        title={activeView === 'week' ? 'Previous Week' : 'Previous Month'}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <div className="flex items-center gap-2 px-1">
                        <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white min-w-[140px] sm:min-w-[170px] text-center">
                            {activeView === 'week'
                                ? weekRangeLabel
                                : `${currentMonthName} ${currentYear}`}
                        </span>

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
                        title={activeView === 'week' ? 'Next Week' : 'Next Month'}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                {/* Right: Primary Actions & Clean Dropdown */}
                <div className="flex items-center gap-2 justify-end">
                    {/* Ready-Made Study Templates Button */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onOpenTemplatesModal}
                        className="h-9 gap-1.5 border-indigo-200 bg-indigo-50/70 font-bold text-xs text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                    >
                        <Sparkles className="size-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="hidden sm:inline">Study Templates</span>
                        <span className="sm:hidden">Templates</span>
                    </Button>

                    {/* Primary Add Session Button */}
                    <Button
                        size="sm"
                        onClick={onOpenAddModal}
                        className="h-9 gap-1.5 bg-blue-600 font-bold text-xs text-white shadow-2xs transition-all hover:bg-blue-700 active:scale-95"
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
                                className="text-xs font-semibold cursor-pointer gap-2 py-2 text-indigo-700 dark:text-indigo-300"
                            >
                                <Sparkles className="size-3.5" />
                                <span>Choose Study Template</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onOpenShiftModal}
                                className="text-xs font-semibold cursor-pointer gap-2 py-2 text-blue-600 dark:text-blue-400"
                            >
                                <RotateCw className="size-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Shift / Auto Catch-Up</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onOpenBulkTimeModal}
                                className="text-xs font-semibold cursor-pointer gap-2 py-2"
                            >
                                <Clock className="size-3.5 text-slate-500" />
                                <span>Bulk Update Time</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={onResetAll}
                                className="text-xs font-semibold cursor-pointer gap-2 py-2 text-rose-600 focus:text-rose-600 dark:text-rose-400"
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
