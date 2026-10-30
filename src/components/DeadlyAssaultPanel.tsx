// 危局强袭战 · 最优排轴模拟器（nanoka-zzz/da-sim Python 版完整移植）
// 自由配队：任意 3 代理人 + 可选预设快捷填充；数据 public/da-sim/，计算在 Web Worker。
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DaIndex, DaIndexScenario } from '../calc/daSim/runner';
import type { RunResult } from '../calc/daSim/runner';
import type { BuildMode } from '../calc/daSim/types';
import styles from './DeadlyAssaultPanel.module.css';

const BASE = new URL('da-sim/', document.baseURI).toString();

const BUILD_MODE_CN: Record<BuildMode, string> = {
  auto: '自动配装（贪心优化，预算 36）',
  file: '存档配装（builds 文件）',
  none: '不配装（场景原始面板）',
};
const ROLE_CN: Record<string, string> = { stun: '击破', dps: '输出', support: '支援', anomaly: '异常' };
const ACTION_CN: Record<string, string> = {
  basic: '普攻', dodge_counter: '闪避反击', ex: '强化特殊技', special: '特殊技', chain: '连携技',
  ultimate: '终结技', parry: '招架支援', assist_followup: '支援突击', switch_in: '切人入场', mark: '标记', wait: '等待',
  basic_enhance: '强化普攻', basic_finisher: '普攻终结', branch: '普攻分支', charged: '蓄力攻击', dash_slash: '冲刺攻击',
  ex_buff: '强化特殊技（增益）', switch_ex: '切人强化特殊技',
};
const DEFAULT_SLOT_LABELS = ['击破', '主C', '辅助'];
const EMPTY_TEAM: [string, string, string] = ['', '', ''];
const PROF_ROLE_CN: Record<string, string> = {
  stun: '击破', attack: '输出', support: '支援', defense: '防护', anomaly: '异常',
};

const fmt = (n: number | null | undefined, d = 0) =>
  n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString('zh-CN', { maximumFractionDigits: d, minimumFractionDigits: d });

