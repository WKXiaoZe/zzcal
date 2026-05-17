// legacy/calc-legacy.js
// Frozen snapshot of legacy calculation logic, extracted from index.html for parity testing.
// DO NOT modify the formulas after Phase 0 — new code under src/calc must produce identical outputs.
//
// Reference: index.html lines ~1014 / ~1037 / ~1161 / ~1236
//
// Design note:
//   The legacy `calculateDamage` reads DOM directly via helpers like
//   `getAgentData('a_main')`, `getWeaponData('w_main')`, `getSet4Stats('a_main')`,
//   `getFieldBuffs()`, `globalState.battleType`, and various `document.getElementById(...)` calls.
//
//   This adapter accepts an `input` object whose shape mirrors the AGGREGATED outputs of
//   those helpers, so the function body can be a verbatim copy with mechanical substitutions:
//
//     getAgentData('a_main')                     -> input.agent
//     getWeaponData('w_main')                    -> input.weapon
//     getAgentData('a_sup1')                     -> input.sup.a1
//     getAgentData('a_sup2')                     -> input.sup.a2
//     getWeaponData('w_sup1')                    -> input.sup.w1
//     getWeaponData('w_sup2')                    -> input.sup.w2
//     getFieldBuffs()                            -> input.field
//     getSet4Stats('a_main')                     -> input.set4
//     globalState.battleType                     -> input.battleType
//     globalState.bossWeak                       -> input.boss.weak
//     globalState.bossRes                        -> input.boss.res
//     document.getElementById('boss-def-base').value     -> input.boss.defBase
//     document.getElementById('boss-def-bonus').value    -> input.boss.defBonus
//     document.getElementById('boss-daze-base').value    -> input.boss.dazeBase
//     document.getElementById('skill-multiplier').value  -> input.skill.multiplier
//     document.getElementById('slot4-select').value      -> input.skill.slot4Type
//     document.getElementById('slot6-anomaly-select').value -> input.skill.slot6AnomalyType
//     document.getElementById('small-atk-count').value   -> input.skill.smallAtkCount
//     document.getElementById('small-pen-count').value   -> input.skill.smallPenCount
//     (dpsSelect.value === '零号安比Ⅵ')          -> input.skill.isAnbyVI
//
//   `input.extraStats` is the same shape as the legacy `extraStats` arg.

