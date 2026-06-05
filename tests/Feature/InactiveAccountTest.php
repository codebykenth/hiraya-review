<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InactiveAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_inactive_user_is_redirected_from_authenticated_pages(): void
    {
        $user = User::factory()->create(['is_active' => false]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertRedirect(route('account-inactive'));
    }

    public function test_inactive_user_info_is_passed_to_frontend(): void
    {
        $user = User::factory()->create(['is_active' => false]);

        $this->actingAs($user)
            ->get('/account-inactive')
            ->assertInertia(fn (Assert $page) => $page
                ->component('account-inactive')
                ->where('auth.user.is_active', false)
            );
    }

    public function test_active_user_can_access_authenticated_pages(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertSuccessful();
    }

    public function test_logout_works_for_inactive_user(): void
    {
        $user = User::factory()->create(['is_active' => false]);

        $this->actingAs($user)
            ->post('/logout')
            ->assertRedirect('/');

        $this->assertGuest();
    }
}
