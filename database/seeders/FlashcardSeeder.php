<?php

namespace Database\Seeders;

use App\Models\Flashcard;
use App\Models\FlashcardDeck;
use Illuminate\Database\Seeder;

class FlashcardSeeder extends Seeder
{
    public function run(): void
    {
        // Deck 1: R.A. 6713 Code of Conduct
        $deck1 = FlashcardDeck::firstOrCreate(
            ['title' => 'R.A. 6713 Code of Conduct & Ethical Standards'],
            [
                'category' => 'General Information',
                'description' => 'Essential norms, duties, and prohibited acts for public officials and employees.',
                'is_system' => true,
            ]
        );

        Flashcard::firstOrCreate([
            'deck_id' => $deck1->id,
            'front_content' => 'What is the primary objective of R.A. 6713?',
            'back_content' => 'To promote a high standard of ethics and accountability in public service.',
            'explanation' => 'Enacted in 1989 to mandate ethical standards and accountability across all government offices.',
        ]);

        Flashcard::firstOrCreate([
            'deck_id' => $deck1->id,
            'front_content' => 'Within how many working days must public officials respond to letters and requests from the public?',
            'back_content' => '15 working days',
            'explanation' => 'Section 5(a) of R.A. 6713 mandates written responses within 15 working days from receipt.',
        ]);

        // Deck 2: 1987 Philippine Constitution
        $deck2 = FlashcardDeck::firstOrCreate(
            ['title' => '1987 Philippine Constitution Core Concepts'],
            [
                'category' => 'General Information',
                'description' => 'Key articles, Bill of Rights, and three branches of Philippine government.',
                'is_system' => true,
            ]
        );

        Flashcard::firstOrCreate([
            'deck_id' => $deck2->id,
            'front_content' => 'Which article of the 1987 Constitution contains the Bill of Rights?',
            'back_content' => 'Article III',
            'explanation' => 'Article III guarantees fundamental civil and political rights of Filipino citizens.',
        ]);

        Flashcard::firstOrCreate([
            'deck_id' => $deck2->id,
            'front_content' => 'What are the 3 independent Constitutional Commissions under Article IX?',
            'back_content' => '1. Civil Service Commission (CSC)\n2. Commission on Elections (COMELEC)\n3. Commission on Audit (COA)',
            'explanation' => 'These 3 commissions are constitutionally independent bodies.',
        ]);

        // Deck 3: Math Formulas & Quick Shortcuts
        $deck3 = FlashcardDeck::firstOrCreate(
            ['title' => 'Civil Service Math Shortcuts & Formulas'],
            [
                'category' => 'Numerical Ability',
                'description' => 'Essential formulas for Speed, Work, Interest, Percentages, and PEMDAS.',
                'is_system' => true,
            ]
        );

        Flashcard::firstOrCreate([
            'deck_id' => $deck3->id,
            'front_content' => 'What is the combined work rate formula for two people working together?',
            'back_content' => 'Time = (A × B) / (A + B)',
            'explanation' => 'Where A and B are the individual hours taken to complete the job alone.',
        ]);
    }
}
