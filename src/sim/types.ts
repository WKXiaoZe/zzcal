/**
 * ZZZ 3.4.5 实战排轴与搜轴工作台 —— 共享类型契约
 *
 * 由 @sim-data 维护，供 @sim-ui / @wasm-engine / @cf-backend 统一引用。
 * 基准游戏与解包版本：3.4.5_r20699967
 */

export type SimEngine = 'sun344' | 'uni344';

export type PresetCategory =
  | 'featured'
  | 'cost_ladder'
  | 'mindscape_cap'
  | 'mindscape_uncap'
  | 'boss_bench'
  | 'uni_flagship'
  | 'uni_classic'
  | 'uni_anomaly'
  | 'uni_f2p';

/**
 * 顶层静态数据包清单（`public/sim-data/manifest.json`）
 */
export interface SimManifest {
  /** 基准游戏倍率版本，如 `"3.4.5_r20699967"` */
  version: string;
  /** 构建生成时间（ISO 8601） */
  generatedAt: string;
  /** 当前生效的数据发布版本 ID（静态包默认 `"bundled"`，云端热更后为 releaseId） */
  releaseId?: string;
  /** 核心规格与汇总文件相对路径（相对于 `sim-data/` 或 `/api/specs/`） */
  specs: {
    sunSpecPath: string;
    uniCatalogPath: string;
    catalogIndexPath: string;
    sunOverviewPath: string;
  };
  /** 预置收敛轴统计 */
  counts: {
    totalPresets: number;
    sun344Presets: number;
    uni344Presets: number;
  };
  /** 全部预置收敛排轴索引（首屏 0s 秒开下拉与筛选用） */
  presets: PresetIndexItem[];
}

/**
 * 单条预置排轴索引项（含 `n失衡m大` 节奏标签与可选 MILP 认证理论上界）
 */
export interface PresetIndexItem {
  id: string;
  engine: SimEngine;
  category?: PresetCategory;
  title: string;
  subtitle?: string;
  bossName: string;
  bossMode: string;
  bossHp?: number;
  uncappedHp?: boolean;
  stageBuffId?: number;
  limitedGold: number;
  shorthand: string;
  /** 挽昼专核命座（通用队默认映射 slot 0/1/2 命座） */
  sunM: number;
  roxyM: number;
  robinM: number;
  sunW?: number;
  roxyW?: number;
  robinW?: number;
  /** 通用编队角色名/命座/音擎精炼 */
  agentNames?: [string, string, string];
  agentM?: [number, number, number];
  agentW?: [number, number, number];
  bangbooName?: string;
  /** 实战进入失衡次数 */
  stunCount: number;
  /** 主C（挽昼 `SunUlt1` 或 0 号位主C）实战释放喧响终结技次数 */
  ultCount: number;
  /** 实战节奏标签，格式如 `"4失衡4大"` */
  rhythmTag: string;
  totalDmg: number;
  dps: number;
  killed: boolean;
  killTimeS: number | null;
  daDmgScore?: number;
  daPerfScore?: number;
  daTotalScore: number;
  /** HiGHS MILP 认证 180s 理论总伤上界 UB*（如有） */
  ubMaxDmg?: number;
  /** HiGHS MILP 认证满血最短理论击杀时间下界 T_min_lb（秒，如有） */
  ubMinKillS?: number;
  /** 最优性间隙 `(UB* - LB*) / UB*` 百分比（如 `27.85` 表示 `27.85%`） */
  ubGapPct?: number;
  /** 已达成理论天花板比例 `LB* / UB*` 百分比（如 `72.15` 表示 `72.15%`） */
  ubEfficiencyPct?: number;
  /** 排轴详情 JSON 相对路径（如 `"presets/sun344/sun344_knot_6gold_110111.json"`） */
  path: string;
  /** 通用队专属伴随配装规格 JSON 相对路径（如有，供 WASM Replay 直接读取） */
  specPath?: string;
}

/**
 * 三人驻场时间统计（秒与百分比）
 */
export interface FieldOccupancy {
  overall_s: [number, number, number];
  overall_pct: [number, number, number];
  pre_stun_s: [number, number, number];
  in_stun_s: [number, number, number];
  sanity_ok?: boolean;
}

export interface SunBuildConfig {
  sun_m: number;
  sun_w: number;
  roxy_m: number;
  roxy_w: number;
  robin_m: number;
  robin_w: number;
}

