import { PageContainer } from '@/components/layout/page-container';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { index as examsIndex } from '@/routes/exams';
import { LiveExamView } from './components/live-exam-view';
import { PrintableExam } from './components/printable-exam';
import { ReviewExamView } from './components/review-exam-view';
import { ScorecardView } from './components/scorecard-view';
import { SetupExamView } from './components/setup-exam-view';
import { ExamSessionProvider } from './context/exam-context';
import { useExamState } from './hooks/use-exam-state';
import type { ExamIndexProps } from './types';

export default function ExamIndex(props: ExamIndexProps) {
    const { savedAttempt } = props;

    const {
        mounted,
        isExamActive,
        isExamSubmitted,
        reviewScreenActive,
        setReviewScreenActive,
        selectedExamId,
        setSelectedExamId,
        activeQuestions,
        currentIdx,
        setCurrentIdx,
        answers,
        questionTimes,
        answerChanges,
        flagged,
        setFlagged,
        scratchpads,
        setScratchpads,
        isMobilePaletteOpen,
        setIsMobilePaletteOpen,
        isFreeAttempt,
        showRegisterModal,
        setShowRegisterModal,
        showLockedModal,
        setShowLockedModal,
        timeLeft,
        isTimed,
        submittedByTimer,
        results,
        details,
        isDrillSession,
        drillCategoryName,
        reviewCategoryFilter,
        setReviewCategoryFilter,
        reviewSubcategoryFilter,
        setReviewSubcategoryFilter,
        reviewStatusFilter,
        setReviewStatusFilter,
        reviewSubcategories,
        selectedPaletteCategory,
        confirmModal,
        setConfirmModal,
        errorMessage,
        setErrorMessage,
        printPool,
        setPrintPool,
        isPrinting,
        setIsPrinting,

        // Handlers
        formatTime,
        toggleFlag,
        handleSelectOption,
        handleQuestionNavigate,
        handleCategoryChange,
        handleRegisterFromFreeExam,
        handleCancelFreeExam,
        handleBeginExam,
        handlePrintExam,
        handleSubmitExam,
        handleExitExam,
        getActiveTimeLimitSecs,
    } = useExamState(props);

    const customConfirmModal = (
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
    );

    // Prevent layout flash/shift during SSR or hydration
    if (!mounted) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-base leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                        Loading your session...
                    </p>
                </div>
            </div>
        );
    }

    // Render the Live active exam simulator view
    if (isExamActive) {
        return (
            <ExamSessionProvider
                value={{
                    activeQuestions,
                    currentIdx,
                    answers,
                    flagged,
                    scratchpads,
                    isTimed,
                    timeLeft,
                    details,
                    formatTime,
                    setCurrentIdx,
                    toggleFlag,
                    handleSelectOption,
                    setScratchpads,
                }}
            >
                <LiveExamView
                    details={details}
                    isDrillSession={isDrillSession}
                    activeQuestions={activeQuestions}
                    currentIdx={currentIdx}
                    isTimed={isTimed}
                    timeLeft={timeLeft}
                    formatTime={formatTime}
                    handleExitExam={handleExitExam}
                    setIsMobilePaletteOpen={setIsMobilePaletteOpen}
                    toggleFlag={toggleFlag}
                    flagged={flagged}
                    answers={answers}
                    questionTimes={questionTimes}
                    handleSelectOption={handleSelectOption}
                    handleQuestionNavigate={handleQuestionNavigate}
                    isFreeAttempt={isFreeAttempt}
                    setShowRegisterModal={setShowRegisterModal}
                    handleSubmitExam={handleSubmitExam}
                    selectedPaletteCategory={selectedPaletteCategory}
                    handleCategoryChange={handleCategoryChange}
                    isMobilePaletteOpen={isMobilePaletteOpen}
                    showLockedModal={showLockedModal}
                    setShowLockedModal={setShowLockedModal}
                    handleRegisterFromFreeExam={handleRegisterFromFreeExam}
                    showRegisterModal={showRegisterModal}
                    handleCancelFreeExam={handleCancelFreeExam}
                    customConfirmModal={customConfirmModal}
                />
            </ExamSessionProvider>
        );
    }

    // Render the Post-Exam review scorecard view
    if (isExamSubmitted && results) {
        if (reviewScreenActive) {
            return (
                <ReviewExamView
                    details={details}
                    activeQuestions={activeQuestions}
                    currentIdx={currentIdx}
                    setCurrentIdx={setCurrentIdx}
                    answers={answers}
                    questionTimes={questionTimes}
                    answerChanges={answerChanges}
                    results={results}
                    flagged={flagged}
                    setFlagged={setFlagged}
                    reviewCategoryFilter={reviewCategoryFilter}
                    setReviewCategoryFilter={setReviewCategoryFilter}
                    reviewSubcategoryFilter={reviewSubcategoryFilter}
                    setReviewSubcategoryFilter={setReviewSubcategoryFilter}
                    reviewStatusFilter={reviewStatusFilter}
                    setReviewStatusFilter={setReviewStatusFilter}
                    reviewSubcategories={reviewSubcategories}
                    isMobilePaletteOpen={isMobilePaletteOpen}
                    setIsMobilePaletteOpen={setIsMobilePaletteOpen}
                    setReviewScreenActive={setReviewScreenActive}
                />
            );
        }

        return (
            <PageContainer>
                <ScorecardView
                    details={details}
                    activeQuestions={activeQuestions}
                    setCurrentIdx={setCurrentIdx}
                    answers={answers}
                    isDrillSession={isDrillSession}
                    drillCategoryName={drillCategoryName}
                    savedAttempt={savedAttempt ?? null}
                    results={results}
                    isTimed={isTimed}
                    getActiveTimeLimitSecs={getActiveTimeLimitSecs}
                    submittedByTimer={submittedByTimer}
                    setReviewScreenActive={setReviewScreenActive}
                    setReviewCategoryFilter={setReviewCategoryFilter}
                    setReviewStatusFilter={setReviewStatusFilter}
                    handleBeginExam={handleBeginExam}
                    aiAnalysis={props.aiAnalysis}
                />
            </PageContainer>
        );
    }

    // Default configuration screen (landing page setup)
    return (
        <>
            <SetupExamView
                selectedExamId={selectedExamId}
                setSelectedExamId={setSelectedExamId}
                details={details}
                handleBeginExam={handleBeginExam}
                handlePrintExam={handlePrintExam}
                isPrinting={isPrinting}
                customConfirmModal={customConfirmModal}
            />

            {printPool && (
                <PrintableExam
                    questions={printPool}
                    title={details.title}
                    onComplete={() => {
                        setPrintPool(null);
                        setIsPrinting(false);
                    }}
                />
            )}

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
        </>
    );
}

// Set global shell layouts for navigation links tracking
ExamIndex.layout = {
    breadcrumbs: [
        {
            title: 'Mock Exams',
            href: examsIndex(),
        },
    ],
};
