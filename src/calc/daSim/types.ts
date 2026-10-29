export type DaActionBuff = {
  inCombatAtkPct?: number;
  inCombatAtkFlat_from_caster_atk_ratio?: number;
  dmgBonus?: number;
  resShred?: number;
  cinema_m6_dmgBonus?: number;
  duration_s: number;
  pass_a?: Record<string, unknown>;
};

export type DaAction = {
  id: string;
  label: string;
  kind: string;
  duration_s: number;
  energy_cost: number;
  energy_gain: number;
  decibel_gain: number;
  multiplier_pct: number;
  stun: number;
  needs_flash?: boolean;
  needs_decibel?: number;
  applies_buff?: DaActionBuff;
};

export type DaKit = {
  agent_id: string;
  cn: string;
  profession: string;
  actions: DaAction[];
};

export type DaScenario = {
  period_id: number;
  boss_key: string;
  boss_cn: string;
  selectable_buff_cn: string;
  team: string[];
  fight_duration_s: number;
  boss: Record<string, number | boolean | string>;
  agent_stats: Record<string, any>;
  field_buffs_from_selectable: Record<string, number | string>;
  seed?: number;
  score?: {
    damage_score_cap?: number;
    operation_score_cap?: number;
    op_per_part_break?: number;
    rank_goals?: { s: number; a: number; b: number };
  };
  part_break?: Record<string, number | boolean | string>;
  soukaku_mindscape?: number;
};

export type DaLogRow = {
  t: number;
  t_end: number;
  agent: string;
  action: string;
  label?: string;
  dmg: number;
  stun: number;
  total_dmg: number;
  decibel: number;
};

export type DaScoreBlock = {
  total_damage: number;
  hp_proxy: number;
  hp_max?: number;
  final_t: number;
  final_decibel: number;
  total_stun_applied: number;
  part_breaks?: number;
  da?: {
    damage_score: number;
    operation_score: number;
    total_score: number;
    rank: string;
    part_breaks?: number;
  };
};

export type DaResult = {
  score: DaScoreBlock;
  plan: { agent: string; action: string }[];
  log: DaLogRow[];
};
