<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;

class SystemController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/system/index', [
            'isMaintenanceMode' => App::isDownForMaintenance(),
            'environment' => App::environment(),
            'laravelVersion' => app()->version(),
            'phpVersion' => PHP_VERSION,
        ]);
    }

    public function clearCache()
    {
        Artisan::call('optimize:clear');

        return back()->with('success', 'System cache cleared successfully.');
    }

    public function optimize()
    {
        Artisan::call('optimize');

        return back()->with('success', 'System optimized successfully.');
    }

    public function runMigrations()
    {
        try {
            Artisan::call('migrate', ['--force' => true]);
            $output = Artisan::output();

            return back()->with('success', 'Migrations ran successfully: '.$output);
        } catch (\Exception $e) {
            return back()->with('error', 'Migration failed: '.$e->getMessage());
        }
    }

    public function rollbackMigrations()
    {
        try {
            // Note: rolling back migrations can cause massive data loss.
            Artisan::call('migrate:rollback', ['--force' => true]);
            $output = Artisan::output();

            return back()->with('success', 'Database rolled back successfully: '.$output);
        } catch (\Exception $e) {
            return back()->with('error', 'Rollback failed: '.$e->getMessage());
        }
    }

    public function toggleMaintenance(Request $request)
    {
        if (App::isDownForMaintenance()) {
            Artisan::call('up');

            return back()->with('success', 'Application is now LIVE.');
        } else {
            // Note: Custom CheckMaintenanceMode middleware allows Admins to automatically bypass
            // and allows access to the /login route.
            Artisan::call('down');

            return back()->with('success', 'Application is now in Maintenance Mode. You have automatic Admin bypass privileges.');
        }
    }
}
