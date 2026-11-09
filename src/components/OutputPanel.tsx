// src/components/OutputPanel.tsx
// Final damage, skill selector (Lv.1~16 with M3/M5 cap unlock), stun/daze, anomaly/energy/decibel
// metrics, per-hit breakdown, and summary stat panel.
import { useMemo, useState } from 'react';
import { useAppDispatch, useAppState } from '../state/AppContext';
import { buildCalcInput, resolveBattleTypeForAgent } from '../calc/buildInput';
import { calculateDamage } from '../calc/formulas';
import {
  AGENT_BASE_COMBAT,
  AGENT_SKILLS,
  SKILL_CATEGORIES,
  calcSkillAtLevel,
  getMaxSkillLevel,
  type SkillCategory,
} from '../calc/agentSkills';
import type { CalcDetails } from '../calc/types';
import { LogPanel } from './LogPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import styles from './OutputPanel.module.css';

interface Row {
  label: string;
  value: string;
}

function fmtInt(n: number): string {
  return Math.floor(n).toString();
}

function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function buildRows(battleType: string, d: CalcDetails): Row[] {
  if (battleType === 'break') {
    return [
      { label: '总贯穿力', value: fmtInt(d.totalPierce) },
      { label: '局内最大生命', value: fmtInt(d.maxHpInCombat || 0) },
      { label: '暴击率', value: fmtPct(d.totalCR) },
      { label: '暴击伤害', value: fmtPct(d.totalCD) },
      { label: '增伤区', value: fmtPct(d.totalDmgBonus) },
      { label: '减抗', value: fmtPct(d.totalResShred) },
    ];
  }
  if (battleType === 'anomaly') {
    return [
      { label: '总攻击力', value: fmtInt(d.totalAtk) },
      { label: '异常精通', value: d.totalAnomalyMastery.toFixed(0) },
      { label: '增伤区', value: fmtPct(d.totalDmgBonus) },
      { label: '穿透率', value: fmtPct(d.totalPenPct) },
      { label: '穿透值', value: d.totalPenVal.toFixed(0) },
      { label: '无视防御(减防)', value: fmtPct(d.totalDefShred) },
      { label: '减抗', value: fmtPct(d.totalResShred) },
    ];
  }
  if (battleType === 'vanguard') {
    return [
      { label: '总防御力 (锐化倍率基数)', value: fmtInt(d.totalDef ?? 0) },
      { label: '面板防御力', value: fmtInt(d.sheetDef ?? 0) },
      {
        label: '总暴击率 (上限200%)',
        value: `${fmtPct(d.totalCR)}${d.convertedCR ? ` (含暴伤转+${fmtPct(d.convertedCR)})` : ''}`,
      },
      { label: '锐暴伤害', value: fmtPct(d.totalSharpCD ?? 50) },
      { label: '增伤区', value: fmtPct(d.totalDmgBonus) },
      { label: '穿透率', value: fmtPct(d.totalPenPct) },
      { label: '无视防御(减防)', value: fmtPct(d.totalDefShred) },
      { label: '减抗', value: fmtPct(d.totalResShred) },
    ];
  }
  // attack (default)
  return [
    { label: '总攻击力', value: fmtInt(d.totalAtk) },
    { label: '暴击率', value: fmtPct(d.totalCR) },
    { label: '暴击伤害', value: fmtPct(d.totalCD) },
    { label: '增伤区', value: fmtPct(d.totalDmgBonus) },
    { label: '穿透率', value: fmtPct(d.totalPenPct) },
    { label: '穿透值', value: d.totalPenVal.toFixed(0) },
    { label: '无视防御(减防)', value: fmtPct(d.totalDefShred) },
    { label: '减抗', value: fmtPct(d.totalResShred) },
  ];
}

