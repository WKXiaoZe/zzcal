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

/** Coarse role tag — used by the picker UI to split the list into two
 *  panes. Not used by calc. Judgment based on the set's primary purpose
 *  (offensive vs team-buff/defensive). Easy to tweak. */
export type DiscRole = 'dps' | 'sup';
export const DISC_ROLE: Record<string, DiscRole> = {
  // DPS
  woodpecker:   'dps',
  hetun:        'dps',
  zhenxing:     'dps',
  ziyou:        'dps',
  hunduo:       'dps',
  yanyujinshu:  'dps',
  hunduojinshu: 'dps',
  leibao:       'dps',
  jidi:         'dps',
  liaoya:       'dps',
  zhezhi:       'dps',
  ruying:       'dps',
  faedun:       'dps',
  yunkui:       'dps',
  fuxiao:       'dps',
  canglang:     'dps',
  liuguang:     'dps',
  qiutu:        'dps',
  // SUP
  jisu:         'sup',
  linghun:      'sup',
  yaoba:        'sup',
  yuanshi:      'sup',
  jiayin:       'sup',
  mountain:     'sup',
  moon:         'sup',
  xuetu:        'sup',
};

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
  canglang:     { id: 33500, name: '沧浪行歌',     stats: { dmgBonus: 10, critRate: 20, inCombatAtkPct: 10 }, note: '装备者处于任意<color=#FFFFFF>[以太帷幕]</color>中时，自身暴击率提高10%，离开<color=#FFFFFF>[以太帷幕]</color>后，该增益效果仍然保留，持续15秒；装备者为<color=#FFFFFF>[强攻]</color>角色时，开启<color=#FFFFFF>[以太帷幕]</color>或延长<color=#FFFFFF>[以太帷幕]</color>的持续时间会使自身暴击率提升10%和攻击力提升10%，持续30秒，重复触发时刷新持续时间。' },
  moon:         { id: 33400, name: '月光骑士颂',   stats: { dmgBonus: 18 }, note: '装备者为[支援]角色时，发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>会使全队角色造成的伤害提升18%，持续25秒，重复触发时刷新持续时间，同名被动效果之间不可叠加。' },
  mountain:     { id: 33200, name: '山大王',       stats: { critDmg: 30 }, note: '装备者为[击破]角色时，发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>会使全队角色暴击伤害提升15%，装备者的暴击率大于等于50%时暴击伤害额外提升15%，持续15秒，重复触发时刷新持续时间，同名被动效果之间不可叠加。' },
  ruying:       { id: 32900, name: '如影相随',     stats: { dmgBonus: 15, critRate: 12, inCombatAtkPct: 12 }, note: '<color=#FFFFFF>[追加攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中敌人时，若造成的伤害与装备者的属性一致，则获得1层增益效果，同一招式内最多触发一次；每拥有1层增益效果，装备者的攻击力提升4%，暴击率提升4%，最多叠加3层，持续15秒，重复触发时刷新持续时间。' },
  jisu:         { id: 31400, name: '激素朋克',     stats: { atkPct: 10, inCombatAtkPct: 25 }, note: '成为接战状态下的当前操作角色时，装备者的攻击力提升25%，持续10秒，20秒内最多触发一次。' },
  hetun:        { id: 31100, name: '河豚电音',     stats: { penRatio: 8, inCombatAtkPct: 15 }, note: '<color=#FFFFFF>[终结技]</color>造成的伤害提升20%；发动<color=#FFFFFF>[终结技]</color>时，装备者的攻击力提升15%，持续12秒。' },
  yunkui:       { id: 33100, name: '云岿如我',     stats: { hpPct: 10, critRate: 12, ppDmgBonus: 10 }, note: '发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，暴击率提升4%，最多叠加3层，持续15秒，重复触发时刷新持续时间，拥有3层效果时，造成的贯穿伤害提升10%。' },
  jiayin:       { id: 32800, name: '静听嘉音',     stats: { dmgBonus: 24 }, note: '队伍中任意角色通过<color=#FFFFFF>[快速支援]</color>入场时，全队角色获得1层<color=#FFFFFF>[嘉音]</color>，最多叠加3层，持续15秒，重复触发时刷新持续时间，每拥有1层<color=#FFFFFF>[嘉音]</color>，通过<color=#FFFFFF>[快速支援]</color>入场的角色造成的伤害提升8%，同名被动效果之间不可叠加。' },
  // 新增 18 套（满层等效，仅 4件套部分）
  woodpecker:   { id: 31000, name: '啄木鸟电音',   stats: { inCombatAtkPct: 27 }, note: '<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[强化特殊技]</color>命中敌人并触发暴击时，分别为装备者提供1层增益效果，每层增益效果使装备者的攻击力提升9%，持续6秒，不同招式分别结算持续时间。' },
  zhenxing:     { id: 31200, name: '震星迪斯科',   stats: {}, note: '<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>、<color=#FFFFFF>[闪避反击]</color>对主要攻击目标造成的失衡值提升20%。' },
  ziyou:        { id: 31300, name: '自由蓝调',     stats: {}, note: '<color=#FFFFFF>[强化特殊技]</color>命中敌人时，根据装备者的属性类型，使目标对应属性异常积蓄抗性降低20%，持续8秒，相同属性类型的效果不可叠加。' },
  linghun:      { id: 31500, name: '灵魂摇滚',     stats: {}, note: '受到敌方攻击并损失生命值时，装备者受到的伤害降低40%，持续2.5秒，15秒内最多触发一次。' },
  yaoba:        { id: 31600, name: '摇摆爵士',     stats: { dmgBonus: 15 }, note: '发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，全队角色造成的伤害提升15%，持续12秒，同名被动效果之间不可叠加。' },
  hunduo:       { id: 31800, name: '混沌爵士',     stats: { dmgBonus: 15 }, note: '<color=#FF5521>火属性伤害</color>和<color=#2EB6FF>电属性伤害</color>提升15%；位于后场时，<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[支援攻击]</color>造成的伤害提升20%，换入前场后，该增益效果仍然保留，持续5秒，保留效果7.5秒内最多触发一次。' },
  yuanshi:      { id: 31900, name: '原始朋克',     stats: { dmgBonus: 15 }, note: '队伍中任意角色发动<color=#FFFFFF>[招架支援]</color>或<color=#FFFFFF>[回避支援]</color>时，全队角色造成的伤害提升15%，持续10秒，同名被动效果之间不可叠加。' },
  yanyujinshu:  { id: 32200, name: '炎狱重金属',   stats: { critRate: 28 }, note: '攻击命中处于<color=#FF5521>[灼烧]</color>状态下的敌人时，装备者的暴击率提升28%，持续8秒。' },
  hunduojinshu: { id: 32300, name: '混沌重金属',   stats: { critDmg: 53 }, note: '装备者的暴击伤害提升20%，队伍中任意角色触发<color=#FE437E>[侵蚀]</color>效果的额外伤害时，该增益效果额外提升5.5%，最多叠加6层，持续8秒，重复触发时刷新持续时间。' },
  leibao:       { id: 32400, name: '雷暴重金属',   stats: { inCombatAtkPct: 28 }, note: '当场上存在处于<color=#2EB6FF>[感电]</color>状态下的敌人时，装备者的攻击力提升28%。' },
  jidi:         { id: 32500, name: '极地重金属',   stats: { dmgBonus: 40 }, note: '<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的伤害提升20%，队伍中任意角色对敌人施加<color=#98EFF0>[冻结]</color>或触发<color=#98EFF0>[碎冰]</color>效果时，该增益效果额外提升20%，持续12秒。' },
  liaoya:       { id: 32600, name: '獠牙重金属',   stats: { dmgBonus: 35 }, note: '队伍中任意角色对敌人施加<color=#F0D12B>[强击]</color>效果时，装备者对目标造成的伤害提升35%，持续12秒。' },
  zhezhi:       { id: 32700, name: '折枝剑歌',     stats: { critDmg: 30, critRate: 12 }, note: '异常掌控大于等于115点时，装备者的暴击伤害提升30%；队伍中任意角色对敌人施加<color=#98EFF0>[冻结]</color>或触发<color=#98EFF0>[碎冰]</color>效果时，装备者的暴击率提升12%，持续15秒。' },
  faedun:       { id: 33000, name: '法厄同之歌',   stats: { anomalyMastery: 45, dmgBonus: 25 }, note: '队伍中任意角色发动<color=#FFFFFF>[强化特殊技]</color>时，装备者的异常精通提升45点，持续8秒；如果发动<color=#FFFFFF>[强化特殊技]</color>的角色不是装备者本人时，装备者造成的<color=#FE437E>以太伤害</color>提升25%。' },
  fuxiao:       { id: 33300, name: '拂晓生花',     stats: { dmgBonus: 40 }, note: '<color=#FFFFFF>[普通攻击]</color>造成的伤害提升20%，装备者为[强攻]角色时，发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>会使<color=#FFFFFF>[普通攻击]</color>造成的伤害额外提升20%，持续25秒，重复触发时刷新持续时间。' },
  liuguang:     { id: 33600, name: '流光咏叹',     stats: { anomalyMastery: 36, dmgBonus: 25 }, note: '装备者发动<color=#FFFFFF>[普通攻击]</color>命中敌人时，自身异常精通提升36点，持续8秒，重复触发时刷新持续时间；当场上有敌人进入失衡状态时，装备者造成的伤害提升25%，持续18秒，重复触发时刷新持续时间。' },
  xuetu:        { id: 33700, name: '雪兔梦游仙境', stats: { dmgBonus: 18 }, note: '[防护]角色装备时：装备者发动<color=#FFFFFF>[强化特殊技]</color>或队伍中任意队友发动<color=#FFFFFF>[招架支援]</color>、<color=#FFFFFF>[回避支援]</color>时，全队角色造成伤害提升6%，最多叠加3层，持续25秒，层数逐层衰减，获得或者衰减时刷新持续时间，同名被动效果之间不可叠加。' },
  qiutu:        { id: 33800, name: '囚徒手记',     stats: { anomalyMastery: 48, dmgBonus: 16 }, note: '装备者触发<color=#FFFFFF>[异放]</color>时，装备者异常精通提升48点，持续30秒；重复触发时刷新持续时间；装备者触发<color=#FFFFFF>[冻结]</color>效果时，装备者造成的所有属性异常伤害、<color=#FFFFFF>[紊乱]</color>伤害提升16%，持续30秒，重复触发时刷新持续时间。' },
};

