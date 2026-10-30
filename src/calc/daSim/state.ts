// Port of da-sim sim/state.py — combat state machine.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { calculateDamage } from '../formulas';
import type { CalcInput } from '../types';
import { f0, pyInt, pyRound } from './pyCompat';
import type { BossEvent, DaKit, DaKitAction, DaScenario } from './types';

export interface TimedBuff {
  key: string;
  value: number;
  expire_t: number;
}
export interface AgentState {
  agent_id: string;
  energy: number;
  energy_max: number;
  busy_until: number;
  flash_charges: number;
  mark_stacks: number;
}
export interface LogEntry {
  t: number;
  t_end: number;
  agent: string;
  action: string;
  label?: string;
  dmg: number;
  stun: number;
  decibel: number;
  energy: number;
  boss_stunned: boolean;
  total_dmg: number;
  part_breaks: number;
  collapse_stacks: number;
}
export interface FightState {
  t: number;
  duration: number;
  active: string;
  decibel: number;
  decibel_max: number;
  boss_stun: number;
  boss_stun_threshold: number;
  boss_stunned_until: number;
  total_damage: number;
  total_stun_applied: number;
  field_buffs: TimedBuff[];
  agents: Record<string, AgentState>;
  log: LogEntry[];
  parry_count: number;
  perfect_assist_count: number;
  last_switch_t: number;
  switch_cd_s: number;
  part_damage_accum: number;
  part_breaks: number;
  part_breaks_max: number;
  collapse_stacks: number;
  /** cached Σ log.dmg × role weight, accumulated in log order (search helper). */
  w_dmg: number;
}

export function cloneState(s: FightState): FightState {
  const agents: Record<string, AgentState> = {};
  for (const k in s.agents) agents[k] = { ...s.agents[k] };
  return {
    ...s,
    field_buffs: s.field_buffs.map((b) => ({ ...b })),
    agents,
    log: s.log.slice(),
  };
}

function idxOr(arr: any[], idx: number) {
  return Number(idx < arr.length ? arr[idx] : arr[arr.length - 1]);
}

export function weaponTeamDmgPct(stats: Record<string, any>): number {
  const build = stats.build || {};
  let pas = build.weapon_team_dmg_assumption || {};
  if (!Object.keys(pas).length) pas = (build.weapon_meta || {}).passive || {};
  const refine = pyInt(build.weapon_refine || 5);
  const idx = Math.max(0, Math.min(4, refine - 1));
  if (pas.pass_a_sourced && 'team_dmg_max_pct' in pas) return idxOr(pas.team_dmg_max_pct, idx);
  if ('pass_a_team_dmg_pct' in pas && pas.pass_a_sourced) return Number(pas.pass_a_team_dmg_pct);
  if ('assumption_team_dmg_pct' in pas) return Number(pas.assumption_team_dmg_pct);
  if (pas.assumption_team_dmg && 'team_dmg_at_15' in pas) return idxOr(pas.team_dmg_at_15, idx);
  if ('team_dmg_base' in pas) {
    const extra = pas.team_dmg_extra_cap || [0, 0, 0, 0, 0];
    return idxOr(pas.team_dmg_base, idx) + idxOr(extra, idx);
  }
  if ('team_dmg_max_pct' in pas) return idxOr(pas.team_dmg_max_pct, idx);
  return 0;
}

