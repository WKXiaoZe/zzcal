import type {
  AnomalyReportPayload,
  AnomalyReportRecord,
  AnomalyReportSnapshot,
  AnomalyReportStatus,
  AnomalyReportSummary,
  PresetIndexItem,
  SearchResultData,
  SimEngine,
  SimManifest,
  SpecPublishRequest,
  SpecReleaseRecord,
  SunOverviewBundle,
  UniversalCatalogSummary,
} from './types';

const DEFAULT_VERSION_TOKEN = '3.4.5_r20699967';

let currentCacheToken: string = DEFAULT_VERSION_TOKEN;
let currentActiveReleaseId: string = 'bundled';

// 内存级大文件与常用元数据缓存（随 cacheToken 变更自动失效）
const memoryTextCache = new Map<string, string>();
const memoryJsonCache = new Map<string, unknown>();

export function bumpSpecCacheToken(newToken?: string): string {
  currentCacheToken = newToken || `${DEFAULT_VERSION_TOKEN}_${Date.now()}`;
  memoryTextCache.clear();
  memoryJsonCache.clear();
  return currentCacheToken;
}

export function getActiveReleaseInfo(): { releaseId: string; cacheToken: string } {
  return {
    releaseId: currentActiveReleaseId,
    cacheToken: currentCacheToken,
  };
}

function normalizeRelPath(relPath: string): string {
  return relPath
    .trim()
    .replace(/^\/+/, '')
    .replace(/^api\/specs\/+/i, '')
    .replace(/^sim-data\/+/i, '');
}

function isLikelyJsonResponse(res: Response, text: string): boolean {
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (ct.includes('text/html')) {
    return false;
  }
  const trimmed = text.trimStart();
  if (!trimmed || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return false;
  }
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

/**
 * 底层规格/预设文本读取器：
 * 1. 优先请求 `/api/specs/<cleanPath>?v=<cacheToken>`（接收云端 KV/R2 热更倍率或预设）
 * 2. 若本地 `vite dev` 无 Worker 后端（返回 SPA HTML 或 404/网络错误），平滑回退到 `./sim-data/<cleanPath>`
 */
export async function fetchSpecText(
  relPath: string,
  opts?: { bustCache?: boolean },
): Promise<string> {
  const cleanPath = normalizeRelPath(relPath);
  if (opts?.bustCache) {
    memoryTextCache.delete(cleanPath);
    memoryJsonCache.delete(cleanPath);
  }
  const token = opts?.bustCache ? `${currentCacheToken}_${Date.now()}` : currentCacheToken;
  const cacheKey = `${token}::${cleanPath}`;
  if (!opts?.bustCache && memoryTextCache.has(cacheKey)) {
    return memoryTextCache.get(cacheKey)!;
  }

  // 1) 优先尝试云端 Worker 热更路由 `/api/specs/*`
  const apiUrl = `/api/specs/${cleanPath}?v=${encodeURIComponent(token)}`;
  try {
    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: opts?.bustCache ? 'no-cache' : 'default',
    });
    if (apiRes.ok) {
      const text = await apiRes.text();
      if (isLikelyJsonResponse(apiRes, text)) {
        const relHeader = apiRes.headers.get('x-spec-release');
        if (relHeader) {
          currentActiveReleaseId = relHeader;
        }
        memoryTextCache.set(cacheKey, text);
        return text;
      }
    }
  } catch {
    // 本地纯前端开发态或离线环境，静默降级至静态目录
  }

  // 2) 平滑回退到本地静态内置资源 `./sim-data/*`
  const staticUrl = `./sim-data/${cleanPath}?v=${encodeURIComponent(token)}`;
  const staticRes = await fetch(staticUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: opts?.bustCache ? 'no-cache' : 'default',
  });
  if (!staticRes.ok) {
    throw new Error(`无法加载排轴数据资源 [${cleanPath}] (HTTP ${staticRes.status})`);
  }
  const text = await staticRes.text();
  if (!isLikelyJsonResponse(staticRes, text)) {
    throw new Error(`排轴数据资源 [${cleanPath}] 返回内容非合法 JSON`);
  }
  memoryTextCache.set(cacheKey, text);
  return text;
}

