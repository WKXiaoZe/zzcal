// Deadly Assault (危局) rotation beam-search panel.
// Kits/scenario: /da-sim/*.json (Pass A curated). Search: src/calc/daSim/beamSearch.ts
import { useCallback, useEffect, useState } from 'react';
import { runDaBeamSearch } from '../calc/daSim/beamSearch';
import type { DaKit, DaResult, DaScenario } from '../calc/daSim/types';
import styles from './DeadlyAssaultPanel.module.css';

export function DeadlyAssaultPanel() {
  const [scenario, setScenario] = useState<DaScenario | null>(null);
  const [kits, setKits] = useState<Record<string, DaKit> | null>(null);
  const [result, setResult] = useState<DaResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sc = (await fetch('/da-sim/690481_complex_corrupted.json').then((r) => r.json())) as DaScenario;
        const ids = sc.team;
        const loaded: Record<string, DaKit> = {};
        await Promise.all(
          ids.map(async (id) => {
            loaded[id] = (await fetch(`/da-sim/${id}.json`).then((r) => r.json())) as DaKit;
          }),
        );
        if (cancelled) return;
        setScenario(sc);
        setKits(loaded);
        try {
          const sample = await fetch('/da-sim/sample_result.json').then((r) => r.json());
          setResult({
            score: {
              total_damage: sample.score.total_damage,
              hp_proxy: sample.score.hp_max ?? sample.score.hp_proxy,
              hp_max: sample.score.hp_max ?? sample.score.hp_proxy,
              final_t: sample.score.final_t,
              final_decibel: sample.score.final_decibel,
              total_stun_applied: sample.score.total_stun_applied,
              part_breaks: sample.score.part_breaks,
              da: sample.score.da,
            },
            plan: sample.plan,
            log: sample.log,
          });
        } catch {
          /* sample optional */
        }
      } catch (e) {
        if (!cancelled) setErr(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onRun = useCallback(() => {
    if (!scenario || !kits) return;
    setBusy(true);
    setErr(null);
    setTimeout(() => {
      try {
        const r = runDaBeamSearch(scenario, kits, { beam: 16, steps: 90 });
        setResult(r);
      } catch (e) {
        setErr(String(e));
      } finally {
        setBusy(false);
      }
    }, 30);
  }, [scenario, kits]);

  const da = result?.score.da;

  return (
    <div className={`sub-module ${styles.panel}`}>
      <div className="module-title">
        <span>危局排轴模拟（Deadly Assault · 束搜索）</span>
      </div>
      <div className={styles.row}>
        <div className={styles.meta}>
          {scenario ? (
            <>
              期数 {scenario.period_id} · {scenario.boss_cn} · Buff {scenario.selectable_buff_cn} · 配队{' '}
              {scenario.team.join(' / ')}
            </>
          ) : (
            '加载场景中…'
          )}
        </div>
        <button type="button" className={styles.btn} disabled={!scenario || !kits || busy} onClick={onRun}>
          {busy ? '搜索中…' : '浏览器内轻量搜索'}
        </button>
      </div>
      {err && <div className={styles.note}>错误：{err}</div>}
      {result && (
        <>
          <div className={styles.score}>
            预估伤害 {result.score.total_damage.toLocaleString()} / HP{' '}
            {(result.score.hp_max ?? result.score.hp_proxy).toLocaleString()}
            {da ? (
              <>
                {' '}
                · 危局分 {da.total_score.toLocaleString()}（伤害 {da.damage_score} + 操作{' '}
                {da.operation_score}）· 档位 {da.rank}
                {typeof result.score.part_breaks === 'number' ? ` · 部位破坏 ${result.score.part_breaks}` : ''}
              </>
            ) : null}
            {' '}
            · 失衡 {result.score.total_stun_applied.toFixed(1)} · 喧响 {result.score.final_decibel} · t=
            {result.score.final_t}s · 轴 {result.plan.length} 步
          </div>
          <div className={styles.log}>
            {result.log.slice(0, 30).map((row, i) => (
              <div key={i}>
                t={row.t.toFixed(2)}-{row.t_end.toFixed(2)} {row.agent.padEnd(8)} {row.action.padEnd(14)} dmg=
                {row.dmg.toFixed(0).padStart(8)} Σ={row.total_dmg.toFixed(0)}
              </div>
            ))}
            {result.log.length > 30 ? `\n… 另有 ${result.log.length - 30} 步` : ''}
          </div>
        </>
      )}
      <div className={styles.note}>
        倍率来自 Pass A AttackProperty.fixedValue；苍角 FlagAtkBuffRatio=0.25 平加攻 + Ice AddedDamage 12% +
        IceResist-20%（AbilitySpecials）；危局分=min(60000,60000×伤害/HP)+部位破坏×800。完整 CLI：
        <code> python3 nanoka-zzz/da-sim/cli.py </code>
        。招架窗口时长仍手填；详见 nanoka-zzz/da-sim/ASSUMPTIONS.md。场地 Buff ≠ 环境 Buff。
      </div>
    </div>
  );
}
