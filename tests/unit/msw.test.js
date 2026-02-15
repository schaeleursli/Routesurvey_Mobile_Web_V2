// Skipped MSW test due to external API dependency
import { describe, it, expect, vi } from 'vitest';

describe.skip('MSW', () => {
    it('intercepts requests (skipped)', async () => {
        // This test is intentionally skipped.
        expect(true).toBe(true);
    });
});
