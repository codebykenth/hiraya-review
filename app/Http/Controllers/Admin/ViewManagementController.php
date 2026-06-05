<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateViewManagementRequest;
use App\Models\RolePermission;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ViewManagementController extends Controller
{
    public function index()
    {
        // Define all views we want to manage
        $availableViews = [
            'dashboard' => 'User Dashboard',
            'reviewer-guide' => 'Reviewer Guide',
            'study-plan' => 'Study Plan',
            'learn' => 'Learn Modules',
            'practice-drills' => 'Practice Drills',
            'mock-exams' => 'Mock Exams',
            'history' => 'History & Results',
            'analytics' => 'Analytics',
        ];

        // Ensure defaults exist for both roles
        $roles = ['admin', 'user'];
        
        foreach ($roles as $role) {
            foreach ($availableViews as $viewName => $label) {
                RolePermission::firstOrCreate(
                    ['role' => $role, 'view_name' => $viewName],
                    ['is_visible' => true]
                );
            }
        }

        $permissions = RolePermission::orderBy('role')->orderBy('view_name')->get();

        return Inertia::render('admin/view-management/index', [
            'permissions' => $permissions,
            'availableViews' => $availableViews,
        ]);
    }

    public function update(UpdateViewManagementRequest $request)
    {
        $validated = $request->validated();

        foreach ($validated['permissions'] as $perm) {
            RolePermission::where('id', $perm['id'])->update([
                'is_visible' => $perm['is_visible']
            ]);
        }

        Cache::forget('role_permissions');

        return redirect()->back()->with('success', 'View permissions updated successfully.');
    }
}
