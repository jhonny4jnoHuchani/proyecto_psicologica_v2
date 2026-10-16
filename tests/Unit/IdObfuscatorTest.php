<?php

use App\Services\IdObfuscator;

test('id obfuscator encodes and decodes IDs correctly', function () {
    $ids = [1, 2, 3, 5, 10, 42, 99, 500, 1234, 99999];

    foreach ($ids as $id) {
        $encoded = IdObfuscator::encode($id);

        expect($encoded)->toBeString()
            ->and(strlen($encoded))->toBeGreaterThanOrEqual(6)
            ->and($encoded)->not->toBe((string) $id);

        $decoded = IdObfuscator::decode($encoded);
        expect($decoded)->toBe($id);
    }
});

test('id obfuscator accepts numeric fallback', function () {
    expect(IdObfuscator::decode('1'))->toBe(1)
        ->and(IdObfuscator::decode('42'))->toBe(42);
});
