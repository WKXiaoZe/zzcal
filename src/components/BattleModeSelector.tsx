// src/components/BattleModeSelector.tsx
// Unified Adaptive Archetype Indicator (replaces legacy 3-mode manual toggle).
// Automatically detects and displays the active damage model based on the Main Agent's
// specialty (强攻/击破/支援/防护 -> 直伤, 命破 -> 贯穿, 异常 -> 异常精通, 锋御 -> 防御锐化).
import { useAppState } from '../state/AppContext';
import { CHARACTER_DB } from '../calc/db';
import { resolveBattleTypeForAgent } from '../calc/buildInput';
import type { BattleType } from '../calc/types';

const ARCHETYPE_META: Record<
  BattleType,
  { name: string; tag: string; formulaHint: string; color: string }
> = {
  attack: {
    name: '强攻直伤模型',
    tag: '强攻 / 击破 / 支援 / 防护',
    formulaHint: '攻击力 × 双暴 × 增伤 × 防御区 × 抗性区 × 失衡区',
    color: '#ff944b',
  },
  break: {
    name: '命破贯穿模型',
    tag: '命破',
    formulaHint: '贯穿力(生命+攻击转化) × 双暴 × (增伤+贯穿增伤) × 无视防御',
    color: '#ffd166',
  },
  anomaly: {
    name: '异常精通模型',
    tag: '异常',
    formulaHint: '攻击力 × (异常精通/100) × 增伤 × 防御区 × 抗性区 × 失衡区',
    color: '#7bdff2',
  },
  vanguard: {
    name: '锋御锐化模型',
    tag: '锋御 (Pass A 3.4)',
    formulaHint: '防御力倍率 × 锐暴伤害(暴伤×0.35转暴击，超100%暴击二次锐暴判定)',
    color: '#ff5d8f',
  },
};

export function BattleModeSelector() {
  const state = useAppState();
  const mainName = state.agents.main.presetName;
  const charMeta = mainName ? CHARACTER_DB.characters[mainName]?.meta : undefined;
  const effectiveType = resolveBattleTypeForAgent(mainName, state.battleType);
  const info = ARCHETYPE_META[effectiveType] ?? ARCHETYPE_META.attack;

  return (
    <div
      className="switch-container"
      style={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px 12px',
        marginTop: 12,
        background: 'rgba(0, 0, 0, 0.55)',
        padding: '6px 14px',
        borderRadius: 999,
        border: '1px solid rgba(255, 255, 255, 0.14)',
        fontSize: '0.82rem',
      }}
    >
      <span
        style={{
          color: '#b8c4d9',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        统一自适应模式
      </span>
      <span
        style={{
          padding: '2px 10px',
          borderRadius: 999,
          background: `${info.color}22`,
          border: `1px solid ${info.color}88`,
          color: info.color,
          fontWeight: 700,
        }}
      >
        {mainName ? `${mainName} (${charMeta?.type || info.tag})` : info.tag} · {info.name}
      </span>
      <span
        style={{
          color: 'rgba(255, 255, 255, 0.62)',
          fontSize: '0.76rem',
        }}
      >
        {info.formulaHint}
      </span>
    </div>
  );
}
