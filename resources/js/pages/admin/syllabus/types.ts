export interface Subcategory {
    id: number;
    name: string;
}

export interface CategoryItem {
    id: number;
    name: string;
    subcategory?: Subcategory[];
}

export interface AdminSyllabusIndexProps {
    categories: CategoryItem[];
}

export interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'success' | 'info';
    onConfirm: () => void;
}
