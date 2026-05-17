// src/calc/utils.ts
// Pure utility helpers ported from legacy/calc-legacy.js.
// All behaviour must match the legacy versions exactly.

/**
 * Coerce a value to a finite float. Empty / nullish / NaN inputs become 0.
 *
 * Examples:
 *   safeFloat(undefined) -> 0
 *   safeFloat('')        -> 0
 *   safeFloat('12.5')    -> 12.5
 *   safeFloat(NaN)       -> 0
 */
export function safeFloat(val: unknown): number {
  if (val === undefined || val === null || val === '') return 0;
  const parsed = parseFloat(val as string);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse an agent stat value at a given cinematic level (0-6).
 *
 * Accepts:
 *   - a plain number
 *   - an array `[Base, C1, C2, C4, C6]` of accumulated bonuses
 *   - a legacy slash-separated string `"Base/C1/C2/C4/C6"`
 *
 * The cinematic ranks add cumulatively at S1, S2, S4, S6 (note: S3/S5 do not
 * contribute new stat values in the legacy data model).
 */
export function parseAgentValue(val: unknown, cinemaLevel: number): number {
  if (typeof val === 'number') return val;

  let parts: number[];
  if (Array.isArray(val)) {
    parts = val as number[];
  } else if (typeof val === 'string') {
    if (!val.includes('/')) return parseFloat(val) || 0;
    parts = val.split('/').map((s) => parseFloat(s) || 0);
  } else {
    return 0;
  }

  let sum = parts[0] || 0; // Base
  if (cinemaLevel >= 1 && parts.length > 1) sum += parts[1];
  if (cinemaLevel >= 2 && parts.length > 2) sum += parts[2];
  if (cinemaLevel >= 4 && parts.length > 3) sum += parts[3];
  if (cinemaLevel >= 6 && parts.length > 4) sum += parts[4];

  return sum;
}

/**
 * Parse a weapon stat value at a given star/refinement level (1-5).
 *
 * Accepts:
 *   - a plain number
 *   - an array `[S1, S2, S3, S4, S5]`
 *   - a legacy slash-separated string `"S1/S2/S3/S4/S5"`
 *
 * The starLevel is clamped to the available range, so requesting S5 on a
 * shorter array returns the last element rather than throwing.
 */
export function parseWeaponValue(valStr: unknown, starLevel: number): number {
  if (typeof valStr === 'number') return valStr;

  let parts: number[];
  if (Array.isArray(valStr)) {
    parts = valStr as number[];
  } else if (typeof valStr === 'string') {
    if (!valStr.includes('/')) return parseFloat(valStr) || 0;
    parts = valStr.split('/').map((s) => parseFloat(s) || 0);
  } else {
    return 0;
  }

  const idx = Math.max(0, Math.min(parts.length - 1, starLevel - 1));
  return parts[idx];
}
