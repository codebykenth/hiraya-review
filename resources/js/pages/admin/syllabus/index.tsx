import { Head, router } from '@inertiajs/react';
import { Database, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import React, { useState } from 'react';
import { ConfirmModal } from '@/components/confirm-modal';
import { PageContainer } from '@/components/page-container';
import { PageHeader } from '@/components/page-header';

interface CategoryItem {
    id: number;
    name: string;
    subcategory?: Array<{
        id: number;
        name: string;
    }>;
}

export default function AdminSyllabusIndex({
    categories,
}: {
    categories: CategoryItem[];
}) {
    const [selectedScopeCategory, setSelectedScopeCategory] = useState<
        number | null
    >(categories && categories.length > 0 ? categories[0].id : null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIsDemographic, setNewCategoryIsDemographic] =
        useState(false);
    const [newSubcategoryName, setNewSubcategoryName] = useState('');

    // Edit states
    const [editingCategory, setEditingCategory] = useState<number | null>(null);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editingSubcategory, setEditingSubcategory] = useState<number | null>(
        null,
    );
    const [editSubcategoryName, setEditSubcategoryName] = useState('');

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmLabel: string;
        variant: 'danger' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        confirmLabel: '',
        variant: 'danger',
        onConfirm: () => {},
    });

    const activeCategory = categories.find(
        (c) => c.id === selectedScopeCategory,
    );

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCategoryName.trim()) {
            return;
        }

        router.post(
            '/questions/categories',
            {
                name: newCategoryName,
                is_demographic: newCategoryIsDemographic,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewCategoryName('');
                    setNewCategoryIsDemographic(false);
                },
            },
        );
    };

    const handleUpdateCategory = (e: React.FormEvent, catId: number) => {
        e.preventDefault();

        if (!editCategoryName.trim()) {
            return;
        }

        router.put(
            `/questions/categories/${catId}`,
            { name: editCategoryName },
            {
                preserveScroll: true,
                onSuccess: () => setEditingCategory(null),
            },
        );
    };

    const handleDeleteCategory = (catId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Category?',
            message:
                'Are you sure you want to delete this category? This action cannot be undone and will permanently delete all of its mapped subcategories!',
            confirmLabel: 'Delete Category',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/questions/categories/${catId}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (selectedScopeCategory === catId) {
                            setSelectedScopeCategory(
                                categories.find((c) => c.id !== catId)?.id ||
                                    null,
                            );
                        }
                    },
                });
            },
        });
    };

    const handleAddSubcategory = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedScopeCategory || !newSubcategoryName.trim()) {
            return;
        }

        router.post(
            '/questions/subcategories',
            {
                category_id: selectedScopeCategory,
                name: newSubcategoryName,
            },
            {
                preserveScroll: true,
                onSuccess: () => setNewSubcategoryName(''),
            },
        );
    };

    const handleUpdateSubcategory = (e: React.FormEvent, subId: number) => {
        e.preventDefault();

        if (!editSubcategoryName.trim()) {
            return;
        }

        router.put(
            `/questions/subcategories/${subId}`,
            { name: editSubcategoryName },
            {
                preserveScroll: true,
                onSuccess: () => setEditingSubcategory(null),
            },
        );
    };

    const handleDeleteSubcategory = (subId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Subcategory?',
            message:
                'Are you sure you want to delete this subcategory? This action cannot be undone.',
            confirmLabel: 'Delete Subcategory',
            variant: 'danger',
            onConfirm: () => {
                router.delete(`/questions/subcategories/${subId}`, {
                    preserveScroll: true,
                });
            },
        });
    };

    return (
        <PageContainer>
            <Head title="Syllabus Scope Settings" />

            <PageHeader
                title="Syllabus Scope Settings"
                description="Customize your exam blueprint and automatically tune the AI review material writer. All categories and subcategories defined here are synchronized across both the question bank and the learning modules."
                className="mb-8 flex flex-col gap-2"
                descriptionClassName="max-w-2xl text-sm leading-relaxed text-muted-foreground"
            />

            <div className="flex h-[650px] w-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4.5">
                    <div>
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                            <Database className="size-5 text-blue-600 dark:text-blue-500" />
                            Dynamic Syllabus Management
                        </h2>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex w-1/2 flex-col overflow-y-auto border-r border-border p-6">
                        <h3 className="mb-3.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Categories
                        </h3>

                        <form
                            onSubmit={handleAddCategory}
                            className="mb-4 flex flex-col gap-2"
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Add new category..."
                                    value={newCategoryName}
                                    onChange={(e) =>
                                        setNewCategoryName(e.target.value)
                                    }
                                    className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground transition focus:border-blue-500 focus:outline-none"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="shadow-3xs inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800"
                                >
                                    <Plus className="size-4" />
                                </button>
                            </div>
                            <label className="flex cursor-pointer items-center gap-2 self-start px-1 py-1 select-none">
                                <input
                                    type="checkbox"
                                    checked={newCategoryIsDemographic}
                                    onChange={(e) =>
                                        setNewCategoryIsDemographic(
                                            e.target.checked,
                                        )
                                    }
                                    className="size-4 cursor-pointer rounded border-border text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-semibold text-muted-foreground">
                                    Is demographic?
                                </span>
                            </label>
                        </form>

                        <div className="flex-1 space-y-2">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => {
                                        if (editingCategory !== cat.id) {
                                            setSelectedScopeCategory(cat.id);
                                        }
                                    }}
                                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition select-none ${
                                        selectedScopeCategory === cat.id &&
                                        editingCategory !== cat.id
                                            ? 'shadow-3xs border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200'
                                            : 'border-border bg-card text-foreground hover:bg-muted/50'
                                    }`}
                                >
                                    {editingCategory === cat.id ? (
                                        <form
                                            onSubmit={(e) =>
                                                handleUpdateCategory(e, cat.id)
                                            }
                                            className="flex flex-1 items-center gap-2 pr-2"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="text"
                                                autoFocus
                                                value={editCategoryName}
                                                onChange={(e) =>
                                                    setEditCategoryName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-semibold text-foreground focus:border-blue-500 focus:outline-none"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className="cursor-pointer rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                            >
                                                <Check className="size-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingCategory(null)
                                                }
                                                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            <span className="truncate pr-2 text-sm font-semibold">
                                                {cat.name}
                                            </span>
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                                                    {
                                                        (cat.subcategory || [])
                                                            .length
                                                    }{' '}
                                                    subs
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingCategory(
                                                            cat.id,
                                                        );
                                                        setEditCategoryName(
                                                            cat.name,
                                                        );
                                                    }}
                                                    className="cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteCategory(
                                                            cat.id,
                                                        );
                                                    }}
                                                    className="cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex w-1/2 flex-col overflow-y-auto bg-muted/20 p-6">
                        <h3 className="mb-3.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Subcategories of "
                            {activeCategory?.name || 'Select a Category'}"
                        </h3>

                        {selectedScopeCategory ? (
                            <>
                                <form
                                    onSubmit={handleAddSubcategory}
                                    className="mb-4 flex gap-2"
                                >
                                    <input
                                        type="text"
                                        placeholder="Add new subcategory..."
                                        value={newSubcategoryName}
                                        onChange={(e) =>
                                            setNewSubcategoryName(
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground transition focus:border-blue-500 focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="shadow-3xs inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800"
                                    >
                                        <Plus className="size-4" />
                                    </button>
                                </form>

                                <div className="flex-1 space-y-2">
                                    {(activeCategory?.subcategory || []).map(
                                        (sub) => (
                                            <div
                                                key={sub.id}
                                                className="shadow-3xs flex items-center justify-between rounded-xl border border-border bg-card p-3 text-foreground"
                                            >
                                                {editingSubcategory ===
                                                sub.id ? (
                                                    <form
                                                        onSubmit={(e) =>
                                                            handleUpdateSubcategory(
                                                                e,
                                                                sub.id,
                                                            )
                                                        }
                                                        className="flex flex-1 items-center gap-2"
                                                    >
                                                        <input
                                                            type="text"
                                                            autoFocus
                                                            value={
                                                                editSubcategoryName
                                                            }
                                                            onChange={(e) =>
                                                                setEditSubcategoryName(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1 text-sm font-medium text-foreground focus:border-blue-500 focus:outline-none"
                                                            required
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="cursor-pointer rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                                        >
                                                            <Check className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setEditingSubcategory(
                                                                    null,
                                                                )
                                                            }
                                                            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <>
                                                        <span className="truncate pr-2 text-sm font-medium">
                                                            {sub.name}
                                                        </span>
                                                        <div className="flex shrink-0 items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingSubcategory(
                                                                        sub.id,
                                                                    );
                                                                    setEditSubcategoryName(
                                                                        sub.name,
                                                                    );
                                                                }}
                                                                className="cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                                                            >
                                                                <Edit2 className="size-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteSubcategory(
                                                                        sub.id,
                                                                    )
                                                                }
                                                                className="shrink-0 cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ),
                                    )}
                                    {(activeCategory?.subcategory || [])
                                        .length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                            <Database className="mb-2 size-8 opacity-40" />
                                            <span className="text-xs font-semibold">
                                                No Subcategories Added Yet
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
                                <Database className="mb-2.5 size-10 opacity-30" />
                                <span className="text-sm font-semibold">
                                    Select a category on the left to manage its
                                    subcategories
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmLabel={confirmModal.confirmLabel}
                variant={confirmModal.variant}
                onClose={() =>
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }))
                }
                onConfirm={() => {
                    confirmModal.onConfirm();
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
            />
        </PageContainer>
    );
}

// Ensure the page gets the Admin Layout
AdminSyllabusIndex.layout = {
    breadcrumbs: [
        {
            title: 'Syllabus Settings',
            href: '/admin/syllabus',
        },
    ],
};
