<?php

declare(strict_types=1);

return [
    'secret_key' => env('XENDIT_SECRET_KEY', ''),
    'public_key' => env('XENDIT_PUBLIC_KEY', ''),
    'webhook_token' => env('XENDIT_WEBHOOK_VERIFICATION_TOKEN', ''),
    'base_url' => env('XENDIT_BASE_URL', 'https://api.xendit.co'),
    'currency' => env('XENDIT_CURRENCY', 'PHP'),
    'is_sandbox' => env('XENDIT_IS_SANDBOX', true),
    'invoice_duration_seconds' => (int) env('XENDIT_INVOICE_DURATION', 86400), // 24 hours
];
