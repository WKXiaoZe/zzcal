// Port of da-sim sim/build_optimizer.py (zzcal-parity greedy gear optimizer, budget 36).
// Reuses the repo's runGreedyOptimization (src/calc/optimizer.ts) + calculateDamage.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CHARACTER_DB, WEAPON_DB, DISC_4_SETS, DISC_2_SETS } from '../db';
import { runGreedyOptimization, type Set2Option, type Slot5Option } from '../optimizer';
import type { CalcInput } from '../types';
import { f0, pyInt, pyRound } from './pyCompat';
import type { DaScenario } from './types';

export const BUDGET_DEFAULT = 36;

export const DEFAULT_ROLE_CONFIG: Record<string, Record<string, any>> = {
  ellen: {
    zzcal_char: '艾莲·乔Ⅵ', mindscape: 0, weapon: '深海访客', weapon_refine: 5, battleType: 'attack',
    slot4Type: 'critRate', set4_candidates: ['woodpecker', 'jidi', 'fuxiao', 'zhezhi'],
    set2_extra_candidates: ['jidi', 'jisu', 'qiutu', 'ruying'], energy_start: 40, energy_max: 120,
  },
  qingyi: {
    zzcal_char: '青衣', mindscape: 0, weapon: '玉壶青冰', weapon_refine: 5, battleType: 'break',
    slot4Type: 'critRate', set4_candidates: ['mountain', 'zhenxing', 'jisu', 'woodpecker'],
    set2_extra_candidates: ['jisu', 'jiayin', 'mountain'], energy_start: 60, energy_max: 120,
  },
  soukaku: {
    zzcal_char: '苍角', mindscape: 6, weapon: '啜泣摇篮', weapon_refine: 5, battleType: 'attack',
    slot4Type: 'atk', set4_candidates: ['jisu', 'woodpecker', 'jiayin'],
    set2_extra_candidates: ['jisu', 'jiayin', 'jidi'], energy_start: 80, energy_max: 120,
  },
  anby: {
    zzcal_char: '安比', mindscape: 0, weapon: '燃狱齿轮', weapon_refine: 5, battleType: 'break',
    slot4Type: 'critRate', set4_candidates: ['zhenxing', 'mountain', 'jisu'],
    set2_extra_candidates: ['jisu', 'mountain'], energy_start: 60, energy_max: 120,
  },
  anby_s0: {
    zzcal_char: '安比', mindscape: 0, weapon: '牺牲洁纯', weapon_refine: 5, battleType: 'break',
    slot4Type: 'critRate', set4_candidates: ['zhenxing', 'mountain', 'jisu'],
    set2_extra_candidates: ['jisu', 'mountain'], energy_start: 60, energy_max: 120,
  },
  caesar: {
    zzcal_char: '凯撒', mindscape: 0, weapon: '奔袭獠牙', weapon_refine: 5, battleType: 'break',
    slot4Type: 'critRate', set4_candidates: ['jisu', 'woodpecker', 'mountain'],
    set2_extra_candidates: ['jisu', 'jiayin', 'mountain'], energy_start: 60, energy_max: 120,
    slot6_impact: true,
  },
};

const AGENT_FIELDS = [
  'baseAtk', 'critRate', 'critDmg', 'dmgBonus', 'penRatio', 'penValue', 'defShred', 'dazeVuln', 'resShred',
  'inCombatAtkPct', 'inCombatAtkFlat', 'baseHp', 'hpPct', 'flatHp', 'inCombatHpPct', 'inCombatPen',
  'ppDmgBonus', 'anomalyMastery', 'atkPct',
];
const WEAPON_FIELDS = [
  'baseAtk', 'critRate', 'critDmg', 'atkPct', 'penRatio', 'penRate', 'defShred', 'resShred', 'dmgBonus',
  'inCombatAtkPct', 'inCombatAtkFlat', 'baseHp', 'hpPct', 'flatHp', 'inCombatHpPct', 'inCombatPen',
  'ppDmgBonus', 'anomalyMastery', 'impactPct',
];
const BREAK_STUN_BASE: Record<string, number> = {
  ellen: 93, qingyi: 118, soukaku: 86, anby: 118, anby_s0: 118, caesar: 105,
};
const SLOT6_IMPACT_PCT = 18;

function parseParts(val: any): number[] | number {
  if (typeof val === 'number') return val;
  if (Array.isArray(val)) return val.map((x) => f0(x));
  if (typeof val === 'string' && val.includes('/')) return val.split('/').map((x) => f0(x === '' ? 0 : Number(x)));
  const v = Number(val);
  return val !== null && val !== undefined && val !== '' && Number.isFinite(v) ? v : 0;
}

