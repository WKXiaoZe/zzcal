// src/components/WeaponPanel.tsx
// Per-slot (main / sup1 / sup2) weapon preset + star + field-overrides panel.
// Mirrors the legacy `#weapon-main / #weapon-sup1 / #weapon-sup2` sub-modules
// and the `weaponFields` definition (legacy/index-legacy.html line 601-620).
//
// Layout matches the agent-panel sibling so the two grids align visually.
import { useAppDispatch, useAppState } from '../state/AppContext';
import { WEAPON_DB } from '../calc/db';
import type { BattleType } from '../calc/types';
import styles from './WeaponPanel.module.css';

interface Props {
  slot: 'main' | 'sup1' | 'sup2';
  label: string;
}

interface WeaponField {
  id: string;
  label: string;
  /** When set, the field is only visible in matching battle modes. */
  cls?: 'break-hidden' | 'default-hidden' | 'anomaly-only';
}

// Verbatim copy of legacy `weaponFields` (line 601-620). Order preserved so
// the rendered grid matches the original visual layout.
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
  // Break-mode-only fields (legacy `default-hidden` ⇒ hidden unless break).
  { id: 'baseHp', label: '基础生命', cls: 'default-hidden' },
  { id: 'hpPct', label: '生命值%', cls: 'default-hidden' },
  { id: 'flatHp', label: '固定生命', cls: 'default-hidden' },
  { id: 'inCombatHpPct', label: '局内生命%', cls: 'default-hidden' },
  { id: 'inCombatPen', label: '局内贯穿力', cls: 'default-hidden' },
  { id: 'ppDmgBonus', label: '贯穿增伤%', cls: 'default-hidden' },
  // Anomaly-mode-only field.
  { id: 'anomalyMastery', label: '异常精通', cls: 'anomaly-only' },
];

// Legacy `MODE_TYPE_MAP` (line 669) — used to filter the main-weapon dropdown.
const MODE_TYPE_MAP: Record<BattleType, string> = {
  attack: '强攻',
  break: '命破',
  anomaly: '异常',
};

function isFieldVisible(cls: WeaponField['cls'], battleType: BattleType): boolean {
  // `break-hidden` = visible everywhere EXCEPT break
  // `default-hidden` = hidden by default; visible only in break
  // `anomaly-only` = visible only in anomaly
  if (cls === 'break-hidden') return battleType !== 'break';
  if (cls === 'default-hidden') return battleType === 'break';
  if (cls === 'anomaly-only') return battleType === 'anomaly';
  return true;
}

export function WeaponPanel({ slot, label }: Props) {
  const { weapons, battleType } = useAppState();
  const dispatch = useAppDispatch();
  const cfg = weapons[slot];

  // Main-slot dropdown is filtered to weapons whose meta.type matches the
  // current battle mode. Support slots show everything (sup buffs may apply
  // regardless of the main agent's mode).
  const targetType = MODE_TYPE_MAP[battleType];
  const presetOptions = Object.entries(WEAPON_DB)
    .filter(([, w]) => (slot === 'main' ? w?.meta?.type === targetType : true))
    .map(([name]) => name);

  const star = cfg.cinemaOrStar || 1;

  return (
    <section className={`sub-module ${styles.weaponPanel}`} id={`weapon-${slot}`}>
      <div className="module-title">
        <h3>{label}</h3>
      </div>

      <div className="preset-container">
        <div className="preset-row">
          <label htmlFor={`preset-w${slot}-select`}>预设文件</label>
          <select
            id={`preset-w${slot}-select`}
            value={cfg.presetName}
            onChange={(e) =>
              dispatch({ type: 'SET_WEAPON_PRESET', slot, preset: e.target.value })
            }
          >
            <option value="">-- 选择音擎 --</option>
            {presetOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="rank-row">
          <div className="star-group rank-selector" id={`star-w_${slot}`}>
            {[1, 2, 3, 4, 5].map((rank) => (
              <div
                key={rank}
                id={`btn-w_${slot}-s${rank}`}
                className={`rank-btn${rank <= star ? ' active' : ''}`}
                onClick={() =>
                  dispatch({ type: 'SET_WEAPON_STAR', slot, star: rank })
                }
              >
                ★
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.weaponFields}>
        {WEAPON_FIELDS.map((f) => {
          if (!isFieldVisible(f.cls, battleType)) return null;
          const value = cfg.customOverrides[f.id] ?? 0;
          return (
            <div
              key={f.id}
              className={`input-group${f.cls ? ` ${f.cls}` : ''}`}
            >
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
    </section>
  );
}
