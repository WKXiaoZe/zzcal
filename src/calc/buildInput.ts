// src/calc/buildInput.ts
// Pure transform: AppState → CalcInput.
//
// This helper is the React equivalent of the legacy DOM-read functions in
// legacy/index-legacy.html:
//
//   getAgentData(prefix)   line ~1172  →  per-slot agent merge (preset + 4-set + overrides)
//   getWeaponData(prefix)  line ~1213  →  per-slot weapon merge
//   getSet4Stats(prefix)   line ~1200  →  raw 4-set stats for breakdown re-attribution
//   getFieldBuffs()        line ~1219  →  team-wide field buffs
//
// Plus two Phase-4 additions that legacy never modelled:
//   • subCounts → extraStats (CR×2.4, CD×4.8, ATK×3.0, HP×3.0, AM×9.0 —
//     coefficients ported verbatim from legacy/index-legacy.html line ~1882-1886)
//   • set2 (DISC 2-piece bonus) → folded into extraStats via the existing
//     set2_* buckets that the optimizer already understood. Stat-key mapping:
//       atkPct        → set2_AtkPct
//       hpPct         → set2_HpPct
//       dmgBonus      → set2_Dmg
//       penRatio      → set2_Pen
//       critDmg       → set2_CD
//       critRate / anomalyMastery → folded into extraStats.critRate /
//         extraStats.anomalyMastery (no dedicated set2_* bucket exists, but the
//         formula sums these into the same totals anyway).

import type { CalcInput, AgentStats, WeaponStats, ExtraSubStats, Slot4Type } from './types';
import type { AppState, SlotConfig } from '../state/types';
import { CHARACTER_DB, WEAPON_DB, DISC_4_SETS, DISC_2_SETS } from './db';
import { parseAgentValue, parseWeaponValue, safeFloat } from './utils';

// --- Field whitelists (mirror legacy agentFields / weaponFields) ----------

const AGENT_FIELDS: readonly (keyof AgentStats)[] = [
  'baseAtk',
  'critRate',
  'critDmg',
  'dmgBonus',
  'penRatio',
  'penValue',
  'defShred',
  'dazeVuln',
  'resShred',
  'inCombatAtkPct',
  'inCombatAtkFlat',
  'baseHp',
  'hpPct',
  'flatHp',
  'inCombatHpPct',
  'inCombatPen',
  'ppDmgBonus',
  'anomalyMastery',
];

const WEAPON_FIELDS: readonly (keyof WeaponStats)[] = [
  'baseAtk',
  'critRate',
  'critDmg',
  'atkPct',
  'penRatio',
  'defShred',
  'resShred',
  'dmgBonus',
  'inCombatAtkPct',
  'inCombatAtkFlat',
  'baseHp',
  'hpPct',
  'flatHp',
  'inCombatHpPct',
  'inCombatPen',
  'ppDmgBonus',
  'anomalyMastery',
];

// Subcount ladder coefficients (single subroll value, max-rolled).
// Ported verbatim from legacy/index-legacy.html line ~1882-1886.
const SUBCOUNT_COEFF = {
  CR: 2.4,
  CD: 4.8,
  ATK: 3.0,
  HP: 3.0,
  AM: 9.0,
} as const;

// --- Helpers --------------------------------------------------------------

function lookupCharacter(name: string): Record<string, unknown> | undefined {
  if (!name) return undefined;
  // Try DPS catalogue first (CHARACTER_DB.characters), then sup (CHARACTER_DB.sup).
  const dps = CHARACTER_DB.characters[name] as Record<string, unknown> | undefined;
  if (dps) return dps;
  const sup = (CHARACTER_DB.sup ?? {})[name] as Record<string, unknown> | undefined;
  return sup;
}

function lookupWeapon(name: string): Record<string, unknown> | undefined {
  if (!name) return undefined;
  return WEAPON_DB[name] as Record<string, unknown> | undefined;
}

/**
 * Resolve one agent slot to a flat `AgentStats` object. Mirrors
 * legacy `getAgentData(prefix)`:
 *   1. start from every AGENT_FIELDS key = 0
 *   2. fill from preset (parsed at the current cinema level)
 *   3. overlay customOverrides (override wins)
 *
 * 4-set bonuses are applied separately by `applySet4ToAgent` (only for the
 * main slot, matching legacy behaviour).
 */
