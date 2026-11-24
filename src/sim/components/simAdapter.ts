// src/sim/components/simAdapter.ts
// 排轴结果统一归一化、泳道甘特提取、四大图表聚合与单招 15 乘区透视计算器

import type {
  MacroAction,
  PresetIndexItem,
  SearchResultData,
  SimEngine,
  StepRow,
  SunOverviewBundle,
} from '../types';

export type ActionVisualCat = 'ult' | 'ex' | 'chain' | 'parry' | 'offfield' | 'basic';

export const ACTION_CAT_META: Record<
  ActionVisualCat,
  { label: string; color: string; bg: string; textColor: string }
> = {
  ult: {
    label: '终结技 / 引爆大招',
    color: '#ff4d8d',
    bg: 'linear-gradient(135deg, #ff4d8d 0%, #ffb703 100%)',
    textColor: '#09090b',
  },
  ex: {
    label: '强化特殊技 / 蓄力',
    color: '#ff7b39',
    bg: 'linear-gradient(135deg, #ff6b35 0%, #f79d65 100%)',
    textColor: '#09090b',
  },
  chain: {
    label: '连携技 / 快速支援',
    color: '#00d4ff',
    bg: 'linear-gradient(135deg, #00b4d8 0%, #72efdd 100%)',
    textColor: '#09090b',
  },
  parry: {
    label: '弹刀招架 / 角力反制',
    color: '#2ec4b6',
    bg: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)',
    textColor: '#09090b',
  },
  offfield: {
    label: '后台追击 / 0帧结算',
    color: '#c084fc',
    bg: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
    textColor: '#ffffff',
  },
  basic: {
    label: '普攻 / 驻场衔接',
    color: '#94a3b8',
    bg: 'linear-gradient(135deg, #64748b 0%, #cbd5e1 100%)',
    textColor: '#09090b',
  },
};

export interface SwimlaneActionItem {
  rowIdx: number;
  sid: number;
  slotIndex: 0 | 1 | 2 | 3 | 4;
  actorName: string;
  shortLabel: string;
  fullLabel: string;
  cat: ActionVisualCat;
  cancelMode: string;
  isSwapCancel: boolean;
  isZeroFrame: boolean;
  tStart: number;
  tEnd: number;
  deltaF: number;
  directDmg: number;
  detonatedDmg: number;
  anomDmg: number;
  totalDmg: number;
  vbAdded: number;
  inStun: boolean;
}

export interface BossPhaseSegment {
  kind: 'stun' | 'miasma' | 'invuln' | 'normal';
  index?: number;
  label: string;
  tStart: number;
  tEnd: number;
  durationS: number;
  windowDmg: number;
}

export interface BuffCoverageSegment {
  tStart: number;
  tEnd: number;
}

export interface BuffCoverageTrack {
  id: string;
  label: string;
  color: string;
  uptimePct: number;
  inStunUptimePct: number;
  segments: BuffCoverageSegment[];
}

export interface MultiplierCell {
  idx: number;
  name: string;
  valueStr: string;
  formulaHint: string;
  highlighted?: boolean;
}

export interface SunActionSpecMeta {
  sid: number;
  key: string;
  actor: string;
  elem: string;
  cat: string;
  dmg1: number;
  dgrow: number;
  stun1: number;
  sgrow: number;
  tot_f: number;
  can_f: number;
  swap_f: number;
  halt_f: number;
  hw: string;
  def_mode: number;
  vb_rule: number;
  detonator: number;
  note: string;
}

export interface StepInspectionDetail {
  rowIdx: number;
  row: StepRow;
  actorName: string;
  slotIndex: number;
  cat: ActionVisualCat;
  directDmg: number;
  detonatedDmg: number;
  anomDisorderDmg: number;
  vbAdded: number;
  vbPoolAfter: number;
  totalDmg: number;
  frameInfo: {
    deltaF: number;
    swapF: number | null;
    canF: number | null;
    totF: number | null;
    haltF: number | null;
    hwText: string;
    note: string;
  };
  multipliers15: MultiplierCell[];
  activeBuffPills: string[];
  resources: Array<{ label: string; val: number; max: number; color: string; unit?: string }>;
}

export interface NormalizedSimView {
  engine: SimEngine;
  version: string;
  bossName: string;
  bossMode: string;
  shorthand: string;
  detailLabel: string;
  limitedGold: number;
  totalSeconds: number;
  totalFrames: number;
  totalDmg: number;
  dps: number;
  directDmg: number;
  detonatedDmg: number;
  anomDisorderDmg: number;
  stageMechDmg: number;
  killed: boolean;
  killTimeS: number | null;
  daDmgScore: number;
  daPerfScore: number;
  daTotalScore: number;
  stunCount: number;
  ultCount: number;
  rhythmTag: string;
  swapCancelCount: number;
  ubMaxDmg: number | null;
  ubMinKillS: number | null;
  ubGapPct: number | null;
  ubAchievedPct: number | null;
  agentNames: [string, string, string];
  bangbooName: string;
  mainDecibelCap: number;
  fieldOccupancy: {
    overallS: [number, number, number];
    overallPct: [number, number, number];
    preStunS: [number, number, number];
    inStunS: [number, number, number];
    sanityOk: boolean;
  };
  swimlaneItems: SwimlaneActionItem[];
  bossPhases: BossPhaseSegment[];
  buffTracks: BuffCoverageTrack[];
  timeSeries: {
    labelsS: number[];
    cumDmgM: number[];
    burstDpsW: number[];
    resourceMain: number[];
    resourceDecibelMain: number[];
    dazeCyclePct: number[];
  };
  actorDmgTotals: Array<{ name: string; dmg: number; pct: number; color: string }>;
  inStunDmg: number;
  preStunDmg: number;
}

export function formatDamageCompact(val: number): string {
  if (!Number.isFinite(val)) return '0';
  const abs = Math.abs(val);
  if (abs >= 1e8) {
    return `${(val / 1e8).toFixed(3)}亿`;
  }
  if (abs >= 1e4) {
    return `${(val / 1e4).toFixed(1)}万`;
  }
  return Math.round(val).toLocaleString();
}

export function formatDpsCompact(val: number): string {
  if (!Number.isFinite(val)) return '0/s';
  if (Math.abs(val) >= 1e4) {
    return `${(val / 1e4).toFixed(2)}万/s`;
  }
  return `${Math.round(val).toLocaleString()}/s`;
}

export function formatMacroChip(macro: MacroAction): string {
  if (typeof macro === 'string') return macro;
  if (macro && typeof macro === 'object') {
    const keys = Object.keys(macro);
    if (keys.length === 1) {
      const k = keys[0];
      const inner = (macro as Record<string, unknown>)[k];
      if (inner && typeof inner === 'object') {
        const flags = Object.entries(inner as Record<string, unknown>)
          .map(([fk, fv]) => {
            if (fk === 'swap_cancel' || fk === 'swap_cancel_end') {
              return fv ? '合轴' : '驻场';
            }
            if (fk === 'spin_half_secs') {
              return `${Number(fv) * 0.5}s`;
            }
            return `${fk}:${String(fv)}`;
          })
          .join('·');
        return `${k}(${flags})`;
      }
      return k;
    }
  }
  return JSON.stringify(macro);
}

