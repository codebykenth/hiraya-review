import { router } from '@inertiajs/react';
import { useState } from 'react';

type ActionType =
    | 'clear-cache'
    | 'optimize'
    | 'run-migrations'
    | 'rollback-migrations'
    | 'toggle-maintenance'
    | null;

interface ModalConfig {
    title: string;
    message: string;
    variant: 'info' | 'success' | 'danger';
    confirmLabel: string;
    verificationText?: string;
}

export function useSystemState(isMaintenanceMode: boolean) {
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

    const getModalConfig = (action: ActionType): ModalConfig => {
        switch (action) {
            case 'clear-cache':
                return {
                    title: 'Clear System Cache',
                    message:
                        'Are you sure you want to clear the application cache? This will reset all temporarily cached data.',
                    variant: 'info',
                    confirmLabel: 'Clear Cache',
                };
            case 'optimize':
                return {
                    title: 'Optimize System',
                    message:
                        'This will cache routes, views, and configurations for faster performance. Are you sure?',
                    variant: 'success',
                    confirmLabel: 'Optimize',
                };
            case 'run-migrations':
                return {
                    title: 'Run Database Migrations',
                    message:
                        'WARNING: Running migrations will modify the database schema. Ensure you have backed up the database before proceeding.',
                    variant: 'danger',
                    confirmLabel: 'Run Migrations',
                    verificationText: 'CONFIRM',
                };
            case 'rollback-migrations':
                return {
                    title: 'Rollback Migrations',
                    message:
                        'CRITICAL WARNING: Rolling back migrations will destroy data! This reverts the last batch of migrations and drops related tables and data. Are you absolutely sure you want to proceed?',
                    variant: 'danger',
                    confirmLabel: 'Force Rollback',
                    verificationText: 'ROLLBACK',
                };
            case 'toggle-maintenance':
                return {
                    title: isMaintenanceMode
                        ? 'Bring Application Online'
                        : 'Enable Maintenance Mode',
                    message: isMaintenanceMode
                        ? 'Are you sure you want to bring the application back online and allow normal user traffic?'
                        : 'WARNING: Enabling maintenance mode will block all non-admin traffic to the site. Are you sure you want to take the site offline?',
                    variant: isMaintenanceMode ? 'success' : 'danger',
                    confirmLabel: isMaintenanceMode
                        ? 'Go Live'
                        : 'Enable Maintenance',
                };
            default:
                return {
                    title: '',
                    message: '',
                    variant: 'info',
                    confirmLabel: 'Confirm',
                };
        }
    };

    const modalConfig = getModalConfig(actionToConfirm);

    return {
        actionToConfirm,
        setActionToConfirm,
        isProcessing,
        executeAction,
        modalConfig,
    };
}
