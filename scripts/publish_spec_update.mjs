#!/usr/bin/env node
/**
 * ZZZ 3.4.4 实战排轴工作台 —— 本机一键纯倍率/预设热更新与回滚 CLI 脚本
 *
 * 用法示例：
 *   1. 本地结构与载荷干跑校验（默认校验 public/sim-data 核心包，也可指定文件）：
 *      node scripts/publish_spec_update.mjs --dry-run
 *      node scripts/publish_spec_update.mjs --dry-run --version 3.4.4_v5 --file public/sim-data/specs/sun_team_344_spec.json
 *
 *   2. 推送新倍率或新跑出的预设 JSON 到线上 Cloudflare Worker（无需重编 Rust/WASM）：
 *      $env:HTTPS_PROXY="http://127.0.0.1:7897"
 *      $env:OPS_ADMIN_TOKEN="<token>"
 *      node scripts/publish_spec_update.mjs --version 3.4.4_hotfix_v5 --note "v5倍率热更" \
 *        --file d:\zzz-sim\data\sun_team_344_spec.json=specs/sun_team_344_spec.json
 *
 *   3. 查看线上历史发布记录：
 *      node scripts/publish_spec_update.mjs --list-releases
 *
 *   4. 一键回滚到历史版本或初始内置静态包 ("bundled")：
 *      node scripts/publish_spec_update.mjs --rollback bundled
 *      node scripts/publish_spec_update.mjs --rollback <releaseId>
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SIM_DATA_DIR = path.join(PROJECT_ROOT, 'public', 'sim-data');

const DEFAULT_ENDPOINT = 'https://zzzcalc.pages.dev';
const MAX_SINGLE_FILE_BYTES = 24 * 1024 * 1024; // 预留安全余量适配 Cloudflare KV 25 MiB 上限

function printHelp() {
  console.log(`
ZZZ 3.4.5 排轴模拟器 —— 纯倍率与预设热更新运维工具 (publish_spec_update.mjs)

参数说明:
  --endpoint <url>             线上 Worker 根地址 (默认: ${DEFAULT_ENDPOINT} 或环境变量 ZZCAL_OPS_ENDPOINT)
  --token <secret>             管理员密钥 (默认读取环境变量 OPS_ADMIN_TOKEN 或本机 .dev.vars)
  --proxy <url>                显式指定 HTTP 代理 (默认自动读取 HTTPS_PROXY / HTTP_PROXY，如 http://127.0.0.1:7897)
  --no-proxy                   禁用代理直连
  --version <ver>              发布的倍率/数据包版本号 (如 3.4.5_r20699967_v2)
  --note <text>                版本发布说明备注
  --no-activate                仅上传归档，不立即切换为线上激活版本
  --file <local>[=<remoteKey>] 指定待发布 JSON 文件 (可重复传参；省略 =<remoteKey> 时自动推导目标相对路径)
  --dry-run                    仅在本地校验 JSON 语法、Schema 完整性与体积限制，不发送写请求
  --list-releases              查询线上历史热更新版本列表 (GET /api/ops/releases)
  --rollback [releaseId]       一键回滚到指定 releaseId，省略或传 bundled 回退至内置静态包 (POST /api/ops/rollback)
  -h, --help                   显示帮助信息
`.trim());
}

function parseCliArgs(argv) {
  const opts = {
    endpoint: process.env.ZZCAL_OPS_ENDPOINT || DEFAULT_ENDPOINT,
    token: process.env.OPS_ADMIN_TOKEN || '',
    proxy:
      process.env.HTTPS_PROXY ||
      process.env.https_proxy ||
      process.env.HTTP_PROXY ||
      process.env.http_proxy ||
      process.env.ALL_PROXY ||
      '',
    noProxy: false,
    version: '',
    note: '',
    activate: true,
    files: [],
    dryRun: false,
    listReleases: false,
    rollbackTarget: null,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      opts.help = true;
    } else if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--no-proxy') {
      opts.noProxy = true;
    } else if (arg === '--no-activate') {
      opts.activate = false;
    } else if (arg === '--list-releases') {
      opts.listReleases = true;
    } else if (arg === '--endpoint' && i + 1 < argv.length) {
      opts.endpoint = argv[++i];
    } else if (arg.startsWith('--endpoint=')) {
      opts.endpoint = arg.slice('--endpoint='.length);
    } else if (arg === '--token' && i + 1 < argv.length) {
      opts.token = argv[++i];
    } else if (arg.startsWith('--token=')) {
      opts.token = arg.slice('--token='.length);
    } else if (arg === '--proxy' && i + 1 < argv.length) {
      opts.proxy = argv[++i];
    } else if (arg.startsWith('--proxy=')) {
      opts.proxy = arg.slice('--proxy='.length);
    } else if (arg === '--version' && i + 1 < argv.length) {
      opts.version = argv[++i];
    } else if (arg.startsWith('--version=')) {
      opts.version = arg.slice('--version='.length);
    } else if (arg === '--note' && i + 1 < argv.length) {
      opts.note = argv[++i];
    } else if (arg.startsWith('--note=')) {
      opts.note = arg.slice('--note='.length);
    } else if (arg === '--file' && i + 1 < argv.length) {
      opts.files.push(argv[++i]);
    } else if (arg.startsWith('--file=')) {
      opts.files.push(arg.slice('--file='.length));
    } else if (arg === '--rollback') {
      const next = argv[i + 1];
      if (next && !next.startsWith('-')) {
        opts.rollbackTarget = next;
        i += 1;
      } else {
        opts.rollbackTarget = 'bundled';
      }
    } else if (arg.startsWith('--rollback=')) {
      opts.rollbackTarget = arg.slice('--rollback='.length) || 'bundled';
    } else if (!arg.startsWith('-')) {
      opts.files.push(arg);
    } else {
      throw new Error(`未知命令行参数: ${arg}`);
    }
  }

  if (!opts.token) {
    opts.token = tryLoadTokenFromDevVars();
  }
  return opts;
}

function tryLoadTokenFromDevVars() {
  const devVarsPath = path.join(PROJECT_ROOT, '.dev.vars');
  if (!fs.existsSync(devVarsPath)) return '';
  try {
    const content = fs.readFileSync(devVarsPath, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx <= 0) continue;
      const k = line.slice(0, eqIdx).trim();
      let v = line.slice(eqIdx + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (k === 'OPS_ADMIN_TOKEN' && v) {
        return v;
      }
    }
  } catch {
    // 忽略读取失败
  }
  return '';
}

function normalizeRemoteKey(rawKey) {
  return rawKey
    .replace(/\\/g, '/')
    .trim()
    .replace(/^\/+/, '')
    .replace(/^public\/sim-data\/+/i, '')
    .replace(/^sim-data\/+/i, '')
    .replace(/^api\/specs\/+/i, '');
}

function inferRemoteKey(localAbsPath) {
  const relToSimData = path.relative(SIM_DATA_DIR, localAbsPath);
  if (!relToSimData.startsWith('..') && !path.isAbsolute(relToSimData)) {
    return normalizeRemoteKey(relToSimData);
  }
  const base = path.basename(localAbsPath);
  if (base === 'sun_team_344_spec.json') return 'specs/sun_team_344_spec.json';
  if (base === 'universal_catalog_runtime.json') {
    return 'specs/universal_catalog_runtime.json';
  }
  if (base === 'catalog_index.json') return 'specs/catalog_index.json';
  if (base === 'sun344_overview.json') return 'benchmarks/sun344_overview.json';
  if (base === 'manifest.json') return 'manifest.json';

  const normalizedFull = localAbsPath.replace(/\\/g, '/');
  if (normalizedFull.includes('/wt_uni344/')) {
    return `presets/uni344/${base}`;
  }
  return `presets/sun344/${base}`;
}

/**
 * 针对不同目标路径执行严格的 JSON Schema 结构校验，拦截坏包上线
 */
