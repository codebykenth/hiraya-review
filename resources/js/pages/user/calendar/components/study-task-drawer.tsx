import { Link } from '@inertiajs/react';
import {
    Sparkles,
    Clock,
    Calendar,
    CheckCircle2,
    Circle,
    BookOpen,
    Play,
    Edit3,
    Trash2,
    ExternalLink,
    Tag,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { categoryNames } from '../hooks/use-calendar-state';
import type { StudySchedule, LearnModule } from '../types';

interface StudyTaskDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    task: StudySchedule | null;
    dateStr: string;
    subcategories: Array<{ id: number; name: string; category_id: number }>;
    learnModules: LearnModule[];
    onToggleDone: (task: StudySchedule, dateStr: string) => Promise<void>;
    onEdit: (task: StudySchedule, dateStr: string) => void;
    onDelete: (taskId: number, dateStr: string) => Promise<void>;
}

export function StudyTaskDrawer({
    isOpen,
    onOpenChange,
    task,
    dateStr,
    subcategories,
    learnModules,
    onToggleDone,
    onEdit,
    onDelete,
}: StudyTaskDrawerProps) {
    const subcat = task?.subcategory_id
        ? subcategories.find((s) => s.id === task.subcategory_id)
        : null;

    const catName = subcat?.category_id
        ? categoryNames[subcat.category_id] || 'General'
        : 'General Study';

    // Parse attached modules from description or match by subcategory
    const attachedModuleList = React.useMemo(() => {
        if (!task) {
            return [];
        }

        if (task.description) {
            const matches = [
                ...task.description.matchAll(/\[(.*?)\]\((.*?)\)/g),
            ];

            if (matches.length > 0) {
                return matches.map((m) => ({
                    title: m[1],
                    url: m[2],
                }));
            }
        }

        if (subcat?.name) {
            const subName = subcat.name.toLowerCase();
            const related = learnModules.filter(
                (m) => m.subcategory_name?.toLowerCase() === subName,
            );

            if (related.length > 0) {
                return related.slice(0, 3).map((m) => ({
                    title: m.title,
                    url: `/learn/${m.slug}`,
                }));
            }
        }

        return [];
    }, [task, learnModules, subcat]);

    if (!task) {
        return null;
    }

    const cleanDescription = (task.description || '')
        .replace(/(?:\r?\n)+Links:[\s\S]*$/, '')
        .replace(/\[(.*?)\]\((.*?)\)/g, '')
        .replace(/^Score:\s*[0-9.]+%?\s*-\s*/, '')
        .trim();

    // Construct drill link
    const drillUrl = React.useMemo(() => {
        const params = new URLSearchParams({
            drill: 'true',
            category_id: String(subcat?.category_id || 1),
            category_name: catName,
            question_count: '15',
            language: 'English',
            timed: 'true',
        });

        if (subcat?.name) {
            params.append('subcategories', JSON.stringify([subcat.name]));
        }

        return `/exams?${params.toString()}`;
    }, [subcat, catName]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[88dvh] flex-col gap-0 overflow-hidden p-0">
                {/* Header */}
                <DialogHeader className="border-b border-slate-200/80 bg-slate-50/50 p-6 dark:border-slate-800/80 dark:bg-slate-900/50 relative">
                    <div className="flex items-center justify-between gap-2 pr-8">
                        <Badge
                            variant="outline"
                            className="border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                            <Tag className="mr-1 size-3" />
                            {catName}
                        </Badge>

                        <button
                            type="button"
                            onClick={() => onToggleDone(task, dateStr)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            {task.is_done ? (
                                <>
                                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-300">
                                        Completed
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Circle className="size-4 text-slate-400" />
                                    <span>Mark as Done</span>
                                </>
                            )}
                        </button>
                    </div>

                    <DialogTitle className="mt-3 text-lg font-black text-slate-900 dark:text-white">
                        {task.title}
                    </DialogTitle>

                    <DialogDescription className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {dateStr}
                        </span>
                        {task.study_time && (
                            <span className="flex items-center gap-1">
                                <Clock className="size-3.5" />
                                {task.study_time.slice(0, 5)}
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Body */}
                <div className="flex-1 space-y-5 overflow-y-auto p-6">
                    {/* 1-Click Drill Launcher Card */}
                    <div className="rounded-2xl border border-indigo-200/80 bg-linear-to-br from-indigo-50/80 via-blue-50/40 to-indigo-50/80 p-4.5 shadow-2xs dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-indigo-950/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
                            <div className="flex items-center gap-2">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                                    <Sparkles className="size-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                        Targeted {subcat?.name || catName} Drill
                                    </h4>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                        15 High-Yield Questions with
                                        Rationales
                                    </p>
                                </div>
                            </div>

                            <Button
                                asChild
                                size="sm"
                                className="w-full sm:w-auto h-8.5 shrink-0 gap-1.5 bg-indigo-600 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700"
                            >
                                <Link href={drillUrl}>
                                    <Play className="size-3.5 fill-current" />
                                    <span>Start Drill</span>
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Description / Study Notes */}
                    {cleanDescription && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                                Study Notes & Objectives
                            </h4>
                            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 text-xs leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                                {cleanDescription}
                            </div>
                        </div>
                    )}

                    {/* Attached Learning Modules */}
                    {attachedModuleList.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                                <BookOpen className="size-3.5 text-blue-500" />
                                <span>Learning Modules & References</span>
                            </h4>
                            <div className="space-y-2">
                                {attachedModuleList.map((mod, i) => (
                                    <Link
                                        key={i}
                                        href={mod.url}
                                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/30"
                                    >
                                        <div className="flex items-center gap-2 truncate pr-2">
                                            <BookOpen className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                            <span className="truncate">
                                                {mod.title}
                                            </span>
                                        </div>
                                        <ExternalLink className="size-3.5 shrink-0 text-slate-400" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onDelete(task.id, dateStr);
                            onOpenChange(false);
                        }}
                        className="h-8.5 border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                        <Trash2 className="mr-1 size-3.5" />
                        Delete
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onEdit(task, dateStr);
                                onOpenChange(false);
                            }}
                            className="h-8.5 text-xs font-bold"
                        >
                            <Edit3 className="mr-1 size-3.5" />
                            Edit Task
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8.5 bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
