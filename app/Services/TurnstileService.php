<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TurnstileService
{
    public const TEST_SITE_KEY = '1x00000000000000000000AA';

    public const TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

    protected string $siteKey;

    protected string $secretKey;

    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        $isDev = app()->environment('local', 'development', 'testing');

        if ($isDev && ! config('services.turnstile.force_live_in_dev', false)) {
            $this->siteKey = self::TEST_SITE_KEY;
            $this->secretKey = self::TEST_SECRET_KEY;
        } else {
            $this->siteKey = (string) config('services.turnstile.site_key', '');
            $this->secretKey = (string) config('services.turnstile.secret_key', '');
        }
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

        // Allow test tokens in local/testing environment if offline or mock token passed
        if (app()->environment('local', 'development', 'testing') && $this->secretKey === self::TEST_SECRET_KEY) {
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
