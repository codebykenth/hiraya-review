import {
    CheckCircle2,
    CalendarDays,
    Trash2,
    X,
    CheckSquare,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';

interface CalendarBulkActionsBarProps {
    selectedCount: number;
    isLoading?: boolean;
    onMarkDone: () => void;
    onRescheduleToday: () => void;
    onDelete: () => void;
    onClearSelection: () => void;
}

export function CalendarBulkActionsBar({
    selectedCount,
    isLoading = false,
    onMarkDone,
    onRescheduleToday,
    onDelete,
    onClearSelection,
}: CalendarBulkActionsBarProps) {
    if (selectedCount === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="pointer-events-auto flex flex-wrap items-center gap-2 sm:gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/95 max-w-full sm:max-w-2xl">
                {/* Count Badge */}
                <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
                    <div className="flex size-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-400">
                        <CheckSquare className="size-3.5" />
                    </div>
                    <span className="text-xs font-bold whitespace-nowrap">
                        {selectedCount} selected
                    </span>
                </div>

                {/* Bulk Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={onMarkDone}
                        className="h-8 gap-1.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-300 text-xs font-bold"
                    >
                        <CheckCircle2 className="size-3.5" />
                        <span className="hidden sm:inline">Mark Done</span>
                        <span className="sm:hidden">Done</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={onRescheduleToday}
                        className="h-8 gap-1.5 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 hover:text-blue-300 text-xs font-bold"
                    >
                        <CalendarDays className="size-3.5" />
                        <span className="hidden sm:inline">To Today</span>
                        <span className="sm:hidden">Today</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        disabled={isLoading}
                        onClick={onDelete}
                        className="h-8 gap-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:text-rose-200 text-xs font-bold"
                    >
                        <Trash2 className="size-3.5" />
                        <span>Delete</span>
                    </Button>
                </div>

                {/* Clear Selection */}
                <button
                    type="button"
                    onClick={onClearSelection}
                    className="ml-auto flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    aria-label="Clear selection"
                    title="Cancel selection"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