export interface UniBuildConfig {
  slot_roster_idx: [number, number, number];
  m: [number, number, number];
  w: [number, number, number];
  awaken?: [number, number, number];
  bangboo_idx?: number;
  bangboo_star?: number;
}

export type MacroAction = string | Record<string, unknown>;

/**
 * 单步动作明细与 15 乘区快照（兼容 `zzz-sun344` 专核与 `zzz-uni344` 通用核）
 */
export interface StepRow {
  /** 技能/动作 ID（如 `1601111` 为挽昼大招 `SunUlt1`） */
  sid: number;
  /** 人类可读招式描述 */
  action_key: string;
  /** 合轴/切人/取消状态描述 */
  cancel_mode: string;
  /** 命中次数或招式段数倍率计数 */
  n_count: number;
  /** 前台占用帧数（60fps） */
  delta_f: number;
  /** 起始秒数 */
  t_start: number;
  /** 结束秒数 */
  t_end: number;
  /** 若本步处于失衡窗口内，对应失衡条精确到期秒数（用于裁剪尾招动画后摇悬垂） */
  stun_end_s?: number;
  /** 敌人失衡/秽盾/祭坛状态标签 */
  stun_str: string;
  /** 本步直伤 */
  direct_dmg: number;
  /** 本步注入 `[烬痕]` / 蓄水池伤害 */
  vb_added: number;
  /** 本步结束后剩余蓄水池伤害 */
  vb_pool_after: number;
  /** 本步合计结算伤害（直伤 + 引爆 + 异常紊乱） */
  step_total_dmg: number;

  // --- zzz-sun344 专核状态与资源字段 ---
  sun_str?: string;
  roxy_str?: string;
  wind_str?: string;
  robin_str?: string;
  fua_stacks?: number;
  disc_stacks?: number;
  ep_after?: number;
  roxy_sp_after?: number;
  robin_sp_after?: number;
  sun_dec_after?: number;
  roxy_dec_after?: number;
  robin_dec_after?: number;
  wish_fire_after?: number;
  wound_after?: number;
  daze_pct_cum?: number;
  vb_detonated?: number;

  // --- zzz-uni344 通用核与 15 乘区透视字段（sun344 重算亦可按需填充） ---
  step_idx?: number;
  actor?: string;
  actor_slot?: number;
  elem?: string;
  cat?: string;
  stream_kind?: string;
  f_start?: number;
  wait_f?: number;
  f_end?: number;
  stun_entered?: boolean;
  on_field_slot?: number;
  disc4_stacks?: [number, number, number];
  wpn_stacks?: [number, number, number];
  kit_buff_stacks?: [number, number, number];
  kit_buff_pills?: [string, string, string];
  env_stacks?: number;
  env_pill?: string;
  miasma_shield_on?: boolean;
  buff_flags?: Record<string, number>;
  live_base?: number;
  flat_base_extra?: number;
  step_mv?: number;
  live_cr?: number;
  live_cd?: number;
  def_shred_plus_ign?: number;
  pen_ratio?: number;
  flat_pen?: number;
  zone_common_dmg?: number;
  zone_special_mult?: number;
  zone_crit?: number;
  zone_def?: number;
  zone_res?: number;
  zone_stun?: number;
  zone_taken?: number;
  keep_frac?: number;
  anomaly_disorder_dmg?: number;
  special_detonate_dmg?: number;
  cum_dmg?: number;
  daze_add_pct?: number;
  daze_cum_pct?: number;
  cycle_daze_pct_after?: number;
  energy_after?: [number, number, number];
  decibels_after?: [number, number, number];
  decibel_cap?: number;
  spec_res1_after?: [number, number, number];
  spec_res2_after?: [number, number, number];
  spec_res_labels?: [string, string, string];
  anom_bars_pct_after?: Record<string, number>;
  active_anomaly_str?: string;
  miasma_pct_after?: number;
  perf_score_after?: number;
}

/**
 * 完整排轴/搜轴/重算结果数据（兼容 `zzz-sun344` 与 `zzz-uni344`）
 */
