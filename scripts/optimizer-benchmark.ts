// scripts/optimizer-benchmark.ts
//
// Stress benchmark: tries to find ANY case where greedy != brute-force optimum.
// Sweeps over budgets, scenarios, randomized baselines, and asymmetric
// startCounts. Reports the worst gaps found.

import { calculateDamage } from '../src/calc/formulas';
import {
  runGreedyOptimization,
  defaultSlot5Opts,
  defaultSet2Opts,
  type Slot5Option,
  type Set2Option,
} from '../src/calc/optimizer';
import type { CalcInput, ExtraSubStats } from '../src/calc/types';
import { SCENARIOS } from '../tests/scenarios';

const ROLL_CR = 2.4;
const ROLL_CD = 4.8;
const ROLL_ATK = 3.0;
const ROLL_HP = 3.0;
const ROLL_AM = 9.0;

interface StartCounts {
  cr: number; cd: number; atk: number; hp: number; am: number;
}
const ZERO_START: StartCounts = { cr: 0, cd: 0, atk: 0, hp: 0, am: 0 };

interface BruteResult { dmg: number; counts: Record<string, number>; }

/** Brute force over (CR, CD, ATK) — attack mode. */
function bruteAttack(
  base: CalcInput, s5: Slot5Option, s2: Set2Option, budget: number, start: StartCounts,
): BruteResult {
  const baseline = { ...(base.extraStats || {}) };
  const inc = budget - (start.cr + start.cd + start.atk);
  if (inc < 0) throw new Error('budget < startTotal');
  let bestDmg = -Infinity;
  let bestCounts: Record<string, number> = {};
  for (let dcr = 0; dcr <= inc; dcr++) {
    for (let dcd = 0; dcd <= inc - dcr; dcd++) {
      const datk = inc - dcr - dcd;
      const cr = start.cr + dcr, cd = start.cd + dcd, atk = start.atk + datk;
      const merged: ExtraSubStats = {
        ...baseline, ...(s5.val as Record<string, number>), ...(s2.val as Record<string, number>),
        critRate: cr * ROLL_CR, critDmg: cd * ROLL_CD, atkPct: atk * ROLL_ATK,
      };
      const d = calculateDamage({ ...base, extraStats: merged }).dmg;
      if (d > bestDmg) { bestDmg = d; bestCounts = { cr, cd, atk }; }
    }
  }
  return { dmg: bestDmg, counts: bestCounts };
}

/** Brute force over (CR, CD, HP) — break mode. */
function bruteBreak(
  base: CalcInput, s5: Slot5Option, s2: Set2Option, budget: number, start: StartCounts,
): BruteResult {
  const baseline = { ...(base.extraStats || {}) };
  const inc = budget - (start.cr + start.cd + start.hp);
  let bestDmg = -Infinity;
  let bestCounts: Record<string, number> = {};
  for (let dcr = 0; dcr <= inc; dcr++) {
    for (let dcd = 0; dcd <= inc - dcr; dcd++) {
      const dhp = inc - dcr - dcd;
      const cr = start.cr + dcr, cd = start.cd + dcd, hp = start.hp + dhp;
      const merged: ExtraSubStats = {
        ...baseline, ...(s5.val as Record<string, number>), ...(s2.val as Record<string, number>),
        critRate: cr * ROLL_CR, critDmg: cd * ROLL_CD, hpPct: hp * ROLL_HP,
      };
      const d = calculateDamage({ ...base, extraStats: merged }).dmg;
      if (d > bestDmg) { bestDmg = d; bestCounts = { cr, cd, hp }; }
    }
  }
  return { dmg: bestDmg, counts: bestCounts };
}

