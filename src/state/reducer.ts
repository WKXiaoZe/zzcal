// src/state/reducer.ts
import type { AppState, Action, SlotConfig, BuffSelectionState, SelectedSkillState } from './types';
import { AGENT_BUFFS } from '../calc/buffs';
import { AGENT_SKILLS, getMaxSkillLevel } from '../calc/agentSkills';
import { evaluateAdditionalAbility, type AgentSlotKey } from '../calc/additionalAbility';
import { resolveBattleTypeForAgent } from '../calc/buildInput';

const emptySlot: SlotConfig = { presetName: '', cinemaOrStar: 0, customOverrides: {} };
const emptyWpSlot: SlotConfig = { ...emptySlot, cinemaOrStar: 1 };

export const initialBuffs: BuffSelectionState = {
  agentBuffs: { main: {}, sup1: {}, sup2: {} },
  weaponBuffEnabled: { main: true, sup1: true, sup2: true },
  mainDisc4BuffEnabled: true,
  teamDiscBuffs: {},
  daSeason: 52,
  bossStageBuffs: {},
  weatherBuffs: {},
};

export const initialSelectedSkill: SelectedSkillState = {
  moveId: '',
  level: 12,
  customMultiplier: 100,
};

function syncCinemaBuffMap(
  presetName: string,
  cinema: number,
  prevMap: Record<string, boolean> = {},
): Record<string, boolean> {
  const nextMap: Record<string, boolean> = { ...prevMap };
  const list = presetName ? AGENT_BUFFS[presetName] ?? [] : [];
  for (const b of list) {
    if (b.cinemaRank) {
      if (b.cinemaRank <= cinema) {
        nextMap[b.id] = true;
      } else {
        delete nextMap[b.id];
      }
    }
  }
  return nextMap;
}

/**
 * Automatically evaluates and toggles each slot's Additional Ability (额外能力)
 * based on the current 3-agent team composition (main / sup1 / sup2).
 */
function syncTeamAdditionalAbilities(
  team: Record<AgentSlotKey, string>,
  currentAgentBuffs: BuffSelectionState['agentBuffs'],
): BuffSelectionState['agentBuffs'] {
  const next: BuffSelectionState['agentBuffs'] = {
    main: { ...currentAgentBuffs.main },
    sup1: { ...currentAgentBuffs.sup1 },
    sup2: { ...currentAgentBuffs.sup2 },
  };
  const slots: AgentSlotKey[] = ['main', 'sup1', 'sup2'];
  for (const s of slots) {
    const agentName = team[s];
    if (!agentName) continue;
    const list = AGENT_BUFFS[agentName] ?? [];
    for (const b of list) {
      if (b.subType === '额外能力') {
        const res = evaluateAdditionalAbility(s, team, b.desc);
        if (res.triggered) {
          next[s][b.id] = true;
        } else {
          delete next[s][b.id];
        }
      }
    }
  }
  return next;
}

export const initialState: AppState = {
  battleType: 'attack',
  mode: 'manual',
  agents: { main: emptySlot, sup1: emptySlot, sup2: emptySlot },
  weapons: { main: emptyWpSlot, sup1: emptyWpSlot, sup2: emptyWpSlot },
  disc: {
    slot4Stat: 'critRate',
    set4Key: 'none',
    set2Keys: [],
    subCounts: {
      CR: 0,
      CD: 0,
      ATK: 0,
      FLAT_ATK: 0,
      HP: 0,
      FLAT_HP: 0,
      AM: 0,
      PEN: 0,
      DEF: 0,
      FLAT_DEF: 0,
    },
  },
  boss: { def: 953, defBonus: 0, dazeMult: 1, res: 0, weak: false },
  field: { atkPct: 0, critRate: 0, critDmg: 0, dmgBonus: 0, resShred: 0, inCombatAtkFlat: 0 },
  buffs: initialBuffs,
  selectedSkill: initialSelectedSkill,
};

function getBuffs(state: AppState): BuffSelectionState {
  return state.buffs ?? initialBuffs;
}