// DISC 2-set bonuses — pair-wise sibling of DISC_4_SETS.
// anomalyCtrl is reserved for future use; the current calc layer has no
// dedicated field, so a few entries deliberately leave `stats` empty.
export const DISC_2_SETS: Record<string, DiscSet> = {
  none:         { id: 0,     name: '-- 无套装 --', stats: {} },
  woodpecker:   { id: 31000, name: '啄木鸟电音',   stats: { critRate: 8 }, note: '暴击率+8%。' },
  hetun:        { id: 31100, name: '河豚电音',     stats: { penRatio: 8 }, note: '穿透率+8%。' },
  zhenxing:     { id: 31200, name: '震星迪斯科',   stats: {}, note: '冲击力+6%。' },
  ziyou:        { id: 31300, name: '自由蓝调',     stats: { anomalyMastery: 30 }, note: '异常精通+30点。' },
  jisu:         { id: 31400, name: '激素朋克',     stats: { atkPct: 10 }, note: '攻击力+10%。' },
  linghun:      { id: 31500, name: '灵魂摇滚',     stats: {}, note: '防御力+16%。' },
  yaoba:        { id: 31600, name: '摇摆爵士',     stats: {}, note: '能量自动回复+20%。' },
  hunduo:       { id: 31800, name: '混沌爵士',     stats: { anomalyMastery: 30 }, note: '异常精通+30点。' },
  yuanshi:      { id: 31900, name: '原始朋克',     stats: {}, note: '施加的护盾值提升15%。' },
  yanyujinshu:  { id: 32200, name: '炎狱重金属',   stats: { dmgBonus: 10 }, note: '<color=#FF5521>火属性伤害</color>+10%。' },
  hunduojinshu: { id: 32300, name: '混沌重金属',   stats: { dmgBonus: 10 }, note: '<color=#FE437E>以太伤害</color>+10%。' },
  leibao:       { id: 32400, name: '雷暴重金属',   stats: { dmgBonus: 10 }, note: '<color=#2EB6FF>电属性伤害</color>+10%。' },
  jidi:         { id: 32500, name: '极地重金属',   stats: { dmgBonus: 10 }, note: '<color=#98EFF0>冰属性伤害</color>+10%。' },
  liaoya:       { id: 32600, name: '獠牙重金属',   stats: { dmgBonus: 10 }, note: '<color=#F0D12B>物理伤害</color>+10%。' },
  zhezhi:       { id: 32700, name: '折枝剑歌',     stats: { critDmg: 16 }, note: '暴击伤害+16%。' },
  jiayin:       { id: 32800, name: '静听嘉音',     stats: { atkPct: 10 },         note: '攻击力+10%。' },
  ruying:       { id: 32900, name: '如影相随',     stats: { dmgBonus: 15 }, note: '<color=#FFFFFF>[追加攻击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的伤害提升15%。' },
  faedun:       { id: 33000, name: '法厄同之歌',   stats: {}, note: '异常掌控+8%。' },
  yunkui:       { id: 33100, name: '云岿如我',     stats: { hpPct: 10 }, note: '生命值+10%' },
  mountain:     { id: 33200, name: '山大王',       stats: {}, note: '攻击造成的失衡值提升6%' },
  fuxiao:       { id: 33300, name: '拂晓生花',     stats: { dmgBonus: 15 }, note: '<color=#FFFFFF>[普通攻击]</color>造成的伤害提升15%。' },
  moon:         { id: 33400, name: '月光骑士颂',   stats: {},                     note: '能量自动回复+20%。' },
  canglang:     { id: 33500, name: '沧浪行歌',     stats: { dmgBonus: 10 },       note: '<color=#F0D12B>物理伤害</color>+10%。' },
  liuguang:     { id: 33600, name: '流光咏叹',     stats: { dmgBonus: 10 },       note: '<color=#FE437E>以太伤害</color>+10%。' },
  xuetu:        { id: 33700, name: '雪兔梦游仙境', stats: { hpPct: 10 },          note: '生命值+10%' },
  qiutu:        { id: 33800, name: '囚徒手记',     stats: { dmgBonus: 10 },       note: '<color=#98EFF0>冰属性伤害</color>+10%。' },
};
