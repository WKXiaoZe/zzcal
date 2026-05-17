// src/calc/types.ts
// Type definitions for the calc layer.
//
// IMPORTANT: Field names must match the legacy `calculateDamage(input)` adapter
// in `legacy/calc-legacy.js`. Any rename here will break the parity tests.
// Each field is the AGGREGATED output of a legacy DOM-read helper:
//   agent  ← getAgentData('a_main')   (already merged with 4-set bonuses)
//   weapon ← getWeaponData('w_main')
//   sup    ← { a1: getAgentData('a_sup1'), a2: ..., w1: getWeaponData('w_sup1'), w2: ... }
//   set4   ← raw DISC_4_SETS[setKey].stats (for breakdown re-attribution only)
//   field  ← getFieldBuffs()
//   boss   ← DOM read of #boss-def-base / #boss-def-bonus / #boss-daze-base + globalState
//   skill  ← DOM read of #skill-multiplier / #slot4-select / #slot6-anomaly-select / etc.

export type BattleType = 'attack' | 'break' | 'anomaly';

export type Slot4Type = 'atk' | 'critRate' | 'critDmg' | 'anomalyMastery' | '';
export type Slot6AnomalyType = 'anomalyMastery' | '';

/**
 * Aggregated stats for the main agent (or a support agent). Every field that
 * the legacy formula reads must exist or default to 0 via `safeFloat`.
 *
 * All values are in their natural unit:
 *   - percentages are integers (e.g. critRate: 31  →  31%)
 *   - flat values are raw numbers
 */
export interface AgentStats {
  baseAtk?: number;
  baseHp?: number;
  atkPct?: number;
  hpPct?: number;
  flatHp?: number;
  critRate?: number;
  critDmg?: number;
  dmgBonus?: number;
  penRatio?: number;
  penValue?: number;
  defShred?: number;
  resShred?: number;
  dazeVuln?: number;
  anomalyMastery?: number;
  ppDmgBonus?: number;
  // In-combat (multiplicative) buffs
  inCombatAtkPct?: number;
  inCombatAtkFlat?: number;
  inCombatHpPct?: number;
  inCombatPen?: number;
}

/**
 * Aggregated stats for a weapon (main or support).
 * Shape is intentionally similar to AgentStats — legacy `sumSup` iterates over
 * the same keys regardless of slot type.
 */
export interface WeaponStats {
  baseAtk?: number;
  baseHp?: number;
  atkPct?: number;
  hpPct?: number;
  flatHp?: number;
  critRate?: number;
  critDmg?: number;
  dmgBonus?: number;
  penRatio?: number;
  penValue?: number;
  defShred?: number;
  resShred?: number;
  dazeVuln?: number;
  anomalyMastery?: number;
  ppDmgBonus?: number;
  inCombatAtkPct?: number;
  inCombatAtkFlat?: number;
  inCombatHpPct?: number;
  inCombatPen?: number;
}

export interface SupportSlots {
  a1?: AgentStats;
  a2?: AgentStats;
  w1?: WeaponStats;
  w2?: WeaponStats;
}

/**
 * 4-piece set bonus stats, used by the breakdown view to re-attribute
 * disc-vs-agent contribution. Pass the same numbers that were already merged
 * into `agent`.
 */
export interface DiscSet4Stats {
  atkPct?: number;
  inCombatAtkPct?: number;
  critRate?: number;
  critDmg?: number;
  dmgBonus?: number;
}

/**
 * Field-wide buffs (e.g. team-shared atkPct from a 2-set bonus, ally crit aura).
 */
export interface FieldBuffs {
  inCombatAtkPct?: number;
  critRate?: number;
  critDmg?: number;
  dmgBonus?: number;
  resShred?: number;
  defShred?: number;
  dazeVuln?: number;
  hpPct?: number;
  inCombatHpPct?: number;
  anomalyMastery?: number;
}

/**
 * Boss / target state.
 *
 * - `weak`: if true, enemy is in a weakness state (res = 0 + weaknessVal 0.2).
 * - `res`: elemental resistance (0 / 0.2 / 0.4 typically). Ignored when `weak`.
 */
export interface BossState {
  defBase: number;
  defBonus: number;
  dazeBase: number;
  res: number;
  weak: boolean;
}

/**
 * Skill / context inputs.
 *
 * `multiplier` is the percentage skill multiplier (e.g. 712 → 712% → ×7.12).
 */
export interface SkillContext {
  multiplier: number;
  slot4Type: Slot4Type;
  slot6AnomalyType?: Slot6AnomalyType;
  smallAtkCount: number;
  smallPenCount: number;
  /** Special-case flag: Anby Zero VI multiplies totalCD by 1.3 */
  isAnbyVI?: boolean;
}

/**
 * Sub-stat ladder values used by the optimizer. The legacy formula sums
 * `slot5_*`, `set2_*`, and the bare keys (`atkPct`, `critRate`, …) into the
 * same buckets, so the optimizer can sprinkle gains across these channels.
 */
export interface ExtraSubStats {
  // Plain sub-stat counters
  atkPct?: number;
  hpPct?: number;
  flatAtk?: number;
  critRate?: number;
  critDmg?: number;
  dmgBonus?: number;
  penRatio?: number;
  anomalyMastery?: number;
  // Slot-5 main-stat candidates
  slot5_AtkPct?: number;
  slot5_HpPct?: number;
  slot5_Dmg?: number;
  slot5_Pen?: number;
  // 2-piece set bonus candidates
  set2_AtkPct?: number;
  set2_HpPct?: number;
  set2_Dmg?: number;
  set2_Pen?: number;
  set2_CD?: number;
}

/**
 * Full input to `calculateDamage`. Mirrors the legacy adapter exactly.
 */
export interface CalcInput {
  battleType: BattleType;
  agent: AgentStats;
  weapon: WeaponStats;
  sup?: SupportSlots;
  set4?: DiscSet4Stats;
  field: FieldBuffs;
  boss: BossState;
  skill: SkillContext;
  extraStats?: ExtraSubStats;
}

// --- Output types --------------------------------------------------------

export interface BreakdownChannel {
  a?: number;
  w?: number;
  sup?: number;
  disc?: number;
  field?: number;
}

export interface CalcBreakdown {
  baseAtk: { a: number; w: number };
  outCombatAtkPct: BreakdownChannel;
  inCombatAtkPct: BreakdownChannel;
  inCombatFlatAtk: BreakdownChannel;
  totalCR: BreakdownChannel;
  totalCD: BreakdownChannel;
  dmgBonus: BreakdownChannel;
  resShred: BreakdownChannel;
  defShred: BreakdownChannel;
  penPct: BreakdownChannel;
  penVal: BreakdownChannel;
}

export interface CalcDetails {
  baseAtk: number;
  outCombatAtkPct: number;
  outCombatFlatAtk: number;
  sheetAtk: number;
  inCombatAtkPct: number;
  inCombatFlatAtk: number;
  totalAtk: number;
  totalPierce: number;
  totalAnomalyMastery: number;
  maxHpInCombat: number;
  totalCR: number;
  totalCD: number;
  totalDmgBonus: number;
  resMult: number;
  defMult: number;
  dazeMult: number;
  defRes: number;
  enemyRes: number;
  weaknessVal: number;
  totalResShred: number;
  totalDazeVuln: number;
  baseDaze: number;
  baseDef: number;
  defBonus: number;
  totalDefShred: number;
  totalPenPct: number;
  totalPenVal: number;
  breakdown: CalcBreakdown;
}

export interface CalcOutput {
  dmg: number;
  warnings: string[];
  details: CalcDetails;
}
