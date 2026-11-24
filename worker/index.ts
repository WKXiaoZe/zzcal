/// <reference path="./env.d.ts" />
/// <reference path="./worker-configuration.d.ts" />

export interface WorkerEnv extends Env {
  OPS_ADMIN_TOKEN?: string;
}

const DEFAULT_BUNDLED_VERSION = '3.4.5_r20699967';
const MAX_REPORT_BODY_BYTES = 256 * 1024; // 256 KB
const MAX_SPEC_PUBLISH_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_REPORTS_PER_10_MIN = 20;

interface StoredFileMeta {
  storageKey: string;
  etag: string;
  size: number;
}

interface ActiveReleaseRow {
  id: string;
  created_at: string;
  version: string;
  note: string;
  files_json: string;
  is_active: number;
}

interface AnomalyReportRow {
  id: string;
  created_at: string;
  status: string;
  category: string;
  message: string;
  step_idx: number | null;
  engine: string;
  spec_version: string;
  preset_id: string | null;
  summary_json: string | null;
  snapshot_json: string | null;
  ip_hash: string | null;
  resolution_note: string | null;
}

class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, If-None-Match',
  'Access-Control-Expose-Headers': 'ETag, X-Spec-Release, X-Spec-Version, X-Spec-Source',
};

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return bufferToHex(digest);
}

/**
 * Constant-time token verification via Web Crypto SHA-256 + timingSafeEqual.
 * Hashing both values first avoids leaking secret length through timing.
 */
export async function verifyAdminToken(
  provided: string,
  expected: string,
): Promise<boolean> {
  if (!provided || !expected) {
    return false;
  }
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(provided)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  if (typeof crypto.subtle.timingSafeEqual === 'function') {
    return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
  }
  // Fallback strictly for non-workerd Node unit test environments
  const a = new Uint8Array(providedHash);
  const b = new Uint8Array(expectedHash);
  if (a.byteLength !== b.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function requireAdminAuth(request: Request, env: WorkerEnv): Promise<void> {
  const expected = env.OPS_ADMIN_TOKEN?.trim() ?? '';
  if (!expected) {
    throw new HttpError(503, 'OPS_ADMIN_TOKEN 尚未在云端配置');
  }
  const authHeader = request.headers.get('Authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) {
    throw new HttpError(401, '缺少 Bearer 管理员鉴权头');
  }
  const valid = await verifyAdminToken(match[1].trim(), expected);
  if (!valid) {
    throw new HttpError(401, '管理员密钥 (OPS_ADMIN_TOKEN) 校验失败');
  }
}

/**
 * Bounded stream reader to enforce payload size limits without risking Worker OOM.
 */
async function readJsonBodyBounded<T = Record<string, unknown>>(
  request: Request,
  maxBytes: number,
): Promise<{ parsed: T; byteLength: number }> {
  const contentLengthHeader = request.headers.get('Content-Length');
  if (contentLengthHeader) {
    const declared = Number(contentLengthHeader);
    if (Number.isFinite(declared) && declared > maxBytes) {
      throw new HttpError(
        413,
        `请求体超出上限 (${declared} bytes > ${maxBytes} bytes)`,
      );
    }
  }

  if (!request.body) {
    throw new HttpError(400, '请求体为空');
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel('Payload Too Large');
        throw new HttpError(
          413,
          `请求体超出上限 (> ${maxBytes} bytes)`,
        );
      }
      chunks.push(value);
    }
  }

  if (totalBytes === 0) {
    throw new HttpError(400, '请求体为空');
  }

  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const rawText = new TextDecoder('utf-8', { fatal: false }).decode(merged);
  try {
    const parsed = JSON.parse(rawText) as T;
    return { parsed, byteLength: totalBytes };
  } catch {
    throw new HttpError(400, '请求体不是合法的 JSON 格式');
  }
}

