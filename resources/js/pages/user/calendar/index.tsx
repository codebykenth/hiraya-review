import { Head, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock } from 'lucide-react';
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
                    <PageHeader
                        title="Study Plan"
                        description="Plan your study sessions by clicking on a date"
                    />
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
                                <span className="sm:hidden">Bulk Time</span>
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
