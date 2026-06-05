import { Head, router, usePage } from '@inertiajs/react';
import { LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountInactiveProps {
    adminEmail?: string;
    [key: string]: any;
}

export default function AccountInactive({ adminEmail }: AccountInactiveProps) {
    const { auth } = usePage<AccountInactiveProps>().props;

    if (!auth?.user) {
        return null;
    }

    const { user } = auth;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <>
            <Head title="Account Inactive" />
            <div className="flex min-h-[90vh] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
                <div className="w-full max-w-2xl">
                    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
                        <h1 className="mb-2 text-center text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                            Account Inactive
                        </h1>
                        <p className="mb-6 text-center text-slate-600">
                            Your account has been deactivated and is temporarily
                            unavailable.
                        </p>

                        <div className="mb-8 space-y-3 rounded-md bg-slate-50 p-4">
                            <div>
                                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    Account Email
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {user.email}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    Account Name
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                    {user.name}
                                </p>
                            </div>
                        </div>

                        <div className="mb-8 space-y-4 rounded-md border border-blue-200 bg-blue-50 p-4">
                            <p className="text-sm text-slate-700">
                                If you believe this is an error, please contact
                                an administrator or reach out to support.
                            </p>

                            {adminEmail && (
                                <div className="space-y-3">
                                    <a
                                        href={`mailto:${adminEmail}`}
                                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                    >
                                        <Mail className="h-4 w-4" />
                                        {adminEmail}
                                    </a>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="w-full gap-2"
                        >
                            <LogOut className="h-4 w-4" />
                            Log Out
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

AccountInactive.layout = {
    breadcrumbs: [
        {
            title: 'Account Inactive',
            href: '/',
        },
    ],
};