function validateSpecSchema(remoteKey, data) {
  if (data === null || typeof data !== 'object') {
    throw new Error(`[${remoteKey}] 根节点必须为 JSON Object 或 Array`);
  }

  if (remoteKey === 'specs/sun_team_344_spec.json') {
    for (const reqKey of ['version', 'default_squad', 'bosses', 'actions']) {
      if (!(reqKey in data)) {
        throw new Error(`[${remoteKey}] 缺少挽昼专核倍率必需字段 "${reqKey}"`);
      }
    }
    if (!Array.isArray(data.bosses) || data.bosses.length === 0) {
      throw new Error(`[${remoteKey}] bosses 必须为非空数组`);
    }
    return `sun344倍率表 (version=${data.version}, bosses=${data.bosses.length}, actions=${Object.keys(data.actions).length})`;
  }

  if (remoteKey === 'specs/universal_catalog_runtime.json') {
    for (const reqKey of ['metadata', 'agents', 'w_engines', 'drive_discs', 'bangboos', 'bosses']) {
      if (!(reqKey in data)) {
        throw new Error(`[${remoteKey}] 缺少通用全角色目录必需字段 "${reqKey}"`);
      }
    }
    const agentCount = Object.keys(data.agents || {}).length;
    const weaponCount = Object.keys(data.w_engines || {}).length;
    if (agentCount === 0 || weaponCount === 0) {
      throw new Error(`[${remoteKey}] agents 或 w_engines 为空`);
    }
    return `uni344全量目录 (agents=${agentCount}, wEngines=${weaponCount}, bosses=${Object.keys(data.bosses || {}).length})`;
  }

  if (remoteKey === 'specs/catalog_index.json') {
    for (const reqKey of ['version', 'agents', 'wEngines', 'driveDiscs', 'bangboos', 'bosses']) {
      if (!(reqKey in data)) {
        throw new Error(`[${remoteKey}] 缺少轻量下拉索引字段 "${reqKey}"`);
      }
    }
    return `轻量下拉索引 (agents=${data.agents.length}, wEngines=${data.wEngines.length}, discs=${data.driveDiscs.length})`;
  }

  if (remoteKey === 'benchmarks/sun344_overview.json') {
    for (const reqKey of ['version', 'benchmarks', 'costLadder', 'mindscapeLadder', 'optimalityProof']) {
      if (!(reqKey in data)) {
        throw new Error(`[${remoteKey}] 缺少挽昼总览必需模块 "${reqKey}"`);
      }
    }
    return `挽昼基准总览 (benchmarks=${data.benchmarks.length}, champions=${data.costLadder?.championsByGold?.length ?? 0})`;
  }

  if (remoteKey === 'manifest.json') {
    if (!data.version || !Array.isArray(data.presets)) {
      throw new Error(`[${remoteKey}] manifest.json 必须包含 version 与 presets 数组`);
    }
    return `总索引清单 (version=${data.version}, presets=${data.presets.length})`;
  }

  if (remoteKey.startsWith('presets/')) {
    if (!remoteKey.endsWith('_spec.json')) {
      if (!Array.isArray(data.rows) || !Array.isArray(data.macros)) {
        throw new Error(`[${remoteKey}] 预设排轴 JSON 必须包含 rows 与 macros 数组`);
      }
      if (typeof data.total_dmg !== 'number' || !Number.isFinite(data.total_dmg)) {
        throw new Error(`[${remoteKey}] 预设排轴 total_dmg 必须为有限数值`);
      }
      return `排轴轨迹 (rows=${data.rows.length}, macros=${data.macros.length}, totalDmg=${Math.round(data.total_dmg).toLocaleString('en-US')})`;
    }
    return `伴随编队规格 (${data.team_id || 'spec'})`;
  }

  if (!remoteKey.endsWith('.json')) {
    throw new Error(`[${remoteKey}] 仅允许发布 .json 后缀的数据文件`);
  }
  return `通用 JSON 对象 (keys=${Object.keys(data).length})`;
}

