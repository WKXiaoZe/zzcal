// src/calc/buildInput.test.ts
import { describe, it, expect } from 'vitest';
import { buildCalcInput } from './buildInput';
import { calculateDamage } from './formulas';
import { reducer, initialState } from '../state/reducer';
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

  describe('disc set application — 4+2, 2+2+2, 6-same', () => {
    function discState(set4Key: string, set2Keys: string[]): AppState {
      return {
        ...initialState,
        disc: { ...initialState.disc, set4Key, set2Keys },
      };
    }

    it('4+2 of (woodpecker, jisu): 4p woodpecker + 2p woodpecker + 2p jisu', () => {
      const input = buildCalcInput(discState('woodpecker', ['jisu']));
      expect(input.agent.inCombatAtkPct).toBe(27);
      expect(input.extraStats?.critRate).toBe(8);
      expect(input.extraStats?.set2_AtkPct).toBe(10);
    });

    it('2+2+2 of (woodpecker, jisu, mountain): three 2-pieces, no 4-piece', () => {
      const input = buildCalcInput(discState('none', ['woodpecker', 'jisu', 'mountain']));
      expect(input.agent.inCombatAtkPct ?? 0).toBe(0);
      expect(input.extraStats?.critRate).toBe(8);
      expect(input.extraStats?.set2_AtkPct).toBe(10);
    });

    it('6-same of woodpecker: 4p + 2p (NOT 4p + 2× 2p)', () => {
      const input = buildCalcInput(discState('woodpecker', []));
      expect(input.agent.inCombatAtkPct).toBe(27);
      expect(input.extraStats?.critRate).toBe(8);
    });

    it('dedupes accidental set2Keys entry equal to set4Key', () => {
      const input = buildCalcInput(discState('woodpecker', ['woodpecker']));
      expect(input.extraStats?.critRate).toBe(8);
    });
  });

  describe('Pass A 锋御 (Vanguard) Defense & Sharp Crit calculation', () => {
    it('computes 挽昼 + 蜃炎梦火 + 星之碑4件套 with Defense scaling, 0.35x CD->CR conversion, and >100% CR dual Sharp Crit', () => {
      let s = reducer(initialState, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '挽昼' });
      s = reducer(s, { type: 'SET_AGENT_PRESET', slot: 'sup1', preset: '洛克茜' }); // triggers 挽昼 额外能力 (+25% sharpCritDmg)
      s = reducer(s, { type: 'SET_WEAPON_PRESET', slot: 'main', preset: '蜃炎梦火' });
      s = reducer(s, { type: 'SET_DISC_SETS', set4Key: 'xingzhibei', set2Keys: ['jingji'] });
      s = reducer(s, { type: 'TOGGLE_AGENT_BUFF', slot: 'main', buffId: 'agent_1601_core', enabled: true });

      const input = buildCalcInput(s);
      expect(input.battleType).toBe('vanguard');
      // 挽昼 baseDef 441 + 蜃炎梦火 baseDef 446 = 887
      expect(input.agent.baseDef).toBe(441);
      expect(input.weapon.baseDef).toBe(446);
      expect(input.weapon.defPct).toBe(48);
      // 挽昼 base 50% sharpCritDmg + 额外能力 25% sharpCritDmg = 75%
      expect(input.agent.sharpCritDmg).toBe(75);

      const out = calculateDamage(input);
      expect(out.details.agentBaseDef).toBe(887);
      // Out-of-combat Def%: 48 (weapon) + 30 (disc6) + 16 (xingzhibei 2pc) + 16 (jingji 2pc) = 110%
      // sheetDef = 887 * 2.1 + 184 = 2046.7
      expect(out.details.outCombatDefPct).toBeCloseTo(110, 2);
      expect(out.details.sheetDef).toBeCloseTo(2046.7, 1);
      // 0.35 * 50% sheetCD = +17.5% converted CR
      expect(out.details.convertedCR).toBeCloseTo(17.5, 2);
      // Total CR exceeds 100% (33.8 base + 40 core + 20 weapon + 12 set4 + 24 slot4 + 17.5 converted = 147.3%)
      expect(out.details.totalCR).toBeCloseTo(147.3, 1);
      expect(out.details.totalSharpCD).toBe(75);
      expect(out.dmg).toBeGreaterThan(8000);
    });
  });
});