function parseAgentValue(val: any, cinema: number): number {
  const p = parseParts(val);
  if (typeof p === 'number') return p;
  let s = p.length ? p[0] : 0;
  if (cinema >= 1 && p.length > 1) s += p[1];
  if (cinema >= 2 && p.length > 2) s += p[2];
  if (cinema >= 4 && p.length > 3) s += p[3];
  if (cinema >= 6 && p.length > 4) s += p[4];
  return s;
}

function parseWeaponValue(val: any, refine: number): number {
  const p = parseParts(val);
  if (typeof p === 'number') return p;
  if (!p.length) return 0;
  return p[Math.max(0, Math.min(p.length - 1, refine - 1))];
}

function resolveCharacter(name: string, mindscape: number): Record<string, number> {
  const db: any = CHARACTER_DB;
  const entry = (db.characters || {})[name] || (db.sup || {})[name];
  if (!entry) throw new Error(`zzcal CHARACTER_DB missing: ${name}`);
  const out: Record<string, number> = {};
  for (const f of AGENT_FIELDS) out[f] = f in entry ? parseAgentValue(entry[f], mindscape) : 0;
  return out;
}

function resolveWeapon(
  ext: Record<string, any>,
  name: string,
  refine: number,
): [Record<string, number>, Record<string, any>] {
  const wdb: any = WEAPON_DB;
  const zz = wdb[name];
  const wx = ext[name];
  let entry = zz || wx;
  const meta: Record<string, any> = { name, refine, from_zzcal: name in wdb };
  if (!entry) throw new Error(`weapon missing in zzcal + weapons_ext: ${name}`);
  if (wx) {
    meta.from_weapons_ext = true;
    meta.source = (wx.meta || {}).source;
    meta.fallback = !!(wx.meta || {}).fallback;
    if (wx.passive) meta.passive = wx.passive;
    if (wx.note) meta.note = wx.note;
    if (!zz) entry = wx;
    else {
      const merged: any = { ...zz };
      for (const [k, v] of Object.entries(wx)) {
        if (k === 'meta' || k === 'passive' || k === 'note') continue;
        if (!(k in merged)) merged[k] = v;
      }
      entry = merged;
    }
  } else if (!(name in wdb)) {
    meta.fallback = true;
  }
  let out: Record<string, number> = {};
  for (const f of WEAPON_FIELDS) out[f] = f in entry ? parseWeaponValue(entry[f], refine) : 0;
  if (out.penRate && !out.penRatio) out.penRatio = out.penRate;
  out = Object.fromEntries(Object.entries(out).filter(([, v]) => v));
  if (!('baseAtk' in out)) out.baseAtk = parseWeaponValue(entry.baseAtk ?? 0, refine);
  return [out, meta];
}

function computeImpact(agentId: string, weapon: Record<string, number>, meta: Record<string, any>, slot6: boolean) {
  const base = BREAK_STUN_BASE[agentId] ?? 100;
  let pct = f0(weapon.impactPct);
  if (slot6) pct += SLOT6_IMPACT_PCT;
  const passive = meta.passive || {};
  if ('assumption_stacks_for_stun' in passive && 'tea_impact_per_stack' in passive) {
    const idx = Math.max(0, Math.min(4, pyInt(meta.refine || 5) - 1));
    const per = passive.tea_impact_per_stack;
    const perV = Array.isArray(per) ? per[idx] : Number(per);
    pct += perV * Number(passive.assumption_stacks_for_stun);
  }
  if ('assumption_impact_passive_pct' in passive) pct += Number(passive.assumption_impact_passive_pct);
  const impact = base * (1 + pct / 100);
  return {
    impact_base_break_stun: base,
    impact_pct_total: pyRound(pct, 4),
    impact: pyRound(impact, 4),
    slot6_impact: slot6,
  };
}

const SET2_MAP: Record<string, string> = {
  atkPct: 'set2_AtkPct', hpPct: 'set2_HpPct', dmgBonus: 'set2_Dmg', penRatio: 'set2_Pen', critDmg: 'set2_CD',
};

function foldSet2IntoExtra(extra: Record<string, number>, st: Record<string, number>) {
  for (const [k, v] of Object.entries(st)) {
    if (k in SET2_MAP) extra[SET2_MAP[k]] = (extra[SET2_MAP[k]] ?? 0) + Number(v);
    else if (k === 'critRate' || k === 'anomalyMastery') extra[k] = (extra[k] ?? 0) + Number(v);
  }
}

