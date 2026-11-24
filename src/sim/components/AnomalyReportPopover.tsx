// src/sim/components/AnomalyReportPopover.tsx
// 运维入口 #1：面向所有公网用户的超轻量「🚩 数据异常反馈」浮层

import { useState } from 'react';
import styles from '../sim.module.css';
import { submitAnomalyReport } from '../dataLoader';
import type {
  AnomalyCategory,
  AnomalyReportPayload,
  SearchResultData,
  SimEngine,
} from '../types';
import type { NormalizedSimView } from './simAdapter';

const CATEGORY_OPTIONS: Array<{ key: AnomalyCategory; label: string }> = [
  { key: 'multiplier_mismatch', label: '倍率不符' },
  { key: 'buff_uptime', label: 'Buff覆盖异常' },
  { key: 'illegal_swap_cancel', label: '动作合轴非法' },
  { key: 'boss_mechanic', label: 'Boss机制' },
  { key: 'other', label: '其他' },
];

export interface AnomalyReportPopoverProps {
  open: boolean;
  stepIdx: number | null;
  engine: SimEngine;
  specVersion: string;
  presetId: string | null;
  buildSnapshot: Record<string, unknown>;
  resultData: SearchResultData | null;
  view: NormalizedSimView | null;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export function AnomalyReportPopover({
  open,
  stepIdx,
  engine,
  specVersion,
  presetId,
  buildSnapshot,
  resultData,
  view,
  onClose,
  onSuccessToast,
}: AnomalyReportPopoverProps) {
  const [category, setCategory] = useState<AnomalyCategory>('multiplier_mismatch');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  if (!open) return null;

  const targetStepRow =
    stepIdx != null && resultData?.rows?.[stepIdx] ? resultData.rows[stepIdx] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrMsg(null);
    try {
      const payload: AnomalyReportPayload = {
        category,
        message: message.trim(),
        stepIdx: stepIdx ?? null,
        engine,
        specVersion,
        presetId,
        summary: view
          ? {
              totalDmg: view.totalDmg,
              dps: view.dps,
              killed: view.killed,
              killTimeS: view.killTimeS,
              daTotalScore: view.daTotalScore,
              rhythmTag: view.rhythmTag,
              bossName: view.bossName,
              bossMode: view.bossMode,
              shorthand: view.shorthand,
            }
          : undefined,
        snapshot: {
          engine,
          presetId,
          build: buildSnapshot,
          stageBuffId: resultData?.stage_buff_id,
          bossMode: resultData?.boss_mode,
          bossId: resultData?.boss_mid,
          macros: resultData?.macros ?? [],
          stepIdx: stepIdx ?? null,
          stepRow: targetStepRow,
        },
      };

      const res = await submitAnomalyReport(payload);
      setMessage('');
      onClose();
      onSuccessToast(
        `✅ 异常反馈已提交入库${res.id ? ` (工单 #${res.id.slice(0, 8)})` : ''}，感谢共建校准！`,
      );
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.popoverOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <form className={styles.popoverCard} onSubmit={handleSubmit} id="anomaly-report-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
            🚩 数据与排轴异常反馈
          </h3>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={onClose}
            disabled={submitting}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>
          将自动附带当前规格版本 <code>{specVersion}</code>、配装与宏序列快照
          {stepIdx != null && targetStepRow ? (
            <>
              ，以及关联招式{' '}
              <strong style={{ color: '#FDB2C8' }}>
                #{stepIdx + 1} {targetStepRow.action_key}
              </strong>
            </>
          ) : null}
          。
        </div>

        <div className={styles.fieldCol}>
          <span className={styles.fieldLabel}>异常分类（单选）</span>
          <div className={styles.miniPillRow}>
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                data-report-cat={opt.key}
                className={`${styles.miniRankBtn} ${
                  category === opt.key ? styles.miniRankBtnActive : ''
                }`}
                onClick={() => setCategory(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldCol}>
          <label className={styles.fieldLabel} htmlFor="anomaly-note-input">
            <span>补充说明（可选，一句话描述现象或实测帧数/数值）</span>
            <span>{message.length}/280</span>
          </label>
          <input
            id="anomaly-note-input"
            type="text"
            maxLength={280}
            className={styles.simInput}
            style={{ textAlign: 'left', width: '100%' }}
            placeholder="例如：P1强化E合轴后极昼无视防御覆盖比实机少12帧..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {errMsg && (
          <div
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(255, 51, 85, 0.16)',
              border: '1px solid rgba(255, 51, 85, 0.5)',
              color: '#fda4af',
              fontSize: '0.76rem',
            }}
          >
            {errMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={onClose}
            disabled={submitting}
          >
            取消
          </button>
          <button
            type="submit"
            id="btn-submit-anomaly-report"
            className={styles.btnNeonPink}
            disabled={submitting}
          >
            {submitting ? '正在提交...' : '🚀 一键上报'}
          </button>
        </div>
      </form>
    </div>
  );
}
