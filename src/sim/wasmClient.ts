/**
 * ZZZ 3.4.5 双引擎 WebAssembly + Web Worker 客户端桥接层 (`zzz-sun344` + `zzz-uni344`)
 *
 * 特性与设计说明：
 * 1. 零外部依赖，纯异步非阻塞执行：所有重算 (`replay`) 与搜轴 (`search`) 均在后台 Web Worker (`./wasm/simWorker.js`) 内运行，主线程 0 卡顿。
 * 2. 多核并行与微信/QQ 单核 100% 兼容：
 *    - 当 `window.crossOriginIsolated === true` 且硬件线程 > 1 时，进入 `'multithread'` 多 Worker 分片并行模式（共享单次编译的 `WebAssembly.Module`，将 LNS 多誉种子滑窗精修 / 多分片束搜索并行分发至多个独立线性内存 Worker，单 Worker 内存上限 `<= 256 MB` 兼容 iOS Safari）。
 *    - 当处于微信/QQ 内置浏览器或无 COOP/COEP 环境 (`!crossOriginIsolated` / 无 `SharedArrayBuffer`) 时，自动平滑降级为 `'singlethread'` 单核后台 Worker 模式，功能与计算精度 100% 一致。
 * 3. 数据与 WASM 代码彻底解耦（支持 `#/ops` 纯倍率热更新）：
 *    - 支持调用方显式传入热更后的 `specJson` / `catalogJson`（字符串或对象均可），WASM 内部按内容哈希自动失效缓存并立即按新倍率重算/搜轴，无需重编 WASM。
 *    - 若未显式传入 `specJson` / `catalogJson`，客户端会自动按 `/api/specs/specs/...` -> `./sim-data/specs/...` 顺序拉取并缓存。
 * 4. 挽昼专核 (`sun344`) 自由换盘与副词条微调双模式说明：
 *    - 默认原生专核模式 (`useUniEngineForFreeGear` 未开启)：直接在 `zzz-sun344` 内部执行 `< 2 ms` 换盘重算，支持 32 套驱动盘 4+2 切换、音擎精炼/下位替换、30 词条副词条重分配与面板增量 (`gearOverrides`)，100% 完整保留危局 52 期「新生之结」四阶段专怪状态机（多段弹刀、控制角力、紫色侵蚀壁垒、双始主祭剑无敌转场）！当切换命座（如 M1 -> M0 改变开局 120 愿火）导致原轴个别动作提前时，内置自适应修复器会自动微调合法帧序。
 *    - 通用总线自由混搭模式 (`useUniEngineForFreeGear: true`)：自动将挽昼 (`1601`) + 洛克茜 (`1621`) + 知更鸟 (`1661`) 路由至 `zzz-uni344` 通用插件总线 (`bus.rs`)，支持跨职业佩戴全库任意 106 把音擎与 32 套驱动盘动态触发状态机。
 * 5. 搜索期间自动申请屏幕常亮锁 (`navigator.wakeLock?.request('screen')`)，结束/报错/`cancel()` 时自动释放；`cancel()` 立即 `worker.terminate()` 秒断长耗时搜索并后台热替新 Worker。
 */

import type {
  MacroAction,
  SearchResultData,
  SunBuildConfig,
  UniversalCatalogSummary,
} from './types';

export type SimWasmMode = 'multithread' | 'singlethread';

export interface SimWasmInitStatus {
  mode: SimWasmMode;
  threads: number;
  sunReady: boolean;
  uniReady: boolean;
}

export interface SimSearchHandle<T = SearchResultData> {
  promise: Promise<T>;
  cancel: () => void;
}

export type SimProgressCallback = (stage: string, pct?: number) => void;

/**
 * 面板属性直接增量覆盖（供高玩微调毕业面板或对比单词条收益）
 */
export interface SlotStatDeltaOverride {
  outDef?: number;
  atk?: number;
  hp?: number;
  critRate?: number;
  critDmg?: number;
  commonDmg?: number;
  sharpDmg?: number;
  penRatio?: number;
  flatPen?: number;
  impact?: number;
  ap?: number;
  er?: number;
}

/**
 * 挽昼专核单角色装备与副词条覆盖
 */
export interface SunSlotGearOverride {
  /** 自定义音擎 ID 或中文名（如 `14160` / `"蜃炎梦火"` / `"血髓秘匣"`） */
  wEngine?: string | number | null;
  /** 驱动盘 4 件套 ID 或中文名（支持全 32 套驱动盘，如 `34300` / `"星之碑"` / `34200` / `"荆棘玫瑰"`） */
  disc4?: string | number | null;
  /** 驱动盘 2 件套 ID 或中文名（支持全 32 套驱动盘） */
  disc2?: string | number | null;
  /** 完整副词条词条数替换（键支持 `DefPct`/`AtkPct`/`HpPct`/`CritRate`/`CritDmg`/`AnomalyProficiency`/`FlatPen`） */
  subRolls?: Record<string, number> | null;
  /** 相对默认毕业模板的副词条增减词条数（例如 `{ DefPct: 2, CritRate: -2 }`） */
  subRollsDelta?: Record<string, number> | null;
  /** 直接面板增量微调 */
  statDeltas?: SlotStatDeltaOverride | null;
}

export interface SunSquadGearOverrides {
  sun?: SunSlotGearOverride | null;
  roxy?: SunSlotGearOverride | null;
  robin?: SunSlotGearOverride | null;
}

/**
 * `replaySun344` 请求参数（同时兼容 camelCase 与 snake_case）
 */
