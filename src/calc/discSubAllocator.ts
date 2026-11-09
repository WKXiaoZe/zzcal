// src/calc/discSubAllocator.ts
// ZZZ Drive Disc Sub-stat Legality Validator & Random 6-Disc Allocator.
//
// In-game ZZZ S-Rank Lv.15 Drive Disc rules:
// 1. Each of the 6 Drive Discs (Slots 1..6) can have:
//    - At most 4 distinct sub-stats (initial lines)
//    - At most 5 upgrade rolls (+1..+5 distributed among its sub-stats)
//    - Therefore at most 4 + 5 = 9 total sub-stat rolls per disc (and at most
//      1 initial + 5 upgrades = 6 rolls of any single sub-stat on a single disc).
//    - Across all 6 discs: at most 24 initial sub-stat lines, at most 30 upgrade
//      rolls, and at most 54 total sub-stat rolls.
// 2. Main stat and sub-stats on the same disc CANNOT be identical:
//    - Slot 1 fixed main stat = 小生命 (FLAT_HP)  → Slot 1 cannot roll FLAT_HP sub-stat.
//    - Slot 2 fixed main stat = 小攻击 (FLAT_ATK) → Slot 2 cannot roll FLAT_ATK sub-stat.
//    - Slot 3 fixed main stat = 小防御 (FLAT_DEF) → Slot 3 cannot roll FLAT_DEF sub-stat.
//    - Slot 4 selectable main stat:
//        * critRate       → Slot 4 cannot roll CR (暴击率)
//        * critDmg        → Slot 4 cannot roll CD (暴击伤害)
//        * atkPct         → Slot 4 cannot roll ATK (大攻击)
//        * anomalyMastery → Slot 4 cannot roll AM (异常精通)

import type { DiscConfig } from '../state/types';

export type SlotNum = 1 | 2 | 3 | 4 | 5 | 6;
export type Slot4Stat = DiscConfig['slot4Stat'];

export type SubStatKey =
  | 'CR'
  | 'CD'
  | 'ATK'
  | 'FLAT_ATK'
  | 'HP'
  | 'FLAT_HP'
  | 'AM'
  | 'PEN'
  | 'DEF'
  | 'FLAT_DEF';

export type AllSubCounts = Record<SubStatKey, number>;

export interface SubStatDef {
  key: SubStatKey;
  /** Short name shown in disc allocation badges, e.g. "暴击率", "大攻击", "小攻击" */
  name: string;
  /** Full input label with per-roll value, e.g. "暴击率 (2.4%/个)" */
  label: string;
  /** Value per roll */
  perRoll: number;
  /** Unit suffix ('%' or '') */
  unit: '%' | '';
}

export const SUB_STAT_DEFS: SubStatDef[] = [
  { key: 'CR',       name: '暴击率',   label: '暴击率 (2.4%/个)',   perRoll: 2.4, unit: '%' },
  { key: 'CD',       name: '暴击伤害', label: '暴击伤害 (4.8%/个)', perRoll: 4.8, unit: '%' },
  { key: 'ATK',      name: '大攻击',   label: '大攻击 (3%/个)',     perRoll: 3.0, unit: '%' },
  { key: 'FLAT_ATK', name: '小攻击',   label: '小攻击 (19/个)',     perRoll: 19,  unit: ''  },
  { key: 'HP',       name: '大生命',   label: '大生命 (3%/个)',     perRoll: 3.0, unit: '%' },
  { key: 'FLAT_HP',  name: '小生命',   label: '小生命 (112/个)',    perRoll: 112, unit: ''  },
  { key: 'AM',       name: '异常精通', label: '异常精通 (9/个)',    perRoll: 9,   unit: ''  },
  { key: 'PEN',      name: '穿透值',   label: '穿透值 (9/个)',      perRoll: 9,   unit: ''  },
  { key: 'DEF',      name: '大防御',   label: '大防御 (4.8%/个)',   perRoll: 4.8, unit: '%' },
  { key: 'FLAT_DEF', name: '小防御',   label: '小防御 (15/个)',     perRoll: 15,  unit: ''  },
];

export const SUB_STAT_MAP: Record<SubStatKey, SubStatDef> = Object.fromEntries(
  SUB_STAT_DEFS.map((d) => [d.key, d]),
) as Record<SubStatKey, SubStatDef>;

