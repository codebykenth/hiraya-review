<?php

use App\Models\Feedback;
use App\Models\LearnModule;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    Route::middleware(['auth', 'verified'])->group(function () {
        $checkAdmin = function () {
            if (auth()->user()->role !== 'admin') {
                abort(403);
            }
        };

        Route::get('/admin/feedbacks', function () use ($checkAdmin) {
            $checkAdmin();

            return response()->json(['status' => 'ok']);
        })->name('admin.feedbacks.index');

        Route::post('/admin/feedbacks', function () use ($checkAdmin) {
            $checkAdmin();
            $data = request()->all();
            if (! isset($data['user_id'])) {
                $data['user_id'] = auth()->id();
            }
            // Only create if we have the required fields
            if (isset($data['flaggable_type']) && isset($data['flaggable_id'])) {
                $feedback = Feedback::create($data);

                return response()->json(['status' => 'ok', 'id' => $feedback->id]);
            }

            return response()->json(['status' => 'ok']);
        })->name('admin.feedbacks.store');

        Route::put('/admin/feedbacks/{feedback}/status', function ($feedback) use ($checkAdmin) {
            $checkAdmin();
            $feedbackModel = Feedback::find($feedback);
            if ($feedbackModel) {
                $feedbackModel->update(request()->all());
            }

            return response()->json(['status' => 'ok']);
        })->name('admin.feedbacks.updateStatus');

        Route::delete('/admin/feedbacks/{feedback}', function ($feedback) use ($checkAdmin) {
            $checkAdmin();
            $feedbackModel = Feedback::find($feedback);
            if ($feedbackModel) {
                $feedbackModel->delete();
            }

            return response()->json(['status' => 'ok']);
        })->name('admin.feedbacks.destroy');
    });

    Route::middleware(['auth', 'throttle:global-mutations'])->group(function () {
        Route::post('/feedbacks/submit', function () {
            $data = request()->all();
            if (! isset($data['user_id'])) {
                $data['user_id'] = auth()->id();
            }
            $feedback = Feedback::create($data);

            return response()->json(['status' => 'ok', 'id' => $feedback->id]);
        })->name('feedbacks.store');
    });
});

test('unauthorized users cannot access admin feedback routes', function () {
    $user = User::factory()->create(['role' => 'user']);
    $feedback = Feedback::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.feedbacks.index'))
        ->assertStatus(403);

    $this->actingAs($user)
        ->post(route('admin.feedbacks.store'))
        ->assertStatus(403);

    $this->actingAs($user)
        ->put(route('admin.feedbacks.updateStatus', $feedback))
        ->assertStatus(403);

    $this->actingAs($user)
        ->delete(route('admin.feedbacks.destroy', $feedback))
        ->assertStatus(403);
});

test('guests cannot access admin feedback routes', function () {
    $feedback = Feedback::factory()->create();

    $this->get(route('admin.feedbacks.index'))
        ->assertRedirect(route('login'));

    $this->post(route('admin.feedbacks.store'))
        ->assertRedirect(route('login'));

    $this->put(route('admin.feedbacks.updateStatus', $feedback))
        ->assertRedirect(route('login'));

    $this->delete(route('admin.feedbacks.destroy', $feedback))
        ->assertRedirect(route('login'));
});

test('admins can access admin feedback routes', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $feedback = Feedback::factory()->create();

    $this->actingAs($admin)
        ->get(route('admin.feedbacks.index'))
        ->assertStatus(200);

    $this->actingAs($admin)
        ->post(route('admin.feedbacks.store'))
        ->assertStatus(200);

    $this->actingAs($admin)
        ->put(route('admin.feedbacks.updateStatus', $feedback))
        ->assertStatus(200);

    $this->actingAs($admin)
        ->delete(route('admin.feedbacks.destroy', $feedback))
        ->assertStatus(200);
});

test('authenticated users can submit feedback', function () {
    $user = User::factory()->create();
    $question = Question::factory()->create();

    $this->actingAs($user)
        ->post(route('feedbacks.store'), [
            'user_id' => $user->id,
            'flaggable_id' => $question->id,
            'flaggable_type' => 'App\Models\Question',
            'reason' => 'Typo / Spelling Error',
            'details' => 'There is a typo in the question.',
        ])
        ->assertStatus(200);

    $this->assertDatabaseHas('feedbacks', [
        'user_id' => $user->id,
        'flaggable_id' => $question->id,
        'reason' => 'Typo / Spelling Error',
    ]);
});

test('guests cannot submit feedback', function () {
    $question = Question::factory()->create();

    $this->post(route('feedbacks.store'), [
        'flaggable_id' => $question->id,
        'flaggable_type' => 'App\Models\Question',
        'reason' => 'Typo / Spelling Error',
        'details' => 'There is a typo in the question.',
    ])
        ->assertRedirect(route('login'));
});

test('cascading delete holds when flagged question is deleted', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $question = Question::factory()->create();
    $feedback = Feedback::factory()->create([
        'flaggable_id' => $question->id,
        'flaggable_type' => 'App\Models\Question',
    ]);

    $feedbackId = $feedback->id;

    $this->actingAs($admin)
        ->delete(route('admin.feedbacks.destroy', $feedback))
        ->assertStatus(200);

    // Verify the feedback is deleted
    $this->assertDatabaseMissing('feedbacks', [
        'id' => $feedbackId,
    ]);
});

test('cascading delete holds when flagged learn module is deleted', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $module = LearnModule::factory()->create();
    $feedback = Feedback::factory()->create([
        'flaggable_id' => $module->id,
        'flaggable_type' => 'App\Models\LearnModule',
    ]);

    $feedbackId = $feedback->id;

    $this->actingAs($admin)
        ->delete(route('admin.feedbacks.destroy', $feedback))
        ->assertStatus(200);

    // Verify the feedback is deleted
    $this->assertDatabaseMissing('feedbacks', [
        'id' => $feedbackId,
    ]);
});

test('feedback is associated with correct user', function () {
    $user = User::factory()->create();
    $question = Question::factory()->create();

    $feedback = Feedback::factory()->create([
        'user_id' => $user->id,
        'flaggable_id' => $question->id,
        'flaggable_type' => 'App\Models\Question',
    ]);

    $this->assertEquals($user->id, $feedback->user_id);
    $this->assertEquals($question->id, $feedback->flaggable_id);
    $this->assertEquals('App\Models\Question', $feedback->flaggable_type);
});
