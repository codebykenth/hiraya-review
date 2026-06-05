<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subcategory>
 */
class SubcategoryFactory extends Factory
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
            'category_id' => Category::factory(),
            'name' => ucfirst($name),
            'slug' => str()->slug($name),
            'language' => 'en',
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
