// src/calc/discSets.ts
// DISC 4-set + 2-set bonus catalogue, migrated verbatim from
// legacy/index-legacy.html lines 513-576.
//
// Data source: zzz.nanoka.cc/equipment.json (v3.0.3+15825894)
// - Pre-existing 8 sets (canglang/moon/mountain/ruying/jisu/hetun/yunkui/jiayin)
//   keep their original `stats` values to stay compatible with old presets;
//   some of those values already bake in the 2-piece bonus.
// - The 18 newer sets only encode the 4-piece bonus and must be paired with
//   DISC_2_SETS to get the full effective stats.
// - Skipped: 33900 呼啸沙龙、34000 拂晓行纪 (carry a (Test1) un-released tag).

export interface DiscSet {
  /** Optional in-game equipment id (matches nanoka.cc / hakush). */
  id?: number;
  /** Display name (Chinese). */
  name: string;
  /** Aggregated stat bonus. Keys mirror the agent/weapon stat namespace. */
  stats: Record<string, number>;
  /** Free-text designer note describing conditional / unmodelled effects. */
  note?: string;
}

/** Internal-key → Suit*.png filename mapping for UI thumbnails. */
export const SUIT_ART: Record<string, string> = {
  canglang:     'SuitWhiteWaterBallad.png',
  moon:         'SuitMoonlightLullaby.png',
  mountain:     'SuitKingoftheSummit.png',
  ruying:       'SuitShadow.png',
  jisu:         'SuitHormonePunk.png',
  hetun:        'SuitPufferElectro.png',
  yunkui:       'SuitYunkuiTales.png',
  jiayin:       'SuitAstralVoice.png',
  woodpecker:   'SuitWoodpeckerElectro.png',
  zhenxing:     'SuitShockstarDisco.png',
  ziyou:        'SuitFreedomBlues.png',
  linghun:      'SuitSoulRock.png',
  yaoba:        'SuitSwingJazz.png',
  hunduo:       'SuitChaosJazz.png',
  yuanshi:      'SuitProtoPunk.png',
  yanyujinshu:  'SuitInfernoMetal.png',
  hunduojinshu: 'SuitChaosMetal.png',
  leibao:       'SuitThunderMetal.png',
  jidi:         'SuitPolarMetal.png',
  liaoya:       'SuitFangedMetal.png',
  zhezhi:       'SuitBranch&BladeSong.png',
  faedun:       'SuitSavior.png',
  fuxiao:       'SuitDawnsBloom.png',
  liuguang:     'SuitShiningAria.png',
  xuetu:        'SuitBunnyinWonderland.png',
  qiutu:        'SuitNotesFromtheChained.png',
};

export const DISC_4_SETS: Record<string, DiscSet> = {
  none:         { name: '-- 无套装 --', stats: {} },
  // 现有 8 套（值不变）
  canglang:     { id: 33500, name: '沧浪行歌',     stats: { dmgBonus: 10, critRate: 20, inCombatAtkPct: 10 } },
  moon:         { id: 33400, name: '月光骑士颂',   stats: { dmgBonus: 18 } },
  mountain:     { id: 33200, name: '山大王',       stats: { critDmg: 30 } },
  ruying:       { id: 32900, name: '如影相随',     stats: { dmgBonus: 15, critRate: 12, inCombatAtkPct: 12 } },
  jisu:         { id: 31400, name: '激素朋克',     stats: { atkPct: 10, inCombatAtkPct: 25 } },
  hetun:        { id: 31100, name: '河豚电音',     stats: { penRatio: 8, inCombatAtkPct: 15 } },
  yunkui:       { id: 33100, name: '云岿如我',     stats: { hpPct: 10, critRate: 12, ppDmgBonus: 10 } },
  jiayin:       { id: 32800, name: '静听嘉音',     stats: { dmgBonus: 24 } },
  // 新增 18 套（满层等效，仅 4件套部分）
  woodpecker:   { id: 31000, name: '啄木鸟电音',   stats: { inCombatAtkPct: 27 },                       note: '普攻/闪反/强化特殊技命中暴击各给 1 层(共3层)：攻击+9%/层 (6s)' },
  zhenxing:     { id: 31200, name: '震星迪斯科',   stats: {},                                           note: '普攻/冲刺/闪反对主目标失衡值+20% — 暂无对应字段' },
  ziyou:        { id: 31300, name: '自由蓝调',     stats: {},                                           note: '强化特殊技命中时按装备者属性使目标对应异常积蓄抗性-20% (8s)' },
  linghun:      { id: 31500, name: '灵魂摇滚',     stats: {},                                           note: '受击且损失生命时受到伤害-40% (2.5s)' },
  yaoba:        { id: 31600, name: '摇摆爵士',     stats: { dmgBonus: 15 },                             note: '连携/终结时全队伤害+15% (12s)，同名不可叠加' },
  hunduo:       { id: 31800, name: '混沌爵士',     stats: { dmgBonus: 15 },                             note: '火电属性伤害+15%；后场强化/支援额外+20%(换前场后保留 5s)' },
  yuanshi:      { id: 31900, name: '原始朋克',     stats: { dmgBonus: 15 },                             note: '队伍招架/回避支援时全队伤害+15% (10s)' },
  yanyujinshu:  { id: 32200, name: '炎狱重金属',   stats: { critRate: 28 },                             note: '命中灼烧敌人时暴击+28% (8s)' },
  hunduojinshu: { id: 32300, name: '混沌重金属',   stats: { critDmg: 53 },                              note: '爆伤+20%，队友触发[侵蚀]时再+5.5%/层(最多6层) (8s) → 满层 53%' },
  leibao:       { id: 32400, name: '雷暴重金属',   stats: { inCombatAtkPct: 28 },                       note: '场上有感电敌人时装备者攻击+28%' },
  jidi:         { id: 32500, name: '极地重金属',   stats: { dmgBonus: 40 },                             note: '普攻/冲刺伤害+20%，队伍冻结/碎冰时再+20% (12s)' },
  liaoya:       { id: 32600, name: '獠牙重金属',   stats: { dmgBonus: 35 },                             note: '队伍对敌施加[强击]时对目标伤害+35% (12s)' },
  zhezhi:       { id: 32700, name: '折枝剑歌',     stats: { critDmg: 30, critRate: 12 },                note: '异常掌控≥115时爆伤+30%；冻结/碎冰时暴击+12% (15s)' },
  faedun:       { id: 33000, name: '法厄同之歌',   stats: { anomalyMastery: 45, dmgBonus: 25 },         note: '队伍强化特殊技时异常精通+45 (8s)；非自己发动时以太伤害+25%' },
  fuxiao:       { id: 33300, name: '拂晓生花',     stats: { dmgBonus: 40 },                             note: '普攻伤害+20%；强攻角色发动强化/终结时普攻再+20% (25s)' },
  liuguang:     { id: 33600, name: '流光咏叹',     stats: { anomalyMastery: 36, dmgBonus: 25 },         note: '普攻命中时异常精通+36 (8s)；场上有失衡敌人时伤害+25% (18s)' },
  xuetu:        { id: 33700, name: '雪兔梦游仙境', stats: { dmgBonus: 18 },                             note: '限防护角色：发动强化/招架/回避时全队伤害+6%/层(3层) (25s)' },
  qiutu:        { id: 33800, name: '囚徒手记',     stats: { anomalyMastery: 48, dmgBonus: 16 },         note: '触发[异放]时异常精通+48 (30s)；触发[冻结]时异常/紊乱伤害+16% (30s)' },
};

