// src/components/LogPanel.tsx
// Collapsible calculation-detail log.
// Mirrors legacy `#calc-log` (index-legacy.html:482) + displayLog (line 1702),
// but in this React stage we only surface the raw trace strings that the
// caller passes in (e.g. CalcOutput.warnings). The richer per-zone breakdown
// from legacy displayLog will be ported in a later phase.

import styles from './LogPanel.module.css';

interface Props {
  trace: string[];
}

export function LogPanel({ trace }: Props) {
  return (
    <details className={styles.calcLog} open>
      <summary>计算细节</summary>
      <pre>{trace.length ? trace.join('\n') : '等待计算...'}</pre>
    </details>
  );
}
