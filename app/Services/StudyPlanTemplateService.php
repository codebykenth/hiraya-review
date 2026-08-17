<?php

namespace App\Services;

use App\Models\StudySchedule;
use App\Models\Subcategory;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StudyPlanTemplateService
{
    /**
     * Get all available template manifests.
     *
     * @return array<string, array{id: string, title: string, subtitle: string, category: string, duration_days: int, badge: string, description: string, topics: string[]}>
     */
    public function getTemplates(): array
    {
        return [
            '60_day_deep_mastery' => [
                'id' => '60_day_deep_mastery',
                'title' => '60-Day Deep Mastery Track',
                'subtitle' => 'Thorough 2-month pace covering all syllabus concepts',
                'category' => 'comprehensive',
                'duration_days' => 60,
                'badge' => 'Complete Mastery',
                'description' => 'A relaxed, in-depth daily pace (1 topic per day) with foundational reviews, weekly skill checkpoints, and bi-weekly full mock exams.',
                'topics' => [
                    'Days 1-15: Verbal Ability & English Mechanics (Grammar, Vocab, Reading)',
                    'Days 16-30: Numerical Ability & Problem Solving (Fractions, Algebra, Word Problems)',
                    'Days 31-45: Analytical Ability & Deductive Logic (Analogies, Syllogisms, Series)',
                    'Days 46-52: General Information, Philippine Constitution & RA 6713 Ethics',
                    'Days 53-60: Comprehensive Mock Exam Marathon & Weakness Targeted Drills',
                ],
            ],
            '30_day_comprehensive' => [
                'id' => '30_day_comprehensive',
                'title' => '30-Day Complete CSE Sprint',
                'subtitle' => 'Full syllabus coverage with weekly mock exams',
                'category' => 'comprehensive',
                'duration_days' => 30,
                'badge' => 'Most Popular',
                'description' => 'A balanced daily study regimen covering Verbal, Numerical, Analytical, and General Information with built-in review checkpoints.',
                'topics' => [
                    'Days 1-7: Verbal Ability & Grammar Mastery',
                    'Days 8-14: Numerical Ability & Problem Solving',
                    'Days 15-21: Analytical Ability & Logical Reasoning',
                    'Days 22-26: Philippine Constitution & RA 6713',
                    'Days 27-30: Full Mock Exam Simulations & Drills',
                ],
            ],
            '14_day_crash_course' => [
                'id' => '14_day_crash_course',
                'title' => '14-Day High-Yield Crash Course',
                'subtitle' => 'Accelerated high-frequency exam topics',
                'category' => 'comprehensive',
                'duration_days' => 14,
                'badge' => 'Fast Track',
                'description' => 'Designed for busy examinees to quickly review top-tested formulas, vocabulary, logic patterns, and constitution essentials.',
                'topics' => [
                    'Day 1-4: High-frequency Grammar, Vocabulary & Analogy',
                    'Day 5-8: Math Shortcuts, Percentage, Ratio & Word Problems',
                    'Day 9-11: Deductive Logic, Series & Data Interpretation',
                    'Day 12-14: General Info, RA 6713 & Final Full Mock',
                ],
            ],
            '7_day_final_cram' => [
                'id' => '7_day_final_cram',
                'title' => '7-Day Final Cram & Mocks',
                'subtitle' => 'Intensive final week timed practice runs',
                'category' => 'comprehensive',
                'duration_days' => 7,
                'badge' => 'Exam Week',
                'description' => 'Sharpen speed and accuracy with daily timed drills, full simulation tests, and rapid error analysis before exam day.',
                'topics' => [
                    'Daily Timed Mock Exam Simulation (170 Items)',
                    'Instant Review & Diagnostic Weak Area Drills',
                    'Key Formula & Constitution Summary Sheet Review',
                    'Test-taking Strategy & Time Management Prep',
                ],
            ],
            'verbal_mastery' => [
                'id' => 'verbal_mastery',
                'title' => 'Verbal Ability & Grammar Mastery',
                'subtitle' => '14-day mastery of grammar, vocabulary & reading',
                'category' => 'verbal',
                'duration_days' => 14,
                'badge' => 'Subject Track',
                'description' => 'Deep dive into English grammar, word meanings, contextual vocabulary, paragraph sequencing, and reading comprehension techniques.',
                'topics' => [
                    'Days 1-3: Subject-Verb Agreement, Pronouns & Verb Tenses',
                    'Days 4-6: High-Frequency Vocabulary, Synonyms & Antonyms',
                    'Days 7-9: Identifying Sentence Errors & Idioms',
                    'Days 10-12: Paragraph Organization & Logical Transitions',
                    'Days 13-14: Reading Comprehension Speed Drills & Final Verbal Test',
                ],
            ],
            'math_mastery' => [
                'id' => 'math_mastery',
                'title' => 'Numerical & Math Mastery Track',
                'subtitle' => '15-day step-by-step arithmetic & word problem mastery',
                'category' => 'numerical',
                'duration_days' => 15,
                'badge' => 'Subject Track',
                'description' => 'Overcome math anxiety with guided practice on fractions, percentages, age/work problems, ratios, and number sequences.',
                'topics' => [
                    'Days 1-3: Fractions, Decimals & Order of Operations (PEMDAS)',
                    'Days 4-6: Percentages, Ratios & Partitive Proportions',
                    'Days 7-10: Word Problems (Age, Distance, Work & Financial Math)',
                    'Days 11-13: Basic Algebra & Number Series Shortcuts',
                    'Days 14-15: Data Interpretation & Numerical Final Drill',
                ],
            ],
            'analytical_mastery' => [
                'id' => 'analytical_mastery',
                'title' => 'Analytical Ability & Logic Track',
                'subtitle' => '14-day deductive logic, analogy & series mastery',
                'category' => 'analytical',
                'duration_days' => 14,
                'badge' => 'Subject Track',
                'description' => 'Master logical patterns, word analogies, categorical syllogisms, Venn diagrams, assumptions, and data analysis.',
                'topics' => [
                    'Days 1-3: Word Analogy Patterns & Relationship Types',
                    'Days 4-6: Number, Letter & Figural Sequences',
                    'Days 7-9: Categorical Syllogisms & Venn Diagram Analysis',
                    'Days 10-12: Identifying Assumptions & Valid Inferences',
                    'Days 13-14: Data Interpretation Charts & Logic Simulation Test',
                ],
            ],
            'gen_info_fast_track' => [
                'id' => 'gen_info_fast_track',
                'title' => 'General Information & Constitution',
                'subtitle' => '10-day mastery of civil service legal essentials',
                'category' => 'gen_info',
                'duration_days' => 10,
                'badge' => 'Subject Track',
                'description' => 'Targeted study plan for the 1987 Philippine Constitution, RA 6713 (Code of Conduct), Human Rights, and Environmental Protection.',
                'topics' => [
                    'Days 1-3: Philippine Constitution: Preamble, State Policies & Bill of Rights',
                    'Days 4-6: Legislative, Executive, Judiciary & Constitutional Commissions',
                    'Days 7-8: RA 6713 Code of Conduct & Ethical Standards',
                    'Days 9-10: Peace, Human Rights, Environmental Laws & Final Legal Quiz',
                ],
            ],
            'clerical_mastery' => [
                'id' => 'clerical_mastery',
                'title' => 'Clerical Ability & Operations',
                'subtitle' => '7-day filing rules & clerical accuracy track',
                'category' => 'clerical',
                'duration_days' => 7,
                'badge' => 'SubProf Track',
                'description' => 'Tailored for SubProfessional examinees covering standard alphabetical filing rules, numerical indexing, spelling, and error detection.',
                'topics' => [
                    'Day 1-2: Alphabetical Filing Rules & Indexing Orders',
                    'Day 3-4: Numerical, Geographic & Subject Filing Procedures',
                    'Day 5: Spelling Verification & Commonly Confused Words',
                    'Day 6: Clerical Error Checking & Document Proofreading',
                    'Day 7: Timed 50-Item Clerical Ability Challenge Drill',
                ],
            ],
        ];
    }

    /**
     * Apply a curated template to the user's study schedule.
     */
    public function applyTemplate(string $templateId, string $startDateStr, ?string $preferredTime = '19:00', bool $replaceExisting = false): int
    {
        $userId = Auth::id();
        $startDate = Carbon::parse($startDateStr)->startOfDay();
        $timeStr = $preferredTime ? (strlen($preferredTime) === 5 ? $preferredTime.':00' : $preferredTime) : '19:00:00';

        return DB::transaction(function () use ($templateId, $startDate, $timeStr, $replaceExisting, $userId) {
            if ($replaceExisting) {
                StudySchedule::where('user_id', $userId)
                    ->where('study_date', '>=', $startDate)
                    ->delete();
            }

            $items = $this->getTemplateItems($templateId);
            $subcategories = Subcategory::all()->keyBy('name');
            $createdCount = 0;

            foreach ($items as $index => $item) {
                $studyDate = $startDate->copy()->addDays($index)->toDateString();

                // Find matching subcategory if available
                $subcatId = null;
                if (! empty($item['subcat_name']) && isset($subcategories[$item['subcat_name']])) {
                    $subcatId = $subcategories[$item['subcat_name']]->id;
                }

                $schedule = StudySchedule::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'study_date' => $studyDate,
                        'title' => $item['title'],
                    ],
                    [
                        'description' => $item['description'],
                        'study_time' => $timeStr,
                        'subcategory_id' => $subcatId,
                        'is_done' => false,
                    ]
                );

                if ($schedule->wasRecentlyCreated || $schedule->wasChanged()) {
                    $createdCount++;
                }
            }

            return $createdCount;
        });
    }

    /**
     * Get detailed daily items for a template.
     *
     * @return array<int, array{title: string, description: string, subcat_name?: string}>
     */
    private function getTemplateItems(string $templateId): array
    {
        return match ($templateId) {
            '60_day_deep_mastery' => [
                // Verbal Phase (Days 1-15)
                ['title' => 'Day 1: English - Subject-Verb Agreement (Part 1)', 'description' => 'Basic rules, compound subjects with "and/or", and intervening phrases.'],
                ['title' => 'Day 2: English - Subject-Verb Agreement (Part 2)', 'description' => 'Indefinite pronouns, collective nouns, and inverted sentence structures.'],
                ['title' => 'Day 3: English - Pronoun-Antecedent Agreement', 'description' => 'Personal, relative, and demonstrative pronoun reference clarity.'],
                ['title' => 'Day 4: English - Verb Tenses & Consistency', 'description' => 'Simple, progressive, and perfect verb tenses with temporal markers.'],
                ['title' => 'Day 5: English - Modifiers & Parallel Structure', 'description' => 'Dangling modifiers, misplaced adverbs, and parallel grammatical elements.'],
                ['title' => 'Day 6: English - High-Yield Vocabulary (Set 1)', 'description' => 'Learn 30 civil service vocabulary words with root words and context clues.'],
                ['title' => 'Day 7: English - High-Yield Vocabulary (Set 2)', 'description' => 'Master prefixes, suffixes, and commonly confused word pairs.'],
                ['title' => 'Day 8: English - Idiomatic Expressions & Prepositions', 'description' => 'Essential idioms and correct prepositional phrase combinations.'],
                ['title' => 'Day 9: English - Sentence Structure & Error Recognition', 'description' => 'Identifying run-on sentences, comma splices, and fragment errors.'],
                ['title' => 'Day 10: English - Paragraph Organization (Logic Signals)', 'description' => 'Using transitional signals (however, therefore, furthermore) for ordering.'],
                ['title' => 'Day 11: English - Paragraph Organization (Sequence Drills)', 'description' => 'Arranging 5-sentence scrambled paragraphs into cohesive essays.'],
                ['title' => 'Day 12: English - Reading Comprehension (Main Idea)', 'description' => 'Skimming for central thesis, topic sentences, and summary statements.'],
                ['title' => 'Day 13: English - Reading Comprehension (Inference & Tone)', 'description' => 'Extracting implicit arguments, author bias, and tone nuances.'],
                ['title' => 'Day 14: Filipino - Wastong Gamit ng mga Salita', 'description' => 'Paggamit ng ng/nang, may/mayroon, pinto/pintuan, at pahirin/pahiran.'],
                ['title' => 'Day 15: Checkpoint 1 - 50-Item Verbal Mastery Test', 'description' => 'Comprehensive timed review test covering grammar, vocab, and reading.'],

                // Numerical Phase (Days 16-30)
                ['title' => 'Day 16: Math - Integers, Signs & PEMDAS', 'description' => 'Signed arithmetic operations and complex order of operations.'],
                ['title' => 'Day 17: Math - Fractions (Addition & Subtraction)', 'description' => 'Finding least common denominators and simplifying improper fractions.'],
                ['title' => 'Day 18: Math - Fractions (Multiplication & Division)', 'description' => 'Reciprocals, cross-cancellation shortcuts, and mixed fraction conversions.'],
                ['title' => 'Day 19: Math - Decimals & Rounding Rules', 'description' => 'Decimal arithmetic, alignment, and significant digits.'],
                ['title' => 'Day 20: Math - Percentage Fundamentals', 'description' => 'Base, rate, and percentage formula triangle (P = B x R).'],
                ['title' => 'Day 21: Math - Percentage Increase, Decrease & Discounts', 'description' => 'Successive discounts, markup percentages, and sales tax problems.'],
                ['title' => 'Day 22: Math - Ratio & Proportions (Direct & Inverse)', 'description' => 'Direct variation vs. inverse proportion equations.'],
                ['title' => 'Day 23: Math - Partitive Proportions & Sharing', 'description' => 'Dividing quantities into multi-part ratios (e.g., 2:3:5).'],
                ['title' => 'Day 24: Math - Basic Algebra & Linear Equations', 'description' => 'Isolating variables, combining like terms, and simple factoring.'],
                ['title' => 'Day 25: Math - Word Problems: Age Problems', 'description' => 'Setting up systematic past, present, and future age table equations.'],
                ['title' => 'Day 26: Math - Word Problems: Distance, Rate & Time', 'description' => 'Motion in same direction, opposite directions, and round-trip scenarios.'],
                ['title' => 'Day 27: Math - Word Problems: Work & Rates', 'description' => 'Collaborative rates (1/A + 1/B = 1/T) and pipe filling/draining problems.'],
                ['title' => 'Day 28: Math - Geometry Basics (Perimeter & Area)', 'description' => 'Formulas for quadrilaterals, triangles, circles, and composite figures.'],
                ['title' => 'Day 29: Math - Data Interpretation & Graphs', 'description' => 'Reading and calculating percentages from bar, line, and pie charts.'],
                ['title' => 'Day 30: Checkpoint 2 - 50-Item Numerical Mastery Test', 'description' => 'Timed problem-solving test covering all math arithmetic and word problems.'],

                // Analytical Phase (Days 31-45)
                ['title' => 'Day 31: Analytical - Word Analogy (Synonyms & Antonyms)', 'description' => 'Identifying subtle degrees of intensity and contrast in paired words.'],
                ['title' => 'Day 32: Analytical - Word Analogy (Part to Whole & Cause)', 'description' => 'Component, functional, cause-effect, and tool-user analogies.'],
                ['title' => 'Day 33: Analytical - Number Series (Arithmetic & Geometric)', 'description' => 'Constant differences, multiplication factors, and power series.'],
                ['title' => 'Day 34: Analytical - Number Series (Alternating & Fibonacci)', 'description' => 'Interleaved alternating sequences and additive series patterns.'],
                ['title' => 'Day 35: Analytical - Letter Series & Alphanumeric Patterns', 'description' => 'Alphabet position numbering (+2, +4, skip) and alphanumeric combinations.'],
                ['title' => 'Day 36: Analytical - Figural & Matrix Reasoning', 'description' => 'Rotation, symmetry, reflection, and shape addition/subtraction matrices.'],
                ['title' => 'Day 37: Analytical - Categorical Syllogisms (All & None)', 'description' => 'Universal affirmative and universal negative syllogisms with Euler circles.'],
                ['title' => 'Day 38: Analytical - Categorical Syllogisms (Some & Venn)', 'description' => 'Particular claims (Some A are B) and 3-circle Venn diagram deductions.'],
                ['title' => 'Day 39: Analytical - Conditional Logic (If-Then Statements)', 'description' => 'Modus ponens, modus tollens, and avoiding converse/inverse fallacies.'],
                ['title' => 'Day 40: Analytical - Statement & Assumption Analysis', 'description' => 'Distinguishing valid unstated presuppositions from unsupported claims.'],
                ['title' => 'Day 41: Analytical - Conclusion & Inference Validation', 'description' => 'Evaluating whether a conclusion definitely follows or is merely possible.'],
                ['title' => 'Day 42: Analytical - Seating Arrangement & Ranking Logic', 'description' => 'Linear order, circular seating, and comparative ranking deductions.'],
                ['title' => 'Day 43: Analytical - Cause and Effect Reasoning', 'description' => 'Determining independent causes, common effects, or direct causation.'],
                ['title' => 'Day 44: Analytical - Data Sufficiency & Complex Logic', 'description' => 'Deciding if given statements are sufficient to answer a problem.'],
                ['title' => 'Day 45: Checkpoint 3 - 50-Item Analytical Mastery Test', 'description' => 'Timed test covering analogy, series, logic deductions, and Venn diagrams.'],

                // General Information Phase (Days 46-52)
                ['title' => 'Day 46: GenInfo - 1987 Constitution: Preamble & Article I-II', 'description' => 'National territory, archipelago doctrine, and state policies.'],
                ['title' => 'Day 47: GenInfo - Article III: Bill of Rights (Fundamental Freedoms)', 'description' => 'Due process, search & seizure, privacy of communication, and free speech.'],
                ['title' => 'Day 48: GenInfo - Article III: Rights of the Accused', 'description' => 'Miranda rights, right to counsel, habeas corpus, and double jeopardy.'],
                ['title' => 'Day 49: GenInfo - Branches of Government & Checks and Balances', 'description' => 'Legislative, Executive, Judicial powers, and impeachment.'],
                ['title' => 'Day 50: GenInfo - Constitutional Commissions (CSC, COMELEC, COA)', 'description' => 'Mandates, composition, term of office, and independence safeguards.'],
                ['title' => 'Day 51: GenInfo - RA 6713 Code of Conduct for Public Officials', 'description' => '8 norms of conduct, prohibited acts, SALN filing, and ethical rules.'],
                ['title' => 'Day 52: GenInfo - Human Rights & Environmental Laws', 'description' => 'Universal declaration of human rights, Clean Air Act, and waste management.'],

                // Mock Exam & Final Polish (Days 53-60)
                ['title' => 'Day 53: Comprehensive Full Mock Exam #1 (170 Items)', 'description' => 'Simulate complete Civil Service Exam with strict 3-hour 10-minute timer.'],
                ['title' => 'Day 54: Deep-Dive Rationale Review #1', 'description' => 'Review rationales for all missed questions in Mock #1.'],
                ['title' => 'Day 55: Targeted Weakness Fix - Verbal & Math Drills', 'description' => 'Practice 40 targeted questions on your lowest-scoring subcategories.'],
                ['title' => 'Day 56: Comprehensive Full Mock Exam #2 (170 Items)', 'description' => 'Second full mock simulation to benchmark pacing and score consistency.'],
                ['title' => 'Day 57: Deep-Dive Rationale Review #2', 'description' => 'Analyze rationales and fine-tune your exam time allocation strategy.'],
                ['title' => 'Day 58: Comprehensive Full Mock Exam #3 (Final Benchmark)', 'description' => 'Final full simulation under realistic exam pressure.'],
                ['title' => 'Day 59: Constitution, Formulas & Shortcut Cheat Sheet Review', 'description' => 'High-yield formula recap, legal definitions, and vocabulary sheets.'],
                ['title' => 'Day 60: Exam Day Preparation, Checklist & Mental Readiness', 'description' => 'Review admission requirements, valid IDs, pacing plan, and rest.'],
            ],
            'verbal_mastery' => [
                ['title' => 'Verbal Day 1: Subject-Verb Agreement Masterclass', 'description' => 'Compound subjects, intervening phrases, and collective noun exceptions.'],
                ['title' => 'Verbal Day 2: Pronoun Antecedent & Reference Clarity', 'description' => 'Pronoun case (subjective/objective), relative pronouns (who/whom), and vague references.'],
                ['title' => 'Verbal Day 3: Verb Tense Consistency & Conditionals', 'description' => 'Perfect tenses, subjunctive mood, and if-clause conditional sentences.'],
                ['title' => 'Verbal Day 4: High-Yield Vocabulary - Synonyms & Context Clues', 'description' => 'Master 40 high-frequency civil service exam vocabulary words.'],
                ['title' => 'Verbal Day 5: High-Yield Vocabulary - Antonyms & False Friends', 'description' => 'Word contrasts, nuance differences, and confusing homophones.'],
                ['title' => 'Verbal Day 6: Idiomatic Expressions & Prepositional Collocations', 'description' => 'Common English idioms and exact preposition usage (interested in, comply with).'],
                ['title' => 'Verbal Day 7: Mid-Point Verbal Diagnostic Test (40 Items)', 'description' => 'Timed verbal quiz covering grammar, usage, and vocabulary.'],
                ['title' => 'Verbal Day 8: Error Recognition & Sentence Correction', 'description' => 'Spotting misplaced modifiers, faulty parallelism, and double negatives.'],
                ['title' => 'Verbal Day 9: Sentence Completion Drills', 'description' => 'One-blank and two-blank sentence completions with logic contrast cues.'],
                ['title' => 'Verbal Day 10: Paragraph Organization (Finding Topic Sentences)', 'description' => 'Identifying main idea sentences and chronological narrative flows.'],
                ['title' => 'Verbal Day 11: Paragraph Organization (Transition Words & Ordering)', 'description' => 'Using transitional signals (however, therefore, in contrast) to order paragraphs.'],
                ['title' => 'Verbal Day 12: Reading Comprehension (Main Idea & Supporting Details)', 'description' => 'Techniques to quickly locate key evidence without reading every word.'],
                ['title' => 'Verbal Day 13: Reading Comprehension (Author Tone & Inferences)', 'description' => 'Extracting implicit arguments, tone indicators, and valid assumptions.'],
                ['title' => 'Verbal Day 14: Final 60-Item Verbal Mastery Challenge', 'description' => 'Timed comprehensive test covering all verbal ability subcategories.'],
            ],
            'analytical_mastery' => [
                ['title' => 'Logic Day 1: Word Analogy - Semantic Relationships', 'description' => 'Synonym/antonym pairs, part-to-whole, and category-member relationships.'],
                ['title' => 'Logic Day 2: Word Analogy - Cause, Effect & Worker-Tool', 'description' => 'Function, degree of intensity, and causation analogy patterns.'],
                ['title' => 'Logic Day 3: Number Series - Arithmetic & Geometric Patterns', 'description' => 'Constant differences, ratio multipliers, and square/cube series.'],
                ['title' => 'Logic Day 4: Number Series - Two-Tier & Alternating Series', 'description' => 'Second-order differences and interleaved alternating sequence patterns.'],
                ['title' => 'Logic Day 5: Letter & Alphanumeric Sequences', 'description' => 'Letter shifting rules, skip patterns, and mixed alpha-numeric series.'],
                ['title' => 'Logic Day 6: Abstract & Spatial Reasoning', 'description' => 'Rotations, reflections, line counts, and matrix progression rules.'],
                ['title' => 'Logic Day 7: Mid-Point Logic Diagnostic Test (40 Items)', 'description' => 'Timed review test covering analogy and number/letter sequence problems.'],
                ['title' => 'Logic Day 8: Categorical Syllogisms & Euler Circles', 'description' => 'Valid and invalid syllogisms (All A are B, All B are C -> All A are C).'],
                ['title' => 'Logic Day 9: Venn Diagrams & Complex Syllogisms', 'description' => 'Three-set Venn diagram analysis for particular statements (Some X are Y).'],
                ['title' => 'Logic Day 10: Conditional Reasoning & Logic Fallacies', 'description' => 'Affirming the antecedent, denying the consequent, and common fallacies.'],
                ['title' => 'Logic Day 11: Statement Assumptions & Implicit Premises', 'description' => 'Determining which assumptions are necessarily taken for granted.'],
                ['title' => 'Logic Day 12: Drawing Conclusions & Valid Inferences', 'description' => 'Testing if a conclusion is strictly true based on given premises.'],
                ['title' => 'Logic Day 13: Data Interpretation (Tables, Bar & Pie Charts)', 'description' => 'Extracting data, calculating percentages, and analyzing visual trends.'],
                ['title' => 'Logic Day 14: Final 60-Item Analytical Mastery Challenge', 'description' => 'Comprehensive timed test covering all analytical reasoning domains.'],
            ],
            'clerical_mastery' => [
                ['title' => 'Clerical Day 1: Alphabetical Filing Rules (Rules 1-5)', 'description' => 'Order of indexing units, personal names vs. business names, and single letters.'],
                ['title' => 'Clerical Day 2: Alphabetical Filing Rules (Rules 6-10)', 'description' => 'Compound names, prefixes (De, Mac, Van), titles, degrees, and seniority suffixes.'],
                ['title' => 'Clerical Day 3: Numerical & Subject Filing Systems', 'description' => 'Consecutive numerical, terminal digit, middle digit, and subject hierarchy indexing.'],
                ['title' => 'Clerical Day 4: Geographic Filing & Cross-Referencing', 'description' => 'Location-based filing (Country > Province > City) and cross-reference cards.'],
                ['title' => 'Clerical Day 5: Spelling Accuracy & Commonly Confused Words', 'description' => 'Frequent spelling traps in administrative correspondence and official documents.'],
                ['title' => 'Clerical Day 6: Error Detection & Document Verification', 'description' => 'Spotting clerical discrepancies in names, dates, addresses, and ID numbers.'],
                ['title' => 'Clerical Day 7: Timed 50-Item Clerical Operations Challenge', 'description' => 'High-speed drill testing filing order, spelling, and clerical accuracy.'],
            ],
            '14_day_crash_course' => [
                ['title' => 'Verbal: Grammar & Correct Usage', 'description' => 'Review subject-verb agreement, pronoun-antecedent rules, and common tense errors.'],
                ['title' => 'Verbal: Vocabulary & Word Meanings', 'description' => 'Master 50 high-yield civil service vocabulary words with contextual usage.'],
                ['title' => 'Verbal: Paragraph Organization', 'description' => 'Practice transitional cues, topic sentences, and logical sequence drills.'],
                ['title' => 'Analytical: Word Analogy & Pair Relationships', 'description' => 'Understand cause/effect, part/whole, synonym/antonym relational patterns.'],
                ['title' => 'Numerical: Basic Operations & Fractions', 'description' => 'Quick review of fraction operations, decimals, and percentage shortcuts.'],
                ['title' => 'Numerical: Ratios & Proportions', 'description' => 'Solve direct, inverse, and partitive ratio problems with quick formulas.'],
                ['title' => 'Numerical: Word Problems (Age, Rate, Work)', 'description' => 'Step-by-step equation setups for time, distance, and joint work questions.'],
                ['title' => 'Mid-Point Review & Diagnostic Drill', 'description' => 'Run a 50-item timed diagnostic drill across Verbal and Numerical concepts.'],
                ['title' => 'Analytical: Number & Letter Series', 'description' => 'Identify arithmetic, geometric, and alternating sequence patterns.'],
                ['title' => 'Analytical: Logical & Deductive Reasoning', 'description' => 'Practice syllogisms, truth tables, and statement assumption analysis.'],
                ['title' => 'General Info: 1987 Philippine Constitution', 'description' => 'Focus on Bill of Rights (Article III), Citizenship, and Executive/Legislative powers.'],
                ['title' => 'General Info: RA 6713 Code of Conduct', 'description' => 'Review norms of conduct, prohibited acts, and civil service ethics.'],
                ['title' => 'General Info: Peace, Rights & Environment', 'description' => 'Understand basic human rights provisions, ecological balance, and current state policies.'],
                ['title' => 'Final Full Mock Exam Simulation', 'description' => 'Take a full 170-item timed mock exam under realistic CSE test conditions.'],
            ],
            '7_day_final_cram' => [
                ['title' => 'Day 1: Full Diagnostic Mock Exam (170 Items)', 'description' => 'Take a comprehensive mock exam to identify final weak areas and set focus.'],
                ['title' => 'Day 2: Verbal & Vocabulary Rapid Sprint', 'description' => 'Review high-yield idioms, grammar rules, and paragraph organization techniques.'],
                ['title' => 'Day 3: Numerical Formulas & Shortcut Practice', 'description' => 'Refresh key formulas for percentages, ratios, work, and distance word problems.'],
                ['title' => 'Day 4: Logic Patterns & Series Drills', 'description' => 'Fast-paced drills on number series, syllogisms, and relational analogies.'],
                ['title' => 'Day 5: Constitution & RA 6713 Key Facts', 'description' => 'Quick-reference review of the Bill of Rights, Constitutional Commissions, and RA 6713.'],
                ['title' => 'Day 6: Final Timed Simulation & Error Review', 'description' => 'Complete a timed simulation and carefully read explanations for all missed items.'],
                ['title' => 'Day 7: Strategy, Mindset & Light Review', 'description' => 'Final tips on pacing, shaded answer sheets, mindset, and restful preparation.'],
            ],
            'math_mastery' => [
                ['title' => 'Math Day 1: Integers & Order of Operations', 'description' => 'PEMDAS rules, negative numbers, and common calculation pitfalls.'],
                ['title' => 'Math Day 2: Fractions & Mixed Numbers', 'description' => 'Adding, subtracting, multiplying, and dividing fractions with speed shortcuts.'],
                ['title' => 'Math Day 3: Decimals & Percentage Conversions', 'description' => 'Converting decimals to fractions and computing quick percentage increases/decreases.'],
                ['title' => 'Math Day 4: Ratio, Proportion & Partitive Sharing', 'description' => 'Direct, inverse, and distributed sharing ratio word problems.'],
                ['title' => 'Math Day 5: Basic Algebraic Equations', 'description' => 'Solving single and multi-variable linear equations.'],
                ['title' => 'Math Day 6: Word Problems: Age Problems', 'description' => 'Setting up past, present, and future age equations systematically.'],
                ['title' => 'Math Day 7: Word Problems: Distance, Rate & Time', 'description' => 'Uniform motion problems, opposite directions, and catch-up scenarios.'],
                ['title' => 'Math Day 8: Word Problems: Work & Rates', 'description' => 'Individual vs. joint work formulas (1/A + 1/B = 1/T).'],
                ['title' => 'Math Day 9: Mixture & Solution Problems', 'description' => 'Percentage concentration and combined solution equations.'],
                ['title' => 'Math Day 10: Financial Math: Interest & Discounts', 'description' => 'Simple interest formula (I = Prt), markup, and successive discounts.'],
                ['title' => 'Math Day 11: Geometry: Perimeter & Area', 'description' => 'Formulas for triangles, rectangles, trapezoids, and circles.'],
                ['title' => 'Math Day 12: Geometry: Volume & Angles', 'description' => 'Basic 3D solid volumes, supplementary, and complementary angles.'],
                ['title' => 'Math Day 13: Statistics: Mean, Median & Mode', 'description' => 'Averages, weighted averages, and median calculations.'],
                ['title' => 'Math Day 14: Data Interpretation & Charts', 'description' => 'Reading bar graphs, pie charts, and tabular statistical data.'],
                ['title' => 'Math Day 15: Comprehensive Math Final Test', 'description' => 'Timed 40-item numerical ability challenge to assess mastery.'],
            ],
            'gen_info_fast_track' => [
                ['title' => 'GenInfo Day 1: Constitution Preamble & Territory', 'description' => 'National territory, state policies, and foundational principles.'],
                ['title' => 'GenInfo Day 2: Article III - Bill of Rights (Part 1)', 'description' => 'Due process, search warrants, right to privacy, and freedom of speech.'],
                ['title' => 'GenInfo Day 3: Article III - Bill of Rights (Part 2)', 'description' => 'Rights of the accused, habeas corpus, double jeopardy, and speedy trial.'],
                ['title' => 'GenInfo Day 4: Citizenship & Suffrage', 'description' => 'Modes of acquiring citizenship, dual citizenship, and voting rights.'],
                ['title' => 'GenInfo Day 5: Legislative & Executive Branches', 'description' => 'Composition, terms, qualifications, and lawmaking procedures.'],
                ['title' => 'GenInfo Day 6: Judicial Branch & Constitutional Commissions', 'description' => 'Supreme Court powers, CSC, COMELEC, and COA mandates.'],
                ['title' => 'GenInfo Day 7: RA 6713 - Code of Conduct (Part 1)', 'description' => '8 norms of conduct: commitment to public interest, professionalism, and simplicity.'],
                ['title' => 'GenInfo Day 8: RA 6713 - Code of Conduct (Part 2)', 'description' => 'Prohibited acts, financial disclosures (SALN), and penalties.'],
                ['title' => 'GenInfo Day 9: Peace, Human Rights & Indigenous Rights', 'description' => 'Universal Declaration of Human Rights and Philippine peace frameworks.'],
                ['title' => 'GenInfo Day 10: Environmental Protection & Final Quiz', 'description' => 'Clean Air Act, Solid Waste Management, and 30-item legal review drill.'],
            ],
            default => [
                // 30_day_comprehensive (default)
                ['title' => 'Day 1: Verbal - Subject-Verb Agreement', 'description' => 'Rules for singular/plural subjects, compound subjects, and collective nouns.'],
                ['title' => 'Day 2: Verbal - Pronoun Antecedent & Tenses', 'description' => 'Pronoun reference consistency and past/present/future perfect verb tenses.'],
                ['title' => 'Day 3: Verbal - High-Yield Vocabulary (Set 1)', 'description' => 'Synonyms, antonyms, and context clue reading drills.'],
                ['title' => 'Day 4: Verbal - Idiomatic Expressions', 'description' => 'Common English idioms and prepositional collocations.'],
                ['title' => 'Day 5: Verbal - Paragraph Organization', 'description' => 'Ordering sentences logically with transitional signal words.'],
                ['title' => 'Day 6: Verbal - Reading Comprehension Strategies', 'description' => 'Skimming, scanning, identifying main ideas and author tone.'],
                ['title' => 'Day 7: Week 1 Checkpoint - Verbal Drill', 'description' => 'Timed 40-item verbal ability practice session and rationale review.'],
                ['title' => 'Day 8: Numerical - Fractions, Decimals & Percentages', 'description' => 'Fundamental conversions and arithmetic shortcuts.'],
                ['title' => 'Day 9: Numerical - Ratios, Rates & Proportions', 'description' => 'Direct, inverse, and partitive ratio problems.'],
                ['title' => 'Day 10: Numerical - Number Sequences & Series', 'description' => 'Identifying arithmetic, geometric, and alternating patterns.'],
                ['title' => 'Day 11: Numerical - Basic Algebra & Equations', 'description' => 'Linear equations and simplifying algebraic expressions.'],
                ['title' => 'Day 12: Numerical - Word Problems (Age & Work)', 'description' => 'Setting up systematic equations for age and collaborative work rates.'],
                ['title' => 'Day 13: Numerical - Word Problems (Distance & Motion)', 'description' => 'Speed, distance, time, and relative motion problem solving.'],
                ['title' => 'Day 14: Week 2 Checkpoint - Numerical Drill', 'description' => 'Timed 40-item math problem-solving practice test.'],
                ['title' => 'Day 15: Analytical - Word Analogy & Pair Logic', 'description' => 'Classifying analogical relationships and relationship types.'],
                ['title' => 'Day 16: Analytical - Logical & Deductive Reasoning', 'description' => 'Valid inferences, statement assumptions, and deductive logic.'],
                ['title' => 'Day 17: Analytical - Syllogisms & Venn Diagrams', 'description' => 'Categorical syllogisms (All, Some, None) using Venn diagram analysis.'],
                ['title' => 'Day 18: Analytical - Data Interpretation (Tables & Graphs)', 'description' => 'Extracting and calculating trends from bar, line, and pie charts.'],
                ['title' => 'Day 19: Analytical - Spatial & Pattern Reasoning', 'description' => 'Visual reasoning, figure matrices, and mirror image patterns.'],
                ['title' => 'Day 20: Analytical - Mixed Critical Thinking Drill', 'description' => '40-item timed analytical reasoning practice test.'],
                ['title' => 'Day 21: Week 3 Checkpoint - Mid-Course Diagnostic', 'description' => 'Comprehensive 60-item diagnostic test across Verbal, Math, and Logic.'],
                ['title' => 'Day 22: GenInfo - Philippine Constitution Preamble & Articles I-III', 'description' => 'National territory, state policies, and the Bill of Rights.'],
                ['title' => 'Day 23: GenInfo - Constitution Government Branches', 'description' => 'Legislative, Executive, and Judicial powers, duties, and checks & balances.'],
                ['title' => 'Day 24: GenInfo - RA 6713 Code of Conduct for Public Officials', 'description' => 'Norms of conduct, system of incentives, duties, and prohibited acts.'],
                ['title' => 'Day 25: GenInfo - Peace, Human Rights & Current Concepts', 'description' => 'Basic human rights principles, peace education, and environmental protection.'],
                ['title' => 'Day 26: GenInfo - 30-Item Legal & Ethics Drill', 'description' => 'Fast-paced quiz covering Constitution and civil service laws.'],
                ['title' => 'Day 27: Full Mock Exam Simulation #1 (170 Items)', 'description' => 'Simulate complete Civil Service Exam with strict 3-hour 10-minute timer.'],
                ['title' => 'Day 28: Deep-Dive Mock Rationale & Weakness Fix', 'description' => 'Review every incorrect question and practice targeted drills.'],
                ['title' => 'Day 29: Full Mock Exam Simulation #2 (170 Items)', 'description' => 'Final simulation test to validate confidence and time allocation.'],
                ['title' => 'Day 30: Final Review, Checklist & Exam Mindset', 'description' => 'Light review of formulas, rules, examination day requirements, and rest.'],
            ],
        };
    }
}
