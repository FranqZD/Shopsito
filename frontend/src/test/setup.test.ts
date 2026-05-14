import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

describe('fast-check setup', () => {
  it('verifies fast-check is working', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        expect(n + 0).toBe(n);
      })
    );
  });
});