export function normalizeSpecRelPath(rawPath: string): string {
  const cleaned = rawPath
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/^api\/specs\/+/i, '')
    .replace(/^sim-data\/+/i, '')
    .replace(/\/+$/, '');

  if (!cleaned || cleaned.length > 240) {
    throw new HttpError(400, '无效的规格文件路径');
  }
  if (/[\x00-\x1f]/.test(cleaned)) {
    throw new HttpError(400, '规格文件路径包含非法控制字符');
  }
  const segments = cleaned.split('/');
  for (const seg of segments) {
    if (!seg || seg === '.' || seg === '..') {
      throw new HttpError(400, `规格文件路径非法: ${rawPath}`);
    }
  }
  if (!cleaned.toLowerCase().endsWith('.json')) {
    throw new HttpError(400, `仅允许 JSON 规格/预设路径: ${cleaned}`);
  }
  return cleaned;
}

function parseFilesMap(
  releaseId: string,
  filesJson: string,
): Record<string, StoredFileMeta> {
  if (!filesJson) return {};
  try {
    const parsed = JSON.parse(filesJson) as unknown;
    if (Array.isArray(parsed)) {
      const out: Record<string, StoredFileMeta> = {};
      for (const item of parsed) {
        const path = String(item);
        out[path] = {
          storageKey: `rel:${releaseId}:${path}`,
          etag: `W/"${releaseId}-${path}"`,
          size: 0,
        };
      }
      return out;
    }
    if (parsed && typeof parsed === 'object') {
      const out: Record<string, StoredFileMeta> = {};
      for (const [path, val] of Object.entries(parsed as Record<string, unknown>)) {
        if (val && typeof val === 'object') {
          const meta = val as Partial<StoredFileMeta>;
          out[path] = {
            storageKey: meta.storageKey || `rel:${releaseId}:${path}`,
            etag: meta.etag || `W/"${releaseId}-${path}"`,
            size: typeof meta.size === 'number' ? meta.size : 0,
          };
        } else {
          out[path] = {
            storageKey: `rel:${releaseId}:${path}`,
            etag: `W/"${releaseId}-${path}"`,
            size: 0,
          };
        }
      }
      return out;
    }
  } catch {
    // Ignore malformed metadata
  }
  return {};
}

async function getActiveRelease(env: WorkerEnv): Promise<ActiveReleaseRow | null> {
  return env.DB.prepare(
    `SELECT id, created_at, version, note, files_json, is_active
     FROM spec_releases
     WHERE is_active = 1
     ORDER BY created_at DESC
     LIMIT 1`,
  ).first<ActiveReleaseRow>();
}

