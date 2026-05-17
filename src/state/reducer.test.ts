// src/state/reducer.test.ts
import { describe, it, expect } from 'vitest';
import { reducer, initialState } from './reducer';

describe('reducer', () => {
  it('SET_BATTLE_TYPE switches mode', () => {
    const next = reducer(initialState, { type: 'SET_BATTLE_TYPE', payload: 'break' });
    expect(next.battleType).toBe('break');
  });
  it('SET_AGENT_PRESET resets custom overrides', () => {
    const withOverride = reducer(initialState, { type: 'SET_AGENT_FIELD', slot: 'main', field: 'critRate', value: 99 });
    expect(withOverride.agents.main.customOverrides.critRate).toBe(99);
    const reset = reducer(withOverride, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '伊埃斯' });
    expect(reset.agents.main.customOverrides).toEqual({});
  });
  it('SET_DISC_SUBCOUNT updates one key', () => {
    const next = reducer(initialState, { type: 'SET_DISC_SUBCOUNT', key: 'CR', value: 4 });
    expect(next.disc.subCounts.CR).toBe(4);
  });
});
