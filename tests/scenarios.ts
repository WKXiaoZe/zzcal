// tests/scenarios.ts
// 5 typical scenarios that lock down legacy calculateDamage behavior.
//
// Field shape matches the AGGREGATED inputs that legacy helpers produced:
//   `agent`  — output of getAgentData('a_main') (DOM-read agent fields, then DISC_4_SETS stats merged in)
//   `weapon` — output of getWeaponData('w_main')
//   `sup`    — { a1, a2, w1, w2 } same shape as above for support slots
//   `set4`   — raw DISC_4_SETS[setKey].stats (used only for breakdown re-attribution)
//   `field`  — output of getFieldBuffs()
//   `boss`   — DOM read of #boss-def-base, #boss-def-bonus, #boss-daze-base + globalState res/weak
//   `skill`  — DOM read of #skill-multiplier, #slot4-select, #slot6-anomaly-select,
//              #small-atk-count, #small-pen-count, plus the Anby-VI special-case flag
//   `extraStats` — sub-stat ladder values (legacy extraStats arg)

export interface Scenario {
  name: string;
  battleType: 'attack' | 'break' | 'anomaly';
  agent: Record<string, number>;
  weapon: Record<string, number>;
  sup?: {
    a1?: Record<string, number>;
    a2?: Record<string, number>;
    w1?: Record<string, number>;
    w2?: Record<string, number>;
  };
  set4?: Record<string, number>;
  field: Record<string, number>;
  boss: {
    defBase: number;
    defBonus: number;
    dazeBase: number;
    res: number;
    weak: boolean;
  };
  skill: {
    multiplier: number;
    slot4Type: 'atk' | 'critRate' | 'critDmg' | 'anomalyMastery' | '';
    slot6AnomalyType?: 'anomalyMastery' | '';
    smallAtkCount: number;
    smallPenCount: number;
    isAnbyVI?: boolean;
  };
  extraStats: Record<string, number>;
}

// Convenience: a fully-zeroed agent/weapon shape so scenarios stay readable.
// Every field calculateDamage reads must exist (or default to 0 via safeFloat).
const ZERO_AGENT: Record<string, number> = {
  baseAtk: 0, critRate: 0, critDmg: 0, dmgBonus: 0,
  penRatio: 0, penValue: 0, defShred: 0, dazeVuln: 0, resShred: 0,
  inCombatAtkPct: 0, inCombatAtkFlat: 0,
  baseHp: 0, hpPct: 0, flatHp: 0, inCombatHpPct: 0, inCombatPen: 0,
  ppDmgBonus: 0, anomalyMastery: 0,
  atkPct: 0,
};
const ZERO_WEAPON: Record<string, number> = {
  baseAtk: 0, critRate: 0, critDmg: 0, atkPct: 0,
  penRatio: 0, penValue: 0, defShred: 0, resShred: 0,
  dmgBonus: 0, inCombatAtkPct: 0, inCombatAtkFlat: 0,
  baseHp: 0, hpPct: 0, flatHp: 0, inCombatHpPct: 0, inCombatPen: 0,
  ppDmgBonus: 0, anomalyMastery: 0,
};
const ZERO_FIELD: Record<string, number> = {
  inCombatAtkPct: 0, critRate: 0, critDmg: 0, dmgBonus: 0,
  resShred: 0, defShred: 0, dazeVuln: 0,
  hpPct: 0, inCombatHpPct: 0, anomalyMastery: 0,
};

