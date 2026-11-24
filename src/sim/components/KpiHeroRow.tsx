// src/sim/components/KpiHeroRow.tsx
// ① 核心指标英雄卡（KPI Cards）+ 右上角轻量数据异常反馈入口

import styles from '../sim.module.css';
import {
  formatDamageCompact,
  formatDpsCompact,
  type NormalizedSimView,
} from './simAdapter';

export interface KpiHeroRowProps {
  view: NormalizedSimView;
  replayMs?: number | null;
  onOpenReport: (stepIdx?: number | null) => void;
}

export function KpiHeroRow({ view, replayMs, onOpenReport }: KpiHeroRowProps) {
  const directPct =
    view.totalDmg > 0 ? Math.min(100, (view.directDmg / view.totalDmg) * 100) : 100;
  const detPct =
    view.totalDmg > 0 ? Math.min(100, (view.detonatedDmg / view.totalDmg) * 100) : 0;
  const anomPct = Math.max(0, 100 - directPct - detPct);

  const isFullKill = view.killed || view.daTotalScore >= 65000;

  return (
    <section className={`${styles.glassCard} ${styles.glassCardPinkGlow}`} id="sim-kpi-section">
      <div className={styles.kpiTopToolbar}>
        <div className={styles.kpiTitleBanner}>
          <span className={styles.sectionDot} />
          <span className={styles.kpiBossBadge}>{view.bossName}</span>
          <span className={styles.kpiMetaTag}>
            {view.limitedGold}限定金 · [{view.shorthand}]
          </span>
          <span className={styles.kpiMetaTag}>
            {view.agentNames.join(' + ')} ({view.bangbooName})
          </span>
          {replayMs != null && (
            <span className={`${styles.statusBadge} ${styles.statusBadgeGood}`}>
              重算耗时 {replayMs.toFixed(1)} ms
            </span>
          )}
        </div>

        <button
          type="button"
          id="btn-open-anomaly-report"
          className={styles.btnGhost}
          onClick={() => onOpenReport(null)}
          title="上报倍率不符、Buff覆盖异常或动作合轴问题"
        >
          <span>🚩 数据异常反馈</span>
        </button>
      </div>

      <div className={styles.kpiGrid}>
        {/* Card 1: 总伤害 */}
        <div className={`${styles.kpiCard} ${styles.kpiCardHighlight}`}>
          <div className={styles.kpiLabel}>
            <span>总结算伤害</span>
            <span>{view.killed && view.killTimeS ? `${view.killTimeS.toFixed(2)}s 斩杀` : `${view.totalSeconds.toFixed(0)}s 全程`}</span>
          </div>
          <div className={`${styles.kpiValue} ${styles.kpiValuePink}`}>
            {formatDamageCompact(view.totalDmg)}
          </div>
          <div>
            <div className={styles.stackedTrack} style={{ height: 6, marginBottom: 5 }}>
              <div
                className={styles.stackedSeg}
                style={{ width: `${directPct}%`, background: '#FDB2C8' }}
                title={`直伤 ${directPct.toFixed(1)}%`}
              />
              {detPct > 0 && (
                <div
                  className={styles.stackedSeg}
                  style={{ width: `${detPct}%`, background: '#ff9f43' }}
                  title={`[烬痕]/特殊引爆 ${detPct.toFixed(1)}%`}
                />
              )}
              {anomPct > 0.2 && (
                <div
                  className={styles.stackedSeg}
                  style={{ width: `${anomPct}%`, background: '#38bdf8' }}
                  title={`异常/紊乱 ${anomPct.toFixed(1)}%`}
                />
              )}
            </div>
            <div className={styles.kpiSubRow}>
              <span>精确: {Math.round(view.totalDmg).toLocaleString()}</span>
              {detPct > 0.5 && <span>引爆 {detPct.toFixed(1)}%</span>}
            </div>
          </div>
        </div>

        {/* Card 2: 秒均 DPS */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>
            <span>秒均 DPS</span>
            <span>{view.totalFrames.toLocaleString()} 帧</span>
          </div>
          <div className={styles.kpiValue}>{formatDpsCompact(view.dps)}</div>
          <div className={styles.kpiSubRow}>
            <span>
              失衡内伤害占比:{' '}
              {view.totalDmg > 0
                ? `${((view.inStunDmg / view.totalDmg) * 100).toFixed(1)}%`
                : '--'}
            </span>
            <span>{Math.round(view.dps).toLocaleString()}/s</span>
          </div>
        </div>

        {/* Card 3: 危局强袭战总分 */}
        <div className={`${styles.kpiCard} ${isFullKill ? styles.kpiCardGoldKill : ''}`}>
          <div className={styles.kpiLabel}>
            <span>危局强袭战总分</span>
            {isFullKill && (
              <span className={styles.killStampBadge}>
                {view.killTimeS ? `${view.killTimeS.toFixed(2)}s 斩杀` : '65,000 满分'}
              </span>
            )}
          </div>
          <div className={`${styles.kpiValue} ${isFullKill ? styles.kpiValueGold : ''}`}>
            {view.daTotalScore > 0 ? view.daTotalScore.toLocaleString() : '训练场木桩'}
          </div>
          <div className={styles.kpiSubRow}>
            {view.daTotalScore > 0 ? (
              <>
                <span>伤害 {view.daDmgScore.toLocaleString()}</span>
                <span>操作 +{view.daPerfScore.toLocaleString()}</span>
              </>
            ) : (
              <span>无29管血上限 · 木桩测试</span>
            )}
          </div>
        </div>

        {/* Card 4: 输出循环节奏标签 n失衡m大 */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>
            <span>失衡与大招节奏</span>
            <span>{view.swimlaneItems.length} 步动作</span>
          </div>
          <div className={styles.rhythmHeroBadge}>
            <span>⚡ {view.rhythmTag}</span>
          </div>
          <div className={styles.kpiSubRow}>
            <span>🤝 合轴脱手 {view.swapCancelCount} 次</span>
            <span>主C驻场 {view.fieldOccupancy.overallPct[0]?.toFixed(1) ?? '--'}%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