// DISC 2-set bonuses — pair-wise sibling of DISC_4_SETS.
// anomalyCtrl is reserved for future use; the current calc layer has no
// dedicated field, so a few entries deliberately leave `stats` empty.
export const DISC_2_SETS: Record<string, DiscSet> = {
  none:         { id: 0,     name: '-- 无套装 --', stats: {} },
  woodpecker:   { id: 31000, name: '啄木鸟电音',   stats: { critRate: 8 } },
  hetun:        { id: 31100, name: '河豚电音',     stats: { penRatio: 8 } },
  zhenxing:     { id: 31200, name: '震星迪斯科',   stats: {} /* 冲击力+6% */ },
  ziyou:        { id: 31300, name: '自由蓝调',     stats: { anomalyMastery: 30 } },
  jisu:         { id: 31400, name: '激素朋克',     stats: { atkPct: 10 } },
  linghun:      { id: 31500, name: '灵魂摇滚',     stats: {} /* 防御+16% */ },
  yaoba:        { id: 31600, name: '摇摆爵士',     stats: {} /* 能量自动回复+20% */ },
  hunduo:       { id: 31800, name: '混沌爵士',     stats: { anomalyMastery: 30 } },
  yuanshi:      { id: 31900, name: '原始朋克',     stats: {} /* 施加护盾+15% */ },
  yanyujinshu:  { id: 32200, name: '炎狱重金属',   stats: { dmgBonus: 10 } /* 火伤 */ },
  hunduojinshu: { id: 32300, name: '混沌重金属',   stats: { dmgBonus: 10 } /* 以太伤 */ },
  leibao:       { id: 32400, name: '雷暴重金属',   stats: { dmgBonus: 10 } /* 电伤 */ },
  jidi:         { id: 32500, name: '极地重金属',   stats: { dmgBonus: 10 } /* 冰伤 */ },
  liaoya:       { id: 32600, name: '獠牙重金属',   stats: { dmgBonus: 10 } /* 物伤 */ },
  zhezhi:       { id: 32700, name: '折枝剑歌',     stats: { critDmg: 16 } },
  jiayin:       { id: 32800, name: '静听嘉音',     stats: { atkPct: 10 } },
  ruying:       { id: 32900, name: '如影相随',     stats: { dmgBonus: 15 } /* 追加/冲刺 */ },
  faedun:       { id: 33000, name: '法厄同之歌',   stats: { /* 异常掌控+8% — anomalyCtrl: 8 */ } },
  yunkui:       { id: 33100, name: '云岿如我',     stats: { hpPct: 10 } },
  mountain:     { id: 33200, name: '山大王',       stats: {} /* 攻击造成的失衡值+6% */ },
  fuxiao:       { id: 33300, name: '拂晓生花',     stats: { dmgBonus: 15 } /* 普攻 */ },
  moon:         { id: 33400, name: '月光骑士颂',   stats: {} /* 能量自动回复+20% */ },
  canglang:     { id: 33500, name: '沧浪行歌',     stats: { dmgBonus: 10 } /* 物伤 */ },
  liuguang:     { id: 33600, name: '流光咏叹',     stats: { dmgBonus: 10 } /* 以太伤 */ },
  xuetu:        { id: 33700, name: '雪兔梦游仙境', stats: { hpPct: 10 } },
  qiutu:        { id: 33800, name: '囚徒手记',     stats: { dmgBonus: 10 } /* 冰伤 */ },
};
