import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

interface ModuleLink {
    url: string;
    title: string;
}

interface Suggestion {
    study_date: string;
    study_time: string;
    title: string;
    description: string;
    area_name: string;
    score: number;
    module_links?: ModuleLink[];
    module_url?: string;
    module_title?: string;
}

interface WeakArea {
    name: string;
    score: number;
    sessions: number;
}

interface StudySuggestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    suggestions: Suggestion[];
    weakAreas: WeakArea[];
    daysUntilExam: number;
    examDateStr?: string;
    onApply: (suggestions: Suggestion[]) => Promise<void>;
    isLoading?: boolean;
    selectedTrack?: string;
    selectedTimeOfDay?: string;
    selectedTopicsPerDay?: number;
    onFilterChange?: (
        track: string,
        timeOfDay: string,
        topicsPerDay: number,
    ) => void;
}

export function StudySuggestionsModal({
    isOpen,
    onClose,
    suggestions,
    weakAreas,
    daysUntilExam,
    examDateStr = 'TBA',
    onApply,
    isLoading = false,
    selectedTrack = '',
    selectedTimeOfDay = 'Evening',
    selectedTopicsPerDay = 1,
    onFilterChange,
}: StudySuggestionsModalProps) {
    const [isApplying, setIsApplying] = useState(false);
    const [editableSuggestions, setEditableSuggestions] =
        useState<Suggestion[]>(suggestions);
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(
        null,
    );
    const [prevSuggestions, setPrevSuggestions] = useState(suggestions);
    const [setAllTime, setSetAllTime] = useState('');

    if (prevSuggestions !== suggestions) {
        setPrevSuggestions(suggestions);
        setEditableSuggestions(suggestions);
        setSetAllTime('');
    }

    const handleApply = async () => {
        setIsApplying(true);

        try {
            await onApply(editableSuggestions);
            onClose();
        } finally {
            setIsApplying(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Setting data is required in Firefox
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
            setDraggedItemIndex(null);

            return;
        }

        const newSuggestions = [...editableSuggestions];
        const draggedItem = newSuggestions[draggedItemIndex];

        newSuggestions.splice(draggedItemIndex, 1);
        newSuggestions.splice(dropIndex, 0, draggedItem);

        // Recalculate original dates to preserve chronological order
        const originalDates = editableSuggestions.map((s) => ({
            date: s.study_date,
            time: s.study_time,
        }));

        newSuggestions.forEach((s, idx) => {
            s.study_date = originalDates[idx].date;
            s.study_time = originalDates[idx].time;
        });

        setEditableSuggestions(newSuggestions);
        setDraggedItemIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const removeSuggestion = (index: number) => {
        const newSuggestions = [...editableSuggestions];
        newSuggestions.splice(index, 1);
        setEditableSuggestions(newSuggestions);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden p-0 flex flex-col">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle>Study Plan Suggestions</DialogTitle>
                        {onFilterChange && (
                            <div className="flex gap-2">
                                <select
                                    value={selectedTrack}
                                    onChange={(e) =>
                                        onFilterChange(
                                            e.target.value,
                                            selectedTimeOfDay,
                                            selectedTopicsPerDay,
                                        )
                                    }
                                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">Select Exam Type</option>
                                    <option value="All">All Exams</option>
                                    <option value="Professional">
                                        Professional
                                    </option>
                                    <option value="SubProfessional">
                                        SubProfessional
                                    </option>
                                    <option value="Drill">Custom Drills</option>
                                </select>
                                <select
                                    value={selectedTimeOfDay}
                                    onChange={(e) =>
                                        onFilterChange(
                                            selectedTrack || 'All',
                                            e.target.value,
                                            selectedTopicsPerDay,
                                        )
                                    }
                                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="Morning">Morning</option>
                                    <option value="Afternoon">Afternoon</option>
                                    <option value="Evening">Evening</option>
                                </select>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-2 pr-5 space-y-4">
                    {!selectedTrack ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="mb-4 rounded-full bg-blue-50 p-4">
                                <span className="text-3xl">🔍</span>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">
                                Select Exam Type
                            </h3>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                Please select an exam type from the dropdown
                                above to analyze your performance and generate a
                                personalized study plan.
                            </p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex items-center justify-center py-12 text-slate-500">
                            Analyzing performance...
                        </div>
                    ) : (
                        <>
                            {/* Exam Info */}
                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                <p className="text-sm font-semibold text-blue-900">
                                    Civil Service Exam: {examDateStr}
                                </p>
                                <p className="mt-1 text-sm text-blue-700">
                                    {daysUntilExam} days remaining to prepare
                                </p>
                            </div>

                            {/* Weak Areas */}
                            {weakAreas.length > 0 && (
                                <div>
                                    <h3 className="mb-3 font-semibold text-slate-900">
                                        📊 Topic Performance
                                    </h3>
                                    <div className="space-y-2">
                                        {weakAreas.map((area, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {area.name}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        Current Score:{' '}
                                                        {area.score}% •{' '}
                                                        {area.sessions} study
                                                        {area.sessions !== 1
                                                            ? ' sessions'
                                                            : ' session'}{' '}
                                                        planned
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className={`text-lg font-bold ${area.score < 75 ? 'text-red-600' : 'text-green-600'}`}
                                                    >
                                                        {area.score}%
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {area.score < 75
                                                            ? 'Below target'
                                                            : 'On track'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Study Plan Preview */}
                            {suggestions.length > 0 && (
                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="font-semibold text-slate-900">
                                            📅 Suggested Study Schedule (
                                            {suggestions.length} sessions)
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-medium text-slate-600">
                                                Set all to:
                                            </label>
                                            <input
                                                type="time"
                                                value={setAllTime}
                                                min={selectedTimeOfDay === 'Evening' ? '12:00' : undefined}
                                                onChange={(e) => {
                                                    let newTime = e.target.value;
                                                    if (newTime && selectedTimeOfDay === 'Evening') {
                                                        const [hours, minutes] = newTime.split(':');
                                                        let hr = parseInt(hours, 10);
                                                        if (hr < 12) {
                                                            hr = hr === 0 ? 12 : hr + 12;
                                                            newTime = `${String(hr).padStart(2, '0')}:${minutes}`;
                                                        }
                                                    }
                                                    setSetAllTime(newTime);

                                                    if (newTime) {
                                                        setEditableSuggestions(
                                                            (prev) =>
                                                                prev.map(
                                                                    (s) => ({
                                                                        ...s,
                                                                        study_time:
                                                                            newTime,
                                                                    }),
                                                                ),
                                                        );
                                                    }
                                                }}
                                                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                                        <div className="max-h-64 overflow-y-auto p-3 pr-2.5 space-y-2">
                                        {editableSuggestions.map(
                                            (suggestion, idx) => (
                                                <div
                                                    key={idx}
                                                    draggable
                                                    onDragStart={(e) =>
                                                        handleDragStart(e, idx)
                                                    }
                                                    onDragOver={(e) =>
                                                        handleDragOver(e)
                                                    }
                                                    onDrop={(e) =>
                                                        handleDrop(e, idx)
                                                    }
                                                    onDragEnd={handleDragEnd}
                                                    className={`cursor-move rounded-lg border-l-4 border-blue-400 bg-white p-3 transition-colors ${
                                                        draggedItemIndex === idx
                                                            ? 'border-2 border-dashed opacity-50'
                                                            : ''
                                                    } hover:bg-slate-50`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-slate-900">
                                                                {
                                                                    suggestion.title
                                                                }
                                                            </p>
                                                            <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                                                                {new Date(
                                                                    suggestion.study_date +
                                                                        'T00:00:00',
                                                                ).toLocaleDateString(
                                                                    'en-US',
                                                                    {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        weekday:
                                                                            'short',
                                                                    },
                                                                )}{' '}
                                                                at
                                                                <input
                                                                    type="time"
                                                                    value={
                                                                        suggestion.study_time
                                                                    }
                                                                    min={selectedTimeOfDay === 'Evening' ? '12:00' : undefined}
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        let newTime = e.target.value;
                                                                        if (newTime && selectedTimeOfDay === 'Evening') {
                                                                            const [hours, minutes] = newTime.split(':');
                                                                            let hr = parseInt(hours, 10);
                                                                            if (hr < 12) {
                                                                                hr = hr === 0 ? 12 : hr + 12;
                                                                                newTime = `${String(hr).padStart(2, '0')}:${minutes}`;
                                                                            }
                                                                        }
                                                                        const newSuggestions =
                                                                            [
                                                                                ...editableSuggestions,
                                                                            ];
                                                                        newSuggestions[
                                                                            idx
                                                                        ].study_time =
                                                                            newTime;
                                                                        setEditableSuggestions(
                                                                            newSuggestions,
                                                                        );
                                                                    }}
                                                                    className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            </p>
                                                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                                {
                                                                    suggestion.description
                                                                }
                                                            </p>
                                                            {suggestion.module_links &&
                                                            suggestion
                                                                .module_links
                                                                .length > 0 ? (
                                                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                                                    {suggestion.module_links.map(
                                                                        (
                                                                            link,
                                                                            lidx,
                                                                        ) => (
                                                                            <a
                                                                                key={
                                                                                    lidx
                                                                                }
                                                                                href={
                                                                                    link.url
                                                                                }
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                                                                            >
                                                                                📖
                                                                                Learn:{' '}
                                                                                {
                                                                                    link.title
                                                                                }
                                                                            </a>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                suggestion.module_url && (
                                                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                                                                        <a
                                                                            href={
                                                                                suggestion.module_url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                                                                        >
                                                                            📖
                                                                            Learn:{' '}
                                                                            {
                                                                                suggestion.module_title
                                                                            }
                                                                        </a>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                        <div className="ml-2 flex flex-col items-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeSuggestion(
                                                                        idx,
                                                                    )
                                                                }
                                                                className="text-slate-400 transition-colors hover:text-red-500"
                                                                title="Remove suggestion"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${suggestion.score < 75 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
                                                            >
                                                                {
                                                                    suggestion.score
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editableSuggestions.length === 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm text-amber-700">
                                        ℹ️ No exam data found for this
                                        selection. Please complete some practice
                                        exams to get personalized study
                                        suggestions.
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter className="p-6 pt-4 border-t border-slate-100 shrink-0">
                    <Button variant="outline" onClick={onClose}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApply}
                        disabled={
                            isApplying ||
                            isLoading ||
                            editableSuggestions.length === 0
                        }
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Check className="mr-2 h-4 w-4" />
                        {isApplying ? 'Applying...' : 'Apply to Calendar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
