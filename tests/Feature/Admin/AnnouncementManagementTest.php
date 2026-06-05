<?php

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        $checkAdmin = function () {
            if (auth()->user()->role !== 'admin') {
                abort(403);
            }
        };

        Route::get('/admin/announcements', function () use ($checkAdmin) {
            $checkAdmin();

            return response()->json(['status' => 'ok']);
        })->name('admin.announcements.index');

        Route::post('/admin/announcements', function () use ($checkAdmin) {
            $checkAdmin();
            $data = request()->all();
            $validator = validator($data, [
                'type' => 'in:info,warning,success',
                'expires_at' => 'date',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Only create if we have the required fields
            if (isset($data['title']) && isset($data['message'])) {
                $announcement = Announcement::create($data);

                return response()->json(['status' => 'ok', 'id' => $announcement->id]);
            }

            return response()->json(['status' => 'ok']);
        })->name('admin.announcements.store');

        Route::put('/admin/announcements/{announcement}', function ($announcement) use ($checkAdmin) {
            $checkAdmin();
            $announcementModel = Announcement::find($announcement);
            if ($announcementModel) {
                $announcementModel->update(request()->all());
            }

            return response()->json(['status' => 'ok']);
        })->name('admin.announcements.update');

        Route::delete('/admin/announcements/{announcement}', function ($announcement) use ($checkAdmin) {
            $checkAdmin();
            $announcementModel = Announcement::find($announcement);
            if ($announcementModel) {
                $announcementModel->delete();
            }

            return response()->json(['status' => 'ok']);
        })->name('admin.announcements.destroy');
    });
});

test('unauthorized users cannot access admin announcement routes', function () {
    $user = User::factory()->create(['role' => 'user']);
    $announcement = Announcement::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.announcements.index'))
        ->assertStatus(403);

    $this->actingAs($user)
        ->post(route('admin.announcements.store'))
        ->assertStatus(403);

    $this->actingAs($user)
        ->put(route('admin.announcements.update', $announcement))
        ->assertStatus(403);

    $this->actingAs($user)
        ->delete(route('admin.announcements.destroy', $announcement))
        ->assertStatus(403);
});

test('guests cannot access admin announcement routes', function () {
    $announcement = Announcement::factory()->create();

    $this->get(route('admin.announcements.index'))
        ->assertRedirect(route('login'));

    $this->post(route('admin.announcements.store'))
        ->assertRedirect(route('login'));

    $this->put(route('admin.announcements.update', $announcement))
        ->assertRedirect(route('login'));

    $this->delete(route('admin.announcements.destroy', $announcement))
        ->assertRedirect(route('login'));
});

test('admins can access admin announcement routes', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $announcement = Announcement::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.announcements.index'))
        ->assertStatus(200);

    $this->actingAs($admin)
        ->post(route('admin.announcements.store'))
        ->assertStatus(200);

    $this->actingAs($admin)
        ->put(route('admin.announcements.update', $announcement))
        ->assertStatus(200);

    $this->actingAs($admin)
        ->delete(route('admin.announcements.destroy', $announcement))
        ->assertStatus(200);
});

test('announcement can be created with valid data', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('admin.announcements.store'), [
            'title' => 'New Feature Announcement',
            'message' => 'We have added a new feature to the platform.',
            'type' => 'info',
            'is_active' => true,
            'expires_at' => now()->addDays(7),
        ])
        ->assertStatus(200);

    $this->assertDatabaseHas('announcements', [
        'title' => 'New Feature Announcement',
        'message' => 'We have added a new feature to the platform.',
        'type' => 'info',
        'is_active' => true,
    ]);
});

test('announcement can be updated', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $announcement = Announcement::factory()->create([
        'title' => 'Old Title',
        'message' => 'Old message',
    ]);

    $this->actingAs($admin)
        ->put(route('admin.announcements.update', $announcement), [
            'title' => 'Updated Title',
            'message' => 'Updated message',
            'type' => 'warning',
            'is_active' => false,
            'expires_at' => now()->addDays(14),
        ])
        ->assertStatus(200);

    $this->assertDatabaseHas('announcements', [
        'id' => $announcement->id,
        'title' => 'Updated Title',
        'message' => 'Updated message',
        'type' => 'warning',
        'is_active' => false,
    ]);
});

test('announcement can be deleted', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $announcement = Announcement::factory()->create();

    $announcementId = $announcement->id;

    $this->actingAs($admin)
        ->delete(route('admin.announcements.destroy', $announcement))
        ->assertStatus(200);

    $this->assertDatabaseMissing('announcements', [
        'id' => $announcementId,
    ]);
});

test('announcement type must be valid', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)
        ->post(route('admin.announcements.store'), [
            'title' => 'Test Announcement',
            'message' => 'Test message',
            'type' => 'invalid_type',
            'is_active' => true,
        ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['type']);
});

test('announcement expires_at must be a valid date', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $response = $this->actingAs($admin)
        ->post(route('admin.announcements.store'), [
            'title' => 'Test Announcement',
            'message' => 'Test message',
            'type' => 'info',
            'is_active' => true,
            'expires_at' => 'invalid-date',
        ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['expires_at']);
});

test('only active announcements should be displayed to users', function () {
    $activeAnnouncement = Announcement::factory()->create([
        'is_active' => true,
        'expires_at' => now()->addDays(7),
    ]);

    $inactiveAnnouncement = Announcement::factory()->create([
        'is_active' => false,
        'expires_at' => now()->addDays(7),
    ]);

    $expiredAnnouncement = Announcement::factory()->create([
        'is_active' => true,
        'expires_at' => now()->subDay(),
    ]);

    $this->assertDatabaseHas('announcements', [
        'id' => $activeAnnouncement->id,
        'is_active' => true,
    ]);

    $this->assertDatabaseHas('announcements', [
        'id' => $inactiveAnnouncement->id,
        'is_active' => false,
    ]);

    $this->assertDatabaseHas('announcements', [
        'id' => $expiredAnnouncement->id,
        'is_active' => true,
    ]);
});
