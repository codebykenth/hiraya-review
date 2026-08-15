import type { DragEndEvent, CollisionDetection } from '@dnd-kit/core';
import {
    DndContext,
    useDroppable,
    useDraggable,
    pointerWithin,
    rectIntersection,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Link } from '@inertiajs/react';
import {
    Plus,
    Trash2,
    CalendarDays,
    Clock,
    CheckCircle2,
    Circle,
    ChevronLeft,
    ChevronRight,
    Dumbbell,
    BookOpen,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { categoryNames } from '../hooks/use-calendar-state';
import type { StudySchedule, CalendarDay } from '../types';

function DroppableWeekDay({
    id,
    children,
    className,
    onClick,
}: {
    id: string;
    children: React.ReactNode;
    className: string;
    onClick?: () => void;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={`${className} ${
                isOver
                    ? 'bg-blue-50/70 ring-2 ring-blue-500 ring-inset dark:bg-blue-900/30 dark:ring-blue-400'
                    : ''
            }`}
        >
            {children}
        </div>
    );
}

function DraggableWeekSchedule({
    schedule,
    children,
    className,
    onClick,
}: {
    schedule: StudySchedule;
    children: React.ReactNode;
    className: string;
    onClick?: (e: React.MouseEvent) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: `week-schedule-${schedule.id}`,
            data: { schedule },
        });

    const style = transform
        ? {
              transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
              zIndex: 50,
          }
        : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className={`${className} ${isDragging ? 'opacity-50 shadow-xl ring-2 ring-blue-500' : ''}`}
        >
            {children}
        </div>
    );
}

interface WeekViewProps {
    days: CalendarDay[];
    todayStr: string;
    examDates: string[];
    subcategories: Array<{ id: number; name: string; category_id: number }>;
    weekRangeLabel: string;
    previousWeek: () => void;
    nextWeek: () => void;
    jumpToTodayWeek: () => void;
    openModal: (date: string) => void;
    openEditModal: (schedule: StudySchedule, date: string) => void;
    toggleScheduleDone: (
        schedule: StudySchedule,
        date: string,
    ) => Promise<void>;
    handleDeleteSchedule: (scheduleId: number, date: string) => Promise<void>;
    handleRescheduleToToday?: (schedule: StudySchedule) => Promise<void>;
    handleDragSchedule?: (
        schedule: StudySchedule,
        sourceDate: string,
        newDate: string,
    ) => Promise<void>;
}