export function initState(scenario: DaScenario, kits: Record<string, DaKit>): FightState {
  const st: FightState = {
    t: 0,
    duration: Number(scenario.fight_duration_s ?? 180),
    active: scenario.team[0],
    decibel: 0,
    decibel_max: 3000,
    boss_stun: 0,
    boss_stun_threshold: Number(scenario.boss.stun_threshold ?? 100),
    boss_stunned_until: -1,
    total_damage: 0,
    total_stun_applied: 0,
    field_buffs: [],
    agents: {},
    log: [],
    parry_count: 0,
    perfect_assist_count: 0,
    last_switch_t: -999,
    switch_cd_s: 1.5,
    part_damage_accum: 0,
    part_breaks: 0,
    part_breaks_max: pyInt((scenario.part_break || {}).leg_count ?? 6),
    collapse_stacks: 0,
    w_dmg: 0,
  };
  for (const aid of scenario.team) {
    const s = scenario.agent_stats[aid];
    st.agents[aid] = {
      agent_id: aid,
      energy: Number(s.energy_start ?? 40),
      energy_max: Number(s.energy_max ?? 120),
      busy_until: 0,
      flash_charges: aid === 'ellen' ? 3 : 0,
      mark_stacks: 0,
    };
  }
  const end = st.duration + 1;
  for (const aid of scenario.team) {
    const pct = weaponTeamDmgPct(scenario.agent_stats[aid]);
    if (pct > 0) {
      st.field_buffs.push({ key: 'dmgBonus', value: pct, expire_t: end });
      st.field_buffs.push({ key: `weapon_team_dmg:${aid}`, value: pct, expire_t: end });
    }
  }
  const fb0 = scenario.field_buffs_from_selectable || {};
  if (f0(fb0.permanent_crit_dmg_pct) > 0)
    st.field_buffs.push({ key: 'critDmg', value: Number(fb0.permanent_crit_dmg_pct), expire_t: end });
  if (f0(fb0.permanent_atk_pct) > 0)
    st.field_buffs.push({ key: 'inCombatAtkPct', value: Number(fb0.permanent_atk_pct), expire_t: end });
  if (f0(fb0.permanent_dmg_bonus_pct) > 0)
    st.field_buffs.push({ key: 'dmgBonus', value: Number(fb0.permanent_dmg_bonus_pct), expire_t: end });
  for (const aid of scenario.team) {
    const aa = ((kits[aid] || {}) as any).additional_ability || {};
    if (f0(aa.dmgBonus) > 0) {
      st.field_buffs.push({ key: 'dmgBonus', value: Number(aa.dmgBonus), expire_t: end });
      st.field_buffs.push({ key: `additional_ability:${aid}`, value: Number(aa.dmgBonus), expire_t: end });
    }
  }
  return st;
}

function activeField(st: FightState): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of st.field_buffs) if (b.expire_t >= st.t) out[b.key] = (out[b.key] ?? 0) + b.value;
  return out;
}
const inStun = (st: FightState) => st.boss_stunned_until > st.t;

function soukakuSheetAtk(scenario: DaScenario): number {
  const s = scenario.agent_stats.soukaku;
  const w = s.weapon || {};
  const ex = s.extraStats || {};
  const base = Number(s.baseAtk ?? 0) + Number(w.baseAtk ?? 0);
  const pct =
    Number(s.atkPct ?? 0) + Number(w.atkPct ?? 0) + Number(ex.atkPct ?? 0) + Number(ex.slot5_AtkPct ?? 0) +
    Number(ex.set2_AtkPct ?? 0) + 30;
  return base * (1 + pct / 100) + 316;
}

