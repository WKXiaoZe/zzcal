// src/components/DiscPanel.tsx
import { useMemo, type ChangeEvent } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { DISC_4_SETS, DISC_2_SETS, DISC_ROLE } from '../calc/discSets';
import { DISC_BUFFS, formatBuffStatsSummary, stripGameTags } from '../calc/buffs';
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
  const state = useAppState();
  const { battleType, disc } = state;
  const dispatch = useAppDispatch();

  const mainDisc4BuffEnabled = state.buffs?.mainDisc4BuffEnabled ?? true;
  const teamDiscBuffs = state.buffs?.teamDiscBuffs ?? {};

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
  const set2Display = disc.set2Keys[0] ?? 'none';
  const handleSet2Change = (v: string) =>
    dispatch({ type: 'SET_DISC_SET2', payload: v });

  const handleSubCountChange =
    (key: SubKey) => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = Number(e.target.value);
      const value = Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
      dispatch({ type: 'SET_DISC_SUBCOUNT', key, value });
    };

  const mainSet4Buff = disc.set4Key && disc.set4Key !== 'none' ? DISC_BUFFS[disc.set4Key] : undefined;

  // Sort team disc buffs: sup sets first, then dps sets
  const sortedDiscEntries = useMemo(() => {
    const entries = Object.entries(DISC_BUFFS);
    return entries.sort(([kA], [kB]) => {
      const rA = DISC_ROLE[kA] === 'sup' ? 0 : 1;
      const rB = DISC_ROLE[kB] === 'sup' ? 0 : 1;
      return rA - rB;
    });
  }, []);

  return (
    <div className={`module ${styles.discPanel}`} id="mod-preset-stats">
      <div className="module-title">
        <span>03 // 驱动盘主副词条 & 驱动盘Buff</span>
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

        {/* 主C 当前穿戴 4件套 Buff 开关与描述 */}
        {mainSet4Buff && (
          <div className={styles.buffSection}>
            <div className={styles.buffHeader}>
              <span>当前主C 驱动盘 4件套 Buff</span>
            </div>
            <label
              className={`${styles.buffCard} ${mainDisc4BuffEnabled ? styles.buffCardActive : ''}`}
            >
              <div className={styles.buffTopRow}>
                <input
                  type="checkbox"
                  className={styles.buffCheckbox}
                  checked={mainDisc4BuffEnabled}
                  onChange={(e) =>
                    dispatch({ type: 'TOGGLE_MAIN_DISC4_BUFF', enabled: e.target.checked })
                  }
                />
                <span className={styles.subTypeTag}>{mainSet4Buff.subType}</span>
                <span className={styles.buffTitle}>{mainSet4Buff.title}</span>
                <div className={styles.statBadges}>
                  {formatBuffStatsSummary(mainSet4Buff.stats).map((bd, i) => (
                    <span key={i} className={styles.statBadge}>
                      {bd}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.buffDesc}>{stripGameTags(mainSet4Buff.desc)}</div>
            </label>
          </div>
        )}

        {/* 队友/额外可选 驱动盘 4件套 Buff 选择区 */}
        <div className={styles.buffSection}>
          <div className={styles.buffHeader}>
            <span>可选驱动盘 4件套 Buff (队友/全队光环等)</span>
          </div>
          <div className={styles.buffList}>
            {sortedDiscEntries.map(([key, b]) => {
              if (key === disc.set4Key) return null;
              const checked = !!teamDiscBuffs[key];
              const badges = formatBuffStatsSummary(b.stats);
              return (
                <label
                  key={key}
                  className={`${styles.buffCard} ${checked ? styles.buffCardActive : ''}`}
                >
                  <div className={styles.buffTopRow}>
                    <input
                      type="checkbox"
                      className={styles.buffCheckbox}
                      checked={checked}
                      onChange={(e) =>
                        dispatch({
                          type: 'TOGGLE_TEAM_DISC_BUFF',
                          setKey: key,
                          enabled: e.target.checked,
                        })
                      }
                    />
                    <span className={styles.subTypeTag}>{b.subType}</span>
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
    </div>
  );
}