export function WeekView({
    days,
    todayStr,
    examDates,
    subcategories,
    weekRangeLabel,
    previousWeek,
    nextWeek,
    jumpToTodayWeek,
    openModal,
    openEditModal,
    toggleScheduleDone,
    handleDeleteSchedule,
    handleRescheduleToToday,
    handleDragSchedule,
}: WeekViewProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
    );

    const customCollisionDetection: CollisionDetection = (args) => {
        const pointerCollisions = pointerWithin(args);

        if (pointerCollisions.length > 0) {
            return pointerCollisions;
        }

        const rectCollisions = rectIntersection(args);

        if (rectCollisions.length > 0) {
            return rectCollisions;
        }

        return closestCenter(args);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || !active.data.current?.schedule || !handleDragSchedule) {
            return;
        }

        const schedule = active.data.current.schedule;
        const sourceDate = schedule.study_date || schedule.date;
        const targetDate = over.id as string;

        if (sourceDate !== targetDate) {
            handleDragSchedule(schedule, sourceDate, targetDate);
        }
    };

    const isToday = (dateStr: string) => dateStr === todayStr;

    const getCategoryDetails = (title: string, subcategoryId?: number) => {
        let catName = 'General';
        let catId = 1;
        let matchedSubcategoryName: string | null = null;
        let colorClasses = {
            badge: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300',
            bg: 'bg-white dark:bg-slate-900',
            border: 'border-slate-200/80 dark:border-slate-800',
            time: 'text-blue-700 dark:text-blue-400',
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
                border: 'border-indigo-200/70 dark:border-indigo-950/50',
                time: 'text-indigo-700 dark:text-indigo-400',
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
                border: 'border-emerald-200/70 dark:border-emerald-950/50',
                time: 'text-emerald-700 dark:text-emerald-400',
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
                border: 'border-amber-200/70 dark:border-amber-950/50',
                time: 'text-amber-700 dark:text-amber-400',
            };
        } else if (
            t.includes('clerical') ||
            t.includes('filing') ||
            t.includes('alphabetizing') ||
            t.includes('spelling')
        ) {
            catName = 'Clerical Ability';
            catId = 5;
            colorClasses = {
                badge: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300',
                bg: 'bg-white dark:bg-slate-900',
                border: 'border-purple-200/70 dark:border-purple-950/50',
                time: 'text-purple-700 dark:text-purple-400',
            };
        } else if (t.includes('general info') || t.includes('constitution')) {
            catName = 'General Information';
            catId = 1;
            colorClasses = {
                badge: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300',
                bg: 'bg-white dark:bg-slate-900',
                border: 'border-rose-200/70 dark:border-rose-950/50',
                time: 'text-rose-700 dark:text-rose-400',
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

    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="space-y-4">
            {/* Week Navigation Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={previousWeek}
                        title="Previous Week"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={nextWeek}
                        title="Next Week"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                    <span className="ml-2 text-sm font-black text-slate-800 dark:text-slate-200">
                        {weekRangeLabel}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-bold"
                        onClick={jumpToTodayWeek}
                    >
                        This Week (Today)
                    </Button>
                </div>
            </div>

            {/* 7-Column Week Planner Grid */}
            <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
                <div className="min-w-[1400px] 2xl:min-w-full">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={customCollisionDetection}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="grid grid-cols-7 gap-3">
                            {days.map((calendarDay, idx) => {
                                const isCurrentDayToday = isToday(
                                    calendarDay.date,
                                );
                                const isExamDay = examDates.includes(
                                    calendarDay.date,
                                );
                                const dayDateObj = new Date(
                                    calendarDay.date + 'T00:00:00',
                                );

                                return (
                                    <DroppableWeekDay
                                        key={calendarDay.date}
                                        id={calendarDay.date}
                                        onClick={() => {
                                            if (calendarDay.date >= todayStr) {
                                                openModal(calendarDay.date);
                                            }
                                        }}
                                        className={`group relative flex h-[520px] min-w-[200px] flex-col rounded-2xl border p-3 transition-all ${
                                            isExamDay
                                                ? 'border-red-300 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20'
                                                : isCurrentDayToday
                                                  ? 'border-blue-400/80 bg-blue-50/40 shadow-sm ring-1 ring-blue-400/50 dark:border-blue-800 dark:bg-blue-950/20'
                                                  : 'border-slate-200/80 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40'
                                        }`}
                                    >
                                        {/* Column Day Header */}
                                        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    {weekdayNames[idx]}
                                                </span>
                                                <span
                                                    className={`flex size-6 items-center justify-center rounded-md font-black text-xs ${
                                                        isCurrentDayToday
                                                            ? 'bg-blue-600 text-white shadow-sm'
                                                            : 'text-slate-800 dark:text-slate-200'
                                                    }`}
                                                >
                                                    {dayDateObj.getDate()}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {isCurrentDayToday && (
                                                    <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                        Today
                                                    </span>
                                                )}
                                                {isExamDay && (
                                                    <span className="rounded bg-red-600 px-1 py-0.2 text-[9px] font-black text-white">
                                                        Exam
                                                    </span>
                                                )}
                                                <TooltipProvider
                                                    delayDuration={150}
                                                >
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openModal(
                                                                        calendarDay.date,
                                                                    );
                                                                }}
                                                                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                                            >
                                                                <Plus className="size-3.5" />
                                                            </button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Add study session
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </div>

                                        {/* Task Cards in this Day Column with dedicated vertical scroll */}
                                        <div className="mt-2.5 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
                                            {calendarDay.schedules.map(
                                                (schedule) => {
                                                    const isOverdue =
                                                        calendarDay.date <
                                                            todayStr &&
                                                        !schedule.is_done;
                                                    const {
                                                        catName,
                                                        colorClasses,
                                                        buildDrillUrl,
                                                    } = getCategoryDetails(
                                                        schedule.title,
                                                        schedule.subcategory_id,
                                                    );
                                                    const links = extractLinks(
                                                        schedule.description,
                                                    );
                                                    const cleanDesc = (
                                                        schedule.description ||
                                                        ''
                                                    )
                                                        .replace(
                                                            /(?:\r?\n)+Links:[\s\S]*$/,
                                                            '',
                                                        )
                                                        .replace(
                                                            /\[(.*?)\]\((.*?)\)/g,
                                                            '',
                                                        )
                                                        .replace(
                                                            /^Score:\s*[0-9.]+%?\s*-\s*/,
                                                            '',
                                                        )
                                                        .trim();

                                                    return (
                                                        <DraggableWeekSchedule
                                                            key={schedule.id}
                                                            schedule={schedule}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditModal(
                                                                    schedule,
                                                                    calendarDay.date,
                                                                );
                                                            }}
                                                            className={`group relative cursor-pointer rounded-xl border p-2.5 shadow-sm transition-all duration-200 hover:shadow-md ${
                                                                schedule.is_done
                                                                    ? 'border-emerald-300/70 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                                                                    : isOverdue
                                                                      ? 'border-rose-300 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/20'
                                                                      : `${colorClasses.border} ${colorClasses.bg}`
                                                            }`}
                                                        >
                                                            {/* Top Line: Checkbox, Title, Badges */}
                                                            <div className="flex items-start gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={async (
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        await toggleScheduleDone(
                                                                            schedule,
                                                                            calendarDay.date,
                                                                        );
                                                                    }}
                                                                    className="mt-0.5 shrink-0 text-slate-400 transition hover:scale-110"
                                                                >
                                                                    {schedule.is_done ? (
                                                                        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                                                                    ) : (
                                                                        <Circle
                                                                            className={`size-4 ${
                                                                                isOverdue
                                                                                    ? 'text-rose-400 hover:text-rose-600'
                                                                                    : 'hover:text-blue-600'
                                                                            }`}
                                                                        />
                                                                    )}
                                                                </button>
                                                                <div className="min-w-0 flex-1">
                                                                    <span
                                                                        className={`block text-xs font-bold leading-snug break-words ${
                                                                            schedule.is_done
                                                                                ? 'text-slate-400 line-through dark:text-slate-500'
                                                                                : 'text-slate-900 dark:text-white'
                                                                        }`}
                                                                    >
                                                                        {
                                                                            schedule.title
                                                                        }
                                                                    </span>
                                                                </div>

                                                                {/* Action Buttons (visible on mobile / hover on desktop) */}
                                                                <div className="flex shrink-0 items-center gap-0.5 opacity-80 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                                                                    {isOverdue &&
                                                                        handleRescheduleToToday && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    handleRescheduleToToday(
                                                                                        schedule,
                                                                                    );
                                                                                }}
                                                                                className="rounded p-1 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/40"
                                                                                title="Reschedule to Today"
                                                                            >
                                                                                <CalendarDays className="size-3.5" />
                                                                            </button>
                                                                        )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteSchedule(
                                                                                schedule.id,
                                                                                calendarDay.date,
                                                                            );
                                                                        }}
                                                                        className="rounded p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Category & Time meta */}
                                                            <div className="mt-1.5 flex flex-wrap items-center gap-1">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`px-1 py-0 text-[9px] font-bold ${colorClasses.badge}`}
                                                                >
                                                                    {catName}
                                                                </Badge>
                                                                {schedule.study_time && (
                                                                    <span className="flex items-center gap-0.5 rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                                        <Clock className="size-2.5" />
                                                                        {schedule.study_time.substring(
                                                                            0,
                                                                            5,
                                                                        )}
                                                                    </span>
                                                                )}
                                                                {isOverdue &&
                                                                    !schedule.is_done && (
                                                                        <span className="rounded bg-rose-200/80 px-1 py-0.2 text-[9px] font-extrabold text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                                                                            Overdue
                                                                        </span>
                                                                    )}
                                                            </div>

                                                            {cleanDesc && (
                                                                <p
                                                                    className={`mt-1 line-clamp-2 text-[11px] leading-tight ${
                                                                        schedule.is_done
                                                                            ? 'text-slate-400 line-through dark:text-slate-500'
                                                                            : 'text-slate-600 dark:text-slate-300'
                                                                    }`}
                                                                >
                                                                    {cleanDesc}
                                                                </p>
                                                            )}

                                                            {/* Practice Drill & Learn Launchers */}
                                                            <div className="mt-2 flex flex-wrap items-center gap-1">
                                                                <Link
                                                                    href={buildDrillUrl()}
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        e.stopPropagation()
                                                                    }
                                                                    className="inline-flex items-center gap-0.5 rounded border border-purple-200 bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 transition hover:bg-purple-100 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300"
                                                                >
                                                                    <Dumbbell className="size-2.5" />
                                                                    <span>
                                                                        Drill
                                                                    </span>
                                                                </Link>
                                                                {links.map(
                                                                    (
                                                                        link,
                                                                        i,
                                                                    ) => (
                                                                        <Link
                                                                            key={
                                                                                i
                                                                            }
                                                                            href={
                                                                                link.url
                                                                            }
                                                                            onClick={(
                                                                                e,
                                                                            ) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                            className="inline-flex items-center gap-0.5 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                                                                        >
                                                                            <BookOpen className="size-2.5" />
                                                                            <span className="line-clamp-1 max-w-[80px]">
                                                                                {
                                                                                    link.title
                                                                                }
                                                                            </span>
                                                                        </Link>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </DraggableWeekSchedule>
                                                    );
                                                },
                                            )}

                                            {calendarDay.schedules.length ===
                                                0 && (
                                                <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-2 text-center text-slate-400 dark:border-slate-800 dark:text-slate-500">
                                                    <span className="text-[11px]">
                                                        No tasks
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </DroppableWeekDay>
                                );
                            })}
                        </div>
                    </DndContext>
                </div>
            </div>
        </div>
    );
}