/**
 * 读取并解析 JSON 规格/预设资源（优先 `/api/specs/<path>`，自动回退 `./sim-data/<path>`）
 */
export async function fetchSpecJson<T = unknown>(
  relPath: string,
  opts?: { bustCache?: boolean },
): Promise<T> {
  const cleanPath = normalizeRelPath(relPath);
  const cacheKey = `${currentCacheToken}::${cleanPath}`;
  if (!opts?.bustCache && memoryJsonCache.has(cacheKey)) {
    return memoryJsonCache.get(cacheKey) as T;
  }
  const raw = await fetchSpecText(cleanPath, opts);
  const parsed = JSON.parse(raw) as T;
  if (!opts?.bustCache) {
    memoryJsonCache.set(cacheKey, parsed);
  }
  return parsed;
}

// ============================================================================
// 高频前端业务读取封装
// ============================================================================

export async function loadManifest(forceRefresh = false): Promise<SimManifest> {
  const manifest = await fetchSpecJson<SimManifest>('manifest.json', {
    bustCache: forceRefresh,
  });
  if (manifest.releaseId) {
    currentActiveReleaseId = manifest.releaseId;
  }
  return manifest;
}

export async function loadSunOverview(forceRefresh = false): Promise<SunOverviewBundle> {
  return fetchSpecJson<SunOverviewBundle>('benchmarks/sun344_overview.json', {
    bustCache: forceRefresh,
  });
}

export async function loadCatalogIndex(
  forceRefresh = false,
): Promise<UniversalCatalogSummary> {
  return fetchSpecJson<UniversalCatalogSummary>('specs/catalog_index.json', {
    bustCache: forceRefresh,
  });
}

export async function loadSunSpecRaw(forceRefresh = false): Promise<string> {
  return fetchSpecText('specs/sun_team_344_spec.json', { bustCache: forceRefresh });
}

export async function loadSunSpec(
  forceRefresh = false,
): Promise<Record<string, unknown>> {
  return fetchSpecJson<Record<string, unknown>>('specs/sun_team_344_spec.json', {
    bustCache: forceRefresh,
  });
}

export async function loadUniCatalogRaw(forceRefresh = false): Promise<string> {
  return fetchSpecText('specs/universal_catalog_runtime.json', {
    bustCache: forceRefresh,
  });
}

export async function loadUniCatalog(
  forceRefresh = false,
): Promise<Record<string, unknown>> {
  return fetchSpecJson<Record<string, unknown>>('specs/universal_catalog_runtime.json', {
    bustCache: forceRefresh,
  });
}

export async function loadPresetResult(
  presetOrPath: PresetIndexItem | string,
  opts?: { bustCache?: boolean },
): Promise<SearchResultData> {
  const relPath = typeof presetOrPath === 'string' ? presetOrPath : presetOrPath.path;
  return fetchSpecJson<SearchResultData>(relPath, opts);
}

export async function loadPresetCompanionSpecRaw(
  specPath: string,
  opts?: { bustCache?: boolean },
): Promise<string> {
  return fetchSpecText(specPath, opts);
}

// ============================================================================
// 运维与异常反馈 API 封装
// ============================================================================