function defaultSlot5(bt: string): Slot5Option[] {
  if (bt === 'break')
    return [
      { val: { slot5_AtkPct: 30 }, name: '5号位:攻击' },
      { val: { slot5_Dmg: 30 }, name: '5号位:增伤' },
      { val: { slot5_HpPct: 30 }, name: '5号位:生命' },
    ];
  return [
    { val: { slot5_AtkPct: 30 }, name: '5号位:攻击' },
    { val: { slot5_Dmg: 30 }, name: '5号位:增伤' },
    { val: { slot5_Pen: 24 }, name: '5号位:穿透' },
  ];
}

type Set2Opt = Set2Option & { set2_key: string | null };

function set2OptsFromKeys(bt: string, keys: string[]): Set2Opt[] {
  const d2: any = DISC_2_SETS;
  const opts: Set2Opt[] = [];
  const seen = new Set<string>();
  for (const k of keys) {
    const st = (d2[k] || {}).stats || {};
    const name = (d2[k] || {}).name || k;
    let val: Record<string, number> = {};
    if ('atkPct' in st) val.set2_AtkPct = Number(st.atkPct);
    if ('hpPct' in st) val.set2_HpPct = Number(st.hpPct);
    if ('dmgBonus' in st) val.set2_Dmg = Number(st.dmgBonus);
    if ('penRatio' in st) val.set2_Pen = Number(st.penRatio);
    if ('critDmg' in st) val.set2_CD = Number(st.critDmg);
    if ('critRate' in st) val.critRate = Number(st.critRate);
    if ('anomalyMastery' in st) val.anomalyMastery = Number(st.anomalyMastery);
    if (!Object.keys(val).length && bt === 'break') val = { set2_AtkPct: 0 };
    const key = name + '|' + JSON.stringify(Object.entries(val).sort());
    if (seen.has(key)) continue;
    seen.add(key);
    opts.push({ val, name: `2件套:${name}`, set2_key: k });
  }
  if (!opts.length) {
    if (bt === 'break')
      return [
        { val: { set2_Dmg: 10 }, name: '2件套:增伤', set2_key: null },
        { val: { set2_Pen: 8 }, name: '2件套:穿透', set2_key: null },
        { val: { set2_HpPct: 10 }, name: '2件套:生命', set2_key: null },
        { val: { set2_CD: 16 }, name: '2件套:爆伤', set2_key: null },
      ];
    return [
      { val: { set2_AtkPct: 10 }, name: '2件套:攻击', set2_key: null },
      { val: { set2_Dmg: 10 }, name: '2件套:增伤', set2_key: null },
      { val: { set2_Pen: 8 }, name: '2件套:穿透', set2_key: null },
      { val: { set2_CD: 16 }, name: '2件套:爆伤', set2_key: null },
    ];
  }
  return opts;
}

const roundNonZero = (o: Record<string, any>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => Number(v)).map(([k, v]) => [k, pyRound(Number(v), 4)]));

