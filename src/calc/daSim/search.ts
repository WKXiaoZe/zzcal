// Port of da-sim sim/search.py — role-aware beam search (R17 heuristics kept verbatim).
/* eslint-disable @typescript-eslint/no-explicit-any */
import { sampleTimeline } from './boss';
import { computeDaScore } from './score';
import { pyRound } from './pyCompat';
import { applyAction, cloneState, initState, legalActions, type FightState } from './state';
import type { DaKit, DaScenario, BossModel, ScoreCurve } from './types';

type Plan = [string, string][];
interface BeamItem {
  sort_key: number;
  seq: number;
  state: FightState;
  plan: Plan;
}

export const DEFAULT_HEURISTICS: Record<string, any> = {
  min_dps_action_share: 0.4,
  dps_share_warmup_steps: 6,
  max_non_dps_streak: 4,
  max_dps_streak: 10,
  dps_starvation_bonus: 400000,
  non_dps_starvation_penalty: 350000,
  streak_penalty_per_extra: 150000,
  stun_window_dps_bonus: 200000,
  support_buff_once_bonus: 100000,
  role_damage_weight: { dps: 1.0, stun: 0.45, support: 0.3 },
  stun_need_bonus: 200000,
  min_stun_action_share: 0.08,
  stun_share_warmup_steps: 8,
  stun_starvation_bonus: 300000,
  force_stun_if_zero_after: 8,
  min_support_buff_actions: 1,
  force_support_buff_after: 10,
  support_buff_action_ids: ['ex', 'ex_buff', 'ultimate'],
};

export function heurCfg(scenario: DaScenario): Record<string, any> {
  const cfg: Record<string, any> = { ...DEFAULT_HEURISTICS };
  const raw = scenario.search_heuristics || {};
  for (const [k, v] of Object.entries(raw)) {
    if (k === 'role_damage_weight' && v && typeof v === 'object' && !Array.isArray(v))
      cfg.role_damage_weight = { ...cfg.role_damage_weight, ...(v as any) };
    else if (k !== 'note') cfg[k] = v;
  }
  return cfg;
}

interface Ctx {
  roles: Record<string, string>;
  dps: Set<string>;
  stun: Set<string>;
  support: Set<string>;
  cfg: Record<string, any>;
  buffIds: string[];
}

function makeCtx(scenario: DaScenario): Ctx {
  const roles: Record<string, string> = { ...(scenario.team_roles || {}) };
  const ent = Object.entries(roles);
  let dps = new Set(ent.filter(([, r]) => r === 'dps').map(([a]) => a));
  if (!dps.size) {
    const team = scenario.team || [];
    dps = new Set(team.length >= 2 ? [team[1]] : team.slice(0, 1));
  }
  const cfg = heurCfg(scenario);
  return {
    roles,
    dps,
    stun: new Set(ent.filter(([, r]) => r === 'stun').map(([a]) => a)),
    support: new Set(ent.filter(([, r]) => r === 'support').map(([a]) => a)),
    cfg,
    buffIds: cfg.support_buff_action_ids?.length ? [...cfg.support_buff_action_ids] : ['ex', 'ex_buff', 'ultimate'],
  };
}

function nonDpsStreak(plan: Plan, dps: Set<string>) {
  let s = 0;
  for (let i = plan.length - 1; i >= 0; i--) {
    const a = plan[i][0];
    if (dps.has(a)) break;
    if (a === 'idle') continue;
    s++;
  }
  return s;
}
function dpsStreak(plan: Plan, dps: Set<string>) {
  let s = 0;
  for (let i = plan.length - 1; i >= 0; i--) {
    const a = plan[i][0];
    if (a === 'idle') continue;
    if (!dps.has(a)) break;
    s++;
  }
  return s;
}
function share(plan: Plan, set: Set<string>) {
  let n = 0;
  let k = 0;
  for (const [a] of plan) {
    if (a === 'idle') continue;
    n++;
    if (set.has(a)) k++;
  }
  return n ? k / n : 1.0;
}
const countIn = (plan: Plan, set: Set<string>) => plan.filter(([a]) => a !== 'idle' && set.has(a)).length;
const supportBuffCount = (plan: Plan, sup: Set<string>, ids: string[]) =>
  plan.filter(([a, b]) => sup.has(a) && ids.includes(b)).length;