export interface SunReplayRequest {
  /** 待重算动作序列（来自预置 JSON 或上次搜轴结果的 `macros` 字段） */
  macros: MacroAction[];
  /** 可选热更版 `sun_team_344_spec.json`（字符串或已解析对象；省略时自动拉取当前激活版本） */
  specJson?: string | Record<string, unknown>;
  spec_json?: string | Record<string, unknown>;
  /** 配装 6 码结构，也可直接传下方独立字段 */
  build?: Partial<SunBuildConfig>;
  sunM?: number;
  sun_m?: number;
  sunW?: number;
  sun_w?: number;
  roxyM?: number;
  roxy_m?: number;
  roxyW?: number;
  roxy_w?: number;
  robinM?: number;
  robin_m?: number;
  robinW?: number;
  robin_w?: number;
  /** Boss 索引（0=自律屠夫, 1=实测对标屠夫, 2=危局52新生之结, 3+=53期Boss等；也可传 `bossName` 自动匹配） */
  bossIdx?: number;
  boss_idx?: number;
  bossName?: string;
  boss_name?: string;
  /** Boss 行为模式：`'Autonomous'` | `'CntlzywIntervals'` | `'NascentKnotDA52'` */
  bossMode?: string;
  boss_mode?: string;
  /** 天气 / 危局增益 ID（如 `69015201` `[攻砭]`，`0` 表示无自选天气） */
  stageBuffId?: number;
  stage_buff_id?: number;
  /** 是否开启新生之结场地固定环境（`bossMode === 'NascentKnotDA52'` 时默认开启） */
  knotEnv?: boolean;
  knot_env?: boolean;
  /** 是否解除 29 管血斩杀上限测满 180s 总伤 */
  uncappedHp?: boolean;
  uncapped_hp?: boolean;
  /** 4+2 驱动盘、音擎与副词条微调覆盖 */
  gearOverrides?: SunSquadGearOverrides;
  gear_overrides?: SunSquadGearOverrides;
  /**
   * 设为 `true` 时，自动调用 `zzz-uni344` 通用全量装备总线重算 `1601+1621+1661` 自由跨职业音擎/驱动盘组合
   * （注意：若 `macros` 为 `sun344` 专核宏且开启此项，会自动用 `effort=0` 在通用核瞬时生成对应排轴后重算）。
   */
  useUniEngineForFreeGear?: boolean;
  /** 严格模式：默认 `false`（当命座/回能变化使某步动作暂不可用时自动微调修复而不报错） */
  strict?: boolean;
}

/**
 * `searchSun344` 浏览器本地搜轴请求参数
 */
export interface SunSearchRequest extends Omit<SunReplayRequest, 'macros' | 'strict'> {
  /** 搜索强度：`0` (极速 ~0.2s) | `1` (标准推荐 ~0.8s) | `2` (深度精修 ~3-6s) | `3` (极限穷举) */
  effort?: number;
  /** 可选当前已载入的动作序列种子：若在新配装/天气下依然严格合法，将参与终局精修并保底不劣化结果 */
  seedMacros?: MacroAction[];
}

/**
 * `replayUni344` 通用全角色引擎重算请求参数
 * 支持两种模式：
 * 1) 自由编队模式 (`agents: [a0, a1, a2]`)：支持全 65 代理人、106 音擎、32 驱动盘 4+2、43 邦布、33 靶标、主副词条与天气 Buff。
 * 2) 伴随规格模式 (`specJson`)：直接重算 `manifest.json` 中带 `specPath` 的预置专队排轴。
 */
export interface UniReplayRequest {
  /** 待重算宏序列（`SearchResultData.macros` 字符串数组） */
  macros: MacroAction[];
  /** 可选热更版 `universal_catalog_runtime.json`（字符串或对象；省略时自动拉取当前激活版本） */
  catalogJson?: string | Record<string, unknown>;
  catalog_json?: string | Record<string, unknown>;
  /** 可选专队规格 JSON（用于重算带 `specPath` 的 Oracle 预置队） */
  specJson?: string | Record<string, unknown>;
  spec_json?: string | Record<string, unknown>;
  /** 3 名出战代理人 ID 或中英文名（如 `['1091', '1481', '1661']` 或 `['星见雅', '琉音', '知更鸟']`） */
  agents?: [string | number, string | number, string | number];
  /** 邦布 ID、名称或 `'auto'`（默认 `'auto'`） */
  bangboo?: string | number;
  bangbooStar?: number;
  bangboo_star?: number;
  bangbooIdx?: number;
  /** Boss MID 或中文名（如 `'31032'` / `'秽息司祭'` / `'99001'`） */
  boss?: string | number;
  bossIdx?: number;
  boss_idx?: number;
  /** 危局天气增益 ID（省略则取该 Boss 默认推荐天气；传 `0` 关闭天气增益） */
  stageBuffId?: number | null;
  stage_buff_id?: number | null;
  /** 三人影画等级 `[M0, M1, M2]`（`0..6`） */
  m?: [number, number, number];
  /** 三人音擎阶数 `[W0, W1, W2]`（`0`=免费A级满精R5，`1..5`=S级/自定义音擎 R1..R5） */
  w?: [number, number, number];
  /** 三人潜能觉醒等级 `[A0, A1, A2]` */
  awaken?: [number, number, number];
  /** 三人槽位自定义音擎 ID 或中文名（106 把音擎任意指定；`null`/`''` 保持角色默认专武） */
  weapons?: [
    string | number | null | undefined,
    string | number | null | undefined,
    string | number | null | undefined,
  ];
  /** 三人槽位自定义 4 件套驱动盘 ID 或中文名（32 套驱动盘任意指定） */
  disc4?: [
    string | number | null | undefined,
    string | number | null | undefined,
    string | number | null | undefined,
  ];
  /** 三人槽位自定义 2 件套驱动盘 ID 或中文名（32 套驱动盘任意指定） */
  disc2?: [
    string | number | null | undefined,
    string | number | null | undefined,
    string | number | null | undefined,
  ];
  /** 三人 4/5/6 号位主词条覆盖（如 `{ slot4: 'CritRatePct', slot5: 'ElemDmgPct', slot6: 'AtkPct' }`） */
  mainStats?: [
    Record<string, string> | null | undefined,
    Record<string, string> | null | undefined,
    Record<string, string> | null | undefined,
  ];
  /** 三人副词条词条数覆盖（如 `{ CritRate: 10, CritDmg: 12, AtkPct: 8 }`） */
  subRolls?: [
    Record<string, number> | null | undefined,
    Record<string, number> | null | undefined,
    Record<string, number> | null | undefined,
  ];
  /** 三人局外面板直接微调增量 */
  statDeltas?: [
    SlotStatDeltaOverride | null | undefined,
    SlotStatDeltaOverride | null | undefined,
    SlotStatDeltaOverride | null | undefined,
  ];
  /** Oracle 预置队可选槽位替换（如 `[0, 1, 3]`） */
  slots?: [number, number, number];
  /** 是否解除斩杀血量上限测满全程 */
  uncappedHp?: boolean;
  uncapped_hp?: boolean;
  /** 模拟时长秒数（默认 `180`） */
  horizon?: number;
  /** 严格模式：默认 `false` */
  strict?: boolean;
}