export interface SearchResultData {
  version: string;
  engine?: SimEngine;
  preset_id?: string;
  boss_name: string;
  boss_mode?: string;
  boss_mid?: number;
  boss_hp?: number;
  is_da?: boolean;
  uncapped_hp?: boolean;
  team_id?: string;
  team_name?: string;
  build?: SunBuildConfig | UniBuildConfig | Record<string, unknown>;
  shorthand?: string;
  detail_label?: string;
  limited_gold?: number;
  stage_buff_id?: number;
  sun_m?: number;
  roxy_m?: number;
  robin_m?: number;
  agent_names?: [string, string, string];
  agent_m?: [number, number, number];
  agent_w?: [number, number, number];
  bangboo_name?: string;
  elapsed_ms?: number;
  nodes_expanded?: number;
  total_frames: number;
  total_seconds: number;
  killed?: boolean;
  kill_time_s?: number | null;
  da_dmg_score?: number;
  da_perf_score?: number;
  da_total_score?: number;
  knot_fissure_stacks?: number;
  stun_count: number;
  /** 清洗注入：主C大招次数 */
  ult_count?: number;
  /** 清洗注入：`"n失衡m大"` 节奏标签 */
  rhythm_tag?: string;
  total_direct_dmg: number;
  total_detonated_dmg: number;
  total_anom_disorder_dmg?: number;
  total_dmg: number;
  dps: number;
  unpopped_vb_end?: number;
  /** MILP 认证 180s 理论总伤上界（如有对应证明场景） */
  ub_max_dmg?: number;
  /** MILP 认证最短击杀时间下界（秒，如有） */
  ub_min_kill_s?: number;
  /** MILP 最优性间隙百分比（如有） */
  ub_gap_pct?: number;
  field_occupancy: FieldOccupancy;
  macros: MacroAction[];
  rows: StepRow[];
}

// ============================================================================
// 挽昼专核基准、金数阶梯、影画阶梯与 MILP 上界总览（`benchmarks/sun344_overview.json`）
// ============================================================================

export interface SunBenchmarkSummaryItem {
  bossName: string;
  bossMode?: string;
  sunM: number;
  roxyM: number;
  robinM: number;
  limitedGold: number;
  shorthand: string;
  stunMax: number;
  stunCount: number;
  ultCount: number;
  rhythmTag: string;
  totalDirectDmg: number;
  totalDetonatedDmg: number;
  totalDmg: number;
  dps: number;
  killed?: boolean;
  killTimeS?: number | null;
  daTotalScore?: number;
  elapsedMs?: number;
  nodesExpanded?: number;
  note: string;
  presetId?: string;
  presetPath?: string;
  ubTotalDmg?: number;
  gapPct?: number;
  achievedPct?: number;
  minKillLbS?: number;
}

export interface SunStageBuffComparisonItem {
  stageBuffId: number;
  stageBuffName: string;
  buildShorthand: string;
  killed: boolean;
  killTimeS: number | null;
  daDmgScore: number;
  daPerfScore: number;
  daTotalScore: number;
  totalDmg: number;
  bossHpPct: number;
  stunCount: number;
  ultCount?: number;
  rhythmTag?: string;
}

export interface SunCostLadderEntry {
  limitedGold: number;
  build: SunBuildConfig;
  shorthand: string;
  code6: string;
  detailLabel: string;
  stageBuffId: number;
  effort?: number;
  killed: boolean;
  killTimeS: number | null;
  daDmgScore: number;
  daPerfScore: number;
  daTotalScore: number;
  totalDmg: number;
  uncapped180sDmg?: number;
  bossHpPct: number;
  stunCount: number;
  ultCount: number;
  rhythmTag: string;
  dps: number;
  fieldPct: [number, number, number];
  presetId?: string;
  presetPath?: string;
  uncappedPresetId?: string;
  uncappedPresetPath?: string;
  ubTotalDmg?: number;
  gapPct?: number;
  minKillLbS?: number;
}

export interface SunCostLadderBundle {
  version: string;
  bossName: string;
  bossMid: number;
  bossTotalHp: number;
  selectedStageBuffId: number;
  selectedStageBuffName: string;
  stageBuffComparison6Gold: SunStageBuffComparisonItem[];
  minGoldToKill: SunCostLadderEntry;
  championsByGold: SunCostLadderEntry[];
  notableBenchmarks: SunCostLadderEntry[];
  allEvaluatedBuilds: SunCostLadderEntry[];
}