function matchesIfNoneMatch(request: Request, etag: string | null): boolean {
  if (!etag) return false;
  const inm = request.headers.get('If-None-Match');
  if (!inm) return false;
  if (inm.trim() === '*') return true;
  const candidates = inm.split(',').map((s) => s.trim());
  const normalizedTarget = etag.replace(/^W\//i, '');
  return candidates.some((c) => c === etag || c.replace(/^W\//i, '') === normalizedTarget);
}

async function fetchBundledSpecAsset(
  request: Request,
  env: WorkerEnv,
  cleanPath: string,
): Promise<Response | null> {
  const url = new URL(request.url);
  const assetUrl = new URL(`/sim-data/${cleanPath}`, url.origin);
  const assetReq = new Request(assetUrl.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const assetRes = await env.ASSETS.fetch(assetReq);
  if (!assetRes.ok) {
    return null;
  }
  const ct = (assetRes.headers.get('Content-Type') ?? '').toLowerCase();
  if (ct.includes('text/html')) {
    return null;
  }
  return assetRes;
}

async function handleGetSpec(
  request: Request,
  env: WorkerEnv,
  rawSubPath: string,
): Promise<Response> {
  let decodedPath: string;
  try {
    decodedPath = decodeURIComponent(rawSubPath);
  } catch {
    throw new HttpError(400, 'URL 路径编码无效');
  }

  const cleanPath = normalizeSpecRelPath(decodedPath);
  const bundledVersion = env.BUNDLED_SPEC_VERSION || DEFAULT_BUNDLED_VERSION;
  const activeRelease = await getActiveRelease(env);

  if (activeRelease) {
    const filesMap = parseFilesMap(activeRelease.id, activeRelease.files_json);
    const hit = filesMap[cleanPath];

    if (hit) {
      if (matchesIfNoneMatch(request, hit.etag)) {
        return new Response(null, {
          status: 304,
          headers: {
            ETag: hit.etag,
            'Cache-Control': 'no-cache',
            'X-Spec-Release': activeRelease.id,
            'X-Spec-Version': activeRelease.version,
            'X-Spec-Source': 'kv-hotfix',
            ...CORS_HEADERS,
          },
        });
      }

      const stream = await env.SPECS_KV.get(hit.storageKey, 'stream');
      if (stream) {
        return new Response(request.method === 'HEAD' ? null : stream, {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache',
            ETag: hit.etag,
            'X-Content-Type-Options': 'nosniff',
            'X-Spec-Release': activeRelease.id,
            'X-Spec-Version': activeRelease.version,
            'X-Spec-Source': 'kv-hotfix',
            ...CORS_HEADERS,
          },
        });
      }
    }

    // Special handling: when an active hotfix release only uploaded partial spec files
    // (e.g. specs/sun_team_344_spec.json) without uploading a full manifest.json,
    // dynamically stamp the active release version & releaseId onto bundled manifest.json
    // so page reloads immediately display the hot-updated version string.
    if (cleanPath === 'manifest.json') {
      const baseAsset = await fetchBundledSpecAsset(request, env, 'manifest.json');
      if (baseAsset) {
        const rawBase = await baseAsset.text();
        let parsedManifest: Record<string, unknown>;
        try {
          parsedManifest = JSON.parse(rawBase) as Record<string, unknown>;
        } catch {
          parsedManifest = {};
        }
        const mergedManifest = {
          ...parsedManifest,
          version: activeRelease.version,
          releaseId: activeRelease.id,
          releaseNote: activeRelease.note || undefined,
          hotUpdatedAt: activeRelease.created_at,
        };
        const mergedText = JSON.stringify(mergedManifest);
        const etag = `W/"${(await sha256Hex(mergedText)).slice(0, 24)}"`;
        if (matchesIfNoneMatch(request, etag)) {
          return new Response(null, {
            status: 304,
            headers: {
              ETag: etag,
              'Cache-Control': 'no-cache',
              'X-Spec-Release': activeRelease.id,
              'X-Spec-Version': activeRelease.version,
              'X-Spec-Source': 'bundled+overlay',
              ...CORS_HEADERS,
            },
          });
        }
        return new Response(request.method === 'HEAD' ? null : mergedText, {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-cache',
            ETag: etag,
            'X-Content-Type-Options': 'nosniff',
            'X-Spec-Release': activeRelease.id,
            'X-Spec-Version': activeRelease.version,
            'X-Spec-Source': 'bundled+overlay',
            ...CORS_HEADERS,
          },
        });
      }
    }
  }

  // Fallback to bundled static assets (/sim-data/<cleanPath>)
  const assetRes = await fetchBundledSpecAsset(request, env, cleanPath);
  if (!assetRes) {
    return jsonResponse(
      { ok: false, error: `未找到规格或预设文件: ${cleanPath}` },
      404,
    );
  }

  const assetEtag =
    assetRes.headers.get('ETag') ?? `W/"bundled-${bundledVersion}-${cleanPath}"`;
  const effectiveReleaseId = activeRelease ? activeRelease.id : 'bundled';
  const effectiveVersion = activeRelease ? activeRelease.version : bundledVersion;

  if (matchesIfNoneMatch(request, assetEtag)) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: assetEtag,
        'Cache-Control': 'no-cache',
        'X-Spec-Release': effectiveReleaseId,
        'X-Spec-Version': effectiveVersion,
        'X-Spec-Source': 'bundled-assets',
        ...CORS_HEADERS,
      },
    });
  }

  return new Response(request.method === 'HEAD' ? null : assetRes.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache',
      ETag: assetEtag,
      'X-Content-Type-Options': 'nosniff',
      'X-Spec-Release': effectiveReleaseId,
      'X-Spec-Version': effectiveVersion,
      'X-Spec-Source': 'bundled-assets',
      ...CORS_HEADERS,
    },
  });
}

function safeJsonParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mapReportRow(row: AnomalyReportRow) {
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    category: row.category,
    message: row.message,
    stepIdx: row.step_idx,
    engine: row.engine === 'uni344' ? 'uni344' : 'sun344',
    specVersion: row.spec_version,
    presetId: row.preset_id,
    summary: safeJsonParse(row.summary_json),
    snapshot: safeJsonParse(row.snapshot_json),
    resolutionNote: row.resolution_note,
  };
}

async function handleCreateReport(request: Request, env: WorkerEnv): Promise<Response> {
  const { parsed } = await readJsonBodyBounded<Record<string, unknown>>(
    request,
    MAX_REPORT_BODY_BYTES,
  );

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new HttpError(400, '上报载荷必须是 JSON 对象');
  }

  const clientIp =
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    '0.0.0.0';
  const daySalt = new Date().toISOString().slice(0, 10);
  const ipHash = (await sha256Hex(`zzcal-rpt:${daySalt}:${clientIp}`)).slice(0, 24);

  // Lightweight edge rate limit via indexed D1 query
  const rateRow = await env.DB.prepare(
    `SELECT COUNT(*) AS cnt
     FROM anomaly_reports
     WHERE ip_hash = ?1
       AND created_at >= strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-10 minutes')`,
  )
    .bind(ipHash)
    .first<{ cnt: number }>();

  if ((rateRow?.cnt ?? 0) >= MAX_REPORTS_PER_10_MIN) {
    throw new HttpError(429, '反馈提交过于频繁，请稍后再试');
  }

  const rawCategory = String(parsed.category ?? 'other').trim();
  if (!rawCategory || rawCategory.length > 64) {
    throw new HttpError(400, '异常分类字段无效');
  }

  const message = String(parsed.message ?? '').trim();
  if (message.length > 2000) {
    throw new HttpError(400, '反馈备注长度不可超过 2000 字符');
  }

  const rawEngine = String(parsed.engine ?? 'sun344').trim();
  if (rawEngine !== 'sun344' && rawEngine !== 'uni344') {
    throw new HttpError(400, 'engine 仅支持 sun344 或 uni344');
  }

  const rawStep = parsed.stepIdx ?? parsed.step_idx;
  let stepIdx: number | null = null;
  if (rawStep !== undefined && rawStep !== null && rawStep !== '') {
    const num = Number(rawStep);
    if (!Number.isInteger(num) || num < 0 || num > 100000) {
      throw new HttpError(400, 'stepIdx 必须是非负整数或 null');
    }
    stepIdx = num;
  }

  const specVersion = String(
    parsed.specVersion ??
      parsed.spec_version ??
      env.BUNDLED_SPEC_VERSION ??
      DEFAULT_BUNDLED_VERSION,
  )
    .trim()
    .slice(0, 128);

  const rawPreset = parsed.presetId ?? parsed.preset_id;
  const presetId =
    rawPreset !== undefined && rawPreset !== null && String(rawPreset).trim() !== ''
      ? String(rawPreset).trim().slice(0, 200)
      : null;

  const summaryJson =
    parsed.summary !== undefined && parsed.summary !== null
      ? JSON.stringify(parsed.summary)
      : null;
  const snapshotJson =
    parsed.snapshot !== undefined && parsed.snapshot !== null
      ? JSON.stringify(parsed.snapshot)
      : null;

  const id = `rpt_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const createdAt = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO anomaly_reports (
       id, created_at, status, category, message, step_idx,
       engine, spec_version, preset_id, summary_json, snapshot_json, ip_hash
     ) VALUES (?1, ?2, 'open', ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
  )
    .bind(
      id,
      createdAt,
      rawCategory,
      message,
      stepIdx,
      rawEngine,
      specVersion,
      presetId,
      summaryJson,
      snapshotJson,
      ipHash,
    )
    .run();

  console.log(
    JSON.stringify({
      message: 'anomaly_report_created',
      id,
      category: rawCategory,
      engine: rawEngine,
      specVersion,
      presetId,
    }),
  );

  return jsonResponse({ ok: true, id, createdAt }, 201);
}

async function handleOpsListReports(request: Request, env: WorkerEnv): Promise<Response> {
  await requireAdminAuth(request, env);

  const url = new URL(request.url);
  const statusParam = (url.searchParams.get('status') ?? 'all').trim().toLowerCase();
  const rawLimit = Number(url.searchParams.get('limit') ?? 100);
  const limit = Number.isFinite(rawLimit)
    ? Math.max(1, Math.min(500, Math.trunc(rawLimit)))
    : 100;

  let rows: AnomalyReportRow[];
  if (statusParam === 'open' || statusParam === 'resolved' || statusParam === 'ignored') {
    const res = await env.DB.prepare(
      `SELECT id, created_at, status, category, message, step_idx, engine,
              spec_version, preset_id, summary_json, snapshot_json, ip_hash, resolution_note
       FROM anomaly_reports
       WHERE status = ?1
       ORDER BY created_at DESC
       LIMIT ?2`,
    )
      .bind(statusParam, limit)
      .all<AnomalyReportRow>();
    rows = res.results ?? [];
  } else {
    const res = await env.DB.prepare(
      `SELECT id, created_at, status, category, message, step_idx, engine,
              spec_version, preset_id, summary_json, snapshot_json, ip_hash, resolution_note
       FROM anomaly_reports
       ORDER BY created_at DESC
       LIMIT ?1`,
    )
      .bind(limit)
      .all<AnomalyReportRow>();
    rows = res.results ?? [];
  }

  return jsonResponse({
    ok: true,
    reports: rows.map(mapReportRow),
  });
}

async function handleOpsUpdateReport(
  request: Request,
  env: WorkerEnv,
  reportId: string,
): Promise<Response> {
  await requireAdminAuth(request, env);

  const cleanId = decodeURIComponent(reportId).trim();
  if (!cleanId) {
    throw new HttpError(400, '缺少工单 ID');
  }

  if (request.method === 'DELETE') {
    const res = await env.DB.prepare('DELETE FROM anomaly_reports WHERE id = ?1')
      .bind(cleanId)
      .run();
    return jsonResponse({
      ok: true,
      deletedId: cleanId,
      changes: res.meta?.changes ?? 0,
    });
  }

  const { parsed } = await readJsonBodyBounded<Record<string, unknown>>(request, 32 * 1024);
  const status = String(parsed.status ?? '').trim();
  if (status !== 'open' && status !== 'resolved' && status !== 'ignored') {
    throw new HttpError(400, 'status 必须是 open | resolved | ignored');
  }

  const resolutionNote = String(
    parsed.resolutionNote ?? parsed.resolution_note ?? '',
  )
    .trim()
    .slice(0, 2000);

  await env.DB.prepare(
    `UPDATE anomaly_reports
     SET status = ?1, resolution_note = ?2
     WHERE id = ?3`,
  )
    .bind(status, resolutionNote, cleanId)
    .run();

  const updated = await env.DB.prepare(
    `SELECT id, created_at, status, category, message, step_idx, engine,
            spec_version, preset_id, summary_json, snapshot_json, ip_hash, resolution_note
     FROM anomaly_reports
     WHERE id = ?1`,
  )
    .bind(cleanId)
    .first<AnomalyReportRow>();

  if (!updated) {
    throw new HttpError(404, `未找到工单: ${cleanId}`);
  }

  console.log(
    JSON.stringify({
      message: 'anomaly_report_updated',
      id: cleanId,
      status,
    }),
  );

  return jsonResponse({
    ok: true,
    report: mapReportRow(updated),
  });
}

async function handleOpsListReleases(request: Request, env: WorkerEnv): Promise<Response> {
  await requireAdminAuth(request, env);

  const res = await env.DB.prepare(
    `SELECT id, created_at, version, note, files_json, is_active
     FROM spec_releases
     ORDER BY created_at DESC
     LIMIT 100`,
  ).all<ActiveReleaseRow>();

  const rows = res.results ?? [];
  const active = rows.find((r) => r.is_active === 1);

  const releases = rows.map((r) => {
    const filesMap = parseFilesMap(r.id, r.files_json);
    return {
      id: r.id,
      createdAt: r.created_at,
      version: r.version,
      note: r.note,
      files: Object.keys(filesMap),
      isActive: r.is_active === 1,
    };
  });

  return jsonResponse({
    ok: true,
    bundledVersion: env.BUNDLED_SPEC_VERSION || DEFAULT_BUNDLED_VERSION,
    activeReleaseId: active ? active.id : 'bundled',
    activeVersion: active
      ? active.version
      : env.BUNDLED_SPEC_VERSION || DEFAULT_BUNDLED_VERSION,
    releases,
  });
}

async function handleOpsPublishSpecs(request: Request, env: WorkerEnv): Promise<Response> {
  await requireAdminAuth(request, env);

  const { parsed } = await readJsonBodyBounded<Record<string, unknown>>(
    request,
    MAX_SPEC_PUBLISH_BYTES,
  );

  const version = String(parsed.version ?? '').trim();
  if (!version || version.length > 128) {
    throw new HttpError(400, 'version 必填且长度不可超过 128 字符');
  }

  const note = String(parsed.note ?? '').trim().slice(0, 1000);
  const activate = parsed.activate !== false;
  const inheritActive = parsed.inheritActive === true;

  const rawFiles = parsed.files;
  if (!rawFiles || typeof rawFiles !== 'object' || Array.isArray(rawFiles)) {
    throw new HttpError(400, 'files 必须是 { [relPath]: jsonContent } 映射对象');
  }

  const entries = Object.entries(rawFiles as Record<string, unknown>);
  if (entries.length === 0) {
    throw new HttpError(400, 'files 至少需要包含 1 个 JSON 文件');
  }
  if (entries.length > 200) {
    throw new HttpError(400, '单次热更新文件数量不可超过 200 个');
  }

  const releaseId = `rel_${Date.now().toString(36)}_${crypto
    .randomUUID()
    .replace(/-/g, '')
    .slice(0, 8)}`;
  const createdAt = new Date().toISOString();

  const filesMeta: Record<string, StoredFileMeta> = {};

  if (inheritActive) {
    const prevActive = await getActiveRelease(env);
    if (prevActive) {
      Object.assign(filesMeta, parseFilesMap(prevActive.id, prevActive.files_json));
    }
  }

  for (const [rawPath, rawContent] of entries) {
    const cleanPath = normalizeSpecRelPath(rawPath);
    let jsonObject: unknown;
    let jsonText: string;

    if (typeof rawContent === 'string') {
      try {
        jsonObject = JSON.parse(rawContent);
      } catch {
        throw new HttpError(400, `文件 [${cleanPath}] 内容不是合法的 JSON 字符串`);
      }
      jsonText = rawContent;
    } else if (rawContent !== null && typeof rawContent === 'object') {
      jsonObject = rawContent;
      jsonText = JSON.stringify(rawContent);
    } else {
      throw new HttpError(400, `文件 [${cleanPath}] 内容必须是 JSON 对象、数组或字符串`);
    }

    if (jsonObject && typeof jsonObject === 'object' && !Array.isArray(jsonObject)) {
      const objRecord = jsonObject as Record<string, unknown>;
      if (cleanPath === 'manifest.json') {
        jsonText = JSON.stringify({
          ...objRecord,
          version,
          releaseId,
        });
      } else if (
        'version' in objRecord ||
        cleanPath.startsWith('specs/') ||
        cleanPath.startsWith('benchmarks/')
      ) {
        const nextObj: Record<string, unknown> = { ...objRecord, version };
        if (
          objRecord.metadata &&
          typeof objRecord.metadata === 'object' &&
          !Array.isArray(objRecord.metadata)
        ) {
          nextObj.metadata = {
            ...(objRecord.metadata as Record<string, unknown>),
            version,
          };
        }
        jsonText = JSON.stringify(nextObj);
      }
    }

    const byteSize = new TextEncoder().encode(jsonText).byteLength;
    const hash = await sha256Hex(jsonText);
    const etag = `W/"${hash.slice(0, 24)}"`;
    const storageKey = `rel:${releaseId}:${cleanPath}`;

    await env.SPECS_KV.put(storageKey, jsonText, {
      metadata: {
        releaseId,
        version,
        path: cleanPath,
        etag,
        size: byteSize,
      },
    });

    filesMeta[cleanPath] = {
      storageKey,
      etag,
      size: byteSize,
    };
  }

  const filesJson = JSON.stringify(filesMeta);
  const insertStmt = env.DB.prepare(
    `INSERT INTO spec_releases (id, created_at, version, note, files_json, is_active)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
  ).bind(releaseId, createdAt, version, note, filesJson, activate ? 1 : 0);

  if (activate) {
    await env.DB.batch([
      env.DB.prepare('UPDATE spec_releases SET is_active = 0 WHERE is_active = 1'),
      insertStmt,
    ]);
  } else {
    await insertStmt.run();
  }

  console.log(
    JSON.stringify({
      message: 'spec_release_published',
      releaseId,
      version,
      filesCount: Object.keys(filesMeta).length,
      activate,
    }),
  );

  return jsonResponse(
    {
      ok: true,
      releaseId,
      version,
      note,
      createdAt,
      isActive: activate,
      files: Object.keys(filesMeta),
      filesCount: Object.keys(filesMeta).length,
    },
    201,
  );
}