function cleanActionShortLabel(rawKey: string): string {
  // 去掉前缀表情与角色名以在紧凑色块中显示招式精髓
  let s = rawKey
    .replace(/^[🔥🌪️🎵💤❄️⚡🟣🛡️]+\s*/, '')
    .replace(/^(挽昼|洛克茜|知更鸟|梦游布)[｜|_:\s]*/, '')
    .replace(/^P[12][^·]*·/, '');
  const bracketMatch = s.match(/\[([^\]]+)\]/);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1];
  }
  if (s.length > 14) {
    s = s.slice(0, 14);
  }
  return s || rawKey;
}

function classifyStepCat(row: StepRow): ActionVisualCat {
  const key = row.action_key || '';
  const cat = row.cat || '';
  const sid = row.sid || 0;

  if (
    cat.includes('终结技') ||
    key.includes('终结技') ||
    key.includes('长暗终焉') ||
    key.includes('大招') ||
    /\bUlt/i.test(key) ||
    sid === 1601111 ||
    sid === 1601112 ||
    sid === 1621011 ||
    sid === 1661011
  ) {
    return 'ult';
  }
  if (
    row.delta_f === 0 &&
    (row.cancel_mode?.includes('后台') ||
      key.includes('后台') ||
      key.includes('余震') ||
      key.includes('梦游布') ||
      key.includes('爆鸣') ||
      sid >= 5000000)
  ) {
    return 'offfield';
  }
  if (
    cat.includes('招架') ||
    cat.includes('突击') ||
    cat.includes('反制') ||
    key.includes('招架') ||
    key.includes('弹刀') ||
    key.includes('角力') ||
    key.includes('支援突击') ||
    key.includes('反制') ||
    /Parry|DefensiveAssist|AssistFollowUp/i.test(key)
  ) {
    return 'parry';
  }
  if (
    cat.includes('连携') ||
    cat.includes('快速支援') ||
    key.includes('连携') ||
    key.includes('快速支援') ||
    /Chain|QuickAssist/i.test(key)
  ) {
    return 'chain';
  }
  if (
    cat.includes('特殊技') ||
    cat.includes('蓄力') ||
    key.includes('强化E') ||
    key.includes('特殊技') ||
    key.includes('蓄力斩') ||
    key.includes('龙卷') ||
    key.includes('旗令') ||
    /\bEX_/i.test(key)
  ) {
    return 'ex';
  }
  if (row.delta_f === 0) {
    return 'offfield';
  }
  return 'basic';
}

function resolveStepSlot(
  row: StepRow,
  engine: SimEngine,
  agentNames: [string, string, string],
  bangbooName?: string,
): { slotIndex: 0 | 1 | 2 | 3 | 4; actorName: string } {
  const key = row.action_key || '';
  const sid = row.sid || 0;

  if (
    row.actor_slot === 4 ||
    row.stream_kind === 'TrueDmg' ||
    sid >= 9000000 ||
    sid === 4900099 ||
    row.actor?.includes('场地') ||
    key.includes('场地机制') ||
    key.includes('生命真伤') ||
    key.includes('秽盾击破')
  ) {
    return { slotIndex: 4, actorName: '场地/机制真伤' };
  }

  if (typeof row.actor_slot === 'number' && row.actor_slot >= 0 && row.actor_slot <= 2) {
    const slot = row.actor_slot as 0 | 1 | 2;
    return { slotIndex: slot, actorName: row.actor || agentNames[slot] };
  }

  if (row.actor_slot === 3) {
    return {
      slotIndex: 3,
      actorName: row.actor || bangbooName || (engine === 'sun344' ? '梦游布' : '协战邦布'),
    };
  }

  if (row.actor) {
    const idx = agentNames.findIndex((n) => n && row.actor!.includes(n));
    if (idx >= 0 && idx <= 2) {
      return { slotIndex: idx as 0 | 1 | 2, actorName: agentNames[idx] };
    }
    return { slotIndex: 3, actorName: row.actor };
  }

  if (engine === 'sun344') {
    if (key.includes('挽昼') || (sid >= 1601000 && sid < 1602000)) {
      return { slotIndex: 0, actorName: '挽昼' };
    }
    if (key.includes('洛克茜') || (sid >= 1621000 && sid < 1622000)) {
      return { slotIndex: 1, actorName: '洛克茜' };
    }
    if (key.includes('知更鸟') || (sid >= 1661000 && sid < 1662000)) {
      return { slotIndex: 2, actorName: '知更鸟' };
    }
    return { slotIndex: 3, actorName: bangbooName || '梦游布' };
  }

  for (let i = 0; i < 3; i++) {
    if (agentNames[i] && key.includes(agentNames[i])) {
      return { slotIndex: i as 0 | 1 | 2, actorName: agentNames[i] };
    }
  }
  return { slotIndex: 3, actorName: bangbooName || '协战邦布' };
}

function isRowInStun(row: StepRow): boolean {
  const s = row.stun_str || '';
  return (
    s.includes('★') ||
    (s.includes('失衡') && !s.includes('打条') && !s.includes('常态') && !s.includes('前'))
  );
}

function classifyBossPhase(row: StepRow): 'stun' | 'miasma' | 'invuln' | 'normal' {
  if (isRowInStun(row)) return 'stun';
  const s = row.stun_str || '';
  if (row.miasma_shield_on || s.includes('秽盾') || s.includes('壁垒') || s.includes('紫盾')) {
    return 'miasma';
  }
  if (s.includes('无敌') || s.includes('转场') || s.includes('祭坛') || s.includes('角力')) {
    return 'invuln';
  }
  return 'normal';
}

function countMainUlts(data: SearchResultData, engine: SimEngine): number {
  if (typeof data.ult_count === 'number' && data.ult_count > 0) {
    return data.ult_count;
  }
  // 优先从 macros 统计主C喧响大招
  if (Array.isArray(data.macros) && data.macros.length > 0) {
    if (engine === 'sun344') {
      const mCount = data.macros.filter((m) =>
        typeof m === 'string'
          ? m === 'SunUlt1'
          : Boolean((m as Record<string, unknown>)?.SunUlt1),
      ).length;
      if (mCount > 0) return mCount;
    } else {
      const uCount = data.macros.filter(
        (m) => typeof m === 'string' && /^S0:.*Ult/i.test(m) && !/Ult2|Detonate/i.test(m),
      ).length;
      if (uCount > 0) return uCount;
    }
  }
  // 回退从 rows 统计
  let count = 0;
  for (const r of data.rows || []) {
    if (engine === 'sun344') {
      if (r.sid === 1601111 || (r.action_key?.includes('挽昼') && r.action_key?.includes('终结技') && !r.action_key?.includes('二段'))) {
        count++;
      }
    } else if (r.actor_slot === 0 && (r.cat === '终结技' || /\bUlt1?\b/i.test(r.action_key || ''))) {
      count++;
    }
  }
  return count;
}

