// src/components/FieldBuffPanel.tsx
import { useMemo } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import {
  DA_WEATHER_BUFFS,
  DA_SEASONS,
  formatBuffStatsSummary,
  stripGameTags,
} from '../calc/buffs';
import type { AppState } from '../state/types';
import styles from './FieldBuffPanel.module.css';

type FieldKey = keyof AppState['field'];

const FIELDS: Array<{ key: FieldKey; label: string; id: string }> = [
  { key: 'atkPct', label: '局内攻击%', id: 'field_atkPct' },
  { key: 'critRate', label: '暴击率%', id: 'field_critRate' },
  { key: 'critDmg', label: '暴击伤害%', id: 'field_critDmg' },
  { key: 'dmgBonus', label: '增伤%', id: 'field_dmgBonus' },
  { key: 'resShred', label: '减抗%', id: 'field_resShred' },
  { key: 'inCombatAtkFlat', label: '局内攻击力（固定值）', id: 'field_inCombatAtkFlat' },
];

export function FieldBuffPanel() {
  const state = useAppState();
  const { field } = state;
  const dispatch = useAppDispatch();

  const daSeason = state.buffs?.daSeason ?? 52;
  const weatherBuffs = state.buffs?.weatherBuffs ?? {};

  const onChange = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    dispatch({ type: 'SET_FIELD', field: key, value: Number.isFinite(v) ? v : 0 });
  };

  const currentSeasonInfo = useMemo(
    () => DA_SEASONS.find((s) => s.season === daSeason) ?? DA_SEASONS[0],
    [daSeason],
  );

  // Only show the 3 Weather Buffs belonging to the currently selected season
  const seasonWeatherBuffs = useMemo(() => {
    const buffById = new Map(DA_WEATHER_BUFFS.map((b) => [b.id, b]));
    return (currentSeasonInfo?.weatherBuffIds ?? [])
      .map((id) => buffById.get(id))
      .filter((b): b is NonNullable<typeof b> => Boolean(b));
  }, [currentSeasonInfo]);

  return (
    <div className={`sub-module ${styles.fieldBuffPanel}`}>
      <div className="module-title">
        <span>场地BUFF (全局生效) & 当期危局天气</span>
      </div>
      <div className={styles.fieldsGrid}>
        {FIELDS.map(({ key, label, id }) => (
          <div className="input-group" key={key}>
            <label htmlFor={id}>{label}</label>
            <input
              id={id}
              type="number"
              value={field[key]}
              onChange={onChange(key)}
            />
          </div>
        ))}
      </div>

      {/* 当期对应的 3 项危局天气 Buff 选择区 */}
      <div className={styles.buffSection}>
        <div className={styles.buffHeader}>
          <span>
            第 {currentSeasonInfo.season} 期 (v{currentSeasonInfo.version}) · 当期天气 Buff (3选1)
          </span>
          <span className={styles.datePill}>📅 {currentSeasonInfo.dateLabel}</span>
        </div>

        <div className={styles.buffList}>
          {seasonWeatherBuffs.map((b, idx) => {
            const checked = !!weatherBuffs[b.id];
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
                        type: 'TOGGLE_WEATHER_BUFF',
                        buffId: b.id,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  <span className={styles.subTypeTag}>天气 {idx + 1}</span>
                  <span className={styles.buffTitle}>{b.title}</span>
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
  );
}
