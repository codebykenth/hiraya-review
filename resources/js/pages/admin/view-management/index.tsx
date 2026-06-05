import { Head, router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { RoleViewCard } from './components/role-view-card';
import type { ViewManagementProps, RolePermission } from './types';

export default function ViewManagementIndex({
    permissions,
    availableViews,
}: ViewManagementProps) {
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

    return (
        <>
            <Head title="View Management" />

            <PageContainer>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <PageHeader
                        title="View Management"
                        description="Configure which application modules are visible for each user role."
                    />
                    {hasChanges && (
                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full shrink-0 shadow-lg shadow-blue-500/20 sm:w-auto"
                        >
                            <Save className="mr-2 size-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    )}
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    {roles.map((role) => (
                        <RoleViewCard
                            key={role}
                            role={role}
                            permissions={localPermissions}
                            availableViews={availableViews}
                            onToggle={handleToggle}
                        />
                    ))}
                </div>
            </PageContainer>
        </>
    );
}

ViewManagementIndex.layout = {
    breadcrumbs: [
        {
            title: 'View Management',
            href: '/admin/view-management',
        },
    ],
};
