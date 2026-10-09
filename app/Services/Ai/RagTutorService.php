<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Enums\AiModel;
use App\Models\DocumentEmbedding;
use App\Models\LearnModule;
use App\Models\Question;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RagTutorService
{
    public function __construct(
        protected AiGatewayService $aiGateway
    ) {}

    /**
     * Answer a student's CSE exam question grounded in syllabus embeddings and conversational history.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     * @return array{answer: string, citations: array<int, array{title: string, url: string, slug: string}>, success: bool}
     */
    public function ask(string $query, ?int $subcategoryId = null, array $history = []): array
    {
        $searchQuery = $this->resolveSearchQuery($query, $history);
        $embedding = $this->aiGateway->createEmbedding($searchQuery);
        $contextChunks = $this->retrieveContextChunks($embedding, $subcategoryId);
        $relevantQuestions = $this->retrieveRelevantQuestions($query, $subcategoryId);

        $contextText = $this->formatContextText($contextChunks);
        $questionText = $this->formatQuestionContext($relevantQuestions);
        $systemPrompt = $this->buildSystemPrompt($contextText, $questionText, $history);

        $aiResponse = $this->aiGateway->runGemini(
            AiModel::GEMINI_3_8_FLASH,
            [
                'system_instruction' => [
                    'parts' => [['text' => $systemPrompt]],
                ],
                'contents' => [
                    ['parts' => [['text' => $query]]],
                ],
                'generationConfig' => [
                    'temperature' => 0.4,
                    'topP' => 0.85,
                    'maxOutputTokens' => 8192,
                ],
            ]
        );

        if (! $aiResponse['success'] || empty($aiResponse['text'])) {
            return [
                'answer' => 'I am currently unable to consult the syllabus notes. Please check your connection or try again in a moment.',
                'citations' => [],
                'success' => false,
            ];
        }

        [$cleanedAnswer, $citedTitles] = $this->extractAnswerAndCitations((string) $aiResponse['text']);
        $citations = $this->buildClickableCitations($citedTitles, $contextChunks);

        if (empty($citations)) {
            $fallback = $this->findFallbackModule($query, $subcategoryId);
            if ($fallback) {
                $citations[] = [
                    'title' => $fallback->title,
                    'slug' => $fallback->slug,
                    'url' => "/learn/{$fallback->slug}",
                ];
            }
        }

        return [
            'answer' => $cleanedAnswer,
            'citations' => $citations,
            'success' => true,
        ];
    }

    /**
     * Answer a student's CSE exam question and stream the response back.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     */
    public function askStream(string $query, ?int $subcategoryId = null, array $history = []): StreamedResponse
    {
        $searchQuery = $this->resolveSearchQuery($query, $history);
        $embedding = $this->aiGateway->createEmbedding($searchQuery);
        $contextChunks = $this->retrieveContextChunks($embedding, $subcategoryId);
        $relevantQuestions = $this->retrieveRelevantQuestions($query, $subcategoryId);

        $contextText = $this->formatContextText($contextChunks);
        $questionText = $this->formatQuestionContext($relevantQuestions);
        $systemPrompt = $this->buildSystemPrompt($contextText, $questionText, $history);

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => [
                ['parts' => [['text' => $query]]],
            ],
            'generationConfig' => [
                'temperature' => 0.4,
                'topP' => 0.85,
                'maxOutputTokens' => 8192,
            ],
        ];

        return response()->stream(function () use ($payload, $contextChunks, $query, $subcategoryId) {
            $stream = $this->aiGateway->runGeminiStream(
                AiModel::GEMINI_3_8_FLASH,
                $payload
            );

            $fullText = '';

            foreach ($stream as $chunk) {
                $fullText .= $chunk;

                // If we detect the CITATIONS block starting, we can try to parse it on the fly or just let the frontend handle it.
                // It is simpler to just emit the chunk and let the frontend parse "CITATIONS:" out.

                echo 'data: '.json_encode(['chunk' => $chunk])."\n\n";
                ob_flush();
                flush();
            }

            // Extract citations at the very end
            [, $citedTitles] = $this->extractAnswerAndCitations($fullText);
            $citations = $this->buildClickableCitations($citedTitles, $contextChunks);

            if (empty($citations)) {
                $fallback = $this->findFallbackModule($query, $subcategoryId);
                if ($fallback) {
                    $citations[] = [
                        'title' => $fallback->title,
                        'slug' => $fallback->slug,
                        'url' => "/learn/{$fallback->slug}",
                    ];
                }
            }

            echo 'data: '.json_encode(['citations' => $citations])."\n\n";
            echo "data: [DONE]\n\n";
            ob_flush();
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Contextualize follow-up questions using recent dialogue history for RAG embedding.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     */
    protected function resolveSearchQuery(string $query, array $history): string
    {
        if (empty($history)) {
            return $query;
        }

        $lastUserQuery = null;
        for ($i = count($history) - 1; $i >= 0; $i--) {
            if (($history[$i]['role'] ?? '') === 'user') {
                $lastUserQuery = trim((string) ($history[$i]['content'] ?? ''));
                break;
            }
        }

        if ($lastUserQuery && (Str::wordCount($query) < 8 || preg_match('/\b(more|example|why|how|another|what about|continue|explain|also|trap)\b/i', $query))) {
            return "{$lastUserQuery} {$query}";
        }

        return $query;
    }

    /**
     * Format retrieved chunks with clear source identification.
     *
     * @param  Collection<int, object>  $contextChunks
     */
    protected function formatContextText(Collection $contextChunks): string
    {
        if ($contextChunks->isEmpty()) {
            return '';
        }

        $formatted = [];
        foreach ($contextChunks as $idx => $chunk) {
            $meta = is_array($chunk->metadata) ? $chunk->metadata : (json_decode((string) $chunk->metadata, true) ?? []);
            $title = $meta['title'] ?? 'Syllabus Module';
            $topic = $meta['topic'] ?? '';
            $num = $idx + 1;
            $formatted[] = "[SOURCE {$num}: {$title}".($topic ? " | Topic: {$topic}" : '')."]\n".$chunk->chunk_content;
        }

        return implode("\n\n---\n\n", $formatted);
    }

    /**
     * Retrieve relevant reference chunks using Neon pgvector HNSW or PHP fallback.
     *
     * @param  array<float>  $embedding
     * @return Collection<int, object>
     */
    protected function retrieveContextChunks(array $embedding, ?int $subcategoryId = null): Collection
    {
        if (empty($embedding)) {
            return collect();
        }

        if ($this->hasVectorSupport()) {
            $vectorStr = '['.implode(',', $embedding).']';
            $query = DB::table('document_embeddings')
                ->select(['chunk_content', 'metadata', 'sourceable_id', 'sourceable_type']);

            if ($subcategoryId) {
                $query->where('subcategory_id', $subcategoryId);
            }

            return collect($query
                ->orderByRaw('embedding <=> ?::vector', [$vectorStr])
                ->limit(4)
                ->get());
        }

        // In-memory cosine similarity fallback (local Postgres without pgvector or SQLite)
        $candidates = DocumentEmbedding::query()
            ->when($subcategoryId, fn ($q) => $q->where('subcategory_id', $subcategoryId))
            ->get();

        if ($candidates->isEmpty()) {
            return collect();
        }

        return $candidates
            ->map(function (DocumentEmbedding $doc) use ($embedding) {
                $docEmbedding = is_array($doc->embedding) ? $doc->embedding : (json_decode((string) $doc->embedding, true) ?? []);
                $doc->similarity = $this->cosineSimilarity($embedding, (array) $docEmbedding);

                return (object) [
                    'chunk_content' => $doc->chunk_content,
                    'metadata' => $doc->metadata,
                    'sourceable_id' => $doc->sourceable_id,
                    'sourceable_type' => $doc->sourceable_type,
                    'similarity' => $doc->similarity,
                ];
            })
            ->sortByDesc('similarity')
            ->take(4)
            ->values();
    }

    /**
     * Build pedagogical system prompt including conversational history and citation rules.
     *
     * @param  array<int, array{role: string, content: string}>  $history
     */
    protected function buildSystemPrompt(string $context, string $questionContext = '', array $history = []): string
    {
        $contextSection = $context !== '' ? "### VERIFIED SYLLABUS KNOWLEDGE:\n{$context}\n\n" : '';
        $questionSection = $questionContext !== '' ? "### AUTHENTIC CSE PRACTICE QUESTIONS & EXPLANATIONS:\n{$questionContext}\n\n" : '';

        $historySection = '';
        if (! empty($history)) {
            $recentHistory = array_slice($history, -6);
            $historyLines = [];
            foreach ($recentHistory as $turn) {
                $speaker = ($turn['role'] ?? '') === 'user' ? 'Candidate' : 'Tutor';
                $text = trim((string) ($turn['content'] ?? ''));
                if (mb_strlen($text) > 350) {
                    $text = mb_substr($text, 0, 350).'...';
                }
                $historyLines[] = "{$speaker}: {$text}";
            }
            $historySection = "### CONVERSATION HISTORY (RECENT TURNS):\n".implode("\n", $historyLines)."\n\n";
        }

        return <<<EOT
You are Hiraya AI Tutor, an elite and encouraging mentor for candidates preparing for the Philippine Civil Service Examination (CSE - Professional & Subprofessional Levels).

{$contextSection}{$questionSection}{$historySection}
### INSTRUCTIONS:
1. If CONVERSATION HISTORY exists, you MUST continue directly on that active topic (e.g. if the candidate asks "Can you provide more example", provide new examples of the exact topic discussed previously).
2. Keep the explanation CONCISE, DIRECT, and EASY TO READ. Provide what is best for the specific response.
3. DO NOT use conversational greetings like "Mabuhay" or introduce yourself; dive straight into the explanation.
4. Structure your response using appropriate Markdown headings (e.g., '##') based on what fits best.
   - For general questions, you might use sections like "Core Rule", "Example", or "Exam Shortcut" if applicable.
   - If the user asks for a table, list, or visual breakdown, provide it clearly.
   - Do not force the "Core Rule & Formula", "Quick Worked Example", and "Exam Shortcut & Trap" structure if the question is asking for something else like a table or specific explanation.
5. Formatting Rules:
   - Use clean, standard Markdown (headings with ##, bold key terms with **, and bullet lists with -).
   - Section Dividers: Use "---" on a line by itself to cleanly separate major sections (e.g. between theory, procedures, and worked examples).
   - Key Tips & Callouts: Use blockquotes ('>') for important exam shortcuts, memory mnemonics, or traps (e.g., "> **Exam Shortcut:** ...").
   - Step-by-Step Solutions & Worked Examples:
     * Only the primary step should be bulleted or numbered (e.g., "- **Step 1: Parentheses**" or "1. **Step 1: Parentheses**").
     * Intermediate calculations and details MUST be placed on lines beneath the step without bullet dashes (e.g., "  Inside parentheses: `8 - 6 = 2`"). DO NOT put bullet dashes (-) on every sub-line.
   - Mathematical Expressions & Formulas:
     * Wrap all mathematical expressions, equations, values, and calculations in backticks (e.g., `12 - 3 * (8 - 6)^2 + 20 / 4`, `8 - 6 = 2`, `3^2`, `sqrt(16)`).
     * DO NOT use LaTeX syntax like \\frac, \\times, or dollar sign math delimiters ($...$).
   - Ensure markdown tables are formatted tightly without empty lines between rows (e.g., | A | B |\\n|---|---|\\n| C | D |).
   - Keep bullet points short and easy to digest (1-2 lines each).
6. COMPLETENESS GUARANTEE:
   - Ensure the answer is 100% complete and never cut off prematurely.
   - If the candidate asks for a list or enumeration (such as the 8 Norms of Conduct under RA 6713, constitutional commissions, or mathematical steps), you MUST thoroughly complete all items from 1 to the end with their full descriptions.
7. CITATIONS RULE:
   At the very end of your response, on a new line, output:
   CITATIONS: [comma-separated exact titles of the SOURCES from VERIFIED SYLLABUS KNOWLEDGE above that were genuinely relevant and used to answer the question, or "None" if no sources above are relevant to this topic].
EOT;
    }

    /**
     * Extract clean answer text and cited syllabus titles from the model output.
     *
     * @return array{0: string, 1: array<int, string>}
     */
    protected function extractAnswerAndCitations(string $text): array
    {
        $citedTitles = [];
        if (preg_match('/CITATIONS:\s*(.+)$/im', $text, $match)) {
            $rawCitations = trim($match[1]);
            if (strcasecmp($rawCitations, 'None') !== 0 && strcasecmp($rawCitations, 'N/A') !== 0) {
                $parts = array_map('trim', explode(',', $rawCitations));
                foreach ($parts as $p) {
                    $cleaned = trim($p, " []\"'");
                    if ($cleaned !== '' && strcasecmp($cleaned, 'None') !== 0) {
                        $citedTitles[] = $cleaned;
                    }
                }
            }
            $text = (string) preg_replace('/CITATIONS:\s*(.+)$/im', '', $text);
        }

        return [trim($text), array_values(array_unique($citedTitles))];
    }

    /**
     * Match cited titles to LearnModule records to produce clickable URL citations.
     *
     * @param  array<int, string>  $citedTitles
     * @param  Collection<int, object>  $contextChunks
     * @return array<int, array{title: string, url: string, slug: string}>
     */
    protected function buildClickableCitations(array $citedTitles, Collection $contextChunks): array
    {
        $citations = [];
        $seenTitles = [];

        if (! empty($citedTitles)) {
            $moduleIds = $contextChunks
                ->where('sourceable_type', LearnModule::class)
                ->pluck('sourceable_id')
                ->filter()
                ->unique();

            $modules = LearnModule::whereIn('id', $moduleIds)->get()->keyBy('id');

            foreach ($citedTitles as $title) {
                $normalizedTitle = mb_strtolower(trim($title));
                if (isset($seenTitles[$normalizedTitle])) {
                    continue;
                }

                /** @var ?LearnModule $matchedModule */
                $matchedModule = $modules->first(function (LearnModule $m) use ($normalizedTitle) {
                    $mTitle = mb_strtolower($m->title);

                    return $mTitle === $normalizedTitle || str_contains($mTitle, $normalizedTitle) || str_contains($normalizedTitle, $mTitle);
                });

                if (! $matchedModule) {
                    $matchedModule = LearnModule::where('is_published', true)
                        ->where(function ($q) use ($normalizedTitle) {
                            $q->whereRaw('LOWER(title) LIKE ?', ["%{$normalizedTitle}%"]);
                        })
                        ->first();
                }

                if ($matchedModule) {
                    $seenTitles[$normalizedTitle] = true;
                    $citations[] = [
                        'title' => $matchedModule->title,
                        'slug' => $matchedModule->slug,
                        'url' => "/learn/{$matchedModule->slug}",
                    ];
                }
            }
        }

        // If no explicit model citations matched, use the highest relevance retrieved module
        if (empty($citations) && $contextChunks->isNotEmpty()) {
            foreach ($contextChunks as $chunk) {
                if ($chunk->sourceable_type === LearnModule::class && ! empty($chunk->sourceable_id)) {
                    $mod = LearnModule::where('id', $chunk->sourceable_id)->where('is_published', true)->first();
                    if ($mod && ! isset($seenTitles[mb_strtolower($mod->title)])) {
                        $seenTitles[mb_strtolower($mod->title)] = true;
                        $citations[] = [
                            'title' => $mod->title,
                            'slug' => $mod->slug,
                            'url' => "/learn/{$mod->slug}",
                        ];
                        break;
                    }
                }
            }
        }

        return $citations;
    }

    /**
     * Find a relevant fallback module based on query topics or subcategory.
     */
    protected function findFallbackModule(string $query, ?int $subcategoryId = null): ?LearnModule
    {
        if ($subcategoryId) {
            $bySubcat = LearnModule::where('is_published', true)
                ->where('subcategory_id', $subcategoryId)
                ->first();
            if ($bySubcat) {
                return $bySubcat;
            }
        }

        $queryLower = mb_strtolower($query);
        $domainPatterns = [
            'subject|verb|grammar|agreement|sva|pronoun|preposition|idiom|spelling|error' => ['subject-verb', 'grammar', 'verbal', 'error'],
            '6713|ethical|conduct|public official|saln|nepotism|graft|norm' => ['6713', 'conduct', 'ethical'],
            'constitution|immunity|commission|bill of rights|citizenship|executive|judiciary|legislative|state' => ['constitution'],
            'work|rate|cistern|pipe|job|worker|together' => ['work-and-rate', 'word-problem'],
            'pemdas|fraction|decimal|lcm|arithmetic|operation' => ['pemdas', 'fraction', 'decimal', 'lcm'],
            'series|sequence|pattern|recognition' => ['number-series', 'pattern'],
        ];

        foreach ($domainPatterns as $pattern => $slugHints) {
            if (preg_match('/\b('.$pattern.')\b/i', $queryLower)) {
                $matched = LearnModule::where('is_published', true)
                    ->where(function ($q) use ($slugHints) {
                        foreach ($slugHints as $hint) {
                            $q->orWhere('slug', 'LIKE', "%{$hint}%")
                                ->orWhere('title', 'LIKE', "%{$hint}%");
                        }
                    })
                    ->first();

                if ($matched) {
                    return $matched;
                }
            }
        }

        return LearnModule::where('is_published', true)->first();
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

    /**
     * Retrieve relevant approved practice questions and explanations matching the query or subcategory.
     *
     * @return Collection<int, Question>
     */
    protected function retrieveRelevantQuestions(string $query, ?int $subcategoryId = null): Collection
    {
        $cleanWords = array_values(array_filter(
            preg_split('/\s+/', preg_replace('/[^\p{L}\p{N}\s]/u', '', mb_strtolower($query)) ?? '') ?: [],
            fn (string $w) => mb_strlen($w) >= 3 && ! in_array($w, ['the', 'and', 'what', 'are', 'for', 'with', 'under', 'how', 'can', 'you', 'explain', 'give', 'more'])
        ));

        $q = Question::query();

        if ($subcategoryId) {
            $q->where('subcategory_id', $subcategoryId);
        }

        if (! empty($cleanWords)) {
            $q->where(function ($sub) use ($cleanWords) {
                foreach (array_slice($cleanWords, 0, 4) as $word) {
                    $sub->orWhere('stem', 'LIKE', "%{$word}%")
                        ->orWhere('explanation', 'LIKE', "%{$word}%");
                }
            });
        }

        return $q->take(3)->get(['id', 'stem', 'explanation', 'options', 'correct_option', 'subcategory_id']);
    }

    /**
     * Format retrieved practice questions into context text.
     *
     * @param  Collection<int, Question>  $questions
     */
    protected function formatQuestionContext(Collection $questions): string
    {
        if ($questions->isEmpty()) {
            return '';
        }

        $formatted = [];
        foreach ($questions as $idx => $q) {
            $num = $idx + 1;
            $stem = trim((string) $q->stem);
            $explanation = trim((string) $q->explanation);
            $formatted[] = "[AUTHENTIC CSE EXAM QUESTION {$num}]\nQuestion Stem: {$stem}\nVerified Explanation: {$explanation}";
        }

        return implode("\n\n---\n\n", $formatted);
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
}
