// src/calc/buildInput.test.ts
import { describe, it, expect } from 'vitest';
import { buildCalcInput } from './buildInput';
import { calculateDamage } from './formulas';
import { initialState } from '../state/reducer';
import type { AppState } from '../state/types';

describe('buildCalcInput', () => {
  it('default state produces a CalcInput that calculateDamage can consume', () => {
    const input = buildCalcInput(initialState);
    const out = calculateDamage(input);
    expect(Number.isFinite(out.dmg)).toBe(true);
    expect(out.dmg).toBeGreaterThanOrEqual(0);
  });

  it('selecting a known DPS preset surfaces the DB baseAtk + critDmg at cinema 6', () => {
    // 悠真Ⅵ baseAtk: [916, 0, 0, 0, 0], critDmg: [122, 0, 0, 40, 0]
    // Cinema 6 → baseAtk = 916, critDmg = 122 + 40 = 162
    const state: AppState = {
      ...initialState,
      agents: {
        ...initialState.agents,
        main: { presetName: '悠真Ⅵ', cinemaOrStar: 6, customOverrides: {} },
      },
    };
    const input = buildCalcInput(state);
    expect(input.agent.baseAtk).toBe(916);
    expect(input.agent.critDmg).toBe(162);
  });

  it('customOverrides win over preset values', () => {
    const state: AppState = {
      ...initialState,
      agents: {
        ...initialState.agents,
        main: {
          presetName: '悠真Ⅵ',
          cinemaOrStar: 6,
          customOverrides: { baseAtk: 1234, critRate: 99 },
        },
      },
    };
    const input = buildCalcInput(state);
    expect(input.agent.baseAtk).toBe(1234);
    expect(input.agent.critRate).toBe(99);
    // unrelated preset field still flows through
    expect(input.agent.critDmg).toBe(162);
  });

  // v3: hex picker / DiscPanel write set4Key + set2Keys, and buildCalcInput
  // must apply set4's pure-4-piece + set4's own 2-piece + every set2Keys entry's
  // 2-piece. These tests pin the three canonical configurations.
  describe('disc set application — 4+2, 2+2+2, 6-same', () => {
    function discState(set4Key: string, set2Keys: string[]): AppState {
      return {
        ...initialState,
        disc: { ...initialState.disc, set4Key, set2Keys },
      };
    }

    it('4+2 of (woodpecker, jisu): 4p woodpecker + 2p woodpecker + 2p jisu', () => {
      // woodpecker 4p stats: { inCombatAtkPct: 27 } (folded onto main agent)
      // woodpecker 2p stats: { critRate: 8 } (folded into extraStats.critRate)
      // jisu 2p stats:       { atkPct: 10 } (folded into extraStats.set2_AtkPct)
      const input = buildCalcInput(discState('woodpecker', ['jisu']));
      expect(input.agent.inCombatAtkPct).toBe(27);
      expect(input.extraStats?.critRate).toBe(8);
      expect(input.extraStats?.set2_AtkPct).toBe(10);
    });

    it('2+2+2 of (woodpecker, jisu, mountain): three 2-pieces, no 4-piece', () => {
      // No set4 → main agent gets no inCombatAtkPct from sets.
      // woodpecker 2p: critRate +8; jisu 2p: atkPct +10; mountain 2p: {} (daze, unmodelled).
      const input = buildCalcInput(discState('none', ['woodpecker', 'jisu', 'mountain']));
      expect(input.agent.inCombatAtkPct ?? 0).toBe(0);
      expect(input.extraStats?.critRate).toBe(8);
      expect(input.extraStats?.set2_AtkPct).toBe(10);
    });

    it('6-same of woodpecker: 4p + 2p (NOT 4p + 2× 2p)', () => {
      // Hex picker emits set2Keys=[] for the 6-same case. buildCalcInput
      // auto-adds woodpecker's own 2-piece exactly once.
      const input = buildCalcInput(discState('woodpecker', []));
      expect(input.agent.inCombatAtkPct).toBe(27);
      expect(input.extraStats?.critRate).toBe(8); // exactly one copy
    });

    it('dedupes accidental set2Keys entry equal to set4Key', () => {
      // If a caller mistakenly passes set2Keys=['woodpecker'] alongside
      // set4Key='woodpecker', the 2-piece must NOT double-apply.
      const input = buildCalcInput(discState('woodpecker', ['woodpecker']));
      expect(input.extraStats?.critRate).toBe(8);
    });
  });
});
