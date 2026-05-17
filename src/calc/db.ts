// src/calc/db.ts
// Read-only facade over the game databases.
//
// `characters.js` and `weapons.js` live at the repo root as legacy script-tag
// modules (`const CHARACTER_DB = { ... };` with no exports). To stay
// non-invasive (Phase 6 will fully migrate them), we load the file source as
// text via Vite's `?raw` import and evaluate it once in module scope.
//
// DISC_4_SETS / DISC_2_SETS have been migrated out of legacy/index-legacy.html
// into ./discSets.ts. They are re-exported below to preserve the existing
// import surface for downstream callers.

// @ts-expect-error vite raw import virtual extension
import charactersSource from '../../characters.js?raw';
// @ts-expect-error vite raw import virtual extension
import weaponsSource from '../../weapons.js?raw';

function evalDb<T>(source: string, name: string): T {
  // Append an explicit return so we can capture the const without modifying
  // the original file. The `new Function` is run with no closure access.
  const factory = new Function(`${source}\n;return ${name};`);
  return factory() as T;
}

// --- Types ----------------------------------------------------------------

/** Generic stat shape — arrays are [Base, C1, C2, C4, C6] for agents,
 *  or [S1..S5] for weapons. Numbers are used for fixed values. */
type DbStatValue = number | number[];

export interface CharacterEntry {
  meta?: {
    element?: string;
    type?: string;
    faction?: string;
    teamPassive?: string;
  };
  baseAtk?: DbStatValue;
  baseHp?: DbStatValue;
  critRate?: DbStatValue;
  critDmg?: DbStatValue;
  dmgBonus?: DbStatValue;
  penRatio?: DbStatValue;
  penValue?: DbStatValue;
  defShred?: DbStatValue;
  dazeVuln?: DbStatValue;
  resShred?: DbStatValue;
  inCombatAtkPct?: DbStatValue;
  inCombatAtkFlat?: DbStatValue;
  hpPct?: DbStatValue;
  flatHp?: DbStatValue;
  inCombatHpPct?: DbStatValue;
  inCombatPen?: DbStatValue;
  ppDmgBonus?: DbStatValue;
  anomalyMastery?: DbStatValue;
  [k: string]: unknown;
}

export interface CharacterDatabase {
  characters: Record<string, CharacterEntry>;
  /** 辅助 BUFF 预设 (sup). Same shape as `characters`. */
  sup?: Record<string, CharacterEntry>;
}

export interface WeaponEntry {
  meta?: { type?: string; rarity?: string };
  baseAtk?: DbStatValue;
  baseHp?: DbStatValue;
  atkPct?: DbStatValue;
  hpPct?: DbStatValue;
  critRate?: DbStatValue;
  critDmg?: DbStatValue;
  dmgBonus?: DbStatValue;
  penRatio?: DbStatValue;
  penValue?: DbStatValue;
  defShred?: DbStatValue;
  resShred?: DbStatValue;
  anomalyMastery?: DbStatValue;
  ppDmgBonus?: DbStatValue;
  inCombatAtkPct?: DbStatValue;
  inCombatAtkFlat?: DbStatValue;
  inCombatHpPct?: DbStatValue;
  inCombatPen?: DbStatValue;
  flatHp?: DbStatValue;
  [k: string]: unknown;
}

export type WeaponDatabase = Record<string, WeaponEntry>;

// --- Loaded databases ----------------------------------------------------

export const CHARACTER_DB: CharacterDatabase = evalDb<CharacterDatabase>(
  charactersSource as string,
  'CHARACTER_DB',
);

export const WEAPON_DB: WeaponDatabase = evalDb<WeaponDatabase>(
  weaponsSource as string,
  'WEAPON_DB',
);

// --- Disc set re-exports (migrated to ./discSets.ts in Phase 4 prep) ---

export { DISC_4_SETS, DISC_2_SETS } from './discSets';
export type { DiscSet } from './discSets';

// --- Convenience lookups -------------------------------------------------

export function getCharacter(name: string): CharacterEntry | undefined {
  return CHARACTER_DB.characters[name];
}

export function getWeapon(name: string): WeaponEntry | undefined {
  return WEAPON_DB[name];
}
