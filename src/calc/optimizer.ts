// src/calc/optimizer.ts
// Port of legacy `runOptimizationDataOnly` (legacy/index-legacy.html line ~1828).
//
// Differences from the legacy version:
//   - Legacy reads slot5/set2 candidates, start-counts, and the wrapped
//     calculateDamage from DOM/closure. This port takes them as explicit
//     parameters so it is pure and testable.
//   - Step semantics are unchanged: a fixed 48-substat budget, greedy gain
//     comparison among CR / CD / Atk / Hp / AM depending on battleType.
//
// See `optimizer.test.ts` for a numeric snapshot pinning the algorithm.

import { calculateDamage } from './formulas';
import type { BattleType, CalcInput, ExtraSubStats } from './types';

/** A single candidate for slot-5 main stat (one of 3 buckets). */
export interface Slot5Option {
  /** The substat contribution to merge into extraStats. */
  val: Partial<ExtraSubStats>;
  /** Human-readable label, e.g. "5号位:攻击". */
  name: string;
}

/** A single candidate for a 2-piece set bonus. */
export interface Set2Option {
  val: Partial<ExtraSubStats>;
  name: string;
}

/** Starting sub-stat counts (how many of each are already pre-rolled). */
export interface SubstatCounts {
  cr: number;
  cd: number;
  atk: number;
  hp: number;
  am: number;
}

export interface OptimizerOptions {
  /** Required: which slot-5 candidates to enumerate. */
  slot5Opts: Slot5Option[];
  /** Required: which 2-piece set candidates to enumerate. */
  set2Opts: Set2Option[];
  /** Starting sub-stat counts; default all zero. */
  startCounts?: Partial<SubstatCounts>;
  /** Total substat budget (default 48 — legacy hard-coded value). */
  budget?: number;
}

export interface OptimizeStep {
  step: number;
  dmg: number;
  stats: {
    critRate: number;
    critDmg: number;
    atkPct: number;
    hpPct: number;
    anomalyMastery: number;
    [key: string]: number;
  };
  configName: string;
  gains: { cr: number; cd: number; atk: number; hp: number; am: number };
  counts: SubstatCounts;
}

export interface OptimizeResult {
  name: string;
  history: OptimizeStep[];
}

// Per-substat gains. Legacy values:
//   1 substat roll  ≈  CR +2.4 / CD +4.8 / Atk% +3.0 / HP% +3.0 / AM +9.0
const ROLL_CR = 2.4;
const ROLL_CD = 4.8;
const ROLL_ATK = 3.0;
const ROLL_HP = 3.0;
const ROLL_AM = 9.0;

/**
 * Default slot5 candidate sets, matching legacy/index-legacy.html line 1832.
 */
export function defaultSlot5Opts(battleType: BattleType): Slot5Option[] {
  if (battleType === 'break') {
    return [
      { val: { slot5_AtkPct: 30 }, name: '5号位:攻击' },
      { val: { slot5_Dmg: 30 }, name: '5号位:增伤' },
      { val: { slot5_HpPct: 30 }, name: '5号位:生命' },
    ];
  }
  return [
    { val: { slot5_AtkPct: 30 }, name: '5号位:攻击' },
    { val: { slot5_Dmg: 30 }, name: '5号位:增伤' },
    { val: { slot5_Pen: 24 }, name: '5号位:穿透' },
  ];
}

/**
 * Default 2-piece set candidate sets, matching legacy line 1838.
 */
export function defaultSet2Opts(battleType: BattleType): Set2Option[] {
  if (battleType === 'break') {
    return [
      { val: { set2_Dmg: 10 }, name: '2件套:增伤' },
      { val: { set2_Pen: 8 }, name: '2件套:穿透' },
      { val: { set2_HpPct: 10 }, name: '2件套:生命' },
      { val: { set2_CD: 16 }, name: '2件套:爆伤' },
    ];
  }
  return [
    { val: { set2_AtkPct: 10 }, name: '2件套:攻击' },
    { val: { set2_Dmg: 10 }, name: '2件套:增伤' },
    { val: { set2_Pen: 8 }, name: '2件套:穿透' },
    { val: { set2_CD: 16 }, name: '2件套:爆伤' },
  ];
}

/**
 * Greedy substat optimizer.
 *
 * For every (slot5, set2) combination, allocates remaining sub-stat rolls
 * one-by-one, each time picking the channel that yields the highest damage
 * given the current state. The full history (including step 0) is returned
 * so the UI can plot damage curves and breakeven points.
 *
 * @param baseInput  Calc input minus the optimizer-controlled extraStats.
 *                   The optimizer will merge slot5/set2/substat-roll values
 *                   into a fresh extraStats per step; any extraStats already
 *                   on baseInput are preserved as a constant baseline.
 */
