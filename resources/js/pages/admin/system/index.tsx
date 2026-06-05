import { Head, router } from '@inertiajs/react';
import { Database, HardDrive, ShieldAlert, Activity } from 'lucide-react';
import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface SystemProps {
    isMaintenanceMode: boolean;
    environment: string;
    laravelVersion: string;
    phpVersion: string;
}

type ActionType =
    | 'clear-cache'
    | 'optimize'
    | 'run-migrations'
    | 'rollback-migrations'
    | 'toggle-maintenance'
    | null;

export default function SystemIndex({
    isMaintenanceMode,
    environment,
    laravelVersion,
    phpVersion,
}: SystemProps) {
    const [actionToConfirm, setActionToConfirm] = useState<ActionType>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const executeAction = () => {
        if (!actionToConfirm) {
            return;
        }

        setIsProcessing(true);
        router.post(
            `/admin/system/${actionToConfirm}`,
            {},
            {
                onFinish: () => {
                    setIsProcessing(false);
                    setActionToConfirm(null);
                },
            },
        );
    };

    const getModalConfig = (action: ActionType) => {
        switch (action) {
            case 'clear-cache':
                return {
                    title: 'Clear System Cache',
                    message:
                        'Are you sure you want to clear the application cache? This will reset all temporarily cached data.',
                    variant: 'info' as const,
                    confirmLabel: 'Clear Cache',
                };
            case 'optimize':
                return {
                    title: 'Optimize System',
                    message:
                        'This will cache routes, views, and configurations for faster performance. Are you sure?',
                    variant: 'success' as const,
                    confirmLabel: 'Optimize',
                };
            case 'run-migrations':
                return {
                    title: 'Run Database Migrations',
                    message:
                        'WARNING: Running migrations will modify the database schema. Ensure you have backed up the database before proceeding.',
                    variant: 'danger' as const,
                    confirmLabel: 'Run Migrations',
                };
            case 'rollback-migrations':
                return {
                    title: 'Rollback Migrations',
                    message:
                        'CRITICAL WARNING: Rolling back migrations will destroy data! This reverts the last batch of migrations and drops related tables and data. Are you absolutely sure you want to proceed?',
                    variant: 'danger' as const,
                    confirmLabel: 'Force Rollback',
                };
            case 'toggle-maintenance':
                return {
                    title: isMaintenanceMode
                        ? 'Bring Application Online'
                        : 'Enable Maintenance Mode',
                    message: isMaintenanceMode
                        ? 'Are you sure you want to bring the application back online and allow normal user traffic?'
                        : 'WARNING: Enabling maintenance mode will block all non-admin traffic to the site. Are you sure you want to take the site offline?',
                    variant: isMaintenanceMode
                        ? ('success' as const)
                        : ('danger' as const),
                    confirmLabel: isMaintenanceMode
                        ? 'Go Live'
                        : 'Enable Maintenance',
                };
            default:
                return {
                    title: '',
                    message: '',
                    variant: 'info' as const,
                    confirmLabel: 'Confirm',
                };
        }
    };

    const modalConfig = getModalConfig(actionToConfirm);

    return (
        <>
            <Head title="System Actions" />

            <PageContainer>
                <PageHeader
                    title={<>System Actions</>}
                    description={
                        <>
                            Manage backend application state, cache, and
                            database operations directly from the dashboard.
                        </>
                    }
                />

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="group border border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:border-slate-800/50 dark:bg-slate-950/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Environment
                            </CardTitle>
                            <Activity className="size-4 text-blue-500 transition-transform duration-300 group-hover:rotate-12 dark:text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight text-slate-900 capitalize dark:text-white">
                                {environment}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group border border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:border-slate-800/50 dark:bg-slate-950/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                App Status
                            </CardTitle>
                            <ShieldAlert className="size-4 text-emerald-500 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-black tracking-tight ${isMaintenanceMode ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                            >
                                {isMaintenanceMode ? 'Maintenance' : 'Live'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group border border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:border-slate-800/50 dark:bg-slate-950/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Laravel
                            </CardTitle>
                            <Database className="size-4 text-amber-500 transition-transform duration-300 group-hover:-translate-y-0.5 dark:text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {laravelVersion}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="group border border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:border-slate-800/50 dark:bg-slate-950/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                PHP
                            </CardTitle>
                            <HardDrive className="size-4 text-indigo-500 transition-transform duration-300 group-hover:rotate-6 dark:text-indigo-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                {phpVersion}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    {/* Cache & Optimization */}
                    <Card className="border border-slate-200/50 bg-white/70 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/50">
                        <CardHeader>
                            <CardTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                Performance & Cache
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Manage the application cache to ensure optimal
                                performance or clear stale data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                        Clear System Cache
                                    </h4>
                                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        Removes all temporary compiled views and
                                        application cache.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                                    onClick={() =>
                                        setActionToConfirm('clear-cache')
                                    }
                                >
                                    Clear Cache
                                </Button>
                            </div>
                            <div className="flex flex-col justify-between border-t border-slate-200/50 pt-4 sm:flex-row sm:items-center dark:border-slate-800/50">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                        Optimize Framework
                                    </h4>
                                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        Compiles configurations and routes into
                                        a fast, singular cache file.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                                    onClick={() =>
                                        setActionToConfirm('optimize')
                                    }
                                >
                                    Optimize App
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dangerous Operations */}
                    <Card className="border border-rose-200/50 bg-rose-50/30 backdrop-blur-xl dark:border-rose-900/30 dark:bg-rose-950/10">
                        <CardHeader>
                            <CardTitle className="text-xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                                Dangerous Operations
                            </CardTitle>
                            <CardDescription className="text-sm font-medium text-rose-600/70 dark:text-rose-400/70">
                                Actions that alter the database schema or
                                drastically impact user accessibility.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                        Run Migrations
                                    </h4>
                                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        Executes pending database schema
                                        changes. Use with extreme caution.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                                    onClick={() =>
                                        setActionToConfirm('run-migrations')
                                    }
                                >
                                    Force Migrate
                                </Button>
                            </div>
                            <div className="flex flex-col justify-between border-t border-rose-200/50 pt-4 sm:flex-row sm:items-center dark:border-rose-900/30">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                        Rollback Migrations
                                    </h4>
                                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        Reverts the last batch of database
                                        migrations.
                                        <span className="block font-bold text-rose-500">
                                            WARNING: Causes massive data loss!
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                                    onClick={() =>
                                        setActionToConfirm(
                                            'rollback-migrations',
                                        )
                                    }
                                >
                                    Rollback
                                </Button>
                            </div>
                            <div className="flex flex-col justify-between border-t border-rose-200/50 pt-4 sm:flex-row sm:items-center dark:border-rose-900/30">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">
                                        Maintenance Mode
                                    </h4>
                                    <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                        {isMaintenanceMode
                                            ? 'The site is currently OFFLINE to the public.'
                                            : 'Take the site offline to perform critical updates.'}
                                    </p>
                                </div>
                                <Button
                                    variant={
                                        isMaintenanceMode
                                            ? 'default'
                                            : 'destructive'
                                    }
                                    className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                                    onClick={() =>
                                        setActionToConfirm('toggle-maintenance')
                                    }
                                >
                                    {isMaintenanceMode
                                        ? 'Bring Online'
                                        : 'Enable Maintenance'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </PageContainer>

            <ConfirmModal
                isOpen={actionToConfirm !== null}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
                confirmLabel={
                    isProcessing ? 'Processing...' : modalConfig.confirmLabel
                }
                onClose={() => !isProcessing && setActionToConfirm(null)}
                onConfirm={executeAction}
            />
        </>
    );
}

SystemIndex.layout = {
    breadcrumbs: [
        {
            title: 'System Actions',
            href: '/admin/system',
        },
    ],
};