export function evalHit(
  st: FightState,
  scenario: DaScenario,
  kits: Record<string, DaKit>,
  agentId: string,
  action: DaKitAction,
): [number, number] {
  const stats = scenario.agent_stats[agentId];
  const boss: Record<string, any> = { ...scenario.boss };
  const field = activeField(st);
  const fb = scenario.field_buffs_from_selectable || {};
  if (inStun(st)) {
    boss.dazeBase = Number(boss.dazeBase ?? 100) + 50;
    field.dmgBonus = (field.dmgBonus ?? 0) + 20;
  }
  if (!('dazeBase' in boss) || boss.dazeBase === null || boss.dazeBase === undefined) boss.dazeBase = 100; // py _f default
  if (stats.battleType === 'attack' && agentId === 'ellen') boss.weak = true;
  const collapseCd = field.collapse_crit_dmg ?? 0;
  const build = stats.build || {};
  const slot4 = build.slot4Type || stats.slot4Type || 'critRate';
  const mindscape = pyInt(build.mindscape || stats.mindscape || 0);
  const inAtk = f0(stats.inCombatAtkPct) + (field.inCombatAtkPct ?? 0);
  const inFlat = f0(stats.inCombatAtkFlat) + (field.inCombatAtkFlat ?? 0);
  let mult = Number(action.multiplier_pct ?? 0);
  const kit = kits[agentId];
  if (mindscape >= 1 && kit) {
    const m1 = (kit.mindscape_effects || {})['1'] || {};
    const procs = pyInt(action.cinema_m1_white_thunder_procs || m1.extra_white_thunder_procs || 0);
    if (procs && action.id === (m1.on_action || 'ex')) {
      let wt = f0((kit.white_thunder || {}).damage_pct);
      if (wt <= 0) {
        const m = kit.actions.find((a) => a.id === 'mark');
        wt = m ? f0(m.multiplier_pct) : 0;
      }
      mult += procs * wt;
    }
  }
  let uAdr = 0;
  let uCd = 0;
  if (kit && kit.unique_skill) {
    uAdr = f0(kit.unique_skill.added_damage_ratio_pct);
    uCd = f0(kit.unique_skill.crit_dmg_ratio_pct);
  }
  const inp = {
    battleType: stats.battleType ?? 'attack',
    agent: {
      baseAtk: stats.baseAtk,
      critRate: stats.critRate,
      critDmg: f0(stats.critDmg) + collapseCd + uCd,
      dmgBonus: stats.dmgBonus,
      resShred: stats.resShred,
      penRatio: stats.penRatio,
      defShred: stats.defShred,
      dazeVuln: stats.dazeVuln,
      anomalyMastery: stats.anomalyMastery,
      baseHp: stats.baseHp,
      hpPct: stats.hpPct,
      atkPct: stats.atkPct,
      inCombatAtkPct: inAtk,
      inCombatAtkFlat: inFlat,
    },
    weapon: stats.weapon || {},
    field: {
      inCombatAtkPct: 0,
      critRate: field.critRate ?? 0,
      critDmg: field.critDmg ?? 0,
      dmgBonus: (field.dmgBonus ?? 0) + uAdr,
      resShred: field.resShred ?? 0,
      defShred: field.defShred ?? 0,
      dazeVuln: field.dazeVuln ?? 0,
      anomalyMastery: field.anomalyMastery ?? 0,
    },
    boss,
    skill: { multiplier: mult, slot4Type: slot4 },
    extraStats: stats.extraStats || {},
    sup: {},
  } as unknown as CalcInput;
  let dmg = calculateDamage(inp).dmg;
  const bb = scenario.bangboo || {};
  if (bb.enabled && f0(bb.assumption_team_dmg_share_pct) > 0) dmg = dmg * (1 + Number(bb.assumption_team_dmg_share_pct) / 100);
  let stun = f0(action.stun);
  const impact = f0(stats.impact || stats.Impact);
  const th = Number(boss.stun_threshold || boss.stun_max_real || 100);
  const bridge = boss.stun_unit_bridge || {};
  const ib = Number(bridge.impact_bridge || (th > 0 ? th / 100 : 1));
  if (impact <= 0) stun = stun * 100;
  else stun = stun * th * (impact / Math.max(ib, 1e-6));
  if ((kit?.profession ?? '') === 'Stun') stun *= 1 + Number(fb.stun_agent_break_stun_ratio ?? 0);
  return [dmg, stun];
}

function applyBuffBlock(ns: FightState, scenario: DaScenario, ab: Record<string, any>) {
  const dur = Number(ab.duration_s ?? 20);
  const expire = ns.t + dur;
  const ratio = ab.inCombatAtkFlat_from_caster_atk_ratio;
  if (ratio !== null && ratio !== undefined) {
    const flat = soukakuSheetAtk(scenario) * Number(ratio);
    ns.field_buffs = ns.field_buffs.filter((b) => b.key !== 'inCombatAtkFlat');
    ns.field_buffs.push({ key: 'inCombatAtkFlat', value: flat, expire_t: expire });
  }
  if ('inCombatAtkFlat' in ab) {
    ns.field_buffs = ns.field_buffs.filter((b) => b.key !== 'inCombatAtkFlat');
    ns.field_buffs.push({ key: 'inCombatAtkFlat', value: Number(ab.inCombatAtkFlat), expire_t: expire });
  }
  if ('inCombatAtkPct' in ab) ns.field_buffs.push({ key: 'inCombatAtkPct', value: Number(ab.inCombatAtkPct), expire_t: expire });
  if ('dmgBonus' in ab) {
    const v = Number(ab.dmgBonus);
    ns.field_buffs = ns.field_buffs.filter((b) => !(b.key === 'dmgBonus' && b.value === v));
    ns.field_buffs.push({ key: 'dmgBonus', value: v, expire_t: expire });
  }
  if ('resShred' in ab) {
    const v = Number(ab.resShred);
    ns.field_buffs = ns.field_buffs.filter((b) => !(b.key === 'resShred' && Math.abs(b.value - v) < 1e-6));
    ns.field_buffs.push({ key: 'resShred', value: v, expire_t: expire });
  }
  const m6 = f0(ab.cinema_m6_dmgBonus);
  if (m6 && pyInt(scenario.soukaku_mindscape || 0) >= 6) {
    ns.field_buffs = ns.field_buffs.filter((b) => b.key !== 'cinema_m6_dmgBonus');
    ns.field_buffs.push({ key: 'dmgBonus', value: m6, expire_t: expire });
    ns.field_buffs.push({ key: 'cinema_m6_dmgBonus', value: m6, expire_t: expire });
  }
}