function buildAgent(slot: SlotConfig): AgentStats {
  const out: AgentStats = {};
  for (const f of AGENT_FIELDS) out[f] = 0;

  const preset = lookupCharacter(slot.presetName);
  if (preset) {
    for (const f of AGENT_FIELDS) {
      const raw = preset[f as string];
      if (raw !== undefined) {
        out[f] = parseAgentValue(raw, slot.cinemaOrStar);
      }
    }
  }

  // customOverrides accept any string key but only known fields end up on the
  // typed output. We additionally let unknown keys pass through as raw numbers
  // so a future UI can override one-off knobs without a type change.
  for (const [k, v] of Object.entries(slot.customOverrides)) {
    (out as Record<string, number>)[k] = safeFloat(v);
  }

  return out;
}

/** Same as buildAgent but for a weapon slot. */
function buildWeapon(slot: SlotConfig): WeaponStats {
  const out: WeaponStats = {};
  for (const f of WEAPON_FIELDS) out[f] = 0;

  const preset = lookupWeapon(slot.presetName);
  if (preset) {
    // weapon.cinemaOrStar is 1-based (S1..S5)
    const star = slot.cinemaOrStar > 0 ? slot.cinemaOrStar : 1;
    for (const f of WEAPON_FIELDS) {
      const raw = preset[f as string];
      if (raw !== undefined) {
        out[f] = parseWeaponValue(raw, star);
      }
    }
  }

  for (const [k, v] of Object.entries(slot.customOverrides)) {
    (out as Record<string, number>)[k] = safeFloat(v);
  }

  return out;
}

/**
 * Fold the 4-piece bonus into the agent stats, mirroring legacy line 1182-1196.
 * Returns the (mutated) agent object as a convenience.
 */
function applySet4ToAgent(agent: AgentStats, set4Stats: Record<string, number>): AgentStats {
  const target = agent as Record<string, number | undefined>;
  for (const [sKey, sVal] of Object.entries(set4Stats)) {
    if (target[sKey] !== undefined) {
      target[sKey] = (target[sKey] ?? 0) + sVal;
    } else if (sKey === 'atkPct') {
      // legacy intentionally allows atkPct even though agentFields doesn't list it
      target.atkPct = (target.atkPct ?? 0) + sVal;
    } else {
      // Unknown / non-mapped stat (e.g. anomalyMastery from older sets) — still
      // additively fold it so the calc layer sees it.
      target[sKey] = (target[sKey] ?? 0) + sVal;
    }
  }
  return agent;
}

/**
 * Map a DISC 2-set stats payload into the `extraStats.set2_*` buckets that
 * `calculateDamage` already understands.
 */
function set2ToExtra(set2Stats: Record<string, number>): Partial<ExtraSubStats> {
  const out: Partial<ExtraSubStats> = {};
  for (const [k, v] of Object.entries(set2Stats)) {
    switch (k) {
      case 'atkPct':         out.set2_AtkPct = (out.set2_AtkPct ?? 0) + v; break;
      case 'hpPct':          out.set2_HpPct  = (out.set2_HpPct  ?? 0) + v; break;
      case 'dmgBonus':       out.set2_Dmg    = (out.set2_Dmg    ?? 0) + v; break;
      case 'penRatio':       out.set2_Pen    = (out.set2_Pen    ?? 0) + v; break;
      case 'critDmg':        out.set2_CD     = (out.set2_CD     ?? 0) + v; break;
      // No dedicated set2_* slot for these — fold into the matching extraStats
      // counter so calculateDamage still sees the total.
      case 'critRate':       out.critRate        = (out.critRate        ?? 0) + v; break;
      case 'anomalyMastery': out.anomalyMastery  = (out.anomalyMastery  ?? 0) + v; break;
      default:
        // ignore unmapped keys (e.g. anomalyCtrl placeholder)
        break;
    }
  }
  return out;
}

// --- Public API -----------------------------------------------------------

/**
 * Pure transform from React app state into the legacy-parity `CalcInput`
 * accepted by `calculateDamage`. Safe to call on every render — all DB
 * lookups are O(1) and no caching is required.
 */