export const SCENARIOS: Scenario[] = [
  // -----------------------------------------------------------------
  // 1. attack — 11号Ⅵ S0 + 云霓孤光 S5 + 如影相随 (set4)，无副词条
  //    主C 强攻基础场景：弱点 + boss 默认防御 953
  // -----------------------------------------------------------------
  {
    name: 'attack/11号Ⅵ S0 + 云霓孤光 S5 + 如影相随 / 无副词条 / 弱点',
    battleType: 'attack',
    // 11号Ⅵ S0: baseAtk 889, critRate 19, critDmg 98, dmgBonus 80
    // + 如影相随 4set: dmgBonus +15, critRate +12, inCombatAtkPct +12
    agent: {
      ...ZERO_AGENT,
      baseAtk: 889,
      critRate: 19 + 12,       // 31
      critDmg: 98,
      dmgBonus: 80 + 15,        // 95
      inCombatAtkPct: 0 + 12,   // 12  (from 4-set)
    },
    // 云霓孤光 S5: baseAtk 743, critDmg 88, dmgBonus 40, resShred 28
    weapon: {
      ...ZERO_WEAPON,
      baseAtk: 743,
      critDmg: 88,
      dmgBonus: 40,
      resShred: 28,
    },
    set4: { dmgBonus: 15, critRate: 12, inCombatAtkPct: 12 },
    field: { ...ZERO_FIELD },
    boss: { defBase: 953, defBonus: 0, dazeBase: 100, res: 0, weak: true },
    skill: { multiplier: 100, slot4Type: 'critDmg', smallAtkCount: 0, smallPenCount: 0 },
    extraStats: {},
  },

  // -----------------------------------------------------------------
  // 2. break — 仪玄 S0 + 青溟笼舍 S5 + 山大王 (set4)，破值场景
  //    命破：HP 项参与贯穿力，跳过防御乘区
  // -----------------------------------------------------------------
  {
    name: 'break/仪玄 S0 + 青溟笼舍 S5 + 山大王 / 命破贯穿场景',
    battleType: 'break',
    // 仪玄 S0: baseAtk 873, critRate 19, critDmg 90, dmgBonus 60, baseHp 8374
    // + 山大王 4set: critDmg +30
    agent: {
      ...ZERO_AGENT,
      baseAtk: 873,
      critRate: 19,
      critDmg: 90 + 30,    // 120
      dmgBonus: 60,
      baseHp: 8374,
    },
    // 青溟笼舍 S5: baseAtk 743, critRate 32, dmgBonus 25.6, hpPct 30, ppDmgBonus 16
    weapon: {
      ...ZERO_WEAPON,
      baseAtk: 743,
      critRate: 32,
      dmgBonus: 25.6,
      hpPct: 30,
      ppDmgBonus: 16,
    },
    set4: { critDmg: 30 },
    field: { ...ZERO_FIELD, inCombatHpPct: 0 },
    boss: { defBase: 953, defBonus: 0, dazeBase: 150, res: 0, weak: true },
    skill: { multiplier: 200, slot4Type: 'critDmg', smallAtkCount: 0, smallPenCount: 0 },
    extraStats: { hpPct: 30, critRate: 12, critDmg: 24 },
  },

  // -----------------------------------------------------------------
  // 3. anomaly — 简 + 飞鸟星梦 S5 + 激素朋克 (set4)，异常爆发
  // -----------------------------------------------------------------
  {
    name: 'anomaly/简 + 飞鸟星梦 S5 + 激素朋克 / 异常爆发',
    battleType: 'anomaly',
    // 简: baseAtk 881, critRate 5, critDmg 50, anomalyMastery 112
    // + 激素朋克 4set: atkPct +10, inCombatAtkPct +25
    agent: {
      ...ZERO_AGENT,
      baseAtk: 881,
      critRate: 5,
      critDmg: 50,
      anomalyMastery: 112,
      atkPct: 0 + 10,
      inCombatAtkPct: 0 + 25,
    },
    // 飞鸟星梦 S5: baseAtk 714, anomalyMastery 122
    weapon: {
      ...ZERO_WEAPON,
      baseAtk: 714,
      anomalyMastery: 122,
    },
    set4: { atkPct: 10, inCombatAtkPct: 25 },
    field: { ...ZERO_FIELD, anomalyMastery: 30 }, // simulate a 2-set anomalyMastery buff
    boss: { defBase: 953, defBonus: 0, dazeBase: 100, res: 0, weak: false },
    skill: {
      multiplier: 712,            // 简紊乱触发倍率（示例）
      slot4Type: 'anomalyMastery',
      slot6AnomalyType: 'anomalyMastery',
      smallAtkCount: 0,
      smallPenCount: 0,
    },
    extraStats: { anomalyMastery: 90, atkPct: 30 },
  },

  // -----------------------------------------------------------------
  // 4. attack — 极端副词条 / 45CR + 45CD / 验证暴击上限钳制
  // -----------------------------------------------------------------
  {
    name: 'attack/艾莲·乔Ⅵ + 心弦夜响 S5 / 极端 CR + CD / 验证暴击上限',
    battleType: 'attack',
    // 艾莲·乔Ⅵ: baseAtk 938, critRate 19, critDmg 198, dmgBonus 30, resShred 10
    agent: {
      ...ZERO_AGENT,
      baseAtk: 938,
      critRate: 19,
      critDmg: 198,
      dmgBonus: 30,
      resShred: 10,
    },
    // 心弦夜响 S5: baseAtk 713, critRate 24, critDmg 80, resShred 40
    weapon: {
      ...ZERO_WEAPON,
      baseAtk: 713,
      critRate: 24,
      critDmg: 80,
      resShred: 40,
    },
    set4: {},
    field: { ...ZERO_FIELD, critRate: 12 },
    boss: { defBase: 953, defBonus: 20, dazeBase: 120, res: 0.2, weak: false },
    skill: { multiplier: 100, slot4Type: 'critRate', smallAtkCount: 6, smallPenCount: 0 },
    extraStats: {
      critRate: 45,      // 极端 CR 堆叠 (将 totalCR 推过 100 → 被 Math.min 钳制)
      critDmg: 45,
      atkPct: 30,
      slot5_Dmg: 30,
      slot5_AtkPct: 0,
    },
  },

  // -----------------------------------------------------------------
  // 5. anomaly — 弱点 + 减抗满 / 边界值
  // -----------------------------------------------------------------
  {
    name: 'anomaly/格莉丝 + 飞鸟星梦 S5 / 弱点 + 减抗 / 边界值',
    battleType: 'anomaly',
    // 格莉丝: baseAtk 881, critRate 5, critDmg 50, anomalyMastery 116
    agent: {
      ...ZERO_AGENT,
      baseAtk: 881,
      critRate: 5,
      critDmg: 50,
      anomalyMastery: 116,
      resShred: 20,
    },
    weapon: {
      ...ZERO_WEAPON,
      baseAtk: 714,
      anomalyMastery: 122,
    },
    set4: {},
    field: { ...ZERO_FIELD, resShred: 20, anomalyMastery: 45, defShred: 20 },
    boss: { defBase: 953, defBonus: 0, dazeBase: 100, res: 0, weak: true },
    skill: { multiplier: 500, slot4Type: 'anomalyMastery', smallAtkCount: 0, smallPenCount: 0 },
    extraStats: { anomalyMastery: 120, atkPct: 60 },
  },
];
