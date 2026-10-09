<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ViewManagement\UpdateViewManagementRequest;
use App\Models\RolePermission;
use Illuminate\Support\Facades\Cache;

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
            'ai-tutor' => 'AI Tutor',
            'practice-drills' => 'Practice Drills',
            'mock-exams' => 'Mock Exams',
            'history' => 'History & Results',
            'analytics' => 'Analytics',
        ];

        // Only include billing/payments in view management if Xendit is configured
        if (! empty(config('xendit.secret_key'))) {
            $availableViews['billing'] = 'Billing & Payments';
        }

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

        return $this->render('admin/view-management/index', [
            'permissions' => $permissions,
            'availableViews' => $availableViews,
        ]);
    }

    public function update(UpdateViewManagementRequest $request)
    {
        $validated = $request->validated();

        foreach ($validated['permissions'] as $perm) {
            RolePermission::where('id', $perm['id'])->update([
                'is_visible' => $perm['is_visible'],
            ]);
        }

        Cache::forget('role_permissions');

        return $this->backWithSuccess('View permissions updated successfully.');
    }
}
