<?php

namespace App\Jobs;

use App\Events\AiGenerationCompleted;
use App\Events\AiGenerationFailed;
use App\Models\Category;
use App\Models\Question;
use App\Models\Subcategory;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GenerateQuestionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 300;

    public $tries = 3;

    protected $validated;

    protected $userId;

    protected $primaryModel;

    protected ?string $lockOwner;

    public function __construct(array $validated, int $userId, string $primaryModel = 'gemini-3.6-flash', ?string $lockOwner = null)
    {
        $this->validated = $validated;
        $this->userId = $userId;
        $this->primaryModel = $primaryModel;
        $this->lockOwner = $lockOwner;
    }

    public function handle(): void
    {
        try {
            set_time_limit(300);
            $validated = $this->validated;

            $apiKey = config('services.gemini.key') ?: env('GEMINI_API_KEY');
            if (! $apiKey) {
                Log::error('GenerateQuestionsJob: GEMINI_API_KEY is missing.');
                AiGenerationFailed::dispatch($this->userId, 'API Key is missing.', 'questions');

                return;
            }

            $subcategory = $validated['subcategory'];

            $categorySpecificRules = '';
            if ($subcategory === 'Word meaning') {
                $categorySpecificRules = '* Word meaning: You MUST explicitly indicate which word the user needs to define. If you use a sentence for context, format the target word in ALL CAPS and append a direct question at the end of the stem. ABSOLUTE RULE: The exact same target word MUST NOT be in the options. The correct option MUST be a completely different word. Example: "The public relations officer was reassigned after several clients complained about her SUPERCILIOUS attitude. What is the closest meaning of the capitalized word?"';
                if ($validated['language'] === 'Filipino/Tagalog') {
                    $categorySpecificRules .= "\n        * Word meaning (Filipino/Tagalog): ABSOLUTE RULE: The correct option MUST NOT share the same root word (salitang-ugat) as the target word. For example, if the target word is \"TAPAT\", the answer CANNOT be \"Katapatan\" or \"Matapat\". You must provide a completely different word with a different root, such as \"Sinsiro\". DO NOT put the definition or meaning of the word inside the question stem. You must ONLY provide a sentence with context clues OR directly ask for the synonym/antonym.";
                }
            } elseif ($subcategory === 'Sentence completion') {
                $categorySpecificRules = '* Sentence completion: The stem MUST include a clear blank space represented by five consecutive underscores "_____" to indicate where the missing word or phrase belongs.';
                if ($validated['language'] === 'Filipino/Tagalog') {
                    $categorySpecificRules .= "\n        * Sentence completion (Filipino/Tagalog): Ensure the missing word tests precise Filipino/Tagalog vocabulary, appropriate affixes (panlapi), or correct transitional words (pangatnig) suitable for formal contexts.";
                }
            } elseif ($subcategory === 'Error recognition') {
                $categorySpecificRules = '* Error recognition: You MUST provide a single, continuous sentence in the stem WITHOUT enclosing any words in brackets or numbers. Options A to D must contain the four distinct segments or phrases from the sentence that the user needs to evaluate (e.g., Option A: "has went", Option B: "to the", Option C: "store", Option D: "yesterday"), and Option E must strictly be "No error". Do not put brackets in the question stem or the options.';
                if ($validated['language'] === 'Filipino/Tagalog') {
                    $categorySpecificRules .= "\n        * Error recognition (Filipino/Tagalog): Focus on testing common, formal Filipino/Tagalog grammatical rules. Test the proper usage of 'ng' vs. 'nang', 'din/daw' vs. 'rin/raw', incorrect verb affixes (panlapi), or improper use of hyphens (gitling).";
                }
            } elseif ($subcategory === 'Paragraph organization') {
                $categorySpecificRules = '* Paragraph organization: The stem MUST consist of 4 to 5 jumbled sentences. Each sentence must start with a number in parentheses, like "(1) First sentence. (2) Second sentence." The options must be sequence combinations of those numbers, such as "3, 1, 4, 2".';
                if ($validated['language'] === 'Filipino/Tagalog') {
                    $categorySpecificRules .= "\n        * Paragraph organization (Filipino/Tagalog): Ensure sentences flow naturally using appropriate Filipino/Tagalog transitional devices (pangatnig) like 'samakatuwid', 'gayunpaman', 'sa kabilang banda', etc.";
                }
            } elseif ($subcategory === 'Sentence structure') {
                if ($validated['language'] === 'Filipino/Tagalog') {
                    $categorySpecificRules = "* Sentence structure (Filipino/Tagalog): Focus on correct Filipino/Tagalog syntax, such as distinguishing between standard and inverted sentence orders (Karaniwan vs. Di-karaniwang ayos), proper placement of enclitics (mga ingklitik like 'ba', 'na', 'man', 'yata'), and correct verb focus (pokus ng pandiwa).";
                }
            } elseif ($subcategory === 'Word analogy') {
                $categorySpecificRules = '* Word analogy: Provide standard analytical analogies.';
                if ($validated['language'] === 'Filipino/Tagalog') {
                    $categorySpecificRules .= "\n        * Word analogy (Filipino/Tagalog): Use authentic Filipino/Tagalog word relationships and formal vocabulary rather than directly translating standard English analogies. Ensure this strictly falls under the Analytical Ability category.";
                }
            } elseif ($subcategory === 'Symbolic logic / abstract reasoning') {
                $variety = $validated['symbolic_variety'] ?? 'all';
                $varietyInstruction = '';
                if ($variety === 'format_a') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format A: Grid-based Logical Matrix. Generate a single SVG showing a grid of shapes (e.g. 2x2, 3x3, or 4x4 cells). The bottom-right cell MUST show a question mark '?' indicating the missing symbol. The other cells must follow a logical grid-based pattern (e.g. addition, subtraction, or overlap of lines/shapes in rows or columns).";
                } elseif ($variety === 'format_b') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format B: Sequence Puzzle. A sequence of frames (ranging from 3 to 6 frames) showing a progressive transformation. You can either generate a single SVG displaying all frames side-by-side, or individual labeled frames (e.g. '**Frame 1:**\n<svg...>\n**Frame 2:**\n<svg...>'; choose whichever fits best, but prefer a single SVG containing all frames side-by-side).";
                } elseif ($variety === 'format_c') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format C: Visual Analogy. Frame A is to Frame B, as Frame C is to '?'. Render as a single SVG or individual labeled frames showing the transformation.";
                } elseif ($variety === 'format_d') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format D: Rotation/Reflection Grid. A grid of shaded shapes (e.g., 2x2, 3x3, 4x4) that rotate, mirror, or shift according to a distinct pattern.";
                } elseif ($variety === 'format_e') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format E: Odd One Out / Classification. The stem asks to find the figure that does not belong. Options A to E show different SVG figures, where 4 of them share a common geometric or mathematical property (e.g., line count, symmetry, rotational similarity) and 1 is the 'odd one out'.";
                } elseif ($variety === 'format_f') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format F: Cube Folding / 3D Net. The stem shows a 2D unfolded cube net (showing shapes on the faces). The options show folded 3D cube representations, and the user must identify the only correct folded version.";
                } elseif ($variety === 'format_g') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format G: Dot Placement / Intersection Logic. The stem shows a reference diagram where shapes (like a circle, triangle, and square) overlap, with a dot placed in a specific intersection region. The options show similar overlapping shapes, and the user must choose the only option where a dot can be placed in the identical intersection condition.";
                } elseif ($variety === 'format_h') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format H: Mirror/Water Reflections. The stem shows a complex figure, and the options show reflections across a given axis (horizontal or vertical).";
                } else {
                    $varietyInstruction = "CRITICAL VARIETY RULE: To prevent repetitive questions, randomly select one of the following abstract reasoning formats for each question:
        - Format A: Grid-based Logical Matrix. Generate a single SVG showing a grid of shapes (e.g. 2x2, 3x3, or 4x4 cells). The bottom-right cell MUST show a question mark '?' indicating the missing symbol. The other cells must follow a logical grid-based pattern (e.g. addition, subtraction, or overlap of lines/shapes in rows or columns).
        - Format B: Sequence Puzzle. A sequence of frames (ranging from 3 to 6 frames) showing a progressive transformation. You can either generate a single SVG displaying all frames side-by-side, or individual labeled frames (e.g. '**Frame 1:**\n<svg...>\n**Frame 2:**\n<svg...>').
        - Format C: Visual Analogy. Frame A is to Frame B, as Frame C is to '?'. Render as a single SVG or individual labeled frames showing the transformation.
        - Format D: Rotation/Reflection Grid. A grid of shaded shapes (e.g., 2x2, 3x3, 4x4) that rotate, mirror, or shift according to a distinct pattern.
        - Format E: Odd One Out / Classification. The stem asks to find the figure that does not belong. Options A to E show different SVG figures, where 4 of them share a common geometric or mathematical property (e.g., line count, symmetry, rotational similarity) and 1 is the 'odd one out'.
        - Format F: Cube Folding / 3D Net. The stem shows a 2D unfolded cube net (showing shapes on the faces). The options show folded 3D cube representations, and the user must identify the only correct folded version.
        - Format G: Dot Placement / Intersection Logic. The stem shows a reference diagram where shapes (like a circle, triangle, and square) overlap, with a dot placed in a specific intersection region. The options show similar overlapping shapes, and the user must choose the only option where a dot can be placed in the identical intersection condition.
        - Format H: Mirror/Water Reflections. The stem shows a complex figure, and the options show reflections across a given axis (horizontal or vertical).";
                }

                $categorySpecificRules = "* Symbolic logic / abstract reasoning: You MUST generate visual-spatial geometric puzzles using raw, scalable SVG code. Output raw <svg viewBox=\"...\">...</svg> blocks directly inside the text. You MUST include SVG visuals not just in the question stem, but ALSO in every single option (Options A to E must be standalone SVGs showing the possible answers, do NOT use descriptive text for options). Keep SVGs clean with simple paths, <rect>, <circle>, or <polygon>.
        CRITICAL STEM SVG RULE: The question 'stem' MUST contain at least one <svg> block representing the puzzle's reference diagram or sequence. You are forbidden from generating visual questions without including the reference SVG in the stem! (Except for Odd One Out Format E, where the puzzle is defined by the options).
        CRITICAL TOKEN OPTIMIZATION RULE: To prevent generation cutoffs, you MUST heavily minify your SVG code. Do NOT use any HTML comments (<!-- -->) inside the SVGs. Remove all unnecessary whitespace, spaces, and line breaks within the SVG code. Keep the code as compact as possible.
        {$varietyInstruction}
        
        CRITICAL GEOMETRIC COHERENCE RULE: Ensure that all elements (e.g. dots, lines, shapes) inside the SVGs never unintentionally overlap or intersect, unless it is a deliberate part of the puzzle logic. For multiple-choice options (A to E), every option must be constructed with clean spatial layouts and correct coordinate separation so that the correct answer cannot be easily guessed by simply choosing the only option without overlapping elements.";
            } elseif ($subcategory === 'Data interpretation') {
                $variety = $validated['data_variety'] ?? 'all';
                $varietyInstruction = '';
                if ($variety === 'format_a') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format A: Bar Chart. Render a clean vertical or horizontal bar chart using raw SVG. Base the data on 4 to 6 categories/years. Vertical bars must grow bottom-up from the X-axis (e.g., if X-axis is at y=250, a bar of height 100 must be positioned at y=150, height=100). Ensure it has clear axes, gridlines, data labels, and a title.";
                } elseif ($variety === 'format_b') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format B: Line Graph. Render a clean line graph representing stock market / PSEi trends, company stock prices, or economic indicators over 4 to 6 periods using raw SVG. Draw distinct data points connected by lines, with gridlines, axes, data labels, and a title.";
                } elseif ($variety === 'format_c') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format C: Pie Chart or Donut Chart. Render a clean pie or donut chart representing shares or percentages using raw SVG paths (<path d=\"...\">) or SVG circle segments, with different filled colors for each slice, percentage labels, a clear legend, and a title.";
                } elseif ($variety === 'format_d') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format D: Formatted Table (Data Completion). Provide a beautifully formatted markdown table showing statistical or financial data (e.g. stock market performance, company revenues, or municipal budget). You can include missing cell values indicated by '[?]' or '[X]', requiring the user to calculate the missing value, total, or percentage.";
                } elseif ($variety === 'format_e') {
                    $varietyInstruction = "CRITICAL VARIETY RULE: You MUST generate ONLY the following format. You are forbidden from generating any other format:\n        - Format E: Combined Table and Chart. Provide both a formatted markdown table and a matching SVG chart (bar chart or line graph) to allow comprehensive interpretation of multi-variable data.";
                } else {
                    $varietyInstruction = 'CRITICAL VARIETY RULE: To prevent repetitive questions, randomly select one of the following formats for each question:
        - Format A: Bar Chart. Render a clean vertical or horizontal bar chart using raw SVG. Base the data on 4 to 6 categories/years. Vertical bars must grow bottom-up from the X-axis (e.g., if X-axis is at y=250, a bar of height 100 must be positioned at y=150, height=100). Ensure it has clear axes, gridlines, data labels, and a title.
        - Format B: Line Graph. Render a clean line graph representing stock market / PSEi trends, stock prices over quarters/months, or economic indicators using raw SVG. Draw distinct data points connected by lines, with gridlines, axes, data labels, and a title.
        - Format C: Pie Chart or Donut Chart. Render a clean pie or donut chart representing shares or percentages using raw SVG paths (<path d="...">) or SVG circle segments, with different filled colors for each slice, percentage labels, a clear legend, and a title.
        - Format D: Formatted Table (Data Completion). Provide a formatted markdown table showing statistical/financial data (e.g. stock market performance, company revenues, or municipal budget). Include missing cell values indicated by "[?]" or "[X]", where the question asks to solve for the missing cell value, total, or percentage.
        - Format E: Combined Table and Chart. Provide both a formatted markdown table and a matching SVG chart (bar chart or line graph) to allow comprehensive interpretation of multi-variable data.';
                }

                $categorySpecificRules = "* Data interpretation (BALANCED CSE DIFFICULTY): Questions must be realistic to the official Civil Service Exam scope (moderate difficulty — challenging but fair, testing percentage change, ratios, totals, averages, or missing cell calculations).
        Data topics MUST include Philippine public administration data (population, agency budgets, enrollment) OR Philippine financial / Stock Market data (e.g. Philippine Stock Exchange index / PSEi trends, company stock prices over trading days, sector shares).
        {$varietyInstruction}
        
        CRITICAL SVG RULES: Use a wide viewBox='0 0 800 500' for charts. You MUST leave ample margin inside the viewBox for all axes labels and titles so nothing is clipped. For example, start the chart's main axes at least at x=100 and y=80. Ensure the rotated Y-axis title and the main chart title have plenty of room within positive coordinates. Ensure all text labels use <text> elements with clear font sizes, stay well within the viewBox boundaries, and do not overlap with other visual elements. Keep any SVG code clean, well-structured, and minified without comments. The options should be plain text or numbers based on the data, and the explanation block must reference the specific data points.";
            } elseif ($subcategory === 'Identifying assumptions and drawing conclusions') {
                $categorySpecificRules = '* Identifying assumptions and drawing conclusions: Provide realistic logical scenarios (e.g. government policies, office protocols, or formal arguments). Questions must test formal syllogistic deductions ("All A are B...", valid conclusions) or identifying unstated premises and assumptions necessary for an argument to hold true.';
            } elseif ($subcategory === 'Filing') {
                $categorySpecificRules = '* Filing: Test standard Philippine Civil Service alphabetical filing and indexing rules (e.g., Last Name, First Name, Middle Initial; handling of titles like Dr./Atty., government agency names, hyphenated surnames, and numerical prefixes). Provide 4 to 5 names or file titles and ask for the correct alphabetical sequence.';
            } elseif ($subcategory === 'Spelling') {
                $categorySpecificRules = '* Spelling: Test commonly misspelled words in administrative, legal, and formal English or Tagalog contexts (e.g., double consonants, tricky vowels, homophones, or official Civil Service terminology).';
            } elseif ($subcategory === 'Reading comprehension') {
                if ($validated['language'] === 'Tagalog') {
                    $categorySpecificRules = '* Reading comprehension (Tagalog): Provide authentic, formal Filipino/Tagalog passages such as excerpts from government policies, literature, or news. Questions must test the main idea (pangunahing diwa), inference (paghihinuha), or conclusion (kongklusyon).';
                }
            }

            if (in_array($validated['category'], ['Numerical Ability']) || $subcategory === 'Data interpretation') {
                $categorySpecificRules .= "\n        * Numerical Ability / Data Interpretation: You MUST include a dedicated section in the explanation starting with 'Mental Math Shortcut:' that details an actual, practical, and highly effective mental math technique or rapid approximation trick used by top exam takers. This shortcut MUST be easy to understand and genuinely help the user solve the exact problem significantly faster (e.g., divisibility rules, percentage approximations, fraction-to-decimal conversions, or elimination techniques). Do not just restate the standard solution; provide a true time-saving trick.";
            }

            $languageRule = '';
            if ($validated['language'] === 'Tagalog') {
                $languageRule = '* General Filipino/Tagalog formatting (HIGH DIFFICULTY & RIGOR): When generating questions in Filipino/Tagalog, write the entire stem, options, and explanation strictly in Tagalog at a high CSC exam level. The EXPLANATION field MUST be written completely in Filipino/Tagalog. Use deep, formal, and authentic Tagalog vocabulary (Malalim at Pormal na Wika), native Filipino idioms (Sawikain/Salawikain), and figures of speech (Tayutay). Strictly test nuanced Tagalog grammatical rules (e.g. wastong gamit ng "ng" at "nang", "din/daw" at "rin/raw", "pinto" at "pintuan", "hagdan" at "hagdanan", karaniwan at di-karaniwang ayos, pokus ng pandiwa, at tamang paggigitling). Distractors must be clever and non-obvious to test true mastery. Strictly forbid Taglish, conversational slang, and literal English translations.';
            }

            $systemPrompt = "
        You are a professional Civil Service Exam reviewer writer in the Philippines.
        Generate multiple-choice questions that are challenging, syllabus-aligned, and strictly realistic according to the official CSC Exam Scope.

        Official Category & Subcategory Schema (With Exam Level context):
        * General Information (Both Levels): 'Philippine Constitution', 'Code of Conduct and Ethical Standards (R.A. 6713)', 'Peace and Human Rights Issues and Concepts', 'Environment Management and Protection'
        * Verbal Ability (Both Levels): 'Word meaning', 'Sentence completion', 'Error recognition', 'Sentence structure', 'Paragraph organization', 'Reading comprehension'
        * Analytical Ability (Professional Level ONLY): 'Word analogy', 'Symbolic logic / abstract reasoning', 'Identifying assumptions and drawing conclusions', 'Data interpretation'
        * Numerical Ability (Both Levels): 'Basic operations', 'Number sequence', 'Word problems'
        * Clerical Ability (Subprofessional Level ONLY): 'Filing', 'Spelling'

        Philippine Context Rule:
        For Word Problems, Reading Comprehension, Data Interpretation, and Sentence texts, you MUST use realistic Philippine context. Use Philippine Pesos (₱), local Philippine cities (e.g., Manila, Cebu, Davao), generic local names (e.g., Juan, Maria, Santos), and non-partisan Philippine government agencies (e.g., CSC, BIR, DOH) to make the questions authentic to the CSE.

        APOLITICAL & NON-PARTISAN RULE (STRICT ENFORCEMENT):
        - ABSOLUTELY NO political questions, partisan political debates, or political opinions/controversies.
        - ABSOLUTELY NO mention of real political figures, living or deceased politicians (e.g., presidents, senators, congressmen, mayors, or political candidates).
        - Keep all scenario texts strictly neutral, objective, professional, and focused purely on Civil Service syllabus content (e.g., administrative procedures, public ethics under R.A. 6713, constitutional laws, or standard office logic).

        EXPLICIT QUESTION RULE (CRITICAL):
        Every generated 'stem' MUST end with a clear, explicit question asking the user what they need to find or solve. Do NOT just provide a statement, sentence, passage, or data table. You MUST append an actual question with a question mark at the end of the stem.
        Examples:
        - Error Recognition: 'Which part of the sentence contains a grammatical error?'
        - Word Meaning: 'What is the closest meaning of the capitalized word?'
        - Reading Comprehension: 'Based on the passage, which of the following is the most logical conclusion?'
        - Sentence Completion: 'Which word best completes the sentence?'
        (NOTE: If the question language is Tagalog, strictly translate these explicit questions into formal Tagalog).

        Category Specific Rules:
        {$categorySpecificRules}
        {$languageRule}

        CRITICAL JSON RULE: You must properly escape all quotation marks inside the JSON string values using a backslash to prevent parsing errors. Never use unescaped double quotes inside the text fields.

        Return a valid JSON array of question objects. Do not include markdown wraps or block formatting, return raw JSON text.

        Each object in the array must contain:
        1. 'stem': the question stem text or scenario.
        2. 'category': strictly matching the category parameter.
        3. 'subcategory': strictly matching the subcategory parameter.
        4. 'options': an array of exactly 5 strings for choices (A to E).
        5. 'correct_option': an integer index (0 for A, 1 for B, 2 for C, 3 for D, 4 for E) representing the correct choice.
        6. 'explanation': A HIGHLY DETAILED, step-by-step explanation of the logic or steps leading to the correct answer. You MUST provide a comprehensive explanation for EVERY question. It cannot be empty or brief.

        Output format:
        [
        {
            \"stem\": \"...\",
            \"category\": \"...\",
            \"subcategory\": \"...\",
            \"options\": [\"...\", \"...\", \"...\", \"...\", \"...\"],
            \"correct_option\": 0,
            \"explanation\": \"...\"
        }
        ]
        ";

            $count = $validated['count'];

            $userPrompt = "
        Generate exactly {$count} multiple-choice questions for the following category and subcategory:
        Category: {$validated['category']}
        Subcategory: {$validated['subcategory']}
        Language: {$validated['language']}
        ".(! empty($validated['prompt']) ? "Additional Context/Directives: {$validated['prompt']}" : '');

            try {
                $resultText = null;
                $errorMsg = null;
                $firstAttemptFailed = false;

                // Define closures for both API calls
                $attemptGemini = function ($model = 'gemini-3.6-flash') use ($apiKey, $systemPrompt, $userPrompt, $subcategory, &$resultText, &$errorMsg) {
                    if (! $apiKey) {
                        $errorMsg = 'GEMINI_API_KEY is missing.';

                        return false;
                    }
                    try {
                        $payload = [
                            'system_instruction' => [
                                'parts' => [['text' => $systemPrompt]],
                            ],
                            'contents' => [
                                [
                                    'parts' => [['text' => $userPrompt]],
                                ],
                            ],
                            'generationConfig' => [
                                'temperature' => 0.7,
                                'topP' => 0.9,
                                'maxOutputTokens' => in_array($subcategory, ['Symbolic logic / abstract reasoning', 'Data interpretation']) ? 16384 : 8192,
                                'responseMimeType' => 'application/json',
                                'responseSchema' => [
                                    'type' => 'ARRAY',
                                    'items' => [
                                        'type' => 'OBJECT',
                                        'properties' => [
                                            'stem' => [
                                                'type' => 'STRING',
                                                'description' => 'The question stem or scenario. If it includes a data table, represent it beautifully as a formatted text/markdown table. If it requires data interpretation, embed raw SVG charts directly.',
                                            ],
                                            'category' => ['type' => 'STRING'],
                                            'subcategory' => ['type' => 'STRING'],
                                            'options' => [
                                                'type' => 'ARRAY',
                                                'minItems' => 5,
                                                'maxItems' => 5,
                                                'items' => ['type' => 'STRING'],
                                            ],
                                            'correct_option' => ['type' => 'INTEGER'],
                                            'explanation' => [
                                                'type' => 'STRING',
                                                'description' => 'A detailed explanation of the steps leading to the correct option.',
                                            ],
                                        ],
                                        'required' => ['stem', 'category', 'subcategory', 'options', 'correct_option', 'explanation'],
                                    ],
                                ],
                            ],
                        ];

                        if (str_contains($model, 'thinking')) {
                            $payload['generationConfig']['thinkingConfig'] = ['thinkingLevel' => 'high'];
                        }

                        $response = Http::withHeaders([
                            'x-goog-api-key' => $apiKey,
                            'Content-Type' => 'application/json',
                        ])->timeout(300)->post(
                            'https://generativelanguage.googleapis.com/v1beta/models/'.$model.':generateContent',
                            $payload
                        );

                        if ($response->successful()) {
                            $result = $response->json();
                            $resultText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

                            if (isset($result['usageMetadata'])) {
                                Log::info("GenerateQuestionsJob Token Usage for {$subcategory}:", $result['usageMetadata']);
                            }

                            return true;
                        } else {
                            $body = $response->json();
                            $errorMsg = $body['error']['message'] ?? $response->body();

                            return false;
                        }
                    } catch (\Exception $e) {
                        $errorMsg = 'Gemini Exception: '.$e->getMessage();

                        return false;
                    }
                };

                $attemptGroq = function ($model) use ($systemPrompt, $userPrompt, &$resultText, &$errorMsg) {
                    $groqKey = config('services.groq.key') ?: env('GROQ_API_KEY');
                    if (! $groqKey) {
                        $errorMsg = 'GROQ_API_KEY is missing.';

                        return false;
                    }

                    try {
                        $groqResponse = Http::withToken($groqKey)
                            ->timeout(300)
                            ->post('https://api.groq.com/openai/v1/chat/completions', [
                                'model' => $model,
                                'messages' => [
                                    ['role' => 'system', 'content' => $systemPrompt],
                                    ['role' => 'user', 'content' => $userPrompt],
                                ],
                                'temperature' => 0.7,
                                'max_tokens' => 8192,
                            ]);

                        if ($groqResponse->successful()) {
                            $result = $groqResponse->json();
                            $resultText = $result['choices'][0]['message']['content'] ?? '';

                            return true;
                        } else {
                            $body = $groqResponse->json();
                            $errorMsg = $body['error']['message'] ?? $groqResponse->body();

                            return false;
                        }
                    } catch (\Exception $e) {
                        $errorMsg = 'Groq Exception: '.$e->getMessage();

                        return false;
                    }
                };

                $success = false;
                $primaryIsGemini = str_starts_with($this->primaryModel, 'gemini');

                if ($primaryIsGemini) {
                    Log::info('GenerateQuestionsJob: Attempting Gemini model: '.$this->primaryModel);
                    if ($attemptGemini($this->primaryModel)) {
                        $success = true;
                    } else {
                        Log::warning('GenerateQuestionsJob: Gemini model '.$this->primaryModel.' failed: '.$errorMsg);
                    }
                } else {
                    Log::info('GenerateQuestionsJob: Attempting Groq model: '.$this->primaryModel);
                    if ($attemptGroq($this->primaryModel)) {
                        $success = true;
                    } else {
                        Log::warning('GenerateQuestionsJob: Groq model '.$this->primaryModel.' failed: '.$errorMsg);
                    }
                }

                if (! $success) {
                    Log::error('GenerateQuestionsJob: AI generation failed using model: '.$this->primaryModel.'. Error: '.$errorMsg);
                    AiGenerationFailed::dispatch($this->userId, $errorMsg ?: 'AI Generation failed using the selected model.', 'questions');

                    return;
                }

                $text = $resultText;

                $text = trim($text);
                if (str_starts_with($text, '```')) {
                    $text = preg_replace('/^```(?:json)?\n?|```$/', '', $text);
                }
                $text = trim($text);

                $questions = json_decode($text, true);
                if (! $questions || ! is_array($questions)) {
                    Log::error('GenerateQuestionsJob: Invalid JSON structure. Raw output: '.$text);
                    AiGenerationFailed::dispatch($this->userId, 'AI Generation failed. Invalid response format.', 'questions');

                    return;
                }

                foreach ($questions as $q) {
                    $category = Category::firstOrCreate(
                        ['slug' => Str::slug($validated['category'])],
                        ['name' => $validated['category']]
                    );

                    $subcategory = Subcategory::firstOrCreate(
                        [
                            'category_id' => $category->id,
                            'slug' => Str::slug($validated['subcategory']),
                        ],
                        [
                            'name' => $validated['subcategory'],
                            'language' => $validated['language'],
                        ]
                    );

                    $question = Question::create([
                        'subcategory_id' => $subcategory->id,
                        'language' => $validated['language'],
                        'stem' => $q['stem'] ?? '',
                        'options' => $q['options'] ?? [],
                        'correct_option' => (int) ($q['correct_option'] ?? 0),
                        'explanation' => $q['explanation'] ?? '',
                        'created_by' => $this->userId,
                        'status' => 'draft',
                    ]);
                }

                Cache::forget('questions.all');
                Cache::forget('questions.active');
                Cache::forget('categories.tree');

                Log::info('GenerateQuestionsJob: Successfully generated '.count($questions).' questions for subcategory "'.$subcategory.'" using model '.$this->primaryModel.' for user '.$this->userId.'.');

                AiGenerationCompleted::dispatch($this->userId, 'Questions generation completed! Check your drafts.', 'questions');

            } catch (\Exception $e) {
                Log::error('GenerateQuestionsJob: Error: '.$e->getMessage()."\nTrace: ".$e->getTraceAsString());
                AiGenerationFailed::dispatch($this->userId, 'An unexpected error occurred during AI generation.', 'questions');
            }
        } finally {
            if ($this->lockOwner) {
                $subcategory = $this->validated['subcategory'] ?? 'default';
                $lockKey = 'generate-questions-lock:'.Str::slug($subcategory);
                Cache::lock($lockKey, 180, $this->lockOwner)->release();
            }
        }
    }
}
