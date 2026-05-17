// tests/calc-parity.test.ts
// Re-runs the new TS calculateDamage against each baseline scenario. The
// legacy snapshot used to be compared here as well, but legacy was removed
// in Phase 6; the frozen baseline-snapshot.json (generated from legacy)
// still serves as the regression oracle for src/calc/formulas.
import { describe, it, expect } from 'vitest';
import { calculateDamage as calculateDamageNew } from '../src/calc/formulas';
import baseline from './baseline-snapshot.json' assert { type: 'json' };

interface BaselineEntry {
  name: string;
  input: any;
  output: any;
}

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
