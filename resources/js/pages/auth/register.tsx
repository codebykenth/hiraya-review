import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import ConsentCheckbox from '@/components/auth/consent-checkbox';
import FacebookIcon from '@/components/auth/facebook-icon';
import GoogleIcon from '@/components/auth/google-icon';
import PasswordInput from '@/components/auth/password-input';
import SocialConsentModal from '@/components/auth/social-consent-modal';
import type { SocialProvider } from '@/components/auth/social-consent-modal';
import TurnstileWidget from '@/components/auth/turnstile-widget';
import InputError from '@/components/shared/input-error';
import TextLink from '@/components/shared/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
    turnstileSiteKey?: string;
};

export default function Register({ passwordRules, turnstileSiteKey }: Props) {
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [socialModal, setSocialModal] = useState<SocialProvider | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    return (
        <>
            <Head title="Register" />

            {socialModal && (
                <SocialConsentModal
                    provider={socialModal}
                    onClose={() => setSocialModal(null)}
                />
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-3 sm:gap-6"
                transform={(data) => ({
                    ...data,
                    cf_turnstile_response: turnstileToken,
                })}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-3 sm:gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Enter your full name"
                                    className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-xs placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-xs placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Enter your password"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-xs placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm your password"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-xs placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <ConsentCheckbox
                                id="terms"
                                checked={termsAccepted}
                                onCheckedChange={(v) => setTermsAccepted(!!v)}
                                tabIndex={5}
                            />

                            {/* Turnstile Widget */}
                            {turnstileSiteKey && (
                                <TurnstileWidget
                                    siteKey={turnstileSiteKey}
                                    onVerify={(token) =>
                                        setTurnstileToken(token)
                                    }
                                    theme="auto"
                                />
                            )}

                            <InputError message={errors.turnstile} />

                            <Button
                                type="submit"
                                disabled={!termsAccepted || !turnstileToken}
                                className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                                tabIndex={6}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                            <span className="mx-4 flex-shrink text-xs font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
                                Or continue with
                            </span>
                            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-xl border-slate-200 font-medium transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                                onClick={() => setSocialModal('google')}
                            >
                                <GoogleIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                                Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-xl border-slate-200 font-medium transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                                onClick={() => setSocialModal('facebook')}
                            >
                                <FacebookIcon className="mr-2 h-4 w-4 text-blue-600 transition-transform group-hover:scale-110 dark:text-blue-400" />
                                Facebook
                            </Button>
                        </div>

                        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={7}
                                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Register',
    description: 'Create your account to get started.',
};