export function normalizeSimResult(
  data: SearchResultData,
  presetMeta?: PresetIndexItem | null,
  overview?: SunOverviewBundle | null,
): NormalizedSimView {
  const engine: SimEngine =
    data.engine ||
    presetMeta?.engine ||
    (Array.isArray(data.agent_names) && data.agent_names.length === 3 && data.team_id
      ? 'uni344'
      : 'sun344');

  const agentNames: [string, string, string] =
    data.agent_names && data.agent_names.length === 3
      ? data.agent_names
      : presetMeta?.agentNames && presetMeta.agentNames.length === 3
        ? presetMeta.agentNames
        : ['挽昼', '洛克茜', '知更鸟'];

  const bangbooName =
    data.bangboo_name || presetMeta?.bangbooName || (engine === 'sun344' ? '梦游布' : '协战邦布');

  const rows = data.rows || [];
  const totalSeconds =
    data.total_seconds ||
    (rows.length > 0 ? Math.max(180, rows[rows.length - 1].t_end) : 180);

  const bBuild = (data.build || {}) as Record<string, number>;
  const mainSlotM =
    bBuild.sun_m ??
    data.sun_m ??
    presetMeta?.sunM ??
    data.agent_m?.[0] ??
    presetMeta?.agentM?.[0] ??
    0;
  const maxDecObserved = rows.reduce(
    (mx, r) => Math.max(mx, r.sun_dec_after ?? 0, r.decibels_after?.[0] ?? 0, r.decibel_cap ?? 0),
    3000,
  );
  const isMainSunM2 =
    (engine === 'sun344' || Boolean(agentNames[0]?.includes('挽昼'))) && mainSlotM >= 2;
  const mainDecibelCap = isMainSunM2 || maxDecObserved > 3000.5 ? 4000 : 3000;

  const stunCount = data.stun_count ?? presetMeta?.stunCount ?? 0;
  const ultCount = presetMeta?.ultCount ?? countMainUlts(data, engine);
  const rhythmTag =
    data.rhythm_tag || presetMeta?.rhythmTag || `${stunCount}失衡${ultCount}大`;

  // 尝试匹配 MILP 上界
  let ubMaxDmg: number | null = data.ub_max_dmg ?? presetMeta?.ubMaxDmg ?? null;
  let ubMinKillS: number | null = data.ub_min_kill_s ?? presetMeta?.ubMinKillS ?? null;
  let ubGapPct: number | null = data.ub_gap_pct ?? presetMeta?.ubGapPct ?? null;

  if (engine === 'sun344' && ubMaxDmg == null && overview?.optimalityProof?.scenarios) {
    const matched = overview.optimalityProof.scenarios.find((sc) => {
      if (presetMeta?.id && sc.presetId === presetMeta.id) return true;
      const b = data.build as Record<string, number> | undefined;
      if (!b || !sc.build) return false;
      const sameBuild =
        b.sun_m === sc.build.sun_m &&
        b.sun_w === sc.build.sun_w &&
        b.roxy_m === sc.build.roxy_m &&
        b.roxy_w === sc.build.roxy_w &&
        b.robin_m === sc.build.robin_m &&
        b.robin_w === sc.build.robin_w;
      if (!sameBuild) return false;
      if (data.boss_name?.includes('新生之结') && sc.title.includes('危局52')) return true;
      if (data.boss_name?.includes('死路屠夫') && sc.title.includes('屠夫')) return true;
      return false;
    });
    if (matched) {
      ubMaxDmg = matched.ubStar;
      ubMinKillS = matched.minKillTimeProof29Bars?.tMinLbS ?? null;
      ubGapPct = matched.relativeGapPct;
    }
  }

  const ubAchievedPct =
    ubMaxDmg && ubMaxDmg > 0
      ? Math.min(100, (data.total_dmg / ubMaxDmg) * 100)
      : null;
  if (ubMaxDmg && ubMaxDmg > 0 && ubGapPct == null) {
    ubGapPct = Math.max(0, ((ubMaxDmg - data.total_dmg) / ubMaxDmg) * 100);
  }

  // 构建泳道动作与统计
  const swimlaneItems: SwimlaneActionItem[] = [];
  const actorDmgMap = [0, 0, 0, 0, 0];
  let swapCancelCount = 0;
  let inStunDmg = 0;
  let preStunDmg = 0;

  rows.forEach((row, idx) => {
    const { slotIndex, actorName } = resolveStepSlot(row, engine, agentNames, bangbooName);
    const cat = classifyStepCat(row);
    const isSwapCancel = Boolean(
      row.cancel_mode?.includes('合轴') || row.cancel_mode?.includes('脱手'),
    );
    if (isSwapCancel) swapCancelCount++;

    const detonated = (row.vb_detonated ?? 0) + (row.special_detonate_dmg ?? 0);
    const anom = row.anomaly_disorder_dmg ?? 0;
    const inStun = isRowInStun(row);
    const stepDmg = row.step_total_dmg ?? 0;

    actorDmgMap[slotIndex] += stepDmg;
    if (inStun) {
      inStunDmg += stepDmg;
    } else {
      preStunDmg += stepDmg;
    }

    swimlaneItems.push({
      rowIdx: idx,
      sid: row.sid,
      slotIndex,
      actorName,
      shortLabel: cleanActionShortLabel(row.action_key || ''),
      fullLabel: row.action_key || `Skill #${row.sid}`,
      cat,
      cancelMode: row.cancel_mode || '',
      isSwapCancel,
      isZeroFrame: (row.delta_f ?? 0) === 0,
      tStart: row.t_start ?? 0,
      tEnd: row.t_end ?? row.t_start ?? 0,
      deltaF: row.delta_f ?? 0,
      directDmg: row.direct_dmg ?? 0,
      detonatedDmg: detonated,
      anomDmg: anom,
      totalDmg: stepDmg,
      vbAdded: row.vb_added ?? 0,
      inStun,
    });
  });

  // 聚合 Boss 状态相位段（过滤纯 0 帧夹缝噪音，精确累加窗口伤害，并按 stun_end_s 裁剪失衡尾招动画悬垂）
  const bossPhases: BossPhaseSegment[] = [];
  let stunSeq = 0;
  let pendingPostStunStart: number | null = null;
  for (const row of rows) {
    const kind = classifyBossPhase(row);
    const rawT0 = row.t_start ?? 0;
    const rawT1 = Math.max(rawT0, row.t_end ?? rawT0);
    const dmg = row.step_total_dmg ?? 0;
    const t0 =
      kind !== 'stun' && pendingPostStunStart !== null && pendingPostStunStart < rawT0
        ? pendingPostStunStart
        : rawT0;
    const t1 =
      kind === 'stun' && typeof row.stun_end_s === 'number'
        ? Math.max(t0, Math.min(rawT1, row.stun_end_s))
        : Math.max(t0, rawT1);
    if (kind === 'stun') {
      pendingPostStunStart = rawT1 > t1 + 1e-6 ? t1 : null;
    } else if (rawT1 > rawT0 || pendingPostStunStart !== null) {
      pendingPostStunStart = null;
    }
    const last = bossPhases[bossPhases.length - 1];

    if (last && last.kind === kind) {
      last.tEnd = Math.max(last.tEnd, t1);
      last.durationS = last.tEnd - last.tStart;
      last.windowDmg += dmg;
    } else if (t1 > t0 || kind === 'stun' || !last) {
      const idxLabel = kind === 'stun' ? ++stunSeq : undefined;
      const label =
        kind === 'stun'
          ? `#${idxLabel} ★失衡窗`
          : kind === 'miasma'
            ? '🟣 秽盾/侵蚀壁垒'
            : kind === 'invuln'
              ? '🛡️ 转场/角力阶段'
              : '常态打条';
      bossPhases.push({
        kind,
        index: idxLabel,
        label,
        tStart: t0,
        tEnd: t1,
        durationS: t1 - t0,
        windowDmg: dmg,
      });
    } else if (last) {
      last.windowDmg += dmg;
    }
  }
  const simHorizonS = data.total_seconds ?? 0;
  const lastPhase = bossPhases[bossPhases.length - 1];
  if (lastPhase && lastPhase.kind === 'stun' && pendingPostStunStart === null) {
    const lastRow = rows[rows.length - 1];
    const capEnd =
      lastRow && typeof lastRow.stun_end_s === 'number'
        ? Math.min(simHorizonS, lastRow.stun_end_s)
        : simHorizonS;
    if (capEnd > lastPhase.tEnd + 1e-6) {
      lastPhase.tEnd = capEnd;
      lastPhase.durationS = lastPhase.tEnd - lastPhase.tStart;
    }
  }
  if (pendingPostStunStart !== null && simHorizonS > pendingPostStunStart + 1e-3) {
    bossPhases.push({
      kind: 'normal',
      label: '常态打条',
      tStart: pendingPostStunStart,
      tEnd: simHorizonS,
      durationS: simHorizonS - pendingPostStunStart,
      windowDmg: 0,
    });
  }

  // 聚合核心 Buff 覆盖甘特轨
  const buffDefs: Array<{
    id: string;
    label: string;
    color: string;
    pred: (r: StepRow) => boolean;
  }> =
    engine === 'sun344'
      ? [
          {
            id: 'sun_polar',
            label: '☀️ 极昼(无视20%防)',
            color: '#fb7185',
            pred: (r) => Boolean(r.sun_str?.includes('极昼')),
          },
          {
            id: 'sun_wish',
            label: '🔥 众愿(锐暴增益)',
            color: '#f97316',
            pred: (r) => Boolean(r.sun_str?.includes('众愿')),
          },
          {
            id: 'wound',
            label: '🩸 毁伤状态覆盖',
            color: '#facc15',
            pred: (r) => (r.wound_after ?? 0) > 0 || Boolean(r.action_key?.includes('毁伤')),
          },
          {
            id: 'roxy_wind',
            label: '🌪️ 赤翼+风化浸染',
            color: '#34d399',
            pred: (r) =>
              Boolean(
                r.roxy_str?.includes('专武') ||
                  r.roxy_str?.includes('全开') ||
                  r.wind_str?.includes('浸染'),
              ),
          },
          {
            id: 'robin_acc',
            label: '🎵 重音强化+追击层',
            color: '#60a5fa',
            pred: (r) => Boolean(r.robin_str?.includes('重音')) || (r.fua_stacks ?? 0) > 0,
          },
        ]
      : [
          {
            id: 'slot0_kit',
            label: `🔥 ${agentNames[0]} 核心&4件套`,
            color: '#fb7185',
            pred: (r) =>
              ((r.kit_buff_stacks?.[0] ?? 0) > 0 || (r.disc4_stacks?.[0] ?? 0) > 0),
          },
          {
            id: 'slot1_kit',
            label: `⚡ ${agentNames[1]} 核心&4件套`,
            color: '#34d399',
            pred: (r) =>
              ((r.kit_buff_stacks?.[1] ?? 0) > 0 || (r.disc4_stacks?.[1] ?? 0) > 0),
          },
          {
            id: 'slot2_kit',
            label: `🎵 ${agentNames[2]} 核心&4件套`,
            color: '#60a5fa',
            pred: (r) =>
              ((r.kit_buff_stacks?.[2] ?? 0) > 0 || (r.disc4_stacks?.[2] ?? 0) > 0),
          },
          {
            id: 'wpn_on',
            label: '🗡️ 专武特效激活',
            color: '#f59e0b',
            pred: (r) =>
              (r.wpn_stacks?.[0] ?? 0) +
                (r.wpn_stacks?.[1] ?? 0) +
                (r.wpn_stacks?.[2] ?? 0) >
              0,
          },
        ];

  const totalDurForUptime = Math.max(1, data.kill_time_s || totalSeconds);
  const totalStunDur = bossPhases
    .filter((p) => p.kind === 'stun')
    .reduce((acc, p) => acc + p.durationS, 0);

  const buffTracks: BuffCoverageTrack[] = buffDefs.map((def) => {
    const segments: BuffCoverageSegment[] = [];
    let coveredS = 0;
    let coveredInStunS = 0;

    for (const r of rows) {
      const dur = Math.max(0, (r.t_end ?? 0) - (r.t_start ?? 0));
      if (dur <= 0 || !def.pred(r)) continue;
      coveredS += dur;
      if (isRowInStun(r)) {
        const inStunDur =
          typeof r.stun_end_s === 'number'
            ? Math.max(0, Math.min(r.t_end ?? 0, r.stun_end_s) - (r.t_start ?? 0))
            : dur;
        coveredInStunS += inStunDur;
      }

      const prev = segments[segments.length - 1];
      if (prev && r.t_start <= prev.tEnd + 0.15) {
        prev.tEnd = Math.max(prev.tEnd, r.t_end);
      } else {
        segments.push({ tStart: r.t_start, tEnd: r.t_end });
      }
    }

    return {
      id: def.id,
      label: def.label,
      color: def.color,
      uptimePct: Math.min(100, (coveredS / totalDurForUptime) * 100),
      inStunUptimePct:
        totalStunDur > 0 ? Math.min(100, (coveredInStunS / totalStunDur) * 100) : 0,
      segments,
    };
  });

  // 构建 0s -> 180s 2秒分桶时序曲线
  const bucketStepS = 2;
  const maxPlotS = Math.ceil(Math.min(180, Math.max(20, totalSeconds)) / bucketStepS) * bucketStepS;
  const bucketCount = Math.floor(maxPlotS / bucketStepS) + 1;
  const labelsS = Array.from({ length: bucketCount }, (_, i) => i * bucketStepS);
  const bucketDmg = new Array<number>(bucketCount).fill(0);
  const resourceMain = new Array<number>(bucketCount).fill(0);
  const resourceDecibelMain = new Array<number>(bucketCount).fill(0);
  const dazeCyclePct = new Array<number>(bucketCount).fill(0);

  for (const r of rows) {
    const tMid = ((r.t_start ?? 0) + (r.t_end ?? r.t_start ?? 0)) * 0.5;
    const bIdx = Math.min(bucketCount - 1, Math.max(0, Math.round(tMid / bucketStepS)));
    bucketDmg[bIdx] += r.step_total_dmg ?? 0;
  }

  // 采样每个时间点的最新资源状态
  let rowPtr = 0;
  for (let b = 0; b < bucketCount; b++) {
    const t = labelsS[b];
    while (rowPtr + 1 < rows.length && (rows[rowPtr + 1].t_start ?? 0) <= t) {
      rowPtr++;
    }
    const cur = rows[rowPtr];
    if (cur) {
      resourceMain[b] =
        engine === 'sun344'
          ? (cur.ep_after ?? 0)
          : (cur.energy_after?.[0] ?? 0);
      resourceDecibelMain[b] =
        engine === 'sun344'
          ? (cur.sun_dec_after ?? 0)
          : (cur.decibels_after?.[0] ?? 0);
      const rawDaze =
        cur.cycle_daze_pct_after != null
          ? cur.cycle_daze_pct_after * 100
          : ((cur.daze_pct_cum ?? 0) % 1) * 100;
      const curStillStunned =
        isRowInStun(cur) &&
        (typeof cur.stun_end_s !== 'number' || t <= cur.stun_end_s + 1e-6);
      dazeCyclePct[b] = curStillStunned
        ? 100
        : typeof cur.stun_end_s === 'number' && t > cur.stun_end_s + 1e-6
          ? 0
          : Math.min(100, Math.max(0, rawDaze));
    }
  }

  const cumDmgM: number[] = [];
  const burstDpsW: number[] = [];
  let running = 0;
  for (let b = 0; b < bucketCount; b++) {
    running += bucketDmg[b];
    cumDmgM.push(Number((running / 1e8).toFixed(4))); // 单位：亿
    // 4s 平滑瞬时爆发 DPS (单位：万/s)
    const winDmg = bucketDmg[b] + (b > 0 ? bucketDmg[b - 1] : bucketDmg[b]);
    const winS = b > 0 ? bucketStepS * 2 : bucketStepS;
    burstDpsW.push(Number((winDmg / winS / 1e4).toFixed(2)));
  }

  const totalDmgSafe = Math.max(1, data.total_dmg || running);
  const stageMechDmg = actorDmgMap[4];
  const slotColors = ['#FDB2C8', '#34d399', '#60a5fa', '#c084fc', '#fbbf24'];
  const slotNames = [agentNames[0], agentNames[1], agentNames[2], bangbooName, '场地/机制真伤'];
  const actorDmgTotals = slotNames
    .map((name, idx) => ({
      name,
      dmg: actorDmgMap[idx],
      pct: (actorDmgMap[idx] / totalDmgSafe) * 100,
      color: slotColors[idx],
    }))
    .filter((item, idx) => idx < 3 || item.dmg > 0);

  const occ = data.field_occupancy || {
    overall_s: [0, 0, 0],
    overall_pct: [33.3, 33.3, 33.4],
    pre_stun_s: [0, 0, 0],
    in_stun_s: [0, 0, 0],
    sanity_ok: true,
  };

  return {
    engine,
    version: data.version || '3.4.5_r20699967',
    bossName: data.boss_name || presetMeta?.bossName || '未知靶标',
    bossMode: data.boss_mode || presetMeta?.bossMode || 'Autonomous',
    shorthand: data.shorthand || presetMeta?.shorthand || '010101',
    detailLabel: data.detail_label || presetMeta?.subtitle || '',
    limitedGold: data.limited_gold ?? presetMeta?.limitedGold ?? 5,
    totalSeconds,
    totalFrames: data.total_frames || Math.round(totalSeconds * 60),
    totalDmg: data.total_dmg ?? 0,
    dps: data.dps ?? 0,
    directDmg: data.total_direct_dmg ?? 0,
    detonatedDmg: data.total_detonated_dmg ?? 0,
    anomDisorderDmg: data.total_anom_disorder_dmg ?? 0,
    stageMechDmg,
    killed: Boolean(data.killed ?? presetMeta?.killed),
    killTimeS: data.kill_time_s ?? presetMeta?.killTimeS ?? null,
    daDmgScore: data.da_dmg_score ?? presetMeta?.daDmgScore ?? 0,
    daPerfScore: data.da_perf_score ?? presetMeta?.daPerfScore ?? 0,
    daTotalScore: data.da_total_score ?? presetMeta?.daTotalScore ?? 0,
    stunCount,
    ultCount,
    rhythmTag,
    swapCancelCount,
    ubMaxDmg,
    ubMinKillS,
    ubGapPct,
    ubAchievedPct,
    agentNames,
    bangbooName,
    mainDecibelCap,
    fieldOccupancy: {
      overallS: occ.overall_s,
      overallPct: occ.overall_pct,
      preStunS: occ.pre_stun_s,
      inStunS: occ.in_stun_s,
      sanityOk: occ.sanity_ok !== false,
    },
    swimlaneItems,
    bossPhases,
    buffTracks,
    timeSeries: {
      labelsS,
      cumDmgM,
      burstDpsW,
      resourceMain,
      resourceDecibelMain,
      dazeCyclePct,
    },
    actorDmgTotals,
    inStunDmg,
    preStunDmg,
  };
}

