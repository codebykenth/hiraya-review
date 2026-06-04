import { Head, usePage } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Trash2,
    Clock,
    HelpCircle,
} from 'lucide-react';
import React from 'react';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogClose,
    DialogTrigger,
} from '@/components/ui/dialog';
import { BulkUpdateModal } from './components/bulk-update-modal';
import { CalendarGrid } from './components/calendar-grid';
import { ExamCountdown } from './components/exam-countdown';
import { PastPendingReminder } from './components/past-pending-reminder';
import { ScheduleModal } from './components/schedule-modal';
import { useCalendarState } from './hooks/use-calendar-state';
import type { CalendarPageProps } from './hooks/use-calendar-state';

export default function Calendar() {
    const { schedules, examDates, pastPending, nextExam } =
        usePage<{ [K in keyof CalendarPageProps]: CalendarPageProps[K] }>()
            .props;

    const {
        currentDate,
        setCurrentDate,
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
        setPastPending,
        isReminderOpen,
        setIsReminderOpen,
        todayStr,
        weeks,
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
    } = useCalendarState({ schedules, examDates, pastPending, nextExam });

    return (
        <>
            <Head title="Study Plan" />
            <PageContainer>
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <PageHeader
                            title="Study Plan"
                            description="Plan your study sessions by clicking on a date"
                            tooltip="Your personalized calendar where you can create, reschedule, drag-and-drop, and track daily study tasks."
                        />
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-blue-650 mt-1 h-7 gap-1.5 rounded-full border-blue-200 bg-blue-50 px-3 text-[11px] font-bold shadow-sm hover:bg-blue-100 hover:text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400"
                                >
                                    <HelpCircle className="size-3.5" />
                                    How it works
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-xl">
                                        <HelpCircle className="size-5 text-blue-600" />
                                        How the Study Plan Works
                                    </DialogTitle>
                                    <DialogDescription className="pt-2 text-sm">
                                        Master your study schedule with these
                                        quick tips:
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="flex gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            👆
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">
                                                Click to Add or Edit
                                            </h4>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Click any empty space on a day
                                                to add a session. Click an
                                                existing task's title to edit
                                                it.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            🖐️
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">
                                                Drag and Drop
                                            </h4>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Simply click and hold any task,
                                                then drag and drop it into
                                                another day's block to instantly
                                                reschedule it.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            <Clock className="size-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">
                                                Bulk Time Update
                                            </h4>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Use the "Bulk Update Time"
                                                button to select multiple tasks
                                                across different days and set
                                                them all to the same time.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                            ✅
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-foreground">
                                                Mark as Complete
                                            </h4>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                Click the circle next to a task
                                                to mark it done. It will turn
                                                green. Incomplete past tasks
                                                will automatically alert you!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="mt-2 sm:justify-center">
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="w-full sm:w-auto"
                                        >
                                            Got it!
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <ExamCountdown nextExam={calendarNextExam} />
                </div>

                <Card className="border-border bg-white p-6 shadow-sm sm:p-6 dark:bg-slate-950">
                    {/* Header with navigation */}
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
                                className="flex-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 md:flex-initial"
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
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={nextMonth}
                                    className="h-9 w-9"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Calendar grid wrapper for mobile */}
                    <div className="mb-2 flex items-center justify-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2 text-xs text-slate-500 md:hidden dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                        <span className="animate-pulse">←</span> Swipe
                        horizontally to view full week{' '}
                        <span className="animate-pulse">→</span>
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
                        handleDragSchedule={handleDragSchedule}
                    />
                </Card>

                {/* Add Study Modal */}
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
                    <DialogContent className="max-w-2xl">
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
