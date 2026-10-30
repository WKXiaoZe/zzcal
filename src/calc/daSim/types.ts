// Deadly Assault (危局强袭战) simulator — JSON shapes (loose; data comes from nanoka da-sim).
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Json = any;

export interface DaKitAction {
  id: string;
  kind: string;
  label?: string;
  skill_cn?: string;
  duration_s?: number;
  energy_cost?: number;
  energy_gain?: number;
  decibel_gain?: number;
  multiplier_pct?: number;
  stun?: number;
  needs_flash?: boolean;
  needs_decibel?: number;
  requires_mark_stacks?: number;
  consumes_mark_stacks?: number;
  grants_mark_stacks?: number;
  cinema_m1_white_thunder_procs?: number;
  applies_buff?: Record<string, any>;
  [k: string]: any;
}

export interface DaKit {
  agent_id: string;
  cn?: string;
  profession?: string;
  actions: DaKitAction[];
  [k: string]: any;
}

export type DaScenario = Record<string, any> & {
  team: string[];
  boss: Record<string, any>;
  agent_stats: Record<string, Record<string, any>>;
};

export interface BossAttackEntry {
  skill: string;
  weight: number | null;
  weight_var?: string | null;
  distance_min?: number | null;
  distance_max?: number | null;
  cd_var?: string | null;
  cd_set_literal?: number | null;
}

export interface BossModel {
  boss_key: string;
  cd_variables: string[];
  attacks: BossAttackEntry[];
}

export interface BossEvent {
  t: number;
  skill: string;
  weight_var?: string | null;
  parry_window: [number, number] | null;
  duration: number;
  telegraph_s: number;
  active_s: number;
  recover_s: number;
  parryable: boolean;
  window_assumption: string;
  window_source: string;
}

export interface ScoreCurve {
  bars: { hp_bp: number; points: number }[];
  sum_points?: number;
  source?: string;
  [k: string]: any;
}

export type BuildMode = 'auto' | 'file' | 'none';

export interface DaDataBundle {
  scenario: DaScenario;
  kits: Record<string, DaKit>;
  bossModel: BossModel;
  attackWindows: Record<string, Record<string, any>>;
  scoreCurve: ScoreCurve;
  weaponsExt: Record<string, any>;
  buildsFile?: Record<string, any> | null;
}

export interface SearchOptions {
  beamWidth: number;
  maxSteps: number;
  seed: number;
  buildMode: BuildMode;
  budget?: number;
}
