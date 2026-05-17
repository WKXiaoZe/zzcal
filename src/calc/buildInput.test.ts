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
    // 悠真 baseAtk: [916, 0, 0, 0, 0], critDmg: [122, 0, 0, 40, 0]
    // Cinema 6 → baseAtk = 916, critDmg = 122 + 40 = 162
    const state: AppState = {
      ...initialState,
      agents: {
        ...initialState.agents,
        main: { presetName: '悠真', cinemaOrStar: 6, customOverrides: {} },
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
          presetName: '悠真',
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
});