/**
 * `searchUni344` 通用全角色引擎本地搜轴请求参数
 */
export interface UniSearchRequest extends Omit<UniReplayRequest, 'macros' | 'strict'> {
  /** 搜索强度：`0` (极速 ~0.1s) | `1` (标准推荐 ~0.4s) | `2` (深度精修 ~1.5-3s) | `3` (极限) */
  effort?: number;
}

// ============================================================================
// 内部状态：WASM 模块预编译缓存、规格缓存、Worker 池与防息屏锁
// ============================================================================

interface PendingCall {
  resolve: (val: any) => void;
  reject: (err: Error) => void;
  onProgress?: SimProgressCallback;
}

interface ManagedWorker {
  id: number;
  worker: Worker;
  busy: boolean;
  readyPromise: Promise<{ sunReady: boolean; uniReady: boolean }>;
  pending: Map<number, PendingCall>;
  syncedSunHash: string | null;
  syncedUniHash: string | null;
}

let cachedStatus: SimWasmInitStatus | null = null;
let initPromise: Promise<SimWasmInitStatus> | null = null;

let compiledSunModule: WebAssembly.Module | null = null;
let compiledUniModule: WebAssembly.Module | null = null;

let cachedSunSpecStr: string | null = null;
let cachedSunSpecHash: string | null = null;
let cachedUniCatalogStr: string | null = null;
let cachedUniCatalogHash: string | null = null;

const workerPool: ManagedWorker[] = [];
let nextWorkerId = 1;
let nextReqId = 1;

// Screen WakeLock 引用计数
let activeSearchCount = 0;
let currentWakeLock: any = null;

function fastStringTag(s: string): string {
  let h = 2166136261 >>> 0;
  const step = Math.max(1, Math.floor(s.length / 4096));
  for (let i = 0; i < s.length; i += step) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return `${s.length}:${h.toString(16)}`;
}

function resolveBaseRootUrl(): string {
  const envBase = (import.meta as any)?.env?.BASE_URL ?? './';
  if (typeof window === 'undefined' || !window.location) {
    return envBase.endsWith('/') ? envBase : `${envBase}/`;
  }
  const cleanHref = window.location.href.split('#')[0].split('?')[0];
  return new URL(envBase, cleanHref).href.replace(/\/?$/, '/');
}

function resolveWasmAssetUrl(filename: string): string {
  return new URL(`wasm/${filename}`, resolveBaseRootUrl()).href;
}

function detectParallelCapability(): { mode: SimWasmMode; threads: number } {
  const isolated =
    typeof globalThis !== 'undefined' &&
    (globalThis as any).crossOriginIsolated === true &&
    typeof SharedArrayBuffer !== 'undefined';
  const hw =
    typeof navigator !== 'undefined' && typeof navigator.hardwareConcurrency === 'number'
      ? navigator.hardwareConcurrency
      : 1;
  if (isolated && hw > 1) {
    return {
      mode: 'multithread',
      threads: Math.min(Math.max(2, hw), 6),
    };
  }
  return {
    mode: 'singlethread',
    threads: 1,
  };
}

async function compileWasmOnce(filename: string): Promise<WebAssembly.Module | null> {
  if (typeof WebAssembly === 'undefined') return null;
  const url = resolveWasmAssetUrl(filename);
  try {
    if (typeof WebAssembly.compileStreaming === 'function') {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
      const ct = resp.headers.get('content-type') || '';
      if (ct.includes('application/wasm')) {
        return await WebAssembly.compileStreaming(resp);
      }
      const buf = await resp.arrayBuffer();
      return await WebAssembly.compile(buf);
    }
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
    const buf = await resp.arrayBuffer();
    return await WebAssembly.compile(buf);
  } catch {
    return null;
  }
}

async function fetchTextWithFallback(relSpecPath: string): Promise<string> {
  const root = resolveBaseRootUrl();
  const candidates = [
    new URL(`api/specs/${relSpecPath}`, root).href,
    new URL(`sim-data/${relSpecPath}`, root).href,
  ];
  let lastErr: unknown = null;
  for (const url of candidates) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) continue;
      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('text/html')) continue;
      const txt = await resp.text();
      const trimmed = txt.trimStart();
      if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) continue;
      return txt;
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `Failed to load simulation spec '${relSpecPath}': ${
      lastErr instanceof Error ? lastErr.message : 'not found'
    }`,
  );
}

async function ensureSunSpecString(
  explicit?: string | Record<string, unknown>,
): Promise<{ json: string; hash: string }> {
  if (explicit !== undefined && explicit !== null) {
    const json = typeof explicit === 'string' ? explicit : JSON.stringify(explicit);
    const hash = fastStringTag(json);
    cachedSunSpecStr = json;
    cachedSunSpecHash = hash;
    return { json, hash };
  }
  if (cachedSunSpecStr && cachedSunSpecHash) {
    return { json: cachedSunSpecStr, hash: cachedSunSpecHash };
  }
  const txt = await fetchTextWithFallback('specs/sun_team_344_spec.json');
  const hash = fastStringTag(txt);
  cachedSunSpecStr = txt;
  cachedSunSpecHash = hash;
  return { json: txt, hash };
}

async function ensureUniCatalogString(
  explicit?: string | Record<string, unknown>,
): Promise<{ json: string; hash: string }> {
  if (explicit !== undefined && explicit !== null) {
    const json = typeof explicit === 'string' ? explicit : JSON.stringify(explicit);
    const hash = fastStringTag(json);
    cachedUniCatalogStr = json;
    cachedUniCatalogHash = hash;
    return { json, hash };
  }
  if (cachedUniCatalogStr && cachedUniCatalogHash) {
    return { json: cachedUniCatalogStr, hash: cachedUniCatalogHash };
  }
  const txt = await fetchTextWithFallback('specs/universal_catalog_runtime.json');
  const hash = fastStringTag(txt);
  cachedUniCatalogStr = txt;
  cachedUniCatalogHash = hash;
  return { json: txt, hash };
}

