import { describe, it, expect } from 'vitest';
import worker, {
  normalizeSpecRelPath,
  verifyAdminToken,
  type WorkerEnv,
} from './index';

interface MockReportRow {
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

interface MockReleaseRow {
  id: string;
  created_at: string;
  version: string;
  note: string;
  files_json: string;
  is_active: number;
}

function createMockEnv(adminToken = 'zzcal_adm_test_secret_token_123456') {
  const kvStore = new Map<string, string>();
  const reports: MockReportRow[] = [];
  const releases: MockReleaseRow[] = [];

  const staticAssets: Record<string, { body: string; contentType: string }> = {
    '/': {
      body: '<!DOCTYPE html><html><head><title>ZZZ</title></head><body></body></html>',
      contentType: 'text/html; charset=utf-8',
    },
    '/wasm/zzz_sun344_bg.wasm': {
      body: '\x00asm\x01\x00\x00\x00',
      contentType: 'application/octet-stream',
    },
    '/sim-data/manifest.json': {
      body: JSON.stringify({
        version: '3.4.5_r20699967',
        generatedAt: '2026-11-20T00:00:00Z',
        releaseId: 'bundled',
        presets: [{ id: 'p1' }],
      }),
      contentType: 'application/json',
    },
    '/sim-data/specs/sun_team_344_spec.json': {
      body: JSON.stringify({
        version: '3.4.5_r20699967',
        actions: { SunUlt1: { dmg: 1000 } },
      }),
      contentType: 'application/json',
    },
  };

  function makeStatement(sql: string, boundValues: unknown[] = []): D1PreparedStatement {
    const normalizedSql = sql.replace(/\s+/g, ' ').trim();
    return {
      bind(...vals: unknown[]) {
        return makeStatement(sql, vals);
      },
      async first<T = Record<string, unknown>>(): Promise<T | null> {
        if (normalizedSql.includes('FROM spec_releases WHERE is_active = 1')) {
          const active = [...releases].reverse().find((r) => r.is_active === 1);
          return (active as unknown as T) ?? null;
        }
        if (normalizedSql.includes('FROM spec_releases WHERE id = ?1')) {
          const found = releases.find((r) => r.id === boundValues[0]);
          return (found as unknown as T) ?? null;
        }
        if (normalizedSql.includes('FROM spec_releases WHERE version = ?1')) {
          const found = [...releases].reverse().find((r) => r.version === boundValues[0]);
          return (found as unknown as T) ?? null;
        }
        if (normalizedSql.includes('COUNT(*) AS cnt FROM anomaly_reports')) {
          const ipHash = boundValues[0];
          const cnt = reports.filter((r) => r.ip_hash === ipHash).length;
          return { cnt } as unknown as T;
        }
        if (normalizedSql.includes('FROM anomaly_reports WHERE id = ?1')) {
          const found = reports.find((r) => r.id === boundValues[0]);
          return (found as unknown as T) ?? null;
        }
        return null;
      },
      async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
        if (normalizedSql.includes('FROM spec_releases ORDER BY created_at DESC')) {
          return {
            results: [...releases].reverse() as unknown as T[],
            success: true,
            meta: {},
          };
        }
        if (normalizedSql.includes('FROM anomaly_reports WHERE status = ?1')) {
          const status = boundValues[0];
          const limit = Number(boundValues[1] ?? 100);
          const filtered = [...reports]
            .reverse()
            .filter((r) => r.status === status)
            .slice(0, limit);
          return { results: filtered as unknown as T[], success: true, meta: {} };
        }
        if (normalizedSql.includes('FROM anomaly_reports ORDER BY created_at DESC')) {
          const limit = Number(boundValues[0] ?? 100);
          return {
            results: [...reports].reverse().slice(0, limit) as unknown as T[],
            success: true,
            meta: {},
          };
        }
        return { results: [], success: true, meta: {} };
      },
      async run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
        if (normalizedSql.startsWith('INSERT INTO anomaly_reports')) {
          reports.push({
            id: String(boundValues[0]),
            created_at: String(boundValues[1]),
            status: 'open',
            category: String(boundValues[2]),
            message: String(boundValues[3]),
            step_idx: (boundValues[4] as number | null) ?? null,
            engine: String(boundValues[5]),
            spec_version: String(boundValues[6]),
            preset_id: (boundValues[7] as string | null) ?? null,
            summary_json: (boundValues[8] as string | null) ?? null,
            snapshot_json: (boundValues[9] as string | null) ?? null,
            ip_hash: (boundValues[10] as string | null) ?? null,
            resolution_note: null,
          });
          return { results: [], success: true, meta: { changes: 1 } };
        }
        if (normalizedSql.startsWith('UPDATE anomaly_reports SET status = ?1')) {
          const target = reports.find((r) => r.id === boundValues[2]);
          if (target) {
            target.status = String(boundValues[0]);
            target.resolution_note = String(boundValues[1]);
          }
          return { results: [], success: true, meta: { changes: target ? 1 : 0 } };
        }
        if (normalizedSql.startsWith('DELETE FROM anomaly_reports WHERE id = ?1')) {
          const idx = reports.findIndex((r) => r.id === boundValues[0]);
          if (idx >= 0) reports.splice(idx, 1);
          return { results: [], success: true, meta: { changes: idx >= 0 ? 1 : 0 } };
        }
        if (normalizedSql.startsWith('UPDATE spec_releases SET is_active = 0')) {
          for (const rel of releases) rel.is_active = 0;
          return { results: [], success: true, meta: { changes: releases.length } };
        }
        if (normalizedSql.startsWith('UPDATE spec_releases SET is_active = 1 WHERE id = ?1')) {
          const target = releases.find((r) => r.id === boundValues[0]);
          if (target) target.is_active = 1;
          return { results: [], success: true, meta: { changes: target ? 1 : 0 } };
        }
        if (normalizedSql.startsWith('INSERT INTO spec_releases')) {
          releases.push({
            id: String(boundValues[0]),
            created_at: String(boundValues[1]),
            version: String(boundValues[2]),
            note: String(boundValues[3]),
            files_json: String(boundValues[4]),
            is_active: Number(boundValues[5]),
          });
          return { results: [], success: true, meta: { changes: 1 } };
        }
        return { results: [], success: true, meta: {} };
      },
    };
  }

  const env: WorkerEnv = {
    BUNDLED_SPEC_VERSION: '3.4.5_r20699967',
    OPS_ADMIN_TOKEN: adminToken,
    ASSETS: {
      async fetch(input: RequestInfo | URL): Promise<Response> {
        const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        const u = new URL(urlStr);
        const hit = staticAssets[u.pathname];
        if (!hit) {
          return new Response(staticAssets['/'].body, {
            status: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          });
        }
        return new Response(hit.body, {
          status: 200,
          headers: {
            'Content-Type': hit.contentType,
            ETag: `W/"static-${u.pathname}"`,
          },
        });
      },
    },
    DB: {
      prepare(query: string) {
        return makeStatement(query);
      },
      async batch<T = unknown>(stmts: D1PreparedStatement[]): Promise<D1Result<T>[]> {
        const out: D1Result<T>[] = [];
        for (const s of stmts) {
          out.push(await s.run<T>());
        }
        return out;
      },
      async exec() {
        return { count: 1, duration: 0 };
      },
    },
    SPECS_KV: {
      async get(key: string, type?: unknown): Promise<any> {
        const val = kvStore.get(key) ?? null;
        if (val === null) return null;
        if (type === 'stream') {
          return new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode(val));
              controller.close();
            },
          });
        }
        if (type === 'json') return JSON.parse(val);
        return val;
      },
      async getWithMetadata(): Promise<any> {
        return { value: null, metadata: null };
      },
      async put(key: string, value: unknown): Promise<void> {
        kvStore.set(key, String(value));
      },
      async delete(key: string): Promise<void> {
        kvStore.delete(key);
      },
    },
  };

  const ctx: ExecutionContext = {
    waitUntil() {},
    passThroughOnException() {},
  };

  return { env, ctx, kvStore, reports, releases };
}

