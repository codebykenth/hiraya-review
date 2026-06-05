import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface DangerousOperationsCardProps {
    isMaintenanceMode: boolean;
    onRunMigrations: () => void;
    onRollbackMigrations: () => void;
    onToggleMaintenance: () => void;
}

export function DangerousOperationsCard({
    isMaintenanceMode,
    onRunMigrations,
    onRollbackMigrations,
    onToggleMaintenance,
}: DangerousOperationsCardProps) {
    return (
        <Card className="border border-rose-200/50 bg-rose-50/30 backdrop-blur-xl dark:border-rose-900/30 dark:bg-rose-950/10">
            <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                    Dangerous Operations
                </CardTitle>
                <CardDescription className="text-sm font-medium text-rose-600/70 dark:text-rose-400/70">
                    Actions that alter the database schema or drastically impact
                    user accessibility.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                            Run Migrations
                        </h4>
                        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Executes pending database schema changes. Use with
                            extreme caution.
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                        onClick={onRunMigrations}
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
                            Reverts the last batch of database migrations.
                            <span className="block font-bold text-rose-500">
                                WARNING: Causes massive data loss!
                            </span>
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                        onClick={onRollbackMigrations}
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
                        variant={isMaintenanceMode ? 'default' : 'destructive'}
                        className="group mt-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95 sm:mt-0"
                        onClick={onToggleMaintenance}
                    >
                        {isMaintenanceMode
                            ? 'Bring Online'
                            : 'Enable Maintenance'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
