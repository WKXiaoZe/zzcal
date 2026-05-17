// src/components/BattleModeSelector.tsx
// Three-button toggle for battleType. Mirrors legacy `#type-attack/break/anomaly`.
import { useAppState, useAppDispatch } from '../state/AppContext';
import type { BattleType } from '../calc/types';

interface ModeOption {
  type: BattleType;
  label: string;
}

const MODES: ModeOption[] = [
  { type: 'attack', label: '强攻' },
  { type: 'break', label: '命破' },
  { type: 'anomaly', label: '异常' },
];

export function BattleModeSelector() {
  const { battleType } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <div
      className="switch-container"
      style={{
        display: 'inline-flex',
        marginTop: 15,
        background: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {MODES.map(({ type, label }) => (
        <button
          key={type}
          id={`type-${type}`}
          className={`zzz-btn${battleType === type ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'SET_BATTLE_TYPE', payload: type })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
