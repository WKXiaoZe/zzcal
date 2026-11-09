// src/calc/buildInput.ts
// Pure transform: AppState → CalcInput.

import type { CalcInput, AgentStats, WeaponStats, ExtraSubStats, Slot4Type, BattleType } from './types';
import type { AppState, SlotConfig } from '../state/types';
import { CHARACTER_DB, WEAPON_DB, DISC_4_SETS, DISC_2_SETS } from './db';
import {
  AGENT_BUFFS,
  WEAPON_BUFFS,
  DISC_BUFFS,
  DA_BOSS_STAGE_BUFFS,
  DA_WEATHER_BUFFS,
} from './buffs';
import { AGENT_SKILLS, calcSkillAtLevel, getMaxSkillLevel } from './agentSkills';
import { parseAgentValue, parseWeaponValue, safeFloat } from './utils';

export function resolveBattleTypeForAgent(
  agentName: string | undefined,
  fallback: BattleType = 'attack',
): BattleType {
  if (!agentName) return fallback;
  const entry = CHARACTER_DB.characters[agentName] ?? (CHARACTER_DB.sup ?? {})[agentName];
  const roleType = entry?.meta?.type;
  if (!roleType) return fallback;
  if (roleType === '命破') return 'break';
  if (roleType === '异常') return 'anomaly';
  if (roleType === '锋御') return 'vanguard';
  return 'attack';
}

const AGENT_FIELDS: readonly (keyof AgentStats)[] = [
  'baseAtk',
  'baseHp',
  'baseDef',
  'atkPct',
  'hpPct',
  'defPct',
  'flatHp',
  'flatDef',
  'critRate',
  'critDmg',
  'sharpCritDmg',
  'dmgBonus',
  'penRatio',
  'penValue',
  'defShred',
  'dazeVuln',
  'resShred',
  'inCombatAtkPct',
  'inCombatAtkFlat',
  'inCombatHpPct',
  'inCombatDefPct',
  'inCombatDefFlat',
  'inCombatPen',
  'ppDmgBonus',
  'anomalyMastery',
];

const WEAPON_FIELDS: readonly (keyof WeaponStats)[] = [
  'baseAtk',
  'baseHp',
  'baseDef',
  'atkPct',
  'hpPct',
  'defPct',
  'flatHp',
  'flatDef',
  'critRate',
  'critDmg',
  'sharpCritDmg',
  'penRatio',
  'defShred',
  'resShred',
  'dmgBonus',
  'inCombatAtkPct',
  'inCombatAtkFlat',
  'inCombatHpPct',
  'inCombatDefPct',
  'inCombatDefFlat',
  'inCombatPen',
  'ppDmgBonus',
  'anomalyMastery',
];

const SUBCOUNT_COEFF = {
  CR: 2.4,
  CD: 4.8,
  ATK: 3.0,
  HP: 3.0,
  DEF: 4.8,
  AM: 9.0,
} as const;

const DA_BOSS_BUFF_BY_ID = new Map(DA_BOSS_STAGE_BUFFS.map((b) => [b.id, b]));
const DA_WEATHER_BUFF_BY_ID = new Map(DA_WEATHER_BUFFS.map((b) => [b.id, b]));

function lookupCharacterForSlot(
  name: string,
  slotKey: 'main' | 'sup1' | 'sup2',
): Record<string, unknown> | undefined {
  if (!name) return undefined;
  if (slotKey === 'main') {
    return (
      (CHARACTER_DB.characters[name] as Record<string, unknown> | undefined) ??
      ((CHARACTER_DB.sup ?? {})[name] as Record<string, unknown> | undefined)
    );
  }
  // For support slots (sup1 / sup2):
  // Only load preset base stats if it's an explicit legacy sup preset (like "耀嘉音-辅助").
  // Normal playable characters in sup1/sup2 should NOT add their own personal baseAtk / 5% CR / 50% CD
  // onto the main DPS; instead, their contribution comes from the user-selected Agent Buffs!
  const supEntry = (CHARACTER_DB.sup ?? {})[name] as Record<string, unknown> | undefined;
  if (supEntry && !CHARACTER_DB.characters[name]) {
    return supEntry;
  }
  return undefined;
}

function lookupWeapon(name: string): Record<string, unknown> | undefined {
  if (!name) return undefined;
  return WEAPON_DB[name] as Record<string, unknown> | undefined;
}

