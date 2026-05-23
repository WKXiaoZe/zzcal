// src/components/WeaponHexCenter.tsx
// Clickable center anchor inside the DiscHexCard frame — the main C's W-Engine.
// State is mirrored to AppState.weapons.main (same channel as the WeaponPanel's
// dropdown / star buttons), so picking here also updates module 02.
//
// Two-step picker overlay:
//   step 1 — weapon icon grid (filtered by current battleType to mirror the
//            WeaponPanel main-slot filter, which uses MODE_TYPE_MAP)
//   step 2 — refinement (1..5 ★) using the bundled IconItemStar01/02 PNGs
//            arranged in a compact overlapping row.
//
// Re-clicking the filled center re-opens at step 1 with the current weapon
// pre-highlighted (`currentKey` in picker props).

import { useMemo, useState } from 'react';
import { useAppDispatch, useAppState } from '../state/AppContext';
import { WEAPON_DB } from '../calc/db';
import { PRESET_FILES } from '../calc/presets';
import { WEAPON_ICON } from '../calc/weaponIcons';
import type { BattleType } from '../calc/types';
import styles from './WeaponHexCenter.module.css';
import discStyles from './DiscHexCard.module.css';

// Matches WeaponPanel.tsx — keep the two filters in lockstep so the hex
// center picker shows the same catalogue as the legacy dropdown.
const MODE_TYPE_MAP: Record<BattleType, string> = {
  attack: '强攻',
  break:  '命破',
  anomaly: '异常',
};

interface PickerEntry {
  /** zh weapon name = preset key in WEAPON_DB / PRESET_FILES.wpDPS */
  key: string;
  /** Icon filename under /resources/weapon-icons/, or null when missing. */
  icon: string | null;
  /** A or S — used to group the picker into two sections. */
  rarity: 'A' | 'S' | 'unknown';
}

function buildMainSlotCatalogue(battleType: BattleType): PickerEntry[] {
  const targetType = MODE_TYPE_MAP[battleType];
  const dbEntries: PickerEntry[] = Object.entries(WEAPON_DB)
    .filter(([, w]) => w?.meta?.type === targetType)
    .map(([name, w]) => {
      const file = WEAPON_ICON[name];
      let rarity: 'A' | 'S' | 'unknown' = 'unknown';
      const m = file?.match(/^Weapon_([AS])_/);
      if (m) rarity = m[1] as 'A' | 'S';
      else if (w?.meta?.rarity === 'A' || w?.meta?.rarity === 'S') rarity = w.meta.rarity;
      return { key: name, icon: file ?? null, rarity };
    });
  // JSON-only DPS presets (wpDPS folder) that aren't in WEAPON_DB. Same logic
  // as WeaponPanel.presetOptions — keep them selectable here too.
  const dbNames = new Set(dbEntries.map((e) => e.key));
  const extra: PickerEntry[] = PRESET_FILES.wpDPS
    .filter((n) => !dbNames.has(n))
    .map((name) => {
      const file = WEAPON_ICON[name];
      let rarity: 'A' | 'S' | 'unknown' = 'unknown';
      const m = file?.match(/^Weapon_([AS])_/);
      if (m) rarity = m[1] as 'A' | 'S';
      return { key: name, icon: file ?? null, rarity };
    });
  return [...dbEntries, ...extra];
}

export function WeaponHexCenter() {
  const { battleType, weapons } = useAppState();
  const dispatch = useAppDispatch();
  const cfg = weapons.main;

  const [open, setOpen] = useState(false);
  // Picker has two steps. `pendingKey` holds the weapon chosen in step 1
  // before its refinement is committed in step 2.
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
    // Dispatch sequence mirrors what WeaponPanel does for the same actions —
    // SET_WEAPON_PRESET clears customOverrides (per reducer), then SET_WEAPON_STAR
    // pins the chosen refinement. The async JSON loader inside WeaponPanel
    // picks up the new preset name and repopulates overrides automatically.
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
            <StarBar value={currentStar} readonly />
          </>
        ) : cfg.presetName ? (
          // Selected but no icon → show name initial in a circle as a fallback.
          <>
            <span className={styles.centerNoIcon}>{cfg.presetName[0]}</span>
            <StarBar value={currentStar} readonly />
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

/* ---------- Picker overlay ---------- */

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
  const aRank = catalogue.filter((e) => e.rarity === 'A' || e.rarity === 'unknown');

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
        {entries.map((e) => (
          <button
            key={e.key}
            type="button"
            className={`${discStyles.pickerCard} ${currentKey === e.key ? discStyles.pickerCardActive : ''}`}
            onClick={() => onPick(e.key)}
          >
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
        ))}
      </div>
    </section>
  );
}

/* ---------- Star bar ---------- */

interface StarBarProps {
  /** 1..5; the committed refinement to render when not hovering. */
  value: number;
  /** Read-only mode hides hover behavior — used by the center anchor display. */
  readonly?: boolean;
  /** Click handler invoked with the chosen refinement (1..5). Required when
   *  interactive (readonly=false). */
  onCommit?: (star: number) => void;
}
export function StarBar({ value, readonly, onCommit }: StarBarProps) {
  // null = "not hovering" → show committed value.
  const [hover, setHover] = useState<number | null>(null);
  const displayed = hover !== null ? hover : value;
  return (
    <div
      className={`${styles.starBar} ${readonly ? styles.starBarReadonly : ''}`}
      onMouseLeave={() => setHover(null)}
      aria-label="refinement"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={styles.starWrap}
          onMouseEnter={readonly ? undefined : () => setHover(n)}
          onClick={readonly ? undefined : () => onCommit?.(n)}
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