export function optimizeAgent(
  agentId: string,
  boss: Record<string, any>,
  weaponsExt: Record<string, any>,
  cfg?: Record<string, any> | null,
  budget = BUDGET_DEFAULT,
): Record<string, any> {
  const baseCfg: Record<string, any> = JSON.parse(JSON.stringify(DEFAULT_ROLE_CONFIG[agentId] || {}));
  if (!Object.keys(baseCfg).length) throw new Error(`no DEFAULT_ROLE_CONFIG for agent ${agentId}`);
  if (cfg) for (const [k, v] of Object.entries(cfg)) if (v !== null && v !== undefined) baseCfg[k] = v;

  const mindscape = pyInt(baseCfg.mindscape ?? 0);
  const refine = pyInt(baseCfg.weapon_refine ?? 5);
  const bt: string = baseCfg.battleType ?? 'attack';
  const slot4: string = baseCfg.slot4Type ?? 'critRate';
  const set4Cands: string[] = baseCfg.set4_candidates?.length ? [...baseCfg.set4_candidates] : ['woodpecker'];
  const set2Extra: string[] = baseCfg.set2_extra_candidates?.length ? [...baseCfg.set2_extra_candidates] : ['jisu'];

  const agent = resolveCharacter(baseCfg.zzcal_char, mindscape);
  const [weapon, weaponMeta] = resolveWeapon(weaponsExt, baseCfg.weapon, refine);
  const bossIn = {
    defBase: Number(boss.defBase ?? 952.8),
    defBonus: Number(boss.defBonus ?? 0),
    res: Number(boss.res ?? 0.2),
    weak: Boolean(boss.weak ?? true),
    dazeBase: Number(boss.dazeBase ?? 100),
  };
  const d4: any = DISC_4_SETS;
  const d2: any = DISC_2_SETS;
  const gaps: string[] = [];
  if (weaponMeta.fallback) gaps.push(`weapon:${baseCfg.weapon} FALLBACK`);
  let best: Record<string, any> | null = null;

  for (const s4 of set4Cands) {
    if (!(s4 in d4)) {
      gaps.push(`set4 missing:${s4}`);
      continue;
    }
    const s4Stats: Record<string, number> = { ...(d4[s4].stats || {}) };
    const agentS4: Record<string, number> = { ...agent };
    for (const [k, v] of Object.entries(s4Stats)) agentS4[k] = Number(agentS4[k] ?? 0) + Number(v);
    const baselineExtra: Record<string, number> = {};
    foldSet2IntoExtra(baselineExtra, (d2[s4] || {}).stats || {});
    const set2Opts = set2OptsFromKeys(bt, set2Extra.filter((k) => k !== s4));
    const slot5Opts = defaultSlot5(bt);
    const baseInput = {
      battleType: bt,
      agent: agentS4,
      weapon,
      sup: {},
      field: {},
      boss: bossIn,
      skill: { slot4Type: slot4, multiplier: 100 },
      extraStats: baselineExtra,
    } as unknown as CalcInput;
    const res = runGreedyOptimization(baseInput, { slot5Opts, set2Opts, budget });
    const ranked = res
      .map((r, i) => {
        const last = r.history[r.history.length - 1];
        return {
          name: r.name,
          slot5: slot5Opts[Math.floor(i / set2Opts.length)],
          set2: set2Opts[i % set2Opts.length],
          final_stats: last.stats as Record<string, number>,
          counts: last.counts,
          dmg: last.dmg,
        };
      })
      .sort((a, b) => b.dmg - a.dmg);
    if (!ranked.length) continue;
    const top = ranked[0];
    const finalExtra = roundNonZero({ ...baselineExtra, ...top.final_stats });
    const cand = {
      agent_id: agentId,
      zzcal_char: baseCfg.zzcal_char,
      mindscape,
      weapon_name: baseCfg.weapon,
      weapon_refine: refine,
      weapon_meta: weaponMeta,
      battleType: bt,
      slot4Type: slot4,
      set4_key: s4,
      set4_name: d4[s4].name,
      set2_key: top.set2.set2_key,
      set2_name: top.set2.name,
      slot5_name: top.slot5.name,
      optimizer_dmg: top.dmg,
      substat_counts: top.counts,
      agent: roundNonZero(agentS4),
      weapon: roundNonZero(weapon),
      extraStats: finalExtra,
      energy_start: baseCfg.energy_start ?? 40,
      energy_max: baseCfg.energy_max ?? 120,
      config_name: `${d4[s4].name}/${top.name}`,
    };
    if (!best || cand.optimizer_dmg > best.optimizer_dmg) best = cand;
  }
  if (!best) throw new Error(`optimize_agent failed for ${agentId}; gaps=${gaps}`);
  const ag = best.agent;
  const panel: Record<string, any> = {
    battleType: best.battleType === 'break' ? 'attack' : best.battleType,
    optimizer_battleType: best.battleType,
    baseAtk: ag.baseAtk ?? 0,
    critRate: ag.critRate ?? 5,
    critDmg: ag.critDmg ?? 50,
    dmgBonus: ag.dmgBonus ?? 0,
    resShred: ag.resShred ?? 0,
    penRatio: ag.penRatio ?? 0,
    defShred: ag.defShred ?? 0,
    dazeVuln: ag.dazeVuln ?? 0,
    anomalyMastery: ag.anomalyMastery ?? 0,
    baseHp: ag.baseHp ?? 0,
    hpPct: ag.hpPct ?? 0,
    inCombatAtkPct: ag.inCombatAtkPct ?? 0,
    weapon: best.weapon,
    extraStats: best.extraStats,
    energy_start: best.energy_start,
    energy_max: best.energy_max,
    build: {
      source: 'zzcal_greedy',
      zzcal_char: best.zzcal_char,
      mindscape: best.mindscape,
      weapon_name: best.weapon_name,
      weapon_refine: best.weapon_refine,
      weapon_meta: best.weapon_meta,
      set4_key: best.set4_key,
      set4_name: best.set4_name,
      set2_key: best.set2_key,
      set2_name: best.set2_name,
      slot5: best.slot5_name,
      slot4Type: best.slot4Type,
      substat_counts: best.substat_counts,
      optimizer_dmg: pyRound(best.optimizer_dmg, 2),
      config_name: best.config_name,
      budget,
      gaps,
    },
  };
  if ('atkPct' in best.weapon && !('atkPct' in panel)) panel.atkPct = 0;
  let slot6 = best.battleType === 'break';
  if (baseCfg.slot6_impact !== null && baseCfg.slot6_impact !== undefined) slot6 = Boolean(baseCfg.slot6_impact);
  const imp = computeImpact(agentId, best.weapon, best.weapon_meta, slot6);
  panel.impact = imp.impact;
  panel.impact_detail = imp;
  panel.build.impact_detail = imp;
  const pas = best.weapon_meta.passive || {};
  if (
    pas.assumption_team_dmg ||
    pas.assumption_team_dmg_pct ||
    pas.pass_a_sourced ||
    'team_dmg_max_pct' in pas ||
    'team_dmg_at_15' in pas
  )
    panel.build.weapon_team_dmg_assumption = pas;
  return panel;
}

