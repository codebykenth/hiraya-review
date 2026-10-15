<?php

test('fallback returns inertia error page for html requests', function () {
    $response = $this->get('/non-existent-page-url', [
        'Accept' => 'text/html,application/xhtml+xml',
    ]);

    $response->assertStatus(404);
});

test('fallback returns lightweight json for non-html scanner probes', function () {
    $response = $this->get('/dump.sql.gz', [
        'Accept' => '*/*',
    ]);

    $response->assertStatus(404);
    $response->assertJson(['message' => 'Not Found']);
});
