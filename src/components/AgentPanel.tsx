// src/components/AgentPanel.tsx
// Single reusable panel for one of the three agent slots (main / sup1 / sup2).
// Mirrors legacy `<div class="sub-module" id="agent-main|sup1|sup2">` (legacy
// HTML L73-143) plus the JS-generated input grid driven by `agentFields`
// (legacy L579-599).
//
// Behavior carried over from legacy:
//   - main slot: preset list filtered by `battleType` (MODE_TYPE_MAP, L669).
//   - sup slots: preset list drawn from `CHARACTER_DB.sup`.
//   - cinema buttons toggle the slot's cinema rank and write `customOverrides`.
//   - field inputs default to 0 and only persist into `customOverrides` once
//     edited (preset values for those fields are applied lazily elsewhere).
//   - break/anomaly-specific fields are hidden in modes that don't use them,
//     matching legacy CSS classes `default-hidden` / `break-hidden` /
//     `anomaly-only` (legacy L584-598).

import { useMemo } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { CHARACTER_DB } from '../calc/db';
import type { BattleType } from '../calc/types';
import styles from './AgentPanel.module.css';

type SlotKey = 'main' | 'sup1' | 'sup2';

interface Props {
  slot: SlotKey;
  label: string;
}

interface FieldDef {
  id: string;
  label: string;
  /** Visibility class as in legacy CSS. */
  cls?: 'default-hidden' | 'break-hidden' | 'anomaly-only';
}

// Copied verbatim from legacy `agentFields` (index-legacy.html L579-599).
const AGENT_FIELDS: FieldDef[] = [
  { id: 'baseAtk', label: '基础攻击' },
  { id: 'critRate', label: '暴击率%' },
  { id: 'critDmg', label: '暴击伤害%' },
  { id: 'dmgBonus', label: '增伤%' },
  { id: 'penRatio', label: '穿透率%', cls: 'break-hidden' },
  { id: 'penValue', label: '穿透值', cls: 'break-hidden' },
  { id: 'defShred', label: '无视防御(减防)%', cls: 'break-hidden' },
  { id: 'dazeVuln', label: '失衡易伤%' },
  { id: 'resShred', label: '减抗%' },
  { id: 'inCombatAtkPct', label: '局内攻击%' },
  { id: 'inCombatAtkFlat', label: '局内固定攻击' },
  // Break-mode-only fields (hidden by default, shown only when battleType==='break')
  { id: 'baseHp', label: '基础生命', cls: 'default-hidden' },
  { id: 'hpPct', label: '生命值%', cls: 'default-hidden' },
  { id: 'flatHp', label: '固定生命', cls: 'default-hidden' },
  { id: 'inCombatHpPct', label: '局内生命%', cls: 'default-hidden' },
  { id: 'inCombatPen', label: '局内贯穿力', cls: 'default-hidden' },
  { id: 'ppDmgBonus', label: '贯穿增伤%', cls: 'default-hidden' },
  // Anomaly-mode-only field
  { id: 'anomalyMastery', label: '异常精通', cls: 'anomaly-only' },
];

// Legacy MODE_TYPE_MAP (L669) — used to filter the main-DPS preset list.
const MODE_TYPE_MAP: Record<BattleType, string> = {
  attack: '强攻',
  break: '命破',
  anomaly: '异常',
};

/** Returns true if a field with the given class should render in the current battleType. */
function isFieldVisible(cls: FieldDef['cls'], battleType: BattleType): boolean {
  if (!cls) return true;
  if (cls === 'break-hidden') return battleType !== 'break';
  if (cls === 'default-hidden') return battleType === 'break';
  if (cls === 'anomaly-only') return battleType === 'anomaly';
  return true;
}

export function AgentPanel({ slot, label }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { battleType } = state;
  const slotState = state.agents[slot];

  // Preset options: main pulls from `characters` filtered by battleType,
  // sup slots pull from the `sup` map.
  const presetOptions = useMemo<string[]>(() => {
    if (slot === 'main') {
      const targetType = MODE_TYPE_MAP[battleType];
      return Object.entries(CHARACTER_DB.characters)
        .filter(([, data]) => data.meta?.type === targetType)
        .map(([name]) => name);
    }
    const supMap = CHARACTER_DB.sup ?? {};
    return Object.keys(supMap);
  }, [slot, battleType]);

  const visibleFields = useMemo(
    () => AGENT_FIELDS.filter((f) => isFieldVisible(f.cls, battleType)),
    [battleType],
  );

  const prefix = slot === 'main' ? 'a_main' : slot === 'sup1' ? 'a_sup1' : 'a_sup2';

  return (
    <div className={`sub-module ${styles.agentPanel}`} id={`agent-${slot}`}>
      <h3>{label}</h3>

      {/* Preset selector + cinema buttons */}
      <div className="preset-container">
        <div className="preset-row">
          <label htmlFor={`preset-${slot}-select`}>预设文件</label>
          <select
            id={`preset-${slot}-select`}
            value={slotState.presetName}
            onChange={(e) =>
              dispatch({ type: 'SET_AGENT_PRESET', slot, preset: e.target.value })
            }
          >
            <option value="">-- 选择预设 --</option>
            {presetOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="rank-row">
          <div className="rank-selector cinema-group" id={`cinema-${prefix}`}>
            {[0, 1, 2, 3, 4, 5, 6].map((rank) => (
              <button
                key={rank}
                type="button"
                id={`btn-${prefix}-c${rank}`}
                className={`rank-btn${slotState.cinemaOrStar === rank ? ' active' : ''}`}
                onClick={() => dispatch({ type: 'SET_AGENT_CINEMA', slot, cinema: rank })}
              >
                {rank}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Field inputs */}
      {visibleFields.map((f) => {
        const overridden = slotState.customOverrides[f.id];
        const value = overridden ?? 0;
        return (
          <div key={f.id} className={`input-group ${f.cls ?? ''}`.trim()}>
            <label htmlFor={`${prefix}_${f.id}`}>{f.label}</label>
            <input
              type="number"
              id={`${prefix}_${f.id}`}
              value={value}
              onChange={(e) => {
                const raw = e.target.value;
                const num = raw === '' ? 0 : Number(raw);
                dispatch({
                  type: 'SET_AGENT_FIELD',
                  slot,
                  field: f.id,
                  value: Number.isFinite(num) ? num : 0,
                });
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
