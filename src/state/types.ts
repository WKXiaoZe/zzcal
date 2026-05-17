// src/state/types.ts
import type { BattleType } from '../calc/types';

export type AppMode = 'manual' | 'auto';

export interface SlotConfig {
  presetName: string;       // 角色名或音擎名，'' 表示未选
  cinemaOrStar: number;     // agent: cinema 0-6; weapon: star 1-5
  customOverrides: Record<string, number>;  // input 框被改过的字段
}

export interface DiscConfig {
  slot4Stat: 'critRate' | 'critDmg' | 'atkPct' | 'anomalyMastery';
  set4Key: string;
  set2Key: string;
  // 副词条计数
  subCounts: { CR: number; CD: number; ATK: number; HP: number; AM: number };
}

export interface AppState {
  battleType: BattleType;
  mode: AppMode;

  agents: { main: SlotConfig; sup1: SlotConfig; sup2: SlotConfig };
  weapons: { main: SlotConfig; sup1: SlotConfig; sup2: SlotConfig };
  disc: DiscConfig;

  boss: { def: number; defBonus: number; dazeMult: number; res: 0 | 0.2 | 0.4; weak: boolean };
  field: { atkPct: number; critRate: number; critDmg: number; dmgBonus: number; resShred: number; inCombatAtkFlat: number };
}

export type Action =
  | { type: 'SET_BATTLE_TYPE'; payload: BattleType }
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_AGENT_PRESET'; slot: 'main' | 'sup1' | 'sup2'; preset: string }
  | { type: 'SET_AGENT_CINEMA'; slot: 'main' | 'sup1' | 'sup2'; cinema: number }
  | { type: 'SET_AGENT_FIELD'; slot: 'main' | 'sup1' | 'sup2'; field: string; value: number }
  | { type: 'SET_WEAPON_PRESET'; slot: 'main' | 'sup1' | 'sup2'; preset: string }
  | { type: 'SET_WEAPON_STAR'; slot: 'main' | 'sup1' | 'sup2'; star: number }
  | { type: 'SET_WEAPON_FIELD'; slot: 'main' | 'sup1' | 'sup2'; field: string; value: number }
  | { type: 'SET_DISC_SLOT4'; payload: DiscConfig['slot4Stat'] }
  | { type: 'SET_DISC_SET4'; payload: string }
  | { type: 'SET_DISC_SET2'; payload: string }
  | { type: 'SET_DISC_SUBCOUNT'; key: keyof DiscConfig['subCounts']; value: number }
  | { type: 'SET_BOSS'; field: keyof AppState['boss']; value: any }
  | { type: 'SET_FIELD'; field: keyof AppState['field']; value: number };
