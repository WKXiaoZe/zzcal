// src/calc/formulas.ts
// Mechanical TS port of legacy/calc-legacy.js#calculateDamage.
// Body is line-for-line identical; only type annotations were added.
// Any divergence here is a parity-test regression by definition.

import { safeFloat } from './utils';
import type {
  CalcInput,
  CalcOutput,
  AgentStats,
  WeaponStats,
  FieldBuffs,
  DiscSet4Stats,
  BossState,
  SkillContext,
  ExtraSubStats,
  SupportSlots,
} from './types';

export function calculateDamage(input: CalcInput): CalcOutput {
  const battleType = input.battleType;
  const aMain: AgentStats = input.agent || {};
  const wMain: WeaponStats = input.weapon || {};
  const sup: SupportSlots = input.sup || {};
  const aSup1: AgentStats = sup.a1 || {};
  const aSup2: AgentStats = sup.a2 || {};
  const wSup1: WeaponStats = sup.w1 || {};
  const wSup2: WeaponStats = sup.w2 || {};
  const field: FieldBuffs = input.field || {};
  const set4Main: DiscSet4Stats = input.set4 || {};
  const boss: BossState = input.boss || ({} as BossState);
  const skill: SkillContext = input.skill || ({} as SkillContext);
  const extraStats: ExtraSubStats = input.extraStats || {};

  // Boss flags (legacy globalState)
  const bossWeak = !!boss.weak;
  const bossRes = safeFloat(boss.res); // typically 0 / 0.2 / 0.4

  // Field buffs default fallbacks (mirror legacy getFieldBuffs)
  const fieldInCombatAtkPct = safeFloat(field.inCombatAtkPct);
  const fieldCritRate = safeFloat(field.critRate);
  const fieldCritDmg = safeFloat(field.critDmg);
  const fieldDmgBonus = safeFloat(field.dmgBonus);
  const fieldResShred = safeFloat(field.resShred);
  const fieldDefShred = safeFloat(field.defShred);
  const fieldDazeVuln = safeFloat(field.dazeVuln);
  // const fieldHpPct = safeFloat(field.hpPct);  // legacy read but unused
  const fieldInCombatHpPct = safeFloat(field.inCombatHpPct);
  const fieldAnomalyMastery = safeFloat(field.anomalyMastery);

  const warnings: string[] = [];

  const sumSup = (key: string): number =>
    safeFloat((aSup1 as Record<string, unknown>)[key]) +
    safeFloat((aSup2 as Record<string, unknown>)[key]) +
    safeFloat((wSup1 as Record<string, unknown>)[key]) +
    safeFloat((wSup2 as Record<string, unknown>)[key]);

  const baseAtk = safeFloat(aMain.baseAtk) + safeFloat(wMain.baseAtk);
  if (baseAtk === 0) warnings.push('警告: 基础攻击力(白值)为 0');

  let disc6_AtkPct = 30;
  let disc6_Anomaly = 0;
  if (battleType === 'anomaly') {
    const slot6AnomalyType = skill.slot6AnomalyType;
    if (slot6AnomalyType === 'anomalyMastery') {
      disc6_AtkPct = 0;
      disc6_Anomaly = 0; // 异常掌控为占位符，不提供属性
    }
  }
  const disc2_FlatAtk = 316;
  const slot4Type = skill.slot4Type;
  const disc4_AtkPct = slot4Type === 'atk' ? 30 : 0;
  const disc4_CR = slot4Type === 'critRate' ? 24 : 0;
  const disc4_CD = slot4Type === 'critDmg' ? 48 : 0;

  const extraAtkPct =
    safeFloat(extraStats.atkPct) + safeFloat(extraStats.slot5_AtkPct) + safeFloat(extraStats.set2_AtkPct);
  const extraHpPct =
    safeFloat(extraStats.hpPct) + safeFloat(extraStats.slot5_HpPct) + safeFloat(extraStats.set2_HpPct);
  const extraCR = safeFloat(extraStats.critRate);
  const extraCD = safeFloat(extraStats.critDmg) + safeFloat(extraStats.set2_CD);
  const extraDmg =
    safeFloat(extraStats.dmgBonus) + safeFloat(extraStats.slot5_Dmg) + safeFloat(extraStats.set2_Dmg);
  const extraPenPct =
    safeFloat(extraStats.penRatio) + safeFloat(extraStats.slot5_Pen) + safeFloat(extraStats.set2_Pen);
  const extraAM = safeFloat(extraStats.anomalyMastery);

  const outCombatAtkPct =
    safeFloat(aMain.atkPct) +
    safeFloat(wMain.atkPct) +
    sumSup('atkPct') +
    disc6_AtkPct +
    disc4_AtkPct +
    extraAtkPct;

  const outCombatFlatAtk =
    disc2_FlatAtk + safeFloat(extraStats.flatAtk) + safeFloat(skill.smallAtkCount) * 19;

  // Add Field Buffs
  const inCombatAtkPct =
    safeFloat(aMain.inCombatAtkPct) +
    safeFloat(wMain.inCombatAtkPct) +
    sumSup('inCombatAtkPct') +
    fieldInCombatAtkPct;
  const inCombatFlatAtk =
    safeFloat(aMain.inCombatAtkFlat) + safeFloat(wMain.inCombatAtkFlat) + sumSup('inCombatAtkFlat');

  const sheetAtk = baseAtk * (1 + outCombatAtkPct / 100) + outCombatFlatAtk;
  const totalAtk = sheetAtk * (1 + inCombatAtkPct / 100) + inCombatFlatAtk;

  // --- Break Mode Logic (Pierce Calculation) ---
  let totalPierce = 0;
  if (battleType === 'break') {
    const disc6_HpPct = 30;
    const disc2_FlatHp = 2200;

    const baseHp = safeFloat(aMain.baseHp) + safeFloat(wMain.baseHp);
    // Include extraHpPct from sub-stats and equipment choices
    const outHpPct =
      safeFloat(aMain.hpPct) + safeFloat(wMain.hpPct) + sumSup('hpPct') + disc6_HpPct + extraHpPct;
    const outFlatHp =
      safeFloat(aMain.flatHp) + safeFloat(wMain.flatHp) + sumSup('flatHp') + disc2_FlatHp;
    const inCombatHpPctL =
      safeFloat(aMain.inCombatHpPct) +
      safeFloat(wMain.inCombatHpPct) +
      sumSup('inCombatHpPct') +
      fieldInCombatHpPct;
    const inCombatPen =
      safeFloat(aMain.inCombatPen) + safeFloat(wMain.inCombatPen) + sumSup('inCombatPen');

    // Base Pierce (Sum of penValue)
    const basePierce =
      safeFloat(aMain.penValue) + safeFloat(wMain.penValue) + sumSup('penValue');

    // Formula: 贯穿力 = 基础贯穿力 + 0.1*(局外hp*(1+inHp))*... + 0.3*totalAtk + inCombatPen
    const hpTerm = 0.1 * (baseHp * (1 + outHpPct / 100) + outFlatHp) * (1 + inCombatHpPctL / 100);
    const atkTerm = 0.3 * totalAtk;

    totalPierce = basePierce + hpTerm + atkTerm + inCombatPen;
  }

  let totalCR =
    safeFloat(aMain.critRate) +
    safeFloat(wMain.critRate) +
    sumSup('critRate') +
    disc4_CR +
    extraCR +
    fieldCritRate;
  let totalCD =
    safeFloat(aMain.critDmg) +
    safeFloat(wMain.critDmg) +
    sumSup('critDmg') +
    disc4_CD +
    extraCD +
    fieldCritDmg;

  // Special Rule: Anby Zero VI
  if (skill.isAnbyVI) {
    totalCD = totalCD * 1.3;
  }

  totalCR = Math.min(100, totalCR);
  // Formula: 1 + CR * CD
  const critMult = 1 + (totalCR / 100) * (totalCD / 100);

  const totalDmgBonus =
    safeFloat(aMain.dmgBonus) +
    safeFloat(wMain.dmgBonus) +
    sumSup('dmgBonus') +
    extraDmg +
    fieldDmgBonus;
  const dmgMult = 1 + totalDmgBonus / 100;

  const enemyRes = bossWeak ? 0 : bossRes;
  const weaknessVal = bossWeak ? 0.2 : 0;
  const totalResShred =
    safeFloat(aMain.resShred) + safeFloat(wMain.resShred) + sumSup('resShred') + fieldResShred;
  const resMult = 1 - enemyRes + weaknessVal + totalResShred / 100;

  const baseDef = safeFloat(boss.defBase);
  const defBonus = safeFloat(boss.defBonus);
  const totalDefShred =
    safeFloat(aMain.defShred) + safeFloat(wMain.defShred) + sumSup('defShred') + fieldDefShred;
  const totalPenPct =
    safeFloat(aMain.penRatio) + safeFloat(wMain.penRatio) + sumSup('penRatio') + extraPenPct;
  const totalPenVal =
    safeFloat(aMain.penValue) +
    safeFloat(wMain.penValue) +
    sumSup('penValue') +
    safeFloat(skill.smallPenCount) * 9;

  const defCalced = Math.max(0, baseDef * (1 + defBonus / 100 - totalDefShred / 100));
  let defRes = Math.max(0, defCalced * (1 - totalPenPct / 100) - totalPenVal);
  let defMult = 794 / (defRes + 794);

  // Break Mode: Bypass Defense
  if (battleType === 'break') {
    defMult = 1;
    defRes = 0; // For display purposes
  }

  const totalDazeVuln =
    safeFloat(aMain.dazeVuln) + sumSup('dazeVuln') + fieldDazeVuln;
  const baseDaze = safeFloat(boss.dazeBase);
  const dazeMult = (baseDaze + totalDazeVuln) / 100;

  const skillMult = safeFloat(skill.multiplier) / 100;

  // Final Damage Calculation
  let finalDmg: number;
  const totalAnomalyMastery =
    safeFloat(aMain.anomalyMastery) +
    safeFloat(wMain.anomalyMastery) +
    sumSup('anomalyMastery') +
    (slot4Type === 'anomalyMastery' ? 92 : 0) +
    disc6_Anomaly +
    fieldAnomalyMastery +
    extraAM;

  if (battleType === 'break') {
    // Break Mode Formula
    const totalPPDmgBonus =
      safeFloat(aMain.ppDmgBonus) + safeFloat(wMain.ppDmgBonus) + sumSup('ppDmgBonus');
    finalDmg =
      skillMult * totalPierce * dmgMult * critMult * resMult * dazeMult * (1 + totalPPDmgBonus / 100);
  } else if (battleType === 'anomaly') {
    // Anomaly Mode Formula
    finalDmg =
      skillMult * totalAtk * dmgMult * (totalAnomalyMastery / 100) * defMult * resMult * dazeMult;
  } else {
    // Attack Mode Formula
    finalDmg = skillMult * totalAtk * dmgMult * critMult * resMult * defMult * dazeMult;
  }

  return {
    dmg: finalDmg,
    warnings: warnings,
    details: {
      baseAtk,
      outCombatAtkPct,
      outCombatFlatAtk,
      sheetAtk,
      inCombatAtkPct,
      inCombatFlatAtk,
      totalAtk,
      totalPierce,
      totalAnomalyMastery,
      maxHpInCombat:
        battleType === 'break'
          ? ((safeFloat(aMain.baseHp) + safeFloat(wMain.baseHp)) *
              (1 +
                (safeFloat(aMain.hpPct) +
                  safeFloat(wMain.hpPct) +
                  sumSup('hpPct') +
                  30 +
                  extraHpPct) /
                  100) +
              (safeFloat(aMain.flatHp) + safeFloat(wMain.flatHp) + sumSup('flatHp') + 2200)) *
            (1 +
              (safeFloat(aMain.inCombatHpPct) +
                safeFloat(wMain.inCombatHpPct) +
                sumSup('inCombatHpPct')) /
                100)
          : 0,
      totalCR,
      totalCD,
      totalDmgBonus,
      resMult,
      defMult,
      dazeMult,
      defRes,
      enemyRes,
      weaknessVal,
      totalResShred,
      totalDazeVuln,
      baseDaze,
      baseDef,
      defBonus,
      totalDefShred,
      totalPenPct,
      totalPenVal,
      breakdown: {
        baseAtk: { a: safeFloat(aMain.baseAtk), w: safeFloat(wMain.baseAtk) },
        outCombatAtkPct: {
          a: safeFloat(aMain.atkPct) - safeFloat(set4Main.atkPct || 0),
          w: safeFloat(wMain.atkPct),
          sup: sumSup('atkPct'),
          disc:
            disc6_AtkPct +
            disc4_AtkPct +
            safeFloat(extraStats.atkPct) +
            safeFloat(extraStats.slot5_AtkPct) +
            safeFloat(extraStats.set2_AtkPct) +
            safeFloat(set4Main.atkPct || 0),
        },
        inCombatAtkPct: {
          a: safeFloat(aMain.inCombatAtkPct) - safeFloat(set4Main.inCombatAtkPct || 0),
          w: safeFloat(wMain.inCombatAtkPct),
          sup: sumSup('inCombatAtkPct'),
          field: fieldInCombatAtkPct,
          disc: safeFloat(set4Main.inCombatAtkPct || 0),
        },
        inCombatFlatAtk: {
          a: safeFloat(aMain.inCombatAtkFlat),
          w: safeFloat(wMain.inCombatAtkFlat),
          sup: sumSup('inCombatAtkFlat'),
          disc: disc2_FlatAtk + safeFloat(extraStats.flatAtk),
        },
        totalCR: {
          a: safeFloat(aMain.critRate) - safeFloat(set4Main.critRate || 0),
          w: safeFloat(wMain.critRate),
          sup: sumSup('critRate'),
          disc: disc4_CR + extraCR + safeFloat(set4Main.critRate || 0),
          field: fieldCritRate,
        },
        totalCD: {
          a: safeFloat(aMain.critDmg) - safeFloat(set4Main.critDmg || 0),
          w: safeFloat(wMain.critDmg),
          sup: sumSup('critDmg'),
          disc: disc4_CD + extraCD + safeFloat(set4Main.critDmg || 0),
          field: fieldCritDmg,
        },
        dmgBonus: {
          a: safeFloat(aMain.dmgBonus) - safeFloat(set4Main.dmgBonus || 0),
          w: safeFloat(wMain.dmgBonus),
          sup: sumSup('dmgBonus'),
          disc: extraDmg + safeFloat(set4Main.dmgBonus || 0),
          field: fieldDmgBonus,
        },
        resShred: {
          a: safeFloat(aMain.resShred),
          w: safeFloat(wMain.resShred),
          sup: sumSup('resShred'),
          field: fieldResShred,
        },
        defShred: {
          a: safeFloat(aMain.defShred),
          w: safeFloat(wMain.defShred),
          sup: sumSup('defShred'),
          field: fieldDefShred,
        },
        penPct: {
          a: safeFloat(aMain.penRatio),
          w: safeFloat(wMain.penRatio),
          sup: sumSup('penRatio'),
          disc: extraPenPct,
        },
        penVal: {
          a: safeFloat(aMain.penValue),
          w: safeFloat(wMain.penValue),
          sup: sumSup('penValue'),
        },
      },
    },
  };
}