/** Brute force over (ATK, AM) — anomaly mode (2-channel, even simpler). */
function bruteAnomaly(
  base: CalcInput, s5: Slot5Option, s2: Set2Option, budget: number, start: StartCounts,
): BruteResult {
  const baseline = { ...(base.extraStats || {}) };
  const inc = budget - (start.atk + start.am);
  let bestDmg = -Infinity;
  let bestCounts: Record<string, number> = {};
  for (let datk = 0; datk <= inc; datk++) {
    const dam = inc - datk;
    const atk = start.atk + datk, am = start.am + dam;
    const merged: ExtraSubStats = {
      ...baseline, ...(s5.val as Record<string, number>), ...(s2.val as Record<string, number>),
      atkPct: atk * ROLL_ATK, anomalyMastery: am * ROLL_AM,
    };
    const d = calculateDamage({ ...base, extraStats: merged }).dmg;
    if (d > bestDmg) { bestDmg = d; bestCounts = { atk, am }; }
  }
  return { dmg: bestDmg, counts: bestCounts };
}

function bruteForce(
  base: CalcInput, s5: Slot5Option, s2: Set2Option, budget: number, start: StartCounts,
): BruteResult {
  if (base.battleType === 'attack')  return bruteAttack(base, s5, s2, budget, start);
  if (base.battleType === 'break')   return bruteBreak(base, s5, s2, budget, start);
  /* anomaly */                       return bruteAnomaly(base, s5, s2, budget, start);
}

interface Disagreement {
  scenarioName: string;
  battleType: string;
  budget: number;
  startCounts: StartCounts;
  s5: string;
  s2: string;
  greedyDmg: number;
  greedyCounts: Record<string, number>;
  bruteDmg: number;
  bruteCounts: Record<string, number>;
  gapPct: number;
}

function buildBase(sc: typeof SCENARIOS[number]): CalcInput {
  return {
    battleType: sc.battleType,
    agent: sc.agent, weapon: sc.weapon, sup: sc.sup, set4: sc.set4,
    field: sc.field, boss: sc.boss, skill: sc.skill,
    extraStats: sc.extraStats,
  };
}

function compareOne(
  base: CalcInput, start: StartCounts, budget: number, scenarioName: string,
): Disagreement[] {
  const bt = base.battleType;
  const s5Opts = defaultSlot5Opts(bt);
  const s2Opts = defaultSet2Opts(bt);
  const startTotal = start.cr + start.cd + start.atk + start.hp + start.am;
  if (startTotal > budget) return [];

  const greedy = runGreedyOptimization(base, {
    slot5Opts: s5Opts, set2Opts: s2Opts, startCounts: start, budget,
  });

  const disagreements: Disagreement[] = [];
  let i = 0;
  for (const s5 of s5Opts) {
    for (const s2 of s2Opts) {
      const g = greedy[i++];
      const gFinal = g.history[g.history.length - 1];
      const b = bruteForce(base, s5, s2, budget, start);
      const gap = (b.dmg - gFinal.dmg) / gFinal.dmg * 100;
      if (gap > 1e-6) {
        disagreements.push({
          scenarioName, battleType: bt, budget, startCounts: start,
          s5: s5.name, s2: s2.name,
          greedyDmg: gFinal.dmg,
          greedyCounts: {
            cr: gFinal.counts.cr, cd: gFinal.counts.cd, atk: gFinal.counts.atk,
            hp: gFinal.counts.hp, am: gFinal.counts.am,
          },
          bruteDmg: b.dmg, bruteCounts: b.counts, gapPct: gap,
        });
      }
    }
  }
  return disagreements;
}

// ---------- Phase 1: every scenario × every budget × varied startCounts ----------

console.log('Phase 1: 5 scenarios × 8 budgets × 6 startCounts patterns');
console.log('-'.repeat(80));