function filterActs(acts: Plan, plan: Plan, c: Ctx, st: FightState): Plan {
  const { dps, cfg } = c;
  if (!dps.size || !acts.length) return acts;
  const maxNon = Math.trunc(cfg.max_non_dps_streak);
  const maxDps = Math.trunc(cfg.max_dps_streak);
  const nReal = plan.filter(([a]) => a !== 'idle').length;
  const stunProg = st.boss_stun / Math.max(1, st.boss_stun_threshold);
  const pickSet = (s: Set<string>) => acts.filter(([a]) => s.has(a));
  if (st.boss_stunned_until > st.t) {
    const d = pickSet(dps);
    if (d.length) return d;
  }
  if (nonDpsStreak(plan, dps) >= maxNon) {
    const d = pickSet(dps);
    if (d.length) return d;
  }
  const forceAfter = Math.trunc(cfg.force_stun_if_zero_after ?? 8);
  if (c.stun.size && nReal >= forceAfter && countIn(plan, c.stun) === 0 && stunProg < 0.92 && st.boss_stunned_until <= st.t) {
    const s = pickSet(c.stun);
    if (s.length) return s;
  }
  const forceSup = Math.trunc(cfg.force_support_buff_after ?? 10);
  const minSup = Math.trunc(cfg.min_support_buff_actions ?? 1);
  if (c.support.size && nReal >= forceSup && supportBuffCount(plan, c.support, c.buffIds) < minSup && st.boss_stunned_until <= st.t) {
    const s = acts.filter(([a, b]) => c.support.has(a) && c.buffIds.includes(b));
    if (s.length) return s;
  }
  if (dpsStreak(plan, dps) >= maxDps && c.stun.size) {
    if (stunProg < 0.92 && st.boss_stunned_until <= st.t) {
      const s = pickSet(c.stun);
      if (s.length) return s;
    }
  }
  return acts;
}

function roleScore(ns: FightState, plan: Plan, c: Ctx): number {
  const { dps, cfg } = c;
  const stunProg = Math.min(1, ns.boss_stun / Math.max(1, ns.boss_stun_threshold));
  const inStunBonus = ns.boss_stunned_until > ns.t ? 50000 : 0;
  let score =
    ns.w_dmg + stunProg * 25000 + inStunBonus + ns.decibel * 2 + ns.part_breaks * 80000 + ns.collapse_stacks * 15000;
  if (!dps.size || !plan.length) return score;
  const last = plan[plan.length - 1][0];
  if (last === 'idle') return score;
  const n = plan.filter(([a]) => a !== 'idle').length;
  const sh = share(plan, dps);
  const deficit = n >= Math.trunc(cfg.dps_share_warmup_steps) ? Math.max(0, Number(cfg.min_dps_action_share) - sh) : 0;
  if (deficit > 0) {
    if (dps.has(last)) score += deficit * Number(cfg.dps_starvation_bonus);
    else score -= deficit * Number(cfg.non_dps_starvation_penalty);
  }
  const streak = nonDpsStreak(plan, dps);
  const maxNon = Math.trunc(cfg.max_non_dps_streak);
  if (streak > maxNon && !dps.has(last)) score -= (streak - maxNon) * Number(cfg.streak_penalty_per_extra);
  if (ns.boss_stunned_until > ns.t && dps.has(last)) score += Number(cfg.stun_window_dps_bonus);
  if (c.stun.has(last) && stunProg < 0.85 && ns.boss_stunned_until <= ns.t)
    score += Number(cfg.stun_need_bonus) * (1 - stunProg);
  const minStun = Number(cfg.min_stun_action_share || 0);
  const stunWarm = Math.trunc(cfg.stun_share_warmup_steps || 8);
  if (c.stun.size && n >= stunWarm && minStun > 0) {
    const sdef = Math.max(0, minStun - share(plan, c.stun));
    if (sdef > 0) {
      const b = Number(cfg.stun_starvation_bonus || 0);
      if (c.stun.has(last)) score += sdef * b;
      else score -= sdef * b * 0.75;
    }
  }
  if (c.support.has(last)) {
    const act = plan[plan.length - 1][1];
    if (act === 'ex' || act === 'ex_buff' || act === 'ultimate') {
      const nSame = plan.filter(([a, b]) => a === last && b === act).length;
      if (nSame === 1) score += Number(cfg.support_buff_once_bonus);
      else if (nSame <= 3) score += Number(cfg.support_buff_once_bonus) * 0.45;
    }
  }
  return score;
}

export interface BeamArgs {
  scenario: DaScenario;
  kits: Record<string, DaKit>;
  bossModel: BossModel;
  attackWindows: Record<string, any>;
  scoreCurve: ScoreCurve;
  beamWidth?: number;
  maxSteps?: number;
  seed?: number;
  onProgress?: (step: number, maxSteps: number, bestDmg: number) => void;
}

const bestKey = (s: FightState): [number, number, number] => [s.total_damage + s.part_breaks * 50000, s.part_breaks, s.total_damage];
function tupleGt(a: number[], b: number[]) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return false;
}

