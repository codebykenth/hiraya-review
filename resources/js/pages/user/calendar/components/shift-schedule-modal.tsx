import {
    CalendarDays,
    FastForward,
    RotateCw,
    Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ShiftScheduleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onShiftApplied: () => Promise<void>;
}

export function ShiftScheduleModal({
    isOpen,
    onOpenChange,
    onShiftApplied,
}: ShiftScheduleModalProps) {
    const [mode, setMode] = useState<'start_today' | 'shift_by_days'>('start_today');
    const [days, setDays] = useState<number>(3);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleShift = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch('/study-schedules/shift', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    mode,
                    days: mode === 'shift_by_days' ? days : undefined,
                }),
            });

            if (response.ok) {
                await onShiftApplied();
                onOpenChange(false);
            } else {
                const data = await response.json();
                setErrorMessage(data.message || 'Failed to shift schedule.');
            }
        } catch {
            setErrorMessage('An error occurred while shifting your schedule.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <CalendarDays className="size-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                            Schedule Catch-Up & Rebalance
                        </span>
                    </div>
                    <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                        Shift Study Schedule
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Easily rebalance missed days or push incomplete study sessions forward while preserving your curriculum order.
                    </DialogDescription>
                </DialogHeader>

                {errorMessage && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                        {errorMessage}
                    </div>
                )}

                <div className="space-y-3 py-2">
                    {/* Option 1: Start Today */}
                    <button
                        type="button"
                        onClick={() => setMode('start_today')}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                            mode === 'start_today'
                                ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40 dark:ring-blue-500/30'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-2xs">
                                <RotateCw className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                        Auto Catch-Up (Restart from Today)
                                    </h4>
                                    <span className="inline-flex items-center rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-extrabold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                        Recommended
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                    Shifts your earliest overdue task to today and automatically adjusts all subsequent sessions forward sequentially.
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Option 2: Shift by N Days */}
                    <button
                        type="button"
                        onClick={() => setMode('shift_by_days')}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                            mode === 'shift_by_days'
                                ? 'border-blue-600 bg-blue-50/70 shadow-2xs ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40 dark:ring-blue-500/30'
                                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                                <FastForward className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                    Push Forward by Fixed Days
                                </h4>
                                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                                    Postpone all upcoming incomplete tasks by a specific number of days.
                                </p>

                                {mode === 'shift_by_days' && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                            Push forward by:
                                        </label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={60}
                                            value={days}
                                            onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="h-8 w-20 text-xs text-center"
                                        />
                                        <span className="text-xs font-semibold text-slate-500">
                                            days
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="h-9 text-xs font-bold"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleShift}
                        disabled={isLoading}
                        className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs"
                    >
                        <Sparkles className="size-3.5" />
                        <span>{isLoading ? 'Shifting...' : 'Apply Shift'}</span>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
