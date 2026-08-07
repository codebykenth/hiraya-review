import { useForm } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    flaggableId: number;
    flaggableType: 'App\\Models\\Question' | 'App\\Models\\LearnModule';
}

export function ReportIssueModal({
    isOpen,
    onClose,
    flaggableId,
    flaggableType,
}: ReportIssueModalProps) {
    const { data, setData, reset, clearErrors, errors } =
        useForm({
            flaggable_id: flaggableId,
            flaggable_type: flaggableType,
            reason: '',
            details: '',
        });

    const [processing, setProcessing] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
            const xsrfToken = match ? decodeURIComponent(match[2]) : '';

            const response = await fetch('/feedbacks/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                body: JSON.stringify(data),
            });

            if (response.ok || response.type === 'opaqueredirect' || response.redirected) {
                toast.success(
                    'Report submitted successfully! Thank you for helping improve the platform.',
                );
                reset();
                clearErrors();
                onClose();
            } else {
                toast.error(
                    'Failed to submit report. Please check the fields and try again.',
                );
            }
        } catch (error) {
            toast.error(
                'Failed to submit report. Please check the fields and try again.',
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-amber-600 dark:text-amber-500">
                            <Flag className="size-5" />
                            Report an Issue
                        </DialogTitle>
                        <DialogDescription>
                            Found a typo, hallucination, or confusing content?
                            Let us know so we can fix it!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="my-6 flex flex-col gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="reason">What's wrong?</Label>
                            <Select
                                value={data.reason}
                                onValueChange={(val) => setData('reason', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an issue category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="No question stated">
                                        No Question Stated
                                    </SelectItem>
                                    <SelectItem value="Typo / Spelling Error">
                                        Typo / Spelling Error
                                    </SelectItem>
                                    <SelectItem value="Incorrect Information / Answer">
                                        Incorrect Information / Answer
                                    </SelectItem>
                                    <SelectItem value="Confusing Explanation">
                                        Confusing Explanation
                                    </SelectItem>
                                    <SelectItem value="AI Hallucination / Out of scope">
                                        AI Hallucination / Out of scope
                                    </SelectItem>
                                    <SelectItem value="Broken Formatting / Layout">
                                        Broken Formatting / Layout
                                    </SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.reason && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.reason}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="details">
                                Additional Details (Optional)
                            </Label>
                            <Textarea
                                id="details"
                                placeholder="Explain what exactly is wrong so we can fix it..."
                                value={data.details}
                                onChange={(e) =>
                                    setData('details', e.target.value)
                                }
                                className="min-h-[100px]"
                            />
                            {errors.details && (
                                <p className="text-sm font-medium text-destructive">
                                    {errors.details}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                reset();
                                clearErrors();
                                onClose();
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || !data.reason}
                        >
                            {processing ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
