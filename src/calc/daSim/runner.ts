// Data loading + one-call entry point shared by the web worker and the vitest parity test.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prepareScenario, BUDGET_DEFAULT } from './buildOptimizer';
import { beamSearch, type BeamResult } from './search';
import {
  normalizeTeam,
  professionToRole,
  type BuildMode,
  type DaDataBundle,
  type DaKit,
  type DaScenario,
  type TeamSlot,
} from './types';

export type JsonReader = (relPath: string) => Promise<any>;

export interface DaIndexAgent {
  id: string;
  cn: string;
  profession: string;
  element?: string;
  kit: string;
}

export interface DaIndexScenario {
  id: string;
  file: string;
  period_id: number;
  period_label: string;
  boss_key: string;
  /** Explicit 3-agent team for presets / future search (not an enum of named comps). */
  team?: string[];
  team_label: string;
  preset?: boolean;
  default_build_mode: BuildMode;
  human_ref?: number;
  python_ref?: { total_score: number; final_t: number; total_damage: number; build: BuildMode };
}

export interface DaIndex {
  bosses: { key: string; cn: string; available: boolean }[];
  agents?: DaIndexAgent[];
  slot_labels?: string[];
  scenarios: DaIndexScenario[];
  [k: string]: any;
}

export interface LoadBundleOptions {
  /**
   * Free team composition: override scenario.team with these 3 agent ids (or TeamSlot[]).
   * Kits are loaded for the override; missing kit → clear Chinese error.
   */
  team?: string[] | TeamSlot[];
}

const basename = (p: string) => p.split('/').pop() as string;

async function loadKit(read: JsonReader, aid: string): Promise<DaKit> {
  try {
    return await read(`kits/${aid}.json`);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    throw new Error(`缺少代理人 kit「${aid}」（kits/${aid}.json）。请换人，或等待该角色 Pass A 数据入库。详情：${detail}`);
  }
}

/** Apply a free 3-agent team onto a period/boss template scenario (deep clone). */
export function applyTeamOverride(scenario: DaScenario, teamIn: string[] | TeamSlot[], kits: Record<string, DaKit>): DaScenario {
  const team = normalizeTeam(teamIn);
  const sc: DaScenario = JSON.parse(JSON.stringify(scenario));
  sc.team = team;
  const roles: Record<string, string> = {};
  const stats: Record<string, Record<string, any>> = {};
  for (const aid of team) {
    const kit = kits[aid];
    if (!kit) throw new Error(`缺少代理人 kit「${aid}」`);
    roles[aid] = professionToRole(kit.profession);
    // Keep template stats if same agent was in the preset; else leave empty for auto/file to fill.
    if (scenario.agent_stats?.[aid]) stats[aid] = JSON.parse(JSON.stringify(scenario.agent_stats[aid]));
    else stats[aid] = {};
  }
  sc.team_roles = roles;
  sc.agent_stats = stats;
  // Drop build_overrides that don't apply to the new team (keep overlapping ones).
  if (sc.build_overrides && typeof sc.build_overrides === 'object') {
    const next: Record<string, any> = {};
    for (const aid of team) if (aid in sc.build_overrides) next[aid] = sc.build_overrides[aid];
    sc.build_overrides = next;
  }
  // soukaku_mindscape only relevant if she's on the team
  if (!team.includes('soukaku') && 'soukaku_mindscape' in sc) delete sc.soukaku_mindscape;
  return sc;
}

export async function loadBundle(
  read: JsonReader,
  scenarioFile: string,
  opts?: LoadBundleOptions,
): Promise<DaDataBundle> {
  const raw = await read(scenarioFile);
  let teamIds: string[] | null = null;
  if (opts?.team) teamIds = normalizeTeam(opts.team);
  else teamIds = normalizeTeam(raw.team);

  const kits: Record<string, DaKit> = {};
  for (const aid of teamIds) kits[aid] = await loadKit(read, aid);

  const scenario = opts?.team ? applyTeamOverride(raw, teamIds, kits) : raw;

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
  return {
    scenario,
    kits,
    bossModel,
    attackWindows: aw.windows || aw,
    scoreCurve,
    weaponsExt: weaponsExt.weapons || weaponsExt,
    buildsFile,
  };
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

function assertBuildCoverage(scenario: DaScenario, mode: BuildMode, buildsFile: Record<string, any> | null | undefined) {
  if (mode === 'file') {
    if (!buildsFile) throw new Error('配装模式「存档配装」需要 builds 文件，但模板场景没有或加载失败。请改用「自动配装」或选择带存档的预设。');
    const agents = buildsFile.agents || buildsFile;
    const missing = scenario.team.filter((aid) => !(aid in agents));
    if (missing.length) {
      throw new Error(
        `存档配装缺少代理人：${missing.join('、')}。自由配队请用「自动配装」，或选择与存档一致的预设队伍。`,
      );
    }
  }
  if (mode === 'none') {
    const missing = scenario.team.filter((aid) => {
      const s = scenario.agent_stats?.[aid];
      return !s || s.baseAtk == null;
    });
    if (missing.length) {
      throw new Error(
        `「不配装」模式下缺少面板数据：${missing.join('、')}。自由配队请改用「自动配装」。`,
      );
    }
  }
}

export function runDaSim(bundle: DaDataBundle, opt: RunOptions): RunResult {
  assertBuildCoverage(bundle.scenario, opt.buildMode, bundle.buildsFile);
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