/**
 * 构建单步 15 乘区快照与机制透视详情（兼容 uni344 逐帧直出字段 & sun344 结合 spec 实时推演）
 */
export function buildStepInspection(
  rowIdx: number,
  data: SearchResultData,
  view: NormalizedSimView,
  sunSpecRawObj?: Record<string, unknown> | null,
): StepInspectionDetail {
  const row = data.rows[rowIdx];
  const { slotIndex, actorName } = resolveStepSlot(
    row,
    view.engine,
    view.agentNames,
    view.bangbooName,
  );
  const cat = classifyStepCat(row);
  const directDmg = row.direct_dmg ?? 0;
  const detonatedDmg = (row.vb_detonated ?? 0) + (row.special_detonate_dmg ?? 0);
  const anomDisorderDmg = row.anomaly_disorder_dmg ?? 0;
  const vbAdded = row.vb_added ?? 0;
  const vbPoolAfter = row.vb_pool_after ?? 0;
  const totalDmg = row.step_total_dmg ?? 0;

  // 查找 sun_team_344_spec.json 内的动作帧与倍率定义
  let specAction: SunActionSpecMeta | null = null;
  if (sunSpecRawObj && Array.isArray((sunSpecRawObj as { actions?: unknown[] }).actions)) {
    const found = (sunSpecRawObj as { actions: SunActionSpecMeta[] }).actions.find(
      (a) => a.sid === row.sid,
    );
    if (found) specAction = found;
  }

  const frameInfo = {
    deltaF: row.delta_f ?? 0,
    swapF: specAction?.swap_f ?? null,
    canF: specAction?.can_f ?? null,
    totF: specAction?.tot_f ?? null,
    haltF: specAction?.halt_f ?? null,
    hwText:
      specAction?.hw ||
      (row.f_start != null && row.f_end != null
        ? `f${row.f_start} → f${row.f_end} (前台占用 ${row.delta_f}f${row.wait_f ? ` · 等待 ${row.wait_f}f` : ''})`
        : `前台驻场 ${row.delta_f}f (${(row.delta_f / 60).toFixed(2)}s)`),
    note: specAction?.note || row.cancel_mode || '',
  };

  let multipliers15: MultiplierCell[] = [];

  if (row.live_base !== undefined) {
    // zzz-uni344 原生完整 15 乘区透视
    const isVanguard = row.stream_kind === 'Sharp';
    const isTrueDmg = row.stream_kind === 'TrueDmg' || slotIndex === 4;
    multipliers15 = [
      {
        idx: 1,
        name: `① 局内基础属性 (${isTrueDmg ? '首领生命上限' : isVanguard ? '防御' : '攻击/贯穿'})`,
        valueStr: Math.round(row.live_base).toLocaleString(),
        formulaHint: isTrueDmg
          ? '按首领最大生命值固定百分比结算真伤'
          : isVanguard
            ? '局外防御×局内防%+固定防'
            : '局内实时结算面板',
        highlighted: true,
      },
      {
        idx: 2,
        name: '② 固定基础附加值',
        valueStr: `+${Math.round(row.flat_base_extra ?? 0).toLocaleString()}`,
        formulaHint: '招式额外固定加算基数',
      },
      {
        idx: 3,
        name: '③ 招式总倍率 (MV)',
        valueStr: `${((row.step_mv ?? 0) * 100).toFixed(1)}%`,
        formulaHint: `段数计数 ×${(row.n_count ?? 1).toFixed(2)}`,
        highlighted: (row.step_mv ?? 0) >= 15,
      },
      {
        idx: 4,
        name: `④ 实时${isVanguard ? '锐暴' : '暴击'}率`,
        valueStr: `${((row.live_cr ?? 0) * 100).toFixed(1)}%`,
        formulaHint: isVanguard ? '含暴伤×0.35转化率' : '局内实时暴击率',
      },
      {
        idx: 5,
        name: `⑤ 实时${isVanguard ? '锐暴' : '暴击'}伤害`,
        valueStr: `${((row.live_cd ?? 0) * 100).toFixed(1)}%`,
        formulaHint: isVanguard ? '锋御锐暴伤害面板' : '局内实时暴击伤害',
      },
      {
        idx: 6,
        name: '⑥ 双暴期望乘区',
        valueStr: `×${(row.zone_crit ?? 1).toFixed(3)}`,
        formulaHint: '1 + CR×CD (含超百二次锐暴)',
        highlighted: (row.zone_crit ?? 1) >= 2.5,
      },
      {
        idx: 7,
        name: '⑦ 常规增伤乘区',
        valueStr: `×${(row.zone_common_dmg ?? 1).toFixed(3)}`,
        formulaHint: '1 + 属性伤 + 招式增伤 + 全伤',
        highlighted: (row.zone_common_dmg ?? 1) > 1.8,
      },
      {
        idx: 8,
        name: '⑧ 特殊/锐化独立乘区',
        valueStr: `×${(row.zone_special_mult ?? 1).toFixed(3)}`,
        formulaHint: `伤害流类型: ${row.stream_kind || 'Direct'}`,
        highlighted: (row.zone_special_mult ?? 1) > 1.01,
      },
      {
        idx: 9,
        name: '⑨ 减防 + 无视防御',
        valueStr: `${((row.def_shred_plus_ign ?? 0) * 100).toFixed(1)}%`,
        formulaHint: '减防%与无视防御%合并扣减',
        highlighted: (row.def_shred_plus_ign ?? 0) > 0,
      },
      {
        idx: 10,
        name: '⑩ 穿透率 / 固定穿透',
        valueStr: `${((row.pen_ratio ?? 0) * 100).toFixed(0)}% / +${Math.round(row.flat_pen ?? 0)}`,
        formulaHint: '有效防 = 原防×(1-减防)×(1-穿)-固穿',
      },
      {
        idx: 11,
        name: '⑪ 有效防御乘区',
        valueStr: `×${(row.zone_def ?? 1).toFixed(3)}`,
        formulaHint: '794 / (794 + 有效防御)',
      },
      {
        idx: 12,
        name: '⑫ 属性抗性乘区',
        valueStr: `×${(row.zone_res ?? 1).toFixed(3)}`,
        formulaHint: `属性: ${row.elem || '物理'} (1 - 抗性 + 减抗)`,
        highlighted: (row.zone_res ?? 1) > 1.05,
      },
      {
        idx: 13,
        name: '⑬ 失衡易伤乘区',
        valueStr: `×${(row.zone_stun ?? 1).toFixed(3)}`,
        formulaHint: `状态: ${row.stun_str}`,
        highlighted: (row.zone_stun ?? 1) > 1.05,
      },
      {
        idx: 14,
        name: '⑭ 敌方承伤易伤区',
        valueStr: `×${(row.zone_taken ?? 1).toFixed(3)}`,
        formulaHint: '浸染/壁垒破除/独立易伤',
        highlighted: (row.zone_taken ?? 1) > 1.01,
      },
      {
        idx: 15,
        name: '⑮ 直伤留存 / 蓄水池比',
        valueStr: `${((row.keep_frac ?? 1) * 100).toFixed(0)}%`,
        formulaHint:
          vbAdded > 0
            ? `转入[烬痕]池 +${formatDamageCompact(vbAdded)}`
            : '100% 当步直接结算',
        highlighted: vbAdded > 0 || detonatedDmg > 0,
      },
    ];
  } else if (slotIndex === 4) {
    // 场地/首领机制固定百分比最大生命真伤（如新生之结 2.5% 生命真伤）
    const bossMaxHp = Math.round(totalDmg > 0 ? totalDmg / (0.025 * Math.max(1, row.n_count ?? 1)) : 339_619_162);
    multipliers15 = [
      {
        idx: 1,
        name: '① 结算基数 (首领生命上限)',
        valueStr: bossMaxHp.toLocaleString(),
        formulaHint: '危局首领 29 管总生命上限',
        highlighted: true,
      },
      {
        idx: 2,
        name: '② 机制真伤比例',
        valueStr: `${(2.5 * (row.n_count ?? 1)).toFixed(1)}% 最大生命`,
        formulaHint: `单次 2.5% 生命上限 × ${(row.n_count ?? 1).toFixed(0)} 次`,
        highlighted: true,
      },
      {
        idx: 3,
        name: '③ 伤害流类型',
        valueStr: '场地/首领机制真伤',
        formulaHint: '独立于代理人与邦布面板，不吃双暴/增伤/防御/抗性/失衡',
        highlighted: true,
      },
      ...Array.from({ length: 12 }, (_, i) => ({
        idx: i + 4,
        name: `${['④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮'][i]} 常规乘区豁免`,
        valueStr: '×1.000 (真伤)',
        formulaHint: '场地机制真伤固定倍率结算',
      })),
    ];
  } else {
    // zzz-sun344 专核：结合 sun_team_344_spec.json 与当前配装/Buff 还原 15 乘区快照
    const b = (data.build || {}) as Record<string, number>;
    const sunM = b.sun_m ?? data.sun_m ?? 0;
    const sunW = b.sun_w ?? 1;
    const roxyM = b.roxy_m ?? data.roxy_m ?? 0;
    const roxyW = b.roxy_w ?? 1;
    const robinM = b.robin_m ?? data.robin_m ?? 0;
    const stageBuff = data.stage_buff_id ?? 0;

    const isSun = slotIndex === 0;
    const isRoxy = slotIndex === 1;
    const isRobin = slotIndex === 2;
    const skLv = (isSun && sunM >= 5) || (isRoxy && roxyM >= 5) || (isRobin && robinM >= 5)
      ? 16
      : (isSun && sunM >= 3) || (isRoxy && roxyM >= 3) || (isRobin && robinM >= 3)
        ? 14
        : 12;

    const rawMvPct = specAction
      ? ((specAction.dmg1 + (skLv - 1) * specAction.dgrow) / 100) * (row.n_count ?? 1)
      : 0;

    const polarOn = Boolean(row.sun_str?.includes('极昼'));
    const wishOn = Boolean(row.sun_str?.includes('众愿'));
    const robinAcc = Boolean(row.robin_str?.includes('重音'));
    const roxyFull = Boolean(row.roxy_str?.includes('专武') || row.roxy_str?.includes('全开'));
    const windSoak = Boolean(row.wind_str?.includes('浸染'));
    const inStun = isRowInStun(row);
    const isDa52 = Boolean(data.boss_name?.includes('新生之结'));

    const defAddRobin = robinAcc ? 1000 : row.robin_str && !row.robin_str.includes('无') ? 800 : 0;
    const stageDefMult =
      stageBuff === 69015201 || stageBuff === 69015301
        ? 0.1
        : stageBuff === 69015101
          ? 0.15
          : 0;
    const liveBaseVal = isSun
      ? Math.round(2602 * (1 + stageDefMult) + defAddRobin)
      : isRoxy
        ? 3916
        : isRobin
          ? 1904
          : 8863;

    const ignDef =
      (isSun && polarOn ? 0.2 : 0) +
      (isSun ? 0.16 : 0) +
      (isSun && sunM >= 6 ? 0.15 : 0) +
      (robinM >= 1 && robinAcc ? 0.2 : 0);
    const penRatio = isRoxy ? 0.24 : 0;
    const flatPen = slotIndex <= 2 ? 18 : 0;
    const bossDef = data.boss_name?.includes('赫由托') ? 1588 : 952.8;
    const effDef = Math.max(0, bossDef * (1 - Math.min(0.9, ignDef)) * (1 - penRatio) - flatPen);
    const zoneDef = 794 / (794 + effDef);

    const sharpCd =
      1.5 +
      (wishOn ? 0.25 : 0) +
      (roxyFull ? 0.1924 : 0) +
      (robinAcc ? 0.15 : 0) +
      (stageBuff === 69015101 ? 0.1 : 0) +
      (stageBuff === 69015205 ? 0.15 : 0);
    const critMult = isSun ? 1 + Math.min(1, 0.85 + sharpCd * 0.12) * sharpCd : isRoxy ? 2.416 : 1.202;

    const commonDmg = isSun
      ? 1 +
        0.3 +
        (sunW >= 1 ? 0.2 : 0) +
        (sunM >= 4 ? 0.1 : 0) +
        (roxyFull ? 0.2 : 0) +
        0.2 +
        (row.fua_stacks ?? 0) * 0.085
      : isRoxy
        ? 1.8 + (roxyW >= 1 ? 0.25 : 0)
        : 1.2;

    const dazzleStacks =
      typeof (row as unknown as Record<string, unknown>).dazzle_stacks === 'number'
        ? Number((row as unknown as Record<string, unknown>).dazzle_stacks)
        : 3;
    const stageSharpBonus =
      stageBuff === 69015201
        ? 0.2
        : stageBuff === 69015301
          ? 0.1
          : stageBuff === 69015205
            ? dazzleStacks * 0.35
            : 0;
    const specialSharpMult = isSun
      ? 1 +
        (sunW >= 1 ? 0.1 : 0) +
        (roxyFull ? 0.08 : 0) +
        (robinM >= 6 ? 0.15 : 0) +
        stageSharpBonus +
        (isDa52 ? (data.knot_fissure_stacks ?? 2) * 0.15 : 0)
      : 1.0;

    const baseSunRes = data.boss_name?.includes('弱火')
      ? 1.2
      : data.boss_name?.includes('提丰')
        ? 0.8
        : 1.0;
    const resMult = isSun
      ? baseSunRes +
        (sunM >= 1 ? 0.15 : 0) +
        (robinM >= 2 ? 0.15 : 0) +
        (stageBuff === 69015301 ? 0.1 : 0)
      : isRoxy
        ? (data.boss_name?.includes('弱风') ? 1.2 : 1.0) + 0.15 + (robinM >= 2 ? 0.15 : 0)
        : 1.0 + (robinM >= 2 ? 0.15 : 0);

    const baseStunMult = isDa52 ? 2.25 : data.boss_name?.includes('200%') ? 3.0 : 2.5;
    const stunMult = inStun
      ? baseStunMult +
        (roxyFull ? 0.3 : 0) +
        (isDa52 ? 0.2 : 0) +
        (stageBuff === 69015201 ? 0.15 : 0)
      : 1.0;

    const takenMult = windSoak ? 1.18 : 1.0;
    const vbRuleDesc =
      specAction?.vb_rule === 1
        ? '蓄力60%折算入[烬痕]池'
        : specAction?.detonator
          ? '长暗终焉 100% 引爆[烬痕]池'
          : vbAdded > 0
            ? `入[烬痕]池 +${formatDamageCompact(vbAdded)}`
            : '常规直伤结算';

    multipliers15 = [
      {
        idx: 1,
        name: `① 局内结算基数 (${isSun ? '局内防御' : '局内攻击'})`,
        valueStr: liveBaseVal.toLocaleString(),
        formulaHint: isSun ? `含知更鸟+${defAddRobin}防 & 天气防%` : '局内实时攻击面板',
        highlighted: isSun && robinAcc,
      },
      {
        idx: 2,
        name: `② 招式倍率 (Lv.${skLv})`,
        valueStr: rawMvPct > 0 ? `${rawMvPct.toFixed(1)}%` : `×${(row.n_count ?? 1).toFixed(1)}段`,
        formulaHint: specAction ? `基础 ${specAction.dmg1 / 100}% × ${(row.n_count ?? 1).toFixed(1)}` : `段数 ${row.n_count}`,
        highlighted: rawMvPct >= 1000,
      },
      {
        idx: 3,
        name: '③ 倍率模型 / 属性流',
        valueStr: isSun ? '锋御·锐化火伤' : isRoxy ? '击破·风直伤' : isRobin ? '防护·物理追击' : '邦布·物理协战',
        formulaHint: specAction?.def_mode === 1 ? '按100%局内防御结算' : '按局内攻击力结算',
      },
      {
        idx: 4,
        name: `④ ${isSun ? '锐暴转化率' : '实时暴击率'}`,
        valueStr: isSun ? '100.0% (超百锐暴)' : isRoxy ? '96.2%' : '31.4%',
        formulaHint: isSun ? '暴伤×0.35转暴击 + 众愿加成' : '局内面板暴击率',
      },
      {
        idx: 5,
        name: `⑤ ${isSun ? '锐暴伤害面板' : '暴击伤害面板'}`,
        valueStr: isSun ? `${(sharpCd * 100).toFixed(1)}%` : isRoxy ? '147.2%' : '64.4%',
        formulaHint: isSun ? `极昼/众愿:${wishOn ? '开' : '关'} · 洛克茜/鸟拐` : '局内暴伤',
        highlighted: isSun && wishOn,
      },
      {
        idx: 6,
        name: '⑥ 双暴/锐暴期望区',
        valueStr: `×${critMult.toFixed(3)}`,
        formulaHint: isSun ? '含锋御超百暴击二次锐暴加成' : '1 + CR × CD',
      },
      {
        idx: 7,
        name: '⑦ 常规增伤乘区',
        valueStr: `×${commonDmg.toFixed(3)}`,
        formulaHint: `追击层:${row.fua_stacks ?? 0} · 盘层:${row.disc_stacks ?? 0}`,
        highlighted: (row.fua_stacks ?? 0) > 0,
      },
      {
        idx: 8,
        name: '⑧ 锐化伤害独立乘区',
        valueStr: `×${specialSharpMult.toFixed(3)}`,
        formulaHint:
          stageBuff === 69015205
            ? '专武+赤翼+[凋蚀印记]+(裂核30%)'
            : isDa52
              ? '专武+赤翼+[攻砭]20%+[裂核]30%'
              : '专武+洛克茜赤翼独立乘算',
        highlighted: specialSharpMult > 1.2,
      },
      {
        idx: 9,
        name: '⑨ 无视防御 / 减防区',
        valueStr: `${(ignDef * 100).toFixed(1)}%`,
        formulaHint: polarOn ? '极昼20% + 星之碑16% + 影画无视防' : '星之碑/影画无视防御',
        highlighted: polarOn,
      },
      {
        idx: 10,
        name: '⑩ 穿透率 / 固定穿透',
        valueStr: `${(penRatio * 100).toFixed(0)}% / +${flatPen}`,
        formulaHint: `Boss原生防 ${bossDef} -> 有效防 ${effDef.toFixed(0)}`,
      },
      {
        idx: 11,
        name: '⑪ 有效防御乘区',
        valueStr: `×${zoneDef.toFixed(3)}`,
        formulaHint: 'Lv.60基数 794 / (794 + 有效防)',
      },
      {
        idx: 12,
        name: '⑫ 属性弱点与减抗区',
        valueStr: `×${resMult.toFixed(2)}`,
        formulaHint: isRoxy ? '含洛克茜15%无视风抗' : '弱火+20% / 逆抗-20%',
        highlighted: resMult > 1.05,
      },
      {
        idx: 13,
        name: '⑬ 失衡易伤乘区',
        valueStr: `×${stunMult.toFixed(2)}`,
        formulaHint: inStun ? '★失衡爆发窗! 含洛克茜+30%易伤' : '常态非失衡 (×1.00)',
        highlighted: inStun,
      },
      {
        idx: 14,
        name: '⑭ 风化浸染 / 承伤易伤',
        valueStr: `×${takenMult.toFixed(2)}`,
        formulaHint: row.wind_str || '—无',
        highlighted: windSoak,
      },
      {
        idx: 15,
        name: '⑮ [烬痕] 蓄水池机制',
        valueStr:
          detonatedDmg > 0
            ? `💥 引爆 ${formatDamageCompact(detonatedDmg)}`
            : vbAdded > 0
              ? `+${formatDamageCompact(vbAdded)}`
              : '直伤100%',
        formulaHint: vbRuleDesc,
        highlighted: detonatedDmg > 0 || vbAdded > 0,
      },
    ];
  }

  // 提取当前生效 Buff 标签
  const activeBuffPills: string[] = [];
  if (row.sun_str && !row.sun_str.includes('—无')) activeBuffPills.push(`挽昼: ${row.sun_str}`);
  if (row.roxy_str && !row.roxy_str.includes('—无')) activeBuffPills.push(`洛克茜: ${row.roxy_str}`);
  if (row.wind_str && !row.wind_str.includes('—无')) activeBuffPills.push(`风眼: ${row.wind_str}`);
  if (row.robin_str && !row.robin_str.includes('—无')) activeBuffPills.push(`知更鸟: ${row.robin_str}`);
  if (row.fua_stacks) activeBuffPills.push(`知更鸟追击叠层 ×${row.fua_stacks}`);
  if (row.disc_stacks) activeBuffPills.push(`4件套驱动盘 ×${row.disc_stacks}`);
  if (row.kit_buff_pills) {
    row.kit_buff_pills.forEach((pill, i) => {
      if (pill && pill !== '—') activeBuffPills.push(`${view.agentNames[i]}: ${pill}`);
    });
  }
  if (row.env_pill && row.env_pill !== '—') activeBuffPills.push(`场地: ${row.env_pill}`);
  if (row.active_anomaly_str && !row.active_anomaly_str.includes('无')) {
    activeBuffPills.push(`异常状态: ${row.active_anomaly_str}`);
  }

  // 资源水位条（适配挽昼 M2 4000 喧响上限与 160 愿火上限）
  const sunDecCap = row.decibel_cap ?? view.mainDecibelCap ?? 3000;
  const resources: StepInspectionDetail['resources'] =
    view.engine === 'sun344'
      ? [
          { label: '挽昼 锐能 (EP)', val: row.ep_after ?? 0, max: 120, color: '#fb7185' },
          {
            label: '挽昼 愿火值',
            val: row.wish_fire_after ?? 0,
            max: Math.max(160, row.wish_fire_after ?? 0),
            color: '#f97316',
          },
          { label: '洛克茜 能量', val: row.roxy_sp_after ?? 0, max: 120, color: '#34d399' },
          { label: '知更鸟 能量', val: row.robin_sp_after ?? 0, max: 120, color: '#60a5fa' },
          { label: '挽昼 喧响值', val: row.sun_dec_after ?? 0, max: sunDecCap, color: '#facc15' },
          {
            label: '[烬痕] 待爆池',
            val: vbPoolAfter,
            max: Math.max(10_000_000, vbPoolAfter),
            color: '#c084fc',
            unit: formatDamageCompact(vbPoolAfter),
          },
        ]
      : [
          {
            label: `${view.agentNames[0]} 能量`,
            val: row.energy_after?.[0] ?? 0,
            max: 120,
            color: '#fb7185',
          },
          {
            label: `${view.agentNames[1]} 能量`,
            val: row.energy_after?.[1] ?? 0,
            max: 120,
            color: '#34d399',
          },
          {
            label: `${view.agentNames[2]} 能量`,
            val: row.energy_after?.[2] ?? 0,
            max: 120,
            color: '#60a5fa',
          },
          {
            label: `${view.agentNames[0]} 喧响`,
            val: row.decibels_after?.[0] ?? 0,
            max: sunDecCap,
            color: '#facc15',
          },
          {
            label: '当轮失衡进度',
            val: (row.cycle_daze_pct_after ?? 0) * 100,
            max: 100,
            color: '#38bdf8',
            unit: `${((row.cycle_daze_pct_after ?? 0) * 100).toFixed(1)}%`,
          },
        ];

  return {
    rowIdx,
    row,
    actorName,
    slotIndex,
    cat,
    directDmg,
    detonatedDmg,
    anomDisorderDmg,
    vbAdded,
    vbPoolAfter,
    totalDmg,
    frameInfo,
    multipliers15,
    activeBuffPills,
    resources,
  };
}
