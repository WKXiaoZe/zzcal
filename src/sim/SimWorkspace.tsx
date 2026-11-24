// src/sim/SimWorkspace.tsx
// ZZZ 神秘小算盘 · 双引擎实战排轴与浏览器 WASM 搜轴主工作台

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './sim.module.css';
import {
  bumpSpecCacheToken,
  loadCatalogIndex,
  loadManifest,
  loadPresetCompanionSpecRaw,
  loadPresetResult,
  loadSunOverview,
  loadSunSpec,
} from './dataLoader';
import {
  clearSimSpecCache,
  initSimWasm,
  replaySun344,
  replayUni344,
  searchSun344,
  searchUni344,
  type SimWasmInitStatus,
  type SunSquadGearOverrides,
} from './wasmClient';
import type {
  AnomalyReportRecord,
  CatalogAgentItem,
  PresetIndexItem,
  SearchResultData,
  SimEngine,
  SimManifest,
  SunOverviewBundle,
  UniversalCatalogSummary,
} from './types';
import { normalizeSimResult } from './components/simAdapter';
import { KpiHeroRow } from './components/KpiHeroRow';
import { SwimlaneTimeline } from './components/SwimlaneTimeline';
import { StepInspectorDrawer } from './components/StepInspectorDrawer';
import { VisualChartsGrid } from './components/VisualChartsGrid';
import { AnomalyReportPopover } from './components/AnomalyReportPopover';
import { OpsDrawer } from './components/OpsDrawer';
import { ActionStreamCollapse } from './components/ActionStreamCollapse';

export interface SimWorkspaceProps {
  opsOpen: boolean;
  onOpenOps: () => void;
  onCloseOps: () => void;
  onSpecVersionLoaded?: (ver: string) => void;
}

/**
 * 与 `zzz-uni344` (`gear_all.rs::build_agent_spec_from_catalog`) 严格对齐的默认音擎与 4+2 驱动盘解析
 */
function resolveUniAgentDefaultGear(ag?: CatalogAgentItem): {
  wEngineId: string;
  disc4Id: string;
  disc2Id: string;
} {
  if (!ag) {
    return { wEngineId: '', disc4Id: '', disc2Id: '' };
  }
  const wEngineId = String(ag.signatureWEngineId ?? ag.defaultWEngineId ?? '');
  let disc4Id = String(ag.defaultDisc4Id ?? '');
  if (ag.specialtyId === 7) {
    disc4Id = ag.elementId === 201 ? '34300' : '34200';
  } else if (ag.specialtyId === 6) {
    disc4Id = '33100';
  } else if (ag.specialtyId === 2) {
    disc4Id = '33200';
  } else if (ag.specialtyId === 5) {
    disc4Id = '33700';
  } else if (ag.specialtyId === 3) {
    const anomOverride: Record<number, string> = {
      1581: '34100',
      1561: '33900',
      1541: '33800',
      1501: '33600',
      1331: '33000',
      1401: '32600',
    };
    disc4Id = anomOverride[ag.id] ?? disc4Id;
  }

  const disc2Id =
    ag.specialtyId === 7
      ? disc4Id === '34300'
        ? '34200'
        : '34300'
      : String(ag.defaultDisc2Id ?? '');

  return { wEngineId, disc4Id, disc2Id };
}

const SUN_STAGE_BUFFS = [
  { id: 69015201, label: '69015201 [攻砭] (52期: 锋御防+10% / 锐化+20% / 毁伤回300喧响&易伤+15%)' },
  { id: 69015205, label: '69015205 [凋蚀印记] (52期硬核: 毁伤2层印记 / 每层受锐化伤+35%·上限3层)' },
  { id: 69015301, label: '69015301 [尖峰] (53期: 防+10% / 无视10%火抗 / 锋御暴击回300喧响&锐化+10%)' },
  { id: 69015101, label: '69015101 [淬火] (51期: 锋御防+15% / 火伤+20% / 锐暴+10%)' },
  { id: 69015202, label: '69015202 [墟湮] (击破失衡+15% / 终结技+30%伤&+40%暴伤)' },
  { id: 69015203, label: '69015203 [逆涌] (异常全队回10能量)' },
  { id: 0, label: '无自选天气增益 (仅场地原生环境)' },
] as const;

const SUN_BOSS_MODES = [
  {
    key: 'NascentKnotDA52',
    bossName: '🔥 危局52期｜新生之结 (弱火 / 3.40亿29管血 / 专怪角力&裂核)',
    label: '🔥 危局52期 · 新生之结',
  },
  {
    key: 'Autonomous',
    bossName: '📜 实测基准靶｜初生死路屠夫 (训练场标准 952.8防/17582.7失衡/全0%抗)',
    label: '📜 训练场木桩 · 固定周期弹刀',
  },
  {
    key: 'CntlzywIntervals',
    bossName: '📜 实测基准靶｜初生死路屠夫 (对齐真人弹刀窗)',
    label: '📜 训练场木桩 · 实机时间轴弹刀',
  },
] as const;

