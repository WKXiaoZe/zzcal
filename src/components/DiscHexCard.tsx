// src/components/DiscHexCard.tsx
// Hex-shaped driver-disc layout card. Click a cavity to pick a disc set
// from the 26-suit catalogue; the picked suit's art replaces the default
// slot-number badge, with the matching SuitPositionXX corner badge added
// so the slot number stays readable.
//
// Slot ↔ visual position (per user spec):
//   visual left-top    → slot 1
//   visual left-mid    → slot 2
//   visual left-bot    → slot 3
//   visual right-top   → slot 6
//   visual right-mid   → slot 5
//   visual right-bot   → slot 4
//
// Cavity centers detected via OpenCV HoughCircles on the source PNG.
// Picker state is local (useState) — wiring to AppContext.disc would be a
// follow-up if/when the per-slot disc model gets adopted in calc.

import React, { useState } from 'react';
import { DISC_2_SETS, DISC_4_SETS, DISC_ROLE, SUIT_ART, type DiscRole } from '../calc/discSets';
import { useAppDispatch } from '../state/AppContext';
import { WeaponHexCenter } from './WeaponHexCenter';
import styles from './DiscHexCard.module.css';

/** 1..6 in-game slot numbers; same ids that drive SuitPositionXX.png. */
type SlotNum = 1 | 2 | 3 | 4 | 5 | 6;

interface Slot {
  slot: SlotNum;
  /** center x as % of frame width */
  cx: number;
  /** center y as % of frame height */
  cy: number;
}

// Cavity centers in % of frame. Auto-detected via OpenCV Hough Circle
// transform on the EquipBg04.png source (852×780); r≈107 → ~25% diameter.
const SLOTS: Slot[] = [
  { slot: 1, cx: 29.8, cy: 17.6 }, // left-top
  { slot: 2, cx: 16.3, cy: 49.7 }, // left-mid
  { slot: 3, cx: 29.9, cy: 81.9 }, // left-bot
  { slot: 4, cx: 70.2, cy: 82.2 }, // right-bot
  { slot: 5, cx: 84.0, cy: 49.7 }, // right-mid
  { slot: 6, cx: 70.1, cy: 17.8 }, // right-top
];

/** Diameter of each slot badge as % of frame width. */
const BADGE_SIZE_PCT = 25;

/** All 26 user-selectable disc set keys (excludes the 'none' sentinel). */
const SET_KEYS = Object.keys(DISC_4_SETS).filter((k) => k !== 'none');

interface PickerEntry { key: string; name: string; art: string; role: DiscRole }

/** Pre-baked picker entries grouped by role; order within each group
 *  follows DISC_4_SETS declaration order. */
const PICKER_BY_ROLE: Record<DiscRole, PickerEntry[]> = {
  dps: [],
  sup: [],
};
for (const key of SET_KEYS) {
  const role = DISC_ROLE[key] ?? 'dps';
  PICKER_BY_ROLE[role].push({
    key,
    name: DISC_4_SETS[key].name,
    art: SUIT_ART[key],
    role,
  });
}

/**
 * Derive (set4Key, set2Keys) from the 6 hex picks.
 *
 * Rules (per the v3 design — see DiscConfig.set2Keys docstring):
 *   set4Key  = the set with count ≥ 4 (at most one possible since 4+4=8>6),
 *              else 'none'.
 *   set2Keys = all sets with count ≥ 2, EXCEPT set4Key itself (its 2-piece
 *              is auto-added by buildCalcInput). Sorted by slot order of
 *              first appearance for stability.
 *
 * Game-rule check:
 *   4+2  (X,Y): set4='X', set2Keys=['Y']        ✓ adds X's 4p + X's 2p + Y's 2p
 *   2+2+2(X,Y,Z): set4='none', set2Keys=['X','Y','Z'] ✓ three 2-pieces
 *   6  X      : set4='X', set2Keys=[]            ✓ X's 4p + X's 2p (only one)
 */
