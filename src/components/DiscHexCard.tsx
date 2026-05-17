// src/components/DiscHexCard.tsx
// Hex-shaped driver-disc layout card. Displays the 6 EquipPositionBg badges
// overlaid on a hex drum frame, with the in-game disc slot ↔ visual position
// mapping the user specified:
//
//   visual left-top    → game slot 6 (EquipPositionBg06.png)
//   visual left-mid    → game slot 1 (EquipPositionBg01.png)
//   visual left-bot    → game slot 2 (EquipPositionBg02.png)
//   visual right-bot   → game slot 3 (EquipPositionBg03.png)
//   visual right-mid   → game slot 4 (EquipPositionBg04.png)
//   visual right-top   → game slot 5 (EquipPositionBg05.png)
//
// Coordinates are % of the hex frame's bounding box; tune visually with
// screenshots. Frame natural size: 870 × 778, aspect 1.118.

import styles from './DiscHexCard.module.css';

interface Slot {
  /** badge filename in /resources/disc/ */
  bg: string;
  /** center x as % of frame width */
  cx: number;
  /** center y as % of frame height */
  cy: number;
}

// Cavity centers in % of frame. Auto-detected via OpenCV Hough Circle
// transform on the source PNG; r≈107 across all 6 → 24% diameter.
const SLOTS: Slot[] = [
  { bg: 'EquipPositionBg06.png', cx: 29.2, cy: 17.9 }, // left-top   = slot 6
  { bg: 'EquipPositionBg01.png', cx: 15.6, cy: 50.0 }, // left-mid   = slot 1
  { bg: 'EquipPositionBg02.png', cx: 29.2, cy: 82.3 }, // left-bot   = slot 2
  { bg: 'EquipPositionBg03.png', cx: 70.7, cy: 82.3 }, // right-bot  = slot 3
  { bg: 'EquipPositionBg04.png', cx: 84.4, cy: 49.9 }, // right-mid  = slot 4
  { bg: 'EquipPositionBg05.png', cx: 70.7, cy: 17.6 }, // right-top  = slot 5
];

/** Diameter of each slot badge as % of frame width. */
const BADGE_SIZE_PCT = 24;

export function DiscHexCard() {
  return (
    <div className={`sub-module ${styles.card}`}>
      <div className="module-title"><span>驱动盘 (6 槽位)</span></div>
      <div className={styles.frameWrap}>
        <img
          src="/resources/disc/hex-frame.png"
          alt=""
          className={styles.frame}
        />
        {SLOTS.map((s) => (
          <img
            key={s.bg}
            src={`/resources/disc/${s.bg}`}
            alt=""
            className={styles.badge}
            style={{
              left: `${s.cx}%`,
              top: `${s.cy}%`,
              width: `${BADGE_SIZE_PCT}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
