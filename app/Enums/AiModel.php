<?php

namespace App\Enums;

enum AiModel: string
{
    // Cloudflare Workers AI models (Covered by Cloudflare's 10,000 free daily Neurons)
    case WORKERS_AI_LLAMA_3_2_1B = '@cf/meta/llama-3.2-1b-instruct';
    case WORKERS_AI_LLAMA_3_2_3B = '@cf/meta/llama-3.2-3b-instruct';
    case WORKERS_AI_LLAMA_3_1_8B = '@cf/meta/llama-3.1-8b-instruct';
    case WORKERS_AI_LLAMA_3_1_8B_FP8 = '@cf/meta/llama-3.1-8b-instruct-fp8';
    case WORKERS_AI_LLAMA_3_3_70B = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
    case WORKERS_AI_LLAMA_4_SCOUT_17B = '@cf/meta/llama-4-scout-17b-16e-instruct';

    // Google Gemini models (free tier)
    case GEMINI_3_8_FLASH = 'gemini-3.8-flash';
    case GEMINI_3_7_FLASH = 'gemini-3.7-flash';
    case GEMINI_3_5_FLASH = 'gemini-3.5-flash';
    case GEMINI_3_5_FLASH_LITE = 'gemini-3.5-flash-lite';
    case GEMINI_2_5_FLASH = 'gemini-2.5-flash';

    public function isWorkersAi(): bool
    {
        return str_starts_with($this->value, '@cf/');
    }
}
