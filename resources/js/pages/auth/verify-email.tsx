// Components
import { Form, Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import TextLink from '@/components/shared/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const [resendCount, setResendCount] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const storedCount = sessionStorage.getItem(
                'verifyEmailResendCount',
            );

            return storedCount ? parseInt(storedCount, 10) : 0;
        }

        return 0;
    });

    const [timeLeft, setTimeLeft] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const storedNextTime = sessionStorage.getItem(
                'verifyEmailNextAllowedTime',
            );

            if (storedNextTime) {
                const nextTime = parseInt(storedNextTime, 10);
                const remaining = Math.ceil((nextTime - Date.now()) / 1000);

                return remaining > 0 ? remaining : 0;
            }
        }

        return 0;
    });

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }

        const interval = setInterval(() => {
            const storedNextTime = sessionStorage.getItem(
                'verifyEmailNextAllowedTime',
            );

            if (storedNextTime) {
                const nextTime = parseInt(storedNextTime, 10);
                const remaining = Math.ceil((nextTime - Date.now()) / 1000);

                if (remaining <= 0) {
                    setTimeLeft(0);
                } else {
                    setTimeLeft(remaining);
                }
            } else {
                setTimeLeft(0);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleFormSubmit = () => {
        const newCount = resendCount + 1;
        const delaySeconds = 60 * Math.pow(2, resendCount); // 60s, 120s, 240s, 480s, etc.
        const nextTime = Date.now() + delaySeconds * 1000;

        sessionStorage.setItem('verifyEmailResendCount', String(newCount));
        sessionStorage.setItem('verifyEmailNextAllowedTime', String(nextTime));

        setResendCount(newCount);
        setTimeLeft(delaySeconds);
    };

    const formatTimeLeft = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds}s`;
        }

        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    };

    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form
                {...send.form()}
                onStart={() => {
                    handleFormSubmit();
                }}
                className="space-y-6 text-center"
            >
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing || timeLeft > 0}
                            variant="secondary"
                        >
                            {processing && <Spinner />}
                            {timeLeft > 0
                                ? `Resend in ${formatTimeLeft(timeLeft)}`
                                : 'Resend verification email'}
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm"
                        >
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Email verification',
    description:
        'Please verify your email address by clicking on the link Hiraya Review just emailed to you.',
};
