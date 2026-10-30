// 危局强袭战 · 最优排轴模拟器（nanoka-zzz/da-sim Python 版完整移植）
// 数据：public/da-sim/（index / scenarios / kits / boss / score_curve / builds）
// 计算：src/calc/daSim/*，在 Web Worker 中运行束搜索。
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DaIndex } from '../calc/daSim/runner';
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
const fmt = (n: number | null | undefined, d = 0) =>
  n == null || Number.isNaN(n) ? '—' : Number(n).toLocaleString('zh-CN', { maximumFractionDigits: d, minimumFractionDigits: d });

export function DeadlyAssaultPanel() {
  const [index, setIndex] = useState<DaIndex | null>(null);
  const [period, setPeriod] = useState<number | null>(null);
  const [bossKey, setBossKey] = useState<string>('ComplexCorrupted');
  const [scenarioId, setScenarioId] = useState<string>('');
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
          setErr('数据索引为空：未找到可用场景。');
          return;
        }
        setPeriod(first.period_id);
        setBossKey(first.boss_key);
        setScenarioId(first.id);
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

  const periods = useMemo(() => {
    const m = new Map<number, string>();
    index?.scenarios.forEach((s) => m.set(s.period_id, s.period_label));
    return [...m.entries()];
  }, [index]);
  const teams = useMemo(
    () => index?.scenarios.filter((s) => s.period_id === period && s.boss_key === bossKey) ?? [],
    [index, period, bossKey],
  );
  const current = index?.scenarios.find((s) => s.id === scenarioId) ?? null;

  const pickPeriod = (p: number) => {
    setPeriod(p);
    const s = index?.scenarios.find((x) => x.period_id === p && x.boss_key === bossKey) ?? index?.scenarios.find((x) => x.period_id === p);
    if (s) {
      setBossKey(s.boss_key);
      setScenarioId(s.id);
      setBuildMode(s.default_build_mode);
    }
  };
  const pickBoss = (key: string) => {
    setBossKey(key);
    const s = index?.scenarios.find((x) => x.period_id === period && x.boss_key === key)
      ?? index?.scenarios.find((x) => x.boss_key === key);
    if (s) {
      setScenarioId(s.id);
      setBuildMode(s.default_build_mode);
    } else {
      setScenarioId('');
    }
  };
  const pickTeam = (id: string) => {
    setScenarioId(id);
    const s = index?.scenarios.find((x) => x.id === id);
    if (s) setBuildMode(s.default_build_mode);
  };

  const run = () => {
    if (!current) return;
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
    w.postMessage({ base: BASE, scenarioFile: current.file, options: { buildMode, beamWidth, maxSteps, seed } });
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

  return (
    <section className={`sub-module ${styles.panel}`} id="mod-da-sim" aria-labelledby="da-sim-title">
      <div className="module-title"><span id="da-sim-title">危局强袭 · 排轴模拟</span></div>

      <p className={styles.intro}>
        用束搜索估算本期危局强袭的最优排轴与得分。得分 = 伤害曲线分段分 + 部位破坏（每次 800，上限 5000）；评级门槛 S/A/B = 20000 / 14000 / 6000。
      </p>

      {!index && !err && (
        <p className={styles.loading} role="status">正在加载场景数据…</p>
      )}

      {index && index.scenarios.length === 0 && !err && (
        <p className={styles.empty}>暂无可用场景。请确认 <code>da-sim/index.json</code> 已部署。</p>
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
              <span className={styles.fieldLabel}>队伍</span>
              <select
                value={scenarioId}
                onChange={(e) => pickTeam(e.target.value)}
                disabled={busy || teams.length === 0}
              >
                {teams.length === 0 && <option value="">该首领本期暂无队伍</option>}
                {teams.map((s) => (
                  <option key={s.id} value={s.id}>{s.team_label}</option>
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

          <div className={styles.actions}>
            {!busy ? (
              <button type="button" className={styles.btn} onClick={run} disabled={!current}>
                开始模拟
              </button>
            ) : (
              <button type="button" className={`${styles.btn} ${styles.btnStop}`} onClick={stop}>
                停止
              </button>
            )}
            <p className={styles.meta} id="da-beam-hint">
              束宽越大搜索越稳、越慢；默认 40 / 140 步便于与 Python 参考对照。
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

          {current?.python_ref && (
            <p className={styles.meta}>
              <span className={styles.metaStrong}>参考：</span>
              Python（束宽 40 / 140 步 / 种子 42 / {BUILD_MODE_CN[current.python_ref.build].slice(0, 4)}）
              {fmt(current.python_ref.total_score, 1)} 分 · {fmt(current.python_ref.final_t, 1)} 秒
              {current.human_ref != null ? `；玩家实测 ${fmt(current.human_ref)} 分` : ''}
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
