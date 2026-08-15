<?php

namespace Database\Factories;

use App\Models\Flashcard;
use App\Models\FlashcardDeck;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Flashcard>
 */
class FlashcardFactory extends Factory
{
    protected $model = Flashcard::class;

    public function definition(): array
    {
        return [
            'deck_id' => FlashcardDeck::factory(),
            'front_content' => fake()->sentence(6),
            'back_content' => fake()->sentence(4),
            'explanation' => fake()->paragraph(),
        ];
    }
}
