<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TurnstileService
{
    protected string $siteKey;

    protected string $secretKey;

    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        $this->siteKey = config('services.turnstile.site_key');
        $this->secretKey = config('services.turnstile.secret_key');
    }

    /**
     * Validate Turnstile token
     */
    public function verify(string $token): bool
    {
        $response = Http::asForm()->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => $this->secretKey,
            'response' => $token,
            'remoteip' => request()->ip(),
        ]);

        $result = $response->json();

        if ($result['success'] ?? false) {
            return true;
        }

        // Log failed verification attempts for monitoring
        Log::warning('Turnstile verification failed', [
            'error_codes' => $result['error-codes'] ?? [],
            'ip' => request()->ip(),
        ]);

        return false;
    }

    /**
     * Get site key for frontend
     */
    public function getSiteKey(): string
    {
        return $this->siteKey;
    }

    /**
     * Check if Turnstile is configured
     */
    public function isConfigured(): bool
    {
        return ! empty($this->siteKey) && ! empty($this->secretKey);
    }
}
