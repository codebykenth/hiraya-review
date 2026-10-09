<?php

use App\Services\Ai\AiGatewayService;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

uses(TestCase::class);

test('AiGatewayService resolves Cloudflare REST endpoint', function () {
    config([
        'services.cloudflare.account_id' => 'test-account-id',
        'services.cloudflare.ai_gateway_id' => null,
    ]);

    $service = new AiGatewayService;
    $url = $service->resolveWorkersAiUrl('@cf/meta/llama-3.2-3b-instruct');

    expect($url)->toBe('https://api.cloudflare.com/client/v4/accounts/test-account-id/ai/run/@cf/meta/llama-3.2-3b-instruct');
    expect($service->isAiGatewayConfigured())->toBeFalse();
});

test('AiGatewayService attaches cf-aig-gateway-id header when gateway id is configured', function () {
    config([
        'services.cloudflare.account_id' => 'test-account-id',
        'services.cloudflare.api_token' => 'test-token',
        'services.cloudflare.ai_gateway_id' => 'hiraya-gateway',
    ]);

    Http::fake([
        'https://api.cloudflare.com/client/v4/accounts/test-account-id/ai/run/*' => Http::response([
            'result' => ['response' => 'ok'],
            'success' => true,
        ], 200),
    ]);

    $service = new AiGatewayService;
    $service->runWorkersAi('@cf/meta/llama-3.2-1b-instruct', ['messages' => []]);

    Http::assertSent(function (Request $request) {
        return $request->hasHeader('cf-aig-gateway-id', 'hiraya-gateway')
            && $request->hasHeader('Authorization', 'Bearer test-token');
    });

    expect($service->isAiGatewayConfigured())->toBeTrue();
});

test('AiGatewayService always resolves Gemini and Groq direct endpoints', function () {
    $service = new AiGatewayService;

    expect($service->resolveGeminiUrl('gemini-3.7-flash', false, true))
        ->toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent');

    expect($service->resolveGroqUrl())
        ->toBe('https://api.groq.com/openai/v1/chat/completions');
});

test('AiGatewayService detects Workers AI models accurately', function () {
    $service = new AiGatewayService;

    expect($service->isWorkersAiModel('@cf/meta/llama-3.2-3b-instruct'))->toBeTrue();
    expect($service->isWorkersAiModel('@cf/deepseek-ai/deepseek-r1-distill-qwen-32b'))->toBeTrue();
    expect($service->isWorkersAiModel('llama-3.2-1b-instruct'))->toBeTrue();
    expect($service->isWorkersAiModel('gemini-3.7-flash'))->toBeFalse();
    expect($service->isWorkersAiModel('gemini-1.5-pro'))->toBeFalse();
});

test('AiGatewayService executes Workers AI run successfully and cleans JSON output', function () {
    config([
        'services.cloudflare.account_id' => 'acc-123',
        'services.cloudflare.api_token' => 'test-token',
        'services.cloudflare.ai_gateway_id' => null,
    ]);

    Http::fake([
        'https://api.cloudflare.com/client/v4/accounts/acc-123/ai/run/*' => Http::response([
            'result' => [
                'response' => "```json\n{\"test_key\": \"test_val\"}\n```",
            ],
            'success' => true,
        ], 200),
    ]);

    $service = new AiGatewayService;
    $res = $service->generateStructuredJson(
        '@cf/meta/llama-3.2-3b-instruct',
        'system prompt',
        'user prompt'
    );

    expect($res['success'])->toBeTrue();
    expect($res['data'])->toBe(['test_key' => 'test_val']);
});
