<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Enums\AiModel;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiGatewayService
{
    public const string DEFAULT_WORKERS_AI_MODEL = '@cf/meta/llama-3.2-3b-instruct';

    public const string FALLBACK_GEMINI_MODEL = 'gemini-3.7-flash';

    /**
     * Determine if a given model identifier belongs to Cloudflare Workers AI.
     */
    public function isWorkersAiModel(AiModel|string $model): bool
    {
        $model = $model instanceof AiModel ? $model->value : $model;

        return str_starts_with($model, '@cf/')
            || str_starts_with($model, 'cf/')
            || str_contains($model, 'llama-')
            || str_contains($model, 'deepseek');
    }

    /**
     * Resolve the REST endpoint for Cloudflare Workers AI.
     */
    public function resolveWorkersAiUrl(AiModel|string $model): string
    {
        $model = $model instanceof AiModel ? $model->value : $model;
        $accountId = (string) config('services.cloudflare.account_id');
        $normalizedModel = ltrim($model, '/');

        return "https://api.cloudflare.com/client/v4/accounts/{$accountId}/ai/run/{$normalizedModel}";
    }

    /**
     * Check whether Cloudflare AI Gateway is configured.
     */
    public function isAiGatewayConfigured(): bool
    {
        return ! empty(config('services.cloudflare.account_id'))
            && (! empty(config('services.cloudflare.ai_gateway_id')) || ! empty(config('services.cloudflare.ai_gateway.id')));
    }

    public function resolveGeminiUrl(AiModel|string $model, bool $isStream = false, bool $forceDirect = false): string
    {
        $model = $model instanceof AiModel ? $model->value : $model;
        $action = $isStream ? 'streamGenerateContent?alt=sse' : 'generateContent';

        if (! $forceDirect && $this->isAiGatewayConfigured()) {
            $accountId = config('services.cloudflare.account_id');
            $gatewayId = config('services.cloudflare.ai_gateway_id') ?: config('services.cloudflare.ai_gateway.id');

            return "https://gateway.ai.cloudflare.com/v1/{$accountId}/{$gatewayId}/google-ai-studio/v1beta/models/{$model}:{$action}";
        }

        return "https://generativelanguage.googleapis.com/v1beta/models/{$model}:{$action}";
    }

    /**
     * Resolve the direct Groq API endpoint.
     */
    public function resolveGroqUrl(): string
    {
        return 'https://api.groq.com/openai/v1/chat/completions';
    }

    /**
     * Check whether Cloudflare Workers AI credentials are configured.
     */
    public function isWorkersAiConfigured(): bool
    {
        return (bool) (config('services.cloudflare.account_id') && config('services.cloudflare.api_token'));
    }

    /**
     * Check whether Google Gemini credentials are configured.
     */
    public function isGeminiConfigured(): bool
    {
        return (bool) config('services.gemini.key');
    }

    /**
     * Check whether any AI provider (Cloudflare Workers AI or Google Gemini) is configured.
     */
    public function isAiConfigured(): bool
    {
        return $this->isWorkersAiConfigured() || $this->isGeminiConfigured();
    }

    /**
     * Execute a text generation run against Cloudflare Workers AI.
     *
     * @param  array<string, mixed>  $payload
     * @return array{success: bool, text?: string, error?: string, status?: int}
     */
    public function runWorkersAi(AiModel|string $model, array $payload, int $timeout = 180): array
    {
        $model = $model instanceof AiModel ? $model->value : $model;
        $token = (string) config('services.cloudflare.api_token');
        if ($token === '') {
            return ['success' => false, 'error' => 'CLOUDFLARE_API_TOKEN is missing.'];
        }

        if (! isset($payload['max_tokens'])) {
            $payload['max_tokens'] = 4096;
        }

        $url = $this->resolveWorkersAiUrl($model);
        $headers = [
            'Authorization' => "Bearer {$token}",
        ];

        $gatewayId = (string) (config('services.cloudflare.ai_gateway_id') ?: config('services.cloudflare.ai_gateway.id'));
        if ($gatewayId !== '') {
            $headers['cf-aig-gateway-id'] = $gatewayId;
            $headers['cf-aig-cache'] = 'true';
        }

        try {
            /** @var Response $response */
            $response = Http::withHeaders($headers)
                ->timeout($timeout)
                ->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $text = $data['result']['response'] ?? '';

                return [
                    'success' => true,
                    'text' => is_string($text) ? $text : json_encode($text),
                    'status' => $response->status(),
                ];
            }

            $errorBody = $response->json();
            $errorMessage = $errorBody['errors'][0]['message'] ?? $response->body();

            return [
                'success' => false,
                'error' => "Workers AI request failed with status {$response->status()}: {$errorMessage}",
                'status' => $response->status(),
            ];
        } catch (\Throwable $e) {
            return [
                'success' => false,
                'error' => "Workers AI Exception: {$e->getMessage()}",
            ];
        }
    }

    /**
     * Execute a generation run against Cloudflare Workers AI and stream the response.
     *
     * @param  array<string, mixed>  $payload
     * @return \Generator<string>
     */
    public function runWorkersAiStream(AiModel|string $model, array $payload, int $timeout = 180, bool $isFallback = false): \Generator
    {
        $model = $model instanceof AiModel ? $model->value : $model;
        $token = (string) config('services.cloudflare.api_token');
        if ($token === '') {
            yield 'Error: CLOUDFLARE_API_TOKEN is missing.';

            return;
        }

        if (! isset($payload['max_tokens'])) {
            $payload['max_tokens'] = 4096;
        }

        $url = $this->resolveWorkersAiUrl($model);
        $headers = [
            'Authorization' => "Bearer {$token}",
        ];

        $gatewayId = (string) (config('services.cloudflare.ai_gateway_id') ?: config('services.cloudflare.ai_gateway.id'));
        if ($gatewayId !== '') {
            $headers['cf-aig-gateway-id'] = $gatewayId;
            $headers['cf-aig-cache'] = 'true';
        }

        try {
            $response = Http::withHeaders($headers)
                ->withOptions(['stream' => true])
                ->timeout($timeout)
                ->post($url, $payload);

            if (! $response->successful()) {
                Log::warning("Workers AI Streaming Error [{$response->status()}]: ".$response->toPsrResponse()->getBody()->getContents());

                if (! $isFallback) {
                    Log::warning('Workers AI failed. Falling back to Gemini.');

                    $systemPrompt = '';
                    $userPrompt = '';
                    foreach ($payload['messages'] ?? [] as $msg) {
                        if (($msg['role'] ?? '') === 'system') {
                            $systemPrompt = $msg['content'] ?? '';
                        } elseif (($msg['role'] ?? '') === 'user') {
                            $userPrompt = $msg['content'] ?? '';
                        }
                    }

                    $geminiPayload = [
                        'contents' => [
                            ['parts' => [['text' => $userPrompt !== '' ? $userPrompt : ($payload['messages'][0]['content'] ?? '')]]],
                        ],
                        'generationConfig' => [
                            'temperature' => 0.4,
                            'topP' => 0.85,
                        ],
                    ];

                    if ($systemPrompt !== '') {
                        $geminiPayload['system_instruction'] = [
                            'parts' => [['text' => $systemPrompt]],
                        ];
                    }

                    yield from $this->runGeminiStream(AiModel::GEMINI_3_8_FLASH, $geminiPayload, $timeout, true);

                    return;
                }

                yield "**Unable to connect:** AI servers are currently experiencing unusually high demand.\n\nPlease try asking your question again in a few moments.";

                return;
            }

            $body = $response->toPsrResponse()->getBody();
            $buffer = '';

            while (! $body->eof()) {
                $buffer .= $body->read(1024);
                $buffer = str_replace("\r\n", "\n", $buffer);

                while (($pos = strpos($buffer, "\n\n")) !== false) {
                    $event = substr($buffer, 0, $pos);
                    $buffer = substr($buffer, $pos + 2);

                    if (str_starts_with($event, 'data: ')) {
                        $dataStr = substr($event, 6);

                        if ($dataStr === '[DONE]') {
                            break 2;
                        }

                        $data = json_decode($dataStr, true);
                        if (is_array($data) && isset($data['response'])) {
                            yield (string) $data['response'];
                        }
                    }
                }
            }

            // Process any remaining buffer that doesn't have a trailing newline
            if ($buffer !== '') {
                $event = $buffer;
                if (str_starts_with($event, 'data: ')) {
                    $dataStr = substr($event, 6);
                    if ($dataStr !== '[DONE]') {
                        $data = json_decode($dataStr, true);
                        if (is_array($data) && isset($data['response'])) {
                            yield (string) $data['response'];
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('Workers AI Streaming Exception: '.$e->getMessage());

            if (! $isFallback) {
                Log::warning('Workers AI threw exception. Falling back to Gemini.');

                $systemPrompt = '';
                $userPrompt = '';
                foreach ($payload['messages'] ?? [] as $msg) {
                    if (($msg['role'] ?? '') === 'system') {
                        $systemPrompt = $msg['content'] ?? '';
                    } elseif (($msg['role'] ?? '') === 'user') {
                        $userPrompt = $msg['content'] ?? '';
                    }
                }

                $geminiPayload = [
                    'contents' => [
                        ['parts' => [['text' => $userPrompt !== '' ? $userPrompt : ($payload['messages'][0]['content'] ?? '')]]],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.4,
                        'topP' => 0.85,
                    ],
                ];

                if ($systemPrompt !== '') {
                    $geminiPayload['system_instruction'] = [
                        'parts' => [['text' => $systemPrompt]],
                    ];
                }

                yield from $this->runGeminiStream(AiModel::GEMINI_3_8_FLASH, $geminiPayload, $timeout, true);

                return;
            }

            yield "**Connection Interrupted:** I'm sorry, but my connection to the AI server was lost.\n\nPlease try asking your question again in a few moments.";
        }
    }

    /**
     * Execute a generation run against Google Gemini API.
     *
     * @param  array<string, mixed>  $payload
     * @return array{success: bool, text?: string, error?: string, status?: int}
     */
    public function runGemini(AiModel|string $model, array $payload, int $timeout = 300, bool $forceDirect = false): array
    {
        $model = $model instanceof AiModel ? $model->value : $model;
        $geminiKey = (string) config('services.gemini.key');
        if ($geminiKey === '') {
            return ['success' => false, 'error' => 'GEMINI_API_KEY is missing.'];
        }

        $url = $this->resolveGeminiUrl($model, false, $forceDirect);
        $headers = [
            'x-goog-api-key' => $geminiKey,
            'Content-Type' => 'application/json',
        ];

        if (! $forceDirect && $this->isAiGatewayConfigured()) {
            $headers['cf-aig-cache'] = 'true';
            $cfToken = (string) config('services.cloudflare.api_token');
            if ($cfToken !== '') {
                $headers['cf-aig-authorization'] = "Bearer {$cfToken}";
            }
        }

        try {
            /** @var Response $response */
            $response = Http::withHeaders($headers)->timeout($timeout)->post($url, $payload);

            if ($response->successful()) {
                $data = $response->json();
                $parts = $data['candidates'][0]['content']['parts'] ?? [];
                $textParts = [];

                foreach ($parts as $part) {
                    if (! empty($part['thought'])) {
                        continue;
                    }
                    if (isset($part['text']) && is_string($part['text'])) {
                        $textParts[] = $part['text'];
                    }
                }

                $text = trim(implode("\n", $textParts));

                if ($text !== '') {
                    return [
                        'success' => true,
                        'text' => $text,
                        'status' => $response->status(),
                    ];
                }
            }

            // If gateway returned an error (e.g. 401/502), retry directly to Google AI Studio first
            if (! $forceDirect && $this->isAiGatewayConfigured()) {
                Log::warning("Gemini Gateway failed [{$response->status()}]. Retrying directly to Google AI Studio.");

                return $this->runGemini($model, $payload, $timeout, true);
            }

            // Fallback cascade across Gemini models
            $nextModel = match ($model) {
                AiModel::GEMINI_3_8_FLASH->value => AiModel::GEMINI_3_7_FLASH,
                AiModel::GEMINI_3_7_FLASH->value => AiModel::GEMINI_3_5_FLASH,
                AiModel::GEMINI_3_5_FLASH->value => AiModel::GEMINI_2_5_FLASH,
                default => null,
            };

            if ($nextModel !== null) {
                return $this->runGemini($nextModel, $payload, $timeout, $forceDirect);
            }

            $errorBody = $response->json();
            $errorMessage = $errorBody['error']['message'] ?? $response->body();

            return [
                'success' => false,
                'error' => "Gemini API failed with status {$response->status()}: {$errorMessage}",
                'status' => $response->status(),
            ];
        } catch (\Throwable $e) {
            if (! $forceDirect && $this->isAiGatewayConfigured()) {
                return $this->runGemini($model, $payload, $timeout, true);
            }

            $nextModel = match ($model) {
                AiModel::GEMINI_3_8_FLASH->value => AiModel::GEMINI_3_7_FLASH,
                AiModel::GEMINI_3_7_FLASH->value => AiModel::GEMINI_3_5_FLASH,
                AiModel::GEMINI_3_5_FLASH->value => AiModel::GEMINI_2_5_FLASH,
                default => null,
            };

            if ($nextModel !== null) {
                return $this->runGemini($nextModel, $payload, $timeout, $forceDirect);
            }

            return [
                'success' => false,
                'error' => "Gemini Exception: {$e->getMessage()}",
            ];
        }
    }

    /**
     * Execute a generation run against Google Gemini API and stream the response.
     *
     * @param  array<string, mixed>  $payload
     * @return \Generator<string>
     */
    public function runGeminiStream(AiModel|string $model, array $payload, int $timeout = 300, bool $isFallback = false, bool $forceDirect = false): \Generator
    {
        $model = $model instanceof AiModel ? $model->value : $model;
        $geminiKey = (string) config('services.gemini.key');
        if ($geminiKey === '') {
            yield 'Error: GEMINI_API_KEY is missing.';

            return;
        }
        $url = $this->resolveGeminiUrl($model, true, $forceDirect);

        $headers = [
            'x-goog-api-key' => $geminiKey,
            'Content-Type' => 'application/json',
        ];

        if (! $forceDirect && $this->isAiGatewayConfigured()) {
            $headers['cf-aig-cache'] = 'true';
            $cfToken = (string) config('services.cloudflare.api_token');
            if ($cfToken !== '') {
                $headers['cf-aig-authorization'] = "Bearer {$cfToken}";
            }
        }

        try {
            $response = Http::withHeaders($headers)
                ->withOptions(['stream' => true])
                ->timeout($timeout)
                ->post($url, $payload);

            if (! $response->successful()) {
                // If gateway failed, retry directly to Google AI Studio first
                if (! $forceDirect && $this->isAiGatewayConfigured()) {
                    Log::warning("Gemini Gateway Stream failed [{$response->status()}]. Retrying directly to Google AI Studio.");
                    yield from $this->runGeminiStream($model, $payload, $timeout, $isFallback, true);

                    return;
                }

                $nextModel = match ($model) {
                    AiModel::GEMINI_3_8_FLASH->value => AiModel::GEMINI_3_7_FLASH,
                    AiModel::GEMINI_3_7_FLASH->value => AiModel::GEMINI_3_5_FLASH,
                    AiModel::GEMINI_3_5_FLASH->value => AiModel::GEMINI_2_5_FLASH,
                    default => null,
                };

                if ($nextModel !== null) {
                    yield from $this->runGeminiStream($nextModel, $payload, $timeout, $isFallback, $forceDirect);

                    return;
                }

                Log::warning("Gemini API Overloaded [{$response->status()}]. Falling back to Workers AI.");

                $prompt = $payload['contents'][0]['parts'][0]['text'] ?? '';
                $systemPrompt = $payload['system_instruction']['parts'][0]['text'] ?? '';

                $messages = [];
                if ($systemPrompt !== '') {
                    $messages[] = ['role' => 'system', 'content' => $systemPrompt];
                }
                $messages[] = ['role' => 'user', 'content' => $prompt];

                $workersPayload = [
                    'messages' => $messages,
                    'stream' => true,
                    'max_tokens' => 4096,
                ];

                yield from $this->runWorkersAiStream(AiModel::WORKERS_AI_LLAMA_3_1_8B, $workersPayload, $timeout);

                return;
            }

            $body = $response->toPsrResponse()->getBody();
            $buffer = '';

            while (! $body->eof()) {
                $buffer .= $body->read(1024);
                $buffer = str_replace("\r\n", "\n", $buffer);

                while (($pos = strpos($buffer, "\n\n")) !== false) {
                    $event = substr($buffer, 0, $pos);
                    $buffer = substr($buffer, $pos + 2);

                    if (str_starts_with($event, 'data: ')) {
                        $dataStr = substr($event, 6);
                        $data = json_decode($dataStr, true);
                        if (is_array($data)) {
                            $parts = $data['candidates'][0]['content']['parts'] ?? [];
                            foreach ($parts as $part) {
                                if (isset($part['text'])) {
                                    yield (string) $part['text'];
                                }
                            }
                        }
                    }
                }
            }

            // Process any remaining buffer that doesn't have a trailing newline
            if ($buffer !== '') {
                $event = $buffer;
                if (str_starts_with($event, 'data: ')) {
                    $dataStr = substr($event, 6);
                    $data = json_decode($dataStr, true);
                    if (is_array($data)) {
                        $parts = $data['candidates'][0]['content']['parts'] ?? [];
                        foreach ($parts as $part) {
                            if (isset($part['text'])) {
                                yield (string) $part['text'];
                            }
                        }
                    }
                }
            }
        } catch (\Throwable $e) {
            if (! $forceDirect && $this->isAiGatewayConfigured()) {
                yield from $this->runGeminiStream($model, $payload, $timeout, $isFallback, true);

                return;
            }

            $nextModel = match ($model) {
                AiModel::GEMINI_3_8_FLASH->value => AiModel::GEMINI_3_7_FLASH,
                AiModel::GEMINI_3_7_FLASH->value => AiModel::GEMINI_3_5_FLASH,
                AiModel::GEMINI_3_5_FLASH->value => AiModel::GEMINI_2_5_FLASH,
                default => null,
            };

            if ($nextModel !== null) {
                yield from $this->runGeminiStream($nextModel, $payload, $timeout, $isFallback, $forceDirect);

                return;
            }

            Log::warning('Gemini API Streaming Exception: '.$e->getMessage().'. Falling back to Workers AI.');

            if (! $isFallback) {
                $prompt = $payload['contents'][0]['parts'][0]['text'] ?? '';
                $systemPrompt = $payload['system_instruction']['parts'][0]['text'] ?? '';

                $messages = [];
                if ($systemPrompt !== '') {
                    $messages[] = ['role' => 'system', 'content' => $systemPrompt];
                }
                $messages[] = ['role' => 'user', 'content' => $prompt];

                $workersPayload = [
                    'messages' => $messages,
                    'stream' => true,
                    'max_tokens' => 4096,
                ];

                yield from $this->runWorkersAiStream(AiModel::WORKERS_AI_LLAMA_3_1_8B, $workersPayload, $timeout, true);

                return;
            }

            yield "**Connection Interrupted:** I'm sorry, but my connection to the AI server was lost.\n\nPlease try asking your question again in a few moments.";
        }
    }

    /**
     * Execute structured JSON generation using the appropriate provider driver.
     *
     * @param  array<string, mixed>|null  $responseSchema  Optional schema for Gemini native responseSchema
     * @return array{success: bool, data?: array<string, mixed>|list<mixed>, text?: string, error?: string}
     */
    public function generateStructuredJson(
        AiModel|string $model,
        string $systemPrompt,
        string $userPrompt,
        ?array $responseSchema = null,
        int $timeout = 240
    ): array {
        $model = $model instanceof AiModel ? $model->value : $model;
        $cleanJson = static function (string $text): ?array {
            $cleaned = trim($text);
            if (str_starts_with($cleaned, '```')) {
                $cleaned = (string) preg_replace('/^```(?:json)?\n?|```$/', '', $cleaned);
            }
            $cleaned = trim($cleaned);

            $decoded = json_decode($cleaned, true);

            return is_array($decoded) ? $decoded : null;
        };

        if ($this->isWorkersAiModel($model)) {
            $systemDirective = $systemPrompt."\n\nCRITICAL: You MUST reply ONLY with a valid JSON object or array. Do NOT wrap output in markdown code blocks, backticks, or any additional text.";

            $payload = [
                'messages' => [
                    ['role' => 'system', 'content' => $systemDirective],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'max_tokens' => 4096,
                'temperature' => 0.7,
            ];

            $result = $this->runWorkersAi($model, $payload, $timeout);
            if (! $result['success']) {
                return $result;
            }

            $decoded = $cleanJson($result['text'] ?? '');
            if ($decoded === null) {
                return [
                    'success' => false,
                    'error' => 'Workers AI returned invalid JSON structure.',
                    'text' => $result['text'] ?? '',
                ];
            }

            return ['success' => true, 'data' => $decoded, 'text' => $result['text'] ?? ''];
        }

        // Gemini payload
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
                'responseMimeType' => 'application/json',
            ],
        ];

        if ($responseSchema !== null) {
            $payload['generationConfig']['responseSchema'] = $responseSchema;
        }

        if (str_contains($model, 'thinking')) {
            $payload['generationConfig']['thinkingConfig'] = ['thinkingLevel' => 'high'];
        }

        $result = $this->runGemini($model, $payload, $timeout);
        if (! $result['success']) {
            return $result;
        }

        $decoded = $cleanJson($result['text'] ?? '');
        if ($decoded === null) {
            return [
                'success' => false,
                'error' => 'Gemini returned invalid JSON structure.',
                'text' => $result['text'] ?? '',
            ];
        }

        return ['success' => true, 'data' => $decoded, 'text' => $result['text'] ?? ''];
    }

    /**
     * Generate vector embedding for a given text snippet.
     *
     * @return array<float>
     */
    public function createEmbedding(string $text, int $timeout = 60): array
    {
        $geminiKey = (string) config('services.gemini.key');
        if ($geminiKey !== '') {
            try {
                $response = Http::withHeaders([
                    'x-goog-api-key' => $geminiKey,
                    'Content-Type' => 'application/json',
                ])->timeout($timeout)->post('https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent', [
                    'model' => 'models/text-embedding-004',
                    'content' => [
                        'parts' => [
                            ['text' => $text],
                        ],
                    ],
                ]);

                if ($response->successful()) {
                    $values = $response->json('embedding.values');
                    if (is_array($values)) {
                        return array_map('floatval', $values);
                    }
                }
            } catch (\Throwable) {
                // Fallback to Cloudflare if Gemini fails
            }
        }

        $token = (string) config('services.cloudflare.api_token');
        if ($token !== '' && config('services.cloudflare.account_id')) {
            try {
                $url = $this->resolveWorkersAiUrl('@cf/baai/bge-base-en-v1.5');
                $response = Http::withToken($token)
                    ->timeout($timeout)
                    ->post($url, ['text' => [$text]]);

                if ($response->successful()) {
                    $values = $response->json('result.data.0');
                    if (is_array($values)) {
                        return array_map('floatval', $values);
                    }
                }
            } catch (\Throwable) {
                // Fall through
            }
        }

        return [];
    }
}
