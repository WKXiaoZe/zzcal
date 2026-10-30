// Data loading + one-call entry point shared by the web worker and the vitest parity test.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prepareScenario, BUDGET_DEFAULT } from './buildOptimizer';
import { beamSearch, type BeamResult } from './search';
import type { BuildMode, DaDataBundle, DaKit } from './types';

export type JsonReader = (relPath: string) => Promise<any>;

export interface DaIndexScenario {
  id: string;
  file: string;
  period_id: number;
  period_label: string;
  boss_key: string;
  team_label: string;
  default_build_mode: BuildMode;
  human_ref?: number;
  python_ref?: { total_score: number; final_t: number; total_damage: number; build: BuildMode };
}
export interface DaIndex {
  bosses: { key: string; cn: string; available: boolean }[];
  scenarios: DaIndexScenario[];
  [k: string]: any;
}

const basename = (p: string) => p.split('/').pop() as string;

export async function loadBundle(read: JsonReader, scenarioFile: string): Promise<DaDataBundle> {
  const scenario = await read(scenarioFile);
  const kits: Record<string, DaKit> = {};
  for (const aid of scenario.team) kits[aid] = await read(`kits/${aid}.json`);
  const bossKey = scenario.boss_key;
  const [bossModel, aw, scoreCurve, weaponsExt] = await Promise.all([
    read(`boss/${bossKey}_model.json`),
    read(`boss/${bossKey}_attack_windows.json`),
    read('score_curve.json'),
    read('builds/weapons_ext.json'),
  ]);
  let buildsFile: any = null;
  if (scenario.builds_file) {
    try {
      buildsFile = await read(`builds/${basename(scenario.builds_file)}`);
    } catch {
      buildsFile = null;
    }
  }
  return { scenario, kits, bossModel, attackWindows: aw.windows || aw, scoreCurve, weaponsExt: weaponsExt.weapons || weaponsExt, buildsFile };
}

export interface RunOptions {
  buildMode: BuildMode;
  beamWidth?: number;
  maxSteps?: number;
  seed?: number;
  budget?: number;
  onProgress?: (step: number, maxSteps: number, bestDmg: number) => void;
}

export interface RunResult extends BeamResult {
  build_mode: BuildMode;
  builds: Record<string, any> | null;
  agent_stats: Record<string, any>;
  team: string[];
  team_roles: Record<string, string>;
  agent_cn: Record<string, string>;
  elapsed_ms: number;
}

export function runDaSim(bundle: DaDataBundle, opt: RunOptions): RunResult {
  const t0 = Date.now();
  const { scenario, builds } = prepareScenario(
    bundle.scenario,
    opt.buildMode,
    bundle.weaponsExt,
    bundle.buildsFile,
    opt.budget ?? BUDGET_DEFAULT,
  );
  const res = beamSearch({
    scenario,
    kits: bundle.kits,
    bossModel: bundle.bossModel,
    attackWindows: bundle.attackWindows,
    scoreCurve: bundle.scoreCurve,
    beamWidth: opt.beamWidth ?? 40,
    maxSteps: opt.maxSteps ?? 140,
    seed: opt.seed ?? 42,
    onProgress: opt.onProgress,
  });
  const agent_cn: Record<string, string> = {};
  for (const aid of scenario.team) agent_cn[aid] = bundle.kits[aid]?.cn || aid;
  return {
    ...res,
    build_mode: opt.buildMode,
    builds,
    agent_stats: scenario.agent_stats,
    team: scenario.team,
    team_roles: scenario.team_roles || {},
    agent_cn,
    elapsed_ms: Date.now() - t0,
  };
}
