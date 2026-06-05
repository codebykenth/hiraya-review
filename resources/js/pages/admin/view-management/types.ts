export interface RolePermission {
    id: number;
    role: string;
    view_name: string;
    is_visible: boolean;
}

export interface ViewManagementProps {
    permissions: RolePermission[];
    availableViews: Record<string, string>;
}