function safeParseJsonField<T>(val: unknown): T | null {
  if (val == null) return null;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeReportRecord(raw: Record<string, unknown>): AnomalyReportRecord {
  const engineRaw = String(raw.engine ?? 'sun344');
  const engine: SimEngine = engineRaw === 'uni344' ? 'uni344' : 'sun344';
  const statusRaw = String(raw.status ?? 'open');
  const status: AnomalyReportStatus =
    statusRaw === 'resolved' || statusRaw === 'ignored' ? statusRaw : 'open';

  const stepVal = raw.stepIdx ?? raw.step_idx;
  const stepIdx =
    typeof stepVal === 'number' && Number.isFinite(stepVal) ? stepVal : null;

  return {
    id: String(raw.id ?? ''),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    status,
    category: String(raw.category ?? 'other'),
    message: String(raw.message ?? ''),
    stepIdx,
    engine,
    specVersion: String(raw.specVersion ?? raw.spec_version ?? DEFAULT_VERSION_TOKEN),
    presetId:
      raw.presetId != null
        ? String(raw.presetId)
        : raw.preset_id != null
          ? String(raw.preset_id)
          : null,
    summary: safeParseJsonField<AnomalyReportSummary>(
      raw.summary ?? raw.summary_json,
    ),
    snapshot: safeParseJsonField<AnomalyReportSnapshot>(
      raw.snapshot ?? raw.snapshot_json,
    ),
    resolutionNote:
      raw.resolutionNote != null
        ? String(raw.resolutionNote)
        : raw.resolution_note != null
          ? String(raw.resolution_note)
          : null,
  };
}

function normalizeReleaseRecord(raw: Record<string, unknown>): SpecReleaseRecord {
  let files: string[] = [];
  const rawFiles = raw.files ?? raw.files_json;
  if (Array.isArray(rawFiles)) {
    files = rawFiles.map((item) => String(item));
  } else if (typeof rawFiles === 'string' && rawFiles.trim()) {
    try {
      const parsed = JSON.parse(rawFiles);
      if (Array.isArray(parsed)) {
        files = parsed.map((item) => String(item));
      } else if (parsed && typeof parsed === 'object') {
        files = Object.keys(parsed as Record<string, unknown>);
      }
    } catch {
      files = [];
    }
  }

  const activeVal = raw.isActive ?? raw.is_active;
  const isActive =
    activeVal === true || activeVal === 1 || activeVal === '1' || activeVal === 'true';

  return {
    id: String(raw.id ?? ''),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    version: String(raw.version ?? ''),
    note: String(raw.note ?? ''),
    files,
    isActive,
  };
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return `HTTP ${res.status}`;
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const msg = parsed.error ?? parsed.message ?? parsed.detail;
    return msg ? `${String(msg)} (HTTP ${res.status})` : `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

function buildAuthHeaders(token: string, hasJsonBody = false): Record<string, string> {
  const clean = token.trim();
  if (!clean) {
    throw new Error('缺少运维管理员密钥 (OPS_ADMIN_TOKEN)');
  }
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${clean}`,
  };
  if (hasJsonBody) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

/**
 * 公网用户提交数据异常反馈 -> `POST /api/reports`
 */
export async function submitAnomalyReport(
  payload: AnomalyReportPayload,
): Promise<{ ok: boolean; id: string; createdAt?: string }> {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`提交反馈失败：${await parseApiError(res)}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  return {
    ok: data.ok !== false,
    id: String(data.id ?? data.reportId ?? ''),
    createdAt: data.createdAt
      ? String(data.createdAt)
      : data.created_at
        ? String(data.created_at)
        : undefined,
  };
}

/**
 * 运维拉取反馈工单池 -> `GET /api/ops/reports`
 */
export async function opsFetchReports(
  token: string,
  status?: string,
): Promise<AnomalyReportRecord[]> {
  const qs =
    status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
  const res = await fetch(`/api/ops/reports${qs}`, {
    method: 'GET',
    headers: buildAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`获取反馈工单失败：${await parseApiError(res)}`);
  }
  const body = (await res.json()) as unknown;
  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as Record<string, unknown>)?.reports)
      ? ((body as Record<string, unknown>).reports as unknown[])
      : Array.isArray((body as Record<string, unknown>)?.items)
        ? ((body as Record<string, unknown>).items as unknown[])
        : Array.isArray((body as Record<string, unknown>)?.data)
          ? ((body as Record<string, unknown>).data as unknown[])
          : [];
  return list.map((item) => normalizeReportRecord(item as Record<string, unknown>));
}

/**
 * 运维更新/结单反馈工单 -> `PATCH /api/ops/reports/:id`
 */
export async function opsResolveReport(
  token: string,
  id: string,
  status: 'open' | 'resolved' | 'ignored',
  resolutionNote?: string,
): Promise<{ ok: boolean; report?: AnomalyReportRecord }> {
  const res = await fetch(`/api/ops/reports/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: buildAuthHeaders(token, true),
    body: JSON.stringify({
      status,
      resolutionNote: resolutionNote ?? '',
      resolution_note: resolutionNote ?? '',
    }),
  });
  if (!res.ok) {
    throw new Error(`更新工单状态失败：${await parseApiError(res)}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const rawReport = data.report as Record<string, unknown> | undefined;
  return {
    ok: data.ok !== false,
    report: rawReport ? normalizeReportRecord(rawReport) : undefined,
  };
}

/**
 * 运维查询历史倍率/预设热更发布列表 -> `GET /api/ops/releases`
 */
export async function opsFetchReleases(token: string): Promise<SpecReleaseRecord[]> {
  const res = await fetch('/api/ops/releases', {
    method: 'GET',
    headers: buildAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error(`获取热更新版本列表失败：${await parseApiError(res)}`);
  }
  const body = (await res.json()) as unknown;
  const list = Array.isArray(body)
    ? body
    : Array.isArray((body as Record<string, unknown>)?.releases)
      ? ((body as Record<string, unknown>).releases as unknown[])
      : Array.isArray((body as Record<string, unknown>)?.items)
        ? ((body as Record<string, unknown>).items as unknown[])
        : Array.isArray((body as Record<string, unknown>)?.data)
          ? ((body as Record<string, unknown>).data as unknown[])
          : [];
  return list.map((item) => normalizeReleaseRecord(item as Record<string, unknown>));
}

/**
 * 运维一键热推送新版倍率/预设 JSON -> `POST /api/ops/specs`
 */
export async function opsPublishSpecUpdate(
  token: string,
  req: SpecPublishRequest,
): Promise<{ ok: boolean; releaseId: string; version: string; filesCount: number }> {
  const normalizedFiles: Record<string, unknown> = {};
  for (const [rawPath, content] of Object.entries(req.files || {})) {
    const cleanPath = normalizeRelPath(rawPath);
    if (!cleanPath) continue;
    if (typeof content === 'string') {
      normalizedFiles[cleanPath] = JSON.parse(content);
    } else {
      normalizedFiles[cleanPath] = content;
    }
  }
  if (Object.keys(normalizedFiles).length === 0) {
    throw new Error('热更新请求未包含任何有效的 JSON 文件路径');
  }

  const payload: SpecPublishRequest = {
    version: req.version.trim(),
    note: req.note?.trim() ?? '',
    activate: req.activate !== false,
    files: normalizedFiles,
  };

  const res = await fetch('/api/ops/specs', {
    method: 'POST',
    headers: buildAuthHeaders(token, true),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`发布热更新失败：${await parseApiError(res)}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const releaseId = String(
    data.releaseId ?? data.release_id ?? data.id ?? payload.version,
  );
  if (payload.activate !== false) {
    currentActiveReleaseId = releaseId;
  }
  bumpSpecCacheToken(`${payload.version}_${Date.now()}`);
  return {
    ok: data.ok !== false,
    releaseId,
    version: payload.version,
    filesCount: Object.keys(normalizedFiles).length,
  };
}

/**
 * 运维一键回滚到历史热更版本或初始静态内置包 (`"bundled"`) -> `POST /api/ops/rollback`
 */
export async function opsRollbackRelease(
  token: string,
  releaseId: string,
): Promise<{ ok: boolean; activeReleaseId: string; version?: string }> {
  const target = releaseId.trim() || 'bundled';
  const res = await fetch('/api/ops/rollback', {
    method: 'POST',
    headers: buildAuthHeaders(token, true),
    body: JSON.stringify({
      releaseId: target,
      release_id: target,
    }),
  });
  if (!res.ok) {
    throw new Error(`执行版本回滚失败：${await parseApiError(res)}`);
  }
  const data = (await res.json()) as Record<string, unknown>;
  const activeReleaseId = String(
    data.activeReleaseId ?? data.active_release_id ?? data.releaseId ?? target,
  );
  currentActiveReleaseId = activeReleaseId;
  bumpSpecCacheToken(`rollback_${activeReleaseId}_${Date.now()}`);
  return {
    ok: data.ok !== false,
    activeReleaseId,
    version: data.version ? String(data.version) : undefined,
  };
}
