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
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
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
    const drillUrl = subcat
        ? `/exam/drills?subcategory_id=${subcat.id}&count=15`
        : '/exam/drills';

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col justify-between overflow-y-auto"
            >
                <div>
                    {/* Header */}
                    <SheetHeader className="p-6 border-b border-slate-200/80 bg-slate-50/50 dark:border-slate-800/80 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between gap-2">
                            <Badge
                                variant="outline"
                                className="text-xs font-bold border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
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

                        <SheetTitle className="text-lg font-black text-slate-900 dark:text-white mt-3">
                            {task.title}
                        </SheetTitle>

                        <SheetDescription className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
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
                        </SheetDescription>
                    </SheetHeader>

                    {/* Body */}
                    <div className="p-6 space-y-5">
                        {/* 1-Click Drill Launcher Card */}
                        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-indigo-50/80 p-4.5 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-indigo-950/40 shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex size-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                                        <Sparkles className="size-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                            Targeted Practice Drill
                                        </h4>
                                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                                            15 High-Yield Questions with Rationales
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    size="sm"
                                    className="h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs shrink-0"
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
                                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
                                <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    <BookOpen className="size-3.5 text-blue-500" />
                                    <span>Learning Modules & References</span>
                                </h4>
                                <div className="space-y-2">
                                    {attachedModuleList.map((mod, i) => (
                                        <Link
                                            key={i}
                                            href={mod.url}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:bg-blue-950/30 shadow-2xs"
                                        >
                                            <div className="flex items-center gap-2 truncate pr-2">
                                                <BookOpen className="size-4 text-blue-600 shrink-0 dark:text-blue-400" />
                                                <span className="truncate">
                                                    {mod.title}
                                                </span>
                                            </div>
                                            <ExternalLink className="size-3.5 text-slate-400 shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60 flex items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            onDelete(task.id, dateStr);
                            onOpenChange(false);
                        }}
                        className="h-8.5 text-xs font-bold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                        <Trash2 className="size-3.5 mr-1" />
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
                            <Edit3 className="size-3.5 mr-1" />
                            Edit Task
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            className="h-8.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