function addStatsInto(target: Record<string, number | undefined>, delta: Partial<AgentStats> | undefined): void {
  if (!delta) return;
  for (const [k, v] of Object.entries(delta)) {
    if (typeof v !== 'number' || !Number.isFinite(v)) continue;
    target[k] = Number(((target[k] ?? 0) + v).toFixed(2));
  }
}

/**
 * Resolve one agent slot to a flat `AgentStats` object:
 *   1. start from every AGENT_FIELDS key = 0
 *   2. fill from preset (for main slot: Lv.60 base panel; for sup1/sup2: 0 unless legacy -辅助 preset)
 *   3. add all user-checked Agent Buffs (`state.buffs.agentBuffs[slotKey]`)
 *   4. overlay customOverrides (override wins)
 */
export function buildAgent(
  slot: SlotConfig,
  slotKey: 'main' | 'sup1' | 'sup2' = 'main',
  enabledBuffMap?: Record<string, boolean>,
): AgentStats {
  const out: AgentStats = {};
  for (const f of AGENT_FIELDS) out[f] = 0;

  const preset = lookupCharacterForSlot(slot.presetName, slotKey);
  if (preset) {
    for (const f of AGENT_FIELDS) {
      const raw = preset[f as string];
      if (raw !== undefined) {
        out[f] = parseAgentValue(raw, slot.cinemaOrStar);
      }
    }
    if (preset.atkPct !== undefined) {
      out.atkPct = parseAgentValue(preset.atkPct, slot.cinemaOrStar);
    }
  }

  // Add checked Agent Buffs
  if (slot.presetName && enabledBuffMap) {
    const buffList = AGENT_BUFFS[slot.presetName] ?? [];
    for (const b of buffList) {
      if (enabledBuffMap[b.id]) {
        addStatsInto(out as Record<string, number | undefined>, b.stats);
      }
    }
  }

  // customOverrides win
  for (const [k, v] of Object.entries(slot.customOverrides)) {
    (out as Record<string, number>)[k] = safeFloat(v);
  }

  return out;
}

/**
 * Resolve one weapon slot to a flat `WeaponStats` object:
 *   1. start from every WEAPON_FIELDS key = 0
 *   2. for main slot: fill Lv.60 baseAtk & permanent sub-stat from WEAPON_DB
 *      (for sup1/sup2: do NOT copy wearer-only baseAtk & sub-stat to main DPS)
 *   3. if weaponBuffEnabled is true, add R1-R5 passive buff stats from WEAPON_BUFFS
 *   4. overlay customOverrides (override wins)
 */
export function buildWeapon(
  slot: SlotConfig,
  slotKey: 'main' | 'sup1' | 'sup2' = 'main',
  weaponBuffEnabled = true,
): WeaponStats {
  const out: WeaponStats = {};
  for (const f of WEAPON_FIELDS) out[f] = 0;

  const star = Math.max(1, Math.min(5, slot.cinemaOrStar > 0 ? slot.cinemaOrStar : 1));

  if (slotKey === 'main') {
    const preset = lookupWeapon(slot.presetName);
    if (preset) {
      for (const f of WEAPON_FIELDS) {
        const raw = preset[f as string];
        if (raw !== undefined) {
          out[f] = parseWeaponValue(raw, star);
        }
      }
    }
  }

  // Add W-Engine passive buff stats if enabled
  // Note: for main slot, always apply when weaponBuffEnabled is true;
  // for sup1/sup2 slots, only apply when explicitly enabled by user or when weapon is selected and enabled.
  if (slot.presetName && weaponBuffEnabled) {
    const wpBuff = WEAPON_BUFFS[slot.presetName];
    if (wpBuff) {
      const refStats = wpBuff.refinementStats?.[star - 1] ?? wpBuff.stats;
      addStatsInto(out as Record<string, number | undefined>, refStats);
    }
  }

  for (const [k, v] of Object.entries(slot.customOverrides)) {
    (out as Record<string, number>)[k] = safeFloat(v);
  }

  return out;
}

function applySet4ToAgent(agent: AgentStats, set4Stats: Record<string, number>): AgentStats {
  const target = agent as Record<string, number | undefined>;
  for (const [sKey, sVal] of Object.entries(set4Stats)) {
    if (target[sKey] !== undefined) {
      target[sKey] = Number(((target[sKey] ?? 0) + sVal).toFixed(2));
    } else if (sKey === 'atkPct') {
      target.atkPct = Number(((target.atkPct ?? 0) + sVal).toFixed(2));
    } else {
      target[sKey] = Number(((target[sKey] ?? 0) + sVal).toFixed(2));
    }
  }
  return agent;
}