export function optimizeTeam(
  team: string[],
  boss: Record<string, any>,
  weaponsExt: Record<string, any>,
  overrides: Record<string, any> = {},
  budget = BUDGET_DEFAULT,
): Record<string, any> {
  const out: Record<string, any> = { schema: 'da-sim-build-v1', source: 'web port of sim/build_optimizer.py', agents: {}, gaps: [] };
  for (const aid of team) {
    const panel = optimizeAgent(aid, boss, weaponsExt, overrides[aid], budget);
    out.agents[aid] = panel;
    for (const g of panel.build?.gaps || []) if (!out.gaps.includes(g)) out.gaps.push(g);
  }
  return out;
}

function panelToAgentStats(panel: Record<string, any>, impact: any): Record<string, any> {
  const stats: Record<string, any> = {
    battleType: panel.battleType ?? 'attack',
    baseAtk: panel.baseAtk,
    weapon: panel.weapon || {},
    critRate: panel.critRate,
    critDmg: panel.critDmg,
    dmgBonus: panel.dmgBonus,
    resShred: panel.resShred,
    penRatio: panel.penRatio,
    defShred: panel.defShred,
    dazeVuln: panel.dazeVuln,
    anomalyMastery: panel.anomalyMastery,
    extraStats: panel.extraStats || {},
    energy_max: panel.energy_max ?? 120,
    energy_start: panel.energy_start ?? 40,
    build: panel.build,
  };
  if (panel.atkPct) stats.atkPct = panel.atkPct;
  if (panel.inCombatAtkPct) stats.inCombatAtkPct = panel.inCombatAtkPct;
  else if ((panel.agent || {}).inCombatAtkPct) stats.inCombatAtkPct = panel.agent.inCombatAtkPct;
  if (panel.baseHp) stats.baseHp = panel.baseHp;
  if (impact !== null && impact !== undefined) stats.impact = impact;
  else if ('impact' in panel) stats.impact = panel.impact;
  return stats;
}

export function applyBuildsToScenario(scenario: DaScenario, builds: Record<string, any>): DaScenario {
  const sc: DaScenario = JSON.parse(JSON.stringify(scenario));
  const agents = builds.agents || builds;
  for (const aid of sc.team || []) {
    if (!(aid in agents)) continue;
    const panel = agents[aid];
    const old = (sc.agent_stats || {})[aid] || {};
    const impact = panel.impact !== null && panel.impact !== undefined ? panel.impact : old.impact;
    sc.agent_stats = sc.agent_stats || {};
    sc.agent_stats[aid] = panelToAgentStats(panel, impact);
    if (panel.impact_detail) sc.agent_stats[aid].impact_detail = panel.impact_detail;
  }
  return sc;
}

/** Python load_scenario(build_mode). */
export function prepareScenario(
  scenario: DaScenario,
  mode: 'auto' | 'file' | 'none',
  weaponsExt: Record<string, any>,
  buildsFile?: Record<string, any> | null,
  budget = BUDGET_DEFAULT,
): { scenario: DaScenario; builds: Record<string, any> | null } {
  if (mode === 'none') return { scenario, builds: null };
  let builds: Record<string, any>;
  if (mode === 'file') {
    if (!buildsFile) throw new Error('build=file 需要 builds JSON');
    builds = buildsFile;
  } else {
    let overrides: Record<string, any> = scenario.build_overrides || {};
    if (scenario.team.includes('soukaku') && 'soukaku_mindscape' in scenario) {
      overrides = { ...overrides, soukaku: { ...(overrides.soukaku || {}), mindscape: pyInt(scenario.soukaku_mindscape) } };
    }
    builds = optimizeTeam(scenario.team, scenario.boss, weaponsExt, overrides, budget);
  }
  return { scenario: applyBuildsToScenario(scenario, builds), builds };
}