const startPatterns: { name: string; mk: (bt: string) => StartCounts }[] = [
  { name: 'zero',       mk: () => ({ ...ZERO_START }) },
  { name: 'sym-5',      mk: (bt) => bt === 'anomaly'
      ? { ...ZERO_START, atk: 5, am: 5 }
      : bt === 'break'
        ? { ...ZERO_START, cr: 5, cd: 5, hp: 5 }
        : { ...ZERO_START, cr: 5, cd: 5, atk: 5 } },
  { name: 'cr-heavy',   mk: (bt) => bt === 'anomaly'
      ? { ...ZERO_START, am: 15 }
      : { ...ZERO_START, cr: 15 } },
  { name: 'cd-heavy',   mk: (bt) => bt === 'anomaly'
      ? { ...ZERO_START, atk: 15 }
      : { ...ZERO_START, cd: 15 } },
  { name: 'atk-heavy',  mk: (bt) => bt === 'break'
      ? { ...ZERO_START, hp: 15 }
      : { ...ZERO_START, atk: 15 } },
  { name: 'extreme',    mk: (bt) => bt === 'anomaly'
      ? { ...ZERO_START, atk: 20, am: 5 }
      : bt === 'break'
        ? { ...ZERO_START, cr: 18, cd: 3, hp: 3 }
        : { ...ZERO_START, cr: 18, cd: 3, atk: 3 } },
];

const budgets = [5, 10, 15, 20, 30, 36, 42, 48];
let phase1Cases = 0, phase1Disagreements: Disagreement[] = [];

for (const sc of SCENARIOS) {
  const base = buildBase(sc);
  for (const sp of startPatterns) {
    const start = sp.mk(sc.battleType);
    for (const budget of budgets) {
      const startTotal = start.cr + start.cd + start.atk + start.hp + start.am;
      if (startTotal > budget) continue;
      phase1Cases++;
      const d = compareOne(base, start, budget, `${sc.name} [${sp.name}]`);
      phase1Disagreements.push(...d);
    }
  }
}
console.log(`phase 1: ran ${phase1Cases} configs, found ${phase1Disagreements.length} disagreements`);

// ---------- Phase 2: randomized baselines — perturb agent stats ----------

console.log('\nPhase 2: 500 randomized baselines (perturbing agent/weapon)');
console.log('-'.repeat(80));

function rnd(min: number, max: number) { return min + Math.random() * (max - min); }
function rndInt(min: number, max: number) { return Math.floor(rnd(min, max + 1)); }

let phase2Cases = 0, phase2Disagreements: Disagreement[] = [];

for (let trial = 0; trial < 500; trial++) {
  // Pick a random scenario as template, then perturb its agent/weapon
  const tplIdx = rndInt(0, SCENARIOS.length - 1);
  const tpl = SCENARIOS[tplIdx];
  const base = buildBase(tpl);
  // Perturb numerically
  base.agent = {
    ...base.agent,
    baseAtk: rnd(600, 1100),
    critRate: rnd(0, 60),
    critDmg: rnd(0, 250),
    dmgBonus: rnd(0, 100),
    atkPct: rnd(0, 50),
    anomalyMastery: rnd(0, 200),
  };
  base.weapon = {
    ...base.weapon,
    baseAtk: rnd(500, 900),
    critRate: rnd(0, 50),
    critDmg: rnd(0, 120),
    dmgBonus: rnd(0, 60),
  };
  base.boss = {
    ...base.boss,
    defBase: rnd(700, 1400),
    defBonus: rnd(0, 50),
    res: rnd(-0.4, 0.4),
  };

  // Pick a random budget and start
  const budget = budgets[rndInt(0, budgets.length - 1)];
  const sp = startPatterns[rndInt(0, startPatterns.length - 1)];
  const start = sp.mk(tpl.battleType);
  const startTotal = start.cr + start.cd + start.atk + start.hp + start.am;
  if (startTotal > budget) continue;
  phase2Cases++;
  const d = compareOne(base, start, budget, `random#${trial} (${tpl.battleType})`);
  phase2Disagreements.push(...d);
}
console.log(`phase 2: ran ${phase2Cases} configs, found ${phase2Disagreements.length} disagreements`);

// ---------- Phase 3: adversarial knife-edge baselines ----------
// Specifically engineer cases where greedy might lock in early choices that
// later turn out wrong.

console.log('\nPhase 3: adversarial knife-edge configurations');
console.log('-'.repeat(80));

let phase3Cases = 0, phase3Disagreements: Disagreement[] = [];