function set2ToExtra(set2Stats: Record<string, number>): Partial<ExtraSubStats> {
  const out: Partial<ExtraSubStats> = {};
  for (const [k, v] of Object.entries(set2Stats)) {
    switch (k) {
      case 'atkPct':         out.set2_AtkPct = (out.set2_AtkPct ?? 0) + v; break;
      case 'hpPct':          out.set2_HpPct  = (out.set2_HpPct  ?? 0) + v; break;
      case 'defPct':         out.set2_DefPct = (out.set2_DefPct ?? 0) + v; break;
      case 'dmgBonus':       out.set2_Dmg    = (out.set2_Dmg    ?? 0) + v; break;
      case 'penRatio':       out.set2_Pen    = (out.set2_Pen    ?? 0) + v; break;
      case 'critDmg':        out.set2_CD     = (out.set2_CD     ?? 0) + v; break;
      case 'critRate':       out.critRate        = (out.critRate        ?? 0) + v; break;
      case 'anomalyMastery': out.anomalyMastery  = (out.anomalyMastery  ?? 0) + v; break;
      default:
        break;
    }
  }
  return out;
}

export function buildCalcInput(state: AppState): CalcInput {
  const buffs = state.buffs;

  // Main + sup agents (base panel + checked Agent Buffs + customOverrides)
  const aMain = buildAgent(state.agents.main, 'main', buffs?.agentBuffs?.main);
  const aSup1 = buildAgent(state.agents.sup1, 'sup1', buffs?.agentBuffs?.sup1);
  const aSup2 = buildAgent(state.agents.sup2, 'sup2', buffs?.agentBuffs?.sup2);

  // Main + sup weapons (base panel + checked Weapon Buffs + customOverrides)
  const wMain = buildWeapon(state.weapons.main, 'main', buffs?.weaponBuffEnabled?.main ?? true);
  const wSup1 = buildWeapon(state.weapons.sup1, 'sup1', buffs?.weaponBuffEnabled?.sup1 ?? true);
  const wSup2 = buildWeapon(state.weapons.sup2, 'sup2', buffs?.weaponBuffEnabled?.sup2 ?? true);

  // DISC sets
  const set4Key = state.disc.set4Key;
  const mainDisc4Enabled = buffs?.mainDisc4BuffEnabled ?? true;
  const set4Stats = mainDisc4Enabled ? (DISC_4_SETS[set4Key]?.stats ?? {}) : {};

  // Fold main 4-set into the main agent
  applySet4ToAgent(aMain, set4Stats);

  // Fold any additional checked team Drive Disc 4-piece buffs
  if (buffs?.teamDiscBuffs) {
    for (const [dKey, enabled] of Object.entries(buffs.teamDiscBuffs)) {
      if (!enabled) continue;
      if (dKey === set4Key && mainDisc4Enabled) continue; // avoid double-counting same 4-set
      const dBuff = DISC_BUFFS[dKey];
      if (dBuff?.stats) {
        addStatsInto(aMain as Record<string, number | undefined>, dBuff.stats);
      }
    }
  }

  // Fold checked Deadly Assault Boss Stage Buffs
  if (buffs?.bossStageBuffs) {
    for (const [bId, enabled] of Object.entries(buffs.bossStageBuffs)) {
      if (!enabled) continue;
      const b = DA_BOSS_BUFF_BY_ID.get(bId);
      if (b?.stats) {
        addStatsInto(aMain as Record<string, number | undefined>, b.stats);
      }
    }
  }

  // Fold checked Deadly Assault Season Weather Buffs
  if (buffs?.weatherBuffs) {
    for (const [wId, enabled] of Object.entries(buffs.weatherBuffs)) {
      if (!enabled) continue;
      const b = DA_WEATHER_BUFF_BY_ID.get(wId);
      if (b?.stats) {
        addStatsInto(aMain as Record<string, number | undefined>, b.stats);
      }
    }
  }

  // Fold manual field.inCombatAtkFlat into aMain so the FieldBuffPanel input works
  if (safeFloat(state.field.inCombatAtkFlat) !== 0) {
    aMain.inCombatAtkFlat = (aMain.inCombatAtkFlat ?? 0) + safeFloat(state.field.inCombatAtkFlat);
  }

  // Build effective 2-piece list
  const effectiveSet2Keys: string[] = [];
  if (set4Key && set4Key !== 'none') effectiveSet2Keys.push(set4Key);
  for (const k of state.disc.set2Keys) {
    if (!k || k === 'none') continue;
    if (k === set4Key) continue;
    effectiveSet2Keys.push(k);
  }

  const set2Extra: Partial<ExtraSubStats> = {};
  for (const k of effectiveSet2Keys) {
    const s2 = DISC_2_SETS[k]?.stats;
    if (!s2) continue;
    const delta = set2ToExtra(s2);
    for (const [field, val] of Object.entries(delta)) {
      if (typeof val !== 'number') continue;
      const key = field as keyof ExtraSubStats;
      set2Extra[key] = (set2Extra[key] ?? 0) + val;
    }
  }

  const sc = state.disc.subCounts;
  if (safeFloat(sc.FLAT_HP) !== 0) {
    aMain.flatHp = (aMain.flatHp ?? 0) + safeFloat(sc.FLAT_HP) * 112;
  }

  const extraStats: ExtraSubStats = {
    critRate:       safeFloat(sc.CR)       * SUBCOUNT_COEFF.CR  + safeFloat(set2Extra.critRate),
    critDmg:        safeFloat(sc.CD)       * SUBCOUNT_COEFF.CD,
    atkPct:         safeFloat(sc.ATK)      * SUBCOUNT_COEFF.ATK,
    flatAtk:        safeFloat(sc.FLAT_ATK) * 19,
    hpPct:          safeFloat(sc.HP)       * SUBCOUNT_COEFF.HP,
    defPct:         safeFloat(sc.DEF)      * SUBCOUNT_COEFF.DEF,
    flatDef:        safeFloat(sc.FLAT_DEF) * 15,
    anomalyMastery: safeFloat(sc.AM)       * SUBCOUNT_COEFF.AM + safeFloat(set2Extra.anomalyMastery),
    set2_AtkPct:    set2Extra.set2_AtkPct,
    set2_HpPct:     set2Extra.set2_HpPct,
    set2_DefPct:    set2Extra.set2_DefPct,
    set2_Dmg:       set2Extra.set2_Dmg,
    set2_Pen:       set2Extra.set2_Pen,
    set2_CD:        set2Extra.set2_CD,
  };

  const slot4Type: Slot4Type =
    state.disc.slot4Stat === 'atkPct'
      ? 'atk'
      : state.disc.slot4Stat === 'defPct'
        ? 'def'
        : state.disc.slot4Stat;

  let skillMultiplier = safeFloat(state.selectedSkill?.customMultiplier) || 100;
  const mainName = state.agents.main.presetName;
  const selMoveId = state.selectedSkill?.moveId;
  if (mainName && selMoveId) {
    const moveList = AGENT_SKILLS[mainName] ?? [];
    const foundMove = moveList.find((m) => m.id === selMoveId);
    if (foundMove) {
      const maxLv = getMaxSkillLevel(state.agents.main.cinemaOrStar);
      const lv = Math.min(maxLv, Math.max(1, state.selectedSkill?.level || 12));
      const calced = calcSkillAtLevel(foundMove, lv);
      if (calced.dmgMultPct > 0) {
        skillMultiplier = calced.dmgMultPct;
      }
    }
  }

  const skill = {
    multiplier: skillMultiplier,
    slot4Type,
    slot6AnomalyType: '' as const,
    smallAtkCount: 0,
    smallPenCount: safeFloat(sc.PEN),
  };

  const field = {
    inCombatAtkPct: safeFloat(state.field.atkPct),
    critRate:       safeFloat(state.field.critRate),
    critDmg:        safeFloat(state.field.critDmg),
    dmgBonus:       safeFloat(state.field.dmgBonus),
    resShred:       safeFloat(state.field.resShred),
  };

  const boss = {
    defBase:  safeFloat(state.boss.def),
    defBonus: safeFloat(state.boss.defBonus),
    dazeBase: 100,
    dazeInc:  safeFloat(state.boss.dazeMult),
    res:      state.boss.res,
    weak:     state.boss.weak,
  };

  const effectiveBattleType = resolveBattleTypeForAgent(
    state.agents.main.presetName,
    state.battleType,
  );

  return {
    battleType: effectiveBattleType,
    agent:      aMain,
    weapon:     wMain,
    sup:        { a1: aSup1, a2: aSup2, w1: wSup1, w2: wSup2 },
    field,
    set4:       set4Stats,
    boss,
    skill,
    extraStats,
  };
}
