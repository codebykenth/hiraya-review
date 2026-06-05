import { router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    XCircle,
    Lock,
    Unlock,
    Trash2,
    RotateCcw,
} from 'lucide-react';
import React, { useState } from 'react';
import { ConfirmModal } from '@/components/shared/confirm-modal';
import { Button } from '@/components/ui/button';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'student';
    is_active: boolean;
    deleted_at?: string | null;
    terms_accepted_at?: string | null;
    last_login_at?: string | null;
    created_at: string;
    attempts_count: number;
}

interface UserDetailModalProps {
    isOpen: boolean;
    user?: User;
    currentUserId: number;
    onClose: () => void;
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) {
        return 'Never';
    }

    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function UserDetailModal({
    isOpen,
    user,
    currentUserId,
    onClose,
}: UserDetailModalProps) {
    const [confirmAction, setConfirmAction] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'danger' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        variant: 'success',
        onConfirm: () => {},
    });

    if (!isOpen || !user) {
        return null;
    }

    const isCurrentUser = user.id === currentUserId;
    const isDeleted = !!user.deleted_at;
    const isActive = user.is_active;
    const termsAccepted = !!user.terms_accepted_at;

    const showConfirm = (
        title: string,
        message: string,
        variant: 'danger' | 'success' | 'info',
        onConfirm: () => void,
    ) => {
        setConfirmAction({ isOpen: true, title, message, variant, onConfirm });
    };

    const handlePromote = () => {
        if (isCurrentUser) {
            showConfirm(
                'Cannot Change Role',
                'You cannot change your own role',
                'info',
                () => {},
            );

            return;
        }

        showConfirm(
            'Promote to Administrator',
            `Are you sure you want to promote ${user.name} to administrator?`,
            'success',
            () => {
                router.put(
                    `/admin/users/${user.id}`,
                    { role: 'admin' },
                    { preserveScroll: true, onSuccess: () => onClose() },
                );
            },
        );
    };

    const handleDemote = () => {
        if (isCurrentUser) {
            showConfirm(
                'Cannot Demote',
                'You cannot demote yourself',
                'info',
                () => {},
            );

            return;
        }

        showConfirm(
            'Demote to Student',
            `Are you sure you want to demote ${user.name} to student?`,
            'danger',
            () => {
                router.put(
                    `/admin/users/${user.id}`,
                    { role: 'user' },
                    { preserveScroll: true, onSuccess: () => onClose() },
                );
            },
        );
    };

    const handleToggleStatus = () => {
        if (isCurrentUser) {
            showConfirm(
                'Cannot Change Status',
                'You cannot change your own status',
                'info',
                () => {},
            );

            return;
        }

        showConfirm(
            isActive ? 'Deactivate Account' : 'Activate Account',
            `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} ${user.name}'s account?`,
            'warning' as any,
            () => {
                router.put(
                    `/admin/users/${user.id}`,
                    { is_active: !isActive },
                    { preserveScroll: true, onSuccess: () => onClose() },
                );
            },
        );
    };

    const handleDelete = () => {
        if (isCurrentUser) {
            showConfirm(
                'Cannot Delete',
                'You cannot delete your own account',
                'info',
                () => {},
            );

            return;
        }

        showConfirm(
            'Delete Account',
            `Archive ${user.name}'s account? They can be restored later.`,
            'danger',
            () => {
                router.delete(`/admin/users/${user.id}`, {
                    preserveScroll: true,
                    onSuccess: () => onClose(),
                });
            },
        );
    };

    const handleRestore = () => {
        showConfirm(
            'Restore Account',
            `Are you sure you want to restore ${user.name}'s account?`,
            'success',
            () => {
                router.post(
                    `/admin/users/${user.id}/restore`,
                    {},
                    { preserveScroll: true, onSuccess: () => onClose() },
                );
            },
        );
    };

    const handleForceDelete = () => {
        showConfirm(
            'Permanently Delete Account',
            `This will permanently and irreversibly delete ${user.name}'s account and all associated data. This cannot be undone!`,
            'danger',
            () => {
                router.post(
                    `/admin/users/${user.id}/force-delete`,
                    {},
                    { preserveScroll: true, onSuccess: () => onClose() },
                );
            },
        );
    };

    return (
        <>
            <div
                className="fixed inset-0 z-100 flex animate-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-200 fade-in"
                onClick={onClose}
            >
                <div
                    className="relative flex max-h-[90vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl duration-205 zoom-in-95 dark:border-slate-800 dark:bg-slate-950"
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="group focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none transition-all duration-300 active:scale-95 absolute top-4 right-4 z-10 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none dark:hover:bg-slate-900 dark:hover:text-slate-200"
                        aria-label="Close dialog"
                    >
                        <svg
                            className="size-4.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>

                    <div className="flex-1 overflow-y-auto p-6 pr-5">
                        {/* Header */}
                        <div className="pr-6">
                            <h3 className="font-heading text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                User Details
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                Complete profile information for {user.name}
                            </p>
                        </div>

                        {/* Status Badges */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            {/* Account Status Badge */}
                            {isDeleted ? (
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-rose-100 bg-rose-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-rose-700 uppercase dark:border-rose-900/30 dark:bg-rose-950/20 dark:bg-rose-950/30 dark:text-rose-400">
                                    <Trash2 className="size-3" />
                                    Deleted
                                </div>
                            ) : isActive ? (
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-emerald-700 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                                    <CheckCircle className="size-3" />
                                    Active
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-amber-700 uppercase dark:border-amber-900/30 dark:bg-amber-950/20 dark:bg-amber-950/30 dark:text-amber-400">
                                    <XCircle className="size-3" />
                                    Inactive
                                </div>
                            )}

                            {/* Role Badge */}
                            {user.role === 'admin' ? (
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-indigo-700 uppercase dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:bg-indigo-950/30 dark:text-indigo-400">
                                    <Lock className="size-3" />
                                    Administrator
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-emerald-700 uppercase dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:bg-emerald-950/30 dark:text-emerald-400">
                                    Student
                                </div>
                            )}

                            {/* Terms Acceptance Badge */}
                            {termsAccepted ? (
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-blue-700 uppercase dark:border-blue-900/30 dark:bg-blue-950/20 dark:bg-blue-950/30 dark:text-blue-400">
                                    <CheckCircle className="size-3" />
                                    Terms Accepted
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold tracking-wide text-amber-700 uppercase dark:border-amber-900/30 dark:bg-amber-950/20 dark:bg-amber-950/30 dark:text-amber-400">
                                    <XCircle className="size-3" />
                                    Pending
                                </div>
                            )}
                        </div>

                        {/* Profile Details Grid */}
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Name */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                                    Full Name
                                </label>
                                <p className="mt-1 text-base leading-relaxed font-bold text-slate-900 dark:text-white">
                                    {user.name}
                                    {isCurrentUser && (
                                        <span className="ml-2 inline-block rounded-sm bg-blue-100 px-1.5 text-[8px] font-extrabold text-blue-700 uppercase dark:bg-blue-900/30 dark:text-blue-400">
                                            You
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                                    Email Address
                                </label>
                                <p className="mt-1 text-base leading-relaxed font-bold text-slate-900 dark:text-white">
                                    {user.email}
                                </p>
                            </div>

                            {/* Registration Date */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                                    Registered On
                                </label>
                                <div className="mt-1 flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                                    <Calendar className="size-4 text-blue-500" />
                                    <span className="font-bold">
                                        {formatDate(user.created_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Last Login */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                                    Last Login
                                </label>
                                <p className="mt-1 text-base leading-relaxed font-bold text-slate-900 dark:text-white">
                                    {formatDate(user.last_login_at)}
                                </p>
                            </div>

                            {/* Terms Accepted Date */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                                    Terms Accepted
                                </label>
                                <p className="mt-1 text-base leading-relaxed font-bold text-slate-900 dark:text-white">
                                    {termsAccepted
                                        ? formatDate(user.terms_accepted_at)
                                        : 'Not accepted'}
                                </p>
                            </div>

                            {/* Mock Attempts */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase dark:text-slate-400">
                                    Mock Attempts
                                </label>
                                <p className="mt-1 text-base leading-relaxed font-bold text-slate-900 dark:text-white">
                                    {user.attempts_count} exam
                                    {user.attempts_count !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 dark:border-slate-900">
                            {isDeleted ? (
                                <>
                                    {/* Deleted User Actions */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleRestore}
                                            className="gap-2"
                                        >
                                            <RotateCcw className="size-3.5" />
                                            Restore Account
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleForceDelete}
                                            className="gap-2"
                                        >
                                            <Trash2 className="size-3.5" />
                                            Permanently Delete
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Active User Actions */}
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {user.role === 'admin' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleDemote}
                                                disabled={isCurrentUser}
                                                className="gap-2"
                                            >
                                                <Unlock className="size-3.5" />
                                                Demote to Student
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={handlePromote}
                                                disabled={isCurrentUser}
                                                className="gap-2"
                                            >
                                                <Lock className="size-3.5" />
                                                Promote to Admin
                                            </Button>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleToggleStatus}
                                            disabled={isCurrentUser}
                                            className="gap-2"
                                        >
                                            {isActive ? (
                                                <>
                                                    <XCircle className="size-3.5" />
                                                    Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="size-3.5" />
                                                    Activate
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleDelete}
                                        disabled={isCurrentUser}
                                        className="gap-2"
                                    >
                                        <Trash2 className="size-3.5" />
                                        Delete Account
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 p-6 pt-4 dark:border-slate-900">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            className="h-9 cursor-pointer px-4.5 text-xs font-bold focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmAction.isOpen}
                title={confirmAction.title}
                message={confirmAction.message}
                variant={confirmAction.variant}
                confirmLabel={
                    confirmAction.variant === 'danger' ? 'Delete' : 'Confirm'
                }
                onClose={() =>
                    setConfirmAction({ ...confirmAction, isOpen: false })
                }
                onConfirm={confirmAction.onConfirm}
            />
        </>
    );
}