export function SimWorkspace({
  opsOpen,
  onOpenOps,
  onCloseOps,
  onSpecVersionLoaded,
}: SimWorkspaceProps) {
  // 元数据与静态基准状态
  const [manifest, setManifest] = useState<SimManifest | null>(null);
  const [overview, setOverview] = useState<SunOverviewBundle | null>(null);
  const [catalog, setCatalog] = useState<UniversalCatalogSummary | null>(null);
  const [sunSpecObj, setSunSpecObj] = useState<Record<string, unknown> | null>(null);
  const [wasmStatus, setWasmStatus] = useState<SimWasmInitStatus | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);

  // 当前选中的引擎与预设
  const [engine, setEngine] = useState<SimEngine>('sun344');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [resultData, setResultData] = useState<SearchResultData | null>(null);
  const [loadingPreset, setLoadingPreset] = useState<boolean>(true);
  const [replayMs, setReplayMs] = useState<number | null>(null);

  // 挽昼专核可调配装状态
  const [sunBuild, setSunBuild] = useState({
    sunM: 1,
    sunW: 1,
    roxyM: 0,
    roxyW: 1,
    robinM: 1,
    robinW: 1,
  });
  const [sunBossMode, setSunBossMode] = useState<string>('NascentKnotDA52');
  const [sunBossName, setSunBossName] = useState<string>(
    '🔥 危局52期｜新生之结 (弱火 / 3.40亿29管血 / 专怪角力&裂核)',
  );
  const [sunStageBuffId, setSunStageBuffId] = useState<number>(69015201);
  const [uncappedHp, setUncappedHp] = useState<boolean>(false);
  const [sunGear, setSunGear] = useState<{
    sun: { wEngine: string; disc4: string; disc2: string };
    roxy: { wEngine: string; disc4: string; disc2: string };
    robin: { wEngine: string; disc4: string; disc2: string };
  }>({
    sun: { wEngine: '', disc4: '', disc2: '' },
    roxy: { wEngine: '', disc4: '', disc2: '' },
    robin: { wEngine: '', disc4: '', disc2: '' },
  });

  // 通用自由编队可调状态
  const [uniAgents, setUniAgents] = useState<[string, string, string]>([
    '1601',
    '1391',
    '1311',
  ]);
  const [uniM, setUniM] = useState<[number, number, number]>([0, 0, 0]);
  const [uniW, setUniW] = useState<[number, number, number]>([1, 1, 1]);
  const [uniWeapons, setUniWeapons] = useState<[string, string, string]>(['', '', '']);
  const [uniDisc4, setUniDisc4] = useState<[string, string, string]>(['', '', '']);
  const [uniDisc2, setUniDisc2] = useState<[string, string, string]>(['', '', '']);
  const [uniBangboo, setUniBangboo] = useState<string>('auto');
  const [uniBossId, setUniBossId] = useState<string>('31821');
  const [uniWeatherId, setUniWeatherId] = useState<number>(69015201);
  const [uniCompanionSpecPath, setUniCompanionSpecPath] = useState<string | null>(null);

  // 搜索与重算运行状态
  const isMobileInit =
    typeof window !== 'undefined' && window.innerWidth <= 768;
  const [effort, setEffort] = useState<number>(isMobileInit ? 1 : 1);
  const [showAdvEffort, setShowAdvEffort] = useState<boolean>(!isMobileInit);
  const [replaying, setReplaying] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchStage, setSearchStage] = useState<string>('');
  const [searchPct, setSearchPct] = useState<number>(0);
  const [searchElapsedS, setSearchElapsedS] = useState<number>(0);
  const cancelSearchRef = useRef<(() => void) | null>(null);

  // 抽屉、异常上报浮层与轻量 Toast
  const [inspectedStepIdx, setInspectedStepIdx] = useState<number | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportStepIdx, setReportStepIdx] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
  }, []);

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => setToastMsg(null), 3800);
    return () => window.clearTimeout(t);
  }, [toastMsg]);

  // 搜索计时器
  useEffect(() => {
    if (!searching) {
      setSearchElapsedS(0);
      return;
    }
    const t0 = performance.now();
    const id = window.setInterval(() => {
      setSearchElapsedS((performance.now() - t0) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, [searching]);

  // 同步预设数据到配装控件
  const syncControlsFromPreset = useCallback(
    (item: PresetIndexItem, loaded: SearchResultData, catData?: UniversalCatalogSummary | null) => {
      if (item.engine === 'sun344') {
        const b = (loaded.build || {}) as Record<string, number>;
        setSunBuild({
          sunM: b.sun_m ?? item.sunM ?? loaded.sun_m ?? 0,
          sunW: b.sun_w ?? item.sunW ?? 1,
          roxyM: b.roxy_m ?? item.roxyM ?? loaded.roxy_m ?? 0,
          roxyW: b.roxy_w ?? item.roxyW ?? 1,
          robinM: b.robin_m ?? item.robinM ?? loaded.robin_m ?? 0,
          robinW: b.robin_w ?? item.robinW ?? 1,
        });
        const bm =
          loaded.boss_name?.includes('新生之结') || item.bossMode === 'NascentKnotDA52'
            ? 'NascentKnotDA52'
            : loaded.boss_mode || item.bossMode || 'Autonomous';
        setSunBossMode(bm);
        setSunBossName(loaded.boss_name || item.bossName);
        setSunStageBuffId(loaded.stage_buff_id ?? item.stageBuffId ?? 0);
        setUncappedHp(Boolean(loaded.uncapped_hp ?? item.uncappedHp));
        setSunGear({
          sun: { wEngine: '', disc4: '', disc2: '' },
          roxy: { wEngine: '', disc4: '', disc2: '' },
          robin: { wEngine: '', disc4: '', disc2: '' },
        });
      } else {
        setUniCompanionSpecPath(item.specPath ?? null);
        setUniWeapons(['', '', '']);
        setUniDisc4(['', '', '']);
        setUniDisc2(['', '', '']);
        const compMatch = /^composed_(\d+)_(\d+)_(\d+)$/.exec(
          String((loaded as unknown as Record<string, unknown>).team_id ?? ''),
        );
        const names = loaded.agent_names || item.agentNames;
        if (compMatch) {
          setUniAgents([compMatch[1], compMatch[2], compMatch[3]]);
        } else if (names && names.length === 3 && catData?.agents?.length) {
          const resolvedIds = names.map((nm) => {
            const hit = catData.agents.find(
              (a) => a.nameCn === nm || a.nameCnFull === nm || nm.includes(a.nameCn),
            );
            return hit ? String(hit.id) : nm;
          }) as [string, string, string];
          setUniAgents(resolvedIds);
        }
        const rawBbName = loaded.bangboo_name || item.bangbooName || '';
        if (rawBbName && catData?.bangboos?.length) {
          const hitBb = catData.bangboos.find(
            (bb) =>
              bb.nameCn === rawBbName ||
              bb.key === rawBbName ||
              rawBbName.includes(bb.nameCn) ||
              bb.nameCn.includes(rawBbName),
          );
          setUniBangboo(hitBb ? String(hitBb.id) : rawBbName);
        } else {
          setUniBangboo(rawBbName || 'auto');
        }
        if (loaded.agent_m && loaded.agent_m.length === 3) {
          setUniM(loaded.agent_m);
        } else if (item.agentM) {
          setUniM(item.agentM);
        }
        if (loaded.agent_w && loaded.agent_w.length === 3) {
          setUniW(loaded.agent_w);
        } else if (item.agentW) {
          setUniW(item.agentW);
        }
        if (loaded.boss_mid) {
          setUniBossId(String(loaded.boss_mid));
        }
        if (typeof loaded.stage_buff_id === 'number') {
          setUniWeatherId(loaded.stage_buff_id);
        }
        setUncappedHp(Boolean(loaded.uncapped_hp ?? item.uncappedHp));
      }
    },
    [],
  );

  // 加载指定预设
  const selectAndLoadPreset = useCallback(
    async (
      item: PresetIndexItem,
      catOverride?: UniversalCatalogSummary | null,
      bustCache = false,
    ) => {
      setLoadingPreset(true);
      setBootError(null);
      setReplayMs(null);
      setInspectedStepIdx(null);
      try {
        setEngine(item.engine);
        setSelectedPresetId(item.id);
        const loaded = await loadPresetResult(item, { bustCache });
        setResultData(loaded);
        syncControlsFromPreset(item, loaded, catOverride ?? catalog);
      } catch (err) {
        setBootError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingPreset(false);
      }
    },
    [catalog, syncControlsFromPreset],
  );

  // 初始化启动加载（静态预设 0s 秒开 + 后台异步预热 WASM）
  const bootstrapAllData = useCallback(
    async (forceRefresh = false) => {
      setBootError(null);
      try {
        if (forceRefresh) {
          bumpSpecCacheToken();
          clearSimSpecCache();
        }
        const [mf, ov, cat, specRawObj] = await Promise.all([
          loadManifest(forceRefresh),
          loadSunOverview(forceRefresh).catch(() => null),
          loadCatalogIndex(forceRefresh).catch(() => null),
          loadSunSpec(forceRefresh).catch(() => null),
        ]);
        setManifest(mf);
        if (ov) setOverview(ov);
        if (cat) setCatalog(cat);
        if (specRawObj) setSunSpecObj(specRawObj);

        const specVer = (specRawObj as { version?: string } | null)?.version;
        const effectiveVer = String(
          (mf.releaseId && mf.releaseId !== 'bundled' && mf.version) ||
            (mf.version && mf.version !== '3.4.5_r20699967' ? mf.version : '') ||
            specVer ||
            mf.version ||
            '3.4.5_r20699967',
        );
        onSpecVersionLoaded?.(effectiveVer);

        // 选择默认预设（URL ?preset=... 优先，否则优先选危局52 7金110111满斩或第一条 featured）
        const hashQuery = window.location.hash.split('?')[1] || '';
        const urlParams = new URLSearchParams(hashQuery);
        const queryPreset = urlParams.get('preset');

        const targetItem =
          (queryPreset && mf.presets.find((p) => p.id === queryPreset)) ||
          (selectedPresetId && mf.presets.find((p) => p.id === selectedPresetId)) ||
          mf.presets.find((p) => p.shorthand?.startsWith('110111') && p.killed) ||
          mf.presets.find((p) => p.engine === 'sun344') ||
          mf.presets[0];

        if (targetItem) {
          await selectAndLoadPreset(targetItem, cat, forceRefresh);
        } else {
          setLoadingPreset(false);
        }
      } catch (err) {
        setBootError(err instanceof Error ? err.message : String(err));
        setLoadingPreset(false);
      }
    },
    [onSpecVersionLoaded, selectAndLoadPreset, selectedPresetId],
  );

  useEffect(() => {
    void bootstrapAllData(false);
    initSimWasm()
      .then((st) => setWasmStatus(st))
      .catch(() => {
        // WASM 尚未就绪时静默保留静态浏览态
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当前选中预设的索引项
  const currentPresetMeta = useMemo(
    () => manifest?.presets.find((p) => p.id === selectedPresetId) ?? null,
    [manifest, selectedPresetId],
  );

  // 当前生效规格版本号（优先采用热更新激活态 manifest.version，再回退 spec.version 与基准号）
  const activeSpecVersion = useMemo(() => {
    const specV = (sunSpecObj as { version?: string } | null)?.version;
    if (manifest?.releaseId && manifest.releaseId !== 'bundled' && manifest.version) {
      return manifest.version;
    }
    if (manifest?.version && manifest.version !== '3.4.5_r20699967') {
      return manifest.version;
    }
    return specV || manifest?.version || resultData?.version || '3.4.5_r20699967';
  }, [sunSpecObj, manifest, resultData]);

  useEffect(() => {
    onSpecVersionLoaded?.(activeSpecVersion);
  }, [activeSpecVersion, onSpecVersionLoaded]);

  // 归一化视图数据
  const normalizedView = useMemo(
    () =>
      resultData ? normalizeSimResult(resultData, currentPresetMeta, overview) : null,
    [resultData, currentPresetMeta, overview],
  );

  // 按引擎过滤并按 Boss 分组的预设列表
  const groupedPresets = useMemo(() => {
    const list = (manifest?.presets || []).filter((p) => p.engine === engine);
    const groups = new Map<string, PresetIndexItem[]>();
    for (const item of list) {
      const gKey = item.bossName || '默认分组';
      const arr = groups.get(gKey) || [];
      arr.push(item);
      groups.set(gKey, arr);
    }
    return Array.from(groups.entries());
  }, [manifest, engine]);

  // 切换引擎 Tab
  const handleSwitchEngine = (nextEngine: SimEngine) => {
    if (nextEngine === engine) return;
    setEngine(nextEngine);
    const firstOfEngine = manifest?.presets.find((p) => p.engine === nextEngine);
    if (firstOfEngine) {
      void selectAndLoadPreset(firstOfEngine);
    }
  };

  // 点击阶梯图柱子按 presetId / presetPath 秒载排轴
  const handleLoadPresetByIdOrPath = useCallback(
    async (presetId?: string, presetPath?: string) => {
      if (manifest) {
        const hit = manifest.presets.find(
          (p) => (presetId && p.id === presetId) || (presetPath && p.path === presetPath),
        );
        if (hit) {
          await selectAndLoadPreset(hit);
          showToast(`已切换预设 [${hit.title}] (${hit.rhythmTag})`);
          return;
        }
      }
      if (presetPath) {
        setLoadingPreset(true);
        try {
          const loaded = await loadPresetResult(presetPath);
          setResultData(loaded);
          setReplayMs(null);
          showToast(`⚡ 已加载排轴 ${presetPath}`);
        } catch (err) {
          showToast(`⚠️ 载入失败: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          setLoadingPreset(false);
        }
      }
    },
    [manifest, selectAndLoadPreset, showToast],
  );

  // 组装挽昼专核装备微调覆盖
  const buildSunGearOverrides = (): SunSquadGearOverrides | undefined => {
    const mk = (g: { wEngine: string; disc4: string; disc2: string }) => {
      if (!g.wEngine && !g.disc4 && !g.disc2) return undefined;
      return {
        wEngine: g.wEngine || null,
        disc4: g.disc4 || null,
        disc2: g.disc2 || null,
      };
    };
    const s = mk(sunGear.sun);
    const r = mk(sunGear.roxy);
    const b = mk(sunGear.robin);
    if (!s && !r && !b) return undefined;
    return { sun: s, roxy: r, robin: b };
  };

  // ⚡ 毫秒重算当前轴 (WASM Replay)
  const handleInstantReplay = async () => {
    if (!resultData?.macros?.length) {
      showToast('当前尚无动作序列可重算，请点击「🔍 搜索排轴」');
      return;
    }
    setReplaying(true);
    setBootError(null);
    const t0 = performance.now();
    try {
      const st = await initSimWasm();
      setWasmStatus(st);

      let nextRes: SearchResultData;
      if (engine === 'sun344') {
        nextRes = await replaySun344({
          macros: resultData.macros,
          specJson: sunSpecObj ?? undefined,
          sunM: sunBuild.sunM,
          sunW: sunBuild.sunW,
          roxyM: sunBuild.roxyM,
          roxyW: sunBuild.roxyW,
          robinM: sunBuild.robinM,
          robinW: sunBuild.robinW,
          bossMode: sunBossMode,
          bossName: sunBossName,
          stageBuffId: sunStageBuffId,
          uncappedHp,
          gearOverrides: buildSunGearOverrides(),
        });
      } else {
        // 若用户已自由更改编队角色或卸除伴随 spec，走通用总线重算；若原宏与新编队不兼容则平滑回退 effort=0 极速搜轴
        let companionSpec: string | undefined;
        if (uniCompanionSpecPath) {
          companionSpec = await loadPresetCompanionSpecRaw(uniCompanionSpecPath).catch(
            () => undefined,
          );
        }
        try {
          nextRes = await replayUni344({
            macros: resultData.macros,
            specJson: companionSpec,
            agents: uniAgents,
            bangboo: uniBangboo,
            boss: uniBossId,
            stageBuffId: uniWeatherId,
            m: uniM,
            w: uniW,
            weapons: [
              uniWeapons[0] || null,
              uniWeapons[1] || null,
              uniWeapons[2] || null,
            ],
            disc4: [uniDisc4[0] || null, uniDisc4[1] || null, uniDisc4[2] || null],
            disc2: [uniDisc2[0] || null, uniDisc2[1] || null, uniDisc2[2] || null],
            uncappedHp,
          });
        } catch {
          const fallbackSearch = searchUni344({
            effort: 0,
            agents: uniAgents,
            bangboo: uniBangboo,
            boss: uniBossId,
            stageBuffId: uniWeatherId,
            m: uniM,
            w: uniW,
            weapons: [
              uniWeapons[0] || null,
              uniWeapons[1] || null,
              uniWeapons[2] || null,
            ],
            disc4: [uniDisc4[0] || null, uniDisc4[1] || null, uniDisc4[2] || null],
            disc2: [uniDisc2[0] || null, uniDisc2[1] || null, uniDisc2[2] || null],
            uncappedHp,
          });
          nextRes = await fallbackSearch.promise;
        }
      }

      const elapsed = performance.now() - t0;
      setReplayMs(elapsed);
      setResultData(nextRes);
      setSelectedPresetId('__custom__');
      showToast(`⚡ WASM 毫秒重算完成 (${elapsed.toFixed(1)} ms)`);
    } catch (err) {
      setBootError(`WASM 重算失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setReplaying(false);
    }
  };

  // 🔍 浏览器本地重搜最优轴 (WASM Search in Web Worker)
  const handleRunLocalSearch = async () => {
    setSearching(true);
    setSearchStage('正在唤醒后台 Web Worker 搜索线程池…');
    setSearchPct(5);
    setBootError(null);
    const t0 = performance.now();

    try {
      const st = await initSimWasm();
      setWasmStatus(st);

      if (engine === 'sun344') {
        const handle = searchSun344(
          {
            effort,
            specJson: sunSpecObj ?? undefined,
            sunM: sunBuild.sunM,
            sunW: sunBuild.sunW,
            roxyM: sunBuild.roxyM,
            roxyW: sunBuild.roxyW,
            robinM: sunBuild.robinM,
            robinW: sunBuild.robinW,
            bossMode: sunBossMode,
            bossName: sunBossName,
            stageBuffId: sunStageBuffId,
            uncappedHp,
            gearOverrides: buildSunGearOverrides(),
            seedMacros: resultData?.macros,
          },
          (stage, pct) => {
            setSearchStage(stage);
            if (typeof pct === 'number') setSearchPct(pct);
          },
        );
        cancelSearchRef.current = handle.cancel;
        const searched = await handle.promise;
        setResultData(searched);
        setSelectedPresetId('__custom__');
        setReplayMs(performance.now() - t0);
        showToast(
          `🎯 本地搜轴收敛！节奏 ${searched.rhythm_tag || `${searched.stun_count}失衡`} · 耗时 ${((performance.now() - t0) / 1000).toFixed(2)}s`,
        );
      } else {
        let companionSpec: string | undefined;
        if (uniCompanionSpecPath) {
          companionSpec = await loadPresetCompanionSpecRaw(uniCompanionSpecPath).catch(
            () => undefined,
          );
        }
        const handle = searchUni344(
          {
            effort,
            specJson: companionSpec,
            agents: uniAgents,
            bangboo: uniBangboo,
            boss: uniBossId,
            stageBuffId: uniWeatherId,
            m: uniM,
            w: uniW,
            weapons: [
              uniWeapons[0] || null,
              uniWeapons[1] || null,
              uniWeapons[2] || null,
            ],
            disc4: [uniDisc4[0] || null, uniDisc4[1] || null, uniDisc4[2] || null],
            disc2: [uniDisc2[0] || null, uniDisc2[1] || null, uniDisc2[2] || null],
            uncappedHp,
          },
          (stage, pct) => {
            setSearchStage(stage);
            if (typeof pct === 'number') setSearchPct(pct);
          },
        );
        cancelSearchRef.current = handle.cancel;
        const searched = await handle.promise;
        setResultData(searched);
        setSelectedPresetId('__custom__');
        setReplayMs(performance.now() - t0);
        showToast(
          `🎯 自由编队搜轴完成！节奏 ${searched.rhythm_tag || `${searched.stun_count}失衡`} · 耗时 ${((performance.now() - t0) / 1000).toFixed(2)}s`,
        );
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        showToast('⏹ 已中止后台搜轴任务，主界面保持原排轴不变');
      } else {
        setBootError(`本地搜轴失败: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      cancelSearchRef.current = null;
      setSearching(false);
    }
  };

  const handleCancelSearch = () => {
    cancelSearchRef.current?.();
  };

  // 🔬 从运维台工单池一键载入模拟器复现
  const handleReproduceReport = async (rep: AnomalyReportRecord) => {
    onCloseOps();
    const snap = rep.snapshot || {};
    const targetEngine: SimEngine = snap.engine || rep.engine || 'sun344';
    setEngine(targetEngine);

    if (rep.presetId && manifest) {
      const p = manifest.presets.find((x) => x.id === rep.presetId);
      if (p) {
        await selectAndLoadPreset(p);
      }
    }

    if (Array.isArray(snap.macros) && snap.macros.length > 0) {
      try {
        await initSimWasm();
        if (targetEngine === 'sun344') {
          const b = (snap.build || {}) as Record<string, number>;
          const nextBuild = {
            sunM: b.sunM ?? b.sun_m ?? sunBuild.sunM,
            sunW: b.sunW ?? b.sun_w ?? sunBuild.sunW,
            roxyM: b.roxyM ?? b.roxy_m ?? sunBuild.roxyM,
            roxyW: b.roxyW ?? b.roxy_w ?? sunBuild.roxyW,
            robinM: b.robinM ?? b.robin_m ?? sunBuild.robinM,
            robinW: b.robinW ?? b.robin_w ?? sunBuild.robinW,
          };
          setSunBuild(nextBuild);
          const replayed = await replaySun344({
            macros: snap.macros,
            specJson: sunSpecObj ?? undefined,
            ...nextBuild,
            bossMode: snap.bossMode || sunBossMode,
            stageBuffId: snap.stageBuffId ?? sunStageBuffId,
          });
          setResultData(replayed);
        } else {
          const b = (snap.build || {}) as Record<string, unknown>;
          const replayed = await replayUni344({
            macros: snap.macros,
            agents: (b.agents as [string, string, string]) || uniAgents,
            boss: snap.bossId ?? uniBossId,
            stageBuffId: snap.stageBuffId ?? uniWeatherId,
          });
          setResultData(replayed);
        }
      } catch {
        // 若 WASM 暂不可用，保持刚载入的预设结果做定位复核
      }
    }

    if (rep.stepIdx != null && rep.stepIdx >= 0) {
      setInspectedStepIdx(rep.stepIdx);
    }
    showToast(
      `🔬 已还原反馈工单 #${rep.id.slice(0, 8)} 排轴现场${
        rep.stepIdx != null ? ` 并定位至第 #${rep.stepIdx + 1} 步` : ''
      }`,
    );
  };

  // 当前配装快照（供异常反馈上报携带）
  const currentBuildSnapshot = useMemo<Record<string, unknown>>(
    () =>
      engine === 'sun344'
        ? {
            ...sunBuild,
            bossMode: sunBossMode,
            bossName: sunBossName,
            stageBuffId: sunStageBuffId,
            uncappedHp,
            gearOverrides: buildSunGearOverrides(),
          }
        : {
            agents: uniAgents,
            m: uniM,
            w: uniW,
            weapons: uniWeapons,
            disc4: uniDisc4,
            disc2: uniDisc2,
            bangboo: uniBangboo,
            bossId: uniBossId,
            weatherId: uniWeatherId,
            uncappedHp,
          },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      engine,
      sunBuild,
      sunBossMode,
      sunBossName,
      sunStageBuffId,
      uncappedHp,
      sunGear,
      uniAgents,
      uniM,
      uniW,
      uniWeapons,
      uniDisc4,
      uniDisc2,
      uniBangboo,
      uniBossId,
      uniWeatherId,
    ],
  );

  void wasmStatus;

  return (
    <div className={styles.simRoot} id="sim-workspace-root">
      {/* 顶部双引擎控制与实时配装微调台 */}
      <section className={styles.glassCard}>
        <div className={styles.engineTopBar}>
          <div className={styles.engineSwitchTabs}>
            <button
              type="button"
              id="tab-engine-sun344"
              className={`${styles.engineTabBtn} ${
                engine === 'sun344' ? styles.engineTabBtnActive : ''
              }`}
              onClick={() => handleSwitchEngine('sun344')}
            >
              <span>🔥 挽昼配队</span>
              <span className={styles.engineTagPill}>挽昼 + 洛克茜 + 知更鸟</span>
            </button>

            <button
              type="button"
              id="tab-engine-uni344"
              className={`${styles.engineTabBtn} ${
                engine === 'uni344' ? styles.engineTabBtnActive : ''
              }`}
              onClick={() => handleSwitchEngine('uni344')}
            >
              <span>🌐 全角色自由编队</span>
              <span className={styles.engineTagPill}>
                {catalog
                  ? `${catalog.counts.agents}人/${catalog.counts.wEngines}武/${catalog.counts.driveDiscs}盘`
                  : '65人/106音擎/32盘/33靶标'}
              </span>
            </button>
          </div>

          <div className={styles.runtimeStatusRow}>
            <span
              id="sim-spec-version-badge"
              className={`${styles.statusBadge} ${styles.statusBadgeGood}`}
            >
              数据版本: {activeSpecVersion.replace(/_r\d+$/, '')}
            </span>
          </div>
        </div>

        {/* 预设选择器 + 靶标/天气栏 */}
        <div className={styles.presetBar}>
          <div className={styles.fieldCol}>
            <label className={styles.fieldLabel} htmlFor="sim-preset-select">
              <span>
                参考排轴预设 ({manifest?.counts.totalPresets ?? 112} 条)
              </span>
            </label>
            <select
              id="sim-preset-select"
              className={styles.simSelect}
              value={selectedPresetId}
              onChange={(e) => {
                const hit = manifest?.presets.find((p) => p.id === e.target.value);
                if (hit) void selectAndLoadPreset(hit);
              }}
            >
              {selectedPresetId === '__custom__' && normalizedView && (
                <option value="__custom__">
                  [当前结果 · {normalizedView.rhythmTag}] {normalizedView.shorthand} —{' '}
                  {normalizedView.killed && normalizedView.killTimeS
                    ? `${normalizedView.killTimeS.toFixed(2)}s 斩杀`
                    : `${(normalizedView.totalDmg / 1e8).toFixed(3)}亿`}
                </option>
              )}
              {groupedPresets.map(([groupTitle, items]) => (
                <optgroup key={groupTitle} label={groupTitle}>
                  {items.map((it) => {
                    const summarySuffix =
                      it.killed && it.killTimeS
                        ? `${it.killTimeS.toFixed(2)}s 斩杀`
                        : `${(it.totalDmg / 1e8).toFixed(3)}亿`;
                    const hasInlineMetric =
                      it.title.includes('斩杀') || it.title.includes('亿');
                    return (
                      <option key={it.id} value={it.id}>
                        [{it.limitedGold}金 · {it.rhythmTag}] {it.title}
                        {hasInlineMetric ? '' : ` — ${summarySuffix}`}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>

          {engine === 'sun344' ? (
            <div className={styles.fieldCol}>
              <label className={styles.fieldLabel} htmlFor="sun-weather-select">
                <span>🌦️ 危局天气 / 场地增益</span>
              </label>
              <select
                id="sun-weather-select"
                className={styles.simSelect}
                value={sunStageBuffId}
                onChange={(e) => setSunStageBuffId(Number(e.target.value))}
              >
                {SUN_STAGE_BUFFS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.fieldCol}>
              <label className={styles.fieldLabel} htmlFor="uni-boss-select">
                <span>👹 实战靶标 (32 危局首领 + 训练场木桩)</span>
              </label>
              <select
                id="uni-boss-select"
                className={styles.simSelect}
                value={uniBossId}
                onChange={(e) => {
                  setUniCompanionSpecPath(null);
                  setUniBossId(e.target.value);
                }}
              >
                {(catalog?.bosses || []).map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    [{b.id}] {b.nameCn} (防{b.baseDefLv70} / 失衡{b.stunDurationS}s / 易伤
                    {Math.round(b.nativeStunVulnMult * 100)}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.fieldCol}>
            <span className={styles.fieldLabel}>斩杀上限策略</span>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 38,
                padding: '0 12px',
                borderRadius: 10,
                background: 'rgba(8,8,12,0.9)',
                border: '1px solid rgba(255,255,255,0.14)',
                fontSize: '0.78rem',
                color: '#e4e4e7',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <input
                type="checkbox"
                checked={uncappedHp}
                onChange={(e) => setUncappedHp(e.target.checked)}
              />
              <span>无上限测满 180s</span>
            </label>
          </div>
        </div>

        {/* 三名角色命座 / 精炼 / 音擎 / 4+2 驱动盘微调卡片 */}
        {engine === 'sun344' ? (
          <>
            <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.62)' }}>
                首领动作锚点模式:
              </span>
              {SUN_BOSS_MODES.map((bm) => (
                <button
                  key={bm.key}
                  type="button"
                  className={`${styles.miniRankBtn} ${
                    sunBossMode === bm.key ? styles.miniRankBtnActive : ''
                  }`}
                  onClick={() => {
                    setSunBossMode(bm.key);
                    setSunBossName(bm.bossName);
                  }}
                >
                  {bm.label}
                </button>
              ))}
            </div>

            <div className={styles.squadBuildGrid}>
              {(
                [
                  {
                    key: 'sun',
                    slotTitle: '01 主C · 锋御',
                    name: '🔥 挽昼',
                    defaultDisc4: '34300',
                    defaultDisc4Name: '星之碑',
                    defaultDisc2: '34200',
                    defaultDisc2Name: '荆棘玫瑰',
                    mVal: sunBuild.sunM,
                    wVal: sunBuild.sunW,
                    setM: (v: number) => setSunBuild((p) => ({ ...p, sunM: v })),
                    setW: (v: number) => setSunBuild((p) => ({ ...p, sunW: v })),
                  },
                  {
                    key: 'roxy',
                    slotTitle: '02 击破 · 风眼',
                    name: '🌪️ 洛克茜',
                    defaultDisc4: '34400',
                    defaultDisc4Name: '赤翼夜曲',
                    defaultDisc2: '31600',
                    defaultDisc2Name: '摇摆爵士',
                    mVal: sunBuild.roxyM,
                    wVal: sunBuild.roxyW,
                    setM: (v: number) => setSunBuild((p) => ({ ...p, roxyM: v })),
                    setW: (v: number) => setSunBuild((p) => ({ ...p, roxyW: v })),
                  },
                  {
                    key: 'robin',
                    slotTitle: '03 防护 · 护盾拐',
                    name: '🎵 知更鸟',
                    defaultDisc4: '33700',
                    defaultDisc4Name: '雪兔梦游仙境',
                    defaultDisc2: '31600',
                    defaultDisc2Name: '摇摆爵士',
                    mVal: sunBuild.robinM,
                    wVal: sunBuild.robinW,
                    setM: (v: number) => setSunBuild((p) => ({ ...p, robinM: v })),
                    setW: (v: number) => setSunBuild((p) => ({ ...p, robinW: v })),
                  },
                ] as const
              ).map((slot) => {
                const g = sunGear[slot.key];
                const discList = catalog?.driveDiscs || [];
                const activeD4 = g.disc4 || slot.defaultDisc4;
                const activeD2 = g.disc2 || slot.defaultDisc2;
                return (
                  <div key={slot.key} className={styles.slotBuildCard}>
                    <div className={styles.slotBuildHeader}>
                      <span className={styles.slotAgentName}>{slot.name}</span>
                      <span className={styles.slotBadge}>{slot.slotTitle}</span>
                    </div>

                    <div className={styles.miniPillRow}>
                      {[0, 1, 2, 3, 4, 5, 6].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={`${styles.miniRankBtn} ${
                            slot.mVal === m ? styles.miniRankBtnActive : ''
                          }`}
                          onClick={() => slot.setM(m)}
                        >
                          M{m}
                        </button>
                      ))}
                    </div>

                    <div className={styles.miniPillRow}>
                      {[0, 1, 2, 3, 4, 5].map((w) => (
                        <button
                          key={w}
                          type="button"
                          className={`${styles.miniRankBtn} ${
                            slot.wVal === w ? styles.miniRankBtnActive : ''
                          }`}
                          onClick={() => slot.setW(w)}
                          title={w === 0 ? '免费A级下位音擎满精 R5 (0金)' : `专属/选定S音擎 R${w}`}
                        >
                          {w === 0 ? '下位R5' : `专R${w}`}
                        </button>
                      ))}
                    </div>

                    <div className={styles.slotTwoCol}>
                      <select
                        className={styles.simSelect}
                        style={{ height: 32, fontSize: '0.75rem' }}
                        value={activeD4}
                        aria-label={`${slot.name} 4件套驱动盘`}
                        onChange={(e) => {
                          const nextVal =
                            e.target.value === slot.defaultDisc4 ? '' : e.target.value;
                          setSunGear((prev) => ({
                            ...prev,
                            [slot.key]: { ...prev[slot.key], disc4: nextVal },
                          }));
                        }}
                      >
                        {discList.length === 0 ? (
                          <option value={slot.defaultDisc4}>
                            4件: {slot.defaultDisc4Name} (默认)
                          </option>
                        ) : (
                          discList.map((d) => {
                            const isDef = String(d.id) === slot.defaultDisc4;
                            return (
                              <option key={d.id} value={String(d.id)}>
                                4件: {d.nameCn}
                                {isDef ? ' (默认)' : ''}
                              </option>
                            );
                          })
                        )}
                      </select>

                      <select
                        className={styles.simSelect}
                        style={{ height: 32, fontSize: '0.75rem' }}
                        value={activeD2}
                        aria-label={`${slot.name} 2件套驱动盘`}
                        onChange={(e) => {
                          const nextVal =
                            e.target.value === slot.defaultDisc2 ? '' : e.target.value;
                          setSunGear((prev) => ({
                            ...prev,
                            [slot.key]: { ...prev[slot.key], disc2: nextVal },
                          }));
                        }}
                      >
                        {discList.length === 0 ? (
                          <option value={slot.defaultDisc2}>
                            2件: {slot.defaultDisc2Name} (默认)
                          </option>
                        ) : (
                          discList.map((d) => {
                            const isDef = String(d.id) === slot.defaultDisc2;
                            return (
                              <option key={d.id} value={String(d.id)}>
                                2件: {d.nameCn}
                                {isDef ? ' (默认)' : ''}
                              </option>
                            );
                          })
                        )}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* 全角色自由编队选人 / 音擎 / 4+2 盘 / 邦布 / 天气 */}
            <div className={styles.slotTwoCol} style={{ marginBottom: 12 }}>
              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="uni-bangboo-select">
                  🐾 出战邦布 (43 只全收录)
                </label>
                <select
                  id="uni-bangboo-select"
                  className={styles.simSelect}
                  value={uniBangboo}
                  onChange={(e) => {
                    setUniCompanionSpecPath(null);
                    setUniBangboo(e.target.value);
                  }}
                >
                  <option value="auto">🤖 自动匹配最优阵营/属性 S 级邦布</option>
                  {(catalog?.bangboos || []).map((bb) => (
                    <option key={bb.id} value={String(bb.id)}>
                      {bb.nameCn} ({String(bb.rarity) === 'S' || Number(bb.rarity) >= 4 ? 'S' : 'A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldCol}>
                <label className={styles.fieldLabel} htmlFor="uni-weather-select">
                  🌦️ 危局可选天气 Buff (99 种全收录)
                </label>
                <select
                  id="uni-weather-select"
                  className={styles.simSelect}
                  value={uniWeatherId}
                  onChange={(e) => setUniWeatherId(Number(e.target.value))}
                >
                  <option value={0}>无额外天气 Buff</option>
                  {(catalog?.weatherBuffs || []).map((wb) => (
                    <option key={wb.id} value={wb.id}>
                      [{wb.id}] {wb.titleCn} — {wb.descCn.slice(0, 34)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.squadBuildGrid}>
              {([0, 1, 2] as const).map((slotIdx) => {
                const activeAg = (catalog?.agents || []).find(
                  (a) => String(a.id) === uniAgents[slotIdx],
                );
                const defGear = resolveUniAgentDefaultGear(activeAg);
                const activeWpnVal = uniWeapons[slotIdx] || defGear.wEngineId;
                const activeD4Val = uniDisc4[slotIdx] || defGear.disc4Id;
                const activeD2Val = uniDisc2[slotIdx] || defGear.disc2Id;

                return (
                  <div key={slotIdx} className={styles.slotBuildCard}>
                    <div className={styles.slotBuildHeader}>
                      <span className={styles.slotBadge}>槽位 #{slotIdx + 1}</span>
                      <select
                        className={styles.simSelect}
                        style={{ height: 32, flex: 1, fontWeight: 700 }}
                        value={uniAgents[slotIdx]}
                        aria-label={`槽位 ${slotIdx + 1} 代理人`}
                        onChange={(e) => {
                          setUniCompanionSpecPath(null);
                          const nextAgId = e.target.value;
                          setUniAgents((prev) => {
                            const next = [...prev] as [string, string, string];
                            next[slotIdx] = nextAgId;
                            return next;
                          });
                          setUniWeapons((prev) => {
                            const next = [...prev] as [string, string, string];
                            next[slotIdx] = '';
                            return next;
                          });
                          setUniDisc4((prev) => {
                            const next = [...prev] as [string, string, string];
                            next[slotIdx] = '';
                            return next;
                          });
                          setUniDisc2((prev) => {
                            const next = [...prev] as [string, string, string];
                            next[slotIdx] = '';
                            return next;
                          });
                        }}
                      >
                        {(catalog?.agents || []).map((ag) => (
                          <option key={ag.id} value={String(ag.id)}>
                            {ag.nameCn} ({ag.elementCn}·{ag.specialtyCn})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.miniPillRow}>
                      {[0, 1, 2, 3, 4, 5, 6].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={`${styles.miniRankBtn} ${
                            uniM[slotIdx] === m ? styles.miniRankBtnActive : ''
                          }`}
                          onClick={() => {
                            setUniM((prev) => {
                              const next = [...prev] as [number, number, number];
                              next[slotIdx] = m;
                              return next;
                            });
                          }}
                        >
                          M{m}
                        </button>
                      ))}
                    </div>

                    <div className={styles.slotTwoCol}>
                      <select
                        className={styles.simSelect}
                        style={{ height: 32, fontSize: '0.74rem' }}
                        value={activeWpnVal}
                        aria-label={`槽位 ${slotIdx + 1} 音擎`}
                        onChange={(e) => {
                          setUniCompanionSpecPath(null);
                          const val = e.target.value === defGear.wEngineId ? '' : e.target.value;
                          setUniWeapons((prev) => {
                            const next = [...prev] as [string, string, string];
                            next[slotIdx] = val;
                            return next;
                          });
                        }}
                      >
                        {(catalog?.wEngines || []).map((wp) => {
                          const isDef = String(wp.id) === defGear.wEngineId;
                          return (
                            <option key={wp.id} value={String(wp.id)}>
                              {wp.nameCn} ({wp.specialtyCn}){isDef ? ' · 默认' : ''}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        className={styles.simSelect}
                        style={{ height: 32, fontSize: '0.74rem' }}
                        value={uniW[slotIdx]}
                        aria-label={`槽位 ${slotIdx + 1} 音擎阶数`}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setUniW((prev) => {
                            const next = [...prev] as [number, number, number];
                            next[slotIdx] = v;
                            return next;
                          });
                        }}
                      >
                        <option value={0}>免费A级满精 (W0)</option>
                        {[1, 2, 3, 4, 5].map((r) => (
                          <option key={r} value={r}>
                            精炼 R{r}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.slotTwoCol}>
                      <select
                        className={styles.simSelect}
                        style={{ height: 32, fontSize: '0.74rem' }}
                        value={activeD4Val}
                        aria-label={`槽位 ${slotIdx + 1} 4件套`}
                        onChange={(e) => {
                          setUniCompanionSpecPath(null);
                          const val = e.target.value === defGear.disc4Id ? '' : e.target.value;
                          setUniDisc4((prev) => {
                            const next = [...prev] as [string, string, string];
                            next[slotIdx] = val;
                            return next;
                          });
                        }}
                      >
                        {(catalog?.driveDiscs || []).map((d) => {
                          const isDef = String(d.id) === defGear.disc4Id;
                          return (
                            <option key={d.id} value={String(d.id)}>
                              4件: {d.nameCn}
                              {isDef ? ' (默认)' : ''}
                            </option>
                          );
                        })}
                      </select>

                      <select
                        className={styles.simSelect}
                        style={{ height: 32, fontSize: '0.74rem' }}
                        value={activeD2Val}
                        aria-label={`槽位 ${slotIdx + 1} 2件套`}
                        onChange={(e) => {
                          setUniCompanionSpecPath(null);
                          const val = e.target.value === defGear.disc2Id ? '' : e.target.value;
                          setUniDisc2((prev) => {
                            const next = [...prev] as [string, string, string];
                            next[slotIdx] = val;
                            return next;
                          });
                        }}
                      >
                        {(catalog?.driveDiscs || []).map((d) => {
                          const isDef = String(d.id) === defGear.disc2Id;
                          return (
                            <option key={d.id} value={String(d.id)}>
                              2件: {d.nameCn}
                              {isDef ? ' (默认)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* 重算与本地搜轴主动作栏 */}
        <div className={styles.actionControlBar}>
          <div className={styles.primaryBtnGroup}>
            <button
              type="button"
              id="btn-wasm-replay"
              className={styles.btnNeonPink}
              disabled={replaying || searching || !resultData}
              onClick={() => void handleInstantReplay()}
            >
              <span>{replaying ? '⏳ 重算中...' : '⚡ 重算当前轴'}</span>
            </button>

            <button
              type="button"
              id="btn-wasm-search"
              className={styles.btnNeonCyan}
              disabled={searching || replaying}
              onClick={() => void handleRunLocalSearch()}
            >
              <span>🔍 搜索排轴 (档位 {effort})</span>
            </button>

            {searching && (
              <button
                type="button"
                id="btn-cancel-search"
                className={styles.btnDanger}
                onClick={handleCancelSearch}
              >
                ⏹ 取消搜索
              </button>
            )}
          </div>

          <div className={styles.zoomBtnGroup}>
            <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.62)' }}>
              搜索档位:
            </span>
            {[0, 1].map((ef) => (
              <button
                key={ef}
                type="button"
                data-effort={ef}
                className={`${styles.miniRankBtn} ${
                  effort === ef ? styles.miniRankBtnActive : ''
                }`}
                onClick={() => setEffort(ef)}
              >
                {ef === 0 ? '0 快速' : '1 标准'}
              </button>
            ))}
            {showAdvEffort ? (
              [2, 3].map((ef) => (
                <button
                  key={ef}
                  type="button"
                  data-effort={ef}
                  className={`${styles.miniRankBtn} ${
                    effort === ef ? styles.miniRankBtnActive : ''
                  }`}
                  onClick={() => setEffort(ef)}
                >
                  {ef === 2 ? '2 精细' : '3 深度'}
                </button>
              ))
            ) : (
              <button
                type="button"
                className={styles.miniRankBtn}
                onClick={() => setShowAdvEffort(true)}
              >
                更多档位 ▸
              </button>
            )}
          </div>
        </div>

        {/* 本地搜轴实时进度与防息屏提示横幅 */}
        {searching && (
          <div className={styles.searchProgressBanner} id="sim-search-progress">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                🔄 {searchStage || '正在搜索排轴…'}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#7dd3fc' }}>
                ⏱️ 已用时 {searchElapsedS.toFixed(1)}s · 搜索期间请保持页面开启
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.max(8, Math.min(100, searchPct))}%` }}
              />
            </div>
          </div>
        )}

        {bootError && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(255, 51, 85, 0.15)',
              border: '1px solid rgba(255, 51, 85, 0.45)',
              color: '#fda4af',
              fontSize: '0.8rem',
            }}
          >
            ⚠️ {bootError}
          </div>
        )}
      </section>

      {/* 结果可视化主区域 */}
      {loadingPreset && !normalizedView ? (
        <div className={styles.glassCard} style={{ textAlign: 'center', padding: 48, color: '#a1a1aa' }}>
          正在加载排轴数据…
        </div>
      ) : normalizedView && resultData ? (
        <>
          {/* ① 核心指标英雄卡 KPI Hero Row */}
          <KpiHeroRow
            view={normalizedView}
            replayMs={replayMs}
            onOpenReport={(step) => {
              setReportStepIdx(step ?? null);
              setReportModalOpen(true);
            }}
          />

          {/* ② 交互式多轨战斗泳道时间轴 (点击滑出单招 15 乘区透视抽屉) */}
          <SwimlaneTimeline
            view={normalizedView}
            selectedRowIdx={inspectedStepIdx}
            onSelectStep={(idx) => setInspectedStepIdx(idx)}
          />

          {/* ③ 四大交互式可视化图表 */}
          <VisualChartsGrid
            view={normalizedView}
            overview={overview}
            presets={manifest?.presets || []}
            onLoadPresetByIdOrPath={(pid, ppath) => {
              void handleLoadPresetByIdOrPath(pid, ppath);
            }}
          />

          {/* 折叠式精简宏动作流 & JSON 导入导出 */}
          <ActionStreamCollapse
            data={resultData}
            onSelectStep={(idx) => setInspectedStepIdx(idx)}
            onImportResultJson={(imported) => {
              setResultData(imported);
              setReplayMs(null);
            }}
            onToast={showToast}
          />
        </>
      ) : null}

      {/* 页脚反馈与维护者热更新入口 */}
      <footer className={styles.simFooterBar} style={{ justifyContent: 'flex-end' }}>
        <div className={styles.zoomBtnGroup}>
          <button
            type="button"
            className={styles.opsMiniTrigger}
            onClick={() => {
              setReportStepIdx(null);
              setReportModalOpen(true);
            }}
          >
            🚩 数据异常反馈
          </button>
          <button
            type="button"
            id="footer-open-ops"
            className={styles.opsMiniTrigger}
            onClick={onOpenOps}
          >
            🛠️ 运维热更 (#/ops)
          </button>
        </div>
      </footer>

      {/* 单招 15 乘区快照与机制透视抽屉 */}
      <StepInspectorDrawer
        stepIdx={inspectedStepIdx}
        data={resultData}
        view={normalizedView}
        sunSpecObj={sunSpecObj}
        onClose={() => setInspectedStepIdx(null)}
        onNavigateStep={(nextIdx) => setInspectedStepIdx(nextIdx)}
        onReportStep={(idx) => {
          setReportStepIdx(idx);
          setReportModalOpen(true);
        }}
      />

      {/* 运维入口 #1：公网用户超轻量异常反馈浮层 */}
      <AnomalyReportPopover
        open={reportModalOpen}
        stepIdx={reportStepIdx}
        engine={engine}
        specVersion={activeSpecVersion}
        presetId={selectedPresetId || null}
        buildSnapshot={currentBuildSnapshot}
        resultData={resultData}
        view={normalizedView}
        onClose={() => setReportModalOpen(false)}
        onSuccessToast={showToast}
      />

      {/* 运维入口 #2：管理员 #/ops 工单池与纯倍率热更新发布抽屉 */}
      <OpsDrawer
        open={opsOpen}
        currentSpecVersion={activeSpecVersion}
        onClose={onCloseOps}
        onReproduceReport={(rep) => void handleReproduceReport(rep)}
        onHotReloadSpecs={() => bootstrapAllData(true)}
        onToast={showToast}
      />

      {/* 轻量底部 Toast 通知 */}
      {toastMsg && (
        <div className={styles.toastBanner} role="status">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
