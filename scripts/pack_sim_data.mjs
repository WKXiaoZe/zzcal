#!/usr/bin/env node
/**
 * ZZZ 3.4.5_r20699967 实战排轴静态数据包全自动构建器 (pack_sim_data.mjs)
 *
 * 只读读取 `d:\zzz-sim` 下的规格与收敛排轴产物，全量生成：
 *   - `public/sim-data/specs/sun_team_344_spec.json`
 *   - `public/sim-data/specs/universal_catalog_runtime.json`
 *   - `public/sim-data/specs/catalog_index.json`
 *   - `public/sim-data/presets/sun344/*.json`
 *   - `public/sim-data/presets/uni344/*.json`
 *   - `public/sim-data/benchmarks/sun344_overview.json`
 *   - `public/sim-data/manifest.json`
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SIM_DATA_DIR = path.join(PROJECT_ROOT, 'public', 'sim-data');

const ZZZ_SIM_ROOT = 'd:\\zzz-sim';
const SUN_SPEC_SRC = path.join(ZZZ_SIM_ROOT, 'data', 'sun_team_344_spec.json');
const UNI_CAT_SRC = path.join(
  ZZZ_SIM_ROOT,
  'wt_uni344',
  'data',
  'uni_specs',
  'universal_catalog_runtime.json',
);
const SUN_OUT_DIR = path.join(ZZZ_SIM_ROOT, 'out');
const SUN_PRESETS_SRC_DIR = path.join(SUN_OUT_DIR, 'presets');
const UNI_OUT_DIR = path.join(ZZZ_SIM_ROOT, 'wt_uni344', 'out');
const SUN_EXE = path.join(
  ZZZ_SIM_ROOT,
  'rust',
  'zzz-sun344',
  'target',
  'release',
  'zzz-sun344.exe',
);

const TARGET_VERSION = '3.4.5_r20699967';
const checkOnly = process.argv.includes('--check-only');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, obj, pretty = false) {
  if (checkOnly) return;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, pretty ? `${JSON.stringify(obj, null, 2)}\n` : JSON.stringify(obj), 'utf8');
}

function cleanTestTag(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/\(Test\d*\)/gi, '').trim();
}

function code6FromBuild(b) {
  if (!b) return '010101';
  return `${b.sun_m ?? 0}${b.sun_w ?? 1}${b.roxy_m ?? 0}${b.roxy_w ?? 1}${b.robin_m ?? 0}${b.robin_w ?? 1}`;
}

/**
 * 限定金口径（知更鸟送本体 M0 = 0金，专武不赠送 R1..R5 = 1..5金）：
 * 挽昼(1 + sun_m + sun_w) + 洛克茜(1 + roxy_m + roxy_w) + 知更鸟(0 + robin_m + robin_w)
 */
function calcSunLimitedGold(b) {
  if (!b) return 5;
  return (
    2 +
    (b.sun_m ?? 0) +
    (b.sun_w ?? 1) +
    (b.roxy_m ?? 0) +
    (b.roxy_w ?? 1) +
    (b.robin_m ?? 0) +
    (b.robin_w ?? 1)
  );
}

function countSunUlts(data) {
  if (Array.isArray(data.macros) && data.macros.length > 0) {
    const mc = data.macros.filter((m) =>
      typeof m === 'string' ? m === 'SunUlt1' : Boolean(m && typeof m === 'object' && m.SunUlt1),
    ).length;
    if (mc > 0) return mc;
  }
  if (Array.isArray(data.rows)) {
    let rc = 0;
    for (const r of data.rows) {
      if (
        r.sid === 1601111 ||
        (typeof r.action_key === 'string' &&
          r.action_key.includes('挽昼') &&
          r.action_key.includes('终结技') &&
          !r.action_key.includes('终结技2') &&
          !r.action_key.includes('重塑万象') &&
          !r.action_key.includes('二段'))
      ) {
        rc += 1;
      }
    }
    return rc;
  }
  return data.ult_count ?? 0;
}

function countUniUlts(data) {
  if (Array.isArray(data.macros) && data.macros.length > 0) {
    const mc = data.macros.filter(
      (m) => typeof m === 'string' && /^S0:.*Ult/i.test(m) && !/Ult2|Detonate/i.test(m),
    ).length;
    if (mc > 0) return mc;
  }
  if (Array.isArray(data.rows)) {
    let rc = 0;
    for (const r of data.rows) {
      if (
        r.actor_slot === 0 &&
        (r.cat === '终结技' || /\bUlt1?\b/i.test(r.action_key || '')) &&
        !/Ult2|重塑万象/i.test(r.action_key || '')
      ) {
        rc += 1;
      }
    }
    return rc;
  }
  return data.ult_count ?? 0;
}

function fmtYi(dmg) {
  return `${(Number(dmg || 0) / 1e8).toFixed(3)}亿`;
}

function buildCatalogIndex(uc, versionStr) {
  const agents = Object.values(uc.agents || {})
    .map((a) => ({
      id: a.agent_id,
      key: a.key,
      resourceCode: a.resource_code,
      nameCn: cleanTestTag(a.name_cn),
      nameCnFull: cleanTestTag(a.name_cn_full || a.name_cn),
      nameEn: a.name_en,
      rarity: a.rarity,
      elementId: a.element_id,
      elementCn: a.element_cn,
      subElementCn: a.sub_element_cn ?? a.element_cn,
      specialtyId: a.specialty_id,
      specialtyCn: a.specialty_cn,
      campId: a.camp_id,
      campCn: a.camp_cn,
      signatureWEngineId: a.signature_w_engine_id ?? null,
      defaultWEngineId: a.default_build?.w_engine_id ?? a.signature_w_engine_id ?? null,
      capabilityTags: a.capability_tags || [],
      defaultDisc4Id: a.default_build?.disc_4pc_id ?? null,
      defaultDisc2Id: a.default_build?.disc_2pc_id ?? null,
    }))
    .sort((x, y) => x.id - y.id);

  const wEngines = Object.values(uc.w_engines || {})
    .map((w) => ({
      id: w.weapon_id,
      nameCn:
        w.weapon_id === 14166 && (!w.name_cn || w.name_cn.includes('测试') || w.name_cn === '知更鸟专属音擎')
          ? '星韵流彩'
          : w.weapon_id === 14165 && (!w.name_cn || w.name_cn.includes('测试'))
            ? '蛛蜕遗歌'
            : cleanTestTag(w.name_cn),
      nameEn: w.name_en,
      rarity: w.rarity,
      specialtyId: w.specialty_id,
      specialtyCn: w.specialty_cn,
      signatureAgentId: w.signature_agent_id ?? null,
      passiveTitleCn: cleanTestTag(w.passive_title_cn || ''),
      baseAtkLv60: w.lv60_star5_stats?.main_stat?.lv60_star5 ?? 0,
      subStatNameCn: w.lv60_star5_stats?.sub_stat?.name_cn || '',
      subStatValue: w.lv60_star5_stats?.sub_stat?.lv60_star5_raw ?? 0,
    }))
    .sort((x, y) => x.id - y.id);

  const suitsObj = uc.drive_discs?.suits || uc.drive_discs || {};
  const driveDiscs = Object.values(suitsObj)
    .filter((d) => d && typeof d === 'object' && typeof d.suit_id === 'number')
    .map((d) => ({
      id: d.suit_id,
      nameCn: cleanTestTag(d.name_cn),
      nameEn: d.name_en || '',
      desc2pcCn: d.desc_2pc_cn || '',
      desc4pcCn: d.desc_4pc_cn || '',
    }))
    .sort((x, y) => x.id - y.id);

  const bangboos = Object.values(uc.bangboos || {})
    .map((b) => ({
      id: b.bangboo_id,
      key: b.resource_key,
      nameCn: cleanTestTag(b.name_cn),
      nameEn: b.name_en || '',
      rarity: b.rarity,
    }))
    .sort((x, y) => x.id - y.id);

  const bosses = Object.values(uc.bosses || {})
    .map((m) => {
      const enc = m.latest_encounter || {};
      return {
        id: m.monster_id,
        code: m.code,
        nameCn: cleanTestTag(m.name_cn),
        nameEn: m.name_en || '',
        tags: m.tags || [],
        baseDefLv70: m.base_def_lv70_float ?? m.base_def_lv70 ?? 952.8,
        stunMaxLv70: m.stun_max_lv70 ?? 15000,
        stunDurationS: m.stun_duration_s ?? 12,
        nativeStunVulnMult: m.native_stun_dmg_vuln_mult ?? 1.5,
        elementalResPct: m.elemental_damage_res_pct || {},
        category: enc.category || 'da_boss',
        configComment: enc.config_comment || '',
        barCount: enc.bar_count ?? 30,
        exactTotalHpLv70: enc.exact_total_hp_lv70 ?? 100000000,
        weakElements: enc.weak_elements || [],
        resistElements: enc.resist_elements || [],
        fixedStageBuffIds: enc.fixed_stage_buff_ids || [],
        optionalWeatherBuffIds: enc.optional_weather_buff_ids || [],
      };
    })
    .sort((x, y) => x.id - y.id);

  const weatherBuffs = Object.values(uc.stage_weather_buffs || {})
    .map((wb) => ({
      id: wb.buff_id,
      abilityKey: wb.ability_key || '',
      titleCn: wb.title_cn || '',
      titleEn: wb.title_en || '',
      descCn: wb.desc_cn || '',
    }))
    .sort((x, y) => y.id - x.id);

  const fixedStageBuffs = Object.values(uc.fixed_stage_buffs || {})
    .map((fb) => ({
      id: fb.buff_id,
      abilityKey: fb.ability_key || '',
      titleCn: fb.title_cn || '',
      titleEn: fb.title_en || '',
      descCn: fb.desc_cn || '',
    }))
    .sort((x, y) => y.id - x.id);

  return {
    version: versionStr,
    counts: {
      agents: agents.length,
      wEngines: wEngines.length,
      driveDiscs: driveDiscs.length,
      bangboos: bangboos.length,
      bosses: bosses.length,
      weatherBuffs: weatherBuffs.length,
      fixedStageBuffs: fixedStageBuffs.length,
    },
    agents,
    wEngines,
    driveDiscs,
    bangboos,
    bosses,
    weatherBuffs,
    fixedStageBuffs,
  };
}

