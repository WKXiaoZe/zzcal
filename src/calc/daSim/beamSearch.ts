/**
 * Browser-side light beam search for Deadly Assault rotations.
 * Uses zzcal calculateDamage; kits/scenario from /da-sim/*.json (Pass A curated).
 */
import { calculateDamage } from '../formulas';
import type { DaAction, DaKit, DaLogRow, DaResult, DaScenario } from './types';

type TimedBuff = { key: string; value: number; expire: number };
type AgentS = { energy: number; energyMax: number; busyUntil: number; flash: number };
type State = {
  t: number;
  duration: number;
  active: string;
  decibel: number;
  bossStun: number;
  stunTh: number;
  stunnedUntil: number;
  totalDmg: number;
  totalStun: number;
  field: TimedBuff[];
  agents: Record<string, AgentS>;
  log: DaLogRow[];
  lastSwitch: number;
  plan: { agent: string; action: string }[];
};

function clone(s: State): State {
  return {
    ...s,
    field: s.field.map((b) => ({ ...b })),
    agents: Object.fromEntries(Object.entries(s.agents).map(([k, v]) => [k, { ...v }])),
    log: s.log.slice(),
    plan: s.plan.slice(),
  };
}

function fieldSum(s: State, key: string): number {
  return s.field.reduce((a, b) => (b.expire >= s.t && b.key === key ? a + b.value : a), 0);
}

function hitDmg(s: State, sc: DaScenario, aid: string, act: DaAction): { dmg: number; stun: number } {
  const stats = sc.agent_stats[aid] || {};
  const fb = sc.field_buffs_from_selectable || {};
  const boss: any = { ...sc.boss };
  const inStun = s.stunnedUntil > s.t;
  if (inStun) boss.dazeBase = Number(boss.dazeBase || 100) + 50;
  if (aid === 'ellen') boss.weak = true;

  const out = calculateDamage({
    battleType: stats.battleType || 'attack',
    agent: {
      baseAtk: stats.baseAtk,
      critRate: stats.critRate,
      critDmg: stats.critDmg,
      dmgBonus: stats.dmgBonus,
      resShred: stats.resShred,
      penRatio: stats.penRatio,
      defShred: stats.defShred,
      dazeVuln: stats.dazeVuln,
      inCombatAtkPct: fieldSum(s, 'inCombatAtkPct'),
    },
    weapon: stats.weapon || {},
    field: {
      dmgBonus: fieldSum(s, 'dmgBonus') + (inStun ? 20 : 0),
      resShred: fieldSum(s, 'resShred'),
      critRate: fieldSum(s, 'critRate'),
      critDmg: fieldSum(s, 'critDmg'),
      dazeVuln: fieldSum(s, 'dazeVuln'),
      inCombatAtkPct: 0,
      defShred: 0,
      anomalyMastery: 0,
      inCombatHpPct: 0,
    },
    boss: {
      defBase: Number(boss.defBase || 900),
      defBonus: Number(boss.defBonus || 0),
      res: Number(boss.res || 0),
      weak: !!boss.weak,
      dazeBase: Number(boss.dazeBase || 100),
    },
    skill: { multiplier: act.multiplier_pct, slot4Type: 'critRate' },
    extraStats: stats.extraStats || {},
    set4: {},
    sup: {},
  } as any);

  let stun = act.stun || 0;
  const kitProf = (globalThis as any).__daKitProf?.[aid];
  if (kitProf === 'Stun') stun *= 1 + Number(fb.stun_agent_break_stun_ratio || 0);
  return { dmg: out.dmg, stun };
}

function tryAct(
  s: State,
  sc: DaScenario,
  kits: Record<string, DaKit>,
  aid: string,
  actId: string,
): State | null {
  if (s.t >= s.duration) return null;
  const kit = kits[aid];
  const act = kit.actions.find((a) => a.id === actId);
  if (!act) return null;
  const ag = s.agents[aid];
  if (s.t < ag.busyUntil) return null;
  if (aid !== s.active && act.kind !== 'switch') return null;
  if (act.kind === 'switch' && s.t - s.lastSwitch < 1.5) return null;
  if (act.needs_flash && ag.flash <= 0) return null;
  if (act.needs_decibel && s.decibel < act.needs_decibel) return null;
  const fb = sc.field_buffs_from_selectable || {};
  const sp = 1 + Number(fb.sp_get_ratio || 0);
  if ((act.energy_cost || 0) > 0 && ag.energy < act.energy_cost) return null;

  const ns = clone(s);
  const nag = ns.agents[aid];
  if (aid !== ns.active || act.kind === 'switch') {
    ns.active = aid;
    ns.lastSwitch = s.t;
  }
  const { dmg, stun } = hitDmg(ns, sc, aid, act);
  ns.totalDmg += dmg;
  ns.totalStun += stun;
  ns.bossStun += stun;
  if (ns.bossStun >= ns.stunTh && ns.stunnedUntil < ns.t) {
    ns.stunnedUntil = ns.t + Number(sc.boss.stun_window_s || 12);
    ns.bossStun = 0;
  }
  if (act.energy_cost) nag.energy -= act.energy_cost;
  nag.energy = Math.min(nag.energyMax, nag.energy + (act.energy_gain || 0) * sp);
  if (act.decibel_gain < 0) ns.decibel = Math.max(0, ns.decibel + act.decibel_gain);
  else ns.decibel = Math.min(3000, ns.decibel + (act.decibel_gain || 0));
  if (act.needs_flash) nag.flash -= 1;
  if (act.applies_buff) {
    ns.field.push({
      key: 'inCombatAtkPct',
      value: act.applies_buff.inCombatAtkPct,
      expire: ns.t + act.applies_buff.duration_s,
    });
  }
  if (act.kind === 'ex' && fb.skill_buff_dmg_bonus_pct) {
    const dur = Number(fb.skill_buff_duration_s || 15);
    ns.field.push({ key: 'dmgBonus', value: Number(fb.skill_buff_dmg_bonus_pct), expire: ns.t + dur });
    ns.field.push({
      key: 'resShred',
      value: Number(fb.skill_buff_res_shred_pct || 0),
      expire: ns.t + dur,
    });
  }
  const dur = act.duration_s;
  nag.busyUntil = ns.t + dur;
  ns.log.push({
    t: +s.t.toFixed(3),
    t_end: +(ns.t + dur).toFixed(3),
    agent: aid,
    action: actId,
    label: act.label,
    dmg: +dmg.toFixed(1),
    stun: +stun.toFixed(3),
    total_dmg: +ns.totalDmg.toFixed(1),
    decibel: +ns.decibel.toFixed(1),
  });
  ns.t += dur;
  ns.field = ns.field.filter((b) => b.expire >= ns.t - 0.01);
  ns.plan.push({ agent: aid, action: actId });
  return ns;
}

