import { useMemo } from 'react';
import type { UserItem } from '@/pages/admin/users/user';
import type { FilterState } from '../components/advanced-filters';

interface UseUserFiltersProps {
    users: UserItem[];
    searchTerm: string;
    selectedRole: string;
    filters: FilterState;
}

export function useUserFilters({
    users,
    searchTerm,
    selectedRole,
    filters,
}: UseUserFiltersProps) {
    return useMemo(() => {
        return users.filter((u) => {
            // Apply search filter
            const matchesSearch =
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(u.id).includes(searchTerm);

            // Apply role filter
            const matchesRole =
                selectedRole === 'All Roles' ||
                (selectedRole === 'Admins' && u.role === 'admin') ||
                (selectedRole === 'Students' && u.role === 'student');

            // Apply advanced filters
            let matchesAdvancedFilters = true;

            if (filters.status !== 'all') {
                if (filters.status === 'active') {
                    matchesAdvancedFilters = u.is_active;
                } else if (filters.status === 'inactive') {
                    matchesAdvancedFilters = !u.is_active;
                }
            }

            if (filters.termsAcceptance !== 'all') {
                const hasAcceptedTerms = !!u.terms_accepted_at;

                if (filters.termsAcceptance === 'accepted') {
                    matchesAdvancedFilters =
                        matchesAdvancedFilters && hasAcceptedTerms;
                } else if (filters.termsAcceptance === 'pending') {
                    matchesAdvancedFilters =
                        matchesAdvancedFilters && !hasAcceptedTerms;
                }
            }

            if (filters.role !== 'all') {
                matchesAdvancedFilters =
                    matchesAdvancedFilters &&
                    ((filters.role === 'admin' && u.role === 'admin') ||
                        (filters.role === 'student' && u.role === 'student'));
            }

            if (filters.registrationDateFrom) {
                const from = new Date(filters.registrationDateFrom);
                const created = new Date(u.created_at);
                matchesAdvancedFilters =
                    matchesAdvancedFilters && created >= from;
            }

            if (filters.registrationDateTo) {
                const to = new Date(filters.registrationDateTo);
                to.setHours(23, 59, 59, 999);
                const created = new Date(u.created_at);
                matchesAdvancedFilters =
                    matchesAdvancedFilters && created <= to;
            }

            if (filters.lastLoginFrom && u.last_login_at) {
                const from = new Date(filters.lastLoginFrom);
                const lastLogin = new Date(u.last_login_at);
                matchesAdvancedFilters =
                    matchesAdvancedFilters && lastLogin >= from;
            }

            if (filters.lastLoginTo && u.last_login_at) {
                const to = new Date(filters.lastLoginTo);
                to.setHours(23, 59, 59, 999);
                const lastLogin = new Date(u.last_login_at);
                matchesAdvancedFilters =
                    matchesAdvancedFilters && lastLogin <= to;
            }

            if (
                filters.attemptsMin !== undefined &&
                u.attempts_count < filters.attemptsMin
            ) {
                matchesAdvancedFilters = false;
            }

            if (
                filters.attemptsMax !== undefined &&
                u.attempts_count > filters.attemptsMax
            ) {
                matchesAdvancedFilters = false;
            }

            return matchesSearch && matchesRole && matchesAdvancedFilters;
        });
    }, [users, searchTerm, selectedRole, filters]);
}
