import { HelpCircle } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Tip {
    icon: React.ReactNode;
    title: string;
    text: string;
}

interface HowItWorksModalProps {
    title?: string;
    description?: string;
    tips: Tip[];
}

export function HowItWorksModal({
    title = 'How it Works',
    description = 'Master this feature with these quick tips:',
    tips,
}: HowItWorksModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 h-7 gap-1.5 rounded-full border-blue-200 bg-blue-50 px-3 text-[11px] font-bold text-blue-700 shadow-sm hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400"
                >
                    <HelpCircle className="size-3.5" />
                    How it works
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <HelpCircle className="size-5 text-blue-600" />
                        {title}
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-sm">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    {tips.map((tip, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {tip.icon}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-foreground">
                                    {tip.title}
                                </h4>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {tip.text}
                                </p>
                            </div>
                        </div>
                    ))}
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
    );
}