function normalizeProofScenario(sc) {
  const mk = sc.min_kill_time_proof_29bars || sc.minKillTimeProof29Bars;
  const kStar =
    sc.optimal_stun_count_k_star ??
    sc.optimal_stun_count_K_star ??
    sc.optimalStunCountKStar ??
    4;
  return {
    scenarioId: sc.scenario_id || sc.scenarioId,
    title: sc.title,
    build: sc.build,
    lbStarFile: sc.lb_star_file || sc.lbStarFile || '',
    presetId: sc.preset_id || sc.presetId,
    lbStar: sc.lb_star ?? sc.lbStar,
    ubStar: sc.ub_star ?? sc.ubStar,
    optimalStunCountKStar: kStar,
    ultCount: sc.ult_count ?? sc.ultCount ?? 4,
    rhythmTag: sc.rhythm_tag || sc.rhythmTag || `${kStar}失衡4大`,
    absoluteGapDmg: sc.absolute_gap_dmg ?? sc.absoluteGapDmg ?? 0,
    relativeGapPct: sc.relative_gap_pct ?? sc.relativeGapPct ?? 0,
    achievedEfficiencyPct: sc.achieved_efficiency_pct ?? sc.achievedEfficiencyPct ?? 0,
    k5StrictlyDominatedByK4: Boolean(
      sc.k5_strictly_dominated_by_k4 ??
        sc.K5_strictly_dominated_by_K4 ??
        sc.k5StrictlyDominatedByK4 ??
        true,
    ),
    k6StrictlyDominatedByK4: Boolean(
      sc.k6_strictly_dominated_by_k4 ??
        sc.K6_strictly_dominated_by_K4 ??
        sc.k6StrictlyDominatedByK4 ??
        true,
    ),
    ubByStunCount: (sc.ub_by_stun_count || sc.ubByStunCount || []).map((u) => ({
      K: u.K,
      feasible: Boolean(u.feasible),
      dualUb: u.dual_ub ?? u.dualUb ?? 0,
      solveMs: u.solve_ms ?? u.solveMs,
    })),
    ...(mk
      ? {
          minKillTimeProof29Bars: {
            targetHp29Bars: mk.target_hp_29bars ?? mk.targetHp29Bars,
            certifiedNoKillHorizonF:
              mk.certified_no_kill_horizon_f ?? mk.certifiedNoKillHorizonF,
            certifiedNoKillUb: mk.certified_no_kill_ub ?? mk.certifiedNoKillUb,
            fMinLb: mk.f_min_lb ?? mk.fMinLb,
            tMinLbS: mk.t_min_lb_s ?? mk.tMinLbS,
            simKillF: mk.sim_kill_f ?? mk.simKillF,
            simKillS: mk.sim_kill_s ?? mk.simKillS,
            timeGapS: mk.time_gap_s ?? mk.timeGapS,
            timeGapRelPct: mk.time_gap_rel_pct ?? mk.timeGapRelPct,
          },
        }
      : {}),
  };
}

function ensureChampionRotationFile(champ, outDestPath) {
  const b = champ.build;
  const code6 = code6FromBuild(b);
  const gold = calcSunLimitedGold(b);
  // 1. Check if tmp_cap_<code6>.json or sun344_knot_<gold>gold_<code6>.json already exists in zzz-sim/out
  const candidates = [
    path.join(SUN_OUT_DIR, `sun344_knot_${gold}gold_${code6}.json`),
    path.join(SUN_PRESETS_SRC_DIR, `tmp_cap_${code6}.json`),
    code6 === '110111' ? path.join(SUN_OUT_DIR, 'sun344_knot_7gold_110111.json') : '',
    code6 === '010101' ? path.join(SUN_OUT_DIR, 'sun344_knot_5gold_01all.json') : '',
  ].filter(Boolean);

  for (const cand of candidates) {
    if (fs.existsSync(cand)) {
      const parsed = readJson(cand);
      // Make sure it matches the target version (not stale)
      if (!parsed.version || parsed.version === TARGET_VERSION || checkOnly) {
        return parsed;
      }
    }
  }

  // 2. If not pre-saved as full rotation file, invoke zzz-sun344.exe writing directly into outDestPath (inside zzcal!)
  if (!checkOnly && fs.existsSync(SUN_EXE)) {
    fs.mkdirSync(path.dirname(outDestPath), { recursive: true });
    console.log(
      `[pack] Generating full rotation JSON via zzz-sun344.exe -> ${path.basename(outDestPath)} (code6=${code6})`,
    );
    execFileSync(
      SUN_EXE,
      [
        '--spec',
        SUN_SPEC_SRC,
        '--boss-idx',
        '2',
        '--boss-mode',
        'nascent-knot',
        '--knot-env',
        '--stage-buff',
        String(champ.stage_buff_id ?? 69015201),
        '--sun-m',
        String(b.sun_m),
        '--sun-w',
        String(b.sun_w),
        '--roxy-m',
        String(b.roxy_m),
        '--roxy-w',
        String(b.roxy_w),
        '--robin-m',
        String(b.robin_m),
        '--robin-w',
        String(b.robin_w),
        '--effort',
        String(champ.effort ?? 1),
        '--output',
        outDestPath,
      ],
      { stdio: 'inherit' },
    );
    return readJson(outDestPath);
  }
  return null;
}