function loadAndValidateFiles(fileSpecs, isDryRun) {
  let specsToLoad = [...fileSpecs];
  if (specsToLoad.length === 0 && isDryRun) {
    // 默认干跑自检模式：自动验证 public/sim-data 核心构建产物
    const defaults = [
      'manifest.json',
      'specs/sun_team_344_spec.json',
      'specs/catalog_index.json',
      'specs/universal_catalog_runtime.json',
      'benchmarks/sun344_overview.json',
    ];
    for (const rel of defaults) {
      const candidate = path.join(SIM_DATA_DIR, rel);
      if (fs.existsSync(candidate)) {
        specsToLoad.push(`${candidate}=${rel}`);
      }
    }
  }

  if (specsToLoad.length === 0) {
    throw new Error(
      '未指定任何待校验/发布的 JSON 文件（请通过 --file <path> 指定，或先生成 public/sim-data 数据包）',
    );
  }

  const filesMap = {};
  const reportRows = [];
  let inferredVersion = '';

  for (const spec of specsToLoad) {
    let localPart = spec;
    let remotePart = '';
    const eqIdx = spec.indexOf('=');
    if (eqIdx > 0) {
      localPart = spec.slice(0, eqIdx).trim();
      remotePart = spec.slice(eqIdx + 1).trim();
    }
    const absPath = path.resolve(process.cwd(), localPart);
    if (!fs.existsSync(absPath)) {
      throw new Error(`找不到本地文件: ${absPath}`);
    }
    const stat = fs.statSync(absPath);
    if (!stat.isFile()) {
      throw new Error(`路径不是普通文件: ${absPath}`);
    }
    if (stat.size > MAX_SINGLE_FILE_BYTES) {
      throw new Error(
        `文件体积超限 (${(stat.size / 1024 / 1024).toFixed(2)} MB > 24 MB): ${absPath}`,
      );
    }

    const rawText = fs.readFileSync(absPath, 'utf8').replace(/^\uFEFF/, '');
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      throw new Error(`JSON 语法解析失败 [${absPath}]: ${err.message}`);
    }

    const remoteKey = remotePart
      ? normalizeRemoteKey(remotePart)
      : inferRemoteKey(absPath);
    const summary = validateSpecSchema(remoteKey, parsed);
    const compactBytes = Buffer.byteLength(JSON.stringify(parsed), 'utf8');

    if (!inferredVersion && typeof parsed?.version === 'string') {
      inferredVersion = parsed.version;
    } else if (!inferredVersion && typeof parsed?.metadata?.version === 'string') {
      inferredVersion = parsed.metadata.version;
    }

    filesMap[remoteKey] = parsed;
    reportRows.push({
      remoteKey,
      absPath,
      rawBytes: stat.size,
      compactBytes,
      summary,
    });
  }

  return { filesMap, reportRows, inferredVersion };
}

