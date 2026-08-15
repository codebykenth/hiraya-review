import { Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Circle,
    Clock,
    Plus,
    Trash2,
    Edit2,
    BookOpen,
    AlertCircle,
    Sparkles,
    CalendarDays,
    CheckCheck,
    Dumbbell,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { categoryNames } from '../hooks/use-calendar-state';
import type { StudySchedule } from '../types';

interface AgendaViewProps {
    schedules: Map<string, StudySchedule[]>;
    pastPending: StudySchedule[];
    todayStr: string;
    subcategories: Array<{ id: number; name: string; category_id: number }>;
    openModal: (date: string) => void;
    openEditModal: (schedule: StudySchedule, date: string) => void;
    toggleScheduleDone: (
        schedule: StudySchedule,
        date: string,
    ) => Promise<void>;
    handleDeleteSchedule: (scheduleId: number, date: string) => Promise<void>;
    handleRescheduleToToday: (schedule: StudySchedule) => Promise<void>;
    handleBulkRescheduleAllToToday: (ids?: number[]) => Promise<void>;
    handleBulkMarkAllDone: (ids?: number[]) => Promise<void>;
    filterScheduleByCategory: (schedule: StudySchedule) => boolean;
}

export function AgendaView({
    schedules,
    pastPending,
    todayStr,
    subcategories,
    openModal,
    openEditModal,
    toggleScheduleDone,
    handleDeleteSchedule,
    handleRescheduleToToday,
    handleBulkRescheduleAllToToday,
    handleBulkMarkAllDone,
    filterScheduleByCategory,
}: AgendaViewProps) {
    const [isCompletedOpen, setIsCompletedOpen] = useState(false);
    const [isBulkLoading, setIsBulkLoading] = useState(false);

    // Calculate Tomorrow's date string
    const tomorrowDate = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);

        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }, []);

    // Format all dates and organize agenda sections
    const { overdueList, todayList, tomorrowList, upcomingDays, completedList } =
        useMemo(() => {
            const overdue: StudySchedule[] = [];
            const today: StudySchedule[] = [];
            const tomorrow: StudySchedule[] = [];
            const upcomingMap = new Map<string, StudySchedule[]>();
            const completed: Array<{ schedule: StudySchedule; date: string }> =
                [];

            // 1. Process pastPending
            pastPending.forEach((item) => {
                if (filterScheduleByCategory(item)) {
                    overdue.push(item);
                }
            });

            // 2. Process all schedules in the map
            const sortedDates = Array.from(schedules.keys()).sort();

            sortedDates.forEach((dateStr) => {
                const items = (schedules.get(dateStr) || []).filter(
                    filterScheduleByCategory,
                );

                items.forEach((item) => {
                    if (item.is_done) {
                        completed.push({ schedule: item, date: dateStr });
                    }

                    if (dateStr === todayStr) {
                        today.push(item);
                    } else if (dateStr === tomorrowDate) {
                        tomorrow.push(item);
                    } else if (dateStr > tomorrowDate) {
                        const existing = upcomingMap.get(dateStr) || [];
                        existing.push(item);
                        upcomingMap.set(dateStr, existing);
                    } else if (dateStr < todayStr && !item.is_done) {
                        if (!overdue.some((o) => o.id === item.id)) {
                            overdue.push(item);
                        }
                    }
                });
            });

            return {
                overdueList: overdue,
                todayList: today,
                tomorrowList: tomorrow,
                upcomingDays: Array.from(upcomingMap.entries()),
                completedList: completed,
            };
        }, [
            schedules,
            pastPending,
            todayStr,
            tomorrowDate,
            filterScheduleByCategory,
        ]);

    const getCategoryDetails = (title: string, subcategoryId?: number) => {
        let catName = 'General';
        let catId = 1;
        let matchedSubcategoryName: string | null = null;
        let colorClasses = {
            badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
            bg: 'bg-white dark:bg-slate-900',
            border: 'border-slate-200/80 dark:border-slate-800',
        };

        if (subcategoryId && subcategories.length > 0) {
            const sub = subcategories.find((s) => s.id === subcategoryId);

            if (sub) {
                catId = sub.category_id;
                catName = categoryNames[sub.category_id] || sub.name;
                matchedSubcategoryName = sub.name;
            }
        }

        const t = `${catName} ${title}`.toLowerCase();

        if (t.includes('verbal')) {
            catName = 'Verbal Ability';
            catId = 2;
            colorClasses = {
                badge: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300',
                bg: 'bg-white dark:bg-slate-900',
                border: 'border-indigo-100 dark:border-indigo-950/50',
            };
        } else if (
            t.includes('numerical') ||
            t.includes('math') ||
            t.includes('pemdas') ||
            t.includes('fraction') ||
            t.includes('operation')
        ) {
            catName = 'Numerical Ability';
            catId = 4;
            colorClasses = {
                badge: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300',
                bg: 'bg-white dark:bg-slate-900',
                border: 'border-emerald-100 dark:border-emerald-950/50',
            };
        } else if (
            t.includes('analytical') ||
            t.includes('logic') ||
            t.includes('reasoning') ||
            t.includes('abstract')
        ) {
            catName = 'Analytical Ability';
            catId = 3;
            colorClasses = {
                badge: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300',
                bg: 'bg-white dark:bg-slate-900',
                border: 'border-amber-100 dark:border-amber-950/50',
            };
        } else if (
            t.includes('clerical') ||
            t.includes('filing') ||
            t.includes('alphabet')
        ) {
            catName = 'Clerical Ability';
            catId = 5;
            colorClasses = {
                badge: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300',
                bg: 'bg-white dark:bg-slate-900',
                border: 'border-purple-100 dark:border-purple-950/50',
            };
        } else if (t.includes('general info') || t.includes('constitution')) {
            catName = 'General Information';
            catId = 1;
            colorClasses = {
                badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
                bg: 'bg-white dark:bg-slate-900',
                border: 'border-rose-100 dark:border-rose-950/50',
            };
        }

        // Try detecting specific subcategory from title keywords if not already set
        if (!matchedSubcategoryName && subcategories.length > 0) {
            const potentialSubs = subcategories.filter(
                (s) => s.category_id === catId,
            );
            const foundSub = potentialSubs.find((s) =>
                title.toLowerCase().includes(s.name.toLowerCase()),
            );
            if (foundSub) {
                matchedSubcategoryName = foundSub.name;
            }
        }

        const buildDrillUrl = () => {
            const params = new URLSearchParams({
                drill: 'true',
                category_id: String(catId),
                category_name: catName,
                question_count: '30',
                language: 'English',
                timed: 'true',
            });

            if (matchedSubcategoryName) {
                params.append(
                    'subcategories',
                    JSON.stringify([matchedSubcategoryName]),
                );
            }

            return `/exams?${params.toString()}`;
        };

        return { catName, catId, colorClasses, buildDrillUrl };
    };

    const extractLinks = (description?: string) => {
        if (!description) {
            return [];
        }

        const linkRegex = /\[(.*?)\]\((.*?)\)/g;
        const links: Array<{ title: string; url: string }> = [];
        let match;

        while ((match = linkRegex.exec(description)) !== null) {
            links.push({ title: match[1], url: match[2] });
        }

        return links;
    };

    const renderTaskCard = (
        task: StudySchedule,
        dateStr: string,
        isOverdue = false,
    ) => {
        const { catName, colorClasses, buildDrillUrl } = getCategoryDetails(
            task.title,
            task.subcategory_id,
        );
        const links = extractLinks(task.description);
        const cleanDesc = (task.description || '')
            .replace(/(?:\r?\n)+Links:[\s\S]*$/, '')
            .replace(/\[(.*?)\]\((.*?)\)/g, '')
            .replace(/^Score:\s*[0-9.]+%?\s*-\s*/, '')
            .trim();

        return (
            <div
                key={task.id}
                className={`group relative flex flex-col gap-3 rounded-2xl border p-4 transition-all duration-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                    task.is_done
                        ? 'border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/20'
                        : isOverdue
                          ? 'border-rose-200/80 bg-rose-50/40 hover:border-rose-300 dark:border-rose-900/40 dark:bg-rose-950/15'
                          : `${colorClasses.border} ${colorClasses.bg}`
                }`}
            >
                {/* Left: Completion Toggle & Title */}
                <div className="flex flex-1 items-start gap-3.5">
                    <button
                        type="button"
                        onClick={() => toggleScheduleDone(task, dateStr)}
                        className="mt-0.5 shrink-0 transition-transform active:scale-90"
                        aria-label={
                            task.is_done
                                ? 'Mark as incomplete'
                                : 'Mark as complete'
                        }
                    >
                        {task.is_done ? (
                            <CheckCircle2 className="size-5.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <Circle
                                className={`size-5.5 ${isOverdue ? 'text-rose-400 hover:text-rose-600' : 'text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400'}`}
                            />
                        )}
                    </button>

                    <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span
                                className={`text-xs font-bold ${
                                    task.is_done
                                        ? 'text-slate-400 line-through dark:text-slate-500'
                                        : 'text-slate-900 dark:text-white'
                                }`}
                            >
                                {task.title}
                            </span>
                            <Badge
                                variant="outline"
                                className={`text-[10px] font-bold ${colorClasses.badge}`}
                            >
                                {catName}
                            </Badge>
                            {task.study_time && (
                                <span className="flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    <Clock className="size-3" />
                                    {task.study_time.substring(0, 5)}
                                </span>
                            )}
                            {isOverdue && !task.is_done && (
                                <Badge className="border-rose-300 bg-rose-100 text-[10px] font-extrabold text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
                                    Overdue
                                </Badge>
                            )}
                        </div>

                        {cleanDesc && (
                            <p
                                className={`text-xs leading-relaxed ${
                                    task.is_done
                                        ? 'text-slate-400 line-through dark:text-slate-500'
                                        : 'text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                {cleanDesc}
                            </p>
                        )}

                        {/* Interactive Drill & Module Launchers */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Link
                                href={buildDrillUrl()}
                                className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50/70 px-2 py-0.5 text-[11px] font-bold text-purple-700 transition hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60"
                            >
                                <Dumbbell className="size-3" />
                                <span>Practice Drill</span>
                            </Link>

                            {links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50/70 px-2 py-0.5 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60"
                                >
                                    <BookOpen className="size-3" />
                                    <span>Learn: {link.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {isOverdue && !task.is_done && (
                        <Button
                            size="sm"
                            className="h-7 bg-blue-600 px-2.5 text-xs font-bold text-white hover:bg-blue-700"
                            onClick={() => handleRescheduleToToday(task)}
                        >
                            Move to Today
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        onClick={() => openEditModal(task, dateStr)}
                    >
                        <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        onClick={() => handleDeleteSchedule(task.id, dateStr)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* OVERDUE TASKS SECTION */}
            {overdueList.length > 0 && (
                <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-5 dark:border-rose-900/40 dark:bg-rose-950/20 sm:p-6">
                    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
                                <AlertCircle className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-rose-900 dark:text-rose-300">
                                    Overdue Study Tasks ({overdueList.length})
                                </h3>
                                <p className="text-xs text-rose-700/80 dark:text-rose-400/80">
                                    Tasks from previous dates that are pending
                                    completion
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isBulkLoading}
                                className="h-8 border-blue-300 bg-white font-bold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300"
                                onClick={async () => {
                                    setIsBulkLoading(true);

                                    try {
                                        await handleBulkRescheduleAllToToday();
                                    } finally {
                                        setIsBulkLoading(false);
                                    }
                                }}
                            >
                                <CalendarDays className="mr-1.5 size-3.5" />
                                Reschedule All to Today
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isBulkLoading}
                                className="h-8 border-emerald-300 bg-white font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
                                onClick={async () => {
                                    setIsBulkLoading(true);

                                    try {
                                        await handleBulkMarkAllDone();
                                    } finally {
                                        setIsBulkLoading(false);
                                    }
                                }}
                            >
                                <CheckCheck className="mr-1.5 size-3.5" />
                                Mark All Done
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {overdueList.map((task) =>
                            renderTaskCard(task, task.study_date, true),
                        )}
                    </div>
                </div>
            )}

            {/* TODAY'S TASKS SECTION */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 font-black text-xs text-white">
                            {new Date(todayStr + 'T00:00:00').getDate()}
                        </span>
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                Today&apos;s Plan
                            </h3>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {new Date(
                                    todayStr + 'T00:00:00',
                                ).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 border-slate-200 font-bold dark:border-slate-800"
                        onClick={() => openModal(todayStr)}
                    >
                        <Plus className="size-3.5" />
                        <span>Add Task</span>
                    </Button>
                </div>

                {todayList.length > 0 ? (
                    <div className="space-y-2.5">
                        {todayList.map((task) => renderTaskCard(task, todayStr))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
                        <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                            <Sparkles className="size-5" />
                        </div>
                        <p className="font-bold text-slate-800 text-sm dark:text-slate-200">
                            No study tasks planned for today
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Keep your momentum going by adding a focus session
                            or running a practice drill.
                        </p>
                        <Button
                            size="sm"
                            className="mt-3 bg-blue-600 font-bold text-white hover:bg-blue-700"
                            onClick={() => openModal(todayStr)}
                        >
                            <Plus className="mr-1.5 size-3.5" />
                            Add Study Task
                        </Button>
                    </Card>
                )}
            </div>

            {/* TOMORROW'S TASKS SECTION */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 font-bold text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {new Date(tomorrowDate + 'T00:00:00').getDate()}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Tomorrow
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(
                                    tomorrowDate + 'T00:00:00',
                                ).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        onClick={() => openModal(tomorrowDate)}
                    >
                        <Plus className="mr-1 size-3.5" />
                        Add Session
                    </Button>
                </div>

                {tomorrowList.length > 0 ? (
                    <div className="space-y-2.5">
                        {tomorrowList.map((task) =>
                            renderTaskCard(task, tomorrowDate),
                        )}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
                        No tasks scheduled for tomorrow yet.
                    </div>
                )}
            </div>

            {/* UPCOMING DAYS SCHEDULE */}
            {upcomingDays.length > 0 && (
                <div className="space-y-4 pt-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Upcoming Days
                    </h3>

                    <div className="space-y-5">
                        {upcomingDays.map(([dateStr, items]) => (
                            <div key={dateStr} className="space-y-2.5">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-1 dark:border-slate-800">
                                    <span className="font-bold text-slate-700 text-xs dark:text-slate-300">
                                        {new Date(
                                            dateStr + 'T00:00:00',
                                        ).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => openModal(dateStr)}
                                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                    >
                                        + Add Task
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {items.map((task) =>
                                        renderTaskCard(task, dateStr),
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* COMPLETED HISTORY ACCORDION */}
            {completedList.length > 0 && (
                <div className="border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
                    <button
                        type="button"
                        onClick={() => setIsCompletedOpen((prev) => !prev)}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-left font-bold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800/60"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                            <span>
                                Completed Study Sessions ({completedList.length}
                                )
                            </span>
                        </div>
                        {isCompletedOpen ? (
                            <ChevronUp className="size-4 text-slate-400" />
                        ) : (
                            <ChevronDown className="size-4 text-slate-400" />
                        )}
                    </button>

                    {isCompletedOpen && (
                        <div className="mt-3 space-y-2">
                            {completedList.map(({ schedule, date }) =>
                                renderTaskCard(schedule, date),
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
