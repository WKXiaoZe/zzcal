// src/state/types.ts
import type { BattleType } from '../calc/types';

export type AppMode = 'manual' | 'auto';

export interface SlotConfig {
  presetName: string;       // 角色名或音擎名，'' 表示未选
  cinemaOrStar: number;     // agent: cinema 0-6; weapon: star 1-5
  customOverrides: Record<string, number>;  // input 框被改过的字段
}

export interface DiscConfig {
  slot4Stat: 'critRate' | 'critDmg' | 'atkPct' | 'anomalyMastery' | 'defPct';
  set4Key: string;
  /**
   * Extra 2-piece bonuses on top of whatever set4Key already implies. Empty
   * array = no extra 2-set. buildCalcInput auto-folds set4Key's own 2-piece
   * (when set4Key !== 'none'), so callers MUST NOT include set4Key in this
   * list — buildCalcInput dedupes against set4Key as a safety net.
   */
  set2Keys: string[];
  // 副词条计数
  subCounts: {
    CR: number;
    CD: number;
    ATK: number;
    FLAT_ATK?: number;
    HP: number;
    FLAT_HP?: number;
    AM: number;
    PEN?: number;
    DEF?: number;
    FLAT_DEF?: number;
  };
}

export interface BuffSelectionState {
  /** 每个角色槽位勾选启用的角色主动/被动/影画 Buff ID */
  agentBuffs: {
    main: Record<string, boolean>;
    sup1: Record<string, boolean>;
    sup2: Record<string, boolean>;
  };
  /** 每个音擎槽位是否启用音擎被动特效 Buff */
  weaponBuffEnabled: {
    main: boolean;
    sup1: boolean;
    sup2: boolean;
  };
  /** 主C穿戴的 4件套驱动盘 条件增益是否启用（默认 true） */
  mainDisc4BuffEnabled: boolean;
  /** 额外勾选的驱动盘 4件套 Buff（如队友穿戴的月光骑士颂、静听嘉音、山大王等） */
  teamDiscBuffs: Record<string, boolean>;
  /** 当前选中的危局强袭战期次 (1..53，默认 52) */
  daSeason?: number;
  /** 勾选的危局 Boss 场地 Buff ID */
  bossStageBuffs: Record<string, boolean>;
  /** 勾选的危局期次 天气 Buff ID */
  weatherBuffs: Record<string, boolean>;
}

export interface SelectedSkillState {
  /** Selected skill move ID from AGENT_SKILLS[mainAgent] ('' = manual/default 100% multiplier) */
  moveId: string;
  /** Skill level (1..16, default 12; C3 unlocks 14, C5 unlocks 16) */
  level: number;
  /** Optional custom damage multiplier (%) when moveId is '' */
  customMultiplier: number;
}

export interface AppState {
  battleType: BattleType;
  mode: AppMode;

  agents: { main: SlotConfig; sup1: SlotConfig; sup2: SlotConfig };
  weapons: { main: SlotConfig; sup1: SlotConfig; sup2: SlotConfig };
  disc: DiscConfig;

  boss: { def: number; defBonus: number; dazeMult: number; res: 0 | 0.2 | 0.4; weak: boolean };
  field: { atkPct: number; critRate: number; critDmg: number; dmgBonus: number; resShred: number; inCombatAtkFlat: number };
  buffs?: BuffSelectionState;
  selectedSkill?: SelectedSkillState;
}

export type Action =
  | { type: 'SET_BATTLE_TYPE'; payload: BattleType }
  | { type: 'SET_MODE'; payload: AppMode }
  | { type: 'SET_AGENT_PRESET'; slot: 'main' | 'sup1' | 'sup2'; preset: string }
  | { type: 'SET_AGENT_CINEMA'; slot: 'main' | 'sup1' | 'sup2'; cinema: number }
  | { type: 'SET_AGENT_FIELD'; slot: 'main' | 'sup1' | 'sup2'; field: string; value: number }
  | { type: 'SET_AGENT_OVERRIDES'; slot: 'main' | 'sup1' | 'sup2'; overrides: Record<string, number> }
  | { type: 'SET_WEAPON_PRESET'; slot: 'main' | 'sup1' | 'sup2'; preset: string }
  | { type: 'SET_WEAPON_STAR'; slot: 'main' | 'sup1' | 'sup2'; star: number }
  | { type: 'SET_WEAPON_FIELD'; slot: 'main' | 'sup1' | 'sup2'; field: string; value: number }
  | { type: 'SET_WEAPON_OVERRIDES'; slot: 'main' | 'sup1' | 'sup2'; overrides: Record<string, number> }
  | { type: 'SET_DISC_SLOT4'; payload: DiscConfig['slot4Stat'] }
  | { type: 'SET_DISC_SET4'; payload: string }
  | { type: 'SET_DISC_SET2'; payload: string }
  | { type: 'SET_DISC_SET2_KEYS'; payload: string[] }
  | { type: 'SET_DISC_SETS'; set4Key: string; set2Keys: string[] }
  | { type: 'SET_DISC_SUBCOUNT'; key: keyof DiscConfig['subCounts']; value: number }
  | { type: 'SET_DISC_SUBCOUNTS_ALL'; payload: DiscConfig['subCounts'] }
  | { type: 'SET_BOSS'; field: keyof AppState['boss']; value: any }
  | { type: 'SET_FIELD'; field: keyof AppState['field']; value: number }
  | { type: 'TOGGLE_AGENT_BUFF'; slot: 'main' | 'sup1' | 'sup2'; buffId: string; enabled?: boolean }
  | { type: 'SET_ALL_AGENT_BUFFS'; slot: 'main' | 'sup1' | 'sup2'; buffMap: Record<string, boolean> }
  | { type: 'TOGGLE_WEAPON_BUFF'; slot: 'main' | 'sup1' | 'sup2'; enabled?: boolean }
  | { type: 'TOGGLE_MAIN_DISC4_BUFF'; enabled?: boolean }
  | { type: 'TOGGLE_TEAM_DISC_BUFF'; setKey: string; enabled?: boolean }
  | { type: 'SET_DA_SEASON'; season: number }
  | { type: 'TOGGLE_BOSS_STAGE_BUFF'; buffId: string; enabled?: boolean }
  | { type: 'TOGGLE_WEATHER_BUFF'; buffId: string; enabled?: boolean }
  | { type: 'SET_SKILL_MOVE'; moveId: string }
  | { type: 'SET_SKILL_LEVEL'; level: number }
  | { type: 'SET_CUSTOM_SKILL_MULTIPLIER'; multiplier: number };
