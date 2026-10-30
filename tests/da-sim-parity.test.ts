// Headless parity check: TS port of nanoka da-sim vs Python reference outputs.
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PyRandom } from '../src/calc/daSim/pyCompat';
import { sampleTimeline } from '../src/calc/daSim/boss';
import { loadBundle, runDaSim } from '../src/calc/daSim/runner';
import { optimizeTeam } from '../src/calc/daSim/buildOptimizer';

const ROOT = path.resolve(__dirname, '../public/da-sim');
const read = async (p: string) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf-8'));
// Optional: exact action-sequence comparison against local Python dumps (dev box only).
function pyPlan(file: string, plan: unknown) {
  const f = path.join('/tmp/py', file);
  if (fs.existsSync(f)) expect(plan).toEqual(JSON.parse(fs.readFileSync(f, 'utf-8')).plan);
}
const SEED = 'scenarios/69034_seed_da002_anby_qingyi_caesar.json';
const ICE = 'scenarios/690481_complex_corrupted.json';

describe('da-sim pyCompat', () => {
  it('MT19937 matches CPython random.Random(42)', () => {
    const r = new PyRandom(42);
    expect(r.random()).toBe(0.6394267984578837);
    expect(r.random()).toBe(0.025010755222666936);
    expect(r.random()).toBe(0.27502931836911926);
  });
});

describe('da-sim boss timeline', () => {
  it('seed 42 ComplexCorrupted (Pass A weights)', async () => {
    const b = await loadBundle(read, ICE);
    const ev = sampleTimeline(b.bossModel, b.attackWindows, 150, 8, 42);
    expect(ev.length).toBe(24);
    expect(ev[0].skill).toBe('Attack_08');
    expect(ev[0].parry_window).toEqual([0.255, 0.805]);
    const ref = '/tmp/export/tl42.json';
    if (fs.existsSync(ref)) {
      const py = JSON.parse(fs.readFileSync(ref, 'utf-8'));
      expect(ev.map((e) => [e.t, e.skill, e.parry_window])).toEqual(py.map((e: any) => [e.t, e.skill, e.parry_window])); // eslint-disable-line @typescript-eslint/no-explicit-any
    }
  });
});

describe('da-sim build optimizer', () => {
  it('ice team auto build equals Python cached 690481_ice_team_auto', async () => {
    const b = await loadBundle(read, ICE);
    const sc = b.scenario;
    const ov = { ...(sc.build_overrides || {}), soukaku: { ...((sc.build_overrides || {}).soukaku || {}), mindscape: Number(sc.soukaku_mindscape) } };
    const builds = optimizeTeam(sc.team, sc.boss, b.weaponsExt, ov);
    for (const aid of sc.team) {
      const py = b.buildsFile!.agents[aid];
      const ts = builds.agents[aid];
      expect(ts.build.config_name, aid).toBe(py.build.config_name);
      expect(ts.extraStats, aid).toEqual(py.extraStats);
      expect(ts.impact, aid).toBe(py.impact);
    }
  }, 60000);
});

describe('da-sim beam search parity (width 40, steps 140, seed 42)', () => {
  it('seed-da-002 file build ≈ Python 46324 / 137.7s', async () => {
    const r = runDaSim(await loadBundle(read, SEED), { buildMode: 'file' });
    console.log('seed', r.score.da.total_score, r.score.final_t, r.score.total_damage, r.score.part_breaks, r.score.parry_count);
    expect(r.score.da.total_score).toBe(46323.7);
    expect(r.score.final_t).toBe(137.737);
    expect(r.score.total_damage).toBe(13858404.6);
    expect(r.score.part_breaks).toBe(5);
    expect(r.score.parry_count).toBe(9);
    pyPlan('seed_file.json', r.plan);
  }, 600000);
  it('690481 ice auto build ≈ Python 34421 / 130.8s', async () => {
    const r = runDaSim(await loadBundle(read, ICE), { buildMode: 'auto' });
    console.log('ice', r.score.da.total_score, r.score.final_t, r.score.total_damage, r.score.part_breaks, r.score.parry_count);
    expect(r.score.da.total_score).toBe(34420.7);
    expect(r.score.final_t).toBe(130.8);
    expect(r.score.total_damage).toBe(11523959.5);
    expect(r.score.part_breaks).toBe(3);
    expect(r.score.parry_count).toBe(15);
    pyPlan('690481_complex_corrupted.json', r.plan);
  }, 600000);
});

describe('da-sim free team composition', () => {
  it('loads arbitrary 3-agent team onto a period/boss template', async () => {
    const b = await loadBundle(read, ICE, { team: ['qingyi', 'anby_s0', 'soukaku'] });
    expect(b.scenario.team).toEqual(['qingyi', 'anby_s0', 'soukaku']);
    expect(b.kits.qingyi.cn).toBeTruthy();
    expect(b.kits.anby_s0.cn).toBeTruthy();
    expect(b.kits.soukaku.cn).toBeTruthy();
    expect(b.scenario.team_roles.qingyi).toBe('stun');
    expect(b.scenario.team_roles.anby_s0).toBe('dps');
    expect(b.scenario.team_roles.soukaku).toBe('support');
  });

  it('clear error when kit is missing', async () => {
    await expect(loadBundle(read, ICE, { team: ['qingyi', 'ellen', 'not_a_real_agent'] })).rejects.toThrow(
      /缺少代理人 kit/,
    );
  });

  it('preset-equivalent team override keeps ice parity inputs', async () => {
    const b0 = await loadBundle(read, ICE);
    const b1 = await loadBundle(read, ICE, { team: ['qingyi', 'ellen', 'soukaku'] });
    expect(b1.scenario.team).toEqual(b0.scenario.team);
    expect(b1.scenario.team_roles).toEqual({ qingyi: 'stun', ellen: 'dps', soukaku: 'support' });
    expect(b1.scenario.soukaku_mindscape).toBe(b0.scenario.soukaku_mindscape);
  });
});