function legal(s: State, sc: DaScenario, kits: Record<string, DaKit>): [string, string][] {
  const out: [string, string][] = [];
  const active = s.active;
  for (const a of kits[active].actions) {
    if (a.kind === 'switch') continue;
    if (tryAct(s, sc, kits, active, a.id)) out.push([active, a.id]);
  }
  for (const aid of sc.team) {
    if (aid === active) continue;
    for (const a of kits[aid].actions) {
      if (a.kind !== 'switch') continue;
      if (s.agents[aid].busyUntil > s.t + 0.05) continue;
      if (tryAct(s, sc, kits, aid, a.id)) out.push([aid, a.id]);
    }
  }
  return out;
}

export function runDaBeamSearch(
  scenario: DaScenario,
  kits: Record<string, DaKit>,
  opts?: { beam?: number; steps?: number },
): DaResult {
  (globalThis as any).__daKitProf = Object.fromEntries(
    Object.values(kits).map((k) => [k.agent_id, k.profession]),
  );
  const beamW = opts?.beam ?? 16;
  const maxSteps = opts?.steps ?? 80;
  const root: State = {
    t: 0,
    duration: scenario.fight_duration_s || 180,
    active: scenario.team[0],
    decibel: 0,
    bossStun: 0,
    stunTh: Number(scenario.boss.stun_threshold || 100),
    stunnedUntil: -1,
    totalDmg: 0,
    totalStun: 0,
    field: [],
    agents: Object.fromEntries(
      scenario.team.map((aid) => {
        const st = scenario.agent_stats[aid] || {};
        return [
          aid,
          {
            energy: Number(st.energy_start ?? 40),
            energyMax: Number(st.energy_max ?? 120),
            busyUntil: 0,
            flash: aid === 'ellen' ? 3 : 0,
          },
        ];
      }),
    ),
    log: [],
    lastSwitch: -999,
    plan: [],
  };

  type Item = { score: number; state: State };
  let beam: Item[] = [{ score: 0, state: root }];
  let best = beam[0];

  for (let step = 0; step < maxSteps; step++) {
    const cand: Item[] = [];
    for (const item of beam) {
      const st = item.state;
      if (st.t >= st.duration) {
        if (st.totalDmg > best.state.totalDmg) best = item;
        continue;
      }
      const acts = legal(st, scenario, kits);
      if (!acts.length) {
        const idle = clone(st);
        idle.t = Math.min(idle.duration, idle.t + 0.2);
        cand.push({ score: idle.totalDmg, state: idle });
        continue;
      }
      for (const [aid, act] of acts) {
        const ns = tryAct(st, scenario, kits, aid, act);
        if (!ns) continue;
        const stunProg = Math.min(1, ns.bossStun / Math.max(1, ns.stunTh));
        const bonus = ns.stunnedUntil > ns.t ? 5e4 : 0;
        const scv = ns.totalDmg + stunProg * 2e4 + bonus + ns.decibel * 2;
        cand.push({ score: scv, state: ns });
        if (ns.totalDmg > best.state.totalDmg) best = { score: scv, state: ns };
      }
    }
    if (!cand.length) break;
    cand.sort((a, b) => b.score - a.score);
    beam = cand.slice(0, beamW);
  }

  const hp = Number(scenario.boss.hp_proxy || 2.5e7);
  return {
    score: {
      total_damage: +best.state.totalDmg.toFixed(1),
      hp_proxy: hp,
      final_t: +best.state.t.toFixed(3),
      final_decibel: +best.state.decibel.toFixed(1),
      total_stun_applied: +best.state.totalStun.toFixed(3),
    },
    plan: best.state.plan,
    log: best.state.log,
  };
}