export function deriveSetsFromPicks(
  picks: Record<SlotNum, string | null>,
): { set4Key: string; set2Keys: string[] } {
  const counts = new Map<string, number>();
  const firstSeen = new Map<string, number>();
  for (const slot of [1, 2, 3, 4, 5, 6] as SlotNum[]) {
    const k = picks[slot];
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
    if (!firstSeen.has(k)) firstSeen.set(k, slot);
  }
  let set4Key = 'none';
  for (const [k, c] of counts) {
    if (c >= 4) { set4Key = k; break; }
  }
  const set2Keys = [...counts.entries()]
    .filter(([k, c]) => c >= 2 && k !== set4Key)
    .sort((a, b) => (firstSeen.get(a[0]) ?? 99) - (firstSeen.get(b[0]) ?? 99))
    .map(([k]) => k);
  return { set4Key, set2Keys };
}

export function DiscHexCard() {
  const dispatch = useAppDispatch();
  /** slot number → disc-set key (null = empty cavity, shows default badge). */
  const [picks, setPicks] = useState<Record<SlotNum, string | null>>({
    1: null, 2: null, 3: null, 4: null, 5: null, 6: null,
  });
  /** Which slot is currently being edited; null = picker closed. */
  const [pickingSlot, setPickingSlot] = useState<SlotNum | null>(null);

  function applyPick(key: string | null) {
    if (pickingSlot === null) return;
    const nextPicks = { ...picks, [pickingSlot]: key };
    setPicks(nextPicks);
    setPickingSlot(null);
    // Push derived set4/set2Keys into AppState in one atomic action so the
    // calc layer never sees a half-updated transition.
    const derived = deriveSetsFromPicks(nextPicks);
    dispatch({ type: 'SET_DISC_SETS', set4Key: derived.set4Key, set2Keys: derived.set2Keys });
  }

  return (
    <div className={`sub-module ${styles.card}`}>
      <div className="module-title"><span>驱动盘 (6 槽位)</span></div>
      <div className={styles.frameWrap}>
        <img
          src="/resources/disc/hex-frame.png"
          alt=""
          className={styles.frame}
        />
        {/* Center anchor: main C's W-Engine. Mirrors state.weapons.main, so
            picking here also updates module 02's dropdown + star buttons. */}
        <WeaponHexCenter />
        {SLOTS.map(({ slot, cx, cy }) => {
          const pickedKey = picks[slot];
          const hasPick = pickedKey !== null;
          const padded = String(slot).padStart(2, '0');
          // Pick layer: suit art (or default slot badge) + (if picked) corner pos badge.
          const mainArt = hasPick
            ? `/resources/disc/${SUIT_ART[pickedKey]}`
            : `/resources/disc/EquipPositionBg${padded}.png`;
          return (
            <button
              key={slot}
              type="button"
              className={styles.slotBtn}
              onClick={() => setPickingSlot(slot)}
              style={{
                left: `${cx}%`,
                top: `${cy}%`,
                width: `${BADGE_SIZE_PCT}%`,
              }}
              title={hasPick ? DISC_4_SETS[pickedKey].name : `点击选择第 ${slot} 号位驱动盘`}
            >
              <img src={mainArt} alt="" className={styles.slotImg} />
              {hasPick && (
                <img
                  src={`/resources/disc/SuitPosition${padded}.png`}
                  alt=""
                  className={styles.slotPosBadge}
                />
              )}
            </button>
          );
        })}
      </div>

      {pickingSlot !== null && (
        <DiscPicker
          slot={pickingSlot}
          currentKey={picks[pickingSlot]}
          onPick={applyPick}
          onClose={() => setPickingSlot(null)}
        />
      )}
    </div>
  );
}

/* ---------- Picker overlay ---------- */

interface PickerProps {
  slot: SlotNum;
  currentKey: string | null;
  onPick: (key: string | null) => void;
  onClose: () => void;
}

