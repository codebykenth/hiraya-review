import { ChevronDown, Lightbulb, Plus, Check } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { mainCategories, categoryNames } from '../hooks/use-calendar-state';
import type { Subcategory, LearnModule, AttachedModule } from '../types';
import { TimePicker } from './time-picker';

interface ScheduleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isEditMode: boolean;
    selectedDate: string | null;
    formData: {
        title: string;
        description: string;
        study_time: string;
        subcategory_id: string;
        is_done: boolean;
    };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            title: string;
            description: string;
            study_time: string;
            subcategory_id: string;
            is_done: boolean;
        }>
    >;
    subcategories: Subcategory[];
    learnModules: LearnModule[];
    attachedModules: AttachedModule[];
    setAttachedModules: React.Dispatch<React.SetStateAction<AttachedModule[]>>;
    isSubjectDropdownOpen: boolean;
    setIsSubjectDropdownOpen: (open: boolean) => void;
    subjectSearch: string;
    setSubjectSearch: (val: string) => void;
    handleAddStudy: () => Promise<void>;
    isLoading: boolean;
    errorMessage?: string | null;
}

export function ScheduleModal({
    isOpen,
    onOpenChange,
    isEditMode,
    selectedDate,
    formData,
    setFormData,
    subcategories,
    learnModules,
    attachedModules,
    setAttachedModules,
    isSubjectDropdownOpen,
    setIsSubjectDropdownOpen,
    subjectSearch,
    setSubjectSearch,
    handleAddStudy,
    isLoading,
    errorMessage,
}: ScheduleModalProps) {
    const parseScheduleDate = (dateStr: string) => {
        if (!dateStr) {
            return new Date();
        }

        const baseDate = dateStr.includes('T')
            ? dateStr.split('T')[0]
            : dateStr;

        return new Date(baseDate + 'T00:00:00');
    };

    const getSearchTerms = (title: string, description: string): string[] => {
        const terms: string[] = [];
        let subtopic = title;

        if (title.includes(' - ')) {
            subtopic = title.split(' - ')[1].trim();
        }

        subtopic = subtopic.replace(/^Study:\s*/i, '');

        if (subtopic.length >= 2) {
            terms.push(subtopic.toLowerCase());
        }

        const descLower = (description || '').toLowerCase();
        const acronymMatches = descLower.matchAll(/\(([a-z0-9]{2,6})\)/gi);

        for (const match of acronymMatches) {
            terms.push(match[1].toLowerCase());
        }

        let cleanedDesc = descLower;
        const noisePrefixes = [
            'focus on the proper application of',
            'focus on translating',
            'focus on calculating',
            'focus on building',
            'focus on structuring',
            'focus on deductive and inductive',
            'focus on',
            'practice ensuring',
            'practice identifying',
            'practice finding',
            'practice spotting',
            'practice solving',
            'practice tracing',
            'practice',
            'review rules for',
            'review',
            'identify',
            'analyze',
        ];

        for (const prefix of noisePrefixes) {
            if (cleanedDesc.trim().startsWith(prefix)) {
                cleanedDesc = cleanedDesc
                    .trim()
                    .substring(prefix.length)
                    .trim();
                break;
            }
        }

        const parts = cleanedDesc.split(
            /[\s,;]+and\s+|[\s,;]+or\s+|[\s,;]+&\s+|[,;.]+/,
        );
        const broadStopWords = new Set([
            'rules',
            'numbers',
            'operations',
            'word',
            'problems',
            'tasks',
            'relationships',
            'concept',
            'concepts',
            'issues',
            'laws',
            'etc',
            'meaning',
            'structure',
            'application',
            'context',
            'pairs',
            'main',
            'idea',
            'clues',
            'conclusions',
            'arguments',
            'hypotheses',
            'shapes',
            'order',
            'arithmetic',
            'basic',
            'ability',
            'general',
            'information',
            'clerical',
            'verbal',
            'analytical',
            'numerical',
            'solving',
            'identifying',
            'finding',
            'spotting',
        ]);

        for (let part of parts) {
            part = part.trim();

            if (part.length < 2) {
                continue;
            }

            if (broadStopWords.has(part)) {
                continue;
            }

            terms.push(part);
        }

        return Array.from(new Set(terms));
    };

    const suggestedModules = React.useMemo(() => {
        if (!formData.title.trim()) {
            return [];
        }

        const isModuleRelated = (
            mod: LearnModule,
            title: string,
            description: string,
        ): boolean => {
            const terms = getSearchTerms(title, description);
            const modTitle = (mod.title || '').toLowerCase().trim();
            const modTopic = (mod.topic || '').toLowerCase().trim();

            for (const term of terms) {
                let baseTerm = term;

                if (baseTerm.endsWith('s') && !baseTerm.endsWith('ss')) {
                    baseTerm = baseTerm.slice(0, -1);
                }

                let patternStr = '';

                if (/^\w/.test(baseTerm)) {
                    patternStr += '\\b';
                }

                patternStr += baseTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                if (/\w$/.test(baseTerm)) {
                    patternStr += 's?\\b';
                }

                const regex = new RegExp(patternStr, 'i');

                if (
                    (modTitle && regex.test(modTitle)) ||
                    (modTopic && regex.test(modTopic))
                ) {
                    return true;
                }
            }

            return false;
        };

        return learnModules
            .filter((mod) =>
                isModuleRelated(mod, formData.title, formData.description),
            )
            .slice(0, 3);
    }, [formData.title, formData.description, learnModules]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Study Item' : 'Add Study Item'}
                    </DialogTitle>
                    {selectedDate && (
                        <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-400">
                            {parseScheduleDate(selectedDate).toLocaleDateString(
                                'en-US',
                                {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                },
                            )}
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {errorMessage && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400">
                            {errorMessage}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">
                            Subject / Topic (optional)
                        </label>
                        <div className="relative mt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    setIsSubjectDropdownOpen(
                                        !isSubjectDropdownOpen,
                                    )
                                }
                                className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            >
                                <span>
                                    {(() => {
                                        const currentSub = subcategories.find(
                                            (s) =>
                                                s.id.toString() ===
                                                formData.subcategory_id,
                                        );

                                        return currentSub
                                            ? categoryNames[
                                                  currentSub.category_id
                                              ] || 'Select a category...'
                                            : 'Select a category...';
                                    })()}
                                </span>
                                <ChevronDown className="h-4 w-4 text-slate-500" />
                            </button>

                            {isSubjectDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => {
                                            setIsSubjectDropdownOpen(false);
                                            setSubjectSearch('');
                                        }}
                                    />
                                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                                        <div className="sticky top-0 bg-white pb-1.5 dark:bg-slate-950">
                                            <input
                                                type="text"
                                                placeholder="Search categories..."
                                                value={subjectSearch}
                                                onChange={(e) =>
                                                    setSubjectSearch(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        subcategory_id: '',
                                                    });
                                                    setIsSubjectDropdownOpen(
                                                        false,
                                                    );
                                                    setSubjectSearch('');
                                                }}
                                                className="w-full rounded px-2.5 py-1.5 text-left text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
                                            >
                                                Clear selection / Select a
                                                category...
                                            </button>
                                            {mainCategories
                                                .filter((cat) =>
                                                    cat.name
                                                        .toLowerCase()
                                                        .includes(
                                                            subjectSearch.toLowerCase(),
                                                        ),
                                                )
                                                .map((cat) => {
                                                    const currentSub =
                                                        subcategories.find(
                                                            (s) =>
                                                                s.id.toString() ===
                                                                formData.subcategory_id,
                                                        );
                                                    const isSelected =
                                                        currentSub &&
                                                        currentSub.category_id ===
                                                            cat.id;

                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const firstSub =
                                                                    subcategories.find(
                                                                        (s) =>
                                                                            s.category_id ===
                                                                            cat.id,
                                                                    );
                                                                const subId =
                                                                    firstSub
                                                                        ? firstSub.id.toString()
                                                                        : '';

                                                                setFormData({
                                                                    ...formData,
                                                                    subcategory_id:
                                                                        subId,
                                                                    title:
                                                                        formData.title &&
                                                                        !mainCategories.some(
                                                                            (
                                                                                c,
                                                                            ) =>
                                                                                c.name ===
                                                                                formData.title,
                                                                        )
                                                                            ? formData.title
                                                                            : cat.name,
                                                                });
                                                                setIsSubjectDropdownOpen(
                                                                    false,
                                                                );
                                                                setSubjectSearch(
                                                                    '',
                                                                );
                                                            }}
                                                            className={`w-full rounded px-3 py-1.5 text-left text-xs transition-colors ${
                                                                isSelected
                                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900'
                                                            }`}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    );
                                                })}
                                            {mainCategories.filter((cat) =>
                                                cat.name
                                                    .toLowerCase()
                                                    .includes(
                                                        subjectSearch.toLowerCase(),
                                                    ),
                                            ).length === 0 && (
                                                <div className="px-2 py-3 text-center text-xs text-slate-400">
                                                    No categories found
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">
                            What will you study?
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Math Chapter 5"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    title: e.target.value,
                                })
                            }
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-200">
                            Details (optional)
                        </label>
                        <textarea
                            placeholder="Add any notes or details..."
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            rows={3}
                            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                            Study Time (optional)
                        </label>
                        <div className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                            <TimePicker
                                value={formData.study_time}
                                onChange={(time) =>
                                    setFormData({
                                        ...formData,
                                        study_time: time,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/30 p-3 dark:border-emerald-950/20 dark:bg-emerald-950/10">
                        <input
                            type="checkbox"
                            id="is_done"
                            checked={formData.is_done}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_done: e.target.checked,
                                })
                            }
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950"
                        />
                        <label
                            htmlFor="is_done"
                            className="cursor-pointer text-sm font-semibold text-emerald-800 dark:text-emerald-300"
                        >
                            Mark as Completed
                        </label>
                    </div>

                    {suggestedModules.length > 0 && (
                        <div className="mt-2 space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
                            <p className="flex items-center text-sm leading-relaxed font-semibold text-blue-800">
                                <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                                Suggested Learn Modules
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {suggestedModules.map((mod) => {
                                    const isAttached = attachedModules.some(
                                        (a) => a.slug === mod.slug,
                                    );

                                    return (
                                        <button
                                            key={mod.slug}
                                            type="button"
                                            onClick={() => {
                                                if (isAttached) {
                                                    setAttachedModules(
                                                        attachedModules.filter(
                                                            (a) =>
                                                                a.slug !==
                                                                mod.slug,
                                                        ),
                                                    );
                                                } else {
                                                    setAttachedModules([
                                                        ...attachedModules,
                                                        {
                                                            title: mod.title,
                                                            slug: mod.slug,
                                                        },
                                                    ]);
                                                }
                                            }}
                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm transition-all ${
                                                isAttached
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                    : 'border-blue-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:text-blue-400'
                                            }`}
                                        >
                                            {isAttached ? (
                                                <Check className="mr-1 h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                            ) : (
                                                <Plus className="mr-1 h-3 w-3 text-blue-500" />
                                            )}
                                            {mod.title}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-slate-500">
                                Click to attach this module to your study notes.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleAddStudy}
                        disabled={isLoading || !formData.title.trim()}
                    >
                        {isLoading
                            ? isEditMode
                                ? 'Saving...'
                                : 'Adding...'
                            : isEditMode
                              ? 'Save Changes'
                              : 'Add Study'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
