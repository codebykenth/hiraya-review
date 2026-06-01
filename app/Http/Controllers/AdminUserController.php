<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminUserUpdateRequest;
use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    /**
     * Show all users with their statistics for the admin dashboard.
     */
    public function index(Request $request): Response
    {

        // Retrieve ALL users (including soft-deleted) and fetch their exam attempts count
        $users = User::withTrashed()
            ->latest()
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role ?? 'student',
                    'created_at' => $u->created_at ? $u->created_at->format('Y-m-d H:i') : 'N/A',
                    'last_login_at' => $u->last_login_at ? $u->last_login_at->format('Y-m-d H:i') : 'Never',
                    'is_active' => (bool) $u->is_active,
                    'terms_accepted_at' => $u->terms_accepted_at ? $u->terms_accepted_at->format('Y-m-d H:i') : null,
                    'deleted_at' => $u->deleted_at ? $u->deleted_at->format('Y-m-d H:i') : null,
                    'attempts_count' => ExamAttempt::where('user_id', $u->id)->count(),
                ];
            });

        // Statistics aggregates
        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_students' => User::where('role', 'user')->count(),
            'total_active' => User::where('is_active', true)->count(),
            'total_terms_accepted' => User::whereNotNull('terms_accepted_at')->count(),
            'total_attempts' => ExamAttempt::count(),
        ];

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'stats' => $stats,
        ]);
    }

    /**
     * Update user role.
     */
    public function update(AdminUserUpdateRequest $request, int $id): RedirectResponse
    {

        $validated = $request->validated();

        $user = User::findOrFail($id);

        // Security safeguard: Prevent logged in admin from demoting themselves
        if ($user->id === auth()->user()->id && $request->has('role') && $request->input('role') !== 'admin') {
            return back()->withErrors(['role' => 'You cannot demote yourself to maintain administrative access.']);
        }

        if ($request->has('role')) {
            $user->role = $request->input('role');
        }

        if ($request->has('is_active')) {
            // Prevent self-deactivation while logged in to avoid locking out the active admin
            if ($user->id === auth()->user()->id && $request->boolean('is_active') === false) {
                return back()->withErrors(['is_active' => 'You cannot deactivate your own account while logged in.']);
            }
            $user->is_active = $request->boolean('is_active');
        }

        $user->save();

        return back();
    }

    /**
     * Soft delete user account (archive).
     */
    public function destroy(int $id): RedirectResponse
    {

        $user = User::findOrFail($id);

        // Security safeguard: Prevent deleting your own account
        if ($user->id === auth()->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own active administrator account.']);
        }

        // Soft delete (archive) the user
        $user->delete();

        return back();
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore(int $id): RedirectResponse
    {

        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return back();
    }

    /**
     * Permanently delete a user (force delete).
     */
    public function forceDelete(int $id): RedirectResponse
    {

        $user = User::withTrashed()->findOrFail($id);

        // Security safeguard
        if ($user->id === auth()->user()->id) {
            return back()->withErrors(['user' => 'Cannot permanently delete your own account.']);
        }

        // Delete all associated attempts first
        ExamAttempt::where('user_id', $user->id)->delete();
        $user->forceDelete();

        return back();
    }
}
