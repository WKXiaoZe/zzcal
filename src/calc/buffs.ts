// src/calc/buffs.ts
// ZZZ 3.4.5_r20699967 全量可选 Buff 数据库 (自动生成)
// 涵盖 5 大类：
//   1. AGENT_BUFFS: 全角色主动技能 / 核心被动 / 额外能力 / 影画(M1/M2/M4/M6) Buff
//   2. WEAPON_BUFFS: 全音擎 R1-R5 被动特效 Buff
//   3. DISC_BUFFS: 全驱动盘 4件套 Buff (由 DISC_4_SETS 动态派生)
//   4. DA_BOSS_STAGE_BUFFS: 危局强袭战 Boss 场地 Buff
//   5. DA_WEATHER_BUFFS: 危局强袭战 期次天气 Buff

import type { AgentStats } from './types';
import { DISC_4_SETS, DISC_2_SETS, DISC_ROLE } from './discSets';

export type BuffCategory = 'agent' | 'weapon' | 'disc' | 'boss_stage' | 'da_weather';

export interface DaSeasonInfo {
  season: number;
  version: string;
  startDate: string;
  endDate: string;
  dateLabel: string;
  bosses: string[];
  bossBuffIds: string[];
  weatherBuffIds: string[];
}

export interface BuffItem {
  id: string;
  category: BuffCategory;
  sourceName: string;
  subType?: string;
  dateRange?: string;
  version?: string;
  seasons?: number[];
  cinemaRank?: number;
  title: string;
  desc: string;
  stats: Partial<AgentStats>;
  refinementDescs?: [string, string, string, string, string];
  refinementStats?: [
    Partial<AgentStats>,
    Partial<AgentStats>,
    Partial<AgentStats>,
    Partial<AgentStats>,
    Partial<AgentStats>,
  ];
}

export const STAT_LABELS: Record<string, { label: string; suffix: string }> = {
  baseAtk:         { label: '基础攻击', suffix: '' },
  atkPct:          { label: '局外攻击', suffix: '%' },
  inCombatAtkPct:  { label: '局内攻击', suffix: '%' },
  inCombatAtkFlat: { label: '固定攻击', suffix: '' },
  critRate:        { label: '暴击率',   suffix: '%' },
  critDmg:         { label: '暴击伤害', suffix: '%' },
  dmgBonus:        { label: '增伤',     suffix: '%' },
  defShred:        { label: '无视防御', suffix: '%' },
  resShred:        { label: '减抗/无视抗性', suffix: '%' },
  penRatio:        { label: '穿透率',   suffix: '%' },
  penValue:        { label: '穿透值',   suffix: '' },
  dazeVuln:        { label: '失衡易伤', suffix: '%' },
  baseHp:          { label: '基础生命', suffix: '' },
  hpPct:           { label: '局外生命', suffix: '%' },
  inCombatHpPct:   { label: '局内生命', suffix: '%' },
  inCombatPen:     { label: '贯穿力',   suffix: '' },
  ppDmgBonus:      { label: '贯穿增伤', suffix: '%' },
  anomalyMastery:  { label: '异常精通', suffix: '' },
  baseDef:         { label: '基础防御', suffix: '' },
  defPct:          { label: '局外防御', suffix: '%' },
  flatDef:         { label: '固定防御', suffix: '' },
  inCombatDefPct:  { label: '局内防御', suffix: '%' },
  inCombatDefFlat: { label: '局内固定防御', suffix: '' },
  sharpCritDmg:    { label: '锐暴伤害', suffix: '%' },
};

/**
 * 将 Buff 的数值效果格式化为可读标签数组，例如 ['增伤 +50%', '暴击伤害 +40%']
 */
export function formatBuffStatsSummary(stats: Partial<AgentStats> | undefined): string[] {
  if (!stats) return [];
  const badges: string[] = [];
  for (const [k, v] of Object.entries(stats)) {
    if (typeof v !== 'number' || v === 0) continue;
    const meta = STAT_LABELS[k] || { label: k, suffix: '' };
    const sign = v > 0 ? '+' : '';
    badges.push(`${meta.label} ${sign}${v}${meta.suffix}`);
  }
  return badges;
}

/**
 * 清理游戏内富文本标签（保留文字内容）
 */
export function stripGameTags(raw: string): string {
  if (!raw) return '';
  return raw.replace(/<[^>]+>/g, '');
}

export const AGENT_BUFFS: Record<string, BuffItem[]> = {
  "安比": [
    {
      "id": "agent_1011_core",
      "category": "agent",
      "sourceName": "安比",
      "subType": "核心被动",
      "title": "核心被动：波动电压",
      "desc": "安比在<color=#FFFFFF>[普通攻击]</color>第三段后发动<color=#FFFFFF>[普通攻击：落雷]</color>、<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，招式造成的失衡值提升<color=#2BAD00>64%</color>。",
      "stats": {}
    },
    {
      "id": "agent_1011_add",
      "category": "agent",
      "sourceName": "安比",
      "subType": "额外能力",
      "title": "额外能力：并联电路",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n安比<color=#FFFFFF>[闪避反击]</color>命中敌人时，额外回复7.2点能量，5秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1011_m1",
      "category": "agent",
      "sourceName": "安比",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "快充模式",
      "desc": "<color=#FFFFFF>[普通攻击]</color>第四段斩击命中敌人时，安比的能量获得效率提升12%，持续30秒。",
      "stats": {}
    },
    {
      "id": "agent_1011_m2",
      "category": "agent",
      "sourceName": "安比",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "精准放电",
      "desc": "<color=#FFFFFF>[普通攻击：落雷]</color>命中处于失衡状态下的敌人时，招式造成的伤害提升30%；\n<color=#FFFFFF>[强化特殊技]</color>命中未处于失衡状态下的敌人时，招式造成的失衡值提升10%。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1011_m4",
      "category": "agent",
      "sourceName": "安比",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "电荷传导",
      "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，为后场电属性角色回复3点能量；\n安比每拥有12%能量获得效率，回复量额外提升2点，最多额外提升6点。",
      "stats": {}
    },
    {
      "id": "agent_1011_m6",
      "category": "agent",
      "sourceName": "安比",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "充能电场",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>时，安比获得8层充能（上限8层）；\n<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中敌人时，消耗1层充能，使当前招式造成的伤害提升45%。",
      "stats": {
        "dmgBonus": 45
      }
    }
  ],
  "猫又": [
    {
      "id": "agent_1021_core",
      "category": "agent",
      "sourceName": "猫又",
      "subType": "核心被动",
      "title": "核心被动：猫步诡影",
      "desc": "猫又<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[快速支援]</color>命中敌人时，自身造成的伤害提升<color=#2BAD00>60%</color>，持续6秒。",
      "stats": {
        "dmgBonus": 60
      }
    },
    {
      "id": "agent_1021_add",
      "category": "agent",
      "sourceName": "猫又",
      "subType": "额外能力",
      "title": "额外能力：猫步秀",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n队伍中任意角色对敌人施加<color=#F0D12B>[强击]</color>效果后，猫又下一次发动<color=#FFFFFF>[强化特殊技]</color>时，招式造成的伤害提升35%，最多叠加2层。",
      "stats": {
        "dmgBonus": 70
      }
    },
    {
      "id": "agent_1021_m1",
      "category": "agent",
      "sourceName": "猫又",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "猎鸟技巧",
      "desc": "从背后攻击命中敌人时，猫又无视目标16%<color=#F0D12B>物理伤害抗性</color>；\n敌方处于失衡状态时，猫又对其的所有攻击均被视为背后攻击。",
      "stats": {
        "resShred": 16
      }
    },
    {
      "id": "agent_1021_m2",
      "category": "agent",
      "sourceName": "猫又",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "猫鼠游戏",
      "desc": "当场上只有一名敌人且自身位于前场时，猫又的能量获得效率提升25%。",
      "stats": {}
    },
    {
      "id": "agent_1021_m4",
      "category": "agent",
      "sourceName": "猫又",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "磨爪",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>时，猫又的暴击率提升7%，\n最多叠加2层，持续15秒，每层效果单独结算持续时间。",
      "stats": {
        "critRate": 7
      }
    },
    {
      "id": "agent_1021_m6",
      "category": "agent",
      "sourceName": "猫又",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "捕食者血统",
      "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，猫又的暴击伤害提升18%，最多叠加3层，退出接战状态时增益效果结束；猫又击败敌人时，该增益效果直接叠加至层数上限。",
      "stats": {
        "critDmg": 54
      }
    }
  ],
  "妮可": [
    {
      "id": "agent_1031_core",
      "category": "agent",
      "sourceName": "妮可",
      "subType": "核心被动",
      "title": "核心被动：机关箱",
      "desc": "妮可在<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>等招式中，上弹并强化<color=#FFFFFF>[普通攻击]</color>与<color=#FFFFFF>[冲刺攻击]</color>；强化子弹或能量场命中敌人时，目标的防御力降低<color=#2BAD00>40%</color>，持续3.5秒。",
      "stats": {
        "defShred": 40
      }
    },
    {
      "id": "agent_1031_add",
      "category": "agent",
      "sourceName": "妮可",
      "subType": "额外能力",
      "title": "额外能力：狡兔三窟",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n妮可通过<color=#FFFFFF>[核心被动：机关箱]</color>对敌人施加减益效果时，所有单位对目标造成的<color=#FE437E>以太伤害</color>额外提升25%，持续3.5秒。",
      "stats": {
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1031_m1",
      "category": "agent",
      "sourceName": "妮可",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "增压强化弹",
      "desc": "<color=#FFFFFF>[强化特殊技]</color>造成的伤害和累积的属性异常积蓄值提升16%；\n发动<color=#FFFFFF>[强化特殊技]</color>时，每多蓄力0.1秒，在目标处生成的能量场持续时间提升0.15秒。",
      "stats": {}
    },
    {
      "id": "agent_1031_m2",
      "category": "agent",
      "sourceName": "妮可",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "聚能装置",
      "desc": "触发<color=#FFFFFF>[核心被动：机关箱]</color>的减益效果时，妮可回复5点能量，15秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1031_m4",
      "category": "agent",
      "sourceName": "妮可",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "领域扩增",
      "desc": "妮可发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，\n在目标处生成的能量场攻击范围提升，直径增加3米。",
      "stats": {}
    },
    {
      "id": "agent_1031_m6",
      "category": "agent",
      "sourceName": "妮可",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "侵蚀能量场",
      "desc": "能量场对敌人造成伤害时，所有单位对该目标的暴击率提升1.5%，\n最多叠加10层，持续12秒，每层效果单独结算持续时间。",
      "stats": {
        "critRate": 15
      }
    }
  ],
  "11号": [
    {
      "id": "agent_1041_core",
      "category": "agent",
      "sourceName": "11号",
      "subType": "核心被动",
      "title": "核心被动：热浪",
      "desc": "「11号」在<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>中触发<color=#FFFFFF>[火力镇压]</color>时，招式造成的伤害提升<color=#2BAD00>70%</color>。",
      "stats": {
        "dmgBonus": 70
      }
    },
    {
      "id": "agent_1041_add",
      "category": "agent",
      "sourceName": "11号",
      "subType": "额外能力",
      "title": "额外能力：燎原",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n「11号」造成的<color=#FF5521>火属性伤害</color>提升10%，攻击处于失衡状态下的敌人时，该增益效果额外提升22.5%。",
      "stats": {
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1041_m1",
      "category": "agent",
      "sourceName": "11号",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "快速升温",
      "desc": "成为接战状态下的当前操作角色时，若「11号」的能量不足40点，\n则立即回复至80点，50秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1041_m2",
      "category": "agent",
      "sourceName": "11号",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "高温汇聚",
      "desc": "触发<color=#FFFFFF>[火力镇压]</color>时，<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>、<color=#FFFFFF>[闪避反击]</color>造成的伤害提升3%，\n最多叠加12层，持续15秒，每层效果单独结算持续时间。",
      "stats": {
        "dmgBonus": 3
      }
    },
    {
      "id": "agent_1041_m4",
      "category": "agent",
      "sourceName": "11号",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "纵情燃烧",
      "desc": "<color=#FFFFFF>[普通攻击]</color>第一、二、三段或<color=#FFFFFF>[冲刺攻击]</color>发动时，若触发<color=#FFFFFF>[火力镇压]</color>，\n则在招式发动期间抗打断等级提升，受到的伤害降低18%；\n<color=#FFFFFF>[普通攻击]</color>第四段发动时，若触发<color=#FFFFFF>[火力镇压]</color>，\n则在招式发动期间获得无敌效果。",
      "stats": {}
    },
    {
      "id": "agent_1041_m6",
      "category": "agent",
      "sourceName": "11号",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "炽热心流",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，「11号」获得8层充能（上限8层）；\n触发<color=#FFFFFF>[火力镇压]</color>时，消耗1层充能，使当前招式无视目标25%<color=#FF5521>火属性伤害抗性</color>。",
      "stats": {
        "resShred": 25
      }
    }
  ],
  "伊德海莉": [
    {
      "id": "agent_1051_core",
      "category": "agent",
      "sourceName": "伊德海莉",
      "subType": "核心被动",
      "title": "核心被动：拾梦空想",
      "desc": "伊德海莉会额外根据自身最大生命值提高贯穿力，每1点最大生命值将提高0.1点贯穿力；\n伊德海莉发动招式造成的<color=#98EFF0>冰属性伤害</color>均为贯穿伤害，无视敌人防御，使用贯穿力作为招式伤害倍率；伊德海莉进入战场时即可恢复60闪能，在勘域模式中此效果180秒内最多触发一次，\n伊德海莉的当前生命值百分比越低，招式造成的伤害越高；\n当伊德海莉生命值低于50%时，获得的增益效果达到最大值，攻击造成的伤害最多提升<color=#2BAD00>100%</color>，伊德海莉生命值重新回到50%后，最大值增益效果仍会持续5秒；\n伊德海莉通过招式命中获得喧响值降低，伊德海莉生命值降低时，获得喧响值，每降低1%生命值会获得10点喧响值。",
      "stats": {
        "dmgBonus": 100
      }
    },
    {
      "id": "agent_1051_add",
      "category": "agent",
      "sourceName": "伊德海莉",
      "subType": "额外能力",
      "title": "额外能力：完形叙事",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>角色或<color=#FFFFFF>[支援]</color>角色时触发：\n伊德海莉生命值低于50%时，暴击伤害提升30%，受到的伤害降低25%；\n伊德海莉处于<color=#FFFFFF>[以太帷幕·涌泉]</color>中时，额外获得以下效果：\n伊德海莉的<color=#FFFFFF>[普通攻击：霜寒拥覆]</color>第三段蓄力攻击、<color=#FFFFFF>[强化特殊技：极寒重碾]</color>的招式结束后，将召唤寒冰触手进行攻击，造成额外伤害，每12秒最多触发1次；\n发动上述招式视为发动<color=#FFFFFF>[强化特殊技]</color>，伤害倍率跟随强化特殊技的技能等级提升。",
      "stats": {
        "critDmg": 30
      }
    },
    {
      "id": "agent_1051_skill_1_2",
      "category": "agent",
      "sourceName": "伊德海莉",
      "subType": "特殊技",
      "title": "以太帷幕·涌泉",
      "desc": "喧响等级达到<color=#FFFFFF>[极]</color>时，<color=#FFFFFF>[普通攻击：霜寒拥覆]</color>、<color=#FFFFFF>[强化特殊技：缠霜]</color>、<color=#FFFFFF>[强化特殊技：极寒重碾]</color>、<color=#FFFFFF>[连携技：踱寒践约]</color>最后一击命中敌人时，将消耗3000喧响值，并开启<color=#FFFFFF>[以太帷幕·涌泉]</color>，<color=#FFFFFF>[以太帷幕·涌泉]</color>生效期间，全队角色最大生命值提升5%，持续30秒，重复触发延长持续时间，最多延长至300秒；\n伊德海莉处于<color=#FFFFFF>[以太帷幕·涌泉]</color>中时，<color=#FFFFFF>[普通攻击：霜寒拥覆]</color>的蓄力速度增加、蓄力消耗生命值速度增加。",
      "stats": {
        "inCombatHpPct": 5
      }
    },
    {
      "id": "agent_1051_m1",
      "category": "agent",
      "sourceName": "伊德海莉",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "过往沉溺于渊下",
      "desc": "伊德海莉发动<color=#FFFFFF>[强化特殊技]</color>所需消耗的闪能减少10点；\n发动<color=#FFFFFF>[强化特殊技：缠霜]</color>或<color=#FFFFFF>[强化特殊技：极寒重碾]</color>后，保持长按「普通攻击」或「特殊攻击」按键，可以消耗35闪能，放弃回复生命值并立即衔接1次<color=#FFFFFF>[强化特殊技：极寒重碾]</color>，并使本次<color=#FFFFFF>[强化特殊技：极寒重碾]</color>回复的生命值额外提升100%；\n伊德海莉的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[强化特殊技]</color>无视目标20%<color=#98EFF0>冰属性伤害抗性</color>。",
      "stats": {
        "inCombatHpPct": 100,
        "resShred": 20
      }
    },
    {
      "id": "agent_1051_m2",
      "category": "agent",
      "sourceName": "伊德海莉",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "何人于此遐思",
      "desc": "伊德海莉的暴击伤害提升40%；成功触发<color=#FFFFFF>[溯寒]</color>或<color=#FFFFFF>[追碾]</color>后，持续回复闪能，\n每秒回复0.5点，最多30秒，重复触发时刷新持续时间。",
      "stats": {
        "critDmg": 40
      }
    },
    {
      "id": "agent_1051_m4",
      "category": "agent",
      "sourceName": "伊德海莉",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "在静默中盛放",
      "desc": "<color=#FFFFFF>[核心被动：拾梦空想]</color>中，生命值降低时，伊德海莉获得的喧响值增加10%；\n处于<color=#FFFFFF>[以太帷幕·涌泉]</color>中时，伊德海莉的最大生命值额外提升5%。",
      "stats": {
        "inCombatHpPct": 5
      }
    },
    {
      "id": "agent_1051_m6",
      "category": "agent",
      "sourceName": "伊德海莉",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "终逢安宁之梦",
      "desc": "伊德海莉消耗喧响值开启或延长<color=#FFFFFF>[以太帷幕·涌泉]</color>后，将获得<color=#FFFFFF>[启谛]</color>，持续30秒；\n<color=#FFFFFF>[启谛]</color>期间，伊德海莉造成的贯穿伤害提高25%，首次受到致命伤害时，生命值最多降低至1，在5秒内不会战败退场并持续回复25%生命值。",
      "stats": {
        "ppDmgBonus": 25
      }
    }
  ],
  "可琳": [
    {
      "id": "agent_1061_core",
      "category": "agent",
      "sourceName": "可琳",
      "subType": "核心被动",
      "title": "核心被动：专注",
      "desc": "连点或长按后，可琳使用电锯持续斩击敌人时，招式造成的伤害提升<color=#2BAD00>37.5%</color>。",
      "stats": {
        "dmgBonus": 37.5
      }
    },
    {
      "id": "agent_1061_add",
      "category": "agent",
      "sourceName": "可琳",
      "subType": "额外能力",
      "title": "额外能力：扫除帮手",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n可琳攻击命中处于失衡状态下的敌人时，自身造成的伤害提升35%。",
      "stats": {
        "dmgBonus": 35
      }
    },
    {
      "id": "agent_1061_m1",
      "category": "agent",
      "sourceName": "可琳",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "开放性创伤",
      "desc": "<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>命中敌人时，可琳对目标造成的伤害提升12%，持续15秒。",
      "stats": {
        "dmgBonus": 12
      }
    },
    {
      "id": "agent_1061_m2",
      "category": "agent",
      "sourceName": "可琳",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "裂解效应",
      "desc": "<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>命中敌人时，目标的<color=#F0D12B>物理伤害抗性</color>下降0.5%，\n最多叠加20层，持续5秒，每层效果单独结算持续时间。",
      "stats": {
        "resShred": 0.5
      }
    },
    {
      "id": "agent_1061_m4",
      "category": "agent",
      "sourceName": "可琳",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "战场随侍",
      "desc": "发动<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[招架支援]</color>或<color=#FFFFFF>[连携技]</color>时，可琳回复7.2点能量，16秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1061_m6",
      "category": "agent",
      "sourceName": "可琳",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "厚积薄发",
      "desc": "持续斩击命中敌人时，可琳获得1层充能（最多40层）；\n在<color=#FFFFFF>[闪避反击]</color>、<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[支援突击]</color>中，引爆电锯命中敌人时，\n消耗所有充能，每层充能使本次攻击额外造成可琳3%攻击力的伤害。",
      "stats": {}
    }
  ],
  "凯撒": [
    {
      "id": "agent_1071_core",
      "category": "agent",
      "sourceName": "凯撒",
      "subType": "核心被动",
      "title": "核心被动：坚韧之壁",
      "desc": "凯撒发动<color=#FFFFFF>[强化特殊技：招架反击]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>或以<color=#FFFFFF>[防御反击]</color>的方式发动<color=#FFFFFF>[强化特殊技：超强力盾击]</color>时，为全队提供等同于自身<color=#2BAD00>1400%</color>初始冲击力+<color=#2BAD00>1400</color>点的护盾<color=#FFFFFF>[荣光之盾]</color>，持续60秒，<color=#FFFFFF>[荣光之盾]</color>由当前操作中的角色持有，护盾值为全队共享，单次受到的伤害不会超过护盾值；\n<color=#FFFFFF>[荣光之盾]</color>存在期间，持有者的抗打断等级提升；\n<color=#FFFFFF>[荣光之盾]</color>存在期间，持有者的攻击力提升<color=#2BAD00>1000</color>点，<color=#FFFFFF>[荣光之盾]</color>效果结束后，该增益效果仍然保留，持续5秒。",
      "stats": {
        "inCombatAtkFlat": 1000
      }
    },
    {
      "id": "agent_1071_add",
      "category": "agent",
      "sourceName": "凯撒",
      "subType": "额外能力",
      "title": "额外能力：战意激昂",
      "desc": "队伍中存在其他可发动<color=#FFFFFF>[招架支援]</color>的角色或与自身阵营相同的角色时触发：\n凯撒触发<color=#FFFFFF>[精准格挡]</color>、<color=#FFFFFF>[防御反击]</color>、<color=#FFFFFF>[招架支援]</color>或发动<color=#FFFFFF>[普通攻击：此路不通！]</color>时，对自身附近7米范围内的敌人施加减益效果，使全队角色对其造成的伤害提升25%，持续30秒。",
      "stats": {
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1071_m1",
      "category": "agent",
      "sourceName": "凯撒",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "楔式进军",
      "desc": "成为接战状态下的当前操作角色时，凯撒立即为全队提供<color=#FFFFFF>[荣光之盾]</color>，300秒内最多触发一次；\n<color=#FFFFFF>[荣光之盾]</color>存在期间，持有者附近5米范围内敌人的全属性伤害抗性降低15%。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1071_m2",
      "category": "agent",
      "sourceName": "凯撒",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "异域传承",
      "desc": "<color=#FFFFFF>[核心被动：坚韧之壁]</color>中，<color=#FFFFFF>[荣光之盾]</color>存在期间，\n凯撒的能量获得效率提升10%，持有者的攻击力提升效果提升至原本的150%。",
      "stats": {
        "inCombatAtkFlat": 500
      }
    },
    {
      "id": "agent_1071_m4",
      "category": "agent",
      "sourceName": "凯撒",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "阿瑞斯攻城锤",
      "desc": "凯撒发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，额外回复3点<color=#FFFFFF>[支援点数]</color>；\n凯撒的能量值不足20点时，可以消耗1点<color=#FFFFFF>[支援点数]</color>作为代替，\n发动<color=#FFFFFF>[强化特殊技：超强力盾击]</color>，代替效果5秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1071_m6",
      "category": "agent",
      "sourceName": "凯撒",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "霸主之志",
      "desc": "<color=#FFFFFF>[强化特殊技：超强力盾击]</color>和<color=#FFFFFF>[支援突击：支援之锋]</color>必定触发暴击，\n招式造成的伤害提升50%，对主要目标造成的伤害额外提升50%；\n凯撒发动<color=#FFFFFF>[强化特殊技：超强力盾击]</color>或<color=#FFFFFF>[支援突击：支援之锋]</color>时，\n自身暴击率提升30%，暴击伤害提升60%，持续15秒。",
      "stats": {
        "dmgBonus": 100,
        "critRate": 30,
        "critDmg": 60
      }
    }
  ],
  "比利": [
    {
      "id": "agent_1081_core",
      "category": "agent",
      "sourceName": "比利",
      "subType": "核心被动",
      "title": "核心被动：稳定据枪",
      "desc": "比利在<color=#FFFFFF>[普通攻击]</color>中进入蹲姿射击后，自身造成的伤害提升<color=#2BAD00>50%</color>，进行移动、回到待机、被击退或被击飞时增益效果结束。",
      "stats": {
        "dmgBonus": 50
      }
    },
    {
      "id": "agent_1081_add",
      "category": "agent",
      "sourceName": "比利",
      "subType": "额外能力",
      "title": "额外能力：骑士战队",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n比利发动<color=#FFFFFF>[连携技]</color>后，下次发动<color=#FFFFFF>[终结技]</color>时，招式造成的伤害提升50%，最多叠加2次，发动<color=#FFFFFF>[终结技]</color>后效果重置。",
      "stats": {
        "dmgBonus": 50
      }
    },
    {
      "id": "agent_1081_m1",
      "category": "agent",
      "sourceName": "比利",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "闪亮登场",
      "desc": "<color=#FFFFFF>[冲刺攻击]</color>或<color=#FFFFFF>[闪避反击]</color>命中敌人时，比利额外回复2.7点能量，5秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1081_m2",
      "category": "agent",
      "sourceName": "比利",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "游斗射术",
      "desc": "<color=#FFFFFF>[闪避反击]</color>造成的伤害提升25%；\n<color=#FFFFFF>[普通攻击]</color>中的翻滚射击将被视为闪避动作，在招式发动期间获得无敌效果，\n并且能够触发<color=#FFFFFF>[极限闪避]</color>，翻滚射击触发<color=#FFFFFF>[极限闪避]</color>时，将自动衔接<color=#FFFFFF>[闪避反击]</color>。",
      "stats": {
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1081_m4",
      "category": "agent",
      "sourceName": "比利",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "星徽-惩戒弹药",
      "desc": "<color=#FFFFFF>[强化特殊技]</color>命中敌人时，招式的暴击率随自身与目标之间的距离而提升；\n比利与目标距离越近，提升效果越显著，最高提升32%。",
      "stats": {
        "critRate": 32
      }
    },
    {
      "id": "agent_1081_m6",
      "category": "agent",
      "sourceName": "比利",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "星徽-英雄时刻",
      "desc": "累计命中敌人10次或触发<color=#FFFFFF>[极限闪避]</color>时，比利造成的伤害提升6%，\n最多叠加5层，被敌方击退或击飞后增益效果重置。",
      "stats": {
        "dmgBonus": 6
      }
    }
  ],
  "雅": [
    {
      "id": "agent_1091_core",
      "category": "agent",
      "sourceName": "雅",
      "subType": "核心被动",
      "title": "核心被动：寒炎",
      "desc": "星见雅对敌人造成<color=#98EFF0>烈霜伤害</color>时，将会为目标附着<color=#FFFFFF>[冰焰]</color>，持续30秒；对附着<color=#FFFFFF>[冰焰]</color>的敌人累积<color=#98EFF0>烈霜异常积蓄值</color>时，会基于星见雅暴击率的100%提升<color=#98EFF0>烈霜异常积蓄效率</color>，最多提升80%；星见雅累积<color=#98EFF0>烈霜异常积蓄值</color>时，具有独立的属性异常积蓄槽，随之触发的<color=#98EFF0>[冻结]</color>、<color=#98EFF0>[碎冰]</color>和<color=#98EFF0>[霜寒]</color>效果，可以与包括<color=#98EFF0>冰属性异常效果</color>在内的其他属性异常效果互相结算<color=#FFFFFF>[紊乱]</color>；\n星见雅对附着<color=#FFFFFF>[冰焰]</color>的敌人施加<color=#98EFF0>[霜寒]</color>效果时，将会消除<color=#FFFFFF>[冰焰]</color>并触发<color=#FFFFFF>[霜灼·破]</color>，对目标造成星见雅<color=#2BAD00>1500%</color>攻击力的<color=#98EFF0>烈霜伤害</color>，同时使目标进入<color=#FFFFFF>[霜灼]</color>状态；<color=#FFFFFF>[霜灼]</color>状态下，所有单位对目标累积的属性异常积蓄值提升<color=#2BAD00>20%</color>，但星见雅无法再次为其附着<color=#FFFFFF>[冰焰]</color>；<color=#FFFFFF>[霜灼]</color>状态将会随本次<color=#98EFF0>[霜寒]</color>效果一起结束，状态持续期间，对敌人重新施加属性异常效果可以覆盖<color=#98EFF0>[霜寒]</color>并消除<color=#FFFFFF>[霜灼]</color>；\n触发<color=#FFFFFF>[霜灼·破]</color>时，星见雅获得1点<color=#FFFFFF>[落霜]</color>，10秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1091_add",
      "category": "agent",
      "sourceName": "雅",
      "subType": "额外能力",
      "title": "额外能力：同沐霜雪",
      "desc": "队伍中存在<color=#FFFFFF>[支援]</color>角色或与自身阵营相同的角色或其他<color=#FFFFFF>[异常]</color>角色时触发：\n<color=#FFFFFF>[普通攻击：霜月]</color>造成的伤害提升60%；队伍中任意角色触发<color=#FFFFFF>[紊乱]</color>效果时，星见雅获得2点<color=#FFFFFF>[落霜]</color>，且在下一次<color=#FFFFFF>[霜月架势]</color>期间，<color=#FFFFFF>[普通攻击：霜月]</color>将无视目标30%<color=#98EFF0>冰属性伤害抗性</color>。",
      "stats": {
        "dmgBonus": 60,
        "resShred": 30
      }
    },
    {
      "id": "agent_1091_skill_1_2",
      "category": "agent",
      "sourceName": "雅",
      "subType": "特殊技",
      "title": "终结技：名残雪",
      "desc": "喧响等级达到<color=#FFFFFF>[极]</color>时，点按  发动：\n对前方大范围敌人发动强力斩击，略作延迟后发动终结一击，造成大量<color=#98EFF0>烈霜伤害</color>；\n招式发动时，获得3点<color=#FFFFFF>[落霜]</color>，自身造成的<color=#98EFF0>冰属性伤害</color>提升30%，持续12秒；\n招式发动期间拥有无敌效果。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1091_m1",
      "category": "agent",
      "sourceName": "雅",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "雪上加霜",
      "desc": "在<color=#FFFFFF>[霜月架势]</color>期间，每消耗1点<color=#FFFFFF>[落霜]</color>，\n<color=#FFFFFF>[普通攻击：霜月]</color>将无视目标6%防御力，最多叠加6层，退出<color=#FFFFFF>[霜月架势]</color>后增益效果结束；\n在<color=#FFFFFF>[普通攻击：霜月]</color>中进行三段蓄力，斩击命中处于<color=#FFFFFF>[霜灼]</color>状态下的敌人时，\n可以立即消除目标的<color=#FFFFFF>[霜灼]</color>状态，并使全队角色属性异常积蓄效率提升20%，持续10秒。",
      "stats": {
        "defShred": 36
      }
    },
    {
      "id": "agent_1091_m2",
      "category": "agent",
      "sourceName": "雅",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "吐纳法",
      "desc": "<color=#FFFFFF>[普通攻击：风花]</color>和<color=#FFFFFF>[闪避反击]</color>造成的伤害提升30%；\n第五段<color=#FFFFFF>[普通攻击：风花]</color>最后一击命中敌人时，星见雅获得1点<color=#FFFFFF>[落霜]</color>；\n进入战场时，星见雅立刻获得6点<color=#FFFFFF>[落霜]</color>，自身暴击率提升15%。",
      "stats": {
        "dmgBonus": 30,
        "critRate": 15
      }
    },
    {
      "id": "agent_1091_m4",
      "category": "agent",
      "sourceName": "雅",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "皲裂",
      "desc": "<color=#FFFFFF>[霜灼·破]</color>造成的伤害提升30%，触发<color=#FFFFFF>[霜灼·破]</color>时，星见雅额外获得250点喧响值。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1091_m6",
      "category": "agent",
      "sourceName": "雅",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "天资卓越",
      "desc": "在<color=#FFFFFF>[霜月架势]</color>期间，星见雅将获得<color=#FFFFFF>[极意]</color>效果，使<color=#FFFFFF>[普通攻击：霜月]</color>造成的伤害提升30%，获得<color=#FFFFFF>[极意]</color>效果后，消耗<color=#FFFFFF>[落霜]</color>时，星见雅会根据当前蓄力段数，自动拔刀向前方发动强力斩击；\n在<color=#FFFFFF>[落霜]</color>耗尽前，拔刀斩击不会打断<color=#FFFFFF>[霜月架势]</color>下的蓄力进度；\n在一次<color=#FFFFFF>[霜月架势]</color>期间，最多连续发动3次拔刀斩击。",
      "stats": {
        "dmgBonus": 30
      }
    }
  ],
  "珂蕾妲": [
    {
      "id": "agent_1101_core",
      "category": "agent",
      "sourceName": "珂蕾妲",
      "subType": "核心被动",
      "title": "核心被动：爆破锤",
      "desc": "珂蕾妲发动<color=#FFFFFF>[强化特殊技]</color>，或消耗<color=#FFFFFF>[熔炉升温]</color>发动强化<color=#FFFFFF>[普通攻击]</color>时，招式造成的失衡值提升<color=#2BAD00>60%</color>。",
      "stats": {}
    },
    {
      "id": "agent_1101_add",
      "category": "agent",
      "sourceName": "珂蕾妲",
      "subType": "额外能力",
      "title": "额外能力：白祇管理学",
      "desc": "队伍中存在与自身属性或阵营相同的角色或<color=#FFFFFF>[命破]</color>角色时触发：\n珂蕾妲发动<color=#FFFFFF>[强化特殊技]</color>引发爆炸命中敌人时，对目标施加减益效果；当目标陷入失衡状态后，<color=#FFFFFF>[连携技]</color>对其造成的伤害提升35%，最多叠加2层，失衡状态结束时该效果重置。",
      "stats": {
        "dmgBonus": 70
      }
    },
    {
      "id": "agent_1101_skill_1_4",
      "category": "agent",
      "sourceName": "珂蕾妲",
      "subType": "特殊技",
      "title": "普通攻击：砸扁，粉碎",
      "desc": "点按  发动：\n向前方进行至多四段的打击，造成<color=#F0D12B>物理伤害</color>；\n当珂蕾妲拥有<color=#FFFFFF>[熔炉升温]</color>效果时，能够在第二段攻击后发动强化<color=#FFFFFF>[普通攻击]</color>，消耗<color=#FFFFFF>[熔炉升温]</color>效果并造成大量<color=#FF5521>火属性伤害</color>；\n强化<color=#FFFFFF>[普通攻击]</color>分为两段，发动第一段后点按或长按  可衔接第二段，且第一段强化<color=#FFFFFF>[普通攻击]</color>的追击效果增强；\n<color=#FFFFFF>[熔炉升温]</color>效果最多可拥有2层，发动强化<color=#FFFFFF>[普通攻击]</color>会消耗所有的<color=#FFFFFF>[熔炉升温]</color>；\n消耗<color=#FFFFFF>[熔炉升温]</color>时，全队代理人造成的伤害提升35%，持续40秒，重复触发刷新时间，且每消耗一层<color=#FFFFFF>[熔炉升温]</color>，第二段强化<color=#FFFFFF>[普通攻击]</color>造成的伤害提升10%，造成的失衡值提升20%；\n第一段强化<color=#FFFFFF>[普通攻击]</color>发动期间切换代理人，珂蕾妲会在前台自动发动第二段强化<color=#FFFFFF>[普通攻击]</color>；\n当珂蕾妲与本同时出战，发动强化<color=#FFFFFF>[普通攻击]</color>，且未在第一段强化<color=#FFFFFF>[普通攻击]</color>期间切换代理人时，会由双方配合发动协同攻击，进一步提升招式的威力；\n<color=#FFFFFF>[普通攻击]</color>第四段和强化<color=#FFFFFF>[普通攻击]</color>发动期间拥有无敌效果；\n第二段强化<color=#FFFFFF>[普通攻击]</color>无敌效果持续时间增加。",
      "stats": {
        "dmgBonus": 45
      }
    },
    {
      "id": "agent_1101_m1",
      "category": "agent",
      "sourceName": "珂蕾妲",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "锤击节奏",
      "desc": "当衔接在<color=#FFFFFF>[普通攻击]</color>第二、第四段或强化<color=#FFFFFF>[普通攻击]</color>后，\n快速发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，招式造成的失衡值提升15%。",
      "stats": {}
    },
    {
      "id": "agent_1101_m2",
      "category": "agent",
      "sourceName": "珂蕾妲",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "动能回收",
      "desc": "<color=#FFFFFF>[强化特殊技]</color>命中敌人时，珂蕾妲回复60点能量，45秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1101_m4",
      "category": "agent",
      "sourceName": "珂蕾妲",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "熔炉余温",
      "desc": "消耗<color=#FFFFFF>[熔炉升温]</color>发动强化<color=#FFFFFF>[普通攻击]</color>时，珂蕾妲获得1层充能（上限2层）；\n<color=#FFFFFF>[连携技：天崩-地裂]</color>或<color=#FFFFFF>[终结技：锤进地心]</color>命中敌人时，消耗所有充能，每层充能使当前招式造成的伤害提升18%。",
      "stats": {
        "dmgBonus": 18
      }
    },
    {
      "id": "agent_1101_m6",
      "category": "agent",
      "sourceName": "珂蕾妲",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "饱和爆破",
      "desc": "在<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>中，引发爆炸命中敌人时，\n额外造成珂蕾妲360%攻击力的伤害。",
      "stats": {}
    }
  ],
  "安东": [
    {
      "id": "agent_1111_core",
      "category": "agent",
      "sourceName": "安东",
      "subType": "核心被动",
      "title": "核心被动：兄弟齐心！",
      "desc": "安东发动<color=#FFFFFF>[打桩攻击]</color>时，招式造成的伤害提升<color=#2BAD00>24%</color>，发动<color=#FFFFFF>[电钻攻击]</color>时，招式造成的伤害提升<color=#2BAD00>40%</color>。",
      "stats": {
        "dmgBonus": 64
      }
    },
    {
      "id": "agent_1111_add",
      "category": "agent",
      "sourceName": "安东",
      "subType": "额外能力",
      "title": "额外能力：通力合作",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n安东进入<color=#FFFFFF>[爆发状态]</color>后，每触发4次暴击，下一次攻击命中处于<color=#2EB6FF>[感电]</color>状态下的敌人时，能够额外结算一次<color=#2EB6FF>[感电]</color>伤害，伤害效果等同于原本的45%，0.5秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1111_m1",
      "category": "agent",
      "sourceName": "安东",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "热身运动",
      "desc": "<color=#FFFFFF>[电钻攻击]</color>命中敌人时，能够额外回复能量；同一招式内，该效果最多为安东回复5点能量。",
      "stats": {}
    },
    {
      "id": "agent_1111_m2",
      "category": "agent",
      "sourceName": "安东",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "气势如虹",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>进入<color=#FFFFFF>[爆发状态]</color>时，获得等同于安东7.5%生命值上限的护盾；\n在<color=#FFFFFF>[爆发状态]</color>下进入接战状态或换入前场时，将刷新护盾效果，15秒内最多触发一次；\n退出<color=#FFFFFF>[爆发状态]</color>时，该护盾效果结束。",
      "stats": {}
    },
    {
      "id": "agent_1111_m4",
      "category": "agent",
      "sourceName": "安东",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "一起燃烧！",
      "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，全队角色暴击率提升10%，持续12秒。",
      "stats": {
        "critRate": 10
      }
    },
    {
      "id": "agent_1111_m6",
      "category": "agent",
      "sourceName": "安东",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "突破极限",
      "desc": "<color=#FFFFFF>[打桩攻击]</color>造成暴击时，<color=#FFFFFF>[普通攻击：热血上工操（爆发状态）]</color>和<color=#FFFFFF>[闪避反击：过载钻击（爆发状态）]</color>造成的伤害提升4%，最多叠加6层，持续30秒，重复触发时刷新持续时间。",
      "stats": {
        "dmgBonus": 24
      }
    }
  ],
  "本": [
    {
      "id": "agent_1121_core",
      "category": "agent",
      "sourceName": "本",
      "subType": "核心被动",
      "title": "核心被动：守卫",
      "desc": "本的初始攻击力随初始防御力提升，提升效果等同于自身初始防御力的<color=#2BAD00>80%</color>；\n在<color=#FFFFFF>[强化特殊技]</color>中追加强力打击时，为全队角色提供等同于自身<color=#2BAD00>30%</color>防御力+<color=#2BAD00>550</color>点护盾，持续30秒。",
      "stats": {}
    },
    {
      "id": "agent_1121_add",
      "category": "agent",
      "sourceName": "本",
      "subType": "额外能力",
      "title": "额外能力：协议合同",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n拥有<color=#FFFFFF>[核心被动：守卫]</color>施加的护盾时，角色的暴击率提升16%。",
      "stats": {
        "critRate": 16
      }
    },
    {
      "id": "agent_1121_m1",
      "category": "agent",
      "sourceName": "本",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "反作用力",
      "desc": "发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>，成功格挡敌人的攻击时，\n攻击者造成的伤害降低30%，持续15秒。",
      "stats": {}
    },
    {
      "id": "agent_1121_m2",
      "category": "agent",
      "sourceName": "本",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "以守为攻",
      "desc": "在<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>中，成功触发格挡反击时，额外造成本300%防御力的伤害。",
      "stats": {}
    },
    {
      "id": "agent_1121_m4",
      "category": "agent",
      "sourceName": "本",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "灵活应变",
      "desc": "在<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>中，通过无敌效果成功格挡攻击时 ，后继反击造成的伤害提升30%。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1121_m6",
      "category": "agent",
      "sourceName": "本",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "野性斗志",
      "desc": "在<color=#FFFFFF>[强化特殊技]</color>中发动攻击或追加强力打击后，\n<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>、<color=#FFFFFF>[闪避反击]</color>造成的失衡值提升20%，持续12秒。",
      "stats": {}
    }
  ],
  "苍角": [
    {
      "id": "agent_1131_core",
      "category": "agent",
      "sourceName": "苍角",
      "subType": "核心被动",
      "title": "核心被动：刃旗助威",
      "desc": "苍角发动<color=#FFFFFF>[展旗]</color>时，自身攻击力提升，提升数值等同于苍角<color=#2BAD00>20%</color>初始攻击力，最高不超过500点，持续22秒，发动<color=#FFFFFF>[展旗]</color>并消耗<color=#FFFFFF>[涡流]</color>时，该增益效果翻倍，最高不超过1000点。队伍中其他角色通过<color=#FFFFFF>[展旗]</color>所触发的<color=#FFFFFF>[快速支援]</color>或<color=#FFFFFF>[连携技]</color>入场时，该增益效果将传递给对应的角色，并刷新其持续时间。",
      "stats": {
        "inCombatAtkFlat": 1000
      }
    },
    {
      "id": "agent_1131_add",
      "category": "agent",
      "sourceName": "苍角",
      "subType": "额外能力",
      "title": "额外能力：团膳套餐",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n苍角消耗<color=#FFFFFF>[涡流]</color>发动<color=#FFFFFF>[展旗]</color>时，全队角色造成的<color=#98EFF0>冰属性伤害</color>提升20%，持续22秒。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1131_skill_1_2",
      "category": "agent",
      "sourceName": "苍角",
      "subType": "特殊技",
      "title": "终结技：大份鹅鸡斩",
      "desc": "喧响等级达到<color=#FFFFFF>[极]</color>时，点按  发动：\n快速对前方敌人发动更多次打击，随后衔接<color=#FFFFFF>[展旗]</color>攻击，造成大量<color=#98EFF0>冰属性伤害</color>；\n招式发动时，苍角会进入<color=#FFFFFF>[鬼面]</color>状态，使自身的暴击率提升15%，持续15秒；\n招式发动时，队伍中其他角色回复10点能量，下一名换入前场的角色额外回复20点能量；\n招式发动期间拥有无敌效果。",
      "stats": {
        "critRate": 15
      }
    },
    {
      "id": "agent_1131_m1",
      "category": "agent",
      "sourceName": "苍角",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "振奋汇流",
      "desc": "苍角触发<color=#FFFFFF>[核心被动：刃旗助威]</color>或<color=#FFFFFF>[额外能力：团膳套餐]</color>时，增益效果的持续时间提升8秒。",
      "stats": {}
    },
    {
      "id": "agent_1131_m2",
      "category": "agent",
      "sourceName": "苍角",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "实验型充能模块",
      "desc": "<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>、<color=#FFFFFF>[闪避反击]</color>、<color=#FFFFFF>[快速支援]</color>命中敌人时，\n苍角有15%的概率获得一层<color=#FFFFFF>[涡流]</color>，1秒内最多触发一次；\n<color=#FFFFFF>[涡流]</color>层数到达上限后，若再次获得<color=#FFFFFF>[涡流]</color>，将改为苍角回复1.2点能量。",
      "stats": {}
    },
    {
      "id": "agent_1131_m4",
      "category": "agent",
      "sourceName": "苍角",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "失温症",
      "desc": "<color=#FFFFFF>[展旗]</color>攻击命中敌人时，目标的<color=#98EFF0>冰属性伤害抗性</color>降低10%，持续8秒。",
      "stats": {
        "resShred": 10
      }
    },
    {
      "id": "agent_1131_m6",
      "category": "agent",
      "sourceName": "苍角",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "朔风侵袭",
      "desc": "<color=#FFFFFF>[霜染刃旗]</color>状态下，强化<color=#FFFFFF>[普通攻击]</color>和强化<color=#FFFFFF>[冲刺攻击]</color>的可发动次数提升至12次，\n且招式造成的伤害提升45%。",
      "stats": {
        "dmgBonus": 45
      }
    }
  ],
  "莱卡恩": [
    {
      "id": "agent_1141_core",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "核心被动",
      "title": "核心被动：金属狼足",
      "desc": "莱卡恩在<color=#FFFFFF>[普通攻击]</color>中完成蓄力时，招式造成的失衡值提升<color=#2BAD00>80%</color>；\n<color=#FFFFFF>[强化特殊技：狂猎时刻]</color>或<color=#FFFFFF>[支援突击：复仇反扑]</color>命中敌人时，目标的<color=#98EFF0>冰属性伤害抗性</color>降低25%，持续30秒。",
      "stats": {
        "resShred": 25
      }
    },
    {
      "id": "agent_1141_add",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "额外能力",
      "title": "额外能力：优雅猎群",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n莱卡恩攻击命中处于失衡状态下的敌人时，目标的失衡易伤倍率提升35%。",
      "stats": {
        "dazeVuln": 35
      }
    },
    {
      "id": "agent_1141_m1",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "满月蓄势",
      "desc": "<color=#FFFFFF>[强化特殊技：狂猎时刻]</color>命中敌人时，招式造成的失衡值提升12%，8秒内最多触发一次；\n在<color=#FFFFFF>[强化特殊技：狂猎时刻]</color>中完成蓄力时，该增益效果额外提升10%。",
      "stats": {}
    },
    {
      "id": "agent_1141_m2",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "能量回馈",
      "desc": "使敌人失衡或触发队友的<color=#FFFFFF>[连携技]</color>时，莱卡恩回复5点能量，1秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1141_m4",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "保持风度",
      "desc": "在<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[特殊技]</color>的发动期间受到敌方攻击时，莱卡恩立刻获得等同于自身7.5%生命值上限的护盾，持续15秒，护盾持续期间抗打断等级提升，15秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1141_m6",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "冷酷猎手",
      "desc": "蓄力攻击命中敌人时，莱卡恩对目标造成的伤害提升10%，最多叠加5层，持续12秒；\n同一招式内最多叠加1层效果，重复触发时刷新持续时间。",
      "stats": {
        "dmgBonus": 50
      }
    }
  ],
  "露西": [
    {
      "id": "agent_1151_core",
      "category": "agent",
      "sourceName": "露西",
      "subType": "核心被动",
      "title": "核心被动：赤鬣亲卫队",
      "desc": "当露西发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，亲卫队小猪会加入战斗并呼叫出另外两只亲卫队小猪；亲卫队小猪可以继承露西的攻击力、冲击力和异常精通；<color=#FFFFFF>[加油！]</color>对亲卫队小猪的增益效果提升至原本的<color=#2BAD00>200%</color>，并使亲卫队小猪的攻击频率提升。",
      "stats": {}
    },
    {
      "id": "agent_1151_add",
      "category": "agent",
      "sourceName": "露西",
      "subType": "额外能力",
      "title": "额外能力：击「球」准备！",
      "desc": "队伍中存在与自身属性或阵营相同的角色或<color=#FFFFFF>[命破]</color>角色时触发：\n亲卫队小猪可以继承露西的暴击率和暴击伤害。",
      "stats": {}
    },
    {
      "id": "agent_1151_skill_1_2",
      "category": "agent",
      "sourceName": "露西",
      "subType": "特殊技",
      "title": "加油！",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>后，亲卫队小猪引发爆炸时，将为全队角色、邦布和亲卫队小猪施加<color=#FFFFFF>[加油！]</color>状态。<color=#FFFFFF>[加油！]</color>状态下，友方单位的攻击力提升，提升数值等同于露西<color=#2BAD00>22.6%</color>初始攻击力+<color=#2BAD00>88</color>点，最高不超过600点。击出<color=#FFFFFF>[平直球]</color>时，<color=#FFFFFF>[加油！]</color>状态持续10秒，击出<color=#FFFFFF>[高飞球]</color>时，<color=#FFFFFF>[加油！]</color>状态持续15秒，重复触发时刷新持续时间。",
      "stats": {
        "inCombatAtkFlat": 600
      }
    },
    {
      "id": "agent_1151_m1",
      "category": "agent",
      "sourceName": "露西",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "队形操练中",
      "desc": "亲卫队小猪发动<color=#FFFFFF>[亲卫队小猪：回旋挥击！]</color>时，为露西回复2点能量，\n15秒内最多触发一次，每只亲卫队小猪单独结算冷却时间。",
      "stats": {}
    },
    {
      "id": "agent_1151_m2",
      "category": "agent",
      "sourceName": "露西",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "小猪大队长",
      "desc": "露西发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，\n将为全队角色、邦布和亲卫队小猪施加<color=#FFFFFF>[加油！]</color>状态，持续10秒。",
      "stats": {}
    },
    {
      "id": "agent_1151_m4",
      "category": "agent",
      "sourceName": "露西",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "无规则球赛",
      "desc": "处于<color=#FFFFFF>[加油！]</color>状态下的友方单位，暴击伤害额外提升10%。",
      "stats": {
        "critDmg": 10
      }
    },
    {
      "id": "agent_1151_m6",
      "category": "agent",
      "sourceName": "露西",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "獠牙堪烈火",
      "desc": "处于<color=#FFFFFF>[加油！]</color>状态下的队友<color=#FFFFFF>[强化特殊技]</color>命中敌人时，\n一只亲卫队小猪会从空中落地引发爆炸，造成等同于亲卫队小猪300%攻击力的<color=#FF5521>火属性伤害</color>，\n并使全队角色、邦布和亲卫队小猪的<color=#FFFFFF>[加油！]</color>状态的持续时间提升5秒；\n持续时间最多提升3次，上限30秒，重新获得<color=#FFFFFF>[加油！]</color>状态时刷新可提升次数；\n亲卫队小猪落地引发爆炸后，将会发动一次<color=#FFFFFF>[亲卫队小猪：回旋挥击！]</color>。",
      "stats": {}
    }
  ],
  "莱特": [
    {
      "id": "agent_1161_core",
      "category": "agent",
      "sourceName": "莱特",
      "subType": "核心被动",
      "title": "核心被动：助燃剂",
      "desc": "莱特会随时间自动获得<color=#FFFFFF>[士气]</color>，每秒回复2.9点，队伍中任意角色每消耗1点能量值，额外为莱特回复0.26点<color=#FFFFFF>[士气]</color>，莱特最多拥有100点<color=#FFFFFF>[士气]</color>；<color=#FFFFFF>[士气]</color>回复至80点时，下一次换入前场将直接发动<color=#FFFFFF>[快速支援]</color>；<color=#FFFFFF>[士气]</color>大于等于80点后，莱特发动第五段<color=#FFFFFF>[普通攻击]</color>时，将进入<color=#FFFFFF>[士气喷发]</color>状态，提升<color=#FFFFFF>[普通攻击]</color>第五段中轻拳起攻、刺拳连击和终结一击的威力；威力提升后，招式命中敌人时，会持续消耗<color=#FFFFFF>[士气]</color>，每消耗10点<color=#FFFFFF>[士气]</color>，莱特的冲击力提升<color=#2BAD00>2%</color>，最多提升<color=#2BAD00>20%</color>，持续6秒；\n<color=#FFFFFF>[士气喷发]</color>状态下，莱特不再随时间自动获得<color=#FFFFFF>[士气]</color>，轻拳起攻或刺拳连击期间耗尽<color=#FFFFFF>[士气]</color>时，会自动衔接发动更加强力的终结一击；\n<color=#FFFFFF>[士气喷发]</color>状态下，轻拳起攻或刺拳连击命中敌人时，目标的<color=#98EFF0>冰属性伤害抗性</color>和<color=#FF5521>火属性伤害抗性</color>降低15%，持续30秒；\n<color=#FFFFFF>[士气喷发]</color>状态下，终结一击命中敌人时，会对目标施加<color=#FFFFFF>[溃败]</color>效果，使其进入失衡状态后的失衡持续时间提升3秒，从失衡状态恢复前<color=#FFFFFF>[溃败]</color>效果对同一目标最多触发一次；\n<color=#FFFFFF>[普通攻击]</color>第五段终结一击命中敌人、换回后场或<color=#FFFFFF>[士气]</color>耗尽时，莱特将退出<color=#FFFFFF>[士气喷发]</color>状态，尚未消耗的<color=#FFFFFF>[士气]</color>会被保留。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1161_add",
      "category": "agent",
      "sourceName": "莱特",
      "subType": "额外能力",
      "title": "额外能力：斗志昂扬",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>角色或与自身阵营相同的角色时触发：\n<color=#FFFFFF>[士气喷发]</color>状态下，莱特第五段<color=#FFFFFF>[普通攻击]</color>命中敌人时，全队角色获得一层<color=#FFFFFF>[昂扬]</color>，最多叠加20层，持续30秒，重复触发时刷新持续时间；每拥有一层<color=#FFFFFF>[昂扬]</color>，代理人造成的<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>提升1.25%，获得<color=#FFFFFF>[昂扬]</color>时，若莱特的冲击力高于170点，每超过10点冲击力会使每层<color=#FFFFFF>[昂扬]</color>提供的增益效果额外提升0.25%；队伍中任意角色发动<color=#FFFFFF>[连携技]</color>时，会刷新全队角色<color=#FFFFFF>[昂扬]</color>的持续时间；<color=#FFFFFF>[昂扬]</color>最多使代理人造成的<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>提升75%。",
      "stats": {
        "dmgBonus": 75
      }
    },
    {
      "id": "agent_1161_m1",
      "category": "agent",
      "sourceName": "莱特",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "常胜冠军",
      "desc": "在<color=#FFFFFF>[核心被动：助燃剂]</color>所施加的减益效果中，\n<color=#FFFFFF>[溃败]</color>效果将使失衡持续时间提升5秒，<color=#98EFF0>冰属性伤害抗性</color>和<color=#FF5521>火属性伤害抗性</color>将额外降低10%；\n在轻拳起攻或刺拳连击期间耗尽<color=#FFFFFF>[士气]</color>，自动衔接发动强力终结一击时，\n强力终结一击造成的伤害提升30%。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1161_m2",
      "category": "agent",
      "sourceName": "莱特",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "红围巾",
      "desc": "通过<color=#FFFFFF>[核心被动：助燃剂]</color>对敌人施加<color=#FFFFFF>[溃败]</color>效果时，目标的失衡易伤倍率提升25%；\n<color=#FFFFFF>[额外能力：斗志昂扬]</color>中由<color=#FFFFFF>[昂扬]</color>提供的<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>增益效果提升至原本的120%。",
      "stats": {
        "dazeVuln": 25
      }
    },
    {
      "id": "agent_1161_m4",
      "category": "agent",
      "sourceName": "莱特",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "墨镜",
      "desc": "莱特位于后场时，前场角色的能量自动回复效率提升10%；\n莱特进入<color=#FFFFFF>[士气喷发]</color>状态时，为后场角色回复4点能量，18秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1161_m6",
      "category": "agent",
      "sourceName": "莱特",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "幸存者",
      "desc": "莱特的<color=#FFFFFF>[士气]</color>回复效率提升至原本的200%；莱特在<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[闪避反击]</color>、<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[支援突击]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>中发动重击命中敌人时，将会触发<color=#FFFFFF>[火焰冲击]</color>效果，造成250%攻击力的<color=#FF5521>火属性伤害</color>，每个敌人8秒内最多触发一次；若莱特的冲击力高于170点，每超过1点冲击力会使<color=#FFFFFF>[火焰冲击]</color>的倍率额外提升5%，最多提升500%；在轻拳起攻或刺拳连击期间耗尽<color=#FFFFFF>[士气]</color>，自动衔接发动强力终结一击命中敌人时，可以忽略冷却时间，额外触发一次<color=#FFFFFF>[火焰冲击]</color>效果。",
      "stats": {}
    }
  ],
  "柏妮思": [
    {
      "id": "agent_1171_core",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "核心被动",
      "title": "核心被动：燃油特调",
      "desc": "柏妮思消耗能量值时，会为自身累积<color=#FFFFFF>[燃点]</color>，最多累积100点；每消耗1点能量值，能够累积1.4点<color=#FFFFFF>[燃点]</color>，当<color=#FFFFFF>[燃点]</color>累积至50点时，柏妮思将进入<color=#FFFFFF>[燃油特调]</color>状态，直到<color=#FFFFFF>[燃点]</color>耗尽；进入战场时，柏妮思立刻累积100点<color=#FFFFFF>[燃点]</color>；\n<color=#FFFFFF>[燃油特调]</color>状态下，柏妮思的<color=#FFFFFF>[普通攻击：炽焰搅拌式]</color>、<color=#FFFFFF>[强化特殊技：灼热摇荡法]</color>、<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>、<color=#FFFFFF>[连携技：燃油熔焰]</color>或<color=#FFFFFF>[终结技：纵享盛焰]</color>命中敌人时，将对目标施加<color=#FFFFFF>[灼伤]</color>效果，直到柏妮思退出<color=#FFFFFF>[燃油特调]</color>状态；队伍中其他角色攻击命中处于<color=#FFFFFF>[灼伤]</color>状态下的敌人时，会触发<color=#FFFFFF>[余烬]</color>效果，消耗8点<color=#FFFFFF>[燃点]</color>，对目标造成等同于柏妮思<color=#2BAD00>350%</color>攻击力的<color=#FF5521>火属性伤害</color>并累积<color=#FF5521>火属性异常积蓄值</color>，1.5秒内最多触发一次；每拥有10点异常精通，<color=#FFFFFF>[余烬]</color>效果造成的伤害提升1%，最多提升30%；<color=#FFFFFF>[余烬]</color>效果造成的伤害被视为<color=#FFFFFF>[支援攻击]</color>伤害。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1171_add",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "额外能力",
      "title": "额外能力：星火燎原",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或与自身阵营相同的角色时触发：\n柏妮思<color=#FFFFFF>[普通攻击：炽焰搅拌式]</color>、<color=#FFFFFF>[强化特殊技：灼热摇荡法]</color>、<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>命中敌人，或触发<color=#FFFFFF>[余烬]</color>效果时，招式累积的<color=#FF5521>火属性异常积蓄值</color>提升65%；队伍中任意角色对敌人施加<color=#FF5521>[灼烧]</color>效果时，该效果的持续时间提升3秒。",
      "stats": {}
    },
    {
      "id": "agent_1171_m1",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "热络同心",
      "desc": "<color=#FFFFFF>[燃点]</color>的上限从100点提升至140点，进入战场时，柏妮思额外累积40点<color=#FFFFFF>[燃点]</color>；\n<color=#FFFFFF>[余烬]</color>效果的伤害倍率提升，提升效果等同于柏妮思攻击力的100%；\n<color=#FFFFFF>[余烬]</color>效果累积的<color=#FF5521>火属性异常积蓄值</color>提升25%。",
      "stats": {}
    },
    {
      "id": "agent_1171_m2",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "加量不加价",
      "desc": "触发<color=#FFFFFF>[余烬]</color>效果时，将对敌人施加<color=#FFFFFF>[热意洞穿]</color>，\n最多叠加5层，持续6秒，重复触发时刷新持续时间；\n受到我方攻击时，目标每拥有一层<color=#FFFFFF>[热意洞穿]</color>，本次攻击的穿透率提升4%，最多提升20%。",
      "stats": {
        "penRatio": 20
      }
    },
    {
      "id": "agent_1171_m4",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "超绝燃油补给",
      "desc": "<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，招式的暴击率提升30%；\n<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>中，火焰喷射的持续时间上限提升1秒。",
      "stats": {
        "critRate": 30
      }
    },
    {
      "id": "agent_1171_m6",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "盛焰邀约",
      "desc": "柏妮思的<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>命中敌人时，将额外触发特殊的<color=#FFFFFF>[余烬]</color>效果，\n对目标造成等同于柏妮思60%攻击力的<color=#FF5521>火属性伤害</color>，0.5秒内最多触发1次，无需消耗<color=#FFFFFF>[燃点]</color>；\n发动<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>命中敌人后，招式发动期间，\n<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>、特殊的<color=#FFFFFF>[余烬]</color>效果、<color=#FF5521>[灼烧]</color>伤害\n将无视目标25%<color=#FF5521>火属性伤害抗性</color>；\n在<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>中发动火焰冲击命中处于<color=#FF5521>[灼烧]</color>状态下的敌人时，\n能够额外结算一次<color=#FF5521>[灼烧]</color>伤害，伤害效果等同于原本的1800%，同一目标20秒内最多触发一次。",
      "stats": {
        "resShred": 25
      }
    }
  ],
  "格莉丝": [
    {
      "id": "agent_1181_core",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "核心被动",
      "title": "核心被动：预驱动撞针",
      "desc": "格莉丝<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中敌人并造成<color=#F0D12B>物理伤害</color>时，获得一层<color=#FFFFFF>[电能]</color>（上限8层）；<color=#FFFFFF>[电能]</color>层数到达上限后，发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，会消耗所有<color=#FFFFFF>[电能]</color>，使招式累积的<color=#2EB6FF>电属性异常积蓄值</color>提升<color=#2BAD00>130%</color>。",
      "stats": {}
    },
    {
      "id": "agent_1181_add",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "额外能力",
      "title": "额外能力：技术支持班组",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n格莉丝<color=#FFFFFF>[强化特殊技]</color>命中敌人时，目标下次被施加<color=#2EB6FF>[感电]</color>效果时，受到的<color=#2EB6FF>[感电]</color>伤害提升18%，最多叠加2层，同一招式内每个敌人最多触发一次效果，<color=#2EB6FF>[感电]</color>状态结束时效果重置。",
      "stats": {
        "dmgBonus": 36
      }
    },
    {
      "id": "agent_1181_m1",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "再充能弹膛",
      "desc": "<color=#FFFFFF>[普通攻击]</color>第四段每次命中敌人时，全队角色回复0.25点能量；\n同一招式内，该效果最多为全队回复2点能量。",
      "stats": {}
    },
    {
      "id": "agent_1181_m2",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "电致击穿",
      "desc": "在<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>等招式中投掷手雷命中敌人时，\n目标的<color=#2EB6FF>电属性伤害抗性</color>降低8.5%，<color=#2EB6FF>电属性异常积蓄抗性</color>降低8.5%，持续8秒。",
      "stats": {
        "resShred": 17
      }
    },
    {
      "id": "agent_1181_m4",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "爆破电容",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>时，格莉丝获得6层充能（上限6层）；\n<color=#FFFFFF>[普通攻击：高压射钉]</color>或<color=#FFFFFF>[冲刺攻击：突击检查]</color>命中敌人时，消耗1层充能，使当前招式的能量获得效率提升20%。",
      "stats": {}
    },
    {
      "id": "agent_1181_m6",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "起爆扳机",
      "desc": "消耗所有<color=#FFFFFF>[电能]</color>发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，能够强化招式效果，\n额外投掷一颗手雷，并使每颗手雷造成的伤害提升至原本的200%。",
      "stats": {}
    }
  ],
  "艾莲": [
    {
      "id": "agent_1191_core",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "核心被动",
      "title": "核心被动：凌牙厉齿",
      "desc": "艾莲在<color=#FFFFFF>[冲刺攻击：冰渊潜袭]</color>中发动蓄力剪击，或消耗<color=#FFFFFF>[急冻充能]</color>发动<color=#FFFFFF>[普通攻击：急冻修剪法]</color>时，招式的暴击伤害提升<color=#2BAD00>100%</color>。",
      "stats": {
        "critDmg": 100
      }
    },
    {
      "id": "agent_1191_add",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "额外能力",
      "title": "额外能力：风暴潮",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n艾莲造成<color=#98EFF0>冰属性伤害</color>时，后继<color=#98EFF0>冰属性伤害</color>提升3%，持续10秒，最多叠加10层，重复触发时刷新持续时间。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1191_m1",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "凛冬前兆",
      "desc": "在<color=#FFFFFF>[冲刺攻击：冰渊潜袭]</color>中发动快速剪击命中敌人时，获得的<color=#FFFFFF>[急冻充能]</color>提升至3点；\n在<color=#FFFFFF>[冲刺攻击：冰渊潜袭]</color>中发动蓄力剪击命中敌人时，获得的<color=#FFFFFF>[急冻充能]</color>提升至6点；\n每消耗1点<color=#FFFFFF>[急冻充能]</color>，艾莲的暴击率提升2%，持续15秒，\n最多叠加6层，每层效果单独结算持续时间。",
      "stats": {
        "critRate": 2
      }
    },
    {
      "id": "agent_1191_m2",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "冰洋掠食者",
      "desc": "发动第三段<color=#FFFFFF>[普通攻击：急冻修剪法]</color>后，可以直接衔接发动<color=#FFFFFF>[强化特殊技：鲨卷风]</color>；\n发动<color=#FFFFFF>[强化特殊技]</color>时，每拥有1点<color=#FFFFFF>[急冻充能]</color>，\n当前招式造成的暴击伤害提升20%，最多提升60%。",
      "stats": {
        "critDmg": 60
      }
    },
    {
      "id": "agent_1191_m4",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "无休寒潮",
      "desc": "队伍中任意角色对敌人施加<color=#98EFF0>[冻结]</color>效果或使敌人失衡时，\n自身获得6点<color=#FFFFFF>[急冻充能]</color>和<color=#FFFFFF>[快蓄]</color>效果，并回复4点能量，能量回复效果10秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1191_m6",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "盛宴时分",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或获得<color=#FFFFFF>[快蓄]</color>时，\n艾莲的穿透率提升20%，持续6秒，同时获得1层<color=#FFFFFF>[盛宴]</color>，<color=#FFFFFF>[盛宴]</color>最多叠加3层；\n拥有3层<color=#FFFFFF>[盛宴]</color>后，在<color=#FFFFFF>[冲刺攻击：冰渊潜袭]</color>中发动蓄力剪击命中敌人时，\n消耗所有<color=#FFFFFF>[盛宴]</color>，使当前招式造成的伤害提升250%。",
      "stats": {
        "penRatio": 60,
        "dmgBonus": 250
      }
    }
  ],
  "悠真": [
    {
      "id": "agent_1201_core",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "核心被动",
      "title": "核心被动：破晓",
      "desc": "<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>的暴击率提升<color=#2BAD00>25%</color>，悠真的<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>命中敌人并触发暴击时，将获得1层<color=#FFFFFF>[锋芒]</color>，同一招式内最多获得3层，<color=#FFFFFF>[锋芒]</color>最多叠加6层，持续5秒，重复触发时刷新持续时间；每层<color=#FFFFFF>[锋芒]</color>会使<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>造成的暴击伤害提升<color=#2BAD00>12%</color>。",
      "stats": {
        "critRate": 150,
        "critDmg": 12
      }
    },
    {
      "id": "agent_1201_add",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "额外能力",
      "title": "额外能力：超频",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>角色或<color=#FFFFFF>[异常]</color>角色时触发：\n悠真攻击命中处于失衡状态或属性异常状态下的敌人时，自身造成的伤害提升40%；悠真发射<color=#FFFFFF>[落羽]</color>命中处于失衡状态或属性异常状态下的敌人时，会为其施加2层<color=#FFFFFF>[电囚]</color>效果。",
      "stats": {
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1201_m1",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "「意气风发」",
      "desc": "<color=#FFFFFF>[普通攻击：甲乙矢]</color>中，<color=#FFFFFF>[电囚]</color>效果的叠加层数上限提升至14层；\n<color=#FFFFFF>[电壶]</color>被激活时，将会向目标连续发射2支<color=#FFFFFF>[甲乙矢]</color>。",
      "stats": {}
    },
    {
      "id": "agent_1201_m2",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "挥霍",
      "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，悠真获得7层<color=#FFFFFF>[电掣]</color>，最多叠加7层；\n拥有<color=#FFFFFF>[电掣]</color>时，<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>造成的伤害提升50%；\n<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>结束后，消耗1层<color=#FFFFFF>[电掣]</color>。",
      "stats": {
        "dmgBonus": 50
      }
    },
    {
      "id": "agent_1201_m4",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "偶有充盈",
      "desc": "<color=#FFFFFF>[电囚]</color>效果的持续时间提升至20秒；\n<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>命中敌人时，悠真获得30点喧响值，同一招式内最多触发一次；\n发动<color=#FFFFFF>[终结技]</color>时，将为场上所有敌人施加满层<color=#FFFFFF>[电囚]</color>效果。",
      "stats": {}
    },
    {
      "id": "agent_1201_m6",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "会心",
      "desc": "<color=#FFFFFF>[甲乙矢]</color>命中处于失衡状态或属性异常状态下的敌人后，\n悠真将无视其15%<color=#2EB6FF>电属性伤害抗性</color>，持续12秒；\n<color=#FFFFFF>[甲乙矢]</color>每命中同一名敌人12次，\n将额外触发1次电磁爆炸，对目标造成悠真1500%攻击力的<color=#2EB6FF>电属性伤害</color>。",
      "stats": {}
    }
  ],
  "丽娜": [
    {
      "id": "agent_1211_core",
      "category": "agent",
      "sourceName": "丽娜",
      "subType": "核心被动",
      "title": "核心被动：迷你毁灭拍档",
      "desc": "指派杜苏拉或安娜塔莎进行攻击时，队伍中其他角色的穿透率随丽娜自身的穿透率提升，提升效果等同于丽娜25%穿透率+<color=#2BAD00>12%</color>，最高提升30%，杜苏拉和安娜塔莎均返回丽娜身边后，对应增益效果结束。",
      "stats": {
        "penRatio": 30
      }
    },
    {
      "id": "agent_1211_add",
      "category": "agent",
      "sourceName": "丽娜",
      "subType": "额外能力",
      "title": "额外能力：完美舞会",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n队伍中任意角色对敌人施加<color=#2EB6FF>[感电]</color>效果时，该效果的持续时间提升3秒；场上存在处于<color=#2EB6FF>[感电]</color>状态下的敌人时，全队角色造成的<color=#2EB6FF>电属性伤害</color>提升10%。",
      "stats": {
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1211_m1",
      "category": "agent",
      "sourceName": "丽娜",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "双人领舞",
      "desc": "被指派并发动攻击后，返回丽娜身边前，杜苏拉和安娜塔莎会在原处额外逗留5.5秒；\n在杜苏拉或安娜塔莎附近10米范围内的角色，\n从<color=#FFFFFF>[核心被动：迷你毁灭拍档]</color>中获得的增益效果提升至原本的130%。",
      "stats": {}
    },
    {
      "id": "agent_1211_m2",
      "category": "agent",
      "sourceName": "丽娜",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "主人的典范",
      "desc": "成为接战状态下的当前操作角色时，丽娜造成的伤害提升15%，持续12秒，18秒内最多触发一次。",
      "stats": {
        "dmgBonus": 15
      }
    },
    {
      "id": "agent_1211_m4",
      "category": "agent",
      "sourceName": "丽娜",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "针与锤",
      "desc": "杜苏拉和安娜塔莎均被指派在外时，丽娜的能量自动回复速度提升0.5点/秒；\n杜苏拉或安娜塔莎返回丽娜身边时，对应增益效果结束。",
      "stats": {}
    },
    {
      "id": "agent_1211_m6",
      "category": "agent",
      "sourceName": "丽娜",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "雷雨夜惊魂",
      "desc": "<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>命中敌人时，全队角色造成的<color=#2EB6FF>电属性伤害</color>提升15%，持续8秒。",
      "stats": {
        "dmgBonus": 15
      }
    }
  ],
  "柳": [
    {
      "id": "agent_1221_core",
      "category": "agent",
      "sourceName": "柳",
      "subType": "核心被动",
      "title": "核心被动：月蚀",
      "desc": "月城柳发动<color=#FFFFFF>[强化特殊技]</color>后，队伍中任意角色对敌人施加<color=#FFFFFF>[紊乱]</color>效果时，<color=#FFFFFF>[紊乱]</color>效果的伤害倍率提升<color=#2BAD00>250%</color>，持续15秒；<color=#FFFFFF>[强化特殊技]</color>命中敌人时，月城柳对目标造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>20%</color>，持续15秒。",
      "stats": {
        "dmgBonus": 270
      }
    },
    {
      "id": "agent_1221_add",
      "category": "agent",
      "sourceName": "柳",
      "subType": "额外能力",
      "title": "额外能力：月相",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或与自身属性相同的角色时触发：\n架势切换后，月城柳发动<color=#FFFFFF>[普通攻击：夜见尊神乐]</color>命中敌人时累积的<color=#2EB6FF>电属性异常积蓄值</color>提升45%，持续8秒。",
      "stats": {}
    },
    {
      "id": "agent_1221_skill_1_2",
      "category": "agent",
      "sourceName": "柳",
      "subType": "特殊技",
      "title": "普通攻击：夜见尊神乐",
      "desc": "月城柳拥有<color=#FFFFFF>[上弦]</color>和<color=#FFFFFF>[下弦]</color>两种架势；\n点按  发动：\n根据当前架势，向前方进行至多五段的斩击，造成<color=#F0D12B>物理伤害</color>和<color=#2EB6FF>电属性伤害</color>；\n在战斗中，月城柳可根据当前架势类型获得对应的架势增益：\n<color=#FFFFFF>[上弦]</color>架势增益：自身造成的<color=#2EB6FF>电属性伤害</color>提升10%，<color=#FFFFFF>[普通攻击]</color>发动期间抗打断等级提升；\n<color=#FFFFFF>[下弦]</color>架势增益：自身穿透率提升10%，<color=#FFFFFF>[普通攻击]</color>的打断等级提升；\n架势切换后，月城柳仍可继续保有上一架势的架势增益，持续8秒。",
      "stats": {
        "dmgBonus": 10,
        "penRatio": 10
      }
    },
    {
      "id": "agent_1221_m1",
      "category": "agent",
      "sourceName": "柳",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "知己知彼",
      "desc": "队伍中任意角色对敌人施加属性异常效果时，\n月城柳会获得1层<color=#FFFFFF>[洞悉]</color>，持续15秒，最多叠加3层，重复触发时刷新持续时间；\n受到敌方攻击时，月城柳将消耗1层<color=#FFFFFF>[洞悉]</color>并获得无敌效果，持续1秒；\n拥有1层或以上<color=#FFFFFF>[洞悉]</color>时，月城柳的异常精通提升80点。",
      "stats": {
        "anomalyMastery": 80
      }
    },
    {
      "id": "agent_1221_m2",
      "category": "agent",
      "sourceName": "柳",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "卓越适应性",
      "desc": "<color=#FFFFFF>[强化特殊技]</color>中，快速突刺累积的<color=#2EB6FF>电属性异常积蓄值</color>提升20%；\n快速突刺命中敌人时，保持长按「特殊攻击」按键，可以额外消耗10点能量，再次发动突刺攻击，\n能量不足或停止长按后将自动衔接下落攻击；\n下落攻击命中处于属性异常状态下的敌人并触发<color=#FFFFFF>[极性紊乱]</color>效果时，\n对目标造成的伤害倍率提升至原本<color=#FFFFFF>[紊乱]</color>效果的20%，\n每额外发动一次突刺攻击，该伤害倍率额外提升15%，伤害倍率额外提升效果最多触发2次。",
      "stats": {
        "dmgBonus": 15
      }
    },
    {
      "id": "agent_1221_m4",
      "category": "agent",
      "sourceName": "柳",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "掌棋者",
      "desc": "月城柳对敌人造成属性异常伤害时，会为其施加<color=#FFFFFF>[识破]</color>效果，持续15秒；\n处于<color=#FFFFFF>[识破]</color>效果下的敌人受到攻击时，本次攻击的穿透率提升16%。",
      "stats": {
        "penRatio": 16
      }
    },
    {
      "id": "agent_1221_m6",
      "category": "agent",
      "sourceName": "柳",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "非人之血",
      "desc": "在<color=#FFFFFF>[强化特殊技]</color>中发动突刺攻击后，<color=#FFFFFF>[森罗万象]</color>状态的持续时间提升至30秒，\n状态持续期间，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升20%；\n<color=#FFFFFF>[卓越适应性]</color>中，<color=#FFFFFF>[极性紊乱]</color>伤害倍率额外提升效果的触发次数上限提升至4次，\n前4次额外发动突刺攻击时所需的能量消耗减半。",
      "stats": {
        "dmgBonus": 20
      }
    }
  ],
  "朱鸢": [
    {
      "id": "agent_1241_core",
      "category": "agent",
      "sourceName": "朱鸢",
      "subType": "核心被动",
      "title": "核心被动：特种弹药",
      "desc": "朱鸢在<color=#FFFFFF>[压制模式]</color>下，消耗<color=#FFFFFF>[强化霰弹]</color>进行攻击时，招式造成的伤害提升<color=#2BAD00>40%</color>，攻击处于失衡状态下的敌人时，该增益效果额外提升<color=#2BAD00>40%</color>；进入战场时，朱鸢立刻获得6枚<color=#FFFFFF>[强化霰弹]</color>。",
      "stats": {
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1241_add",
      "category": "agent",
      "sourceName": "朱鸢",
      "subType": "额外能力",
      "title": "额外能力：武装协同",
      "desc": "队伍中存在<color=#FFFFFF>[支援]</color>角色或与自身阵营相同的角色时触发：\n朱鸢发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，自身暴击率提升30%，持续10秒。",
      "stats": {
        "critRate": 30
      }
    },
    {
      "id": "agent_1241_m1",
      "category": "agent",
      "sourceName": "朱鸢",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "快速装填",
      "desc": "朱鸢发动<color=#FFFFFF>[连携技]</color>/<color=#FFFFFF>[终结技]</color>时，将获得<color=#FFFFFF>[快速装填]</color>效果；\n当朱鸢拥有<color=#FFFFFF>[快速装填]</color>效果时，耗尽所有<color=#FFFFFF>[强化霰弹]</color>后，\n将消耗<color=#FFFFFF>[快速装填]</color>效果，立刻获得6/9枚<color=#FFFFFF>[强化霰弹]</color>。",
      "stats": {}
    },
    {
      "id": "agent_1241_m2",
      "category": "agent",
      "sourceName": "朱鸢",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "以太余烬",
      "desc": "<color=#FFFFFF>[压制模式]</color>下，朱鸢的抗打断等级提升，受到伤害降低10%；\n消耗<color=#FFFFFF>[强化霰弹]</color>攻击命中敌人时，<color=#FFFFFF>[普通攻击：请勿抵抗]</color>与<color=#FFFFFF>[冲刺攻击：火力压制]</color>造成的\n<color=#FE437E>以太伤害</color>提升10%，最多叠加5层，持续5秒，\n每次开火最多获得一层效果，重复触发时刷新持续时间。",
      "stats": {
        "dmgBonus": 50
      }
    },
    {
      "id": "agent_1241_m4",
      "category": "agent",
      "sourceName": "朱鸢",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "以太侵彻",
      "desc": "朱鸢消耗<color=#FFFFFF>[强化霰弹]</color>攻击命中敌人时，\n<color=#FFFFFF>[普通攻击：请勿抵抗]</color>与<color=#FFFFFF>[冲刺攻击：火力压制]</color>无视目标25%<color=#FE437E>以太伤害抗性</color>。",
      "stats": {
        "resShred": 25
      }
    },
    {
      "id": "agent_1241_m6",
      "category": "agent",
      "sourceName": "朱鸢",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "扩容能源包-叁型",
      "desc": "朱鸢累计消耗12枚<color=#FFFFFF>[强化霰弹]</color>时，将获得<color=#FFFFFF>[以太余温]</color>效果，\n并使下次发动的<color=#FFFFFF>[强化特殊技]</color>能量消耗降低30点；\n发动<color=#FFFFFF>[强化特殊技]</color>时，将消耗<color=#FFFFFF>[以太余温]</color>效果，额外发射总计4枚以太鹿弹，\n每枚额外发射的以太鹿弹将造成朱鸢220%攻击力的伤害。",
      "stats": {}
    }
  ],
  "青衣": [
    {
      "id": "agent_1251_core",
      "category": "agent",
      "sourceName": "青衣",
      "subType": "核心被动",
      "title": "核心被动：千秋岁",
      "desc": "青衣在<color=#FFFFFF>[普通攻击：醉花月云转]</color>中发动终结一击命中敌人时，会对敌人施加5层<color=#FFFFFF>[羁服]</color>，最多叠加20层，每层<color=#FFFFFF>[羁服]</color>能够使目标的失衡易伤倍率提升<color=#2BAD00>4%</color>；在<color=#FFFFFF>[普通攻击：醉花月云转]</color>中每发动一次突进攻击，终结一击将额外施加1层<color=#FFFFFF>[羁服]</color>，在发动终结一击时，若触发<color=#FFFFFF>[极限闪避]</color>，可以直接施加10层<color=#FFFFFF>[羁服]</color>；对普通或精英敌人施加[羁服]时，施加的层数翻倍；目标从失衡状态恢复时，对应<color=#FFFFFF>[羁服]</color>层数重置。",
      "stats": {
        "dazeVuln": 80
      }
    },
    {
      "id": "agent_1251_add",
      "category": "agent",
      "sourceName": "青衣",
      "subType": "额外能力",
      "title": "额外能力：阳关三叠",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>角色或与自身阵营相同的角色时触发：\n<color=#FFFFFF>[普通攻击]</color>造成的失衡值提升20%；此外，若青衣的冲击力高于120点，每超过1点冲击力会使自身的攻击力提升6点，通过这种方式最多使自身的攻击力提升600点。",
      "stats": {}
    },
    {
      "id": "agent_1251_skill_1_2",
      "category": "agent",
      "sourceName": "青衣",
      "subType": "特殊技",
      "title": "连携技：太平令",
      "desc": "触发<color=#FFFFFF>[连携技]</color>时，选择对应角色发动：\n对前方大范围区域发动强力连续打击，造成大量<color=#2EB6FF>电属性伤害</color>；\n攻击命中敌人时，目标每拥有一层<color=#FFFFFF>[核心被动：千秋岁]</color>中的<color=#FFFFFF>[羁服]</color>，招式对其造成的伤害提升3%；\n招式发动期间拥有无敌效果。",
      "stats": {
        "dmgBonus": 3
      }
    },
    {
      "id": "agent_1251_m1",
      "category": "agent",
      "sourceName": "青衣",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "介电击穿",
      "desc": "青衣进入战场时，立即使<color=#FFFFFF>[闪络电压]</color>回复至上限，并使其后继累积效率提升30%；\n发动<color=#FFFFFF>[普通攻击：醉花月云转]</color>时，若<color=#FFFFFF>[闪络电压]</color>已累积至上限，\n则使本次招式命中的敌人防御力降低15%，且自身对该目标的暴击率提升20%，持续15秒。",
      "stats": {
        "defShred": 15,
        "critRate": 20
      }
    },
    {
      "id": "agent_1251_m2",
      "category": "agent",
      "sourceName": "青衣",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "四两拨千斤",
      "desc": "<color=#FFFFFF>[核心被动：千秋岁]</color>中每层<color=#FFFFFF>[羁服]</color>提供的失衡易伤倍率提升效果提升至原本的135%；\n青衣攻击命中敌人时，若对其施加的<color=#FFFFFF>[羁服]</color>已叠加至层数上限，\n则自身对其造成的失衡值提升15%。",
      "stats": {}
    },
    {
      "id": "agent_1251_m4",
      "category": "agent",
      "sourceName": "青衣",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "稳态电弧屏障",
      "desc": "进入或退出<color=#FFFFFF>[闪络]</color>状态时，获得等同于青衣10%生命值上限的护盾；\n护盾效果刷新时，如果上一次获得的护盾仍然存在，则为青衣回复5点能量，\n能量回复效果10秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1251_m6",
      "category": "agent",
      "sourceName": "青衣",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "奇经八脉",
      "desc": "<color=#FFFFFF>[普通攻击：醉花月云转]</color>的打断等级大幅提升，招式的暴击伤害额外提升100%；\n青衣<color=#FFFFFF>[普通攻击：醉花月云转]</color>命中敌人时，目标的全属性伤害抗性降低20%，持续15秒。",
      "stats": {
        "critDmg": 100,
        "resShred": 20
      }
    }
  ],
  "简": [
    {
      "id": "agent_1261_core",
      "category": "agent",
      "sourceName": "简",
      "subType": "核心被动",
      "title": "核心被动：洞察",
      "desc": "简攻击命中敌人时，会使其陷入<color=#FFFFFF>[啮咬]</color>状态，持续10秒；队伍中任意角色对处于<color=#FFFFFF>[啮咬]</color>状态下的敌人触发<color=#F0D12B>[强击]</color>并施加<color=#F0D12B>[畏缩]</color>效果时，<color=#F0D12B>[畏缩]</color>效果的持续时间提升5秒；对处于<color=#FFFFFF>[啮咬]</color>状态下的敌人造成的<color=#F0D12B>[强击]</color>伤害有概率触发暴击，基础暴击率为<color=#2BAD00>40%</color>，暴击伤害为50%，简的每点异常精通会使该效果的暴击率额外提升<color=#2BAD00>0.16%</color>。",
      "stats": {
        "critRate": 0.16
      }
    },
    {
      "id": "agent_1261_add",
      "category": "agent",
      "sourceName": "简",
      "subType": "额外能力",
      "title": "额外能力：痛点",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或与自身阵营相同的角色时触发：\n简的<color=#F0D12B>物理异常积蓄效率</color>提升20%，当敌人已经处于属性异常状态下时，简对其累积的<color=#F0D12B>物理异常积蓄值</color>额外提升15%。",
      "stats": {}
    },
    {
      "id": "agent_1261_m1",
      "category": "agent",
      "sourceName": "简",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "犯罪顾问",
      "desc": "<color=#FFFFFF>[普通攻击：萨霍夫跳]</color>的可使用次数上限增加一次；\n在<color=#FFFFFF>[狂热]</color>状态下，简的<color=#F0D12B>物理异常积蓄效率</color>额外提升15%，同时每点异常精通将会使自身造成的伤害提升0.1%，最多提升30%。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1261_m2",
      "category": "agent",
      "sourceName": "简",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "近朱者赤",
      "desc": "简攻击命中处于<color=#FFFFFF>[啮咬]</color>状态下的敌人，或队伍中任意角色对处于<color=#FFFFFF>[啮咬]</color>状态下的敌人触发<color=#F0D12B>[强击]</color>时，将会无视其15%防御力，当<color=#F0D12B>[强击]</color>伤害触发暴击时，其暴击伤害额外提升50%。",
      "stats": {
        "critDmg": 50
      }
    },
    {
      "id": "agent_1261_m4",
      "category": "agent",
      "sourceName": "简",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "因势利导",
      "desc": "队伍中任意角色触发<color=#F0D12B>[强击]</color>或<color=#FFFFFF>[紊乱]</color>效果时，\n全队角色造成的属性异常伤害提升18%，持续15秒。",
      "stats": {
        "dmgBonus": 18
      }
    },
    {
      "id": "agent_1261_m6",
      "category": "agent",
      "sourceName": "简",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "「肮脏」技巧",
      "desc": "<color=#FFFFFF>[狂热]</color>状态下，简的暴击率提升20%，暴击伤害提升40%；队伍中任意角色对敌人施加<color=#F0D12B>[强击]</color>效果时，简将直接进入<color=#FFFFFF>[狂热]</color>状态，并使<color=#FFFFFF>[狂热心流]</color>回复至上限，此次<color=#F0D12B>[强击]</color>伤害触发暴击时，将会对目标发动一次额外攻击，造成等同于简1600%异常精通的<color=#F0D12B>物理伤害</color>。",
      "stats": {
        "critRate": 20,
        "critDmg": 40
      }
    }
  ],
  "赛斯": [
    {
      "id": "agent_1271_core",
      "category": "agent",
      "sourceName": "赛斯",
      "subType": "核心被动",
      "title": "核心被动：守望者",
      "desc": "赛斯发动<color=#FFFFFF>[强化特殊技：电光盾冲-高伏特]</color>时，会获得等同于自身<color=#2BAD00>80%</color>初始攻击力的护盾<color=#FFFFFF>[匪石之盾]</color>，最高不超过3000点，持续25秒，10秒内最多触发一次；队伍中其他角色通过<color=#FFFFFF>[普通攻击：雷霆击-感电]</color>或<color=#FFFFFF>[支援突击：治安裁决]</color>所触发的<color=#FFFFFF>[快速支援]</color>或<color=#FFFFFF>[连携技]</color>入场时，会为该队友提供等同于赛斯<color=#2BAD00>80%</color>初始攻击力的护盾<color=#FFFFFF>[匪石之盾]</color>，最高不超过3000点，持续25秒，10秒内最多触发一次；拥有<color=#FFFFFF>[匪石之盾]</color>时，持有者的异常精通提升<color=#2BAD00>100</color>点。",
      "stats": {
        "inCombatAtkFlat": 6000,
        "anomalyMastery": 100
      }
    },
    {
      "id": "agent_1271_add",
      "category": "agent",
      "sourceName": "赛斯",
      "subType": "额外能力",
      "title": "额外能力：意气风发",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n赛斯发动<color=#FFFFFF>[连携技：最终制裁]</color>命中敌人或在<color=#FFFFFF>[普通攻击：雷霆击-感电]</color>中发动终结一击命中敌人时，目标的全属性异常积蓄抗性降低20%，持续20秒。",
      "stats": {
        "resShred": 20
      }
    },
    {
      "id": "agent_1271_m1",
      "category": "agent",
      "sourceName": "赛斯",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "英雄主义",
      "desc": "<color=#FFFFFF>[匪石之盾]</color>提供的护盾及其上限提升30%；\n<color=#FFFFFF>[匪石之盾]</color>失效时，<color=#FFFFFF>[核心被动：守望者]</color>提供的异常精通提升效果额外维持10秒。",
      "stats": {}
    },
    {
      "id": "agent_1271_m2",
      "category": "agent",
      "sourceName": "赛斯",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "年少轻狂",
      "desc": "进入战场时，赛斯立刻为自身累积75%<color=#FFFFFF>[意气]</color>；\n发动<color=#FFFFFF>[普通攻击：雷霆击-感电]</color>命中敌人时，招式累积的<color=#2EB6FF>电属性异常积蓄值</color>提升35%。",
      "stats": {}
    },
    {
      "id": "agent_1271_m4",
      "category": "agent",
      "sourceName": "赛斯",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "初心",
      "desc": "<color=#FFFFFF>[招架支援：迅雷盾]</color>造成的失衡值提升25%。",
      "stats": {}
    },
    {
      "id": "agent_1271_m6",
      "category": "agent",
      "sourceName": "赛斯",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "理想主义",
      "desc": "赛斯在<color=#FFFFFF>[普通攻击：雷霆击-感电]</color>中发动终结一击命中敌人时，\n额外造成自身500%攻击力的伤害，本次攻击必定触发暴击，且暴击伤害提升60%。",
      "stats": {
        "critDmg": 60
      }
    }
  ],
  "派派": [
    {
      "id": "agent_1281_core",
      "category": "agent",
      "sourceName": "派派",
      "subType": "核心被动",
      "title": "核心被动：动力蓄能",
      "desc": "派派在<color=#FFFFFF>[强化特殊技：引擎转]</color>或<color=#FFFFFF>[终结技]</color>中发动旋转斩击命中敌人时，获得1层<color=#FFFFFF>[动力]</color>，最多叠加20层，持续12秒，重复触发时刷新持续时间；每拥有一层<color=#FFFFFF>[动力]</color>，派派的<color=#F0D12B>物理异常积蓄效率</color>提升<color=#2BAD00>4%</color>。",
      "stats": {}
    },
    {
      "id": "agent_1281_add",
      "category": "agent",
      "sourceName": "派派",
      "subType": "额外能力",
      "title": "额外能力：同步疾驰",
      "desc": "队伍中存在与自身属性或阵营相同的角色或其他<color=#FFFFFF>[异常]</color>角色时触发：\n派派拥有20层或以上<color=#FFFFFF>[动力]</color>时，全队角色造成的伤害提升18%。",
      "stats": {
        "dmgBonus": 18
      }
    },
    {
      "id": "agent_1281_m1",
      "category": "agent",
      "sourceName": "派派",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "悠闲一刻",
      "desc": "派派在<color=#FFFFFF>[特殊技：轮胎转]</color>、<color=#FFFFFF>[强化特殊技：引擎转]</color>或<color=#FFFFFF>[终结技]</color>中发动旋转斩击命中敌人时，\n有50%概率额外获得1层<color=#FFFFFF>[动力]</color>，<color=#FFFFFF>[动力]</color>的叠加层数上限提升至30层。",
      "stats": {}
    },
    {
      "id": "agent_1281_m2",
      "category": "agent",
      "sourceName": "派派",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "上进心",
      "desc": "在<color=#FFFFFF>[特殊技：轮胎转]</color>和<color=#FFFFFF>[强化特殊技：引擎转]</color>发动期间，派派的移动速度有所提升；\n在<color=#FFFFFF>[特殊技：有亿点重]</color>、<color=#FFFFFF>[强化特殊技：非常重]</color>和<color=#FFFFFF>[终结技]</color>中发动下砸攻击命中敌人时，\n招式造成的<color=#F0D12B>物理伤害</color>提升10%，每拥有1层<color=#FFFFFF>[动力]</color>，该增益效果额外提升1%。",
      "stats": {
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1281_m4",
      "category": "agent",
      "sourceName": "派派",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "技巧娴熟",
      "desc": "队伍中任意角色对敌人施加属性异常效果时，派派回复20点能量，30秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1281_m6",
      "category": "agent",
      "sourceName": "派派",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "轻度兴奋",
      "desc": "<color=#FFFFFF>[强化特殊技：引擎转]</color>的持续时间上限提升2秒，<color=#FFFFFF>[动力]</color>的持续时间提升4秒。",
      "stats": {}
    }
  ],
  "雨果": [
    {
      "id": "agent_1291_core",
      "category": "agent",
      "sourceName": "雨果",
      "subType": "核心被动",
      "title": "核心被动：终末裁决",
      "desc": "<color=#FFFFFF>[连携技：命运戏法]</color>命中敌人或雨果的攻击使敌人失衡时，雨果获得<color=#FFFFFF>[暗渊回响]</color>状态，持续6秒，重复触发时刷新持续时间，该状态下雨果的暴击率提升12%，暴击伤害提升25%；\n队伍中存在其他1/2名<color=#FFFFFF>[击破]</color>角色时，雨果的攻击力提升<color=#2BAD00>300</color>/<color=#2BAD00>900</color>点；\n<color=#FFFFFF>[强化特殊技：魂狩·惩戒]</color>或<color=#FFFFFF>[终结技：渎神者]</color>的终结一击命中敌人时，若敌人处于失衡状态，会对其触发<color=#FFFFFF>[决算]</color>效果，使得招式的终结一击伤害倍率提升<color=#2BAD00>1000%</color>，此外<color=#FFFFFF>[决算]</color>效果会根据触发时敌人剩余的失衡时间，使得该招式伤害倍率进一步提升：敌人失衡时间小于等于5秒的部分，每剩余1秒，招式伤害倍率提升<color=#2BAD00>280%</color>，5秒到15秒的部分，每剩余1秒，招式伤害倍率提升<color=#2BAD00>100%</color>，总共最多可以提升<color=#2BAD00>3400%</color>的招式伤害倍率；\n雨果触发<color=#FFFFFF>[决算]</color>效果后，敌人的失衡状态会立即结束，并且根据<color=#FFFFFF>[决算]</color>效果触发时该敌人剩余的失衡时间立即累积一定失衡值，失衡时间每剩余1秒，则积累5%失衡值，最多累积等同于敌人失衡值上限25%的失衡值；\n<color=#FFFFFF>[强化特殊技：魂狩·惩戒]</color>命中敌人时，若敌人处于非失衡状态，招式累积的失衡值提升20%。",
      "stats": {
        "critRate": 12,
        "critDmg": 25,
        "inCombatAtkFlat": 900,
        "dmgBonus": 1380
      }
    },
    {
      "id": "agent_1291_add",
      "category": "agent",
      "sourceName": "雨果",
      "subType": "额外能力",
      "title": "额外能力：终焉序曲",
      "desc": "队伍中存在其他<color=#FFFFFF>[击破]</color>角色或与自身属性相同的角色时触发：\n<color=#FFFFFF>[连携技：命运戏法]</color>造成的伤害提升15%，对普通敌人造成的伤害额外提升35%；触发<color=#FFFFFF>[决算]</color>时，招式造成的伤害提升40%，<color=#FFFFFF>[强化特殊技：魂狩·惩戒]</color>对普通敌人触发<color=#FFFFFF>[决算]</color>效果时额外回复20点能量，能量回复效果30秒内最多触发一次。",
      "stats": {
        "dmgBonus": 90
      }
    },
    {
      "id": "agent_1291_m1",
      "category": "agent",
      "sourceName": "雨果",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "仇恨之子",
      "desc": "<color=#FFFFFF>[暗渊回响]</color>状态下，\n触发<color=#FFFFFF>[决算]</color>效果时招式的暴击率额外提升12%，暴击伤害额外提升30%。",
      "stats": {
        "critRate": 12,
        "critDmg": 30
      }
    },
    {
      "id": "agent_1291_m2",
      "category": "agent",
      "sourceName": "雨果",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "内在小孩",
      "desc": "<color=#FFFFFF>[终结技：渎神者]</color>触发<color=#FFFFFF>[决算]</color>效果时不会使敌人的失衡状态结束；\n此外，触发<color=#FFFFFF>[决算]</color>效果时招式将会无视其15%防御力。",
      "stats": {}
    },
    {
      "id": "agent_1291_m4",
      "category": "agent",
      "sourceName": "雨果",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "拟剧论",
      "desc": "蓄力射击命中敌人后，雨果的攻击对该目标无视12%<color=#98EFF0>冰属性伤害抗性</color>，持续15秒，重复触发时刷新持续时间。",
      "stats": {
        "resShred": 12
      }
    },
    {
      "id": "agent_1291_m6",
      "category": "agent",
      "sourceName": "雨果",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "荆棘王冠",
      "desc": "所有射击攻击命中敌人时，均可触发<color=#FFFFFF>[暗渊回响]</color>状态，\n最多持续6秒，重复触发时刷新持续时间；\n此外，任意招式触发<color=#FFFFFF>[决算]</color>效果时，此次伤害额外提升60%；\n<color=#FFFFFF>[强化特殊技：魂狩·惩戒]</color>的终结一击命中非失衡状态下的敌人时也可触发<color=#FFFFFF>[决算]</color>效果，\n使得招式的终结一击伤害倍率固定提升1000%。",
      "stats": {
        "dmgBonus": 60
      }
    }
  ],
  "奥菲丝": [
    {
      "id": "agent_1301_core",
      "category": "agent",
      "sourceName": "奥菲丝",
      "subType": "核心被动",
      "title": "核心被动：衔风驭火",
      "desc": "奥菲丝&「鬼火」的暴击率提升<color=#2BAD00>25%</color>，[追加攻击]造成的伤害提升<color=#2BAD00>85%</color>；\n奥菲丝&「鬼火」初始获得100点[蓄炎]，最多获得125点；\n奥菲丝&「鬼火」处于后台时，若可释放[特殊技：蚀光一闪]且能量大于等于60点时，改为消耗30点能量自动释放[强化特殊技：灼红旋涡];\n[强化特殊技：蓄热充能]的激光命中敌人时，使全队角色获得[准星聚焦]效果，持续12秒，重复触发时刷新持续时间，代理人拥有[准星聚焦]效果时，攻击力提升<color=#2BAD00>280</color>点，当奥菲丝&「鬼火」的初始能量自动回复大于等于1.6点时，超过的部分每拥有0.1点初始能量自动回复，攻击力额外提升20点，初始提升与额外提升总共不超过<color=#2BAD00>700</color>点，拥有[准星聚焦]的代理人发动[追加攻击]时，将会使自身的[准星聚焦]效果延长4秒，最多延长20秒；\n[普通攻击：高压火枪]的火刀攻击、[强化特殊技：小心脚下]、[强化特殊技：灼红旋涡]、[强化特殊技：蓄热充能]、[强化特殊技：燥焰迸射]、[连携技：枪管过热]、[终结技：与火共舞]造成的伤害均视为追加攻击伤害，发动上述招式视为发动[追加攻击]。",
      "stats": {
        "critRate": 25,
        "dmgBonus": 85,
        "inCombatAtkFlat": 280
      }
    },
    {
      "id": "agent_1301_add",
      "category": "agent",
      "sourceName": "奥菲丝",
      "subType": "额外能力",
      "title": "额外能力：熔炉所铸",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>角色或<color=#FFFFFF>[支援]</color>角色时触发：\n拥有[准星聚焦]的代理人攻击造成的[追加攻击]伤害无视25%防御力。",
      "stats": {
        "defShred": 25
      }
    },
    {
      "id": "agent_1301_m1",
      "category": "agent",
      "sourceName": "奥菲丝",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "豪华猫屋",
      "desc": "奥菲丝&「鬼火」发动[特殊技：蚀光一闪]、[强化特殊技：灼红旋涡]、\n[强化特殊技：蓄热充能]、[强化特殊技：燥焰迸射]造成的伤害无视15%<color=#FF5521>火属性伤害抗性</color>，\n且拥有[准星聚焦]的代理人攻击造成的伤害提升20%。",
      "stats": {
        "resShred": 15,
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1301_m2",
      "category": "agent",
      "sourceName": "奥菲丝",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "怪味食品清单",
      "desc": "奥菲丝&「鬼火」每次发动[追加攻击]时回复65点喧响值，4秒内最多触发一次；\n奥菲丝&「鬼火」发动[终结技]后，自身的攻击力提升20%，最多持续45秒。",
      "stats": {
        "inCombatAtkPct": 20
      }
    },
    {
      "id": "agent_1301_m4",
      "category": "agent",
      "sourceName": "奥菲丝",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "粉红色枪套",
      "desc": "[准星聚焦]的初始时间提高至16秒，\n且奥菲丝&「鬼火」发动[强化特殊技：蓄热充能]或[终结技：与火共舞]\n造成的伤害提高40%。",
      "stats": {
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1301_m6",
      "category": "agent",
      "sourceName": "奥菲丝",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "魔法种子",
      "desc": "能量足够时，[普通攻击：高压火枪]的火刀攻击后\n可点按  直接衔接[强化特殊技：灼红旋涡]；\n[普通攻击：高压火枪]的火刀攻击发动时，回复10点[蓄炎]，\n[强化特殊技：蓄热充能]低火力期间打断等级也会提高；\n[强化特殊技：蓄热充能]或[终结技]的激光命中敌人时，\n额外对敌人造成等同于奥菲丝&「鬼火」250%攻击力的<color=#FF5521>火属性伤害</color>，\n该效果每0.5秒最多触发一次，\n该伤害视为[强化特殊技]和[追加攻击]伤害。",
      "stats": {}
    }
  ],
  "耀嘉音": [
    {
      "id": "agent_1311_core",
      "category": "agent",
      "sourceName": "耀嘉音",
      "subType": "核心被动",
      "title": "核心被动：《如歌的行板》",
      "desc": "<color=#FFFFFF>[咏叹华彩]</color>状态下，队伍中其他角色通过<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[招架支援]</color>或<color=#FFFFFF>[回避支援]</color>入场，耀嘉音消耗能量追加释放<color=#FFFFFF>[震音]</color>进行攻击时，耀嘉音和入场角色的攻击力提升，提升效果等同于耀嘉音初始攻击力的<color=#2BAD00>35%</color>，最高不超过1200点，持续20秒，重复触发时延长持续时间，最多不超过30秒。",
      "stats": {
        "inCombatAtkFlat": 1200
      }
    },
    {
      "id": "agent_1311_add",
      "category": "agent",
      "sourceName": "耀嘉音",
      "subType": "额外能力",
      "title": "额外能力：《月华乱舞》",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>、<color=#FFFFFF>[异常]</color>或<color=#FFFFFF>[命破]</color>角色时触发：\n消耗能量发动<color=#FFFFFF>[精准支援]</color>或<color=#FFFFFF>[普通攻击：终曲]</color>时，耀嘉音将额外追加释放1道<color=#FFFFFF>[震音]</color>和3枚<color=#FFFFFF>[音簇]</color>进行攻击。",
      "stats": {}
    },
    {
      "id": "agent_1311_skill_1_2",
      "category": "agent",
      "sourceName": "耀嘉音",
      "subType": "特殊技",
      "title": "咏叹华彩",
      "desc": "耀嘉音进入<color=#FFFFFF>[咏叹华彩]</color>状态后，全队角色造成的伤害提升<color=#2BAD00>20%</color>，全队角色暴击伤害提升<color=#2BAD00>25%</color>;\n<color=#FFFFFF>[咏叹华彩]</color>状态下，耀嘉音无法移动，但可以点按  发动<color=#FFFFFF>[普通攻击：间奏]</color>，或点按  发动闪避，触发<color=#FFFFFF>[极限闪避]</color>后，点按  ，可以发动<color=#FFFFFF>[普通攻击：副歌]</color>；\n状态持续期间，耀嘉音的抗打断等级提升，受到的伤害降低40%，切换至其他角色后，耀嘉音会继续留在前场，并获得无敌效果，切换回耀嘉音时，则会自动衔接发动<color=#FFFFFF>[特殊技：《风铃与旧约》]</color>；\n状态持续期间，长按  发动<color=#FFFFFF>[普通攻击：终曲]</color>，或长按  ，可以退出<color=#FFFFFF>[咏叹华彩]</color>状态。",
      "stats": {
        "dmgBonus": 20,
        "critDmg": 25
      }
    },
    {
      "id": "agent_1311_m1",
      "category": "agent",
      "sourceName": "耀嘉音",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "十二平均律",
      "desc": "耀嘉音攻击命中敌人时，目标的全属性伤害抗性降低6%，最多叠加3层，\n持续30秒，重复触发时刷新持续时间；\n进入战场时，耀嘉音立刻获得1000点喧响值，在勘域模式中此效果180秒内最多触发一次；\n发动<color=#FFFFFF>[终结技]</color>时，全队角色各自获得1层<color=#FFFFFF>[庇佑之音]</color>效果，持续60秒，\n受到敌方攻击时，将消耗<color=#FFFFFF>[庇佑之音]</color>并获得无敌效果，持续1秒。",
      "stats": {
        "resShred": 18
      }
    },
    {
      "id": "agent_1311_m2",
      "category": "agent",
      "sourceName": "耀嘉音",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "贪心艺术",
      "desc": "<color=#FFFFFF>[核心被动：《如歌的行板》]</color>中的攻击力提升效果额外提升19%，上限额外提升400点；\n<color=#FFFFFF>[咏叹华彩]</color>状态下，队伍中其他角色通过<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[招架支援]</color>或<color=#FFFFFF>[回避支援]</color>入场时，耀嘉音将额外追加释放1道<color=#FFFFFF>[震音]</color>和3枚<color=#FFFFFF>[音簇]</color>进行攻击，3秒内最多触发一次。",
      "stats": {
        "inCombatAtkFlat": 400
      }
    },
    {
      "id": "agent_1311_m4",
      "category": "agent",
      "sourceName": "耀嘉音",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "《后颈的碎发》",
      "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>后，15秒内，耀嘉音未拥有<color=#FFFFFF>[和弦]</color>时也能够触发<color=#FFFFFF>[快速支援]</color>，\n且攻击命中敌人时触发<color=#FFFFFF>[快速支援]</color>的间隔缩短至1秒；\n<color=#FFFFFF>[咏叹华彩]</color>状态下，队伍中其他角色通过<color=#FFFFFF>[快速支援]</color>入场时，\n将根据自身特性获得不同的增益效果，全队3秒内最多触发一次：\n<color=#FFFFFF>[强攻]</color>：下一次<color=#FFFFFF>[快速支援]</color>重击命中敌人时，额外造成等同于耀嘉音300%攻击力的伤害；\n<color=#FFFFFF>[异常]</color>：下一次<color=#FFFFFF>[快速支援]</color>累积的属性异常积蓄值提升50%；\n<color=#FFFFFF>[击破]</color>：下一次<color=#FFFFFF>[快速支援]</color>造成的失衡值提升50%。",
      "stats": {}
    },
    {
      "id": "agent_1311_m6",
      "category": "agent",
      "sourceName": "耀嘉音",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "我们即是世界",
      "desc": "在<color=#FFFFFF>[咏叹华彩]</color>状态下释放和追加释放的<color=#FFFFFF>[震音]</color>和<color=#FFFFFF>[音簇]</color>的伤害倍率提升至原本的200%，\n暴击率提升80%；\n触发<color=#FFFFFF>[精准支援]</color>时，耀嘉音会自动追加发动蓄力完成后的<color=#FFFFFF>[普通攻击：《随想曲》]</color>第三段攻击，\n并使该招式的暴击率提升80%，10秒内最多触发一次。",
      "stats": {
        "critRate": 24
      }
    }
  ],
  "伊芙琳": [
    {
      "id": "agent_1321_core",
      "category": "agent",
      "sourceName": "伊芙琳",
      "subType": "核心被动",
      "title": "核心被动：缠丝",
      "desc": "进入<color=#FFFFFF>[牵缠禁制]</color>时，伊芙琳的暴击率提升<color=#2BAD00>25%</color>，退出<color=#FFFFFF>[牵缠禁制]</color>后，伊芙琳仍可继续保有增益，持续10秒；在<color=#FFFFFF>[牵缠禁制]</color>期间切换至其他角色时，伊芙琳将自动衔接<color=#FFFFFF>[特殊技：束裂式·I型]</color>。",
      "stats": {
        "critRate": 25
      }
    },
    {
      "id": "agent_1321_add",
      "category": "agent",
      "sourceName": "伊芙琳",
      "subType": "额外能力",
      "title": "额外能力：潜袭支点",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>角色或<color=#FFFFFF>[支援]</color>角色时触发：\n伊芙琳的<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>造成的伤害提升30%；当伊芙琳的暴击率大于等于80%时，<color=#FFFFFF>[连携技：月辉丝·绊]</color>、<color=#FFFFFF>[终结技：月辉丝·弦音]</color>和<color=#FFFFFF>[终结技：月辉丝·弦影]</color>的伤害倍率提升至原本的125%。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1321_m1",
      "category": "agent",
      "sourceName": "伊芙琳",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "织梦",
      "desc": "进入战场时，伊芙琳立刻获得1500点喧响值，在勘域模式中此效果180秒内最多触发一次；\n敌人进入<color=#FFFFFF>[牵缠禁制]</color>后，将被施加<color=#FFFFFF>[禁锢]</color>效果，\n伊芙琳攻击带有<color=#FFFFFF>[禁锢]</color>效果的敌人时，无视目标12%防御力；\n伊芙琳发动<color=#FFFFFF>[特殊技：束裂式·I型]</color>或<color=#FFFFFF>[强化特殊技：束裂式·终型]</color>时，会将<color=#FFFFFF>[禁锢]</color>效果扩散给所有被招式命中的敌人，被扩散的<color=#FFFFFF>[禁锢]</color>效果持续10秒。",
      "stats": {
        "defShred": 12
      }
    },
    {
      "id": "agent_1321_m2",
      "category": "agent",
      "sourceName": "伊芙琳",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "赴火之舞",
      "desc": "伊芙琳的攻击力提升15%；\n伊芙琳发动<color=#FFFFFF>[普通攻击：绞勒式·I型]</color>或<color=#FFFFFF>[普通攻击：绞勒式·II型]</color>时，\n将返还所消耗的<color=#FFFFFF>[燎火]</color>，25秒内最多触发一次；\n伊芙琳消耗<color=#FFFFFF>[燎索点]</color>发动<color=#FFFFFF>[连携技：月辉丝·绊]</color>时，招式的打断等级提升。",
      "stats": {
        "inCombatAtkPct": 15
      }
    },
    {
      "id": "agent_1321_m4",
      "category": "agent",
      "sourceName": "伊芙琳",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "命运的弦音",
      "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，伊芙琳立刻获得等同于自身10%生命值上限的护盾，\n持有该护盾时，伊芙琳的暴击伤害提升40%。",
      "stats": {
        "critDmg": 40
      }
    },
    {
      "id": "agent_1321_m6",
      "category": "agent",
      "sourceName": "伊芙琳",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "光与影的牵绊",
      "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，伊芙琳将获得<color=#FFFFFF>[弦影绝锋]</color>，持续20秒；\n<color=#FFFFFF>[弦影绝锋]</color>期间，伊芙琳发动<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>、<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>命中主要攻击目标时，将额外释放一段<color=#FFFFFF>[月辉丝·弦]</color>进行追击，\n对范围内敌人造成等同于伊芙琳375%攻击力的<color=#FF5521>火属性伤害</color>，\n该伤害会被视为<color=#FFFFFF>[连携技]</color>伤害，最多触发16次，\n再次获得<color=#FFFFFF>[弦影绝锋]</color>时刷新可触发次数。",
      "stats": {}
    }
  ],
  "薇薇安": [
    {
      "id": "agent_1331_core",
      "category": "agent",
      "sourceName": "薇薇安",
      "subType": "核心被动",
      "title": "核心被动：命运悲歌",
      "desc": "<color=#FFFFFF>[普通攻击：落羽生花]</color>命中处于<color=#FE437E>以太异常状态</color>、<color=#2EB6FF>电属性异常状态</color>、<color=#FF5521>火属性异常状态</color>、<color=#F0D12B>物理属性异常状态</color>、<color=#98EFF0>冰属性异常状态</color>、<color=#A6C5FD>风属性异常状态</color>的目标时，触发一次<color=#FFFFFF>[异放]</color>：额外结算一次属性异常伤害，相对于原属性异常伤害的比例为每10点异常精通<color=#FE437E>6.15%</color>/<color=#2EB6FF>3.2%</color>/<color=#FF5521>8%</color>/<color=#F0D12B>0.75%</color>/<color=#98EFF0>1.08%</color>/<color=#A6C5FD>0.32%</color>；\n<color=#FFFFFF>[普通攻击：裙裾浮游·悬落]</color>或<color=#FFFFFF>[普通攻击：落羽生花]</color>命中处于任意属性异常状态的目标时，使目标陷入<color=#FFFFFF>[薇薇安的预言]</color>，每0.55秒受到薇薇安55%攻击力的<color=#FE437E>以太伤害</color>，该伤害可以触发属性异常效果的额外伤害；当目标不再处于属性异常状态时，<color=#FFFFFF>[薇薇安的预言]</color>结束；\n进入战场时，薇薇安获得2点<color=#FFFFFF>[飞羽]</color>。",
      "stats": {}
    },
    {
      "id": "agent_1331_add",
      "category": "agent",
      "sourceName": "薇薇安",
      "subType": "额外能力",
      "title": "额外能力：预言之泪",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或与自身属性相同的角色时触发：\n队伍中其他角色对敌人施加属性异常效果时，薇薇安会消耗1点<color=#FFFFFF>[护羽]</color>并对目标发动一次<color=#FFFFFF>[普通攻击：落羽生花]</color>，0.5秒内至多触发一次；\n全队角色造成的<color=#FE437E>[侵蚀]</color>伤害和<color=#FE437E>[侵蚀]</color>状态被结算的<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>12%</color>。",
      "stats": {
        "dmgBonus": 12
      }
    },
    {
      "id": "agent_1331_m1",
      "category": "agent",
      "sourceName": "薇薇安",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "《在春天走进果园》",
      "desc": "累计消耗4点<color=#FFFFFF>[护羽]</color>时回复1点<color=#FFFFFF>[飞羽]</color>；\n处于<color=#FFFFFF>[薇薇安的预言]</color>下的目标受到的所有属性异常伤害和<color=#FFFFFF>[紊乱]</color>伤害提升16%。",
      "stats": {
        "dmgBonus": 16
      }
    },
    {
      "id": "agent_1331_m2",
      "category": "agent",
      "sourceName": "薇薇安",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "《暴风雨夜，暴风雨夜》",
      "desc": "薇薇安的<color=#FE437E>以太异常积蓄效率</color>提升25%；\n<color=#FFFFFF>[异放]</color>从精通中获得的收益提升至原本的130%，且无视目标15%全属性伤害抗性。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1331_m4",
      "category": "agent",
      "sourceName": "薇薇安",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "《苇间风》",
      "desc": "<color=#FFFFFF>[普通攻击：裙裾浮游·悬落]</color>和<color=#FFFFFF>[普通攻击：落羽生花]</color>命中时必定暴击，并使薇薇安的攻击力提升12%，持续12秒，重复触发时刷新持续时间；\n进入战场时，薇薇安立即获得5点<color=#FFFFFF>[护羽]</color>。",
      "stats": {
        "inCombatAtkPct": 12
      }
    },
    {
      "id": "agent_1331_m6",
      "category": "agent",
      "sourceName": "薇薇安",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "《薇薇安》",
      "desc": "薇薇安造成的<color=#FE437E>以太伤害</color>提升40%；\n<color=#FFFFFF>[普通攻击：淑女礼仪·舞步]</color>突进期间触发极限闪避、发动<color=#FFFFFF>[强化特殊技：堇花悼亡]</color>时，均额外回复1点<color=#FFFFFF>[飞羽]</color>；\n发动<color=#FFFFFF>[普通攻击：裙裾浮游·悬落]</color>时会消耗全部<color=#FFFFFF>[护羽]</color>，下落攻击的范围大幅增加，并在命中时触发一次特殊的<color=#FFFFFF>[异放]</color>，额外消耗的<color=#FFFFFF>[护羽]</color>会提高此次<color=#FFFFFF>[异放]</color>结算的额外异常伤害的比例，最多消耗5点<color=#FFFFFF>[护羽]</color>，使伤害比例提高至原本的5倍。",
      "stats": {
        "dmgBonus": 40
      }
    }
  ],
  "照": [
    {
      "id": "agent_1341_core",
      "category": "agent",
      "sourceName": "照",
      "subType": "核心被动",
      "title": "核心被动：最佳同事",
      "desc": "照会额外根据初始最大生命值提高暴击率，每1000点初始最大生命值提高<color=#2BAD00>1.4%</color>暴击率；\n进入战场时，照获得100点<color=#FFFFFF>[霜寒值]</color>，在勘域模式中此效果180秒内最多触发一次，<color=#FFFFFF>[霜寒值]</color>的上限为100点；\n当前操作中角色攻击命中敌人时，照积攒6点<color=#FFFFFF>[霜寒值]</color>，每3秒最多触发一次；\n<color=#FFFFFF>[霜寒值]</color>满时，如果处于接战状态下，将照换入前场可以发动<color=#FFFFFF>[登场技]</color>；\n照发动<color=#FFFFFF>[登场技]</color>时，消耗所有<color=#FFFFFF>[霜寒值]</color>，开启<color=#FFFFFF>[以太帷幕·涌泉]</color>；\n<color=#FFFFFF>[以太帷幕·涌泉]</color>生效期间，全队角色最大生命值提升5%，持续40秒，照重复开启<color=#FFFFFF>[以太帷幕·涌泉]</color>前，将关闭已有的<color=#FFFFFF>[以太帷幕·涌泉]</color>；\n照开启<color=#FFFFFF>[以太帷幕·涌泉]</color>时，使全队角色的攻击力提升<color=#2BAD00>1000</color>点，持续50秒，重复触发时刷新持续时间。",
      "stats": {
        "inCombatHpPct": 6.4,
        "inCombatAtkFlat": 1000
      }
    },
    {
      "id": "agent_1341_add",
      "category": "agent",
      "sourceName": "照",
      "subType": "额外能力",
      "title": "额外能力：凝聚力",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>或<color=#FFFFFF>[异常]</color>或<color=#FFFFFF>[支援]</color>角色时触发：\n照处于任意<color=#FFFFFF>[以太帷幕]</color>中时，使全队造成的伤害提升10%，照的初始最大生命值高于15000点时，每超过400点初始最大生命值，可使增伤效果额外提升1%，初始效果与额外提升最大总共提升至40%，当初始最大生命值达到27000点时，上述增益效果达到最大值。",
      "stats": {
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1341_m1",
      "category": "agent",
      "sourceName": "照",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "凛然裁决",
      "desc": "照被切换为非当前操作角色时，使全队角色造成的伤害无视目标15%全属性伤害抗性，\n持续50秒，重复触发时刷新持续时间。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1341_m2",
      "category": "agent",
      "sourceName": "照",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "黑枝前辈",
      "desc": "照的生命值回复时，提升20%攻击力，并使队伍中其他角色提升15%攻击力，\n持续50秒，重复触发时刷新持续时间。",
      "stats": {
        "inCombatAtkPct": 15
      }
    },
    {
      "id": "agent_1341_m4",
      "category": "agent",
      "sourceName": "照",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "轻盈踏痕",
      "desc": "照开启<color=#FFFFFF>[以太帷幕]</color>时，获得250点喧响值；\n<color=#FFFFFF>[终结技]</color>、<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[普通攻击：最终裁决]</color>的暴击伤害提升40%。",
      "stats": {
        "critDmg": 40
      }
    },
    {
      "id": "agent_1341_m6",
      "category": "agent",
      "sourceName": "照",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "无价亦是价值",
      "desc": "<color=#FFFFFF>[核心被动：最佳同事]</color>提高暴击率的效果提升至原本的125%；\n<color=#FFFFFF>[普通攻击：最终裁决]</color>累积蓄力时长的额外伤害提升至原本的140%，并使累积的蓄力时长不会在攻击中被消耗。",
      "stats": {}
    }
  ],
  "波可娜": [
    {
      "id": "agent_1351_core",
      "category": "agent",
      "sourceName": "波可娜",
      "subType": "核心被动",
      "title": "核心被动：猎手本能",
      "desc": "波可娜发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[支援突击]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，将会进入<color=#FFFFFF>[猎步]</color>状态，使自身造成的失衡值提升<color=#2BAD00>30%</color>，持续6秒；切换至其他角色后，若波可娜仍处于<color=#FFFFFF>[猎步]</color>状态下，则其持续时间会改为切换回波可娜时；进入<color=#FFFFFF>[猎步]</color>状态后，自身为当前操作中的角色时，波可娜重击命中敌人，能够触发队伍中上一位角色的<color=#FFFFFF>[快速支援]</color>。",
      "stats": {}
    },
    {
      "id": "agent_1351_add",
      "category": "agent",
      "sourceName": "波可娜",
      "subType": "额外能力",
      "title": "额外能力：业务搭档",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>或<color=#FFFFFF>[命破]</color>角色或自身阵营相同的角色时触发：\n波可娜发动<color=#FFFFFF>[特殊技：噬爪·噩梦袭影]</color>、<color=#FFFFFF>[强化特殊技：噬爪·瞬步]</color>、<color=#FFFFFF>[支援突击：单独计价]</color>、<color=#FFFFFF>[连携技：嗨，想不到吧]</color>、<color=#FFFFFF>[终结技：噢，游戏时间]</color>命中敌人时，将对敌人施加<color=#FFFFFF>[困迹]</color>效果，持续15秒；被施加<color=#FFFFFF>[困迹]</color>效果后，所有单位发动<color=#FFFFFF>[追加攻击]</color>对目标造成的伤害提升30%。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1351_m1",
      "category": "agent",
      "sourceName": "波可娜",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "利己主义",
      "desc": "对被施加<color=#FFFFFF>[困迹]</color>效果的敌人造成伤害时，自身暴击率提升10%。",
      "stats": {
        "critRate": 10
      }
    },
    {
      "id": "agent_1351_m2",
      "category": "agent",
      "sourceName": "波可娜",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "借势而为",
      "desc": "处于<color=#FFFFFF>[核心被动：猎手本能]</color>的<color=#FFFFFF>[猎步]</color>状态时，波可娜的攻击力额外提升10%。",
      "stats": {
        "inCombatAtkPct": 10
      }
    },
    {
      "id": "agent_1351_m4",
      "category": "agent",
      "sourceName": "波可娜",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "狩猎乐趣",
      "desc": "发动<color=#FFFFFF>[强化特殊技：噬爪·瞬步]</color>时的能量消耗降低5点。",
      "stats": {}
    },
    {
      "id": "agent_1351_m6",
      "category": "agent",
      "sourceName": "波可娜",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "面具之下",
      "desc": "<color=#FFFFFF>[特殊技：噬爪·噩梦袭影]</color>造成的伤害提升15%，\n重复攻击的可触发次数额外提升2次；\n<color=#FFFFFF>[额外能力：业务搭档]</color>中<color=#FFFFFF>[困迹]</color>的效果对<color=#FFFFFF>[追加攻击]</color>以外的伤害类型也会生效。",
      "stats": {
        "dmgBonus": 15
      }
    }
  ],
  "扳机": [
    {
      "id": "agent_1361_core",
      "category": "agent",
      "sourceName": "扳机",
      "subType": "核心被动",
      "title": "核心被动：破隙幽瞳",
      "desc": "「扳机」发动<color=#FFFFFF>[追加攻击]</color>命中敌人时，目标的失衡易伤倍率提升<color=#2BAD00>35%</color>，持续5秒，通过这种途径施加的失衡易伤倍率提升效果，在目标未进入失衡状态时亦可生效。",
      "stats": {
        "dazeVuln": 35
      }
    },
    {
      "id": "agent_1361_add",
      "category": "agent",
      "sourceName": "扳机",
      "subType": "额外能力",
      "title": "额外能力：灵目银灯",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>角色或与自身属性相同的角色时触发：\n「扳机」的暴击率高于40%时，每超过1%暴击率会使自身发动<color=#FFFFFF>[追加攻击]</color>造成的失衡值提升1.5%，最多提升75%。",
      "stats": {}
    },
    {
      "id": "agent_1361_m1",
      "category": "agent",
      "sourceName": "扳机",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "精准感知",
      "desc": "通过<color=#FFFFFF>[核心被动：破隙幽瞳]</color>施加的失衡易伤倍率额外提升20%；\n发动<color=#FFFFFF>[普通攻击：协奏狙杀]</color>时，触发的冷却时间降低至2秒；\n在<color=#FFFFFF>[狙击姿态]</color>下发动连续射击或蓄力反击命中敌人时，获得的<color=#FFFFFF>[绝意]</color>值提升25%，\n<color=#FFFFFF>[绝意]</color>值上限提升至125点。",
      "stats": {
        "dazeVuln": 20
      }
    },
    {
      "id": "agent_1361_m2",
      "category": "agent",
      "sourceName": "扳机",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "「以太视域」",
      "desc": "发动<color=#FFFFFF>[追加攻击]</color>时，「扳机」将获得1层<color=#FFFFFF>[猎眸]</color>；\n在<color=#FFFFFF>[狙击姿态]</color>下发动终结一击时，「扳机」将获得2层<color=#FFFFFF>[猎眸]</color>；\n每拥有1层<color=#FFFFFF>[猎眸]</color>，全队角色暴击伤害提升6%，最多叠加4层，持续10秒，\n重复触发时刷新持续时间。",
      "stats": {
        "critDmg": 24
      }
    },
    {
      "id": "agent_1361_m4",
      "category": "agent",
      "sourceName": "扳机",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "匿息隐踪",
      "desc": "「扳机」进入或延长<color=#FFFFFF>[协战状态]</color>后，状态持续期间，\n队伍中其他角色下一次触发<color=#FFFFFF>[普通攻击：协奏狙杀]</color>或<color=#FFFFFF>[普通攻击：协奏狙杀·冥狱]</color>时，\n将会在招式命中敌人时触发<color=#FFFFFF>[断离]</color>效果，额外造成「扳机」200%攻击力的伤害，\n并累积「扳机」120%冲击力的失衡值；\n招式具有较高的打断等级。",
      "stats": {}
    },
    {
      "id": "agent_1361_m6",
      "category": "agent",
      "sourceName": "扳机",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "冥河彼岸",
      "desc": "进入战场时，「扳机」可获得5枚<color=#FFFFFF>[破甲凶弹]</color>，\n每消耗25点<color=#FFFFFF>[绝意]</color>值，「扳机」可额外获得1枚<color=#FFFFFF>[破甲凶弹]</color>，上限5枚；\n拥有<color=#FFFFFF>[破甲凶弹]</color>时，「扳机」在<color=#FFFFFF>[狙击姿态]</color>中命中目标时，\n将消耗1枚<color=#FFFFFF>[破甲凶弹]</color>，额外对目标造成「扳机」1200%攻击力的<color=#2EB6FF>电属性伤害</color>，\n且<color=#FFFFFF>[破甲凶弹]</color>造成的伤害额外提升50%，0.2秒内最多触发一次。",
      "stats": {
        "dmgBonus": 50
      }
    }
  ],
  "仪玄": [
    {
      "id": "agent_1371_core",
      "category": "agent",
      "sourceName": "仪玄",
      "subType": "核心被动",
      "title": "核心被动：术法宗师",
      "desc": "仪玄会额外根据自身最大生命值提高贯穿力，每1点最大生命值将提高0.1点贯穿力；\n仪玄发动招式造成的<color=#FE437E>玄墨伤害</color>均为贯穿伤害，无视敌人防御，使用贯穿力作为招式伤害倍率；\n仪玄累积<color=#FE437E>玄墨异常积蓄值</color>时，具有独立的属性异常积蓄槽，触发属性异常效果时，额外回复10点闪能，每10秒最多触发一次；\n仪玄进入战斗时即可恢复全部闪能，在勘域模式中此效果180秒内最多触发一次，触发极限闪避时额外回复5点闪能，每1秒最多触发一次；\n消耗闪能时，仪玄会积累[术法值]，每消耗一点闪能，积累0.667点[术法值]，[术法值]足够时，可额外释放终结技：[终结技：符法千重]，[术法值]上限为120点；\n仪玄施展[普通攻击：玄墨极阵]、[普通攻击：青溟震击]、[强化特殊技]、[支援突击]、[连携技]、[终结技]造成的伤害提升<color=#2BAD00>60%</color>；\n释放[终结技：符法千重]后，仪玄获得一点[玄墨值]，仪玄可消耗一点[玄墨值]，释放[普通攻击：玄墨极阵]。",
      "stats": {
        "dmgBonus": 60
      }
    },
    {
      "id": "agent_1371_add",
      "category": "agent",
      "sourceName": "仪玄",
      "subType": "额外能力",
      "title": "额外能力：玄墨暗涌",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>角色或<color=#FFFFFF>[支援]</color>角色或<color=#FFFFFF>[防护]</color>角色时触发：\n队友释放终结技时，仪玄持续回复2点闪能，持续10秒；仪玄被极限支援换下场时，仪玄会自动追加一道落雷，造成等同于仪玄225%贯穿力的伤害并额外回复5点闪能；\n[强化特殊技：凝云术]与[强化特殊技：墨烬影消]命中处于失衡状态下的敌人时，伤害提升30%；\n发动[终结技]后，仪玄进入[凝神]状态，[凝神]状态下，仪玄的暴击伤害提升40%，持续15秒。",
      "stats": {
        "dmgBonus": 30,
        "critDmg": 40
      }
    },
    {
      "id": "agent_1371_m1",
      "category": "agent",
      "sourceName": "仪玄",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "清灵道心",
      "desc": "进入战场时，暴击率提升10%，\n立即获得120点<color=#FFFFFF>[术法值]</color>，在勘域模式中此效果180秒内最多触发一次；\n队伍中任意角色命中敌人时，仪玄会自动追加一道落雷，\n造成等同于仪玄50%贯穿力的伤害并额外回复5点闪能，6秒内最多追加一次落雷。",
      "stats": {
        "critRate": 10
      }
    },
    {
      "id": "agent_1371_m2",
      "category": "agent",
      "sourceName": "仪玄",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "消灾渡厄",
      "desc": "<color=#FFFFFF>[终结技]</color>或<color=#FFFFFF>[强化特殊技]</color>造成伤害时，\n无视目标15%<color=#FE437E>以太伤害抗性</color>；\n发动<color=#FFFFFF>[终结技：青溟云影]</color>时，使所有处于失衡状态的敌人失衡持续时间提升3秒，\n敌人在一次失衡期间内只会受到一次该效果，且同类效果不可叠加；\n此外，发动<color=#FFFFFF>[终结技：符法千重]</color>时，获得一层<color=#FFFFFF>[聚墨]</color>效果，\n发动<color=#FFFFFF>[普通攻击：青溟震击]</color>、<color=#FFFFFF>[强化特殊技：墨烬影消]</color>后点按普通攻击键，\n发动<color=#FFFFFF>[强化特殊技：青溟震击-破]</color>后点按特殊技键，\n可消耗一层<color=#FFFFFF>[聚墨]</color>发动<color=#FFFFFF>[强化特殊技：符法千重-破]</color>，最多造成等同于1200%贯穿力的伤害，\n<color=#FFFFFF>[聚墨]</color>效果最多维持一层。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1371_m4",
      "category": "agent",
      "sourceName": "仪玄",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "术道归一",
      "desc": "发动<color=#FFFFFF>[终结技]</color>时，获得一层<color=#FFFFFF>[静心]</color>效果，最多拥有2层；\n每有一层<color=#FFFFFF>[静心]</color>效果，\n下一次<color=#FFFFFF>[强化特殊技：凝云术]</color>和<color=#FFFFFF>[强化特殊技：墨烬影消]</color>造成的伤害提升30%。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1371_m6",
      "category": "agent",
      "sourceName": "仪玄",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "动静相宜",
      "desc": "发动<color=#FFFFFF>[终结技：青溟云影]</color>后，获得一层<color=#FFFFFF>[调息]</color>效果，\n<color=#FFFFFF>[调息]</color>状态下，可无视<color=#FFFFFF>[术法值]</color>发动一次<color=#FFFFFF>[终结技：符法千重]</color>，\n发动<color=#FFFFFF>[终结技：符法千重]</color>后<color=#FFFFFF>[调息]</color>状态结束，该效果每30秒最多获得一次，\n<color=#FFFFFF>[调息]</color>效果最多维持一层；\n此外，<color=#FFFFFF>[凝神]</color>状态下，仪玄的贯穿伤害提高20%。",
      "stats": {
        "ppDmgBonus": 20
      }
    }
  ],
  "零号安比": [
    {
      "id": "agent_1381_core",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "核心被动",
      "title": "核心被动：电位差",
      "desc": "零号·安比对拥有<color=#FFFFFF>[银星]</color>标记的敌人造成的伤害提升<color=#2BAD00>25%</color>；敌方单位被施加<color=#FFFFFF>[银星]</color>标记后，受到的<color=#FFFFFF>[追加攻击]</color>暴击伤害额外提升，提升效果等同于零号·安比暴击伤害的<color=#2BAD00>30%</color>。",
      "stats": {
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1381_add",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "额外能力",
      "title": "额外能力：电极化",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>或<color=#FFFFFF>[支援]</color>角色时触发：\n零号·安比的暴击率提升10%；当前操作中的角色为零号·安比时，全队角色<color=#FFFFFF>[追加攻击]</color>对拥有<color=#FFFFFF>[银星]</color>标记的敌人造成的伤害提升25%。",
      "stats": {
        "critRate": 10,
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1381_m1",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "静滞电荷",
      "desc": "零号·安比发动<color=#FFFFFF>[强化特殊技]</color>命中敌人时，将会连续触发3次<color=#FFFFFF>[白雷]</color>的额外伤害，该效果不会消耗<color=#FFFFFF>[白雷]</color>层数。",
      "stats": {}
    },
    {
      "id": "agent_1381_m2",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "冗余协议",
      "desc": "零号·安比的暴击率提升12%；\n发动<color=#FFFFFF>[终结技]</color>时，零号·安比会获得6层<color=#FFFFFF>[电鸣]</color>（上限6层）；\n拥有<color=#FFFFFF>[电鸣]</color>后，零号·安比<color=#FFFFFF>[特殊技：苍光]</color>命中拥有<color=#FFFFFF>[白雷]</color>的敌人时，\n将改为消耗1层<color=#FFFFFF>[电鸣]</color>作为代替，同一招式命中多名敌人时最多消耗1层<color=#FFFFFF>[电鸣]</color>，\n消耗<color=#FFFFFF>[电鸣]</color>时仍会触发<color=#FFFFFF>[白雷]</color>的额外伤害。\n激发潜能后，每消耗3层<color=#FFFFFF>[电鸣]</color>，下次发动[特殊技：苍光·临界]时速度加快。",
      "stats": {
        "critRate": 12
      }
    },
    {
      "id": "agent_1381_m4",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "银白残响",
      "desc": "攻击命中拥有<color=#FFFFFF>[银星]</color>标记的敌人时，零号·安比无视目标12%<color=#2EB6FF>电属性伤害抗性</color>。",
      "stats": {
        "resShred": 12
      }
    },
    {
      "id": "agent_1381_m6",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "前传主角",
      "desc": "触发6次<color=#FFFFFF>[白雷]</color>的额外伤害时，将会引发电磁涡流，\n对目标及其周围的敌人造成零号·安比1000%攻击力的<color=#2EB6FF>电属性伤害</color>，\n该伤害被视为<color=#FFFFFF>[追加攻击]</color>伤害。",
      "stats": {}
    }
  ],
  "橘福福": [
    {
      "id": "agent_1391_core",
      "category": "agent",
      "sourceName": "橘福福",
      "subType": "核心被动",
      "title": "核心被动：虎虎生威",
      "desc": "橘福福未使用「虎威」时，「虎威」会自动攻击敌人，并在命中敌人时获得<color=#FFFFFF>[威风]</color>；\n「虎威」命中敌人时，若拥有至少100点<color=#FFFFFF>[威风]</color>且橘福福不为当前操作中角色，橘福福会围绕目标敌人，发动<color=#FFFFFF>[连携技：虎釜震煞]</color>；发动时，全队角色获得<color=#FFFFFF>[虎啸]</color>效果：暴击伤害提升<color=#2BAD00>20%</color>，橘福福的初始攻击力大于等于2800点时，每超过100点攻击力会使暴击伤害额外提升5%，最多额外提升30%；\n<color=#FFFFFF>[虎啸]</color>状态下，角色的<color=#FFFFFF>[连携技]</color>/<color=#FFFFFF>[终结技]</color>造成的伤害提升<color=#2BAD00>20%/40%</color>；\n<color=#FFFFFF>[虎啸]</color>状态持续30秒，重复触发时刷新持续时间，橘福福处于<color=#FFFFFF>[虎啸]</color>效果中，冲击力提升<color=#2BAD00>50点</color>。",
      "stats": {
        "critDmg": 25,
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1391_add",
      "category": "agent",
      "sourceName": "橘福福",
      "subType": "额外能力",
      "title": "额外能力：八面威风",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>或<color=#FFFFFF>[命破]</color>角色时触发：\n队伍中所有角色的喧响值上限提升1000点，<color=#FFFFFF>[强攻]</color>或<color=#FFFFFF>[命破]</color>角色发动<color=#FFFFFF>[终结技]</color>时，该角色获得300点喧响值。",
      "stats": {}
    },
    {
      "id": "agent_1391_m1",
      "category": "agent",
      "sourceName": "橘福福",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "超级可怕小老虎",
      "desc": "进入战场时，橘福福的暴击率提升12%，立即获得100点<color=#FFFFFF>[威风]</color>；\n橘福福的<color=#FFFFFF>[连携技]</color>命中敌人时，目标处于失衡状态下时，失衡易伤倍率提升35%，持续30秒。",
      "stats": {
        "critRate": 12,
        "dazeVuln": 35
      }
    },
    {
      "id": "agent_1391_m2",
      "category": "agent",
      "sourceName": "橘福福",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "神通广大青溟客",
      "desc": "处于<color=#FFFFFF>[虎啸]</color>状态下角色的暴击伤害额外提升22%；\n任意角色发动<color=#FFFFFF>[终结技]</color>时，橘福福回复3点<color=#FFFFFF>[威势]</color>。",
      "stats": {
        "critDmg": 22
      }
    },
    {
      "id": "agent_1391_m4",
      "category": "agent",
      "sourceName": "橘福福",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "降妖伏魔虎修者",
      "desc": "橘福福处于<color=#FFFFFF>[虎啸]</color>状态下时，自身的暴击伤害提升35%。",
      "stats": {
        "critDmg": 35
      }
    },
    {
      "id": "agent_1391_m6",
      "category": "agent",
      "sourceName": "橘福福",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "知我心中虎啸声",
      "desc": "橘福福的<color=#FFFFFF>[连携技]</color>造成的伤害提升30%；\n橘福福在高速旋转状态下时，消耗<color=#FFFFFF>[威势]</color>命中敌人时，会发射3个爆米花，每个爆米花造成福福攻击力160%的伤害，且造成的伤害视为<color=#FFFFFF>[连携技]</color>伤害。",
      "stats": {
        "dmgBonus": 30
      }
    }
  ],
  "爱丽丝": [
    {
      "id": "agent_1401_core",
      "category": "agent",
      "sourceName": "爱丽丝",
      "subType": "核心被动",
      "title": "核心被动：剑心双虹",
      "desc": "队伍中任意角色对敌人施加<color=#F0D12B>物理异常状态</color>后，在异常状态的持续期间，爱丽丝每0.95秒对其额外造成基于该物理异常伤害比例2.5%的伤害，并使<color=#F0D12B>物理异常状态</color>下的敌人被触发<color=#FFFFFF>[紊乱]</color>效果时，每有1秒<color=#F0D12B>物理异常状态</color>剩余时间，<color=#FFFFFF>[紊乱]</color>效果的伤害倍率提升18%，最多提升180%；\n爱丽丝攻击命中敌人时，累积<color=#FFFFFF>[剑仪]</color>，爱丽丝通过属性异常积蓄触发<color=#F0D12B>[强击]</color>时，回复10点<color=#FFFFFF>[剑仪]</color>，<color=#FFFFFF>[剑仪]</color>的上限为300点，每100点为1格；\n三段蓄力的<color=#FFFFFF>[普通攻击：星芒圆舞曲]</color>的终结一击命中敌人时，触发特殊的<color=#F0D12B>[强击]</color>效果<color=#F0D12B>[极性强击]</color>，无视属性积蓄进度造成一次原本<color=#F0D12B>[强击]</color>效果100%的伤害，并可以与包括物理异常效果在内的其他属性异常效果互相结算<color=#FFFFFF>[紊乱]</color>；\n爱丽丝触发<color=#F0D12B>[强击]</color>时，<color=#F0D12B>物理异常积蓄效率</color>提升<color=#2BAD00>25%</color>，持续30秒。",
      "stats": {
        "dmgBonus": 180
      }
    },
    {
      "id": "agent_1401_add",
      "category": "agent",
      "sourceName": "爱丽丝",
      "subType": "额外能力",
      "title": "额外能力：寻奇猎幽",
      "desc": "队伍中存在另一名<color=#FFFFFF>[异常]</color>或<color=#FFFFFF>[支援]</color>角色时触发：\n队伍中任意角色触发<color=#FFFFFF>[紊乱]</color>效果时，爱丽丝回复30点<color=#FFFFFF>[剑仪]</color>；\n若爱丽丝的异常掌控大于140点，每超过1点异常掌控会提升1.6点异常精通；\n进入战场时，爱丽丝获得300点<color=#FFFFFF>[剑仪]</color>，在勘域模式中此效果180秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1401_m1",
      "category": "agent",
      "sourceName": "爱丽丝",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "掌心的芫荽",
      "desc": "爱丽丝触发<color=#F0D12B>[极性强击]</color>时，回复25点<color=#FFFFFF>[剑仪]</color>；\n爱丽丝触发<color=#F0D12B>[强击]</color>时，目标的防御力降低20%，持续30秒。",
      "stats": {
        "defShred": 20
      }
    },
    {
      "id": "agent_1401_m2",
      "category": "agent",
      "sourceName": "爱丽丝",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "剑尖的鼠尾草",
      "desc": "<color=#FFFFFF>[终结技：星芒终章]</color>的终结一击命中敌人时，触发<color=#F0D12B>[极性强击]</color>；\n全队角色造成的<color=#F0D12B>[强击]</color>伤害提升15%；\n<color=#F0D12B>物理异常状态</color>下的敌人被结算的<color=#FFFFFF>[紊乱]</color>伤害提升15%；\n进入战场时，爱丽丝立刻获得1000点喧响值，在勘域模式中此效果180秒内最多触发一次。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1401_m4",
      "category": "agent",
      "sourceName": "爱丽丝",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "唇间的迷迭香",
      "desc": "爱丽丝无视目标10%<color=#F0D12B>物理伤害抗性</color>；\n强化后的<color=#FFFFFF>[普通攻击：星仪序曲]</color>累积的<color=#F0D12B>物理异常积蓄值</color>提升25%。",
      "stats": {
        "resShred": 10
      }
    },
    {
      "id": "agent_1401_m6",
      "category": "agent",
      "sourceName": "爱丽丝",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "心中的百里香",
      "desc": "爱丽丝发动三段蓄力的<color=#FFFFFF>[普通攻击：星芒圆舞曲]</color>或<color=#FFFFFF>[终结技：星芒终章]</color>时，进入<color=#FFFFFF>[决胜状态]</color>，持续30秒，在持续期间，队伍中任意角色攻击命中目标后的短时间内，爱丽丝对目标发动1次额外攻击，造成等同于爱丽丝3300%异常精通的物理伤害，必定暴击，该效果1秒内最多触发一次，最多触发6次，再次获得<color=#FFFFFF>[决胜状态]</color>时刷新可触发次数。",
      "stats": {}
    }
  ],
  "柚叶": [
    {
      "id": "agent_1411_core",
      "category": "agent",
      "sourceName": "柚叶",
      "subType": "核心被动",
      "title": "核心被动：奇巧缤纷",
      "desc": "进入战场时，柚叶立刻获得3点<color=#FFFFFF>[甜度点]</color>；\n柚叶最多持有6点<color=#FFFFFF>[甜度点]</color>；\n柚叶的<color=#FFFFFF>[强化特殊技：小心蛀牙]</color>、<color=#FFFFFF>[强化特殊技：小心蛀牙，就是现在！]</color>和<color=#FFFFFF>[终结技：不投降就捣乱]</color>攻击命中敌人时，为全队角色施加<color=#FFFFFF>[狸之愿]</color>效果；\n<color=#FFFFFF>[狸之愿]</color>效果会提供等同于柚叶的40%初始攻击力的攻击力加成，最多提升<color=#2BAD00>1200</color>点，并使拥有者造成的伤害提升15%，持续40秒，重复触发时刷新持续时间；\n当柚叶的初始攻击力达到3000点时，为全队角色提供的攻击力增益效果达到最大值。",
      "stats": {
        "inCombatAtkFlat": 1200,
        "dmgBonus": 15
      }
    },
    {
      "id": "agent_1411_add",
      "category": "agent",
      "sourceName": "柚叶",
      "subType": "额外能力",
      "title": "额外能力：人多乐趣大",
      "desc": "队伍中存在<color=#FFFFFF>[异常]</color>角色或与自身阵营相同的角色时触发：\n若柚叶的异常掌控大于100点，每超过1点异常掌控会使拥有<color=#FFFFFF>[狸之愿]</color>效果的角色的属性异常积蓄效率提升<color=#2BAD00>0.2%</color>，最多提升<color=#2BAD00>20%</color>，还会使其所有属性异常伤害和<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>0.2%</color>，最多提升<color=#2BAD00>20%</color>，当柚叶的异常掌控达到200点时，上述增益效果达到最大值。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1411_m1",
      "category": "agent",
      "sourceName": "柚叶",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "幸运体质",
      "desc": "柚叶进入战场时，回复30点能量，在勘域模式中该效果每180秒最多触发一次；\n处于<color=#FFFFFF>[甜蜜惊吓]</color>状态下的敌人全属性伤害抗性降低10%；<color=#FFFFFF>[额外能力]</color>中属性异常伤害和<color=#FFFFFF>[紊乱]</color>伤害增益效果提升至原本的130%。",
      "stats": {
        "resShred": 10
      }
    },
    {
      "id": "agent_1411_m2",
      "category": "agent",
      "sourceName": "柚叶",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "趣友云集",
      "desc": "柚叶的<color=#FFFFFF>[强化特殊技：小心蛀牙]</color>、<color=#FFFFFF>[强化特殊技：小心蛀牙，就是现在！]</color>和<color=#FFFFFF>[终结技：不投降就捣乱]</color>攻击命中敌人时，会使全队角色造成的伤害提升15%，属性异常积蓄效率提升15%，持续40秒，重复触发时刷新持续时间，重击命中不处于失衡状态的敌人时，会强制触发<color=#FFFFFF>[连携技]</color>，通过该种方式发动的<color=#FFFFFF>[连携技]</color>，打断等级降低，强制触发<color=#FFFFFF>[连携技]</color>的效果每20秒最多触发一次；\n其他角色通过<color=#FFFFFF>[连携技]</color>入场时，柚叶会获得1点<color=#FFFFFF>[甜度点]</color>；\n柚叶触发<color=#FFFFFF>[普通攻击：硬糖射击]</color>的冷却时间减少25%。",
      "stats": {
        "dmgBonus": 15
      }
    },
    {
      "id": "agent_1411_m4",
      "category": "agent",
      "sourceName": "柚叶",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "坠落魔法",
      "desc": "柚叶的<color=#FFFFFF>[支援突击：夹心硬糖射击]</color>和<color=#FFFFFF>[支援突击：来块曲奇]</color>造成的伤害提升30%，属性异常积蓄效率提升20%，且该招式命中敌人时将触发<color=#FFFFFF>[快速支援]</color>。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1411_m6",
      "category": "agent",
      "sourceName": "柚叶",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "落地生根",
      "desc": "通过<color=#FFFFFF>[招架支援]</color>或<color=#FFFFFF>[普通攻击：狸之帐]</color>成功招架敌人攻击时额外获得1点<color=#FFFFFF>[甜度点]</color>，发动<color=#FFFFFF>[支援突击：夹心硬糖射击]</color>时可以长按进行蓄能，最多持续0.8秒，松开或蓄能至最大时间时，柚叶会额外发射强力炮弹攻击敌人。每蓄能0.4秒，柚叶都会消耗1点<color=#FFFFFF>[甜度点]</color>追加发射一枚强力炮弹，每颗追加强力炮弹攻击造成柚叶300%攻击力的<color=#F0D12B>物理伤害</color>；\n<color=#FFFFFF>[支援突击：夹心硬糖射击]</color>的任意强力炮弹命中敌人时，会使全队角色<color=#FFFFFF>[紊乱]</color>效果的伤害倍率提升105%，持续40秒，最多叠加3层，每层单独结算持续时间，额外强力炮弹命中处于<color=#FFFFFF>[甜蜜惊吓]</color>状态的敌人时也会触发1次<color=#FFFFFF>[普通攻击：彩糖花火·极]</color>攻击；\n柚叶蓄能过程中如果受到敌人攻击，会自动闪避敌人攻击并直接发动最大蓄能攻击。",
      "stats": {
        "dmgBonus": 30
      }
    }
  ],
  "潘引壶": [
    {
      "id": "agent_1421_core",
      "category": "agent",
      "sourceName": "潘引壶",
      "subType": "核心被动",
      "title": "核心被动：脉中乾坤",
      "desc": "潘引壶发动<color=#FFFFFF>[强化特殊技：贴山震脉靠]</color>命中敌人触发[快速支援]的一段时间内，通过[快速支援]或[连携技]入场的下一位代理人将会获得<color=#FFFFFF>[通窍]</color>效果。该效果提供潘引壶初始攻击力<color=#2BAD00>18%</color>的贯穿力提升，持续25秒。该效果提供的贯穿力最多不超过540点。",
      "stats": {
        "inCombatPen": 540
      }
    },
    {
      "id": "agent_1421_add",
      "category": "agent",
      "sourceName": "潘引壶",
      "subType": "额外能力",
      "title": "额外能力：食铁纳金",
      "desc": "队伍中存在<color=#FFFFFF>[命破]</color>角色或与自身阵营相同的角色时触发：\n潘引壶发动<color=#FFFFFF>[特殊技：断脉破穴手]</color>命中敌人时对敌人施加<color=#FFFFFF>[气绝]</color>效果，使所有单位对其造成的伤害提升20%，<color=#FFFFFF>[特殊技：断脉破穴手]</color>命中敌人时将分别对敌人造成10秒<color=#FFFFFF>[气绝]</color>效果。该效果不可叠加，招式重复命中相同敌人时，该效果时长可延长。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1421_m1",
      "category": "agent",
      "sourceName": "潘引壶",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "气劲护体",
      "desc": "所有单位对被施加<color=#FFFFFF>[气绝]</color>效果的敌人造成伤害时，造成的伤害额外提升10%。",
      "stats": {
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1421_m2",
      "category": "agent",
      "sourceName": "潘引壶",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "云岿点穴手",
      "desc": "每消耗6点<color=#FFFFFF>[破劲]</color>，潘引壶将回复4点能量，<color=#FFFFFF>[特殊技：断脉破穴手]</color>命中敌人时对敌人造成的<color=#FFFFFF>[气绝]</color>效果将提升至12秒。",
      "stats": {}
    },
    {
      "id": "agent_1421_m4",
      "category": "agent",
      "sourceName": "潘引壶",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "特等上厨",
      "desc": "<color=#FFFFFF>[终结技：满汉全席！]</color>为全队角色回复生命时，生命回复效果提升25%，持续回复效果的生命回复效果提升25%；发动<color=#FFFFFF>[终结技：满汉全席！]</color>时获得<color=#FFFFFF>[储粮]</color>效果，当队伍内任意角色损失生命值时，消耗<color=#FFFFFF>[储粮]</color>效果为其回复<color=#FFFFFF>[终结技：满汉全席！]</color>即时回复生命值50%的生命值，该效果不可叠加。",
      "stats": {}
    },
    {
      "id": "agent_1421_m6",
      "category": "agent",
      "sourceName": "潘引壶",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "气穴论",
      "desc": "<color=#FFFFFF>[核心被动：脉中乾坤]</color>提供的<color=#FFFFFF>[通窍]</color>将额外获得潘引壶初始攻击力6%的提升，该效果提供的贯穿力最多提升至720点。",
      "stats": {
        "inCombatPen": 180
      }
    }
  ],
  "叶瞬光": [
    {
      "id": "agent_1431_core",
      "category": "agent",
      "sourceName": "叶瞬光",
      "subType": "核心被动",
      "title": "核心被动：照破无明",
      "desc": "非<color=#FFFFFF>[明心境]</color>状态且未拥有6点[青溟剑势]时，部分攻击会缓慢积攒<color=#FFFFFF>[青溟剑势]</color>；任意方式获得<color=#FFFFFF>[青溟剑势]</color>时，每溢出1点<color=#FFFFFF>[青溟剑势]</color>，将转化为1层<color=#FFFFFF>[载物]</color>效果，至多叠加3层，在退出<color=#FFFFFF>[明心境]</color>状态时，会消耗所有<color=#FFFFFF>[载物]</color>获得对应层数的<color=#FFFFFF>[青溟剑势]</color>。\n进入战场时，获得<color=#FFFFFF>[合道]</color>效果，暴击率提升<color=#2BAD00>30%</color>，造成的伤害提升<color=#2BAD00>25%</color>。\n释放<color=#FFFFFF>[终结技：逐云惊霆]</color>或<color=#FFFFFF>[登场技：照影]</color>后，叶瞬光将进入<color=#FFFFFF>[明心境]</color>状态，并开启<color=#FFFFFF>[以太帷幕·决裁]</color>；<color=#FFFFFF>[以太帷幕·决裁]</color>与<color=#FFFFFF>[明心境]</color>持续时间相同，持续16秒，处于后场时，持续时间不再减少；处于<color=#FFFFFF>[明心境]</color>状态下，叶瞬光将使用更加强力的招式，造成的<color=#F0D12B>物理伤害</color>均为<color=#F0D12B>凛刃伤害</color>。\n<color=#FFFFFF>[以太帷幕·决裁]</color>持续期间，敌人进入<color=#FFFFFF>[以太帷幕·决裁]</color>时，将基于其此时的失衡易伤倍率为其附加帷幕易伤效果，期间叶瞬光发动的招式对敌人造成伤害时都将不计算敌人的失衡易伤加成，转而计算帷幕易伤加成；帷幕易伤加成上限为110%，<color=#FFFFFF>[以太帷幕·决裁]</color>结束时移除帷幕易伤效果。",
      "stats": {
        "critRate": 30,
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1431_add",
      "category": "agent",
      "sourceName": "叶瞬光",
      "subType": "额外能力",
      "title": "额外能力：溯影惊鸿",
      "desc": "队伍中存在<color=#FFFFFF>[支援]</color>或<color=#FFFFFF>[防护]</color>角色时触发：\n队友开启任意<color=#FFFFFF>[以太帷幕]</color>时，获得3点<color=#FFFFFF>[青溟剑势]</color>，若自身已经处于<color=#FFFFFF>[明心境]</color>状态，则会转化为3层<color=#FFFFFF>[载物]</color>效果。",
      "stats": {}
    },
    {
      "id": "agent_1431_m1",
      "category": "agent",
      "sourceName": "叶瞬光",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "梦中身",
      "desc": "进入战场时，获得6点<color=#FFFFFF>[青溟剑势]</color>，在勘域模式中此效果180秒内最多触发一次；\n<color=#FFFFFF>[核心被动：照破无明]</color>中<color=#FFFFFF>[合道]</color>效果额外使造成的伤害提升10%，无视目标20%防御力。",
      "stats": {
        "dmgBonus": 10,
        "defShred": 20
      }
    },
    {
      "id": "agent_1431_m2",
      "category": "agent",
      "sourceName": "叶瞬光",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "光与影",
      "desc": "<color=#FFFFFF>[载物]</color>可叠加层数提升至6层，<color=#FFFFFF>[观止]</color>可叠加至9层；\n<color=#FFFFFF>[明心境]</color>状态下，每消耗1点<color=#FFFFFF>[青溟剑势]</color>，则获得1层<color=#FFFFFF>[观止]</color>效果；\n<color=#FFFFFF>[强化特殊技：明心境·飞光]</color>和<color=#FFFFFF>[终结技：斩妄开天]</color>造成的伤害无视目标40%防御力。",
      "stats": {
        "defShred": 40
      }
    },
    {
      "id": "agent_1431_m4",
      "category": "agent",
      "sourceName": "叶瞬光",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "共黯尘",
      "desc": "进入战场时，获得1000点喧响值，在勘域模式中此效果180秒内最多触发一次；\n<color=#FFFFFF>[以太帷幕·决裁]</color>提供的帷幕易伤加成上限提升至200%。",
      "stats": {}
    },
    {
      "id": "agent_1431_m6",
      "category": "agent",
      "sourceName": "叶瞬光",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "明灯愿",
      "desc": "进入战场时，获得2层<color=#FFFFFF>[明灯愿]</color>；\n每次进入<color=#FFFFFF>[明心境]</color>状态会获得1层<color=#FFFFFF>[明灯愿]</color>，至多叠加4层；\n拥有3层<color=#FFFFFF>[明灯愿]</color>时，将<color=#FFFFFF>[强化特殊技：明心境·归尘]</color>替换为<color=#FFFFFF>[终结技：斩妄开天]</color>，发动此<color=#FFFFFF>[终结技：斩妄开天]</color>时，消耗3层<color=#FFFFFF>[明灯愿]</color>；\n<color=#FFFFFF>[强化特殊技：明心境·归尘]</color>和<color=#FFFFFF>[终结技：斩妄开天]</color>最后一击额外造成1500%攻击力的<color=#F0D12B>物理伤害</color>。",
      "stats": {}
    }
  ],
  "真斗": [
    {
      "id": "agent_1441_core",
      "category": "agent",
      "sourceName": "真斗",
      "subType": "核心被动",
      "title": "核心被动：熔锋之势",
      "desc": "真斗会额外根据自身最大生命值提高贯穿力，每1点最大生命值将提高0.1点贯穿力；\n真斗发动招式造成的<color=#FF5521>火属性伤害</color>均为贯穿伤害，无视敌人防御，使用贯穿力作为招式伤害倍率；\n真斗发动<color=#FFFFFF>[特殊技：归烬·舍身]</color>或<color=#FFFFFF>[招架支援]</color>时，会累积<color=#FFFFFF>[炽心]</color>，最多累积100点；当<color=#FFFFFF>[炽心]</color>累积至75点时，真斗将进入<color=#FFFFFF>[熔锋]</color>状态，<color=#FFFFFF>[熔锋]</color>状态下，真斗每秒消耗3.3点<color=#FFFFFF>[炽心]</color>，<color=#FFFFFF>[炽心]</color>耗尽时，退出<color=#FFFFFF>[熔锋]</color>状态；\n<color=#FFFFFF>[熔锋]</color>状态下，真斗的<color=#FFFFFF>[普通攻击]</color>获得强化，并可以发动<color=#FFFFFF>[强化特殊技：归烬·天坠]</color>；\n真斗在<color=#FFFFFF>[普通攻击：炽风·胧切]</color>或<color=#FFFFFF>[支援突击]</color>的连续斩击中消耗生命值时，使此次攻击的暴击伤害提升<color=#2BAD00>50%</color>，闪能回复效率提升100%；\n<color=#FFFFFF>[熔锋]</color>状态下，真斗的暴击率提升10%，<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>20%</color>。",
      "stats": {
        "critDmg": 50,
        "critRate": 10,
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1441_add",
      "category": "agent",
      "sourceName": "真斗",
      "subType": "额外能力",
      "title": "额外能力：复燃之心",
      "desc": "队伍中存在<color=#FFFFFF>[支援]</color>或<color=#FFFFFF>[击破]</color>角色时触发：\n真斗发动终结技时，获得8层[残焰]，发动连携技时，获得4层[残焰]，持续60秒，最多叠加20层，重复触发时刷新持续时间；真斗发动<color=#FFFFFF>[普通攻击：炽风·胧切]</color>或<color=#FFFFFF>[支援突击]</color>的连续斩击时，如果生命值低于100%最大生命值，则消耗一层[残焰]，回复2%最大生命值。",
      "stats": {}
    },
    {
      "id": "agent_1441_m1",
      "category": "agent",
      "sourceName": "真斗",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "流浪生存法则",
      "desc": "真斗的生命值降低时，累积已损失生命值，每有相当于最大生命值1%的已损失生命值使<color=#FFFFFF>[支援突击]</color>和<color=#FFFFFF>[普通攻击]</color>造成的<color=#FF5521>火属性伤害</color>提升0.4%，最多提升20%。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1441_m2",
      "category": "agent",
      "sourceName": "真斗",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "昼夜、厨房与爱",
      "desc": "<color=#FFFFFF>[熔锋]</color>状态下，真斗无视目标8%<color=#FF5521>火属性伤害抗性</color>；\n<color=#FFFFFF>[特殊技：归烬]</color>或<color=#FFFFFF>[特殊技：归烬·舍身]</color>发动期间受到敌人攻击后，点按  可以发动<color=#FFFFFF>[支援突击]</color>。",
      "stats": {
        "resShred": 8
      }
    },
    {
      "id": "agent_1441_m4",
      "category": "agent",
      "sourceName": "真斗",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "幼年的誓言",
      "desc": "最大生命值提升8%；\n<color=#FFFFFF>[特殊技：归烬]</color>和<color=#FFFFFF>[特殊技：归烬·舍身]</color>发动期间，真斗受到致命伤害时不会在招式发动期间战败退场，生命值最多降低至1，10秒内最多触发一次。",
      "stats": {
        "inCombatHpPct": 8
      }
    },
    {
      "id": "agent_1441_m6",
      "category": "agent",
      "sourceName": "真斗",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "越过昔年梦",
      "desc": "<color=#FFFFFF>[特殊技：归烬]</color>命中处于失衡状态下的敌人时，真斗回复75点[炽心]，获得4层[残焰]，点按  可以发动<color=#FFFFFF>[支援突击]</color>，获得[残焰]的效果在20秒内最多触发一次；\n<color=#FFFFFF>[支援突击]</color>命中敌人时，造成的<color=#FF5521>火属性伤害</color>提升3%，持续8秒，最多叠加5层，重复触发刷新持续时间。",
      "stats": {
        "dmgBonus": 15
      }
    }
  ],
  "卢西娅": [
    {
      "id": "agent_1451_core",
      "category": "agent",
      "sourceName": "卢西娅",
      "subType": "核心被动",
      "title": "核心被动：迷途夜颂",
      "desc": "进入战场时，卢西娅立刻获得60点<color=#FFFFFF>[梦境值]</color>，若在发动<color=#FFFFFF>[随想]</color>或<color=#FFFFFF>[合唱]</color>时，卢西娅的<color=#FFFFFF>[梦境值]</color>达到100点，会进入<color=#FFFFFF>[梦境]</color>状态；\n进入<color=#FFFFFF>[梦境]</color>状态时，将触发<color=#FFFFFF>[快速支援]</color>，并同时开启<color=#FFFFFF>[以太帷幕·涌泉]</color>，<color=#FFFFFF>[以太帷幕·涌泉]</color>生效期间，全队角色最大生命值提升5%，持续40秒，重复触发延长持续时间，最多延长至300秒；\n当卢西娅处于<color=#FFFFFF>[梦境]</color>状态中，发动任意<color=#FFFFFF>[随想]</color>时，会消耗25点<color=#FFFFFF>[梦境值]</color>将<color=#FFFFFF>[随想]</color>升级为<color=#FFFFFF>[合唱]</color>；其他操作中的角色攻击命中敌人时，会消耗25点<color=#FFFFFF>[梦境值]</color>发动<color=#FFFFFF>[追加攻击]</color>，<color=#FFFFFF>[追加攻击]</color>为<color=#FFFFFF>[合唱]</color>，卢西娅在发动招式升级或<color=#FFFFFF>[追加攻击]</color>后，8秒内不会触发<color=#FFFFFF>[追加攻击]</color>；\n卢西娅发动招式升级或<color=#FFFFFF>[追加攻击]</color>时，会为全队角色施加<color=#FFFFFF>[巡梦童谣]</color>状态，<color=#FFFFFF>[巡梦童谣]</color>状态下，角色造成的伤害提升<color=#2BAD00>20%</color>，持续12秒，重复触发时刷新持续时间；\n<color=#FFFFFF>[梦境值]</color>不足或离开<color=#FFFFFF>[以太帷幕]</color>时，卢西娅退出<color=#FFFFFF>[梦境]</color>状态。",
      "stats": {
        "inCombatHpPct": 5,
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1451_add",
      "category": "agent",
      "sourceName": "卢西娅",
      "subType": "额外能力",
      "title": "额外能力：长夜诗篇",
      "desc": "队伍中存在<color=#FFFFFF>[命破]</color>角色或<color=#FFFFFF>[击破]</color>角色时触发：\n施加<color=#FFFFFF>[破暗]</color>状态时，额外附加暴击伤害提升30%效果。",
      "stats": {
        "critDmg": 30
      }
    },
    {
      "id": "agent_1451_skill_1_2",
      "category": "agent",
      "sourceName": "卢西娅",
      "subType": "特殊技",
      "title": "强化特殊技：死神协奏曲·破晓",
      "desc": "能量足够时，点按  发动：\n强化特殊技为<color=#FFFFFF>[合唱]</color>，发动时复现以骸形象向前方直线区域发动强力斩击，造成<color=#FE437E>以太伤害</color>；\n卢西娅发动<color=#FFFFFF>[合唱]</color>时，为全队角色施加<color=#FFFFFF>[破暗]</color>状态；<color=#FFFFFF>[破暗]</color>状态下，贯穿力提升12点，卢西娅每拥有200点初始最大生命值，可使贯穿力额外提升<color=#2BAD00>7.4</color>点，<color=#FFFFFF>[破暗]</color>状态最多可提升<color=#2BAD00>900</color>点贯穿力，状态持续20秒，重复触发时刷新持续时间，当卢西娅的初始最大生命值达到24000点时，上述增益效果达到最大值；\n<color=#FFFFFF>[合唱]</color>造成伤害时，卢西娅会根据最大生命值的<color=#2BAD00>70%</color>额外提升最后一段攻击的伤害；\n卢西娅发动强化特殊技后，若自身处于<color=#FFFFFF>[梦境]</color>状态且<color=#FFFFFF>[以太帷幕·涌泉]</color>生效中，则使<color=#FFFFFF>[以太帷幕·涌泉]</color>的持续时间延长16秒；\n卢西娅发动强化特殊技后，可以直接衔接第五段<color=#FFFFFF>[普通攻击]</color>；\n未处于<color=#FFFFFF>[梦境]</color>状态中时，卢西娅发动此<color=#FFFFFF>[合唱]</color>可获得60点<color=#FFFFFF>[梦境值]</color>；\n招式发动期间拥有无敌效果。",
      "stats": {
        "inCombatPen": 900
      }
    },
    {
      "id": "agent_1451_m1",
      "category": "agent",
      "sourceName": "卢西娅",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "秘密朋友",
      "desc": "<color=#FFFFFF>[巡梦童谣]</color>状态额外附加造成伤害时无视敌人18%全属性伤害抗性和喧响值获取效率提升5%效果；\n且卢西娅发动招式升级时获得1层<color=#FFFFFF>[回音]</color>，最多叠加4层，当<color=#FFFFFF>[巡梦童谣]</color>状态结束时，若卢西娅持有<color=#FFFFFF>[回音]</color>，则会自动消耗1层并重新为全队角色施加<color=#FFFFFF>[巡梦童谣]</color>状态。",
      "stats": {
        "resShred": 18
      }
    },
    {
      "id": "agent_1451_m2",
      "category": "agent",
      "sourceName": "卢西娅",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "魔术大师",
      "desc": "卢西娅处于<color=#FFFFFF>[以太帷幕·涌泉]</color>内时<color=#FFFFFF>[合唱]</color>造成的伤害提升15%；\n拥有<color=#FFFFFF>[破暗]</color>状态的代理人，处于<color=#FFFFFF>[以太帷幕·涌泉]</color>内时，额外获得贯穿伤害提升15%效果。",
      "stats": {
        "dmgBonus": 15,
        "ppDmgBonus": 15
      }
    },
    {
      "id": "agent_1451_m4",
      "category": "agent",
      "sourceName": "卢西娅",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "深夜时间",
      "desc": "当场上有<color=#FFFFFF>[以太帷幕]</color>开启或延长时，卢西娅使全队角色获得100点喧响值，该效果15秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1451_m6",
      "category": "agent",
      "sourceName": "卢西娅",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "永不结束的旅途",
      "desc": "卢西娅处于任意<color=#FFFFFF>[以太帷幕]</color>内时，会根据自身初始最大生命值的2%提升自身攻击力，且<color=#FFFFFF>[合唱]</color>必定暴击，<color=#FFFFFF>[合唱]</color>造成暴击时暴击伤害提升30%。",
      "stats": {
        "critDmg": 30
      }
    }
  ],
  "席德": [
    {
      "id": "agent_1461_core",
      "category": "agent",
      "sourceName": "席德",
      "subType": "核心被动",
      "title": "核心被动：花链协议",
      "desc": "「席德」将初始攻击力最高的<color=#FFFFFF>[强攻]</color>队友视为<color=#FFFFFF>[正兵]</color>；\n<color=#FFFFFF>[正兵]</color>释放<color=#FFFFFF>[强化特殊技]</color>时，使「席德」获得<color=#FFFFFF>[强袭]</color>状态，提升「席德」<color=#2BAD00>1000点</color>攻击力和<color=#2BAD00>30%</color>暴击伤害，「席德」释放<color=#FFFFFF>[强化特殊技]</color>时，使<color=#FFFFFF>[正兵]</color>获得<color=#FFFFFF>[明攻]</color>状态，提升<color=#FFFFFF>[正兵]</color><color=#2BAD00>1000点</color>攻击力和<color=#2BAD00>30%</color>暴击伤害；\n<color=#FFFFFF>[明攻]</color><color=#FFFFFF>[强袭]</color>同时存在时，「席德」与<color=#FFFFFF>[正兵]</color>同时获得<color=#FFFFFF>[围杀]</color>状态，造成的伤害提升<color=#2BAD00>25%</color>；\n<color=#FFFFFF>[强袭]</color>，<color=#FFFFFF>[明攻]</color>与<color=#FFFFFF>[围杀]</color>的增益效果可在角色为当前操作中角色时生效，角色切换为非当前操作角色时，增益效果依然生效，直到角色退场或增益效果维持3秒后，增益效果失效，角色切换为当前操作角色时，重新使增益效果生效；\n进入战场时若存在<color=#FFFFFF>[正兵]</color>，「席德」立刻获得<color=#FFFFFF>[强袭]</color>与<color=#FFFFFF>[围杀]</color>状态，<color=#FFFFFF>[正兵]</color>立刻获得<color=#FFFFFF>[明攻]</color>与<color=#FFFFFF>[围杀]</color>状态；\n<color=#FFFFFF>[明攻]</color>与<color=#FFFFFF>[强袭]</color>状态持续40秒，重复获得刷新持续时间；\n<color=#FFFFFF>[正兵]</color>作为操作中角色消耗能量时或「席德」消耗能量时，每消耗1点能量，可为「席德」回复0.5点<color=#FFFFFF>[钢能]</color>。",
      "stats": {
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1461_add",
      "category": "agent",
      "sourceName": "席德",
      "subType": "额外能力",
      "title": "额外能力：奇兵轰临",
      "desc": "队伍中存在其他<color=#FFFFFF>[强攻]</color>角色时触发：\n「席德」作为操作中角色造成伤害时，为<color=#FFFFFF>[正兵]</color>回复2点能量，1秒内最多触发一次；\n「席德」<color=#FFFFFF>[普通攻击：落华·重戮]</color>，<color=#FFFFFF>[普通攻击：落华·崩坠]</color>与<color=#FFFFFF>[终结技：机芯花园·绽放！]</color>造成的伤害提升30%，且无视敌人25%<color=#2EB6FF>电属性伤害抗性</color>。",
      "stats": {
        "dmgBonus": 30,
        "resShred": 25
      }
    },
    {
      "id": "agent_1461_m1",
      "category": "agent",
      "sourceName": "席德",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "「冻眠期」",
      "desc": "「席德」<color=#FFFFFF>[钢能]</color>达到100点时，即可发动<color=#FFFFFF>[普通攻击：落华·崩坠]</color>且总计消耗的<color=#FFFFFF>[钢能]</color>降低至100点；\n获得一次快速释放<color=#FFFFFF>[普通攻击：落华·重戮]</color>机会所需的<color=#FFFFFF>[钢能]</color>降低至100点；\n进入战场/发动<color=#FFFFFF>[终结技]</color>时，额外累积40/20点<color=#FFFFFF>[钢能]</color>；\n<color=#FFFFFF>[普通攻击：落华·崩坠]</color>造成的暴击伤害提升30%。",
      "stats": {
        "critDmg": 30
      }
    },
    {
      "id": "agent_1461_m2",
      "category": "agent",
      "sourceName": "席德",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "「汲光法」",
      "desc": "代理人<color=#FFFFFF>[围杀]</color>状态的增益效果生效时，该代理人造成的伤害无视20%防御力；\n发动<color=#FFFFFF>[强化特殊技：铁萼雨幕]</color>时，在累计消耗60点能量后，可继续消耗能量延长招式，直到松开按键或累计消耗120点能量；\n<color=#FFFFFF>[强化特殊技：铁萼雨幕]</color>每消耗5点能量会使本次衔接的<color=#FFFFFF>[普通攻击：落华·重戮]</color>造成的伤害提升5%。",
      "stats": {
        "defShred": 20,
        "dmgBonus": 5
      }
    },
    {
      "id": "agent_1461_m4",
      "category": "agent",
      "sourceName": "席德",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "「芳香调」",
      "desc": "「席德」<color=#FFFFFF>[围杀]</color>状态的增益效果生效时，\n喧响值获取效率提升10%，<color=#FFFFFF>[终结技]</color>造成的伤害提升20%。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1461_m6",
      "category": "agent",
      "sourceName": "席德",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "「有心论」",
      "desc": "「席德」的暴击伤害提升50%；\n发动<color=#FFFFFF>[普通攻击：落华·重戮]</color>时，额外发射3道激光，每道激光造成165%攻击力的伤害，3秒内最多触发一次。",
      "stats": {
        "critDmg": 50
      }
    }
  ],
  "般岳": [
    {
      "id": "agent_1471_core",
      "category": "agent",
      "sourceName": "般岳",
      "subType": "核心被动",
      "title": "核心被动：群山如我",
      "desc": "般岳会额外根据自身最大生命值提高贯穿力，每1点最大生命值将提高0.1点贯穿力；\n般岳发动招式造成的<color=#FF5521>火属性伤害</color>均为贯穿伤害，无视敌人防御，使用贯穿力作为招式伤害倍率；\n般岳进入战场时即可回复60闪能，在勘域模式中此效果180秒内最多触发一次。\n般岳可以通过以下方式回复<color=#FFFFFF>[嗔火]</color>：\n每消耗1点闪能，回复0.5点<color=#FFFFFF>[嗔火]</color>；\n发动<color=#FFFFFF>[招架支援]</color>时，回复4点<color=#FFFFFF>[嗔火]</color>；\n通过<color=#FFFFFF>[闪避：不动如山]</color>成功招架敌人攻击时，回复4点<color=#FFFFFF>[嗔火]</color>，若触发完美格挡，则改为回复6点<color=#FFFFFF>[嗔火]</color>，每1秒最多触发一次；\n触发<color=#FFFFFF>[极限闪避]</color>时，回复4点<color=#FFFFFF>[嗔火]</color>，每1秒最多触发一次。\n般岳最多拥有150点<color=#FFFFFF>[嗔火]</color>，拥有120点<color=#FFFFFF>[嗔火]</color>时，般岳可以通过发动<color=#FFFFFF>[普通攻击：焚身]</color>进入<color=#FFFFFF>[怒相]</color>状态，处于<color=#FFFFFF>[怒相]</color>状态时，般岳无法再获得<color=#FFFFFF>[嗔火]</color>，当般岳发动<color=#FFFFFF>[普通攻击：倾山]</color>后，会退出<color=#FFFFFF>[怒相]</color>状态；\n进入<color=#FFFFFF>[怒相]</color>状态时，般岳会获得4点<color=#FFFFFF>[山威]</color>，若般岳拥有<color=#FFFFFF>[山威]</color>，则发动<color=#FFFFFF>[强化特殊技]</color>时，不再消耗闪能，转而消耗1点<color=#FFFFFF>[山威]</color>并回复10点闪能，否则仍会消耗闪能，退出<color=#FFFFFF>[怒相]</color>状态时，会清空<color=#FFFFFF>[山威]</color>；\n处于<color=#FFFFFF>[怒相]</color>状态且有<color=#FFFFFF>[山威]</color>时，可以长按  按固定顺序自动打出四种<color=#FFFFFF>[强化特殊技]</color>及<color=#FFFFFF>[普通攻击：倾山]</color>；\n般岳发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援突击]</color>时，贯穿力提升<color=#2BAD00>300</color>点，造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>36%</color>，暴击伤害提升<color=#2BAD00>36%</color>，持续30秒，重复触发时刷新持续时间。",
      "stats": {
        "inCombatPen": 300,
        "dmgBonus": 36,
        "critDmg": 36
      }
    },
    {
      "id": "agent_1471_add",
      "category": "agent",
      "sourceName": "般岳",
      "subType": "额外能力",
      "title": "额外能力：绝巅",
      "desc": "队伍中存在<color=#FFFFFF>[支援]</color>或<color=#FFFFFF>[击破]</color>角色时触发：\n处于<color=#FFFFFF>[怒相]</color>状态时，若通过普通攻击派生或者快速键入指令的方式消耗<color=#FFFFFF>[山威]</color>发动<color=#FFFFFF>[强化特殊技]</color>时 ，般岳会获得一层<color=#FFFFFF>[明王]</color>，每层<color=#FFFFFF>[明王]</color>会使自身造成的<color=#FF5521>火属性伤害</color>提升5%，最多叠加3层，持续8秒，重复触发时刷新持续时间。",
      "stats": {
        "dmgBonus": 15
      }
    },
    {
      "id": "agent_1471_m1",
      "category": "agent",
      "sourceName": "般岳",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "贪欲如火",
      "desc": "<color=#FFFFFF>[强化特殊技：论道]</color>和<color=#FFFFFF>[强化特殊技：地动]</color>命中敌人时，会使敌人陷入<color=#FFFFFF>[战栗]</color>状态，处于该状态的敌人<color=#FF5521>火属性伤害抗性</color>降低10%，持续30秒；\n<color=#FFFFFF>[强化特殊技：狮子吼]</color>、<color=#FFFFFF>[强化特殊技：狮子吼·怒]</color>、<color=#FFFFFF>[强化特殊技：山摇]</color>、<color=#FFFFFF>[强化特殊技：山摇·怒]</color>、<color=#FFFFFF>[普通攻击：倾山]</color>和<color=#FFFFFF>[普通攻击：摧岳]</color>命中处于<color=#FFFFFF>[战栗]</color>状态的敌人时，造成的贯穿伤害提高10%；\n<color=#FFFFFF>[普通攻击：摧岳]</color>命中处于失衡状态的敌人时，会使其此次失衡的失衡持续时间提升2秒，敌人在一次失衡期间内只会受到一次该效果，且同类效果不可叠加。",
      "stats": {
        "resShred": 10,
        "ppDmgBonus": 10
      }
    },
    {
      "id": "agent_1471_m2",
      "category": "agent",
      "sourceName": "般岳",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "嗔恨如刀",
      "desc": "<color=#FFFFFF>[核心被动]</color>中的暴击伤害增益效果额外提升15%，<color=#FF5521>火属性伤害</color>增益效果额外提升15%；\n处于<color=#FFFFFF>[怒相]</color>状态时，般岳消耗<color=#FFFFFF>[山威]</color>发动<color=#FFFFFF>[强化特殊技]</color>时，额外回复5点闪能。",
      "stats": {}
    },
    {
      "id": "agent_1471_m4",
      "category": "agent",
      "sourceName": "般岳",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "肃灭单元·零型",
      "desc": "<color=#FFFFFF>[强化特殊技：狮子吼·怒]</color>、<color=#FFFFFF>[强化特殊技：山摇·怒]</color>、<color=#FFFFFF>[普通攻击：倾山]</color>和<color=#FFFFFF>[普通攻击：摧岳]</color>造成的伤害提升<color=#FFFFFF>30%</color>。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1471_m6",
      "category": "agent",
      "sourceName": "般岳",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "降世明王",
      "desc": "任意时刻，般岳发动<color=#FFFFFF>[强化特殊技]</color>都可获取<color=#FFFFFF>[明王]</color>；\n<color=#FFFFFF>[明王]</color>提供的<color=#FF5521>火属性伤害</color>增益效果额外提升8%，持续时间提升至30秒；\n发动<color=#FFFFFF>[普通攻击：摧岳]</color>时，般岳会对周身敌人造成等同于自身600%贯穿力的<color=#FF5521>火属性伤害</color>；\n衔接在<color=#FFFFFF>[强化特殊技]</color>后释放<color=#FFFFFF>[闪避：叫阵]</color>也可以获取<color=#FFFFFF>[明王]</color>。",
      "stats": {}
    }
  ],
  "琉音": [
    {
      "id": "agent_1481_core",
      "category": "agent",
      "sourceName": "琉音",
      "subType": "核心被动",
      "title": "核心被动：五星客服热线",
      "desc": "进入战场时，琉音初始拥有60点<color=#FFFFFF>[好评]</color>，初始暴击率超过50%时，每超过1%，冲击力提升<color=#2BAD00>2</color>点，最多提升100点；\n发动<color=#FFFFFF>[强化特殊技：石头]</color>后，下一次发动的<color=#FFFFFF>[强化特殊技]</color>变为<color=#FFFFFF>[强化特殊技：剪刀]</color>，持续8秒；\n发动<color=#FFFFFF>[强化特殊技：剪刀]</color>后，下一次发动的<color=#FFFFFF>[强化特殊技]</color>变为<color=#FFFFFF>[强化特殊技：布！]</color>，持续8秒；\n<color=#FFFFFF>[强化特殊技：布！]</color>命中敌人时，敌人获得<color=#FFFFFF>[恶意投诉]</color>效果，<color=#FFFFFF>[恶意投诉]</color>效果下敌人进入失衡状态后的失衡持续时间提升2秒，失衡易伤倍率提升<color=#2BAD00>30%</color>，从失衡状态恢复前<color=#FFFFFF>[恶意投诉]</color>效果对同一目标最多触发一次，失衡持续时间提升效果与同类效果不可叠加，拥有<color=#FFFFFF>[恶意投诉]</color>效果的敌人失衡结束时<color=#FFFFFF>[恶意投诉]</color>效果结束；\n处于接战状态下，琉音每秒积攒0.6点<color=#FFFFFF>[好评]</color>，发动<color=#FFFFFF>[强化特殊技：石头]</color>、<color=#FFFFFF>[强化特殊技：剪刀]</color>、<color=#FFFFFF>[强化特殊技：布！]</color>的重击命中敌人时将积攒7.5点<color=#FFFFFF>[好评]</color>，同一招式内最多积攒一次，最多积攒120点；\n当<color=#FFFFFF>[好评]</color>满90点且琉音利用<color=#FFFFFF>[连携技：迎宾踏垫]</color>、<color=#FFFFFF>[强化特殊技：送客！]</color>、<color=#FFFFFF>[快速支援：呼叫转移]</color>打开<color=#FFFFFF>[连携技]</color>窗口时，下一位出场的角色会将此次<color=#FFFFFF>[连携技]</color>强制升级为<color=#FFFFFF>[终结技]</color>，队友以此方式发动<color=#FFFFFF>[终结技]</color>时，琉音消耗60点<color=#FFFFFF>[好评]</color>；\n当<color=#FFFFFF>[好评]</color>满90点且琉音发动<color=#FFFFFF>[强化特殊技：送客！]</color>命中未打开<color=#FFFFFF>[连携技]</color>窗口的敌人时，将消耗90点<color=#FFFFFF>[好评]</color>强制打开<color=#FFFFFF>[连携技]</color>窗口，下一位出场的角色会将此次<color=#FFFFFF>[连携技]</color>强制升级为<color=#FFFFFF>[终结技]</color>；\n每当<color=#FFFFFF>[好评]</color>积攒至90点或发动<color=#FFFFFF>[终结技]</color>时，琉音获得1点<color=#FFFFFF>[客诉]</color>，最多拥有1点<color=#FFFFFF>[客诉]</color>。",
      "stats": {
        "dazeVuln": 30
      }
    },
    {
      "id": "agent_1481_add",
      "category": "agent",
      "sourceName": "琉音",
      "subType": "额外能力",
      "title": "额外能力：场外连线",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>角色或<color=#FFFFFF>[命破]</color>角色时触发：\n琉音造成的<color=#FFFFFF>[强化特殊技]</color>伤害的暴击伤害提升50%；\n发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>时全队角色获得<color=#FFFFFF>[好评如潮]</color>效果，<color=#FFFFFF>[好评如潮]</color>状态下的角色造成的伤害提升40%，持续15秒，琉音在<color=#FFFFFF>[好评如潮]</color>状态下发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>时，若当前<color=#FFFFFF>[好评如潮]</color>的剩余持续时间小于35秒，则将该状态的持续时间延长10秒；\n<color=#FFFFFF>[强化特殊技：石头]</color>、<color=#FFFFFF>[强化特殊技：剪刀]</color>、<color=#FFFFFF>[强化特殊技：布！]</color>重击命中时会根据队伍中琉音的上一位队友的特性造成额外伤害：\n队友为<color=#FFFFFF>[强攻]</color>代理人时，<color=#FFFFFF>[强化特殊技：石头]</color>、<color=#FFFFFF>[强化特殊技：剪刀]</color>、<color=#FFFFFF>[强化特殊技：布！]</color>额外造成等同于该<color=#FFFFFF>[强攻]</color>代理人320%攻击力的伤害；\n队友为<color=#FFFFFF>[命破]</color>代理人时，<color=#FFFFFF>[强化特殊技：石头]</color>、<color=#FFFFFF>[强化特殊技：剪刀]</color>、<color=#FFFFFF>[强化特殊技：布！]</color>额外造成等同于该<color=#FFFFFF>[命破]</color>代理人400%贯穿力的伤害。",
      "stats": {
        "critDmg": 50,
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1481_m1",
      "category": "agent",
      "sourceName": "琉音",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "服务热情保持饱满",
      "desc": "每秒积累的<color=#FFFFFF>[好评]</color>与发动<color=#FFFFFF>[强化特殊技：石头]</color>、<color=#FFFFFF>[强化特殊技：剪刀]</color>、<color=#FFFFFF>[强化特殊技：布！]</color>命中敌人时积累的<color=#FFFFFF>[好评]</color>提升16%，\n<color=#FFFFFF>[好评如潮]</color>状态下的角色无视敌人15%全属性伤害抗性。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1481_m2",
      "category": "agent",
      "sourceName": "琉音",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "7×24热线畅通",
      "desc": "<color=#FFFFFF>[恶意投诉]</color>效果下敌人进入失衡状态后的失衡易伤倍率额外提升20%，\n所有单位对<color=#FFFFFF>[恶意投诉]</color>效果下的敌人造成的伤害提升15%。",
      "stats": {
        "dazeVuln": 20,
        "dmgBonus": 15
      }
    },
    {
      "id": "agent_1481_m4",
      "category": "agent",
      "sourceName": "琉音",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "往事从不如烟",
      "desc": "进入战场时，琉音回复20点能量，\n在勘域模式中此效果180秒内最多触发一次；\n<color=#FFFFFF>[好评如潮]</color>效果下，琉音攻击力提升500点。",
      "stats": {
        "inCombatAtkFlat": 500
      }
    },
    {
      "id": "agent_1481_m6",
      "category": "agent",
      "sourceName": "琉音",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "真言",
      "desc": "通过<color=#FFFFFF>[核心被动]</color>使其他队友以终结技入场后，该队友获得<color=#FFFFFF>[余音]</color>效果，\n攻击命中敌人时琉音对敌人造成额外一次<color=#F0D12B>物理属性伤害</color>，等同于琉音480%攻击力，\n该伤害被视为<color=#FFFFFF>[强化特殊技]</color>伤害，1秒内最多触发一次，最多触发12次，\n重复获得<color=#FFFFFF>[余音]</color>效果时刷新次数，同时只能有一名队友获得<color=#FFFFFF>[余音]</color>效果。",
      "stats": {}
    }
  ],
  "千夏": [
    {
      "id": "agent_1491_core",
      "category": "agent",
      "sourceName": "千夏",
      "subType": "核心被动",
      "title": "核心被动：可爱即正义",
      "desc": "处于<color=#FFFFFF>[天使协律]</color>状态下的角色的攻击力提升，提升数值等同于千夏<color=#FFFFFF>30%</color>初始攻击力，最高不超过<color=#2BAD00>1050</color>点；当千夏的初始攻击力达到3500点时，为全队角色提供的攻击力增益效果达到最大值；\n[普通攻击：坏猫出没]、[强化特殊技：泡泡糖轰炸]、[强化特殊技：特别拍照技巧]、[连携技：别惹猫咪]、[终结技：通通砸碎！]攻击命中敌人时，为目标添加<color=#FFFFFF>[猫的凝视]</color>，持续12秒，千夏在前场时，会不断刷新<color=#FFFFFF>[猫的凝视]</color>的持续时间；持有<color=#FFFFFF>[猫的凝视]</color>的部分普通怪物对千夏的攻击欲望降低；\n队伍中的<color=#FFFFFF>[强攻]</color>或<color=#FFFFFF>[异常]</color>角色持续攻击命中持有<color=#FFFFFF>[猫的凝视]</color>的敌人时，会触发并清除<color=#FFFFFF>[猫的凝视]</color>：\n<color=#FFFFFF>[强攻]</color>角色触发时，对范围内敌人造成<color=#2BAD00>300%</color>攻击力的代理人属性伤害；\n<color=#FFFFFF>[异常]</color>角色触发时，对范围内敌人造成<color=#2BAD00>480%</color>攻击力的代理人属性伤害，此次伤害必定暴击，且暴击伤害增加<color=#2BAD00>150%</color>；\n<color=#FFFFFF>[猫的凝视]</color>造成的伤害，视为由[触发代理人]造成的伤害；\n场上存在多名持有<color=#FFFFFF>[猫的凝视]</color>的怪物时，只会触发主要攻击目标的<color=#FFFFFF>[猫的凝视]</color>，触发时会清除全场的<color=#FFFFFF>[猫的凝视]</color>；\n敌人处于失衡状态下时，<color=#FFFFFF>[猫的凝视]</color>触发所需的攻击次数大幅减少。",
      "stats": {
        "inCombatAtkFlat": 1050
      }
    },
    {
      "id": "agent_1491_add",
      "category": "agent",
      "sourceName": "千夏",
      "subType": "额外能力",
      "title": "额外能力：白日梦对位法",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>或与自身阵营相同的角色时触发：\n处于<color=#FFFFFF>[以太帷幕·妄想重奏]</color>内的角色攻击命中敌人时，目标的失衡易伤倍率提升30%，持续40秒；\n千夏进入战场时，回复15能量，在勘域模式中此效果180秒内最多触发一次。",
      "stats": {
        "dazeVuln": 30
      }
    },
    {
      "id": "agent_1491_skill_1_2",
      "category": "agent",
      "sourceName": "千夏",
      "subType": "特殊技",
      "title": "强化特殊技：特别拍照技巧",
      "desc": "进入[天使协律]状态后，点按   可以发动，或在<color=#FFFFFF>[强化特殊技：泡泡糖轰炸]</color>发动期间，保持长按   快速发动：\n与泡泡协同攻击目标敌人，造成<color=#F0D12B>物理伤害</color>；技能发动后，泡泡会加入战斗；\n重击发动前，开启<color=#FFFFFF>[以太帷幕·妄想重奏]</color>，<color=#FFFFFF>[以太帷幕·妄想重奏]</color>生效期间，全队角色攻击力额外提升50点，持续40秒，千夏重复开启<color=#FFFFFF>[以太帷幕·妄想重奏]</color>前，将关闭已有的<color=#FFFFFF>[以太帷幕·妄想重奏]</color>；\n招式重击命中敌人时，将触发<color=#FFFFFF>[快速支援]</color>；\n招式发动期间拥有无敌效果，每次进入[天使协律]，只能发动1次<color=#FFFFFF>[强化特殊技：特别拍照技巧]</color>。",
      "stats": {
        "inCombatAtkFlat": 50
      }
    },
    {
      "id": "agent_1491_m1",
      "category": "agent",
      "sourceName": "千夏",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "《孤独侵蚀症》",
      "desc": "千夏进入战场时，回复15能量，在勘域模式中此效果180秒内最多触发一次；<color=#FFFFFF>[猫的凝视]</color>触发并命中敌人时，使目标的防御力降低7%，持续40秒，最多叠加3层，每层效果单独结算持续时间。",
      "stats": {
        "defShred": 21
      }
    },
    {
      "id": "agent_1491_m2",
      "category": "agent",
      "sourceName": "千夏",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "《猫的随波逐流》",
      "desc": "千夏处于任意<color=#FFFFFF>[以太帷幕]</color>内时，使全队角色攻击力提升10%，每10秒获得1个<color=#FFFFFF>[磨爪器]</color>；\n<color=#FFFFFF>[猫的凝视]</color>触发所需的攻击次数减少；触发造成的伤害倍率提升：\n<color=#FFFFFF>[强攻]</color>角色触发时，伤害倍率增加200%；\n<color=#FFFFFF>[异常]</color>角色触发时，伤害倍率增加300%。",
      "stats": {
        "inCombatAtkPct": 10
      }
    },
    {
      "id": "agent_1491_m4",
      "category": "agent",
      "sourceName": "千夏",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "《妄想调查队》",
      "desc": "千夏发动<color=#FFFFFF>[终结技]</color>时，使全队角色造成的伤害提升<color=#FFFFFF>18%</color>，持续60秒。",
      "stats": {
        "dmgBonus": 18
      }
    },
    {
      "id": "agent_1491_m6",
      "category": "agent",
      "sourceName": "千夏",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "《空洞大爆炸》",
      "desc": "千夏发动<color=#FFFFFF>[强化特殊技]</color>时，进入<color=#FFFFFF>[潜心创作中！]</color>状态，持续8秒；\n<color=#FFFFFF>[潜心创作中！]</color>状态下，千夏发动的攻击必定暴击，并根据自身初始攻击力的0.03%提升自身的暴击伤害，最多提升105%；\n<color=#FFFFFF>[潜心创作中！]</color>状态下，千夏抗打断等级提升，受到的伤害降低40%；\n<color=#FFFFFF>[潜心创作中！]</color>状态下，千夏可以触发<color=#FFFFFF>[猫的凝视]</color>，以<color=#FFFFFF>[强攻]</color>代理人规则结算伤害；如果触发<color=#FFFFFF>[猫的凝视]</color>时，千夏拥有<color=#FFFFFF>[磨爪器]</color>，则立即消耗<color=#FFFFFF>[磨爪器]</color>并再次给敌人添加<color=#FFFFFF>[猫的凝视]</color>；\n<color=#FFFFFF>[潜心创作中！]</color>状态下，全队触发<color=#FFFFFF>[猫的凝视]</color>造成的伤害提升<color=#FFFFFF>50%</color>。",
      "stats": {
        "dmgBonus": 50
      }
    }
  ],
  "爱芮": [
    {
      "id": "agent_1501_core",
      "category": "agent",
      "sourceName": "爱芮",
      "subType": "核心被动",
      "title": "核心被动：控场核心",
      "desc": "爱芮的异常精通提升<color=#2BAD00>90</color>点；\n爱芮的第三段<color=#FFFFFF>[普通攻击：绝对音准]</color>重击命中处于<color=#FE437E>以太异常状态</color>、<color=#2EB6FF>电属性异常状态</color>、<color=#FF5521>火属性异常状态</color>、<color=#F0D12B>物理属性异常状态</color>、<color=#98EFF0>冰属性异常状态</color>、<color=#A6C5FD>风属性异常状态</color>的目标时，触发一次<color=#FFFFFF>[异放]</color>：额外结算一次属性异常伤害，相对于原属性异常伤害的比例为每10点初始异常掌控<color=#FE437E>27.5%</color>/<color=#2EB6FF>14.3%</color>/<color=#FF5521>35.7%</color>/<color=#F0D12B>2.5%</color>/<color=#98EFF0>3.6%</color>/<color=#A6C5FD>1.4%</color>，当目标处于失衡状态下时，该伤害比例额外提升<color=#FFFFFF>50%</color>。",
      "stats": {
        "anomalyMastery": 90
      }
    },
    {
      "id": "agent_1501_add",
      "category": "agent",
      "sourceName": "爱芮",
      "subType": "额外能力",
      "title": "额外能力：合作舞台",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>、<color=#FFFFFF>[支援]</color>或与自身阵营相同的角色或其他<color=#FFFFFF>[异常]</color>角色时触发：\n当有<color=#FFFFFF>[以太帷幕]</color>开启时，会在场上生成4个<color=#FFFFFF>[应援能量]</color>，1秒内最多触发1次；\n队伍中任意角色对敌人施加<color=#FE437E>[侵蚀]</color>效果时，该效果的持续时间提升3秒。",
      "stats": {}
    },
    {
      "id": "agent_1501_skill_1_2",
      "category": "agent",
      "sourceName": "爱芮",
      "subType": "特殊技",
      "title": "终结技：元气百分百",
      "desc": "喧响等级达到<color=#FFFFFF>[极]</color>时，点按  发动：\n释放自身全力，进入<color=#FFFFFF>[妄想时刻]</color>并对目标发动多段强力射击，造成大量<color=#FE437E>以太伤害</color>；\n进入<color=#FFFFFF>[妄想时刻]</color>时爱芮获得3层<color=#FFFFFF>[全场应援]</color>效果，同时开启<color=#FFFFFF>[以太帷幕·妄想重奏]</color>，<color=#FFFFFF>[以太帷幕·妄想重奏]</color>生效期间，全队角色攻击力额外提升50点，持续30秒，爱芮重复开启<color=#FFFFFF>[以太帷幕·妄想重奏]</color>前，将关闭已有的<color=#FFFFFF>[以太帷幕·妄想重奏]</color>；\n爱芮在蓄力时，若自身有<color=#FFFFFF>[全场应援]</color>效果，则优先消耗<color=#FFFFFF>[全场应援]</color>进行蓄力，每消耗1层<color=#FFFFFF>[全场应援]</color>可提升2段蓄力等级；\n在进入<color=#FFFFFF>[妄想时刻]</color>时，若自身已有<color=#FFFFFF>[全场应援]</color>效果，则会先将剩余层数的<color=#FFFFFF>[全场应援]</color>转化为<color=#FFFFFF>[应援能量]</color>生成在场上，每层<color=#FFFFFF>[全场应援]</color>可转化为2个<color=#FFFFFF>[应援能量]</color>；\n<color=#FFFFFF>[妄想时刻]</color>最大持续15秒，在<color=#FFFFFF>[妄想时刻]</color>期间，爱芮的第三段<color=#FFFFFF>[普通攻击：绝对音准]</color>将会提升为强化版；\n退出<color=#FFFFFF>[妄想时刻]</color>时，若自身有<color=#FFFFFF>[全场应援]</color>效果，也会将剩余层数<color=#FFFFFF>[全场应援]</color>转化为<color=#FFFFFF>[应援能量]</color>生成在场上，每层<color=#FFFFFF>[全场应援]</color>可转化为2个<color=#FFFFFF>[应援能量]</color>；\n招式发动期间拥有无敌效果。",
      "stats": {
        "inCombatAtkFlat": 50
      }
    },
    {
      "id": "agent_1501_m1",
      "category": "agent",
      "sourceName": "爱芮",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "元气声浪",
      "desc": "爱芮的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[特殊技]</color>，<color=#FFFFFF>[强化特殊技]</color>对敌人造成伤害时，无视目标10%的<color=#FE437E>以太异常积蓄抗性</color>；\n且自身触发<color=#FFFFFF>[异放]</color>时有概率触发暴击：基础暴击率为25%，暴击伤害为25%；若初始异常掌控大于100点，每超过1点初始异常掌控会使该效果的暴击率额外提升0.5%。",
      "stats": {
        "resShred": 10,
        "critRate": 0.5
      }
    },
    {
      "id": "agent_1501_m2",
      "category": "agent",
      "sourceName": "爱芮",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "梦幻节拍",
      "desc": "爱芮攻击和触发<color=#FFFFFF>[异放]</color>时无视目标16%防御力；在<color=#FFFFFF>[妄想时刻]</color>持续时间内，攻击和触发<color=#FFFFFF>[异放]</color>时额外无视目标8%防御力。",
      "stats": {
        "defShred": 24
      }
    },
    {
      "id": "agent_1501_m4",
      "category": "agent",
      "sourceName": "爱芮",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "机械天使",
      "desc": "爱芮触发<color=#FFFFFF>[异放]</color>时，自身获得4点能量和70点喧响值，10秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1501_m6",
      "category": "agent",
      "sourceName": "爱芮",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "构造体之梦",
      "desc": "进入战场时，爱芮立即获得1200点喧响值，在勘域模式中此效果180秒内最多触发一次；且爱芮进入<color=#FFFFFF>[妄想时刻]</color>后将不会退出，<color=#FFFFFF>强化版[普通攻击：绝对音准]</color>和<color=#FFFFFF>[终结技]</color>造成的<color=#FE437E>以太伤害</color>提升40%；\n当爱芮处于<color=#FFFFFF>[妄想时刻]</color>时，若场上有敌人进入属性异常状态，爱芮获得1层<color=#FFFFFF>[全场应援]</color>，该效果6秒内最多触发一次；\n在获得<color=#FFFFFF>[全场应援]</color>效果时，若自身已有3层<color=#FFFFFF>[全场应援]</color>效果，则会将溢出的<color=#FFFFFF>[全场应援]</color>效果转化为2个<color=#FFFFFF>[应援能量]</color>生成在场上。",
      "stats": {
        "dmgBonus": 40
      }
    }
  ],
  "南宫羽": [
    {
      "id": "agent_1511_core",
      "category": "agent",
      "sourceName": "南宫羽",
      "subType": "核心被动",
      "title": "核心被动：天才偶像",
      "desc": "南宫羽的异常精通提升<color=#2BAD00>120</color>点；\n南宫羽的初始异常掌控大于110点时，每超过1点初始异常掌控会使自身的冲击力提升1点；\n敌人处于失衡状态时，任意角色对其造成一次<color=#FFFFFF>[异放]</color>伤害、<color=#FFFFFF>[紊乱]</color>伤害、使其进入一次属性异常状态时会为其累计1层<color=#FFFFFF>[颤音]</color>；\n同一敌人最多可被叠加4层<color=#FFFFFF>[颤音]</color>；\n若<color=#FFFFFF>[颤音]</color>叠加到最大层数且敌人处于<color=#FE437E>以太异常状态</color>、<color=#2EB6FF>电属性异常状态</color>、<color=#FF5521>火属性异常状态</color>、<color=#F0D12B>物理属性异常状态</color>、<color=#98EFF0>冰属性异常状态</color>、<color=#A6C5FD>风属性异常状态</color>下时或当敌人持有<color=#FFFFFF>[颤音]</color>并从失衡状态恢复时，所有<color=#FFFFFF>[颤音]</color>会被清除；\n<color=#FFFFFF>[颤音]</color>被清除时，若敌人处于上述属性异常状态下，南宫羽会对目标造成一次<color=#FFFFFF>[异放]</color>伤害：额外结算一次属性异常伤害，相对于原属性异常伤害的比例为<color=#FE437E>720%</color>/<color=#2EB6FF>360%</color>/<color=#FF5521>900%</color>/<color=#F0D12B>63%</color>/<color=#98EFF0>90%</color>/<color=#A6C5FD>36%</color>，敌人身上每有1层<color=#FFFFFF>[颤音]</color>，该次<color=#FFFFFF>[异放]</color>的伤害比例额外提升25%，同一次失衡期间，若<color=#FFFFFF>[颤音]</color>已被清除，则敌人无法再被施加<color=#FFFFFF>[颤音]</color>；\n南宫羽的<color=#FFFFFF>[普通攻击：可爱地雷飞天撞]</color>或<color=#FFFFFF>[强化特殊技：相当沉重的爱意]</color>命中敌人时，会使自身的属性异常积蓄效率提升<color=#2BAD00>35%</color>，造成的失衡值提升<color=#2BAD00>20%</color>，使全队造成的伤害提升<color=#2BAD00>25%</color>，持续30秒，重复触发时刷新持续时间；\n处于接战状态时，南宫羽每秒回复3.8点<color=#FFFFFF>[重拍]</color>，队伍中任意角色使敌人进入属性异常状态会额外为南宫羽回复12点<color=#FFFFFF>[重拍]</color>，该效果每6秒最多触发一次；\n南宫羽最多拥有100点<color=#FFFFFF>[重拍]</color>，进入战场时，初始拥有30点<color=#FFFFFF>[重拍]</color>。",
      "stats": {
        "anomalyMastery": 120,
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1511_add",
      "category": "agent",
      "sourceName": "南宫羽",
      "subType": "额外能力",
      "title": "额外能力：天使队长",
      "desc": "队伍中存在<color=#FFFFFF>[异常]</color>角色或与自身阵营相同的角色时触发：\n队伍中任意角色攻击命中处于失衡状态的敌人造成的属性异常积蓄值提升30%，<color=#FFFFFF>[连携技]</color>攻击命中处于失衡状态的敌人造成的属性异常积蓄值额外提升30%；\n队伍中任意角色使敌人进入失衡状态时，南宫羽获得2层<color=#FFFFFF>[舞力全开]</color>效果，最多拥有2层，持续15秒，重复触发时刷新持续时间，拥有<color=#FFFFFF>[舞力全开]</color>时，南宫羽发动<color=#FFFFFF>[强化特殊技：相当沉重的爱意]</color>、<color=#FFFFFF>[普通攻击：可爱地雷飞天撞]</color>或<color=#FFFFFF>[快速支援：救场技巧]</color>且重击命中同时处于属性异常和失衡状态下的敌人时，会消耗1层<color=#FFFFFF>[舞力全开]</color>对满足条件的所有敌人触发特殊的<color=#FFFFFF>[紊乱]</color>效果<color=#FFFFFF>[极性紊乱]</color>，对目标造成原本<color=#FFFFFF>[紊乱]</color>效果25%的伤害，并触发队伍中上一位角色的<color=#FFFFFF>[快速支援]</color>，<color=#FFFFFF>[极性紊乱]</color>不会清除目标所处的属性异常状态，若该招式未能触发<color=#FFFFFF>[极性紊乱]</color>则不会消耗<color=#FFFFFF>[舞力全开]</color>，当南宫羽拥有<color=#FFFFFF>[舞力全开]</color>时，下一次换入前场将直接发动<color=#FFFFFF>[普通攻击：可爱地雷飞天撞]</color>第一段蓄力攻击且必定触发精准蓄力；\n队伍中任意角色使敌人进入失衡状态后，南宫羽下一次发动<color=#FFFFFF>[强化特殊技]</color>不会消耗能量，该效果持续15秒，每15秒最多触发一次；\n当南宫羽与爱芮共同处于队伍中时，爱芮的<color=#FFFFFF>[普通攻击：绝对音准]</color>重击命中处于属性异常和失衡状态下的敌人时，若南宫羽完整参与此次攻击，也会消耗1层<color=#FFFFFF>[舞力全开]</color>对满足条件的所有敌人触发<color=#FFFFFF>[极性紊乱]</color>；\n南宫羽的<color=#FFFFFF>[普通攻击：可爱地雷飞天撞]</color>第三段攻击或<color=#FFFFFF>[终结技：流落星群]</color>命中敌人时，敌人获得<color=#FFFFFF>[踉跄]</color>效果，失衡易伤倍率提升30%，该效果下的敌人进入失衡状态后的失衡持续时间提升3秒，从失衡状态恢复前<color=#FFFFFF>[踉跄]</color>效果对同一目标最多触发一次，失衡持续时间提升效果与同类效果不可叠加，拥有<color=#FFFFFF>[踉跄]</color>效果的敌人失衡结束时<color=#FFFFFF>[踉跄]</color>效果结束。",
      "stats": {
        "dazeVuln": 30
      }
    },
    {
      "id": "agent_1511_skill_1_2",
      "category": "agent",
      "sourceName": "南宫羽",
      "subType": "特殊技",
      "title": "终结技：流落星群",
      "desc": "喧响等级达到<color=#FFFFFF>[极]</color>时，点按  发动：\n向前方进行多段攻击，造成大量<color=#FE437E>以太属性伤害</color>；\n招式发动时，南宫羽会开启<color=#FFFFFF>[以太帷幕·妄想重奏]</color>，<color=#FFFFFF>[以太帷幕·妄想重奏]</color>生效期间，全队角色攻击力额外提升50点，持续30秒，南宫羽重复开启<color=#FFFFFF>[以太帷幕·妄想重奏]</color>前，将关闭已有的<color=#FFFFFF>[以太帷幕·妄想重奏]</color>；\n招式发动期间拥有无敌效果。",
      "stats": {
        "inCombatAtkFlat": 50
      }
    },
    {
      "id": "agent_1511_m1",
      "category": "agent",
      "sourceName": "南宫羽",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "慵懒的聚光灯",
      "desc": "<color=#FFFFFF>[强化特殊技：相当沉重的爱意]</color>或<color=#FFFFFF>[普通攻击：可爱地雷飞天撞]</color>命中敌人时，使敌人的全属性伤害抗性降低18%，持续40秒，重复触发时刷新持续时间；\n进入战场时，南宫羽的<color=#FFFFFF>[重拍]</color>回复至最大值，在勘域模式中此效果180秒内最多触发一次。",
      "stats": {
        "resShred": 18
      }
    },
    {
      "id": "agent_1511_m2",
      "category": "agent",
      "sourceName": "南宫羽",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "无痛的泪水",
      "desc": "每层<color=#FFFFFF>[颤音]</color>使<color=#FFFFFF>[核心被动：天才偶像]</color>中<color=#FFFFFF>[异放]</color>的伤害比例额外提升10%；\n<color=#FFFFFF>[额外能力：天使队长]</color>提供的失衡易伤倍率额外提升30%；\n操作中的角色<color=#FFFFFF>[连携技]</color>重击命中同时处于属性异常和失衡状态下的敌人时，会对敌人触发<color=#FFFFFF>[极性紊乱]</color>，对目标造成原本<color=#FFFFFF>[紊乱]</color>效果25%的伤害，敌人在同一失衡期间仅能触发一次该效果。",
      "stats": {
        "dazeVuln": 30
      }
    },
    {
      "id": "agent_1511_m4",
      "category": "agent",
      "sourceName": "南宫羽",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "共犯的舞步",
      "desc": "异常精通提升40点；\n<color=#FFFFFF>[普通攻击：可爱地雷飞天撞]</color>命中敌人造成的属性异常积蓄值提升35%。",
      "stats": {
        "anomalyMastery": 40
      }
    },
    {
      "id": "agent_1511_m6",
      "category": "agent",
      "sourceName": "南宫羽",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "天使的妄想",
      "desc": "南宫羽攻击造成的失衡值提升50%；\n敌人不处于失衡状态时，任意角色对其造成一次<color=#FFFFFF>[异放]</color>伤害或<color=#FFFFFF>[紊乱]</color>伤害、使其进入一次属性异常状态时会为其累计1层<color=#FFFFFF>[颤音：改]</color>，被<color=#FFFFFF>[强化特殊技：相当沉重的爱意]</color>或<color=#FFFFFF>[普通攻击：可爱地雷飞天撞]</color>重击命中时会累计1层<color=#FFFFFF>[颤音：改]</color>，被<color=#FFFFFF>[终结技：流落星群]</color>重击命中时会累计2层<color=#FFFFFF>[颤音：改]</color>；\n<color=#FFFFFF>[颤音：改]</color>最多累计4层，当敌人进入失衡状态时，<color=#FFFFFF>[颤音：改]</color>会被全部清除，<color=#FFFFFF>[颤音：改]</color>被清除时，若敌人处于<color=#FE437E>以太异常状态</color>、<color=#2EB6FF>电属性异常状态</color>、<color=#FF5521>火属性异常状态</color>、<color=#F0D12B>物理属性异常状态</color>、<color=#98EFF0>冰属性异常状态</color>、<color=#A6C5FD>风属性异常状态</color>下，南宫羽会对目标造成一次<color=#FFFFFF>[异放]</color>伤害：额外结算一次属性异常伤害，相对于原属性异常伤害的比例为<color=#FE437E>800%</color>/<color=#2EB6FF>400%</color>/<color=#FF5521>1000%</color>/<color=#F0D12B>70%</color>/<color=#98EFF0>100%</color>/<color=#A6C5FD>40%</color>，敌人身上每有1层<color=#FFFFFF>[颤音：改]</color>，该次<color=#FFFFFF>[异放]</color>的伤害比例额外提升25%；\n<color=#FFFFFF>[颤音：改]</color>与<color=#FFFFFF>[颤音]</color>无法相互叠加。",
      "stats": {}
    }
  ],
  "希希芙": [
    {
      "id": "agent_1521_core",
      "category": "agent",
      "sourceName": "希希芙",
      "subType": "核心被动",
      "title": "核心被动：致命私酿",
      "desc": "进入战场时，获得3点<color=#FFFFFF>[毒素]</color>，在勘域模式中此效果180秒内最多触发一次。\n拥有<color=#FFFFFF>[毒素]</color>时，接战状态下每5秒消耗1点<color=#FFFFFF>[毒素]</color>，触发一次<color=#FFFFFF>[蚀骨]</color>，造成<color=#2EB6FF>电属性伤害</color>；\n拥有<color=#FFFFFF>[毒素]</color>时，使全队角色对敌人造成的<color=#2EB6FF>电属性伤害</color>无视敌人<color=#2BAD00>6%</color>防御力，初始能量自动回复大于1.4时，超过部分每超过0.12，额外无视敌人<color=#2BAD00>1%</color>防御力，至多无视敌人<color=#2BAD00>25%</color>防御力，持续至<color=#FFFFFF>[毒素]</color>耗尽后30秒。\n<color=#FFFFFF>[蚀骨]</color>额外附加自身<color=#2BAD00>335%</color>攻击力的<color=#2EB6FF>电属性伤害</color>；\n队伍中有1/2名<color=#2EB6FF>电属性</color>角色时，<color=#FFFFFF>[蚀骨]</color>造成的失衡值提升40%/60%；\n获得<color=#FFFFFF>[毒素]</color>时，每溢出1点<color=#FFFFFF>[毒素]</color>，触发一次<color=#FFFFFF>[蚀骨]</color>。",
      "stats": {
        "defShred": 32
      }
    },
    {
      "id": "agent_1521_add",
      "category": "agent",
      "sourceName": "希希芙",
      "subType": "额外能力",
      "title": "额外能力：毒素发酵",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>或与自身属性相同的角色时触发：\n拥有<color=#FFFFFF>[毒素]</color>时，使全队角色暴击伤害提升40%，自身额外提升10%，持续至<color=#FFFFFF>[毒素]</color>耗尽后30秒。",
      "stats": {
        "critDmg": 40
      }
    },
    {
      "id": "agent_1521_skill_1_2",
      "category": "agent",
      "sourceName": "希希芙",
      "subType": "特殊技",
      "title": "蚀骨",
      "desc": "对附近敌人造成<color=#2EB6FF>电属性伤害</color>；\n每次触发，使自身暴击率提升6%，持续15秒，至多叠加3层，重复触发刷新持续时间。",
      "stats": {
        "critRate": 18
      }
    },
    {
      "id": "agent_1521_skill_1_3",
      "category": "agent",
      "sourceName": "希希芙",
      "subType": "特殊技",
      "title": "终结技：爬行恐惧",
      "desc": "喧响等级达到<color=#FFFFFF>[极]</color>时，点按  发动：\n对前方发动落雷攻击，造成大量<color=#2EB6FF>电属性伤害</color>；\n招式发动后，获得3点<color=#FFFFFF>[毒素]</color>；\n招式发动后，开启<color=#FFFFFF>[以太帷幕：冷血]</color>，持续30秒，期间全队角色暴击伤害提升5%；\n重复开启<color=#FFFFFF>[以太帷幕：冷血]</color>前，将关闭已有的<color=#FFFFFF>[以太帷幕：冷血]</color>；\n招式命中敌人时，将触发<color=#FFFFFF>[快速支援]</color>；\n招式发动期间拥有无敌效果。",
      "stats": {
        "critDmg": 5
      }
    },
    {
      "id": "agent_1521_m1",
      "category": "agent",
      "sourceName": "希希芙",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "旅人与猎物",
      "desc": "进入战场时，获得的<color=#FFFFFF>[毒素]</color>点数提升至6点；\n<color=#FFFFFF>[核心被动]</color>中无视敌人防御力效果提升至原本的140%，并使全队角色造成的伤害无视目标5%<color=#2EB6FF>电属性伤害抗性</color>；\n<color=#FFFFFF>[蚀骨]</color>造成的伤害无视目标10%<color=#2EB6FF>电属性伤害抗性</color>。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1521_m2",
      "category": "agent",
      "sourceName": "希希芙",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "饥肠与箴言",
      "desc": "<color=#FFFFFF>[连携技：团伙作案]</color>或<color=#FFFFFF>[终结技：爬行恐惧]</color>命中处于失衡状态下的敌人后，额外获得3点<color=#FFFFFF>[毒素]</color>；\n<color=#FFFFFF>[普通攻击：蛇吻]</color>造成的伤害提升35%。",
      "stats": {
        "dmgBonus": 35
      }
    },
    {
      "id": "agent_1521_m4",
      "category": "agent",
      "sourceName": "希希芙",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "坏蛋的觉悟",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，获得1层<color=#FFFFFF>[觉悟]</color>，至多叠加3层；\n发动<color=#FFFFFF>[普通攻击：蛇吻]</color>时，消耗全部<color=#FFFFFF>[觉悟]</color>，每消耗1层额外触发1次不消耗<color=#FFFFFF>[毒素]</color>的特殊<color=#FFFFFF>[蚀骨]</color>，该次<color=#FFFFFF>[蚀骨]</color>无法造成失衡值。",
      "stats": {}
    },
    {
      "id": "agent_1521_m6",
      "category": "agent",
      "sourceName": "希希芙",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "家与六分街道",
      "desc": "每次触发<color=#FFFFFF>[蚀骨]</color>时，获得1层<color=#FFFFFF>[蚀骨印记]</color>；\n全队角色除<color=#FFFFFF>[蚀骨]</color>外的攻击命中敌人时，消耗1层<color=#FFFFFF>[蚀骨印记]</color>，触发1次特殊的<color=#FFFFFF>[蚀骨]</color>，该次<color=#FFFFFF>[蚀骨]</color>无法造成失衡值，3秒内至多消耗1层<color=#FFFFFF>[蚀骨印记]</color>。",
      "stats": {}
    }
  ],
  "星徽·比利": [
    {
      "id": "agent_1531_core",
      "category": "agent",
      "sourceName": "星徽·比利",
      "subType": "核心被动",
      "title": "核心被动：骑士决心",
      "desc": "星徽·比利会额外根据自身最大生命值提高贯穿力，每1点最大生命值将提高0.1点贯穿力；发动招式造成的<color=#F0D12B>物理伤害</color>均为贯穿伤害，无视敌人防御，使用贯穿力作为招式伤害倍率；\n星徽·比利进入战场时即可回复60点闪能，在勘域模式中此效果180秒内最多触发一次;\n生命值大于25%时，可以点按  消耗生命值发动<color=#FFFFFF>[特殊技：动力压制]</color>，且接战状态下，每次发动该招式时，自身暴击伤害提升<color=#2BAD00>90%</color>，持续45秒，重复触发刷新持续时间；生命值小于或等于25%时，受到的伤害减少50%；\n星徽·比利攻击命中敌人时，会获得<color=#FFFFFF>[决意]</color>，回复量根据招式变化，<color=#FFFFFF>[决意]</color>上限为120点，处于接战状态下，会缓慢回复<color=#FFFFFF>[决意]</color>；<color=#FFFFFF>[强化特殊技：孤轮特技]</color>命中时、发动<color=#FFFFFF>[连携技：骑士漫步]</color>时或触发格挡时，额外回复<color=#FFFFFF>[决意]</color>；任意方式触发<color=#FFFFFF>[极限闪避]</color>时，回复3点<color=#FFFFFF>[决意]</color>，此效果0.5秒内最多触发一次；\n当<color=#FFFFFF>[决意]</color>大于等于100点时，长按  会消耗100点<color=#FFFFFF>[决意]</color>发动<color=#FFFFFF>[普通攻击：最高马力星光]</color>；\n<color=#FFFFFF>[普通攻击：骑士斗技]</color>命中敌人时，回复少量生命值；通过<color=#FFFFFF>[极限闪避]</color>发动<color=#FFFFFF>[闪避反击：决斗之王]</color>命中敌人时，回复生命值；发动<color=#FFFFFF>[强化特殊技：抓地轮毂]</color>或<color=#FFFFFF>[强化特殊技：摇曳步伐]</color>时，回复生命值。",
      "stats": {
        "critDmg": 90
      }
    },
    {
      "id": "agent_1531_add",
      "category": "agent",
      "sourceName": "星徽·比利",
      "subType": "额外能力",
      "title": "额外能力：炽热星辉",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>或<color=#FFFFFF>[防护]</color>或<color=#FFFFFF>[支援]</color>角色时触发：\n<color=#FFFFFF>[强化特殊技：孤轮特技]</color>、<color=#FFFFFF>[普通攻击：骑士斗技]</color>第四段、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>命中敌人时获得一层<color=#FFFFFF>[星辉]</color>，同一招式至多获得一层，持续45秒，至多叠加2层，每层<color=#FFFFFF>[星辉]</color>会使<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>、<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[普通攻击：最高马力星光]</color>造成的伤害提升20%。",
      "stats": {
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1531_m1",
      "category": "agent",
      "sourceName": "星徽·比利",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "英雄登场",
      "desc": "<color=#FFFFFF>[核心被动：骑士决心]</color>进入战场时，额外回复60点闪能；\n<color=#FFFFFF>[强化特殊技]</color>命中敌人时，使自身攻击造成的伤害无视目标18%<color=#F0D12B>物理伤害抗性</color>，持续45秒，重复触发时刷新持续时间。",
      "stats": {
        "resShred": 18
      }
    },
    {
      "id": "agent_1531_m2",
      "category": "agent",
      "sourceName": "星徽·比利",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "荒原机兵",
      "desc": "<color=#FFFFFF>[普通攻击：最高马力星光]</color>、<color=#FFFFFF>[强化特殊技：孤轮特技]</color>和<color=#FFFFFF>[终结技：骑士飞踢]</color>造成的伤害提升50%；\n发动<color=#FFFFFF>[强化特殊技：摇曳步伐]</color>、<color=#FFFFFF>[强化特殊技：抓地轮毂]</color>时或发动<color=#FFFFFF>[特殊技：动力压制]</color>命中处于失衡状态下的敌人时，获得<color=#FFFFFF>[涡轮增压]</color>效果：\n<color=#FFFFFF>[特殊技：动力压制]</color>会消耗该效果直接衔接<color=#FFFFFF>[强化特殊技：孤轮特技]</color>，并使该次<color=#FFFFFF>[强化特殊技：孤轮特技]</color>造成的暴击伤害提升50%，<color=#FFFFFF>[涡轮增压]</color>效果至多叠加1层。",
      "stats": {
        "dmgBonus": 50,
        "critDmg": 50
      }
    },
    {
      "id": "agent_1531_m4",
      "category": "agent",
      "sourceName": "星徽·比利",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "审判底火",
      "desc": "接战状态下，每次发动<color=#FFFFFF>[特殊技：动力压制]</color>时，自身暴击伤害提升8%，至多叠加2层，持续45秒，重复触发时刷新持续时间；\n若生命值低于35%，且自身非当前操作中的角色时，会持续回复生命值至35%。",
      "stats": {
        "critDmg": 16
      }
    },
    {
      "id": "agent_1531_m6",
      "category": "agent",
      "sourceName": "星徽·比利",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "星徽骑士",
      "desc": "<color=#FFFFFF>[终结技：骑士飞踢]</color>和<color=#FFFFFF>[普通攻击：最高马力星光]</color>造成的贯穿伤害提升18%；\n第四段<color=#FFFFFF>[普通攻击：骑士斗技]</color>、<color=#FFFFFF>[强化特殊技：孤轮特技]</color>或<color=#FFFFFF>[连携技：骑士漫步]</color>命中敌人后，可以获得1层<color=#FFFFFF>[煊赫星辉]</color>，最多获得6层，同一招式内至多获得1层；\n发动<color=#FFFFFF>[终结技：骑士飞踢]</color>或<color=#FFFFFF>[普通攻击：最高马力星光]</color>时，至多消耗2层<color=#FFFFFF>[煊赫星辉]</color>，每消耗1层<color=#FFFFFF>[煊赫星辉]</color>，使该招式的最后一击额外造成100%贯穿力的<color=#F0D12B>物理伤害</color>。",
      "stats": {
        "ppDmgBonus": 18
      }
    }
  ],
  "普罗米娅": [
    {
      "id": "agent_1541_core",
      "category": "agent",
      "sourceName": "普罗米娅",
      "subType": "核心被动",
      "title": "核心被动：盗火",
      "desc": "若普罗米娅的初始异常掌控大于150点，每超过1点初始异常掌控会提升自身1.5点异常精通，提升0.35%全队造成的<color=#FFFFFF>[异放]</color>伤害；\n普罗米娅的不同攻击命中敌人时回复一定<color=#FFFFFF>[寒蚀值]</color>，队伍中角色触发<color=#98EFF0>[冻结]</color>效果、<color=#FFFFFF>[紊乱]</color>效果、敌人被触发<color=#FFFFFF>[乱流]</color>效果、自身触发<color=#FFFFFF>[强化特殊技：处刑式·匿影]</color>时，额外回复5/5/5/10点<color=#FFFFFF>[寒蚀值]</color>，最多积累100点<color=#FFFFFF>[寒蚀值]</color>；\n队友触发<color=#FFFFFF>[异放]</color>效果命中敌人时，普罗米娅额外回复15点<color=#FFFFFF>[寒蚀值]</color>；\n若<color=#FFFFFF>[寒蚀值]</color>大于等于50点，则消耗50点<color=#FFFFFF>[寒蚀值]</color>，转化为1点<color=#FFFFFF>[霜刑]</color>，最多获得2点<color=#FFFFFF>[霜刑]</color>；\n进入战场时，普罗米娅获得2点<color=#FFFFFF>[霜刑]</color>；\n发动<color=#FFFFFF>[强化特殊技：处刑式·绝裁]</color>的终结一击命中处于<color=#98EFF0>冰属性异常状态</color>、<color=#FE437E>以太异常状态</color>、<color=#2EB6FF>电属性异常状态</color>、<color=#FF5521>火属性异常状态</color>、<color=#F0D12B>物理属性异常状态</color>、<color=#A6C5FD>风属性异常状态</color>的敌人时，触发1次<color=#FFFFFF>[异放]</color>效果，固定结算<color=#2BAD00>635%</color>倍率的对应属性的属性异常伤害，招式发动时消耗1点<color=#FFFFFF>[霜刑]</color>;\n普罗米娅触发<color=#FFFFFF>[异放]</color>效果命中敌人时额外回复100点喧响值，0.5秒内最多触发一次，发动<color=#FFFFFF>[终结技：彻骨磔罚]</color>时获得<color=#FFFFFF>[寒誓]</color>效果，拥有<color=#FFFFFF>[寒誓]</color>效果时，发动<color=#FFFFFF>[强化特殊技：处刑式·绝裁]</color>、<color=#FFFFFF>[连携技：倒悬清算]</color>、<color=#FFFFFF>[终结技：彻骨磔罚]</color>后点按或长按  可消耗<color=#FFFFFF>[寒誓]</color>效果直接衔接<color=#FFFFFF>[特殊技：处刑式·重霜]</color>，<color=#FFFFFF>[寒誓]</color>效果最多获得1层。",
      "stats": {}
    },
    {
      "id": "agent_1541_add",
      "category": "agent",
      "sourceName": "普罗米娅",
      "subType": "额外能力",
      "title": "额外能力：饮冰",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或<color=#FFFFFF>[支援]</color>角色时触发：\n发动<color=#FFFFFF>[强化特殊技]</color>时，普罗米娅的<color=#98EFF0>冰异常积蓄效率</color>提升30%，持续30秒，重复触发时刷新持续时间；\n队伍中任意角色对敌人施加<color=#98EFF0>[霜寒]</color>效果时，该效果的持续时间提升3秒；\n普罗米娅发动<color=#FFFFFF>[强化特殊技]</color>命中敌人时，敌人获得<color=#FFFFFF>[有罪推定]</color>状态，全队角色对<color=#FFFFFF>[有罪推定]</color>状态的敌人造成<color=#FFFFFF>[异放]</color>效果时无视40%防御力，<color=#FFFFFF>[有罪推定]</color>状态持续30秒，重复触发时刷新持续时间。",
      "stats": {
        "defShred": 40
      }
    },
    {
      "id": "agent_1541_m1",
      "category": "agent",
      "sourceName": "普罗米娅",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "理想稚嫩",
      "desc": "普罗米娅发动<color=#FFFFFF>[终结技：彻骨磔罚]</color>时额外获得效果：\n<color=#FFFFFF>[霜刑]</color>不满时获得1点<color=#FFFFFF>[霜刑]</color>，\n该效果在发动<color=#FFFFFF>[终结技：彻骨磔罚]</color>后可触发一次；\n全队角色对<color=#FFFFFF>[有罪推定]</color>状态的敌人造成<color=#FFFFFF>[异放]</color>效果时额外无视20%防御力。",
      "stats": {
        "defShred": 20
      }
    },
    {
      "id": "agent_1541_m2",
      "category": "agent",
      "sourceName": "普罗米娅",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "信念飘摇",
      "desc": "普罗米娅的异常精通提升40点；\n消耗<color=#FFFFFF>[霜刑]</color>造成的<color=#FFFFFF>[异放]</color>效果的倍率提升120%。",
      "stats": {
        "anomalyMastery": 40
      }
    },
    {
      "id": "agent_1541_m4",
      "category": "agent",
      "sourceName": "普罗米娅",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "冷酷罪名",
      "desc": "普罗米娅触发<color=#FFFFFF>[异放]</color>效果时，回复5点<color=#FFFFFF>[寒蚀值]</color>，0.5秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1541_m6",
      "category": "agent",
      "sourceName": "普罗米娅",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "故事未完待续",
      "desc": "普罗米娅消耗<color=#FFFFFF>[霜刑]</color>触发<color=#FFFFFF>[异放]</color>效果时，\n额外触发一次特殊的<color=#FFFFFF>[异放]</color>效果，\n固定结算200%倍率的对应属性的属性异常伤害，\n同时回复5点<color=#FFFFFF>[寒蚀值]</color>、100点喧响值，\n该效果每15秒最多触发一次；\n此外，普罗米娅造成的属性异常伤害、<color=#FFFFFF>[紊乱]</color>伤害无视敌人15%全属性伤害抗性。",
      "stats": {
        "resShred": 15
      }
    }
  ],
  "佩洛伊斯": [
    {
      "id": "agent_1551_core",
      "category": "agent",
      "sourceName": "佩洛伊斯",
      "subType": "核心被动",
      "title": "核心被动：煊赫车辇",
      "desc": "进入战场时，佩洛伊斯获得30点[特定招式]，在勘域模式中此效果180秒内最多触发一次，且不同攻击命中敌人时回复一定<color=#FFFFFF>[日珥]</color>，处于接战状态下，每秒回复0.5点<color=#FFFFFF>[日珥]</color>，最多获得60点；\n佩洛伊斯发动不同[终结技]时，分别可获得如下效果：\n上分支-[终结技：万军诛绝]：获得30点[日珥]，并获得[特定招式]状态，[阳炎]状态下，佩洛伊斯发动[终结技]对处于失衡状态下的敌人造成的暴击伤害提升40%，[日珥]大于等于30点时，[普通攻击：天光]的第四段攻击期间长按  可直接衔接[普通攻击：天光]的第三段攻击，持续21秒，重复触发时刷新持续时间；\n下分支-[终结技：凯旋坦途]：获得[特定招式]状态，[耀斑]状态下，能量获得效率提升15%，造成的伤害提升<color=#2BAD00>40%</color>，发动[强化特殊技]触发完美格挡时回复10点[日珥]，持续200秒，重复触发时刷新持续时间；\n左分支-[终结技：无拘剑势]：重击命中[浸染]状态下的敌人时，额外造成等同于<color=#2BAD00>900%</color>攻击力的伤害；\n右分支-[终结技：永陷幽囚]：重击命中失衡敌人触发[特定招式]效果，额外造成等同于<color=#2BAD00>2250%</color>攻击力的伤害，招式发动时，使所有处于失衡状态的敌人失衡持续时间提升3秒，终结一击命中时敌人失衡结束。",
      "stats": {
        "critDmg": 40,
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1551_add",
      "category": "agent",
      "sourceName": "佩洛伊斯",
      "subType": "额外能力",
      "title": "额外能力：辉煌军势",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>或<color=#FFFFFF>[支援]</color>角色时触发：\n佩洛伊斯的暴击伤害提升40%；\n发动[连携技]时回复自身300点<color=#FFFFFF>[喧响值]</color>。",
      "stats": {
        "critDmg": 40
      }
    },
    {
      "id": "agent_1551_m1",
      "category": "agent",
      "sourceName": "佩洛伊斯",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "黄昏旧章",
      "desc": "进入战场时，佩洛伊斯获得1000点<color=#FFFFFF>[喧响值]</color>，\n在勘域模式中此效果180秒内最多触发一次，\n暴击率提升8%。",
      "stats": {
        "critRate": 8
      }
    },
    {
      "id": "agent_1551_m2",
      "category": "agent",
      "sourceName": "佩洛伊斯",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "煜焰铁骑",
      "desc": "发动[终结技：凯旋坦途]时回复1500点<color=#FFFFFF>[喧响值]</color>，该效果180秒最多触发一次；\n佩洛伊斯的喧响值上限提升1000点。",
      "stats": {}
    },
    {
      "id": "agent_1551_m4",
      "category": "agent",
      "sourceName": "佩洛伊斯",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "焚昼孽火",
      "desc": "佩洛伊斯发动<color=#FFFFFF>[强化特殊技：日华]</color>触发完美格挡时，\n立刻获得等同于自身8%生命值上限的护盾，持续10秒，重复触发刷新持续时间，\n持有该护盾时，佩洛伊斯造成的失衡值提升10%。",
      "stats": {}
    },
    {
      "id": "agent_1551_m6",
      "category": "agent",
      "sourceName": "佩洛伊斯",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "拂晓晨星",
      "desc": "全队角色触发<color=#FFFFFF>[浸染]</color>时，佩洛伊斯获得1层<color=#FFFFFF>[曜锋]</color>，上限3层，该效果每0.2秒最多触发一次；\n<color=#FFFFFF>[终结技：无拘剑势]</color>重击命中敌人时获得3层<color=#FFFFFF>[曜锋]</color>，该效果每20秒最多触发一次；\n发动<color=#FFFFFF>[普通攻击：天光]</color>第四段、<color=#FFFFFF>[终结技：无拘剑势]</color>下劈时，若拥有<color=#FFFFFF>[曜锋]</color>，则消耗1点<color=#FFFFFF>[曜锋]</color>强化该招式，额外造成等同于510%攻击力的伤害，且命中处于<color=#FFFFFF>[浸染]</color>状态下的敌人时，获得250点喧响值，该效果每6秒最多触发一次；\n<color=#FFFFFF>[终结技：无拘剑势]</color>命中处于<color=#A6C5FD>风属性异常状态</color>的敌人时，强制触发一次<color=#FFFFFF>[浸染]</color>，重击命中处于<color=#FFFFFF>[浸染]</color>状态下的敌人，额外造成等同于1000%攻击力的伤害；\n发动<color=#FFFFFF>[终结技：无拘剑势]</color>时，使所有同时处于失衡和<color=#A6C5FD>风属性异常状态</color>的敌人失衡持续时间提升3秒，敌人在一次失衡期间内只会受到一次佩洛伊斯施加的失衡持续时间提升效果，且与同类效果不可叠加。",
      "stats": {}
    }
  ],
  "维琳娜": [
    {
      "id": "agent_1561_core",
      "category": "agent",
      "sourceName": "维琳娜",
      "subType": "核心被动",
      "title": "核心被动：风华盈袖",
      "desc": "维琳娜初始能量自动回复大于1.2时，超过部分每超过0.01，造成的伤害提升0.21%，最多提升35%，异常掌控提升0.5点，最多提升84点；\n维琳娜进入战场时，获得45点[特定招式]，在勘域模式中此效果180秒内最多触发一次，维琳娜发动<color=#FFFFFF>[强化特殊技：风切变·扬清]</color>或<color=#FFFFFF>[强化特殊技：风切变·三重绝息]</color>都会获得45点<color=#FFFFFF>[风华]</color>，<color=#FFFFFF>[风华]</color>上限为135点；\n维琳娜触发<color=#FFFFFF>[乱流]</color>时，会获得1点[特定招式]并召唤[特定招式]，造成<color=#A6C5FD>风属性伤害</color>，该效果每3秒最多触发一次，当维琳娜拥有2点<color=#FFFFFF>[风蚀]</color>时，维琳娜下一次触发<color=#FFFFFF>[乱流]</color>时，会消耗2点<color=#FFFFFF>[风蚀]</color>使此时<color=#FFFFFF>[乱流]</color>的伤害倍率提升<color=#2BAD00>150%</color>，并且不再召唤<color=#FFFFFF>[微域气旋]</color>转而召唤[特定招式]，此时不会获得<color=#FFFFFF>[风蚀]</color>；\n当维琳娜召唤的<color=#FFFFFF>[广域气旋]</color>首次命中处于<color=#FFFFFF>[浸染]</color>状态下的敌人，会触发[特定招式]效果，转化为相应属性的<color=#FFFFFF>[广域气旋]</color>，并会造成相应属性的伤害，<color=#FFFFFF>[广域气旋]</color>攻击命中敌人时，会使敌人的<color=#A6C5FD>风属性异常积蓄抗性</color>降低7%，持续35秒，重复触发时刷新持续时间，若<color=#FFFFFF>[赋彩]</color>后的<color=#FFFFFF>[广域气旋]</color>攻击命中敌人，则敌人的<color=#FFFFFF>相应属性异常积蓄抗性</color>也会降低7%，持续35秒，重复触发时刷新持续时间；\n受到<color=#FFFFFF>[广域气旋]</color>影响的敌人被击败时，会使该<color=#FFFFFF>[广域气旋]</color>的持续时间延长5秒，该效果对同一<color=#FFFFFF>[广域气旋]</color>仅能触发一次，同一时间只能存在一个<color=#FFFFFF>[广域气旋]</color>；\n<color=#FFFFFF>[微域气旋]</color>和<color=#FFFFFF>[广域气旋]</color>会在消散时触发一次爆炸，该次爆炸命中处于<color=#A6C5FD>风属性异常状态</color>下的敌人时，都会对目标造成一次<color=#FFFFFF>[异放]</color>伤害：额外结算一次属性异常伤害，固定结算<color=#2BAD00>145%</color>和<color=#2BAD00>255%</color>倍率的<color=#A6C5FD>风属性异常伤害</color>。",
      "stats": {
        "dmgBonus": 35,
        "resShred": 20
      }
    },
    {
      "id": "agent_1561_add",
      "category": "agent",
      "sourceName": "维琳娜",
      "subType": "额外能力",
      "title": "额外能力：茶会礼仪",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或与自身属性相同的角色时触发：\n维琳娜造成的<color=#A6C5FD>[风化]</color>和<color=#FFFFFF>[乱流]</color>伤害提升10%，<color=#FFFFFF>[终结技]</color>重击命中处于<color=#A6C5FD>风属性异常状态</color>下的敌人时，会对目标造成一次<color=#FFFFFF>[异放]</color>伤害：额外结算一次属性异常伤害，固定结算<color=#A6C5FD>680%</color>倍率的<color=#A6C5FD>风属性异常伤害</color>；\n<color=#FFFFFF>[核心被动：风华盈袖]</color>中，[特定招式]造成的<color=#FFFFFF>属性异常积蓄抗性</color>降低效果额外提升7%，造成的失衡值提升30%，累积的属性异常积蓄值提升15%。",
      "stats": {
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1561_m1",
      "category": "agent",
      "sourceName": "维琳娜",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "秩序化优雅",
      "desc": "<color=#FFFFFF>[额外能力：茶会礼仪]</color>中，<color=#FFFFFF>[广域气旋]</color>造成的失衡值额外提升20%；\n维琳娜触发<color=#FFFFFF>[乱流]</color>时无视目标20%<color=#FFFFFF>全属性伤害抗性</color>；\n全队造成<color=#A6C5FD>[风化]</color>伤害时，无视目标20%<color=#A6C5FD>风属性伤害抗性</color>。",
      "stats": {
        "resShred": 40
      }
    },
    {
      "id": "agent_1561_m2",
      "category": "agent",
      "sourceName": "维琳娜",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "饱和式计划",
      "desc": "维琳娜触发<color=#A6C5FD>[风化]</color>时，也可以获取1点<color=#FFFFFF>[风蚀]</color>，该效果每5秒最多触发一次；\n<color=#FFFFFF>[广域气旋]</color>触发<color=#FFFFFF>[赋彩]</color>效果后，可以积蓄相应属性的异常积蓄值，且该攻击累积的属性异常积蓄值不参与异常伤害结算；\n<color=#FFFFFF>[额外能力：茶会礼仪]</color>中，维琳娜造成的<color=#A6C5FD>[风化]</color>和<color=#FFFFFF>[乱流]</color>伤害提升效果额外提升15%。",
      "stats": {}
    },
    {
      "id": "agent_1561_m4",
      "category": "agent",
      "sourceName": "维琳娜",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "茶话即审判",
      "desc": "维琳娜发动<color=#FFFFFF>[强化特殊技]</color>会使自身攻击力提升15%，持续40秒，重复触发时刷新持续时间。",
      "stats": {
        "inCombatAtkPct": 15
      }
    },
    {
      "id": "agent_1561_m6",
      "category": "agent",
      "sourceName": "维琳娜",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "首席天使",
      "desc": "当维琳娜消耗2点<color=#FFFFFF>[风蚀]</color>提升<color=#FFFFFF>[乱流]</color>伤害倍率时，会获得1点<color=#FFFFFF>[风蚀]</color>，该效果每6秒最多触发一次；\n维琳娜攻击命中处于<color=#A6C5FD>风属性异常状态</color>下的敌人时，造成的<color=#A6C5FD>风属性异常积蓄值</color>提升20%；\n当维琳娜对处于<color=#A6C5FD>[风化]</color>状态的敌人再次施加<color=#A6C5FD>[风化]</color>时，会根据上一次<color=#A6C5FD>[风化]</color>的剩余持续时间提升此次<color=#A6C5FD>[风化]</color>的伤害，每1秒剩余持续时间会使伤害提升2.5%，最多提升40%。",
      "stats": {
        "dmgBonus": 40
      }
    }
  ],
  "诺姆": [
    {
      "id": "agent_1571_core",
      "category": "agent",
      "sourceName": "诺姆",
      "subType": "核心被动",
      "title": "核心被动：精准制导",
      "desc": "初始暴击率超过50%时，每超过1%，暴击伤害提升<color=#2BAD00>1.7%</color>，最多额外提升<color=#2BAD00>85%</color>；\n初始暴击率超过50%时，每超过1%，[强化特殊技]、[特殊技]、[终结技]攻击命中敌人时，造成的失衡值提升<color=#2BAD00>0.8%</color>，最多额外提升<color=#2BAD00>40%</color>；\n诺姆会根据自身贯穿力额外提升攻击力，每1点贯穿力将提升1.25点攻击力，最多提升1200点攻击力；\n进入战场时，诺姆立刻获得60%<color=#FFFFFF>[特定招式]</color>，在勘域模式中此效果180秒内最多触发一次；\n<color=#FFFFFF>[预热膛温]</color>大于等于80%后，下次发动的<color=#FFFFFF>[普通攻击：帽子把戏]</color>将无视冷却时间限制触发<color=#FFFFFF>[快速支援]</color>，并消耗80%<color=#FFFFFF>[预热膛温]</color>将其替换为<color=#FFFFFF>[连携技]</color>。",
      "stats": {
        "critDmg": 30,
        "inCombatAtkFlat": 1200,
        "inCombatPen": 1200
      }
    },
    {
      "id": "agent_1571_add",
      "category": "agent",
      "sourceName": "诺姆",
      "subType": "额外能力",
      "title": "额外能力：集群优势",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>、<color=#FFFFFF>[命破]</color>角色或与自身阵营相同的角色时触发：\n诺姆及其造物、战斗邦布攻击命中敌人时，对敌人施加1层<color=#FFFFFF>[技术鸿沟]</color>，每层<color=#FFFFFF>[技术鸿沟]</color>能够使目标的失衡易伤倍率提升3%，最多叠加10层，每0.5秒最多叠加1层；\n持有任意层数<color=#FFFFFF>[技术鸿沟]</color>的敌人进入失衡状态后的失衡持续时间提升2秒，失衡持续时间提升效果与同类效果不可叠加，拥有<color=#FFFFFF>[技术鸿沟]</color>效果的敌人失衡结束时<color=#FFFFFF>[技术鸿沟]</color>效果结束；\n<color=#FFFFFF>[特定招式]</color>期间，诺姆的攻击力提升44点，该效果随角色等级提升，每级增加14点，最多提升870点；\n<color=#FFFFFF>[嗯呢弹幕]</color>期间，全队代理人造成的伤害提升<color=#FFFFFF>20%</color>。",
      "stats": {
        "dazeVuln": 30,
        "inCombatAtkFlat": 870,
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1571_m1",
      "category": "agent",
      "sourceName": "诺姆",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "激进远视主义",
      "desc": "<color=#FFFFFF>[强化特殊技：火力实验]</color>中[嗯呢炮塔]展开导弹舱的持续时间增加至12秒；\n任意招式中的[破甲弹头]或[高爆弹头]命中敌人时，\n使敌人的全属性伤害抗性降低15%，持续15秒，重复触发时刷新持续时间。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1571_m2",
      "category": "agent",
      "sourceName": "诺姆",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "万物统一公理",
      "desc": "<color=#FFFFFF>[额外能力：集群优势]</color>中，每层<color=#FFFFFF>[技术鸿沟]</color>提供的失衡易伤倍率提升至6%；\n诺姆处于接战状态下发动<color=#FFFFFF>[普通攻击：帽子把戏]</color>时，回复25点能量，20秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1571_m4",
      "category": "agent",
      "sourceName": "诺姆",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "优势邦布学说",
      "desc": "诺姆消耗<color=#FFFFFF>[预热膛温]</color>触发<color=#FFFFFF>[连携技]</color>时：\n使诺姆和对应代理人回复200点喧响值。",
      "stats": {}
    },
    {
      "id": "agent_1571_m6",
      "category": "agent",
      "sourceName": "诺姆",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "天才第一因",
      "desc": "队伍中任意角色使敌人进入失衡状态后，诺姆将不断召唤导弹轰击场上随机敌人，持续6秒，\n每发导弹间隔0.75秒，并对范围内敌人造成等同于诺姆200%攻击力的<color=#FF5521>火属性伤害</color>，\n该伤害会被视为<color=#FFFFFF>[终结技]</color>伤害，重复触发刷新持续时间，30秒内最多触发一次；\n诺姆的[破甲弹头]造成的失衡值提升<color=#FFFFFF>30%</color>，[高爆弹头]造成的伤害提升<color=#FFFFFF>30%</color>。",
      "stats": {
        "dmgBonus": 30
      }
    }
  ],
  "蕾米埃尔": [
    {
      "id": "agent_1581_core",
      "category": "agent",
      "sourceName": "蕾米埃尔",
      "subType": "核心被动",
      "title": "核心被动：时序=万色滞行",
      "desc": "蕾米埃尔的<color=#FFA9DD>[异化系数]</color>为自身异常精通的0.02%，且当队伍中<color=#FFFFFF>[异常]</color>角色数量为3时，<color=#FFA9DD>[异化系数]</color>额外提升10%；\n蕾米埃尔通过队友触发[特定招式]反应时，会根据此次属性异常效果在受到<color=#FFA9DD>[异化]</color>加强后的[特定招式]生成<color=#FFFFFF>[虚曜]</color>，最多可储存最新生成的3个<color=#FFFFFF>[虚曜]</color>；\n若<color=#FFFFFF>[支援技：花羽轮舞]</color>/<color=#FFFFFF>[终结技：缭乱终幕]</color>/<color=#FFFFFF>[普通攻击：垂虹]</color>/<color=#FFFFFF>[普通攻击：惊鸿]</color>命中目标，在招式结束后可触发<color=#FFFFFF>[耀变]</color>效果：\n基于已储存的所有<color=#FFFFFF>[虚曜]</color>中的<color=#FFFFFF>[异常效果强度]</color>，对敌人造成招式对应倍率的属性异常伤害，并根据自身异常精通的<color=#2BAD00>0.2%</color>提升此伤害倍率；\n蕾米埃尔在进入[特定招式]状态时或发动<color=#FFFFFF>[普通攻击：垂虹]</color>或<color=#FFFFFF>[普通攻击：惊鸿]</color>后，会清空身上储存的所有<color=#FFFFFF>[虚曜]</color>。",
      "stats": {}
    },
    {
      "id": "agent_1581_add",
      "category": "agent",
      "sourceName": "蕾米埃尔",
      "subType": "额外能力",
      "title": "额外能力：芳菲之邀",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或同阵营角色时触发：\n当队伍中<color=#FFFFFF>[异常]</color>角色数量为1/2/3时，进入战场时为全队角色提升等同于蕾米埃尔初始攻击力6%/12%/40%的攻击力，提升上限不超过1600点，蕾米埃尔在[特定招式]状态下造成的失衡值提升6%/12%/35%；\n蕾米埃尔为敌人施加<color=#FFA9DD>[流明积蓄点]</color>时会同时附加<color=#FFFFFF>[幻色]</color>效果：全队角色攻击<color=#FFFFFF>[幻色]</color>效果下的敌人时，异常积蓄效率提升15%，敌人身上无<color=#FFA9DD>[流明积蓄点]</color>时<color=#FFFFFF>[幻色]</color>效果消失，<color=#FFFFFF>[幻色]</color>效果消失后该异常积蓄效率提升效果会额外持续8秒。",
      "stats": {
        "inCombatAtkFlat": 1600
      }
    },
    {
      "id": "agent_1581_skill_1_2",
      "category": "agent",
      "sourceName": "蕾米埃尔",
      "subType": "特殊技",
      "title": "特殊技：曙色颂·转辉",
      "desc": "若蕾米埃尔处于接战状态中且<color=#FFFFFF>[浮晖]</color>达到最大值120点时，在<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>后长按  可进入<color=#FFFFFF>[转换姿态]</color>，在<color=#FFFFFF>[转换姿态]</color>下切换角色时，蕾米埃尔会进入<color=#FFFFFF>[相变时流]</color>状态：\n<color=#FFFFFF>[相变时流]</color>状态下蕾米埃尔会自主行动，协助作战，其中部分攻击还可为目标施加<color=#FFA9DD>[流明积蓄点]</color>，期间<color=#FFFFFF>[浮晖]</color>会随时间消耗，当<color=#FFFFFF>[浮晖]</color>耗尽或离开接战状态时会退出<color=#FFFFFF>[相变时流]</color>状态，未退出<color=#FFFFFF>[相变时流]</color>状态前，蕾米埃尔无法通过<color=#FFFFFF>[连携技]</color>之外的方式主动换入；\n若蕾米埃尔在一次<color=#FFFFFF>[相变时流]</color>状态下触发3次[特定招式]反应后，或在<color=#FFFFFF>[浮晖]</color>耗尽时自身储存的[特定招式]数量大于等于1时，则激活<color=#FFFFFF>[支援技：花羽轮舞]</color>，解锁普通换入并使蕾米埃尔下次普通换入时自动发动<color=#FFFFFF>[支援技：花羽轮舞]</color>；\n进入<color=#FFFFFF>[相变时流]</color>状态时，蕾米埃尔会使全队角色造成的伤害提升<color=#2BAD00>18%</color>，持续60秒，重复触发时刷新持续时间；\n若蕾米埃尔发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>攻击命中处于失衡状态的敌人，且<color=#FFFFFF>[浮晖]</color>达到最大值120点时，在<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>中切换角色也可进入<color=#FFFFFF>[相变时流]</color>状态；\n若进入<color=#FFFFFF>[转换姿态]</color>后未切换角色，则蕾米埃尔发动下落攻击回到地面。",
      "stats": {
        "dmgBonus": 18
      }
    },
    {
      "id": "agent_1581_m1",
      "category": "agent",
      "sourceName": "蕾米埃尔",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "青涩誓言",
      "desc": "进入战场时，蕾米埃尔获得3个特殊[特定招式]，在勘域模式中此效果180秒内最多触发一次；\n蕾米埃尔触发[特定招式]效果造成伤害时，无视目标50%的全属性伤害抗性；\n发动<color=#FFFFFF>[支援技：花羽轮舞]</color>时，获得200点喧响值，18秒内最多触发1次此效果；\n蕾米埃尔处于[特定招式]状态下时，队伍中其他角色造成的属性异常伤害提升10%。",
      "stats": {
        "resShred": 50,
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1581_m2",
      "category": "agent",
      "sourceName": "蕾米埃尔",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "倾落喧嚣",
      "desc": "蕾米埃尔的<color=#FFA9DD>[异化系数]</color>提升20%；\n队伍中<color=#FFFFFF>[异常]</color>角色对<color=#FFFFFF>[幻色]</color>效果下的敌人造成属性异常伤害时，无视目标15%的防御力，<color=#FFFFFF>[幻色]</color>效果消失后该效果会额外持续8秒；\n蕾米埃尔在[特定招式]状态下自主发动攻击为敌人施加<color=#FFA9DD>[流明积蓄点]</color>的频率提升。",
      "stats": {
        "defShred": 15
      }
    },
    {
      "id": "agent_1581_m4",
      "category": "agent",
      "sourceName": "蕾米埃尔",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "漫长的告别",
      "desc": "蕾米埃尔触发[特定招式]效果时，伤害倍率额外提升12%；\n在蕾米埃尔进入战场获得3个特殊[特定招式]后，若将<color=#FFFFFF>[虚曜]</color>全部消耗，则可再一次获得最大数量的特殊<color=#FFFFFF>[虚曜]</color>，可再次获得特殊<color=#FFFFFF>[虚曜]</color>的效果在生效1次后或蕾米埃尔进入[特定招式]状态时消失。",
      "stats": {
        "dmgBonus": 12
      }
    },
    {
      "id": "agent_1581_m6",
      "category": "agent",
      "sourceName": "蕾米埃尔",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "千度振翅的孑羽",
      "desc": "蕾米埃尔发动<color=#FFFFFF>[普通攻击：垂虹]</color>和<color=#FFFFFF>[普通攻击：惊鸿]</color>时，会触发2次[特定招式]效果；\n若第四段<color=#FFFFFF>[普通攻击]</color>命中目标，招式结束后蕾米埃尔可获得3个特殊[特定招式]，通过此种方式获得的特殊<color=#FFFFFF>[虚曜]</color>可造成的伤害为进入战场时获得的特殊<color=#FFFFFF>[虚曜]</color>的25%。",
      "stats": {}
    }
  ],
  "希格莉德": [
    {
      "id": "agent_1591_core",
      "category": "agent",
      "sourceName": "希格莉德",
      "subType": "核心被动",
      "title": "核心被动：天空骑士",
      "desc": "<color=#FFFFFF>[普通攻击：凛冽枪尖]</color>第四段、<color=#FFFFFF>[强化特殊技：乱琼]</color>、<color=#FFFFFF>[强化特殊技：碎玉]</color>、<color=#FFFFFF>[支援突击：冰饕]</color>、<color=#FFFFFF>[连携技：冰凌卷地]</color>、<color=#FFFFFF>[终结技：霜天]</color>与<color=#FFFFFF>[闪避反击：回马枪]</color>视为[特定招式]；\n希格莉德的任意[特定招式]命中敌人时，若当前未处于[特定招式]状态，则进入[特定招式]状态，获得1次<color=#FFFFFF>[普通攻击：敛枪式]</color>发动机会，最多储存1次；\n处于[特定招式]状态下，希格莉德发动任意[特定招式]命中敌人时，可刷新[特定招式]状态，并获得1次<color=#FFFFFF>[普通攻击：敛枪式]</color>发动机会，最多储存1次；\n触发或刷新[特定招式]时，其持续时间随<color=#FFFFFF>[普通攻击：敛枪式]</color>段数提升而缩短：一/二/三段时，持续时间分别为<color=#FFFFFF>8</color>/<color=#FFFFFF>7</color>/<color=#FFFFFF>6</color>秒；\n[特定招式]状态结束时，<color=#FFFFFF>[普通攻击：敛枪式]</color>段数降低一段；\n激活或刷新[特定招式]状态时，希格莉德的暴击率提升<color=#2BAD00>66%</color>，持续<color=#FFFFFF>8</color>秒；重复触发时持续时间延长<color=#FFFFFF>8</color>秒，最多不超过<color=#FFFFFF>40</color>秒；\n处于[特定招式]状态下，希格莉德攻击命中处于失衡状态下的敌人时，对目标造成伤害的失衡易伤倍率提升20%。",
      "stats": {
        "critRate": 66,
        "dazeVuln": 20
      }
    },
    {
      "id": "agent_1591_add",
      "category": "agent",
      "sourceName": "希格莉德",
      "subType": "额外能力",
      "title": "额外能力：天际联军",
      "desc": "队伍中存在<color=#FFFFFF>[支援]</color>或<color=#FFFFFF>[击破]</color>角色时触发：\n希格莉德的攻击力提升120点，该效果随角色等级提升，每级增加12点，最多提升840点；\n攻击命中处于<color=#FFFFFF>[浸染]</color>状态下的敌人时，自身造成的伤害提升<color=#FFFFFF>15%</color>。",
      "stats": {
        "inCombatAtkFlat": 840,
        "dmgBonus": 15
      }
    },
    {
      "id": "agent_1591_skill_1_2",
      "category": "agent",
      "sourceName": "希格莉德",
      "subType": "特殊技",
      "title": "连携技：冰凌卷地",
      "desc": "触发<color=#FFFFFF>[连携技]</color>时，选择对应角色发动：\n对前方敌人发动强力穿刺，造成大量<color=#98EFF0>冰属性伤害</color>；\n招式发动时，获得<color=#FFFFFF>[砥砺]</color>，使后续<color=#FFFFFF>[普通攻击：敛枪式]</color>造成的伤害提升20%，持续50秒；\n当本招式第一次命中处于失衡状态下的精英或首领级敌人时，会记录并重置当前<color=#FFFFFF>[普通攻击：敛枪式]</color>段数，同时进入[特定招式]状态，\n[特定招式]状态下，[特定招式]持续时间不会减少，长按  可连续释放<color=#FFFFFF>[普通攻击：敛枪式]</color>第一段至第三段；发动<color=#FFFFFF>[普通攻击：敛枪式]</color>第三段后结束[特定招式]状态，并将<color=#FFFFFF>[普通攻击：敛枪式]</color>段数恢复；\n从失衡状态恢复前[特定招式]状态对同一目标最多触发一次。\n招式视为[特定招式]；\n[特定招式]状态期间<color=#FFFFFF>[普通攻击：敛枪式]</color>命中失衡状态下的敌人不会开启连携窗口；\n招式发动期间拥有无敌效果。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1591_m1",
      "category": "agent",
      "sourceName": "希格莉德",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "很久很久以前",
      "desc": "发动<color=#FFFFFF>[普通攻击：敛枪式]</color>第三段时，获得<color=#FFFFFF>[巡空枪势]</color>和一次发动<color=#FFFFFF>[普通攻击：敛枪式]</color>的机会；\n<color=#FFFFFF>[普通攻击：敛枪式]</color>发动机会溢出时，下一次<color=#FFFFFF>[普通攻击：敛枪式]</color>的最后一击额外造成<color=#FFFFFF>100%</color>攻击力的<color=#98EFF0>冰属性伤害</color>；\n希格莉德自身攻击力提升<color=#FFFFFF>25%</color>。",
      "stats": {
        "inCombatAtkPct": 25
      }
    },
    {
      "id": "agent_1591_m2",
      "category": "agent",
      "sourceName": "希格莉德",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "传说的第一幕",
      "desc": "<color=#FFFFFF>[出枪式]</color>和<color=#FFFFFF>[普通攻击：敛枪式]</color>造成伤害的穿透率提升<color=#FFFFFF>24%</color>；\n<color=#FFFFFF>[巡空枪势]</color>效果的持续时间延长2秒；\n希格莉德的喧响值获取效率提升10%。",
      "stats": {
        "penRatio": 24
      }
    },
    {
      "id": "agent_1591_m4",
      "category": "agent",
      "sourceName": "希格莉德",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "英雄养成中",
      "desc": "每次获得<color=#FFFFFF>[巡空枪势]</color>时，自身造成的伤害提升<color=#FFFFFF>18%</color>，持续<color=#FFFFFF>8</color>秒，重复触发时可使持续时间延长<color=#FFFFFF>8</color>秒，最多不超过<color=#FFFFFF>40</color>秒。",
      "stats": {
        "dmgBonus": 18
      }
    },
    {
      "id": "agent_1591_m6",
      "category": "agent",
      "sourceName": "希格莉德",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "天空的骑士",
      "desc": "<color=#FFFFFF>[普通攻击：敛枪式]</color>第一/二/三段的最后一击命中敌人时，额外造成<color=#FFFFFF>80%</color>/<color=#FFFFFF>90%</color>/<color=#FFFFFF>100%</color>攻击力的<color=#98EFF0>冰属性伤害</color>；\n招式<color=#FFFFFF>[连携技：冰凌卷地]</color>命中失衡状态下的敌人时，自身进入<color=#FFFFFF>[破阵]</color>状态不再有次数限制；\n在<color=#FFFFFF>[破阵]</color>状态下，希格莉德会更快地发动<color=#FFFFFF>[普通攻击：敛枪式]</color>。",
      "stats": {}
    }
  ],
  "挽昼": [
    {
      "id": "agent_1601_core",
      "category": "agent",
      "sourceName": "挽昼",
      "subType": "核心被动",
      "title": "核心被动：梦现=源质重构",
      "desc": "挽昼发动招式造成的伤害均为锐化伤害，使用防御力作为招式伤害倍率，部分锐化伤害会积累残痕值，残痕值满时，敌人会进入<color=#FFFFFF>[残痕]</color>，最多叠加3层，挽昼发动部分招式重击命中处于<color=#FFFFFF>[残痕]</color>状态下的敌人，且挽昼为操作中的代理人、<color=#FFFFFF>[愿火]</color>未达上限时，会消耗目标持有的所有<color=#FFFFFF>[残痕]</color>；每消耗1层<color=#FFFFFF>[残痕]</color>，对目标触发1次<color=#FFFFFF>[毁伤]</color>，额外造成范围<color=#FF5521>燎源属性伤害</color>；\n触发暴击时，锐化伤害不受暴击伤害加成，转而计算锐暴伤害加成；若暴击率超过100%且已经触发暴击，还将基于超过部分的暴击率再进行一次锐暴判定，触发锐暴则额外计算一次锐暴伤害加成；挽昼每拥有1%的初始暴击伤害，初始暴击率提升0.35%；\n挽昼进入战场时即可回复60点锐能（勘域180秒CD）；\n进入接战状态时，挽昼获得<color=#FFFFFF>[极昼]</color>效果，暴击率提升<color=#2BAD00>40%</color>，造成伤害无视目标<color=#2BAD00>20%</color>的防御力，持续20秒，其他角色或德蕾琪娜为操作中的代理人时持续时间不减少，发动任意<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[普通攻击：执旌·聚锋]</color>时重新获得<color=#FFFFFF>[极昼]</color>；\n德蕾琪娜发动<color=#FFFFFF>[招架支援]</color>造成的失衡值提升50%并积累少量[残痕]；艾尔妲与林德薇恩发动的<color=#FFFFFF>[支援突击]</color>残痕积蓄效率提升15%，造成的伤害提升20%；\n全队代理人触发<color=#FFFFFF>[毁伤]</color>时，每消除一层<color=#FFFFFF>[残痕]</color>，挽昼获得40点<color=#FFFFFF>[愿火]</color>（上限160点）；当<color=#FFFFFF>[愿火]</color>不少于120点且未持有<color=#FFFFFF>[链齿]</color>、<color=#FFFFFF>[旗令]</color>、<color=#FFFFFF>[愿核]</color>时，可消耗120点<color=#FFFFFF>[愿火]</color>发动<color=#FFFFFF>[普通攻击：执旌·聚锋]</color>；\n挽昼发动<color=#FFFFFF>[普通攻击：执旌·聚锋]</color>、<color=#FFFFFF>[强化特殊技：焚夜·长暗终焉]</color>、<color=#FFFFFF>[强化特殊技：燃灯·永昼之炬]</color>、<color=#FFFFFF>[终结技：「此行，共赴前路」]</color>、<color=#FFFFFF>[终结技：「此愿，重塑万象」]</color>命中造成伤害时，使目标积攒等同于实际伤害60%的<color=#FFFFFF>[烬痕]</color>；全队造成的<color=#FFFFFF>[毁伤]</color>使目标积攒等同于实际伤害40%的<color=#FFFFFF>[烬痕]</color>；艾尔妲发动<color=#FFFFFF>[强化特殊技：燃灯·永昼之炬]</color>、<color=#FFFFFF>[终结技：「此愿，重塑万象」]</color>终结一击命中时消除所有<color=#FFFFFF>[烬痕]</color>造成<color=#FFFFFF>[烬灭]</color>直接扣除等量血量。",
      "stats": {
        "critRate": 40,
        "defShred": 20,
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1601_add",
      "category": "agent",
      "sourceName": "挽昼",
      "subType": "额外能力",
      "title": "额外能力：领袖之证",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>角色、<color=#FFFFFF>[防护]</color>角色或其他<color=#FFFFFF>[锋御]</color>角色时触发：\n进入战斗时，或挽昼发动任意<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[普通攻击：执旌·聚锋]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[冲刺攻击：巡征·影域穿袭]</color>时，全队<color=#FFFFFF>[锋御]</color>代理人进入<color=#FFFFFF>[众愿一心]</color>状态，锐暴伤害提升<color=#FFFFFF>25%</color>，持续45秒；重复进入时刷新持续时间。",
      "stats": {
        "sharpCritDmg": 25
      }
    },
    {
      "id": "agent_1601_m1",
      "category": "agent",
      "sourceName": "挽昼",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "隐世的虚狩",
      "desc": "挽昼进入战场时立即获得120点<color=#FFFFFF>[愿火]</color>，在勘域模式中此效果180秒内最多触发一次；敌人被击败时，挽昼回复80点<color=#FFFFFF>[愿火]</color>，该回复效果每60秒最多触发一次；挽昼的残痕积蓄效率提升10%，发动招式造成的伤害无视敌人15%的<color=#FF5521>火属性伤害抗性</color>。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1601_m2",
      "category": "agent",
      "sourceName": "挽昼",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "继承者的叛旗",
      "desc": "挽昼发动其他招式命中敌人造成锐化伤害时，也可使目标积攒<color=#FFFFFF>[烬痕]</color>，积攒量等同于该次实际伤害的30%；全队触发<color=#FFFFFF>[毁伤]</color>和挽昼使敌人积攒<color=#FFFFFF>[烬痕]</color>时，最终结算的<color=#FFFFFF>[烬痕]</color>量提升35%；挽昼发动<color=#FFFFFF>[普通攻击：执旌·聚锋]</color>后，额外回复200点喧响值；挽昼的喧响值上限提升1000点（上限变为4000点）。",
      "stats": {}
    },
    {
      "id": "agent_1601_m4",
      "category": "agent",
      "sourceName": "挽昼",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "奉献者的虚像",
      "desc": "进入战场时，挽昼立即获得1000点喧响值，在勘域模式中此效果180秒内最多触发一次；进入战场时，挽昼首次发动<color=#FFFFFF>[普通攻击：执旌·聚锋]</color>后，下次发动的<color=#FFFFFF>[强化特殊技：燃灯·永昼之炬]</color>或<color=#FFFFFF>[终结技：「此愿，重塑万象」]</color>使目标积攒<color=#FFFFFF>[烬痕]</color>时，<color=#FFFFFF>[影画：继承者的叛旗]</color>中的<color=#FFFFFF>[烬痕]</color>积攒量提升效果额外提升65%，在勘域模式中此效果180秒内最多触发一次；挽昼造成的伤害提升10%。",
      "stats": {
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1601_m6",
      "category": "agent",
      "sourceName": "挽昼",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "破晓的希冀",
      "desc": "进入战场时，挽昼首次发动的<color=#FFFFFF>[普通攻击：执旌·聚锋]</color>不再获得<color=#FFFFFF>[旗令]</color>，改为获得<color=#FFFFFF>[愿核]</color>，在勘域模式中此效果180秒内最多触发一次；挽昼发动<color=#FFFFFF>[终结技：「此愿，重塑万象」]</color>触发<color=#FFFFFF>[烬灭]</color>后，将快速衔接发动一次特殊的<color=#FFFFFF>[强化特殊技：燃灯·永昼之炬]</color>，无需消耗<color=#FFFFFF>[旗令]</color>；该次<color=#FFFFFF>[强化特殊技：燃灯·永昼之炬]</color>不造成实际伤害，但会直接为目标附加<color=#FFFFFF>[烬痕]</color>，附加量等同于前一次<color=#FFFFFF>[终结技：「此愿，重塑万象」]</color>为目标积攒的<color=#FFFFFF>[烬痕]</color>量的80%，随后消除目标所有<color=#FFFFFF>[烬痕]</color>，触发一次<color=#FFFFFF>[烬灭]</color>；挽昼发动招式造成的伤害无视目标15%的防御力。",
      "stats": {
        "defShred": 15
      }
    }
  ],
  "克拉蕾": [
    {
      "id": "agent_1611_core",
      "category": "agent",
      "sourceName": "克拉蕾",
      "subType": "核心被动",
      "title": "核心被动：苍白血宴",
      "desc": "克拉蕾发动招式造成的伤害均为锐化伤害，使用防御力作为招式伤害倍率，部分锐化伤害会积累残痕值，残痕值满时，敌人会进入[残痕]，[残痕]最多叠加3层，发动[特殊技：血华誓·斩金断铁]、[特殊技：血华誓·葬血强袭]命中处于[残痕]状态下的敌人时，会消耗一层[残痕]，触发[毁伤]并造成一次范围伤害；\n触发暴击时，锐化伤害不受暴击伤害加成，转而计算锐暴伤害加成；若暴击率超过100%且已经触发暴击，还将基于超过部分的暴击率再进行一次锐暴判定，触发锐暴则额外计算一次锐暴伤害加成；克拉蕾每拥有1%的初始暴击伤害，初始暴击率提升0.35%；\n克拉蕾进入战场时即可回复60点锐能，在勘域模式中此效果180秒内最多触发一次;\n克拉蕾处于[特定招式]期间，抗打断等级提升，克拉蕾发动[连携技]时延长[猩红铭刻]2秒持续时间；\n克拉蕾处于[猩红铭刻]，或是在发动[连携技]、[终结技]、[反制支援]、[支援突击]期间，暴击率提升<color=#2BAD00>30%</color>，残痕积蓄效率提升<color=#2BAD00>50%</color>，在[普通攻击：血华誓·锻星]和[普通攻击：血华誓·伏钺]招式攻击期间触发极限闪避时，使招式剩余时间内造成的伤害提升15%。",
      "stats": {
        "critRate": 30,
        "dmgBonus": 15
      }
    },
    {
      "id": "agent_1611_add",
      "category": "agent",
      "sourceName": "克拉蕾",
      "subType": "额外能力",
      "title": "额外能力：血裔传承",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>角色、其他<color=#FFFFFF>[锋御]</color>或与自身属性相同的角色时触发：\n全队代理人触发[浸染]时，克拉蕾回复300点喧响值，18秒内最多触发1次；\n克拉蕾或队友触发[毁伤]时，全队[锋御]代理人进入[残锋]，[残锋]状态下，锐暴伤害提升<color=#FFFFFF>25%</color>，持续40秒；重复进入[残锋]时，刷新[残锋]持续时间。",
      "stats": {
        "sharpCritDmg": 25
      }
    },
    {
      "id": "agent_1611_m1",
      "category": "agent",
      "sourceName": "克拉蕾",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "淋漓古志",
      "desc": "克拉蕾攻击命中敌人并造成锐暴时，残痕积蓄效率提升20%；\n克拉蕾触发[毁伤]造成的伤害倍率提升至原本的130%。",
      "stats": {}
    },
    {
      "id": "agent_1611_m2",
      "category": "agent",
      "sourceName": "克拉蕾",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "薪火荣冠",
      "desc": "[猩红铭刻]最大持续时间延长2秒；\n克拉蕾处于[猩红铭刻]，或是在发动[连携技]、[终结技]、[反制支援]、[支援突击]期间，\n攻击命中时无视目标18%<color=#2EB6FF>电属性伤害抗性</color>。",
      "stats": {
        "resShred": 18
      }
    },
    {
      "id": "agent_1611_m4",
      "category": "agent",
      "sourceName": "克拉蕾",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "赤月彷徨",
      "desc": "[普通攻击：血华誓·锻星]第三段招式发动期间，连续斩击的可延长时间增加；\n[普通攻击：血华誓·锻星]第三段、[连携技：血华誓·血契共鸣]、[终结技：血华誓·千锤百炼]造成的伤害提升20%。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1611_m6",
      "category": "agent",
      "sourceName": "克拉蕾",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "热夜之梦",
      "desc": "克拉蕾发动[连携技：血华誓·血契共鸣]、[终结技：血华誓·千锤百炼]重击命中敌人时，不消耗[残痕]直接触发1次单体[毁伤]。",
      "stats": {}
    }
  ],
  "洛克茜": [
    {
      "id": "agent_1621_core",
      "category": "agent",
      "sourceName": "洛克茜",
      "subType": "核心被动",
      "title": "核心被动：热夜初拥",
      "desc": "每消耗25点能量，获得1点<color=#FFFFFF>[风能]</color>，<color=#FFFFFF>[风能]</color>上限为3点；\n洛克茜的初始<color=#FFFFFF>能量自动回复</color>大于1.2时，超过部分每超过0.01，攻击力提升5点，最多提升<color=#2BAD00>960</color>点，冲击力提升0.4点，最多提升<color=#2BAD00>76.8</color>点；\n<color=#FFFFFF>[特殊技：恕不远送]</color>命中处于<color=#FFFFFF>[风化]</color>状态中的敌人后，会触发<color=#FFFFFF>[净化]</color>，<color=#FFFFFF>[浸染]</color>状态被还原；\n队伍中任意队友触发<color=#FFFFFF>[浸染]</color>或<color=#FFFFFF>[净化]</color>效果时，洛克茜将根据<color=#FFFFFF>[浸染]</color>或<color=#FFFFFF>[净化]</color>的属性为全队角色提供增益效果：洛克茜每拥有1%暴击率，非<color=#FFFFFF>[锋御]</color>角色造成对应属性以及风属性伤害时，暴击伤害提升0.4%，最多提升<color=#2BAD00>40%</color>；<color=#FFFFFF>[锋御]</color>角色造成对应属性以及风属性伤害时，锐暴伤害提升0.2%，最多提升<color=#2BAD00>20%</color>；每个属性增益效果分别持续50秒，重复触发时刷新持续时间；\n对已经处于<color=#FFFFFF>[风化]</color>状态下的敌人再次施加<color=#FFFFFF>[风化]</color>时，根据被覆盖的<color=#FFFFFF>[风化]</color>状态下的<color=#FFFFFF>[浸染]</color>属性及风属性，全队角色同样可以获得该增益效果。",
      "stats": {
        "inCombatAtkFlat": 960,
        "critDmg": 40,
        "sharpCritDmg": 20
      }
    },
    {
      "id": "agent_1621_add",
      "category": "agent",
      "sourceName": "洛克茜",
      "subType": "额外能力",
      "title": "额外能力：辉金心脏",
      "desc": "队伍中存在<color=#FFFFFF>[强攻]</color>角色或<color=#FFFFFF>[命破]</color>角色或<color=#FFFFFF>[锋御]</color>角色时触发：\n洛克茜造成的伤害提升8%，该效果随角色等级提升，每级增加1.2%，最多提升80%；\n队伍中角色攻击命中敌人时，使其失衡易伤倍率提升30%，敌人进入失衡状态时，使其失衡时间延长2秒，失衡持续时间提升效果与同类效果不可叠加，失衡结束时移除该效果；\n敌人处于队伍中角色造成的<color=#FFFFFF>[风化]</color>状态下时，敌人受到的<color=#A6C5FD>风属性直接攻击伤害</color>和触发<color=#FFFFFF>[浸染]</color>属性的直接攻击伤害额外提升8%；\n进入战场时，自身回复40点能量，在勘域模式中此效果180秒内最多触发一次；\n全队角色施加的<color=#FFFFFF>[风化]</color>效果延长20秒；\n释放<color=#ffffff>[强化特殊技]</color>时，自身异常积蓄效率提升30%，持续50秒，重复触发时刷新持续时间。",
      "stats": {
        "dmgBonus": 88,
        "dazeVuln": 30
      }
    },
    {
      "id": "agent_1621_m1",
      "category": "agent",
      "sourceName": "洛克茜",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "全能执事",
      "desc": "<color=#ffffff>[强化特殊技：敬请安息]</color>命中时，使敌方全属性伤害抗性降低15%，持续50秒，重复触发时刷新持续时间；\n自身暴击伤害提升40%。",
      "stats": {
        "resShred": 15,
        "critDmg": 40
      }
    },
    {
      "id": "agent_1621_m2",
      "category": "agent",
      "sourceName": "洛克茜",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "下班神话",
      "desc": "<color=#ffffff>[强化特殊技：小心风寒]</color>造成的失衡值提升5%；\n每引爆1个<color=#ffffff>[风眼]</color>，获得一层<color=#ffffff>[流势]</color>效果，至多获得3层；\n在<color=#ffffff>[强化特殊技：小心风寒]</color>期间进入<color=#ffffff>[自旋]</color>状态下换人时，洛克茜将消耗所有<color=#ffffff>[流势]</color>，每消耗1层可以维持<color=#ffffff>[自旋]</color>状态0.2秒，期间不消耗能量，至多维持0.6秒；\n<color=#ffffff>[强化特殊技：小心风寒]</color>命中敌人时，使敌人失衡易伤倍率提升30%，持续到目标从失衡状态恢复。",
      "stats": {
        "dazeVuln": 30
      }
    },
    {
      "id": "agent_1621_m4",
      "category": "agent",
      "sourceName": "洛克茜",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "R.I.P.",
      "desc": "发动<color=#ffffff>[招架支援]</color>成功招架敌人攻击时，洛克茜回复1点能量，招式内至多回复1次；\n<color=#ffffff>[闪避反击：礼尚往来]</color>命中敌人时，回复2点能量，招式内至多回复1次；\n<color=#ffffff>[终结技：葬夜安魂曲]</color>造成的伤害提升20%，失衡值提升10%。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1621_m6",
      "category": "agent",
      "sourceName": "洛克茜",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "永远与自动发条人偶",
      "desc": "自身攻击造成的伤害无视目标15%<color=#A6C5FD>风属性伤害抗性</color>；\n<color=#ffffff>[特殊技：恕不远送]</color>引爆<color=#ffffff>[风眼]</color>生成巨型风旋时，主目标会被赋予<color=#ffffff>[余响]</color>效果，每间隔3秒在目标位置生成一次巨型风旋，共额外生成2次巨型风旋，重复触发时额外生成次数叠加且刷新<color=#ffffff>[余响]</color>的持续时间；\n巨型风旋造成的伤害倍率提升至原本的250%，造成的失衡提升20%。",
      "stats": {
        "resShred": 15
      }
    }
  ],
  "赛维里安": [
    {
      "id": "agent_1631_core",
      "category": "agent",
      "sourceName": "赛维里安",
      "subType": "核心被动",
      "title": "核心被动：风回无终",
      "desc": "赛维里安的暴击伤害提升<color=#2BAD00>60%</color>，造成的伤害提升<color=#2BAD00>25%</color>，若队伍中存在其他风属性角色则伤害额外提升<color=#2BAD00>30%</color>；\n赛维里安在即将受到敌人攻击的瞬间发动<color=#FFFFFF>[普通攻击：疾锋]</color>时，可以闪避本次攻击，若通过前三段普攻闪避了本次攻击则自动发动<color=#FFFFFF>[普通攻击：烈旋]</color>，若是第四段普攻则提升本次普攻的伤害倍率和失衡倍率至与<color=#FFFFFF>[普通攻击：烈旋]</color>一致；\n赛维里安进入战场时可获得两层[特定招式]，在勘域模式中此效果180秒内最多触发一次；\n赛维里安拥有<color=#FFFFFF>[烁影]</color>且不具有无敌效果时，若受到敌人非控制技攻击且未能主动闪避或招架此次攻击，赛维里安会消耗一层<color=#FFFFFF>[烁影]</color>自动闪避本次攻击并发动<color=#FFFFFF>[普通攻击：烈旋]</color>；\n赛维里安通过发动<color=#FFFFFF>[普通攻击：疾锋]</color>成功闪避敌人攻击，触发<color=#FFFFFF>[烁影]</color>自动闪避敌人攻击和直接闪避敌人攻击都视为<color=#FFFFFF>[极限闪避]</color>；\n<color=#FFFFFF>[烁影]</color>最多获取两层，若满层时再获取<color=#FFFFFF>[烁影]</color>，将获得一层[特定招式]效果且下次的<color=#FFFFFF>[普通攻击：疾锋]</color>会被提升为<color=#FFFFFF>[普通攻击：烈旋]</color>；\n赛维里安每次极限闪避都能获得一层<color=#FFFFFF>[凭风]</color>效果，当赛维里安拥有<color=#FFFFFF>[凭风]</color>效果且处于接战状态下点按  从后场切换至前场发动<color=#FFFFFF>[登场技]</color>；\n赛维里安通过固定招式命中敌人或触发极限闪避时，会获得[特定招式]，<color=#FFFFFF>[流息]</color>上限为150点；\n当<color=#FFFFFF>[流息]</color>达到100点时，长按  可以消耗100点<color=#FFFFFF>[流息]</color>发动<color=#FFFFFF>[普通攻击：苍风影猎]</color>。",
      "stats": {
        "critDmg": 60,
        "dmgBonus": 55
      }
    },
    {
      "id": "agent_1631_add",
      "category": "agent",
      "sourceName": "赛维里安",
      "subType": "额外能力",
      "title": "额外能力：最优编配",
      "desc": "队伍中存在<color=#FFFFFF>[支援]</color>、<color=#FFFFFF>[击破]</color>或与自身阵营相同的角色时触发：\n赛维里安每拥有1%暴击率，会使自身的攻击力提升8.5点，最多计入100%暴击率。",
      "stats": {
        "inCombatAtkFlat": 850
      }
    },
    {
      "id": "agent_1631_m1",
      "category": "agent",
      "sourceName": "赛维里安",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "双份浓缩",
      "desc": "赛维里安释放<color=#FFFFFF>[连携技]</color>累积的<color=#FFFFFF>[流息]</color>值提升至50点；\n赛维里安通过<color=#FFFFFF>[登场技：清场时刻]</color>入场时，会将招式替换为<color=#FFFFFF>[连携技]</color>，该招式入场类型不会被改变，且视为非重击，此效果60秒最多生效一次；\n赛维里安每次释放<color=#FFFFFF>[普通攻击：苍风影猎]</color>会获得1层<color=#FFFFFF>[凭风]</color>效果；\n赛维里安的攻击命中目标时无视目标15%的风属性抗性。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1631_m2",
      "category": "agent",
      "sourceName": "赛维里安",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "理性的缰绳",
      "desc": "赛维里安进入战场时回复150点<color=#FFFFFF>[流息]</color>，在勘域模式中此效果180秒内最多触发一次；\n赛维里安触发<color=#FFFFFF>[极限闪避]</color>时或释放<color=#FFFFFF>[普通攻击：苍风影猎]</color>时，使自身穿透率提升20%，持续25秒。",
      "stats": {
        "penRatio": 20
      }
    },
    {
      "id": "agent_1631_m4",
      "category": "agent",
      "sourceName": "赛维里安",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "光与影的界限",
      "desc": "赛维里安进入战斗或换入前场时使自身攻击力提升10%，持续30秒，重复触发时刷新持续时间；\n赛维里安释放<color=#FFFFFF>[普通攻击：烈旋]</color>或释放<color=#FFFFFF>[普通攻击：苍风影猎]</color>时，提升自身10%喧响值获取效率，持续15秒。",
      "stats": {
        "inCombatAtkPct": 10
      }
    },
    {
      "id": "agent_1631_m6",
      "category": "agent",
      "sourceName": "赛维里安",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "在一颗小星星下",
      "desc": "赛维里安的<color=#FFFFFF>[流息]</color>上限提升至180，进入战场时回复的流息提升至180点；\n<color=#FFFFFF>[普通攻击：苍风影猎]</color>最后一击额外伤害倍率固定提升350%；\n<color=#FFFFFF>[普通攻击：苍风影猎]</color>最后一击释放时获得<color=#FFFFFF>[风起]</color>效果：每秒积累5点<color=#FFFFFF>[流息]</color>，持续5秒，重复触发时刷新持续时间。",
      "stats": {}
    }
  ],
  "菲欧妮": [
    {
      "id": "agent_1641_core",
      "category": "agent",
      "sourceName": "菲欧妮",
      "subType": "核心被动",
      "title": "核心被动：涅槃",
      "desc": "菲欧妮的异常精通提升<color=#2BAD00>85</color>点；\n队伍中任意角色对敌人造成属性异常伤害时，会使其陷入[灼蚀]状态，持续20秒，重复触发刷新持续时间；[灼蚀]状态下的敌人受到属性异常伤害时有概率触发暴击，基础暴击率为30%，暴击伤害为<color=#2BAD00>25%</color>，若菲欧妮的初始异常掌控大于155点，每点超过的异常掌控会使得该效果的暴击率额外提升0.7%；\n当菲欧妮的初始异常掌控达到255点时，[灼蚀]状态下的敌人受到属性异常伤害的暴击率达到最大值；\n[灼蚀]状态下的敌人每8秒受到菲欧妮<color=#2BAD00>50%</color>攻击力的<color=#FF5521>火属性伤害</color>，该伤害视为[强化特殊技]伤害；\n[燃烧攻击]发动期间，抗打断等级提升，造成伤害时，会回复[燔焰]，菲欧妮最多拥有120点[燔焰]；\n[燃烧攻击]发动后，点按  可跳过[特殊技：掠火]以及[强化特殊技：燎斩]的后撤动作，直接衔接上挑攻击；\n菲欧妮受到致命伤害时不会战败退场，可触发[重明]效果，下一次普通换入、快速支援、招架支援换入前场时会回复50%最大生命值，在勘域模式中此效果1200秒内最多触发一次；\n菲欧妮触发完美格挡效果时，获得5点[燔焰]，10秒内最多触发一次；\n菲欧妮发动<color=#FFFFFF>[强化特殊技]</color>时，进入<color=#FFFFFF>[枯荣]</color>状态，持续20秒，<color=#FFFFFF>[燃烧攻击]</color>命中敌人或重复施加时刷新持续时间；\n<color=#FFFFFF>[枯荣]</color>状态下，发动<color=#FFFFFF>[强化特殊技：眩焰]</color>后，下次发动<color=#FFFFFF>[强化特殊技：眩焰]</color>会替换为发动<color=#FFFFFF>[强化特殊技：坠阳]</color>。",
      "stats": {
        "anomalyMastery": 85,
        "critRate": 0.7
      }
    },
    {
      "id": "agent_1641_add",
      "category": "agent",
      "sourceName": "菲欧妮",
      "subType": "额外能力",
      "title": "额外能力：黑枝王牌",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或同阵营角色时触发：\n[特定招式]状态下的敌人受到属性异常伤害的暴击伤害提升15%。",
      "stats": {
        "critDmg": 15
      }
    },
    {
      "id": "agent_1641_skill_1_2",
      "category": "agent",
      "sourceName": "菲欧妮",
      "subType": "特殊技",
      "title": "普通攻击：焚罪",
      "desc": "[特定招式]足够时，消耗90点[燔焰]，长按  发动：\n菲欧妮掷出武器，对前方范围的敌人造成大量<color=#FF5521>火属性伤害</color>；\n终结一击命中处于<color=#98EFF0>冰属性异常状态</color>、<color=#FE437E>以太异常状态</color>、<color=#2EB6FF>电属性异常状态</color>、<color=#FF5521>火属性异常状态</color>、<color=#F0D12B>物理属性异常状态</color>、<color=#A6C5FD>风属性异常状态</color>的敌人时，触发1次<color=#FFFFFF>[异放]</color>效果，结算<color=#2BAD00>445%</color>倍率的对应属性的属性异常伤害；\n该次<color=#FFFFFF>[异放]</color>效果触发暴击时，其暴击伤害额外提升40%；\n招式发动期间拥有无敌效果。",
      "stats": {
        "critDmg": 40
      }
    },
    {
      "id": "agent_1641_skill_1_3",
      "category": "agent",
      "sourceName": "菲欧妮",
      "subType": "特殊技",
      "title": "烬火追魂",
      "desc": "当菲欧妮处于[生竭]状态时，下一次普通换入、快速支援、招架支援换入前场时发动：\n周身环绕火焰，对周围敌人造成<color=#FF5521>火属性伤害</color>，视为[终结技]伤害，并退出[生竭]状态，回复<color=#FFFFFF>[终结技：万死重明]</color>消耗的所有生命值，并额外回复自身10%生命值上限的生命值；\n终结一击命中处于<color=#98EFF0>冰属性异常状态</color>、<color=#FE437E>以太异常状态</color>、<color=#2EB6FF>电属性异常状态</color>、<color=#FF5521>火属性异常状态</color>、<color=#F0D12B>物理属性异常状态</color>、<color=#A6C5FD>风属性异常状态</color>的敌人时，触发1次<color=#FFFFFF>[异放]</color>效果，结算<color=#2BAD00>597%</color>倍率的对应属性的属性异常伤害；\n该次<color=#FFFFFF>[异放]</color>效果触发暴击时，其暴击伤害额外提升40%；\n当处于[生竭]状态的菲欧妮通过<color=#FFFFFF>[连携技：绝处逢生]</color>、<color=#FFFFFF>[终结技：万死重明]</color>入场时，也会触发上述生命值回复与<color=#FFFFFF>[异放]</color>效果；\n招式发动期间拥有无敌效果，点按  可衔接第三段[普通攻击]。",
      "stats": {
        "critDmg": 40
      }
    },
    {
      "id": "agent_1641_m1",
      "category": "agent",
      "sourceName": "菲欧妮",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "痛觉残留与刺激游行",
      "desc": "进入战场时，菲欧妮获得1点<color=#FFFFFF>[升变]</color>，在勘域模式中此效果180秒内最多触发一次；\n<color=#FFFFFF>[灼蚀]</color>状态下的敌人受到属性异常伤害的暴击伤害额外提升25%；\n<color=#FFFFFF>[燃烧攻击]</color>造成伤害时，<color=#FFFFFF>[燔焰]</color>的获取效率提升15%。",
      "stats": {
        "critDmg": 25
      }
    },
    {
      "id": "agent_1641_m2",
      "category": "agent",
      "sourceName": "菲欧妮",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "好奇心害不死猫",
      "desc": "菲欧妮对敌人施加<color=#FF5521>[灼烧]</color>效果时，该效果的持续时间提升2秒；\n菲欧妮对<color=#FFFFFF>[灼蚀]</color>状态下的敌人造成的伤害提升30%。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1641_m4",
      "category": "agent",
      "sourceName": "菲欧妮",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "生命尽头与冷酷仙境",
      "desc": "<color=#FFFFFF>[烬火追魂]</color>以及<color=#FFFFFF>[普通攻击：焚罪]</color>终结一击命中处于异常状态的敌人时，\n额外触发一次<color=#FFFFFF>[异放]</color>效果，固定结算600%倍率的对应属性的属性异常伤害。",
      "stats": {}
    },
    {
      "id": "agent_1641_m6",
      "category": "agent",
      "sourceName": "菲欧妮",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "禁闭室手记",
      "desc": "菲欧妮无视目标15%全属性伤害抗性；\n菲欧妮发动<color=#FFFFFF>[强化特殊技：眩焰]</color>时，获得1点<color=#FFFFFF>[升变]</color>；\n菲欧妮触发的<color=#FFFFFF>[异放]</color>效果无视敌人40%防御力。",
      "stats": {
        "resShred": 15,
        "defShred": 40
      }
    }
  ],
  "卡芙卡": [
    {
      "id": "agent_1651_core",
      "category": "agent",
      "sourceName": "卡芙卡",
      "subType": "核心被动",
      "title": "核心被动：终焉奏鸣",
      "desc": "卡芙卡的异常精通提升<color=#2BAD00>84</color>点，发动[强化特殊技：暮夜猎曲·宣叙]或[强化特殊技：暮夜猎曲·咏叹]时，回复15点<color=#FFFFFF>[即兴宣奏]</color>，上限为120点；\n处于属性异常状态下的敌人发动攻击时，将触发1次<color=#FFFFFF>[掣电]</color>，造成原本<color=#FFFFFF>[紊乱]</color>效果3%的伤害，并额外附加卡芙卡<color=#2BAD00>460%</color>异常精通的伤害，每名敌人10秒内最多触发1次；<color=#FFFFFF>[掣电]</color>造成的伤害均视为<color=#FFFFFF>[紊乱]</color>伤害，最多弹射3次；\n全队角色造成[紊乱]伤害时，若目标未处于失衡状态，此次[紊乱]伤害额外计算<color=#2BAD00>40%</color>的特殊失衡易伤倍率加成。",
      "stats": {
        "anomalyMastery": 84,
        "dazeVuln": 40
      }
    },
    {
      "id": "agent_1651_add",
      "category": "agent",
      "sourceName": "卡芙卡",
      "subType": "额外能力",
      "title": "额外能力：宽恕无关慈悲",
      "desc": "队伍中存在<color=#FFFFFF>[支援]</color>角色或其他<color=#FFFFFF>[异常]</color>角色时触发：\n卡芙卡对敌人施加<color=#2EB6FF>[感电]</color>效果时，该效果的持续时间提升3秒；[普通攻击：失序回响]可延长<color=#2EB6FF>电属性异常状态</color>持续时间上限增加至13秒；\n进入战斗时或队伍中其他角色对敌人施加属性异常效果时，若卡芙卡初始能量自动回复大于1.2点，超过部分每超过0.12点，自身异常掌控提升10点，最多提升140点，持续30秒。",
      "stats": {}
    },
    {
      "id": "agent_1651_m1",
      "category": "agent",
      "sourceName": "卡芙卡",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "绮梦华服的狂想",
      "desc": "全队造成的<color=#FFFFFF>[紊乱]</color>伤害提升25%；卡芙卡<color=#FFFFFF>[掣电]</color>造成的伤害无视目标10%的全属性伤害抗性；卡芙卡发动<color=#FFFFFF>[终结技]</color>时，回复10点能量。",
      "stats": {
        "dmgBonus": 25,
        "resShred": 10
      }
    },
    {
      "id": "agent_1651_m2",
      "category": "agent",
      "sourceName": "卡芙卡",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "雾霭深处的梦魇",
      "desc": "<color=#FFFFFF>[狩猎序曲]</color>期间，卡芙卡的异常精通提升35点，自身造成的伤害提升25%，退出<color=#FFFFFF>[狩猎序曲]</color>后，该效果继续生效20秒。",
      "stats": {
        "anomalyMastery": 35,
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1651_m4",
      "category": "agent",
      "sourceName": "卡芙卡",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "月影之下的狩猎",
      "desc": "全队角色<color=#FFFFFF>[连携技]</color>重击命中同时处于属性异常和失衡状态下的敌人时，会对敌人触发<color=#FFFFFF>[掣电]</color>，对目标造成原本<color=#FFFFFF>[紊乱]</color>效果60%的伤害，敌人在同一失衡期间仅能触发一次该效果。",
      "stats": {}
    },
    {
      "id": "agent_1651_m6",
      "category": "agent",
      "sourceName": "卡芙卡",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "命运交叉的城堡",
      "desc": "同一次<color=#FFFFFF>[狩猎序曲]</color>期间，最多可以连续发动6次<color=#FFFFFF>[强化特殊技]</color>；<color=#FFFFFF>[强化特殊技：暮夜猎曲·宣叙]</color>及其触发<color=#FFFFFF>[掣电]</color>的伤害无视目标12%的防御力；卡芙卡发动<color=#FFFFFF>[终结技]</color>后，接下来发动的6次<color=#FFFFFF>[强化特殊技]</color>的能量消耗降低至原本的50%，其中<color=#FFFFFF>[强化特殊技：暮夜猎曲·宣叙]</color>的异常积蓄效率额外提升40%。",
      "stats": {
        "defShred": 12
      }
    }
  ],
  "知更鸟": [
    {
      "id": "agent_1661_core",
      "category": "agent",
      "sourceName": "知更鸟",
      "subType": "核心被动",
      "title": "核心被动：复调共鸣",
      "desc": "知更鸟发动部分招式时，会为全队角色提供基于知更鸟初始最大生命值不同数额的护盾<color=#FFFFFF>[和鸣护盾]</color>，持续15秒，重复获得时累积盾量并延长持续时间（最多60秒，盾量不超过初始最大生命值的12%）；\n全队角色每次获得<color=#FFFFFF>[和鸣护盾]</color>时进入<color=#FFFFFF>[激昂咏叹]</color>状态，造成的伤害提升<color=#2BAD00>20%</color>，持续20秒，重复触发刷新持续时间；\n发动<color=#FFFFFF>[特殊技：万籁与我同歌]</color>后会触发快速支援，若在招式期间将其他角色换入前场，知更鸟进入<color=#FFFFFF>[幕后协奏]</color>状态（持续80秒），并使全队角色获得<color=#FFFFFF>[守护咏叹]</color>效果；<color=#FFFFFF>[幕后协奏]</color>状态下知更鸟发动追加攻击获得<color=#FFFFFF>[星耀值]</color>（上限160点，满120点可普通换入发动<color=#FFFFFF>[登场技：星耀时刻]</color>）；\n发动<color=#FFFFFF>[登场技：星耀时刻]</color>、<color=#FFFFFF>[终结技：星辰协奏曲]</color>、<color=#FFFFFF>[连携技：强音重拍]</color>、<color=#FFFFFF>[支援突击：闪耀应援]</color>后触发快速支援，招式发动后，若将知更鸟切换为非当前操作角色，知更鸟自动留场释放<color=#FFFFFF>[特殊技：万籁与我同歌]</color>；\n全队角色每触发一次毁伤，知更鸟固定回复15点能量。",
      "stats": {
        "dmgBonus": 20
      }
    },
    {
      "id": "agent_1661_guard",
      "category": "agent",
      "sourceName": "知更鸟",
      "subType": "特殊技",
      "title": "特殊技：守护咏叹（重音节拍强化）",
      "desc": "知更鸟处于<color=#FFFFFF>[幕后协奏]</color>状态时，全队角色获得<color=#FFFFFF>[守护咏叹]</color>：基于知更鸟初始最大生命值提升全队防御力（Lv.12最高提升800点）；进入<color=#FFFFFF>[幕后协奏]</color>时若消耗1点<color=#FFFFFF>[重音节拍]</color>，提供的防御力提升效果及其上限额外提升25%（最高提升<color=#2BAD00>1000</color>点固定防御力）。",
      "stats": {
        "inCombatDefFlat": 1000
      }
    },
    {
      "id": "agent_1661_add",
      "category": "agent",
      "sourceName": "知更鸟",
      "subType": "额外能力",
      "title": "额外能力：重音共振",
      "desc": "队伍中存在<color=#FFFFFF>[锋御]</color>或<color=#FFFFFF>[击破]</color>角色时触发：\n进入战场时，获得3000点喧响值，在勘域模式中此效果600秒内最多触发一次；\n全队<color=#FFFFFF>[击破]</color>角色攻击力提升80点，该效果随知更鸟等级提升，每级增加12点，最多提升800点。",
      "stats": {
        "inCombatAtkFlat": 800
      }
    },
    {
      "id": "agent_1661_m1",
      "category": "agent",
      "sourceName": "知更鸟",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "生活宛如一支歌",
      "desc": "知更鸟发动<color=#FFFFFF>[登场技：星耀时刻]</color>或进入战场时获得2层<color=#FFFFFF>[协律庇佑]</color>（上限2层）；提供<color=#FFFFFF>[和鸣护盾]</color>时若拥有<color=#FFFFFF>[协律庇佑]</color>，消耗1层为全队提供可抵挡一次超额伤害的特殊<color=#FFFFFF>[和鸣护盾]</color>；\n每次消耗<color=#FFFFFF>[重音节拍]</color>时，全队角色造成的伤害无视目标<color=#2BAD00>20%</color>防御力，持续80秒，重复触发刷新持续时间。",
      "stats": {
        "defShred": 20
      }
    },
    {
      "id": "agent_1661_m2",
      "category": "agent",
      "sourceName": "知更鸟",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "天赋与努力",
      "desc": "知更鸟发动<color=#FFFFFF>[追加攻击]</color>时，全队角色造成的伤害无视敌人15%全属性伤害抗性，持续20秒，重复触发刷新持续时间。",
      "stats": {
        "resShred": 15
      }
    },
    {
      "id": "agent_1661_m4",
      "category": "agent",
      "sourceName": "知更鸟",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "台前与幕后",
      "desc": "知更鸟自身造成的伤害提升10%；发动<color=#FFFFFF>[特殊技：弦歌相和]</color>时，若未触发招式升级，则将其升级为不消耗能量的<color=#FFFFFF>[强化特殊技：震律齐鸣]</color>，该效果60秒内最多触发一次。",
      "stats": {
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1661_m6",
      "category": "agent",
      "sourceName": "知更鸟",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "天空是鸟儿的归宿",
      "desc": "<color=#FFFFFF>[强化特殊技：震律齐鸣]</color>必定触发暴击，且根据最大生命值额外提升重击伤害的效果提升为原本的200%；\n全队拥有<color=#FFFFFF>[守护咏叹]</color>效果的角色造成的锐化伤害提升15%。",
      "stats": {
        "dmgBonus": 15
      }
    }
  ],
  "悠真Ⅵ": [
    {
      "id": "agent_1201_core",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "核心被动",
      "title": "核心被动：破晓",
      "desc": "<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>、[逐雷]和[终结技]的暴击率提升<color=#2BAD00>25%</color>，悠真的<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>/<color=#FFFFFF>[终结技]</color>命中敌人并触发暴击时，将获得1/6层<color=#FFFFFF>[锋芒]</color>，[冲刺攻击：飞弦·斩]在同一招式内最多获得3层，<color=#FFFFFF>[锋芒]</color>最多叠加6层，持续5秒，重复触发时刷新持续时间；每层<color=#FFFFFF>[锋芒]</color>会使<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>、[逐雷]和[终结技]造成的暴击伤害提升<color=#2BAD00>12%</color>。",
      "stats": {
        "critRate": 150,
        "critDmg": 12
      }
    },
    {
      "id": "agent_1201_add",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "额外能力",
      "title": "额外能力：超频",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>角色或<color=#FFFFFF>[异常]</color>角色时触发：\n悠真攻击命中处于失衡状态或属性异常状态下的敌人时，自身造成的伤害提升40%；悠真发射<color=#FFFFFF>[落羽]</color>命中处于失衡状态或属性异常状态下的敌人时，会为其施加2层<color=#FFFFFF>[电囚]</color>效果。",
      "stats": {
        "dmgBonus": 40
      }
    },
    {
      "id": "agent_1201_m1",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "「意气风发」",
      "desc": "<color=#FFFFFF>[普通攻击：甲乙矢]</color>中，<color=#FFFFFF>[电囚]</color>效果的叠加层数上限提升至14层；\n<color=#FFFFFF>[电壶]</color>被激活时，将会向目标连续发射2支<color=#FFFFFF>[甲乙矢]</color>。",
      "stats": {}
    },
    {
      "id": "agent_1201_m2",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "挥霍",
      "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，悠真获得7层<color=#FFFFFF>[电掣]</color>，最多叠加7层；\n拥有<color=#FFFFFF>[电掣]</color>时，<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>造成的伤害提升50%；\n<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>结束后，消耗1层<color=#FFFFFF>[电掣]</color>。",
      "stats": {
        "dmgBonus": 50
      }
    },
    {
      "id": "agent_1201_m4",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "偶有充盈",
      "desc": "<color=#FFFFFF>[电囚]</color>效果的持续时间提升至20秒；\n<color=#FFFFFF>[冲刺攻击：飞弦·斩]</color>命中敌人时，悠真获得30点喧响值，同一招式内最多触发一次；\n发动<color=#FFFFFF>[终结技]</color>时，将为场上所有敌人施加满层<color=#FFFFFF>[电囚]</color>效果。",
      "stats": {}
    },
    {
      "id": "agent_1201_m6",
      "category": "agent",
      "sourceName": "悠真",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "会心",
      "desc": "<color=#FFFFFF>[甲乙矢]</color>命中处于失衡状态或属性异常状态下的敌人后，\n悠真将无视其15%<color=#2EB6FF>电属性伤害抗性</color>，持续12秒；\n<color=#FFFFFF>[甲乙矢]</color>每命中同一名敌人12次，\n将额外触发1次电磁爆炸，对目标造成悠真1500%攻击力的<color=#2EB6FF>电属性伤害</color>。",
      "stats": {}
    }
  ],
  "11号Ⅵ": [
    {
      "id": "agent_1041_core",
      "category": "agent",
      "sourceName": "11号",
      "subType": "核心被动",
      "title": "核心被动：热浪",
      "desc": "「11号」在<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>中触发<color=#FFFFFF>[火力镇压]</color>时，招式造成的伤害提升<color=#2BAD00>70%</color>。",
      "stats": {
        "dmgBonus": 70
      }
    },
    {
      "id": "agent_1041_add",
      "category": "agent",
      "sourceName": "11号",
      "subType": "额外能力",
      "title": "额外能力：燎原",
      "desc": "队伍中存在与自身属性或阵营相同的角色时触发：\n「11号」造成的<color=#FF5521>火属性伤害</color>提升10%，攻击处于失衡状态下的敌人时，该增益效果额外提升22.5%。",
      "stats": {
        "dmgBonus": 10
      }
    },
    {
      "id": "agent_1041_m1",
      "category": "agent",
      "sourceName": "11号",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "快速升温",
      "desc": "成为接战状态下的当前操作角色时，若「11号」的能量不足40点，\n则立即回复至80点，50秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1041_m2",
      "category": "agent",
      "sourceName": "11号",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "高温汇聚",
      "desc": "触发<color=#FFFFFF>[火力镇压]</color>时，<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>、<color=#FFFFFF>[闪避反击]</color>造成的伤害提升3%，\n最多叠加12层，持续15秒，每层效果单独结算持续时间。",
      "stats": {
        "dmgBonus": 3
      }
    },
    {
      "id": "agent_1041_m4",
      "category": "agent",
      "sourceName": "11号",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "纵情燃烧",
      "desc": "<color=#FFFFFF>[普通攻击]</color>第一、二、三段或<color=#FFFFFF>[冲刺攻击]</color>发动时，若触发<color=#FFFFFF>[火力镇压]</color>，\n则在招式发动期间抗打断等级提升，受到的伤害降低18%；\n<color=#FFFFFF>[普通攻击]</color>第四段发动时，若触发<color=#FFFFFF>[火力镇压]</color>，\n则在招式发动期间获得无敌效果。",
      "stats": {}
    },
    {
      "id": "agent_1041_m6",
      "category": "agent",
      "sourceName": "11号",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "炽热心流",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，「11号」获得8层充能（上限8层）；\n触发<color=#FFFFFF>[火力镇压]</color>时，消耗1层充能，使当前招式无视目标25%<color=#FF5521>火属性伤害抗性</color>。",
      "stats": {
        "resShred": 25
      }
    }
  ],
  "零号安比Ⅵ": [
    {
      "id": "agent_1381_core",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "核心被动",
      "title": "核心被动：电位差",
      "desc": "零号·安比对拥有<color=#FFFFFF>[银星]</color>标记的敌人造成的伤害提升<color=#2BAD00>25%</color>；敌方单位被施加<color=#FFFFFF>[银星]</color>标记后，受到的<color=#FFFFFF>[追加攻击]</color>暴击伤害额外提升，提升效果等同于零号·安比暴击伤害的<color=#2BAD00>30%</color>；[银星]标记期间，受到来自队友的<color=#FFFFFF>[追加攻击]</color>伤害会为敌方单位累积<color=#FFFFFF>[银星]</color>充能，该效果5秒内最多触发一次；\n[银星]的[追加攻击]暴击伤害提升效果，额外提升零号·安比暴击伤害的5%；拥有<color=#FFFFFF>[白雷]</color>的敌方目标被击败时，会对最近的敌方目标发动<color=#FFFFFF>[特殊技：雷殛]</color>。",
      "stats": {
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1381_add",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "额外能力",
      "title": "额外能力：电极化",
      "desc": "队伍中存在<color=#FFFFFF>[击破]</color>或<color=#FFFFFF>[支援]</color>角色时触发：\n零号·安比的暴击率提升10%；当前操作中的角色为零号·安比时，全队角色<color=#FFFFFF>[追加攻击]</color>对拥有<color=#FFFFFF>[银星]</color>标记的敌人造成的伤害提升25%；\n零号·安比的<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>视为<color=#FFFFFF>[追加攻击]</color>伤害。",
      "stats": {
        "critRate": 10,
        "dmgBonus": 25
      }
    },
    {
      "id": "agent_1381_m1",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "静滞电荷",
      "desc": "零号·安比发动<color=#FFFFFF>[强化特殊技]</color>命中敌人时，将会连续触发3次<color=#FFFFFF>[白雷]</color>的额外伤害，该效果不会消耗<color=#FFFFFF>[白雷]</color>层数。",
      "stats": {}
    },
    {
      "id": "agent_1381_m2",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "冗余协议",
      "desc": "零号·安比的暴击率提升12%；\n发动<color=#FFFFFF>[终结技]</color>时，零号·安比会获得6层<color=#FFFFFF>[电鸣]</color>（上限6层）；\n拥有<color=#FFFFFF>[电鸣]</color>后，零号·安比<color=#FFFFFF>[特殊技：苍光]</color>命中拥有<color=#FFFFFF>[白雷]</color>的敌人时，\n将改为消耗1层<color=#FFFFFF>[电鸣]</color>作为代替，同一招式命中多名敌人时最多消耗1层<color=#FFFFFF>[电鸣]</color>，\n消耗<color=#FFFFFF>[电鸣]</color>时仍会触发<color=#FFFFFF>[白雷]</color>的额外伤害。\n激发潜能后，每消耗3层<color=#FFFFFF>[电鸣]</color>，下次发动[特殊技：苍光·临界]时速度加快。",
      "stats": {
        "critRate": 12
      }
    },
    {
      "id": "agent_1381_m4",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "银白残响",
      "desc": "攻击命中拥有<color=#FFFFFF>[银星]</color>标记的敌人时，零号·安比无视目标12%<color=#2EB6FF>电属性伤害抗性</color>。",
      "stats": {
        "resShred": 12
      }
    },
    {
      "id": "agent_1381_m6",
      "category": "agent",
      "sourceName": "零号安比",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "前传主角",
      "desc": "触发6次<color=#FFFFFF>[白雷]</color>的额外伤害时，将会引发电磁涡流，\n对目标及其周围的敌人造成零号·安比1000%攻击力的<color=#2EB6FF>电属性伤害</color>，\n该伤害被视为<color=#FFFFFF>[追加攻击]</color>伤害。",
      "stats": {}
    }
  ],
  "艾莲·乔Ⅵ": [
    {
      "id": "agent_1191_core",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "核心被动",
      "title": "核心被动：凌牙厉齿",
      "desc": "艾莲在<color=#FFFFFF>[冲刺攻击：冰渊潜袭]</color>中发动蓄力剪击，或消耗<color=#FFFFFF>[急冻充能]</color>发动<color=#FFFFFF>[普通攻击：急冻修剪法]</color>时，招式的暴击伤害提升<color=#2BAD00>100%</color>；\n上述效果对<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>、<color=#FFFFFF>[普通攻击：霜锋]</color>和<color=#FFFFFF>[普通攻击：冰刃浪]</color>同样生效。",
      "stats": {
        "critDmg": 100
      }
    },
    {
      "id": "agent_1191_add",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "额外能力",
      "title": "额外能力：风暴潮",
      "desc": "队伍中存在与自身属性或阵营相同的角色或<color=#FFFFFF>[击破]</color>角色时触发：\n艾莲造成<color=#98EFF0>冰属性伤害</color>时，后继<color=#98EFF0>冰属性伤害</color>提升3%，持续10秒，最多叠加10层，重复触发时刷新持续时间。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1191_m1",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "凛冬前兆",
      "desc": "在<color=#FFFFFF>[冲刺攻击：冰渊潜袭]</color>中发动快速剪击命中敌人时，获得的<color=#FFFFFF>[急冻充能]</color>提升至3点；\n在<color=#FFFFFF>[冲刺攻击：冰渊潜袭]</color>中发动蓄力剪击命中敌人时，获得的<color=#FFFFFF>[急冻充能]</color>提升至6点；\n每消耗1点<color=#FFFFFF>[急冻充能]</color>，艾莲的暴击率提升2%，持续15秒，\n最多叠加6层，每层效果单独结算持续时间。",
      "stats": {
        "critRate": 2
      }
    },
    {
      "id": "agent_1191_m2",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "冰洋掠食者",
      "desc": "发动第三段<color=#FFFFFF>[普通攻击：急冻修剪法]</color>后，可以直接衔接发动<color=#FFFFFF>[强化特殊技：鲨卷风]</color>；\n发动<color=#FFFFFF>[强化特殊技]</color>时，每拥有1点<color=#FFFFFF>[急冻充能]</color>，\n当前招式造成的暴击伤害提升20%，最多提升60%。",
      "stats": {
        "critDmg": 60
      }
    },
    {
      "id": "agent_1191_m4",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "无休寒潮",
      "desc": "队伍中任意角色对敌人施加<color=#98EFF0>[冻结]</color>效果或使敌人失衡时，\n自身获得6点<color=#FFFFFF>[急冻充能]</color>和<color=#FFFFFF>[快蓄]</color>效果，并回复4点能量，能量回复效果10秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1191_m6",
      "category": "agent",
      "sourceName": "艾莲",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "盛宴时分",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或获得<color=#FFFFFF>[快蓄]</color>时，\n艾莲的穿透率提升20%，持续6秒，同时获得1层<color=#FFFFFF>[盛宴]</color>，<color=#FFFFFF>[盛宴]</color>最多叠加3层；\n拥有3层<color=#FFFFFF>[盛宴]</color>后，在<color=#FFFFFF>[冲刺攻击：冰渊潜袭]</color>中发动蓄力剪击命中敌人时，\n消耗所有<color=#FFFFFF>[盛宴]</color>，使当前招式造成的伤害提升250%。",
      "stats": {
        "penRatio": 60,
        "dmgBonus": 250
      }
    }
  ],
  "格莉丝Ⅵ": [
    {
      "id": "agent_1181_core",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "核心被动",
      "title": "核心被动：预驱动撞针",
      "desc": "格莉丝<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中敌人并造成<color=#F0D12B>物理伤害</color>时，获得一层<color=#FFFFFF>[电能]</color>（上限8层）；<color=#FFFFFF>[电能]</color>层数到达上限后，发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，会消耗所有<color=#FFFFFF>[电能]</color>，使招式累积的<color=#2EB6FF>电属性异常积蓄值</color>提升<color=#2BAD00>130%</color>。",
      "stats": {}
    },
    {
      "id": "agent_1181_add",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "额外能力",
      "title": "额外能力：技术支持班组",
      "desc": "队伍中存在与自身属性或阵营相同的角色或其他<color=#FFFFFF>[异常]</color>角色时触发：\n格莉丝<color=#FFFFFF>[强化特殊技]</color>命中敌人时，目标下次被施加<color=#2EB6FF>[感电]</color>效果时，受到的<color=#2EB6FF>[感电]</color>伤害提升18%，最多叠加2层，同一招式内每个敌人最多触发一次效果，<color=#2EB6FF>[感电]</color>状态结束时效果重置。",
      "stats": {
        "dmgBonus": 36
      }
    },
    {
      "id": "agent_1181_m1",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "再充能弹膛",
      "desc": "<color=#FFFFFF>[普通攻击]</color>第四段每次命中敌人时，全队角色回复0.25点能量；\n同一招式内，该效果最多为全队回复2点能量。",
      "stats": {}
    },
    {
      "id": "agent_1181_m2",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "电致击穿",
      "desc": "在<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>等招式中投掷手雷命中敌人时，\n目标的<color=#2EB6FF>电属性伤害抗性</color>降低8.5%，<color=#2EB6FF>电属性异常积蓄抗性</color>降低8.5%，持续8秒。",
      "stats": {
        "resShred": 17
      }
    },
    {
      "id": "agent_1181_m4",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "爆破电容",
      "desc": "发动<color=#FFFFFF>[强化特殊技]</color>时，格莉丝获得6层充能（上限6层）；\n<color=#FFFFFF>[普通攻击：高压射钉]</color>或<color=#FFFFFF>[冲刺攻击：突击检查]</color>命中敌人时，消耗1层充能，使当前招式的能量获得效率提升20%。",
      "stats": {}
    },
    {
      "id": "agent_1181_m6",
      "category": "agent",
      "sourceName": "格莉丝",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "起爆扳机",
      "desc": "消耗所有<color=#FFFFFF>[电能]</color>发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，能够强化招式效果，\n额外投掷一颗手雷，并使每颗手雷造成的伤害提升至原本的200%。",
      "stats": {}
    }
  ],
  "柏妮思Ⅵ": [
    {
      "id": "agent_1171_core",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "核心被动",
      "title": "核心被动：燃油特调",
      "desc": "柏妮思消耗能量值时，会为自身累积<color=#FFFFFF>[燃点]</color>，最多累积100点；每消耗1点能量值，能够累积1.4点<color=#FFFFFF>[燃点]</color>，当<color=#FFFFFF>[燃点]</color>累积至50点时，柏妮思将进入<color=#FFFFFF>[燃油特调]</color>状态，直到<color=#FFFFFF>[燃点]</color>耗尽；进入战场时，柏妮思立刻累积100点<color=#FFFFFF>[燃点]</color>；\n<color=#FFFFFF>[燃油特调]</color>状态下，柏妮思的<color=#FFFFFF>[普通攻击：炽焰搅拌式]</color>、<color=#FFFFFF>[强化特殊技：灼热摇荡法]</color>、<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>、<color=#FFFFFF>[连携技：燃油熔焰]</color>或<color=#FFFFFF>[终结技：纵享盛焰]</color>命中敌人时，将对目标施加<color=#FFFFFF>[灼伤]</color>效果，直到柏妮思退出<color=#FFFFFF>[燃油特调]</color>状态；队伍中其他角色攻击命中处于<color=#FFFFFF>[灼伤]</color>状态下的敌人时，会触发<color=#FFFFFF>[余烬]</color>效果，消耗8点<color=#FFFFFF>[燃点]</color>，对目标造成等同于柏妮思<color=#2BAD00>350%</color>攻击力的<color=#FF5521>火属性伤害</color>并累积<color=#FF5521>火属性异常积蓄值</color>，1.5秒内最多触发一次；每拥有10点异常精通，<color=#FFFFFF>[余烬]</color>效果造成的伤害提升1%，最多提升30%；<color=#FFFFFF>[余烬]</color>效果造成的伤害被视为<color=#FFFFFF>[支援攻击]</color>伤害。",
      "stats": {
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1171_add",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "额外能力",
      "title": "额外能力：星火燎原",
      "desc": "队伍中存在其他<color=#FFFFFF>[异常]</color>角色或与自身阵营相同的角色时触发：\n柏妮思<color=#FFFFFF>[普通攻击：炽焰搅拌式]</color>、<color=#FFFFFF>[强化特殊技：灼热摇荡法]</color>、<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>命中敌人，或触发<color=#FFFFFF>[余烬]</color>效果时，招式累积的<color=#FF5521>火属性异常积蓄值</color>提升65%；队伍中任意角色对敌人施加<color=#FF5521>[灼烧]</color>效果时，该效果的持续时间提升3秒。",
      "stats": {}
    },
    {
      "id": "agent_1171_m1",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "热络同心",
      "desc": "<color=#FFFFFF>[燃点]</color>的上限从100点提升至140点，进入战场时，柏妮思额外累积40点<color=#FFFFFF>[燃点]</color>；\n<color=#FFFFFF>[余烬]</color>效果的伤害倍率提升，提升效果等同于柏妮思攻击力的100%；\n<color=#FFFFFF>[余烬]</color>效果累积的<color=#FF5521>火属性异常积蓄值</color>提升25%。",
      "stats": {}
    },
    {
      "id": "agent_1171_m2",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "加量不加价",
      "desc": "触发<color=#FFFFFF>[余烬]</color>效果时，将对敌人施加<color=#FFFFFF>[热意洞穿]</color>，\n最多叠加5层，持续6秒，重复触发时刷新持续时间；\n受到我方攻击时，目标每拥有一层<color=#FFFFFF>[热意洞穿]</color>，本次攻击的穿透率提升4%，最多提升20%。",
      "stats": {
        "penRatio": 20
      }
    },
    {
      "id": "agent_1171_m4",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "超绝燃油补给",
      "desc": "<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，招式的暴击率提升30%；\n<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>中，火焰喷射的持续时间上限提升1秒。",
      "stats": {
        "critRate": 30
      }
    },
    {
      "id": "agent_1171_m6",
      "category": "agent",
      "sourceName": "柏妮思",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "盛焰邀约",
      "desc": "柏妮思的<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>命中敌人时，将额外触发特殊的<color=#FFFFFF>[余烬]</color>效果，\n对目标造成等同于柏妮思60%攻击力的<color=#FF5521>火属性伤害</color>，0.5秒内最多触发1次，无需消耗<color=#FFFFFF>[燃点]</color>；\n发动<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>命中敌人后，招式发动期间，\n<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>、特殊的<color=#FFFFFF>[余烬]</color>效果、<color=#FF5521>[灼烧]</color>伤害\n将无视目标25%<color=#FF5521>火属性伤害抗性</color>；\n在<color=#FFFFFF>[强化特殊技：灼热摇荡法·双份]</color>中发动火焰冲击命中处于<color=#FF5521>[灼烧]</color>状态下的敌人时，\n能够额外结算一次<color=#FF5521>[灼烧]</color>伤害，伤害效果等同于原本的1800%，同一目标20秒内最多触发一次。",
      "stats": {
        "resShred": 25
      }
    }
  ],
  "莱卡恩Ⅵ": [
    {
      "id": "agent_1141_core",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "核心被动",
      "title": "核心被动：金属狼足",
      "desc": "莱卡恩在<color=#FFFFFF>[普通攻击]</color>中完成蓄力或发动<color=#FFFFFF>[闪避反击]</color>、<color=#FFFFFF>[冲刺攻击]</color>时，招式造成的失衡值提升<color=#2BAD00>80%</color>；\n<color=#FFFFFF>[强化特殊技：狂猎时刻]</color>、<color=#FFFFFF>[支援突击：复仇反扑]</color>或<color=#FFFFFF>[支援突击：复仇反扑·冰舞]</color>命中敌人时，目标的<color=#98EFF0>冰属性伤害抗性</color>降低25%，受到的其他属性伤害提升<color=#FFFFFF>30%</color>，持续30秒。\n进入战场时，莱卡恩会获得一次进入<color=#FFFFFF>[围猎]</color>状态的次数。\n<color=#FFFFFF>[围猎]</color>状态有可用次数时，<color=#FFFFFF>[支援突击：复仇反扑·冰舞]</color>命中敌人时将触发队伍中上一位角色的<color=#FFFFFF>[快速支援]</color>，招式持续期间，队伍中其他角色通过<color=#FFFFFF>[快速支援]</color>入场时，莱卡恩会进入<color=#FFFFFF>[围猎]</color>状态，持续8秒。\n当精英或首领级敌人进入失衡状态时获取一次进入<color=#FFFFFF>[围猎]</color>状态次数。<color=#FFFFFF>[围猎]</color>状态次数最多保存一次。\n<color=#FFFFFF>[围猎]</color>状态结束时，莱卡恩会自动发动<color=#FFFFFF>[支援突击：复仇反扑·冰舞]</color>，若<color=#FFFFFF>[围猎]</color>状态提前结束，每剩余1秒时长便会使下一次<color=#FFFFFF>[支援突击：复仇反扑·冰舞]</color>造成的失衡值提升<color=#FFFFFF>6%</color>。\n当前操作中角色停止进攻或发动<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>时，莱卡恩会提前结束<color=#FFFFFF>[围猎]</color>状态。\n莱卡恩主动发动<color=#FFFFFF>[支援突击：复仇反扑·冰舞]</color>时，也会提前结束<color=#FFFFFF>[围猎]</color>状态，但不会自动发动<color=#FFFFFF>[支援突击：复仇反扑·冰舞]</color>。\n<color=#FFFFFF>[围猎]</color>状态持续期间，莱卡恩会根据当前操作中角色发动的招式，分别相应发动<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[闪避]</color>、<color=#FFFFFF>[冲刺攻击]</color>和<color=#FFFFFF>[闪避反击]</color>。\n当操作中角色发动<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[强化特殊技]</color>时，莱卡恩会同步发动<color=#FFFFFF>[普通攻击]</color>第一段至第三段；\n当操作中角色发动<color=#FFFFFF>[闪避]</color>和<color=#FFFFFF>[闪避反击]</color>时，莱卡恩会同步发动<color=#FFFFFF>[闪避]</color>和<color=#FFFFFF>[闪避反击]</color>，处于<color=#FFFFFF>[围猎]</color>状态下发动<color=#FFFFFF>[闪避反击]</color>后，莱卡恩可直接衔接<color=#FFFFFF>[普通攻击]</color>第三段。\n<color=#FFFFFF>[围猎]</color>状态持续期间，莱卡恩为非当前操作中代理人时发动的招式仅造成伤害与失衡值；莱卡恩为当前操作中角色时，<color=#FFFFFF>[围猎]</color>持续时间不再减少。",
      "stats": {
        "resShred": 25,
        "dmgBonus": 30
      }
    },
    {
      "id": "agent_1141_add",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "额外能力",
      "title": "额外能力：优雅猎群",
      "desc": "队伍中存在与自身属性或阵营相同的角色或其他<color=#FFFFFF>[异常]</color>角色时触发：\n莱卡恩攻击命中处于失衡状态下的敌人时，目标的失衡易伤倍率提升35%。",
      "stats": {
        "dazeVuln": 35
      }
    },
    {
      "id": "agent_1141_m1",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "影画M1",
      "cinemaRank": 1,
      "title": "满月蓄势",
      "desc": "<color=#FFFFFF>[强化特殊技：狂猎时刻]</color>命中敌人时，招式造成的失衡值提升12%，8秒内最多触发一次；\n在<color=#FFFFFF>[强化特殊技：狂猎时刻]</color>中完成蓄力时，该增益效果额外提升10%。",
      "stats": {}
    },
    {
      "id": "agent_1141_m2",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "影画M2",
      "cinemaRank": 2,
      "title": "能量回馈",
      "desc": "使敌人失衡或触发队友的<color=#FFFFFF>[连携技]</color>时，莱卡恩回复5点能量，1秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1141_m4",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "影画M4",
      "cinemaRank": 4,
      "title": "保持风度",
      "desc": "在<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[特殊技]</color>的发动期间受到敌方攻击时，莱卡恩立刻获得等同于自身7.5%生命值上限的护盾，持续15秒，护盾持续期间抗打断等级提升，15秒内最多触发一次。",
      "stats": {}
    },
    {
      "id": "agent_1141_m6",
      "category": "agent",
      "sourceName": "莱卡恩",
      "subType": "影画M6",
      "cinemaRank": 6,
      "title": "冷酷猎手",
      "desc": "蓄力攻击命中敌人时，莱卡恩对目标造成的伤害提升10%，最多叠加5层，持续12秒；\n同一招式内最多叠加1层效果，重复触发时刷新持续时间。",
      "stats": {
        "dmgBonus": 50
      }
    }
  ]
};

export const WEAPON_BUFFS: Record<string, BuffItem> = {
  "街头巨星": {
    "id": "wp_13001",
    "category": "weapon",
    "sourceName": "街头巨星",
    "subType": "A级·强攻",
    "title": "火热腔调",
    "desc": "队伍中任意角色发动<color=#FFFFFF>[连携技]</color>时，为装备者提供1层充能效果，最多叠加3层；发动<color=#FFFFFF>[终结技]</color>时，消耗所有充能，每层充能效果使招式造成的伤害提升<color=#2BAD00>15%</color>。",
    "stats": {
      "dmgBonus": 21.6
    },
    "refinementDescs": [
      "队伍中任意角色发动<color=#FFFFFF>[连携技]</color>时，为装备者提供1层充能效果，最多叠加3层；发动<color=#FFFFFF>[终结技]</color>时，消耗所有充能，每层充能效果使招式造成的伤害提升<color=#2BAD00>15%</color>。",
      "队伍中任意角色发动<color=#FFFFFF>[连携技]</color>时，为装备者提供1层充能效果，最多叠加3层；发动<color=#FFFFFF>[终结技]</color>时，消耗所有充能，每层充能效果使招式造成的伤害提升<color=#2BAD00>17.2%</color>。",
      "队伍中任意角色发动<color=#FFFFFF>[连携技]</color>时，为装备者提供1层充能效果，最多叠加3层；发动<color=#FFFFFF>[终结技]</color>时，消耗所有充能，每层充能效果使招式造成的伤害提升<color=#2BAD00>19.5%</color>。",
      "队伍中任意角色发动<color=#FFFFFF>[连携技]</color>时，为装备者提供1层充能效果，最多叠加3层；发动<color=#FFFFFF>[终结技]</color>时，消耗所有充能，每层充能效果使招式造成的伤害提升<color=#2BAD00>21.7%</color>。",
      "队伍中任意角色发动<color=#FFFFFF>[连携技]</color>时，为装备者提供1层充能效果，最多叠加3层；发动<color=#FFFFFF>[终结技]</color>时，消耗所有充能，每层充能效果使招式造成的伤害提升<color=#2BAD00>24%</color>。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 21.6
      },
      {
        "dmgBonus": 24.6
      },
      {
        "dmgBonus": 27.6
      },
      {
        "dmgBonus": 30.6
      },
      {
        "dmgBonus": 33.6
      }
    ]
  },
  "时光切片": {
    "id": "wp_13002",
    "category": "weapon",
    "sourceName": "时光切片",
    "subType": "A级·支援",
    "title": "说「茄子」",
    "desc": "队伍中任意角色发动<color=#FFFFFF>[闪避反击]</color>/<color=#FFFFFF>[强化特殊技]</color>/<color=#FFFFFF>[支援攻击]</color>/<color=#FFFFFF>[连携技]</color>时，额外获得<color=#2BAD00>20</color>/<color=#2BAD00>25</color>/<color=#2BAD00>30</color>/<color=#2BAD00>35</color>点喧响值，并为装备者回复<color=#2BAD00>0.7</color>点能量，12秒内最多触发一次，不同招式分别结算冷却时间，同名被动效果之间不可叠加。",
    "stats": {},
    "refinementDescs": [
      "队伍中任意角色发动<color=#FFFFFF>[闪避反击]</color>/<color=#FFFFFF>[强化特殊技]</color>/<color=#FFFFFF>[支援攻击]</color>/<color=#FFFFFF>[连携技]</color>时，额外获得<color=#2BAD00>20</color>/<color=#2BAD00>25</color>/<color=#2BAD00>30</color>/<color=#2BAD00>35</color>点喧响值，并为装备者回复<color=#2BAD00>0.7</color>点能量，12秒内最多触发一次，不同招式分别结算冷却时间，同名被动效果之间不可叠加。",
      "队伍中任意角色发动<color=#FFFFFF>[闪避反击]</color>/<color=#FFFFFF>[强化特殊技]</color>/<color=#FFFFFF>[支援攻击]</color>/<color=#FFFFFF>[连携技]</color>时，额外获得<color=#2BAD00>23</color>/<color=#2BAD00>28.5</color>/<color=#2BAD00>34.5</color>/<color=#2BAD00>40</color>点喧响值，并为装备者回复<color=#2BAD00>0.8</color>点能量，12秒内最多触发一次，不同招式分别结算冷却时间，同名被动效果之间不可叠加。",
      "队伍中任意角色发动<color=#FFFFFF>[闪避反击]</color>/<color=#FFFFFF>[强化特殊技]</color>/<color=#FFFFFF>[支援攻击]</color>/<color=#FFFFFF>[连携技]</color>时，额外获得<color=#2BAD00>26</color>/<color=#2BAD00>32</color>/<color=#2BAD00>39</color>/<color=#2BAD00>45</color>点喧响值，并为装备者回复<color=#2BAD00>0.9</color>点能量，12秒内最多触发一次，不同招式分别结算冷却时间，同名被动效果之间不可叠加。",
      "队伍中任意角色发动<color=#FFFFFF>[闪避反击]</color>/<color=#FFFFFF>[强化特殊技]</color>/<color=#FFFFFF>[支援攻击]</color>/<color=#FFFFFF>[连携技]</color>时，额外获得<color=#2BAD00>29</color>/<color=#2BAD00>35.5</color>/<color=#2BAD00>43.5</color>/<color=#2BAD00>50</color>点喧响值，并为装备者回复<color=#2BAD00>1</color>点能量，12秒内最多触发一次，不同招式分别结算冷却时间，同名被动效果之间不可叠加。",
      "队伍中任意角色发动<color=#FFFFFF>[闪避反击]</color>/<color=#FFFFFF>[强化特殊技]</color>/<color=#FFFFFF>[支援攻击]</color>/<color=#FFFFFF>[连携技]</color>时，额外获得<color=#2BAD00>32</color>/<color=#2BAD00>40</color>/<color=#2BAD00>48</color>/<color=#2BAD00>55</color>点喧响值，并为装备者回复<color=#2BAD00>1.1</color>点能量，12秒内最多触发一次，不同招式分别结算冷却时间，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "雨林饕客": {
    "id": "wp_13003",
    "category": "weapon",
    "sourceName": "雨林饕客",
    "subType": "A级·异常",
    "title": "开饭了！",
    "desc": "每消耗10点能量值，获得1层增益效果，每层增益效果使装备者的攻击力提升<color=#2BAD00>2.5%</color>，最多叠加10层，持续10秒，每层效果单独结算持续时间。",
    "stats": {
      "inCombatAtkPct": 25
    },
    "refinementDescs": [
      "每消耗10点能量值，获得1层增益效果，每层增益效果使装备者的攻击力提升<color=#2BAD00>2.5%</color>，最多叠加10层，持续10秒，每层效果单独结算持续时间。",
      "每消耗10点能量值，获得1层增益效果，每层增益效果使装备者的攻击力提升<color=#2BAD00>2.8%</color>，最多叠加10层，持续10秒，每层效果单独结算持续时间。",
      "每消耗10点能量值，获得1层增益效果，每层增益效果使装备者的攻击力提升<color=#2BAD00>3.2%</color>，最多叠加10层，持续10秒，每层效果单独结算持续时间。",
      "每消耗10点能量值，获得1层增益效果，每层增益效果使装备者的攻击力提升<color=#2BAD00>3.6%</color>，最多叠加10层，持续10秒，每层效果单独结算持续时间。",
      "每消耗10点能量值，获得1层增益效果，每层增益效果使装备者的攻击力提升<color=#2BAD00>4%</color>，最多叠加10层，持续10秒，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 25
      },
      {
        "inCombatAtkPct": 28
      },
      {
        "inCombatAtkPct": 32
      },
      {
        "inCombatAtkPct": 36
      },
      {
        "inCombatAtkPct": 40
      }
    ]
  },
  "星徽引擎": {
    "id": "wp_13004",
    "category": "weapon",
    "sourceName": "星徽引擎",
    "subType": "A级·强攻",
    "title": "骑士连打",
    "desc": "发动<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[快速支援]</color>时，装备者的攻击力提升<color=#2BAD00>12%</color>，持续12秒。",
    "stats": {
      "inCombatAtkPct": 12
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[快速支援]</color>时，装备者的攻击力提升<color=#2BAD00>12%</color>，持续12秒。",
      "发动<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[快速支援]</color>时，装备者的攻击力提升<color=#2BAD00>13.8%</color>，持续12秒。",
      "发动<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[快速支援]</color>时，装备者的攻击力提升<color=#2BAD00>15.6%</color>，持续12秒。",
      "发动<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[快速支援]</color>时，装备者的攻击力提升<color=#2BAD00>17.4%</color>，持续12秒。",
      "发动<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[快速支援]</color>时，装备者的攻击力提升<color=#2BAD00>19.2%</color>，持续12秒。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 12
      },
      {
        "inCombatAtkPct": 13.8
      },
      {
        "inCombatAtkPct": 15.6
      },
      {
        "inCombatAtkPct": 17.4
      },
      {
        "inCombatAtkPct": 19.2
      }
    ]
  },
  "人为刀俎": {
    "id": "wp_13005",
    "category": "weapon",
    "sourceName": "人为刀俎",
    "subType": "A级·击破",
    "title": "浓厚汤底",
    "desc": "每拥有10点能量值，装备者的冲击力提升<color=#2BAD00>2%</color>，最多叠加8层，能量消耗后该增益效果仍然保留，持续8秒，每层效果单独结算持续时间。",
    "stats": {},
    "refinementDescs": [
      "每拥有10点能量值，装备者的冲击力提升<color=#2BAD00>2%</color>，最多叠加8层，能量消耗后该增益效果仍然保留，持续8秒，每层效果单独结算持续时间。",
      "每拥有10点能量值，装备者的冲击力提升<color=#2BAD00>2.3%</color>，最多叠加8层，能量消耗后该增益效果仍然保留，持续8秒，每层效果单独结算持续时间。",
      "每拥有10点能量值，装备者的冲击力提升<color=#2BAD00>2.6%</color>，最多叠加8层，能量消耗后该增益效果仍然保留，持续8秒，每层效果单独结算持续时间。",
      "每拥有10点能量值，装备者的冲击力提升<color=#2BAD00>2.9%</color>，最多叠加8层，能量消耗后该增益效果仍然保留，持续8秒，每层效果单独结算持续时间。",
      "每拥有10点能量值，装备者的冲击力提升<color=#2BAD00>3.2%</color>，最多叠加8层，能量消耗后该增益效果仍然保留，持续8秒，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "贵重骨核": {
    "id": "wp_13006",
    "category": "weapon",
    "sourceName": "贵重骨核",
    "subType": "A级·击破",
    "title": "巨兽猎手",
    "desc": "敌方生命值大于等于50%时，装备者对目标造成的失衡值提升<color=#2BAD00>10%</color>，敌方生命值大于等于75%时，该增益效果额外提升<color=#2BAD00>10%</color>。",
    "stats": {},
    "refinementDescs": [
      "敌方生命值大于等于50%时，装备者对目标造成的失衡值提升<color=#2BAD00>10%</color>，敌方生命值大于等于75%时，该增益效果额外提升<color=#2BAD00>10%</color>。",
      "敌方生命值大于等于50%时，装备者对目标造成的失衡值提升<color=#2BAD00>11.5%</color>，敌方生命值大于等于75%时，该增益效果额外提升<color=#2BAD00>11.5%</color>。",
      "敌方生命值大于等于50%时，装备者对目标造成的失衡值提升<color=#2BAD00>13%</color>，敌方生命值大于等于75%时，该增益效果额外提升<color=#2BAD00>13%</color>。",
      "敌方生命值大于等于50%时，装备者对目标造成的失衡值提升<color=#2BAD00>14.5%</color>，敌方生命值大于等于75%时，该增益效果额外提升<color=#2BAD00>14.5%</color>。",
      "敌方生命值大于等于50%时，装备者对目标造成的失衡值提升<color=#2BAD00>16%</color>，敌方生命值大于等于75%时，该增益效果额外提升<color=#2BAD00>16%</color>。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "正版变身器": {
    "id": "wp_13007",
    "category": "weapon",
    "sourceName": "正版变身器",
    "subType": "A级·防护",
    "title": "骑士飞踢",
    "desc": "生命值上限提升<color=#2BAD00>8%</color>；受到敌方攻击时，装备者的冲击力提升<color=#2BAD00>10%</color>，持续12秒。",
    "stats": {
      "inCombatHpPct": 8
    },
    "refinementDescs": [
      "生命值上限提升<color=#2BAD00>8%</color>；受到敌方攻击时，装备者的冲击力提升<color=#2BAD00>10%</color>，持续12秒。",
      "生命值上限提升<color=#2BAD00>9%</color>；受到敌方攻击时，装备者的冲击力提升<color=#2BAD00>11.5%</color>，持续12秒。",
      "生命值上限提升<color=#2BAD00>10%</color>；受到敌方攻击时，装备者的冲击力提升<color=#2BAD00>13%</color>，持续12秒。",
      "生命值上限提升<color=#2BAD00>11%</color>；受到敌方攻击时，装备者的冲击力提升<color=#2BAD00>14.5%</color>，持续12秒。",
      "生命值上限提升<color=#2BAD00>12.5%</color>；受到敌方攻击时，装备者的冲击力提升<color=#2BAD00>16%</color>，持续12秒。"
    ],
    "refinementStats": [
      {
        "inCombatHpPct": 8
      },
      {
        "inCombatHpPct": 9
      },
      {
        "inCombatHpPct": 10
      },
      {
        "inCombatHpPct": 11
      },
      {
        "inCombatHpPct": 12.5
      }
    ]
  },
  "双生泣星": {
    "id": "wp_13008",
    "category": "weapon",
    "sourceName": "双生泣星",
    "subType": "A级·异常",
    "title": "呜咽余波",
    "desc": "队伍中任意角色对敌人施加属性异常效果时，为装备者提供1层增益效果，每层增益效果使装备者的异常精通提升<color=#2BAD00>30</color>点，最多叠加4层，目标从失衡状态恢复或死亡时，对应增益效果结束，每层效果单独结算持续时间。",
    "stats": {
      "anomalyMastery": 120
    },
    "refinementDescs": [
      "队伍中任意角色对敌人施加属性异常效果时，为装备者提供1层增益效果，每层增益效果使装备者的异常精通提升<color=#2BAD00>30</color>点，最多叠加4层，目标从失衡状态恢复或死亡时，对应增益效果结束，每层效果单独结算持续时间。",
      "队伍中任意角色对敌人施加属性异常效果时，为装备者提供1层增益效果，每层增益效果使装备者的异常精通提升<color=#2BAD00>34</color>点，最多叠加4层，目标从失衡状态恢复或死亡时，对应增益效果结束，每层效果单独结算持续时间。",
      "队伍中任意角色对敌人施加属性异常效果时，为装备者提供1层增益效果，每层增益效果使装备者的异常精通提升<color=#2BAD00>38</color>点，最多叠加4层，目标从失衡状态恢复或死亡时，对应增益效果结束，每层效果单独结算持续时间。",
      "队伍中任意角色对敌人施加属性异常效果时，为装备者提供1层增益效果，每层增益效果使装备者的异常精通提升<color=#2BAD00>42</color>点，最多叠加4层，目标从失衡状态恢复或死亡时，对应增益效果结束，每层效果单独结算持续时间。",
      "队伍中任意角色对敌人施加属性异常效果时，为装备者提供1层增益效果，每层增益效果使装备者的异常精通提升<color=#2BAD00>48</color>点，最多叠加4层，目标从失衡状态恢复或死亡时，对应增益效果结束，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 120
      },
      {
        "anomalyMastery": 136
      },
      {
        "anomalyMastery": 152
      },
      {
        "anomalyMastery": 168
      },
      {
        "anomalyMastery": 192
      }
    ]
  },
  "触电唇彩": {
    "id": "wp_13009",
    "category": "weapon",
    "sourceName": "触电唇彩",
    "subType": "A级·异常",
    "title": "致命拥吻",
    "desc": "当场上存在处于属性异常状态下的敌人时，装备者的攻击力提升<color=#2BAD00>10%</color>，对目标造成的伤害额外提升<color=#2BAD00>15%</color>。",
    "stats": {
      "inCombatAtkPct": 10,
      "dmgBonus": 15
    },
    "refinementDescs": [
      "当场上存在处于属性异常状态下的敌人时，装备者的攻击力提升<color=#2BAD00>10%</color>，对目标造成的伤害额外提升<color=#2BAD00>15%</color>。",
      "当场上存在处于属性异常状态下的敌人时，装备者的攻击力提升<color=#2BAD00>11.5%</color>，对目标造成的伤害额外提升<color=#2BAD00>17.5%</color>。",
      "当场上存在处于属性异常状态下的敌人时，装备者的攻击力提升<color=#2BAD00>13%</color>，对目标造成的伤害额外提升<color=#2BAD00>20%</color>。",
      "当场上存在处于属性异常状态下的敌人时，装备者的攻击力提升<color=#2BAD00>14.5%</color>，对目标造成的伤害额外提升<color=#2BAD00>22.5%</color>。",
      "当场上存在处于属性异常状态下的敌人时，装备者的攻击力提升<color=#2BAD00>16%</color>，对目标造成的伤害额外提升<color=#2BAD00>25%</color>。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 10,
        "dmgBonus": 15
      },
      {
        "inCombatAtkPct": 11.5,
        "dmgBonus": 17.5
      },
      {
        "inCombatAtkPct": 13,
        "dmgBonus": 20
      },
      {
        "inCombatAtkPct": 14.5,
        "dmgBonus": 22.5
      },
      {
        "inCombatAtkPct": 16,
        "dmgBonus": 25
      }
    ]
  },
  "兔能环": {
    "id": "wp_13010",
    "category": "weapon",
    "sourceName": "兔能环",
    "subType": "A级·防护",
    "title": "摸摸兔兔",
    "desc": "生命值上限提升<color=#2BAD00>8%</color>；拥有护盾时，装备者的攻击力提升<color=#2BAD00>10%</color>。",
    "stats": {
      "inCombatHpPct": 8,
      "inCombatAtkPct": 10
    },
    "refinementDescs": [
      "生命值上限提升<color=#2BAD00>8%</color>；拥有护盾时，装备者的攻击力提升<color=#2BAD00>10%</color>。",
      "生命值上限提升<color=#2BAD00>9.2%</color>；拥有护盾时，装备者的攻击力提升<color=#2BAD00>11.5%</color>。",
      "生命值上限提升<color=#2BAD00>10.4%</color>；拥有护盾时，装备者的攻击力提升<color=#2BAD00>13%</color>。",
      "生命值上限提升<color=#2BAD00>11.6%</color>；拥有护盾时，装备者的攻击力提升<color=#2BAD00>14.5%</color>。",
      "生命值上限提升<color=#2BAD00>12.8%</color>；拥有护盾时，装备者的攻击力提升<color=#2BAD00>16%</color>。"
    ],
    "refinementStats": [
      {
        "inCombatHpPct": 8,
        "inCombatAtkPct": 10
      },
      {
        "inCombatHpPct": 9.2,
        "inCombatAtkPct": 11.5
      },
      {
        "inCombatHpPct": 10.4,
        "inCombatAtkPct": 13
      },
      {
        "inCombatHpPct": 11.6,
        "inCombatAtkPct": 14.5
      },
      {
        "inCombatHpPct": 12.8,
        "inCombatAtkPct": 16
      }
    ]
  },
  "春日融融": {
    "id": "wp_13011",
    "category": "weapon",
    "sourceName": "春日融融",
    "subType": "A级·防护",
    "title": "热泉汤",
    "desc": "受到的伤害降低<color=#2BAD00>7.5%</color>；受到敌方攻击时，装备者的能量获得效率提升<color=#2BAD00>10%</color>，持续12秒；装备者换回后场时，该增益效果将传递给当前操作中的角色，并刷新持续时间，同名被动效果之间不可叠加。",
    "stats": {},
    "refinementDescs": [
      "受到的伤害降低<color=#2BAD00>7.5%</color>；受到敌方攻击时，装备者的能量获得效率提升<color=#2BAD00>10%</color>，持续12秒；装备者换回后场时，该增益效果将传递给当前操作中的角色，并刷新持续时间，同名被动效果之间不可叠加。",
      "受到的伤害降低<color=#2BAD00>8.5%</color>；受到敌方攻击时，装备者的能量获得效率提升<color=#2BAD00>11.5%</color>，持续12秒；装备者换回后场时，该增益效果将传递给当前操作中的角色，并刷新持续时间，同名被动效果之间不可叠加。",
      "受到的伤害降低<color=#2BAD00>9.5%</color>；受到敌方攻击时，装备者的能量获得效率提升<color=#2BAD00>13%</color>，持续12秒；装备者换回后场时，该增益效果将传递给当前操作中的角色，并刷新持续时间，同名被动效果之间不可叠加。",
      "受到的伤害降低<color=#2BAD00>10.5%</color>；受到敌方攻击时，装备者的能量获得效率提升<color=#2BAD00>14.5%</color>，持续12秒；装备者换回后场时，该增益效果将传递给当前操作中的角色，并刷新持续时间，同名被动效果之间不可叠加。",
      "受到的伤害降低<color=#2BAD00>12%</color>；受到敌方攻击时，装备者的能量获得效率提升<color=#2BAD00>16%</color>，持续12秒；装备者换回后场时，该增益效果将传递给当前操作中的角色，并刷新持续时间，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "幻变魔方": {
    "id": "wp_13012",
    "category": "weapon",
    "sourceName": "幻变魔方",
    "subType": "A级·命破",
    "title": "奇机弄巧",
    "desc": "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击伤害提升<color=#2BAD00>16%</color>，持续12秒；且若目标当前生命值低于最大值的50%时，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>20%</color>。",
    "stats": {
      "critDmg": 16,
      "dmgBonus": 20
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击伤害提升<color=#2BAD00>16%</color>，持续12秒；且若目标当前生命值低于最大值的50%时，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>20%</color>。",
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击伤害提升<color=#2BAD00>18.4%</color>，持续12秒；且若目标当前生命值低于最大值的50%时，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>23%</color>。",
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击伤害提升<color=#2BAD00>20.8%</color>，持续12秒；且若目标当前生命值低于最大值的50%时，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>26%</color>。",
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击伤害提升<color=#2BAD00>23.2%</color>，持续12秒；且若目标当前生命值低于最大值的50%时，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>29%</color>。",
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击伤害提升<color=#2BAD00>25.6%</color>，持续12秒；且若目标当前生命值低于最大值的50%时，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>32%</color>。"
    ],
    "refinementStats": [
      {
        "critDmg": 16,
        "dmgBonus": 20
      },
      {
        "critDmg": 18.4,
        "dmgBonus": 23
      },
      {
        "critDmg": 20.8,
        "dmgBonus": 26
      },
      {
        "critDmg": 23.2,
        "dmgBonus": 29
      },
      {
        "critDmg": 25.6,
        "dmgBonus": 32
      }
    ]
  },
  "鎏金花信": {
    "id": "wp_13013",
    "category": "weapon",
    "sourceName": "鎏金花信",
    "subType": "A级·强攻",
    "title": "超规防盗措施",
    "desc": "攻击力提升<color=#2BAD00>6</color>%，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>15</color>%。",
    "stats": {
      "inCombatAtkPct": 6,
      "dmgBonus": 15
    },
    "refinementDescs": [
      "攻击力提升<color=#2BAD00>6</color>%，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>15</color>%。",
      "攻击力提升<color=#2BAD00>6.9</color>%，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>17.2</color>%。",
      "攻击力提升<color=#2BAD00>7.8</color>%，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>19.5</color>%。",
      "攻击力提升<color=#2BAD00>8.7</color>%，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>21.8</color>%。",
      "攻击力提升<color=#2BAD00>9.6</color>%，<color=#FFFFFF>[强化特殊技]</color>造成的伤害提升<color=#2BAD00>24</color>%。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 6,
        "dmgBonus": 15
      },
      {
        "inCombatAtkPct": 6.9,
        "dmgBonus": 17.2
      },
      {
        "inCombatAtkPct": 7.8,
        "dmgBonus": 19.5
      },
      {
        "inCombatAtkPct": 8.7,
        "dmgBonus": 21.8
      },
      {
        "inCombatAtkPct": 9.6,
        "dmgBonus": 24
      }
    ]
  },
  "电波漫步": {
    "id": "wp_13014",
    "category": "weapon",
    "sourceName": "电波漫步",
    "subType": "A级·命破",
    "title": "自在步调",
    "desc": "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，装备者获得1层增益效果，每层增益效果使装备者的贯穿力提升<color=#2BAD00>80</color>点，最多叠加3层，持续12秒，每层效果单独结算持续时间。",
    "stats": {
      "inCombatPen": 240
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，装备者获得1层增益效果，每层增益效果使装备者的贯穿力提升<color=#2BAD00>80</color>点，最多叠加3层，持续12秒，每层效果单独结算持续时间。",
      "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，装备者获得1层增益效果，每层增益效果使装备者的贯穿力提升<color=#2BAD00>92</color>点，最多叠加3层，持续12秒，每层效果单独结算持续时间。",
      "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，装备者获得1层增益效果，每层增益效果使装备者的贯穿力提升<color=#2BAD00>104</color>点，最多叠加3层，持续12秒，每层效果单独结算持续时间。",
      "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，装备者获得1层增益效果，每层增益效果使装备者的贯穿力提升<color=#2BAD00>116</color>点，最多叠加3层，持续12秒，每层效果单独结算持续时间。",
      "发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>时，装备者获得1层增益效果，每层增益效果使装备者的贯穿力提升<color=#2BAD00>128</color>点，最多叠加3层，持续12秒，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {
        "inCombatPen": 240
      },
      {
        "inCombatPen": 276
      },
      {
        "inCombatPen": 312
      },
      {
        "inCombatPen": 348
      },
      {
        "inCombatPen": 384
      }
    ]
  },
  "强音热望": {
    "id": "wp_13015",
    "category": "weapon",
    "sourceName": "强音热望",
    "subType": "A级·强攻",
    "title": "躁动全场",
    "desc": "<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>6%</color>，持续8秒；目标处于属性异常状态下时，该增益效果额外提升<color=#2BAD00>6%</color>。",
    "stats": {
      "inCombatAtkPct": 19.2
    },
    "refinementDescs": [
      "<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>6%</color>，持续8秒；目标处于属性异常状态下时，该增益效果额外提升<color=#2BAD00>6%</color>。",
      "<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>6.9%</color>，持续8秒；目标处于属性异常状态下时，该增益效果额外提升<color=#2BAD00>6.9%</color>。",
      "<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>7.8%</color>，持续8秒；目标处于属性异常状态下时，该增益效果额外提升<color=#2BAD00>7.8%</color>。",
      "<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>8.7%</color>，持续8秒；目标处于属性异常状态下时，该增益效果额外提升<color=#2BAD00>8.7%</color>。",
      "<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>9.6%</color>，持续8秒；目标处于属性异常状态下时，该增益效果额外提升<color=#2BAD00>9.6%</color>。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 19.2
      },
      {
        "inCombatAtkPct": 21.6
      },
      {
        "inCombatAtkPct": 24
      },
      {
        "inCombatAtkPct": 26.4
      },
      {
        "inCombatAtkPct": 28.8
      }
    ]
  },
  "光影刻刀": {
    "id": "wp_13016",
    "category": "weapon",
    "sourceName": "光影刻刀",
    "subType": "A级·防护",
    "title": "镌刻倏忽",
    "desc": "队伍中角色生命值大于等于50%，受到的伤害降低<color=#2BAD00>7.5%</color>，受到的[秽息浸染]值降低<color=#2BAD00>10%</color>，该效果全队唯一。",
    "stats": {},
    "refinementDescs": [
      "队伍中角色生命值大于等于50%，受到的伤害降低<color=#2BAD00>7.5%</color>，受到的[秽息浸染]值降低<color=#2BAD00>10%</color>，该效果全队唯一。",
      "队伍中角色生命值大于等于50%，受到的伤害降低<color=#2BAD00>8.6%</color>，受到的[秽息浸染]值降低<color=#2BAD00>11.5%</color>，该效果全队唯一。",
      "队伍中角色生命值大于等于50%，受到的伤害降低<color=#2BAD00>9.7%</color>，受到的[秽息浸染]值降低<color=#2BAD00>13%</color>，该效果全队唯一。",
      "队伍中角色生命值大于等于50%，受到的伤害降低<color=#2BAD00>10.8%</color>，受到的[秽息浸染]值降低<color=#2BAD00>14.5%</color>，该效果全队唯一。",
      "队伍中角色生命值大于等于50%，受到的伤害降低<color=#2BAD00>12%</color>，受到的[秽息浸染]值降低<color=#2BAD00>16%</color>，该效果全队唯一。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "喵运当头": {
    "id": "wp_13017",
    "category": "weapon",
    "sourceName": "喵运当头",
    "subType": "A级·锋御",
    "title": "幸运肉球",
    "desc": "防御力提升<color=#2BAD00>8%</color>；释放<color=#FFFFFF>[强化特殊技]</color>时，防御力额外提升<color=#2BAD00>8%</color>，持续40秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatDefPct": 16
    },
    "refinementDescs": [
      "防御力提升<color=#2BAD00>8%</color>；释放<color=#FFFFFF>[强化特殊技]</color>时，防御力额外提升<color=#2BAD00>8%</color>，持续40秒，重复触发时刷新持续时间。",
      "防御力提升<color=#2BAD00>9%</color>；释放<color=#FFFFFF>[强化特殊技]</color>时，防御力额外提升<color=#2BAD00>9%</color>，持续40秒，重复触发时刷新持续时间。",
      "防御力提升<color=#2BAD00>10%</color>；释放<color=#FFFFFF>[强化特殊技]</color>时，防御力额外提升<color=#2BAD00>10%</color>，持续40秒，重复触发时刷新持续时间。",
      "防御力提升<color=#2BAD00>11%</color>；释放<color=#FFFFFF>[强化特殊技]</color>时，防御力额外提升<color=#2BAD00>11%</color>，持续40秒，重复触发时刷新持续时间。",
      "防御力提升<color=#2BAD00>12%</color>；释放<color=#FFFFFF>[强化特殊技]</color>时，防御力额外提升<color=#2BAD00>12%</color>，持续40秒，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "inCombatDefPct": 16
      },
      {
        "inCombatDefPct": 18
      },
      {
        "inCombatDefPct": 20
      },
      {
        "inCombatDefPct": 22
      },
      {
        "inCombatDefPct": 24
      }
    ]
  },
  "咚哒回声": {
    "id": "wp_13018",
    "category": "weapon",
    "sourceName": "咚哒回声",
    "subType": "A级·异常",
    "title": "铿锵鸣鼓",
    "desc": "装备者触发<color=#FFFFFF>[乱流]</color>效果时，为自身回复<color=#2BAD00>2</color>点能量，10秒内最多触发一次；装备者攻击处于属性异常状态下的敌人时，造成的伤害提升<color=#2BAD00>11.5%</color>。",
    "stats": {
      "dmgBonus": 11.5
    },
    "refinementDescs": [
      "装备者触发<color=#FFFFFF>[乱流]</color>效果时，为自身回复<color=#2BAD00>2</color>点能量，10秒内最多触发一次；装备者攻击处于属性异常状态下的敌人时，造成的伤害提升<color=#2BAD00>11.5%</color>。",
      "装备者触发<color=#FFFFFF>[乱流]</color>效果时，为自身回复<color=#2BAD00>2.3</color>点能量，10秒内最多触发一次；装备者攻击处于属性异常状态下的敌人时，造成的伤害提升<color=#2BAD00>13.2%</color>。",
      "装备者触发<color=#FFFFFF>[乱流]</color>效果时，为自身回复<color=#2BAD00>2.6</color>点能量，10秒内最多触发一次；装备者攻击处于属性异常状态下的敌人时，造成的伤害提升<color=#2BAD00>15%</color>。",
      "装备者触发<color=#FFFFFF>[乱流]</color>效果时，为自身回复<color=#2BAD00>2.9</color>点能量，10秒内最多触发一次；装备者攻击处于属性异常状态下的敌人时，造成的伤害提升<color=#2BAD00>16.7%</color>。",
      "装备者触发<color=#FFFFFF>[乱流]</color>效果时，为自身回复<color=#2BAD00>3.2</color>点能量，10秒内最多触发一次；装备者攻击处于属性异常状态下的敌人时，造成的伤害提升<color=#2BAD00>18.4%</color>。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 11.5
      },
      {
        "dmgBonus": 13.2
      },
      {
        "dmgBonus": 15
      },
      {
        "dmgBonus": 16.7
      },
      {
        "dmgBonus": 18.4
      }
    ]
  },
  "青漪灵鼎": {
    "id": "wp_13019",
    "category": "weapon",
    "sourceName": "青漪灵鼎",
    "subType": "A级·命破",
    "title": "玄音唤灵",
    "desc": "装备者发动<color=#FFFFFF>[强化特殊技]</color> 时可获得1层增益效果，每层增益效果使装备者造成的伤害提升<color=#2BAD00>4%</color>，最多叠加3层，持续20秒，每0.5秒最多触发1次，重复触发时刷新持续时间；拥有3层增益效果时，装备者的暴击率提升<color=#2BAD00>6.5%</color>。",
    "stats": {
      "dmgBonus": 12,
      "critRate": 6.5
    },
    "refinementDescs": [
      "装备者发动<color=#FFFFFF>[强化特殊技]</color> 时可获得1层增益效果，每层增益效果使装备者造成的伤害提升<color=#2BAD00>4%</color>，最多叠加3层，持续20秒，每0.5秒最多触发1次，重复触发时刷新持续时间；拥有3层增益效果时，装备者的暴击率提升<color=#2BAD00>6.5%</color>。",
      "装备者发动<color=#FFFFFF>[强化特殊技]</color> 时可获得1层增益效果，每层增益效果使装备者造成的伤害提升<color=#2BAD00>4.6%</color>，最多叠加3层，持续20秒，每0.5秒最多触发1次，重复触发时刷新持续时间；拥有3层增益效果时，装备者的暴击率提升<color=#2BAD00>7.5%</color>。",
      "装备者发动<color=#FFFFFF>[强化特殊技]</color> 时可获得1层增益效果，每层增益效果使装备者造成的伤害提升<color=#2BAD00>5.2%</color>，最多叠加3层，持续20秒，每0.5秒最多触发1次，重复触发时刷新持续时间；拥有3层增益效果时，装备者的暴击率提升<color=#2BAD00>8.5%</color>。",
      "装备者发动<color=#FFFFFF>[强化特殊技]</color> 时可获得1层增益效果，每层增益效果使装备者造成的伤害提升<color=#2BAD00>5.8%</color>，最多叠加3层，持续20秒，每0.5秒最多触发1次，重复触发时刷新持续时间；拥有3层增益效果时，装备者的暴击率提升<color=#2BAD00>9.4%</color>。",
      "装备者发动<color=#FFFFFF>[强化特殊技]</color> 时可获得1层增益效果，每层增益效果使装备者造成的伤害提升<color=#2BAD00>6.4%</color>，最多叠加3层，持续20秒，每0.5秒最多触发1次，重复触发时刷新持续时间；拥有3层增益效果时，装备者的暴击率提升<color=#2BAD00>10.4%</color>。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 12,
        "critRate": 6.5
      },
      {
        "dmgBonus": 13.8,
        "critRate": 7.5
      },
      {
        "dmgBonus": 15.6,
        "critRate": 8.5
      },
      {
        "dmgBonus": 17.4,
        "critRate": 9.4
      },
      {
        "dmgBonus": 19.2,
        "critRate": 10.4
      }
    ]
  },
  "炎炙沸釜": {
    "id": "wp_13020",
    "category": "weapon",
    "sourceName": "炎炙沸釜",
    "subType": "A级·击破",
    "title": "红油辣锅",
    "desc": "发动<color=#FFFFFF>[支援突击]</color> 时，装备者对目标造成的失衡值提升<color=#2BAD00>7.2%</color>，装备者造成的伤害提升<color=#2BAD00>7.2%</color>，持续30秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 7.2
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[支援突击]</color> 时，装备者对目标造成的失衡值提升<color=#2BAD00>7.2%</color>，装备者造成的伤害提升<color=#2BAD00>7.2%</color>，持续30秒，重复触发时刷新持续时间。",
      "发动<color=#FFFFFF>[支援突击]</color> 时，装备者对目标造成的失衡值提升<color=#2BAD00>8.2%</color>，装备者造成的伤害提升<color=#2BAD00>8.2%</color>，持续30秒，重复触发时刷新持续时间。",
      "发动<color=#FFFFFF>[支援突击]</color> 时，装备者对目标造成的失衡值提升<color=#2BAD00>9.2%</color>，装备者造成的伤害提升<color=#2BAD00>9.2%</color>，持续30秒，重复触发时刷新持续时间。",
      "发动<color=#FFFFFF>[支援突击]</color> 时，装备者对目标造成的失衡值提升<color=#2BAD00>10.2%</color>，装备者造成的伤害提升<color=#2BAD00>10.2%</color>，持续30秒，重复触发时刷新持续时间。",
      "发动<color=#FFFFFF>[支援突击]</color> 时，装备者对目标造成的失衡值提升<color=#2BAD00>11.5%</color>，装备者造成的伤害提升<color=#2BAD00>11.5%</color>，持续30秒，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 7.2
      },
      {
        "dmgBonus": 8.2
      },
      {
        "dmgBonus": 9.2
      },
      {
        "dmgBonus": 10.2
      },
      {
        "dmgBonus": 11.5
      }
    ]
  },
  "血髓秘匣": {
    "id": "wp_13021",
    "category": "weapon",
    "sourceName": "血髓秘匣",
    "subType": "A级·锋御",
    "title": "启封之刻",
    "desc": "装备者暴击率大于<color=#2BAD00>100%</color>时，每超出1%暴击率，使装备者造成的伤害提升<color=#2BAD00>0.48%</color>，至多提升<color=#2BAD00>24%</color>。",
    "stats": {
      "dmgBonus": 24
    },
    "refinementDescs": [
      "装备者暴击率大于<color=#2BAD00>100%</color>时，每超出1%暴击率，使装备者造成的伤害提升<color=#2BAD00>0.48%</color>，至多提升<color=#2BAD00>24%</color>。",
      "装备者暴击率大于<color=#2BAD00>100%</color>时，每超出1%暴击率，使装备者造成的伤害提升<color=#2BAD00>0.56%</color>，至多提升<color=#2BAD00>28%</color>。",
      "装备者暴击率大于<color=#2BAD00>100%</color>时，每超出1%暴击率，使装备者造成的伤害提升<color=#2BAD00>0.64%</color>，至多提升<color=#2BAD00>32%</color>。",
      "装备者暴击率大于<color=#2BAD00>100%</color>时，每超出1%暴击率，使装备者造成的伤害提升<color=#2BAD00>0.72%</color>，至多提升<color=#2BAD00>36%</color>。",
      "装备者暴击率大于<color=#2BAD00>100%</color>时，每超出1%暴击率，使装备者造成的伤害提升<color=#2BAD00>0.8%</color>，至多提升<color=#2BAD00>40%</color>。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 24
      },
      {
        "dmgBonus": 28
      },
      {
        "dmgBonus": 32
      },
      {
        "dmgBonus": 36
      },
      {
        "dmgBonus": 40
      }
    ]
  },
  "烛光诡计": {
    "id": "wp_13022",
    "category": "weapon",
    "sourceName": "烛光诡计",
    "subType": "A级·锋御",
    "title": "惊吓时刻",
    "desc": "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击率提升<color=#2BAD00>8%</color>，持续40秒；装备者对当前生命值低于最大值50%的敌人造成的伤害提升<color=#2BAD00>15%</color>。",
    "stats": {
      "critRate": 8,
      "dmgBonus": 15
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击率提升<color=#2BAD00>8%</color>，持续40秒；装备者对当前生命值低于最大值50%的敌人造成的伤害提升<color=#2BAD00>15%</color>。",
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击率提升<color=#2BAD00>9.2%</color>，持续40秒；装备者对当前生命值低于最大值50%的敌人造成的伤害提升<color=#2BAD00>17.3%</color>。",
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击率提升<color=#2BAD00>10.4%</color>，持续40秒；装备者对当前生命值低于最大值50%的敌人造成的伤害提升<color=#2BAD00>19.5%</color>。",
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击率提升<color=#2BAD00>11.6%</color>，持续40秒；装备者对当前生命值低于最大值50%的敌人造成的伤害提升<color=#2BAD00>21.8%</color>。",
      "发动<color=#FFFFFF>[强化特殊技]</color>时，装备者暴击率提升<color=#2BAD00>12.8%</color>，持续40秒；装备者对当前生命值低于最大值50%的敌人造成的伤害提升<color=#2BAD00>24%</color>。"
    ],
    "refinementStats": [
      {
        "critRate": 8,
        "dmgBonus": 15
      },
      {
        "critRate": 9.2,
        "dmgBonus": 17.3
      },
      {
        "critRate": 10.4,
        "dmgBonus": 19.5
      },
      {
        "critRate": 11.6,
        "dmgBonus": 21.8
      },
      {
        "critRate": 12.8,
        "dmgBonus": 24
      }
    ]
  },
  "德玛拉电池Ⅱ型": {
    "id": "wp_13101",
    "category": "weapon",
    "sourceName": "德玛拉电池Ⅱ型",
    "subType": "A级·击破",
    "title": "电光石火",
    "desc": "<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>15%</color>；<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者的能量获得效率提升<color=#2BAD00>18%</color>，持续8秒。",
    "stats": {
      "dmgBonus": 15
    },
    "refinementDescs": [
      "<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>15%</color>；<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者的能量获得效率提升<color=#2BAD00>18%</color>，持续8秒。",
      "<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>17.5%</color>；<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者的能量获得效率提升<color=#2BAD00>20.5%</color>，持续8秒。",
      "<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>20%</color>；<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者的能量获得效率提升<color=#2BAD00>23%</color>，持续8秒。",
      "<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>22%</color>；<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者的能量获得效率提升<color=#2BAD00>25%</color>，持续8秒。",
      "<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>24%</color>；<color=#FFFFFF>[闪避反击]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者的能量获得效率提升<color=#2BAD00>27.5%</color>，持续8秒。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 15
      },
      {
        "dmgBonus": 17.5
      },
      {
        "dmgBonus": 20
      },
      {
        "dmgBonus": 22
      },
      {
        "dmgBonus": 24
      }
    ]
  },
  "聚宝箱": {
    "id": "wp_13103",
    "category": "weapon",
    "sourceName": "聚宝箱",
    "subType": "A级·支援",
    "title": "财迷心窍",
    "desc": "<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#FE437E>以太伤害</color>时，所有单位对目标造成的伤害提升<color=#2BAD00>15%</color>，装备者的能量自动回复提升<color=#2BAD00>0.5</color>点/秒，持续2秒，同名被动效果之间不可叠加。",
    "stats": {
      "dmgBonus": 15
    },
    "refinementDescs": [
      "<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#FE437E>以太伤害</color>时，所有单位对目标造成的伤害提升<color=#2BAD00>15%</color>，装备者的能量自动回复提升<color=#2BAD00>0.5</color>点/秒，持续2秒，同名被动效果之间不可叠加。",
      "<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#FE437E>以太伤害</color>时，所有单位对目标造成的伤害提升<color=#2BAD00>17.5%</color>，装备者的能量自动回复提升<color=#2BAD00>0.58</color>点/秒，持续2秒，同名被动效果之间不可叠加。",
      "<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#FE437E>以太伤害</color>时，所有单位对目标造成的伤害提升<color=#2BAD00>20%</color>，装备者的能量自动回复提升<color=#2BAD00>0.65</color>点/秒，持续2秒，同名被动效果之间不可叠加。",
      "<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#FE437E>以太伤害</color>时，所有单位对目标造成的伤害提升<color=#2BAD00>22%</color>，装备者的能量自动回复提升<color=#2BAD00>0.72</color>点/秒，持续2秒，同名被动效果之间不可叠加。",
      "<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#FE437E>以太伤害</color>时，所有单位对目标造成的伤害提升<color=#2BAD00>24%</color>，装备者的能量自动回复提升<color=#2BAD00>0.8</color>点/秒，持续2秒，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 15
      },
      {
        "dmgBonus": 17.5
      },
      {
        "dmgBonus": 20
      },
      {
        "dmgBonus": 22
      },
      {
        "dmgBonus": 24
      }
    ]
  },
  "家政员": {
    "id": "wp_13106",
    "category": "weapon",
    "sourceName": "家政员",
    "subType": "A级·强攻",
    "title": "安心家用轮锯",
    "desc": "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.45</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>命中敌人时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>3%</color>，最多叠加15层，持续1秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 45
    },
    "refinementDescs": [
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.45</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>命中敌人时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>3%</color>，最多叠加15层，持续1秒，重复触发时刷新持续时间。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.52</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>命中敌人时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>3.5%</color>，最多叠加15层，持续1秒，重复触发时刷新持续时间。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.58</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>命中敌人时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>4%</color>，最多叠加15层，持续1秒，重复触发时刷新持续时间。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.65</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>命中敌人时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>4.4%</color>，最多叠加15层，持续1秒，重复触发时刷新持续时间。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.72</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>命中敌人时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>4.8%</color>，最多叠加15层，持续1秒，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 45
      },
      {
        "dmgBonus": 52.5
      },
      {
        "dmgBonus": 60
      },
      {
        "dmgBonus": 66
      },
      {
        "dmgBonus": 72
      }
    ]
  },
  "仿制星徽引擎": {
    "id": "wp_13108",
    "category": "weapon",
    "sourceName": "仿制星徽引擎",
    "subType": "A级·强攻",
    "title": "骑士光波：改",
    "desc": "<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中6米外的敌人时，装备者对目标造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>36%</color>，持续8秒。",
    "stats": {
      "dmgBonus": 36
    },
    "refinementDescs": [
      "<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中6米外的敌人时，装备者对目标造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>36%</color>，持续8秒。",
      "<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中6米外的敌人时，装备者对目标造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>41%</color>，持续8秒。",
      "<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中6米外的敌人时，装备者对目标造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>46.5%</color>，持续8秒。",
      "<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中6米外的敌人时，装备者对目标造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>52%</color>，持续8秒。",
      "<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>命中6米外的敌人时，装备者对目标造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>57.5%</color>，持续8秒。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 36
      },
      {
        "dmgBonus": 41
      },
      {
        "dmgBonus": 46.5
      },
      {
        "dmgBonus": 52
      },
      {
        "dmgBonus": 57.5
      }
    ]
  },
  "旋钻机-赤轴": {
    "id": "wp_13111",
    "category": "weapon",
    "sourceName": "旋钻机-赤轴",
    "subType": "A级·强攻",
    "title": "红莲电机",
    "desc": "发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>时，<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>50%</color>，持续10秒，15秒内最多触发一次。",
    "stats": {
      "dmgBonus": 50
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>时，<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>50%</color>，持续10秒，15秒内最多触发一次。",
      "发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>时，<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>57.5%</color>，持续10秒，15秒内最多触发一次。",
      "发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>时，<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>65%</color>，持续10秒，15秒内最多触发一次。",
      "发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>时，<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>72.5%</color>，持续10秒，15秒内最多触发一次。",
      "发动<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[连携技]</color>时，<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>80%</color>，持续10秒，15秒内最多触发一次。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 50
      },
      {
        "dmgBonus": 57.5
      },
      {
        "dmgBonus": 65
      },
      {
        "dmgBonus": 72.5
      },
      {
        "dmgBonus": 80
      }
    ]
  },
  "比格气缸": {
    "id": "wp_13112",
    "category": "weapon",
    "sourceName": "比格气缸",
    "subType": "A级·防护",
    "title": "万斤顶",
    "desc": "受到的伤害降低<color=#2BAD00>7.5%</color>；受到敌方攻击后，下一次攻击命中敌人时，额外造成装备者<color=#2BAD00>600%</color>防御力的伤害，且必定触发暴击，7.5秒内最多触发一次。",
    "stats": {},
    "refinementDescs": [
      "受到的伤害降低<color=#2BAD00>7.5%</color>；受到敌方攻击后，下一次攻击命中敌人时，额外造成装备者<color=#2BAD00>600%</color>防御力的伤害，且必定触发暴击，7.5秒内最多触发一次。",
      "受到的伤害降低<color=#2BAD00>8.5%</color>；受到敌方攻击后，下一次攻击命中敌人时，额外造成装备者<color=#2BAD00>690%</color>防御力的伤害，且必定触发暴击，7.5秒内最多触发一次。",
      "受到的伤害降低<color=#2BAD00>9.5%</color>；受到敌方攻击后，下一次攻击命中敌人时，额外造成装备者<color=#2BAD00>780%</color>防御力的伤害，且必定触发暴击，7.5秒内最多触发一次。",
      "受到的伤害降低<color=#2BAD00>10.5%</color>；受到敌方攻击后，下一次攻击命中敌人时，额外造成装备者<color=#2BAD00>870%</color>防御力的伤害，且必定触发暴击，7.5秒内最多触发一次。",
      "受到的伤害降低<color=#2BAD00>12%</color>；受到敌方攻击后，下一次攻击命中敌人时，额外造成装备者<color=#2BAD00>960%</color>防御力的伤害，且必定触发暴击，7.5秒内最多触发一次。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "含羞恶面": {
    "id": "wp_13113",
    "category": "weapon",
    "sourceName": "含羞恶面",
    "subType": "A级·支援",
    "title": "饕餮相",
    "desc": "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>15%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，全队角色攻击力提升<color=#2BAD00>2%</color>，最多叠加4层，持续12秒，重复触发时刷新持续时间，同名被动效果之间不可叠加。",
    "stats": {
      "dmgBonus": 15,
      "inCombatAtkPct": 8
    },
    "refinementDescs": [
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>15%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，全队角色攻击力提升<color=#2BAD00>2%</color>，最多叠加4层，持续12秒，重复触发时刷新持续时间，同名被动效果之间不可叠加。",
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>17.5%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，全队角色攻击力提升<color=#2BAD00>2.3%</color>，最多叠加4层，持续12秒，重复触发时刷新持续时间，同名被动效果之间不可叠加。",
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>20%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，全队角色攻击力提升<color=#2BAD00>2.6%</color>，最多叠加4层，持续12秒，重复触发时刷新持续时间，同名被动效果之间不可叠加。",
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>22%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，全队角色攻击力提升<color=#2BAD00>2.9%</color>，最多叠加4层，持续12秒，重复触发时刷新持续时间，同名被动效果之间不可叠加。",
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>24%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，全队角色攻击力提升<color=#2BAD00>3.2%</color>，最多叠加4层，持续12秒，重复触发时刷新持续时间，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 15,
        "inCombatAtkPct": 8
      },
      {
        "dmgBonus": 17.5,
        "inCombatAtkPct": 9.2
      },
      {
        "dmgBonus": 20,
        "inCombatAtkPct": 10.4
      },
      {
        "dmgBonus": 22,
        "inCombatAtkPct": 11.6
      },
      {
        "dmgBonus": 24,
        "inCombatAtkPct": 12.8
      }
    ]
  },
  "好斗的阿炮": {
    "id": "wp_13115",
    "category": "weapon",
    "sourceName": "好斗的阿炮",
    "subType": "A级·支援",
    "title": "踩踏事故",
    "desc": "队伍中任意友方单位攻击命中敌人时，队伍中所有友方单位的攻击力提升<color=#2BAD00>2.5%</color>，最多叠加4层，持续8秒，每层效果单独结算持续时间，每名友方单位最多提供1层增益效果，同名被动效果之间不可叠加。",
    "stats": {
      "inCombatAtkPct": 10
    },
    "refinementDescs": [
      "队伍中任意友方单位攻击命中敌人时，队伍中所有友方单位的攻击力提升<color=#2BAD00>2.5%</color>，最多叠加4层，持续8秒，每层效果单独结算持续时间，每名友方单位最多提供1层增益效果，同名被动效果之间不可叠加。",
      "队伍中任意友方单位攻击命中敌人时，队伍中所有友方单位的攻击力提升<color=#2BAD00>2.8%</color>，最多叠加4层，持续8秒，每层效果单独结算持续时间，每名友方单位最多提供1层增益效果，同名被动效果之间不可叠加。",
      "队伍中任意友方单位攻击命中敌人时，队伍中所有友方单位的攻击力提升<color=#2BAD00>3.2%</color>，最多叠加4层，持续8秒，每层效果单独结算持续时间，每名友方单位最多提供1层增益效果，同名被动效果之间不可叠加。",
      "队伍中任意友方单位攻击命中敌人时，队伍中所有友方单位的攻击力提升<color=#2BAD00>3.6%</color>，最多叠加4层，持续8秒，每层效果单独结算持续时间，每名友方单位最多提供1层增益效果，同名被动效果之间不可叠加。",
      "队伍中任意友方单位攻击命中敌人时，队伍中所有友方单位的攻击力提升<color=#2BAD00>4%</color>，最多叠加4层，持续8秒，每层效果单独结算持续时间，每名友方单位最多提供1层增益效果，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 10
      },
      {
        "inCombatAtkPct": 11.2
      },
      {
        "inCombatAtkPct": 12.8
      },
      {
        "inCombatAtkPct": 14.4
      },
      {
        "inCombatAtkPct": 16
      }
    ]
  },
  "维序者-特化型": {
    "id": "wp_13127",
    "category": "weapon",
    "sourceName": "维序者-特化型",
    "subType": "A级·防护",
    "title": "标准格挡术",
    "desc": "拥有护盾时，装备者的能量自动回复提升<color=#2BAD00>0.4</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[支援突击]</color>累积的属性异常积蓄值提升<color=#2BAD00>36%</color>。",
    "stats": {},
    "refinementDescs": [
      "拥有护盾时，装备者的能量自动回复提升<color=#2BAD00>0.4</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[支援突击]</color>累积的属性异常积蓄值提升<color=#2BAD00>36%</color>。",
      "拥有护盾时，装备者的能量自动回复提升<color=#2BAD00>0.46</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[支援突击]</color>累积的属性异常积蓄值提升<color=#2BAD00>40%</color>。",
      "拥有护盾时，装备者的能量自动回复提升<color=#2BAD00>0.52</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[支援突击]</color>累积的属性异常积蓄值提升<color=#2BAD00>45%</color>。",
      "拥有护盾时，装备者的能量自动回复提升<color=#2BAD00>0.58</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[支援突击]</color>累积的属性异常积蓄值提升<color=#2BAD00>50%</color>。",
      "拥有护盾时，装备者的能量自动回复提升<color=#2BAD00>0.64</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[支援突击]</color>累积的属性异常积蓄值提升<color=#2BAD00>55%</color>。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "轰鸣座驾": {
    "id": "wp_13128",
    "category": "weapon",
    "sourceName": "轰鸣座驾",
    "subType": "A级·异常",
    "title": "碰撞势能",
    "desc": "<color=#FFFFFF>[强化特殊技]</color>命中敌人时，随机触发以下三种效果中的一种，持续5秒，0.3秒内最多触发一次，同类效果不可叠加，重复触发时刷新持续时间，多个效果可以同时存在：装备者的攻击力提升<color=#2BAD00>8%</color>；装备者的异常精通提升<color=#2BAD00>40</color>点；装备者的属性异常积蓄效率提升<color=#2BAD00>25%</color>。",
    "stats": {
      "inCombatAtkPct": 8,
      "anomalyMastery": 40
    },
    "refinementDescs": [
      "<color=#FFFFFF>[强化特殊技]</color>命中敌人时，随机触发以下三种效果中的一种，持续5秒，0.3秒内最多触发一次，同类效果不可叠加，重复触发时刷新持续时间，多个效果可以同时存在：装备者的攻击力提升<color=#2BAD00>8%</color>；装备者的异常精通提升<color=#2BAD00>40</color>点；装备者的属性异常积蓄效率提升<color=#2BAD00>25%</color>。",
      "<color=#FFFFFF>[强化特殊技]</color>命中敌人时，随机触发以下三种效果中的一种，持续5秒，0.3秒内最多触发一次，同类效果不可叠加，重复触发时刷新持续时间，多个效果可以同时存在：装备者的攻击力提升<color=#2BAD00>9.2%</color>；装备者的异常精通提升<color=#2BAD00>46</color>点；装备者的属性异常积蓄效率提升<color=#2BAD00>28%</color>。",
      "<color=#FFFFFF>[强化特殊技]</color>命中敌人时，随机触发以下三种效果中的一种，持续5秒，0.3秒内最多触发一次，同类效果不可叠加，重复触发时刷新持续时间，多个效果可以同时存在：装备者的攻击力提升<color=#2BAD00>10.4%</color>；装备者的异常精通提升<color=#2BAD00>52</color>点；装备者的属性异常积蓄效率提升<color=#2BAD00>32%</color>。",
      "<color=#FFFFFF>[强化特殊技]</color>命中敌人时，随机触发以下三种效果中的一种，持续5秒，0.3秒内最多触发一次，同类效果不可叠加，重复触发时刷新持续时间，多个效果可以同时存在：装备者的攻击力提升<color=#2BAD00>11.6%</color>；装备者的异常精通提升<color=#2BAD00>58</color>点；装备者的属性异常积蓄效率提升<color=#2BAD00>36%</color>。",
      "<color=#FFFFFF>[强化特殊技]</color>命中敌人时，随机触发以下三种效果中的一种，持续5秒，0.3秒内最多触发一次，同类效果不可叠加，重复触发时刷新持续时间，多个效果可以同时存在：装备者的攻击力提升<color=#2BAD00>12.8%</color>；装备者的异常精通提升<color=#2BAD00>64</color>点；装备者的属性异常积蓄效率提升<color=#2BAD00>40%</color>。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 8,
        "anomalyMastery": 40
      },
      {
        "inCombatAtkPct": 9.2,
        "anomalyMastery": 46
      },
      {
        "inCombatAtkPct": 10.4,
        "anomalyMastery": 52
      },
      {
        "inCombatAtkPct": 11.6,
        "anomalyMastery": 58
      },
      {
        "inCombatAtkPct": 12.8,
        "anomalyMastery": 64
      }
    ]
  },
  "裁纸刀": {
    "id": "wp_13135",
    "category": "weapon",
    "sourceName": "裁纸刀",
    "subType": "A级·击破",
    "title": "小心手指",
    "desc": "发动<color=#FFFFFF>[追加攻击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>15%</color>，造成的失衡值提升<color=#2BAD00>10%</color>，持续10秒。",
    "stats": {
      "dmgBonus": 15
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[追加攻击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>15%</color>，造成的失衡值提升<color=#2BAD00>10%</color>，持续10秒。",
      "发动<color=#FFFFFF>[追加攻击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>17.3%</color>，造成的失衡值提升<color=#2BAD00>11.5%</color>，持续10秒。",
      "发动<color=#FFFFFF>[追加攻击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>19.5%</color>，造成的失衡值提升<color=#2BAD00>13%</color>，持续10秒。",
      "发动<color=#FFFFFF>[追加攻击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>21.8%</color>，造成的失衡值提升<color=#2BAD00>14.5%</color>，持续10秒。",
      "发动<color=#FFFFFF>[追加攻击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>24%</color>，造成的失衡值提升<color=#2BAD00>16%</color>，持续10秒。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 15
      },
      {
        "dmgBonus": 17.3
      },
      {
        "dmgBonus": 19.5
      },
      {
        "dmgBonus": 21.8
      },
      {
        "dmgBonus": 24
      }
    ]
  },
  "震元奇枢": {
    "id": "wp_13142",
    "category": "weapon",
    "sourceName": "震元奇枢",
    "subType": "A级·防护",
    "title": "寻经定络",
    "desc": "装备者的<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[终结技]</color>造成的伤害增加<color=#2BAD00>25%</color>；队伍中任意角色受到伤害或回复生命时，为装备者回复<color=#2BAD00>2</color>点能量，5秒内最多触发一次；",
    "stats": {
      "dmgBonus": 25
    },
    "refinementDescs": [
      "装备者的<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[终结技]</color>造成的伤害增加<color=#2BAD00>25%</color>；队伍中任意角色受到伤害或回复生命时，为装备者回复<color=#2BAD00>2</color>点能量，5秒内最多触发一次；",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[终结技]</color>造成的伤害增加<color=#2BAD00>28.7%</color>；队伍中任意角色受到伤害或回复生命时，为装备者回复<color=#2BAD00>2.3</color>点能量，5秒内最多触发一次；",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[终结技]</color>造成的伤害增加<color=#2BAD00>32.5%</color>；队伍中任意角色受到伤害或回复生命时，为装备者回复<color=#2BAD00>2.6</color>点能量，5秒内最多触发一次；",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[终结技]</color>造成的伤害增加<color=#2BAD00>36.2%</color>；队伍中任意角色受到伤害或回复生命时，为装备者回复<color=#2BAD00>2.9</color>点能量，5秒内最多触发一次；",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>和<color=#FFFFFF>[终结技]</color>造成的伤害增加<color=#2BAD00>40%</color>；队伍中任意角色受到伤害或回复生命时，为装备者回复<color=#2BAD00>3.2</color>点能量，5秒内最多触发一次；"
    ],
    "refinementStats": [
      {
        "dmgBonus": 25
      },
      {
        "dmgBonus": 28.7
      },
      {
        "dmgBonus": 32.5
      },
      {
        "dmgBonus": 36.2
      },
      {
        "dmgBonus": 40
      }
    ]
  },
  "燔火胧夜": {
    "id": "wp_13144",
    "category": "weapon",
    "sourceName": "燔火胧夜",
    "subType": "A级·命破",
    "title": "笼中火",
    "desc": "装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>15%</color>；装备者的生命值降低时，暴击率提升<color=#2BAD00>15%</color>，持续5秒。",
    "stats": {
      "dmgBonus": 15,
      "critRate": 15
    },
    "refinementDescs": [
      "装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>15%</color>；装备者的生命值降低时，暴击率提升<color=#2BAD00>15%</color>，持续5秒。",
      "装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>17.25%</color>；装备者的生命值降低时，暴击率提升<color=#2BAD00>17.25%</color>，持续5秒。",
      "装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>19.5%</color>；装备者的生命值降低时，暴击率提升<color=#2BAD00>19.5%</color>，持续5秒。",
      "装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>21.75%</color>；装备者的生命值降低时，暴击率提升<color=#2BAD00>21.75%</color>，持续5秒。",
      "装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>24%</color>；装备者的生命值降低时，暴击率提升<color=#2BAD00>24%</color>，持续5秒。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 15,
        "critRate": 15
      },
      {
        "dmgBonus": 17.25,
        "critRate": 17.25
      },
      {
        "dmgBonus": 19.5,
        "critRate": 19.5
      },
      {
        "dmgBonus": 21.75,
        "critRate": 21.75
      },
      {
        "dmgBonus": 24,
        "critRate": 24
      }
    ]
  },
  "加农转子": {
    "id": "wp_14001",
    "category": "weapon",
    "sourceName": "加农转子",
    "subType": "A级·强攻",
    "title": "口径超规",
    "desc": "攻击力提升<color=#2BAD00>7.5%</color>；攻击命中敌人并触发暴击时，额外造成200%攻击力的伤害，<color=#2BAD00>8</color>秒内最多触发一次。",
    "stats": {
      "inCombatAtkPct": 7.5
    },
    "refinementDescs": [
      "攻击力提升<color=#2BAD00>7.5%</color>；攻击命中敌人并触发暴击时，额外造成200%攻击力的伤害，<color=#2BAD00>8</color>秒内最多触发一次。",
      "攻击力提升<color=#2BAD00>8.6%</color>；攻击命中敌人并触发暴击时，额外造成200%攻击力的伤害，<color=#2BAD00>7.5</color>秒内最多触发一次。",
      "攻击力提升<color=#2BAD00>9.7%</color>；攻击命中敌人并触发暴击时，额外造成200%攻击力的伤害，<color=#2BAD00>7</color>秒内最多触发一次。",
      "攻击力提升<color=#2BAD00>10.8%</color>；攻击命中敌人并触发暴击时，额外造成200%攻击力的伤害，<color=#2BAD00>6.5</color>秒内最多触发一次。",
      "攻击力提升<color=#2BAD00>12%</color>；攻击命中敌人并触发暴击时，额外造成200%攻击力的伤害，<color=#2BAD00>6</color>秒内最多触发一次。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 7.5
      },
      {
        "inCombatAtkPct": 8.6
      },
      {
        "inCombatAtkPct": 9.7
      },
      {
        "inCombatAtkPct": 10.8
      },
      {
        "inCombatAtkPct": 12
      }
    ]
  },
  "逍遥游球": {
    "id": "wp_14002",
    "category": "weapon",
    "sourceName": "逍遥游球",
    "subType": "A级·支援",
    "title": "电玩，启动！",
    "desc": "装备者攻击命中敌人时，若触发属性克制效果，则所有单位对该目标的暴击率提升<color=#2BAD00>12%</color>，持续12秒，同名被动效果之间不可叠加。",
    "stats": {
      "critRate": 12
    },
    "refinementDescs": [
      "装备者攻击命中敌人时，若触发属性克制效果，则所有单位对该目标的暴击率提升<color=#2BAD00>12%</color>，持续12秒，同名被动效果之间不可叠加。",
      "装备者攻击命中敌人时，若触发属性克制效果，则所有单位对该目标的暴击率提升<color=#2BAD00>13.5%</color>，持续12秒，同名被动效果之间不可叠加。",
      "装备者攻击命中敌人时，若触发属性克制效果，则所有单位对该目标的暴击率提升<color=#2BAD00>15.5%</color>，持续12秒，同名被动效果之间不可叠加。",
      "装备者攻击命中敌人时，若触发属性克制效果，则所有单位对该目标的暴击率提升<color=#2BAD00>17.5%</color>，持续12秒，同名被动效果之间不可叠加。",
      "装备者攻击命中敌人时，若触发属性克制效果，则所有单位对该目标的暴击率提升<color=#2BAD00>20%</color>，持续12秒，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {
        "critRate": 12
      },
      {
        "critRate": 13.5
      },
      {
        "critRate": 15.5
      },
      {
        "critRate": 17.5
      },
      {
        "critRate": 20
      }
    ]
  },
  "左轮转子": {
    "id": "wp_14003",
    "category": "weapon",
    "sourceName": "左轮转子",
    "subType": "A级·击破",
    "title": "开火！",
    "desc": "每3秒为装备者提供1层充能效果，最多叠加6层；发动<color=#FFFFFF>[强化特殊技]</color>时，消耗所有充能，每层充能效果使招式造成的失衡值提升<color=#2BAD00>4%</color>。",
    "stats": {},
    "refinementDescs": [
      "每3秒为装备者提供1层充能效果，最多叠加6层；发动<color=#FFFFFF>[强化特殊技]</color>时，消耗所有充能，每层充能效果使招式造成的失衡值提升<color=#2BAD00>4%</color>。",
      "每3秒为装备者提供1层充能效果，最多叠加6层；发动<color=#FFFFFF>[强化特殊技]</color>时，消耗所有充能，每层充能效果使招式造成的失衡值提升<color=#2BAD00>4.6%</color>。",
      "每3秒为装备者提供1层充能效果，最多叠加6层；发动<color=#FFFFFF>[强化特殊技]</color>时，消耗所有充能，每层充能效果使招式造成的失衡值提升<color=#2BAD00>5.2%</color>。",
      "每3秒为装备者提供1层充能效果，最多叠加6层；发动<color=#FFFFFF>[强化特殊技]</color>时，消耗所有充能，每层充能效果使招式造成的失衡值提升<color=#2BAD00>5.8%</color>。",
      "每3秒为装备者提供1层充能效果，最多叠加6层；发动<color=#FFFFFF>[强化特殊技]</color>时，消耗所有充能，每层充能效果使招式造成的失衡值提升<color=#2BAD00>6.4%</color>。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "钢铁肉垫": {
    "id": "wp_14102",
    "category": "weapon",
    "sourceName": "钢铁肉垫",
    "subType": "S级·强攻",
    "title": "合金猫爪",
    "desc": "<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>20%</color>；从背后攻击命中敌人时，装备者造成的伤害提升<color=#2BAD00>25%</color>。",
    "stats": {
      "dmgBonus": 45
    },
    "refinementDescs": [
      "<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>20%</color>；从背后攻击命中敌人时，装备者造成的伤害提升<color=#2BAD00>25%</color>。",
      "<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>25%</color>；从背后攻击命中敌人时，装备者造成的伤害提升<color=#2BAD00>31.5%</color>。",
      "<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>30%</color>；从背后攻击命中敌人时，装备者造成的伤害提升<color=#2BAD00>38%</color>。",
      "<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>35%</color>；从背后攻击命中敌人时，装备者造成的伤害提升<color=#2BAD00>44%</color>。",
      "<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>40%</color>；从背后攻击命中敌人时，装备者造成的伤害提升<color=#2BAD00>50%</color>。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 45
      },
      {
        "dmgBonus": 56.5
      },
      {
        "dmgBonus": 68
      },
      {
        "dmgBonus": 79
      },
      {
        "dmgBonus": 90
      }
    ]
  },
  "硫磺石": {
    "id": "wp_14104",
    "category": "weapon",
    "sourceName": "硫磺石",
    "subType": "S级·强攻",
    "title": "炽烈吐息",
    "desc": "<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>或<color=#FFFFFF>[闪避反击]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>3.5%</color>，最多叠加8层，持续8秒，0.5秒内最多触发一次，每层效果单独结算持续时间。",
    "stats": {
      "inCombatAtkPct": 28
    },
    "refinementDescs": [
      "<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>或<color=#FFFFFF>[闪避反击]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>3.5%</color>，最多叠加8层，持续8秒，0.5秒内最多触发一次，每层效果单独结算持续时间。",
      "<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>或<color=#FFFFFF>[闪避反击]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>4.4%</color>，最多叠加8层，持续8秒，0.5秒内最多触发一次，每层效果单独结算持续时间。",
      "<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>或<color=#FFFFFF>[闪避反击]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>5.2%</color>，最多叠加8层，持续8秒，0.5秒内最多触发一次，每层效果单独结算持续时间。",
      "<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>或<color=#FFFFFF>[闪避反击]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>6%</color>，最多叠加8层，持续8秒，0.5秒内最多触发一次，每层效果单独结算持续时间。",
      "<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[冲刺攻击]</color>或<color=#FFFFFF>[闪避反击]</color>命中敌人时，装备者的攻击力提升<color=#2BAD00>7%</color>，最多叠加8层，持续8秒，0.5秒内最多触发一次，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 28
      },
      {
        "inCombatAtkPct": 35.2
      },
      {
        "inCombatAtkPct": 41.6
      },
      {
        "inCombatAtkPct": 48
      },
      {
        "inCombatAtkPct": 56
      }
    ]
  },
  "海妖摇篮": {
    "id": "wp_14105",
    "category": "weapon",
    "sourceName": "海妖摇篮",
    "subType": "S级·命破",
    "title": "触抚心拥",
    "desc": "装备者的生命值降低时，造成的<color=#98EFF0>冰属性贯穿伤害</color>提升<color=#2BAD00>6%</color>，最多叠加3层，持续25秒，每层效果单独结算持续时间，0.5秒内最多触发一次；装备者生命值降低至最大值的50%时，暴击率提升<color=#2BAD00>20%</color>。",
    "stats": {
      "ppDmgBonus": 18,
      "critRate": 20
    },
    "refinementDescs": [
      "装备者的生命值降低时，造成的<color=#98EFF0>冰属性贯穿伤害</color>提升<color=#2BAD00>6%</color>，最多叠加3层，持续25秒，每层效果单独结算持续时间，0.5秒内最多触发一次；装备者生命值降低至最大值的50%时，暴击率提升<color=#2BAD00>20%</color>。",
      "装备者的生命值降低时，造成的<color=#98EFF0>冰属性贯穿伤害</color>提升<color=#2BAD00>7%</color>，最多叠加3层，持续25秒，每层效果单独结算持续时间，0.5秒内最多触发一次；装备者生命值降低至最大值的50%时，暴击率提升<color=#2BAD00>23%</color>。",
      "装备者的生命值降低时，造成的<color=#98EFF0>冰属性贯穿伤害</color>提升<color=#2BAD00>8%</color>，最多叠加3层，持续25秒，每层效果单独结算持续时间，0.5秒内最多触发一次；装备者生命值降低至最大值的50%时，暴击率提升<color=#2BAD00>26%</color>。",
      "装备者的生命值降低时，造成的<color=#98EFF0>冰属性贯穿伤害</color>提升<color=#2BAD00>9%</color>，最多叠加3层，持续25秒，每层效果单独结算持续时间，0.5秒内最多触发一次；装备者生命值降低至最大值的50%时，暴击率提升<color=#2BAD00>29%</color>。",
      "装备者的生命值降低时，造成的<color=#98EFF0>冰属性贯穿伤害</color>提升<color=#2BAD00>10%</color>，最多叠加3层，持续25秒，每层效果单独结算持续时间，0.5秒内最多触发一次；装备者生命值降低至最大值的50%时，暴击率提升<color=#2BAD00>32%</color>。"
    ],
    "refinementStats": [
      {
        "ppDmgBonus": 18,
        "critRate": 20
      },
      {
        "ppDmgBonus": 21,
        "critRate": 23
      },
      {
        "ppDmgBonus": 24,
        "critRate": 26
      },
      {
        "ppDmgBonus": 27,
        "critRate": 29
      },
      {
        "ppDmgBonus": 30,
        "critRate": 32
      }
    ]
  },
  "奔袭獠牙": {
    "id": "wp_14107",
    "category": "weapon",
    "sourceName": "奔袭獠牙",
    "subType": "S级·防护",
    "title": "不破铁骑",
    "desc": "装备者施加的护盾值提升<color=#2BAD00>30%</color>；队伍中任意角色触发<color=#FFFFFF>[破招]</color>或<color=#FFFFFF>[极限闪避]</color>时，全队角色造成的伤害提升<color=#2BAD00>18%</color>，造成的失衡值提升<color=#2BAD00>12%</color>，持续20秒，同名被动效果之间不可叠加。",
    "stats": {
      "dmgBonus": 18
    },
    "refinementDescs": [
      "装备者施加的护盾值提升<color=#2BAD00>30%</color>；队伍中任意角色触发<color=#FFFFFF>[破招]</color>或<color=#FFFFFF>[极限闪避]</color>时，全队角色造成的伤害提升<color=#2BAD00>18%</color>，造成的失衡值提升<color=#2BAD00>12%</color>，持续20秒，同名被动效果之间不可叠加。",
      "装备者施加的护盾值提升<color=#2BAD00>38%</color>；队伍中任意角色触发<color=#FFFFFF>[破招]</color>或<color=#FFFFFF>[极限闪避]</color>时，全队角色造成的伤害提升<color=#2BAD00>22.5%</color>，造成的失衡值提升<color=#2BAD00>15%</color>，持续20秒，同名被动效果之间不可叠加。",
      "装备者施加的护盾值提升<color=#2BAD00>46%</color>；队伍中任意角色触发<color=#FFFFFF>[破招]</color>或<color=#FFFFFF>[极限闪避]</color>时，全队角色造成的伤害提升<color=#2BAD00>27%</color>，造成的失衡值提升<color=#2BAD00>18%</color>，持续20秒，同名被动效果之间不可叠加。",
      "装备者施加的护盾值提升<color=#2BAD00>52%</color>；队伍中任意角色触发<color=#FFFFFF>[破招]</color>或<color=#FFFFFF>[极限闪避]</color>时，全队角色造成的伤害提升<color=#2BAD00>31.5%</color>，造成的失衡值提升<color=#2BAD00>21%</color>，持续20秒，同名被动效果之间不可叠加。",
      "装备者施加的护盾值提升<color=#2BAD00>60%</color>；队伍中任意角色触发<color=#FFFFFF>[破招]</color>或<color=#FFFFFF>[极限闪避]</color>时，全队角色造成的伤害提升<color=#2BAD00>36%</color>，造成的失衡值提升<color=#2BAD00>24%</color>，持续20秒，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 18
      },
      {
        "dmgBonus": 22.5
      },
      {
        "dmgBonus": 27
      },
      {
        "dmgBonus": 31.5
      },
      {
        "dmgBonus": 36
      }
    ]
  },
  "霰落星殿": {
    "id": "wp_14109",
    "category": "weapon",
    "sourceName": "霰落星殿",
    "subType": "S级·异常",
    "title": "霜染寒星",
    "desc": "暴击伤害提升<color=#2BAD00>50%</color>；发动<color=#FFFFFF>[强化特殊技]</color>或队伍中任意角色对敌人施加属性异常效果时，装备者造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>20%</color>，最多叠加2层，持续15秒，每层效果单独结算持续时间。",
    "stats": {
      "critDmg": 50,
      "dmgBonus": 40
    },
    "refinementDescs": [
      "暴击伤害提升<color=#2BAD00>50%</color>；发动<color=#FFFFFF>[强化特殊技]</color>或队伍中任意角色对敌人施加属性异常效果时，装备者造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>20%</color>，最多叠加2层，持续15秒，每层效果单独结算持续时间。",
      "暴击伤害提升<color=#2BAD00>57%</color>；发动<color=#FFFFFF>[强化特殊技]</color>或队伍中任意角色对敌人施加属性异常效果时，装备者造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>23%</color>，最多叠加2层，持续15秒，每层效果单独结算持续时间。",
      "暴击伤害提升<color=#2BAD00>65%</color>；发动<color=#FFFFFF>[强化特殊技]</color>或队伍中任意角色对敌人施加属性异常效果时，装备者造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>26%</color>，最多叠加2层，持续15秒，每层效果单独结算持续时间。",
      "暴击伤害提升<color=#2BAD00>72%</color>；发动<color=#FFFFFF>[强化特殊技]</color>或队伍中任意角色对敌人施加属性异常效果时，装备者造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>29%</color>，最多叠加2层，持续15秒，每层效果单独结算持续时间。",
      "暴击伤害提升<color=#2BAD00>80%</color>；发动<color=#FFFFFF>[强化特殊技]</color>或队伍中任意角色对敌人施加属性异常效果时，装备者造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>32%</color>，最多叠加2层，持续15秒，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {
        "critDmg": 50,
        "dmgBonus": 40
      },
      {
        "critDmg": 57,
        "dmgBonus": 46
      },
      {
        "critDmg": 65,
        "dmgBonus": 52
      },
      {
        "critDmg": 72,
        "dmgBonus": 58
      },
      {
        "critDmg": 80,
        "dmgBonus": 64
      }
    ]
  },
  "燃狱齿轮": {
    "id": "wp_14110",
    "category": "weapon",
    "sourceName": "燃狱齿轮",
    "subType": "S级·击破",
    "title": "热血施工",
    "desc": "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.6</color>点/秒；发动<color=#FFFFFF>[强化特殊技]</color>时，装备者的冲击力提升<color=#2BAD00>10%</color>，最多叠加2层，持续10秒，每层效果单独结算持续时间。",
    "stats": {},
    "refinementDescs": [
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.6</color>点/秒；发动<color=#FFFFFF>[强化特殊技]</color>时，装备者的冲击力提升<color=#2BAD00>10%</color>，最多叠加2层，持续10秒，每层效果单独结算持续时间。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.75</color>点/秒；发动<color=#FFFFFF>[强化特殊技]</color>时，装备者的冲击力提升<color=#2BAD00>12.5%</color>，最多叠加2层，持续10秒，每层效果单独结算持续时间。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.9</color>点/秒；发动<color=#FFFFFF>[强化特殊技]</color>时，装备者的冲击力提升<color=#2BAD00>15%</color>，最多叠加2层，持续10秒，每层效果单独结算持续时间。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.05</color>点/秒；发动<color=#FFFFFF>[强化特殊技]</color>时，装备者的冲击力提升<color=#2BAD00>17.5%</color>，最多叠加2层，持续10秒，每层效果单独结算持续时间。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.2</color>点/秒；发动<color=#FFFFFF>[强化特殊技]</color>时，装备者的冲击力提升<color=#2BAD00>20%</color>，最多叠加2层，持续10秒，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "拘缚者": {
    "id": "wp_14114",
    "category": "weapon",
    "sourceName": "拘缚者",
    "subType": "S级·击破",
    "title": "束缚枷锁",
    "desc": "攻击命中敌人时，<color=#FFFFFF>[普通攻击]</color>造成的伤害和失衡值提升<color=#2BAD00>6%</color>，最多叠加5层，持续8秒，同一招式内最多触发一次，每层效果单独结算持续时间。",
    "stats": {},
    "refinementDescs": [
      "攻击命中敌人时，<color=#FFFFFF>[普通攻击]</color>造成的伤害和失衡值提升<color=#2BAD00>6%</color>，最多叠加5层，持续8秒，同一招式内最多触发一次，每层效果单独结算持续时间。",
      "攻击命中敌人时，<color=#FFFFFF>[普通攻击]</color>造成的伤害和失衡值提升<color=#2BAD00>7.5%</color>，最多叠加5层，持续8秒，同一招式内最多触发一次，每层效果单独结算持续时间。",
      "攻击命中敌人时，<color=#FFFFFF>[普通攻击]</color>造成的伤害和失衡值提升<color=#2BAD00>9%</color>，最多叠加5层，持续8秒，同一招式内最多触发一次，每层效果单独结算持续时间。",
      "攻击命中敌人时，<color=#FFFFFF>[普通攻击]</color>造成的伤害和失衡值提升<color=#2BAD00>10.5%</color>，最多叠加5层，持续8秒，同一招式内最多触发一次，每层效果单独结算持续时间。",
      "攻击命中敌人时，<color=#FFFFFF>[普通攻击]</color>造成的伤害和失衡值提升<color=#2BAD00>12%</color>，最多叠加5层，持续8秒，同一招式内最多触发一次，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {},
      {},
      {},
      {},
      {}
    ]
  },
  "焰心桂冠": {
    "id": "wp_14116",
    "category": "weapon",
    "sourceName": "焰心桂冠",
    "subType": "S级·击破",
    "title": "流动之火",
    "desc": "发动<color=#FFFFFF>[快速支援]</color>或<color=#FFFFFF>[极限支援]</color>时，装备者的冲击力提升<color=#2BAD00>25%</color>，持续8秒；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，对目标施加一层<color=#FFFFFF>[萎靡]</color>，最多叠加20层，持续30秒，重复触发时刷新持续时间；队伍中任意角色攻击命中敌人时，目标每拥有一层<color=#FFFFFF>[萎靡]</color>，本次攻击中<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>的暴击伤害提升<color=#2BAD00>1.5%</color>，该效果全队唯一。",
    "stats": {
      "critDmg": 30
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[快速支援]</color>或<color=#FFFFFF>[极限支援]</color>时，装备者的冲击力提升<color=#2BAD00>25%</color>，持续8秒；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，对目标施加一层<color=#FFFFFF>[萎靡]</color>，最多叠加20层，持续30秒，重复触发时刷新持续时间；队伍中任意角色攻击命中敌人时，目标每拥有一层<color=#FFFFFF>[萎靡]</color>，本次攻击中<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>的暴击伤害提升<color=#2BAD00>1.5%</color>，该效果全队唯一。",
      "发动<color=#FFFFFF>[快速支援]</color>或<color=#FFFFFF>[极限支援]</color>时，装备者的冲击力提升<color=#2BAD00>28.75%</color>，持续8秒；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，对目标施加一层<color=#FFFFFF>[萎靡]</color>，最多叠加20层，持续30秒，重复触发时刷新持续时间；队伍中任意角色攻击命中敌人时，目标每拥有一层<color=#FFFFFF>[萎靡]</color>，本次攻击中<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>的暴击伤害提升<color=#2BAD00>1.72%</color>，该效果全队唯一。",
      "发动<color=#FFFFFF>[快速支援]</color>或<color=#FFFFFF>[极限支援]</color>时，装备者的冲击力提升<color=#2BAD00>32.5%</color>，持续8秒；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，对目标施加一层<color=#FFFFFF>[萎靡]</color>，最多叠加20层，持续30秒，重复触发时刷新持续时间；队伍中任意角色攻击命中敌人时，目标每拥有一层<color=#FFFFFF>[萎靡]</color>，本次攻击中<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>的暴击伤害提升<color=#2BAD00>1.95%</color>，该效果全队唯一。",
      "发动<color=#FFFFFF>[快速支援]</color>或<color=#FFFFFF>[极限支援]</color>时，装备者的冲击力提升<color=#2BAD00>36.25%</color>，持续8秒；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，对目标施加一层<color=#FFFFFF>[萎靡]</color>，最多叠加20层，持续30秒，重复触发时刷新持续时间；队伍中任意角色攻击命中敌人时，目标每拥有一层<color=#FFFFFF>[萎靡]</color>，本次攻击中<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>的暴击伤害提升<color=#2BAD00>2.17%</color>，该效果全队唯一。",
      "发动<color=#FFFFFF>[快速支援]</color>或<color=#FFFFFF>[极限支援]</color>时，装备者的冲击力提升<color=#2BAD00>40%</color>，持续8秒；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，对目标施加一层<color=#FFFFFF>[萎靡]</color>，最多叠加20层，持续30秒，重复触发时刷新持续时间；队伍中任意角色攻击命中敌人时，目标每拥有一层<color=#FFFFFF>[萎靡]</color>，本次攻击中<color=#98EFF0>冰属性伤害</color>和<color=#FF5521>火属性伤害</color>的暴击伤害提升<color=#2BAD00>2.4%</color>，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "critDmg": 30
      },
      {
        "critDmg": 34.5
      },
      {
        "critDmg": 39
      },
      {
        "critDmg": 43.5
      },
      {
        "critDmg": 48
      }
    ]
  },
  "灼心摇壶": {
    "id": "wp_14117",
    "category": "weapon",
    "sourceName": "灼心摇壶",
    "subType": "S级·异常",
    "title": "焦油斟注",
    "desc": "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.6</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者造成的伤害提升<color=#2BAD00>3.5%</color>，最多叠加10层，持续6秒，0.3秒内最多触发一次，位于后场时叠加效率翻倍，重复触发时刷新持续时间；获得伤害提升效果时，若叠加层数大于等于5层，则装备者的异常精通额外提升<color=#2BAD00>50</color>点，异常精通提升效果不可叠加，持续6秒。",
    "stats": {
      "dmgBonus": 35,
      "anomalyMastery": 50
    },
    "refinementDescs": [
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.6</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者造成的伤害提升<color=#2BAD00>3.5%</color>，最多叠加10层，持续6秒，0.3秒内最多触发一次，位于后场时叠加效率翻倍，重复触发时刷新持续时间；获得伤害提升效果时，若叠加层数大于等于5层，则装备者的异常精通额外提升<color=#2BAD00>50</color>点，异常精通提升效果不可叠加，持续6秒。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.75</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者造成的伤害提升<color=#2BAD00>4.4%</color>，最多叠加10层，持续6秒，0.3秒内最多触发一次，位于后场时叠加效率翻倍，重复触发时刷新持续时间；获得伤害提升效果时，若叠加层数大于等于5层，则装备者的异常精通额外提升<color=#2BAD00>62</color>点，异常精通提升效果不可叠加，持续6秒。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.9</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者造成的伤害提升<color=#2BAD00>5.2%</color>，最多叠加10层，持续6秒，0.3秒内最多触发一次，位于后场时叠加效率翻倍，重复触发时刷新持续时间；获得伤害提升效果时，若叠加层数大于等于5层，则装备者的异常精通额外提升<color=#2BAD00>75</color>点，异常精通提升效果不可叠加，持续6秒。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.05</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者造成的伤害提升<color=#2BAD00>6.1%</color>，最多叠加10层，持续6秒，0.3秒内最多触发一次，位于后场时叠加效率翻倍，重复触发时刷新持续时间；获得伤害提升效果时，若叠加层数大于等于5层，则装备者的异常精通额外提升<color=#2BAD00>87</color>点，异常精通提升效果不可叠加，持续6秒。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.2</color>点/秒；<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[支援攻击]</color>命中敌人时，装备者造成的伤害提升<color=#2BAD00>7%</color>，最多叠加10层，持续6秒，0.3秒内最多触发一次，位于后场时叠加效率翻倍，重复触发时刷新持续时间；获得伤害提升效果时，若叠加层数大于等于5层，则装备者的异常精通额外提升<color=#2BAD00>100</color>点，异常精通提升效果不可叠加，持续6秒。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 35,
        "anomalyMastery": 50
      },
      {
        "dmgBonus": 44,
        "anomalyMastery": 62
      },
      {
        "dmgBonus": 52,
        "anomalyMastery": 75
      },
      {
        "dmgBonus": 61,
        "anomalyMastery": 87
      },
      {
        "dmgBonus": 70,
        "anomalyMastery": 100
      }
    ]
  },
  "嵌合编译器": {
    "id": "wp_14118",
    "category": "weapon",
    "sourceName": "嵌合编译器",
    "subType": "S级·异常",
    "title": "数据洪流",
    "desc": "攻击力提升<color=#2BAD00>12%</color>；发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，装备者的异常精通提升<color=#2BAD00>25</color>点，最多叠加3层，持续8秒，每层效果单独结算持续时间。",
    "stats": {
      "inCombatAtkPct": 12,
      "anomalyMastery": 75
    },
    "refinementDescs": [
      "攻击力提升<color=#2BAD00>12%</color>；发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，装备者的异常精通提升<color=#2BAD00>25</color>点，最多叠加3层，持续8秒，每层效果单独结算持续时间。",
      "攻击力提升<color=#2BAD00>15%</color>；发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，装备者的异常精通提升<color=#2BAD00>31</color>点，最多叠加3层，持续8秒，每层效果单独结算持续时间。",
      "攻击力提升<color=#2BAD00>18%</color>；发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，装备者的异常精通提升<color=#2BAD00>37</color>点，最多叠加3层，持续8秒，每层效果单独结算持续时间。",
      "攻击力提升<color=#2BAD00>21%</color>；发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，装备者的异常精通提升<color=#2BAD00>43</color>点，最多叠加3层，持续8秒，每层效果单独结算持续时间。",
      "攻击力提升<color=#2BAD00>24%</color>；发动<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>时，装备者的异常精通提升<color=#2BAD00>50</color>点，最多叠加3层，持续8秒，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 12,
        "anomalyMastery": 75
      },
      {
        "inCombatAtkPct": 15,
        "anomalyMastery": 93
      },
      {
        "inCombatAtkPct": 18,
        "anomalyMastery": 111
      },
      {
        "inCombatAtkPct": 21,
        "anomalyMastery": 129
      },
      {
        "inCombatAtkPct": 24,
        "anomalyMastery": 150
      }
    ]
  },
  "深海访客": {
    "id": "wp_14119",
    "category": "weapon",
    "sourceName": "深海访客",
    "subType": "S级·强攻",
    "title": "诸洋之王",
    "desc": "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>25%</color>；<color=#FFFFFF>[普通攻击]</color>命中敌人时，装备者的暴击率提升<color=#2BAD00>10%</color>，持续8秒；<color=#FFFFFF>[冲刺攻击]</color>造成<color=#98EFF0>冰属性伤害</color>时，装备者的暴击率额外提升<color=#2BAD00>10%</color>，持续15秒，每种增益效果单独结算持续时间。",
    "stats": {
      "dmgBonus": 25,
      "critRate": 20
    },
    "refinementDescs": [
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>25%</color>；<color=#FFFFFF>[普通攻击]</color>命中敌人时，装备者的暴击率提升<color=#2BAD00>10%</color>，持续8秒；<color=#FFFFFF>[冲刺攻击]</color>造成<color=#98EFF0>冰属性伤害</color>时，装备者的暴击率额外提升<color=#2BAD00>10%</color>，持续15秒，每种增益效果单独结算持续时间。",
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>31.5%</color>；<color=#FFFFFF>[普通攻击]</color>命中敌人时，装备者的暴击率提升<color=#2BAD00>12.5%</color>，持续8秒；<color=#FFFFFF>[冲刺攻击]</color>造成<color=#98EFF0>冰属性伤害</color>时，装备者的暴击率额外提升<color=#2BAD00>12.5%</color>，持续15秒，每种增益效果单独结算持续时间。",
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>38%</color>；<color=#FFFFFF>[普通攻击]</color>命中敌人时，装备者的暴击率提升<color=#2BAD00>15%</color>，持续8秒；<color=#FFFFFF>[冲刺攻击]</color>造成<color=#98EFF0>冰属性伤害</color>时，装备者的暴击率额外提升<color=#2BAD00>15%</color>，持续15秒，每种增益效果单独结算持续时间。",
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>44.5%</color>；<color=#FFFFFF>[普通攻击]</color>命中敌人时，装备者的暴击率提升<color=#2BAD00>17.5%</color>，持续8秒；<color=#FFFFFF>[冲刺攻击]</color>造成<color=#98EFF0>冰属性伤害</color>时，装备者的暴击率额外提升<color=#2BAD00>17.5%</color>，持续15秒，每种增益效果单独结算持续时间。",
      "<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>50%</color>；<color=#FFFFFF>[普通攻击]</color>命中敌人时，装备者的暴击率提升<color=#2BAD00>20%</color>，持续8秒；<color=#FFFFFF>[冲刺攻击]</color>造成<color=#98EFF0>冰属性伤害</color>时，装备者的暴击率额外提升<color=#2BAD00>20%</color>，持续15秒，每种增益效果单独结算持续时间。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 25,
        "critRate": 20
      },
      {
        "dmgBonus": 31.5,
        "critRate": 25
      },
      {
        "dmgBonus": 38,
        "critRate": 30
      },
      {
        "dmgBonus": 44.5,
        "critRate": 35
      },
      {
        "dmgBonus": 50,
        "critRate": 40
      }
    ]
  },
  "残心青囊": {
    "id": "wp_14120",
    "category": "weapon",
    "sourceName": "残心青囊",
    "subType": "S级·强攻",
    "title": "啖若逆修",
    "desc": "暴击率提升<color=#2BAD00>10%</color>；<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>40%</color>；队伍中任意角色对敌人施加属性异常效果或造成失衡时，装备者的暴击率额外提升<color=#2BAD00>10%</color>，持续15秒。",
    "stats": {
      "critRate": 20,
      "dmgBonus": 40
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>10%</color>；<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>40%</color>；队伍中任意角色对敌人施加属性异常效果或造成失衡时，装备者的暴击率额外提升<color=#2BAD00>10%</color>，持续15秒。",
      "暴击率提升<color=#2BAD00>11.5%</color>；<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>46%</color>；队伍中任意角色对敌人施加属性异常效果或造成失衡时，装备者的暴击率额外提升<color=#2BAD00>11.5%</color>，持续15秒。",
      "暴击率提升<color=#2BAD00>13%</color>；<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>52%</color>；队伍中任意角色对敌人施加属性异常效果或造成失衡时，装备者的暴击率额外提升<color=#2BAD00>13%</color>，持续15秒。",
      "暴击率提升<color=#2BAD00>14.5%</color>；<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>58%</color>；队伍中任意角色对敌人施加属性异常效果或造成失衡时，装备者的暴击率额外提升<color=#2BAD00>14.5%</color>，持续15秒。",
      "暴击率提升<color=#2BAD00>16%</color>；<color=#FFFFFF>[冲刺攻击]</color>造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>64%</color>；队伍中任意角色对敌人施加属性异常效果或造成失衡时，装备者的暴击率额外提升<color=#2BAD00>16%</color>，持续15秒。"
    ],
    "refinementStats": [
      {
        "critRate": 20,
        "dmgBonus": 40
      },
      {
        "critRate": 23,
        "dmgBonus": 46
      },
      {
        "critRate": 26,
        "dmgBonus": 52
      },
      {
        "critRate": 29,
        "dmgBonus": 58
      },
      {
        "critRate": 32,
        "dmgBonus": 64
      }
    ]
  },
  "啜泣摇篮": {
    "id": "wp_14121",
    "category": "weapon",
    "sourceName": "啜泣摇篮",
    "subType": "S级·支援",
    "title": "惩·罚",
    "desc": "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.6</color>点/秒；装备者攻击命中敌人时，所有单位对目标造成的伤害提升<color=#2BAD00>10%</color>，持续3秒；效果持续期间，每0.5秒该增益效果额外提升<color=#2BAD00>1.7%</color>，最多额外提升<color=#2BAD00>10.2%</color>，重复触发时仅刷新持续时间，不刷新伤害提升效果，同名被动效果之间不可叠加。",
    "stats": {
      "dmgBonus": 20.8
    },
    "refinementDescs": [
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.6</color>点/秒；装备者攻击命中敌人时，所有单位对目标造成的伤害提升<color=#2BAD00>10%</color>，持续3秒；效果持续期间，每0.5秒该增益效果额外提升<color=#2BAD00>1.7%</color>，最多额外提升<color=#2BAD00>10.2%</color>，重复触发时仅刷新持续时间，不刷新伤害提升效果，同名被动效果之间不可叠加。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.75</color>点/秒；装备者攻击命中敌人时，所有单位对目标造成的伤害提升<color=#2BAD00>12.5%</color>，持续3秒；效果持续期间，每0.5秒该增益效果额外提升<color=#2BAD00>2%</color>，最多额外提升<color=#2BAD00>12%</color>，重复触发时仅刷新持续时间，不刷新伤害提升效果，同名被动效果之间不可叠加。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>0.9</color>点/秒；装备者攻击命中敌人时，所有单位对目标造成的伤害提升<color=#2BAD00>15%</color>，持续3秒；效果持续期间，每0.5秒该增益效果额外提升<color=#2BAD00>2.5%</color>，最多额外提升<color=#2BAD00>15%</color>，重复触发时仅刷新持续时间，不刷新伤害提升效果，同名被动效果之间不可叠加。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.05</color>点/秒；装备者攻击命中敌人时，所有单位对目标造成的伤害提升<color=#2BAD00>17.5%</color>，持续3秒；效果持续期间，每0.5秒该增益效果额外提升<color=#2BAD00>3%</color>，最多额外提升<color=#2BAD00>18%</color>，重复触发时仅刷新持续时间，不刷新伤害提升效果，同名被动效果之间不可叠加。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.2</color>点/秒；装备者攻击命中敌人时，所有单位对目标造成的伤害提升<color=#2BAD00>20%</color>，持续3秒；效果持续期间，每0.5秒该增益效果额外提升<color=#2BAD00>3.3%</color>，最多额外提升<color=#2BAD00>19.8%</color>，重复触发时仅刷新持续时间，不刷新伤害提升效果，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 20.8
      },
      {
        "dmgBonus": 24.5
      },
      {
        "dmgBonus": 28.2
      },
      {
        "dmgBonus": 31.9
      },
      {
        "dmgBonus": 35.6
      }
    ]
  },
  "时流贤者": {
    "id": "wp_14122",
    "category": "weapon",
    "sourceName": "时流贤者",
    "subType": "S级·异常",
    "title": "时喰奇谋",
    "desc": "装备者的<color=#2EB6FF>电属性异常积蓄效率</color>提升<color=#2BAD00>30%</color>；<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>命中处于属性异常状态下的敌人时，装备者的异常精通提升<color=#2BAD00>75</color>点，持续15秒；\n当装备者的异常精通大于等于375点时，由装备者造成的<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>25%</color>。",
    "stats": {
      "anomalyMastery": 75,
      "dmgBonus": 25
    },
    "refinementDescs": [
      "装备者的<color=#2EB6FF>电属性异常积蓄效率</color>提升<color=#2BAD00>30%</color>；<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>命中处于属性异常状态下的敌人时，装备者的异常精通提升<color=#2BAD00>75</color>点，持续15秒；\n当装备者的异常精通大于等于375点时，由装备者造成的<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>25%</color>。",
      "装备者的<color=#2EB6FF>电属性异常积蓄效率</color>提升<color=#2BAD00>35%</color>；<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>命中处于属性异常状态下的敌人时，装备者的异常精通提升<color=#2BAD00>85</color>点，持续15秒；\n当装备者的异常精通大于等于375点时，由装备者造成的<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>27.5%</color>。",
      "装备者的<color=#2EB6FF>电属性异常积蓄效率</color>提升<color=#2BAD00>40%</color>；<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>命中处于属性异常状态下的敌人时，装备者的异常精通提升<color=#2BAD00>95</color>点，持续15秒；\n当装备者的异常精通大于等于375点时，由装备者造成的<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>30%</color>。",
      "装备者的<color=#2EB6FF>电属性异常积蓄效率</color>提升<color=#2BAD00>45%</color>；<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>命中处于属性异常状态下的敌人时，装备者的异常精通提升<color=#2BAD00>105</color>点，持续15秒；\n当装备者的异常精通大于等于375点时，由装备者造成的<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>32.5%</color>。",
      "装备者的<color=#2EB6FF>电属性异常积蓄效率</color>提升<color=#2BAD00>50%</color>；<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[强化特殊技]</color>命中处于属性异常状态下的敌人时，装备者的异常精通提升<color=#2BAD00>115</color>点，持续15秒；\n当装备者的异常精通大于等于375点时，由装备者造成的<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>35%</color>。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 75,
        "dmgBonus": 25
      },
      {
        "anomalyMastery": 85,
        "dmgBonus": 27.5
      },
      {
        "anomalyMastery": 95,
        "dmgBonus": 30
      },
      {
        "anomalyMastery": 105,
        "dmgBonus": 32.5
      },
      {
        "anomalyMastery": 115,
        "dmgBonus": 35
      }
    ]
  },
  "防暴者Ⅵ型": {
    "id": "wp_14124",
    "category": "weapon",
    "sourceName": "防暴者Ⅵ型",
    "subType": "S级·强攻",
    "title": "安全巡查",
    "desc": "暴击率提升<color=#2BAD00>15%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，为装备者提供8层充能效果，最多叠加8层；<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>造成<color=#FE437E>以太伤害</color>时，消耗1层充能，使当前招式造成的伤害提升<color=#2BAD00>35%</color>。",
    "stats": {
      "critRate": 15,
      "dmgBonus": 35
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>15%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，为装备者提供8层充能效果，最多叠加8层；<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>造成<color=#FE437E>以太伤害</color>时，消耗1层充能，使当前招式造成的伤害提升<color=#2BAD00>35%</color>。",
      "暴击率提升<color=#2BAD00>18.8%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，为装备者提供8层充能效果，最多叠加8层；<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>造成<color=#FE437E>以太伤害</color>时，消耗1层充能，使当前招式造成的伤害提升<color=#2BAD00>43.5%</color>。",
      "暴击率提升<color=#2BAD00>22.6%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，为装备者提供8层充能效果，最多叠加8层；<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>造成<color=#FE437E>以太伤害</color>时，消耗1层充能，使当前招式造成的伤害提升<color=#2BAD00>52%</color>。",
      "暴击率提升<color=#2BAD00>26.4%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，为装备者提供8层充能效果，最多叠加8层；<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>造成<color=#FE437E>以太伤害</color>时，消耗1层充能，使当前招式造成的伤害提升<color=#2BAD00>60.5%</color>。",
      "暴击率提升<color=#2BAD00>30%</color>；发动<color=#FFFFFF>[强化特殊技]</color>时，为装备者提供8层充能效果，最多叠加8层；<color=#FFFFFF>[普通攻击]</color>或<color=#FFFFFF>[冲刺攻击]</color>造成<color=#FE437E>以太伤害</color>时，消耗1层充能，使当前招式造成的伤害提升<color=#2BAD00>70%</color>。"
    ],
    "refinementStats": [
      {
        "critRate": 15,
        "dmgBonus": 35
      },
      {
        "critRate": 18.8,
        "dmgBonus": 43.5
      },
      {
        "critRate": 22.6,
        "dmgBonus": 52
      },
      {
        "critRate": 26.4,
        "dmgBonus": 60.5
      },
      {
        "critRate": 30,
        "dmgBonus": 70
      }
    ]
  },
  "玉壶青冰": {
    "id": "wp_14125",
    "category": "weapon",
    "sourceName": "玉壶青冰",
    "subType": "S级·击破",
    "title": "泠泠连奏",
    "desc": "<color=#FFFFFF>[普通攻击]</color>命中敌人时，获得1层<color=#FFFFFF>[茶劲]</color>，每层<color=#FFFFFF>[茶劲]</color>使装备者的冲击力提升<color=#2BAD00>0.7%</color>，最多叠加30层，持续8秒，每层效果单独结算持续时间；获得<color=#FFFFFF>[茶劲]</color>时，若装备者拥有的<color=#FFFFFF>[茶劲]</color>层数大于等于15层，全队角色造成的伤害提升<color=#2BAD00>20%</color>，持续10秒，同名被动效果之间不可叠加。",
    "stats": {
      "dmgBonus": 20
    },
    "refinementDescs": [
      "<color=#FFFFFF>[普通攻击]</color>命中敌人时，获得1层<color=#FFFFFF>[茶劲]</color>，每层<color=#FFFFFF>[茶劲]</color>使装备者的冲击力提升<color=#2BAD00>0.7%</color>，最多叠加30层，持续8秒，每层效果单独结算持续时间；获得<color=#FFFFFF>[茶劲]</color>时，若装备者拥有的<color=#FFFFFF>[茶劲]</color>层数大于等于15层，全队角色造成的伤害提升<color=#2BAD00>20%</color>，持续10秒，同名被动效果之间不可叠加。",
      "<color=#FFFFFF>[普通攻击]</color>命中敌人时，获得1层<color=#FFFFFF>[茶劲]</color>，每层<color=#FFFFFF>[茶劲]</color>使装备者的冲击力提升<color=#2BAD00>0.88%</color>，最多叠加30层，持续8秒，每层效果单独结算持续时间；获得<color=#FFFFFF>[茶劲]</color>时，若装备者拥有的<color=#FFFFFF>[茶劲]</color>层数大于等于15层，全队角色造成的伤害提升<color=#2BAD00>23%</color>，持续10秒，同名被动效果之间不可叠加。",
      "<color=#FFFFFF>[普通攻击]</color>命中敌人时，获得1层<color=#FFFFFF>[茶劲]</color>，每层<color=#FFFFFF>[茶劲]</color>使装备者的冲击力提升<color=#2BAD00>1.05%</color>，最多叠加30层，持续8秒，每层效果单独结算持续时间；获得<color=#FFFFFF>[茶劲]</color>时，若装备者拥有的<color=#FFFFFF>[茶劲]</color>层数大于等于15层，全队角色造成的伤害提升<color=#2BAD00>26%</color>，持续10秒，同名被动效果之间不可叠加。",
      "<color=#FFFFFF>[普通攻击]</color>命中敌人时，获得1层<color=#FFFFFF>[茶劲]</color>，每层<color=#FFFFFF>[茶劲]</color>使装备者的冲击力提升<color=#2BAD00>1.22%</color>，最多叠加30层，持续8秒，每层效果单独结算持续时间；获得<color=#FFFFFF>[茶劲]</color>时，若装备者拥有的<color=#FFFFFF>[茶劲]</color>层数大于等于15层，全队角色造成的伤害提升<color=#2BAD00>29%</color>，持续10秒，同名被动效果之间不可叠加。",
      "<color=#FFFFFF>[普通攻击]</color>命中敌人时，获得1层<color=#FFFFFF>[茶劲]</color>，每层<color=#FFFFFF>[茶劲]</color>使装备者的冲击力提升<color=#2BAD00>1.4%</color>，最多叠加30层，持续8秒，每层效果单独结算持续时间；获得<color=#FFFFFF>[茶劲]</color>时，若装备者拥有的<color=#FFFFFF>[茶劲]</color>层数大于等于15层，全队角色造成的伤害提升<color=#2BAD00>32%</color>，持续10秒，同名被动效果之间不可叠加。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 20
      },
      {
        "dmgBonus": 23
      },
      {
        "dmgBonus": 26
      },
      {
        "dmgBonus": 29
      },
      {
        "dmgBonus": 32
      }
    ]
  },
  "淬锋钳刺": {
    "id": "wp_14126",
    "category": "weapon",
    "sourceName": "淬锋钳刺",
    "subType": "S级·异常",
    "title": "恣横猎心",
    "desc": "发动<color=#FFFFFF>[冲刺攻击]</color>时，获得1层<color=#FFFFFF>[猎意]</color>，每层<color=#FFFFFF>[猎意]</color>使装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>12%</color>，最多叠加3层，持续10秒，0.5秒内最多触发一次，重复触发时刷新持续时间；进入接战状态或触发<color=#FFFFFF>[极限闪避]</color>时，直接获得3层<color=#FFFFFF>[猎意]</color>；<color=#FFFFFF>[猎意]</color>叠加至层数上限后，装备者的属性异常积蓄效率提升<color=#2BAD00>40%</color>。",
    "stats": {
      "dmgBonus": 36
    },
    "refinementDescs": [
      "发动<color=#FFFFFF>[冲刺攻击]</color>时，获得1层<color=#FFFFFF>[猎意]</color>，每层<color=#FFFFFF>[猎意]</color>使装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>12%</color>，最多叠加3层，持续10秒，0.5秒内最多触发一次，重复触发时刷新持续时间；进入接战状态或触发<color=#FFFFFF>[极限闪避]</color>时，直接获得3层<color=#FFFFFF>[猎意]</color>；<color=#FFFFFF>[猎意]</color>叠加至层数上限后，装备者的属性异常积蓄效率提升<color=#2BAD00>40%</color>。",
      "发动<color=#FFFFFF>[冲刺攻击]</color>时，获得1层<color=#FFFFFF>[猎意]</color>，每层<color=#FFFFFF>[猎意]</color>使装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>15%</color>，最多叠加3层，持续10秒，0.5秒内最多触发一次，重复触发时刷新持续时间；进入接战状态或触发<color=#FFFFFF>[极限闪避]</color>时，直接获得3层<color=#FFFFFF>[猎意]</color>；<color=#FFFFFF>[猎意]</color>叠加至层数上限后，装备者的属性异常积蓄效率提升<color=#2BAD00>50%</color>。",
      "发动<color=#FFFFFF>[冲刺攻击]</color>时，获得1层<color=#FFFFFF>[猎意]</color>，每层<color=#FFFFFF>[猎意]</color>使装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>18%</color>，最多叠加3层，持续10秒，0.5秒内最多触发一次，重复触发时刷新持续时间；进入接战状态或触发<color=#FFFFFF>[极限闪避]</color>时，直接获得3层<color=#FFFFFF>[猎意]</color>；<color=#FFFFFF>[猎意]</color>叠加至层数上限后，装备者的属性异常积蓄效率提升<color=#2BAD00>60%</color>。",
      "发动<color=#FFFFFF>[冲刺攻击]</color>时，获得1层<color=#FFFFFF>[猎意]</color>，每层<color=#FFFFFF>[猎意]</color>使装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>21%</color>，最多叠加3层，持续10秒，0.5秒内最多触发一次，重复触发时刷新持续时间；进入接战状态或触发<color=#FFFFFF>[极限闪避]</color>时，直接获得3层<color=#FFFFFF>[猎意]</color>；<color=#FFFFFF>[猎意]</color>叠加至层数上限后，装备者的属性异常积蓄效率提升<color=#2BAD00>70%</color>。",
      "发动<color=#FFFFFF>[冲刺攻击]</color>时，获得1层<color=#FFFFFF>[猎意]</color>，每层<color=#FFFFFF>[猎意]</color>使装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>24%</color>，最多叠加3层，持续10秒，0.5秒内最多触发一次，重复触发时刷新持续时间；进入接战状态或触发<color=#FFFFFF>[极限闪避]</color>时，直接获得3层<color=#FFFFFF>[猎意]</color>；<color=#FFFFFF>[猎意]</color>叠加至层数上限后，装备者的属性异常积蓄效率提升<color=#2BAD00>80%</color>。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 36
      },
      {
        "dmgBonus": 45
      },
      {
        "dmgBonus": 54
      },
      {
        "dmgBonus": 63
      },
      {
        "dmgBonus": 72
      }
    ]
  },
  "千面日陨": {
    "id": "wp_14129",
    "category": "weapon",
    "sourceName": "千面日陨",
    "subType": "S级·强攻",
    "title": "万千非我",
    "desc": "暴击伤害提升<color=#2BAD00>45%</color>；<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>造成<color=#98EFF0>冰属性伤害</color>时，角色获得<color=#FFFFFF>[零度处刑宣言]</color>效果，持续3秒；<color=#FFFFFF>[零度处刑宣言]</color>效果期间，角色命中敌人时无视<color=#2BAD00>25%</color>防御力。",
    "stats": {
      "critDmg": 45,
      "defShred": 25
    },
    "refinementDescs": [
      "暴击伤害提升<color=#2BAD00>45%</color>；<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>造成<color=#98EFF0>冰属性伤害</color>时，角色获得<color=#FFFFFF>[零度处刑宣言]</color>效果，持续3秒；<color=#FFFFFF>[零度处刑宣言]</color>效果期间，角色命中敌人时无视<color=#2BAD00>25%</color>防御力。",
      "暴击伤害提升<color=#2BAD00>51.75%</color>；<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>造成<color=#98EFF0>冰属性伤害</color>时，角色获得<color=#FFFFFF>[零度处刑宣言]</color>效果，持续3秒；<color=#FFFFFF>[零度处刑宣言]</color>效果期间，角色命中敌人时无视<color=#2BAD00>28.75%</color>防御力。",
      "暴击伤害提升<color=#2BAD00>58.5%</color>；<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>造成<color=#98EFF0>冰属性伤害</color>时，角色获得<color=#FFFFFF>[零度处刑宣言]</color>效果，持续3秒；<color=#FFFFFF>[零度处刑宣言]</color>效果期间，角色命中敌人时无视<color=#2BAD00>32.5%</color>防御力。",
      "暴击伤害提升<color=#2BAD00>65.25%</color>；<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>造成<color=#98EFF0>冰属性伤害</color>时，角色获得<color=#FFFFFF>[零度处刑宣言]</color>效果，持续3秒；<color=#FFFFFF>[零度处刑宣言]</color>效果期间，角色命中敌人时无视<color=#2BAD00>36.25%</color>防御力。",
      "暴击伤害提升<color=#2BAD00>72%</color>；<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>造成<color=#98EFF0>冰属性伤害</color>时，角色获得<color=#FFFFFF>[零度处刑宣言]</color>效果，持续3秒；<color=#FFFFFF>[零度处刑宣言]</color>效果期间，角色命中敌人时无视<color=#2BAD00>40%</color>防御力。"
    ],
    "refinementStats": [
      {
        "critDmg": 45,
        "defShred": 25
      },
      {
        "critDmg": 51.75,
        "defShred": 28.75
      },
      {
        "critDmg": 58.5,
        "defShred": 32.5
      },
      {
        "critDmg": 65.25,
        "defShred": 36.25
      },
      {
        "critDmg": 72,
        "defShred": 40
      }
    ]
  },
  "嚣枪喧焰": {
    "id": "wp_14130",
    "category": "weapon",
    "sourceName": "嚣枪喧焰",
    "subType": "S级·强攻",
    "title": "喋声吞炎",
    "desc": "暴击率提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[追加攻击]</color>造成<color=#FF5521>火属性伤害</color>时，装备者的攻击对敌人造成的伤害无视<color=#2BAD00>15%</color>防御力，持续8秒，3秒内最多获得1层，最多叠加2层，重复触发时刷新持续时间。",
    "stats": {
      "critRate": 20,
      "defShred": 30
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[追加攻击]</color>造成<color=#FF5521>火属性伤害</color>时，装备者的攻击对敌人造成的伤害无视<color=#2BAD00>15%</color>防御力，持续8秒，3秒内最多获得1层，最多叠加2层，重复触发时刷新持续时间。",
      "暴击率提升<color=#2BAD00>23%</color>；装备者发动<color=#FFFFFF>[追加攻击]</color>造成<color=#FF5521>火属性伤害</color>时，装备者的攻击对敌人造成的伤害无视<color=#2BAD00>17.2%</color>防御力，持续8秒，3秒内最多获得1层，最多叠加2层，重复触发时刷新持续时间。",
      "暴击率提升<color=#2BAD00>26%</color>；装备者发动<color=#FFFFFF>[追加攻击]</color>造成<color=#FF5521>火属性伤害</color>时，装备者的攻击对敌人造成的伤害无视<color=#2BAD00>19.5%</color>防御力，持续8秒，3秒内最多获得1层，最多叠加2层，重复触发时刷新持续时间。",
      "暴击率提升<color=#2BAD00>29%</color>；装备者发动<color=#FFFFFF>[追加攻击]</color>造成<color=#FF5521>火属性伤害</color>时，装备者的攻击对敌人造成的伤害无视<color=#2BAD00>21.7%</color>防御力，持续8秒，3秒内最多获得1层，最多叠加2层，重复触发时刷新持续时间。",
      "暴击率提升<color=#2BAD00>32%</color>；装备者发动<color=#FFFFFF>[追加攻击]</color>造成<color=#FF5521>火属性伤害</color>时，装备者的攻击对敌人造成的伤害无视<color=#2BAD00>24%</color>防御力，持续8秒，3秒内最多获得1层，最多叠加2层，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "critRate": 20,
        "defShred": 30
      },
      {
        "critRate": 23,
        "defShred": 34.4
      },
      {
        "critRate": 26,
        "defShred": 39
      },
      {
        "critRate": 29,
        "defShred": 43.4
      },
      {
        "critRate": 32,
        "defShred": 48
      }
    ]
  },
  "玲珑妆匣": {
    "id": "wp_14131",
    "category": "weapon",
    "sourceName": "玲珑妆匣",
    "subType": "S级·支援",
    "title": "卓卓千华",
    "desc": "队伍中任意角色通过<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[招架支援]</color>、<color=#FFFFFF>[回避支援]</color>入场时，为装备者回复<color=#2BAD00>5</color>点能量，5秒内最多触发一次；装备者消耗25点或以上能量时，全队角色造成的伤害提升<color=#2BAD00>10%</color>，最多叠加2层，持续20秒，重复触发时刷新持续时间，该效果全队唯一。",
    "stats": {
      "dmgBonus": 20
    },
    "refinementDescs": [
      "队伍中任意角色通过<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[招架支援]</color>、<color=#FFFFFF>[回避支援]</color>入场时，为装备者回复<color=#2BAD00>5</color>点能量，5秒内最多触发一次；装备者消耗25点或以上能量时，全队角色造成的伤害提升<color=#2BAD00>10%</color>，最多叠加2层，持续20秒，重复触发时刷新持续时间，该效果全队唯一。",
      "队伍中任意角色通过<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[招架支援]</color>、<color=#FFFFFF>[回避支援]</color>入场时，为装备者回复<color=#2BAD00>5.5</color>点能量，5秒内最多触发一次；装备者消耗25点或以上能量时，全队角色造成的伤害提升<color=#2BAD00>11.5%</color>，最多叠加2层，持续20秒，重复触发时刷新持续时间，该效果全队唯一。",
      "队伍中任意角色通过<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[招架支援]</color>、<color=#FFFFFF>[回避支援]</color>入场时，为装备者回复<color=#2BAD00>6</color>点能量，5秒内最多触发一次；装备者消耗25点或以上能量时，全队角色造成的伤害提升<color=#2BAD00>13%</color>，最多叠加2层，持续20秒，重复触发时刷新持续时间，该效果全队唯一。",
      "队伍中任意角色通过<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[招架支援]</color>、<color=#FFFFFF>[回避支援]</color>入场时，为装备者回复<color=#2BAD00>6.5</color>点能量，5秒内最多触发一次；装备者消耗25点或以上能量时，全队角色造成的伤害提升<color=#2BAD00>14.5%</color>，最多叠加2层，持续20秒，重复触发时刷新持续时间，该效果全队唯一。",
      "队伍中任意角色通过<color=#FFFFFF>[快速支援]</color>、<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[招架支援]</color>、<color=#FFFFFF>[回避支援]</color>入场时，为装备者回复<color=#2BAD00>7</color>点能量，5秒内最多触发一次；装备者消耗25点或以上能量时，全队角色造成的伤害提升<color=#2BAD00>16%</color>，最多叠加2层，持续20秒，重复触发时刷新持续时间，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 20
      },
      {
        "dmgBonus": 23
      },
      {
        "dmgBonus": 26
      },
      {
        "dmgBonus": 29
      },
      {
        "dmgBonus": 32
      }
    ]
  },
  "心弦夜响": {
    "id": "wp_14132",
    "category": "weapon",
    "sourceName": "心弦夜响",
    "subType": "S级·强攻",
    "title": "弦音相随",
    "desc": "暴击伤害提升<color=#2BAD00>50%</color>；装备者进入接战状态、发动<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，获得1层<color=#FFFFFF>[心弦]</color>，每层<color=#FFFFFF>[心弦]</color>会使装备者的<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>无视目标<color=#2BAD00>12.5%</color><color=#FF5521>火属性伤害抗性</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
    "stats": {
      "critDmg": 50,
      "resShred": 25
    },
    "refinementDescs": [
      "暴击伤害提升<color=#2BAD00>50%</color>；装备者进入接战状态、发动<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，获得1层<color=#FFFFFF>[心弦]</color>，每层<color=#FFFFFF>[心弦]</color>会使装备者的<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>无视目标<color=#2BAD00>12.5%</color><color=#FF5521>火属性伤害抗性</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
      "暴击伤害提升<color=#2BAD00>57.5%</color>；装备者进入接战状态、发动<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，获得1层<color=#FFFFFF>[心弦]</color>，每层<color=#FFFFFF>[心弦]</color>会使装备者的<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>无视目标<color=#2BAD00>14.5%</color><color=#FF5521>火属性伤害抗性</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
      "暴击伤害提升<color=#2BAD00>65%</color>；装备者进入接战状态、发动<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，获得1层<color=#FFFFFF>[心弦]</color>，每层<color=#FFFFFF>[心弦]</color>会使装备者的<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>无视目标<color=#2BAD00>16.5%</color><color=#FF5521>火属性伤害抗性</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
      "暴击伤害提升<color=#2BAD00>72.5%</color>；装备者进入接战状态、发动<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，获得1层<color=#FFFFFF>[心弦]</color>，每层<color=#FFFFFF>[心弦]</color>会使装备者的<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>无视目标<color=#2BAD00>18.5%</color><color=#FF5521>火属性伤害抗性</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
      "暴击伤害提升<color=#2BAD00>80%</color>；装备者进入接战状态、发动<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[终结技]</color>时，获得1层<color=#FFFFFF>[心弦]</color>，每层<color=#FFFFFF>[心弦]</color>会使装备者的<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>无视目标<color=#2BAD00>20%</color><color=#FF5521>火属性伤害抗性</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "critDmg": 50,
        "resShred": 25
      },
      {
        "critDmg": 57.5,
        "resShred": 29
      },
      {
        "critDmg": 65,
        "resShred": 33
      },
      {
        "critDmg": 72.5,
        "resShred": 37
      },
      {
        "critDmg": 80,
        "resShred": 40
      }
    ]
  },
  "飞鸟星梦": {
    "id": "wp_14133",
    "category": "weapon",
    "sourceName": "飞鸟星梦",
    "subType": "S级·异常",
    "title": "银刺幽羽",
    "desc": "属性异常积蓄效率提升<color=#2BAD00>40%</color>；装备者造成<color=#FE437E>以太伤害</color>时，自身异常精通提升<color=#2BAD00>20</color>点，持续5秒，最多叠加6层，0.5秒内最多触发一次，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 120
    },
    "refinementDescs": [
      "属性异常积蓄效率提升<color=#2BAD00>40%</color>；装备者造成<color=#FE437E>以太伤害</color>时，自身异常精通提升<color=#2BAD00>20</color>点，持续5秒，最多叠加6层，0.5秒内最多触发一次，重复触发时刷新持续时间。",
      "属性异常积蓄效率提升<color=#2BAD00>46%</color>；装备者造成<color=#FE437E>以太伤害</color>时，自身异常精通提升<color=#2BAD00>23</color>点，持续5秒，最多叠加6层，0.5秒内最多触发一次，重复触发时刷新持续时间。",
      "属性异常积蓄效率提升<color=#2BAD00>52%</color>；装备者造成<color=#FE437E>以太伤害</color>时，自身异常精通提升<color=#2BAD00>26</color>点，持续5秒，最多叠加6层，0.5秒内最多触发一次，重复触发时刷新持续时间。",
      "属性异常积蓄效率提升<color=#2BAD00>58%</color>；装备者造成<color=#FE437E>以太伤害</color>时，自身异常精通提升<color=#2BAD00>29</color>点，持续5秒，最多叠加6层，0.5秒内最多触发一次，重复触发时刷新持续时间。",
      "属性异常积蓄效率提升<color=#2BAD00>64%</color>；装备者造成<color=#FE437E>以太伤害</color>时，自身异常精通提升<color=#2BAD00>32</color>点，持续5秒，最多叠加6层，0.5秒内最多触发一次，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 120
      },
      {
        "anomalyMastery": 138
      },
      {
        "anomalyMastery": 156
      },
      {
        "anomalyMastery": 174
      },
      {
        "anomalyMastery": 192
      }
    ]
  },
  "半糖雪兔": {
    "id": "wp_14134",
    "category": "weapon",
    "sourceName": "半糖雪兔",
    "subType": "S级·防护",
    "title": "易碎之甜",
    "desc": "装备者的能量自动回复提升<color=#2BAD00>0.46</color>点/秒；全队角色攻击力提升<color=#2BAD00>10%</color>，最大生命值提升<color=#2BAD00>10%</color>，该效果全队唯一；装备者开启或延长<color=#FFFFFF>[以太帷幕]</color>时，使全队角色的暴击伤害提升<color=#2BAD00>30%</color>，持续60秒，重复触发刷新持续时间。",
    "stats": {
      "inCombatAtkPct": 10,
      "inCombatHpPct": 10,
      "critDmg": 30
    },
    "refinementDescs": [
      "装备者的能量自动回复提升<color=#2BAD00>0.46</color>点/秒；全队角色攻击力提升<color=#2BAD00>10%</color>，最大生命值提升<color=#2BAD00>10%</color>，该效果全队唯一；装备者开启或延长<color=#FFFFFF>[以太帷幕]</color>时，使全队角色的暴击伤害提升<color=#2BAD00>30%</color>，持续60秒，重复触发刷新持续时间。",
      "装备者的能量自动回复提升<color=#2BAD00>0.53</color>点/秒；全队角色攻击力提升<color=#2BAD00>11.5%</color>，最大生命值提升<color=#2BAD00>11.5%</color>，该效果全队唯一；装备者开启或延长<color=#FFFFFF>[以太帷幕]</color>时，使全队角色的暴击伤害提升<color=#2BAD00>34.5%</color>，持续60秒，重复触发刷新持续时间。",
      "装备者的能量自动回复提升<color=#2BAD00>0.6</color>点/秒；全队角色攻击力提升<color=#2BAD00>13%</color>，最大生命值提升<color=#2BAD00>13%</color>，该效果全队唯一；装备者开启或延长<color=#FFFFFF>[以太帷幕]</color>时，使全队角色的暴击伤害提升<color=#2BAD00>39%</color>，持续60秒，重复触发刷新持续时间。",
      "装备者的能量自动回复提升<color=#2BAD00>0.67</color>点/秒；全队角色攻击力提升<color=#2BAD00>14.5%</color>，最大生命值提升<color=#2BAD00>14.5%</color>，该效果全队唯一；装备者开启或延长<color=#FFFFFF>[以太帷幕]</color>时，使全队角色的暴击伤害提升<color=#2BAD00>43.5%</color>，持续60秒，重复触发刷新持续时间。",
      "装备者的能量自动回复提升<color=#2BAD00>0.74</color>点/秒；全队角色攻击力提升<color=#2BAD00>16%</color>，最大生命值提升<color=#2BAD00>16%</color>，该效果全队唯一；装备者开启或延长<color=#FFFFFF>[以太帷幕]</color>时，使全队角色的暴击伤害提升<color=#2BAD00>48%</color>，持续60秒，重复触发刷新持续时间。"
    ],
    "refinementStats": [
      {
        "inCombatAtkPct": 10,
        "inCombatHpPct": 10,
        "critDmg": 30
      },
      {
        "inCombatAtkPct": 11.5,
        "inCombatHpPct": 11.5,
        "critDmg": 34.5
      },
      {
        "inCombatAtkPct": 13,
        "inCombatHpPct": 13,
        "critDmg": 39
      },
      {
        "inCombatAtkPct": 14.5,
        "inCombatHpPct": 14.5,
        "critDmg": 43.5
      },
      {
        "inCombatAtkPct": 16,
        "inCombatHpPct": 16,
        "critDmg": 48
      }
    ]
  },
  "索魂影眸": {
    "id": "wp_14136",
    "category": "weapon",
    "sourceName": "索魂影眸",
    "subType": "S级·击破",
    "title": "捕风寻踪",
    "desc": "装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人并造成<color=#2EB6FF>电属性伤害</color>时，目标的防御力降低<color=#2BAD00>25%</color>，持续5秒，同名被动效果之间不可叠加；该效果触发时，如果自身不是当前操作中的角色，则装备者获得1层<color=#FFFFFF>[魂锁]</color>，最多叠加3层，同一招式内最多触发一次；每层<color=#FFFFFF>[魂锁]</color>，可使装备者的冲击力提升<color=#2BAD00>4%</color>，持续12秒，每层效果单独结算持续时间，<color=#FFFFFF>[魂锁]</color>层数叠满时，额外给装备者的冲击力提升<color=#2BAD00>8%</color>。",
    "stats": {
      "defShred": 25
    },
    "refinementDescs": [
      "装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人并造成<color=#2EB6FF>电属性伤害</color>时，目标的防御力降低<color=#2BAD00>25%</color>，持续5秒，同名被动效果之间不可叠加；该效果触发时，如果自身不是当前操作中的角色，则装备者获得1层<color=#FFFFFF>[魂锁]</color>，最多叠加3层，同一招式内最多触发一次；每层<color=#FFFFFF>[魂锁]</color>，可使装备者的冲击力提升<color=#2BAD00>4%</color>，持续12秒，每层效果单独结算持续时间，<color=#FFFFFF>[魂锁]</color>层数叠满时，额外给装备者的冲击力提升<color=#2BAD00>8%</color>。",
      "装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人并造成<color=#2EB6FF>电属性伤害</color>时，目标的防御力降低<color=#2BAD00>28.75%</color>，持续5秒，同名被动效果之间不可叠加；该效果触发时，如果自身不是当前操作中的角色，则装备者获得1层<color=#FFFFFF>[魂锁]</color>，最多叠加3层，同一招式内最多触发一次；每层<color=#FFFFFF>[魂锁]</color>，可使装备者的冲击力提升<color=#2BAD00>4.6%</color>，持续12秒，每层效果单独结算持续时间，<color=#FFFFFF>[魂锁]</color>层数叠满时，额外给装备者的冲击力提升<color=#2BAD00>9.2%</color>。",
      "装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人并造成<color=#2EB6FF>电属性伤害</color>时，目标的防御力降低<color=#2BAD00>32.5%</color>，持续5秒，同名被动效果之间不可叠加；该效果触发时，如果自身不是当前操作中的角色，则装备者获得1层<color=#FFFFFF>[魂锁]</color>，最多叠加3层，同一招式内最多触发一次；每层<color=#FFFFFF>[魂锁]</color>，可使装备者的冲击力提升<color=#2BAD00>5.2%</color>，持续12秒，每层效果单独结算持续时间，<color=#FFFFFF>[魂锁]</color>层数叠满时，额外给装备者的冲击力提升<color=#2BAD00>10.4%</color>。",
      "装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人并造成<color=#2EB6FF>电属性伤害</color>时，目标的防御力降低<color=#2BAD00>36.25%</color>，持续5秒，同名被动效果之间不可叠加；该效果触发时，如果自身不是当前操作中的角色，则装备者获得1层<color=#FFFFFF>[魂锁]</color>，最多叠加3层，同一招式内最多触发一次；每层<color=#FFFFFF>[魂锁]</color>，可使装备者的冲击力提升<color=#2BAD00>5.8%</color>，持续12秒，每层效果单独结算持续时间，<color=#FFFFFF>[魂锁]</color>层数叠满时，额外给装备者的冲击力提升<color=#2BAD00>11.6%</color>。",
      "装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人并造成<color=#2EB6FF>电属性伤害</color>时，目标的防御力降低<color=#2BAD00>40%</color>，持续5秒，同名被动效果之间不可叠加；该效果触发时，如果自身不是当前操作中的角色，则装备者获得1层<color=#FFFFFF>[魂锁]</color>，最多叠加3层，同一招式内最多触发一次；每层<color=#FFFFFF>[魂锁]</color>，可使装备者的冲击力提升<color=#2BAD00>6.4%</color>，持续12秒，每层效果单独结算持续时间，<color=#FFFFFF>[魂锁]</color>层数叠满时，额外给装备者的冲击力提升<color=#2BAD00>12.8%</color>。"
    ],
    "refinementStats": [
      {
        "defShred": 25
      },
      {
        "defShred": 28.75
      },
      {
        "defShred": 32.5
      },
      {
        "defShred": 36.25
      },
      {
        "defShred": 40
      }
    ]
  },
  "青溟笼舍": {
    "id": "wp_14137",
    "category": "weapon",
    "sourceName": "青溟笼舍",
    "subType": "S级·命破",
    "title": "云流运转",
    "desc": "暴击率提升<color=#2BAD00>20%</color>；装备者释放<color=#FFFFFF>[强化特殊技]</color>时角色获得1层<color=#FFFFFF>[青溟同行]</color>效果，最多叠加2层，持续15秒，进入接战状态时直接获得2层，重复触发时刷新持续时间；每层<color=#FFFFFF>[青溟同行]</color>效果使装备者造成的<color=#FE437E>以太伤害</color>提升<color=#2BAD00>8%</color>，[终结技]或[强化特殊技]造成的<color=#FE437E>以太贯穿伤害</color>提升<color=#2BAD00>10%</color>。",
    "stats": {
      "critRate": 20,
      "dmgBonus": 16,
      "ppDmgBonus": 10
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>20%</color>；装备者释放<color=#FFFFFF>[强化特殊技]</color>时角色获得1层<color=#FFFFFF>[青溟同行]</color>效果，最多叠加2层，持续15秒，进入接战状态时直接获得2层，重复触发时刷新持续时间；每层<color=#FFFFFF>[青溟同行]</color>效果使装备者造成的<color=#FE437E>以太伤害</color>提升<color=#2BAD00>8%</color>，[终结技]或[强化特殊技]造成的<color=#FE437E>以太贯穿伤害</color>提升<color=#2BAD00>10%</color>。",
      "暴击率提升<color=#2BAD00>23%</color>；装备者释放<color=#FFFFFF>[强化特殊技]</color>时角色获得1层<color=#FFFFFF>[青溟同行]</color>效果，最多叠加2层，持续15秒，进入接战状态时直接获得2层，重复触发时刷新持续时间；每层<color=#FFFFFF>[青溟同行]</color>效果使装备者造成的<color=#FE437E>以太伤害</color>提升<color=#2BAD00>9.2%</color>，[终结技]或[强化特殊技]造成的<color=#FE437E>以太贯穿伤害</color>提升<color=#2BAD00>11.5%</color>。",
      "暴击率提升<color=#2BAD00>26%</color>；装备者释放<color=#FFFFFF>[强化特殊技]</color>时角色获得1层<color=#FFFFFF>[青溟同行]</color>效果，最多叠加2层，持续15秒，进入接战状态时直接获得2层，重复触发时刷新持续时间；每层<color=#FFFFFF>[青溟同行]</color>效果使装备者造成的<color=#FE437E>以太伤害</color>提升<color=#2BAD00>10.4%</color>，[终结技]或[强化特殊技]造成的<color=#FE437E>以太贯穿伤害</color>提升<color=#2BAD00>13%</color>。",
      "暴击率提升<color=#2BAD00>29%</color>；装备者释放<color=#FFFFFF>[强化特殊技]</color>时角色获得1层<color=#FFFFFF>[青溟同行]</color>效果，最多叠加2层，持续15秒，进入接战状态时直接获得2层，重复触发时刷新持续时间；每层<color=#FFFFFF>[青溟同行]</color>效果使装备者造成的<color=#FE437E>以太伤害</color>提升<color=#2BAD00>11.6%</color>，[终结技]或[强化特殊技]造成的<color=#FE437E>以太贯穿伤害</color>提升<color=#2BAD00>14.5%</color>。",
      "暴击率提升<color=#2BAD00>32%</color>；装备者释放<color=#FFFFFF>[强化特殊技]</color>时角色获得1层<color=#FFFFFF>[青溟同行]</color>效果，最多叠加2层，持续15秒，进入接战状态时直接获得2层，重复触发时刷新持续时间；每层<color=#FFFFFF>[青溟同行]</color>效果使装备者造成的<color=#FE437E>以太伤害</color>提升<color=#2BAD00>12.8%</color>，[终结技]或[强化特殊技]造成的<color=#FE437E>以太贯穿伤害</color>提升<color=#2BAD00>16%</color>。"
    ],
    "refinementStats": [
      {
        "critRate": 20,
        "dmgBonus": 16,
        "ppDmgBonus": 10
      },
      {
        "critRate": 23,
        "dmgBonus": 18.4,
        "ppDmgBonus": 11.5
      },
      {
        "critRate": 26,
        "dmgBonus": 20.8,
        "ppDmgBonus": 13
      },
      {
        "critRate": 29,
        "dmgBonus": 23.2,
        "ppDmgBonus": 14.5
      },
      {
        "critRate": 32,
        "dmgBonus": 25.6,
        "ppDmgBonus": 16
      }
    ]
  },
  "牺牲洁纯": {
    "id": "wp_14138",
    "category": "weapon",
    "sourceName": "牺牲洁纯",
    "subType": "S级·强攻",
    "title": "光静花冷",
    "desc": "暴击伤害提升<color=#2BAD00>30%</color>；装备者发动<color=#FFFFFF>[普通攻击]</color> 、<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[追加攻击]</color>命中敌人时，可分别获得1层增益效果，每层增益效果使装备者的暴击伤害额外提升<color=#2BAD00>10%</color>，最多叠加3层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有3层增益效果时，装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>20%</color>。",
    "stats": {
      "critDmg": 60,
      "dmgBonus": 20
    },
    "refinementDescs": [
      "暴击伤害提升<color=#2BAD00>30%</color>；装备者发动<color=#FFFFFF>[普通攻击]</color> 、<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[追加攻击]</color>命中敌人时，可分别获得1层增益效果，每层增益效果使装备者的暴击伤害额外提升<color=#2BAD00>10%</color>，最多叠加3层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有3层增益效果时，装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>20%</color>。",
      "暴击伤害提升<color=#2BAD00>34.5%</color>；装备者发动<color=#FFFFFF>[普通攻击]</color> 、<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[追加攻击]</color>命中敌人时，可分别获得1层增益效果，每层增益效果使装备者的暴击伤害额外提升<color=#2BAD00>11.5%</color>，最多叠加3层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有3层增益效果时，装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>23%</color>。",
      "暴击伤害提升<color=#2BAD00>39%</color>；装备者发动<color=#FFFFFF>[普通攻击]</color> 、<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[追加攻击]</color>命中敌人时，可分别获得1层增益效果，每层增益效果使装备者的暴击伤害额外提升<color=#2BAD00>13%</color>，最多叠加3层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有3层增益效果时，装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>26%</color>。",
      "暴击伤害提升<color=#2BAD00>43.5%</color>；装备者发动<color=#FFFFFF>[普通攻击]</color> 、<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[追加攻击]</color>命中敌人时，可分别获得1层增益效果，每层增益效果使装备者的暴击伤害额外提升<color=#2BAD00>14.5%</color>，最多叠加3层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有3层增益效果时，装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>29%</color>。",
      "暴击伤害提升<color=#2BAD00>48%</color>；装备者发动<color=#FFFFFF>[普通攻击]</color> 、<color=#FFFFFF>[特殊技]</color>或<color=#FFFFFF>[追加攻击]</color>命中敌人时，可分别获得1层增益效果，每层增益效果使装备者的暴击伤害额外提升<color=#2BAD00>16%</color>，最多叠加3层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有3层增益效果时，装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>32%</color>。"
    ],
    "refinementStats": [
      {
        "critDmg": 60,
        "dmgBonus": 20
      },
      {
        "critDmg": 69,
        "dmgBonus": 23
      },
      {
        "critDmg": 78,
        "dmgBonus": 26
      },
      {
        "critDmg": 87,
        "dmgBonus": 29
      },
      {
        "critDmg": 96,
        "dmgBonus": 32
      }
    ]
  },
  "福虓炉炉": {
    "id": "wp_14139",
    "category": "weapon",
    "sourceName": "福虓炉炉",
    "subType": "S级·击破",
    "title": "虎气融融",
    "desc": "装备者的<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>造成的失衡值提升<color=#2BAD00>28%</color>；\n发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>并造成<color=#FF5521>火属性伤害</color>时，全队角色造成伤害提升<color=#2BAD00>10%</color>，最多叠加2层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次，该效果全队唯一。",
    "stats": {
      "dmgBonus": 20
    },
    "refinementDescs": [
      "装备者的<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>造成的失衡值提升<color=#2BAD00>28%</color>；\n发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>并造成<color=#FF5521>火属性伤害</color>时，全队角色造成伤害提升<color=#2BAD00>10%</color>，最多叠加2层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次，该效果全队唯一。",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>造成的失衡值提升<color=#2BAD00>32.2%</color>；\n发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>并造成<color=#FF5521>火属性伤害</color>时，全队角色造成伤害提升<color=#2BAD00>11.5%</color>，最多叠加2层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次，该效果全队唯一。",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>造成的失衡值提升<color=#2BAD00>36.4%</color>；\n发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>并造成<color=#FF5521>火属性伤害</color>时，全队角色造成伤害提升<color=#2BAD00>13%</color>，最多叠加2层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次，该效果全队唯一。",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>造成的失衡值提升<color=#2BAD00>40.6%</color>；\n发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>并造成<color=#FF5521>火属性伤害</color>时，全队角色造成伤害提升<color=#2BAD00>14.5%</color>，最多叠加2层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次，该效果全队唯一。",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>造成的失衡值提升<color=#2BAD00>44.8%</color>；\n发动<color=#FFFFFF>[连携技]</color>或<color=#FFFFFF>[终结技]</color>并造成<color=#FF5521>火属性伤害</color>时，全队角色造成伤害提升<color=#2BAD00>16%</color>，最多叠加2层，持续30秒，每层效果单独结算持续时间，同一招式内最多触发一次，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 20
      },
      {
        "dmgBonus": 23
      },
      {
        "dmgBonus": 26
      },
      {
        "dmgBonus": 29
      },
      {
        "dmgBonus": 32
      }
    ]
  },
  "十方锻星": {
    "id": "wp_14140",
    "category": "weapon",
    "sourceName": "十方锻星",
    "subType": "S级·异常",
    "title": "予你星屑",
    "desc": "装备者的<color=#FFFFFF>[异常掌控]</color>提升<color=#2BAD00>60</color>点；触发<color=#F0D12B>[强击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>20%</color>，持续20秒，最多叠加2层，重复触发时刷新持续时间，装备者进入接战状态时，立即获得2层效果。",
    "stats": {
      "dmgBonus": 40
    },
    "refinementDescs": [
      "装备者的<color=#FFFFFF>[异常掌控]</color>提升<color=#2BAD00>60</color>点；触发<color=#F0D12B>[强击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>20%</color>，持续20秒，最多叠加2层，重复触发时刷新持续时间，装备者进入接战状态时，立即获得2层效果。",
      "装备者的<color=#FFFFFF>[异常掌控]</color>提升<color=#2BAD00>69</color>点；触发<color=#F0D12B>[强击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>23%</color>，持续20秒，最多叠加2层，重复触发时刷新持续时间，装备者进入接战状态时，立即获得2层效果。",
      "装备者的<color=#FFFFFF>[异常掌控]</color>提升<color=#2BAD00>78</color>点；触发<color=#F0D12B>[强击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>26%</color>，持续20秒，最多叠加2层，重复触发时刷新持续时间，装备者进入接战状态时，立即获得2层效果。",
      "装备者的<color=#FFFFFF>[异常掌控]</color>提升<color=#2BAD00>87</color>点；触发<color=#F0D12B>[强击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>29%</color>，持续20秒，最多叠加2层，重复触发时刷新持续时间，装备者进入接战状态时，立即获得2层效果。",
      "装备者的<color=#FFFFFF>[异常掌控]</color>提升<color=#2BAD00>96</color>点；触发<color=#F0D12B>[强击]</color>时，装备者造成的<color=#F0D12B>物理伤害</color>提升<color=#2BAD00>32%</color>，持续20秒，最多叠加2层，重复触发时刷新持续时间，装备者进入接战状态时，立即获得2层效果。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 40
      },
      {
        "dmgBonus": 46
      },
      {
        "dmgBonus": 52
      },
      {
        "dmgBonus": 58
      },
      {
        "dmgBonus": 64
      }
    ]
  },
  "狸法七变化": {
    "id": "wp_14141",
    "category": "weapon",
    "sourceName": "狸法七变化",
    "subType": "S级·支援",
    "title": "机巧玲珑",
    "desc": "装备者的<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#F0D12B>物理伤害</color>时，装备者<color=#FFFFFF>异常掌控</color>提升<color=#2BAD00>30</color>点，持续40秒；装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人时，使全队角色的<color=#FFFFFF>异常精通</color>提升<color=#2BAD00>60</color>点，持续40秒，该效果全队唯一。",
    "stats": {
      "anomalyMastery": 60
    },
    "refinementDescs": [
      "装备者的<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#F0D12B>物理伤害</color>时，装备者<color=#FFFFFF>异常掌控</color>提升<color=#2BAD00>30</color>点，持续40秒；装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人时，使全队角色的<color=#FFFFFF>异常精通</color>提升<color=#2BAD00>60</color>点，持续40秒，该效果全队唯一。",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#F0D12B>物理伤害</color>时，装备者<color=#FFFFFF>异常掌控</color>提升<color=#2BAD00>34</color>点，持续40秒；装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人时，使全队角色的<color=#FFFFFF>异常精通</color>提升<color=#2BAD00>69</color>点，持续40秒，该效果全队唯一。",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#F0D12B>物理伤害</color>时，装备者<color=#FFFFFF>异常掌控</color>提升<color=#2BAD00>39</color>点，持续40秒；装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人时，使全队角色的<color=#FFFFFF>异常精通</color>提升<color=#2BAD00>78</color>点，持续40秒，该效果全队唯一。",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#F0D12B>物理伤害</color>时，装备者<color=#FFFFFF>异常掌控</color>提升<color=#2BAD00>43</color>点，持续40秒；装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人时，使全队角色的<color=#FFFFFF>异常精通</color>提升<color=#2BAD00>87</color>点，持续40秒，该效果全队唯一。",
      "装备者的<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[终结技]</color>造成<color=#F0D12B>物理伤害</color>时，装备者<color=#FFFFFF>异常掌控</color>提升<color=#2BAD00>48</color>点，持续40秒；装备者的<color=#FFFFFF>[追加攻击]</color>命中敌人时，使全队角色的<color=#FFFFFF>异常精通</color>提升<color=#2BAD00>96</color>点，持续40秒，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 60
      },
      {
        "anomalyMastery": 69
      },
      {
        "anomalyMastery": 78
      },
      {
        "anomalyMastery": 87
      },
      {
        "anomalyMastery": 96
      }
    ]
  },
  "云霓孤光": {
    "id": "wp_14143",
    "category": "weapon",
    "sourceName": "云霓孤光",
    "subType": "S级·强攻",
    "title": "玉魄冰心",
    "desc": "装备者造成的伤害无视目标<color=#2BAD00>20%</color><color=#F0D12B>物理属性伤害抗性</color>；装备者开启<color=#FFFFFF>[以太帷幕]</color>时，自身造成的伤害提升<color=#2BAD00>25%</color>，暴击伤害提升<color=#2BAD00>25%</color>，持续40秒，重复触发时刷新持续时间。",
    "stats": {
      "resShred": 20,
      "dmgBonus": 25,
      "critDmg": 25
    },
    "refinementDescs": [
      "装备者造成的伤害无视目标<color=#2BAD00>20%</color><color=#F0D12B>物理属性伤害抗性</color>；装备者开启<color=#FFFFFF>[以太帷幕]</color>时，自身造成的伤害提升<color=#2BAD00>25%</color>，暴击伤害提升<color=#2BAD00>25%</color>，持续40秒，重复触发时刷新持续时间。",
      "装备者造成的伤害无视目标<color=#2BAD00>22%</color><color=#F0D12B>物理属性伤害抗性</color>；装备者开启<color=#FFFFFF>[以太帷幕]</color>时，自身造成的伤害提升<color=#2BAD00>28.7%</color>，暴击伤害提升<color=#2BAD00>28.7%</color>，持续40秒，重复触发时刷新持续时间。",
      "装备者造成的伤害无视目标<color=#2BAD00>24%</color><color=#F0D12B>物理属性伤害抗性</color>；装备者开启<color=#FFFFFF>[以太帷幕]</color>时，自身造成的伤害提升<color=#2BAD00>32.5%</color>，暴击伤害提升<color=#2BAD00>32.5%</color>，持续40秒，重复触发时刷新持续时间。",
      "装备者造成的伤害无视目标<color=#2BAD00>26%</color><color=#F0D12B>物理属性伤害抗性</color>；装备者开启<color=#FFFFFF>[以太帷幕]</color>时，自身造成的伤害提升<color=#2BAD00>36.2%</color>，暴击伤害提升<color=#2BAD00>36.2%</color>，持续40秒，重复触发时刷新持续时间。",
      "装备者造成的伤害无视目标<color=#2BAD00>28%</color><color=#F0D12B>物理属性伤害抗性</color>；装备者开启<color=#FFFFFF>[以太帷幕]</color>时，自身造成的伤害提升<color=#2BAD00>40%</color>，暴击伤害提升<color=#2BAD00>40%</color>，持续40秒，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "resShred": 20,
        "dmgBonus": 25,
        "critDmg": 25
      },
      {
        "resShred": 22,
        "dmgBonus": 28.7,
        "critDmg": 28.7
      },
      {
        "resShred": 24,
        "dmgBonus": 32.5,
        "critDmg": 32.5
      },
      {
        "resShred": 26,
        "dmgBonus": 36.2,
        "critDmg": 36.2
      },
      {
        "resShred": 28,
        "dmgBonus": 40,
        "critDmg": 40
      }
    ]
  },
  "铸梦炉歌": {
    "id": "wp_14145",
    "category": "weapon",
    "sourceName": "铸梦炉歌",
    "subType": "S级·支援",
    "title": "月引颂篇",
    "desc": "装备者的能量自动回复提升<color=#2BAD00>0.4</color>点/秒；当装备者开启<color=#FFFFFF>[以太帷幕]</color>或延长<color=#FFFFFF>[以太帷幕]</color>的持续时间时，全队角色造成伤害提升<color=#2BAD00>25%</color>，生命值上限提升<color=#2BAD00>15%</color>，效果持续45秒，重复触发时刷新持续时间，该效果全队唯一。",
    "stats": {
      "dmgBonus": 25,
      "inCombatHpPct": 15
    },
    "refinementDescs": [
      "装备者的能量自动回复提升<color=#2BAD00>0.4</color>点/秒；当装备者开启<color=#FFFFFF>[以太帷幕]</color>或延长<color=#FFFFFF>[以太帷幕]</color>的持续时间时，全队角色造成伤害提升<color=#2BAD00>25%</color>，生命值上限提升<color=#2BAD00>15%</color>，效果持续45秒，重复触发时刷新持续时间，该效果全队唯一。",
      "装备者的能量自动回复提升<color=#2BAD00>0.46</color>点/秒；当装备者开启<color=#FFFFFF>[以太帷幕]</color>或延长<color=#FFFFFF>[以太帷幕]</color>的持续时间时，全队角色造成伤害提升<color=#2BAD00>28.8%</color>，生命值上限提升<color=#2BAD00>17.3%</color>，效果持续45秒，重复触发时刷新持续时间，该效果全队唯一。",
      "装备者的能量自动回复提升<color=#2BAD00>0.52</color>点/秒；当装备者开启<color=#FFFFFF>[以太帷幕]</color>或延长<color=#FFFFFF>[以太帷幕]</color>的持续时间时，全队角色造成伤害提升<color=#2BAD00>32.5%</color>，生命值上限提升<color=#2BAD00>19.5%</color>，效果持续45秒，重复触发时刷新持续时间，该效果全队唯一。",
      "装备者的能量自动回复提升<color=#2BAD00>0.58</color>点/秒；当装备者开启<color=#FFFFFF>[以太帷幕]</color>或延长<color=#FFFFFF>[以太帷幕]</color>的持续时间时，全队角色造成伤害提升<color=#2BAD00>36.3%</color>，生命值上限提升<color=#2BAD00>21.8%</color>，效果持续45秒，重复触发时刷新持续时间，该效果全队唯一。",
      "装备者的能量自动回复提升<color=#2BAD00>0.64</color>点/秒；当装备者开启<color=#FFFFFF>[以太帷幕]</color>或延长<color=#FFFFFF>[以太帷幕]</color>的持续时间时，全队角色造成伤害提升<color=#2BAD00>40%</color>，生命值上限提升<color=#2BAD00>24%</color>，效果持续45秒，重复触发时刷新持续时间，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 25,
        "inCombatHpPct": 15
      },
      {
        "dmgBonus": 28.8,
        "inCombatHpPct": 17.3
      },
      {
        "dmgBonus": 32.5,
        "inCombatHpPct": 19.5
      },
      {
        "dmgBonus": 36.3,
        "inCombatHpPct": 21.8
      },
      {
        "dmgBonus": 40,
        "inCombatHpPct": 24
      }
    ]
  },
  "机巧心种": {
    "id": "wp_14146",
    "category": "weapon",
    "sourceName": "机巧心种",
    "subType": "S级·强攻",
    "title": "芽生炉心",
    "desc": "暴击率提升<color=#2BAD00>15%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[强化特殊技]</color>造成伤害时，可分别获得1层增益效果，每层增益效果使装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>12.5%</color>，最多叠加2层，持续40秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有2层增益效果时，装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[终结技]</color>对敌人造成的伤害无视<color=#2BAD00>20%</color>防御力。",
    "stats": {
      "critRate": 15,
      "dmgBonus": 25,
      "defShred": 20
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>15%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[强化特殊技]</color>造成伤害时，可分别获得1层增益效果，每层增益效果使装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>12.5%</color>，最多叠加2层，持续40秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有2层增益效果时，装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[终结技]</color>对敌人造成的伤害无视<color=#2BAD00>20%</color>防御力。",
      "暴击率提升<color=#2BAD00>17%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[强化特殊技]</color>造成伤害时，可分别获得1层增益效果，每层增益效果使装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>14.5%</color>，最多叠加2层，持续40秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有2层增益效果时，装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[终结技]</color>对敌人造成的伤害无视<color=#2BAD00>23%</color>防御力。",
      "暴击率提升<color=#2BAD00>19%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[强化特殊技]</color>造成伤害时，可分别获得1层增益效果，每层增益效果使装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>16.5%</color>，最多叠加2层，持续40秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有2层增益效果时，装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[终结技]</color>对敌人造成的伤害无视<color=#2BAD00>26%</color>防御力。",
      "暴击率提升<color=#2BAD00>21%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[强化特殊技]</color>造成伤害时，可分别获得1层增益效果，每层增益效果使装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>18.5%</color>，最多叠加2层，持续40秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有2层增益效果时，装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[终结技]</color>对敌人造成的伤害无视<color=#2BAD00>29%</color>防御力。",
      "暴击率提升<color=#2BAD00>23%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[强化特殊技]</color>造成伤害时，可分别获得1层增益效果，每层增益效果使装备者造成的<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>20%</color>，最多叠加2层，持续40秒，每层效果单独结算持续时间，同一招式内最多触发一次；拥有2层增益效果时，装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[终结技]</color>对敌人造成的伤害无视<color=#2BAD00>32%</color>防御力。"
    ],
    "refinementStats": [
      {
        "critRate": 15,
        "dmgBonus": 25,
        "defShred": 20
      },
      {
        "critRate": 17,
        "dmgBonus": 29,
        "defShred": 23
      },
      {
        "critRate": 19,
        "dmgBonus": 33,
        "defShred": 26
      },
      {
        "critRate": 21,
        "dmgBonus": 37,
        "defShred": 29
      },
      {
        "critRate": 23,
        "dmgBonus": 40,
        "defShred": 32
      }
    ]
  },
  "怒目金刚": {
    "id": "wp_14147",
    "category": "weapon",
    "sourceName": "怒目金刚",
    "subType": "S级·命破",
    "title": "焚心业火",
    "desc": "暴击率提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时，装备者造成的<color=#FF5521>火属性贯穿伤害</color>提升<color=#2BAD00>9%</color>，最多叠加2层，持续20秒，每层效果单独结算持续时间。",
    "stats": {
      "critRate": 20,
      "ppDmgBonus": 18
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时，装备者造成的<color=#FF5521>火属性贯穿伤害</color>提升<color=#2BAD00>9%</color>，最多叠加2层，持续20秒，每层效果单独结算持续时间。",
      "暴击率提升<color=#2BAD00>23%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时，装备者造成的<color=#FF5521>火属性贯穿伤害</color>提升<color=#2BAD00>10.35%</color>，最多叠加2层，持续20秒，每层效果单独结算持续时间。",
      "暴击率提升<color=#2BAD00>26%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时，装备者造成的<color=#FF5521>火属性贯穿伤害</color>提升<color=#2BAD00>11.7%</color>，最多叠加2层，持续20秒，每层效果单独结算持续时间。",
      "暴击率提升<color=#2BAD00>29%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时，装备者造成的<color=#FF5521>火属性贯穿伤害</color>提升<color=#2BAD00>13.05%</color>，最多叠加2层，持续20秒，每层效果单独结算持续时间。",
      "暴击率提升<color=#2BAD00>32%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时，装备者造成的<color=#FF5521>火属性贯穿伤害</color>提升<color=#2BAD00>14.4%</color>，最多叠加2层，持续20秒，每层效果单独结算持续时间。"
    ],
    "refinementStats": [
      {
        "critRate": 20,
        "ppDmgBonus": 18
      },
      {
        "critRate": 23,
        "ppDmgBonus": 20.7
      },
      {
        "critRate": 26,
        "ppDmgBonus": 23.4
      },
      {
        "critRate": 29,
        "ppDmgBonus": 26.1
      },
      {
        "critRate": 32,
        "ppDmgBonus": 28.8
      }
    ]
  },
  "昨夜来电": {
    "id": "wp_14148",
    "category": "weapon",
    "sourceName": "昨夜来电",
    "subType": "S级·击破",
    "title": "7×24",
    "desc": "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.5</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理属性</color>伤害时，装备者攻击造成的失衡值提升<color=#2BAD00>9%</color>，最多叠加3层，持续10秒，叠加到3层时，全队角色暴击伤害额外提升<color=#2BAD00>30%</color>，持续40秒，重复触发时刷新持续时间，暴击伤害提升效果全队唯一。",
    "stats": {
      "critDmg": 90
    },
    "refinementDescs": [
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.5</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理属性</color>伤害时，装备者攻击造成的失衡值提升<color=#2BAD00>9%</color>，最多叠加3层，持续10秒，叠加到3层时，全队角色暴击伤害额外提升<color=#2BAD00>30%</color>，持续40秒，重复触发时刷新持续时间，暴击伤害提升效果全队唯一。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.7</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理属性</color>伤害时，装备者攻击造成的失衡值提升<color=#2BAD00>10.3%</color>，最多叠加3层，持续10秒，叠加到3层时，全队角色暴击伤害额外提升<color=#2BAD00>34.5%</color>，持续40秒，重复触发时刷新持续时间，暴击伤害提升效果全队唯一。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>1.9</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理属性</color>伤害时，装备者攻击造成的失衡值提升<color=#2BAD00>11.7%</color>，最多叠加3层，持续10秒，叠加到3层时，全队角色暴击伤害额外提升<color=#2BAD00>39%</color>，持续40秒，重复触发时刷新持续时间，暴击伤害提升效果全队唯一。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>2.1</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理属性</color>伤害时，装备者攻击造成的失衡值提升<color=#2BAD00>13%</color>，最多叠加3层，持续10秒，叠加到3层时，全队角色暴击伤害额外提升<color=#2BAD00>43.5%</color>，持续40秒，重复触发时刷新持续时间，暴击伤害提升效果全队唯一。",
      "位于后场时，装备者的能量自动回复提升<color=#2BAD00>2.3</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理属性</color>伤害时，装备者攻击造成的失衡值提升<color=#2BAD00>14.5%</color>，最多叠加3层，持续10秒，叠加到3层时，全队角色暴击伤害额外提升<color=#2BAD00>48%</color>，持续40秒，重复触发时刷新持续时间，暴击伤害提升效果全队唯一。"
    ],
    "refinementStats": [
      {
        "critDmg": 90
      },
      {
        "critDmg": 103.5
      },
      {
        "critDmg": 117
      },
      {
        "critDmg": 130.5
      },
      {
        "critDmg": 144
      }
    ]
  },
  "思络成歌": {
    "id": "wp_14149",
    "category": "weapon",
    "sourceName": "思络成歌",
    "subType": "S级·支援",
    "title": "喧响独白",
    "desc": "装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.6</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理伤害</color>时，使全队角色获得增益效果：角色造成伤害提升<color=#2BAD00>12.5%</color>，效果持续40秒，最多叠加2层，重复触发时刷新持续时间；拥有2层效果时，角色的攻击力额外提升<color=#2BAD00>10%</color>，该效果全队唯一。",
    "stats": {
      "dmgBonus": 25,
      "inCombatAtkPct": 10
    },
    "refinementDescs": [
      "装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.6</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理伤害</color>时，使全队角色获得增益效果：角色造成伤害提升<color=#2BAD00>12.5%</color>，效果持续40秒，最多叠加2层，重复触发时刷新持续时间；拥有2层效果时，角色的攻击力额外提升<color=#2BAD00>10%</color>，该效果全队唯一。",
      "装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.69</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理伤害</color>时，使全队角色获得增益效果：角色造成伤害提升<color=#2BAD00>14.3%</color>，效果持续40秒，最多叠加2层，重复触发时刷新持续时间；拥有2层效果时，角色的攻击力额外提升<color=#2BAD00>11.5%</color>，该效果全队唯一。",
      "装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.78</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理伤害</color>时，使全队角色获得增益效果：角色造成伤害提升<color=#2BAD00>16.1%</color>，效果持续40秒，最多叠加2层，重复触发时刷新持续时间；拥有2层效果时，角色的攻击力额外提升<color=#2BAD00>13%</color>，该效果全队唯一。",
      "装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.87</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理伤害</color>时，使全队角色获得增益效果：角色造成伤害提升<color=#2BAD00>17.9%</color>，效果持续40秒，最多叠加2层，重复触发时刷新持续时间；拥有2层效果时，角色的攻击力额外提升<color=#2BAD00>14.5%</color>，该效果全队唯一。",
      "装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.96</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#F0D12B>物理伤害</color>时，使全队角色获得增益效果：角色造成伤害提升<color=#2BAD00>20%</color>，效果持续40秒，最多叠加2层，重复触发时刷新持续时间；拥有2层效果时，角色的攻击力额外提升<color=#2BAD00>16%</color>，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 25,
        "inCombatAtkPct": 10
      },
      {
        "dmgBonus": 28.6,
        "inCombatAtkPct": 11.5
      },
      {
        "dmgBonus": 32.2,
        "inCombatAtkPct": 13
      },
      {
        "dmgBonus": 35.8,
        "inCombatAtkPct": 14.5
      },
      {
        "dmgBonus": 40,
        "inCombatAtkPct": 16
      }
    ]
  },
  "壳中之灵": {
    "id": "wp_14150",
    "category": "weapon",
    "sourceName": "壳中之灵",
    "subType": "S级·异常",
    "title": "元气一击",
    "desc": "装备者的异常精通提升<color=#2BAD00>90</color>点；<color=#FE437E>以太属性</color>的装备者进入前场或发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时获得增益效果：对处于属性异常状态下的敌人造成的伤害提升<color=#2BAD00>20%</color>，触发的所有属性异常伤害和[紊乱]伤害提升<color=#2BAD00>10%</color>，效果持续15秒，重复触发时刷新持续时间，换回后场时该效果移除。",
    "stats": {
      "anomalyMastery": 90,
      "dmgBonus": 30
    },
    "refinementDescs": [
      "装备者的异常精通提升<color=#2BAD00>90</color>点；<color=#FE437E>以太属性</color>的装备者进入前场或发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时获得增益效果：对处于属性异常状态下的敌人造成的伤害提升<color=#2BAD00>20%</color>，触发的所有属性异常伤害和[紊乱]伤害提升<color=#2BAD00>10%</color>，效果持续15秒，重复触发时刷新持续时间，换回后场时该效果移除。",
      "装备者的异常精通提升<color=#2BAD00>103</color>点；<color=#FE437E>以太属性</color>的装备者进入前场或发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时获得增益效果：对处于属性异常状态下的敌人造成的伤害提升<color=#2BAD00>23%</color>，触发的所有属性异常伤害和[紊乱]伤害提升<color=#2BAD00>11.5%</color>，效果持续15秒，重复触发时刷新持续时间，换回后场时该效果移除。",
      "装备者的异常精通提升<color=#2BAD00>117</color>点；<color=#FE437E>以太属性</color>的装备者进入前场或发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时获得增益效果：对处于属性异常状态下的敌人造成的伤害提升<color=#2BAD00>26%</color>，触发的所有属性异常伤害和[紊乱]伤害提升<color=#2BAD00>13%</color>，效果持续15秒，重复触发时刷新持续时间，换回后场时该效果移除。",
      "装备者的异常精通提升<color=#2BAD00>130</color>点；<color=#FE437E>以太属性</color>的装备者进入前场或发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时获得增益效果：对处于属性异常状态下的敌人造成的伤害提升<color=#2BAD00>29%</color>，触发的所有属性异常伤害和[紊乱]伤害提升<color=#2BAD00>14.5%</color>，效果持续15秒，重复触发时刷新持续时间，换回后场时该效果移除。",
      "装备者的异常精通提升<color=#2BAD00>144</color>点；<color=#FE437E>以太属性</color>的装备者进入前场或发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时获得增益效果：对处于属性异常状态下的敌人造成的伤害提升<color=#2BAD00>32%</color>，触发的所有属性异常伤害和[紊乱]伤害提升<color=#2BAD00>16%</color>，效果持续15秒，重复触发时刷新持续时间，换回后场时该效果移除。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 90,
        "dmgBonus": 30
      },
      {
        "anomalyMastery": 103,
        "dmgBonus": 34.5
      },
      {
        "anomalyMastery": 117,
        "dmgBonus": 39
      },
      {
        "anomalyMastery": 130,
        "dmgBonus": 43.5
      },
      {
        "anomalyMastery": 144,
        "dmgBonus": 48
      }
    ]
  },
  "霓虹妄想": {
    "id": "wp_14151",
    "category": "weapon",
    "sourceName": "霓虹妄想",
    "subType": "S级·击破",
    "title": "迪斯科恶魔",
    "desc": "装备者的异常精通提升<color=#2BAD00>90</color>点；装备者<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[普通攻击]</color>造成<color=#FE437E>以太属性伤害</color>时，全队角色造成的伤害提升<color=#2BAD00>15%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者的异常精通额外提升<color=#2BAD00>60</color>点，该效果全队唯一。",
    "stats": {
      "anomalyMastery": 210,
      "dmgBonus": 30
    },
    "refinementDescs": [
      "装备者的异常精通提升<color=#2BAD00>90</color>点；装备者<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[普通攻击]</color>造成<color=#FE437E>以太属性伤害</color>时，全队角色造成的伤害提升<color=#2BAD00>15%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者的异常精通额外提升<color=#2BAD00>60</color>点，该效果全队唯一。",
      "装备者的异常精通提升<color=#2BAD00>103</color>点；装备者<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[普通攻击]</color>造成<color=#FE437E>以太属性伤害</color>时，全队角色造成的伤害提升<color=#2BAD00>17%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者的异常精通额外提升<color=#2BAD00>69</color>点，该效果全队唯一。",
      "装备者的异常精通提升<color=#2BAD00>117</color>点；装备者<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[普通攻击]</color>造成<color=#FE437E>以太属性伤害</color>时，全队角色造成的伤害提升<color=#2BAD00>19.5%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者的异常精通额外提升<color=#2BAD00>78</color>点，该效果全队唯一。",
      "装备者的异常精通提升<color=#2BAD00>130</color>点；装备者<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[普通攻击]</color>造成<color=#FE437E>以太属性伤害</color>时，全队角色造成的伤害提升<color=#2BAD00>21%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者的异常精通额外提升<color=#2BAD00>87</color>点，该效果全队唯一。",
      "装备者的异常精通提升<color=#2BAD00>145</color>点；装备者<color=#FFFFFF>[强化特殊技]</color>或<color=#FFFFFF>[普通攻击]</color>造成<color=#FE437E>以太属性伤害</color>时，全队角色造成的伤害提升<color=#2BAD00>24%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者的异常精通额外提升<color=#2BAD00>96</color>点，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 210,
        "dmgBonus": 30
      },
      {
        "anomalyMastery": 241,
        "dmgBonus": 34
      },
      {
        "anomalyMastery": 273,
        "dmgBonus": 39
      },
      {
        "anomalyMastery": 304,
        "dmgBonus": 42
      },
      {
        "anomalyMastery": 337,
        "dmgBonus": 48
      }
    ]
  },
  "鳞齿寻踪": {
    "id": "wp_14152",
    "category": "weapon",
    "sourceName": "鳞齿寻踪",
    "subType": "S级·强攻",
    "title": "仿生毒素",
    "desc": "暴击率提升<color=#2BAD00>25%</color>；装备者单次消耗的能量达到20点时，每消耗20点能量，获得3秒增益效果：造成<color=#2EB6FF>电属性伤害</color>时无视目标<color=#2BAD00>28%</color>防御力；重复获得时，延长持续时间，至多延长至30秒；进入接战状态时，获得10秒该增益；装备者为非当前操作中角色时，持续时间不再减少。",
    "stats": {
      "critRate": 25,
      "defShred": 28
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>25%</color>；装备者单次消耗的能量达到20点时，每消耗20点能量，获得3秒增益效果：造成<color=#2EB6FF>电属性伤害</color>时无视目标<color=#2BAD00>28%</color>防御力；重复获得时，延长持续时间，至多延长至30秒；进入接战状态时，获得10秒该增益；装备者为非当前操作中角色时，持续时间不再减少。",
      "暴击率提升<color=#2BAD00>28.8%</color>；装备者单次消耗的能量达到20点时，每消耗20点能量，获得3秒增益效果：造成<color=#2EB6FF>电属性伤害</color>时无视目标<color=#2BAD00>31.5%</color>防御力；重复获得时，延长持续时间，至多延长至30秒；进入接战状态时，获得10秒该增益；装备者为非当前操作中角色时，持续时间不再减少。",
      "暴击率提升<color=#2BAD00>32.5%</color>；装备者单次消耗的能量达到20点时，每消耗20点能量，获得3秒增益效果：造成<color=#2EB6FF>电属性伤害</color>时无视目标<color=#2BAD00>35%</color>防御力；重复获得时，延长持续时间，至多延长至30秒；进入接战状态时，获得10秒该增益；装备者为非当前操作中角色时，持续时间不再减少。",
      "暴击率提升<color=#2BAD00>36.3%</color>；装备者单次消耗的能量达到20点时，每消耗20点能量，获得3秒增益效果：造成<color=#2EB6FF>电属性伤害</color>时无视目标<color=#2BAD00>38.5%</color>防御力；重复获得时，延长持续时间，至多延长至30秒；进入接战状态时，获得10秒该增益；装备者为非当前操作中角色时，持续时间不再减少。",
      "暴击率提升<color=#2BAD00>40%</color>；装备者单次消耗的能量达到20点时，每消耗20点能量，获得3秒增益效果：造成<color=#2EB6FF>电属性伤害</color>时无视目标<color=#2BAD00>42%</color>防御力；重复获得时，延长持续时间，至多延长至30秒；进入接战状态时，获得10秒该增益；装备者为非当前操作中角色时，持续时间不再减少。"
    ],
    "refinementStats": [
      {
        "critRate": 25,
        "defShred": 28
      },
      {
        "critRate": 28.8,
        "defShred": 31.5
      },
      {
        "critRate": 32.5,
        "defShred": 35
      },
      {
        "critRate": 36.3,
        "defShred": 38.5
      },
      {
        "critRate": 40,
        "defShred": 42
      }
    ]
  },
  "辉骑面铠": {
    "id": "wp_14153",
    "category": "weapon",
    "sourceName": "辉骑面铠",
    "subType": "S级·命破",
    "title": "骑士气势",
    "desc": "暴击率提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[特殊技]</color>时，装备者造成的<color=#F0D12B>物理贯穿伤害</color>提升<color=#2BAD00>10%</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
    "stats": {
      "critRate": 20,
      "ppDmgBonus": 20
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[特殊技]</color>时，装备者造成的<color=#F0D12B>物理贯穿伤害</color>提升<color=#2BAD00>10%</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
      "暴击率提升<color=#2BAD00>23%</color>；装备者发动<color=#FFFFFF>[特殊技]</color>时，装备者造成的<color=#F0D12B>物理贯穿伤害</color>提升<color=#2BAD00>11.5%</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
      "暴击率提升<color=#2BAD00>26%</color>；装备者发动<color=#FFFFFF>[特殊技]</color>时，装备者造成的<color=#F0D12B>物理贯穿伤害</color>提升<color=#2BAD00>13%</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
      "暴击率提升<color=#2BAD00>29%</color>；装备者发动<color=#FFFFFF>[特殊技]</color>时，装备者造成的<color=#F0D12B>物理贯穿伤害</color>提升<color=#2BAD00>14.5%</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。",
      "暴击率提升<color=#2BAD00>32%</color>；装备者发动<color=#FFFFFF>[特殊技]</color>时，装备者造成的<color=#F0D12B>物理贯穿伤害</color>提升<color=#2BAD00>16%</color>，最多叠加2层，持续30秒，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "critRate": 20,
        "ppDmgBonus": 20
      },
      {
        "critRate": 23,
        "ppDmgBonus": 23
      },
      {
        "critRate": 26,
        "ppDmgBonus": 26
      },
      {
        "critRate": 29,
        "ppDmgBonus": 29
      },
      {
        "critRate": 32,
        "ppDmgBonus": 32
      }
    ]
  },
  "朔月裁霜": {
    "id": "wp_14154",
    "category": "weapon",
    "sourceName": "朔月裁霜",
    "subType": "S级·异常",
    "title": "终末裁决",
    "desc": "<color=#98EFF0>冰属性</color>的装备者发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时，自身造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>20%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者造成的<color=#FFFFFF>[异放]</color>伤害额外提升<color=#2BAD00>35%</color>。",
    "stats": {
      "dmgBonus": 110
    },
    "refinementDescs": [
      "<color=#98EFF0>冰属性</color>的装备者发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时，自身造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>20%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者造成的<color=#FFFFFF>[异放]</color>伤害额外提升<color=#2BAD00>35%</color>。",
      "<color=#98EFF0>冰属性</color>的装备者发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时，自身造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>23%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者造成的<color=#FFFFFF>[异放]</color>伤害额外提升<color=#2BAD00>38.5%</color>。",
      "<color=#98EFF0>冰属性</color>的装备者发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时，自身造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>26%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者造成的<color=#FFFFFF>[异放]</color>伤害额外提升<color=#2BAD00>42%</color>。",
      "<color=#98EFF0>冰属性</color>的装备者发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时，自身造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>29%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者造成的<color=#FFFFFF>[异放]</color>伤害额外提升<color=#2BAD00>45.5%</color>。",
      "<color=#98EFF0>冰属性</color>的装备者发动<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>时，自身造成的<color=#98EFF0>冰属性伤害</color>提升<color=#2BAD00>32%</color>，持续40秒，最多叠加2层，同一招式内最多触发一次，重复触发时刷新持续时间，拥有2层效果时，装备者造成的<color=#FFFFFF>[异放]</color>伤害额外提升<color=#2BAD00>50%</color>。"
    ],
    "refinementStats": [
      {
        "dmgBonus": 110
      },
      {
        "dmgBonus": 123
      },
      {
        "dmgBonus": 136
      },
      {
        "dmgBonus": 149
      },
      {
        "dmgBonus": 164
      }
    ]
  },
  "日冕遗蜕": {
    "id": "wp_14155",
    "category": "weapon",
    "sourceName": "日冕遗蜕",
    "subType": "A级·强攻",
    "title": "日蚀效应",
    "desc": "暴击率提升20%；装备者为佩洛伊斯时，发动<color=#FFFFFF>[终结技]</color>获得[日蚀]效果，[日蚀]效果下，装备者造成的伤害无视<color=#2BAD00>16%</color><color=#FE437E>以太伤害抗性</color>，持续45秒，重复触发时刷新持续时间，进入接战状态时，获得[日蚀]效果。",
    "stats": {
      "critRate": 20,
      "resShred": 16
    },
    "refinementDescs": [
      "暴击率提升20%；装备者为佩洛伊斯时，发动<color=#FFFFFF>[终结技]</color>获得[日蚀]效果，[日蚀]效果下，装备者造成的伤害无视<color=#2BAD00>16%</color><color=#FE437E>以太伤害抗性</color>，持续45秒，重复触发时刷新持续时间，进入接战状态时，获得[日蚀]效果。",
      "暴击率提升20%；装备者为佩洛伊斯时，发动<color=#FFFFFF>[终结技]</color>获得[日蚀]效果，[日蚀]效果下，装备者造成的伤害无视<color=#2BAD00>17.5%</color><color=#FE437E>以太伤害抗性</color>，持续45秒，重复触发时刷新持续时间，进入接战状态时，获得[日蚀]效果。",
      "暴击率提升20%；装备者为佩洛伊斯时，发动<color=#FFFFFF>[终结技]</color>获得[日蚀]效果，[日蚀]效果下，装备者造成的伤害无视<color=#2BAD00>19%</color><color=#FE437E>以太伤害抗性</color>，持续45秒，重复触发时刷新持续时间，进入接战状态时，获得[日蚀]效果。",
      "暴击率提升20%；装备者为佩洛伊斯时，发动<color=#FFFFFF>[终结技]</color>获得[日蚀]效果，[日蚀]效果下，装备者造成的伤害无视<color=#2BAD00>20.5%</color><color=#FE437E>以太伤害抗性</color>，持续45秒，重复触发时刷新持续时间，进入接战状态时，获得[日蚀]效果。",
      "暴击率提升20%；装备者为佩洛伊斯时，发动<color=#FFFFFF>[终结技]</color>获得[日蚀]效果，[日蚀]效果下，装备者造成的伤害无视<color=#2BAD00>22%</color><color=#FE437E>以太伤害抗性</color>，持续45秒，重复触发时刷新持续时间，进入接战状态时，获得[日蚀]效果。"
    ],
    "refinementStats": [
      {
        "critRate": 20,
        "resShred": 16
      },
      {
        "critRate": 20,
        "resShred": 17.5
      },
      {
        "critRate": 20,
        "resShred": 19
      },
      {
        "critRate": 20,
        "resShred": 20.5
      },
      {
        "critRate": 20,
        "resShred": 22
      }
    ]
  },
  "琳琅鎏心": {
    "id": "wp_14156",
    "category": "weapon",
    "sourceName": "琳琅鎏心",
    "subType": "S级·异常",
    "title": "无懈之礼",
    "desc": "装备者的异常精通提升<color=#2BAD00>70</color>点；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，自身造成的<color=#FFFFFF>[乱流]</color>和<color=#A6C5FD>[风化]</color>伤害提升<color=#2BAD00>7%</color>，持续40秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发一次，拥有2层该效果时，全队代理人的异常精通提升<color=#2BAD00>60</color>点，该效果全队唯一。",
    "stats": {
      "anomalyMastery": 190,
      "dmgBonus": 14
    },
    "refinementDescs": [
      "装备者的异常精通提升<color=#2BAD00>70</color>点；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，自身造成的<color=#FFFFFF>[乱流]</color>和<color=#A6C5FD>[风化]</color>伤害提升<color=#2BAD00>7%</color>，持续40秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发一次，拥有2层该效果时，全队代理人的异常精通提升<color=#2BAD00>60</color>点，该效果全队唯一。",
      "装备者的异常精通提升<color=#2BAD00>80</color>点；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，自身造成的<color=#FFFFFF>[乱流]</color>和<color=#A6C5FD>[风化]</color>伤害提升<color=#2BAD00>8%</color>，持续40秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发一次，拥有2层该效果时，全队代理人的异常精通提升<color=#2BAD00>69</color>点，该效果全队唯一。",
      "装备者的异常精通提升<color=#2BAD00>90</color>点；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，自身造成的<color=#FFFFFF>[乱流]</color>和<color=#A6C5FD>[风化]</color>伤害提升<color=#2BAD00>9%</color>，持续40秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发一次，拥有2层该效果时，全队代理人的异常精通提升<color=#2BAD00>78</color>点，该效果全队唯一。",
      "装备者的异常精通提升<color=#2BAD00>100</color>点；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，自身造成的<color=#FFFFFF>[乱流]</color>和<color=#A6C5FD>[风化]</color>伤害提升<color=#2BAD00>10%</color>，持续40秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发一次，拥有2层该效果时，全队代理人的异常精通提升<color=#2BAD00>87</color>点，该效果全队唯一。",
      "装备者的异常精通提升<color=#2BAD00>110</color>点；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，自身造成的<color=#FFFFFF>[乱流]</color>和<color=#A6C5FD>[风化]</color>伤害提升<color=#2BAD00>11%</color>，持续40秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发一次，拥有2层该效果时，全队代理人的异常精通提升<color=#2BAD00>96</color>点，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 190,
        "dmgBonus": 14
      },
      {
        "anomalyMastery": 218,
        "dmgBonus": 16
      },
      {
        "anomalyMastery": 246,
        "dmgBonus": 18
      },
      {
        "anomalyMastery": 274,
        "dmgBonus": 20
      },
      {
        "anomalyMastery": 302,
        "dmgBonus": 22
      }
    ]
  },
  "首席跟班": {
    "id": "wp_14157",
    "category": "weapon",
    "sourceName": "首席跟班",
    "subType": "S级·击破",
    "title": "天才的扈从",
    "desc": "装备者的冲击力提升<color=#2BAD00>30</color>点，造成的伤害无视目标<color=#2BAD00>15%</color><color=#FF5521>火属性伤害抗性</color>；装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.4</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#FF5521>火属性伤害</color>时，使全队代理人造成的伤害提升<color=#2BAD00>12.5%</color>，持续30秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发1次，该效果全队唯一。",
    "stats": {
      "resShred": 15,
      "dmgBonus": 25
    },
    "refinementDescs": [
      "装备者的冲击力提升<color=#2BAD00>30</color>点，造成的伤害无视目标<color=#2BAD00>15%</color><color=#FF5521>火属性伤害抗性</color>；装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.4</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#FF5521>火属性伤害</color>时，使全队代理人造成的伤害提升<color=#2BAD00>12.5%</color>，持续30秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发1次，该效果全队唯一。",
      "装备者的冲击力提升<color=#2BAD00>33</color>点，造成的伤害无视目标<color=#2BAD00>17.2%</color><color=#FF5521>火属性伤害抗性</color>；装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.46</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#FF5521>火属性伤害</color>时，使全队代理人造成的伤害提升<color=#2BAD00>14.4%</color>，持续30秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发1次，该效果全队唯一。",
      "装备者的冲击力提升<color=#2BAD00>36</color>点，造成的伤害无视目标<color=#2BAD00>19.5%</color><color=#FF5521>火属性伤害抗性</color>；装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.52</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#FF5521>火属性伤害</color>时，使全队代理人造成的伤害提升<color=#2BAD00>16.3%</color>，持续30秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发1次，该效果全队唯一。",
      "装备者的冲击力提升<color=#2BAD00>39</color>点，造成的伤害无视目标<color=#2BAD00>21.7%</color><color=#FF5521>火属性伤害抗性</color>；装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.58</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#FF5521>火属性伤害</color>时，使全队代理人造成的伤害提升<color=#2BAD00>18.1%</color>，持续30秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发1次，该效果全队唯一。",
      "装备者的冲击力提升<color=#2BAD00>42</color>点，造成的伤害无视目标<color=#2BAD00>24%</color><color=#FF5521>火属性伤害抗性</color>；装备者为非操作中角色时，能量自动回复提升<color=#2BAD00>0.64</color>点/秒；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#FF5521>火属性伤害</color>时，使全队代理人造成的伤害提升<color=#2BAD00>20%</color>，持续30秒，最多叠加2层，重复触发时刷新持续时间，同一招式内最多触发1次，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "resShred": 15,
        "dmgBonus": 25
      },
      {
        "resShred": 17.2,
        "dmgBonus": 28.8
      },
      {
        "resShred": 19.5,
        "dmgBonus": 32.6
      },
      {
        "resShred": 21.7,
        "dmgBonus": 36.2
      },
      {
        "resShred": 24,
        "dmgBonus": 40
      }
    ]
  },
  "空羽复归之诗": {
    "id": "wp_14158",
    "category": "weapon",
    "sourceName": "空羽复归之诗",
    "subType": "S级·异常",
    "title": "失乐园",
    "desc": "异常精通提升<color=#2BAD00>96</color>点；装备者触发<color=#FFA9DD>[异化]</color>反应时，自身获得属性异常伤害提升<color=#2BAD00>20%</color>的效果，并为全队角色施加造成的伤害提升<color=#2BAD00>30%</color>效果，效果均持续30秒，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 96,
      "dmgBonus": 50
    },
    "refinementDescs": [
      "异常精通提升<color=#2BAD00>96</color>点；装备者触发<color=#FFA9DD>[异化]</color>反应时，自身获得属性异常伤害提升<color=#2BAD00>20%</color>的效果，并为全队角色施加造成的伤害提升<color=#2BAD00>30%</color>效果，效果均持续30秒，重复触发时刷新持续时间。",
      "异常精通提升<color=#2BAD00>105</color>点；装备者触发<color=#FFA9DD>[异化]</color>反应时，自身获得属性异常伤害提升<color=#2BAD00>23%</color>的效果，并为全队角色施加造成的伤害提升<color=#2BAD00>34.5%</color>效果，效果均持续30秒，重复触发时刷新持续时间。",
      "异常精通提升<color=#2BAD00>115</color>点；装备者触发<color=#FFA9DD>[异化]</color>反应时，自身获得属性异常伤害提升<color=#2BAD00>26%</color>的效果，并为全队角色施加造成的伤害提升<color=#2BAD00>39%</color>效果，效果均持续30秒，重复触发时刷新持续时间。",
      "异常精通提升<color=#2BAD00>125</color>点；装备者触发<color=#FFA9DD>[异化]</color>反应时，自身获得属性异常伤害提升<color=#2BAD00>29%</color>的效果，并为全队角色施加造成的伤害提升<color=#2BAD00>43.5%</color>效果，效果均持续30秒，重复触发时刷新持续时间。",
      "异常精通提升<color=#2BAD00>135</color>点；装备者触发<color=#FFA9DD>[异化]</color>反应时，自身获得属性异常伤害提升<color=#2BAD00>32%</color>的效果，并为全队角色施加造成的伤害提升<color=#2BAD00>48%</color>效果，效果均持续30秒，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 96,
        "dmgBonus": 50
      },
      {
        "anomalyMastery": 105,
        "dmgBonus": 57.5
      },
      {
        "anomalyMastery": 115,
        "dmgBonus": 65
      },
      {
        "anomalyMastery": 125,
        "dmgBonus": 72.5
      },
      {
        "anomalyMastery": 135,
        "dmgBonus": 80
      }
    ]
  },
  "骁骑礼赞": {
    "id": "wp_14159",
    "category": "weapon",
    "sourceName": "骁骑礼赞",
    "subType": "S级·强攻",
    "title": "骑士仪典",
    "desc": "装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[强化特殊技]</color>的重击命中敌人时，获得1层<color=#FFFFFF>[兵锋]</color>，使暴击伤害提升<color=#2BAD00>32%</color>，持续25秒；<color=#FFFFFF>[兵锋]</color>最多叠加2层，且每种招式类型最多提供1层，重复触发时，刷新所有<color=#FFFFFF>[兵锋]</color>持续时间；\n拥有2层<color=#FFFFFF>[兵锋]</color>时，获得<color=#FFFFFF>[彻骨]</color>：装备者造成的伤害无视目标<color=#2BAD00>20%</color><color=#98EFF0>冰属性伤害抗性</color>。",
    "stats": {
      "critDmg": 32,
      "resShred": 20
    },
    "refinementDescs": [
      "装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[强化特殊技]</color>的重击命中敌人时，获得1层<color=#FFFFFF>[兵锋]</color>，使暴击伤害提升<color=#2BAD00>32%</color>，持续25秒；<color=#FFFFFF>[兵锋]</color>最多叠加2层，且每种招式类型最多提供1层，重复触发时，刷新所有<color=#FFFFFF>[兵锋]</color>持续时间；\n拥有2层<color=#FFFFFF>[兵锋]</color>时，获得<color=#FFFFFF>[彻骨]</color>：装备者造成的伤害无视目标<color=#2BAD00>20%</color><color=#98EFF0>冰属性伤害抗性</color>。",
      "装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[强化特殊技]</color>的重击命中敌人时，获得1层<color=#FFFFFF>[兵锋]</color>，使暴击伤害提升<color=#2BAD00>36.8%</color>，持续25秒；<color=#FFFFFF>[兵锋]</color>最多叠加2层，且每种招式类型最多提供1层，重复触发时，刷新所有<color=#FFFFFF>[兵锋]</color>持续时间；\n拥有2层<color=#FFFFFF>[兵锋]</color>时，获得<color=#FFFFFF>[彻骨]</color>：装备者造成的伤害无视目标<color=#2BAD00>23%</color><color=#98EFF0>冰属性伤害抗性</color>。",
      "装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[强化特殊技]</color>的重击命中敌人时，获得1层<color=#FFFFFF>[兵锋]</color>，使暴击伤害提升<color=#2BAD00>41.6%</color>，持续25秒；<color=#FFFFFF>[兵锋]</color>最多叠加2层，且每种招式类型最多提供1层，重复触发时，刷新所有<color=#FFFFFF>[兵锋]</color>持续时间；\n拥有2层<color=#FFFFFF>[兵锋]</color>时，获得<color=#FFFFFF>[彻骨]</color>：装备者造成的伤害无视目标<color=#2BAD00>26%</color><color=#98EFF0>冰属性伤害抗性</color>。",
      "装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[强化特殊技]</color>的重击命中敌人时，获得1层<color=#FFFFFF>[兵锋]</color>，使暴击伤害提升<color=#2BAD00>46.4%</color>，持续25秒；<color=#FFFFFF>[兵锋]</color>最多叠加2层，且每种招式类型最多提供1层，重复触发时，刷新所有<color=#FFFFFF>[兵锋]</color>持续时间；\n拥有2层<color=#FFFFFF>[兵锋]</color>时，获得<color=#FFFFFF>[彻骨]</color>：装备者造成的伤害无视目标<color=#2BAD00>29%</color><color=#98EFF0>冰属性伤害抗性</color>。",
      "装备者的<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[强化特殊技]</color>的重击命中敌人时，获得1层<color=#FFFFFF>[兵锋]</color>，使暴击伤害提升<color=#2BAD00>51.2%</color>，持续25秒；<color=#FFFFFF>[兵锋]</color>最多叠加2层，且每种招式类型最多提供1层，重复触发时，刷新所有<color=#FFFFFF>[兵锋]</color>持续时间；\n拥有2层<color=#FFFFFF>[兵锋]</color>时，获得<color=#FFFFFF>[彻骨]</color>：装备者造成的伤害无视目标<color=#2BAD00>32%</color><color=#98EFF0>冰属性伤害抗性</color>。"
    ],
    "refinementStats": [
      {
        "critDmg": 32,
        "resShred": 20
      },
      {
        "critDmg": 36.8,
        "resShred": 23
      },
      {
        "critDmg": 41.6,
        "resShred": 26
      },
      {
        "critDmg": 46.4,
        "resShred": 29
      },
      {
        "critDmg": 51.2,
        "resShred": 32
      }
    ]
  },
  "蜃炎梦火": {
    "id": "wp_14160",
    "category": "weapon",
    "sourceName": "蜃炎梦火",
    "subType": "S级·锋御",
    "title": "灼息",
    "desc": "暴击率提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时角色获得<color=#FFFFFF>[强化]</color>效果，持续25秒，进入接战状态时直接获得，重复触发时刷新持续时间；拥有<color=#FFFFFF>[强化]</color>效果时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>20%</color>，<color=#FF5521>火属性锐化伤害</color>提升<color=#2BAD00>10%</color>。",
    "stats": {
      "critRate": 20,
      "dmgBonus": 30
    },
    "refinementDescs": [
      "暴击率提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时角色获得<color=#FFFFFF>[强化]</color>效果，持续25秒，进入接战状态时直接获得，重复触发时刷新持续时间；拥有<color=#FFFFFF>[强化]</color>效果时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>20%</color>，<color=#FF5521>火属性锐化伤害</color>提升<color=#2BAD00>10%</color>。",
      "暴击率提升<color=#2BAD00>22%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时角色获得<color=#FFFFFF>[强化]</color>效果，持续25秒，进入接战状态时直接获得，重复触发时刷新持续时间；拥有<color=#FFFFFF>[强化]</color>效果时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>23%</color>，<color=#FF5521>火属性锐化伤害</color>提升<color=#2BAD00>11.5%</color>。",
      "暴击率提升<color=#2BAD00>24%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时角色获得<color=#FFFFFF>[强化]</color>效果，持续25秒，进入接战状态时直接获得，重复触发时刷新持续时间；拥有<color=#FFFFFF>[强化]</color>效果时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>26%</color>，<color=#FF5521>火属性锐化伤害</color>提升<color=#2BAD00>13%</color>。",
      "暴击率提升<color=#2BAD00>26%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时角色获得<color=#FFFFFF>[强化]</color>效果，持续25秒，进入接战状态时直接获得，重复触发时刷新持续时间；拥有<color=#FFFFFF>[强化]</color>效果时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>29%</color>，<color=#FF5521>火属性锐化伤害</color>提升<color=#2BAD00>14.5%</color>。",
      "暴击率提升<color=#2BAD00>28%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>时角色获得<color=#FFFFFF>[强化]</color>效果，持续25秒，进入接战状态时直接获得，重复触发时刷新持续时间；拥有<color=#FFFFFF>[强化]</color>效果时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>32%</color>，<color=#FF5521>火属性锐化伤害</color>提升<color=#2BAD00>16%</color>。"
    ],
    "refinementStats": [
      {
        "critRate": 20,
        "dmgBonus": 30
      },
      {
        "critRate": 22,
        "dmgBonus": 34.5
      },
      {
        "critRate": 24,
        "dmgBonus": 39
      },
      {
        "critRate": 26,
        "dmgBonus": 43.5
      },
      {
        "critRate": 28,
        "dmgBonus": 48
      }
    ]
  },
  "猩红渴望": {
    "id": "wp_14161",
    "category": "weapon",
    "sourceName": "猩红渴望",
    "subType": "S级·锋御",
    "title": "渴血",
    "desc": "装备者暴击率提升<color=#2BAD00>25%</color>；<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>15%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>或触发<color=#FFFFFF>[毁伤]</color>时，造成的<color=#2EB6FF>电属性锐化伤害</color>提升<color=#2BAD00>10%</color>，持续40秒，重复触发时刷新持续时间。",
    "stats": {
      "critRate": 25,
      "dmgBonus": 25
    },
    "refinementDescs": [
      "装备者暴击率提升<color=#2BAD00>25%</color>；<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>15%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>或触发<color=#FFFFFF>[毁伤]</color>时，造成的<color=#2EB6FF>电属性锐化伤害</color>提升<color=#2BAD00>10%</color>，持续40秒，重复触发时刷新持续时间。",
      "装备者暴击率提升<color=#2BAD00>27.5%</color>；<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>17.5%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>或触发<color=#FFFFFF>[毁伤]</color>时，造成的<color=#2EB6FF>电属性锐化伤害</color>提升<color=#2BAD00>11.5%</color>，持续40秒，重复触发时刷新持续时间。",
      "装备者暴击率提升<color=#2BAD00>30%</color>；<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>20%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>或触发<color=#FFFFFF>[毁伤]</color>时，造成的<color=#2EB6FF>电属性锐化伤害</color>提升<color=#2BAD00>13%</color>，持续40秒，重复触发时刷新持续时间。",
      "装备者暴击率提升<color=#2BAD00>32.5%</color>；<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>22.5%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>或触发<color=#FFFFFF>[毁伤]</color>时，造成的<color=#2EB6FF>电属性锐化伤害</color>提升<color=#2BAD00>14.5%</color>，持续40秒，重复触发时刷新持续时间。",
      "装备者暴击率提升<color=#2BAD00>35%</color>；<color=#2EB6FF>电属性伤害</color>提升<color=#2BAD00>25%</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>或触发<color=#FFFFFF>[毁伤]</color>时，造成的<color=#2EB6FF>电属性锐化伤害</color>提升<color=#2BAD00>16%</color>，持续40秒，重复触发时刷新持续时间。"
    ],
    "refinementStats": [
      {
        "critRate": 25,
        "dmgBonus": 25
      },
      {
        "critRate": 27.5,
        "dmgBonus": 29
      },
      {
        "critRate": 30,
        "dmgBonus": 33
      },
      {
        "critRate": 32.5,
        "dmgBonus": 37
      },
      {
        "critRate": 35,
        "dmgBonus": 41
      }
    ]
  },
  "...": {
    "id": "wp_14162",
    "category": "weapon",
    "sourceName": "...",
    "subType": "S级·击破",
    "title": "永夜辗眠",
    "desc": "装备者暴击率提升<color=#2BAD00>24%</color>；造成的伤害无视目标<color=#2BAD00>15%</color><color=#A6C5FD>风属性伤害抗性</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，造成的失衡值提升<color=#2BAD00>16%</color>，全队其他角色造成的伤害提升<color=#2BAD00>20%</color>，持续50秒，重复触发时刷新持续时间，伤害提升效果全队唯一。",
    "stats": {
      "critRate": 24,
      "resShred": 15,
      "dmgBonus": 20
    },
    "refinementDescs": [
      "装备者暴击率提升<color=#2BAD00>24%</color>；造成的伤害无视目标<color=#2BAD00>15%</color><color=#A6C5FD>风属性伤害抗性</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，造成的失衡值提升<color=#2BAD00>16%</color>，全队其他角色造成的伤害提升<color=#2BAD00>20%</color>，持续50秒，重复触发时刷新持续时间，伤害提升效果全队唯一。",
      "装备者暴击率提升<color=#2BAD00>26%</color>；造成的伤害无视目标<color=#2BAD00>17.3%</color><color=#A6C5FD>风属性伤害抗性</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，造成的失衡值提升<color=#2BAD00>18.4%</color>，全队其他角色造成的伤害提升<color=#2BAD00>23%</color>，持续50秒，重复触发时刷新持续时间，伤害提升效果全队唯一。",
      "装备者暴击率提升<color=#2BAD00>28%</color>；造成的伤害无视目标<color=#2BAD00>19.5%</color><color=#A6C5FD>风属性伤害抗性</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，造成的失衡值提升<color=#2BAD00>20.8%</color>，全队其他角色造成的伤害提升<color=#2BAD00>26%</color>，持续50秒，重复触发时刷新持续时间，伤害提升效果全队唯一。",
      "装备者暴击率提升<color=#2BAD00>30%</color>；造成的伤害无视目标<color=#2BAD00>21.8%</color><color=#A6C5FD>风属性伤害抗性</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，造成的失衡值提升<color=#2BAD00>23.2%</color>，全队其他角色造成的伤害提升<color=#2BAD00>29%</color>，持续50秒，重复触发时刷新持续时间，伤害提升效果全队唯一。",
      "装备者暴击率提升<color=#2BAD00>32%</color>；造成的伤害无视目标<color=#2BAD00>24%</color><color=#A6C5FD>风属性伤害抗性</color>；装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#A6C5FD>风属性伤害</color>时，造成的失衡值提升<color=#2BAD00>25.6%</color>，全队其他角色造成的伤害提升<color=#2BAD00>32%</color>，持续50秒，重复触发时刷新持续时间，伤害提升效果全队唯一。"
    ],
    "refinementStats": [
      {
        "critRate": 24,
        "resShred": 15,
        "dmgBonus": 20
      },
      {
        "critRate": 26,
        "resShred": 17.3,
        "dmgBonus": 23
      },
      {
        "critRate": 28,
        "resShred": 19.5,
        "dmgBonus": 26
      },
      {
        "critRate": 30,
        "resShred": 21.8,
        "dmgBonus": 29
      },
      {
        "critRate": 32,
        "resShred": 24,
        "dmgBonus": 32
      }
    ]
  },
  "禁罪囚笼": {
    "id": "wp_14163",
    "category": "weapon",
    "sourceName": "禁罪囚笼",
    "subType": "S级·强攻",
    "title": "掌中狩恶",
    "desc": "装备者暴击率提升<color=#2BAD00>20%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，使自身攻击力提升<color=#2BAD00>10%</color>，造成的伤害无视目标<color=#2BAD00>15%</color><color=#A6C5FD>风属性伤害抗性</color>，持续16秒。",
    "stats": {
      "critRate": 20,
      "inCombatAtkPct": 10,
      "resShred": 15
    },
    "refinementDescs": [
      "装备者暴击率提升<color=#2BAD00>20%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，使自身攻击力提升<color=#2BAD00>10%</color>，造成的伤害无视目标<color=#2BAD00>15%</color><color=#A6C5FD>风属性伤害抗性</color>，持续16秒。",
      "装备者暴击率提升<color=#2BAD00>23%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，使自身攻击力提升<color=#2BAD00>11.5%</color>，造成的伤害无视目标<color=#2BAD00>17.3%</color><color=#A6C5FD>风属性伤害抗性</color>，持续16秒。",
      "装备者暴击率提升<color=#2BAD00>26%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，使自身攻击力提升<color=#2BAD00>13%</color>，造成的伤害无视目标<color=#2BAD00>19.5%</color><color=#A6C5FD>风属性伤害抗性</color>，持续16秒。",
      "装备者暴击率提升<color=#2BAD00>29%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，使自身攻击力提升<color=#2BAD00>14.5%</color>，造成的伤害无视目标<color=#2BAD00>21.8%</color><color=#A6C5FD>风属性伤害抗性</color>，持续16秒。",
      "装备者暴击率提升<color=#2BAD00>32%</color>；装备者的<color=#FFFFFF>[普通攻击]</color>命中敌人时，使自身攻击力提升<color=#2BAD00>16%</color>，造成的伤害无视目标<color=#2BAD00>24%</color><color=#A6C5FD>风属性伤害抗性</color>，持续16秒。"
    ],
    "refinementStats": [
      {
        "critRate": 20,
        "inCombatAtkPct": 10,
        "resShred": 15
      },
      {
        "critRate": 23,
        "inCombatAtkPct": 11.5,
        "resShred": 17.3
      },
      {
        "critRate": 26,
        "inCombatAtkPct": 13,
        "resShred": 19.5
      },
      {
        "critRate": 29,
        "inCombatAtkPct": 14.5,
        "resShred": 21.8
      },
      {
        "critRate": 32,
        "inCombatAtkPct": 16,
        "resShred": 24
      }
    ]
  },
  "涅槃初翎": {
    "id": "wp_14164",
    "category": "weapon",
    "sourceName": "涅槃初翎",
    "subType": "S级·异常",
    "title": "破壳日",
    "desc": "装备者的异常精通提升<color=#2BAD00>90</color>点；队伍中任意角色对敌人造成的属性异常伤害产生暴击时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>40%</color>，持续20秒，重复触发刷新持续时间。",
    "stats": {
      "anomalyMastery": 90,
      "dmgBonus": 40
    },
    "refinementDescs": [
      "装备者的异常精通提升<color=#2BAD00>90</color>点；队伍中任意角色对敌人造成的属性异常伤害产生暴击时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>40%</color>，持续20秒，重复触发刷新持续时间。",
      "装备者的异常精通提升<color=#2BAD00>99</color>点；队伍中任意角色对敌人造成的属性异常伤害产生暴击时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>44%</color>，持续20秒，重复触发刷新持续时间。",
      "装备者的异常精通提升<color=#2BAD00>108</color>点；队伍中任意角色对敌人造成的属性异常伤害产生暴击时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>48%</color>，持续20秒，重复触发刷新持续时间。",
      "装备者的异常精通提升<color=#2BAD00>117</color>点；队伍中任意角色对敌人造成的属性异常伤害产生暴击时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>52%</color>，持续20秒，重复触发刷新持续时间。",
      "装备者的异常精通提升<color=#2BAD00>126</color>点；队伍中任意角色对敌人造成的属性异常伤害产生暴击时，装备者造成的<color=#FF5521>火属性伤害</color>提升<color=#2BAD00>56%</color>，持续20秒，重复触发刷新持续时间。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 90,
        "dmgBonus": 40
      },
      {
        "anomalyMastery": 99,
        "dmgBonus": 44
      },
      {
        "anomalyMastery": 108,
        "dmgBonus": 48
      },
      {
        "anomalyMastery": 117,
        "dmgBonus": 52
      },
      {
        "anomalyMastery": 126,
        "dmgBonus": 56
      }
    ]
  },
  "蛛蜕遗歌": {
    "id": "wp_14165",
    "category": "weapon",
    "sourceName": "蛛蜕遗歌",
    "subType": "S级·异常",
    "title": "千丝娑罗",
    "desc": "装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#2EB6FF>电属性伤害</color>时，自身异常精通提升<color=#2BAD00>30</color>点，持续30秒，最多叠加3层，每层效果单独结算持续时间，同一招式最多触发1次。拥有3层效果时，自身造成的伤害提升<color=#2BAD00>30%</color>，<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>15%</color>。",
    "stats": {
      "anomalyMastery": 90,
      "dmgBonus": 45
    },
    "refinementDescs": [
      "装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#2EB6FF>电属性伤害</color>时，自身异常精通提升<color=#2BAD00>30</color>点，持续30秒，最多叠加3层，每层效果单独结算持续时间，同一招式最多触发1次。拥有3层效果时，自身造成的伤害提升<color=#2BAD00>30%</color>，<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>15%</color>。",
      "装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#2EB6FF>电属性伤害</color>时，自身异常精通提升<color=#2BAD00>35</color>点，持续30秒，最多叠加3层，每层效果单独结算持续时间，同一招式最多触发1次。拥有3层效果时，自身造成的伤害提升<color=#2BAD00>35%</color>，<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>17%</color>。",
      "装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#2EB6FF>电属性伤害</color>时，自身异常精通提升<color=#2BAD00>39</color>点，持续30秒，最多叠加3层，每层效果单独结算持续时间，同一招式最多触发1次。拥有3层效果时，自身造成的伤害提升<color=#2BAD00>39%</color>，<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>20%</color>。",
      "装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#2EB6FF>电属性伤害</color>时，自身异常精通提升<color=#2BAD00>44</color>点，持续30秒，最多叠加3层，每层效果单独结算持续时间，同一招式最多触发1次。拥有3层效果时，自身造成的伤害提升<color=#2BAD00>44%</color>，<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>22%</color>。",
      "装备者发动<color=#FFFFFF>[强化特殊技]</color>造成<color=#2EB6FF>电属性伤害</color>时，自身异常精通提升<color=#2BAD00>48</color>点，持续30秒，最多叠加3层，每层效果单独结算持续时间，同一招式最多触发1次。拥有3层效果时，自身造成的伤害提升<color=#2BAD00>48%</color>，<color=#FFFFFF>[紊乱]</color>伤害提升<color=#2BAD00>24%</color>。"
    ],
    "refinementStats": [
      {
        "anomalyMastery": 90,
        "dmgBonus": 45
      },
      {
        "anomalyMastery": 105,
        "dmgBonus": 52
      },
      {
        "anomalyMastery": 117,
        "dmgBonus": 59
      },
      {
        "anomalyMastery": 132,
        "dmgBonus": 66
      },
      {
        "anomalyMastery": 144,
        "dmgBonus": 72
      }
    ]
  },
  "星韵流彩": {
    "id": "wp_14166",
    "category": "weapon",
    "sourceName": "星韵流彩",
    "subType": "S级·防护",
    "title": "华章夜曲",
    "desc": "装备者施加的护盾值提升<color=#2BAD00>15%</color>；施加护盾时使全队角色锐暴伤害提升<color=#2BAD00>15%</color>，持续20秒，重复触发延长持续时间，最高不超过30秒，该效果全队唯一；装备者发动[追加攻击]时，使全队角色伤害提升<color=#2BAD00>8.5%</color>，持续20秒，最多可叠加2层，重复触发刷新持续时间，该效果全队唯一。",
    "stats": {
      "sharpCritDmg": 15,
      "dmgBonus": 17
    },
    "refinementDescs": [
      "装备者施加的护盾值提升<color=#2BAD00>15%</color>；施加护盾时使全队角色锐暴伤害提升<color=#2BAD00>15%</color>，持续20秒，重复触发延长持续时间，最高不超过30秒，该效果全队唯一；装备者发动[追加攻击]时，使全队角色伤害提升<color=#2BAD00>8.5%</color>，持续20秒，最多可叠加2层，重复触发刷新持续时间，该效果全队唯一。",
      "装备者施加的护盾值提升<color=#2BAD00>17.3%</color>；施加护盾时使全队角色锐暴伤害提升<color=#2BAD00>17.3%</color>，持续20秒，重复触发延长持续时间，最高不超过30秒，该效果全队唯一；装备者发动[追加攻击]时，使全队角色伤害提升<color=#2BAD00>9.8%</color>，持续20秒，最多可叠加2层，重复触发刷新持续时间，该效果全队唯一。",
      "装备者施加的护盾值提升<color=#2BAD00>19.5%</color>；施加护盾时使全队角色锐暴伤害提升<color=#2BAD00>19.5%</color>，持续20秒，重复触发延长持续时间，最高不超过30秒，该效果全队唯一；装备者发动[追加攻击]时，使全队角色伤害提升<color=#2BAD00>11%</color>，持续20秒，最多可叠加2层，重复触发刷新持续时间，该效果全队唯一。",
      "装备者施加的护盾值提升<color=#2BAD00>21.8%</color>；施加护盾时使全队角色锐暴伤害提升<color=#2BAD00>21.8%</color>，持续20秒，重复触发延长持续时间，最高不超过30秒，该效果全队唯一；装备者发动[追加攻击]时，使全队角色伤害提升<color=#2BAD00>12.3%</color>，持续20秒，最多可叠加2层，重复触发刷新持续时间，该效果全队唯一。",
      "装备者施加的护盾值提升<color=#2BAD00>24%</color>；施加护盾时使全队角色锐暴伤害提升<color=#2BAD00>24%</color>，持续20秒，重复触发延长持续时间，最高不超过30秒，该效果全队唯一；装备者发动[追加攻击]时，使全队角色伤害提升<color=#2BAD00>13.6%</color>，持续20秒，最多可叠加2层，重复触发刷新持续时间，该效果全队唯一。"
    ],
    "refinementStats": [
      {
        "sharpCritDmg": 15,
        "dmgBonus": 17
      },
      {
        "sharpCritDmg": 17.3,
        "dmgBonus": 19.6
      },
      {
        "sharpCritDmg": 19.5,
        "dmgBonus": 22
      },
      {
        "sharpCritDmg": 21.8,
        "dmgBonus": 24.6
      },
      {
        "sharpCritDmg": 24,
        "dmgBonus": 27.2
      }
    ]
  }
};

export const DA_SEASONS: DaSeasonInfo[] = [
  {
    "season": 53,
    "version": "3.4",
    "startDate": "2026.11.20",
    "endDate": "2026.12.04",
    "dateLabel": "2026.11.20 - 12.04",
    "bosses": [
      "库萨里库",
      "自律强袭单位·「提丰·破坏者型」",
      "僭越者",
      "异构·基塔布鲁·滞变畸兽"
    ],
    "bossBuffIds": [
      "da_boss_69015105",
      "da_boss_69010205",
      "da_boss_69013003",
      "da_boss_69015205"
    ],
    "weatherBuffIds": [
      "da_weather_69015301",
      "da_weather_69015302",
      "da_weather_69015303"
    ]
  },
  {
    "season": 52,
    "version": "3.4",
    "startDate": "2026.11.06",
    "endDate": "2026.11.20",
    "dateLabel": "2026.11.06 - 11.20",
    "bosses": [
      "新生之结·？？？",
      "魇缚者·叶释渊",
      "基塔布鲁",
      "异构·基塔布鲁·滞变畸兽"
    ],
    "bossBuffIds": [
      "da_boss_69015107",
      "da_boss_69013004",
      "da_boss_69013003",
      "da_boss_69015205"
    ],
    "weatherBuffIds": [
      "da_weather_69015201",
      "da_weather_69015202",
      "da_weather_69015203"
    ]
  },
  {
    "season": 51,
    "version": "3.4",
    "startDate": "2026.10.23",
    "endDate": "2026.11.06",
    "dateLabel": "2026.10.23 - 11.06",
    "bosses": [
      "新生之结·？？？",
      "焚昼余火·法厄同",
      "僭越者",
      "异构·库萨里库"
    ],
    "bossBuffIds": [
      "da_boss_69015107",
      "da_boss_69013003",
      "da_boss_69015105"
    ],
    "weatherBuffIds": [
      "da_weather_69015101",
      "da_weather_69015102",
      "da_weather_69015103"
    ]
  },
  {
    "season": 50,
    "version": "3.3",
    "startDate": "2026.10.09",
    "endDate": "2026.10.23",
    "dateLabel": "2026.10.09 - 10.23",
    "bosses": [
      "熔狱行赭",
      "库萨里库",
      "焚昼余火·法厄同",
      "异构·基塔布鲁"
    ],
    "bossBuffIds": [
      "da_boss_69014412",
      "da_boss_69013005",
      "da_boss_69013003",
      "da_boss_69015006"
    ],
    "weatherBuffIds": [
      "da_weather_69015001",
      "da_weather_69015002",
      "da_weather_69015003"
    ]
  },
  {
    "season": 49,
    "version": "3.3",
    "startDate": "2026.09.25",
    "endDate": "2026.10.09",
    "dateLabel": "2026.09.25 - 10.09",
    "bosses": [
      "僭越者",
      "熔狱行赭",
      "自律强袭单位·「提丰·破坏者型」",
      "复写体·猎血清道夫"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69014412",
      "da_boss_69010205",
      "da_boss_69014904"
    ],
    "weatherBuffIds": [
      "da_weather_69014901",
      "da_weather_69014902",
      "da_weather_69014903"
    ]
  },
  {
    "season": 48,
    "version": "3.3",
    "startDate": "2026.09.11",
    "endDate": "2026.09.25",
    "dateLabel": "2026.09.11 - 09.25",
    "bosses": [
      "僭越者",
      "未知复合侵蚀体",
      "叛律孤歌·薇斯珀",
      "异构·基塔布鲁·滞变畸兽"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69010305",
      "da_boss_69014804"
    ],
    "weatherBuffIds": [
      "da_weather_69014801",
      "da_weather_69014802",
      "da_weather_69014803"
    ]
  },
  {
    "season": 47,
    "version": "3.2",
    "startDate": "2026.08.28",
    "endDate": "2026.09.11",
    "dateLabel": "2026.08.28 - 09.11",
    "bosses": [
      "焚昼余火·法厄同",
      "熔狱行赭",
      "库萨里库",
      "异构·基塔布鲁"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69014410",
      "da_boss_69013005",
      "da_boss_69014711"
    ],
    "weatherBuffIds": [
      "da_weather_69014701",
      "da_weather_69014702",
      "da_weather_69014703"
    ]
  },
  {
    "season": 46,
    "version": "3.1",
    "startDate": "2026.08.14",
    "endDate": "2026.08.28",
    "dateLabel": "2026.08.14 - 08.28",
    "bosses": [
      "库萨里库",
      "秽息妖鬼·名可名",
      "魇缚者·叶释渊",
      "异构·焚昼余火·法厄同"
    ],
    "bossBuffIds": [
      "da_boss_69013005",
      "da_boss_69013003",
      "da_boss_69013004",
      "da_boss_69014504"
    ],
    "weatherBuffIds": [
      "da_weather_69014501",
      "da_weather_69014502",
      "da_weather_69014601"
    ]
  },
  {
    "season": 45,
    "version": "3.1",
    "startDate": "2026.07.31",
    "endDate": "2026.08.14",
    "dateLabel": "2026.07.31 - 08.14",
    "bosses": [
      "库萨里库",
      "基塔布鲁·滞变畸兽",
      "魇缚者·叶释渊",
      "异构·焚昼余火·法厄同"
    ],
    "bossBuffIds": [
      "da_boss_69013005",
      "da_boss_69013003",
      "da_boss_69013004",
      "da_boss_69014504"
    ],
    "weatherBuffIds": [
      "da_weather_69014603",
      "da_weather_69014502",
      "da_weather_69014503"
    ]
  },
  {
    "season": 44,
    "version": "3.1",
    "startDate": "2026.07.17",
    "endDate": "2026.07.31",
    "dateLabel": "2026.07.17 - 07.31",
    "bosses": [
      "初生死路屠夫",
      "基塔布鲁",
      "太初梦魇·「始主」",
      "复写体·猎血清道夫"
    ],
    "bossBuffIds": [
      "da_boss_69014403",
      "da_boss_69013003",
      "da_boss_69013001",
      "da_boss_69014407"
    ],
    "weatherBuffIds": [
      "da_weather_69014401",
      "da_weather_69014402",
      "da_weather_69013201"
    ]
  },
  {
    "season": 43,
    "version": "3.0",
    "startDate": "2026.07.03",
    "endDate": "2026.07.17",
    "dateLabel": "2026.07.03 - 07.17",
    "bosses": [
      "基塔布鲁·滞变畸兽",
      "魇缚者·叶释渊",
      "秽息司祭",
      "复写体·猎血清道夫"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69013004",
      "da_boss_69013002",
      "da_boss_69014407"
    ],
    "weatherBuffIds": [
      "da_weather_69014201",
      "da_weather_69014301",
      "da_weather_69013604"
    ]
  },
  {
    "season": 42,
    "version": "3.0",
    "startDate": "2026.06.19",
    "endDate": "2026.07.03",
    "dateLabel": "2026.06.19 - 07.03",
    "bosses": [
      "基塔布鲁·滞变畸兽",
      "恶名·死路屠夫",
      "未知复合侵蚀体",
      "异构·基塔布鲁"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69010402",
      "da_boss_69010305",
      "da_boss_69014203"
    ],
    "weatherBuffIds": [
      "da_weather_69014201",
      "da_weather_69014202",
      "da_weather_69013201"
    ]
  },
  {
    "season": 41,
    "version": "2.8",
    "startDate": "2026.06.05",
    "endDate": "2026.06.19",
    "dateLabel": "2026.06.05 - 06.19",
    "bosses": [
      "焚昼余火·法厄同",
      "恶名·庞培",
      "秽息妖鬼·名可名"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69014103"
    ],
    "weatherBuffIds": [
      "da_weather_69014003",
      "da_weather_69014002",
      "da_weather_69014101"
    ]
  },
  {
    "season": 40,
    "version": "2.8",
    "startDate": "2026.05.22",
    "endDate": "2026.06.05",
    "dateLabel": "2026.05.22 - 06.05",
    "bosses": [
      "基塔布鲁",
      "太初梦魇·「始主」",
      "魇缚者·叶释渊"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69013001",
      "da_boss_69013004"
    ],
    "weatherBuffIds": [
      "da_weather_69013901",
      "da_weather_69014001",
      "da_weather_69014002"
    ]
  },
  {
    "season": 39,
    "version": "2.8",
    "startDate": "2026.05.08",
    "endDate": "2026.05.22",
    "dateLabel": "2026.05.08 - 05.22",
    "bosses": [
      "基塔布鲁",
      "恶名·冥宁芙",
      "魇缚者·叶释渊"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69011204",
      "da_boss_69013004"
    ],
    "weatherBuffIds": [
      "da_weather_69013901",
      "da_weather_69013902",
      "da_weather_69014102"
    ]
  },
  {
    "season": 38,
    "version": "2.7",
    "startDate": "2026.04.24",
    "endDate": "2026.05.08",
    "dateLabel": "2026.04.24 - 05.08",
    "bosses": [
      "秽息妖鬼·名可名",
      "魇缚者·叶释渊",
      "「亵渎者」"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69013004",
      "da_boss_69013001"
    ],
    "weatherBuffIds": [
      "da_weather_69013801",
      "da_weather_69013701",
      "da_weather_69013201"
    ]
  },
  {
    "season": 37,
    "version": "2.7",
    "startDate": "2026.04.10",
    "endDate": "2026.04.24",
    "dateLabel": "2026.04.10 - 04.24",
    "bosses": [
      "恶名·死路屠夫",
      "魇缚者·叶释渊",
      "叛律孤歌·薇斯珀"
    ],
    "bossBuffIds": [
      "da_boss_69010402",
      "da_boss_69013004",
      "da_boss_69013003"
    ],
    "weatherBuffIds": [
      "da_weather_69013603",
      "da_weather_69013701",
      "da_weather_69013703"
    ]
  },
  {
    "season": 36,
    "version": "2.7",
    "startDate": "2026.03.27",
    "endDate": "2026.04.10",
    "dateLabel": "2026.03.27 - 04.10",
    "bosses": [
      "焚昼余火·法厄同",
      "彷徨猎手",
      "「亵渎者」"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69013002",
      "da_boss_69013001"
    ],
    "weatherBuffIds": [
      "da_weather_69013603",
      "da_weather_69013604",
      "da_weather_69012403"
    ]
  },
  {
    "season": 35,
    "version": "2.6",
    "startDate": "2026.03.13",
    "endDate": "2026.03.27",
    "dateLabel": "2026.03.13 - 03.27",
    "bosses": [
      "猎血清道夫",
      "太初梦魇·「始主」",
      "「亵渎者」"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69013001"
    ],
    "weatherBuffIds": [
      "da_weather_69013301",
      "da_weather_69013501",
      "da_weather_69013201"
    ]
  },
  {
    "season": 34,
    "version": "2.6",
    "startDate": "2026.02.27",
    "endDate": "2026.03.13",
    "dateLabel": "2026.02.27 - 03.13",
    "bosses": [
      "叛律孤歌·薇斯珀",
      "未知复合侵蚀体",
      "魇缚者·叶释渊"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69010305",
      "da_boss_69013004"
    ],
    "weatherBuffIds": [
      "da_weather_69013301",
      "da_weather_69012403",
      "da_weather_69011201"
    ]
  },
  {
    "season": 33,
    "version": "2.6",
    "startDate": "2026.02.13",
    "endDate": "2026.02.27",
    "dateLabel": "2026.02.13 - 02.27",
    "bosses": [
      "猎血清道夫",
      "秽息司祭",
      "恶名·冥宁芙"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69013002",
      "da_boss_69011204"
    ],
    "weatherBuffIds": [
      "da_weather_69013301",
      "da_weather_69013302",
      "da_weather_69013402"
    ]
  },
  {
    "season": 32,
    "version": "2.5",
    "startDate": "2026.01.30",
    "endDate": "2026.02.13",
    "dateLabel": "2026.01.30 - 02.13",
    "bosses": [
      "秽息妖鬼·名可名",
      "魇缚者·叶释渊",
      "恶名·庞培"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69013004",
      "da_boss_69010503"
    ],
    "weatherBuffIds": [
      "da_weather_69013201",
      "da_weather_69013202",
      "da_weather_69011904"
    ]
  },
  {
    "season": 31,
    "version": "2.5",
    "startDate": "2026.01.16",
    "endDate": "2026.01.30",
    "dateLabel": "2026.01.16 - 01.30",
    "bosses": [
      "叛律孤歌·薇斯珀",
      "「亵渎者」",
      "彷徨猎手"
    ],
    "bossBuffIds": [
      "da_boss_69013003",
      "da_boss_69013001",
      "da_boss_69013002"
    ],
    "weatherBuffIds": [
      "da_weather_69013101",
      "da_weather_69013102",
      "da_weather_69012101"
    ]
  },
  {
    "season": 30,
    "version": "2.4",
    "startDate": "2026.01.02",
    "endDate": "2026.01.16",
    "dateLabel": "2026.01.02 - 01.16",
    "bosses": [
      "太初梦魇·「始主」",
      "秽息司祭",
      "恶名·死路屠夫"
    ],
    "bossBuffIds": [
      "da_boss_69013001",
      "da_boss_69013002",
      "da_boss_69010402"
    ],
    "weatherBuffIds": [
      "da_weather_69012904",
      "da_weather_69012905",
      "da_weather_69012801"
    ]
  },
  {
    "season": 29,
    "version": "2.4",
    "startDate": "2025.12.19",
    "endDate": "2026.01.02",
    "dateLabel": "2025.12.19 - 2026.01.02",
    "bosses": [
      "太初梦魇·「始主」",
      "未知复合侵蚀体",
      "彷徨猎手"
    ],
    "bossBuffIds": [
      "da_boss_69013001",
      "da_boss_69010305",
      "da_boss_69013002"
    ],
    "weatherBuffIds": [
      "da_weather_69012901",
      "da_weather_69012902",
      "da_weather_69012903"
    ]
  },
  {
    "season": 28,
    "version": "2.4",
    "startDate": "2025.12.05",
    "endDate": "2025.12.19",
    "dateLabel": "2025.12.05 - 12.19",
    "bosses": [
      "「亵渎者」",
      "恶名·冥宁芙",
      "秽息司祭"
    ],
    "bossBuffIds": [
      "da_boss_69013001",
      "da_boss_69011204",
      "da_boss_69013002"
    ],
    "weatherBuffIds": [
      "da_weather_69012703",
      "da_weather_69012801",
      "da_weather_69011904"
    ]
  },
  {
    "season": 27,
    "version": "2.4",
    "startDate": "2025.11.21",
    "endDate": "2025.12.05",
    "dateLabel": "2025.11.21 - 12.05",
    "bosses": [
      "太初梦魇·「始主」",
      "秽息妖鬼·名可名",
      "彷徨猎手"
    ],
    "bossBuffIds": [
      "da_boss_69013001",
      "da_boss_69013003",
      "da_boss_69013002"
    ],
    "weatherBuffIds": [
      "da_weather_69012703",
      "da_weather_69012301",
      "da_weather_69011202"
    ]
  },
  {
    "season": 26,
    "version": "2.3",
    "startDate": "2025.11.14",
    "endDate": "2025.11.21",
    "dateLabel": "2025.11.14 - 11.21",
    "bosses": [
      "彷徨猎手",
      "魇缚者·叶释渊",
      "牲鬼·布林格"
    ],
    "bossBuffIds": [
      "da_boss_69013002",
      "da_boss_69013004",
      "da_boss_69013003"
    ],
    "weatherBuffIds": [
      "da_weather_69012701",
      "da_weather_69012702",
      "da_weather_69010201"
    ]
  },
  {
    "season": 25,
    "version": "2.3",
    "startDate": "2025.11.07",
    "endDate": "2025.11.21",
    "dateLabel": "2025.11.07 - 11.21",
    "bosses": [
      "恶名·冥宁芙",
      "魇缚者·叶释渊",
      "秽息妖鬼·名可名"
    ],
    "bossBuffIds": [
      "da_boss_69011204",
      "da_boss_69013004",
      "da_boss_69013003"
    ],
    "weatherBuffIds": [
      "da_weather_69011301",
      "da_weather_69012501",
      "da_weather_69010301"
    ]
  },
  {
    "season": 24,
    "version": "2.3",
    "startDate": "2025.10.24",
    "endDate": "2025.11.07",
    "dateLabel": "2025.10.24 - 11.07",
    "bosses": [
      "彷徨猎手",
      "自律强袭单位·「提丰·破坏者型」",
      "秽息司祭"
    ],
    "bossBuffIds": [
      "da_boss_69013002",
      "da_boss_69010205"
    ],
    "weatherBuffIds": [
      "da_weather_69012401",
      "da_weather_69010103",
      "da_weather_69012402"
    ]
  },
  {
    "season": 23,
    "version": "2.3",
    "startDate": "2025.10.10",
    "endDate": "2025.10.24",
    "dateLabel": "2025.10.10 - 10.24",
    "bosses": [
      "彷徨猎手",
      "秽息妖鬼·名可名",
      "「亵渎者」"
    ],
    "bossBuffIds": [
      "da_boss_69013002",
      "da_boss_69013003",
      "da_boss_69013001"
    ],
    "weatherBuffIds": [
      "da_weather_69012201",
      "da_weather_69012301",
      "da_weather_69012403"
    ]
  },
  {
    "season": 22,
    "version": "2.2",
    "startDate": "2025.10.03",
    "endDate": "2025.10.10",
    "dateLabel": "2025.10.03 - 10.10",
    "bosses": [
      "秽息司祭",
      "「亵渎者」",
      "恶名·死路屠夫"
    ],
    "bossBuffIds": [
      "da_boss_69013002",
      "da_boss_69013001",
      "da_boss_69010402"
    ],
    "weatherBuffIds": [
      "da_weather_69012201",
      "da_weather_69012403",
      "da_weather_69012301"
    ]
  },
  {
    "season": 21,
    "version": "2.2",
    "startDate": "2025.09.26",
    "endDate": "2025.10.10",
    "dateLabel": "2025.09.26 - 10.10",
    "bosses": [
      "秽息妖鬼·名可名",
      "未知复合侵蚀体",
      "秽息司祭"
    ],
    "bossBuffIds": [
      "da_boss_69011602",
      "da_boss_69010305",
      "da_boss_69011302"
    ],
    "weatherBuffIds": [
      "da_weather_69010301",
      "da_weather_69011901",
      "da_weather_69012101"
    ]
  },
  {
    "season": 20,
    "version": "2.2",
    "startDate": "2025.09.12",
    "endDate": "2025.09.26",
    "dateLabel": "2025.09.12 - 09.26",
    "bosses": [
      "「亵渎者」",
      "恶名·死路屠夫",
      "恶名·庞培"
    ],
    "bossBuffIds": [
      "da_boss_69011902",
      "da_boss_69010402",
      "da_boss_69010503"
    ],
    "weatherBuffIds": [
      "da_weather_69012001",
      "da_weather_69010301",
      "da_weather_69011201"
    ]
  },
  {
    "season": 19,
    "version": "2.2",
    "startDate": "2025.08.29",
    "endDate": "2025.09.12",
    "dateLabel": "2025.08.29 - 09.12",
    "bosses": [
      "「亵渎者」",
      "秽息妖鬼·名可名",
      "秽息司祭"
    ],
    "bossBuffIds": [
      "da_boss_69011902",
      "da_boss_69011602",
      "da_boss_69011302"
    ],
    "weatherBuffIds": [
      "da_weather_69011901",
      "da_weather_69011601",
      "da_weather_69011904"
    ]
  },
  {
    "season": 18,
    "version": "2.1",
    "startDate": "2025.08.15",
    "endDate": "2025.08.29",
    "dateLabel": "2025.08.15 - 08.29",
    "bosses": [
      "恶名·死路屠夫",
      "秽息司祭",
      "自律强袭单位·「提丰·破坏者型」"
    ],
    "bossBuffIds": [
      "da_boss_69010402",
      "da_boss_69011302",
      "da_boss_69010205"
    ],
    "weatherBuffIds": [
      "da_weather_69011801",
      "da_weather_69011202",
      "da_weather_69011401"
    ]
  },
  {
    "season": 17,
    "version": "2.1",
    "startDate": "2025.08.01",
    "endDate": "2025.08.15",
    "dateLabel": "2025.08.01 - 08.15",
    "bosses": [
      "秽息妖鬼·名可名",
      "恶名·死路屠夫",
      "恶名·冥宁芙"
    ],
    "bossBuffIds": [
      "da_boss_69011602",
      "da_boss_69010402",
      "da_boss_69010106"
    ],
    "weatherBuffIds": [
      "da_weather_69011601",
      "da_weather_69011701",
      "da_weather_69011101"
    ]
  },
  {
    "season": 16,
    "version": "2.1",
    "startDate": "2025.07.18",
    "endDate": "2025.08.01",
    "dateLabel": "2025.07.18 - 08.01",
    "bosses": [
      "秽息司祭",
      "秽息妖鬼·名可名",
      "恶名·庞培"
    ],
    "bossBuffIds": [
      "da_boss_69011302",
      "da_boss_69011602",
      "da_boss_69010503"
    ],
    "weatherBuffIds": [
      "da_weather_69011301",
      "da_weather_69011601",
      "da_weather_69010801"
    ]
  },
  {
    "season": 15,
    "version": "2.0",
    "startDate": "2025.07.04",
    "endDate": "2025.07.18",
    "dateLabel": "2025.07.04 - 07.18",
    "bosses": [
      "秽息司祭",
      "「霸主侵蚀体·庞培」",
      "恶名·死路屠夫"
    ],
    "bossBuffIds": [
      "da_boss_69011302",
      "da_boss_69010105",
      "da_boss_69010402"
    ],
    "weatherBuffIds": [
      "da_weather_69011301",
      "da_weather_69011501",
      "da_weather_69010303"
    ]
  },
  {
    "season": 14,
    "version": "2.0",
    "startDate": "2025.06.20",
    "endDate": "2025.07.04",
    "dateLabel": "2025.06.20 - 07.04",
    "bosses": [
      "恶名·庞培",
      "未知复合侵蚀体",
      "牲鬼·布林格"
    ],
    "bossBuffIds": [
      "da_boss_69010503",
      "da_boss_69010305",
      "da_boss_69010505"
    ],
    "weatherBuffIds": [
      "da_weather_69011401",
      "da_weather_69011202",
      "da_weather_69010201"
    ]
  },
  {
    "season": 13,
    "version": "2.0",
    "startDate": "2025.06.06",
    "endDate": "2025.06.20",
    "dateLabel": "2025.06.06 - 06.20",
    "bosses": [
      "秽息司祭",
      "恶名·冥宁芙",
      "恶名·庞培"
    ],
    "bossBuffIds": [
      "da_boss_69011302",
      "da_boss_69010106",
      "da_boss_69010503"
    ],
    "weatherBuffIds": [
      "da_weather_69011301",
      "da_weather_69010103",
      "da_weather_69011001"
    ]
  },
  {
    "season": 12,
    "version": "1.7",
    "startDate": "2025.05.23",
    "endDate": "2025.06.06",
    "dateLabel": "2025.05.23 - 06.06",
    "bosses": [
      "恶名·冥宁芙",
      "牲鬼·布林格",
      "恶名·庞培"
    ],
    "bossBuffIds": [
      "da_boss_69011204",
      "da_boss_69010505",
      "da_boss_69010503"
    ],
    "weatherBuffIds": [
      "da_weather_69011201",
      "da_weather_69011202",
      "da_weather_69010301"
    ]
  },
  {
    "season": 11,
    "version": "1.7",
    "startDate": "2025.05.09",
    "endDate": "2025.05.23",
    "dateLabel": "2025.05.09 - 05.23",
    "bosses": [
      "恶名·冥宁芙",
      "恶名·死路屠夫",
      "自律强袭单位·「提丰·破坏者型」"
    ],
    "bossBuffIds": [
      "da_boss_69010106",
      "da_boss_69010402",
      "da_boss_69010205"
    ],
    "weatherBuffIds": [
      "da_weather_69011101",
      "da_weather_69010201",
      "da_weather_69010801"
    ]
  },
  {
    "season": 10,
    "version": "1.7",
    "startDate": "2025.04.25",
    "endDate": "2025.05.09",
    "dateLabel": "2025.04.25 - 05.09",
    "bosses": [
      "牲鬼·布林格",
      "未知复合侵蚀体",
      "「霸主侵蚀体·庞培」"
    ],
    "bossBuffIds": [
      "da_boss_69010505",
      "da_boss_69010305",
      "da_boss_69010105"
    ],
    "weatherBuffIds": [
      "da_weather_69010303",
      "da_weather_69010701",
      "da_weather_69011001"
    ]
  },
  {
    "season": 9,
    "version": "1.6",
    "startDate": "2025.04.11",
    "endDate": "2025.04.25",
    "dateLabel": "2025.04.11 - 04.25",
    "bosses": [
      "死路屠夫",
      "牲鬼·布林格",
      "未知复合侵蚀体"
    ],
    "bossBuffIds": [
      "da_boss_69010503",
      "da_boss_69010505",
      "da_boss_69010305"
    ],
    "weatherBuffIds": [
      "da_weather_69010801",
      "da_weather_69010901",
      "da_weather_69010502"
    ]
  },
  {
    "season": 8,
    "version": "1.6",
    "startDate": "2025.03.28",
    "endDate": "2025.04.11",
    "dateLabel": "2025.03.28 - 04.11",
    "bosses": [
      "恶名·冥宁芙",
      "自律强袭单位·「提丰·破坏者型」",
      "恶名·庞培"
    ],
    "bossBuffIds": [
      "da_boss_69010106",
      "da_boss_69010205",
      "da_boss_69010503"
    ],
    "weatherBuffIds": [
      "da_weather_69010701",
      "da_weather_69010801",
      "da_weather_69010803"
    ]
  },
  {
    "season": 7,
    "version": "1.6",
    "startDate": "2025.03.14",
    "endDate": "2025.03.28",
    "dateLabel": "2025.03.14 - 03.28",
    "bosses": [
      "未知复合侵蚀体",
      "「霸主侵蚀体·庞培」",
      "自律强袭单位·「提丰·破坏者型」"
    ],
    "bossBuffIds": [
      "da_boss_69010305",
      "da_boss_69010105",
      "da_boss_69010205"
    ],
    "weatherBuffIds": [
      "da_weather_69010701",
      "da_weather_69010201",
      "da_weather_69010303"
    ]
  },
  {
    "season": 6,
    "version": "1.5",
    "startDate": "2025.02.28",
    "endDate": "2025.03.14",
    "dateLabel": "2025.02.28 - 03.14",
    "bosses": [
      "未知复合侵蚀体",
      "牲鬼·布林格",
      "恶名·庞培"
    ],
    "bossBuffIds": [
      "da_boss_69010305",
      "da_boss_69010505",
      "da_boss_69010503"
    ],
    "weatherBuffIds": [
      "da_weather_69010601",
      "da_weather_69010602",
      "da_weather_69010303"
    ]
  },
  {
    "season": 5,
    "version": "1.5",
    "startDate": "2025.02.14",
    "endDate": "2025.02.28",
    "dateLabel": "2025.02.14 - 02.28",
    "bosses": [
      "恶名·庞培",
      "牲鬼·布林格",
      "死路屠夫"
    ],
    "bossBuffIds": [
      "da_boss_69010206",
      "da_boss_69010505",
      "da_boss_69010503"
    ],
    "weatherBuffIds": [
      "da_weather_69010401",
      "da_weather_69010501",
      "da_weather_69010502"
    ]
  },
  {
    "season": 4,
    "version": "1.5",
    "startDate": "2025.01.31",
    "endDate": "2025.02.14",
    "dateLabel": "2025.01.31 - 02.14",
    "bosses": [
      "恶名·死路屠夫",
      "自律强袭单位·「提丰·破坏者型」",
      "恶名·冥宁芙"
    ],
    "bossBuffIds": [
      "da_boss_69010402",
      "da_boss_69010205",
      "da_boss_69010106"
    ],
    "weatherBuffIds": [
      "da_weather_69010303",
      "da_weather_69010401",
      "da_weather_69010103"
    ]
  },
  {
    "season": 3,
    "version": "1.4",
    "startDate": "2025.01.17",
    "endDate": "2025.01.31",
    "dateLabel": "2025.01.17 - 01.31",
    "bosses": [
      "恶名·死路屠夫",
      "未知复合侵蚀体",
      "「霸主侵蚀体·庞培」"
    ],
    "bossBuffIds": [
      "da_boss_69010402",
      "da_boss_69010305",
      "da_boss_69010105"
    ],
    "weatherBuffIds": [
      "da_weather_69010301",
      "da_weather_69010302",
      "da_weather_69010303"
    ]
  },
  {
    "season": 2,
    "version": "1.4",
    "startDate": "2025.01.03",
    "endDate": "2025.01.17",
    "dateLabel": "2025.01.03 - 01.17",
    "bosses": [
      "牲鬼·布林格",
      "自律强袭单位·「提丰·破坏者型」",
      "死路屠夫"
    ],
    "bossBuffIds": [
      "da_boss_69010104",
      "da_boss_69010205",
      "da_boss_69010206"
    ],
    "weatherBuffIds": [
      "da_weather_69010201",
      "da_weather_69010202",
      "da_weather_69010203"
    ]
  },
  {
    "season": 1,
    "version": "1.4",
    "startDate": "2024.12.20",
    "endDate": "2025.01.03",
    "dateLabel": "2024.12.20 - 2025.01.03",
    "bosses": [
      "牲鬼·布林格",
      "「霸主侵蚀体·庞培」",
      "恶名·冥宁芙"
    ],
    "bossBuffIds": [
      "da_boss_69010104",
      "da_boss_69010105",
      "da_boss_69010106"
    ],
    "weatherBuffIds": [
      "da_weather_69010101",
      "da_weather_69010102",
      "da_weather_69010103"
    ]
  }
];

export const DA_BOSS_STAGE_BUFFS: BuffItem[] = [
  {
    "id": "da_boss_69015107",
    "category": "boss_stage",
    "sourceName": "新生之结·？？？",
    "subType": "第51/52期 (v3.4.5)",
    "dateRange": "2026.10.23 - 11.20",
    "version": "3.4.5",
    "seasons": [
      51,
      52
    ],
    "title": "新生之结·场地增益（[裂核]）",
    "desc": "· 适合<color=#FFAF2C>[锋御]</color>特性的代理人挑战。\n· 招架破除首领的强化部位或者击破其分身可以获得1层<color=#FFFFFF>[裂核]</color>，每层使首领的<color=#2BAD00>失衡易伤倍率提升10%</color>，并使全队代理人获得<color=#2BAD00>锐化伤害提升15%</color>，<color=#FFFFFF>[裂核]</color>最多叠加2层。\n· 首领受到的<color=#2BAD00>异常伤害降低30%</color>。",
    "stats": {
      "dazeVuln": 20,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_boss_69015205",
    "category": "boss_stage",
    "sourceName": "异构·基塔布鲁·滞变畸兽",
    "subType": "第52/53期 (v3.4.5)",
    "dateRange": "2026.11.06 - 12.04",
    "version": "3.4.5",
    "seasons": [
      52,
      53
    ],
    "title": "异构·基塔布鲁·滞变畸兽·场地增益（[凋蚀印记]）",
    "desc": "· 代理人对敌人施加<color=#FFFFFF>属性异常</color>状态时，目标敌人获得1层对应属性的<color=#FFFFFF>[凋蚀印记]</color>；当敌人残痕因毁伤结算被移除时，会获得2层无属性的<color=#FFFFFF>[凋蚀印记]</color>，持续10秒，<color=#FFFFFF>[凋蚀印记]</color>最多叠加3层，同属性的<color=#FFFFFF>[凋蚀印记]</color>重复触发时刷新持续时间。\n· 敌人每持有1层<color=#FFFFFF>[凋蚀印记]</color>，受到的属性异常伤害<color=#2BAD00>提升10%</color>，<color=#FFFFFF>[侵蚀壁垒]</color>受到的伤害<color=#2BAD00>提升25%</color>，受到的锐化伤害<color=#2BAD00>提升35%</color>。\n· 对敌人造成<color=#FFFFFF>[部位破坏]</color>或<color=#FFFFFF>[完美反制]</color>时，全队异常精通<color=#2BAD00>提升40点</color>，锐暴伤害<color=#2BAD00>提升15%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 105,
      "sharpCritDmg": 15,
      "anomalyMastery": 40
    }
  },
  {
    "id": "da_boss_69015105",
    "category": "boss_stage",
    "sourceName": "库萨里库",
    "subType": "第51/53期 (v3.4.5)",
    "dateRange": "2026.10.23 - 12.04",
    "version": "3.4.5",
    "seasons": [
      51,
      53
    ],
    "title": "库萨里库·场地增益（[识破]）",
    "desc": "· 适合<color=#FFAF2C>[锋御]</color>特性的代理人挑战。\n· 代理人成功使用[招架支援]应对库萨里库的[闪光技]时对其施加1层[识破]，进入失衡状态时施加2层[识破]。每层[识破]使其受到的<color=#FFAF2C>锐暴伤害提升5%</color>，并使全队<color=#FFAF2C>锐化伤害提高15%</color>，最多叠加4层，持续30秒。",
    "stats": {
      "sharpCritDmg": 20,
      "dmgBonus": 60
    }
  },
  {
    "id": "da_boss_69010205",
    "category": "boss_stage",
    "sourceName": "自律强袭单位·「提丰·破坏者型」",
    "subType": "第53期 (v3.4)",
    "dateRange": "2026.11.20 - 12.04",
    "version": "3.4",
    "seasons": [
      4,
      7,
      8,
      11,
      18,
      24,
      49,
      53
    ],
    "title": "自律强袭单位·「提丰·破坏者型」·场地增益",
    "desc": "· 代理人<color=#FFAF2C>发动[招架支援]命中首领敌人时</color>，将对其施加1层<color=#FFFFFF>[难敌四手]</color>，<color=#FFFFFF>[招架支援]</color>累计命中3次时，将触发部位破坏，并额外施加3层<color=#FFFFFF>[难敌四手]</color>，每层<color=#FFFFFF>[难敌四手]</color>会使代理人对首领敌人造成的失衡值<color=#FFAF2C>提升15%</color>，在失衡状态下<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>对其造成的伤害<color=#FFAF2C>提升10%</color>；敌人充电蓄能时，将修复受损部位并重置部位破坏进度；敌人从失衡状态恢复时，<color=#FFFFFF>[难敌四手]</color>层数将会被重置。\n· 该场战斗中，将不再消耗<color=#FFFFFF>[支援点数]</color>。",
    "stats": {
      "dmgBonus": 10
    }
  },
  {
    "id": "da_boss_69013005",
    "category": "boss_stage",
    "sourceName": "库萨里库",
    "subType": "第53期 (v3.4)",
    "dateRange": "2026.11.20 - 12.04",
    "version": "3.4",
    "seasons": [
      45,
      46,
      47,
      50,
      53
    ],
    "title": "库萨里库·场地增益",
    "desc": "· 适合<color=#FFAF2C>[锋御]</color>特性的代理人挑战。\n· 库萨里库受到的属性异常伤害<color=#FFAF2C>降低40%</color>。\n· 代理人成功使用[招架支援]应对库萨里库的[闪光技]时，将对其施加1层[识破]，使库萨里库进入失衡状态时，对其施加2层[识破]。每层[识破]会使其受到的<color=#FFAF2C>锐暴伤害提升20%</color>，[识破]最多叠加4层，持续<color=#FFAF2C>30</color>秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 80
    }
  },
  {
    "id": "da_boss_69013003",
    "category": "boss_stage",
    "sourceName": "僭越者",
    "subType": "第53期 (v3.4)",
    "dateRange": "2026.11.20 - 12.04",
    "version": "3.4",
    "seasons": [
      48,
      49,
      51,
      53
    ],
    "title": "僭越者·场地增益",
    "desc": "· 适合<color=#FFAF2C>[异常]</color>特性的代理人挑战。\n· 首领敌人受到攻击时，此次攻击造成的异常积蓄效率<color=#2BAD00>提升10%</color>。\n· 首领敌人每次进入<color=#FFFFFF>属性异常</color>状态时，都会获得1层<color=#FFFFFF>残晖印记</color>，持有的残晖印记到达<color=#2BAD00>3层</color>时，会消耗所有的残晖印记并进入<color=#FFFFFF>[蜡翼]</color>状态，<color=#2BAD00>持续30秒</color>。\n· 首领敌人处于<color=#FFFFFF>[蜡翼]</color>状态时，受到的<color=#2BAD00>属性异常伤害提升30%</color>，进入<color=#FFFFFF>属性异常</color>状态时额外累积<color=#2BAD00>5%失衡值</color>，但不再获得<color=#FFFFFF>残晖印记</color>。\n· 首领敌人进入失衡状态时，立刻进入<color=#FFFFFF>[蜡翼]</color>状态，若此时已经处于[蜡翼]状态，则刷新持续时间。\n· 每次成功触发[招架支援]/[极限闪避]应对敌人攻击，可额外获得<color=#FFAF2C>1000操作得分</color>；\n· 敌人展开空间屏障后，每次成功踩踏金色的曜界并触发招架支援，可额外获得<color=#FFAF2C>1500操作得分</color>；最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 30
    }
  },
  {
    "id": "da_boss_69014804",
    "category": "boss_stage",
    "sourceName": "异构·基塔布鲁·滞变畸兽",
    "subType": "第53期 (v3.4)",
    "dateRange": "2026.11.20 - 12.04",
    "version": "3.4",
    "seasons": [
      48,
      52,
      53
    ],
    "title": "异构·基塔布鲁·滞变畸兽·场地增益",
    "desc": "· 代理人对敌人施加属性异常状态时，目标敌人获得1层对应属性的[凋蚀印记]；当敌人残痕因毁伤结算被移除时，会获得2层无属性的[凋蚀印记]，持续10秒，[凋蚀印记]最多叠加3层，同属性的[凋蚀印记]重复触发刷新持续时间。\n· 敌人每持有1层[凋蚀印记]，受到的<color=#FFAF2C>属性异常伤害提升15%</color>，<color=#FFAF2C>[紊乱]受到的伤害提升15%</color>，受到的<color=#FFAF2C>锐化伤害提升35%</color>。\n· 对敌人造成[部位破坏]或[完美反制]时，<color=#FFAF2C>全队异常精通提升50</color>点，持续15秒，重复触发刷新持续时间。",
    "stats": {
      "dmgBonus": 65,
      "anomalyMastery": 50
    }
  },
  {
    "id": "da_boss_69013004",
    "category": "boss_stage",
    "sourceName": "魇缚者·叶释渊",
    "subType": "第52期 (v3.4)",
    "dateRange": "2026.11.06 - 11.20",
    "version": "3.4",
    "seasons": [
      25,
      26,
      32,
      34,
      43,
      45,
      46,
      52
    ],
    "title": "魇缚者·叶释渊·场地增益",
    "desc": "· 适合<color=#FFAF2C>[击破]</color>特性的代理人挑战。\n· 索贝克与魇缚者每次交替上场时，可使魇缚者获得1层<color=#FFFFFF>[合契]</color>与一层<color=#FFFFFF>[舍身]</color>，[合契]与[舍身]最多叠加3层，每层[合契]可使全属性异常积蓄抗性<color=#FFAF2C>提升15%</color>，每层[舍身]可使魇缚者防御<color=#FFAF2C>降低8%</color>；魇缚者进入失衡状态时，受到暴击伤害<color=#FFAF2C>提升50%</color>。",
    "stats": {
      "critDmg": 50
    }
  },
  {
    "id": "da_boss_69013003",
    "category": "boss_stage",
    "sourceName": "基塔布鲁",
    "subType": "第52期 (v3.4)",
    "dateRange": "2026.11.06 - 11.20",
    "version": "3.4",
    "seasons": [
      39,
      40,
      44,
      52
    ],
    "title": "基塔布鲁·场地增益",
    "desc": "· 适合<color=#FFAF2C>[异常]</color>特性的代理人挑战。\n· 代理人每次对首领施加异常状态时，会给首领施加1层[残翳]，每层[残翳]会令首领受到的<color=#2BAD00>异常伤害提升7.5%</color>，受到的[乱流]伤害<color=#2BAD00>额外提升5%</color>，持续<color=#2BAD00>10秒</color>，[残翳]最多累计<color=#2BAD00>3层</color>，每层效果单独结算持续时间；[紊乱]持续期间，首领被施加[残翳]时还会额外削减<color=#FFAF2C>[侵蚀壁垒]</color><color=#2BAD00>最大值的20%</color>，并累积<color=#2BAD00>15%的失衡值</color>（15秒内不会重复触发）；<color=#FFAF2C>[侵蚀壁垒]</color>被击破时，首领立刻获得最大层数的[残翳]；首领进入失衡状态时，会移除所有[残翳]，并施加相同层数的[裂伤]，每层[裂伤]会降低首领<color=#2BAD00>5%异常积蓄抗性</color>，并增加其<color=#2BAD00>10%失衡易伤倍率</color>；首领失衡状态结束时，移除所有[裂伤]。",
    "stats": {
      "dmgBonus": 12.5
    }
  },
  {
    "id": "da_boss_69013005",
    "category": "boss_stage",
    "sourceName": "新生之结·？？？",
    "subType": "第52期 (v3.4)",
    "dateRange": "2026.11.06 - 11.20",
    "version": "3.4",
    "seasons": [
      51,
      52
    ],
    "title": "新生之结·？？？·场地增益",
    "desc": "· 适合<color=#FFAF2C>[锋御]</color>特性的代理人挑战。\n招架破除首领的强化部位或者击破其分身可以获得1层[裂核]，每层使首领的<color=#2BAD00>失衡易伤倍率提升10%</color>，并使全队代理人获得<color=#2BAD00>锐化伤害提升15%</color>，[裂核]最多叠加2层。\n首领受到的<color=#2BAD00>异常伤害降低30%</color>。",
    "stats": {
      "dazeVuln": 20,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_boss_69013003",
    "category": "boss_stage",
    "sourceName": "焚昼余火·法厄同",
    "subType": "第51期 (v3.4)",
    "dateRange": "2026.10.23 - 11.06",
    "version": "3.4",
    "seasons": [
      36,
      41,
      47,
      50,
      51
    ],
    "title": "焚昼余火·法厄同·场地增益",
    "desc": "· 适合<color=#FFAF2C>[异常]</color>特性的代理人挑战。\n·焚昼余火开启[焚风]状态后，获得5层<color=#FFFFFF>[赴火]</color>，每层<color=#FFFFFF>[赴火]</color>使自身造成的伤害<color=#FFAF2C>提升10%</color>，且受到的暴击伤害<color=#FFAF2C>降低25%</color>。焚昼余火拥有<color=#FFFFFF>[赴火]</color>时，每次进入<color=#FFAF2C>异常状态</color>将失去一层<color=#FFFFFF>[赴火]</color>，并使后续受到的异放伤害<color=#FFAF2C>提升10%</color>，最多叠加3层，持续15秒，重复触发时刷新持续时间。\n·焚昼余火处于<color=#FFFFFF>[焚风]</color>状态期间，对焚昼余火造成部位破坏时，可获得<color=#FFAF2C>1250操作得分</color>；代理人<color=#FFAF2C>将在空中发动攻击的焚昼余火击落</color>时，可获得<color=#FFAF2C>1500操作得分</color>；<color=#FFAF2C>[完美反制]</color>焚昼余火的[特定招式]时，可获得<color=#FFAF2C>2000操作得分</color>。最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 40
    }
  },
  {
    "id": "da_boss_69013005",
    "category": "boss_stage",
    "sourceName": "异构·库萨里库",
    "subType": "第51期 (v3.4)",
    "dateRange": "2026.10.23 - 11.06",
    "version": "3.4",
    "seasons": [
      51
    ],
    "title": "异构·库萨里库·场地增益",
    "desc": "· 适合<color=#FFAF2C>[锋御]</color>特性的代理人挑战。\n· 代理人成功使用[招架支援]应对库萨里库的[闪光技]时，将对其施加1层[识破]，使库萨里库进入失衡状态时，对其施加2层[识破]。每层[识破]会使其受到的<color=#FFAF2C>锐暴伤害提升5%</color>，并使全队<color=#FFAF2C>锐化伤害提高15%</color>，[识破]最多叠加4层，持续<color=#FFAF2C>30</color>秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 80
    }
  },
  {
    "id": "da_boss_69014412",
    "category": "boss_stage",
    "sourceName": "熔狱行赭",
    "subType": "第50期 (v3.3)",
    "dateRange": "2026.10.09 - 10.23",
    "version": "3.3",
    "seasons": [
      49,
      50
    ],
    "title": "熔狱行赭·场地增益",
    "desc": "·熔狱行赭进入[熔狱]状态后，其受到的属性异常伤害降低30%；每击碎一颗<color=#2BAD00>燧石</color>，全队额外恢复<color=#FFFFFF>20</color>点能量；每触发一次[招架支援]/[极限闪避]首领会获得1层<color=#FFFFFF>[过热]</color>；累计触发两次<color=#FFAF2C>[招架支援]</color>或<color=#FFAF2C>[极限闪避]</color>首领会获得1层<color=#FFFFFF>[过热]</color>，每层<color=#FFFFFF>[过热]</color>会使全队代理人暴击伤害<color=#FFAF2C>提升25%</color>。最多叠加3层，持续20秒，触发<color=#FFAF2C>[招架支援]</color>或重复触发<color=#FFFFFF>[过热]</color>时刷新持续时间。",
    "stats": {
      "critDmg": 25
    }
  },
  {
    "id": "da_boss_69015006",
    "category": "boss_stage",
    "sourceName": "异构·基塔布鲁",
    "subType": "第50期 (v3.3)",
    "dateRange": "2026.10.09 - 10.23",
    "version": "3.3",
    "seasons": [
      50
    ],
    "title": "异构·基塔布鲁·场地增益",
    "desc": "· 代理人攻击命中首领敌人时，使首领敌人获得1点[紊相值]；同一名代理人每1秒最多施加1点[紊相值]。\n· 首领敌人持有的[紊相值]达到10点时，会立即移除所有[紊相值]并使首领敌人进入[紊相]状态。[紊相]状态期间，敌人受到的<color=#2BAD00>属性异常伤害提升20%</color>、<color=#2BAD00>暴击伤害提升120%</color>，受到的<color=#2BAD00>锐化伤害提升65%</color>，<color=#2BAD00>锐暴伤害提升25%</color>，持续10秒，重复进入[紊相]状态时刷新持续时间。\n· 代理人成功对首领敌人施加属性异常状态时，全队代理人异常精通<color=#2BAD00>提升20点</color>，持续10秒，重复触发刷新持续时间。\n· 每次成功招架基塔布鲁召唤的眷属攻击并触发<color=#FFAF2C>[活性转化]</color>时，可获得<color=#FFAF2C>500操作得分</color>；成功触发[招架支援]/[极限闪避]应对基塔布鲁的攻击时，可获得<color=#FFAF2C>1000操作得分</color>，最多可触发3次；如果成功在基塔布鲁<color=#FFAF2C>第一次开启</color>[紊乱]后的<color=#FFAF2C>25秒内击破[侵蚀壁垒]</color>，可获得<color=#FFAF2C>1500操作得分</color>。最多获得5000操作得分。",
    "stats": {
      "critDmg": 120,
      "dmgBonus": 110,
      "anomalyMastery": 20
    }
  },
  {
    "id": "da_boss_69014904",
    "category": "boss_stage",
    "sourceName": "复写体·猎血清道夫",
    "subType": "第49期 (v3.3)",
    "dateRange": "2026.09.25 - 10.09",
    "version": "3.3",
    "seasons": [
      49
    ],
    "title": "复写体·猎血清道夫·场地增益",
    "desc": "· [完美反制]首领的控制技后，全队代理人造成的<color=#FFAF2C>失衡值</color>提升15%，<color=#FFAF2C>防御力</color>提升30%，攻击命中敌人时<color=#FFAF2C>暴击伤害</color>提升75%，<color=#FFFFFF>属性异常伤害</color>提升15%。\n· 首领失衡期间，全队代理人造成的<color=#FFAF2C>锐化伤害</color>提升60%，造成的<color=#A6C5FD>风属性</color>和<color=#98EFF0>冰属性</color>暴击伤害提升80%，且无视首领40%的防御力。\n·每次成功应对首领的攻击并使其触发特殊跪地，可获得<color=#FFAF2C>1000操作得分</color>；[特定招式]期间，每次成功应对首领的攻击，可获得<color=#FFAF2C>500操作得分</color>；<color=#FFAF2C>[完美反制]</color>首领的<color=#FFAF2C>[控制技]</color>时，可获得<color=#FFAF2C>2000操作得分</color>。[特定招式]期间，通过<color=#FFAF2C>[特定招式]</color>造成<color=#FFAF2C>[完美反制]</color>时，会获得该次<color=#FFAF2C>[控制技]</color>剩余的成功应对得分。最多获得5000操作得分。",
    "stats": {
      "critDmg": 155,
      "dmgBonus": 75
    }
  },
  {
    "id": "da_boss_69010305",
    "category": "boss_stage",
    "sourceName": "未知复合侵蚀体",
    "subType": "第48期 (v3.3)",
    "dateRange": "2026.09.11 - 09.25",
    "version": "3.3",
    "seasons": [
      3,
      6,
      7,
      9,
      10,
      14,
      21,
      29,
      34,
      42,
      48
    ],
    "title": "未知复合侵蚀体·场地增益",
    "desc": "· 对首领敌人的腿部造成足够的伤害时，会触发[部位破坏]，<color=#FFAF2C>代理人成功破坏首领敌人的腿部时</color>，回复<color=#FFAF2C>1000点喧响值</color>，首领敌人获得1层<color=#FFFFFF>[崩解]</color>，持续20秒，最多4层；代理人攻击命中敌人时，目标每拥有1层<color=#FFFFFF>[崩解]</color>，暴击伤害<color=#FFAF2C>提升25%</color>。",
    "stats": {
      "critDmg": 25
    }
  },
  {
    "id": "da_boss_69013003",
    "category": "boss_stage",
    "sourceName": "叛律孤歌·薇斯珀",
    "subType": "第48期 (v3.3)",
    "dateRange": "2026.09.11 - 09.25",
    "version": "3.3",
    "seasons": [
      31,
      34,
      37,
      48
    ],
    "title": "叛律孤歌·薇斯珀·场地增益",
    "desc": "· 适合<color=#FFAF2C>[异常]</color>特性的代理人挑战。\n· 代理人异常积蓄效率<color=#FFAF2C>提升15%</color>，对叛律孤歌造成的异常伤害<color=#FFAF2C>提升30%</color>，战斗中代理人处在[以太帷幕]状态时，叛律孤歌失衡易伤倍率<color=#FFAF2C>提升30%</color>。\n<color=#FFAF2C>[控制技]</color>期间，每次成功应对首领的攻击，可获得<color=#FFAF2C>350操作得分</color>；<color=#FFAF2C>[完美反制]</color>首领的<color=#FFAF2C>[控制技]</color>时，或招架部分招式最后一击时，可对首领造成<color=#FFAF2C>[部位破坏]</color>效果，可获得<color=#FFAF2C>750操作得分</color>。[特定招式]期间，通过<color=#FFAF2C>[特定招式]</color>造成<color=#FFAF2C>[完美反制]</color>时，会获得该次<color=#FFAF2C>[控制技]</color>剩余的成功应对得分。最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 30,
      "dazeVuln": 30
    }
  },
  {
    "id": "da_boss_69014410",
    "category": "boss_stage",
    "sourceName": "熔狱行赭",
    "subType": "第47期 (v3.2)",
    "dateRange": "2026.08.28 - 09.11",
    "version": "3.2",
    "seasons": [
      47
    ],
    "title": "熔狱行赭·场地增益",
    "desc": "·熔狱行赭进入[熔狱]状态后，其受到的属性异常伤害降低30%；每触发一次[招架支援]/[极限闪避]首领会获得1层<color=#FFFFFF>[过热]</color>；累计触发两次<color=#FFAF2C>[招架支援]</color>或<color=#FFAF2C>[极限闪避]</color>首领会获得1层<color=#FFFFFF>[过热]</color>，每层<color=#FFFFFF>[过热]</color>会使全队代理人暴击伤害<color=#FFAF2C>提升25%</color>。最多叠加3层，持续20秒，触发<color=#FFAF2C>[招架支援]</color>或重复触发<color=#FFFFFF>[过热]</color>时刷新持续时间。",
    "stats": {
      "critDmg": 25
    }
  },
  {
    "id": "da_boss_69014711",
    "category": "boss_stage",
    "sourceName": "异构·基塔布鲁",
    "subType": "第47期 (v3.2)",
    "dateRange": "2026.08.28 - 09.11",
    "version": "3.2",
    "seasons": [
      47
    ],
    "title": "异构·基塔布鲁·场地增益",
    "desc": "· 代理人攻击命中首领敌人时，使首领敌人获得1点[紊相值]；同一名代理人每1秒最多施加1点[紊相值]。\n· 首领敌人持有的[紊相值]达到10点时，会立即移除所有[紊相值]并使首领敌人进入[紊相]状态。[紊相]状态期间，敌人受到的<color=#2BAD00>属性异常伤害提升40%</color>，受到的<color=#2BAD00>锐化伤害提升75%</color>，持续10秒，重复进入[紊相]状态时刷新持续时间。\n· 代理人成功对首领敌人施加属性异常状态时，全队代理人<color=#2BAD00>造成的伤害提升15%</color>，异常精通<color=#2BAD00>提升20点</color>，持续10秒，重复触发刷新持续时间。\n· 每次成功招架基塔布鲁召唤的眷属攻击并触发<color=#FFAF2C>[活性转化]</color>时，可获得<color=#FFAF2C>500操作得分</color>；成功触发[招架支援]/[极限闪避]应对基塔布鲁的攻击时，可获得<color=#FFAF2C>1000操作得分</color>，最多可触发3次；如果成功在基塔布鲁<color=#FFAF2C>第一次开启</color>[紊乱]后的<color=#FFAF2C>25秒内击破[侵蚀壁垒]</color>，可获得<color=#FFAF2C>1500操作得分</color>。最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 130,
      "anomalyMastery": 20
    }
  },
  {
    "id": "da_boss_69013003",
    "category": "boss_stage",
    "sourceName": "秽息妖鬼·名可名",
    "subType": "第46期 (v3.1)",
    "dateRange": "2026.08.14 - 08.28",
    "version": "3.1",
    "seasons": [
      23,
      25,
      27,
      32,
      38,
      41,
      46
    ],
    "title": "秽息妖鬼·名可名·场地增益",
    "desc": "· 适合<color=#FFAF2C>[异常]</color>特性的代理人挑战。\n秽息妖鬼每次进入<color=#FFAF2C>属性异常</color>时，代理人对其造成的异常伤害增加8%，最多叠加6层；开启[特定招式]时清空所有层数，每层使<color=#FFAF2C>[秽盾]</color>被削减效率提升2.5%。\n· 代理人吸引秽息妖鬼地面攻击<color=#FFAF2C>一次性引爆至少5处秽息泽</color>，且<color=#FFAF2C>未被该攻击及秽息泽爆炸命中</color>时，可获得<color=#FFAF2C>1700操作得分</color>，最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 48
    }
  },
  {
    "id": "da_boss_69014504",
    "category": "boss_stage",
    "sourceName": "异构·焚昼余火·法厄同",
    "subType": "第46期 (v3.1)",
    "dateRange": "2026.08.14 - 08.28",
    "version": "3.1",
    "seasons": [
      45,
      46
    ],
    "title": "异构·焚昼余火·法厄同·场地增益",
    "desc": "·对异构·焚昼余火其造成部位破坏或完美反制时，全队<color=#FFAF2C>锐化伤害提高40%</color>，持续60秒，重复触发时刷新持续时间。 \n·代理人攻击命中非失衡状态的敌人时，造成的失衡值<color=#FFAF2C>提升15%</color>。异构·焚昼余火处于失衡状态中时，失衡易伤倍率<color=#FFAF2C>提升20%</color>。\n·异构·焚昼余火处于<color=#FFFFFF>[岚幕]</color>状态期间，使用<color=#FFFFFF>[招架支援]</color>反制异构·焚昼余火的攻击并对其造成部位破坏时，可获得<color=#FFAF2C>1500操作得分</color>；<color=#FFAF2C>[完美反制]</color>异构·焚昼余火的[特定招式]时，可获得<color=#FFAF2C>2000操作得分</color>。最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 40,
      "dazeVuln": 20
    }
  },
  {
    "id": "da_boss_69013003",
    "category": "boss_stage",
    "sourceName": "基塔布鲁·滞变畸兽",
    "subType": "第45期 (v3.1)",
    "dateRange": "2026.07.31 - 08.14",
    "version": "3.1",
    "seasons": [
      42,
      43,
      45
    ],
    "title": "基塔布鲁·滞变畸兽·场地增益",
    "desc": "· 适合<color=#FFAF2C>[异常]</color>特性的代理人挑战。\n· 代理人对敌人施加属性异常状态时，目标敌人获得1层对应属性的[凋蚀印记]，持续30秒，最多叠加2层，同属性的[凋蚀印记]重复触发刷新持续时间。\n· 敌人每持有1层[凋蚀印记]，受到的<color=#FFAF2C>属性异常伤害提升8%</color>，<color=#FFAF2C>[紊乱]受到的伤害提升8%</color>。\n· 对敌人造成[部位破坏]或[完美反制]时，<color=#FFAF2C>全队异常精通提升60</color>点，持续30秒，重复触发刷新持续时间。",
    "stats": {
      "dmgBonus": 16,
      "anomalyMastery": 60
    }
  },
  {
    "id": "da_boss_69013001",
    "category": "boss_stage",
    "sourceName": "太初梦魇·「始主」",
    "subType": "第44期 (v3.1)",
    "dateRange": "2026.07.17 - 07.31",
    "version": "3.1",
    "seasons": [
      27,
      29,
      30,
      35,
      40,
      44
    ],
    "title": "太初梦魇·「始主」·场地增益",
    "desc": "· 适合<color=#FFAF2C>[强攻]</color>特性的代理人挑战。\n·首领受到的异常伤害<color=#2BAD00>降低30%</color>，当其从[特定招式]状态切换回普通状态，或从普通状态切换为<color=#FFAF2C>[秽盾]</color>状态时，使代理人对其造成的暴击伤害<color=#2BAD00>提升20%</color>，最多叠加3层，当其从失衡状态恢复时层数重置。\n·触发<color=#FFAF2C>[秽盾净除]</color>时，可获得<color=#FFAF2C>1000操作得分</color>；[特定招式]期间，每次成功应对首领的攻击，可获得<color=#FFAF2C>500操作得分</color>；<color=#FFAF2C>[完美反制]</color>首领的<color=#FFAF2C>[控制技]</color>时，可获得<color=#FFAF2C>2000操作得分</color>。[特定招式]期间，通过<color=#FFAF2C>[特定招式]</color>造成<color=#FFAF2C>[完美反制]</color>时，会获得该次<color=#FFAF2C>控制技</color>剩余的成功应对得分。最多获得5000操作得分。",
    "stats": {
      "critDmg": 60
    }
  },
  {
    "id": "da_boss_69014407",
    "category": "boss_stage",
    "sourceName": "复写体·猎血清道夫",
    "subType": "第44期 (v3.1)",
    "dateRange": "2026.07.17 - 07.31",
    "version": "3.1",
    "seasons": [
      43,
      44
    ],
    "title": "复写体·猎血清道夫·场地增益",
    "desc": "代理人对敌人造成[完美反制]后，敌人的全属性抗性降低10%，且全队[强攻]特性的代理人攻击力提升20%，穿透率提升25%，造成的冰属性和以太属性伤害的暴击伤害提升60%。\n触发特殊跪地时，全队异常精通提升40点，异常伤害提升30%。\n·每次成功应对首领的攻击并使其触发特殊跪地，可获得<color=#FFAF2C>1000操作得分</color>；[特定招式]期间，每次成功应对首领的攻击，可获得<color=#FFAF2C>500操作得分</color>；<color=#FFAF2C>[完美反制]</color>首领的<color=#FFAF2C>[控制技]</color>时，可获得<color=#FFAF2C>2000操作得分</color>。[特定招式]期间，通过<color=#FFAF2C>[特定招式]</color>造成<color=#FFAF2C>[完美反制]</color>时，会获得该次<color=#FFAF2C>[控制技]</color>剩余的成功应对得分。最多获得5000操作得分。",
    "stats": {
      "resShred": 10,
      "inCombatAtkPct": 20,
      "penRatio": 25,
      "critDmg": 60,
      "anomalyMastery": 40,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_boss_69014403",
    "category": "boss_stage",
    "sourceName": "初生死路屠夫",
    "subType": "第44期 (v3.1)",
    "dateRange": "2026.07.17 - 07.31",
    "version": "3.1",
    "seasons": [
      44
    ],
    "title": "初生死路屠夫·场地增益",
    "desc": "· <color=#FFAF2C>未处于失衡状态下时</color>，首领敌人每6秒获得1层<color=#FFFFFF>[孤注一掷]</color>，最多叠加3层，每层<color=#FFFFFF>[孤注一掷]</color>会使首领敌人造成的伤害<color=#FFAF2C>提升10%</color>；代理人攻击命中敌人时，目标每拥有1层<color=#FFFFFF>[孤注一掷]</color>，代理人攻击造成的暴击伤害<color=#FFAF2C>提升25%</color>，属性异常伤害<color=#FFAF2C>降低15%</color>；敌人进入失衡状态时，获得1层<color=#FFFFFF>[孤注一掷]</color>；敌人从失衡状态恢复时，<color=#FFFFFF>[孤注一掷]</color>层数将会被重置。",
    "stats": {
      "dmgBonus": 30,
      "critDmg": 25
    }
  },
  {
    "id": "da_boss_69013002",
    "category": "boss_stage",
    "sourceName": "秽息司祭",
    "subType": "第43期 (v3.0)",
    "dateRange": "2026.07.03 - 07.17",
    "version": "3.0",
    "seasons": [
      22,
      24,
      28,
      30,
      33,
      43
    ],
    "title": "秽息司祭·场地增益",
    "desc": "· 适合<color=#FFAF2C>[命破]</color>特性的代理人挑战。\n· 秽息司祭每次切换阶段时，会使自身异常积蓄抗性提升10%，同时使自身受到的暴击伤害提高30%，至多可以叠加2层，[特定招式]被打破时，清除所有层数。",
    "stats": {
      "critDmg": 60
    }
  },
  {
    "id": "da_boss_69010402",
    "category": "boss_stage",
    "sourceName": "恶名·死路屠夫",
    "subType": "第42期 (v3.0)",
    "dateRange": "2026.06.19 - 07.03",
    "version": "3.0",
    "seasons": [
      3,
      4,
      11,
      15,
      17,
      18,
      20,
      22,
      30,
      37,
      42
    ],
    "title": "恶名·死路屠夫·场地增益",
    "desc": "· 属性异常对首领敌人造成的伤害提升50%；恶名·死路屠夫处于<color=#FFFFFF>[以太强化]</color>状态时，承受的伤害降低15%，代理人对其造成的失衡值降低30%；代理人对恶名·死路屠夫触发<color=#FFFFFF>[紊乱]</color>后，使其立即退出<color=#FFFFFF>[以太强化]</color>状态。",
    "stats": {
      "dmgBonus": 50
    }
  },
  {
    "id": "da_boss_69014203",
    "category": "boss_stage",
    "sourceName": "异构·基塔布鲁",
    "subType": "第42期 (v3.0)",
    "dateRange": "2026.06.19 - 07.03",
    "version": "3.0",
    "seasons": [
      42
    ],
    "title": "异构·基塔布鲁·场地增益",
    "desc": "· 代理人攻击命中首领敌人时，使首领敌人获得1点[紊相值]；同一名代理人每1秒最多施加1点[紊相值]。\n· 首领敌人持有的[紊相值]达到10点时，会立即移除所有[紊相值]并使首领敌人进入[紊相]状态。[紊相]状态期间，敌人受到的<color=#2BAD00>属性异常伤害提升40%</color>，持续10秒，重复进入[紊相]状态时刷新持续时间。\n· 代理人成功对首领敌人施加属性异常状态时，全队代理人<color=#2BAD00>造成的伤害提升15%</color>，异常精通<color=#2BAD00>提升20点</color>，持续10秒，重复触发刷新持续时间。\n· 每次成功招架基塔布鲁召唤的眷属攻击并触发<color=#FFAF2C>[活性转化]</color>时，可获得<color=#FFAF2C>500操作得分</color>；成功触发[招架支援]/[极限闪避]应对基塔布鲁的攻击时，可获得<color=#FFAF2C>1000操作得分</color>，最多可触发3次；如果成功在基塔布鲁<color=#FFAF2C>第一次开启</color>[紊乱]后的<color=#FFAF2C>25秒内击破[侵蚀壁垒]</color>，可获得<color=#FFAF2C>1500操作得分</color>。最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 55,
      "anomalyMastery": 20
    }
  },
  {
    "id": "da_boss_69014103",
    "category": "boss_stage",
    "sourceName": "恶名·庞培",
    "subType": "第41期 (v2.8)",
    "dateRange": "2026.06.05 - 06.19",
    "version": "2.8",
    "seasons": [
      41
    ],
    "title": "恶名·庞培·场地增益",
    "desc": "·代理人<color=#FFAF2C>发动[招架支援]或[连携技]命中首领敌人时</color>，将对其施加1层<color=#FFFFFF>[劣势]</color>，持续20秒，每层效果单独结算持续时间。代理人攻击命中敌人时，目标每拥有1层<color=#FFFFFF>[劣势]</color>，代理人的暴击伤害<color=#FFAF2C>提升15%</color>；\n·首领敌人拥有4层<color=#FFFFFF>[劣势]</color>时，[招架支援]会弹开首领敌人的攻击，造成硬直效果。\n·首领敌人受到的属性异常伤害降低30%。",
    "stats": {
      "critDmg": 15
    }
  },
  {
    "id": "da_boss_69013004",
    "category": "boss_stage",
    "sourceName": "魇缚者·叶释渊",
    "subType": "第40期 (v2.8)",
    "dateRange": "2026.05.22 - 06.05",
    "version": "2.8",
    "seasons": [
      37,
      38,
      39,
      40
    ],
    "title": "魇缚者·叶释渊·场地增益",
    "desc": "· 适合<color=#FFAF2C>[击破]</color>特性的代理人挑战。\n· 索贝克与魇缚者每次交替上场时，可使魇缚者获得1层<color=#FFFFFF>[合契]</color>与一层<color=#FFFFFF>[舍身]</color>，[合契]与[舍身]最多叠加3层，每层[合契]可使全属性异常积蓄抗性<color=#FFAF2C>提升15%</color>，每层[舍身]可使魇缚者失衡易伤倍率<color=#FFAF2C>提升10%</color>；魇缚者进入失衡状态时，受到暴击伤害<color=#FFAF2C>提升50%</color>。",
    "stats": {
      "dazeVuln": 30,
      "critDmg": 50
    }
  },
  {
    "id": "da_boss_69011204",
    "category": "boss_stage",
    "sourceName": "恶名·冥宁芙",
    "subType": "第39期 (v2.8)",
    "dateRange": "2026.05.08 - 05.22",
    "version": "2.8",
    "seasons": [
      12,
      25,
      28,
      33,
      39
    ],
    "title": "恶名·冥宁芙·场地增益",
    "desc": "· 首领敌人造成伤害提升25%；<color=#FFAF2C>分身被击破</color>/<color=#FFAF2C>本体进入失衡状态</color>时，将对首领敌人施加1层/5层<color=#FFFFFF>[如履薄冰]</color>， 每层<color=#FFFFFF>[如履薄冰]</color>会使首领敌人造成的伤害降低5%，并使代理人对其造成的<color=#98EFF0>冰属性伤害</color>和<color=#FE437E>以太属性伤害</color><color=#FFAF2C>提升10%</color>；敌人从失衡状态恢复时，<color=#FFFFFF>[如履薄冰]</color>层数将会被重置。",
    "stats": {
      "dmgBonus": 35
    }
  },
  {
    "id": "da_boss_69013001",
    "category": "boss_stage",
    "sourceName": "「亵渎者」",
    "subType": "第38期 (v2.7)",
    "dateRange": "2026.04.24 - 05.08",
    "version": "2.7",
    "seasons": [
      22,
      23,
      28,
      31,
      35,
      36,
      38
    ],
    "title": "「亵渎者」·场地增益",
    "desc": "· 适合<color=#FFAF2C>[强攻]</color>特性的代理人挑战。\n· 代理人发动招架支援命中亵渎者时，全队获得1层<color=#FFFFFF>[裁夺]</color>；代理人将在空中发动攻击的亵渎者击落时，全队获得4层<color=#FFFFFF>[裁夺]</color>。[裁夺]最多叠加6层，持续30秒，重复触发时刷新持续时间。\n· 每拥有1层<color=#FFFFFF>[裁夺]</color>，代理人的暴击伤害<color=#2BAD00>提升5%</color>，物理伤害<color=#2BAD00>提升5%</color>，电属性伤害<color=#2BAD00>提升5%</color>。\n· 亵渎者受到的属性异常伤害降低25%。\n· 代理人造成<color=#FFAF2C>部位破坏时</color>，可获得<color=#FFAF2C>2500操作得分</color>；代理人<color=#FFAF2C>将在空中发动攻击的亵渎者击落</color>时，可获得<color=#FFAF2C>1500操作得分</color>，最多获得5000操作得分。",
    "stats": {
      "critDmg": 5,
      "dmgBonus": 10
    }
  },
  {
    "id": "da_boss_69013002",
    "category": "boss_stage",
    "sourceName": "彷徨猎手",
    "subType": "第36期 (v2.7)",
    "dateRange": "2026.03.27 - 04.10",
    "version": "2.7",
    "seasons": [
      23,
      24,
      26,
      27,
      29,
      31,
      36
    ],
    "title": "彷徨猎手·场地增益",
    "desc": "· 适合<color=#FFAF2C>[命破]</color>特性的代理人挑战。\n· 彷徨猎手处于[秽浊流界]中时，基础防御提高40%；代理人发动<color=#FFAF2C>[支援突击]或[闪避反击]</color>命中彷徨猎手时，将对其施加1层<color=#FFFFFF>[动摇]</color>。<color=#FFFFFF>[动摇]</color>最多叠加5层，持续15秒，重复触发时刷新持续时间。\n· 代理人攻击命中彷徨猎手时，对方每有1层[动摇]，代理人的贯穿伤害<color=#FFAF2C>提升7%</color>。",
    "stats": {
      "ppDmgBonus": 7
    }
  },
  {
    "id": "da_boss_69013003",
    "category": "boss_stage",
    "sourceName": "猎血清道夫",
    "subType": "第35期 (v2.6)",
    "dateRange": "2026.03.13 - 03.27",
    "version": "2.6",
    "seasons": [
      33,
      35
    ],
    "title": "猎血清道夫·场地增益",
    "desc": "· 适合<color=#FFAF2C>[异常]</color>特性的代理人挑战。\n·[侵蚀壁垒]持续期间，代理人对其造成的异常伤害<color=#2BAD00>提升50%</color>，造成的异常积蓄<color=#2BAD00>提升30%</color>；首领在失衡状态下，受到的异常伤害<color=#2BAD00>提升15%</color>，代理人对其造成的异常积蓄<color=#2BAD00>提升15%</color>；首领在非失衡状态下，受到的伤害<color=#2BAD00>降低15%</color>。\n·每次成功应对首领的攻击并使其触发特殊跪地，可获得<color=#FFAF2C>1000操作得分</color>；[特定招式]期间，每次成功应对首领的攻击，可获得<color=#FFAF2C>500操作得分</color>；<color=#FFAF2C>[完美反制]</color>首领的<color=#FFAF2C>[控制技]</color>时，可获得<color=#FFAF2C>2000操作得分</color>。[特定招式]期间，通过<color=#FFAF2C>[特定招式]</color>造成<color=#FFAF2C>[完美反制]</color>时，会获得该次<color=#FFAF2C>[控制技]</color>剩余的成功应对得分。最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 65
    }
  },
  {
    "id": "da_boss_69010503",
    "category": "boss_stage",
    "sourceName": "恶名·庞培",
    "subType": "第32期 (v2.5)",
    "dateRange": "2026.01.30 - 02.13",
    "version": "2.5",
    "seasons": [
      6,
      8,
      12,
      13,
      14,
      16,
      20,
      32
    ],
    "title": "恶名·庞培·场地增益",
    "desc": "·代理人<color=#FFAF2C>发动[招架支援]或[连携技]命中首领敌人时</color>，将对其施加1层<color=#FFFFFF>[劣势]</color>，持续20秒，每层效果单独结算持续时间。代理人攻击命中敌人时，目标每拥有1层<color=#FFFFFF>[劣势]</color>，代理人的暴击伤害<color=#FFAF2C>提升15%</color>；\n\n首领敌人拥有4层<color=#FFFFFF>[劣势]</color>时，[招架支援]会弹开首领敌人的攻击，造成硬直效果。",
    "stats": {
      "critDmg": 15
    }
  },
  {
    "id": "da_boss_69013003",
    "category": "boss_stage",
    "sourceName": "牲鬼·布林格",
    "subType": "第26期 (v2.3)",
    "dateRange": "2025.11.14 - 11.21",
    "version": "2.3",
    "seasons": [
      26
    ],
    "title": "牲鬼·布林格·场地增益",
    "desc": "· 适合<color=#FFAF2C>[异常]</color>特性的代理人挑战。\n· 对首领敌人<color=#FFAF2C>施加属性异常或[紊乱]效果时</color>，全队获得1层<color=#FFFFFF>[心无旁骛]</color>，最多叠加6层，每层<color=#FFFFFF>[心无旁骛]</color>会使代理人的<color=#FFAF2C>攻击力提升8%</color>；拥有至少3层<color=#FFFFFF>[心无旁骛]</color>后，队伍中任意代理人对敌人<color=#FFAF2C>施加属性异常效果时，该效果的持续时间提升5秒</color>；牲鬼·布林格召唤「牲祭之刃」发动攻击时，全队<color=#FFFFFF>[心无旁骛]</color>层数将会被重置。",
    "stats": {
      "inCombatAtkPct": 48
    }
  },
  {
    "id": "da_boss_69011302",
    "category": "boss_stage",
    "sourceName": "秽息司祭",
    "subType": "第21期 (v2.2)",
    "dateRange": "2025.09.26 - 10.10",
    "version": "2.2",
    "seasons": [
      13,
      15,
      16,
      18,
      19,
      21
    ],
    "title": "秽息司祭·场地增益",
    "desc": "· 秽息司祭每次切换阶段时，会使自身异常积蓄抗性提升10%，同时使自身受到的暴击伤害提高30%，至多可以叠加2层，[特定招式]被打破时，清除所有层数。",
    "stats": {
      "critDmg": 60
    }
  },
  {
    "id": "da_boss_69011602",
    "category": "boss_stage",
    "sourceName": "秽息妖鬼·名可名",
    "subType": "第21期 (v2.2)",
    "dateRange": "2025.09.26 - 10.10",
    "version": "2.2",
    "seasons": [
      16,
      17,
      19,
      21
    ],
    "title": "秽息妖鬼·名可名·场地增益",
    "desc": "秽息妖鬼每次进入<color=#FFAF2C>属性异常</color>时，代理人对其造成的异常伤害增加8%，最多叠加6层；开启[特定招式]时清空所有层数，每层使<color=#FFAF2C>[秽盾]</color>被削减效率提升2.5%。\n· 代理人吸引秽息妖鬼地面攻击<color=#FFAF2C>一次性引爆至少5处秽息泽</color>，且<color=#FFAF2C>未被该攻击及秽息泽爆炸命中</color>时，可获得<color=#FFAF2C>1700操作得分</color>，最多获得5000操作得分。",
    "stats": {
      "dmgBonus": 48
    }
  },
  {
    "id": "da_boss_69011902",
    "category": "boss_stage",
    "sourceName": "「亵渎者」",
    "subType": "第20期 (v2.2)",
    "dateRange": "2025.09.12 - 09.26",
    "version": "2.2",
    "seasons": [
      19,
      20
    ],
    "title": "「亵渎者」·场地增益",
    "desc": "· 代理人发动招架支援命中亵渎者时，全队获得1层<color=#FFFFFF>[裁夺]</color>；代理人将在空中发动攻击的亵渎者击落时，全队获得4层<color=#FFFFFF>[裁夺]</color>。[裁夺]最多叠加6层，持续30秒，重复触发时刷新持续时间。\n· 每拥有1层<color=#FFFFFF>[裁夺]</color>，代理人的暴击伤害<color=#2BAD00>提升5%</color>，物理伤害<color=#2BAD00>提升5%</color>，电属性伤害<color=#2BAD00>提升5%</color>。\n· 亵渎者受到的属性异常伤害降低25%。\n· 代理人造成<color=#FFAF2C>部位破坏时</color>，可获得<color=#FFAF2C>2500操作得分</color>；代理人<color=#FFAF2C>将在空中发动攻击的亵渎者击落</color>时，可获得<color=#FFAF2C>1500操作得分</color>，最多获得5000操作得分。",
    "stats": {
      "critDmg": 5,
      "dmgBonus": 10
    }
  },
  {
    "id": "da_boss_69010106",
    "category": "boss_stage",
    "sourceName": "恶名·冥宁芙",
    "subType": "第17期 (v2.1)",
    "dateRange": "2025.08.01 - 08.15",
    "version": "2.1",
    "seasons": [
      1,
      4,
      8,
      11,
      13,
      17
    ],
    "title": "恶名·冥宁芙·场地增益",
    "desc": "· 首领敌人造成伤害提升25%；<color=#FFAF2C>分身被击破</color>/<color=#FFAF2C>本体进入失衡状态</color>时，将对首领敌人施加1层/5层<color=#FFFFFF>[如履薄冰]</color>， 每层<color=#FFFFFF>[如履薄冰]</color>会使首领敌人造成的伤害降低5%，并使代理人对其造成的<color=#98EFF0>冰属性伤害</color>和<color=#2EB6FF>电属性伤害</color><color=#FFAF2C>提升10%</color>；敌人从失衡状态恢复时，<color=#FFFFFF>[如履薄冰]</color>层数将会被重置。",
    "stats": {
      "dmgBonus": 35
    }
  },
  {
    "id": "da_boss_69010105",
    "category": "boss_stage",
    "sourceName": "「霸主侵蚀体·庞培」",
    "subType": "第15期 (v2.0)",
    "dateRange": "2025.07.04 - 07.18",
    "version": "2.0",
    "seasons": [
      1,
      3,
      7,
      10,
      15
    ],
    "title": "「霸主侵蚀体·庞培」·场地增益",
    "desc": "· 首领敌人每10秒获得1层<color=#FFFFFF>[愈战愈勇]</color>，使自身造成伤害提升20%，最多叠加3层；队伍中任意代理人<color=#FFAF2C>对敌人施加属性异常效果时</color>，将移除1层<color=#FFFFFF>[愈战愈勇]</color>并削弱目标，使其受到伤害提升15%，持续20秒。",
    "stats": {
      "dmgBonus": 75
    }
  },
  {
    "id": "da_boss_69010505",
    "category": "boss_stage",
    "sourceName": "牲鬼·布林格",
    "subType": "第14期 (v2.0)",
    "dateRange": "2025.06.20 - 07.04",
    "version": "2.0",
    "seasons": [
      5,
      6,
      9,
      10,
      12,
      14
    ],
    "title": "牲鬼·布林格·场地增益",
    "desc": "· 对首领敌人<color=#FFAF2C>施加属性异常或[紊乱]效果时</color>，全队获得1层<color=#FFFFFF>[心无旁骛]</color>，最多叠加6层，每层<color=#FFFFFF>[心无旁骛]</color>会使代理人的<color=#FFAF2C>攻击力提升8%</color>；拥有至少3层<color=#FFFFFF>[心无旁骛]</color>后，队伍中任意代理人对敌人<color=#FFAF2C>施加属性异常效果时，该效果的持续时间提升5秒</color>；牲鬼·布林格召唤「牲祭之刃」发动攻击时，全队<color=#FFFFFF>[心无旁骛]</color>层数将会被重置。",
    "stats": {
      "inCombatAtkPct": 48
    }
  },
  {
    "id": "da_boss_69010503",
    "category": "boss_stage",
    "sourceName": "死路屠夫",
    "subType": "第9期 (v1.6)",
    "dateRange": "2025.04.11 - 04.25",
    "version": "1.6",
    "seasons": [
      5,
      9
    ],
    "title": "死路屠夫·场地增益",
    "desc": "·代理人<color=#FFAF2C>发动[招架支援]或[连携技]命中首领敌人时</color>，将对其施加1层<color=#FFFFFF>[劣势]</color>，持续20秒，每层效果单独结算持续时间。代理人攻击命中敌人时，目标每拥有1层<color=#FFFFFF>[劣势]</color>，代理人的暴击伤害<color=#FFAF2C>提升15%</color>；\n\n首领敌人拥有4层<color=#FFFFFF>[劣势]</color>时，[招架支援]会弹开首领敌人的攻击，造成硬直效果。",
    "stats": {
      "critDmg": 15
    }
  },
  {
    "id": "da_boss_69010206",
    "category": "boss_stage",
    "sourceName": "恶名·庞培",
    "subType": "第5期 (v1.5)",
    "dateRange": "2025.02.14 - 02.28",
    "version": "1.5",
    "seasons": [
      5
    ],
    "title": "恶名·庞培·场地增益",
    "desc": "· <color=#FFAF2C>未处于失衡状态下时</color>，首领敌人每6秒获得1层<color=#FFFFFF>[孤注一掷]</color>，最多叠加3层，每层<color=#FFFFFF>[孤注一掷]</color>会使首领敌人造成的伤害提升10%；代理人攻击命中敌人时，目标每拥有1层<color=#FFFFFF>[孤注一掷]</color>，代理人的暴击伤害<color=#FFAF2C>提升25%</color>；敌人从失衡状态恢复时，<color=#FFFFFF>[孤注一掷]</color>层数将会被重置。",
    "stats": {
      "dmgBonus": 30,
      "critDmg": 25
    }
  },
  {
    "id": "da_boss_69010104",
    "category": "boss_stage",
    "sourceName": "牲鬼·布林格",
    "subType": "第2期 (v1.4)",
    "dateRange": "2025.01.03 - 01.17",
    "version": "1.4",
    "seasons": [
      1,
      2
    ],
    "title": "牲鬼·布林格·场地增益",
    "desc": "· 对首领敌人<color=#FFAF2C>施加属性异常或[紊乱]效果时</color>，全队获得1层<color=#FFFFFF>[心无旁骛]</color>，最多叠加6层，每层<color=#FFFFFF>[心无旁骛]</color>会使代理人的<color=#FFAF2C>暴击率提升5%</color>；拥有至少3层<color=#FFFFFF>[心无旁骛]</color>后，队伍中任意代理人对敌人<color=#FFAF2C>施加属性异常效果时，该效果的持续时间提升5秒</color>；牲鬼·布林格召唤「牲祭之刃」发动攻击时，全队<color=#FFFFFF>[心无旁骛]</color>层数将会被重置。",
    "stats": {
      "critRate": 30
    }
  },
  {
    "id": "da_boss_69010205",
    "category": "boss_stage",
    "sourceName": "自律强袭单位·「提丰·破坏者型」",
    "subType": "第2期 (v1.4)",
    "dateRange": "2025.01.03 - 01.17",
    "version": "1.4",
    "seasons": [
      2
    ],
    "title": "自律强袭单位·「提丰·破坏者型」·场地增益",
    "desc": "· 代理人<color=#FFAF2C>发动[招架支援]命中首领敌人时</color>，将对其施加1层<color=#FFFFFF>[难敌四手]</color>，<color=#FFFFFF>[招架支援]</color>累计命中3次时，将触发部位破坏，并额外施加3层<color=#FFFFFF>[难敌四手]</color>，每层<color=#FFFFFF>[难敌四手]</color>会使代理人对首领敌人造成的失衡值<color=#FFAF2C>提升15%</color>，在失衡状态下<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>对其造成的伤害<color=#FFAF2C>提升10%</color>；敌人充电蓄能时，将修复受损部位并重置部位破坏进度；敌人从失衡状态恢复时，<color=#FFFFFF>[难敌四手]</color>层数将会被重置。",
    "stats": {
      "dmgBonus": 10
    }
  },
  {
    "id": "da_boss_69010206",
    "category": "boss_stage",
    "sourceName": "死路屠夫",
    "subType": "第2期 (v1.4)",
    "dateRange": "2025.01.03 - 01.17",
    "version": "1.4",
    "seasons": [
      2
    ],
    "title": "死路屠夫·场地增益",
    "desc": "· <color=#FFAF2C>未处于失衡状态下时</color>，首领敌人每6秒获得1层<color=#FFFFFF>[孤注一掷]</color>，最多叠加3层，每层<color=#FFFFFF>[孤注一掷]</color>会使首领敌人造成的伤害提升10%；代理人攻击命中敌人时，目标每拥有1层<color=#FFFFFF>[孤注一掷]</color>，代理人的暴击伤害<color=#FFAF2C>提升25%</color>；敌人从失衡状态恢复时，<color=#FFFFFF>[孤注一掷]</color>层数将会被重置。",
    "stats": {
      "dmgBonus": 30,
      "critDmg": 25
    }
  }
];

export const DA_WEATHER_BUFFS: BuffItem[] = [
  {
    "id": "da_weather_69015301",
    "category": "da_weather",
    "sourceName": "危局第53期",
    "subType": "第53期 (v3.4)",
    "dateRange": "2026.11.20 - 12.04",
    "version": "3.4",
    "seasons": [
      53
    ],
    "title": "尖峰",
    "desc": "· 代理人的防御力<color=#2BAD00>提升10%</color>，攻击命中敌人时无视其<color=#2BAD00>10%</color>的<color=#FF5521>火属性伤害抗性</color>。\n· <color=#FFFFFF>[锋御]</color>特性代理人触发暴击后，自身回复<color=#2BAD00>300点喧响值</color>，锐化伤害<color=#2BAD00>提升10%</color>，持续15秒，重复触发时刷新持续时间，喧响值回复效果15秒内最多触发一次。",
    "stats": {
      "inCombatDefPct": 10,
      "resShred": 10,
      "dmgBonus": 10
    }
  },
  {
    "id": "da_weather_69015302",
    "category": "da_weather",
    "sourceName": "危局第53期",
    "subType": "第53期 (v3.4)",
    "dateRange": "2026.11.20 - 12.04",
    "version": "3.4",
    "seasons": [
      53
    ],
    "title": "电离",
    "desc": "· <color=#FFFFFF>[异常]</color>特性代理人造成的属性异常伤害<color=#2BAD00>提升10%</color>，<color=#FFFFFF>[紊乱]</color>伤害<color=#2BAD00>提升30%</color>。\n· 代理人使敌人进入<color=#2EB6FF>电属性异常</color>状态后，其防御力<color=#2BAD00>降低25%</color>，全属性伤害抗性<color=#2BAD00>降低10%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 40,
      "defShred": 25,
      "resShred": 10
    }
  },
  {
    "id": "da_weather_69015303",
    "category": "da_weather",
    "sourceName": "危局第53期",
    "subType": "第53期 (v3.4)",
    "dateRange": "2026.11.20 - 12.04",
    "version": "3.4",
    "seasons": [
      53
    ],
    "title": "焰绽",
    "desc": "· <color=#FFFFFF>[异常]</color>特性代理人的<color=#FF5521>火属性</color>和<color=#FE437E>以太属性</color>异常积蓄效率<color=#2BAD00>提升15%</color>。\n· 代理人造成<color=#FFFFFF>属性异常</color>伤害并触发暴击后，全队获得<color=#2BAD00>20点能量</color>，造成的属性异常伤害<color=#2BAD00>提升15%</color>，持续20秒，此效果20秒内最多触发一次。",
    "stats": {
      "dmgBonus": 15
    }
  },
  {
    "id": "da_weather_69015201",
    "category": "da_weather",
    "sourceName": "危局第52期",
    "subType": "第52期 (v3.4)",
    "dateRange": "2026.11.06 - 11.20",
    "version": "3.4",
    "seasons": [
      52
    ],
    "title": "攻砭",
    "desc": "· <color=#FFFFFF>[锋御]</color>特性代理人的防御力<color=#2BAD00>提升10%</color>，锐化伤害<color=#2BAD00>提升20%</color>。\n· 代理人触发<color=#FFFFFF>[毁伤]</color>时，自身回复<color=#2BAD00>300点喧响值</color>，敌人失衡易伤倍率<color=#2BAD00>提升15%</color>，持续10秒，重复触发时刷新持续时间，喧响值回复效果10秒内最多触发一次。",
    "stats": {
      "inCombatDefPct": 10,
      "dmgBonus": 20,
      "dazeVuln": 15
    }
  },
  {
    "id": "da_weather_69015202",
    "category": "da_weather",
    "sourceName": "危局第52期",
    "subType": "第52期 (v3.4)",
    "dateRange": "2026.11.06 - 11.20",
    "version": "3.4",
    "seasons": [
      52
    ],
    "title": "墟湮",
    "desc": "· <color=#FFFFFF>[击破]</color>特性的代理人对敌人造成的失衡值<color=#2BAD00>提升15%</color>。\n· 代理人发动<color=#FFFFFF>[终结技]</color>后，自身造成的伤害<color=#2BAD00>提升30%</color>，暴击伤害<color=#2BAD00>提升40%</color>，持续30秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 30,
      "critDmg": 40
    }
  },
  {
    "id": "da_weather_69015203",
    "category": "da_weather",
    "sourceName": "危局第52期",
    "subType": "第52期 (v3.4)",
    "dateRange": "2026.11.06 - 11.20",
    "version": "3.4",
    "seasons": [
      52
    ],
    "title": "逆涌",
    "desc": "· 队伍内存在2/3名<color=#FFFFFF>[异常]</color>特性代理人时，全队攻击力分别<color=#2BAD00>提升10%/20%</color>。\n· 代理人使敌人进入<color=#FFFFFF>属性异常</color>状态后，全队恢复<color=#2BAD00>10点能量</color>，此效果15秒内最多触发一次。",
    "stats": {
      "inCombatAtkPct": 20
    }
  },
  {
    "id": "da_weather_69015101",
    "category": "da_weather",
    "sourceName": "危局第51期",
    "subType": "第51期 (v3.4)",
    "dateRange": "2026.10.23 - 11.06",
    "version": "3.4",
    "seasons": [
      51
    ],
    "title": "淬火",
    "desc": "· <color=#FFFFFF>[锋御]</color>特性代理人的防御力<color=#2BAD00>提升15%</color>，<color=#FF5521>火属性伤害</color><color=#2BAD00>提升20%</color>。\n· 代理人触发暴击后，锐暴伤害<color=#2BAD00>提升10%</color>，持续5秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatDefPct": 15,
      "dmgBonus": 20,
      "sharpCritDmg": 10
    }
  },
  {
    "id": "da_weather_69015102",
    "category": "da_weather",
    "sourceName": "危局第51期",
    "subType": "第51期 (v3.4)",
    "dateRange": "2026.10.23 - 11.06",
    "version": "3.4",
    "seasons": [
      51
    ],
    "title": "环缭",
    "desc": "· <color=#FFFFFF>[异常]</color>特性代理人的攻击力<color=#2BAD00>提升15%</color>，<color=#98EFF0>冰属性伤害</color>和<color=#FE437E>以太伤害</color><color=#2BAD00>提升30%</color>。\n· <color=#FFFFFF>[异常]</color>特性代理人造成的<color=#FFFFFF>[紊乱]</color>伤害<color=#2BAD00>提升35%</color>，<color=#FFFFFF>[异放]</color>伤害<color=#2BAD00>提升20%</color>。",
    "stats": {
      "inCombatAtkPct": 15,
      "dmgBonus": 65
    }
  },
  {
    "id": "da_weather_69015103",
    "category": "da_weather",
    "sourceName": "危局第51期",
    "subType": "第51期 (v3.4)",
    "dateRange": "2026.10.23 - 11.06",
    "version": "3.4",
    "seasons": [
      51
    ],
    "title": "炽灭",
    "desc": "· 代理人的<color=#FF5521>火属性伤害</color><color=#2BAD00>提升20%</color>，<color=#FF5521>火属性异常积蓄效率</color><color=#2BAD00>提升10%</color>。\n· 代理人造成<color=#FFFFFF>属性异常</color>伤害并触发暴击后，全队造成的属性异常伤害<color=#2BAD00>提升20%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 40
    }
  },
  {
    "id": "da_weather_69015001",
    "category": "da_weather",
    "sourceName": "危局第50期",
    "subType": "第50期 (v3.3)",
    "dateRange": "2026.10.09 - 10.23",
    "version": "3.3",
    "seasons": [
      50
    ],
    "title": "掠霜",
    "desc": "· 代理人造成的<color=#A6C5FD>风属性伤害</color><color=#2BAD00>提升30%</color>，攻击命中敌人时无视其<color=#2BAD00>30%</color>的<color=#A6C5FD>风属性伤害抗性</color>。\n· <color=#FFFFFF>[强攻]</color>特性的代理人暴击伤害<color=#2BAD00>提升40%</color>，<color=#FFFFFF>[普通攻击]</color>造成的伤害<color=#2BAD00>提升50%</color>。",
    "stats": {
      "dmgBonus": 80,
      "critDmg": 40
    }
  },
  {
    "id": "da_weather_69015002",
    "category": "da_weather",
    "sourceName": "危局第50期",
    "subType": "第50期 (v3.3)",
    "dateRange": "2026.10.09 - 10.23",
    "version": "3.3",
    "seasons": [
      50
    ],
    "title": "奔霆",
    "desc": "· 代理人的防御力<color=#2BAD00>提升10%</color>，锐化伤害<color=#2BAD00>提升15%</color>。\n· 代理人发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[终结技]</color>后，<color=#2EB6FF>电属性伤害</color>和<color=#A6C5FD>风属性伤害</color><color=#2BAD00>提升20%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatDefPct": 10,
      "dmgBonus": 35
    }
  },
  {
    "id": "da_weather_69015003",
    "category": "da_weather",
    "sourceName": "危局第50期",
    "subType": "第50期 (v3.3)",
    "dateRange": "2026.10.09 - 10.23",
    "version": "3.3",
    "seasons": [
      50
    ],
    "title": "极魄",
    "desc": "· <color=#FFFFFF>[异常]</color>特性代理人的攻击力<color=#2BAD00>提升10%</color>，<color=#FF5521>火属性</color>和<color=#A6C5FD>风属性</color>异常积蓄效率<color=#2BAD00>提升10%</color>。\n· 代理人造成<color=#FFFFFF>属性异常</color>伤害并触发暴击后，全队<color=#2BAD00>获得20点</color>能量，属性异常伤害<color=#2BAD00>提升20%</color>，持续20秒，此效果每20秒可触发一次。",
    "stats": {
      "inCombatAtkPct": 10,
      "dmgBonus": 20
    }
  },
  {
    "id": "da_weather_69014901",
    "category": "da_weather",
    "sourceName": "危局第49期",
    "subType": "第49期 (v3.3)",
    "dateRange": "2026.09.25 - 10.09",
    "version": "3.3",
    "seasons": [
      49
    ],
    "title": "灼曜",
    "desc": "· <color=#FFFFFF>[异常]</color>特性代理人的攻击力<color=#2BAD00>提升10%</color>，<color=#FF5521>火属性异常积蓄效率</color><color=#2BAD00>提升10%</color>。\n· 代理人造成<color=#FFFFFF>属性异常</color>伤害并触发暴击后，全队异常精通<color=#2BAD00>提升30点</color>，属性异常伤害<color=#2BAD00>提升10%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatAtkPct": 10,
      "anomalyMastery": 30,
      "dmgBonus": 10
    }
  },
  {
    "id": "da_weather_69014902",
    "category": "da_weather",
    "sourceName": "危局第49期",
    "subType": "第49期 (v3.3)",
    "dateRange": "2026.09.25 - 10.09",
    "version": "3.3",
    "seasons": [
      49
    ],
    "title": "岚劫",
    "desc": "· 代理人造成的<color=#A6C5FD>风属性伤害</color><color=#2BAD00>提升40%</color>，<color=#A6C5FD>风属性</color>暴击伤害<color=#2BAD00>提升40%</color>。\n· <color=#FFFFFF>[强攻]</color>特性的代理人攻击力<color=#2BAD00>提升25%</color>，<color=#FFFFFF>[普通攻击]</color>造成的伤害<color=#2BAD00>提升40%</color>。",
    "stats": {
      "dmgBonus": 80,
      "critDmg": 40,
      "inCombatAtkPct": 25
    }
  },
  {
    "id": "da_weather_69014903",
    "category": "da_weather",
    "sourceName": "危局第49期",
    "subType": "第49期 (v3.3)",
    "dateRange": "2026.09.25 - 10.09",
    "version": "3.3",
    "seasons": [
      49
    ],
    "title": "锋蚀",
    "desc": "· 代理人的<color=#2EB6FF>电属性伤害</color><color=#2BAD00>提升30%</color>，锐化伤害<color=#2BAD00>提升10%</color>。\n· <color=#FFFFFF>[强攻]</color>或<color=#FFFFFF>[锋御]</color>特性的代理人穿透率<color=#2BAD00>提升20%</color>，<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>造成的伤害<color=#2BAD00>提升30%</color>。",
    "stats": {
      "dmgBonus": 70,
      "penRatio": 20
    }
  },
  {
    "id": "da_weather_69014801",
    "category": "da_weather",
    "sourceName": "危局第48期",
    "subType": "第48期 (v3.3)",
    "dateRange": "2026.09.11 - 09.25",
    "version": "3.3",
    "seasons": [
      48
    ],
    "title": "炽陨",
    "desc": "· 队伍内存在2/3名<color=#FFFFFF>[异常]</color>特性代理人时，全队异常精通分别<color=#2BAD00>提升20/50点</color>。\n· <color=#FFFFFF>[异常]</color>特性代理人造成<color=#FFFFFF>属性异常</color>伤害并触发暴击后，全队造成的属性异常伤害<color=#2BAD00>提升20%</color>，<color=#FF5521>火属性</color>异常伤害额外<color=#2BAD00>提升10%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 50,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_weather_69014802",
    "category": "da_weather",
    "sourceName": "危局第48期",
    "subType": "第48期 (v3.3)",
    "dateRange": "2026.09.11 - 09.25",
    "version": "3.3",
    "seasons": [
      48
    ],
    "title": "烁穹",
    "desc": "· <color=#FFFFFF>[击破]</color>特性代理人造成的失衡值<color=#2BAD00>提升20%</color>，能量获取效率<color=#2BAD00>提升20%</color>。\n· 代理人发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[特殊技]</color>后，锐化伤害<color=#2BAD00>提升30%</color>，攻击命中敌人时无视其<color=#2BAD00>20%</color>的<color=#2EB6FF>电属性伤害抗性</color>和<color=#FE437E>以太伤害抗性</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 30
    }
  },
  {
    "id": "da_weather_69014803",
    "category": "da_weather",
    "sourceName": "危局第48期",
    "subType": "第48期 (v3.3)",
    "dateRange": "2026.09.11 - 09.25",
    "version": "3.3",
    "seasons": [
      48
    ],
    "title": "极韵",
    "desc": "· <color=#FFFFFF>[击破]</color>特性代理人造成的失衡值<color=#2BAD00>提升15%</color>，命中失衡状态的敌人后，其失衡恢复速度<color=#2BAD00>降低10%</color>，持续15秒，重复触发时刷新持续时间。\n· 代理人造成的属性异常伤害<color=#2BAD00>提升15%</color>，对处于失衡状态中的敌人，造成的属性异常伤害额外<color=#2BAD00>提升25%</color>。",
    "stats": {
      "dmgBonus": 40
    }
  },
  {
    "id": "da_weather_69014701",
    "category": "da_weather",
    "sourceName": "危局第47期",
    "subType": "第47期 (v3.2)",
    "dateRange": "2026.08.28 - 09.11",
    "version": "3.2",
    "seasons": [
      47
    ],
    "title": "凛冽",
    "desc": "· 代理人的<color=#98EFF0>冰属性伤害</color><color=#2BAD00>提升15%</color>，异常精通<color=#2BAD00>提升60点</color>。\n· 代理人对敌人触发<color=#FFFFFF>[异放]</color>或<color=#FFFFFF>[紊乱]</color>时，全队造成的属性异常伤害和[紊乱]伤害<color=#2BAD00>提升25%</color>，同时积蓄效率<color=#2BAD00>提升15%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 40,
      "anomalyMastery": 60
    }
  },
  {
    "id": "da_weather_69014702",
    "category": "da_weather",
    "sourceName": "危局第47期",
    "subType": "第47期 (v3.2)",
    "dateRange": "2026.08.28 - 09.11",
    "version": "3.2",
    "seasons": [
      47
    ],
    "title": "破御",
    "desc": "· 代理人对敌人造成的失衡值<color=#2BAD00>提升20%</color>。\n· <color=#FFFFFF>[强攻]</color>特性的代理人攻击力<color=#2BAD00>提升20%</color>，发动<color=#FFFFFF>[终结技]</color>后自身暴击伤害<color=#2BAD00>提升50%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatAtkPct": 20,
      "critDmg": 50
    }
  },
  {
    "id": "da_weather_69014703",
    "category": "da_weather",
    "sourceName": "危局第47期",
    "subType": "第47期 (v3.2)",
    "dateRange": "2026.08.28 - 09.11",
    "version": "3.2",
    "seasons": [
      47
    ],
    "title": "锋刃",
    "desc": "· 代理人的防御力<color=#2BAD00>提升15%</color>，锐化伤害<color=#2BAD00>提升15%</color>。\n· <color=#FFFFFF>[击破]</color>特性的代理人的<color=#FFFFFF>[强化特殊技]</color>造成的失衡值<color=#2BAD00>提升20%</color>。代理人发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[特殊技]</color>后，<color=#2EB6FF>电属性伤害</color>和<color=#A6C5FD>风属性伤害</color><color=#2BAD00>提升30%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatDefPct": 15,
      "dmgBonus": 45
    }
  },
  {
    "id": "da_weather_69014502",
    "category": "da_weather",
    "sourceName": "危局第46期",
    "subType": "第46期 (v3.1)",
    "dateRange": "2026.08.14 - 08.28",
    "version": "3.1",
    "seasons": [
      45,
      46
    ],
    "title": "蚀烬",
    "desc": "· 队伍中存在2/3名<color=#FFFFFF>[异常]</color>特性的代理人时，全队的异常精通分别<color=#2BAD00>提升20/60点</color>，异常积蓄效率分别<color=#2BAD00>提升10%/20%</color>。\n· 代理人使敌人进入<color=#FFFFFF>属性异常</color>状态后，敌人的防御力<color=#2BAD00>降低10%</color>，持续10秒，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 60,
      "defShred": 10
    }
  },
  {
    "id": "da_weather_69014501",
    "category": "da_weather",
    "sourceName": "危局第46期",
    "subType": "第46期 (v3.1)",
    "dateRange": "2026.08.14 - 08.28",
    "version": "3.1",
    "seasons": [
      46
    ],
    "title": "极锋",
    "desc": "· 代理人的锐化伤害<color=#2BAD00>提升15%</color>，防御力<color=#2BAD00>提升15%</color>。\n· 代理人发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[终结技]</color>后，攻击命中敌人时无视其<color=#2BAD00>20%</color>的<color=#2EB6FF>电属性伤害抗性</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatDefPct": 15,
      "dmgBonus": 15,
      "resShred": 20
    }
  },
  {
    "id": "da_weather_69014601",
    "category": "da_weather",
    "sourceName": "危局第46期",
    "subType": "第46期 (v3.1)",
    "dateRange": "2026.08.14 - 08.28",
    "version": "3.1",
    "seasons": [
      46
    ],
    "title": "坍裂",
    "desc": "· 代理人的<color=#FE437E>以太伤害</color>和<color=#F0D12B>物理属性伤害</color><color=#2BAD00>提升25%</color>，<color=#FFFFFF>[击破]</color>特性的代理人造成的失衡值<color=#2BAD00>提升20%</color>。\n· 代理人使敌人进入失衡状态后，敌人的失衡易伤倍率<color=#2BAD00>提升40%</color>，且失衡恢复速度<color=#2BAD00>降低15%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 25,
      "dazeVuln": 40
    }
  },
  {
    "id": "da_weather_69014603",
    "category": "da_weather",
    "sourceName": "危局第45期",
    "subType": "第45期 (v3.1)",
    "dateRange": "2026.07.31 - 08.14",
    "version": "3.1",
    "seasons": [
      45
    ],
    "title": "锐裂",
    "desc": "· 代理人的穿透率<color=#2BAD00>提升5%</color>，攻击命中敌人时无视其<color=#2BAD00>15%</color>的<color=#2EB6FF>电属性伤害抗性</color>。\n· 代理人发动<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[特殊技]</color>后，锐化伤害<color=#2BAD00>提升20%</color>，防御力<color=#2BAD00>提升10%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "penRatio": 5,
      "resShred": 15,
      "dmgBonus": 20,
      "inCombatDefPct": 10
    }
  },
  {
    "id": "da_weather_69014503",
    "category": "da_weather",
    "sourceName": "危局第45期",
    "subType": "第45期 (v3.1)",
    "dateRange": "2026.07.31 - 08.14",
    "version": "3.1",
    "seasons": [
      45
    ],
    "title": "曜霜",
    "desc": "· <color=#FFFFFF>[强攻]</color>特性的代理人的<color=#98EFF0>冰属性伤害</color><color=#2BAD00>提升20%</color>。\n· 代理人的暴击伤害<color=#2BAD00>提升30%</color>，攻击处于失衡状态的敌人时，该敌人的失衡易伤倍率额外<color=#2BAD00>提升20%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 20,
      "critDmg": 30,
      "dazeVuln": 20
    }
  },
  {
    "id": "da_weather_69013201",
    "category": "da_weather",
    "sourceName": "危局第44期",
    "subType": "第44期 (v3.1)",
    "dateRange": "2026.07.17 - 07.31",
    "version": "3.1",
    "seasons": [
      32,
      35,
      38,
      42,
      44
    ],
    "title": "摧心",
    "desc": "· 代理人的暴击伤害<color=#2BAD00>提升30%</color>。\n· [强攻]特性的代理人攻击力<color=#2BAD00>提升10%</color>，[普通攻击]命中时造成的伤害<color=#2BAD00>提升30%</color>，并无视敌人<color=#2BAD00>15%</color>的防御力。",
    "stats": {
      "critDmg": 30,
      "inCombatAtkPct": 10,
      "dmgBonus": 30,
      "defShred": 15
    }
  },
  {
    "id": "da_weather_69014401",
    "category": "da_weather",
    "sourceName": "危局第44期",
    "subType": "第44期 (v3.1)",
    "dateRange": "2026.07.17 - 07.31",
    "version": "3.1",
    "seasons": [
      44
    ],
    "title": "冰袭",
    "desc": "· 代理人的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升30%</color>。[强攻]特性的代理人攻击命中敌人时，无视其<color=#2BAD00>20%</color>的<color=#98EFF0>冰属性伤害抗性</color>。\n· 代理人发动<color=#FFFFFF>[强化特殊技]</color>后，自身的<color=#98EFF0>冰属性伤害</color><color=#2BAD00>提升30%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 60
    }
  },
  {
    "id": "da_weather_69014402",
    "category": "da_weather",
    "sourceName": "危局第44期",
    "subType": "第44期 (v3.1)",
    "dateRange": "2026.07.17 - 07.31",
    "version": "3.1",
    "seasons": [
      44
    ],
    "title": "异变",
    "desc": "· 队伍中存在2/3名<color=#FFFFFF>[异常]</color>特性的代理人时，全队造成的属性异常伤害分别<color=#2BAD00>提升10%/30%</color>，全队的攻击力分别<color=#2BAD00>提升5%/15%</color>。\n· 对敌人造成属性异常伤害时，无视其<color=#2BAD00>10%</color>的全属性伤害抗性与<color=#2BAD00>10%</color>的防御力。",
    "stats": {
      "dmgBonus": 30,
      "inCombatAtkPct": 15
    }
  },
  {
    "id": "da_weather_69013604",
    "category": "da_weather",
    "sourceName": "危局第43期",
    "subType": "第43期 (v3.0)",
    "dateRange": "2026.07.03 - 07.17",
    "version": "3.0",
    "seasons": [
      36,
      43
    ],
    "title": "破境",
    "desc": "· [命破]特性的代理人贯穿伤害<color=#2BAD00>提升15%</color>，造成的秽息盾削减值<color=#2BAD00>提升30%</color>。\n· 处于以太帷幕中的代理人，<color=#FE437E>以太属性伤害</color><color=#2BAD00>提升25%</color>，攻击命中敌人后使其失衡易伤倍率<color=#2BAD00>提升25%</color>，持续10秒，重复触发时刷新持续时间。",
    "stats": {
      "ppDmgBonus": 15,
      "dmgBonus": 25,
      "dazeVuln": 25
    }
  },
  {
    "id": "da_weather_69014201",
    "category": "da_weather",
    "sourceName": "危局第43期",
    "subType": "第43期 (v3.0)",
    "dateRange": "2026.07.03 - 07.17",
    "version": "3.0",
    "seasons": [
      42,
      43
    ],
    "title": "勠力",
    "desc": "· 队伍内存在2/3名<color=#FFFFFF>[异常]</color>特性代理人时，全队的异常精通分别<color=#2BAD00>提升30点/70点</color>，造成的属性异常伤害分别<color=#2BAD00>提升10%/25%</color>。\n· 对敌人施加<color=#FFFFFF>属性异常</color>效果后，敌人的全属性伤害抗性<color=#2BAD00>降低15%</color>，持续10秒，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 30,
      "dmgBonus": 25,
      "resShred": 15
    }
  },
  {
    "id": "da_weather_69014301",
    "category": "da_weather",
    "sourceName": "危局第43期",
    "subType": "第43期 (v3.0)",
    "dateRange": "2026.07.03 - 07.17",
    "version": "3.0",
    "seasons": [
      43
    ],
    "title": "掣霜",
    "desc": "· [强攻]特性的代理人攻击力<color=#2BAD00>提升25%</color>，<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[连携技]</color>命中敌人时，无视其<color=#2BAD00>30%</color>的<color=#98EFF0>冰属性伤害抗性</color>和<color=#FE437E>以太属性伤害抗性</color>。\n· 代理人命中处于失衡状态的敌人时，其失衡易伤<color=#2BAD00>提升40%</color>，持续5秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatAtkPct": 25
    }
  },
  {
    "id": "da_weather_69014202",
    "category": "da_weather",
    "sourceName": "危局第42期",
    "subType": "第42期 (v3.0)",
    "dateRange": "2026.06.19 - 07.03",
    "version": "3.0",
    "seasons": [
      42
    ],
    "title": "诡袭",
    "desc": "· 代理人的攻击力<color=#2BAD00>提升10%</color>，异常精通<color=#2BAD00>提升30点</color>，暴击伤害<color=#2BAD00>提升40%</color>。\n· 代理人对敌人施加<color=#FFFFFF>属性异常</color>效果后，其防御力<color=#2BAD00>降低10%</color>，持续10秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatAtkPct": 10,
      "anomalyMastery": 30,
      "critDmg": 40,
      "defShred": 10
    }
  },
  {
    "id": "da_weather_69014002",
    "category": "da_weather",
    "sourceName": "危局第41期",
    "subType": "第41期 (v2.8)",
    "dateRange": "2026.06.05 - 06.19",
    "version": "2.8",
    "seasons": [
      40,
      41
    ],
    "title": "溃亡",
    "desc": "· 代理人造成的失衡值<color=#2BAD00>提升20%</color>，<color=#FFFFFF>[终结技]</color>/<color=#FFFFFF>[连携技]</color>无视敌人<color=#2BAD00>30%</color>的全属性伤害抗性。\n· 发动<color=#FFFFFF>[连携技]</color>后，全队的攻击力<color=#2BAD00>提升10%</color>，暴击伤害<color=#2BAD00>提升15%</color>，持续20秒，最多可叠加3层，重复触发时刷新持续时间。",
    "stats": {
      "resShred": 30,
      "inCombatAtkPct": 30,
      "critDmg": 45
    }
  },
  {
    "id": "da_weather_69014003",
    "category": "da_weather",
    "sourceName": "危局第41期",
    "subType": "第41期 (v2.8)",
    "dateRange": "2026.06.05 - 06.19",
    "version": "2.8",
    "seasons": [
      41
    ],
    "title": "凛息",
    "desc": "· 代理人的<color=#A6C5FD>风属性伤害</color>、<color=#98EFF0>冰属性伤害</color><color=#2BAD00>提升20%</color>，异常精通<color=#2BAD00>提升20点</color>。\n· 对敌人施加<color=#FFFFFF>属性异常</color>状态时，敌人的全伤害抗性<color=#2BAD00>降低10%</color>，且全队造成的属性异常伤害<color=#2BAD00>提升10%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 30,
      "anomalyMastery": 20,
      "resShred": 10
    }
  },
  {
    "id": "da_weather_69014101",
    "category": "da_weather",
    "sourceName": "危局第41期",
    "subType": "第41期 (v2.8)",
    "dateRange": "2026.06.05 - 06.19",
    "version": "2.8",
    "seasons": [
      41
    ],
    "title": "构析",
    "desc": "· 代理人的异常精通<color=#2BAD00>提升45点</color>。\n· 使敌人进入<color=#FFFFFF>属性异常</color>状态后，敌人防御力<color=#2BAD00>降低10%</color>，持续10秒，触发<color=#FFFFFF>[紊乱]</color>后，敌人防御力额外<color=#2BAD00>降低15%</color>，持续10秒，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 45,
      "defShred": 25
    }
  },
  {
    "id": "da_weather_69013901",
    "category": "da_weather",
    "sourceName": "危局第40期",
    "subType": "第40期 (v2.8)",
    "dateRange": "2026.05.22 - 06.05",
    "version": "2.8",
    "seasons": [
      39,
      40
    ],
    "title": "朔风",
    "desc": "· 代理人攻击力<color=#2BAD00>提升10%</color>，对敌人施加<color=#FFFFFF>[乱流]</color>后，全队攻击力<color=#2BAD00>提升5%</color>，异常精通<color=#2BAD00>提升10点</color>，持续15秒，最多可叠加3层，重复触发时刷新持续时间。\n· 使敌人进入<color=#A6C5FD>风属性</color>、<color=#98EFF0>冰属性</color>异常后，其防御力<color=#2BAD00>降低10%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatAtkPct": 45,
      "anomalyMastery": 30,
      "defShred": 10
    }
  },
  {
    "id": "da_weather_69014001",
    "category": "da_weather",
    "sourceName": "危局第40期",
    "subType": "第40期 (v2.8)",
    "dateRange": "2026.05.22 - 06.05",
    "version": "2.8",
    "seasons": [
      40
    ],
    "title": "狩伐",
    "desc": "· 代理人造成的伤害<color=#2BAD00>提升20%</color>，暴击伤害<color=#2BAD00>提升20%</color>。\n· <color=#FFFFFF>[强攻]</color>特性代理人攻击力<color=#2BAD00>提升10%</color>，<color=#FFFFFF>[普通攻击]</color>/<color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升20%</color>，无视敌人<color=#2BAD00>10%</color>的防御力。",
    "stats": {
      "dmgBonus": 40,
      "critDmg": 20,
      "inCombatAtkPct": 10,
      "defShred": 10
    }
  },
  {
    "id": "da_weather_69013902",
    "category": "da_weather",
    "sourceName": "危局第39期",
    "subType": "第39期 (v2.8)",
    "dateRange": "2026.05.08 - 05.22",
    "version": "2.8",
    "seasons": [
      39
    ],
    "title": "强袭",
    "desc": "· <color=#FFFFFF>[强攻]</color>特性代理人的<color=#FE437E>以太属性伤害</color>和<color=#98EFF0>冰属性伤害</color><color=#2BAD00>提升35%</color>。\n· <color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升20%</color>，无视敌人<color=#2BAD00>10%</color>的防御力，发动<color=#FFFFFF>[连携技]</color>/<color=#FFFFFF>[强化特殊技]</color>后，代理人暴击伤害<color=#2BAD00>提升45%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 55,
      "defShred": 10,
      "critDmg": 45
    }
  },
  {
    "id": "da_weather_69014102",
    "category": "da_weather",
    "sourceName": "危局第39期",
    "subType": "第39期 (v2.8)",
    "dateRange": "2026.05.08 - 05.22",
    "version": "2.8",
    "seasons": [
      39
    ],
    "title": "支离",
    "desc": "· 代理人的贯穿伤害<color=#2BAD00>提升20%</color>，生命值<color=#2BAD00>提升15%</color>。\n· <color=#FFFFFF>[命破]</color>特性的代理人发动<color=#FFFFFF>[强化特殊技]</color>后，暴击伤害<color=#2BAD00>提升40%</color>，<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[终结技]</color>无视敌人<color=#2BAD00>15%</color>的<color=#F0D12B>物理属性伤害抗性</color>和<color=#FE437E>以太属性伤害抗性</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "ppDmgBonus": 20,
      "inCombatHpPct": 15,
      "critDmg": 40,
      "resShred": 15
    }
  },
  {
    "id": "da_weather_69013701",
    "category": "da_weather",
    "sourceName": "危局第38期",
    "subType": "第38期 (v2.7)",
    "dateRange": "2026.04.24 - 05.08",
    "version": "2.7",
    "seasons": [
      37,
      38
    ],
    "title": "授命",
    "desc": "· 代理人的贯穿伤害<color=#2BAD00>提升20%</color>。\n· [命破]特性的代理人发动[强化特殊技]后，暴击伤害<color=#2BAD00>提升50%</color>，<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[终结技]</color>命中敌人时无视其<color=#2BAD00>30%</color>的<color=#F0D12B>物理伤害抗性</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "ppDmgBonus": 20,
      "critDmg": 50
    }
  },
  {
    "id": "da_weather_69013801",
    "category": "da_weather",
    "sourceName": "危局第38期",
    "subType": "第38期 (v2.7)",
    "dateRange": "2026.04.24 - 05.08",
    "version": "2.7",
    "seasons": [
      38
    ],
    "title": "冽锋",
    "desc": "· 代理人造成的<color=#98EFF0>冰属性伤害</color>和<color=#F0D12B>物理属性伤害</color><color=#2BAD00>提升40%</color>，<color=#FFFFFF>[异放]</color>造成的伤害额外<color=#2BAD00>提升20%</color>。\n· 代理人使敌人进入<color=#FFFFFF>属性异常</color>状态后，其防御力<color=#2BAD00>降低15%</color>，<color=#98EFF0>冰属性伤害抗性</color><color=#2BAD00>降低30%</color>，持续10秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 60,
      "defShred": 15,
      "resShred": 30
    }
  },
  {
    "id": "da_weather_69013603",
    "category": "da_weather",
    "sourceName": "危局第37期",
    "subType": "第37期 (v2.7)",
    "dateRange": "2026.04.10 - 04.24",
    "version": "2.7",
    "seasons": [
      36,
      37
    ],
    "title": "焚霜",
    "desc": "· 代理人的异常精通<color=#2BAD00>提升30点</color>，<color=#FFFFFF>[异放]</color>造成的伤害<color=#2BAD00>提升10%</color>。\n· 对敌人施加<color=#FFFFFF>[异放]</color>效果后，敌人的<color=#98EFF0>冰属性伤害抗性</color><color=#2BAD00>降低25%</color>，代理人造成的<color=#98EFF0>冰属性伤害</color><color=#2BAD00>提升30%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 30,
      "dmgBonus": 40,
      "resShred": 25
    }
  },
  {
    "id": "da_weather_69013703",
    "category": "da_weather",
    "sourceName": "危局第37期",
    "subType": "第37期 (v2.7)",
    "dateRange": "2026.04.10 - 04.24",
    "version": "2.7",
    "seasons": [
      37
    ],
    "title": "异刃",
    "desc": "· 代理人的异常精通<color=#2BAD00>提升20点</color>，造成的属性异常伤害<color=#2BAD00>提升10%</color>。\n· 使敌人进入属性异常时，全队的暴击伤害<color=#2BAD00>提升60%</color>，敌人的防御力<color=#2BAD00>降低10%</color>，持续15秒，重新触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 20,
      "dmgBonus": 10,
      "critDmg": 60,
      "defShred": 10
    }
  },
  {
    "id": "da_weather_69012403",
    "category": "da_weather",
    "sourceName": "危局第36期",
    "subType": "第36期 (v2.7)",
    "dateRange": "2026.03.27 - 04.10",
    "version": "2.7",
    "seasons": [
      22,
      23,
      34,
      36
    ],
    "title": "合击",
    "desc": "· 队伍内存在1名/2名[强攻]特性的代理人时，全队造成的暴击伤害<color=#2BAD00>提升20%/60%</color>。\n· 发动[强化特殊技]、[终结技]后，代理人的<color=#2EB6FF>电属性伤害</color><color=#2BAD00>提升20%</color>，[强攻]特性代理人造成的伤害<color=#2BAD00>额外提升30%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "critDmg": 60,
      "dmgBonus": 50
    }
  },
  {
    "id": "da_weather_69013301",
    "category": "da_weather",
    "sourceName": "危局第35期",
    "subType": "第35期 (v2.6)",
    "dateRange": "2026.03.13 - 03.27",
    "version": "2.6",
    "seasons": [
      33,
      34,
      35
    ],
    "title": "续变",
    "desc": "· 代理人使敌人进入属性异常状态后，其失衡恢复速度<color=#2BAD00>降低15%</color>，全队攻击力<color=#2BAD00>提升15%</color>，持续20秒，重复触发刷新持续时间。\n· 使敌人进入失衡状态时，全队回复<color=#2BAD00>20点能量</color>，异放伤害<color=#2BAD00>提升30%</color>，持续30秒，重复触发刷新持续时间，能量回复效果30秒内最多触发1次。",
    "stats": {
      "inCombatAtkPct": 15,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_weather_69013501",
    "category": "da_weather",
    "sourceName": "危局第35期",
    "subType": "第35期 (v2.6)",
    "dateRange": "2026.03.13 - 03.27",
    "version": "2.6",
    "seasons": [
      35
    ],
    "title": "驰闪",
    "desc": "· 队伍内存在1名/2名[强攻]特性的代理人时，全队攻击力<color=#2BAD00>提升10%/25%</color>。\n· 代理人的[普通攻击]造成的伤害<color=#2BAD00>提升40%</color>，并无视敌人20%的<color=#2EB6FF>电属性伤害抗性</color>。",
    "stats": {
      "inCombatAtkPct": 25,
      "dmgBonus": 40,
      "resShred": 20
    }
  },
  {
    "id": "da_weather_69011201",
    "category": "da_weather",
    "sourceName": "危局第34期",
    "subType": "第34期 (v2.6)",
    "dateRange": "2026.02.27 - 03.13",
    "version": "2.6",
    "seasons": [
      12,
      20,
      34
    ],
    "title": "崩倾",
    "desc": "· 代理人的<color=#FFFFFF>[闪避反击]</color>、<color=#FFFFFF>[强化特殊技]</color>造成的伤害<color=#2BAD00>提升30%</color>。\n· 代理人命中非失衡状态敌人时，造成的失衡值<color=#2BAD00>提升10%</color>；命中失衡状态中的敌人时，暴击伤害<color=#2BAD00>提升30%</color>，敌人的失衡易伤倍率<color=#2BAD00>提升25%</color>。",
    "stats": {
      "dmgBonus": 30,
      "critDmg": 30,
      "dazeVuln": 25
    }
  },
  {
    "id": "da_weather_69013302",
    "category": "da_weather",
    "sourceName": "危局第33期",
    "subType": "第33期 (v2.6)",
    "dateRange": "2026.02.13 - 02.27",
    "version": "2.6",
    "seasons": [
      33
    ],
    "title": "裂魄",
    "desc": "· 代理人的[终结技]造成的伤害<color=#2BAD00>提升30%</color>，发动[终结技]后，全队的贯穿伤害<color=#2BAD00>提升10%</color>，暴击伤害<color=#2BAD00>提升25%</color>，持续20秒，重复触发刷新持续时间。\n· 代理人使敌人进入失衡状态后，其失衡易伤倍率<color=#2BAD00>提升20%</color>。",
    "stats": {
      "dmgBonus": 30,
      "ppDmgBonus": 10,
      "critDmg": 25,
      "dazeVuln": 20
    }
  },
  {
    "id": "da_weather_69013402",
    "category": "da_weather",
    "sourceName": "危局第33期",
    "subType": "第33期 (v2.6)",
    "dateRange": "2026.02.13 - 02.27",
    "version": "2.6",
    "seasons": [
      33
    ],
    "title": "骤暝",
    "desc": "· 代理人的<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[闪避反击]</color>、<color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升20%</color>，无视敌人<color=#2BAD00>30%</color>的<color=#98EFF0>冰属性伤害抗性</color>。\n· 对敌人施加[紊乱]效果时，代理人的暴击伤害<color=#2BAD00>提升50%</color>，敌人的失衡恢复速度<color=#2BAD00>降低15%</color>，失衡易伤倍率<color=#2BAD00>提升30%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 20,
      "resShred": 30,
      "critDmg": 50,
      "dazeVuln": 30
    }
  },
  {
    "id": "da_weather_69011904",
    "category": "da_weather",
    "sourceName": "危局第32期",
    "subType": "第32期 (v2.5)",
    "dateRange": "2026.01.30 - 02.13",
    "version": "2.5",
    "seasons": [
      19,
      28,
      32
    ],
    "title": "驭变",
    "desc": "· <color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升30%</color>。发动<color=#FFFFFF>[终结技]</color>时，代理人的攻击力<color=#2BAD00>提升15%</color>，持续15秒，重复触发时刷新持续时间。\n· 使敌人进入失衡状态后，其失衡易伤倍率<color=#2BAD00>提升35%</color>。",
    "stats": {
      "dmgBonus": 30,
      "inCombatAtkPct": 15,
      "dazeVuln": 35
    }
  },
  {
    "id": "da_weather_69013202",
    "category": "da_weather",
    "sourceName": "危局第32期",
    "subType": "第32期 (v2.5)",
    "dateRange": "2026.01.30 - 02.13",
    "version": "2.5",
    "seasons": [
      32
    ],
    "title": "异能",
    "desc": "· 代理人使敌人进入属性异常状态后，其全属性伤害抗性降低<color=#2BAD00>10%</color>，<color=#FE437E>以太伤害抗性</color>降低<color=#2BAD00>15%</color>，持续15秒，重复触发刷新持续时间。\n· 代理人的[强化特殊技]、[连携技]、[终结技]造成的属性异常积蓄值<color=#2BAD00>提升15%</color>，代理人造成的属性异常伤害<color=#2BAD00>提升15%</color>，异放伤害<color=#2BAD00>提升20%</color>。",
    "stats": {
      "resShred": 25,
      "dmgBonus": 35
    }
  },
  {
    "id": "da_weather_69012101",
    "category": "da_weather",
    "sourceName": "危局第31期",
    "subType": "第31期 (v2.5)",
    "dateRange": "2026.01.16 - 01.30",
    "version": "2.5",
    "seasons": [
      21,
      31
    ],
    "title": "澄意",
    "desc": "· 代理人的生命值上限<color=#2BAD00>提升25%</color>，贯穿伤害<color=#2BAD00>提升15%</color>。\n· [命破]特性的代理人造成的伤害<color=#2BAD00>提升15%</color>，终结技造成的伤害额外<color=#2BAD00>提升15%</color>。",
    "stats": {
      "inCombatHpPct": 25,
      "ppDmgBonus": 15,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_weather_69013101",
    "category": "da_weather",
    "sourceName": "危局第31期",
    "subType": "第31期 (v2.5)",
    "dateRange": "2026.01.16 - 01.30",
    "version": "2.5",
    "seasons": [
      31
    ],
    "title": "掠火",
    "desc": "· 代理人使敌人进入属性异常状态后，其全属性伤害抗性降低<color=#2BAD00>10%</color>，<color=#FE437E>以太伤害抗性</color>降低<color=#2BAD00>10%</color>，持续15秒，重复触发刷新持续时间。\n· 代理人造成的属性异常伤害<color=#2BAD00>提升15%</color>，异放伤害<color=#2BAD00>提升15%</color>，[连携技]、[终结技]造成的属性异常积蓄值<color=#2BAD00>提升20%</color>。",
    "stats": {
      "resShred": 20,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_weather_69013102",
    "category": "da_weather",
    "sourceName": "危局第31期",
    "subType": "第31期 (v2.5)",
    "dateRange": "2026.01.16 - 01.30",
    "version": "2.5",
    "seasons": [
      31
    ],
    "title": "破势",
    "desc": "· 代理人的<color=#2EB6FF>电属性伤害</color>和<color=#F0D12B>物理属性伤害</color><color=#2BAD00>提升20%</color>，<color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[连携技]</color>和<color=#FFFFFF>[终结技]</color>命中敌人时暴击伤害<color=#2BAD00>提升30%</color>。\n· 处于[以太帷幕]中的代理人攻击力<color=#2BAD00>提升10%</color>，攻击命中敌人时无视其<color=#2BAD00>15%</color>的防御力。",
    "stats": {
      "dmgBonus": 20,
      "critDmg": 30,
      "inCombatAtkPct": 10
    }
  },
  {
    "id": "da_weather_69012801",
    "category": "da_weather",
    "sourceName": "危局第30期",
    "subType": "第30期 (v2.4)",
    "dateRange": "2026.01.02 - 01.16",
    "version": "2.4",
    "seasons": [
      28,
      30
    ],
    "title": "异变",
    "desc": "· 代理人的攻击力<color=#2BAD00>提升25%</color>，异常精通<color=#2BAD00>提升40</color>点。\n· 对敌人施加属性异常效果后，敌人的全伤害抗性<color=#2BAD00>降低10%</color>，代理人对其造成的属性异常伤害<color=#2BAD00>提升30%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatAtkPct": 25,
      "anomalyMastery": 40,
      "resShred": 10,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_weather_69012904",
    "category": "da_weather",
    "sourceName": "危局第30期",
    "subType": "第30期 (v2.4)",
    "dateRange": "2026.01.02 - 01.16",
    "version": "2.4",
    "seasons": [
      30
    ],
    "title": "乘流",
    "desc": "· 处于[以太帷幕]中的代理人攻击力<color=#2BAD00>提升15%</color>，<color=#FFFFFF>[普通攻击]</color>和<color=#FFFFFF>[终结技]</color>命中敌人时无视其<color=#2BAD00>15%</color>的防御力。\n· [支援]特性的代理人发动<color=#FFFFFF>[强化特殊技]</color>后，全队<color=#F0D12B>物理属性伤害</color><color=#2BAD00>提升20%</color>，暴击伤害<color=#2BAD00>提升40%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatAtkPct": 15,
      "dmgBonus": 20,
      "critDmg": 40
    }
  },
  {
    "id": "da_weather_69012905",
    "category": "da_weather",
    "sourceName": "危局第30期",
    "subType": "第30期 (v2.4)",
    "dateRange": "2026.01.02 - 01.16",
    "version": "2.4",
    "seasons": [
      30
    ],
    "title": "威震",
    "desc": "· 代理人的生命值上限<color=#2BAD00>提升30%</color>，终结技造成的伤害<color=#2BAD00>提升40%</color>。\n· 代理人释放终结技后，能量和闪能获得效率<color=#2BAD00>提升15%</color>，<color=#FE437E>以太伤害</color>和<color=#FF5521>火属性伤害</color><color=#2BAD00>提升40%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "inCombatHpPct": 30,
      "dmgBonus": 80
    }
  },
  {
    "id": "da_weather_69012901",
    "category": "da_weather",
    "sourceName": "危局第29期",
    "subType": "第29期 (v2.4)",
    "dateRange": "2025.12.19 - 2026.01.02",
    "version": "2.4",
    "seasons": [
      29
    ],
    "title": "裁夺",
    "desc": "· 处于以太帷幕中时，代理人的攻击力<color=#2BAD00>提升20%</color>，暴击伤害<color=#2BAD00>提升20%</color>。\n· 敌人的失衡易伤倍率<color=#2BAD00>提升30%</color>，代理人的普通攻击和终结技攻击命中敌人时，无视其<color=#2BAD00>10%</color>的<color=#F0D12B>物理属性伤害抗性</color>和<color=#2BAD00>10%</color>的防御力。",
    "stats": {
      "inCombatAtkPct": 20,
      "critDmg": 20,
      "dazeVuln": 30
    }
  },
  {
    "id": "da_weather_69012902",
    "category": "da_weather",
    "sourceName": "危局第29期",
    "subType": "第29期 (v2.4)",
    "dateRange": "2025.12.19 - 2026.01.02",
    "version": "2.4",
    "seasons": [
      29
    ],
    "title": "霜暝",
    "desc": "· 代理人的<color=#98EFF0>冰属性伤害</color>和<color=#F0D12B>物理伤害</color><color=#2BAD00>提升30%</color>。\n· 使敌人进入属性异常时，全队的攻击力<color=#2BAD00>提升25%</color>，喧响值获取效率<color=#2BAD00>提升20%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 30,
      "inCombatAtkPct": 25
    }
  },
  {
    "id": "da_weather_69012903",
    "category": "da_weather",
    "sourceName": "危局第29期",
    "subType": "第29期 (v2.4)",
    "dateRange": "2025.12.19 - 2026.01.02",
    "version": "2.4",
    "seasons": [
      29
    ],
    "title": "破阵",
    "desc": "· 使敌人进入失衡状态后，其失衡易伤倍率<color=#2BAD00>提升35%</color>，失衡恢复速度<color=#2BAD00>降低10%</color>。\n· 代理人释放<color=#FFFFFF>强化特殊技</color>后，自身暴击伤害<color=#2BAD00>提升40%</color>，持续20秒。",
    "stats": {
      "dazeVuln": 35,
      "critDmg": 40
    }
  },
  {
    "id": "da_weather_69012703",
    "category": "da_weather",
    "sourceName": "危局第28期",
    "subType": "第28期 (v2.4)",
    "dateRange": "2025.12.05 - 12.19",
    "version": "2.4",
    "seasons": [
      27,
      28
    ],
    "title": "聚气",
    "desc": "· 代理人的攻击力<color=#2BAD00>提升16%</color>，敌人的失衡易伤倍率<color=#2BAD00>提升30%</color>。\n· 处于以太帷幕中的代理人，攻击命中敌人时无视其<color=#2BAD00>10%</color>的<color=#F0D12B>物理属性伤害抗性</color>和<color=#2BAD00>15%</color>的防御力。",
    "stats": {
      "inCombatAtkPct": 16,
      "dazeVuln": 30
    }
  },
  {
    "id": "da_weather_69011202",
    "category": "da_weather",
    "sourceName": "危局第27期",
    "subType": "第27期 (v2.4)",
    "dateRange": "2025.11.21 - 12.05",
    "version": "2.4",
    "seasons": [
      12,
      14,
      18,
      27
    ],
    "title": "奏鸣",
    "desc": "· 代理人的喧响值获取效率<color=#2BAD00>提升20%</color>。\n·<color=#FFFFFF>[终结技]</color>和<color=#FFFFFF>[强化特殊技]</color>命中敌人时，无视其<color=#2BAD00>20%</color>的伤害抗性，<color=#FFFFFF>[终结技]</color>命中敌人后，代理人的<color=#FFFFFF>[终结技]</color>和<color=#FFFFFF>[强化特殊技]</color>造成的伤害<color=#2BAD00>提升50%</color>，持续30秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 50
    }
  },
  {
    "id": "da_weather_69012301",
    "category": "da_weather",
    "sourceName": "危局第27期",
    "subType": "第27期 (v2.4)",
    "dateRange": "2025.11.21 - 12.05",
    "version": "2.4",
    "seasons": [
      22,
      23,
      27
    ],
    "title": "惑梦",
    "desc": "· 代理人的异常精通<color=#2BAD00>提升40点</color>。\n· 使敌人进入属性异常时，敌人的防御力<color=#2BAD00>降低10%</color>，代理人对其造成的异常伤害<color=#2BAD00>提升20%</color>，持续10秒，重新触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 40,
      "defShred": 10,
      "dmgBonus": 20
    }
  },
  {
    "id": "da_weather_69010201",
    "category": "da_weather",
    "sourceName": "危局第26期",
    "subType": "第26期 (v2.3)",
    "dateRange": "2025.11.14 - 11.21",
    "version": "2.3",
    "seasons": [
      2,
      7,
      11,
      14,
      26
    ],
    "title": "游刃",
    "desc": "· 代理人的属性异常积蓄效率<color=#2BAD00>提升25%</color>，异常精通<color=#2BAD00>提升40点</color>。\n· 对敌人施加属性异常效果时，代理人额外<color=#2BAD00>获得500点喧响值</color>，攻击力<color=#2BAD00>提升30%</color>，持续15秒，喧响值获得效果15秒内最多触发一次。",
    "stats": {
      "anomalyMastery": 40,
      "inCombatAtkPct": 30
    }
  },
  {
    "id": "da_weather_69012701",
    "category": "da_weather",
    "sourceName": "危局第26期",
    "subType": "第26期 (v2.3)",
    "dateRange": "2025.11.14 - 11.21",
    "version": "2.3",
    "seasons": [
      26
    ],
    "title": "破障",
    "desc": "· 代理人的贯穿伤害<color=#2BAD00>提升15%</color>，[命破]特性的代理人攻击命中敌人时，无视其<color=#2BAD00>20%</color>的全伤害抗性。\n· 发动[强化特殊技]后，代理人造成的<color=#FF5521>火属性伤害</color>提升40%，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "ppDmgBonus": 15,
      "dmgBonus": 40
    }
  },
  {
    "id": "da_weather_69012702",
    "category": "da_weather",
    "sourceName": "危局第26期",
    "subType": "第26期 (v2.3)",
    "dateRange": "2025.11.14 - 11.21",
    "version": "2.3",
    "seasons": [
      26
    ],
    "title": "淬体",
    "desc": "· 代理人造成的伤害<color=#2BAD00>提升20%</color>，攻击命中敌人时，无视其<color=#2BAD00>10%</color>的全伤害抗性。\n· [强攻]特性的代理人攻击力<color=#2BAD00>提升20%</color>，[普通攻击]造成的伤害<color=#2BAD00>提升40%</color>，并无视敌人<color=#2BAD00>20%</color>的防御力。",
    "stats": {
      "dmgBonus": 60,
      "inCombatAtkPct": 20,
      "defShred": 20
    }
  },
  {
    "id": "da_weather_69010301",
    "category": "da_weather",
    "sourceName": "危局第25期",
    "subType": "第25期 (v2.3)",
    "dateRange": "2025.11.07 - 11.21",
    "version": "2.3",
    "seasons": [
      3,
      12,
      20,
      21,
      25
    ],
    "title": "异象",
    "desc": "· 代理人的属性异常积蓄效率<color=#2BAD00>提升20%</color>。\n· 对敌人施加<color=#FFFFFF>属性异常</color>效果时，全队<color=#2BAD00>提升60点异常精通</color>，<color=#FFFFFF>紊乱</color>造成的伤害<color=#2BAD00>提升40%</color>，持续15秒。",
    "stats": {
      "dmgBonus": 40
    }
  },
  {
    "id": "da_weather_69011301",
    "category": "da_weather",
    "sourceName": "危局第25期",
    "subType": "第25期 (v2.3)",
    "dateRange": "2025.11.07 - 11.21",
    "version": "2.3",
    "seasons": [
      13,
      15,
      16,
      25
    ],
    "title": "凝神",
    "desc": "· 代理人的生命值上限<color=#2BAD00>提升30%</color>，终结技造成的伤害<color=#2BAD00>提升40%</color>。\n· 代理人释放终结技后，能量和闪能获得效率 <color=#2BAD00>提升15%</color>，<color=#FE437E>以太属性伤害</color>和<color=#98EFF0>冰属性伤害</color><color=#2BAD00>提升40%</color>，持续20秒。",
    "stats": {
      "inCombatHpPct": 30,
      "dmgBonus": 80
    }
  },
  {
    "id": "da_weather_69012501",
    "category": "da_weather",
    "sourceName": "危局第25期",
    "subType": "第25期 (v2.3)",
    "dateRange": "2025.11.07 - 11.21",
    "version": "2.3",
    "seasons": [
      25
    ],
    "title": "截脉",
    "desc": "· 代理人的[终结技]造成的伤害<color=#2BAD00>提升30%</color>，代理人使敌人进入失衡状态后，其失衡易伤倍率<color=#2BAD00>提升50%</color>。\n· [击破]特性的代理人发动[强化特殊技]后，全队攻击命中敌人时，无视其<color=#2BAD00>7%全属性伤害抗性</color>，持续30秒，最多可叠加3层，每层效果单独结算持续时间。",
    "stats": {
      "dmgBonus": 30,
      "dazeVuln": 50
    }
  },
  {
    "id": "da_weather_69010103",
    "category": "da_weather",
    "sourceName": "危局第24期",
    "subType": "第24期 (v2.3)",
    "dateRange": "2025.10.24 - 11.07",
    "version": "2.3",
    "seasons": [
      1,
      4,
      13,
      24
    ],
    "title": "破招",
    "desc": "· <color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[闪避反击]</color>、<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[冲刺攻击]</color>造成的伤害<color=#2BAD00>提升30%</color>。\n· 触发<color=#FFFFFF>[极限闪避]</color>或<color=#FFFFFF>[极限支援]</color>后，全队攻击力<color=#2BAD00>提升10%</color>，暴击伤害<color=#2BAD00>提升10%</color>，持续15秒，最多叠加3层，每层效果单独结算持续时间。",
    "stats": {
      "dmgBonus": 30,
      "inCombatAtkPct": 30,
      "critDmg": 30
    }
  },
  {
    "id": "da_weather_69012401",
    "category": "da_weather",
    "sourceName": "危局第24期",
    "subType": "第24期 (v2.3)",
    "dateRange": "2025.10.24 - 11.07",
    "version": "2.3",
    "seasons": [
      24
    ],
    "title": "聚元",
    "desc": "· 代理人的生命值上限<color=#2BAD00>提升20%</color>，[终结技]造成的伤害<color=#2BAD00>提升40%</color>。\n· 代理人发动[强化特殊技]后，能量和闪能获得效率<color=#2BAD00>提升20%</color>，<color=#FE437E>以太属性伤害</color><color=#2BAD00>提升35%</color>，持续20秒，重复触发刷新持续时间。",
    "stats": {
      "inCombatHpPct": 20,
      "dmgBonus": 75
    }
  },
  {
    "id": "da_weather_69012402",
    "category": "da_weather",
    "sourceName": "危局第24期",
    "subType": "第24期 (v2.3)",
    "dateRange": "2025.10.24 - 11.07",
    "version": "2.3",
    "seasons": [
      24
    ],
    "title": "怒涛",
    "desc": "· [命破]特性的代理人的生命值低于上限的80%/50%时，攻击命中敌人时无视其<color=#2BAD00>10%/25%</color>的<color=#98EFF0>冰属性伤害抗性</color>。\n· 代理人开启或延长以太帷幕时，全队的贯穿伤害<color=#2BAD00>提升20%</color>，暴击伤害<color=#2BAD00>提升30%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "ppDmgBonus": 20,
      "critDmg": 30
    }
  },
  {
    "id": "da_weather_69012201",
    "category": "da_weather",
    "sourceName": "危局第23期",
    "subType": "第23期 (v2.3)",
    "dateRange": "2025.10.10 - 10.24",
    "version": "2.3",
    "seasons": [
      22,
      23
    ],
    "title": "极境",
    "desc": "· [命破]特性的代理人贯穿伤害<color=#2BAD00>提升10%</color>，造成的秽息盾削减值<color=#2BAD00>提升30%</color>。\n· 处于以太帷幕中的代理人，贯穿伤害额外<color=#2BAD00>提升30%</color>，攻击命中敌人后使其失衡易伤倍率<color=#2BAD00>提升45%</color>，持续10秒，重复触发时刷新持续时间。",
    "stats": {
      "ppDmgBonus": 40,
      "dazeVuln": 45
    }
  },
  {
    "id": "da_weather_69011901",
    "category": "da_weather",
    "sourceName": "危局第21期",
    "subType": "第21期 (v2.2)",
    "dateRange": "2025.09.26 - 10.10",
    "version": "2.2",
    "seasons": [
      19,
      21
    ],
    "title": "倏袭",
    "desc": "· 队伍内存在1名/2名[强攻]特性的代理人时，全队造成的伤害<color=#2BAD00>提升20%/40%</color>。\n· 触发暴击后，代理人的<color=#2EB6FF>电属性伤害</color><color=#2BAD00>提升30%</color>，[强攻]特性代理人的暴击伤害<color=#2BAD00>额外提升40%</color>，持续5秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 70,
      "critDmg": 40
    }
  },
  {
    "id": "da_weather_69012001",
    "category": "da_weather",
    "sourceName": "危局第20期",
    "subType": "第20期 (v2.2)",
    "dateRange": "2025.09.12 - 09.26",
    "version": "2.2",
    "seasons": [
      20
    ],
    "title": "逐锋",
    "desc": "· 代理人的[追加攻击]造成的伤害<color=#2BAD00>提升30%</color>，暴击伤害<color=#2BAD00>提升30%</color>。\n· 当[强攻]特性代理人的<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[终结技]</color>命中敌人时，其全伤害抗性<color=#2BAD00>降低30%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 30,
      "critDmg": 30,
      "resShred": 30
    }
  },
  {
    "id": "da_weather_69011601",
    "category": "da_weather",
    "sourceName": "危局第19期",
    "subType": "第19期 (v2.2)",
    "dateRange": "2025.08.29 - 09.12",
    "version": "2.2",
    "seasons": [
      16,
      17,
      19
    ],
    "title": "奇巧",
    "desc": "· 代理人造成的伤害<color=#2BAD00>提升20%</color>，造成的<color=#F0D12B>物理属性伤害</color>额外<color=#2BAD00>提升20%</color>。\n· 使敌人进入属性异常后，敌人的防御力<color=#2BAD00>降低10%</color>，持续10秒；对敌人施加[紊乱]效果后，敌人的防御力<color=#2BAD00>额外降低25%</color>，持续10秒，两个效果独立刷新持续时间。",
    "stats": {
      "dmgBonus": 40,
      "defShred": 35
    }
  },
  {
    "id": "da_weather_69011401",
    "category": "da_weather",
    "sourceName": "危局第18期",
    "subType": "第18期 (v2.1)",
    "dateRange": "2025.08.15 - 08.29",
    "version": "2.1",
    "seasons": [
      14,
      18
    ],
    "title": "沉疴",
    "desc": "· 使敌人进入失衡状态后，其失衡易伤倍率<color=#2BAD00>提升25%</color>，失衡恢复速度<color=#2BAD00>降低10%</color>。\n· 代理人释放连携技后，自身的攻击力<color=#2BAD00>提升20%</color>，暴击伤害<color=#2BAD00>提升30%</color>，持续20秒。",
    "stats": {
      "dazeVuln": 25,
      "inCombatAtkPct": 20,
      "critDmg": 30
    }
  },
  {
    "id": "da_weather_69011801",
    "category": "da_weather",
    "sourceName": "危局第18期",
    "subType": "第18期 (v2.1)",
    "dateRange": "2025.08.15 - 08.29",
    "version": "2.1",
    "seasons": [
      18
    ],
    "title": "提振",
    "desc": "· 代理人的<color=#2EB6FF>电属性伤害</color>和<color=#F0D12B>物理伤害</color><color=#2BAD00>提升30%</color>。\n· 使敌人进入属性异常时，全队的攻击力<color=#2BAD00>提升8%</color>，喧响值获取效率<color=#2BAD00>提升8%</color>，持续20秒，最多可叠加4层，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 30,
      "inCombatAtkPct": 32
    }
  },
  {
    "id": "da_weather_69011101",
    "category": "da_weather",
    "sourceName": "危局第17期",
    "subType": "第17期 (v2.1)",
    "dateRange": "2025.08.01 - 08.15",
    "version": "2.1",
    "seasons": [
      11,
      17
    ],
    "title": "狂岚",
    "desc": "· 代理人的<color=#FFFFFF>[特殊技]</color>、<color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升30%</color>。\n· <color=#FFFFFF>[强化特殊技]</color>、<color=#FFFFFF>[追加攻击]</color>命中敌人时，代理人的暴击伤害<color=#2BAD00>提升30%</color>，持续20秒，并使敌人的防御力<color=#2BAD00>降低15%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 30,
      "critDmg": 30,
      "defShred": 15
    }
  },
  {
    "id": "da_weather_69011701",
    "category": "da_weather",
    "sourceName": "危局第17期",
    "subType": "第17期 (v2.1)",
    "dateRange": "2025.08.01 - 08.15",
    "version": "2.1",
    "seasons": [
      17
    ],
    "title": "通力",
    "desc": "· 代理人的[支援攻击]、[强化特殊技]、[终结技]造成的伤害<color=#2BAD00>提升25%</color>。\n· 代理人每次发动[快速支援]或[连携技]时，喧响值获得效率<color=#2BAD00>提升30%</color>，攻击时无视敌人<color=#2BAD00>20%伤害抗性</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 25,
      "resShred": 20
    }
  },
  {
    "id": "da_weather_69010801",
    "category": "da_weather",
    "sourceName": "危局第16期",
    "subType": "第16期 (v2.1)",
    "dateRange": "2025.07.18 - 08.01",
    "version": "2.1",
    "seasons": [
      8,
      9,
      11,
      16
    ],
    "title": "昏惫",
    "desc": "· 代理人造成的失衡值<color=#2BAD00>提升10%</color>，连携技造成的伤害<color=#2BAD00>提升50%</color>。\n· <color=#FFFFFF>[连携技]</color>命中敌人时，敌人的失衡易伤倍率<color=#2BAD00>提升25%</color>，且全队攻击力<color=#2BAD00>提升20%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 50,
      "dazeVuln": 25,
      "inCombatAtkPct": 20
    }
  },
  {
    "id": "da_weather_69010303",
    "category": "da_weather",
    "sourceName": "危局第15期",
    "subType": "第15期 (v2.0)",
    "dateRange": "2025.07.04 - 07.18",
    "version": "2.0",
    "seasons": [
      3,
      4,
      6,
      7,
      10,
      15
    ],
    "title": "驰援",
    "desc": "· 代理人的能量获取效率<color=#2BAD00>提升25%</color>，<color=#FFFFFF>[快速支援]</color>造成的伤害<color=#2BAD00>提升50%</color>。\n· 每次使用<color=#FFFFFF>[快速支援]</color>时，全队的攻击力<color=#2BAD00>提升10%</color>，持续20秒，最多可叠加3层，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 50,
      "inCombatAtkPct": 30
    }
  },
  {
    "id": "da_weather_69011501",
    "category": "da_weather",
    "sourceName": "危局第15期",
    "subType": "第15期 (v2.0)",
    "dateRange": "2025.07.04 - 07.18",
    "version": "2.0",
    "seasons": [
      15
    ],
    "title": "幻涌",
    "desc": "· 代理人的<color=#FE437E>以太属性异常积蓄效率</color>和<color=#F0D12B>物理属性异常积蓄效率</color><color=#2BAD00>提升20%</color>，异常精通提升60点。\n· 代理人命中属性异常状态中的敌人时，造成的伤害<color=#2BAD00>提升25%</color>，并无视敌人<color=#2BAD00>15%</color>的防御力。",
    "stats": {
      "anomalyMastery": 60,
      "dmgBonus": 25,
      "defShred": 15
    }
  },
  {
    "id": "da_weather_69011001",
    "category": "da_weather",
    "sourceName": "危局第13期",
    "subType": "第13期 (v2.0)",
    "dateRange": "2025.06.06 - 06.20",
    "version": "2.0",
    "seasons": [
      10,
      13
    ],
    "title": "蓄变",
    "desc": "· 代理人的<color=#FE437E>以太属性异常积蓄效率</color>和<color=#F0D12B>物理属性异常积蓄效率</color>将<color=#2BAD00>提升25%</color>，异常精通<color=#2BAD00>提升60</color>点。\n· 触发属性异常时，敌人的防御力<color=#2BAD00>降低10%</color>，且承受的属性异常伤害<color=#2BAD00>提升30%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 60,
      "defShred": 10,
      "dmgBonus": 30
    }
  },
  {
    "id": "da_weather_69010701",
    "category": "da_weather",
    "sourceName": "危局第10期",
    "subType": "第10期 (v1.7)",
    "dateRange": "2025.04.25 - 05.09",
    "version": "1.7",
    "seasons": [
      7,
      8,
      10
    ],
    "title": "锐进",
    "desc": "· 代理人的<color=#FFFFFF>[追加攻击]</color>、<color=#FFFFFF>[连携技]</color>造成的伤害<color=#2BAD00>提升30%</color>。\n· <color=#FFFFFF>[追加攻击]</color>、<color=#FFFFFF>[闪避反击]</color>命中敌人时，全队的攻击力<color=#2BAD00>提升15%</color>，暴击伤害<color=#2BAD00>提升40%</color>，持续20秒，重复触发时刷新持续时间。",
    "stats": {
      "dmgBonus": 30,
      "inCombatAtkPct": 15,
      "critDmg": 40
    }
  },
  {
    "id": "da_weather_69010502",
    "category": "da_weather",
    "sourceName": "危局第9期",
    "subType": "第9期 (v1.6)",
    "dateRange": "2025.04.11 - 04.25",
    "version": "1.6",
    "seasons": [
      5,
      9
    ],
    "title": "终袭",
    "desc": "· 代理人的喧响值获取效率<color=#2BAD00>提升20%</color>。\n·<color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升30%</color>，<color=#FFFFFF>[终结技]</color>命中敌人后，将使敌人的防御力<color=#2BAD00>降低15%</color>，持续20秒。",
    "stats": {
      "dmgBonus": 30,
      "defShred": 15
    }
  },
  {
    "id": "da_weather_69010901",
    "category": "da_weather",
    "sourceName": "危局第9期",
    "subType": "第9期 (v1.6)",
    "dateRange": "2025.04.11 - 04.25",
    "version": "1.6",
    "seasons": [
      9
    ],
    "title": "激变",
    "desc": "· 代理人的<color=#FF5521>火属性异常积蓄效率</color>和<color=#FE437E>以太属性异常积蓄效率</color>将<color=#2BAD00>提升20%</color>，异常精通<color=#2BAD00>提升80</color>。\n· 触发属性异常时，敌人的防御力<color=#2BAD00>降低15%</color>，且承受的属性异常伤害<color=#2BAD00>提升40%</color>，持续15秒，重复触发时刷新持续时间。",
    "stats": {
      "anomalyMastery": 80,
      "defShred": 15,
      "dmgBonus": 40
    }
  },
  {
    "id": "da_weather_69010803",
    "category": "da_weather",
    "sourceName": "危局第8期",
    "subType": "第8期 (v1.6)",
    "dateRange": "2025.03.28 - 04.11",
    "version": "1.6",
    "seasons": [
      8
    ],
    "title": "灼冽",
    "desc": "· 代理人的<color=#FF5521>火属性异常积蓄效率</color>和<color=#98EFF0>冰属性异常积蓄效率</color>将<color=#2BAD00>提升20%</color>，攻击力<color=#2BAD00>提升25%</color>。\n·对敌人施加<color=#FFFFFF>属性异常</color>效果时，代理人<color=#2BAD00>回复400点喧响值</color>，<color=#2BAD00>提升80点异常精通</color>，持续15秒，喧响值回复效果15秒内最多触发一次。",
    "stats": {
      "inCombatAtkPct": 25
    }
  },
  {
    "id": "da_weather_69010601",
    "category": "da_weather",
    "sourceName": "危局第6期",
    "subType": "第6期 (v1.5)",
    "dateRange": "2025.02.28 - 03.14",
    "version": "1.5",
    "seasons": [
      6
    ],
    "title": "电火",
    "desc": "· 代理人的<color=#FF5521>火属性伤害</color>和<color=#2EB6FF>电属性伤害</color>将<color=#2BAD00>提升25%</color>。\n· 触发<color=#FFFFFF>[连携技]</color>、<color=#FFFFFF>[极限支援]</color>或<color=#FFFFFF>[快速支援]</color>后，代理人的暴击率<color=#2BAD00>提升20%</color>，暴击伤害<color=#2BAD00>提升40%</color>，持续20秒。",
    "stats": {
      "critRate": 20,
      "critDmg": 40
    }
  },
  {
    "id": "da_weather_69010602",
    "category": "da_weather",
    "sourceName": "危局第6期",
    "subType": "第6期 (v1.5)",
    "dateRange": "2025.02.28 - 03.14",
    "version": "1.5",
    "seasons": [
      6
    ],
    "title": "积异",
    "desc": "· 代理人的异常积蓄效率<color=#2BAD00>提升10%</color>，拥有护盾时异常积蓄效率<color=#2BAD00>额外提升20%</color>。\n· 攻击处于属性异常状态中的敌人时，代理人造成的伤害<color=#2BAD00>提升40%</color>。",
    "stats": {
      "dmgBonus": 40
    }
  },
  {
    "id": "da_weather_69010401",
    "category": "da_weather",
    "sourceName": "危局第5期",
    "subType": "第5期 (v1.5)",
    "dateRange": "2025.02.14 - 02.28",
    "version": "1.5",
    "seasons": [
      4,
      5
    ],
    "title": "破衡",
    "desc": "· 代理人造成的失衡值<color=#2BAD00>提升15%</color>，<color=#FFFFFF>[连携技]</color>造成的伤害<color=#2BAD00>提升60%</color>。\n· 每次使用<color=#FFFFFF>[连携技]</color>时，全队的攻击力<color=#2BAD00>提升10%</color>，持续20秒，最多可叠加4层，每层效果单独结算持续时间。",
    "stats": {
      "dmgBonus": 60,
      "inCombatAtkPct": 40
    }
  },
  {
    "id": "da_weather_69010501",
    "category": "da_weather",
    "sourceName": "危局第5期",
    "subType": "第5期 (v1.5)",
    "dateRange": "2025.02.14 - 02.28",
    "version": "1.5",
    "seasons": [
      5
    ],
    "title": "灼冽",
    "desc": "· 代理人的<color=#FF5521>火属性异常积蓄效率</color>和<color=#98EFF0>冰属性异常积蓄效率</color>将<color=#2BAD00>提升20%</color>，攻击力<color=#2BAD00>提升25%</color>。\n·对敌人施加<color=#FFFFFF>属性异常</color>效果时，代理人<color=#2BAD00>回复300点喧响值</color>，<color=#2BAD00>提升80点异常精通</color>，持续15秒。",
    "stats": {
      "inCombatAtkPct": 25
    }
  },
  {
    "id": "da_weather_69010302",
    "category": "da_weather",
    "sourceName": "危局第3期",
    "subType": "第3期 (v1.4)",
    "dateRange": "2025.01.17 - 01.31",
    "version": "1.4",
    "seasons": [
      3
    ],
    "title": "霜雷",
    "desc": "· 代理人的<color=#2EB6FF>电属性伤害</color>和<color=#98EFF0>冰属性伤害</color>将<color=#2BAD00>提升25%</color>。\n· <color=#FFFFFF>[普通攻击]</color>、<color=#FFFFFF>[闪避反击]</color>和<color=#FFFFFF>[冲刺攻击]</color>造成的伤害<color=#2BAD00>提升40%</color>，无视敌人<color=#2BAD00>15%</color>防御力。",
    "stats": {
      "dmgBonus": 40,
      "defShred": 15
    }
  },
  {
    "id": "da_weather_69010202",
    "category": "da_weather",
    "sourceName": "危局第2期",
    "subType": "第2期 (v1.4)",
    "dateRange": "2025.01.03 - 01.17",
    "version": "1.4",
    "seasons": [
      2
    ],
    "title": "速决",
    "desc": "· 代理人的攻击力<color=#2BAD00>提升20%</color>，喧响值获取效率<color=#2BAD00>提升20%</color>；发动<color=#FFFFFF>[终结技]</color>时，代理人的攻击力额外<color=#2BAD00>提升15%</color>，持续15秒。\n· <color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升40%</color>，造成的失衡值<color=#2BAD00>提升20%</color>，累积的属性异常积蓄值<color=#2BAD00>提升20%</color>。",
    "stats": {
      "inCombatAtkPct": 35,
      "dmgBonus": 40
    }
  },
  {
    "id": "da_weather_69010203",
    "category": "da_weather",
    "sourceName": "危局第2期",
    "subType": "第2期 (v1.4)",
    "dateRange": "2025.01.03 - 01.17",
    "version": "1.4",
    "seasons": [
      2
    ],
    "title": "倾覆",
    "desc": "· 代理人造成的失衡值<color=#2BAD00>提升25%</color>，<color=#FFFFFF>[连携技]</color>造成的伤害<color=#2BAD00>提升80%</color>。\n· 发动<color=#FFFFFF>[连携技]</color>时，代理人<color=#2BAD00>回复20点能量</color>，造成的伤害<color=#2BAD00>提升50%</color>，持续20秒。",
    "stats": {
      "dmgBonus": 130
    }
  },
  {
    "id": "da_weather_69010101",
    "category": "da_weather",
    "sourceName": "危局第1期",
    "subType": "第1期 (v1.4)",
    "dateRange": "2024.12.20 - 2025.01.03",
    "version": "1.4",
    "seasons": [
      1
    ],
    "title": "诛心",
    "desc": "· 代理人的属性异常积蓄效率<color=#2BAD00>提升30%</color>，<color=#FFFFFF>[紊乱]</color>效果造成的伤害<color=#2BAD00>提升40%</color>。\n· 对敌人施加<color=#FFFFFF>[紊乱]</color>效果时，全队<color=#FFFFFF>回复10点能量</color>，代理人的攻击力<color=#FFFFFF>提升25%</color>，持续30秒，能量回复效果20秒内最多触发一次。",
    "stats": {
      "dmgBonus": 40,
      "inCombatAtkPct": 25
    }
  },
  {
    "id": "da_weather_69010102",
    "category": "da_weather",
    "sourceName": "危局第1期",
    "subType": "第1期 (v1.4)",
    "dateRange": "2024.12.20 - 2025.01.03",
    "version": "1.4",
    "seasons": [
      1
    ],
    "title": "速决",
    "desc": "· 代理人的攻击力<color=#2BAD00>提升20%</color>，喧响值获得效率<color=#2BAD00>提升20%</color>；发动<color=#FFFFFF>[终结技]</color>时，代理人的攻击力额外<color=#2BAD00>提升15%</color>，持续15秒。\n· <color=#FFFFFF>[终结技]</color>造成的伤害<color=#2BAD00>提升40%</color>，造成的失衡值<color=#2BAD00>提升20%</color>，累积的属性异常积蓄值<color=#2BAD00>提升20%</color>。",
    "stats": {
      "inCombatAtkPct": 35,
      "dmgBonus": 40
    }
  }
];

export const DISC_BUFFS: Record<string, BuffItem> = Object.fromEntries(
  Object.entries(DISC_4_SETS)
    .filter(([k]) => k !== 'none')
    .map(([key, set4]) => {
      const set2 = DISC_2_SETS[key];
      const role = DISC_ROLE[key] === 'sup' ? '辅助/全队4件套' : '输出4件套';
      return [
        key,
        {
          id: `disc_${key}`,
          category: 'disc' as const,
          sourceName: set4.name,
          subType: role,
          title: `${set4.name} (4件套)`,
          desc: `【2件套】${set2?.note ?? ''}\n【4件套】${set4.note ?? ''}`,
          stats: set4.stats as Partial<AgentStats>,
        },
      ];
    }),
);
