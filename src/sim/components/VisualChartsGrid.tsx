// src/sim/components/VisualChartsGrid.tsx
// ③ 四大交互式可视化图表（基于 react-chartjs-2 / Chart.js + 自定义 Canvas 失衡带插件）

import { useMemo, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from 'chart.js';
import styles from '../sim.module.css';
import { formatDamageCompact, type NormalizedSimView } from './simAdapter';
import type { PresetIndexItem, SunOverviewBundle } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

export interface VisualChartsGridProps {
  view: NormalizedSimView;
  overview: SunOverviewBundle | null;
  presets: PresetIndexItem[];
  onLoadPresetByIdOrPath: (presetId?: string, presetPath?: string) => void;
}

type LadderTab = 'cost' | 'mindscape' | 'weather' | 'uni_presets';

export function VisualChartsGrid({
  view,
  overview,
  presets,
  onLoadPresetByIdOrPath,
}: VisualChartsGridProps) {
  const [ladderTab, setLadderTab] = useState<LadderTab>(
    view.engine === 'uni344' ? 'uni_presets' : 'cost',
  );
  const [msTierIdx, setMsTierIdx] = useState<number>(0);

  // =========================================================================
  // 图表 1：累计伤害 (左轴·亿) + 瞬时爆发 DPS (右轴·万/s) + ★失衡窗高亮插件
  // =========================================================================
  const stunPhases = useMemo(
    () => view.bossPhases.filter((p) => p.kind === 'stun'),
    [view.bossPhases],
  );

  const stunBandPlugin = useMemo<Plugin<'line'>>(
    () => ({
      id: 'simStunBands',
      beforeDatasetsDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const xScale = scales.x;
        if (!chartArea || !xScale) return;
        const labels = view.timeSeries.labelsS;
        if (labels.length < 2) return;
        const maxT = labels[labels.length - 1] || 180;

        ctx.save();
        for (const sp of stunPhases) {
          const xStart =
            chartArea.left +
            (Math.max(0, sp.tStart) / maxT) * (chartArea.right - chartArea.left);
          const xEnd =
            chartArea.left +
            (Math.min(maxT, sp.tEnd) / maxT) * (chartArea.right - chartArea.left);
          if (xEnd <= xStart) continue;
          ctx.fillStyle = 'rgba(250, 204, 21, 0.14)';
          ctx.fillRect(
            xStart,
            chartArea.top,
            xEnd - xStart,
            chartArea.bottom - chartArea.top,
          );
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(xStart, chartArea.top);
          ctx.lineTo(xStart, chartArea.bottom);
          ctx.stroke();
        }
        ctx.restore();
      },
    }),
    [stunPhases, view.timeSeries.labelsS],
  );

  const curveData = useMemo<ChartData<'line'>>(
    () => ({
      labels: view.timeSeries.labelsS.map((s) => `${s}s`),
      datasets: [
        {
          label: '累计总伤害 (亿)',
          data: view.timeSeries.cumDmgM,
          yAxisID: 'yCum',
          borderColor: '#FDB2C8',
          backgroundColor: 'rgba(253, 178, 200, 0.18)',
          borderWidth: 2.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.25,
        },
        {
          label: '瞬时爆发 DPS (万/s)',
          data: view.timeSeries.burstDpsW,
          yAxisID: 'yDps',
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          borderWidth: 1.8,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
          tension: 0.28,
        },
      ],
    }),
    [view.timeSeries],
  );

  const curveOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#e4e4e7', boxWidth: 12, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = Number(ctx.parsed.y ?? 0);
              return ctx.datasetIndex === 0
                ? `累计总伤: ${val.toFixed(3)} 亿`
                : `瞬时爆发: ${val.toFixed(1)} 万/s`;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#a1a1aa', maxTicksLimit: 10, font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        yCum: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: '累计伤害 (亿)', color: '#FDB2C8', font: { size: 11 } },
          ticks: { color: '#FDB2C8', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
        yDps: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: '瞬时 DPS (万/s)', color: '#38bdf8', font: { size: 11 } },
          ticks: { color: '#38bdf8', font: { size: 10 } },
          grid: { drawOnChartArea: false },
        },
      },
    }),
    [],
  );

  // =========================================================================
  // 图表 2：伤害构成拆解图（直伤 vs [烬痕]引爆 vs 异常紊乱 + 角色占比 + 失衡内外占比）
  // =========================================================================
  const doughnutData = useMemo<ChartData<'doughnut'>>(() => {
    const agentDirect = Math.max(0, view.directDmg - (view.stageMechDmg ?? 0));
    const segs = [
      { label: '常规/锐化直伤', val: agentDirect, color: '#FDB2C8' },
      { label: '[烬痕]/特殊引爆', val: Math.max(0, view.detonatedDmg), color: '#ff9f43' },
      { label: '异常/紊乱结算', val: Math.max(0, view.anomDisorderDmg), color: '#38bdf8' },
      { label: '场地/机制真伤', val: Math.max(0, view.stageMechDmg ?? 0), color: '#fbbf24' },
    ].filter((s, idx) => idx === 0 || s.val > 0);

    return {
      labels: segs.map((s) => s.label),
      datasets: [
        {
          data: segs.map((s) => s.val),
          backgroundColor: segs.map((s) => s.color),
          borderColor: 'rgba(16, 16, 22, 0.95)',
          borderWidth: 2,
          hoverOffset: 5,
        },
      ],
    };
  }, [view.directDmg, view.detonatedDmg, view.anomDisorderDmg, view.stageMechDmg]);

  const doughnutOptions = useMemo<ChartOptions<'doughnut'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '64%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#d4d4d8', boxWidth: 10, font: { size: 10 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const v = Number(ctx.parsed || 0);
              const pct = view.totalDmg > 0 ? ((v / view.totalDmg) * 100).toFixed(1) : '0.0';
              return `${ctx.label}: ${formatDamageCompact(v)} (${pct}%)`;
            },
          },
        },
      },
    }),
    [view.totalDmg],
  );

  const inStunSharePct =
    view.totalDmg > 0 ? Math.min(100, (view.inStunDmg / view.totalDmg) * 100) : 0;

  // =========================================================================
  // 图表 3：三人驻场占比（全程 / 失衡前 / 失衡期）+ 主C能量/喧响/失衡节奏流
  // =========================================================================
  const occRows = useMemo(() => {
    const calcPctTriplet = (arr: [number, number, number]): [number, number, number] => {
      const s = arr[0] + arr[1] + arr[2];
      if (s <= 0) return [33.3, 33.3, 33.4];
      return [(arr[0] / s) * 100, (arr[1] / s) * 100, (arr[2] / s) * 100];
    };
    return [
      {
        title: '全程驻场占比',
        secs: view.fieldOccupancy.overallS,
        pcts: view.fieldOccupancy.overallPct,
      },
      {
        title: '失衡前打条期',
        secs: view.fieldOccupancy.preStunS,
        pcts: calcPctTriplet(view.fieldOccupancy.preStunS),
      },
      {
        title: '★失衡爆发期',
        secs: view.fieldOccupancy.inStunS,
        pcts: calcPctTriplet(view.fieldOccupancy.inStunS),
      },
    ];
  }, [view.fieldOccupancy]);

  const resourceLineData = useMemo<ChartData<'line'>>(
    () => ({
      labels: view.timeSeries.labelsS.map((s) => `${s}s`),
      datasets: [
        {
          label: `${view.agentNames[0]} 能量/锐能`,
          data: view.timeSeries.resourceMain,
          borderColor: '#fb7185',
          borderWidth: 1.8,
          pointRadius: 0,
          tension: 0.2,
        },
        {
          label: `主C喧响进度 (${view.mainDecibelCap}折算%)`,
          data: view.timeSeries.resourceDecibelMain.map((d) =>
            Number(Math.min(100, (d / view.mainDecibelCap) * 100).toFixed(1)),
          ),
          borderColor: '#facc15',
          borderWidth: 1.6,
          borderDash: [4, 3],
          pointRadius: 0,
          tension: 0.2,
        },
        {
          label: '当轮失衡积蓄 (%)',
          data: view.timeSeries.dazeCyclePct,
          borderColor: '#34d399',
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.15,
        },
      ],
    }),
    [view.timeSeries, view.agentNames],
  );

  const resourceLineOpts = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#d4d4d8', boxWidth: 10, font: { size: 10 } },
        },
      },
      scales: {
        x: {
          ticks: { color: '#a1a1aa', maxTicksLimit: 9, font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          min: 0,
          max: 125,
          ticks: { color: '#a1a1aa', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    }),
    [],
  );

  // =========================================================================
  // 图表 4：金数帕累托阶梯 / 影画收益阶梯 / 天气对比 / 通用预设榜 (点击柱子 0s 载入排轴!)
  // =========================================================================
  const ladderItems = useMemo(() => {
    if (ladderTab === 'cost' && overview?.costLadder?.championsByGold?.length) {
      return overview.costLadder.championsByGold.map((c) => ({
        label: `${c.limitedGold}金 [${c.code6 || c.shorthand.slice(0, 6)}]`,
        dmgM: Number(((c.uncapped180sDmg || c.totalDmg) / 1e8).toFixed(3)),
        rhythmTag: c.rhythmTag,
        killed: c.killed,
        killTimeS: c.killTimeS,
        score: c.daTotalScore,
        presetId: c.presetId,
        presetPath: c.presetPath,
        sub: c.detailLabel,
      }));
    }
    if (ladderTab === 'mindscape' && overview?.mindscapeLadder?.tiers?.length) {
      const tier =
        overview.mindscapeLadder.tiers[msTierIdx] || overview.mindscapeLadder.tiers[0];
      return tier.rows.map((r) => ({
        label: `挽昼 M${r.sunM} (${r.limitedGold}金)`,
        dmgM: Number((r.uncapped180sDmg / 1e8).toFixed(3)),
        rhythmTag: r.rhythmTag,
        killed: r.killed,
        killTimeS: r.killTimeS,
        score: r.daTotalScore,
        presetId: r.cappedPresetId || r.uncappedPresetId,
        presetPath: r.cappedPresetPath || r.uncappedPresetPath,
        sub: `较M0提升 +${r.vsM0DmgPct.toFixed(1)}% · 等效分 ${r.uncappedEquivScore}`,
      }));
    }
    if (ladderTab === 'weather' && overview?.costLadder?.stageBuffComparison6Gold?.length) {
      return overview.costLadder.stageBuffComparison6Gold.map((w) => ({
        label: w.stageBuffName.replace(/^\d+\s*/, '').slice(0, 14),
        dmgM: Number((w.totalDmg / 1e8).toFixed(3)),
        rhythmTag: w.rhythmTag || `${w.stunCount}失衡`,
        killed: w.killed,
        killTimeS: w.killTimeS,
        score: w.daTotalScore,
        presetId: undefined,
        presetPath: undefined,
        sub: w.stageBuffName,
      }));
    }
    // 通用编队预设或全量预设 Top 10
    const pool = presets.filter((p) =>
      ladderTab === 'uni_presets' ? p.engine === 'uni344' : p.engine === 'sun344',
    );
    const list = (pool.length > 0 ? pool : presets).slice(0, 10);
    return list.map((p) => ({
      label: `${p.title.slice(0, 12)} (${p.limitedGold}金)`,
      dmgM: Number((p.totalDmg / 1e8).toFixed(3)),
      rhythmTag: p.rhythmTag,
      killed: p.killed,
      killTimeS: p.killTimeS,
      score: p.daTotalScore,
      presetId: p.id,
      presetPath: p.path,
      sub: `${p.bossName} · ${p.rhythmTag}`,
    }));
  }, [ladderTab, msTierIdx, overview, presets]);

  const ladderChartData = useMemo<ChartData<'bar'>>(
    () => ({
      labels: ladderItems.map((i) => `${i.label} · ${i.rhythmTag}`),
      datasets: [
        {
          label: '180s 爆发总伤 / 实测伤害 (亿)',
          data: ladderItems.map((i) => i.dmgM),
          backgroundColor: ladderItems.map((i) =>
            i.killed ? 'rgba(250, 204, 21, 0.78)' : 'rgba(253, 178, 200, 0.72)',
          ),
          borderColor: ladderItems.map((i) => (i.killed ? '#facc15' : '#FDB2C8')),
          borderWidth: 1.5,
          borderRadius: 8,
        },
      ],
    }),
    [ladderItems],
  );

  const ladderChartOpts = useMemo<ChartOptions<'bar'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      onClick: (_event, elements) => {
        if (!elements || elements.length === 0) return;
        const idx = elements[0].index;
        const target = ladderItems[idx];
        if (target && (target.presetId || target.presetPath)) {
          onLoadPresetByIdOrPath(target.presetId, target.presetPath);
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const item = ladderItems[ctx.dataIndex];
              if (!item) return '';
              const killText =
                item.killed && item.killTimeS
                  ? ` · ${item.killTimeS.toFixed(2)}s 斩杀`
                  : item.score > 0
                    ? ` · 危局 ${item.score}分`
                    : '';
              return `伤害: ${item.dmgM.toFixed(3)}亿 · ${item.rhythmTag}${killText}`;
            },
            afterLabel: (ctx) => {
              const item = ladderItems[ctx.dataIndex];
              if (!item) return '';
              return item.presetId || item.presetPath
                ? `${item.sub} (点击柱体切换排轴)`
                : item.sub;
            },
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#d4d4d8', font: { size: 10 }, maxRotation: 26, minRotation: 0 },
          grid: { display: false },
        },
        y: {
          title: { display: true, text: '总伤害 (亿)', color: '#d4d4d8', font: { size: 11 } },
          ticks: { color: '#a1a1aa', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
      },
    }),
    [ladderItems, onLoadPresetByIdOrPath],
  );

  const occColors = ['#FDB2C8', '#34d399', '#60a5fa'];

  return (
    <section className={styles.chartsGrid2x2} id="sim-visual-charts">
      {/* 图 1: 累计伤害 & 瞬时爆发 DPS 双轴面积曲线 */}
      <div className={styles.chartCard}>
        <div className={styles.sectionHeader} style={{ marginBottom: 4 }}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionDot} />
            <h3 className={styles.sectionTitle}>累计伤害与瞬时爆发 DPS 曲线</h3>
          </div>
          <span className={styles.sectionSub}>金色竖带 = ★失衡爆发窗口</span>
        </div>
        <div className={styles.chartCanvasBox}>
          <Line
            key={`curve_${view.bossName}_${view.shorthand}_${view.totalDmg.toFixed(0)}`}
            data={curveData}
            options={curveOptions}
            plugins={[stunBandPlugin]}
          />
        </div>
      </div>

      {/* 图 2: 伤害构成拆解图 */}
      <div className={styles.chartCard}>
        <div className={styles.sectionHeader} style={{ marginBottom: 4 }}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionDot} />
            <h3 className={styles.sectionTitle}>伤害构成与角色/阶段贡献拆解</h3>
          </div>
          <span className={styles.sectionSub}>直伤 vs 引爆 vs 异常 · 失衡内外对比</span>
        </div>

        <div className={styles.breakdownSplit}>
          <div style={{ height: 210, position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>

          <div className={styles.metricBarList}>
            {view.actorDmgTotals.map((actor) => (
              <div key={actor.name} className={styles.metricBarItem}>
                <div className={styles.metricBarHeader}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{actor.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: actor.color }}>
                    {formatDamageCompact(actor.dmg)} ({actor.pct.toFixed(1)}%)
                  </span>
                </div>
                <div className={styles.stackedTrack} style={{ height: 8 }}>
                  <div
                    className={styles.stackedSeg}
                    style={{ width: `${Math.min(100, actor.pct)}%`, background: actor.color }}
                  />
                </div>
              </div>
            ))}

            <div className={styles.metricBarItem} style={{ marginTop: 6 }}>
              <div className={styles.metricBarHeader}>
                <span style={{ color: '#fde047', fontWeight: 700 }}>
                  ★失衡期内爆发 vs 常态打条伤害
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', color: '#fde047' }}>
                  {inStunSharePct.toFixed(1)}% / {(100 - inStunSharePct).toFixed(1)}%
                </span>
              </div>
              <div className={styles.stackedTrack} style={{ height: 10 }}>
                <div
                  className={styles.stackedSeg}
                  style={{ width: `${inStunSharePct}%`, background: '#facc15' }}
                  title={`失衡内伤害: ${formatDamageCompact(view.inStunDmg)}`}
                />
                <div
                  className={styles.stackedSeg}
                  style={{
                    width: `${Math.max(0, 100 - inStunSharePct)}%`,
                    background: 'rgba(148, 163, 184, 0.5)',
                  }}
                  title={`失衡外伤害: ${formatDamageCompact(view.preStunDmg)}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 图 3: 驻场时间占比与资源节奏图 */}
      <div className={styles.chartCard}>
        <div className={styles.sectionHeader} style={{ marginBottom: 4 }}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionDot} />
            <h3 className={styles.sectionTitle}>三人驻场占比 & 能量/喧响/失衡流转</h3>
          </div>
          <div className={styles.miniPillRow}>
            {view.agentNames.map((n, i) => (
              <span
                key={n}
                style={{
                  fontSize: '0.7rem',
                  color: occColors[i],
                  fontWeight: 700,
                }}
              >
                ● {n}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {occRows.map((row) => (
            <div key={row.title} className={styles.metricBarItem}>
              <div className={styles.metricBarHeader}>
                <span style={{ color: 'rgba(255,255,255,0.78)', fontWeight: 600 }}>
                  {row.title}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#a1a1aa' }}>
                  {view.agentNames
                    .map((n, i) => `${n} ${row.pcts[i]?.toFixed(1) ?? 0}% (${row.secs[i]?.toFixed(1) ?? 0}s)`)
                    .join(' · ')}
                </span>
              </div>
              <div className={styles.stackedTrack} style={{ height: 11 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={styles.stackedSeg}
                    style={{
                      width: `${Math.max(0, row.pcts[i] ?? 0)}%`,
                      background: occColors[i],
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.chartCanvasBoxSm} style={{ height: 165 }}>
          <Line data={resourceLineData} options={resourceLineOpts} />
        </div>
      </div>

      {/* 图 4: 金数与影画对比图 */}
      <div className={styles.chartCard}>
        <div className={styles.sectionHeader} style={{ marginBottom: 4 }}>
          <div className={styles.sectionTitleGroup}>
            <span className={styles.sectionDot} />
            <h3 className={styles.sectionTitle}>不同金数与影画伤害对比 (点击柱体切换排轴)</h3>
          </div>

          <div className={styles.zoomBtnGroup}>
            <button
              type="button"
              className={`${styles.miniRankBtn} ${ladderTab === 'cost' ? styles.miniRankBtnActive : ''}`}
              onClick={() => setLadderTab('cost')}
            >
              💰 金数对比
            </button>
            <button
              type="button"
              className={`${styles.miniRankBtn} ${ladderTab === 'mindscape' ? styles.miniRankBtnActive : ''}`}
              onClick={() => setLadderTab('mindscape')}
            >
              🌟 影画 M0-M6
            </button>
            <button
              type="button"
              className={`${styles.miniRankBtn} ${ladderTab === 'weather' ? styles.miniRankBtnActive : ''}`}
              onClick={() => setLadderTab('weather')}
            >
              🌦️ 天气对比
            </button>
            {presets.some((p) => p.engine === 'uni344') && (
              <button
                type="button"
                className={`${styles.miniRankBtn} ${ladderTab === 'uni_presets' ? styles.miniRankBtnActive : ''}`}
                onClick={() => setLadderTab('uni_presets')}
              >
                🌐 通用编队
              </button>
            )}
          </div>
        </div>

        {ladderTab === 'mindscape' &&
          overview?.mindscapeLadder?.tiers &&
          overview.mindscapeLadder.tiers.length > 1 && (
            <div className={styles.miniPillRow}>
              {overview.mindscapeLadder.tiers.map((t, idx) => (
                <button
                  key={t.teammateLabel}
                  type="button"
                  className={`${styles.miniRankBtn} ${msTierIdx === idx ? styles.miniRankBtnActive : ''}`}
                  onClick={() => setMsTierIdx(idx)}
                >
                  {t.teammateLabel}
                </button>
              ))}
            </div>
          )}

        <div className={styles.chartCanvasBox} style={{ height: 235, cursor: 'pointer' }}>
          <Bar data={ladderChartData} options={ladderChartOpts} />
        </div>

        <div className={styles.kpiSubRow}>
          <span>金色柱代表达成 65,000 满分斩杀 (危局52 新生之结 3.40亿HP) · 点击柱体可载入对应排轴</span>
        </div>
      </div>
    </section>
  );
}
