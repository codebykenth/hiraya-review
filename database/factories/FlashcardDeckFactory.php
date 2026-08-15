<?php

namespace Database\Factories;

use App\Models\FlashcardDeck;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FlashcardDeck>
 */
class FlashcardDeckFactory extends Factory
{
    protected $model = FlashcardDeck::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'category' => fake()->word(),
            'description' => fake()->paragraph(),
            'is_system' => false,
        ];
    }

    public function system(): static
    {
        return $this->state(fn () => [
            'user_id' => null,
            'is_system' => true,
        ]);
    }
}
