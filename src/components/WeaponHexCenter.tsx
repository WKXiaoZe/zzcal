// src/components/WeaponHexCenter.tsx
// Clickable center anchor inside the DiscHexCard frame — the main C's W-Engine.
// State is mirrored to AppState.weapons.main (same channel as the WeaponPanel's
// dropdown / star buttons), so picking here also updates module 02.

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppState } from '../state/AppContext';
import { WEAPON_DB } from '../calc/db';
import { WEAPON_ICON } from '../calc/weaponIcons';
import { professionIconUrl, rarityIconUrl } from '../calc/agentIcons';
import type { BattleType } from '../calc/types';
import styles from './WeaponHexCenter.module.css';
import discStyles from './DiscHexCard.module.css';
import pickerStyles from './AgentWeaponPickers.module.css';

const MODE_TYPE_MAP: Record<BattleType, string> = {
  attack: '强攻',
  break:  '命破',
  anomaly: '异常',
  vanguard: '锋御',
};

interface PickerEntry {
  key: string;
  icon: string | null;
  rarity: 'A' | 'S';
  type: string;
}

function buildMainSlotCatalogue(battleType: BattleType): PickerEntry[] {
  const targetType = MODE_TYPE_MAP[battleType];
  return Object.entries(WEAPON_DB)
    .filter(([, w]) => w?.meta?.type === targetType && (w?.meta?.rarity === 'S' || w?.meta?.rarity === 'A'))
    .map(([name, w]) => {
      const file = WEAPON_ICON[name] ?? null;
      const rarity: 'A' | 'S' = w?.meta?.rarity === 'S' ? 'S' : 'A';
      return { key: name, icon: file, rarity, type: w?.meta?.type || targetType };
    });
}

export function WeaponHexCenter() {
  const { battleType, weapons } = useAppState();
  const dispatch = useAppDispatch();
  const cfg = weapons.main;

  const [open, setOpen] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const currentIcon = cfg.presetName ? WEAPON_ICON[cfg.presetName] ?? null : null;
  const currentStar = Math.min(5, Math.max(1, cfg.cinemaOrStar || 1));

  function openPicker() {
    setPendingKey(null);
    setOpen(true);
  }
  function closePicker() {
    setOpen(false);
    setPendingKey(null);
  }
  function pickWeapon(key: string) {
    setPendingKey(key);
  }
  function commitRefinement(star: number) {
    if (!pendingKey) return;
    dispatch({ type: 'SET_WEAPON_PRESET', slot: 'main', preset: pendingKey });
    dispatch({ type: 'SET_WEAPON_STAR',   slot: 'main', star });
    closePicker();
  }

  return (
    <>
      <button
        type="button"
        className={styles.centerBtn}
        onClick={openPicker}
        title={cfg.presetName ? `${cfg.presetName} · 精炼 ${currentStar}` : '点击选择主 C 音擎'}
      >
        {currentIcon ? (
          <>
            <img
              src={`/resources/weapon-icons/${currentIcon}`}
              alt=""
              className={styles.centerIcon}
            />
            <StarBar
              value={currentStar}
              onCommit={(star) => dispatch({ type: 'SET_WEAPON_STAR', slot: 'main', star })}
            />
          </>
        ) : cfg.presetName ? (
          <>
            <span className={styles.centerNoIcon}>{cfg.presetName[0]}</span>
            <StarBar
              value={currentStar}
              onCommit={(star) => dispatch({ type: 'SET_WEAPON_STAR', slot: 'main', star })}
            />
          </>
        ) : (
          <span className={styles.centerPlus}>+</span>
        )}
      </button>

      {open && (
        <WeaponPicker
          battleType={battleType}
          currentKey={cfg.presetName || null}
          currentStar={currentStar}
          pendingKey={pendingKey}
          onPickWeapon={pickWeapon}
          onBackToList={() => setPendingKey(null)}
          onCommit={commitRefinement}
          onClose={closePicker}
        />
      )}
    </>
  );
}

interface PickerProps {
  battleType: BattleType;
  currentKey: string | null;
  currentStar: number;
  pendingKey: string | null;
  onPickWeapon: (key: string) => void;
  onBackToList: () => void;
  onCommit: (star: number) => void;
  onClose: () => void;
}