async function handleOpsRollback(request: Request, env: WorkerEnv): Promise<Response> {
  await requireAdminAuth(request, env);

  const { parsed } = await readJsonBodyBounded<Record<string, unknown>>(request, 16 * 1024);
  const target = String(
    parsed.releaseId ?? parsed.release_id ?? parsed.target ?? 'bundled',
  ).trim();
  const bundledVersion = env.BUNDLED_SPEC_VERSION || DEFAULT_BUNDLED_VERSION;

  if (
    !target ||
    target === 'bundled' ||
    target === 'default' ||
    target === 'static' ||
    target === 'none'
  ) {
    await env.DB.prepare('UPDATE spec_releases SET is_active = 0 WHERE is_active = 1').run();
    console.log(
      JSON.stringify({
        message: 'spec_release_rollback',
        activeReleaseId: 'bundled',
        version: bundledVersion,
      }),
    );
    return jsonResponse({
      ok: true,
      activeReleaseId: 'bundled',
      version: bundledVersion,
    });
  }

  let targetRow = await env.DB.prepare(
    `SELECT id, created_at, version, note, files_json, is_active
     FROM spec_releases
     WHERE id = ?1
     LIMIT 1`,
  )
    .bind(target)
    .first<ActiveReleaseRow>();

  if (!targetRow) {
    targetRow = await env.DB.prepare(
      `SELECT id, created_at, version, note, files_json, is_active
       FROM spec_releases
       WHERE version = ?1
       ORDER BY created_at DESC
       LIMIT 1`,
    )
      .bind(target)
      .first<ActiveReleaseRow>();
  }

  if (!targetRow) {
    throw new HttpError(404, `未找到目标历史热更新版本: ${target}`);
  }

  const filesMap = parseFilesMap(targetRow.id, targetRow.files_json);
  const firstMeta = Object.values(filesMap)[0];
  if (firstMeta) {
    const probe = await env.SPECS_KV.get(firstMeta.storageKey, 'stream');
    if (!probe) {
      throw new HttpError(410, `历史版本 [${targetRow.id}] 的 KV 数据对象已不存在`);
    }
  }

  await env.DB.batch([
    env.DB.prepare('UPDATE spec_releases SET is_active = 0 WHERE is_active = 1'),
    env.DB.prepare('UPDATE spec_releases SET is_active = 1 WHERE id = ?1').bind(
      targetRow.id,
    ),
  ]);

  console.log(
    JSON.stringify({
      message: 'spec_release_rollback',
      activeReleaseId: targetRow.id,
      version: targetRow.version,
    }),
  );

  return jsonResponse({
    ok: true,
    activeReleaseId: targetRow.id,
    version: targetRow.version,
  });
}

