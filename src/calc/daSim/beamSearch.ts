/**
 * Browser-side light beam search for Deadly Assault rotations.
 * Uses zzcal calculateDamage; kits/scenario from /da-sim/*.json (Pass A curated).
 * Round-2: Soukaku FlagAtk flat + Ice AddedDamage/resShred; DA score = 60000*HP% + op.
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
  partBreaks: number;
  partDmgAccum: number;
  collapseStacks: number;
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

function sheetAtk(stats: any): number {
  const base = Number(stats.baseAtk || 0);
  const wBase = Number(stats.weapon?.baseAtk || 0);
  const atkPct =
    Number(stats.extraStats?.atkPct || 0) +
    Number(stats.weapon?.atkPct || 0);
  return (base + wBase) * (1 + atkPct / 100);
}

function hitDmg(s: State, sc: DaScenario, aid: string, act: DaAction): { dmg: number; stun: number } {
  const stats = sc.agent_stats[aid] || {};
  const fb = sc.field_buffs_from_selectable || {};
  const boss: any = { ...sc.boss };
  const inStun = s.stunnedUntil > s.t;
  if (inStun) boss.dazeBase = Number(boss.dazeBase || 100) + 50;
  if (aid === 'ellen') boss.weak = true;

  const collapseCd = fieldSum(s, 'collapseCritDmg') || s.collapseStacks * 25;

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
      inCombatAtkFlat: fieldSum(s, 'inCombatAtkFlat'),
    },
    weapon: stats.weapon || {},
    field: {
      dmgBonus: fieldSum(s, 'dmgBonus') + (inStun ? 20 : 0),
      resShred: fieldSum(s, 'resShred'),
      critRate: fieldSum(s, 'critRate'),
      critDmg: fieldSum(s, 'critDmg') + collapseCd,
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

function applyPartBreak(ns: State, sc: DaScenario, dmg: number) {
  const pb: any = sc.part_break || {};
  if (!pb.enabled) return;
  const hpMax = Number(sc.boss.hp_max || sc.boss.hp_proxy || 2.5e7);
  const ratio = Number(pb.max_part_hp_ratio || 0.1);
  const toPart = Number(pb.damage_to_part_ratio || 0.9);
  const partHp = hpMax * ratio;
  const legs = Number(pb.leg_count || 6);
  ns.partDmgAccum += dmg * toPart;
  while (ns.partBreaks < legs && ns.partDmgAccum >= partHp) {
    ns.partDmgAccum -= partHp;
    ns.partBreaks += 1;
    ns.decibel = Math.min(3000, ns.decibel + Number(pb.decibel_on_leg_break || 1000));
    const maxSt = Number(pb.崩解_max_stacks || 4);
    ns.collapseStacks = Math.min(maxSt, ns.collapseStacks + 1);
    const cdPct = Number(pb.崩解_crit_dmg_pct_per_stack || 25);
    const dur = Number(pb.崩解_duration_s || 20);
    ns.field = ns.field.filter((b) => b.key !== 'collapseCritDmg');
    ns.field.push({ key: 'collapseCritDmg', value: ns.collapseStacks * cdPct, expire: ns.t + dur });
  }
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
  applyPartBreak(ns, sc, dmg);
  if (ns.bossStun >= ns.stunTh && ns.stunnedUntil < ns.t) {
    ns.stunnedUntil = ns.t + Number(sc.boss.stun_window_s || 12);
    ns.bossStun = 0;
  }
  if (act.energy_cost) nag.energy -= act.energy_cost;
  nag.energy = Math.min(nag.energyMax, nag.energy + (act.energy_gain || 0) * sp);
  if (act.decibel_gain < 0) ns.decibel = Math.max(0, ns.decibel + act.decibel_gain);
  else ns.decibel = Math.min(3000, ns.decibel + (act.decibel_gain || 0));
  if (act.needs_flash) nag.flash -= 1;

  const ab = act.applies_buff;
  if (ab) {
    const expire = ns.t + ab.duration_s;
    if (ab.inCombatAtkPct) {
      ns.field.push({ key: 'inCombatAtkPct', value: ab.inCombatAtkPct, expire });
    }
    if (ab.inCombatAtkFlat_from_caster_atk_ratio) {
      const flat = sheetAtk(sc.agent_stats[aid] || {}) * ab.inCombatAtkFlat_from_caster_atk_ratio;
      ns.field = ns.field.filter((b) => b.key !== 'inCombatAtkFlat');
      ns.field.push({ key: 'inCombatAtkFlat', value: flat, expire });
    }
    if (ab.dmgBonus) {
      ns.field = ns.field.filter((b) => b.key !== 'soukakuIceDmg');
      ns.field.push({ key: 'soukakuIceDmg', value: ab.dmgBonus, expire });
      // fold into dmgBonus key used by hitDmg
      ns.field = ns.field.filter((b) => !(b.key === 'dmgBonus' && (b as any)._src === 'soukaku'));
      ns.field.push({ key: 'dmgBonus', value: ab.dmgBonus, expire, ...( { _src: 'soukaku' } as any) });
    }
    if (ab.resShred) {
      ns.field = ns.field.filter((b) => !(b.key === 'resShred' && (b as any)._src === 'soukaku'));
      ns.field.push({ key: 'resShred', value: ab.resShred, expire, ...( { _src: 'soukaku' } as any) });
    }
    const m6 = Number(sc.soukaku_mindscape || 0) >= 6 ? ab.cinema_m6_dmgBonus || 0 : 0;
    if (m6) {
      ns.field = ns.field.filter((b) => !(b.key === 'dmgBonus' && (b as any)._src === 'm6'));
      ns.field.push({ key: 'dmgBonus', value: m6, expire, ...( { _src: 'm6' } as any) });
    }
  }

  // 烁穹 SkillBuff — values live on field TimedBuffs only (no second add in hitDmg)
  if (act.kind === 'ex' && fb.skill_buff_dmg_bonus_pct) {
    const dur = Number(fb.skill_buff_duration_s || 15);
    ns.field = ns.field.filter((b) => !(b as any)._src || (b as any)._src !== 'shuoqiong');
    ns.field.push({
      key: 'dmgBonus',
      value: Number(fb.skill_buff_dmg_bonus_pct),
      expire: ns.t + dur,
      ...( { _src: 'shuoqiong' } as any),
    });
    ns.field.push({
      key: 'resShred',
      value: Number(fb.skill_buff_res_shred_pct || 0),
      expire: ns.t + dur,
      ...( { _src: 'shuoqiong' } as any),
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

function daScore(damage: number, hp: number, partBreaks: number, sc: DaScenario) {
  const cap = Number(sc.score?.damage_score_cap || 60000);
  const opCap = Number(sc.score?.operation_score_cap || 5000);
  const per = Number(sc.score?.op_per_part_break || 800);
  const goals = sc.score?.rank_goals || { s: 20000, a: 14000, b: 6000 };
  const dmgScore = Math.min(cap, cap * Math.max(0, Math.min(1, damage / Math.max(1, hp))));
  const op = Math.min(opCap, partBreaks * per);
  const total = dmgScore + op;
  let rank = 'none';
  if (total >= goals.s) rank = 'S';
  else if (total >= goals.a) rank = 'A';
  else if (total >= goals.b) rank = 'B';
  return {
    damage_score: +dmgScore.toFixed(1),
    operation_score: +op.toFixed(1),
    total_score: +total.toFixed(1),
    rank,
    part_breaks: partBreaks,
  };
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
    partBreaks: 0,
    partDmgAccum: 0,
    collapseStacks: 0,
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
        const partBonus = ns.partBreaks * 3e4;
        const scv = ns.totalDmg + stunProg * 2e4 + bonus + partBonus + ns.decibel * 2;
        cand.push({ score: scv, state: ns });
        if (ns.totalDmg > best.state.totalDmg) best = { score: scv, state: ns };
      }
    }
    if (!cand.length) break;
    cand.sort((a, b) => b.score - a.score);
    beam = cand.slice(0, beamW);
  }

  const hp = Number(scenario.boss.hp_max || scenario.boss.hp_proxy || 2.5e7);
  const da = daScore(best.state.totalDmg, hp, best.state.partBreaks, scenario);
  return {
    score: {
      total_damage: +best.state.totalDmg.toFixed(1),
      hp_proxy: hp,
      hp_max: hp,
      final_t: +best.state.t.toFixed(3),
      final_decibel: +best.state.decibel.toFixed(1),
      total_stun_applied: +best.state.totalStun.toFixed(3),
      part_breaks: best.state.partBreaks,
      da,
    },
    plan: best.state.plan,
    log: best.state.log,
  };
}
