import { router } from '@inertiajs/react';
import { Coffee, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

const appName = import.meta.env.VITE_APP_NAME || 'Hiraya Review';
const SUPPORT_BUBBLE_KEY = 'support_bubble_dismissal';

export function SupportWidget() {
    const [open, setOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showBubble, setShowBubble] = useState(false);
    const [isLiveExamActive, setIsLiveExamActive] = useState(false);

    // Check if bubble should show today
    const shouldShowBubbleToday = () => {
        if (typeof window === 'undefined') {
            return true;
        }

        try {
            const stored = localStorage.getItem(SUPPORT_BUBBLE_KEY);

            if (!stored) {
                return true;
            }

            const dismissalData = JSON.parse(stored);
            const today = new Date().toDateString();

            // Show if not dismissed today
            return dismissalData.date !== today;
        } catch {
            return true;
        }
    };

    const dismissBubbleForToday = () => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(
                SUPPORT_BUBBLE_KEY,
                JSON.stringify({
                    date: new Date().toDateString(),
                    timestamp: Date.now(),
                }),
            );
        } catch {
            // Ignore localStorage errors
        }
    };

    useEffect(() => {
        const handleNavigate = () => {
            // Remove the hardcoded URL check so it can show on Setup and Scorecard views
            // We'll rely on the isLiveExamActive state instead for exams/drills.
        };

        const handleExamStatus = (e: any) => {
            setIsLiveExamActive(e.detail.active);

            if (!e.detail.active && shouldShowBubbleToday()) {
                setTimeout(() => {
                    setShowBubble(true);
                }, 1500);
            }
        };

        window.addEventListener('live-exam-status', handleExamStatus);

        // Listen for Inertia navigation events
        const removeListener = router.on('navigate', handleNavigate);

        // Defer mounting to avoid synchronous cascading render warning
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);

        // Bubble logic (show once a day, delayed by 3 seconds)
        let bubbleTimer: NodeJS.Timeout;

        if (shouldShowBubbleToday()) {
            bubbleTimer = setTimeout(() => {
                setShowBubble(true);
            }, 3000);
        }

        return () => {
            window.removeEventListener('live-exam-status', handleExamStatus);
            removeListener();
            clearTimeout(timer);

            if (bubbleTimer) {
                clearTimeout(bubbleTimer);
            }
        };
    }, []);

    const dismissBubble = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setShowBubble(false);
        dismissBubbleForToday();
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);

        if (newOpen && showBubble) {
            setShowBubble(false);
            dismissBubbleForToday();
        }
    };

    if (!isMounted || isLiveExamActive) {
        return null;
    }

    return (
        <div className="fixed right-6 bottom-6 z-50 flex items-end gap-4">
            {showBubble && (
                <div className="relative mb-1 flex max-w-[220px] animate-in items-start gap-2 rounded-2xl border border-border bg-card p-3 shadow-xl duration-500 fade-in slide-in-from-bottom-4">
                    <div className="flex-1">
                        <p className="text-base leading-relaxed leading-tight font-bold text-foreground">
                            Find{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                                {appName}
                            </span>{' '}
                            helpful?
                        </p>
                        <p className="mt-1 text-sm leading-relaxed font-semibold text-muted-foreground">
                            Support the project! ☕
                        </p>
                    </div>
                    <button
                        onClick={dismissBubble}
                        className="group -mt-1 -mr-1 rounded-full p-1 text-muted-foreground transition-all transition-colors duration-300 hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
                    >
                        <X className="size-3.5" />
                    </button>
                    {/* Right pointer arrow connecting to the FAB */}
                    <div className="absolute top-1/2 -right-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-t border-r border-border bg-card" />
                </div>
            )}
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full bg-[#5F7FFF] shadow-lg hover:bg-[#5F7FFF]/90"
                        aria-label={`Support ${appName}`}
                    >
                        <Coffee className="h-6 w-6 text-white" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">
                            Support {appName}
                        </DialogTitle>
                        <DialogDescription className="mt-2 text-base">
                            If {appName} helped you prepare more confidently for
                            the Civil Service Exam, you can support the project
                            to help keep reviewer resources free, updated, and
                            accessible to more students. Support is completely
                            optional and never required to access reviewer
                            features.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-4 sm:gap-6">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                            <div className="flex flex-col items-center gap-1 sm:gap-2">
                                <div className="text-center text-xs leading-tight font-semibold sm:text-sm">
                                    GCash
                                </div>
                                <div className="flex aspect-square w-full items-center justify-center rounded-md border bg-muted p-1 sm:p-2">
                                    <img
                                        src="/images/gcash-qr.png"
                                        alt="GCash QR Code"
                                        className="h-auto w-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                'none';
                                            e.currentTarget.nextElementSibling?.classList.remove(
                                                'hidden',
                                            );
                                        }}
                                    />
                                    <span className="hidden text-[10px] text-muted-foreground sm:text-xs">
                                        QR Code
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1 sm:gap-2">
                                <div className="text-center text-xs leading-tight font-semibold sm:text-sm">
                                    Maya
                                </div>
                                <div className="flex aspect-square w-full items-center justify-center rounded-md border bg-muted p-1 sm:p-2">
                                    <img
                                        src="/images/maya-qr.png"
                                        alt="Maya QR Code"
                                        className="h-auto w-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                'none';
                                            e.currentTarget.nextElementSibling?.classList.remove(
                                                'hidden',
                                            );
                                        }}
                                    />
                                    <span className="hidden text-[10px] text-muted-foreground sm:text-xs">
                                        QR Code
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1 sm:gap-2">
                                <div className="text-center text-xs leading-tight font-semibold sm:text-sm">
                                    Buy me a coffee
                                </div>
                                <div className="flex aspect-square w-full items-center justify-center rounded-md border bg-muted p-1 sm:p-2">
                                    <img
                                        src="/images/bmc-qr.png"
                                        alt="Buy Me A Coffee QR Code"
                                        className="h-auto w-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                'none';
                                            e.currentTarget.nextElementSibling?.classList.remove(
                                                'hidden',
                                            );
                                        }}
                                    />
                                    <span className="hidden text-[10px] text-muted-foreground sm:text-xs">
                                        QR Code
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center pt-2">
                            <a
                                href="https://www.buymeacoffee.com/kenthalexisosila"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex h-10 w-full items-center justify-center rounded-md bg-[#FFDD00] px-4 py-2 text-sm font-medium text-black ring-offset-background transition-all transition-colors duration-300 hover:bg-[#FFDD00]/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                            >
                                <Coffee className="mr-2 h-4 w-4" />
                                Buy me a coffee
                            </a>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
