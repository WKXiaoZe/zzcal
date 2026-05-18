/**
 * ZZZ 角色数据库
 * 
 * characters: 所有角色（含CSV元数据 + 战斗数据）
 *   - meta: { element, type, faction, teamPassive }
 *   - 战斗数据: 数组 [Base, C1, C2, C4, C6] 或 纯数字（仅Base）
 *   - 现有角色保留完整影画数据，新角色仅填写Base
 * 
 * sup: 辅助BUFF预设（提供给主C的BUFF，非角色自身属性）
 */
const CHARACTER_DB = {
    characters: {
        // ============================================================
        //  强攻 (Attack) — DPS dropdown in attack mode
        // ============================================================

        // --- 现有角色（含影画数据）---

        "悠真Ⅵ": {
            meta: { element: "电", type: "强攻", faction: "对空洞特别行动部第六课", teamPassive: "击破|异常" },
            baseAtk: [916, 0, 0, 0, 0], critRate: [44, 0, 0, 0, 0], critDmg: [122, 0, 0, 40, 0],
            dmgBonus: [40, 0, 50, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 12, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [15, 0, 0, 0, 15],
            inCombatAtkPct: [12, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "叶瞬光": {
            meta: { element: "", type: "强攻", faction: "", teamPassive: "" },
            baseAtk: [938, 0, 0, 0, 0], critRate: [49, 0, 0, 0, 0], critDmg: [50, 0, 0, 0, 0],
            dmgBonus: [25, 10, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 20, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "11号Ⅵ": {
            meta: { element: "火", type: "强攻", faction: "奥伯勒斯小队", teamPassive: "同属性|同阵营" },
            baseAtk: [889, 0, 0, 0, 0], critRate: [19, 0, 0, 0, 0], critDmg: [98, 0, 0, 0, 0],
            dmgBonus: [80, 0, 36, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 0, 0, 25],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "零号安比Ⅵ": {
            meta: { element: "电", type: "强攻", faction: "新艾利都防卫军", teamPassive: "击破|支援" },
            baseAtk: [930, 0, 0, 0, 0], critRate: [29, 0, 12, 0, 0], critDmg: [50, 0, 0, 0, 0],
            dmgBonus: [75, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 0, 12, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "艾莲·乔Ⅵ": {
            meta: { element: "冰", type: "强攻", faction: "维多利亚家政", teamPassive: "同属性|同阵营" },
            baseAtk: [938, 0, 0, 0, 0], critRate: [19, 12, 0, 0, 0], critDmg: [198, 0, 0, 0, 0],
            dmgBonus: [30, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 20], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [10, 0, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "伊芙琳": {
            meta: { element: "火", type: "强攻", faction: "天琴座", teamPassive: "击破|支援" },
            baseAtk: [930, 0, 0, 0, 0], critRate: [44, 0, 0, 0, 0], critDmg: [50, 0, 0, 40, 0],
            dmgBonus: [30, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 20], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 12, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 0, 0, 0],
            inCombatAtkPct: [0, 0, 15, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "奥菲丝": {
            meta: { element: "", type: "强攻", faction: "", teamPassive: "" },
            baseAtk: [929, 0, 0, 0, 0], critRate: [30, 0, 0, 0, 0], critDmg: [50, 0, 0, 0, 0],
            dmgBonus: [85, 20, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [25, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 15, 0, 0, 0],
            inCombatAtkPct: [0, 0, 20, 0, 0], inCombatAtkFlat: [700, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },

        // --- 新增强攻角色（仅Base）---

        "猫又": {
            meta: { element: "物理", type: "强攻", faction: "狡兔屋", teamPassive: "同属性|同阵营" },
            baseAtk: 911, critRate: 19, critDmg: 50, baseHp: 7562, anomalyMastery: 96
        },
        "可琳": {
            meta: { element: "物理", type: "强攻", faction: "维多利亚家政", teamPassive: "同属性|同阵营" },
            baseAtk: 807, critRate: 5, critDmg: 79, baseHp: 6976, anomalyMastery: 94
        },
        "比利": {
            meta: { element: "物理", type: "强攻", faction: "狡兔屋", teamPassive: "同属性|同阵营" },
            baseAtk: 787, critRate: 19, critDmg: 50, baseHp: 6910, anomalyMastery: 91
        },
        "安东": {
            meta: { element: "电", type: "强攻", faction: "白祇重工", teamPassive: "同属性|同阵营" },
            baseAtk: 792, critRate: 19, critDmg: 50, baseHp: 7221, anomalyMastery: 90
        },
        "朱鸢": {
            meta: { element: "以太", type: "强攻", faction: "刑侦特勤组", teamPassive: "支援|同阵营" },
            baseAtk: 919, critRate: 5, critDmg: 79, baseHp: 7482, anomalyMastery: 102
        },
        "雨果": {
            meta: { element: "冰", type: "强攻", faction: "反舌鸟", teamPassive: "击破|同属性" },
            baseAtk: 919, critRate: 19, critDmg: 50, baseHp: 7941, anomalyMastery: 90
        },
        "席德": {
            meta: { element: "电", type: "强攻", faction: "新艾利都防卫军", teamPassive: "强攻" },
            baseAtk: 855, critRate: 5, critDmg: 79, baseHp: 7674, anomalyMastery: 93
        },
        "希希芙": {
            meta: { element: "电", type: "强攻", faction: "新艾利都治安局", teamPassive: "击破|同属性" },
            baseAtk: [938, 0, 0, 0, 0], critRate: [5, 0, 0, 0, 0], critDmg: [100, 0, 0, 0, 0],
            dmgBonus: [0, 0, 35, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [6, 2, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 5, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [7673, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [94, 0, 0, 0, 0]
        },

        // ============================================================
        //  命破 (Break) — DPS dropdown in break mode
        // ============================================================

        "仪玄": {
            meta: { element: "以太", type: "命破", faction: "云岿山", teamPassive: "击破|支援|防护" },
            baseAtk: [873, 0, 0, 0, 0], critRate: [19, 10, 0, 0, 0], critDmg: [90, 0, 0, 0, 0],
            dmgBonus: [60, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 15, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [8374, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "伊德海莉": {
            meta: { element: "冰", type: "命破", faction: "怪啖屋", teamPassive: "击破|支援" },
            baseAtk: [859, 0, 0, 0, 0], critRate: [19, 0, 0, 0, 0], critDmg: [80, 0, 40, 0, 0],
            dmgBonus: [60, 0, 0, 0, 25], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 20, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [8497, 0, 0, 0, 0], hpPct: [0, 0, 0, 5, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [87, 0, 0, 0, 0]
        },
        "真斗": {
            meta: { element: "火", type: "命破", faction: "怪啖屋", teamPassive: "支援|击破" },
            baseAtk: [755, 0, 0, 0, 0], critRate: [15, 0, 0, 0, 0], critDmg: [50, 0, 0, 0, 0],
            dmgBonus: [20, 20, 0, 0, 15], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 8, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [7724, 0, 0, 0, 0], hpPct: [0, 0, 0, 8, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [87, 0, 0, 0, 0]
        },
        "般岳": {
            meta: { element: "火", type: "命破", faction: "坎卜斯黑枝", teamPassive: "支援|击破" },
            baseAtk: [859, 0, 0, 0, 0], critRate: [19, 0, 0, 0, 0], critDmg: [86, 0, 15, 0, 0],
            dmgBonus: [51, 10, 15, 30, 24], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 10, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [8497, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [300, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [90, 0, 0, 0, 0]
        },
        "星徽·比利": {
            meta: { element: "物理", type: "命破", faction: "狡兔屋", teamPassive: "击破|防护|支援" },
            baseAtk: [859, 0, 0, 0, 0], critRate: [19, 0, 0, 0, 0], critDmg: [140, 0, 0, 16, 0],
            dmgBonus: [40, 0, 50, 0, 18], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 18, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [8497, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [90, 0, 0, 0, 0]
        },

        // ============================================================
        //  异常 (Anomaly) — DPS dropdown in anomaly mode
        // ============================================================

        "格莉丝Ⅵ": {
            meta: { element: "电", type: "异常", faction: "白祇重工", teamPassive: "同属性|同阵营" },
            baseAtk: 881, critRate: 5, critDmg: 50, baseHp: 7674, anomalyMastery: 116
        },
        "派派": {
            meta: { element: "物理", type: "异常", faction: "卡吕冬之子", teamPassive: "同属性|同阵营" },
            baseAtk: 758, critRate: 5, critDmg: 50, baseHp: 6976, anomalyMastery: 118
        },
        "简": {
            meta: { element: "物理", type: "异常", faction: "刑侦特勤组", teamPassive: "异常|同阵营" },
            baseAtk: 881, critRate: 5, critDmg: 50, baseHp: 7789, anomalyMastery: 112
        },
        "柏妮思Ⅵ": {
            meta: { element: "火", type: "异常", faction: "卡吕冬之子", teamPassive: "异常|同阵营" },
            baseAtk: 863, critRate: 5, critDmg: 50, baseHp: 7368, anomalyMastery: 120
        },
        "柳": {
            meta: { element: "电", type: "异常", faction: "对空洞特别行动部第六课", teamPassive: "异常|同属性" },
            baseAtk: 873, critRate: 5, critDmg: 50, baseHp: 7789, anomalyMastery: 114
        },
        "雅": {
            meta: { element: "冰", type: "异常", faction: "对空洞特别行动部第六课", teamPassive: "支援|同阵营" },
            baseAtk: 881, critRate: 5, critDmg: 50, baseHp: 7674, anomalyMastery: 238
        },
        "薇薇安": {
            meta: { element: "以太", type: "异常", faction: "反舌鸟", teamPassive: "异常|同属性" },
            baseAtk: 881, critRate: 5, critDmg: 50, baseHp: 7674, anomalyMastery: 118
        },
        "爱丽丝": {
            meta: { element: "物理", type: "异常", faction: "怪啖屋", teamPassive: "异常|支援" },
            baseAtk: 806, critRate: 5, critDmg: 50, baseHp: 7674, anomalyMastery: 118
        },
        "爱芮": {
            meta: { element: "以太", type: "异常", faction: "妄想天使", teamPassive: "击破|支援|同阵营" },
            baseAtk: [863, 0, 0, 0, 0], critRate: [5, 0, 0, 0, 0], critDmg: [50, 0, 0, 0, 0],
            dmgBonus: [0, 0, 0, 0, 40], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 24, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [7749, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [205, 0, 0, 0, 0]
        },
        "普罗米娅": {
            meta: { element: "冰", type: "异常", faction: "坎卜斯黑枝", teamPassive: "异常|支援" },
            baseAtk: [872, 0, 0, 0, 0], critRate: [5, 0, 0, 0, 0], critDmg: [50, 0, 0, 0, 0],
            dmgBonus: [0, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 0, 0, 15],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [7788, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [112, 0, 40, 0, 0]
        },

        // ============================================================
        //  击破 (Stun) — SUP类，存储基础信息
        // ============================================================

        "安比": {
            meta: { element: "电", type: "击破", faction: "狡兔屋", teamPassive: "同属性|同阵营" },
            baseAtk: 659, critRate: 5, critDmg: 50, baseHp: 7498, anomalyMastery: 93
        },
        "珂蕾妲": {
            meta: { element: "火", type: "击破", faction: "白祇重工", teamPassive: "同属性|同阵营" },
            baseAtk: 736, critRate: 5, critDmg: 50, baseHp: 8128, anomalyMastery: 96
        },
        "莱卡恩Ⅵ": {
            meta: { element: "冰", type: "击破", faction: "维多利亚家政", teamPassive: "同属性|同阵营" },
            baseAtk: 729, critRate: 5, critDmg: 50, baseHp: 8415, anomalyMastery: 90
        },
        "青衣": {
            meta: { element: "电", type: "击破", faction: "刑侦特勤组", teamPassive: "强攻|同阵营" },
            baseAtk: 758, critRate: 5, critDmg: 50, baseHp: 8251, anomalyMastery: 94
        },
        "莱特": {
            meta: { element: "火", type: "击破", faction: "卡吕冬之子", teamPassive: "强攻|同阵营" },
            baseAtk: 798, critRate: 5, critDmg: 50, baseHp: 8253, anomalyMastery: 90
        },
        "扳机": {
            meta: { element: "电", type: "击破", faction: "新艾利都防卫军", teamPassive: "强攻|同属性" },
            baseAtk: 751, critRate: 5, critDmg: 50, baseHp: 7923, anomalyMastery: 95
        },
        "波可娜": {
            meta: { element: "物理", type: "击破", faction: "卡吕冬之子", teamPassive: "强攻|同阵营" },
            baseAtk: 666, critRate: 5, critDmg: 50, baseHp: 7613, anomalyMastery: 90
        },
        "橘福福": {
            meta: { element: "火", type: "击破", faction: "云岿山", teamPassive: "强攻|命破" },
            baseAtk: 766, critRate: 19, critDmg: 50, baseHp: 8251, anomalyMastery: 96
        },
        "南宫羽": {
            meta: { element: "以太", type: "击破", faction: "妄想天使", teamPassive: "异常|同阵营" },
            baseAtk: [746, 0, 0, 0, 0], critRate: [5, 0, 0, 0, 0], critDmg: [50, 0, 0, 0, 0],
            dmgBonus: [25, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [30, 0, 30, 0, 0], resShred: [0, 18, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [8373, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [210, 0, 0, 40, 0]
        },
        "琉音": {
            meta: { element: "物理", type: "击破", faction: "坎卜斯黑枝", teamPassive: "强攻|命破" },
            baseAtk: [758, 0, 0, 0, 0], critRate: [19, 0, 0, 0, 0], critDmg: [100, 0, 0, 0, 0],
            dmgBonus: [40, 0, 15, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [30, 0, 20, 0, 0], resShred: [0, 15, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 500, 0],
            baseHp: [8250, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [94, 0, 0, 0, 0]
        },

        // ============================================================
        //  支援 (Support)
        // ============================================================

        "妮可": {
            meta: { element: "以太", type: "支援", faction: "狡兔屋", teamPassive: "同属性|同阵营" },
            baseAtk: 649, critRate: 5, critDmg: 50, baseHp: 8147, anomalyMastery: 93
        },
        "苍角": {
            meta: { element: "冰", type: "支援", faction: "对空洞特别行动部第六课", teamPassive: "同属性|同阵营" },
            baseAtk: 665, critRate: 5, critDmg: 50, baseHp: 8027, anomalyMastery: 96
        },
        "丽娜": {
            meta: { element: "电", type: "支援", faction: "维多利亚家政", teamPassive: "同属性|同阵营" },
            baseAtk: 717, critRate: 5, critDmg: 50, baseHp: 8607, penRatio: 14, anomalyMastery: 92
        },
        "露西": {
            meta: { element: "火", type: "支援", faction: "卡吕冬之子", teamPassive: "同属性|同阵营" },
            baseAtk: 659, critRate: 5, critDmg: 50, baseHp: 7974, anomalyMastery: 93
        },
        "耀嘉音": {
            meta: { element: "以太", type: "支援", faction: "天琴座", teamPassive: "强攻|异常" },
            baseAtk: 716, critRate: 5, critDmg: 50, baseHp: 8609, anomalyMastery: 92
        },
        "柚叶": {
            meta: { element: "物理", type: "支援", faction: "怪啖屋", teamPassive: "异常|同阵营" },
            baseAtk: 683, critRate: 5, critDmg: 50, baseHp: 8829, anomalyMastery: 93
        },
        "卢西娅": {
            meta: { element: "以太", type: "支援", faction: "怪啖屋", teamPassive: "命破|击破" },
            baseAtk: [758, 0, 0, 0, 0], critRate: [5, 0, 0, 0, 0], critDmg: [80, 0, 0, 0, 30],
            dmgBonus: [20, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 18, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [8477, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [5, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [96, 0, 0, 0, 0]
        },
        "千夏": {
            meta: { element: "物理", type: "支援", faction: "妄想天使", teamPassive: "强攻|同阵营" },
            baseAtk: [750, 0, 0, 0, 0], critRate: [5, 0, 0, 0, 0], critDmg: [50, 0, 0, 0, 50],
            dmgBonus: [0, 0, 0, 15, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 18, 0, 0, 0], dazeVuln: [30, 0, 0, 0, 0], resShred: [0, 0, 0, 0, 0],
            inCombatAtkPct: [0, 0, 10, 0, 0], inCombatAtkFlat: [1100, 0, 0, 0, 0],
            baseHp: [8477, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [96, 0, 0, 0, 0]
        },

        // ============================================================
        //  防护 (Defense)
        // ============================================================

        "本": {
            meta: { element: "火", type: "防护", faction: "白祇重工", teamPassive: "同属性|同阵营" },
            baseAtk: 867, critRate: 5, critDmg: 50, baseHp: 8578, anomalyMastery: 90
        },
        "赛斯": {
            meta: { element: "电", type: "防护", faction: "刑侦特勤组", teamPassive: "同属性|同阵营" },
            baseAtk: 643, critRate: 5, critDmg: 50, baseHp: 8701, anomalyMastery: 86
        },
        "凯撒": {
            meta: { element: "物理", type: "防护", faction: "卡吕冬之子", teamPassive: "招架|同阵营" },
            baseAtk: 712, critRate: 5, critDmg: 50, baseHp: 9526, anomalyMastery: 90
        },
        "潘引壶": {
            meta: { element: "物理", type: "防护", faction: "云岿山", teamPassive: "命破|同阵营" },
            baseAtk: 662, critRate: 5, critDmg: 50, baseHp: 8454, anomalyMastery: 90
        },
        "照": {
            meta: { element: "冰", type: "防护", faction: "坎卜斯黑枝", teamPassive: "强攻|异常|支援" },
            baseAtk: [765, 0, 0, 0, 0], critRate: [5, 0, 0, 0, 0], critDmg: [50, 0, 0, 40, 0],
            dmgBonus: [40, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 15, 0, 0, 0],
            inCombatAtkPct: [0, 0, 20, 0, 0], inCombatAtkFlat: [1000, 0, 0, 0, 0],
            baseHp: [9117, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [5, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [93, 0, 0, 0, 0]
        }
    },

    // ================================================================
    //  SUP BUFF 预设（提供给主C的BUFF数据，非角色自身属性）
    //  暂不改动
    // ================================================================
    sup: {
        "琉音": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [0, 0, 0, 0, 0],
            dmgBonus: [40, 0, 15, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [30, 0, 20, 0, 0], resShred: [0, 15, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "照": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [0, 0, 0, 0, 0],
            dmgBonus: [40, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 15, 0, 0, 0],
            inCombatAtkPct: [0, 0, 15, 0, 0], inCombatAtkFlat: [1000, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "耀嘉音-辅助": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [25, 0, 0, 0, 0],
            dmgBonus: [20, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 18, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [1200, 0, 400, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "莱特-辅助": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [0, 0, 0, 0, 0],
            dmgBonus: [75, 0, 15, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 25, 0, 0], resShred: [15, 10, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "青衣-辅助": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 20, 0, 0, 0], critDmg: [0, 0, 0, 0, 0],
            dmgBonus: [0, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 15, 0, 0, 0], dazeVuln: [80, 0, 28, 0, 0], resShred: [0, 0, 0, 0, 20],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "奥菲斯-辅助": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [0, 0, 0, 0, 0],
            dmgBonus: [0, 20, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [25, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 0, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [700, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "千夏": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [0, 0, 0, 0, 0],
            dmgBonus: [0, 0, 0, 15, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 18, 0, 0, 0], dazeVuln: [30, 0, 0, 0, 0], resShred: [0, 0, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [1100, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "扳机-辅助": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [0, 0, 24, 0, 0],
            dmgBonus: [0, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [35, 20, 0, 0, 0], resShred: [0, 0, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "卢西娅": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [30, 0, 0, 0, 0],
            dmgBonus: [20, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [0, 0, 0, 0, 0], resShred: [0, 18, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [5, 0, 0, 0, 0], inCombatPen: [900, 0, 0, 0, 0], ppDmgBonus: [0, 0, 15, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        },
        "南宫羽-辅助": {
            baseAtk: [0, 0, 0, 0, 0], critRate: [0, 0, 0, 0, 0], critDmg: [0, 0, 0, 0, 0],
            dmgBonus: [25, 0, 0, 0, 0], penRatio: [0, 0, 0, 0, 0], penValue: [0, 0, 0, 0, 0],
            defShred: [0, 0, 0, 0, 0], dazeVuln: [30, 0, 30, 0, 0], resShred: [0, 18, 0, 0, 0],
            inCombatAtkPct: [0, 0, 0, 0, 0], inCombatAtkFlat: [0, 0, 0, 0, 0],
            baseHp: [0, 0, 0, 0, 0], hpPct: [0, 0, 0, 0, 0], flatHp: [0, 0, 0, 0, 0],
            inCombatHpPct: [0, 0, 0, 0, 0], inCombatPen: [0, 0, 0, 0, 0], ppDmgBonus: [0, 0, 0, 0, 0],
            anomalyMastery: [0, 0, 0, 0, 0]
        }
    }
};
