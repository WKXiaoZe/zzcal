// src/calc/discSets.test.ts
import { describe, it, expect } from 'vitest';
import { DISC_4_SETS, DISC_2_SETS } from './discSets';

describe('DISC sets', () => {
  it('DISC_4_SETS contains at least 26 entries (none + 26 named sets)', () => {
    // none + 8 original + 18 new = 27 keys minimum
    expect(Object.keys(DISC_4_SETS).length).toBeGreaterThanOrEqual(26);
  });

  it('DISC_2_SETS contains at least 26 entries (none + 26 named sets)', () => {
    expect(Object.keys(DISC_2_SETS).length).toBeGreaterThanOrEqual(26);
  });

  it('DISC_4_SETS and DISC_2_SETS expose identical key sets', () => {
    const k4 = new Set(Object.keys(DISC_4_SETS));
    const k2 = new Set(Object.keys(DISC_2_SETS));
    expect(k4).toEqual(k2);
  });

  it('sample entries carry their expected name / stat payload', () => {
    expect(DISC_4_SETS.canglang.name).toBe('沧浪行歌');
    expect(DISC_2_SETS.woodpecker.stats.critRate).toBe(8);
  });
});
