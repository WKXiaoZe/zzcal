// src/components/AgentPanel.tsx
import { useEffect, useMemo } from 'react';
import { useAppState, useAppDispatch } from '../state/AppContext';
import { CHARACTER_DB } from '../calc/db';
import { AGENT_BUFFS, WEAPON_BUFFS, formatBuffStatsSummary, stripGameTags } from '../calc/buffs';
import { evaluateAdditionalAbility, type AgentSlotKey } from '../calc/additionalAbility';
import { buildAgent, resolveBattleTypeForAgent } from '../calc/buildInput';
import { PRESET_FILES, loadPresetJson } from '../calc/presets';
import { parseAgentValue } from '../calc/utils';
import { AgentSelectorSlot, WeaponSelectorSlot } from './AgentWeaponPickers';
import pickerStyles from './AgentWeaponPickers.module.css';
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
  cls?: 'default-hidden' | 'break-hidden' | 'anomaly-only' | 'vanguard-only';
}

const AGENT_FIELDS: FieldDef[] = [
  { id: 'baseAtk', label: '基础攻击' },
  { id: 'baseDef', label: '基础防御', cls: 'vanguard-only' },
  { id: 'defPct', label: '防御力%', cls: 'vanguard-only' },
  { id: 'flatDef', label: '固定防御', cls: 'vanguard-only' },
  { id: 'inCombatDefPct', label: '局内防御%', cls: 'vanguard-only' },
  { id: 'critRate', label: '暴击率%' },
  { id: 'critDmg', label: '暴击伤害%' },
  { id: 'sharpCritDmg', label: '锐暴伤害%', cls: 'vanguard-only' },
  { id: 'dmgBonus', label: '增伤%' },
  { id: 'penRatio', label: '穿透率%', cls: 'break-hidden' },
  { id: 'penValue', label: '穿透值', cls: 'break-hidden' },
  { id: 'defShred', label: '无视防御(减防)%', cls: 'break-hidden' },
  { id: 'dazeVuln', label: '失衡易伤%' },
  { id: 'resShred', label: '减抗%' },
  { id: 'inCombatAtkPct', label: '局内攻击%' },
  { id: 'inCombatAtkFlat', label: '局内固定攻击' },
  { id: 'baseHp', label: '基础生命', cls: 'default-hidden' },
  { id: 'hpPct', label: '生命值%', cls: 'default-hidden' },
  { id: 'flatHp', label: '固定生命', cls: 'default-hidden' },
  { id: 'inCombatHpPct', label: '局内生命%', cls: 'default-hidden' },
  { id: 'inCombatPen', label: '局内贯穿力', cls: 'default-hidden' },
  { id: 'ppDmgBonus', label: '贯穿增伤%', cls: 'default-hidden' },
  { id: 'anomalyMastery', label: '异常精通', cls: 'anomaly-only' },
];

function isFieldVisible(cls: FieldDef['cls'], battleType: BattleType): boolean {
  if (!cls) return true;
  if (cls === 'break-hidden') return battleType !== 'break';
  if (cls === 'default-hidden') return battleType === 'break';
  if (cls === 'anomaly-only') return battleType === 'anomaly';
  if (cls === 'vanguard-only') return battleType === 'vanguard';
  return true;
}

