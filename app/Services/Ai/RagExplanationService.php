<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Enums\AiModel;
use App\Models\DocumentEmbedding;
use App\Models\LearnModule;
use App\Models\Question;
use App\Models\QuestionAiExplanation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RagExplanationService
{
    public function __construct(
        protected AiGatewayService $aiGateway
    ) {}

    /**
     * Get or generate a RAG-grounded cognitive explanation for a question and selected option.
     *
     * @return array{explanation: string, cached: bool, source: string}
     */
    public function explain(Question $question, int $selectedOption): array
    {
        // 1. O(1) Cache Hit: Return immediately if already generated
        $cached = QuestionAiExplanation::where('question_id', $question->id)
            ->where('selected_option', $selectedOption)
            ->first();

        if ($cached) {
            return [
                'explanation' => $cached->explanation,
                'cached' => true,
                'source' => 'cache',
            ];
        }

        // 2. Retrieve Grounding Context via pgvector or fallback
        $context = $this->retrieveContext($question);

        // 3. Synthesize with Gemini
        $options = is_array($question->options) ? $question->options : [];
        $selectedText = $options[$selectedOption] ?? "Option {$selectedOption}";
        $correctText = $options[$question->correct_option] ?? "Option {$question->correct_option}";
        $selectedLetter = chr(65 + $selectedOption);
        $correctLetter = chr(65 + (int) $question->correct_option);
        $isCorrect = $selectedOption === (int) $question->correct_option;

        $prompt = $this->buildExplanationPrompt(
            question: $question,
            selectedLetter: $selectedLetter,
            selectedText: (string) $selectedText,
            correctLetter: $correctLetter,
            correctText: (string) $correctText,
            isCorrect: $isCorrect,
            context: $context
        );

        $aiResponse = $this->aiGateway->runGemini(
            AiModel::GEMINI_3_8_FLASH,
            [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'topP' => 0.8,
                    'maxOutputTokens' => 8192,
                ],
            ]
        );

        $generatedText = '';
        if ($aiResponse['success'] && ! empty($aiResponse['text'])) {
            $generatedText = html_entity_decode(trim((string) $aiResponse['text']), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        } elseif (! empty($question->explanation)) {
            $generatedText = $question->explanation;
        } else {
            $generatedText = "The correct answer is Option {$correctLetter}: {$correctText}.";
        }

        // 4. Persist to cache so all future users hit the cache (10k scale)
        QuestionAiExplanation::create([
            'question_id' => $question->id,
            'selected_option' => $selectedOption,
            'explanation' => $generatedText,
            'tokens_used' => 0,
        ]);

        return [
            'explanation' => $generatedText,
            'cached' => false,
            'source' => $aiResponse['success'] ? 'rag_gemini' : 'fallback',
        ];
    }

    /**
     * Retrieve relevant reference chunks using pgvector (Neon) or memory fallback.
     */
    protected function retrieveContext(Question $question): string
    {
        $queryText = "{$question->stem}\nRationale: {$question->explanation}";
        $embedding = $this->aiGateway->createEmbedding($queryText);

        if (empty($embedding)) {
            return '';
        }

        if ($this->hasVectorSupport()) {
            $vectorStr = '['.implode(',', $embedding).']';
            $query = DB::table('document_embeddings');

            if ($question->subcategory_id) {
                $query->where('subcategory_id', $question->subcategory_id);
            }

            $chunks = $query
                ->select('chunk_content')
                ->orderByRaw('embedding <=> ?::vector', [$vectorStr])
                ->limit(3)
                ->pluck('chunk_content')
                ->all();

            return implode("\n\n---\n\n", $chunks);
        }

        // In-memory cosine similarity fallback (local Postgres without pgvector or SQLite)
        $candidates = DocumentEmbedding::query()
            ->when($question->subcategory_id, fn ($q) => $q->where('subcategory_id', $question->subcategory_id))
            ->get();

        if ($candidates->isEmpty()) {
            return '';
        }

        return $candidates
            ->map(function (DocumentEmbedding $doc) use ($embedding) {
                $docEmbedding = is_array($doc->embedding) ? $doc->embedding : (json_decode((string) $doc->embedding, true) ?? []);
                $doc->similarity = $this->cosineSimilarity($embedding, (array) $docEmbedding);

                return $doc;
            })
            ->sortByDesc('similarity')
            ->take(3)
            ->pluck('chunk_content')
            ->implode("\n\n---\n\n");
    }

    /**
     * Chunk and embed a LearnModule into document_embeddings.
     */
    public function indexLearnModule(LearnModule $module): int
    {
        // Remove existing chunks for this module
        DocumentEmbedding::where('sourceable_type', LearnModule::class)
            ->where('sourceable_id', $module->id)
            ->delete();

        $chunks = $this->chunkContent($module->content ?? $module->summary ?? '');
        $indexed = 0;

        foreach ($chunks as $chunk) {
            $chunk = trim($chunk);
            if (strlen($chunk) < 50) {
                continue;
            }

            $embedding = $this->aiGateway->createEmbedding($chunk);
            if (empty($embedding)) {
                continue;
            }

            if ($this->hasVectorSupport()) {
                $vectorStr = '['.implode(',', $embedding).']';
                DB::statement('
                    INSERT INTO document_embeddings (subcategory_id, sourceable_type, sourceable_id, chunk_content, metadata, embedding, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?::vector, NOW(), NOW())
                ', [
                    $module->subcategory_id,
                    LearnModule::class,
                    $module->id,
                    $chunk,
                    json_encode(['title' => $module->title, 'topic' => $module->topic]),
                    $vectorStr,
                ]);
            } else {
                DocumentEmbedding::create([
                    'subcategory_id' => $module->subcategory_id,
                    'sourceable_type' => LearnModule::class,
                    'sourceable_id' => $module->id,
                    'chunk_content' => $chunk,
                    'metadata' => ['title' => $module->title, 'topic' => $module->topic],
                    'embedding' => $embedding,
                ]);
            }

            $indexed++;
        }

        return $indexed;
    }

    /**
     * Check whether pgvector extension is installed and active in the database.
     */
    protected function hasVectorSupport(): bool
    {
        static $supported = null;
        if ($supported !== null) {
            return $supported;
        }

        if (DB::getDriverName() !== 'pgsql') {
            return $supported = false;
        }

        try {
            return $supported = (bool) DB::selectOne("SELECT 1 FROM pg_extension WHERE extname = 'vector'");
        } catch (\Throwable) {
            return $supported = false;
        }
    }

    /**
     * Split long text into digestible knowledge chunks for embedding.
     *
     * @return array<string>
     */
    protected function chunkContent(string $text, int $maxWords = 250): array
    {
        $paragraphs = preg_split('/\n\s*\n/', $text) ?: [$text];
        $chunks = [];
        $currentChunk = '';

        foreach ($paragraphs as $para) {
            $para = trim($para);
            if ($para === '') {
                continue;
            }

            $wordCount = Str::wordCount($currentChunk.' '.$para);
            if ($wordCount > $maxWords && $currentChunk !== '') {
                $chunks[] = trim($currentChunk);
                $currentChunk = $para;
            } else {
                $currentChunk = trim($currentChunk."\n\n".$para);
            }
        }

        if ($currentChunk !== '') {
            $chunks[] = trim($currentChunk);
        }

        return $chunks;
    }

    protected function buildExplanationPrompt(
        Question $question,
        string $selectedLetter,
        string $selectedText,
        string $correctLetter,
        string $correctText,
        bool $isCorrect,
        string $context
    ): string {
        $contextSection = $context !== '' ? "### VERIFIED SYLLABUS REFERENCE CONTEXT:\n{$context}\n" : '';

        return <<<EOT
You are the Lead Exam Reviewer at Hiraya Review, an elite Philippine Civil Service Exam (CSE) preparation platform.
Provide a clear, pedagogical breakdown of the following question for a student.

{$contextSection}
### QUESTION:
Stem: {$question->stem}
Original Rationale: {$question->explanation}

Options:
{$this->formatOptions($question->options)}

Student Selected: Option {$selectedLetter} ({$selectedText}) - status: [{$this->statusText($isCorrect)}]
Correct Answer: Option {$correctLetter} ({$correctText})

### INSTRUCTIONS:
1. State whether Option {$selectedLetter} is correct or incorrect, and explain directly why.
2. If incorrect, explain why the student might have chosen it (the distractor trap) and why Option {$correctLetter} is the objectively correct answer according to the Civil Service Commission rules/principles.
3. Reference the relevant rule (e.g. grammar rule, math step, Republic Act / Constitution article, or logical reasoning principle).
4. Provide a 1-sentence "Exam Takeaway" or mental shortcut for the real exam.
5. Format with clean, compact Markdown (bolding key terms, no fluff, no pleasantries).
6. NEVER use HTML entities (such as &rarr;, &times;, &le;, &ge;). Use unicode symbols (→, ×, ≤, ≥) or standard characters (->, *), and wrap formulas in backticks.
EOT;
    }

    protected function formatOptions(mixed $options): string
    {
        if (! is_array($options)) {
            return '';
        }

        $lines = [];
        foreach ($options as $idx => $opt) {
            $letter = chr(65 + $idx);
            $lines[] = "{$letter}. {$opt}";
        }

        return implode("\n", $lines);
    }

    protected function statusText(bool $isCorrect): string
    {
        return $isCorrect ? 'CORRECT' : 'INCORRECT';
    }

    protected function cosineSimilarity(array $vecA, array $vecB): float
    {
        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($vecA as $i => $val) {
            $valB = (float) ($vecB[$i] ?? 0.0);
            $valA = (float) $val;
            $dotProduct += $valA * $valB;
            $normA += $valA * $valA;
            $normB += $valB * $valB;
        }

        return ($normA * $normB) > 0 ? $dotProduct / (sqrt($normA) * sqrt($normB)) : 0.0;
    }
}
