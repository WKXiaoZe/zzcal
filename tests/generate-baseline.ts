// tests/generate-baseline.ts
// Run with: npx tsx tests/generate-baseline.ts
//
// Computes calculateDamage() for every scenario and writes the result to
// tests/baseline-snapshot.json. After running, manually spot-check 1–2 entries
// against the live calculator (open index.html in the browser, dial in the
// scenario inputs, and confirm the displayed damage matches output.dmg).
import { SCENARIOS } from './scenarios';
// @ts-expect-error — legacy JS adapter, no types yet
import { calculateDamage } from '../legacy/calc-legacy.js';
import { writeFileSync } from 'fs';
import path from 'path';

const baseline = SCENARIOS.map((s) => ({
  name: s.name,
  input: s,
  output: calculateDamage({
    battleType: s.battleType,
    agent: s.agent,
    weapon: s.weapon,
    sup: s.sup,
    set4: s.set4,
    field: s.field,
    boss: s.boss,
    skill: s.skill,
    extraStats: s.extraStats,
  }),
}));

const outPath = path.resolve(process.cwd(), 'tests/baseline-snapshot.json');
writeFileSync(outPath, JSON.stringify(baseline, null, 2), 'utf-8');

console.log(`Wrote ${baseline.length} baseline entries to ${outPath}`);
for (const b of baseline) {
  console.log(`  - ${b.name}: dmg = ${b.output.dmg.toFixed(2)}`);
}
