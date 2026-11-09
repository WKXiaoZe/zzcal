// src/calc/additionalAbility.test.ts
import { describe, it, expect } from 'vitest';
import { evaluateAdditionalAbility } from './additionalAbility';
import { AGENT_BUFFS } from './buffs';
import { reducer, initialState } from '../state/reducer';

describe('Additional Ability (额外能力) Auto-Trigger', () => {
  it('every agent with an Additional Ability has a valid condition line', () => {
    for (const [agentName, buffs] of Object.entries(AGENT_BUFFS)) {
      const addBuffs = buffs.filter((b) => b.subType === '额外能力');
      expect(addBuffs.length).toBeLessThanOrEqual(1);
      for (const b of addBuffs) {
        const res = evaluateAdditionalAbility('main', { main: agentName, sup1: '', sup2: '' }, b.desc);
        expect(res.conditionLine.length).toBeGreaterThan(0);
        expect(res.triggered).toBe(false);
      }
    }
  });

  it('triggers 猫又 Additional Ability with same faction (妮可) or same element (简)', () => {
    const solo = evaluateAdditionalAbility('main', { main: '猫又', sup1: '', sup2: '' });
    expect(solo.triggered).toBe(false);

    const withNicole = evaluateAdditionalAbility('main', { main: '猫又', sup1: '妮可', sup2: '' });
    expect(withNicole.triggered).toBe(true);
    expect(withNicole.matchedReasons[0]).toContain('妮可');
    expect(withNicole.matchedReasons[0]).toContain('同阵营·狡兔屋');

    const withJane = evaluateAdditionalAbility('main', { main: '猫又', sup1: '简', sup2: '' });
    expect(withJane.triggered).toBe(true);
    expect(withJane.matchedReasons[0]).toContain('同属性·物理');
  });

  it('triggers profession-based Additional Abilities (e.g. 伊芙琳 with 击破 or 支援)', () => {
    const fail = evaluateAdditionalAbility('main', { main: '伊芙琳', sup1: '简', sup2: '' });
    expect(fail.triggered).toBe(false);

    const withStun = evaluateAdditionalAbility('main', { main: '伊芙琳', sup1: '莱特', sup2: '' });
    expect(withStun.triggered).toBe(true);
    expect(withStun.matchedReasons[0]).toContain('击破角色');

    const withSupport = evaluateAdditionalAbility('main', { main: '伊芙琳', sup1: '耀嘉音', sup2: '' });
    expect(withSupport.triggered).toBe(true);
    expect(withSupport.matchedReasons[0]).toContain('支援角色');
  });

  it('reducer automatically toggles Additional Ability buffs across the squad when SET_AGENT_PRESET is dispatched', () => {
    // 1. Select 猫又 as main -> solo, agent_1021_add should NOT be enabled
    let st = reducer(initialState, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '猫又' });
    expect(st.buffs.agentBuffs.main['agent_1021_add']).toBeFalsy();

    // 2. Select 妮可 as sup1 -> both 猫又 (agent_1021_add) and 妮可 (agent_1031_add) share faction 狡兔屋!
    st = reducer(st, { type: 'SET_AGENT_PRESET', slot: 'sup1', preset: '妮可' });
    expect(st.buffs.agentBuffs.main['agent_1021_add']).toBe(true);
    expect(st.buffs.agentBuffs.sup1['agent_1031_add']).toBe(true);

    // 3. Change sup1 from 妮可 to 苍角 (Ice / 对空六课) -> neither triggers
    st = reducer(st, { type: 'SET_AGENT_PRESET', slot: 'sup1', preset: '苍角' });
    expect(st.buffs.agentBuffs.main['agent_1021_add']).toBeFalsy();
    expect(st.buffs.agentBuffs.sup1['agent_1131_add']).toBeFalsy();
  });
});
