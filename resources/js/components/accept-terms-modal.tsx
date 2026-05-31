import { router, Link } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type Props = {
    isOpen: boolean;
};

export default function AcceptTermsModal({ isOpen }: Props) {
    const [agreed, setAgreed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAccept = useCallback(async () => {
        if (!agreed) {
            return;
        }

        setIsSubmitting(true);
        router.post(
            '/accept-terms',
            {},
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            },
        );
    }, [agreed]);

    const handleLogout = useCallback(() => {
        router.post('/logout', {});
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent
                className="max-w-md"
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>Accept Terms & Conditions</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                            <div>
                                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                    Terms of Service
                                </h3>
                                <p className="text-xs leading-relaxed">
                                    By using our service, you agree to comply
                                    with our terms and policies. You are
                                    responsible for maintaining account
                                    confidentiality and all activities under
                                    your account.{' '}
                                    <Link
                                        href="/terms"
                                        className="text-blue-600 underline dark:text-blue-400"
                                    >
                                        Read full terms of service →
                                    </Link>
                                </p>
                            </div>

                            <div>
                                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                    Privacy Policy
                                </h3>
                                <p className="text-xs leading-relaxed">
                                    We collect and process personal data to
                                    provide and improve our services. Your data
                                    is protected and will not be shared with
                                    third parties without consent.{' '}
                                    <Link
                                        href="/privacy"
                                        className="text-blue-600 underline dark:text-blue-400"
                                    >
                                        Read full privacy policy →
                                    </Link>
                                </p>
                            </div>

                            <div>
                                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                                    Your Rights
                                </h3>
                                <p className="text-xs leading-relaxed">
                                    You have the right to access, modify, or
                                    delete your personal data at any time
                                    through settings or by contacting our
                                    support team.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <Checkbox
                            id="accept-terms"
                            checked={agreed}
                            onCheckedChange={(checked) =>
                                setAgreed(checked as boolean)
                            }
                            className="mt-1"
                        />
                        <Label
                            htmlFor="accept-terms"
                            className="text-sm leading-relaxed font-medium text-slate-700 dark:text-slate-300"
                        >
                            I agree to the Terms of Service and Privacy Policy
                        </Label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="flex-1 rounded-lg border-slate-200 dark:border-slate-800"
                        >
                            Logout
                        </Button>
                        <Button
                            onClick={handleAccept}
                            disabled={!agreed || isSubmitting}
                            className="flex-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                            {isSubmitting ? 'Accepting...' : 'Continue'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