function tryPartBreaks(ns: FightState, scenario: DaScenario, dmg: number) {
  const pb = scenario.part_break || {};
  if (!pb.enabled) return;
  const hpMax = Number(scenario.boss.hp_max || scenario.boss.hp_proxy || 1);
  const partHp = hpMax * Number(pb.max_part_hp_ratio ?? 0.1);
  ns.part_damage_accum += dmg * Number(pb.damage_to_part_ratio ?? 0.35);
  while (ns.part_breaks < ns.part_breaks_max && ns.part_damage_accum >= partHp) {
    ns.part_damage_accum -= partHp;
    ns.part_breaks += 1;
    ns.decibel = Math.min(ns.decibel_max, ns.decibel + Number(pb.decibel_on_leg_break ?? 1000));
    ns.boss_stun += ns.boss_stun_threshold * Number(pb.stun_recover_ratio_on_break ?? 0.1);
    const maxSt = pyInt(pb['崩解_max_stacks'] ?? 4);
    if (ns.collapse_stacks < maxSt) {
      ns.collapse_stacks += 1;
      const cd = Number(pb['崩解_crit_dmg_pct_per_stack'] ?? 25);
      const dur = Number(pb['崩解_duration_s'] ?? 20);
      ns.field_buffs = ns.field_buffs.filter((b) => b.key !== 'collapse_crit_dmg');
      ns.field_buffs.push({ key: 'collapse_crit_dmg', value: cd * ns.collapse_stacks, expire_t: ns.t + dur });
    }
  }
}

/** Legality checks of apply_action (no side effects). */
export function isLegal(st: FightState, scenario: DaScenario, kits: Record<string, DaKit>, agentId: string, actionId: string): DaKitAction | null {
  if (st.t >= st.duration) return null;
  const action = kits[agentId].actions.find((a) => a.id === actionId);
  if (!action) return null;
  const ag = st.agents[agentId];
  if (st.t < ag.busy_until) return null;
  if (agentId !== st.active && action.kind !== 'switch') return null;
  if (action.kind === 'switch' && st.t - st.last_switch_t < st.switch_cd_s) return null;
  if (action.needs_flash && ag.flash_charges <= 0) return null;
  if (action.needs_decibel && st.decibel < action.needs_decibel) return null;
  const needMark = pyInt(action.requires_mark_stacks || 0);
  if (needMark && ag.mark_stacks < needMark) return null;
  const cost = f0(action.energy_cost);
  if (cost > 0 && ag.energy < cost) return null;
  return action;
}

