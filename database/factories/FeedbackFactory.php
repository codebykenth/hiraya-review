<?php

namespace Database\Factories;

use App\Models\Feedback;
use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Feedback>
 */
class FeedbackFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'flaggable_id' => Question::factory(),
            'flaggable_type' => 'App\\Models\\Question',
            'reason' => fake()->randomElement([
                'Typo / Spelling Error',
                'Incorrect Information / Answer',
                'Confusing Explanation',
                'AI Hallucination / Out of scope',
                'Broken Formatting / Layout',
                'Other',
            ]),
            'details' => fake()->optional()->paragraph(),
            'status' => 'pending',
        ];
    }
}
