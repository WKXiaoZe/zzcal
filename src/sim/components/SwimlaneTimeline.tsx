// src/sim/components/SwimlaneTimeline.tsx
// ② 交互式多轨战斗泳道时间轴（0s -> 180s）
// 支持桌面鼠标拖拽平移、触屏顺滑滑动、1x~10x 帧级缩放、快速跳转失衡窗、点击任意色块呼出 15 乘区透视抽屉

import { useMemo, useRef, useState } from 'react';
import styles from '../sim.module.css';
import {
  ACTION_CAT_META,
  formatDamageCompact,
  type ActionVisualCat,
  type NormalizedSimView,
  type SwimlaneActionItem,
} from './simAdapter';

export interface SwimlaneTimelineProps {
  view: NormalizedSimView;
  selectedRowIdx: number | null;
  onSelectStep: (rowIdx: number) => void;
}

const ZOOM_PRESETS = [
  { label: '1x 全景', pxPerSec: 6.8 },
  { label: '2.5x 循环', pxPerSec: 16 },
  { label: '5x 连段', pxPerSec: 32 },
  { label: '10x 逐帧', pxPerSec: 64 },
] as const;

export function SwimlaneTimeline({
  view,
  selectedRowIdx,
  onSelectStep,
}: SwimlaneTimelineProps) {
  const [pxPerSec, setPxPerSec] = useState<number>(16);
  const [mutedCats, setMutedCats] = useState<Record<string, boolean>>({});
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ active: boolean; startX: number; scrollLeft: number }>({
    active: false,
    startX: 0,
    scrollLeft: 0,
  });

  const horizonS = Math.max(30, Math.ceil(view.killTimeS ? Math.max(view.killTimeS + 4, 60) : view.totalSeconds));
  const timelineWidthPx = Math.max(760, Math.round(horizonS * pxPerSec));

  const ticks = useMemo(() => {
    const step = pxPerSec >= 45 ? 2 : pxPerSec >= 22 ? 5 : pxPerSec >= 12 ? 10 : 20;
    const arr: number[] = [];
    for (let t = 0; t <= horizonS; t += step) {
      arr.push(t);
    }
    return arr;
  }, [horizonS, pxPerSec]);

  const stunPhases = useMemo(
    () => view.bossPhases.filter((p) => p.kind === 'stun'),
    [view.bossPhases],
  );

  const slotItems = useMemo(() => {
    const grouped: [
      SwimlaneActionItem[],
      SwimlaneActionItem[],
      SwimlaneActionItem[],
      SwimlaneActionItem[],
      SwimlaneActionItem[],
    ] = [[], [], [], [], []];
    for (const item of view.swimlaneItems) {
      if (mutedCats[item.cat]) continue;
      grouped[item.slotIndex].push(item);
    }
    return grouped;
  }, [view.swimlaneItems, mutedCats]);

  const jumpToSecond = (sec: number) => {
    if (!viewportRef.current) return;
    const targetX = Math.max(0, sec * pxPerSec - 80);
    viewportRef.current.scrollTo({ left: targetX, behavior: 'smooth' });
  };

  const toggleCat = (cat: ActionVisualCat) => {
    setMutedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    if (!viewportRef.current) return;
    dragState.current = {
      active: true,
      startX: e.pageX,
      scrollLeft: viewportRef.current.scrollLeft,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.active || !viewportRef.current) return;
    const dx = e.pageX - dragState.current.startX;
    if (Math.abs(dx) > 4) {
      viewportRef.current.scrollLeft = dragState.current.scrollLeft - dx;
    }
  };

  const stopDrag = () => {
    dragState.current.active = false;
  };

  const agentTrackTitles: Array<{ slot: 0 | 1 | 2 | 3 | 4; name: string; sub: string }> = [
    {
      slot: 0,
      name: `① ${view.agentNames[0]}`,
      sub: `驻场 ${view.fieldOccupancy.overallPct[0]?.toFixed(1) ?? 0}%`,
    },
    {
      slot: 1,
      name: `② ${view.agentNames[1]}`,
      sub: `驻场 ${view.fieldOccupancy.overallPct[1]?.toFixed(1) ?? 0}%`,
    },
    {
      slot: 2,
      name: `③ ${view.agentNames[2]}`,
      sub: `驻场 ${view.fieldOccupancy.overallPct[2]?.toFixed(1) ?? 0}%`,
    },
  ];
  if (slotItems[3].length > 0) {
    agentTrackTitles.push({
      slot: 3,
      name: `🐾 ${view.bangbooName}`,
      sub: `${slotItems[3].length} 次后台协战`,
    });
  }
  if (slotItems[4].length > 0) {
    agentTrackTitles.push({
      slot: 4,
      name: '💥 场地/首领机制',
      sub: `${slotItems[4].length} 次机制真伤`,
    });
  }

  return (
    <section className={styles.glassCard} id="sim-swimlane-section">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleGroup}>
          <span className={styles.sectionDot} />
          <h3 className={styles.sectionTitle}>动作时间轴 (0s → {horizonS}s)</h3>
          <span className={styles.sectionSub}>
            点击任意招式色块查看单步乘区与面板详情 · 左右拖拽平移
          </span>
        </div>

        <div className={styles.zoomBtnGroup}>
          {ZOOM_PRESETS.map((z) => (
            <button
              key={z.label}
              type="button"
              className={`${styles.miniRankBtn} ${
                Math.abs(pxPerSec - z.pxPerSec) < 1 ? styles.miniRankBtnActive : ''
              }`}
              onClick={() => setPxPerSec(z.pxPerSec)}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* 快捷失衡窗跳转 + 招式颜色图例 */}
      <div className={styles.timelineControls}>
        <div className={styles.zoomBtnGroup}>
          <span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.58)', marginRight: 4 }}>
            定位爆发窗:
          </span>
          <button
            type="button"
            className={styles.miniRankBtn}
            onClick={() => jumpToSecond(0)}
          >
            0s 开局
          </button>
          {stunPhases.map((sp) => (
            <button
              key={`${sp.index}_${sp.tStart}`}
              type="button"
              className={styles.miniRankBtn}
              style={{ borderColor: 'rgba(250, 204, 21, 0.45)', color: '#fde047' }}
              onClick={() => jumpToSecond(sp.tStart)}
              title={`爆发窗口伤害: ${formatDamageCompact(sp.windowDmg)}`}
            >
              {sp.label} ({sp.tStart.toFixed(1)}s)
            </button>
          ))}
        </div>

        <div className={styles.legendRow} style={{ marginBottom: 0 }}>
          {(Object.keys(ACTION_CAT_META) as ActionVisualCat[]).map((cat) => {
            const meta = ACTION_CAT_META[cat];
            const isMuted = Boolean(mutedCats[cat]);
            return (
              <span
                key={cat}
                className={`${styles.legendChip} ${isMuted ? styles.legendChipMuted : ''}`}
                onClick={() => toggleCat(cat)}
                title="点击过滤/恢复该类招式显示"
              >
                <span
                  className={styles.legendSwatch}
                  style={{ background: meta.color }}
                />
                <span>{meta.label}</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 可横向平滑拖拽/触屏滑动的多轨时间轴视口 */}
      <div
        ref={viewportRef}
        className={styles.swimlaneViewport}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <div
          className={styles.swimlaneCanvas}
          style={{ width: timelineWidthPx + 132 }}
        >
          {/* 1. 时间标尺行 */}
          <div className={styles.swimlaneRow}>
            <div className={styles.trackLabelSticky}>
              <span className={styles.trackName}>⏱️ 时间轴 (60fps)</span>
            </div>
            <div
              className={`${styles.trackTimelineArea} ${styles.rulerArea}`}
              style={{ width: timelineWidthPx }}
            >
              {ticks.map((t) => (
                <div
                  key={t}
                  className={styles.tickMark}
                  style={{ left: t * pxPerSec }}
                >
                  <span className={styles.tickLabel}>{t}s</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Boss 状态轨 (★失衡窗 / 紫盾 / 无敌阶段) */}
          <div className={styles.swimlaneRow}>
            <div className={styles.trackLabelSticky}>
              <span className={styles.trackName} style={{ color: '#fde047' }}>
                👹 Boss 相位轨
              </span>
              <span className={styles.trackSub}>★失衡 {view.stunCount} 轮</span>
            </div>
            <div
              className={`${styles.trackTimelineArea} ${styles.bossTrackArea}`}
              style={{ width: timelineWidthPx }}
            >
              {view.bossPhases
                .filter((p) => p.kind !== 'normal')
                .map((p, idx) => {
                  const left = p.tStart * pxPerSec;
                  const width = Math.max(18, p.durationS * pxPerSec);
                  const styleByKind =
                    p.kind === 'stun'
                      ? {
                          background: 'rgba(250, 204, 21, 0.25)',
                          border: '1px solid rgba(250, 204, 21, 0.75)',
                          color: '#fef08a',
                        }
                      : p.kind === 'miasma'
                        ? {
                            background: 'rgba(168, 85, 247, 0.26)',
                            border: '1px solid rgba(192, 132, 252, 0.75)',
                            color: '#e9d5ff',
                          }
                        : {
                            background: 'rgba(244, 63, 94, 0.24)',
                            border: '1px solid rgba(251, 113, 133, 0.75)',
                            color: '#fecdd3',
                          };
                  return (
                    <div
                      key={`${p.kind}_${idx}`}
                      className={styles.bossPhasePill}
                      style={{ left, width, ...styleByKind }}
                      title={`${p.label}: ${p.tStart.toFixed(2)}s ~ ${p.tEnd.toFixed(2)}s (${p.durationS.toFixed(2)}s) · 窗口结算 ${formatDamageCompact(p.windowDmg)}`}
                    >
                      {p.label} {p.durationS.toFixed(1)}s · {formatDamageCompact(p.windowDmg)}
                    </div>
                  );
                })}
            </div>
          </div>

          {/* 3. 三名代理人 (+ 邦布) 动作泳道 */}
          {agentTrackTitles.map((track) => (
            <div key={track.slot} className={styles.swimlaneRow}>
              <div className={styles.trackLabelSticky}>
                <span className={styles.trackName}>{track.name}</span>
                <span className={styles.trackSub}>{track.sub}</span>
              </div>
              <div
                className={styles.trackTimelineArea}
                style={{ width: timelineWidthPx }}
              >
                {/* 铺底贯穿 ★失衡窗口 高亮色带 */}
                {stunPhases.map((sp) => (
                  <div
                    key={`band_${sp.index}_${sp.tStart}`}
                    className={styles.stunColumnBand}
                    style={{
                      left: sp.tStart * pxPerSec,
                      width: Math.max(4, sp.durationS * pxPerSec),
                    }}
                  />
                ))}
                {ticks.map((t) => (
                  <div
                    key={t}
                    className={styles.tickMark}
                    style={{ left: t * pxPerSec }}
                  />
                ))}

                {slotItems[track.slot].map((item) => {
                  const meta = ACTION_CAT_META[item.cat];
                  const left = item.tStart * pxPerSec;
                  const rawWidth = Math.max(item.tEnd - item.tStart, 0) * pxPerSec;
                  const width = item.isZeroFrame
                    ? Math.max(14, pxPerSec * 0.42)
                    : Math.max(10, rawWidth);
                  const isSelected = selectedRowIdx === item.rowIdx;

                  return (
                    <button
                      key={item.rowIdx}
                      type="button"
                      data-step-idx={item.rowIdx}
                      className={`${styles.actionBlock} ${
                        item.isZeroFrame ? styles.actionZeroFramePin : ''
                      } ${isSelected ? styles.actionBlockSelected : ''}`}
                      style={{
                        left,
                        width,
                        background: meta.bg,
                        color: meta.textColor,
                      }}
                      onClick={() => onSelectStep(item.rowIdx)}
                      title={`[#${item.rowIdx + 1}] ${item.fullLabel}\n时间: ${item.tStart.toFixed(2)}s → ${item.tEnd.toFixed(2)}s (${item.deltaF}f)\n模式: ${item.cancelMode}\n本步结算: ${formatDamageCompact(item.totalDmg)}${item.vbAdded > 0 ? ` (入池 +${formatDamageCompact(item.vbAdded)})` : ''}\n点击查看 15 乘区快照`}
                    >
                      {item.isSwapCancel && <span>⚡</span>}
                      {width >= 28 && <span>{item.shortLabel}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 4. 核心 Buff 覆盖条 */}
          {view.buffTracks.map((bt) => (
            <div key={bt.id} className={styles.swimlaneRow}>
              <div className={styles.trackLabelSticky}>
                <span className={styles.trackName} style={{ fontSize: '0.7rem' }}>
                  {bt.label}
                </span>
                <span className={styles.trackSub}>
                  全程 {bt.uptimePct.toFixed(0)}% · 失衡 {bt.inStunUptimePct.toFixed(0)}%
                </span>
              </div>
              <div
                className={`${styles.trackTimelineArea} ${styles.buffTrackArea}`}
                style={{ width: timelineWidthPx }}
              >
                {stunPhases.map((sp) => (
                  <div
                    key={`bb_${sp.index}_${sp.tStart}`}
                    className={styles.stunColumnBand}
                    style={{
                      left: sp.tStart * pxPerSec,
                      width: Math.max(4, sp.durationS * pxPerSec),
                    }}
                  />
                ))}
                {bt.segments.map((seg, sIdx) => (
                  <div
                    key={sIdx}
                    className={styles.buffSegmentBar}
                    style={{
                      left: seg.tStart * pxPerSec,
                      width: Math.max(4, (seg.tEnd - seg.tStart) * pxPerSec),
                      background: bt.color,
                    }}
                    title={`${bt.label}: ${seg.tStart.toFixed(2)}s ~ ${seg.tEnd.toFixed(2)}s`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