describe('Cloudflare Worker Full-Stack Backend (worker/index.ts)', () => {
  it('verifies constant-time admin tokens and rejects mismatches', async () => {
    expect(await verifyAdminToken('secret-abc', 'secret-abc')).toBe(true);
    expect(await verifyAdminToken('secret-abc', 'secret-abd')).toBe(false);
    expect(await verifyAdminToken('', 'secret-abc')).toBe(false);
  });

  it('sanitizes spec relative paths and blocks path traversal', () => {
    expect(normalizeSpecRelPath('/api/specs/specs/sun_team_344_spec.json')).toBe(
      'specs/sun_team_344_spec.json',
    );
    expect(() => normalizeSpecRelPath('../package.json')).toThrow();
    expect(() => normalizeSpecRelPath('specs/not_json.txt')).toThrow();
  });

  it('injects COOP/COEP crossOriginIsolated headers on HTML and application/wasm on .wasm', async () => {
    const { env, ctx } = createMockEnv();

    const htmlRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/', {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/131.0.0.0 Safari/537.36' },
      }),
      env,
      ctx,
    );
    expect(htmlRes.status).toBe(200);
    expect(htmlRes.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
    expect(htmlRes.headers.get('Cross-Origin-Embedder-Policy')).toBe('credentialless');

    const safariRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/', {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
        },
      }),
      env,
      ctx,
    );
    expect(safariRes.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');

    const wasmRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/wasm/zzz_sun344_bg.wasm'),
      env,
      ctx,
    );
    expect(wasmRes.headers.get('Content-Type')).toBe('application/wasm');
    expect(wasmRes.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
  });

  it('handles anomaly report submission, size limits, auth, and resolution lifecycle', async () => {
    const token = 'adm_token_xyz';
    const { env, ctx } = createMockEnv(token);

    // Create report
    const createRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9' },
        body: JSON.stringify({
          category: 'multiplier_mismatch',
          message: 'SunUlt1 test note',
          stepIdx: 12,
          engine: 'sun344',
          specVersion: '3.4.4_r20541895',
          presetId: 'sun344_knot_6gold_110111',
          summary: { totalDmg: 367760763 },
          snapshot: { macros: ['SunEx'] },
        }),
      }),
      env,
      ctx,
    );
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { ok: boolean; id: string };
    expect(created.ok).toBe(true);
    expect(created.id).toMatch(/^rpt_/);

    // Oversized report > 256 KB rejected with 413
    const hugeBody = JSON.stringify({
      category: 'other',
      engine: 'sun344',
      specVersion: '3.4.4',
      snapshot: { pad: 'x'.repeat(270 * 1024) },
    });
    const hugeRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: hugeBody,
      }),
      env,
      ctx,
    );
    expect(hugeRes.status).toBe(413);

    // Unauthorized ops call rejected with 401
    const unauthRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/api/ops/reports'),
      env,
      ctx,
    );
    expect(unauthRes.status).toBe(401);

    // Authorized ops list & PATCH resolve
    const listRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/api/ops/reports?status=open', {
        headers: { Authorization: `Bearer ${token}` },
      }),
      env,
      ctx,
    );
    expect(listRes.status).toBe(200);
    const listBody = (await listRes.json()) as { reports: Array<{ id: string }> };
    expect(listBody.reports).toHaveLength(1);

    const patchRes = await worker.fetch(
      new Request(
        `https://zzcal-sim.augusta0814.workers.dev/api/ops/reports/${created.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'resolved', resolutionNote: 'Verified OK' }),
        },
      ),
      env,
      ctx,
    );
    expect(patchRes.status).toBe(200);
    const patched = (await patchRes.json()) as {
      report: { status: string; resolutionNote: string };
    };
    expect(patched.report.status).toBe('resolved');
    expect(patched.report.resolutionNote).toBe('Verified OK');
  });

  it('supports zero-compile hot spec publishing, manifest version overlay, and instant rollback to bundled', async () => {
    const token = 'adm_token_hotfix';
    const { env, ctx } = createMockEnv(token);

    // 1. Initial bundled read
    const initManifestRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/api/specs/manifest.json'),
      env,
      ctx,
    );
    expect(initManifestRes.status).toBe(200);
    expect(initManifestRes.headers.get('X-Spec-Release')).toBe('bundled');
    const initManifest = (await initManifestRes.json()) as { version: string };
    expect(initManifest.version).toBe('3.4.5_r20699967');

    // 2. Publish partial spec hotfix (only sun_team_344_spec.json)
    const pubRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/api/ops/specs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: '3.4.4_hotfix_qa_test',
          note: 'QA hotfix test',
          activate: true,
          files: {
            'specs/sun_team_344_spec.json': {
              version: '3.4.5_r20699967',
              actions: { SunUlt1: { dmg: 1050 } },
            },
          },
        }),
      }),
      env,
      ctx,
    );
    expect(pubRes.status).toBe(201);
    const pubBody = (await pubRes.json()) as { releaseId: string; version: string };
    expect(pubBody.releaseId).toMatch(/^rel_/);

    // 3. Verify updated spec AND overlaid manifest version immediately
    const hotSpecRes = await worker.fetch(
      new Request(
        'https://zzcal-sim.augusta0814.workers.dev/api/specs/specs/sun_team_344_spec.json',
      ),
      env,
      ctx,
    );
    expect(hotSpecRes.headers.get('X-Spec-Release')).toBe(pubBody.releaseId);
    expect(hotSpecRes.headers.get('X-Spec-Source')).toBe('kv-hotfix');
    const hotSpec = (await hotSpecRes.json()) as {
      version: string;
      actions: { SunUlt1: { dmg: number } };
    };
    expect(hotSpec.version).toBe('3.4.4_hotfix_qa_test');
    expect(hotSpec.actions.SunUlt1.dmg).toBe(1050);

    const hotManifestRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/api/specs/manifest.json'),
      env,
      ctx,
    );
    const hotManifest = (await hotManifestRes.json()) as {
      version: string;
      releaseId: string;
    };
    expect(hotManifest.version).toBe('3.4.4_hotfix_qa_test');
    expect(hotManifest.releaseId).toBe(pubBody.releaseId);

    // 4. Instant rollback to "bundled"
    const rbRes = await worker.fetch(
      new Request('https://zzcal-sim.augusta0814.workers.dev/api/ops/rollback', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ releaseId: 'bundled' }),
      }),
      env,
      ctx,
    );
    expect(rbRes.status).toBe(200);

    const restoredSpecRes = await worker.fetch(
      new Request(
        'https://zzcal-sim.augusta0814.workers.dev/api/specs/specs/sun_team_344_spec.json',
      ),
      env,
      ctx,
    );
    expect(restoredSpecRes.headers.get('X-Spec-Release')).toBe('bundled');
    const restoredSpec = (await restoredSpecRes.json()) as {
      actions: { SunUlt1: { dmg: number } };
    };
    expect(restoredSpec.actions.SunUlt1.dmg).toBe(1000);
  });
});