export const DEFAULT_ALL_SUB_COUNTS: AllSubCounts = {
  CR: 0,
  CD: 0,
  ATK: 0,
  FLAT_ATK: 0,
  HP: 0,
  FLAT_HP: 0,
  AM: 0,
  PEN: 0,
  DEF: 0,
  FLAT_DEF: 0,
};

export interface SlotMainStatInfo {
  slot: SlotNum;
  mainLabel: string;
  conflictSubKey: SubStatKey | null;
}

export function getSlotMainStatInfo(slot: SlotNum, slot4Stat: Slot4Stat): SlotMainStatInfo {
  switch (slot) {
    case 1:
      return { slot: 1, mainLabel: '小生命 (2200)', conflictSubKey: 'FLAT_HP' };
    case 2:
      return { slot: 2, mainLabel: '小攻击 (316)', conflictSubKey: 'FLAT_ATK' };
    case 3:
      return { slot: 3, mainLabel: '小防御 (184)', conflictSubKey: 'FLAT_DEF' };
    case 4: {
      if (slot4Stat === 'critRate') {
        return { slot: 4, mainLabel: '暴击率 (24%)', conflictSubKey: 'CR' };
      }
      if (slot4Stat === 'critDmg') {
        return { slot: 4, mainLabel: '暴击伤害 (48%)', conflictSubKey: 'CD' };
      }
      if (slot4Stat === 'atkPct') {
        return { slot: 4, mainLabel: '大攻击 (30%)', conflictSubKey: 'ATK' };
      }
      if (slot4Stat === 'defPct') {
        return { slot: 4, mainLabel: '大防御 (30%)', conflictSubKey: 'DEF' };
      }
      return { slot: 4, mainLabel: '异常精通 (92)', conflictSubKey: 'AM' };
    }
    case 5:
      return { slot: 5, mainLabel: '属性伤害/穿透/攻击/防御', conflictSubKey: null };
    case 6:
      return { slot: 6, mainLabel: '攻击/生命/防御/掌控/冲击', conflictSubKey: null };
  }
}