function selectCoepPolicy(request: Request): string {
  const ua = request.headers.get('User-Agent') ?? '';
  // Apple WebKit Safari (desktop & iOS) requires `require-corp` to enable
  // `window.crossOriginIsolated` when `credentialless` is unsupported; Google Fonts
  // (`fonts.googleapis.com` & `fonts.gstatic.com`) serves `Cross-Origin-Resource-Policy: cross-origin`.
  const isSafariOnly =
    /Safari\//i.test(ua) &&
    !/(Chrome|Chromium|CriOS|FxiOS|Edg|EdgiOS|OPR|Android)/i.test(ua);
  return isSafariOnly ? 'require-corp' : 'credentialless';
}

async function handleStaticAsset(request: Request, env: WorkerEnv): Promise<Response> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonResponse({ ok: false, error: 'Method Not Allowed' }, 405);
  }

  const assetRes = await env.ASSETS.fetch(request);
  const headers = new Headers(assetRes.headers);
  const pathname = new URL(request.url).pathname.toLowerCase();

  // Enable crossOriginIsolated (SharedArrayBuffer multi-threaded WASM) across
  // HTML documents, Web Workers, pthread sub-workers, and WASM modules.
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', selectCoepPolicy(request));
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  headers.set('X-Content-Type-Options', 'nosniff');

  if (pathname.endsWith('.wasm')) {
    headers.set('Content-Type', 'application/wasm');
  }

  const isNullBodyStatus =
    assetRes.status === 101 ||
    assetRes.status === 204 ||
    assetRes.status === 205 ||
    assetRes.status === 304 ||
    request.method === 'HEAD';

  return new Response(isNullBodyStatus ? null : assetRes.body, {
    status: assetRes.status,
    statusText: assetRes.statusText,
    headers,
  });
}

