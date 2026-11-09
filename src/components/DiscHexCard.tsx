// src/components/DiscHexCard.tsx
// Combined Module 03: Left pane holds main/sub-stat inputs, legality check & random 6-disc
// sub-stat allocator, and active Drive Disc set buff result;
// Right pane holds the interactive 6-slot hexagonal Drive Disc wheel + center W-Engine.

import React, { useEffect, useState, type ChangeEvent } from 'react';
import { DISC_2_SETS, DISC_4_SETS, DISC_ROLE, SUIT_ART, type DiscRole } from '../calc/discSets';
import { DISC_BUFFS, formatBuffStatsSummary, stripGameTags } from '../calc/buffs';
import {
  SUB_STAT_DEFS,
  DEFAULT_ALL_SUB_COUNTS,
  formatSubStatValue,
  getSlotMainStatInfo,
  validateAndAllocateSubStats,
  type AllSubCounts,
  type SubStatKey,
  type SubStatAllocationResult,
  type DiscSlotAllocation,
  type SlotNum,
} from '../calc/discSubAllocator';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { DiscConfig } from '../state/types';
import { WeaponHexCenter } from './WeaponHexCenter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import styles from './DiscHexCard.module.css';

type Slot4Stat = DiscConfig['slot4Stat'];

interface Slot4Option {
  value: Slot4Stat;
  label: string;
}

const SLOT4_OPTIONS: Slot4Option[] = [
  { value: 'critRate', label: '24% 暴击率' },
  { value: 'critDmg', label: '48% 暴击伤害' },
  { value: 'atkPct', label: '30% 大攻击' },
  { value: 'defPct', label: '30% 大防御' },
  { value: 'anomalyMastery', label: '92 异常精通' },
];

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

/** All user-selectable disc set keys (excludes the 'none' sentinel). */
const SET_KEYS = Object.keys(DISC_4_SETS).filter((k) => k !== 'none');

interface PickerEntry {
  key: string;
  name: string;
  art: string;
  role: DiscRole;
}

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
    if (c >= 4) {
      set4Key = k;
      break;
    }
  }
  const set2Keys = [...counts.entries()]
    .filter(([k, c]) => c >= 2 && k !== set4Key)
    .sort((a, b) => (firstSeen.get(a[0]) ?? 99) - (firstSeen.get(b[0]) ?? 99))
    .map(([k]) => k);
  return { set4Key, set2Keys };
}

function subCountsToAll(sc: DiscConfig['subCounts']): AllSubCounts {
  return {
    CR: sc.CR ?? 0,
    CD: sc.CD ?? 0,
    ATK: sc.ATK ?? 0,
    FLAT_ATK: sc.FLAT_ATK ?? 0,
    HP: sc.HP ?? 0,
    FLAT_HP: sc.FLAT_HP ?? 0,
    AM: sc.AM ?? 0,
    PEN: sc.PEN ?? 0,
    DEF: sc.DEF ?? 0,
    FLAT_DEF: sc.FLAT_DEF ?? 0,
  };
}

