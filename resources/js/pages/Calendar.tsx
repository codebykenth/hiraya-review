import { Head } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Lightbulb,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageContainer } from '@/components/page-container';
import { StudySuggestionsModal } from '@/components/study-suggestions-modal';
import { TimePicker } from '@/components/time-picker';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';

interface StudySchedule {
    id: number;
    user_id: number;
    study_date: string;
    study_time?: string;
    title: string;
    description?: string;
    subcategory_id?: number;
    created_at: string;
    updated_at: string;
}

interface Subcategory {
    id: number;
    name: string;
    category_id: number;
}

interface Suggestion {
    study_date: string;
    study_time: string;
    title: string;
    description: string;
    area_name: string;
    score: number;
    module_url?: string;
    module_title?: string;
}

interface WeakArea {
    name: string;
    score: number;
    sessions: number;
}

interface CalendarDay {
    date: string;
    day: number;
    isCurrentMonth: boolean;
    schedules: StudySchedule[];
}

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState<Map<string, StudySchedule[]>>(
        new Map(),
    );
    const [examDates, setExamDates] = useState<string[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        study_time: '',
        subcategory_id: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
    const [daysUntilExam, setDaysUntilExam] = useState(0);
    const [examDateStr, setExamDateStr] = useState('TBA');
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedTrack, setSelectedTrack] = useState('');
    const [selectedTimeOfDay, setSelectedTimeOfDay] = useState('Evening');
    const [topicsPerDay, setTopicsPerDay] = useState(1);

    const fetchSchedules = async () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        try {
            const response = await fetch(
                `/study-schedules?year=${year}&month=${month}`,
            );
            const data = await response.json();

            const schedulesMap = new Map<string, StudySchedule[]>();

            if (data.schedules) {
                Object.entries(data.schedules).forEach(([date, items]) => {
                    schedulesMap.set(date, items as StudySchedule[]);
                });
            }

            setSchedules(schedulesMap);
            setExamDates(data.examDates || []);
        } catch {
            setErrorMessage(
                'Failed to load your study schedules. Please try refreshing the page.',
            );
        }
    };

    useEffect(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        (async () => {
            try {
                const response = await fetch(
                    `/study-schedules?year=${year}&month=${month}`,
                );
                const data = await response.json();

                const schedulesMap = new Map<string, StudySchedule[]>();

                if (data.schedules) {
                    Object.entries(data.schedules).forEach(([date, items]) => {
                        schedulesMap.set(date, items as StudySchedule[]);
                    });
                }

                setSchedules(schedulesMap);
                setExamDates(data.examDates || []);
            } catch {
                setErrorMessage(
                    'Failed to load your study schedules. Please try refreshing the page.',
                );
            }

            try {
                const response = await fetch('/study-schedules/subcategories');
                const data = await response.json();
                setSubcategories(data.subcategories || []);
            } catch {
                setErrorMessage(
                    'Failed to load study subjects. Please try refreshing the page.',
                );
            }
        })();
    }, [currentDate]);

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getCalendarDays = (): CalendarDay[] => {
        const days: CalendarDay[] = [];
        const daysCount = daysInMonth(currentDate);
        const firstDay = firstDayOfMonth(currentDate);
        const prevMonthDays = daysInMonth(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
        );

        // Previous month's days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const prevMonth = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() - 1,
            );
            const dateStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            days.push({
                date: dateStr,
                day,
                isCurrentMonth: false,
                schedules: schedules.get(dateStr) || [],
            });
        }

        // Current month's days
        for (let i = 1; i <= daysCount; i++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            days.push({
                date: dateStr,
                day: i,
                isCurrentMonth: true,
                schedules: schedules.get(dateStr) || [],
            });
        }

        // Next month's days
        const remainingDays = 42 - days.length;
        const nextMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
        );

        for (let i = 1; i <= remainingDays; i++) {
            const dateStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            days.push({
                date: dateStr,
                day: i,
                isCurrentMonth: false,
                schedules: schedules.get(dateStr) || [],
            });
        }

        return days;
    };

    const previousMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
        );
    };

    const nextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
        );
    };

    const openModal = (date: string) => {
        setSelectedDate(date);
        setFormData({
            title: '',
            description: '',
            study_time: '',
            subcategory_id: '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        setFormData({
            title: '',
            description: '',
            study_time: '',
            subcategory_id: '',
        });
    };

    const handleAddStudy = async () => {
        if (!formData.title || !selectedDate) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/study-schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    study_date: selectedDate,
                    study_time: formData.study_time || null,
                    title: formData.title,
                    description: formData.description,
                    subcategory_id: formData.subcategory_id || null,
                }),
            });

            if (response.ok) {
                const newSchedule = await response.json();
                const updated = new Map(schedules);
                const dateSchedules = updated.get(selectedDate) || [];
                updated.set(selectedDate, [...dateSchedules, newSchedule]);
                setSchedules(updated);
                closeModal();
            }
        } catch {
            setErrorMessage(
                'An error occurred while trying to add the study session. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId: number, date: string) => {
        try {
            const response = await fetch(`/study-schedules/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const updated = new Map(schedules);
                const dateSchedules = updated.get(date) || [];
                updated.set(
                    date,
                    dateSchedules.filter((s) => s.id !== scheduleId),
                );
                setSchedules(updated);
            }
        } catch {
            setErrorMessage(
                'Failed to delete the study session. Please check your connection and try again.',
            );
        }
    };

    const applySuggestions = async (suggestionsToApply: Suggestion[]) => {
        try {
            const response = await fetch('/study-suggestions/apply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    suggestions: suggestionsToApply,
                }),
            });

            if (response.ok) {
                await fetchSchedules();
                setIsSuggestionsOpen(false);
            } else {
                const errorData = await response.json();
                setErrorMessage(
                    'Could not apply schedule: ' +
                        (errorData.message || 'Unknown validation error.'),
                );
            }
        } catch {
            setErrorMessage(
                'Failed to connect to the server while applying your schedule. Please try again.',
            );
        }
    };

    const getCategoryColors = (title: string) => {
        const t = title.toLowerCase();

        if (t.includes('verbal')) {
            return {
                bg: 'bg-indigo-100',
                text: 'text-indigo-900',
                time: 'text-indigo-700',
                desc: 'text-indigo-800',
            };
        }

        if (
            t.includes('numerical') ||
            t.includes('math') ||
            t.includes('pemdas')
        ) {
            return {
                bg: 'bg-emerald-100',
                text: 'text-emerald-900',
                time: 'text-emerald-700',
                desc: 'text-emerald-800',
            };
        }

        if (t.includes('analytical') || t.includes('logic')) {
            return {
                bg: 'bg-amber-100',
                text: 'text-amber-900',
                time: 'text-amber-700',
                desc: 'text-amber-800',
            };
        }

        if (
            t.includes('clerical') ||
            t.includes('filing') ||
            t.includes('alphabetizing')
        ) {
            return {
                bg: 'bg-purple-100',
                text: 'text-purple-900',
                time: 'text-purple-700',
                desc: 'text-purple-800',
            };
        }

        if (t.includes('general info') || t.includes('constitution')) {
            return {
                bg: 'bg-rose-100',
                text: 'text-rose-900',
                time: 'text-rose-700',
                desc: 'text-rose-800',
            };
        }

        return {
            bg: 'bg-blue-100',
            text: 'text-blue-900',
            time: 'text-blue-700',
            desc: 'text-blue-800',
        };
    };

    const calendarDays = getCalendarDays();
    const weeks = [];

    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const isToday = (dateStr: string) => dateStr === todayStr;

    return (
        <>
            <Head title="Study Calendar" />
            <PageContainer>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900">
                        Study Calendar
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Plan your study sessions by clicking on a date
                    </p>
                </div>

                <Card className="bg-white p-6">
                    {/* Header with navigation */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <select
                                value={currentDate.getMonth()}
                                onChange={(e) => {
                                    setCurrentDate(
                                        new Date(
                                            currentDate.getFullYear(),
                                            parseInt(e.target.value),
                                            1,
                                        ),
                                    );
                                }}
                                className="cursor-pointer appearance-none rounded border-none bg-transparent py-1 pr-6 pl-2 text-xl font-semibold text-slate-900 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundImage:
                                        'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e293b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.5rem top 55%',
                                    backgroundSize: '0.65rem auto',
                                }}
                            >
                                {[
                                    'January',
                                    'February',
                                    'March',
                                    'April',
                                    'May',
                                    'June',
                                    'July',
                                    'August',
                                    'September',
                                    'October',
                                    'November',
                                    'December',
                                ].map((m, i) => (
                                    <option key={m} value={i}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={currentDate.getFullYear()}
                                onChange={(e) => {
                                    setCurrentDate(
                                        new Date(
                                            parseInt(e.target.value),
                                            currentDate.getMonth(),
                                            1,
                                        ),
                                    );
                                }}
                                className="cursor-pointer appearance-none rounded border-none bg-transparent py-1 pr-6 pl-2 text-xl font-semibold text-slate-900 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-blue-500"
                                style={{
                                    backgroundImage:
                                        'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%231e293b%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.5rem top 55%',
                                    backgroundSize: '0.65rem auto',
                                }}
                            >
                                {Array.from(
                                    { length: 11 },
                                    (_, i) => new Date().getFullYear() - 3 + i,
                                ).map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsSuggestionsOpen(true)}
                                disabled={isLoadingSuggestions}
                                className="bg-amber-50 hover:bg-amber-100"
                            >
                                <Lightbulb className="mr-2 h-4 w-4 text-amber-600" />
                                {isLoadingSuggestions
                                    ? 'Analyzing...'
                                    : 'Suggest Study Plan'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsResetModalOpen(true)}
                                className="border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Reset Calendar
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={previousMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={nextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="mb-2 grid grid-cols-7 gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day) => (
                                <div
                                    key={day}
                                    className="flex items-center justify-center font-semibold text-slate-600"
                                >
                                    {day}
                                </div>
                            ),
                        )}
                    </div>

                    {/* Calendar grid */}
                    <div className="space-y-2">
                        {weeks.map((week, weekIndex) => (
                            <div
                                key={weekIndex}
                                className="grid grid-cols-7 gap-2"
                            >
                                {week.map((calendarDay) => (
                                    <div
                                        key={calendarDay.date}
                                        className={`relative flex min-h-24 flex-col rounded-lg border p-2 ${
                                            examDates.includes(calendarDay.date)
                                                ? 'border-red-400 bg-red-50'
                                                : isToday(calendarDay.date)
                                                  ? 'border-blue-400 bg-blue-50'
                                                  : calendarDay.isCurrentMonth
                                                    ? 'border-slate-200 bg-white'
                                                    : 'border-slate-100 bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-sm font-semibold ${
                                                    examDates.includes(
                                                        calendarDay.date,
                                                    )
                                                        ? 'text-red-900'
                                                        : isToday(
                                                                calendarDay.date,
                                                            )
                                                          ? 'text-blue-900'
                                                          : calendarDay.isCurrentMonth
                                                            ? 'text-slate-900'
                                                            : 'text-slate-400'
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
                                            {calendarDay.isCurrentMonth && (
                                                <button
                                                    onClick={() =>
                                                        openModal(
                                                            calendarDay.date,
                                                        )
                                                    }
                                                    className="rounded p-1 hover:bg-blue-50"
                                                    title="Add study item"
                                                >
                                                    <Plus className="h-4 w-4 text-blue-600" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Study items for this day */}
                                        <div className="mt-2 flex-1 space-y-1 overflow-y-auto">
                                            {calendarDay.schedules.map(
                                                (schedule) => {
                                                    const colors =
                                                        getCategoryColors(
                                                            schedule.title,
                                                        );

                                                    return (
                                                        <div
                                                            key={schedule.id}
                                                            className={`group relative rounded p-1.5 text-xs ${colors.bg} ${colors.text}`}
                                                        >
                                                            <div className="flex items-start justify-between gap-1">
                                                                <div className="flex-1">
                                                                    {schedule.study_time && (
                                                                        <span
                                                                            className={`mr-1.5 inline-block rounded-md bg-white/60 px-1.5 py-0.5 text-[10px] font-bold shadow-sm ${colors.time}`}
                                                                        >
                                                                            {schedule.study_time.substring(
                                                                                0,
                                                                                5,
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                    <span className="leading-tight font-medium break-words">
                                                                        {
                                                                            schedule.title
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteSchedule(
                                                                            schedule.id,
                                                                            calendarDay.date,
                                                                        )
                                                                    }
                                                                    className="ml-1 hidden shrink-0 group-hover:block"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="h-3 w-3 text-red-600" />
                                                                </button>
                                                            </div>
                                                            {schedule.description && (
                                                                <div
                                                                    className={`mt-1 text-xs ${colors.desc}`}
                                                                >
                                                                    {(() => {
                                                                        const desc =
                                                                            schedule.description.replace(
                                                                                /^Score:\s*[0-9.]+%?\s*-\s*/,
                                                                                '',
                                                                            );

                                                                        // Extract links anywhere in the description
                                                                        const linkRegex =
                                                                            /\[(.*?)\]\((.*?)\)/g;
                                                                        const links =
                                                                            [];
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
                                                                        }

                                                                        // Remove the 'Links:' section and raw markdown links from the visible description
                                                                        let mainText =
                                                                            desc
                                                                                .replace(
                                                                                    /(?:\r?\n)+Links:[\s\S]*$/,
                                                                                    '',
                                                                                )
                                                                                .trim();
                                                                        // Fallback cleanup if the above doesn't catch it
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
                                                                                                <a
                                                                                                    key={
                                                                                                        i
                                                                                                    }
                                                                                                    href={
                                                                                                        l.url
                                                                                                    }
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="inline-flex w-fit items-center rounded bg-white/50 px-1.5 py-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                                                                                                    onClick={(
                                                                                                        e,
                                                                                                    ) =>
                                                                                                        e.stopPropagation()
                                                                                                    }
                                                                                                >
                                                                                                    📖
                                                                                                    Learn:{' '}
                                                                                                    {
                                                                                                        l.title
                                                                                                    }
                                                                                                </a>
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
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Add Study Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Study Item</DialogTitle>
                            {selectedDate && (
                                <p className="mt-2 text-sm text-slate-600">
                                    {new Date(
                                        selectedDate + 'T00:00:00',
                                    ).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            )}
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-900">
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
                                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900">
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
                                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-900">
                                    Study Time (optional)
                                </label>
                                <div className="mt-2">
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

                            <div>
                                <label className="block text-sm font-medium text-slate-900">
                                    Subject (optional)
                                </label>
                                <select
                                    value={formData.subcategory_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            subcategory_id: e.target.value,
                                        })
                                    }
                                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">
                                        Select a subject...
                                    </option>
                                    {subcategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                {isLoading ? 'Adding...' : 'Add Study'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reset Calendar Modal */}
                <Dialog
                    open={isResetModalOpen}
                    onOpenChange={setIsResetModalOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-red-600">
                                Reset Calendar
                            </DialogTitle>
                            <p className="mt-2 text-sm text-slate-600">
                                Are you sure you want to delete all study
                                sessions from your calendar? This action cannot
                                be undone.
                            </p>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() => {
                                    setIsLoading(true);
                                    fetch('/study-schedules/reset', {
                                        method: 'DELETE',
                                        headers: {
                                            'X-CSRF-TOKEN':
                                                document
                                                    .querySelector(
                                                        'meta[name="csrf-token"]',
                                                    )
                                                    ?.getAttribute('content') ||
                                                '',
                                        },
                                    }).then(() => {
                                        fetchSchedules();
                                        setIsResetModalOpen(false);
                                        setIsLoading(false);
                                    });
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Yes, Delete All'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Error Modal */}
                <Dialog
                    open={!!errorMessage}
                    onOpenChange={(open) => !open && setErrorMessage(null)}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">
                                Error
                            </DialogTitle>
                            <p className="mt-2 text-sm text-slate-600">
                                {errorMessage}
                            </p>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                onClick={() => setErrorMessage(null)}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                Dismiss
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Study Suggestions Modal */}
                <StudySuggestionsModal
                    isOpen={isSuggestionsOpen}
                    onClose={() => setIsSuggestionsOpen(false)}
                    suggestions={suggestions}
                    weakAreas={weakAreas}
                    daysUntilExam={daysUntilExam}
                    examDateStr={examDateStr}
                    onApply={applySuggestions}
                    isLoading={isLoadingSuggestions}
                    selectedTrack={selectedTrack}
                    selectedTimeOfDay={selectedTimeOfDay}
                    selectedTopicsPerDay={topicsPerDay}
                    onFilterChange={(track, timeOfDay, topicsCount) => {
                        setSelectedTrack(track);
                        setSelectedTimeOfDay(timeOfDay);
                        setTopicsPerDay(topicsCount);
                        setIsLoadingSuggestions(true);
                        fetch(
                            `/study-suggestions?track=${track}&time_of_day=${timeOfDay}&topics_per_day=${topicsCount}`,
                        )
                            .then((res) => res.json())
                            .then((data) => {
                                setSuggestions(data.suggestions || []);
                                setWeakAreas(data.weak_areas || []);
                                setDaysUntilExam(data.days_until_exam || 0);

                                if (data.exam_date) {
                                    setExamDateStr(data.exam_date);
                                }
                            })
                            .catch(() =>
                                setErrorMessage(
                                    'Failed to fetch updated suggestions based on your filters.',
                                ),
                            )
                            .finally(() => setIsLoadingSuggestions(false));
                    }}
                />
            </PageContainer>
        </>
    );
}
Calendar.layout = {
    breadcrumbs: [
        {
            title: 'Study Plan',
            href: '/calendar',
        },
    ],
};
