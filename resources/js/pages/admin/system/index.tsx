import { Head } from '@inertiajs/react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { DangerousOperationsCard } from './components/dangerous-operations-card';
import { PerformanceCard } from './components/performance-card';
import { SystemStatsCard } from './components/system-stats-card';
import { useSystemState } from './hooks/use-system-state';

interface SystemProps {
    isMaintenanceMode: boolean;
    environment: string;
    laravelVersion: string;
    phpVersion: string;
}

export default function SystemIndex({
    isMaintenanceMode,
    environment,
    laravelVersion,
    phpVersion,
}: SystemProps) {
    const {
        actionToConfirm,
        setActionToConfirm,
        isProcessing,
        executeAction,
        modalConfig,
    } = useSystemState(isMaintenanceMode);

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

                <SystemStatsCard
                    environment={environment}
                    isMaintenanceMode={isMaintenanceMode}
                    laravelVersion={laravelVersion}
                    phpVersion={phpVersion}
                />

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <PerformanceCard
                        onClearCache={() => setActionToConfirm('clear-cache')}
                        onOptimize={() => setActionToConfirm('optimize')}
                    />

                    <DangerousOperationsCard
                        isMaintenanceMode={isMaintenanceMode}
                        onRunMigrations={() =>
                            setActionToConfirm('run-migrations')
                        }
                        onRollbackMigrations={() =>
                            setActionToConfirm('rollback-migrations')
                        }
                        onToggleMaintenance={() =>
                            setActionToConfirm('toggle-maintenance')
                        }
                    />
                </div>
            </PageContainer>

            <ConfirmModal
                isOpen={actionToConfirm !== null}
                title={modalConfig.title}
                message={modalConfig.message}
                variant={modalConfig.variant}
                verificationText={modalConfig.verificationText}
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