function getSelectedSkill(state: AppState): SelectedSkillState {
  return state.selectedSkill ?? initialSelectedSkill;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_BATTLE_TYPE': {
      const battleType = action.payload;
      let slot4Stat = state.disc.slot4Stat;
      if (battleType === 'anomaly') slot4Stat = 'anomalyMastery';
      else if (slot4Stat === 'anomalyMastery') slot4Stat = 'critRate';
      return { ...state, battleType, disc: { ...state.disc, slot4Stat } };
    }
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_AGENT_PRESET': {
      const buffs = getBuffs(state);
      const curCinema = state.agents[action.slot].cinemaOrStar;
      const nextSlotBuffs = syncCinemaBuffMap(action.preset, curCinema, {});
      const nextAgents = {
        ...state.agents,
        [action.slot]: { ...state.agents[action.slot], presetName: action.preset, customOverrides: {} },
      };
      const nextTeamNames: Record<AgentSlotKey, string> = {
        main: nextAgents.main.presetName,
        sup1: nextAgents.sup1.presetName,
        sup2: nextAgents.sup2.presetName,
      };
      const syncedAgentBuffs = syncTeamAdditionalAbilities(nextTeamNames, {
        ...buffs.agentBuffs,
        [action.slot]: nextSlotBuffs,
      });
      let nextSelectedSkill = getSelectedSkill(state);
      let nextBattleType = state.battleType;
      let nextSlot4Stat = state.disc.slot4Stat;
      if (action.slot === 'main') {
        const moves = action.preset ? AGENT_SKILLS[action.preset] ?? [] : [];
        const firstDmgMove = moves.find((m) => m.lv1Dmg > 0) ?? moves[0];
        nextSelectedSkill = {
          ...nextSelectedSkill,
          moveId: firstDmgMove ? firstDmgMove.id : '',
          level: Math.min(nextSelectedSkill.level || 12, getMaxSkillLevel(curCinema)),
        };
        if (action.preset) {
          nextBattleType = resolveBattleTypeForAgent(action.preset, state.battleType);
          if (nextBattleType === 'anomaly') {
            nextSlot4Stat = 'anomalyMastery';
          } else if (nextSlot4Stat === 'anomalyMastery') {
            nextSlot4Stat = 'critRate';
          }
        }
      }
      return {
        ...state,
        battleType: nextBattleType,
        disc: {
          ...state.disc,
          slot4Stat: nextSlot4Stat,
        },
        agents: nextAgents,
        buffs: {
          ...buffs,
          agentBuffs: syncedAgentBuffs,
        },
        selectedSkill: nextSelectedSkill,
      };
    }
    case 'SET_AGENT_CINEMA': {
      const buffs = getBuffs(state);
      const presetName = state.agents[action.slot].presetName;
      const prevSlotBuffs = buffs.agentBuffs[action.slot] ?? {};
      const nextSlotBuffs = syncCinemaBuffMap(presetName, action.cinema, prevSlotBuffs);
      let nextSelectedSkill = getSelectedSkill(state);
      if (action.slot === 'main') {
        const maxLv = getMaxSkillLevel(action.cinema);
        if (nextSelectedSkill.level > maxLv) {
          nextSelectedSkill = { ...nextSelectedSkill, level: maxLv };
        }
      }
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.slot]: { ...state.agents[action.slot], cinemaOrStar: action.cinema },
        },
        buffs: {
          ...buffs,
          agentBuffs: {
            ...buffs.agentBuffs,
            [action.slot]: nextSlotBuffs,
          },
        },
        selectedSkill: nextSelectedSkill,
      };
    }
    case 'SET_AGENT_FIELD':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.slot]: {
            ...state.agents[action.slot],
            customOverrides: { ...state.agents[action.slot].customOverrides, [action.field]: action.value },
          },
        },
      };
    case 'SET_AGENT_OVERRIDES':
      return {
        ...state,
        agents: {
          ...state.agents,
          [action.slot]: { ...state.agents[action.slot], customOverrides: { ...action.overrides } },
        },
      };
    case 'SET_WEAPON_PRESET':
      return {
        ...state,
        weapons: {
          ...state.weapons,
          [action.slot]: { ...state.weapons[action.slot], presetName: action.preset, customOverrides: {} },
        },
      };
    case 'SET_WEAPON_STAR':
      return {
        ...state,
        weapons: {
          ...state.weapons,
          [action.slot]: { ...state.weapons[action.slot], cinemaOrStar: action.star },
        },
      };
    case 'SET_WEAPON_FIELD':
      return {
        ...state,
        weapons: {
          ...state.weapons,
          [action.slot]: {
            ...state.weapons[action.slot],
            customOverrides: { ...state.weapons[action.slot].customOverrides, [action.field]: action.value },
          },
        },
      };
    case 'SET_WEAPON_OVERRIDES':
      return {
        ...state,
        weapons: {
          ...state.weapons,
          [action.slot]: { ...state.weapons[action.slot], customOverrides: { ...action.overrides } },
        },
      };
    case 'SET_DISC_SLOT4':
      return { ...state, disc: { ...state.disc, slot4Stat: action.payload } };
    case 'SET_DISC_SET4':
      return { ...state, disc: { ...state.disc, set4Key: action.payload } };
    case 'SET_DISC_SET2': {
      const key = action.payload;
      const set2Keys = !key || key === 'none' ? [] : [key];
      return { ...state, disc: { ...state.disc, set2Keys } };
    }
    case 'SET_DISC_SET2_KEYS':
      return { ...state, disc: { ...state.disc, set2Keys: action.payload } };
    case 'SET_DISC_SETS':
      return { ...state, disc: { ...state.disc, set4Key: action.set4Key, set2Keys: action.set2Keys } };
    case 'SET_DISC_SUBCOUNT':
      return {
        ...state,
        disc: { ...state.disc, subCounts: { ...state.disc.subCounts, [action.key]: action.value } },
      };
    case 'SET_DISC_SUBCOUNTS_ALL':
      return {
        ...state,
        disc: { ...state.disc, subCounts: { ...state.disc.subCounts, ...action.payload } },
      };
    case 'SET_BOSS':
      return { ...state, boss: { ...state.boss, [action.field]: action.value } };
    case 'SET_FIELD':
      return { ...state, field: { ...state.field, [action.field]: action.value } };
    case 'TOGGLE_AGENT_BUFF': {
      const buffs = getBuffs(state);
      const curSlotMap = buffs.agentBuffs[action.slot] || {};
      const nextVal = action.enabled !== undefined ? action.enabled : !curSlotMap[action.buffId];
      return {
        ...state,
        buffs: {
          ...buffs,
          agentBuffs: {
            ...buffs.agentBuffs,
            [action.slot]: {
              ...curSlotMap,
              [action.buffId]: nextVal,
            },
          },
        },
      };
    }
    case 'SET_ALL_AGENT_BUFFS': {
      const buffs = getBuffs(state);
      return {
        ...state,
        buffs: {
          ...buffs,
          agentBuffs: {
            ...buffs.agentBuffs,
            [action.slot]: { ...action.buffMap },
          },
        },
      };
    }
    case 'TOGGLE_WEAPON_BUFF': {
      const buffs = getBuffs(state);
      const cur = buffs.weaponBuffEnabled[action.slot];
      const nextVal = action.enabled !== undefined ? action.enabled : !cur;
      return {
        ...state,
        buffs: {
          ...buffs,
          weaponBuffEnabled: {
            ...buffs.weaponBuffEnabled,
            [action.slot]: nextVal,
          },
        },
      };
    }
    case 'TOGGLE_MAIN_DISC4_BUFF': {
      const buffs = getBuffs(state);
      const nextVal = action.enabled !== undefined ? action.enabled : !buffs.mainDisc4BuffEnabled;
      return {
        ...state,
        buffs: {
          ...buffs,
          mainDisc4BuffEnabled: nextVal,
        },
      };
    }
    case 'TOGGLE_TEAM_DISC_BUFF': {
      const buffs = getBuffs(state);
      const cur = !!buffs.teamDiscBuffs[action.setKey];
      const nextVal = action.enabled !== undefined ? action.enabled : !cur;
      return {
        ...state,
        buffs: {
          ...buffs,
          teamDiscBuffs: {
            ...buffs.teamDiscBuffs,
            [action.setKey]: nextVal,
          },
        },
      };
    }
    case 'SET_DA_SEASON': {
      const buffs = getBuffs(state);
      return {
        ...state,
        buffs: {
          ...buffs,
          daSeason: action.season,
          bossStageBuffs: {},
          weatherBuffs: {},
        },
      };
    }
    case 'TOGGLE_BOSS_STAGE_BUFF': {
      const buffs = getBuffs(state);
      const cur = !!buffs.bossStageBuffs[action.buffId];
      const nextVal = action.enabled !== undefined ? action.enabled : !cur;
      return {
        ...state,
        buffs: {
          ...buffs,
          bossStageBuffs: nextVal ? { [action.buffId]: true } : { ...buffs.bossStageBuffs, [action.buffId]: false },
        },
      };
    }
    case 'TOGGLE_WEATHER_BUFF': {
      const buffs = getBuffs(state);
      const cur = !!buffs.weatherBuffs[action.buffId];
      const nextVal = action.enabled !== undefined ? action.enabled : !cur;
      return {
        ...state,
        buffs: {
          ...buffs,
          weatherBuffs: nextVal ? { [action.buffId]: true } : { ...buffs.weatherBuffs, [action.buffId]: false },
        },
      };
    }
    case 'SET_SKILL_MOVE': {
      const sel = getSelectedSkill(state);
      return {
        ...state,
        selectedSkill: {
          ...sel,
          moveId: action.moveId,
        },
      };
    }
    case 'SET_SKILL_LEVEL': {
      const sel = getSelectedSkill(state);
      const maxLv = getMaxSkillLevel(state.agents.main.cinemaOrStar);
      const clamped = Math.max(1, Math.min(maxLv, Math.floor(action.level || 12)));
      return {
        ...state,
        selectedSkill: {
          ...sel,
          level: clamped,
        },
      };
    }
    case 'SET_CUSTOM_SKILL_MULTIPLIER': {
      const sel = getSelectedSkill(state);
      return {
        ...state,
        selectedSkill: {
          ...sel,
          moveId: '',
          customMultiplier: action.multiplier > 0 ? action.multiplier : 100,
        },
      };
    }
    default:
      return state;
  }
}
