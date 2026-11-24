/**
 * ZZZ 3.4.4 Web Worker Simulation Runtime (`zzz-sun344` + `zzz-uni344`)
 *
 * Bridges async messages from `src/sim/wasmClient.ts` to both WebAssembly engines:
 * - Supports pre-compiled `WebAssembly.Module` sharing across multi-Worker shards
 *   when `crossOriginIsolated === true`, and URL/fetch initialization fallback
 *   for single-Worker / WeChat / QQ / iOS Safari WebView environments.
 * - Keeps linear memory strictly <= 256 MB (`--max-memory=268435456`).
 */

import initSun, {
  sun344_cache_spec_json,
  sun344_lns_shard_json,
  sun344_polish_json,
  sun344_replay_json,
  sun344_search_json,
  sun344_stage1_json,
} from './zzz_sun344.js';

import initUni, {
  uni344_cache_catalog_json,
  uni344_catalog_meta_json,
  uni344_replay_json,
  uni344_search_json,
} from './zzz_uni344.js';

let sunReady = false;
let uniReady = false;
let initPromise = null;

function formatWasmError(err) {
  if (!err) return 'Unknown WASM error';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message || String(err);
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

async function ensureInitialized(payload = {}) {
  if (sunReady && uniReady) {
    return { sunReady, uniReady };
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const base = payload.wasmBaseUrl || new URL('./', import.meta.url).href;
    const sunSource =
      payload.sunModule instanceof WebAssembly.Module
        ? payload.sunModule
        : new URL('zzz_sun344_bg.wasm', base).href;
    const uniSource =
      payload.uniModule instanceof WebAssembly.Module
        ? payload.uniModule
        : new URL('zzz_uni344_bg.wasm', base).href;

    await Promise.all([
      initSun({ module_or_path: sunSource }).then(() => {
        sunReady = true;
      }),
      initUni({ module_or_path: uniSource }).then(() => {
        uniReady = true;
      }),
    ]);

    return { sunReady, uniReady };
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

self.onmessage = async (event) => {
  const msg = event.data;
  if (!msg || typeof msg.reqId !== 'number') return;

  const { reqId, cmd, payload = {} } = msg;

  try {
    if (cmd === 'init') {
      const status = await ensureInitialized(payload);
      self.postMessage({ reqId, ok: true, result: status });
      return;
    }

    await ensureInitialized(payload);

    let rawJson;
    switch (cmd) {
      case 'cache_sun_spec': {
        rawJson = sun344_cache_spec_json(String(payload.specJson ?? ''));
        break;
      }
      case 'cache_uni_catalog': {
        rawJson = uni344_cache_catalog_json(String(payload.catalogJson ?? ''));
        break;
      }
      case 'sun344_replay': {
        const reqStr =
          typeof payload.req === 'string' ? payload.req : JSON.stringify(payload.req ?? {});
        rawJson = sun344_replay_json(reqStr);
        break;
      }
      case 'sun344_search': {
        self.postMessage({
          reqId,
          type: 'progress',
          stage: '正在执行挽昼专核束搜索与 LNS 滑窗精修…',
          pct: 35,
        });
        const reqStr =
          typeof payload.req === 'string' ? payload.req : JSON.stringify(payload.req ?? {});
        rawJson = sun344_search_json(reqStr);
        break;
      }
      case 'sun344_stage1': {
        const reqStr =
          typeof payload.req === 'string' ? payload.req : JSON.stringify(payload.req ?? {});
        rawJson = sun344_stage1_json(reqStr);
        break;
      }
      case 'sun344_lns_shard': {
        const reqStr =
          typeof payload.req === 'string' ? payload.req : JSON.stringify(payload.req ?? {});
        rawJson = sun344_lns_shard_json(reqStr);
        break;
      }
      case 'sun344_polish': {
        const reqStr =
          typeof payload.req === 'string' ? payload.req : JSON.stringify(payload.req ?? {});
        rawJson = sun344_polish_json(reqStr);
        break;
      }
      case 'uni344_replay': {
        const reqStr =
          typeof payload.req === 'string' ? payload.req : JSON.stringify(payload.req ?? {});
        rawJson = uni344_replay_json(reqStr);
        break;
      }
      case 'uni344_search': {
        self.postMessage({
          reqId,
          type: 'progress',
          stage: '正在执行通用插件双阶段失衡周期束搜索…',
          pct: 35,
        });
        const reqStr =
          typeof payload.req === 'string' ? payload.req : JSON.stringify(payload.req ?? {});
        rawJson = uni344_search_json(reqStr);
        break;
      }
      case 'uni344_catalog_meta': {
        const catStr = payload.catalogJson ? String(payload.catalogJson) : '';
        rawJson = uni344_catalog_meta_json(catStr);
        break;
      }
      default:
        throw new Error(`Unknown simWorker command: ${cmd}`);
    }

    const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    self.postMessage({ reqId, ok: true, result: parsed });
  } catch (err) {
    self.postMessage({
      reqId,
      ok: false,
      error: formatWasmError(err),
    });
  }
};
