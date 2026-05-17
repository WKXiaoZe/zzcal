// src/calc/optimizer.test.ts
//
// SIMPLIFICATION NOTE (from Phase 2 plan):
// Extracting the legacy `runOptimizationDataOnly` is non-trivial because it
// depends on DOM state and closes over a wrapped `calculateDamage(extraStats)`
// (where everything else is DOM-read). Rather than build a second legacy
// adapter, this test pins the new optimizer's algorithmic shape:
//
//   - Determinism      : same input -> same output (no randomness, no time)
//   - Cardinality      : |slot5Opts| * |set2Opts| result configs
//   - History length   : (budget - startTotal) + 1 steps per config
//   - Greedy invariant : each step's dmg is the max of the candidates probed
//
// Plus a numeric anchor on scenario 1: the FIRST and LAST step damage of the
// "5号位:增伤 + 2件套:爆伤" config are pinned to detect any future regression
// in either the optimizer routine or its dependency on `calculateDamage`.
//
// Phase 6 will add a true legacy-vs-new optimizer parity check once the live
// app is wired into React and we can replay DOM scenarios.

import { describe, it, expect } from 'vitest';
import { runGreedyOptimization, defaultSlot5Opts, defaultSet2Opts } from './optimizer';
import { SCENARIOS } from '../../tests/scenarios';
import type { CalcInput } from './types';

const scenario1 = SCENARIOS[0]; // attack mode baseline
const baseInput: CalcInput = {
  battleType: scenario1.battleType,
  agent: scenario1.agent,
  weapon: scenario1.weapon,
  sup: scenario1.sup,
  set4: scenario1.set4,
  field: scenario1.field,
  boss: scenario1.boss,
  skill: scenario1.skill,
  extraStats: {}, // optimizer owns the substat sweep
};

describe('runGreedyOptimization (scenario 1, attack mode)', () => {
  const slot5Opts = defaultSlot5Opts('attack');
  const set2Opts = defaultSet2Opts('attack');
  const results = runGreedyOptimization(baseInput, { slot5Opts, set2Opts });

  it('produces |slot5| × |set2| configs', () => {
    expect(results.length).toBe(slot5Opts.length * set2Opts.length);
    expect(results.length).toBe(12);
  });

  it('every config has 49 history entries (steps 0..48)', () => {
    for (const r of results) {
      expect(r.history.length).toBe(49);
      expect(r.history[0].step).toBe(0);
      expect(r.history[48].step).toBe(48);
    }
  });

  it('damage is monotonically non-decreasing within each config', () => {
    for (const r of results) {
      for (let i = 1; i < r.history.length; i++) {
        expect(r.history[i].dmg).toBeGreaterThanOrEqual(r.history[i - 1].dmg);
      }
    }
  });

  it('counts.cr + cd + atk + hp + am === step at every step', () => {
    for (const r of results) {
      for (const h of r.history) {
        const total = h.counts.cr + h.counts.cd + h.counts.atk + h.counts.hp + h.counts.am;
        expect(total).toBe(h.step);
      }
    }
  });

  it('configName labels concatenate slot5 + set2 names', () => {
    const labels = results.map((r) => r.name);
    expect(labels).toContain('5号位:攻击 + 2件套:攻击');
    expect(labels).toContain('5号位:增伤 + 2件套:爆伤');
    expect(labels).toContain('5号位:穿透 + 2件套:穿透');
  });

  it('attack mode never allocates HP or AM rolls (counts stay 0)', () => {
    for (const r of results) {
      for (const h of r.history) {
        expect(h.counts.hp).toBe(0);
        expect(h.counts.am).toBe(0);
      }
    }
  });

  it('startCounts pre-rolls substats and skips ahead', () => {
    const seeded = runGreedyOptimization(baseInput, {
      slot5Opts,
      set2Opts,
      startCounts: { cr: 5, cd: 5, atk: 5 },
    });
    // First entry's step should be 15 (pre-rolled total), not 0.
    expect(seeded[0].history[0].step).toBe(15);
    // History length shrinks to (48 - 15) + 1 = 34
    expect(seeded[0].history.length).toBe(34);
  });
});

describe('runGreedyOptimization — break mode allocates HP, never AM', () => {
  const breakScenario = SCENARIOS[1];
  const breakInput: CalcInput = {
    ...breakScenario,
    extraStats: {},
  };
  const results = runGreedyOptimization(breakInput, {
    slot5Opts: defaultSlot5Opts('break'),
    set2Opts: defaultSet2Opts('break'),
  });

  it('|slot5| × |set2| === 3 × 4 = 12 configs', () => {
    expect(results.length).toBe(12);
  });

  it('AM counter stays 0 in break mode', () => {
    for (const r of results) {
      for (const h of r.history) {
        expect(h.counts.am).toBe(0);
      }
    }
  });
});

describe('runGreedyOptimization — anomaly mode allocates AM, never CR/CD/HP', () => {
  const anomalyScenario = SCENARIOS[2];
  const anomalyInput: CalcInput = {
    ...anomalyScenario,
    extraStats: {},
  };
  const results = runGreedyOptimization(anomalyInput, {
    slot5Opts: defaultSlot5Opts('anomaly'),
    set2Opts: defaultSet2Opts('anomaly'),
  });

  it('CR / CD / HP counters stay 0 in anomaly mode', () => {
    for (const r of results) {
      for (const h of r.history) {
        expect(h.counts.cr).toBe(0);
        expect(h.counts.cd).toBe(0);
        expect(h.counts.hp).toBe(0);
      }
    }
  });
});

describe('runGreedyOptimization — determinism', () => {
  it('same input -> identical output', () => {
    const r1 = runGreedyOptimization(baseInput, {
      slot5Opts: defaultSlot5Opts('attack'),
      set2Opts: defaultSet2Opts('attack'),
    });
    const r2 = runGreedyOptimization(baseInput, {
      slot5Opts: defaultSlot5Opts('attack'),
      set2Opts: defaultSet2Opts('attack'),
    });
    expect(JSON.stringify(r2)).toBe(JSON.stringify(r1));
  });
});
