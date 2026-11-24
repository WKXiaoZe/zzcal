// src/calc/buffs.test.ts
import { describe, it, expect } from 'vitest';
import { CHARACTER_DB, WEAPON_DB, DISC_4_SETS } from './db';
import {
  AGENT_BUFFS,
  WEAPON_BUFFS,
  DISC_BUFFS,
  DA_BOSS_STAGE_BUFFS,
  DA_WEATHER_BUFFS,
} from './buffs';
import { buildCalcInput } from './buildInput';
import { AGENT_SKILLS, calcSkillAtLevel } from './agentSkills';
import { calculateDamage } from './formulas';
import { initialState, reducer } from '../state/reducer';

describe('3.4.5_r20699967 Character, Weapon, Disc, and 5-Category Buff Integration', () => {
  it('loads all 65 playable characters (up to 3.4.5_r20699967) with Lv.60 base panels', () => {
    const nonLegacy = Object.entries(CHARACTER_DB.characters).filter(
      ([, v]) => !(v.meta as Record<string, unknown> | undefined)?.legacyAlias,
    );
    expect(nonLegacy.length).toBeGreaterThanOrEqual(64);
    expect(CHARACTER_DB.characters['叶瞬光']?.baseAtk).toBe(938);
    expect(CHARACTER_DB.characters['挽昼']?.baseAtk).toBe(626);
    expect(CHARACTER_DB.characters['克拉蕾']?.baseAtk).toBe(626);
    expect(CHARACTER_DB.characters['知更鸟']?.baseAtk).toBe(750);
  });

  it('loads all 90 S/A W-Engines (excluding B-rank) and their R1-R5 passive buffs', () => {
    expect(Object.keys(WEAPON_DB).length).toBe(90);
    expect(Object.keys(WEAPON_BUFFS).length).toBe(90);
    // Verify no B-rank weapons exist in WEAPON_DB
    for (const w of Object.values(WEAPON_DB)) {
      expect(['S', 'A']).toContain(w.meta?.rarity);
    }
    const wp = WEAPON_BUFFS['霰落星殿'];
    expect(wp).toBeDefined();
    expect(wp.refinementDescs?.length).toBe(5);
    expect(wp.refinementStats?.[0]?.critDmg).toBe(50);
    expect(wp.refinementStats?.[4]?.critDmg).toBe(80);
  });

  it('loads all 32 Drive Disc sets including the 6 new 3.x sets', () => {
    expect(Object.keys(DISC_BUFFS).length).toBe(32);
    expect(DISC_4_SETS['huxiao']?.name).toBe('呼啸沙龙');
    expect(DISC_4_SETS['fuxiaoxingji']?.name).toBe('拂晓行纪');
    expect(DISC_4_SETS['chenyu']?.name).toBe('谶羽之誓');
    expect(DISC_4_SETS['jingji']?.name).toBe('荆棘玫瑰');
    expect(DISC_4_SETS['xingzhibei']?.name).toBe('星之碑');
    expect(DISC_4_SETS['chiyi']?.name).toBe('赤翼夜曲');
  });

  it('wires all 5 buff categories into buildCalcInput and calculateDamage', () => {
    let state = initialState;
    // 1. Select main agent: 挽昼
    state = reducer(state, { type: 'SET_AGENT_PRESET', slot: 'main', preset: '挽昼' });
    const baseInput = buildCalcInput(state);
    const baseOut = calculateDamage(baseInput);
    expect(baseInput.agent.baseAtk).toBe(626);

    // 2. Enable main agent Core Passive buff (+20% defShred, +20% dmgBonus, +40.35% critRate)
    const coreBuff = AGENT_BUFFS['挽昼'].find((b) => b.subType === '核心被动')!;
    expect(coreBuff).toBeDefined();
    state = reducer(state, {
      type: 'TOGGLE_AGENT_BUFF',
      slot: 'main',
      buffId: coreBuff.id,
      enabled: true,
    });
    const afterAgentBuff = buildCalcInput(state);
    expect(afterAgentBuff.agent.dmgBonus).toBe(coreBuff.stats.dmgBonus);
    expect(afterAgentBuff.agent.defShred).toBe(coreBuff.stats.defShred);
    expect(calculateDamage(afterAgentBuff).dmg).toBeGreaterThan(baseOut.dmg);

    // 3. Select support agent 妮可 in sup1 & toggle her Core Passive (+40% defShred)
    state = reducer(state, { type: 'SET_AGENT_PRESET', slot: 'sup1', preset: '妮可' });
    const nicoleCore = AGENT_BUFFS['妮可'].find((b) => b.subType === '核心被动')!;
    state = reducer(state, {
      type: 'TOGGLE_AGENT_BUFF',
      slot: 'sup1',
      buffId: nicoleCore.id,
      enabled: true,
    });
    const afterSupBuff = buildCalcInput(state);
    expect(afterSupBuff.sup?.a1?.defShred).toBe(40);
    // Support's personal base critDmg (50%) must NOT leak onto main DPS
    expect(afterSupBuff.sup?.a1?.critDmg).toBe(0);

    // 4. Select weapon 霰落星殿 at ★1 and toggle weapon buff on/off
    state = reducer(state, { type: 'SET_WEAPON_PRESET', slot: 'main', preset: '霰落星殿' });
    const withWpBuff = buildCalcInput(state);
    expect(withWpBuff.weapon.critDmg).toBe(50);
    state = reducer(state, { type: 'TOGGLE_WEAPON_BUFF', slot: 'main', enabled: false });
    const withoutWpBuff = buildCalcInput(state);
    expect(withoutWpBuff.weapon.critDmg).toBe(0);

    // 5. Toggle Team Drive Disc buff (月光骑士颂 +18% dmgBonus)
    state = reducer(state, { type: 'TOGGLE_TEAM_DISC_BUFF', setKey: 'moon', enabled: true });
    const afterTeamDisc = buildCalcInput(state);
    expect(afterTeamDisc.agent.dmgBonus).toBe((coreBuff.stats.dmgBonus ?? 0) + 18);

    // 6. Toggle Deadly Assault Boss Stage Buff & Weather Buff
    const bossBuffWithStats = DA_BOSS_STAGE_BUFFS.find((b) => (b.stats.dmgBonus ?? 0) > 0)!;
    const weatherBuffWithStats = DA_WEATHER_BUFFS.find((b) => (b.stats.dmgBonus ?? 0) > 0)!;
    expect(bossBuffWithStats).toBeDefined();
    expect(weatherBuffWithStats).toBeDefined();

    state = reducer(state, {
      type: 'TOGGLE_BOSS_STAGE_BUFF',
      buffId: bossBuffWithStats.id,
      enabled: true,
    });
    state = reducer(state, {
      type: 'TOGGLE_WEATHER_BUFF',
      buffId: weatherBuffWithStats.id,
      enabled: true,
    });
    const afterDaBuffs = buildCalcInput(state);
    expect(afterDaBuffs.agent.dmgBonus).toBe(
      (coreBuff.stats.dmgBonus ?? 0) +
        18 +
        (bossBuffWithStats.stats.dmgBonus ?? 0) +
        (weatherBuffWithStats.stats.dmgBonus ?? 0),
    );
  });

  it('matches 3.4.5_r20699967 Sunbringer Lv.12 multipliers, M2/M4/M6 buffs, Robin kit, and DA52 weather', () => {
    const sunSkills = AGENT_SKILLS['挽昼'];
    const multLv12 = (sid: number) => {
      const m = sunSkills.find((s) => s.skillIds.length === 1 && s.skillIds[0] === sid)!;
      expect(m).toBeDefined();
      return calcSkillAtLevel(m, 12).dmgMultPct;
    };
    expect(multLv12(1601015)).toBeCloseTo(1961.8, 1); // 执旌·聚锋
    expect(multLv12(1601007)).toBeCloseTo(1683.0, 1); // 燃灯·永昼之炬
    expect(multLv12(1601107)).toBeCloseTo(1924.0, 1); // 焚夜·长暗终焉
    expect(multLv12(1601111)).toBeCloseTo(2835.3, 1); // 此行，共赴前路
    expect(multLv12(1601011)).toBeCloseTo(2307.6, 1); // 此愿，重塑万象
    expect(multLv12(1601114)).toBeCloseTo(161.9, 1);  // 毁伤

    // Verify Sunbringer M2/M4/M6 3.4.5_r20699967 stats & texts
    const m2 = AGENT_BUFFS['挽昼'].find((b) => b.id === 'agent_1601_m2')!;
    const m4 = AGENT_BUFFS['挽昼'].find((b) => b.id === 'agent_1601_m4')!;
    const m6 = AGENT_BUFFS['挽昼'].find((b) => b.id === 'agent_1601_m6')!;
    expect(m2.desc).toContain('30%');
    expect(m2.desc).toContain('35%');
    expect(m2.desc).toContain('200点喧响值');
    expect(m2.desc).toContain('1000点');
    expect(m4.stats.dmgBonus).toBe(10);
    expect(m4.desc).toContain('65%');
    expect(m6.stats.defShred).toBe(15);
    expect(m6.desc).toContain('愿核');
    expect(m6.desc).toContain('80%');

    // Verify Robin (1661) & 星韵流彩 (14166)
    const robinCore = AGENT_BUFFS['知更鸟'].find((b) => b.id === 'agent_1661_core')!;
    const robinGuard = AGENT_BUFFS['知更鸟'].find((b) => b.id === 'agent_1661_guard')!;
    const robinM1 = AGENT_BUFFS['知更鸟'].find((b) => b.id === 'agent_1661_m1')!;
    expect(robinCore.stats.dmgBonus).toBe(20);
    expect(robinGuard.stats.inCombatDefFlat).toBe(1000);
    expect(robinM1.stats.defShred).toBe(20);
    expect(WEAPON_BUFFS['星韵流彩']?.stats).toEqual({ sharpCritDmg: 15, dmgBonus: 17 });

    // Verify DA52 weather 69015201 (10% def / 20% sharp dmg) & 69015205 ([凋蚀印记])
    const w5201 = DA_WEATHER_BUFFS.find((b) => b.id === 'da_weather_69015201')!;
    expect(w5201.stats.inCombatDefPct).toBe(10);
    expect(w5201.stats.dmgBonus).toBe(20);
    const b5205 = DA_BOSS_STAGE_BUFFS.find((b) => b.id === 'da_boss_69015205')!;
    expect(b5205).toBeDefined();
    expect(b5205.desc).toContain('凋蚀印记');
  });
});
