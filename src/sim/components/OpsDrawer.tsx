// src/sim/components/OpsDrawer.tsx
// 运维入口 #2：面向维护者的 #/ops「🛠️ 运维热更」抽屉
// 页签 1：用户反馈工单池（按状态筛选、结单备注、🔬 一键载入模拟器复现）
// 页签 2：纯倍率/预设热更新发布台（上传/粘贴 JSON + 版本 Diff 预览 + 一键热推 + 历史回滚）

import { useCallback, useEffect, useState } from 'react';
import styles from '../sim.module.css';
import {
  getActiveReleaseInfo,
  opsFetchReleases,
  opsFetchReports,
  opsPublishSpecUpdate,
  opsResolveReport,
  opsRollbackRelease,
} from '../dataLoader';
import type {
  AnomalyReportRecord,
  AnomalyReportStatus,
  SpecReleaseRecord,
} from '../types';
import { formatDamageCompact } from './simAdapter';

const OPS_TOKEN_SESSION_KEY = 'zzcal_ops_admin_token';

const TARGET_FILE_PRESETS = [
  'specs/sun_team_344_spec.json',
  'specs/universal_catalog_runtime.json',
  'specs/catalog_index.json',
  'benchmarks/sun344_overview.json',
  'manifest.json',
] as const;

export interface OpsDrawerProps {
  open: boolean;
  currentSpecVersion: string;
  onClose: () => void;
  onReproduceReport: (report: AnomalyReportRecord) => void;
  onHotReloadSpecs: () => Promise<void>;
  onToast: (msg: string) => void;
}