function WeaponPicker(p: PickerProps) {
  const catalogue = useMemo(() => buildMainSlotCatalogue(p.battleType), [p.battleType]);
  const sRank = catalogue.filter((e) => e.rarity === 'S');
  const aRank = catalogue.filter((e) => e.rarity === 'A');

  const inRefinement = p.pendingKey !== null;
  const refinementIcon = p.pendingKey ? WEAPON_ICON[p.pendingKey] ?? null : null;

  return (
    <div className={discStyles.pickerBackdrop} onClick={p.onClose}>
      <div className={discStyles.pickerModal} onClick={(e) => e.stopPropagation()}>
        <div className={discStyles.pickerHeader}>
          <span>{inRefinement ? `选择精炼 — ${p.pendingKey}` : '选择主 C 音擎'}</span>
          <button type="button" className={discStyles.pickerClose} onClick={p.onClose}>×</button>
        </div>
        <div className={discStyles.pickerBody}>
          {inRefinement ? (
            <div className={styles.refinementBody}>
              {refinementIcon ? (
                <img
                  src={`/resources/weapon-icons/${refinementIcon}`}
                  alt=""
                  className={styles.refinementIcon}
                />
              ) : (
                <div className={styles.refinementIconFallback}>{p.pendingKey?.[0]}</div>
              )}
              <div className={styles.refinementHint}>选择精炼等级 (鼠标移到对应星星即预览)</div>
              <StarBar value={p.currentStar} onCommit={p.onCommit} />
              <button
                type="button"
                className={styles.refinementBack}
                onClick={p.onBackToList}
              >
                ← 重选音擎
              </button>
            </div>
          ) : (
            <div className={discStyles.pickerColumns}>
              <RarityColumn
                title="S 级音擎"
                entries={sRank}
                currentKey={p.currentKey}
                onPick={p.onPickWeapon}
              />
              <RarityColumn
                title="A 级音擎"
                entries={aRank}
                currentKey={p.currentKey}
                onPick={p.onPickWeapon}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RarityColumnProps {
  title: string;
  entries: PickerEntry[];
  currentKey: string | null;
  onPick: (key: string) => void;
}
function RarityColumn({ title, entries, currentKey, onPick }: RarityColumnProps) {
  return (
    <section className={discStyles.pickerColumn}>
      <div className={discStyles.pickerColumnHeader}>
        {title}
        <span className={discStyles.pickerColumnCount}>{entries.length}</span>
      </div>
      <div className={discStyles.pickerGrid}>
        {entries.map((e) => {
          const profIcon = professionIconUrl(e.type);
          const rarIcon = rarityIconUrl(e.rarity);
          return (
            <button
              key={e.key}
              type="button"
              className={`${discStyles.pickerCard} ${pickerStyles.pickerCardRel} ${currentKey === e.key ? discStyles.pickerCardActive : ''}`}
              onClick={() => onPick(e.key)}
            >
              {profIcon && (
                <div className={pickerStyles.pickerCardBadgesLeft}>
                  <img src={profIcon} alt={e.type} className={pickerStyles.pickerBadgeIcon} />
                </div>
              )}
              {rarIcon && (
                <div className={pickerStyles.pickerCardBadgeRight}>
                  <img src={rarIcon} alt={e.rarity} className={pickerStyles.pickerRarityIcon} />
                </div>
              )}
              {e.icon ? (
                <img
                  src={`/resources/weapon-icons/${e.icon}`}
                  alt=""
                  className={discStyles.pickerArt}
                />
              ) : (
                <div className={discStyles.pickerEmpty}>{e.key[0]}</div>
              )}
              <span className={discStyles.pickerName}>{e.key}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface StarBarProps {
  value: number;
  readonly?: boolean;
  onCommit?: (star: number) => void;
}
export function StarBar({ value, readonly, onCommit }: StarBarProps) {
  const [hover, setHover] = useState<number | null>(null);
  const displayed = hover !== null ? hover : value;
  return (
    <div
      className={`${styles.starBar} ${readonly ? styles.starBarReadonly : ''}`}
      onMouseLeave={() => setHover(null)}
      onClick={(e) => {
        if (!readonly) e.stopPropagation();
      }}
      aria-label="refinement"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={styles.starWrap}
          title={readonly ? undefined : `精炼 ${n} 阶`}
          onMouseEnter={readonly ? undefined : () => setHover(n)}
          onClick={
            readonly
              ? undefined
              : (e) => {
                  e.stopPropagation();
                  onCommit?.(n);
                }
          }
        >
          <img
            src={`/resources/weapon-icons/${n <= displayed ? 'IconItemStar01.png' : 'IconItemStar02.png'}`}
            alt=""
            className={styles.star}
            draggable={false}
          />
        </span>
      ))}
    </div>
  );
}
