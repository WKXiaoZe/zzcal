// src/components/AutoOptPanel.tsx
// Auto-optimization panel: runs the greedy substat optimizer for the current
// AppState and renders a Chart.js line graph of damage-vs-substat-budget per
// (slot5 × set2) combination, plus a "best config" callout.
//
// Mirrors legacy/index-legacy.html auto UI (line ~406-465) and the
// `runOptimizationDataOnly` / `drawChart` / `updateChartLine` functions
// (lines ~1828, 1985, 1647).

import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';

import { useAppState } from '../state/AppContext';
import { buildCalcInput } from '../calc/buildInput';
import {
  runGreedyOptimization,
  defaultSlot5Opts,
  defaultSet2Opts,
} from '../calc/optimizer';
import styles from './AutoOptPanel.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

// Target-step button choices. Legacy exposed 30/36/42 plus the implicit 48-cap;
// expose all four so users can inspect the curve at common milestones.
const TARGET_STEPS = [30, 36, 42, 48] as const;
type TargetStep = (typeof TARGET_STEPS)[number];

// Distinct, reasonably color-blind-friendly palette for up to 12 lines
// (3 slot5 × 4 set2 = 12 combos in attack/break mode).
const LINE_COLORS = [
  '#ff4d4d',
  '#dfff00',
  '#00ccff',
  '#ff9f43',
  '#9b59b6',
  '#1abc9c',
  '#e84393',
  '#fdcb6e',
  '#6c5ce7',
  '#00b894',
  '#fab1a0',
  '#74b9ff',
];

export function AutoOptPanel() {
  const state = useAppState();
  const [targetSteps, setTargetSteps] = useState<TargetStep>(48);

  // Build calc input + run optimizer. Memoized on the relevant slices so we
  // don't redo the (slot5×set2 × ~48 step × ~3 channel) sweep on every render.
  const results = useMemo(() => {
    const baseInput = buildCalcInput(state);
    const slot5Opts = defaultSlot5Opts(state.battleType);
    const set2Opts = defaultSet2Opts(state.battleType);

    // Map AppState subCounts (uppercase CR/CD/ATK/HP/AM) → optimizer
    // SubstatCounts (lowercase cr/cd/atk/hp/am).
    const sc = state.disc.subCounts;
    const startCounts = {
      cr: sc.CR,
      cd: sc.CD,
      atk: sc.ATK,
      hp: sc.HP,
      am: sc.AM,
    };

    return runGreedyOptimization(baseInput, {
      slot5Opts,
      set2Opts,
      startCounts,
      budget: targetSteps,
    });
  }, [state, targetSteps]);

  // X axis = union of all step values across configs (already identical per
  // run since every config shares the same budget).
  const labels = useMemo(() => {
    if (results.length === 0) return [] as number[];
    return results[0].history.map((h) => h.step);
  }, [results]);

  const chartData = useMemo<ChartData<'line'>>(() => {
    return {
      labels: labels.map(String),
      datasets: results.map((res, idx) => ({
        label: res.name,
        data: res.history.map((h) => h.dmg),
        borderColor: LINE_COLORS[idx % LINE_COLORS.length],
        backgroundColor: LINE_COLORS[idx % LINE_COLORS.length],
        borderWidth: 2,
        pointRadius: 1,
        tension: 0.15,
      })),
    };
  }, [labels, results]);

  const chartOptions = useMemo<ChartOptions<'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#fff', boxWidth: 12 },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: (ctx) => {
              const v = ctx.parsed.y;
              return `${ctx.dataset.label}: ${Math.floor(v).toLocaleString()}`;
            },
          },
        },
      },
      interaction: { mode: 'nearest', axis: 'x', intersect: false },
      scales: {
        x: {
          title: { display: true, text: '副词条步数', color: '#bbb' },
          ticks: { color: '#bbb' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          title: { display: true, text: '伤害', color: '#bbb' },
          ticks: {
            color: '#bbb',
            callback: (val) => Math.floor(Number(val)).toLocaleString(),
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    }),
    [],
  );

  // Pick the (slot5, set2) combo whose final-step damage is highest.
  const best = useMemo(() => {
    let bestRes: { name: string; dmg: number } | null = null;
    for (const r of results) {
      const last = r.history[r.history.length - 1];
      if (!last) continue;
      if (!bestRes || last.dmg > bestRes.dmg) {
        bestRes = { name: r.name, dmg: last.dmg };
      }
    }
    return bestRes;
  }, [results]);

  return (
    <section className="sub-module" id="auto-opt-panel">
      <div className="module-title"><span>自动优化</span></div>

      <div
        className={styles.optControls}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span style={{ color: '#fff', marginRight: 8 }}>目标步数：</span>
        {TARGET_STEPS.map((n) => (
          <button
            key={n}
            type="button"
            className={`zzz-btn${targetSteps === n ? ' active' : ''}`}
            id={`opt-btn-${n}`}
            onClick={() => setTargetSteps(n)}
          >
            {n}词
          </button>
        ))}
      </div>

      <div className={styles.chartWrapper} style={{ position: 'relative', height: 360 }}>
        {results.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div style={{ color: '#888', padding: 20 }}>暂无数据</div>
        )}
      </div>

      <div
        className={styles.optConfigBox}
        style={{
          marginTop: 16,
          padding: 12,
          background: 'rgba(0,0,0,0.35)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className={styles.optConfigTitle} style={{ color: '#bbb', fontSize: 12 }}>
          最佳组合（在 {targetSteps} 词数）
        </div>
        {best ? (
          <>
            <div
              className={styles.optConfigVal}
              style={{ color: '#fff', fontSize: 18, marginTop: 4 }}
            >
              {best.name}
            </div>
            <div
              className="opt-config-dmg"
              style={{ color: '#dfff00', fontSize: 22, fontWeight: 700, marginTop: 4 }}
            >
              {Math.floor(best.dmg).toLocaleString()}
            </div>
          </>
        ) : (
          <div className={styles.optConfigVal} style={{ color: '#888', marginTop: 4 }}>
            --
          </div>
        )}
      </div>
    </section>
  );
}
