// src/components/HeroHeader.tsx
// Top hero banner: title + dual-mode navigation capsule (配装算盘 <-> 实战排轴·WASM搜轴) + BattleModeSelector.
import { BattleModeSelector } from './BattleModeSelector';
import simStyles from '../sim/sim.module.css';

export interface HeroHeaderProps {
  activeMode?: 'calc' | 'sim';
  onChangeMode?: (mode: 'calc' | 'sim') => void;
  onOpenOps?: () => void;
  specVersion?: string;
}

export function HeroHeader({
  activeMode = 'calc',
  onChangeMode,
  onOpenOps,
}: HeroHeaderProps) {
  const handleSwitch = (target: 'calc' | 'sim') => {
    if (onChangeMode) {
      onChangeMode(target);
      return;
    }
    window.location.hash = target === 'sim' ? '#/sim' : '#/';
  };

  const handleOpsClick = () => {
    if (onOpenOps) {
      onOpenOps();
      return;
    }
    window.location.hash = '#/ops';
  };

  return (
    <header>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1>ZZCALc</h1>
        {activeMode === 'calc' && <BattleModeSelector />}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '8px 12px',
            marginTop: activeMode === 'sim' ? 4 : 0,
          }}
        >
          <div className="version" style={activeMode === 'sim' ? { marginTop: 0 } : undefined}>
            2026v1121
          </div>
        </div>
      </div>

      <nav className={simStyles.modeNavRow} aria-label="主工作台模式切换">
        <div className={simStyles.modeCapsuleGroup}>
          <button
            type="button"
            id="nav-mode-calc"
            className={`${simStyles.modeCapsuleBtn} ${
              activeMode === 'calc' ? simStyles.modeCapsuleBtnActive : ''
            }`}
            onClick={() => handleSwitch('calc')}
          >
            <span>🧮 配装词条算盘</span>
          </button>
          <button
            type="button"
            id="nav-mode-sim"
            className={`${simStyles.modeCapsuleBtn} ${
              activeMode === 'sim' ? simStyles.modeCapsuleBtnActive : ''
            }`}
            onClick={() => handleSwitch('sim')}
          >
            <span>⚡ 实战排轴模拟</span>
          </button>
        </div>
        <button
          type="button"
          id="nav-open-ops"
          className={simStyles.opsMiniTrigger}
          onClick={handleOpsClick}
          title="数据更新与反馈管理 (#/ops)"
        >
          <span>🛠️ 运维</span>
        </button>
      </nav>
    </header>
  );
}
