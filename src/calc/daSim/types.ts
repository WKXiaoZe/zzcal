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
  applies_buff?: { inCombatAtkPct: number; duration_s: number };
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

export type DaResult = {
  score: {
    total_damage: number;
    hp_proxy: number;
    final_t: number;
    final_decibel: number;
    total_stun_applied: number;
  };
  plan: { agent: string; action: string }[];
  log: DaLogRow[];
};
