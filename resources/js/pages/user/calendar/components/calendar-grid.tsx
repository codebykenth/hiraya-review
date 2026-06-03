import type {
    DragEndEvent} from '@dnd-kit/core';
import {
    DndContext,
    useDroppable,
    useDraggable,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Link } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { categoryNames } from '../hooks/use-calendar-state';
import type { StudySchedule, CalendarDay, LearnModule } from '../types';

function DroppableDay({ id, children, className, onClick }: any) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={`${className} ${isOver ? 'bg-blue-50/50 ring-2 ring-blue-400 ring-inset dark:bg-blue-900/20 dark:ring-blue-500' : ''}`}
        >
            {children}
        </div>
    );
}

function DraggableSchedule({ schedule, children, className, onClick }: any) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: `schedule-${schedule.id}`,
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
            className={`${className} ${isDragging ? 'opacity-50 shadow-lg' : ''}`}
        >
            {children}
        </div>
    );
}

interface CalendarGridProps {
    weeks: CalendarDay[][];
    todayStr: string;
    examDates: string[];
    subcategories: Array<{ id: number; name: string; category_id: number }>;
    learnModules: LearnModule[];
    openModal: (date: string) => void;
    openEditModal: (schedule: StudySchedule, date: string) => void;
    toggleScheduleDone: (
        schedule: StudySchedule,
        date: string,
    ) => Promise<void>;
    handleDeleteSchedule: (scheduleId: number, date: string) => Promise<void>;
    handleDragSchedule?: (
        schedule: StudySchedule,
        sourceDate: string,
        newDate: string,
    ) => Promise<void>;
}

