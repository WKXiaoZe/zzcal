// src/state/reducer.test.ts
import { describe, it, expect } from 'vitest';
import { reducer, initialState } from './reducer';

describe('reducer', () => {
  it('SET_BATTLE_TYPE switches mode', () => {
    const next = reducer(initialState, { type: 'SET_BATTLE_TYPE', payload: 'break' });
    expect(next.battleType).toBe('break');
  });
  it('SET_BATTLE_TYPE to anomaly forces slot4Stat=anomalyMastery (legacy L653-658)', () => {
    const next = reducer(initialState, { type: 'SET_BATTLE_TYPE', payload: 'anomaly' });
    expect(next.battleType).toBe('anomaly');
    expect(next.disc.slot4Stat).toBe('anomalyMastery');
  });
  it('SET_BATTLE_TYPE off anomaly restores slot4Stat=critRate when it was anomalyMastery', () => {
    const anomalyState = reducer(initialState, { type: 'SET_BATTLE_TYPE', payload: 'anomaly' });
    const back = reducer(anomalyState, { type: 'SET_BATTLE_TYPE', payload: 'attack' });
    expect(back.battleType).toBe('attack');
    expect(back.disc.slot4Stat).toBe('critRate');
  });
  it('SET_BATTLE_TYPE off anomaly preserves a non-anomalyMastery slot4Stat', () => {
    const customSlot4 = { ...initialState, disc: { ...initialState.disc, slot4Stat: 'critDmg' as const } };
    const next = reducer(customSlot4, { type: 'SET_BATTLE_TYPE', payload: 'break' });
    expect(next.disc.slot4Stat).toBe('critDmg');
  });
  it('SET_AGENT_PRESET resets custom overrides', () => {
    const withOverride = reducer(initialState, { type: 'SET_AGENT_FIELD', slot: 'main', field: 'critRate', value: 99 });
    expect(withOverride.agents.main.customOverrides.critRate).toBe(99);
    const reset = reducer(withOverride, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '伊埃斯' });
    expect(reset.agents.main.customOverrides).toEqual({});
  });
  it('SET_AGENT_PRESET on main slot automatically unifies battleType across 强攻 / 命破 / 异常 / 锋御', () => {
    const sBreak = reducer(initialState, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '仪玄' });
    expect(sBreak.battleType).toBe('break');

    const sAnomaly = reducer(sBreak, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '简' });
    expect(sAnomaly.battleType).toBe('anomaly');
    expect(sAnomaly.disc.slot4Stat).toBe('anomalyMastery');

    const sVanguard = reducer(sAnomaly, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '挽昼' });
    expect(sVanguard.battleType).toBe('vanguard');
    expect(sVanguard.disc.slot4Stat).toBe('critRate');

    const sAttack = reducer(sVanguard, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '叶瞬光' });
    expect(sAttack.battleType).toBe('attack');
  });
  it('SET_DISC_SUBCOUNT updates one key', () => {
    const next = reducer(initialState, { type: 'SET_DISC_SUBCOUNT', key: 'CR', value: 4 });
    expect(next.disc.subCounts.CR).toBe(4);
  });
});
