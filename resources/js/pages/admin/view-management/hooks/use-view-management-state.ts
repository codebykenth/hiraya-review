import { router } from '@inertiajs/react';
import { useState } from 'react';
import type { RolePermission } from '../types';

export function useViewManagementState(permissions: RolePermission[]) {
    const [localPermissions, setLocalPermissions] =
        useState<RolePermission[]>(permissions);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = (id: number) => {
        setLocalPermissions((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, is_visible: !p.is_visible } : p,
            ),
        );
    };

    const handleSave = () => {
        setIsSaving(true);
        router.put(
            '/admin/view-management',
            { permissions: localPermissions as any },
            {
                preserveScroll: true,
                onFinish: () => setIsSaving(false),
            },
        );
    };

    const hasChanges =
        JSON.stringify(permissions) !== JSON.stringify(localPermissions);

    const roles = Array.from(new Set(localPermissions.map((p) => p.role)));

    return {
        localPermissions,
        setLocalPermissions,
        isSaving,
        handleToggle,
        handleSave,
        hasChanges,
        roles,
    };
}
