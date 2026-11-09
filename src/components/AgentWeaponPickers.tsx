// src/components/AgentWeaponPickers.tsx
import { useMemo, useState } from 'react';
import { useAppDispatch, useAppState } from '../state/AppContext';
import { CHARACTER_DB, WEAPON_DB } from '../calc/db';
import { WEAPON_ICON } from '../calc/weaponIcons';
import {
  agentCircleIconUrl,
  agentSelectIconUrl,
  elementIconUrl,
  professionIconUrl,
  rarityIconUrl,
} from '../calc/agentIcons';
import { StarBar } from './WeaponHexCenter';
import type { BattleType } from '../calc/types';
import styles from './AgentWeaponPickers.module.css';
import discStyles from './DiscHexCard.module.css';

export type SlotKey = 'main' | 'sup1' | 'sup2';

const PROFESSIONS = ['强攻', '击破', '异常', '支援', '防护', '命破', '锋御'] as const;

const BASE_ELEMENTS = [
  { key: '物理', label: '物理', iconKey: '物理', matches: ['物理', '凛刃'] },
  { key: '火',   label: '火',   iconKey: '火',   matches: ['火', '燎源'] },
  { key: '冰',   label: '冰',   iconKey: '冰',   matches: ['冰', '烈霜'] },
  { key: '电',   label: '电',   iconKey: '电',   matches: ['电'] },
  { key: '以太', label: '以太', iconKey: '以太', matches: ['以太', '玄墨'] },
  { key: '风',   label: '风',   iconKey: '风',   matches: ['风'] },
  { key: '流明', label: '流明', iconKey: '流明', matches: ['流明'] },
] as const;

const MODE_TYPE_MAP: Record<BattleType, string> = {
  attack: '强攻',
  break: '命破',
  anomaly: '异常',
};

interface AgentEntry {
  name: string;
  element: string;
  baseElement: string;
  type: string;
  rarity: 'S' | 'A';
  selectIconUrl: string | null;
  circleIconUrl: string | null;
}

interface WeaponEntry {
  name: string;
  type: string;
  rarity: 'S' | 'A';
  iconFile: string | null;
}

function getAllAgents(): AgentEntry[] {
  return Object.entries(CHARACTER_DB.characters)
    .filter(([, data]) => !(data.meta as Record<string, unknown> | undefined)?.legacyAlias)
    .map(([name, data]) => {
      const meta = (data.meta ?? {}) as Record<string, string | undefined>;
      const element = meta.element || '物理';
      const baseElement = meta.baseElement || element;
      const type = meta.type || '强攻';
      const rarity: 'S' | 'A' = meta.rarity === 'A' ? 'A' : 'S';
      return {
        name,
        element,
        baseElement,
        type,
        rarity,
        selectIconUrl: agentSelectIconUrl(name),
        circleIconUrl: agentCircleIconUrl(name),
      };
    });
}

function getAllWeapons(): WeaponEntry[] {
  return Object.entries(WEAPON_DB)
    .filter(([, w]) => w?.meta?.rarity === 'S' || w?.meta?.rarity === 'A')
    .map(([name, w]) => ({
      name,
      type: w?.meta?.type || '强攻',
      rarity: w?.meta?.rarity === 'S' ? 'S' : 'A',
      iconFile: WEAPON_ICON[name] ?? null,
    }));
}