/**
 * 主动注入或更新热更后的 `sun_team_344_spec.json` / `universal_catalog_runtime.json` 内存缓存
 */
export function setCachedSimSpecs(specs: {
  sunSpecJson?: string | Record<string, unknown>;
  uniCatalogJson?: string | Record<string, unknown>;
}): void {
  if (specs.sunSpecJson !== undefined) {
    const s =
      typeof specs.sunSpecJson === 'string'
        ? specs.sunSpecJson
        : JSON.stringify(specs.sunSpecJson);
    cachedSunSpecStr = s;
    cachedSunSpecHash = fastStringTag(s);
  }
  if (specs.uniCatalogJson !== undefined) {
    const u =
      typeof specs.uniCatalogJson === 'string'
        ? specs.uniCatalogJson
        : JSON.stringify(specs.uniCatalogJson);
    cachedUniCatalogStr = u;
    cachedUniCatalogHash = fastStringTag(u);
  }
}

/**
 * 清空本地规格缓存（如 `#/ops` 发布热更新或回滚版本后调用，下次重算将自动拉取最新云端倍率）
 */
export function clearSimSpecCache(): void {
  cachedSunSpecStr = null;
  cachedSunSpecHash = null;
  cachedUniCatalogStr = null;
  cachedUniCatalogHash = null;
}

function createAbortError(msg = 'Search cancelled by user'): Error {
  if (typeof DOMException !== 'undefined') {
    return new DOMException(msg, 'AbortError');
  }
  const err = new Error(msg);
  err.name = 'AbortError';
  return err;
}

async function acquireSearchWakeLock(): Promise<void> {
  activeSearchCount += 1;
  if (activeSearchCount === 1 && !currentWakeLock) {
    try {
      const wl = (navigator as any)?.wakeLock;
      if (wl && typeof wl.request === 'function') {
        currentWakeLock = await wl.request('screen');
      }
    } catch {
      // 浏览器无权限或页面后台时静默忽略，不阻塞搜索
    }
  }
}

async function releaseSearchWakeLock(): Promise<void> {
  activeSearchCount = Math.max(0, activeSearchCount - 1);
  if (activeSearchCount === 0 && currentWakeLock) {
    const lock = currentWakeLock;
    currentWakeLock = null;
    try {
      if (typeof lock.release === 'function') {
        await lock.release();
      }
    } catch {
      // ignore
    }
  }
}

function spawnManagedWorker(): ManagedWorker {
  const workerUrl = resolveWasmAssetUrl('simWorker.js');
  // 通过变量传递 URL，避免 Vite 静态转换误打包 public/wasm/ 下的运行时脚本
  const w = new Worker(workerUrl, { type: 'module' });
  const pending = new Map<number, PendingCall>();

  const mw: ManagedWorker = {
    id: nextWorkerId++,
    worker: w,
    busy: false,
    readyPromise: Promise.resolve({ sunReady: false, uniReady: false }),
    pending,
    syncedSunHash: null,
    syncedUniHash: null,
  };

  w.onmessage = (ev: MessageEvent) => {
    const data = ev.data;
    if (!data || typeof data.reqId !== 'number') return;
    const entry = pending.get(data.reqId);
    if (!entry) return;

    if (data.type === 'progress') {
      entry.onProgress?.(data.stage ?? '计算中…', data.pct);
      return;
    }

    pending.delete(data.reqId);
    mw.busy = pending.size > 0;
    if (data.ok) {
      entry.resolve(data.result);
    } else {
      entry.reject(new Error(data.error || 'WASM Worker execution failed'));
    }
  };

  w.onerror = (ev: ErrorEvent) => {
    const err = new Error(ev.message || 'Web Worker crashed');
    for (const [, entry] of pending) {
      entry.reject(err);
    }
    pending.clear();
    mw.busy = false;
  };

  mw.readyPromise = callWorkerRaw<{ sunReady: boolean; uniReady: boolean }>(mw, 'init', {
    wasmBaseUrl: resolveWasmAssetUrl(''),
    sunModule: compiledSunModule,
    uniModule: compiledUniModule,
  });

  return mw;
}

function callWorkerRaw<T>(
  mw: ManagedWorker,
  cmd: string,
  payload: Record<string, unknown>,
  onProgress?: SimProgressCallback,
): Promise<T> {
  const reqId = nextReqId++;
  mw.busy = true;
  return new Promise<T>((resolve, reject) => {
    mw.pending.set(reqId, { resolve, reject, onProgress });
    mw.worker.postMessage({ reqId, cmd, payload });
  });
}

function terminateAndRemoveWorker(mw: ManagedWorker, reason: Error): void {
  try {
    mw.worker.terminate();
  } catch {
    // ignore
  }
  for (const [, entry] of mw.pending) {
    entry.reject(reason);
  }
  mw.pending.clear();
  mw.busy = false;
  const idx = workerPool.indexOf(mw);
  if (idx >= 0) {
    workerPool.splice(idx, 1);
  }
}

async function acquireIdleWorker(): Promise<ManagedWorker> {
  await initSimWasm();
  const maxPool = cachedStatus?.threads ?? 1;
  let idle = workerPool.find((w) => !w.busy);
  if (!idle) {
    if (workerPool.length < maxPool) {
      idle = spawnManagedWorker();
      workerPool.push(idle);
    } else {
      // 若池中全部忙碌（如并发触发多次毫秒重算），复用等待队列最短的 Worker（单次 replay < 2ms）
      idle = workerPool.reduce((a, b) => (a.pending.size <= b.pending.size ? a : b));
    }
  }
  await idle.readyPromise;
  return idle;
}

async function syncSunSpecToWorker(
  mw: ManagedWorker,
  explicit?: string | Record<string, unknown>,
): Promise<void> {
  const { json, hash } = await ensureSunSpecString(explicit);
  if (mw.syncedSunHash !== hash) {
    await callWorkerRaw(mw, 'cache_sun_spec', { specJson: json, hash });
    mw.syncedSunHash = hash;
  }
}

async function syncUniCatalogToWorker(
  mw: ManagedWorker,
  explicit?: string | Record<string, unknown>,
): Promise<void> {
  const { json, hash } = await ensureUniCatalogString(explicit);
  if (mw.syncedUniHash !== hash) {
    await callWorkerRaw(mw, 'cache_uni_catalog', { catalogJson: json, hash });
    mw.syncedUniHash = hash;
  }
}

