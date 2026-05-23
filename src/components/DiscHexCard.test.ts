// src/components/DiscHexCard.test.ts
// Unit tests for the pure pick-derivation helper. The component itself isn't
// rendered here (jsdom + image assets get noisy); we only validate the rule
// `6 picks → (set4Key, set2Keys)` so future tweaks to the algorithm keep the
// three canonical game-rule cases honest.
import { describe, it, expect } from 'vitest';
import { deriveSetsFromPicks } from './DiscHexCard';

type SlotPicks = Parameters<typeof deriveSetsFromPicks>[0];

function picks(arr: (string | null)[]): SlotPicks {
  const out: Record<number, string | null> = {};
  for (let i = 0; i < 6; i++) out[i + 1] = arr[i] ?? null;
  return out as SlotPicks;
}

describe('deriveSetsFromPicks', () => {
  it('all empty → set4=none, set2Keys=[]', () => {
    expect(deriveSetsFromPicks(picks([]))).toEqual({ set4Key: 'none', set2Keys: [] });
  });

  it('4+2 → set4 wins, the 2-set goes to set2Keys', () => {
    const r = deriveSetsFromPicks(picks(['X','X','X','X','Y','Y']));
    expect(r.set4Key).toBe('X');
    expect(r.set2Keys).toEqual(['Y']);
  });

  it('2+2+2 → no set4, all three 2-sets in set2Keys (slot order)', () => {
    const r = deriveSetsFromPicks(picks(['X','X','Y','Y','Z','Z']));
    expect(r.set4Key).toBe('none');
    expect(r.set2Keys).toEqual(['X','Y','Z']);
  });

  it('6 same → set4=X, set2Keys=[] (the 4-set is excluded from set2Keys)', () => {
    const r = deriveSetsFromPicks(picks(['X','X','X','X','X','X']));
    expect(r).toEqual({ set4Key: 'X', set2Keys: [] });
  });

  it('5+1 → set4=X (count≥4 wins), set2Keys=[] (the loose 1 doesn\'t qualify)', () => {
    const r = deriveSetsFromPicks(picks(['X','X','X','X','X','Y']));
    expect(r).toEqual({ set4Key: 'X', set2Keys: [] });
  });

  it('4+1+1 → set4=X, set2Keys=[] (the two loose 1s don\'t qualify)', () => {
    const r = deriveSetsFromPicks(picks(['X','X','X','X','Y','Z']));
    expect(r).toEqual({ set4Key: 'X', set2Keys: [] });
  });

  it('3+3 → no 4-set, both 3-counts become 2-pieces', () => {
    const r = deriveSetsFromPicks(picks(['X','X','X','Y','Y','Y']));
    expect(r.set4Key).toBe('none');
    expect(r.set2Keys).toEqual(['X','Y']);
  });

  it('2+1+1+1+1 → only the pair counts', () => {
    const r = deriveSetsFromPicks(picks(['X','X','Y','Z','W','V']));
    expect(r).toEqual({ set4Key: 'none', set2Keys: ['X'] });
  });

  it('partial 3-pick → no bonuses if no pair', () => {
    const r = deriveSetsFromPicks(picks(['X','Y','Z']));
    expect(r).toEqual({ set4Key: 'none', set2Keys: [] });
  });
});
