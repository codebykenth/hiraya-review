<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->word();

        return [
            'name' => ucfirst($name),
            'slug' => str()->slug($name),
            'is_demographic' => fake()->boolean(20), // 20% chance of being demographic
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