export function AgentPanel({ slot, label }: Props) {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const battleType = resolveBattleTypeForAgent(state.agents.main.presetName, state.battleType);
  const slotState = state.agents[slot];
  const wpCfg = state.weapons[slot];
  const weaponBuffEnabled = state.buffs?.weaponBuffEnabled?.[slot] ?? true;
  const wpStar = Math.max(1, Math.min(5, wpCfg.cinemaOrStar || 1));
  const wpBuff = wpCfg.presetName ? WEAPON_BUFFS[wpCfg.presetName] : undefined;
  const wpRefDesc = wpBuff?.refinementDescs?.[wpStar - 1] ?? wpBuff?.desc ?? '';
  const wpRefStats = wpBuff?.refinementStats?.[wpStar - 1] ?? wpBuff?.stats;
  const wpBadges = useMemo(() => formatBuffStatsSummary(wpRefStats), [wpRefStats]);

  const enabledBuffMap = state.buffs?.agentBuffs?.[slot] ?? {};
  const teamNames: Record<AgentSlotKey, string> = useMemo(
    () => ({
      main: state.agents.main.presetName,
      sup1: state.agents.sup1.presetName,
      sup2: state.agents.sup2.presetName,
    }),
    [state.agents.main.presetName, state.agents.sup1.presetName, state.agents.sup2.presetName],
  );

  const visibleFields = useMemo(
    () => AGENT_FIELDS.filter((f) => isFieldVisible(f.cls, battleType)),
    [battleType],
  );

  const resolvedStats = useMemo(
    () => buildAgent(slotState, slot, enabledBuffMap),
    [slotState, slot, enabledBuffMap],
  );

  const agentBuffList = useMemo(() => {
    if (!slotState.presetName) return [];
    const raw = AGENT_BUFFS[slotState.presetName] ?? [];
    // Only display Mindscape Cinema buffs (M1/M2/M4/M6) that are unlocked by current cinemaOrStar
    return raw.filter((b) => !b.cinemaRank || b.cinemaRank <= slotState.cinemaOrStar);
  }, [slotState.presetName, slotState.cinemaOrStar]);

  const prefix = slot === 'main' ? 'a_main' : slot === 'sup1' ? 'a_sup1' : 'a_sup2';

  useEffect(() => {
    const name = slotState.presetName;
    if (!name) return;
    const inDb =
      slot === 'main'
        ? !!CHARACTER_DB.characters[name]
        : !!(CHARACTER_DB.characters[name] || (CHARACTER_DB.sup ?? {})[name]);
    if (inDb) return;
    const folder = slot === 'main' ? 'dps' : 'sup';
    if (!PRESET_FILES[folder].includes(name)) return;
    let cancelled = false;
    loadPresetJson(folder, name)
      .then((data) => {
        if (cancelled) return;
        const overrides: Record<string, number> = {};
        for (const f of AGENT_FIELDS) {
          const raw = data[f.id];
          if (raw !== undefined) {
            overrides[f.id] = parseAgentValue(raw, slotState.cinemaOrStar);
          }
        }
        dispatch({ type: 'SET_AGENT_OVERRIDES', slot, overrides });
      })
      .catch((err) => {
        console.warn(`[AgentPanel] failed to load preset ${folder}/${name}.json:`, err);
      });
    return () => {
      cancelled = true;
    };
  }, [slot, slotState.presetName, slotState.cinemaOrStar, dispatch]);

  return (
    <div className={`sub-module ${styles.agentPanel}`} id={`agent-${slot}`}>
      <div className="module-title">
        <span>{label}</span>
      </div>

      {/* Visual Agent Selector + Side-by-Side W-Engine Selector */}
      <div className={pickerStyles.pairDock}>
        <AgentSelectorSlot slot={slot} />
        <WeaponSelectorSlot slot={slot} />
      </div>

      {/* Field inputs */}
      {visibleFields.map((f) => {
        const overridden = slotState.customOverrides[f.id];
        const resolved = (resolvedStats as Record<string, number | undefined>)[f.id] ?? 0;
        const value = overridden ?? resolved;
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

      {/* 角色可主动、被动、影画及音擎特效 Buff 选择区 */}
      {(agentBuffList.length > 0 || wpBuff) && (
        <div className={styles.buffSection}>
          <div className={styles.buffHeader}>
            <span>
              角色 & 音擎 Buff ({slotState.presetName || '未选代理人'}
              {wpCfg.presetName ? ` · ${wpCfg.presetName}` : ''})
            </span>
            <div className={styles.buffActions}>
              <button
                type="button"
                className={styles.miniBtn}
                onClick={() => {
                  const nextMap: Record<string, boolean> = {};
                  for (const b of agentBuffList) {
                    if (b.subType === '额外能力') {
                      if (evaluateAdditionalAbility(slot, teamNames, b.desc).triggered) {
                        nextMap[b.id] = true;
                      }
                    } else if (!b.cinemaRank || b.cinemaRank <= slotState.cinemaOrStar) {
                      nextMap[b.id] = true;
                    }
                  }
                  dispatch({ type: 'SET_ALL_AGENT_BUFFS', slot, buffMap: nextMap });
                  if (wpBuff) {
                    dispatch({ type: 'TOGGLE_WEAPON_BUFF', slot, enabled: true });
                  }
                }}
              >
                全选当前可用
              </button>
              <button
                type="button"
                className={styles.miniBtn}
                onClick={() => {
                  dispatch({ type: 'SET_ALL_AGENT_BUFFS', slot, buffMap: {} });
                  if (wpBuff) {
                    dispatch({ type: 'TOGGLE_WEAPON_BUFF', slot, enabled: false });
                  }
                }}
              >
                清空
              </button>
            </div>
          </div>
          <div className={styles.buffList}>
            {wpBuff && (
              <label
                className={`${styles.buffCard} ${weaponBuffEnabled ? styles.buffCardActive : ''}`}
              >
                <div className={styles.buffTopRow}>
                  <input
                    type="checkbox"
                    className={styles.buffCheckbox}
                    checked={weaponBuffEnabled}
                    onChange={(e) =>
                      dispatch({
                        type: 'TOGGLE_WEAPON_BUFF',
                        slot,
                        enabled: e.target.checked,
                      })
                    }
                  />
                  <span className={styles.wpSubTypeTag}>音擎特效 ★{wpStar}</span>
                  <span className={styles.buffTitle}>
                    {wpCfg.presetName} · {wpBuff.title}
                  </span>
                  {wpBadges.length > 0 && (
                    <div className={styles.statBadges}>
                      {wpBadges.map((bd, i) => (
                        <span key={i} className={styles.statBadge}>
                          {bd}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.buffDesc}>{stripGameTags(wpRefDesc)}</div>
              </label>
            )}
            {slotState.cinemaOrStar >= 3 && (
              <div className={`${styles.buffCard} ${styles.buffCardActive}`}>
                <div className={styles.buffTopRow}>
                  <span className={styles.subTypeTag}>影画M3</span>
                  <span className={styles.buffTitle}>技能等级上限提升</span>
                  <div className={styles.statBadges}>
                    <span className={styles.statBadge}>技能上限 Lv.12 → Lv.14</span>
                  </div>
                </div>
                <div className={styles.buffDesc}>
                  [普通攻击]、[闪避]、[支援技]、[特殊技]、[连携技] 技能等级上限 +2（最高可升至 14 级）。
                </div>
              </div>
            )}
            {slotState.cinemaOrStar >= 5 && (
              <div className={`${styles.buffCard} ${styles.buffCardActive}`}>
                <div className={styles.buffTopRow}>
                  <span className={styles.subTypeTag}>影画M5</span>
                  <span className={styles.buffTitle}>技能等级上限再提升</span>
                  <div className={styles.statBadges}>
                    <span className={styles.statBadge}>技能上限 Lv.14 → Lv.16</span>
                  </div>
                </div>
                <div className={styles.buffDesc}>
                  [普通攻击]、[闪避]、[支援技]、[特殊技]、[连携技] 技能等级上限再 +2（最高可升至 16 级）。
                </div>
              </div>
            )}
            {agentBuffList.map((b) => {
              const checked = !!enabledBuffMap[b.id];
              const badges = formatBuffStatsSummary(b.stats);
              const addEval =
                b.subType === '额外能力'
                  ? evaluateAdditionalAbility(slot, teamNames, b.desc)
                  : null;
              return (
                <label
                  key={b.id}
                  className={`${styles.buffCard} ${checked ? styles.buffCardActive : ''}`}
                >
                  <div className={styles.buffTopRow}>
                    <input
                      type="checkbox"
                      className={styles.buffCheckbox}
                      checked={checked}
                      onChange={(e) =>
                        dispatch({
                          type: 'TOGGLE_AGENT_BUFF',
                          slot,
                          buffId: b.id,
                          enabled: e.target.checked,
                        })
                      }
                    />
                    <span className={styles.subTypeTag}>{b.subType}</span>
                    <span className={styles.buffTitle}>{b.title}</span>
                    {addEval && (
                      <span
                        className={
                          addEval.triggered
                            ? styles.addTriggerOk
                            : styles.addTriggerPending
                        }
                      >
                        {addEval.triggered
                          ? `⚡ 已触发: ${addEval.matchedReasons.join('、')}`
                          : '未满足组队条件'}
                      </span>
                    )}
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
      )}
    </div>
  );
}