function teamsEqual(a: string[], b: string[] | undefined): boolean {
  if (!b || b.length !== 3) return false;
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

export function DeadlyAssaultPanel() {
  const [index, setIndex] = useState<DaIndex | null>(null);
  const [period, setPeriod] = useState<number | null>(null);
  const [bossKey, setBossKey] = useState<string>('ComplexCorrupted');
  const [presetId, setPresetId] = useState<string>(''); // '' = 自由配队
  const [team, setTeam] = useState<[string, string, string]>(EMPTY_TEAM);
  const [buildMode, setBuildMode] = useState<BuildMode>('auto');
  const [beamWidth, setBeamWidth] = useState(40);
  const [maxSteps, setMaxSteps] = useState(140);
  const [seed, setSeed] = useState(42);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ step: number; max: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${BASE}index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((ix: DaIndex) => {
        if (cancelled) return;
        setIndex(ix);
        const first = ix.scenarios[0];
        if (!first) {
          setErr('数据索引为空：未找到可用场景模板。');
          return;
        }
        // Default to first preset as a convenience shortcut (still free-editable).
        setPeriod(first.period_id);
        setBossKey(first.boss_key);
        setPresetId(first.id);
        const t = (first.team || EMPTY_TEAM) as [string, string, string];
        setTeam([t[0] || '', t[1] || '', t[2] || '']);
        setBuildMode(first.default_build_mode);
      })
      .catch((e) => {
        if (!cancelled) setErr(`数据索引加载失败：${e instanceof Error ? e.message : String(e)}`);
      });
    return () => {
      cancelled = true;
      workerRef.current?.terminate();
    };
  }, []);

  const slotLabels = index?.slot_labels?.length === 3 ? index.slot_labels : DEFAULT_SLOT_LABELS;
  const agents = index?.agents ?? [];

  const periods = useMemo(() => {
    const m = new Map<number, string>();
    index?.scenarios.forEach((s) => m.set(s.period_id, s.period_label));
    return [...m.entries()];
  }, [index]);

  /** Presets matching current period+boss (shortcuts only). */
  const presets = useMemo(
    () => index?.scenarios.filter((s) => s.period_id === period && s.boss_key === bossKey) ?? [],
    [index, period, bossKey],
  );

  /** Template scenario file for current period+boss (any matching preset file). */
  const templateScenario: DaIndexScenario | null = useMemo(() => {
    if (!index || period == null) return null;
    if (presetId) {
      const p = index.scenarios.find((s) => s.id === presetId);
      if (p) return p;
    }
    return (
      index.scenarios.find((s) => s.period_id === period && s.boss_key === bossKey)
      ?? index.scenarios.find((s) => s.boss_key === bossKey)
      ?? null
    );
  }, [index, period, bossKey, presetId]);

  const activePreset = index?.scenarios.find((s) => s.id === presetId) ?? null;
  const teamReady = team.every(Boolean) && new Set(team).size === 3;

  const pickPeriod = (p: number) => {
    setPeriod(p);
    const match =
      index?.scenarios.find((x) => x.period_id === p && x.boss_key === bossKey)
      ?? index?.scenarios.find((x) => x.period_id === p);
    if (match) {
      setBossKey(match.boss_key);
      // Keep free team if possible; only auto-apply preset when none selected.
      const still = index?.scenarios.find(
        (x) => x.period_id === p && x.boss_key === match.boss_key && teamsEqual(team, x.team),
      );
      if (still) {
        setPresetId(still.id);
        setBuildMode(still.default_build_mode);
      } else {
        setPresetId('');
      }
    }
  };

  const pickBoss = (key: string) => {
    setBossKey(key);
    const match =
      index?.scenarios.find((x) => x.period_id === period && x.boss_key === key)
      ?? index?.scenarios.find((x) => x.boss_key === key);
    if (!match) {
      setPresetId('');
      return;
    }
    const still = index?.scenarios.find(
      (x) => x.period_id === (period ?? match.period_id) && x.boss_key === key && teamsEqual(team, x.team),
    );
    if (still) {
      setPresetId(still.id);
      setBuildMode(still.default_build_mode);
    } else {
      setPresetId('');
    }
  };

  const applyPreset = (id: string) => {
    if (!id) {
      setPresetId('');
      return;
    }
    const s = index?.scenarios.find((x) => x.id === id);
    if (!s) return;
    setPresetId(s.id);
    setPeriod(s.period_id);
    setBossKey(s.boss_key);
    const t = (s.team || EMPTY_TEAM) as [string, string, string];
    setTeam([t[0] || '', t[1] || '', t[2] || '']);
    setBuildMode(s.default_build_mode);
  };

  const pickSlot = (idx: number, agentId: string) => {
    const next: [string, string, string] = [...team];
    next[idx] = agentId;
    setTeam(next);
    const match = index?.scenarios.find(
      (s) => s.period_id === period && s.boss_key === bossKey && teamsEqual(next, s.team),
    );
    setPresetId(match?.id ?? '');
    if (match) setBuildMode(match.default_build_mode);
    else if (buildMode === 'file') setBuildMode('auto'); // file builds are preset-specific
  };

  const run = () => {
    if (!templateScenario) {
      setErr('当前期数/首领没有可用的场景模板。');
      return;
    }
    if (!teamReady) {
      setErr('请选择 3 名不重复的代理人。');
      return;
    }
    workerRef.current?.terminate();
    const w = new Worker(new URL('../calc/daSim/worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = w;
    setBusy(true);
    setErr(null);
    setProgress({ step: 0, max: maxSteps });
    w.onmessage = (ev) => {
      const m = ev.data;
      if (m.type === 'progress') setProgress({ step: m.step, max: m.max });
      else if (m.type === 'done') {
        setResult(m.result);
        setBusy(false);
        setProgress(null);
        w.terminate();
      } else if (m.type === 'error') {
        setErr(m.message);
        setBusy(false);
        setProgress(null);
        w.terminate();
      }
    };
    w.onerror = (e) => {
      setErr(`Worker 出错：${e.message || '未知错误'}`);
      setBusy(false);
      setProgress(null);
    };
    w.postMessage({
      base: BASE,
      scenarioFile: templateScenario.file,
      team: [...team],
      options: { buildMode, beamWidth, maxSteps, seed },
    });
  };

  const stop = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    setBusy(false);
    setProgress(null);
  };

  const sc = result?.score;
  const da = sc?.da;
  const progressPct = progress && progress.max > 0
    ? Math.min(100, Math.round((progress.step / progress.max) * 100))
    : 0;

  const agentOptionsFor = (slotIdx: number) => {
    const taken = new Set(team.filter((id, i) => id && i !== slotIdx));
    return agents.map((a) => ({
      ...a,
      disabled: taken.has(a.id),
    }));
  };

  return (
    <section className={`sub-module ${styles.panel}`} id="mod-da-sim" aria-labelledby="da-sim-title">
      <div className="module-title"><span id="da-sim-title">危局强袭 · 排轴模拟</span></div>

      <p className={styles.intro}>
        自由配队：任选 3 名代理人（需有 Pass A kit），用束搜索估算最优排轴与得分。预设仅作快捷填充；得分 = 伤害曲线分段分 + 部位破坏（每次 800，上限 5000）；评级门槛 S/A/B = 20000 / 14000 / 6000。
      </p>

      {!index && !err && (
        <p className={styles.loading} role="status">正在加载场景数据…</p>
      )}

      {index && index.scenarios.length === 0 && !err && (
        <p className={styles.empty}>暂无可用场景模板。请确认 <code>da-sim/index.json</code> 已部署。</p>
      )}

      {index && index.scenarios.length > 0 && (
        <div className={styles.controls}>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>期数</span>
              <select value={period ?? ''} onChange={(e) => pickPeriod(Number(e.target.value))} disabled={busy}>
                {periods.map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>首领</span>
              <select value={bossKey} onChange={(e) => pickBoss(e.target.value)} disabled={busy}>
                {index.bosses.map((b) => (
                  <option key={b.key} value={b.key} disabled={!b.available}>
                    {b.cn}{b.available ? '' : '（暂无数据）'}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>预设（快捷）</span>
              <select
                value={presetId}
                onChange={(e) => applyPreset(e.target.value)}
                disabled={busy}
              >
                <option value="">自由配队</option>
                {presets.map((s) => (
                  <option key={s.id} value={s.id}>{s.team_label}</option>
                ))}
                {/* Show other-period presets so user can jump */}
                {index.scenarios
                  .filter((s) => !(s.period_id === period && s.boss_key === bossKey))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.period_label} · {s.team_label}</option>
                  ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>配装</span>
              <select value={buildMode} onChange={(e) => setBuildMode(e.target.value as BuildMode)} disabled={busy}>
                {(Object.keys(BUILD_MODE_CN) as BuildMode[]).map((m) => (
                  <option key={m} value={m}>{BUILD_MODE_CN[m]}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>束宽</span>
              <input
                type="number"
                min={1}
                max={400}
                value={beamWidth}
                onChange={(e) => setBeamWidth(Number(e.target.value) || 1)}
                disabled={busy}
                aria-describedby="da-beam-hint"
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>最大步数</span>
              <input
                type="number"
                min={1}
                max={600}
                value={maxSteps}
                onChange={(e) => setMaxSteps(Number(e.target.value) || 1)}
                disabled={busy}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>随机种子</span>
              <input
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value) || 0)}
                disabled={busy}
              />
            </label>
          </div>

          <div className={styles.teamSection}>
            <div className={styles.teamHeader}>
              <span className={styles.fieldLabel}>队伍（自由配队 · 顺序 = 开场→切人）</span>
              {agents.length === 0 && (
                <span className={styles.meta}>暂无代理人目录，请检查 index.json 的 agents 字段。</span>
              )}
            </div>
            <div className={styles.teamGrid}>
              {slotLabels.map((label, i) => (
                <label key={i} className={styles.field}>
                  <span className={styles.fieldLabel}>{label}</span>
                  <select
                    value={team[i]}
                    onChange={(e) => pickSlot(i, e.target.value)}
                    disabled={busy || agents.length === 0}
                  >
                    <option value="">选择代理人…</option>
                    {agentOptionsFor(i).map((a) => (
                      <option key={a.id} value={a.id} disabled={a.disabled}>
                        {a.cn}（{PROF_ROLE_CN[(a.profession || '').toLowerCase()] ?? a.profession}）
                        {a.disabled ? ' · 已选用' : ''}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            {!busy ? (
              <button type="button" className={styles.btn} onClick={run} disabled={!teamReady || !templateScenario}>
                开始模拟
              </button>
            ) : (
              <button type="button" className={`${styles.btn} ${styles.btnStop}`} onClick={stop}>
                停止
              </button>
            )}
            <p className={styles.meta} id="da-beam-hint">
              束宽越大搜索越稳、越慢；默认 40 / 140 步便于与 Python 参考对照。自由配队默认用自动配装。
            </p>
          </div>

          {period === 690481 && index.buffs_690481 && (
            <p className={styles.meta}>
              <span className={styles.metaStrong}>本期增益：</span>
              {(index.buffs_690481 as string[]).join(' / ')}
            </p>
          )}

          {busy && progress && (
            <div className={styles.statusBlock} role="status" aria-live="polite">
              <p className={styles.meta}>
                搜索中… 第 {progress.step} / {progress.max} 步（{progressPct}%）
              </p>
              <div className={styles.progressTrack} aria-hidden="true">
                <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          {activePreset?.python_ref && teamsEqual(team, activePreset.team) && (
            <p className={styles.meta}>
              <span className={styles.metaStrong}>参考：</span>
              Python（束宽 40 / 140 步 / 种子 42 / {BUILD_MODE_CN[activePreset.python_ref.build].slice(0, 4)}）
              {fmt(activePreset.python_ref.total_score, 1)} 分 · {fmt(activePreset.python_ref.final_t, 1)} 秒
              {activePreset.human_ref != null ? `；玩家实测 ${fmt(activePreset.human_ref)} 分` : ''}
            </p>
          )}
        </div>
      )}

      {err && (
        <p className={styles.error} role="alert">
          {err}
        </p>
      )}

      {result && sc && da && (
        <>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>得分</h2>
            <div className={styles.scoreGrid}>
              <div className={styles.scoreCard}>
                <span className={styles.scoreLabel}>总分 / 评级</span>
                <div className={`${styles.scoreValue} ${styles.scoreValuePrimary}`}>
                  {fmt(da.total_score, 1)} · {da.rank}
                </div>
              </div>
              <div className={styles.scoreCard}>
                <span className={styles.scoreLabel}>伤害分</span>
                <div className={styles.scoreValue}>{fmt(da.damage_score, 1)} / {fmt(da.damage_score_cap)}</div>
              </div>
              <div className={styles.scoreCard}>
                <span className={styles.scoreLabel}>操作分（破坏 ×800）</span>
                <div className={styles.scoreValue}>
                  {fmt(da.operation_score)} / {fmt(da.operation_score_cap)}
                  <span className={styles.scoreMeta}> · {sc.part_breaks} 次</span>
                </div>
              </div>
              <div className={styles.scoreCard}>
                <span className={styles.scoreLabel}>总伤害 / 血量</span>
                <div className={styles.scoreValue}>
                  {fmt(sc.total_damage, 1)} / {fmt(da.hp_max, 1)}
                </div>
                <div className={styles.scoreMeta}>
                  剩余 {fmt((da.hp_max ? Math.max(0, da.hp_max - sc.total_damage) / da.hp_max : 0) * 100, 1)}%
                </div>
              </div>
              <div className={styles.scoreCard}>
                <span className={styles.scoreLabel}>用时 · 招架 · 喧响</span>
                <div className={styles.scoreValue}>
                  {fmt(sc.final_t, 1)}s · {sc.parry_count} · {fmt(sc.final_decibel)}
                </div>
              </div>
            </div>
            <p className={styles.scoreMeta}>
              配装 {BUILD_MODE_CN[result.build_mode]} · 束宽 {result.search?.beam_width} · 步数 {result.search?.max_steps} · 种子 {result.search?.seed} · 耗时 {fmt(result.elapsed_ms / 1000, 1)} 秒
              {' · 队伍 '}
              {result.team.map((aid) => result.agent_cn[aid] || aid).join(' / ')}
            </p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>角色配装</h2>
            {result.team.length === 0 ? (
              <p className={styles.empty}>本次结果没有队伍数据。</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>角色</th>
                      <th>定位</th>
                      <th>音擎</th>
                      <th>驱动盘</th>
                      <th>主要属性</th>
                      <th>冲击力</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.team.map((aid) => {
                      const st: any = result.agent_stats?.[aid] || {};
                      const b: any = (result.builds?.agents || {})[aid]?.build || {};
                      return (
                        <tr key={aid}>
                          <td>{result.agent_cn[aid]}{b.mindscape != null ? ` ${b.mindscape}影` : ''}</td>
                          <td>{ROLE_CN[result.team_roles[aid]] ?? result.team_roles[aid] ?? '—'}</td>
                          <td className={styles.cellWrap}>{b.weapon_name ? `${b.weapon_name} 精${b.weapon_refine ?? 1}` : '—'}</td>
                          <td className={styles.cellWrap}>
                            {[b.set4_name, b.set2_name || b.set2_key].filter(Boolean).join(' + ') || '—'}
                            {b.slot5 ? ` · ${b.slot5}` : ''}
                          </td>
                          <td className={styles.cellWrap}>
                            攻击 {fmt(st.baseAtk)}{st.atk_final ? `→${fmt(st.atk_final)}` : ''} · 暴击 {fmt(st.critRate, 1)}% · 暴伤 {fmt(st.critDmg, 1)}% · 增伤 {fmt(st.dmgBonus, 1)}%
                          </td>
                          <td>{fmt(st.impact)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>排轴日志（{result.log.length} 个动作）</h2>
            {result.log.length === 0 ? (
              <p className={styles.empty}>没有动作记录。可增大步数或检查场景数据后重试。</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>角色</th>
                      <th>动作</th>
                      <th>技能</th>
                      <th>伤害</th>
                      <th>失衡</th>
                      <th>喧响</th>
                      <th>累计伤害</th>
                      <th>破坏</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.log.map((e: any, i: number) => (
                      <tr key={i} className={e.boss_stunned ? styles.rowStunned : undefined}>
                        <td>{fmt(e.t, 2)}–{fmt(e.t_end, 2)}</td>
                        <td>{result.agent_cn[e.agent] ?? e.agent}</td>
                        <td>{ACTION_CN[e.action] ?? e.action}</td>
                        <td className={styles.cellWrap}>{e.skill_cn || e.label || '—'}</td>
                        <td>{fmt(e.dmg)}</td>
                        <td>{fmt(e.stun, 1)}</td>
                        <td>{fmt(e.decibel)}</td>
                        <td>{fmt(e.total_dmg)}</td>
                        <td>{e.part_breaks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
