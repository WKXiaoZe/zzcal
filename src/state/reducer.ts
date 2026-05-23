// src/state/reducer.ts
import type { AppState, Action, SlotConfig } from './types';

const emptySlot: SlotConfig = { presetName: '', cinemaOrStar: 0, customOverrides: {} };
const emptyWpSlot: SlotConfig = { ...emptySlot, cinemaOrStar: 1 };

export const initialState: AppState = {
  battleType: 'attack',
  mode: 'manual',
  agents: { main: emptySlot, sup1: emptySlot, sup2: emptySlot },
  weapons: { main: emptyWpSlot, sup1: emptyWpSlot, sup2: emptyWpSlot },
  disc: {
    slot4Stat: 'critRate',
    set4Key: 'none',
    set2Keys: [],
    subCounts: { CR: 0, CD: 0, ATK: 0, HP: 0, AM: 0 },
  },
  boss: { def: 953, defBonus: 0, dazeMult: 1, res: 0, weak: false },
  field: { atkPct: 0, critRate: 0, critDmg: 0, dmgBonus: 0, resShred: 0, inCombatAtkFlat: 0 },
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_BATTLE_TYPE': {
      // Mirror legacy setBattleType (index-legacy.html L642-658): switching
      // into anomaly mode forces slot4 to anomalyMastery; switching out of
      // anomaly (when slot4 was anomalyMastery) restores critRate. All
      // other slot4 choices are preserved.
      const battleType = action.payload;
      let slot4Stat = state.disc.slot4Stat;
      if (battleType === 'anomaly') slot4Stat = 'anomalyMastery';
      else if (slot4Stat === 'anomalyMastery') slot4Stat = 'critRate';
      return { ...state, battleType, disc: { ...state.disc, slot4Stat } };
    }
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_AGENT_PRESET':
      return { ...state, agents: { ...state.agents, [action.slot]: { ...state.agents[action.slot], presetName: action.preset, customOverrides: {} } } };
    case 'SET_AGENT_CINEMA':
      return { ...state, agents: { ...state.agents, [action.slot]: { ...state.agents[action.slot], cinemaOrStar: action.cinema } } };
    case 'SET_AGENT_FIELD':
      return { ...state, agents: { ...state.agents, [action.slot]: { ...state.agents[action.slot], customOverrides: { ...state.agents[action.slot].customOverrides, [action.field]: action.value } } } };
    case 'SET_AGENT_OVERRIDES':
      // Bulk-replace customOverrides — used by async JSON preset loaders so
      // values parsed from <folder>/<name>.json land in one transition.
      return { ...state, agents: { ...state.agents, [action.slot]: { ...state.agents[action.slot], customOverrides: { ...action.overrides } } } };
    // ... weapon 同构
    case 'SET_WEAPON_PRESET':
      return { ...state, weapons: { ...state.weapons, [action.slot]: { ...state.weapons[action.slot], presetName: action.preset, customOverrides: {} } } };
    case 'SET_WEAPON_STAR':
      return { ...state, weapons: { ...state.weapons, [action.slot]: { ...state.weapons[action.slot], cinemaOrStar: action.star } } };
    case 'SET_WEAPON_FIELD':
      return { ...state, weapons: { ...state.weapons, [action.slot]: { ...state.weapons[action.slot], customOverrides: { ...state.weapons[action.slot].customOverrides, [action.field]: action.value } } } };
    case 'SET_WEAPON_OVERRIDES':
      return { ...state, weapons: { ...state.weapons, [action.slot]: { ...state.weapons[action.slot], customOverrides: { ...action.overrides } } } };
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
      return { ...state, disc: { ...state.disc, subCounts: { ...state.disc.subCounts, [action.key]: action.value } } };
    case 'SET_BOSS':
      return { ...state, boss: { ...state.boss, [action.field]: action.value } };
    case 'SET_FIELD':
      return { ...state, field: { ...state.field, [action.field]: action.value } };
    default:
      return state;
  }
}