interface RoleColumnProps {
  title: string;
  entries: PickerEntry[];
  currentKey: string | null;
  onPick: (key: string) => void;
  onHover: (key: string) => (e: React.SyntheticEvent<HTMLButtonElement>) => void;
  onLeave: () => void;
}
function RoleColumn({ title, entries, currentKey, onPick, onHover, onLeave }: RoleColumnProps) {
  return (
    <section className={styles.pickerColumn}>
      {/* Use <div> not <header>: global.css forces all <header> elements to
          position:fixed top:24/left:24 (for the hero card). */}
      <div className={styles.pickerColumnHeader}>
        {title}
        <span className={styles.pickerColumnCount}>{entries.length}</span>
      </div>
      <div className={styles.pickerGrid}>
        {entries.map((e) => (
          <button
            key={e.key}
            type="button"
            className={`${styles.pickerCard} ${currentKey === e.key ? styles.pickerCardActive : ''}`}
            onClick={() => onPick(e.key)}
            onMouseEnter={onHover(e.key)}
            onMouseLeave={onLeave}
            onFocus={onHover(e.key)}
            onBlur={onLeave}
          >
            <img src={`/resources/disc/${e.art}`} alt="" className={styles.pickerArt} />
            <span className={styles.pickerName}>{e.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

interface HoverInfo { key: string; rect: DOMRect }

function DiscPicker({ slot, currentKey, onPick, onClose }: PickerProps) {
  const [hovered, setHovered] = useState<HoverInfo | null>(null);

  const handleHover = (key: string) =>
    (e: React.SyntheticEvent<HTMLButtonElement>) => {
      setHovered({ key, rect: e.currentTarget.getBoundingClientRect() });
    };
  const clearHover = () => setHovered(null);

  return (
    <div className={styles.pickerBackdrop} onClick={onClose}>
      <div className={styles.pickerModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pickerHeader}>
          <span>选择第 {slot} 号位驱动盘</span>
          <button type="button" className={styles.pickerClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.pickerBody}>
          <div className={styles.pickerToolbar}>
            <button
              type="button"
              className={`${styles.pickerCard} ${styles.pickerClearCard} ${currentKey === null ? styles.pickerCardActive : ''}`}
              onClick={() => onPick(null)}
            >
              <div className={styles.pickerEmpty}>清除</div>
              <span className={styles.pickerName}>不选套装</span>
            </button>
          </div>
          <div className={styles.pickerColumns}>
            <RoleColumn
              title="DPS 盘"
              entries={PICKER_BY_ROLE.dps}
              currentKey={currentKey}
              onPick={onPick}
              onHover={handleHover}
              onLeave={clearHover}
            />
            <RoleColumn
              title="SUP 盘"
              entries={PICKER_BY_ROLE.sup}
              currentKey={currentKey}
              onPick={onPick}
              onHover={handleHover}
              onLeave={clearHover}
            />
          </div>
        </div>
      </div>
      {hovered && <SetTooltip entryKey={hovered.key} anchor={hovered.rect} />}
    </div>
  );
}

/* ---------- Set bonus tooltip ---------- */

interface TooltipProps { entryKey: string; anchor: DOMRect }
function SetTooltip({ entryKey, anchor }: TooltipProps) {
  const four = DISC_4_SETS[entryKey];
  const two = DISC_2_SETS[entryKey];
  if (!four) return null;

  // Place to the right of the anchor card by default; flip to left if it
  // would overflow the viewport. Vertically clamp.
  const TOOLTIP_W = 320;
  const GAP = 10;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const flipLeft = anchor.right + GAP + TOOLTIP_W > vw;
  const left = flipLeft ? Math.max(8, anchor.left - GAP - TOOLTIP_W) : anchor.right + GAP;
  // tooltip top: align card top, clamp inside viewport.
  const top = Math.min(Math.max(8, anchor.top), vh - 80);

  return (
    <div
      className={styles.setTooltip}
      style={{ left, top, width: TOOLTIP_W }}
      // Tooltip is non-interactive — don't steal hover.
    >
      <div className={styles.setTooltipName}>{four.name}</div>
      {two?.note && (
        <div className={styles.setTooltipRow}>
          <span className={styles.setTooltipLabel}>2件套</span>
          <span className={styles.setTooltipText}><Colorized text={two.note} /></span>
        </div>
      )}
      {four.note && (
        <div className={styles.setTooltipRow}>
          <span className={styles.setTooltipLabel}>4件套</span>
          <span className={styles.setTooltipText}><Colorized text={four.note} /></span>
        </div>
      )}
    </div>
  );
}

/** Render official Chinese description text containing legacy Unity-style
 *  `<color=#HEX>text</color>` tags as styled spans. Anything outside the
 *  tags is plain text. */
function Colorized({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /<color=(#[0-9a-fA-F]{3,8})>([\s\S]*?)<\/color>/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <span key={i++} style={{ color: m[1] }}>{m[2]}</span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
