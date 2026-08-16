import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
    StudySchedule,
    Subcategory,
    LearnModule,
    CalendarDay,
    AttachedModule,
} from '../types';

export interface CalendarPageProps {
    schedules: Record<string, StudySchedule[]>;
    examDates: string[];
    pastPending: StudySchedule[];
    nextExam: {
        date: string;
        description: string;
        days_remaining: number;
    } | null;
}

export const categoryNames: Record<number, string> = {
    1: 'General Information',
    2: 'Verbal Ability',
    3: 'Analytical Ability',
    4: 'Numerical Ability',
    5: 'Clerical Ability',
};

export const mainCategories = [
    { id: 1, name: 'General Information' },
    { id: 2, name: 'Verbal Ability' },
    { id: 3, name: 'Analytical Ability' },
    { id: 4, name: 'Numerical Ability' },
    { id: 5, name: 'Clerical Ability' },
];

export function useCalendarState(initialProps: CalendarPageProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWeekDate, setSelectedWeekDate] = useState(new Date());
    const [activeView, setActiveView] = useState<'month' | 'week' | 'agenda'>(
        'month',
    );
    const [selectedCategory, setSelectedCategory] = useState<'all' | number>(
        'all',
    );

    const initialSchedulesMap = useMemo(() => {
        const map = new Map<string, StudySchedule[]>();

        if (initialProps.schedules) {
            Object.entries(initialProps.schedules).forEach(([date, items]) => {
                map.set(date, items);
            });
        }

        return map;
    }, [initialProps.schedules]);
    const [schedules, setSchedules] =
        useState<Map<string, StudySchedule[]>>(initialSchedulesMap);
    const [examDates, setExamDates] = useState<string[]>(
        initialProps.examDates ?? [],
    );
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [learnModules, setLearnModules] = useState<LearnModule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'danger',
        onConfirm: () => {},
    });
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        study_time: '',
        subcategory_id: '',
        is_done: false,
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editScheduleId, setEditScheduleId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [attachedModules, setAttachedModules] = useState<AttachedModule[]>(
        [],
    );
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [selectedStudyTask, setSelectedStudyTask] = useState<{
        task: StudySchedule;
        dateStr: string;
    } | null>(null);
    const [isStudyDrawerOpen, setIsStudyDrawerOpen] = useState(false);
    const [selectedDayDetails, setSelectedDayDetails] = useState<{
        dateStr: string;
        schedules: StudySchedule[];
    } | null>(null);
    const [isDaySheetOpen, setIsDaySheetOpen] = useState(false);
    const [bulkFormData, setBulkFormData] = useState({
        category_id: '',
        study_time: '',
        start_date: '',
        end_date: '',
    });
    const monthCacheRef = useRef<Map<string, any>>(new Map());
    const isInitialMount = useRef(true);

    const isSnoozed = useCallback(() => {
        if (typeof window === 'undefined') {
return false;
}

        try {
            const snoozedUntil = localStorage.getItem('study_plan_reminder_snoozed_until');

            if (snoozedUntil && new Date(snoozedUntil).getTime() > Date.now()) {
                return true;
            }
        } catch {
            return false;
        }

        return false;
    }, []);

    const [nextExam, setNextExam] = useState<{
        date: string;
        description: string;
        days_remaining: number;
    } | null>(initialProps.nextExam ?? null);
    const [pastPending, setPastPending] = useState<StudySchedule[]>(
        initialProps.pastPending ?? [],
    );
    const [isReminderOpen, setIsReminderOpen] = useState(
        (initialProps.pastPending ?? []).length > 0 && !isSnoozed(),
    );
    const [hasShownReminder, setHasShownReminder] = useState(
        (initialProps.pastPending ?? []).length > 0 && !isSnoozed(),
    );

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const fetchSchedules = useCallback(
        async (forceRefetch = false) => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            const cacheKey = `${year}-${month}`;

            if (!forceRefetch && monthCacheRef.current.has(cacheKey)) {
                const data = monthCacheRef.current.get(cacheKey);
                const schedulesMap = new Map<string, StudySchedule[]>();

                if (data.schedules) {
                    Object.entries(data.schedules).forEach(([date, items]) => {
                        schedulesMap.set(date, items as StudySchedule[]);
                    });
                }

                setSchedules(schedulesMap);
                setExamDates(data.examDates || []);
                setNextExam(data.nextExam || null);

                if (data.pastPending && data.pastPending.length > 0) {
                    setPastPending(data.pastPending);
                }

                return;
            }

            try {
                const response = await fetch(
                    `/study-schedules/data?year=${year}&month=${month}`,
                );
                const data = await response.json();

                monthCacheRef.current.set(cacheKey, data);

                const schedulesMap = new Map<string, StudySchedule[]>();

                if (data.schedules) {
                    Object.entries(data.schedules).forEach(([date, items]) => {
                        schedulesMap.set(date, items as StudySchedule[]);
                    });
                }

                setSchedules(schedulesMap);
                setExamDates(data.examDates || []);
                setNextExam(data.nextExam || null);

                if (data.pastPending && data.pastPending.length > 0) {
                    setPastPending(data.pastPending);

                    if (!hasShownReminder && !isSnoozed()) {
                        setIsReminderOpen(true);
                        setHasShownReminder(true);
                    }
                }
            } catch {
                setErrorMessage(
                    'Failed to load your study schedules. Please try refreshing the page.',
                );
            }
        },
        [currentDate, hasShownReminder, isSnoozed],
    );

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            fetchSchedules();
        }

        if (subcategories.length === 0) {
            (async () => {
                try {
                    const response = await fetch(
                        '/study-schedules/subcategories',
                    );
                    const data = await response.json();
                    setSubcategories(data.subcategories || []);
                    setLearnModules(data.modules || []);
                } catch {
                    setErrorMessage(
                        'Failed to load study subjects. Please try refreshing the page.',
                    );
                }
            })();
        }
    }, [currentDate, fetchSchedules, subcategories.length]);

    const getScheduleCategoryId = useCallback(
        (schedule: StudySchedule): number | null => {
            if (schedule.subcategory_id && subcategories.length > 0) {
                const sub = subcategories.find(
                    (s) => s.id === schedule.subcategory_id,
                );

                if (sub) {
                    return sub.category_id;
                }
            }

            const titleLower = schedule.title.toLowerCase();

            if (
                titleLower.includes('numerical') ||
                titleLower.includes('math') ||
                titleLower.includes('fraction') ||
                titleLower.includes('pemdas') ||
                titleLower.includes('operation')
            ) {
                return 4;
            }

            if (
                titleLower.includes('verbal') ||
                titleLower.includes('grammar') ||
                titleLower.includes('vocabulary') ||
                titleLower.includes('reading') ||
                titleLower.includes('comprehension')
            ) {
                return 2;
            }

            if (
                titleLower.includes('analytical') ||
                titleLower.includes('logic') ||
                titleLower.includes('abstract') ||
                titleLower.includes('reasoning')
            ) {
                return 3;
            }

            if (
                titleLower.includes('clerical') ||
                titleLower.includes('filing') ||
                titleLower.includes('alphabetizing') ||
                titleLower.includes('spelling')
            ) {
                return 5;
            }

            if (
                titleLower.includes('constitution') ||
                titleLower.includes('general info') ||
                titleLower.includes('philippine') ||
                titleLower.includes('ra 6713') ||
                titleLower.includes('conduct') ||
                titleLower.includes('environment')
            ) {
                return 1;
            }

            return null;
        },
        [subcategories],
    );

    const filterScheduleByCategory = useCallback(
        (schedule: StudySchedule): boolean => {
            if (selectedCategory === 'all') {
                return true;
            }

            const catId = getScheduleCategoryId(schedule);

            return catId === selectedCategory;
        },
        [selectedCategory, getScheduleCategoryId],
    );

    const daysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const calendarDays = useMemo((): CalendarDay[] => {
        const days: CalendarDay[] = [];
        const daysCount = daysInMonth(currentDate);
        const firstDay = firstDayOfMonth(currentDate);
        const prevMonthDays = daysInMonth(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
        );

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

        for (let i = 1; i <= daysCount; i++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

            days.push({
                date: dateStr,
                day: i,
                isCurrentMonth: true,
                schedules: schedules.get(dateStr) || [],
            });
        }

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
    }, [currentDate, schedules]);

    const weeks = useMemo(() => {
        const result = [];

        for (let i = 0; i < calendarDays.length; i += 7) {
            result.push(calendarDays.slice(i, i + 7));
        }

        return result;
    }, [calendarDays]);

    // Calculate the 7 days of the selected week for WeekView
    const currentWeekDays = useMemo((): CalendarDay[] => {
        const curr = new Date(selectedWeekDate);
        const dayOfWeek = curr.getDay(); // 0 is Sunday
        const sunday = new Date(curr);
        sunday.setDate(curr.getDate() - dayOfWeek);

        const days: CalendarDay[] = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date(sunday);
            d.setDate(sunday.getDate() + i);

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const dayNum = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${dayNum}`;

            const daySchedules = (schedules.get(dateStr) || []).filter(
                filterScheduleByCategory,
            );

            days.push({
                day: d.getDate(),
                isCurrentMonth: d.getMonth() === currentDate.getMonth(),
                date: dateStr,
                schedules: daySchedules,
            });
        }

        return days;
    }, [
        selectedWeekDate,
        schedules,
        filterScheduleByCategory,
        currentDate,
    ]);

    const weekRangeLabel = useMemo(() => {
        if (currentWeekDays.length < 7) {
            return '';
        }

        const start = new Date(currentWeekDays[0].date + 'T00:00:00');
        const end = new Date(currentWeekDays[6].date + 'T00:00:00');

        const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = end.toLocaleDateString('en-US', { month: 'short' });

        if (startMonth === endMonth) {
            return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
        }

        return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    }, [currentWeekDays]);

    const previousWeek = () => {
        const prev = new Date(selectedWeekDate);
        prev.setDate(prev.getDate() - 7);
        setSelectedWeekDate(prev);

        // Keep currentDate month in sync if week crosses into another month
        if (prev.getMonth() !== currentDate.getMonth()) {
            setCurrentDate(new Date(prev.getFullYear(), prev.getMonth(), 1));
        }
    };

    const nextWeek = () => {
        const next = new Date(selectedWeekDate);
        next.setDate(next.getDate() + 7);
        setSelectedWeekDate(next);

        // Keep currentDate month in sync if week crosses into another month
        if (next.getMonth() !== currentDate.getMonth()) {
            setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
        }
    };

    const jumpToTodayWeek = () => {
        const now = new Date();
        setSelectedWeekDate(now);
        setCurrentDate(now);
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
        setIsEditMode(false);
        setEditScheduleId(null);
        setAttachedModules([]);
        setIsSubjectDropdownOpen(false);
        setSubjectSearch('');
        setFormData({
            title: '',
            description: '',
            study_time: '',
            subcategory_id: '',
            is_done: false,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (schedule: StudySchedule, date: string) => {
        setSelectedDate(date);
        setIsEditMode(true);
        setEditScheduleId(schedule.id);

        const descText = schedule.description || '';
        const parsedLinks: AttachedModule[] = [];
        const linkRegex = /\[(.*?)\]\(\/learn\/(.*?)\)/g;
        let match;

        while ((match = linkRegex.exec(descText)) !== null) {
            parsedLinks.push({ title: match[1], slug: match[2] });
        }

        let cleanDesc = descText.replace(/(?:\r?\n)+Links:[\s\S]*$/, '').trim();
        cleanDesc = cleanDesc
            .replace(/\[(.*?)\]\(\/learn\/(.*?)\)/g, '')
            .trim();

        setAttachedModules(parsedLinks);
        setIsSubjectDropdownOpen(false);
        setSubjectSearch('');
        setFormData({
            title: schedule.title,
            description: cleanDesc,
            study_time: schedule.study_time
                ? schedule.study_time.substring(0, 5)
                : '',
            subcategory_id: schedule.subcategory_id
                ? schedule.subcategory_id.toString()
                : '',
            is_done: !!schedule.is_done,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
        setIsEditMode(false);
        setEditScheduleId(null);
        setAttachedModules([]);
        setIsSubjectDropdownOpen(false);
        setSubjectSearch('');
        setFormData({
            title: '',
            description: '',
            study_time: '',
            subcategory_id: '',
            is_done: false,
        });
    };

    const handleBulkUpdateTime = async () => {
        setIsLoading(true);

        try {
            const response = await fetch('/study-schedules/bulk-time', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(bulkFormData),
            });

            if (response.ok) {
                monthCacheRef.current.clear();
                await fetchSchedules(true);
                setIsBulkModalOpen(false);
            } else {
                const data = await response.json();
                setErrorMessage(data.message || 'Failed to bulk update time.');
            }
        } catch {
            setErrorMessage('An error occurred during bulk update.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStudy = async () => {
        if (!formData.title || !selectedDate) {
            return;
        }

        setIsLoading(true);

        try {
            const url =
                isEditMode && editScheduleId
                    ? `/study-schedules/${editScheduleId}`
                    : '/study-schedules';
            const method = isEditMode ? 'PUT' : 'POST';

            let finalDescription = formData.description.trim();

            if (attachedModules.length > 0) {
                const linksMarkdown = attachedModules
                    .map((mod) => `[${mod.title}](/learn/${mod.slug})`)
                    .join('\n');
                finalDescription = finalDescription
                    ? `${finalDescription}\n\n${linksMarkdown}`
                    : linksMarkdown;
            }

            const response = await fetch(url, {
                method,
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
                    description: finalDescription || null,
                    subcategory_id: formData.subcategory_id || null,
                    is_done: formData.is_done,
                }),
            });

            if (response.ok) {
                monthCacheRef.current.clear();

                if (isEditMode) {
                    fetchSchedules(true);
                } else {
                    const newSchedule = await response.json();
                    const updated = new Map(schedules);
                    const dateSchedules = updated.get(selectedDate) || [];
                    updated.set(selectedDate, [...dateSchedules, newSchedule]);
                    setSchedules(updated);
                }

                closeModal();
            } else {
                const errData = await response.json();

                if (response.status === 409 && errData.duplicate) {
                    const duplicate = errData.duplicate;
                    setErrorMessage(
                        `Duplicate study item: "${duplicate.title}" already exists on ${duplicate.study_date}. Please use a different title or edit the existing item.`,
                    );
                } else if (errData.errors) {
                    const firstError = Object.values(errData.errors)[0];
                    setErrorMessage(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : String(firstError),
                    );

                    const updatedForm = { ...formData };
                    Object.keys(errData.errors).forEach((key) => {
                        if (key in updatedForm) {
                            (updatedForm as any)[key] = '';
                        }
                    });
                    setFormData(updatedForm);
                } else {
                    setErrorMessage(errData.message || 'An error occurred.');
                }
            }
        } catch {
            setErrorMessage(
                isEditMode
                    ? 'An error occurred while trying to update the study session. Please try again.'
                    : 'An error occurred while trying to add the study session. Please try again.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId: number, date: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Study Session',
            message: 'Are you sure you want to delete this study session?',
            confirmLabel: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    const response = await fetch(
                        `/study-schedules/${scheduleId}`,
                        {
                            method: 'DELETE',
                            headers: {
                                'X-CSRF-TOKEN':
                                    document
                                        .querySelector(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.getAttribute('content') || '',
                            },
                        },
                    );

                    if (response.ok) {
                        monthCacheRef.current.clear();
                        const updated = new Map(schedules);
                        const dateSchedules = updated.get(date) || [];
                        updated.set(
                            date,
                            dateSchedules.filter((s) => s.id !== scheduleId),
                        );
                        setSchedules(updated);
                        setPastPending((prev) =>
                            prev.filter((s) => s.id !== scheduleId),
                        );
                    }
                } catch {
                    setErrorMessage(
                        'Failed to delete the study session. Please check your connection and try again.',
                    );
                }
            },
        });
    };

    const toggleScheduleDone = async (
        schedule: StudySchedule,
        date: string,
    ) => {
        try {
            const newDoneState = !schedule.is_done;
            const targetDate = date || schedule.study_date || todayStr;
            const response = await fetch(`/study-schedules/${schedule.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    study_date: targetDate,
                    study_time: schedule.study_time
                        ? schedule.study_time.substring(0, 5)
                        : null,
                    title: schedule.title,
                    description: schedule.description || null,
                    subcategory_id: schedule.subcategory_id || null,
                    is_done: newDoneState,
                }),
            });

            if (response.ok) {
                monthCacheRef.current.clear();
                const updated = new Map(schedules);
                const dateSchedules = updated.get(targetDate) || [];
                updated.set(
                    targetDate,
                    dateSchedules.map((s) =>
                        s.id === schedule.id
                            ? { ...s, is_done: newDoneState }
                            : s,
                    ),
                );
                setSchedules(updated);

                // Update pastPending state so overdue list reflects change immediately
                setPastPending((prev) =>
                    newDoneState
                        ? prev.filter((s) => s.id !== schedule.id)
                        : prev.map((s) =>
                              s.id === schedule.id
                                  ? { ...s, is_done: newDoneState }
                                  : s,
                          ),
                );
            } else {
                const data = await response.json().catch(() => ({}));
                setErrorMessage(
                    data.message || 'Failed to update study item. Please try again.',
                );
            }
        } catch {
            setErrorMessage('Failed to update study item. Please try again.');
        }
    };

    const handleRescheduleToToday = async (schedule: StudySchedule) => {
        try {
            const response = await fetch(`/study-schedules/${schedule.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    study_date: todayStr,
                    study_time: schedule.study_time
                        ? schedule.study_time.substring(0, 5)
                        : null,
                    title: schedule.title,
                    description: schedule.description || null,
                    subcategory_id: schedule.subcategory_id || null,
                    is_done: false,
                }),
            });

            if (response.ok) {
                monthCacheRef.current.clear();
                await fetchSchedules(true);
                setPastPending((prev) =>
                    prev.filter((s) => s.id !== schedule.id),
                );
            }
        } catch {
            setErrorMessage(
                'Failed to reschedule study item. Please try again.',
            );
        }
    };

    const pendingUpdates = useRef<
        Map<number, { schedule: StudySchedule; newDate: string }>
    >(new Map());
    const saveTimer = useRef<NodeJS.Timeout | null>(null);

    const handleDragSchedule = async (
        schedule: StudySchedule,
        sourceDate: string,
        newDate: string,
    ) => {
        if (sourceDate === newDate) {
            return;
        }

        // Optimistic update
        const updated = new Map(schedules);
        const sourceSchedules = updated.get(sourceDate) || [];
        const targetSchedules = updated.get(newDate) || [];

        updated.set(
            sourceDate,
            sourceSchedules.filter((s) => s.id !== schedule.id),
        );
        updated.set(newDate, [
            ...targetSchedules,
            { ...schedule, study_date: newDate },
        ]);
        setSchedules(updated);

        // Debounce backend synchronization to prevent spamming the database
        pendingUpdates.current.set(schedule.id, { schedule, newDate });

        if (saveTimer.current) {
            clearTimeout(saveTimer.current);
        }

        saveTimer.current = setTimeout(async () => {
            const updatesToProcess = new Map(pendingUpdates.current);
            pendingUpdates.current.clear();
            let hasError = false;

            try {
                const promises = Array.from(updatesToProcess.entries()).map(
                    ([id, data]) => {
                        return fetch(`/study-schedules/${id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN':
                                    document
                                        .querySelector(
                                            'meta[name="csrf-token"]',
                                        )
                                        ?.getAttribute('content') || '',
                            },
                            body: JSON.stringify({
                                study_date: data.newDate,
                                study_time: data.schedule.study_time
                                    ? data.schedule.study_time.substring(0, 5)
                                    : null,
                                title: data.schedule.title,
                                description: data.schedule.description || null,
                                subcategory_id:
                                    data.schedule.subcategory_id || null,
                                is_done: data.schedule.is_done,
                            }),
                        });
                    },
                );

                const responses = await Promise.all(promises);

                if (responses.some((r) => !r.ok)) {
                    hasError = true;
                } else {
                    monthCacheRef.current.clear();
                }
            } catch {
                hasError = true;
            } finally {
                if (hasError) {
                    setErrorMessage(
                        'Failed to save some dragged items. Synchronizing with server.',
                    );
                }

                // Always refresh from the backend once the batch finishes
                await fetchSchedules(true);
            }
        }, 1500); // 1.5 second debounce delay
    };

    const handleResetAll = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Reset Calendar',
            message:
                'Are you sure you want to delete all study sessions from your calendar? This action cannot be undone.',
            confirmLabel: 'Yes, Delete All',
            variant: 'danger',
            onConfirm: () => {
                setIsLoading(true);
                fetch('/study-schedules/reset', {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                }).then(() => {
                    monthCacheRef.current.clear();
                    fetchSchedules(true);
                    setIsLoading(false);
                });
            },
        });
    };

    const [selectedScheduleIds, setSelectedScheduleIds] = useState<number[]>(
        [],
    );

    const toggleSelectSchedule = useCallback((id: number) => {
        setSelectedScheduleIds((prev) =>
            prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
        );
    }, []);

    const selectAllSchedules = useCallback((ids: number[]) => {
        setSelectedScheduleIds(ids);
    }, []);

    const deselectAllSchedules = useCallback(() => {
        setSelectedScheduleIds([]);
    }, []);

    const handleBulkDelete = useCallback(
        async ({
            ids,
            scope,
            date,
            title = 'Delete Study Sessions',
        }: {
            ids?: number[];
            scope?: 'overdue' | 'completed' | 'date';
            date?: string;
            title?: string;
        }) => {
            const count = ids ? ids.length : scope === 'overdue' ? pastPending.length : 0;
            const countText =
                count > 0
                    ? `${count} study session${count > 1 ? 's' : ''}`
                    : 'these study sessions';

            setConfirmModal({
                isOpen: true,
                title,
                message: `Are you sure you want to permanently delete ${countText}? This action cannot be undone.`,
                confirmLabel: `Delete ${count > 0 ? count : ''} Session${count === 1 ? '' : 's'}`,
                variant: 'danger',
                onConfirm: async () => {
                    setIsLoading(true);

                    try {
                        const response = await fetch(
                            '/study-schedules/bulk-delete',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN':
                                        document
                                            .querySelector(
                                                'meta[name="csrf-token"]',
                                            )
                                            ?.getAttribute('content') || '',
                                },
                                body: JSON.stringify({
                                    ids: ids || [],
                                    scope,
                                    date,
                                }),
                            },
                        );

                        if (response.ok) {
                            monthCacheRef.current.clear();
                            await fetchSchedules(true);

                            if (ids && ids.length > 0) {
                                setPastPending((prev) =>
                                    prev.filter((s) => !ids.includes(s.id)),
                                );
                            } else if (scope === 'overdue') {
                                setPastPending([]);
                            }

                            setSelectedScheduleIds([]);
                        } else {
                            const data = await response.json();
                            setErrorMessage(
                                data.message ||
                                    'Failed to delete study sessions.',
                            );
                        }
                    } catch {
                        setErrorMessage(
                            'An error occurred while deleting study sessions.',
                        );
                    } finally {
                        setIsLoading(false);
                    }
                },
            });
        },
        [fetchSchedules, pastPending.length, setConfirmModal],
    );

    const handleDismissReminderWithSnooze = (snooze24h: boolean) => {
        if (snooze24h && typeof window !== 'undefined') {
            try {
                const snoozedUntil = new Date(
                    Date.now() + 24 * 60 * 60 * 1000,
                ).toISOString();
                localStorage.setItem(
                    'study_plan_reminder_snoozed_until',
                    snoozedUntil,
                );
            } catch (e) {
                console.error('Failed to save snooze preference:', e);
            }
        }

        setIsReminderOpen(false);
    };

    const handleBulkRescheduleAllToToday = async (ids?: number[]) => {
        setIsLoading(true);

        try {
            const response = await fetch(
                '/study-schedules/bulk-reschedule-today',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ ids: ids || [] }),
                },
            );

            if (response.ok) {
                monthCacheRef.current.clear();
                await fetchSchedules(true);
                setPastPending([]);
                setIsReminderOpen(false);
            } else {
                const data = await response.json();
                setErrorMessage(
                    data.message || 'Failed to reschedule overdue tasks.',
                );
            }
        } catch {
            setErrorMessage(
                'An error occurred while rescheduling overdue tasks.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleBulkMarkAllDone = async (ids?: number[]) => {
        setIsLoading(true);

        try {
            const response = await fetch('/study-schedules/bulk-mark-done', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify({ ids: ids || [] }),
            });

            if (response.ok) {
                monthCacheRef.current.clear();
                await fetchSchedules(true);
                setPastPending([]);
                setIsReminderOpen(false);
            } else {
                const data = await response.json();
                setErrorMessage(
                    data.message || 'Failed to mark tasks as completed.',
                );
            }
        } catch {
            setErrorMessage(
                'An error occurred while marking tasks as completed.',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const filteredWeeks = useMemo(() => {
        if (selectedCategory === 'all') {
            return weeks;
        }

        return weeks.map((week) =>
            week.map((day) => ({
                ...day,
                schedules: day.schedules.filter(filterScheduleByCategory),
            })),
        );
    }, [weeks, selectedCategory, filterScheduleByCategory]);

    const filteredWeekDays = useMemo(() => {
        if (selectedCategory === 'all') {
            return currentWeekDays;
        }

        return currentWeekDays.map((day) => ({
            ...day,
            schedules: day.schedules.filter(filterScheduleByCategory),
        }));
    }, [currentWeekDays, selectedCategory, filterScheduleByCategory]);

    const filteredPastPending = useMemo(() => {
        if (selectedCategory === 'all') {
            return pastPending;
        }

        return pastPending.filter(filterScheduleByCategory);
    }, [pastPending, selectedCategory, filterScheduleByCategory]);

    const handleTemplateApplied = useCallback(async () => {
        monthCacheRef.current.clear();
        await fetchSchedules(true);
    }, [fetchSchedules]);

    const handleShiftApplied = useCallback(async () => {
        monthCacheRef.current.clear();
        await fetchSchedules(true);
    }, [fetchSchedules]);

    const openStudyDrawer = useCallback(
        (task: StudySchedule, dateStr: string) => {
            setSelectedStudyTask({ task, dateStr });
            setIsStudyDrawerOpen(true);
        },
        [],
    );

    const closeStudyDrawer = useCallback(() => {
        setIsStudyDrawerOpen(false);
        setSelectedStudyTask(null);
    }, []);

    const openDaySheet = useCallback(
        (dateStr: string, daySchedules: StudySchedule[]) => {
            setSelectedDayDetails({ dateStr, schedules: daySchedules });
            setIsDaySheetOpen(true);
        },
        [],
    );

    const closeDaySheet = useCallback(() => {
        setIsDaySheetOpen(false);
        setSelectedDayDetails(null);
    }, []);

    return {
        currentDate,
        setCurrentDate,
        activeView,
        setActiveView,
        selectedCategory,
        setSelectedCategory,
        schedules,
        examDates,
        subcategories,
        learnModules,
        isModalOpen,
        setIsModalOpen,
        isTemplatesModalOpen,
        setIsTemplatesModalOpen,
        isShiftModalOpen,
        setIsShiftModalOpen,
        selectedStudyTask,
        isStudyDrawerOpen,
        setIsStudyDrawerOpen,
        openStudyDrawer,
        closeStudyDrawer,
        selectedDayDetails,
        isDaySheetOpen,
        setIsDaySheetOpen,
        openDaySheet,
        closeDaySheet,
        errorMessage,
        setErrorMessage,
        confirmModal,
        setConfirmModal,
        selectedDate,
        formData,
        setFormData,
        isEditMode,
        setIsEditMode,
        editScheduleId,
        isLoading,
        attachedModules,
        setAttachedModules,
        isSubjectDropdownOpen,
        setIsSubjectDropdownOpen,
        subjectSearch,
        setSubjectSearch,
        isBulkModalOpen,
        setIsBulkModalOpen,
        bulkFormData,
        setBulkFormData,
        nextExam,
        pastPending: filteredPastPending,
        rawPastPending: pastPending,
        setPastPending,
        isReminderOpen,
        setIsReminderOpen,
        todayStr,
        weeks: filteredWeeks,
        rawWeeks: weeks,
        currentWeekDays: filteredWeekDays,
        weekRangeLabel,
        selectedWeekDate,
        setSelectedWeekDate,
        previousWeek,
        nextWeek,
        jumpToTodayWeek,
        previousMonth,
        nextMonth,
        openModal,
        openEditModal,
        closeModal,
        handleBulkUpdateTime,
        handleTemplateApplied,
        handleShiftApplied,
        handleAddStudy,
        handleDeleteSchedule,
        toggleScheduleDone,
        handleRescheduleToToday,
        handleResetAll,
        handleDragSchedule,
        handleDismissReminderWithSnooze,
        handleBulkRescheduleAllToToday,
        handleBulkMarkAllDone,
        handleBulkDelete,
        selectedScheduleIds,
        toggleSelectSchedule,
        selectAllSchedules,
        deselectAllSchedules,
        getScheduleCategoryId,
        filterScheduleByCategory,
    };
}
