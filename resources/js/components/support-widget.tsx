import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Coffee, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const appName = import.meta.env.VITE_APP_NAME || 'Hiraya Review';

export function SupportWidget() {
    const [open, setOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        
        const checkVisibility = () => {
            const url = window.location.pathname;
            setIsVisible(!(url.startsWith('/exams') || url.startsWith('/drills')));
        };

        // Check initially
        checkVisibility();

        // Listen for Inertia navigation events
        const removeListener = router.on('navigate', checkVisibility);

        return () => removeListener();
    }, []);

    if (!isMounted || !isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full bg-[#5F7FFF] hover:bg-[#5F7FFF]/90 shadow-lg"
                        aria-label={`Support ${appName}`}
                    >
                        <Coffee className="h-6 w-6 text-white" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Support {appName}</DialogTitle>
                        <DialogDescription className="text-base mt-2">
                            If {appName} helped you prepare more confidently for the Civil Service Exam, you can support the project to help keep reviewer resources free, updated, and accessible to more students. Support is completely optional and never required to access reviewer features.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <div className="font-semibold text-sm">GCash</div>
                                <div className="aspect-square bg-muted rounded-md w-full max-w-[150px] flex items-center justify-center border p-2">
                                    <img src="/images/gcash-qr.png" alt="GCash QR Code" className="w-full h-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                    <span className="text-muted-foreground text-xs hidden">QR Code</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="font-semibold text-sm">Maya</div>
                                <div className="aspect-square bg-muted rounded-md w-full max-w-[150px] flex items-center justify-center border p-2">
                                    <img src="/images/maya-qr.png" alt="Maya QR Code" className="w-full h-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                    <span className="text-muted-foreground text-xs hidden">QR Code</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="font-semibold text-sm">Buy me a coffee</div>
                                <div className="aspect-square bg-muted rounded-md w-full max-w-[150px] flex items-center justify-center border p-2">
                                    <img src="/images/bmc-qr.png" alt="Buy Me A Coffee QR Code" className="w-full h-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                                    <span className="text-muted-foreground text-xs hidden">QR Code</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center pt-2">
                            <a
                                href="https://www.buymeacoffee.com/kenthalexisosila"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-[#FFDD00] text-black hover:bg-[#FFDD00]/90 h-10 py-2 px-4 w-full"
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
