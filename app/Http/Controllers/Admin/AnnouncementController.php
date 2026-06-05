<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAnnouncementRequest;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $announcements = Announcement::latest()->paginate(15);

        return Inertia::render('admin/announcements/index', [
            'announcements' => $announcements,
        ]);
    }

    public function store(StoreAnnouncementRequest $request): RedirectResponse
    {
        Announcement::create($request->validated());
        Cache::forget('active_announcements');

        return back()->with('success', 'Announcement created successfully.');
    }

    public function update(StoreAnnouncementRequest $request, Announcement $announcement): RedirectResponse
    {
        $announcement->update($request->validated());
        Cache::forget('active_announcements');

        return back()->with('success', 'Announcement updated successfully.');
    }

    public function destroy(Announcement $announcement): RedirectResponse
    {
        $announcement->delete();
        Cache::forget('active_announcements');

        return back()->with('success', 'Announcement deleted successfully.');
    }
}
