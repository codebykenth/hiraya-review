<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Subcategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Check if test user exists before seeding to prevent duplicate key constraint
        // if (!User::where('email', 'test@example.com')->exists()) {
        //     User::factory()->create([
        //         'name' => 'Test User',
        //         'email' => 'test@example.com',
        //     ]);
        // }

        $this->seedOfficialScope();
    }

    /**
     * Automatically seed the official Civil Service Exam Scope if empty.
     */
    private function seedOfficialScope(): void
    {
        if (Category::count() > 0) {
            return;
        }

        $scope = [
            'General Information' => [
                'Philippine Constitution',
                'Code of Conduct and Ethical Standards (R.A. 6713)',
                'Peace and Human Rights Issues and Concepts',
                'Environment Management and Protection',
            ],
            'Verbal Ability' => [
                'Word meaning',
                'Sentence completion',
                'Error recognition',
                'Sentence structure',
                'Paragraph organization',
                'Reading comprehension',
            ],
            'Analytical Ability' => [
                'Word analogy',
                'Symbolic logic / abstract reasoning',
                'Identifying assumptions and drawing conclusions',
                'Data interpretation',
            ],
            'Numerical Ability' => [
                'Basic operations',
                'Number sequence',
                'Word problems',
            ],
            'Clerical Ability' => [
                'Filing',
                'Spelling',
            ],
        ];

        $order = 1;
        foreach ($scope as $catName => $subcats) {
            $category = Category::create([
                'name' => $catName,
                'slug' => Str::slug($catName),
                'is_demographic' => false,
                'sort_order' => $order++,
            ]);

            $subOrder = 1;
            foreach ($subcats as $subName) {
                Subcategory::create([
                    'category_id' => $category->id,
                    'name' => $subName,
                    'slug' => Str::slug($subName),
                    'language' => 'English',
                    'sort_order' => $subOrder++,
                ]);
            }
        }
    }
}