export function safeFloat(val) {
  if (val === undefined || val === null || val === '') return 0;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

export function parseAgentValue(val, cinemaLevel) {
  // Supports both array [Base, C1, C2, C4, C6] and legacy string "Base/C1/C2/C4/C6"
  if (typeof val === 'number') return val;

  let parts;
  if (Array.isArray(val)) {
    parts = val;
  } else if (typeof val === 'string') {
    if (!val.includes('/')) return parseFloat(val) || 0;
    parts = val.split('/').map((s) => parseFloat(s) || 0);
  } else {
    return 0;
  }

  let sum = parts[0] || 0; // Base
  if (cinemaLevel >= 1 && parts.length > 1) sum += parts[1];
  if (cinemaLevel >= 2 && parts.length > 2) sum += parts[2];
  if (cinemaLevel >= 4 && parts.length > 3) sum += parts[3];
  if (cinemaLevel >= 6 && parts.length > 4) sum += parts[4];

  return sum;
}

export function parseWeaponValue(valStr, starLevel) {
  // Supports: number, array [S1,S2,S3,S4,S5], or string "S1/S2/S3/S4/S5"
  if (typeof valStr === 'number') return valStr;

  let parts;
  if (Array.isArray(valStr)) {
    parts = valStr;
  } else if (typeof valStr === 'string') {
    if (!valStr.includes('/')) return parseFloat(valStr) || 0;
    parts = valStr.split('/').map((s) => parseFloat(s) || 0);
  } else {
    return 0;
  }

  const idx = Math.max(0, Math.min(parts.length - 1, starLevel - 1));
  return parts[idx];
}

/**
 * Pure-function port of legacy `calculateDamage`.
 *
 * @param {object} input
 * @param {'attack'|'break'|'anomaly'} input.battleType
 * @param {object} input.agent     — aggregated main-agent stats (already merged with 4-set)
 * @param {object} input.weapon    — aggregated main-weapon stats
 * @param {{a1?:object, a2?:object, w1?:object, w2?:object}} [input.sup]
 * @param {object} [input.set4]    — raw set4 stats for breakdown re-attribution
 * @param {object} input.field     — field buffs
 * @param {object} input.boss      — { defBase, defBonus, dazeBase, res, weak }
 * @param {object} input.skill     — { multiplier, slot4Type, slot6AnomalyType, smallAtkCount, smallPenCount, isAnbyVI }
 * @param {object} [input.extraStats]
 * @returns {{dmg:number, warnings:string[], details:object}}
 */
export function calculateDamage(input) {
  const battleType = input.battleType;
  const aMain = input.agent || {};
  const wMain = input.weapon || {};
  const sup = input.sup || {};
  const aSup1 = sup.a1 || {};
  const aSup2 = sup.a2 || {};
  const wSup1 = sup.w1 || {};
  const wSup2 = sup.w2 || {};
  const field = input.field || {};
  const set4Main = input.set4 || {};
  const boss = input.boss || {};
  const skill = input.skill || {};
  const extraStats = input.extraStats || {};

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
  const fieldHpPct = safeFloat(field.hpPct);
  const fieldInCombatHpPct = safeFloat(field.inCombatHpPct);
  const fieldAnomalyMastery = safeFloat(field.anomalyMastery);

  let warnings = [];

  const sumSup = (key) =>
    safeFloat(aSup1[key]) + safeFloat(aSup2[key]) + safeFloat(wSup1[key]) + safeFloat(wSup2[key]);

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
  let disc4_AtkPct = slot4Type === 'atk' ? 30 : 0;
  let disc4_CR = slot4Type === 'critRate' ? 24 : 0;
  let disc4_CD = slot4Type === 'critDmg' ? 48 : 0;

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

  let outCombatAtkPct =
    safeFloat(aMain.atkPct) +
    safeFloat(wMain.atkPct) +
    sumSup('atkPct') +
    disc6_AtkPct +
    disc4_AtkPct +
    extraAtkPct;

  let outCombatFlatAtk =
    disc2_FlatAtk + safeFloat(extraStats.flatAtk) + safeFloat(skill.smallAtkCount) * 19;

  // Add Field Buffs
  let inCombatAtkPct =
    safeFloat(aMain.inCombatAtkPct) +
    safeFloat(wMain.inCombatAtkPct) +
    sumSup('inCombatAtkPct') +
    fieldInCombatAtkPct;
  let inCombatFlatAtk =
    safeFloat(aMain.inCombatAtkFlat) + safeFloat(wMain.inCombatAtkFlat) + sumSup('inCombatAtkFlat');

  let sheetAtk = baseAtk * (1 + outCombatAtkPct / 100) + outCombatFlatAtk;
  let totalAtk = sheetAtk * (1 + inCombatAtkPct / 100) + inCombatFlatAtk;

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
  let critMult = 1 + (totalCR / 100) * (totalCD / 100);

  let totalDmgBonus =
    safeFloat(aMain.dmgBonus) +
    safeFloat(wMain.dmgBonus) +
    sumSup('dmgBonus') +
    extraDmg +
    fieldDmgBonus;
  let dmgMult = 1 + totalDmgBonus / 100;

  let enemyRes = bossWeak ? 0 : bossRes;
  let weaknessVal = bossWeak ? 0.2 : 0;
  let totalResShred =
    safeFloat(aMain.resShred) + safeFloat(wMain.resShred) + sumSup('resShred') + fieldResShred;
  let resMult = 1 - enemyRes + weaknessVal + totalResShred / 100;

  let baseDef = safeFloat(boss.defBase);
  let defBonus = safeFloat(boss.defBonus);
  let totalDefShred =
    safeFloat(aMain.defShred) + safeFloat(wMain.defShred) + sumSup('defShred') + fieldDefShred;
  let totalPenPct =
    safeFloat(aMain.penRatio) + safeFloat(wMain.penRatio) + sumSup('penRatio') + extraPenPct;
  let totalPenVal =
    safeFloat(aMain.penValue) +
    safeFloat(wMain.penValue) +
    sumSup('penValue') +
    safeFloat(skill.smallPenCount) * 9;

  let defCalced = Math.max(0, baseDef * (1 + defBonus / 100 - totalDefShred / 100));
  let defRes = Math.max(0, defCalced * (1 - totalPenPct / 100) - totalPenVal);
  let defMult = 794 / (defRes + 794);

  // Break Mode: Bypass Defense
  if (battleType === 'break') {
    defMult = 1;
    defRes = 0; // For display purposes
  }

  let totalDazeVuln =
    safeFloat(aMain.dazeVuln) + sumSup('dazeVuln') + fieldDazeVuln;
  let baseDaze = safeFloat(boss.dazeBase);
  let dazeMult = (baseDaze + totalDazeVuln) / 100;

  let skillMult = safeFloat(skill.multiplier) / 100;

  // Final Damage Calculation
  let finalDmg;
  let totalAnomalyMastery =
    safeFloat(aMain.anomalyMastery) +
    safeFloat(wMain.anomalyMastery) +
    sumSup('anomalyMastery') +
    (slot4Type === 'anomalyMastery' ? 92 : 0) +
    disc6_Anomaly +
    fieldAnomalyMastery +
    extraAM;

  if (battleType === 'break') {
    // Break Mode Formula
    let totalPPDmgBonus =
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