export function OutputPanel() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const mainAgentName = state.agents.main.presetName;
  const mainCinema = state.agents.main.cinemaOrStar;
  const maxSkillLevel = getMaxSkillLevel(mainCinema);

  const selectedSkill = state.selectedSkill ?? {
    moveId: '',
    level: 12,
    customMultiplier: 100,
  };
  const skillLevel = Math.min(maxSkillLevel, Math.max(1, selectedSkill.level || 12));

  const [catFilter, setCatFilter] = useState<SkillCategory | 'all'>('all');

  const allMoves = useMemo(
    () => (mainAgentName ? AGENT_SKILLS[mainAgentName] ?? [] : []),
    [mainAgentName],
  );

  const filteredMoves = useMemo(
    () =>
      catFilter === 'all'
        ? allMoves
        : allMoves.filter((m) => m.category === catFilter),
    [allMoves, catFilter],
  );

  const activeMove = useMemo(
    () => allMoves.find((m) => m.id === selectedSkill.moveId) ?? null,
    [allMoves, selectedSkill.moveId],
  );

  const calcedSkill = useMemo(
    () => (activeMove ? calcSkillAtLevel(activeMove, skillLevel) : null),
    [activeMove, skillLevel],
  );

  const baseCombat = mainAgentName ? AGENT_BASE_COMBAT[mainAgentName] : undefined;
  const baseImpact = baseCombat?.baseImpact ?? 100;
  const baseAnomalyPower = baseCombat?.baseAnomalyPower ?? 100;

  const result = useMemo(
    () => calculateDamage(buildCalcInput(state)),
    [state],
  );

  const effectiveBattleType = resolveBattleTypeForAgent(mainAgentName, state.battleType);
  const rows = buildRows(effectiveBattleType, result.details);

  const effectiveDmgMultPct = calcedSkill
    ? calcedSkill.dmgMultPct
    : selectedSkill.customMultiplier || 100;
  const effectiveStunMultPct = calcedSkill ? calcedSkill.stunMultPct : 0;
  const estimatedDaze = (baseImpact * effectiveStunMultPct) / 100;

  return (
    <section className={`sub-module ${styles.outputPanel}`}>
      <div className="module-title">
        <span>最终伤害 & 角色技能招式测算</span>
      </div>

      {/* 技能招式选择 & 技能等级控制栏 */}
      <div className={styles.skillControlBox}>
        <div className={styles.skillTopBar}>
          <div className={styles.catTabs}>
            <button
              type="button"
              className={`${styles.catTab} ${catFilter === 'all' ? styles.catTabActive : ''}`}
              onClick={() => setCatFilter('all')}
            >
              全部招式 ({allMoves.length})
            </button>
            {SKILL_CATEGORIES.map((cat) => {
              const count = allMoves.filter((m) => m.category === cat.key).length;
              if (allMoves.length > 0 && count === 0) return null;
              return (
                <button
                  key={cat.key}
                  type="button"
                  className={`${styles.catTab} ${catFilter === cat.key ? styles.catTabActive : ''}`}
                  onClick={() => setCatFilter(cat.key)}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          {/* 技能等级调节器 (默认12，3命解锁14，5命解锁16) */}
          <div className={styles.levelControl}>
            <span className={styles.levelLabel}>
              技能等级
              <span className={styles.levelCapBadge}>
                上限 Lv.{maxSkillLevel}
                {mainCinema >= 5 ? ' (3+5命)' : mainCinema >= 3 ? ' (3命)' : ' (0~2命)'}
              </span>
            </span>

            <div className={styles.levelQuickGroup}>
              {[1, 11, 12, 14, 16].map((presetLv) => {
                const locked = presetLv > maxSkillLevel;
                const unlockHint =
                  presetLv === 14
                    ? '需解锁 3 命 (影画3) 才可升至 14 级'
                    : presetLv === 16
                      ? '需解锁 5 命 (影画5) 才可升至 16 级'
                      : `设置技能等级为 Lv.${presetLv}`;
                return (
                  <button
                    key={presetLv}
                    type="button"
                    disabled={locked}
                    title={unlockHint}
                    className={`${styles.lvQuickBtn} ${
                      skillLevel === presetLv ? styles.lvQuickBtnActive : ''
                    } ${locked ? styles.lvQuickBtnLocked : ''}`}
                    onClick={() => dispatch({ type: 'SET_SKILL_LEVEL', level: presetLv })}
                  >
                    Lv.{presetLv}
                  </button>
                );
              })}

              <input
                type="number"
                min={1}
                max={maxSkillLevel}
                step={1}
                value={skillLevel}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v)) {
                    dispatch({ type: 'SET_SKILL_LEVEL', level: v });
                  }
                }}
                className={styles.levelInput}
                title={`输入技能等级 (1 ~ ${maxSkillLevel})`}
              />
            </div>
          </div>
        </div>

        {/* 招式下拉选择器 + 自定义倍率 */}
        <div className={styles.moveSelectorRow}>
          <div className={styles.moveSelectWrap}>
            <label htmlFor="skill-move-select" className={styles.moveSelectLabel}>
              选择 {mainAgentName || '主C'} 招式
            </label>
            <Select
              value={selectedSkill.moveId || '__custom__'}
              onValueChange={(v) => {
                if (v === '__custom__') {
                  dispatch({ type: 'SET_SKILL_MOVE', moveId: '' });
                } else {
                  dispatch({ type: 'SET_SKILL_MOVE', moveId: v });
                }
              }}
            >
              <SelectTrigger id="skill-move-select" className={styles.moveSelectTrigger}>
                <SelectValue placeholder="选择角色技能招式..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__custom__">
                  -- 自定义倍率 ({selectedSkill.customMultiplier || 100}%) --
                </SelectItem>
                {filteredMoves.map((m) => {
                  const preview = calcSkillAtLevel(m, skillLevel);
                  return (
                    <SelectItem key={m.id} value={m.id}>
                      [{m.categoryName}] {m.fullName} — 伤害 {preview.dmgMultPct.toFixed(1)}% / 失衡{' '}
                      {preview.stunMultPct.toFixed(1)}%
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {!activeMove && (
            <div className={styles.customMultBox}>
              <label htmlFor="custom-skill-mult" className={styles.moveSelectLabel}>
                自定义伤害倍率 (%)
              </label>
              <input
                id="custom-skill-mult"
                type="number"
                min={1}
                step={10}
                value={selectedSkill.customMultiplier || 100}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_CUSTOM_SKILL_MULTIPLIER',
                    multiplier: Number(e.target.value) || 100,
                  })
                }
                className={styles.customMultInput}
              />
            </div>
          )}
        </div>
      </div>

      {/* 核心输出指标卡片区：最终伤害 + 失衡值/失衡倍率 + 异常积蓄/回能/喧响 */}
      <div className={styles.metricsHeroGrid}>
        {/* 1. 最终伤害 */}
        <div className={styles.heroCardPrimary}>
          <div className={styles.heroCardTop}>
            <span className={styles.heroCardTitle}>
              {activeMove ? `${activeMove.fullName} (Lv.${skillLevel})` : '最终伤害 (自定义倍率)'}
            </span>
            <span className={styles.heroBadgePink}>
              伤害倍率 {effectiveDmgMultPct.toFixed(1)}%
            </span>
          </div>
          <div className={`opt-dmg ${styles.heroDamageNumber}`}>
            {Math.floor(result.dmg).toLocaleString()}
          </div>
          {activeMove && (
            <div className={styles.heroFormulaSub}>
              Lv.1 基础 {(activeMove.lv1Dmg / 100).toFixed(1)}% + ({skillLevel} - 1) × 每级成长{' '}
              {(activeMove.dmgGrowth / 100).toFixed(2)}%
            </div>
          )}
        </div>

        {/* 2. 失衡倍率 & 预计失衡值 */}
        <div className={styles.heroCardSecondary}>
          <div className={styles.heroCardTop}>
            <span className={styles.heroCardTitle}>招式失衡数据</span>
            <span className={styles.heroBadgeAmber}>
              基础冲击力 {baseImpact}
            </span>
          </div>
          <div className={styles.stunMainRow}>
            <div>
              <div className={styles.subMetricLabel}>预计失衡值</div>
              <div className={styles.stunNumber}>
                {effectiveStunMultPct > 0 ? estimatedDaze.toFixed(1) : '0.0'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.subMetricLabel}>失衡倍率 (Lv.{skillLevel})</div>
              <div className={styles.stunMultVal}>{effectiveStunMultPct.toFixed(1)}%</div>
            </div>
          </div>
          {activeMove && (
            <div className={styles.heroFormulaSub}>
              Lv.1 失衡 {(activeMove.lv1Stun / 100).toFixed(1)}% + ({skillLevel} - 1) × 每级成长{' '}
              {(activeMove.stunGrowth / 100).toFixed(2)}%
            </div>
          )}
        </div>

        {/* 3. 其它技能数据：异常积蓄 / 能量回复 / 喧响值回复 */}
        <div className={styles.heroCardSecondary}>
          <div className={styles.heroCardTop}>
            <span className={styles.heroCardTitle}>异常积蓄 / 能量 / 喧响</span>
            {activeMove?.costText && (
              <span className={styles.heroBadgeCyan}>{activeMove.costText}</span>
            )}
          </div>
          <div className={styles.extraDataGrid}>
            <div className={styles.extraDataCell}>
              <span className={styles.subMetricLabel}>基础异常积蓄</span>
              <span className={styles.extraDataVal}>
                {activeMove ? activeMove.anomalyBuildup.toFixed(1) : '—'}
              </span>
              {activeMove && activeMove.anomalyBuildup > 0 && (
                <span className={styles.extraDataHint}>
                  含掌控({baseAnomalyPower}):{' '}
                  {((activeMove.anomalyBuildup * baseAnomalyPower) / 100).toFixed(1)}
                </span>
              )}
            </div>
            <div className={styles.extraDataCell}>
              <span className={styles.subMetricLabel}>能量自然回复</span>
              <span className={styles.extraDataVal}>
                {activeMove && activeMove.spRecovery > 0
                  ? `+${activeMove.spRecovery.toFixed(2)}`
                  : '0.00'}
              </span>
            </div>
            <div className={styles.extraDataCell}>
              <span className={styles.subMetricLabel}>喧响值回复</span>
              <span className={styles.extraDataVal}>
                {activeMove && activeMove.feverRecovery > 0
                  ? `+${activeMove.feverRecovery.toFixed(1)}`
                  : '0.0'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 动作逐段 Hit 拆分表 */}
      {calcedSkill && calcedSkill.hits.length > 1 && (
        <div className={styles.hitBreakdownSection}>
          <div className={styles.hitBreakdownHeader}>
            <span>
              ⚡ 招式逐段 Hit 拆分 ({calcedSkill.hits.length} 段 · AttackProperty 动作帧权重)
            </span>
          </div>
          <div className={styles.hitTableWrap}>
            <table className={styles.hitTable}>
              <thead>
                <tr>
                  <th>段数</th>
                  <th>伤害权重</th>
                  <th>该段伤害倍率</th>
                  <th>该段期望伤害</th>
                  <th>失衡权重</th>
                  <th>该段失衡倍率</th>
                </tr>
              </thead>
              <tbody>
                {calcedSkill.hits.map((h) => (
                  <tr key={h.hitIndex}>
                    <td>Hit {h.hitIndex}</td>
                    <td>{(h.dmgRatio * 100).toFixed(1)}%</td>
                    <td>{h.hitDmgMultPct.toFixed(1)}%</td>
                    <td className={styles.hitDmgCell}>
                      {Math.floor(result.dmg * h.dmgRatio).toLocaleString()}
                    </td>
                    <td>{(h.stunRatio * 100).toFixed(1)}%</td>
                    <td>{h.hitStunMultPct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h3 style={{ marginTop: 20 }}>最终面板</h3>
      <div className={styles.panelData}>
        {rows.map((r) => (
          <div key={r.label} className={styles.panelRow}>
            <span>{r.label}</span>
            <span>{r.value}</span>
          </div>
        ))}
      </div>

      <LogPanel trace={result.warnings} />
    </section>
  );
}
