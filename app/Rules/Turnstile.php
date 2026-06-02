<?php

namespace App\Rules;

use App\Services\TurnstileService;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class Turnstile implements ValidationRule
{
    protected TurnstileService $turnstileService;

    public function __construct()
    {
        $this->turnstileService = app(TurnstileService::class);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Skip validation if Turnstile is not configured
        if (! $this->turnstileService->isConfigured()) {
            return;
        }

        if (! $this->turnstileService->verify($value)) {
            $fail('The CAPTCHA verification failed. Please try again.');
        }
    }
}
