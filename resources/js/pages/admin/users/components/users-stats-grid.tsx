import { Users, Shield, UserPlus, CheckCircle } from 'lucide-react';

import type { StatsSummary } from '@/pages/admin/users/user';
import { StatsCard } from '../../dashboard/components/stats-card';

interface UsersStatsGridProps {
    stats: StatsSummary;
}

export function UsersStatsGrid({ stats }: UsersStatsGridProps) {
    const complianceRate =
        stats.total_users > 0
            ? Math.round(
                  ((stats.total_terms_accepted || 0) / stats.total_users) * 100,
              )
            : 0;

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Users */}
            <StatsCard
                label="Total Users"
                value={stats.total_users}
                icon={Users}
                iconBgColor="bg-slate-50 dark:bg-slate-900"
                iconTextColor="text-slate-600 dark:text-slate-400"
            />

            {/* Admin Count */}
            <StatsCard
                label="Admin"
                value={stats.total_admins}
                icon={Shield}
                iconBgColor="bg-indigo-50 dark:bg-indigo-950/20"
                iconTextColor="text-indigo-600 dark:text-indigo-400 dark:text-indigo-400"
            />

            {/* Students Count */}
            <StatsCard
                label="Students"
                value={stats.total_students}
                icon={UserPlus}
                iconBgColor="bg-emerald-50 dark:bg-emerald-950/20"
                iconTextColor="text-emerald-600 dark:text-emerald-400 dark:text-emerald-400"
            />

            {/* Compliance Rate */}
            <StatsCard
                label="Compliance Rate"
                value={`${complianceRate}%`}
                icon={CheckCircle}
                iconBgColor="bg-blue-50 dark:bg-blue-950/20"
                iconTextColor="text-blue-600 dark:text-blue-400 dark:text-blue-400"
            />
        </div>
    );
}
