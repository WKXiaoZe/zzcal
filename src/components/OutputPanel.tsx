// src/components/OutputPanel.tsx
// Final damage + summary stat panel.
// Mirrors legacy `#opt-panel` (index-legacy.html:461) + renderPanel (line 1483).
// Field visibility per battleType matches legacy renderPanel exactly:
//   - attack : totalAtk, CR, CD, dmgBonus, penPct, penVal, defShred, resShred
//   - break  : totalPierce, maxHpInCombat, CR, CD, dmgBonus, resShred
//   - anomaly: totalAtk, anomalyMastery, dmgBonus, penPct, penVal, defShred, resShred
import { useMemo } from 'react';
import { useAppState } from '../state/AppContext';
import { buildCalcInput } from '../calc/buildInput';
import { calculateDamage } from '../calc/formulas';
import type { CalcDetails } from '../calc/types';
import { LogPanel } from './LogPanel';
import styles from './OutputPanel.module.css';

interface Row {
  label: string;
  value: string;
}

function fmtInt(n: number): string {
  return Math.floor(n).toString();
}

function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function buildRows(battleType: string, d: CalcDetails): Row[] {
  if (battleType === 'break') {
    return [
      { label: '总贯穿力',    value: fmtInt(d.totalPierce) },
      { label: '局内最大生命', value: fmtInt(d.maxHpInCombat || 0) },
      { label: '暴击率',      value: fmtPct(d.totalCR) },
      { label: '暴击伤害',    value: fmtPct(d.totalCD) },
      { label: '增伤区',      value: fmtPct(d.totalDmgBonus) },
      { label: '减抗',        value: fmtPct(d.totalResShred) },
    ];
  }
  if (battleType === 'anomaly') {
    return [
      { label: '总攻击力',        value: fmtInt(d.totalAtk) },
      { label: '异常精通',        value: d.totalAnomalyMastery.toFixed(0) },
      { label: '增伤区',          value: fmtPct(d.totalDmgBonus) },
      { label: '穿透率',          value: fmtPct(d.totalPenPct) },
      { label: '穿透值',          value: d.totalPenVal.toFixed(0) },
      { label: '无视防御(减防)',  value: fmtPct(d.totalDefShred) },
      { label: '减抗',            value: fmtPct(d.totalResShred) },
    ];
  }
  // attack (default)
  return [
    { label: '总攻击力',        value: fmtInt(d.totalAtk) },
    { label: '暴击率',          value: fmtPct(d.totalCR) },
    { label: '暴击伤害',        value: fmtPct(d.totalCD) },
    { label: '增伤区',          value: fmtPct(d.totalDmgBonus) },
    { label: '穿透率',          value: fmtPct(d.totalPenPct) },
    { label: '穿透值',          value: d.totalPenVal.toFixed(0) },
    { label: '无视防御(减防)',  value: fmtPct(d.totalDefShred) },
    { label: '减抗',            value: fmtPct(d.totalResShred) },
  ];
}

export function OutputPanel() {
  const state = useAppState();
  const result = useMemo(
    () => calculateDamage(buildCalcInput(state)),
    [state],
  );

  const rows = buildRows(state.battleType, result.details);

  return (
    <section className={`sub-module ${styles.outputPanel}`}>
      <div className="module-title"><span>最终伤害</span></div>
      <div
        className="opt-dmg"
        style={{
          fontSize: '2rem',
          color: 'var(--zzz-primary)',
          textAlign: 'right',
          textShadow: '0 0 10px var(--zzz-primary)',
        }}
      >
        {Math.floor(result.dmg).toLocaleString()}
      </div>

      <h3 style={{ marginTop: 20 }}>最终面板</h3>
      <div className={styles.panelData}>
        {rows.map((r) => (
          <div key={r.label} className={styles.panelRow}>
            <span>{r.label}</span>
            <span>{r.value}</span>
          </div>
        ))}
      </div>

      <LogPanel trace={result.warnings} />
    </section>
  );
}