function enrichResultTags(res: SearchResultData, engine: 'sun344' | 'uni344'): SearchResultData {
  res.engine = engine;
  if (typeof res.ult_count !== 'number') {
    if (engine === 'sun344') {
      res.ult_count = Array.isArray(res.macros)
        ? res.macros.filter((m) => m === 'SunUlt1').length
        : 0;
    } else {
      res.ult_count = Array.isArray(res.rows)
        ? res.rows.filter(
            (r) =>
              (r.actor_slot === 0 || (res.agent_names && r.actor === res.agent_names[0])) &&
              typeof r.cat === 'string' &&
              r.cat.includes('终结技'),
          ).length
        : 0;
    }
  }
  if (!res.rhythm_tag) {
    res.rhythm_tag = `${res.stun_count ?? 0}失衡${res.ult_count ?? 0}大`;
  }
  return res;
}

// ============================================================================
// 公开导出 API
// ============================================================================

/**
 * 初始化 `zzz-sun344` 与 `zzz-uni344` 双核 WASM 模块及后台 Web Worker 池（幂等，可重复调用）。
 */
export async function initSimWasm(): Promise<SimWasmInitStatus> {
  if (cachedStatus) return cachedStatus;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const cap = detectParallelCapability();
    const [sunMod, uniMod] = await Promise.all([
      compileWasmOnce('zzz_sun344_bg.wasm'),
      compileWasmOnce('zzz_uni344_bg.wasm'),
    ]);
    compiledSunModule = sunMod;
    compiledUniModule = uniMod;

    // 首发启动主工作线程验证双 WASM 引擎就绪态；其余分片线程按需热启动
    const primary = spawnManagedWorker();
    workerPool.push(primary);
    const ready = await primary.readyPromise;

    cachedStatus = {
      mode: cap.mode,
      threads: cap.threads,
      sunReady: ready.sunReady,
      uniReady: ready.uniReady,
    };
    return cachedStatus;
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

/**
 * 同步读取已初始化的 WASM 状态（未初始化时返回 `null`）。
 */
export function getSimWasmStatus(): SimWasmInitStatus | null {
  return cachedStatus;
}

function normalizeSunPayload(params: SunReplayRequest | SunSearchRequest): Record<string, unknown> {
  const b = params.build ?? {};
  const sunM = params.sunM ?? params.sun_m ?? b.sun_m ?? 0;
  const sunW = params.sunW ?? params.sun_w ?? b.sun_w ?? 1;
  const roxyM = params.roxyM ?? params.roxy_m ?? b.roxy_m ?? 0;
  const roxyW = params.roxyW ?? params.roxy_w ?? b.roxy_w ?? 1;
  const robinM = params.robinM ?? params.robin_m ?? b.robin_m ?? 0;
  const robinW = params.robinW ?? params.robin_w ?? b.robin_w ?? 1;
  const bossMode = params.bossMode ?? params.boss_mode ?? 'NascentKnotDA52';
  const stageBuffId =
    params.stageBuffId ??
    params.stage_buff_id ??
    (bossMode === 'NascentKnotDA52' ? 69015201 : 0);

  return {
    sun_m: sunM,
    sun_w: sunW,
    roxy_m: roxyM,
    roxy_w: roxyW,
    robin_m: robinM,
    robin_w: robinW,
    boss_idx: params.bossIdx ?? params.boss_idx,
    boss_name: params.bossName ?? params.boss_name,
    boss_mode: bossMode,
    stage_buff_id: stageBuffId,
    knot_env: params.knotEnv ?? params.knot_env,
    uncapped_hp: params.uncappedHp ?? params.uncapped_hp ?? false,
    gear_overrides: params.gearOverrides ?? params.gear_overrides ?? null,
  };
}

function normalizeUniPayload(params: UniReplayRequest | UniSearchRequest): Record<string, unknown> {
  const rawSpec = params.specJson ?? params.spec_json;
  const specStr =
    rawSpec !== undefined && rawSpec !== null
      ? typeof rawSpec === 'string'
        ? rawSpec
        : JSON.stringify(rawSpec)
      : undefined;

  return {
    spec_json: specStr,
    agents: params.agents ? params.agents.map((x) => String(x)) : undefined,
    bangboo: params.bangboo !== undefined ? String(params.bangboo) : 'auto',
    bangboo_star: params.bangbooStar ?? params.bangboo_star ?? 5,
    bangboo_idx: params.bangbooIdx,
    boss: params.boss !== undefined ? String(params.boss) : '31032',
    boss_idx: params.bossIdx ?? params.boss_idx ?? 0,
    stage_buff_id: params.stageBuffId ?? params.stage_buff_id ?? undefined,
    m: params.m ?? [0, 0, 0],
    w: params.w ?? [1, 1, 1],
    awaken: params.awaken ?? [0, 0, 0],
    weapons: params.weapons
      ? params.weapons.map((v) => (v === null || v === undefined || v === '' ? null : String(v)))
      : [null, null, null],
    disc4: params.disc4
      ? params.disc4.map((v) => (v === null || v === undefined || v === '' ? null : String(v)))
      : [null, null, null],
    disc2: params.disc2
      ? params.disc2.map((v) => (v === null || v === undefined || v === '' ? null : String(v)))
      : [null, null, null],
    main_stats: params.mainStats ?? [null, null, null],
    sub_rolls: params.subRolls ?? [null, null, null],
    stat_deltas: params.statDeltas ?? [null, null, null],
    slots: params.slots,
    uncapped_hp: params.uncappedHp ?? params.uncapped_hp ?? false,
    horizon: params.horizon ?? 180.0,
  };
}

/**
 * 挽昼专核 (`zzz-sun344`) 毫秒级排轴重算 (`< 5 ms`)
 * 支持命座、音擎精炼、32 套驱动盘 4+2、副词条、天气 Buff 与靶标切换，并自动返回 15 乘区单招透视快照。
 */
export async function replaySun344(params: SunReplayRequest): Promise<SearchResultData> {
  if (params.useUniEngineForFreeGear) {
    const g = params.gearOverrides ?? params.gear_overrides ?? {};
    const b = params.build ?? {};
    const m: [number, number, number] = [
      params.sunM ?? params.sun_m ?? b.sun_m ?? 0,
      params.roxyM ?? params.roxy_m ?? b.roxy_m ?? 0,
      params.robinM ?? params.robin_m ?? b.robin_m ?? 0,
    ];
    const w: [number, number, number] = [
      params.sunW ?? params.sun_w ?? b.sun_w ?? 1,
      params.roxyW ?? params.roxy_w ?? b.roxy_w ?? 1,
      params.robinW ?? params.robin_w ?? b.robin_w ?? 1,
    ];
    const allStrings =
      Array.isArray(params.macros) &&
      params.macros.length > 0 &&
      params.macros.every((x) => typeof x === 'string' && x.includes(':'));
    if (allStrings) {
      return replayUni344({
        macros: params.macros,
        agents: ['1601', '1621', '1661'],
        boss: params.bossName ?? params.boss_name ?? '31821',
        stageBuffId: params.stageBuffId ?? params.stage_buff_id,
        m,
        w,
        weapons: [g.sun?.wEngine ?? null, g.roxy?.wEngine ?? null, g.robin?.wEngine ?? null],
        disc4: [g.sun?.disc4 ?? null, g.roxy?.disc4 ?? null, g.robin?.disc4 ?? null],
        disc2: [g.sun?.disc2 ?? null, g.roxy?.disc2 ?? null, g.robin?.disc2 ?? null],
        subRolls: [g.sun?.subRolls ?? null, g.roxy?.subRolls ?? null, g.robin?.subRolls ?? null],
        statDeltas: [
          g.sun?.statDeltas ?? null,
          g.roxy?.statDeltas ?? null,
          g.robin?.statDeltas ?? null,
        ],
        uncappedHp: params.uncappedHp ?? params.uncapped_hp,
      });
    }
    const fastHandle = searchUni344({
      effort: 0,
      agents: ['1601', '1621', '1661'],
      boss: params.bossName ?? params.boss_name ?? '31821',
      stageBuffId: params.stageBuffId ?? params.stage_buff_id,
      m,
      w,
      weapons: [g.sun?.wEngine ?? null, g.roxy?.wEngine ?? null, g.robin?.wEngine ?? null],
      disc4: [g.sun?.disc4 ?? null, g.roxy?.disc4 ?? null, g.robin?.disc4 ?? null],
      disc2: [g.sun?.disc2 ?? null, g.roxy?.disc2 ?? null, g.robin?.disc2 ?? null],
      subRolls: [g.sun?.subRolls ?? null, g.roxy?.subRolls ?? null, g.robin?.subRolls ?? null],
      statDeltas: [
        g.sun?.statDeltas ?? null,
        g.roxy?.statDeltas ?? null,
        g.robin?.statDeltas ?? null,
      ],
      uncappedHp: params.uncappedHp ?? params.uncapped_hp,
    });
    return fastHandle.promise;
  }

  const mw = await acquireIdleWorker();
  await syncSunSpecToWorker(mw, params.specJson ?? params.spec_json);
  const reqObj = {
    ...normalizeSunPayload(params),
    macros: params.macros,
    strict: params.strict ?? false,
  };
  const res = await callWorkerRaw<SearchResultData>(mw, 'sun344_replay', { req: reqObj });
  return enrichResultTags(res, 'sun344');
}

/**
 * 挽昼专核 (`zzz-sun344`) 浏览器本地最优排轴搜索
 * - 多核环境 (`crossOriginIsolated === true`) 下自动将 LNS 多誉种子滑窗精修并行分片至多个 Web Worker；
 * - 单核 / 微信内置浏览器环境下自动使用单 Worker 完整执行；
 * - 返回 `{ promise, cancel }`，`cancel()` 可在任意时刻毫秒级中断 Worker 并释放内存与屏幕锁。
 */
function isBetterSimResult(cand: SearchResultData, ref: SearchResultData): boolean {
  const ck = Boolean(cand.killed);
  const rk = Boolean(ref.killed);
  if (ck !== rk) return ck;
  const cs = cand.da_total_score ?? 0;
  const rs = ref.da_total_score ?? 0;
  if (cs !== rs) return cs > rs;
  if (ck) {
    const ct = cand.kill_time_s ?? cand.total_seconds ?? 180;
    const rt = ref.kill_time_s ?? ref.total_seconds ?? 180;
    if (Math.abs(ct - rt) > 1e-4) return ct < rt;
  }
  return (cand.total_dmg ?? 0) > (ref.total_dmg ?? 0) + 1;
}

export function searchSun344(
  params: SunSearchRequest,
  onProgress?: SimProgressCallback,
): SimSearchHandle<SearchResultData> {
  let cancelled = false;
  const activeWorkers = new Set<ManagedWorker>();
  let rejectCancel: ((err: Error) => void) | null = null;

  const cancelPromise = new Promise<never>((_, rej) => {
    rejectCancel = rej;
  });

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    const abortErr = createAbortError();
    for (const mw of Array.from(activeWorkers)) {
      terminateAndRemoveWorker(mw, abortErr);
    }
    activeWorkers.clear();
    rejectCancel?.(abortErr);
  };

  const run = async (): Promise<SearchResultData> => {
    await acquireSearchWakeLock();
    try {
      const status = await initSimWasm();
      if (cancelled) throw createAbortError();

      const effort = Math.max(0, Math.min(3, Math.round(params.effort ?? 1)));
      const normPayload = normalizeSunPayload(params);
      const baseReq = {
        ...normPayload,
        effort,
      };
      const explicitSpec = params.specJson ?? params.spec_json;

      onProgress?.('初始化挽昼专核搜索环境…', 5);

      // 若传入当前排轴种子，先用 <1ms 严格模式校验其在目标配装/天气下的合法结果，防止低档位快搜劣化已有高阶轴
      let seedBaseline: SearchResultData | null = null;
      if (Array.isArray(params.seedMacros) && params.seedMacros.length > 0) {
        const wSeed = await acquireIdleWorker();
        if (cancelled) throw createAbortError();
        await syncSunSpecToWorker(wSeed, explicitSpec);
        seedBaseline = await callWorkerRaw<SearchResultData>(wSeed, 'sun344_replay', {
          req: {
            ...normPayload,
            macros: params.seedMacros,
            strict: true,
          },
        })
          .then((r) => enrichResultTags(r, 'sun344'))
          .catch(() => null);
      }

      const useSharded = status.mode === 'multithread' && status.threads > 1 && effort >= 1;

      if (!useSharded) {
        const mw = await acquireIdleWorker();
        if (cancelled) throw createAbortError();
        activeWorkers.add(mw);
        await syncSunSpecToWorker(mw, explicitSpec);
        onProgress?.(`正在执行双阶段束搜索与 LNS 精修 (effort=${effort})…`, 25);
        const res = await callWorkerRaw<SearchResultData>(
          mw,
          'sun344_search',
          { req: baseReq },
          onProgress,
        );
        activeWorkers.delete(mw);
        onProgress?.('搜索完成', 100);
        const enriched = enrichResultTags(res, 'sun344');
        return seedBaseline && isBetterSimResult(seedBaseline, enriched) ? seedBaseline : enriched;
      }

      // 多核并行模式：Stage 1 束搜索生成多样性种子 -> Stage 2 多 Worker 并行 LNS 滑窗精修 -> Stage 3 不动点收尾
      const t0 = performance.now();
      const w0 = await acquireIdleWorker();
      if (cancelled) throw createAbortError();
      activeWorkers.add(w0);
      await syncSunSpecToWorker(w0, explicitSpec);

      onProgress?.('阶段 1/3：双阶段失衡周期束搜索 (生成多样化 180s 种子轴)…', 15);
      const stage1 = await callWorkerRaw<{
        seeds: MacroAction[][];
        nodes_expanded: number;
      }>(w0, 'sun344_stage1', { req: baseReq }, onProgress);
      activeWorkers.delete(w0);
      if (cancelled) throw createAbortError();

      const mergedSeeds =
        seedBaseline?.macros?.length ? [seedBaseline.macros, ...stage1.seeds] : stage1.seeds;
      const seedCount = mergedSeeds.length;
      const exploreLimit = effort === 1 ? Math.min(4, seedCount) : effort >= 3 ? Math.min(12, seedCount) : Math.min(8, seedCount);
      const shardCount = Math.max(1, Math.min(status.threads, exploreLimit));

      // 确保 Worker 池扩容至 shardCount
      while (workerPool.length < shardCount) {
        workerPool.push(spawnManagedWorker());
      }
      const shardWorkers: ManagedWorker[] = [];
      for (let i = 0; i < shardCount; i++) {
        const candidate = workerPool.find((x) => !x.busy && !shardWorkers.includes(x)) ?? spawnManagedWorker();
        if (!workerPool.includes(candidate)) workerPool.push(candidate);
        await candidate.readyPromise;
        await syncSunSpecToWorker(candidate, explicitSpec);
        shardWorkers.push(candidate);
        activeWorkers.add(candidate);
      }
      if (cancelled) throw createAbortError();

      onProgress?.(
        `阶段 2/3：${shardCount} 核 Web Worker 并行 LNS 滑窗精修 (${exploreLimit} 条独立种子)…`,
        38,
      );

      let finishedShards = 0;
      const shardOutputs = await Promise.all(
        shardWorkers.map((mw, shardIdx) =>
          callWorkerRaw<{ best_macros: MacroAction[]; nodes_expanded: number }>(
            mw,
            'sun344_lns_shard',
            {
              req: {
                ...baseReq,
                seeds: mergedSeeds,
                shard_idx: shardIdx,
                shard_count: shardCount,
              },
            },
          ).then((out) => {
            activeWorkers.delete(mw);
            finishedShards += 1;
            const pct = 38 + Math.round((finishedShards / shardCount) * 40);
            onProgress?.(
              `阶段 2/3：已完成 ${finishedShards}/${shardCount} 核分片精修…`,
              pct,
            );
            return out;
          }),
        ),
      );
      if (cancelled) throw createAbortError();

      const totalPreNodes =
        stage1.nodes_expanded + shardOutputs.reduce((acc, s) => acc + (s.nodes_expanded || 0), 0);
      const finalistMacros = shardOutputs
        .map((s) => s.best_macros)
        .filter((m) => Array.isArray(m) && m.length > 0);
      if (seedBaseline?.macros?.length) {
        finalistMacros.unshift(seedBaseline.macros);
      }

      const wFinal = await acquireIdleWorker();
      if (cancelled) throw createAbortError();
      activeWorkers.add(wFinal);
      await syncSunSpecToWorker(wFinal, explicitSpec);

      onProgress?.('阶段 3/3：不动点收敛精修与 15 乘区闭式校验…', 82);
      const finalRes = await callWorkerRaw<SearchResultData>(
        wFinal,
        'sun344_polish',
        {
          req: {
            ...baseReq,
            finalists: finalistMacros.length > 0 ? finalistMacros : mergedSeeds.slice(0, 1),
            prior_nodes_expanded: totalPreNodes,
            wall_elapsed_ms: Math.max(1, Math.round(performance.now() - t0)),
          },
        },
        onProgress,
      );
      activeWorkers.delete(wFinal);

      onProgress?.('搜索完成', 100);
      const enrichedFinal = enrichResultTags(finalRes, 'sun344');
      return seedBaseline && isBetterSimResult(seedBaseline, enrichedFinal)
        ? seedBaseline
        : enrichedFinal;
    } finally {
      activeWorkers.clear();
      await releaseSearchWakeLock();
    }
  };

  const promise = Promise.race([run(), cancelPromise]);
  // 防止用户调用 cancel() 后未挂载 catch 触发 UnhandledRejection
  promise.catch(() => {});
  return { promise, cancel };
}

