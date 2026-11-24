// src/sim/components/ActionStreamCollapse.tsx
// 默认收起的「精简宏动作序列流 & JSON 导出/导入」折叠条（绝不默认铺任何大宽表）

import { useState } from 'react';
import styles from '../sim.module.css';
import { formatMacroChip } from './simAdapter';
import type { SearchResultData } from '../types';

export interface ActionStreamCollapseProps {
  data: SearchResultData;
  onSelectStep: (idx: number) => void;
  onImportResultJson: (imported: SearchResultData) => void;
  onToast: (msg: string) => void;
}

export function ActionStreamCollapse({
  data,
  onSelectStep,
  onImportResultJson,
  onToast,
}: ActionStreamCollapseProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleCopyMacros = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data.macros ?? [], null, 2));
    onToast('📋 已复制当前宏指令序列 JSON 到剪贴板');
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zzcal_sim_${data.shorthand || 'rotation'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const txt = await f.text();
      const parsed = JSON.parse(txt) as SearchResultData;
      if (!Array.isArray(parsed.rows)) {
        throw new Error('JSON 中不含合法的 rows 轨迹明细');
      }
      onImportResultJson(parsed);
      onToast(`📂 已导入排轴文件 ${f.name} (${parsed.rows.length} 步)`);
    } catch (err) {
      onToast(`⚠️ 导入失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <section className={styles.glassCard}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <button
          type="button"
          className={styles.btnGhost}
          onClick={() => setExpanded((v) => !v)}
        >
          <span>{expanded ? '▾ 收起' : '▸ 展开'} 动作指令序列 ({data.macros?.length ?? 0} 条宏 / {data.rows?.length ?? 0} 步)</span>
        </button>

        <div className={styles.zoomBtnGroup}>
          <button type="button" className={styles.btnGhost} onClick={() => void handleCopyMacros()}>
            📋 复制宏序列
          </button>
          <button type="button" className={styles.btnGhost} onClick={handleDownloadJson}>
            💾 导出排轴 JSON
          </button>
          <label className={styles.btnGhost} style={{ cursor: 'pointer', margin: 0 }}>
            📥 导入排轴 JSON
            <input
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={(e) => void handleImportFile(e)}
            />
          </label>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className={styles.macroChipFlow}>
            {(data.macros || []).map((m, i) => (
              <span
                key={i}
                className={styles.macroChip}
                onClick={() => {
                  const targetIdx = Math.min(i, Math.max(0, (data.rows?.length ?? 1) - 1));
                  onSelectStep(targetIdx);
                }}
                title="点击定位查看招式快照"
              >
                <strong style={{ color: 'rgba(255,255,255,0.45)', marginRight: 4 }}>
                  {i + 1}.
                </strong>
                {formatMacroChip(m)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