export function OpsDrawer({
  open,
  currentSpecVersion,
  onClose,
  onReproduceReport,
  onHotReloadSpecs,
  onToast,
}: OpsDrawerProps) {
  const [tokenInput, setTokenInput] = useState<string>(
    () => sessionStorage.getItem(OPS_TOKEN_SESSION_KEY) || '',
  );
  const [unlockedToken, setUnlockedToken] = useState<string>(
    () => sessionStorage.getItem(OPS_TOKEN_SESSION_KEY) || '',
  );
  const [activeTab, setActiveTab] = useState<'reports' | 'releases'>('reports');

  // 工单池状态
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reports, setReports] = useState<AnomalyReportRecord[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  // 热更新发布台状态
  const [releases, setReleases] = useState<SpecReleaseRecord[]>([]);
  const [loadingReleases, setLoadingReleases] = useState<boolean>(false);
  const [targetPath, setTargetPath] = useState<string>('specs/sun_team_344_spec.json');
  const [newVersion, setNewVersion] = useState<string>('3.4.5_hotfix_v2');
  const [releaseNote, setReleaseNote] = useState<string>('');
  const [jsonText, setJsonText] = useState<string>('');
  const [stagedFiles, setStagedFiles] = useState<
    Record<string, { parsed: unknown; byteLen: number; detectedVersion?: string }>
  >({});
  const [publishing, setPublishing] = useState<boolean>(false);
  const [opsError, setOpsError] = useState<string | null>(null);

  const refreshReports = useCallback(
    async (tok: string, filter = statusFilter) => {
      if (!tok.trim()) return;
      setLoadingReports(true);
      setOpsError(null);
      try {
        const list = await opsFetchReports(tok, filter);
        setReports(list);
      } catch (err) {
        setOpsError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoadingReports(false);
      }
    },
    [statusFilter],
  );

  const refreshReleases = useCallback(async (tok: string) => {
    if (!tok.trim()) return;
    setLoadingReleases(true);
    setOpsError(null);
    try {
      const list = await opsFetchReleases(tok);
      setReleases(list);
    } catch (err) {
      setOpsError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoadingReleases(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !unlockedToken) return;
    if (activeTab === 'reports') {
      void refreshReports(unlockedToken, statusFilter);
    } else {
      void refreshReleases(unlockedToken);
    }
  }, [open, unlockedToken, activeTab, statusFilter, refreshReports, refreshReleases]);

  if (!open) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) return;
    setOpsError(null);
    try {
      // 验证 Token 是否有效
      const list = await opsFetchReports(clean, 'all');
      sessionStorage.setItem(OPS_TOKEN_SESSION_KEY, clean);
      setUnlockedToken(clean);
      setReports(list);
      onToast('🔓 运维管理台已解锁');
    } catch (err) {
      setOpsError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleLogoutToken = () => {
    sessionStorage.removeItem(OPS_TOKEN_SESSION_KEY);
    setUnlockedToken('');
    setTokenInput('');
    setReports([]);
    setReleases([]);
  };

  const handleUpdateReportStatus = async (
    id: string,
    nextStatus: AnomalyReportStatus,
  ) => {
    setOpsError(null);
    try {
      await opsResolveReport(unlockedToken, id, nextStatus, noteDrafts[id]);
      onToast(`✅ 工单 #${id.slice(0, 8)} 已标记为 ${nextStatus}`);
      await refreshReports(unlockedToken, statusFilter);
    } catch (err) {
      setOpsError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleStageCurrentJson = () => {
    setOpsError(null);
    const cleanPath = targetPath.trim().replace(/^\/+/, '');
    if (!cleanPath) {
      setOpsError('请填写目标相对路径');
      return;
    }
    if (!jsonText.trim()) {
      setOpsError('请粘贴或选择 JSON 文件内容');
      return;
    }
    try {
      const parsed = JSON.parse(jsonText) as Record<string, unknown>;
      const detectedVersion = String(
        parsed.version ??
          (parsed.metadata as Record<string, unknown> | undefined)?.version ??
          '',
      );
      setStagedFiles((prev) => ({
        ...prev,
        [cleanPath]: {
          parsed,
          byteLen: new Blob([jsonText]).size,
          detectedVersion: detectedVersion || undefined,
        },
      }));
      if (detectedVersion) {
        setNewVersion(detectedVersion);
      }
      setJsonText('');
      onToast(`📦 已暂存文件 ${cleanPath} 到待发布清单`);
    } catch (err) {
      setOpsError(`JSON 语法校验失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
    // 根据文件名自动推断常用路径
    if (file.name === 'sun_team_344_spec.json') {
      setTargetPath('specs/sun_team_344_spec.json');
    } else if (file.name === 'universal_catalog_runtime.json') {
      setTargetPath('specs/universal_catalog_runtime.json');
    } else if (file.name === 'sun344_overview.json') {
      setTargetPath('benchmarks/sun344_overview.json');
    } else if (file.name === 'manifest.json') {
      setTargetPath('manifest.json');
    } else if (file.name.endsWith('.json')) {
      setTargetPath(`presets/sun344/${file.name}`);
    }
  };

  const handlePublishSpecs = async () => {
    setOpsError(null);
    const filesPayload: Record<string, unknown> = {};
    for (const [p, info] of Object.entries(stagedFiles)) {
      filesPayload[p] = info.parsed;
    }
    // 如果用户粘贴了 JSON 还没点暂存，直接一并校验纳入
    if (Object.keys(filesPayload).length === 0 && jsonText.trim()) {
      try {
        filesPayload[targetPath.trim().replace(/^\/+/, '')] = JSON.parse(jsonText);
      } catch (err) {
        setOpsError(`JSON 解析失败: ${err instanceof Error ? err.message : String(err)}`);
        return;
      }
    }
    if (Object.keys(filesPayload).length === 0) {
      setOpsError('请先上传或粘贴至少一个 JSON 规格/预设文件');
      return;
    }
    if (!newVersion.trim()) {
      setOpsError('请填写发布版本号');
      return;
    }

    setPublishing(true);
    try {
      const res = await opsPublishSpecUpdate(unlockedToken, {
        version: newVersion.trim(),
        note: releaseNote.trim() || `Web 运维台热推 (${Object.keys(filesPayload).join(', ')})`,
        activate: true,
        files: filesPayload,
      });
      setStagedFiles({});
      setJsonText('');
      await onHotReloadSpecs();
      await refreshReleases(unlockedToken);
      onToast(`🔥 热推成功！Release [${res.releaseId}] (${res.filesCount}个文件) 已全网即时生效`);
    } catch (err) {
      setOpsError(err instanceof Error ? err.message : String(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (releaseId: string) => {
    setOpsError(null);
    setPublishing(true);
    try {
      const res = await opsRollbackRelease(unlockedToken, releaseId);
      await onHotReloadSpecs();
      await refreshReleases(unlockedToken);
      onToast(`⏪ 已一键回滚至版本 [${res.activeReleaseId}]，前端规格缓存已刷新`);
    } catch (err) {
      setOpsError(err instanceof Error ? err.message : String(err));
    } finally {
      setPublishing(false);
    }
  };

  const activeRelInfo = getActiveReleaseInfo();

  return (
    <div
      className={styles.drawerBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className={`${styles.drawerPanel} ${styles.opsDrawerPanel}`}
        id="ops-admin-drawer"
        aria-label="运维热更新与反馈工单管理台"
      >
        <div className={styles.drawerHeader}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 800, color: '#fff' }}>
              🛠️ 排轴数据运维与纯倍率热更新中心 (#/ops)
            </h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.73rem', color: 'rgba(255,255,255,0.62)' }}>
              当前运行版本: <strong style={{ color: '#5eead4' }}>{currentSpecVersion}</strong> · Release指针:{' '}
              <code>{activeRelInfo.releaseId}</code>
            </span>
          </div>

          <div className={styles.zoomBtnGroup}>
            {unlockedToken && (
              <button
                type="button"
                className={styles.btnGhost}
                onClick={handleLogoutToken}
              >
                🔒 退出鉴权
              </button>
            )}
            <button type="button" className={styles.btnGhost} onClick={onClose}>
              ✕ 关闭
            </button>
          </div>
        </div>

        <div className={styles.drawerBody}>
          {opsError && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255, 51, 85, 0.16)',
                border: '1px solid rgba(255, 51, 85, 0.5)',
                color: '#fda4af',
                fontSize: '0.8rem',
              }}
            >
              ⚠️ {opsError}
            </div>
          )}

          {!unlockedToken ? (
            <form
              onSubmit={handleUnlock}
              className={styles.slotBuildCard}
              style={{ padding: 20, gap: 12 }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                🔑 输入管理员密钥 (OPS_ADMIN_TOKEN) 解锁
              </div>
              <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.62)' }}>
                密钥仅保存在当前浏览器页签的 <code>sessionStorage</code> 中，通过 Bearer Header 与云端 Worker 恒定时间鉴权。
              </div>
              <input
                id="ops-admin-token-input"
                type="password"
                className={styles.simInput}
                style={{ textAlign: 'left', width: '100%' }}
                placeholder="粘贴 OPS_ADMIN_TOKEN..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
              <div>
                <button type="submit" id="btn-unlock-ops" className={styles.btnNeonPink}>
                  🔓 验证并进入运维台
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* 双页签切换 */}
              <div className={styles.engineSwitchTabs}>
                <button
                  type="button"
                  id="ops-tab-reports"
                  className={`${styles.engineTabBtn} ${
                    activeTab === 'reports' ? styles.engineTabBtnActive : ''
                  }`}
                  onClick={() => setActiveTab('reports')}
                >
                  📋 用户反馈工单池 ({reports.length})
                </button>
                <button
                  type="button"
                  id="ops-tab-releases"
                  className={`${styles.engineTabBtn} ${
                    activeTab === 'releases' ? styles.engineTabBtnActive : ''
                  }`}
                  onClick={() => setActiveTab('releases')}
                >
                  🚀 纯倍率/预设热更新发布台
                </button>
              </div>

              {activeTab === 'reports' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className={styles.timelineControls} style={{ marginBottom: 0 }}>
                    <div className={styles.zoomBtnGroup}>
                      {(['all', 'open', 'resolved', 'ignored'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          className={`${styles.miniRankBtn} ${
                            statusFilter === st ? styles.miniRankBtnActive : ''
                          }`}
                          onClick={() => setStatusFilter(st)}
                        >
                          {st === 'all'
                            ? '全部'
                            : st === 'open'
                              ? '待处理 (open)'
                              : st === 'resolved'
                                ? '已核查 (resolved)'
                                : '已忽略 (ignored)'}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      className={styles.btnGhost}
                      onClick={() => void refreshReports(unlockedToken, statusFilter)}
                      disabled={loadingReports}
                    >
                      {loadingReports ? '刷新中...' : '🔄 刷新工单'}
                    </button>
                  </div>

                  {reports.length === 0 ? (
                    <div className={styles.slotBuildCard} style={{ color: '#a1a1aa' }}>
                      {loadingReports ? '正在读取 D1 工单池...' : '当前筛选条件下暂无异常反馈工单。'}
                    </div>
                  ) : (
                    reports.map((rep) => (
                      <div key={rep.id} className={styles.slotBuildCard}>
                        <div className={styles.slotBuildHeader}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                            <span className={styles.slotBadge}>#{rep.id.slice(0, 8)}</span>
                            <span className={styles.kpiMetaTag}>{rep.engine}</span>
                            <span className={styles.kpiMetaTag}>{rep.category}</span>
                            <span
                              className={`${styles.statusBadge} ${
                                rep.status === 'resolved'
                                  ? styles.statusBadgeGood
                                  : rep.status === 'open'
                                    ? styles.statusBadgeWarn
                                    : ''
                              }`}
                            >
                              {rep.status}
                            </span>
                            {rep.stepIdx != null && (
                              <span className={styles.kpiMetaTag}>步号 #{rep.stepIdx + 1}</span>
                            )}
                          </div>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#a1a1aa' }}>
                            {rep.createdAt}
                          </span>
                        </div>

                        {rep.message && (
                          <div style={{ fontSize: '0.84rem', color: '#fff', lineHeight: 1.4 }}>
                            “{rep.message}”
                          </div>
                        )}

                        <div className={styles.kpiSubRow}>
                          <span>规格版本: {rep.specVersion}</span>
                          {rep.presetId && <span>预设: {rep.presetId}</span>}
                          {rep.summary?.bossName && <span>靶标: {String(rep.summary.bossName)}</span>}
                          {typeof rep.summary?.totalDmg === 'number' && (
                            <span>当时总伤: {formatDamageCompact(rep.summary.totalDmg)}</span>
                          )}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            marginTop: 4,
                          }}
                        >
                          <button
                            type="button"
                            className={styles.btnNeonCyan}
                            onClick={() => onReproduceReport(rep)}
                          >
                            🔬 一键载入模拟器复现
                          </button>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                            <input
                              type="text"
                              className={styles.simInput}
                              style={{ width: 170, height: 32, textAlign: 'left', fontSize: '0.75rem' }}
                              placeholder="核查备注..."
                              value={noteDrafts[rep.id] ?? rep.resolutionNote ?? ''}
                              onChange={(e) =>
                                setNoteDrafts((prev) => ({ ...prev, [rep.id]: e.target.value }))
                              }
                            />
                            <button
                              type="button"
                              className={styles.btnGhost}
                              onClick={() => void handleUpdateReportStatus(rep.id, 'resolved')}
                            >
                              ✔ 已核查
                            </button>
                            <button
                              type="button"
                              className={styles.btnGhost}
                              onClick={() => void handleUpdateReportStatus(rep.id, 'ignored')}
                            >
                              忽略
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* 新发版推送面板 */}
                  <div className={styles.slotBuildCard} style={{ gap: 10 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                      📦 推送新版倍率规格 / 收敛预设 JSON（无需重编 Rust/WASM 立即生效）
                    </div>

                    <div className={styles.slotTwoCol}>
                      <div className={styles.fieldCol}>
                        <span className={styles.fieldLabel}>新发布版本号 (version)</span>
                        <input
                          id="ops-publish-version"
                          type="text"
                          className={styles.simInput}
                          style={{ textAlign: 'left', width: '100%' }}
                          value={newVersion}
                          onChange={(e) => setNewVersion(e.target.value)}
                        />
                      </div>
                      <div className={styles.fieldCol}>
                        <span className={styles.fieldLabel}>更新说明 (note)</span>
                        <input
                          id="ops-publish-note"
                          type="text"
                          className={styles.simInput}
                          style={{ textAlign: 'left', width: '100%' }}
                          placeholder="如：3.4.5 热补丁倍率同步"
                          value={releaseNote}
                          onChange={(e) => setReleaseNote(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.fieldCol}>
                      <span className={styles.fieldLabel}>目标云端路径（支持选预设路径或手动输入）</span>
                      <div className={styles.miniPillRow} style={{ marginBottom: 4 }}>
                        {TARGET_FILE_PRESETS.map((p) => (
                          <button
                            key={p}
                            type="button"
                            className={`${styles.miniRankBtn} ${
                              targetPath === p ? styles.miniRankBtnActive : ''
                            }`}
                            onClick={() => setTargetPath(p)}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <input
                          id="ops-target-path"
                          type="text"
                          className={styles.simInput}
                          style={{ flex: 1, textAlign: 'left' }}
                          value={targetPath}
                          onChange={(e) => setTargetPath(e.target.value)}
                        />
                        <label className={styles.btnGhost} style={{ cursor: 'pointer', margin: 0 }}>
                          📂 选择本地 JSON
                          <input
                            type="file"
                            accept=".json,application/json"
                            style={{ display: 'none' }}
                            onChange={(e) => void handleFileUpload(e)}
                          />
                        </label>
                      </div>
                    </div>

                    <div className={styles.fieldCol}>
                      <span className={styles.fieldLabel}>
                        <span>JSON 内容预览 / 直接粘贴</span>
                        {jsonText && (
                          <span style={{ color: '#5eead4' }}>
                            当前长度 {(jsonText.length / 1024).toFixed(1)} KB (对比线上版本: {currentSpecVersion} → {newVersion})
                          </span>
                        )}
                      </span>
                      <textarea
                        id="ops-json-textarea"
                        rows={6}
                        style={{
                          width: '100%',
                          background: 'rgba(5, 5, 10, 0.9)',
                          border: '1px solid rgba(255,255,255,0.16)',
                          borderRadius: 10,
                          color: '#e4e4e7',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.74rem',
                          padding: 10,
                          resize: 'vertical',
                        }}
                        placeholder='粘贴新版 JSON 内容，支持多文件暂存后一次性原子热发布...'
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                      />
                    </div>

                    {Object.keys(stagedFiles).length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span className={styles.fieldLabel}>已暂存待原子发布文件清单：</span>
                        {Object.entries(stagedFiles).map(([p, meta]) => (
                          <div key={p} className={styles.kpiSubRow}>
                            <span style={{ color: '#5eead4' }}>✔ {p}</span>
                            <span>
                              {(meta.byteLen / 1024).toFixed(1)} KB
                              {meta.detectedVersion ? ` · 内含 version=${meta.detectedVersion}` : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      <button
                        type="button"
                        className={styles.btnGhost}
                        onClick={handleStageCurrentJson}
                        disabled={publishing}
                      >
                        ➕ 校验并加入待发包
                      </button>
                      <button
                        type="button"
                        id="btn-ops-publish-now"
                        className={styles.btnNeonPink}
                        onClick={() => void handlePublishSpecs()}
                        disabled={publishing}
                      >
                        {publishing ? '正在推送至边缘 KV...' : '🔥 一键热推上线（全网即时生效）'}
                      </button>
                    </div>
                  </div>

                  {/* 历史版本与一键回滚列表 */}
                  <div className={styles.slotBuildCard} style={{ gap: 10 }}>
                    <div className={styles.slotBuildHeader}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                        📜 历史发版审计与一键回滚
                      </span>
                      <div className={styles.zoomBtnGroup}>
                        <button
                          type="button"
                          id="btn-ops-rollback-bundled"
                          className={styles.btnDanger}
                          onClick={() => void handleRollback('bundled')}
                          disabled={publishing}
                        >
                          ⏪ 回滚至内置基准包 (bundled · 3.4.5_r20699967)
                        </button>
                        <button
                          type="button"
                          className={styles.btnGhost}
                          onClick={() => void refreshReleases(unlockedToken)}
                          disabled={loadingReleases}
                        >
                          🔄 刷新
                        </button>
                      </div>
                    </div>

                    {releases.length === 0 ? (
                      <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>
                        {loadingReleases
                          ? '正在读取发版记录...'
                          : '暂无热更新覆盖记录（当前使用内置静态基准包 bundled）。'}
                      </div>
                    ) : (
                      releases.map((rel) => (
                        <div
                          key={rel.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: 'rgba(255,255,255,0.03)',
                            border: rel.isActive
                              ? '1px solid rgba(46, 196, 182, 0.55)'
                              : '1px solid rgba(255,255,255,0.08)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <strong style={{ color: '#fff', fontSize: '0.84rem' }}>
                                {rel.version}
                              </strong>
                              <code style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>
                                {rel.id}
                              </code>
                              {rel.isActive && (
                                <span className={`${styles.statusBadge} ${styles.statusBadgeGood}`}>
                                  ● ACTIVE 生效中
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.62)' }}>
                              {rel.note || '无备注'} · 包含文件: {rel.files.join(', ') || '--'} ·{' '}
                              {rel.createdAt}
                            </div>
                          </div>

                          {!rel.isActive && (
                            <button
                              type="button"
                              className={styles.btnGhost}
                              onClick={() => void handleRollback(rel.id)}
                              disabled={publishing}
                            >
                              ⏪ 回滚至此版
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