/**
 * 零外部依赖 HTTP/HTTPS 请求器（原生支持 HTTP CONNECT 隧道代理，解决 Node 内置 fetch 忽略 HTTPS_PROXY 问题）
 */
function requestJsonWithProxy(targetUrlStr, { method = 'GET', headers = {}, bodyObj, proxyUrl = '' }) {
  const targetUrl = new URL(targetUrlStr);
  const bodyBuf =
    bodyObj !== undefined ? Buffer.from(JSON.stringify(bodyObj), 'utf8') : null;

  const reqHeaders = {
    Accept: 'application/json',
    'User-Agent': 'zzcal-ops-cli/3.4.5',
    ...headers,
  };
  if (bodyBuf) {
    reqHeaders['Content-Type'] = 'application/json';
    reqHeaders['Content-Length'] = String(bodyBuf.length);
  }

  const isLocalTarget =
    targetUrl.hostname === 'localhost' ||
    targetUrl.hostname === '127.0.0.1' ||
    targetUrl.hostname === '::1';

  const effectiveProxy = !isLocalTarget && proxyUrl ? new URL(proxyUrl) : null;

  return new Promise((resolve, reject) => {
    const collectResponse = (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let json = null;
        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          json = { rawText: text };
        }
        resolve({
          status: res.statusCode || 0,
          headers: res.headers,
          text,
          json,
        });
      });
    };

    if (!effectiveProxy) {
      const transport = targetUrl.protocol === 'https:' ? https : http;
      const req = transport.request(
        {
          protocol: targetUrl.protocol,
          hostname: targetUrl.hostname,
          port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
          path: `${targetUrl.pathname}${targetUrl.search}`,
          method,
          headers: reqHeaders,
          timeout: 30000,
        },
        collectResponse,
      );
      req.on('timeout', () => req.destroy(new Error('请求超时 (30s)')));
      req.on('error', reject);
      if (bodyBuf) req.write(bodyBuf);
      req.end();
      return;
    }

    if (targetUrl.protocol === 'http:') {
      // HTTP 目标走普通正向代理请求
      const req = http.request(
        {
          hostname: effectiveProxy.hostname,
          port: Number(effectiveProxy.port) || 7897,
          path: targetUrl.toString(),
          method,
          headers: {
            ...reqHeaders,
            Host: targetUrl.host,
          },
          timeout: 30000,
        },
        collectResponse,
      );
      req.on('timeout', () => req.destroy(new Error('代理请求超时 (30s)')));
      req.on('error', reject);
      if (bodyBuf) req.write(bodyBuf);
      req.end();
      return;
    }

    // HTTPS 目标通过 HTTP CONNECT 建立 TLS 隧道（适配 Clash 127.0.0.1:7897）
    const targetPort = Number(targetUrl.port) || 443;
    const proxyAuth =
      effectiveProxy.username || effectiveProxy.password
        ? `Basic ${Buffer.from(
            `${decodeURIComponent(effectiveProxy.username)}:${decodeURIComponent(effectiveProxy.password)}`,
          ).toString('base64')}`
        : '';

    const connectHeaders = {
      Host: `${targetUrl.hostname}:${targetPort}`,
    };
    if (proxyAuth) {
      connectHeaders['Proxy-Authorization'] = proxyAuth;
    }

    const connectReq = http.request({
      hostname: effectiveProxy.hostname,
      port: Number(effectiveProxy.port) || 7897,
      method: 'CONNECT',
      path: `${targetUrl.hostname}:${targetPort}`,
      headers: connectHeaders,
      timeout: 15000,
    });

    connectReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        reject(
          new Error(
            `代理 CONNECT 握手失败 (${effectiveProxy.host} -> HTTP ${res.statusCode})`,
          ),
        );
        return;
      }
      const tlsSocket = tls.connect({
        socket,
        servername: targetUrl.hostname,
      });
      const httpsAgent = new https.Agent({ keepAlive: false });
      httpsAgent.createConnection = () => tlsSocket;

      const req = https.request(
        {
          hostname: targetUrl.hostname,
          port: targetPort,
          path: `${targetUrl.pathname}${targetUrl.search}`,
          method,
          headers: reqHeaders,
          agent: httpsAgent,
          timeout: 30000,
        },
        collectResponse,
      );
      req.on('timeout', () => req.destroy(new Error('HTTPS 隧道传输超时 (30s)')));
      req.on('error', reject);
      if (bodyBuf) req.write(bodyBuf);
      req.end();
    });

    connectReq.on('timeout', () =>
      connectReq.destroy(new Error(`连接本地代理超时 (${effectiveProxy.host})`)),
    );
    connectReq.on('error', reject);
    connectReq.end();
  });
}

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  if (opts.help) {
    printHelp();
    return;
  }

  const baseEndpoint = opts.endpoint.replace(/\/+$/, '');
  const activeProxy = opts.noProxy ? '' : opts.proxy;

  if (opts.listReleases) {
    if (!opts.token) {
      throw new Error('查询版本列表需要提供 --token 或设置环境变量 OPS_ADMIN_TOKEN');
    }
    const url = `${baseEndpoint}/api/ops/releases`;
    console.log(`[ops] GET ${url}${activeProxy ? ` (via proxy ${activeProxy})` : ''}`);
    const res = await requestJsonWithProxy(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${opts.token}` },
      proxyUrl: activeProxy,
    });
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`查询失败 (HTTP ${res.status}): ${res.text}`);
    }
    console.log(JSON.stringify(res.json, null, 2));
    return;
  }

  if (opts.rollbackTarget !== null) {
    if (opts.dryRun) {
      console.log(
        `[dry-run] 回滚请求预演通过 -> POST ${baseEndpoint}/api/ops/rollback`,
      );
      console.log(
        JSON.stringify(
          { releaseId: opts.rollbackTarget, release_id: opts.rollbackTarget },
          null,
          2,
        ),
      );
      return;
    }
    if (!opts.token) {
      throw new Error('执行线上回滚需要提供 --token 或设置环境变量 OPS_ADMIN_TOKEN');
    }
    const url = `${baseEndpoint}/api/ops/rollback`;
    console.log(
      `[ops] 正在执行回滚 -> target="${opts.rollbackTarget}" (${url})${activeProxy ? ` [proxy: ${activeProxy}]` : ''}`,
    );
    const res = await requestJsonWithProxy(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${opts.token}` },
      bodyObj: {
        releaseId: opts.rollbackTarget,
        release_id: opts.rollbackTarget,
      },
      proxyUrl: activeProxy,
    });
    if (res.status < 200 || res.status >= 300) {
      throw new Error(`回滚失败 (HTTP ${res.status}): ${res.text}`);
    }
    console.log('[ops] 回滚成功:', JSON.stringify(res.json, null, 2));
    return;
  }

  // 校验并打包待发布 JSON
  const { filesMap, reportRows, inferredVersion } = loadAndValidateFiles(
    opts.files,
    opts.dryRun,
  );
  const finalVersion =
    opts.version || inferredVersion || `3.4.5_hotfix_${new Date().toISOString().slice(0, 10)}`;

  let totalCompactBytes = 0;
  console.log(`\n[ops] 数据包校验通过 (version="${finalVersion}", 共 ${reportRows.length} 个文件):`);
  for (const row of reportRows) {
    totalCompactBytes += row.compactBytes;
    const kb = (row.compactBytes / 1024).toFixed(1);
    console.log(`  ✔ ${row.remoteKey.padEnd(38)} | ${kb.padStart(8)} KB | ${row.summary}`);
  }
  console.log(`  合计紧凑 JSON 载荷: ${(totalCompactBytes / 1024).toFixed(1)} KB`);

  if (opts.dryRun) {
    console.log(
      `\n[dry-run] 全部 Schema 与体积校验 100% 通过！未向线上 (${baseEndpoint}) 发送写请求。`,
    );
    return;
  }

  if (!opts.token) {
    throw new Error('推送线上热更新需要提供 --token 或设置环境变量 OPS_ADMIN_TOKEN');
  }

  const url = `${baseEndpoint}/api/ops/specs`;
  console.log(
    `\n[ops] 正在推送热更新 -> POST ${url}${activeProxy ? ` (via proxy ${activeProxy})` : ''}`,
  );
  const res = await requestJsonWithProxy(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${opts.token}` },
    bodyObj: {
      version: finalVersion,
      note: opts.note || `CLI publish (${reportRows.length} files)`,
      activate: opts.activate,
      files: filesMap,
    },
    proxyUrl: activeProxy,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`热更新发布失败 (HTTP ${res.status}): ${res.text}`);
  }
  console.log('[ops] 热更新发布成功:', JSON.stringify(res.json, null, 2));
}

main().catch((err) => {
  console.error(`[ops:error] ${err?.message || err}`);
  process.exitCode = 1;
});
