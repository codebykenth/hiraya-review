<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'message' => fake()->paragraph(),
            'type' => fake()->randomElement(['info', 'warning', 'success']),
            'is_active' => true,
            'expires_at' => fake()->optional()->dateTimeBetween('now', '+30 days'),
        ];
    }
}
