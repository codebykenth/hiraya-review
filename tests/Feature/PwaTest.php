<?php

use Illuminate\Support\Facades\File;

test('pwa assets exist in public folder', function () {
    $manifestPath = public_path('manifest.json');
    $swPath = public_path('sw.js');

    expect(File::exists($manifestPath))->toBeTrue();
    expect(File::exists($swPath))->toBeTrue();

    $manifestContent = File::get($manifestPath);
    $manifestJson = json_decode($manifestContent, true);

    expect($manifestJson)->toBeArray();
    expect($manifestJson['short_name'])->toBe('Hiraya Review');
    expect($manifestJson['display'])->toBe('standalone');
    expect($manifestJson)->toHaveKey('id');
});

test('service worker excludes authenticated routes from caching', function () {
    $swContent = File::get(public_path('sw.js'));

    expect($swContent)->toContain('/dashboard');
    expect($swContent)->toContain('/settings');
    expect($swContent)->toContain('/admin');
    expect($swContent)->toContain('/sanctum');
    expect($swContent)->toContain("credentials: 'same-origin'");
});

test('pwa meta tags are present in the app layout html', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
    $response->assertSee('link rel="manifest" href="/manifest.json"', false);
    $response->assertSee('meta name="theme-color" content="#0f172a"', false);
    $response->assertSee('meta name="apple-mobile-web-app-capable" content="yes"', false);
});
