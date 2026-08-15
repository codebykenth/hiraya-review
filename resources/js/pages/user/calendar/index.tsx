import { Head, Link, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Clock,
    MousePointerClick,
    Move,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Calendar as CalendarGridIcon,
    CalendarRange,
    List,
    Sparkles,
} from 'lucide-react';
import React from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { HowItWorksModal } from '@/components/shared/how-it-works-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { AgendaView } from './components/agenda-view';
import { BulkUpdateModal } from './components/bulk-update-modal';
import { CalendarGrid } from './components/calendar-grid';
import { ExamCountdown } from './components/exam-countdown';
import { PastPendingReminder } from './components/past-pending-reminder';
import { ScheduleModal } from './components/schedule-modal';
import { WeekView } from './components/week-view';
import { mainCategories, useCalendarState } from './hooks/use-calendar-state';
import type { CalendarPageProps } from './hooks/use-calendar-state';

export default function Calendar() {
    const { schedules, examDates, pastPending, nextExam } =
        usePage<{ [K in keyof CalendarPageProps]: CalendarPageProps[K] }>()
            .props;

    const {
        currentDate,
        setCurrentDate,
        activeView,
        setActiveView,
        selectedCategory,
        setSelectedCategory,
        schedules: schedulesMap,
        examDates: calendarExamDates,
        subcategories,
        learnModules,
        isModalOpen,
        setIsModalOpen,
        errorMessage,
        setErrorMessage,
        confirmModal,
        setConfirmModal,
        selectedDate,
        formData,
        setFormData,
        isEditMode,
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
        nextExam: calendarNextExam,
        pastPending: calendarPastPending,
        rawPastPending,
        setPastPending,
        isReminderOpen,
        setIsReminderOpen,
        todayStr,
        weeks,
        currentWeekDays,
        weekRangeLabel,
        previousWeek,
        nextWeek,
        jumpToTodayWeek,
        previousMonth,
        nextMonth,
        openModal,
        openEditModal,
        handleBulkUpdateTime,
        handleAddStudy,
        handleDeleteSchedule,
        toggleScheduleDone,
        handleRescheduleToToday,
        handleResetAll,
        handleDragSchedule,
        handleDismissReminderWithSnooze,
        handleBulkRescheduleAllToToday,
        handleBulkMarkAllDone,
        filterScheduleByCategory,
    } = useCalendarState({ schedules, examDates, pastPending, nextExam });

    return (
        <>
            <Head title="Study Plan" />
            <PageContainer>
                {/* Top Page Header */}
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <PageHeader
                            title="Study Plan"
                            description="Plan your daily study sessions, track progress, and conquer your exam"
                            tooltip="Your personalized calendar, weekly planner, and agenda where you can create, reschedule, drag-and-drop, and track daily study tasks."
                        />
                        <div className="mt-1">
                            <HowItWorksModal
                                title="How the Study Plan Works"
                                description="Master your study schedule with these quick tips:"
                                tips={[
                                    {
                                        icon: (
                                            <MousePointerClick className="size-4" />
                                        ),
                                        title: 'Click to Add or Edit',
                                        text: "Click any day in Month/Week view or '+ Add Task' in Agenda view to create a study session.",
                                    },
                                    {
                                        icon: <Move className="size-4" />,
                                        title: 'Drag and Drop',
                                        text: "Simply drag and drop any session into another day's block on the calendar to instantly reschedule it.",
                                    },
                                    {
                                        icon: <Sparkles className="size-4" />,
                                        title: 'AI Diagnostic Sync',
                                        text: 'Click "AI Readiness Plan" to populate your study calendar directly from your mock exam weaknesses.',
                                    },
                                    {
                                        icon: (
                                            <CheckCircle2 className="size-4" />
                                        ),
                                        title: 'Overdue Tracking',
                                        text: 'Incomplete past tasks alert you with 1-click batch actions to reschedule or mark them done.',
                                    },
                                ]}
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/analytics/ai-analysis"
                            className="group inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-blue-950/40 dark:text-indigo-300 dark:hover:border-indigo-700"
                        >
                            <Sparkles className="size-3.5 text-indigo-600 transition-transform group-hover:scale-110 dark:text-indigo-400" />
                            <span>AI Readiness Plan</span>
                        </Link>
                        <ExamCountdown nextExam={calendarNextExam} />
                    </div>
                </div>

                {/* Controls Bar: 3-View Mode Switcher & Category Filter */}
                <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    {/* View Switcher Tabs: Month | Week | Agenda */}
                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-900/80">
                        <button
                            type="button"
                            onClick={() => setActiveView('month')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold text-xs transition-all ${
                                activeView === 'month'
                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <CalendarGridIcon className="size-3.5" />
                            <span>Month Grid</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveView('week')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold text-xs transition-all ${
                                activeView === 'week'
                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <CalendarRange className="size-3.5" />
                            <span>Week Planner</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveView('agenda')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold text-xs transition-all ${
                                activeView === 'agenda'
                                    ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                            }`}
                        >
                            <List className="size-3.5" />
                            <span>Agenda List</span>
                            {rawPastPending.length > 0 && (
                                <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-black text-white">
                                    {rawPastPending.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Category Filter Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                                selectedCategory === 'all'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                        >
                            All Subjects
                        </button>
                        {mainCategories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                                    selectedCategory === cat.id
                                        ? 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <Card className="border-border bg-white p-4 shadow-sm sm:p-6 dark:bg-slate-900">
                    {/* Header with navigation (shown for month and agenda views) */}
                    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
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
                                className="cursor-pointer appearance-none rounded border-none bg-transparent py-1 pr-6 pl-2 text-xl font-semibold text-slate-900 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:hover:bg-slate-900"
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
                                className="cursor-pointer appearance-none rounded border-none bg-transparent py-1 pr-6 pl-2 text-xl font-semibold text-slate-900 outline-none hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 dark:text-slate-100 dark:hover:bg-slate-900"
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
                        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                            <Button
                                onClick={() => openModal(todayStr)}
                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700 md:flex-initial"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Add Session
                                </span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                            <Button
                                onClick={() => setIsBulkModalOpen(true)}
                                variant="outline"
                                className="flex-1 border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 md:flex-initial dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                <Clock className="mr-2 h-4 w-4 text-slate-500" />
                                <span className="hidden sm:inline">
                                    Bulk Update Time
                                </span>
                                <span className="sm:hidden">
                                    Bulk Update Time
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleResetAll}
                                className="flex-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 md:flex-initial dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Reset Calendar
                                </span>
                                <span className="sm:hidden">Reset</span>
                            </Button>
                            <div className="ml-auto flex items-center gap-1 md:ml-0">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={previousMonth}
                                    className="h-9 w-9"
                                    title="Previous Month"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={nextMonth}
                                    className="h-9 w-9"
                                    title="Next Month"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* View mode render */}
                    {activeView === 'month' ? (
                        <>
                            {/* Calendar grid swipe tip on mobile */}
                            <div className="mb-2 flex items-center justify-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-500 md:hidden dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                                <span className="animate-pulse">
                                    <ArrowLeft className="inline-block size-3" />
                                </span>{' '}
                                Swipe horizontally to view full week{' '}
                                <span className="animate-pulse">
                                    <ArrowRight className="inline-block size-3" />
                                </span>
                            </div>

                            <CalendarGrid
                                weeks={weeks}
                                todayStr={todayStr}
                                examDates={calendarExamDates}
                                subcategories={subcategories}
                                learnModules={learnModules}
                                openModal={openModal}
                                openEditModal={openEditModal}
                                toggleScheduleDone={toggleScheduleDone}
                                handleDeleteSchedule={handleDeleteSchedule}
                                handleRescheduleToToday={
                                    handleRescheduleToToday
                                }
                                handleDragSchedule={handleDragSchedule}
                            />
                        </>
                    ) : activeView === 'week' ? (
                        <WeekView
                            days={currentWeekDays}
                            todayStr={todayStr}
                            examDates={calendarExamDates}
                            subcategories={subcategories}
                            weekRangeLabel={weekRangeLabel}
                            previousWeek={previousWeek}
                            nextWeek={nextWeek}
                            jumpToTodayWeek={jumpToTodayWeek}
                            openModal={openModal}
                            openEditModal={openEditModal}
                            toggleScheduleDone={toggleScheduleDone}
                            handleDeleteSchedule={handleDeleteSchedule}
                            handleRescheduleToToday={handleRescheduleToToday}
                            handleDragSchedule={handleDragSchedule}
                        />
                    ) : (
                        <AgendaView
                            schedules={schedulesMap}
                            pastPending={rawPastPending}
                            todayStr={todayStr}
                            subcategories={subcategories}
                            openModal={openModal}
                            openEditModal={openEditModal}
                            toggleScheduleDone={toggleScheduleDone}
                            handleDeleteSchedule={handleDeleteSchedule}
                            handleRescheduleToToday={handleRescheduleToToday}
                            handleBulkRescheduleAllToToday={
                                handleBulkRescheduleAllToToday
                            }
                            handleBulkMarkAllDone={handleBulkMarkAllDone}
                            filterScheduleByCategory={filterScheduleByCategory}
                        />
                    )}
                </Card>

                {/* Add/Edit Study Modal */}
                <ScheduleModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    isEditMode={isEditMode}
                    selectedDate={selectedDate}
                    formData={formData}
                    setFormData={setFormData}
                    subcategories={subcategories}
                    learnModules={learnModules}
                    attachedModules={attachedModules}
                    setAttachedModules={setAttachedModules}
                    isSubjectDropdownOpen={isSubjectDropdownOpen}
                    setIsSubjectDropdownOpen={setIsSubjectDropdownOpen}
                    subjectSearch={subjectSearch}
                    setSubjectSearch={setSubjectSearch}
                    handleAddStudy={handleAddStudy}
                    isLoading={isLoading}
                    errorMessage={errorMessage}
                />

                {/* Confirm Modal */}
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmLabel={confirmModal.confirmLabel}
                    variant={confirmModal.variant}
                    onClose={() =>
                        setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                    }
                    onConfirm={confirmModal.onConfirm}
                />

                {/* Error Modal */}
                <Dialog
                    open={!!errorMessage}
                    onOpenChange={(open) => !open && setErrorMessage(null)}
                >
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">
                                Error
                            </DialogTitle>
                            <p className="mt-2 text-base leading-relaxed text-slate-600">
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

                {/* Bulk Update Time Modal */}
                <BulkUpdateModal
                    isOpen={isBulkModalOpen}
                    onOpenChange={setIsBulkModalOpen}
                    bulkFormData={bulkFormData}
                    setBulkFormData={setBulkFormData}
                    handleBulkUpdateTime={handleBulkUpdateTime}
                    isLoading={isLoading}
                />

                {/* Past Pending Tasks Reminder Modal */}
                <PastPendingReminder
                    isOpen={isReminderOpen && calendarPastPending.length > 0}
                    onOpenChange={setIsReminderOpen}
                    pastPending={calendarPastPending}
                    toggleScheduleDone={toggleScheduleDone}
                    handleRescheduleToToday={handleRescheduleToToday}
                    handleBulkRescheduleAllToToday={
                        handleBulkRescheduleAllToToday
                    }
                    handleBulkMarkAllDone={handleBulkMarkAllDone}
                    handleDismissReminderWithSnooze={
                        handleDismissReminderWithSnooze
                    }
                    setPastPending={setPastPending}
                />
            </PageContainer>
        </>
    );
}

Calendar.layout = {
    breadcrumbs: [
        {
            title: 'Study Plan',
            href: '/study-schedules',
        },
    ],
};
