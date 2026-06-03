<?php

use Illuminate\Support\Facades\Route;

beforeEach(function () {
    // Register test routes that serve different content types
    Route::get('/test-page', fn () => response('Hello World'))
        ->middleware('web')
        ->name('test.page');

    Route::get('/build/assets/app-abc123.js', fn () => response('console.log("hi")', 200, ['Content-Type' => 'application/javascript']))
        ->middleware('web')
        ->name('test.build-asset');

    Route::get('/images/test.png', fn () => response('fake-image', 200, ['Content-Type' => 'image/png']))
        ->middleware('web')
        ->name('test.image');

    Route::get('/favicon.ico', fn () => response('icon', 200, ['Content-Type' => 'image/x-icon']))
        ->middleware('web')
        ->name('test.favicon');
});

test('build assets get immutable cache headers', function () {
    $response = $this->get('/build/assets/app-abc123.js');

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('public');
    expect($cacheControl)->toContain('max-age=31536000');
    expect($cacheControl)->toContain('immutable');
    expect($response->headers->get('CDN-Cache-Control'))->toContain('max-age=31536000');
});

test('image assets get 30-day cache headers', function () {
    $response = $this->get('/images/test.png');

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('public');
    expect($cacheControl)->toContain('max-age=2592000');
    expect($response->headers->get('CDN-Cache-Control'))->toContain('max-age=2592000');
});

test('favicon gets 1-day cache headers', function () {
    $response = $this->get('/favicon.ico');

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('public');
    expect($cacheControl)->toContain('max-age=86400');
});

test('dynamic pages get no-cache private headers', function () {
    $response = $this->get('/test-page');

    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->toContain('no-cache');
    expect($cacheControl)->toContain('private');
});

test('POST requests do not get cache headers modified', function () {
    Route::post('/test-post', fn () => response('ok'))
        ->middleware('web')
        ->name('test.post');

    $response = $this->post('/test-post', [], ['X-CSRF-TOKEN' => csrf_token()]);

    // POST responses should not have been modified by our middleware
    $cacheControl = $response->headers->get('Cache-Control');
    expect($cacheControl)->not->toContain('immutable');
});
