<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\LearnModule;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LearnModule>
 */
class LearnModuleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence();

        return [
            'category_id' => Category::factory(),
            'subcategory_id' => Subcategory::factory(),
            'title' => $title,
            'slug' => str()->slug($title),
            'topic' => fake()->word(),
            'summary' => fake()->paragraph(),
            'content' => fake()->paragraphs(3, true),
            'estimated_minutes' => fake()->numberBetween(5, 30),
            'is_published' => true,
            'created_by' => User::factory(),
            'completed_by_user_ids' => [],
        ];
    }
}
