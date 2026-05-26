<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AdminUserController extends Controller
{
    /**
     * Helper to verify if the active user is an administrator.
     */
    private function checkAdminAccess(): void
    {
        if (!auth()->user() || auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized access to user administration.');
        }
    }

    /**
     * Show all users with their statistics for the admin dashboard.
     */
    public function index(Request $request): Response
    {
        $this->checkAdminAccess();

        // Retrieve all users and fetch their exam attempts count
        $users = User::latest()
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role ?? 'student',
                    'created_at' => $u->created_at ? $u->created_at->format('Y-m-d H:i') : 'N/A',
                    'attempts_count' => ExamAttempt::where('user_id', $u->id)->count(),
                ];
            });

        // Statistics aggregates
        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_students' => User::where('role', 'student')->count(),
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
    public function update(Request $request, int $id): RedirectResponse
    {
        $this->checkAdminAccess();

        $request->validate([
            'role' => 'required|string|in:admin,student',
        ]);

        $user = User::findOrFail($id);

        // Security safeguard: Prevent logged in admin from demoting themselves
        if ($user->id === auth()->user()->id && $request->role !== 'admin') {
            return back()->withErrors(['role' => 'You cannot demote yourself to maintain administrative access.']);
        }

        $user->role = $request->role;
        $user->save();

        return back();
    }

    /**
     * Delete user account.
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->checkAdminAccess();

        $user = User::findOrFail($id);

        // Security safeguard: Prevent deleting your own account
        if ($user->id === auth()->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own active administrator account.']);
        }

        // Delete all associated attempts first to ensure foreign key constraint integrity
        ExamAttempt::where('user_id', $user->id)->delete();
        $user->delete();

        return back();
    }
}
