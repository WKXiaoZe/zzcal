// tests/calc-parity.test.ts
// Re-runs both the legacy and the new TS calculateDamage against each baseline
// scenario. During React refactor (Phase 1+), any divergence from this snapshot
// indicates a regression in the calc port.
import { describe, it, expect } from 'vitest';
import { calculateDamage as calculateDamageLegacy } from '../legacy/calc-legacy.js';
import { calculateDamage as calculateDamageNew } from '../src/calc/formulas';
import baseline from './baseline-snapshot.json' assert { type: 'json' };

interface BaselineEntry {
  name: string;
  input: any;
  output: any;
}

describe('calc parity (legacy frozen)', () => {
  for (const entry of baseline as BaselineEntry[]) {
    it(entry.name, () => {
      const out = calculateDamageLegacy({
        battleType: entry.input.battleType,
        agent: entry.input.agent,
        weapon: entry.input.weapon,
        sup: entry.input.sup,
        set4: entry.input.set4,
        field: entry.input.field,
        boss: entry.input.boss,
        skill: entry.input.skill,
        extraStats: entry.input.extraStats,
      });
      expect(out).toEqual(entry.output);
    });
  }
});

describe('calc parity (src/calc/formulas.ts port)', () => {
  for (const entry of baseline as BaselineEntry[]) {
    it(entry.name, () => {
      const out = calculateDamageNew({
        battleType: entry.input.battleType,
        agent: entry.input.agent,
        weapon: entry.input.weapon,
        sup: entry.input.sup,
        set4: entry.input.set4,
        field: entry.input.field,
        boss: entry.input.boss,
        skill: entry.input.skill,
        extraStats: entry.input.extraStats,
      });
      expect(out).toEqual(entry.output);
    });
  }
});