export function DiscHexCard() {
  const state = useAppState();
  const { disc } = state;
  const dispatch = useAppDispatch();

  const mainDisc4BuffEnabled = state.buffs?.mainDisc4BuffEnabled ?? true;

  /** Local draft of all 10 sub-stat total counts before clicking "应用". */
  const [draftCounts, setDraftCounts] = useState<AllSubCounts>(() =>
    subCountsToAll(disc.subCounts),
  );

  /** Latest validation & 6-disc random allocation result. */
  const [allocResult, setAllocResult] = useState<SubStatAllocationResult | null>(() =>
    validateAndAllocateSubStats(subCountsToAll(disc.subCounts), disc.slot4Stat),
  );

  /** Track whether draftCounts has unapplied edits compared to last applied state. */
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // Sync draftCounts if state.disc.subCounts is reset externally
  useEffect(() => {
    setDraftCounts(subCountsToAll(disc.subCounts));
  }, [disc.subCounts]);

  /** slot number → disc-set key (null = empty cavity, shows default badge). */
  const [picks, setPicks] = useState<Record<SlotNum, string | null>>(() => {
    const s4 = disc.set4Key && disc.set4Key !== 'none' ? disc.set4Key : null;
    const s2 = disc.set2Keys?.[0] && disc.set2Keys[0] !== 'none' ? disc.set2Keys[0] : null;
    return {
      1: s4,
      2: s4,
      3: s4,
      4: s4,
      5: s2,
      6: s2,
    };
  });
  /** Which slot is currently being edited; null = picker closed. */
  const [pickingSlot, setPickingSlot] = useState<SlotNum | null>(null);
  /** Which slot on the 6-disc wheel is currently hovered for the stats tooltip. */
  const [hoveredSlot, setHoveredSlot] = useState<{ slot: SlotNum; rect: DOMRect } | null>(null);

  const set2Display = disc.set2Keys[0] ?? 'none';

  const handleSlot4Change = (v: string) => {
    const nextSlot4 = v as Slot4Stat;
    dispatch({ type: 'SET_DISC_SLOT4', payload: nextSlot4 });
    // Re-validate and re-allocate against the new Slot 4 main stat immediately
    const res = validateAndAllocateSubStats(draftCounts, nextSlot4);
    setAllocResult(res);
    if (res.valid) {
      dispatch({ type: 'SET_DISC_SUBCOUNTS_ALL', payload: draftCounts });
      setHasUnappliedChanges(false);
    }
  };

  const handleSet4Change = (v: string) => {
    dispatch({ type: 'SET_DISC_SET4', payload: v });
    const s4 = v !== 'none' ? v : null;
    const s2 = set2Display !== 'none' ? set2Display : null;
    setPicks({
      1: s4,
      2: s4,
      3: s4,
      4: s4,
      5: s2,
      6: s2,
    });
  };

  const handleSet2Change = (v: string) => {
    dispatch({ type: 'SET_DISC_SET2', payload: v });
    const s4 = disc.set4Key !== 'none' ? disc.set4Key : null;
    const s2 = v !== 'none' ? v : null;
    setPicks({
      1: s4,
      2: s4,
      3: s4,
      4: s4,
      5: s2,
      6: s2,
    });
  };

  const handleDraftSubChange =
    (key: SubStatKey) => (e: ChangeEvent<HTMLInputElement>) => {
      const raw = Number(e.target.value);
      const value = Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
      setDraftCounts((prev) => ({ ...prev, [key]: value }));
      setHasUnappliedChanges(true);
    };

  const handleApplySubStats = () => {
    const res = validateAndAllocateSubStats(draftCounts, disc.slot4Stat);
    setAllocResult(res);
    if (res.valid) {
      dispatch({ type: 'SET_DISC_SUBCOUNTS_ALL', payload: draftCounts });
      setHasUnappliedChanges(false);
    }
  };

  const handleResetSubStats = () => {
    const zeroed = { ...DEFAULT_ALL_SUB_COUNTS };
    setDraftCounts(zeroed);
    const res = validateAndAllocateSubStats(zeroed, disc.slot4Stat);
    setAllocResult(res);
    dispatch({ type: 'SET_DISC_SUBCOUNTS_ALL', payload: zeroed });
    setHasUnappliedChanges(false);
  };

  // Map of conflict slot per sub-stat key for visual badges
  const conflictSlotByKey = new Map<SubStatKey, SlotNum>();
  for (const s of [1, 2, 3, 4] as SlotNum[]) {
    const info = getSlotMainStatInfo(s, disc.slot4Stat);
    if (info.conflictSubKey) {
      conflictSlotByKey.set(info.conflictSubKey, s);
    }
  }

  // Excess map from last failed validation
  const excessByKey = new Map<SubStatKey, number>();
  if (allocResult && !allocResult.valid && allocResult.excessStats) {
    for (const item of allocResult.excessStats) {
      excessByKey.set(item.key, item.excess);
    }
  }

  const draftTotalRolls = SUB_STAT_DEFS.reduce((acc, d) => acc + (draftCounts[d.key] ?? 0), 0);

  const mainSet4Buff =
    disc.set4Key && disc.set4Key !== 'none' ? DISC_BUFFS[disc.set4Key] : undefined;
  const mainSet4Data =
    disc.set4Key && disc.set4Key !== 'none' ? DISC_4_SETS[disc.set4Key] : undefined;

  // All active 2-piece sets (4-piece set's own 2-piece + extra 2-piece sets)
  const active2PieceKeys = [
    ...(disc.set4Key && disc.set4Key !== 'none' ? [disc.set4Key] : []),
    ...disc.set2Keys.filter((k) => k && k !== 'none' && k !== disc.set4Key),
  ];

  function applyPick(key: string | null) {
    if (pickingSlot === null) return;
    const nextPicks = { ...picks, [pickingSlot]: key };
    setPicks(nextPicks);
    setPickingSlot(null);
    const derived = deriveSetsFromPicks(nextPicks);
    dispatch({ type: 'SET_DISC_SETS', set4Key: derived.set4Key, set2Keys: derived.set2Keys });
  }

  return (
    <div className={`sub-module ${styles.card}`} id="mod-preset-stats">
      <div className="module-title">
        <span>03 // 驱动盘 (6 槽位) & 词条 / Buff</span>
      </div>

      <div className={styles.contentLayout}>
        {/* 左侧：03 // 驱动盘主副词条 & 6盘随机分配 & 驱动盘Buff结果 */}
        <div className={styles.leftPane}>
          <h3 className={styles.leftTitle}>03 // 驱动盘主副词条 & 驱动盘Buff</h3>

          {/* 顶部：4号位主词条 + 4件套 + 2件套 */}
          <div className={styles.topSelectRow}>
            <div className="input-group">
              <label htmlFor="slot4-select">4号位 (主词条)</label>
              <Select value={disc.slot4Stat} onValueChange={handleSlot4Change}>
                <SelectTrigger id="slot4-select" className={styles.selectTrigger}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SLOT4_OPTIONS.map((opt) => (
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
                <SelectTrigger id="disc-set4-select" className={styles.selectTrigger}>
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
                <SelectTrigger id="disc-set2-select" className={styles.selectTrigger}>
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
          </div>

          {/* 全部可选副词条总数输入区 */}
          <div className={styles.subSection}>
            <div className={styles.subHeaderBar}>
              <div className={styles.subHeaderLeft}>
                <span className={styles.subSectionTitle}>全部可选副词条总数</span>
                <span
                  className={`${styles.rollCounterBadge} ${
                    draftTotalRolls > 54 ? styles.rollCounterOver : ''
                  }`}
                >
                  总词条 {draftTotalRolls} / 54
                </span>
              </div>
              <div className={styles.subActionBtns}>
                <button
                  type="button"
                  className={styles.resetSubBtn}
                  onClick={handleResetSubStats}
                >
                  清空
                </button>
                <button
                  type="button"
                  id="disc-sub-apply-btn"
                  className={`${styles.applySubBtn} ${
                    hasUnappliedChanges ? styles.applySubBtnPending : ''
                  }`}
                  onClick={handleApplySubStats}
                >
                  {hasUnappliedChanges ? '✓ 应用并随机分配' : '🎲 应用 / 重新随机分配'}
                </button>
              </div>
            </div>

            <div className={styles.subRulesHint}>
              规则校验：① 单盘最多 4 词条 + 5 次强化（最多 9 词条，6 盘共最多 54 词条 / 30 次强化） ② 主词条与副词条不可重复（1号位小生命、2号位小攻击、3号位小防御、4号位所选主词条）
            </div>

            <div className={styles.allSubsGrid}>
              {SUB_STAT_DEFS.map((field) => {
                const count = draftCounts[field.key] ?? 0;
                const conflictSlot = conflictSlotByKey.get(field.key);
                const excess = excessByKey.get(field.key);
                const maxCap = conflictSlot ? 30 : 36;
                return (
                  <div
                    key={field.key}
                    className={`${styles.subFieldCard} ${
                      excess ? styles.subFieldCardError : count > 0 ? styles.subFieldCardFilled : ''
                    }`}
                  >
                    <div className={styles.subFieldInfo}>
                      <div className={styles.subFieldLabelRow}>
                        <label htmlFor={`disc-sub-${field.key}`} className={styles.subFieldLabel}>
                          {field.label}
                        </label>
                        {conflictSlot && (
                          <span
                            className={styles.conflictTag}
                            title={`与 ${conflictSlot} 号位主词条相同，${conflictSlot} 号位不会出现该副词条（最多出现在其余 5 个驱动盘，上限 30 词条）`}
                          >
                            {conflictSlot}号位主·限5盘
                          </span>
                        )}
                      </div>
                      <div className={styles.subFieldPreview}>
                        {count > 0 ? (
                          <span className={styles.subFieldValueActive}>
                            总计 +{formatSubStatValue(field.key, count)}
                          </span>
                        ) : (
                          <span className={styles.subFieldValueMuted}>上限 {maxCap} 词条</span>
                        )}
                        {excess !== undefined && excess > 0 && (
                          <span className={styles.excessInlineBadge}>多了 {excess} 个!</span>
                        )}
                      </div>
                    </div>
                    <input
                      id={`disc-sub-${field.key}`}
                      type="number"
                      min={0}
                      max={36}
                      step={1}
                      className={styles.subInput}
                      value={count}
                      onChange={handleDraftSubChange(field.key)}
                    />
                  </div>
                );
              })}
            </div>

            {/* 校验失败提示：明确告知哪个词条多了 */}
            {allocResult && !allocResult.valid && (
              <div className={styles.validationErrorBox} role="alert">
                <div className={styles.validationErrorTitle}>
                  ⚠️ 副词条配置不合法，无法分配给 6 个驱动盘
                </div>
                <div className={styles.validationErrorSummary}>{allocResult.errorSummary}</div>
                {allocResult.excessStats && allocResult.excessStats.length > 0 && (
                  <ul className={styles.validationErrorList}>
                    {allocResult.excessStats.map((item) => (
                      <li key={item.key}>
                        <strong>【{item.name}】词条多了 {item.excess} 个</strong>：当前输入{' '}
                        <span className={styles.errHighlight}>{item.current}</span> 个，建议最多填{' '}
                        <span className={styles.okHighlight}>{item.maxAllowed}</span> 个（
                        {item.reason}）
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 校验通过：提示已分配至右侧 6 个驱动盘，悬停驱动盘查看详情 */}
            {allocResult && allocResult.valid && allocResult.discs && (
              <div className={styles.allocatedBanner}>
                <span>
                  ✅ 已随机分配 <strong>{allocResult.stats.totalRolls}</strong> / 54 个副词条至 6 个驱动盘
                  {hasUnappliedChanges && (
                    <em className={styles.unappliedHint}>（上方修改待点击「应用」生效）</em>
                  )}
                </span>
                <span className={styles.allocatedHintText}>
                  💡 鼠标移至右侧 1~6 号位驱动盘可查看主词条与副词条明细
                </span>
              </div>
            )}
          </div>

          {/* 当前穿戴驱动盘 2件套 & 4件套 Buff 结果展示 */}
          <div className={styles.buffSection}>
            <div className={styles.buffHeader}>
              <span>当前驱动盘套装 Buff 结果</span>
            </div>

            {active2PieceKeys.length === 0 && !mainSet4Buff ? (
              <div className={styles.emptyBuffHint}>
                在上方下拉框或右侧 6 槽位中选择驱动盘后，此处将显示生效的 2件套 / 4件套 Buff 结果。
              </div>
            ) : (
              <div className={styles.activeBuffGroup}>
                {active2PieceKeys.map((k) => {
                  const s2 = DISC_2_SETS[k];
                  if (!s2) return null;
                  const badges = formatBuffStatsSummary(s2.stats);
                  return (
                    <div key={`set2_${k}`} className={`${styles.buffCard} ${styles.buffCardActive}`}>
                      <div className={styles.buffTopRow}>
                        <span className={styles.set2Tag}>2件套生效</span>
                        <span className={styles.buffTitle}>{s2.name} (2件套)</span>
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
                      {s2.note && <div className={styles.buffDesc}>{stripGameTags(s2.note)}</div>}
                    </div>
                  );
                })}

                {mainSet4Buff && mainSet4Data && (
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
                      <span className={styles.subTypeTag}>4件套特效</span>
                      <span className={styles.buffTitle}>{mainSet4Data.name} (4件套)</span>
                      <div className={styles.statBadges}>
                        {formatBuffStatsSummary(mainSet4Buff.stats).map((bd, i) => (
                          <span key={i} className={styles.statBadge}>
                            {bd}
                          </span>
                        ))}
                      </div>
                    </div>
                    {mainSet4Data.note && (
                      <div className={styles.buffDesc}>{stripGameTags(mainSet4Data.note)}</div>
                    )}
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右侧：六边形 6 槽位驱动盘 + 中央音擎 */}
        <div className={styles.rightPane}>
          <div className={styles.frameWrap}>
            <img
              src="/resources/disc/hex-frame.png"
              alt=""
              className={styles.frame}
            />
            <WeaponHexCenter />
            {SLOTS.map(({ slot, cx, cy }) => {
              const pickedKey = picks[slot];
              const hasPick = pickedKey !== null;
              const padded = String(slot).padStart(2, '0');
              const mainArt = hasPick
                ? `/resources/disc/${SUIT_ART[pickedKey]}`
                : `/resources/disc/EquipPositionBg${padded}.png`;
              const slotAlloc = allocResult?.valid ? allocResult.discs?.[slot] : undefined;
              return (
                <button
                  key={slot}
                  type="button"
                  className={styles.slotBtn}
                  onClick={() => {
                    setHoveredSlot(null);
                    setPickingSlot(slot);
                  }}
                  onMouseEnter={(e) =>
                    setHoveredSlot({ slot, rect: e.currentTarget.getBoundingClientRect() })
                  }
                  onMouseLeave={() => setHoveredSlot(null)}
                  onFocus={(e) =>
                    setHoveredSlot({ slot, rect: e.currentTarget.getBoundingClientRect() })
                  }
                  onBlur={() => setHoveredSlot(null)}
                  style={{
                    left: `${cx}%`,
                    top: `${cy}%`,
                    width: `${BADGE_SIZE_PCT}%`,
                  }}
                >
                  <img src={mainArt} alt="" className={styles.slotImg} />
                  {hasPick && (
                    <img
                      src={`/resources/disc/SuitPosition${padded}.png`}
                      alt=""
                      className={styles.slotPosBadge}
                    />
                  )}
                  {slotAlloc && slotAlloc.totalRolls > 0 && (
                    <span className={styles.slotRollBadge}>
                      {slotAlloc.totalRolls}词
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {hoveredSlot && pickingSlot === null && (
        <DiscSlotTooltip
          slot={hoveredSlot.slot}
          anchor={hoveredSlot.rect}
          pickedKey={picks[hoveredSlot.slot]}
          slot4Stat={disc.slot4Stat}
          allocation={allocResult?.valid ? allocResult.discs?.[hoveredSlot.slot] : undefined}
        />
      )}

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

/* ---------- Drive Disc Slot Hover Tooltip (Main Stat + Sub-stats) ---------- */

interface DiscSlotTooltipProps {
  slot: SlotNum;
  anchor: DOMRect;
  pickedKey: string | null;
  slot4Stat: Slot4Stat;
  allocation?: DiscSlotAllocation;
}

function DiscSlotTooltip({
  slot,
  anchor,
  pickedKey,
  slot4Stat,
  allocation,
}: DiscSlotTooltipProps) {
  const mainInfo = getSlotMainStatInfo(slot, slot4Stat);
  const setName = pickedKey ? DISC_4_SETS[pickedKey]?.name ?? '未知套装' : '未选择套装';
  const suitArt = pickedKey ? `/resources/disc/${SUIT_ART[pickedKey]}` : null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const TOOLTIP_W = Math.min(290, vw - 20);
  const GAP = 12;
  const flipLeft = anchor.right + GAP + TOOLTIP_W > vw - 10;
  const rawLeft = flipLeft
    ? anchor.left - GAP - TOOLTIP_W
    : anchor.right + GAP;
  const left = Math.max(10, Math.min(rawLeft, vw - TOOLTIP_W - 10));
  const top = Math.min(Math.max(12, anchor.top - 10), vh - 240);

  return (
    <div
      className={styles.discSlotTooltip}
      style={{ left, top, width: TOOLTIP_W }}
      role="tooltip"
    >
      {/* 顶部标题：槽位编号 + 驱动盘套装名 */}
      <div className={styles.slotTipHeader}>
        {suitArt && <img src={suitArt} alt="" className={styles.slotTipArt} />}
        <div className={styles.slotTipTitleBlock}>
          <div className={styles.slotTipTitleRow}>
            <span className={styles.slotTipPosBadge}>[{slot}号位]</span>
            <span className={styles.slotTipSetName}>{setName}</span>
          </div>
          <span className={styles.slotTipSubMeta}>S级 驱动盘 · Lv.15</span>
        </div>
      </div>

      {/* 主词条 */}
      <div className={styles.slotTipMainBox}>
        <span className={styles.slotTipSectionTag}>主词条</span>
        <span className={styles.slotTipMainValue}>{mainInfo.mainLabel}</span>
      </div>

      {/* 副词条列表 */}
      <div className={styles.slotTipSubSection}>
        <div className={styles.slotTipSubHeader}>
          <span>副词条</span>
          {allocation && (
            <span className={styles.slotTipSubCapacity}>
              {allocation.lineCount}/4 词条 · +{allocation.upgradeCount}/5 强化
            </span>
          )}
        </div>
        {!allocation || allocation.subStats.length === 0 ? (
          <div className={styles.slotTipEmpty}>
            暂无分配副词条（在左侧输入总数并点击「应用」后分配）
          </div>
        ) : (
          <div className={styles.slotTipSubList}>
            {allocation.subStats.map((st) => (
              <div key={st.key} className={styles.slotTipSubRow}>
                <div className={styles.slotTipSubLeft}>
                  <span className={styles.slotTipBullet}>•</span>
                  <span className={styles.slotTipSubName}>{st.name}</span>
                  {st.upgrades > 0 && (
                    <span className={styles.slotTipUpgradePill}>+{st.upgrades}</span>
                  )}
                </div>
                <div className={styles.slotTipSubRight}>
                  <span className={styles.slotTipSubVal}>{st.valueText}</span>
                  <span className={styles.slotTipSubRolls}>({st.totalRolls}词)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Set bonus tooltip ---------- */

interface TooltipProps { entryKey: string; anchor: DOMRect }
function SetTooltip({ entryKey, anchor }: TooltipProps) {
  const four = DISC_4_SETS[entryKey];
  const two = DISC_2_SETS[entryKey];
  if (!four) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const TOOLTIP_W = Math.min(320, vw - 20);
  const GAP = 10;
  const flipLeft = anchor.right + GAP + TOOLTIP_W > vw - 10;
  const rawLeft = flipLeft ? anchor.left - GAP - TOOLTIP_W : anchor.right + GAP;
  const left = Math.max(10, Math.min(rawLeft, vw - TOOLTIP_W - 10));
  const top = Math.min(Math.max(8, anchor.top), vh - 80);

  return (
    <div
      className={styles.setTooltip}
      style={{ left, top, width: TOOLTIP_W }}
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