/** Format a single sub-stat's total value on a disc or summary (e.g. "7.2%" or "38"). */
export function formatSubStatValue(key: SubStatKey, rolls: number): string {
  const def = SUB_STAT_MAP[key];
  const raw = rolls * def.perRoll;
  if (def.unit === '%') {
    const rounded = Math.round(raw * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)}%`;
  }
  return `${Math.round(raw)}`;
}

/** One allocated sub-stat entry on a single Drive Disc. */
export interface AllocatedSubStat {
  key: SubStatKey;
  name: string;
  /** Always 1 for an allocated sub-stat on a disc */
  base: 1;
  /** Number of upgrade rolls on this disc (0..5) */
  upgrades: number;
  /** Total rolls on this disc = 1 + upgrades (1..6) */
  totalRolls: number;
  /** Display label in ZZZ style, e.g. "大攻击+4" or "小攻击" */
  displayText: string;
  /** Value text, e.g. "+15%" or "+19" */
  valueText: string;
}

/** Allocation result for one Drive Disc slot (1..6). */
export interface DiscSlotAllocation {
  slot: SlotNum;
  mainLabel: string;
  conflictSubKey: SubStatKey | null;
  subStats: AllocatedSubStat[];
  /** Number of distinct sub-stats on this disc (0..4) */
  lineCount: number;
  /** Total upgrade rolls on this disc (0..5) */
  upgradeCount: number;
  /** Total rolls on this disc = lineCount + upgradeCount (0..9) */
  totalRolls: number;
}

/** Details of a specific sub-stat that exceeded limits when validation fails. */
export interface StatExcessDetail {
  key: SubStatKey;
  name: string;
  current: number;
  /** Recommended max for this stat (holding other stats fixed, or its hard cap) */
  maxAllowed: number;
  /** How many rolls too many */
  excess: number;
  /** Explanation of why this stat is excessive */
  reason: string;
}

export interface SubStatAllocationResult {
  valid: boolean;
  /** Present when valid === true: randomized 6-disc sub-stat breakdown */
  discs?: Record<SlotNum, DiscSlotAllocation>;
  /** Present when valid === false: summary error message */
  errorSummary?: string;
  /** Present when valid === false: specific sub-stats that had too many rolls */
  excessStats?: StatExcessDetail[];
  /** Summary statistics of the input */
  stats: {
    totalRolls: number;
    minInitialLines: number;
    minUpgradesRequired: number;
  };
}

/** Return the eligible disc indices (0..5 corresponding to slots 1..6) for each sub-stat. */
export function getEligibleDiscsByStat(slot4Stat: Slot4Stat): Record<SubStatKey, number[]> {
  const slotConflicts = new Map<number, SubStatKey>();
  for (const s of [1, 2, 3, 4, 5, 6] as SlotNum[]) {
    const info = getSlotMainStatInfo(s, slot4Stat);
    if (info.conflictSubKey) {
      slotConflicts.set(s - 1, info.conflictSubKey);
    }
  }
  const out = {} as Record<SubStatKey, number[]>;
  for (const def of SUB_STAT_DEFS) {
    const eligible: number[] = [];
    for (let d = 0; d < 6; d++) {
      if (slotConflicts.get(d) !== def.key) {
        eligible.push(d);
      }
    }
    out[def.key] = eligible;
  }
  return out;
}

/**
 * Check if upgrade supplies `uReq[0..m-1]` can be routed to 6 discs with capacities `discCap[0..5]`
 * along adjacency lists `statDiscs[i]` (subset of 0..5).
 *
 * Since each disc's total capacity is <= 5 and per-edge capacity is 5, edge capacity is never binding.
 * We solve max-flow via augmenting paths on this tiny (m <= 10, 6 discs) bipartite network.
 */
function canRouteUpgrades(
  uReq: number[],
  statDiscs: number[][],
  discCap: number[],
): boolean {
  const m = uReq.length;
  let totalNeed = 0;
  for (let i = 0; i < m; i++) {
    if (uReq[i] < 0) return false;
    totalNeed += uReq[i];
  }
  if (totalNeed === 0) return true;

  let totalCap = 0;
  for (let d = 0; d < 6; d++) totalCap += discCap[d];
  if (totalNeed > totalCap) return false;

  // Residual capacities:
  // flow[i][d] = amount sent from stat i to disc d
  const flow: number[][] = Array.from({ length: m }, () => [0, 0, 0, 0, 0, 0]);
  const remSupply = uReq.slice();
  const remDiscCap = discCap.slice();

  // Augmenting path DFS from stat i to any disc with remDiscCap[d] > 0
  const visitedDisc = new Uint8Array(6);

  function dfs(statIdx: number, pushed: number): number {
    const adj = statDiscs[statIdx];
    for (let idx = 0; idx < adj.length; idx++) {
      const d = adj[idx];
      if (visitedDisc[d]) continue;
      visitedDisc[d] = 1;

      // Direct capacity available at disc d
      if (remDiscCap[d] > 0) {
        const take = Math.min(pushed, remDiscCap[d]);
        remDiscCap[d] -= take;
        flow[statIdx][d] += take;
        return take;
      }

      // Try redirecting flow from another stat j that currently sends flow[j][d] > 0
      for (let j = 0; j < m; j++) {
        if (j === statIdx || flow[j][d] <= 0) continue;
        const canPush = Math.min(pushed, flow[j][d]);
        const got = dfs(j, canPush);
        if (got > 0) {
          flow[j][d] -= got;
          flow[statIdx][d] += got;
          return got;
        }
      }
    }
    return 0;
  }

  for (let i = 0; i < m; i++) {
    while (remSupply[i] > 0) {
      visitedDisc.fill(0);
      const pushed = dfs(i, remSupply[i]);
      if (pushed <= 0) return false;
      remSupply[i] -= pushed;
    }
  }
  return true;
}

/** Fisher-Yates shuffle in place (using provided rng). */
function shuffle<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

/** Generate all combinations of size `k` from `items`. */
function combinations<T>(items: T[], k: number): T[][] {
  const result: T[][] = [];
  const comb: T[] = [];
  function backtrack(start: number) {
    if (comb.length === k) {
      result.push(comb.slice());
      return;
    }
    for (let i = start; i <= items.length - (k - comb.length); i++) {
      comb.push(items[i]);
      backtrack(i + 1);
      comb.pop();
    }
  }
  if (k >= 0 && k <= items.length) backtrack(0);
  return result;
}

interface RawSolution {
  /** statDiscs[i] = list of disc indices (0..5) where activeStat[i] is present */
  statDiscs: number[][];
  /** upgrades[i][d] = upgrade rolls of activeStat[i] on disc d */
  upgrades: number[][];
}

/**
 * Core solver: attempts to find a (randomized) valid assignment of active stats
 * onto the 6 discs.
 */
function solveAllocation(
  activeStats: Array<{ key: SubStatKey; count: number; eligible: number[] }>,
  rng: () => number,
): RawSolution | null {
  const m = activeStats.length;
  if (m === 0) {
    return { statDiscs: [], upgrades: [] };
  }

  // Quick necessary bounds check
  let totalRolls = 0;
  let sumKMin = 0;
  let sumKMax = 0;
  const kMinArr: number[] = [];
  const kMaxArr: number[] = [];

  for (let i = 0; i < m; i++) {
    const c = activeStats[i].count;
    const eligLen = activeStats[i].eligible.length;
    if (c > 6 * eligLen) return null; // exceeds max possible rolls for this single stat
    const kMin = Math.ceil(c / 6);
    const kMax = Math.min(c, eligLen);
    if (kMin > kMax) return null;
    kMinArr.push(kMin);
    kMaxArr.push(kMax);
    totalRolls += c;
    sumKMin += kMin;
    sumKMax += kMax;
  }

  if (totalRolls > 54) return null;
  if (sumKMin > 24) return null;
  if (totalRolls - Math.min(24, sumKMax) > 30) return null;

  // Suffix sums for fast pruning during backtracking
  const suffixKMin = new Array<number>(m + 1).fill(0);
  const suffixKMax = new Array<number>(m + 1).fill(0);
  const suffixRolls = new Array<number>(m + 1).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    suffixKMin[i] = suffixKMin[i + 1] + kMinArr[i];
    suffixKMax[i] = suffixKMax[i + 1] + kMaxArr[i];
    suffixRolls[i] = suffixRolls[i + 1] + activeStats[i].count;
  }

  const discLines = [0, 0, 0, 0, 0, 0];
  const chosenDiscs: number[][] = new Array(m);
  const chosenUReq: number[] = new Array(m);
  const fullDiscUpgradeCap = [5, 5, 5, 5, 5, 5];

  let nodesVisited = 0;
  const MAX_NODES = 60000;

  function dfs(idx: number, currentLinesSum: number, currentUpgradeSum: number): boolean {
    if (++nodesVisited > MAX_NODES) return false;
    if (idx === m) {
      return canRouteUpgrades(chosenUReq, chosenDiscs, fullDiscUpgradeCap);
    }

    const { count, eligible } = activeStats[idx];
    // Filter eligible discs that still have < 4 sub-stat lines
    const availDiscs = eligible.filter((d) => discLines[d] < 4);
    const kMin = kMinArr[idx];
    const kMax = Math.min(kMaxArr[idx], availDiscs.length);
    if (kMin > kMax) return false;

    // Candidate line counts k for this stat
    const kCandidates: number[] = [];
    for (let k = kMin; k <= kMax; k++) {
      const nextLinesMin = currentLinesSum + k + suffixKMin[idx + 1];
      if (nextLinesMin > 24) continue;
      const nextUpgrades = currentUpgradeSum + (count - k);
      const minFutureUpgrades = Math.max(0, suffixRolls[idx + 1] - suffixKMax[idx + 1]);
      if (nextUpgrades + minFutureUpgrades > 30) continue;
      // Also check that total lines can reach at least totalRolls - 30
      if (currentLinesSum + k + suffixKMax[idx + 1] < totalRolls - 30) continue;
      kCandidates.push(k);
    }
    if (kCandidates.length === 0) return false;

    // Shuffle kCandidates (biasing slightly toward higher k so discs fill more naturally, while still random)
    shuffle(kCandidates, rng);

    for (const k of kCandidates) {
      const uReq = count - k;
      const subsets = combinations(availDiscs, k);
      shuffle(subsets, rng);

      for (const subset of subsets) {
        for (const d of subset) discLines[d]++;
        chosenDiscs[idx] = subset;
        chosenUReq[idx] = uReq;

        // Partial flow check for stats 0..idx
        const partialOk = canRouteUpgrades(
          chosenUReq.slice(0, idx + 1),
          chosenDiscs.slice(0, idx + 1),
          fullDiscUpgradeCap,
        );

        if (partialOk && dfs(idx + 1, currentLinesSum + k, currentUpgradeSum + uReq)) {
          return true;
        }

        for (const d of subset) discLines[d]--;
        if (nodesVisited > MAX_NODES) return false;
      }
    }
    return false;
  }

  if (!dfs(0, 0, 0)) {
    return null;
  }

  // Stage 2: Randomly distribute the upgrade rolls `chosenUReq` across `chosenDiscs`
  // while maintaining exact flow feasibility at every step.
  const upgrades: number[][] = Array.from({ length: m }, () => [0, 0, 0, 0, 0, 0]);
  const remU = chosenUReq.slice();
  const remCap = [5, 5, 5, 5, 5, 5];

  let totalRemU = remU.reduce((a, b) => a + b, 0);
  while (totalRemU > 0) {
    // Pick a random stat that still needs upgrades
    const pendingStatIndices: number[] = [];
    for (let i = 0; i < m; i++) {
      if (remU[i] > 0) pendingStatIndices.push(i);
    }
    shuffle(pendingStatIndices, rng);
    const statIdx = pendingStatIndices[0];

    const candidateDiscs = chosenDiscs[statIdx].filter(
      (d) => remCap[d] > 0 && upgrades[statIdx][d] < 5,
    );
    shuffle(candidateDiscs, rng);

    let assigned = false;
    for (const d of candidateDiscs) {
      remU[statIdx]--;
      remCap[d]--;
      if (canRouteUpgrades(remU, chosenDiscs, remCap)) {
        upgrades[statIdx][d]++;
        totalRemU--;
        assigned = true;
        break;
      }
      // Undo and try next disc
      remU[statIdx]++;
      remCap[d]++;
    }

    if (!assigned) {
      // Should be unreachable by flow decomposition theorem, but guard against infinite loop
      return null;
    }
  }

  return { statDiscs: chosenDiscs, upgrades };
}

/** Fast boolean feasibility check for a given `counts` map. */
export function isSubStatConfigFeasible(
  counts: AllSubCounts,
  slot4Stat: Slot4Stat,
): boolean {
  const eligibleMap = getEligibleDiscsByStat(slot4Stat);
  const activeStats = SUB_STAT_DEFS.map((def) => ({
    key: def.key,
    count: Math.max(0, Math.floor(counts[def.key] ?? 0)),
    eligible: eligibleMap[def.key],
  }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count || a.eligible.length - b.eligible.length);

  // Deterministic rng for feasibility check
  let seed = 42;
  const detRng = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  return solveAllocation(activeStats, detRng) !== null;
}

/**
 * Validate total sub-stat counts under ZZZ 6-disc rules, and if valid,
 * randomly allocate them to Slots 1..6. If invalid, identify which specific
 * sub-stats are excessive and explain why.
 */
export function validateAndAllocateSubStats(
  rawCounts: Partial<AllSubCounts>,
  slot4Stat: Slot4Stat,
  rng: () => number = Math.random,
): SubStatAllocationResult {
  const counts: AllSubCounts = { ...DEFAULT_ALL_SUB_COUNTS };
  for (const def of SUB_STAT_DEFS) {
    const v = Number(rawCounts[def.key] ?? 0);
    counts[def.key] = Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
  }

  const eligibleMap = getEligibleDiscsByStat(slot4Stat);

  let totalRolls = 0;
  let minInitialLines = 0;
  let maxInitialLinesPossible = 0;
  let sumSingleMinUpgrades = 0;

  for (const def of SUB_STAT_DEFS) {
    const c = counts[def.key];
    if (c <= 0) continue;
    const eligCount = eligibleMap[def.key].length;
    totalRolls += c;
    minInitialLines += Math.ceil(c / 6);
    const kMax = Math.min(c, eligCount);
    maxInitialLinesPossible += kMax;
    sumSingleMinUpgrades += Math.max(0, c - kMax);
  }

  const minUpgradesRequired = Math.max(
    sumSingleMinUpgrades,
    Math.max(0, totalRolls - Math.min(24, maxInitialLinesPossible)),
  );

  const activeStats = SUB_STAT_DEFS.map((def) => ({
    key: def.key,
    count: counts[def.key],
    eligible: eligibleMap[def.key],
  }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count || a.eligible.length - b.eligible.length);

  const solution = solveAllocation(activeStats, rng);

  if (solution !== null) {
    // Build per-disc allocation objects for Slots 1..6
    const discs = {} as Record<SlotNum, DiscSlotAllocation>;
    for (const slot of [1, 2, 3, 4, 5, 6] as SlotNum[]) {
      const info = getSlotMainStatInfo(slot, slot4Stat);
      discs[slot] = {
        slot,
        mainLabel: info.mainLabel,
        conflictSubKey: info.conflictSubKey,
        subStats: [],
        lineCount: 0,
        upgradeCount: 0,
        totalRolls: 0,
      };
    }

    for (let i = 0; i < activeStats.length; i++) {
      const { key } = activeStats[i];
      const def = SUB_STAT_MAP[key];
      const discList = solution.statDiscs[i];
      for (const d of discList) {
        const slot = (d + 1) as SlotNum;
        const upg = solution.upgrades[i][d];
        const tot = 1 + upg;
        const displayText = upg > 0 ? `${def.name}+${upg}` : def.name;
        const valueText = `+${formatSubStatValue(key, tot)}`;
        discs[slot].subStats.push({
          key,
          name: def.name,
          base: 1,
          upgrades: upg,
          totalRolls: tot,
          displayText,
          valueText,
        });
        discs[slot].lineCount += 1;
        discs[slot].upgradeCount += upg;
        discs[slot].totalRolls += tot;
      }
    }

    // Sort sub-stats on each disc by totalRolls descending for clean presentation
    for (const slot of [1, 2, 3, 4, 5, 6] as SlotNum[]) {
      discs[slot].subStats.sort((a, b) => b.totalRolls - a.totalRolls);
    }

    return {
      valid: true,
      discs,
      stats: {
        totalRolls,
        minInitialLines,
        minUpgradesRequired,
      },
    };
  }

  // --- Infeasible: Diagnose exactly which sub-stat(s) exceeded limits ---
  const excessStats: StatExcessDetail[] = [];
  const slotConflictLabel = (key: SubStatKey): string | null => {
    for (const slot of [1, 2, 3, 4] as SlotNum[]) {
      const info = getSlotMainStatInfo(slot, slot4Stat);
      if (info.conflictSubKey === key) {
        return `${slot}号位主词条为【${info.mainLabel}】，该盘不可出现同名副词条，仅其余 5 个驱动盘可出现`;
      }
    }
    return null;
  };

  // 1. First check single-stat hard cap violations (c > 6 * eligible.length)
  const workingCounts: AllSubCounts = { ...counts };
  for (const def of SUB_STAT_DEFS) {
    const c = counts[def.key];
    if (c <= 0) continue;
    const eligLen = eligibleMap[def.key].length;
    const hardCap = 6 * eligLen;
    if (c > hardCap) {
      const conflictNote = slotConflictLabel(def.key);
      const reason = conflictNote
        ? `${conflictNote}（单盘最多 1初始+5强化=6 个，5 盘上限 ${hardCap} 个）`
        : `6 个驱动盘单盘最多 1初始+5强化=6 个，6 盘上限 ${hardCap} 个`;
      excessStats.push({
        key: def.key,
        name: def.name,
        current: c,
        maxAllowed: hardCap,
        excess: c - hardCap,
        reason,
      });
      workingCounts[def.key] = hardCap;
    }
  }

  // 2. If still infeasible (or if no single stat exceeded its hard cap),
  //    check each active stat to see if reducing it alone makes the config valid,
  //    or greedily reduce the highest-count stats to find exact excess amounts.
  if (!isSubStatConfigFeasible(workingCounts, slot4Stat)) {
    // Check single-stat reductions on the original counts for each top active stat
    const activeSorted = SUB_STAT_DEFS.filter((d) => workingCounts[d.key] > 0).sort(
      (a, b) =>
        workingCounts[b.key] - workingCounts[a.key] ||
        eligibleMap[a.key].length - eligibleMap[b.key].length,
    );

    let foundSingleFix = false;
    for (const def of activeSorted) {
      const cur = workingCounts[def.key];
      // Test if setting this stat to 0 makes the rest feasible
      const testZero = { ...workingCounts, [def.key]: 0 };
      if (isSubStatConfigFeasible(testZero, slot4Stat)) {
        // Binary search max valid value for def.key in [0..cur-1]
        let lo = 0;
        let hi = cur - 1;
        let best = 0;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (isSubStatConfigFeasible({ ...workingCounts, [def.key]: mid }, slot4Stat)) {
            best = mid;
            lo = mid + 1;
          } else {
            hi = mid - 1;
          }
        }
        const eligLen = eligibleMap[def.key].length;
        const minUpg = Math.max(0, cur - eligLen);
        const conflictNote = slotConflictLabel(def.key);
        const reasonParts: string[] = [];
        if (conflictNote) reasonParts.push(conflictNote);
        if (minUpg > 0) {
          reasonParts.push(`最多占 ${eligLen} 盘，当前 ${cur} 个词条至少占用 ${minUpg} 次强化`);
        } else {
          reasonParts.push(`当前 ${cur} 个词条导致总词条数/槽位超出上限`);
        }
        excessStats.push({
          key: def.key,
          name: def.name,
          current: counts[def.key],
          maxAllowed: best,
          excess: counts[def.key] - best,
          reason: reasonParts.join('；'),
        });
        foundSingleFix = true;
      }
    }

    // If no single stat reduction alone can fix it (e.g. multiple stats are simultaneously way too high),
    // greedily reduce the largest stats until feasible so we can report all offending stats.
    if (!foundSingleFix) {
      const reduced = { ...workingCounts };
      while (!isSubStatConfigFeasible(reduced, slot4Stat)) {
        // Find stat with highest count (tie-break by highest min-upgrades)
        let worstKey: SubStatKey | null = null;
        let worstScore = -1;
        for (const def of SUB_STAT_DEFS) {
          const v = reduced[def.key];
          if (v <= 0) continue;
          const eligLen = eligibleMap[def.key].length;
          const score = v * 10 + (6 - eligLen);
          if (score > worstScore) {
            worstScore = score;
            worstKey = def.key;
          }
        }
        if (!worstKey) break;
        reduced[worstKey]--;
      }

      for (const def of activeSorted) {
        const orig = counts[def.key];
        const target = reduced[def.key];
        if (orig > target) {
          const existing = excessStats.find((e) => e.key === def.key);
          const eligLen = eligibleMap[def.key].length;
          const conflictNote = slotConflictLabel(def.key);
          const reason = conflictNote
            ? `${conflictNote}，与其他高词条共同超出 6 盘强化/词条容量上限`
            : `最多占 ${eligLen} 盘，与其他高词条共同超出 6 盘强化/词条容量上限`;
          if (existing) {
            existing.maxAllowed = target;
            existing.excess = orig - target;
            existing.reason = reason;
          } else {
            excessStats.push({
              key: def.key,
              name: def.name,
              current: orig,
              maxAllowed: target,
              excess: orig - target,
              reason,
            });
          }
        }
      }
    }
  }

  // Build human-readable summary reason
  const summaryReasons: string[] = [];
  if (totalRolls > 54) {
    summaryReasons.push(`副词条总数 (${totalRolls} 个) 超出 6 盘上限 54 个（多了 ${totalRolls - 54} 个）`);
  }
  if (minUpgradesRequired > 30) {
    summaryReasons.push(
      `所需强化次数至少 ${minUpgradesRequired} 次，超出 6 盘总强化上限 30 次（多了 ${minUpgradesRequired - 30} 次强化）`,
    );
  }
  if (minInitialLines > 24) {
    summaryReasons.push(
      `所需初始副词条槽位至少 ${minInitialLines} 个，超出 6 盘上限 24 个（每盘最多 4 个词条）`,
    );
  }
  if (summaryReasons.length === 0) {
    summaryReasons.push('受主副词条不可重复及单盘最多 4 词条 + 5 强化限制，当前词条组合无法分配到 6 个驱动盘');
  }

  return {
    valid: false,
    errorSummary: summaryReasons.join('；'),
    excessStats,
    stats: {
      totalRolls,
      minInitialLines,
      minUpgradesRequired,
    },
  };
}
