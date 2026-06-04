<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Translation\PotentiallyTranslatedString;

class NoProfanity implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value)) {
            return;
        }

        // 1. Try checking using Groq API (NLP) - Rate limited to 10 requests per minute per IP
        $groqKey = config('services.groq.key') ?: env('GROQ_API_KEY');
        if ($groqKey) {
            $ip = request()->ip() ?: 'unknown';
            $limiterKey = 'nlp-profanity-check:'.$ip;

            if (RateLimiter::tooManyAttempts($limiterKey, 10)) {
                Log::info("NoProfanity: NLP rate limit exceeded for IP {$ip}. Falling back to dictionary check.");
            } else {
                RateLimiter::hit($limiterKey, 60);
                Log::info("NoProfanity: Checking input '{$value}' with Groq NLP for IP {$ip}");

                try {
                    $model = 'llama-3.3-70b-versatile';
                    $response = Http::withToken($groqKey)
                        ->timeout(3)
                        ->post('https://api.groq.com/openai/v1/chat/completions', [
                            'model' => $model,
                            'messages' => [
                                [
                                    'role' => 'system',
                                    'content' => 'You are a strict content moderator for a Philippine civil service exam platform. Analyze the input text for any profanity, vulgarity, offensive language, hate speech, inappropriate slurs, sexual/anatomical slang, and crude colloquial terms in English or Tagalog/Filipino (such as "tite", "puke", "pekpek", "kantot", "jakol", "suso", etc.). Respond strictly in JSON format matching this schema: {"inappropriate": boolean}',
                                ],
                                [
                                    'role' => 'user',
                                    'content' => $value,
                                ],
                            ],
                            'temperature' => 0.0,
                            'response_format' => ['type' => 'json_object'],
                        ]);

                    if ($response->successful()) {
                        $json = $response->json();
                        $text = $json['choices'][0]['message']['content'] ?? '';
                        $parsed = json_decode($text, true);

                        if (isset($parsed['inappropriate']) && $parsed['inappropriate'] === true) {
                            Log::info("NoProfanity: Input '{$value}' was FLAGGED as inappropriate by Groq NLP.");
                            $fail('The :attribute field contains inappropriate language.');

                            return;
                        }

                        Log::info("NoProfanity: Input '{$value}' was CLEANED by Groq NLP.");

                        // Moderation checked clean via NLP
                        return;
                    } else {
                        Log::warning('NoProfanity: Groq NLP request failed with status '.$response->status().'. Body: '.$response->body());
                    }
                } catch (\Exception $e) {
                    Log::warning('NoProfanity rule Groq NLP check failed, falling back to dictionary: '.$e->getMessage());
                }
            }
        } else {
            Log::info('NoProfanity: GROQ_API_KEY not configured. Using local dictionary check.');
        }

        // 2. Fallback to local dictionary/regex validation (when rate limited or API fails)
        $badWords = [
            'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'cunt', 'dick', 'pussy', 'whore',
            'puta', 'gago', 'tanga', 'bobo', 'pakshet', 'tangina', 'putangina', 'hudas', 'ulol', 'siraulo',
            'tite', 'puke', 'kantot', 'jakol', 'pekpek', 'suso',
        ];

        $lowerValue = strtolower($value);

        foreach ($badWords as $word) {
            if (preg_match('/\b'.preg_quote($word, '/').'\b/i', $lowerValue)) {
                Log::info("NoProfanity: Input '{$value}' was FLAGGED by fallback dictionary word: '{$word}'.");
                $fail('The :attribute field contains inappropriate language.');

                return;
            }
        }

        Log::info("NoProfanity: Input '{$value}' was CLEANED by fallback dictionary.");
    }
}