export function AgentSelectorSlot({ slot }: { slot: SlotKey }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const slotState = state.agents[slot];
  const [open, setOpen] = useState(false);

  const selectedName = slotState.presetName || '';
  const charData = selectedName
    ? CHARACTER_DB.characters[selectedName] || (CHARACTER_DB.sup ?? {})[selectedName]
    : undefined;
  const meta = (charData?.meta ?? {}) as Record<string, string | undefined>;
  const element = meta.element || '';
  const prof = meta.type || '';
  const rarity: 'S' | 'A' | null =
    meta.rarity === 'A' ? 'A' : meta.rarity === 'S' ? 'S' : selectedName ? 'S' : null;

  const avatarUrl = agentCircleIconUrl(selectedName) || agentSelectIconUrl(selectedName);
  const elemIcon = elementIconUrl(element);
  const profIcon = professionIconUrl(prof);
  const rarIcon = rarityIconUrl(rarity);

  const prefix = slot === 'main' ? 'a_main' : slot === 'sup1' ? 'a_sup1' : 'a_sup2';

  return (
    <div className={styles.slotCard}>
      <span className={styles.slotHeaderLabel}>选择代理人</span>
      <button
        type="button"
        className={`${styles.medallionBtn} ${
          rarity === 'S' ? styles.medallionBtnS : rarity === 'A' ? styles.medallionBtnA : ''
        }`}
        onClick={() => setOpen(true)}
        title={selectedName ? `${selectedName} (${element}·${prof})` : '点击选择代理人'}
      >
        {(elemIcon || profIcon) && (
          <div className={styles.badgeTopLeft}>
            {elemIcon && <img src={elemIcon} alt={element} className={styles.uiIconBadge} />}
            {profIcon && <img src={profIcon} alt={prof} className={styles.uiIconBadge} />}
          </div>
        )}
        {rarIcon && (
          <div className={styles.badgeTopRight}>
            <img src={rarIcon} alt={rarity ?? ''} className={styles.rarityIconBadge} />
          </div>
        )}
        <div className={styles.avatarClip}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={selectedName} className={styles.agentAvatarImg} />
          ) : selectedName ? (
            <span className={styles.fallbackInitial}>{selectedName[0]}</span>
          ) : (
            <span className={styles.emptyPlus}>+</span>
          )}
        </div>
      </button>

      <div className={styles.slotNameText} title={selectedName || '未选择代理人'}>
        {selectedName || '点击选择角色'}
      </div>

      {selectedName && (element || prof) ? (
        <div className={styles.slotSubMeta}>
          {elemIcon && <img src={elemIcon} alt="" className={styles.inlineUiIcon} />}
          <span>{element}</span>
          {profIcon && <img src={profIcon} alt="" className={styles.inlineUiIcon} />}
          <span>{prof}</span>
        </div>
      ) : (
        <div className={styles.slotSubMeta}>预设角色面板</div>
      )}

      {/* Cinema Selector (1 / 2 / 3 / 4 / 5 / 6; unselecting active = 0命) */}
      <div className={styles.cinemaBar} id={`cinema-${prefix}`}>
        {[1, 2, 3, 4, 5, 6].map((rank) => {
          const isActive = rank <= slotState.cinemaOrStar;
          const nextCinema = slotState.cinemaOrStar === rank ? 0 : rank;
          const tip =
            rank === 3
              ? '影画 3：技能等级上限从 12 提升至 14（再次点击取消为 0命）'
              : rank === 5
                ? '影画 5：技能等级上限从 14 提升至 16（再次点击取消为 0命）'
                : `影画 ${rank}：解锁并自动显示/启用对应影画 Buff（再次点击取消为 0命）`;
          return (
            <button
              key={rank}
              type="button"
              id={`btn-${prefix}-c${rank}`}
              className={`${styles.cinemaBtn} ${isActive ? styles.cinemaBtnActive : ''}`}
              title={tip}
              onClick={() => dispatch({ type: 'SET_AGENT_CINEMA', slot, cinema: nextCinema })}
            >
              {rank}
            </button>
          );
        })}
      </div>

      {open && (
        <AgentPickerModal
          slot={slot}
          battleType={state.battleType}
          currentName={selectedName || null}
          onSelect={(name) => {
            dispatch({ type: 'SET_AGENT_PRESET', slot, preset: name });
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export function WeaponSelectorSlot({ slot }: { slot: SlotKey }) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const cfg = state.weapons[slot];
  const agentName = state.agents[slot].presetName;
  const agentProf = agentName
    ? (CHARACTER_DB.characters[agentName]?.meta?.type ?? null)
    : null;

  const [open, setOpen] = useState(false);

  const selectedName = cfg.presetName || '';
  const wpMeta = selectedName ? WEAPON_DB[selectedName]?.meta : undefined;
  const prof = wpMeta?.type || '';
  const rarity: 'S' | 'A' | null =
    wpMeta?.rarity === 'S' ? 'S' : wpMeta?.rarity === 'A' ? 'A' : selectedName ? 'S' : null;
  const iconFile = selectedName ? WEAPON_ICON[selectedName] ?? null : null;
  const profIcon = professionIconUrl(prof);
  const rarIcon = rarityIconUrl(rarity);
  const currentStar = Math.min(5, Math.max(1, cfg.cinemaOrStar || 1));

  return (
    <div className={styles.slotCard}>
      <span className={styles.slotHeaderLabel}>选择音擎</span>
      <button
        type="button"
        className={`${styles.medallionBtn} ${
          rarity === 'S' ? styles.medallionBtnS : rarity === 'A' ? styles.medallionBtnA : ''
        }`}
        onClick={() => setOpen(true)}
        title={selectedName ? `${selectedName} · 精炼 ${currentStar}` : '点击选择该代理人音擎'}
      >
        {profIcon && (
          <div className={styles.badgeTopLeft}>
            <img src={profIcon} alt={prof} className={styles.uiIconBadge} />
          </div>
        )}
        {rarIcon && (
          <div className={styles.badgeTopRight}>
            <img src={rarIcon} alt={rarity ?? ''} className={styles.rarityIconBadge} />
          </div>
        )}
        <div className={styles.avatarClip}>
          {iconFile ? (
            <img
              src={`/resources/weapon-icons/${iconFile}`}
              alt={selectedName}
              className={styles.weaponAvatarImg}
            />
          ) : selectedName ? (
            <span className={styles.fallbackInitial}>{selectedName[0]}</span>
          ) : (
            <span className={styles.emptyPlus}>+</span>
          )}
        </div>
      </button>

      <div className={styles.slotNameText} title={selectedName || '未选择音擎'}>
        {selectedName || '点击选择音擎'}
      </div>

      {selectedName && prof ? (
        <div className={styles.slotSubMeta}>
          {profIcon && <img src={profIcon} alt="" className={styles.inlineUiIcon} />}
          <span>{prof}音擎</span>
        </div>
      ) : (
        <div className={styles.slotSubMeta}>精炼等级 ★1~★5</div>
      )}

      <StarBar
        value={currentStar}
        onCommit={(star) => dispatch({ type: 'SET_WEAPON_STAR', slot, star })}
      />

      {open && (
        <WeaponPickerModal
          slot={slot}
          battleType={state.battleType}
          defaultProf={
            agentProf || (slot === 'main' ? MODE_TYPE_MAP[state.battleType] : 'ALL')
          }
          currentName={selectedName || null}
          onSelect={(name) => {
            dispatch({ type: 'SET_WEAPON_PRESET', slot, preset: name });
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

interface AgentPickerModalProps {
  slot: SlotKey;
  battleType: BattleType;
  currentName: string | null;
  onSelect: (name: string) => void;
  onClose: () => void;
}

function AgentPickerModal({
  slot,
  battleType,
  currentName,
  onSelect,
  onClose,
}: AgentPickerModalProps) {
  const defaultProf = slot === 'main' ? MODE_TYPE_MAP[battleType] : 'ALL';
  const [profFilter, setProfFilter] = useState<string>(defaultProf);
  const [elemFilter, setElemFilter] = useState<string>('ALL');

  const allAgents = useMemo(() => getAllAgents(), []);

  const filteredAgents = useMemo(() => {
    return allAgents.filter((a) => {
      if (profFilter !== 'ALL' && a.type !== profFilter) return false;
      if (elemFilter !== 'ALL') {
        const group = BASE_ELEMENTS.find((g) => g.key === elemFilter);
        if (group && !(group.matches as readonly string[]).includes(a.element)) {
          return false;
        }
      }
      return true;
    });
  }, [allAgents, profFilter, elemFilter]);

  const sRank = filteredAgents.filter((a) => a.rarity === 'S');
  const aRank = filteredAgents.filter((a) => a.rarity === 'A');

  const slotTitle =
    slot === 'main' ? '选择主 C 代理人' : slot === 'sup1' ? '选择副 C / 辅助 1' : '选择副 C / 辅助 2';

  return (
    <div className={discStyles.pickerBackdrop} onClick={onClose}>
      <div className={discStyles.pickerModal} onClick={(e) => e.stopPropagation()}>
        <div className={discStyles.pickerHeader}>
          <span>{slotTitle}</span>
          <button type="button" className={discStyles.pickerClose} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Filter Bar with official Element & Profession UI icons */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>职业:</span>
            <button
              type="button"
              className={`${styles.filterChip} ${profFilter === 'ALL' ? styles.filterChipActive : ''}`}
              onClick={() => setProfFilter('ALL')}
            >
              全部
            </button>
            {PROFESSIONS.map((p) => {
              const pIcon = professionIconUrl(p);
              return (
                <button
                  key={p}
                  type="button"
                  className={`${styles.filterChip} ${profFilter === p ? styles.filterChipActive : ''}`}
                  onClick={() => setProfFilter(p)}
                >
                  {pIcon && <img src={pIcon} alt="" className={styles.filterChipIcon} />}
                  <span>{p}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>属性:</span>
            <button
              type="button"
              className={`${styles.filterChip} ${elemFilter === 'ALL' ? styles.filterChipActive : ''}`}
              onClick={() => setElemFilter('ALL')}
            >
              全部
            </button>
            {BASE_ELEMENTS.map((el) => {
              const eIcon = elementIconUrl(el.iconKey);
              return (
                <button
                  key={el.key}
                  type="button"
                  className={`${styles.filterChip} ${elemFilter === el.key ? styles.filterChipActive : ''}`}
                  onClick={() => setElemFilter(el.key)}
                >
                  {eIcon && <img src={eIcon} alt="" className={styles.filterChipIcon} />}
                  <span>{el.label}</span>
                </button>
              );
            })}

            {currentName && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => onSelect('')}
              >
                × 清空角色
              </button>
            )}
          </div>
        </div>

        <div className={discStyles.pickerBody}>
          <div className={discStyles.pickerColumns}>
            <AgentRarityColumn
              title="S 级代理人"
              entries={sRank}
              currentName={currentName}
              onPick={onSelect}
            />
            <AgentRarityColumn
              title="A 级代理人"
              entries={aRank}
              currentName={currentName}
              onPick={onSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentRarityColumn({
  title,
  entries,
  currentName,
  onPick,
}: {
  title: string;
  entries: AgentEntry[];
  currentName: string | null;
  onPick: (name: string) => void;
}) {
  return (
    <section className={discStyles.pickerColumn}>
      <div className={discStyles.pickerColumnHeader}>
        {title}
        <span className={discStyles.pickerColumnCount}>{entries.length}</span>
      </div>
      <div className={discStyles.pickerGrid}>
        {entries.map((e) => {
          const elemIcon = elementIconUrl(e.element);
          const profIcon = professionIconUrl(e.type);
          const rarIcon = rarityIconUrl(e.rarity);
          return (
            <button
              key={e.name}
              type="button"
              className={`${discStyles.pickerCard} ${styles.pickerCardRel} ${
                currentName === e.name ? discStyles.pickerCardActive : ''
              }`}
              onClick={() => onPick(e.name)}
              title={`${e.name} (${e.element} · ${e.type})`}
            >
              <div className={styles.pickerCardBadgesLeft}>
                {elemIcon && <img src={elemIcon} alt={e.element} className={styles.pickerBadgeIcon} />}
                {profIcon && <img src={profIcon} alt={e.type} className={styles.pickerBadgeIcon} />}
              </div>
              {rarIcon && (
                <div className={styles.pickerCardBadgeRight}>
                  <img src={rarIcon} alt={e.rarity} className={styles.pickerRarityIcon} />
                </div>
              )}
              {e.selectIconUrl ? (
                <img src={e.selectIconUrl} alt={e.name} className={styles.agentPickerArt} />
              ) : (
                <div className={discStyles.pickerEmpty}>{e.name[0]}</div>
              )}
              <span className={discStyles.pickerName}>{e.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export interface WeaponPickerModalProps {
  slot: SlotKey;
  battleType: BattleType;
  defaultProf: string;
  currentName: string | null;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export function WeaponPickerModal({
  slot,
  defaultProf,
  currentName,
  onSelect,
  onClose,
}: WeaponPickerModalProps) {
  const [profFilter, setProfFilter] = useState<string>(defaultProf || 'ALL');
  const allWeapons = useMemo(() => getAllWeapons(), []);

  const filteredWeapons = useMemo(() => {
    if (profFilter === 'ALL') return allWeapons;
    return allWeapons.filter((w) => w.type === profFilter);
  }, [allWeapons, profFilter]);

  const sRank = filteredWeapons.filter((w) => w.rarity === 'S');
  const aRank = filteredWeapons.filter((w) => w.rarity === 'A');

  const slotTitle =
    slot === 'main' ? '选择主 C 音擎' : slot === 'sup1' ? '选择副 C / 辅助 1 音擎' : '选择副 C / 辅助 2 音擎';

  return (
    <div className={discStyles.pickerBackdrop} onClick={onClose}>
      <div className={discStyles.pickerModal} onClick={(e) => e.stopPropagation()}>
        <div className={discStyles.pickerHeader}>
          <span>{slotTitle}</span>
          <button type="button" className={discStyles.pickerClose} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Filter Bar with official Profession UI icons */}
        <div className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>音擎职业:</span>
            <button
              type="button"
              className={`${styles.filterChip} ${profFilter === 'ALL' ? styles.filterChipActive : ''}`}
              onClick={() => setProfFilter('ALL')}
            >
              全部
            </button>
            {PROFESSIONS.map((p) => {
              const pIcon = professionIconUrl(p);
              return (
                <button
                  key={p}
                  type="button"
                  className={`${styles.filterChip} ${profFilter === p ? styles.filterChipActive : ''}`}
                  onClick={() => setProfFilter(p)}
                >
                  {pIcon && <img src={pIcon} alt="" className={styles.filterChipIcon} />}
                  <span>{p}</span>
                </button>
              );
            })}
          </div>

          {currentName && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => onSelect('')}
            >
              × 清空音擎
            </button>
          )}
        </div>

        <div className={discStyles.pickerBody}>
          <div className={discStyles.pickerColumns}>
            <WeaponRarityColumn
              title="S 级音擎"
              entries={sRank}
              currentName={currentName}
              onPick={onSelect}
            />
            <WeaponRarityColumn
              title="A 级音擎"
              entries={aRank}
              currentName={currentName}
              onPick={onSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function WeaponRarityColumn({
  title,
  entries,
  currentName,
  onPick,
}: {
  title: string;
  entries: WeaponEntry[];
  currentName: string | null;
  onPick: (name: string) => void;
}) {
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
              key={e.name}
              type="button"
              className={`${discStyles.pickerCard} ${styles.pickerCardRel} ${
                currentName === e.name ? discStyles.pickerCardActive : ''
              }`}
              onClick={() => onPick(e.name)}
              title={`${e.name} (${e.rarity}级 · ${e.type})`}
            >
              {profIcon && (
                <div className={styles.pickerCardBadgesLeft}>
                  <img src={profIcon} alt={e.type} className={styles.pickerBadgeIcon} />
                </div>
              )}
              {rarIcon && (
                <div className={styles.pickerCardBadgeRight}>
                  <img src={rarIcon} alt={e.rarity} className={styles.pickerRarityIcon} />
                </div>
              )}
              {e.iconFile ? (
                <img
                  src={`/resources/weapon-icons/${e.iconFile}`}
                  alt={e.name}
                  className={discStyles.pickerArt}
                />
              ) : (
                <div className={discStyles.pickerEmpty}>{e.name[0]}</div>
              )}
              <span className={discStyles.pickerName}>{e.name}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
