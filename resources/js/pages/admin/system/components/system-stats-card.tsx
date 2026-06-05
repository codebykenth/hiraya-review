import { Database, HardDrive, ShieldAlert, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SystemStatsCardProps {
    environment: string;
    isMaintenanceMode: boolean;
    laravelVersion: string;
    phpVersion: string;
}

export function SystemStatsCard({
    environment,
    isMaintenanceMode,
    laravelVersion,
    phpVersion,
}: SystemStatsCardProps) {
    return (
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
                    <CardTitle className="text-sm font-medium">PHP</CardTitle>
                    <HardDrive className="size-4 text-indigo-500 transition-transform duration-300 group-hover:rotate-6 dark:text-indigo-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {phpVersion}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