async function main() {
  const generatedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const sunSpec = readJson(SUN_SPEC_SRC);
  const uniCat = readJson(UNI_CAT_SRC);
  const specVersion = sunSpec.version || TARGET_VERSION;

  // Initialize zzz_sun344 & zzz_uni344 WASM to deterministically refresh all presets
  let sunWasm = null;
  const sunWasmJs = path.join(PROJECT_ROOT, 'public', 'wasm', 'zzz_sun344.js');
  const sunWasmBg = path.join(PROJECT_ROOT, 'public', 'wasm', 'zzz_sun344_bg.wasm');
  if (!checkOnly && fs.existsSync(sunWasmJs) && fs.existsSync(sunWasmBg)) {
    const smod = await import(pathToFileURL(sunWasmJs).href);
    await smod.default({ module_or_path: fs.readFileSync(sunWasmBg) });
    smod.sun344_cache_spec_json(JSON.stringify(sunSpec));
    sunWasm = smod;
  }

  let uniWasm = null;
  const uniWasmJs = path.join(PROJECT_ROOT, 'public', 'wasm', 'zzz_uni344.js');
  const uniWasmBg = path.join(PROJECT_ROOT, 'public', 'wasm', 'zzz_uni344_bg.wasm');
  if (!checkOnly && fs.existsSync(uniWasmJs) && fs.existsSync(uniWasmBg)) {
    const mod = await import(pathToFileURL(uniWasmJs).href);
    await mod.default({ module_or_path: fs.readFileSync(uniWasmBg) });
    mod.uni344_cache_catalog_json(JSON.stringify(uniCat));
    uniWasm = mod;
  }

  console.log(`[pack] Packing sim-data for version: ${specVersion}`);

  // 1. Write specs
  const catalogIndex = buildCatalogIndex(uniCat, specVersion);
  writeJson(path.join(SIM_DATA_DIR, 'specs', 'sun_team_344_spec.json'), sunSpec, false);
  writeJson(path.join(SIM_DATA_DIR, 'specs', 'universal_catalog_runtime.json'), uniCat, false);
  writeJson(path.join(SIM_DATA_DIR, 'specs', 'catalog_index.json'), catalogIndex, false);

  // 2. Load MILP optimality proof, cost ladder, mindscape ladder
  const rawProof = readJson(path.join(SUN_OUT_DIR, 'sun344_optimality_gap_proof.json'));
  const rawScenarioList = Array.isArray(rawProof.scenarios)
    ? rawProof.scenarios
    : rawProof.benchmarks && typeof rawProof.benchmarks === 'object'
      ? Object.values(rawProof.benchmarks)
      : [];
  const normScenarios = rawScenarioList.map(normalizeProofScenario);

  function findProofForPreset(presetId, build, bossName, bossMode, stageBuffId) {
    return (
      normScenarios.find((s) => s.presetId === presetId) ||
      normScenarios.find((s) => {
        if (!s.build || !build) return false;
        const sameBuild =
          s.build.sun_m === build.sun_m &&
          s.build.sun_w === build.sun_w &&
          s.build.roxy_m === build.roxy_m &&
          s.build.roxy_w === build.roxy_w &&
          s.build.robin_m === build.robin_m &&
          s.build.robin_w === build.robin_w;
        if (!sameBuild) return false;
        if (bossName?.includes('新生之结')) {
          if (stageBuffId === 69015205 && s.title.includes('69015205')) return true;
          if (stageBuffId !== 69015205 && !s.title.includes('69015205') && s.title.includes('新生之结')) {
            return true;
          }
          return false;
        }
        if (bossName?.includes('死路屠夫') && !bossName?.includes('危局')) {
          if (bossMode === 'CntlzywIntervals' && s.scenarioId.includes('cntlzyw')) return true;
          if (bossMode === 'Autonomous' && s.scenarioId.includes('autonomous')) return true;
        }
        return false;
      }) ||
      null
    );
  }

  const rawCostLadder = readJson(path.join(SUN_OUT_DIR, 'sun344_knot_cost_ladder.json'));
  const rawMindscape = readJson(path.join(SUN_OUT_DIR, 'sun344_mindscape_ladder.json'));

  // Clean old sun344 preset directory when writing
  const sunDestDir = path.join(SIM_DATA_DIR, 'presets', 'sun344');
  if (!checkOnly && fs.existsSync(sunDestDir)) {
    for (const f of fs.readdirSync(sunDestDir)) {
      if (f.endsWith('.json')) fs.unlinkSync(path.join(sunDestDir, f));
    }
  }

  const sunPresetsMap = new Map(); // id -> PresetIndexItem
  const tacticalAuditErrors = [];
  const tacticalAuditNotes = [];

  function auditSun344Trajectory(id, enriched, title, subtitle) {
    if (/MILP|上界认证|理论极限/i.test(`${title} ${subtitle}`)) {
      tacticalAuditErrors.push(`[${id}] 标题含禁用宣传词: "${title}"`);
    }
    if (/赠送0金|送0\+1|赠送0\+1/.test(`${title} ${subtitle} ${enriched.detail_label || ''}`)) {
      tacticalAuditErrors.push(`[${id}] 含过期知更鸟专武赠送描述: "${enriched.detail_label || title}"`);
    }
    if (enriched.build) {
      const expectedGold = calcSunLimitedGold(enriched.build);
      if (enriched.limited_gold !== expectedGold) {
        tacticalAuditErrors.push(
          `[${id}] limited_gold=${enriched.limited_gold} 与新口径期望值 ${expectedGold} 不一致`,
        );
      }
      const mGold = /(\d+)金/.exec(title);
      if (mGold && Number(mGold[1]) !== expectedGold) {
        tacticalAuditErrors.push(
          `[${id}] 标题金数 "${mGold[1]}金" 与新口径期望值 ${expectedGold}金 不一致: "${title}"`,
        );
      }
    }
    const rows = (enriched.rows || []).filter((r) => (r.delta_f ?? 0) > 0);
    // 1. Check premature Ult1+Ult2 while holding unspent [链齿] from 1601015 inside same stun
    let stunWindowCount = 0;
    let stunRows = [];
    const flushStun = () => {
      if (stunRows.length === 0) return;
      stunWindowCount += 1;
      const stunStart = stunRows[0].t_start ?? 0;
      const lastStunRow = stunRows[stunRows.length - 1];
      const clippedStunEnd =
        typeof lastStunRow.stun_end_s === 'number'
          ? Math.min(lastStunRow.t_end ?? stunStart, lastStunRow.stun_end_s)
          : (lastStunRow.t_end ?? stunStart);
      const stunDur = clippedStunEnd - stunStart;
      const maxAllowedStunS = enriched.boss_name?.includes('特里薇娅') ? 22.4 : 19.4;
      if (stunDur > maxAllowedStunS) {
        tacticalAuditErrors.push(
          `[${id}] 失衡窗时长超界 (${stunStart.toFixed(2)}s..${clippedStunEnd.toFixed(2)}s = ${stunDur.toFixed(2)}s > ${maxAllowedStunS}s)`,
        );
      }
      for (const sr of stunRows) {
        if (
          sr.sid === 1601011 &&
          typeof sr.stun_end_s === 'number' &&
          sr.stun_end_s - sr.t_start < 0.99
        ) {
          tacticalAuditErrors.push(
            `[${id}] 终结技2(1601011)失衡剩余不足 f60 (t=${sr.t_start.toFixed(2)}s, stun_end_s=${sr.stun_end_s.toFixed(2)}s)`,
          );
        }
      }
      const sids = stunRows.map((r) => r.sid);
      for (let i = 0; i < sids.length - 1; i += 1) {
        if (sids[i] === 1601015) {
          const u1 = sids.indexOf(1601111, i + 1);
          const u2 = sids.indexOf(1601011, i + 1);
          if (u1 !== -1 && u2 !== -1) {
            const ctBefore = sids.slice(i + 1, u2).includes(1601107);
            const ctAfter = sids.slice(u2 + 1).includes(1601107);
            if (!ctBefore && ctAfter) {
              const remBattleS = 180.0 - (stunRows[i].t_end ?? stunRows[i].t_start);
              const lastEndS = stunRows[stunRows.length - 1].t_end ?? 0;
              if (remBattleS < 9.5 && lastEndS >= 179.9) {
                tacticalAuditNotes.push(
                  `[${id}] t=${stunRows[i].t_start.toFixed(2)}s 180s终局剩余${remBattleS.toFixed(2)}s不足完整链齿+双Q，优先压哨兑现双Q后补尾刀`,
                );
              } else {
                tacticalAuditErrors.push(
                  `[${id}] 失衡初段未耗[链齿]抢开双Q (t=${stunRows[i].t_start.toFixed(2)}s): ${sids.join('->')}`,
                );
              }
              break;
            }
          }
        }
      }
      stunRows = [];
    };
    for (const r of rows) {
      if (r.stun_str === '★失衡') {
        stunRows.push(r);
      } else {
        flushStun();
      }
    }
    flushStun();
    if (typeof enriched.stun_count === 'number' && stunWindowCount !== enriched.stun_count) {
      tacticalAuditErrors.push(
        `[${id}] 渲染失衡窗口段数 (${stunWindowCount}) 与 stun_count (${enriched.stun_count}) 不一致`,
      );
    }

    // 2. Check post-stun Ult2 (1601011) cliff drops
    for (let i = 1; i < rows.length; i += 1) {
      const prev = rows[i - 1];
      const cur = rows[i];
      if (prev.stun_str === '★失衡' && cur.stun_str !== '★失衡' && cur.sid === 1601011) {
        if (prev.sid !== 1601111) {
          tacticalAuditErrors.push(
            `[${id}] 失衡尾帧持有[愿核]却先打 ${prev.sid} 导致终结技2(1601011)掉出失衡 (t=${cur.t_start.toFixed(2)}s)`,
          );
        } else {
          // Check if Roxy spun tornado (1621008) earlier inside this same stun window
          let j = i - 1;
          let roxySpunInStun = false;
          while (j >= 0 && rows[j].stun_str === '★失衡') {
            if (rows[j].sid === 1621008) roxySpunInStun = true;
            j -= 1;
          }
          if (roxySpunInStun) {
            tacticalAuditErrors.push(
              `[${id}] 失衡内洛克茜自旋挤占窗口导致终结技2(1601011)掉出失衡 (t=${cur.t_start.toFixed(2)}s)`,
            );
          } else {
            tacticalAuditNotes.push(
              `[${id}] t=${cur.t_start.toFixed(2)}s 终结技1压哨收尾后终结技2顺延出失衡 (喧响硬边界)`,
            );
          }
        }
      }
    }
  }

  function registerSunPreset({
    id,
    category,
    rawObj,
    titleFn,
    uncappedOverride,
  }) {
    if (!rawObj) return null;
    const b = rawObj.build || {
      sun_m: rawObj.sun_m ?? 0,
      sun_w: 1,
      roxy_m: rawObj.roxy_m ?? 0,
      roxy_w: 1,
      robin_m: rawObj.robin_m ?? 0,
      robin_w: 1,
    };
    const code6 = code6FromBuild(b);
    const uncappedHp =
      uncappedOverride !== undefined ? Boolean(uncappedOverride) : Boolean(rawObj.uncapped_hp);
    const bossMode =
      rawObj.boss_mode ||
      (rawObj.boss_name?.includes('新生之结') ? 'NascentKnotDA52' : 'Autonomous');
    const stageBuffId = rawObj.stage_buff_id ?? (bossMode === 'NascentKnotDA52' ? 69015201 : 0);

    let replayedObj = rawObj;
    if (sunWasm && Array.isArray(rawObj.macros) && rawObj.macros.length > 0) {
      const lookupBossName = rawObj.boss_name?.includes('新生之结')
        ? '新生之结'
        : rawObj.boss_name || '';
      try {
        const rep = JSON.parse(
          sunWasm.sun344_replay_json(
            JSON.stringify({
              macros: rawObj.macros,
              sunM: b.sun_m,
              sunW: b.sun_w,
              roxyM: b.roxy_m,
              roxyW: b.roxy_w,
              robinM: b.robin_m,
              robinW: b.robin_w,
              bossMode,
              bossName: lookupBossName,
              stageBuffId,
              uncappedHp,
            }),
          ),
        );
        replayedObj = {
          ...rawObj,
          ...rep,
          elapsed_ms: rawObj.elapsed_ms,
          nodes_expanded: rawObj.nodes_expanded,
        };
      } catch (err) {
        console.warn(`[pack] Warn: sun344 WASM refresh skipped for ${id}:`, String(err));
      }
    }

    const stunCount = replayedObj.stun_count ?? 0;
    const ultCount = countSunUlts(replayedObj);
    const rhythmTag = `${stunCount}失衡${ultCount}大`;
    const limitedGold = calcSunLimitedGold(b);

    const enriched = {
      ...replayedObj,
      version: specVersion,
      engine: 'sun344',
      preset_id: id,
      shorthand: code6,
      limited_gold: limitedGold,
      uncapped_hp: uncappedHp,
      ult_count: ultCount,
      rhythm_tag: rhythmTag,
    };

    const relPath = `presets/sun344/${id}.json`;
    writeJson(path.join(SIM_DATA_DIR, relPath), enriched, false);

    const subtitle = `${limitedGold}金 ${code6} (挽${b.sun_m}${b.sun_w}/洛${b.roxy_m}${b.roxy_w}/鸟${b.robin_m}${b.robin_w}) · ${rhythmTag}`;
    const title = titleFn({
      raw: enriched,
      code6,
      limitedGold,
      rhythmTag,
      killed: Boolean(enriched.killed),
      killTimeS: enriched.kill_time_s,
      totalDmg: enriched.total_dmg,
      score: enriched.da_total_score,
    });

    const item = {
      id,
      engine: 'sun344',
      category,
      title,
      subtitle,
      bossName: enriched.boss_name,
      bossMode,
      bossHp: uncappedHp ? null : enriched.boss_name?.includes('新生之结') ? 339619162.0 : null,
      uncappedHp,
      stageBuffId,
      limitedGold,
      shorthand: code6,
      sunM: b.sun_m,
      roxyM: b.roxy_m,
      robinM: b.robin_m,
      sunW: b.sun_w,
      roxyW: b.roxy_w,
      robinW: b.robin_w,
      agentNames: ['挽昼', '洛克茜', '知更鸟'],
      agentM: [b.sun_m, b.roxy_m, b.robin_m],
      agentW: [b.sun_w, b.roxy_w, b.robin_w],
      bangbooName: '梦游布',
      stunCount,
      ultCount,
      rhythmTag,
      totalDmg: enriched.total_dmg,
      dps: enriched.dps,
      killed: Boolean(enriched.killed),
      killTimeS: enriched.kill_time_s ?? null,
      daDmgScore: enriched.da_dmg_score ?? 0,
      daPerfScore: enriched.da_perf_score ?? 0,
      daTotalScore: enriched.da_total_score ?? 0,
      path: relPath,
    };
    auditSun344Trajectory(id, enriched, title, subtitle);
    sunPresetsMap.set(id, item);
    return item;
  }

  // 2a. Featured & core benchmarks
  const knot7CapPath = path.join(SUN_OUT_DIR, 'sun344_knot_7gold_110111.json');
  const knot7UncPath = path.join(SUN_PRESETS_SRC_DIR, 'tmp_unc_110111.json');
  const knot5Path = path.join(SUN_OUT_DIR, 'sun344_knot_5gold_01all.json');

  if (fs.existsSync(knot7CapPath)) {
    registerSunPreset({
      id: 'sun344_knot_7gold_110111',
      category: 'featured',
      rawObj: readJson(knot7CapPath),
      uncappedOverride: false,
      titleFn: ({ killed, killTimeS, totalDmg, score, limitedGold }) =>
        killed
          ? `危局52 新生之结｜${limitedGold}金 110111 (${killTimeS.toFixed(2)}s 斩杀)`
          : `危局52 新生之结｜${limitedGold}金 110111 (${fmtYi(totalDmg)} / ${score}分)`,
    });
  }
  if (fs.existsSync(knot7UncPath)) {
    registerSunPreset({
      id: 'sun344_knot_7gold_110111_uncap',
      category: 'featured',
      rawObj: readJson(knot7UncPath),
      uncappedOverride: true,
      titleFn: ({ totalDmg, limitedGold }) =>
        `危局52 新生之结 (180s无上限)｜${limitedGold}金 110111 (${fmtYi(totalDmg)})`,
    });
  }
  if (fs.existsSync(knot5Path)) {
    registerSunPreset({
      id: 'sun344_knot_5gold_010101',
      category: 'featured',
      rawObj: readJson(knot5Path),
      uncappedOverride: false,
      titleFn: ({ killed, killTimeS, totalDmg, score, limitedGold }) =>
        killed
          ? `危局52 新生之结｜${limitedGold}金 010101 (${killTimeS.toFixed(2)}s 斩杀)`
          : `危局52 新生之结｜${limitedGold}金 010101 (${fmtYi(totalDmg)} / ${score}分)`,
    });
  }

  // Optional 69015205 weather preset if generated
  for (const fname of fs.readdirSync(SUN_OUT_DIR)) {
    if (fname.endsWith('.json') && fname.includes('5205')) {
      const id = fname.replace(/\.json$/, '');
      const raw = readJson(path.join(SUN_OUT_DIR, fname));
      if (Array.isArray(raw.rows)) {
        registerSunPreset({
          id,
          category: 'featured',
          rawObj: raw,
          titleFn: ({ code6, limitedGold, killed, killTimeS, totalDmg }) =>
            killed
              ? `危局52 [凋蚀印记]｜${limitedGold}金 ${code6} (${killTimeS.toFixed(2)}s 斩杀)`
              : `危局52 [凋蚀印记]｜${limitedGold}金 ${code6} (${fmtYi(totalDmg)})`,
        });
      }
    }
  }

  // 2b. Gold-cost ladder champions & notable builds
  const champPresetLookup = new Map(); // code6 -> presetItem
  for (const champ of rawCostLadder.champions_by_gold || []) {
    const code6 = code6FromBuild(champ.build);
    if (code6 === '110111' && sunPresetsMap.has('sun344_knot_7gold_110111')) {
      champPresetLookup.set(code6, sunPresetsMap.get('sun344_knot_7gold_110111'));
      continue;
    }
    if (code6 === '010101' && sunPresetsMap.has('sun344_knot_5gold_010101')) {
      champPresetLookup.set(code6, sunPresetsMap.get('sun344_knot_5gold_010101'));
      continue;
    }
    const g = calcSunLimitedGold(champ.build);
    const pid = `sun344_knot_${g}gold_${code6}`;
    const destFile = path.join(SIM_DATA_DIR, 'presets', 'sun344', `${pid}.json`);
    const rotObj = ensureChampionRotationFile(champ, destFile);
    if (rotObj) {
      const item = registerSunPreset({
        id: pid,
        category: 'cost_ladder',
        rawObj: rotObj,
        uncappedOverride: false,
        titleFn: ({ killed, killTimeS, totalDmg, score, limitedGold }) =>
          killed
            ? `危局52 ${limitedGold}金｜${code6} (${killTimeS.toFixed(2)}s 斩杀)`
            : `危局52 ${limitedGold}金｜${code6} (${fmtYi(totalDmg)} / ${score}分)`,
      });
      if (item) champPresetLookup.set(code6, item);
    }
  }

  // Notable alternative builds (e.g. 210101, 210011, 000001, 110110)
  for (const nb of rawCostLadder.notable_benchmarks || []) {
    const code6 = code6FromBuild(nb.build);
    if (champPresetLookup.has(code6)) continue;
    const g = calcSunLimitedGold(nb.build);
    const pid = `sun344_knot_${g}gold_${code6}`;
    if (sunPresetsMap.has(pid)) {
      champPresetLookup.set(code6, sunPresetsMap.get(pid));
      continue;
    }
    const capCand = path.join(SUN_PRESETS_SRC_DIR, `tmp_cap_${code6}.json`);
    if (fs.existsSync(capCand)) {
      const item = registerSunPreset({
        id: pid,
        category: 'cost_ladder',
        rawObj: readJson(capCand),
        uncappedOverride: false,
        titleFn: ({ killed, killTimeS, totalDmg, score, limitedGold }) =>
          killed
            ? `危局52 ${limitedGold}金｜${code6} (${killTimeS.toFixed(2)}s 斩杀)`
            : `危局52 ${limitedGold}金｜${code6} (${fmtYi(totalDmg)} / ${score}分)`,
      });
      if (item) champPresetLookup.set(code6, item);
    }
  }

  // 2c. Boss benchmarks (Butcher, Kusariku, Trivia, M2/M6 Butcher)
  const bossBenchSpecs = [
    {
      src: 'sun344_best_rotation.json',
      id: 'sun344_butcher_cntlzyw_010101',
      titleFn: ({ totalDmg, limitedGold }) =>
        `训练场死路屠夫｜${limitedGold}金 010101 (对齐真人弹刀窗 · ${fmtYi(totalDmg)})`,
    },
    {
      src: 'sun344_best_autonomous.json',
      id: 'sun344_butcher_auto_010101',
      titleFn: ({ totalDmg, limitedGold }) =>
        `训练场死路屠夫｜${limitedGold}金 010101 (4.8s自主弹刀纯木桩 · ${fmtYi(totalDmg)})`,
    },
    {
      src: 'sun344_da_butcher.json',
      id: 'sun344_da_butcher_010101',
      titleFn: ({ totalDmg, raw, limitedGold }) =>
        `危局实战死路屠夫｜${limitedGold}金 010101 (14078失衡 · ${raw.stun_count}轮失衡 ${fmtYi(totalDmg)})`,
    },
    {
      src: 'sun344_da53_kusariku.json',
      id: 'sun344_da53_kusariku_010101',
      titleFn: ({ totalDmg, limitedGold }) =>
        `危局53期库萨里库｜${limitedGold}金 010101 (火弱 · ${fmtYi(totalDmg)})`,
    },
    {
      src: 'sun344_da53_trivia.json',
      id: 'sun344_da53_trivia_010101',
      titleFn: ({ totalDmg, limitedGold }) =>
        `危局53期特里薇娅｜${limitedGold}金 010101 (15s超长失衡窗 · ${fmtYi(totalDmg)})`,
    },
    {
      src: 'sun344_m2_cntlzyw.json',
      id: 'sun344_butcher_m2_210101',
      titleFn: ({ totalDmg, limitedGold }) =>
        `训练场死路屠夫｜${limitedGold}金 210101 (挽昼M2R1 4000喧响 · ${fmtYi(totalDmg)})`,
    },
    {
      src: 'sun344_m6_cntlzyw.json',
      id: 'sun344_butcher_m6_612121',
      titleFn: ({ totalDmg, limitedGold }) =>
        `训练场死路屠夫｜${limitedGold}金 612121 (M6挽昼+M2洛+M2鸟 · ${fmtYi(totalDmg)})`,
    },
  ];
  for (const bs of bossBenchSpecs) {
    const p = path.join(SUN_OUT_DIR, bs.src);
    if (fs.existsSync(p)) {
      registerSunPreset({
        id: bs.id,
        category: 'boss_bench',
        rawObj: readJson(p),
        uncappedOverride: false,
        titleFn: bs.titleFn,
      });
    }
  }

  // 2d. Mindscape ladder cap & uncap presets (M0/M1/M2/M4/M6 across all 3 tiers)
  const msCapLookup = new Map(); // code6 -> presetItem
  const msUncLookup = new Map(); // code6 -> presetItem

  for (const tier of rawMindscape.tiers || []) {
    for (const row of tier.rows || []) {
      const code6 = row.code6;
      const capSrc = path.join(SUN_PRESETS_SRC_DIR, `tmp_cap_${code6}.json`);
      const uncSrc = path.join(SUN_PRESETS_SRC_DIR, `tmp_unc_${code6}.json`);

      // Reuse already-registered featured/champion preset if identical
      let capItem =
        code6 === '110111' && sunPresetsMap.has('sun344_knot_7gold_110111')
          ? sunPresetsMap.get('sun344_knot_7gold_110111')
          : code6 === '010101' && sunPresetsMap.has('sun344_knot_5gold_010101')
            ? sunPresetsMap.get('sun344_knot_5gold_010101')
            : champPresetLookup.get(code6) || null;

      if (!capItem && fs.existsSync(capSrc)) {
        const capRaw = readJson(capSrc);
        const b = capRaw.build || {};
        capItem = registerSunPreset({
          id: `sun344_da52_cap_${code6}`,
          category: 'mindscape_cap',
          rawObj: capRaw,
          uncappedOverride: false,
          titleFn: ({ killed, killTimeS, totalDmg }) =>
            killed
              ? `危局52实战斩杀轴｜[${code6}] 挽M${b.sun_m}R${b.sun_w}+洛M${b.roxy_m}R${b.roxy_w}+鸟M${b.robin_m}R${b.robin_w} (${killTimeS.toFixed(2)}s)`
              : `危局52实战轴｜[${code6}] 挽M${b.sun_m}R${b.sun_w}+洛M${b.roxy_m}R${b.roxy_w}+鸟M${b.robin_m}R${b.robin_w} (${fmtYi(totalDmg)})`,
        });
      }
      if (capItem) msCapLookup.set(code6, capItem);

      let uncItem =
        code6 === '110111' && sunPresetsMap.has('sun344_knot_7gold_110111_uncap')
          ? sunPresetsMap.get('sun344_knot_7gold_110111_uncap')
          : null;

      // Only create separate uncap preset if capped run killed early (so uncap differs from cap!)
      if (!uncItem && fs.existsSync(uncSrc)) {
        const uncRaw = readJson(uncSrc);
        if (row.killed || !capItem) {
          const b = uncRaw.build || {};
          uncItem = registerSunPreset({
            id: `sun344_da52_uncap_${code6}`,
            category: 'mindscape_uncap',
            rawObj: uncRaw,
            uncappedOverride: true,
            titleFn: ({ totalDmg }) =>
              `危局52打满180s无上限｜[${code6}] 挽M${b.sun_m}R${b.sun_w}+洛M${b.roxy_m}R${b.roxy_w}+鸟M${b.robin_m}R${b.robin_w} (${fmtYi(totalDmg)})`,
          });
        } else {
          uncItem = capItem;
        }
      }
      if (uncItem) msUncLookup.set(code6, uncItem);
    }
  }

  // 3. Build sun344_overview.json
  function mapCostEntry(e) {
    const code6 = code6FromBuild(e.build);
    const capItem =
      (code6 === '110111' && sunPresetsMap.get('sun344_knot_7gold_110111')) ||
      (code6 === '010101' && sunPresetsMap.get('sun344_knot_5gold_010101')) ||
      champPresetLookup.get(code6) ||
      msCapLookup.get(code6) ||
      null;
    const uncItem =
      (code6 === '110111' && sunPresetsMap.get('sun344_knot_7gold_110111_uncap')) ||
      msUncLookup.get(code6) ||
      null;
    const ultCount = capItem?.ultCount ?? 4;
    const stunCount = e.stun_count ?? capItem?.stunCount ?? 4;
    const rhythmTag = capItem?.rhythmTag || `${stunCount}失衡${ultCount}大`;
    const killed = capItem ? Boolean(capItem.killed) : Boolean(e.killed);
    const killTimeS = capItem ? capItem.killTimeS : (e.kill_time_s ?? null);
    const daDmgScore = capItem ? capItem.daDmgScore : e.da_dmg_score;
    const daPerfScore = capItem ? capItem.daPerfScore : e.da_perf_score;
    const daTotalScore = capItem ? capItem.daTotalScore : e.da_total_score;
    const totalDmg = capItem ? capItem.totalDmg : e.total_dmg;
    const dps = capItem ? capItem.dps : e.dps;
    return {
      limitedGold: calcSunLimitedGold(e.build),
      build: e.build,
      shorthand: e.shorthand,
      code6,
      detailLabel: e.detail_label,
      stageBuffId: e.stage_buff_id,
      effort: e.effort,
      killed,
      killTimeS,
      daDmgScore,
      daPerfScore,
      daTotalScore,
      totalDmg,
      ...(uncItem && uncItem.totalDmg > totalDmg ? { uncapped180sDmg: uncItem.totalDmg } : {}),
      bossHpPct: Number(((totalDmg / 339619162.0) * 100).toFixed(2)),
      stunCount: capItem?.stunCount ?? stunCount,
      ultCount,
      rhythmTag,
      dps,
      fieldPct: e.field_pct,
      ...(capItem ? { presetId: capItem.id, presetPath: capItem.path } : {}),
      ...(uncItem ? { uncappedPresetId: uncItem.id, uncappedPresetPath: uncItem.path } : {}),
    };
  }

  const costLadderBundle = {
    version: specVersion,
    bossName: sunSpec.bosses?.[2]?.name || rawCostLadder.boss_name,
    bossMid: rawCostLadder.boss_mid ?? 31821,
    bossTotalHp: 339619162.0,
    selectedStageBuffId: rawCostLadder.selected_stage_buff_id ?? 69015201,
    selectedStageBuffName: rawCostLadder.selected_stage_buff_name || '69015201 [攻砭]',
    stageBuffComparison6Gold: (rawCostLadder.stage_buff_comparison_6gold || []).map((sb) => ({
      stageBuffId: sb.stage_buff_id,
      stageBuffName: sb.stage_buff_name,
      buildShorthand: sb.build_shorthand,
      killed: Boolean(sb.killed),
      killTimeS: sb.kill_time_s ?? null,
      daDmgScore: sb.da_dmg_score,
      daPerfScore: sb.da_perf_score,
      daTotalScore: sb.da_total_score,
      totalDmg: sb.total_dmg,
      bossHpPct: sb.boss_hp_pct,
      stunCount: sb.stun_count,
      rhythmTag: `${sb.stun_count}失衡4大`,
    })),
    minGoldToKill: mapCostEntry(
      rawCostLadder.min_gold_to_kill || rawCostLadder.champions_by_gold.slice(-1)[0],
    ),
    championsByGold: (rawCostLadder.champions_by_gold || []).map(mapCostEntry),
    notableBenchmarks: (rawCostLadder.notable_benchmarks || []).map(mapCostEntry),
    allEvaluatedBuilds: (rawCostLadder.all_evaluated_builds || []).map(mapCostEntry),
  };

  const mindscapeLadderBundle = {
    elapsedS: rawMindscape.elapsed_s ?? 0,
    tiers: (rawMindscape.tiers || []).map((tier) => {
      const sampleCode = tier.rows?.[0]?.code6 || '010101';
      const roxyM = Number(sampleCode[2] || 0);
      const roxyW = Number(sampleCode[3] || 0);
      const robinM = Number(sampleCode[4] || 0);
      const robinW = Number(sampleCode[5] || 1);
      return {
        teammateLabel: tier.teammate_label,
        roxyM,
        roxyW,
        robinM,
        robinW,
        rows: (tier.rows || []).map((r) => {
          const code6 = r.code6;
          const capItem = msCapLookup.get(code6) || null;
          const uncItem = msUncLookup.get(code6) || capItem || null;
          const cappedStuns = capItem?.stunCount ?? r.uncapped_stuns ?? 4;
          const cappedUlts = capItem?.ultCount ?? 4;
          const uncappedStuns = uncItem?.stunCount ?? r.uncapped_stuns ?? 4;
          const uncappedUlts = uncItem?.ultCount ?? 4;
          const cappedRhythmTag = `${cappedStuns}失衡${cappedUlts}大`;
          const uncappedRhythmTag = `${uncappedStuns}失衡${uncappedUlts}大`;
          const killed = capItem ? Boolean(capItem.killed) : Boolean(r.killed);
          const killTimeS = capItem ? capItem.killTimeS : (r.kill_time_s ?? null);
          const daDmgScore = capItem ? capItem.daDmgScore : r.da_dmg_score;
          const daPerfScore = capItem ? capItem.daPerfScore : r.da_perf_score;
          const daTotalScore = capItem ? capItem.daTotalScore : r.da_total_score;
          const cappedDmg = capItem ? capItem.totalDmg : r.capped_dmg;
          const uncapped180sDmg = uncItem ? uncItem.totalDmg : r.uncapped_180s_dmg;
          const uncapped180sDps = uncItem ? uncItem.dps : r.uncapped_180s_dps;
          return {
            sunM: r.sun_m,
            code6,
            limitedGold: r.limited_gold,
            killed,
            killTimeS,
            daDmgScore,
            daPerfScore,
            daTotalScore,
            cappedDmg,
            uncapped180sDmg,
            uncapped180sDps,
            cappedStuns,
            cappedUlts,
            cappedRhythmTag,
            uncappedStuns,
            uncappedUlts,
            uncappedRhythmTag,
            ultCount: killed ? cappedUlts : uncappedUlts,
            rhythmTag: killed ? cappedRhythmTag : uncappedRhythmTag,
            uncappedEquivScore: r.uncapped_equiv_score,
            fieldPct: r.field_pct,
            vsM0DmgPct: r.vs_m0_dmg_pct,
            vsPrevDmgPct: r.vs_prev_dmg_pct,
            vsM0DaDelta: r.vs_m0_da_delta,
            vsM0EquivDelta: r.vs_m0_equiv_delta,
            ...(capItem ? { cappedPresetId: capItem.id, cappedPresetPath: capItem.path } : {}),
            ...(uncItem ? { uncappedPresetId: uncItem.id, uncappedPresetPath: uncItem.path } : {}),
          };
        }),
      };
    }),
  };

  // Top-level benchmarks summary list
  const benchPresetOrder = [
    ['sun344_knot_7gold_110111', 19006.8, '危局52期新生之结 · 7金 110111'],
    ['sun344_knot_7gold_110111_uncap', 19006.8, '危局52期新生之结 · 7金 110111 (180s无上限)'],
    ['sun344_knot_5gold_010101', 19006.8, '危局52期新生之结 · 5金 010101'],
    ['sun344_butcher_cntlzyw_010101', 17582.7, '训练场屠夫 17582.7失衡 · 对齐实机弹刀窗'],
    ['sun344_butcher_auto_010101', 17582.7, '训练场屠夫 17582.7失衡 · 固定周期弹刀 (4.8s)'],
    ['sun344_da_butcher_010101', 14078.85, '危局实战屠夫 14078.85失衡 · 非火弱靶'],
    ['sun344_da53_kusariku_010101', 16216.9, '危局53期库萨里库 · 火弱点靶'],
    ['sun344_da53_trivia_010101', 18298.8, '危局53期特里薇娅 · 15s失衡窗靶'],
    ['sun344_butcher_m2_210101', 17582.7, '训练场屠夫 · 挽昼M2R1 (4000喧响上限)'],
    ['sun344_butcher_m6_612121', 17582.7, '训练场屠夫 · 挽昼M6+洛M2+鸟M2'],
  ];
  const overviewBenchmarks = [];
  for (const [pid, stunMax, notePrefix] of benchPresetOrder) {
    const pItem = sunPresetsMap.get(pid);
    if (!pItem) continue;
    const fullData = checkOnly
      ? sunPresetsMap.get(pid) || {}
      : readJson(path.join(SIM_DATA_DIR, pItem.path));
    overviewBenchmarks.push({
      bossName: pItem.bossName,
      bossMode: pItem.bossMode,
      sunM: pItem.sunM,
      roxyM: pItem.roxyM,
      robinM: pItem.robinM,
      limitedGold: pItem.limitedGold,
      shorthand: pItem.shorthand,
      stunMax,
      stunCount: pItem.stunCount,
      ultCount: pItem.ultCount,
      rhythmTag: pItem.rhythmTag,
      totalDirectDmg: fullData.total_direct_dmg ?? 0,
      totalDetonatedDmg: fullData.total_detonated_dmg ?? 0,
      totalDmg: pItem.totalDmg,
      dps: pItem.dps,
      killed: pItem.killed,
      killTimeS: pItem.killTimeS,
      daTotalScore: pItem.daTotalScore,
      elapsedMs: fullData.elapsed_ms,
      nodesExpanded: fullData.nodes_expanded,
      note: pItem.killed && pItem.killTimeS
        ? `${notePrefix} (${pItem.killTimeS.toFixed(2)}s 满血斩杀 · ${pItem.daTotalScore}分)`
        : `${notePrefix} (${fmtYi(pItem.totalDmg)} · ${pItem.daTotalScore}分)`,
      presetId: pItem.id,
      presetPath: pItem.path,
      ...(pItem.ubMaxDmg != null ? { ubTotalDmg: pItem.ubMaxDmg } : {}),
      ...(pItem.ubGapPct != null ? { gapPct: pItem.ubGapPct } : {}),
      ...(pItem.ubEfficiencyPct != null ? { achievedPct: pItem.ubEfficiencyPct } : {}),
      ...(pItem.ubMinKillS != null ? { minKillLbS: pItem.ubMinKillS } : {}),
    });
  }

  const sunOverviewBundle = {
    version: specVersion,
    generatedAt,
    benchmarks: overviewBenchmarks,
    costLadder: costLadderBundle,
    mindscapeLadder: mindscapeLadderBundle,
    optimalityProof: {
      schemaVersion: rawProof.schema_version || rawProof.schemaVersion || 'sun344-milp-relaxation-proof-v1.1',
      gameVersion: rawProof.game_version || rawProof.gameVersion || specVersion,
      solverBackend:
        rawProof.solver_backend ||
        rawProof.solverBackend ||
        'SciPy HiGHS Mixed-Integer Linear Programming (`scipy.optimize.milp`)',
      totalRuntimeS: rawProof.total_runtime_s ?? rawProof.totalRuntimeS ?? 0,
      admissibilityAudit: {
        totalAudited:
          rawProof.admissibility_audit?.total_audited ??
          rawProof.admissibilityAudit?.totalAudited ??
          0,
        passedCount:
          rawProof.admissibility_audit?.passed_count ??
          rawProof.admissibilityAudit?.passedCount ??
          0,
        allPassed: Boolean(
          rawProof.admissibility_audit?.all_passed ??
            rawProof.admissibilityAudit?.allPassed ??
            true,
        ),
        globalMaxViolation:
          rawProof.admissibility_audit?.global_max_violation ??
          rawProof.admissibilityAudit?.globalMaxViolation ??
          0,
      },
      scenarios: normScenarios,
      gapPhysicalSources: (rawProof.gap_physical_sources || rawProof.gapPhysicalSources || []).map(
        (g) => ({
          source: g.source,
          mechanism: g.mechanism,
          estimatedShareOfGapPct: g.estimated_share_of_gap_pct ?? g.estimatedShareOfGapPct ?? null,
        }),
      ),
    },
  };

  writeJson(path.join(SIM_DATA_DIR, 'benchmarks', 'sun344_overview.json'), sunOverviewBundle, true);

  // 4. Sync uni344 presets (preserve existing 74 items & overlay any refreshed files from wt_uni344/out)
  const existingManifestPath = path.join(SIM_DATA_DIR, 'manifest.json');
  const prevManifest = fs.existsSync(existingManifestPath) ? readJson(existingManifestPath) : null;
  const prevUniItems = (prevManifest?.presets || []).filter((p) => p.engine === 'uni344');

  const uniPresets = [];
  for (const prevItem of prevUniItems) {
    // Map `uni344_plugin_p1_<stem>` -> `wt_uni344/out/plugin_p1/<stem>.json`
    const m = /^uni344_(plugin_p[123])_(.+)$/.exec(prevItem.id);
    let srcFile = null;
    if (m) {
      const cand = path.join(UNI_OUT_DIR, m[1], `${m[2]}.json`);
      if (fs.existsSync(cand)) srcFile = cand;
    }
    const localDest = path.join(SIM_DATA_DIR, prevItem.path);
    let rawUni = srcFile ? readJson(srcFile) : fs.existsSync(localDest) ? readJson(localDest) : null;
    if (!rawUni) continue;

    // Deterministically refresh ALL 74 uni344 presets via 3.4.5_r20699967 WASM replay so 112/112 presets match live `#btn-wasm-replay` to 0.000000%
    const compMatch = /^composed_(\d+)_(\d+)_(\d+)$/.exec(rawUni.team_id || '');
    if (uniWasm && Array.isArray(rawUni.macros) && rawUni.macros.length > 0) {
      const resolvedAgents = compMatch
        ? [compMatch[1], compMatch[2], compMatch[3]]
        : (rawUni.agent_names || prevItem.agentNames || []).map((nm) => {
            const cleanNm = cleanTestTag(nm);
            const hit = catalogIndex.agents.find(
              (a) => a.nameCn === cleanNm || a.nameCnFull === cleanNm || cleanNm.includes(a.nameCn),
            );
            return hit ? String(hit.id) : cleanNm;
          });
      const rawBbName = cleanTestTag(rawUni.bangboo_name || prevItem.bangbooName || '');
      const hitBb = rawBbName
        ? catalogIndex.bangboos.find(
            (bb) =>
              bb.nameCn === rawBbName ||
              bb.key === rawBbName ||
              rawBbName.includes(bb.nameCn) ||
              bb.nameCn.includes(rawBbName),
          )
        : null;
      const bbVal = hitBb ? String(hitBb.id) : rawBbName || 'auto';
      let specJsonStr;
      if (prevItem.specPath) {
        const candSpec = path.join(SIM_DATA_DIR, prevItem.specPath);
        if (fs.existsSync(candSpec)) specJsonStr = fs.readFileSync(candSpec, 'utf8');
      }
      try {
        const rep = JSON.parse(
          uniWasm.uni344_replay_json(
            JSON.stringify({
              macros: rawUni.macros,
              ...(specJsonStr ? { spec_json: specJsonStr } : {}),
              agents: resolvedAgents,
              m: rawUni.agent_m || prevItem.agentM,
              w: rawUni.agent_w || prevItem.agentW,
              bangboo: bbVal,
              boss: String(rawUni.boss_mid ?? prevItem.bossName),
              stage_buff_id: rawUni.stage_buff_id ?? prevItem.stageBuffId ?? 0,
              uncapped_hp: Boolean(rawUni.uncapped_hp ?? prevItem.uncappedHp),
            }),
          ),
        );
        rawUni = {
          ...rawUni,
          ...rep,
          bangboo_name: rawBbName || rep.bangboo_name,
          elapsed_ms: rawUni.elapsed_ms,
          nodes_expanded: rawUni.nodes_expanded,
        };
      } catch (err) {
        console.warn(`[pack] Warn: uni344 WASM refresh skipped for ${prevItem.id}:`, String(err));
      }
    }

    const cleanNames = Array.isArray(rawUni.agent_names)
      ? rawUni.agent_names.map(cleanTestTag)
      : (prevItem.agentNames || []).map(cleanTestTag);
    const stunCount = rawUni.stun_count ?? prevItem.stunCount ?? 0;
    const ultCount = countUniUlts(rawUni) || prevItem.ultCount || 0;
    const rhythmTag = `${stunCount}失衡${ultCount}大`;

    const enrichedUni = {
      ...rawUni,
      version: specVersion,
      engine: 'uni344',
      preset_id: prevItem.id,
      agent_names: cleanNames,
      ult_count: ultCount,
      rhythm_tag: rhythmTag,
    };
    writeJson(localDest, enrichedUni, false);

    const uniGold = enrichedUni.limited_gold ?? prevItem.limitedGold;
    uniPresets.push({
      ...prevItem,
      limitedGold: uniGold,
      title: cleanTestTag(prevItem.title).replace(/｜\d+金\s*\[/, `｜${uniGold}金 [`),
      subtitle: `${uniGold}金 [${prevItem.shorthand}] (${cleanNames.join('/')}) · ${rhythmTag}`,
      bossName: cleanTestTag(enrichedUni.boss_name || prevItem.bossName),
      agentNames: cleanNames,
      bangbooName: cleanTestTag(enrichedUni.bangboo_name || prevItem.bangbooName || '协战邦布'),
      stunCount,
      ultCount,
      rhythmTag,
      totalDmg: enrichedUni.total_dmg ?? prevItem.totalDmg,
      dps: enrichedUni.dps ?? prevItem.dps,
      killed: Boolean(enrichedUni.killed ?? prevItem.killed),
      killTimeS: enrichedUni.kill_time_s ?? prevItem.killTimeS ?? null,
      daDmgScore: enrichedUni.da_dmg_score ?? prevItem.daDmgScore ?? 0,
      daPerfScore: enrichedUni.da_perf_score ?? prevItem.daPerfScore ?? 0,
      daTotalScore: enrichedUni.da_total_score ?? prevItem.daTotalScore ?? 0,
    });
  }

  const sunPresetsList = Array.from(sunPresetsMap.values());
  const allPresets = [...sunPresetsList, ...uniPresets];

  const manifestObj = {
    version: specVersion,
    generatedAt,
    releaseId: 'bundled',
    specs: {
      sunSpecPath: 'specs/sun_team_344_spec.json',
      uniCatalogPath: 'specs/universal_catalog_runtime.json',
      catalogIndexPath: 'specs/catalog_index.json',
      sunOverviewPath: 'benchmarks/sun344_overview.json',
    },
    counts: {
      totalPresets: allPresets.length,
      sun344Presets: sunPresetsList.length,
      uni344Presets: uniPresets.length,
    },
    presets: allPresets,
  };

  if (tacticalAuditNotes.length > 0) {
    console.log(`[tactical-audit] Info notes (${tacticalAuditNotes.length}):`);
    for (const n of tacticalAuditNotes) console.log(`  - ${n}`);
  }
  if (tacticalAuditErrors.length > 0) {
    console.error(`[tactical-audit] FAILED with ${tacticalAuditErrors.length} tactical defect(s):`);
    for (const e of tacticalAuditErrors) console.error(`  ✗ ${e}`);
    process.exit(1);
  }
  console.log(`[tactical-audit] PASS: 0 tactical anti-patterns across ${sunPresetsList.length} sun344 presets.`);

  writeJson(path.join(SIM_DATA_DIR, 'manifest.json'), manifestObj, true);

  console.log(
    `[pack] Done! version=${specVersion}, totalPresets=${allPresets.length} (sun344=${sunPresetsList.length}, uni344=${uniPresets.length})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