async function routeApiRequest(request: Request, env: WorkerEnv): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (path === '/api/health' && (method === 'GET' || method === 'HEAD')) {
    const active = await getActiveRelease(env);
    const bundledVersion = env.BUNDLED_SPEC_VERSION || DEFAULT_BUNDLED_VERSION;
    return jsonResponse({
      ok: true,
      service: 'zzcal-sim',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      bundledVersion,
      activeReleaseId: active ? active.id : 'bundled',
      activeVersion: active ? active.version : bundledVersion,
      storage: 'kv+d1',
    });
  }

  if (path.startsWith('/api/specs/') && (method === 'GET' || method === 'HEAD')) {
    const subPath = path.slice('/api/specs/'.length);
    return handleGetSpec(request, env, subPath);
  }

  if (path === '/api/reports' && method === 'POST') {
    return handleCreateReport(request, env);
  }

  if (path === '/api/ops/reports' && method === 'GET') {
    return handleOpsListReports(request, env);
  }

  if (path.startsWith('/api/ops/reports/') && (method === 'PATCH' || method === 'DELETE')) {
    const reportId = path.slice('/api/ops/reports/'.length);
    return handleOpsUpdateReport(request, env, reportId);
  }

  if (path === '/api/ops/releases' && method === 'GET') {
    return handleOpsListReleases(request, env);
  }

  if (path === '/api/ops/specs' && method === 'POST') {
    return handleOpsPublishSpecs(request, env);
  }

  if (path === '/api/ops/rollback' && method === 'POST') {
    return handleOpsRollback(request, env);
  }

  return jsonResponse({ ok: false, error: `未知 API 路由: ${method} ${path}` }, 404);
}

export default {
  async fetch(
    request: Request,
    env: WorkerEnv,
    _ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api' || url.pathname.startsWith('/api/')) {
        return await routeApiRequest(request, env);
      }
      return await handleStaticAsset(request, env);
    } catch (err) {
      if (err instanceof HttpError) {
        return jsonResponse({ ok: false, error: err.message }, err.status);
      }
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        JSON.stringify({
          message: 'worker_unhandled_exception',
          method: request.method,
          path: url.pathname,
          error: message,
        }),
      );
      return jsonResponse({ ok: false, error: '服务器内部错误' }, 500);
    }
  },
} satisfies ExportedHandler<WorkerEnv>;
