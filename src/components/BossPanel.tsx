// src/components/BossPanel.tsx
import { useMemo } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import {
  DA_BOSS_STAGE_BUFFS,
  DA_SEASONS,
  formatBuffStatsSummary,
  stripGameTags,
} from '../calc/buffs';
import styles from './BossPanel.module.css';

const RES_OPTIONS: Array<{ value: 0 | 0.2 | 0.4; label: string }> = [
  { value: 0, label: '0%' },
  { value: 0.2, label: '20%' },
  { value: 0.4, label: '40%' },
];

export function BossPanel() {
  const state = useAppState();
  const { boss } = state;
  const dispatch = useAppDispatch();

  const daSeason = state.buffs?.daSeason ?? 52;
  const bossStageBuffs = state.buffs?.bossStageBuffs ?? {};

  const setNumber =
    (field: 'def' | 'defBonus' | 'dazeMult') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      dispatch({ type: 'SET_BOSS', field, value: Number.isFinite(v) ? v : 0 });
    };

  const setRes = (value: 0 | 0.2 | 0.4) => {
    if (boss.weak) return;
    dispatch({ type: 'SET_BOSS', field: 'res', value });
  };

  const toggleWeak = () => {
    const next = !boss.weak;
    dispatch({ type: 'SET_BOSS', field: 'weak', value: next });
    if (next && boss.res !== 0) {
      dispatch({ type: 'SET_BOSS', field: 'res', value: 0 });
    }
  };

  const currentSeasonInfo = useMemo(
    () => DA_SEASONS.find((s) => s.season === daSeason) ?? DA_SEASONS[0],
    [daSeason],
  );

  // Only show the Bosses & Stage Buffs belonging to the currently selected season
  const seasonBossBuffs = useMemo(() => {
    const buffById = new Map(DA_BOSS_STAGE_BUFFS.map((b) => [b.id, b]));
    return (currentSeasonInfo?.bossBuffIds ?? [])
      .map((id) => buffById.get(id))
      .filter((b): b is NonNullable<typeof b> => Boolean(b));
  }, [currentSeasonInfo]);

  return (
    <div className={`sub-module ${styles.bossPanel}`} id="mod-boss">
      <div className="module-title">
        <span>04 // 敌人数据 & 危局期次 / Boss</span>
      </div>
      <div>
        {/* 唯一危局期次选择入口：联动本面板 Boss 与右侧当期天气 Buff */}
        <div className={styles.seasonBar}>
          <label htmlFor="da-season-select" className={styles.seasonLabel}>
            危局强袭战期次
          </label>
          <select
            id="da-season-select"
            className={styles.seasonSelect}
            value={daSeason}
            onChange={(e) =>
              dispatch({ type: 'SET_DA_SEASON', season: Number(e.target.value) })
            }
          >
            {DA_SEASONS.map((s) => (
              <option key={s.season} value={s.season}>
                第 {String(s.season).padStart(2, '0')} 期 · v{s.version} ({s.dateLabel}) —{' '}
                {s.bosses.slice(0, 3).join(' / ')}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.bossInputsGrid}>
          <div className="input-group">
            <label htmlFor="boss-def">基础防御力</label>
            <input
              id="boss-def"
              type="number"
              value={boss.def}
              onChange={setNumber('def')}
            />
          </div>
          <div className="input-group">
            <label htmlFor="boss-def-bonus">防御加成 (%)</label>
            <input
              id="boss-def-bonus"
              type="number"
              value={boss.defBonus}
              onChange={setNumber('defBonus')}
            />
          </div>
          <div className="input-group">
            <label htmlFor="boss-daze-mult">基础失衡倍率</label>
            <input
              id="boss-daze-mult"
              type="number"
              step="0.01"
              value={boss.dazeMult}
              onChange={setNumber('dazeMult')}
            />
          </div>
          <div className="input-group">
            <label>敌人弱点</label>
            <div className="switch-container">
              <button
                type="button"
                className={`zzz-btn${boss.weak ? ' active' : ''}`}
                onClick={toggleWeak}
              >
                {boss.weak ? '是' : '否'}
              </button>
            </div>
          </div>
        </div>

        <div className="input-group" style={{ marginTop: 10 }}>
          <label>敌人抗性</label>
          <div className="switch-container res-group">
            {RES_OPTIONS.map(({ value, label }) => {
              const isActive = boss.res === value;
              const isDisabled = boss.weak && value !== 0;
              return (
                <button
                  key={value}
                  type="button"
                  className={`zzz-btn${isActive ? ' active' : ''}`}
                  disabled={isDisabled}
                  style={isDisabled ? { opacity: 0.5 } : undefined}
                  onClick={() => setRes(value)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 当期对应的 Boss 及场地 Buff 选择区 */}
        <div className={styles.buffSection}>
          <div className={styles.buffHeader}>
            <span>
              第 {currentSeasonInfo.season} 期 · 当期 Boss 场地 Buff
            </span>
            <span className={styles.datePill}>📅 {currentSeasonInfo.dateLabel}</span>
          </div>

          <div className={styles.buffList}>
            {seasonBossBuffs.map((b) => {
              const checked = !!bossStageBuffs[b.id];
              const badges = formatBuffStatsSummary(b.stats);
              return (
                <label
                  key={b.id}
                  className={`${styles.buffCard} ${checked ? styles.buffCardActive : ''}`}
                >
                  <div className={styles.buffTopRow}>
                    <input
                      type="checkbox"
                      className={styles.buffCheckbox}
                      checked={checked}
                      onChange={(e) =>
                        dispatch({
                          type: 'TOGGLE_BOSS_STAGE_BUFF',
                          buffId: b.id,
                          enabled: e.target.checked,
                        })
                      }
                    />
                    <span className={styles.subTypeTag}>{b.sourceName}</span>
                    {badges.length > 0 && (
                      <div className={styles.statBadges}>
                        {badges.map((bd, i) => (
                          <span key={i} className={styles.statBadge}>
                            {bd}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.buffDesc}>{stripGameTags(b.desc)}</div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
