import { Head, usePage } from '@inertiajs/react';
import {
    MousePointerClick,
    Move,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
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
import { CalendarBulkActionsBar } from './components/calendar-bulk-actions-bar';
import { CalendarGrid } from './components/calendar-grid';
import { CalendarStatsBanner } from './components/calendar-stats-banner';
import { CalendarToolbar } from './components/calendar-toolbar';
import { DayDetailsSheet } from './components/day-details-sheet';
import { ExamCountdown } from './components/exam-countdown';
import { PastPendingReminder } from './components/past-pending-reminder';
import { ScheduleModal } from './components/schedule-modal';
import { ShiftScheduleModal } from './components/shift-schedule-modal';
import { StudyPlanTemplatesModal } from './components/study-plan-templates-modal';
import { StudyTaskDrawer } from './components/study-task-drawer';
import { WeekView } from './components/week-view';
import { useCalendarState } from './hooks/use-calendar-state';
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
        isTemplatesModalOpen,
        setIsTemplatesModalOpen,
        isShiftModalOpen,
        setIsShiftModalOpen,
        selectedStudyTask,
        isStudyDrawerOpen,
        setIsStudyDrawerOpen,
        openStudyDrawer,
        selectedDayDetails,
        isDaySheetOpen,
        setIsDaySheetOpen,
        openDaySheet,
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
        rawWeeks,
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
        deselectAllSchedules,
        filterScheduleByCategory,
    } = useCalendarState({ schedules, examDates, pastPending, nextExam });

    const totalScheduleCount = schedulesMap.size + rawPastPending.length;

    return (
        <>
            <Head title="Study Plan" />
            <PageContainer>
                {/* Top Page Header */}
                <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-3">
                        <PageHeader
                            title="Study Plan"
                            description="Plan your daily study sessions, track progress, and conquer your exam"
                            tooltip="Your personalized calendar and study planner where you can apply pre-built templates, drag-and-drop sessions, and track daily goals."
                        />
                        <div className="mt-1">
                            <HowItWorksModal
                                title="How the Study Plan Works"
                                description="Master your study schedule with these quick tips:"
                                tips={[
                                    {
                                        icon: <Sparkles className="size-4" />,
                                        title: 'Study Plan Templates',
                                        text: 'Click "Study Templates" to generate a full 60-Day, 30-Day, or subject-specific schedule in 1 click.',
                                    },
                                    {
                                        icon: (
                                            <MousePointerClick className="size-4" />
                                        ),
                                        title: 'Click to Inspect or Add',
                                        text: 'Click any month date cell to inspect tasks for that day, or click any task to open the Study Drawer & Practice Drill.',
                                    },
                                    {
                                        icon: <Move className="size-4" />,
                                        title: 'Drag and Drop',
                                        text: "Simply drag and drop any session into another day's block on the calendar to instantly reschedule it.",
                                    },
                                    {
                                        icon: (
                                            <CheckCircle2 className="size-4" />
                                        ),
                                        title: 'Auto Catch-Up',
                                        text: 'Use "Shift / Auto Catch-Up" in the Actions menu to automatically rebalance missed days forward.',
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ExamCountdown nextExam={calendarNextExam} />
                    </div>
                </div>

                {/* Top Mini-Stats & Habit Momentum Banner */}
                {totalScheduleCount > 0 && (
                    <div className="mb-4">
                        <CalendarStatsBanner
                            weeks={rawWeeks}
                            pastPending={rawPastPending}
                            todayStr={todayStr}
                            nextExam={calendarNextExam}
                        />
                    </div>
                )}

                {/* Empty State Template Starter Banner (shown when no study sessions exist) */}
                {totalScheduleCount === 0 && (
                    <div className="mb-4 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-indigo-50/80 p-4 sm:p-5 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-blue-950/20 dark:to-indigo-950/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                                    <Sparkles className="size-4.5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Start with a Ready-Made Study Plan
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">
                                        No need to schedule manually. Choose from our 60-Day, 30-Day Sprint, or Subject Booster tracks to populate your calendar instantly.
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsTemplatesModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 self-start sm:self-auto shadow-2xs gap-1.5"
                            >
                                <Sparkles className="size-3.5" />
                                <span>Explore Templates</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Unified Calendar Control Toolbar */}
                <div className="mb-4">
                    <CalendarToolbar
                        activeView={activeView}
                        setActiveView={setActiveView}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        previousMonth={previousMonth}
                        nextMonth={nextMonth}
                        previousWeek={previousWeek}
                        nextWeek={nextWeek}
                        jumpToTodayWeek={jumpToTodayWeek}
                        weekRangeLabel={weekRangeLabel}
                        onOpenAddModal={() => openModal(todayStr)}
                        onOpenTemplatesModal={() => setIsTemplatesModalOpen(true)}
                        onOpenBulkTimeModal={() => setIsBulkModalOpen(true)}
                        onOpenShiftModal={() => setIsShiftModalOpen(true)}
                        onResetAll={handleResetAll}
                    />
                </div>

                {/* Main Calendar Views */}
                <Card className="border-slate-200/80 bg-white/90 p-4 sm:p-6 shadow-2xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
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
                                openModal={openModal}
                                openEditModal={openEditModal}
                                onOpenDayDetails={openDaySheet}
                                onOpenStudyDrawer={openStudyDrawer}
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
                            onOpenStudyDrawer={openStudyDrawer}
                            toggleScheduleDone={toggleScheduleDone}
                            handleDeleteSchedule={handleDeleteSchedule}
                            handleRescheduleToToday={handleRescheduleToToday}
                            handleBulkRescheduleAllToToday={
                                handleBulkRescheduleAllToToday
                            }
                            handleBulkMarkAllDone={handleBulkMarkAllDone}
                            handleBulkDelete={handleBulkDelete}
                            selectedScheduleIds={selectedScheduleIds}
                            toggleSelectSchedule={toggleSelectSchedule}
                            filterScheduleByCategory={filterScheduleByCategory}
                        />
                    )}
                </Card>

                {/* Side-by-Side Study Task Drawer */}
                <StudyTaskDrawer
                    isOpen={isStudyDrawerOpen}
                    onOpenChange={setIsStudyDrawerOpen}
                    task={selectedStudyTask?.task || null}
                    dateStr={selectedStudyTask?.dateStr || todayStr}
                    subcategories={subcategories}
                    learnModules={learnModules}
                    onToggleDone={toggleScheduleDone}
                    onEdit={openEditModal}
                    onDelete={handleDeleteSchedule}
                />

                {/* Day Inspector Slide-Over Sheet */}
                <DayDetailsSheet
                    isOpen={isDaySheetOpen}
                    onOpenChange={setIsDaySheetOpen}
                    dateStr={selectedDayDetails?.dateStr || todayStr}
                    schedules={selectedDayDetails?.schedules || []}
                    subcategories={subcategories}
                    onAddNew={(d) => openModal(d)}
                    onToggleDone={toggleScheduleDone}
                    onSelectTask={(t) =>
                        openStudyDrawer(
                            t,
                            selectedDayDetails?.dateStr || todayStr,
                        )
                    }
                    onEditTask={openEditModal}
                    onDeleteTask={handleDeleteSchedule}
                />

                {/* Smart Schedule Shift & Catch-Up Modal */}
                <ShiftScheduleModal
                    isOpen={isShiftModalOpen}
                    onOpenChange={setIsShiftModalOpen}
                    onShiftApplied={handleShiftApplied}
                />

                {/* Study Plan Templates Modal */}
                <StudyPlanTemplatesModal
                    isOpen={isTemplatesModalOpen}
                    onOpenChange={setIsTemplatesModalOpen}
                    todayStr={todayStr}
                    onTemplateApplied={handleTemplateApplied}
                />

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

                {/* Floating Multi-Select Bulk Actions Bar */}
                <CalendarBulkActionsBar
                    selectedCount={selectedScheduleIds.length}
                    isLoading={isLoading}
                    onMarkDone={() => handleBulkMarkAllDone(selectedScheduleIds)}
                    onRescheduleToday={() =>
                        handleBulkRescheduleAllToToday(selectedScheduleIds)
                    }
                    onDelete={() =>
                        handleBulkDelete({
                            ids: selectedScheduleIds,
                            title: 'Delete Selected Study Sessions',
                        })
                    }
                    onClearSelection={deselectAllSchedules}
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
