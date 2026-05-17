// NOTE: 这个面板的本地 set2 选择会与 DiscPanel 选的 set2Key 在 extraStats.set2_* 桶里叠加，
// 是 legacy 行为的保留。如果你想纯净测算"假设切换到另一套2件套"，请把 DiscPanel 的 2件套设回 "无套装"。
// src/components/ManualOptPanel.tsx
// Manual optimization panel — mirrors legacy `#manual-ui` block
// (legacy/index-legacy.html lines 325-404) and the calc dispatch in
// `manualUpdate()` (legacy line 1521-1609).
//
// Slot-5 main stat and 2-set bonus selections are local-only React state
// (useState) because they only affect *this panel's* display, not the
// shared AppState. Subcount counters DO live in AppState
// (`state.disc.subCounts`) so they are read directly via context.
//
// Buff folding mimics legacy `extraStats.slot5_* / set2_*` exactly:
//   slot5: atkPct:30 / dmgBonus:30 / penRatio:24 / hpPct:30
//   set2 : atkPct:10 / dmgBonus:10 / penRatio:8 / hpPct:10 / critDmg:16
//
// Subcount coefficients are NOT re-derived here — `buildCalcInput` already
// applies them. We only need to layer slot5/set2 on top of the buildInput
// output's extraStats before calling `calculateDamage`.

import { useMemo, useState } from 'react';
import { useAppState } from '../state/AppContext';
import { buildCalcInput } from '../calc/buildInput';
import { calculateDamage } from '../calc/formulas';
import type { ExtraSubStats, BattleType } from '../calc/types';

// --- Option tables --------------------------------------------------------
// Each option's `extra` payload is merged additively into `extraStats`.
// Keys map onto the buckets `calculateDamage` already understands.

type Slot5Key = 'atk' | 'dmg' | 'pen' | 'hp';
type Set2Key = 'atk' | 'dmg' | 'pen' | 'hp' | 'cd';

interface OptionDef<K extends string> {
  key: K;
  label: string;
  extra: Partial<ExtraSubStats>;
}

function slot5OptionsFor(battleType: BattleType): OptionDef<Slot5Key>[] {
  if (battleType === 'break') {
    return [
      { key: 'atk', label: '5号位攻击%',  extra: { slot5_AtkPct: 30 } },
      { key: 'dmg', label: '5号位增伤%',  extra: { slot5_Dmg: 30 } },
      { key: 'hp',  label: '5号位生命%',  extra: { slot5_HpPct: 30 } },
    ];
  }
  // attack / anomaly share the same slot5 options
  return [
    { key: 'atk', label: '5号位攻击%',  extra: { slot5_AtkPct: 30 } },
    { key: 'dmg', label: '5号位增伤%',  extra: { slot5_Dmg: 30 } },
    { key: 'pen', label: '5号位穿透%',  extra: { slot5_Pen: 24 } },
  ];
}

function set2OptionsFor(battleType: BattleType): OptionDef<Set2Key>[] {
  if (battleType === 'break') {
    return [
      { key: 'dmg', label: '2件套增伤 10%',     extra: { set2_Dmg: 10 } },
      { key: 'pen', label: '2件套穿透 8%',      extra: { set2_Pen: 8 } },
      { key: 'hp',  label: '2件套生命 10%',     extra: { set2_HpPct: 10 } },
      { key: 'cd',  label: '2件套爆伤 16%',     extra: { set2_CD: 16 } },
    ];
  }
  // attack / anomaly share the same set2 options
  return [
    { key: 'atk', label: '2件套攻击 10%',     extra: { set2_AtkPct: 10 } },
    { key: 'dmg', label: '2件套增伤 10%',     extra: { set2_Dmg: 10 } },
    { key: 'pen', label: '2件套穿透 8%',      extra: { set2_Pen: 8 } },
    { key: 'cd',  label: '2件套爆伤 16%',     extra: { set2_CD: 16 } },
  ];
}

// --- Subcount preview coefficients (matches legacy/index-legacy.html ~1882)
const SUBCOUNT_COEFF = {
  CR: 2.4, // %
  CD: 4.8, // %
  ATK: 3.0, // %
  HP: 3.0, // %
  AM: 9.0, // flat
} as const;