// 3a — baseline CR right below 100% cap → forces hard kink
const adversaries: { name: string; mutate: (b: CalcInput) => void }[] = [
  { name: 'CR-near-cap-95', mutate: (b) => { (b.agent as any).critRate = 95; } },
  { name: 'CR-near-cap-90', mutate: (b) => { (b.agent as any).critRate = 90; } },
  { name: 'CR-near-cap-85', mutate: (b) => { (b.agent as any).critRate = 85; } },
  { name: 'zero-CR-huge-CD', mutate: (b) => { (b.agent as any).critRate = 5; (b.agent as any).critDmg = 300; } },
  { name: 'huge-CR-zero-CD', mutate: (b) => { (b.agent as any).critRate = 70; (b.agent as any).critDmg = 0; } },
  { name: 'tiny-baseAtk',   mutate: (b) => { (b.agent as any).baseAtk = 100; } },
  { name: 'huge-baseAtk',   mutate: (b) => { (b.agent as any).baseAtk = 2000; } },
  { name: 'huge-dmgBonus',  mutate: (b) => { (b.agent as any).dmgBonus = 300; } },
  { name: 'low-everything', mutate: (b) => {
      (b.agent as any).critRate = 0; (b.agent as any).critDmg = 0;
      (b.agent as any).atkPct = 0; (b.agent as any).baseAtk = 500;
    } },
];

const attackScenarios = SCENARIOS.filter(s => s.battleType === 'attack');
for (const sc of attackScenarios) {
  for (const adv of adversaries) {
    const base = buildBase(sc);
    base.agent = { ...base.agent };
    adv.mutate(base);
    for (const budget of budgets) {
      for (const sp of startPatterns) {
        const start = sp.mk(sc.battleType);
        if (start.cr + start.cd + start.atk + start.hp + start.am > budget) continue;
        phase3Cases++;
        const d = compareOne(base, start, budget, `adv[${adv.name}] @ ${sc.name}`);
        phase3Disagreements.push(...d);
      }
    }
  }
}
console.log(`phase 3: ran ${phase3Cases} configs, found ${phase3Disagreements.length} disagreements`);

// ---------- Final report ----------

const all = [...phase1Disagreements, ...phase2Disagreements, ...phase3Disagreements];
console.log('\n' + '='.repeat(80));
console.log(`TOTAL: ${phase1Cases + phase2Cases + phase3Cases} configs tested, ${all.length} disagreements`);
console.log('='.repeat(80));

if (all.length === 0) {
  console.log('No disagreements found — greedy matched brute force on every test.');
} else {
  all.sort((a, b) => b.gapPct - a.gapPct);
  console.log(`\nWorst 20 disagreements (sorted by gap):`);
  for (const d of all.slice(0, 20)) {
    console.log(`\n  gap ${d.gapPct.toFixed(5)}%  | ${d.battleType}/budget=${d.budget} | start=${JSON.stringify(d.startCounts)}`);
    console.log(`  scenario: ${d.scenarioName}`);
    console.log(`  config:   ${d.s5} + ${d.s2}`);
    console.log(`  greedy:   ${Math.round(d.greedyDmg).toLocaleString()}  counts=${JSON.stringify(d.greedyCounts)}`);
    console.log(`  brute:    ${Math.round(d.bruteDmg).toLocaleString()}  counts=${JSON.stringify(d.bruteCounts)}`);
  }

  // Distribution of gaps
  const buckets = [0, 0.001, 0.01, 0.1, 1, 5];
  const counts = Array(buckets.length + 1).fill(0);
  for (const d of all) {
    let i = buckets.length;
    for (let b = 0; b < buckets.length; b++) {
      if (d.gapPct <= buckets[b]) { i = b; break; }
    }
    counts[i]++;
  }
  console.log('\nGap distribution:');
  console.log(`  <= 0.001%:  ${counts[1]}`);
  console.log(`  <= 0.01%:   ${counts[2]}`);
  console.log(`  <= 0.1%:    ${counts[3]}`);
  console.log(`  <= 1%:      ${counts[4]}`);
  console.log(`  <= 5%:      ${counts[5]}`);
  console.log(`  >  5%:      ${counts[6]}`);
}
