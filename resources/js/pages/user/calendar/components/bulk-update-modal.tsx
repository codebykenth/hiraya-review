import { Clock } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { mainCategories } from '../hooks/use-calendar-state';
import { TimePicker } from './time-picker';

interface BulkUpdateModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    bulkFormData: {
        category_id: string;
        study_time: string;
        start_date: string;
        end_date: string;
    };
    setBulkFormData: React.Dispatch<
        React.SetStateAction<{
            category_id: string;
            study_time: string;
            start_date: string;
            end_date: string;
        }>
    >;
    handleBulkUpdateTime: () => Promise<void>;
    isLoading: boolean;
}

export function BulkUpdateModal({
    isOpen,
    onOpenChange,
    bulkFormData,
    setBulkFormData,
    handleBulkUpdateTime,
    isLoading,
}: BulkUpdateModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Bulk Update Study Time
                    </DialogTitle>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        Batch update the scheduled study times of multiple
                        sessions at once.
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">
                            Subject / Category (optional)
                        </label>
                        <select
                            value={bulkFormData.category_id}
                            onChange={(e) =>
                                setBulkFormData({
                                    ...bulkFormData,
                                    category_id: e.target.value,
                                })
                            }
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                            <option value="">All Categories / Subjects</option>
                            {mainCategories.map((cat) => (
                                <option key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">
                                Start Date (optional)
                            </label>
                            <input
                                type="date"
                                value={bulkFormData.start_date}
                                onChange={(e) =>
                                    setBulkFormData({
                                        ...bulkFormData,
                                        start_date: e.target.value,
                                    })
                                }
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">
                                End Date (optional)
                            </label>
                            <input
                                type="date"
                                value={bulkFormData.end_date}
                                onChange={(e) =>
                                    setBulkFormData({
                                        ...bulkFormData,
                                        end_date: e.target.value,
                                    })
                                }
                                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-200">
                            New Study Time
                        </label>
                        <TimePicker
                            value={bulkFormData.study_time}
                            onChange={(val) =>
                                setBulkFormData({
                                    ...bulkFormData,
                                    study_time: val,
                                })
                            }
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={handleBulkUpdateTime}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Update Time'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