export function beamSearch(args: BeamArgs) {
  const { scenario, kits, bossModel, attackWindows, scoreCurve } = args;
  const beamWidth = args.beamWidth ?? 40;
  const maxSteps = args.maxSteps ?? 140;
  const seed = args.seed ?? 42;
  const events = sampleTimeline(
    bossModel,
    attackWindows,
    Number(scenario.fight_duration_s ?? 180),
    Number(scenario.distance_default ?? 8),
    seed,
  );
  const ctx = makeCtx(scenario);
  const weights: Record<string, number> = ctx.cfg.role_damage_weight;
  const roleW = (aid: string) => {
    const role = ctx.roles[aid] ?? 'dps';
    return Number(role in weights ? weights[role] : 0.5);
  };
  const root = initState(scenario, kits);
  let seq = 0;
  let beam: BeamItem[] = [{ sort_key: 0, seq, state: root, plan: [] }];
  let best: BeamItem = beam[0];
  const finished: BeamItem[] = [];
  for (let step = 0; step < maxSteps; step++) {
    const cands: BeamItem[] = [];
    for (const item of beam) {
      const st = item.state;
      if (st.t >= st.duration) {
        finished.push(item);
        continue;
      }
      let acts = legalActions(st, scenario, kits);
      acts = filterActs(acts, item.plan, ctx, st);
      if (!acts.length) {
        const idle = cloneState(st);
        idle.t = Math.min(idle.duration, idle.t + 0.2);
        seq++;
        cands.push({ sort_key: -idle.total_damage, seq, state: idle, plan: [...item.plan, ['idle', 'wait']] });
        continue;
      }
      for (const [aid, act] of acts) {
        const ns = applyAction(st, scenario, kits, aid, act, events);
        if (!ns) continue;
        ns.w_dmg = st.w_dmg + ns.log[ns.log.length - 1].dmg * roleW(aid);
        seq++;
        const plan: Plan = [...item.plan, [aid, act]];
        const score = roleScore(ns, plan, ctx);
        const tf = 1 + 0.05 * (1 - ns.t / Math.max(1, ns.duration));
        cands.push({ sort_key: -(score * tf), seq, state: ns, plan });
      }
    }
    if (!cands.length) break;
    cands.sort((a, b) => a.sort_key - b.sort_key || a.seq - b.seq);
    beam = cands.slice(0, beamWidth);
    for (const it of beam) {
      if (tupleGt(bestKey(it.state), bestKey(best.state))) best = it;
      if (it.state.t >= it.state.duration) finished.push(it);
    }
    args.onProgress?.(step + 1, maxSteps, best.state.total_damage);
  }
  if (finished.length) {
    const fin = finished
      .map((x, i) => ({ x, i, k: -(x.state.total_damage + x.state.part_breaks * 50000) }))
      .sort((a, b) => a.k - b.k || a.i - b.i);
    best = fin[0].x;
  }
  const boss = scenario.boss;
  const hp = Number(boss.hp_max || boss.hp_proxy || 1);
  const dmg = best.state.total_damage;
  const scfg = scenario.score || {};
  const da = computeDaScore({
    damage: dmg,
    maxHp: hp,
    partBreaks: best.state.part_breaks,
    opPerBreak: Number(scfg.op_per_part_break ?? 800),
    damageCap: Number(scfg.damage_score_cap ?? 60000),
    opCap: Number(scfg.operation_score_cap ?? 5000),
    rankGoals: scfg.rank_goals || { s: 20000, a: 14000, b: 6000 },
    curve: scoreCurve,
  });
  const counts: Record<string, number> = {};
  for (const [a] of best.plan) if (a !== 'idle') counts[a] = (counts[a] ?? 0) + 1;
  const actOf = (a: string, b: string) => (kits[a]?.actions || []).find((x) => x.id === b);
  return {
    search: {
      beam_width: beamWidth,
      max_steps: maxSteps,
      seed,
      dps_agents: [...ctx.dps].sort(),
      dps_action_share: pyRound(share(best.plan, ctx.dps), 4),
      action_counts: counts,
    },
    score: {
      total_damage: pyRound(dmg, 1),
      hp_max: hp,
      total_stun_applied: pyRound(best.state.total_stun_applied, 3),
      parry_count: best.state.parry_count,
      perfect_assist_count: best.state.perfect_assist_count,
      part_breaks: best.state.part_breaks,
      collapse_stacks_end: best.state.collapse_stacks,
      final_decibel: pyRound(best.state.decibel, 1),
      final_t: pyRound(best.state.t, 3),
      da,
    },
    plan: best.plan.map(([a, b], i) => ({ t_index: i, agent: a, action: b, label: actOf(a, b)?.label ?? null })),
    log: best.state.log.map((e) => ({ ...e, skill_cn: actOf(e.agent, e.action)?.skill_cn ?? null })),
    boss_events: events,
  };
}
export type BeamResult = ReturnType<typeof beamSearch>;
