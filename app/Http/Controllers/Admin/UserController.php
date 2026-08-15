<?php

namespace App\Http\Controllers\Admin;

use App\Http\Requests\AdminUserUpdateRequest;
use App\Models\ExamAttempt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController
{
    /**
     * Show all users with their statistics for the admin dashboard.
     */
    public function index(Request $request): Response
    {
        // Eager load attempts_count, mock_exams_count, and drills_count using withCount to eliminate N+1 queries
        $users = User::withCount([
            'examAttempts as attempts_count',
            'examAttempts as mock_exams_count' => function ($query) {
                $query->whereNull('category_id');
            },
            'examAttempts as drills_count' => function ($query) {
                $query->whereNotNull('category_id');
            },
        ])
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
                    'deleted_at' => null,
                    'attempts_count' => (int) $u->attempts_count,
                    'mock_exams_count' => (int) $u->mock_exams_count,
                    'drills_count' => (int) $u->drills_count,
                    'pdf_downloads_count' => (int) $u->pdf_downloads_count,
                    'can_download_pdf' => (bool) $u->can_download_pdf,
                ];
            });

        // Statistics aggregates
        $stats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_students' => User::whereIn('role', ['user', 'student'])->count(),
            'total_active' => User::where('is_active', true)->count(),
            'total_terms_accepted' => User::whereNotNull('terms_accepted_at')->count(),
            'total_attempts' => ExamAttempt::count(),
            'total_pdf_downloads' => (int) User::sum('pdf_downloads_count'),
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

        if ($request->has('can_download_pdf')) {
            $user->can_download_pdf = $request->boolean('can_download_pdf');
        }

        $user->save();

        return back();
    }

    /**
     * Permanently delete user account.
     */
    public function destroy(int $id): RedirectResponse
    {

        $user = User::findOrFail($id);

        // Security safeguard: Prevent deleting your own account
        if ($user->id === auth()->user()->id) {
            return back()->withErrors(['user' => 'You cannot delete your own active administrator account.']);
        }

        $user->delete();

        return back();
    }
}
