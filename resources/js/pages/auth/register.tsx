import { Form, Head } from '@inertiajs/react';
import FacebookIcon from '@/components/facebook-icon';
import GoogleIcon from '@/components/google-icon';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
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
                                    placeholder="Full name"
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
                                    placeholder="••••••••"
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
                                    placeholder="••••••••"
                                    passwordrules={passwordRules}
                                    className="h-11 rounded-xl border-slate-200 bg-white/50 backdrop-blur-xs placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 dark:placeholder:text-slate-500"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                                tabIndex={5}
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
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
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
