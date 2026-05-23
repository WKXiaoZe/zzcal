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

  // v3 invariant: every DISC_4_SETS entry must be the *pure* 4-piece bonus.
  // The 5 legacy sets whose stats used to bake in the 2-piece have been
  // normalized; this test pins them so a future "helpful" edit can't
  // silently re-introduce the double-count.
  describe('v3 normalization — DISC_4_SETS holds pure 4-piece stats', () => {
    it('canglang: dmgBonus 10 (2-piece) removed', () => {
      expect(DISC_4_SETS.canglang.stats).toEqual({ critRate: 20, inCombatAtkPct: 10 });
    });
    it('ruying: dmgBonus 15 (2-piece) removed', () => {
      expect(DISC_4_SETS.ruying.stats).toEqual({ critRate: 12, inCombatAtkPct: 12 });
    });
    it('jisu: atkPct 10 (2-piece) removed', () => {
      expect(DISC_4_SETS.jisu.stats).toEqual({ inCombatAtkPct: 25 });
    });
    it('hetun: penRatio 8 (2-piece) removed', () => {
      expect(DISC_4_SETS.hetun.stats).toEqual({ inCombatAtkPct: 15 });
    });
    it('yunkui: hpPct 10 (2-piece) removed', () => {
      expect(DISC_4_SETS.yunkui.stats).toEqual({ critRate: 12, ppDmgBonus: 10 });
    });
  });
});