export function applyAction(
  st: FightState,
  scenario: DaScenario,
  kits: Record<string, DaKit>,
  agentId: string,
  actionId: string,
  bossEvents: BossEvent[],
): FightState | null {
  const action = isLegal(st, scenario, kits, agentId, actionId);
  if (!action) return null;
  const fb = scenario.field_buffs_from_selectable || {};
  const spRatio = 1 + Number(fb.sp_get_ratio ?? 0);
  const cost = f0(action.energy_cost);
  const ns = cloneState(st);
  const nag = ns.agents[agentId];
  if (agentId !== ns.active) {
    ns.active = agentId;
    ns.last_switch_t = ns.t;
  }
  for (const ev of bossEvents) {
    const pw = ev.parry_window;
    if (!pw) continue;
    if (pw[0] - 0.05 <= ns.t && ns.t <= pw[1] + 0.05) {
      ns.parry_count += 1;
      ns.decibel = Math.min(ns.decibel_max, ns.decibel + 150);
      if (agentId === 'ellen') nag.flash_charges = Math.min(3, nag.flash_charges + 1);
      ns.perfect_assist_count += 1;
      break;
    }
  }
  const [dmg, stun] = evalHit(ns, scenario, kits, agentId, action);
  ns.total_damage += dmg;
  ns.total_stun_applied += stun;
  ns.boss_stun += stun;
  tryPartBreaks(ns, scenario, dmg);
  if (ns.boss_stun >= ns.boss_stun_threshold && ns.boss_stunned_until < ns.t) {
    ns.boss_stunned_until = ns.t + Number(scenario.boss.stun_window_s ?? 12);
    ns.boss_stun = 0;
  }
  if (cost) nag.energy -= cost;
  nag.energy = Math.min(nag.energy_max, nag.energy + f0(action.energy_gain) * spRatio);
  const dec = f0(action.decibel_gain);
  ns.decibel = dec < 0 ? Math.max(0, ns.decibel + dec) : Math.min(ns.decibel_max, ns.decibel + dec);
  if (action.needs_flash) nag.flash_charges -= 1;
  if (agentId === 'ellen') {
    const fr = (kits.ellen || ({} as any)).flash_rules || {};
    if (action.kind === 'ex') nag.flash_charges = Math.min(pyInt(fr.max ?? 3), nag.flash_charges + pyInt(fr.on_ex ?? 0));
  }
  if (action.applies_buff && Object.keys(action.applies_buff).length) applyBuffBlock(ns, scenario, action.applies_buff);
  const cons = pyInt(action.consumes_mark_stacks || 0);
  if (cons) nag.mark_stacks = Math.max(0, nag.mark_stacks - cons);
  const grants = pyInt(action.grants_mark_stacks || 0);
  if (grants) nag.mark_stacks = Math.min(8, nag.mark_stacks + grants);
  const sbKinds: string[] = fb.skill_buff_on_kinds && fb.skill_buff_on_kinds.length ? fb.skill_buff_on_kinds : ['ex'];
  if (sbKinds.includes(action.kind) && fb.skill_buff_dmg_bonus_pct) {
    const dur = Number(fb.skill_buff_duration_s ?? 15);
    ns.field_buffs.push({ key: 'dmgBonus', value: Number(fb.skill_buff_dmg_bonus_pct), expire_t: ns.t + dur });
    if (f0(fb.skill_buff_res_shred_pct) > 0)
      ns.field_buffs.push({ key: 'resShred', value: Number(fb.skill_buff_res_shred_pct ?? 0), expire_t: ns.t + dur });
    ns.field_buffs.push({ key: 'skill_buff_active', value: 1, expire_t: ns.t + dur });
  }
  const dur = Number(action.duration_s ?? 1.0);
  nag.busy_until = ns.t + dur;
  ns.t = ns.t + dur;
  ns.field_buffs = ns.field_buffs.filter((b) => b.expire_t >= ns.t - 0.01);
  if (!ns.field_buffs.some((b) => b.key === 'collapse_crit_dmg')) ns.collapse_stacks = 0;
  ns.log.push({
    t: pyRound(st.t, 3),
    t_end: pyRound(ns.t, 3),
    agent: agentId,
    action: actionId,
    label: action.label,
    dmg: pyRound(dmg, 1),
    stun: pyRound(stun, 3),
    decibel: pyRound(ns.decibel, 1),
    energy: pyRound(nag.energy, 1),
    boss_stunned: inStun(ns) || ns.boss_stunned_until > st.t,
    total_dmg: pyRound(ns.total_damage, 1),
    part_breaks: ns.part_breaks,
    collapse_stacks: ns.collapse_stacks,
  });
  return ns;
}

export function legalActions(st: FightState, scenario: DaScenario, kits: Record<string, DaKit>): [string, string][] {
  const out: [string, string][] = [];
  if (st.t >= st.duration) return out;
  const active = st.active;
  for (const a of kits[active].actions) {
    if (a.kind === 'switch') continue;
    if (isLegal(st, scenario, kits, active, a.id)) out.push([active, a.id]);
  }
  for (const aid of scenario.team) {
    if (aid === active) continue;
    for (const a of kits[aid].actions) {
      if (a.kind !== 'switch') continue;
      if (st.agents[aid].busy_until > st.t + 0.05) continue;
      if (isLegal(st, scenario, kits, aid, a.id)) out.push([aid, a.id]);
    }
  }
  return out;
}
