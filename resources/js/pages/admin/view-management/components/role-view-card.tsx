import { Settings, Eye, EyeOff } from 'lucide-react';
import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { RolePermission } from '../types';

interface RoleViewCardProps {
    role: string;
    permissions: RolePermission[];
    availableViews: Record<string, string>;
    onToggle: (id: number) => void;
}

export function RoleViewCard({
    role,
    permissions,
    availableViews,
    onToggle,
}: RoleViewCardProps) {
    const rolePermissions = permissions.filter((p) => p.role === role);
    const orderMap = Object.keys(availableViews);
    const sortedPermissions = [...rolePermissions].sort(
        (a, b) =>
            orderMap.indexOf(a.view_name) - orderMap.indexOf(b.view_name),
    );

    return (
        <Card className="flex flex-col border border-slate-200/50 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5 dark:border-slate-800/50 dark:bg-slate-950/50">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-black tracking-tight capitalize">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                        <Settings className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                    </div>
                    {role} Role Views
                </CardTitle>
                <CardDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Enable or disable modules for users with the {role} role.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                <div className="divide-y divide-border/50">
                    {sortedPermissions.map((perm) => (
                        <div
                            key={perm.id}
                            className="group flex items-center justify-between p-4 transition-colors hover:bg-slate-50 sm:p-6 dark:hover:bg-slate-900/30"
                        >
                            <div>
                                <h4 className="font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                    {availableViews[perm.view_name] ||
                                        perm.view_name}
                                </h4>
                                <p className="mt-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                    {perm.view_name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onToggle(perm.id)}
                                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none ${
                                    perm.is_visible
                                        ? 'bg-blue-600 shadow-inner shadow-blue-900/20 dark:bg-blue-600'
                                        : 'bg-slate-200 dark:bg-slate-700'
                                }`}
                            >
                                <span className="sr-only">Toggle view</span>
                                <span
                                    className={`pointer-events-none inline-flex size-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ${
                                        perm.is_visible
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                    }`}
                                >
                                    {perm.is_visible ? (
                                        <Eye className="size-3.5 text-blue-600" />
                                    ) : (
                                        <EyeOff className="size-3.5 text-slate-400" />
                                    )}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
