// src/sim/components/StepInspectorDrawer.tsx
// 点击泳道任意色块滑出的「单招 15 乘区快照与机制透视抽屉（Step Inspector Drawer）」

import { useEffect } from 'react';
import styles from '../sim.module.css';
import {
  ACTION_CAT_META,
  buildStepInspection,
  formatDamageCompact,
  type NormalizedSimView,
} from './simAdapter';
import type { SearchResultData } from '../types';

export interface StepInspectorDrawerProps {
  stepIdx: number | null;
  data: SearchResultData | null;
  view: NormalizedSimView | null;
  sunSpecObj: Record<string, unknown> | null;
  onClose: () => void;
  onNavigateStep: (nextIdx: number) => void;
  onReportStep: (stepIdx: number) => void;
}

export function StepInspectorDrawer({
  stepIdx,
  data,
  view,
  sunSpecObj,
  onClose,
  onNavigateStep,
  onReportStep,
}: StepInspectorDrawerProps) {
  useEffect(() => {
    if (stepIdx == null || !data) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && stepIdx > 0) {
        onNavigateStep(stepIdx - 1);
      } else if (e.key === 'ArrowRight' && stepIdx + 1 < data.rows.length) {
        onNavigateStep(stepIdx + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stepIdx, data, onClose, onNavigateStep]);

  if (stepIdx == null || !data || !view || !data.rows[stepIdx]) {
    return null;
  }

  const detail = buildStepInspection(stepIdx, data, view, sunSpecObj);
  const catMeta = ACTION_CAT_META[detail.cat];
  const totalSteps = data.rows.length;

  const sumForBar = Math.max(
    1,
    detail.directDmg + detail.detonatedDmg + detail.anomDisorderDmg + detail.vbAdded,
  );
  const pDirect = (detail.directDmg / sumForBar) * 100;
  const pDet = (detail.detonatedDmg / sumForBar) * 100;
  const pAnom = (detail.anomDisorderDmg / sumForBar) * 100;
  const pPoolIn = (detail.vbAdded / sumForBar) * 100;

  return (
    <div
      className={styles.drawerBackdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside
        className={styles.drawerPanel}
        id="step-inspector-drawer"
        aria-label="单招 15 乘区快照与机制透视抽屉"
      >
        <div className={styles.drawerHeader}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  background: catMeta.bg,
                  color: catMeta.textColor,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 6,
                }}
              >
                #{stepIdx + 1} / {totalSteps} · {catMeta.label}
              </span>
              <span className={styles.kpiMetaTag}>SID {detail.row.sid}</span>
              <span className={styles.kpiMetaTag}>{detail.row.cancel_mode}</span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
              {detail.row.action_key}
            </h3>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'rgba(255,255,255,0.65)' }}>
              ⏱️ {detail.row.t_start.toFixed(2)}s → {detail.row.t_end.toFixed(2)}s · 前台占用{' '}
              <strong style={{ color: '#FDB2C8' }}>{detail.frameInfo.deltaF} 帧</strong> · Boss状态:{' '}
              <strong style={{ color: '#fde047' }}>{detail.row.stun_str}</strong>
            </div>
          </div>

          <button
            type="button"
            className={styles.btnGhost}
            onClick={onClose}
            aria-label="关闭单招抽屉"
          >
            ✕
          </button>
        </div>

        <div className={styles.drawerBody}>
          {/* 区块 A: 本步伤害构成拆解 */}
          <div className={styles.slotBuildCard}>
            <div className={styles.metricBarHeader}>
              <span style={{ fontWeight: 700, color: '#fff' }}>💥 本招结算总伤</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.18rem',
                  fontWeight: 800,
                  color: '#FDB2C8',
                }}
              >
                {formatDamageCompact(detail.totalDmg)} ({Math.round(detail.totalDmg).toLocaleString()})
              </span>
            </div>

            <div className={styles.stackedTrack} style={{ height: 10 }}>
              <div
                className={styles.stackedSeg}
                style={{ width: `${pDirect}%`, background: '#FDB2C8' }}
              />
              <div
                className={styles.stackedSeg}
                style={{ width: `${pDet}%`, background: '#ff9f43' }}
              />
              <div
                className={styles.stackedSeg}
                style={{ width: `${pAnom}%`, background: '#38bdf8' }}
              />
              <div
                className={styles.stackedSeg}
                style={{ width: `${pPoolIn}%`, background: '#c084fc' }}
              />
            </div>

            <div className={styles.kpiSubRow} style={{ marginTop: 2 }}>
              <span>直伤: {formatDamageCompact(detail.directDmg)}</span>
              {detail.detonatedDmg > 0 && (
                <span style={{ color: '#ff9f43' }}>
                  引爆结算: {formatDamageCompact(detail.detonatedDmg)}
                </span>
              )}
              {detail.vbAdded > 0 && (
                <span style={{ color: '#c084fc' }}>
                  注入[烬痕]池: +{formatDamageCompact(detail.vbAdded)}
                </span>
              )}
              {detail.anomDisorderDmg > 0 && (
                <span style={{ color: '#38bdf8' }}>
                  异常/紊乱: {formatDamageCompact(detail.anomDisorderDmg)}
                </span>
              )}
            </div>
          </div>

          {/* 区块 B: 帧数窗口与切人合轴透视 */}
          <div className={styles.slotBuildCard}>
            <div className={styles.metricBarHeader}>
              <span style={{ fontWeight: 700, color: '#fff' }}>🎞️ 帧窗口与合轴脱手分析</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#7dd3fc' }}>
                {detail.frameInfo.hwText}
              </span>
            </div>
            {detail.frameInfo.totF != null && detail.frameInfo.totF > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div
                  style={{
                    position: 'relative',
                    height: 16,
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  {/* 实际前台驻场帧占比 */}
                  <div
                    style={{
                      width: `${Math.min(100, (detail.frameInfo.deltaF / detail.frameInfo.totF) * 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #00d4ff, #FDB2C8)',
                    }}
                  />
                </div>
                <div className={styles.kpiSubRow}>
                  <span>脱手窗 f{detail.frameInfo.swapF}</span>
                  <span>连段窗 f{detail.frameInfo.canF}</span>
                  <span>完整总帧 {detail.frameInfo.totF}f (+顿帧 {detail.frameInfo.haltF ?? 0}f)</span>
                </div>
              </div>
            )}
            {detail.frameInfo.note && (
              <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.68)' }}>
                机制说明: {detail.frameInfo.note}
              </div>
            )}
          </div>

          {/* 区块 C: 15 乘区完整实时快照网格 */}
          <div>
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#ffffff',
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>🧮 单步乘区明细</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
                高亮项为当前生效的关键增益
              </span>
            </div>
            <div className={styles.multGrid15}>
              {detail.multipliers15.map((m) => (
                <div
                  key={m.idx}
                  className={`${styles.multCell} ${m.highlighted ? styles.multCellActive : ''}`}
                  title={m.formulaHint}
                >
                  <span className={styles.multCellName}>{m.name}</span>
                  <span className={styles.multCellVal}>{m.valueStr}</span>
                  <span className={styles.multCellHint}>{m.formulaHint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 区块 D: 激活 Buff 胶囊 & 全队资源水位 */}
          <div className={styles.slotBuildCard}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>
              ✨ 本步激活 Buff 快照
            </div>
            <div className={styles.miniPillRow}>
              {detail.activeBuffPills.length > 0 ? (
                detail.activeBuffPills.map((pill, idx) => (
                  <span key={idx} className={styles.kpiMetaTag}>
                    {pill}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.48)' }}>
                  常态无额外短期 Buff
                </span>
              )}
            </div>

            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', marginTop: 6 }}>
              🔋 动作结束瞬时资源水位
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {detail.resources.map((res, idx) => {
                const pct = res.max > 0 ? Math.min(100, Math.max(0, (res.val / res.max) * 100)) : 0;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div className={styles.kpiSubRow}>
                      <span>{res.label}</span>
                      <span style={{ color: '#fff' }}>
                        {res.unit ?? `${res.val.toFixed(1)} / ${res.max}`}
                      </span>
                    </div>
                    <div className={styles.stackedTrack} style={{ height: 6 }}>
                      <div
                        className={styles.stackedSeg}
                        style={{ width: `${pct}%`, background: res.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.drawerFooter}>
          <div className={styles.zoomBtnGroup}>
            <button
              type="button"
              className={styles.btnGhost}
              disabled={stepIdx <= 0}
              onClick={() => onNavigateStep(stepIdx - 1)}
            >
              ← 上一招
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              disabled={stepIdx + 1 >= totalSteps}
              onClick={() => onNavigateStep(stepIdx + 1)}
            >
              下一招 →
            </button>
          </div>

          <button
            type="button"
            id="btn-report-current-step"
            className={styles.btnGhost}
            style={{ borderColor: 'rgba(253, 178, 200, 0.45)', color: '#FDB2C8' }}
            onClick={() => onReportStep(stepIdx)}
          >
            🚩 反馈此步异常
          </button>
        </div>
      </aside>
    </div>
  );
}
