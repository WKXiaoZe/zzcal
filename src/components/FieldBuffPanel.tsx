// src/components/FieldBuffPanel.tsx
// Field-wide buffs (apply to all agents). Mirrors legacy index-legacy.html lines 291-316.
// 6 numeric inputs dispatching SET_FIELD.
import { useAppState, useAppDispatch } from '../state/AppContext';
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
  const { field } = useAppState();
  const dispatch = useAppDispatch();

  const onChange = (key: FieldKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    dispatch({ type: 'SET_FIELD', field: key, value: Number.isFinite(v) ? v : 0 });
  };

  return (
    <div className={`sub-module ${styles.fieldBuffPanel}`}>
      <h3>场地BUFF (全局生效)</h3>
      <div className="grid-3">
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
    </div>
  );
}
