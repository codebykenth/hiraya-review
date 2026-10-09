<?php

namespace App\Enums;

enum AiModel: string
{
    // Cloudflare Workers AI models
    case WORKERS_AI_LLAMA_3_2_3B = '@cf/meta/llama-3.2-3b-instruct';
    case WORKERS_AI_LLAMA_3_2_1B = '@cf/meta/llama-3.2-1b-instruct';
    case WORKERS_AI_LLAMA_3_1_8B = '@cf/meta/llama-3.1-8b-instruct';
    case WORKERS_AI_LLAMA_3_3_70B = '@cf/meta/llama-3.3-70b-instruct-awq';

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
