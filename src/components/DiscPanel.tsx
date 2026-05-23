// src/components/DiscPanel.tsx
// 03 // 驱动盘主副词条 — DOM mirrors legacy/index-legacy.html lines 202-246.
// Renders the 4-slot main stat dropdown, 4-set + 2-set selectors, and the
// substat count inputs whose visible subset depends on battleType.
import type { ChangeEvent } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { DISC_4_SETS, DISC_2_SETS } from '../calc/discSets';
import type { DiscConfig } from '../state/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import styles from './DiscPanel.module.css';

type Slot4Stat = DiscConfig['slot4Stat'];
type SubKey = keyof DiscConfig['subCounts'];

interface Slot4Option {
  value: Slot4Stat;
  label: string;
  /** When true, only render in anomaly battle mode. */
  anomalyOnly?: boolean;
}

const SLOT4_OPTIONS: Slot4Option[] = [
  { value: 'critRate', label: '24% 暴击率' },
  { value: 'critDmg', label: '48% 暴击伤害' },
  { value: 'atkPct', label: '30% 攻击力' },
  { value: 'anomalyMastery', label: '92 异常精通', anomalyOnly: true },
];

interface SubCountField {
  key: SubKey;
  label: string;
}

const SUBCOUNT_FIELDS_ATTACK: SubCountField[] = [
  { key: 'CR', label: '暴击率词条 (2.4%/个)' },
  { key: 'CD', label: '暴击伤害词条 (4.8%/个)' },
  { key: 'ATK', label: '小攻击词条 (3%/个)' },
];

const SUBCOUNT_FIELDS_BREAK: SubCountField[] = [
  { key: 'CR', label: '暴击率词条 (2.4%/个)' },
  { key: 'CD', label: '暴击伤害词条 (4.8%/个)' },
  { key: 'HP', label: '小生命词条 (3%/个)' },
];

const SUBCOUNT_FIELDS_ANOMALY: SubCountField[] = [
  { key: 'ATK', label: '小攻击词条 (3%/个)' },
  { key: 'AM', label: '异常精通词条 (9/个)' },
];

export function DiscPanel() {
  const { battleType, disc } = useAppState();
  const dispatch = useAppDispatch();

  const slot4Options = SLOT4_OPTIONS.filter(
    (opt) => !opt.anomalyOnly || battleType === 'anomaly',
  );

  const subCountFields =
    battleType === 'attack'
      ? SUBCOUNT_FIELDS_ATTACK
      : battleType === 'break'
        ? SUBCOUNT_FIELDS_BREAK
        : SUBCOUNT_FIELDS_ANOMALY;

  const handleSlot4Change = (v: string) =>
    dispatch({ type: 'SET_DISC_SLOT4', payload: v as Slot4Stat });
  const handleSet4Change = (v: string) =>
    dispatch({ type: 'SET_DISC_SET4', payload: v });
  // Legacy single-select dropdown: collapses set2Keys to its first entry for
  // display, and writes a single-element list (or empty) on change. Hex picker
  // is the way to express 2+2+2 multi-set bonuses.
  const set2Display = disc.set2Keys[0] ?? 'none';
  const handleSet2Change = (v: string) =>
    dispatch({ type: 'SET_DISC_SET2', payload: v });

  const handleSubCountChange =
    (key: SubKey) => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = Number(e.target.value);
      const value = Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
      dispatch({ type: 'SET_DISC_SUBCOUNT', key, value });
    };

  return (
    <div className={`module ${styles.discPanel}`} id="mod-preset-stats">
      <div className="module-title">
        <span>03 // 驱动盘主副词条</span>
      </div>
      <div className="sub-module">
        <div className="input-group">
          <label htmlFor="slot4-select">4号位 (可选)</label>
          <Select value={disc.slot4Stat} onValueChange={handleSlot4Change}>
            <SelectTrigger id="slot4-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {slot4Options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="input-group">
          <label htmlFor="disc-set4-select">4 件套</label>
          <Select value={disc.set4Key} onValueChange={handleSet4Change}>
            <SelectTrigger id="disc-set4-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DISC_4_SETS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="input-group">
          <label htmlFor="disc-set2-select">2 件套</label>
          <Select value={set2Display} onValueChange={handleSet2Change}>
            <SelectTrigger id="disc-set2-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DISC_2_SETS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {subCountFields.map((field) => (
          <div className="input-group" key={field.key}>
            <label htmlFor={`disc-sub-${field.key}`}>{field.label}</label>
            <input
              id={`disc-sub-${field.key}`}
              type="number"
              min={0}
              step={1}
              value={disc.subCounts[field.key]}
              onChange={handleSubCountChange(field.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
