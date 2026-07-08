<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Features;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Http::fake([
            'https://challenges.cloudflare.com/turnstile/v0/siteverify' => function (Request $request) {
                $token = $request['response'];
                if ($token === 'valid-token') {
                    return Http::response(['success' => true]);
                }

                return Http::response(['success' => false, 'error-codes' => ['invalid-input-response']]);
            },
        ]);
    }

    protected function skipUnlessFortifyHas(string $feature, ?string $message = null): void
    {
        if (! Features::enabled($feature)) {
            $this->markTestSkipped($message ?? "Fortify feature [{$feature}] is not enabled.");
        }
    }
}