export function CalendarGrid({
    weeks,
    todayStr,
    examDates,
    subcategories,
    learnModules,
    openModal,
    openEditModal,
    toggleScheduleDone,
    handleDeleteSchedule,
    handleDragSchedule,
}: CalendarGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || !active.data.current?.schedule || !handleDragSchedule) {
return;
}

        const schedule = active.data.current.schedule;
        const sourceDate = schedule.study_date || schedule.date;
        const targetDate = over.id as string;

        // Verify dates are different (ignore drops on the same day)
        if (sourceDate !== targetDate) {
            handleDragSchedule(schedule, sourceDate, targetDate);
        }
    };

    const isToday = (dateStr: string) => dateStr === todayStr;

    const getCategoryColors = (title: string, subcategoryId?: number) => {
        let t = title.toLowerCase();

        if (subcategoryId && subcategories.length > 0) {
            const sub = subcategories.find((s) => s.id === subcategoryId);

            if (sub) {
                const catName =
                    categoryNames[sub.category_id]?.toLowerCase() || '';
                t = `${catName} ${sub.name.toLowerCase()} ${t}`;
            }
        }

        if (t.includes('verbal')) {
            return {
                bg: 'bg-indigo-100 dark:bg-indigo-900/40',
                text: 'text-indigo-900 dark:text-indigo-100',
                time: 'text-indigo-700 dark:text-indigo-300',
                desc: 'text-indigo-800 dark:text-indigo-200',
            };
        }

        if (
            t.includes('numerical') ||
            t.includes('math') ||
            t.includes('pemdas')
        ) {
            return {
                bg: 'bg-emerald-100 dark:bg-emerald-900/40',
                text: 'text-emerald-900 dark:text-emerald-100',
                time: 'text-emerald-700 dark:text-emerald-300',
                desc: 'text-emerald-800 dark:text-emerald-200',
            };
        }

        if (t.includes('analytical') || t.includes('logic')) {
            return {
                bg: 'bg-amber-100 dark:bg-amber-900/40',
                text: 'text-amber-900 dark:text-amber-100',
                time: 'text-amber-700 dark:text-amber-300',
                desc: 'text-amber-800 dark:text-amber-200',
            };
        }

        if (
            t.includes('clerical') ||
            t.includes('filing') ||
            t.includes('alphabetizing')
        ) {
            return {
                bg: 'bg-purple-100 dark:bg-purple-900/40',
                text: 'text-purple-900 dark:text-purple-100',
                time: 'text-purple-700 dark:text-purple-300',
                desc: 'text-purple-800 dark:text-purple-200',
            };
        }

        if (t.includes('general info') || t.includes('constitution')) {
            return {
                bg: 'bg-rose-100 dark:bg-rose-900/40',
                text: 'text-rose-900 dark:text-rose-100',
                time: 'text-rose-700 dark:text-rose-300',
                desc: 'text-rose-800 dark:text-rose-200',
            };
        }

        return {
            bg: 'bg-blue-100 dark:bg-blue-900/40',
            text: 'text-blue-900 dark:text-blue-100',
            time: 'text-blue-700 dark:text-blue-300',
            desc: 'text-blue-800 dark:text-blue-200',
        };
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

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[1024px]">
                {/* Day headers */}
                <div className="mb-2 grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                        (day) => (
                            <div
                                key={day}
                                className="flex items-center justify-center font-semibold text-slate-600 dark:text-slate-400"
                            >
                                {day}
                            </div>
                        ),
                    )}
                </div>

                {/* Calendar grid */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="space-y-2">
                        {weeks.map((week, weekIndex) => (
                            <div
                                key={weekIndex}
                                className="grid grid-cols-7 gap-2"
                            >
                                {week.map((calendarDay) => (
                                    <DroppableDay
                                        key={calendarDay.date}
                                        id={calendarDay.date}
                                        onClick={() => {
                                            if (
                                                calendarDay.isCurrentMonth &&
                                                calendarDay.date >= todayStr
                                            ) {
                                                openModal(calendarDay.date);
                                            }
                                        }}
                                        className={`group relative flex min-h-24 flex-col rounded-lg border p-2 transition-all ${
                                            calendarDay.isCurrentMonth &&
                                            calendarDay.date >= todayStr
                                                ? 'cursor-pointer hover:border-blue-300 hover:shadow-sm'
                                                : ''
                                        } ${
                                            examDates.includes(calendarDay.date)
                                                ? 'border-red-400 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
                                                : isToday(calendarDay.date)
                                                  ? 'border-blue-400 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                                  : calendarDay.isCurrentMonth
                                                    ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                                                    : 'border-slate-100 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900/50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-sm font-semibold ${
                                                    examDates.includes(
                                                        calendarDay.date,
                                                    )
                                                        ? 'text-red-900 dark:text-red-400'
                                                        : isToday(
                                                                calendarDay.date,
                                                            )
                                                          ? 'text-blue-900 dark:text-blue-400'
                                                          : calendarDay.isCurrentMonth
                                                            ? 'text-slate-900 dark:text-slate-100'
                                                            : 'text-slate-400 dark:text-slate-500'
                                                }`}
                                            >
                                                {examDates.includes(
                                                    calendarDay.date,
                                                ) && (
                                                    <span className="mr-1 inline-block rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                                                        Exam Date
                                                    </span>
                                                )}
                                                {isToday(calendarDay.date) &&
                                                    !examDates.includes(
                                                        calendarDay.date,
                                                    ) && (
                                                        <span className="mr-1 inline-block rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-bold text-white">
                                                            Today
                                                        </span>
                                                    )}
                                                {calendarDay.day}
                                            </span>
                                            {calendarDay.isCurrentMonth &&
                                                calendarDay.date >=
                                                    todayStr && (
                                                    <TooltipProvider
                                                        delayDuration={150}
                                                    >
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <button
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        openModal(
                                                                            calendarDay.date,
                                                                        );
                                                                    }}
                                                                    className="rounded p-1 opacity-100 transition-opacity hover:bg-blue-100 lg:opacity-0 lg:group-hover:opacity-100 dark:hover:bg-blue-900/30"
                                                                >
                                                                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                Add study item
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                        </div>

                                        {/* Study items for this day */}
                                        <div className="mt-2 flex-1 space-y-1 overflow-y-auto">
                                            {calendarDay.schedules.map(
                                                (schedule) => {
                                                    const colors =
                                                        getCategoryColors(
                                                            schedule.title,
                                                            schedule.subcategory_id,
                                                        );

                                                    return (
                                                        <DraggableSchedule
                                                            key={schedule.id}
                                                            schedule={schedule}
                                                            onClick={(
                                                                e: React.MouseEvent,
                                                            ) => {
                                                                e.stopPropagation();
                                                                openEditModal(
                                                                    schedule,
                                                                    calendarDay.date,
                                                                );
                                                            }}
                                                            className={`group relative cursor-pointer rounded p-1.5 text-xs transition-all hover:opacity-90 ${
                                                                schedule.is_done
                                                                    ? 'border border-emerald-500/30 bg-emerald-50/50 text-emerald-800 opacity-75 dark:bg-emerald-950/20 dark:text-emerald-300'
                                                                    : `${colors.bg} ${colors.text}`
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between gap-1">
                                                                <div className="flex min-w-0 flex-1 items-start gap-1.5">
                                                                    <TooltipProvider
                                                                        delayDuration={
                                                                            150
                                                                        }
                                                                    >
                                                                        <Tooltip>
                                                                            <TooltipTrigger
                                                                                asChild
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={
                                                                                        !!schedule.is_done
                                                                                    }
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) =>
                                                                                        e.stopPropagation()
                                                                                    }
                                                                                    onChange={async (
                                                                                        e,
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        await toggleScheduleDone(
                                                                                            schedule,
                                                                                            calendarDay.date,
                                                                                        );
                                                                                    }}
                                                                                    className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                                                />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                {schedule.is_done
                                                                                    ? 'Mark as incomplete'
                                                                                    : 'Mark as completed'}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                    <div className="min-w-0 flex-1">
                                                                        {schedule.study_time && (
                                                                            <span
                                                                                className={`mr-1.5 inline-block rounded-md bg-white/60 px-1.5 py-0.5 text-[10px] font-bold shadow-sm dark:bg-black/20 ${
                                                                                    schedule.is_done
                                                                                        ? 'text-emerald-700 dark:text-emerald-400'
                                                                                        : colors.time
                                                                                }`}
                                                                            >
                                                                                {schedule.study_time.substring(
                                                                                    0,
                                                                                    5,
                                                                                )}
                                                                            </span>
                                                                        )}
                                                                        <span
                                                                            className={`leading-tight font-medium break-words ${
                                                                                schedule.is_done
                                                                                    ? 'text-emerald-900/60 line-through decoration-emerald-500/50 dark:text-emerald-400/60'
                                                                                    : ''
                                                                            }`}
                                                                        >
                                                                            {
                                                                                schedule.title
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <TooltipProvider
                                                                    delayDuration={
                                                                        150
                                                                    }
                                                                >
                                                                    <Tooltip>
                                                                        <TooltipTrigger
                                                                            asChild
                                                                        >
                                                                            <button
                                                                                onClick={(
                                                                                    e,
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteSchedule(
                                                                                        schedule.id,
                                                                                        calendarDay.date,
                                                                                    );
                                                                                }}
                                                                                className="ml-1 hidden shrink-0 rounded p-0.5 group-hover:block hover:bg-red-100"
                                                                            >
                                                                                <Trash2 className="h-3 w-3 text-red-600" />
                                                                            </button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            Delete
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                            {schedule.description && (
                                                                <div
                                                                    className={`mt-1 text-xs ${
                                                                        schedule.is_done
                                                                            ? 'text-emerald-800/60 line-through decoration-emerald-500/30 dark:text-emerald-400/60'
                                                                            : colors.desc
                                                                    }`}
                                                                >
                                                                    {(() => {
                                                                        const desc =
                                                                            schedule.description.replace(
                                                                                /^Score:\s*[0-9.]+%?\s*-\s*/,
                                                                                '',
                                                                            );

                                                                        const linkRegex =
                                                                            /\[(.*?)\]\((.*?)\)/g;
                                                                        const links =
                                                                            [];
                                                                        const existingUrls =
                                                                            new Set();
                                                                        let match;

                                                                        while (
                                                                            (match =
                                                                                linkRegex.exec(
                                                                                    desc,
                                                                                )) !==
                                                                            null
                                                                        ) {
                                                                            links.push(
                                                                                {
                                                                                    title: match[1],
                                                                                    url: match[2],
                                                                                },
                                                                            );
                                                                            existingUrls.add(
                                                                                match[2],
                                                                            );
                                                                        }

                                                                        for (const mod of learnModules) {
                                                                            if (
                                                                                links.length >=
                                                                                3
                                                                            ) {
                                                                                break;
                                                                            }

                                                                            const modUrl = `/learn/${mod.slug}`;

                                                                            if (
                                                                                !existingUrls.has(
                                                                                    modUrl,
                                                                                )
                                                                            ) {
                                                                                if (
                                                                                    isModuleRelated(
                                                                                        mod,
                                                                                        schedule.title,
                                                                                        desc,
                                                                                    )
                                                                                ) {
                                                                                    links.push(
                                                                                        {
                                                                                            title: mod.title,
                                                                                            url: modUrl,
                                                                                            isAuto: true,
                                                                                        },
                                                                                    );
                                                                                    existingUrls.add(
                                                                                        modUrl,
                                                                                    );
                                                                                }
                                                                            }
                                                                        }

                                                                        let mainText =
                                                                            desc
                                                                                .replace(
                                                                                    /(?:\r?\n)+Links:[\s\S]*$/,
                                                                                    '',
                                                                                )
                                                                                .trim();
                                                                        mainText =
                                                                            mainText
                                                                                .replace(
                                                                                    /\[(.*?)\]\((.*?)\)/g,
                                                                                    '',
                                                                                )
                                                                                .trim();

                                                                        if (
                                                                            links.length >
                                                                            0
                                                                        ) {
                                                                            return (
                                                                                <>
                                                                                    <p className="line-clamp-3">
                                                                                        {
                                                                                            mainText
                                                                                        }
                                                                                    </p>
                                                                                    <div className="mt-1.5 flex flex-col gap-1">
                                                                                        {links.map(
                                                                                            (
                                                                                                l,
                                                                                                i,
                                                                                            ) => (
                                                                                                <Link
                                                                                                    key={
                                                                                                        i
                                                                                                    }
                                                                                                    href={
                                                                                                        l.url
                                                                                                    }
                                                                                                    className={`block w-full rounded px-1.5 py-1 text-[10px] font-bold break-words sm:text-xs ${
                                                                                                        schedule.is_done
                                                                                                            ? 'bg-emerald-50/20 text-emerald-700/60 line-through decoration-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400/60'
                                                                                                            : l.isAuto
                                                                                                              ? 'bg-amber-50 text-amber-700 hover:text-amber-900 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:text-amber-300'
                                                                                                              : 'bg-white/50 text-blue-700 hover:text-blue-900 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:text-blue-200'
                                                                                                    }`}
                                                                                                    onClick={(
                                                                                                        e,
                                                                                                    ) =>
                                                                                                        e.stopPropagation()
                                                                                                    }
                                                                                                >
                                                                                                    {l.isAuto
                                                                                                        ? '✨ '
                                                                                                        : '📖 '}
                                                                                                    Learn:{' '}
                                                                                                    {
                                                                                                        l.title
                                                                                                    }
                                                                                                </Link>
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                </>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <p className="line-clamp-3">
                                                                                {
                                                                                    mainText
                                                                                }
                                                                            </p>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}
                                                        </DraggableSchedule>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </DroppableDay>
                                ))}
                            </div>
                        ))}
                    </div>
                </DndContext>
            </div>
        </div>
    );
}