export function buildCalcInput(state: AppState): CalcInput {
  // Main + sup agents
  const aMain = buildAgent(state.agents.main);
  const aSup1 = buildAgent(state.agents.sup1);
  const aSup2 = buildAgent(state.agents.sup2);

  // Main + sup weapons
  const wMain = buildWeapon(state.weapons.main);
  const wSup1 = buildWeapon(state.weapons.sup1);
  const wSup2 = buildWeapon(state.weapons.sup2);

  // DISC sets
  const set4Stats = DISC_4_SETS[state.disc.set4Key]?.stats ?? {};
  const set2Stats = DISC_2_SETS[state.disc.set2Key]?.stats ?? {};

  // Fold 4-set into the main agent (legacy parity: only main agent).
  applySet4ToAgent(aMain, set4Stats);

  // Subcounts → extraStats (CR×2.4, CD×4.8, ATK×3.0, HP×3.0, AM×9.0)
  const sc = state.disc.subCounts;
  const set2Extra = set2ToExtra(set2Stats);
  const extraStats: ExtraSubStats = {
    critRate:       safeFloat(sc.CR)  * SUBCOUNT_COEFF.CR  + safeFloat(set2Extra.critRate),
    critDmg:        safeFloat(sc.CD)  * SUBCOUNT_COEFF.CD,
    atkPct:         safeFloat(sc.ATK) * SUBCOUNT_COEFF.ATK,
    hpPct:          safeFloat(sc.HP)  * SUBCOUNT_COEFF.HP,
    anomalyMastery: safeFloat(sc.AM)  * SUBCOUNT_COEFF.AM + safeFloat(set2Extra.anomalyMastery),
    set2_AtkPct:    set2Extra.set2_AtkPct,
    set2_HpPct:     set2Extra.set2_HpPct,
    set2_Dmg:       set2Extra.set2_Dmg,
    set2_Pen:       set2Extra.set2_Pen,
    set2_CD:        set2Extra.set2_CD,
  };

  // Skill context: legacy reads these from DOM each call. With no Skill UI
  // wired yet (Phase 4 will add it), default to legacy defaults so the calc
  // still runs end-to-end. `slot4Type` translates the state's stat-key naming
  // (`atkPct`) into the legacy calc-layer enum (`atk`).
  const slot4Type: Slot4Type =
    state.disc.slot4Stat === 'atkPct' ? 'atk' : state.disc.slot4Stat;
  const skill = {
    multiplier: 100,
    slot4Type,
    slot6AnomalyType: '' as const,
    smallAtkCount: 0,
    smallPenCount: 0,
  };

  // Field buffs: state.field uses a future-leaning schema. Map only what
  // FieldBuffs accepts; atkPct → inCombatAtkPct (matches the legacy
  // `field_inCombatAtkPct` input label "局内攻击%"). `inCombatAtkFlat` is
  // not part of FieldBuffs in the calc layer, so it's intentionally dropped
  // here (Phase 4 will revisit once the UI surfaces it on the main agent).
  const field = {
    inCombatAtkPct: safeFloat(state.field.atkPct),
    critRate:       safeFloat(state.field.critRate),
    critDmg:        safeFloat(state.field.critDmg),
    dmgBonus:       safeFloat(state.field.dmgBonus),
    resShred:       safeFloat(state.field.resShred),
  };

  // Boss: state.boss uses `def` / `defBonus` / `dazeMult` / `res` / `weak`.
  // Map directly to BossState; legacy `dazeBase` is sourced from a separate
  // DOM input. With no UI yet, default to 100 (legacy default).
  const boss = {
    defBase:  safeFloat(state.boss.def),
    defBonus: safeFloat(state.boss.defBonus),
    dazeBase: 100,
    res:      safeFloat(state.boss.res),
    weak:     !!state.boss.weak,
  };

  return {
    battleType: state.battleType,
    agent:  aMain,
    weapon: wMain,
    sup: { a1: aSup1, a2: aSup2, w1: wSup1, w2: wSup2 },
    set4:   set4Stats,
    field,
    boss,
    skill,
    extraStats,
  };
}