export interface SunMindscapeRow {
  sunM: number;
  code6: string;
  limitedGold: number;
  killed: boolean;
  killTimeS: number | null;
  daDmgScore: number;
  daPerfScore: number;
  daTotalScore: number;
  cappedDmg: number;
  uncapped180sDmg: number;
  uncapped180sDps: number;
  cappedStuns: number;
  cappedUlts: number;
  cappedRhythmTag: string;
  uncappedStuns: number;
  uncappedUlts: number;
  uncappedRhythmTag: string;
  /** 默认展示的节奏标签（优先取 180s 完整能力标签，斩杀时同步提供 cappedRhythmTag） */
  ultCount: number;
  rhythmTag: string;
  uncappedEquivScore: number;
  fieldPct: [number, number, number];
  vsM0DmgPct: number;
  vsPrevDmgPct: number;
  vsM0DaDelta: number;
  vsM0EquivDelta: number;
  cappedPresetId?: string;
  cappedPresetPath?: string;
  uncappedPresetId?: string;
  uncappedPresetPath?: string;
  ubTotalDmg?: number;
  gapPct?: number;
  minKillLbS?: number;
}

export interface SunMindscapeTier {
  teammateLabel: string;
  roxyM: number;
  roxyW: number;
  robinM: number;
  robinW: number;
  rows: SunMindscapeRow[];
}

export interface SunMindscapeLadderBundle {
  elapsedS: number;
  tiers: SunMindscapeTier[];
}

export interface SunMilpScenarioProof {
  scenarioId: string;
  title: string;
  build: SunBuildConfig;
  lbStarFile: string;
  presetId?: string;
  lbStar: number;
  ubStar: number;
  optimalStunCountKStar: number;
  ultCount?: number;
  rhythmTag?: string;
  absoluteGapDmg: number;
  relativeGapPct: number;
  achievedEfficiencyPct: number;
  k5StrictlyDominatedByK4: boolean;
  k6StrictlyDominatedByK4: boolean;
  minKillTimeProof29Bars?: {
    targetHp29Bars: number;
    certifiedNoKillHorizonF: number;
    certifiedNoKillUb: number;
    fMinLb: number;
    tMinLbS: number;
    simKillF: number;
    simKillS: number;
    timeGapS: number;
    timeGapRelPct: number;
  };
  ubByStunCount: Array<{
    K: number;
    feasible: boolean;
    dualUb: number;
    solveMs?: number;
  }>;
}

export interface SunOptimalityProofBundle {
  schemaVersion: string;
  gameVersion: string;
  solverBackend: string;
  totalRuntimeS: number;
  admissibilityAudit: {
    totalAudited: number;
    passedCount: number;
    allPassed: boolean;
    globalMaxViolation: number;
  };
  scenarios: SunMilpScenarioProof[];
  gapPhysicalSources: Array<{
    source: string;
    mechanism: string;
    estimatedShareOfGapPct?: string;
  }>;
}

/**
 * 挽昼专核全维基准汇总包（`public/sim-data/benchmarks/sun344_overview.json`）
 */
export interface SunOverviewBundle {
  version: string;
  generatedAt: string;
  benchmarks: SunBenchmarkSummaryItem[];
  costLadder: SunCostLadderBundle;
  mindscapeLadder: SunMindscapeLadderBundle;
  optimalityProof: SunOptimalityProofBundle;
}

// ============================================================================
// 通用全角色编队轻量索引元数据（`specs/catalog_index.json`）
// ============================================================================

export interface CatalogAgentItem {
  id: number;
  key: string;
  resourceCode?: string;
  nameCn: string;
  nameCnFull?: string;
  nameEn: string;
  /** 稀有度数值（4 = S级, 3 = A级, 2 = B级） */
  rarity: number;
  elementId: number;
  elementCn: string;
  subElementCn?: string | null;
  specialtyId: number;
  specialtyCn: string;
  campId?: number;
  campCn?: string;
  signatureWEngineId?: number | null;
  defaultWEngineId?: number | null;
  capabilityTags?: string[];
  defaultDisc4Id?: number | null;
  defaultDisc2Id?: number | null;
}

export interface CatalogWEngineItem {
  id: number;
  nameCn: string;
  nameEn: string;
  /** 稀有度数值（4 = S级, 3 = A级, 2 = B级） */
  rarity: number;
  specialtyId: number;
  specialtyCn: string;
  signatureAgentId?: number | null;
  passiveTitleCn?: string;
  baseAtkLv60?: number;
  subStatNameCn?: string;
  subStatValue?: number;
}

export interface CatalogDriveDiscItem {
  id: number;
  nameCn: string;
  nameEn: string;
  desc2pcCn: string;
  desc4pcCn: string;
}

export interface CatalogBangbooItem {
  id: number;
  key: string;
  nameCn: string;
  nameEn: string;
  /** 稀有度数值（4 = S级, 3 = A级） */
  rarity: number;
}