/**
 * 通用全角色引擎 (`zzz-uni344`) 毫秒级重算 (`< 5 ms`)
 * 支持 65 代理人、106 音擎、32 驱动盘动态状态机 (`bus.rs`)、43 邦布、主副词条、天气与 33 靶标。
 */
export async function replayUni344(params: UniReplayRequest): Promise<SearchResultData> {
  const mw = await acquireIdleWorker();
  const hasCompanionSpec =
    params.specJson !== undefined && params.specJson !== null;
  if (!hasCompanionSpec || (params.agents && params.agents.length === 3)) {
    await syncUniCatalogToWorker(mw, params.catalogJson ?? params.catalog_json);
  }
  const reqObj = {
    ...normalizeUniPayload(params),
    macros: params.macros.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))),
    strict: params.strict ?? false,
  };
  const res = await callWorkerRaw<SearchResultData>(mw, 'uni344_replay', { req: reqObj });
  return enrichResultTags(res, 'uni344');
}

/**
 * 通用全角色引擎 (`zzz-uni344`) 浏览器本地自由编队搜轴
 * - 多核环境 (`crossOriginIsolated === true`) 下并行启动多组差异化束搜索分片择优；
 * - 单核 / 微信内置浏览器环境下自动降级单 Worker 完整执行；
 * - 支持屏幕防息屏锁与 `cancel()` 毫秒级终止。
 */