// Pick a sensible default selection for the current battle type.
function defaultSlot5(battleType: BattleType): Slot5Key {
  return battleType === 'break' ? 'atk' : 'atk';
}
function defaultSet2(battleType: BattleType): Set2Key {
  return battleType === 'break' ? 'dmg' : 'cd';
}

// Merge two ExtraSubStats payloads additively (right-hand keys add to left).
function mergeExtra(base: ExtraSubStats, add: Partial<ExtraSubStats>): ExtraSubStats {
  const out: ExtraSubStats = { ...base };
  for (const [k, v] of Object.entries(add)) {
    if (typeof v !== 'number') continue;
    const key = k as keyof ExtraSubStats;
    out[key] = (out[key] ?? 0) + v;
  }
  return out;
}

// --- Sub-buttons ---------------------------------------------------------

interface ButtonGroupProps<K extends string> {
  options: OptionDef<K>[];
  selected: K;
  onSelect: (k: K) => void;
  ariaLabel: string;
}

function ButtonGroup<K extends string>({ options, selected, onSelect, ariaLabel }: ButtonGroupProps<K>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
    >
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          className={`zzz-btn${selected === opt.key ? ' active' : ''}`}
          onClick={() => onSelect(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// --- Main component ------------------------------------------------------

export function ManualOptPanel() {
  const state = useAppState();
  const battleType = state.battleType;

  // Local-only selections (intentionally NOT in AppState — only this panel
  // consumes them). When battleType changes, the options list may no longer
  // contain the previous selection; we fall back to the default in that case
  // via a defensive `currentSlot5Opts.find(...)` below.
  const [slot5Key, setSlot5Key] = useState<Slot5Key>(defaultSlot5(battleType));
  const [set2Key, setSet2Key] = useState<Set2Key>(defaultSet2(battleType));

  const slot5Opts = useMemo(() => slot5OptionsFor(battleType), [battleType]);
  const set2Opts = useMemo(() => set2OptionsFor(battleType), [battleType]);

  // Defensive lookup — if a previously valid key is no longer in the option
  // list (e.g. user toggled to break mode after selecting `pen`), treat as
  // the first available option without mutating state (state correction would
  // require an effect and is overkill for a display-only panel).
  const slot5Active = slot5Opts.find((o) => o.key === slot5Key)?.key ?? slot5Opts[0].key;
  const set2Active  = set2Opts.find((o) => o.key === set2Key)?.key ?? set2Opts[0].key;

  const slot5Extra = slot5Opts.find((o) => o.key === slot5Active)?.extra ?? {};
  const set2Extra  = set2Opts.find((o) => o.key === set2Active)?.extra ?? {};

  // Build the calc input and layer slot5/set2 on top of the existing
  // extraStats produced by buildCalcInput (which already encodes subCounts
  // and 2-set DB stats). Slot5 is purely a manual override — buildCalcInput
  // does not populate slot5_* buckets.
  const result = useMemo(() => {
    const baseInput = buildCalcInput(state);
    const mergedExtra = mergeExtra(
      mergeExtra(baseInput.extraStats ?? {}, slot5Extra),
      set2Extra
    );
    return calculateDamage({ ...baseInput, extraStats: mergedExtra });
  }, [state, slot5Extra, set2Extra]);

  const dmg = result.dmg;
  const d = result.details;
  const sc = state.disc.subCounts;
  const subTotal = sc.CR + sc.CD + sc.ATK + sc.HP + sc.AM;

  return (
    <section
      className="card"
      style={{
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 18,
        marginTop: 20,
        color: '#eee',
        fontFamily: 'inherit',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 12 }}>手动优化</h2>

      {/* 5 号位主词条 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 6, color: '#aaa', fontSize: '0.85rem' }}>5 号位主词条</div>
        <ButtonGroup<Slot5Key>
          options={slot5Opts}
          selected={slot5Active}
          onSelect={setSlot5Key}
          ariaLabel="5号位主词条"
        />
      </div>

      {/* 2 件套增益 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 6, color: '#aaa', fontSize: '0.85rem' }}>2 件套效果</div>
        <ButtonGroup<Set2Key>
          options={set2Opts}
          selected={set2Active}
          onSelect={setSet2Key}
          ariaLabel="2件套效果"
        />
      </div>

      {/* 副词条增益预览 (只读) */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ marginBottom: 6, color: '#aaa', fontSize: '0.85rem' }}>
          副词条加成预览 ({subTotal} / 48)
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 8,
            fontSize: '0.8rem',
            background: 'rgba(255,255,255,0.04)',
            padding: 10,
            borderRadius: 8,
          }}
        >
          <SubCell label="暴击率"   count={sc.CR}  unit="%" total={sc.CR  * SUBCOUNT_COEFF.CR} />
          <SubCell label="暴击伤害" count={sc.CD}  unit="%" total={sc.CD  * SUBCOUNT_COEFF.CD} />
          <SubCell label="攻击力%"  count={sc.ATK} unit="%" total={sc.ATK * SUBCOUNT_COEFF.ATK} />
          <SubCell label="生命值%"  count={sc.HP}  unit="%" total={sc.HP  * SUBCOUNT_COEFF.HP} />
          <SubCell label="异常精通" count={sc.AM}  unit=""  total={sc.AM  * SUBCOUNT_COEFF.AM} />
        </div>
        {subTotal > 48 && (
          <div style={{ color: '#ff8e8e', fontSize: '0.8rem', marginTop: 6 }}>
            警告: 词条总数 {subTotal} 超过 48
          </div>
        )}
      </div>

      {/* 当前面板数值 */}
      <div>
        <div style={{ marginBottom: 6, color: '#aaa', fontSize: '0.85rem' }}>当前面板数值</div>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255,120,180,0.12), rgba(255,180,80,0.12))',
            border: '1px solid rgba(255,150,180,0.25)',
            borderRadius: 10,
            padding: '12px 16px',
            marginBottom: 10,
          }}
        >
          <div style={{ color: '#aaa', fontSize: '0.78rem', marginBottom: 2 }}>总伤害</div>
          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 700,
              color: '#ffb0d4',
              letterSpacing: '0.02em',
            }}
          >
            {Number.isFinite(dmg) ? dmg.toFixed(0) : '—'}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 6,
            fontSize: '0.85rem',
          }}
        >
          <StatRow label="总攻击力"   value={d.totalAtk.toFixed(0)} />
          <StatRow label="面板攻击"   value={d.sheetAtk.toFixed(0)} />
          <StatRow label="暴击率"     value={`${d.totalCR.toFixed(1)}%`} />
          <StatRow label="暴击伤害"   value={`${d.totalCD.toFixed(1)}%`} />
          <StatRow label="增伤区"     value={`${d.totalDmgBonus.toFixed(1)}%`} />
          <StatRow label="穿透率"     value={`${d.totalPenPct.toFixed(1)}%`} />
          {battleType === 'break' && (
            <StatRow label="贯穿力"   value={d.totalPierce.toFixed(0)} />
          )}
          {battleType === 'anomaly' && (
            <StatRow label="异常精通" value={d.totalAnomalyMastery.toFixed(0)} />
          )}
        </div>

        {result.warnings.length > 0 && (
          <ul style={{ color: '#ffb87a', fontSize: '0.8rem', marginTop: 8, paddingLeft: 18 }}>
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// --- Small leaf components ----------------------------------------------

interface SubCellProps {
  label: string;
  count: number;
  unit: string;
  total: number;
}

function SubCell({ label, count, unit, total }: SubCellProps) {
  return (
    <div style={{ textAlign: 'center', color: '#ddd' }}>
      <div style={{ color: '#888', fontSize: '0.72rem' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{count}</div>
      <div style={{ color: '#ffb0d4', fontSize: '0.75rem' }}>
        = {total.toFixed(1)}
        {unit}
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string;
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.03)',
        padding: '4px 10px',
        borderRadius: 6,
      }}
    >
      <span style={{ color: '#aaa' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}
