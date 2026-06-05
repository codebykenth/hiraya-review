<?php

namespace Database\Factories;

use App\Models\Question;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Question>
 */
class QuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subcategory_id' => Subcategory::factory(),
            'language' => 'en',
            'stem' => fake()->sentence().'?',
            'options' => fake()->words(4),
            'correct_option' => fake()->numberBetween(0, 3),
            'explanation' => fake()->paragraph(),
            'created_by' => User::factory(),
            'status' => 'active',
        ];
    }
}