export function searchUni344(
  params: UniSearchRequest,
  onProgress?: SimProgressCallback,
): SimSearchHandle<SearchResultData> {
  let cancelled = false;
  const activeWorkers = new Set<ManagedWorker>();
  let rejectCancel: ((err: Error) => void) | null = null;

  const cancelPromise = new Promise<never>((_, rej) => {
    rejectCancel = rej;
  });

  const cancel = () => {
    if (cancelled) return;
    cancelled = true;
    const abortErr = createAbortError();
    for (const mw of Array.from(activeWorkers)) {
      terminateAndRemoveWorker(mw, abortErr);
    }
    activeWorkers.clear();
    rejectCancel?.(abortErr);
  };

  const run = async (): Promise<SearchResultData> => {
    await acquireSearchWakeLock();
    try {
      const status = await initSimWasm();
      if (cancelled) throw createAbortError();

      const effort = Math.max(0, Math.min(3, Math.round(params.effort ?? 1)));
      const baseReq = {
        ...normalizeUniPayload(params),
        effort,
      };
      const hasCompanionSpec =
        params.specJson !== undefined && params.specJson !== null;
      const explicitCatalog = params.catalogJson ?? params.catalog_json;

      const needCatalog =
        !hasCompanionSpec || Boolean(params.agents && params.agents.length === 3);

      onProgress?.('编译 3 角色 + 音擎 + 驱动盘插件总线…', 8);

      const useSharded = status.mode === 'multithread' && status.threads > 1 && effort >= 2;

      if (!useSharded) {
        const mw = await acquireIdleWorker();
        if (cancelled) throw createAbortError();
        activeWorkers.add(mw);
        if (needCatalog) {
          await syncUniCatalogToWorker(mw, explicitCatalog);
        }
        onProgress?.(`正在执行通用插件双阶段失衡周期束搜索 (effort=${effort})…`, 25);
        const res = await callWorkerRaw<SearchResultData>(
          mw,
          'uni344_search',
          { req: baseReq },
          onProgress,
        );
        activeWorkers.delete(mw);
        onProgress?.('搜索完成', 100);
        return enrichResultTags(res, 'uni344');
      }

      const shardCount = Math.min(status.threads, 4);
      while (workerPool.length < shardCount) {
        workerPool.push(spawnManagedWorker());
      }
      const shardWorkers: ManagedWorker[] = [];
      for (let i = 0; i < shardCount; i++) {
        const candidate = workerPool.find((x) => !x.busy && !shardWorkers.includes(x)) ?? spawnManagedWorker();
        if (!workerPool.includes(candidate)) workerPool.push(candidate);
        await candidate.readyPromise;
        if (needCatalog) {
          await syncUniCatalogToWorker(candidate, explicitCatalog);
        }
        shardWorkers.push(candidate);
        activeWorkers.add(candidate);
      }
      if (cancelled) throw createAbortError();

      onProgress?.(`正在并行运行 ${shardCount} 核差异化周期束搜索 (effort=${effort})…`, 25);
      let doneCnt = 0;
      const results = await Promise.all(
        shardWorkers.map((mw, shardIdx) =>
          callWorkerRaw<SearchResultData>(mw, 'uni344_search', {
            req: {
              ...baseReq,
              shard_idx: shardIdx,
              shard_count: shardCount,
            },
          }).then((r) => {
            activeWorkers.delete(mw);
            doneCnt += 1;
            onProgress?.(
              `已完成 ${doneCnt}/${shardCount} 核搜索分片…`,
              25 + Math.round((doneCnt / shardCount) * 70),
            );
            return r;
          }),
        ),
      );
      if (cancelled) throw createAbortError();

      // 严格按危局斩杀 > 危局总分 > 总伤害择优
      results.sort((a, b) => {
        const ka = a.killed ? 1 : 0;
        const kb = b.killed ? 1 : 0;
        if (ka !== kb) return kb - ka;
        const sa = a.da_total_score ?? 0;
        const sb = b.da_total_score ?? 0;
        if (sa !== sb) return sb - sa;
        if (a.killed && b.killed) {
          return (a.kill_time_s ?? 180) - (b.kill_time_s ?? 180);
        }
        return (b.total_dmg ?? 0) - (a.total_dmg ?? 0);
      });

      const winner = results[0];
      winner.nodes_expanded = results.reduce((acc, r) => acc + (r.nodes_expanded ?? 0), 0);
      onProgress?.('搜索完成', 100);
      return enrichResultTags(winner, 'uni344');
    } finally {
      activeWorkers.clear();
      await releaseSearchWakeLock();
    }
  };

  const promise = Promise.race([run(), cancelPromise]);
  promise.catch(() => {});
  return { promise, cancel };
}

/**
 * 调用 WASM `uni344_catalog_meta_json` 直接从原始 `universal_catalog_runtime.json` 提取下拉索引元数据
 * （供 `#/ops` 后台上传新版本 `universal_catalog_runtime.json` 时前端本地即时校验并预览角色/音擎/驱动盘/Boss 列表）。
 */
export async function extractUniCatalogMeta(
  catalogJson?: string | Record<string, unknown>,
): Promise<UniversalCatalogSummary> {
  const mw = await acquireIdleWorker();
  await syncUniCatalogToWorker(mw, catalogJson);
  return callWorkerRaw<UniversalCatalogSummary>(mw, 'uni344_catalog_meta', {});
}
