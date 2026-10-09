import {
    Milestone,
    PanelRightClose,
    PanelRightOpen,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface TutorQuestionCheckpoint {
    id: string;
    index: number;
    questionText: string;
    timestamp: string;
}

export interface TutorCheckpointsRailProps {
    questions: TutorQuestionCheckpoint[];
    activeQuestionId: string | null;
    highlightedMsgId: string | null;
    onSelectQuestion: (id: string) => void;
    onScrollToTop?: () => void;
    onScrollToBottom?: () => void;
    isMobileSheetOpen?: boolean;
    onMobileSheetOpenChange?: (open: boolean) => void;
}

const STORAGE_KEY = 'hiraya_tutor_checkpoints_collapsed';

export function TutorCheckpointsRail({
    questions,
    activeQuestionId,
    highlightedMsgId,
    onSelectQuestion,
    onScrollToTop,
    onScrollToBottom,
    isMobileSheetOpen: isMobileSheetOpenProp,
    onMobileSheetOpenChange: onMobileSheetOpenChangeProp,
}: TutorCheckpointsRailProps) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved !== null) {
                return saved === 'true';
            }

            return window.innerWidth < 1280;
        }

        return false;
    });

    const [internalMobileSheetOpen, setInternalMobileSheetOpen] = useState(false);
    const isSheetOpen = isMobileSheetOpenProp !== undefined ? isMobileSheetOpenProp : internalMobileSheetOpen;
    const handleSheetOpenChange = useCallback(
        (open: boolean) => {
            if (onMobileSheetOpenChangeProp) {
                onMobileSheetOpenChangeProp(open);
            } else {
                setInternalMobileSheetOpen(open);
            }
        },
        [onMobileSheetOpenChangeProp],
    );

    const toggleCollapse = useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;

            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, String(next));
            }

            return next;
        });
    }, []);


    if (questions.length === 0) {
        return null;
    }

    return (
        <>
            {/* Desktop / Tablet Side Rail */}
            <aside
                className={cn(
                    'hidden md:flex flex-col shrink-0 h-full border-l border-border/70 bg-card/60 backdrop-blur-xs transition-[width] duration-300 ease-in-out select-none overflow-hidden',
                    isCollapsed ? 'w-14' : 'w-72'
                )}
                aria-label="Question checkpoints navigation rail"
            >
                {/* Header */}
                <div
                    className={cn(
                        'flex h-12 shrink-0 items-center border-b border-border/60 px-2.5 bg-muted/20',
                        isCollapsed ? 'justify-center' : 'justify-between px-3.5'
                    )}
                >
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleCollapse}
                                    className="size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                    aria-label="Expand question checkpoints"
                                >
                                    <PanelRightOpen className="size-4 text-indigo-600 dark:text-indigo-400" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="font-medium">
                                Expand Checkpoints ({questions.length})
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                    <Milestone className="size-3.5" />
                                </div>
                                <span className="font-heading text-xs font-bold text-foreground truncate">
                                    Checkpoints
                                </span>
                                <span className="rounded-full bg-indigo-500/10 px-1.5 py-0.2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                    {questions.length}
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleCollapse}
                                className="size-7 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Collapse question checkpoints"
                                title="Collapse checkpoints rail"
                            >
                                <PanelRightClose className="size-3.5" />
                            </Button>
                        </>
                    )}
                </div>

                {/* Checkpoints Body List */}
                <div className="relative flex-1 min-h-0 overflow-y-auto px-2 py-3 overscroll-contain">
                    {/* Vertical guideline connector */}
                    <div
                        className={cn(
                            'pointer-events-none absolute top-6 bottom-6 w-0.5 bg-border/60 transition-all',
                            isCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-5'
                        )}
                    />

                    <div className={cn('space-y-2', isCollapsed && 'flex flex-col items-center')}>
                        {questions.map((q) => {
                            const isCurrent = activeQuestionId === q.id || highlightedMsgId === q.id;

                            if (isCollapsed) {
                                return (
                                    <Tooltip key={q.id}>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectQuestion(q.id);
                                                }}
                                                onPointerDown={(e) => {
                                                    e.stopPropagation();
                                                    onSelectQuestion(q.id);
                                                }}
                                                className={cn(
                                                    'relative z-10 flex size-8 items-center justify-center rounded-xl font-mono text-[11px] font-bold transition-all duration-200 active:scale-95 cursor-pointer',
                                                    isCurrent
                                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40 ring-2 ring-indigo-400 scale-105'
                                                        : 'bg-card border border-border/80 text-muted-foreground hover:border-indigo-400/80 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400'
                                                )}
                                                aria-label={`Jump to Question ${q.index}`}
                                            >
                                                Q{q.index}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            side="left"
                                            sideOffset={8}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSelectQuestion(q.id);
                                            }}
                                            onPointerDown={(e) => {
                                                e.stopPropagation();
                                                onSelectQuestion(q.id);
                                            }}
                                            className="max-w-2xl p-3 shadow-xl cursor-pointer pointer-events-auto select-none transition-transform active:scale-[0.98]"
                                        >
                                            <div className="flex items-center justify-between gap-3 border-b border-white/20 pb-1.5 text-[11px]">
                                                <span className="font-bold text-white tracking-wide">
                                                    Question {q.index}
                                                </span>
                                                <span className="text-[10px] text-white/80 font-medium">
                                                    {q.timestamp}
                                                </span>
                                            </div>
                                            <p className="mt-1.5 text-xs text-white/95 line-clamp-3 leading-relaxed font-normal">
                                                {q.questionText}
                                            </p>
                                            <div className="mt-2.5 flex items-center justify-between rounded-md bg-white/15 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-white/25">
                                                <span>Click to jump to question</span>
                                                <span aria-hidden="true">&rarr;</span>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => onSelectQuestion(q.id)}
                                    className={cn(
                                        'group relative flex w-full items-start gap-2.5 rounded-xl p-2 text-left transition-all duration-200 cursor-pointer',
                                        isCurrent
                                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-300/80 dark:border-indigo-800/80 shadow-2xs'
                                            : 'hover:bg-muted/70 border border-transparent'
                                    )}
                                    aria-label={`Jump to Question ${q.index}`}
                                >
                                    {/* Number pill */}
                                    <div
                                        className={cn(
                                            'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold transition-all duration-200',
                                            isCurrent
                                                ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-500/40 ring-2 ring-indigo-400/40 scale-105'
                                                : 'bg-muted text-muted-foreground group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-300'
                                        )}
                                    >
                                        Q{q.index}
                                    </div>

                                    {/* Question excerpt */}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1 text-[10px]">
                                            <span
                                                className={cn(
                                                    'font-bold',
                                                    isCurrent
                                                        ? 'text-indigo-600 dark:text-indigo-400'
                                                        : 'text-foreground/90'
                                                )}
                                            >
                                                Question {q.index}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/70 shrink-0">
                                                {q.timestamp}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground group-hover:text-foreground">
                                            {q.questionText}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Quick Nav Buttons */}
                <div
                    className={cn(
                        'shrink-0 border-t border-border/60 p-2 bg-muted/10',
                        isCollapsed ? 'flex flex-col items-center gap-1.5' : 'flex items-center justify-between gap-1'
                    )}
                >
                    {isCollapsed ? (
                        <>
                            {onScrollToTop && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={onScrollToTop}
                                            className="size-7 rounded-md text-muted-foreground hover:text-foreground"
                                            aria-label="Scroll to top"
                                        >
                                            <ArrowUp className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">Scroll to top</TooltipContent>
                                </Tooltip>
                            )}
                            {onScrollToBottom && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={onScrollToBottom}
                                            className="size-7 rounded-md text-muted-foreground hover:text-foreground"
                                            aria-label="Scroll to latest response"
                                        >
                                            <ArrowDown className="size-3.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">Scroll to latest</TooltipContent>
                                </Tooltip>
                            )}
                        </>
                    ) : (
                        <>
                            {onScrollToTop && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onScrollToTop}
                                    className="h-7 flex-1 gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowUp className="size-3 text-indigo-500" />
                                    <span>Top</span>
                                </Button>
                            )}
                            {onScrollToBottom && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onScrollToBottom}
                                    className="h-7 flex-1 gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowDown className="size-3 text-indigo-500" />
                                    <span>Latest</span>
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </aside>

            {/* Mobile Checkpoint Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetContent side="right" className="w-[85vw] max-w-sm p-4 sm:p-6">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2 text-base">
                            <Milestone className="size-4 text-indigo-500" />
                            Session Checkpoints
                        </SheetTitle>
                        <SheetDescription className="text-xs">
                            Select any question to smoothly scroll right to it.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
                        {questions.map((q) => {
                            const isCurrent = activeQuestionId === q.id || highlightedMsgId === q.id;

                            return (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => {
                                        handleSheetOpenChange(false);
                                        onSelectQuestion(q.id);
                                    }}
                                    className={cn(
                                        'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all active:scale-[0.98]',
                                        isCurrent
                                            ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 text-foreground shadow-xs'
                                            : 'border-border/70 bg-card text-foreground hover:bg-muted/60'
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold',
                                            isCurrent
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        Q{q.index}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1 text-[11px]">
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                                Question {q.index}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {q.timestamp}
                                            </span>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                                            {q.questionText}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
