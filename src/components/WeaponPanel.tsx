// src/components/WeaponPanel.tsx
import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppState } from '../state/AppContext';
import { WEAPON_DB } from '../calc/db';
import { WEAPON_BUFFS, formatBuffStatsSummary, stripGameTags } from '../calc/buffs';
import { buildWeapon } from '../calc/buildInput';
import { PRESET_FILES, loadPresetJson } from '../calc/presets';
import { parseWeaponValue } from '../calc/utils';
import { WeaponSelectorSlot } from './AgentWeaponPickers';
import pickerStyles from './AgentWeaponPickers.module.css';
import type { BattleType } from '../calc/types';
import styles from './WeaponPanel.module.css';

interface Props {
  slot: 'main' | 'sup1' | 'sup2';
  label: string;
}

interface WeaponField {
  id: string;
  label: string;
  cls?: 'break-hidden' | 'default-hidden' | 'anomaly-only';
}

const WEAPON_FIELDS: WeaponField[] = [
  { id: 'baseAtk', label: '基础攻击' },
  { id: 'critRate', label: '暴击率%' },
  { id: 'critDmg', label: '暴击伤害%' },
  { id: 'atkPct', label: '攻击力%' },
  { id: 'penRatio', label: '穿透率%', cls: 'break-hidden' },
  { id: 'defShred', label: '无视防御%', cls: 'break-hidden' },
  { id: 'resShred', label: '减抗%' },
  { id: 'dmgBonus', label: '增伤%' },
  { id: 'inCombatAtkPct', label: '局内攻击%' },
  { id: 'inCombatAtkFlat', label: '局内固定攻击' },
  { id: 'baseHp', label: '基础生命', cls: 'default-hidden' },
  { id: 'hpPct', label: '生命值%', cls: 'default-hidden' },
  { id: 'flatHp', label: '固定生命', cls: 'default-hidden' },
  { id: 'inCombatHpPct', label: '局内生命%', cls: 'default-hidden' },
  { id: 'inCombatPen', label: '局内贯穿力', cls: 'default-hidden' },
  { id: 'ppDmgBonus', label: '贯穿增伤%', cls: 'default-hidden' },
  { id: 'anomalyMastery', label: '异常精通', cls: 'anomaly-only' },
];

function isFieldVisible(cls: WeaponField['cls'], battleType: BattleType): boolean {
  if (cls === 'break-hidden') return battleType !== 'break';
  if (cls === 'default-hidden') return battleType === 'break';
  if (cls === 'anomaly-only') return battleType === 'anomaly';
  return true;
}

export function WeaponPanel({ slot, label }: Props) {
  const state = useAppState();
  const { weapons, battleType } = state;
  const dispatch = useAppDispatch();
  const cfg = weapons[slot];
  const weaponBuffEnabled = state.buffs?.weaponBuffEnabled?.[slot] ?? true;

  const star = Math.max(1, Math.min(5, cfg.cinemaOrStar || 1));

  const resolvedStats = useMemo(
    () => buildWeapon(cfg, slot, weaponBuffEnabled),
    [cfg, slot, weaponBuffEnabled],
  );

  const wpBuff = cfg.presetName ? WEAPON_BUFFS[cfg.presetName] : undefined;
  const currentRefDesc = wpBuff?.refinementDescs?.[star - 1] ?? wpBuff?.desc ?? '';
  const currentRefStats = wpBuff?.refinementStats?.[star - 1] ?? wpBuff?.stats;
  const badges = useMemo(() => formatBuffStatsSummary(currentRefStats), [currentRefStats]);

  useEffect(() => {
    const name = cfg.presetName;
    if (!name) return;
    if (WEAPON_DB[name]) return;
    const folder = slot === 'main' ? 'wpDPS' : 'wpSUP';
    if (!PRESET_FILES[folder].includes(name)) return;
    let cancelled = false;
    loadPresetJson(folder, name)
      .then((data) => {
        if (cancelled) return;
        const overrides: Record<string, number> = {};
        for (const f of WEAPON_FIELDS) {
          const raw = data[f.id];
          if (raw !== undefined) {
            overrides[f.id] = parseWeaponValue(raw, star);
          }
        }
        dispatch({ type: 'SET_WEAPON_OVERRIDES', slot, overrides });
      })
      .catch((err) => {
        console.warn(`[WeaponPanel] failed to load preset ${folder}/${name}.json:`, err);
      });
    return () => {
      cancelled = true;
    };
  }, [slot, cfg.presetName, star, dispatch]);

  return (
    <section className={`sub-module ${styles.weaponPanel}`} id={`weapon-${slot}`}>
      <div className="module-title">
        <span>{label}</span>
      </div>

      <div className={pickerStyles.singleDock}>
        <WeaponSelectorSlot slot={slot} />
      </div>

      <div className={styles.weaponFields}>
        {WEAPON_FIELDS.map((f) => {
          if (!isFieldVisible(f.cls, battleType)) return null;
          const overridden = cfg.customOverrides[f.id];
          const resolved = (resolvedStats as Record<string, number | undefined>)[f.id] ?? 0;
          const value = overridden ?? resolved;
          return (
            <div key={f.id} className={`input-group${f.cls ? ` ${f.cls}` : ''}`}>
              <label htmlFor={`w_${slot}_${f.id}`}>{f.label}</label>
              <input
                id={`w_${slot}_${f.id}`}
                type="number"
                value={value}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_WEAPON_FIELD',
                    slot,
                    field: f.id,
                    value: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          );
        })}
      </div>

      {/* 音擎被动特效 Buff 选择区 */}
      {wpBuff && (
        <div className={styles.buffSection}>
          <label
            className={`${styles.buffCard} ${weaponBuffEnabled ? styles.buffCardActive : ''}`}
          >
            <div className={styles.buffTopRow}>
              <input
                type="checkbox"
                className={styles.buffCheckbox}
                checked={weaponBuffEnabled}
                onChange={(e) =>
                  dispatch({
                    type: 'TOGGLE_WEAPON_BUFF',
                    slot,
                    enabled: e.target.checked,
                  })
                }
              />
              <span className={styles.subTypeTag}>音擎特效 ★{star}</span>
              <span className={styles.buffTitle}>{wpBuff.title}</span>
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
            <div className={styles.buffDesc}>{stripGameTags(currentRefDesc)}</div>
          </label>
        </div>
      )}
    </section>
  );
}