export interface CatalogBossItem {
  id: number;
  code: string;
  nameCn: string;
  nameEn: string;
  tags: string[];
  baseDefLv70: number;
  stunMaxLv70: number;
  stunDurationS: number;
  nativeStunVulnMult: number;
  elementalResPct: Record<string, number>;
  category?: string;
  configComment?: string;
  barCount?: number;
  exactTotalHpLv70?: number;
  weakElements?: string[];
  resistElements?: string[];
  fixedStageBuffIds?: number[];
  optionalWeatherBuffIds?: number[];
}

export interface CatalogStageBuffItem {
  id: number;
  abilityKey: string;
  titleCn: string;
  titleEn?: string;
  descCn: string;
}

/**
 * 从 `universal_catalog_runtime.json` 提炼的轻量前端下拉元数据（首屏秒开选人/选音擎/选盘/选Boss/选天气）
 */
export interface UniversalCatalogSummary {
  version: string;
  counts: {
    agents: number;
    wEngines: number;
    driveDiscs: number;
    bangboos: number;
    bosses: number;
    weatherBuffs: number;
    fixedStageBuffs: number;
  };
  agents: CatalogAgentItem[];
  wEngines: CatalogWEngineItem[];
  driveDiscs: CatalogDriveDiscItem[];
  bangboos: CatalogBangbooItem[];
  bosses: CatalogBossItem[];
  weatherBuffs: CatalogStageBuffItem[];
  fixedStageBuffs: CatalogStageBuffItem[];
}

// ============================================================================
// 线上轻量反馈工单与纯倍率热更新运维契约（`@sim-ui` <-> `dataLoader` <-> `@cf-backend`）
// ============================================================================

export type AnomalyCategory =
  | 'multiplier_mismatch'
  | 'buff_uptime'
  | 'illegal_swap_cancel'
  | 'boss_mechanic'
  | 'other';

export type AnomalyReportStatus = 'open' | 'resolved' | 'ignored';

export interface AnomalyReportSummary {
  totalDmg?: number;
  dps?: number;
  killed?: boolean;
  killTimeS?: number | null;
  daTotalScore?: number;
  rhythmTag?: string;
  bossName?: string;
  bossMode?: string;
  shorthand?: string;
  [key: string]: unknown;
}

export interface AnomalyReportSnapshot {
  engine?: SimEngine;
  presetId?: string | null;
  build?: Record<string, unknown>;
  overrides?: Record<string, unknown>;
  stageBuffId?: number;
  bossMode?: string;
  bossId?: number;
  macros?: MacroAction[];
  stepIdx?: number | null;
  stepRow?: Partial<StepRow>;
  [key: string]: unknown;
}

/**
 * 公网用户轻量异常反馈上报请求体（`POST /api/reports`）
 */
export interface AnomalyReportPayload {
  category: AnomalyCategory | string;
  message?: string;
  stepIdx?: number | null;
  engine: SimEngine;
  specVersion: string;
  presetId?: string | null;
  summary?: AnomalyReportSummary;
  snapshot?: AnomalyReportSnapshot;
}

/**
 * D1 存储并返回给运维台的异常反馈工单记录（`GET /api/ops/reports`）
 */
export interface AnomalyReportRecord {
  id: string;
  createdAt: string;
  status: AnomalyReportStatus;
  category: string;
  message: string;
  stepIdx: number | null;
  engine: SimEngine;
  specVersion: string;
  presetId: string | null;
  summary: AnomalyReportSummary | null;
  snapshot: AnomalyReportSnapshot | null;
  resolutionNote?: string | null;
}

/**
 * 纯倍率/预设数据热更新版本审计记录（`GET /api/ops/releases`）
 */
export interface SpecReleaseRecord {
  id: string;
  createdAt: string;
  version: string;
  note: string;
  files: string[];
  isActive: boolean;
}

/**
 * 推送新倍率或新预设数据包的热发版请求（`POST /api/ops/specs`）
 *
 * `files` 的 key 为相对路径（如 `"specs/sun_team_344_spec.json"`、`"manifest.json"`、
 * `"presets/sun344/sun344_knot_6gold_110111.json"`），value 为解析后的 JSON 对象或原始 JSON 字符串。
 */
export interface SpecPublishRequest {
  version: string;
  note?: string;
  /** 是否发布后立即切换为全网激活态（默认 `true`） */
  activate?: boolean;
  files: Record<string, unknown>;
}