export function runGreedyOptimization(
  baseInput: CalcInput,
  options: OptimizerOptions,
): OptimizeResult[] {
  const battleType = baseInput.battleType;
  const slot5Opts = options.slot5Opts;
  const set2Opts = options.set2Opts;
  const budget = options.budget ?? 48;

  const startCR = options.startCounts?.cr ?? 0;
  const startCD = options.startCounts?.cd ?? 0;
  const startAtk = options.startCounts?.atk ?? 0;
  const startHp = options.startCounts?.hp ?? 0;
  const startAm = options.startCounts?.am ?? 0;
  const startTotal = startCR + startCD + startAtk + startHp + startAm;

  // Snapshot any baseline extraStats from the caller (e.g. character/weapon-
  // independent sub-stat seeds). They are preserved across all candidate combos.
  const baselineExtra: ExtraSubStats = { ...(baseInput.extraStats || {}) };

  // Helper: build a CalcInput where extraStats merges the baseline +
  // candidate-specific values + per-step counter increments.
  const calc = (currentStats: Record<string, number>): number => {
    const merged: ExtraSubStats = { ...baselineExtra, ...(currentStats as Partial<ExtraSubStats>) };
    return calculateDamage({ ...baseInput, extraStats: merged }).dmg;
  };

  const allResults: OptimizeResult[] = [];

  for (const s5 of slot5Opts) {
    for (const s2 of set2Opts) {
      const currentStats: Record<string, number> = {
        critRate: startCR * ROLL_CR,
        critDmg: startCD * ROLL_CD,
        atkPct: startAtk * ROLL_ATK,
        hpPct: startHp * ROLL_HP,
        anomalyMastery: startAm * ROLL_AM,
        ...(s5.val as Record<string, number>),
        ...(s2.val as Record<string, number>),
      };
      const history: OptimizeStep[] = [];
      let currentDmg = calc(currentStats);
      const counts: SubstatCounts = {
        cr: startCR,
        cd: startCD,
        atk: startAtk,
        hp: startHp,
        am: startAm,
      };

      // Step 0 (actually startTotal — the pre-rolled baseline)
      history.push({
        step: startTotal,
        dmg: currentDmg,
        stats: { ...currentStats } as OptimizeStep['stats'],
        configName: `${s5.name} + ${s2.name}`,
        gains: { cr: 0, cd: 0, atk: 0, hp: 0, am: 0 },
        counts: { ...counts },
      });

      // Greedy allocation up to budget
      for (let step = startTotal + 1; step <= budget; step++) {
        const dCR =
          battleType !== 'anomaly'
            ? calc({ ...currentStats, critRate: currentStats.critRate + ROLL_CR })
            : -1;
        const dCD =
          battleType !== 'anomaly'
            ? calc({ ...currentStats, critDmg: currentStats.critDmg + ROLL_CD })
            : -1;

        let dAtk = -1;
        let dHp = -1;
        let dAm = -1;
        let bestMove = -1;
        if (battleType === 'break') {
          dHp = calc({ ...currentStats, hpPct: currentStats.hpPct + ROLL_HP });
          bestMove = Math.max(dCR, dCD, dHp);
        } else if (battleType === 'anomaly') {
          dAtk = calc({ ...currentStats, atkPct: currentStats.atkPct + ROLL_ATK });
          dAm = calc({ ...currentStats, anomalyMastery: currentStats.anomalyMastery + ROLL_AM });
          bestMove = Math.max(dAtk, dAm);
        } else {
          dAtk = calc({ ...currentStats, atkPct: currentStats.atkPct + ROLL_ATK });
          bestMove = Math.max(dCR, dCD, dAtk);
        }

        const gCR = dCR !== -1 ? ((dCR - currentDmg) / currentDmg) * 100 : 0;
        const gCD = dCD !== -1 ? ((dCD - currentDmg) / currentDmg) * 100 : 0;
        const gAtk = dAtk !== -1 && dAtk > 0 ? ((dAtk - currentDmg) / currentDmg) * 100 : 0;
        const gHp = dHp !== -1 && dHp > 0 ? ((dHp - currentDmg) / currentDmg) * 100 : 0;
        const gAm = dAm !== -1 && dAm > 0 ? ((dAm - currentDmg) / currentDmg) * 100 : 0;

        // Same precedence ladder as legacy: CR > CD > HP/AM > Atk
        if (bestMove === dCR && battleType !== 'anomaly') {
          currentStats.critRate += ROLL_CR;
          counts.cr++;
        } else if (bestMove === dCD && battleType !== 'anomaly') {
          currentStats.critDmg += ROLL_CD;
          counts.cd++;
        } else if (battleType === 'break' && bestMove === dHp) {
          currentStats.hpPct += ROLL_HP;
          counts.hp++;
        } else if (battleType === 'anomaly' && bestMove === dAm) {
          currentStats.anomalyMastery += ROLL_AM;
          counts.am++;
        } else {
          currentStats.atkPct += ROLL_ATK;
          counts.atk++;
        }

        currentDmg = bestMove;
        history.push({
          step,
          dmg: currentDmg,
          stats: { ...currentStats } as OptimizeStep['stats'],
          configName: `${s5.name} + ${s2.name}`,
          gains: { cr: gCR, cd: gCD, atk: gAtk, hp: gHp, am: gAm },
          counts: { ...counts },
        });
      }

      allResults.push({
        name: `${s5.name} + ${s2.name}`,
        history,
      });
    }
  }

  return allResults;
}
