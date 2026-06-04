import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import FacebookIcon from '@/components/auth/facebook-icon';
import GoogleIcon from '@/components/auth/google-icon';
import PasskeyVerify from '@/components/auth/passkey-verify';
import PasswordInput from '@/components/auth/password-input';
import TurnstileWidget from '@/components/auth/turnstile-widget';
import InputError from '@/components/shared/input-error';
import TextLink from '@/components/shared/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    turnstileSiteKey?: string;
};

export default function Login({
    status,
    canResetPassword,
    turnstileSiteKey,
}: Props) {
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    return (
        <>
            <Head title="Log in" />

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
                transform={(data) => ({
                    ...data,
                    cf_turnstile_response: turnstileToken,
                })}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            {/* Email field */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="Enter your email"
                                    className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-xs placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password field */}
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                                    className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-xs placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Turnstile Widget */}
                            {turnstileSiteKey && (
                                <TurnstileWidget
                                    siteKey={turnstileSiteKey}
                                    onVerify={(token) => {
                                        setTurnstileToken(token);
                                    }}
                                    theme="auto"
                                />
                            )}

                            <InputError message={errors.turnstile} />

                            {/* Remember me */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-medium text-slate-600 dark:text-slate-400"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                                tabIndex={4}
                                disabled={processing || !turnstileToken}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Sign in
                            </Button>
                        </div>

                        {/* Social login buttons */}
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
                                onClick={() => {
                                    window.location.href = '/auth/google';
                                }}
                            >
                                <GoogleIcon className="mr-2 h-4 w-4" />
                                Google
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 rounded-xl border-slate-200 font-medium transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                                onClick={() => {
                                    window.location.href = '/auth/facebook';
                                }}
                            >
                                <FacebookIcon className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Facebook
                            </Button>
                        </div>

                        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Don't have an account?{' '}
                            <TextLink
                                href={register()}
                                tabIndex={5}
                                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                Register
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Sign in',
    description: 'Welcome back. Please enter your details.',
};
